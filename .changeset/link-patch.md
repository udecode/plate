---
'@platejs/link': patch
---

- Improved return type of `getLinkAttributes` to be more specific and type-safe.

```ts
// The function now returns a properly typed object
const attributes = getLinkAttributes(editor, linkElement);
// attributes is now properly typed as Pick<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'target'> & UnknownObject
```
