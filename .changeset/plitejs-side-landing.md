---
'plitejs': patch
---

- Add side landings: `editor.api.transfer.move({ nodes, to: { key, side: 'end' } })` places blocks beside a block when a plugin describes what to build through the `editorReads.transfer.side` read, and refuses with `policy` otherwise. A side takes only a move inside one document.
- Add `editor.read.transfer.check(input)`, the dry run the drop indicator paints from.
- Pass `wrap` to `transferVeto` contributions for a side landing, whose blocks land inside the built shell.
- `editor.api.dom.resolveDropTarget` returns `{ key, side }` while a move's pointer rests in a block's inline-end strip, or in the editor's side padding beside a top-level block, and a plugin builds side landings; narrow with `'edge' in target` before reading `edge`. Padding counts once the pointer is 20px past where the drag started, so a straight drag down from a drag handle still lands above or below.
- Fix the drop indicator staying at its old position while content scrolls under a held block drag.
- Fix a block drag over a button or other control inside the editor painting no drop indicator and ignoring the drop.
