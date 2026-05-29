# slate v2 legacy evidence lane

Objective:
Add the first real editor comparison lane to
`/Users/zbeyens/git/plate-2/benchmarks/editor` for `.tmp/slate-v2` versus
`../slate` only. Completion means Evidence Kit benchmark results contain
normalized Slate v2 and legacy Slate rows from the Slate v2 legacy-compare
artifact, other editor runtimes stay deferred, docs/search expose the lane,
root/editor verification passes, and this autogoal plan passes its closure
check.

Goal plan:
docs/plans/2026-05-27-slate-v2-legacy-evidence-lane.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- `autogoal`: durable completion gates and final closure check.
- `major-task`: benchmark comparison, tradeoffs, and evidence record.
- `task`: direct repo implementation and verification.

Major source:
- type: local benchmark artifact plus Evidence Kit package source
- id / link:
  `.tmp/slate-v2/tmp/slate-react-huge-document-legacy-compare-benchmark-compare-v2DefaultRenderAuto-v2DomPresent-blocks-5000-iters-5-ops-10-split-selection-no-profile.json`
- title: Slate React huge document legacy compare
- decision to make: first comparison lane is Slate v2 versus legacy Slate only
- decision criteria: exact `.tmp/slate-v2` and `../slate` repos, structured
  Evidence Kit rows, visible mixed results, no ProseMirror/Lexical/Tiptap
  runtime claims
- likely files / surfaces:
  `benchmarks/editor/src/index.mjs`,
  `benchmarks/editor/benchmarks/slate-v2-legacy-benchmark.mjs`,
  `benchmarks/editor/benchmarks/results/slate-v2-legacy-latest.json`,
  `benchmarks/editor/docs/perf/*`, `benchmarks/editor/iterations/*`
- browser surface: static Evidence Kit docs at
  `benchmarks/editor/docs/perf/index.html`
- highest-leverage owner: editor benchmark evidence lab

Major lane:
- lane: editor benchmark evidence
- output type: implementation plus generated benchmark/docs artifacts
- implementation expected: yes
- affected packages / surfaces: `benchmarks/editor` standalone npm package and
  root `bench:editor:*` command surface through existing scripts
- dominant risk: treating one huge-document artifact as a blanket editor verdict

Completion threshold:
- Fresh local Slate benchmark run records `currentRepo` as
  `/Users/zbeyens/git/plate-2/.tmp/slate-v2` and `legacyRepo` as
  `/Users/zbeyens/git/slate`.
- Evidence Kit writes
  `benchmarks/editor/benchmarks/results/slate-v2-legacy-latest.json` with
  normalized rows for both `slate-v2:*` and `legacy-slate:*`.
- The result contains 52 rows: 13 common millisecond metrics across
  `legacy-slate:chunk-off`, `legacy-slate:chunk-on`,
  `slate-v2:default-render-auto`, and `slate-v2:dom-present`.
- ProseMirror, Lexical, Plate, and Tiptap runtime adapters remain deferred; no
  placeholder runtime rows are emitted for them.
