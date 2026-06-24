# plite integration failures

Objective:
Fix every current full local integration failure in `Plate repo root`, using the async integration runner as the source of truth.

Goal plan:
docs/plans/2026-05-27-plite-integration-failures.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: user request
- id / link: current Codex thread
- title: fix all current Plite local integration failures
- acceptance criteria: fresh full `bun test:integration-local:async` run for the current source stamp reports `failures: 0`; focused repros for repaired specs pass; this plan passes `check-complete`.

Completion threshold:
- `Plate repo root` has no current full local integration failures.
- Repaired rows have focused reproducer/proof commands recorded.
- Final full async run is fresh for the current source stamp and reports `status: passed`, `failures: 0`.
- Root autogoal checker passes for this plan.

Verification surface:
- `Plate repo root`: `bun test:integration-local:async`
- `Plate repo root`: `bun test:integration-local:status <run-id>`
- `Plate repo root`: focused Playwright/package/unit commands for repaired failure rows.
- Root: `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-plite-integration-failures.md`

Constraints:
- Preserve existing user-facing behavior outside the integration failures.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes.
- Do not run root git hygiene.

Boundaries:
- Source of truth: latest full async integration run under `Plate repo root/.tmp/integration-runs`.
- Allowed edit scope: `Plate repo root` source/tests/docs plus this root plan.
- Browser surface: Plite Playwright integration examples served by the async runner.
- Tracker sync: N/A, no external issue/Linear ticket in this request.
- Non-goals: no PR, no root git hygiene, no release/registry/template work.

Blocked condition:
Only blocked if the async integration runner cannot produce a failure list after repeated infrastructure-safe attempts, or if failures require unavailable external device/browser infrastructure. This did not occur.

Task state:
- task_type: browser regression repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready to complete

Current verdict:
- verdict: complete
- confidence: high
- next owner: user
- reason: full async integration run `2026-05-27T13-28-11-218Z` passed with `failureCount: 0` for source stamp `sha256:e38bb0e85a62d712b14ca1abf80293d4c3f0852c892ede816b44727a0a0924cb`.

