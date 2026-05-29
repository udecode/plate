# slate browser rich text replay benchmark

Objective:
Add a browser-level rich-text replay coverage layer to the `benchmarks/editor`
Evidence Kit benchmark so Slate v2 and Slate are compared against the same
Chromium Playwright richtext, tables, inlines, and paste-html replay inventory.

Goal plan:
docs/plans/2026-05-28-slate-browser-rich-text-replay-benchmark.md

Completion threshold:
The benchmark is complete when `.tmp/slate-v2` can generate a row artifact from
the Slate v2 and Slate Playwright browser test corpus, `benchmarks/editor`
ingests it into the rich-text Evidence Kit result, `rich-text.html` exposes the
new rows without the old `legacy-slate` label, package checks pass, the served
route returns the regenerated data, and this plan passes the autogoal completion
check.

Verification surface:
- Generator: `/Users/zbeyens/git/plate-2/.tmp/slate-v2/scripts/benchmarks/browser/rich-text-replay-coverage.mjs`
- Generated artifact: `/Users/zbeyens/git/plate-2/.tmp/slate-v2/tmp/slate-browser-rich-text-replay-coverage-benchmark.json`
- Evidence Kit ingestion: `/Users/zbeyens/git/plate-2/benchmarks/editor/src/index.mjs`
- Viewer generation: `/Users/zbeyens/git/plate-2/benchmarks/editor/benchmarks/render-rich-text-viewer.mjs`
- Served page: `http://127.0.0.1:8765/rich-text.html`
- Served data: `http://127.0.0.1:8765/rich-text-data.json`

Constraints:
- Scope stays Slate v2 vs Slate for this layer.
- The artifact records browser replay coverage and suite presence, not browser
  action timing.
- Evidence comes from listed Chromium Playwright tests in local checkouts, not
  stale docs or manual fixture counts.
- The existing Evidence Kit row contract stays the integration point.

Boundaries:
- Source of truth: `.tmp/slate-v2/playwright/integration/examples` and
  `/Users/zbeyens/git/slate/playwright/integration/examples`.
- Allowed edit scope: `.tmp/slate-v2` benchmark scripts/package script,
  `benchmarks/editor` ingestion, viewer generation, generated benchmark data,
  generated perf docs, and this plan.
- External sources: N/A; local editor test corpora settle this step.
- Browser surface: generated static `rich-text.html` and `rich-text-data.json`
  served on port `8765`.
- Tracker sync: N/A; no issue or PR requested.
- Non-goals: ProseMirror, Lexical, Plate, and Tiptap runtime adapters; measured
  browser replay timing; full Playwright execution of every listed replay row.

Blocked condition:
Autonomous work would stop only if either local checkout could not list its
Chromium Playwright tests, the Evidence Kit result could not ingest normalized
rows, or the served route could not expose the regenerated data. None of those
conditions occurred.

Major source:
- type: local benchmark and browser test corpus
- id / link: `.tmp/slate-v2` plus `/Users/zbeyens/git/slate`
- title: Slate v2 vs Slate browser rich-text replay coverage
- decision to make: whether the rich-text benchmark covers real browser editing
  scenarios beyond synthetic/core rows
- decision criteria: shared row artifact, Slate v2 and Slate labels, coverage
  gaps explicit, generated viewer data present, check commands green

Major lane:
- lane: benchmark implementation
- output type: Evidence Kit rows plus static viewer data
- implementation expected: yes
- affected packages / surfaces: `.tmp/slate-v2` benchmark script and
  `benchmarks/editor`
- dominant risk: mistaking coverage inventory for measured runtime speed

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Intake | complete | Existing Evidence Kit benchmark and Slate v2 browser test files inspected. |
| Artifact design | complete | Row artifact emits `slate-v2:browser-replay` and `slate:browser-replay` coverage rows. |
| Implementation | complete | Generator, package script, Evidence Kit ingestion, and viewer status mapping added. |
| Verification | complete | Generator, rich-text check, docs generation, docs check, package check, and served route smoke proof completed. |
| Closure | complete | This plan records evidence and passes `check-complete`. |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `major-task` loaded | yes | Used for heavyweight benchmark comparison work. |
| Active goal checked or created | yes | Active autogoal created for the replay coverage benchmark objective. |
| Source of truth read before analysis | yes | Read Slate v2 and Slate Playwright example test corpus before shaping rows. |
| Major lane selected | yes | Benchmark implementation lane selected. |
| Decision criteria stated | yes | Completion threshold lists artifact, ingestion, viewer, check, and served-route criteria. |
| Existing repo patterns / prior decisions checked | yes | Reused `benchmarks/editor` Evidence Kit rows and generated perf docs flow. |
| Helper stack selected | yes | Local generator script plus Evidence Kit ingestion; no external research helper needed. |
| External research decision recorded | yes | N/A because local repo evidence was authoritative. |
| Implementation expectation recorded | yes | Implementation expected and completed. |
| Workspace authority selected | yes | `plate-2` controls benchmark harness; `.tmp/slate-v2` controls generator artifact. |
| Branch / PR expectation decided | yes | No commit, push, or PR requested. |
| Browser pack selected | yes | Browser route proof used for generated `rich-text.html` and data JSON. |
| Browser route / app surface identified | yes | `http://127.0.0.1:8765/rich-text.html`. |
| Browser tool decision recorded | yes | Browser MCP was not exposed by tool search; HTTP smoke proof used against the same served route. |
| Console/network caveat policy recorded | yes | Static page proof checks HTTP status and generated JSON content. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Major source records source type, id/link, title, decision type, expected
      outcome, decision criteria, likely files/packages/surfaces, browser
      surface, and highest-leverage owner.
