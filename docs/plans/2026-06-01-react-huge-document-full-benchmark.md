# React huge document full benchmark

Objective:
Create one canonical huge-document benchmark target that runs the existing core,
React, browser-trace, virtualized, and overlay owners without duplicating their
measurement logic.

Completion threshold:
Done when `react-huge-document-full` exists in the target registry, emits
`react_huge_doc_full_max_budget_ratio` plus supporting `METRIC` lines, writes a
stable aggregate artifact, and passes target check, target dry-run, script
syntax check, and a benchmark execution.

Verification surface:
- `node --check benchmarks/plite/donor/browser/react/huge-document-full.mjs`
- `pnpm bench:targets:check`
- `pnpm bench:targets:dry-run -- react-huge-document-full`
- `HUGE_DOC_FULL_SMOKE=1 bun run bench:react:huge-document:full:local`

Constraints:
- Keep the existing benchmark owners authoritative.
- Do not move benchmark state into `Plate repo root` permanently; this checkout is
  still the live lab boundary before the future Plate merge.
- Do not commit, push, or open a PR.

Boundaries:
- Source of truth: `benchmarks/plite/donor/**`,
  `Plate repo root/package.json`, `benchmarks/targets/plite.json`, and this
  plan.
- Non-goals: no product runtime optimization, no pagination UI work, no old
  Evidence Kit rewrite.

Blocked condition:
Block only if the existing benchmark owners cannot run even in smoke mode, or if
target dry-run cannot initialize Autoresearch for the new target.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Active goal | yes | Created goal for the full huge-document benchmark target. |
| Source owners read | yes | Read existing core, React legacy compare, browser trace, Plite browser trace, overlay, package script, and target registry surfaces. |
| Commit/PR requested | no | No commit, push, staging, or PR requested. |

Work Checklist:
- [x] Existing huge-document benchmark owners inspected.
- [x] Full wrapper added without duplicating benchmark internals.
- [x] Package script added.
- [x] Target registry entry added.
- [x] Verification commands run and evidence recorded.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Script syntax | yes | `node --check benchmarks/plite/donor/browser/react/huge-document-full.mjs` passed. |
| Target registry | yes | `pnpm bench:targets:check` passed with 27 targets; `pnpm bench:targets:report --check` passed. |
| Target dry-run | yes | `pnpm bench:targets:dry-run -- react-huge-document-full` passed with `autoresearchSetupOk=true`. |
| Benchmark execution | yes | Smoke and full 5k packet passed; full packet emitted `react_huge_doc_full_max_budget_ratio=3.82`, `react_huge_doc_full_failure_count=0`, and `react_huge_doc_full_virtualized_type_to_paint_p95_ms=30`. |
| Product behavior | no | Benchmark tooling only. |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| implementation | complete | Wrapper, script entry, target entry, report artifacts, benchmark execution, and correctness gate are complete. |

Verification evidence:
- `node --check benchmarks/plite/donor/browser/react/huge-document-full.mjs` passed.
- `pnpm bench:targets:check` passed with 27 targets.
- `pnpm bench:targets:report --check` passed after regenerating target report/history.
- `pnpm bench:targets:dry-run -- react-huge-document-full` passed with zero missing required artifacts and `autoresearchSetupOk=true`.
- `HUGE_DOC_FULL_SMOKE=1 HUGE_DOC_FULL_SKIP_BROWSER_BUILD=1 bun run bench:react:huge-document:full:local` passed and wrote the smoke aggregate artifact.
- `HUGE_DOC_FULL_SKIP_BROWSER_BUILD=1 bun run bench:react:huge-document:full:local` passed and wrote the full 5k aggregate artifact with `failureCount=0`, `maxBudgetRatio=3.82`, `legacyCompareWorstP95Ratio=0.69`, `typeToPaintP95Ms=286.7`, and `virtualizedTypeToPaintP95Ms=30`.
- `bun check` passed in `Plate repo root`; lint reported one existing warning in `site/examples/ts/pagination.tsx`.

Reboot status:
The canonical full target is `react-huge-document-full`. Use
`pnpm bench:targets:run react-huge-document-full` for the build-inclusive
target path, or `HUGE_DOC_FULL_SKIP_BROWSER_BUILD=1 bun run
bench:react:huge-document:full:local` in `Plate repo root` when `site/out`
already exists.

Open risks:
The full target can be expensive because the browser trace owner builds the
Next static site. The current full metric is dominated by non-virtualized
browser type-to-paint (`286.7ms`, budget ratio `3.82`), while virtualized
type-to-paint is within budget at `30ms`.
