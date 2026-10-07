---
"@platejs/docx-io": patch
---

Fix `line-height` export: `px`, `pt`, `cm` and `in` values become an absolute line height, `%` and unitless values a line multiplier that no longer scales with the font size.
