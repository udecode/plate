---
date: 2026-04-09
topic: slate-v2-library-docs-truth-pass
status: completed
---

# Slate v2 Library Docs Truth Pass

## Goal

Align the library/package front-door docs with the recovered live surfaces.

## Completed

- updated `docs/libraries/slate-react/slate.md` to use the current readonly
  callback/value shapes
- updated `docs/libraries/slate-react/README.md` to name the current runtime
  surface instead of a generic sub-library description
- updated `docs/libraries/slate-react/hooks.md` and
  `docs/libraries/slate-react/react-editor.md` to use the current editor/node
  signatures
- updated `docs/libraries/slate-history/README.md` to name the actual
  `withHistory` / `HistoryEditor` helper surface
- updated `docs/libraries/slate-history/history.md` to match the current
  `HistoryBatch` shape and remove the fake `History.isHistory(...)` claim
- updated `docs/libraries/slate-react/README.md` to name the current runtime
  surface instead of a generic sub-library description
- expanded `docs/libraries/slate-hyperscript.md` from a one-line stub into a
  real package front door with current exports and examples
- updated `packages/slate-hyperscript/Readme.md` to match the live package
  surface and workspace proof lane
- updated the package front doors:
  - `packages/slate/Readme.md`
  - `packages/slate-react/Readme.md`
  - `packages/slate-history/Readme.md`

## Verification

- readback of the touched docs
- `yarn lint:typescript`
