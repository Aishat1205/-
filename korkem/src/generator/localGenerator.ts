import type { CategoryId, CompanionId, FairyTale, HeroinePlacement, IllustrationSpec, PropPlacement, StoryRequest, StoryScene } from '../types';
import { COMPANIONS, DURATIONS, MORALS, THEMES, companionById } from '../data/catalog';
import { THEME_PACKS, type Beat, type FriendInfo, type ThemePack } from './themes';
import { COMPANION_BEAT, FILLER_BEATS, MOOD_BEATS, MORAL_BEATS, WISH_BEATS } from './beats';

/** Простой детерминированный ГПСЧ, чтобы сказку можно было воспроизвести по seed. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const capitalizeSentences = (s: string) =>
  s.replace(/(^|[.!?]\s+|\n—\s*|\n)([а-яё])/g, (_m, pre: string, ch: string) => pre + ch.toUpperCase());

interface Ctx {
  pack: ThemePack;
  friend: FriendInfo;
  companions: CompanionId[];
}

/** Разрешает маркеры друга и спутников. Маркеры героини ({Name}, {=…|…}) остаются — их подставляет читалка. */
function resolveText(text: string, ctx: Ctx): string {
  const f = ctx.friend;
  const comps = ctx.companions.map(companionById);
  const main = comps[0] ?? companionById('mama');
  const withText = comps.length ? 'вместе с ' + joinRu(comps.map((c) => c.forms.ins)) : '';

  let out = text
    .replace(/\{F(?::(nom|gen|dat|acc|ins))?\}/g, (_m, c?: keyof FriendInfo['forms']) => f.forms[c ?? 'nom'])
    .replace(/\{F=([^|{}]*)\|([^|{}]*)\}/g, (_m, a: string, b: string) => (f.gender === 'f' ? a : b))
    .replace(/\{C(?::(nom|gen|dat|acc|ins))?\}/g, (_m, c?: keyof FriendInfo['forms']) => main.forms[c ?? 'nom'])
    .replace(/\{C=([^|{}]*)\|([^|{}]*)\}/g, (_m, a: string, b: string) => (main.gender === 'f' ? a : b))
    .replace(/\{WITH\}/g, withText);
  out = out.replace(/ {2,}/g, ' ').replace(/ ([,.!?])/g, '$1');
  return capitalizeSentences(out);
}

function joinRu(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return items.slice(0, -1).join(', ') + ' и ' + items[items.length - 1];
}

function buildIllustration(beat: Beat, ctx: Ctx, fallbackTime: IllustrationSpec['time'], outfit: HeroinePlacement['outfit']): IllustrationSpec {
  const props: PropPlacement[] = [...(beat.props ?? [])];
  if (beat.f !== undefined) {
    props.push({
      kind: ctx.friend.prop,
      x: beat.f,
      y: ctx.friend.prop === 'cloud' || ctx.friend.prop === 'dolphin' || ctx.friend.prop === 'bird' ? 62 : 88,
      variant: ctx.friend.variant,
      scale: beat.fscale,
      float: ctx.friend.prop === 'cloud' || ctx.friend.prop === 'dolphin' || ctx.friend.prop === 'bird',
      flip: beat.f > 50,
    });
  }
  if (beat.c) {
    const comps = ctx.companions.length ? ctx.companions : [];
    comps.slice(0, 2).forEach((cid, i) => {
      const c = companionById(cid);
      const small = !c.adult;
      props.push({ kind: c.prop, x: i === 0 ? 16 : 86, y: small ? 90 : 86, scale: small ? 0.8 : 1, flip: i === 1, variant: cid === 'sister' ? 'sister' : undefined });
    });
  }
  const hero: HeroinePlacement | null =
    beat.hero === false
      ? null
      : { pose: beat.hero ?? 'stand', x: beat.hx ?? (beat.f !== undefined && beat.f < 50 ? 60 : 40), y: beat.hy, outfit: beat.outfit ?? outfit };
  return {
    setting: beat.s ?? ctx.pack.setting,
    time: beat.time ?? fallbackTime,
    heroine: hero,
    props,
    fx: beat.fx,
  };
}

