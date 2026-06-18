# rich text editor evidence benchmark

Objective:
Build a comprehensive Evidence Kit benchmark lane for rich-text editors in
`benchmarks/editor`, expanding the first Slate v2 vs legacy row into an
artifact-backed benchmark matrix with explicit adapter gaps for Plate,
ProseMirror, Lexical, and Tiptap.

Goal plan:
docs/plans/2026-05-27-rich-text-editor-evidence-benchmark.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- browser (docs/plans/templates/packs/browser.md)

Major source:
- type: user request
- id / link: chat
- title: comprehensive rich-text editor benchmark
- decision to make: what Evidence Kit result owns rich-text editor benchmark
  claims, and which editor/runtime lanes are measured vs still adapter gaps
- decision criteria: current Slate v2 artifact families are imported; all local
  editor targets appear in coverage rows; non-measured editor comparisons are
  visible as gaps; Evidence Kit checks and perf docs pass

Major lane:
- lane: benchmark / performance
- output type: code, benchmark result JSON, evidence notes, generated perf docs
- implementation expected: yes
- affected packages / surfaces: `benchmarks/editor/**`, Evidence Kit docs/perf,
  this goal plan
- dominant risk: fake cross-editor numbers or duplicated Slate-only proof being
  mistaken for ProseMirror/Lexical/Plate/Tiptap runtime comparison

Completion threshold:
- `benchmarks/results/rich-text-editors-latest.json` exists and has at least
  250 rows, at least 180 measured `ok` rows, all six local editor target roots,
  visible adapter-gap rows for non-Slate editors, and no missing required Slate
  v2 artifacts.
- The result imports every available Slate v2 artifact family named by the
  current Slate v2 benchmark docs or records an explicit missing optional row.
- README / iteration / source-map docs name the result file, measured families,
  adapter gaps, and verification command.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-rich-text-editor-evidence-benchmark.md`
  passes.

Verification surface:
- `npm run bench:rich-text:check`
- `npm run bench:evidence`
- `npm run docs:perf && npm run docs:perf:check`
- `npm run docs:perf:search -- rich text editor slate-v2 lexical prosemirror`
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-rich-text-editor-evidence-benchmark.md`

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Do not execute implementation unless this major goal explicitly includes it.

Boundaries:
- Source of truth: current `benchmarks/editor`, `Plate repo root` benchmark
  artifacts, and local sibling editor source roots.
- Allowed edit scope: Evidence Kit benchmark package, evidence notes, generated
  perf docs, and this plan.
- External sources: local clones only; no web lookup required.
- Browser surface: static Evidence Kit perf page at
  `http://127.0.0.1:8765/index.html`.
- Tracker sync: none.
- Non-goals: inventing ProseMirror/Lexical/Tiptap/Plate runtime numbers,
  restoring the deleted browser app benchmark lab, or running long browser
  integration sweeps.

Blocked condition:
- Block only if required Slate v2 artifacts are absent, Evidence Kit cannot
  parse the result rows, or the approved browser surface cannot be verified
  after generated docs are rebuilt.

Major state:
- task_type: major
- task_complexity: major
- current_phase: implementation
- current_phase_status: in_progress
- next_phase: verification
- goal_status: active

