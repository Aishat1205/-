// Vercel Serverless Function: POST /api/generate-story
import type { IncomingMessage, ServerResponse } from 'node:http';
import { generateStory, isConfigured, validateRequest } from '../server/storyAi.js';

export const config = { maxDuration: 120 };

export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  const send = (status: number, body: unknown) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(body));
  };
  if (req.method !== 'POST') return send(405, { error: 'Method not allowed' });
  if (!isConfigured()) return send(503, { error: 'AI не настроен: задайте ANTHROPIC_API_KEY в переменных окружения.' });
  try {
    let body = req.body;
    if (body === undefined) {
      let raw = '';
      for await (const chunk of req) raw += chunk;
      body = JSON.parse(raw || '{}');
    }
    send(200, await generateStory(validateRequest(body)));
  } catch (e) {
    send(500, { error: e instanceof Error ? e.message : 'Ошибка генерации' });
  }
}
