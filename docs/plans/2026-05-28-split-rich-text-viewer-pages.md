# split-rich-text-viewer-pages

Objective:
Split the generated Evidence Kit rich-text viewer into two pages: a comparison
page for apples-to-apples editor rows and a Plite internals page for
diagnostic rows that should not pretend to compare against other editors.

Goal plan:
docs/plans/2026-05-28-split-rich-text-viewer-pages.md

Completion threshold:
The split is complete when `benchmarks/render-rich-text-viewer.mjs` emits
`rich-text.html` / `rich-text-data.json` for comparison rows and
`plite-internals.html` / `plite-internals-data.json` for v2-only rows,
generated checks pass, `npm run check` passes in `benchmarks/editor`, both
served HTML routes return HTTP 200, served JSON proves there are no internal
category leaks on the comparison page, and this plan passes the autogoal
completion check.

Verification surface:
- Generator: `/Users/zbeyens/git/plate-2/benchmarks/editor/benchmarks/render-rich-text-viewer.mjs`
- Comparison output: `/Users/zbeyens/git/plate-2/benchmarks/editor/docs/perf/rich-text.html`
- Comparison data: `/Users/zbeyens/git/plate-2/benchmarks/editor/docs/perf/rich-text-data.json`
- Internals output: `/Users/zbeyens/git/plate-2/benchmarks/editor/docs/perf/plite-internals.html`
- Internals data: `/Users/zbeyens/git/plate-2/benchmarks/editor/docs/perf/plite-internals-data.json`
- Served routes: `http://127.0.0.1:8765/rich-text.html` and
  `http://127.0.0.1:8765/plite-internals.html`

Constraints:
- Keep the intentionally ugly js-framework-benchmark-style table.
- Do not hide missing adapters on the comparison page.
- Move only categories that are truly Plite internal proof rows.
- Keep one generator command so `docs:perf` and `docs:perf:check` stay simple.

Boundaries:
- Source of truth: current Evidence Kit result
  `benchmarks/results/rich-text-editors-latest.json`.
- Allowed edit scope: viewer generator, generated perf docs/data, and this plan.
- External sources: N/A; local generated benchmark data settles the split.
- Browser surface: static generated pages served from `docs/perf` on port 8765.
- Tracker sync: N/A; no issue or PR requested.
- Non-goals: adding new benchmark artifacts, changing the visual design, or
  renaming underlying benchmark categories.

Blocked condition:
Work would stop only if generated rows could not be deterministically split,
the generator could not check both page/data pairs, or the static server could
not serve both routes. None of those happened.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Source map | complete | Identified 16 Plite-only internal categories and comparison workload fixtures. |
| Generator split | complete | `render-rich-text-viewer.mjs` now emits comparison and internals page/data pairs. |
| Generated docs | complete | `docs:rich-text` wrote all four generated files. |
| Package verification | complete | `npm run check` passed in `benchmarks/editor`. |
| Served proof | complete | Both HTML routes returned HTTP 200 and both JSON routes had expected row/category counts. |
| Closure | complete | This file records evidence and passes `check-complete`. |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Active goal checked or created | yes | Autogoal created for the viewer split. |
| Source of truth read before edits | yes | Read current viewer generator, package scripts, and generated benchmark data shape. |
| Edit scope selected | yes | Only viewer generator, generated docs/data, and this plan changed for this task. |
| Browser route selected | yes | `rich-text.html` and `plite-internals.html` under the existing static server. |
| Browser tool decision recorded | yes | Browser MCP was not exposed; HTTP served-route proof used against the same local target. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Source data shape is mapped before editing.
- [x] Comparison rows and Plite internals rows have explicit filters.
- [x] Generator emits both HTML and data JSON files in normal and check modes.
- [x] Generated docs are refreshed.
- [x] Package checks are green.
- [x] Served-route proof covers both pages and both data files.
- [x] Browser caveat is recorded.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Comparison page generated | yes | Generate `rich-text.html` and `rich-text-data.json` | Comparison JSON has 542 rows, 11 groups, and zero internal category leaks. |
| Internals page generated | yes | Generate `plite-internals.html` and `plite-internals-data.json` | Internals JSON has 326 rows, 16 groups, and all expected internal categories. |
| Docs check | yes | Run generated docs check | `npm run docs:rich-text:check` checked both page/data pairs. |
| Package check | yes | Run package gate | `npm run check` passed in `benchmarks/editor`. |
| Served HTML proof | yes | Hit both served HTML routes | Both returned HTTP 200. |
| Served JSON proof | yes | Hit both served data routes | JSON smoke proof returned expected split counts. |
| Goal plan complete | yes | Run autogoal completion check | `check-complete` passed. |

Verification evidence:
- `cd benchmarks/editor && npm run docs:rich-text` wrote
  `rich-text.html`, `rich-text-data.json`, `plite-internals.html`, and
  `plite-internals-data.json`.
- Local generated-data proof: comparison page has 542 rows, 11 groups, and no
  internal category leaks.
- Local generated-data proof: internals page has 326 rows, 16 groups, and all
  expected internal categories.
- `cd benchmarks/editor && npm run docs:rich-text:check` passed and checked both
  page/data pairs.
- `cd benchmarks/editor && npm run check` passed.
- Served proof: `curl -I --max-time 2 http://127.0.0.1:8765/rich-text.html`
  returned HTTP 200.
- Served proof:
  `curl -I --max-time 2 http://127.0.0.1:8765/plite-internals.html`
  returned HTTP 200.
- Served JSON proof: comparison data returned 542 rows, 11 groups, and
  `internalLeaks: []`.
- Served JSON proof: internals data returned 326 rows, 16 groups, and
  `missingExpectedInternalCategories: []`.

Reboot status:
Complete. `rich-text.html` is the comparison page; `plite-internals.html` is
the v2-only proof page. Both are generated by `npm run docs:rich-text`.

Open risks:
The category split is manually curated in the generator. If new Plite-only
categories are added later, they must be added to the internal category set or
they will appear on the comparison page.
