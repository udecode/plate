## Problem

Make **timeboxed editing sessions** the main unit of discovery. Keep prepared checks for known bugs.

Prepared cards contained an exact held-out trigger once in 60 comparisons. That undermines their use as a discovery strategy. It does not prove exploratory sessions work; round 1 must test that hypothesis. The existing owners remain: `verify` prepares rounds, issue-draft records finds, Bug fix handles P6, and `pnpm kb` supplies test evidence.

## Usage

These examples illustrate the proposed workflow, not observed results.

Natamox asks:

> Verify: prepare round 1 from the page inventory and known issues, using this plan’s session and time rules.

Before testing, the round plan contains:

| Field | P1: images | P2: dnd |
|---|---|---|
| Pair | Beta `/examples/plite/images` ↔ Slate `/examples/images` | Beta `/docs/dnd` ↔ stable `/docs/dnd` |
| Goal | Edit an illustrated note while preserving its text and pictures | Rearrange notes, then revise their content |
| Environment | Safari on Mac | Chrome on Mac |
| Discovery time | 10 minutes | 10 minutes |
| Result | Due | Due |

**On images**, natamox makes a small document, then edits it continuously. He selects from text into a picture, changes selection direction, moves a picture, undoes, and continues typing. He watches the selection and drag feedback during movement. He performs each substantial sequence on the reference too.

**On dnd**, he rearranges paragraphs, uses their menus, and continues editing without resetting the document. Suppose reopening a menu farther down leaves it at the first location. He preserves the original recording, reproduces from a reload, and records the same sequence on stable.

He invokes:

> Maintainer issue-draft: use these Beta and stable recordings, their timestamps, and this starting document.

After testing:

| Field | Images | dnd |
|---|---|---|
| Session | Completed; 10 minutes; no find | Completed; 10 minutes; find `R1-DND-01` |
| Record | Short account of explored states and recording pointer | Same, plus canonical draft pointer |
| Next obligation | Further discovery | Further discovery plus exact menu replay |

Natamox publishes the confirmed draft. After P1–P5 finishes, P6 runs Bug fix for its issue. Suppose the fix produces a Chromium regression test, with old-code failure, final-code success, and a gated run.

Round 2 starts only after Beta includes the fixes:

| Images | dnd |
|---|---|
| Five minutes, provided its affected source stayed unchanged | Ten minutes because the previous visit found a bug |
| Next environment in the rotation | Next environment in the rotation |
| Previous session linked | Issue and coverage evidence linked |
| No known replay | Exact Chrome replay omitted if its complete contract meets retirement requirements |

The menu test retires that replay. It does not retire exploration of dnd.

## Shape

### 1. What is the tester’s unit?

A **session on one page**, with a goal, paired reference where required, environment, time limit, and record of what actually happened.

The tester builds state instead of repeatedly returning to a pristine fixture:

1. Make something using the page’s exposed features.
2. Alter an existing selection, document, menu, or viewport state.
3. Combine that state with another operation.
4. Watch the transition, then continue editing.
5. Follow an anomaly immediately; otherwise change direction or starting state.

This permits sequences such as reopening a menu elsewhere, typing after undo, or copying blocks containing blank paragraphs. The supplied keys show why those transitions matter. They are illustrations, not a new checklist or proof of coverage.

Prepared cards predict the sequence before seeing the page. A session lets the tester choose the next action from the state the page actually produced.

### 2. How is time assigned and reduced?

Assume two eight-hour days:

| Use | Minutes |
|---|---:|
| Setup and breaks | 120 |
| Blind calibration | 120 |
| Reproduction and report capture | 120 |
| Known-bug replays | 60 |
| P5 comparisons | 60 |
| Discovery: P1 / P2 / P3 / P4 | 180 / 180 / 60 / 60 |

These are explicit pilot allocations, not measured optimal values.

An initial discovery session gets ten minutes. Within each priority, schedule unvisited pages, changed pages, and pages with previous finds first; then the least recently visited pages. Break ties by canonical URL. Every inventory page appears, including those deferred.

Use Chrome, Safari, Firefox, and real iPhone Safari in a deterministic rotation. Stagger starting environments across pages. An unvisited environment remains unproven.

For the next visit:

- New page, affected source change, or previous find: **10 minutes**.
- Completed visit with no find and no affected change: **half its previous allowance, rounded up, minimum three minutes**.
- Blocked or unfinished visit: **retain its allowance**.

Use `hand-drive scope` to identify affected pages; unmapped shared changes conservatively reset the affected priority’s pages.

Known replays add their recorded allowance until retired. Freed time is not automatically refilled once outstanding pages fit. If capture or required replays exceed their reserve, remove discovery sessions from P4 backward and mark them deferred.

Repeated work therefore shrinks mechanically. New bugs and unfinished coverage can still increase the total; the plan must expose that fact.

### 3. What remains of prepared checks?

Exact replays for reported bugs, confirmed historical regressions, and unresolved observations.

They hold the starting state, actions, expected and forbidden results, environment, minutes, and required observable layer. They prevent forgetting known failures while discovery searches elsewhere.

A replay leaves only when its named test covers the whole recorded contract, remains present and unskipped, has the accepted source hash, and runs gated. Browser checks require every named environment; Chromium does not retire Safari or iPhone proof.

Changed tests require renewed old-code failure before accepting their new hash. Missing, ungated, weakened, or insufficient tests leave the replay due.

### 4. How does the census reach the tester?

