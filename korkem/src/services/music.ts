/**
 * Фоновая музыка без аудиофайлов: оригинальные колыбельные синтезируются в браузере
 * через Web Audio API (музыкальная шкатулка, мягкие аккорды, тихий перебор).
 * Мелодии написаны специально для приложения — проблем с авторскими правами нет.
 */

export interface MusicTrack {
  id: string;
  title: string;
  description: string;
}

export const MUSIC_TRACKS: MusicTrack[] = [
  { id: 'stars', title: 'Звёздная колыбельная', description: 'Музыкальная шкатулка' },
  { id: 'clouds', title: 'Тихие облака', description: 'Мягкие аккорды' },
  { id: 'forest', title: 'Лесная шкатулка', description: 'Нежный перебор' },
];

type Note = [midi: number | null, beats: number];

// «Звёздная колыбельная», 3/4
const STARS_MELODY: Note[] = [
  [64, 1], [67, 1], [64, 1], [62, 1], [64, 1], [60, 1], [64, 1], [67, 1], [69, 1], [67, 3],
  [69, 1], [67, 1], [64, 1], [62, 1], [64, 1], [62, 1], [60, 1], [64, 1], [62, 1], [60, 3],
  [67, 1], [69, 1], [72, 1], [71, 2], [69, 1], [67, 1], [64, 1], [65, 1], [67, 3],
  [65, 1], [64, 1], [62, 1], [64, 1], [62, 1], [59, 1], [60, 3], [null, 3],
];
const STARS_BASS: Array<[number, number]> = [
  [48, 3], [43, 3], [48, 3], [48, 3], [53, 3], [43, 3], [48, 3], [48, 3],
  [48, 3], [53, 3], [48, 3], [48, 3], [53, 3], [43, 3], [48, 3], [48, 3],
];

const CLOUD_CHORDS: number[][] = [
  [57, 60, 64], [53, 57, 60, 64], [48, 55, 60, 64], [55, 59, 62],
  [57, 60, 64], [53, 57, 60], [55, 59, 62, 65], [48, 52, 55, 60],
];

const FOREST_SCALE = [60, 62, 64, 67, 69, 72, 74, 76];

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

class MusicEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private wet: GainNode | null = null;
  private timer: number | null = null;
  private nextTime = 0;
  private step = 0;
  private trackId = 'stars';
  private volume = 0.35;
  private playing = false;
  private seed = 7;

  isSupported() {
    return typeof window !== 'undefined' && !!(window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
  }

  isPlaying() {
    return this.playing;
  }

  /** Вызывать только из обработчика нажатия — иначе браузер не разрешит звук. */
  async start(trackId: string, volume: number) {
    if (!this.isSupported()) return false;
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      const reverb = this.ctx.createConvolver();
      reverb.buffer = this.impulse(2.6);
      this.wet = this.ctx.createGain();
      this.wet.gain.value = 0.45;
      this.master.connect(this.ctx.destination);
      this.wet.connect(reverb);
      reverb.connect(this.master);
    }
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    const changed = trackId !== this.trackId;
    this.trackId = trackId;
    this.volume = volume;
    if (!this.playing || changed) {
      this.step = 0;
      this.nextTime = this.ctx.currentTime + 0.15;
    }
    this.playing = true;
    const g = this.master!.gain;
    g.cancelScheduledValues(this.ctx.currentTime);
    g.setValueAtTime(g.value, this.ctx.currentTime);
    g.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 2.5);
    if (this.timer == null) this.timer = window.setInterval(() => this.schedule(), 120);
    return true;
  }

  setVolume(v: number) {
    this.volume = v;
    if (this.ctx && this.master && this.playing) {
      const g = this.master.gain;
      g.cancelScheduledValues(this.ctx.currentTime);
      g.setValueAtTime(g.value, this.ctx.currentTime);
      g.linearRampToValueAtTime(v, this.ctx.currentTime + 0.3);
    }
  }

  /** Плавное затухание и остановка. */
  stop(fadeSeconds = 2) {
    if (!this.ctx || !this.master || !this.playing) return;
    this.playing = false;
    const t = this.ctx.currentTime;
    const g = this.master.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(0, t + fadeSeconds);
    window.setTimeout(() => {
      if (this.playing) return;
      if (this.timer != null) window.clearInterval(this.timer);
      this.timer = null;
      this.ctx?.suspend().catch(() => {});
    }, fadeSeconds * 1000 + 200);
  }

  private impulse(seconds: number) {
    const ctx = this.ctx!;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    return buf;
  }

  private rand() {
    this.seed = (this.seed * 16807) % 2147483647;
    return this.seed / 2147483647;
  }

  private schedule() {
    if (!this.ctx || !this.playing) return;
    const ahead = this.ctx.currentTime + 0.6;
    while (this.nextTime < ahead) {
      this.nextTime += this.playStep(this.nextTime);
    }
  }

  /** Играет один шаг текущей мелодии и возвращает его длительность в секундах. */
  private playStep(time: number): number {
    switch (this.trackId) {
      case 'clouds': {
        const beat = 60 / 48;
        const chord = CLOUD_CHORDS[this.step % CLOUD_CHORDS.length];
        chord.forEach((m, i) => this.pad(mtof(m), time + i * 0.06, beat * 4));
        if (this.step % 2 === 0) this.bell(mtof(chord[chord.length - 1] + 12), time + beat * 2, 0.06);
        this.step++;
        return beat * 4;
      }
      case 'forest': {
        const beat = 60 / 72;
        const i = this.step % 16;
        const base = Math.floor(this.rand() * 4);
        const note = FOREST_SCALE[(base + (i % 4) * 2) % FOREST_SCALE.length];
        this.pluck(mtof(note), time, 0.11);
        if (i % 4 === 0) this.pluck(mtof([48, 45, 41, 43][(this.step >> 2) % 4]), time, 0.09, 2.4);
        this.step++;
        return beat / 2;
      }
      default: {
        const beat = 60 / 76;
        const [m, beats] = STARS_MELODY[this.step % STARS_MELODY.length];
        if (m != null) this.bell(mtof(m + 12), time, 0.12);
        // бас: смотрим, начинается ли такт
        const pos = STARS_MELODY.slice(0, this.step % STARS_MELODY.length).reduce((s, n) => s + n[1], 0);
        if (pos % 3 === 0) {
          const bar = Math.floor(pos / 3) % STARS_BASS.length;
          this.pad(mtof(STARS_BASS[bar][0]), time, beat * 3, 0.05);
        }
        this.step++;
        return beat * beats;
      }
    }
  }

  private out(node: AudioNode) {
    node.connect(this.master!);
    node.connect(this.wet!);
  }

  private bell(freq: number, t: number, level: number) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(level, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
    [1, 2.01, 3.98].forEach((mult, i) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = freq * mult;
      const pg = ctx.createGain();
      pg.gain.value = [1, 0.25, 0.08][i];
      o.connect(pg).connect(g);
      o.start(t);
      o.stop(t + 2.3);
    });
    this.out(g);
  }

  private pad(freq: number, t: number, dur: number, level = 0.035) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(level, t + dur * 0.35);
    g.gain.linearRampToValueAtTime(0, t + dur * 1.05);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 900;
    [-4, 4].forEach((det) => {
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.value = freq;
      o.detune.value = det;
      o.connect(f);
      o.start(t);
      o.stop(t + dur * 1.1);
    });
    f.connect(g);
    this.out(g);
  }

  private pluck(freq: number, t: number, level: number, decay = 1.4) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(level, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    o.connect(g);
    o.start(t);
    o.stop(t + decay + 0.05);
    this.out(g);
  }
}

export const music = new MusicEngine();