Current verdict:
- verdict: implementation in progress
- confidence: medium
- next owner: major-task
- reason: imported Slate v2 artifacts are available locally; non-Slate editor
  adapters remain explicit gaps

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-rich-text-editor-evidence-benchmark.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `major-task` loaded | yes | `/Users/zbeyens/git/plate-2/.agents/skills/major-task/SKILL.md` |
| Active goal checked or created | yes | `create_goal` active objective |
| Source of truth read before analysis | yes | `benchmarks/editor/**`, docs/slate-v2 summaries, `Plate repo root` artifacts |
| Major lane selected | yes | benchmark / performance |
| Decision criteria stated | yes | completion threshold above |
| Existing repo patterns / prior decisions checked | yes | existing Evidence Kit scripts, result rows, iteration notes, source map |
| Helper stack selected | yes | autogoal, major-task, Evidence Kit benchmark/perf docs guidance, docs-creator |
| External research decision recorded | yes | local clones only; no web research |
| Implementation expectation recorded | yes | benchmark importer + docs + generated perf docs |
| Workspace authority selected | yes | cwd `/Users/zbeyens/git/plate-2/benchmarks/editor` for Evidence Kit checks |
| Branch / PR expectation decided | yes | no PR requested |
| Docs pack selected | yes | plan created with docs pack |
| `docs-creator` loaded | yes | `/Users/zbeyens/git/plate-2/.agents/skills/docs-creator/SKILL.md` |
| Docs lane selected | yes | benchmark README/iteration/source-map reference docs |
| Target docs and nearest sibling docs read | yes | `README.md`, `iterations/001-slate-v2-legacy-evidence.md`, `research/evidence-source-map.md` |
| Docs style doctrine read | yes | docs-creator relevant sections read |
| Documented source owner identified | yes | `benchmarks/results/rich-text-editors-latest.json` |
| Browser pack selected | yes | plan created with browser pack |
| Browser route / app surface identified | yes | `http://127.0.0.1:8765/index.html` |
| Browser tool decision recorded | yes | `tool_search` did not expose Browser/browser-use; used curl proof against the live static route |
| Console/network caveat policy recorded | yes | static HTML route only; console/network inspection waived because Browser tool was unavailable |

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
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: browser proof uses the repo-approved browser tool or records a blocker/waiver.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot, trace, or exact verification caveat is ready for final handoff.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the repo audit, benchmark, review, prototype, or artifact check named in this plan | `npm run check` passed in `benchmarks/editor`; rich result has 530 rows, 479 ok, 47 adapter-missing, no missing required artifacts |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | `README.md`, `src/index.mjs`, `Plate repo root` artifact inventory, local editor source roots |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Criteria satisfied for Slate v2 imported artifacts; explicitly narrowed for non-Slate runtime adapters as adapter gaps |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Decisions and tradeoffs section records import-and-gap matrix vs fake cross-editor numbers |
| Review / pressure pass | yes | Run selected reviewer/lens or record N/A with reason | Benchmark Guardian pressure applied: bad/unsupported/over-budget rows remain visible; no fake aggregate winner |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | First `npm run check` found pack budget drift; fixed by raising private lab dry-run pack budget to 800 KB |
| External-source audit | yes | Cite official/local clone/external sources when used, or record N/A | Local clones only: Plate, Slate v2, legacy Slate, ProseMirror, Lexical, Tiptap source roots recorded in result rows |
| Implementation gates | yes | If code changed, close primary-template and touched-surface gates; otherwise N/A | `npm run check` and `pnpm exec biome check ... --fix` passed |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Final handoff contract section completed below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent when files changed | `pnpm exec biome check benchmarks/editor/src/index.mjs benchmarks/editor/benchmarks/rich-text-editors-benchmark.mjs benchmarks/editor/package.json --fix` passed |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-rich-text-editor-evidence-benchmark.md` | pass |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | `docs:perf:search` and result JSON summaries verify result file, row counts, source roots, and adapter gaps |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | README paths point to generated local result files; perf page served at `http://127.0.0.1:8765/index.html` |
| Docs MDX/content parser | N/A | Run `pnpm --filter www build:contentlayer` for MDX/content changes, or record N/A | no app MDX/content changed; Evidence Kit docs checked with `npm run docs:perf:check` |
| Plugin page specifics | N/A | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | no plugin page changed |
| Browser interaction proof | yes | Exercise the target route/interaction with the approved browser tool or record blocker | Browser tool unavailable from `tool_search`; curl route proof shows 589 rows and rich-text fixtures in served HTML |
| Browser console/network check | N/A | Record console/network state or why it is not applicable | static Evidence Kit page; Browser console unavailable this turn |
| Browser final proof artifact | yes | Record screenshot/trace/route proof or exact caveat | exact caveat: curl proof only, no Browser screenshot because tool was not exposed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | read Evidence Kit package, Slate v2 docs/artifacts, local editor target roots | current-state map |
| Current-state map | complete | first lane had 59 docs rows; new artifact sources available under `Plate repo root` | options |
| Options and recommendation | complete | choose import-and-gap matrix over fake cross-editor numbers | review |
| Review / pressure pass | complete | kept adapter gaps and over-budget rows visible; rejected fake cross-editor numbers | implementation decision |
| Implementation or plan artifact | complete | `rich-text-editors-benchmark.mjs`, `rich-text-editors-latest.json`, docs edits, generated perf docs | verification |
| Verification | complete | `npm run check`, Biome check, docs perf check, curl route proof | closeout |
| Closeout | complete | final handoff contract below | final response |