- [x] Current state is mapped before proposing a new architecture, migration,
      benchmark, or plan.
- [x] Existing repo patterns, prior decisions, and nearby implementation
      constraints are recorded before external research.
- [x] External docs or source are used only where repo evidence does not settle
      the question, or N/A reason is recorded.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [x] Implementation touched only the benchmark generator, Evidence Kit
      ingestion, viewer generation, generated artifacts, and this plan.
- [x] Verification records commands and served-route output.
- [x] Remaining caveats are recorded without pretending coverage rows are timing
      rows.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Browser replay artifact generated | yes | Artifact has 280 rows: 150 `ok`, 130 `coverage-gap`. |
| Slate v2 and Slate source counts recorded | yes | Generator metadata recorded 134 Slate v2 tests, 8 Slate tests, 136 union fixtures. |
| Evidence Kit result regenerated | yes | `rich-text-editors-latest.json` has 852 rows. |
| Viewer data regenerated | yes | `rich-text-data.json` has replay coverage categories and no `legacy-slate` label. |
| Package checks green | yes | `npm run check` passed in `benchmarks/editor`. |
| Served route proof | yes | `curl -I` returned HTTP 200 for `rich-text.html`; JSON smoke returned row counts below. |
| Autogoal completion check | yes | `check-complete` run after this file update. |

Verification evidence:
- `node --check .tmp/slate-v2/scripts/benchmarks/browser/rich-text-replay-coverage.mjs`
  passed.
- `bunx biome check package.json scripts/benchmarks/browser/rich-text-replay-coverage.mjs --fix`
  passed in `.tmp/slate-v2`.
- `bun run bench:browser:rich-text-replay-coverage:local` generated
  `.tmp/slate-v2/tmp/slate-browser-rich-text-replay-coverage-benchmark.json`.
- Artifact evidence: 280 rows, status counts `{ ok: 150, coverage-gap: 130 }`.
- Source-count evidence: 134 Slate v2 Chromium listed tests, 8 Slate Chromium
  listed tests, 136 union browser replay fixtures.
- `npm run bench:rich-text:check` passed in `benchmarks/editor` and generated
  `benchmarks/results/rich-text-editors-latest.json` with 852 rows.
- `npm run docs:perf` passed.
- `npm run docs:perf:check` passed.
- `npx biome check src/index.mjs benchmarks/render-rich-text-viewer.mjs --fix`
  passed.
- `npm run check` passed in `benchmarks/editor`.
- `curl -I --max-time 2 http://127.0.0.1:8765/rich-text.html` returned HTTP
  200.
- Served JSON smoke proof returned `rowCount: 852`,
  `slate-browser-rich-text-replay-coverage: 272`,
  `slate-browser-rich-text-replay-suite-coverage: 8`, status counts
  `{ adapter-missing: 55, coverage-gap: 130, ok: 663,
  optional-missing-artifact: 2, over-budget: 2 }`, replay libraries
  `slate-v2:browser-replay` and `slate:browser-replay`, and
  `hasLegacySlateName: false`.

Reboot status:
Complete. The next useful layer is measured browser replay timing/trace rows for
a selected shared subset, not more coverage inventory.

Open risks:
The replay artifact is meaningful as coverage and parity inventory only. It
does not prove Slate v2 is faster in those browser scenarios until selected
fixtures are executed with timing, trace, and repeat-count discipline.

Current verdict:
- verdict: complete
- confidence: high
- next owner: benchmark follow-up
- reason: Slate v2 vs Slate now has explicit browser replay coverage in the
  generated Evidence Kit benchmark and ugly table viewer.
