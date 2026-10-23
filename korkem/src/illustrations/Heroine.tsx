import type { Appearance, HeroinePlacement, Pose } from '../types';
import { shade } from './palette';

/**
 * Главная героиня. Внешность берётся из профиля (цвет кожи, волос, причёска,
 * одежда, аксессуар), поэтому она узнаваема во всех сценах.
 * Начало координат — точка между стопами, взгляд направлен вправо.
 */

type ArmAngles = [upper: number, fore: number];
interface PoseDef {
  back: ArmAngles;
  front: ArmAngles;
  legs: [back: number, front: number];
  lift?: number;
  sit?: boolean;
}

const POSES: Record<Exclude<Pose, 'sleep'>, PoseDef> = {
  stand: { back: [-10, -6], front: [10, 6], legs: [0, 0] },
  wave: { back: [-10, -6], front: [140, 175], legs: [0, 0] },
  walk: { back: [-28, -18], front: [26, 40], legs: [-14, 16] },
  reach: { back: [55, 72], front: [78, 88], legs: [-4, 6] },
  hug: { back: [-25, 95], front: [25, -95], legs: [0, 0] },
  jump: { back: [-150, -168], front: [150, 168], legs: [-18, 18], lift: 14 },
  think: { back: [-10, -6], front: [10, -172], legs: [0, 0] },
  sit: { back: [-14, 20], front: [24, 46], legs: [90, 90], sit: true },
};

const rad = (d: number) => (d * Math.PI) / 180;

function armPath(sx: number, sy: number, [a1, a2]: ArmAngles, l1 = 14, l2 = 15) {
  const ex = sx + Math.sin(rad(a1)) * l1;
  const ey = sy + Math.cos(rad(a1)) * l1;
  const hx = ex + Math.sin(rad(a2)) * l2;
  const hy = ey + Math.cos(rad(a2)) * l2;
  return { d: `M${sx} ${sy} L${ex} ${ey} L${hx} ${hy}`, hx, hy };
}

interface Props {
  placement: HeroinePlacement;
  appearance: Appearance;
  uid: string;
}

export function Heroine({ placement, appearance, uid }: Props) {
  if (placement.pose === 'sleep') return <SleepingHeroine appearance={appearance} uid={uid} />;
  const pose = POSES[placement.pose] ?? POSES.stand;
  const outfit = placement.outfit ?? 'default';
  const a = appearance;
  const skin = a.skinTone;
  const skinShade = shade(skin, -0.12);
  const lift = pose.lift ?? 0;
  const sitDrop = pose.sit ? 20 : 0;

  const clothes = outfitColors(outfit, a);
  const backArm = armPath(-10, -60 + sitDrop, pose.back);
  const frontArm = armPath(10, -60 + sitDrop, pose.front);
  const sleeve = clothes.sleeve;

  return (
    <g transform={`translate(0 ${-lift})`}>
      {/* тень */}
      <ellipse cx="0" cy={lift + 1} rx={pose.sit ? 30 : 22} ry="5" fill="#1A1530" opacity="0.18" />

      {/* задняя рука */}
      <path d={backArm.d} stroke={sleeve === 'skin' ? skinShade : shade(clothes.main, -0.12)} strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx={backArm.hx} cy={backArm.hy} r="4.3" fill={skinShade} />

      {/* ноги */}
      {pose.sit ? (
        <g>
          <path d={`M-2 ${-8} L24 ${-6}`} stroke={clothes.legs} strokeWidth="9" strokeLinecap="round" />
          <path d={`M2 ${-4} L26 ${-2}`} stroke={shade(clothes.legs, -0.08)} strokeWidth="9" strokeLinecap="round" />
          <ellipse cx="30" cy="-6" rx="6" ry="4.5" fill={clothes.shoes} />
          <ellipse cx="32" cy="-2" rx="6" ry="4.5" fill={shade(clothes.shoes, -0.1)} />
        </g>
      ) : (
        <g>
          {[pose.legs[0], pose.legs[1]].map((ang, i) => {
            const x0 = i === 0 ? -5 : 5;
            const x1 = x0 + Math.sin(rad(ang)) * 22;
            const y1 = -24 + Math.cos(rad(ang)) * 22;
            return (
              <g key={i}>
                <path d={`M${x0} -24 L${x1} ${y1 - 2}`} stroke={i === 0 ? shade(clothes.legs, -0.1) : clothes.legs} strokeWidth="7" strokeLinecap="round" />
                <ellipse cx={x1 + 2} cy={y1} rx="6" ry="4" fill={i === 0 ? shade(clothes.shoes, -0.12) : clothes.shoes} />
              </g>
            );
          })}
        </g>
      )}

      {/* корпус */}
      <g transform={`translate(0 ${sitDrop})`}>
        <Body outfit={outfit} a={a} clothes={clothes} uid={uid} sit={!!pose.sit} />
      </g>

      {/* голова */}
      <g transform={`translate(0 ${sitDrop})`}>
        <Head a={a} uid={uid} outfit={outfit} />
      </g>

      {/* передняя рука */}
      <path d={frontArm.d} stroke={sleeve === 'skin' ? skin : clothes.main} strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx={frontArm.hx} cy={frontArm.hy} r="4.3" fill={skin} />
    </g>
  );
}

