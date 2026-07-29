---
"@platejs/math": major
---

Register block and inline equation properties in compiled schemas. The inline
equation plugin identity is `inlineEquation`; persisted elements remain
`inline_equation`.

Colocate both Base plugins, math rules, static KaTeX rendering, React
descriptors, and React hooks by equation family.

```tsx
editor.plugin(BaseEquationPlugin).update.insert({ select: true });
editor.plugin(BaseInlineEquationPlugin).update.insert({
  select: true,
  texExpression,
});
```

**Migration:** Replace `insertEquation(tx, type, options)` and
`insertInlineEquation(tx, type, options)` with the matching scoped plugin
update.
