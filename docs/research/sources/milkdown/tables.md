# Milkdown: tables

## Table selection

- Milkdown wraps prosemirror-tables `tableEditing` with table node selection enabled and exposes headless row and column selection commands that its table controls call, so the UI never builds text ranges; its Vue node view translates DOM selection with a delayed input policy worth not copying (Milkdown/milkdown@6a4db480b00db8dd0322b517117dfa2154f3e2e2:packages/plugins/preset-gfm/src/plugin/table-editing-plugin.ts:1-14; Milkdown/milkdown@6a4db480:packages/plugins/preset-gfm/src/node/table/command.ts:130-185; Milkdown/milkdown@6a4db480:packages/components/src/table-block/view/view.ts:1-150; Milkdown/milkdown@6a4db480:packages/components/src/table-block/view/operation.ts:1-148; comment-only changes at 920cded3fc9fe956de87339e30507650a916cf56; https://milkdown.dev/docs/api/preset-gfm; docs/plite/research/2026-09-17-table-substrate-ownership/REPORT.md:50; read-log.tsv:148-155).
