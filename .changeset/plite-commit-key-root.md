---
'plitejs': major
---

`commit.changed.hasNodeKey(key, kind, root)` takes the root it asks about; pass `undefined` for the primary document. A root whose children the commit did not change answers `false` without reading any index. A key that left the root, or whose root the commit deleted, reports `'presence'` there, not `'path'`.

**Migration:** Pass the root of the view that reads the key. Use `nodeKeysAll(kind)` when a consumer spans every root.

```ts
// Before
commit.changed.hasNodeKey(key, 'node');

// After
commit.changed.hasNodeKey(key, 'node', editor.read.view.root());
```
