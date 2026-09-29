S5 projection-2: snapshot r of main taken 2026-09-29T17:16:55Z (HEAD a7750ad388 plus 585 working-tree files, fingerprint d70de160575b188a).
Candidate: main as is. Read-only previews render a `document` through a projection. It includes the PreviewAIPlugin decorate-context fix and Plite validation reuse (value-codec frozen JSON memo, editor-schema per-node reuse keyed to the compiled schema).
Baseline: baseline.patch, which is projection/baseline.patch rebased onto the demo's element filter. It passes no `previous`, and the preview editor runs value.replace on every publication.
Both arms: production webpack builds with --no-mangling (build-*.log). Matrix: 8 cells on a new 60-min budget, 38.9 min spent (matrix-started.txt).

Each stream receipt also records profile.functions: inclusive stream-window ms of assertDocument, createProjectedEditorView, isEditorJsonValue, parseSlice, updateEditor and withEditorDocumentProjection. It also records loadavg (1/5/15 min).

Files:
  matrix/, matrix-summary.json, matrix-run.log   receipts and summarize-matrix.ts output
  stream-table.txt / stream-table.json      per-stream load, a, b, c, busy, final and function tallies, plus per-cell medians (stream-table.mjs)
  compare-verdict-2-mean.json               per cell against the verdict-2 candidate (splice), using mean breakdowns (compare-projection.mjs)
  compare-verdict-2-median.json             medians over the three pairs, raw and normalized by the same pair's baseline (median-compare.mjs)
  reruns/                                   correctness preflight on both arms; candidate ai-session, correctness, lifetime, and the editor-click dismissal test x5

Final texts differ in static-cjk-50000 and ai-cjk-50000 for the reason in ../projection/diag-cjk-ragged-row/: the parsed last table row has one cell, editor normalization pads it, and the projection renders the parse unnormalized. Snapshot r was taken during a mutation test of the table padding (BaseTablePlugin.ts sha256 7a10bea1…, not main's final d3222422…), so this matrix does not cover text parity. parity/ covers it on snapshot s, where all final texts match.
