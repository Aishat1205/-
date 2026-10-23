import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Info, Sparkles, Wand2 } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { PageHeader, Segmented } from '../components/ui';
import { COMPANIONS, DURATIONS, MOODS, MORALS, THEMES } from '../data/catalog';
import { SceneArt } from '../illustrations/SceneArt';
import { aiGenerator, templateGenerator } from '../services/storyGenerator';
import { declineName, normalizeName } from '../lib/grammar';
import type { CompanionId, DurationId, FairyTale, Gender, MoodId, MoralId, StoryRequest, ThemeId } from '../types';

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-2xl px-4 py-2 text-[0.95rem] font-bold transition ${active ? 'bg-ink text-white shadow-soft' : 'bg-white/85 ring-1 ring-ink/10 hover:bg-white'}`}
    >
      {active && <Check className="h-4 w-4" />}
      {children}
    </button>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.75rem] bg-white/75 p-5 shadow-soft">
      <h2 className="font-serif text-lg font-semibold">{label}</h2>
      {hint && <p className="mt-0.5 text-sm text-ink-soft">{hint}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function Create() {
  const { profile, settings, serverStatus, addGenerated, notify, reducedMotion } = useApp();
  const nav = useNavigate();
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age);
  const [gender, setGender] = useState<Gender>(profile.gender);
  const [theme, setTheme] = useState<ThemeId>('forest');
  const [mood, setMood] = useState<MoodId>('cozy');
  const [duration, setDuration] = useState<DurationId>('short');
  const [wishes, setWishes] = useState('');
  const [companions, setCompanions] = useState<CompanionId[]>(['mama']);
  const [moral, setMoral] = useState<MoralId>('kindness');
  const [busy, setBusy] = useState(false);

  const useAi = settings.aiEnabled && serverStatus.story;
  const themeInfo = THEMES.find((x) => x.id === theme)!;

  const toggleCompanion = (id: CompanionId) => setCompanions((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 4 ? c : [...c, id]));

  const submit = async () => {
    if (busy) return;
    const cleanName = normalizeName(name) || profile.name;
    const req: StoryRequest = { name: cleanName, age, gender, theme, mood, duration, wishes: wishes.trim().slice(0, 300), companions, moral };
    setBusy(true);
    let story: FairyTale;
    try {
      if (useAi) {
        try {
          story = await aiGenerator.generate(req);
        } catch (e) {
          notify(`${e instanceof Error ? e.message : 'AI недоступен'} Сказка собрана из локальных шаблонов.`, 'error');
          story = await templateGenerator.generate(req);
        }
      } else {
        story = await templateGenerator.generate(req);
      }
      // Сказка для другого имени — запоминаем своё имя героя
      if (cleanName !== profile.name || gender !== profile.gender) {
        story = { ...story, hero: { gender, forms: declineName(cleanName, gender) } };
      }
      await addGenerated(story);
      notify(story.source === 'ai' ? 'Сказка готова! Текст создан AI.' : 'Сказка готова!', 'success');
      nav(`/story/${story.id}`);
    } catch {
      notify('Не получилось создать сказку. Попробуйте ещё раз.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader title="Создать сказку" subtitle="Персональная история за минуту" />
      <div className="mx-auto grid max-w-5xl gap-4 px-4 sm:px-6 lg:grid-cols-[1fr_340px]">
        <div className="grid gap-4">
          <Field label="Главный герой">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="block">
                <span className="text-sm font-bold text-ink-soft">Имя</span>
                <input value={name} onChange={(e) => setName(e.target.value)} maxLength={30} className="mt-1 min-h-12 w-full rounded-2xl bg-cream px-4 font-bold ring-1 ring-ink/10 outline-none focus:ring-2 focus:ring-[#8a74d8]" />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-ink-soft">Возраст</span>
                <div className="mt-1 flex items-center gap-2">
                  <button type="button" onClick={() => setAge((a) => Math.max(1, a - 1))} className="grid h-12 w-12 place-items-center rounded-2xl bg-cream text-xl font-bold ring-1 ring-ink/10" aria-label="Меньше">−</button>
                  <span className="w-16 text-center text-lg font-extrabold tabular-nums">{age} {age === 1 ? 'год' : age < 5 ? 'года' : 'лет'}</span>
                  <button type="button" onClick={() => setAge((a) => Math.min(10, a + 1))} className="grid h-12 w-12 place-items-center rounded-2xl bg-cream text-xl font-bold ring-1 ring-ink/10" aria-label="Больше">+</button>
                </div>
              </label>
            </div>
            <div className="mt-3">
              <Segmented ariaLabel="Пол героя" value={gender} onChange={setGender} options={[{ id: 'female', label: 'Девочка' }, { id: 'male', label: 'Мальчик' }]} />
            </div>
          </Field>

          <Field label="Тема сказки">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {THEMES.map((th) => (
                <button key={th.id} type="button" onClick={() => setTheme(th.id)} aria-pressed={theme === th.id} className={`relative overflow-hidden rounded-2xl text-left transition ${theme === th.id ? 'ring-4 ring-[#8a74d8]' : 'ring-1 ring-ink/10'}`}>
                  <div className="aspect-[4/3]">
                    <SceneArt spec={th.art} appearance={profile.appearance} animate={false} className="h-full w-full" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute inset-x-2.5 bottom-2 text-sm leading-tight font-extrabold text-white">{th.title}</span>
                  {theme === th.id && <span className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-white text-[#8a74d8]"><Check className="h-4 w-4" /></span>}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Настроение">
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <Chip key={m.id} active={mood === m.id} onClick={() => setMood(m.id)}>{m.title}</Chip>
              ))}
            </div>
          </Field>

          <Field label="Продолжительность">
            <div className="grid grid-cols-3 gap-2">
              {DURATIONS.map((d) => (
                <button key={d.id} type="button" onClick={() => setDuration(d.id)} aria-pressed={duration === d.id} className={`min-h-16 rounded-2xl px-2 py-2 transition ${duration === d.id ? 'bg-ink text-white shadow-soft' : 'bg-white/85 ring-1 ring-ink/10'}`}>
                  <span className="block font-extrabold">{d.title}</span>
                  <span className="block text-xs opacity-75">{d.hint} · {d.scenes} сцен</span>
                </button>
              ))}
            </div>
          </Field>

          <Field label="Кто будет в сказке" hint="Можно выбрать до четырёх">
            <div className="flex flex-wrap gap-2">
              {COMPANIONS.map((c) => (
                <Chip key={c.id} active={companions.includes(c.id)} onClick={() => toggleCompanion(c.id)}>{c.title}</Chip>
              ))}
            </div>
          </Field>

          <Field label="Чему научит сказка">
            <div className="flex flex-wrap gap-2">
              {MORALS.map((m) => (
                <Chip key={m.id} active={moral === m.id} onClick={() => setMoral(m.id)}>{m.title}</Chip>
              ))}
            </div>
          </Field>

          <Field label="Дополнительные пожелания" hint={useAi ? 'Текст пожеланий будет отправлен AI-сервису (без имени ребёнка).' : 'В локальном режиме учитываются слова: радуга, бабочки, дождик, снег, рыбки, котик, щенок, цветы, торт, шарики, звёзды, единорог, ракета.'}>
            <textarea value={wishes} onChange={(e) => setWishes(e.target.value)} maxLength={300} rows={3} placeholder="Например: чтобы была радуга и бабочки" className="w-full resize-none rounded-2xl bg-cream p-4 ring-1 ring-ink/10 outline-none focus:ring-2 focus:ring-[#8a74d8]" />
            <p className="mt-1 text-right text-xs text-ink-soft">{wishes.length}/300</p>
          </Field>
        </div>

        {/* Итог и кнопка */}
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-lift">
            <div className="aspect-[4/3]">
              <SceneArt spec={{ ...themeInfo.art, heroine: { pose: 'wave', x: 34, outfit: theme === 'dreams' ? 'pajamas' : theme === 'space' ? 'space' : theme === 'princess' ? 'princess' : theme === 'birthday' ? 'party' : 'default' }, props: (themeInfo.art.props ?? []).map((p) => ({ ...p, x: 70 })) }} appearance={profile.appearance} animate={!reducedMotion} className="h-full w-full" />
            </div>
            <div className="p-5">
              <p className="font-serif text-lg font-semibold">{normalizeName(name) || profile.name}: {themeInfo.title.toLowerCase()}</p>
              <p className="mt-1 text-sm text-ink-soft">
                {MOODS.find((m) => m.id === mood)?.title} · {DURATIONS.find((d) => d.id === duration)?.hint} · {MORALS.find((m) => m.id === moral)?.title.toLowerCase()}
              </p>
              <div className={`mt-4 flex gap-2 rounded-2xl p-3 text-sm ${useAi ? 'bg-lavender-soft' : 'bg-cream'}`}>
                {useAi ? <Sparkles className="h-5 w-5 shrink-0 text-[#8a74d8]" /> : <Info className="h-5 w-5 shrink-0 text-ink-soft" />}
                <span>
                  {useAi
                    ? 'Текст напишет AI на сервере. Имя ребёнка не отправляется — оно подставится на устройстве.'
                    : serverStatus.story
                      ? 'Сказка будет собрана на устройстве из локальных шаблонов. AI можно включить в настройках.'
                      : 'Сказка будет собрана на устройстве из локальных шаблонов — без интернета и AI.'}
                </span>
              </div>
              <button onClick={submit} disabled={busy} className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7d68d0] to-[#d97ba3] text-[1.05rem] font-extrabold text-white shadow-lift transition active:scale-[0.98] disabled:opacity-70">
                <Wand2 className="h-5 w-5" /> Создать мою сказку
              </button>
            </div>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {busy && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-[#15123a]/85 p-6 text-center text-white backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="status" aria-live="polite">
            <div>
              <motion.div className="mx-auto h-28 w-28" animate={reducedMotion ? {} : { rotate: 360 }} transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}>
                <svg viewBox="0 0 100 100" aria-hidden>
                  {Array.from({ length: 8 }, (_, i) => (
                    <path key={i} transform={`rotate(${i * 45} 50 50) translate(50 12)`} d="M0 -6 L1.6 -1.6 L6 0 L1.6 1.6 L0 6 L-1.6 1.6 L-6 0 L-1.6 -1.6 Z" fill={i % 2 ? '#F6C76B' : '#F2A0BE'} />
                  ))}
                  <circle cx="50" cy="50" r="16" fill="#B9A2E8" opacity="0.5" />
                </svg>
              </motion.div>
              <p className="mt-6 font-serif text-2xl">Сочиняем сказку…</p>
              <p className="mt-2 text-white/70">{useAi ? 'AI пишет историю. Обычно это занимает до минуты.' : 'Собираем сцены и иллюстрации'}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
