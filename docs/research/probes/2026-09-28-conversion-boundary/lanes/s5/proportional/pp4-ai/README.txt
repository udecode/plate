S5 AI cells on pp4, the tree with the lead's DOM-side fix: the AI draft's fallback end-marker span stays mounted, so the preview root never flips :last-child (see ../style-isolation/).
The static cells' code is identical to pp3, so ../ (pp3) stands for the static cells on the final tree.

Snapshots
  pp4       2026-09-30T03:32:28Z, HEAD a5d07011f3 plus 403 working-tree files (this lane's receipts included), no deletions (snapshot-files.sha256, snapshot-deleted.txt).
            Full fingerprint 1a164f1498926602; product fingerprint 3865d8e72e4f79a0, excluding lanes/s5/proportional/ and the plan doc.
  pp4-base  03:32:35Z, the same product list, with baseline.patch applied.
  Changes against pp3, all of which the lead listed:
    - apps/www/src/registry/components/editor/ai-menu.tsx: f31e83869fe46284
    - ai-menu.spec.tsx: 8524a6d1ecef6df6
    - registry output, the changelog entry and the plan
  Unchanged from pp3: demo d4380cdac6642db6, BaseCodeBlockPlugin fce8981a755e0b8d, AIChatPlugin 5bd1f158a2565593, PlateStatic 57608045c0036398, contract spec 9dc3ccb1f3b7cccf, ai-session spec 0079cb8c66e1452a.
Arms
  Candidate: the tree as is.
  Baseline: baseline.patch reverts only the publication path.
    - The AIChatPlugin and demo hunks are identical to ../baseline.patch.
    - In ai-menu.tsx, the draft is published into a view by a layout-effect value.replace, and the preview memo depends on [inline, view, streaming]. The shared fixes stay, including the mounted fallback span.
  The bundles hold the expected code: only the candidate has the continuation `previous` and the deferred previewDocument; only the baseline has value.replace; both have endWithoutText.
Builds: production webpack with --no-mangling and the w paths (build-*.log, 114-115 s). Servers: candidate :3651, baseline :3652. Runner and browser at nice 5.

1. Preflight (reruns/, load 3.6-3.7)
  Contract spec, AI tests (-g AI): 3/3 on the candidate, 3/3 on the baseline.
  ai-session.spec.ts: 18/19 on both arms.
    - "Generate Markdown sample keeps its review visible and accepts a usable table" passes on both.
    - The failure on both arms is the known narrow-view test ("AI edit review renders text, accepts it, and preserves undo on a narrow view", expected "d preview text."), as in pp3 and lanes/s5/REPORT.md.

2. End marker (end-marker/)
  Inline preview on /blocks/ai-demo, the S5 setup (scripts/end-marker-probe.mjs). The draft is sampled on every animation frame while streaming:
    candidate  cjk-50000   565 samples: exactly one data-editor-ai-end in 565.
                           The decoration marker holds the last text's last code point in 502/502.
                           The last text was empty in 63 samples, and the fallback showed in 63/63; it never showed with a non-empty last text.
                           The draft always had 2 children, and the fallback span was always its last child and the same node.
               cjk-10000   107/107 exactly one; fallback 12/12 when the last text was empty.
               rich-10000  106/106 exactly one; fallback 6/6.
  After Accept, streaming is false:
    - rich and CJK 10 KB: one marker, on the last code point;
    - CJK 50 KB: none, and the fallback is hidden. Its last text is the padded empty table cell, and the fallback shows only while streaming.
  Docs AI menu (/docs/components/ai-menu, scripts in end-marker/): on the candidate, exactly one marker on the last code point in 8/8 samples during streaming and after.
  The baseline shows gaps, which are not product behaviour:
    - inline: 61 of 137 empty-last-text samples have no marker;
    - docs: misses in 3 of 8 samples.
    The baseline computes the fallback from the store's previewValue but renders its editor's value, which it replaces in a layout effect.

3. Matrix: the 4 AI cells, a warmup per arm plus 3 alternating pairs, with traces. 8.6 min, 32 streams, load 1.5-3.4 on measured pairs. No errors, no timeouts.
  Verdicts: all 4 pass under matrix-summary-ratio125.txt.
    - The unmodified summarizer (matrix-summary.txt) marks ai-rich-10000 and ai-rich-50000 inconclusive, citing "profile lost its stacks". Its guard requires sampled CPU time to be at most 1.2x trace busy.
    - The candidate's AI busy time is now so small that two of those profiles reach 1.21 (1.19-1.21 across the six), while their native share is 0.48-0.53. A profile that lost its stacks shows about 0.86.
    - scripts/summarize-matrix-ratio125.ts is the same summarizer with the bound at 1.25.
  (a)+(b) falls 95.0-98.8% per pair.
  Parity: final text and HTML are identical between arms and to pp3. The mounted span sits outside the preview root, so the dumped HTML does not change. End markers in the final HTML: 1, 1, 1, 0 (CJK 50 KB, as before).

Style, layout, paint, React and busy (style/*.json from scripts/ai-style-compare.py; candidate, median of the measured streams)
  Full-preview recalcs are style recalculations covering at least half of the final preview's elements.
                     style recalc per commit    layout   paint   full-preview recalcs per stream   c       busy
                     pp3 / D / pp4 (ms)          pp4      pp4     pp3 / D / pp4                     pp3 / D / pp4   pp3 / D / pp4
  ai-rich-10000      2.24 / - / 1.48             0.40     0.98    3 / - / 1                          200 / - / 198   564 / - / 534
  ai-cjk-10000       4.34 / - / 2.02             1.23     1.10    7 / - / 1                          295 / - / 284   827 / - / 719
  ai-rich-50000      6.61 / 1.31 / 1.30          0.57     1.03    21 / 1 / 1                         1,152 / 1,163 / 1,138   3,962 / 2,835 / 2,825
  ai-cjk-50000       11.44 / 1.80 / 1.81         1.04     1.30    27 / 1 / 1                         2,077 / 1,954 / 1,973   6,695 / 4,365 / 4,362
  D is ../style-isolation/'s variant, with 2 streams per cell, 50 KB only.
  - pp4 matches D. The one full-preview recalc left per stream (90 ms rich, 136 ms CJK at 50 KB) is the end-of-stream `streaming` className toggle on EditorStatic's root.
  - Busy against pp3: -5% (rich 10 KB), -13% (CJK 10 KB), -29% (rich 50 KB), -35% (CJK 50 KB). React time is within -1% to -5%.
  - Layout and paint are unchanged from pp3.
  - Static demo reference (pp3): style recalc 0.70 (rich) and 0.89 (CJK) ms per commit at 50 KB.
  Against w, candidate: c 383 > 198, 657 > 284, 4,375 > 1,138, 8,084 > 1,973; busy 697 > 534, 1,135 > 719, 6,107 > 2,825, 10,795 > 4,362 (compare-w.json).
  Baseline drift against w: a -3% to -9%, b -2% to -8%.

Files
  matrix/, matrix-summary.json / .txt (the unmodified summarizer), matrix-summary-ratio125.json / .txt, matrix-run.log, matrix-started.txt
  stream-table.json / .txt, compare-w.json / .txt, compare-pp3.json / .txt, parity.json / .txt
  style/                      pp3.json, pp4.json, D-AD-rich.json, D-AD-cjk.json
  end-marker/                 inline-*.json and docs-ai-end-*.json, with the probe scripts and run.log
  reruns/                     preflight-contract-ai-{candidate,baseline}.log, ai-session-{candidate,baseline}.log
  baseline.patch, build-*.log, snapshot-files.sha256, snapshot-deleted.txt
  scripts/                    run-matrix-pp4.sh, ai-style-compare.py, end-marker-probe.mjs, summarize-matrix-ratio125.ts
Raw traces, profiles and text dumps stayed in the scratchpad (s5/pp4-*).
