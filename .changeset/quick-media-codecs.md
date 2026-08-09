---
"@platejs/media": patch
---

Define image, file, audio, video, and embed Markdown conversion on the media
plugins. Plate-owned media tags follow their resolved application schema types;
fixed Markdown and HTML image syntax stays literal.
Parsed MDX properties cannot replace media children, URLs, or resolved schema
types; malformed figure input falls through to the Markdown runtime's
schema-aware unknown-node handling.
Declare Markdown image titles in the Image plugin schema so decoded and encoded
titles stay inside the typed persisted contract.
