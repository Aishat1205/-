// Заглушка для сборки без Service Worker (например, для просмотра в Artifact).
export function registerSW() {
  return () => Promise.resolve();
}
