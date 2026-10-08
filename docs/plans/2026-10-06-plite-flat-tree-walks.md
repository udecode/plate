---
review_scopes: []
---

# Plite flat-tree parent walks

Status: executed: built and verified; waits on your commit
Playbook: bug-fix
Page: https://claude.ai/artifact/7bTpq1GKLUK68nnm4d2GdN

Plite React walks up from an editor element in five places, each with its own private copy of a "composed parent" helper: scroll-into-view in `editable.tsx`, scroll capture in `selection-controller.ts`, drag auto-scroll in `drag-auto-scroll-target.ts`, the keep-selection-visible marker in `inactive-selection.ts`, and the announcer in `editor-announcement-live-region.tsx`. The first four follow `parentElement`, then the shadow root's host, so for light-DOM content slotted into a shadow tree they skip the slot and every shadow-tree ancestor above it. A scroll container that wraps the slot is then invisible: drag auto-scroll stops at the editor's edge, and selection scroll capture and scroll-into-view miss the real scroller. The accessibility build on 2026-10-06 fixed the same defect in the announcer with a private flat-tree walk and, in its diff panel, flagged the duplication. The owner asked in this session to "Unify Plite's parent walks and fix their slot skip". This plan gives the flat-tree walk one owner in `packages/plitejs/src/dom/utils/dom.ts`, moves all five callers to it and deletes the copies. `closestShadowAware` and `containsShadowAware` keep their composed-tree walk, because they answer DOM containment for editor event targeting, where slot assignment does not make a node a descendant.

## Brief

### What will change?

Scrolling and drag scrolling find a scroll box that wraps an editor placed in a web component slot. One shared helper replaces five copies.

### What could go wrong?

A walk that now passes through slots can find a scroll box or marker it skipped before. Only editors inside web component slots can see this.

## Public API

No public call changes. `getDragAutoScrollTarget` is an internal export whose result now includes a scroller around the slot that projects the root.

```ts before
// packages/plitejs/test/react/root-interaction-controller.test.tsx
const target = getDragAutoScrollTarget({
  clientX: 50,
  clientY: 130,
  rootElement: scroller,
});
```

```ts after
// packages/plitejs/test/react/root-interaction-controller.test.tsx
const target = getDragAutoScrollTarget({
  clientX: 50,
  clientY: 130,
  rootElement: scroller,
});
```

## Main changes

- `getFlatTreeParentElement(element)` in `packages/plitejs/src/dom/utils/dom.ts` returns the assigned slot, else the parent element, else the shadow root's host. It stays internal: `packages/plitejs/src/dom/index.ts` does not export it.
- `scrollRectIntoViewIfNeeded`, `captureScrollOffsets`, `getDragAutoScrollTarget`, `keepsPliteSelectionVisible` and the announcer call it. The change deletes their four private copies, and `canScrollAxis` and `canScrollY` take an `Element`.

## Steps

- [x] 1. Add a drag auto-scroll case to `packages/plitejs/test/react/root-interaction-controller.test.tsx`: a scroller in an open shadow root wraps the slot that projects the root, and `getDragAutoScrollTarget` scrolls it. Run it on the current walk and see it fail. Proof: a failing log and a passing log in the run directory. Closed: `docs/plans/artifacts/2026-10-06-plite-flat-tree-walks/drag-slot-before.log` fails and `drag-slot-after.log` passes.
- [x] 2. Add `getFlatTreeParentElement` to `dom.ts`, move the five callers to it and delete the copies. Proof: the new case passes; the root-interaction, selection-controller, editable-behavior and announcement suites pass; the plitejs typecheck passes. Closed: `docs/plans/artifacts/2026-10-06-plite-flat-tree-walks/suites-final.log` 93 of 93 and the plitejs typecheck exit 0.
- [x] 3. Rerun the announcement Chromium reproductions on the new bytes. Proof: a passing log. Closed: `docs/plans/artifacts/2026-10-06-plite-flat-tree-walks/announce-repro-final.log`, five pass and the dismissed F2 fails as before.
- [x] 4. Run `deslop` and `no-comments` on the product code, then `ultracite fix`, `ultracite check` and `oxlint --type-aware` on the task's files. Proof: decision rows and lint logs. Closed: `writing` rows in the decision log, `docs/plans/artifacts/2026-10-06-plite-flat-tree-walks/lint.log` and `oxlint.out`.

## Proof

The new test fails on the composed walk and passes on the flat walk. The other callers share the same helper, so no caller keeps a private walk that could drift; scroll capture and scroll-into-view have no new test of their own because jsdom does not scroll on selection changes and the helper is the only thing that changed in them.

## Close

What landed, uncommitted in this checkout: `getFlatTreeParentElement` in `packages/plitejs/src/dom/utils/dom.ts`; `editable.tsx`, `selection-controller.ts`, `drag-auto-scroll-target.ts`, `inactive-selection.ts` and `editor-announcement-live-region.tsx` call it, and their private copies are gone; `canScrollAxis` and `canScrollY` take an `Element`; one new case in `packages/plitejs/test/react/root-interaction-controller.test.tsx`.

Proof: the new case fails on the composed walk and passes on the shared one; 93 tests pass across the four caller suites; the plitejs typecheck and lint pass; the announcement Chromium reproductions are unchanged. Limits: scroll capture, scroll-into-view and the keep-selection marker have no slot case of their own and ran only their existing suites; no Chromium run drove them, though the session had a working Chromium Vitest lane. No changeset, because `plitejs` has never published this code; closed shadow roots hide slot assignment from every script, so a scroller inside one is still skipped.

Counts: 4 steps done of 4. No open work.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Which walks change | The five element walks; `closestShadowAware` and `containsShadowAware` keep composed semantics | Move the containment helpers to the flat tree too | flat containment |
| Keep-selection marker | Flat tree, matching the `composedPath()` its focus-in check already uses | Keep the composed walk there | composed marker |
| Tests | One drag auto-scroll case for the scroll walks; the announcer's slot case already exists | A case per caller | test each caller |
