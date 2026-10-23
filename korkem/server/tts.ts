/**
 * Серверный «живой» голос (нейросетевой синтез речи).
 * Ключи хранятся только в переменных окружения сервера.
 *
 * Провайдер выбирается переменной TTS_PROVIDER или по найденному ключу:
 *  - yandex      — Yandex SpeechKit (YANDEX_API_KEY, YANDEX_FOLDER_ID — если нужен, YANDEX_VOICE=alena)
 *  - elevenlabs  — ElevenLabs (ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID)
 *  - openai      — OpenAI TTS (OPENAI_API_KEY, OPENAI_TTS_VOICE=shimmer, OPENAI_TTS_MODEL=gpt-4o-mini-tts)
 */

export type TtsProvider = 'yandex' | 'elevenlabs' | 'openai';

export function ttsProvider(): TtsProvider | null {
  const forced = process.env.TTS_PROVIDER as TtsProvider | undefined;
  if (forced === 'yandex' && process.env.YANDEX_API_KEY) return 'yandex';
  if (forced === 'elevenlabs' && process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID) return 'elevenlabs';
  if (forced === 'openai' && process.env.OPENAI_API_KEY) return 'openai';
  if (forced) return null;
  if (process.env.YANDEX_API_KEY) return 'yandex';
  if (process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID) return 'elevenlabs';
  if (process.env.OPENAI_API_KEY) return 'openai';
  return null;
}

export const TTS_MAX_CHARS = 1200;

export function cleanTtsText(raw: unknown): string {
  return String(raw ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, TTS_MAX_CHARS);
}

/** Возвращает mp3 с озвученным текстом. */
export async function synthesize(text: string, opts: { rate?: number } = {}): Promise<{ audio: ArrayBuffer; mime: string }> {
  const provider = ttsProvider();
  if (!provider) throw new Error('Живой голос не настроен на сервере.');
  const speed = Math.min(1.3, Math.max(0.7, opts.rate ?? 0.95));
  let res: Response;

  if (provider === 'yandex') {
    const form = new URLSearchParams({
      text,
      lang: 'ru-RU',
      voice: process.env.YANDEX_VOICE || 'alena',
      emotion: process.env.YANDEX_EMOTION || 'good',
      speed: speed.toFixed(2),
      format: 'mp3',
    });
    if (process.env.YANDEX_FOLDER_ID) form.set('folderId', process.env.YANDEX_FOLDER_ID);
    res = await fetch('https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize', {
      method: 'POST',
      headers: { Authorization: `Api-Key ${process.env.YANDEX_API_KEY}` },
      body: form,
    });
  } else if (provider === 'elevenlabs') {
    res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(process.env.ELEVENLABS_VOICE_ID!)}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY!, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({
        text,
        model_id: process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2',
        voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.3 },
      }),
    });
  } else {
    res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts',
        voice: process.env.OPENAI_TTS_VOICE || 'shimmer',
        input: text,
        instructions: 'Говори по-русски тепло, мягко и неторопливо, как мама, которая читает сказку маленькому ребёнку перед сном.',
        response_format: 'mp3',
        speed,
      }),
    });
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error(`TTS ${provider} ${res.status}: ${detail.slice(0, 300)}`);
    if (res.status === 401 || res.status === 403) throw new Error('Неверный ключ сервиса озвучивания на сервере.');
    if (res.status === 429) throw new Error('Сервис озвучивания перегружен. Попробуйте через минуту.');
    throw new Error('Сервис озвучивания временно недоступен.');
  }
  return { audio: await res.arrayBuffer(), mime: 'audio/mpeg' };
}
