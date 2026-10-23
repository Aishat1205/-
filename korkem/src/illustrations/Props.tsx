import type { PropKind } from '../types';
import { shade } from './palette';

/**
 * Библиотека персонажей и предметов. Каждый рисуется относительно точки (0,0):
 * для наземных — середина нижнего края, для парящих — центр.
 */
export const FLOATING_KINDS: PropKind[] = ['star', 'butterfly', 'comet', 'planet', 'moonface', 'cloud', 'heart', 'balloons', 'crown', 'key', 'rainbow'];

interface P {
  variant?: string;
  uid: string;
}

const eye = (x: number, y: number, r = 2.2) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="#2A2238" />
    <circle cx={x + r * 0.35} cy={y - r * 0.35} r={r * 0.38} fill="#FFFFFF" />
  </g>
);

const smile = (x: number, y: number, w = 4, color = '#7A3D4E') => <path d={`M${x - w / 2} ${y} q ${w / 2} ${w * 0.6} ${w} 0`} stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />;
const blush = (x: number, y: number) => <ellipse cx={x} cy={y} rx="3" ry="1.8" fill="#FF8FA8" opacity="0.45" />;
const shadow = (rx: number) => <ellipse cx="0" cy="1" rx={rx} ry={rx * 0.22} fill="#1A1530" opacity="0.16" />;

function Star({ uid }: P) {
  return (
    <g>
      <circle r="30" fill="#FFE9A0" opacity="0.35" filter={`url(#${uid}-blur)`} />
      <path d="M0 -24 L7 -8 L24 -7 L11 4 L15 21 L0 12 L-15 21 L-11 4 L-24 -7 L-7 -8 Z" fill="#FFD866" stroke="#FFC23D" strokeWidth="2" strokeLinejoin="round" />
      <path d="M0 -18 L4 -8 L-2 -6 Z" fill="#FFF6CF" opacity="0.8" />
      {eye(-5, 1, 1.9)}
      {eye(5, 1, 1.9)}
      {smile(0, 6, 5)}
      {blush(-9, 6)}
      {blush(9, 6)}
    </g>
  );
}

function Bunny({ variant }: P) {
  const fur = variant === 'moon' ? '#E6E9F7' : '#CFC6C3';
  const inner = variant === 'moon' ? '#C9D2FF' : '#F6C2CC';
  return (
    <g>
      {shadow(16)}
      <ellipse cx="0" cy="-12" rx="15" ry="13" fill={fur} />
      <circle cx="13" cy="-8" r="5" fill="#FFFFFF" />
      <ellipse cx="-4" cy="-1" rx="6" ry="3" fill={shade(fur, -0.08)} />
      <g transform="translate(-4 -30)">
        <ellipse cx="-5" cy="-18" rx="4.5" ry="13" fill={fur} transform="rotate(-10 -5 -18)" />
        <ellipse cx="-5" cy="-18" rx="2.2" ry="9" fill={inner} transform="rotate(-10 -5 -18)" />
        <ellipse cx="5" cy="-17" rx="4.5" ry="13" fill={fur} transform="rotate(12 5 -17)" />
        <ellipse cx="5" cy="-17" rx="2.2" ry="9" fill={inner} transform="rotate(12 5 -17)" />
        <circle r="12" fill={fur} />
        {eye(-4, -1)}
        {eye(5, -1)}
        <ellipse cx="0.5" cy="4" rx="1.8" ry="1.3" fill="#E58FA0" />
        {blush(-8, 5)}
        {blush(9, 5)}
      </g>
      {variant === 'moon' && <circle cx="0" cy="-20" r="26" fill="#C9D2FF" opacity="0.15" />}
    </g>
  );
}

const UNICORN_MANE: Record<string, string[]> = {
  pale: ['#E6E2EE', '#ECE8F2', '#E1DCEB'],
  red: ['#E6E2EE', '#ECE8F2', '#FF8B8B'],
  orange: ['#E6E2EE', '#FFB27A', '#FF8B8B'],
  green: ['#FFE07A', '#9BDB8E', '#FFB27A', '#FF8B8B'],
  blue: ['#9FD6FF', '#6F8CF0', '#FFE07A', '#9BDB8E', '#FFB27A', '#FF8B8B'],
  rainbow: ['#C49BF0', '#6F8CF0', '#9FD6FF', '#9BDB8E', '#FFE07A', '#FFB27A', '#FF8B8B'],
};

function Unicorn({ variant = 'rainbow', uid }: P) {
  const mane = UNICORN_MANE[variant] ?? UNICORN_MANE.rainbow;
  const body = variant === 'pale' ? '#F1EFF4' : '#FFFFFF';
  return (
    <g>
      {shadow(28)}
      {/* хвост */}
      {mane.slice(0, 4).map((c, i) => (
        <path key={c + i} d={`M-26 -36 q ${-16 - i * 2} ${8 + i * 4} ${-10 - i} ${26 + i * 2}`} stroke={c} strokeWidth="5" fill="none" strokeLinecap="round" />
      ))}
      {/* ноги */}
      {[-18, -8, 10, 20].map((x, i) => (
        <g key={x}>
          <rect x={x - 3.5} y="-22" width="7" height="22" rx="3.5" fill={i % 2 ? body : shade(body, -0.06)} />
          <rect x={x - 3.5} y="-5" width="7" height="5" rx="2" fill="#E2C9F0" />
        </g>
      ))}
      <ellipse cx="0" cy="-32" rx="30" ry="16" fill={body} />
      <ellipse cx="-4" cy="-26" rx="20" ry="7" fill={shade(body, -0.05)} />
      {/* шея и голова */}
      <path d="M14 -40 Q 22 -60 28 -66 L 38 -58 Q 30 -44 26 -30 Z" fill={body} />
      <g transform="translate(34 -66)">
        <ellipse cx="4" cy="2" rx="13" ry="10" fill={body} />
        <ellipse cx="13" cy="5" rx="5" ry="4" fill="#F7DDE8" />
        <path d="M-2 -8 L4 -32 L8 -8 Z" fill={variant === 'pale' ? '#E9E3D4' : '#FFE07A'} filter={variant !== 'pale' ? `url(#${uid}-glow)` : undefined} />
        <path d="M0 -14 L7 -16 M1 -20 L6.5 -22" stroke="#FFFFFF" strokeWidth="1" opacity="0.7" />
        <path d="M-6 -8 L-2 -16 L1 -8 Z" fill={body} />
        {eye(4, 0, 2.4)}
        {blush(8, 5)}
      </g>
      {/* грива */}
      {mane.map((c, i) => (
        <path key={i} d={`M${28 - i * 2.2} ${-72 + i * 5} q -10 6 -14 ${14 + i}`} stroke={c} strokeWidth="5.5" fill="none" strokeLinecap="round" />
      ))}
    </g>
  );
}

