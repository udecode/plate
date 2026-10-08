# Slate: tables

## Table fragments

- Legacy Slate leaves table-fragment insertion unsettled: its three `insertFragment/of-tables` fixtures (`merge-cells-with-nested-blocks`, `merge-into-empty-cells`, `merge-into-full-cells`) all export `skip = true`, and an earlier automation that unskipped them saw them fail. Evidence: `ianstormtaylor/slate@945a484df2497e4c448b33f417b0de2a49840032:packages/slate/test/transforms/insertFragment/of-tables/merge-into-empty-cells.tsx:53`, `merge-cells-with-nested-blocks.tsx:68`, `merge-into-full-cells.tsx:50`. The source's 'upstream Plite' is rename damage for legacy Slate.
