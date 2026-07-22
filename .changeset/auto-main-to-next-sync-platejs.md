---
"platejs": major
---

- Expose the Plite-backed Plate editor and plugin model, including
  `editor.read`, `editor.update`, top-level plugin `type`, compiled
  `schema.element` and `schema.mark`, plugin `options`, and
  plugin-owned `editor.plugin(Plugin).api` and `.update` groups
- Export pure schema and plugin builders from `platejs`, React components and
  hooks from `platejs/react`, and `renderStaticHtml` from `platejs/static`
- Initialize editors synchronously through `initialValue` or
  `({ editor }) => Value`, observe edits through `onCommit`, use strict
  `useEditor`, and use nullable `useActiveEditor`
- Defer initialization with `skipInitialization: true`, then publish the loaded
  document with one `editor.update.value.replace({ children })` call
- Delete `@platejs/autoformat`; declare input rules on the feature plugins that
  own the resulting behavior

**Migration:** Replace `value` with synchronous `initialValue`, move async
loading before editor construction, replace `useEditorRef` with `useEditor`,
replace `serializeHtml` with `renderStaticHtml`, and replace autoformat rules
with feature-owned `inputRules`.

For deferred loading:

```tsx
const editor = createPlateEditor({ plugins, skipInitialization: true });
const children = await loadDocument();

editor.update.value.replace({ children });
```
