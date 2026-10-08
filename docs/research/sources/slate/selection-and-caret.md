# Slate: selection and caret

## Hanging ranges

- Legacy Slate documents the triple-click hanging range. The browser selects from the start of the clicked block to the start of the next block, and `Editor.unhangRange` moves the end back into the last non-empty text node before the hanging block. The docs say it is built for triple-clicked blocks and lists caveats (`ianstormtaylor/slate@945a484df2497e4c448b33f417b0de2a49840032:docs/api/nodes/editor.md:283-285`). The 2026-06-14 run's README calls it classic Plite `Editor.unhangRange`, which is rename damage for legacy Slate. Source: `docs/plite/research/2026-06-14-selection-triple-click-inline-normalization/read-log.tsv:6`, `README.md:23`.