function Owl() {
  return (
    <g>
      {shadow(14)}
      <ellipse cx="0" cy="-18" rx="15" ry="18" fill="#A98468" />
      <ellipse cx="0" cy="-12" rx="10" ry="11" fill="#E7D1B5" />
      {[-6, 0, 6].map((x) => (
        <path key={x} d={`M${x - 2} -12 q 2 2 4 0`} stroke="#B89B7E" strokeWidth="1" fill="none" />
      ))}
      <path d="M-14 -34 L-10 -42 L-6 -34 Z M14 -34 L10 -42 L6 -34 Z" fill="#8E6C53" />
      <circle cx="-6" cy="-28" r="6.5" fill="#FFF7E8" />
      <circle cx="6" cy="-28" r="6.5" fill="#FFF7E8" />
      {eye(-6, -28, 3)}
      {eye(6, -28, 3)}
      <path d="M-2 -23 L0 -19 L2 -23 Z" fill="#F2A65A" />
      <path d="M-15 -20 q -6 8 0 16 M15 -20 q 6 8 0 16" stroke="#8E6C53" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M-5 0 l-2 2 M-3 0 l0 2 M3 0 l0 2 M5 0 l2 2" stroke="#F2A65A" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}

function Fox() {
  return (
    <g>
      {shadow(18)}
      <path d="M-14 -10 Q -34 -14 -36 -30 Q -24 -26 -14 -18 Z" fill="#E8874A" />
      <path d="M-36 -30 Q -32 -24 -28 -26 Z" fill="#FFFFFF" />
      <ellipse cx="0" cy="-12" rx="14" ry="12" fill="#EE9250" />
      <ellipse cx="2" cy="-8" rx="7" ry="7" fill="#FFF3E6" />
      {[-7, 7].map((x) => (
        <rect key={x} x={x - 3} y="-6" width="6" height="7" rx="3" fill="#5A3A2E" />
      ))}
      <g transform="translate(4 -30)">
        <path d="M-12 -4 L-9 -20 L-2 -9 Z M12 -4 L9 -20 L2 -9 Z" fill="#EE9250" />
        <path d="M-10 -6 L-9 -15 L-5 -9 Z M10 -6 L9 -15 L5 -9 Z" fill="#5A3A2E" opacity="0.6" />
        <path d="M-13 -4 Q 0 -14 13 -4 Q 10 8 0 12 Q -10 8 -13 -4 Z" fill="#EE9250" />
        <path d="M-8 4 Q 0 0 8 4 Q 4 12 0 12 Q -4 12 -8 4 Z" fill="#FFF3E6" />
        {eye(-5, -1, 2)}
        {eye(5, -1, 2)}
        <circle cx="0" cy="8" r="1.8" fill="#2A2238" />
      </g>
    </g>
  );
}

function Bear() {
  const c = '#A8724F';
  return (
    <g>
      {shadow(18)}
      <ellipse cx="0" cy="-16" rx="17" ry="16" fill={c} />
      <ellipse cx="0" cy="-12" rx="10" ry="10" fill="#E2B990" />
      {[-9, 9].map((x) => (
        <ellipse key={x} cx={x} cy="-3" rx="6" ry="4.5" fill={shade(c, -0.12)} />
      ))}
      <g transform="translate(0 -40)">
        <circle cx="-11" cy="-11" r="6" fill={c} />
        <circle cx="11" cy="-11" r="6" fill={c} />
        <circle cx="-11" cy="-11" r="3" fill="#E2B990" />
        <circle cx="11" cy="-11" r="3" fill="#E2B990" />
        <circle r="14" fill={c} />
        <ellipse cx="0" cy="5" rx="7" ry="5.5" fill="#E2B990" />
        <ellipse cx="0" cy="3" rx="2.4" ry="1.7" fill="#2A2238" />
        {eye(-5, -3)}
        {eye(5, -3)}
        {smile(0, 6.5, 3)}
        {blush(-9, 4)}
        {blush(9, 4)}
      </g>
    </g>
  );
}

function Hedgehog() {
  return (
    <g>
      {shadow(15)}
      <path d="M-16 -2 Q -18 -22 0 -24 Q 14 -24 16 -10 L 14 -2 Z" fill="#7A5A48" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M${-14 + i * 3.4} ${-12 - Math.sin((i / 8) * Math.PI) * 10} l -3 -7 l 5 4 Z`} fill="#5E4537" />
      ))}
      <path d="M8 -14 Q 22 -12 24 -4 Q 16 0 8 -2 Z" fill="#E8C9A4" />
      <circle cx="24.5" cy="-4.5" r="2" fill="#2A2238" />
      {eye(14, -9, 1.7)}
      {blush(16, -4)}
      <ellipse cx="-6" cy="0" rx="3" ry="2" fill="#5E4537" />
      <ellipse cx="6" cy="0" rx="3" ry="2" fill="#5E4537" />
    </g>
  );
}

function Squirrel() {
  return (
    <g>
      {shadow(14)}
      <path d="M-6 -6 Q -30 -6 -26 -32 Q -22 -50 -6 -44 Q -18 -38 -16 -26 Q -14 -14 -6 -12 Z" fill="#D9793F" />
      <path d="M-20 -40 Q -14 -42 -10 -40" stroke="#F3B07D" strokeWidth="2" fill="none" />
      <ellipse cx="2" cy="-12" rx="10" ry="12" fill="#E0844A" />
      <ellipse cx="4" cy="-9" rx="5.5" ry="7" fill="#FCE2C6" />
      <g transform="translate(5 -30)">
        <path d="M-6 -6 L-5 -15 L-1 -8 Z M6 -6 L6 -15 L2 -8 Z" fill="#E0844A" />
        <circle r="9" fill="#E0844A" />
        <ellipse cx="3" cy="3" rx="4.5" ry="3.5" fill="#FCE2C6" />
        {eye(-2, -1, 1.9)}
        {eye(5, -1, 1.9)}
        <circle cx="4.5" cy="3" r="1.2" fill="#2A2238" />
      </g>
      <ellipse cx="9" cy="-14" rx="3" ry="2.4" fill="#C86E36" />
    </g>
  );
}

function Butterfly() {
  return (
    <g className="anim-flap">
      <ellipse cx="-7" cy="-4" rx="8" ry="6.5" fill="#F7A8C8" />
      <ellipse cx="7" cy="-4" rx="8" ry="6.5" fill="#B9A2E8" />
      <ellipse cx="-6" cy="5" rx="5" ry="4" fill="#FFD27A" />
      <ellipse cx="6" cy="5" rx="5" ry="4" fill="#9FD6FF" />
      <circle cx="-8" cy="-5" r="2" fill="#FFFFFF" opacity="0.7" />
      <circle cx="8" cy="-5" r="2" fill="#FFFFFF" opacity="0.7" />
      <rect x="-1.3" y="-8" width="2.6" height="16" rx="1.3" fill="#4A3B58" />
      <path d="M0 -8 q -3 -5 -5 -6 M0 -8 q 3 -5 5 -6" stroke="#4A3B58" strokeWidth="0.9" fill="none" />
    </g>
  );
}

function Bird({ variant }: P) {
  const c = variant === 'pink' ? '#F7A8C8' : '#7FB8F0';
  return (
    <g>
      <ellipse cx="0" cy="-8" rx="10" ry="8" fill={c} />
      <circle cx="7" cy="-15" r="6.5" fill={c} />
      <path d="M-8 -10 q -8 -2 -12 4 q 6 0 10 -1 Z" fill={shade(c, -0.15)} />
      <path d="M-4 -12 Q 2 -24 6 -10 Z" fill={shade(c, -0.12)} className="anim-flap" />
      <ellipse cx="1" cy="-5" rx="5" ry="3.5" fill="#FFF3E0" />
      <path d="M13 -16 L18 -14 L13 -12 Z" fill="#F2A65A" />
      {eye(9, -17, 1.6)}
      <path d="M-2 0 l-1 3 M2 0 l1 3" stroke="#F2A65A" strokeWidth="1.3" strokeLinecap="round" />
    </g>
  );
}

function Fish({ variant }: P) {
  const c = variant === 'orange' ? '#FFAA5C' : '#FF9AB8';
  return (
    <g>
      <path d="M-12 0 L-22 -8 L-20 0 L-22 8 Z" fill={shade(c, -0.1)} />
      <ellipse cx="0" cy="0" rx="14" ry="9" fill={c} />
      <path d="M-2 -8 q 4 -6 8 -2" fill={shade(c, -0.1)} />
      <path d="M-4 -8 Q -2 0 -4 8" stroke="#FFFFFF" strokeWidth="1.2" fill="none" opacity="0.6" />
      {eye(7, -2, 2)}
      {smile(11, 3, 3)}
    </g>
  );
}

function Turtle() {
  return (
    <g>
      {shadow(18)}
      <ellipse cx="18" cy="-8" rx="7" ry="6" fill="#9FD18A" />
      {eye(20, -10, 1.6)}
      {[-12, 10].map((x) => (
        <ellipse key={x} cx={x} cy="-2" rx="5" ry="3.5" fill="#9FD18A" />
      ))}
      <path d="M-18 -4 Q -16 -24 0 -24 Q 16 -24 16 -4 Z" fill="#5FA36E" />
      <path d="M-8 -6 L-4 -18 L6 -18 L9 -6 Z" fill="#4E8A5B" />
      <path d="M-18 -4 L16 -4" stroke="#E9D18F" strokeWidth="3" />
    </g>
  );
}

function Dolphin() {
  return (
    <g>
      <path d="M-30 4 Q -10 -20 20 -12 Q 34 -8 36 0 Q 26 2 18 4 Q -2 14 -30 4 Z" fill="#6FA9DA" />
      <path d="M-30 4 L-42 -6 L-38 6 L-42 14 Z" fill="#5B93C4" />
      <path d="M0 -14 L6 -26 L10 -12 Z" fill="#5B93C4" />
      <path d="M-14 6 Q 6 10 24 2" fill="#E4F3FF" />
      <path d="M36 0 L42 2 L36 4 Z" fill="#6FA9DA" />
      {eye(24, -6, 2)}
      {smile(30, 1, 4)}
    </g>
  );
}

function Cat({ variant }: P) {
  const c = '#F2B26B';
  return (
    <g>
      {shadow(15)}
      <path d="M-12 -6 Q -28 -10 -24 -30" stroke={c} strokeWidth="5" fill="none" strokeLinecap="round" />
      <ellipse cx="0" cy="-12" rx="12" ry="12" fill={c} />
      <ellipse cx="2" cy="-8" rx="6" ry="7" fill="#FFF3E0" />
      <g transform="translate(2 -30)">
        <path d="M-10 -4 L-9 -16 L-2 -9 Z M10 -4 L9 -16 L2 -9 Z" fill={c} />
        <circle r="11" fill={c} />
        <path d="M-4 -10 L-2 -5 M0 -11 L0 -6 M4 -10 L2 -5" stroke={shade(c, -0.25)} strokeWidth="1.4" strokeLinecap="round" />
        {eye(-4, 0, 2)}
        {eye(4, 0, 2)}
        <path d="M-1.5 4 L1.5 4 L0 5.6 Z" fill="#E58FA0" />
        <path d="M-8 4 L-14 3 M-8 6 L-14 7 M8 4 L14 3 M8 6 L14 7" stroke="#FFFFFF" strokeWidth="0.8" />
        {variant === 'space' && <circle r="15" fill="#DDF1FF" opacity="0.25" stroke="#FFFFFF" strokeOpacity="0.8" />}
      </g>
    </g>
  );
}

function Puppy() {
  const c = '#F3E3CC';
  return (
    <g>
      {shadow(16)}
      <path d="M-13 -14 q -8 -6 -6 -12" stroke={c} strokeWidth="4" fill="none" strokeLinecap="round" className="anim-wag" />
      <ellipse cx="0" cy="-12" rx="14" ry="11" fill={c} />
      {[-8, 8].map((x) => (
        <rect key={x} x={x - 3} y="-6" width="6" height="7" rx="3" fill={shade(c, -0.06)} />
      ))}
      <g transform="translate(8 -28)">
        <ellipse cx="-9" cy="-2" rx="5" ry="9" fill="#3E2F2B" transform="rotate(14 -9 -2)" />
        <ellipse cx="9" cy="-2" rx="5" ry="9" fill="#C59A72" transform="rotate(-14 9 -2)" />
        <circle r="11" fill={c} />
        <ellipse cx="2" cy="5" rx="6" ry="4.5" fill="#FFFFFF" />
        <ellipse cx="2" cy="3" rx="2.4" ry="1.7" fill="#2A2238" />
        {eye(-4, -2)}
        {eye(6, -2)}
        <path d="M0 8 q 2 3 4 0" fill="#F28B9C" />
      </g>
    </g>
  );
}

function Teddy() {
  const c = '#C48E64';
  return (
    <g>
      {shadow(14)}
      <ellipse cx="0" cy="-12" rx="12" ry="12" fill={c} />
      <ellipse cx="0" cy="-10" rx="7" ry="7" fill="#EBC9A5" />
      {[-8, 8].map((x) => (
        <circle key={x} cx={x} cy="-3" r="5" fill={shade(c, -0.1)} />
      ))}
      <g transform="translate(0 -30)">
        <circle cx="-9" cy="-9" r="5" fill={c} />
        <circle cx="9" cy="-9" r="5" fill={c} />
        <circle r="11" fill={c} />
        <ellipse cx="0" cy="4" rx="5" ry="4" fill="#EBC9A5" />
        <circle cx="0" cy="3" r="1.6" fill="#2A2238" />
        {eye(-4, -2, 1.7)}
        {eye(4, -2, 1.7)}
      </g>
      <path d="M-4 -21 L4 -21 L0 -18 Z M-4 -21 L-8 -24 L-8 -18 Z M4 -21 L8 -24 L8 -18 Z" fill="#E86A8A" />
    </g>
  );
}

function Doll() {
  return (
    <g>
      {shadow(12)}
      <path d="M-10 0 L-8 -22 L8 -22 L10 0 Z" fill="#9FC7F0" />
      <rect x="-8" y="-24" width="16" height="5" rx="2" fill="#FFFFFF" />
      <circle cx="0" cy="-32" r="9" fill="#F7D5BC" />
      <path d="M-10 -30 Q -10 -44 0 -42 Q 10 -44 10 -30 Q 6 -38 0 -36 Q -6 -38 -10 -30 Z" fill="#E8B35A" />
      <path d="M-10 -32 q -4 10 0 16 M10 -32 q 4 10 0 16" stroke="#E8B35A" strokeWidth="4" fill="none" strokeLinecap="round" />
      {eye(-3.5, -31, 1.4)}
      {eye(3.5, -31, 1.4)}
      {smile(0, -27, 3)}
    </g>
  );
}

/** Взрослые и дети — нейтральные оригинальные образы. */
function Person({ kind, variant }: { kind: 'mama' | 'papa' | 'grandma' | 'grandpa' | 'sibling'; variant?: string }) {
  const cfg = {
    mama: { h: 150, skin: '#F2CDB2', hair: '#4A3328', top: '#E99AAE', bottom: '#E99AAE', dress: true, hairStyle: 'long' },
    papa: { h: 156, skin: '#EBC3A5', hair: '#3A2C25', top: '#6F9AD4', bottom: '#4C5E86', dress: false, hairStyle: 'short' },
    grandma: { h: 138, skin: '#F0CFB8', hair: '#D8D4DE', top: '#B79CD9', bottom: '#8E7AB5', dress: true, hairStyle: 'bun' },
    grandpa: { h: 142, skin: '#EAC4A8', hair: '#DCDCE2', top: '#9BB98B', bottom: '#6C6458', dress: false, hairStyle: 'short' },
    sibling: variant === 'friend'
      ? { h: 118, skin: '#F3D2B8', hair: '#A0623E', top: '#FFC36B', bottom: '#FFC36B', dress: true, hairStyle: 'braids' }
      : variant === 'sister'
        ? { h: 128, skin: '#F3D2B8', hair: '#4A3328', top: '#9FD6C2', bottom: '#9FD6C2', dress: true, hairStyle: 'long' }
        : { h: 130, skin: '#F0CBAE', hair: '#3A2C25', top: '#8FC0E8', bottom: '#556C9A', dress: false, hairStyle: 'short' },
  }[kind];
  const { h, skin } = cfg;
  const headR = kind === 'sibling' ? 19 : 17;
  const headY = -h + headR;
  const shoulderY = headY + headR + 6;
  const hipY = -h * 0.4;
  return (
    <g>
      {shadow(20)}
      {/* ноги */}
      {!cfg.dress ? (
        <>
          <rect x="-10" y={hipY} width="9" height={-hipY - 2} rx="4" fill={cfg.bottom} />
          <rect x="1" y={hipY} width="9" height={-hipY - 2} rx="4" fill={shade(cfg.bottom, -0.08)} />
        </>
      ) : (
        <>
          <rect x="-7" y={hipY + 18} width="6" height={-hipY - 18} rx="3" fill={skin} />
          <rect x="1" y={hipY + 18} width="6" height={-hipY - 18} rx="3" fill={shade(skin, -0.06)} />
        </>
      )}
      <ellipse cx="-6" cy="-2" rx="7" ry="4" fill="#6B4E43" />
      <ellipse cx="6" cy="-2" rx="7" ry="4" fill="#5D433A" />
      {/* корпус */}
      {cfg.dress ? (
        <path d={`M-13 ${shoulderY} Q 0 ${shoulderY - 4} 13 ${shoulderY} L 22 ${hipY + 22} Q 0 ${hipY + 28} -22 ${hipY + 22} Z`} fill={cfg.top} />
      ) : (
        <path d={`M-15 ${shoulderY} Q 0 ${shoulderY - 4} 15 ${shoulderY} L 14 ${hipY + 4} L -14 ${hipY + 4} Z`} fill={cfg.top} />
      )}
      {kind === 'grandma' && <path d={`M-15 ${shoulderY + 2} Q 0 ${shoulderY + 22} 15 ${shoulderY + 2} L 12 ${shoulderY + 12} Q 0 ${shoulderY + 28} -12 ${shoulderY + 12} Z`} fill="#F4D6E4" />}
      {kind === 'grandpa' &&
        [0, 1, 2].map((i) => <circle key={i} cx="0" cy={shoulderY + 10 + i * 10} r="1.6" fill="#FFF7EA" />)}
      {/* руки */}
      <path d={`M-14 ${shoulderY + 4} q -8 ${h * 0.18} -6 ${h * 0.3}`} stroke={cfg.top} strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d={`M14 ${shoulderY + 4} q 8 ${h * 0.18} 6 ${h * 0.3}`} stroke={shade(cfg.top, -0.08)} strokeWidth="8" fill="none" strokeLinecap="round" />
      <circle cx="-20" cy={shoulderY + 4 + h * 0.3} r="4.2" fill={skin} />
      <circle cx="20" cy={shoulderY + 4 + h * 0.3} r="4.2" fill={skin} />
      {kind === 'grandpa' && <path d={`M22 ${shoulderY + 4 + h * 0.3} L 26 -2`} stroke="#8A6448" strokeWidth="3" strokeLinecap="round" />}
      {/* голова */}
      {cfg.hairStyle === 'long' && <path d={`M${-headR - 2} ${headY} Q 0 ${headY - headR * 2.4} ${headR + 2} ${headY} L ${headR + 4} ${headY + headR * 2} Q 0 ${headY + headR * 2.4} ${-headR - 4} ${headY + headR * 2} Z`} fill={cfg.hair} />}
      {cfg.hairStyle === 'braids' && [-1, 1].map((s) => <path key={s} d={`M${s * headR} ${headY} q ${s * 6} 18 ${s * 2} 30`} stroke={cfg.hair} strokeWidth="6" fill="none" strokeLinecap="round" />)}
      <rect x="-4" y={headY + headR - 2} width="8" height="8" fill={shade(skin, -0.1)} />
      <circle cx="0" cy={headY} r={headR} fill={skin} />
      {cfg.hairStyle === 'bun' && <circle cx="0" cy={headY - headR - 3} r="8" fill={cfg.hair} />}
      <path d={`M${-headR} ${headY - 2} Q ${-headR} ${headY - headR - 4} 0 ${headY - headR - 2} Q ${headR} ${headY - headR - 4} ${headR} ${headY - 2} Q ${headR * 0.5} ${headY - headR * 0.7} 0 ${headY - headR * 0.75} Q ${-headR * 0.6} ${headY - headR * 0.6} ${-headR} ${headY - 2} Z`} fill={cfg.hair} />
      {eye(-6, headY + 1, 1.9)}
      {eye(6, headY + 1, 1.9)}
      {blush(-10, headY + 7)}
      {blush(10, headY + 7)}
      {smile(0, headY + 8, 6)}
      {(kind === 'grandma' || kind === 'grandpa') && (
        <g stroke="#7A6450" strokeWidth="1.2" fill="none">
          <circle cx="-6" cy={headY + 1} r="4.2" />
          <circle cx="6" cy={headY + 1} r="4.2" />
          <path d={`M-1.8 ${headY + 1} L1.8 ${headY + 1}`} />
        </g>
      )}
      {kind === 'grandpa' && <path d={`M-7 ${headY + 7} Q 0 ${headY + 4} 7 ${headY + 7} Q 0 ${headY + 11} -7 ${headY + 7} Z`} fill={cfg.hair} />}
    </g>
  );
}

function Rocket({ uid }: P) {
  return (
    <g>
      <path d="M-8 0 Q 0 26 8 0 Z" fill="#FFB24D" filter={`url(#${uid}-glow)`} className="anim-flicker" />
      <path d="M-5 0 Q 0 14 5 0 Z" fill="#FFF2B0" />
      <path d="M-14 -6 L-24 4 L-22 -18 Z" fill="#E86A6A" />
      <path d="M14 -6 L24 4 L22 -18 Z" fill="#E86A6A" />
      <path d="M-14 -4 L-14 -56 Q 0 -86 14 -56 L 14 -4 Z" fill="#F4F6FB" />
      <path d="M-14 -56 Q 0 -86 14 -56 Q 0 -62 -14 -56 Z" fill="#E86A6A" />
      <path d="M4 -70 Q 10 -62 12 -40" stroke="#FFFFFF" strokeWidth="2" fill="none" opacity="0.7" />
      <circle cx="0" cy="-40" r="8" fill="#7FB8F0" stroke="#C9CFE0" strokeWidth="3" />
      <circle cx="-2" cy="-42" r="2.5" fill="#FFFFFF" opacity="0.8" />
      <rect x="-14" y="-12" width="28" height="5" fill="#9FC7F0" />
    </g>
  );
}

function Planet({ variant = 'earth', uid }: P) {
  if (variant === 'saturn')
    return (
      <g>
        <ellipse rx="42" ry="10" fill="none" stroke="#E7C38C" strokeWidth="5" opacity="0.6" transform="rotate(-14)" />
        <circle r="22" fill="#F0C987" />
        <path d="M-21 -6 Q 0 -2 21 -8 M-20 6 Q 0 10 20 4" stroke="#D9A866" strokeWidth="3" fill="none" />
        <path d="M-42 4 A 42 10 0 0 0 42 -4" transform="rotate(-14)" stroke="#F5DDAE" strokeWidth="5" fill="none" />
      </g>
    );
  if (variant === 'mars')
    return (
      <g>
        <circle r="20" fill="#E5795A" />
        <circle cx="-6" cy="-4" r="4" fill="#C95F45" />
        <circle cx="8" cy="6" r="3" fill="#C95F45" />
        <circle cx="-6" cy="-8" r="8" fill="#FFFFFF" opacity="0.15" />
      </g>
    );
  return (
    <g>
      <circle r="30" fill="#7FB8FF" opacity="0.25" filter={`url(#${uid}-blur)`} />
      <circle r="22" fill="#4E98E0" />
      <path d="M-14 -10 q 8 -8 16 0 q -2 10 -12 8 Z M4 6 q 10 -4 14 4 q -6 8 -14 2 Z M-12 10 q 4 -2 6 2 q -4 4 -6 -2" fill="#79C47F" />
      <circle cx="-7" cy="-8" r="10" fill="#FFFFFF" opacity="0.15" />
    </g>
  );
}

function Comet({ uid }: P) {
  return (
    <g>
      <path d="M0 0 L-80 -40 L-70 -26 Z" fill="#FFF3C4" opacity="0.5" filter={`url(#${uid}-soft)`} />
      <path d="M0 0 L-60 -18 L-60 -10 Z" fill="#FFFFFF" opacity="0.6" />
      <circle r="12" fill="#FFE9A0" filter={`url(#${uid}-glow)`} />
      <circle r="7" fill="#FFF8DD" />
    </g>
  );
}

function Cake({ variant }: P) {
  if (variant === 'pancakes')
    return (
      <g>
        <ellipse cx="0" cy="0" rx="26" ry="6" fill="#FFFFFF" />
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={i} cx="0" cy={-4 - i * 5} rx="20" ry="5" fill={i % 2 ? '#E9B36F' : '#F2C786'} />
        ))}
        <path d="M-10 -22 Q 0 -26 10 -22 Q 8 -16 4 -14 Q 0 -10 -2 -16 Q -8 -18 -10 -22 Z" fill="#F2A33C" opacity="0.9" />
      </g>
    );
  return (
    <g>
      {shadow(26)}
      <ellipse cx="0" cy="-2" rx="30" ry="6" fill="#FFFFFF" />
      <rect x="-24" y="-30" width="48" height="26" rx="6" fill="#FBD2DE" />
      <path d="M-24 -26 Q -18 -18 -12 -26 Q -6 -18 0 -26 Q 6 -18 12 -26 Q 18 -18 24 -26 L 24 -30 L -24 -30 Z" fill="#FFFFFF" />
      <rect x="-18" y="-46" width="36" height="18" rx="5" fill="#F7B6C9" />
      <path d="M-18 -42 Q -12 -36 -6 -42 Q 0 -36 6 -42 Q 12 -36 18 -42 L 18 -46 L -18 -46 Z" fill="#FFFFFF" />
      {[-10, 0, 10].map((x) => (
        <g key={x}>
          <rect x={x - 1.5} y="-58" width="3" height="12" rx="1" fill={['#9FC7F0', '#FFD27A', '#B9E3A8'][(x + 10) / 10]} />
          <path d={`M${x} -66 q 3 4 0 7 q -3 -3 0 -7`} fill="#FFC23D" className="anim-flicker" />
        </g>
      ))}
      {[-14, 6, 16].map((x) => (
        <circle key={x} cx={x} cy="-16" r="3" fill="#E86A6A" />
      ))}
    </g>
  );
}