- Root/editor verification passes, perf docs/search expose the lane, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-slate-v2-legacy-evidence-lane.md`
  passes.

Verification surface:
- Fresh benchmark command in `/Users/zbeyens/git/plate-2/.tmp/slate-v2`:
  `REACT_HUGE_COMPARE_LEGACY_REPO=../../../slate REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 REACT_HUGE_COMPARE_SPLIT_SELECTION=1 REACT_HUGE_COMPARE_DISPOSE_DELAY_MS=0 REACT_HUGE_COMPARE_SURFACES=v2DefaultRenderAuto,v2DomPresent bun run bench:react:huge-document:legacy-compare:local`
- Evidence Kit command in `/Users/zbeyens/git/plate-2`:
  `npm run bench:editor:check`
- Search command in `/Users/zbeyens/git/plate-2`:
  `npm run bench:editor:search -- slate-v2 legacy`
- Formatting command in `/Users/zbeyens/git/plate-2`:
  `pnpm exec biome check package.json benchmarks/editor docs/plans/2026-05-27-slate-v2-legacy-evidence-lane.md --fix`

Constraints:
- Start from local repo evidence before external claims.
- Keep the first comparison narrow: `.tmp/slate-v2` versus `../slate`.
- Preserve unsupported, slow, and uncomfortable rows instead of reducing the
  result to a winner.
- Do not restore the deleted benchmark app/template lab.
- Do not commit or open a PR.

Boundaries:
- Source of truth: the refreshed Slate v2 legacy-compare JSON artifact and the
  Evidence Kit benchmark-result schema.
- Allowed edit scope: `benchmarks/editor/**`, root/package benchmark script
  wiring already present, and this goal plan.
- External sources: not used; local benchmark artifact and local Evidence Kit
  package code settle the implementation.
- Browser surface: static perf docs were regenerated; Browser plugin reload was
  unavailable in this turn, so proof is file/search based.
- Tracker sync: not applicable; no external issue or PR requested.
- Non-goals: ProseMirror, Lexical, Plate, Tiptap adapters; cross-editor browser
  interaction fixtures; broad editor verdicts.

Blocked condition:
- Autonomous work would stop only if the Slate v2 legacy-compare script could
  not produce an artifact for `.tmp/slate-v2` versus `../slate`, or if Evidence
  Kit rejected the normalized benchmark rows. Neither blocker occurred.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready-for-closure

Current verdict:
- verdict: lane implemented
- confidence: high for Evidence Kit integration, medium for performance
  interpretation
- next owner: benchmark maintainer
- reason: the lane is exact and searchable, but one 5,000-block workload is not
  a global editor-performance answer

Completion rule:
- Every checklist item is closed.
- Every gate has evidence.
- This file plus the active autogoal are the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `major-task` loaded | yes | Skill instructions read before implementation. |
| Active goal checked or created | yes | Active goal created for Slate v2 legacy Evidence Kit lane. |
| Source of truth read before analysis | yes | Read Evidence Kit source and Slate v2 legacy-compare artifact/script. |
| Major lane selected | yes | Lane selected: editor benchmark evidence. |
| Decision criteria stated | yes | Criteria listed in Major source and Completion threshold. |
| Existing repo patterns / prior decisions checked | yes | Reused existing Evidence Kit rows, fuzzer, docs, scope, and package scripts. |
| Helper stack selected | yes | Used local Node scripts plus Evidence Kit CLI; no new framework. |
| External research decision recorded | yes | External research not used because local artifacts settle this lane. |
| Implementation expectation recorded | yes | Implementation expected and completed in `benchmarks/editor`. |
| Workspace authority selected | yes | Authority is `/Users/zbeyens/git/plate-2` plus `.tmp/slate-v2` benchmark artifact source. |
| Branch / PR expectation decided | yes | No commit or PR requested. |

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
      the question, or not-applicable reason is recorded.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [x] Facts, inference, and recommendation are separated.
- [x] Review or pressure lenses are selected and completed, or marked
      not-applicable with reason.
- [x] If implementation happens, touched-surface packs cover docs, browser,
      package/API, or agent-native surfaces as needed.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run benchmark, Evidence Kit check, search, and formatting | Fresh Slate benchmark passed; `npm run bench:editor:check` passed; search returns Slate lane rows; Biome passed. |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | Current owner is `benchmarks/editor`; artifact source is `.tmp/slate-v2`; legacy source is `../slate`. |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Satisfied for Slate v2 vs legacy; narrowed other editors to deferred. |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Chose artifact normalizer over new app; rejected cross-editor adapters for this first lane. |
| Review / pressure pass | yes | Run selected reviewer/lens or record reason | Manual pressure pass: result is mixed and cannot be sold as a blanket Slate v2 win. |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | Exact artifact rerun fixed stale embedded `currentRepo` concern. |
| External-source audit | no | Cite official/local clone/external sources when used, or record reason | No external sources used; local artifact and package source are authoritative. |
| Implementation gates | yes | If code changed, close primary-template and touched-surface gates | Parser, script, fuzzer, corpus, docs, generated results, and iteration note completed. |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | See Final handoff contract section. |
| Final lint | yes | Run scoped equivalent when files changed | `pnpm exec biome check package.json benchmarks/editor docs/plans/2026-05-27-slate-v2-legacy-evidence-lane.md --fix` passed. |
| Goal plan complete | yes | Run autogoal closure script | Closure script runs after this plan update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read plan, Evidence Kit source shape, Slate artifact/script, package scripts | Current-state map |
| Current-state map | complete | Existing lab had readiness rows only; no real editor runtime rows | Options |
| Options and recommendation | complete | Chose source-artifact normalizer and dedicated result file | Review |
| Review / pressure pass | complete | Mixed-result caveat recorded; no blanket win claim | Implementation |
| Implementation or plan artifact | complete | Added parser, benchmark writer, fuzzer/corpus coverage, docs note | Verification |
| Verification | complete | Benchmark, root check, search, and Biome passed | Closeout |
| Closeout | complete | Plan updated for autogoal closure | Final response |

Findings:
- Evidence Kit indexes every `benchmarks/results/*latest.json`, so a dedicated
  `slate-v2-legacy-latest.json` is enough for docs/search without changing the
  core benchmark result.
- The refreshed artifact is exact to the requested repos:
  `currentRepo=/Users/zbeyens/git/plate-2/.tmp/slate-v2` and
  `legacyRepo=/Users/zbeyens/git/slate`.
- Rows are mixed: `readyMs` strongly favors Slate v2, while `selectAllMs`
  strongly favors legacy chunking.

Decisions and tradeoffs:
- Chosen: normalize the existing Slate v2 browser benchmark artifact into
  Evidence Kit rows.
- Rejected: recreate the old benchmark app lab. That adds UI surface without
  improving the first evidence claim.
- Rejected for this pass: ProseMirror, Lexical, Plate, and Tiptap adapters.
  They need their own source-backed fixture work.
- Recommendation: treat this as a reliable lane for one huge-document workload,
  not as a broad editor shootout.

Implementation notes:
- `benchmarks/editor/src/index.mjs` exports Slate legacy compare artifact
  helpers and normalizes common millisecond metrics into Evidence Kit rows.
- `benchmarks/editor/benchmarks/slate-v2-legacy-benchmark.mjs` writes and
  checks `benchmarks/results/slate-v2-legacy-latest.json`.
- `benchmarks/editor/package.json` wires the new benchmark into
  `bench:evidence` and `check`.
- `benchmarks/editor/test/fuzz/core-fuzz.mjs` and
  `benchmarks/editor/test/fixtures/corpus.json` cover row normalization.
- `benchmarks/editor/README.md` and
  `benchmarks/editor/iterations/001-slate-v2-legacy-evidence.md` document the
  lane and its caveat.

Review fixes:
- Fixed the artifact exactness issue by rerunning the Slate v2 benchmark from
  `.tmp/slate-v2` with `REACT_HUGE_COMPARE_LEGACY_REPO=../../../slate`.
- Kept V2-only metrics out of the first comparison so each fixture has both
  Slate v2 and legacy rows.
- Kept other editor runtimes deferred; no fake unsupported rows were added for
  them.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Browser plugin reload unavailable after tool discovery | 1 | Use regenerated docs/search artifacts as proof | Static docs and search proof passed; no browser-only behavior changed. |

Verification evidence:
- In `/Users/zbeyens/git/plate-2/.tmp/slate-v2`, fresh benchmark command
  passed and wrote the 5,000-block compare artifact with exact repo paths.
- In `/Users/zbeyens/git/plate-2/benchmarks/editor`, `npm run bench:evidence`
  passed and wrote 52 Slate compare rows.
- In `/Users/zbeyens/git/plate-2`, `npm run bench:editor:check` passed. npm
  printed config warnings for pnpm-oriented settings; warnings only.
- In `/Users/zbeyens/git/plate-2`, `npm run bench:editor:search -- slate-v2 legacy`
  returned `slate-react-huge-document-legacy-compare` benchmark fixtures from
  `benchmarks/results/slate-v2-legacy-latest.json`.
- In `/Users/zbeyens/git/plate-2`, scoped Biome check with `--fix` passed.

Final handoff contract:
- Recommendation: use this as the first Evidence Kit comparison lane and defer
  other editor runtimes until each has its own source-backed fixture.
- Confidence: high for integration; medium for benchmark interpretation.
- Evidence: 52 rows, 13 fixtures, 4 surfaces, exact `.tmp/slate-v2` and
  `../slate` repo paths.
- Tests / commands: fresh Slate benchmark, `npm run bench:editor:check`,
  `npm run bench:editor:search -- slate-v2 legacy`, scoped Biome.
- Browser proof: static docs regenerated; Browser plugin reload unavailable in
  this turn.
- PR / tracker: none requested.
- Caveats: local machine benchmark noise; one huge-document workload; mixed
  result where Slate v2 wins readiness/full-document rows and legacy chunking
  wins some selection rows.
- Next owner: benchmark maintainer.

Timeline:
- 2026-05-27T18:43:52.543Z Major-task goal plan created.
- 2026-05-27T18:52:00Z Fresh `.tmp/slate-v2` versus `../slate` benchmark
  artifact created.
- 2026-05-27T18:53:45Z Root editor Evidence Kit check passed.
- 2026-05-27T18:54:00Z Perf docs/search and formatting proof completed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response after autogoal closure |
| What is the goal? | First real Evidence Kit editor comparison lane: `.tmp/slate-v2` versus `../slate` |
| What have I learned? | The lane is meaningful but mixed: Slate v2 wins readiness/full-document rows; legacy chunking wins some selection rows |
| What have I done? | Implemented parser, benchmark writer, tests, generated result/docs, and verification |

Open risks:
- Local benchmark noise remains; repeat runs can move absolute numbers.
- This is a huge-document Slate-only lane, not a general editor ranking.
- Browser plugin reload was unavailable, so visualization proof is regenerated
  docs/search rather than an in-app browser screenshot.