interface Clothes {
  main: string;
  accent: string;
  legs: string;
  shoes: string;
  sleeve: 'cloth' | 'skin';
}

function outfitColors(outfit: HeroinePlacement['outfit'], a: Appearance): Clothes {
  switch (outfit) {
    case 'pajamas':
      return { main: shade(a.outfitColor, 0.45), accent: '#FFFFFF', legs: shade(a.outfitColor, 0.38), shoes: '#F3D7E3', sleeve: 'cloth' };
    case 'space':
      return { main: '#F4F6FB', accent: a.outfitColor, legs: '#E3E7F2', shoes: '#9AA3BF', sleeve: 'cloth' };
    case 'princess':
      return { main: shade(a.outfitColor, 0.12), accent: '#FFE7A3', legs: a.skinTone, shoes: '#FFE7A3', sleeve: 'skin' };
    case 'party':
      return { main: a.outfitColor, accent: '#FFE7A3', legs: '#FFFFFF', shoes: shade(a.outfitColor, -0.25), sleeve: 'skin' };
    default:
      if (a.outfitStyle === 'overalls') return { main: a.outfitColor, accent: '#FFFFFF', legs: a.outfitColor, shoes: '#E58F7B', sleeve: 'cloth' };
      if (a.outfitStyle === 'sweater') return { main: a.outfitColor, accent: shade(a.outfitColor, 0.4), legs: '#6F7FB3', shoes: '#E58F7B', sleeve: 'cloth' };
      return { main: a.outfitColor, accent: shade(a.outfitColor, 0.45), legs: a.skinTone, shoes: '#E58F7B', sleeve: 'skin' };
  }
}

