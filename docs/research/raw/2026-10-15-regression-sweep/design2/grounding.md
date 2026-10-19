# Grounding for the pivot

Read `/Users/zbeyens/git/plate-2/docs/plans/artifacts/2026-10-15-regression-sweep/architect/grounding.md` first. It holds the owner's asks verbatim, the repository conventions and the owners to reuse. This file adds what three paired trials showed since then, and what the plan keeps.

## The plan today

`/Users/zbeyens/git/plate-2/docs/plans/2026-10-15-regression-sweep.md` is the plan under review. Its `AIM-*` markers wait on the picking trial below, whose result is now known: `verify` alone stays. Each round is a plan that `verify` writes: per page, up to five cards (steps, expect, must-not, browsers, layer, minutes) picked ahead of the round. A failed card becomes an issue, then a fix with a test tagged `[plate#N]`; the card records that test and its source hash, and leaves the next round once CI runs the test.

## What the trials showed

Every arm ran once in a fresh session on `claude-opus-5-5 @high` from a repository snapshot without the plan or trials; every key came from a separate agent; every grader was `gpt-6-astra @xhigh`, blind to the arms. Files: `/Users/zbeyens/git/plate-2/docs/research/raw/2026-10-15-regression-sweep/trial/`, `lifecycle/` and `aim/`, each with its `key.md`, `grade-out.md` and arm answers.

- **First trial, picking cards for the 22 P1 pages against Slate.** Key: 12 bugs from Slate's own fix history. The sweep prototype's picking (A) caught 0, `verify` alone (B) 0, `verify` plus a five-line section aiming cards at the census's kinds of miss (C) 1.
- **Picking trial, cards for 16 Plate docs pages against platejs.org.** Key: 12 bugs from `origin/main` fixes from 2025-06-01 to 2026-08-14 that the census never read. `verify` alone caught 0, `verify` plus the section 0. The arms could not open the live sites; both worked from source.
- **Bookkeeping trial, preparing round 2 from round 1's record and a test index.** All three methods, the sweep prototype's `round 2` mode, `verify` alone and `verify` plus a section, scored 18 of 18. The index already stated each test's coverage and whether its body changed, so deciding was easy once those facts existed.

So checks written ahead by an agent contained the exact actions of a held-out bug once in 60 chances, whichever method wrote them. Read the two keys: the bugs are specific sequences, such as marquee-selecting two paragraphs then typing, reopening a block context menu at a second spot, Shift+Right at a table cell's end, undo after replacing a handle-selected block then typing without clicking, or copying blocks with an empty paragraph then pasting as plain text. A checklist of up to five cards per page rarely holds such a sequence.

What the census says about how the 93 fixed bugs were found (`/Users/zbeyens/git/plate-2/docs/research/raw/2026-10-15-regression-sweep/census/`, column `found-by`): 65 unknown, 11 owner reports, 8 public issues, 4 videos, 4 CI, 2 agent reviews. Owner reports and issues came from people using the pages, not from prepared checks. The census's kinds of miss, from its `misses.md` in `trial/prototype/qa-prep/references/`: features used together 24, focus and first click in popups and toolbars 14, caret and selection paint 10, native keys 10, layout that moves during a gesture 10, demo wiring and deploy 8, clipboard and paste 4, drag and drop 3, tests that pinned the bug 3, input methods and mobile 2.

## Fixed, not up for redesign

- The owner's order: P1 to P5 by hand, then P6 fixes, then test again; agent-run testing is a later plan.
- Pages: `tooling/scripts/page-health.mjs --list` lists P1 to P4 and unresolved pages; P5 is gaps against other editors, which go to `verdict`. The script also opens every deployed page in three engines for page errors.
- Finds go through Maintainer's issue-draft with the reference recording when the page has one; natamox publishes each confirmed draft; P6 runs the Bug fix playbook one find at a time; the fix's test lands at the lowest layer that sees the bug and carries `[plate#N]`; Plate browser regression tests go in `apps/www/tests/browser/regressions/`, gated in Chromium through `pnpm check`.
- A known bug's check stays in later rounds until the test it names runs gated, with an unchanged source hash and, for a browser-layer check, in every engine the check names.
- Two tester days for round 1, on a Mac (Chrome, Safari, Firefox) and a real iPhone.
- No new skill or playbook unless the design shows a trial-backed reason; both trials found the sweep skill's own rules did no better than `verify`.
