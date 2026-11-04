---
"@platejs/markdown": patch
---

- Fix `deserializeMd` dropping a soft line break after a link, mark or inline code, which joined the words on either side of the break.
