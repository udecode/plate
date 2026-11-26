---
name: chips
description: "Run the project's suggested-task ledger: /chips, /chips all, /chips sync, offer, start, drop, merge duplicates, or settle stale tasks. Use for suggested tasks, open chips, and whenever pstack would file a follow-up or out-of-band PR."
argument-hint: '[offer <finding> | start <id> | drop <id>]'
---

# Chips

Suggested tasks ("chips") follow `.agents/pstack/rules/chips.md` (ledger paths, token grammar, priority/`via:`, ownership, card limits, landing). Read it in full before the first ledger write unless a card brief already carries its rules.

Run ledger commands with `node .agents/pstack/decisions-check.mjs <command>`, passing `--session <id>` on board reads when the runtime has a session tool.

| Mode | Purpose |
| --- | --- |
| [Sweep](#sweep) (`/chips`, `/chips all`, `/chips sync`, `/chips codex`) | Reconcile open tasks, settle stale/dup rows, card Ready tasks (`sync` skips cards; `all` adds ship-list, unowned tasks, `chips groups`; `codex` sets Codex handoff outside trunk). |
| [Offer](#offer) | Add a new task per `chips.md` priority and `via:` rules. |
| [Close](#close) | Card this run's Ready offers at final hand-back (no full sweep). |
| [Start](#start) | Start a card session or `start <id>` run. |
| [Drop](#drop) | Record an owner drop request. |

For read-only questions ("what's next", "is chip X worth doing"), run `chips` and `chips stale`, judge from code, and report without logging rows or cards.

## Sweep

1. **Read board and clean up.** In trunk delivery, run `node .agents/pstack/setup.mjs` from the main checkout first. Run `chips --session <id>` (or `chips sync`) and `chips stale`. When a session-list tool exists, dump all sessions (including archived) as JSON in the run directory and run `chips cleanup --sessions <file> --session <id>`: fix unsettled friction from Archive/Keep reports, archive Archive sessions, rerun `chips cleanup`, and run its printed `scan.mjs --remove`. Under `/chips all`, re-read with `chips all --session <id> --sessions <file>`.
2. **Apply Do-list passes** in one `append --from <file>` batch until only Card pass or stale-plan items remain:
   - *Withdrawal:* dismiss each named card and log `started`, `dismissed declined`, or `uncarded`.
   - *Ledger:* log merges/folds, verify repro before P0/P1, and add `review-scope:` on ship offers. Defer stale-plan items to step 4.
   - *Check:* inspect referenced sessions and log settled rows; leave unresolved ones started for step 6.
3. **Judge stale items** in one batch:
   - Fixed -> `dismissed done` citing commit(s).
   - Deleted target -> `dismissed superseded` (verify companion repo); moved/missing path -> `updated` with real path.
   - Closed unmerged PR wait -> `updated` waits.
   - Out-of-domain or hook-offered task owned here -> withdraw own card, `updated` with `session: none`.
   - Duplicate (2 shared evidence types and 1 fix removes both) -> `dismissed dup` (or `waits: task:<keeper>` if keeper is active).
   - Started task committed -> `landed`.
   - Thin finding -> `folded` with source finding (withdraw own card first).
   - Missing `review-scope:`, wrong `priority:`, or closed ship item -> `updated` or `dismissed done`.
   - Under `/chips all`, run `chips groups` and settle each pair (`dismissed dup`, `apart` + `waits`, or separate topics).
4. **Re-run step 2** including stale-plan items.
5. **Card pass** (skip under `/chips sync`): check dependencies, effort, and active-plan `writes:` collisions (`waits: run:<plan>` instead of carding). Offer cards in one turn per `chips.md`, then batch-log `carded` (`codex: always` under `/chips codex`).
6. **Report:** cleanup results and kept worktrees, stale plans, rows logged, Ready (`start <id>` for uncarded), started (`drop <id>`), waiting by blocker, fast work owed review, and commit links. Settle open questions from repo law or offer a P0/P1 `decide` task.

## Offer

Follow `chips.md` for priority, `via:`, and token rules; put other P2/P3 side findings in `## Open work` or the reply.

1. Run `chips --session <id>` and `chips brief <id>` on related open tasks.
2. Log `folded` on an uncarded match, offer with `waits: task:<id>` if the match is started/carded, or mint `chips id` and offer with all tokens `chips.md` requires (plus `waits: run:<plan>` on colliding active plans).
3. Append via `append <ledger> chip "<id> <title>" "<finding>" "<tokens>" <result>`.
4. Defer carding to [Close](#close).

## Close

At final hand-back after landing, closing the plan, and fixing friction:

1. Check each task offered in this run via `chips brief <id>`; batch-add missing `waits:` or `apart` rows.
2. Card Ready, non-deferred, in-domain offers per `chips.md`, then batch-log `carded`.
3. Add the closing summary line from `chips.md` right above the link list.

## Start

Run before editing in a card session or `start <id>` run. In T3 Code, launch a standalone user-picked chip via `t3_thread_launch` in its own worktree (`workspaceStrategy`), replacing Claude Desktop's `start_session`/`detach_session`; run a quick in-topic chip in-thread or via `invoke_subagent` (`Model: "inherit"`).

1. Run `chips brief <id>` and follow its brief.
2. If `State:` is neither Ready nor Started, report it and stop.
3. Log `started` with `session: <id>` and missing `writes:`, then re-read `chips brief <id>`. Note if session effort exceeds brief effort.
4. Log another `started` row before editing any unlisted path.
5. Finish per `chips.md` Card landing, run [Close](#close) on offered tasks, and mark the worktree via `scan.mjs --landed`.

## Drop

- Started task -> `dismissed stopped`.
- Card held by this session -> dismiss card; log `started` if already started, else `dismissed declined` with `card:`.
- Card held by another session -> `dismissed declined` with `card:`.
- No card -> `dismissed declined`.
