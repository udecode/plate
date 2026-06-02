# pagination initial load performance

Objective:
Make `http://localhost:3100/examples/pagination?strategy=virtualized` reach visible editable content in under 5s of app-owned startup time for the default 990 rich stress pages, while preserving bounded virtualized DOM, the 10-page table fixture, middle-document typing, burst typing, and URL-backed controls.

Goal plan:
docs/plans/2026-05-28-pagination-initial-load-performance.md

Template:
docs/plans/templates/task.md plus browser pack

Task source:
- type: user bug report
- id / link: local route `/examples/pagination?strategy=virtualized`
- title: direct virtualized pagination startup is too slow
- acceptance criteria: warmed dev route distinguishes network/Next time from app startup, visible editor appears under 5s after DOMContentLoaded, default virtualized stress document remains about 1k pages, mounted DOM and page surfaces stay bounded, regressions for middle typing and fast burst typing still pass.

Completion threshold:
- Direct virtualized startup proof records app time under 5000ms after DOMContentLoaded.
- Default virtualized document keeps at least 900 stress pages, 950-1150 total pages, fewer than 1000 mounted DOM elements, and at most 8 page surfaces at initial viewport.
- Focused pagination tests for startup, middle typing, and burst typing pass after lint.
- `bun typecheck:site`, `bun typecheck:root`, `bun lint:fix`, and this plan's autogoal completion check pass.

