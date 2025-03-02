---
'@udecode/plate-code-block': major
---

Migrated from `prismjs` to `highlight.js` + `lowlight` for syntax highlighting.

- Fix highlighting multi-lines tokens. Before, line tokens were computed line by line. Now, it's computed once for the whole block.
- Bundle size much lower.
- `CodeBlockPlugin`: remove `prism` option. Use `lowlight` option instead:

```tsx
import { all, createLowlight } from 'lowlight';

const lowlight = createLowlight(all);

CodeBlockPlugin.configure({
  options: {
    lowlight,
  },
});
```

- New option: `defaultLanguage`
- Remove `syntax` option. Just omit `lowlight` option to disable syntax highlighting.
- Remove `syntaxPopularFirst` option. Control this behavior in your own components.
- Fix pasting code inside code blocks.
- Remove `useCodeBlockCombobox`, `useCodeBlockElement`, `useCodeSyntaxLeaf`, `useToggleCodeBlockButton`. The logic has been moved to the components.
