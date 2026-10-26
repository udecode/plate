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

test_dir=$(cd "$(mktemp -d "${TMPDIR:-/tmp}/plate-issue-publish-test.XXXXXX")" && pwd -P)
trap 'rm -rf "$test_dir"' EXIT
publish() { bash "$script_dir/publish-issue.sh" --repo udecode/plate "$@"; }
refuses() {
  local reason=$1
  shift
  if "$@" >/dev/null 2>&1; then
    echo "Publisher accepted $reason" >&2
    exit 1
  fi
}

printf '%s\n' '[Beta]: Editor drag crashes the page' >"$test_dir/title.txt"
printf '%s\n' '## Summary' '' 'Dragging a block crashes the page.' >"$test_dir/body.md"
ffmpeg -hide_banner -loglevel error -y -f lavfi -i color=c=black:s=16x16:d=0.1 \
  -pix_fmt yuv420p "$test_dir/main.mp4"
ffmpeg -hide_banner -loglevel error -y -f lavfi -i color=c=white:s=16x16:d=0.1 \
  -frames:v 1 "$test_dir/next frame.png"

dry_run=$(publish --title-file "$test_dir/title.txt" --body-file "$test_dir/body.md" --dry-run)
jq -e '.repo == "udecode/plate" and .title == "[Beta]: Editor drag crashes the page" and .command[0:3] == ["gh","issue","create"] and .command[(.command | index("--type")) + 1] == "Bug"' <<<"$dry_run" >/dev/null

printf '%s\n' '## Summary' '' 'The export call is at lines 50-56 of `exportHtmlToDocx.internal.ts`.' >"$test_dir/identifier-body.md"
publish --title-file "$test_dir/title.txt" --body-file "$test_dir/identifier-body.md" --dry-run >/dev/null

two_file_dry_run=$(publish \
  --title-file "$test_dir/title.txt" \
  --body-file "$test_dir/body.md" \
  --attach "$test_dir/main.mp4" \
  --attach-role 'Slate — normal behavior (expected baseline)' \
  --attach "$test_dir/next frame.png" \
  --attach-role 'next — current Beta bug (actual behavior)' \
  --labels 'target:beta' \
  --dry-run)
jq -e --arg main "$test_dir/main.mp4" --arg next "$test_dir/next frame.png" '
  ([.command | indices("--attach")[]] | length) == 2 and
  (.command | index($main)) != null and
  (.command | index($next)) != null and
  ([.command | indices("--label")[]] | length) == 1 and
  (.body | contains("#### Slate — normal behavior (expected baseline)\n\n![Slate — normal behavior (expected baseline)](<" + $main + ">)")) and
  (.body | contains("#### next — current Beta bug (actual behavior)\n\n![next — current Beta bug (actual behavior)](<" + $next + ">)"))
' <<<"$two_file_dry_run" >/dev/null

printf '%s\n' '## Summary' '' 'Dragging a block crashes the page.' '' '## Evidence' '' 'The crash starts at 0:04.' >"$test_dir/evidence-body.md"
evidence_dry_run=$(publish --title-file "$test_dir/title.txt" --body-file "$test_dir/evidence-body.md" \
  --attach "$test_dir/main.mp4" --dry-run)
jq -e '([.body | scan("(?m)^## Evidence$")] | length) == 1 and (.body | contains("The crash starts at 0:04.\n\n#### Evidence 1\n"))' \
  <<<"$evidence_dry_run" >/dev/null

cp "$test_dir/main.mp4" "$test_dir/take#2.mp4"
comment_dry_run=$(publish --comment-on 5224 --body-file "$test_dir/body.md" \
  --attach "$test_dir/take#2.mp4" --attach-role 'Repro 2 — Firefox' --dry-run)
jq -e --arg take "$test_dir/take#2.mp4" '
  .issue == 5224 and (has("title") | not) and
  .command[0:4] == ["gh","issue","comment","5224"] and
  (.command | index($take)) != null and
  (.command | index("--label")) == null and
  (.command | index("--type")) == null
' <<<"$comment_dry_run" >/dev/null

printf '%s\n' 'Editor drag crashes the page' >"$test_dir/non-beta-title.txt"
printf 'notes' >"$test_dir/notes.txt"
refuses 'a non-Beta title' publish --title-file "$test_dir/non-beta-title.txt" --body-file "$test_dir/body.md" --dry-run
refuses 'a non-Plate repository' bash "$script_dir/publish-issue.sh" --repo example/example \
  --title-file "$test_dir/title.txt" --body-file "$test_dir/body.md" --dry-run
refuses 'unresolved placeholders' publish --title-file "$skill_dir/assets/title.example.txt" \
  --body-file "$skill_dir/assets/issue-body.md" --dry-run
printf '%s\n' '## Summary' '' 'TODO: add the repro.' >"$test_dir/todo-body.md"
refuses 'a TODO in the body' publish --title-file "$test_dir/title.txt" --body-file "$test_dir/todo-body.md" --dry-run
refuses 'a file gh cannot attach' publish --title-file "$test_dir/title.txt" --body-file "$test_dir/body.md" \
  --attach "$test_dir/notes.txt" --dry-run