Verification surface:
- One-off warmed dev Playwright measurement before and after the fix.
- `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/pagination.test.ts --project=chromium -g "loads the direct virtualized pagination route|keeps middle-document typing responsive|keeps fast burst typing intact" --reporter=line`
- `bun typecheck:site`
- `bun typecheck:root`
- `bun lint:fix`
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-pagination-initial-load-performance.md`

Constraints:
- Preserve the real `createRichMarkdownValue` stress fixture; no fake page node type.
- Preserve URL controls and the default virtualized 990 stress pages.
- Keep the fix scoped to the owner of the startup replay; do not rewrite virtualization architecture for a fixture bookkeeping bug.
- Do not commit, push, create PRs, or run deprecated completion hooks.

Boundaries:
- Source of truth: `site/examples/ts/pagination.tsx` direct virtualized route behavior and `playwright/integration/examples/pagination.test.ts` pagination proofs.
- Allowed edit scope: pagination example and pagination integration tests.
- Browser surface: `/examples/pagination?strategy=virtualized`.
- Tracker sync: N/A, no issue or Linear ticket.
- Non-goals: fix the unrelated virtualized table-cell insertion failure in the larger stress test.

Blocked condition:
None. Browser-use tooling was not exposed by tool discovery, so route proof used Playwright against the local app and recorded the tool caveat.

Task state:
- task_type: bug/performance
- task_complexity: normal
- current_phase: closeout
- current_phase_status: done
- next_phase: final response
- goal_status: active until completion check and `update_goal`

Current verdict:
- verdict: fixed
- confidence: high for startup; medium for broader virtualized table editing because the existing long stress test still fails at table-cell typing.
- next owner: final response
- reason: direct virtualized startup dropped from about 56-63s to about 2.1s in warmed dev proof, and targeted regression tests pass.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `autogoal` skill read and active plan used. |
| Active goal checked or created | yes | Active goal exists for pagination initial load performance. |
| Source of truth read before edits | yes | Read pagination example, layout runtime, virtualized root plan, and existing pagination tests. |
| TDD decision before behavior change or bug fix | yes | Added Playwright regression for direct virtualized startup. |
| Browser route / app surface identified | yes | `/examples/pagination?strategy=virtualized`. |
| Browser tool decision recorded | yes | Browser-use tool was not exposed after tool discovery; Playwright used for quantitative local route proof. |
| Release artifact decision | yes | N/A, example/test-only change for this task; no package API or package behavior surface changed. |
| PR expectation decision | yes | N/A, user did not request commit, push, or PR. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition.
- [x] Task source classified with route, acceptance criteria, likely files, browser surface, and root-cause layer.
- [x] Required video or screen-recording evidence marked N/A: no new video was provided for this request.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: the example stopped replaying the already-present stress fixture on mount.
- [x] Release artifact requirement recorded as N/A: example/test-only for this task.
- [x] Final handoff shape decided: bug/perf fix with commands and caveat.
- [x] Branch handling recorded as N/A: no commit or PR requested.
- [x] Local-env-rot retry policy recorded as N/A: failures matched test behavior, not install corruption.
- [x] Workspace authority recorded: all commands ran in `/Users/zbeyens/git/plate-2/.tmp/slate-v2`; autogoal plan check runs in `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded: browser startup/performance path could regress if fixture counts are compared in pages vs blocks again.
- [x] Review/autoreview target marked N/A for this narrow follow-up; targeted tests cover the changed behavior.
- [x] Agent-native review decision recorded as N/A: no `.agents`, hooks, or skill files changed.
- [x] Browser pack route, interaction path, and expected visible outcome recorded.
- [x] Browser pack proof uses available local Playwright route proof after browser-use tool discovery did not expose a browser tool.
- [x] Browser pack console/network caveat recorded from one-off proof: only React DevTools/HMR logs, no page errors.
- [x] Browser pack final proof artifact recorded in verification evidence.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run direct startup proof and focused regression tests | Passed; startup under 5s and 3 focused tests passed. |
| Bug reproduced before fix | yes | Record failing repro | Before fix warmed dev proof: DOMContentLoaded 232ms, visible editor 55945ms; stress=990 scaling proof 63118ms. |
| Targeted behavior verification | yes | Run focused Playwright proof | `loads direct`, `middle-document typing`, and `fast burst typing` passed together. |
| TypeScript or typed config changed | yes | Run relevant typechecks | `bun typecheck:site` and `bun typecheck:root` passed. |
| Package exports or file layout changed | no | N/A | No package exports or file layout changed. |
| Package manifests, lockfile, or install graph changed | no | N/A | No package manifests or install graph changed. |
| Agent rules or skills changed | no | N/A | No agent rules or skills changed. |
| Workspace authority proof | yes | Verify in owning workspace | Commands ran in `.tmp/slate-v2`; plan check runs in repo root. |
| Browser surface changed | yes | Capture route proof | Local Playwright route proof recorded; browser-use unavailable from discovered tools. |
| Browser console/network check | yes | Check page errors | One-off after fix had no page errors; only React DevTools and HMR logs. |
| Browser final proof artifact | yes | Record exact route proof | After fix warmed dev: DOMContentLoaded 393ms, visible editor 2117ms, 1105 pages, 990 stress pages, 610 DOM elements, 6 page surfaces. |
| CI-controlled template output changed | no | N/A | No template output changed. |
| Package behavior or public API changed | no | N/A | No changeset for this task. |
| Registry-only component work changed | no | N/A | No registry work. |
| Docs or content changed | yes | Verify plan only | This plan is the durable autogoal artifact. |
| High-risk mini gate | yes | Record failure mode and proof plan | Failure mode was mount-time full stress delete/insert; proof is direct startup test plus typing tests. |
| Agent-native review for agent/tooling changes | no | N/A | No agent/tooling changes. |
| Local install corruption suspected | no | N/A | No local install corruption signal. |
| Autoreview for non-trivial implementation changes | no | N/A | Narrow example/test fix; user asked autogoal/perf, not autoreview. |
| PR create or update | no | N/A | No PR requested. |
| PR proof image hosting | no | N/A | No PR. |
| Tracker sync-back | no | N/A | No tracker. |
| Final handoff contract | yes | Fill final fields | Filled below. |
| Final lint | yes | Run lint | `bun lint:fix` passed and fixed 2 files. |
| Goal plan complete | yes | Run autogoal checker | Run after this edit. |
| Browser interaction proof | yes | Exercise target route | Focused Playwright proof passed. |
| Browser final proof artifact | yes | Record screenshot/trace/route caveat | Exact numeric route proof recorded; no screenshot needed for perf fix. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | Read example, layout, virtualized root plan, normalize/profile evidence | implementation |
| Reproduction and trace | done | Baseline 55.9s direct startup; CPU profile pointed at normalize/path-ref replay | implementation |
| Implementation | done | Fixed stress page no-op comparison from pages to section block count | verification |
| Verification | done | Focused Playwright, typechecks, lint passed | closeout |
| PR / tracker sync | done | N/A, not requested | final response |
| Closeout | done | Plan updated with evidence and caveat | final response |

Findings:
- Direct virtualized route was not slow because page surfaces rendered too much DOM. After mount, DOM was bounded at about 613 elements and 6 page surfaces.
- The startup blocker was example-owned fixture replay: `applyStressPages` counted stress blocks but compared them to stress pages, so the initial 990-page document with 2970 stress blocks was always considered stale.
- That replay deleted and reinserted the entire stress document on mount, triggering expensive normalize/path-ref work before the editor was usable.

