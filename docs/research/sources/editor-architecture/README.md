# Editor Architecture Sources

This directory holds compiled summaries for the editor-architecture comparison
lane.

Current scope:

- the decorations / annotations / widget architecture lane only

If future editor-architecture work moves into other surfaces, add separate
cluster pages instead of bloating the overlay lane.

Current evidence is grounded in official local repo clones under `../` plus the
local plan docs that already captured the Slate v2 decorations / annotations
research.

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

This directory should not turn into a dump of one-off notes.

Split it further only when the lane needs deeper per-corpus source pages.
