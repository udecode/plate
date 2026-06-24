# Yjs Public Split API Fix

## Goal

Fix `tx.nodes.split({ at: Point })` in `@slate/yjs` so public Slate v2
transaction API users get the same collaboration semantics as keyboard Enter.

## Plan

- [x] Check prior Yjs split/history solution notes.
- [ ] Add a failing core test for public `tx.nodes.split({ at })` export.
- [ ] Fix Yjs split operation replay/export.
- [ ] Add or update focused Playwright coverage for offline split, concurrent
      insert, reconnect, undo.
- [ ] Run focused package/browser verification.

## Findings

- Pure Slate `tx.nodes.split({ at: { path: [0, 0], offset: 4 } })` already
  produces `alph / abeta`.
- The broken path is `@slate/yjs` exporting the resulting split operations into
  the shared Yjs tree.
- Existing split solution says split encoders must keep original `Y.XmlText`
  identity alive and avoid destructive tail replacement.
