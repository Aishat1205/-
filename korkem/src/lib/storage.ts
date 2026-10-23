/** Простые настройки и прогресс — в localStorage. Все операции защищены от ошибок. */
const PREFIX = 'korkem:';

export type StorageListener = (message: string) => void;
let onError: StorageListener = () => {};
export const setStorageErrorListener = (fn: StorageListener) => {
  onError = fn;
};

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch (e) {
    const quota = e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22);
    onError(quota ? 'Хранилище браузера переполнено. Очистите историю чтения в настройках.' : 'Не удалось сохранить данные на устройстве.');
    return false;
  }
}

export function removeAll() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}
