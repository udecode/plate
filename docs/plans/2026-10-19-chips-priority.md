# Give suggested tasks a priority so the board leads to the release

Status: done
Topic: pstack
Playbook: build

The owner asked whether chips could offer verdict items for big tasks and whether chips leads toward a releasable product instead of endless looping. They settled the design on 2026-10-19 in the lead session ("start t_1ed6a28f with the revised plan"), then said "no panel. fast." in this one. This plan builds that design. It is suggested task t_1ed6a28f.

## Brief

### What will change?

Every open suggested task gets a priority from P0, broken now, to P3, workflow. Cards fill up to 10, highest first, and the board lists only P0 and P1 unless asked for all. plate-2's open review items become P1 tasks.

### What could go wrong?

The first sweep tags about 250 tasks by judgment, so some land in the wrong tier until a later sweep fixes them. Review items wait behind every P0 task, so a red board slows reviews.

## Teach

Suggested tasks are side jobs an agent finds but does not do itself. Each one is a row in a shared log, and a board shows which can start. You start one from a card.

Today the board treats every task the same. It cards up to 20 in the order they were filed, so a workflow tweak can take a slot before a bug that loses data. The review ledger knows which product questions block the release, but chips never reads it.

Now each task carries a priority, and the checker refuses a P0 or P1 claim without its evidence: a failing check, a regression commit, a repro or the review item it serves. The board shows the urgent tiers in full, counts the rest, and cards the top 10. In plate-2 every open review item becomes a P1 task in the ledger's own order.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Review of the helper change | None, on your word | One panel round on the helper diff | panel | big |
| Smoke runs | Skipped, because fast drops runs that start an agent | Smoke the changed routes in each project | smoke | small |
| Proof of the 10 cards | The lead session's board, read only, shows the 10 cards in order; your next sweep there offers them (look) | This session offers the 10 cards itself, and they vanish when it closes | card here | small |
| Where P1 reads review items | A small list command on the review ledger that names each open item in queue order | Parse the full status report inside the shared helper | parse status | detail |
| Full board | The all form of the sweep lists every tier, and still takes tasks no live session owns | A separate full flag | full flag | detail |
| Untagged tasks | They get no card until a sweep tags them, so the first sweep tags them all | Card untagged tasks as if they were P2 | cards first | small |
| What counts as P1 evidence | A repro for a bug, or the review item the task serves | Trust the offering agent's word for P1 | trust p1 | small |
| Card room | Ten minus the cards this session holds in the ledger | Count only what the suggest tool shows | tool count | detail |
| Effort of a pursued design's build | high, because the review already settled the design | xhigh, like a design question | build xhigh | detail |
| Plate delivery | A PR stacked on #5215, which already carries the helpers and only lacks the chips skill | A PR into main of its own, which would clash with #5214 and #5215 | plate main | detail |
| Topic page link | A new page at https://claude.ai/artifact/BurYxpPqSKECrCQvFQpNo6, because https://claude.ai/artifact/Q5TusVfYgEUm4SEStmFRBd no longer opens (look) | Publish no page for this subject | no page | detail |

## Main changes

- Chip rows take `priority: P0|P1|P2|P3` with the evidence tokens `repro:`, `regressed: <commit>` and `ship: <item>`. A task that owns a check failing on the base branch is P0 whatever its token says.
- `append` refuses a new offer with no priority and no owned check, a P0 claim with no owned check, `regressed:` or `repro:`, a P1 claim with no `repro:` or `ship:`, a `regressed:` that is not a commit, and a `ship:` that names no open item of the project's list. A carded task takes an `updated` row that only changes its priority or its evidence.
- `chips` sorts Ready and Waiting by priority, lists P0 and P1 in full and counts P2, P3 and untagged tasks unless `chips all`. Its ledger pass asks to tag each untagged offered task, and its card pass offers at most 10 minus the cards this session holds, P0 first.
- A project config `chips.ship` names a command that prints the open path-to-ship items as JSON. `chips` orders P1 tasks by that list, and its ledger pass offers a P1 task for each item no open task serves. `chips stale` shows each task's priority and flags a `ship:` item that closed.
- plate-2 sets `chips.ship` to `node tooling/scripts/review-ledger.mjs ship`, which lists the open review items in queue order. The Verdict playbook's close cards the next item through that sweep instead of its own suggestion, and a product design question goes to the review ledger instead of chips.

## Steps

- [x] Add priority, its evidence checks, the priority board and the 10-card room to the shared helpers, with tests. Proof: the sync-pstack test suite passes.
- [x] Add the ship list to the shared helpers, with a test. Proof: the same suite.
- [x] Rewrite chips.md and the chips skill for priority, the 10-card room and the stale review's priority check. Proof: one unslop pass and a dry-run render for each project.
- [x] Run corpus over the ellie, plate and plate-2 ledgers with the old and new helpers. Proof: the two boards per project in the run directory.
- [x] Add the review ledger's ship command and plate-2's config, rules and playbook text. Proof: the command's output and a board that lists the review items as P1 offers.
- [x] Commit and push dotai, apply it to plate-2, ellie and plate, and deliver each. Proof: `verify` per project and each delivery's commit or PR.
- [x] Triage the live ledger: tag every open offered task, check the repro of the 14 suspected major bugs before P0, and offer the review items. Proof: the board before and after, with no untagged task left.
- [x] Read the lead session's board to show 10 cards in priority order. Proof: the board output.

## Close

What landed. The shared helpers and chips rules are dotai [ea38a44](https://github.com/udecode/dotai/commit/ea38a44). ellie took the chips skill in [2d032bc3b](https://github.com/udecode/ellie/commit/2d032bc3b). plate gets it through [#5216](https://github.com/udecode/plate/pull/5216), stacked on #5215, which already carries the helpers. plate-2 landed the helpers, the review ledger's `ship` command, its config and its rules in the commit that carries this Close. The same commit widens a watcher test's start deadline from 3 to 15 seconds, because both bun watchers had printed only their banner at 3 seconds when the full check ran beside them, which failed two landings.

Proof and its limits. The dotai suite passed 320 of 320 on the committed bytes, and the review ledger's suite passed with its new `ship` test. Corpus over the ellie, plate and plate-2 ledgers changed only the `chips` and `chips stale` boards and failed no whole-log check that passed before. `sync-pstack verify` passed on ellie and plate-2. This run judged the 14 suspected major bugs from the repro each finding cites. It read each repro and reran none. One had already landed, five went to P0, five to P1 and three to P2. The other 254 untagged tasks got a tier from their title and topic, 147 at P2 and 107 at P3, so some sit in the wrong tier until a sweep judges them again. The lead's board shows 7 cards, P0 first, because it already holds 3 of the 10.

Counts. 8 steps, 8 done. 1 owner ask ("no panel. fast."), honored: no panel, smoke or reflect ran, and no-comments was skipped under fast.

Deviations. plate went out as a PR stacked on #5215 instead of a sync of its own, because the tests-rule session's sync had already carried the helpers there.

## Open work

- Offer the six open review items no plan works on, styles, toc, date, dom-lookup-names, diff and ai, as P1 tasks. owner: this run, right after it lands, since `chips` reads `chips.ship` from the main checkout. stop: the lead's board lists them.
- dotai ea38a44 and this commit shipped fast and are owed a review. owner: zbeyens. stop: "full" or the owner drops the review.
