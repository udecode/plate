---
"@platejs/basic-nodes": major
---

Replace the Heading, Basic Blocks, and Basic Marks grouping descriptors with
readonly Base and React kits.

**Migration:** Spread the matching kit into the editor plugin array:

```tsx
const plugins = [
  ...HeadingKit,
  ...BasicBlocksKit,
  ...BasicMarksKit,
];
```
