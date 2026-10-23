import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AppSettings, ChildProfile, FairyTale, FavoriteStory, HistoryEntry, ReadingProgress } from '../types';
import { LIBRARY } from '../data/stories';
import { declineName, renderText, type Persona } from '../lib/grammar';
import { load, removeAll, save, setStorageErrorListener } from '../lib/storage';
import { idbAll, idbClear, idbDelete, idbSet } from '../lib/idb';
import { fetchServerStatus, type ServerStatus } from '../services/storyGenerator';
import { music } from '../services/music';
import { createSpeechProvider } from '../services/speech';

export const DEFAULT_PROFILE: ChildProfile = {
  id: 'child-1',
  name: 'Коркем',
  age: 3,
  gender: 'female',
  nameForms: declineName('Коркем', 'female'),
  customForms: false,
  appearance: {
    skinTone: '#EDC6A8',
    hairColor: '#3E2A22',
    hairStyle: 'buns',
    eyeColor: '#4A3426',
    outfitColor: '#F2A0BE',
    outfitStyle: 'dress',
    accessory: 'bow',
    accessoryColor: '#FFD66B',
    cheeks: true,
    freckles: false,
  },
  preferences: { favoriteColors: ['#F2A0BE', '#B9A2E8'], favoriteAnimal: 'зайчик', notes: '' },
};

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'ru',
  musicEnabled: false,
  musicVolume: 0.35,
  musicTrack: 'stars',
  animationsEnabled: true,
  soundEnabled: true,
  fontSize: 'l',
  readingMode: 'self',
  voiceSource: 'tts',
  autoAdvance: false,
  speechRate: 0.9,
  speechVolume: 1,
  voiceURI: null,
  bedtimeMode: false,
  aiEnabled: false,
};

interface Toast {
  id: number;
  text: string;
  tone: 'info' | 'error' | 'success';
}

interface AppState {
  profile: ChildProfile;
  settings: AppSettings;
  persona: Persona;
  stories: FairyTale[];
  generated: FairyTale[];
  favorites: FavoriteStory[];
  progress: Record<string, ReadingProgress>;
  history: HistoryEntry[];
  lastStoryId: string | null;
  serverStatus: ServerStatus;
  reducedMotion: boolean;
  toasts: Toast[];
  /** Подставляет имя героя. Если передана сказка со своим героем — используется он. */
  t: (text: string, story?: FairyTale) => string;
  getStory: (id: string) => FairyTale | undefined;
  updateProfile: (patch: Partial<ChildProfile>) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  toggleFavorite: (storyId: string) => void;
  isFavorite: (storyId: string) => boolean;
  saveProgress: (storyId: string, scene: number, completed?: boolean) => void;
  markOpened: (story: FairyTale) => void;
  addGenerated: (story: FairyTale) => Promise<void>;
  removeGenerated: (id: string) => Promise<void>;
  clearHistory: () => void;
  wipeAll: () => Promise<void>;
  notify: (text: string, tone?: Toast['tone']) => void;
  dismissToast: (id: number) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ChildProfile>(() => ({ ...DEFAULT_PROFILE, ...load('profile', DEFAULT_PROFILE) }));
  const [settings, setSettings] = useState<AppSettings>(() => ({ ...DEFAULT_SETTINGS, ...load('settings', DEFAULT_SETTINGS) }));
  const [favorites, setFavorites] = useState<FavoriteStory[]>(() => load('favorites', []));
  const [progress, setProgress] = useState<Record<string, ReadingProgress>>(() => load('progress', {}));
  const [history, setHistory] = useState<HistoryEntry[]>(() => load('history', []));
  const [lastStoryId, setLastStoryId] = useState<string | null>(() => load('lastStory', null));
  const [generated, setGenerated] = useState<FairyTale[]>([]);
  const [serverStatus, setServerStatus] = useState<ServerStatus>({ story: false, illustration: false, model: null, tts: null });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [systemReduced, setSystemReduced] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const toastId = useRef(0);

  const notify = useCallback((text: string, tone: Toast['tone'] = 'info') => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, text, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === 'error' ? 6000 : 3500);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  useEffect(() => setStorageErrorListener((m) => notify(m, 'error')), [notify]);

  useEffect(() => {
    if (typeof matchMedia === 'undefined') return;
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const fn = () => setSystemReduced(mq.matches);
    mq.addEventListener?.('change', fn);
    return () => mq.removeEventListener?.('change', fn);
  }, []);

