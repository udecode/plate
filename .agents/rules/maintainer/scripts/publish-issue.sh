#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: publish-issue.sh --repo udecode/plate-private (--title-file FILE | --comment-on NUMBER) --body-file FILE [--attach FILE --attach-role ROLE]... [--labels a,b] [--platform a,b] (--dry-run | --confirm-create)"
}

repo=""
title_file=""
comment_on=""
body_file=""
attach_paths=()
attach_roles=()
labels=""
platform=""
mode=""
while (($#)); do
  case "$1" in
    --repo) repo=${2:-}; shift 2 ;;
    --title-file) title_file=${2:-}; shift 2 ;;
    --comment-on) comment_on=${2:-}; shift 2 ;;
    --body-file) body_file=${2:-}; shift 2 ;;
    --attach) attach_paths+=("${2:-}"); shift 2 ;;
    --attach-role) attach_roles+=("${2:-}"); shift 2 ;;
    --labels) labels=${2:-}; shift 2 ;;
    --platform) platform=${2:-}; shift 2 ;;
    --dry-run) mode=dry-run; shift ;;
    --confirm-create) mode=create; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage >&2; exit 2 ;;
  esac
done

[[ "$repo" == "udecode/plate-private" ]] || { echo "This skill only publishes Plate next/Beta issues to udecode/plate-private, where the team keeps them private" >&2; exit 2; }
if [[ -n "$comment_on" ]]; then
  [[ "$comment_on" =~ ^[1-9][0-9]*$ ]] || { echo "--comment-on takes an issue number" >&2; exit 2; }
  [[ -z "$title_file" && -z "$labels" && -z "$platform" ]] || { echo "A comment takes no --title-file, --labels or --platform" >&2; exit 2; }
else
  [[ -f "$title_file" && -s "$title_file" ]] || { echo "Missing non-empty --title-file" >&2; exit 2; }
fi
[[ -f "$body_file" && -s "$body_file" ]] || { echo "Missing non-empty --body-file" >&2; exit 2; }
[[ "$mode" == dry-run || "$mode" == create ]] || { echo "Choose --dry-run or --confirm-create" >&2; exit 2; }
attach_count=${#attach_paths[@]}
role_count=${#attach_roles[@]}
if ((role_count > 0 && role_count != attach_count)); then
  echo "Provide exactly one --attach-role for each --attach, or omit all roles" >&2
  exit 2
fi
for ((index = 0; index < attach_count; index++)); do
  path=${attach_paths[$index]}
  [[ -s "$path" ]] || { echo "Attachment is missing or empty: $path" >&2; exit 2; }
  case "$(tr '[:upper:]' '[:lower:]' <<<"${path##*.}")" in
    png|jpg|jpeg|gif|webp|svg|mp4|mov|webm) ;;
    *) echo "gh attaches only images and videos: $path" >&2; exit 2 ;;
  esac
done
for role in ${attach_roles[@]+"${attach_roles[@]}"}; do
  [[ -n "$role" && "$role" != *$'\n'* && "$role" != *"["* && "$role" != *"]"* ]] || { echo "Attachment roles must be non-empty single lines without brackets" >&2; exit 2; }
done
facet_labels=(ime regression)
IFS=',' read -r -a label_items <<<"$labels"
clean_labels=()
for label in ${label_items[@]+"${label_items[@]}"}; do
  label=$(sed -E 's/^[[:space:]]+|[[:space:]]+$//g' <<<"$label")
  [[ -n "$label" ]] || continue
  facet=false
  for each in "${facet_labels[@]}"; do [[ "$label" == "$each" ]] && facet=true; done
  [[ "$facet" == true ]] || { echo "Label '$label' is not a facet label (${facet_labels[*]}); the Scope issue field names the domain, the Platform field the browser or OS, and the v54 milestone marks Beta" >&2; exit 2; }
  clean_labels+=("$label")
done
platform_options=(Chrome Safari Firefox Edge Android iOS)
IFS=',' read -r -a platform_items <<<"$platform"
platforms=()
for value in ${platform_items[@]+"${platform_items[@]}"}; do
  value=$(sed -E 's/^[[:space:]]+|[[:space:]]+$//g' <<<"$value")
  [[ -n "$value" ]] || continue
  known=false
  for each in "${platform_options[@]}"; do [[ "$value" == "$each" ]] && known=true; done
  [[ "$known" == true ]] || { echo "Platform '$value' is not a Platform field option (${platform_options[*]})" >&2; exit 2; }
  platforms+=("$value")
done
command -v jq >/dev/null || { echo "Missing command: jq" >&2; exit 3; }
platform_json=$(jq -cn '$ARGS.positional' --args ${platforms[@]+"${platforms[@]}"})

title=""
if [[ -z "$comment_on" ]]; then
  title=$(tr '\n' ' ' <"$title_file" | sed -E 's/[[:space:]]+/ /g; s/^ //; s/ $//')
  [[ -n "$title" && ! "$title" =~ ^\[[^]]*\]: ]] || { echo "Title takes no [Beta]: or other bracket prefix; the v54 milestone marks a Beta issue" >&2; exit 2; }
