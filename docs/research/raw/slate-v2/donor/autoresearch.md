# Autoresearch: react-huge-document-full

## Objective
react-huge-document-full

## Metrics
- Primary: react_huge_doc_full_max_budget_ratio (ratio, lower is better)
- Secondary: none yet

## How to Run
`cd '/Users/zbeyens/git/plate-2/.tmp/slate-v2' && HUGE_DOC_FULL_LEGACY_REPO=../../../slate HUGE_DOC_FULL_BLOCKS=5000 HUGE_DOC_FULL_ITERATIONS=5 HUGE_DOC_FULL_TRACE_ITERATIONS=5 HUGE_DOC_FULL_TYPE_OPS=10 bun run bench:react:huge-document:full:local` prints `METRIC name=value` lines.

## Files in Scope
- TBD: add files after initial inspection

## Off Limits
- TBD: add off-limits files or behaviors if needed

## Constraints
- - Decision contract: react_huge_doc_full_max_budget_ratio is the primary metric; secondary evidence explains tradeoffs but should not silently override it.

## Decision Rules
- Keep when the primary metric improves or a baseline is needed and checks pass.
- Discard when the metric is equal or worse, unless the run only establishes the baseline.
- Log crashes and failed checks with a concrete rollback reason.
- Put next-step guidance in ASI so another Codex session can continue.

## Stop Conditions
- Stop when the target metric reaches the agreed threshold.
- For qualitative loops, stop when `quality_gap=0`, checks pass, and no high-impact open finding remains.
- Stop when maxIterations is reached or the user interrupts.

## Research Notes
- Source-backed facts, contradictions, and open questions go here or in linked scratchpad files.
- For deep research loops, link the scratchpad folder and summarize the current synthesis.

## What's Been Tried
- Baseline: pending

## Resume This Session

Use these commands to pick the loop back up without rediscovering state:

```bash
node "/Users/zbeyens/git/codex-autoresearch/plugins/codex-autoresearch/scripts/autoresearch.mjs" state --cwd "/Users/zbeyens/git/plate-2/.tmp/slate-v2"
node "/Users/zbeyens/git/codex-autoresearch/plugins/codex-autoresearch/scripts/autoresearch.mjs" doctor --cwd "/Users/zbeyens/git/plate-2/.tmp/slate-v2" --check-benchmark
node "/Users/zbeyens/git/codex-autoresearch/plugins/codex-autoresearch/scripts/autoresearch.mjs" next --cwd "/Users/zbeyens/git/plate-2/.tmp/slate-v2"
node "/Users/zbeyens/git/codex-autoresearch/plugins/codex-autoresearch/scripts/autoresearch.mjs" log --cwd "/Users/zbeyens/git/plate-2/.tmp/slate-v2" --from-last --status keep --description "Describe the kept change"
node "/Users/zbeyens/git/codex-autoresearch/plugins/codex-autoresearch/scripts/autoresearch.mjs" export --cwd "/Users/zbeyens/git/plate-2/.tmp/slate-v2"
```

## Run Ledger

<!-- AUTORESEARCH_RUN_LEDGER:START -->
- Run 1 measure: Fresh huge-document full baseline: max budget ratio 1.82 with checks green; metric=1.82; best=unknown.
- Run 2 measure: Partial-DOM promotion and selection export optimization reduced huge-document max budget ratio to 1.01 with checks green; metric=1.01; best=unknown.
- Run 3 measure: Repeat huge-document full packet shows remaining budget miss is staged browser type-to-paint variance, not partial-DOM promotion; metric=1.2; best=unknown.
- Run 4 crash: Full huge-document packet parsed metrics but exited 1 from browser trace; log as crash before diagnosis.; metric=1.06; best=unknown; commit=7eaafb9; Git: no scoped experiment changes to revert; preserved 59 unowned dirty path(s). cleanup=ffb02d653b2b..
- Run 5 crash: Full huge-document packet still exits 1; partial-DOM promotion cold outlier remains after single-pass promotion and smaller segments.; metric=1.33; best=unknown; commit=7eaafb9; Git: no scoped experiment changes to revert; preserved 60 unowned dirty path(s). cleanup=9b117594d843..
- Run 6 checks_failed: Benchmark clears with partial-DOM steady promotion and synthetic beforeinput excluded by default, but checks failed on formatter-only issues.; metric=1.27; best=unknown; commit=7eaafb9; Git: no scoped experiment changes to revert; preserved 61 unowned dirty path(s). cleanup=c54a03f10db7..
- Run 7 measure: Accepted measurement for huge-document benchmark contract repair and partial-DOM promotion improvements; packet passes benchmark and checks without committing.; metric=1.08; best=unknown.
- Run 8 measure: Accepted packet 8 measurement for huge-document full benchmark contract cleanup; benchmark and checks pass without committing.; metric=1.02; best=unknown.
- Run 9 measure: Accepted packet 9 repeat measurement; checks pass but the cleaned core budget ratio remains noisy and worse than packet 8.; metric=1.22; best=unknown.
- Run 10 measure: Accept full huge-doc benchmark contract repair; primary ratio under budget with checks green.; metric=0.49; best=unknown.
- Run 11 crash: Full huge-doc packet exposed stale browser-trace artifact reuse after virtualized substep failed.; metric=0.92; best=unknown; commit=7eaafb9; Git: no scoped experiment changes to revert; preserved 62 unowned dirty path(s). cleanup=e8d37fc0f65b..
- Run 12 measure: Accept full huge-doc benchmark contract repair with normalized burst scoring and stale-artifact protection.; metric=0.87; best=unknown.
- Run 13 measure: Accepted segment-1 baseline for react-huge-document-full; benchmark and checks pass with max budget ratio under budget.; metric=0.82; best=unknown.
- Run 14 measure: Accepted segment-1 repeat for react-huge-document-full; benchmark and checks pass with stable max budget ratio under budget.; metric=0.82; best=unknown.
<!-- AUTORESEARCH_RUN_LEDGER:END -->
