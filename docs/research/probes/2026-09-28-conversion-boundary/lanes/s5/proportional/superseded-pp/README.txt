S5 proportional run: S5 static and AI cells re-measured for docs/plans/2026-09-30-static-preview-proportional-cost.md.

Snapshots
  pp       2026-09-30T00:36:44Z, HEAD a5d07011f3 plus 87 working-tree files, no deletions, fingerprint 91e5785ed41a6511 (snapshot-files.sha256, snapshot-deleted.txt).
  pp-base  00:37:05Z, the same file list and hashes as pp; the baseline patch is applied on top.
  pp2      01:18:59Z, taken because the checkout moved during the run (see below); fingerprint b47954ac73674842 (static-rerun/snapshot-files.sha256).
Checked sha256 prefixes in pp, all matching the lead's list:
  packages/platejs/src/static/components/PlateStatic.tsx                57608045c0036398
  packages/plitejs/src/core/anchor.ts                                   fa787f059451ea8b
  apps/www/src/registry/components/editor/ai-menu.tsx                   659e4b8fc37c9ddc
  apps/www/src/registry/examples/markdown-streaming-demo.tsx            35ff37f8918718f9  (pp2: a81769be3c5bdc22)
  packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts   b82c97d9778c6f77
  packages/platejs/src/internal/plugin/getPlateDecorationSources.ts     fb221beac3614839
  packages/plitejs/src/create-editor.ts                                 e1932e46c9eeb4a6
  packages/plitejs/src/editor-runtime-view.ts                           430759b02f47795b
  packages/plitejs/src/core/plugin.ts                                   5ecd95c7add87bdd
  packages/plitejs/src/core/clone.ts                                    be8f1860e897d31f
The checkout moved at about 00:49Z, after the preflight below. The streaming demo now defers its status, parse error and document together (a81769be3c5bdc22), the contract and lifetime specs wait for that, and registry output, the changelog entry and the plan followed. Nothing else the cells load changed: ai-menu.tsx, AIChatPlugin.ts and every package file keep their pp hashes. So the AI cells in matrix/ measure the final tree, and static-rerun/ repeats the four static cells on pp2. Its c and busy are within 5.4% of the pp static cells, with byte-identical output.

Arms
  Candidate: the tree as is.
  Baseline: baseline.patch. It is reuse/baseline.patch with the ai-menu.tsx and markdown-streaming-demo.tsx hunks rebased onto the deferred-value code; the AIChatPlugin hunks apply unchanged. It passes no `previous`, the preview editor runs value.replace on every publication, and nothing is deferred. It shares EditorStatic and the Plite read path, so its React time falls with the candidate's (baseline c -24% to -62% against w).
  static-rerun reuses the pp-base build. Applying the patch to the pp2 demo gives a file byte-identical to pp-base's demo (checked with diff).
Builds: production webpack with --no-mangling, Next 16.3.2, the w paths (build-candidate.log, build-baseline.log, 132 s each; pp2 98 s). Servers: next start, candidate :3611, baseline :3612, pp2 :3613.
Environment: Apple M5 Max (18 cores), chromium-headless-shell 149.0.7827.55, runner and browser at nice 5 (scripts/run-matrix.sh). S5_SAVE_TRACE was set as well, so per-commit costs could be computed; traces are written after each stream, outside the measured window.
Matrix: 8 cells, a warmup per arm plus 3 alternating pairs, 60-minute budget: 18.5 min spent, 64 streams, load 1.8-5.7 per stream (w: 4.3-13.2). static-rerun: 4 cells, 9.1 min, 32 streams, load 1.7-2.9.
Errors: none. No stream recorded a page error or console error (receipt `errors`), and none timed out, so no document-view guard threw.

Verdicts: all 8 cells pass, and all 4 static-rerun cells pass. (a)+(b) falls 93.5-99.1% per pair, with finals and arrival p95 lower in every cell (summary-pp.json).

