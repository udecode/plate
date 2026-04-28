# Editor Architecture Sources

This directory holds compiled summaries for the editor-architecture comparison
lane.

Current scope:

- decorations / annotations / widget architecture
- React 19.2 perf architecture
- read/update lifecycle architecture across Lexical, ProseMirror, and Tiptap
- node/text/mark/render DX across ProseMirror, Lexical, and Tiptap

If future editor-architecture work moves into other surfaces, add separate
cluster pages instead of bloating a single mixed summary.

Current evidence is grounded in normalized raw families under `../raw`, official
local repo clones under `../`, plus the local plan docs that already captured
the Slate v2 decorations / annotations research.

## Raw Corpus Availability

As of 2026-04-23, the Lexical, ProseMirror, Tiptap, and Tiptap Docs raw source
families are normalized under `../raw`.

Current raw evidence:

- `../raw/lexical/repo`: official Lexical repo clone.
- `../raw/prosemirror/repo`: official ProseMirror umbrella repo clone.
- `../raw/prosemirror/packages/*`: official ProseMirror package clones for
  architecture evidence.
- `../raw/tiptap/repo`: official Tiptap repo clone.
- `../raw/tiptap/docs`: official Tiptap Docs repo clone.

Disposition:

- strongest evidence found: normalized official raw clones under `../raw`
- raw gap: closed for the current read/update architecture pass
- compile gap: closed for read/update architecture; broader product areas such
  as tables, comments/suggestions, and AI tooling need separate passes if they
  become active

Current pages:

- [decorations-annotations-overlay-corpus.md](docs/research/sources/editor-architecture/decorations-annotations-overlay-corpus.md)
- [prosemirror-mapped-overlays-and-bookmarks.md](docs/research/sources/editor-architecture/prosemirror-mapped-overlays-and-bookmarks.md)
- [lexical-mark-store-and-decorator-split.md](docs/research/sources/editor-architecture/lexical-mark-store-and-decorator-split.md)
- [react-19-2-external-store-and-background-ui.md](docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md)
- [tiptap-comments-suggestions-and-node-range.md](docs/research/sources/editor-architecture/tiptap-comments-suggestions-and-node-range.md)
- [slate-v2-local-proof-substrate.md](docs/research/sources/editor-architecture/slate-v2-local-proof-substrate.md)
- [layout-measurement-and-ime-lanes.md](docs/research/sources/editor-architecture/layout-measurement-and-ime-lanes.md)
- [lightweight-editable-surface-lower-bound.md](docs/research/sources/editor-architecture/lightweight-editable-surface-lower-bound.md)
- [service-channels-and-live-stores.md](docs/research/sources/editor-architecture/service-channels-and-live-stores.md)
- [read-update-runtime-corpus-ledger.md](docs/research/sources/editor-architecture/read-update-runtime-corpus-ledger.md)
- [lexical-read-update-extension-runtime.md](docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md)
- [prosemirror-transaction-view-dom-runtime.md](docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md)
- [tiptap-extension-command-react-dx.md](docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md)
- [node-text-mark-render-dx-corpus-ledger.md](docs/research/sources/editor-architecture/node-text-mark-render-dx-corpus-ledger.md)

This directory should not turn into a dump of one-off notes.

Split it further only when the lane needs deeper per-corpus source pages.
