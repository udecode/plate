---
'plitejs': patch
---

- Fix `tx.text.insert` over a range or path that covers the whole document when the document starts with something other than an editable text block. When the first block holds blocks, such as a quote, a code block, columns or a table, the text lands where deleting that range lands. Before, it went straight into that block, and a schema that requires blocks there threw. When the document's first text sits in a void, an atom or a read-only block, typing changes nothing. Before, it wrote into that block, deleted it or threw. With `voids: true`, a void that is not read-only still takes the text when the first block holds text, as before
