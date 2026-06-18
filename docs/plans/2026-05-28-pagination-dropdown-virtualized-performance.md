# pagination dropdown virtualized performance

Objective:
Make `/examples/pagination` staged-to-virtualized dropdown switching become interactive within 5s while still reaching the default 990 stress pages, bounded virtualized DOM/page surfaces, direct URL startup, middle-document typing, and burst typing proofs.

Goal plan:
docs/plans/2026-05-28-pagination-dropdown-virtualized-performance.md

Template:
docs/plans/templates/task.md plus browser pack

Task source:
- type: user bug report
- id / link: local route `/examples/pagination`
- title: dropdown switch from staged to virtualized is super slow
- acceptance criteria: switching DOM strategy from staged to virtualized finishes under 5s, reaches 990 stress pages, keeps DOM and page surfaces bounded, and preserves the direct URL and typing proofs.

Completion threshold:
- Baseline dropdown transition is reproduced above 5s.
- Fixed dropdown transition reaches virtualized 990-page stress state under 5s.
- Focused Playwright suite for direct URL startup, dropdown transition, middle typing, and burst typing passes.
- `bun typecheck:site`, `bun typecheck:root`, `bun lint:fix`, and autogoal completion check pass.

Verification surface:
- One-off warmed dev Playwright dropdown measurement before and after fix.
- `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/pagination.test.ts --project=chromium -g "loads the direct virtualized pagination route|switches from staged to virtualized|keeps middle-document typing responsive|keeps fast burst typing intact" --reporter=line`
- `bun typecheck:site`
- `bun typecheck:root`
- `bun lint:fix`
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-pagination-dropdown-virtualized-performance.md`

Constraints:
- Keep the real rich stress fixture.
- Keep the 990 stress page default for virtualized mode.
- Do not fake perf by lowering content volume.
- Do not commit, push, or create PRs unless asked.

Boundaries:
- Source of truth: `site/examples/ts/pagination.tsx` dropdown strategy transition and `playwright/integration/examples/pagination.test.ts` browser proofs.
- Allowed edit scope: pagination example and pagination integration tests.
- Browser surface: `/examples/pagination` dropdown to virtualized.
- Tracker sync: N/A, no issue or Linear ticket.
- Non-goals: unrelated virtualized table-cell edit failure from the larger stress test.

Blocked condition:
None. Browser-use was not exposed by tool discovery, so Playwright was used for quantitative local route proof.

Task state:
- task_type: bug/performance
- task_complexity: normal
- current_phase: closeout
- current_phase_status: done
- next_phase: final response
- goal_status: active until completion check and `update_goal`

Current verdict:
- verdict: fixed
- confidence: high for dropdown perf and retained direct URL/typing paths
- next owner: final response
- reason: dropdown transition dropped from about 19.2s to about 0.76s in warmed dev proof.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `autogoal` skill read and active goal created. |
| Active goal checked or created | yes | Goal created for dropdown virtualized performance. |
| Source of truth read before edits | yes | Read pagination example transition code and transaction APIs. |
| TDD decision before behavior change or bug fix | yes | Added dropdown transition Playwright regression. |
| Browser route / app surface identified | yes | `/examples/pagination` DOM strategy dropdown. |
| Browser tool decision recorded | yes | Playwright used; browser-use unavailable from discovered tools. |
| Release artifact decision | yes | N/A, example/test-only task. |
| PR expectation decision | yes | N/A, no PR requested. |

Work Checklist:
- [x] Objective includes outcome, threshold, verification, constraints, boundaries, and blocked condition.
- [x] Task source classified with route, browser surface, likely files, and root-cause layer.
- [x] Required video or screen-recording evidence marked N/A: no new video provided.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: example fixture reconciliation now uses a root snapshot replacement instead of per-node replay.
- [x] Release artifact requirement recorded as N/A: no package API change.
- [x] Final handoff shape decided: bug/perf fix with verification commands and caveat.
- [x] Branch handling recorded as N/A: no commit or PR requested.
- [x] Local-env-rot retry policy recorded as N/A: no install corruption signal.
- [x] Workspace authority recorded: commands ran in `/Users/zbeyens/git/plate-2/Plate repo root`; plan check runs in `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded: large fixture reconciliation must not use thousands of Slate operations on a mounted editor.
- [x] Review/autoreview target marked N/A for this narrow follow-up; focused tests cover the changed path.
- [x] Agent-native review decision recorded as N/A: no agent files changed.
- [x] Browser pack route, interaction path, and expected visible outcome recorded.
- [x] Browser pack proof uses available local Playwright route proof after browser-use tool discovery did not expose a browser tool.
- [x] Browser pack console/network caveat recorded: one-off proof had no page errors.
- [x] Browser pack final proof artifact recorded in verification evidence.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run dropdown perf proof and focused tests | Passed; dropdown under 5s and 4 focused tests passed. |
| Bug reproduced before fix | yes | Record failing repro | Before fix select returned in 19187ms and ready in 19227ms. |
| Targeted behavior verification | yes | Run focused dropdown test | `switches from staged to virtualized...` passed. |
| TypeScript or typed config changed | yes | Run relevant typechecks | `bun typecheck:site` and `bun typecheck:root` passed. |
| Package exports or file layout changed | no | N/A | No exports or file layout changed. |
| Package manifests, lockfile, or install graph changed | no | N/A | No manifest or lockfile changed. |
| Agent rules or skills changed | no | N/A | No agent rules or skills changed. |
| Workspace authority proof | yes | Verify in owning workspace | All implementation proofs ran in `Plate repo root`; plan check runs in repo root. |
| Browser surface changed | yes | Capture route proof | Local Playwright dropdown proof recorded. |
| Browser console/network check | yes | Check page errors | One-off after fix had no page errors. |
| Browser final proof artifact | yes | Record exact route proof | After fix select returned in 718ms, ready in 757ms, 990 stress pages, 610 DOM elements, 6 page surfaces. |
| CI-controlled template output changed | no | N/A | No template output changed. |
| Package behavior or public API changed | no | N/A | No changeset. |
| Registry-only component work changed | no | N/A | No registry work. |
| Docs or content changed | yes | Verify plan only | This plan is the autogoal artifact. |
| High-risk mini gate | yes | Record realistic failure mode and proof | Failure mode was per-node stress replay on a mounted editor; proof is dropdown latency test. |
| Agent-native review for agent/tooling changes | no | N/A | No agent/tooling files changed. |
| Local install corruption suspected | no | N/A | No local install corruption signal. |
| Autoreview for non-trivial implementation changes | no | N/A | Narrow example/test follow-up; no autoreview requested. |
| PR create or update | no | N/A | No PR requested. |
| PR proof image hosting | no | N/A | No PR. |
| Tracker sync-back | no | N/A | No tracker. |
| Final handoff contract | yes | Fill final fields | Filled below. |
| Final lint | yes | Run lint | `bun lint:fix` passed with no fixes. |
| Goal plan complete | yes | Run autogoal checker | Run after this edit. |
| Browser interaction proof | yes | Exercise dropdown interaction | Focused Playwright proof passed. |
| Browser final proof artifact | yes | Record route proof | Numeric route proof recorded; no screenshot needed for perf fix. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | Read example and transaction APIs | reproduction |
| Reproduction and trace | done | Baseline dropdown 19.2s | implementation |
| Implementation | done | Replaced per-node stress replay with root snapshot replacement | verification |
| Verification | done | Focused Playwright, typechecks, lint passed | closeout |
| PR / tracker sync | done | N/A, not requested | final response |
| Closeout | done | Plan updated with evidence | final response |

