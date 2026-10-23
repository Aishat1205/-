import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, Library, Wand2, Heart, UserRound } from 'lucide-react';
import { Toasts } from './ui';

const NAV = [
  { to: '/', label: 'Главная', icon: Home, end: true },
  { to: '/library', label: 'Сказки', icon: Library },
  { to: '/create', label: 'Создать', icon: Wand2, accent: true },
  { to: '/favorites', label: 'Избранное', icon: Heart },
  { to: '/profile', label: 'Профиль', icon: UserRound },
];

export function Layout() {
  const loc = useLocation();
  const hideNav = loc.pathname.startsWith('/read/');
  return (
    <div className="app-bg min-h-full">
      <Toasts />
      <main className={hideNav ? '' : 'pb-nav'}>
        <Outlet />
      </main>
      {!hideNav && (
        <nav className="fixed inset-x-0 bottom-0 z-40 px-3" style={{ paddingBottom: 'calc(var(--safe-bottom) + 0.6rem)' }} aria-label="Основная навигация">
          <div className="mx-auto flex max-w-md bg-white/92 backdrop-blur-xl items-stretch justify-between rounded-[1.75rem] px-2 py-1.5 shadow-lift ring-1 ring-white/70">
            {NAV.map(({ to, label, icon: Icon, end, accent }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl text-[0.7rem] font-bold transition ${
                    accent ? '' : isActive ? 'text-ink' : 'text-ink-soft/80'
                  }`
                }
              >
                {({ isActive }) =>
                  accent ? (
                    <>
                      <span className="-mt-5 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#8a74d8] to-[#e58db0] text-white shadow-lift ring-4 ring-cream">
                        <Icon className="h-6 w-6" />
                      </span>
                      <span className={isActive ? 'text-ink' : 'text-ink-soft/80'}>{label}</span>
                    </>
                  ) : (
                    <>
                      <span className={`grid h-8 w-12 place-items-center rounded-full transition ${isActive ? 'bg-lavender-soft' : ''}`}>
                        <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.4 : 2} />
                      </span>
                      {label}
                    </>
                  )
                }
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
