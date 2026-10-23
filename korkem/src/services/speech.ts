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
  private cancelledAt = 0;

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
    const synth = window.speechSynthesis;
    // Chrome и Safari иногда «теряют» фразу, сказанную сразу после cancel()
    const busy = synth.speaking || synth.pending || Date.now() - this.cancelledAt < 200;
    this.stop();
    if (synth.paused) synth.resume();
    this.queue = splitSentences(text);
    this.index = 0;
    this.options = options;
    this.handlers = handlers;
    this.paused = false;
    const token = ++this.token;
    handlers.onStart?.();
    // Без паузы, если ничего не звучало: на iPhone первая фраза должна начаться прямо в нажатии
    if (busy) window.setTimeout(() => this.next(token), 150);
    else this.next(token);
    this.watchStart(token);
  }

  /** Если речь так и не началась (нет голоса, браузер заблокировал) — сообщаем об этом. */
  private watchStart(token: number) {
    window.setTimeout(() => {
      if (token !== this.token || this.paused || !this.active) return;
      const synth = window.speechSynthesis;
      if (!synth.speaking && !synth.pending) {
        this.active = null;
        this.handlers.onError?.(
          synth.getVoices().length
            ? 'Браузер не начал озвучивание. Нажмите ▶ ещё раз.'
            : 'В браузере нет голосов для озвучивания. Проверьте голоса в настройках системы или откройте сайт в Safari или Chrome.',
        );
      }
    }, 2500);
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
    if (this.active && this.isSupported() && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) this.cancelledAt = Date.now();
    this.active = null;
    this.paused = false;
    if (this.isSupported()) window.speechSynthesis.cancel();
  }

  isSpeaking() {
    return !!this.active;
  }
}

/** Чем выше оценка, тем естественнее звучит голос. Голоса «улучшенные» и сетевые звучат заметно живее. */
function voiceScore(name: string, lang: string) {
  let r = 0;
  const l = lang.toLowerCase();
  if (l.startsWith('ru')) r += 20;
  else if (l.startsWith('kk')) r += 10;
  if (/premium|премиум/i.test(name)) r += 8;
  if (/enhanced|улучш/i.test(name)) r += 6;
  if (/natural|online/i.test(name)) r += 6; // Microsoft Edge: «Svetlana Online (Natural)»
  if (/google/i.test(name)) r += 5; // Chrome: сетевой голос Google
  if (/milena|милена|katya|катя|alena|svetlana|dariya|irina/i.test(name)) r += 2;
  if (/compact|eloquence|grandma|grandpa|rocko|shelley|eddy|flo|reed|sandy/i.test(name)) r -= 6;
  return r;
}

function rank(v: SpeechVoice) {
  return voiceScore(v.name, v.lang);
}

function pickDefaultVoice(voices: SpeechSynthesisVoice[], lang: string) {
  const list = voices.filter((v) => v.lang.toLowerCase().startsWith(lang));
  return list.sort((a, b) => voiceScore(b.name, b.lang) - voiceScore(a.name, a.lang))[0] ?? null;
}

let provider: SpeechProvider | null = null;
export function createSpeechProvider(): SpeechProvider {
  if (!provider) provider = new WebSpeechProvider();
  return provider;
}
