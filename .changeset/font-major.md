---
'@udecode/plate-font': major
---

- Removed `setBlockBackgroundColor`. Use `tf.backgroundColor.setBlock` instead.
- Removed `setFontSize` – `api.fontSize.setMark` has been renamed to `tf.fontSize.addMark`:

```ts
// Before
editor.api.fontSize.addMark('16px');

// After
editor.tf.fontSize.addMark('16px');
```

- Removed `useColorInput`. Use it in your own codebase, for example:

```tsx
function ColorInput() {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const onClick = () => {
    inputRef.current?.click();
  };

  // ...
}
```

- Removed `useColorsCustom` and `useColorsCustomState`. Use it in your own codebase, for example:

```tsx
function ColorCustom({ color, colors, customColors, updateCustomColor }) {
  const [customColor, setCustomColor] = React.useState<string>();
  const [value, setValue] = React.useState<string>(color || '#000000');

  React.useEffect(() => {
    if (
      !color ||
      customColors.some((c) => c.value === color) ||
      colors.some((c) => c.value === color)
    ) {
      return;
    }

    setCustomColor(color);
  }, [color, colors, customColors]);

  const computedColors = React.useMemo(
    () =>
      customColor
        ? [
            ...customColors,
            {
              isBrightColor: false,
              name: '',
              value: customColor,
            },
          ]
        : customColors,
    [customColor, customColors]
  );

  const updateCustomColorDebounced = React.useCallback(
    debounce(updateCustomColor, 100),
    [updateCustomColor]
  );

  const inputProps = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      updateCustomColorDebounced(e.target.value);
    },
  };

  // ...
}
```

- Removed `useColorDropdownMenu` and `useColorDropdownMenuState`. Use it in your own codebase, for example:

```tsx
export function FontColorToolbarButton({ nodeType }) {
  const editor = useEditorRef();

  const selectionDefined = useEditorSelector(
    (editor) => !!editor.selection,
    []
  );

  const color = useEditorSelector(
    (editor) => editor.api.mark(nodeType) as string,
    [nodeType]
  );

  const [selectedColor, setSelectedColor] = React.useState<string>();
  const [open, setOpen] = React.useState(false);

  const onToggle = React.useCallback(
    (value = !open) => {
      setOpen(value);
    },
    [open, setOpen]
  );

  const updateColor = React.useCallback(
    (value: string) => {
      if (editor.selection) {
        setSelectedColor(value);
        editor.tf.select(editor.selection);
        editor.tf.focus();
        editor.tf.addMarks({ [nodeType]: value });
      }
    },
    [editor, nodeType]
  );

  const clearColor = React.useCallback(() => {
    if (editor.selection) {
      editor.tf.select(editor.selection);
      editor.tf.focus();
      if (selectedColor) {
        editor.tf.removeMarks(nodeType);
      }
      onToggle();
    }
  }, [editor, selectedColor, onToggle, nodeType]);

  React.useEffect(() => {
    if (selectionDefined) {
      setSelectedColor(color);
    }
  }, [color, selectionDefined]);

  // ...
}
```
