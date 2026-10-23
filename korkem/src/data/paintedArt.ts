import type { FairyTale } from '../types';

/**
 * Художественные иллюстрации, нарисованные нейросетью (бесплатный сервис Pollinations).
 * Файлы лежат в public/art/<id сказки>/<номер сцены>.webp.
 * Для сцен без картинки (и для сказок без картинок) используется рисованная графика приложения.
 */
const PAINTED: Record<string, { scenes: number[]; cover: number }> = {
  // Сцена 5 исключена: нейросеть нарисовала её неудачно
  'little-bunny': { scenes: [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14], cover: 4 },
};

export function withPaintedArt(story: FairyTale): FairyTale {
  const art = PAINTED[story.id];
  if (!art) return story;
  const url = (n: number) => `/art/${story.id}/${n}.webp`;
  return {
    ...story,
    cover: { ...story.cover, imageUrl: url(art.cover) },
    scenes: story.scenes.map((s, i) => (art.scenes.includes(i + 1) ? { ...s, illustration: { ...s.illustration, imageUrl: url(i + 1) } } : s)),
  };
}

export const hasPaintedArt = (id: string) => id in PAINTED;
