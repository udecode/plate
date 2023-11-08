---
'@udecode/plate-core': patch
---

**This is a breaking change meant to be part of v25, hence the patch.**
On `deserializeHtml`, replace `stripWhitespace` with `collapseWhiteSpace`, defaulting to true. The `collapseWhiteSpace` option aims to parse white space in HTML according to the HTML specification, ensuring greater accuracy when pasting HTML from browsers.
