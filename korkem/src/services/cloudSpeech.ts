import { idbGet, idbSet } from '../lib/idb';
import type { SpeakHandlers, SpeakOptions, SpeechProvider, SpeechVoice } from './speech';

/**
 * «Живой голос»: нейросетевой синтез на сервере (/api/tts).
 * Готовое аудио кэшируется в IndexedDB, поэтому повторное чтение сцены
 * работает быстро и без интернета.
 */

function hash(s: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0;
  for (let i = 0; i < s.length; i++) {
    h1 = Math.imul(h1 ^ s.charCodeAt(i), 16777619);
    h2 = (h2 * 31 + s.charCodeAt(i)) | 0;
  }
  return (h1 >>> 0).toString(36) + (h2 >>> 0).toString(36);
}

/** Короткая тишина: проигрывается прямо в нажатии, чтобы iPhone разрешил звук после загрузки. */
function silentWavUrl(): string {
  const samples = 800;
  const buf = new ArrayBuffer(44 + samples * 2);
  const v = new DataView(buf);
  const w = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); v.setUint32(4, 36 + samples * 2, true); w(8, 'WAVE'); w(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, 8000, true); v.setUint32(28, 16000, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  w(36, 'data'); v.setUint32(40, samples * 2, true);
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
}

interface CachedTts {
  data: ArrayBuffer;
  mime: string;
}

const inflight = new Map<string, Promise<Blob>>();

async function fetchAudio(text: string, rate: number): Promise<Blob> {
  const key = `tts::${hash(`${rate.toFixed(2)}|${text}`)}`;
  try {
    const cached = await idbGet<CachedTts>('audio', key);
    if (cached) return new Blob([cached.data], { type: cached.mime });
  } catch {
    /* кэш недоступен — просто загружаем */
  }
  if (!inflight.has(key)) {
    inflight.set(
      key,
      (async () => {
        let res: Response;
        try {
          res = await fetch('/api/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, rate }) });
        } catch {
          throw new Error('Нет связи с сервером. Живой голос работает только с интернетом.');
        }
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(j.error ?? 'Не удалось получить живой голос.');
        }
        const blob = await res.blob();
        idbSet('audio', key, { data: await blob.arrayBuffer(), mime: blob.type || 'audio/mpeg' } satisfies CachedTts).catch(() => {});
        return blob;
      })().finally(() => inflight.delete(key)),
    );
  }
  return inflight.get(key)!;
}

class CloudSpeechProvider implements SpeechProvider {
  readonly id = 'cloud';
  readonly supportsVolume = true;
  private el: HTMLAudioElement | null = null;
  private url: string | null = null;
  private silent: string | null = null;
  private token = 0;
  private playing = false;

  isSupported() {
    return typeof Audio !== 'undefined' && typeof fetch !== 'undefined';
  }
  getVoices(): SpeechVoice[] {
    return [];
  }
  onVoicesChanged() {
    return () => {};
  }

  /** Заранее загружает озвучку следующей сцены. */
  prefetch(text: string, rate: number) {
    fetchAudio(text, rate).catch(() => {});
  }

  speak(text: string, options: SpeakOptions, handlers: SpeakHandlers) {
    this.stop();
    const token = ++this.token;
    const el = (this.el ??= new Audio());
    // Разблокируем звук прямо в нажатии
    this.silent ??= silentWavUrl();
    el.src = this.silent;
    el.play().catch(() => {});
    this.playing = true;
    handlers.onStart?.();
    fetchAudio(text, options.rate)
      .then((blob) => {
        if (token !== this.token) return;
        if (this.url) URL.revokeObjectURL(this.url);
        this.url = URL.createObjectURL(blob);
        el.src = this.url;
        el.volume = options.volume;
        el.onended = () => {
          if (token !== this.token) return;
          this.playing = false;
          handlers.onEnd?.();
        };
        return el.play();
      })
      .catch((e: unknown) => {
        if (token !== this.token) return;
        this.playing = false;
        handlers.onError?.(e instanceof Error && e.name !== 'NotAllowedError' ? e.message : 'Нажмите ▶, чтобы включить звук.');
      });
  }

  pause() {
    this.el?.pause();
  }
  resume() {
    this.el?.play().catch(() => {});
  }
  stop() {
    this.token++;
    this.playing = false;
    if (this.el) {
      this.el.onended = null;
      this.el.pause();
    }
  }
  isSpeaking() {
    return this.playing;
  }
}

let cloud: CloudSpeechProvider | null = null;
export function getCloudSpeech(): CloudSpeechProvider {
  return (cloud ??= new CloudSpeechProvider());
}
