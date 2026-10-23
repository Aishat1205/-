// Основные сущности приложения «Волшебный мир Коркем».

export type Gender = 'female' | 'male';
export type LanguageCode = 'ru' | 'kk';

export type HairStyle = 'buns' | 'long' | 'ponytail' | 'bob' | 'braids' | 'curly';
export type Accessory = 'none' | 'bow' | 'headband' | 'flower' | 'clip';
export type OutfitStyle = 'dress' | 'overalls' | 'sweater';

export interface Appearance {
  skinTone: string;
  hairColor: string;
  hairStyle: HairStyle;
  eyeColor: string;
  outfitColor: string;
  outfitStyle: OutfitStyle;
  accessory: Accessory;
  accessoryColor: string;
  cheeks: boolean;
  freckles: boolean;
}

/** Падежные формы имени. Заполняются автоматически, но их можно исправить вручную. */
export interface NameForms {
  nom: string;
  gen: string;
  dat: string;
  acc: string;
  ins: string;
  pre: string;
}

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  nameForms: NameForms;
  /** true — формы заданы вручную и не пересчитываются при смене имени */
  customForms: boolean;
  appearance: Appearance;
  preferences: {
    favoriteColors: string[];
    favoriteAnimal: string;
    notes: string;
  };
  /** id записи фотографии в IndexedDB. Хранится только на устройстве. */
  photoId?: string;
}

export type FontSize = 'm' | 'l' | 'xl';
export type ReadingMode = 'self' | 'child';
export type VoiceSource = 'tts' | 'cloud' | 'parent' | 'none';

export interface AppSettings {
  language: LanguageCode;
  musicEnabled: boolean;
  musicVolume: number;
  musicTrack: string;
  animationsEnabled: boolean;
  /** painted — художественные картинки там, где они есть; vector — рисованная графика приложения */
  artStyle: 'painted' | 'vector';
  soundEnabled: boolean;
  fontSize: FontSize;
  readingMode: ReadingMode;
  voiceSource: VoiceSource;
  autoAdvance: boolean;
  speechRate: number;
  speechVolume: number;
  voiceURI: string | null;
  bedtimeMode: boolean;
  aiEnabled: boolean;
}

// ——— Иллюстрации ———

export type SettingId =
  | 'bedroom'
  | 'forest'
  | 'meadow'
  | 'sky'
  | 'space'
  | 'moon'
  | 'castle'
  | 'home'
  | 'garden'
  | 'party'
  | 'dreamland'
  | 'underwater'
  | 'kindergarten'
  | 'lake';

export type TimeOfDay = 'day' | 'sunset' | 'night' | 'dawn';

export type Pose = 'stand' | 'wave' | 'walk' | 'sit' | 'sleep' | 'reach' | 'hug' | 'jump' | 'think';

export type PropKind =
  | 'star'
  | 'bunny'
  | 'unicorn'
  | 'owl'
  | 'fox'
  | 'bear'
  | 'hedgehog'
  | 'squirrel'
  | 'butterfly'
  | 'bird'
  | 'fish'
  | 'turtle'
  | 'dolphin'
  | 'cat'
  | 'puppy'
  | 'teddy'
  | 'doll'
  | 'mama'
  | 'papa'
  | 'grandma'
  | 'grandpa'
  | 'sibling'
  | 'rocket'
  | 'planet'
  | 'comet'
  | 'cake'
  | 'balloons'
  | 'gift'
  | 'lantern'
  | 'flowers'
  | 'mushroom'
  | 'carrot'
  | 'basket'
  | 'bed'
  | 'book'
  | 'rainbow'
  | 'bridge'
  | 'crown'
  | 'key'
  | 'shell'
  | 'cloud'
  | 'moonface'
  | 'tree'
  | 'treehouse'
  | 'apple'
  | 'cup'
  | 'blocks'
  | 'heart'
  | 'snail'
  | 'frog'
  | 'pillow';

export interface PropPlacement {
  kind: PropKind;
  /** 0..100 — положение по горизонтали в процентах ширины сцены */
  x: number;
  /** 0..100 — положение «земли» предмета по вертикали */
  y: number;
  scale?: number;
  flip?: boolean;
  /** лёгкое парение */
  float?: boolean;
  glow?: boolean;
  /** вариант оформления: например, planet → earth/mars/saturn */
  variant?: string;
}

export interface HeroinePlacement {
  pose: Pose;
  x: number;
  y?: number;
  scale?: number;
  flip?: boolean;
  outfit?: 'default' | 'pajamas' | 'party' | 'space' | 'princess';
}

export interface IllustrationSpec {
  setting: SettingId;
  time?: TimeOfDay;
  heroine?: HeroinePlacement | null;
  props?: PropPlacement[];
  /** Эффекты атмосферы */
  fx?: Array<'fireflies' | 'sparkles' | 'snow' | 'bubbles' | 'petals' | 'confetti' | 'rain' | 'zzz'>;
  /** Внешнее изображение (если подключён генератор иллюстраций) */
  imageUrl?: string;
}

export interface AnimationConfig {
  entrance?: 'fade' | 'rise' | 'zoom';
}

export interface StoryScene {
  id: string;
  /** Текст с маркерами персонализации: {Name}, {Name:dat}, {=она|он} … */
  text: string;
  illustration: IllustrationSpec;
  audio?: string;
  animationConfig?: AnimationConfig;
}

export type CategoryId =
  | 'magic'
  | 'bedtime'
  | 'animals'
  | 'family'
  | 'learning'
  | 'kindness'
  | 'space'
  | 'princess'
  | 'forest'
  | 'everyday';

export type StorySource = 'library' | 'template' | 'ai';

export interface FairyTale {
  id: string;
  title: string;
  description: string;
  category: CategoryId;
  tags: CategoryId[];
  cover: IllustrationSpec;
  /** примерная продолжительность чтения, мин. */
  duration: number;
  ageMin: number;
  ageMax: number;
  language: LanguageCode;
  moral?: string;
  bedtime?: boolean;
  source: StorySource;
  createdAt?: number;
  /** снимок имени, для которого создана сказка (только для подписи) */
  palette?: [string, string];
  /** Если сказка создана для другого имени — своё имя и род героя */
  hero?: { gender: Gender; forms: NameForms };
  scenes: StoryScene[];
}

export interface ReadingProgress {
  storyId: string;
  currentScene: number;
  updatedAt: number;
  completed: boolean;
}

export interface FavoriteStory {
  storyId: string;
  createdAt: number;
}

export interface HistoryEntry {
  storyId: string;
  title: string;
  openedAt: number;
  completed: boolean;
}

// ——— Генератор ———

export type ThemeId =
  | 'forest'
  | 'space'
  | 'animals'
  | 'dreams'
  | 'parents'
  | 'kindergarten'
  | 'princess'
  | 'underwater'
  | 'birthday'
  | 'unicorn';

export type MoodId = 'fun' | 'cozy' | 'adventure' | 'calm' | 'learning';
export type DurationId = 'short' | 'medium' | 'long';
export type MoralId = 'kindness' | 'bravery' | 'friendship' | 'independence' | 'sharing' | 'dark' | 'sleep' | 'family';
export type CompanionId = 'mama' | 'papa' | 'grandma' | 'grandpa' | 'brother' | 'sister' | 'teddy' | 'doll' | 'kitten' | 'puppy';

export interface StoryRequest {
  name: string;
  age: number;
  gender: Gender;
  theme: ThemeId;
  mood: MoodId;
  duration: DurationId;
  wishes: string;
  companions: CompanionId[];
  moral: MoralId;
}