function Body({ outfit, a, clothes, uid, sit }: { outfit: HeroinePlacement['outfit']; a: Appearance; clothes: Clothes; uid: string; sit: boolean }) {
  const id = `${uid}-cloth`;
  const grad = (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={shade(clothes.main, 0.12)} />
        <stop offset="1" stopColor={shade(clothes.main, -0.12)} />
      </linearGradient>
    </defs>
  );
  // шея
  const neck = <rect x="-4" y="-70" width="8" height="8" rx="3" fill={shade(a.skinTone, -0.1)} />;

  if (outfit === 'pajamas') {
    return (
      <g>
        {grad}
        {neck}
        <path d="M-12 -66 Q 0 -70 12 -66 L16 -26 Q 0 -22 -16 -26 Z" fill={`url(#${id})`} />
        {[[-6, -54], [6, -44], [-4, -34], [8, -60]].map(([x, y]) => (
          <path key={`${x}${y}`} d={`M${x} ${y - 2.5} l0.8 1.7 1.7 0.8 -1.7 0.8 -0.8 1.7 -0.8 -1.7 -1.7 -0.8 1.7 -0.8z`} fill="#FFFFFF" opacity="0.85" />
        ))}
        <path d="M-6 -66 Q 0 -60 6 -66" stroke="#FFFFFF" strokeWidth="2" fill="none" />
      </g>
    );
  }
  if (outfit === 'space') {
    return (
      <g>
        {grad}
        {neck}
        <path d="M-13 -66 Q 0 -70 13 -66 L16 -24 Q 0 -20 -16 -24 Z" fill={`url(#${id})`} stroke="#C9CFE0" strokeWidth="1" />
        <rect x="-15" y="-36" width="30" height="5" rx="2" fill={clothes.accent} />
        <rect x="-6" y="-58" width="12" height="9" rx="2" fill={shade(clothes.accent, 0.3)} />
        <circle cx="-2" cy="-54" r="1.4" fill="#FF8B8B" />
        <circle cx="2.5" cy="-54" r="1.4" fill="#8BE0A4" />
      </g>
    );
  }
  if (outfit === 'princess') {
    return (
      <g>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={shade(clothes.main, 0.2)} />
            <stop offset="1" stopColor={shade(clothes.main, -0.15)} />
          </linearGradient>
        </defs>
        {neck}
        <path d={`M-11 -66 Q 0 -70 11 -66 L13 -44 Q 30 ${sit ? -14 : -8} 26 ${sit ? -6 : -2} Q 0 ${sit ? 0 : 4} -26 ${sit ? -6 : -2} Q -30 ${sit ? -14 : -8} -13 -44 Z`} fill={`url(#${id})`} />
        <path d="M-13 -46 Q 0 -40 13 -46" stroke={clothes.accent} strokeWidth="2.5" fill="none" />
        <ellipse cx="-12" cy="-63" rx="6" ry="4.5" fill={shade(clothes.main, 0.25)} />
        <ellipse cx="12" cy="-63" rx="6" ry="4.5" fill={shade(clothes.main, 0.25)} />
        {[[-12, -20], [10, -14], [0, -30], [-18, -8], [18, -6]].map(([x, y]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r="1.2" fill="#FFFFFF" opacity="0.9" />
        ))}
      </g>
    );
  }
  if (outfit === 'party' || a.outfitStyle === 'dress' || outfit === 'default') {
    if (outfit === 'default' && a.outfitStyle === 'overalls') {
      return (
        <g>
          {neck}
          <path d="M-12 -66 Q 0 -70 12 -66 L14 -40 L-14 -40 Z" fill={clothes.accent} />
          <path d="M-11 -50 L11 -50 L14 -18 L-14 -18 Z" fill={clothes.main} />
          <rect x="-11" y="-66" width="4" height="18" fill={clothes.main} />
          <rect x="7" y="-66" width="4" height="18" fill={clothes.main} />
          <rect x="-5" y="-44" width="10" height="8" rx="2" fill={shade(clothes.main, -0.15)} />
          <circle cx="-9" cy="-50" r="1.6" fill="#FFE7A3" />
          <circle cx="9" cy="-50" r="1.6" fill="#FFE7A3" />
        </g>
      );
    }
    if (outfit === 'default' && a.outfitStyle === 'sweater') {
      return (
        <g>
          {grad}
          {neck}
          <path d="M-13 -66 Q 0 -70 13 -66 L15 -28 Q 0 -24 -15 -28 Z" fill={`url(#${id})`} />
          {[-48, -40, -32].map((y) => (
            <path key={y} d={`M-14 ${y} L14 ${y}`} stroke={clothes.accent} strokeWidth="2" opacity="0.7" />
          ))}
          <path d="M-6 -66 Q 0 -61 6 -66" stroke={shade(clothes.main, -0.2)} strokeWidth="3" fill="none" />
        </g>
      );
    }
    return (
      <g>
        {grad}
        {neck}
        <path d="M-10 -66 Q 0 -70 10 -66 L12 -50 Q 24 -30 22 -22 Q 0 -16 -22 -22 Q -24 -30 -12 -50 Z" fill={`url(#${id})`} />
        <path d="M-7 -66 Q 0 -60 7 -66" stroke="#FFFFFF" strokeWidth="2.5" fill="none" opacity="0.9" />
        <path d="M-12 -50 Q 0 -46 12 -50" stroke={clothes.accent} strokeWidth="2" fill="none" />
        <path d="M-21 -25 Q 0 -19 21 -25" stroke={clothes.accent} strokeWidth="2" fill="none" opacity="0.8" />
        {outfit === 'party' &&
          [[-10, -36], [8, -30], [-2, -42], [14, -40], [-14, -28]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.4" fill="#FFE7A3" />)}
      </g>
    );
  }
  return null;
}

function Head({ a, uid, outfit, closedEyes = false }: { a: Appearance; uid: string; outfit: HeroinePlacement['outfit']; closedEyes?: boolean }) {
  const hair = a.hairColor;
  const hairDark = shade(hair, -0.18);
  const hairLight = shade(hair, 0.2);
  const gid = `${uid}-skin`;
  const cy = -92;
  return (
    <g>
      <defs>
        <radialGradient id={gid} cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor={shade(a.skinTone, 0.1)} />
          <stop offset="1" stopColor={shade(a.skinTone, -0.08)} />
        </radialGradient>
      </defs>
      {outfit === 'space' && <circle cx="0" cy={cy} r="36" fill="#DDF1FF" opacity="0.25" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="1.5" />}
      <HairBack style={a.hairStyle} color={hairDark} light={hair} cy={cy} />
      {/* уши */}
      <ellipse cx="-25" cy={cy + 3} rx="4" ry="5" fill={shade(a.skinTone, -0.06)} />
      <ellipse cx="25" cy={cy + 3} rx="4" ry="5" fill={shade(a.skinTone, -0.06)} />
      <circle cx="0" cy={cy} r="26" fill={`url(#${gid})`} />
      {/* лицо */}
      {closedEyes ? (
        <g stroke={shade(a.skinTone, -0.55)} strokeWidth="1.8" fill="none" strokeLinecap="round">
          <path d={`M-13 ${cy + 2} q 4 3 8 0`} />
          <path d={`M5 ${cy + 2} q 4 3 8 0`} />
        </g>
      ) : (
        <g>
          {[-9, 9].map((x) => (
            <g key={x}>
              <ellipse cx={x} cy={cy + 2} rx="3.6" ry="4.6" fill={a.eyeColor} />
              <ellipse cx={x} cy={cy + 2.6} rx="2.2" ry="3" fill="#1E1A2E" opacity="0.6" />
              <circle cx={x + 1.2} cy={cy + 0.4} r="1.3" fill="#FFFFFF" />
              <path d={`M${x - 3.5} ${cy - 5.5} q 3.5 -2.2 7 0`} stroke={shade(hair, -0.2)} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.45" />
            </g>
          ))}
        </g>
      )}
      {a.cheeks && (
        <>
          <ellipse cx="-15" cy={cy + 10} rx="5" ry="3" fill="#FF8FA8" opacity="0.38" />
          <ellipse cx="15" cy={cy + 10} rx="5" ry="3" fill="#FF8FA8" opacity="0.38" />
        </>
      )}
      {a.freckles &&
        [[-16, 6], [-13, 8], [-17, 9], [13, 8], [16, 6], [17, 9]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={cy + y} r="0.7" fill={shade(a.skinTone, -0.35)} />)}
      <path d={`M-1 ${cy + 7} q 1 1.5 2 0`} stroke={shade(a.skinTone, -0.3)} strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <path d={`M-4.5 ${cy + 12} q 4.5 4 9 0`} stroke="#B5546A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <HairFront style={a.hairStyle} color={hair} light={hairLight} cy={cy} />
      <AccessoryShape kind={a.accessory} color={a.accessoryColor} cy={cy} />
      {outfit === 'princess' && (
        <g transform={`translate(0 ${cy - 26})`}>
          <path d="M-12 4 L-10 -8 L-4 -1 L0 -11 L4 -1 L10 -8 L12 4 Z" fill="#FFD66B" stroke="#E8B53E" strokeWidth="1" />
          <circle cx="0" cy="-2" r="1.8" fill="#F29BB5" />
        </g>
      )}
      {outfit === 'party' && (
        <g transform={`translate(10 ${cy - 22}) rotate(14)`}>
          <path d="M-9 4 L0 -22 L9 4 Z" fill={shade(a.outfitColor, 0.2)} />
          <path d="M-6 -4 L6 -4 M-3 -12 L3 -12" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="0" cy="-23" r="3" fill="#FFE7A3" />
        </g>
      )}
    </g>
  );
}

function HairBack({ style, color, light, cy }: { style: Appearance['hairStyle']; color: string; light: string; cy: number }) {
  switch (style) {
    case 'long':
      return <path d={`M-28 ${cy - 4} Q -30 ${cy - 34} 0 ${cy - 32} Q 30 ${cy - 34} 28 ${cy - 4} L 30 ${cy + 46} Q 0 ${cy + 54} -30 ${cy + 46} Z`} fill={color} />;
    case 'braids':
      return (
        <g>
          <circle cx="0" cy={cy - 2} r="29" fill={color} />
          {[-1, 1].map((s) => (
            <g key={s}>
              {[0, 1, 2, 3].map((k) => (
                <ellipse key={k} cx={s * (27 + k * 0.5)} cy={cy + 18 + k * 9} rx="5.5" ry="6" fill={k % 2 ? light : color} />
              ))}
              <path d={`M${s * 27} ${cy + 54} l ${s * -3} 6 l ${s * 6} 0 z`} fill={color} />
            </g>
          ))}
        </g>
      );
    case 'ponytail':
      return (
        <g>
          <circle cx="0" cy={cy - 2} r="29" fill={color} />
          <path d={`M-22 ${cy - 22} Q -48 ${cy - 10} -40 ${cy + 26} Q -34 ${cy + 8} -26 ${cy - 4} Z`} fill={color} />
        </g>
      );
    case 'buns':
      return (
        <g>
          <circle cx="0" cy={cy - 2} r="29" fill={color} />
          <circle cx="-22" cy={cy - 26} r="11" fill={color} />
          <circle cx="22" cy={cy - 26} r="11" fill={color} />
          <circle cx="-24" cy={cy - 29} r="4" fill={light} opacity="0.6" />
          <circle cx="20" cy={cy - 29} r="4" fill={light} opacity="0.6" />
        </g>
      );
    case 'curly':
      return (
        <g fill={color}>
          {Array.from({ length: 12 }, (_, i) => {
            const ang = (i / 12) * Math.PI * 2;
            return <circle key={i} cx={Math.cos(ang) * 28} cy={cy - 2 + Math.sin(ang) * 26 + (Math.sin(ang) > 0.5 ? 6 : 0)} r="11" />;
          })}
        </g>
      );
    case 'bob':
    default:
      return <path d={`M-30 ${cy + 16} Q -34 ${cy - 34} 0 ${cy - 32} Q 34 ${cy - 34} 30 ${cy + 16} Q 24 ${cy + 22} 18 ${cy + 14} L -18 ${cy + 14} Q -24 ${cy + 22} -30 ${cy + 16} Z`} fill={color} />;
  }
}

function HairFront({ style, color, light, cy }: { style: Appearance['hairStyle']; color: string; light: string; cy: number }) {
  if (style === 'curly') {
    return (
      <g fill={color}>
        {[-18, -6, 6, 18].map((x, i) => (
          <circle key={x} cx={x} cy={cy - 20 + (i % 2) * 3} r="9" />
        ))}
      </g>
    );
  }
  return (
    <g>
      <path d={`M-26 ${cy - 4} Q -26 ${cy - 30} 0 ${cy - 28} Q 26 ${cy - 30} 26 ${cy - 4} Q 20 ${cy - 16} 8 ${cy - 14} Q 2 ${cy - 22} -4 ${cy - 14} Q -16 ${cy - 16} -26 ${cy - 4} Z`} fill={color} />
      <path d={`M-14 ${cy - 22} Q -4 ${cy - 28} 8 ${cy - 24}`} stroke={light} strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.7" />
    </g>
  );
}

function AccessoryShape({ kind, color, cy }: { kind: Appearance['accessory']; color: string; cy: number }) {
  switch (kind) {
    case 'bow':
      return (
        <g transform={`translate(15 ${cy - 24}) rotate(18)`}>
          <path d="M0 0 L-11 -7 L-11 7 Z" fill={color} />
          <path d="M0 0 L11 -7 L11 7 Z" fill={color} />
          <circle r="3.2" fill={shade(color, -0.2)} />
        </g>
      );
    case 'headband':
      return <path d={`M-25 ${cy - 8} Q 0 ${cy - 40} 25 ${cy - 8}`} stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />;
    case 'flower':
      return (
        <g transform={`translate(-17 ${cy - 20})`}>
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse key={r} rx="3.5" ry="5.5" transform={`rotate(${r}) translate(0 -4)`} fill={color} />
          ))}
          <circle r="2.6" fill="#FFE7A3" />
        </g>
      );
    case 'clip':
      return <rect x="10" y={cy - 22} width="10" height="4" rx="2" fill={color} transform={`rotate(-20 15 ${cy - 20})`} />;
    default:
      return null;
  }
}

