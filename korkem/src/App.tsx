import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, MemoryRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { AppProvider } from './state/AppContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Library, Categories, CategoryPage } from './pages/Library';
import { StoryDetail } from './pages/StoryDetail';
import { Reader } from './pages/Reader';
import { Create } from './pages/Create';
import { Favorites } from './pages/Favorites';
import { History } from './pages/History';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { About } from './pages/About';
import { RecordStudio } from './pages/RecordStudio';
import { EmptyState } from './components/ui';

// В сборке для Artifact адресная строка недоступна — используем маршрутизацию в памяти.
const Router = import.meta.env.VITE_ARTIFACT ? MemoryRouter : BrowserRouter;

const DevGallery = import.meta.env.DEV ? lazy(() => import('./pages/DevGallery')) : null;

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 pt-24">
      <EmptyState title="Такой страницы нет" text="Кажется, эта тропинка никуда не ведёт." action={<Link to="/" className="inline-flex min-h-12 items-center rounded-2xl bg-ink px-5 font-bold text-white">На главную</Link>} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/library" element={<Library />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:id" element={<CategoryPage />} />
            <Route path="/story/:id" element={<StoryDetail />} />
            <Route path="/read/:id" element={<Reader />} />
            <Route path="/record/:id" element={<RecordStudio />} />
            <Route path="/create" element={<Create />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<About />} />
            {DevGallery && <Route path="/__gallery" element={<Suspense fallback={null}><DevGallery /></Suspense>} />}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}
