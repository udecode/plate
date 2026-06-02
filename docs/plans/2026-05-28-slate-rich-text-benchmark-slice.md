# Slate Rich Text Benchmark Slice

Objective:
Implement the next Slate v2 vs Slate rich-text benchmark slice by renaming the
visible Slate baseline from `legacy-slate` to `slate`, adding a generated
headless Slate-v2-vs-Slate transform/navigation comparison artifact, ingesting it
into `benchmarks/editor` Evidence Kit rows, refreshing `rich-text.html`, and
verifying the served artifact.

Goal plan:
docs/plans/2026-05-28-slate-rich-text-benchmark-slice.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Major source:
- type: local repo source and generated benchmark artifact
- id / link: `.tmp/slate-v2` + `benchmarks/editor`
- title: Slate v2 vs Slate rich-text operations benchmark slice
- decision to make: which benchmark slice is useful enough to add now before
  ProseMirror/Lexical/Plate/Tiptap adapters.
- decision criteria: the slice compares both repos from one command, covers
  common editing and navigation primitives, emits Evidence Kit rows, renders in
  `rich-text.html`, and keeps the old baseline visible as `slate`.

Major lane:
- lane: benchmark implementation
- output type: runnable benchmark script, JSON artifact, Evidence Kit rows, HTML
  viewer data
- implementation expected: yes
- affected packages / surfaces: `.tmp/slate-v2/scripts/benchmarks`,
  `.tmp/slate-v2/package.json`, `benchmarks/editor/src`,
  `benchmarks/editor/benchmarks`, generated `benchmarks/editor/docs/perf`
- dominant risk: noisy or asymmetric Slate API coverage producing fake
  comparability.

Completion threshold:
- The new `bench:core:rich-text-operations:compare:local` command writes
  `.tmp/slate-v2/tmp/slate-rich-text-operations-compare-benchmark.json`.
- `benchmarks/editor` ingests that artifact under
  `slate-core-rich-text-operations-compare`.
- Generated rich-text data has `slate` labels and no `legacy-slate` labels.
- The local served route `http://127.0.0.1:8765/rich-text.html` returns 200 and
  serves JSON with the new category.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-slate-rich-text-benchmark-slice.md`
  passes.

Verification surface:
- `.tmp/slate-v2` benchmark command and artifact.
- `benchmarks/editor` package check, generated Evidence Kit result, generated
  ugly HTML table, served JSON smoke.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Do not widen to ProseMirror, Lexical, Plate, or Tiptap adapters in this slice.

Boundaries:
- Source of truth: `.tmp/slate-v2` benchmark/test corpus and
  `benchmarks/editor` Evidence Kit ingestion.
- Allowed edit scope: benchmark scripts, benchmark package metadata, Evidence
  Kit ingestion/tests/generated docs/research artifacts.
- External sources: not applicable; local repos and generated artifacts settle
  this slice.
- Browser surface: `http://127.0.0.1:8765/rich-text.html`.
- Tracker sync: not applicable.
- Non-goals: cross-editor runtime adapters, browser interaction replay, merge
  transform parity diagnosis.

Blocked condition:
- None remaining. If the served static server disappears, restart the existing
  `plate-editor-evidence` tmux static server and rerun the curl smoke.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready-to-close

Current verdict:
- verdict: implemented
- confidence: high for this slice, medium for broad editor-performance claims
- next owner: benchmark consumer
- reason: the artifact is real and ingested, but it is still a headless Slate
  core slice, not a full editor verdict.

