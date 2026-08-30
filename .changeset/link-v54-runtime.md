---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Keep the package React surface to the `LinkPlugin` descriptor. Copy `link-toolbar` for floating state, inputs, positioning, hotkeys, and toolbar commands. Other copied UI uses that item's app-local `linkPlugin` descriptor.

Export `BaseLinkPluginState` as the complete mutable state contract for the headless link descriptor.

Move link behavior to `BaseLinkPlugin`, `LinkPlugin`, and the installed editor API, register link properties in compiled schemas, and use capability name `link` with persisted element type `link`.

**Migration:** Replace standalone link transforms with `editor.update.link`:

```tsx
editor.update.link.insert(node, options);
editor.update.link.unwrap(options);
editor.update.link.upsert(options);
editor.update.link.upsertText(options);
editor.update.link.wrap(options);
```

Read URL validation and anchor attributes from `editor.api.link`. Remove `withLink`, `insertLink`, `unwrapLink`, `upsertLink`, `upsertLinkText`, `wrapLink`, `submitFloatingLink`, and `triggerFloatingLink*` imports.
