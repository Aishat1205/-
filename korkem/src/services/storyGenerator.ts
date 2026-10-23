import type { FairyTale, IllustrationSpec, Pose, PropKind, PropPlacement, StoryRequest } from '../types';
import { generateLocalStory } from '../generator/localGenerator';
import { COMPANIONS, DURATIONS, MOODS, MORALS, THEMES } from '../data/catalog';

/** Общий интерфейс генераторов сказок. */
export interface StoryGenerator {
  readonly id: 'template' | 'ai';
  readonly label: string;
  generate(req: StoryRequest): Promise<FairyTale>;
}

export interface ServerStatus {
  story: boolean;
  illustration: boolean;
  model: string | null;
  /** Провайдер живого голоса на сервере или null */
  tts: string | null;
}

/** Проверяет, настроен ли серверный AI. Если сервера нет — AI просто недоступен. */
export async function fetchServerStatus(): Promise<ServerStatus> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const r = await fetch('/api/status', { signal: ctrl.signal, cache: 'no-store' });
    clearTimeout(t);
    if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) throw new Error();
    const j = (await r.json()) as ServerStatus;
    return { story: !!j.story, illustration: !!j.illustration, model: j.model ?? null, tts: j.tts ?? null };
  } catch {
    return { story: false, illustration: false, model: null, tts: null };
  }
}

export const templateGenerator: StoryGenerator = {
  id: 'template',
  label: 'Локальные шаблоны',
  async generate(req) {
    // Небольшая пауза, чтобы анимация «волшебства» успела проиграться
    await new Promise((r) => setTimeout(r, 900));
    return generateLocalStory(req);
  },
};

interface AiScene {
  text: string;
  setting: IllustrationSpec['setting'];
  time: IllustrationSpec['time'];
  pose: Pose | 'none';
  props: PropKind[];
  fx: NonNullable<IllustrationSpec['fx']>;
}

const FLOATING: PropKind[] = ['star', 'butterfly', 'bird', 'cloud', 'comet', 'balloons', 'moonface', 'heart', 'planet', 'rocket', 'dolphin', 'fish', 'crown', 'key', 'rainbow'];

function layoutProps(kinds: PropKind[], heroX: number | null): PropPlacement[] {
  const slots = heroX == null ? [30, 70, 50, 86] : heroX < 50 ? [66, 84, 20, 52] : [30, 14, 76, 48];
  return kinds.map((kind, i) => {
    const floats = FLOATING.includes(kind);
    return { kind, x: slots[i % slots.length], y: floats ? (kind === 'rainbow' ? 70 : 42 + i * 6) : 88, float: floats && kind !== 'rainbow', flip: slots[i % slots.length] > 50 };
  });
}

export const aiGenerator: StoryGenerator = {
  id: 'ai',
  label: 'AI-генерация',
  async generate(req) {
    // Имя ребёнка НЕ отправляется: модель пишет текст с маркерами, имя подставляется на устройстве.
    const payload = {
      age: req.age,
      gender: req.gender,
      theme: THEMES.find((t) => t.id === req.theme)?.title,
      mood: MOODS.find((m) => m.id === req.mood)?.title,
      duration: req.duration,
      moral: MORALS.find((m) => m.id === req.moral)?.title,
      companions: req.companions.map((c) => COMPANIONS.find((x) => x.id === c)?.title ?? c),
      wishes: req.wishes.slice(0, 300),
    };
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 120_000);
    let res: Response;
    try {
      res = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });
    } catch {
      throw new Error('Нет связи с сервером AI. Проверьте интернет.');
    } finally {
      clearTimeout(timer);
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Сервер AI вернул ошибку');
    const d = data as { title: string; description: string; scenes: AiScene[] };
    const theme = THEMES.find((t) => t.id === req.theme)!;
    const duration = DURATIONS.find((x) => x.id === req.duration)!;
    const id = `ai-${Date.now().toString(36)}`;
    const scenes = d.scenes.map((s, i) => {
      const heroX = s.pose === 'none' ? null : 40;
      return {
        id: `s${i + 1}`,
        text: s.text,
        illustration: {
          setting: s.setting,
          time: s.time,
          heroine: heroX == null ? null : { pose: s.pose as Pose, x: heroX, outfit: s.setting === 'bedroom' && s.time === 'night' ? ('pajamas' as const) : undefined },
          props: layoutProps(s.props, heroX),
          fx: s.fx,
        },
      };
    });
    return {
      id,
      title: d.title.includes('{Name}') ? d.title : `{Name}: ${d.title}`,
      description: d.description,
      category: theme.category,
      tags: [theme.category, ...(req.mood === 'calm' ? (['bedtime'] as const) : [])],
      cover: scenes[Math.floor(scenes.length / 2)]?.illustration ?? theme.art,
      duration: duration.minutes,
      ageMin: Math.max(2, req.age - 1),
      ageMax: req.age + 3,
      language: 'ru',
      moral: MORALS.find((m) => m.id === req.moral)?.title,
      bedtime: req.mood === 'calm' || req.moral === 'sleep',
      source: 'ai',
      createdAt: Date.now(),
      scenes,
    };
  },
};
