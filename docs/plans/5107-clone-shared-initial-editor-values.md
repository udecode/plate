# Clone shared initial editor values

Objective:
Fix #5107 shared initial-value crash; done when focused repro passes after fix and package checks/review pass; plan docs/plans/5107-clone-shared-initial-editor-values.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5107-clone-shared-initial-editor-values.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: public GitHub bug issue
- id / link: #5107 / https://github.com/udecode/plate/issues/5107
- title: Multiple Editable voids with a set value gives path error (since update from v52->53)
- acceptance criteria: Multiple independent Plate editors can initialize from
  the same preset `value` object without sharing Slate node identity or throwing
  `Unable to find the path for Slate node`.
- caveats: The reporter's editor-ID theory is unproven; later comments narrow
  the trigger to distinct editor instances initialized from the same object.
- likely surface: `@platejs/core/react` editor creation/value initialization and its
  focused React tests; no public route is required unless lower-level proof
  cannot observe the crash.
- likely root-cause layer: initial value ownership at editor creation, before
  DOM path lookup/decorations expose the duplicate node identity.

Timed checkpoint:
- requested duration: N/A; none requested
- semantics: N/A
- initial confidence score: N/A; binary regression proof is stronger
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- A focused behavior-level repro fails on the pre-fix implementation and passes
  after the fix for two independently created editors sharing one input value.
