---
'@udecode/plate-alignment': major
---

- Package `@udecode/plate-alignment` has been deprecated.
- `TextAlignPlugin` (formerly `AlignPlugin`) has been moved to the `@udecode/plate-basic-styles` package.
- Migration:

  - Remove `@udecode/plate-alignment` from your dependencies.
  - Add `@udecode/plate-basic-styles` to your dependencies if not already present.
  - Import `TextAlignPlugin` from `@udecode/plate-basic-styles/react`.

- Renamed `AlignPlugin` to `TextAlignPlugin` and changed plugin key from `'align'` to `'textAlign'`.

  ```ts
  // Before
  import { AlignPlugin } from '@udecode/plate-alignment/react';

  // After
  import { TextAlignPlugin } from '@udecode/plate-basic-styles/react';
  ```

- `setAlign` signature change:

```ts
// Before
setAlign(editor, { value: 'center', setNodesOptions });

// After
setAlign(editor, 'center', setNodesOptions);
```

- Removed `useAlignDropdownMenu` and `useAlignDropdownMenuState`. Use it in your own codebase, for example:

```tsx
export function AlignToolbarButton() {
  const editor = useEditorRef();
  const value = useSelectionFragmentProp({
    defaultValue: 'start',
    structuralTypes,
    getProp: (node) => node.align,
  });

  const onValueChange = (newValue: string) => {
    editor.tf.textAlign.setNodes(newValue as Alignment);
    editor.tf.focus();
  };

  // ...
}
```
