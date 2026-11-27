---
'plitejs': patch
---

Remove `EditorElement`, `EditorLeaf`, and `EditorText` from `plitejs/react` public exports

**Migration:** Spread `attributes` onto your own element in `renderElement`, `renderLeaf`, or `renderText`:

```tsx
const renderElement = ({ attributes, children }: RenderElementProps) => (
  <p {...attributes}>{children}</p>
);
```
