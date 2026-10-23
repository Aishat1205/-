import { CheckCircle2, Globe, Shield, Share, SquarePlus, Smartphone } from 'lucide-react';
import { Card, PageHeader } from '../components/ui';
import { useApp } from '../state/AppContext';
import { LIBRARY } from '../data/stories';

const OFFLINE = [
  'Библиотека из 8 встроенных сказок и все иллюстрации',
  'Чтение по сценам, сохранение прогресса, избранное и история',
  'Создание сказок из локальных шаблонов',
  'Профиль героя и настройка внешности',
  'Фоновая музыка (синтезируется в браузере)',
  'Запись и прослушивание голоса родителя',
  'Озвучивание — если голос синтезатора установлен на устройстве',
];
const ONLINE = [
  'Первая загрузка приложения и шрифтов',
  'AI-генерация сказок (только если владелец настроил сервер)',
  'Некоторые голоса синтеза речи (например, сетевые голоса Google в Chrome)',
];

export function About() {
  const { serverStatus } = useApp();
  return (
    <div>
      <PageHeader back title="О приложении" subtitle="Волшебный мир Коркем · версия 1.0" />
      <div className="mx-auto grid max-w-3xl gap-4 px-4 sm:px-6">
        <Card>
          <p className="font-serif text-[1.08rem] leading-relaxed">
            Персональная библиотека сказок, в которых ребёнок — главный герой. Все тексты, иллюстрации и мелодии созданы специально для этого приложения.
          </p>
          <p className="mt-3 text-sm text-ink-soft">Встроенных сказок: {LIBRARY.length}. AI-сервер: {serverStatus.story ? 'подключён' : 'не подключён (работает локальный режим)'}.</p>
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 font-serif text-lg font-semibold"><Shield className="h-5 w-5 text-[#8a74d8]" /> Приватность</h2>
          <ul className="mt-3 space-y-2 text-[0.97rem]">
            <li>• Нет рекламы, аналитики, аккаунтов и социальных функций.</li>
            <li>• Профиль, история, фото и записи голоса хранятся только в этом браузере.</li>
            <li>• Фото и голос никуда не отправляются.</li>
            <li>• При AI-генерации имя ребёнка не передаётся: оно подставляется на устройстве.</li>
          </ul>
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 font-serif text-lg font-semibold"><CheckCircle2 className="h-5 w-5 text-[#3f8a5a]" /> Работает без интернета</h2>
          <p className="mt-1 text-sm text-ink-soft">После первого открытия приложение кэшируется на устройстве.</p>
          <ul className="mt-3 space-y-1.5">
            {OFFLINE.map((x) => (
              <li key={x} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#3f8a5a]" />{x}</li>
            ))}
          </ul>
          <h3 className="mt-5 flex items-center gap-2 font-serif font-semibold"><Globe className="h-5 w-5 text-[#8a74d8]" /> Требует интернета</h3>
          <ul className="mt-2 space-y-1.5">
            {ONLINE.map((x) => (
              <li key={x} className="flex gap-2"><Globe className="mt-0.5 h-4 w-4 shrink-0 text-[#8a74d8]" />{x}</li>
            ))}
          </ul>
        </Card>

        <Card className="mb-2">
          <h2 className="flex items-center gap-2 font-serif text-lg font-semibold"><Smartphone className="h-5 w-5 text-[#8a74d8]" /> Установка на iPhone</h2>
          <ol className="mt-3 space-y-3">
            <li className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lavender-soft font-bold">1</span>Откройте приложение в Safari по адресу с https://</li>
            <li className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lavender-soft font-bold">2</span><span>Нажмите кнопку «Поделиться» <Share className="inline h-4 w-4" /> внизу экрана.</span></li>
            <li className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lavender-soft font-bold">3</span><span>Выберите «На экран „Домой“» <SquarePlus className="inline h-4 w-4" />.</span></li>
            <li className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lavender-soft font-bold">4</span>Нажмите «Добавить». Иконка «Мир Коркем» появится на главном экране и откроется без адресной строки.</li>
          </ol>
          <p className="mt-4 text-sm text-ink-soft">Для записи голоса нужен доступ к микрофону — iPhone разрешает его только на сайтах с https. На iPhone озвучивание работает, если не включён беззвучный режим.</p>
        </Card>
      </div>
    </div>
  );
}
