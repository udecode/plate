---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Copy `equation-node` for KaTeX rendering, popover input, and keyboard behavior. The package React surface contains only the equation descriptors.

Register block and inline equation properties in compiled schemas. The inline equation capability name and persisted element type are both `inlineEquation`.

Import KaTeX styling explicitly from `platejs/math/katex.css`; headless math imports have no stylesheet side effect.

Colocate both Base plugins, math rules, static KaTeX rendering, and React descriptors by equation family.

```tsx
editor.plugin(BaseEquationPlugin).update.insert({}, { select: true });
editor
  .plugin(BaseInlineEquationPlugin)
  .update.insert({ latex }, { select: true });
```

**Migration:** Replace `insertEquation(tx, type, options)` and `insertInlineEquation(tx, type, options)` with the matching scoped plugin update. Domain input is the first argument and generic node placement is the second.

Persist equation source under required/defaulted `latex` on both block and inline nodes.
