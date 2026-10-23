import type { Gender, NameForms } from '../types';

/**
 * Склонение личного имени по правилам русского языка.
 *
 * — Женские имена на согласную (Коркем, Айгерим, Кармен) не склоняются.
 * — Имена на -а/-я склоняются по первому склонению (Мадина → Мадины, Мадине…).
 * — Мужские имена на согласную, -й, -ь склоняются по второму склонению
 *   (Арман → Армана, Арману…).
 * Автоматический результат можно поправить вручную в профиле.
 */
const SIBILANTS = 'жшчщц';
const VELARS_AND_SIBILANTS = 'гкхжшчщ';

export function declineName(raw: string, gender: Gender): NameForms {
  const name = normalizeName(raw);
  const same: NameForms = { nom: name, gen: name, dat: name, acc: name, ins: name, pre: name };
  if (!name) return same;

  const lower = name.toLowerCase();
  const last = lower.slice(-1);
  const prev = lower.slice(-2, -1);
  const stem = name.slice(0, -1);

  // Не кириллица — не склоняем
  if (!/[а-яё]$/i.test(name)) return same;

  if (last === 'а') {
    const gen = VELARS_AND_SIBILANTS.includes(prev) ? 'и' : 'ы';
    const ins = SIBILANTS.includes(prev) ? 'ей' : 'ой';
    return { nom: name, gen: stem + gen, dat: stem + 'е', acc: stem + 'у', ins: stem + ins, pre: stem + 'е' };
  }
  if (last === 'я') {
    if (prev === 'и') {
      // Мария, Амелия
      return { nom: name, gen: stem + 'и', dat: stem + 'и', acc: stem + 'ю', ins: stem + 'ей', pre: stem + 'и' };
    }
    return { nom: name, gen: stem + 'и', dat: stem + 'е', acc: stem + 'ю', ins: stem + 'ей', pre: stem + 'е' };
  }

  if (gender === 'female') return same;

  // Мужские имена
  if (last === 'й') {
    return { nom: name, gen: stem + 'я', dat: stem + 'ю', acc: stem + 'я', ins: stem + 'ем', pre: stem + 'е' };
  }
  if (last === 'ь') {
    return { nom: name, gen: stem + 'я', dat: stem + 'ю', acc: stem + 'я', ins: stem + 'ем', pre: stem + 'е' };
  }
  if (/[бвгджзклмнпрстфхцчшщ]/.test(last)) {
    const ins = SIBILANTS.includes(last) ? 'ем' : 'ом';
    return { nom: name, gen: name + 'а', dat: name + 'у', acc: name + 'а', ins: name + ins, pre: name + 'е' };
  }
  // Имена на гласные (-о, -и, -у, -е…) не склоняются
  return same;
}

export function normalizeName(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, ' ').slice(0, 30);
  if (!trimmed) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export interface Persona {
  forms: NameForms;
  gender: Gender;
}

const CASE_KEYS = ['nom', 'gen', 'dat', 'acc', 'ins', 'pre'] as const;

/**
 * Подставляет имя и грамматический род в текст сказки.
 *  {Name}        — именительный падеж
 *  {Name:dat}    — нужный падеж (gen, dat, acc, ins, pre)
 *  {=она|он}     — вариант для девочки | для мальчика
 */
export function renderText(template: string, persona: Persona): string {
  return template
    .replace(/\{Name(?::(nom|gen|dat|acc|ins|pre))?\}/g, (_m, c: (typeof CASE_KEYS)[number] | undefined) => persona.forms[c ?? 'nom'])
    .replace(/\{=([^|{}]*)\|([^|{}]*)\}/g, (_m, f: string, m: string) => (persona.gender === 'female' ? f : m));
}

/** Текст без пунктуации диалога — для озвучивания. */
export function toSpeechText(text: string): string {
  return text
    .replace(/[«»"]/g, '')
    .replace(/\s—\s/g, ', ')
    .replace(/^—\s*/gm, '')
    .replace(/\n+/g, ' ')
    .trim();
}

export function pluralMinutes(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} минута`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} минуты`;
  return `${n} минут`;
}

export function pluralScenes(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} сцена`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} сцены`;
  return `${n} сцен`;
}

export function pluralYears(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} год`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} года`;
  return `${n} лет`;
}
