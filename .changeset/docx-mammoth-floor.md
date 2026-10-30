---
'platejs': patch
---

Require `mammoth` 1.13.0 or later for DOCX import. Older Mammoth versions let a crafted DOCX write onto `Object.prototype`. Text inside `w:customXml` elements now imports.
