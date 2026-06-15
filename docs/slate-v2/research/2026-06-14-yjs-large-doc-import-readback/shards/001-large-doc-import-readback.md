# Shard 001: Large-Doc Import Readback

Scope:
- Current Slate v2 `@slate/yjs` large-doc sync benchmark and external Yjs binding import strategies.

Sources sampled:
- Slate v2 `YjsController.importFromYjs`, `readSlateValueFromYjs`, and `measureLargeDocSync`.
- Lexical `@lexical/yjs` binding and event sync.
- y-prosemirror sync and undo plugins.
- Yjs event/update internals.
- Yjs document update docs and Lexical collaboration FAQ as web support.

Top leads:
- Add large-doc benchmark phase metrics for local edit vs remote sync/import.
- Defer incremental remote import to architecture after the metric split.
- Use YEvent delta/deep-delta/path substrate as design evidence, not a local helper patch.
- Add focused trace/oracle evidence that remote `applyUpdate` still reaches full import/readback today.

Rejected leads:
- Full runtime remote-import rewrite in this packet.
- Another state-vector sync patch; current benchmark/test helper already use target vectors.
- Copying Lexical or y-prosemirror code.

Score changes:
- `benchmark-large-doc-import-phase`: promoted and kept. It converts the current benchmark from "large-doc is slow" into local edit vs remote sync/import.
- `incremental-remote-import-plan`: defer with owner. It is likely the real fix, but not safe as a micro-packet.
- `remote-apply-import-trace`: promoted and kept. It proves the current remote import path as a full read/replace trace before any incremental import design work, including 256-block remote convergence.

Next query:
- Run browser-visible collaboration proof for the touched remote import path, then continue timed supervision from the weakest remaining Yjs proof row.
