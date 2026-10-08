# Editor architecture: clipboard and paste

## CodeMirror paste

- CodeMirror flushes observed DOM changes before it handles a paste, reads `text/plain` and `uri-list` data, and carries a linewise-paste state for line copies (`src/input.ts:440-500`, `:695-770`). Source: `docs/plite/research/2026-06-12-oss-clipboard-paste-architecture/README.md:22-23`, `read-log.tsv:4`. Limit: unpinned local `codemirror/view` checkout read on 2026-06-12; CodeMirror has no home of its own.
