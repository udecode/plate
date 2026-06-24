---
description: Operate Clawpatch for semantic feature mapping, automated review, explicit finding fixes, revalidation, reports, and state recovery.
argument-hint: '[init | map | review | rereview-all | report | fix <finding-id> | revalidate <finding-id> | status]'
name: clawpatch
metadata:
  skiller:
    source: .agents/rules/clawpatch.mdc
---

# Clawpatch

Use this skill when the user asks for Clawpatch, `.clawpatch`, automated code
review, finding reports, `clawpatch review`, `clawpatch fix`, revalidation, or a
forced re-review of existing Clawpatch feature records.

## Source Of Truth

- Docs: `https://clawpatch.ai/`
- GitHub docs: `https://github.com/openclaw/clawpatch`
- The active Slate v2 Clawpatch target is the Plate repo root unless the user
  names a narrower checkout.
- Clawpatch state is local runtime state. Keep `.clawpatch/` out of git unless
  the user explicitly asks to preserve it as an artifact.

Before making claims, inspect the actual target directory:

```bash
pwd
test -f .clawpatch/config.json && clawpatch status --json
find .clawpatch/features -maxdepth 1 -type f 2>/dev/null | wc -l
find .clawpatch/reports -maxdepth 1 -type f 2>/dev/null | sort | tail -5
```

If the expected feature count or config is missing, stop and report the wrong
checkout or missing state. Do not initialize over a missing project by reflex.

You can also run from another cwd with global flags:

```bash
clawpatch --root . status --json
clawpatch --root . report --status open --json
```

## What Clawpatch Does

Clawpatch maps a repo into semantic feature records, reviews those bounded
feature contexts with a provider, persists findings, applies explicit
one-finding fixes, runs configured validation commands, and records audit state.

State layout:

- `.clawpatch/config.json`: settings, provider, commands, review limits, git
  safety flags.
- `.clawpatch/project.json`: detected project metadata when present.
- `.clawpatch/features/*.json`: feature records, status, finding ids,
  `analysisHistory`.
- `.clawpatch/findings/*.json`: finding records and triage status.
- `.clawpatch/patches/*.json`: fix attempts and validation results.
- `.clawpatch/runs/*.json`: command runs, claimed features, errors.
- `.clawpatch/reports/*.md`: generated Markdown reports.
- `.clawpatch/locks/`: transient feature locks; should clear after runs.

Feature status is not the same as finding status. A feature can be `reviewed`,
`needs-fix`, or `fixed`; a finding can be `open`, `fixed`, `wont-fix`,
`false-positive`, or `uncertain`.

## Command Reference

Core commands:

- `clawpatch init`: initialize `.clawpatch/`.
- `clawpatch map`: build semantic feature records.
- `clawpatch ci`: initialize, map, review, write a report, and append a GitHub
  Actions step summary in one CI-friendly command.
- `clawpatch status`: summarize project state.
- `clawpatch review`: review queued or selected features.
- `clawpatch report`: render finding reports.
- `clawpatch show --finding <id>`: inspect one finding.
- `clawpatch next`: pick the next finding, defaulting to `open`.
- `clawpatch triage`: change a finding status with a note.
- `clawpatch fix`: apply one explicit fix attempt.
- `clawpatch open-pr`: turn an applied patch attempt into an explicit GitHub
  pull request.
- `clawpatch revalidate`: re-check finding validity after changes.
- `clawpatch doctor`: check local setup.
- `clawpatch clean-locks`: clear stale feature locks.

Useful global flags:

- `--root <path>`: operate on a target repo from another cwd.
- `--state-dir <path>`: use a non-default state directory.
- `--config <path>`: use a specific config file.
- `--json`: machine-readable output.
- `--debug`: extra diagnostics.
- `--no-input`: avoid interactive prompts.

## Install And Doctor

Baseline requirements from the Clawpatch docs:

- Node.js 22+
- Git 2.x
- local Codex CLI for the default provider

Install:

```bash
npm install -g clawpatch
# or
pnpm add -g clawpatch
```

Probe before real work:

```bash
clawpatch --version
codex --version
clawpatch doctor
```

## Providers

Default provider is local Codex. Current provider surface also includes:

- `codex`: default local Codex CLI provider.
- `claude`: routes map, review, fix, and revalidate through local Claude Code
  CLI print mode.
- `pi`: routes review, fix, revalidate, and agent map through pi.dev.
- `cursor`: experimental Cursor Agent CLI provider. Treat it as opt-in only;
  do not use it unless the user explicitly asks or the target config already
  chooses it.

Useful provider controls:

```bash
clawpatch review --provider claude --json
clawpatch review --reasoning-effort high --json
CLAWPATCH_REASONING_EFFORT=high clawpatch review --json
CLAWPATCH_CODEX_SANDBOX=workspace-write clawpatch review --json
```

Use provider-specific flags only when they are relevant. Do not turn a normal
Clawpatch pass into a provider experiment.

## Initialize And Map

