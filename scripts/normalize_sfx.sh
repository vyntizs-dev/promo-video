#!/usr/bin/env bash
# Peak-normalize every audio file in a folder to -1 dBFS and write 48 kHz stereo WAVs next to them.
# Generated SFX arrive anywhere between -13 and 0 dBFS; normalizing makes data-volume meaningful.
# Usage: normalize_sfx.sh <dir> [--delete-sources]
set -euo pipefail
dir="${1:?usage: normalize_sfx.sh <dir> [--delete-sources]}"
del="${2:-}"
shopt -s nullglob
for f in "$dir"/*.{mp3,m4a,ogg,flac,wav}; do
  base="${f%.*}"
  out="$base.wav"
  tmp="$base.__norm.wav"
  peak=$(ffmpeg -hide_banner -i "$f" -af volumedetect -f null - 2>&1 | awk '/max_volume/ {print $5}')
  gain=$(awk -v p="$peak" 'BEGIN { printf "%.1f", -1 - p }')
  ffmpeg -y -loglevel error -i "$f" -af "volume=${gain}dB" -ar 48000 -ac 2 "$tmp"
  mv "$tmp" "$out"
  if [[ "$del" == "--delete-sources" && "$f" != "$out" ]]; then rm -f "$f"; fi
  echo "$(basename "$out")  gain ${gain} dB"
done
