---
"@platejs/link": major
---

Export `BaseLinkPluginState` and `LinkPluginState` as the complete mutable
state contracts for the headless and React link descriptors.

Move link behavior to `BaseLinkPlugin`, `LinkPlugin`, and the installed editor
API, register link properties in compiled schemas, and use the readable
descriptor name `link` while preserving the serialized element type `a`.

**Migration:** Replace standalone link transforms with `editor.update.link`:

```tsx
editor.update.link.insert(node, options);
editor.update.link.unwrap(options);
editor.update.link.upsert(options);
editor.update.link.upsertText(options);
editor.update.link.wrap(options);
```

Read URL validation and anchor attributes from
`editor.api.link`. Control floating-link state through the same namespace.
Remove `withLink`, `insertLink`, `unwrapLink`,
`upsertLink`, `upsertLinkText`, `wrapLink`, `submitFloatingLink`, and
`triggerFloatingLink*` imports.
