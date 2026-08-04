---
'@platejs/markdown': patch
---

Keep custom inline elements inside a table cell's paragraph when deserializing markdown. The cell deserializer recognised only `inlineEquation` as inline, so any other custom inline element was hoisted out of the paragraph and became its sibling. The cell serializer then separated those siblings with `<br/>`, and a second round trip turned that into a newline — silently destroying the element. The check now asks the editor whether the node is inline, which is the same answer the plugin configuration already holds.
