import type { FairyTale } from '../../types';
import { h, p, scenes } from './helpers';

const id = 'little-bunny';

export const bunnyStory: FairyTale = {
  id,
  title: '{Name} и маленький зайчонок',
  description: 'На цветочной поляне потерялся зайчонок Пушок. Вместе с мамой, белочкой и ёжиком нужно найти его маму.',
  category: 'animals',
  tags: ['animals', 'kindness', 'forest', 'family'],
  cover: {
    setting: 'meadow',
    time: 'day',
    heroine: h('reach', 40),
    props: [p('bunny', 64, 86, { scale: 1.1 }), p('flowers', 18, 90), p('butterfly', 78, 40, { float: true })],
    fx: ['petals'],
  },
  duration: 6,
  ageMin: 2,
  ageMax: 6,
  moral: 'Помогать другим — значит иметь доброе сердце',
  source: 'library',
  language: 'ru',
  palette: ['#7FB77E', '#F8E7B8'],
  scenes: scenes(id, [
    [
      'Было солнечное утро. {Name} и мама пошли гулять на цветочную поляну. В небе пели птички, а на траве сверкала роса.',
      { setting: 'meadow', time: 'day', heroine: h('walk', 44), props: [p('mama', 26, 86), p('bird', 78, 26, { float: true })], fx: ['petals'] },
    ],
    [
      '{Name} {=собирала|собирал} ромашки для мамы. Вдруг под кустиком что-то зашуршало: шур-шур-шур.',
      { setting: 'meadow', time: 'day', heroine: h('reach', 38), props: [p('flowers', 60, 90), p('flowers', 74, 88, { flip: true })] },
    ],
    [
      'Там сидел маленький серый зайчонок. Ушки у него были опущены, а носик тихонько дрожал.',
      { setting: 'meadow', time: 'day', props: [p('bunny', 50, 86, { scale: 1.2 }), p('flowers', 26, 90), p('flowers', 76, 90, { flip: true })] },
    ],
    [
      '— Привет, — шёпотом {=сказала|сказал} {Name}, чтобы не напугать малыша. — Как тебя зовут?\n— Пушок, — ответил зайчонок. — Я гонялся за бабочкой и потерял маму.',
      { setting: 'meadow', time: 'day', heroine: h('sit', 38), props: [p('bunny', 62, 86), p('butterfly', 80, 36, { float: true })] },
    ],
    [
      '— Мы поможем тебе, Пушок, — сказала мама. — Правда?\n— Правда! — {=кивнула|кивнул} {Name}. — Мы найдём твою маму.',
      { setting: 'meadow', time: 'day', heroine: h('wave', 46), props: [p('mama', 24, 86), p('bunny', 68, 86)] },
    ],
    [
      'На ветке сидела рыжая белочка.\n— Белочка, ты не видела маму-зайчиху? — {=спросила|спросил} {Name}.\n— Видела! Она пошла к большому дубу, за ручей.',
      { setting: 'forest', time: 'day', heroine: h('reach', 32), props: [p('tree', 70, 94, { scale: 1.1 }), p('squirrel', 66, 52), p('bunny', 46, 86, { scale: 0.8 })] },
    ],
    [
      'Они пошли по тропинке. Пушок устал и стал отставать. Тогда {Name} {=взяла|взял} его на ручки — бережно, как самое дорогое сокровище.',
      { setting: 'forest', time: 'day', heroine: h('hug', 50), props: [p('bunny', 53, 70, { scale: 0.65 }), p('mama', 28, 86)] },
    ],
    [
      'У ручья их встретил ёжик.\n— Через ручей можно перейти по мостику, — подсказал он. — Только идите медленно и держитесь за руку.',
      { setting: 'lake', time: 'day', heroine: h('stand', 30), props: [p('hedgehog', 54, 88), p('bridge', 78, 86)] },
    ],
    [
      '{Name} крепко {=держала|держал} маму за руку. Шаг, ещё шаг — и вот они уже на другом берегу!\n— Ура! — тихонько пискнул Пушок.',
      { setting: 'lake', time: 'day', heroine: h('walk', 56), props: [p('bridge', 50, 86, { scale: 1.3 }), p('mama', 40, 84), p('bunny', 70, 86, { scale: 0.75 })] },
    ],
    [
      'Под большим дубом лежали морковки — одна, другая, третья, будто дорожка.\n— Это мама оставила! — обрадовался Пушок.',
      { setting: 'forest', time: 'day', props: [p('carrot', 30, 90), p('carrot', 44, 88), p('carrot', 58, 89), p('tree', 80, 94, { scale: 1.2 }), p('bunny', 18, 88, { scale: 0.8 })] },
    ],
    [
      'А под дубом сидела мама-зайчиха и звала:\n— Пушок! Пушок, где ты?\n— Мама! — закричал зайчонок и побежал к ней со всех лапок.',
      { setting: 'forest', time: 'day', heroine: h('stand', 22), props: [p('bunny', 64, 88, { scale: 1.5 }), p('bunny', 46, 88, { scale: 0.8, flip: true }), p('tree', 84, 94)] },
    ],
    [
      'Мама-зайчиха крепко обняла сыночка.\n— Спасибо тебе, {Name}, — сказала она. — У тебя очень доброе сердце.',
      { setting: 'forest', time: 'day', heroine: h('wave', 30), props: [p('bunny', 62, 88, { scale: 1.5 }), p('bunny', 54, 88, { scale: 0.8 }), p('heart', 58, 50, { float: true })], fx: ['sparkles'] },
    ],
    [
      'Зайчиха угостила всех сладкой морковкой, и они устроили маленький пикник на траве. Пушок прыгал вокруг {Name:gen} и смеялся.',
      { setting: 'meadow', time: 'day', heroine: h('sit', 44), props: [p('basket', 58, 90), p('carrot', 66, 90), p('bunny', 76, 86, { scale: 0.8 }), p('mama', 22, 86)], fx: ['petals'] },
    ],
    [
      'Вечером {Name} {=рассказывала|рассказывал} папе, как они помогли Пушку.\n— Когда помогаешь другим, на душе становится тепло-тепло, — {=сказала|сказал} {=она|он}. И папа крепко {=её|его} обнял.',
      { setting: 'home', time: 'sunset', heroine: h('hug', 48), props: [p('papa', 34, 86)] },
    ],
  ]),
};
