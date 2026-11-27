---
'plitejs': patch
---

Keep the key of a content root declared `ownership: 'shared'` when its owner is copied, pasted, duplicated or dragged, so the copy shows the same root instead of a clone. A root declared by its grammar alone is now `exclusive`: a second owner is refused, an open schema drops the root with its last owner, and an `each` table fill gives each cell its own copy.

**Migration:** Declare `ownership: 'shared'` on a root that several blocks should show.

```ts
body: { content: schema.content.text(), ownership: 'shared' }
```
