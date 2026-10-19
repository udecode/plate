---
'platejs': patch
---

- Add Files SDK uploads with `BaseUploadPlugin` and `UploadPlugin` from `platejs/upload`, including persisted draft slots, progress, cancellation, and configurable durable URLs.
- Replace an empty block at the selection when `submit` gets no placement option, as a paste does.
- Insert nothing and send `onError` a `does-not-fit` failure when a batch does not fit where it would land.