function SleepingHeroine({ appearance: a, uid }: { appearance: Appearance; uid: string }) {
  const blanket = shade(a.outfitColor, 0.35);
  return (
    <g>
      <ellipse cx="0" cy="2" rx="78" ry="7" fill="#1A1530" opacity="0.16" />
      {/* кроватка */}
      <rect x="-80" y="-74" width="14" height="76" rx="6" fill="#D9B38C" />
      <rect x="66" y="-46" width="12" height="48" rx="5" fill="#D9B38C" />
      <rect x="-70" y="-32" width="144" height="24" rx="8" fill="#FFF7EA" />
      <rect x="-70" y="-12" width="144" height="10" rx="4" fill="#C99B76" />
      <ellipse cx="-44" cy="-36" rx="22" ry="11" fill="#FFFFFF" />
      {/* голова на подушке */}
      <g transform="translate(-44 17) scale(0.62)">
        <Head a={a} uid={`${uid}-sl`} outfit="pajamas" closedEyes />
      </g>
      {/* одеяло */}
      <path d="M-26 -44 Q 20 -58 72 -40 L74 -14 Q 20 -8 -30 -14 Z" fill={blanket} />
      <path d="M-26 -44 Q 20 -58 72 -40" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity="0.7" />
      {[[-4, -30], [20, -36], [44, -28], [60, -22], [8, -20]].map(([x, y]) => (
        <path key={`${x}${y}`} d={`M${x} ${y - 3} l1 2 2 1 -2 1 -1 2 -1 -2 -2 -1 2 -1z`} fill="#FFFFFF" opacity="0.8" />
      ))}
    </g>
  );
}
