---
'platejs': patch
---

- Render indent as `margin-inline-start` instead of `margin-left`, in the editor and in static HTML, so indented blocks and nested lists indent from the right in right-to-left text. Copied and serialized HTML keeps `margin-left`, which Word and Outlook read. DOCX export reads either margin as the paragraph's indent.

**Migration:** CSS or code that reads a rendered indented block's `margin-left` reads `margin-inline-start` instead.
