---
'@udecode/plate-docx-serializer': patch
---

Fix:
- convert docx `mso-spacerun: yes` to spaces 
- indent was not working with margin left values including a dot, e.g. `10.0pt`
- docx italic style
- code block
- inline code