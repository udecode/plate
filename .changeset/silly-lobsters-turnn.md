---
"@udecode/plate-ui-dnd": minor
---

- `useDndNode`: `useDndBlock` with:
  - `type` option. Different types are needed to allow dnd in different structures like tables or lists.
  - `drag` options
  - `drop` options
  - `preview` options
- `useDragNode`: `useDragBlock` with `type` option.
- `useDropNode`: `useDropBlock` with `accept` option:
  - `onDropNode` called on drop
  - `onHoverNode` called on hover