function Balloons({ variant }: P) {
  const list = variant === 'one' ? [['#E86A6A', 0, 0]] : [['#F29BB5', -12, 4], ['#9FC7F0', 10, 0], ['#FFD27A', -2, -14]];
  return (
    <g className="anim-sway-slow">
      {list.map(([c, x, y]) => (
        <g key={String(c)}>
          <path d={`M${x} ${Number(y) + 16} q -4 20 2 44`} stroke="#9A8FB0" strokeWidth="1" fill="none" />
          <ellipse cx={x} cy={y} rx="12" ry="15" fill={String(c)} />
          <ellipse cx={Number(x) - 4} cy={Number(y) - 6} rx="3" ry="5" fill="#FFFFFF" opacity="0.5" />
          <path d={`M${Number(x) - 2} ${Number(y) + 15} l2 3 l2 -3 Z`} fill={String(c)} />
        </g>
      ))}
    </g>
  );
}

function Gift() {
  return (
    <g>
      {shadow(18)}
      <rect x="-18" y="-28" width="36" height="28" rx="3" fill="#9FC7F0" />
      <rect x="-21" y="-34" width="42" height="9" rx="3" fill="#B7D6F5" />
      <rect x="-3" y="-34" width="6" height="34" fill="#F29BB5" />
      <path d="M0 -34 Q -16 -48 -14 -36 Z M0 -34 Q 16 -48 14 -36 Z" fill="#F29BB5" />
    </g>
  );
}