fi
if grep -Eq 'TODO|TBD' ${title_file:+"$title_file"} "$body_file" ||
  grep -Eiq '<one sentence|<setup>|<action>|<failure trigger>|<expected behavior|<observed behavior|<verified value|<timestamp note|<inference' ${title_file:+"$title_file"} "$body_file"; then
  echo "Title or body contains unresolved template placeholders" >&2
  exit 2
fi

work_dir=$(mktemp -d "${TMPDIR:-/tmp}/plate-issue-publish.XXXXXX")
trap 'rm -rf "$work_dir"' EXIT

# Each reference alone in its paragraph makes gh swap in the uploaded image, or
# the bare URL that GitHub plays for a video.
final_body="$work_dir/body.md"
cp "$body_file" "$final_body"
abs_paths=()
if ((attach_count > 0)); then
  grep -Eq '^## Evidence[[:space:]]*$' "$body_file" || printf '\n\n## Evidence\n' >>"$final_body"
  for ((index = 0; index < attach_count; index++)); do
    abs_path=$(cd "$(dirname "${attach_paths[$index]}")" && pwd -P)/$(basename "${attach_paths[$index]}")
    abs_paths+=("$abs_path")
    if ((role_count > 0)); then role=${attach_roles[$index]}; else role="Evidence $((index + 1))"; fi
    printf '\n#### %s\n\n![%s](<%s>)\n' "$role" "$role" "$abs_path" >>"$final_body"
  done
fi

if [[ -n "$comment_on" ]]; then
  args=(issue comment "$comment_on" --repo "$repo" --body-file "$final_body")
  url_pattern="https://github\\.com/udecode/plate-private/issues/$comment_on#issuecomment-[0-9]+"
else
  args=(issue create --repo "$repo" --title "$title" --type Bug --milestone v54 --body-file "$final_body")
  url_pattern='https://github\.com/udecode/plate-private/issues/[0-9]+'
fi
for abs_path in ${abs_paths[@]+"${abs_paths[@]}"}; do
  args+=(--attach "$abs_path")
done
for label in ${clean_labels[@]+"${clean_labels[@]}"}; do
  args+=(--label "$label")
done

if [[ "$mode" == dry-run ]]; then
  printf '%s\0' gh "${args[@]}" |
    jq -Rs --arg repo "$repo" --arg title "$title" --arg issue "$comment_on" --rawfile body "$final_body" --argjson platform "$platform_json" \
      '{repo:$repo,body:$body,command:(split("\u0000")[:-1])} + (if $issue == "" then {title:$title,platform:$platform} else {issue:($issue | tonumber)} end)'
  exit 0
fi

command -v gh >/dev/null || { echo "Missing command: gh" >&2; exit 3; }
publish_help=$(gh issue "${args[1]}" --help 2>/dev/null || true)
if ((attach_count > 0)) && [[ "$publish_help" != *--attach* ]]; then
  echo "This gh cannot attach files; install gh 2.102 or later" >&2
  exit 3
fi
gh auth status >/dev/null

published="$work_dir/published.txt"
if ! gh "${args[@]}" >"$published"; then
  url=$(grep -Eo "$url_pattern" "$published" | tail -1 || true)
  [[ -z "$url" ]] && exit 6
  echo "gh reported an error after publishing $url; verifying it" >&2
