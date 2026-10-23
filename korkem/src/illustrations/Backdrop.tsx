import type { SettingId, TimeOfDay } from '../types';
import { SKY, indoorFloor, indoorWall, shade, mix, type SkyPalette } from './palette';

interface Props {
  setting: SettingId;
  time: TimeOfDay;
  uid: string;
}

/** Детерминированный «случайный» генератор для расстановки звёзд и цветов. */
function prng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function Stars({ count, seed, maxY = 190, uid }: { count: number; seed: number; maxY?: number; uid: string }) {
  const r = prng(seed);
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const x = r() * 400;
        const y = r() * maxY;
        const big = r() > 0.85;
        const d = (r() * 4).toFixed(2);
        return big ? (
          <g key={i} transform={`translate(${x} ${y})`} className="anim-twinkle" style={{ animationDelay: `${d}s` }}>
            <path d="M0 -4 L1 -1 L4 0 L1 1 L0 4 L-1 1 L-4 0 L-1 -1 Z" fill="#FFF6D8" filter={`url(#${uid}-glow)`} />
          </g>
        ) : (
          <circle key={i} cx={x} cy={y} r={r() * 0.9 + 0.4} fill="#FFFBEF" opacity={0.5 + r() * 0.5} className={i % 3 === 0 ? 'anim-twinkle' : undefined} style={{ animationDelay: `${d}s` }} />
        );
      })}
    </g>
  );
}

function Sky({ p, uid }: { p: SkyPalette; uid: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.top} />
          <stop offset="0.55" stopColor={p.mid} />
          <stop offset="1" stopColor={p.bottom} />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${uid}-sky)`} />
    </>
  );
}

function Celestial({ p, uid, x = 318, y = 62 }: { p: SkyPalette; uid: string; x?: number; y?: number }) {
  if (p.sun === 'sun')
    return (
      <g transform={`translate(${x} ${y})`}>
        <circle r="46" fill="#FFF3C4" opacity="0.35" filter={`url(#${uid}-blur)`} />
        <circle r="22" fill="#FFE59A" />
        <circle r="22" fill="#FFF6D6" opacity="0.5" transform="translate(-5 -5) scale(0.6)" />
      </g>
    );
  if (p.sun === 'low-sun')
    return (
      <g transform={`translate(${x - 30} 172)`}>
        <circle r="60" fill="#FFD59A" opacity="0.4" filter={`url(#${uid}-blur)`} />
        <circle r="26" fill="#FFC98A" />
      </g>
    );
  if (p.sun === 'moon')
    return (
      <g transform={`translate(${x} ${y})`}>
        <circle r="40" fill="#C9CCFF" opacity="0.25" filter={`url(#${uid}-blur)`} />
        <circle r="18" fill="#FFF4D2" />
        <circle r="18" fill={p.top} transform="translate(8 -5)" opacity="0.95" />
      </g>
    );
  return null;
}

function Clouds({ y = 70, tint = '#FFFFFF', opacity = 0.85, uid }: { y?: number; tint?: string; opacity?: number; uid: string }) {
  const cloud = (cx: number, cy: number, s: number, key: string, dur: number) => (
    <g key={key} transform={`translate(${cx} ${cy}) scale(${s})`}>
      <g className="anim-drift" style={{ animationDuration: `${dur}s` }}>
        <g filter={`url(#${uid}-soft)`} fill={tint} opacity={opacity}>
          <ellipse cx="0" cy="0" rx="34" ry="12" />
          <circle cx="-12" cy="-8" r="13" />
          <circle cx="8" cy="-12" r="16" />
          <circle cx="24" cy="-4" r="10" />
        </g>
      </g>
    </g>
  );
  return <g>{[cloud(70, y, 1, 'a', 38), cloud(230, y - 22, 0.75, 'b', 46), cloud(350, y + 18, 0.9, 'c', 52)]}</g>;
}

