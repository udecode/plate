#!/usr/bin/env bash
set -euo pipefail

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)
skill_dir=$(cd "$script_dir/.." && pwd -P)
recorder_skill_dir=${CODEX_BROWSER_REPRO_RECORDER_SKILL_DIR:-"$HOME/.codex/skills/recording-browser-repros"}

bash -n "$script_dir/prepare-video-evidence.sh"
bash -n "$script_dir/publish-issue.sh"
bash "$recorder_skill_dir/scripts/self-test.sh"
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

rg -q '^### Two videos$' "$skill_dir/SKILL.md"
rg -q '^### One failure video$' "$skill_dir/SKILL.md"
rg -q '^### Text-only description$' "$skill_dir/SKILL.md"
rg -q 'Invoking this skill is explicit authority to' "$skill_dir/SKILL.md"
rg -q 'Do not ask for another confirmation or pause after' "$skill_dir/SKILL.md"
rg -q 'Skill invocation supplies public-mutation authority' "$skill_dir/SKILL.md"
rg -Uq 'Pass the publisher.s\nmechanical confirmation flag automatically' "$skill_dir/SKILL.md"
rg -Uq 'skill\ninvocation supplies issue-publication approval' \
  "$skill_dir/references/github-api-boundaries.md"
if rg -q 'Keep analysis read-only until the user explicitly' "$skill_dir/SKILL.md"; then
  echo 'Legacy reconfirmation boundary remains' >&2
  exit 1
fi
rg -q 'Preserve the two source videos as separate publication artifacts' "$skill_dir/SKILL.md"
rg -q 'Merge clips only when the user explicitly requests a' "$skill_dir/SKILL.md"
rg -Uq 'Treat exactly two supplied recordings as the standard Beta comparison: one\n   records normal behavior on `main`; the other records the current bug on `next`' "$skill_dir/SKILL.md"
rg -q 'Make a lightweight evidence-based attempt to distinguish the `main` and' "$skill_dir/SKILL.md"
rg -q 'normal behavior is the likely' "$skill_dir/SKILL.md"
rg -Uq 'Ask the\n  user only when the available evidence does not support a reliable mapping' "$skill_dir/SKILL.md"
rg -q 'Never infer branch roles from input order' "$skill_dir/SKILL.md"
rg -Uq 'Never invent presentation roles such as `wide`, `close-up`, `overview`, or\n  `detail`' "$skill_dir/SKILL.md"
rg -q 'which file is from `main`, and which is from `next`' "$skill_dir/SKILL.md"
rg -q '^## Beta-only scope$' "$skill_dir/SKILL.md"
rg -q 'Use this skill only for Plate `next` branch and Beta release testing' "$skill_dir/SKILL.md"
rg -q 'Start every title with `\[Beta\]: `' "$skill_dir/SKILL.md"
rg -q 'Never use `\[Bug\]`' "$skill_dir/SKILL.md"
rg -q 'This skill only publishes Plate next/Beta issues to udecode/plate' "$script_dir/publish-issue.sh"
rg -q 'Title must start with \[Beta\]: ' "$script_dir/publish-issue.sh"
rg -Fq 'video_paths[$video_count]="${2:-}"' "$script_dir/publish-issue.sh"
rg -q 'upload_nonce=.*\/dev\/urandom' "$script_dir/publish-issue.sh"
rg -Fq "curl -fsSL -w '%{content_type}'" "$script_dir/publish-issue.sh"
rg -q 'Public media size mismatch' "$script_dir/publish-issue.sh"
rg -q 'Public media MIME mismatch' "$script_dir/publish-issue.sh"
rg -q 'Issue was not created; public upload may be orphaned' "$script_dir/publish-issue.sh"
rg -q 'Issue created but post-create verification failed' "$script_dir/publish-issue.sh"
rg -q '^\[Beta\]: ' "$skill_dir/assets/title.example.txt"
rg -q 'Repository: `udecode/plate`' "$skill_dir/assets/issue-body.md"
rg -q 'Branch: `next`' "$skill_dir/assets/issue-body.md"
rg -q 'display_name: "Plate Beta Issue Reporter"' "$skill_dir/agents/openai.yaml"
rg -q 'default_prompt: ".*Plate next/Beta.*\[Beta\].*udecode/plate' "$skill_dir/agents/openai.yaml"
rg -q '^## Native Chrome attachment flow$' "$skill_dir/SKILL.md"
rg -q 'Never put a native `github.com/user-attachments` URL inside inline code' "$skill_dir/SKILL.md"
rg -q 'Never move, rewrite, duplicate, or remove a freshly saved native attachment' "$skill_dir/SKILL.md"
rg -q 'If any later body edit occurs, discard all earlier media' "$skill_dir/SKILL.md"
rg -q 'exactly the intended number of final attachment' "$skill_dir/SKILL.md"
rg -q 'a second public fetch of every attachment after the Chrome reload and API' "$skill_dir/SKILL.md"
rg -q '^### Chrome local-file fallback$' "$skill_dir/SKILL.md"
rg -q '`fileChooser.setFiles` with `Not allowed`' "$skill_dir/SKILL.md"
rg -q 'Allow access to file URLs' "$skill_dir/SKILL.md"
rg -q 'use Computer Use to click the issue body' "$skill_dir/SKILL.md"
rg -Fq 'press `Command+Shift+G`' "$skill_dir/SKILL.md"
rg -Uq 'cancel the\n+   unsaved edit so the server body remains unchanged' "$skill_dir/SKILL.md"
rg -Uq 'The fallback changes only how the local file reaches Chrome; it does not\n+   weaken raw-body' "$skill_dir/SKILL.md"
rg -q 'global `recording-browser-repros` skill' "$skill_dir/SKILL.md"
rg -q '~/.codex/skills/recording-browser-repros/SKILL.md' "$skill_dir/SKILL.md"
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
  "$skill_dir/SKILL.md"; then
  echo 'Undocumented GitHub upload endpoint found' >&2
  exit 1
fi
if rg -n 'TODO|TBD|\[TODO' \
  "$skill_dir/SKILL.md" \
  "$skill_dir/agents" \
  "$skill_dir/assets" \
  "$skill_dir/references" \
  "$script_dir/prepare-video-evidence.sh"; then
  echo 'Placeholder found' >&2
  exit 1
fi

echo 'github-issue-reporter self-test: PASS'
