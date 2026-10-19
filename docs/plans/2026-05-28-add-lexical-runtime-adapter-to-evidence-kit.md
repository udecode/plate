# Add Lexical runtime adapter to Evidence Kit

Objective:
Add the next non-Plite runtime adapter after ProseMirror by measuring Lexical
headless editor/history operations, wiring the adapter into the active Evidence
Kit registry, refreshing generated perf artifacts, and proving the adapter gap
count decreases with real rows.

Goal plan:
docs/plans/2026-05-28-add-lexical-runtime-adapter-to-evidence-kit.md

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
- decision to make: how to add the next non-Plite adapter without claiming
  browser/product parity
- decision criteria: source-backed target, local clone inspected, active
  required artifact, measured rows, refreshed docs/health, reduced
  `adapter-missing` count

Major lane:
- lane: editor benchmark infrastructure
- output type: adapter implementation plus generated evidence artifacts
- implementation expected: yes
- affected packages / surfaces: `benchmarks/editor`, generated perf docs,
  npm lockfile, and this goal plan
- dominant risk: including state reset or browser/product behavior in a
  headless runtime claim

Completion threshold:
- Lexical has a required active registry artifact.
- `npm run bench:adapter:lexical` writes at least seven `ok` rows.
- Rich-text workload coverage marks Lexical `ok` only for covered headless
  workload families.
- `npm run evidence:refresh` refreshes docs, health, and rich-text results.
- Adapter-missing rows drop from `51` to `48`; active artifacts rise from `24`
  to `25`; rich-text rows rise from `911` to `918`.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-add-lexical-runtime-adapter-to-evidence-kit.md`
  passes.

Verification surface:
- `/Users/zbeyens/git/plate-2/benchmarks/editor`
- local source root `/Users/zbeyens/git/lexical`
- `npm run bench:adapter:lexical`
- `npm run evidence:refresh`
- `npm run docs:perf:check`
- scoped syntax/lint commands recorded below
- generated `benchmarks/results/benchmark-health-latest.json`
- generated `benchmarks/results/rich-text-editors-latest.json`

Constraints:
- Start from local Lexical source before external claims.
- Keep the adapter headless: `lexical`, `@lexical/headless`, and
  `@lexical/history`.
- Separate measured evidence from source-backed gaps.
- Do not claim React, DOM/browser, collab, or Plite-specific issue parity from
  a headless Lexical adapter.

Boundaries:
- Source of truth: `benchmarks/editor/research/benchmark-registry.json`.
- Allowed edit scope: Evidence Kit benchmark package, generated perf artifacts,
  npm package metadata/lockfile, and this goal plan.
- External sources: none used; local `../lexical` source root exists.
- Browser surface: static generated docs at `http://127.0.0.1:8765/index.html`.
- Tracker sync: none.
- Non-goals: Plate, Tiptap, Lexical React/browser, and Lexical collab adapters.

Blocked condition:
- Autonomous work would stop only if the local Lexical source or npm runtime
  packages were unavailable, or if the headless adapter could not produce stable
  measured rows. The adapter ran successfully.

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
- reason: Lexical now has active measured runtime rows and the matrix still
  exposes honest remaining gaps.

Completion rule:
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and the autogoal
  `check-complete` command passes.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `major-task` loaded | yes | task classified as heavyweight benchmark adapter work |
