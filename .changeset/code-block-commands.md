---
"@platejs/code-block": major
---

Expose code-block mutations through `insert`, `toggle`, `tab`, `untab`,
`resetBlock`, and `selectAll` installed commands, and register code-block and
syntax properties in compiled schemas.

Preserve compound command targets and make earlier edits visible to later steps
in the same transaction.

Install code lines as a required `CodeBlockPlugin` dependency. Replace
`CodeSyntaxPlugin` and `BaseCodeSyntaxPlugin` with `CodeHighlightPlugin` and
`BaseCodeHighlightPlugin`. The highlighting plugin owns the syntax mark,
Lowlight options, decorations, and refresh behavior and depends on
`CodeBlockPlugin`. Plugin and command identities are `codeBlock`, `codeLine`,
and `codeSyntax`; persisted document types remain `code_block`, `code_line`,
and `code_syntax`.

**Migration:** Replace direct transform helper imports with
`editor.update.codeBlock.*` commands. Pass node insertion options directly to
`insert(options)`. Configure `lowlight` and `defaultLanguage` on
`CodeHighlightPlugin`; omit that plugin for unhighlighted code blocks.

```tsx
const plugins = [
  CodeBlockPlugin,
  CodeHighlightPlugin.configure({
    options: { defaultLanguage: 'typescript', lowlight },
  }),
];
```
