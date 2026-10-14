---
'platejs': patch
---

- Fix `ExitBreakPlugin` and the `exit` and `deleteExit` rule actions to insert the surrounding container's default block instead of the root's first block type, which put a second heading after a divider in a root that starts with a required heading
- Change nothing instead of throwing when the surrounding container has no room for the new block
- Fix exits that land inside a container throwing when the document's default block requires a property such as `id`
- Change nothing when the surrounding container declares no default block
- Fix Mod+Enter in a code block, callout, image or divider inside a column, quote, table cell or details body, and Enter on the empty last line of a callout there, leaving that container; it inserts a paragraph after the block and stays inside. `BaseCodeBlockPlugin` and `BaseCalloutPlugin` declare `ownsExit`, and a custom plugin whose block should behave the same declares `ownsExit: true` in its schema
- Change the schema fingerprint of an editor that includes `BaseCodeBlockPlugin` or `BaseCalloutPlugin`, because they declare `ownsExit`. Such an editor refuses snapshots, persisted history and authored comparisons written with the old fingerprint, and old and new clients cannot share a Yjs room. A named schema needs a higher version before `plate migrate` scaffolds its migration