function Hills({ p, uid, flowers = true, seed = 3 }: { p: SkyPalette; uid: string; flowers?: boolean; seed?: number }) {
  const r = prng(seed);
  return (
    <g>
      <path d="M0 196 C 60 170, 120 176, 180 188 S 300 168, 400 186 L400 300 L0 300 Z" fill={p.far} opacity="0.9" />
      <path d="M0 214 C 80 196, 150 206, 220 212 S 330 196, 400 208 L400 300 L0 300 Z" fill={p.near} />
      <defs>
        <linearGradient id={`${uid}-ground`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.ground[0]} />
          <stop offset="1" stopColor={p.ground[1]} />
        </linearGradient>
      </defs>
      <path d="M0 232 C 100 222, 200 228, 280 226 S 360 222, 400 226 L400 300 L0 300 Z" fill={`url(#${uid}-ground)`} />
      {flowers &&
        Array.from({ length: 26 }, (_, i) => {
          const x = r() * 400;
          const y = 236 + r() * 60;
          const c = ['#FFFFFF', '#FFD6E5', '#FFE58F', '#D7C8FF'][i % 4];
          return <circle key={i} cx={x} cy={y} r={1.4 + r() * 1.2} fill={c} opacity={p.star ? 0.5 : 0.9} />;
        })}
    </g>
  );
}

function Tree({ x, y, s, color, trunk }: { x: number; y: number; s: number; color: string; trunk: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-4" y="-40" width="8" height="40" rx="3" fill={trunk} />
      <circle cx="0" cy="-52" r="22" fill={color} />
      <circle cx="-14" cy="-40" r="15" fill={color} />
      <circle cx="14" cy="-42" r="16" fill={color} />
      <circle cx="-6" cy="-60" r="10" fill={shade(color, 0.15)} opacity="0.7" />
    </g>
  );
}

function Window({ x, y, w, h, time, uid }: { x: number; y: number; w: number; h: number; time: TimeOfDay; uid: string }) {
  const p = SKY[time];
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <linearGradient id={`${uid}-win`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.top} />
          <stop offset="1" stopColor={p.bottom} />
        </linearGradient>
        <clipPath id={`${uid}-winclip`}>
          <rect width={w} height={h} rx="10" />
        </clipPath>
      </defs>
      <rect x="-6" y="-6" width={w + 12} height={h + 12} rx="14" fill="#FFFFFF" opacity="0.85" />
      <g clipPath={`url(#${uid}-winclip)`}>
        <rect width={w} height={h} fill={`url(#${uid}-win)`} />
        {p.star && <Stars count={18} seed={11} maxY={h} uid={uid} />}
        {p.sun === 'moon' && (
          <g transform={`translate(${w * 0.7} ${h * 0.3})`}>
            <circle r="9" fill="#FFF4D2" />
            <circle r="9" fill={p.top} transform="translate(4 -3)" />
          </g>
        )}
        {p.sun === 'sun' && <circle cx={w * 0.72} cy={h * 0.3} r="9" fill="#FFE59A" />}
        <path d={`M0 ${h * 0.8} C ${w * 0.3} ${h * 0.68}, ${w * 0.6} ${h * 0.75}, ${w} ${h * 0.7} L${w} ${h} L0 ${h} Z`} fill={p.near} />
      </g>
      <rect x={w / 2 - 2} y="0" width="4" height={h} fill="#FFFFFF" opacity="0.9" />
      <rect x="0" y={h / 2 - 2} width={w} height="4" fill="#FFFFFF" opacity="0.9" />
      {/* шторы */}
      <path d={`M-14 -10 Q ${-4} ${h / 2} -16 ${h + 14} L-28 ${h + 14} L-28 -10 Z`} fill="#F4B6C8" opacity="0.92" />
      <path d={`M${w + 14} -10 Q ${w + 4} ${h / 2} ${w + 16} ${h + 14} L${w + 28} ${h + 14} L${w + 28} -10 Z`} fill="#F4B6C8" opacity="0.92" />
      <rect x="-32" y="-16" width={w + 64} height="7" rx="3.5" fill="#C99B76" />
    </g>
  );
}

