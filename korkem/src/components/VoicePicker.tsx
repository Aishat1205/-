import { useApp } from '../state/AppContext';
import { Segmented } from './ui';
import type { VoiceSource } from '../types';

const TTS_NAMES: Record<string, string> = { yandex: 'Yandex SpeechKit', elevenlabs: 'ElevenLabs', openai: 'OpenAI' };

/** Выбор, кто читает сказку: голос браузера, живой (нейросетевой) голос или запись родителя. */
export function VoicePicker() {
  const { settings, updateSettings, serverStatus } = useApp();
  const cloud = !!serverStatus.tts;
  const options: Array<{ id: VoiceSource; label: string }> = [
    ...(cloud ? [{ id: 'cloud' as const, label: 'Живой голос' }] : []),
    { id: 'tts', label: 'Голос браузера' },
    { id: 'parent', label: 'Папа читает' },
  ];
  const value = settings.voiceSource === 'cloud' && !cloud ? 'tts' : settings.voiceSource;
  return (
    <div>
      <Segmented ariaLabel="Кто читает сказку" value={value} onChange={(v) => updateSettings({ voiceSource: v })} options={options} />
      <p className="mt-2 text-sm text-ink-soft">
        {value === 'cloud' &&
          `Нейросетевой голос (${TTS_NAMES[serverStatus.tts!] ?? serverStatus.tts}) звучит почти как человек. Текст сцены вместе с именем ребёнка отправляется сервису озвучивания; прослушанные сцены сохраняются на устройстве и дальше работают без интернета.`}
        {value === 'tts' &&
          (cloud
            ? 'Голос, встроенный в браузер и систему. Работает без интернета, но звучит менее естественно, чем живой голос.'
            : 'Голос, встроенный в браузер и систему. Чтобы он звучал живее: на Mac и iPhone скачайте голос «Милена (улучшенный)» в Настройках → Универсальный доступ → Устный контент, в Chrome выберите «Google русский», в Microsoft Edge — «Svetlana Online (Natural)». Живой нейросетевой голос можно подключить на сервере (см. README).')}
        {value === 'parent' && 'Звучит ваша запись для каждой сцены. Где записи нет, читает голос браузера.'}
      </p>
    </div>
  );
}