refuses 'a role count that does not match the attachments' publish --title-file "$test_dir/title.txt" \
  --body-file "$test_dir/body.md" --attach "$test_dir/main.mp4" --attach "$test_dir/next frame.png" \
  --attach-role 'only one' --dry-run
refuses 'a comment with a title' publish --comment-on 5224 --title-file "$test_dir/title.txt" \
  --body-file "$test_dir/body.md" --dry-run
refuses 'a comment with labels' publish --comment-on 5224 --labels target:beta --body-file "$test_dir/body.md" --dry-run
refuses 'a comment on something other than an issue number' publish --comment-on '#5224' \
  --body-file "$test_dir/body.md" --dry-run

fake_bin="$test_dir/fake-bin"
mkdir -p "$fake_bin"
cat >"$fake_bin/gh" <<'FAKE_GH'
#!/usr/bin/env bash
case "$*" in
  'auth status') exit 0 ;;
  'issue create --help'|'issue comment --help') echo '      --attach file   Attach an image or video file'; exit 0 ;;
  'issue create '*) echo 'https://github.com/udecode/plate/issues/123'; exit 0 ;;
  'issue comment 5224 '*) echo 'https://github.com/udecode/plate/issues/5224#issuecomment-987'; exit 0 ;;
  'api repos/udecode/plate/issues/comments/987')
    jq -n '{body:"## Summary\n\nDragging a block crashes the page.\n\n## Evidence\n\n#### a\n\nhttps://github.com/user-attachments/assets/aaa\n"}'
    exit 0 ;;
  'issue view https://github.com/udecode/plate/issues/123 '*)
    case "${TEST_ISSUE_READBACK:-}" in
      ok)
        jq -n '{title:"[Beta]: Editor drag crashes the page",
          body:"## Summary\n\nDragging a block crashes the page.\n\n## Evidence\n\n#### a\n\nhttps://github.com/user-attachments/assets/aaa\n\n#### b\n\n![b](https://github.com/user-attachments/assets/bbb)\n",
          issueType:{name:"Bug"}, labels:[{name:"target:beta"}]}' ;;
      untyped)
        jq -n '{title:"[Beta]: Editor drag crashes the page",
          body:"## Summary\n\nDragging a block crashes the page.\n\n## Evidence\n\n#### a\n\nhttps://github.com/user-attachments/assets/aaa\n\n#### b\n\n![b](https://github.com/user-attachments/assets/bbb)\n",
          issueType:null, labels:[{name:"target:beta"}]}' ;;
      wrong-body) jq -n '{title:"[Beta]: Editor drag crashes the page", body:"Wrong body.", labels:[]}' ;;
      *) exit 1 ;;
    esac
    exit 0 ;;
esac
exit 2
FAKE_GH
chmod +x "$fake_bin/gh"
create() {
  PATH="$fake_bin:$PATH" TEST_ISSUE_READBACK=$1 bash "$script_dir/publish-issue.sh" --repo udecode/plate \
    --title-file "$test_dir/title.txt" --body-file "$test_dir/body.md" \
    --attach "$test_dir/main.mp4" --attach "$test_dir/next frame.png" \
    --labels 'target:beta' --confirm-create 2>&1
}

created=$(create ok)
jq -e '.url == "https://github.com/udecode/plate/issues/123" and .verified and (.attachmentUrls | length) == 2' <<<"$created" >/dev/null
commented=$(PATH="$fake_bin:$PATH" bash "$script_dir/publish-issue.sh" --repo udecode/plate --comment-on 5224 \
  --body-file "$test_dir/body.md" --attach "$test_dir/main.mp4" --confirm-create)
jq -e '.url == "https://github.com/udecode/plate/issues/5224#issuecomment-987" and .verified and (.attachmentUrls | length) == 1' \
  <<<"$commented" >/dev/null

for case_name in failed-readback wrong-body; do
  set +e
  output=$(create "$case_name")
  status=$?
  set -e
  [[ "$status" == 7 ]] || { echo "Expected $case_name to exit 7, got $status" >&2; exit 1; }
  grep -Fq 'Published but post-publish verification failed: https://github.com/udecode/plate/issues/123' <<<"$output"
done
grep -Fq '(body mismatch)' <<<"$output"
set +e
output=$(create untyped)
status=$?
set -e
[[ "$status" == 7 ]] || { echo "Expected an untyped issue to exit 7, got $status" >&2; exit 1; }
grep -Fq '(missing type: Bug)' <<<"$output"

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
rg -q -- '--attach' "$script_dir/publish-issue.sh"
private_upload_pattern='upload/policies/'"assets|upload/"'assets'
if rg -n "$private_upload_pattern" \
  "$script_dir/publish-issue.sh" \
  "$skill_entry"; then
  echo 'Undocumented GitHub upload endpoint found' >&2
  exit 1
fi
if rg -n 'TODO|TBD|\[TODO' \
  "$skill_entry" \
  "$skill_dir/assets" \
  "$skill_dir/references" \
  "$script_dir/prepare-video-evidence.sh"; then
  echo 'Placeholder found' >&2
  exit 1
fi

echo "maintainer issue publisher self-test: PASS (recorder: $recorder_status)"
