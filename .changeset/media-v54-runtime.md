---
"@platejs/media": major
---

Move media plugins and transforms to the Base editor transaction API, compose image upload and embed clipboard handlers, honor disabled file drops, and allow upload configs without a file-size limit.

Use `after` for image and media-embed block references. Placeholder uploads keep exact `at: Path` insertion and insert multi-file batches in one transaction.
