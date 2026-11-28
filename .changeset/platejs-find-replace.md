---
'platejs': patch
---

- Add `FindOptions` (`caseSensitive`, `wholeWord`, `regexp`) to `BaseFindPlugin`'s `api.search(query, options?)`
- Add `update.replace(replacement)` and single-undo `update.replaceAll(replacement)` on `BaseFindPlugin`, skipping locked, void, and non-content ranges
- Replace `FindPluginState.matches` and direct `store.set({ activeIndex })` writes with read-only selectors (`count`, `activeMatch`), `api.matches(options?)`, `api.matchAt(point)`, `api.setActiveIndex(index)`, and scalar `version`

**Migration:** Read matches via `find.api.matches()` (or `find.store.get('activeMatch')` / `find.store.get('count')`) and change the active match with `find.api.setActiveIndex(index)` or `find.api.move(delta)`.