Completion rule:
- `update_goal(status: complete)` is legal after the completion checker passes.
- Hook state is not used for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `major-task` loaded | yes | Used for benchmark architecture/execution lane |
| Active goal checked or created | yes | Active goal created for this benchmark slice |
| Source of truth read before analysis | yes | Read `.tmp/slate-v2` compare/current benchmark scripts and `benchmarks/editor/src/index.mjs` |
| Major lane selected | yes | Benchmark implementation |
| Decision criteria stated | yes | Completion threshold above |
| Existing repo patterns / prior decisions checked | yes | Reused `repo-compare.mjs`, `stats.mjs`, compare artifact schema, and Evidence Kit normalizers |
| Helper stack selected | yes | Existing compare harness plus Evidence Kit renderer |
| External research decision recorded | yes | N/A: local repos and generated artifacts were enough |
| Implementation expectation recorded | yes | Implementation expected and completed |
| Workspace authority selected | yes | `.tmp/slate-v2` owns benchmark command; `benchmarks/editor` owns ingestion/docs |
| Branch / PR expectation decided | yes | N/A: no PR requested |
| Browser pack selected | yes | Static route smoke selected |
| Browser route / app surface identified | yes | `http://127.0.0.1:8765/rich-text.html` |
| Browser tool decision recorded | yes | Browser tool not exposed by tool search; used served HTTP/JSON smoke |
| Console/network caveat policy recorded | yes | Static curl/JSON proof only; no console inspection available |

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
| Named verification threshold | yes | Run benchmark and ingestion/docs checks | Commands listed in Verification evidence |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | Findings and source reads recorded here |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Completion threshold satisfied |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Decisions and tradeoffs below |
| Review / pressure pass | yes | Run self-review against noisy benchmark risk | Merge lane removed; labels and generated artifacts checked |
| Review findings closure | yes | Fix accepted findings and record closure proof | Updated fuzz contract, research source, generated docs/scope |
| External-source audit | no | N/A | Local repos and artifacts were sufficient |
| Implementation gates | yes | Close source, generated docs, and package-script gates | `npm run check` and benchmark command passed |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Final handoff contract below |
| Final lint | yes | Run scoped formatter/lint equivalents | `bunx biome check ... --fix`; `npx biome check ... --fix`; `npm run check` |
| Goal plan complete | yes | Run completion checker | Recorded after this edit |
| Browser interaction proof | partial | Exercise route or record tool waiver | Browser tool unavailable; HTTP 200 + JSON parse proof recorded |
| Browser console/network check | no | Record why not applicable | No browser console tool exposed; static route network smoke passed |
| Browser final proof artifact | yes | Record route proof or exact caveat | curl HTTP 200 and served JSON category/label proof |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read existing compare/current benchmark patterns | current-state map |
| Current-state map | complete | Identified Evidence Kit normalizers and visible label points | implementation |
| Options and recommendation | complete | Chose headless Slate-v2-vs-Slate core slice first | verification |
| Review / pressure pass | complete | Removed unstable merge lane and stale labels | closeout |
| Implementation or plan artifact | complete | Added compare script, package script, ingestion, regenerated docs | verification |
| Verification | complete | Commands below passed | closeout |
| Closeout | complete | This file records final state | final response |

Findings:
- Existing Slate v2 benchmarks already cover v2-only transforms, selection,
  clipboard, collab, history, React rendering, overlays, and browser traces.
- The missing useful first slice was a direct Slate v2 vs Slate headless
  rich-text operations compare, not another v2-only artifact.
- The old visible baseline name `legacy-slate` leaked through source, fuzz
  contracts, generated docs, and research source metadata.
- The first comparable slice now covers 15 lanes: collapsed insert text,
  marked-text Backspace, expanded range delete, mixed fragment insert, batched
  insert nodes, selected block setNodes, move nodes, split blocks, remove
  nodes, wrap/unwrap, full-document character positions, text-node scan,
  before/after walk, unhangRange, and selectAll.

Decisions and tradeoffs:
- Chosen: reuse the existing `.tmp/slate-v2` compare harness so the artifact has
  the same `current`, `legacy`, `deltaMeanMs`, and stats shape as existing
  Evidence Kit ingestion.
- Rejected: a separate ad hoc benchmark format. It would make the table harder
  to compare and would duplicate parser code.
- Chosen: keep the old artifact category names that include `legacy` where they
  are file/lane history, but rename visible library ids to `slate`.
- Rejected: include merge in this slice. The v2 runner repeatedly hit a
  `mergeNodes`/positions failure inside the compare fixture. Treating that as a
  performance number would be fake evidence.

Facts:
- The new artifact has 15 metric lanes and writes to
  `.tmp/slate-v2/tmp/slate-rich-text-operations-compare-benchmark.json`.
- `rich-text-data.json` reports 30 rows for
  `slate-core-rich-text-operations-compare`: 15 Slate v2 rows and 15 Slate
  baseline rows.
- Generated `rich-text-data.json` has `slate`, `slate:baseline`,
  `slate:chunk-on`, and `slate:chunk-off`; it has no `legacy-slate` labels.

Inference:
- The benchmark is meaningful as a headless core pressure slice. It is not a
  comprehensive browser editor verdict.
- Slate v2 currently looks better on full-document character positions but worse
  on several transform/navigation lanes in this run, especially before/after
  walking and block move/remove.

Recommendation:
- Use this as the baseline Slate-v2-vs-Slate table row set.
- Next benchmark layer should be browser editing/navigation replay from
  `.tmp/slate-v2/playwright/integration/examples` before widening to
  ProseMirror/Lexical/Plate/Tiptap.

