---
date: 2026-04-04
problem_type: logic_error
component: testing_framework
root_cause: logic_error
title: Decorated multi-leaf text needs cumulative offset mapping
tags:
  - slate-browser
  - slate-dom-v2
  - decorations
  - selection
  - offsets
severity: medium
---

# Decorated multi-leaf text needs cumulative offset mapping

## What happened

The first decorated-text browser proof finally hit the next real seam:

- one Slate text node
- multiple DOM text nodes after leaf splitting
- semantic selection setup and assertions through `slate-browser`

Everything still assumed one DOM text node per Slate text node.

That was garbage.

Selections inside later decorated leaves snapped back to the first leaf or
reported the wrong Slate offset.

## What fixed it

Both directions needed cumulative offset mapping across sibling leaf segments:

- `slate-dom-v2` bridge:
  `toDOMPoint(...)` and `toSlatePoint(...)`
- `slate-browser` semantic selection snapshots:
  page-level and root-level helpers

The rule is:

- find the owning `[data-slate-node="text"]`
- find the concrete `[data-slate-string]` / `[data-slate-zero-width]` segment
- sum the true lengths of prior sibling segments
- add or subtract the local offset relative to that segment

Without that, decorated text selection is fake.

## Why this works

Leaf splitting changes the DOM, not the Slate path.

So the mapping cannot use raw native offsets anymore.
It has to translate between:

- cumulative Slate offset within the text node
- local DOM offset within one rendered leaf segment

That is the real decorated-text contract.

## Reusable rule

For any browser or DOM bridge code around decorated text:

- never assume one DOM text node per Slate text node
- decorated leaves require cumulative offset mapping in both directions

If a selection helper or bridge reports offset `1` when you asked for offset
`10`, it is probably counting inside the current DOM segment instead of inside
the whole text node.

## Related issues

- [2026-04-04-v2-editable-text-should-split-leaves-from-projection-slices.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-editable-text-should-split-leaves-from-projection-slices.md)
- [2026-04-04-slate-browser-playwright-helpers-must-normalize-zero-width-selection-and-wait-for-selection-sync.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-slate-browser-playwright-helpers-must-normalize-zero-width-selection-and-wait-for-selection-sync.md)
