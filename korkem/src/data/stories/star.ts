import type { FairyTale } from '../../types';
import { h, p, scenes } from './helpers';

const id = 'magic-star';

export const starStory: FairyTale = {
  id,
  title: '{Name} и волшебная звёздочка',
  description: 'Маленькая звёздочка упала с неба в сад. Как помочь ей вернуться домой? Нужно лишь немного доброты и тёплая песенка.',
  category: 'magic',
  tags: ['magic', 'bedtime', 'space', 'kindness'],
  cover: {
    setting: 'garden',
    time: 'night',
    heroine: h('reach', 42, { outfit: 'pajamas' }),
    props: [p('star', 64, 70, { glow: true, float: true, scale: 1.1 })],
    fx: ['fireflies', 'sparkles'],
  },
  duration: 6,
  ageMin: 2,
  ageMax: 6,
  language: 'ru',
  moral: 'Доброе сердце светит ярче всех звёзд',
  bedtime: true,
  source: 'library',
  palette: ['#2B2552', '#F6C76B'],
  scenes: scenes(id, [
    [
      'Наступил тихий вечер. {Name} {=надела|надел} мягкую пижаму и {=подошла|подошёл} к окну. На тёмном небе одна за другой зажигались звёзды: одна, две, три…',
      { setting: 'bedroom', time: 'night', heroine: h('stand', 38, { outfit: 'pajamas' }), props: [p('teddy', 72, 86, { scale: 0.8 })] },
    ],
    [
      'Вдруг одна маленькая звёздочка мигнула и покатилась вниз, будто с горки.\n— Ой! — {=удивилась|удивился} {Name}. — Куда же ты, звёздочка?',
      { setting: 'bedroom', time: 'night', heroine: h('reach', 36, { outfit: 'pajamas' }), props: [p('comet', 30, 26, { float: true, scale: 0.6 })] },
    ],
    [
      'Звёздочка тихонько опустилась в саду, прямо на мягкую траву. Она светилась тёплым золотым светом — совсем чуть-чуть, как маленький фонарик.',
      { setting: 'garden', time: 'night', props: [p('star', 52, 82, { glow: true, scale: 0.9 }), p('flowers', 22, 88), p('flowers', 80, 90, { flip: true })], fx: ['fireflies'] },
    ],
    [
      '{Name} {=позвала|позвал} папу, {=взяла|взял} его за руку, и они вместе вышли в сад. Звёздочка лежала в траве и тихонько вздыхала.',
      { setting: 'garden', time: 'night', heroine: h('walk', 30, { outfit: 'pajamas' }), props: [p('papa', 16, 86), p('star', 70, 84, { glow: true, scale: 0.85 })] },
    ],
    [
      '— Здравствуй, — прозвенела звёздочка. — Меня зовут Искорка. Я играла с ветерком и упала с неба. А теперь не знаю, как вернуться домой.',
      { setting: 'garden', time: 'night', heroine: h('think', 34, { outfit: 'pajamas' }), props: [p('star', 64, 78, { glow: true, float: true })] },
    ],
    [
      '— Не грусти, Искорка, — ласково {=сказала|сказал} {Name}. — Мы обязательно что-нибудь придумаем.',
      { setting: 'garden', time: 'night', heroine: h('reach', 40, { outfit: 'pajamas' }), props: [p('star', 62, 76, { glow: true, float: true }), p('papa', 14, 86)] },
    ],
    [
      'Из-за ветки выглянула мудрая сова.\n— Ух-ух! — сказала она. — Звёздочки возвращаются на небо, когда снова ярко светятся. А светятся они от доброты и улыбок.',
      { setting: 'garden', time: 'night', props: [p('tree', 70, 92, { scale: 1.2 }), p('owl', 66, 46), p('star', 30, 82, { glow: true })], fx: ['fireflies'] },
    ],
    [
      '{Name} {=задумалась|задумался}. Как же подарить звёздочке улыбку? И тогда {=она|он} {=запела|запел} свою любимую песенку — тихую и ласковую.',
      { setting: 'garden', time: 'night', heroine: h('sit', 40, { outfit: 'pajamas' }), props: [p('star', 62, 78, { glow: true, float: true })], fx: ['sparkles'] },
    ],
    [
      'Искорка засветилась чуть ярче. Папа улыбнулся и стал подпевать. Из травы вылетели светлячки и закружились рядом, как крошечные огоньки.',
      { setting: 'garden', time: 'night', heroine: h('sit', 44, { outfit: 'pajamas' }), props: [p('papa', 22, 86), p('star', 66, 74, { glow: true, float: true, scale: 1.05 })], fx: ['fireflies', 'sparkles'] },
    ],
    [
      'Тогда {Name} осторожно {=обняла|обнял} звёздочку и {=сказала|сказал}:\n— Ты очень красивая, Искорка. Ты мой друг.',
      { setting: 'garden', time: 'night', heroine: h('hug', 48, { outfit: 'pajamas' }), props: [p('star', 55, 66, { glow: true, scale: 0.7 })], fx: ['sparkles'] },
    ],
    [
      'Звёздочка засияла так ярко, что весь сад стал золотым.\n— Спасибо, {Name}! — зазвенела она. — Теперь я могу лететь!',
      { setting: 'garden', time: 'night', heroine: h('jump', 38, { outfit: 'pajamas' }), props: [p('star', 62, 58, { glow: true, float: true, scale: 1.3 })], fx: ['sparkles', 'fireflies'] },
    ],
    [
      'Искорка поднялась над садом, над деревьями и над крышами домов. Она плыла всё выше и выше, оставляя за собой серебристую дорожку.',
      { setting: 'sky', time: 'night', heroine: h('wave', 26, { outfit: 'pajamas', scale: 0.8 }), props: [p('comet', 66, 30, { float: true, flip: true })], fx: ['sparkles'] },
    ],
    [
      'Высоко-высоко в небе Искорка заняла своё место среди подружек и трижды мигнула: «Спокойной ночи, {Name}!»',
      { setting: 'space', time: 'night', props: [p('star', 50, 40, { glow: true, float: true, scale: 0.9 }), p('moonface', 80, 30, { scale: 0.8 })], fx: ['sparkles'] },
    ],
    [
      'Папа уложил {Name:acc} в кроватку. За окном тихо светила самая яркая звёздочка. {Name} {=улыбнулась|улыбнулся}, {=закрыла|закрыл} глаза и сладко-сладко {=уснула|уснул}. Ведь доброе сердце светит ярче всех звёзд.',
      { setting: 'bedroom', time: 'night', heroine: h('sleep', 50, { outfit: 'pajamas' }), props: [p('teddy', 78, 88, { scale: 0.7 })], fx: ['zzz'] },
    ],
  ]),
};
