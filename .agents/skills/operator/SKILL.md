---
description: Run Local CI (post-landing slow and formal checks on next), check status, rerun, manage its Mac launchd job, and run the persistent operator session that dispatches fix, beta release, friction, and opt-in auto-start workers. Use for /operator, /local-ci, "is next green", "Local CI status", "rerun Local CI", "keep watching", "release a beta now", or a red local-ci failure.
argument-hint: '[watch | release | status | rerun | install | uninstall]'
name: operator
metadata:
  skiller:
    source: .agents/rules/operator.mdc
---

# Operator and Local CI

Owns Local CI (`tooling/scripts/local-ci.mjs`, post-landing checks on `origin/next`) and the persistent `operator` session. Let `<main>` be the main checkout.

## How Local CI runs

`pnpm check --affected` runs `land` steps; Local CI runs all other non-opt-in steps on `origin/next` (`--deep`, daily fresh `--build --browser --reads` after 04:00 on main). Heavy baseline-pinned sweeps are opt-in via `pnpm check --audit` or by name.

- Launchd (`dev.plate.local-ci`) runs `local-ci.mjs run` every 20m in `<main>/.claude/worktrees/local-ci`. Main CI checks all steps and pushes `refs/pstack/local-ci-green`; teammates check `--steps` in `config.json`.
- State, events, lock, config: `<git-common-dir>/plate-local-ci/`; logs: `docs/plans/artifacts/local-ci/<day>/`.
- Non-app `.md`-only commits (with zero reds) skip `--deep` and emit `green` (`skipped: "md-only"`). `.agents/**` or `content/docs/**`-only changes run `pnpm check --affected --base <state.tip>`.
- Failures rerun failing test files (or the step) to separate flakes from reds, then bisect within 1h (`PLITE_BROWSER_KEEP_GOING=1`). Flakes stay defects until timing/load dependence is gone.
- Each red/flake wakes `operator` for the 3-step green-convergence loop (never cut Yjs tests, park, retry, or raise limits).
- Three starts of one failure in 7d record a `recurrence` event (`red-recurrence.mjs`) for a `/pstack:correct` guard.
- `beta-release.mjs wake` emits `release` after green when a daily beta is due. Nothing here posts to Discord.

Run from `<main>` (`.claude/worktrees/local-ci/tooling/scripts/local-ci.mjs` for CI; `<main>/tooling/scripts/local-ci.mjs` for `friction`). `$ARGUMENTS`: none/`supervise` -> **Keep watching**; `release` -> **Release brief** (skip due check); `status`, `rerun`, `install`, `uninstall` -> below.

## status

Run `node .claude/worktrees/local-ci/tooling/scripts/local-ci.mjs status`. Report launchd state, steps, author email, last run/green, newest events (step, culprit/range, log), `red now:`, and 14d time-to-green.

## rerun

1. Run `node .claude/worktrees/local-ci/tooling/scripts/local-ci.mjs run --force` in background (`run --full` for daily fresh).
2. For another commit without side effects: `run --ref <sha> --green <last-green> [--step <name>] --dry`.
3. Run `status` on exit and report.

## install and uninstall

Run `node .claude/worktrees/local-ci/tooling/scripts/local-ci.mjs install` (or `node tooling/scripts/local-ci.mjs install` first) for `dev.plate.local-ci`, `uninstall` to remove. Main CI (zbeyens) omits `--steps`; teammates pass `--steps <a,b>` (needs `git config user.email`). Confirm: `launchctl print gui/$(id -u)/dev.plate.local-ci`.

## Keep watching

Keep one pinned `operator` T3 Code thread (own worktree, commands prefixed `cd <main> && `). Prompt: `"Read <main>/.claude/worktrees/local-ci/.agents/skills/operator/SKILL.md in full and run watch mode. Prefix every <main> shell call with cd <main> && ."`

1. If this thread is already titled `operator`, run `watch` here.
2. Search for an unarchived `operator` thread (or legacy `Local CI`, renaming it to `operator` via `t3_thread_update`). If it is mid-turn, stop; if idle, send the prompt via `t3_thread_send` and stop.
3. Otherwise launch a fresh worktree thread titled `operator` with `t3_thread_launch`, send the prompt, and pin it via `t3_thread_organize(action: "pin")`.

## watch

Never edit or land directly. Local CI caps: 3 fix agents (max 1 heavy: `plite-browser` or any `light` step), 1 release, 1 friction judge; subagents (`invoke_subagent`/`delegate_task`) are unlimited. Spawn workers via `invoke_subagent` (or `delegate_task` for isolation), inheriting lead model and effort (escalate a failed 1st fix once to Neon `@xhigh`). Let `<ci>` = `node .claude/worktrees/local-ci/tooling/scripts/local-ci.mjs` and `<friction>` = `node tooling/scripts/local-ci.mjs friction`.

