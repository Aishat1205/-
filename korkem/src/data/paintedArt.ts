import type { FairyTale } from '../types';

/**
 * Художественные иллюстрации, нарисованные нейросетью (сервис Pollinations, модель Flux).
 * Файлы лежат в public/art/<id сказки>/<номер сцены>.webp.
 * Если для сказки картинок нет — используется рисованная графика приложения.
 */
const PAINTED: Record<string, { scenes: number; cover: number }> = {
  // 'little-bunny': { scenes: 14, cover: 4 }, — добавляется, когда картинки готовы
};

export function withPaintedArt(story: FairyTale): FairyTale {
  const art = PAINTED[story.id];
  if (!art) return story;
  const url = (n: number) => `/art/${story.id}/${n}.webp`;
  return {
    ...story,
    cover: { ...story.cover, imageUrl: url(art.cover) },
    scenes: story.scenes.map((s, i) => (i < art.scenes ? { ...s, illustration: { ...s.illustration, imageUrl: url(i + 1) } } : s)),
  };
}

export const hasPaintedArt = (id: string) => id in PAINTED;
