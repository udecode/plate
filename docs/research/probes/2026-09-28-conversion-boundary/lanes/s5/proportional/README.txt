S5 proportional run on the final tree: S5 static and AI cells for docs/plans/2026-09-30-static-preview-proportional-cost.md.
Final-tree status:
  - Static cells: the pp3 cells below stand for the final tree. pp4 changed only ai-menu.tsx, its spec and the registry output, so the static cells' code is identical to pp3.
  - AI cells: pp4-ai/ supersedes the pp3 AI cells. It is the lead's mounted fallback-span fix, which removes the whole-preview style recalcs found in style-isolation/. AI busy is -29% (rich) and -35% (CJK) at 50 KB against pp3; all 4 cells pass.
Earlier runs are kept only as superseded receipts (each folder has a SUPERSEDED.txt):
  - superseded-pp/: the pre-fix demo, run on a loaded machine.
  - superseded-pp2/: measured before the lead's 01:41-01:49Z fixes.

Snapshot
  pp3 (candidate)  2026-09-30T02:09:38Z. HEAD a5d07011f3 plus 267 working-tree files (91 product files and this lane's receipts), no deletions (snapshot-files.sha256, snapshot-deleted.txt).
                   Full fingerprint bfcc5b5c61da25af; product-only fingerprint de169eb11a4e8337, excluding lanes/s5/proportional/.
  pp3-base         02:09:44Z, the same list and hashes, with baseline.patch applied.
  The checkout did not move during the run: product hashes were checked every 30 s from 02:30 to 02:49Z, 37 checks (matrix-watch.log).
Checked sha256 prefixes in pp3:
  apps/www/src/registry/examples/markdown-streaming-demo.tsx            d4380cdac6642db6
  apps/www/src/registry/components/editor/ai-menu.tsx                   6f597c1fb762ecdd
  packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts   fce8981a755e0b8d
  apps/www/tests/browser/markdown-streaming-contract.spec.ts            9dc3ccb1f3b7cccf
  apps/www/tests/browser/markdown-streaming-lifetime.spec.ts            cb7b4e381682bbe6
  packages/platejs/src/static/components/PlateStatic.tsx                57608045c0036398
  packages/plitejs/src/core/anchor.ts                                   fa787f059451ea8b
  packages/platejs/src/internal/plugin/getPlateDecorationSources.ts     fb221beac3614839
  packages/plitejs/src/create-editor.ts                                 e1932e46c9eeb4a6
  packages/plitejs/src/editor-runtime-view.ts                           430759b02f47795b
  packages/plitejs/src/core/plugin.ts                                   5ecd95c7add87bdd
  packages/plitejs/src/core/clone.ts                                    be8f1860e897d31f
  packages/platejs/src/ai/react/AIChatPlugin.ts                         5bd1f158a2565593
The first three changed after pp2. The code block skips view.key in document views. The AI menu checks the end-marker path first, drops the per-commit scroll effect and memoizes EditorStatic. The demo memoizes its static output.
The matrix started at 02:30:28Z. The lead's pp3 go (tree final, suites done about 02:10Z, machine held quiet) reached this lane late, and the run satisfies it: no product file changed during the run, and measured-pair load was 1.5-4.8.
The pp3 worktrees were rebuilt at 02:56Z for ai-session. They have the same product files and patch, and webpack produced the same chunk names, so the frame keys in the profiles resolve against them.

Arms
  Candidate: the tree as is.
  Baseline: baseline.patch keeps projection-2 behavior: no `previous`, value.replace on every publication, nothing deferred.
    - AIChatPlugin hunks: unchanged since reuse/baseline.patch.
    - ai-menu.tsx: keeps the shared fixes (path check first, no per-commit scroll, memoized EditorStatic). It publishes each draft into a view with a layout-effect value.replace; the memo depends on [inline, view, streaming].
    - Demo: the status and error are urgent, and the memoized static output is keyed on the view.
  The baseline shares EditorStatic and the Plite read path, so its React time falls with the candidate's (baseline c -51% to -77% against w).
  The bundles hold the expected code:
    - only the candidate has the deferred output and the continuation `previous`;
    - only the baseline has the value.replace publications;
    - both have the code block's document-view key skip.
Builds: production webpack with --no-mangling, Next 16.3.2, the w paths (build-candidate.log, build-baseline.log, 113-114 s). Servers: next start, candidate :3631, baseline :3632.
Environment: Apple M5 Max (18 cores), chromium-headless-shell 149.0.7827.55, runner and browser at nice 5 (scripts/run-matrix-pp3.sh). S5_SAVE_TRACE is also set, so per-commit costs can be computed; traces are written after each stream, outside the measured window.

1. Preflight (reruns/, load 3.8-6.3 right after the builds)
  Contract correctness: 8/8 candidate, 8/8 baseline. Lifetime, both modes: 14/14 candidate, 14/14 baseline.

2. Probes (stale-render/, reruns/convergence-pp3/, load 2.3-3.1)
  - Streamed vs fresh: equal on both arms for reuse (chunks 16 and 64), code (16), rich (64) and CJK (64). TOC, list numbers, token spans and cell borders are the same as w's.
  - Docs AI menu: exactly one data-editor-ai-end, on the draft's last code point, in 8/8 samples while streaming and after, on both arms.
    The only console error is the embedded pro.platejs.org iframe's X-Frame-Options header.
  - Convergence (5 runs per flow): after a reset and a jump to the strict parse, the status commits with the output (lag 0, 5/5).
    After Previous and then Next chunk, the chunk heading (an urgent input signal, by design) leads the output by one commit, up to 25 ms.
    The output always converges without further input, and every flow ends equal to the expected text.
    The pre-fix pp probe is in reruns/convergence-pp/: 14-24 ms behind the status, always converging.
  - At stream end, with no further input, the final output lands 7-25 ms (static) and 31-179 ms (AI) after the last arrival (median of the matrix `final`). It equals the baseline's in every stream.

3. Matrix: 8 cells (static and ai x rich and cjk x 10000 and 50000), with a warmup per arm and 3 alternating pairs, on a 60-minute budget.
  18.1 min spent, 64 streams. Load was 1.5-4.8 on measured pairs (w: 4.3-13.2). One warmup recorded 9.1: the static CJK 50 KB candidate warmup, right after the baseline's heaviest stream.
  Errors: none. No stream recorded a page or console error, and none timed out, so no document-view guard threw.
  Verdicts: all 8 pass. (a)+(b) falls 94.2-99.0% per pair; finals and arrival p95 are lower than the baseline in every cell (summary-pp3.json).
  Metric semantics: no S5 metric reads the status. final, arrival, busy and the profile split come from output mutations inside the editor root and from trace timer calls. The status paragraph is outside the observed root, and waitForFinish only decides when to stop recording.
  Baseline drift against w (compare-w.json, median of pairs): a -10.7% to -2.2% and b -10.2% to +0.1%, except static CJK 50 KB at -23% and -24%. The superseded runs show the same -23%.
    Shared product code also changed since w (HEAD a7750ad388 to a5d07011f3, including Plite's cloneValue), so raw pp3-versus-w numbers include it.

4. After the matrix: ai-session.spec.ts (reruns/ai-session-{candidate,baseline}.log, load 3.7-4.4)
  18/19 on the candidate and 18/19 on the baseline.
  "Generate Markdown sample keeps its review visible and accepts a usable table" passes on both arms; it is the proof for the ResizeObserver-only inline scroll.
  The one failure is the same on both arms: "AI edit review renders text, accepts it, and preserves undo on a narrow view", the known narrow-view failure in lanes/s5/REPORT.md.

Correctness (parity.json): final text and HTML are identical between arms in every cell, 4 streams per arm, and identical to the superseded runs.
  Static HTML is byte-identical to w's. AI HTML equals w's once w's per-text purple wrapper spans are removed; the draft is now styled by its container.
  The end marker appears once, on the last character, in the rich cells and AI CJK 10 KB. AI CJK 50 KB has none in either arm or in w: the padded last table cell is empty.

Deferred rendering (chunking/commit-cost.json): no publication was skipped. Each publication got its own commit in every candidate stream (at most 1 publication per commit interval), at 10 and 50 KB.
  Rendering moved out of the publication task: AI previewTasksWithOutput is 0 (w: every preview task).

Chunking check (chunking/; candidate, 10 KB to 50 KB)
  React per commit (median): static rich 4.4 to 8.6 ms, static CJK 7.0 to 12.1, AI rich 3.5 to 5.0, AI CJK 5.6 to 9.1.
  React per publication (c / previews):
    pp3: static rich 4.8 to 8.7, static CJK 7.4 to 12.3, AI rich 5.0 to 5.6, AI CJK 7.2 to 10.0.
    w:   9.8 to 30.0, 16.2 to 40.4, 9.6 to 22.3, 16.8 to 41.5.
  Deferred document render per commit (renderRootConcurrent, mean): 4.4 to 6.7, 7.0 to 10.2, 3.7 to 5.4, 6.1 to 9.8 ms.
  What grows is the pass over every top-level block (Children with each block's decoration reads and readBlockInputs, plus memo compares and bailouts): 0.7-1.3 ms per commit at 10 KB, 1.7-3.8 ms at 50 KB.
    The source reads in that pass are 0.4-0.8 ms at 10 KB and 0.7-1.8 ms at 50 KB. Rendering changed blocks (BaseElementStatic, BaseLeafStatic) stays flat.
  Style, layout and paint per commit (chunking/render-pipeline.json, from the traces): static rich 3.1 to 5.1 ms, static CJK 4.8 to 8.3, AI rich 4.0 to 8.6, AI CJK 7.4 to 14.9.
    In the AI preview, style recalculation (UpdateLayoutTree) alone is 1.3 s (rich) and 2.4 s (CJK) per 50 KB stream, about 6-11 ms per commit.
    The static demo on the same documents spends 0.1-0.2 s per stream on it. The baseline pays it too, and pp2 already showed it, inside the forced layout.
    style-isolation/ isolates the cause, and it is not the container's purple selectors. The fallback end-marker span after EditorStatic's root appears and disappears, which flips the root's :last-child. Three global Tailwind group-last/* utilities compile to `:is(:where(.group\/X):last-child *)`, so every flip recalculates the whole preview.
    With the span kept in place, style recalculation drops to 1.3 ms (rich) and 1.8 ms (CJK) per commit.
  Verdict: refuted as stated, though smaller than the premise implied. React cost per commit still grows 1.4-1.9x from 10 to 50 KB. The part chunking addresses, the per-block pass, costs 1.7-3.8 ms per commit at 50 KB, so chunking would save about 2-4 ms rather than about 1 ms.
    The bigger size-dependent cost is now style, layout and paint (+2 to +7.5 ms per commit), which chunking React rendering alone does not reduce.
    Every commit stays within the 32 ms cadence: the deferred render is 5-10 ms at 50 KB, and no publication was skipped.
  The lead's fixes moved the costs pp2 exposed (superseded-pp2/):
    - static sync renders: 1.16 s to 0.22 s per 50 KB rich stream; the rest is the demo's Tokens list and shell;
    - AI passive effects: 0.92 s to 0.005 s (rich 50 KB);
    - snapshot index built through the highlighter's view.key: 137 ms to 0. The static table cell still builds it once per new document: about 1.3 ms per commit at CJK 50 KB (see below).

Before and after the lead's fixes (chunking/before-after/residual.txt; ms per preview commit, candidate)
  Superseded pp (pre-fix) against pp3, each 10 KB > 50 KB:
  - Per-block pass in the deferred render (Children, memo compares, bailouts):
      static rich 0.91 > 2.22 to 0.71 > 1.71; static CJK 1.27 > 4.04 to 0.90 > 2.54; AI rich 1.37 > 3.89 to 0.85 > 2.64; AI CJK 2.28 > 6.86 to 1.26 > 3.77.
    - source reads (chunking/read-split/): 0.59 > 1.38 to 0.46 > 0.65; 0.98 > 2.74 to 0.54 > 1.16; 1.01 > 2.43 to 0.54 > 1.11; 1.81 > 4.75 to 0.79 > 1.78
    - readBlockInputs' `visit`: 0.02 > 0.24 to 0.11 > 0.30; 0.22 > 1.03 to 0.23 > 1.12; 0.18 > 0.96 to 0.08 > 0.40; 0.76 > 2.71 to 0.30 > 1.30
    - memo compares and bailouts, unchanged: 0.1-0.2 > 0.4-1.1 in both
  - Static pass on urgent renders (Children under renderRootSync):
      demo 0.18 > 3.43 (rich) and 0.62 > 7.53 (CJK), now 0. The AI menu is 0 in both runs.
      Remaining demo urgent renders are its Tokens list and shell: 0.34 > 1.11 and 0.48 > 1.38.
  - Snapshot-index materializations:
      gone in the rich cells (0.16 > 0.67 and 0.30 > 0.65, now 0).
      Still 0.37 > 1.29 (static CJK) and 0.38 > 1.35 (AI CJK). The CJK fixture has tables, and TableCellElementStatic calls table.read.cell({ at: element }). That goes through readTableSelection and resolveNodeTargetLocation to materialize, once per new document (chunking/frames/*-cjk-50000-snapshot-index-callers.txt).
  - AI forced layout (passive effects): 1.22 > 4.77 (rich) and 2.85 > 9.17 (CJK), now 0.02-0.04.
      Style, layout and paint per commit did not fall (7.9 > 8.6 rich, 14.5 > 14.9 CJK at 50 KB), because the frame now runs the same layout.
      AI busy is -1% to -2% at 50 KB, while React time is -50%.
  - Totals at 50 KB: React time (c) -39% to -51%. Busy -21% (static rich), -28% (static CJK), -2% (AI rich), -1% (AI CJK). The pp run was on a loaded machine, so busy comparisons are approximate.
  (a) AI-menu urgent renders (chunking/before-after/pp-ai-*-sync.txt, pre-fix; chunking/frames/ai-*-sync.txt, pp3): 30-54 ms per stream in both runs.
      About 20 ms of that is creating the preview editor once on mount (useCreateEditor, then withPlate_createEditor). The static pass under them is at most 0.7 ms per stream.
      AIChatEditor did not re-run the static pass on urgent renders even before the memo: the compiler already memoized its EditorStatic element. Only the demo did.
  (b) Source reads per commit in the deferred render at 50 KB (chunking/read-split/):
      pp, pre-fix: static rich 1.38, static CJK 2.74, AI rich 2.43, AI CJK 4.75 ms.
        - the highlighter's view.key with its index build: 0.84-1.66
        - AI end marker: 0.86 (rich), 1.63 (CJK)
        - wrapper and guard: 0.17-0.57
        - highlighter type-check getters: 0.17-0.54
        - early checks and identity hits: 0.09-0.22
        - highlight and tokens: 0.07-0.10
        - re-path (atBlockPath): 0.00-0.02
      pp3: 0.65, 1.16, 1.11, 1.78 ms.
        - type-check getters: 0.21-0.55. Every element's `block.type !== codeBlock.schema.type` goes through the plugin access getter and the consumer-schema proxy.
        - end marker: 0.37
        - wrapper and guard: 0.12-0.49
        - identity hits: 0.14-0.22
        - highlight: 0.08-0.11
        - re-path: 0.01-0.04
      Re-pathing tokens is not a cost here. Block paths are stable in these streams, so atBlockPath returns the cached tokens.

Decorations (decor-sources/)
  The harness tallies changed scope since w, so they do not compare directly:
    - staticBlockDecorations covers only reads under readBlockInputs' `visit`. Children reads each node directly, outside `visit`.
    - withDocumentViewRead now also wraps leaf and text renders.
  all-reads-{pp3,w}.json (scripts/decor-all.mjs) counts every source read under the static Children in both runs. Median ms per stream, w to pp3:
    static rich 160 to 19 and 3,751 to 130; static CJK 289 to 23 and 5,693 to 224; AI rich 109 to 25 and 1,628 to 245; AI CJK 149 to 31 and 2,650 to 387.
    That is 8-21% of React time in pp3, against 23-61% in w.
  By source at 50 KB (median ms per stream, w to pp3):
    - code highlighter: static rich 2,579 to 105, static CJK 3,860 to 168, AI rich 874 to 100, AI CJK 1,400 to 201;
    - wrapper and guard: 1,166 to 24, 1,831 to 56, 547 to 55, 983 to 104;
    - AI end marker: 196 to 76 (rich), 291 to 77 (CJK).
  decor-sources/{static,ai}-rich-50000-candidate.txt is reuse/decor-sources.mjs as is (reads under `visit` only).

Files
  summary-pp3.json / .txt              per cell: verdict and checks; load; baseline drift against w; c and busy for p2, w and pp3; blockDecorations and withDocumentViewRead (w, pp3); staticDecorationReads (w, pp3); final and arrival (w alongside); (a)+(b) pairs; previews; commit costs
  matrix/, matrix-summary.json / .txt, matrix-run.log, matrix-started.txt, matrix-watch.log   receipts, summarize-matrix.ts output, and the tree and load watch
  stream-table.txt / .json             per-stream load, a, b, c, busy, final and tallies (reuse/stream-table.mjs)
  compare-w.json / .txt                candidate and baseline against w: raw, drift and normalized (reuse/compare-ref.mjs)
  parity.json / .txt                   final text and HTML hashes per cell and arm, and data-editor-ai-end counts (reuse/parity.mjs)
  chunking/                            commit-cost.json / .txt (scripts/commit-cost.mjs), render-pipeline.json / .txt (scripts/render-pipeline.mjs), frames/ (scripts/under-frame.mjs, scripts/callers-of.mjs), read-split/ (scripts/read-split.mjs, pre-fix pp and pp3), before-after/ (scripts/residual.mjs, pre-fix AI sync frames, snapshot-index totals, pp render pipeline)
  decor-sources/                       reuse/decor-sources.mjs for static-rich-50000 and ai-rich-50000, and all-reads-{pp3,w}.json / .txt
  stale-render/                        streamed and fresh probes and the AI end-marker probe on both arms, with the probe scripts
  reruns/                              preflight-{contract,lifetime}-{candidate,baseline}.log, ai-session-{candidate,baseline}.log; convergence-pp3/ and the pre-fix convergence-pp/
  baseline.patch, build-*.log, snapshot-files.sha256, snapshot-deleted.txt, scripts/
  style-isolation/                     the AI preview style-recalculation isolation (variants A-E, invalidation tracking), with its own README.txt
  pp4-ai/                              the AI cells on the final tree (pp4), with preflight, end-marker probes and the style/React/busy comparison against pp3 and variant D; its own README.txt
  superseded-pp/, superseded-pp2/      earlier runs; see their SUPERSEDED.txt
Raw CPU profiles, traces and text dumps stayed in the scratchpad (s5/pp3-prof, pp3-trace, pp3-text), as in w.
