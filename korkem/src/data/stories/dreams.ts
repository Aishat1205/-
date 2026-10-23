import type { FairyTale } from '../../types';
import { h, p, scenes } from './helpers';

const id = 'sweet-dreams';

export const dreamsStory: FairyTale = {
  id,
  title: '{Name} в стране сладких снов',
  description: 'Облачко Пушинка уносит в страну, где всё мягкое и тихое. Там живёт совёнок, который никак не может уснуть.',
  category: 'bedtime',
  tags: ['bedtime', 'magic', 'kindness'],
  cover: {
    setting: 'dreamland',
    time: 'night',
    heroine: h('sit', 46, { outfit: 'pajamas' }),
    props: [p('cloud', 46, 90, { scale: 1.4 }), p('moonface', 78, 30, { scale: 0.9 }), p('teddy', 60, 82, { scale: 0.55 })],
    fx: ['sparkles'],
  },
  duration: 7,
  ageMin: 2,
  ageMax: 6,
  moral: 'Спокойное дыхание помогает уснуть',
  bedtime: true,
  source: 'library',
  language: 'ru',
  palette: ['#3C3A7A', '#F3C6DD'],
  scenes: scenes(id, [
    [
      'Вечер стал тихим и тёплым. {Name} {=почистила|почистил} зубки, {=надела|надел} пижаму и {=забралась|забрался} под одеяло. Рядом устроился плюшевый мишка.',
      { setting: 'bedroom', time: 'night', heroine: h('sit', 46, { outfit: 'pajamas' }), props: [p('teddy', 66, 84, { scale: 0.7 }), p('lantern', 84, 84, { glow: true, scale: 0.8 })] },
    ],
    [
      'Мама поцеловала {Name:acc} и выключила большой свет. Остался гореть только маленький ночник, похожий на луну.',
      { setting: 'bedroom', time: 'night', heroine: h('sleep', 56, { outfit: 'pajamas' }), props: [p('mama', 28, 86), p('lantern', 86, 84, { glow: true, scale: 0.8 })] },
    ],
    [
      'Вдруг за окном показалось мягкое облачко. Оно светилось нежно-розовым светом и тихонько постучало в стекло: тук-тук.',
      { setting: 'bedroom', time: 'night', heroine: h('sit', 60, { outfit: 'pajamas' }), props: [p('cloud', 28, 40, { float: true, glow: true })] },
    ],
    [
      '— Я облачко Пушинка, — прошептало оно. — Хочешь в страну сладких снов? Там всё-всё мягкое и доброе.\n{Name} {=взяла|взял} мишку и {=кивнула|кивнул}.',
      { setting: 'bedroom', time: 'night', heroine: h('hug', 56, { outfit: 'pajamas' }), props: [p('teddy', 58, 66, { scale: 0.5 }), p('cloud', 26, 42, { float: true, glow: true })] },
    ],
    [
      'Они полетели над спящим городом. Внизу светились окошки, а наверху мигали звёзды. Было совсем не страшно: облачко было тёплым, как одеяло.',
      { setting: 'sky', time: 'night', heroine: h('sit', 50, { outfit: 'pajamas', y: 66 }), props: [p('cloud', 50, 74, { scale: 1.6 })], fx: ['sparkles'] },
    ],
    [
      'Страна сладких снов встретила их тишиной. Здесь росли сонные цветы. Они качали головками и шептали: «Баю-бай, баю-бай».',
      { setting: 'dreamland', time: 'night', heroine: h('walk', 36, { outfit: 'pajamas' }), props: [p('flowers', 60, 90), p('flowers', 74, 88, { flip: true }), p('flowers', 86, 91)], fx: ['fireflies'] },
    ],
    [
      'По тропинке медленно ползла улитка с домиком-фонариком.\n— Не спеши, — сказала она. — В стране снов никто никуда не торопится.',
      { setting: 'dreamland', time: 'night', heroine: h('sit', 34, { outfit: 'pajamas' }), props: [p('snail', 62, 90, { glow: true })] },
    ],
    [
      'У серебристого озера сидел маленький совёнок и грустно вздыхал.\n— Я никак не могу уснуть, — пожаловался он. — Глазки не закрываются.',
      { setting: 'dreamland', time: 'night', props: [p('owl', 52, 86, { scale: 1.1 }), p('moonface', 80, 28, { scale: 0.7 })], fx: ['fireflies'] },
    ],
    [
      '{Name} {=присела|присел} рядом.\n— А давай подышим вместе, — {=предложила|предложил} {=она|он}. — Медленно вдохнём, будто нюхаем цветочек… и тихо выдохнем, будто дуем на одуванчик.',
      { setting: 'dreamland', time: 'night', heroine: h('sit', 36, { outfit: 'pajamas' }), props: [p('owl', 62, 86), p('flowers', 84, 90)] },
    ],
    [
      'Они вдохнули и выдохнули. Ещё раз. И ещё. Пёрышки у совёнка улеглись, а глазки стали тяжёлыми-тяжёлыми.',
      { setting: 'dreamland', time: 'night', heroine: h('sit', 38, { outfit: 'pajamas' }), props: [p('owl', 62, 86)], fx: ['zzz', 'sparkles'] },
    ],
    [
      'Мишка принёс маленькую подушку-облачко, а {Name} тихонько {=спела|спел} колыбельную. Совёнок зевнул и уснул прямо на мягком листочке.',
      { setting: 'dreamland', time: 'night', heroine: h('sit', 34, { outfit: 'pajamas' }), props: [p('pillow', 62, 90), p('owl', 62, 82, { scale: 0.8 }), p('teddy', 80, 88, { scale: 0.55 })], fx: ['zzz'] },
    ],
    [
      '— Спасибо, — прошептала Луна с неба. — Ты {=помогла|помог} совёнку уснуть. А теперь и тебе пора отдыхать.',
      { setting: 'dreamland', time: 'night', heroine: h('stand', 34, { outfit: 'pajamas' }), props: [p('moonface', 66, 34, { scale: 1.2, glow: true })], fx: ['sparkles'] },
    ],
    [
      'Облачко Пушинка бережно отнесло {Name:acc} и мишку домой и уложило в кроватку. Одеяло было тёплым, а подушка — мягкой.',
      { setting: 'bedroom', time: 'night', heroine: h('sleep', 54, { outfit: 'pajamas' }), props: [p('cloud', 24, 36, { float: true, glow: true, scale: 0.8 }), p('teddy', 80, 88, { scale: 0.6 })] },
    ],
    [
      '{Name} глубоко {=вдохнула|вдохнул}… и медленно {=выдохнула|выдохнул}. Глазки закрылись сами собой. Спокойной ночи, {Name}. Пусть тебе снятся самые сладкие сны.',
      { setting: 'bedroom', time: 'night', heroine: h('sleep', 50, { outfit: 'pajamas' }), props: [p('lantern', 84, 84, { glow: true, scale: 0.7 })], fx: ['zzz'] },
    ],
  ]),
};
