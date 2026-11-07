---
'platejs': patch
---

Complete an upload after its editor view turns read-only, unmounts or switches to a preview, refuse a submit from a preview, and report a completion that fails as `completion-error` through `onError` instead of leaving the draft uploading
