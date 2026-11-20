---
description: Run and watch Local CI, the slow check steps that run on next after landing instead of before it. Use for /local-ci, "is next green", "Local CI status", "rerun Local CI", the old name "deep check", installing or removing its launchd job on a Mac, starting the watcher session that starts a fix for a red step, being that watcher, and when a local-ci task names a red step.
argument-hint: '[status | rerun | install | uninstall | watch]'
name: local-ci
metadata:
  skiller:
    source: .agents/rules/local-ci.mdc
---

# Local CI

`pnpm check --affected`, which every landing runs, runs only the steps marked `land` in `tooling/scripts/check.mjs`: `typecheck`, the fast test files, the plitejs, platejs and @platejs/test test files that import a changed file directly, the checks that take a second or two, and the `knowledge` and `api-reference` checks, which take under a minute. Local CI runs every other step on the newest `origin/next`, the slow test files, the formal checks and the whole-repo lint included, with the steps `--build --browser` add. `tooling/scripts/local-ci.mjs` is the lane:

- A launchd job runs `local-ci.mjs run` every 20 minutes on one Mac. A run exits at once when another run holds the lock or next has not moved. Once a day, the first run after 04:00 runs `--build --browser --reads` with fresh seeds instead.
- A run moves the persistent worktree `<main checkout>/.claude/worktrees/local-ci` and its private half to the newest next, and the job runs that worktree's copy of the script, so a fix to it reaches the job when it lands. A run checks next there, through `proof.mjs` under the one-hour budget. On green it pushes `refs/pstack/local-ci-green` forward.
- A step that fails with only the failures the run before reported is the same red, so it reruns nothing and keeps that run's first bad commit. In one week, 58 of 68 reruns only confirmed such a red. A step with a new failure reruns only its failed test files when its runner takes files, and reruns alone otherwise. A step that passes its rerun is a flake. Local CI reports every flake, because a test that fails only sometimes depends on timing or host load, which is a defect to fix like any red (owner's word, 2026-11-20). A later pass does not dismiss a flake's task. A step still running when the hour runs out reruns alone, and passing alone clears it, because it never failed. A step that fails its rerun gets its first bad commit searched for from the last commit that step passed on, while the hour lasts. The search judges each commit by the new failures, so it finds a culprit even while other steps keep next red.
- `.agents/expected-failures.json` lists the failures a step may have while their owner task stays open, each as `{ "step", "file", "test", "owner" }`. `file` is the test file's path from the repository root, or null when the step's output names no file, and `test` is the test's full name, as `tooling/scripts/step-failures.mjs` reads them from the step's output. A red event's `failures` names each failure as `<file> › <test>`. `owner` is the id of an open task on the suggested-task ledger, and a line whose task closed no longer holds. `pnpm check` passes a step whose only failures the list names, and fails it when a listed failure stops failing, so the fix that clears one removes its line. A run of named test files judges only the listed failures in those files. A step whose output names no failure key, such as a formal check, has nothing to list.
- A report offers a P0 task under topic `local-ci` that owns the red step, and the watcher starts its fix. While that task stays open, the step's reds wake the watcher again once six hours pass with no ledger row or wake for the task, because a fix that dies with its session, such as in an app restart, leaves the task open with nobody working on it. When a step that was red in the last run passes, the run writes a `passed` event and dismisses the step's offered task, because a fix for another step already cleared it. Nothing in the lane posts to the team channel: not the runner, the watcher or the fix run (owner's word, 2026-11-17). `status` and the board show what is red.
- Each red gets its own fix task, but a failure that keeps coming back shows that no check before landing catches its kind of break, so it also gets one task that adds that check. A failure is a step and one test file its output names, or the step alone when the output names no file, such as for a formal check or a timeout. A failure starts when it fails in a run after a run where it did not fail, so a red that stays across runs starts once. When a failure starts in the newest run and has started three times in the last seven days, the run offers one P3 task for its step under topic `red-recurrence`. The task has `via: hook` and no owner, so `/chips all` cards it. That task finds what the failures share and adds the guard that would have caught them before landing, in the order `/pstack:correct` uses: the architecture or the types, then a lint, then a fast check in the landing list, then the skill or rule that let it through. A step gets no second such task while one is open. When that task closes, the count starts again after its last ledger row. `tooling/scripts/red-recurrence.mjs` counts the starts.
- The runner keeps `state.json`, `events.jsonl` and its lock in `plate-local-ci/` in the git common directory, and its logs in `docs/plans/artifacts/local-ci/<day>/`.

Run every command below from the main checkout. Each runs the Local CI worktree's copy of the script, because every run moves that copy to the newest next, while the main checkout's copy moves only when someone pulls there. Pick the mode from $ARGUMENTS. With none, or with `supervise`, run Keep watching.

## status

Run `node .claude/worktrees/local-ci/tooling/scripts/local-ci.mjs status`. Report whether the job is loaded and running, the last run, the last green commit and the newest events. For a red event, also name its step, its first bad commit or the range still unsearched, and its log. Report the `red now:` lines, which say how long each step has been red, and the time to green over the last 14 days.

## rerun

1. Run `node .claude/worktrees/local-ci/tooling/scripts/local-ci.mjs run --force` in the background. It checks next even when the last run already did, and it takes up to an hour. Use `run --full` for the daily fresh run.
2. To check a commit other than next's tip, run `run --ref <sha> --green <last green sha> [--step <name>] --dry`. `--dry` writes the event only: no ref push or task.
3. When it exits, run `status` and report what the run found.

## install and uninstall

`node .claude/worktrees/local-ci/tooling/scripts/local-ci.mjs install` writes the `dev.plate.local-ci` launchd agent and loads it, and `uninstall` removes it. When that worktree does not exist yet, run `node tooling/scripts/local-ci.mjs install` from a checkout that has the script; install makes the worktree at the newest next first. Install on one Mac only, because two Macs would check the same commits twice. Confirm with `launchctl print gui/$(id -u)/dev.plate.local-ci`.

## Keep watching

Make sure one watcher session is watching: a session that stays open and starts a fix for each red step, one at a time. Run it after the app quits or the Claude account changes, because the watcher's background wait ends with the app. The owner chose Sonnet at medium for the watcher, as `AGENTS.md`'s Plate overrides say. The watcher works in the main checkout, which can lag next, so its prompt is "Read `<main checkout>/.claude/worktrees/local-ci/.agents/skills/local-ci/SKILL.md` in full and run its watch mode.", with the main checkout's absolute path. That copy moves with every run.

1. Call `mcp__ccd_session_mgmt__get_session` with `"self"`. When this session's title is "Local CI", run `watch` here and stop.
2. Call `mcp__ccd_session_mgmt__list_sessions` and look for an unarchived session titled "Local CI". When it is mid-turn, report it and stop. When it is idle, send it the watcher prompt with `SendMessage` (`to`: its session id), which restarts its loop unless its wait still runs, report it and stop.
3. Otherwise start it with `mcp__ccd_session__start_session`: `initiation: "user_asked"`, `context: "fresh"`, `title: "Local CI"`, `model: "claude-sonnet-5-5"`, `effort: "medium"`, `cwd` set to the main checkout, `use_worktree: false`, and the watcher prompt. Pin it with `mcp__ccd_sidebar__set_pinned`, so automatic archiving keeps it.

## watch

The watcher's loop. It reads events and runs one fix subagent at a time, each for one red step. It never edits, lands or fixes code itself, and it keeps each turn short.

1. Unless a wait this session started is still running, run `node .claude/worktrees/local-ci/tooling/scripts/local-ci.mjs wait --after <time>` with the Bash tool's `run_in_background`. `<time>` is the `at` of the last event this session handled, or the current time in ISO form on the first loop. The command exits when the runner writes an event the watcher acts on and prints one JSON line per event. The session wakes when it exits.
2. Handle each printed event:
   - `kind: "red"` or `kind: "flake"` with `wake: true`: when no fix subagent is running, spawn one with the `Agent` tool: `subagent_type: "pstack:poteto-agent"`, `model: "opus"`, `effort: "high"`, `run_in_background: true`, and the Fix brief below filled in from the event. Otherwise add the event to the end of the queue. Each such event names one step and its open task. Only one fix subagent runs at a time (owner's word, 2026-11-18), because each one runs heavy checks, and two at once slow the host until steps time out.
   - `kind: "passed"`: next passes that step now, so drop its queued events. When the running fix subagent works on that step, tell it with `SendMessage` that next passes its step, so it rechecks and closes its task.
   - `dry: true`: spawn the same subagent with the Dry brief. It only reads, so it starts even while a fix runs.
   - `kind: "broken"`: the runner could not check out or run next. Read its `output` and `launchd.log` in `plate-local-ci/`. When the cause is the Local CI worktree's install, run `pnpm install --frozen-lockfile` inside that worktree; the next wake retries the tip. Otherwise say the cause in this session's reply and send no message.
3. When a fix subagent finishes, save its report to `docs/plans/artifacts/local-ci/<day>/fix-<task id or step>.md` in the main checkout. Then spawn a fix subagent for the first queued event, as step 2 says. Reply with one line per finished task: the step and the fix commit, or why it is still open. Add one line that lists the steps still queued, so the queue survives a compaction.
4. Go back to step 1 with the newest handled event's `at`.

Nothing in the lane posts to the team channel: not the runner, this watcher or a fix subagent (owner's word, 2026-11-17). The fix subagents run on Opus at high, the models sheet's bug-fix level, and each one ends with this session, so the watcher stays open and pinned.

### Fix brief

> Local CI found the `<step>` check step failing on Plate's `next` branch. Its event: `<the event's JSON line>`. Work from the main checkout `<main checkout path>`; read its `AGENTS.md` first and follow it, and load the `local-ci` skill for what the lane is.
>
> 1. Cut a new worktree of your own from `origin/next`. Never check out a branch in a worktree that already exists, because another session works there. For a `red` event, run `pnpm check <step>` in it. When it passes, an earlier fix already cleared the step, so load the `chips` skill, log task `<task id>` `dismissed done` and stop. For a `flake` event, a pass clears nothing. Read the event's log for each failing assertion and remove what makes that test depend on timing or host load, such as a wall-clock bound, a raised timeout or a fixed wait. Prove each failing test with five warm runs without retries.
> 2. Otherwise load the `chips` skill and start task `<task id>` as its Start mode says. When the event names no task, take the open task on the board whose topic is `local-ci` and whose title names `<step>`.
> 3. Run the Bug fix playbook (`.agents/playbooks/bug-fix.md`) in that worktree. Read the event's log, fix the cause forward and land through `node .agents/pstack/land.mjs`. When the fix clears a failure `.agents/expected-failures.json` lists, remove its line in the same commit. A revert needs the owner's word, so never revert the first bad commit on your own.
> 4. Send no team message. End with one line: the step and the fix commit, or why it is still open.

### Dry brief

> Local CI wrote a dry event for the `<step>` check step as a proof run: `<the event's JSON line>`. Read it and the log it names, and reply in one short paragraph with the step, the first bad commit or the range still unsearched, the log, and what you would fix first. Edit, land and message nothing.
