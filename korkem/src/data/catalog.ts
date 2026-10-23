import type { CategoryId, CompanionId, DurationId, IllustrationSpec, MoodId, MoralId, ThemeId } from '../types';

export interface CategoryInfo {
  id: CategoryId;
  title: string;
  subtitle: string;
  gradient: [string, string];
  art: IllustrationSpec;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'magic', title: 'Волшебные приключения', subtitle: 'Звёзды, чудеса и тайны', gradient: ['#7C6BC4', '#F3B9D3'], art: { setting: 'garden', time: 'night', props: [{ kind: 'star', x: 50, y: 70, glow: true, float: true }], fx: ['sparkles'] } },
  { id: 'bedtime', title: 'Сказки перед сном', subtitle: 'Тихие и уютные истории', gradient: ['#2B2552', '#6E6BB5'], art: { setting: 'dreamland', time: 'night', props: [{ kind: 'moonface', x: 50, y: 50, glow: true }], fx: ['zzz'] } },
  { id: 'animals', title: 'О животных', subtitle: 'Зайчата, совы и ёжики', gradient: ['#6FAE7A', '#F6E3AE'], art: { setting: 'meadow', time: 'day', props: [{ kind: 'bunny', x: 50, y: 86, scale: 1.3 }] } },
  { id: 'family', title: 'Про семью и любовь', subtitle: 'Мама, папа и тепло дома', gradient: ['#E68A8F', '#FCE3CF'], art: { setting: 'home', time: 'sunset', props: [{ kind: 'heart', x: 50, y: 60, float: true, scale: 1.4 }] } },
  { id: 'learning', title: 'Обучающие истории', subtitle: 'Цвета, счёт и планеты', gradient: ['#5C9BD6', '#CFE7F7'], art: { setting: 'home', time: 'day', props: [{ kind: 'blocks', x: 50, y: 86, scale: 1.4 }] } },
  { id: 'kindness', title: 'Сказки о доброте', subtitle: 'Помогать — это здорово', gradient: ['#E6A05C', '#FFF0CF'], art: { setting: 'forest', time: 'sunset', props: [{ kind: 'heart', x: 50, y: 60, float: true, scale: 1.3 }], fx: ['fireflies'] } },
  { id: 'space', title: 'Космос и планеты', subtitle: 'Ракеты, Луна и звёзды', gradient: ['#1D2350', '#5068B8'], art: { setting: 'space', time: 'night', props: [{ kind: 'rocket', x: 50, y: 70, float: true }] } },
  { id: 'princess', title: 'Принцессы и замки', subtitle: 'Короны, единороги, балы', gradient: ['#B48BD9', '#FBE0EC'], art: { setting: 'castle', time: 'sunset', props: [{ kind: 'crown', x: 50, y: 64, float: true, scale: 1.3 }] } },
  { id: 'forest', title: 'Лесные приключения', subtitle: 'Тропинки, грибы и дубы', gradient: ['#4E7D5B', '#CFE3BE'], art: { setting: 'forest', time: 'day', props: [{ kind: 'mushroom', x: 50, y: 88, scale: 1.4 }] } },
  { id: 'everyday', title: 'Повседневная жизнь', subtitle: 'Дом, садик, прогулки', gradient: ['#E9A178', '#FFF1DC'], art: { setting: 'kindergarten', time: 'day', props: [{ kind: 'blocks', x: 50, y: 88, scale: 1.2 }] } },
];

export const categoryById = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!;

export const THEMES: Array<{ id: ThemeId; title: string; category: CategoryId; art: IllustrationSpec }> = [
  { id: 'forest', title: 'Волшебный лес', category: 'forest', art: { setting: 'forest', time: 'day', props: [{ kind: 'mushroom', x: 50, y: 90, scale: 1.2 }] } },
  { id: 'space', title: 'Космическое путешествие', category: 'space', art: { setting: 'space', time: 'night', props: [{ kind: 'rocket', x: 50, y: 70 }] } },
  { id: 'animals', title: 'Дружба с животными', category: 'animals', art: { setting: 'meadow', time: 'day', props: [{ kind: 'puppy', x: 50, y: 88, scale: 1.2 }] } },
  { id: 'dreams', title: 'Путешествие в страну снов', category: 'bedtime', art: { setting: 'dreamland', time: 'night', props: [{ kind: 'cloud', x: 50, y: 70, glow: true }] } },
  { id: 'parents', title: 'Приключения с мамой и папой', category: 'family', art: { setting: 'garden', time: 'day', props: [{ kind: 'heart', x: 50, y: 60, scale: 1.2 }] } },
  { id: 'kindergarten', title: 'Первый день в детском саду', category: 'everyday', art: { setting: 'kindergarten', time: 'day', props: [{ kind: 'blocks', x: 50, y: 90, scale: 1.2 }] } },
  { id: 'princess', title: 'Маленькая принцесса', category: 'princess', art: { setting: 'castle', time: 'sunset', props: [{ kind: 'crown', x: 50, y: 64, scale: 1.2 }] } },
  { id: 'underwater', title: 'Подводное царство', category: 'magic', art: { setting: 'underwater', time: 'day', props: [{ kind: 'dolphin', x: 50, y: 70 }], fx: ['bubbles'] } },
  { id: 'birthday', title: 'День рождения', category: 'family', art: { setting: 'party', time: 'day', props: [{ kind: 'cake', x: 50, y: 90, scale: 1.2 }] } },
  { id: 'unicorn', title: 'Волшебный единорог', category: 'magic', art: { setting: 'meadow', time: 'sunset', props: [{ kind: 'unicorn', x: 50, y: 90, variant: 'rainbow' }] } },
];

