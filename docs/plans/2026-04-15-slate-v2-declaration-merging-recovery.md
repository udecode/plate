---
date: 2026-04-15
topic: slate-v2-declaration-merging-recovery
status: active
---

# Slate v2 Declaration Merging Recovery

## Goal

Recover the legacy declaration-merging typing contract in package code first,
then remove the example-side bandaids that only existed because the package
surface drifted.

## Source Of Truth

- `.agents/rules/repair-drift.mdc`
- legacy `slate` CustomTypes fixtures under
  `/Users/zbeyens/git/slate/packages/slate/test/interfaces/CustomTypes`
- current package surfaces under:
  - `/Users/zbeyens/git/slate-v2/packages/slate`
  - `/Users/zbeyens/git/slate-v2/packages/slate-react`
  - `/Users/zbeyens/git/slate-v2/packages/slate-history`

## Phases

1. Audit legacy declaration-merging contract vs current package exports/types
2. Recover package-side aliases and merge seams in `slate`
3. Recover package-side composition helpers in `slate-react` / `slate-history`
4. Remove downstream bandaids in examples/tests
5. Verify package, site, and targeted browser proof

## Findings

- Legacy `CustomTypes` covered more than `Editor` / `Element` / `Text`; it also
  covered `Node`, `Point`, `Range`, `Selection`, and `Operation`.
- Current docs/ledgers explicitly classify `CustomTypes` as a hard cut, so this
  work will need doc cleanup after the code truth is restored.
- Current `RenderElementProps` is nongeneric, so narrowing `element.type` does
  not narrow the whole props object in examples like `check-lists`.

## Progress

- Phase 1 complete: legacy fixtures and current package seams loaded
- Phase 2 complete: `slate` now restores base aliases and the `ExtendedType`
  seam for editor/element/text/point/range/selection/operation contracts
- Phase 3 complete: `slate-react` restores package-side custom-types
  augmentation and shared render-element typing; `slate-history` now composes
  from `BaseEditor` again
- Phase 4 complete: removed a first batch of example-side casts and prop-shape
  bandaids that only existed because the package type surface drifted
- Phase 5 current read:
  - package build/typecheck is green for `slate`, `slate-history`,
    `slate-react`
  - site typecheck is green
  - focused browser batch is green for:
    - `embeds`
    - `iframe`
    - `images`
    - `inlines`
    - `mentions`
    - `search-highlighting`
  - `paste-html` still has one red Playwright row, but the failure is a strict
    locator ambiguity in the test (`textbox.locator('code')` resolves to three
    nodes), not a typing regression from this recovery
  - `check-lists` still has separate checkbox behavior debt; that proof lane was
    not closed by this typing recovery
