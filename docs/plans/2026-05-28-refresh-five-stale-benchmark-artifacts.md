# refresh five stale benchmark artifacts

Objective:
Refresh the five stale active Evidence Kit artifacts for `react-huge-document-browser-trace`, `core-normalization-current`, `core-query-ref-observation`, `core-refs-projection`, and `history-compare`; regenerate benchmark health/docs; verify those five refresh actions disappear while the dashboard stays scoped to Slate and Slate v2.

Goal plan:
docs/plans/2026-05-28-refresh-five-stale-benchmark-artifacts.md

Task source:
- type: benchmark health next actions
- id / link: `refresh-react-huge-document-browser-trace`, `refresh-core-normalization-current`, `refresh-core-query-ref-observation`, `refresh-core-refs-projection`, `refresh-history-compare`
- title: refresh the five remaining stale active artifacts
- acceptance criteria: all five registry commands pass, all five registered artifact files are fresh, Evidence Kit health/docs regenerate, health no longer lists those five refresh actions, and live `rich-text-data.json` remains Slate-only.

Completion threshold:
- `Plate repo root` runs all five active registry commands successfully.
- `benchmarks/editor` runs `npm run check` successfully after refresh.
- `benchmarks/editor/benchmarks/results/benchmark-health-latest.json` has none of the five refresh action IDs.
- Served `http://127.0.0.1:8765/rich-text-data.json` contains no Plate, ProseMirror, Lexical, TipTap, chunk-off, or runtime-adapter scope.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-refresh-five-stale-benchmark-artifacts.md` passes.

Verification surface:
- `Plate repo root`: `bun run bench:react:huge-document:browser-trace:local`
- `Plate repo root`: `bun run bench:core:normalization:local`
- `Plate repo root`: `bun run bench:core:query-ref-observation:local`
- `Plate repo root`: `bun run bench:core:refs-projection:local`
- `Plate repo root`: `HISTORY_BENCH_LEGACY_REPO=../../../slate bun run bench:history:compare:local`
- `Plate repo root`: `bun lint`
- `benchmarks/editor`: `npm run check`
- repo root: health-next-action JSON audit
- repo root: artifact mtime audit
- repo root: live `rich-text-data.json` Slate-only fetch audit

Constraints:
- Keep active benchmark scope to `slate` and `slate-v2`.
- Do not reintroduce Plate, ProseMirror, Lexical, TipTap, or chunk-off lanes.
- Do not repair optional artifact decisions or unregistered historical artifact policy in this refresh.
- Do not create commits, PRs, pushes, or tracker comments.

Boundaries:
- Source of truth: `benchmarks/editor/research/benchmark-registry.json`, generated Evidence Kit health output, and registered JSON artifacts under `Plate repo root/tmp`.
- Allowed edit scope: stale benchmark harness drift, Evidence Kit registry command contract, generated Evidence Kit outputs, and this goal plan.
- Browser surface: static dashboard served at `http://127.0.0.1:8765/`.
- Tracker sync: not applicable, no external tracker requested.
- Non-goals: optional artifact policy, unregistered artifact cleanup, non-Slate adapters, and unrelated Slate v2 repo contract test cleanup.

Blocked condition:
- A real blocker would be any of the five benchmark commands failing after source-level harness repair, or Evidence Kit still reporting one of the five refresh actions after regenerated docs/health. Neither blocker remains.

Task state:
- task_type: benchmark-refresh
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final-response
- goal_status: active-until-autogoal-close

