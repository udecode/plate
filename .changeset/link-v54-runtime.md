---
"@platejs/link": major
---

Move link behavior to `BaseLinkPlugin`, `LinkPlugin`, and the installed editor
API, and register link properties in compiled schemas.

**Migration:** Replace standalone link transforms with `editor.update.link`:

```tsx
editor.update.link.insert(node, options);
editor.update.link.unwrap(options);
editor.update.link.upsert(options);
editor.update.link.upsertText(options);
editor.update.link.wrap(options);
```

Read URL validation and anchor attributes from
`editor.plugin(BaseLinkPlugin).api`. Control floating-link state through
`editor.plugin(LinkPlugin).api`. Remove `withLink`, `insertLink`, `unwrapLink`,
`upsertLink`, `upsertLinkText`, `wrapLink`, `submitFloatingLink`, and
`triggerFloatingLink*` imports.
