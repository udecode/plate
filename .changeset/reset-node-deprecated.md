---
'@udecode/plate-reset-node': major
---

Package `@udecode/plate-reset-node` has been deprecated. Its functionality (e.g., `ResetNodePlugin`) is now exclusively configured using the `node.breakRules` and `node.deleteRules` options on plugin definitions. Migration:

- Remove `@udecode/plate-reset-node` from your dependencies.
- Remove any usage of `ResetNodePlugin` from your project.
- Configure reset behaviors directly on the relevant plugins by defining `node.breakRules` and/or `node.deleteRules`.

**Example: Resetting a Blockquote to a Paragraph**

```typescript
ResetNodePlugin.configure({
  options: {
    rules: [
      {
        types: [BlockquotePlugin.key],
        defaultType: ParagraphPlugin.key,
        hotkey: 'Enter',
        predicate: (editor) =>
          editor.api.isEmpty(editor.selection, { block: true }),
      },
    ],
  },
});

// After
BlockquotePlugin.configure({
  node: {
    breakRules: { empty: 'reset' },
    deleteRules: { start: 'reset' },
  },
});
```

**For custom reset logic (previously `onReset`):**

```typescript
// Before
ResetNodePlugin.configure({
  options: {
    rules: [
      {
        types: [CodeBlockPlugin.key],
        defaultType: ParagraphPlugin.key,
        hotkey: 'Enter',
        predicate: isCodeBlockEmpty,
        onReset: unwrapCodeBlock,
      },
    ],
  },
});

// After
CodeBlockPlugin.configure({
  node: {
    deleteRules: { empty: 'reset' },
  },
}).overrideEditor(({ editor, tf: { resetBlock } }) => ({
  transforms: {
    resetBlock(options) {
      if (
        editor.api.block({
          at: options?.at,
          match: { type: editor.getType(CodeBlockPlugin.key) },
        })
      ) {
        unwrapCodeBlock(editor);
        return;
      }

      return resetBlock(options);
    },
  },
}));
```