Use this only when the target repo truly has no Clawpatch state.

```bash
clawpatch init
clawpatch map
clawpatch status --json
```

`clawpatch init` creates `.clawpatch/config.json`. The default config excludes
large/generated folders and `.clawpatch/**`, uses the local Codex provider, and
sets `git.requireCleanWorktreeForFix: true`.

Run commands from the actual target root. Do not initialize over missing state
by reflex.

## Review

Plain review:

```bash
clawpatch review --json
```

Batch review:

```bash
clawpatch review --limit 10 --json
```

Specific feature:

```bash
clawpatch review --feature <featureId> --json
```

Dry-run queue check:

```bash
clawpatch review --dry-run --json
```

Hard rule: `clawpatch review --json` reviews the eligible queue, not
necessarily every feature record on disk. `reviewed: 0` can be correct when
`clawpatch review --dry-run --json` says `wouldReview: 0`, even if
`clawpatch status --json` reports many feature records.

Review controls added in current Clawpatch:

```bash
clawpatch review --include-dirty --json
clawpatch review --prompt-file review-guidance.md --json
clawpatch review --prompt-file - --json
clawpatch review --export-tribunal-ledger .clawpatch/runs/review-ledger.jsonl --json
clawpatch review --jobs 4 --json
clawpatch review --rate-limit-per-minute 20 --json
CLAWPATCH_RPM=20 clawpatch review --json
CLAWPATCH_REVIEW_RETRIES=2 clawpatch review --json
clawpatch review --prompt-retries 2 --json
```

Rules for these controls:

- Use `--include-dirty` when the point is to audit uncommitted local changes.
- Use `--prompt-file` for extra reviewer law instead of pasting huge guidance
  into chat.
- Use `--export-tribunal-ledger` only when downstream ingestion is explicitly
  useful.
- Leave `--jobs` unset unless local resources or provider limits demand it;
  Clawpatch defaults to a CPU-aware value capped at 10.
- Use `--rate-limit-per-minute` / `CLAWPATCH_RPM` for provider quota pressure,
  not as a substitute for narrowing scope.
- Use retry controls only for transient malformed-provider output. Do not retry
  deterministic auth, quota, unsupported-provider, refusal, or cancellation
  failures as if they are flaky findings.

Current review output is stricter than older runs: provider findings must cite
included files, valid line ranges, and matching evidence quotes. A run can
complete while dropping invalid individual findings into `run.errors` with
`schema-drop` or `validation-drop`. Always inspect `run.errors` before claiming
the review was clean.

Prompt provenance and budget accounting are now part of review output. When a
review looks oddly small or noisy, inspect included files, omitted files,
prompt bytes, and approximate token counts before blaming the reviewer model.

## CI

Use CI mode when the user asks for a one-command automation path or a GitHub
Actions summary:

```bash
clawpatch ci --json
clawpatch ci --since HEAD~1 --json
clawpatch ci --include-dirty --json
clawpatch ci --jobs 4 --rate-limit-per-minute 20 --json
```

`clawpatch ci --since` can legitimately report `reviewed: 0` on an empty
filtered diff. Treat that as an empty queue, not a failed run.

## Force Re-Review All Features

When the user asks to re-review all known features, do not use plain
`clawpatch review`. Force each feature explicitly.

```bash
mkdir -p .clawpatch/runs/forced-rereview-$(date -u +%Y%m%dT%H%M%SZ)
jq -r '.featureId' .clawpatch/features/*.json | sort > .clawpatch/runs/forced-rereview/features.txt

while IFS= read -r feature_id; do
  clawpatch review --feature "$feature_id" --json
done < .clawpatch/runs/forced-rereview/features.txt
```

For long runs, record each result to JSONL so interruption is recoverable:

```bash
run_dir=".clawpatch/runs/forced-rereview-$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$run_dir"
jq -r '.featureId' .clawpatch/features/*.json | sort > "$run_dir/features.txt"

while IFS= read -r feature_id; do
  printf '%s\n' "$feature_id"
  if output=$(clawpatch review --feature "$feature_id" --json 2>&1); then
    printf '{"featureId":%s,"ok":true,"output":%s}\n' \
      "$(jq -Rn --arg v "$feature_id" '$v')" \
      "$(jq -Rn --arg v "$output" '$v')" >> "$run_dir/review-results.jsonl"
  else
    printf '{"featureId":%s,"ok":false,"output":%s}\n' \
      "$(jq -Rn --arg v "$feature_id" '$v')" \
      "$(jq -Rn --arg v "$output" '$v')" >> "$run_dir/review-results.jsonl"
  fi
done < "$run_dir/features.txt"
```

Avoid zsh's reserved `status` variable in shell loops. Use names like
`ok`, `exit_code`, or `feature_status`.

## Report And Triage

Open findings:

```bash
clawpatch report --status open --json
clawpatch status --json
clawpatch next --json
```

Markdown report:

```bash
clawpatch report
```

Filtered reports:

