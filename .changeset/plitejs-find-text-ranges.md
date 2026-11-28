---
'plitejs': patch
---

- Split inline text runs around inline void elements in `NodeApi.findTextRanges` so matches cannot bridge inline voids
- Fix case-insensitive literal match offsets in `NodeApi.findTextRanges` when text contains characters whose lowercase form changes UTF-16 length (such as `'İ'`)
