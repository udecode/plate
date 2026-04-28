---
description: Review Slate v2 architecture/API plans against React 19.2 runtime performance, Slate-close unopinionated DX, legacy-regression proof, research evidence, and shadcn-style composability; write a scored plan and keep completion pending until the plan is strong enough to execute.
argument-hint: '[--quick|--standard|--deep] <Slate v2 architecture/API review prompt>'
disable-model-invocation: true
name: slate-review
metadata:
  skiller:
    source: .agents/rules/slate-review.mdc
---

# Slate Review

Handle $ARGUMENTS.

Use this for repeated "harsh honest, absolute best Slate v2 architecture/DX"
review prompts where the failure mode is death by incremental suggestions.

This is a planning/review gate, not an implementation lane. It creates or
updates the execution-grade plan, scores it, and keeps the completion state
`pending` until the score is high enough. When the score passes, set completion
to `done` so the user can review the plan before a later `complete-plan` run
executes it.

## Use When

- Reviewing Slate v2 architecture, public API, hooks, runtime boundaries, or
  render contracts.
- The user asks whether the plan is the absolute best shape for:
  - React 19.2 runtime performance
  - unopinionated Slate-close DX
  - Plate and slate-yjs migration
  - regression-proof browser behavior
  - Lexical / ProseMirror / Tiptap evidence
  - shadcn-style composability and minimal props
- The user says repeated review keeps producing more suggestions and wants a
  methodical plan-confidence gate.

## Do Not Use When

- The user asks to execute an already accepted plan.
- The user asks for a narrow bug fix or browser repro.
- The user asks for a normal code review of a diff.
- The plan already has a passing Slate Review score and the user says to build.

## Hard Policy

- Do not patch Slate v2 implementation code in this skill.
- Do not mark `done` because the review pass is tired.
- Do not use `blocked` when another research, review, or plan-hardening move is
  runnable.
- Treat pasted review findings as context. The latest user request is the task.
- Keep Slate v2 unopinionated. Plate owns opinionated product APIs.
- A breaking or paradigm change needs an adoption story. "Cleaner architecture"
  alone is not a justification.
- If a change touches extension, plugin, collaboration, operation, or data-model
  surfaces, a raw-Slate answer alone is insufficient.
- Do not let a polished plan self-certify. Scores, verdicts, and keep/drop
  decisions need cited evidence.

## Required Artifacts

- Plan file under `docs/plans/`.
- Completion file: `tmp/completion-check.md`.
- Continuation prompt: `tmp/continue.md` when further autonomous plan work
  remains.
- Research updates under `docs/research/` when the evidence lane is stale or
  incomplete.
- Slate maintainer objection ledger in the active plan, with ecosystem answers
  when triggered. If it grows too large, split it to
  `docs/plans/<same-slug>-objection-ledger.md` and link it from the plan.
- Plan deltas from review in the active plan: what changed, what was dropped,
  what was strengthened, and what stayed unchanged with reasons.

Default plan path:

```txt
docs/plans/YYYY-MM-DD-slate-v2-absolute-architecture-review-plan.md
```

Reuse an active plan instead when the prompt names one or the current
completion file already points at one.

## Read First

1. Latest user request.
2. `tmp/completion-check.md` if present.
3. Active plan under `docs/plans/` if present.
4. `docs/research/README.md`, `docs/research/index.md`, and
   `docs/research/log.md`.
5. Relevant compiled research pages for Lexical, ProseMirror, Tiptap, Slate,
   React 19.2, node/render DX, and browser proof.
6. Live `../slate-v2` API surfaces touched by the review.

Use `research-wiki` when the compiled layer is stale, contradictory, or missing
coverage for the current question. For framework evidence, inspect local
official clones under `..` or normalized `../raw` before external docs.

If the review depends on current `../slate-v2` behavior, cite live source files
or tests. If it depends on React 19.2, Lexical, ProseMirror, Tiptap, or Slate
legacy behavior, cite the compiled research page or local source read used for
that claim.

## Completion State

Set `tmp/completion-check.md` to `pending` before starting or resuming review.

Use:

```md
status: pending
plan: docs/plans/YYYY-MM-DD-slate-v2-absolute-architecture-review-plan.md
```

Set `done` only when all completion gates below pass. Set `blocked` only when no
autonomous progress is possible because evidence, tooling, access, or a user
decision is missing.

Single-pass completion is invalid by default:

- one activation may complete at most one scheduled review pass
- a newly created or newly activated review plan must stay `pending`
- only the closure pass may set `done`
- the closure pass is valid only after earlier pass-state rows are already
  recorded as complete in the active plan
