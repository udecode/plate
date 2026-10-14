---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Registry components call list reads and updates directly.

Expose list queries through `editor.read.list` and mutations through `editor.update.list`: ordinals, active-state checks, and location-aware toggle, outdent, clear and insert updates. Register list and indentation properties in compiled schemas. Clear list start and restart metadata when outdenting a root item.

**Migration:** Replace raw editor-bound list helpers with the scoped API:

```tsx
editor.read.list.ordinal(path);
editor.read.list.isActive({ type: ListType.Bulleted });
editor.update.list.toggle({ type: ListType.Bulleted });
editor.update.list.outdent();
```

Generic package code can use the same groups through `editor.plugin(ListPlugin).read` and `editor.plugin(ListPlugin).update`. Configure list targets through `targetPlugins`.

Use `listStart` for conditional numbered-list starts, `listRestart` for forced boundaries, validate both as signed safe integers, and derive display ordinals without persisting them.

Remove `getSiblingListOptions`, `indentList`, `getNextList`, `getPreviousList` and `expandListItemsWithChildren` with no replacement. Make blocks list items with `toggle`, and deepen them with Tab or `editor.update.indent.increase()`.

Number lists by identity. Each item's `listId` names its list, so a list counts on past other blocks and two lists can interleave. Items without `listId` form their root's default list. Insert commands and typed list markers give a new item the list it lands in, and an item another edit inserts without a `listId` stays in the default list. Pasted content joins its first top-level list when kind and heading role match, using the target marker for joined roots. AI output also requires a matching marker style. Their other lists stay separate. `listLevels` holds a list's per-level `start`, `restartAfter` and `label` rules, and each numbered item reads its level's rule from its own `listLevels`. An edit renumbers only the numbers it changes, however many other lists the document holds. Restart and continue numbering with `editor.update.list.restart({ start })` and `editor.update.list.continue()`; `toggle` takes no `listRestart`.

**Migration:** Register `migrateListIdentity` from `platejs/migrations` as the step for the schema version that adds `listId` and `listLevels`. It gives each stored list its own id and keeps every number:

```ts
steps: { 54: migrateV54, 55: migrateListIdentity },
```

Keep Word list identity on Word HTML paste and DOCX import, including interleaved lists, restarts, start overrides and level rules. Number DOCX imports the way Word does. Every instance of a numbering definition shares each level's count, and a start override restarts it once, at that instance's first paragraph. Export each Plate list as one Word list, and each restarted item as its own Word numbering instance, so Word and a re-import keep the restart. Report `list-structure`, which fails a `reject` export, for an item whose kind its Word list level cannot hold, bullets with a `listId` included, and for a numbered or task item whose level rules differ from its list's first numbered or task item. Report `list-start` for an item whose `listStart` differs from its level's start in the `listLevels` of the list's first numbered or task item. Write `data-list-id` and `data-list-levels` in Plate HTML. Give each parsed Markdown list its own `listId`.

Keep a top-level list item in its list on Shift+Tab, and take a top-level item in a blockquote out of the list and the quote in one press. Keep the new task checked after Enter at the end of a checked task. Number a copied part of a list from its first copied item in HTML and plain text.

Keep pasted list nesting relative to the caret depth and continue the target numbering, including through `editor.update.fragment.replace` and `editor.update.slice.replace`. Keep the first list item's type in an empty paragraph or heading inside quotes, table cells and columns when the schema permits. Prefer an empty target's own start and restart over copied values.
