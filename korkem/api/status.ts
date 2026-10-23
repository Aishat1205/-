// Vercel Serverless Function: GET /api/status
import type { IncomingMessage, ServerResponse } from 'node:http';
import { isConfigured, MODEL } from '../server/storyAi.js';

export default function handler(_req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({ story: isConfigured(), illustration: false, model: isConfigured() ? MODEL : null }));
}