As a brief attention guide beside the session instructions:

> Combine features. Watch during gestures. Repeat controls from different positions. Continue typing after focus changes and undo. Use native keys and clipboard operations. Check the reference before trusting an expectation.

`verify` derives this from its existing Scenario Generator and interaction oracles. The census supplies the reasons and examples.

There are no ten-category completion boxes or category-based coverage claims. The picking trials already failed to justify those. Classify discoveries afterward to learn whether sessions reach different kinds of miss.

### 5. How is a find recorded once?

The **issue-draft packet owns the reproduction**. The round stores its stable identifier and pointer, not another copy of its steps.

Capture:

- Exact Beta and reference URLs, build identities where available, browser/device/OS, viewport, and active modes.
- Starting document or instructions that reconstruct it.
- Ordered actions, exact keys, selection direction, pointer positions, and necessary timing.
- Expected result and authority; actual result, including transient behavior and follow-up input.
- Original recording and timestamps, reference recording for paired pages, and observed reproduction frequency.

An agent reproduces from that packet. Minimization must preserve the original failure and recording. Duplicate observations link to the existing find.

Natamox publishes each confirmed draft. P6 fixes one issue per session at its owning layer. Its regression test uses `[plate#N]` and the lowest layer that observes the complete defect. Native paint or focus requirements cannot disappear behind a model assertion.

The originating round gains only the issue link, covering test identity, accepted hash, and red/green/gate evidence. Later rounds reference those facts.

### 6. How does round 1 establish whether this works?

Run a **blind discovery pilot**, scoring actual recorded hand work.

Before any run, freeze both methods, time limits, eligibility rules, scoring, and the adoption threshold:

- Baseline: up to five prepared cards per page.
- Candidate: the editing session above.
- Six ten-minute sessions per method.

A separate key builder, blind to the methods, selects twelve eligible historical regressions outside the census and both disclosed keys. In disposable local fixtures, the builder verifies each defect and its healthy reference. All must work on available hardware without unavailable services.

The builder seals the key before allocation. Random assignment balances priority and environment between methods; session order is counterbalanced. Natamox never encounters the same defect twice. Candidate-facing materials contain ordinary page tasks, without key or grading information.

A separate grader receives anonymized recordings and reports. Credit requires detecting the defect and supplying a reproducible report—not merely performing a related gesture.

Keep the candidate only if it finds at least three of its six defects and at least two more than baseline. Otherwise reject it; insufficient eligible fixtures make the result inconclusive.

The lead cannot choose exclusions or matches after seeing results: the key, allocation, rubric, and threshold are frozen, and the lead sees the key only after grading. Neither disclosed key can grade this design.

Report live-round confirmed finds per tester-hour separately. This small pilot supports a workflow decision, not a general recall estimate.

### 7. What is the smallest implementation?

Keep the policy in the existing regression-sweep plan. Add no skill, playbook, case registry, or session application.

**Round file:** `docs/plans/<date>-sweep-r<N>.md`, with standard plan metadata, Brief, Teach, Defaults, proof-bearing steps, and:

- **Inputs:** inventory snapshot, Beta build, prior round, environments, budget.
- **Sessions:** page, priority, comparison/scope, goal, environment, allowance; afterward status, actual minutes, explored-state summary, evidence and find pointers.
- **Known replays:** canonical find pointer, required environments, allowance, coverage evidence.
- **Results:** deferred pages, unresolved pairings, findings, calibration result, and next-round calculations.

Keep its standard decision log.

The conceptual data contract is:

```text
Target = Paired(P1|P2, beta, reference, sharedScope)
       | New(P3|P4, beta, featureScope)
       | Gap(P5, comparison)

Session = Due | Completed(record, findReferences) | Blocked(reason)

prepareRound(inventory, previousRound, changes, coverage, budget)
  -> roundPlan
```

`verify` performs that preparation; this signature does not introduce another command.

Reuse the already-planned changes: page-health inventory, knowledge-tool hashes, issue-draft reference labels, Bug fix coverage recording, and the Chromium regression gate. `page-health.mjs` is absent today and remains a prerequisite. Update `docs/development/agent-skills.md` with the caller examples.

Paired targets require references; unresolved pairings cannot become passing sessions. New features on paired pages move to P3/P4 scope.

This gives `verify` a small interface hiding allocation and carry-forward decisions. Reports retain one owner, per single-source-of-truth; coverage is validated when accepted, per boundary-discipline.

## Tradeoffs accepted

- We accept explicit deferred pages in exchange for meaningful discovery time.
- We accept variable human exploration in exchange for responding to unexpected states.
- We accept a small continuing discovery allowance. Tests for known bugs cannot justify zero exploration.

## Alternatives considered

**Prepared cards as the main unit lose.** They make execution simple but expose sequence invention to the preparing agent—the responsibility that failed in the trials.

**An exhaustive interaction matrix loses.** It hides scenario selection but hands the tester an unaffordable cross-product.

**Unstructured clicking loses.** It preserves exploration but lacks time limits, reproducible records, and a mechanical next round.

## Open questions and risks

- Will ten-minute sessions discover enough reproducible defects to beat cards?
- Can source-to-page mapping avoid resetting too many sessions?
- Will imported-helper changes weaken tests without changing their recorded body hashes?

## Next implementation step

Build the sealed calibration fixtures and two frozen round-plan variants in scratch, then run the blind pilot before adopting the session policy.
exit=0
