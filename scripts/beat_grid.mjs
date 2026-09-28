#!/usr/bin/env node
// Precise beat grid from high-frequency transient onsets (kick/clap clicks above 3 kHz).
// Low-passed envelopes peak ~100ms after the audible attack; the click is where the ear hears the beat.
//
// Usage: node beat_grid.mjs <audio-file> <start-s> <end-s> [approx]
//   approx: a BPM (e.g. 129) or a beat period in seconds (e.g. 0.465). Defaults to 129 BPM.
//   Pick a window of 8-15s right after the drop.
// Output: beat period, bpm, a t0 on the grid, and per-onset residuals in ms (should be single digits).
import { execFileSync } from "node:child_process";

const [file, a0, b0, p0] = process.argv.slice(2);
if (!file || a0 === undefined || b0 === undefined) {
  console.error("usage: node beat_grid.mjs <audio-file> <start-s> <end-s> [approx-bpm-or-beat-seconds]");
  process.exit(1);
}
const a = Number(a0), b = Number(b0);
const SR = 22050, hop = 110, dt = hop / SR; // ~5ms
// Decode the whole file (no -ss before -i: input seeking can shift compressed audio).
const buf = execFileSync(
  "ffmpeg",
  ["-v", "error", "-i", file, "-ac", "1", "-ar", String(SR), "-af", "highpass=f=3000,highpass=f=3000", "-f", "s16le", "-"],
  { maxBuffer: 1 << 30 },
);
const n = Math.floor(buf.length / 2 / hop);
const e = new Float32Array(n);
for (let i = 0; i < n; i++) {
  let s = 0;
  for (let j = 0; j < hop; j++) {
    const v = buf.readInt16LE((i * hop + j) * 2) / 32768;
    s += v * v;
  }
  e[i] = Math.sqrt(s / hop);
}
const i0 = Math.floor(a / dt), i1 = Math.min(n, Math.floor(b / dt));
let mx = 0;
for (let i = i0; i < i1; i++) mx = Math.max(mx, e[i]);
const ons = [];
for (let i = i0 + 2; i < i1; i++) {
  if (e[i] > 0.35 * mx && e[i - 1] < 0.5 * e[i] && (!ons.length || i * dt - ons[ons.length - 1] > 0.15)) ons.push(i * dt);
}
if (ons.length < 4) {
  console.error(`only ${ons.length} onsets found in ${a}-${b}s; widen the window or choose a section with drums`);
  process.exit(2);
}
// Least-squares fit of onsets to a half-beat grid: t = t0 + k * (P/2)
let t0 = ons[0];
const approx = Number(p0) || 129;
let P = approx > 10 ? 60 / approx : approx; // accept BPM or seconds
for (let it = 0; it < 4; it++) {
  const ks = ons.map((t) => Math.round((t - t0) / (P / 2)));
  const m = ks.length;
  const sk = ks.reduce((x, y) => x + y, 0), st = ons.reduce((x, y) => x + y, 0);
  const skk = ks.reduce((x, k) => x + k * k, 0), skt = ks.reduce((x, k, j) => x + k * ons[j], 0);
  const half = (m * skt - sk * st) / (m * skk - sk * sk);
  t0 = (st - half * sk) / m;
  P = 2 * half;
}
const res = ons.map((t) => {
  const k = Math.round((t - t0) / (P / 2));
  return Math.round((t - (t0 + (k * P) / 2)) * 1000);
});
console.log(`onsets ${ons.length}`);
console.log(`beat ${P.toFixed(5)}s  (${(60 / P).toFixed(2)} bpm)`);
console.log(`grid t0 ${t0.toFixed(3)}s  (a point on the HALF-beat grid; the drop downbeat is the first on-beat onset where energy steps up, check it against analyze_music.mjs)`);
console.log(`residuals ms: ${res.join(" ")}`);
