---
description: Run Local CI (post-landing slow and formal checks on next), check status, rerun, manage its Mac launchd job, and run the persistent operator session that dispatches fix, beta release, and zbot or agent friction workers. Use for /operator, /local-ci, "is next green", "Local CI status", "rerun Local CI", "keep watching", "release a beta now", or a red local-ci task.
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
- Failures rerun failing test files (or the step) to separate flakes from reds, then bisect within 1h (`PLITE_BROWSER_KEEP_GOING=1`). Flakes stay defects until timing/load dependence is gone.
- Each red/flake offers a P0 `local-ci` task (`refs/pstack/ledger`) and wakes `operator` for the 3-step green-convergence loop (never cut Yjs tests, park, retry, raise limits, or freeze on a P0 `decide` chip).
- Three starts of one failure in 7d offer a P3 `red-recurrence` task (`red-recurrence.mjs`) to add an earlier guard via `/pstack:correct`.
- `beta-release.mjs wake` emits `release` after green when a daily beta is due. Nothing here posts to Discord.

Run from `<main>` (`.claude/worktrees/local-ci/tooling/scripts/local-ci.mjs` for CI; `<main>/tooling/scripts/local-ci.mjs` for fallback `friction`). `$ARGUMENTS`: none/`supervise` -> **Keep watching**; `release` -> **Release brief** (skip due check); `status`, `rerun`, `install`, `uninstall` -> below.

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

Never edit or land directly. Caps: 3 fix agents (max 1 heavy: `plite-browser` or any `check.mjs` step with `light`), 1 release, 1 friction worker. Spawn workers via `invoke_subagent` (or `delegate_task` for an isolated thread) in the background, inheriting the lead's model and effort (escalate a failed 1st fix attempt once to Neon `@xhigh`). Let `<ci>` = `node .claude/worktrees/local-ci/tooling/scripts/local-ci.mjs` and `<friction>` = `node tooling/scripts/local-ci.mjs friction`.

1. First loop: note ISO time, run step 3, then start `<ci> wait --after <last-at>` in background.
2. Handle each waking JSON event, then run step 3:
   - `green` (main CI, tip `T` = `event.tip`): scan unarchived, non-pinned, non-running T3 threads titled `⏳ ...` or `🔴 ...` (including settled ones). For each thread whose landed commit (from its `Session:` trailer in `git log` or last landed SHA) is an ancestor of `T` (`git merge-base --is-ancestor <sha> <T>`) with no newer unverified commit after `T`, read its latest reply first: if it leaves an unanswered owner question or optional go/stop call, rename it to `🟠 <name>` via `t3_thread_update` and leave it unarchived and unsettled (calling `t3_thread_organize(action: "unsettle")` if settled); otherwise strip the `⏳`/`🔴` prefix via `t3_thread_update` (`action: "rename"`) and call `t3_thread_organize(action: "archive")`. Never touch pinned threads (`pinned: true` or `📌`) or running threads.
   - `red`/`flake` (`wake: true`): keep 1 queued event per step; drop if `startedIn` is active (`lastActivityAt` < 2h); prioritize big reds (`failures.length >= 3` with bisected `culprit`). On `red` with bisected `culprit` and `event.session`, call `t3_thread_organize(action: "unsettle")` (in case the landed `⏳` thread self-settled), `t3_thread_organize(action: "unarchive")` and `t3_thread_organize(action: "mark_unread")` if needed, rename `event.session` to `🔴 <name>` via `t3_thread_update` (skipping pinned threads), and wake it via `t3_thread_send` per the 3-step green-convergence loop. Track attempts per streak: 1st runs normal fix; if still red with no clean revert, escalate 2nd once to Neon `@xhigh`. Never freeze on `decide`.
   - `passed`: drop from queue and message any running fix on that step to recheck and close.
   - `dry: true`: spawn **Dry brief**.
   - `broken`: check `output` and `plate-local-ci/launchd.log`; if install broke, run `pnpm install --frozen-lockfile` in `.claude/worktrees/local-ci`, else report without Discord.
   - `release`: main CI only (drop if `config.json` exists or release runs); spawn **Release brief**.
   - `friction`: fallback queue event from `events.jsonl` (only when `t3 thread send` fails); continue to step 3.
   - **Friction (`FRICTION [tooling|skill|pstack|t3|zbot]`):** `FRICTION [zbot]` arrives on the same `FRICTION` pipe as T3 workers. Deduplicate every report by `(file, error)` for 24h in `<main>/docs/plans/artifacts/local-ci/friction-seen.json`: if an active or <24h entry matches, skip spawning a duplicate worker (append any `blocking: yes` reporter `threadId` to its wakeup list, or reply immediately if already fixed). Otherwise record it and spawn one bounded `self` subagent (`Model: "inherit"`) with **Friction fix brief** to verify, fix, test, and land (or drop as invalid) in a single pass. Once fixed, wake every paused `blocking: yes` reporter via `t3_thread_send` (`"Fixed in <sha>, pull origin/next and resume"`). For external T3 app bugs outside `plate` and `ustack`, record once in `<main>/docs/plans/artifacts/local-ci/<day>/t3-friction.md` and immediately reply to any `blocking: yes` reporter with a fallback or clean stop.
   - **Friction safety rail:** auto-fix broken scripts/tests, stale rules/skills, hook false positives, and `zbot-shot`/`clip` bugs. Never auto-fix sandbox or security loosening (`bot-settings.json`, `fetch-guard.mjs`, access lists) or product architecture calls; flag `🟠` for the owner instead.
