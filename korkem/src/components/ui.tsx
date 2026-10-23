import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useApp } from '../state/AppContext';

export function PageHeader({ title, subtitle, back = false, right }: { title: string; subtitle?: string; back?: boolean; right?: ReactNode }) {
  const nav = useNavigate();
  return (
    <header className="pt-safe px-4 sm:px-6">
      <div className="mx-auto flex max-w-5xl items-center gap-3 pt-3 pb-4">
        {back && (
          <button
            onClick={() => (window.history.length > 1 ? nav(-1) : nav('/'))}
            className="glass grid h-11 w-11 shrink-0 place-items-center rounded-2xl shadow-soft"
            aria-label="Назад"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-[1.65rem] leading-tight font-semibold text-ink sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-0.5 text-[0.95rem] text-ink-soft">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="font-serif text-xl font-semibold text-ink sm:text-2xl">{children}</h2>
      {action}
    </div>
  );
}

export function Toggle({ checked, onChange, label, hint, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string; disabled?: boolean }) {
  return (
    <label className={`flex min-h-14 items-center justify-between gap-4 py-2 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
      <span className="min-w-0">
        <span className="block font-semibold">{label}</span>
        {hint && <span className="block text-sm text-ink-soft">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${checked ? 'bg-[#8a74d8]' : 'bg-[#ddd5ee]'}`}
      >
        <span className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : ''}`} />
      </button>
    </label>
  );
}

export function Segmented<T extends string>({ value, options, onChange, ariaLabel }: { value: T; options: Array<{ id: T; label: string }>; onChange: (v: T) => void; ariaLabel: string }) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={`min-h-11 rounded-2xl px-4 py-2 text-[0.95rem] font-bold transition ${
            value === o.id ? 'bg-ink text-white shadow-soft' : 'bg-white/80 text-ink ring-1 ring-ink/10 hover:bg-white'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[1.75rem] bg-white/80 p-5 shadow-soft ring-1 ring-white/60 ${className}`}>{children}</div>;
}

export function ConfirmDialog({ open, title, text, confirmLabel, danger, onConfirm, onCancel }: { open: boolean; title: string; text: string; confirmLabel: string; danger?: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 grid place-items-end bg-night/40 p-4 sm:place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel}>
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="pb-safe w-full max-w-md rounded-[2rem] bg-cream p-6 shadow-lift"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="confirm-title" className="font-serif text-xl font-semibold">{title}</h3>
            <p className="mt-2 text-ink-soft">{text}</p>
            <div className="mt-6 flex gap-3">
              <button onClick={onCancel} className="min-h-12 flex-1 rounded-2xl bg-white font-bold ring-1 ring-ink/10">Отмена</button>
              <button onClick={onConfirm} className={`min-h-12 flex-1 rounded-2xl font-bold text-white ${danger ? 'bg-[#d4567a]' : 'bg-ink'}`}>{confirmLabel}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Toasts() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 px-4 pt-safe">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            onClick={() => dismissToast(t.id)}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className={`pointer-events-auto mt-2 max-w-md rounded-2xl px-4 py-3 text-left text-[0.95rem] font-semibold shadow-lift ${
              t.tone === 'error' ? 'bg-[#fde4ea] text-[#8c2346]' : t.tone === 'success' ? 'bg-[#e3f5e6] text-[#24603a]' : 'glass text-ink'
            }`}
          >
            {t.text}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="rounded-[2rem] bg-white/70 p-8 text-center shadow-soft">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-lavender-soft">
        <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden>
          <path d="M24 6 L28.5 18 L41 18.6 L31 26.4 L34.6 39 L24 31.8 L13.4 39 L17 26.4 L7 18.6 L19.5 18 Z" fill="#F6C76B" />
        </svg>
      </div>
      <h3 className="font-serif text-xl font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-ink-soft">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