Current verdict:
- verdict: complete after autogoal checker
- confidence: high
- next owner: user
- reason: all five refresh commands passed, Evidence Kit check passed, and health now has only the three non-refresh actions.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Used autogoal because the task had five measurable health-action removals. |
| Active goal checked or created | yes | Created goal for refreshing five stale active artifacts and verifying health/docs/data. |
| Source of truth read before edits | yes | Read current health next actions and `benchmarks/editor/research/benchmark-registry.json`. |
| Tracker comments and attachments read | no | No tracker or attachment was part of this request. |
| Video transcript evidence required | no | No video or screen recording supplied. |
| `docs/solutions` checked for non-trivial existing-code work | no | Focused benchmark refresh; local registry/scripts were the source of truth. |
| TDD decision before behavior change or bug fix | yes | No new test added; target benchmark commands and Evidence Kit health are the regression proof. |
| Branch decision for code-changing task | yes | No branch action; user requested local execution only. |
| Release artifact decision | yes | No package release artifact; benchmark harness/registry only. |
| Browser tool decision for browser surface | yes | Browser MCP was not exposed after tool discovery; direct HTTP JSON fetch verified served dashboard data. |
| PR expectation decision | yes | No PR requested. |
| Tracker sync expectation decision | yes | No tracker sync requested. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, id/link, title, task type, acceptance criteria, caveats, likely files/routes/packages, browser surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized XML, or marked not applicable with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice is recorded with reason.
- [x] Release artifact requirement recorded: no changeset or registry changelog applies to benchmark harness refresh.
- [x] Final handoff shape decided: concise summary with five refreshed artifacts, checks, and remaining health actions.
- [x] Branch handling recorded for code-changing work: no branch action because none was requested.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure: not env rot; history failure was source/API drift and wrong legacy path.
- [x] Workspace authority recorded: every proof command names `Plate repo root`, `benchmarks/editor`, or repo root.
- [x] High-risk note recorded for command-contract/runtime changes: history compare needed current extension-based history API support and legacy path pinning.
- [x] Review/autoreview target selected from actual diff state: not run; focused benchmark harness repair with target checks.
- [x] Agent-native review decision recorded: not applicable, no agent tooling changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run all five benchmark commands, Evidence Kit check, health audit, artifact audit, and live JSON audit | Completed. |
| Bug reproduced before fix | yes | Record failing command before fix | `bun run bench:history:compare:local` failed on missing `.tmp/slate/package.json`; env override then exposed stale `withHistory` import against current Slate v2. |
| Targeted behavior verification | yes | Run each target benchmark command | All five target commands passed after fixing history compare. |
| TypeScript or typed config changed | no | No typecheck required | Changed JS benchmark script and JSON registry only. |
| Package exports or file layout changed | no | No barrel action | No exported layout changed. |
| Package manifests, lockfile, or install graph changed | no | No install needed | No manifest or lockfile changed. |
| Agent rules or skills changed | no | No skill sync | No `.agents` source edited. |
| Workspace authority proof | yes | Run verification in owning workspaces | Target commands and lint ran in `Plate repo root`; Evidence Kit suite ran in `benchmarks/editor`; HTTP data audit ran from repo root. |
| Browser surface changed | yes | Verify generated/served dashboard data | Direct fetch of served `rich-text-data.json` passed with no forbidden non-Slate terms. |
| Browser final proof | yes | Record caveat | Browser MCP was not exposed; live HTTP JSON proof covers the dashboard data source. |
| CI-controlled template output changed | no | No template output | No `templates/**` changed. |
| Package behavior or public API changed | no | No changeset | Benchmark harness only. |
| Registry-only component work changed | no | No component changelog | Not registry component work. |
| Docs or content changed | yes | Verify generated docs | `npm run check` ran `docs:perf`, `docs:rich-text:check`, and `docs:index:check` successfully. |
| High-risk mini gate | yes | Record failure mode, proof plan, and boundary | Failure mode was stale command/API drift making refresh impossible; boundary is benchmark harness and Evidence Kit command registry. |
| Agent-native review for agent/tooling changes | no | No agent-native review | No agent/tooling changes. |
| Local install corruption suspected | no | No reinstall | Failures were deterministic path/API errors, not local install corruption. |
| Autoreview for non-trivial implementation changes | no | No autoreview | Focused benchmark harness repair; target commands and Evidence Kit check are sufficient. |
| PR create or update | no | No PR | User did not ask for PR. |
| PR proof image hosting | no | No PR body | Not applicable. |
| Tracker sync-back | no | No tracker | Not applicable. |
| Final handoff contract | yes | Fill final handoff fields | Completed below. |
| Final lint | yes | Run scoped equivalent | `Plate repo root`: `bun lint` passed; `benchmarks/editor`: `npm run check` passed. |
| Goal plan complete | yes | Run autogoal checker | To be run after this file update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read five refresh actions and registry commands. | none |
| Implementation | complete | Refreshed four artifacts directly; fixed history registry command and compare runner drift. | none |
| Verification | complete | All target benchmark commands passed, Evidence Kit check passed, health/live-data audits passed. | none |
| PR / tracker sync | complete | No PR or tracker requested. | none |
| Closeout | complete | Durable evidence recorded; autogoal checker remains final mechanical gate. | final response |

Findings:
- Four artifacts refreshed without code changes.
- `history-compare` defaulted to `.tmp/slate`, but this repo workflow compares `Plate repo root` against `../../../slate`.
- After the legacy path was corrected, `history-compare` still used old `withHistory` assumptions. Current Slate v2 uses `history()` extensions and `tx.history.undo()/redo()`.
- Evidence Kit health now has only three non-refresh next actions.

Decisions and tradeoffs:
- Patched the Evidence Kit registry command to pin `HISTORY_BENCH_LEGACY_REPO=../../../slate`, matching the established Slate vs Slate-v2 checkout layout.
- Patched the history compare runner to support both current extension-based history and legacy plugin-based history.
- Did not touch optional artifact decisions or historical unregistered artifacts; those are separate next actions.

Implementation notes:
- Updated [benchmark-registry.json](/Users/zbeyens/git/plate-2/benchmarks/editor/research/benchmark-registry.json:207) so `history-compare` uses `HISTORY_BENCH_LEGACY_REPO=../../../slate`.
- Updated [history.mjs](/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/compare/history.mjs:1) to dynamically support `history()` and `withHistory()` APIs.
- Regenerated benchmark results and docs under `benchmarks/editor`.

