---
"@platejs/media": major
---

Move media plugins and transforms to the Base editor transaction API, compose image upload and embed clipboard handlers, honor disabled file drops, and allow upload configs without a file-size limit.

Use `at` to target the block after which images and media embeds are inserted. Placeholder uploads keep exact `at: Path` insertion for replacement and multi-file placement.

Expose `MediaPluginConfig` for floating-media controls that read URL validation and transform options.
