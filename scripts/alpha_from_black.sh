#!/usr/bin/env bash
# Turn a generated "subject on pure black" plate (clouds, smoke, mist, glow) into an alpha image.
#  - alpha from luminance, with the black floor crushed to fully transparent
#  - colour lifted toward white so soft edges don't leave dark fringes on light backgrounds
#  - left/right/bottom edges feathered, so a partly on-screen plate never shows a hard seam
# Usage: alpha_from_black.sh <in.jpg|png> <out.webp|out.png> [width=1920] [feather=0.2]
set -euo pipefail
in="${1:?usage: alpha_from_black.sh <in> <out.webp|png> [width] [feather]}"
out="${2:?output path required}"
w="${3:-1920}"
fe="${4:-0.2}"
tmpdir="$(mktemp -d "${TMPDIR:-/tmp}/alphaplate.XXXXXX")"
tmp="$tmpdir/plate.png"
ffmpeg -y -loglevel error -i "$in" -filter_complex "\
[0:v]scale=${w}:-2,split[c][a];\
[a]format=gray,curves=all='0/0 0.06/0 0.45/0.8 1/1',\
geq=lum='lum(X,Y)*min(1,X/(${fe}*W))*min(1,(W-X)/(${fe}*W))*min(1,(H-Y)/(0.14*H))'[al];\
[c]format=rgb24,lutrgb=r='val*0.28+255*0.72':g='val*0.28+255*0.72':b='val*0.26+255*0.74'[col];\
[col][al]alphamerge" -pix_fmt rgba "$tmp"
case "$out" in
  *.webp)
    if command -v cwebp >/dev/null 2>&1; then
      cwebp -quiet -q 86 -alpha_q 90 -exact "$tmp" -o "$out"
    else
      echo "cwebp not found; writing PNG instead" >&2
      out="${out%.webp}.png"
      cp "$tmp" "$out"
    fi
    ;;
  *) cp "$tmp" "$out" ;;
esac
rm -rf "$tmpdir"
echo "$out"
