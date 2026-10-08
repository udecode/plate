# Tiptap: selection and caret

## Selection decoration

- Tiptap's `Selection` extension paints an inline decoration with a class over a non-empty selection only while the editor is blurred, editable, not node-selected and not dragging, so a selection stays visible after blur without ever showing beside the native highlight (`ueberdosis/tiptap@91c51be5:packages/extensions/src/selection/selection.ts:34-50`). Source: `c70bacbd4a:docs/plite/research/2026-06-14-selection-paste-undo-oracles/read-log.tsv:13`; reread at the pinned commit on 2026-10-08.
