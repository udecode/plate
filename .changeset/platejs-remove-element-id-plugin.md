---
'platejs': patch
'plitejs': patch
---

Remove `ElementIdPlugin` and reserve `id` across every editor schema

- `plitejs` schemas now refuse declaring an element `id` property (naming the reserved `id` key), and editor readers type returned elements with a required `id: string` while detached inputs (`ElementIn`, `InitialValue`) and element guards (`ElementApi.isElement`) keep `id` optional.
- Removed `ElementIdPlugin`, its `generateId` option, `HtmlExportKit` / `HtmlExportSchemaKit`, and the internal `readElementById` helper; Markdown `<block id>`, Ink, HTML export, and document migrations now read core's reserved `id` directly.