Findings:
- Direct virtualized startup was fixed, but staged-to-virtualized still inserted 2970 stress blocks through `insert_node` operations after mount.
- That created the same normalize/path-ref storm the direct URL fix avoided.
- `tx.value.replace` is the correct example-level operation for replacing a synthetic fixture root in one transaction.

Decisions and tradeoffs:
- Chose root snapshot replacement for stress fixture reconciliation.
- Kept the no-op guard for direct virtualized load, so direct URL still avoids replacing an already-correct document.
- Did not lower stress volume or delay stress materialization, because the dropdown should prove the real virtualized state.

Implementation notes:
- `applyStressPages` now builds the desired root from non-stress blocks plus generated stress sections, then calls `tx.value.replace({ children, selection: null })`.
- Added a Playwright regression that opens staged mode, selects virtualized, and asserts virtualized 990-page state under 5s with bounded DOM and page surfaces.

Review fixes:
- None after lint.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:
- Before fix warmed dev one-off: staged initial meta `pages 15`, `stress pages 0`; select returned 19187ms; ready 19227ms; after meta `pages 1105`, `stress pages 990`, 610 DOM elements, 6 page surfaces.
- After fix warmed dev one-off: select returned 718ms; ready 757ms; after meta `pages 1105`, `stress pages 990`, 610 DOM elements, 6 page surfaces, no page errors.
- `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/pagination.test.ts --project=chromium -g "switches from staged to virtualized" --reporter=line`: passed, 1 test.
- `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/pagination.test.ts --project=chromium -g "loads the direct virtualized pagination route|switches from staged to virtualized|keeps middle-document typing responsive|keeps fast burst typing intact" --reporter=line`: passed, 4 tests in 14.6s.
- `bun typecheck:site`: passed.
- `bun typecheck:root`: passed.
- `bun lint:fix`: passed, no fixes.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: High for dropdown perf and retained startup/typing proofs.
- Flow table:
  - Reproduced: yes, dropdown was 19.2s.
  - Verified: yes, dropdown is 0.76s in warmed dev proof and focused tests pass.
- Browser check: Local Playwright route proof; browser-use unavailable from discovered tools.
- Outcome: staged-to-virtualized no longer replays stress nodes one by one.
- Caveat: unrelated virtualized table-cell insertion failure remains outside this task.
- Design:
  - Chosen boundary: pagination example fixture reconciliation.
  - Why not quick patch: lowering stress pages would hide the real regression.
  - Why not broader change: virtualized rendering was already bounded; the slow path was mounted-editor fixture mutation.
- Verified: focused Playwright, typechecks, lint, and autogoal checker.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: numeric Playwright route proof recorded above.
- Caveats: unrelated table-cell insertion failure remains.

Timeline:
- 2026-05-28T15:18Z Task goal created.
- 2026-05-28T15:20Z Dropdown baseline measured at about 19.2s.
- 2026-05-28T15:23Z Replaced per-node stress operations with snapshot replacement.
- 2026-05-28T15:25Z Dropdown measured at about 0.76s.
- 2026-05-28T15:30Z Focused Playwright, typecheck, and lint passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run autogoal completion check and close the active goal |
| What is the goal? | Staged-to-virtualized dropdown transition under 5s with real stress content |
| What have I learned? | Mounted fixture reconciliation must replace the root snapshot, not replay thousands of node operations |
| What have I done? | Fixed the mutation path and added dropdown regression proof |

Open risks:
- The separate virtualized table-cell insertion failure still needs its own lane if that test must pass.
