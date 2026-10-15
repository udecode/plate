## Problem

Replace agent-predicted cards with **timed editing missions chosen and adapted by the tester on the live page**. Keep exact checks for known defects.

Prepared cards included a held-out bug’s triggering actions once in 60 chances. The bookkeeping trial succeeded once coverage facts existed. The design should therefore change discovery, while preserving the existing recording, repair and retirement owners.

## Usage (caller’s view)

The examples below illustrate records, not claims that current beta has these defects.

**Round 1, P1 images**

Beforehand, the round plan holds:

> Beta `/examples/plite/images`; reference Slate `/examples/images`. Eight minutes in Chrome. Goal: revise an illustrated document while keeping its images and surrounding text usable. Explore shared behavior only. Known replays: linked separately.

natamox opens both pages and starts recording. He edits around an image, changes the selection, moves an image, undoes an edit and continues typing. He follows surprising behavior while the timer runs. He compares the same sequence on Slate when behavior differs.

Afterward, the plan holds:

> Completed, eight minutes, build and browser recorded. No find. Recording linked. Brief trace: text selection → image boundary → image move → undo → continued typing. Safari, Firefox and iPhone remain unvisited.

**Round 1, P2 basic-blocks**

Beforehand:

> Beta and stable `/docs/basic-blocks`. Eight minutes in Chrome. Goal: reorganize a short document using the existing block controls, then keep editing. Beta-only controls belong to P4.

During editing, natamox changes from text selection to block selection. Replacing a block, undoing and immediately typing produces a suspicious result. He preserves the state, repeats from a fresh document and runs the sequence on stable.

Afterward:

> Completed with find F1. One issue-draft owns the fixture, exact sequence, expected and actual results, environment and two recordings. The plan links F1 without copying its reproduction.

After P1–P5, natamox publishes confirmed drafts. Each P6 session runs Bug fix separately.

**Round 2**

Assuming P6 changed only Plate code affecting basic-blocks:

| Page | Round 2 plan |
|---|---|
| P1 images, Chrome | Four-minute mission with a different editing goal. Round 1 recording remains linked. Other environments still receive their first full mission. |
| P2 basic-blocks, Chrome | Eight-minute mission because a find resets its budget. F1’s exact replay remains due unless its covering test satisfies retirement requirements. |
| P2 basic-blocks, Safari/Firefox | Full discovery missions remain due. A Chromium-only regression test cannot retire their known replay obligations. |

## Shape

### 1. What is the work unit?

A **mission** is one continuous editing session on one page, in one environment, with:

- Priority, beta URL and reference URL or accepted expectation source.
- A concrete editing goal and scope exclusions.
- Environment, budget and previous-session link.
- Afterward: build identity, actual minutes, recording, brief interaction trace, find links and completion state.

The goal describes useful work, not prescribed actions or a promised final state. natamox chooses actions from the page’s actual controls and current document.

The operating instruction is short: **keep the resulting state, cross a feature or selection boundary, recover from an edit, and continue editing without repairing focus by clicking. Watch during gestures as well as afterward.**

This can expose sequences such as selection crossing an image, reopening a menu elsewhere, or typing after undo. Five isolated cards usually reset before those states accumulate. This is a plausible mechanism, not demonstrated superiority; question 6 tests it.

### 2. How is time assigned and reduced?

Assume two eight-hour working days: 960 minutes.

Reserve 180 minutes for known replays and find capture, 90 for real-iPhone work, 60 for P5 and 120 for the blind trial. Allocate the remaining 510 discovery minutes: P1 180, P2 230, P3 50, P4 50. Unused minutes move forward in priority order.

A first mission receives eight minutes for P1/P2 and six for P3/P4. Within each priority, schedule unvisited environments first, then pages with finds or affected changes, then remaining pages by oldest visit and URL. Work that cannot fit remains explicitly due.

For each page/environment:

```text
next budget = max(2 minutes, first budget / 2^clean_streak)

completed with no find → increment clean_streak
find, blocked session or affected product change → reset clean_streak
unvisited → retain previous state
```

`verify` derives affected pages through the existing Hand drive scope owner. An unresolved mapping resets every potentially affected page; it cannot silently preserve a discount.

Thus an unchanged clean P1 mission takes eight, four, then two minutes. New defects or changes can increase total work. A forced decrease regardless of those facts would undermine discovery.

### 3. What survives of prepared checks?

Exact replays remain for confirmed bugs, open reports and concrete existing hypotheses. They are reproducibility and regression checks, not the main discovery unit.

A replay names its issue, environments, minutes and covering test. It retires only when that exact test is present, enabled, gated and has its accepted source hash. Browser-layer replays require every named engine. Changed tests need renewed old-code failure proof.

A model test retires only acceptance it can actually observe. It cannot retire caret paint or native focus requirements.

### 4. How does the census reach natamox?

The round plan translates the census into a short observation reminder:

> Combine features already present. Change selection methods. Continue typing after menus and undo. Use native clipboard paths. Watch moving layout and intermediate paint.

The full census remains linked for explanation. It supplies no per-page predicted sequences, mandatory category tally or exhaustive matrix.

The failed trials tested whether census guidance improved **agent selection of cards**. They did not test whether it improves a human’s decisions during live editing. The blind trial must establish that distinction.

### Files and ownership

**`docs/plans/<date>-sweep-rN.md`**

