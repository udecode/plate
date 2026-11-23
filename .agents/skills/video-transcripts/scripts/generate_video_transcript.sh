#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  generate_video_transcript.sh <video-path-or-url> [--title TITLE] [--frames DIR] [--model MODEL] [--debug-dir DIR]

Writes the video's frames to --frames DIR (default: a new temporary
directory), named by second, prints that directory on stderr, writes
frames-brief.md there and has Gemini 4 Neon transcribe the frames through
agy.

Exits 3 when agy gives no transcript, so the skill's Frames fallback
transcribes the clip from the same brief.

Examples:
  generate_video_transcript.sh "/tmp/bug.mov" --title "Preview link leaves workflow"
  generate_video_transcript.sh "https://uploads.linear.app/.../recording.mov" --title "PDF preview hyperlink exits workflow"
  generate_video_transcript.sh "https://github.com/user-attachments/assets/..." --title "Slash menu loses selection"
  generate_video_transcript.sh "https://app.screencastify.com/watch/..." --title "Bulk send expands filtered recipients"
EOF
}

if [[ "${1:-}" == "" || "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  usage
  exit 0
fi

INPUT="$1"
shift

TITLE=""
FRAMES_DIR=""
MODEL="${VIDEO_TRANSCRIPTS_MODEL:-gemini-4-neon-high}"
TIMEOUT="${VIDEO_TRANSCRIPTS_TIMEOUT:-600}"
DEBUG_DIR=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --title)
      TITLE="${2:-}"
      shift 2
      ;;
    --frames)
      FRAMES_DIR="${2:-}"
      shift 2
      ;;
    --model)
      MODEL="${2:-}"
      shift 2
      ;;
    --debug-dir)
      DEBUG_DIR="${2:-}"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

WORK_DIR="$(mktemp -d "${TMPDIR:-/tmp}/video-transcripts.XXXXXX")"
cleanup() {
  rm -rf "$WORK_DIR"
}
trap cleanup EXIT

if [[ -n "$DEBUG_DIR" ]]; then
  mkdir -p "$DEBUG_DIR"
fi

linear_cookie_header() {
  if [[ -n "${LINEAR_COOKIE_HEADER:-}" ]]; then
    printf '%s\n' "$LINEAR_COOKIE_HEADER"
    return 0
  fi

  local cookie_db="${LINEAR_COOKIES_DB:-$HOME/Library/Application Support/Linear/Cookies}"
  if [[ ! -f "$cookie_db" ]]; then
    return 0
  fi

  python3 - "$cookie_db" <<'PY'
import sqlite3
import sys

cookie_db = sys.argv[1]
try:
    conn = sqlite3.connect(f"file:{cookie_db}?mode=ro", uri=True)
except sqlite3.Error:
    sys.exit(0)

try:
    rows = conn.execute(
        """
        select name, value
        from cookies
        where host_key = '.linear.app'
          and length(value) > 0
        order by name
        """
    ).fetchall()
except sqlite3.Error:
    sys.exit(0)

if rows:
    print("; ".join(f"{name}={value}" for name, value in rows))
PY
}

github_auth_header() {
  if [[ -n "${GITHUB_TOKEN:-}" ]]; then
    printf 'Authorization: Bearer %s\n' "$GITHUB_TOKEN"
    return 0
  fi

  if [[ -n "${GH_TOKEN:-}" ]]; then
    printf 'Authorization: Bearer %s\n' "$GH_TOKEN"
    return 0
  fi

  if command -v gh >/dev/null 2>&1; then
    local token
    token="$(gh auth token 2>/dev/null || true)"
    if [[ -n "$token" ]]; then
      printf 'Authorization: Bearer %s\n' "$token"
      return 0
    fi
  fi
}

download_to_path() {
  local source="$1"
  local dest="$2"
  shift 2

  curl -L --fail --silent --show-error "$@" "$source" -o "$dest"
}

append_query() {
  local url="$1"
  local query="$2"

  if [[ -z "$query" ]]; then
    printf '%s\n' "$url"
  elif [[ "$url" == *"?"* ]]; then
    printf '%s&%s\n' "$url" "$query"
  else
    printf '%s?%s\n' "$url" "$query"
  fi
}

