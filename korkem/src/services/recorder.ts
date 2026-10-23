import { idbDelete, idbGet, idbKeys, idbSet, isQuotaError } from '../lib/idb';

export interface RecordingEntry {
  data: ArrayBuffer;
  mimeType: string;
  createdAt: number;
  durationMs: number;
}

export type RecorderSupport = { ok: true } | { ok: false; reason: string };

export function recorderSupport(): RecorderSupport {
  if (typeof window === 'undefined') return { ok: false, reason: 'Запись недоступна' };
  if (!window.isSecureContext) {
    return { ok: false, reason: 'Для доступа к микрофону страница должна быть открыта по HTTPS (или на localhost). На iPhone откройте приложение по защищённому адресу.' };
  }
  if (!navigator.mediaDevices?.getUserMedia) return { ok: false, reason: 'Этот браузер не даёт доступ к микрофону.' };
  if (typeof MediaRecorder === 'undefined') return { ok: false, reason: 'Этот браузер не поддерживает запись звука (MediaRecorder). Обновите iOS до версии 14.5 или новее.' };
  return { ok: true };
}

function pickMime(): string {
  const candidates = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];
  for (const m of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(m)) return m;
    } catch {
      /* ignore */
    }
  }
  return '';
}

export class VoiceRecorder {
  private rec: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private startedAt = 0;

  async start(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch (e) {
      const name = e instanceof DOMException ? e.name : '';
      if (name === 'NotAllowedError') throw new Error('Доступ к микрофону запрещён. Разрешите его в настройках браузера.');
      if (name === 'NotFoundError') throw new Error('Микрофон не найден.');
      throw new Error('Не удалось включить микрофон.');
    }
    const mime = pickMime();
    this.rec = mime ? new MediaRecorder(this.stream, { mimeType: mime }) : new MediaRecorder(this.stream);
    this.chunks = [];
    this.rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) this.chunks.push(e.data);
    };
    this.startedAt = Date.now();
    this.rec.start(250);
  }

  stop(): Promise<{ blob: Blob; durationMs: number }> {
    return new Promise((resolve, reject) => {
      const rec = this.rec;
      if (!rec) return reject(new Error('Запись не начата'));
      rec.onstop = () => {
        const type = rec.mimeType || this.chunks[0]?.type || 'audio/mp4';
        const blob = new Blob(this.chunks, { type });
        this.cleanup();
        resolve({ blob, durationMs: Date.now() - this.startedAt });
      };
      try {
        rec.stop();
      } catch (e) {
        this.cleanup();
        reject(e);
      }
    });
  }

  cancel() {
    try {
      this.rec?.stop();
    } catch {
      /* ignore */
    }
    this.cleanup();
  }

  private cleanup() {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.rec = null;
  }
}

export const recordingKey = (storyId: string, sceneId: string) => `${storyId}::${sceneId}`;

export async function saveRecording(storyId: string, sceneId: string, blob: Blob, durationMs: number) {
  const entry: RecordingEntry = { data: await blob.arrayBuffer(), mimeType: blob.type || 'audio/mp4', createdAt: Date.now(), durationMs };
  try {
    await idbSet('audio', recordingKey(storyId, sceneId), entry);
  } catch (e) {
    if (isQuotaError(e) || (e instanceof Error && /quota|переполн/i.test(e.message))) {
      throw new Error('Не хватает места на устройстве для сохранения записи. Удалите старые записи.');
    }
    throw new Error('Не удалось сохранить запись.');
  }
}

export async function loadRecording(storyId: string, sceneId: string): Promise<Blob | null> {
  try {
    const e = await idbGet<RecordingEntry>('audio', recordingKey(storyId, sceneId));
    return e ? new Blob([e.data], { type: e.mimeType }) : null;
  } catch {
    return null;
  }
}

export const deleteRecording = (storyId: string, sceneId: string) => idbDelete('audio', recordingKey(storyId, sceneId));

export async function listRecordings(): Promise<string[]> {
  try {
    return (await idbKeys('audio')).map(String);
  } catch {
    return [];
  }
}
