import { memo, useId } from 'react';
import type { Appearance, IllustrationSpec, PropKind } from '../types';
import { Backdrop } from './Backdrop';
import { Heroine } from './Heroine';
import { FLOATING_KINDS, PropShape } from './Props';
import { SKY } from './palette';

/** Базовый масштаб предметов относительно героини. */
const BASE_SCALE: Partial<Record<PropKind, number>> = {
  star: 1.2, bunny: 1.35, unicorn: 1.25, owl: 1.4, fox: 1.4, bear: 1.4, hedgehog: 1.4, squirrel: 1.35,
  butterfly: 1.3, bird: 1.4, fish: 1.4, turtle: 1.4, dolphin: 1.3, cat: 1.35, puppy: 1.35, teddy: 1.35, doll: 1.3,
  mama: 0.92, papa: 0.92, grandma: 0.92, grandpa: 0.92, sibling: 0.95,
  rocket: 1.2, planet: 1.2, comet: 1.2, cake: 1.25, balloons: 1.3, gift: 1.2, lantern: 1.2, flowers: 1.3,
  mushroom: 1.3, carrot: 1.1, basket: 1.2, book: 1.2, rainbow: 1.3, bridge: 1.6, crown: 1.3, key: 1.2,
  shell: 1.2, cloud: 1.35, moonface: 1.2, tree: 1.1, treehouse: 1.1, apple: 1.2, cup: 1.1, blocks: 1.2,
  heart: 1.2, snail: 1.3, frog: 1.3, pillow: 1.2,
};

/** Предметы, которым объёмная подсветка не нужна (они и так светятся или прозрачные). */
const NO_VOLUME: PropKind[] = ['rainbow', 'comet', 'star', 'moonface', 'cloud', 'heart', 'bridge'];

interface Props {
  spec: IllustrationSpec;
  appearance: Appearance;
  animate?: boolean;
  className?: string;
  label?: string;
}

