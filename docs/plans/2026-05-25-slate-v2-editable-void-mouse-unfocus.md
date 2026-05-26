# Slate v2 editable void mouse unfocus

Objective:
Fix the `.tmp/slate-v2` editable-void child-root mouse unfocus regression: when focus is inside a same-runtime editable void child root, clicking a parent editor paragraph or empty parent block must move focus and selection to the parent root and clear the child-root selection, without regressing child-root click, paste, drop, or keyboard navigation.

Goal plan:
docs/plans/2026-05-25-slate-v2-editable-void-mouse-unfocus.md

Task source:
- type: user bug report
- id / link: chat prompt on 2026-05-25
- title: Editable void child root cannot unfocus by mouse click outside it
- acceptance criteria: reproduce the mouse unfocus failure, add Playwright coverage for outside clicks, fix ownership at the reusable Slate React boundary, verify full editable-voids Chromium route, run relevant package gates, add release note, run autoreview.

Completion threshold:
- Close only after the new Playwright repro fails before the fix and passes after it.
- Close only after the full `editable-voids.test.ts` Chromium route passes against rebuilt `slate-react` dist.
- Close only after `slate-react` resolver unit coverage, package typecheck, site typecheck, lint, changeset, autoreview, and this autogoal completion check are clean.

Verification surface:
- `bun --filter ./packages/slate-react test:vitest -- root-interaction-resolver`
- `bun --filter ./packages/slate-react typecheck`
- `bun typecheck:site`
- `bun --filter ./packages/slate-react build`
- `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/editable-voids.test.ts --project=chromium`
- `bun lint`
- `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local`
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-slate-v2-editable-void-mouse-unfocus.md`

Constraints:
- Do not use git branch/status hygiene.
- Work in `.tmp/slate-v2` for code, tests, package build, and browser proof.
- Keep the fix at the reusable Slate React focus/selection ownership boundary.
- Do not create a PR, commit, or push.

Boundaries:
- Source of truth: user bug report plus the existing editable-voids route behavior.
- Allowed edit scope: `.tmp/slate-v2/packages/slate-react`, `.tmp/slate-v2/playwright/integration/examples/editable-voids.test.ts`, `.tmp/slate-v2/.changeset`, and this goal plan.
- Browser surface: `/examples/editable-voids` via repo Playwright Chromium integration.
- Tracker sync: N/A, no tracker item.
- Non-goals: broad API redesign, manual browser exploration after Playwright proof, unrelated local diff cleanup.

Blocked condition:
Blocked only if the editable-voids route cannot be built or run locally after ruling out a code-caused failure, or if the correct focus ownership boundary requires a user-approved public API change.

Task state:
- task_type: bug fix
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active until completion check and tool close

Current verdict:
- verdict: fixed
- confidence: high
- next owner: user
- reason: failing mouse-unfocus repro now passes, full route and package gates pass, autoreview reports no accepted/actionable findings.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `task`, `tdd`, `autogoal`, `changeset`, and `autoreview` guidance. |
| Active goal checked or created | yes | Active goal created for editable-void child-root mouse unfocus. |
| Source of truth read before edits | yes | User bug report plus editable-voids test/example/source read. |
| Tracker comments and attachments read | no | N/A: chat bug report, no tracker item. |
| Video transcript evidence required | no | N/A: no video attachment. |
| `docs/solutions` checked for existing-code work | no | N/A: direct local regression with existing nearby tests and controllers. |
| TDD decision before behavior change | yes | Added failing Playwright repro before implementation; fixed after red result. |
| Branch decision for code-changing task | yes | N/A: no branch/PR requested; no git hygiene performed. |
| Release artifact decision | yes | Added `.changeset/fix-editable-void-mouse-unfocus.md` for `slate-react` patch. |
| Browser tool decision | yes | User requested Playwright coverage; repo-owned Chromium integration used. |
| PR expectation decision | yes | N/A: no PR requested. |
| Tracker sync expectation decision | yes | N/A: no tracker item. |
| Browser pack selected | yes | Browser pack applies because route interaction is the proof surface. |
| Browser route / app surface identified | yes | `/examples/editable-voids`, `editable-voids.test.ts`, Chromium project. |
| Console/network caveat policy recorded | yes | Playwright route proof used; manual console/network sweep is out of scope for this regression. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, title, task type, acceptance criteria, caveats, likely files/routes/packages, browser surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or N/A with reason.
- [x] Final handoff shape decided: bug fix with tests, package gates, browser proof, changeset, autoreview.
- [x] Branch handling recorded for code-changing work: N/A, no PR/commit requested.
- [x] Local-env-rot retry policy recorded: N/A, no surprising install-corruption failure.
- [x] Workspace authority recorded: verification commands run in `.tmp/slate-v2`, plan/check in root `plate-2`.
- [x] High-risk note recorded for runtime/browser behavior.
- [x] Review/autoreview target selected from actual diff state.
- [x] Agent-native review decision recorded: N/A, no agent/tooling files changed.
- [x] Browser pack: route, interaction path, and expected visible outcome recorded before proof.
- [x] Browser pack: browser proof uses repo Playwright Chromium because user requested Playwright regression coverage.
- [x] Browser pack: console and network errors checked or explicitly out of scope.
- [x] Browser pack: trace or exact verification caveat ready for final handoff.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run all named commands | All listed verification commands passed except this check, which runs after this edit. |
| Bug reproduced before fix | yes | Record failing test/repro | New Playwright test failed before fix with child root retaining focus/selection after parent click. |
| Targeted behavior verification | yes | Run focused test | Focused Chromium test `unfocuses editable void child root when clicking outside it` passed after fix. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `bun --filter ./packages/slate-react typecheck` and `bun typecheck:site` passed. |
| Package exports or file layout changed | no | N/A | No exports or file layout changed. |
| Package manifests, lockfile, or install graph changed | no | N/A | No manifest or lockfile changed. |
| Agent rules or skills changed | no | N/A | No agent rule/skill files changed. |
| Workspace authority proof | yes | Run proof in owning workspace | Code/test/browser commands run in `/Users/zbeyens/git/plate-2/.tmp/slate-v2`. |
| Browser surface changed | yes | Run browser route proof | Full editable-voids Chromium route passed: 20 tests. |
| Browser final proof | yes | Record artifact/caveat | Playwright pass count and failing trace before fix recorded; no manual screenshot needed. |
| CI-controlled template output changed | no | N/A | No template output touched. |
| Package behavior or public API changed | yes | Add changeset | `.changeset/fix-editable-void-mouse-unfocus.md` added for `slate-react` patch. |
| Registry-only component work changed | no | N/A | No registry work. |
| Docs or content changed | no | N/A | Only goal ledger changed; no user docs. |
| High-risk mini gate | yes | Record failure mode and proof | Risk: parent root could steal child-root clicks; resolver unit added and full route passed. |
| Agent-native review for agent/tooling changes | no | N/A | No agent/tooling changes. |
| Local install corruption suspected | no | N/A | No env-rot signature. |
| Autoreview for non-trivial implementation changes | yes | Run autoreview local | Autoreview clean: no accepted/actionable findings. |
| PR create or update | no | N/A | No PR requested. |
| PR proof image hosting | no | N/A | No PR body. |
| Tracker sync-back | no | N/A | No tracker item. |
| Final handoff contract | yes | Fill final fields | Fields below completed. |
| Final lint | yes | Run lint | `bun lint` passed after changeset. |
| Goal plan complete | yes | Run completion checker | To run after this ledger update. |
| Browser interaction proof | yes | Exercise target route/interaction | `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/editable-voids.test.ts --project=chromium` passed. |
| Browser console/network check | no | N/A | Regression proof is route interaction; manual console/network sweep out of scope. |
| Browser final proof artifact | yes | Record proof | Playwright Chromium full-route pass recorded. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | User report, editable-voids tests/example, root interaction and selection controllers read | implementation |
| Implementation | complete | Root interaction controller attached to Editable roots; resolver ignores nested editors from parent roots; test and changeset added | verification |
| Verification | complete | Unit, typecheck, lint, build, focused repro, full Chromium route passed | closeout |
| PR / tracker sync | not_applicable | No PR/tracker requested | final response |
| Closeout | complete | Autoreview clean; plan updated for completion check | final response |

Findings:
- Parent editable roots had no root-interaction capture recovery, so when a nested child root owned focus, a mouse click in the parent root could leave DOM/model selection in the child root.
- Attaching the existing root-interaction controller to Editable roots fixes the reusable boundary.
- Resolver must treat nested editors as interactive descendants when the current target is an editable root, or parent roots would steal child-root clicks.

Decisions and tradeoffs:
- Chosen boundary: reusable Slate React root interaction, not a site example workaround.
- Why not quick patch: changing only editable-voids example would not fix other nested-root surfaces.
- Why not broader change: no public API change needed; existing controller already models the focus recovery behavior.

Implementation notes:
- `EditableDOMRoot` composes root-interaction capture handlers with user capture handlers.
- `resolveRootInteractionTarget` now ignores nested editor clicks from parent editable roots.
- Playwright coverage clicks both a visible parent paragraph and an empty parent block after focusing the child root.

Review fixes:
- Lint found a React Compiler memoization dependency issue; destructured root interaction handlers fixed it.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Test used nonexistent `outer.selection.clickTextOffset` helper | 1 | Use scenario `clickTextOffset` on the outer harness | Fixed test shape. |
| Initial repro clicked only empty trailing block | 1 | Use visible paragraph first, then add empty-block variant after fix | Both variants now covered. |
| Lint rejected memo deps | 1 | Destructure controller callbacks before `useMemo` | `bun lint` passed. |

Verification evidence:
- Red repro: focused Playwright test failed before implementation with outer editor inactive and child selection retained.
- `bun --filter ./packages/slate-react test:vitest -- root-interaction-resolver`: passed, 1 file, 5 tests.
- `bun --filter ./packages/slate-react typecheck`: passed.
- `bun typecheck:site`: passed.
- `bun --filter ./packages/slate-react build`: passed.
- Focused Playwright repro: passed after fix.
- Full editable-voids route: `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/editable-voids.test.ts --project=chromium` passed, 20 tests.
- `bun lint`: passed.
- Autoreview: `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local` passed with no accepted/actionable findings.

Open risks:
- None known after focused repro, full editable-voids route, typecheck, lint, unit, build, changeset, and autoreview.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker item.
- Confidence line: high; the exact reported mouse-unfocus regression is covered and the neighboring editable-voids route is green.
- Flow table:
  - Reproduced: Playwright Chromium test failed before fix.
  - Verified: focused repro passed, full route passed, package gates passed.
- Browser check: Playwright Chromium `/examples/editable-voids`, 20 tests passed.
- Outcome: fixed in Slate React root interaction ownership.
- Caveat: manual browser console/network sweep was out of scope because user requested Playwright regression coverage.
- Design:
  - Chosen boundary: `EditableDOMRoot` root interaction plus resolver nested-editor guard.
  - Why not quick patch: example-only patch would miss other same-runtime child roots.
  - Why not broader change: no new API or schema concept was required.
- Verified: unit, typecheck, build, lint, focused browser repro, full browser route, autoreview.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: Playwright Chromium full route passed.
- Caveats: no manual browser screenshot; Playwright trace artifacts are generated on failure and focused/full route pass is the proof.

Timeline:
- 2026-05-25T19:07:52.922Z Task goal plan created.
- 2026-05-25T19:12Z Failing Playwright repro captured.
- 2026-05-25T19:19Z Full editable-voids Chromium route passed after fix.
- 2026-05-25T19:21Z Autoreview passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete; completion checker is the only remaining mechanical gate. |
| Where am I going? | Run completion checker, close the active goal, respond to user. |
| What is the goal? | Fix editable-void child-root mouse unfocus and prove it with Playwright and package gates. |
