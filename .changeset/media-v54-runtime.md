---
"@platejs/media": major
---

- Move media plugins and transforms to the Base editor transaction API
- Honor disabled file drops and upload configurations without a file-size limit
- Target image, embed, and placeholder insertion through exact `at` locations
- Publish pending upload state only after its placeholder transaction commits
- Expose `MediaPluginConfig` for floating-media URL controls
- Register media URLs, captions, and placeholder properties in compiled schemas
