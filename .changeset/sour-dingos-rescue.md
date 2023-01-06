---
'@udecode/plate-core': minor
---

- new `Plate` / `PlateProvider` prop: `readOnly`
- it's also stored in plate store, useful when `readOnly` is needed between `PlateProvider` and `Plate`. 
- new selector: `usePlateReadOnly`
- (not mandatory) migration:
```tsx
// from
<Plate editableProps={{readOnly: true}} />

// to
<Plate readOnly />
```

