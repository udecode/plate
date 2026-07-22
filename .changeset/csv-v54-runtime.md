---
"@platejs/csv": major
---

- Move `CsvPlugin` to the Plite plugin runtime while preserving typed CSV deserialization through `editor.api.csv.deserialize`
- Bind CSV parser settings through versioned immutable `defineCsvConfig` policies

**Migration:** Move CSV settings from mutable options into an immutable policy:

```tsx
CsvPlugin.configure({
  config: defineCsvConfig({
    id: 'app:csv',
    version: 1,
    errorTolerance: 0.1,
    parseOptions: { header: true },
  }),
});
```
