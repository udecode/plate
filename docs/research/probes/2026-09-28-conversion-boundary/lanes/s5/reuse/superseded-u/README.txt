S5 reuse run: snapshot u of the working tree taken 2026-09-29T20:19:48Z (HEAD a7750ad388 plus 688 working-tree files, fingerprint e560c21aa90f3964; snapshot-files.sha256, snapshot-deleted.txt). One file failed the snapshot hash check: packages/platejs/src/zz-table-probe.spec.ts, which another lane was editing during the copy. It is a spec that www does not import.
Candidate: the tree as is. It has the document view, EditorStatic block reuse, whole-block decoration reads in the memo input (readBlockDecorations / areBlockDecorationsEqual), and the code highlighter reading the rendered document.
Baseline: baseline.patch (the projection-2 patch). It passes no `previous`, and the preview editor runs value.replace on every publication. The baseline shares the new EditorStatic, so it reuses identity-stable blocks and reads block decorations too. Against earlier runs, compare the candidate raw; the normalized deltas for c, busy, final and arrival are not meaningful.
Both arms: production webpack builds with --no-mangling (build-*.log). Matrix: 8 cells on a new 60-min budget, 25.7 min spent, load 4.9-15.9 per stream (stream-table.txt). The CJK 50K cells ran with baseline pairs at load 8-16 and were rerun into repeat-cjk50/ on the same budget.

Attribution: (b) is samples under getStaticDocumentView. profile.functions.staticBlockDecorations is EditorStatic's block decoration read. The bundle inlines readBlockDecorations, so the tally counts its inner `visit` under the static `Children` component. areBlockDecorationsEqual is inlined into the memo comparator and cannot be named.

Files:
  matrix/, matrix-summary.json, matrix-run.log, matrix-started.txt   receipts and the summarize-matrix.ts output
  stream-table.txt / .json (stream-table.mjs)                         per-stream load, a, b, c, busy, final and function tallies
  compare-projection-2.json, compare-t.json (compare-ref.mjs)         per-cell medians against the projection-2 candidate and the snapshot-t candidate (superseded-t/): raw, baseline drift, normalized
  parity.json (parity.mjs)                                            final text and HTML hashes per cell and arm, from the S5_SAVE_TEXT dumps, plus data-editor-ai-end counts
  stale-render/                                                       streamed and fresh DOM probes (stream-vs-fresh.mjs): TOC, list numbers, code token classes and table cell borders, on both arms
  repeat-cjk50/                                                       static-cjk-50000 and ai-cjk-50000 rerun at lower load
  reruns/                                                             correctness preflight on both arms; candidate correctness, lifetime, ai-session and dismissal x5; AI HTML equality at 1-, 3- and 7-char chunks on both arms; the end-marker probe on the AI menu page
  superseded-t/                                                       the snapshot-t run: block reuse without whole-block decoration reads