Findings:
- Current Evidence Kit docs had 59 rows / 20 fixtures before the broad import.
- `Plate repo root` already had required artifacts for React, core, clipboard,
  collab, history, and issue #6038 lanes.
- Plate, legacy Slate, ProseMirror, Lexical, and Tiptap source roots exist
  locally.
- Non-Slate editors do not yet have equivalent runtime adapters in this lab.

Decisions and tradeoffs:
- Chosen: import all existing Slate v2 artifact families and add coverage rows
  for all rich-text editor targets.
- Rejected: fake ProseMirror/Lexical/Tiptap/Plate runtime numbers from source
  presence alone.
- Accepted caveat: optional Slate v2 transaction/current-memory artifacts can be
  visible as optional missing rows until those scripts emit local JSON.

Implementation notes:
- Added `createRichTextEditorBenchmarkRows`, Slate v2 artifact specs, workload
  coverage rows, and generic metric-stat normalization.
- Added `benchmarks/rich-text-editors-benchmark.mjs`.
- Added `bench:rich-text:check` and included it in `bench:evidence` / `check`.
- Added `iterations/002-rich-text-editor-evidence-matrix.md`.

Review fixes:
- Raised private Evidence Kit package dry-run pack budget from 350 KB to 800 KB
  after the comprehensive result made `npm pack --dry-run` 572 KB.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `npm run check` failed on `npm-pack` over old 350 KB pack budget | 1 | Treat comprehensive evidence JSON as intentional package output, not noise | Raised pack budget to 800 KB and reran `npm run check` successfully |

Verification evidence:
- `npm run bench:rich-text:check` in `benchmarks/editor`: pass, wrote 530 rows.
- `npm run bench:evidence` in `benchmarks/editor`: pass.
- `npm run docs:perf && npm run docs:perf:check` in `benchmarks/editor`: pass.
- `npm run docs:perf:search -- rich text editor slate-v2 lexical prosemirror`
  in `benchmarks/editor`: rich-text matrix and workload rows found.
- `npm run check` in `benchmarks/editor`: pass.
- `pnpm exec biome check benchmarks/editor/src/index.mjs benchmarks/editor/benchmarks/rich-text-editors-benchmark.mjs benchmarks/editor/package.json --fix`
  in repo root: pass, no fixes.
- `curl -sSf http://127.0.0.1:8765/index.html | rg -n "Benchmark rows|Rich Text Editor|rich-text-editor"`:
  pass, served page reports 589 benchmark rows and rich-text workload fixtures.

Final handoff contract:
- Recommendation: use `benchmarks/results/rich-text-editors-latest.json` as the
  current rich-text benchmark authority.
- Confidence: high for Slate v2 artifact import coverage; low for non-Slate
  runtime comparison until adapters exist.
- Evidence: 530 rich-text rows, 589 total perf-doc benchmark rows, six local
  source roots, 47 visible adapter-gap rows.
- Tests / commands: see Verification evidence.
- Browser proof: curl proof against live static route; Browser tool unavailable.
- PR / tracker: none requested.
- Caveats: ProseMirror, Lexical, Plate, and Tiptap are source-backed targets,
  not measured runtime peers yet.
- Next owner: implement one non-Slate runtime adapter at a time, starting with
  ProseMirror or Lexical.

Timeline:
- 2026-05-27T20:52:29.725Z Major-task goal plan created.
- 2026-05-27T20:59:36Z Added rich-text editor benchmark importer, generated
  `benchmarks/results/rich-text-editors-latest.json`, and recorded first pass:
  530 rows, 479 ok, 47 adapter-missing, 2 over-budget, 2 optional-missing.
- 2026-05-27T21:03:00Z Full Evidence Kit check passed; autogoal completion
  check passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Verification |
| Where am I going? | Verification, docs perf generation, closeout |
| What is the goal? | Comprehensive rich-text editor Evidence Kit benchmark matrix |
| What have I learned? | See Findings |
| What have I done? | See Timeline / Implementation notes |

Open risks:
- Browser plugin may not be exposed in this turn; if so, use curl/static output
  proof and record the limitation.
- The current result is comprehensive for Slate v2 imported artifacts, not a
  finished runtime-vs-runtime comparison for ProseMirror, Lexical, Plate, or
  Tiptap.
