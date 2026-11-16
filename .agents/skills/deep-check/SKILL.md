---
description: Run and watch the deep lane, the slow check steps that run on next after landing instead of before it. Use for /deep-check, "is next green", "deep check status", "rerun the deep check", installing or removing its launchd job on a Mac, starting the watcher session that starts a fix for a red step, being that watcher, and when a deep-check task or a "Deep check:" team message names a red step.
argument-hint: status | rerun | install | uninstall | supervise | watch
name: deep-check
metadata:
  skiller:
    source: .agents/rules/deep-check.mdc
---

# Deep check

`pnpm check --affected`, which every landing runs, runs only the steps marked `land` in `tooling/scripts/check.mjs`: `typecheck`, the fast test files and the checks that take a second or two. The deep lane runs every other step on the newest `origin/next`, the slow test files, the formal checks and the whole-repo lint included, with the steps `--build --browser` add. `tooling/scripts/deep-check.mjs` is the lane:

- A launchd job runs `deep-check.mjs run` every 20 minutes on one Mac. A run exits at once when another run holds the lock or next has not moved. Once a day, the first run after 04:00 runs `--build --browser --reads` with fresh seeds instead.
- A run checks next in the persistent worktree `<main checkout>/.claude/worktrees/deep-check`, through `proof.mjs` under the one-hour budget. On green it pushes `refs/pstack/deep-green` forward.
- A red step reruns alone. A step that passes alone is a flake, and its second flake in a row is reported. A step that fails alone gets its first bad commit searched for from the last green commit, while the hour lasts.
- A report offers a P1 task under topic `deep-check` and posts one line to the dev role. While that task is open the runner stays quiet, except for one post when the step has been red for 3 hours.
- The runner keeps `state.json`, `events.jsonl` and its lock in `plate-deep-check/` in the git common directory, and its logs in `docs/plans/artifacts/deep-check/<day>/`.

Run every command below from the main checkout. Pick the mode from $ARGUMENTS, and use `status` when it names none.

## status

Run `node tooling/scripts/deep-check.mjs status`. Report whether the job is loaded and running, the last run, the last green commit and the newest events. For a red event, also name its step, its first bad commit or the range still unsearched, and its log.

## rerun

1. Run `node tooling/scripts/deep-check.mjs run --force` in the background. It checks next even when the last run already did, and it takes up to an hour. Use `run --full` for the daily fresh run.
2. To check a commit other than next's tip, run `run --ref <sha> --green <last green sha> [--step <name>] --dry`. `--dry` writes the event only: no ref push, task or message.
3. When it exits, run `status` and report what the run found.

## install and uninstall

`node tooling/scripts/deep-check.mjs install` writes the `dev.plate.deep-check` launchd agent and loads it, and `uninstall` removes it. Install on one Mac only, because two Macs would check the same commits twice. Confirm with `launchctl print gui/$(id -u)/dev.plate.deep-check`.

## supervise

Start the watcher, a session that stays open and starts a fix for each red step. The owner chose Sonnet at medium for it, as `AGENTS.md`'s Plate overrides say.

1. Call `mcp__ccd_session_mgmt__list_sessions` and look for a running session titled "Deep check watcher". When one exists, report it and stop.
2. Start it with `mcp__ccd_session__start_session`: `initiation: "user_asked"`, `context: "fresh"`, `title: "Deep check watcher"`, `model: "claude-sonnet-5-5"`, `effort: "medium"`, `cwd` set to the main checkout, `use_worktree: false`, and the prompt `/deep-check watch`.
3. Pin it with `mcp__ccd_sidebar__set_pinned`, so automatic archiving keeps it.

## watch

The watcher's loop. It reads events and starts sessions. It never edits, lands or fixes code itself, and it keeps each turn short.

1. Run `node tooling/scripts/deep-check.mjs wait --after <time>` with the Bash tool's `run_in_background`. `<time>` is the `at` of the last event this session handled, or the current time in ISO form on the first loop. The command exits when the runner writes an event the watcher acts on and prints one JSON line per event. The session wakes when it exits.
2. Handle each printed event:
   - `kind: "red"` or `kind: "flake"` with `wake: true`: run the `plate-fix-red` scheduled task with `mcp__scheduled-tasks__run_scheduled_task`. When the call is refused because a run is already going, do nothing more, because that run takes every open deep-check task. When it is refused for another reason, the task already waits on the board as a card, so send nothing.
   - `dry: true`: run `plate-fix-red` the same way. That run reports without landing.
   - `kind: "broken"`: the runner could not check out or run next. Read its `output` and `launchd.log` in `plate-deep-check/`. When the cause is the deep worktree's install, run `node .agents/pstack/setup.mjs --install 'pnpm install'` inside that worktree. Otherwise send one line to the dev role through the `notify` skill that names the cause.
3. Go back to step 1 with the newest handled event's `at`.

The `plate-fix-red` run starts on Opus 5.5 at xhigh. A scheduled task cannot set its own model or effort, and xhigh is the level a scheduled run starts at.
