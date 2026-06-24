# Huge-Document Native Selection Raw Research

Date: 2026-06-12

Compiled artifact:
- `docs/slate-v2/research/2026-06-12-huge-doc-native-selection/README.md`

Raw boundary:
- This folder records source locations and query intent only.
- Do not dump cloned source or generated benchmark artifacts here.
- Source-inspected repos live as sibling checkouts: `../slate`,
  `../prosemirror`, `../lexical`, `../tiptap`.

Query scope:
- huge-document vertical selection behavior and performance
- native selection versus projected/model selection
- repeated `Shift+ArrowDown` / `Shift+ArrowUp`
- select-all delete / undo restoration cost
- cross-editor proof design from Slate, ProseMirror, Lexical, and Tiptap

Discarded bulk:
- Broad `rg` over all editor repos was too noisy because it hit changelogs,
  lockfiles, generated Flow output, and generic selection references. The kept
  read log uses direct source slices instead.
