# Editor architecture: clipboard and paste

## CodeMirror paste

- CodeMirror flushes observed DOM changes before it handles a paste, reads `text/plain` and `uri-list` data, and carries a linewise-paste state for line copies (`src/input.ts:440-500`, `:695-770`). Source: `c70bacbd4a:docs/plite/research/2026-06-12-oss-clipboard-paste-architecture/README.md:22-23`, `read-log.tsv:4`. Limit: unpinned local `codemirror/view` checkout read on 2026-06-12; CodeMirror has no home of its own.

## Bulk paste mutations

VS Code and ProseMirror both assemble paste mutations before dispatch instead of treating each pasted line as a separate typing gesture. VS Code's PasteOperation builds one replacement command per selection and requests undo boundaries before and after the command group; ProseMirror's default doPaste parses a slice and dispatches a replacement transaction. Evidence: c70bacbd4a:docs/plans/2026-05-05-plite-best-pasting-strategy-ralplan.md:345-382; microsoft/vscode@df2411cf7d8f2e0cfc79109a3bc8eaab2c69165b:src/vs/editor/common/cursor/cursorTypeEditOperations.ts:653-731 and ProseMirror/prosemirror-view@c752c6ef7225199f73cb433dd3179e7d69b840d8:src/input.ts:634-645. VS Code's text-buffer model does not establish rich-text fitting semantics, and these reads provide no comparative timing.
