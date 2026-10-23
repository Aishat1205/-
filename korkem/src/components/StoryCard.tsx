import { Heart, Clock, Sparkles, Wand2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { FairyTale } from '../types';
import { useApp } from '../state/AppContext';
import { SceneArt } from '../illustrations/SceneArt';
import { pluralMinutes } from '../lib/grammar';
import { categoryById } from '../data/catalog';

export function StoryCard({ story, size = 'm' }: { story: FairyTale; size?: 's' | 'm' }) {
  const { t, profile, isFavorite, toggleFavorite, progress } = useApp();
  const fav = isFavorite(story.id);
  const prog = progress[story.id];
  const pct = prog ? Math.round(((prog.currentScene + 1) / story.scenes.length) * 100) : 0;
  return (
    <div className={`card-hover relative overflow-hidden rounded-[1.75rem] bg-white shadow-soft ${size === 's' ? 'w-56 shrink-0' : ''}`}>
      <Link to={`/story/${story.id}`} className="block" aria-label={t(story.title, story)}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <SceneArt spec={story.cover} appearance={profile.appearance} animate={false} className="h-full w-full" label={`Обложка: ${t(story.title, story)}`} />
          {story.source !== 'library' && (
            <span className="glass absolute top-3 left-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold">
              {story.source === 'ai' ? <Sparkles className="h-3.5 w-3.5" /> : <Wand2 className="h-3.5 w-3.5" />}
              {story.source === 'ai' ? 'Создана ИИ' : 'Моя сказка'}
            </span>
          )}
          {prog && !prog.completed && (
            <div className="absolute inset-x-3 bottom-3 h-1.5 overflow-hidden rounded-full bg-white/60">
              <div className="h-full rounded-full bg-[#8a74d8]" style={{ width: `${pct}%` }} />
            </div>
          )}
        </div>
        <div className="p-4 pr-14">
          <p className="text-xs font-bold tracking-wide text-[#8a74d8] uppercase">{categoryById(story.category).title}</p>
          <h3 className="mt-1 font-serif text-[1.08rem] leading-snug font-semibold text-ink">{t(story.title, story)}</h3>
          <p className="mt-2 flex items-center gap-3 text-sm text-ink-soft">
            <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{pluralMinutes(story.duration)}</span>
            {prog?.completed && <span className="font-semibold text-[#3f8a5a]">прочитано</span>}
          </p>
        </div>
      </Link>
      <button
        onClick={() => toggleFavorite(story.id)}
        className={`absolute right-3 bottom-3 grid h-11 w-11 place-items-center rounded-full transition ${fav ? 'bg-rose-soft text-[#d4567a]' : 'bg-cream text-ink-soft'}`}
        aria-label={fav ? 'Убрать из избранного' : 'Добавить в избранное'}
        aria-pressed={fav}
      >
        <Heart className="h-5 w-5" fill={fav ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}
