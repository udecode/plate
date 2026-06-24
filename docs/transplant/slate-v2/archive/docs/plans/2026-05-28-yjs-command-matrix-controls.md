# Yjs Command Matrix Controls

Expose the collaboration example as a command playground, not just a narrow
demo. The UI should let a tester trigger the visible Slate/Yjs operation
families from buttons. Automated e2e stays focused on concrete collaboration
regressions, not broad UI-control inventory.

## Matrix

- [x] Text: insert, delete, delete backward, delete forward.
- [x] Break: insert break, insert soft break.
- [x] Fragment: insert fragment, delete fragment.
- [x] Nodes: insert, remove, split, merge, move, set, unset, wrap, unwrap, lift.
- [x] Existing controls: marks, blocks, replace, selection, undo, redo,
      reconcile, connect/disconnect.

## Verification

- [x] Do not add generic Playwright rows for button presence or button inventory.
- [x] Keep e2e focused on concrete collaboration cases.
- [x] Run the full Yjs example suite.
- [x] Use dev-browser for a real browser pass after implementation.
