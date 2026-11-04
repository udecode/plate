---
"@platejs/markdown": patch
---

- Read CRLF and CR line endings in `deserializeMd` input as LF, so the value and the `serializeMd` output match the LF version of the same Markdown. Before, CRLF input kept `\r` at the end of code lines, paragraph and list lines, inline code and math, and the serialized output mixed line endings.
