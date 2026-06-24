---
"slate-react": major
---

Replace the Slate 0.x React wrapper and renderer surface with the Slate v2 React runtime.

**Migration:**

- Create React editors with `useSlateEditor` or `createReactEditor`; use the `react()` extension for lower-level composition.
- Use `<Slate editor={editor}>` with the v2 `<Editable />`.
- Use React 19.2 or newer and import through the `slate-react` package root export.
- Replace `withReact`, old `ReactEditor` value imports, `DefaultElement`, `DefaultLeaf`, `DefaultText`, `useSlate`, `useSlateStatic`, `useSlateSelector`, `useSlateSelection`, `useSelected`, `useFocused`, `useReadOnly`, and `useComposing` with the v2 components and hooks exported from `slate-react`.
- Use `SlateElement`, `SlateText`, `SlateLeaf`, and `SlatePlaceholder` for custom renderer DOM attributes.
- Resolve element paths inside handlers with `editor.api.dom.resolvePath(element)` or `useElementPath()` instead of reading eager `path` and `index` render props.
- Replace `Editable` input rules with model-owned editor extensions or browser-specific `onDOMBeforeInput` handling.
- Use DOM coverage policy props with `selectionPolicy="materialize" | "skip" | "model"`, `copyPolicy="model" | "summary" | "exclude" | "materialize"`, and `findPolicy="native" | "custom"`.
