#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  generate_video_transcript.sh <video-path-or-url> [--title TITLE] [--model MODEL] [--fallback-model MODEL] [--debug-dir DIR]

Examples:
  generate_video_transcript.sh "/tmp/bug.mov" --title "Preview link leaves workflow"
  generate_video_transcript.sh "https://uploads.linear.app/.../recording.mov" --title "PDF preview hyperlink exits workflow"
  generate_video_transcript.sh "https://github.com/user-attachments/assets/..." --title "Slash menu loses selection"
EOF
}

if [[ "${1:-}" == "" || "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  usage
  exit 0
fi

INPUT="$1"
shift

TITLE=""
MODEL="${VIDEO_TRANSCRIPTS_MODEL:-gemini-3.1-flash-lite-preview}"
FALLBACK_MODEL="${VIDEO_TRANSCRIPTS_FALLBACK_MODEL:-gemini-3-flash-preview}"
DEBUG_DIR=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --title)
      TITLE="${2:-}"
      shift 2
      ;;
    --model)
      MODEL="${2:-}"
      shift 2
      ;;
    --fallback-model)
      FALLBACK_MODEL="${2:-}"
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

if [[ -z "${GEMINI_API_KEY:-}" && -z "${GOOGLE_API_KEY:-}" && -f "$HOME/.bash_profile" ]]; then
  # shellcheck disable=SC1090
  source "$HOME/.bash_profile"
fi

API_KEY="${GEMINI_API_KEY:-${GOOGLE_API_KEY:-}}"
if [[ -z "$API_KEY" ]]; then
  echo "Missing GEMINI_API_KEY or GOOGLE_API_KEY." >&2
  exit 1
fi

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

