import type { IllustrationSpec } from '../types';

/**
 * IllustrationGenerator — точка подключения внешней генерации изображений.
 * По умолчанию используется локальный SVG-иллюстратор (src/illustrations):
 * он рисует сцену по описанию IllustrationSpec — обстановка, время суток,
 * поза героини, персонажи и эффекты. Внешний сервис может вернуть imageUrl,
 * и тогда читалка покажет картинку поверх той же композиции.
 *
 * Важно: фотографии ребёнка по умолчанию никуда не отправляются.
 */
export interface IllustrationGenerator {
  readonly id: string;
  isAvailable(): Promise<boolean>;
  illustrate(spec: IllustrationSpec, sceneText: string): Promise<IllustrationSpec>;
}

export const localSvgIllustrator: IllustrationGenerator = {
  id: 'local-svg',
  async isAvailable() {
    return true;
  },
  async illustrate(spec) {
    return spec;
  },
};