Read effective `maxAutoStart` from `readProjectConfig()` in `.agents/pstack/lead.mjs` (merges `.agents/pstack.json` with main checkout's gitignored `.agents/pstack.local.json`, default `0`).

1. First loop: note ISO time, run step 3, then start `<ci> wait --after <last-at>` in background.
2. Handle each waking JSON event, then run step 3:
   - `green` (main CI, tip `T` = `event.tip`): scan unarchived, non-pinned, non-running T3 threads titled `⏳ ...` or `🔴 ...` (settled included). For each whose landed commit (`Session:` trailer or last landed SHA) is an ancestor of `T` with no newer unverified commit, read its latest reply: if an owner question or optional go/stop call remains, rename to `🟠 <name>` and `unsettle` if settled; else strip `⏳`/`🔴` via `t3_thread_update` and `archive` via `t3_thread_organize`. Never touch pinned (`pinned: true`/`📌`) or running threads.
   - `red`/`flake` (`wake: true`): queue 1 event per step; prioritize big reds (`failures.length >= 3` with bisected `culprit`). On `red` with bisected `culprit` and `event.session`, `unsettle`/`unarchive`/`mark_unread` if needed, rename to `🔴 <name>` (skip pinned), and wake via `t3_thread_send` per the 3-step loop. Track attempts per streak: 1st runs normal fix; escalate 2nd once to Neon `@xhigh` if still red with no clean revert.
   - `passed`: drop from queue and message any running fix on that step to recheck and close.
   - `dry: true`: spawn **Dry brief**.
   - `broken`: check `output` and `plate-local-ci/launchd.log`; if install broke, run `pnpm install --frozen-lockfile` in `.claude/worktrees/local-ci`, else report without Discord.
   - `release`: main CI only (drop if `config.json` exists or release runs); spawn **Release brief**.
   - `friction`: continue to step 3.
   - **Agent friction (`FRICTION [tooling|skill|pstack|t3]`):** deduplicate by signature (file/command/error); if a fix runs, append new `blocking: yes` `threadId`s to its wakeup list. For `plate`/`ustack` fixes, spawn **Agent friction fix brief**, land on `origin/next` (or push `ustack` `main`), and wake paused reporters via `t3_thread_send` (`"Fixed in <sha>, pull origin/next and resume"`). For external T3 bugs, log once in `<main>/docs/plans/artifacts/local-ci/<day>/t3-friction.md` and reply to `blocking: yes` reporters with a fallback or clean stop.
3. Dispatch:
   - **P0 Local CI reds (exempt from `maxAutoStart`):** fill up to 3 fix agents from the red queue (1 per step, max 1 heavy) using **Fix brief**.
   - **Friction:** if 0 fixes run and red queue is empty, run `<friction> next`; if `item`, run `<friction> start --item <id>` and spawn **Friction fix brief**. If no judge runs and `<friction> next` shows `unjudged`/`stuck`, spawn **Friction brief**.
   - **Opt-in auto-start (`maxAutoStart > 0` only):** launch zero threads when `maxAutoStart === 0`, and pause P1 to P3 launches while `>= 2` Local CI steps are red. Count active non-pinned top-level `🥔` threads (`active`); while `active < maxAutoStart` and red steps `< 2`, launch via `t3_thread_launch` (`workspaceStrategy: { type: "worktree", baseRef: "origin/next", startFromOrigin: true }`) at `gemini-4-neon @high` (reserve `@xhigh` for `arena`, stuck debugging after `high` fails, or deep pivots) in priority order:
     1. **P1 Team sweep (`plate-private`/Beta):** run `pnpm triage claim --next --repo plate-private` first (atomic `refs/triage/claims` + GitHub assignee; skips claimed work, zero claim commits on `origin/next`), then launch `triage fix <domain>`.
     2. **P2 Active roadmaps:** manual `/start` threads by the owner (counted in `active`).
     3. **P3 Background fill:** check live T3 threads first to avoid duplicates, then pick: `node tooling/scripts/relapse.mjs` (`card` scopes) -> `<main>/docs/plans/artifacts/queue.tsv` (P0 then P1, ignore rows >14d old) -> `node tooling/scripts/review-ledger.mjs due` (max 2 concurrent verdicts; large new roadmaps stop at `🟠`).
4. Repeat from step 1 with newest handled event's `at`.

Save reports to `<main>/docs/plans/artifacts/local-ci/<day>/` (`fix-<step>.md`, `fix-friction-<id>-<HHMMSS>.md`, `release-<day>.md`, `friction-<HHMMSS>.md`), run `<friction> failed --item <id>` after friction fixes, run step 3, and reply with 1 line per finished agent plus active steps and queued reds.

### Fix brief

> Local CI found `<step>` failing on `next`. Event: `<event JSON>`. Work from `<main>`; read `AGENTS.md` and `operator` first.
> 1. Cut a fresh worktree from `origin/next`. For `red`, run `pnpm check <step>`; if green, stop and report green. For `flake`, remove timing/load dependence and prove with 5 warm retry-free runs.
> 2. Follow the 3-step green-convergence loop (never cut Yjs tests, park, retry, or raise limits):
>    - **Big red (`failures.length >= 3` with bisected `culprit`):** try clean code-only `git revert <culprit>` (+ `Lands-With:` companion, skipping `docs/plans/` and `.decisions.tsv` conflicts). If clean and `typecheck` + `pnpm check <step>` pass, land via `land.mjs` and message `event.session` (`t3_thread_send` if active/idle) with failure log and revert SHA to pivot and re-land.
>    - **Small red (1 to 2 failures), unknown `culprit`, or tangled revert (real code/type conflict with later commits):** abort conflicting revert. If `event.session` is live/idle and owns `culprit`, message via `t3_thread_send` with failure log; else run `.agents/playbooks/bug-fix.md` for the best reversible fix (fix forward, update stale test, or cut bad test) and land via `land.mjs`.
>    - **Failed 1st fix attempt (still red with no clean revert):** escalate once to Neon `@xhigh` to fix root cause, pivot, or cleanly revert. Never silently freeze the release lane; alert owner in-thread only if a genuinely irreversible product decision blocks green.
> 3. Send no team message. End with 1 line: step and commit (or woken session), or why still open.

### Dry brief

> Local CI dry proof for `<step>`: `<event JSON>`. Read event and log; reply in 1 paragraph with step, culprit/range, log, and first fix. Edit, land, and message nothing.

### Release brief

> Operator woke for a beta: `<event JSON>`. Work from `<main>`; read `AGENTS.md`, `release-lanes`, `changeset`.
> 1. Cut worktree from `origin/next`, run `node tooling/scripts/beta-release.mjs due` (stop if not due).
> 2. Run `beta-release.mjs pending`, condense changesets per `changeset`; if changed, land `chore(release): condense changesets` via `land.mjs`.
> 3. Run `node tooling/scripts/beta-release.mjs ship --force` in background (`release.yml` closes fixed public issues; `ship` runs `close-released-issues.mjs` fallback; retry on exit 75).
> 4. Send no team message. End with 1 line: beta and closed issues, or why none shipped.

### Friction brief

> Judge zbot friction via `node <main>/tooling/scripts/local-ci.mjs friction`. Work from `<main>`; edit no files, land nothing, send no messages.
> 1. Run `friction list` and `git -C <main> fetch --quiet origin next`; read files via `git show origin/next:<path>`.
> 2. Classify each `unjudged` line (`<report>-<n>`): `fixed` (`same`/`commit`/`fix`), `chip` (queued in `<main>/docs/plans/artifacts/queue.tsv` with id `q_<hex>` for product bug, zbot/zstack, or owner call), or `dropped` (`reason`).
> 3. Submit all verdicts in one `friction judged` stdin JSON call (`{"verdicts":[...]}`).
> 4. For any `stuck` item, append a row to `<main>/docs/plans/artifacts/queue.tsv` and run `friction done --item <id> --task <queue-id>`.
> 5. End with 1 line per judged line and stuck item.

### Friction fix brief

> Fix queued zbot friction `<item JSON>` via `node <main>/tooling/scripts/local-ci.mjs friction`.
> 1. Cut worktree from `origin/next` (or owning repo's main). If fixed, run `friction done --item <id> --commit <sha>` and stop.
> 2. If `after` is set and persists, run `/pstack:correct` on its class; else fix the skill/rule/script/helper.
> 3. Land via `land.mjs` (or owning repo rules), then run `friction done --item <id> --commit <sha>` (if unlandable, append a row to `<main>/docs/plans/artifacts/queue.tsv` and run `friction done --item <id> --task <queue-id>`).
> 4. Send no team message. End with 1 line: commit or queue id, and why.

### Agent friction fix brief

> Fix agent-reported friction `<FRICTION message>` (signature `<sig>`). Work from `<main>`; read `AGENTS.md` and `operator` first.
> 1. If the failure is an external T3 app bug outside `plate` and `ustack`, edit nothing and reply `external-t3: <summary and fallback>`.
> 2. Otherwise cut a fresh worktree from `origin/next` (or edit `ustack` in place on `main` per `ustack/AGENTS.md` and sync `plate` via `sync-pstack.mjs apply`). Fix the root cause with a focused test and verify all affected checks.
> 3. Land via `land.mjs` (or push `ustack` `main`). Send no team message. End with 1 line: `fixed: <sha>` (plus synced `plate` SHA if applicable) or `blocked: <why>`.
