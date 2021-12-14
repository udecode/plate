---
'@udecode/plate-basic-marks': minor
---

- bold `deserializeHtml.query`:
  - invalid if a child element has `fontWeight: 'normal'`
- italic `deserializeHtml.query`:
  - invalid if a child element has `fontStyle: 'normal'`
- strikethrough `deserializeHtml.query`:
  - invalid if a child element has `textDecoration: 'normal'`
- underline `deserializeHtml.query`:
  - invalid if a child element has `textDecoration: 'normal'`