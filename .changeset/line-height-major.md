---
'@udecode/plate-line-height': major
---

- Package `@udecode/plate-line-height` has been deprecated.
- `LineHeightPlugin` has been moved to the `@platejs/basic-styles` package.
- Migration:

  - Remove `@udecode/plate-line-height` from your dependencies.
  - Add `@platejs/basic-styles` to your dependencies if not already present.
  - Import `LineHeightPlugin` from `@platejs/basic-styles/react`.

- `setLineHeight` signature change:

```ts
// Before
setLineHeight(editor, { value: 1.5, setNodesOptions });

// After
setLineHeight(editor, 1.5, setNodesOptions);
```

- Removed `useLineHeightDropdownMenu` and `useLineHeightDropdownMenuState`. Use it in your own codebase, for example:

```tsx
export function LineHeightToolbarButton() {
  const editor = useEditorRef();
  const { defaultNodeValue, validNodeValues: values = [] } =
    editor.getInjectProps(LineHeightPlugin);

  const value = useSelectionFragmentProp({
    defaultValue: defaultNodeValue,
    getProp: (node) => node.lineHeight,
  });

  const onValueChange = (newValue: string) => {
    editor.tf.lineHeight.setNodes(Number(newValue));
    editor.tf.focus();
  };

  // ...
}
```
