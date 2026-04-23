---
date: 2026-04-06
topic: slate-v2-links-paste-html-tranche
status: completed
---

# Slate v2 Links + Paste-HTML Tranche

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Execute the next inline-family migration slice after mentions:

- seeded and selection-wrapped inline links
- app-owned HTML paste policy for paragraphs plus links

## Scope

- minimal runtime seam:
  `onPaste` forwarding on `Editable` / `EditableBlocks`
- one v2-native `links` surface
- one v2-native `paste-html` surface
- browser proof for:
  - seeded link rendering
  - selection-wrapped link insertion
  - app-owned HTML paste into current paragraph and link shapes
- roadmap/doc sync

## Non-Goals

- no restoration of legacy `withInlines` / `insertData` override architecture
- no mark deserialization parity for legacy rich HTML
- no generic inline plugin system

## Outcome

Completed as a conservative slice.

Landed:

- `onPaste` forwarding in the runtime
- v2-native `links` and `paste-html` examples
- dedicated Playwright proof lanes
- widened replacement matrix with legacy/current links rows
- roadmap/docs sync that keeps HTML paste explicitly app-owned

Still later:

- richer HTML formatting policy
- link auto-wrap from pasted URL as a roadmap claim
- full legacy inline parity
