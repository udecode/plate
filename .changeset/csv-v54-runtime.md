---
"@platejs/csv": major
---

- Move `CsvPlugin` to the Plite plugin runtime with typed CSV deserialization
  through `editor.api.csv.deserialize`
- Seed CSV codec behavior through `CsvPlugin.initialState`
- Use the plugin API as the sole CSV deserialization surface

**Migration:** Configure CSV state through `initialState` and use the inferred
editor API:

```tsx
CsvPlugin.configure({
  initialState: {
    errorTolerance: 0.1,
    parseOptions: { header: true },
  },
});

editor.api.csv.deserialize({ data });
```

Replace direct `deserializeCsv(editor, { data })` calls with
`editor.api.csv.deserialize({ data })` or
`editor.plugin(CsvPlugin).api.deserialize({ data })`.