```bash
clawpatch report --severity high --json
clawpatch report --feature <featureId> --json
clawpatch report --category <category> --json
clawpatch report --triage <triage> --json
clawpatch report --output .clawpatch/reports/open.md
```

A report may include old findings with non-open statuses. Do not count the
whole Markdown report as current work. Use `report --status open --json` and
`status --json` for the live queue.

For JSON reports, prefer `total` and `items` as the stable shape. `results` is
an alias, and the legacy `findings` key is a count, not the finding array.

False positives should be recorded in Clawpatch, not silently ignored:

```bash
clawpatch triage --finding <findingId> --status false-positive --note "<evidence>"
```

Use `wont-fix` only for a deliberate product/architecture decision. Use
`uncertain` when evidence is insufficient.

## Fix

Fix is explicit and one finding at a time:

```bash
clawpatch fix --finding <findingId> --json
```

Default safety blocks fixes on a dirty worktree:

```json
{
  "git": {
    "requireCleanWorktreeForFix": true,
    "commit": false,
    "openPr": false
  }
}
```

For a local multi-finding fix batch where Clawpatch dirties the tree with its
own prior patch, it is acceptable to temporarily set
`requireCleanWorktreeForFix: false`, run the batch, then restore it to `true`
before handoff. Record this in the plan.

Never let Clawpatch commit, push, or open PRs in this repo unless the user
explicitly asks for that behavior.

Patch-to-PR is explicit:

```bash
clawpatch open-pr --patch <patchId> --json
```

In `plate-2`, do not use `clawpatch open-pr` just because a patch exists. It
creates git state and remote side effects. Use it only when the user explicitly
asks for Clawpatch to open the PR; otherwise keep patches local and report the
finding/patch ids.

## Revalidate

Use revalidation after manual fixes, Clawpatch patches, or upstream changes:

```bash
clawpatch revalidate --finding <findingId> --json
```

Broader revalidation:

```bash
clawpatch revalidate --all --status open --json
clawpatch revalidate --feature <featureId> --json
clawpatch revalidate --since HEAD~1 --json
clawpatch revalidate --limit 10 --status open --json
clawpatch revalidate --include-dirty --json
```

Trust revalidation scope. If source is fixed but the finding remains open
because exported artifacts are stale, rebuild the relevant package and
revalidate again.

Example from Slate v2:

```bash
pnpm --filter @platejs/slate-react build
clawpatch revalidate --finding <findingId> --json
```

## Locks

`clawpatch status --json` reports `activeLocks` and `lockFiles`. If locks remain
after a process exits, inspect before cleaning:

```bash
find .clawpatch/locks -maxdepth 1 -type f -print -exec sed -n '1,120p' {} \;
ps -p <pid-from-lock> -o pid=,comm= 2>/dev/null || true
```

If the process is gone and no Clawpatch run is active, clean stale locks:

```bash
clawpatch clean-locks --json
```

Do not delete lock files manually unless `clean-locks` is unavailable and the
process is proven dead.

## Mapping Notes

Current Clawpatch has broader mapper coverage than older local habits:

- Node app roots under `apps/*` and `packages/*` can map even without a local
  package file when positive source/framework signals exist.
- Bun text lockfiles are detected as `bun.lock`.
- Node route mapping preserves literal Express, Hono, Flask, Django include,
  FastAPI router, Laravel group, Fastify, and Rails route prefixes more
  reliably.
- Maven/Spring projects have dedicated root, nested, and multi-module mapping.
- Large flat directories are split by repeated filename families into more
  coherent review slices.

Do not paper over a weird map by assuming the old mapper limits still apply.
Run `clawpatch map --json` or inspect the feature record first.

## Slate V2 Operating Rules

- Default target: `.` from the Plate repo root when the user says Slate v2.
- Keep `.clawpatch/` ignored. The state can be huge and local.
- Use the active goal plus one `docs/plans/**` goal plan for restartable
  progress when the run spans many commands. Do not create hook fallback state.
- `pending` means more autonomous work remains.
- `done` means the active Clawpatch target is met.
- `blocked` means the target cannot continue without restored state, missing
  tooling, or a user decision.

## Verification Closeout

For review-only work:

```bash
clawpatch status --json
clawpatch report --status open --json
node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/<goal-plan>.md
```

For fix work, run the configured Clawpatch validation plus the repo's relevant
checks. In Slate v2 batches this has usually meant:

```bash
npm run typecheck
npm run lint:fix
npm run lint
npm run test
clawpatch status --json
```

For generated skills in `plate-2`, after editing `.agents/rules/*.mdc` or
`.agents/AGENTS.md`, run:

```bash
pnpm install
```

Then verify the generated skill mirrors the source:

```bash
test -f .agents/skills/clawpatch/SKILL.md
rg -n "Force Re-Review All Features|review --dry-run|requireCleanWorktreeForFix|clawpatch --root \\." .agents/rules/clawpatch.mdc .agents/skills/clawpatch/SKILL.md
```
