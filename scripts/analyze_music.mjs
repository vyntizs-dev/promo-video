#!/usr/bin/env node
// Rough tempo and a per-second energy map for choosing a music section.
// Usage: node analyze_music.mjs <audio-file>
// Output: "bpm ~ X" plus lines of "second:full/sub" energies (x100). A clean filtered build shows
// sub ~0-1, then the drop jumps to high full AND sub energy that stays up.
import { execFileSync } from "node:child_process";

const file = process.argv[2];
if (!file) {
  console.error("usage: node analyze_music.mjs <audio-file>");
  process.exit(1);
}
const SR = 11025;
const hop = 110; // 10ms

function pcm(filter) {
  const args = ["-v", "error", "-i", file, "-ac", "1", "-ar", String(SR)];
  if (filter) args.push("-af", filter);
  args.push("-f", "s16le", "-");
  const buf = execFileSync("ffmpeg", args, { maxBuffer: 1 << 30 });
  const out = new Float32Array(buf.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = buf.readInt16LE(i * 2) / 32768;
  return out;
}

const full = pcm(null);
const sub = pcm("lowpass=f=120,lowpass=f=120");
const n = Math.floor(full.length / hop);
const rms = new Float32Array(n);
const srms = new Float32Array(n);
for (let i = 0; i < n; i++) {
  let a = 0, b = 0;
  for (let j = 0; j < hop; j++) {
    const x = full[i * hop + j], y = sub[i * hop + j];
    a += x * x;
    b += y * y;
  }
  rms[i] = Math.sqrt(a / hop);
  srms[i] = Math.sqrt(b / hop);
}

// Onset envelope and a comb search for tempo between 70 and 180 bpm.
const on = new Float32Array(n);
for (let i = 1; i < n; i++) on[i] = Math.max(0, srms[i] - srms[i - 1]) + 0.5 * Math.max(0, rms[i] - rms[i - 1]);
const scores = [];
for (let bpm = 70; bpm <= 180; bpm += 0.25) {
  const lag = 6000 / bpm;
  let s = 0;
  for (let i = 0; i + lag * 4 < n; i++) s += on[i] * on[Math.round(i + lag)];
  scores.push([bpm, s]);
}
scores.sort((x, y) => y[1] - x[1]);
console.log(`file ${file}`);
console.log(`bpm ~ ${scores[0][0].toFixed(2)} (top: ${scores.slice(0, 5).map((s) => s[0]).join(", ")})  -- refine with beat_grid.mjs`);

const secs = Math.floor(n / 100);
let line = "";
for (let s = 0; s < secs; s++) {
  let e = 0, l = 0;
  for (let i = s * 100; i < s * 100 + 100; i++) {
    e += rms[i];
    l += srms[i];
  }
  line += `${s}:${Math.round(e)}/${Math.round(l)} `;
  if (s % 12 === 11) {
    console.log(line);
    line = "";
  }
}
if (line) console.log(line);