function Room({ setting, time, uid }: Props) {
  const wall = indoorWall(setting, time);
  const floor = indoorFloor(setting, time);
  const night = time === 'night';
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={wall[0]} />
          <stop offset="1" stopColor={wall[1]} />
        </linearGradient>
        <linearGradient id={`${uid}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={floor[0]} />
          <stop offset="1" stopColor={floor[1]} />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${uid}-wall)`} />
      {/* обои: мелкий узор */}
      <g opacity={night ? 0.12 : 0.18} fill="#FFFFFF">
        {Array.from({ length: 48 }, (_, i) => (
          <circle key={i} cx={(i % 12) * 36 + ((Math.floor(i / 12) % 2) * 18) + 10} cy={Math.floor(i / 12) * 44 + 20} r="2.2" />
        ))}
      </g>
      <rect y="214" width="400" height="86" fill={`url(#${uid}-floor)`} />
      <rect y="210" width="400" height="6" fill={shade(wall[1], -0.15)} opacity="0.6" />
      <g opacity="0.12" stroke="#000" strokeWidth="1">
        {[250, 290].map((y) => (
          <line key={y} x1="0" y1={y} x2="400" y2={y} />
        ))}
      </g>
      {setting === 'bedroom' && (
        <>
          <Window x={60} y={46} w={92} h={100} time={time} uid={uid} />
          {/* полочка с книгами */}
          <rect x="226" y="88" width="104" height="6" rx="3" fill="#C99B76" />
          {['#F29BB5', '#9FC7F0', '#FFD27A', '#B9A2E8'].map((c, i) => (
            <rect key={c} x={234 + i * 14} y={60 - (i % 2) * 4} width="11" height={28 + (i % 2) * 4} rx="2" fill={c} />
          ))}
          <circle cx="306" cy="78" r="9" fill="#F7C9A8" />
          {/* ковёр */}
          <ellipse cx="200" cy="262" rx="150" ry="22" fill={night ? '#6A5D9A' : '#F7D2DE'} opacity="0.85" />
          <ellipse cx="200" cy="262" rx="126" ry="16" fill="none" stroke="#FFFFFF" strokeOpacity="0.5" strokeDasharray="4 6" />
          {/* гирлянда */}
          <path d="M0 26 Q 100 50 200 28 T 400 30" stroke="#C7B6E6" strokeWidth="1.2" fill="none" opacity="0.8" />
          {[30, 80, 130, 180, 230, 280, 330, 380].map((x, i) => (
            <circle key={x} cx={x} cy={i % 2 ? 36 : 40} r="3" fill={['#FFE59A', '#FFC4DA', '#C9E7FF'][i % 3]} className="anim-twinkle" style={{ animationDelay: `${i * 0.4}s` }} filter={`url(#${uid}-glow)`} />
          ))}
        </>
      )}
      {setting === 'home' && (
        <>
          <Window x={250} y={50} w={96} h={96} time={time} uid={uid} />
          <rect x="40" y="70" width="120" height="6" rx="3" fill="#C99B76" />
          <path d="M60 70 q -6 -22 6 -26 q 10 6 4 26 Z" fill="#7DB07C" />
          <rect x="56" y="58" width="16" height="12" rx="3" fill="#E9A178" />
          <rect x="96" y="44" width="28" height="26" rx="3" fill="#FFF7EA" stroke="#C99B76" strokeWidth="3" />
          <circle cx="110" cy="57" r="6" fill="#F29BB5" />
          <rect x="138" y="50" width="12" height="20" rx="2" fill="#9FC7F0" />
          <ellipse cx="200" cy="266" rx="160" ry="20" fill={night ? '#5E5290' : '#F3C9A0'} opacity="0.8" />
          {/* часы */}
          <circle cx="200" cy="60" r="16" fill="#FFF7EA" stroke="#C99B76" strokeWidth="3" />
          <path d="M200 60 L200 50 M200 60 L207 63" stroke="#7A6450" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {setting === 'party' && (
        <>
          <Window x={152} y={52} w={96} h={86} time={time} uid={uid} />
          <path d="M0 22 Q 100 60 200 26 T 400 24" stroke="#C99B76" strokeWidth="1.5" fill="none" />
          {Array.from({ length: 12 }, (_, i) => {
            const x = 16 + i * 33;
            const y = 26 + Math.sin((i / 11) * Math.PI) * 18;
            return <path key={i} d={`M${x - 9} ${y} L${x + 9} ${y} L${x} ${y + 18} Z`} fill={['#F29BB5', '#FFD27A', '#9FC7F0', '#B9E3A8', '#C9B2F0'][i % 5]} />;
          })}
          <ellipse cx="200" cy="264" rx="170" ry="22" fill={night ? '#6A5D9A' : '#FBD9E5'} opacity="0.8" />
          {[50, 350].map((x) => (
            <g key={x} transform={`translate(${x} 120)`}>
              <path d="M0 0 C -14 -40, 14 -40, 0 0" fill="#FFFFFF" opacity="0.0" />
              <circle r="12" cy="-20" fill={x < 200 ? '#C9B2F0' : '#FFD27A'} opacity="0.9" />
              <path d="M0 -8 q 3 30 -2 60" stroke="#FFFFFF" strokeOpacity="0.6" fill="none" />
            </g>
          ))}
        </>
      )}
      {setting === 'kindergarten' && (
        <>
          <Window x={40} y={52} w={90} h={84} time={time} uid={uid} />
          {/* рисунки детей */}
          {[
            [176, 58, '#FFE59A'],
            [236, 66, '#C9E7FF'],
            [296, 56, '#FFD6E5'],
          ].map(([x, y, c]) => (
            <g key={String(x)} transform={`translate(${x} ${y}) rotate(${Number(x) % 3 === 0 ? -4 : 3})`}>
              <rect width="46" height="38" rx="3" fill="#FFFFFF" />
              <circle cx="14" cy="13" r="7" fill={String(c)} />
              <path d="M6 32 L22 20 L32 28 L42 18" stroke="#7DB07C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </g>
          ))}
          <rect x="160" y="132" width="200" height="8" rx="4" fill="#C99B76" />
          {['#F29BB5', '#9FC7F0', '#FFD27A', '#B9E3A8', '#C9B2F0'].map((c, i) => (
            <rect key={c} x={172 + i * 36} y={110} width="22" height="22" rx="4" fill={c} />
          ))}
          <rect x="60" y="244" width="280" height="40" rx="20" fill={night ? '#5E5290' : '#BFE2C9'} opacity="0.85" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <circle key={i} cx={90 + i * 44} cy="264" r="8" fill="#FFFFFF" opacity="0.5" />
          ))}
        </>
      )}
      {night && <rect width="400" height="300" fill="#1A1844" opacity="0.18" />}
    </g>
  );
}

