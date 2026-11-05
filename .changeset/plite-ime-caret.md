---
'plitejs': patch
---

Keep native IME preedit and commits at the caret beside inline links and custom text renderers, and at the end of the preedit in an empty paragraph. Keep the caret after the preedit when a composition replaces a selection, including all the text before an inline element such as a mention, and when a composition starts in an empty text beside an inline element. Preserve cross-block replacement content and deferred decoration updates when composition moves between paragraphs. Keep an empty paragraph typeable after its composition is cancelled, such as with Escape. Keep native IME composition in a same-runtime child root, such as an editable void's body, so iOS pinyin shows its underlined preedit, commits once, and Backspace deletes text instead of the void.

Fix Android composition so Korean and Japanese text stays intact, and Backspace keeps an empty paragraph available for further typing. Preserve the insertion point after replacing a selected word or completing a mention. Keep soft line breaks intact, discard handled inputs' targets, and retain the destination paragraph after a composition replaces multiple paragraphs.
