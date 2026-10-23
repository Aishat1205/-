import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Play, Settings2, Sparkles, History as HistoryIcon } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { SceneArt } from '../illustrations/SceneArt';
import { StoryCard } from '../components/StoryCard';
import { SectionTitle } from '../components/ui';
import { CATEGORIES } from '../data/catalog';
import { LIBRARY } from '../data/stories';
import { pluralMinutes, pluralScenes } from '../lib/grammar';
import type { FairyTale, IllustrationSpec } from '../types';

const HERO_SPEC: IllustrationSpec = {
  setting: 'dreamland',
  time: 'night',
  heroine: { pose: 'wave', x: 66, y: 88 },
  props: [
    { kind: 'star', x: 84, y: 40, glow: true, float: true, scale: 0.8 },
    { kind: 'bunny', x: 84, y: 90, scale: 0.9, flip: true },
  ],
  fx: ['sparkles', 'fireflies'],
};

export function storyOfTheDay(): FairyTale {
  const day = Math.floor(Date.now() / 86_400_000);
  const evening = new Date().getHours() >= 19 || new Date().getHours() < 5;
  const pool = evening ? LIBRARY.filter((s) => s.bedtime) : LIBRARY;
  return pool[day % pool.length];
}

export function Home() {
  const { t, profile, lastStoryId, getStory, progress, stories, reducedMotion } = useApp();
  const nav = useNavigate();
  const last = lastStoryId ? getStory(lastStoryId) : undefined;
  const lastProg = last ? progress[last.id] : undefined;
  const daily = storyOfTheDay();
  const hour = new Date().getHours();
  const greeting = hour < 5 ? 'Доброй ночи' : hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер';

  const start = () => {
    if (last && lastProg && !lastProg.completed) nav(`/read/${last.id}?listen=1`);
    else nav(`/read/${daily.id}?listen=1`);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <div className="pt-safe flex items-center justify-between pt-3 pb-3">
        <div>
          <p className="text-sm font-bold text-ink-soft">{greeting}!</p>
          <p className="font-serif text-lg font-semibold">{t('{Name}')}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/history" className="glass grid h-11 w-11 place-items-center rounded-2xl shadow-soft" aria-label="История чтения">
            <HistoryIcon className="h-5 w-5" />
          </Link>
          <Link to="/settings" className="glass grid h-11 w-11 place-items-center rounded-2xl shadow-soft" aria-label="Настройки">
            <Settings2 className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Герой-блок */}
      <motion.section
        initial={reducedMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-[2.2rem] shadow-lift"
      >
        <div className="aspect-[4/5] sm:aspect-[16/8]">
          <SceneArt spec={HERO_SPEC} appearance={profile.appearance} animate={!reducedMotion} className="h-full w-full" label="Героиня в волшебной стране" />
        </div>
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-[#141a43]/80 via-[#141a43]/35 to-transparent p-6 pb-20 text-white sm:max-w-[60%] sm:bg-gradient-to-r sm:p-10">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wide uppercase backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Личная библиотека сказок
          </p>
          <h1 className="mt-3 font-serif text-[1.9rem] leading-[1.15] font-semibold sm:text-[2.6rem]">{t('Добро пожаловать в волшебный мир {Name:gen}!')}</h1>
          <p className="mt-3 max-w-md text-[1.02rem] text-white/85">{t('Каждый день — новая история, в которой ты {=главная героиня|главный герой}.')}</p>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          <button onClick={start} className="inline-flex min-h-14 items-center gap-3 rounded-full bg-white px-6 text-[1.05rem] font-extrabold text-ink shadow-lift transition active:scale-95">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#8a74d8] to-[#e58db0] text-white">
              <Play className="h-4 w-4" fill="currentColor" />
            </span>
            Начать сказку
          </button>
        </div>
      </motion.section>

      {/* Продолжить */}
      <section className="mt-8">
        <SectionTitle>Продолжить приключение</SectionTitle>
        {last && lastProg ? (
          <Link to={`/read/${last.id}`} className="card-hover flex items-center gap-4 rounded-[1.75rem] bg-white p-3 shadow-soft">
            <div className="h-24 w-28 shrink-0 overflow-hidden rounded-[1.25rem] sm:h-28 sm:w-36">
              <SceneArt spec={last.scenes[Math.min(lastProg.currentScene, last.scenes.length - 1)].illustration} appearance={profile.appearance} animate={false} className="h-full w-full" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-serif text-lg leading-snug font-semibold">{t(last.title, last)}</h3>
              <p className="mt-1 text-sm text-ink-soft">
                {lastProg.completed ? 'Прочитано до конца — можно послушать ещё раз' : `Сцена ${lastProg.currentScene + 1} из ${last.scenes.length}`}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-lavender-soft">
                <div className="h-full rounded-full bg-gradient-to-r from-[#8a74d8] to-[#e58db0]" style={{ width: `${((lastProg.currentScene + 1) / last.scenes.length) * 100}%` }} />
              </div>
            </div>
            <span className="mr-2 grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink text-white">
              <Play className="h-5 w-5" fill="currentColor" />
            </span>
          </Link>
        ) : (
          <div className="rounded-[1.75rem] bg-white/70 p-5 text-ink-soft shadow-soft">Здесь появится сказка, которую вы начнёте читать. Чтение сохраняется автоматически.</div>
        )}
      </section>

      {/* Сказка дня */}
      <section className="mt-8">
        <SectionTitle>Сказка дня</SectionTitle>
        <Link to={`/story/${daily.id}`} className="card-hover grid overflow-hidden rounded-[2rem] bg-white shadow-soft sm:grid-cols-2">
          <div className="aspect-[16/10] sm:aspect-auto sm:h-full">
            <SceneArt spec={daily.cover} appearance={profile.appearance} animate={!reducedMotion} className="h-full w-full" />
          </div>
          <div className="p-5 sm:p-7">
            <p className="text-xs font-bold tracking-wide text-[#8a74d8] uppercase">{daily.bedtime ? 'Для вечернего чтения' : 'Рекомендуем сегодня'}</p>
            <h3 className="mt-1 font-serif text-2xl leading-tight font-semibold">{t(daily.title, daily)}</h3>
            <p className="mt-2 text-ink-soft">{t(daily.description, daily)}</p>
            <p className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-ink-soft">
              <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {pluralMinutes(daily.duration)}</span>
              <span className="inline-flex items-center gap-1"><BookOpen className="h-4 w-4" /> {pluralScenes(daily.scenes.length)}</span>
            </p>
          </div>
        </Link>
      </section>

      {/* Настроение */}
      <section className="mt-8">
        <SectionTitle action={<Link to="/categories" className="text-sm font-bold text-[#8a74d8]">Все</Link>}>Выбери настроение</SectionTitle>
        <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
          {CATEGORIES.map((c) => (
            <Link key={c.id} to={`/categories/${c.id}`} className="card-hover relative h-36 w-32 shrink-0 snap-start overflow-hidden rounded-[1.5rem] shadow-soft sm:w-auto">
              <SceneArt spec={c.art} appearance={profile.appearance} animate={false} className="absolute inset-0 h-full w-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <span className="absolute inset-x-3 bottom-3 text-[0.92rem] leading-tight font-extrabold text-white drop-shadow">{c.title}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Библиотека */}
      <section className="mt-8 mb-4">
        <SectionTitle action={<Link to="/library" className="text-sm font-bold text-[#8a74d8]">Открыть</Link>}>Моя библиотека</SectionTitle>
        <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3">
          {stories.slice(0, 6).map((s) => (
            <StoryCard key={s.id} story={s} />
          ))}
        </div>
        {stories.length > 6 && (
          <Link to="/library" className="mt-4 flex min-h-12 items-center justify-center rounded-2xl bg-white/80 font-bold shadow-soft">
            Все сказки ({stories.length})
          </Link>
        )}
      </section>
    </div>
  );
}
