---
"@platejs/code-block": major
---

Export `CodeHighlightPluginState` as the complete mutable state contract for
`BaseCodeHighlightPlugin`.

Keep the Python grammar stabilization internal to the highlighting owner.

Expose code-block queries through `editor.read.codeBlock` and mutations through
`editor.update.codeBlock`. Register code-block and syntax properties in
compiled schemas.

Preserve compound command targets and make earlier edits visible to later steps
in the same transaction.

Install code lines as a required `CodeBlockPlugin` dependency. Replace
`CodeSyntaxPlugin` and `BaseCodeSyntaxPlugin` with `CodeHighlightPlugin` and
`BaseCodeHighlightPlugin`. The highlighting plugin owns the syntax mark,
Lowlight state, decorations, and refresh behavior and depends on
`CodeBlockPlugin`. Plugin and command identities are `codeBlock`, `codeLine`,
and `codeSyntax`; persisted document types remain `code_block`, `code_line`,
and `code_syntax`.

**Migration:** Replace standalone query, formatter, decoration, and transform
imports with the installed plugin groups:

```tsx
editor.read.codeBlock.entry();
editor.read.codeBlock.isEmpty();
editor.update.codeBlock.format({ element });
editor.update.codeBlock.insert();
editor.update.codeBlock.toggle();
editor.update.codeBlock.resetBlock();
```

Use `insert(options)` for both empty and populated insertion paths. Configure
`lowlight` and `defaultLanguage` on `CodeHighlightPlugin`; omit that plugin for
unhighlighted code blocks:

```tsx
const plugins = [
  CodeBlockPlugin,
  CodeHighlightPlugin.configure({
    initialState: { defaultLanguage: 'typescript', lowlight },
  }),
];
```
