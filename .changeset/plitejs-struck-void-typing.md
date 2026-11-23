---
'plitejs': patch
---

Fix typing after a block void such as an image is suggested for deletion being refused when that void is the only block. The letter starts a new proposed paragraph again, as it did before writes into a struck code block were refused. A block void's hidden text never counts as a struck block's text.