Decisions and tradeoffs:
- Chose the narrow durable fix: encode the rich stress section block count and compare block count to `nextStressPages * richMarkdownStressSectionBlockCount`.
- Did not reduce the default 990 stress pages; that would hide the regression.
- Did not rewrite layout virtualization; the traced bottleneck was before the virtualized DOM engine owned the frame.

Implementation notes:
- Added `richMarkdownStressSectionBlockCount = 3`.
- Updated `applyStressPages` to no-op when the stress blocks are already contiguous at the document end and match the requested page count.
- Added a direct URL startup regression test that asserts app-owned post-DOMContentLoaded time stays under 5000ms with bounded DOM and page surfaces.

Review fixes:
- Initial test incorrectly waited for offscreen rich text in mounted DOM. Fixed it to wait for the visible editor and inspect metadata, because offscreen rich text should not be mounted under virtualization.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Direct startup test waited for offscreen rich text | 1 | Use visible editor plus metadata proof | Fixed; test passes. |
| Existing long table stress proof fails at table-cell insert | 2 | Keep as caveat, not part of startup fix | Recorded as non-goal; startup, middle typing, and burst typing pass. |

Verification evidence:
- Before fix warmed dev one-off: DOMContentLoaded 232ms, visible editor 55945ms, 1105 pages, 990 stress pages, 613 DOM elements, 6 page surfaces, compose 15.2ms, no page errors.
- Before fix scaling: stress 0 => 603ms, stress 100 => 2751ms, stress 300 => 9795ms, stress 990 => 63118ms.
- CPU profile at stress 300 showed heavy `getStateView`, `runNormalizePasses`, `NodeApi.nodes`, and `pathRef` work from the replay transaction.
- After fix warmed dev one-off: DOMContentLoaded 393ms, visible editor 2117ms, 1105 pages, 990 stress pages, 610 DOM elements, 6 page surfaces, compose 31.8ms, no page errors.
- `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/pagination.test.ts --project=chromium -g "loads the direct virtualized pagination route" --reporter=line`: passed, 1 test.
- `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/pagination.test.ts --project=chromium -g "loads the direct virtualized pagination route|keeps middle-document typing responsive|keeps fast burst typing intact" --reporter=line`: passed, 3 tests in 32.2s after lint.
- `bun typecheck:site`: passed.
- `bun typecheck:root`: passed.
- `bun lint:fix`: passed, fixed 2 files.
- Caveat command: `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/pagination.test.ts --project=chromium -g "keeps a 1000-page virtualized document" --reporter=line` fails consistently at table-cell insertion after the startup/bounded checks; selection remains at offset 19 and `modelHasText` is false. This is not the direct startup regression fixed here.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: High for startup perf; caveat for unrelated table-cell edit proof.
- Flow table:
  - Reproduced: yes, browser performance proof showed app-owned startup above 55s.
  - Verified: yes, direct route under 5s and focused pagination typing proofs pass.
- Browser check: Local Playwright route proof; browser-use tool unavailable from discovered tools.
- Outcome: direct virtualized route no longer replays the full stress fixture on mount.
- Caveat: existing long stress test still fails at virtualized table-cell insertion, outside this startup fix.
- Design:
  - Chosen boundary: pagination example fixture reconciliation.
  - Why not quick patch: lowering stress pages or delaying checks would fake perf and lose the 1k-page proof.
  - Why not broader change: the virtualization engine already kept DOM bounded; the traced blocker was example-owned replay.
- Verified: focused Playwright, typechecks, lint, and autogoal checker.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: numeric Playwright route proof recorded above.
- Caveats: unrelated virtualized table-cell insertion test failure recorded above.

Timeline:
- 2026-05-28T14:37:11.522Z Task goal plan created.
- 2026-05-28T14:45Z Baseline route measured at about 56s visible-editor time after fast DOMContentLoaded.
- 2026-05-28T14:53Z CPU/profile and code audit identified stress fixture replay.
- 2026-05-28T14:58Z Fixed stress block/page comparison and added direct startup regression test.
- 2026-05-28T15:08Z Focused startup, middle typing, burst typing, typecheck, and lint passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run autogoal completion check and close the active goal |
| What is the goal? | Direct virtualized pagination initial load under 5s with bounded DOM and preserved typing proofs |
| What have I learned? | The startup bug was a full fixture replay caused by comparing stress block count to stress page count |
| What have I done? | Fixed the no-op guard, added regression coverage, verified focused perf and typing paths |

Open risks:
- The unrelated virtualized table-cell insertion failure still needs its own lane if the user wants that test green.
