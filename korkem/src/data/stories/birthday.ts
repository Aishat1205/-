import type { FairyTale } from '../../types';
import { h, p, scenes } from './helpers';

const id = 'magic-birthday';

export const birthdayStory: FairyTale = {
  id,
  title: '{Name} и волшебный день рождения',
  description: 'Шарики, подарки, гости из леса — и большой торт. Хватит ли его на всех? Конечно, если уметь делиться!',
  category: 'family',
  tags: ['family', 'magic', 'kindness', 'animals'],
  cover: {
    setting: 'party',
    time: 'day',
    heroine: h('jump', 44, { outfit: 'party' }),
    props: [p('cake', 70, 88, { scale: 1.1 }), p('balloons', 20, 72), p('gift', 86, 90, { scale: 0.8 })],
    fx: ['confetti'],
  },
  duration: 8,
  ageMin: 2,
  ageMax: 6,
  moral: 'Самый лучший праздник — тот, которым делишься',
  source: 'library',
  language: 'ru',
  palette: ['#F29BB5', '#FFF0C9'],
  scenes: scenes(id, [
    [
      'Сегодня особенный день. {Name} {=проснулась|проснулся} и {=увидела|увидел} над кроваткой разноцветные шарики.\n— С днём рождения! — хором сказали мама и папа.',
      { setting: 'bedroom', time: 'day', heroine: h('jump', 50, { outfit: 'pajamas' }), props: [p('mama', 22, 86), p('papa', 80, 86, { flip: true }), p('balloons', 50, 40, { float: true, scale: 0.8 })] },
    ],
    [
      'Мама подарила коробку с бантом. А в ней — маленький фонарик в виде звёздочки.\n— Он волшебный, — подмигнул папа. — Помогает загадывать добрые желания.',
      { setting: 'bedroom', time: 'day', heroine: h('reach', 46, { outfit: 'pajamas' }), props: [p('gift', 64, 90), p('lantern', 64, 70, { glow: true, scale: 0.7, float: true })] },
    ],
    [
      '{Name} {=надела|надел} {=праздничное платье|праздничный костюм} и {=помогла|помог} маме украсить комнату. Шарики, флажки, ленточки — стало ярко и весело!',
      { setting: 'party', time: 'day', heroine: h('wave', 46, { outfit: 'party' }), props: [p('mama', 22, 86), p('balloons', 78, 70)] },
    ],
    [
      'Тук-тук! В дверь постучали. На пороге стоял зайчонок Пушок с букетом ромашек.\n— С днём рождения! — сказал он и смутился.',
      { setting: 'party', time: 'day', heroine: h('stand', 36, { outfit: 'party' }), props: [p('bunny', 64, 88), p('flowers', 72, 84, { scale: 0.6 })] },
    ],
    [
      'Потом прилетела сова, прибежали белочка и ёжик. Каждый принёс маленький подарок: шишку, яблочко, красивый листик.',
      { setting: 'party', time: 'day', props: [p('owl', 22, 86), p('squirrel', 42, 86), p('hedgehog', 62, 90), p('apple', 74, 90, { scale: 0.8 }), p('bunny', 86, 88, { scale: 0.8 })], fx: ['confetti'] },
    ],
    [
      'Вдруг в окно влетел ветерок, подхватил один шарик и унёс его в сад.\n— Мой шарик! — {=огорчилась|огорчился} {Name}.',
      { setting: 'garden', time: 'day', heroine: h('reach', 32, { outfit: 'party' }), props: [p('balloons', 70, 40, { float: true, variant: 'one' })] },
    ],
    [
      '— Не грусти, — сказал Пушок. — Пойдём искать вместе!\nДрузья выбежали в сад. Шарик зацепился за ветку высокой яблони.',
      { setting: 'garden', time: 'day', heroine: h('walk', 26, { outfit: 'party' }), props: [p('tree', 66, 94, { scale: 1.3 }), p('balloons', 64, 40, { variant: 'one' }), p('bunny', 42, 88, { scale: 0.8 })] },
    ],
    [
      'Белочка ловко забралась на дерево и осторожно отцепила ниточку. Шарик опустился прямо в руки.\n— Спасибо, белочка! — {=обрадовалась|обрадовался} {Name}.',
      { setting: 'garden', time: 'day', heroine: h('jump', 40, { outfit: 'party' }), props: [p('tree', 70, 94, { scale: 1.2 }), p('squirrel', 68, 50), p('balloons', 40, 40, { variant: 'one' })] },
    ],
    [
      'Тем временем мама вынесла большой торт с праздничными свечками. Все ахнули: торт был украшен клубникой и сахарными звёздочками.',
      { setting: 'party', time: 'day', props: [p('mama', 30, 86), p('cake', 60, 88, { scale: 1.3 }), p('balloons', 86, 70)], fx: ['sparkles'] },
    ],
    [
      '— Загадай желание, — шепнул папа. {Name} {=зажмурилась|зажмурился}, {=подумала|подумал}… и {=задула|задул} свечки: фу-у-у!',
      { setting: 'party', time: 'day', heroine: h('think', 38, { outfit: 'party' }), props: [p('cake', 62, 88, { scale: 1.1 }), p('papa', 84, 86, { flip: true })] },
    ],
    [
      'Но торт был не очень большой, а гостей — много.\n— Хватит ли всем? — забеспокоился ёжик.\n— Конечно хватит! — {=сказала|сказал} {Name}. — Я поделю его так, чтобы каждому достался кусочек.',
      { setting: 'party', time: 'day', heroine: h('reach', 40, { outfit: 'party' }), props: [p('cake', 60, 88), p('hedgehog', 80, 90), p('bunny', 20, 88, { scale: 0.8 })] },
    ],
    [
      'Мама помогла разрезать торт, а {Name} {=раздавала|раздавал} кусочки: Пушку, белочке, ёжику, сове, маме, папе — и себе. И всем досталось!',
      { setting: 'party', time: 'day', heroine: h('wave', 44, { outfit: 'party' }), props: [p('bunny', 20, 88, { scale: 0.8 }), p('squirrel', 68, 86), p('hedgehog', 84, 90), p('heart', 50, 34, { float: true })], fx: ['confetti'] },
    ],
    [
      'Вечером в небе появилась знакомая звёздочка Искорка. Она подмигнула и рассыпала над садом золотые искры, как праздничный салют.',
      { setting: 'garden', time: 'night', heroine: h('jump', 40, { outfit: 'party' }), props: [p('star', 66, 36, { glow: true, float: true })], fx: ['sparkles', 'confetti'] },
    ],
    [
      '— А какое желание ты {=загадала|загадал}? — спросил Пушок.\n{Name} {=улыбнулась|улыбнулся}:\n— Чтобы все мои друзья всегда были рядом. И, кажется, оно уже сбылось.',
      { setting: 'garden', time: 'night', heroine: h('sit', 44, { outfit: 'party' }), props: [p('bunny', 62, 88, { scale: 0.85 }), p('lantern', 28, 88, { glow: true, scale: 0.7 })], fx: ['fireflies'] },
    ],
    [
      'Когда гости разошлись, {Name} {=обняла|обнял} маму и папу.\n— Это был самый лучший день рождения! — {=сказала|сказал} {=она|он}. Ведь самый лучший праздник — тот, которым делишься с друзьями.',
      { setting: 'home', time: 'night', heroine: h('hug', 50, { outfit: 'party' }), props: [p('mama', 34, 86), p('papa', 66, 86, { flip: true }), p('balloons', 86, 66, { scale: 0.7 })] },
    ],
  ]),
};
