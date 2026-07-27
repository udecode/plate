---
"@platejs/utils": major
---

- Base Plate node types on Plite `Element` and `Text`
- Replace the optional caption property contract with direct inline
  `TMediaElement.children`; remove `TCaptionElement` and the `caption` node-map
  entry
- Rename `TNodeMap` to `NodeMap`
- Export `SingleBlockPlugin` and `SingleLinePlugin` as independent editor
  constraints that weakly disable an installed trailing-block peer
- Expose exit-break commands through the scoped plugin update API
- Narrow `TrailingBlockPlugin`'s custom `insert` option to a wrapper around the
  default insertion; it no longer receives an editor or transaction context
- Use camel-case built-in plugin identities while keeping serialized element
  and mark types in `NODES`
- Replace `KEYS.sub` and `KEYS.sup` with `KEYS.script`; represent script text
  with `TScriptValue` (`'sub' | 'sup'`)
- Type resizable widths as numeric or relative CSS lengths

**Migration:** Replace `TNodeMap` imports with `NodeMap`, import editor node
primitives from `@platejs/plite`, and type media nodes directly as
`TImageElement`, `TAudioElement`, `TFileElement`, `TVideoElement`, or
`TMediaEmbedElement`; render each media element's direct children as its
caption. Compose `SingleBlockPlugin` or `SingleLinePlugin`
alongside `TrailingBlockPlugin`; the constraint leaves a missing peer alone.

Call exit-break commands through the plugin descriptor:

```tsx
editor.plugin(ExitBreakPlugin).update.insert(options);
```

Capture any required plugin context before configuring a custom trailing-block
insertion wrapper:

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
