# Fix DOCX export of line breaks

Objective:
Make `@platejs/docx-io` export an HTML `<br>` the way Word itself writes and renders a Shift+Enter line break, and ship the fix as one verified PR.

Goal plan:
docs/plans/2026-10-12-fix-docx-io-line-breaks.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: plain task text from a downstream Plate user (MyNotary), observed in Word for Mac on documents exported with `@platejs/docx-io` 53.3.2, re-verified on `main` at 53.3.16 (`45aee8fd81`)
- id / link: no tracker item; PR #5161 (https://github.com/udecode/plate/pull/5161), opened as a draft from `fix/docx-io-line-breaks` on fork `vincent69001/plate`, is the only artifact
- title: a `<br>` exports as a labelled text wrapping break, and Word stretches the justified line that ends with it
- acceptance criteria: `<p>a<br>b</p>` exports `<w:br/>` with no `w:type`; a page break still exports `<w:br w:type="page"/>`; `word/settings.xml` carries `<w:compat><w:doNotExpandShiftReturn/></w:compat>` before `<w:decimalSymbol>`; the docx-io slow spec, package build/typecheck/brl, lint and `pnpm check` pass; one patch changeset for `@platejs/docx-io`

Timed checkpoint:
- requested duration: none
- semantics: N/A
- initial confidence score: high; both output parts were read before any edit
- improvement loop: failing tests first, then the two template changes, then focused and repo-wide checks
- final score / loop closure: high for the package output covered by the tests; Word rendering confirmed by the requesting user on the exported file