function Lantern({ uid }: P) {
  return (
    <g>
      <circle cx="0" cy="-20" r="26" fill="#FFE3A0" opacity="0.35" filter={`url(#${uid}-blur)`} />
      <path d="M-6 -42 Q 0 -50 6 -42" stroke="#8A6448" strokeWidth="2" fill="none" />
      <rect x="-11" y="-40" width="22" height="5" rx="2" fill="#8A6448" />
      <path d="M-10 -35 L10 -35 L12 -6 L-12 -6 Z" fill="#FFE9A8" opacity="0.95" />
      <path d="M0 -26 q 4 6 0 12 q -4 -6 0 -12" fill="#FFB24D" className="anim-flicker" />
      <rect x="-13" y="-6" width="26" height="6" rx="2" fill="#8A6448" />
    </g>
  );
}

function Flowers({ variant }: P) {
  const colors = variant === 'violet' ? ['#B48BE8', '#C9A6F2', '#9B74DB'] : ['#F29BB5', '#FFFFFF', '#FFD27A'];
  return (
    <g className="anim-sway" style={{ transformOrigin: '0 0' }}>
      {[-12, 0, 12].map((x, i) => (
        <g key={x}>
          <path d={`M${x} 0 q ${i - 1} -12 ${x / 4} ${-22 - (i % 2) * 6}`} stroke="#6FAF68" strokeWidth="2" fill="none" />
          <g transform={`translate(${x + x / 4 - x} ${-22 - (i % 2) * 6})`}>
            {[0, 72, 144, 216, 288].map((r) => (
              <ellipse key={r} rx="3" ry="5" transform={`rotate(${r}) translate(0 -4)`} fill={colors[i]} />
            ))}
            <circle r="2.6" fill={variant === 'violet' ? '#FFF2B0' : i === 2 ? '#F2A33C' : '#FFD27A'} />
          </g>
        </g>
      ))}
      <path d="M-6 -6 q -6 -4 -8 -10 q 6 2 8 10 M6 -6 q 6 -4 8 -10 q -6 2 -8 10" fill="#7DB07C" />
    </g>
  );
}