Correctness
  - Parity (parity.json): final text and HTML are identical between arms in every cell, 4 streams per arm. Static HTML is byte-identical to w's.
    AI HTML equals w's once w's per-text purple wrapper spans are removed (945 to 5,670 per cell). The draft is now styled by its container.
  - AI end marker: exactly one data-editor-ai-end, on the last character, in the rich cells and AI CJK 10 KB.
    AI CJK 50 KB has none in either arm or in w: normalization pads the ragged last table row, so the last leaf is empty.
    The docs AI menu probe (stale-render/ai-end-*.json) shows one marker on the draft's last code point in 8 of 8 samples during streaming and 1 of 1 after it. Its only console error, in both arms, is the pro.platejs.org iframe's X-Frame-Options header.
  - Streamed vs fresh (stale-render/): equal on both arms for reuse (chunks 16 and 64), code (16), rich (64) and CJK (64), with the same TOC, list numbers, token spans and cell borders as w. static-rerun/stale-render repeats them on pp2.
  - Preflight (reruns/): with the pp demo, the candidate fails 2 of 8 correctness tests and the baseline passes 8 of 8.
    Both failures read the output right after an urgent status or heading update, while the deferred output was still one commit behind (preflight-candidate-failures/).
    reruns/deferred-lag measured the lag: 14-24 ms, and the output always converges. On pp2 with the updated spec, both arms pass 8 of 8, and the status now commits with the output (lag 0 in 5 of 5). The chunk heading still leads by one commit, by design.

Deferred rendering (chunking/commit-cost.json)
  No publication was skipped. In every candidate stream each publication got its own commit (at most 1 publication per commit interval), at 10 and 50 KB alike, so under this load the deferral never had to drop a document.
  Rendering moved out of the publication task: AI previewTasksWithOutput is 0 (w: every preview task).