download_input_if_needed() {
  local source="$1"
  if [[ "$source" =~ ^https?:// ]]; then
    local ext
    ext="$(basename "${source%%\?*}")"
    ext="${ext##*.}"
    [[ "$ext" == "$source" ]] && ext="bin"
    local dest="$WORK_DIR/input.$ext"

    if [[ "$source" == *"uploads.linear.app"* ]]; then
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

generation_config_json() {
  local model_name="$1"

  if [[ "$model_name" == gemini-3* ]]; then
    cat <<'EOF'
{
  "temperature": 0,
  "maxOutputTokens": 2400,
  "thinkingConfig": {
    "thinkingLevel": "minimal"
  }
}
EOF
    return 0
  fi

  if [[ "$model_name" == gemini-2.5-flash* ]]; then
    cat <<'EOF'
{
  "temperature": 0,
  "maxOutputTokens": 2400,
  "thinkingConfig": {
    "thinkingBudget": 0
  }
}
EOF
    return 0
  fi

  cat <<'EOF'
{
  "temperature": 0,
  "maxOutputTokens": 2400
}
EOF
}

has_noisy_runs() {
  local text="$1"
  awk '
    function classify(line) {
      lower = tolower(line)
      if (lower ~ /broadcast title field|broadcast title input field/) {
        return "broadcast_title"
      }
      if (lower ~ /message text area|message field| into the message| to the message/) {
        return "message"
      }
      if (lower ~ /scrolls|scrolling/) {
        return "scroll"
      }
      return ""
    }

    function noisy(line) {
      lower = tolower(line)
      return lower ~ /types|typing|continues typing|finishes typing|adds|enters|scrolls|scrolling/
    }

    /^\[[0-9][0-9]:[0-9][0-9]\]/ {
      target = classify($0)
      is_noisy = noisy($0)

      if (target != "" && is_noisy && target == prev_target && prev_noisy == 1) {
        run_len++
      } else if (target != "" && is_noisy) {
        run_len = 1
      } else {
        run_len = 0
      }

      limit = 0
      if (target == "broadcast_title") {
        limit = 2
      } else if (target == "message") {
        limit = 3
      } else if (target == "scroll") {
        limit = 2
      }

      if (limit > 0 && run_len > limit) {
        noisy_found = 1
      }

      prev_target = target
      prev_noisy = is_noisy
    }

    END {
      exit noisy_found ? 0 : 1
    }
  ' <<<"$text"
}

call_model() {
  local model_name="$1"
  local video_path="$2"
  local title_value="$3"
  local prefix="$4"

  local mime_type
  mime_type="$(file -b --mime-type "$video_path")"
  local num_bytes
  num_bytes="$(wc -c < "$video_path" | tr -d ' ')"
  local display_name
  display_name="$(basename "$video_path")"
  local safe_title
  safe_title="$(escape_xml_attr "$title_value")"
  local header_file="$WORK_DIR/${prefix}.upload-header.tmp"
  local file_info="$WORK_DIR/${prefix}.file_info.json"
  local get_file="$WORK_DIR/${prefix}.file_get.json"
  local request_file="$WORK_DIR/${prefix}.request.json"
  local response_file="$WORK_DIR/${prefix}.response.json"
  local generation_config
  generation_config="$(generation_config_json "$model_name")"

  curl -s "https://generativelanguage.googleapis.com/upload/v1beta/files?key=$API_KEY" \
    -D "$header_file" \
    -H "X-Goog-Upload-Protocol: resumable" \
    -H "X-Goog-Upload-Command: start" \
    -H "X-Goog-Upload-Header-Content-Length: $num_bytes" \
    -H "X-Goog-Upload-Header-Content-Type: $mime_type" \
    -H "Content-Type: application/json" \
    -d "{\"file\":{\"display_name\":\"$display_name\"}}" >/dev/null

  local upload_url
  upload_url="$(awk -F': ' 'tolower($1)=="x-goog-upload-url" {gsub("\r", "", $2); print $2}' "$header_file")"
  if [[ -z "$upload_url" ]]; then
    echo "Failed to get resumable upload URL for $model_name." >&2
    return 1
  fi

  curl -s "$upload_url" \
    -H "Content-Length: $num_bytes" \
    -H "X-Goog-Upload-Offset: 0" \
    -H "X-Goog-Upload-Command: upload, finalize" \
    --data-binary @"$video_path" > "$file_info"

  local file_name
  file_name="$(jq -r '.file.name // empty' "$file_info")"
  local file_uri
  file_uri="$(jq -r '.file.uri // empty' "$file_info")"
  if [[ -z "$file_name" || -z "$file_uri" ]]; then
    echo "Upload failed for $model_name." >&2
    return 1
  fi

  local state=""
  for _ in $(seq 1 60); do
    curl -s "https://generativelanguage.googleapis.com/v1beta/$file_name?key=$API_KEY" > "$get_file"
    state="$(jq -r '.state // empty' "$get_file")"
    if [[ "$state" == "ACTIVE" ]]; then
      break
    fi
    if [[ "$state" == "FAILED" ]]; then
      echo "Video processing failed for $model_name." >&2
      return 1
    fi
    sleep 2
  done

  if [[ "$state" != "ACTIVE" ]]; then
    echo "Timed out waiting for video processing for $model_name." >&2
    return 1
  fi

  cat > "$request_file" <<EOF
{
  "generationConfig": $generation_config,
  "contents": [{
    "parts": [
      {
        "file_data": {
          "mime_type": "$mime_type",
          "file_uri": "$file_uri"
        }
      },
      {
        "text": "Analyze this video and return exactly one XML transcript block for the supplied title. Output only XML with no Markdown code fences. Use this exact shape:\n<video-transcripts>\n<video-transcript title=\"$safe_title\">\n[00:00] (Sentence.)\n</video-transcript>\n</video-transcripts>\n\nRules:\n- Use [MM:SS] timestamps.\n- One line per visible action, UI transition, or audible spoken event if present.\n- Quote visible UI text when legible.\n- Describe only visible behavior and clearly observable system responses.\n- Do not invent hidden state, motives, or implementation details.\n- Prefer concise, high-signal transcript lines over per-keystroke typing spam.\n- Collapse active typing into the final stable text for that field unless intermediate edits are themselves the bug.\n- Do not output multiple partial strings for the same text field while the user is still typing.\n- Avoid repetitive scrolling lines unless a scroll directly reveals the bug.\n- For a 2 to 5 minute product video, target roughly 15 to 35 transcript lines.\n- Keep the transcript useful for bug triage and QA reproduction."
      }
    ]
  }]
}
EOF

  curl -s "https://generativelanguage.googleapis.com/v1beta/models/$model_name:generateContent?key=$API_KEY" \
    -H "Content-Type: application/json" \
    -X POST \
    --data @"$request_file" > "$response_file"

  if jq -e '.error' "$response_file" >/dev/null; then
    jq -r '.error.message' "$response_file" >&2
    return 1
  fi

  LAST_FINISH_REASON="$(jq -r '.candidates[0].finishReason // empty' "$response_file")"
  LAST_THOUGHTS_TOKEN_COUNT="$(jq -r '.usageMetadata.thoughtsTokenCount // 0' "$response_file")"
  LAST_CANDIDATES_TOKEN_COUNT="$(jq -r '.usageMetadata.candidatesTokenCount // 0' "$response_file")"

  if [[ -n "$DEBUG_DIR" ]]; then
    cp "$file_info" "$DEBUG_DIR/${prefix}.file_info.json"
    cp "$get_file" "$DEBUG_DIR/${prefix}.file_get.json"
    cp "$request_file" "$DEBUG_DIR/${prefix}.request.json"
    cp "$response_file" "$DEBUG_DIR/${prefix}.response.json"
  fi

  jq -r '.candidates[0].content.parts[]?.text // empty' "$response_file"
}

VIDEO_PATH="$(download_input_if_needed "$INPUT")"
if [[ ! -f "$VIDEO_PATH" ]]; then
  echo "Video not found: $VIDEO_PATH" >&2
  exit 1
fi

if [[ -z "$TITLE" ]]; then
  TITLE="$(basename "$VIDEO_PATH")"
  TITLE="${TITLE%.*}"
fi

run_and_validate() {
  local model_name="$1"
  local prefix="$2"
  local raw normalized timestamp_count

  raw="$(call_model "$model_name" "$VIDEO_PATH" "$TITLE" "$prefix")"
  if [[ "${LAST_FINISH_REASON:-}" != "STOP" && "${LAST_FINISH_REASON:-}" != "" ]]; then
    echo "Transcript from $model_name ended with finish reason ${LAST_FINISH_REASON}." >&2
    return 1
  fi
  normalized="$(normalize_output "$raw")" || return 1
  timestamp_count="$(count_timestamps "$normalized")"
  if (( timestamp_count < 5 )); then
    echo "Transcript from $model_name looked too thin ($timestamp_count timestamp lines)." >&2
    return 1
  fi
  if has_noisy_runs "$normalized"; then
    echo "Transcript from $model_name looked noisy and repetitive." >&2
    return 1
  fi
  printf '%s\n' "$normalized"
}

if transcript="$(run_and_validate "$MODEL" "primary")"; then
  printf '%s\n' "$transcript"
  exit 0
fi

if [[ "$FALLBACK_MODEL" != "$MODEL" ]]; then
  echo "Retrying with fallback model: $FALLBACK_MODEL" >&2
  transcript="$(run_and_validate "$FALLBACK_MODEL" "fallback")"
  printf '%s\n' "$transcript"
  exit 0
fi

echo "Failed to generate a valid transcript." >&2
exit 1