function Mushroom({ uid }: P) {
  return (
    <g>
      {shadow(14)}
      <path d="M-6 0 L-5 -18 L5 -18 L6 0 Z" fill="#FFF3E0" />
      <path d="M-20 -16 Q 0 -44 20 -16 Q 0 -10 -20 -16 Z" fill="#E86A6A" />
      {[[-9, -22], [4, -28], [10, -19]].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="2.8" fill="#FFFFFF" />
      ))}
      <ellipse cx="0" cy="-26" rx="22" ry="14" fill="#FFE3A0" opacity="0" filter={`url(#${uid}-blur)`} />
    </g>
  );
}

function Carrot() {
  return (
    <g transform="rotate(-30)">
      <path d="M-4 -2 L0 18 L4 -2 Z" fill="#F28C38" transform="translate(0 -18)" />
      <path d="M0 -20 q -4 -8 -2 -12 M0 -20 q 0 -8 2 -12 M0 -20 q 4 -6 6 -8" stroke="#6FAF68" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Basket() {
  return (
    <g>
      {shadow(18)}
      <path d="M-16 -24 Q 0 -46 16 -24" stroke="#A67650" strokeWidth="3" fill="none" />
      <path d="M-20 -22 L20 -22 L15 0 L-15 0 Z" fill="#C99B76" />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M-18 ${-20 + i * 5} L18 ${-20 + i * 5}`} stroke="#A67650" strokeWidth="1.2" />
      ))}
      <circle cx="-8" cy="-24" r="4.5" fill="#E86A6A" />
      <circle cx="4" cy="-25" r="4.5" fill="#F2A33C" />
    </g>
  );
}

function Book({ uid }: P) {
  return (
    <g>
      {shadow(18)}
      <path d="M0 -6 Q -12 -12 -22 -8 L -22 -2 Q -12 -6 0 0 Z" fill="#E86A8A" />
      <path d="M0 -6 Q 12 -12 22 -8 L 22 -2 Q 12 -6 0 0 Z" fill="#D9557A" />
      <path d="M0 -8 Q -12 -16 -21 -12 L -21 -8 Q -12 -12 0 -6 Z" fill="#FFF7EA" />
      <path d="M0 -8 Q 12 -16 21 -12 L 21 -8 Q 12 -12 0 -6 Z" fill="#FFFFFF" />
      <circle cx="0" cy="-16" r="10" fill="#FFE9A0" opacity="0.3" filter={`url(#${uid}-blur)`} />
    </g>
  );
}

function Rainbow() {
  const colors = ['#FF8B8B', '#FFB27A', '#FFE07A', '#9BDB8E', '#9FD6FF', '#6F8CF0', '#C49BF0'];
  return (
    <g opacity="0.85">
      {colors.map((c, i) => (
        <path key={c} d={`M${-90 + i * 6} 0 A ${90 - i * 6} ${90 - i * 6} 0 0 1 ${90 - i * 6} 0`} stroke={c} strokeWidth="6.5" fill="none" />
      ))}
      <ellipse cx="-86" cy="0" rx="18" ry="8" fill="#FFFFFF" opacity="0.9" />
      <ellipse cx="86" cy="0" rx="18" ry="8" fill="#FFFFFF" opacity="0.9" />
    </g>
  );
}

function Bridge() {
  return (
    <g>
      <path d="M-40 0 Q 0 -22 40 0" stroke="#A67650" strokeWidth="7" fill="none" />
      {[-30, -18, -6, 6, 18, 30].map((x) => (
        <rect key={x} x={x - 4} y={-8 - (1 - (x / 40) ** 2) * 12} width="8" height="6" rx="1.5" fill="#C99B76" />
      ))}
      <path d="M-40 -14 Q 0 -36 40 -14" stroke="#8A6448" strokeWidth="2" fill="none" />
      {[-34, 0, 34].map((x) => (
        <line key={x} x1={x} y1={-6 - (1 - (x / 40) ** 2) * 12} x2={x} y2={-18 - (1 - (x / 40) ** 2) * 14} stroke="#8A6448" strokeWidth="2" />
      ))}
    </g>
  );
}

function Crown({ uid }: P) {
  return (
    <g>
      <circle r="24" fill="#FFE3A0" opacity="0.35" filter={`url(#${uid}-blur)`} />
      <path d="M-18 10 L-20 -10 L-9 0 L0 -16 L9 0 L20 -10 L18 10 Z" fill="#FFD66B" stroke="#E8B53E" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="-18" y="8" width="36" height="6" rx="2" fill="#F0BF45" />
      <circle cx="0" cy="-2" r="3" fill="#F29BB5" />
      <circle cx="-10" cy="4" r="2" fill="#9FC7F0" />
      <circle cx="10" cy="4" r="2" fill="#B9E3A8" />
    </g>
  );
}

function Key({ uid }: P) {
  return (
    <g transform="rotate(-30)">
      <circle r="16" fill="#FFE3A0" opacity="0.4" filter={`url(#${uid}-blur)`} />
      <circle cx="-10" cy="0" r="7" fill="none" stroke="#FFD66B" strokeWidth="3.5" />
      <path d="M-3 0 L16 0 M10 0 L10 6 M15 0 L15 5" stroke="#FFD66B" strokeWidth="3.5" strokeLinecap="round" />
    </g>
  );
}

function Shell({ variant, uid }: P) {
  return (
    <g>
      {variant === 'pearl' && <circle cx="0" cy="-12" r="24" fill="#FFFFFF" opacity="0.45" filter={`url(#${uid}-blur)`} />}
      <path d="M-18 0 Q -20 -22 0 -24 Q 20 -22 18 0 Z" fill="#F7C9D6" />
      {[-12, -6, 0, 6, 12].map((x) => (
        <path key={x} d={`M${x * 0.3} -2 L${x} -21`} stroke="#E7A2B6" strokeWidth="1.4" />
      ))}
      {variant === 'pearl' && <circle cx="0" cy="-6" r="6" fill="#FFFDF6" stroke="#E9E2F5" />}
    </g>
  );
}

function Cloud({ uid }: P) {
  return (
    <g>
      <g fill="#FFE6F2" filter={`url(#${uid}-soft)`}>
        <ellipse cx="0" cy="4" rx="34" ry="13" />
        <circle cx="-14" cy="-4" r="14" />
        <circle cx="8" cy="-10" r="17" />
        <circle cx="24" cy="0" r="11" />
      </g>
      {eye(-6, 0, 2)}
      {eye(8, 0, 2)}
      {smile(1, 6, 5)}
      {blush(-12, 6)}
      {blush(15, 6)}
    </g>
  );
}

function MoonFace({ uid }: P) {
  return (
    <g>
      <circle r="38" fill="#FFF4D2" opacity="0.3" filter={`url(#${uid}-blur)`} />
      <circle r="24" fill="#FFF0BF" />
      <circle cx="-8" cy="-10" r="3.5" fill="#F1DFA5" />
      <circle cx="10" cy="10" r="4.5" fill="#F1DFA5" />
      <path d="M-11 0 q 3 3 6 0 M5 0 q 3 3 6 0" stroke="#7A6450" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {smile(0, 8, 7)}
      {blush(-13, 6)}
      {blush(13, 6)}
    </g>
  );
}

function TreeProp() {
  return (
    <g>
      {shadow(30)}
      <path d="M-8 0 L-6 -70 L6 -70 L8 0 Z" fill="#8A6448" />
      <path d="M-4 -40 L-20 -56 M4 -50 L18 -64" stroke="#8A6448" strokeWidth="5" strokeLinecap="round" />
      <circle cx="0" cy="-92" r="34" fill="#6FAF68" />
      <circle cx="-26" cy="-72" r="22" fill="#79B871" />
      <circle cx="26" cy="-74" r="24" fill="#649F5E" />
      <circle cx="-10" cy="-104" r="14" fill="#8DC583" opacity="0.8" />
      {[[-20, -80], [16, -96], [24, -66]].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="3.5" fill="#E86A6A" opacity="0.85" />
      ))}
    </g>
  );
}

function Apple() {
  return (
    <g>
      <circle cx="0" cy="-8" r="8" fill="#E86A6A" />
      <circle cx="-3" cy="-11" r="2.4" fill="#FFFFFF" opacity="0.5" />
      <path d="M0 -15 q 1 -4 3 -5" stroke="#8A6448" strokeWidth="1.5" fill="none" />
      <path d="M2 -18 q 5 -3 7 1 q -4 2 -7 -1" fill="#7DB07C" />
    </g>
  );
}

function Cup() {
  return (
    <g>
      <path d="M-9 -16 L9 -16 L7 0 L-7 0 Z" fill="#FFF7EA" stroke="#E7C7A6" />
      <path d="M9 -12 q 6 0 5 6 q -1 4 -6 3" stroke="#E7C7A6" strokeWidth="2" fill="none" />
      <path d="M-9 -12 L9 -12" stroke="#F29BB5" strokeWidth="2" />
    </g>
  );
}

function Blocks() {
  return (
    <g>
      {shadow(24)}
      <rect x="-24" y="-16" width="16" height="16" rx="2" fill="#E86A6A" />
      <rect x="-6" y="-16" width="16" height="16" rx="2" fill="#7FB8F0" />
      <rect x="12" y="-16" width="16" height="16" rx="2" fill="#FFD27A" />
      <rect x="-15" y="-32" width="16" height="16" rx="2" fill="#9BDB8E" />
      <rect x="3" y="-32" width="16" height="16" rx="2" fill="#C49BF0" />
      <path d="M-6 -48 L4 -48 L12 -32 L-14 -32 Z" fill="#F29BB5" />
      <text x="-20" y="-4" fontSize="9" fontWeight="700" fill="#FFFFFF">А</text>
      <text x="-2" y="-4" fontSize="9" fontWeight="700" fill="#FFFFFF">Б</text>
      <text x="16" y="-4" fontSize="9" fontWeight="700" fill="#FFFFFF">В</text>
    </g>
  );
}

function Heart({ uid }: P) {
  return (
    <g>
      <circle r="18" fill="#FFB3C7" opacity="0.4" filter={`url(#${uid}-blur)`} />
      <path d="M0 10 C -18 -2, -14 -18, 0 -9 C 14 -18, 18 -2, 0 10 Z" fill="#F27A9B" />
      <ellipse cx="-6" cy="-6" rx="3" ry="2" fill="#FFFFFF" opacity="0.6" />
    </g>
  );
}

function Snail({ uid }: P) {
  return (
    <g>
      {shadow(16)}
      <path d="M-18 0 Q -18 -6 -8 -6 L 14 -6 Q 22 -6 22 -14 L 20 -20" stroke="#D9C3A4" strokeWidth="7" fill="none" strokeLinecap="round" />
      <circle cx="-2" cy="-16" r="12" fill="#C98B6A" />
      <path d="M-2 -16 m -7 0 a 7 7 0 1 1 7 7 a 4 4 0 1 1 -4 -4" stroke="#A86F52" strokeWidth="2" fill="none" />
      <path d="M18 -20 l -2 -8 M22 -20 l 2 -8" stroke="#D9C3A4" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="16" cy="-28" r="1.6" fill="#2A2238" />
      <circle cx="24" cy="-28" r="1.6" fill="#2A2238" />
      <g transform="translate(-2 -32)">
        <circle r="10" fill="#FFE3A0" opacity="0.5" filter={`url(#${uid}-blur)`} />
        <rect x="-3" y="-4" width="6" height="7" rx="2" fill="#FFE9A8" />
      </g>
    </g>
  );
}

function Frog() {
  return (
    <g>
      {shadow(13)}
      <ellipse cx="0" cy="-8" rx="13" ry="9" fill="#8BCB7A" />
      <ellipse cx="0" cy="-5" rx="8" ry="5" fill="#D8F0C2" />
      <circle cx="-6" cy="-17" r="5" fill="#8BCB7A" />
      <circle cx="6" cy="-17" r="5" fill="#8BCB7A" />
      {eye(-6, -17, 2.4)}
      {eye(6, -17, 2.4)}
      {smile(0, -10, 8, '#4E7D44')}
      {[-12, 12].map((x) => (
        <ellipse key={x} cx={x} cy="-1" rx="5" ry="2.5" fill="#79B868" />
      ))}
    </g>
  );
}

function Pillow() {
  return (
    <g>
      {shadow(20)}
      <path d="M-22 -2 Q -26 -20 -20 -22 Q 0 -18 20 -22 Q 26 -20 22 -2 Q 0 2 -22 -2 Z" fill="#FFFFFF" />
      <path d="M-14 -12 Q 0 -8 14 -12" stroke="#E9DDF2" strokeWidth="2" fill="none" />
      <circle cx="0" cy="-10" r="2" fill="#F7C9D6" />
    </g>
  );
}

function TreeHouse() {
  return (
    <g>
      <TreeProp />
      <rect x="-16" y="-70" width="32" height="24" rx="3" fill="#C99B76" />
      <path d="M-20 -70 L0 -86 L20 -70 Z" fill="#E86A6A" />
    </g>
  );
}

export function PropShape({ kind, variant, uid }: { kind: PropKind; variant?: string; uid: string }) {
  const p = { variant, uid };
  switch (kind) {
    case 'star': return <Star {...p} />;
    case 'bunny': return <Bunny {...p} />;
    case 'unicorn': return <Unicorn {...p} />;
    case 'owl': return <Owl />;
    case 'fox': return <Fox />;
    case 'bear': return <Bear />;
    case 'hedgehog': return <Hedgehog />;
    case 'squirrel': return <Squirrel />;
    case 'butterfly': return <Butterfly />;
    case 'bird': return <Bird {...p} />;
    case 'fish': return <Fish {...p} />;
    case 'turtle': return <Turtle />;
    case 'dolphin': return <Dolphin />;
    case 'cat': return <Cat {...p} />;
    case 'puppy': return <Puppy />;
    case 'teddy': return <Teddy />;
    case 'doll': return <Doll />;
    case 'mama':
    case 'papa':
    case 'grandma':
    case 'grandpa':
    case 'sibling':
      return <Person kind={kind} variant={variant} />;
    case 'rocket': return <Rocket {...p} />;
    case 'planet': return <Planet {...p} />;
    case 'comet': return <Comet {...p} />;
    case 'cake': return <Cake {...p} />;
    case 'balloons': return <Balloons {...p} />;
    case 'gift': return <Gift />;
    case 'lantern': return <Lantern {...p} />;
    case 'flowers': return <Flowers {...p} />;
    case 'mushroom': return <Mushroom {...p} />;
    case 'carrot': return <Carrot />;
    case 'basket': return <Basket />;
    case 'book': return <Book {...p} />;
    case 'rainbow': return <Rainbow />;
    case 'bridge': return <Bridge />;
    case 'crown': return <Crown {...p} />;
    case 'key': return <Key {...p} />;
    case 'shell': return <Shell {...p} />;
    case 'cloud': return <Cloud {...p} />;
    case 'moonface': return <MoonFace {...p} />;
    case 'tree': return <TreeProp />;
    case 'treehouse': return <TreeHouse />;
    case 'apple': return <Apple />;
    case 'cup': return <Cup />;
    case 'blocks': return <Blocks />;
    case 'heart': return <Heart {...p} />;
    case 'snail': return <Snail {...p} />;
    case 'frog': return <Frog />;
    case 'pillow': return <Pillow />;
    case 'bed': return <Pillow />;
    default: return null;
  }
}
