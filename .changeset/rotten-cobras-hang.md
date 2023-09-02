---
"@udecode/plate-utils": minor
---

- New prop in `createPrimitiveComponent`: `setProps` where the first parameter is the props returned by the "props hook". Returned attributes are passed to the component. You can use this prop to merge or override all props.
- Plate components `className` and `style` props are now merged with the "props hook" ones if defined. To override instead of merging, use `setProps`.
