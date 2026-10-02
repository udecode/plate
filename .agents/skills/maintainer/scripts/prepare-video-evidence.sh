#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: prepare-video-evidence.sh VIDEO --output DIR [--interval SECONDS]"
}

video_path=${1:-}
[[ -n "$video_path" ]] || { usage >&2; exit 2; }
shift
output_dir=""
interval=1
while (($#)); do
  case "$1" in
    --output) output_dir=${2:-}; shift 2 ;;
    --interval) interval=${2:-}; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done

[[ -f "$video_path" ]] || { echo "Video not found: $video_path" >&2; exit 2; }
[[ "$interval" =~ ^[1-9][0-9]*$ ]] || { echo "Interval must be a positive integer" >&2; exit 2; }
for command_name in ffmpeg ffprobe; do
  command -v "$command_name" >/dev/null || { echo "Missing command: $command_name" >&2; exit 3; }
done

video_path=$(cd "$(dirname "$video_path")" && printf '%s/%s\n' "$PWD" "$(basename "$video_path")")
if [[ -z "$output_dir" ]]; then
  stem=$(basename "$video_path")
  output_dir="$(dirname "$video_path")/${stem%.*}-evidence"
fi
mkdir -p "$output_dir/frames"
output_dir=$(cd "$output_dir" && pwd -P)

ffprobe -v error -show_format -show_streams -of json "$video_path" >"$output_dir/metadata.json"
ffmpeg -hide_banner -loglevel error -y -i "$video_path" \
  -vf "fps=1/$interval,scale=960:-2" -frames:v 60 \
  "$output_dir/frames/frame-%04d.png"
ffmpeg -hide_banner -loglevel error -y -i "$video_path" \
  -vf "fps=1/$interval,scale=320:-2,tile=4x4:nb_frames=16:padding=4:margin=4" \
  -fps_mode passthrough "$output_dir/contact-%03d.png"

frame_count=$(find "$output_dir/frames" -type f -name 'frame-*.png' | wc -l | tr -d ' ')
contact_count=$(find "$output_dir" -maxdepth 1 -type f -name 'contact-*.png' | wc -l | tr -d ' ')
echo "VIDEO=$video_path"
echo "METADATA=$output_dir/metadata.json"
echo "FRAMES=$frame_count"
echo "CONTACT_SHEETS=$contact_count"
echo "OUTPUT=$output_dir"
