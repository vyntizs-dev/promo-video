#!/usr/bin/env bash
# QC the mixed audio of a rendered promo: integrated loudness, true peak, and a 10ms sub-energy
# trace around the drop and the stop so you can confirm the hits land on the cut.
# Usage: audio_qc.sh <video.mp4> [drop_s] [stop_s]
set -euo pipefail
in="${1:?usage: audio_qc.sh <video> [drop_s] [stop_s]}"
if [[ -z "$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$in")" ]]; then
  echo "no audio stream in $in: check that every <audio> has an id and a src that exists" >&2
  exit 2
fi
echo "== container"
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,sample_rate,duration -of compact "$in"
echo "== loudness (target ~ -15 LUFS integrated, true peak <= -1 dBFS)"
ffmpeg -hide_banner -i "$in" -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p' | grep -E "I:|Peak:"
echo "== unique frames (proves the frame rate is real)"
ffmpeg -hide_banner -i "$in" -vf mpdecimate -f null - 2>&1 | grep -oE "frame= *[0-9]+" | tail -1
trace() {
  local at="$1" start
  start=$(awk -v a="$at" 'BEGIN { s = a - 0.1; if (s < 0) s = 0; printf "%.3f", s }')
  ffmpeg -v error -i "$in" -vn -ss "$start" -t 0.25 -ac 1 -ar 22050 -af "lowpass=f=150" -f s16le - |
    node -e '
      const w = +process.argv[1]; const c = [];
      process.stdin.on("data", d => c.push(d)).on("end", () => {
        const b = Buffer.concat(c), h = 220; let o = "";
        for (let i = 0; i * h * 2 < b.length; i++) {
          let s = 0, k = 0;
          for (let j = 0; j < h; j++) { const q = (i * h + j) * 2; if (q < b.length) { const v = b.readInt16LE(q) / 32768; s += v * v; k++; } }
          o += (w + i * 0.01).toFixed(2) + ":" + Math.round(Math.sqrt(s / k) * 1000) + " ";
        }
        console.log(o);
      });' "$start"
}
if [[ -n "${2:-}" ]]; then echo "== sub energy around the drop (${2}s): should jump right at it"; trace "$2"; fi
if [[ -n "${3:-}" ]]; then echo "== sub energy around the stop (${3}s): the hit should arrive right at it"; trace "$3"; fi