screencastify_recording_id() {
  local source="$1"

  if [[ "$source" =~ screencastify\.com/watch/([^/?#]+) ]]; then
    printf '%s\n' "${BASH_REMATCH[1]}"
    return 0
  fi

  if [[ "$source" =~ screencastify\.com/v/([^/?#]+) ]]; then
    printf '%s\n' "${BASH_REMATCH[1]}"
    return 0
  fi

  return 1
}

rewrite_screencastify_child_playlist() {
  local input_file="$1"
  local output_file="$2"
  local prefix="$3"
  local query="$4"

  python3 - "$input_file" "$output_file" "$prefix" "$query" <<'PY'
import re
import sys

input_file, output_file, prefix, query = sys.argv[1:]
prefix = prefix.rstrip("/") + "/"

def signed(uri: str) -> str:
    if uri.startswith(("data:", "file:")):
        return uri
    if uri.startswith(("http://", "https://")):
        base = uri
    else:
        base = prefix + uri.lstrip("/")
    if not query:
        return base
    separator = "&" if "?" in base else "?"
    return f"{base}{separator}{query}"

with open(input_file, encoding="utf-8") as source:
    lines = source.read().splitlines()

rewritten = []
for line in lines:
    stripped = line.strip()
    if stripped.startswith("#EXT-X-MAP:"):
        rewritten.append(
            re.sub(r'URI="([^"]+)"', lambda match: f'URI="{signed(match.group(1))}"', line)
        )
    elif stripped.startswith("#") or not stripped:
        rewritten.append(line)
    else:
        rewritten.append(signed(stripped))

with open(output_file, "w", encoding="utf-8") as dest:
    dest.write("\n".join(rewritten) + "\n")
PY
}

rewrite_screencastify_master_playlist() {
  local input_file="$1"
  local output_file="$2"
  local child_list_file="$3"

  python3 - "$input_file" "$output_file" "$child_list_file" <<'PY'
import os
import re
import sys

input_file, output_file, child_list_file = sys.argv[1:]
uri_pattern = re.compile(r'URI="([^"]+)"')

with open(input_file, encoding="utf-8") as source:
    lines = source.read().splitlines()

children = []
rewritten = []

def local_child(uri: str) -> str:
    name = os.path.basename(uri.split("?", 1)[0])
    if name and name not in children:
        children.append(uri)
    return name

for line in lines:
    stripped = line.strip()
    if stripped.startswith("#EXT-X-MEDIA:"):
        rewritten.append(
            uri_pattern.sub(lambda match: f'URI="{local_child(match.group(1))}"', line)
        )
    elif stripped.startswith("#") or not stripped:
        rewritten.append(line)
    elif stripped.endswith(".m3u8") or ".m3u8?" in stripped:
        rewritten.append(local_child(stripped))
    else:
        rewritten.append(line)

with open(output_file, "w", encoding="utf-8") as dest:
    dest.write("\n".join(rewritten) + "\n")

with open(child_list_file, "w", encoding="utf-8") as dest:
    for child in children:
        dest.write(child + "\n")
PY
}

download_screencastify_watch() {
  local source="$1"
  local dest="$2"
  local recording_id
  recording_id="$(screencastify_recording_id "$source")"

  if ! command -v jq >/dev/null 2>&1; then
    echo "Screencastify downloads require jq." >&2
    return 1
  fi

  if ! command -v ffmpeg >/dev/null 2>&1; then
    echo "Screencastify downloads require ffmpeg to remux the signed HLS stream." >&2
    return 1
  fi

  local metadata_file="$WORK_DIR/screencastify.json"
  download_to_path "https://umbrella.svc.screencastify.com/api/umbrellaService/watch/$recording_id" "$metadata_file"

  local hls_url auth_query prefix
  hls_url="$(jq -r '.manifest.hlsUrl // empty' "$metadata_file")"
  auth_query="$(jq -r '.manifest.auth.query // empty' "$metadata_file")"
  prefix="$(jq -r '.manifest.auth.prefix // empty' "$metadata_file")"

  if [[ -z "$hls_url" ]]; then
    echo "Screencastify watch metadata did not include an HLS manifest URL." >&2
    return 1
  fi

  if [[ -z "$prefix" ]]; then
    prefix="${hls_url%/*}/"
  fi

  local hls_dir="$WORK_DIR/screencastify-hls"
  mkdir -p "$hls_dir"

  local remote_master="$hls_dir/master.remote.m3u8"
  local local_master="$hls_dir/master.m3u8"
  local child_list="$hls_dir/children.txt"
  download_to_path "$(append_query "$hls_url" "$auth_query")" "$remote_master"
  rewrite_screencastify_master_playlist "$remote_master" "$local_master" "$child_list"

  while IFS= read -r child_uri; do
    [[ -z "$child_uri" ]] && continue

    local child_name child_remote child_local child_url
    child_name="$(basename "${child_uri%%\?*}")"
    child_remote="$hls_dir/$child_name.remote"
    child_local="$hls_dir/$child_name"

    if [[ "$child_uri" =~ ^https?:// ]]; then
      child_url="$(append_query "$child_uri" "$auth_query")"
    else
      child_url="$(append_query "$prefix$child_uri" "$auth_query")"
    fi

    download_to_path "$child_url" "$child_remote"
    rewrite_screencastify_child_playlist "$child_remote" "$child_local" "$prefix" "$auth_query"
  done < "$child_list"

  ffmpeg -hide_banner -loglevel error -y \
    -protocol_whitelist file,http,https,tcp,tls,crypto \
    -allowed_extensions ALL \
    -i "$local_master" \
    -map 0:v:0 -map 0:a:0? \
    -c copy "$dest"

  if [[ -n "$DEBUG_DIR" ]]; then
    cp "$metadata_file" "$DEBUG_DIR/screencastify.json"
    cp -R "$hls_dir" "$DEBUG_DIR/screencastify-hls"
  fi
}

download_input_if_needed() {
  local source="$1"
  if [[ "$source" =~ ^https?:// ]]; then
    local ext
    ext="$(basename "${source%%\?*}")"
    ext="${ext##*.}"
    [[ "$ext" == "$source" ]] && ext="bin"
    local dest="$WORK_DIR/input.$ext"

    if screencastify_recording_id "$source" >/dev/null; then
      dest="$WORK_DIR/input.mp4"
      download_screencastify_watch "$source" "$dest"
    elif [[ "$source" == *"uploads.linear.app"* ]]; then
      local cookie_header
      cookie_header="$(linear_cookie_header)"
      if [[ -n "$cookie_header" ]]; then
        download_to_path "$source" "$dest" -H "Cookie: $cookie_header"
      else
        download_to_path "$source" "$dest" || {
          echo "Failed to download Linear upload. Set LINEAR_COOKIE_HEADER or LINEAR_COOKIES_DB, or open the Linear desktop app so the helper can reuse its session cookies." >&2
          return 1
        }
      fi
    elif [[ "$source" == *"github.com/user-attachments/"* || "$source" == *"private-user-images.githubusercontent.com"* || "$source" == *"private-attachments.githubusercontent.com"* || "$source" == *"media.githubusercontent.com/media/attachments/"* ]]; then
      local auth_header
      auth_header="$(github_auth_header || true)"
      if [[ -n "$auth_header" ]]; then
        download_to_path "$source" "$dest" -H "$auth_header" || download_to_path "$source" "$dest"
      else
        download_to_path "$source" "$dest" || {
          echo "Failed to download GitHub attachment. Set GITHUB_TOKEN or GH_TOKEN, or run gh auth login so the helper can reuse GitHub auth." >&2
          return 1
        }
      fi
    else
      download_to_path "$source" "$dest"
    fi
    printf '%s\n' "$dest"
  else
    printf '%s\n' "$source"
  fi
}

escape_xml_attr() {
  local value="$1"
  value="${value//&/&amp;}"
  value="${value//\"/&quot;}"
  value="${value//</&lt;}"
  value="${value//>/&gt;}"
  printf '%s' "$value"
}

transcript_shape() {
  printf '<video-transcripts>\n<video-transcript title="%s">\n[00:00] (Sentence.)\n</video-transcript>\n</video-transcripts>' "$1"
}

transcript_rules() {
  cat <<'EOF'
Rules:
- Use [MM:SS] timestamps.
- One line per visible action, UI transition, or audible spoken event if present.
- Quote visible UI text when legible.
- Describe only visible behavior and clearly observable system responses.
- Do not invent hidden state, motives, or implementation details.
- Prefer concise, high-signal transcript lines over per-keystroke typing spam.
- Collapse active typing into the final stable text for that field unless intermediate edits are themselves the bug.
- Do not output multiple partial strings for the same text field while the user is still typing.
- Avoid repetitive scrolling lines unless a scroll directly reveals the bug.
- For a 2 to 5 minute product video, target roughly 15 to 35 transcript lines.
- Keep the transcript useful for bug triage and QA reproduction.
EOF
}

write_frames_brief() {
  {
    printf '# Transcribe "%s" from its frames\n\n' "$TITLE"
    printf 'Transcribe this recording from the frames in %s. Read only that folder.\n\n' "$FRAMES_DIR"
    printf -- '- `frames/tSSSS.png` is the frame at second SSSS, so `[00:12]` is `t0012.png`.\n'
    printf -- '- `sheet-SSSS-SSSS.png` shows the nine seconds its name spans in one image.\n'
    if [[ -n "$RECORDING" ]]; then
      printf -- '- `%s` is the recording with its sound. Open it only to transcribe speech, and take every on-screen fact from the frames. When your file reading tool cannot play its sound, leave speech out.\n\n' "$(basename "$RECORDING")"
    else
      printf -- '- The recording has no sound.\n\n'
    fi
    printf '1. Open every sheet.\n'
    printf '2. Open the full frame wherever a sheet is too small to read, such as bold, italic or struck-through text, a caret, a selection, a popup or a candidate window. Judge text formatting only from a full frame.\n'
    printf '3. Write the transcript.\n\n'
    transcript_rules
    printf '\nReturn only this XML, with no Markdown fences:\n\n'
    transcript_shape "$(escape_xml_attr "$TITLE")"
    printf '\n'
  } > "$BRIEF"
}

normalize_output() {
  local raw="$1"
  raw="$(printf '%s\n' "$raw" | sed -e '1{/^```[a-zA-Z0-9_-]*$/d;}' -e '${/^```$/d;}')"
  raw="$(
    printf '%s\n' "$raw" | awk '
      /^\[[0-9][0-9]:[0-9][0-9]\] / {
        prefix = substr($0, 1, 7)
        rest = substr($0, 9)
        if (rest !~ /^\(.*\)$/) {
          $0 = prefix " (" rest ")"
        }
      }
      { print }
    '
  )"

  if grep -q '<video-transcripts>' <<<"$raw"; then
    printf '%s\n' "$raw"
    return 0
  fi

  if grep -q '<video-transcript ' <<<"$raw"; then
    printf '<video-transcripts>\n%s\n</video-transcripts>\n' "$raw"
    return 0
  fi

  return 1
}

count_timestamps() {
  local text="$1"
  grep -c '^\[[0-9][0-9]:[0-9][0-9]\]' <<<"$text" || true
}

has_repeated_lines() {
  awk '
    /^\[[0-9][0-9]:[0-9][0-9]\]/ {
      without_quoted_text = tolower(substr($0, 8))
      gsub(/"[^"]*"/, "\"\"", without_quoted_text)
      gsub(/[^a-z"]+/, " ", without_quoted_text)
      count[without_quoted_text]++
      total++
    }

    END {
      for (line in count) {
        if (count[line] > most) {
          most = count[line]
        }
        repeats += count[line] - 1
      }
      exit (most >= 5 && repeats * 2 >= total) ? 0 : 1
    }
  ' <<<"$1"
}

agy_answer() {
  jq -rnR '[inputs | fromjson? | select(.event == "result")] | last | .result.response // empty' "$1"
}

# agy ends a print run with no answer when it reaches a permission it would ask
# for, so the settings deny each action the transcriber must not take, and the
# prompt keeps every shell command in agy's sandbox.
transcribe_with_agy() {
  local scratch frames settings prompt answer normalized timestamp_count pid watchdog
  local events="$WORK_DIR/agy.jsonl"
  local status=0

  if ! command -v agy >/dev/null 2>&1; then
    echo "agy is not installed." >&2
    return 1
  fi

  scratch="$(mktemp -d "$WORK_DIR/agy.XXXXXX")"
  scratch="$(cd "$scratch" && pwd -P)"
  frames="$(cd "$FRAMES_DIR" && pwd -P)"
  settings="$(jq -nc --arg scratch "$scratch" --arg frames "$frames" '{
    agentMode: "",
    toolPermission: "proceed-in-sandbox",
    permissions: {
      allow: ["read_file(*)", "write_file(\($scratch))"],
      deny: ["write_file(\($frames))", "execute_url(*)", "read_url(*)", "mcp(*)"]
    }
  }')"
  prompt="Your working directory is a scratch folder. Run every shell command inside agy's sandbox, because a request to leave it ends your run with no answer. Put your whole answer in your final message.

$(cat "$BRIEF")"

  (cd "$scratch" && exec agy -p "$prompt" --model "$MODEL" --settings "$settings" --sandbox --output-format stream-json) \
    < /dev/null > "$events" 2> "$WORK_DIR/agy.stderr" &
  pid=$!
  (sleep "$TIMEOUT" && kill "$pid") 2>/dev/null &
  watchdog=$!
  wait "$pid" || status=$?
  pkill -P "$watchdog" 2>/dev/null || true

  if [[ -n "$DEBUG_DIR" ]]; then
    printf '%s\n' "$prompt" > "$DEBUG_DIR/agy.prompt.md"
    cp "$events" "$DEBUG_DIR/agy.jsonl"
    cp "$WORK_DIR/agy.stderr" "$DEBUG_DIR/agy.stderr"
  fi

  answer="$(agy_answer "$events")"
  if [[ -z "$answer" ]]; then
    local why="exit $status"
    (( status >= 128 )) && why="stopped after $TIMEOUT s"
    echo "agy gave no answer ($why): $(grep -m 1 -i 'error' "$WORK_DIR/agy.stderr" || tail -n 3 "$WORK_DIR/agy.stderr")" >&2
    return 1
  fi
  if [[ "$answer" == "This request was blocked by Gemini's filters"* ]]; then
    echo "Gemini's filters blocked the transcript." >&2
    return 1
  fi
  if ! normalized="$(normalize_output "$answer")"; then
    echo "agy's answer held no transcript XML." >&2
    return 1
  fi
  timestamp_count="$(count_timestamps "$normalized")"
  if (( timestamp_count < MIN_LINES )); then
    echo "Transcript from $MODEL looked too thin ($timestamp_count timestamp lines)." >&2
    return 1
  fi
  if has_repeated_lines "$normalized"; then
    echo "Transcript from $MODEL repeats the same line." >&2
    return 1
  fi
  printf '%s\n' "$normalized"
}

VIDEO_PATH="$(download_input_if_needed "$INPUT")"
if [[ ! -f "$VIDEO_PATH" ]]; then
  echo "Video not found: $VIDEO_PATH" >&2
  exit 1
fi

if [[ -z "$FRAMES_DIR" ]]; then
  FRAMES_DIR="$(mktemp -d "${TMPDIR:-/tmp}/video-frames.XXXXXX")"
fi
bash "$(dirname "${BASH_SOURCE[0]}")/video_frames.sh" "$VIDEO_PATH" --output "$FRAMES_DIR" >/dev/null
echo "Frames: $FRAMES_DIR (frames/t0012.png is 00:12; sheet-SSSS-SSSS.png shows nine seconds)" >&2

seconds="$(find "$FRAMES_DIR/frames" -name 't*.png' | wc -l | tr -d ' ')"
one_line_per_five_seconds=$(( (seconds + 4) / 5 ))
MIN_LINES=$(( one_line_per_five_seconds < 5 ? one_line_per_five_seconds : 5 ))

if [[ -z "$TITLE" ]]; then
  TITLE="$(basename "$VIDEO_PATH")"
  TITLE="${TITLE%.*}"
fi

# The frames carry no sound, so a sound track goes beside them as a WAV file:
# agy plays WAV and MP3 but heard nothing in an M4A, and every ffmpeg build
# writes WAV. A WAV keeps no start time, so silence fills the time before a
# sound track that starts late, which keeps speech on the video's clock.
RECORDING=""
if [[ -n "$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$VIDEO_PATH")" ]]; then
  if ffmpeg -hide_banner -loglevel error -y -i "$VIDEO_PATH" -map 0:a:0 -af aresample=async=1:first_pts=0 -ac 1 -ar 16000 "$FRAMES_DIR/speech.wav"; then
    RECORDING="$FRAMES_DIR/speech.wav"
  else
    echo "Could not extract the sound track, so the transcript leaves speech out." >&2
  fi
fi

BRIEF="$FRAMES_DIR/frames-brief.md"
write_frames_brief

if transcript="$(transcribe_with_agy)"; then
  printf '%s\n' "$transcript"
  exit 0
fi

echo "agy gave no transcript. Transcribe from frames with $BRIEF, as the skill's Frames fallback says." >&2
exit 3