function Forest({ p, uid, time }: { p: SkyPalette; uid: string; time: TimeOfDay }) {
  const night = time === 'night';
  const farTree = mix(p.far, '#2F5E4E', 0.35);
  const nearTree = mix(p.near, '#2C5A42', 0.45);
  return (
    <g>
      {[20, 70, 120, 175, 230, 285, 335, 385].map((x, i) => (
        <Tree key={x} x={x} y={206 - (i % 2) * 6} s={1.15 + (i % 3) * 0.12} color={farTree} trunk={shade(farTree, -0.3)} />
      ))}
      {!night && (
        <g opacity="0.35">
          {[110, 190, 270].map((x) => (
            <path key={x} d={`M${x} 0 L${x + 30} 0 L${x + 90} 300 L${x + 40} 300 Z`} fill="#FFF6D0" filter={`url(#${uid}-blur)`} />
          ))}
        </g>
      )}
      <Hills p={{ ...p, far: mix(p.far, '#6E9D7E', 0.3) }} uid={uid} seed={7} />
      <path d="M170 300 C 190 270, 210 250, 205 228 L 225 228 C 235 252, 250 276, 270 300 Z" fill="#E8D3A8" opacity={night ? 0.25 : 0.55} />
      {[-10, 400].map((x) => (
        <g key={x}>
          <rect x={x - 14} y="0" width="30" height="300" fill={shade(nearTree, -0.35)} />
          <circle cx={x} cy="10" r="70" fill={nearTree} />
          <circle cx={x + (x < 0 ? 30 : -30)} cy="60" r="44" fill={shade(nearTree, 0.08)} />
        </g>
      ))}
    </g>
  );
}

