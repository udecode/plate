# Plite v2 Benchmark Targets

This report is generated from `benchmarks/targets/slate-v2.json`.

Evidence Kit is legacy input during migration. Active benchmark decisions should
use target ids from this registry, then feed those targets into benchmark
runners, Autoresearch, and report generation.

## Summary

- Targets: 41
- Required artifacts: 41
- Existing artifacts: 41
- Missing optional artifacts: 0
- Missing required artifacts: 0
- Status counts: ok=41

## Targets

| Target | Family | Metric | Status | Artifacts | Metric output |
|--------|--------|--------|--------|-----------|---------------|
| browser-rich-text-replay-coverage | browser-rich-text | replay_seconds | ok | 1/1 | wrapped |
| clipboard-large-payload | clipboard | plite_clipboard_worst_issue_p95_ms | ok | 1/1 | yes |
| collab-readiness | collaboration | benchmark_seconds | ok | 1/1 | wrapped |
| core-anchors-projection | core-current | core_benchmark_seconds | ok | 1/1 | wrapped |
| core-document-change-current | core-current | transaction_median_ratio | ok | 1/1 | wrapped |
| core-editor-store | core-current | core_benchmark_seconds | ok | 1/1 | wrapped |
| core-huge-document-compare | core-compare | core_benchmark_seconds | ok | 1/1 | wrapped |
| core-node-transforms | core-current | core_benchmark_seconds | ok | 1/1 | wrapped |
| core-normalization-compare | core-compare | core_benchmark_seconds | ok | 1/1 | wrapped |
| core-normalization-current | core-current | core_benchmark_seconds | ok | 1/1 | wrapped |
| core-observation-compare | core-compare | core_benchmark_seconds | ok | 1/1 | wrapped |
| core-query-anchor-observation | core-current | core_benchmark_seconds | ok | 1/1 | wrapped |
| core-resolved-token-cursor | core-current | plite_resolved_token_cursor_worst_large_stress_median_ratio | ok | 1/1 | yes |
| core-rich-text-operations-compare | editing-navigation | rich_text_structural_ops_p95_ms | ok | 1/1 | yes |
| core-text-selection | core-current | core_benchmark_seconds | ok | 1/1 | wrapped |
| core-update-policy-current | core-current | historyToDefaultP95 | ok | 1/1 | wrapped |
| core-yjs-collaboration-current | core-current | yjs_collaboration_worst_p95_ms | ok | 1/1 | yes |
| history-compare | history | history_compare_worst_p95_ratio | ok | 1/1 | yes |
| issue-6038-transaction-execution | issue-replay | benchmark_seconds | ok | 1/1 | wrapped |
| plite-content-slice-value | core-slice | plite_content_slice_value_trusted_identity_reuse | ok | 1/1 | yes |
| plite-correction-worklist | core-corrections | plite_correction_worklist_max_touched_targets | ok | 1/1 | yes |
| plite-fit-content-locality | core-slice | plite_fit_content_document_width_ratio | ok | 1/1 | yes |
| plite-history-depth | history | plite_history_depth_median_ratio | ok | 1/1 | yes |
| plite-history-retained-memory | history | plite_history_retained_memory_json_ratio | ok | 1/1 | yes |
| plite-schema-architecture | core-schema | plite_schema_architecture_compile_p95_ms | ok | 1/1 | yes |
| plite-schema-construction | core-schema | plite_schema_construction_max_changed_span | ok | 1/1 | yes |
| plite-transaction-execution | core-transaction | plite_transaction_mixed_batch_p95_ratio | ok | 1/1 | yes |
| plite-yjs-event-change-bridge | collaboration | plite_yjs_event_change_sync_distance_ratio | ok | 1/1 | yes |
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
| react-runtime-node-fanout | react-locality | plite_react_runtime_node_fanout_count | ok | 1/1 | yes |
| react-stable-id-overlay-source | react-locality | plite_overlay_decoration_recreated_100000_indexed_median_ms | ok | 1/1 | yes |
| yjs-collaboration | collaboration | yjs_collaboration_worst_p95_ms | ok | 1/1 | yes |
