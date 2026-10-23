// Vercel Serverless Function: POST /api/tts — возвращает mp3 с озвученным текстом
import type { IncomingMessage, ServerResponse } from 'node:http';
import { cleanTtsText, synthesize, ttsProvider } from '../server/tts.js';

export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  const fail = (status: number, error: string) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error }));
  };
  if (req.method !== 'POST') return fail(405, 'Method not allowed');
  if (!ttsProvider()) return fail(503, 'Живой голос не настроен на сервере.');
  try {
    let body = req.body as { text?: string; rate?: number } | undefined;
    if (body === undefined) {
      let raw = '';
      for await (const chunk of req) raw += chunk;
      body = JSON.parse(raw || '{}');
    }
    const text = cleanTtsText(body?.text);
    if (!text) return fail(400, 'Пустой текст');
    const { audio, mime } = await synthesize(text, { rate: Number(body?.rate) || undefined });
    res.statusCode = 200;
    res.setHeader('Content-Type', mime);
    res.setHeader('Cache-Control', 'no-store');
    res.end(Buffer.from(audio));
  } catch (e) {
    fail(500, e instanceof Error ? e.message : 'Ошибка озвучивания');
  }
}
