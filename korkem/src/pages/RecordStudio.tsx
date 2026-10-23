import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Mic, Pause, Play, RotateCcw, Square, Trash2, AlertTriangle, BookOpen } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { PageHeader, Toggle } from '../components/ui';
import { SceneArt } from '../illustrations/SceneArt';
import { VoiceRecorder, deleteRecording, listRecordings, loadRecording, recorderSupport, recordingKey, saveRecording } from '../services/recorder';

export function RecordStudio() {
  const { id = '' } = useParams();
  const { getStory, t, profile, settings, updateSettings, notify } = useApp();
  const story = getStory(id);
  const support = recorderSupport();
  const [have, setHave] = useState<Set<string>>(new Set());
  const [recordingScene, setRecordingScene] = useState<string | null>(null);
  const [playingScene, setPlayingScene] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const recorder = useRef<VoiceRecorder | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const timer = useRef<number | null>(null);

  const refresh = () => listRecordings().then((keys) => setHave(new Set(keys)));
  useEffect(() => {
    refresh();
    return () => {
      recorder.current?.cancel();
      audio.current?.pause();
      if (timer.current) window.clearInterval(timer.current);
    };
  }, []);

  if (!story) return <PageHeader back title="Сказка не найдена" />;

  const start = async (sceneId: string) => {
    if (recordingScene) return;
    stopPlayback();
    const rec = new VoiceRecorder();
    try {
      await rec.start();
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Не удалось включить микрофон', 'error');
      return;
    }
    recorder.current = rec;
    setRecordingScene(sceneId);
    setSeconds(0);
    timer.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
  };

  const stop = async () => {
    const rec = recorder.current;
    const sceneId = recordingScene;
    if (!rec || !sceneId) return;
    if (timer.current) window.clearInterval(timer.current);
    try {
      const { blob, durationMs } = await rec.stop();
      if (blob.size < 500) throw new Error('Запись получилась пустой. Попробуйте ещё раз.');
      await saveRecording(story.id, sceneId, blob, durationMs);
      notify('Запись сохранена', 'success');
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Ошибка записи', 'error');
    } finally {
      recorder.current = null;
      setRecordingScene(null);
      refresh();
    }
  };

  const stopPlayback = () => {
    audio.current?.pause();
    setPlayingScene(null);
  };

  const play = async (sceneId: string) => {
    if (playingScene === sceneId) return stopPlayback();
    stopPlayback();
    const blob = await loadRecording(story.id, sceneId);
    if (!blob) return notify('Запись не найдена', 'error');
    const url = URL.createObjectURL(blob);
    const el = new Audio(url);
    audio.current = el;
    el.onended = () => {
      setPlayingScene(null);
      URL.revokeObjectURL(url);
    };
    setPlayingScene(sceneId);
    el.play().catch(() => {
      setPlayingScene(null);
      notify('Не удалось воспроизвести запись', 'error');
    });
  };

  const remove = async (sceneId: string) => {
    await deleteRecording(story.id, sceneId).catch(() => {});
    refresh();
  };

  const recorded = story.scenes.filter((s) => have.has(recordingKey(story.id, s.id))).length;

  return (
    <div>
      <PageHeader back title="Папа читает сказку" subtitle={t(story.title, story)} />
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-[1.75rem] bg-white/85 p-5 shadow-soft">
          <p className="text-[0.98rem]">Запишите свой голос для каждой сцены. При чтении с режимом «Папа читает» вместо синтезатора будет звучать ваша запись. Записи хранятся только на этом устройстве.</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="font-bold">Записано: {recorded} из {story.scenes.length}</p>
            <Link to={`/read/${story.id}`} className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-ink px-4 font-bold text-white"><BookOpen className="h-4 w-4" /> Читать</Link>
          </div>
          <Toggle label="Использовать мой голос при чтении" checked={settings.voiceSource === 'parent'} onChange={(v) => updateSettings({ voiceSource: v ? 'parent' : 'tts' })} />
        </div>

        {!support.ok && (
          <div className="mt-4 flex gap-3 rounded-[1.5rem] bg-[#fff3d6] p-4 text-[#7a5410]">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{support.reason} Остальные функции приложения работают как обычно.</p>
          </div>
        )}

        <ol className="mt-4 grid gap-3">
          {story.scenes.map((s, i) => {
            const has = have.has(recordingKey(story.id, s.id));
            const isRec = recordingScene === s.id;
            return (
              <li key={s.id} className={`overflow-hidden rounded-[1.5rem] bg-white shadow-soft ${isRec ? 'ring-3 ring-[#e58db0]' : ''}`}>
                <div className="flex gap-3 p-3">
                  <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl">
                    <SceneArt spec={s.illustration} appearance={profile.appearance} animate={false} className="h-full w-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#8a74d8]">Сцена {i + 1} {has && '· записано'}</p>
                    <p className="mt-1 line-clamp-3 font-serif text-[0.98rem] leading-snug">{t(s.text, story)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 border-t border-ink/5 px-3 py-2.5">
                  {isRec ? (
                    <button onClick={stop} className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[#d4567a] px-4 font-bold text-white">
                      <Square className="h-4 w-4" fill="currentColor" /> Остановить · {seconds} с
                    </button>
                  ) : (
                    <button onClick={() => start(s.id)} disabled={!support.ok || !!recordingScene} className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-lavender-soft px-4 font-bold disabled:opacity-40">
                      {has ? <RotateCcw className="h-4 w-4" /> : <Mic className="h-4 w-4" />} {has ? 'Перезаписать' : 'Записать'}
                    </button>
                  )}
                  {has && !isRec && (
                    <>
                      <button onClick={() => play(s.id)} className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-cream px-4 font-bold">
                        {playingScene === s.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} {playingScene === s.id ? 'Пауза' : 'Прослушать'}
                      </button>
                      <button onClick={() => remove(s.id)} className="ml-auto grid h-11 w-11 place-items-center rounded-2xl text-[#c24870]" aria-label="Удалить запись">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  {isRec && <span className="ml-auto inline-flex items-center gap-2 text-sm font-bold text-[#d4567a]"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#d4567a]" /> Идёт запись</span>}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
