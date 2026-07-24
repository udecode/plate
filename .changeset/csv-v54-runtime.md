---
"@platejs/csv": major
---

- Move `CsvPlugin` to the Plite plugin runtime with typed CSV deserialization
  through `editor.api.csv.deserialize`
- Configure CSV codec behavior through `CsvPlugin.options`

**Migration:** Configure CSV settings through `options` and use the inferred
editor API:

```tsx
CsvPlugin.configure({
  options: {
    errorTolerance: 0.1,
    parseOptions: { header: true },
  },
});

editor.api.csv.deserialize({ data });
```