fi
url=$(grep -Eo "$url_pattern" "$published" | tail -1 || true)
[[ -n "$url" ]] || { echo "gh did not print the new URL; do not retry blindly" >&2; exit 7; }

failed() {
  echo "Published but post-publish verification failed: $url ($1)" >&2
  exit 7
}
verified="$work_dir/verified.json"
if [[ -n "$comment_on" ]]; then
  gh api "repos/$repo/issues/comments/${url##*-}" >"$verified" || failed "readback request failed"
else
  gh issue view "$url" --repo "$repo" --json title,body,labels,issueType,milestone >"$verified" || failed "readback request failed"
  jq -e --arg title "$title" '.title == $title' "$verified" >/dev/null || failed "title mismatch"
fi
first_line=$(grep -m1 -v '^[[:space:]]*$' "$body_file" || true)
jq -e --arg line "$first_line" '.body | contains($line)' "$verified" >/dev/null || failed "body mismatch"
for abs_path in ${abs_paths[@]+"${abs_paths[@]}"}; do
  jq -e --arg path "$abs_path" '.body | contains($path) | not' "$verified" >/dev/null || failed "attachment not uploaded: $abs_path"
done
urls_filter='[.body | scan("https://github\\.com/user-attachments/[^ )>\"]+")] | unique'
uploaded=$(jq "$urls_filter | length" "$verified")
((uploaded >= attach_count)) || failed "expected $attach_count attachments, found $uploaded"
if [[ -z "$comment_on" ]]; then
  jq -e '.issueType.name == "Bug"' "$verified" >/dev/null || failed "missing type: Bug"
  jq -e '.milestone.title == "v54"' "$verified" >/dev/null || failed "missing milestone: v54"
fi
for label in ${clean_labels[@]+"${clean_labels[@]}"}; do
  jq -e --arg label "$label" 'any(.labels[]; .name == $label)' "$verified" >/dev/null || failed "missing label: $label"
done
# gh issue create cannot set an issue field, so the Platform field goes on through GraphQL after the issue exists.
if ((${#platforms[@]} > 0)); then
  number=${url##*/}
  lookup=$(gh api graphql -f query="{ organization(login: \"udecode\") { issueFields(first: 50) { nodes { ... on IssueFieldMultiSelect { id name options { id name } } } } } repository(owner: \"udecode\", name: \"plate\") { issue(number: $number) { id } } }") || failed "Platform field request failed"
  field_id=$(jq -r '[.data.organization.issueFields.nodes[] | select(.name? == "Platform")][0].id // empty' <<<"$lookup")
  issue_id=$(jq -r '.data.repository.issue.id // empty' <<<"$lookup")
  option_ids=$(jq -c --argjson wanted "$platform_json" '[.data.organization.issueFields.nodes[] | select(.name? == "Platform") | .options[] | select(.name as $name | $wanted | index($name)) | .id]' <<<"$lookup")
  [[ -n "$field_id" && -n "$issue_id" && $(jq length <<<"$option_ids") == ${#platforms[@]} ]] || failed "no Platform field or option for ${platforms[*]}"
  gh api graphql -f query="mutation { setIssueFieldValue(input: { issueId: \"$issue_id\", issueFields: [{ fieldId: \"$field_id\", multiSelectOptionIds: $option_ids }] }) { clientMutationId } }" >/dev/null || failed "Platform not set"
  values=$(gh api graphql -f query="{ repository(owner: \"udecode\", name: \"plate\") { issue(number: $number) { issueFieldValues(first: 20) { nodes { ... on IssueFieldMultiSelectValue { field { ... on IssueFieldMultiSelect { name } } options { name } } } } } } }") || failed "Platform readback request failed"
  for value in "${platforms[@]}"; do
    jq -e --arg value "$value" 'any(.data.repository.issue.issueFieldValues.nodes[]; .field.name? == "Platform" and any(.options[]; .name == $value))' <<<"$values" >/dev/null || failed "missing platform: $value"
  done
fi

jq --arg url "$url" "{url:\$url,verified:true,attachmentUrls:($urls_filter)}" "$verified"
