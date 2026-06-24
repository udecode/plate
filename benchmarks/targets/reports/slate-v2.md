# Slate v2 Benchmark Targets

This report is generated from `benchmarks/targets/slate-v2.json`.

Evidence Kit is legacy input during migration. Active benchmark decisions should
use target ids from this registry, then feed those targets into benchmark
runners, Autoresearch, and report generation.

## Summary

- Targets: 29
- Required artifacts: 27
- Existing artifacts: 27
- Missing optional artifacts: 2
- Missing required artifacts: 0
- Status counts: ok=27, missing-optional-artifact=2

## Targets

| Target | Family | Metric | Status | Artifacts | Metric output |
|--------|--------|--------|--------|-----------|---------------|
| browser-rich-text-replay-coverage | browser-rich-text | replay_seconds | ok | 1/1 | wrapped |
| clipboard-large-payload | clipboard | clipboard_seconds | ok | 1/1 | wrapped |
| collab-readiness | collaboration | benchmark_seconds | ok | 1/1 | wrapped |
| core-editor-store | core-current | core_benchmark_seconds | ok | 1/1 | wrapped |
| core-huge-document-compare | core-compare | core_benchmark_seconds | ok | 1/1 | wrapped |
| core-node-transforms | core-current | core_benchmark_seconds | ok | 1/1 | wrapped |
| core-normalization-compare | core-compare | core_benchmark_seconds | ok | 1/1 | wrapped |
| core-normalization-current | core-current | core_benchmark_seconds | ok | 1/1 | wrapped |
| core-observation-compare | core-compare | core_benchmark_seconds | ok | 1/1 | wrapped |
| core-query-ref-observation | core-current | core_benchmark_seconds | ok | 1/1 | wrapped |
| core-refs-projection | core-current | core_benchmark_seconds | ok | 1/1 | wrapped |
| core-rich-text-operations-compare | editing-navigation | rich_text_structural_ops_p95_ms | ok | 1/1 | yes |
| core-text-selection | core-current | core_benchmark_seconds | ok | 1/1 | wrapped |
| core-transaction-current | core-current | core_benchmark_seconds | missing-optional-artifact | 0/1 | wrapped |
| history-compare | history | history_compare_worst_p95_ratio | ok | 1/1 | yes |
| history-retained-memory | history | benchmark_seconds | missing-optional-artifact | 0/1 | wrapped |
| issue-6038-transaction-execution | issue-replay | benchmark_seconds | ok | 1/1 | wrapped |
| react-active-typing-breakdown | react-typing | typing_seconds | ok | 1/1 | wrapped |
| react-huge-document-browser-trace | react-large-document | react_huge_doc_type_to_paint_p95_ms | ok | 1/1 | yes |
| react-huge-document-full | react-large-document | react_huge_doc_full_max_budget_ratio | ok | 1/1 | yes |
| react-huge-document-legacy-compare | react-large-document | react_huge_doc_legacy_compare_worst_p95_ratio | ok | 1/1 | yes |
| react-huge-document-overlays | react-large-document | benchmark_seconds | ok | 1/1 | wrapped |
| react-huge-document-slate-browser-trace | react-large-document | browser_trace_seconds | ok | 1/1 | wrapped |
| react-huge-document-virtualized-type-to-paint | react-large-document | react_huge_doc_type_to_paint_p95_ms | ok | 1/1 | yes |
| react-pagination-virtualized-char-burst | react-pagination | pagination_virtualized_vs_table_ratio | ok | 1/1 | yes |
| react-pagination-virtualized-real-editor-ops | react-pagination | pagination_virtualized_real_ops_worst_p95_ms | ok | 1/1 | yes |
| react-rerender-breadth | react-locality | benchmark_seconds | ok | 1/1 | wrapped |
| react-runtime-node-fanout | react-locality | slate_react_runtime_node_fanout_count | ok | 1/1 | yes |
| yjs-collaboration | collaboration | yjs_collaboration_worst_p95_ms | ok | 1/1 | yes |