Completion rule:
- `update_goal(status: complete)` is legal after this plan passes the checker.
- This file plus the active goal are the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | autogoal/task flow used for one-shot repair with full integration closure gate |
| Active goal checked or created | yes | active goal objective targets `Plate repo root` full async integration failures |
| Source of truth read before edits | yes | full async run `2026-05-27T13-14-05-589Z` read as the current red baseline |
| Tracker comments and attachments read | N/A | no tracker or attachment source in request |
| Video transcript evidence required | N/A | no video input |
| `docs/solutions` checked for non-trivial existing-code work | yes | existing Plite integration/browser workflow was followed; no solution note changed |
| TDD decision before behavior change or bug fix | yes | red full run plus focused repros drove repairs |
| Branch decision for code-changing task | N/A | no branch or PR requested |
| Release artifact decision | N/A | sibling Plite local patch; no package release requested |
| Browser tool decision for browser surface | yes | Playwright integration runner owns this proof |
| PR expectation decision | N/A | no PR requested |
| Tracker sync expectation decision | N/A | no tracker requested |
| Browser pack selected | yes | browser pack applies to browser-surface integration failures |
| Browser route / app surface identified | yes | `Plate repo root` Playwright integration examples via async runner base URL |
| Browser tool decision recorded | yes | async Playwright runner used as the approved browser proof surface |
| Console/network caveat policy recorded | yes | Playwright traces/logs are the evidence source for this repair |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, id/link, title, task type, acceptance criteria, caveats, likely files/routes/packages, browser surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice is recorded with reason.
- [x] Release artifact requirement recorded: N/A, no release artifact requested.
- [x] Final handoff shape decided: concise bug-fix outcome with exact tests.
- [x] Branch handling recorded for code-changing work: N/A, no branch requested.
- [x] Local-env-rot retry policy recorded: N/A, failures matched current runtime/test behavior.
- [x] Workspace authority recorded: every proof command names `Plate repo root` or root plan checker cwd.
- [x] High-risk note recorded for runtime/browser behavior.
- [x] Review/autoreview target selected: N/A for this one-shot local repair; full integration proof is the closure gate requested by the user.
- [x] Agent-native review decision recorded: N/A, no agent/action tooling changed.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: browser proof uses the repo-approved browser tool or records a blocker/waiver.
- [x] Browser pack: console and network errors are checked through Playwright run artifacts.
- [x] Browser pack: final proof artifact is the final full integration run artifact.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the named full async integration command | `Plate repo root`: `bun test:integration-local:async` -> run `2026-05-27T13-28-11-218Z`, passed, `failureCount: 0` |
| Bug reproduced before fix | yes | Record failing test/repro | `Plate repo root`: full run `2026-05-27T13-14-05-589Z` failed with 10 current failures |
| Targeted behavior verification | yes | Run focused proof for changed behavior | `Plate repo root`: focused run `2026-05-27T13-27-17-666Z` passed with 0 failures |
| TypeScript or typed config changed | yes | Run relevant typecheck | `Plate repo root`: `bun --filter plite-react typecheck`, `bun --filter plite-dom typecheck`, `bun --filter plite-browser typecheck` all passed |
| Package exports or file layout changed | N/A | No export or layout change | No barrel work required |
| Package manifests, lockfile, or install graph changed | N/A | No manifest or lockfile change | Install graph untouched |
| Agent rules or skills changed | N/A | No agent rules or skills changed | No sync required |
| Workspace authority proof | yes | Verify in owning repo/tool | All runtime/browser proof commands ran in `Plate repo root`; plan checker runs from root |
| Browser surface changed | yes | Capture browser proof or caveat | Full Playwright integration proof is the browser artifact |
| Browser final proof | yes | Record final browser artifact | `Plate repo root/.tmp/integration-runs/2026-05-27T13-28-11-218Z/failures.md` says `No failures.` |
| CI-controlled template output changed | N/A | No templates changed | No restore required |
| Package behavior or public API changed | N/A | No changeset requested for sibling repair | No package release flow in scope |
| Registry-only component work changed | N/A | No registry component work | No registry changelog required |
| Docs or content changed | yes | Verify source-backed plan content | This plan records exact run ids and commands only |
| High-risk mini gate | yes | Record failure mode and proof | Risk was browser selection ownership; focused and full Playwright proofs passed |
| Agent-native review for agent/tooling changes | N/A | No agent/tooling changes | No review required |
| Local install corruption suspected | N/A | No install corruption signal | No reinstall required |
| Autoreview for non-trivial implementation changes | N/A | User requested fixing every test; closure gate is full local integration | Full sweep passed with `failureCount: 0` |
| PR create or update | N/A | No PR requested | No `check`/PR work required |
| PR proof image hosting | N/A | No PR body | No hosted image required |
| Tracker sync-back | N/A | No tracker | No sync required |
| Final handoff contract | yes | Fill final handoff fields | Final handoff fields below are complete |
| Final lint | yes | Run scoped formatter/lint equivalent | `Plate repo root`: `bunx biome check --write` on touched files passed |
| Goal plan complete | yes | Run autogoal checker | Root: `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-plite-integration-failures.md` passed |
| Browser interaction proof | yes | Exercise target route/interaction with approved browser tool | Playwright integration routes exercised by async runner |
| Browser console/network check | yes | Record console/network state | No failing console/network artifact in final run; failure artifact says no failures |
| Browser final proof artifact | yes | Record trace/run proof | `Plate repo root/.tmp/integration-runs/2026-05-27T13-28-11-218Z` |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | red full run `2026-05-27T13-14-05-589Z` read | implementation |
| Implementation | complete | async runner, browser handle, DOM path, root interaction, content-root, and boundary event fixes landed | verification |
| Verification | complete | focused runs and final full run passed | closeout |
| PR / tracker sync | N/A | no PR/tracker requested | final response |
| Closeout | complete | plan updated with final run ids | final response |

Findings:
- Full run `2026-05-27T13-14-05-589Z` failed in comment-mode, DOM coverage boundary drag, and table drag after earlier stale buckets were fixed.
- Root cause was over-broad projected drag handling: ordinary same-root drags were treated as projected selections and the native DOM selection was cleared.
- DOM coverage boundary pointer targets also needed direct boundary event-point resolution instead of relying on browser caret APIs for non-editable placeholders.

