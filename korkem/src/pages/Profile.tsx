import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, ChevronRight, History as HistoryIcon, Info, Settings2, Trash2 } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { Card, PageHeader, Segmented, Toggle } from '../components/ui';
import { SceneArt } from '../illustrations/SceneArt';
import { declineName, pluralYears } from '../lib/grammar';
import { idbDelete, idbGet, idbSet } from '../lib/idb';
import type { Accessory, Appearance, HairStyle, NameForms, OutfitStyle } from '../types';

const SKIN = ['#F7DCC8', '#EDC6A8', '#E0B08C', '#C99270', '#A8714F', '#7E5038'];
const HAIR = ['#2A1E1A', '#3E2A22', '#6B4330', '#A0623E', '#D9A25F', '#EED29A', '#B3463A'];
const EYES = ['#3B2A22', '#4A3426', '#5D7B3A', '#3E6FA0', '#7A6A5A'];
const OUTFIT = ['#F2A0BE', '#B9A2E8', '#9FC7F0', '#9FD6C2', '#FFD27A', '#F4A47A', '#E86A6A', '#FFFFFF'];
const HAIR_STYLES: Array<{ id: HairStyle; label: string }> = [
  { id: 'buns', label: 'Два пучка' },
  { id: 'long', label: 'Длинные' },
  { id: 'ponytail', label: 'Хвостик' },
  { id: 'braids', label: 'Косички' },
  { id: 'bob', label: 'Каре' },
  { id: 'curly', label: 'Кудряшки' },
];
const OUTFITS: Array<{ id: OutfitStyle; label: string }> = [
  { id: 'dress', label: 'Платье' },
  { id: 'overalls', label: 'Комбинезон' },
  { id: 'sweater', label: 'Свитер' },
];
const ACCESSORIES: Array<{ id: Accessory; label: string }> = [
  { id: 'none', label: 'Без украшений' },
  { id: 'bow', label: 'Бантик' },
  { id: 'headband', label: 'Ободок' },
  { id: 'flower', label: 'Цветочек' },
  { id: 'clip', label: 'Заколка' },
];

function Swatches({ colors, value, onChange, label }: { colors: string[]; value: string; onChange: (c: string) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2.5">
      {colors.map((c) => (
        <button
          key={c}
          role="radio"
          aria-checked={value === c}
          aria-label={c}
          onClick={() => onChange(c)}
          className={`h-11 w-11 rounded-full shadow-inner ring-offset-2 ring-offset-white transition ${value === c ? 'ring-3 ring-[#8a74d8]' : 'ring-1 ring-ink/15'}`}
          style={{ background: c }}
        />
      ))}
    </div>
  );
}

const CASES: Array<{ key: keyof NameForms; label: string; example: (v: string) => string }> = [
  { key: 'nom', label: 'Кто?', example: (v) => `Это ${v}` },
  { key: 'gen', label: 'Кого?', example: (v) => `Подарок для ${v}` },
  { key: 'dat', label: 'Кому?', example: (v) => `Зайчик помахал ${v}` },
  { key: 'acc', label: 'Кого? (вин.)', example: (v) => `Мама обняла ${v}` },
  { key: 'ins', label: 'С кем?', example: (v) => `Вместе с ${v}` },
  { key: 'pre', label: 'О ком?', example: (v) => `Сказка о ${v}` },
];

