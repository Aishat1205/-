/**
 * Серверная AI-генерация сказок через Claude API.
 * Ключ берётся только из переменной окружения ANTHROPIC_API_KEY на сервере
 * и никогда не попадает в клиентский код.
 *
 * Приватность: имя ребёнка на сервер не отправляется. Модель пишет текст
 * с маркерами {Name}, {Name:dat}, {=она|он}, а имя подставляется на устройстве.
 */
import Anthropic from '@anthropic-ai/sdk';

export const MODEL = process.env.STORY_MODEL || 'claude-opus-5-5';

export interface AiStoryRequest {
  age: number;
  gender: 'female' | 'male';
  theme: string;
  mood: string;
  duration: 'short' | 'medium' | 'long';
  moral: string;
  companions: string[];
  wishes: string;
}

const SETTINGS = ['bedroom', 'forest', 'meadow', 'sky', 'space', 'moon', 'castle', 'home', 'garden', 'party', 'dreamland', 'underwater', 'kindergarten', 'lake'];
const TIMES = ['day', 'sunset', 'night', 'dawn'];
const POSES = ['stand', 'wave', 'walk', 'sit', 'sleep', 'reach', 'hug', 'jump', 'think'];
const PROPS = ['star', 'bunny', 'unicorn', 'owl', 'fox', 'bear', 'hedgehog', 'squirrel', 'butterfly', 'bird', 'fish', 'turtle', 'dolphin', 'cat', 'puppy', 'teddy', 'doll', 'mama', 'papa', 'grandma', 'grandpa', 'sibling', 'rocket', 'planet', 'comet', 'cake', 'balloons', 'gift', 'lantern', 'flowers', 'mushroom', 'carrot', 'basket', 'book', 'rainbow', 'bridge', 'crown', 'key', 'shell', 'cloud', 'moonface', 'tree', 'apple', 'cup', 'blocks', 'heart', 'snail', 'frog', 'pillow'];
const FX = ['fireflies', 'sparkles', 'snow', 'bubbles', 'petals', 'confetti', 'rain', 'zzz'];

const SCENE_COUNT = { short: 10, medium: 14, long: 18 } as const;

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'description', 'scenes'],
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    scenes: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['text', 'setting', 'time', 'pose', 'props', 'fx'],
        properties: {
          text: { type: 'string' },
          setting: { type: 'string', enum: SETTINGS },
          time: { type: 'string', enum: TIMES },
          pose: { type: 'string', enum: [...POSES, 'none'] },
          props: { type: 'array', items: { type: 'string', enum: PROPS } },
          fx: { type: 'array', items: { type: 'string', enum: FX } },
        },
      },
    },
  },
} as const;

const SYSTEM = `Ты — бережный детский писатель. Пишешь добрые сказки на русском языке для малышей.
Главный герой — ребёнок. Его имя НЕ называй: вместо имени всегда пиши маркеры:
{Name} — именительный падеж, {Name:gen}, {Name:dat}, {Name:acc}, {Name:ins}, {Name:pre} — другие падежи.
Для слов, которые зависят от пола героя, пиши {=вариант для девочки|вариант для мальчика}, например: «{Name} {=увидела|увидел} звёздочку», «{=она|он}».
Не вставляй маркер имени в каждое предложение — используй и местоимения.
Правила:
- Простые короткие предложения и понятные слова для возраста ребёнка.
- Никаких страшных сцен, насилия, жестокости, опасных действий и инструкций (огонь, вода без взрослых, лекарства, незнакомцы).
- Структура: знакомство с героем и миром → интересное событие → небольшая проблема → безопасное решение (помощь друзьям или самостоятельность) → счастливый финал → тёплый заключительный абзац.
- Каждая сцена — 2–4 предложения, не больше 420 символов. Диалоги оформляй через тире с новой строки (\\n— ...).
- Для каждой сцены выбери обстановку, время суток, позу героя (или none) и 1–4 предмета/персонажа из списков, соответствующих событиям сцены.
- Если сказка перед сном — финал особенно тихий и спокойный.`;

