import { Link } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { StoryCard } from '../components/StoryCard';
import { EmptyState, PageHeader } from '../components/ui';

export function Favorites() {
  const { favorites, getStory } = useApp();
  const list = favorites.map((f) => getStory(f.storyId)).filter((s) => !!s);
  return (
    <div>
      <PageHeader title="Избранное" subtitle="Самые любимые сказки" />
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {list.length ? (
          <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => (
              <StoryCard key={s!.id} story={s!} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Пока нет любимых сказок"
            text="Нажмите на сердечко на обложке, и сказка появится здесь."
            action={<Link to="/library" className="inline-flex min-h-12 items-center rounded-2xl bg-ink px-5 font-bold text-white">Открыть библиотеку</Link>}
          />
        )}
      </div>
    </div>
  );
}
