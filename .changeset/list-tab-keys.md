---
'platejs': patch
---

Handle Tab and Shift+Tab on list items in the list plugin, so items nest and un-nest even when Indent's shortcuts are turned off, as `TabbableKit` does. On a range that holds a list item, Shift+Tab also moves each unindented block and each top-level list item out of its blockquote, and that list item leaves its list. Lists leave both keys alone when the selection holds a code block.

Tab, Shift+Tab and `editor.update.list.outdent()` move a list item together with the blocks under it, its nested items and continuation paragraphs. Dragging or cutting a list item through `editor.read.transfer.nodes()` takes those blocks too. Indent's own commands, such as the toolbar's indent buttons, still move one block. List writes each moved block's depth itself, so an app that overrides Indent's `increase` or `decrease` no longer runs that override when a list item moves on Tab, Shift+Tab or `outdent`.
