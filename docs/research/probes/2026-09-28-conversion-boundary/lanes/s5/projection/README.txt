S5 projection run: snapshot p of main taken 2026-09-29T15:05:22Z (HEAD a7750ad388 plus 529 working-tree files, fingerprint 04a61af134b708e3).
Candidate: main as is. Read-only previews render a `document` through getStaticDocumentView / createProjectedEditorView.
Baseline: baseline.patch. It passes no `previous`, and the preview editor runs value.replace on every publication (the verdict-2 baseline form).
Both arms: production webpack builds with --no-mangling (build-*.log).

Harness change for this run: the strict final is measured from its own task through the task that renders it (trace.finalWorkMs, finalSpanMs). A preview held in React state commits in a later scheduler task. The profile's final split and final GC cover the same span. lastArrivalTaskMs keeps the older definition. Profile samples under createProjectedEditorView or getStaticDocumentView count as (b).

Files:
  matrix/                           per-cell receipts: 6 complete, 2 inconclusive (baseline warmup exceeded 180 s)
  matrix-summary.json               summarize-matrix.ts output: gate, breakdown, finalDiagnosis
  matrix-run.log, matrix-started.txt  Playwright log and start/end time (31 min of the 60-min cap)
  compare-verdict-2-mean.json       per cell: this run against the verdict-2 candidate (splice), using mean breakdowns (compare-projection.mjs)
  compare-verdict-2-median.json     medians over the three pairs, raw and normalized by the same pair's baseline (median-compare.mjs)
  diag-static-rich-50000/           one extra warmup-only stream per arm, profiled by function (inclusive top 80); not part of the matrix
  aborted-final-window/             the first attempt, stopped after 2 cells because the old final metric missed the scheduler-task render
  reruns/                           candidate correctness, lifetime and ai-session runs; ai-session repeats on both arms; the ai-session run on the decorate fix build
  ai-menu-decorate-fix.diff         the PreviewAIPlugin change checked in the scratch worktree only (not applied to main); build-decorate-fix.log is its build

Load: the machine was shared during the run (load average 7-18). Median baseline busy time moved +2 to +9% against verdict-2 in three 10K cells and +40 to +74% in AI CJK 10K and the 50K cells.

Follow-up after the main report:
  snapshot-q-files.sha256, snapshot-q-deleted.txt, build-candidate-q.log
                                    candidate q: main at 2026-09-29T16:20:56Z (567 files, fingerprint 2a3695137c9db76f), with the PreviewAIPlugin decorate fix and the demo element filter
  reruns-q/                         candidate q: ai-session, correctness and lifetime; the editor-click dismissal test at load 3.5-5, alternating arms
  repeat/                           the three inconclusive 50K cells, rerun on candidate q against the same baseline at load 4-6. The budget was seeded with the first run's 31 min, and the last stream began under the 60-min cap (60.7 min total).
  diag-cjk-ragged-row/              why the CJK 50K final texts differ: the fixture ends inside a table row ("| a"). The parser emits a one-cell row; editor normalization pads it with an empty cell, which renders U+FEFF. The projection renders the parse unnormalized.
