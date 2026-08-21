---
'@platejs/dnd': patch
'@platejs/mention': patch
'@platejs/plite': patch
'@platejs/plite-react': patch
---

Keep block DnD ownership inside its React DnD adapter so native inline drags reach Plite's move transaction. Compose fitted slice replacement through a detached transaction spec so delete-and-reinsert moves publish atomically. Allow inline mentions to move with native drag-and-drop and serialize through HTML clipboard data.

Define mention Markdown conversion on the mention plugin. Conditional mention properties cannot replace decoded children or resolved schema identity.