function Lake({ p, uid }: { p: SkyPalette; uid: string }) {
  return (
    <g>
      <path d="M0 190 C 70 166, 140 176, 200 184 S 320 166, 400 182 L400 300 L0 300 Z" fill={p.far} />
      <defs>
        <linearGradient id={`${uid}-water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mix(p.mid, '#6FB3D8', 0.55)} />
          <stop offset="1" stopColor={mix(p.top, '#3B7FA8', 0.55)} />
        </linearGradient>
      </defs>
      <rect y="200" width="400" height="44" fill={`url(#${uid}-water)`} />
      <g stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="1.4" strokeLinecap="round">
        {[[40, 212], [120, 222], [210, 210], [300, 226], [360, 214], [80, 234], [250, 236]].map(([x, y]) => (
          <line key={`${x}-${y}`} x1={x} y1={y} x2={x + 22} y2={y} className="anim-shimmer" />
        ))}
      </g>
      <path d="M0 240 C 80 232, 160 238, 240 236 S 360 232, 400 236 L400 300 L0 300 Z" fill={p.ground[0]} />
      <path d="M0 262 C 100 254, 220 262, 400 256 L400 300 L0 300 Z" fill={p.ground[1]} opacity="0.7" />
      {[24, 34, 372, 384].map((x, i) => (
        <path key={x} d={`M${x} 248 q ${i % 2 ? 4 : -4} -28 0 -44`} stroke={shade(p.near, -0.25)} strokeWidth="3" fill="none" strokeLinecap="round" />
      ))}
      {[30, 380].map((x) => (
        <ellipse key={x} cx={x} cy="208" rx="3" ry="8" fill="#8A5A3C" />
      ))}
    </g>
  );
}

function Garden({ p, uid, time }: { p: SkyPalette; uid: string; time: TimeOfDay }) {
  const night = time === 'night';
  return (
    <g>
      <Hills p={p} uid={uid} seed={5} />
      {/* домик */}
      <g transform="translate(18 120)">
        <rect width="86" height="96" fill={night ? '#B7A6C9' : '#FBEBD6'} />
        <path d="M-10 4 L43 -36 L96 4 Z" fill={night ? '#7F6A9E' : '#E5937A'} />
        <rect x="18" y="24" width="24" height="26" rx="3" fill={night ? '#FFE3A0' : '#BFE3F7'} />
        {night && <rect x="12" y="18" width="36" height="38" fill="#FFE3A0" opacity="0.3" filter={`url(#${uid}-blur)`} />}
        <rect x="56" y="48" width="20" height="48" rx="3" fill="#C99B76" />
      </g>
      {/* заборчик */}
      <g fill={night ? '#9C94BE' : '#FFF7EA'}>
        {Array.from({ length: 14 }, (_, i) => (
          <path key={i} d={`M${130 + i * 20} 228 L${130 + i * 20} 204 L${136 + i * 20} 198 L${142 + i * 20} 204 L${142 + i * 20} 228 Z`} />
        ))}
        <rect x="126" y="208" width="276" height="4" />
        <rect x="126" y="220" width="276" height="4" />
      </g>
      {/* кусты */}
      {[150, 250, 350].map((x, i) => (
        <g key={x}>
          <ellipse cx={x} cy="234" rx="30" ry="18" fill={shade(p.near, -0.1)} />
          {[0, 1, 2].map((k) => (
            <circle key={k} cx={x - 14 + k * 14} cy={228 - (k % 2) * 4} r="3" fill={['#F29BB5', '#FFFFFF', '#FFD27A'][(i + k) % 3]} />
          ))}
        </g>
      ))}
    </g>
  );
}

function Castle({ p, uid, time }: { p: SkyPalette; uid: string; time: TimeOfDay }) {
  const wall = time === 'night' ? '#B9A9DA' : '#FBE3EC';
  const roof = time === 'night' ? '#7C68B5' : '#B48BD9';
  const tower = (x: number, y: number, w: number, h: number) => (
    <g key={x}>
      <rect x={x} y={y} width={w} height={h} fill={wall} />
      <path d={`M${x - 6} ${y} L${x + w / 2} ${y - w * 1.3} L${x + w + 6} ${y} Z`} fill={roof} />
      <path d={`M${x + w / 2} ${y - w * 1.3} l0 -14 l12 5 l-12 5`} fill="#F29BB5" stroke={roof} strokeWidth="1" />
      <rect x={x + w / 2 - 5} y={y + 16} width="10" height="16" rx="5" fill={time === 'night' ? '#FFE3A0' : '#BFE3F7'} />
    </g>
  );
  return (
    <g>
      <Clouds y={120} uid={uid} opacity={0.7} />
      <g transform="translate(110 0)">
        <rect x="30" y="120" width="120" height="90" fill={wall} />
        {tower(0, 96, 34, 114)}
        {tower(146, 96, 34, 114)}
        {tower(72, 70, 36, 60)}
        <path d="M74 210 L74 174 Q 90 154 106 174 L106 210 Z" fill="#C99B76" />
        {[40, 120].map((x) => (
          <rect key={x} x={x} y="140" width="14" height="20" rx="7" fill={time === 'night' ? '#FFE3A0' : '#BFE3F7'} />
        ))}
      </g>
      <Hills p={{ ...p, far: mix(p.far, '#FFFFFF', 0.3) }} uid={uid} seed={9} />
      <path d="M180 300 C 190 270, 196 240, 196 214 L 206 214 C 210 240, 220 270, 240 300 Z" fill="#F4E2C4" opacity="0.7" />
    </g>
  );
}

function Dreamland({ uid }: { uid: string }) {
  return (
    <g>
      <path d="M0 190 C 60 160, 140 170, 200 182 S 330 160, 400 178 L400 300 L0 300 Z" fill="#7B6FC0" opacity="0.8" />
      <path d="M0 222 C 90 200, 170 214, 250 210 S 360 200, 400 210 L400 300 L0 300 Z" fill="#9C86D3" />
      <path d="M0 246 C 100 236, 240 244, 400 238 L400 300 L0 300 Z" fill="#B49CE0" />
      {/* огромные сонные цветы */}
      {[
        [40, 230, 1.1, '#F6B9D6'],
        [360, 226, 1.3, '#C9E0FF'],
      ].map(([x, y, s, c]) => (
        <g key={String(x)} transform={`translate(${x} ${y}) scale(${s})`}>
          <path d="M0 0 q -4 -40 2 -70" stroke="#6E9E8E" strokeWidth="4" fill="none" />
          <g transform="translate(2 -74)">
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} rx="9" ry="16" transform={`rotate(${a}) translate(0 -12)`} fill={String(c)} opacity="0.95" />
            ))}
            <circle r="7" fill="#FFE9A8" filter={`url(#${uid}-glow)`} />
          </g>
        </g>
      ))}
      {/* парящий островок */}
      <g transform="translate(250 92)">
        <g className="anim-float" style={{ animationDuration: '7s' }}>
          <ellipse rx="34" ry="8" fill="#B49CE0" />
          <path d="M-34 0 Q 0 30 34 0 Z" fill="#8C79C8" />
          <circle cx="-8" cy="-10" r="10" fill="#C9B2F0" />
          <circle cx="10" cy="-8" r="8" fill="#F6B9D6" />
        </g>
      </g>
    </g>
  );
}

