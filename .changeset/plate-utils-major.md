---
'@udecode/plate-utils': major
---

- Remove [`createNodesHOC`, `createNodesWithHOC`](https://github.com/udecode/plate/blob/7afd88089f4a76c896f3edf928b03c7e9f2ab903/packages/plate-utils/src/react/createNodesHOC.tsx), [`createNodeHOC`](https://github.com/udecode/plate/blob/7afd88089f4a76c896f3edf928b03c7e9f2ab903/packages/plate-utils/src/react/createNodeHOC.tsx)
- Remove `usePlaceholderState`. Migration: use `BlockPlaceholderPlugin` instead of `withPlaceholders`.

```ts
BlockPlaceholderPlugin.configure({
  options: {
    className:
      'before:absolute before:cursor-text before:opacity-30 before:content-[attr(placeholder)]',
    placeholders: {
      [ParagraphPlugin.key]: 'Type something...',
    },
    query: ({ path }) => {
      return path.length === 1;
    },
  },
});
```
