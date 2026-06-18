# slate v2 comment mode text selection

Objective:
Fix the Slate v2 `examples/comment-mode` regression where users cannot select
text inside the comment-mode editor.

Goal plan:
docs/plans/2026-05-26-slate-v2-comment-mode-text-selection.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: user prompt
- id / link: local chat request
- title: Comment mode text selection regression
- acceptance criteria: reproduce the route bug, identify the owning layer, add
  focused coverage, fix the durable cause without example-local selection
  hacks, and verify selection works on
  `http://localhost:3100/examples/comment-mode`.

Completion threshold:
- The comment-mode route permits normal pointer text selection inside the
  read-only editable area while preserving comment-mode behavior.
- Focused browser coverage proves pointer selection in comment mode and that
  read-only editors still reject document edits.
- Safe root-owned bugs found by the repro are fixed in `Plate repo root`; larger
  limitations are listed with exact repro and owner.
- Targeted browser tests, `slate-react` package tests, typecheck, lint, and
  `Plate repo root` fast `bun check` pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-comment-mode-text-selection.md` passes.

Verification surface:
- `packages/slate-react/src/components/editable.tsx`
- `packages/slate-react/src/editable/runtime-before-input-events.ts`
- `packages/slate-react/src/editable/runtime-input-events.ts`
- `packages/slate-react/src/editable/input-router.ts`
- `packages/slate-react/src/editable/model-input-strategy.ts`
- `apps/www/tests/slate-browser/donor/examples/comment-mode.test.ts`
- `apps/www/tests/slate-browser/donor/examples/read-only.test.ts`
- `packages/slate-react/test/**`
- Browser proof on `http://localhost:3100/examples/comment-mode`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: user prompt in this turn plus live comment-mode route.
- Allowed edit scope: `packages/slate-react/**`,
  `apps/www/tests/slate-browser/donor/examples/comment-mode.test.ts`,
  `apps/www/tests/slate-browser/donor/examples/read-only.test.ts`,
  `Plate repo root/.changeset/**`, and this plan.
- Browser surface: `http://localhost:3100/examples/comment-mode`.
- Tracker sync: N/A, no tracker requested.
- Non-goals: comment persistence, Notion-style synced blocks, markdown review
  metadata, or broad comment-mode architecture redesign beyond this regression.

Blocked condition:
- Block only if the route cannot be served locally or the selection model cannot
  represent pointer selection in a read-only editable without a larger
  architecture change; in that case record exact repro and owner.

Task state:
- task_type: browser regression bug
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready_for_complete

Current verdict:
- verdict: complete; read-only editable now means selectable but non-mutating.
- confidence: 0.9
- next owner: none for this regression.
- reason: pointer selection is covered across Chromium, Firefox, mobile, and
  WebKit; read-only mutation checks pass; package and repo checks pass.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-comment-mode-text-selection.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `task`, `debug`, `testing`, `autogoal`, `changeset`, and `autoreview` loaded where they owned gates. |
| Active goal checked or created | yes | Active goal created for the comment-mode selection regression. |
| Source of truth read before edits | yes | User prompt plus `site/examples/ts/comment-mode.tsx`, existing comment-mode Playwright test, and read-only/runtime input files read. |
| Tracker comments and attachments read | no | N/A: no tracker. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: live local regression with direct repro and no matching solution needed. |
| TDD decision before behavior change or bug fix | yes | Added browser regression rows for pointer selection and updated read-only behavior tests. |
| Branch decision for code-changing task | yes | No PR/commit requested; current checkout used as-is. |
| Release artifact decision | yes | Added `.changeset/slate-react-readonly-selection.md` for `slate-react` user-visible behavior change. |
| Browser tool decision for browser surface | yes | Used Playwright against `http://localhost:3100/examples/comment-mode`; browser-use tool was unavailable in this tool context. |
| PR expectation decision | yes | N/A: no PR requested. |
| Tracker sync expectation decision | yes | N/A: no tracker. |
| Browser pack selected | yes | Browser pack selected by goal scratchpad. |
| Browser route / app surface identified | yes | `http://localhost:3100/examples/comment-mode`. |
| Browser tool decision recorded | yes | Playwright route tests and one-off repro probes are the browser proof. |
| Console/network caveat policy recorded | yes | Playwright route tests would fail on runtime page errors; no network-dependent surface. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: browser proof uses the repo-approved browser tool or records a blocker/waiver.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot, trace, or exact verification caveat is ready for final handoff.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Done: run focused route, package, typecheck, lint, and fast repo checks. | Commands listed in Verification evidence passed. |
| Bug reproduced before fix | yes | Done: record failing browser repro. | Before fix, pointer drag in `#comment-mode` produced `selectedText: ""`, `selection:0.0:0|0.0:0`, and active element `comment-mode-document`. |
| Targeted behavior verification | yes | Done: run focused browser tests. | Comment-mode/read-only Playwright matrix passed: 9 passed, 3 intentional exact-range skips. |
| TypeScript or typed config changed | yes | Done: run relevant typecheck. | `Plate repo root`: `bun --filter slate-react typecheck` passed; `bun check` typecheck stages passed. |
| Package exports or file layout changed | no | N/A: no exports or file layout changes. | N/A. |
| Package manifests, lockfile, or install graph changed | no | N/A: no manifest or lockfile change. | N/A. |
| Agent rules or skills changed | no | N/A: no agent/tooling source changed. | N/A. |
| Workspace authority proof | yes | Done: run checks in `Plate repo root`, the owning sibling repo. | All package/browser proof commands ran in `/Users/zbeyens/git/plate-2/Plate repo root`; plan checker ran in root because plan lives there. |
| Browser surface changed | yes | Done: run browser route tests. | Comment-mode pointer selection passes across Chromium, Firefox, mobile, and WebKit. |
| Browser final proof | yes | Done: exact browser verification caveat recorded. | Automated Playwright proof only; no screenshot artifact. |
| CI-controlled template output changed | no | N/A: no template output changed. | N/A. |
| Package behavior or public API changed | yes | Done: add changeset. | `Plate repo root/.changeset/slate-react-readonly-selection.md`. |
| Registry-only component work changed | no | N/A: not registry-only work. | N/A. |
| Docs or content changed | yes | Done: plan only. | This plan records evidence; no public docs changed. |
| High-risk mini gate | yes | Done: record failure mode and boundary. | Risk: contentEditable read-only could leak mutations; proof covers read-only keyboard typing and native input repair path. |
| Agent-native review for agent/tooling changes | no | N/A: no agent/tooling changes. | N/A. |
| Local install corruption suspected | no | N/A: failures matched real test contracts and were fixed. | N/A: reinstall not run. |
| Autoreview for non-trivial implementation changes | yes | Attempted and blocked by review helper timeout. | `/opt/homebrew/bin/timeout 180 ... autoreview --mode local --no-web-search ...` exited 124 with no output. |
| PR create or update | no | N/A: no PR requested. | N/A. |
| PR proof image hosting | no | N/A: no PR body. | N/A. |
| Tracker sync-back | no | N/A: no tracker. | N/A. |
| Final handoff contract | yes | Done: fields below filled. | Final response summarizes fix, proof, and autoreview blocker. |
| Final lint | yes | Done: run formatter and lint. | `Plate repo root`: `bun lint:fix` and `bun lint` passed. |
| Goal plan complete | yes | Done. | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-comment-mode-text-selection.md` passed. |
| Browser interaction proof | yes | Done: exercise route interactions. | Playwright pointer selection tests passed. |
| Browser console/network check | yes | Done by test failure policy. | Local route tests are not network-dependent. |
| Browser final proof artifact | yes | Done: exact caveat recorded. | Automated Playwright proof only; no screenshot artifact. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Source prompt, example, existing tests, runtime input/selection ownership files read. | implementation complete |
| Implementation | complete | Read-only editable remains contentEditable with `aria-readonly`; beforeinput/input paths block read-only mutation. | verification complete |
| Verification | complete | Browser matrix, package tests, typecheck, lint, and `bun check` passed. | closeout complete |
| PR / tracker sync | complete | N/A: no PR, commit, push, or tracker requested. | final response |
| Closeout | complete | Plan evidence recorded; checker run before final. | final response |

Findings:
- Existing `comment-mode` coverage cheated with a programmatic DOM range; it did
  not prove real pointer selection.
- Before the fix, pointer drag in `#comment-mode` selected no native text and
  left Slate selection collapsed at `0.0:0|0.0:0`.
- Root cause: read-only `<Editable>` rendered `contentEditable={false}`. That
  blocks the native editing surface needed for browser text selection in this
  route.
- Secondary bug exposed by Firefox: once read-only uses `contentEditable=true`,
  the native input repair path must not treat read-only DOM input as real model
  input.

Decisions and tradeoffs:
- Fix `slate-react` read-only semantics, not the comment-mode example. Comment
  mode should consume a selectable read-only editor.
- Keep read-only editors focusable/selectable with `contentEditable=true`,
  `role="textbox"`, and `aria-readonly="true"`.
- Block mutations in beforeinput and native input fallback paths. This preserves
  selection without letting read-only document content change.
- Keep the exact comment workflow test Chromium-only because it depends on a
  programmatic exact range; the real pointer selection row runs across all
  configured projects.

Implementation notes:
- `EditableDOMRoot` always renders a native editable surface and marks read-only
  mode with `aria-readonly`.
- `runtime-before-input-events.ts` prevents read-only beforeinput from mutating
  the DOM.
- `input-router.ts` and `runtime-input-events.ts` make native DOM input respect
  read-only instead of invoking DOM repair as model input.
- `model-input-strategy.ts` returns a force-render repair only when read-only
  DOM text has diverged from model text.
- `comment-mode.test.ts` adds a real pointer selection row.
- `read-only.test.ts` now asserts the new contract: focus/select allowed,
  typing blocked.

Review fixes:
- No autoreview findings were produced because the helper timed out.
- Package tests caught stale read-only `contenteditable=false` expectations and
  a too-broad read-only force-render repair; both were fixed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Plain Node Playwright import failed | 1 | Use repo Bun/Playwright path | Repro succeeded with `bun` and `@playwright/test`. |
| Firefox read-only test mutated DOM via `keyboard.insertText` without DOM events | 1 | Use real key events and guard native input path | Test uses `keyboard.type`; native input path now respects read-only. |
| Autoreview helper silent timeout | 1 | Record review blocker and rely on direct checks | Bounded 180s run exited 124 with no output. |

Verification evidence:
- `Plate repo root`: one-off repro before fix returned `selectedText: ""`,
  `selectionLabel: "selection:0.0:0|0.0:0"`, active element
  `comment-mode-document`.
- `Plate repo root`: one-off proof after fix returned selected text
  `Comment mode in Slate v`, `selection:0.0:0|0.0:23`,
  `contentEditable: "true"`, and `ariaReadonly: "true"`.
- `Plate repo root`: one-off typing proof after fix showed comment-mode text did
  not include `XXX` and read-only writes stayed `0`.
- `Plate repo root`: `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/read-only.test.ts playwright/integration/examples/comment-mode.test.ts` passed: 9 passed, 3 skipped.
- `Plate repo root`: `bun --filter slate-react test:vitest` passed: 43 files,
  406 tests.
- `Plate repo root`: `bun --filter slate-react typecheck` passed.
- `Plate repo root`: `bun lint:fix` passed.
- `Plate repo root`: `bun lint` passed.
- `Plate repo root`: `bun check` passed.
- `/Users/zbeyens/git/plate-2`: `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-comment-mode-text-selection.md` passed.
- Cleanup scan found no new `console.log`, `test.only`, `.only(`, or
  `debugger`; only the pre-existing android debug comment matched.

Final handoff contract:
- PR line: no PR, commit, or push requested.
- Issue / tracker line: no tracker requested.
- Confidence line: high for the selection/read-only fix; autoreview tool did
  not complete.
- Flow table:
  - Reproduced: pointer drag failed before fix with empty native and Slate
    selection.
  - Verified: pointer drag now selects text, comment button enables, and typing
    into read-only editors does not mutate content.
- Browser check: Playwright on comment-mode and read-only routes across
  configured projects.
- Outcome: comment-mode users can select text in the read-only comment editor
  and still cannot edit the document through that editor.
- Caveat: exact programmatic comment workflow remains Chromium-only because
  Firefox/mobile/WebKit do not provide stable exact-range behavior for that
  synthetic helper; real pointer selection is covered cross-browser.
- Design:
  - Chosen boundary: `slate-react` read-only editable/input semantics.
  - Why not quick patch: adding example-local handlers would leave every other
    read-only editor unselectable.
  - Why not broader change: the regression only needed selectable read-only
    semantics and mutation guards, not comment architecture redesign.
- Verified: see verification evidence.

Final handoff / sync:
- PR: N/A, no PR requested.
- Issue / tracker: N/A, no tracker requested.
- Browser proof: automated Playwright route proof; no screenshot artifact.
- Caveats: autoreview helper timed out with no output.

Timeline:
- 2026-05-26T12:43:41.033Z Goal plan created.
- 2026-05-26T15:00:00Z Browser repro proved pointer selection failed in
  comment mode.
- 2026-05-26T15:05:00Z Read-only editable changed to selectable/non-mutating.
- 2026-05-26T15:15:00Z Browser and read-only regression tests updated.
- 2026-05-26T15:30:00Z Package, browser, lint, typecheck, and `bun check`
  verification passed.
- 2026-05-26T15:35:00Z Autoreview timed out and was recorded as blocker.
- 2026-05-26T15:40:00Z Autogoal completion checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete; final response next. |
| Where am I going? | Run the mechanical autogoal checker, mark the active goal complete, and hand off. |
| What is the goal? | Fix comment-mode pointer text selection while preserving read-only document safety. |
| What have I learned? | Read-only must stay selectable but block beforeinput/native input mutation. |
| What have I done? | Fixed `slate-react` read-only selection/input semantics, added tests, changeset, and verification. |

Open risks:
- Autoreview did not finish; all direct package/browser gates passed.
- The exact programmatic comment workflow test remains Chromium-only by design;
  real user pointer selection is cross-browser covered.
