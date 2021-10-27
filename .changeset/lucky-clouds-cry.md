---
"@udecode/plate-indent": minor
---

`classNames` plugin option now fits `getElementOverrideProps` API:

```ts
// before
{
  classNames: [
    'slate-indent-1',
    'slate-indent-2',
    'slate-indent-3',
  ],
}
// after
{
  classNames: {
    1: 'slate-indent-1',
    2: 'slate-indent-2',
    3: 'slate-indent-3',
  },
}
```
