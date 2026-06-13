# Shard 001: beforeinput target ranges

Sources sampled:

- WPT `input-events-get-target-ranges-during-and-after-dispatch.tentative.html`
- WPT `input-events-get-target-ranges-non-collapsed-selection.tentative.html`
- WPT `input-events-get-target-ranges.js`
- Slate `selection-reconciler.ts`
- Slate `selection-reconciler-contract.test.tsx`

Top lead:

- `wpt:beforeinput-target-range-dispatch-snapshot`: event target ranges are the
  stable operation target even if live selection changes in another listener.
- `wpt:editing-host-removal-selection-collapse`: host/root removal can collapse
  browser selection to the removed host's parent; Slate should ignore the
  outside parent selection instead of importing it.

Promoted packet:

- Added `beforeinput uses event target range instead of later live DOM selection`
  in `slate-react` selection reconciler contracts.
- Added `selectionchange ignores host-removal collapse outside the editor` in
  `slate-react` selection controller contracts.

Rejected/Deferred:

- Do not port WPT harness mechanics.
- Defer expanded-selection browser variants until a route-visible failure or
  native `getTargetRanges()` claim needs browser proof.
- Close cE=false caret-boundary navigation as `kept-existing`: Slate's
  content-root navigation contracts and editable-void browser rows already
  prove the portable invariant.

Next query:

- WPT shadow selection rescoping only if a future Slate route bug points at
  shadow-root selection after DOM mutation.
