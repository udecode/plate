# ProseMirror: rendering and DOM

## React renderers

- react-prosemirror stops ProseMirror's DOM observer, since React renders the DOM, and ignores `selectionchange` while composing, because in Safari even setting the selection to its current position ends a composition; after React's DOM commit it forces a base view update so DOM selection and node-view callbacks are validated. Its tests cover selection updates when the DOM selection parameters look unchanged after decoration redraws, and a fallback when `Selection.extend` throws. Evidence: `handlewithcarecollective/react-prosemirror@13ae2f87e726330e5f3cb0405e6b158a3d14ab95:src/ReactEditorView.ts:116-131`, `:268-289`, `src/components/__tests__/ProseMirror.selection.test.tsx:452-476`, `:478-492`, checked 2026-10-08 at the local clone.
