#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: publish-issue.sh --repo udecode/plate --title-file FILE --body-file FILE [--video FILE --video-role ROLE]... [--labels a,b] [--allow-public-video] (--dry-run | --confirm-create)"
}

repo=""
title_file=""
body_file=""
video_paths=()
video_roles=()
video_count=0
video_role_count=0
labels=""
mode=""
allow_public_video=false
while (($#)); do
  case "$1" in
    --repo) repo=${2:-}; shift 2 ;;
    --title-file) title_file=${2:-}; shift 2 ;;
    --body-file) body_file=${2:-}; shift 2 ;;
    --video) video_paths[$video_count]="${2:-}"; video_count=$((video_count + 1)); shift 2 ;;
    --video-role) video_roles[$video_role_count]="${2:-}"; video_role_count=$((video_role_count + 1)); shift 2 ;;
    --labels) labels=${2:-}; shift 2 ;;
    --allow-public-video) allow_public_video=true; shift ;;
    --dry-run) mode=dry-run; shift ;;
    --confirm-create) mode=create; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage >&2; exit 2 ;;
  esac
done

[[ "$repo" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]] || { echo "Invalid --repo" >&2; exit 2; }
[[ "$repo" == "udecode/plate" ]] || { echo "This skill only publishes Plate next/Beta issues to udecode/plate" >&2; exit 2; }
[[ -f "$title_file" && -s "$title_file" ]] || { echo "Missing non-empty --title-file" >&2; exit 2; }
[[ -f "$body_file" && -s "$body_file" ]] || { echo "Missing non-empty --body-file" >&2; exit 2; }
[[ "$mode" == dry-run || "$mode" == create ]] || { echo "Choose --dry-run or --confirm-create" >&2; exit 2; }
if ((video_role_count > 0 && video_role_count != video_count)); then
  echo "Provide exactly one --video-role for each --video, or omit all roles" >&2
  exit 2
fi
for ((video_index = 0; video_index < video_count; video_index++)); do
  video_path=${video_paths[$video_index]}
  [[ -s "$video_path" ]] || { echo "Video is missing or empty: $video_path" >&2; exit 2; }
done
for ((video_index = 0; video_index < video_role_count; video_index++)); do
  video_role=${video_roles[$video_index]}
  [[ -n "$video_role" && "$video_role" != *$'\n'* ]] || { echo "Video roles must be non-empty single lines" >&2; exit 2; }
done
command -v jq >/dev/null || { echo "Missing command: jq" >&2; exit 3; }

title=$(tr '\n' ' ' <"$title_file" | sed -E 's/[[:space:]]+/ /g; s/^ //; s/ $//')
[[ -n "$title" ]] || { echo "Title is empty" >&2; exit 2; }
[[ "$title" == "[Beta]: "* ]] || { echo "Title must start with [Beta]: " >&2; exit 2; }
if grep -Eiq 'TODO|TBD|<one sentence|<setup>|<action>|<failure trigger>|<expected behavior|<observed behavior|<verified value|<public-url>|<timestamp note>|<inference' "$title_file" "$body_file"; then
  echo "Title or body contains unresolved template placeholders" >&2
  exit 2
fi

work_dir=$(mktemp -d "${TMPDIR:-/tmp}/github-issue-reporter.XXXXXX")
attempted_public_urls=()
issue_created=false
cleanup() {
  status=$?
  trap - EXIT INT TERM
  if ((status != 0)) && [[ "$mode" == create && "$issue_created" != true ]]; then
    for public_url in "${attempted_public_urls[@]}"; do
      echo "Issue was not created; public upload may be orphaned: $public_url" >&2
    done
  fi
  rm -rf "$work_dir"
  exit "$status"
}
trap cleanup EXIT INT TERM

remote=${ISSUE_VIDEO_REMOTE:-}
public_base=${ISSUE_VIDEO_PUBLIC_BASE_URL:-}
presigned_put_url=${ISSUE_VIDEO_PRESIGNED_PUT_URL:-}
presigned_public_url=${ISSUE_VIDEO_PUBLIC_URL:-}
public_urls=()
remote_targets=()
upload_backends=()
content_types=()
local_sizes=()

