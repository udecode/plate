---
'platejs': major
---

Refuse an `initialValue` top-level field other than `children`, `meta` and `roots`, or `document`, `schema` and `selection` for a persisted envelope, instead of dropping it. A value that holds `children` reads as a document even when it also holds `document`. Static and view rendering of a `document` refuse the same fields. Store application data in `meta`, and pass a selection through the `selection` option:

```ts
// Before
createEditor({ initialValue: { children, selection } });

// After
createEditor({ initialValue: { children }, selection });
```
