---
'platejs': patch
---

- Fix `ExitBreakPlugin` and the `exit` and `deleteExit` rule actions to insert the surrounding container's default block instead of the root's first block type, which put a second heading after a divider in a root that starts with a required heading
- Change nothing instead of throwing when the surrounding container has no room for the new block
- Fix exits that land inside a container throwing when the document's default block requires a property such as `id`
- Change nothing when the surrounding container declares no default block
