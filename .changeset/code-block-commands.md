---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Export `CodeHighlightPluginState` as the complete mutable state contract for `BaseCodeHighlightPlugin`.

Expose code-block queries through `editor.read.codeBlock` and mutations through `editor.update.codeBlock`. Register code-block properties in compiled schemas.

Preserve compound command targets and make earlier edits visible to later steps in the same transaction.

Store each code block in one newline-bearing text child. Remove `CodeLinePlugin`, `BaseCodeLinePlugin`, and the `codeLine` element. Replace `CodeSyntaxPlugin` and `BaseCodeSyntaxPlugin` with `CodeHighlightPlugin` and `BaseCodeHighlightPlugin`. The highlighting plugin owns Lowlight state, transient token decorations, and refresh behavior and depends on `CodeBlockPlugin`.

**Migration:** Remove code-line plugins and components from plugin arrays. Run `migrateV54` in the app's detached document migration chain before loading persisted v53 code blocks. Replace standalone query, formatter, decoration, and transform imports with the installed plugin groups:

```tsx
editor.read.codeBlock.entry();
editor.read.codeBlock.isEmpty();
editor.update.codeBlock.format({ element });
editor.update.codeBlock.insert();
editor.update.codeBlock.toggle();
editor.update.codeBlock.resetBlock();
```

`toggle()` returns `true` when it changed the document and `false` when it could not. It returns `false` when the new code block, or the paragraph a one-line code block becomes, would not fit the parent. It also returns `false` when the selection is in a named root that the editor or view running it does not edit. On a block selection, `toggle()` turns each run of adjacent selected blocks into its own code block, leaves the blocks between runs unchanged and keeps the new code blocks selected. It returns `false` and changes nothing when any run would not fit its parent. A code block of several lines whose paragraphs would not fit still throws, as before.

Use `insert(input?, nodeOptions?)` for both empty and populated insertion paths. Configure `lowlight` and `defaultLanguage` on `CodeHighlightPlugin`; omit that plugin for unhighlighted code blocks:

```tsx
const plugins = [
  CodeBlockPlugin,
  CodeHighlightPlugin.configure({
    initialState: { defaultLanguage: 'typescript', lowlight },
  }),
];
```

Store code block language in the `language` property.
