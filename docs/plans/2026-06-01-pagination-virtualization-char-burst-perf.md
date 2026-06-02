# pagination virtualization char burst perf

Objective:
Optimize Slate pagination virtualization typing; done when char-burst benchmark proves virtualized rows800 within staged tolerance and correctness passes.

Completion threshold:
Rows=800 virtualized pagination passes the source-backed char-burst benchmark with `pagination_virtualized_failed=0`, correct inserted text, bounded DOM/page surfaces, p95 typing <= 16ms, scroll <= 400ms, and app-ready <= 800ms.

Verification surface:
- `.tmp/slate-v2` benchmark: `bun run bench:react:pagination-virtualized-char-burst:local`
- `.tmp/slate-v2` focused browser correctness: pagination rows800 perf, insert-break burst, double-click word selection, and right-margin wrapped-line selection tests
- `.tmp/slate-v2` package/site checks: slate-layout typecheck/tests, slate-react typecheck, site typecheck
- root benchmark target checks: `pnpm bench:targets:check`, `pnpm bench:targets:dry-run -- react-pagination-virtualized-char-burst`, `pnpm slate:ar:benchmark-lint`

Constraints:
- Preserve native text editing, selection, double-click word selection, margin click placement, and insert-break routing while improving pagination virtualization.
- Keep the package ownership boundary in `slate-layout` / `slate-react`; keep example code as a consumer proof, not a second layout engine.
- Do not create PRs or pushes for this task.

Boundaries:
- Source of truth: `.tmp/slate-v2` packages and pagination example, with root benchmark target wiring in `benchmarks/targets/slate-v2.json`.
- Allowed edit scope: pagination virtualization package code, focused pagination example code, benchmark target/script, and this goal plan.
- Browser surface: `/examples/pagination?page_layout=single&rows=800&strategy=virtualized`.
- Tracker sync: N/A, no issue or PR was requested.
- Non-goals: full pagination product redesign, unrelated dirty files, and release packaging.

Blocked condition:
No current blocker. If the benchmark becomes flaky again, block only after a repeatable failing trace shows source-backed correctness or perf cannot be stabilized without a product/API decision.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Used slate-autoresearch and autogoal workflow for a measurable perf target. |
| Active goal checked or created | yes | Active Codex goal: pagination virtualization char-burst perf. |
| Source of truth read before edits | yes | Read pagination example, slate-layout PagedEditable/page mount plan, slate-react virtualizer, and benchmark script. |
| TDD decision before behavior change or bug fix | yes | Existing focused Playwright tests plus a new page-mount-plan unit expectation cover the changed behavior. |
| Branch decision for code-changing task | N/A | User did not request branch/PR work. |
| Browser route / app surface identified | yes | `/examples/pagination?page_layout=single&rows=800&strategy=virtualized`. |
| Output budget strategy recorded | yes | Used focused `sed`, `rg`, scoped tests, and metric artifacts instead of broad output dumps. |

Work Checklist:
- [x] Objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Reproduced the failing source-backed rows800 virtualized benchmark.
- [x] Fixed page virtualization startup by mounting only an initial page window before viewport measurement.
- [x] Scoped page projection and decorations to visible/selected fragments instead of whole-document projection.
- [x] Fixed scroll-selection retention so user scroll is not yanked back to the selected block.
- [x] Fixed page-mode virtualizer retention so selected caret keeps the selected top-level node, not an unrelated whole page.
- [x] Preserved native interaction coverage for double-click word selection, wrapped right-margin selection, and insert-break bursts.
- [x] Recorded accepted Autoresearch evidence for the kept packet.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run benchmark and focused browser proof | `pagination_virtualized_failed=0`, load 561.6ms, scroll 357ms, p95 11.6ms in `pnpm slate:ar:benchmark-lint`; focused Playwright 4 passed. |
| Bug reproduced before fix | yes | Capture failing benchmark symptoms | Earlier source-backed runs failed app-ready >800ms and scroll >400ms; selection-retained scroll also exceeded DOM bounds. |
| Targeted behavior verification | yes | Run package and browser tests | slate-layout tests 41 passed; focused pagination Playwright 4 passed. |
| TypeScript changed | yes | Run touched typechecks | slate-layout typecheck passed, slate-react typecheck passed, site typecheck passed. |
| Package manifests changed | yes | Verify benchmark target wiring | `pnpm bench:targets:check` and dry-run passed. |
| Browser surface changed | yes | Browser proof through Playwright | Focused pagination browser tests passed against the example route. |
| Package behavior or public API changed | no | No changeset for internal/example benchmark work | N/A: no public package API was added. |
| Autoreview for non-trivial implementation changes | no | Defer unless user asks | N/A: user asked for Autoresearch perf loop; focused correctness and benchmark gates passed. |
| Final lint | no | Scoped type/tests used | N/A: no broad lint requested; touched TS typechecks passed. |
| Goal plan complete | yes | Run autogoal complete check | Ready to run after this update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | Relevant package/example/benchmark files read | implementation |
| Implementation | done | Page-windowing, projection scoping, selection-scroll guard, retention fix | verification |
| Verification | done | Benchmark, typechecks, package tests, focused Playwright | closeout |
| PR / tracker sync | N/A | User did not request PR or tracker sync | closeout |
| Closeout | done | Autoresearch keep logged and goal plan updated | final response |

Findings:
- Whole-page retention for a selected caret was the main scroll correctness bug after the perf changes.
- Initial mount paid duplicate layout work: constructor refresh plus mount-effect refresh.

Decisions and tradeoffs:
- Keep page-level virtualization as default for pagination, but do not let selected paths retain whole page content.
- Suppress selection scroll only briefly after user scroll; keyboard typing still scrolls the caret into view.

Implementation notes:
- `PagedEditable` now starts with an initial virtualized page window before the viewport exists.
- `PagedEditable` projects visible/selected fragments for rendering while keeping cheap top-level layout items for virtualizer offsets.
- Pagination example uses rendered fragment bounds and lazy decorations instead of a duplicate full-document projection.

Review fixes:
- N/A.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Benchmark initially measured stale static output | 1 | Run benchmark against `next dev` source by default | Fixed benchmark harness. |
| Source benchmark failed app-ready and scroll gates | 3 | Remove full initial page render, full-doc projection, duplicate refresh, and whole-page selection retention | Fixed; benchmark passes. |

Verification evidence:
- `bun --filter ./packages/slate-layout typecheck && bun --filter ./packages/slate-layout test --timeout 10000`: passed, 41 tests.
- `bun --filter ./packages/slate-react typecheck`: passed.
- `bun typecheck:site`: passed.
- `bun run bench:react:pagination-virtualized-char-burst:local`: passed with load 578.4ms, scroll 352.1ms, p95 8.8ms, failed 0.
- `pnpm slate:ar:benchmark-lint`: passed with load 561.6ms, scroll 357ms, p95 11.6ms, failed 0.
- Focused Playwright pagination tests: 4 passed, covering rows800 perf, insert-break burst, double-click word selection, and wrapped right-margin selection.
- `pnpm bench:targets:check`: passed.
- `pnpm bench:targets:dry-run -- react-pagination-virtualized-char-burst`: passed.

Reboot status:
Current. Continue only if user wants broader full integration or review sweep.

Open risks:
Autoresearch labels the keeps as exploratory until repeat/holdout promotion metadata is added. Full pagination integration was not run in this slice.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A.
- Confidence line: high for focused rows800 pagination virtualization perf and covered native interaction regressions.
