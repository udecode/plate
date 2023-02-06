---
"@udecode/plate-core": patch
---

fix: `useElement` should not throw an error if the element is not found. It can happen when the document is not yet normalized. This patch replaces the `throw` by a `console.warn`.
