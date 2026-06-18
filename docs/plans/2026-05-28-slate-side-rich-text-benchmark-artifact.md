# slate-side-rich-text-benchmark-artifact

Objective:
Add a real Slate-side artifact to the rich-text benchmark for a previously
Slate-v2-only detailed table. The chosen layer is the huge-document Chromium
browser trace because Slate has the same route surface and the result can be
measured directly instead of represented as an adapter gap.

Goal plan:
docs/plans/2026-05-28-slate-side-rich-text-benchmark-artifact.md

Completion threshold:
The goal is complete when a local Slate browser trace artifact is generated from
`/Users/zbeyens/git/slate/site/out/examples/huge-document`, ingested into
`benchmarks/editor`, rendered in `rich-text.html` as aligned Slate v2 and Slate
columns, verified by package checks, verified through the served data route, and
this plan passes the autogoal completion check.

Verification surface:
- Slate artifact generator:
  `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/browser/react/huge-document-slate-browser-trace.mjs`
- Generated Slate artifact:
  `/Users/zbeyens/git/plate-2/tmp/slate-react-huge-document-slate-browser-trace-benchmark-surfaces-legacyChunkOn-legacyChunkOff-blocks-5000-iters-3-ops-10.json`
- Evidence Kit ingestion:
  `/Users/zbeyens/git/plate-2/benchmarks/editor/src/index.mjs`
- Viewer data:
  `/Users/zbeyens/git/plate-2/benchmarks/editor/docs/perf/rich-text-data.json`
- Served route:
  `http://127.0.0.1:8765/rich-text.html`

Constraints:
- This step adds one real Slate artifact first; it does not pretend every
  Slate-v2-only category has a legacy equivalent.
- The measured route is legacy Slate huge-document browser behavior, not a
  synthetic placeholder row.
- Browser trace rows compare equivalent operation/metric fixtures across
  surface columns.
- The Slate site was served from existing `site/out`; the generator can rebuild
  it with `SLATE_LEGACY_BROWSER_TRACE_BUILD=1`.

Boundaries:
- Source of truth: `Plate repo root` benchmark scripts and
  `/Users/zbeyens/git/slate/site/examples/ts/huge-document.tsx`.
- Allowed edit scope: `Plate repo root` benchmark script/package script,
  `benchmarks/editor` ingestion/viewer/generated data, and this plan.
- External sources: N/A; local Slate and Slate v2 checkouts are enough.
- Browser surface: legacy Slate static huge-document route served to Playwright,
  plus `rich-text.html` served on port `8765`.
- Tracker sync: N/A; no issue or PR requested.
- Non-goals: Slate artifacts for v2-only collaboration, transaction-kernel,
  ref-projection, and internal store categories.

Blocked condition:
Work would stop only if legacy Slate could not serve the huge-document route,
Playwright could not select/type into the legacy editor, or Evidence Kit could
not normalize the resulting trace rows. All three paths worked.

Major source:
- type: local benchmark/browser artifact implementation
- id / link: `Plate repo root` plus `/Users/zbeyens/git/slate`
- title: Slate-side huge-document browser trace artifact
- decision to make: which hidden-Slate detailed table deserves the first real
  Slate artifact
- decision criteria: comparable legacy route exists, Playwright can measure it,
  table rows align by operation/metric, package check stays green, served viewer
  exposes Slate columns

Major lane:
- lane: benchmark/performance
- output type: generated browser trace artifact plus Evidence Kit rows
- implementation expected: yes
- affected packages / surfaces: `Plate repo root` benchmark tooling and
  `benchmarks/editor`