Use the existing plan-page shape: `Status`, `Topic`, `Playbook`, Brief, Teach, Defaults, proof-bearing steps and Open work. Add ordinary sections containing:

- **Schedule:** build, device availability, budgets, inventory snapshot and unresolved pairs.
- **Missions:** planned and completed fields above, including clean streak and scope evidence.
- **Known replays:** references to canonical finds, due environments and coverage receipts.
- **Results:** discoveries, minutes, blocked work, omissions and trial result.

P1/P2 missions cover shared reference behavior. New behavior receives P3/P4 missions, including when it shares a URL with an existing example. P5 gaps go to Verdict.

**`docs/plans/<date>-sweep-rN.decisions.tsv`**

Keep normal keep/revert/quarantine decisions. Do not duplicate mission results here.

**Existing owners receive bounded changes:**

- `verify`’s source-owned `references/editor-proof.md`: mission preparation and the timing rule, adopted only after the trial.
- Maintainer’s `issue-draft.md`: accept explicitly labelled Slate or stable Plate comparison recordings.
- Project Bug fix: issue-tagged regression and coverage receipt.
- `knowledge.mjs`: print the already-planned individual-test hash.
- Planned `page-health.mjs`: canonical inventory and deployed-page health.
- `check.mjs`: gate Plate browser regressions when the first such fix needs it.

No new skill, playbook, per-page files or card registry.

The planning contract is:

```text
Mission = Planned | Completed(trace, minutes, find_links) | Blocked(reason)
Comparison = ReferencePair | NewFeature(expectation_source)

prepareRound(inventory, previous_round, changes, coverage) → RoundPlan
nextBudget(previous_mission, affected_change) → Minutes
replayDisposition(find, accepted_coverage, current_coverage) → Due | Retired
```

These are design signatures, not proposed public commands. `verify` owns the planning transformations; Maintainer owns findings; Bug fix owns repair; the knowledge tool owns test discovery. Boundary validation rejects missing pairings and incomplete receipts, per boundary-discipline.

The small caller surface hides scheduling and carry-forward bookkeeping. The tester retains the judgment that matters: what to try next.

Commands and requests reuse existing entries:

```text
verify route <page>: prepare this round from the inventory and previous plan
maintainer issue-draft: draft only, using this session and reference recording
Bug fix <published issue>
pnpm kb plate#N
node .agents/pstack/plan-page.mjs <round-plan> --check
```

### 5. How is a find recorded once?

Use issue-draft as the sole reproduction owner. Capture the starting document, selection method and direction, keys, pointer path, relevant timing, follow-up input, beta build, browser/device and reference result. Preserve motion evidence for transient defects.

The mission links that draft. After publication, the draft records the issue URL. Later rounds link the same finding; they never rewrite its steps into another card.

P6 reproduces it, diagnoses the owning invariant and adds a failing regression at the lowest observing layer, tagged `[plate#N]`. The originating round receives the test path, title, source hash and proof links.

Repeated observations attach to the existing find when their trigger and failure match. Publication remains natamox’s action.

### 6. How does round 1 measure success fairly?

Run a **fresh hidden-defect trial of actual human discovery**, rather than grading planned text against action sequences.

Before a key exists, freeze both methods, page budgets, environment scope, allocation procedure and scoring rule. A separate key builder prepares twelve reproducible, supported historical defects outside the census and both disclosed keys, using disposable builds with working reference behavior.

The builder balances P1/P2 and defect families, then randomly assigns six distinct defects to each method. natamox runs cards on one set and missions on the other, with equal eight-minute page budgets. He sees neither symptoms nor assignments beyond the method needed for each page.

A separate grader receives sealed reports under anonymous labels. A hit requires a correct, independently reproducible report matching the hidden defect. Count incidental genuine bugs separately.

Adopt missions only if they find at least three of six hidden defects and at least two more than cards. Insufficient validated entries make the result inconclusive.

The lead freezes the method and scoring before key creation, receives only the key’s path, and cannot revise allocations or reports after seeing answers. These controls prevent tailoring the design to the key. Twelve defects still provide limited precision.

### 7. What is the smallest useful implementation?

One round plan, existing issue drafts and recordings, a manually applied timing rule, and the blind trial. Retain the planned inventory, hash and gating work needed for trustworthy carry-forward. Build no mission application or scheduler first.

## Tradeoffs accepted

- We accept uneven action coverage in exchange for live exploration of accumulated state.
- We accept explicit unfinished pages in exchange for an honest two-day limit.
- We accept a two-minute discovery floor in exchange for continued unknown-bug detection. Retired known checks alone cannot justify zero exploration.

## Alternatives considered

**Prepared cards as the main unit lose.** They hide action selection but expose a fixed search path to the tester. Their exact-action coverage was one in 60. More cards spend the human budget on the same unproven mechanism.

**Unstructured clicking loses.** It gives the tester freedom but hides little preparation work and preserves no reliable carry-forward state. Missions add bounded purpose, evidence and mechanical time reduction.

## Open questions and risks

- Will live missions beat cards under the frozen trial, including transient visual defects?
- Will frequent shared-substrate changes prevent meaningful budget reductions?
- Is the proposed working-day length correct for natamox?
- Will the owner accept a continuing discovery floor while known replays approach zero?

## Next implementation step

Prepare one P1 and one P2 mission in a scratch round-plan prototype, then freeze the paired trial before an independent builder creates its fresh key.
