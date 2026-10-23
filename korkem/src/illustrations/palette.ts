import type { SettingId, TimeOfDay } from '../types';

export interface SkyPalette {
  top: string;
  mid: string;
  bottom: string;
  light: string; // цвет общего освещения
  lightOpacity: number;
  ground: [string, string];
  far: string; // дальние холмы
  near: string; // ближние холмы
  star: boolean;
  sun: 'sun' | 'moon' | 'low-sun' | null;
}

export const SKY: Record<TimeOfDay, SkyPalette> = {
  day: { top: '#4FA8EC', mid: '#9DD6F7', bottom: '#FFF1CF', light: '#FFF2B8', lightOpacity: 0.32, ground: ['#7CC45C', '#3F9447'], far: '#8FC9B0', near: '#62B25A', star: false, sun: 'sun' },
  sunset: { top: '#5B4BB0', mid: '#F08A9C', bottom: '#FFC47A', light: '#FF9F6B', lightOpacity: 0.34, ground: ['#8DB566', '#4F8452'], far: '#A07FBF', near: '#6E9C5E', star: false, sun: 'low-sun' },
  night: { top: '#0B1240', mid: '#26287A', bottom: '#5D45A0', light: '#8C9BFF', lightOpacity: 0.22, ground: ['#2F5B6E', '#1B3447'], far: '#33378A', near: '#24506A', star: true, sun: 'moon' },
  dawn: { top: '#8CA6F0', mid: '#F2B8DA', bottom: '#FFDDB8', light: '#FFE2C2', lightOpacity: 0.28, ground: ['#8FD07A', '#55A363'], far: '#B7BDEB', near: '#7DC27E', star: false, sun: 'low-sun' },
};

export interface SettingStyle {
  indoor?: boolean;
  wall?: [string, string];
  floor?: [string, string];
  sky?: Partial<SkyPalette>;
}

export const SETTING_STYLE: Partial<Record<SettingId, SettingStyle>> = {
  bedroom: { indoor: true, wall: ['#F6E6EF', '#E9D3E6'], floor: ['#E6C9A8', '#D2AE88'] },
  home: { indoor: true, wall: ['#FBEBD6', '#F1D9BC'], floor: ['#DDB78F', '#C99C72'] },
  party: { indoor: true, wall: ['#FCE3EC', '#F5CFE0'], floor: ['#E7C29C', '#D3A57C'] },
  kindergarten: { indoor: true, wall: ['#E3F1F8', '#CFE6F2'], floor: ['#E9CFA4', '#D7B585'] },
};

/** Ночью стены в комнатах становятся сумеречными. */
export function indoorWall(setting: SettingId, time: TimeOfDay): [string, string] {
  const base = SETTING_STYLE[setting]?.wall ?? ['#F5E8DA', '#E9D6C2'];
  if (time === 'night') return ['#4A4680', '#36336A'];
  if (time === 'sunset') return [mix(base[0], '#F2B49A', 0.3), mix(base[1], '#C88FA7', 0.3)];
  return base;
}

export function indoorFloor(setting: SettingId, time: TimeOfDay): [string, string] {
  const base = SETTING_STYLE[setting]?.floor ?? ['#E0BE98', '#C99F78'];
  if (time === 'night') return ['#5B4E7E', '#433A63'];
  return base;
}

export function mix(a: string, b: string, t: number): string {
  const pa = hex(a);
  const pb = hex(b);
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}

export function shade(color: string, amount: number): string {
  return amount >= 0 ? mix(color, '#FFFFFF', amount) : mix(color, '#1A1530', -amount);
}

function hex(c: string): number[] {
  const h = c.replace('#', '');
  const full = h.length === 3 ? h.split('').map((x) => x + x).join('') : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}
