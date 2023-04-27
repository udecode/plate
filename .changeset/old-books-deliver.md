---
"@udecode/plate-media": patch
---

- Fix freeze on image upload: This patch adds a check to ensure the given URL is valid before parsing and extracting video data using `js-video-url-parser` in the `parseVideoUrl` function.
- Fix insert CSV: This patch modifies the logic in the `withImageUpload` function to ensure that it processes file uploads only if there is no plaintext present.
