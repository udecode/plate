S5 proportional run on the final tree: S5 static and AI cells for docs/plans/2026-09-30-static-preview-proportional-cost.md.
The earlier pp run measured the pre-fix demo on a loaded machine and is kept only in superseded-pp/ (see SUPERSEDED.txt there).

Snapshots
  pp2 (candidate)  2026-09-30T01:39:22Z. HEAD a5d07011f3 plus 200 working-tree files (89 product files and this lane's receipts), no deletions (snapshot-files.sha256, snapshot-deleted.txt). Full fingerprint f2a7e042ef533c42; product-only fingerprint 7908b09bc99167b9, excluding lanes/s5/proportional/.
  pp2-base         01:39:27Z, the same list and hashes, with baseline.patch applied.
  The 89 product files are identical to the first pp2 snapshot (01:18:59Z).
  The checkout moved after this snapshot, at 01:41:47-01:49:34Z, so pp2 does not measure the current tree for those files:
    - BaseCodeBlockPlugin.ts (fce8981a755e0b8d): skips view.key in document views.
    - ai-menu.tsx (6f597c1fb762ecdd): end-marker path check first, no per-commit scroll effect, memoized EditorStatic.
    - markdown-streaming-demo.tsx (d4380cdac6642db6): memoized static output.
    - Registry output, changelog, changeset and plan.
  The matrix started at 01:46:11Z, while the platejs typecheck (turbo logs at 01:45Z) and the registry build (01:46:16Z) had just run.
Checked sha256 prefixes in pp2, all matching the lead's list:
  apps/www/src/registry/examples/markdown-streaming-demo.tsx            a81769be3c5bdc22
  apps/www/tests/browser/markdown-streaming-contract.spec.ts            9dc3ccb1f3b7cccf
  apps/www/tests/browser/markdown-streaming-lifetime.spec.ts            cb7b4e381682bbe6
  packages/platejs/src/static/components/PlateStatic.tsx                57608045c0036398
  packages/plitejs/src/core/anchor.ts                                   fa787f059451ea8b
  apps/www/src/registry/components/editor/ai-menu.tsx                   659e4b8fc37c9ddc
  packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts   b82c97d9778c6f77
  packages/platejs/src/internal/plugin/getPlateDecorationSources.ts     fb221beac3614839
  packages/plitejs/src/create-editor.ts                                 e1932e46c9eeb4a6
  packages/plitejs/src/editor-runtime-view.ts                           430759b02f47795b
  packages/plitejs/src/core/plugin.ts                                   5ecd95c7add87bdd
  packages/plitejs/src/core/clone.ts                                    be8f1860e897d31f

Arms
  Candidate: the tree as is.
  Baseline: baseline.patch, which keeps projection-2 behavior: no `previous`, value.replace on every publication, and nothing deferred.
    - Its AIChatPlugin and ai-menu.tsx hunks are identical to superseded-pp/baseline.patch (reuse/baseline.patch rebased onto the deferred-value ai-menu).
    - Its demo hunks are rebased onto the final demo: the status and error render urgently. The resulting demo is byte-identical to the pp-base demo.
    - The baseline shares EditorStatic and the Plite read path, so its React time falls with the candidate's (baseline c -20% to -62% against w).
  The bundles hold the expected code: the deferred output and the continuation `previous` only in the candidate; the value.replace publications only in the baseline.
Builds: production webpack with --no-mangling, Next 16.3.2, the w paths (build-candidate.log, build-baseline.log, 114 s each). Servers: next start, candidate :3621, baseline :3622.
Environment: Apple M5 Max (18 cores), chromium-headless-shell 149.0.7827.55, runner and browser at nice 5 (scripts/run-matrix-pp2.sh). S5_SAVE_TRACE is set too, so per-commit costs can be computed; traces are written after each stream, outside the measured window.

1. Preflight (reruns/, before any timing; load 3.6-4.7 right after the builds)
  contract correctness: 8/8 candidate, 8/8 baseline. lifetime, both modes: 14/14 candidate, 14/14 baseline.

2. Probes (stale-render/, reruns/convergence-pp2/; load 2.5-3.3)
  - Streamed vs fresh: equal on both arms for reuse (chunks 16 and 64), code (16), rich (64) and CJK (64). TOC, list numbers, token spans and cell borders are the same as w's.
  - Docs AI menu: on the candidate, exactly one data-editor-ai-end, on the draft's last code point, in 8/8 samples while streaming and after.
    The baseline missed the marker in one sample.
    Both arms log one console error from the embedded pro.platejs.org iframe's X-Frame-Options header.
  - Convergence (5 runs per flow): after a reset and a jump to the strict parse, the status now commits with the output (lag 0, 5/5).
    After Previous and then Next chunk, the chunk heading (an urgent input signal, by design) still leads the output by one commit, up to 24 ms.
    The output always converges without further input, and every flow ends equal to the expected text.
    The pre-fix pp probe is in reruns/convergence-pp/: 14-24 ms behind the status, always converging.
    At stream end, with no further input, the final output lands 6-29 ms (static) and 28-188 ms (AI) after the last arrival: the median of the matrix `final`, whose wall-clock and main-thread times agree within 0.2 ms. It equals the baseline's in every stream.

3. Matrix: 8 cells (static and ai x rich and cjk x 10000 and 50000), with a warmup per arm and 3 alternating pairs, on a 60-minute budget.
  18.4 min spent, 64 streams. Load was 1.9-4.8 on measured pairs, and up to 7.0 on the static-rich-50000 warmups (w: 4.3-13.2).
  Errors: none. No stream recorded a page or console error, and none timed out, so no document-view guard threw.
  Verdicts: all 8 pass. (a)+(b) falls 94.1-99.1% per pair, and finals and arrival p95 are lower than the baseline in every cell (summary-pp2.json).
  Metric semantics: no S5 metric reads the status. final, arrival, busy and the profile split come from output mutations inside the editor root and from trace timer calls. The status paragraph sits outside the observed root, and waitForFinish only decides when to stop recording. The deferred status therefore changes no metric's meaning against w.
  One ai-rich-50000 candidate final took 189 ms (React 186 ms, no GC), against 117 and 121 ms for the other two, and changed no DOM. That makes its final p95, which is the max of three, 189 ms against 154 in w. The median is 121 ms against 152 ms in w.
  Baseline drift against w (compare-w.json, median of pairs): a -11.3% to +0.4% and b -9.8% to +1.6%, except static CJK 50 KB at -23%. The superseded pp run showed the same -23%, so it is repeatable and not load.
    Shared product code also changed since w (HEAD a7750ad388 to a5d07011f3, including Plite's cloneValue), so raw pp2-versus-w comparisons include it.

Correctness (parity.json): final text and HTML are identical between arms in every cell (4 streams per arm).
  Static HTML is byte-identical to w's. AI HTML equals w's once w's per-text purple wrapper spans are removed; the draft is now styled by its container.
  The final output of every cell is also identical to the superseded pp run.
  The end marker appears once, on the last character, in the rich cells and AI CJK 10 KB. AI CJK 50 KB has none in either arm or in w: the padded last table cell is empty.

Deferred rendering (chunking/commit-cost.json): no publication was skipped. Each publication got its own commit in every candidate stream (at most 1 publication per commit interval), at 10 and 50 KB.
  Rendering moved out of the publication task: AI previewTasksWithOutput is 0 (w: every preview task).
  The deferral never had to drop a document at this load.

Chunking check (chunking/; candidate, 10 KB to 50 KB)
  React per commit (median): static rich 4.7 to 14.3 ms, static CJK 7.6 to 21.5, AI rich 3.9 to 7.7, AI CJK 6.8 to 13.1.
  React per publication (c / previews): static rich 5.1 to 14.6, static CJK 8.5 to 22.3, AI rich 5.8 to 11.9, AI CJK 10.0 to 19.7.
    w: 9.8 to 30.0, 16.2 to 40.4, 9.6 to 22.3, 16.8 to 41.5. pp2 halves the cost, but the growth from 10 to 50 KB (2.0-2.9x) remains.
  Deferred document render per commit (renderRootConcurrent, mean): 4.1 to 7.0, 6.3 to 10.0, 3.6 to 6.9, 6.2 to 11.2 ms.
  What grows is the pass over all top-level blocks: Children, which includes every block's decoration source reads and readBlockInputs, plus the memo compares and bailouts. It costs 0.8-2.3 ms per commit at 10 KB and 2.3-6.9 ms at 50 KB.
    Decoration source reads alone are 0.5-1.5 ms at 10 KB and 1.4-4.8 ms at 50 KB. Rendering changed blocks (BaseElementStatic, BaseLeafStatic) stays flat.
  Verdict: refuted as stated. In the browser, per-publication cost still depends on document size. Chunking would save about 2-7 ms per commit at 50 KB, not about 1 ms. Each commit's deferred render (7-11 ms at 50 KB) still fits the 32 ms cadence, and no publication was skipped.
  Two further costs grow with size outside the deferred render, and chunking React rendering would not fix either:
    - Static demo: EditorStatic runs its whole per-block pass on every urgent render of the demo, including chunk arrivals and each publication's urgent pass, while its document stays the same. EditorView passes a new props object each time, and EditorStatic is not memoized.
      renderRootSync takes 33 ms at 10 KB and 1,160 ms at 50 KB (rich); 64 ms and 2,174 ms (CJK). The Children pass inside it is 688 and 1,519 ms at 50 KB (frames/static-*-sync.txt).
    - AI inline preview: scrollAIPreviewEnd calls getBoundingClientRect after every commit, which forces layout: 0.9 to 4.8 ms per commit (rich) and 2.2 to 8.4 ms (CJK) from 10 to 50 KB (frames/ai-*-passive.txt).

Decorations (decor-sources/)
  The harness tallies changed scope since w, so they do not compare directly:
    - staticBlockDecorations covers only reads under readBlockInputs' `visit`, plus Plite's snapshot-index `visit`. That index (materialize) takes about 137 ms per 50 KB rich stream; the code highlighter's view.key triggers it (chunking/frames/static-rich-50000-snapshot-index-callers.txt).
    - Children now reads each node directly, outside `visit`.
    - withDocumentViewRead now also wraps leaf and text renders.
  all-reads-{pp2,w}.json counts every source read under the static Children, in both runs (scripts/decor-all.mjs). Median ms per stream, w to pp2:
    - static rich 160 to 23 and 3,751 to 682; static CJK 289 to 52 and 5,693 to 1,416
    - AI rich 109 to 40 and 1,628 to 508; AI CJK 149 to 63 and 2,650 to 981
    That is 12-32% of React time in pp2, against 23-61% in w.
  By source at 50 KB (median ms per stream, w to pp2):
    - code highlighter: static rich 2,579 to 496, static CJK 3,860 to 1,056, AI rich 874 to 250, AI CJK 1,400 to 516
    - wrapper and guard: 1,166 to 172, 1,831 to 380, 547 to 65, 983 to 105
    - AI end marker: 196 to 192 (rich), 291 to 333 (CJK)
    The end-marker source calls editor.read.children() for every node before it checks for a top-level block. That read is 94% of its time (decor-sources/ai-rich-50000-candidate.txt).
  decor-sources/{static,ai}-rich-50000-candidate.txt is reuse/decor-sources.mjs as is (reads under `visit` only).

Files
  summary-pp2.json / .txt              per cell: verdict and checks; load; baseline drift against w; c and busy for p2, w and pp2; blockDecorations and withDocumentViewRead (w, pp2); staticDecorationReads (w, pp2); final and arrival (w alongside); (a)+(b) pairs; previews; commit costs
  matrix/, matrix-summary.json / .txt, matrix-run.log, matrix-started.txt   receipts and summarize-matrix.ts output
  stream-table.txt / .json             per-stream load, a, b, c, busy, final and tallies (reuse/stream-table.mjs)
  compare-w.json / .txt                candidate and baseline against w: raw, drift and normalized (reuse/compare-ref.mjs)
  parity.json / .txt                   final text and HTML hashes per cell and arm, and data-editor-ai-end counts (reuse/parity.mjs)
  chunking/commit-cost.json / .txt     per stream: publications, commits, publications per commit, React by phase per commit, renderer frames (scripts/commit-cost.mjs)
  chunking/frames/                     per cell: frames of the deferred render, of the sync renders (static) and of the passive effects (AI); snapshot-index callers (scripts/under-frame.mjs, scripts/callers-of.mjs)
  decor-sources/                       reuse/decor-sources.mjs for static-rich-50000 and ai-rich-50000, and all-reads-{pp2,w}.json / .txt
  stale-render/                        streamed and fresh probes and the AI end-marker probe on both arms, with the probe scripts (error-recording copies of the reuse probes)
  reruns/                              preflight-{contract,lifetime}-{candidate,baseline}.log; convergence-pp2/ and convergence-pp/ (probe script and results)
  baseline.patch, build-*.log, snapshot-files.sha256, snapshot-deleted.txt
  scripts/                             run-matrix-pp2.sh, commit-cost.mjs, decor-all.mjs, under-frame.mjs, callers-of.mjs, build-summary-pp2.mjs
  superseded-pp/                       the pp run on the pre-fix demo and a loaded machine, plus a partial pp2 static-only run; see SUPERSEDED.txt
Raw CPU profiles, traces and text dumps stayed in the scratchpad (s5/pp2-prof, pp2-trace, pp2-text), as in w.
