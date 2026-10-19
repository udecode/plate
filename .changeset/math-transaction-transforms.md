---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Copy the `math` and `math-static` components for KaTeX rendering, popover input, and keyboard behavior. They import `katex` and its stylesheet. `platejs/math/react` exports only the equation descriptors.

Register block and inline equation properties in compiled schemas. The inline equation capability name and persisted element type are both `inlineEquation`.

Colocate both Base plugins, math rules, and React descriptors by equation family. `platejs/math` and `platejs/math/react` do not import KaTeX.

```tsx
editor.plugin(BaseEquationPlugin).update.insert({}, { select: true });
editor
  .plugin(BaseInlineEquationPlugin)
  .update.insert({ latex }, { select: true });
```

**Migration:** Replace `insertEquation(tx, type, options)` and `insertInlineEquation(tx, type, options)` with the matching scoped plugin update. Domain input is the first argument and generic node placement is the second. Replace `getEquationHtml({ element, options })` with `katex.renderToString(element.latex, options)`, and add `katex@0.16.22` to your dependencies.

Persist equation source under required/defaulted `latex` on both block and inline nodes.
