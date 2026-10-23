import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, Home, Library, Moon, Music, Pause, Play, RotateCcw, SlidersHorizontal, Square, Volume2, X, Mic } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { SceneArt } from '../illustrations/SceneArt';
import { createSpeechProvider, type SpeechVoice } from '../services/speech';
import { loadRecording } from '../services/recorder';
import { music, MUSIC_TRACKS } from '../services/music';
import { toSpeechText } from '../lib/grammar';
import { Segmented, Toggle } from '../components/ui';
import type { AppSettings } from '../types';

type PlayState = 'idle' | 'playing' | 'paused';

export function Reader() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const app = useApp();
  const { getStory, t, profile, settings, updateSettings, progress, saveProgress, markOpened, isFavorite, toggleFavorite, notify, reducedMotion } = app;
  const story = getStory(id);
  const speech = useMemo(() => createSpeechProvider(), []);

  const initialScene = useMemo(() => {
    const q = params.get('scene');
    if (q !== null && story) return Math.min(Math.max(0, Number(q) || 0), story.scenes.length - 1);
    const p = story ? progress[story.id] : undefined;
    return p && !p.completed ? Math.min(p.currentScene, (story?.scenes.length ?? 1) - 1) : 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id]);

  const [index, setIndex] = useState(initialScene);
  const [direction, setDirection] = useState(1);
  const [finished, setFinished] = useState(false);
  const [playState, setPlayState] = useState<PlayState>('idle');
  const [sourceLabel, setSourceLabel] = useState<string>('');
  const [panel, setPanel] = useState(false);
  const [musicOn, setMusicOn] = useState(music.isPlaying());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrl = useRef<string | null>(null);
  const chainRef = useRef(false); // пользователь слушает сказку подряд
  const advanceTimer = useRef<number | null>(null);
  const stateRef = useRef({ index, settings, storyLen: story?.scenes.length ?? 0 });
  stateRef.current = { index, settings, storyLen: story?.scenes.length ?? 0 };

  const childMode = settings.readingMode === 'child';
  const bedtime = settings.bedtimeMode || !!story?.bedtime;
  const dark = settings.bedtimeMode;

  useEffect(() => {
    if (story) markOpened(story);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id]);

  useEffect(() => {
    if (story && !finished) saveProgress(story.id, index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, story?.id]);

  const stopAudio = useCallback(() => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
    speech.stop();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    if (audioUrl.current) URL.revokeObjectURL(audioUrl.current);
    audioUrl.current = null;
  }, [speech]);

  // При уходе со страницы — тишина, а музыка плавно затихает
  useEffect(
    () => () => {
      stopAudio();
      music.stop(1.5);
    },
    [stopAudio],
  );

  const goTo = useCallback(
    (i: number, keepChain = false) => {
      if (!story) return;
      stopAudio();
      if (!keepChain) {
        chainRef.current = false;
        setPlayState('idle');
      }
      if (i >= story.scenes.length) {
        setFinished(true);
        chainRef.current = false;
        setPlayState('idle');
        saveProgress(story.id, story.scenes.length - 1, true);
        music.stop(4);
        setMusicOn(false);
        return;
      }
      setFinished(false);
      setDirection(i >= stateRef.current.index ? 1 : -1);
      setIndex(Math.max(0, i));
    },
    [story, stopAudio, saveProgress],
  );

  const onNarrationEnd = useCallback(() => {
    setPlayState('idle');
    const { index: i, settings: s, storyLen } = stateRef.current;
    if (!chainRef.current) return;
    if (s.autoAdvance) {
      advanceTimer.current = window.setTimeout(() => {
        if (i + 1 >= storyLen) goTo(storyLen);
        else goTo(i + 1, true);
      }, 1400);
    } else {
      chainRef.current = false;
    }
  }, [goTo]);

  const playScene = useCallback(
    async (i: number) => {
      if (!story) return;
      const s = stateRef.current.settings;
      if (!s.soundEnabled) {
        notify('Звук выключен в настройках приложения.', 'info');
        return;
      }
      stopAudio();
      const scene = story.scenes[i];
      chainRef.current = true;
      if (s.voiceSource === 'parent') {
        const blob = await loadRecording(story.id, scene.id);
        if (blob) {
          const url = URL.createObjectURL(blob);
          audioUrl.current = url;
          const el = audioRef.current ?? new Audio();
          audioRef.current = el;
          el.src = url;
          el.volume = s.speechVolume;
          el.onended = onNarrationEnd;
          el.onerror = () => {
            setPlayState('idle');
            notify('Не удалось воспроизвести запись.', 'error');
          };
          setSourceLabel('Голос родителя');
          setPlayState('playing');
          try {
            await el.play();
          } catch {
            setPlayState('idle');
            notify('Нажмите «Слушать», чтобы включить звук.', 'info');
          }
          return;
        }
        setSourceLabel('Записи нет — читает синтезатор');
      } else {
        setSourceLabel('');
      }
      if (!speech.isSupported()) {
        setPlayState('idle');
        chainRef.current = false;
        notify('Этот браузер не умеет озвучивать текст. Сказку можно читать вслух самостоятельно.', 'error');
        return;
      }
      speech.speak(
        toSpeechText(t(scene.text, story)),
        { rate: bedtime ? Math.min(s.speechRate, 0.85) : s.speechRate, volume: s.speechVolume, voiceId: s.voiceURI },
        {
          onStart: () => setPlayState('playing'),
          onEnd: onNarrationEnd,
          onError: (m) => {
            setPlayState('idle');
            chainRef.current = false;
            notify(m, 'error');
          },
        },
      );
    },
    [story, stopAudio, speech, t, notify, onNarrationEnd, bedtime],
  );

  // Продолжение цепочки при автопереходе
  useEffect(() => {
    if (chainRef.current && playState === 'idle' && !finished) {
      const timer = window.setTimeout(() => playScene(index), 450);
      return () => window.clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // ?listen=1 — пробуем начать озвучивание сразу (если браузер разрешит)
  useEffect(() => {
    if (params.get('listen') === '1') {
      const timer = window.setTimeout(() => playScene(initialScene), 600);
      return () => window.clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePlay = () => {
    if (playState === 'playing') {
      if (audioRef.current && audioUrl.current) audioRef.current.pause();
      else speech.pause();
      setPlayState('paused');
      return;
    }
    if (playState === 'paused') {
      if (audioRef.current && audioUrl.current) audioRef.current.play().catch(() => {});
      else speech.resume();
      setPlayState('playing');
      return;
    }
    playScene(index);
  };

  const stop = () => {
    chainRef.current = false;
    stopAudio();
    setPlayState('idle');
  };

  const toggleMusic = async () => {
    if (musicOn) {
      music.stop(1.5);
      setMusicOn(false);
      return;
    }
    if (!settings.soundEnabled) return notify('Звук выключен в настройках приложения.');
    const ok = await music.start(settings.musicTrack, bedtime ? Math.min(settings.musicVolume, 0.25) : settings.musicVolume);
    if (ok) {
      setMusicOn(true);
      updateSettings({ musicEnabled: true });
    } else notify('Фоновая музыка не поддерживается этим браузером.', 'error');
  };

  // Свайпы и клавиатура
  const touch = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (panel) return;
      if (e.key === 'ArrowRight') goTo(stateRef.current.index + 1);
      if (e.key === 'ArrowLeft') goTo(stateRef.current.index - 1);
      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!story) {
    return (
      <div className="grid min-h-[100dvh] place-items-center p-6 text-center">
        <div>
          <p className="font-serif text-2xl">Сказка не найдена</p>
          <button onClick={() => nav('/library')} className="mt-4 min-h-12 rounded-2xl bg-ink px-5 font-bold text-white">В библиотеку</button>
        </div>
      </div>
    );
  }

  const scene = story.scenes[index];
  const text = t(scene.text, story);
  const paragraphs = text.split('\n').filter(Boolean);
  const total = story.scenes.length;
  const fav = isFavorite(story.id);

  const theme = dark ? 'bg-[#15123a] text-[#efeaff]' : 'bg-cream text-ink';
  const softBtn = dark ? 'bg-white/10 text-white' : 'bg-white text-ink shadow-soft ring-1 ring-ink/5';

  return (
    <div
      className={`relative flex h-[100dvh] flex-col overflow-hidden lg:grid lg:grid-cols-[1.25fr_1fr] ${theme}`}
      onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
      onTouchEnd={(e) => {
        if (!touch.current || panel) return;
        const dx = e.changedTouches[0].clientX - touch.current.x;
        const dy = e.changedTouches[0].clientY - touch.current.y;
        touch.current = null;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) goTo(index + (dx < 0 ? 1 : -1));
      }}
    >
      {/* Иллюстрация */}
      <div className={`relative shrink-0 overflow-hidden lg:h-full ${childMode ? 'h-[44dvh]' : 'h-[46dvh]'} rounded-b-[2rem] lg:rounded-none`}>
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={finished ? 'end' : index}
            custom={direction}
            className="absolute inset-0"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * 60, scale: 1.04 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * -60, scale: 0.98 }}
            transition={{ duration: reducedMotion ? 0.2 : 0.65, ease: [0.22, 0.8, 0.2, 1] }}
          >
            <SceneArt
              spec={finished ? { ...story.cover, fx: ['sparkles', 'confetti'] } : scene.illustration}
              appearance={profile.appearance}
              animate={!reducedMotion}
              className="h-full w-full"
              label={`Иллюстрация к сцене ${index + 1}`}
            />
          </motion.div>
        </AnimatePresence>
        <div className="pt-safe absolute inset-x-0 top-0 flex items-center gap-2 px-3 pt-2">
          <button onClick={() => nav(`/story/${story.id}`)} className="glass grid h-11 w-11 place-items-center rounded-2xl text-ink shadow-soft" aria-label="Закрыть сказку">
            <X className="h-5 w-5" />
          </button>
          <div className="glass min-w-0 flex-1 rounded-2xl px-3 py-2 text-ink shadow-soft">
            <p className="truncate text-sm font-extrabold">{t(story.title, story)}</p>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={index + 1}>
                <div className="h-full rounded-full bg-gradient-to-r from-[#8a74d8] to-[#e58db0] transition-all duration-500" style={{ width: `${finished ? 100 : ((index + 1) / total) * 100}%` }} />
              </div>
              <span className="text-xs font-bold tabular-nums">{finished ? total : index + 1}/{total}</span>
            </div>
          </div>
          <button onClick={toggleMusic} className={`grid h-11 w-11 place-items-center rounded-2xl shadow-soft ${musicOn ? 'bg-ink text-white' : 'glass text-ink'}`} aria-label={musicOn ? 'Выключить музыку' : 'Включить музыку'} aria-pressed={musicOn}>
            <Music className="h-5 w-5" />
          </button>
          <button onClick={() => setPanel(true)} className="glass grid h-11 w-11 place-items-center rounded-2xl text-ink shadow-soft" aria-label="Настройки чтения">
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Текст и управление */}
      <div className="flex min-h-0 flex-1 flex-col lg:h-[100dvh]">
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pt-5 sm:px-8 lg:flex lg:flex-col lg:justify-center lg:px-12">
          <AnimatePresence mode="wait">
            {finished ? (
              <motion.div key="end" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pb-4 text-center">
                <p className="font-serif text-3xl font-semibold">Вот и сказке конец</p>
                <p className={`mx-auto mt-3 max-w-md ${dark ? 'text-white/70' : 'text-ink-soft'}`}>{story.moral ? t(story.moral, story) : 'Спасибо, что читали вместе!'}</p>
                <div className="mx-auto mt-6 grid max-w-sm gap-3">
                  <button onClick={() => goTo(0)} className="flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7d68d0] to-[#d97ba3] font-extrabold text-white">
                    <RotateCcw className="h-5 w-5" /> Прочитать ещё раз
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => toggleFavorite(story.id)} className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl font-bold ${softBtn}`}>
                      <Heart className="h-5 w-5" fill={fav ? 'currentColor' : 'none'} /> {fav ? 'Любимая' : 'В избранное'}
                    </button>
                    <button onClick={() => nav('/library')} className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl font-bold ${softBtn}`}>
                      <Library className="h-5 w-5" /> Сказки
                    </button>
                  </div>
                  <button onClick={() => nav('/')} className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl font-bold ${softBtn}`}>
                    <Home className="h-5 w-5" /> На главную
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="mx-auto max-w-2xl pb-4">
                {paragraphs.map((p, i) => (
                  <motion.p
                    key={i}
                    initial={reducedMotion ? false : { opacity: 0, y: 10, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ delay: 0.15 + i * 0.18, duration: 0.6 }}
                    className={`story-text ${childMode ? 'child-mode' : ''} ${i ? 'mt-3' : ''} ${p.startsWith('—') ? (dark ? 'text-[#ffd9ea]' : 'text-[#6a4fb3]') : ''}`}
                  >
                    {p}
                  </motion.p>
                ))}
                {sourceLabel && playState !== 'idle' && (
                  <p className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${dark ? 'bg-white/10' : 'bg-lavender-soft'}`}>
                    <Mic className="h-3.5 w-3.5" /> {sourceLabel}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!finished && (
          <div className="pb-safe px-4 pt-2 sm:px-8">
            {childMode ? (
              <div className="mx-auto flex max-w-xl items-center justify-between gap-3 pb-1">
                <button onClick={() => goTo(index - 1)} disabled={index === 0} className={`grid h-20 w-20 place-items-center rounded-[1.75rem] disabled:opacity-30 ${softBtn}`} aria-label="Предыдущая сцена">
                  <ChevronLeft className="h-10 w-10" />
                </button>
                <button onClick={togglePlay} className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-[#8a74d8] to-[#e58db0] text-white shadow-lift" aria-label={playState === 'playing' ? 'Пауза' : 'Слушать'}>
                  {playState === 'playing' ? <Pause className="h-9 w-9" fill="currentColor" /> : <Play className="ml-1 h-9 w-9" fill="currentColor" />}
                </button>
                <button onClick={() => goTo(index + 1)} className="grid h-20 w-20 place-items-center rounded-[1.75rem] bg-ink text-white shadow-lift" aria-label="Следующая сцена">
                  <ChevronRight className="h-10 w-10" />
                </button>
              </div>
            ) : (
              <div className="mx-auto max-w-xl pb-1">
                <div className="flex items-center justify-between gap-2">
                  <button onClick={() => goTo(index - 1)} disabled={index === 0} className={`flex min-h-14 items-center gap-1 rounded-2xl px-3 font-bold disabled:opacity-30 ${softBtn}`} aria-label="Предыдущая сцена">
                    <ChevronLeft className="h-6 w-6" /> <span className="hidden min-[400px]:inline">Назад</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <button onClick={() => playScene(index)} className={`grid h-12 w-12 place-items-center rounded-full ${softBtn}`} aria-label="Прослушать сцену заново">
                      <RotateCcw className="h-5 w-5" />
                    </button>
                    <button onClick={togglePlay} className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-[#8a74d8] to-[#e58db0] text-white shadow-lift" aria-label={playState === 'playing' ? 'Пауза' : playState === 'paused' ? 'Продолжить' : 'Слушать'}>
                      {playState === 'playing' ? <Pause className="h-7 w-7" fill="currentColor" /> : <Play className="ml-0.5 h-7 w-7" fill="currentColor" />}
                    </button>
                    <button onClick={stop} disabled={playState === 'idle'} className={`grid h-12 w-12 place-items-center rounded-full disabled:opacity-30 ${softBtn}`} aria-label="Остановить">
                      <Square className="h-4 w-4" fill="currentColor" />
                    </button>
                  </div>
                  <button onClick={() => goTo(index + 1)} className="flex min-h-14 items-center gap-1 rounded-2xl bg-ink px-3 font-bold text-white shadow-soft" aria-label={index === total - 1 ? 'Завершить' : 'Следующая сцена'}>
                    <span className="hidden min-[400px]:inline">{index === total - 1 ? 'Конец' : 'Далее'}</span> <ChevronRight className="h-6 w-6" />
                  </button>
                </div>
                <p className={`mt-2 text-center text-xs font-semibold ${dark ? 'text-white/50' : 'text-ink-soft/80'}`}>
                  {playState === 'paused' ? 'Пауза — нажмите ▶, чтобы продолжить' : settings.autoAdvance ? 'Автопереход включён' : 'Прогресс сохраняется автоматически'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <ReaderPanel open={panel} onClose={() => setPanel(false)} settings={settings} update={updateSettings} speechVoices={speech} musicOn={musicOn} onMusicTrack={async (track) => {
        updateSettings({ musicTrack: track });
        if (musicOn) await music.start(track, settings.musicVolume);
      }} />
    </div>
  );
}

function ReaderPanel({ open, onClose, settings, update, speechVoices, musicOn, onMusicTrack }: { open: boolean; onClose: () => void; settings: AppSettings; update: (p: Partial<AppSettings>) => void; speechVoices: ReturnType<typeof createSpeechProvider>; musicOn: boolean; onMusicTrack: (id: string) => void }) {
  const [voices, setVoices] = useState<SpeechVoice[]>(() => speechVoices.getVoices());
  useEffect(() => speechVoices.onVoicesChanged(() => setVoices(speechVoices.getVoices())), [speechVoices]);
  const ruVoices = voices.filter((v) => /^(ru|kk)/i.test(v.lang));
  const shown = ruVoices.length ? ruVoices : voices;
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 bg-night/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Настройки чтения"
            onClick={(e) => e.stopPropagation()}
            className="pb-safe absolute inset-x-0 bottom-0 mx-auto max-h-[85dvh] max-w-xl overflow-y-auto rounded-t-[2rem] bg-cream px-5 pt-3 text-ink shadow-lift"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-ink/15" />
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-semibold">Настройки чтения</h2>
              <button onClick={onClose} className="grid h-11 w-11 place-items-center rounded-2xl bg-white" aria-label="Закрыть"><X className="h-5 w-5" /></button>
            </div>

            <p className="mt-4 mb-2 text-sm font-bold text-ink-soft">Режим</p>
            <Segmented ariaLabel="Режим чтения" value={settings.readingMode} onChange={(v) => update({ readingMode: v })} options={[{ id: 'self', label: 'Читать самой' }, { id: 'child', label: 'Читать ребёнку' }]} />
            <p className="mt-4 mb-2 text-sm font-bold text-ink-soft">Размер текста</p>
            <Segmented ariaLabel="Размер текста" value={settings.fontSize} onChange={(v) => update({ fontSize: v })} options={[{ id: 'm', label: 'Обычный' }, { id: 'l', label: 'Крупный' }, { id: 'xl', label: 'Очень крупный' }]} />

            <div className="mt-3 divide-y divide-ink/5">
              <Toggle label="Перед сном" hint="Тёмная тема, тише музыка, медленнее голос" checked={settings.bedtimeMode} onChange={(v) => update({ bedtimeMode: v })} />
              <Toggle label="Автопереход" hint="Следующая сцена после окончания озвучивания" checked={settings.autoAdvance} onChange={(v) => update({ autoAdvance: v })} />
              <Toggle label="Анимации" checked={settings.animationsEnabled} onChange={(v) => update({ animationsEnabled: v })} />
            </div>

            <p className="mt-4 mb-2 flex items-center gap-1.5 text-sm font-bold text-ink-soft"><Volume2 className="h-4 w-4" /> Голос</p>
            <Segmented ariaLabel="Источник голоса" value={settings.voiceSource} onChange={(v) => update({ voiceSource: v })} options={[{ id: 'tts', label: 'Синтез речи' }, { id: 'parent', label: 'Папа читает' }]} />
            {speechVoices.isSupported() ? (
              <>
                <label className="mt-3 block text-sm font-bold text-ink-soft" htmlFor="voice">Голос синтезатора</label>
                <select id="voice" value={settings.voiceURI ?? ''} onChange={(e) => update({ voiceURI: e.target.value || null })} className="mt-1 min-h-12 w-full rounded-2xl bg-white px-3 ring-1 ring-ink/10">
                  <option value="">Автоматически (русский)</option>
                  {shown.map((v) => (
                    <option key={v.id} value={v.id}>{v.name} · {v.lang}</option>
                  ))}
                </select>
                {!ruVoices.length && voices.length > 0 && <p className="mt-1 text-xs text-ink-soft">Русский голос не найден. На iPhone: Настройки → Универсальный доступ → Устный контент → Голоса → Русский.</p>}
                <label className="mt-3 block text-sm font-bold text-ink-soft">Скорость: {settings.speechRate.toFixed(2)}</label>
                <input className="range mt-2" type="range" min={0.6} max={1.2} step={0.05} value={settings.speechRate} onChange={(e) => update({ speechRate: Number(e.target.value) })} aria-label="Скорость речи" />
                {speechVoices.supportsVolume && (
                  <>
                    <label className="mt-3 block text-sm font-bold text-ink-soft">Громкость голоса</label>
                    <input className="range mt-2" type="range" min={0.2} max={1} step={0.05} value={settings.speechVolume} onChange={(e) => update({ speechVolume: Number(e.target.value) })} aria-label="Громкость голоса" />
                  </>
                )}
              </>
            ) : (
              <p className="mt-2 rounded-2xl bg-white p-3 text-sm text-ink-soft">Этот браузер не поддерживает синтез речи. Сказку можно читать вслух самостоятельно или записать голос родителя.</p>
            )}

            <p className="mt-5 mb-2 flex items-center gap-1.5 text-sm font-bold text-ink-soft"><Moon className="h-4 w-4" /> Фоновая музыка {musicOn ? '· играет' : ''}</p>
            <div className="grid gap-2">
              {MUSIC_TRACKS.map((tr) => (
                <button key={tr.id} onClick={() => onMusicTrack(tr.id)} className={`flex min-h-12 items-center justify-between rounded-2xl px-4 text-left ring-1 ${settings.musicTrack === tr.id ? 'bg-ink text-white ring-ink' : 'bg-white ring-ink/10'}`}>
                  <span className="font-bold">{tr.title}</span>
                  <span className="text-xs opacity-70">{tr.description}</span>
                </button>
              ))}
            </div>
            <label className="mt-3 block text-sm font-bold text-ink-soft">Громкость музыки</label>
            <input className="range mt-2 mb-6" type="range" min={0.05} max={0.8} step={0.05} value={settings.musicVolume} onChange={(e) => update({ musicVolume: Number(e.target.value) })} aria-label="Громкость музыки" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
