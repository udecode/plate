S5 reuse run: snapshot v of the working tree taken 2026-09-29T21:09:38Z, after the lead's "matrix go" (HEAD a7750ad388 plus 734 working-tree files, fingerprint fe67145be4bebfa6; snapshot-files.sha256, snapshot-deleted.txt).
Candidate: the tree as is. It has:
  - the document view and EditorStatic block reuse;
  - whole-block decoration reads in the memo input;
  - the code highlighter reading through the decorate context's view;
  - table path resolution under a read projection (public-state.ts);
  - the document-view read guard (document-view-read.ts, withDocumentViewRead), with the schema group built from the unguarded reader;
  - the AI end marker on the last character.
Baseline: baseline.patch, which is the projection-2 patch with the ai-menu import hunk rebased onto the new `type Decoration` import. It passes no `previous`, and the preview editor runs value.replace on every publication. It shares the new EditorStatic, so compare the candidate against earlier runs raw.
Both arms: production webpack builds with --no-mangling (build-*.log). Matrix: 8 cells on a new 60-min budget, 24.7 min, load 3.7-18 per stream. ai-rich-50000 came out inconclusive: a baseline profile sampled 0.70x busy at load 18. It was rerun with both CJK 50K cells (load 8-12 in the matrix) into repeat-50k/ at load 3.7-11.5, on the same budget (40.7 min total).
Every stream records page and console errors (receipt `errors`). There were none in any stream of either run, so no document-view guard throws.

Attribution:
  - staticBlockDecorations: EditorStatic's block decoration read. The minifier inlines readBlockDecorations, so it's tallied as its inner `visit` under `Children`.
  - withDocumentViewRead: the guard scope. Its inclusive time contains the view reads it scopes.
  - decor-sources.mjs splits the block decoration read by decorate.read body, from the saved CPU profiles (pick-profiles.mjs selects a cell's measured streams).

Files:
  matrix/, matrix-summary.json, matrix-run.log, matrix-started.txt   receipts and the summarize-matrix.ts output
  repeat-50k/                                                         ai-rich-50000, static-cjk-50000 and ai-cjk-50000 rerun at lower load (the same file shapes)
  summary-v.json                                                      per cell: verdict, load, (a)+(b) pairs, final, arrival; c and busy for projection-2, t, u and v; decoration and guard tallies
  stream-table.txt / .json (stream-table.mjs)                         per-stream load, a, b, c, busy, final and function tallies
  compare-*.json (compare-ref.mjs)                                    per-cell medians against the projection-2, t and u candidates
  parity.json (parity.mjs)                                            final text and HTML hashes per cell and arm, plus data-editor-ai-end counts
  decor-sources/                                                      per-source breakdown of the block decoration read for static-rich-50000 (matrix), and ai-rich-50000 and static-cjk-50000 (repeat-50k); 3 measured candidate streams each
  stale-render/                                                       streamed and fresh DOM probes on both arms (TOC, list numbers, code token classes, table cell borders) and the AI menu end-marker probe
  reruns/                                                             correctness preflight on both arms; candidate correctness, lifetime, ai-session and dismissal x5
  superseded-t/, superseded-u/                                        the earlier snapshot runs, with SUPERSEDED.txt
