---
'platejs': patch
---

Index DOCX export hosts once per render so comments and review revisions anchor inside rendered named roots without colon-delimited key collisions, fix multi-comment offset shifts on shared text nodes, paint review marks across every rendered copy of a shared named root without spanning v1 review bookmarks over foreign roots, and warn on `named-root` only for stored roots not rendered into the DOCX output.
