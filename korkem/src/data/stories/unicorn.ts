import type { FairyTale } from '../../types';
import { h, p, scenes } from './helpers';

const id = 'little-unicorn';

export const unicornStory: FairyTale = {
  id,
  title: '{Name} и маленький единорог',
  description: 'Единорожка Радужка потеряла все цвета своей гривы. Вернуть их может только настоящая дружба — и немного игры.',
  category: 'princess',
  tags: ['princess', 'magic', 'learning', 'kindness'],
  cover: {
    setting: 'castle',
    time: 'sunset',
    heroine: h('wave', 36, { outfit: 'princess' }),
    props: [p('unicorn', 66, 88, { variant: 'rainbow' }), p('rainbow', 50, 60, { scale: 1.2 })],
    fx: ['sparkles'],
  },
  duration: 8,
  ageMin: 2,
  ageMax: 6,
  moral: 'Дружба возвращает яркие краски',
  source: 'library',
  language: 'ru',
  palette: ['#B79CE0', '#FCE1EA'],
  scenes: scenes(id, [
    [
      'После тёплого летнего дождика {Name} {=выбежала|выбежал} в сад. Всё вокруг блестело, а на листьях дрожали капельки, похожие на бусинки.',
      { setting: 'garden', time: 'day', heroine: h('jump', 44), props: [p('flowers', 20, 90), p('flowers', 78, 90, { flip: true })], fx: ['rain'] },
    ],
    [
      'За кустом сирени кто-то тихонько всхлипывал. {Name} {=заглянула|заглянул} туда и {=ахнула|ахнул}: там стоял маленький белый единорог!',
      { setting: 'garden', time: 'day', heroine: h('think', 30), props: [p('unicorn', 64, 88, { variant: 'pale' }), p('flowers', 86, 90)] },
    ],
    [
      '— Меня зовут Радужка, — сказала единорожка. — Я умела рисовать радугу. Но мне стало так одиноко, что все цвета из моей гривы пропали.',
      { setting: 'garden', time: 'day', props: [p('unicorn', 50, 88, { variant: 'pale', scale: 1.2 })] },
    ],
    [
      '— Хочешь, я буду твоим другом? — {=спросила|спросил} {Name}.\n— Правда? Самым настоящим?\n— Самым настоящим! — {=улыбнулась|улыбнулся} {Name}.',
      { setting: 'garden', time: 'day', heroine: h('reach', 36), props: [p('unicorn', 64, 88, { variant: 'pale' }), p('heart', 50, 40, { float: true })] },
    ],
    [
      'В ту же минуту на кончике гривы Радужки появилась красная прядка — яркая, как спелое яблочко.\n— Смотри! — {=удивилась|удивился} {Name}. — Цвет вернулся!',
      { setting: 'garden', time: 'day', heroine: h('jump', 34), props: [p('unicorn', 62, 88, { variant: 'red' }), p('apple', 84, 90)] },
    ],
    [
      'Они стали играть в догонялки. {Name} {=смеялась|смеялся}, Радужка весело цокала копытцами. И в гриве засияла оранжевая прядка — как морковка.',
      { setting: 'meadow', time: 'day', heroine: h('walk', 28), props: [p('unicorn', 62, 88, { variant: 'orange' }), p('carrot', 84, 90)], fx: ['petals'] },
    ],
    [
      'Потом они грелись на солнышке — и появилась жёлтая прядка. Нюхали травку — и появилась зелёная.\n— Красный, оранжевый, жёлтый, зелёный, — {=считала|считал} {Name}.',
      { setting: 'meadow', time: 'day', heroine: h('sit', 36), props: [p('unicorn', 62, 88, { variant: 'green' }), p('flowers', 84, 90)] },
    ],
    [
      'У пруда Радужка увидела своё отражение. И в гриве засветились ещё две прядки.\n— Голубая — как вода! Синяя — как вечернее небо! — {Name} {=захлопала|захлопал} в ладоши.',
      { setting: 'lake', time: 'day', heroine: h('jump', 32), props: [p('unicorn', 62, 88, { variant: 'blue' })] },
    ],
    [
      'Не хватало только одного цвета.\n— Фиолетового, — вздохнула Радужка.\n{Name} {=нашла|нашёл} маленький фиолетовый цветочек и {=вплела|вплёл} его ей в гриву. — Это тебе. От друга.',
      { setting: 'meadow', time: 'day', heroine: h('reach', 40), props: [p('unicorn', 62, 88, { variant: 'blue' }), p('flowers', 30, 92, { variant: 'violet' })] },
    ],
    [
      'И тут грива Радужки засияла всеми цветами сразу! Она топнула копытцем — и через весь сад раскинулась настоящая радуга.',
      { setting: 'garden', time: 'day', heroine: h('jump', 30), props: [p('rainbow', 50, 70, { scale: 1.4 }), p('unicorn', 64, 88, { variant: 'rainbow' })], fx: ['sparkles'] },
    ],
    [
      '— Пойдём со мной, — позвала Радужка. — Я покажу тебе свой дом!\nИ они пошли по радуге, как по мягкой разноцветной дорожке.',
      { setting: 'sky', time: 'day', heroine: h('walk', 40, { y: 74 }), props: [p('rainbow', 50, 96, { scale: 1.6 }), p('unicorn', 60, 74, { variant: 'rainbow', scale: 0.85 })] },
    ],
    [
      'На облаках стоял Радужный замок с башенками. Навстречу вышли мама и папа Радужки.\n— Спасибо, что подружились с нашей дочкой, — сказали они.',
      { setting: 'castle', time: 'day', heroine: h('wave', 26), props: [p('unicorn', 54, 88, { variant: 'rainbow', scale: 1.2 }), p('unicorn', 76, 88, { variant: 'rainbow', scale: 1.25, flip: true }), p('unicorn', 40, 88, { variant: 'rainbow', scale: 0.7 })] },
    ],
    [
      'В замке устроили праздник. Единороги танцевали, а {Name:dat} надели на голову сияющую корону — совсем как у {=настоящей принцессы|настоящего принца}.',
      { setting: 'castle', time: 'sunset', heroine: h('jump', 42, { outfit: 'princess' }), props: [p('unicorn', 70, 88, { variant: 'rainbow' }), p('balloons', 18, 70)], fx: ['confetti'] },
    ],
    [
      'Когда солнце стало садиться, Радужка отвезла {Name:acc} домой.\n— Мы ведь теперь друзья навсегда? — спросила она.\n— Навсегда! — {=ответила|ответил} {Name}.',
      { setting: 'garden', time: 'sunset', heroine: h('hug', 40), props: [p('unicorn', 60, 88, { variant: 'rainbow' })], fx: ['sparkles'] },
    ],
    [
      'С тех пор после каждого дождика {Name} выходит в сад и ищет радугу. А если находит — машет ей рукой. Ведь там, наверху, ждёт самый лучший друг.',
      { setting: 'garden', time: 'day', heroine: h('wave', 40), props: [p('rainbow', 56, 64, { scale: 1.2 }), p('flowers', 80, 90)] },
    ],
  ]),
};
