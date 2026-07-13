---
"@platejs/math": major
---

Compose `insertEquation` and `insertInlineEquation` inside `editor.update` transactions.

```tsx
editor.update((tx) =>
  insertInlineEquation(tx, editor.getType(KEYS.inlineEquation), {
    texExpression,
  })
);
```
