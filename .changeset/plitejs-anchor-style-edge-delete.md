---
'plitejs': patch
---

- Make a `nearest` range anchor one point, and drop a `drop` range anchor, when one update deletes all of its text across a mark change, such as from plain into bold text, so a letter typed there later stays outside the range.
