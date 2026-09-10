---
"platejs": major
---

- Keep AI Markdown source, target identity, and review content in a detached operation. Accept writes one history batch; discard preserves the document and redo history.
- Use `AIChatPlugin.api.start`, `receive`, `finish`, `stop`, `retry`, `accept`, and `discard` for streaming and review. Retire chunk insertion, temporary AI anchors, preview rollback helpers, and `useChatChunk`.
- Render immutable documents through `PlateStatic.value` with optional static presentation descriptors. Static node props expose document queries for displayed content, named roots, clipboard extraction, and heading anchors.
- Select table-of-contents headings through document nodes and return paths; live and static rendering supply their own identities.
- Preserve owned immutable plugin state branches across publications and static render updates; retain defensive copying for external values.
- Preserve shared suggestion identities while projecting partial edits and comment ranges through canonical nonpublishing transactions.
- Reuse immutable render context props and preserve the static draft subtree across status-only updates.
