S5 reuse run: snapshot t of the working tree taken 2026-09-29T19:43:35Z (HEAD a7750ad388 plus 644 working-tree files, fingerprint 8295647ba159af76; snapshot-files.sha256, snapshot-deleted.txt).
Candidate: the tree as is. createEditorView(editor, { document }) is a read-only document view, and EditorStatic reuses blocks while each block and every block before it is unchanged by identity.
Baseline: baseline.patch (the projection-2 patch). It passes no `previous`, and the preview editor runs value.replace on every publication. The baseline shares the new EditorStatic, so its value.replace previews also reuse identity-stable blocks. Its React time fell from projection-2's too, so normalized deltas for c, busy, final and arrival against projection-2 are not meaningful; use the raw deltas. Raw a and b moved by less than 10%, so machine speed matched.
Both arms: production webpack builds with --no-mangling (build-*.log). Matrix: 8 cells on a new 60-min budget, 18.8 min spent, load 4.1-7.9 (stream-table.txt).

Attribution: (b) is profile samples under getStaticDocumentView, which creates the document view. profile.functions tallies assertDocument, getStaticDocumentView, isEditorJsonValue, parseSlice, updateEditor and withEditorDocumentProjection.
Summarizer: summarize-matrix.ts now rejects a profile as stackless at 80% (program) instead of 60%. With block reuse, static 10 KB candidate streams spend 61-63% in native (program) time, the same 410-445 ms as the baseline arm's 441-472 ms, with sampled/busy at 1.13-1.15. The one stackless profile seen before had 86%.

Files:
  matrix/, matrix-summary.json, matrix-run.log, matrix-started.txt   receipts and the summarize-matrix.ts output
  stream-table.txt / .json (stream-table.mjs)                         per-stream load, a, b, c, busy, final and function tallies
  compare-projection-2.json (compare-ref.mjs)                         per-cell medians against the projection-2 candidate: raw, baseline drift, normalized
  parity.json (parity.mjs)                                            final text and HTML hashes per cell and arm, from the S5_SAVE_TEXT dumps, plus data-editor-ai-end counts
  stale-render/                                                       streamed and fresh DOM probes (stream-vs-fresh.mjs) and per-block cross-arm HTML classification (block-diff.mjs)
  diag-static-rich-50000/                                             one profiled warmup stream per arm; the candidate's top 80 inclusive functions
  reruns/                                                             correctness preflight on both arms; candidate correctness, lifetime, ai-session and dismissal x5; AI HTML equality at 1-, 3- and 7-char chunks on both arms
