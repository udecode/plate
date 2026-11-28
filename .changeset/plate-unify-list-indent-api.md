---
'platejs': patch
---

Unify list and block indentation under `BaseIndentPlugin.update.increase`/`decrease` with flat `IndentChangeOptions` (`at`, `match`, `mode`) and boolean return values, and remove `BaseListPlugin.update.outdent` and `OutdentListOptions`. Add `BaseListPlugin.update.set` for idempotent list kind, style (`null` resets), and task `checked` updates, narrow `toggle` to `{ type, at? }`, and return `boolean` from `clear`. Convert `ListType` and `ListStyle` to type-only unions, rename `BaseListDefinition` to `ListDefinition`, export `ListLevel`/`ListLevels`, and remove `isOrderedList` and `BULLETED_LIST_STYLES`. Add `Mod+Enter` task toggling and create unchecked tasks on `Enter` at the end of a checked task.