3. Dispatch:
   - Fill up to 3 fix agents from the red queue (1 per step, max 1 heavy) using **Fix brief**.
   - If no friction worker runs and `<friction> next` holds a fallback `events.jsonl` item or unjudged report, spawn one bounded `self` subagent (`Model: "inherit"`) with **Friction fix brief**.
4. Repeat from step 1 with newest handled event's `at`.

Save reports to `<main>/docs/plans/artifacts/local-ci/<day>/` (`fix-<task-or-step>.md`, `fix-friction-<id>-<HHMMSS>.md`, `release-<day>.md`), run `<friction> failed --item <id>` after fallback queue friction fixes, run step 3, and reply with 1 line per finished agent plus active steps and queued reds.

### Fix brief

> Local CI found `<step>` failing on `next`. Event: `<event JSON>`. Work from `<main>`; read `AGENTS.md` and `operator` first.
> 1. Load `chips`, start `<task id>` (or open `local-ci` task for `<step>`), and cut a fresh worktree from `origin/next`. For `red`, run `pnpm check <step>`; if green, dismiss `<task id>` as `dismissed done` and stop. For `flake`, remove timing/load dependence and prove with 5 warm retry-free runs.
> 2. Follow the 3-step green-convergence loop (never cut Yjs tests, park, retry, or raise limits):
>    - **Big red (`failures.length >= 3` with bisected `culprit`):** try clean code-only `git revert <culprit>` (+ `Lands-With:` companion, skipping `docs/plans/` and `.decisions.tsv` conflicts). If clean and `typecheck` + `pnpm check <step>` pass, land via `land.mjs` and message `event.session` (`t3_thread_send` if active/idle, else log a follow-up chip naming the reverted commit) with failure log and revert SHA to pivot and re-land.
>    - **Small red (1 to 2 failures), unknown `culprit`, or tangled revert (real code/type conflict with later commits):** abort conflicting revert. If `event.session` is live/idle and owns `culprit`, message via `t3_thread_send` with failure log; else run `.agents/playbooks/bug-fix.md` for the best reversible fix (fix forward, update stale test, or cut bad test) and land via `land.mjs`.
>    - **Failed 1st fix attempt (still red with no clean revert):** escalate once to Neon `@xhigh` to fix root cause, pivot, or cleanly revert. Never silently freeze the release lane on a P0 `decide` chip; alert owner in-thread only if a genuinely irreversible product decision blocks green.
> 3. Send no team message. End with 1 line: step and commit (or woken session), or why still open.

### Dry brief

> Local CI dry proof for `<step>`: `<event JSON>`. Read event and log; reply in 1 paragraph with step, culprit/range, log, and first fix. Edit, land, and message nothing.

### Release brief

> Operator woke for a beta: `<event JSON>`. Work from `<main>`; read `AGENTS.md`, `release-lanes`, `changeset`.
> 1. Cut worktree from `origin/next`, run `node tooling/scripts/beta-release.mjs due` (stop if not due).
> 2. Run `beta-release.mjs pending`, condense changesets per `changeset`; if changed, land `chore(release): condense changesets` via `land.mjs`.
> 3. Run `node tooling/scripts/beta-release.mjs ship --force` in background (`release.yml` closes fixed public issues; `ship` runs `close-released-issues.mjs` fallback; retry on exit 75).
> 4. Send no team message. End with 1 line: beta and closed issues, or why none shipped.

### Friction fix brief

> Verify and resolve `<FRICTION message or fallback item>` (keyed by `(file, error)`) in one pass as a `self` subagent (`Model: "inherit"`). Work from `<main>`; read `AGENTS.md` and `operator` first.
> 1. **Safety rail:** auto-fix only broken scripts/tests, stale rules/skills, hook false positives, and `zbot-shot`/`clip` bugs. Never loosen sandbox or security controls (`bot-settings.json`, `fetch-guard.mjs`, access lists) or make product architecture calls; edit nothing and reply `owner-call: <why>` so `operator` flags `🟠`. For external T3 app bugs outside `plate` and `ustack`, edit nothing and reply `external-t3: <summary and fallback>`.
> 2. Verify against `origin/next` (or owning repo `main`). If invalid, already fixed, or ruled out by an owner decision, edit nothing and reply `dropped: <reason or commit>`.
> 3. Cut a fresh worktree from `origin/next` (or edit `ustack` in place on `main` per `ustack/AGENTS.md` and sync `plate` via `sync-pstack.mjs apply`, or `zstack` on `main` for `zbot-shot`/`clip`). Fix the root cause, verify with a focused test and affected checks, and land via `land.mjs` (or owning repo rules). Close any fallback `<friction>` queue item via `<friction> done --item <id> --commit <sha>`.
> 4. Send no team message. End with 1 line: `fixed: <sha>`, `dropped: <reason>`, `owner-call: <why>`, or `external-t3: <summary>`.
