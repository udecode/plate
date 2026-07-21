---
"@platejs/math": major
---

Compose `insertEquation` and `insertInlineEquation` inside `editor.update`
transactions and register equation properties in compiled schemas.

```tsx
editor.update((tx) =>
  insertInlineEquation(tx, editor.getType(KEYS.inlineEquation), {
    texExpression,
  })
);
```