function SceneArtInner({ spec, appearance, animate = true, className, label }: Props) {
  const uid = 'k' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const time = spec.time ?? 'day';
  const palette = SKY[time];
  const indoor = ['bedroom', 'home', 'party', 'kindergarten'].includes(spec.setting);
  const night = time === 'night' || spec.setting === 'space' || spec.setting === 'moon';

  type Item = { y: number; key: string; node: JSX.Element };
  const items: Item[] = [];

  (spec.props ?? []).forEach((p, i) => {
    const floating = FLOATING_KINDS.includes(p.kind);
    const s = (p.scale ?? 1) * (BASE_SCALE[p.kind] ?? 1.2);
    const x = (p.x / 100) * 400;
    const y = (p.y / 100) * 300;
    items.push({
      y: floating ? y - 200 : y,
      key: `p${i}`,
      node: (
        <g key={`p${i}`} transform={`translate(${x} ${y})`}>
          <g className={p.float && animate ? 'anim-float' : undefined} style={p.float ? { animationDelay: `${(i * 0.7) % 3}s` } : undefined}>
            <g transform={`scale(${p.flip ? -s : s} ${s})`} filter={p.glow ? `url(#${uid}-glowsoft)` : undefined}>
              <g filter={animate && !NO_VOLUME.includes(p.kind) ? `url(#${uid}-vol)` : undefined}>
                <PropShape kind={p.kind} variant={p.variant} uid={uid} />
              </g>
            </g>
          </g>
        </g>
      ),
    });
  });

  if (spec.heroine) {
    const h = spec.heroine;
    const s = h.scale ?? 1;
    const x = (h.x / 100) * 400;
    const y = ((h.y ?? 86) / 100) * 300;
    items.push({
      y,
      key: 'hero',
      node: (
        <g key="hero" transform={`translate(${x} ${y})`}>
          <g className={animate && h.pose === 'jump' ? 'anim-bounce' : animate && h.pose !== 'sleep' ? 'anim-breathe' : undefined}>
            <g transform={`scale(${h.flip ? -s : s} ${s})`} filter={animate ? `url(#${uid}-vol)` : undefined}>
              <Heroine placement={h} appearance={appearance} uid={uid} />
            </g>
          </g>
        </g>
      ),
    });
  }
  items.sort((a, b) => a.y - b.y);

  const heroX = spec.heroine ? (spec.heroine.x / 100) * 400 : 200;

  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className={`${className ?? ''} ${animate ? '' : 'svg-static'}`}
      role="img"
      aria-label={label ?? 'Иллюстрация к сцене'}
    >
      <defs>
        <filter id={`${uid}-glow`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${uid}-glowsoft`} x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feColorMatrix in="b" type="matrix" values="1 0 0 0.25 0  0 1 0 0.2 0  0 0 1 0 0  0 0 0 0.9 0" result="g" />
          <feMerge>
            <feMergeNode in="g" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${uid}-blur`} x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
        {/* Объём: мягкая тень по нижнему правому краю и блик сверху слева */}
        <filter id={`${uid}-vol`} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3.2" result="b" />
          <feOffset in="b" dx="-3.5" dy="-4" result="o1" />
          <feComposite in="SourceAlpha" in2="o1" operator="out" result="rimDark" />
          <feFlood floodColor="#2A1850" floodOpacity="0.32" />
          <feComposite in2="rimDark" operator="in" result="shadow" />
          <feOffset in="b" dx="3" dy="3.5" result="o2" />
          <feComposite in="SourceAlpha" in2="o2" operator="out" result="rimLight" />
          <feFlood floodColor="#FFF6DD" floodOpacity="0.38" />
          <feComposite in2="rimLight" operator="in" result="light" />
          {/* Ночью персонажи чуть темнее и холоднее, чтобы вписывались в сцену */}
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values={night ? '0.74 0 0 0 0.02  0 0.76 0 0 0.03  0 0 0.86 0 0.08  0 0 0 1 0' : '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0'}
            result="tinted"
          />
          <feMerge>
            <feMergeNode in="tinted" />
            <feMergeNode in="shadow" />
            <feMergeNode in="light" />
          </feMerge>
        </filter>
        {/* Фактура бумаги и красок */}
        <filter id={`${uid}-paper`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.42  0 0 0 0 0.35  0 0 0 0.9 0" />
        </filter>
        <radialGradient id={`${uid}-vig`} cx="0.5" cy="0.45" r="0.75">
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#140F30" stopOpacity={night ? 0.5 : 0.22} />
        </radialGradient>
        <linearGradient id={`${uid}-light`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor={palette.light} stopOpacity={palette.lightOpacity} />
          <stop offset="1" stopColor={palette.light} stopOpacity="0" />
        </linearGradient>
      </defs>

      {spec.imageUrl ? (
        <image href={spec.imageUrl} width="400" height="300" preserveAspectRatio="xMidYMid slice" />
      ) : (
        <>
          <Backdrop setting={spec.setting} time={time} uid={uid} />
          {items.map((it) => it.node)}
          <Fx kinds={spec.fx ?? []} heroX={heroX} uid={uid} indoor={indoor} />
          {animate && <rect width="400" height="300" filter={`url(#${uid}-paper)`} opacity="0.07" style={{ mixBlendMode: 'multiply' }} />}
        </>
      )}
      <rect width="400" height="300" fill={`url(#${uid}-light)`} style={{ mixBlendMode: 'soft-light' }} />
      <rect width="400" height="300" fill={`url(#${uid}-vig)`} />
    </svg>
  );
}

function rnd(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function Fx({ kinds, heroX, uid, indoor }: { kinds: NonNullable<IllustrationSpec['fx']>; heroX: number; uid: string; indoor: boolean }) {
  return (
    <g pointerEvents="none">
      {kinds.map((k) => {
        const r = rnd(k.length * 31 + 7);
        switch (k) {
          case 'fireflies':
            return (
              <g key={k}>
                {Array.from({ length: 14 }, (_, i) => (
                  <circle key={i} cx={r() * 400} cy={140 + r() * 140} r={1.8 + r() * 1.4} fill="#FFF2A6" filter={`url(#${uid}-glow)`} className="anim-firefly" style={{ animationDelay: `${(r() * 6).toFixed(2)}s`, animationDuration: `${5 + r() * 4}s` }} />
                ))}
              </g>
            );
          case 'sparkles':
            return (
              <g key={k}>
                {Array.from({ length: 12 }, (_, i) => (
                  <g key={i} transform={`translate(${r() * 400} ${20 + r() * 220}) scale(${0.6 + r() * 0.8})`}>
                    <path className="anim-twinkle" style={{ animationDelay: `${(r() * 3).toFixed(2)}s` }} d="M0 -6 L1.4 -1.4 L6 0 L1.4 1.4 L0 6 L-1.4 1.4 L-6 0 L-1.4 -1.4 Z" fill="#FFF6D2" filter={`url(#${uid}-glow)`} />
                  </g>
                ))}
              </g>
            );
          case 'snow':
            return (
              <g key={k}>
                {Array.from({ length: 30 }, (_, i) => (
                  <circle key={i} cx={r() * 400} cy={-10} r={1.2 + r() * 2} fill="#FFFFFF" opacity="0.9" className="anim-fall" style={{ animationDelay: `${(r() * 8).toFixed(2)}s`, animationDuration: `${7 + r() * 6}s` }} />
                ))}
              </g>
            );
          case 'rain':
            return (
              <g key={k} stroke="#DDF0FF" strokeWidth="1.2" opacity="0.6">
                {Array.from({ length: 34 }, (_, i) => (
                  <g key={i} transform={`translate(${(r() * 400).toFixed(1)} -16)`}>
                    <line x1="0" y1="0" x2="-3" y2="12" className="anim-rain" style={{ animationDelay: `${(r() * 2).toFixed(2)}s` }} />
                  </g>
                ))}
              </g>
            );
          case 'bubbles':
            return (
              <g key={k}>
                {Array.from({ length: 16 }, (_, i) => (
                  <circle key={i} cx={r() * 400} cy={310} r={2 + r() * 5} fill="#FFFFFF" fillOpacity="0.15" stroke="#FFFFFF" strokeOpacity="0.7" className="anim-rise" style={{ animationDelay: `${(r() * 8).toFixed(2)}s`, animationDuration: `${6 + r() * 6}s` }} />
                ))}
              </g>
            );
          case 'petals':
            return (
              <g key={k}>
                {Array.from({ length: 14 }, (_, i) => (
                  <ellipse key={i} cx={r() * 400} cy={-10} rx="3" ry="1.8" fill={i % 2 ? '#FFD1E0' : '#FFFFFF'} className="anim-fall" style={{ animationDelay: `${(r() * 9).toFixed(2)}s`, animationDuration: `${9 + r() * 6}s` }} />
                ))}
              </g>
            );
          case 'confetti':
            return (
              <g key={k}>
                {Array.from({ length: 26 }, (_, i) => (
                  <rect key={i} x={r() * 400} y={-10} width="4" height="7" rx="1" fill={['#F29BB5', '#FFD27A', '#9FC7F0', '#B9E3A8', '#C9B2F0'][i % 5]} className="anim-fall" style={{ animationDelay: `${(r() * 6).toFixed(2)}s`, animationDuration: `${6 + r() * 5}s` }} />
                ))}
              </g>
            );
          case 'zzz':
            return (
              <g key={k} fill={indoor ? '#8C7FC0' : '#E9E3FF'} fontWeight="800" fontFamily="inherit">
                {[0, 1, 2].map((i) => (
                  <text key={i} x={heroX - 30 + i * 12} y={170 - i * 16} fontSize={12 + i * 4} className="anim-zzz" style={{ animationDelay: `${i * 0.9}s` }}>
                    z
                  </text>
                ))}
              </g>
            );
          default:
            return null;
        }
      })}
    </g>
  );
}

export const SceneArt = memo(SceneArtInner);
