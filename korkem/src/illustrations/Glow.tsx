import { useId } from 'react';

/** Мягкое свечение радиальным градиентом (дешевле и надёжнее, чем фильтр размытия). */
export function Glow({ cx = 0, cy = 0, r, color, opacity }: { cx?: number; cy?: number; r: number; color: string; opacity: number }) {
  const id = 'gl' + useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={color} stopOpacity={Math.min(1, opacity * 2)} />
          <stop offset="0.45" stopColor={color} stopOpacity={opacity} />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
    </>
  );
}
