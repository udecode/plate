---
'plitejs': minor
---

Move `editor.api.dom.resolveDropTarget` to `editor.api.dom.drag.resolveTarget`, add lossless anchor-preserving `editor.api.dom.clipboard.cut`, fold `DOMEditorClipboardCapability` into `DOMClipboardApi`, strip embeds from handle drag previews, populate `DataTransfer` for read-only drags, scale `paddingSide` on zoomed roots, and guard drag scroll repaints by session and owner.
