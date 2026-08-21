---
'@platejs/utils': major
---

Fix mark toolbar buttons so mutually exclusive marks are cleared only when enabling the target mark.

Resolve exit-break targets against earlier writes in the active transaction.

Keep block-placeholder controllers package-private and read complete editor text with `useEditorSelector` instead of `useEditorString`. Keep package placeholder copy empty by default; copied kits configure visible placeholder text.

Require React and React DOM 19.2 or newer.

Remove the one-consumer form-input, remove-node-button, mark-toolbar-button, selection-state, and selection-fragment hooks. Keep `useSelectionFragmentProp` at the flat React package root; use `useEditorSelector` with `editor.read.selection` or `editor.read.fragment()` for component-local selection reads.

Export complete `NormalizeTypesPluginState`, `TrailingBlockPluginState`, and `BlockPlaceholderPluginState` contracts.

- Base Plate node types on Plite `Element` and `Text`
- Replace the optional caption property contract with direct inline `TMediaElement.children`; remove `TCaptionElement` and the `caption` node-map entry
- Rename `TNodeMap` to `NodeMap`
- Export `SingleBlockPlugin` and `SingleLinePlugin` as independent editor constraints that weakly disable an installed trailing-block peer
- Expose exit-break commands through the scoped plugin update API
- Narrow `TrailingBlockPlugin`'s custom `insert` option to a wrapper around the default insertion; it no longer receives an editor or transaction context
- Use one flat `PLUGINS` catalog for camel-case capability names; resolve persisted element types and property keys separately, and remove `KEYS`, `NODES`, `STYLE_KEYS`, and the redundant `tableCellHeader` capability. Use `docxPaste`, `docxImport`, and `docxExport` for the three DOCX capabilities
- Replace the separate subscript and superscript identities with `PLUGINS.script`; represent script text with `TScriptValue` (`'sub' | 'sup'`)
- Type resizable widths as numeric or relative CSS lengths
- Persist `TTextAlignProps` under the canonical `textAlign` property

**Migration:** Replace `TNodeMap` imports with `NodeMap`, import editor node primitives from `@platejs/plite`, and type media nodes directly as `TImageElement`, `TAudioElement`, `TFileElement`, `TVideoElement`, or `TMediaEmbedElement`; render each media element's direct children as its caption. Compose `SingleBlockPlugin` or `SingleLinePlugin` alongside `TrailingBlockPlugin`; the constraint leaves a missing peer alone.

Call exit-break commands through the plugin descriptor:

```tsx
editor.plugin(ExitBreakPlugin).update.insert(options);
```

Capture any required plugin context before configuring a custom trailing-block insertion wrapper:

```tsx
// Before
insert: (editor, { insert }) => {
  editor.plugin(SuggestionPlugin).api.untracked(insert);
};

// After
insert: (insert) => {
  suggestionApi.untracked(insert);
};
```

Replace `h1` through `h6` capability names with one heading capability.
