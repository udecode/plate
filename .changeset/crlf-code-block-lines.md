---
"@platejs/markdown": patch
---

- Fix `deserializeMd` keeping `\r` at the end of fenced code lines for CRLF input; `serializeMd` no longer writes mixed line endings inside the fence.
