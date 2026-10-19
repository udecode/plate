---
'plitejs': patch
---

Add `setRetainedTextFlowRendererCapability` to `plitejs/react`. It marks a custom `renderLeaf` or `renderText` as safe to skip during retained text flow, beside `setDOMTextSyncRendererCapability`.