- if the current activation creates, rewrites, or materially rescopes the plan,
  record the next pass and keep status `pending`
- ignore this only when the user explicitly asks for a single-pass review

## Confidence Score

Score every review pass from `0.00` to `1.00`.

Weights:

| Dimension | Weight |
| --- | ---: |
| React 19.2 runtime performance | 0.20 |
| Slate-close unopinionated DX | 0.20 |
| Plate and slate-yjs migration shape | 0.15 |
| Regression-proof testing strategy | 0.20 |
| Research evidence completeness | 0.15 |
| shadcn-style composability and hook/component minimalism | 0.10 |

Score evidence rules:

- Every dimension score must cite concrete evidence: plan section, source file,
  test/browser contract, research page, or ledger row.
- A dimension without cited evidence cannot score above `0.80`.
- Research evidence cannot score above `0.85` without current citations for the
  external systems or local repos the review relies on.
- Regression-proof testing cannot score above `0.80` without named replayable
  browser/unit/stress contracts.
- Migration shape cannot score above `0.85` if applicable Plate/plugin or
  slate-yjs/collab answers are missing.

Completion threshold:

- total score `>= 0.92`
- no dimension below `0.85`
- no unplanned P0/P1 issue
- every dimension score has cited evidence
- no unresolved contradiction in the research layer
- no missing acceptance criteria for implementation
- no public API surface left in "maybe" language
- every major breaking/paradigm change has an accepted objection-ledger row
- extension/plugin/collaboration/data-model changes have Plate/plugin and
  slate-yjs/collab answers when applicable
- no objection-ledger row is `unresolved`, `revise`, or `drop` without a
  corresponding plan response
- pass schedule is complete
- pass-state ledger proves earlier passes completed before closure
- plan deltas from review are recorded

If any gate fails, status stays `pending`.

## Plan Shape

The plan must include:

1. Current verdict.
2. Confidence scorecard with evidence references.
3. Source-backed architecture north star.
4. Public API target.
5. Internal runtime target.
6. Hook/component/render DX target.
7. Plate migration target.
8. slate-yjs migration target.
9. Legacy regression proof matrix.
10. Browser stress / parity strategy.
11. Hard cuts and rejected alternatives.
12. Slate maintainer objection ledger with ecosystem answers when triggered.
13. Pass schedule and pass-state ledger.
14. Plan deltas from review.
15. Open questions and what would change the decision.
16. Implementation phases with owners.
17. Fast driver gates.
18. Final completion gates.

## Pass Schedule

Run the review as passes, not one giant essay:

1. Current-state read and initial score.
2. Research and live-source refresh.
3. Performance, DX, unopinionated-core, migration, regression, research, and
   simplicity pressure passes.
4. Slate maintainer objection ledger.
5. Ecosystem maintainer pass when triggered.
6. Revision pass that answers objections and updates the plan.
7. Closure score and final gates.

After each pass, update the active plan with pass status, evidence, changes,
and next owner. Keep `tmp/completion-check.md` as `pending` while any pass or
revision remains runnable.

Pass-state ledger rows must include:

- pass name
- status: `pending`, `in_progress`, or `complete`
- evidence added
- plan delta
- open issues
- next owner

Do not mark multiple major passes complete in one activation. Finish the current
pass, refresh `tmp/continue.md`, keep status `pending`, and let the next
activation run the next pass.

## Slate Maintainer Objection Ledger

Simulate a skeptical Slate maintainer and a serious downstream Slate user
reviewing the plan. The goal is to prevent "they changed things for no reason."

For every major breaking or paradigm change, record:

- Change: exact API, runtime, or test contract being changed.
- Who feels pain: raw Slate user, Plate maintainer, slate-yjs maintainer, plugin
  author, app author, test author, or browser-runtime maintainer.
- Likely objection: the strongest fair complaint, written in the user's
  language.
- Why this is not change for change's sake: concrete payoff, not vibes.
- Evidence: repo fact, browser regression class, benchmark concern, external
  research, or legacy limitation.
- Rejected alternative: closest Slate-compatible option and why it is weaker.
- Migration answer: how a Slate user gets from old shape to new shape without
  feeling tricked.
- Docs / example answer: what public explanation or example proves the change.
- Regression proof: slate-browser, unit, integration, stress, or parity coverage
  required.
- Ecosystem answers, when triggered: Plate/plugin author answer and
  slate-yjs/collab maintainer answer.
- Verdict: `keep`, `revise`, `drop`, or `unresolved`.

