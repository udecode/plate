#!/usr/bin/env bash
set -euo pipefail

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)
skill_dir=$(cd "$script_dir/.." && pwd -P)
skill_entry="$skill_dir/SKILL.md"
[[ -f "$skill_entry" ]] || skill_entry="${skill_dir}.mdc"
[[ -f "$skill_entry" ]] || { echo "Missing source or generated skill entry" >&2; exit 1; }
recorder_skill_dir=${CODEX_BROWSER_REPRO_RECORDER_SKILL_DIR:-"$HOME/.codex/skills/recording-browser-repros"}

bash -n "$script_dir/prepare-video-evidence.sh"
bash -n "$script_dir/publish-issue.sh"
recorder_status=unavailable
if [[ -f "$recorder_skill_dir/scripts/self-test.sh" ]]; then
  bash "$recorder_skill_dir/scripts/self-test.sh"
  recorder_status=passed
else
  echo "Recorder integration unavailable; continuing independent publisher checks" >&2
fi
node -e 'const fs=require("fs"); const p=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); const kinds=new Set(p.cases?.map(x=>x.kind)); for(const k of ["two-videos","one-video","text-only"]) if(!kinds.has(k)) process.exit(1); const c=p.cases.find(x=>x.kind==="two-videos"); if(c.inputs?.join(",")!=="main.mp4,next.mp4"||!/main normal baseline/.test(c.expected)||!/current next\/Beta bug/.test(c.expected)||!/normal-versus-regression behavioral delta/.test(c.expected)||!/ask the user only when that evidence is ambiguous/.test(c.expected)||!/never infer roles from input order or visual presentation/i.test(c.expected)) process.exit(1)' "$skill_dir/assets/intake-cases.json"

test_dir=$(mktemp -d "${TMPDIR:-/tmp}/github-issue-reporter-test.XXXXXX")
cleanup() { rm -rf "$test_dir"; }
trap cleanup EXIT INT TERM
printf '%s\n' '[Beta]: Editor drag crashes the page' >"$test_dir/title.txt"
printf '%s\n' '## Summary' '' 'Dragging a block crashes the page.' >"$test_dir/body.md"
dry_run=$(bash "$script_dir/publish-issue.sh" \
  --repo udecode/plate \
  --title-file "$test_dir/title.txt" \
  --body-file "$test_dir/body.md" \
  --dry-run)
jq -e '.repo == "udecode/plate" and .issuePayload.title == "[Beta]: Editor drag crashes the page"' <<<"$dry_run" >/dev/null

ffmpeg -hide_banner -loglevel error -y -f lavfi -i color=c=black:s=16x16:d=0.1 \
  -pix_fmt yuv420p "$test_dir/main.mp4"
ffmpeg -hide_banner -loglevel error -y -f lavfi -i color=c=white:s=16x16:d=0.1 \
  -pix_fmt yuv420p "$test_dir/next.mp4"
two_video_dry_run=$(ISSUE_VIDEO_REMOTE='r2:issue-evidence' \
  ISSUE_VIDEO_PUBLIC_BASE_URL='https://media.example.com/issue-evidence' \
  bash "$script_dir/publish-issue.sh" \
    --repo udecode/plate \
    --title-file "$test_dir/title.txt" \
    --body-file "$test_dir/body.md" \
    --video "$test_dir/main.mp4" \
    --video-role 'main — normal behavior (expected baseline)' \
    --video "$test_dir/next.mp4" \
    --video-role 'next — current Beta bug (actual behavior)' \
    --dry-run)
jq -e '
  (.uploads | length) == 2 and
  .uploads[0].uploadTarget != .uploads[1].uploadTarget and
  (.issuePayload.body | contains("main — normal behavior (expected baseline)")) and
  (.issuePayload.body | contains("next — current Beta bug (actual behavior)"))
' <<<"$two_video_dry_run" >/dev/null

fake_bin="$test_dir/fake-bin"
mkdir -p "$fake_bin"
cat >"$fake_bin/gh" <<'FAKE_GH'
#!/usr/bin/env bash
if [[ "$*" == "auth status" ]]; then
  exit 0
fi
if [[ "$*" == "api repos/udecode/plate" ]]; then
  printf '%s\n' '{"private":false}'
  exit 0
fi
if [[ "$*" == "api --method POST repos/udecode/plate/issues --input "* ]]; then
  printf '%s\n' '{"number":123,"html_url":"https://github.com/udecode/plate/issues/123"}'
  exit 0
fi
if [[ "$*" == "api repos/udecode/plate/issues/123" ]]; then
  if [[ "${TEST_ISSUE_READBACK:-}" == wrong-body ]]; then
    printf '%s\n' '{"number":123,"title":"[Beta]: Editor drag crashes the page","body":"Wrong body; reproduction was lost.","labels":[]}'
    exit 0
  fi
  exit 1
fi
exit 2
FAKE_GH
chmod +x "$fake_bin/gh"
cat >"$fake_bin/rclone" <<'FAKE_RCLONE'
#!/usr/bin/env bash
set -euo pipefail
case "${1:-}" in
  copyto)
    count=0
    [[ ! -f "$TEST_RCLONE_STATE" ]] || count=$(<"$TEST_RCLONE_STATE")
    count=$((count + 1))
    printf '%s' "$count" >"$TEST_RCLONE_STATE"
    if ((count == 2)); then
      exit 5
    fi
    wc -c <"$2" | tr -d ' ' >"$TEST_RCLONE_SIZE"
    ;;
  size)
    printf '{"bytes":%s}\n' "$(<"$TEST_RCLONE_SIZE")"
    ;;
  *)
    exit 2
    ;;
