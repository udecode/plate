---
title: Slate v2 post-closure architecture review
type: decision
status: accepted
updated: 2026-04-24
source_refs:
  - docs/slate-v2/absolute-architecture-release-claim.md
  - docs/plans/2026-04-24-slate-v2-absolute-architecture-closure-plan.md
  - docs/research/decisions/slate-v2-read-update-runtime-architecture.md
  - docs/research/systems/slate-v2-perfect-plan-steal-reject-defer-map.md
related:
  - docs/research/decisions/slate-v2-data-model-first-react-perfect-runtime.md
  - docs/research/decisions/slate-v2-perfect-plan-should-steal-read-update-transaction-discipline-and-extension-dx.md
---

# Slate v2 post-closure architecture review

## Decision

Do not pivot to Lexical, ProseMirror, or Tiptap.

The Slate v2 direction is still the best Slate-shaped architecture:

- Slate model and operations as collaboration truth
- Lexical-style `editor.read` / `editor.update`
- ProseMirror-style transaction and DOM-selection authority
- Tiptap-style extension ergonomics
- React 19.2 runtime using live reads, dirty commits, semantic islands, and
  projection sources

The honest post-closure status is stronger than "promising", but still not
"impossible to regress".

## What Is Strong

- `editor.update` is the right public write boundary.
- Primitive editor methods inside `editor.update` preserve Slate's flexible
  custom-node DX better than semantic method explosion.
- `EditorCommit` is the right local runtime fact for history, collaboration,
  React, DOM repair, and tests.
- Generated browser gauntlets now assert model state, DOM state, DOM selection,
  focus owner, commit metadata, kernel trace, and follow-up typing.
- Primary examples are guarded against `Transforms.*`, stale mutable editor
  fields, and direct method replacement patterns.

## What Is Still Not Absolute

- Compatibility still exists. Direct primitive calls outside `editor.update`
  currently auto-transaction instead of failing everywhere.
- `Transforms.*` still appears in internal runtime, legacy transform tests,
  history tests, and compatibility lanes. That is acceptable only because the
  primary public surface is guarded.
- Public state mirrors are read-only, but still present. They are not the
  final cleanest possible API shape.
- Kernel authority is audited by inventories and contracts, but the source
  still contains explicit bridge/worker escape hatches. That is disciplined,
  not mathematically closed.
- The automated mobile claim is scoped. Semantic mobile handles and Playwright
  mobile viewport rows are not raw human-device keyboard, clipboard, glide, or
  voice proof.
- The React huge-document claim has an accepted caveat: direct model-only
  typing into an unpromoted middle shell remains slower than the promoted
  editing corridor.

## Harsh Take

The architecture is the right one. The remaining risk is not "wrong engine";
it is proof maturity and escape-hatch pressure.

If future cursor regressions keep appearing, the answer is not another API
pivot. The answer is to harden proof:

- real persistent-browser gauntlets, not only Playwright rows
- generated scenario expansion with shrinking and replay artifacts
- device-lab/Appium lanes before native mobile claims
- tighter allowlists for every `Transforms.*`, public mirror, repair bridge,
  and selection bridge use
- development/test assertions that fail illegal kernel ownership transitions
  at runtime, not only through inventory counts

## Confidence

Architecture direction: high.

Implementation closure for the scoped release claim: high.

Regression-free browser editing across unknown user behavior: not high enough
to claim perfection. Browser editing earns confidence through adversarial soak,
real-device coverage, and dogfooding, not through a closed plan file.

