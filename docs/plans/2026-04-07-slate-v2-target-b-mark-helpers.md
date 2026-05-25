---
date: 2026-04-07
topic: slate-v2-target-b-mark-helpers
status: in_progress
---

# Slate v2 Target B Richtext Parity And Lists

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Deepen the current `richtext` family without carrying parity debt:

1. clear block-formatting parity floor
2. add honest list behavior
3. harvest supportable legacy rows immediately
4. keep browser proof ahead of more feature expansion

## Scope

1. Finish public mark-helper parity:
   - expanded-selection add/remove
   - leaf host ownership
2. Make block toggles selection-span aware.
3. Add unordered and ordered list toggles with honest unwrap/retoggle behavior.
4. Add indent/outdent only if the current public seam can support it honestly.
5. Harvest supportable legacy rows for each landed seam.
6. Prove all of it through runtime, build, and Chromium example tests.

## Progress

- expanded-selection mark add/remove landed in core and Chromium proof
- `renderLeaf(...)` host ownership landed in `slate-react`
- next:
  - selection-span-aware block toggles
  - unordered/ordered list toggles
  - immediate legacy harvest for those seams

## Findings

- relevant repo learnings mostly reinforce one thing:
  - do not fake selection or wrapper/list semantics with local hacks when the
    underlying container contract already exists
- current v2 core already recognizes:
  - `bulleted-list`
  - `ordered-list`
  - `list-item`
- legacy Slate richtext uses wrapper-list semantics:
  - list format toggles set selected blocks to `list-item`
  - then wrap them in `bulleted-list` or `numbered-list`
