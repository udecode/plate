---
'platejs': patch
---

- Upload the `data:` pictures a paste carries, such as Word pictures pasted in Chrome or pictures inside pasted HTML, when `UploadPlugin` has a `client`, a `getUrl` and an image rule. Each picture lands as an upload draft, and the finished image keeps the picture's alt text and caption. A set the upload rules refuse stays as pasted and calls `onError` once.
- Send no upload request for a pasted, dropped or `update.submit` file when its draft is cancelled or removed, a later update replaces the whole document, or the editor is destroyed before the upload starts. An undo that brings the draft back does not restart it.
