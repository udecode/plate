---
'plitejs': patch
---

- Run insert-text handlers, such as input rules, the link exit and Copilot, on a word confirmed with an input method, so it lands where a typed letter would, inside a plain link and after a bold link
- Run an insert-text handler once per confirmed word, also when it refuses the word, throws or takes it without changing the document
- Record a confirmed word under the editing mode its composition began in when the mode switches mid-composition, and apply the switch to the keys typed after it
- Split another author's pending deletion around a word composed on Android inside struck text, as desktop input methods do
- Undo a word composed over a selection in one step, together with any change an insert handler adds to it
- Fix confirming a word with an input method slowing down as a document grows; it now writes only the text it changed instead of re-rendering text across the whole editor