esac
FAKE_RCLONE
cat >"$fake_bin/curl" <<'FAKE_CURL'
#!/usr/bin/env bash
set -euo pipefail
output=""
while (($#)); do
  if [[ "$1" == -o ]]; then
    output=${2:-}
    shift 2
    continue
  fi
  shift
done
[[ -n "$output" ]]
cp "$TEST_PUBLIC_SOURCE" "$output"
printf 'video/mp4'
FAKE_CURL
chmod +x "$fake_bin/rclone" "$fake_bin/curl"

set +e
orphan_output=$(PATH="$fake_bin:$PATH" \
  TEST_PUBLIC_SOURCE="$test_dir/main.mp4" \
  TEST_RCLONE_SIZE="$test_dir/rclone-size" \
  TEST_RCLONE_STATE="$test_dir/rclone-state" \
  ISSUE_VIDEO_REMOTE='mock:issue-evidence' \
  ISSUE_VIDEO_PUBLIC_BASE_URL='https://media.example.com/issue-evidence' \
  bash "$script_dir/publish-issue.sh" \
    --repo udecode/plate \
    --title-file "$test_dir/title.txt" \
    --body-file "$test_dir/body.md" \
    --video "$test_dir/main.mp4" \
    --video "$test_dir/next.mp4" \
    --confirm-create 2>&1)
orphan_status=$?
set -e
[[ "$orphan_status" == 5 ]] || {
  echo "Expected partial upload exit 5, got $orphan_status" >&2
  exit 1
}
[[ $(grep -Fc 'Issue was not created; public upload may be orphaned:' <<<"$orphan_output") == 2 ]]
grep -Eq 'public upload may be orphaned: .*-[0-9a-f]{32}-1-main\.mp4' <<<"$orphan_output"
grep -Eq 'public upload may be orphaned: .*-[0-9a-f]{32}-2-next\.mp4' <<<"$orphan_output"

set +e
post_create_output=$(PATH="$fake_bin:$PATH" bash "$script_dir/publish-issue.sh" \
  --repo udecode/plate \
  --title-file "$test_dir/title.txt" \
  --body-file "$test_dir/body.md" \
  --confirm-create 2>&1)
post_create_status=$?
set -e
[[ "$post_create_status" == 7 ]] || {
  echo "Expected post-create verification exit 7, got $post_create_status" >&2
  exit 1
}
grep -Fq 'Issue created but post-create verification failed: https://github.com/udecode/plate/issues/123' \
  <<<"$post_create_output"

set +e
body_mismatch_output=$(PATH="$fake_bin:$PATH" TEST_ISSUE_READBACK=wrong-body \
  bash "$script_dir/publish-issue.sh" \
    --repo udecode/plate \
    --title-file "$test_dir/title.txt" \
    --body-file "$test_dir/body.md" \
    --confirm-create 2>&1)
body_mismatch_status=$?
set -e
[[ "$body_mismatch_status" == 7 ]] || {
  echo "Expected mismatched body to fail verification with exit 7, got $body_mismatch_status" >&2
  exit 1
}
grep -Fq '(body mismatch)' <<<"$body_mismatch_output"
printf '%s\n' 'Editor drag crashes the page' >"$test_dir/non-beta-title.txt"
if bash "$script_dir/publish-issue.sh" \
  --repo udecode/plate \
  --title-file "$test_dir/non-beta-title.txt" \
  --body-file "$test_dir/body.md" \
  --dry-run >/dev/null 2>&1; then
  echo 'Publisher accepted a non-Beta title' >&2
  exit 1
fi
if bash "$script_dir/publish-issue.sh" \
  --repo example/example \
  --title-file "$test_dir/title.txt" \
  --body-file "$test_dir/body.md" \
  --dry-run >/dev/null 2>&1; then
  echo 'Publisher accepted a non-Plate repository' >&2
  exit 1
fi
if bash "$script_dir/publish-issue.sh" \
  --repo udecode/plate \
  --title-file "$skill_dir/assets/title.example.txt" \
  --body-file "$skill_dir/assets/issue-body.md" \
  --dry-run >/dev/null 2>&1; then
  echo 'Publisher accepted unresolved placeholders' >&2
  exit 1
fi

# Publisher behavior is checked above. General skill discovery/source checks
# belong to the project skill validator, not literal prose assertions here.
for old_recorder_path in \
  "$skill_dir/assets/shot-plan.example.json" \
  "$skill_dir/references/shot-plan.md" \
  "$script_dir/interaction-overlay.js" \
  "$script_dir/record-background.mjs" \
  "$script_dir/record-background.sh"; do
  if [[ -e "$old_recorder_path" ]]; then
    echo "Duplicate recorder owner remains: $old_recorder_path" >&2
    exit 1
  fi
done
rg -q 'gh api --method POST' "$script_dir/publish-issue.sh"
private_upload_pattern='upload/policies/'"assets|upload/"'assets'
if rg -n "$private_upload_pattern" \
  "$script_dir/publish-issue.sh" \
  "$skill_entry"; then
  echo 'Undocumented GitHub upload endpoint found' >&2
  exit 1
fi
if rg -n 'TODO|TBD|\[TODO' \
  "$skill_entry" \
  "$skill_dir/agents" \
  "$skill_dir/assets" \
  "$skill_dir/references" \
  "$script_dir/prepare-video-evidence.sh"; then
  echo 'Placeholder found' >&2
  exit 1
fi

echo "github-issue-reporter publisher self-test: PASS (recorder: $recorder_status)"
