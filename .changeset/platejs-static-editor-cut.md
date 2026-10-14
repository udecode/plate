---
'platejs': major
---

Remove `createStaticEditor` from `platejs/static` and `usePlateViewEditor` from `platejs/react`. Create a read-only or server-rendered editor with `createEditor` from `platejs`, or with `useCreateEditor` in a React component. Render it with `EditorStatic` or `renderStaticHtml` from `platejs/static`.

Remove `SlateRenderElementProps`, `SlateRenderLeafProps`, `SlateRenderTextProps` and `SlateRenderNodeProps` from `platejs/static`. Type a static node component with its plugin's props from `platejs/static`, such as `EditorElementProps<typeof BaseParagraphPlugin>`, `EditorLeafProps` or `EditorTextProps`. Type generic renderer code with `RenderElementProps` from `platejs`.

**Migration:**

```tsx
// Before
import { createStaticEditor } from 'platejs/static';

const editor = createStaticEditor({ plugins, value });

// After
import { createEditor } from 'platejs';

const editor = createEditor({ plugins, initialValue: value });
```

In a React component, replace `usePlateViewEditor({ plugins, value }, deps)` with `useCreateEditor({ plugins, initialValue: value }, deps)` from `platejs/react`.
