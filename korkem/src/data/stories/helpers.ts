import type { HeroinePlacement, IllustrationSpec, Pose, PropKind, PropPlacement, StoryScene } from '../../types';

export const h = (pose: Pose, x: number, o: Partial<HeroinePlacement> = {}): HeroinePlacement => ({ pose, x, ...o });

export const p = (kind: PropKind, x: number, y: number, o: Partial<PropPlacement> = {}): PropPlacement => ({ kind, x, y, ...o });

export function scenes(storyId: string, list: Array<[string, IllustrationSpec]>): StoryScene[] {
  return list.map(([text, illustration], i) => ({ id: `${storyId}-${i + 1}`, text, illustration }));
}