if ((video_count > 0)); then
  command -v ffprobe >/dev/null || { echo "Missing command: ffprobe" >&2; exit 3; }

  if [[ -n "$presigned_put_url" || -n "$presigned_public_url" ]]; then
    [[ "$video_count" == 1 ]] || {
      echo "Single-use presigned upload supports one video; use ISSUE_VIDEO_REMOTE for multiple videos" >&2
      exit 4
    }
    [[ "$presigned_put_url" =~ ^https:// ]] || { echo "ISSUE_VIDEO_PRESIGNED_PUT_URL must be HTTPS" >&2; exit 4; }
    [[ "$presigned_put_url" != *$'\n'* && "$presigned_put_url" != *'"'* ]] || { echo "Presigned PUT URL contains unsupported characters" >&2; exit 4; }
    [[ "$presigned_public_url" =~ ^https:// ]] || { echo "ISSUE_VIDEO_PUBLIC_URL must be HTTPS" >&2; exit 4; }
  else
    [[ -n "$remote" ]] || { echo "Set ISSUE_VIDEO_REMOTE or ISSUE_VIDEO_PRESIGNED_PUT_URL for video upload" >&2; exit 4; }
    [[ "$public_base" =~ ^https:// ]] || { echo "Set ISSUE_VIDEO_PUBLIC_BASE_URL to an HTTPS base URL" >&2; exit 4; }
    command -v od >/dev/null || { echo "Missing command: od" >&2; exit 3; }
    upload_nonce=$(od -An -N16 -tx1 /dev/urandom | tr -d '[:space:]')
    [[ "$upload_nonce" =~ ^[0-9a-f]{32}$ ]] || { echo "Could not generate a collision-resistant upload ID" >&2; exit 3; }
  fi

  for ((video_index = 0; video_index < video_count; video_index++)); do
    video_path=${video_paths[$video_index]}
    duration=$(ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 "$video_path")
    awk -v duration="$duration" 'BEGIN { exit !(duration > 0) }' || { echo "Video has no positive duration: $video_path" >&2; exit 2; }

    case "${video_path##*.}" in
      mp4|MP4) content_type=video/mp4 ;;
      webm|WEBM) content_type=video/webm ;;
      mov|MOV) content_type=video/quicktime ;;
      *) content_type=application/octet-stream ;;
    esac

    if [[ -n "$presigned_put_url" ]]; then
      upload_backend=presigned-put
      remote_target=presigned-put:redacted
      public_url=$presigned_public_url
    else
      upload_backend=rclone
      original_name=$(basename "$video_path")
      safe_name=$(printf '%s' "$original_name" | sed -E 's/[^A-Za-z0-9._-]+/-/g')
      object_name="$(date -u +%Y%m%dT%H%M%SZ)-$upload_nonce-$((video_index + 1))-$safe_name"
      remote_target="${remote%/}/$object_name"
      public_url="${public_base%/}/$object_name"
    fi

    upload_backends+=("$upload_backend")
    remote_targets+=("$remote_target")
    public_urls+=("$public_url")
    content_types+=("$content_type")
    local_sizes+=("$(wc -c <"$video_path" | tr -d ' ')")
  done
fi

final_body="$work_dir/body.md"
cp "$body_file" "$final_body"
if ((video_count > 0)); then
  printf '\n\n## Video evidence\n' >>"$final_body"
  for ((video_index = 0; video_index < video_count; video_index++)); do
    if ((video_role_count > 0)); then
      video_role=${video_roles[$video_index]}
    else
      video_role="reproduction video $((video_index + 1))"
    fi
    safe_role=$(printf '%s' "$video_role" | sed 's/[][]/\\&/g')
    printf '\n[%s](%s)\n' "$safe_role" "${public_urls[$video_index]}" >>"$final_body"
  done
fi

payload="$work_dir/payload.json"
if [[ -n "$labels" ]]; then
  jq -n --arg title "$title" --rawfile body "$final_body" --arg labels "$labels"     '{title:$title,body:$body,labels:($labels|split(",")|map(gsub("^\\s+|\\s+$";""))|map(select(length>0)))}' >"$payload"
else
  jq -n --arg title "$title" --rawfile body "$final_body" '{title:$title,body:$body}' >"$payload"
fi

uploads_jsonl="$work_dir/uploads.jsonl"
: >"$uploads_jsonl"
for ((video_index = 0; video_index < video_count; video_index++)); do
  jq -n     --arg backend "${upload_backends[$video_index]}"     --arg uploadTarget "${remote_targets[$video_index]}"     --arg publicUrl "${public_urls[$video_index]}"     --arg contentType "${content_types[$video_index]}"     --arg source "${video_paths[$video_index]}"     '{backend:$backend,uploadTarget:$uploadTarget,publicUrl:$publicUrl,contentType:$contentType,source:$source}'     >>"$uploads_jsonl"
done
uploads="$work_dir/uploads.json"
jq -s . "$uploads_jsonl" >"$uploads"

if [[ "$mode" == dry-run ]]; then
  jq --arg repo "$repo" --slurpfile uploads "$uploads"     '{repo:$repo,uploads:$uploads[0],issuePayload:.}' "$payload"
  exit 0
fi

for command_name in gh curl; do
  command -v "$command_name" >/dev/null || { echo "Missing command: $command_name" >&2; exit 3; }
done
gh auth status >/dev/null
repo_metadata="$work_dir/repository.json"
gh api "repos/$repo" >"$repo_metadata"
if ((video_count > 0)) && [[ $(jq -r '.private' "$repo_metadata") == true && "$allow_public_video" != true ]]; then
  echo "Refusing public video upload for a private repository without --allow-public-video" >&2
  exit 4
fi

for ((video_index = 0; video_index < video_count; video_index++)); do
  video_path=${video_paths[$video_index]}
  upload_backend=${upload_backends[$video_index]}
  remote_target=${remote_targets[$video_index]}
  public_url=${public_urls[$video_index]}
  content_type=${content_types[$video_index]}
  local_size=${local_sizes[$video_index]}
  attempted_public_urls+=("$public_url")

  if [[ "$upload_backend" == rclone ]]; then
    command -v rclone >/dev/null || { echo "Missing command: rclone" >&2; exit 3; }
    rclone copyto "$video_path" "$remote_target" --progress
    remote_size=$(rclone size "$remote_target" --json | jq -r '.bytes')
    [[ "$remote_size" == "$local_size" ]] || {
      echo "Upload size mismatch: local=$local_size remote=$remote_size" >&2
      exit 5
    }
  else
    curl_config="$work_dir/presigned-curl-$video_index.conf"
    printf 'url = "%s"\n' "$presigned_put_url" >"$curl_config"
    chmod 600 "$curl_config"
    curl -fsS --config "$curl_config" -X PUT -H "Content-Type: $content_type" --upload-file "$video_path" -o /dev/null || {
      echo "Presigned video upload failed" >&2
      exit 5
    }
  fi

  public_copy="$work_dir/public-$video_index"
  if ! public_type=$(curl -fsSL -w '%{content_type}' "$public_url" -o "$public_copy"); then
    echo "Public URL verification failed: $public_url" >&2
    exit 5
  fi
  public_size=$(wc -c <"$public_copy" | tr -d ' ')
  [[ "$public_size" == "$local_size" ]] || {
    echo "Public media size mismatch: local=$local_size public=$public_size url=$public_url" >&2
    exit 5
  }
  public_type=$(printf '%s' "$public_type" | tr '[:upper:]' '[:lower:]')
  expected_type=$(printf '%s' "$content_type" | tr '[:upper:]' '[:lower:]')
  [[ "$public_type" == "$expected_type" || "$public_type" == "$expected_type;"* ]] || {
    echo "Public media MIME mismatch: expected=$content_type actual=$public_type url=$public_url" >&2
    exit 5
  }
done

created="$work_dir/created.json"
if ! gh api --method POST "repos/$repo/issues" --input "$payload" >"$created"; then
  exit 6
fi
issue_created=true
issue_number=$(jq -r '.number' "$created")
issue_url=$(jq -r '.html_url' "$created")
post_create_verification_failed() {
  echo "Issue created but post-create verification failed: $issue_url ($1)" >&2
  exit 7
}
[[ "$issue_number" =~ ^[0-9]+$ && "$issue_url" =~ ^https://github.com/ ]] || {
  echo "Issue POST succeeded but the response did not contain a verifiable issue URL; do not retry blindly" >&2
  exit 7
}
verified="$work_dir/verified.json"
if ! gh api "repos/$repo/issues/$issue_number" >"$verified"; then
  post_create_verification_failed "readback request failed"
fi
if ! jq -e --arg title "$title" '.title == $title' "$verified" >/dev/null; then
  post_create_verification_failed "title mismatch"
fi
if [[ -n "$labels" ]]; then
  IFS=',' read -r -a label_items <<<"$labels"
  for label in "${label_items[@]}"; do
    label=$(printf '%s' "$label" | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')
    [[ -z "$label" ]] && continue
    if ! jq -e --arg label "$label" 'any(.labels[]; .name == $label)' "$verified" >/dev/null; then
      post_create_verification_failed "missing label: $label"
    fi
  done
fi
for ((video_index = 0; video_index < video_count; video_index++)); do
  public_url=${public_urls[$video_index]}
  if ! jq -e --arg url "$public_url" '.body | contains($url)' "$verified" >/dev/null; then
    post_create_verification_failed "missing video URL: $public_url"
  fi
done

jq -n --arg issueUrl "$issue_url" --slurpfile uploads "$uploads"   '{issueUrl:$issueUrl,videoUrls:($uploads[0]|map(.publicUrl)),verified:true}'
