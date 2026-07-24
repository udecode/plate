---
"@platejs/math": major
---

Compose `insertEquation` and `insertInlineEquation` inside `editor.update`
transactions and register equation properties in compiled schemas. The inline
equation plugin and command identity is `inlineEquation`; persisted elements
remain `inline_equation`.

```tsx
editor.update((tx) =>
  insertInlineEquation(tx, editor.getType(KEYS.inlineEquation), {
    texExpression,
  })
);
```