function friendlyError(e: unknown): string {
  if (e instanceof Anthropic.AuthenticationError) return 'Неверный ключ AI на сервере. Проверьте ANTHROPIC_API_KEY.';
  if (e instanceof Anthropic.RateLimitError) return 'AI сейчас перегружен запросами. Попробуйте через минуту.';
  if (e instanceof Anthropic.APIConnectionError) return 'Сервер не может связаться с AI-сервисом.';
  if (e instanceof Anthropic.APIError) return 'AI-сервис временно недоступен.';
  return 'Ошибка AI-генерации.';
}

export function isConfigured() {
  return !!process.env.ANTHROPIC_API_KEY;
}

function clampText(s: unknown, max: number) {
  return String(s ?? '').replace(/<[^>]*>/g, '').slice(0, max).trim();
}

export function validateRequest(body: unknown): AiStoryRequest {
  const b = (body ?? {}) as Record<string, unknown>;
  const duration = (['short', 'medium', 'long'] as const).includes(b.duration as 'short') ? (b.duration as AiStoryRequest['duration']) : 'medium';
  return {
    age: Math.min(10, Math.max(1, Number(b.age) || 3)),
    gender: b.gender === 'male' ? 'male' : 'female',
    theme: clampText(b.theme, 80),
    mood: clampText(b.mood, 40),
    duration,
    moral: clampText(b.moral, 60),
    companions: Array.isArray(b.companions) ? b.companions.slice(0, 6).map((c) => clampText(c, 40)) : [],
    wishes: clampText(b.wishes, 300),
  };
}

export async function generateStory(req: AiStoryRequest) {
  const client = new Anthropic();
  const count = SCENE_COUNT[req.duration];
  const user = `Напиши сказку из ровно ${count} сцен.
Возраст ребёнка: ${req.age}. Пол: ${req.gender === 'female' ? 'девочка' : 'мальчик'}.
Тема: ${req.theme}. Настроение: ${req.mood}. Мораль или навык: ${req.moral}.
Второстепенные персонажи: ${req.companions.length ? req.companions.join(', ') : 'нет'}.
Пожелания родителя: ${req.wishes || 'нет'}.
Название тоже пиши с маркером {Name}, например «{Name} и …».`;

  const response = await client.beta.messages
    .create({
    model: MODEL,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    thinking: { type: 'adaptive' },
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: SCHEMA as unknown as Record<string, unknown> } },
    system: SYSTEM,
    messages: [{ role: 'user', content: user }],
    })
    .catch((e: unknown) => {
      throw new Error(friendlyError(e));
    });

  if (response.stop_reason === 'refusal') throw new Error('Модель отказалась создавать эту сказку. Попробуйте изменить пожелания.');
  if (response.stop_reason === 'max_tokens') throw new Error('Сказка получилась слишком длинной. Попробуйте выбрать меньшую продолжительность.');
  const text = response.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('');
  const parsed = JSON.parse(text) as { title: string; description: string; scenes: Array<{ text: string; setting: string; time: string; pose: string; props: string[]; fx: string[] }> };
  if (!parsed.scenes?.length) throw new Error('Пустой ответ модели');

  return {
    title: clampText(parsed.title, 80),
    description: clampText(parsed.description, 300),
    scenes: parsed.scenes.slice(0, 20).map((s) => ({
      text: clampText(s.text, 600),
      setting: SETTINGS.includes(s.setting) ? s.setting : 'meadow',
      time: TIMES.includes(s.time) ? s.time : 'day',
      pose: [...POSES, 'none'].includes(s.pose) ? s.pose : 'stand',
      props: (s.props ?? []).filter((p) => PROPS.includes(p)).slice(0, 4),
      fx: (s.fx ?? []).filter((f) => FX.includes(f)).slice(0, 2),
    })),
    model: MODEL,
  };
}
