---
'plitejs': patch
---

- Fix the text after the caret taking the last pasted block's properties, such as `checked`, and losing the destination block's, such as `align`, when you paste a copy of quoted paragraphs into the middle of a quoted paragraph. It now keeps the destination block's properties, as Return splits them.
- Fix pasting blocks that equal the destination block into its middle keeping a `split: 'drop'` property and the destination's unique value on the text after the caret. That text now gets the properties Return gives it.
