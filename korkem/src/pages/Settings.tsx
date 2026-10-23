import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Database, Info, Languages, Music, Sparkles, Type, Volume2, Wand2 } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { Card, ConfirmDialog, PageHeader, Segmented, Toggle } from '../components/ui';
import { music, MUSIC_TRACKS } from '../services/music';
import { createSpeechProvider } from '../services/speech';
import { idbClear, storageEstimate } from '../lib/idb';
import { listRecordings } from '../services/recorder';

type Confirm = null | 'history' | 'audio' | 'all';

function Head({ icon: Icon, children }: { icon: typeof Info; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 font-serif text-lg font-semibold">
      <Icon className="h-5 w-5 text-[#8a74d8]" /> {children}
    </h2>
  );
}

export function Settings() {
  const { settings, updateSettings, profile, serverStatus, clearHistory, wipeAll, notify, generated, history } = useApp();
  const nav = useNavigate();
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [usage, setUsage] = useState<string>('');
  const [recCount, setRecCount] = useState(0);
  const [musicPlaying, setMusicPlaying] = useState(music.isPlaying());
  const speechOk = createSpeechProvider().isSupported();

  const refresh = () => {
    storageEstimate().then((e) => e && setUsage(`${(e.usage / 1024 / 1024).toFixed(1)} МБ из ~${Math.round(e.quota / 1024 / 1024)} МБ`));
    listRecordings().then((k) => setRecCount(k.length));
  };
  useEffect(refresh, []);
  useEffect(() => () => music.stop(1), []);

  const previewMusic = async () => {
    if (musicPlaying) {
      music.stop(1.2);
      setMusicPlaying(false);
    } else if (await music.start(settings.musicTrack, settings.musicVolume)) {
      setMusicPlaying(true);
    } else notify('Фоновая музыка не поддерживается этим браузером.', 'error');
  };

  return (
    <div>
      <PageHeader back title="Настройки" subtitle="Всё хранится только на этом устройстве" />
      <div className="mx-auto grid max-w-3xl gap-4 px-4 sm:px-6">
        <Link to="/profile" className="flex min-h-16 items-center gap-3 rounded-[1.75rem] bg-white/85 p-4 shadow-soft">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-lavender-soft font-serif text-xl font-bold">{profile.name.charAt(0)}</span>
          <span className="flex-1">
            <span className="block font-bold">{profile.name}</span>
            <span className="block text-sm text-ink-soft">Имя, возраст и внешность героя</span>
          </span>
          <ChevronRight className="h-5 w-5 text-ink-soft" />
        </Link>

        <Card>
          <Head icon={Languages}>Язык</Head>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="min-h-11 rounded-2xl bg-ink px-4 font-bold text-white" aria-pressed="true">Русский</button>
            <button className="min-h-11 rounded-2xl bg-white/80 px-4 font-bold text-ink-soft ring-1 ring-ink/10" disabled aria-disabled="true">
              Қазақша · скоро
            </button>
          </div>
          <p className="mt-2 text-sm text-ink-soft">Казахский язык готовится: структура сказок уже поддерживает несколько языков.</p>
        </Card>

        <Card>
          <Head icon={Type}>Чтение</Head>
          <p className="mt-3 mb-2 text-sm font-bold text-ink-soft">Размер текста</p>
          <Segmented ariaLabel="Размер текста" value={settings.fontSize} onChange={(v) => updateSettings({ fontSize: v })} options={[{ id: 'm', label: 'Обычный' }, { id: 'l', label: 'Крупный' }, { id: 'xl', label: 'Очень крупный' }]} />
          <p className="mt-4 mb-2 text-sm font-bold text-ink-soft">Режим чтения</p>
          <Segmented ariaLabel="Режим чтения" value={settings.readingMode} onChange={(v) => updateSettings({ readingMode: v })} options={[{ id: 'self', label: 'Читать самой' }, { id: 'child', label: 'Читать ребёнку' }]} />
          <p className="mt-2 text-sm text-ink-soft">«Читать ребёнку» — крупный текст и только самые нужные большие кнопки.</p>
          <div className="mt-2 divide-y divide-ink/5">
            <Toggle label="Режим «Перед сном»" hint="Тёмный экран, тише музыка, медленнее голос" checked={settings.bedtimeMode} onChange={(v) => updateSettings({ bedtimeMode: v })} />
            <Toggle label="Автопереход сцен" hint="После окончания озвучивания" checked={settings.autoAdvance} onChange={(v) => updateSettings({ autoAdvance: v })} />
            <Toggle label="Анимации" hint="Мерцание звёзд, облака, светлячки" checked={settings.animationsEnabled} onChange={(v) => updateSettings({ animationsEnabled: v })} />
          </div>
        </Card>

        <Card>
          <Head icon={Volume2}>Звук и голос</Head>
          <div className="mt-2 divide-y divide-ink/5">
            <Toggle label="Звук в приложении" hint="Озвучивание, голос родителя и музыка" checked={settings.soundEnabled} onChange={(v) => updateSettings({ soundEnabled: v })} />
          </div>
          <p className="mt-3 mb-2 text-sm font-bold text-ink-soft">Кто читает сказку</p>
          <Segmented ariaLabel="Источник голоса" value={settings.voiceSource} onChange={(v) => updateSettings({ voiceSource: v })} options={[{ id: 'tts', label: 'Синтез речи' }, { id: 'parent', label: 'Папа читает' }]} />
          <p className="mt-2 text-sm text-ink-soft">
            {speechOk ? 'Синтез речи работает через браузер (Web Speech API). Голос можно выбрать в настройках чтения.' : 'Этот браузер не поддерживает синтез речи — сказки можно читать вслух или записать голос родителя.'}
          </p>
          <label className="mt-3 block text-sm font-bold text-ink-soft">Скорость речи: {settings.speechRate.toFixed(2)}</label>
          <input className="range mt-2" type="range" min={0.6} max={1.2} step={0.05} value={settings.speechRate} onChange={(e) => updateSettings({ speechRate: Number(e.target.value) })} aria-label="Скорость речи" />
        </Card>

        <Card>
          <Head icon={Music}>Фоновая музыка</Head>
          <p className="mt-1 text-sm text-ink-soft">Оригинальные колыбельные, которые синтезируются прямо в браузере. Музыка не включается сама — только по нажатию.</p>
          <div className="mt-3 grid gap-2">
            {MUSIC_TRACKS.map((tr) => (
              <button
                key={tr.id}
                onClick={async () => {
                  updateSettings({ musicTrack: tr.id });
                  if (musicPlaying) await music.start(tr.id, settings.musicVolume);
                }}
                className={`flex min-h-12 items-center justify-between rounded-2xl px-4 text-left ring-1 ${settings.musicTrack === tr.id ? 'bg-ink text-white ring-ink' : 'bg-white ring-ink/10'}`}
              >
                <span className="font-bold">{tr.title}</span>
                <span className="text-xs opacity-70">{tr.description}</span>
              </button>
            ))}
          </div>
          <label className="mt-3 block text-sm font-bold text-ink-soft">Громкость</label>
          <input className="range mt-2" type="range" min={0.05} max={0.8} step={0.05} value={settings.musicVolume} onChange={(e) => updateSettings({ musicVolume: Number(e.target.value) })} aria-label="Громкость музыки" />
          <button onClick={previewMusic} className="mt-4 min-h-12 w-full rounded-2xl bg-lavender-soft font-bold">{musicPlaying ? 'Остановить (с затуханием)' : 'Послушать'}</button>
          <p className="mt-2 text-xs text-ink-soft">На iPhone музыка и озвучивание не слышны, если включён беззвучный режим (переключатель сбоку).</p>
        </Card>

        <Card>
          <Head icon={Sparkles}>AI-генерация сказок</Head>
          {serverStatus.story ? (
            <>
              <Toggle
                label="Создавать сказки с помощью AI"
                hint="Используется сервер приложения. Имя, фото и голосовые записи не отправляются."
                checked={settings.aiEnabled}
                onChange={(v) => updateSettings({ aiEnabled: v })}
              />
              <p className="text-xs text-ink-soft">Модель: {serverStatus.model}. Отправляются только тема, настроение, возраст, пол героя, выбранные персонажи и текст пожеланий.</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-ink-soft">
              AI-сервер не настроен — это нормально. Сказки создаются на устройстве из локальных шаблонов. Чтобы подключить AI, владелец приложения задаёт ключ <code className="rounded bg-cream px-1">ANTHROPIC_API_KEY</code> на сервере (см. README).
            </p>
          )}
        </Card>

        <Card>
          <Head icon={Database}>Данные на устройстве</Head>
          <ul className="mt-2 space-y-1 text-sm text-ink-soft">
            <li>Созданных сказок: {generated.length}</li>
            <li>Записей голоса: {recCount}</li>
            <li>Записей в истории: {history.length}</li>
            {usage && <li>Занято в хранилище: {usage}</li>}
          </ul>
          <div className="mt-4 grid gap-2">
            <button onClick={() => setConfirm('history')} className="min-h-12 rounded-2xl bg-white font-bold ring-1 ring-ink/10">Очистить историю чтения</button>
            <button onClick={() => setConfirm('audio')} className="min-h-12 rounded-2xl bg-white font-bold ring-1 ring-ink/10">Удалить записи голоса</button>
            <button onClick={() => setConfirm('all')} className="min-h-12 rounded-2xl bg-[#fde4ea] font-bold text-[#a2305a]">Удалить все данные</button>
          </div>
        </Card>

        <Link to="/about" className="flex min-h-14 items-center gap-3 rounded-2xl bg-white/85 px-4 font-bold shadow-soft">
          <Info className="h-5 w-5 text-[#8a74d8]" /> <span className="flex-1">О приложении и установка на iPhone</span> <ChevronRight className="h-5 w-5" />
        </Link>
        <Link to="/create" className="mb-2 flex min-h-14 items-center gap-3 rounded-2xl bg-white/85 px-4 font-bold shadow-soft">
          <Wand2 className="h-5 w-5 text-[#8a74d8]" /> <span className="flex-1">Создать новую сказку</span> <ChevronRight className="h-5 w-5" />
        </Link>
      </div>

      <ConfirmDialog
        open={confirm === 'history'}
        title="Очистить историю чтения?"
        text="Удалятся история и сохранённые места в сказках. Сказки и избранное останутся."
        confirmLabel="Очистить"
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          clearHistory();
          setConfirm(null);
          notify('История очищена', 'success');
        }}
      />
      <ConfirmDialog
        open={confirm === 'audio'}
        title="Удалить все записи голоса?"
        text="Записанный голос родителя будет удалён для всех сказок. Это нельзя отменить."
        confirmLabel="Удалить записи"
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          await idbClear('audio').catch(() => {});
          setConfirm(null);
          refresh();
          notify('Записи удалены', 'success');
        }}
      />
      <ConfirmDialog
        open={confirm === 'all'}
        title="Удалить все данные?"
        text="Будут удалены профиль, настройки, избранное, история, созданные сказки, фото и записи голоса. Встроенные сказки останутся. Это нельзя отменить."
        confirmLabel="Удалить всё"
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          await wipeAll();
          setConfirm(null);
          notify('Все данные удалены', 'success');
          nav('/');
        }}
      />
    </div>
  );
}
