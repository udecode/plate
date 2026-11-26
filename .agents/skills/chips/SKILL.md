---
name: chips
description: "Run the project's suggested-task ledger: /chips, /chips all, /chips sync, offer, start, drop, merge duplicates, or settle stale tasks. Use for suggested tasks, open chips, and whenever pstack would file a follow-up or out-of-band PR."
argument-hint: '[offer <finding> | start <id> | drop <id>]'
---

# Chips

Suggested tasks ("chips") live in one ledger per project (`<plans>/artifacts/suggested-tasks.decisions.tsv` in trunk delivery, `<plans>/suggested-tasks.decisions.tsv` otherwise). The governing rule is `.agents/pstack/rules/chips.md`; read it in full before this session's first ledger write (except card sessions whose brief already carries its rules).

All commands below run `node .agents/pstack/decisions-check.mjs <command>` from the worktree or checkout (trunk helpers auto-target the main checkout). Pass `--session <id>` from the runtime's session tool on board reads; omit it when no session tool exists.

| Mode | Use it to |
| --- | --- |
| [Sweep](#sweep) (`/chips`, `/chips all`, `/chips sync`, `/chips codex`) | Reconcile open tasks, settle stale/duplicate rows, card Ready tasks (`sync` skips cards; `all` spans all priorities, ship-list, unowned tasks, and `chips groups`; `codex` sets Codex handoff outside trunk). |
| [Offer](#offer) | Add a new P0/P1 finding (or verdict/babysit/time-budget item in domain) to the ledger. |
| [Close](#close) | Card this run's own Ready offers at its last hand-back (no full sweep). |
| [Start](#start) | Start a task in a card session or via `start <id>`. |
| [Drop](#drop) | Record the owner's request to drop a task. |

For read-only questions about chips ("what's next", "is chip X worth doing"), run `chips` and `chips stale`, judge from code, and report without logging rows or offering cards.

## Sweep

1. **Read board & clean up landed card sessions.** In trunk delivery, run `node .agents/pstack/setup.mjs` from the main checkout first. Run `chips --session <id>` (or `chips sync --session <id>`) and `chips stale`. If the runtime has a session list tool, save all sessions (including archived) as JSON in the run directory and run `chips cleanup --sessions <file> --session <id>`: fix unsettled workflow friction from Archive/Keep reports, archive Archive sessions, rerun `chips cleanup`, and run its printed `scan.mjs --remove`. Under `/chips all`, re-read with `chips all --session <id> --sessions <file>`.
2. **Apply Do-list passes** in one `append --from <file>` batch and repeat until only Card pass or stale-plan items remain:
   - *Withdrawal pass:* dismiss each named card and log `started`, `dismissed declined`, or `uncarded` per tool result.
   - *Ledger pass:* log merges/folds (verified against `chips.md` dup rules), prioritize items (verify repro before claiming P0/P1), and ship offers (adding `review-scope:`). Defer stale-plan items to step 4.
   - *Check items:* inspect referenced sessions and log the settled row; leave unresolved sessions started and explain in step 6.
3. **Judge stale report items** in one batch:
   - Already fixed -> `dismissed done` citing commit(s).
   - Deleted target -> `dismissed superseded` (verify companion repo too before dismissing); moved/missing path -> `updated` with real path (or drop deleted path while target lives).
   - Closed unmerged PR wait -> `updated` waits.
   - Out-of-domain or hook-offered task owned by this session -> withdraw own card and set `updated` with `session: none`.
   - Duplicate question (2 shared evidence types + 1 fix removes both) -> merge via `dismissed dup` (or add `waits: task:<keeper>` if keeper is carded/started).
   - Started task already committed -> `landed`.
   - Thin finding -> `folded` with source finding (withdraw own card first).
   - Missing `review-scope:` or mismatched `priority:` / closed ship item -> `updated` or `dismissed done`.
   - Under `/chips all`, run `chips groups` and settle each pair (`dismissed dup`, `apart` + `waits`, or separate topics).
4. **Re-run step 2** including stale-plan items.
5. **Card pass** (skip under `/chips sync`): for each Do-list card, check dependencies, effort, and whether `writes:` collide with an active plan/topic (if so, add `waits: run:<plan>` instead of carding). Offer cards in one turn with `chips brief <id>` verbatim as prompt, first line as title, capped effort, and isolated worktree, then batch-log `carded` rows (add `codex: always` under `/chips codex`). Without a suggest tool, list Ready tasks in `## Open work` or the reply.
6. **Report:** Cleanup results and kept worktrees, stale plans waiting on owner, rows logged, Ready tasks (with `start <id>` for uncarded ones), started tasks (noting `drop <id>`), waiting tasks grouped by blocker, fast work owed review, and commit link list. Do not ask the owner questions; settle questions from repo law or offer a P0/P1 `decide` task.

## Offer

Offer for new P0/P1 findings (and in-domain verdict, babysit, or time-budget items). List P2/P3 side findings in `## Open work` or the reply. Out-of-domain offers set `session: none`.

1. Run `chips --session <id>` and `chips brief <id>` on related open tasks.
2. Either log `folded` on an uncarded offered task in the same question, offer with `waits: task:<id>` if the matching task is started/carded, or offer a new task with `chips id`, imperative title, `writes:`, `topic:`, `kind:`, `priority:` (+ proof evidence), `via:` (for P2/P3), `review-scope:`, `waits:` (including any colliding active `run:<plan>`), and `session:`.
3. Append with `append <ledger> chip "<id> <title>" "<finding>" "<tokens>" <result>`.
4. Leave carding to [Close](#close) at hand-back.

## Close

Run at the final hand-back of any session that offered tasks (after landing, closing the plan, and fixing friction):

1. Run `chips brief <id>` for each task this run offered. Add missing `waits:` / `apart` rows in one batch before carding.
2. Card each Ready, non-deferred, in-domain task (highest priority first, within the 10-card limit) and batch-log `carded` rows. Without a suggest tool, list Ready tasks in the reply.
3. Add one summary line right above the link list: offered count, carded count, what remaining in-domain tasks wait on (or `start <id>` if uncarded by limit).

## Start

Run before editing in any card session or `start <id>` run. In T3 Code, launching a standalone chip the user picked uses `t3_thread_launch` in its own worktree (`workspaceStrategy`), replacing Claude Desktop's `start_session` and `detach_session`, because the thread outlives the parent and talks directly to the user. Starting a quick chip inside the current topic stays in the current thread or runs via `invoke_subagent` (`Model: "inherit"`).

1. Run `chips brief <id>` and follow its brief (not the card prompt).
2. If `State:` is neither Ready nor Started, report it and stop.
3. Log `started` with any missing `writes:` and `session: <id>`, then re-read `chips brief <id>`. Note if session effort exceeds brief effort.
4. Log another `started` row before editing any unlisted path.
5. On completion: land, log `landed` (and `reviewed` for review tasks), fix hit workflow friction, run [Close](#close) on offered tasks, and mark worktree landed via `scan.mjs --landed`.

## Drop

- Started task -> `dismissed stopped`.
- Card held by this session -> dismiss card; log `started` if owner already started it, else `dismissed declined` with `card:`.
- Card held by another session -> `dismissed declined` with `card:`.
- No card -> `dismissed declined`.
