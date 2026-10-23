// Служебная страница для проверки иллюстраций (только в режиме разработки).
import { useApp } from '../state/AppContext';
import { SceneArt } from '../illustrations/SceneArt';
import { generateLocalStory } from '../generator/localGenerator';
import type { FairyTale, ThemeId } from '../types';

const THEMES: ThemeId[] = ['forest', 'space', 'animals', 'dreams', 'parents', 'kindergarten', 'princess', 'underwater', 'birthday', 'unicorn'];

export default function DevGallery() {
  const { stories, profile, t } = useApp();
  const q = new URLSearchParams(location.search);
  const gen = q.get('gen');
  const list: FairyTale[] = gen
    ? THEMES.map((th, i) => generateLocalStory({ name: 'Коркем', age: 3, gender: 'female', theme: th, mood: 'cozy', duration: 'medium', wishes: 'радуга', companions: ['mama', 'teddy'], moral: (['kindness', 'bravery', 'dark', 'sharing', 'family'] as const)[i % 5] }, 1000 + i))
    : stories.filter((s) => !q.get('id') || s.id === q.get('id'));
  return (
    <div className="p-4">
      {list.map((s) => (
        <section key={s.id} className="mb-8">
          <h2 className="mb-2 text-xl font-bold">{t(s.title, s)}</h2>
          <div className="grid grid-cols-4 gap-2">
            {s.scenes.map((sc, i) => (
              <figure key={sc.id} className="overflow-hidden rounded-lg bg-white text-[10px] leading-tight">
                <div className="aspect-[4/3]"><SceneArt spec={sc.illustration} appearance={profile.appearance} animate={false} className="h-full w-full" /></div>
                <figcaption className="p-1">{i + 1}. {t(sc.text, s)}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
