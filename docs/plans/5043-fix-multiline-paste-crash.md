# Fix multiline paste crash

Objective:
Fix issue #5043 without weakening maxLength; done when crash and empty-block
overflow regressions pass, package checks and autoreview are clean, and PR
ships.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5043-fix-multiline-paste-crash.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: public GitHub bug
- id / link: #5043 / https://github.com/udecode/plate/issues/5043
- title: `[Bug]: pasting text with multiple line-breaks crashes`
- acceptance criteria: multiline plain-text paste past `maxLength` does not
  throw; final document text never exceeds `maxLength`, including fragments
  with empty blocks.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A
- initial confidence score: N/A: exact binary regressions exist
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Faithful Markdown/plain-text paste repro fails on `origin/main` and passes
  after the fix without throwing, producing exactly `maxLength` characters.
- Direct fragments containing overflow text plus empty blocks still converge to
  exactly `maxLength` characters.
- Focused core tests, core source-first typecheck, lint, approved browser proof,
  and structured autoreview pass with zero accepted/actionable findings.
- A patch changeset, task-style PR, and issue sync are published and read back.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5043-fix-multiline-paste-crash.md` passes.

Verification surface:
- `bun test packages/core/src/lib/plugins/length/LengthPlugin.spec.ts`
- `pnpm turbo typecheck --filter=./packages/core`
- `pnpm lint:fix`
- approved Browser tool against a local runnable editor surface, or an exact
  blocker/waiver if the package has no faithful route
- `.agents/skills/autoreview/scripts/autoreview --mode local`
- `gh pr view` and `gh issue view` readback

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: GitHub issue #5043 plus the `LengthPlugin` invariant on
  `origin/main`.
- Allowed edit scope: `packages/core/src/lib/plugins/length/**`, one
  `@platejs/core` patch changeset, this plan, and only directly required test
  fixtures/imports.
- Browser surface: local editor route that can configure `maxLength` and paste
  multiline plain text; public repro is supporting evidence only.
- Tracker sync: create a replacement PR and comment issue #5043 after verified
  code exists.
- Non-goals: public API changes, unrelated clipboard behavior, broad Slate
  transform refactors, or reviving PR #5100.

Output budget strategy:
- Read exact length-plugin, package, plan, and route files; cap searches by
  owner and match count; exclude generated/build/dependency trees; save long
  test/review output to artifacts and inspect only failure/summary slices.

Blocked condition:
- Stop only if the faithful repro cannot be made executable from repo-owned
  APIs, required dependencies remain unusable after the one allowed reinstall,
  or GitHub/browser access prevents mandatory ship/readback proof.

Task state:
- task_type: ordinary tracker-backed runtime bug
- task_complexity: normal, non-trivial and auditable
- current_phase: PR / tracker sync
- current_phase_status: in_progress
- next_phase: closeout
- goal_status: active

Current verdict:
- verdict: verified fix ready to ship
- confidence: 99%
- next owner: PR / tracker sync
- reason: crash, exact text cap, empty overflow block removal, package checks,
  full repo check, browser proof, and final structured review are green.

Pre-solution issue challenge:
- reporter claim: multiline overflow paste crashes while enforcing `maxLength`.
- suggested diagnosis or fix: the issue proposes none. Closed PR #5100 added a
  boolean re-entrancy early return; rejected because empty-block deletion can
  finish at 21 characters for `maxLength: 20`.
- repro ladder:
  - tests / source-level repro: prior exact review repro confirmed the crash;
    current branch will capture it as the TDD red test before implementation.
  - Playwright / automated browser: N/A: the package public API and clipboard
    data path model the failure deterministically; browser proof follows repo
    policy but Playwright adds no missing observation.
  - Browser plugin: required after the focused regression is green.
  - screenshot / visual proof: N/A: crash and character count are behavioral,
    not visual-layout claims; record route and console result instead.
- reproduction verdict: reproduced
- validity verdict: valid, with acceptance tightened to preserve `maxLength`.
- best long-term fix boundary: make `LengthPlugin` trimming converge after
  nested Slate operations instead of disabling all nested enforcement.
- harsh honest feedback: “does not crash” is too weak; a fix that silently
  exceeds `maxLength` is still broken.
- hard-stop decision: proceed with TDD; reject the closed PR's guard shape.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5043-fix-multiline-paste-crash.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | `task`, `autogoal`, `autoreview`, `tdd`, and `changeset` read; Browser skill deferred until proof |
| Active goal checked or created | yes | goal created with this plan path |
| Source of truth read before edits | yes | `gh issue view 5043 --comments` equivalent JSON; zero comments |
| Tracker comments and attachments read | yes | zero comments; linked reproduction commit noted; no video |
| Video transcript evidence required | no | N/A: no video or screen recording |
| Pre-solution issue challenge required | yes | valid; criterion tightened to preserve exact length |
| Reproduction verdict before implementation | yes | reproduced in prior exact review; fresh TDD red required before code |
| Repro escalation ladder selected | yes | public API test first; Browser after green; visual proof waived |
| Suggested fix reviewed against durable boundary | yes | PR #5100 guard rejected after exact 21/20 counterexample |
| `docs/solutions` checked for non-trivial existing-code work | yes | focused search found clipboard boundary guidance but no LengthPlugin solution |
| TDD decision before behavior change or bug fix | yes | one faithful crash test red first; invariant companion coverage retained |
| Branch decision for code-changing task | yes | dedicated `codex/fix-5043-multiline-paste` from fresh `origin/main` |
| Release artifact decision | yes | one `@platejs/core` patch changeset |
| Browser tool decision for browser surface | yes | approved in-app Browser required after green package proof |
| PR expectation decision | yes | task workflow requires replacement PR after `check` |
| Tracker sync expectation decision | yes | comment issue #5043 after PR creation |
| Output budget strategy recorded | yes | exact scoped reads/searches with output caps |
| Browser pack selected | yes | materialized `browser` pack |
| Browser route / app surface identified | yes | local editor surface; exact route selected during narrow app search |
| Browser tool decision recorded | yes | use approved in-app Browser; no standalone browser automation |
| Console/network caveat policy recorded | yes | record paste outcome and console; unrelated network noise called out |
| Package/API pack selected | yes | materialized `package-api` pack for published runtime behavior |
| Public surface or package boundary identified | yes | `@platejs/core` `LengthPlugin` runtime enforcement |
| Release artifact path selected | yes | `.changeset/*.md` for `@platejs/core`: patch |
| `changeset` skill loaded when `.changeset` is required | yes | loaded; one package, imperative user-impact prose, no minor |
| Barrel/export impact decision recorded | yes | N/A: no exports or file layout change planned |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
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
      N/A: no install-corruption signal; stale dist was resolved by required
      artifact build, not reinstall.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling. N/A:
      none touched.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: browser proof uses the repo-approved browser tool or records a blocker/waiver.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot, trace, or exact verification caveat is ready for final handoff.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: package runtime fix.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`. N/A: patch changeset required.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes. N/A: no public shape change.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required. Patch changeset added; barrels N/A.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the command, proof, source audit, or artifact check named in this plan | pending |
| Pre-solution issue challenge verdict | pending | Record reporter claim, suggested fix, repro verdict, validity verdict, durable boundary, and hard-stop/pivot decision before implementation | pending |
| Repro escalation ladder | pending | For bug/behavior claims, record test/source-level, Playwright, Browser, and screenshot/visual-proof outcomes or N/A/blocker reasons before `not reproduced` | pending |
| Bug reproduced before fix | pending | Record failing test/repro or N/A with reason | pending |
| Targeted behavior verification | pending | Run focused test/proof for changed behavior or record N/A | pending |
| TypeScript or typed config changed | pending | Run relevant typecheck | pending |
| Package exports or file layout changed | pending | Run `pnpm brl` before final verification and keep generated barrel updates | pending |
| Package manifests, lockfile, or install graph changed | pending | Run `pnpm install` and relevant package checks | pending |
| Agent rules or skills changed | pending | Run `pnpm install` and verify generated skill sync | pending |
| Workspace authority proof | pending | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | pending |
| Browser surface changed | pending | Capture Browser Use proof or record explicit waiver/blocker | pending |
| Browser final proof | pending | Attach screenshot or exact browser verification caveat when browser proof applies | pending |
| CI-controlled template output changed | pending | Restore generated template output or record why it is intentionally kept | pending |
| Package behavior or public API changed | pending | Add a changeset or record why no changeset applies | pending |
| User-visible registry output changed | pending | Use the registry-changelog pack: add/update `apps/www/src/registry/changelog/entries/*.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --check`, or record N/A | pending |
| Docs or content changed | pending | For docs-heavy work, use `--template docs`; for supporting public docs/content/API/example changes, load `docs-creator` and close the docs pack; for typo/link-only edits, record the explicit reason and proportional proof | pending |
| High-risk mini gate | pending | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | pending |
| Agent-native review for agent/tooling changes | pending | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | pending |
| Local install corruption suspected | pending | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | pending |
| Autoreview for non-trivial implementation changes | pending | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | pending |
| PR create or update | pending | Run `check` before PR work and sync PR body to the task-style final handoff | pending |
| Task-style PR body verified | pending | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | pending |
| PR proof image hosting | pending | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | pending |
| Tracker sync-back | pending | Post concise issue/Linear sync after PR exists, or record N/A/blocker | pending |
| Final handoff contract | pending | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | pending |
| Final lint | pending | Run `pnpm lint:fix` or scoped equivalent | pending |
| Output budget discipline | pending | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | pending |
| Timed checkpoint | pending | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5043-fix-multiline-paste-crash.md` | pending |
| Browser interaction proof | pending | Exercise the target route/interaction with the approved browser tool or record blocker | pending |
| Browser console/network check | pending | Record console/network state or why it is not applicable | pending |
| Browser final proof artifact | pending | Record screenshot/trace/route proof or exact caveat | pending |
| Public API / package boundary proof | pending | Source-audit public API, exports, and package boundary impact | pending |
| Release artifact classification | pending | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | pending |
| Published package changeset | pending | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | pending |
| Registry changelog | pending | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | pending |
| No release artifact | pending | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | pending |
| Package typecheck/build/test | pending | Run owning package checks or record N/A with reason | pending |
| Barrel/export generation | pending | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | issue, skills, owner files, focused solutions search, branch and red repro recorded | implementation |
| Implementation | complete | leaf-scoped convergent trim; exact crash/invariant/structure regressions green | verification |
| Verification | complete | focused 9/9; core typecheck 5/5; browser one block/20 chars/no errors; autoreview clean; `pnpm check` exit 0 | PR / tracker sync |
| PR / tracker sync | in_progress | full check passed; ready to commit/push/create | closeout |
| Closeout | pending | | final response |

Findings:
- Issue #5043 has no comments or video evidence.
- `LengthPlugin` enforces the limit inside its `apply` override and recursive
  deletes re-enter that override.
- Existing tests cover single-block text/fragment truncation only.
- Focused `docs/solutions` search found no existing LengthPlugin fix.

Decisions and tradeoffs:
- Preserve the package API and exact hard limit -> fix convergence inside the
  plugin owner -> avoid caller patches and the broken unconditional early return.
- Use one faithful paste crash test plus one empty-block invariant test -> catch
  both reported failure and the rejected patch's regression without test bloat.

Implementation notes:
- Added per-editor `isTrimming` and `shouldTrimAgain` closure state.
- Nested trim operations apply normally but request one outer recheck; trimming
  deletes only within the current text leaf. At an empty leaf boundary it moves
  to the previous leaf without merging or removing structural nodes.
- The outer loop runs only while a nested delete/selection operation occurred
  and stops once measured text is within the limit or no progress is possible.
- Added faithful Markdown `insertData` crash coverage and the exact empty-block
  fragment counterexample that rejected PR #5100.
- Added one `@platejs/core` patch changeset.

Review fixes:
- Scope baseline frozen before autoreview: issue #5043; branch
  `codex/fix-5043-multiline-paste`; owner `LengthPlugin`; intended behavior is
  crash-free exact enforcement; final code scope is plugin + focused spec;
  release/ledger scope is one changeset + this plan.
- Autoreview P2 “Truncation leaves overflow blocks behind” -> accepted ->
  structural regression changed from length-only to exact one-block output;
  trim removes an empty top-level overflow block atomically and never merges
  across blocks. Focused red showed three retained empty paragraphs; green is
  exact one paragraph.
- Final rerun: `.agents/skills/autoreview/scripts/autoreview --mode local
  --stream-engine-output` -> clean, zero findings, patch correct at 0.86
  confidence.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Browser route loaded stale `@platejs/core/dist` and reproduced the old crash | 2 | Build the artifact-facing core package, reload, and timestamp-filter fresh console logs | `pnpm --filter @platejs/core build`; exact paste then passed with zero fresh errors |
| Dev-server shutdown returned oversized buffered watcher output | 1 | Stop broad output immediately; use capped exact commands only | No repo change; recorded here and resumed with scoped reads |
| Final core typecheck found nullable `editor.api.start([])` target | 1 | Guard the unresolved point and rerun the same package check | Guard added; 5/5 typecheck tasks pass |

Verification evidence:
- `bun test packages/core/src/lib/plugins/length/LengthPlugin.spec.ts` in repo
  root on `origin/main` implementation -> 7 pass, faithful multiline paste test
  fails with `TypeError: undefined is not an object (evaluating 'node.text')`.
- Same focused command after implementation -> 9 pass, 0 fail, including
  faithful crash and 21/20 empty-block invariant coverage.
- Browser skill, `http://localhost:3001/blocks/playground`, rebuilt core dist,
  temporary empty editor with `maxLength: 20`: pasted
  `123456789012345678901\n\ntrailing text`; DOM contained exactly
  `12345678901234567890` plus two empty blocks and fresh console errors were
  `[]`. Temporary playground configuration was restored; targeted diff exit 0.
- `pnpm turbo typecheck --filter=./packages/core` after the final null guard ->
  5/5 tasks pass.
- `pnpm lint:fix` after final implementation -> 3,286 files checked, no fixes.
- Final focused `bun test packages/core/src/lib/plugins/length/LengthPlugin.spec.ts`
  -> 9 pass, 0 fail, 10 expectations.
- Post-review Browser rerun on rebuilt core at
  `http://localhost:3000/blocks/playground`: exact paste produced one DOM child,
  `innerText`/`textContent` of exactly `12345678901234567890`, and zero fresh
  console errors; temporary config restored with targeted diff exit 0.
- Post-review fix checks: core typecheck 5/5; lint checked 3,286 and formatted
  one source file; focused suite 9/9.
- `pnpm check` in `/Users/zbeyens/git/plate` -> exit 0; lint 0 errors (one
  pre-existing hook warning), package build 54/54, package typecheck 54/54,
  fast 3,459/3,459, slow 352/352 plus isolated slow rows, and slowest suite
  completed with zero failures.

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
- 2026-08-19T22:13:13.161Z Task goal plan created.
- 2026-08-20T00:13:28+02:00 Issue, skills, active-goal state, branch, exact
  owner files, and prior fix counterexample reviewed; goal created.
- 2026-08-20T00:16:00+02:00 TDD red reproduced exact issue via
  `createPlateEditor` + `MarkdownPlugin` + plain-text `insertData`: 7 pass, 1 fail.
- 2026-08-20T00:19:00+02:00 Implemented progress-triggered trim recheck;
  focused suite green at 9 pass, 0 fail; patch changeset added.
- 2026-08-20T00:25:00+02:00 Browser initially exposed stale dist; rebuilt
  `@platejs/core`, reran exact local paste, observed 20 text characters and no
  fresh console errors, then restored the temporary route configuration.
- 2026-08-20T00:28:00+02:00 Final typecheck caught and resolved a nullable
  start-point guard; core typecheck 5/5, lint 3,286 clean, focused tests 9/9.
- 2026-08-20T00:35:00+02:00 Accepted autoreview P2, reproduced retained blank
  blocks, added exact structure assertion, removed empty top-level overflow
  blocks atomically, and re-proved one block / 20 chars / zero browser errors.
- 2026-08-20T00:40:00+02:00 Final autoreview clean; full `pnpm check` exit 0.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | All implementation and verification gates green; shipping PR |
| Where am I going? | Commit/push, PR body readback, issue sync, plan closeout |
| What is the goal? | Fix multiline overflow paste without weakening `maxLength` |
| What have I learned? | Safe truncation needs leaf-scoped text deletion plus atomic removal of empty overflow blocks |
| What have I done? | Fixed crash/invariant/blank-block regression and proved tests, package checks, and browser behavior |

Open risks:
- None known. Existing `maxLength` counts JavaScript string length while Slate
  locates deletion targets by `character`; this patch preserves that contract.