export const MOODS: Array<{ id: MoodId; title: string; hint: string }> = [
  { id: 'fun', title: 'Весёлое', hint: 'Смех и игры' },
  { id: 'cozy', title: 'Уютное', hint: 'Тепло и обнимашки' },
  { id: 'adventure', title: 'Приключенческое', hint: 'Немного смелости' },
  { id: 'calm', title: 'Успокаивающее', hint: 'Тихо, перед сном' },
  { id: 'learning', title: 'Познавательное', hint: 'Узнаём новое' },
];

export const DURATIONS: Array<{ id: DurationId; title: string; hint: string; scenes: number; minutes: number }> = [
  { id: 'short', title: 'Короткая', hint: '3–5 минут', scenes: 10, minutes: 4 },
  { id: 'medium', title: 'Средняя', hint: '5–8 минут', scenes: 14, minutes: 7 },
  { id: 'long', title: 'Длинная', hint: '8–12 минут', scenes: 18, minutes: 10 },
];

export const MORALS: Array<{ id: MoralId; title: string }> = [
  { id: 'kindness', title: 'Доброта' },
  { id: 'bravery', title: 'Смелость' },
  { id: 'friendship', title: 'Дружба' },
  { id: 'independence', title: 'Самостоятельность' },
  { id: 'sharing', title: 'Умение делиться' },
  { id: 'dark', title: 'Не бояться темноты' },
  { id: 'sleep', title: 'Спокойное засыпание' },
  { id: 'family', title: 'Любовь к семье' },
];

export interface CompanionInfo {
  id: CompanionId;
  title: string;
  /** формы: им., род., дат., вин., твор. */
  forms: { nom: string; gen: string; dat: string; acc: string; ins: string };
  gender: 'f' | 'm';
  prop: 'mama' | 'papa' | 'grandma' | 'grandpa' | 'sibling' | 'teddy' | 'doll' | 'cat' | 'puppy';
  adult: boolean;
}

export const COMPANIONS: CompanionInfo[] = [
  { id: 'mama', title: 'Мама', forms: { nom: 'мама', gen: 'мамы', dat: 'маме', acc: 'маму', ins: 'мамой' }, gender: 'f', prop: 'mama', adult: true },
  { id: 'papa', title: 'Папа', forms: { nom: 'папа', gen: 'папы', dat: 'папе', acc: 'папу', ins: 'папой' }, gender: 'm', prop: 'papa', adult: true },
  { id: 'grandma', title: 'Бабушка', forms: { nom: 'бабушка', gen: 'бабушки', dat: 'бабушке', acc: 'бабушку', ins: 'бабушкой' }, gender: 'f', prop: 'grandma', adult: true },
  { id: 'grandpa', title: 'Дедушка', forms: { nom: 'дедушка', gen: 'дедушки', dat: 'дедушке', acc: 'дедушку', ins: 'дедушкой' }, gender: 'm', prop: 'grandpa', adult: true },
  { id: 'brother', title: 'Старший брат', forms: { nom: 'старший брат', gen: 'старшего брата', dat: 'старшему брату', acc: 'старшего брата', ins: 'старшим братом' }, gender: 'm', prop: 'sibling', adult: false },
  { id: 'sister', title: 'Старшая сестра', forms: { nom: 'старшая сестра', gen: 'старшей сестры', dat: 'старшей сестре', acc: 'старшую сестру', ins: 'старшей сестрой' }, gender: 'f', prop: 'sibling', adult: false },
  { id: 'teddy', title: 'Плюшевый мишка', forms: { nom: 'плюшевый мишка', gen: 'плюшевого мишки', dat: 'плюшевому мишке', acc: 'плюшевого мишку', ins: 'плюшевым мишкой' }, gender: 'm', prop: 'teddy', adult: false },
  { id: 'doll', title: 'Любимая кукла', forms: { nom: 'любимая кукла', gen: 'любимой куклы', dat: 'любимой кукле', acc: 'любимую куклу', ins: 'любимой куклой' }, gender: 'f', prop: 'doll', adult: false },
  { id: 'kitten', title: 'Котёнок', forms: { nom: 'котёнок', gen: 'котёнка', dat: 'котёнку', acc: 'котёнка', ins: 'котёнком' }, gender: 'm', prop: 'cat', adult: false },
  { id: 'puppy', title: 'Щенок', forms: { nom: 'щенок', gen: 'щенка', dat: 'щенку', acc: 'щенка', ins: 'щенком' }, gender: 'm', prop: 'puppy', adult: false },
];

export const companionById = (id: CompanionId) => COMPANIONS.find((c) => c.id === id)!;
