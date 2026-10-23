/**
 * SpeechProvider — интерфейс озвучивания. Сейчас реализован браузерный синтез речи
 * (Web Speech API). Чтобы подключить серверный синтез, достаточно реализовать этот
 * интерфейс (например, загружать аудио с /api/tts) и вернуть его из createSpeechProvider().
 */
export interface SpeechVoice {
  id: string;
  name: string;
  lang: string;
  local: boolean;
}

export interface SpeakOptions {
  rate: number;
  volume: number;
  voiceId: string | null;
  lang?: string;
}

export interface SpeakHandlers {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (message: string) => void;
}

export interface SpeechProvider {
  readonly id: string;
  readonly supportsVolume: boolean;
  isSupported(): boolean;
  getVoices(): SpeechVoice[];
  onVoicesChanged(cb: () => void): () => void;
  speak(text: string, options: SpeakOptions, handlers: SpeakHandlers): void;
  pause(): void;
  resume(): void;
  stop(): void;
  isSpeaking(): boolean;
}

const isIOS = () => typeof navigator !== 'undefined' && (/iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

/** Разбиваем на предложения: длинные фразы в Chrome обрываются, а в Safari плохо ставятся на паузу. */
export function splitSentences(text: string): string[] {
  const parts = text.match(/[^.!?…]+[.!?…]*\s*/g) ?? [text];
  const out: string[] = [];
  for (const p of parts) {
    const t = p.trim();
    if (!t) continue;
    if (out.length && (out[out.length - 1].length < 25)) out[out.length - 1] += ' ' + t;
    else out.push(t);
  }
  return out;
}

class WebSpeechProvider implements SpeechProvider {
  readonly id = 'web-speech';
  // iOS игнорирует громкость синтеза речи
  readonly supportsVolume = !isIOS();
  private queue: string[] = [];
  private index = 0;
  private options: SpeakOptions | null = null;
  private handlers: SpeakHandlers = {};
  private active: SpeechSynthesisUtterance | null = null;
  private paused = false;
  private token = 0;

  isSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  }

  getVoices(): SpeechVoice[] {
    if (!this.isSupported()) return [];
    return window.speechSynthesis
      .getVoices()
      .map((v) => ({ id: v.voiceURI, name: v.name, lang: v.lang, local: v.localService }))
      .sort((a, b) => rank(b) - rank(a) || a.name.localeCompare(b.name));
  }

  onVoicesChanged(cb: () => void) {
    if (!this.isSupported()) return () => {};
    const synth = window.speechSynthesis;
    synth.addEventListener?.('voiceschanged', cb);
    // Safari иногда не присылает событие — опрашиваем несколько раз
    const timers = [250, 800, 2000].map((ms) => window.setTimeout(cb, ms));
    return () => {
      synth.removeEventListener?.('voiceschanged', cb);
      timers.forEach(clearTimeout);
    };
  }

  speak(text: string, options: SpeakOptions, handlers: SpeakHandlers) {
    if (!this.isSupported()) {
      handlers.onError?.('Озвучивание не поддерживается этим браузером');
      return;
    }
    this.stop();
    this.queue = splitSentences(text);
    this.index = 0;
    this.options = options;
    this.handlers = handlers;
    this.paused = false;
    this.token++;
    handlers.onStart?.();
    this.next(this.token);
  }

  private next(token: number) {
    if (token !== this.token) return;
    if (this.index >= this.queue.length) {
      this.active = null;
      this.handlers.onEnd?.();
      return;
    }
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(this.queue[this.index]);
    const o = this.options!;
    const voice = synth.getVoices().find((v) => v.voiceURI === o.voiceId) ?? pickDefaultVoice(synth.getVoices(), o.lang ?? 'ru');
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? 'ru-RU';
    u.rate = o.rate;
    u.volume = o.volume;
    u.pitch = 1.05;
    u.onend = () => {
      if (token !== this.token) return;
      this.index++;
      this.next(token);
    };
    u.onerror = (e) => {
      if (token !== this.token) return;
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      this.handlers.onError?.(e.error === 'not-allowed' ? 'Браузер запретил озвучивание. Нажмите «Слушать» ещё раз.' : 'Не удалось озвучить текст');
    };
    this.active = u; // держим ссылку: иначе Safari может «потерять» событие onend
    synth.speak(u);
  }

  pause() {
    if (!this.isSupported() || !this.active) return;
    this.paused = true;
    window.speechSynthesis.pause();
  }

  resume() {
    if (!this.isSupported() || !this.active) return;
    const synth = window.speechSynthesis;
    this.paused = false;
    synth.resume();
    // В некоторых версиях Safari resume() не срабатывает — перезапускаем текущее предложение
    window.setTimeout(() => {
      if (!this.paused && this.active && !synth.speaking) {
        const token = ++this.token;
        synth.cancel();
        this.next(token);
      }
    }, 350);
  }

  stop() {
    this.token++;
    this.active = null;
    this.paused = false;
    if (this.isSupported()) window.speechSynthesis.cancel();
  }

  isSpeaking() {
    return !!this.active;
  }
}

function rank(v: SpeechVoice) {
  let r = 0;
  if (v.lang.toLowerCase().startsWith('ru')) r += 10;
  if (v.lang.toLowerCase().startsWith('kk')) r += 5;
  if (/milena|katya|alena|irina|premium|enhanced|natural|google/i.test(v.name)) r += 2;
  return r;
}

function pickDefaultVoice(voices: SpeechSynthesisVoice[], lang: string) {
  const ru = voices.filter((v) => v.lang.toLowerCase().startsWith(lang));
  return ru.find((v) => /milena|katya|alena|enhanced|premium/i.test(v.name)) ?? ru[0] ?? null;
}

let provider: SpeechProvider | null = null;
export function createSpeechProvider(): SpeechProvider {
  if (!provider) provider = new WebSpeechProvider();
  return provider;
}
