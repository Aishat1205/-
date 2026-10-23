import type { FairyTale } from '../../types';
import { starStory } from './star';
import { bunnyStory } from './bunny';
import { dreamsStory } from './dreams';
import { kindForestStory } from './kindForest';
import { unicornStory } from './unicorn';
import { moonStory } from './moon';
import { helpingStory } from './helping';
import { birthdayStory } from './birthday';

/** Встроенная библиотека. Чтобы добавить сказку — создайте файл и добавьте её в этот список. */
export const LIBRARY: FairyTale[] = [
  starStory,
  bunnyStory,
  dreamsStory,
  kindForestStory,
  unicornStory,
  moonStory,
  helpingStory,
  birthdayStory,
];