- dominant risk: adding a column without comparable row alignment

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read current v2-only tables, Slate huge-document route, and existing browser trace harness. | Artifact implementation |
| Current-state map | complete | Identified `slate-react-huge-document-browser-trace` as comparable and high value. | Generator |
| Options and recommendation | complete | Chose real Slate browser trace over fake missing rows or v2-only internal artifacts. | Ingestion |
| Review / pressure pass | complete | Corrected first ingestion so rows align by operation, not by surface-specific fixture names. | Verification |
| Implementation or plan artifact | complete | Added generator, package script, Evidence Kit spec, browser-trace normalizer, and generated docs/data. | Closeout |
| Verification | complete | Benchmark artifact, package check, docs check, and served data proof all passed. | Final response |
| Closeout | complete | This plan records evidence and passes `check-complete`. | Done |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `major-task` loaded | yes | Used because this is benchmark comparison work. |
| Active goal checked or created | yes | Active autogoal created for the Slate-side artifact objective. |
| Source of truth read before analysis | yes | Read Slate and Slate v2 huge-document routes and benchmark ingestion code. |
| Major lane selected | yes | Benchmark/performance lane selected. |
| Decision criteria stated | yes | Completion threshold names artifact, ingestion, row alignment, checks, and served proof. |
| Existing repo patterns / prior decisions checked | yes | Reused `Plate repo root` benchmark scripts and `benchmarks/editor` Evidence Kit ingestion. |
| Helper stack selected | yes | Used local script, Playwright, Evidence Kit, and static HTTP proof only. |
| External research decision recorded | yes | N/A because local clone behavior settled the task. |
| Implementation expectation recorded | yes | Implementation expected and completed. |
| Workspace authority selected | yes | `plate-2` owns benchmark harness; `Plate repo root` owns benchmark script; `/Users/zbeyens/git/slate` owns legacy route. |
| Branch / PR expectation decided | yes | No commit, push, or PR requested. |
| Browser pack selected | yes | Browser trace generation and served viewer proof required browser coverage. |
| Browser route / app surface identified | yes | Legacy Slate `/examples/huge-document` plus `http://127.0.0.1:8765/rich-text.html`. |
| Browser tool decision recorded | yes | Browser MCP was not exposed; Playwright generated the benchmark artifact and curl verified the served static viewer. |
| Console/network caveat policy recorded | yes | Artifact route success, completed DOM surface counts, and served JSON proof were recorded; separate console audit was not needed for static viewer data. |

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
- [x] Facts, inference, and recommendation are separated.
- [x] Review or pressure lenses are selected and completed, or marked N/A with
      reason.
- [x] If implementation happens, touched-surface packs cover docs, browser,
      package/API, or agent-native surfaces as needed.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: browser proof uses the repo-approved browser tool or records a blocker/waiver.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot, trace, or exact verification caveat is ready for final handoff.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Generate Slate artifact, ingest it, regenerate viewer, and prove served data | Slate artifact generated; served data has 904 rows and aligned browser trace table. |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | Read Slate route, v2 browser trace, Evidence Kit specs, and viewer grouping. |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Comparable route, artifact rows, aligned cells, package check, and served proof all satisfied. |
