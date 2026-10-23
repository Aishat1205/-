import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { StoryCard } from '../components/StoryCard';
import { EmptyState, PageHeader, SectionTitle } from '../components/ui';
import { CATEGORIES, categoryById } from '../data/catalog';
import { SceneArt } from '../illustrations/SceneArt';
import type { CategoryId } from '../types';

export function Library() {
  const { stories, generated, t } = useApp();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<CategoryId | 'all'>('all');
  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return stories.filter((s) => (cat === 'all' || s.tags.includes(cat) || s.category === cat) && (!query || t(s.title, s).toLowerCase().includes(query) || t(s.description, s).toLowerCase().includes(query)));
  }, [stories, q, cat, t]);

  return (
    <div>
      <PageHeader title="Библиотека сказок" subtitle={`${stories.length} историй · ${generated.length} созданных`} />
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <label className="glass flex min-h-13 items-center gap-3 rounded-2xl px-4 shadow-soft">
          <Search className="h-5 w-5 text-ink-soft" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Найти сказку" className="h-12 w-full bg-transparent outline-none placeholder:text-ink-soft/70" aria-label="Поиск сказки" />
        </label>
        <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {[{ id: 'all' as const, title: 'Все' }, ...CATEGORIES].map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-bold transition ${cat === c.id ? 'bg-ink text-white' : 'bg-white/80 ring-1 ring-ink/10'}`}
            >
              {c.title}
            </button>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <StoryCard key={s.id} story={s} />
          ))}
        </div>
        {!list.length && (
          <div className="mt-4">
            <EmptyState title="Ничего не нашлось" text="Попробуйте другое слово или создайте новую сказку." action={<Link to="/create" className="inline-flex min-h-12 items-center rounded-2xl bg-ink px-5 font-bold text-white">Создать сказку</Link>} />
          </div>
        )}
      </div>
    </div>
  );
}

export function Categories() {
  const { profile, stories } = useApp();
  return (
    <div>
      <PageHeader back title="Категории" subtitle="Выберите настроение для сказки" />
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 px-4 sm:grid-cols-3 sm:px-6 lg:grid-cols-5">
        {CATEGORIES.map((c) => {
          const n = stories.filter((s) => s.tags.includes(c.id) || s.category === c.id).length;
          return (
            <Link key={c.id} to={`/categories/${c.id}`} className="card-hover relative aspect-[4/5] overflow-hidden rounded-[1.75rem] shadow-soft">
              <SceneArt spec={c.art} appearance={profile.appearance} animate={false} className="absolute inset-0 h-full w-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
              <div className="absolute inset-x-4 bottom-4 text-white">
                <p className="font-serif text-lg leading-tight font-semibold">{c.title}</p>
                <p className="mt-1 text-xs font-semibold text-white/80">{c.subtitle} · {n}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function CategoryPage() {
  const { id } = useParams();
  const { stories } = useApp();
  const c = CATEGORIES.find((x) => x.id === id);
  if (!c) return <PageHeader back title="Категория не найдена" />;
  const list = stories.filter((s) => s.tags.includes(c.id) || s.category === c.id);
  return (
    <div>
      <PageHeader back title={categoryById(c.id).title} subtitle={c.subtitle} />
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {list.length ? (
          <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => (
              <StoryCard key={s.id} story={s} />
            ))}
          </div>
        ) : (
          <EmptyState title="Пока пусто" text="В этой категории ещё нет сказок. Создайте свою!" action={<Link to="/create" className="inline-flex min-h-12 items-center rounded-2xl bg-ink px-5 font-bold text-white">Создать сказку</Link>} />
        )}
        <div className="mt-8">
          <SectionTitle>Другие настроения</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.filter((x) => x.id !== c.id).map((x) => (
              <Link key={x.id} to={`/categories/${x.id}`} className="min-h-11 rounded-full bg-white/80 px-4 py-2.5 text-sm font-bold ring-1 ring-ink/10">
                {x.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
