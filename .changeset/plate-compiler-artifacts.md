---
'platejs': major
---

- Compile plugin tuples with `compileEditor({ plugins, schema })` from `platejs/compiler` to obtain detached, frozen schema and binding facts without activating extensions.
- Keep generated application type projections under `platejs/compiler`. Access installed features through descriptor portals and mounted editors through the public React hooks.
- Keep compiler caches, erased definition helpers, React effect hosts and backing stores private.
- Expose each mounted Editable ref to `slots.wrapRoot` components so feature kits can install their React integration. Bind custom DnD cleanup with `useDndPlugin(editableElement)` from `platejs/dnd/react`.
- Allow AI retry after a request stops before its first preview chunk, while refusing regeneration when an existing preview cannot be safely restored.
