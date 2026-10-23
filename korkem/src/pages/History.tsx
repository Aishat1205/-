import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, BookOpen, Trash2 } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { ConfirmDialog, EmptyState, PageHeader } from '../components/ui';
import { SceneArt } from '../illustrations/SceneArt';

const fmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

export function History() {
  const { history, getStory, profile, progress, clearHistory, notify } = useApp();
  const [confirm, setConfirm] = useState(false);
  const completed = Object.values(progress).filter((p) => p.completed).length;
  return (
    <div>
      <PageHeader
        back
        title="История чтения"
        subtitle={`Прочитано до конца: ${completed}`}
        right={
          history.length ? (
            <button onClick={() => setConfirm(true)} className="glass grid h-11 w-11 place-items-center rounded-2xl text-[#c24870] shadow-soft" aria-label="Очистить историю">
              <Trash2 className="h-5 w-5" />
            </button>
          ) : null
        }
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {history.length ? (
          <ul className="grid gap-3">
            {history.map((h, i) => {
              const story = getStory(h.storyId);
              const p = progress[h.storyId];
              return (
                <li key={`${h.storyId}-${h.openedAt}-${i}`}>
                  <Link to={story ? `/story/${story.id}` : '#'} className="card-hover flex items-center gap-3 rounded-[1.5rem] bg-white p-3 shadow-soft">
                    <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-cream">
                      {story && <SceneArt spec={story.cover} appearance={profile.appearance} animate={false} className="h-full w-full" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-serif font-semibold">{h.title}</p>
                      <p className="text-sm text-ink-soft">{fmt.format(h.openedAt)}</p>
                    </div>
                    {p?.completed || h.completed ? <CheckCircle2 className="h-6 w-6 shrink-0 text-[#3f8a5a]" aria-label="Прочитано" /> : <BookOpen className="h-6 w-6 shrink-0 text-ink-soft" aria-label="Начато" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState title="История пуста" text="Здесь будут сказки, которые вы открывали." action={<Link to="/library" className="inline-flex min-h-12 items-center rounded-2xl bg-ink px-5 font-bold text-white">Выбрать сказку</Link>} />
        )}
      </div>
      <ConfirmDialog
        open={confirm}
        title="Очистить историю?"
        text="Будут удалены история чтения и сохранённые места в сказках. Сами сказки, избранное и записи голоса останутся."
        confirmLabel="Очистить"
        danger
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          clearHistory();
          setConfirm(false);
          notify('История очищена', 'success');
        }}
      />
    </div>
  );
}
