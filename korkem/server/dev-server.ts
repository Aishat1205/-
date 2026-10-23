/**
 * Локальный API-сервер для разработки: `npm run dev:api`.
 * Vite проксирует /api/* сюда (см. vite.config.ts).
 */
import { createServer } from 'node:http';
import { generateStory, isConfigured, validateRequest, MODEL } from './storyAi.ts';
import { cleanTtsText, synthesize, ttsProvider } from './tts.ts';

const PORT = Number(process.env.API_PORT || 8787);

createServer(async (req, res) => {
  const send = (status: number, body: unknown) => {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(body));
  };
  try {
    if (req.url === '/api/status' && req.method === 'GET') {
      return send(200, { story: isConfigured(), illustration: false, model: isConfigured() ? MODEL : null, tts: ttsProvider() });
    }
    if (req.url === '/api/generate-story' && req.method === 'POST') {
      if (!isConfigured()) return send(503, { error: 'AI не настроен: задайте ANTHROPIC_API_KEY на сервере.' });
      let raw = '';
      for await (const chunk of req) {
        raw += chunk;
        if (raw.length > 10_000) return send(413, { error: 'Слишком большой запрос' });
      }
      const story = await generateStory(validateRequest(JSON.parse(raw || '{}')));
      return send(200, story);
    }
    if (req.url === '/api/tts' && req.method === 'POST') {
      if (!ttsProvider()) return send(503, { error: 'Живой голос не настроен на сервере.' });
      let raw = '';
      for await (const chunk of req) {
        raw += chunk;
        if (raw.length > 10_000) return send(413, { error: 'Слишком большой запрос' });
      }
      const body = JSON.parse(raw || '{}') as { text?: string; rate?: number };
      const text = cleanTtsText(body.text);
      if (!text) return send(400, { error: 'Пустой текст' });
      const { audio, mime } = await synthesize(text, { rate: Number(body.rate) || undefined });
      res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-store' });
      return res.end(Buffer.from(audio));
    }
    if (req.url === '/api/illustrate') {
      return send(501, { error: 'Генератор иллюстраций не подключён. Используются встроенные иллюстрации.' });
    }
    send(404, { error: 'Not found' });
  } catch (e) {
    console.error(e);
    send(500, { error: e instanceof Error ? e.message : 'Ошибка сервера' });
  }
}).listen(PORT, () => console.log(`API: http://localhost:${PORT} (AI ${isConfigured() ? 'включён' : 'не настроен'}, голос: ${ttsProvider() ?? 'не настроен'})`));
