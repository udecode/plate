---
'@udecode/plate-utils': patch
---

Breaking changes part of v41:

- Remove `usePlaceholderState`. This should be implemented in your own plugin:

```tsx
export const PlaceholderAboveNodes: NodeWrapperComponent = (props) => {
  const { editor, element, path } = props;

  const focused = useFocused();
  const selected = useSelected();
  const composing = useComposing();

  const placeholderProps = useMemo(() => {
    if (isElementEmpty(editor, element) && !composing) {
      if (
        path.length === 1 &&
        element.type === editor.getType(ParagraphPlugin) &&
        isCollapsed(editor.selection) &&
        focused &&
        selected
      ) {
        return { placeholder: 'Type a paragraph' };
      }
      if (element.type === editor.getType({ key: 'h1' })) {
        return { placeholder: 'Untitled' };
      }
    }
  }, [composing, editor, element, focused, path.length, selected]);

  if (!placeholderProps) return;

  return (props) => <Placeholder {...props} {...placeholderProps} />;
};

export const Placeholder = (
  props: PlateRenderElementProps & { placeholder: string }
) => {
  const { children, nodeProps, placeholder } = props;

  return React.Children.map(children, (child) => {
    return React.cloneElement(child, {
      className: child.props.className,
      nodeProps: {
        ...nodeProps,
        className:
          'before:absolute before:cursor-text before:opacity-30 before:content-[attr(placeholder)]',
        placeholder,
      },
    });
  });
};

export const BlockPlaceholderPlugin = createPlatePlugin({
  key: 'block-placeholder',
  render: { aboveNodes: PlaceholderAboveNodes },
});
```
