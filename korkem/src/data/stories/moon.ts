import type { FairyTale } from '../../types';
import { h, p, scenes } from './helpers';

const id = 'moon-trip';

export const moonStory: FairyTale = {
  id,
  title: '{Name} и путешествие на Луну',
  description: 'Из большой коробки получается настоящая ракета! Земля, Марс, Сатурн — и лунный зайчик, который потерял фонарик.',
  category: 'space',
  tags: ['space', 'learning', 'magic', 'family'],
  cover: {
    setting: 'space',
    time: 'night',
    props: [p('rocket', 44, 74, { float: true, scale: 1.1 }), p('planet', 80, 36, { variant: 'saturn' }), p('moonface', 18, 26, { scale: 0.8 })],
    fx: ['sparkles'],
  },
  duration: 9,
  ageMin: 3,
  ageMax: 7,
  moral: 'В темноте нет ничего страшного — там просто не горит свет',
  source: 'library',
  language: 'ru',
  palette: ['#1D2350', '#9FB8F5'],
  scenes: scenes(id, [
    [
      'Однажды папа принёс домой большую-пребольшую коробку.\n— Что мы из неё сделаем? — спросил он.\n— Ракету! — {=закричала|закричал} {Name}.',
      { setting: 'home', time: 'day', heroine: h('jump', 52), props: [p('papa', 30, 86), p('blocks', 74, 90)] },
    ],
    [
      'Они вырезали окошко, нарисовали звёзды и приклеили красный нос. Получилась настоящая ракета!\n— Пристегнуться! — скомандовал папа.',
      { setting: 'home', time: 'day', heroine: h('stand', 36, { outfit: 'space' }), props: [p('rocket', 64, 90, { scale: 1.1 }), p('papa', 16, 86)] },
    ],
    [
      '{Name} {=нажала|нажал} большую кнопку. Ракета задрожала и загудела: у-у-у-у! Пять, четыре, три, два, один… Полетели!',
      { setting: 'garden', time: 'night', props: [p('rocket', 50, 70, { scale: 1.2, glow: true })], fx: ['sparkles'] },
    ],
    [
      'Ракета поднялась над домом, над деревьями, над облаками. Облака были белыми и пушистыми, как сладкая вата.',
      { setting: 'sky', time: 'day', props: [p('rocket', 52, 54, { float: true }), p('cloud', 20, 82), p('cloud', 82, 74, { scale: 0.8 })] },
    ],
    [
      'Становилось всё темнее, и вот вокруг засияли звёзды.\n— Мы в космосе! — {=прошептала|прошептал} {Name}.',
      { setting: 'space', time: 'night', props: [p('rocket', 48, 60, { float: true })], fx: ['sparkles'] },
    ],
    [
      'В окошко был виден большой голубой шар.\n— Это наша Земля, — сказал папа. — Голубое — это моря, зелёное — леса и поля. Здесь живём мы все.',
      { setting: 'space', time: 'night', props: [p('planet', 50, 70, { variant: 'earth', scale: 1.8 }), p('rocket', 82, 34, { scale: 0.6, float: true })] },
    ],
    [
      'Мимо проплыла красная планета.\n— Это Марс, — сказал папа. — А вон там — Сатурн. У него есть кольца, как у юлы.',
      { setting: 'space', time: 'night', props: [p('planet', 30, 50, { variant: 'mars' }), p('planet', 72, 70, { variant: 'saturn', scale: 1.4 }), p('rocket', 50, 30, { scale: 0.5, float: true })] },
    ],
    [
      'И вот впереди засияла Луна — большая, круглая и серебристая. Ракета мягко опустилась на лунную полянку: пуф!',
      { setting: 'moon', time: 'night', props: [p('rocket', 60, 88)], fx: ['sparkles'] },
    ],
    [
      '{Name} {=выглянула|выглянул} наружу и {=прыгнула|прыгнул}. Ого! На Луне прыгать легко-легко, как на батуте. Прыг — и почти до звёзд!',
      { setting: 'moon', time: 'night', heroine: h('jump', 40, { outfit: 'space', y: 70 }), props: [p('rocket', 76, 88, { scale: 0.9 })] },
    ],
    [
      'Из-за камушка выглянул лунный зайчик с серебряными ушками.\n— Ой, гости! — сказал он. — Как хорошо, что вы прилетели. Я потерял свой фонарик.',
      { setting: 'moon', time: 'night', heroine: h('stand', 32, { outfit: 'space' }), props: [p('bunny', 62, 88, { variant: 'moon' })] },
    ],
    [
      '— Он упал вон в ту ямку, — показал зайчик. — Это кратер. Там темно, и мне страшно.',
      { setting: 'moon', time: 'night', props: [p('bunny', 40, 88, { variant: 'moon' })], heroine: h('think', 22, { outfit: 'space' }) },
    ],
    [
      '{Name:dat} тоже было немножко страшно. Но {=она|он} {=взяла|взял} папу за руку и {=сказала|сказал}:\n— Давай посмотрим вместе. В темноте нет ничего страшного — там просто не горит свет.',
      { setting: 'moon', time: 'night', heroine: h('stand', 44, { outfit: 'space' }), props: [p('papa', 26, 86), p('bunny', 66, 88, { variant: 'moon', scale: 0.85 })] },
    ],
    [
      'Они осторожно спустились в кратер. А там, на дне, светился маленький фонарик! {Name} {=подняла|поднял} его и {=отдала|отдал} зайчику.',
      { setting: 'moon', time: 'night', heroine: h('reach', 40, { outfit: 'space' }), props: [p('lantern', 58, 88, { glow: true }), p('bunny', 76, 88, { variant: 'moon' })] },
    ],
    [
      '— Ты {=очень смелая|очень смелый}! — обрадовался зайчик. Он зажёг фонарик, и весь кратер засверкал серебряными искорками.',
      { setting: 'moon', time: 'night', heroine: h('jump', 36, { outfit: 'space' }), props: [p('bunny', 62, 88, { variant: 'moon' }), p('lantern', 70, 80, { glow: true, scale: 0.7 })], fx: ['sparkles'] },
    ],
    [
      'Пора было возвращаться. {Name} {=помахала|помахал} лунному зайчику, и ракета полетела обратно — к голубой Земле, к родному дому.',
      { setting: 'space', time: 'night', props: [p('rocket', 40, 50, { float: true, flip: true }), p('planet', 80, 76, { variant: 'earth', scale: 1.3 })] },
    ],
    [
      'Дома {Name} сразу {=подбежала|подбежал} к окну. В небе светила Луна, а на ней будто мигал маленький фонарик.\n— Спокойной ночи, зайчик, — {=прошептала|прошептал} {Name}.',
      { setting: 'bedroom', time: 'night', heroine: h('wave', 40, { outfit: 'pajamas' }), props: [p('teddy', 76, 88, { scale: 0.7 })] },
    ],
  ]),
};
