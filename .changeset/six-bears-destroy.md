---
"@udecode/plate-table": patch
---

Table row insertion: cells in a newly added row will now receive header styling only if they satisfy specific criteria:
- Every cell in the column is a header cell,
- The table contains more than one row, or
- The column possesses a predefined header property.
