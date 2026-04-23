---
date: 2026-04-07
topic: slate-v2-doc-stack-review
status: completed
---

# Slate v2 Doc Stack Review

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Review the `docs/slate-v2` stack for duplication, contradiction, and unclear
replacement direction, then recommend the next roadmap/doc cleanup step that
actually improves the path to a real Slate replacement.

## Scope

- core direction docs under `/Users/zbeyens/git/plate-2/docs/slate-v2`
- replacement-claim docs that steer `slate-v2`
- package/docs alignment questions, especially around engine/runtime direction

## Phases

1. Gather the doc set and relevant prior learnings
2. Audit for duplication, contradiction, and drift
3. Rewrite the live stack so the docs match the actual `slate-v2` envelope
4. Verify formatting and stale-term cleanup

## Findings

- `overview.md` is overloaded and no longer behaves like an overview.
- `package-end-state-roadmap.md` still claims queue ownership even though its
  own macro queue is frozen.
- `engine.md` is a greenfield brainstorm but is still surfaced like an active
  primary direction doc.
- `final-synthesis.md` and `cohesive-program-plan.md` still carry too much
  historical phase/slice chronicle to stay in the front-door set.
- `release-readiness-decision.md`, `replacement-family-ledger.md`,
  `replacement-gates-scoreboard.md`, and `full-replacement-blockers.md` are the
  cleanest current-truth docs and should become the canonical replacement set.
- the live set drifted behind the actual repo state:
  - markdown, forced-layout, styling, hovering-toolbar, editable-voids,
    images, embeds, tables, and scroll-into-view were still described as
    comparison-only or later in multiple files even though current seams and
    direct proof lanes exist
- the blocker story also drifted:
  - missing-family language survived after the real blockers had shifted to
    proof depth, shipping-gate enforcement, and perf wording
- the lossless specs were fine, but the root stack needed a cleaner split
  between:
  - live verdict docs
  - lossless reference specs
  - archive/history

## Progress

- created review plan
- reviewed the core direction, roadmap, synthesis, and replacement-claim docs
- rewrote the live `docs/slate-v2` verdict stack against the actual
  `/Users/zbeyens/git/slate-v2` surface
- tightened the linked repo-local envelope docs so the front door and the repo
  say the same thing