export function generateLocalStory(req: StoryRequest, seed = Date.now()): FairyTale {
  const rnd = mulberry32(seed);
  const pack = THEME_PACKS[req.theme];
  let companions = [...req.companions];
  if (req.theme === 'parents') {
    for (const id of ['mama', 'papa'] as CompanionId[]) if (!companions.includes(id)) companions.push(id);
    companions = companions.sort((a, b) => (a === 'mama' ? -1 : b === 'mama' ? 1 : 0));
  }
  const ctx: Ctx = { pack, friend: pack.friend, companions };
  const duration = DURATIONS.find((d) => d.id === req.duration) ?? DURATIONS[1];
  const target = duration.scenes;
  const bedtime = req.mood === 'calm' || req.moral === 'sleep' || req.theme === 'dreams';

  // ——— Собираем последовательность сцен ———
  const opening: Beat[] = [pack.arrival[Math.floor(rnd() * pack.arrival.length)]];
  if (target >= 14) opening.push(pack.world);
  opening.push(pack.meet, pack.problem);

  const moral = MORAL_BEATS[req.moral];
  const closing: Beat[] = [pack.solve];
  if (target >= 12) closing.push(pack.celebrate);
  closing.push(pack.goHome);

  const ending: Beat = buildEnding(bedtime, moral.lesson, pack, companions);

  const fixed = opening.length + closing.length + 2; // + мораль + финал
  let middleCount = Math.max(1, target - fixed);

  const extras: Beat[] = [];
  if (target >= 14) extras.push(MOOD_BEATS[req.mood]);
  if (target >= 18) extras.push(moral.second);
  if (target >= 14 && companions.length) extras.push(COMPANION_BEAT);
  const wishes = WISH_BEATS.filter((w) => w.re.test(req.wishes) && w.skip !== req.theme).map((w) => w.beat);
  const wishBeats = wishes.slice(0, target >= 18 ? 3 : target >= 14 ? 2 : 1);

  const journeyCount = Math.max(0, middleCount - extras.length - wishBeats.length);
  const journey = pickOrdered(pack.journey, journeyCount, rnd);
  while (journey.length < journeyCount) journey.push(FILLER_BEATS[journey.length % FILLER_BEATS.length]);

  // Перемешиваем дополнительные сцены внутри пути, мораль — примерно посередине
  const middle: Beat[] = [...journey];
  for (const b of [...wishBeats, ...extras]) {
    const pos = 1 + Math.floor(rnd() * Math.max(1, middle.length));
    middle.splice(Math.min(pos, middle.length), 0, b);
  }
  const moralPos = Math.max(1, Math.floor(middle.length / 2));
  middle.splice(moralPos, 0, moral.first);
  middleCount = middle.length;

  const all = [...opening, ...middle, ...closing];
  const outfit = pack.outfit;
  const scenes: StoryScene[] = all.map((beat, i) => {
    const progress = i / all.length;
    const fallbackTime = bedtime && progress > 0.6 ? 'sunset' : pack.time;
    return {
      id: `s${i + 1}`,
      text: resolveText(beat.t, ctx),
      illustration: buildIllustration(beat, ctx, fallbackTime, outfit),
    };
  });
  scenes.push({
    id: `s${scenes.length + 1}`,
    text: resolveText(ending.t, ctx),
    illustration: buildIllustration(ending, ctx, bedtime ? 'night' : 'sunset', bedtime ? 'pajamas' : 'default'),
  });

  const themeInfo = THEMES.find((t) => t.id === req.theme)!;
  const tags = new Set<CategoryId>([themeInfo.category]);
  if (bedtime) tags.add('bedtime');
  if (req.mood === 'learning') tags.add('learning');
  if (req.moral === 'kindness' || req.moral === 'sharing') tags.add('kindness');
  if (req.moral === 'family' || companions.some((c) => ['mama', 'papa', 'grandma', 'grandpa'].includes(c))) tags.add('family');
  if (['animals', 'forest'].includes(req.theme)) tags.add('animals');

  const cover = buildIllustration(pack.solve, ctx, pack.time, outfit);
  const moralTitle = MORALS.find((m) => m.id === req.moral)?.title ?? '';

  return {
    id: `gen-${seed.toString(36)}`,
    title: pack.titles[Math.floor(rnd() * pack.titles.length)],
    description: resolveText(pack.description, ctx),
    category: themeInfo.category,
    tags: [...tags],
    cover,
    duration: duration.minutes,
    ageMin: Math.max(2, req.age - 1),
    ageMax: req.age + 3,
    language: 'ru',
    moral: `${moralTitle}. ${moral.lesson}`,
    bedtime,
    source: 'template',
    createdAt: Date.now(),
    scenes,
  };
}

function pickOrdered(pool: Beat[], count: number, rnd: () => number): Beat[] {
  if (count >= pool.length) return [...pool];
  const chosen = new Set(shuffle(pool.map((_, i) => i), rnd).slice(0, count));
  return pool.filter((_, i) => chosen.has(i));
}

function buildEnding(bedtime: boolean, lesson: string, pack: ThemePack, companions: CompanionId[]): Beat {
  const hasFamily = companions.some((c) => COMPANIONS.find((x) => x.id === c)?.adult);
  if (bedtime) {
    return {
      t: `Дома {Name} {=забралась|забрался} в тёплую кроватку. Где-то далеко {F} шептал{F=а|}: «${pack.farewell}» ${lesson} Глазки закрылись сами собой. Спокойной ночи, {Name}. Пусть тебе приснится самая добрая сказка.`,
      s: 'bedroom',
      hero: 'sleep',
      hx: 50,
      fx: ['zzz'],
      props: [{ kind: 'lantern', x: 86, y: 84, glow: true, scale: 0.7 }],
    };
  }
  return {
    t: hasFamily
      ? `Вечером {Name} {=рассказала|рассказал} обо всём, что случилось, а {C} {C=слушала|слушал} и улыбал{C=ась|ся}. ${lesson} А {F} на прощание сказал{F=а|}: «${pack.farewell}» И {Name} {=знала|знал}: впереди ещё много чудесных сказок.`
      : `Вечером {Name} {=вспоминала|вспоминал} этот чудесный день. ${lesson} А {F} на прощание сказал{F=а|}: «${pack.farewell}» И {Name} {=знала|знал}: впереди ещё много чудесных сказок.`,
    s: 'home',
    hero: 'hug',
    hx: 52,
    c: hasFamily,
    props: [{ kind: 'heart', x: 52, y: 34, float: true, scale: 0.7 }],
  };
}