Ledger rows are mandatory for changes like:

- read/update transaction lifecycle
- replacing broad `editor.*` mutation surfaces with scoped state/tx access
- moving helpers into `editor.state`, `editor.tx`, or equivalent namespaces
- target refs instead of renderer-local `actions`
- runtime-owned void/atom shells
- removing `children`/spacer responsibility from app void renderers
- `onChange`/commit callback naming and semantics
- `onKeyDown` command contract and removal or renaming of `onKeyCommand`
- hook renames such as `useSlateStatic`
- schema/predicate/spec replacements for `isInline`, `isVoid`, `markableVoid`,
  and selectable checks
- generated browser parity and stress-test contracts as release gates
- deleting compatibility aliases before publish

Rules:

- No breaking/paradigm change may score above `0.85` in DX or migration unless
  it has a ledger row with a convincing answer.
- A ledger row is accepted only when its verdict is `keep` and every required
  field is concrete: evidence, rejected alternative, migration answer,
  docs/example answer, regression proof, and ecosystem answers when triggered.
- A row is not accepted if a required field is missing, says `TBD`, says only
  "cleaner architecture", or lacks proof that a real user problem is solved.
- If the best answer is only "cleaner architecture", the verdict is `revise` or
  `drop`.
- If an ecosystem-triggering change has a weak Plate/plugin or slate-yjs/collab
  answer, the verdict is `revise` or `unresolved`.
- `unresolved`, `revise`, or `drop` rows must feed back into the plan before
  completion can be `done`.
- Reuse prior ledger rows when rerunning this skill, but revalidate them against
  the latest plan.

## Ecosystem Maintainer Pass

Do not create separate full ledgers by default. Trigger this pass only when the
proposal changes extension, plugin, collaboration, operation, identity,
normalization, snapshot, or data-model behavior.

For each triggered ledger row, add two short answers:

- Plate/plugin maintainer: can Plate expose this without wrapping every core
  call, losing composition, or becoming a compatibility junk drawer?
- slate-yjs/collab maintainer: do operations, identity, snapshots,
  normalization, remote apply, and conflict behavior stay deterministic?

For core API/data-model changes, also name:

- exact affected extension points
- Plate/plugin migration surface
- slate-yjs/collab contract affected
- proof required before closure

The pass exists to catch ecosystem breakage, not to veto every core cleanup. If
the change is raw-Slate-only, say why this pass does not apply and move on.

## Plan Deltas From Review

Every review pass must either change the plan or explicitly defend no change.

Record:

- added decisions
- revised decisions
- dropped decisions
- strengthened acceptance criteria
- new tests/proof rows
- unresolved items moved to the next pass
- no-change decisions with the evidence that made change unnecessary

If pressure passes produce no plan delta and no explicit no-change defense, the
review is a rubber stamp and completion stays `pending`.

## Pressure Passes

Before raising the score above threshold, run these passes and record the result
in the plan:

- Performance pass: prove the shape avoids global editor subscriptions on hot
  paths.
- DX pass: prove the shape is close enough to Slate terminology without copying
  bad legacy footguns.
- Unopinionated-core pass: prove the shape does not turn Slate v2 into a Plate
  replacement.
- Migration pass: prove Plate and slate-yjs have a believable route.
- Regression pass: prove bugs are caught by generated browser contracts, not
  example-by-example patching.
- Research pass: prove Lexical, ProseMirror, and Tiptap were used as evidence,
  not decoration.
- Simplicity pass: remove overbuilt props, aliases, shims, and speculative API
  layers.
- Slate maintainer pass: challenge every breaking/paradigm change as if
  reviewing a Slate PR; record objections and answers in the ledger.
- Ecosystem maintainer pass: only when triggered, add Plate/plugin and
  slate-yjs/collab answers to the same ledger row.

## Complete-Plan Bridge

When the score is below threshold and a runnable next move exists:

1. Update the plan with the current score, evidence, rejected tactics, and next
   owner.
2. Keep `tmp/completion-check.md` as `pending`.
3. Use `complete-plan` to refresh `tmp/continue.md`.
4. Scope-lock the continuation prompt to plan/research/review work only.
5. Continue the next review/refinement slice.

Do not use `complete-plan` from this skill to execute Slate v2 code changes.
The user reviews the finished plan first. Execution starts only after a later
explicit execution request.

## Final Response

When the plan is still pending, say what score remains and what the next owner
is.

When the plan reaches `done`, say:

```md
Slate review plan is ready for user review: [docs/plans/...](docs/plans/...)
```

Do not paste the whole plan into chat.
