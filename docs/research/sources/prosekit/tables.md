# ProseKit: tables

## Table commands

- **Table grid.** `prosekit/prosekit@3fbfe7906c3448328e80c1c1333647d08e50907e:registry/test/table.test.ts` (L49-L258) pins that selecting cells through the handles, inserting a column before, deleting a column, clearing a row and dragging a row or a column to reorder keep a valid table grid. Plate's table specs under `packages/platejs/src/features/table/lib/` cover insertion, deletion, selection and the grid, and `BaseTablePlugin.transfer.spec.ts` there reorders rows through transfer landing. A search of Plate's table feature found no column reorder on 2026-10-08 (inferred from that search) (`docs/editor-test-harvester/prosekit/report.md:144`).

## Table controls and resizing

- ProseKit wraps prosemirror-tables plugins, ships framework-neutral table handle controls that use editor events and local state, and keeps a separate generic `resizable` component whose box preview owns its own properties while the caller persists dimensions (prosekit/prosekit@3fbfe7906c3448328e80c1c1333647d08e50907e:packages/extensions/src/table/table-plugins.ts:1-19; prosekit/prosekit@3fbfe790:packages/web/src/components/table-handle/table-handle-root.ts:1-105; prosekit/prosekit@3fbfe790:packages/web/src/components/resizable/resizable-root.ts:1-198; prosekit/prosekit@3fbfe790:packages/web/src/components/resizable/resizable-handle.ts:1-133; unchanged at 9ce6e9860b4b04fdb011e8ba3548b8305f67afd5; https://prosekit.dev/components/resizable/). Generic box resize and table boundary resize are distinct jobs, and framework portability alone does not justify moving table semantics into a substrate (docs/plite/research/2026-09-17-table-substrate-ownership/REPORT.md:49; read-log.tsv:140-147).
