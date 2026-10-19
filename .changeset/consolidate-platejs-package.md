---
'platejs': major
---

Consolidate the Plate editor API into `platejs`.

**Migration:** Replace `@platejs/*` editor dependencies with `platejs`. Import core, basic nodes, basic styles, code block, indent, link, and list APIs from `platejs` or `platejs/react`. Import pagination from `platejs/pagination` or `platejs/pagination/react`. Import other features from `platejs/<feature>` or `platejs/<feature>/react`, and install the optional peers documented by each selected feature.
