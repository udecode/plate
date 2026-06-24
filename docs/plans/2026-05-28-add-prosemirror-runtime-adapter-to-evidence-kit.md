# Add ProseMirror runtime adapter to Evidence Kit

Objective:
Add the first non-Plite runtime adapter to the Evidence Kit rich-text benchmark
matrix by measuring ProseMirror headless model/state/history operations, wiring
the adapter into the active registry, refreshing generated perf artifacts, and
proving the adapter gap count decreases with real rows.

Goal plan:
docs/plans/2026-05-28-add-prosemirror-runtime-adapter-to-evidence-kit.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- autogoal
- major-task

Major source:
- type: repo benchmark control plane
- id / link: `benchmarks/editor/research/benchmark-registry.json`
- title: Evidence Kit rich-text runtime adapter matrix
- decision to make: which non-Plite adapter should land first and what rows it
  may honestly cover
- decision criteria: source-backed target, headless runtime possible, measured
  rows produced by an active registry artifact, generated docs and health
  refreshed

Major lane:
- lane: editor benchmark infrastructure
- output type: adapter implementation plus generated evidence artifacts
- implementation expected: yes
- affected packages / surfaces: `benchmarks/editor`, generated perf docs, goal
  plan
- dominant risk: claiming adapter coverage beyond what the headless runtime
  actually measures

Completion threshold:
- ProseMirror has a required active registry artifact.
- `npm run bench:adapter:prosemirror` writes at least seven `ok` rows.
- Rich-text workload coverage marks ProseMirror `ok` only for the covered
  headless workload families.
- `npm run evidence:refresh` refreshes docs, health, and rich-text results.
- Adapter-missing rows drop from `54` to `51`; active artifacts rise from `23`
  to `24`; rich-text rows rise from `904` to `911`.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-add-prosemirror-runtime-adapter-to-evidence-kit.md`
  passes.

Verification surface:
- `/Users/zbeyens/git/plate-2/benchmarks/editor`
- `npm run bench:adapter:prosemirror`
- `npm run evidence:refresh`
- `npm run docs:perf:check`
- scoped syntax/lint commands recorded below
- generated `benchmarks/results/benchmark-health-latest.json`
- generated `benchmarks/results/rich-text-editors-latest.json`

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence from source-backed gaps.
- Do not claim browser, React, collab, or product-wrapper parity from a
  headless ProseMirror adapter.

Boundaries:
- Source of truth: `benchmarks/editor/research/benchmark-registry.json`.
- Allowed edit scope: Evidence Kit benchmark package, generated perf artifacts,
  and this goal plan.
- External sources: none used; local `../prosemirror` source root exists.
- Browser surface: static generated docs at `http://127.0.0.1:8765/index.html`.
- Tracker sync: none.
- Non-goals: Lexical, Plate, Tiptap, and ProseMirror DOM adapter work.

Blocked condition:
- Autonomous work would stop only if ProseMirror model/state/history packages
  were unavailable locally or the adapter could not produce stable measured
  rows. The adapter ran successfully.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active until final `update_goal` call

Current verdict:
- verdict: accepted
- confidence: high
- next owner: next adapter task
- reason: ProseMirror now has active measured runtime rows and the matrix still
  exposes honest remaining gaps.

Completion rule:
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and the autogoal
  `check-complete` command passes.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `major-task` loaded | yes | task classified as heavyweight benchmark adapter work |
| Active goal checked or created | yes | active goal created for the adapter threshold |
| Source of truth read before analysis | yes | registry, README, source map, and generated perf output inspected |
| Major lane selected | yes | editor benchmark infrastructure |
| Decision criteria stated | yes | source-backed target, active artifact, measured rows, refreshed docs/health |
| Existing repo patterns / prior decisions checked | yes | prior iterations `002`, `003`, and `004` pattern followed |
| Helper stack selected | yes | local Node script plus Evidence Kit registry |
| External research decision recorded | yes | no web research; local source/dependencies suffice |
| Implementation expectation recorded | yes | implementation required |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2/benchmarks/editor` owns commands |
| Branch / PR expectation decided | yes | no PR requested |

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
- [x] Implementation touched the benchmark package and docs/agent evidence
      surfaces.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run adapter and refresh commands | `npm run bench:adapter:prosemirror`; `npm run evidence:refresh` |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | registry, README, source map, iterations inspected |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | ProseMirror selected for headless runtime coverage only |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | ProseMirror first; Lexical/Plate/Tiptap deferred due larger wrapper/runtime surfaces |
| Review / pressure pass | yes | Validate no overclaiming against workload coverage | browser/React/collab ProseMirror rows remain `adapter-missing` |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | source-map and README updated to stop saying ProseMirror is entirely missing |
| External-source audit | yes | Cite official/local clone/external sources when used, or record N/A | local `../prosemirror` exists; npm ProseMirror packages imported |
| Implementation gates | yes | Close primary-template and touched-surface gates | adapter, registry, package scripts, generated docs/results updated |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | see Final handoff contract |
| Final lint | yes | Run scoped equivalent when files changed | scoped syntax/lint command recorded below |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-add-prosemirror-runtime-adapter-to-evidence-kit.md` | recorded below |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | registry/source-map/README/iterations inspected | current-state map |
| Current-state map | complete | ProseMirror had source target but no measured runtime rows | options |
| Options and recommendation | complete | ProseMirror chosen as headless runtime adapter; Lexical/Plate/Tiptap deferred | review |
| Review / pressure pass | complete | coverage limited to three headless workloads | implementation |
| Implementation or plan artifact | complete | adapter script, registry, package scripts, docs, generated artifacts updated | verification |
| Verification | complete | focused commands recorded below | closeout |
| Closeout | complete | final handoff prepared | final response |