  useEffect(() => {
    idbAll<FairyTale>('stories')
      .then((list) => setGenerated(list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))))
      .catch(() => {});
    fetchServerStatus().then(setServerStatus);
  }, []);

  useEffect(() => void save('profile', profile), [profile]);
  useEffect(() => void save('settings', settings), [settings]);
  useEffect(() => void save('favorites', favorites), [favorites]);
  useEffect(() => void save('progress', progress), [progress]);
  useEffect(() => void save('history', history), [history]);
  useEffect(() => void save('lastStory', lastStoryId), [lastStoryId]);

  const reducedMotion = systemReduced || !settings.animationsEnabled;
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reducedMotion);
  }, [reducedMotion]);
  useEffect(() => {
    document.documentElement.dataset.font = settings.fontSize;
  }, [settings.fontSize]);

  const persona = useMemo<Persona>(() => ({ forms: profile.nameForms, gender: profile.gender }), [profile.nameForms, profile.gender]);
  const t = useCallback((text: string, story?: FairyTale) => renderText(text, story?.hero ?? persona), [persona]);

  const stories = useMemo(() => [...generated, ...LIBRARY], [generated]);
  const getStory = useCallback((id: string) => stories.find((s) => s.id === id), [stories]);

  const updateProfile = useCallback((patch: Partial<ChildProfile>) => {
    setProfile((p) => {
      const next = { ...p, ...patch, appearance: { ...p.appearance, ...(patch.appearance ?? {}) } };
      if ((patch.name !== undefined || patch.gender !== undefined) && !next.customForms) {
        next.nameForms = declineName(next.name || 'Коркем', next.gender);
      }
      return next;
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((s) => ({ ...s, ...patch }));
    if (patch.musicVolume !== undefined) music.setVolume(patch.musicVolume);
    if (patch.musicEnabled === false) music.stop(1.5);
    if (patch.soundEnabled === false) {
      music.stop(0.8);
      createSpeechProvider().stop();
    }
  }, []);

  const toggleFavorite = useCallback((storyId: string) => {
    setFavorites((f) => (f.some((x) => x.storyId === storyId) ? f.filter((x) => x.storyId !== storyId) : [{ storyId, createdAt: Date.now() }, ...f]));
  }, []);
  const isFavorite = useCallback((storyId: string) => favorites.some((f) => f.storyId === storyId), [favorites]);

  const saveProgress = useCallback((storyId: string, scene: number, completed = false) => {
    setProgress((p) => ({ ...p, [storyId]: { storyId, currentScene: scene, updatedAt: Date.now(), completed: completed || (p[storyId]?.completed ?? false) } }));
    setLastStoryId(storyId);
    if (completed) setHistory((h) => h.map((e, i) => (i === 0 && e.storyId === storyId ? { ...e, completed: true } : e)));
  }, []);

  const markOpened = useCallback(
    (story: FairyTale) => {
      setLastStoryId(story.id);
      setHistory((h) => {
        const title = renderText(story.title, story.hero ?? persona);
        const recent = h[0];
        // Не дублируем запись, если та же сказка открыта повторно в течение часа
        if (recent && recent.storyId === story.id && Date.now() - recent.openedAt < 3600_000) return h;
        return [{ storyId: story.id, title, openedAt: Date.now(), completed: false }, ...h].slice(0, 100);
      });
    },
    [persona],
  );

  const addGenerated = useCallback(
    async (story: FairyTale) => {
      setGenerated((g) => [story, ...g.filter((x) => x.id !== story.id)]);
      try {
        await idbSet('stories', story.id, story);
      } catch {
        notify('Сказка открыта, но не сохранилась на устройстве: хранилище недоступно.', 'error');
      }
    },
    [notify],
  );

  const removeGenerated = useCallback(async (id: string) => {
    setGenerated((g) => g.filter((x) => x.id !== id));
    setFavorites((f) => f.filter((x) => x.storyId !== id));
    try {
      await idbDelete('stories', id);
    } catch {
      /* ignore */
    }
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setProgress({});
    setLastStoryId(null);
  }, []);

  const wipeAll = useCallback(async () => {
    music.stop(0.3);
    createSpeechProvider().stop();
    removeAll();
    await Promise.allSettled([idbClear('audio'), idbClear('stories'), idbClear('photos')]);
    setProfile(DEFAULT_PROFILE);
    setSettings(DEFAULT_SETTINGS);
    setFavorites([]);
    setProgress({});
    setHistory([]);
    setLastStoryId(null);
    setGenerated([]);
  }, []);

  const value: AppState = {
    profile,
    settings,
    persona,
    stories,
    generated,
    favorites,
    progress,
    history,
    lastStoryId,
    serverStatus,
    reducedMotion,
    toasts,
    t,
    getStory,
    updateProfile,
    updateSettings,
    toggleFavorite,
    isFavorite,
    saveProgress,
    markOpened,
    addGenerated,
    removeGenerated,
    clearHistory,
    wipeAll,
    notify,
    dismissToast,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp вне AppProvider');
  return v;
}
