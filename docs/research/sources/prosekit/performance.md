# ProseKit: performance

## React hooks

- ProseKit's `useEditorDerivedValue` publishes a derived value through `useSyncExternalStore`, which React Compiler can observe (`prosekit/prosekit@3fbfe790:packages/react/src/hooks/use-editor-derived-value.ts:1-80`), while `useEditor({ update: true })` returns the same mutable editor instance after updates and its doc comment tells Compiler users to use `useEditorDerivedValue` instead (`prosekit/prosekit@3fbfe790:packages/react/src/hooks/use-editor.ts:11-21`). Source: `docs/plite/research/2026-09-09-editor-performance-iteration-2/react-compiler.md:36`, `read-log.tsv:6`, `:11`.
