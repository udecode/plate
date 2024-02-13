---
"@udecode/plate-serializer-html": patch
---

- Fix handling of empty `preserveClassNames` array
  - Previously, would output `<div class="                 ">`
  - Now, it outputs `<div>`
- Reduce time complexity of `stripClassNames` function
