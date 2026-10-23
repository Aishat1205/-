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
  day: { top: '#8EC9F0', mid: '#BFE3F7', bottom: '#FFF4DE', light: '#FFF7D6', lightOpacity: 0.25, ground: ['#9CCB7E', '#6FAF68'], far: '#B5D9C3', near: '#8FC48A', star: false, sun: 'sun' },
  sunset: { top: '#6F62B0', mid: '#E99CA5', bottom: '#FFD9A8', light: '#FFB98A', lightOpacity: 0.28, ground: ['#9DB884', '#6E9469'], far: '#B49BC2', near: '#8BA47E', star: false, sun: 'low-sun' },
  night: { top: '#141A43', mid: '#2C2E6E', bottom: '#5A4F93', light: '#9FA8FF', lightOpacity: 0.18, ground: ['#3D5A6A', '#273E4F'], far: '#3A3F78', near: '#2F4A5C', star: true, sun: 'moon' },
  dawn: { top: '#A8B8EC', mid: '#E9C6E0', bottom: '#FFE3CF', light: '#FFE9D6', lightOpacity: 0.22, ground: ['#A5CB92', '#7DB07C'], far: '#C6C9E6', near: '#9CC394', star: false, sun: 'low-sun' },
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
