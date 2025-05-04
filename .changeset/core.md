---
'@udecode/plate-core': major
---

- `PlateElement`, `PlateLeaf` and `PlateText` HTML attributes are moved from top-level props to `attributes` prop. Migration:

```tsx
// From
<PlateElement
  {...props}
  ref={ref}
  contentEditable={false}
>
  {children}
</PlateElement>

// To
<PlateElement
  {...props}
  ref={ref}
  attributes={{
    ...props.attributes,
    contentEditable: false,
  }}
>
  {children}
</PlateElement>
```

- Remove `nodeProps` prop from `PlateElement`, `PlateLeaf`, `PlateText`. It has been merged into `attributes` prop.
- Plugin `node.props` should return the props directly instead of inside `nodeProps` object. Migration:

```ts
// From
node: {
  props: ({ element }) => ({
    nodeProps: {
      colSpan: element?.attributes?.colspan,
      rowSpan: element?.attributes?.rowspan,
    },
  });
}

// To
node: {
  props: ({ element }) => ({
    colSpan: element?.attributes?.colspan,
    rowSpan: element?.attributes?.rowspan,
  });
}
```

- Remove `asChild` prop from `PlateElement`, `PlateLeaf`, `PlateText`. Use `as` prop instead.
- Remove `elementToAttributes`, `leafToAttributes`, `textToAttributes` props from `PlateElement`, `PlateLeaf`, `PlateText`.
- Remove `DefaultElement`, `DefaultLeaf`, `DefaultText`. Use `PlateElement`, `PlateLeaf`, `PlateText` instead.
- Types: remove `PlateRenderElementProps`, `PlateRenderLeafProps`, `PlateRenderTextProps`. Use `PlateElementProps`, `PlateLeafProps`, `PlateTextProps` instead.