Completion threshold:
- The three `line breaks` tests in `packages/docx-io/src/lib/internal/html-to-docx.slow.ts` pass with the rest of the file, the docx-io build/typecheck/brl lane passes, `pnpm lint:fix` leaves no diff, and `pnpm check` passes.
- One `.changeset/*.md` patch entry for `@platejs/docx-io` exists.
- If a PR is created or updated, this exact task plan exists at the PR head,
  identifies that exact PR, and the PR body names it exactly once.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-10-12-fix-docx-io-line-breaks.md` passes.

Verification surface:
- `bun test ./packages/docx-io/src/lib/internal/html-to-docx.slow.ts`, `pnpm turbo build|typecheck|brl --filter=./packages/docx-io`, `pnpm lint:fix`, `pnpm check`, an independent review of the dirty diff, PR body readback with `gh pr view --json body`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: the task text, the downstream observation in Word for Mac (the label disappears once the breaks are written without a type; the stretching disappears with the compat option), and ECMA-376 Part 1 (`w:br` with its `w:type` default, `w:compat` / `w:doNotExpandShiftReturn` in `w:settings`); `CONTRIBUTING.md`, `AGENTS.md` and the `task`, `testing` and `changeset` skills.
- Allowed edit scope: `buildLineBreak` in `packages/docx-io/src/lib/internal/helpers/xml-builder.ts`, the settings template in `packages/docx-io/src/lib/internal/schemas/settings.ts`, the slow spec above, one changeset, this plan.
- Browser surface: none; the package produces a DOCX blob and has no browser-facing UI in this change.
- Tracker sync: N/A, no issue was opened; the PR is the intake.
- Non-goals: page, column or `clear` breaks, `<br>` nested inside a formatting tag, any other compatibility setting, any option to turn the setting off.

Output budget strategy:
- Read the exact source of `buildLineBreak`, its callers and the settings template; pipe build, typecheck, lint and check output to scratch logs and grep the status lines.

Blocked condition:
- A `pnpm check` failure that survives one `pnpm run reinstall`, or a review finding that requires widening the change beyond the two output parts; the user also keeps the go/no-go on the PR.

Task state:
- task_type: package bug fix
- task_complexity: small one-shot
- current_phase: closeout
- current_phase_status: complete
- next_phase: bot and maintainer review
- goal_status: complete

Current verdict:
- verdict: valid
- confidence: high
- next owner: task
- reason: both behaviors reproduced on `main` with failing tests; Word for Mac showed the label and the stretching on a real export and lost both with the two changes applied by hand to the same file

Pre-solution issue challenge:
- reporter claim: a `<br>` comes out of Word as a visible "[Saut de retour à la ligne]" (text wrapping break) label, and the justified line before it is stretched across the page while browsers leave it unstretched
- suggested diagnosis or fix: write the break without the explicit `textWrapping` type, as Word does for Shift+Enter, and set `w:doNotExpandShiftReturn` in the document settings
- repro ladder:
  - tests / source-level repro: on `main`, `<p>first line<br>second line</p>` exports `<w:br w:type="textWrapping"/>` and `settings.xml` has no `w:compat`; 2 of the 3 new tests fail, the page-break guard passes
  - Playwright / automated browser: N/A, the package output is a DOCX blob with no DOM surface
  - Browser plugin: N/A, same reason
  - screenshot / visual proof: the requesting user compared, in Word for Mac, the same export with typed and untyped breaks (label gone) and with and without the compat option
- reproduction verdict: reproduced at the package boundary and in Word
- validity verdict: valid
- best long-term fix boundary: the two places that write these parts: `buildLineBreak` and the settings template
- harsh honest feedback: `w:type` defaults to `textWrapping` in the spec, so the label is a Word display behavior rather than a spec violation; the fix follows what Word itself writes
- hard-stop decision: proceed

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-10-12-fix-docx-io-line-breaks.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Timed checkpoint parsed | no | N/A: no requested duration |
| Skill analysis before edits | yes | `task`, `autogoal`, `testing` and `changeset` read before editing |
| Active goal checked or created | no | N/A: no native goal tool in this session; this file owns execution |
| Source of truth read before edits | yes | Task text, `buildLineBreak` and its callers, `render-document-file.ts` page break, settings template read in full |
| Tracker comments and attachments read | no | N/A: no tracker item |
| Video transcript evidence required | no | N/A: no video |
| Pre-solution issue challenge required | yes | Claim reproduced with failing tests on `main` before any edit |
| Reproduction verdict before implementation | yes | Reproduced; see the repro ladder |
| Repro escalation ladder selected | yes | Source-level repro and failing tests; browser levels N/A |
| Suggested fix reviewed against durable boundary | yes | The two writers of the affected parts; no caller-side patch |
| `docs/solutions` checked for non-trivial existing-code work | yes | docx entries cover import, lists and the root-build typecheck note; none covers `<br>` export or settings |
| TDD decision before behavior change or bug fix | yes | Three tests written and run red before the fix |
| Branch decision for code-changing task | yes | Dedicated `fix/docx-io-line-breaks` from `upstream/main` in its own worktree |
| Release artifact decision | yes | One `@platejs/docx-io` patch changeset |
| Browser tool decision for browser surface | no | N/A: no browser surface |
| PR expectation decision | yes | One PR, opened as a draft on the requesting user's explicit request: PR #5161 (https://github.com/udecode/plate/pull/5161) |
| Dedicated task plan selected for exact PR | yes | This plan owns PR #5161 (https://github.com/udecode/plate/pull/5161) only |
| Tracker sync expectation decision | no | N/A: no tracker item |
| Output budget strategy recorded | yes | See Output budget strategy |
| Package/API pack selected | yes | Published package runtime output changes |
| Public surface or package boundary identified | yes | `htmlToDocxBlob`, `exportToDocx` and `DocxExportPlugin` output; no export or type change (`buildLineBreak` keeps its name and accepts an optional type) |
| Release artifact path selected | yes | `.changeset/docx-io-line-breaks.md`, patch |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded; one package, one-line user-visible summary |
| Barrel/export impact decision recorded | yes | No file added or moved under exported folders; `pnpm turbo brl --filter=./packages/docx-io` produced no diff |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested; confidence recorded above.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason. N/A: no video.
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
- [x] Every PR has its own `task` invocation and dedicated plan; this plan is
      not aggregate evidence for another PR.
- [x] If a PR exists, its body has exactly one
      `🧭 Task plan: docs/plans/<plan>.md` line, this file exists at the exact PR
      head, and this plan records that exact PR number or URL. PR #5161 (https://github.com/udecode/plate/pull/5161): the body carries the line once; this file is committed on `fix/docx-io-line-breaks` and pushed to the PR head.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason. The docx-io typecheck first failed on an unresolved `@platejs/docx`; building that package fixed it, as `docs/solutions/test-failures/workspace-package-typecheck-may-need-root-build.md` documents; no reinstall needed.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior. All commands ran from the root of the `fix/docx-io-line-breaks` worktree with Node 24.12.0, pnpm 9.15.0 via `packageManager`, Bun 1.4.3.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason. Dirty local diff, independent review agent.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling. N/A: no agent or tooling file changed.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: no registry change.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`. N/A: a changeset is included.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes. N/A: no public shape change.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required. N/A: no barrel drift.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | See Verification evidence |
