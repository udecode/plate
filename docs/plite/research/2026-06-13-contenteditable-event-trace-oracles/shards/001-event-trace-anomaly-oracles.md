# Shard 001: Event Trace Anomaly Oracles

## Why This Matters

Final value assertions miss a nasty class of editor bugs. The model can end up
with the right text while the browser selection jumped, `beforeinput` targeted a
different node, native composition state moved, or the DOM mutated outside the
claimed owner.

`easylogic/contenteditable` is valuable here because its playground records the
operation as an event chain and compares the browser's native intent with the
DOM that actually changed.

## Strong Invariants

- Event order is proof. Selection, `beforeinput`, `input`, and composition
  events should be captured around the operation that is under test.
- `beforeinput.getTargetRanges()` matters. It is the browser's stated edit
  target and should be compared with the model/native selection where possible.
- DOM delta matters. For delete, replace, paste, and composition, the proof
  should know which text nodes were added, deleted, modified, or moved.
- Endpoint identity matters. Parent/container mismatch can reveal a stale DOM
  owner even when final text looks right.
- Geometry matters. Deleted/added rects and target-range rects catch visual
  bugs such as double highlight, stale projected selection, or wrong visual row.
- Anomaly names matter. The output should call out missing beforeinput,
  parent/node mismatch, data mismatch, selection jump, text leak,
  node-type-change, composition mismatch, and sibling creation instead of
  leaving the reviewer to infer them from raw logs.

## Plite Routing

Do not add this as product UI. Promote it as `plite-browser` proof machinery
when a bug needs manual event tracing for selection/input/IME behavior.

The first helper shape should collect:

- native `selectionchange`, `beforeinput`, `input`, `compositionstart`,
  `compositionupdate`, and `compositionend` events;
- `window.getSelection()` anchor/focus, selected text, and direction if
  available;
- `beforeinput.inputType`, `data`, `isComposing`, and `getTargetRanges()`;
- beforeinput text-node snapshots and input-time DOM deltas;
- rects for target ranges, deleted ranges, added ranges, caret, and selection;
- anomaly flags with stable names.

Keep raw-IME and mobile claims out of this helper unless the run has a real
device lane. Synthetic Playwright can validate browser event shape and Plite
ownership, not OS candidate-window behavior.
