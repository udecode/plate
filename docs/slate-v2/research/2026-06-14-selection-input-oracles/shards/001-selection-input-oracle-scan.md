# Selection Input Oracle Scan

## Query Shape

Raw source and test scans looked for:

- `composition`
- `beforeinput`
- `selectionchange`
- `targetRange` / `getTargetRanges`
- `drag`
- `copy` / `paste`
- `undo` / `redo`

The scan covered Lexical, ProseMirror, Tiptap, Monaco, and the current Slate v2
tree. Raw output lives in `docs/research/raw/2026-06-14-selection-input-oracles/`.

## Findings

ProseMirror's composition webtests are the strongest portable lead. They model
composition inside empty blocks, existing text, marks, multi-child marks, cursor
wrappers, decoration changes, and multi-node spans.

Lexical's event runtime independently supports the same direction: composition
events stay browser-owned, beforeinput target ranges are read when reliable, and
selection restoration is used for browser-specific delete/selection quirks.

Slate v2 already has equivalent focused browser coverage in richtext:

- `commits IME composition inside bold markup`
- `commits IME composition through an active mark in an empty block`
- `commits IME composition through an active mark before a formatted sibling`
- `replaces multiple formatted text nodes with Korean IME composition`
- `deletes rich text selection after WebKit compositionend`
- `deletes rich text line selection after WebKit compositionend`

The focused proof command passed 6 rows and skipped 18 explicit browser-scope
rows. No runtime patch is justified from this shard.

## Next Useful Research

The next research packet should avoid repeating composition/targetRange unless a
new bug points there. Better candidates:

- browser-visible selection styling and projected/native highlight conflict
- undo grouping across paste, beforeinput, and IME commits
- clipboard/drop data gauntlet generation from external issue corpora
