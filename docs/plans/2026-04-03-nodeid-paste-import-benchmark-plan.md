# NodeId Paste/Import Benchmark Plan

## Goal

Add a dedicated `editor-perf` benchmark lane that measures the real `withNodeId` insert path under paste/import-style fragment insertion.

## Why

`init-dissection` only measures initialization and static normalization. It does not exercise the hot `insert_node` work inside `withNodeId`, so it cannot tell us whether more paste/import surgery is worth it.

## Steps

1. Add a NodeId fragment benchmark type to the `editor-perf` harness.
2. Measure real `insertFragment` work against NodeId modes that matter.
3. Separate raw-import and seeded-paste fragment cases.
4. Record the same counters that matter for NodeId cost:
   - ids assigned
   - duplicate lookup count/time
   - inserted node count
5. Verify the harness with targeted checks and one live run.