Implementation notes:
- Added `.tmp/slate-v2/scripts/benchmarks/core/compare/rich-text-operations.mjs`.
- Added `.tmp/slate-v2` package script
  `bench:core:rich-text-operations:compare:local`.
- Added `slate-core-rich-text-operations-compare` artifact ingestion.
- Added `core-rich-text-operations-compare` workload coverage row.
- Renamed visible baseline ids from `legacy-slate` to `slate`.
- Renamed source-pass research package snapshot from
  `legacy-slate-package.json` to `slate-package.json`.

Review fixes:
- Fixed benchmark default Slate repo path for `.tmp/slate-v2` layout by falling
  back from `../slate` to `../../../slate`.
- Moved nested-list blocks off point-based anchor paths.
- Changed expanded delete to a plain paragraph fixture because rich/nested
  cross-block delete internally hit merge behavior.
- Switched text scan from `Editor.nodes` to `NodeApi.nodes` to match existing
  compare-harness API shape.
- Updated fuzz contract and corpus tags for `slate`.
- Regenerated docs, results, research manifest, and benchmark scope.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Default `../slate` resolved to `.tmp/slate` | 1 | Add repo-layout fallback | Fixed |
| Rich fixture used nested list at text point `[0,0]` | 1 | Move list pattern off point anchors | Fixed |
| Repeated merge lane hit v2 positions failure | 3 | Remove merge from this compare slice | Resolved by exclusion and caveat |
| `Editor.nodes` unavailable in compare import shape | 1 | Use `NodeApi.nodes` fallback | Fixed |
| Fuzz expected `legacy-slate` labels | 1 | Update contract to `slate` | Fixed |

Verification evidence:
- `cwd=.tmp/slate-v2`: `node --check scripts/benchmarks/core/compare/rich-text-operations.mjs` passed.
- `cwd=.tmp/slate-v2`: `bunx biome check package.json scripts/benchmarks/core/compare/rich-text-operations.mjs --fix` passed.
- `cwd=.tmp/slate-v2`: `bun run bench:core:rich-text-operations:compare:local` passed and wrote the artifact.
- `cwd=benchmarks/editor`: `npx biome check src/index.mjs benchmarks/render-rich-text-viewer.mjs --fix` passed.
- `cwd=benchmarks/editor`: `npm run research:editor-frameworks:fetch` passed.
- `cwd=benchmarks/editor`: `npm run check` passed.
- `cwd=plate-2`: `rg -n "legacy-slate|Legacy Slate" benchmarks/editor` returned no matches.
- `cwd=plate-2`: local data check reported `richOps=30` and workload coverage
  rows `66`.
- `cwd=plate-2`: served JSON check returned `richOps=30`, no
  `legacyLabels`, and Slate labels `slate`, `slate:baseline`,
  `slate:chunk-on`, `slate:chunk-off`.
- `cwd=plate-2`: `curl -I --max-time 2 http://127.0.0.1:8765/rich-text.html`
  returned `HTTP/1.0 200 OK`.

Final handoff contract:
- Recommendation: Treat this as the first comprehensive Slate-v2-vs-Slate core
  slice, then add browser replay before cross-editor adapters.
- Confidence: high for implementation and ingestion; medium for benchmark
  interpretation.
- Evidence: 15-lane compare artifact, 30 generated rows, passed package check,
  served route smoke.
- Tests / commands: see Verification evidence.
- Browser proof: Browser MCP was not exposed after tool search; static route
  and JSON proof passed over HTTP.
- PR / tracker: N/A, not requested.
- Caveats: no merge lane; no browser replay; no ProseMirror/Lexical/Plate/Tiptap
  runtime adapters in this slice.
- Next owner: benchmark author.

Timeline:
- 2026-05-28T14:35:45.744Z Major-task goal plan created.
- 2026-05-28T14:49Z Rich-text operations compare script added.
- 2026-05-28T14:51Z Benchmark artifact generated successfully.
- 2026-05-28T14:55Z Evidence Kit docs/results/check regenerated and passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Add Slate-v2-vs-Slate rich-text operations benchmark slice |
| What have I learned? | Headless v2 vs Slate comparison is useful but merge/browser replay still need separate lanes |
| What have I done? | Implemented benchmark, ingestion, visualization, rename, generated artifacts, verification |

Open risks:
- Merge transform parity needs its own bug/benchmark lane.
- Browser editing/navigation replay is still the next real comprehensiveness gap.
