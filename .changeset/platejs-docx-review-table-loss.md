---
'platejs': patch
---

Report a `lossy-content` diagnostic with the table's path when a review DOCX export includes a table that holds a pending row, column or table format change, also when the export returns the retained source file unchanged. Word's revisions cannot carry that change, so the default `lossPolicy: 'reject'` refuses the export. Pass `lossPolicy: 'allow'` to export the file with the warning.