Review fixes:
- None from external review.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `history-compare` looked for `.tmp/slate/package.json` | 1 | Pin `HISTORY_BENCH_LEGACY_REPO=../../../slate` | Fixed in registry and command rerun. |
| `withHistory` missing from current `slate-history` | 1 | Support both current `history()` extension and legacy `withHistory()` plugin | Fixed in compare runner. |

Verification evidence:
- `Plate repo root`: `bun run bench:react:huge-document:browser-trace:local` passed and wrote `tmp/slate-react-huge-document-browser-trace-benchmark-surfaces-defaultAuto-stagedDomPresent-blocks-5000-iters-3-ops-10.json`.
- `Plate repo root`: `bun run bench:core:normalization:local` passed and wrote `tmp/slate-normalization-benchmark.json`.
- `Plate repo root`: `bun run bench:core:query-ref-observation:local` passed and wrote `tmp/slate-query-ref-observation-benchmark.json`.
- `Plate repo root`: `bun run bench:core:refs-projection:local` passed and wrote `tmp/slate-refs-projection-benchmark.json`.
- `Plate repo root`: `HISTORY_BENCH_LEGACY_REPO=../../../slate bun run bench:history:compare:local` passed and wrote `tmp/slate-history-compare-benchmark.json`.
- Fresh artifact mtimes: browser trace `2026-05-28T21:59:39.539Z`; normalization `2026-05-28T21:59:45.787Z`; query/ref observation `2026-05-28T21:59:54.777Z`; refs projection `2026-05-28T22:00:05.880Z`; history compare `2026-05-28T22:01:58.315Z`.
- `benchmarks/editor`: `npm run check` passed. It regenerated benchmark results, scope, docs, health, and research list output.
- Health audit: `nextActionCount=3`; remaining titles are `Decide whether core-transaction-current should stay optional`, `Decide whether history-retained-memory should stay optional`, and `Delete or ignore historical unregistered artifacts`; none of the five refresh IDs remain.
- Live dashboard data audit: `rowCount=463`, `groupCount=11`, libraries `slate`, `slate-v2`, `slate-v2:browser-replay`, `slate-v2:current`, `slate-v2:default-render-auto`, `slate-v2:dom-present`, `slate:baseline`, `slate:browser-replay`; forbidden terms found `[]`.
- `Plate repo root`: `bun lint` passed.

Final handoff contract:
- PR line: no PR requested.
- Issue / tracker line: no tracker requested.
- Confidence line: high.
- Flow table:
  - Reproduced: five stale refresh actions existed; history compare initially failed on wrong legacy path and stale history API.
  - Verified: all five target commands passed, Evidence Kit check passed, health refresh actions disappeared, live dashboard data stayed Slate-only.
- Browser check: direct HTTP fetch against served `rich-text-data.json`; Browser MCP unavailable.
- Outcome: all five stale active artifacts are fresh and health is down to the three non-refresh tasks.
- Caveat: remaining health tasks are optional-artifact decisions and unregistered artifact cleanup, not refreshes.
- Design:
  - Chosen boundary: benchmark harness plus Evidence Kit registry command.
  - Why not quick patch: editing health JSON directly would fake the refresh.
  - Why not broader change: optional artifact policy and historical cleanup are separate choices.
- Verified: five benchmark commands, `npm run check`, health audit, artifact audit, live JSON audit, `bun lint`.

Final handoff / sync:
- PR: not requested.
- Issue / tracker: not requested.
- Browser proof: live HTTP JSON audit against `127.0.0.1:8765`.
- Caveats: three non-refresh health next actions remain by design.

Timeline:
- 2026-05-28T21:59:07.963Z Task goal plan created.
- 2026-05-28T21:59:39.539Z Browser trace artifact refreshed.
- 2026-05-28T21:59:45.787Z Normalization artifact refreshed.
- 2026-05-28T21:59:54.777Z Query/ref observation artifact refreshed.
- 2026-05-28T22:00:05.880Z Refs projection artifact refreshed.
- 2026-05-28T22:01:58.315Z History compare artifact refreshed after harness repair.
- 2026-05-28T22:02Z Evidence Kit `npm run check` passed and health dropped to three next actions.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout. |
| Where am I going? | Run autogoal checker, close goal, final response. |
| What is the goal? | Refresh the five stale active benchmark artifacts and remove their health actions. |
| What have I learned? | History compare needed both the correct legacy repo path and current-vs-legacy history API compatibility. |
| What have I done? | Ran all five refresh commands, repaired history compare, regenerated Evidence Kit output, and verified health/data. |

Open risks:
- The three remaining health next actions are intentionally not handled in this refresh: two optional artifact decisions and one unregistered artifact cleanup.
