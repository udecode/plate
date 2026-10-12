---
'platejs': patch
---

Handle Tab and Shift+Tab on list items in the list plugin, so items nest and un-nest even when Indent's shortcuts are turned off, as `TabbableKit` does. On a range that holds a list item, Shift+Tab also moves each unindented block and each top-level list item out of its blockquote, and that list item leaves its list. Lists leave both keys alone when the selection holds a code block.
