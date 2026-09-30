S5 static and AI streaming cells for docs/plans/2026-09-30-content-root-locations-execution.md.

Question: does the content-root adoption regress streamed static or AI
preview latency, final work or output in Chromium? It makes no speed claim.

Snapshot
  2026-09-30T12:46:19Z. HEAD a5d07011f3 plus 518 working-tree files, none
  deleted (snapshot-files.txt, snapshot-files.sha256; fingerprint
  eaeabe8ab83dc976 of the sha list). Both arms are worktrees of that snapshot.

Arms
  Candidate: the snapshot as is (content-root adoption and closure repairs).
  Baseline: the snapshot with this plan's product files at their pre-change
    content (base-sources.sha): editor-runtime-view.ts, decoration-source.ts,
    decoration-context.tsx, plite.tsx, editable-text-blocks.tsx,
    staticDocumentView.ts, BaseTablePlugin.ts and the registry static list and
    table files from HEAD; PlateStatic.tsx, getPlateDecorationSources.ts and
    BaseListPlugin.ts reconstructed and matched to the design record's
    pre-change hashes. Additive exports (root-location, the Plite internal
    barrel, Plate facade) and YjsPlugin.tsx, which is not on this path, keep
    candidate content in both arms.
  Identity: only the candidate bundle contains getStaticRootView and
    getReaderRange (checked in .next-cr/static/chunks before the run).
Builds: next build --webpack --no-mangling on the S5 route subset, 190 s each
  (builds.txt). Servers: next start, candidate :3631, baseline :3632.
Environment: Apple M5 Max, managed Chromium; nice 5. Load 10.9 at the start
  (the builds had just finished; other projects were running), 2.2 at the end
  (matrix-started.txt).

Gate
  The summarizer (lanes/s5/summarize-matrix.ts, unchanged) was written for the
  conversion program and requires every pair to cut parse-plus-transaction
  work by 20% and 100 ms; it labels a flat cell "fail". This plan claims no
  speedup, so its gate is the summarizer's own no-regression checks: strict
  final p95 and arrival-to-DOM p95 within max(10%, 5 ms) of the baseline,
  identical final text across every stream, and valid profiles.

Results (matrix-summary.json)
  static-rich-10000   final 6.93→7.4   arrival 40.4→40.3  texts match  busy 559.6→556.2
  static-rich-50000   final 12.57→13.11 arrival 44.4→44.4 texts match  busy 4757→4737
  static-cjk-10000    final 10.14→8.83 arrival 45.1→43.9  texts match  busy 814→947 (one
                      candidate stream at 1,305 ms during the high-load start; the
                      other two ran 757/780 against baseline 783–862)
  static-cjk-50000    final 34.69→31.2 arrival 46.5→46.1  texts match  busy 7007→6688
  ai-cjk-10000        final 50.2→52.03 arrival 44.1→43.6  texts match  busy 856→736
  ai-cjk-50000        final 190.58→180.44 arrival 45.6→46.3 texts match busy 4730→4285
  ai-rich-10000/50000 inconclusive under the frozen profile rule: CPU profiles lost
                      their JS stacks in baseline and candidate streams, in the first
                      pass (superseded-first-pass/) and in a rerun at load ~2. The
                      trace and page checks, computed with the summarizer's formulas
                      (ai-rich-trace-checks.json): final 33.61→34.03 and
                      119.73→118.58, arrival 40.2→39.8 and 42.6→42.6, texts match,
                      busy 565→554 and 3026→3018.
  Every complete cell passes finalOk and latencyOk with matching final text.

Limits
  Three alternating pairs per cell after one warmup per arm; shared host.
  Profile attribution for ai-rich is unavailable; the guard was not changed.
  No live-AI (wall-clock) or editable cells were run.