export function Profile() {
  const { profile, updateProfile, t, notify } = useApp();
  const a = profile.appearance;
  const setA = (patch: Partial<Appearance>) => updateProfile({ appearance: { ...a, ...patch } });
  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let url: string | null = null;
    if (profile.photoId)
      idbGet<Blob>('photos', profile.photoId)
        .then((b) => {
          if (b) {
            url = URL.createObjectURL(b);
            setPhoto(url);
          }
        })
        .catch(() => {});
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [profile.photoId]);

  const onPhoto = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return notify('Выберите изображение.', 'error');
    if (file.size > 8 * 1024 * 1024) return notify('Фото слишком большое (больше 8 МБ).', 'error');
    try {
      await idbSet('photos', 'child-photo', file);
      updateProfile({ photoId: 'child-photo' });
      notify('Фото сохранено только на этом устройстве', 'success');
    } catch {
      notify('Не удалось сохранить фото на устройстве.', 'error');
    }
  };

  return (
    <div>
      <PageHeader title="Профиль" subtitle="Карточка главного героя" />
      <div className="mx-auto grid max-w-5xl gap-4 px-4 sm:px-6 lg:grid-cols-[380px_1fr]">
        <div className="lg:sticky lg:top-4 lg:self-start">
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-lift">
            <div className="aspect-[4/3]">
              <SceneArt spec={{ setting: 'meadow', time: 'sunset', heroine: { pose: 'wave', x: 50, y: 90, scale: 1.25 }, fx: ['petals'] }} appearance={a} className="h-full w-full" label="Как выглядит героиня" />
            </div>
            <div className="flex items-center gap-4 p-5">
              <button onClick={() => fileRef.current?.click()} className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-cream ring-2 ring-white" aria-label="Загрузить фото (необязательно)">
                {photo ? <img src={photo} alt="Фото ребёнка" className="h-full w-full object-cover" /> : <Camera className="h-6 w-6 text-ink-soft" />}
              </button>
              <div>
                <p className="font-serif text-2xl font-semibold">{profile.name}</p>
                <p className="text-ink-soft">{pluralYears(profile.age)} · {profile.gender === 'female' ? 'девочка' : 'мальчик'}</p>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0])} />
            <p className="px-5 pb-4 text-xs text-ink-soft">
              Фото необязательно. Оно хранится только на этом устройстве и никуда не отправляется. Внешность в иллюстрациях настраивается ниже.
              {profile.photoId && (
                <button
                  className="ml-1 inline-flex items-center gap-1 font-bold text-[#c24870]"
                  onClick={async () => {
                    await idbDelete('photos', 'child-photo').catch(() => {});
                    updateProfile({ photoId: undefined });
                    setPhoto(null);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Удалить фото
                </button>
              )}
            </p>
          </div>
          <div className="mt-4 grid gap-2">
            {[
              { to: '/history', label: 'История чтения', icon: HistoryIcon },
              { to: '/settings', label: 'Настройки', icon: Settings2 },
              { to: '/about', label: 'О приложении', icon: Info },
            ].map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className="flex min-h-14 items-center gap-3 rounded-2xl bg-white/85 px-4 font-bold shadow-soft">
                <Icon className="h-5 w-5 text-[#8a74d8]" /> <span className="flex-1">{label}</span> <ChevronRight className="h-5 w-5 text-ink-soft" />
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <Card>
            <h2 className="font-serif text-lg font-semibold">Имя и возраст</h2>
            <label className="mt-3 block">
              <span className="text-sm font-bold text-ink-soft">Имя</span>
              <input value={profile.name} maxLength={30} onChange={(e) => updateProfile({ name: e.target.value })} onBlur={() => !profile.name.trim() && updateProfile({ name: 'Коркем' })} className="mt-1 min-h-12 w-full rounded-2xl bg-cream px-4 font-bold ring-1 ring-ink/10 outline-none focus:ring-2 focus:ring-[#8a74d8]" />
            </label>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <button onClick={() => updateProfile({ age: Math.max(1, profile.age - 1) })} className="grid h-12 w-12 place-items-center rounded-2xl bg-cream text-xl font-bold ring-1 ring-ink/10" aria-label="Меньше">−</button>
                <span className="w-20 text-center font-extrabold">{pluralYears(profile.age)}</span>
                <button onClick={() => updateProfile({ age: Math.min(10, profile.age + 1) })} className="grid h-12 w-12 place-items-center rounded-2xl bg-cream text-xl font-bold ring-1 ring-ink/10" aria-label="Больше">+</button>
              </div>
              <Segmented ariaLabel="Пол" value={profile.gender} onChange={(g) => updateProfile({ gender: g })} options={[{ id: 'female', label: 'Девочка' }, { id: 'male', label: 'Мальчик' }]} />
            </div>
            <p className="mt-3 rounded-2xl bg-cream p-3 font-serif text-[1.02rem]">{t('Однажды {Name} {=увидела|увидел} маленькую звёздочку. — {Name}, помоги мне! — попросил зайчонок. Вместе с {Name:ins} друзья отправились в лес.')}</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-lg font-semibold">Склонение имени</h2>
            </div>
            <p className="mt-1 text-sm text-ink-soft">Формы подбираются автоматически. Женские имена на согласную (например, Коркем) по правилам русского языка не склоняются.</p>
            <Toggle
              label="Задать формы вручную"
              checked={profile.customForms}
              onChange={(v) => updateProfile(v ? { customForms: true } : { customForms: false, nameForms: declineName(profile.name, profile.gender) })}
            />
            <div className="grid gap-2 sm:grid-cols-2">
              {CASES.map((c) => (
                <label key={c.key} className="block rounded-2xl bg-cream p-3">
                  <span className="text-xs font-bold text-ink-soft">{c.label}</span>
                  <input
                    value={profile.nameForms[c.key]}
                    disabled={!profile.customForms}
                    onChange={(e) => updateProfile({ nameForms: { ...profile.nameForms, [c.key]: e.target.value } })}
                    className="mt-1 w-full bg-transparent font-bold outline-none disabled:text-ink"
                    aria-label={c.label}
                  />
                  <span className="text-xs text-ink-soft">{c.example(profile.nameForms[c.key])}</span>
                </label>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="font-serif text-lg font-semibold">Внешность в иллюстрациях</h2>
            <p className="mt-1 text-sm text-ink-soft">Образ остаётся одинаковым во всех сценах и сказках.</p>
            <p className="mt-4 mb-2 text-sm font-bold text-ink-soft">Цвет кожи</p>
            <Swatches label="Цвет кожи" colors={SKIN} value={a.skinTone} onChange={(c) => setA({ skinTone: c })} />
            <p className="mt-4 mb-2 text-sm font-bold text-ink-soft">Цвет волос</p>
            <Swatches label="Цвет волос" colors={HAIR} value={a.hairColor} onChange={(c) => setA({ hairColor: c })} />
            <p className="mt-4 mb-2 text-sm font-bold text-ink-soft">Причёска</p>
            <Segmented ariaLabel="Причёска" value={a.hairStyle} onChange={(v) => setA({ hairStyle: v })} options={HAIR_STYLES} />
            <p className="mt-4 mb-2 text-sm font-bold text-ink-soft">Цвет глаз</p>
            <Swatches label="Цвет глаз" colors={EYES} value={a.eyeColor} onChange={(c) => setA({ eyeColor: c })} />
            <p className="mt-4 mb-2 text-sm font-bold text-ink-soft">Одежда</p>
            <Segmented ariaLabel="Одежда" value={a.outfitStyle} onChange={(v) => setA({ outfitStyle: v })} options={OUTFITS} />
            <div className="mt-3">
              <Swatches label="Цвет одежды" colors={OUTFIT} value={a.outfitColor} onChange={(c) => setA({ outfitColor: c })} />
            </div>
            <p className="mt-4 mb-2 text-sm font-bold text-ink-soft">Украшение</p>
            <Segmented ariaLabel="Украшение" value={a.accessory} onChange={(v) => setA({ accessory: v })} options={ACCESSORIES} />
            {a.accessory !== 'none' && (
              <div className="mt-3">
                <Swatches label="Цвет украшения" colors={['#FFD66B', '#F29BB5', '#9FC7F0', '#FFFFFF', '#E86A6A', '#B9A2E8']} value={a.accessoryColor} onChange={(c) => setA({ accessoryColor: c })} />
              </div>
            )}
            <div className="mt-3 divide-y divide-ink/5">
              <Toggle label="Румяные щёчки" checked={a.cheeks} onChange={(v) => setA({ cheeks: v })} />
              <Toggle label="Веснушки" checked={a.freckles} onChange={(v) => setA({ freckles: v })} />
            </div>
          </Card>

          <Card>
            <h2 className="font-serif text-lg font-semibold">Любимое</h2>
            <p className="mt-3 mb-2 text-sm font-bold text-ink-soft">Любимые цвета</p>
            <div className="flex flex-wrap gap-2.5">
              {OUTFIT.map((c) => {
                const on = profile.preferences.favoriteColors.includes(c);
                return (
                  <button
                    key={c}
                    aria-pressed={on}
                    aria-label={c}
                    onClick={() => updateProfile({ preferences: { ...profile.preferences, favoriteColors: on ? profile.preferences.favoriteColors.filter((x) => x !== c) : [...profile.preferences.favoriteColors, c] } })}
                    className={`h-11 w-11 rounded-full transition ${on ? 'ring-3 ring-[#8a74d8] ring-offset-2' : 'ring-1 ring-ink/15'}`}
                    style={{ background: c }}
                  />
                );
              })}
            </div>
            <label className="mt-4 block">
              <span className="text-sm font-bold text-ink-soft">Любимое животное</span>
              <input value={profile.preferences.favoriteAnimal} maxLength={40} onChange={(e) => updateProfile({ preferences: { ...profile.preferences, favoriteAnimal: e.target.value } })} className="mt-1 min-h-12 w-full rounded-2xl bg-cream px-4 ring-1 ring-ink/10 outline-none" />
            </label>
            <label className="mt-3 block">
              <span className="text-sm font-bold text-ink-soft">Заметки для родителей</span>
              <textarea value={profile.preferences.notes} maxLength={300} rows={3} onChange={(e) => updateProfile({ preferences: { ...profile.preferences, notes: e.target.value } })} className="mt-1 w-full resize-none rounded-2xl bg-cream p-4 ring-1 ring-ink/10 outline-none" placeholder="Например: боится громких звуков, любит слово «волшебный»" />
            </label>
          </Card>
        </div>
      </div>
    </div>
  );
}