| Pre-solution issue challenge verdict | yes | Record reporter claim, suggested fix, repro verdict, validity verdict, durable boundary, and hard-stop/pivot decision before implementation | Recorded above: valid, proceed |
| Repro escalation ladder | yes | For bug/behavior claims, record test/source-level, Playwright, Browser, and screenshot/visual-proof outcomes or N/A/blocker reasons before `not reproduced` | Source-level repro and red tests; browser levels N/A; Word check by the requesting user |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | 2 of the 3 new tests fail on `main` |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | docx-io slow spec: 36 pass |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./packages/docx-io` passes after building `@platejs/docx` |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no export or layout change; `brl` run anyway with no diff |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest change |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands from the worktree root, see Work Checklist |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no browser surface |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: `templates/**` untouched |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | `.changeset/docx-io-line-breaks.md` |
| User-visible registry output changed | no | Use the registry-changelog pack: add/update `apps/www/src/registry/changelog/entries/*.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --check`, or record N/A | N/A: no registry change |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for supporting public docs/content/API/example changes, load `docs-creator` and close the docs pack; for typo/link-only edits, record the explicit reason and proportional proof | N/A: no docs change |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure modes: a page break losing its `page` type, or an invalid settings part that Word refuses to open; proof: the page-break test, the compat element placed where CT_Settings puts it (after `defaultTabStop`, before `decimalSymbol`), and the file opened in Word for Mac; boundary: the two writers of these parts |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: the only resolution error was the documented missing build |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | Helper not run: Codex is not installed and the repo `autoreview` helper's nested Claude CLI cannot authenticate from this session (same as PR #5150). Replaced by an independent Claude review agent on the dirty diff: no correctness defect; `w:compat` placement and `doNotExpandShiftReturn` checked against CT_Settings / CT_Compat; mammoth import unaffected; three accuracy findings applied (see Review fixes) |
| PR create or update | yes | Run `check` before PR work and sync PR body to the task-style final handoff | `pnpm check` exit 0 before PR work; PR body mirrors the final handoff contract |
| Per-PR task ownership | yes | Verify one task-plan body line, plan at exact head, and exact PR ownership in this plan | PR #5161 (https://github.com/udecode/plate/pull/5161) body carries one `🧭 Task plan: docs/plans/2026-10-12-fix-docx-io-line-breaks.md` line; this plan names PR #5161 and is pushed to its head |
| Task-style PR body verified | yes | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | `gh pr view 5161 --json body`: auto-release block present, one task-plan line, no self-link, `🐛 Fixes ➖ N/A`, `🟢 95% confidence` line, `Phase / 🧪 Tests / 🌐 Browser` table with Reproduced and Verified rows, bold emoji Outcome/Caveat/Design/Verified sections |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no image |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker item |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix`: formatted two touched files once, then nothing left to fix |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Build, typecheck, lint and check output went to scratch logs; only status lines were read |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-10-12-fix-docx-io-line-breaks.md` | Passes at the head that records PR #5161 |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | `xml-builder.ts` export list unchanged; `buildLineBreak` keeps its export and accepts an optional type; no type exported from the package changed |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published package runtime output |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | One `@platejs/docx-io: patch` file |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: artifact added |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | `pnpm turbo build|typecheck|brl --filter=./packages/docx-io` pass; focused spec passes |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: run anyway, no diff |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | Contribution docs, skills, `buildLineBreak` and the settings template read; both behaviors reproduced on `main` | implementation |
| Implementation | done | Untyped `w:br` for `<br>`, compat option in the settings template, three tests, changeset | verification |
| Verification | done | Focused spec, docx-io build/typecheck/brl, lint, `pnpm check`, independent review | PR |
| PR / tracker sync | done | Draft PR #5161 (https://github.com/udecode/plate/pull/5161) opened on the requesting user's request; no tracker item | closeout |
| Closeout | done | Plan names PR #5161 and is pushed to its head | final response |

Findings:
- `buildLineBreak` always sets `w:type="textWrapping"` on the `w:br` it writes for an inline `<br>`. ECMA-376 makes `textWrapping` the default value of that attribute, so the explicit attribute changes nothing for the spec, but Word displays such a break as a labelled text wrapping break; written without the attribute, the same break shows as a plain line break, which is also what Word writes for Shift+Enter.
- The settings template has no `w:compat` element. By default Word justifies a line that ends with a manual line break like any other line and stretches it; browsers never stretch the line before a forced break under `text-align: justify`. `w:doNotExpandShiftReturn` makes Word keep that line unstretched.
- Page breaks are written elsewhere (`render-document-file.ts`, explicit `w:type="page"`) and are not affected.

Decisions and tradeoffs:
- Keep `buildLineBreak` exported with an optional `type`, so a caller that needs `page` or `column` can still pass it; only the default stops writing the attribute.
- Set the compat option unconditionally in the template rather than adding a document option: the converter renders HTML, and the option is what makes Word render the `<br>` as the HTML does. A document-level option would be a new public API for no known use.
- Leave other compatibility settings, `clear` breaks and `<br>` nested inside formatting tags out of scope.

Implementation notes:
- `packages/docx-io/src/lib/internal/helpers/xml-builder.ts`: `buildLineBreak(type?)` adds `w:type` only when a type is given; the `<br>` branch of `buildRun` calls it without one.
- `packages/docx-io/src/lib/internal/schemas/settings.ts`: `<w:compat><w:doNotExpandShiftReturn/></w:compat>` between `w:defaultTabStop` and `w:decimalSymbol`, the order CT_Settings requires.
- `packages/docx-io/src/lib/internal/html-to-docx.slow.ts`: `line breaks` block with three tests (untyped `w:br`, page break still typed, compat option before `w:decimalSymbol`).
- `.changeset/docx-io-line-breaks.md`: patch.

Review fixes:
- Accepted: the `buildLineBreak` JSDoc and the changeset claimed Word in general labels a typed break, while the label was only observed in Word for Mac; both now say Word for Mac.
- Accepted: the settings JSDoc and the changeset did not say the option applies to the whole document; both now do.
- Accepted: the third test was titled after a rendering it does not assert; renamed to what it checks (`doNotExpandShiftReturn` declared before `decimalSymbol`) and its HTML simplified.
- Noted, downstream only: a consumer that patches `settings.xml` itself to add the same option would end up with two `w:compat` elements after upgrading; the downstream app removes its workaround on upgrade.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| docx-io typecheck: `@platejs/docx` unresolved in a fresh worktree | 1 | Build `@platejs/docx` first | Typecheck passes |

Verification evidence:
- Reproduction on `main`: `bun test ./packages/docx-io/src/lib/internal/html-to-docx.slow.ts -t "line breaks"`: the untyped-break and compat tests fail (`<w:br w:type="textWrapping"/>`, no `w:compat`), the page-break test passes.
- With the fix: `bun test ./packages/docx-io/src/lib/internal/html-to-docx.slow.ts`: 36 pass, 0 fail.
- `pnpm turbo build --filter=./packages/docx-io`: 8 successful. `pnpm turbo typecheck --filter=./packages/docx-io`: 8 successful after `pnpm turbo build --filter=@platejs/docx`. `pnpm turbo brl --filter=./packages/docx-io`: no diff.
- `pnpm lint:fix`: formatted two touched files once, then nothing left to fix.
- `pnpm check` from the worktree root: exit 0 (lint 3310 files, typecheck 54 successful, `test:all` 3557 fast tests and the slow lanes, `test:slowest` within thresholds), first run 2026-10-12 17:02 CEST, rerun after the review fixes: exit 0 again at 17:06 CEST
- Word for Mac (requesting user): the same exported document shows "[Saut de retour à la ligne]" labels with typed breaks and none with untyped breaks.
- Codex is not installed on this machine, so `codex review --base origin/main` was not run; the PR says so.

Final handoff contract:
- PR line: PR #5161 (https://github.com/udecode/plate/pull/5161), opened as a draft; body line `🐛 Fixes ➖ N/A`
- Issue / tracker line: 🐛 Fixes ➖ N/A
- Confidence line: 🟢 95% confidence in the verified package behavior
- Flow table:
  - Reproduced: tests 🔴 the untyped-break and compat tests fail on `main`; browser ➖ N/A
  - Verified: tests 🟢 focused docx-io spec, `pnpm check`; browser ➖ N/A
- Browser check: N/A, no browser surface
- Outcome: a `<br>` exports as the plain line break Word writes for Shift+Enter, and Word keeps the justified line that ends with it unstretched, as browsers do
- Caveat: the compat option applies to the whole document, so a line break the reader later types with Shift+Enter in a justified paragraph is not stretched either; other break kinds and `<br>` nested inside formatting tags are unchanged
- Design:
  - Chosen boundary: the two writers of the affected parts, `buildLineBreak` and the settings template
  - Why not quick patch: rewriting the generated package after `htmlToDocxBlob`, which is what a downstream app has to do today, reopens the zip and edits XML by string
  - Why not broader change: a document option for compatibility settings would add public API with no other known use
- Verified: focused spec, docx-io build/typecheck/brl, lint, `pnpm check`, independent review
- PR body verified: `gh pr view 5161 --json body` at the pushed head shows the auto-release block, one task-plan line, the fix, confidence, table and four sections

Task-style PR body contract:
- Preserve any existing `<!-- auto-release:start -->` block. If a changeset is
  part of the diff and repo policy expects auto release, include that block.
- Use the accepted kitcn PR #270 visual format. The body starts with an emoji
  issue/tracker/fix line, for example `🐛 Fixes #123` or `🐛 Fixes ➖ N/A`, then
  exactly one `🧭 Task plan: docs/plans/<plan>.md` line, then an emoji
  confidence line like `🟢 95-100% confidence`. The plan must exist at the
  exact PR head and identify that exact PR.
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
- PR: PR #5161 (https://github.com/udecode/plate/pull/5161), draft
- Task plan at exact PR head: this file is committed on `fix/docx-io-line-breaks` and pushed to the head of PR #5161
- Issue / tracker: N/A, no tracker item
- Browser proof: N/A, no browser surface
- Caveats: see Final handoff contract

Timeline:
- 2026-10-12T15:00:14.572Z Task goal plan created.
- 2026-10-12 Tests written red on `main`, fix applied, focused and package checks green, `pnpm check` run, draft PR opened, plan updated with the PR.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Bot and maintainer review of the draft PR |
| What is the goal? | Export a `<br>` the way Word writes and renders a Shift+Enter line break |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Word for Windows and Word Online were not checked by hand; the compat element is the standard OOXML setting Word for Windows exposes as "Don't expand character spaces on a line that ends with SHIFT+RETURN".
