# Editor-Behavior Replan Next Batch

## Goal

Refresh the remaining editor-behavior backlog after release-prep was removed
from roadmap truth, and name the next executable lane without falsifying the
formal backlog order.

## Decision

- Keep the formal backlog exactly aligned with
  `docs/editor-behavior/markdown-parity-matrix.md`.
- Treat `search / find-replace` as the next executable lane.
- Search is now also the formal top backlog item because the docs-only polish
  slice was completed.
- Search belongs to the broader editor-behavior backlog as a cross-surface
  lane, not to the markdown-native lane specifically.
- Do not launch Ralph from the old major PRD/test-spec.

## Truth Backlog

This remains the source-of-truth order:

1. editor-behavior-wide search / find-replace product lane
2. toggle rewrite lane
3. code-drawing / Excalidraw lane
4. collaboration / editor-only lane
5. deferred feature-gap follow-up:
   - richer date MDX payloads beyond the current plain `<date>value</date>` contract
   - richer media/embed source-entry or provider-metadata law beyond the current url+attribute contract
6. streaming improvements only when a real lane needs them

## Next Executable Lane

`search / find-replace`

Why:

- its behavior law is already locked in
  `docs/editor-behavior/markdown-editing-spec.md`
- its deferred rows already exist in
  `docs/editor-behavior/editor-protocol-matrix.md`
- it is a better next Ralph batch than spending the next batch on docs polish
- it is better grounded than jumping straight into the toggle rewrite lane

## Non-Decision

The old split is gone. After the docs-only polish pass, `search / find-replace`
is both the formal top backlog item and the best next executable lane.
That does not make it a markdown-native lane; it is a cross-surface
editor-behavior lane.

## Search Scope For The Next Lane

The next search planning artifacts must cover the locked search law, not just
the current highlight demo:

- current-file search
- seeded search from selection
- next / previous match
- jump-to-selection
- replace
- shared navigation feedback for search jumps
- outline header search

Current implementation reality is still thin:

- `packages/find-replace/src/lib/FindReplacePlugin.ts`
  is highlight plumbing
- `apps/www/src/registry/examples/find-replace-demo.tsx`
  is a demo toolbar over that plumbing
- `packages/find-replace/src/lib/decorateFindReplace.spec.ts`
  covers decoration, not a full search surface

## Required Next Artifacts

Before any Ralph launch for search, create:

- `.omx/plans/prd-editor-behavior-search.md`
- `.omx/plans/test-spec-editor-behavior-search.md`

Those artifacts must map directly to:

- `docs/editor-behavior/markdown-editing-spec.md`
  search law
- `docs/editor-behavior/editor-protocol-matrix.md`
  deferred search rows

## Required Verification For The Search Lane

The search mini test-spec must name concrete verification lanes for:

- package tests
- app integration tests
- browser verification
- shared navigation-feedback coverage

The browser proof must cover at least:

- open current-file search
- seed search from selection
- move next / previous
- replace the active match without corrupting structure
- jump to selection
- search-target navigation feedback

## Command-Doc Drift To Fix

These docs still carry stale post-major routing or stale next-order wording:

- `docs/editor-behavior/commands/README.md`
- `docs/editor-behavior/commands/replan-next-batch.md`
- `docs/editor-behavior/commands/launch-next-ralph-batch.md`

What changes:

- `replan-next-batch.md` should stay generic as the replan operator flow
- `launch-next-ralph-batch.md` should hand off search execution to the new
  search PRD/test-spec instead of the old major artifacts
- `README.md` should reflect honest post-major routing

## Replan Acceptance Criteria

This replan is only valid if:

- the truth backlog matches the parity matrix exactly
- search is named as the next executable lane without reordering the formal
  backlog
- the search lane is explicitly scoped to locked law plus deferred protocol rows
- the next search handoff requires new search-specific planning artifacts
- the command docs are recognized as stale where they still encode old
  major-era routing

## Pre-Mortem

1. Search scope drifts into cross-file or app-shell behavior too early.
   Mitigation: keep the next search PRD limited to locked document-level law.
2. Outline header search gets awkwardly split from shared search/navigation
   feedback.
   Mitigation: keep both in the same search-lane planning pass unless there is a
   written reason to separate them.
3. Search invents one-off highlight/flash behavior instead of reusing the
   shared navigation-feedback primitive.
   Mitigation: require explicit navigation-feedback coverage in the mini
   test-spec and browser proof.
