---
'platejs': major
---

Replace `FindReplacePlugin` and `decorateFindReplace` from `@platejs/find-replace` with `BaseFindPlugin` from `platejs/find`. Matches can now span links and other inline nodes.

**Migration:** Install the copied `FindKit`, or add `BaseFindPlugin` and call `editor.plugin(BaseFindPlugin).api.search(query)` where you set the `search` option. Remove `decorateFindReplace` imports and reads of `KEYS.searchHighlight`. Matches render as decorations with `data-find-match` and `data-find-active` attributes instead of `search_highlight` leaves.
