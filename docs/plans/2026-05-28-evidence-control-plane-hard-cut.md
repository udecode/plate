# evidence-control-plane-hard-cut

Objective:
Replace the active editor benchmark workflow with an Evidence Kit control plane,
registered active benchmark artifacts only, health/next-action reporting,
refresh command, generated dashboard cockpit, and docs that say old one-off
benchmarks are discarded unless registered.

Completion threshold:
- Active benchmark artifacts are declared in `benchmarks/editor/research/benchmark-registry.json`.
- `benchmarks/editor/src/index.mjs` ingests active artifacts from the registry instead of hardcoded Plite artifact lists/fallbacks.
- A health command writes `benchmarks/results/benchmark-health-latest.json` with status counts, missing/stale/ignored artifacts, and ranked next actions.
- Package scripts expose `evidence:refresh` and include health generation in full/check flows.
- `docs/perf/index.html` surfaces benchmark health and next actions.
- `cd benchmarks/editor && npm run check` passes.
- Served `/index.html` contains benchmark health content.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-evidence-control-plane-hard-cut.md` passes.

Verification surface:
- `benchmarks/editor/package.json`
- `benchmarks/editor/src/index.mjs`
- `benchmarks/editor/benchmarks/benchmark-health.mjs`
- `benchmarks/editor/research/benchmark-registry.json`
- generated `benchmarks/editor/docs/perf/*`
- `cd benchmarks/editor && npm run check`
- HTTP smoke proof against `http://127.0.0.1:8765/index.html`

Constraints:
- Do not delete Plite source-owned benchmark runners; they are the measurement owners.
- Discard old benchmark authority by ignoring unregistered artifacts, not by treating every historical tmp JSON as active.
- Do not revive the old Next/Vite benchmark app lab.
- No PR/commit/branch requested.

Boundaries:
- Source of truth: user instruction "go, discard old benchmarks" plus existing Evidence Kit replacement docs.
- Allowed edit scope: `benchmarks/editor`, generated perf docs, root benchmark script aliases, and this plan.
- Browser surface: local static docs server at `http://127.0.0.1:8765/`.
- Tracker sync: N/A.
- Non-goals: no new Plite benchmark runner implementation, no non-Plite runtime adapter implementation.

Blocked condition:
- Block only if the registry-driven ingest cannot preserve current measured rows, required artifacts are missing, package checks fail after targeted repair, or the static docs server is unavailable. None remained.

Task state:
- task_type: benchmark workflow hard cut
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready to close

Current verdict:
- verdict: complete
- confidence: high
- next owner: user
- reason: registry-driven ingest, health report, refresh command, docs cockpit, package check, and served route proof are all green.

Completion rule:
- Close the active goal only after this plan passes the autogoal checker.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `major-task`, `hard-cut`, and `autogoal`. |
| Active goal checked or created | yes | Active goal created for Evidence Kit control-plane replacement. |
| Source of truth read before edits | yes | Read current `benchmarks/editor` scripts, source map, package scripts, Plite benchmark README, and prior memory note. |
| Tracker comments and attachments read | no | N/A: no tracker. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: benchmark docs/source map and Plite benchmark README were the direct source. |
| TDD decision before behavior change or bug fix | yes | No TDD; registry/health script checks and package check are the right proof. |
| Branch decision for code-changing task | yes | No branch action requested. |
| Release artifact decision | yes | No changeset; private benchmark lab only. |
| Browser tool decision for browser surface | yes | Used route-level static server proof. |
| PR expectation decision | yes | No PR requested. |
| Tracker sync expectation decision | yes | No tracker sync requested. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, id/link, title, task type, acceptance criteria, caveats, likely files/routes/packages, browser surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice is recorded with reason.
- [x] Release artifact requirement recorded: N/A, private benchmark lab only.
- [x] Final handoff shape decided: concise summary with workflow command, files, numbers, and verification.
- [x] Branch handling recorded for code-changing work: N/A, no branch requested.
- [x] Local-env-rot retry policy recorded: N/A, no install corruption signal.
- [x] Workspace authority recorded: verification ran in `/Users/zbeyens/git/plate-2/benchmarks/editor` and route proof hit the local static docs server.
- [x] High-risk note recorded: command-contract change is limited to benchmark lab/root aliases; package check proves the new flow.
- [x] Review/autoreview target selected: N/A, benchmark lab workflow change with full package check coverage.
- [x] Agent-native review decision recorded: N/A, no agent/tooling surfaces changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run package checks and served route proof. | `npm run check` passed; served `/index.html` proof passed. |
| Bug reproduced before fix | no | N/A: workflow replacement. | N/A. |
| Targeted behavior verification | yes | Verify registry ingest, health output, docs index. | `npm run evidence:refresh` passed; health has 23 active artifacts and 10 next actions; served index has health content. |
| TypeScript or typed config changed | no | N/A. | JS syntax checks passed through `npm run check`. |
| Package exports or file layout changed | no | N/A. | No barrels. |
| Package manifests, lockfile, or install graph changed | yes | Run benchmark package check. | `cd benchmarks/editor && npm run check` passed. |
| Agent rules or skills changed | no | N/A. | No agent sync. |
| Workspace authority proof | yes | Run checks in `benchmarks/editor`. | `npm run evidence:refresh`, `npm run docs:perf:check`, and `npm run check` ran in `benchmarks/editor`. |
| Browser surface changed | yes | Route proof for generated index. | HTTP proof: status 200, health/control-plane/discard text present, 2 primary cards, Evidence Kit not primary. |
| Browser final proof | yes | Record route proof or caveat. | Route-level static proof recorded; no screenshot needed. |
| CI-controlled template output changed | no | N/A. | No templates. |
| Package behavior or public API changed | no | N/A. | No changeset. |
| Registry-only component work changed | no | N/A. | No changelog. |
| Docs or content changed | yes | Regenerate and check docs. | `npm run docs:perf:check` and `npm run check` passed. |
| High-risk mini gate | yes | Record realistic failure mode and why chosen boundary is right. | Failure mode: random old tmp JSON becomes active evidence again; registry + ignored-artifact health count prevents it. |
| Agent-native review for agent/tooling changes | no | N/A. | No agent surfaces. |
| Local install corruption suspected | no | N/A. | No reinstall. |
| Autoreview for non-trivial implementation changes | no | N/A: scoped benchmark lab workflow. | Full package check and route proof passed. |
| PR create or update | no | N/A. | No PR. |
| PR proof image hosting | no | N/A. | No PR. |
| Tracker sync-back | no | N/A. | No tracker. |
| Final handoff contract | yes | Fill final handoff fields. | Final handoff fields completed below. |
| Final lint | yes | Run scoped Biome/check. | `npx biome check ... --fix` passed after correcting the root package path. |
| Goal plan complete | yes | Run autogoal checker. | To run after this update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Skills, memory, benchmark docs/scripts read. | implementation |
| Implementation | complete | Registry, health script, refresh scripts, docs/index cockpit, README/source-map/iteration updated. | verification |
| Verification | complete | `evidence:refresh`, `docs:perf:check`, `check`, and served route proof passed. | closeout |
| PR / tracker sync | complete | N/A. | final response |
| Closeout | complete | Plan ready for autogoal checker. | final response |

Findings:
- Source-owned benchmark runners stay in Plite; active Evidence Kit ingests only registered stable artifacts.
- The old failure mode was treating every tmp JSON or old benchmark note as current evidence.
- Current health: 23 active artifacts, 904 rows, 716 ok, 54 adapter-missing, 130 coverage-gap, 2 optional-missing-artifact, 2 over-budget, and 33 unregistered historical artifacts ignored.

Decisions and tradeoffs:
- Hard cut means unregistered artifacts are ignored/reported, not promoted.
- Health/next-action output is the self-improving layer; runners remain target-owned.
- The dashboard starts with benchmark health because navigation alone did not explain the workflow.

Implementation notes:
- Added `research/benchmark-registry.json` with active artifacts and workload mappings.
- Replaced hardcoded Plite artifact lists/fallback artifact paths with registry-driven ingest.
- Added `benchmarks/benchmark-health.mjs`.
- Added `evidence:health`, `evidence:refresh`, and root `bench:editor:health` / `bench:editor:refresh` aliases.
- Updated generated `index.html` to show health, next actions, and ignored old artifacts.
- Updated README/source-map/iteration docs to state the hard-cut registry rule.

Review fixes:
- Corrected a mistaken Biome path for the root package and reran scoped formatting from repo root.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Biome path used `../package.json` from `benchmarks/editor`, resolving to missing `benchmarks/package.json` | 1 | Reran Biome from repo root with explicit paths | Passed. |

Verification evidence:
- `npx biome check benchmarks/editor/src/index.mjs benchmarks/editor/benchmarks/benchmark-health.mjs benchmarks/editor/benchmarks/render-perf-index.mjs benchmarks/editor/package.json package.json benchmarks/editor/research/benchmark-registry.json benchmarks/editor/README.md benchmarks/editor/research/evidence-source-map.md benchmarks/editor/iterations/003-evidence-control-plane.md --fix` passed from repo root.
- `node --check src/index.mjs`, `node --check benchmarks/benchmark-health.mjs`, and `node --check benchmarks/render-perf-index.mjs` passed in `benchmarks/editor`.
- `npm run bench:rich-text:check && npm run evidence:health` passed in `benchmarks/editor`.
- `npm run evidence:refresh` passed in `benchmarks/editor`.
- `npm run docs:perf:check && npm run check` passed in `benchmarks/editor`.
- Served proof for `http://127.0.0.1:8765/index.html`: status 200, health/control-plane/discard text present, 2 primary cards, rich-text and internals primary links present, evidence not primary, next action present.

Final handoff contract:
- PR line: N/A.
- Issue / tracker line: N/A.
- Confidence line: High; full benchmark package check and served route proof passed.
- Flow table:
  - Reproduced: N/A.
  - Verified: `evidence:refresh`, `docs:perf:check`, `check`, and HTTP route proof passed.
- Browser check: route-level proof against local static server passed.
- Outcome: Evidence Kit is now the active control plane; unregistered old benchmark artifacts are discarded from active claims.
- Caveat: No new non-Plite runtime adapters were implemented; health now ranks that as a next action.
- Design:
  - Chosen boundary: Evidence Kit registry + health over target-owned runners.
  - Why not quick patch: hardcoded specs keep old-workflow confusion alive.
  - Why not broader change: benchmark runners themselves still belong in source repos.
- Verified: see verification evidence above.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: route-level HTTP proof passed.
- Caveats: non-Plite runtime adapters remain missing by design and are visible in health.

Timeline:
- 2026-05-28T15:54Z Goal created and source read started.
- 2026-05-28T15:56Z Plan created; implementation started.
- 2026-05-28T16:00Z Registry-driven ingest and health script implemented.
- 2026-05-28T16:03Z Refresh/check/docs/route proof passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response |
| What is the goal? | Evidence Kit becomes the active benchmark control plane and old unregistered benchmarks are discarded. |
| What have I learned? | Registry-driven ingest is the missing boundary. |
| What have I done? | Added registry, health, refresh command, docs cockpit, and proof. |

Open risks:
- None for the control-plane hard cut. The next real benchmark work is adapter/runtime coverage, which health now ranks explicitly.