function Underwater({ uid }: { uid: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-sea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7FD3E0" />
          <stop offset="0.5" stopColor="#3E9DBB" />
          <stop offset="1" stopColor="#2A6F96" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${uid}-sea)`} />
      <g opacity="0.3">
        {[60, 160, 250, 330].map((x) => (
          <path key={x} d={`M${x} 0 L${x + 26} 0 L${x + 70} 300 L${x + 30} 300 Z`} fill="#E8FFFF" filter={`url(#${uid}-blur)`} className="anim-shimmer" />
        ))}
      </g>
      <path d="M0 236 C 80 224, 170 232, 250 228 S 360 222, 400 228 L400 300 L0 300 Z" fill="#F2DDB0" />
      <path d="M0 262 C 120 254, 260 262, 400 256 L400 300 L0 300 Z" fill="#E6C996" />
      {/* водоросли */}
      {[22, 48, 350, 378].map((x, i) => (
        <path key={x} className="anim-sway" style={{ animationDelay: `${i * 0.6}s`, transformOrigin: `${x}px 250px` }} d={`M${x} 250 q -12 -30 0 -60 q 12 -30 0 -70`} stroke={i % 2 ? '#4FA37A' : '#3D8E6A'} strokeWidth="7" fill="none" strokeLinecap="round" />
      ))}
      {/* кораллы */}
      {[
        [96, '#F29BB5'],
        [300, '#FFB38A'],
      ].map(([x, c]) => (
        <g key={String(x)} transform={`translate(${x} 244)`} fill={String(c)}>
          <rect x="-4" y="-34" width="8" height="34" rx="4" />
          <rect x="-16" y="-26" width="7" height="22" rx="3.5" transform="rotate(-20)" />
          <rect x="10" y="-28" width="7" height="24" rx="3.5" transform="rotate(18)" />
        </g>
      ))}
    </g>
  );
}

