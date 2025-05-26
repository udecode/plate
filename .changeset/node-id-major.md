---
'@udecode/plate-node-id': major
---

Deprecated package: moved to `@udecode/plate-core` as a core plugin. Migration:

- If not configured, just remove `NodeIdPlugin` from your plugins.
- If configured, replace `NodeIdPlugin.configure(options)` with:

```ts
usePlateEditor({
  // ...other options
  nodeId: options,
});
```
