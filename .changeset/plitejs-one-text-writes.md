---
'plitejs': patch
---

- Fix a paste into a code block, or any element whose schema allows one text, being refused in Editing and in your own pending code block in Suggesting.
- Fix a letter or newline typed in Editing at the start or end of a pending code block, or in an empty one, being refused. The text now joins the block's suggestion.
- Fix a letter or paste in Editing being refused in a code block whose text holds another author's pending format, such as a color.
- Refuse typing, Enter, paste, Backspace, Delete and mark toggles in a code block whose deletion is pending, in Suggesting and Editing, instead of landing the edit beside the block or in its struck text. The refusal reaches `subscribeRefusals` as `unrepresentable`. Decide the block's pending deletion first.
