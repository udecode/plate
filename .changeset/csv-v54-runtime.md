---
"@platejs/csv": major
---

- Move `CsvPlugin` to the Plite plugin runtime with typed CSV deserialization
  through `editor.plugin(CsvPlugin).api.deserialize`
- Configure CSV parser behavior through `CsvPlugin.options`

**Migration:** Configure CSV settings through `options` and scope API access to
the plugin portal:

```tsx
CsvPlugin.configure({
  options: {
    errorTolerance: 0.1,
    parseOptions: { header: true },
  },
});

// Before
editor.api.csv.deserialize({ data });

// After
editor.plugin(CsvPlugin).api.deserialize({ data });
```