Findings:
- ProseMirror is the right first non-Plite adapter because its headless runtime
  maps cleanly to large document creation, text insertion, selection changes,
  document replacement, fragment insert, and history undo/redo.
- A headless adapter cannot honestly cover DOM/browser/React/collab/product
  workloads. Those remain visible gaps.
- Evidence Kit can model target-specific runtime coverage through registry
  `runtimeAdapters` instead of hard-coding every target in the row generator.

Decisions and tradeoffs:
- Chosen: ProseMirror runtime adapter using `prosemirror-model`,
  `prosemirror-state`, and `prosemirror-history`.
- Deferred: Lexical, because its meaningful editing path is update/command
  oriented and needs a separate adapter shape.
- Deferred: Plate and Tiptap, because product-wrapper adapters should measure
  wrapper overhead instead of pretending to be the same as bare runtime cores.
- Rejected: marking all ProseMirror workload rows `ok`; that would be fake
  coverage.

Implementation notes:
- Added `benchmarks/editor/benchmarks/prosemirror-runtime-adapter.mjs`.
- Added `bench:adapter:prosemirror` and wired it into `bench:evidence`,
  `evidence:refresh`, and `check`.
- Added registry `runtimeAdapters` metadata and required
  `prosemirror-runtime-adapter` artifact.
- Updated coverage calculation so measured target adapters can close specific
  workload rows.
- Refreshed generated perf docs/results.

Review fixes:
- Updated README/source-map wording so ProseMirror is described as partially
  measured, not entirely missing.
- Kept uncovered ProseMirror browser/product workloads as `adapter-missing`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | none | no repeated failure |

Verification evidence:
- `npm install --save-dev prosemirror-model prosemirror-state prosemirror-transform prosemirror-history` from `/Users/zbeyens/git/plate-2/benchmarks/editor`: success.
- `npm run bench:adapter:prosemirror` from `/Users/zbeyens/git/plate-2/benchmarks/editor`: success; wrote `7` rows.
- `node --check benchmarks/prosemirror-runtime-adapter.mjs && node --check src/index.mjs` from `/Users/zbeyens/git/plate-2/benchmarks/editor`: success.
- `npm run evidence:refresh` from `/Users/zbeyens/git/plate-2/benchmarks/editor`: success; generated `911` rich-text rows and health `active=24`.
- `npm run docs:perf:check` from `/Users/zbeyens/git/plate-2/benchmarks/editor`: success; checked index, evidence, rich-text, and internals docs.
- `pnpm exec biome check benchmarks/editor/benchmarks/prosemirror-runtime-adapter.mjs benchmarks/editor/src/index.mjs benchmarks/editor/package.json benchmarks/editor/research/benchmark-registry.json benchmarks/editor/README.md benchmarks/editor/research/evidence-source-map.md benchmarks/editor/iterations/005-prosemirror-runtime-adapter.md docs/plans/2026-05-28-add-prosemirror-runtime-adapter-to-evidence-kit.md --fix` from `/Users/zbeyens/git/plate-2`: success; fixed one file.
- Static browser smoke from `/Users/zbeyens/git/plate-2`: `http://127.0.0.1:8765/index.html`, `rich-text.html`, and `rich-text-data.json` all returned `200`.
- Health snapshot: `ok=728`, `adapter-missing=51`, `coverage-gap=130`,
  `optional-missing-artifact=2`.
- ProseMirror workload coverage snapshot: `ok` for
  `core-rich-text-operations-compare`, `clipboard-large-payload`, and
  `history-compare`; `adapter-missing` remains for React, browser, collab,
  core-current/core-compare, and issue #6038 workloads.

Final handoff contract:
- Recommendation: next runtime adapter should be Lexical, because ProseMirror
  now covers the clean headless baseline and Lexical is the next distinct
  runtime architecture.
- Confidence: high.
- Evidence: active ProseMirror artifact, generated rows, refreshed docs/health,
  and explicit workload coverage map.
- Tests / commands: see Verification evidence.
- Browser proof: static generated docs are refreshed for
  `http://127.0.0.1:8765/index.html`.
- PR / tracker: no PR requested.
- Caveats: no DOM/browser ProseMirror adapter yet; no Lexical/Plate/Tiptap
  adapter yet.
- Next owner: adapter task for Lexical or ProseMirror DOM, depending whether the
  next question is runtime architecture or browser/product behavior.

Timeline:
- 2026-05-28T17:57:31Z Major-task goal plan created.
- 2026-05-28T18:03:23Z Evidence Kit docs refreshed with ProseMirror adapter rows.
- 2026-05-28T18:05:47Z Plan closeout updated.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final verification, goal completion, response |
| What is the goal? | Add the next non-Plite runtime adapter |
| What have I learned? | ProseMirror can close three headless workload gaps without overclaiming browser/product coverage |
| What have I done? | Added adapter, registry metadata, scripts, generated evidence, docs, and iteration note |

Open risks:
- ProseMirror DOM/editor-view behavior is not measured by this adapter.
- Remaining non-Plite adapter gaps are still the dominant next action.
