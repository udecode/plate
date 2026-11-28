---
'plitejs': patch
---

- Pass `slots.contentRoot` in `RenderVoidProps` and add `autoFocus` support to content-root slots so void elements mount schema-owned child roots through `slots.contentRoot(slot)` instead of `<EditorContent root>`
- Throw when `<EditorContent root>` mounts a schema-owned child root inside its owning element renderer
- Guard live DOM selection reads during active IME composition across `beforeinput`, WebKit Shadow DOM probes, and hidden-end settles, and expire stale text-input repair echo records
