---
'platejs': patch
---

- Fix pasting content copied from the same editor when its text is an image link: the copied content lands instead of a new image block made from the link
- Fix the link plugin's paste rule dropping a paste onto selected blocks: the paste now replaces them, as it does without the rule
