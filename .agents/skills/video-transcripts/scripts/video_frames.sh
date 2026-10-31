#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  video_frames.sh <video-path> --output DIR

Writes DIR/metadata.json, one frame per second as DIR/frames/tSSSS.png
(t0012.png is the frame at 00:12), and contact sheets of nine frames as
DIR/sheet-SSSS-SSSS.png, named by the first and last second they show.
EOF
}

if [[ "${1:-}" == "" || "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  usage
  exit 0
fi

VIDEO="$1"
shift
OUTPUT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --output)
      OUTPUT="${2:-}"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ -z "$OUTPUT" ]]; then
  usage >&2
  exit 1
fi
if [[ ! -f "$VIDEO" ]]; then
  echo "Video not found: $VIDEO" >&2
  exit 1
fi
for command_name in ffmpeg ffprobe; do
  command -v "$command_name" >/dev/null 2>&1 || {
    echo "video_frames.sh requires $command_name." >&2
    exit 1
  }
done

mkdir -p "$OUTPUT/frames"
OUTPUT="$(cd "$OUTPUT" && pwd -P)"
rm -f "$OUTPUT"/frames/t*.png "$OUTPUT"/sheet-*.png

ffprobe -v error -show_format -show_streams -of json "$VIDEO" > "$OUTPUT/metadata.json"
# A recording's video track can run past the length its container plays.
# A streamed recording, such as a browser's WebM, stores no length.
duration="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$VIDEO")"
length_limit=()
if [[ "$duration" =~ ^[0-9]+(\.[0-9]+)?$ ]]; then
  length_limit=(-t "$duration")
fi

ffmpeg -hide_banner -loglevel error -y -i "$VIDEO" ${length_limit[@]+"${length_limit[@]}"} \
  -vf "fps=1,scale='if(gt(iw,ih),min(1568,iw),-2)':'if(gt(iw,ih),-2,min(1568,ih))'" \
  -start_number 0 "$OUTPUT/frames/t%04d.png"

frame_count="$(find "$OUTPUT/frames" -name 't*.png' | wc -l | tr -d ' ')"

ffmpeg -hide_banner -loglevel error -y -framerate 1 -start_number 0 \
  -i "$OUTPUT/frames/t%04d.png" \
  -vf "scale=480:480:force_original_aspect_ratio=decrease,tile=3x3:padding=6:margin=6:color=white" \
  -fps_mode passthrough -start_number 0 "$OUTPUT/sheet-%04d.png"

sheet_count=0
for sheet in "$OUTPUT"/sheet-[0-9][0-9][0-9][0-9].png; do
  [[ -e "$sheet" ]] || continue
  index="$(basename "$sheet" .png)"
  index=$((10#${index#sheet-}))
  first=$((index * 9))
  last=$((first + 8 < frame_count - 1 ? first + 8 : frame_count - 1))
  mv "$sheet" "$OUTPUT/$(printf 'sheet-%04d-%04d.png' "$first" "$last")"
  sheet_count=$((sheet_count + 1))
done

echo "OUTPUT=$OUTPUT"
echo "FRAMES=$frame_count"
echo "SHEETS=$sheet_count"
