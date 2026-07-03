---
"@platejs/docx-io": patch
---

Skip remote image URLs by default during DOCX export.

**Migration:** Convert trusted remote images to data URIs before calling `htmlToDocxBlob`, or pass `allowRemoteImages: true` only when the HTML source is trusted.
