---
'plitejs': patch
---

Keep native IME preedit and commits at the caret beside inline links and custom text renderers, and at the end of the preedit in an empty paragraph. Preserve cross-block replacement content and deferred decoration updates when composition moves between paragraphs. Keep an empty paragraph typeable after its composition is cancelled, such as with Escape.

Fix Android composition so Korean and Japanese text stays intact, and Backspace keeps an empty paragraph available for further typing. Preserve the insertion point after replacing a selected word or completing a mention. Keep soft line breaks intact, discard handled inputs' targets, and retain the destination paragraph after a composition replaces multiple paragraphs.