Chunking check (chunking/)
  Candidate, 10 KB to 50 KB:
    React per commit (median): static rich 4.7 to 14.1 ms, static CJK 7.4 to 21.5, AI rich 4.5 to 7.6, AI CJK 7.2 to 13.2.
    React per publication (c / previews): static rich 4.9 to 14.2 ms, static CJK 8.1 to 22.4, AI rich 6.5 to 11.8, AI CJK 10.0 to 20.5. w: 9.8 to 30.0, 16.2 to 40.4, 9.6 to 22.3, 16.8 to 41.5.
    Deferred document render per commit (renderRootConcurrent, mean): 4.0 to 6.8, 6.1 to 9.9, 4.0 to 6.7, 6.6 to 11.2 ms.
  What grows is the per-block pass over all top-level blocks: Children, which includes every block's decoration source reads, readBlockInputs and memo compares.
    It takes 0.8-2.1 ms per commit at 10 KB and 1.8-5.8 ms at 50 KB, and the source reads alone are 1.4-4.7 ms at 50 KB (frames/*-concurrent.txt).
    Rendering the changed blocks (BaseElementStatic, BaseLeafStatic) stays flat.
  Outside the deferred render, two costs grow with size, and neither is fixed by chunking React rendering:
    - Static demo: EditorStatic runs its per-block pass on every render of the demo, including chunk arrivals and each publication's urgent pass, which do not change its document. EditorView gets a new props object each time, and EditorStatic is not memoized. Sync renders take 0.03-0.06 s per stream at 10 KB and 1.15-2.16 s at 50 KB (frames/static-*-sync.txt).
    - AI inline preview: scrollAIPreviewEnd calls getBoundingClientRect after every commit, which forces the layout there. It takes 1.2 to 4.8 ms per commit (rich) and 2.8 to 9.2 ms (CJK), 10 to 50 KB (frames/ai-*-passive.txt).
  Verdict: refuted as stated. In the browser, per-publication cost still depends on document size. The per-block pass and memo checks over all blocks cost about 2-7 ms per commit at 50 KB, so chunking would save that much rather than about 1 ms. The deferred render per commit (6-11 ms at 50 KB) still stays under the 32 ms cadence, and no publication was skipped.

Decorations (decor-sources/)
  The harness tallies changed scope since w, so they don't compare directly:
    - staticBlockDecorations counts only reads under readBlockInputs' `visit`, plus Plite's snapshot-index `visit` (materialize, about 130 ms per 50 KB rich stream, triggered by the code highlighter's view.key; chunking/frames/static-rich-50000-snapshot-index-callers.txt). Children now reads each node directly, outside `visit`.
    - withDocumentViewRead now also wraps leaf and text renders.
  all-reads-{pp,w}.json (scripts/decor-all.mjs) counts every source read under the static Children in both runs.
    Median ms per stream, w to pp: static rich 160 to 28 and 3,751 to 639; static CJK 289 to 55 and 5,693 to 1,432; AI rich 109 to 42 and 1,628 to 493; AI CJK 149 to 73 and 2,650 to 969.
    That is 15-32% of React time in pp, against 23-61% in w.
  By source at 50 KB (median ms per stream, w to pp):
    code highlighter: static rich 2,579 to 468, static CJK 3,860 to 1,080, AI rich 874 to 254, AI CJK 1,400 to 519;
    wrapper and guard: 1,166 to 166, 1,831 to 352, 547 to 57, 983 to 117;
    AI end marker: 196 to 171 (rich) and 291 to 335 (CJK). The end-marker source calls editor.read.children() for every node before it checks for a top-level block, and that read is about 90% of its time.
  decor-sources/{static,ai}-rich-50000-candidate.txt is reuse/decor-sources.mjs as is, which covers only reads under `visit`.

Baseline drift against w (compare-w.json, median of pairs): a -3.5% to -22.5% and b -1.6% to -23.0%. It is within 6% at 10 KB and largest at static CJK 50 KB. Product code shared by the baseline also changed since w (HEAD a7750ad388 to a5d07011f3, including Plite's cloneValue), so raw pp-versus-w numbers at 50 KB include that as well as the environment.

Files
  summary-pp.json / .txt                  per cell: verdict, load, baseline drift against w, c and busy for p2, w and pp, blockDecorations and withDocumentViewRead (w, pp), staticDecorationReads (w, pp), final, arrival, (a)+(b) pairs, commits; static cells also carry finalTree (pp2)
  matrix/, matrix-summary.json / .txt, matrix-run.log, matrix-started.txt   receipts and summarize-matrix.ts output
  stream-table.txt / .json                per-stream load, a, b, c, busy, final and tallies (reuse/stream-table.mjs)
  compare-w.json / .txt                   candidate and baseline against w, raw, drift and normalized (reuse/compare-ref.mjs)
  parity.json / .txt                      final text and HTML hashes per cell and arm, and data-editor-ai-end counts (reuse/parity.mjs)
  chunking/commit-cost.json / .txt        per stream: publications, commits, publications per commit, React by phase per commit, renderer frames (scripts/commit-cost.mjs)
  chunking/frames/                        per-cell frame breakdowns of the deferred render, sync renders (static) and passive effects (AI) (scripts/under-frame.mjs, scripts/callers-of.mjs)
  decor-sources/                          reuse/decor-sources.mjs for static-rich-50000 and ai-rich-50000, plus all-reads-{pp,w}.json / .txt
  stale-render/                           streamed and fresh DOM probes on both arms, the AI end-marker probe, and the probe scripts (error-recording copies of the reuse probes)
  reruns/                                 correctness preflight logs for both arms, the candidate's failure artifacts, and deferred-lag/ (probe and results)
  static-rerun/                           the four static cells on pp2, with the same analyses, preflight and probes (see its README.txt)
  baseline.patch, build-*.log, snapshot-files.sha256, snapshot-deleted.txt
  scripts/                                run-matrix.sh, run-matrix-static2.sh, commit-cost.mjs, decor-all.mjs, under-frame.mjs, callers-of.mjs, build-summary.mjs
Raw CPU profiles, traces and text dumps stayed in the scratchpad (s5/pp-prof, pp-trace, pp-text and the pp2 equivalents), as in w.
