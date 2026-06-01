# History compare AR perf

Objective:
Run and repair `history-compare` under Slate AR until target-backed evidence is
green, plateaued, or blocked by correctness/architecture proof.

Completion threshold:
- Done when `history-compare` emits a benchmark-native primary `METRIC` line and
  one of these is true: two correctness-green repeat packets are at or below
  `history_compare_worst_p95_ratio <= 2.0`, two correctness-green packets
  plateau under 5% improvement, or a remaining optimization is blocked by
  concrete correctness or architecture evidence.

Verification surface:
- Target setup: `pnpm bench:targets:check`,
  `pnpm bench:targets:dry-run -- history-compare`, and target report refresh.
- Benchmark: `HISTORY_BENCH_LEGACY_REPO=../../../slate bun run
  bench:history:compare:local` in `.tmp/slate-v2`.
- Correctness: `.tmp/slate-v2` `bun check` for evidence used to close the lane.

Constraints:
- Keep scope to the history compare target, benchmark script, target registry,
  AR session files, and generated target reports unless the benchmark exposes a
  real runtime owner.
- Do not commit, push, or open a PR unless explicitly requested.
- Prefer benchmark-native truth over wrapped wall-clock timing.

Boundaries:
- Source of truth: `benchmarks/targets/slate-v2.json` target `history-compare`
  and `.tmp/slate-v2/scripts/benchmarks/core/compare/history.mjs`.
- Browser surface: none; this is a Bun/jsdom-free history benchmark.
- Release artifact: `slate-history` patch changeset because runtime history
  replay behavior changed.

Blocked condition:
- Block only if the legacy repo cannot run, `.tmp/slate-v2` correctness fails
  from an unrelated owner that cannot be isolated, or further improvement needs
  a public history API/runtime architecture decision.

Work Checklist:
- [x] Inspect target registry and history benchmark script before edits.
- [x] Upgrade or verify native metric output.
- [x] Run target dry-run/check/report path.
- [x] Run benchmark evidence and correctness proof.
- [x] Record release, browser, PR, tracker, and review decisions.
- [x] Run the mechanical autogoal completion check.

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | complete | target registry and history benchmark read | implementation done |
| Implementation | complete | native metrics, stable iteration count, and history replay optimization added | verification done |
| Verification | complete | AR runs 11 and 12 under `2.0`, checks green | closeout done |
| Closeout | complete | plan updated and mechanical check passed | final response |

Findings:
- The target was still using wrapped `benchmark_seconds`; that was not a useful
  history comparison metric.
- Initial native metric runs were red: default `2.63x`, 15-iteration `3.1x`,
  worst on typing undo.
- Generic transaction replay was cloning each historic operation and historic
  replay did not explicitly skip normalization like legacy Slate does.
- Adjacent text history operations can be compacted during undo/redo replay
  without changing the final document value.

Decisions and tradeoffs:
- Chose `history_compare_worst_p95_ratio` as the primary metric and kept mean
  ratio/delta as secondary evidence.
- Set the benchmark default to 15 iterations because 3-sample p95 is bullshit
  for sub-ms undo/redo lanes.
- Added a `slate-history` patch changeset because this is package runtime
  behavior, not just benchmark plumbing.
- No PR, commit, or tracker sync: not requested.
- Browser proof is N/A: this is a core/history benchmark and Bun test surface.

Verification evidence:
- `node --check .tmp/slate-v2/scripts/benchmarks/core/compare/history.mjs`
  passed.
- `pnpm bench:targets:check` passed.
- `pnpm bench:targets:dry-run -- history-compare` passed with
  `metric=history_compare_worst_p95_ratio`.
- `pnpm bench:targets:report` regenerated target history/report files.
- AR parser lint accepted the native `history_compare_worst_p95_ratio` metric.
- Targeted history tests passed:
  `cd packages/slate-history && bun test ./test/history-contract.ts ./test/integrity-contract.ts ./test/document-state-history-contract.ts`
  with `51 pass`, `0 fail`.
- Heavy guard run with `HISTORY_BENCH_TYPE_OPS=200` measured
  `history_compare_worst_p95_ratio=1.61`.
- AR run 11 measured `history_compare_worst_p95_ratio=1.9`,
  `history_compare_worst_mean_ratio=0.57`; benchmark exited 0 and
  `bun check` passed.
- AR run 12 measured `history_compare_worst_p95_ratio=0.38`,
  `history_compare_worst_mean_ratio=0.37`; benchmark exited 0 and
  `bun check` passed.
- Final `bash ./autoresearch.checks.sh` passed in `.tmp/slate-v2`: lint had one
  non-blocking React Hook warning in `site/examples/ts/pagination.tsx`, typecheck
  passed, Bun tests `1172 pass`, `95 skip`, `0 fail`, slate-layout `41 pass`,
  slate-react Vitest `56 files`, `590 tests passed`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Make `history-compare` truthful and decide whether it needs optimization |
| What have I learned? | The red lane was real history replay overhead, then later p95 noise after the fix |
| What have I done? | Upgraded the metric contract, optimized historic replay, added a changeset, and proved two green AR packets |

Open risks:
- Low: the p95 metric can still show GC spikes in fragment lanes, but both
  repeat packets stayed under target and mean ratios are now faster than legacy.
- Known non-blocking warning: `site/examples/ts/pagination.tsx` hook dependency
  warning appears in `bun check` but exits 0.