| Active goal checked or created | yes | active goal created for Lexical adapter threshold |
| Source of truth read before analysis | yes | registry, package metadata, local Lexical source, README, and generated perf output inspected |
| Major lane selected | yes | editor benchmark infrastructure |
| Decision criteria stated | yes | source-backed target, active artifact, measured rows, refreshed docs/health, reduced gaps |
| Existing repo patterns / prior decisions checked | yes | ProseMirror adapter and iteration notes followed |
| Helper stack selected | yes | local Node script plus Evidence Kit registry |
| External research decision recorded | yes | no web research; local Lexical source and package APIs were enough |
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
- [x] Implementation touched benchmark package and docs/evidence surfaces.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run adapter and refresh commands | `npm run bench:adapter:lexical`; `npm run evidence:refresh` |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | local Lexical package metadata/source and Evidence Kit registry inspected |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Lexical selected for headless runtime coverage only |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Lexical second; Plate/Tiptap deferred due wrapper/product adapter shape |
| Review / pressure pass | yes | Validate no overclaiming against workload coverage | React/browser/collab/Plite-specific Lexical rows remain `adapter-missing` |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | reset moved outside timed operation samples |
| External-source audit | yes | Cite official/local clone/external sources when used, or record N/A | local `../lexical` exists; local source confirmed headless/history APIs |
| Implementation gates | yes | Close primary-template and touched-surface gates | adapter, registry, package scripts/deps, generated docs/results updated |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | see Final handoff contract |
| Final lint | yes | Run scoped equivalent when files changed | scoped syntax/lint command recorded below |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-add-lexical-runtime-adapter-to-evidence-kit.md` | recorded below |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | registry/package/local Lexical source inspected | current-state map |
| Current-state map | complete | Lexical had source target but no measured runtime rows | options |
| Options and recommendation | complete | Lexical chosen as second headless runtime adapter; Plate/Tiptap deferred | review |
| Review / pressure pass | complete | coverage limited to three headless workloads; reset moved out of timed samples | implementation |
| Implementation or plan artifact | complete | adapter script, registry, package scripts/deps, docs, generated artifacts updated | verification |
| Verification | complete | focused commands recorded below | closeout |
| Closeout | complete | final handoff prepared | final response |

Findings:
- Lexical exposes a real headless runtime through `@lexical/headless`.
- Lexical history can be measured headlessly through `@lexical/history`.
- The adapter can honestly cover large document creation, text insertion,
  selection, document replacement, block fragment insert, and history undo/redo.
- A headless adapter cannot honestly cover React render behavior, browser replay,
  collab behavior, or Plite-specific issue #6038 transaction semantics.

Decisions and tradeoffs:
- Chosen: Lexical headless adapter using `lexical`, `@lexical/headless`, and
  `@lexical/history`.
- Chosen: restore the base editor state before each timed sample, outside the
  measured callback.
- Deferred: Plate and Tiptap, because those should measure wrapper/product
  overhead rather than bare runtime cores.
- Rejected: marking all Lexical rows `ok`; that would fabricate coverage.

Implementation notes:
- Added `benchmarks/editor/benchmarks/lexical-runtime-adapter.mjs`.
- Added `bench:adapter:lexical` and wired it into `bench:evidence`,
  `evidence:refresh`, and `check`.
- Added npm dev dependencies: `lexical`, `@lexical/headless`, and
  `@lexical/history`.
- Added registry `runtimeAdapters` metadata and required
  `lexical-runtime-adapter` artifact.
- Refreshed generated perf docs/results.

Review fixes:
- Moved Lexical editor-state reset into untimed sample setup so measured rows
  represent operations, not reset overhead.
- Kept uncovered Lexical browser/product workloads as `adapter-missing`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Timed callback included Lexical state reset | 1 | Move reset into sample setup before the timed callback | fixed and reran adapter/refresh |

Verification evidence:
- `npm install --save-dev lexical@0.42.0 @lexical/headless@0.42.0 @lexical/history@0.42.0` from `/Users/zbeyens/git/plate-2/benchmarks/editor`: success.
- `npm run bench:adapter:lexical` from `/Users/zbeyens/git/plate-2/benchmarks/editor`: success; wrote `7` rows.
- `node --check benchmarks/lexical-runtime-adapter.mjs && node --check benchmarks/prosemirror-runtime-adapter.mjs && node --check src/index.mjs` from `/Users/zbeyens/git/plate-2/benchmarks/editor`: success.
- `npm run evidence:refresh` from `/Users/zbeyens/git/plate-2/benchmarks/editor`: success; generated `918` rich-text rows and health `active=25`.
- `npm run docs:perf:check` from `/Users/zbeyens/git/plate-2/benchmarks/editor`: success; checked index, evidence, rich-text, and internals docs.
- `pnpm exec biome check benchmarks/editor/benchmarks/lexical-runtime-adapter.mjs benchmarks/editor/benchmarks/prosemirror-runtime-adapter.mjs benchmarks/editor/src/index.mjs benchmarks/editor/package.json benchmarks/editor/research/benchmark-registry.json benchmarks/editor/README.md benchmarks/editor/research/evidence-source-map.md benchmarks/editor/iterations/006-lexical-runtime-adapter.md docs/plans/2026-05-28-add-lexical-runtime-adapter-to-evidence-kit.md --fix` from `/Users/zbeyens/git/plate-2`: success; fixed one file.
- Static browser smoke from `/Users/zbeyens/git/plate-2`: `http://127.0.0.1:8765/index.html`, `rich-text.html`, and `rich-text-data.json` all returned `200`.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-add-lexical-runtime-adapter-to-evidence-kit.md` from `/Users/zbeyens/git/plate-2`: success.
- Health snapshot: `ok=738`, `adapter-missing=48`, `coverage-gap=130`,
  `optional-missing-artifact=2`.
- Lexical workload coverage snapshot: `ok` for
  `core-rich-text-operations-compare`, `clipboard-large-payload`, and
  `history-compare`; `adapter-missing` remains for React, browser, collab,
  core-current/core-compare, and issue #6038 workloads.

Final handoff contract:
- Recommendation: next adapter should be Tiptap if the priority is
  ProseMirror-product-wrapper overhead, or Plate if the priority is direct
  Plate-vs-Plite user-facing wrapper cost.
- Confidence: high.
- Evidence: active Lexical artifact, generated rows, refreshed docs/health, and
  explicit workload coverage map.
- Tests / commands: see Verification evidence.
- Browser proof: static generated docs are refreshed for
  `http://127.0.0.1:8765/index.html`.
- PR / tracker: no PR requested.
- Caveats: no Lexical DOM/browser, React, or collab adapter yet.
- Next owner: adapter task for Tiptap, Plate, or Lexical DOM depending on the
  next comparison question.

Timeline:
- 2026-05-28T18:58:18Z Major-task goal plan created.
- 2026-05-28T19:00:00Z Lexical adapter produced first seven rows.
- 2026-05-28T19:04:26Z Evidence Kit docs refreshed with Lexical adapter rows
  and plan closeout updated.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final verification, goal completion, response |
| What is the goal? | Add the Lexical non-Plite runtime adapter |
| What have I learned? | Lexical headless/history can close three workload gaps without overclaiming browser/product coverage |
| What have I done? | Added adapter, registry metadata, scripts, deps, generated evidence, docs, and iteration note |

Open risks:
- Lexical DOM/browser behavior is not measured by this adapter.
- Plate and Tiptap adapter gaps remain.
