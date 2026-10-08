# Editor architecture: selection and caret

## Drawn selection

- CodeMirror can hide the native selection and draw its own (`src/draw-selection.ts:33-56`), accepting layout work for code-editor affordances such as multiple cursors. Plite rejected that as the rich-text default and keeps native selection affordances unless a specific projected-selection lane, such as partial-DOM huge documents, proves otherwise. Source: `docs/plite/research/2026-06-12-oss-input-selection-architecture/lead-ledger.tsv:6`, `rejected-ledger.tsv:3`, `read-log.tsv:14`. Limit: unpinned local `codemirror/view` checkout read on 2026-06-12.
