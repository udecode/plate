# ProseMirror: clipboard and paste

## Paste during composition and slice metadata

- ProseMirror skips its JavaScript paste handling while a composition is active, except on Android, and otherwise parses the clipboard and dispatches a paste transaction (`src/input.ts:590-667`). Rich paste carries explicit slice metadata: the `data-pm-slice` attribute with open depths and context, WebKit space restoration, and a wrapper map for content such as table rows (`src/clipboard.ts:1-260`). Source: `docs/plite/research/2026-06-12-oss-clipboard-paste-architecture/README.md:18-21`, `read-log.tsv:2-3`. Limit: unpinned local `prosemirror-view` checkout read on 2026-06-12.
