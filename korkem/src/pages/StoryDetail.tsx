import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BookOpen, Clock, Headphones, Heart, Mic, Play, RotateCcw, Sparkles, Trash2, Wand2, Baby } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { SceneArt } from '../illustrations/SceneArt';
import { ConfirmDialog, PageHeader } from '../components/ui';
import { categoryById } from '../data/catalog';
import { pluralMinutes, pluralScenes } from '../lib/grammar';
import { listRecordings } from '../services/recorder';

export function StoryDetail() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const { getStory, t, profile, progress, isFavorite, toggleFavorite, removeGenerated, saveProgress, reducedMotion, notify } = useApp();
  const story = getStory(id);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [recCount, setRecCount] = useState(0);

  useEffect(() => {
    listRecordings().then((keys) => setRecCount(keys.filter((k) => k.startsWith(`${id}::`)).length));
  }, [id]);

  if (!story) {
    return (
      <div>
        <PageHeader back title="Сказка не найдена" subtitle="Возможно, она была удалена." />
      </div>
    );
  }
  const prog = progress[story.id];
  const inProgress = prog && !prog.completed && prog.currentScene > 0;
  const fav = isFavorite(story.id);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader back title="" />
      <div className="px-4 sm:px-6">
        <div className="overflow-hidden rounded-[2.2rem] bg-white shadow-lift lg:grid lg:grid-cols-[1.2fr_1fr]">
          <div className="aspect-[4/3] lg:aspect-auto lg:h-full">
            <SceneArt spec={story.cover} appearance={profile.appearance} animate={!reducedMotion} className="h-full w-full" />
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-xs font-bold tracking-wide text-[#8a74d8] uppercase">{categoryById(story.category).title}</p>
            <h1 className="mt-1 font-serif text-[1.9rem] leading-tight font-semibold">{t(story.title, story)}</h1>
            <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-soft">{t(story.description, story)}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1.5"><Clock className="h-4 w-4" />{pluralMinutes(story.duration)}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1.5"><BookOpen className="h-4 w-4" />{pluralScenes(story.scenes.length)}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1.5"><Baby className="h-4 w-4" />{story.ageMin}–{story.ageMax} лет</span>
              {recCount > 0 && <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-soft px-3 py-1.5"><Mic className="h-4 w-4" />Голос родителя: {recCount}</span>}
            </div>
            {story.moral && <p className="mt-4 rounded-2xl bg-lavender-soft/70 px-4 py-3 font-serif text-[1.02rem] italic">«{t(story.moral, story)}»</p>}
            {story.source !== 'library' && (
              <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-ink-soft">
                {story.source === 'ai' ? <Sparkles className="h-4 w-4" /> : <Wand2 className="h-4 w-4" />}
                {story.source === 'ai' ? 'Текст создан AI-моделью на сервере' : 'Собрана на устройстве из локальных шаблонов'}
              </p>
            )}

            <div className="mt-6 grid gap-3">
              <button onClick={() => nav(`/read/${story.id}`)} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7d68d0] to-[#d97ba3] text-[1.05rem] font-extrabold text-white shadow-lift active:scale-[0.98]">
                <Play className="h-5 w-5" fill="currentColor" />
                {inProgress ? `Продолжить со сцены ${prog.currentScene + 1}` : 'Читать сказку'}
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => nav(`/read/${story.id}?listen=1${inProgress ? '' : '&scene=0'}`)} className="flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-white font-bold ring-1 ring-ink/10">
                  <Headphones className="h-5 w-5" /> Слушать
                </button>
                <button onClick={() => toggleFavorite(story.id)} className={`flex min-h-13 items-center justify-center gap-2 rounded-2xl font-bold ring-1 ${fav ? 'bg-rose-soft text-[#c24870] ring-transparent' : 'bg-white ring-ink/10'}`} aria-pressed={fav}>
                  <Heart className="h-5 w-5" fill={fav ? 'currentColor' : 'none'} /> {fav ? 'В избранном' : 'В избранное'}
                </button>
                {prog && (
                  <button
                    onClick={() => {
                      saveProgress(story.id, 0);
                      nav(`/read/${story.id}?scene=0`);
                    }}
                    className="flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-white font-bold ring-1 ring-ink/10"
                  >
                    <RotateCcw className="h-5 w-5" /> Сначала
                  </button>
                )}
                <Link to={`/record/${story.id}`} className="flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-white font-bold ring-1 ring-ink/10">
                  <Mic className="h-5 w-5" /> Папа читает
                </Link>
              </div>
              {story.source !== 'library' && (
                <button onClick={() => setConfirmDelete(true)} className="mt-1 inline-flex min-h-11 items-center justify-center gap-2 text-sm font-bold text-[#c24870]">
                  <Trash2 className="h-4 w-4" /> Удалить эту сказку
                </button>
              )}
            </div>
          </div>
        </div>

        <h2 className="mt-8 mb-3 font-serif text-xl font-semibold">Сцены</h2>
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
          {story.scenes.map((s, i) => (
            <Link key={s.id} to={`/read/${story.id}?scene=${i}`} className="card-hover w-40 shrink-0 overflow-hidden rounded-2xl bg-white shadow-soft">
              <div className="aspect-[4/3]">
                <SceneArt spec={s.illustration} appearance={profile.appearance} animate={false} className="h-full w-full" />
              </div>
              <p className="px-3 py-2 text-xs font-bold text-ink-soft">Сцена {i + 1}</p>
            </Link>
          ))}
        </div>
      </div>
      <ConfirmDialog
        open={confirmDelete}
        title="Удалить сказку?"
        text="Созданная сказка будет удалена с этого устройства. Это действие нельзя отменить."
        confirmLabel="Удалить"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await removeGenerated(story.id);
          notify('Сказка удалена', 'success');
          nav('/library', { replace: true });
        }}
      />
    </div>
  );
}