Decisions and tradeoffs:
- Keep native DOM selection/import for ordinary same-root text drags.
- Use model selection for same-root DOM coverage boundary drags.
- Keep view selection only for real cross-root or different-owner projected drags.
- Keep the async runner artifact-facing by building packages before the static site and keying source stamps on `packages`.

Implementation notes:
- `tooling/plite/donor/integration-local-async.mjs` owns server lifecycle, skips occupied ports, includes `packages` in the source stamp, and builds package artifacts before `bun build:next`.
- `packages/browser/src/playwright/index.ts` uses semantic handles for selection/focus where DOM selection is not observable, including WebKit Shadow DOM.
- `packages/plite-react/src/editable/root-interaction-controller.ts` restricts projected drag selection to cross-root/different-owner drags and DOM coverage boundary drags.
- `packages/plite-dom/src/plugin/dom-editor.ts` resolves DOM coverage boundary event targets before generic DOM event range resolution.
- `packages/plite-react/src/components/editable-text-blocks.tsx` marks content-root slots as non-editable islands.

Review fixes:
- Type-depth issue in the Playwright harness was fixed by using a small local synthetic-key type instead of `KeyboardEventInit` in locator serialization.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Shadow DOM WebKit focus waited for unobservable DOM selection | 1 | Use semantic handle focus/press transport | Focused run `2026-05-27T13-13-17-201Z` passed |
| Fresh full run exposed over-broad projected drag handling | 1 | Split native same-root, model boundary, and view-projected drag paths | Focused run `2026-05-27T13-27-17-666Z` and full run `2026-05-27T13-28-11-218Z` passed |

Verification evidence:
- `Plate repo root`: `bun test ./scripts/integration-local-async.spec.ts` passed with 10 tests.
- `Plate repo root`: `bun --filter plite-react test:vitest -- root-interaction-resolver browser-handle-contract` passed.
- `Plate repo root`: `bun --filter plite-react typecheck` passed.
- `Plate repo root`: `bun --filter plite-dom typecheck` passed.
- `Plate repo root`: `bun --filter plite-browser typecheck` passed.
- `Plate repo root`: `bunx biome check --write` passed on touched files.
- `Plate repo root`: focused run `2026-05-27T12-23-12-503Z` for mobile async decorations passed with 0 failures.
- `Plate repo root`: focused run `2026-05-27T12-31-58-146Z` for huge-document refocus passed with 0 failures.
- `Plate repo root`: focused run `2026-05-27T12-47-19-466Z` for synced-block focus history passed with 0 failures.
- `Plate repo root`: focused run `2026-05-27T13-01-21-485Z` for synced-block mouse selection passed with 0 failures.
- `Plate repo root`: focused run `2026-05-27T13-13-17-201Z` for Shadow DOM WebKit ArrowLeft passed with 0 failures.
- `Plate repo root`: focused run `2026-05-27T13-27-17-666Z` for comment-mode, DOM coverage boundary, and table drag passed with 0 failures.
- `Plate repo root`: full run `2026-05-27T13-28-11-218Z`, source stamp `sha256:e38bb0e85a62d712b14ca1abf80293d4c3f0852c892ede816b44727a0a0924cb`, passed with `failureCount: 0`; failures artifact says `No failures.`

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker requested.
- Confidence line: high; final full local integration sweep passed.
- Flow table:
  - Reproduced: full run `2026-05-27T13-14-05-589Z` failed with 10 current failures.
  - Verified: full run `2026-05-27T13-28-11-218Z` passed with 0 failures.
- Browser check: async Playwright integration runner covered the browser surface.
- Outcome: all current full local integration failures are fixed.
- Caveat: no PR/check/commit was requested.
- Design:
  - Chosen boundary: root interaction and DOM event-range ownership.
  - Why not quick patch: test assertions were valid; the runtime was stealing native same-root drags.
  - Why not broader change: cross-root view selection still needs the projected path and was preserved.
- Verified: focused repros plus final full async run.

Reboot status:
The goal is ready for completion. The authoritative green run is `Plate repo root/.tmp/integration-runs/2026-05-27T13-28-11-218Z`, and the root autogoal checker passed for this plan.

Open risks:
None known. The remaining risk is ordinary browser flake, covered by the final full run and focused repros.
