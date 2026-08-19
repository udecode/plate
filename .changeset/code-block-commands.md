---
"@platejs/code-block": major
---

Require React and React DOM 19.2 or newer.

Export `CodeHighlightPluginState` as the complete mutable state contract for
`BaseCodeHighlightPlugin`.

Expose code-block queries through `editor.read.codeBlock` and mutations through
`editor.update.codeBlock`. Register code-block and syntax properties in
compiled schemas.

Preserve compound command targets and make earlier edits visible to later steps
in the same transaction.

Install code lines as a required `CodeBlockPlugin` dependency. Replace
`CodeSyntaxPlugin` and `BaseCodeSyntaxPlugin` with `CodeHighlightPlugin` and
`BaseCodeHighlightPlugin`. The highlighting plugin owns the syntax mark,
Lowlight state, decorations, and refresh behavior and depends on
`CodeBlockPlugin`. Plugin, command, and persisted identities are `codeBlock`,
`codeLine`, and `codeSyntax`.

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

Use `insert(input?, nodeOptions?)` for both empty and populated insertion
paths. Configure
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

Store code block language in the `language` property.