| Options / tradeoffs / rejection record | yes | Record viable options and chosen recommendation | Chose browser trace first; rejected fake cells and v2-only internal categories for this step. |
| Review / pressure pass | yes | Validate the table is meaningful | Changed normalization from surface-in-fixture to surface-as-library so every row has all comparison cells. |
| Review findings closure | yes | Fix accepted finding and record proof | Aligned table proof showed 26 fully aligned browser-trace rows. |
| External-source audit | no | Cite official/local clone/external sources when used, or record N/A | N/A: local clone source and measured browser artifact were enough. |
| Implementation gates | yes | Close primary-template and browser gates | Generator, ingestion, docs, full package check, and served proof completed. |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Final handoff below records the artifact and remaining non-goals. |
| Final lint | yes | Run scoped equivalent when files changed | Biome checks passed for touched `Plate repo root` and `benchmarks/editor` files. |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-slate-side-rich-text-benchmark-artifact.md` | Completion check passed after this update. |
| Browser interaction proof | yes | Exercise the target route/interaction with approved browser tool or record blocker | Playwright typed into legacy Slate huge-document route and produced timing rows. |
| Browser console/network check | no | Record console/network state or why it is not applicable | N/A: static viewer proof is JSON/HTTP; benchmark route proof is the generated trace artifact. |
| Browser final proof artifact | yes | Record screenshot/trace/route proof or exact caveat | Artifact JSON plus served `rich-text-data.json` smoke proof recorded. |

Findings:
- `slate-react-huge-document-browser-trace` was the right first missing Slate
  artifact because legacy Slate exposes the same huge-document editor route.
- A single `slate:browser-trace` library column was weaker than needed because
  it produced surface-specific fixtures. Surface-as-library normalization gives
  directly aligned operation/metric rows.
- Collaboration, transaction execution, ref projection, and editor-store rows
  remain intentionally v2-only until a real Slate-equivalent workload is
  defined.

Decisions and tradeoffs:
- Chosen: add Slate huge-document browser trace for `legacyChunkOn` and
  `legacyChunkOff`.
- Rejected: fill detailed tables with synthetic `adapter-missing` rows. That
  would improve cosmetics and make the benchmark less honest.
- Rejected for this slice: implement Slate equivalents for v2-only internal
  runtime categories. Those need separate workload design.
- Tradeoff: the generator uses existing `site/out` by default to avoid rewriting
  the sibling Slate checkout; set `SLATE_LEGACY_BROWSER_TRACE_BUILD=1` when a
  fresh legacy site build is required.

Implementation notes:
- Added `bench:react:huge-document:slate-browser-trace:local` in
  `Plate repo root/package.json`.
- Added `huge-document-slate-browser-trace.mjs` to serve legacy Slate static
  output, select DOM text nodes, type through Playwright, and summarize DOM,
  heap, long task, selection, and typing timing metrics.
- Added `browser-trace` artifact normalization to `benchmarks/editor/src/index.mjs`.
- Normalized browser trace surfaces as library columns:
  `slate-v2:default-render-auto`, `slate-v2:dom-present`,
  `slate:chunk-on`, and `slate:chunk-off`.

Review fixes:
- Fixed initial non-aligned browser trace rows by moving surface identity from
  fixture path to library label.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Browser-side helper was stringified inside `page.evaluate` and broke syntax | 1 | Inline the helper inside the browser function | `node --check` and Biome passed. |
| First ingestion shape produced a Slate column without shared fixtures | 1 | Normalize surfaces as libraries and metrics as shared fixtures | Served data proved 26 fully aligned rows. |

Verification evidence:
- `node --check benchmarks/slate-v2/donor/browser/react/huge-document-slate-browser-trace.mjs`
  passed.
- `cd Plate repo root && bunx biome check package.json scripts/benchmarks/browser/react/huge-document-slate-browser-trace.mjs --fix`
  passed.
- `cd Plate repo root && bun run bench:react:huge-document:slate-browser-trace:local`
  passed.
- Slate artifact evidence: `legacyChunkOn` and `legacyChunkOff` completed 3
  measured iterations each, observed 5,000 blocks, and had 0 native-surface
  timeouts.
- `cd benchmarks/editor && npx biome check src/index.mjs benchmarks/render-rich-text-viewer.mjs --fix`
  passed.
- `cd benchmarks/editor && npm run bench:rich-text:check` generated 904 rows.
- Browser trace category evidence: 104 rows, 26 table fixtures, four libraries:
  `slate-v2:default-render-auto`, `slate-v2:dom-present`,
  `slate:chunk-on`, `slate:chunk-off`.
- `cd benchmarks/editor && npm run check` passed.
- `curl -I --max-time 2 http://127.0.0.1:8765/rich-text.html` returned HTTP
  200.
- Served JSON smoke proof returned `rowCount: 904`,
  `browserTraceRows: 104`, `browserTraceTableRows: 26`,
  `fullyAlignedRows: 26`, `workloadSlateStatus: ok`, and status counts
  `{ adapter-missing: 54, coverage-gap: 130, ok: 716,
  optional-missing-artifact: 2, over-budget: 2 }`.

Final handoff contract:
- Recommendation: use browser-trace as the pattern for future Slate artifacts:
  real measured artifact first, surface-as-library normalization second.
- Confidence: high for huge-document browser trace coverage.
- Evidence: artifact generation, row counts, aligned served table rows, and
  full package check.
- Tests / commands: listed in verification evidence.
- Browser proof: Playwright artifact plus served `rich-text.html`/JSON proof.
- PR / tracker: N/A.
- Caveats: static legacy Slate `site/out` was used; rebuild with
  `SLATE_LEGACY_BROWSER_TRACE_BUILD=1` for a fresh Slate site artifact.
- Next owner: add Slate artifacts only where a real equivalent workload exists.

Timeline:
- 2026-05-28: Created major-task autogoal plan.
- 2026-05-28: Added and ran Slate huge-document browser trace artifact.
- 2026-05-28: Regenerated Evidence Kit rich-text benchmark and static viewer.
- 2026-05-28: Verified package checks and served route data.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Complete. |
| Where am I going? | Final handoff. |
| What is the goal? | Add the first real Slate-side artifact for a v2-only rich-text detailed benchmark table. |
| What have I learned? | Browser trace is comparable; some other v2-only lanes are not comparable without new workload design. |
| What have I done? | Generated and ingested Slate huge-document browser trace rows with aligned Slate v2/Slate columns. |

Open risks:
The new artifact is real browser evidence, but it is limited to the legacy Slate
static site output that already existed locally. For publication-grade numbers,
rerun with `SLATE_LEGACY_BROWSER_TRACE_BUILD=1` and treat machine/browser
variance like any other performance benchmark.
