#!/usr/bin/env bash
# Contact strip from the RENDERED video (the render is the truth, snapshots are not).
# Usage: review_strip.sh <video.mp4> <out.jpg> [times in seconds, default: 12 evenly spaced] [tile width=480]
#   review_strip.sh renders/promo.mp4 /tmp/strip.jpg "0.5 1.6 2.8 3.72 5 7 8.5 10 11.2 12.5 13.1 14.9"
set -euo pipefail
in="${1:?usage: review_strip.sh <video> <out.jpg> [\"t1 t2 ...\"] [tile-width]}"
out="${2:?output path required}"
times="${3:-}"
tw="${4:-480}"
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$in")
if [[ -z "$times" ]]; then
  times=$(awk -v d="$dur" 'BEGIN { for (i = 0; i < 12; i++) printf "%.3f ", (i + 0.5) * d / 12 }')
fi
tmpd=$(mktemp -d)
i=0
for t in $times; do
  ffmpeg -y -loglevel error -ss "$t" -i "$in" -frames:v 1 -vf "scale=${tw}:-2" "$tmpd/$(printf %03d $i).png"
  i=$((i + 1))
done
cols=4
(( i < cols )) && cols=$i
rows=$(( (i + cols - 1) / cols ))
ffmpeg -y -loglevel error -framerate 1 -i "$tmpd/%03d.png" -vf "tile=${cols}x${rows}" -frames:v 1 "$out"
rm -rf "$tmpd"
echo "$out ($i frames at: $times)"
