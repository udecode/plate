---
'platejs': major
---

Compare the results of `useEditorSelector` and `useElementSelector` by value by default. Each hook keeps the earlier result when its selector returns a new list or plain object of up to 100 values with the same contents, so the component does not render again. Document nodes, React elements and class instances compare by identity.

Remove the previous result that both hooks passed to the selector as its second argument.

**Migration:** Pass `Object.is` as `equalityFn` on a call that must compare its results by reference:

```tsx
const value = useEditorSelector(selector, { equalityFn: Object.is });
```

A selector that read its previous result keeps that result in a ref.