- The owning package's focused tests, source-first typecheck, and lint pass; a
  package changeset is present if published package code changes; structured
  autoreview has zero accepted/actionable findings; PR and issue are synced.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5107-clone-shared-initial-editor-values.md` passes.

Verification surface:
- Focused `@platejs/react` test exercising shared initial input across distinct
  editors, first red and then green.
- Source-first package typecheck and repo lint fix in
  `/Users/zbeyens/git/plate`.
- Structured autoreview on the actual diff, PR body readback, and GitHub issue
  sync-back.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: GitHub issue #5107 body and both reporter comments, then the
  dedicated branch from `origin/main` at the recorded SHA.
- Allowed edit scope: the canonical editor creation/value owner, one focused
  regression test, required changeset, this plan, and shipping metadata.
- Browser surface: The issue's validity is fully observable in the React test;
  repo package policy additionally requires a smoke check on the editable-voids
  docs route.
- Tracker sync: create/update a verified PR, then comment on #5107 with QA proof.
- Non-goals: editable-void-specific ID work, caller-side cloning, broad editor
  API redesign, docs or registry UI changes.

Output budget strategy:
- Use owner-scoped `rg` filenames/counts first, exact-file `sed` reads, focused
  test commands, and explicit output caps. Exclude generated output,
  `node_modules`, build artifacts, and templates from broad scans.

Blocked condition:
- Stop only if every applicable repro level is blocked, required GitHub/package
  access is unavailable, or three distinct in-scope attempts hit the same
  external blocker with no autonomous alternative.

Task state:
- task_type: ordinary one-shot regression bug
- task_complexity: normal / non-trivial / measurable
- current_phase: verification
- current_phase_status: complete
- next_phase: PR and tracker sync
- goal_status: active

Current verdict:
- verdict: valid
- confidence: high after exact executable repro
- next owner: `usePlateEditor` static-value ownership boundary
- reason: Focused React render fails with the exact `slate-dom` path error and
  `use-decorations` stack when two hook-created editors receive one value tree.

Pre-solution issue challenge:
- reporter claim: Two independent editors initialized from the same preset
  value crash with a Slate path lookup error; one editor or distinct input
  objects do not.
- suggested diagnosis or fix: Initial editor values may retain shared object
  identity; the earlier editor-ID theory was withdrawn. No concrete fix was
  supplied.
- repro ladder:
  - tests / source-level repro: reproduced exactly with
    `bun test packages/core/src/react/editor/usePlateEditor.spec.tsx`; one test
    fails with `Unable to find the path for Slate node` from Slate React's
    `use-decorations` layout effect
  - Playwright / automated browser: N/A for issue validity because the focused
    real React render observes the full reported runtime path
  - Browser plugin: N/A for issue validity because the focused real React render
    observes the full reported runtime path; package handoff proof remains
    separately required by repo policy
  - screenshot / visual proof: N/A; no layout, selection, native dialog, or
    visual state claim
- reproduction verdict: reproduced
- validity verdict: valid; editable-void/ID framing rejected as too narrow
- best long-term fix boundary: `usePlateEditor`, which turns caller-owned static
  React configuration into an editor-owned mutable tree while leaving the
  imperative `createPlateEditor` reference contract intact
- harsh honest feedback: The ID theory is noise; distinct editor IDs cannot make
  one object safely belong to two mutable Slate trees. The shared-reference
  trigger is proven and belongs at the hook's ownership boundary.
- hard-stop decision: cleared; exact focused repro failed for the reported reason

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5107-clone-shared-initial-editor-values.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | `task`, `autogoal`, `autoreview`, `tdd`, `changeset`, and bundled Browser skill read; video/testing/major skills N/A |
| Active goal checked or created | yes | Active goal created for this exact objective |
| Source of truth read before edits | yes | `gh issue view 5107 --comments --json ...` read before source exploration |
| Tracker comments and attachments read | yes | Both reporter comments read; no attachments or recordings present |
| Video transcript evidence required | no | N/A: issue contains code only, no video/screen recording |
| Pre-solution issue challenge required | yes | Public regression and technical diagnosis; challenge rows recorded above |
| Reproduction verdict before implementation | yes | Exact focused React repro fails with the reported Slate node path error |
| Repro escalation ladder selected | yes | Focused package/React repro first; browser levels are conditional as recorded above |
| Suggested fix reviewed against durable boundary | yes | ID theory rejected; value ownership boundary selected for proof |
| TDD decision before behavior change or bug fix | yes | One behavior-level red test before implementation, then minimal green fix |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read reusable-value and initial-value-transform learnings; prior docs workaround clones per editor, confirming the ownership failure while leaving the package boundary open |
| Branch decision for code-changing task | yes | Unrelated open PR #5109 detected on `templates/release-sync-failure`; switched before code edits to `codex/fix-shared-editor-initial-value` from `origin/main` at `bc7104f7dd009a0c2da78cffaee1108b4c430f46` |
| Release artifact decision | yes | Changeset required if published `packages/**` behavior changes; registry changelog N/A |
| Browser tool decision for browser surface | yes | Exact issue repro is React-test owned; repo package policy closed with bundled Browser on `/docs/examples/editable-voids` |
| PR expectation decision | yes | Task tracker workflow requires verified PR before issue sync |
| Tracker sync expectation decision | yes | Comment on #5107 after verified PR exists |
| Output budget strategy recorded | yes | Owner-scoped searches/read caps recorded above |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] For public tracker bug reports, behavior claims, technical diagnoses, or
      suggested fixes, reporter claims are challenged before implementation
      with a recorded verdict: `valid`, `not reproduced`, `invalid`,
      `wont-fix`, `partially valid`, or `platform limitation`. Feature, docs,
      support, or cleanup requests with no bug claim may mark reproduction
      `N/A` with reason.
- [x] Repro escalation ladder followed for bug/behavior claims: focused
      test/source-level repro first when applicable; existing repo-owned
      Playwright regression/test harness next when available and useful as
      executable coverage; do not use standalone Playwright, Puppeteer, or raw
      DevTools as a substitute for the repo Browser policy;
      `[@Browser](plugin://browser@openai-bundled)` next when tests or
      Playwright cannot reproduce or cannot model the surface honestly;
      screenshot or explicit visual-proof waiver when visual/native state
      matters.
- [x] Hard-stop rule followed for bug/behavior claims: no code when the issue
      is not reproduced, invalid, or won't-fix; partial validity pivots to the
      best long-term fix and records what was wrong or incomplete in the issue's
      proposed path.
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
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Focused red/green repro, 852 core tests, source-first core typecheck, full `pnpm check`, browser interaction, and clean autoreview recorded below |
| Pre-solution issue challenge verdict | yes | Record reporter claim, suggested fix, repro verdict, validity verdict, durable boundary, and hard-stop/pivot decision before implementation | Valid bug; ID/editable-void framing rejected; exact path error reproduced before implementation; hook boundary selected |
| Repro escalation ladder | yes | For bug/behavior claims, record test/source-level, Playwright, Browser, and screenshot/visual-proof outcomes or N/A/blocker reasons before `not reproduced` | Focused real React render reproduced exact stack; repo-owned Playwright N/A; Browser used for package smoke; screenshot N/A because no visual claim |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | RED command failed 0 pass / 1 fail with the exact reported `Unable to find the path` error |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | GREEN focused command passed 1/1; core package passed 852/852 |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./packages/core` passed 5/5 tasks; full check typecheck passed 54/54 packages |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: only implementation and test file added; no exported/public file or barrel layout changed |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest, lockfile, or dependency change; lodash already belongs to core |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent rule or skill change |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in `/Users/zbeyens/git/plate`; Browser used local www route from that checkout; GitHub sync remains pending |
| Browser surface changed | yes | Capture Browser Use proof or record explicit waiver/blocker | Final bundled Browser run loaded `/docs/examples/editable-voids`, found 2 editable roots, entered nested text, and logged zero errors |
| Browser final proof | yes | Attach screenshot or exact browser verification caveat when browser proof applies | Interaction/console proof recorded; screenshot N/A because no layout or visual-state claim |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` change; final status lists only four intended files |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | `.changeset/fix-shared-editor-values.md` gives `@platejs/core` a patch release note |
| User-visible registry output changed | no | Use the registry-changelog pack: add/update `apps/www/src/registry/changelog/entries/*.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --check`, or record N/A | N/A: no registry source change; route used only as browser smoke |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for supporting public docs/content/API/example changes, load `docs-creator` and close the docs pack; for typo/link-only edits, record the explicit reason and proportional proof | N/A: only internal task plan changed, no public docs/content/API/example |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: cloning all initial arrays could alter lower-level reference semantics or editor rendering. Proof: existing creator reference test plus core/full suites and browser smoke. Boundary: React hook clones static configuration once; imperative creator and value factories remain unchanged. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling surface changed |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no invalid hook, mixed React, or unrelated persistent install failure; temporary dev errors came from concurrent full rebuild and disappeared after stable restart |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | `.agents/skills/autoreview/scripts/autoreview --mode local --parallel-tests "pnpm check" --stream-engine-output` exited clean with zero findings and 0.84 confidence |
| PR create or update | pending | Run `check` before PR work and sync PR body to the task-style final handoff | pending |
| Task-style PR body verified | pending | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | pending |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no screenshot needed for non-visual behavior; PR will use command/interaction proof |
| Tracker sync-back | pending | Post concise issue/Linear sync after PR exists, or record N/A/blocker | pending |
| Final handoff contract | pending | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | pending |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` passed; formatted the new test; subsequent `pnpm check` lint passed with one pre-existing sidebar warning and zero errors |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Searches/reads were scoped; stopping the concurrently rebuilding dev server emitted oversized buffered logs once, tool truncated them, and recovery used a stable restart plus 4k caps with no further broad output |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5107-clone-shared-initial-editor-values.md` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | issue/comments, rules, current owners, prior learning, Slate source, exact red repro | implementation |
| Implementation | complete | static arrays cloned once inside `usePlateEditor`; focused test green; patch changeset added | verification |
| Verification | complete | 852 core tests, focused test, package/full typecheck, lint, full check, browser smoke, and autoreview all clean | PR / tracker sync |
| PR / tracker sync | pending | | final response |
| Closeout | pending | | final response |

Findings:
- No video or screenshot evidence exists.
- The reporter's second and third examples isolate the trigger to distinct
  editor instances receiving the same `value` object, not editable void IDs.
- Current `init` assigns direct/static values to `editor.children` by reference;
  current `createPlateEditor` tests deliberately preserve that imperative API
  identity.
- The reusable-doc-values learning proves the same Slate failure class and used
  caller-side cloning as an app workaround. The hook remains the better product
  owner because its documented initial-value API does not warn that values are
  single-editor consumables.
- Slate React stores node parent/index metadata in process-wide WeakMaps keyed
  by node object. Rendering the same tree under two editor roots overwrites the
  root parent mapping, so `ReactEditor.findPath(editorA, sharedNode)` walks to
  editor B and throws.
- Focused repro output matches the issue: `Unable to find the path for Slate
  node` from `slate-dom` during Slate React `use-decorations` layout effects.

Decisions and tradeoffs:
- Test the public editor-creation behavior through real editor instances before
  choosing any clone mechanism; avoid asserting private helper calls.
- Skip browser proof if the focused React/package test reproduces the exact
  runtime error because there is no browser-specific or visual claim.
- Preserve `createPlateEditor`'s explicit by-reference behavior; first test
  whether `usePlateEditor` can isolate static input values at the React hook
  boundary without changing the lower-level imperative creator contract.

Implementation notes:
- `usePlateEditor` deep-clones only array-valued static configuration before
  calling `createPlateEditor`.
- HTML strings and value factories keep their prior behavior; lower-level
  `createPlateEditor` continues using direct value references.

Review fixes:
- Structured autoreview accepted zero findings; no review-triggered edits.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Dev server ran during full package rebuild, temporarily losing `@platejs/markdown` dist and emitting oversized buffered output on shutdown | 1 | Stop concurrent server/build use; restart only after full check with 4k output caps | Stable restart served editable-voids 200; final browser interaction passed with zero errors |

Verification evidence:
- command, cwd `/Users/zbeyens/git/plate`: focused RED test -> 0 pass / 1 fail,
  exact Slate path error.
- command, same cwd: focused GREEN test -> 1 pass / 0 fail.
- command, same cwd: `pnpm --filter @platejs/core test` -> 852 pass / 0 fail.
- command, same cwd: `pnpm turbo typecheck --filter=./packages/core` -> 5/5
  tasks passed.
- command, same cwd: `pnpm lint:fix` -> passed; one new test formatted.
- command/review, same cwd: autoreview local with parallel `pnpm check` -> zero
  findings; full check exit 0 including 54-package build/typecheck and all
  fast/slow/slowest tests.
- browser, local www: `/docs/examples/editable-voids` -> HTTP 200, 2 editable
  roots, nested editor accepted `Nested editor final proof`, zero console errors.
- source audit: final status contains only implementation, regression test,
  changeset, and this plan; `git diff --check` passed.

Final handoff contract:
- PR line: pending
- Issue / tracker line: pending
- Confidence line: pending
- Flow table:
  - Reproduced: tests pending, browser pending
  - Verified: tests pending, browser pending
- Browser check: pending
- Outcome: pending
- Caveat: pending
- Design:
  - Chosen boundary: pending
  - Why not quick patch: pending
  - Why not broader change: pending
- Verified: pending
- PR body verified: pending

Task-style PR body contract:
- Preserve any existing `<!-- auto-release:start -->` block. If a changeset is
  part of the diff and repo policy expects auto release, include that block.
- Use the accepted kitcn PR #270 visual format. The body starts with an emoji
  issue/tracker/fix line, for example `🐛 Fixes #123` or `🐛 Fixes ➖ N/A`, then
  an emoji confidence line like `🟢 95-100% confidence`.
- Use this exact table header: `| Phase | 🧪 Tests | 🌐 Browser |`.
- Use `Reproduced` and `Verified` rows. Mark passing proof with `🟢`, repro or
  failing proof with `🔴`, and non-applicable cells with `➖ N/A`.
- Use bold emoji section headings: `**✅ Outcome**`, `**⚠️ Caveat**`,
  `**🏗️ Design**`, and `**🧪 Verified**`.
- Never include a line that links to the current PR itself. The current PR URL
  belongs in the final response, not in its own description.
- Do not replace this with a generic `Summary` / `Verification` PR body, an
  adaptive prose body from a git helper skill, plain `## Outcome` sections, or
  an unrelated generated badge footer unless the caller or repo template
  explicitly asks for it.
- Proof is `gh pr view --json body` output or a concise source-backed summary
  of that output.

Final handoff / sync:
- PR: pending
- Issue / tracker: pending
- Browser proof: pending
- Caveats: pending

Timeline:
- 2026-08-24T14:09:22.256Z Task goal plan created.
- 2026-08-24 Source issue #5107, both comments, and governing skill contracts read; one-shot goal created and task requirements extracted.
- 2026-08-24 Moved from unrelated open PR #5109 to dedicated branch `codex/fix-shared-editor-initial-value` before code edits; read current init, tests, local learnings, and Slate WeakMap ownership source.
- 2026-08-24 RED: `bun test packages/core/src/react/editor/usePlateEditor.spec.tsx` failed 0 pass / 1 fail with the exact reported path error.
- 2026-08-24 GREEN: hook cloned static arrays and focused regression passed 1/1; core suite passed 852/852; package typecheck passed.
- 2026-08-24 Final lint, full `pnpm check`, stable browser smoke, and structured autoreview all passed; autoreview reported zero findings.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Verified implementation, ready for PR and issue sync |
| Where am I going? | Commit/push, create and verify task-style PR, sync #5107, close goal |
| What is the goal? | Fix #5107 shared initial-value crash with red/green proof and clean package/review gates |
| What have I learned? | See Findings |
| What have I done? | Implemented static-value isolation; closed focused, package, full check, browser, lint, changeset, and autoreview proof |

Open risks:
- Residual: static array values pay one deep clone per hook-created editor. This
  is intentional startup ownership cost; value factories remain available when
  callers need custom per-editor construction.
