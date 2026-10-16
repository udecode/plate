# Synthesis: what a tester does on each page

Runners: `claude-opus-5-5 @high`, `gpt-6-astra @xhigh` and `gpt-6.1-sol @xhigh`, on `task.md` and `grounding.md` here. A blind cross-judge on `claude-opus-5-5 @high` read them as `cand-1` (Sol), `cand-2` (Astra) and `cand-3` (Opus) and scored Astra 16, Sol 15 and Opus 14 of 18 (`judge/verdict.md`).

## Convergence

All three dropped checklists written ahead as the way to find unknown bugs. Each made the unit a timed, recorded session on one page, with the reference page beside beta for P1 and P2, and kept exact checks only for known bugs until a test covers them. Each halves a clean page's time and keeps issue-draft as the one owner of a find's reproduction. All three call the mechanism a hypothesis that round 1 must test.

## Base and grafts

- **Base: Astra.** Sessions build state instead of resetting it; P1 and P2 cover shared behavior, and a beta-only feature on a paired page is P3 or P4 scope; the fullest capture list for a find; a blind pilot the lead cannot bias.
- **From Opus: the six moves and computed boxes.** Then-type, again-elsewhere, other-route, edge-start, inside-other and moved-ground, with the watch list and the table that maps each census kind of miss to a move. `page-health.mjs --boxes <previous round plan>` computes the next round's boxes. A page comes back when an issue, a user report or a P6 fix names it, not on a source change, because v2 changes shared code every round. A page leaves the hand pass after two clean rounds at the floor, which serves the owner's zero-manual target.
- **From Sol: first-visit budgets.** 8 minutes for P1 and P2, 6 for P3 and P4, P1 at 180 minutes so all 22 pages fit round 1, and unused minutes roll forward in priority order.

## Where the lead departs from the judge

- **The trial's baseline is free clicking, not checklists.** Today's flow is a tester clicking around, so that is the incumbent. Checklists were this plan's proposal, never adopted, and three trials put them at 1 in 60. With one tester and 12 planted bugs, a third arm would leave 4 per arm. Round 1 compares the moves against free sessions with the same boxes, so the moves are the only difference.
- **Planting.** Opus's single seeded build, so the tester cannot tell which pages hold a planted bug. Astra's and Sol's separate builds per bug would reveal it. The seeder reverts a past fix when the revert applies, and otherwise reintroduces the bug by hand from the fix's diff. It excludes every commit in the census and both trial keys; the judge found four aim-key fixes are ancestors of `next`.
- **Home of the method.** A new verify reference, `tester-pass.md`, instead of a section in `hand-drive.md`, which every agent hand drive reads in full.

## Rejected

- Opus's paper check against a fresh key: a generic move can match almost any bug, so it nearly always passes (judge).
- Opus's "any difference from the reference is a find": it counts beta-only features, which the owner routes to P4.
- Resetting a page's time on a source change (Astra, Sol): shared v2 code changes every round, so most pages would reset.
- A continuing time floor that never ends (Astra, Sol): the owner targets zero manual testing; a page returns when an issue, report or fix names it.
