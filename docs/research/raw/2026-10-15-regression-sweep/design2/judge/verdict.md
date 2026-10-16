I'd build on cand-2 and add two grafts: cand-3's move deck and its `--boxes` time rule, and cand-1's first-round time budgets. All three candidates make a timed hand session the unit for finding new bugs and keep prepared checks only for known bugs. They differ in how concrete the session is, how the time rule runs, and how round 1 is measured. I wrote nothing to the project; the only file I wrote is the plan file `/Users/zbeyens/.claude/plans/you-are-the-cross-judge-rosy-penguin.md`.

## Scores

| Criterion | cand-1 (missions) | cand-2 (sessions) | cand-3 (move deck) |
|---|---|---|---|
| 1. Finds unknown bugs | **2**: the mission instruction is one sentence ("keep state, cross a boundary, recover, continue"), and P2 at 230 min ÷ 8 reaches about 28 of 71 docs pages in round 1. | **2**: the 5-step state-building procedure is concrete, but P1 at 180 min ÷ 10 is 18 sessions, so 4 of the 22 P1 pages miss round 1. | **3**: six moves applied live to each control, beside the reference page, on all ~114 pages each round (one engine per page), with free play in the last fifth. |
| 2. Shrinks | **2**: `max(2, first/2^streak)` is mechanical, but it is "manually applied", and it resets on any change `hand-drive scope` maps or fails to map. In v2 that likely resets most pages; the candidate admits it. | **2**: halve rounded up with a 3-minute floor, and deterministic deferral from P4 backward. It has the same diff-scope reset risk (its own open question). | **3**: `page-health.mjs --boxes <prev plan>` computes the rule as code. A page resets only when an issue, report or P6 fix names it, and leaves after two quiet rounds at the floor. |
| 3. Owner priority | **3**: "shared behavior only", new behavior goes to P3/P4 even on a shared URL, P5 goes to `verdict`, P6 is Bug fix one find at a time, `[plate#N]` at the lowest layer. | **3**: a typed `Paired`/`New`/`Gap` target, new features on paired pages go to P3/P4, round 2 waits for a beta build with the fixes. | **2**: "any difference from the reference page is a find" (line 80) contradicts the owner's ask 2 to ignore new features in P1/P2. Otherwise the order is right. |
| 4. Measurable | **2**: a blind 6-against-6 test of cards versus missions, frozen before a separate builder makes the key, separate grader, threshold ≥3/6 and +2. It never says how historical defects get planted into "disposable builds". | **3**: the same design, plus balanced allocation and order, the lead sees the key only after grading, it bars both existing keys, and it reports finds per tester-hour separately. The planting problem is still unsolved. | **2**: seeds 8 reverted fixes into the real round with a recorded random seed and a blind grader. There is no comparison with cards, it is doubtful old reverts apply to the v2 rewrite (its own open question), and its "paper check" nearly always passes because a generic deck can match almost any bug. |
| 5. Small | **3**: no new skill, playbook or file kind; bounded edits to `editor-proof.md`, issue-draft, Bug fix, `knowledge.mjs` and `check.mjs`, all already planned. | **3**: the policy stays in the existing plan; no new command; reuses the planned page-health, hash, issue-draft and gate work. | **2**: adds a `## Tester pass` section, a `--boxes` flag, move tags, a seeder branch and a seeded preview deployment. |
| 6. Records | **3**: issue-draft is the only owner of the reproduction; the coverage receipt holds test path, title and hash; every named engine; a changed test must fail again on old code. | **3**: the richest capture list (build, viewport, selection direction, timing, how often it reproduces); minimizing a repro keeps the original recording; repeat sightings link to the first find. | **2**: one line plus a timestamp in a recording, and an agent drafts the issue from the clip. Reproducibility rests on reading video. Re-check rows also hold "steps", a second copy beside the issue draft. |
| **Total** | **15** | **16** | **14** |

## Claims that don't hold

- **cand-3 contradicts its own time rule.** The boxes in lines 27, 50-51 and 59 don't follow the formula in lines 102-105:
  - hovering-toolbar lists 4 controls, so `clamp(4,6,20)` gives 6 minutes, but the table says 8.
  - table lists 9 controls, so the formula gives 9 minutes, but the table says 14.
  - Line 105 only scales boxes down, so neither 8 nor 14 is reachable.
- **cand-3, line 80**, "any difference from the reference page is a find": not a false file claim, but it conflicts with grounding ask 2, which says P1/P2 ignore new features (those go to P4).
- **cand-3, line 161**, the seed pool "from `next` before 2026-08-15": it does exclude both keys, but the pool's dates overlap the second (Plate docs) key's source window. I checked: 37a80351c4, b74ed79fd4, 93880a84ed and c452f3fc24 are all ancestors of `next`. The seeder must exclude those commits explicitly.

Every other factual claim I checked held:
- **Trial grades:**
  - First trial: C 1/12, B 0, A 0.
  - Picking trial: B 0, C 0.
  - Bookkeeping trial: 18/18 for all three.
  - That is 1 caught in 60 chances.
- **Trial keys:** the bugs the candidates cite match the key files, including cand-3's "Slate K5 and K8 are Android-only".
- **Census:** it spans 2026-08-15 to 2026-10-15.
- **`page-health.mjs`:** it does not exist yet, and the plan lists it (cand-2 and cand-3 say so).
- **Test hashes:** the per-test source hash cand-1 calls "already planned" is plan step 1.2. `knowledge.mjs` today checks only commit reachability.
- **Issue-draft:** it assumes a `main`/`next` pair today (`issue-draft.md:61-72`) and has the `--allow-public-video` gate (line 30).
- **Other files:** `hand-drive.mjs scope` exists (line 577), as do `.agents/rules/verify/references/hand-drive.md`, the Scenario Generator section (`editor-proof.md:154`) and `regression-oracles.md`.
- **Page count:** cand-3's ~114 pages is consistent with the plan: 22 + 21 + 71.

Not run: any `pnpm kb` call, `page-health.mjs` (absent), any seeding or trial step, and `hand-drive scope` on real changes.

## Base: cand-2

- **Why cand-2:** cand-1 and cand-2 reached nearly the same design on their own, and cand-2 is the stricter version. It has a typed target that keeps new features out of P1/P2, the most complete find record, and the strongest measure: a test against a cards baseline that the lead can't bias, with balanced allocation and order.
- **Its weak spots:**
  - The session instruction is generic.
  - The time rule rests on a mapping from changed files to pages that v2 will mostly reset.
  - The 10-minute first visits leave 4 P1 pages out of round 1.
- **Why not cand-3:** it is the most original on the central problem, but it weakens the measure, adds more moving parts, and its record depends on agents reading video.

## Grafts

1. **From cand-3: the move deck and `--boxes`.**
   - Replace cand-2's attention guide with cand-3's six moves (then-type, again-elsewhere, other-route, edge-start, inside-other, moved-ground) and its table mapping each census miss category to a move. Put both in `.agents/rules/verify/references/hand-drive.md` as `## Tester pass`. This gives must-answer question 4 a real answer without aiming at single pages.
   - Take `page-health.mjs --boxes` with cand-3's reset trigger (an issue, report or P6 fix names the page) in place of the diff-scope reset, so the time rule runs as code and actually shrinks.
2. **From cand-1: first-visit budgets.**
   - Use 8 minutes for P1/P2 and 6 for P3/P4 on a first visit.
   - P1 gets 180 minutes, which fits all 22 P1 pages in round 1.
   - Unused minutes roll forward in priority order.
exit=0
