S5 reuse run: snapshot w of the working tree taken 2026-09-29T22:03:03Z, after the lead's "matrix go w" (HEAD a7750ad388 plus 802 working-tree files, fingerprint 5b415afd36b17d15; snapshot-files.sha256, snapshot-deleted.txt).
Checked sha256 prefixes, all matching the lead's list:
  BaseCodeBlockPlugin.ts        e532830a6a7a2596  (highlighter reuses the live plugin portal)
  ai-menu.tsx                   764ad1530ccf3b8d  (end marker on the last code point)
  PlateStatic.tsx               527a69e9ac849710
  plitejs/src/create-editor.ts  e1932e46c9eeb4a6
  plitejs/src/core/public-state 2db70e1058d83fd0
  plitejs/src/core/plugin.ts    3b2e4cb6306226c1  (view plugin API refresh reads configurationRevision directly; checked after the lead added it, and already in w. Main has since moved to 5ecd95c7add87bdd, which is not measured here.)
Candidate: the tree as is. Baseline: baseline.patch (the projection-2 patch, with the ai-menu import hunk rebased). It passes no `previous`, and the preview editor runs value.replace on every publication. It shares EditorStatic, so compare the candidate against earlier runs raw.
Both arms: production webpack builds with --no-mangling (build-*.log). Matrix: 8 cells on a new 60-min budget, 22.1 min, load 4.3-13.2 per stream. Median baseline a and b moved -7% to +5% against snapshot u, so no cell was confounded and none was rerun.
Every stream records page and console errors (receipt `errors`): none in any stream, so no document-view guard throws.

Snapshot v (superseded-v/) was stopped as stale; it had already finished. Its BaseCodeBlockPlugin.ts (0d692050...) predates the portal-reuse highlighter. Its correctness, parity and guard results hold for that tree; its decoration timings are superseded by this run.

Attribution:
  - staticBlockDecorations: EditorStatic's block decoration read, tallied as the inlined readBlockDecorations' `visit` under `Children`.
  - withDocumentViewRead: the guard scope, whose inclusive time includes the scoped view reads.
  - decor-sources/: splits the block decoration read by decorate.read body (decor-sources.mjs, from the saved CPU profiles; pick-profiles.mjs).

Files:
  matrix/, matrix-summary.json, matrix-run.log, matrix-started.txt   receipts and the summarize-matrix.ts output
  summary-w.json                                                      per cell: verdict, load, baseline drift against u, c and busy for projection-2, u, v and w, staticBlockDecorations, withDocumentViewRead, final, arrival, (a)+(b) pairs
  stream-table.txt / .json (stream-table.mjs)                         per-stream load, a, b, c, busy, final and function tallies
  parity.json (parity.mjs)                                            final text and HTML hashes per cell and arm, plus data-editor-ai-end counts
  decor-sources/                                                      per-source breakdown for static-rich-50000 and ai-rich-50000 (3 measured candidate streams each)
  stale-render/                                                       streamed and fresh DOM probes on both arms, and the AI menu end-marker probe
  reruns/                                                             correctness preflight on both arms; candidate correctness, lifetime, ai-session and dismissal x5
  superseded-t/, superseded-u/, superseded-v/                         earlier snapshot runs, with SUPERSEDED.txt
