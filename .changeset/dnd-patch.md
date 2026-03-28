---
'@platejs/dnd': patch
---

- Fixed server prerender crashes in **`@platejs/dnd`** by returning inert drag-and-drop connectors when DOM DnD is unavailable, preventing `Expected drag drop context` during SSR builds.