function Space({ uid }: { uid: string }) {
  return (
    <g>
      <defs>
        <radialGradient id={`${uid}-neb`} cx="0.3" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#7A5DC7" stopOpacity="0.55" />
          <stop offset="1" stopColor="#7A5DC7" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-neb2`} cx="0.8" cy="0.7" r="0.5">
          <stop offset="0" stopColor="#E77BAE" stopOpacity="0.35" />
          <stop offset="1" stopColor="#E77BAE" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill="#0F1338" />
      <rect width="400" height="300" fill={`url(#${uid}-neb)`} />
      <rect width="400" height="300" fill={`url(#${uid}-neb2)`} />
      <Stars count={90} seed={21} maxY={300} uid={uid} />
    </g>
  );
}

function MoonSurface({ uid }: { uid: string }) {
  return (
    <g>
      <rect width="400" height="300" fill="#10143A" />
      <Stars count={70} seed={17} maxY={220} uid={uid} />
      <g transform="translate(320 64)">
        <circle r="22" fill="#5FA8E8" />
        <path d="M-12 -8 q 8 -6 14 2 q -4 8 -14 -2 M2 8 q 8 -2 10 6 q -8 4 -10 -6" fill="#7DC58A" />
        <circle r="30" fill="#7FB8FF" opacity="0.25" filter={`url(#${uid}-blur)`} />
      </g>
      <path d="M0 214 C 90 196, 190 210, 270 202 S 370 196, 400 204 L400 300 L0 300 Z" fill="#B9BED6" />
      <path d="M0 246 C 120 236, 240 246, 400 238 L400 300 L0 300 Z" fill="#9EA3C0" />
      {[
        [80, 232, 22],
        [250, 222, 14],
        [330, 262, 26],
        [150, 274, 12],
      ].map(([x, y, r]) => (
        <g key={`${x}`}>
          <ellipse cx={x} cy={y} rx={r} ry={r * 0.32} fill="#7F84A6" />
          <ellipse cx={x} cy={y - 1.5} rx={r * 0.8} ry={r * 0.22} fill="#6D7295" />
        </g>
      ))}
    </g>
  );
}

export function Backdrop({ setting, time, uid }: Props) {
  const p = SKY[time];
  switch (setting) {
    case 'bedroom':
    case 'home':
    case 'party':
    case 'kindergarten':
      return <Room setting={setting} time={time} uid={uid} />;
    case 'space':
      return <Space uid={uid} />;
    case 'moon':
      return <MoonSurface uid={uid} />;
    case 'underwater':
      return <Underwater uid={uid} />;
    case 'dreamland': {
      const dp: SkyPalette = { ...SKY.night, top: '#2D2A6E', mid: '#6E5BB0', bottom: '#E7A9CF' };
      return (
        <g>
          <Sky p={dp} uid={uid} />
          <Stars count={40} seed={5} uid={uid} />
          <Celestial p={dp} uid={uid} />
          <Clouds y={120} tint="#F6D3EA" opacity={0.6} uid={uid} />
          <Dreamland uid={uid} />
        </g>
      );
    }
    case 'sky':
      return (
        <g>
          <Sky p={p} uid={uid} />
          {p.star && <Stars count={50} seed={9} uid={uid} />}
          <Celestial p={p} uid={uid} />
          <Clouds y={80} uid={uid} opacity={p.star ? 0.25 : 0.8} />
          {/* море облаков */}
          <g fill={p.star ? '#8D86C4' : '#FFFFFF'} opacity="0.95" filter={`url(#${uid}-soft)`}>
            {Array.from({ length: 11 }, (_, i) => (
              <circle key={i} cx={i * 40} cy={260 + (i % 2) * 10} r={42 + (i % 3) * 8} />
            ))}
            <rect y="270" width="400" height="40" />
          </g>
          {p.star && (
            <g opacity="0.8">
              {[60, 140, 220, 300].map((x) => (
                <rect key={x} x={x} y={290} width="6" height="6" fill="#FFE3A0" />
              ))}
            </g>
          )}
        </g>
      );
    default: {
      return (
        <g>
          <Sky p={p} uid={uid} />
          {p.star && <Stars count={60} seed={setting.length * 7} uid={uid} />}
          <Celestial p={p} uid={uid} x={setting === 'forest' ? 200 : 318} />
          <Clouds y={70} uid={uid} opacity={p.star ? 0.2 : 0.85} />
          {setting === 'forest' && <Forest p={p} uid={uid} time={time} />}
          {setting === 'meadow' && (
            <>
              {[50, 330].map((x, i) => (
                <Tree key={x} x={x} y={200 + i * 4} s={0.8} color={mix(p.near, '#3E7A55', 0.3)} trunk="#8A6448" />
              ))}
              <Hills p={p} uid={uid} />
            </>
          )}
          {setting === 'lake' && <Lake p={p} uid={uid} />}
          {setting === 'garden' && <Garden p={p} uid={uid} time={time} />}
          {setting === 'castle' && <Castle p={p} uid={uid} time={time} />}
        </g>
      );
    }
  }
}
