# Fix docx-io line-height units

Objective:
Make `@platejs/docx-io` export a CSS `line-height` with its unit (`px`/`pt`/`cm`/`in` as an absolute twip height, `%` and unitless as a line multiplier); done when the 12 `xml-builder.spec.ts` cases pass and the package gates are green; plan docs/plans/2026-10-07-fix-docx-io-line-height-units.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-10-07-fix-docx-io-line-height-units.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: plain task text (bug report with a measured reproduction, written by the MyNotary team for an AI-assisted contribution; no public issue)
- id / link: no tracker item; PR #5145 (https://github.com/udecode/plate/pull/5145), opened from `fix/docx-io-line-height-units` on fork `vincent69001/plate`, is the only artifact
- title: `fix(docx-io): read line-height units when exporting to DOCX`
- task type: behavior bug fix in a published package
- acceptance criteria (measured on `@platejs/docx-io` 53.3.2, code identical on `main` at a8607621c0 / 53.3.10):
  - `<p style="line-height: 24px">` writes `w:line="360"` (24 px = 360 twips) with an absolute rule, not `w:line="5760" w:lineRule="auto"` (24 lines)
  - `<h1 style="font-size: 18px; line-height: 24px">` writes `w:line="360"` with an absolute rule, not `w:line="6480" w:lineRule="auto"` (27 lines)
  - `<p style="font-size: 11pt; line-height: 1.5">` writes `w:line="360" w:lineRule="auto"`, not `w:line="330"` (1.375 lines): a unitless value is a line multiplier whatever the font size
  - `<p style="font-size: 12pt; line-height: 1.5">` keeps `w:line="360" w:lineRule="auto"`
  - `line-height: 18pt` writes `w:line="360"` with an absolute rule; `line-height: normal` writes no `w:line`
  - the absolute rule is `exact` or `atLeast`, to be decided from what the converter already does for heights
- caveats: the converter uses `atLeast` for every other absolute height (document default style, table row `hRule`), and `exact` clips inline images and equations in Word, so `atLeast` was chosen; the `%`, `cm` and `in` forms were added because they share the same lost-unit bug and the converters already exist
- likely files / packages: `packages/docx-io/src/lib/internal/helpers/xml-builder.ts` (`fixupLineHeight`, `buildSpacing`, `RunAttributes.lineHeight`), `packages/docx-io/src/lib/internal/utils/unit-conversion.ts` (existing converters), new `xml-builder.spec.ts`, one `.changeset/*.md`
- browser surface: none; headless HTML to DOCX conversion
- root-cause layer: `fixupLineHeight` receives `Number.parseFloat(style['line-height'])`, so the CSS unit is lost; `buildSpacing` hardcodes `lineRule="auto"`, whose unit is 240ths of a line (ECMA-376 17.3.1.33), while the font-size branch computed an absolute height

Timed checkpoint:
- requested duration: N/A; none requested
- semantics: N/A; normal one-shot completion gates apply
- initial confidence score: N/A; exact binary acceptance checks exist
- improvement loop: reproduce on `main` -> fix at the parsing and writing boundary with behavior tests -> package and repo checks -> review -> PR body and plan sync
- final score / loop closure: N/A; close when the named checks and PR gates pass

Completion threshold:
- Every acceptance criterion above is covered by a case in `packages/docx-io/src/lib/internal/helpers/xml-builder.spec.ts` that fails with the `main` version of `xml-builder.ts` and passes on the branch.
- `pnpm test packages/docx-io`, `pnpm turbo typecheck --filter=./packages/docx-io`, `pnpm turbo build --filter=./packages/docx-io`, `pnpm lint:fix`, `pnpm brl` (no drift) and `pnpm check` pass from the repo root.
- The review gate is closed: structured autoreview, or an explicitly recorded substitute review with its findings resolved when the helper cannot run.
- If a PR is created or updated, this exact task plan exists at the PR head,
  identifies that exact PR, and the PR body names it exactly once.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-10-07-fix-docx-io-line-height-units.md` passes.

Verification surface:
- command: `pnpm test packages/docx-io` (bun fast lane) in `~/code/plate`, including the 12 cases of `xml-builder.spec.ts`
- command: `pnpm turbo typecheck --filter=./packages/docx-io`, `pnpm turbo build --filter=./packages/docx-io`, `pnpm lint:fix`, `pnpm brl`, `pnpm check` in `~/code/plate`
- source-level repro: the same 12 cases run against `upstream/main:packages/docx-io/src/lib/internal/helpers/xml-builder.ts`, plus a throwaway probe printing the `<w:spacing>` element written for each HTML case before and after
- review: `.agents/skills/autoreview/scripts/autoreview --mode local --engine claude` in `~/code/plate` (Codex is not installed), with a substitute in-session review recorded because the helper cannot authenticate
- source-audit: `packages/docx-io/src/index.ts` and `src/lib/index.ts` unchanged; `internal/` is not exported, so no public export or type changes
- artifact: one `@platejs/docx-io` patch changeset, task-style PR body naming this plan, plan present at the PR head

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Keep the XML shape unchanged for paragraphs without a `line-height` (`<w:spacing ... w:lineRule="auto"/>` stays as it is).
- No refactor beyond what the fix needs (CONTRIBUTING refuses refactor-only changes); nothing pushed or opened on GitHub before the PR title and body are approved by the requesting user.

Boundaries:
- Source of truth: the task text and its measured table, `@platejs/docx-io` source and tests on `upstream/main` at a8607621c0, ECMA-376 17.3.1.33 for `w:spacing`.
- Allowed edit scope: `packages/docx-io/src/lib/internal/helpers/xml-builder.ts`, `xml-builder.spec.ts` (new), `render-document-file.spec.ts` (restore a leaked spy), one `.changeset/*.md`, this plan, PR metadata.
- Browser surface: N/A; the conversion has no route and no DOM.
- Tracker sync: N/A; no issue exists, the PR is the only artifact.
- Non-goals: `rem`, `mm` and other units without a twip converter (they now keep the document default), `line-height` on runs, the dangling `w:lineRule="auto"` written when no line value exists, the pre-existing `mock.module` leaks between docx-io spec files under a bare `bun test`.

Output budget strategy:
- Bounded `sed -n` / `grep -n` reads of `xml-builder.ts`, the spec files, and the `.agents` skill and rule files; gate output written to log files under `$TMPDIR` and read through `tail`/`grep`.

Blocked condition:
- Stop if a repo gate fails for a reason tied to the diff that cannot be fixed inside the allowed edit scope, if the requesting user does not approve the PR title and body, or if push access to the fork is lost.

Task state:
- task_type: bug fix in a published package
- task_complexity: normal, non-heavyweight, measurable
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: valid
- confidence: high after reproduction against the `main` source, green package gates and a resolved substitute review
- next owner: task
- reason: every acceptance row has a red-with-main, green-on-branch test; the fix sits in the only function that reads the CSS value and the only function that writes `w:spacing`

Pre-solution issue challenge:
- reporter claim: `htmlToDocxBlob` (hence `exportToDocx` with `customStyles`) reads a `line-height` that carries a unit as a number of lines, and scales a unitless value by the font size so `1.5` is only right at 12 pt
- suggested diagnosis or fix: `fixupLineHeight` gets `Number.parseFloat(style['line-height'])` (unit lost) and returns `+lineHeight * 240` or `HIPToTWIP(+lineHeight * fontSize)`, then `buildSpacing` writes `lineRule="auto"`; proposed fix: parse the unit with the existing converters and carry the `lineRule` with the value
- repro ladder:
  - tests / source-level repro: reproduced in `~/code/plate`: with `upstream/main:xml-builder.ts` swapped in, the 12 cases of `xml-builder.spec.ts` fail and the probe prints `w:line="5760" w:lineRule="auto"` (24px), `w:line="6480"` (18px + 24px), `w:line="330"` (11pt + 1.5), `w:line="4320"` (18pt), `w:line="36000"` (150%), `w:line="240"` (normal); with the fix: `360 atLeast`, `360 atLeast`, `360 auto`, `360 atLeast`, `360 auto`, no `w:line`
  - Playwright / automated browser: N/A; headless conversion, no DOM
  - Browser plugin: N/A; no route renders the generated XML
  - screenshot / visual proof: N/A; no layout, selection, dialog, or visual state
- reproduction verdict: reproduced
- validity verdict: valid; the diagnosis matches the source, and the `// FIXME: If line height is anything other than a number` comment on `main` already acknowledged it
- best long-term fix boundary: `fixupLineHeight` returns `{ line, lineRule }` (a `LineSpacing` attribute, like `Indentation` mirrors `w:ind`), and `buildSpacing` writes both attributes; no caller-side patching, no new intermediate type beyond the attribute itself
- harsh honest feedback: the font-size branch was computing an absolute height and writing it under a rule whose unit is relative, so it was only right by coincidence at 12 pt; the `%`, `cm` and `in` forms had the same lost-unit bug and are fixed by the same parse
- hard-stop decision: cleared; reproduced against the `main` source before implementation

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-10-07-fix-docx-io-line-height-units.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Read `CONTRIBUTING.md`, `AGENTS.md`, `.agents/rules/task.mdc`, `autoclosure.mdc`, `changeset.mdc`, `testing.mdc`, `.agents/skills/task`, `autogoal`, `autoreview`; no heavyweight, browser, registry, docs, or agent-native skill applies |
| Active goal checked or created | no | N/A: no Codex goal runtime in this session (Claude Code); this plan file is the durable goal state |
| Source of truth read before edits | yes | Task text with its measured before/after table read; `xml-builder.ts` (`fixupLineHeight`, `buildModifiedAttributes`, `buildSpacing`, `buildParagraph`) and `unit-conversion.ts` read on `main` at a8607621c0 |
| Tracker comments and attachments read | no | N/A: no tracker item |
| Video transcript evidence required | no | N/A: no video or screen recording |
| Pre-solution issue challenge required | yes | Bug report with a technical diagnosis, challenged by reproducing against the `main` source through the package test setup |
| Reproduction verdict before implementation | yes | Reproduced: 12 red cases with `main`'s `xml-builder.ts`, probe output recorded above |
| Repro escalation ladder selected | yes | Test-level repro owns the behavior; Playwright, Browser, and visual rungs are N/A for a headless conversion |
| Suggested fix reviewed against durable boundary | yes | Fix placed in `fixupLineHeight` + `buildSpacing` with a `LineSpacing` attribute; rejected keeping the `fontSize` parameter (its branch was the bug) and a second attribute next to `lineHeight` (the rule travels with the value) |
| `docs/solutions` checked for non-trivial existing-code work | yes | `grep -ril "line-height\|docx-io" docs/solutions` found no note about DOCX spacing |
| TDD decision before behavior change or bug fix | yes | 7 conversion cases and 3 document-default cases on `fixupLineHeight`, 2 end-to-end `htmlToDocxBlob` cases in `xml-builder.spec.ts`, each red with the `main` source |
| Branch decision for code-changing task | yes | `fix/docx-io-line-height-units` on fork `vincent69001/plate` from `upstream/main` a8607621c0; the PR targets `main` |
| Release artifact decision | yes | `.changeset/docx-io-line-height-units.md`, `@platejs/docx-io` patch |
| Browser tool decision for browser surface | no | N/A: no route or DOM |
| PR expectation decision | yes | One PR, opened after the requesting user approved the title and body shown in the session: PR #5145 (https://github.com/udecode/plate/pull/5145) |
| Dedicated task plan selected for exact PR | yes | This plan owns PR #5145 (https://github.com/udecode/plate/pull/5145) only |
| Tracker sync expectation decision | no | N/A: no tracker item |
| Output budget strategy recorded | yes | Bounded reads and log-file tails as recorded above |
| Package/API pack selected | yes | `--with package-api`: published runtime behavior of `@platejs/docx-io` changes and a changeset ships |
| Public surface or package boundary identified | yes | No export or type change: `src/index.ts` and `src/lib/index.ts` unchanged, `internal/` is not exported; `fixupLineHeight` stays a module export consumed only inside `xml-builder.ts` |
| Release artifact path selected | yes | `.changeset/docx-io-line-height-units.md` (`"@platejs/docx-io": patch`) |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/rules/changeset.mdc` read: imperative voice, user delta from `main`, one package per file, patch for a fix; `pnpm changeset status` lists the patch bump and `tooling/scripts/auto-release-pr.mjs` validation returns no error |
| Barrel/export impact decision recorded | yes | Only `xml-builder.spec.ts` is new, under the non-exported `internal/` folder; `pnpm brl` produced no diff |

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
      `<video-transcripts>` XML, or marked N/A with reason. N/A: no video evidence.
- [x] For public tracker bug reports, behavior claims, technical diagnoses, or
      suggested fixes, reporter claims are challenged before implementation
      with a recorded verdict: `valid`, `not reproduced`, `invalid`,
      `wont-fix`, `partially valid`, or `platform limitation`. Feature, docs,
      support, or cleanup requests with no bug claim may mark reproduction
      `N/A` with reason. Verdict: `valid`, reproduced against the `main` source.
- [x] Repro escalation ladder followed for bug/behavior claims: focused
      test/source-level repro first when applicable; existing repo-owned
      Playwright regression/test harness next when available and useful as
      executable coverage; do not use standalone Playwright, Puppeteer, or raw
      DevTools as a substitute for the repo Browser policy;
      `[@Browser](plugin://browser@openai-bundled)` next when tests or
      Playwright cannot reproduce or cannot model the surface honestly;
      screenshot or explicit visual-proof waiver when visual/native state
      matters. Test-level repro owns the behavior; the other rungs are N/A.
- [x] Hard-stop rule followed for bug/behavior claims: no code when the issue
      is not reproduced, invalid, or won't-fix; partial validity pivots to the
      best long-term fix and records what was wrong or incomplete in the issue's
      proposed path. Cleared: reproduced and valid.
- [x] Nearby repo instructions and implementation patterns read before edits:
      `AGENTS.md`, `CONTRIBUTING.md`, `.agents/rules/task.mdc`,
      `.agents/rules/testing.mdc`, the sibling helpers `fixupFontSize`,
      `fixupRowHeight`, `fixupMargin`, and the `Indentation` attribute.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason. Boundary: `fixupLineHeight` and `buildSpacing`.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason. One `@platejs/docx-io` patch changeset.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable. Bug
      fix: task-style PR body, no tracker sync.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason. `fix/docx-io-line-height-units`.
- [x] Every PR has its own `task` invocation and dedicated plan; this plan is
      not aggregate evidence for another PR.
- [x] If a PR exists, its body has exactly one
      `🧭 Task plan: docs/plans/<plan>.md` line, this file exists at the exact PR
      head, and this plan records that exact PR number or URL. PR #5145
      (https://github.com/udecode/plate/pull/5145): the body carries the line,
      this plan names the PR and is pushed to its head.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason. N/A: no missing-module or
      React-runtime failure; the only typecheck miss was `@platejs/docx` without
      `dist`, fixed by building that peer package.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior. All commands run in `~/code/plate` (root) or
      `~/code/plate/packages/docx-io`.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Runtime change: see Findings.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason. `--mode local` on the
      dirty tree; see Review fixes for the outcome.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
      N/A: no agent surface touched.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: no registry change.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`. N/A: a changeset ships.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes. No public shape change.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required. `pnpm brl` no diff; changeset added.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | See Verification evidence |
| Pre-solution issue challenge verdict | yes | Record reporter claim, suggested fix, repro verdict, validity verdict, durable boundary, and hard-stop/pivot decision before implementation | Recorded above: valid, reproduced, boundary `fixupLineHeight` + `buildSpacing` |
| Repro escalation ladder | yes | For bug/behavior claims, record test/source-level, Playwright, Browser, and screenshot/visual-proof outcomes or N/A/blocker reasons before `not reproduced` | Test-level reproduced; other rungs N/A (headless conversion) |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | 12 red cases with `upstream/main:xml-builder.ts`; probe table recorded above |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `pnpm test packages/docx-io`: 103 + 1 + 1 pass, 0 fail (two `mock.module` specs run isolated by the lane) |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./packages/docx-io` passes after `pnpm turbo build --filter=./packages/docx` (peer resolved from the workspace root needs `dist`) |
| Package exports or file layout changed | yes | Run `pnpm brl` before final verification and keep generated barrel updates | `pnpm brl`: 52 tasks, no diff |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest or lockfile change |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent file touched |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All gates run in `~/code/plate` (root) or `~/code/plate/packages/docx-io` |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no route or DOM |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: `templates/**` untouched (`git status` clean outside the diff) |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | `.changeset/docx-io-line-height-units.md`, `@platejs/docx-io` patch |
| User-visible registry output changed | no | Use the registry-changelog pack: add/update `apps/www/src/registry/changelog/entries/*.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --check`, or record N/A | N/A: no registry change |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for supporting public docs/content/API/example changes, load `docs-creator` and close the docs pack; for typo/link-only edits, record the explicit reason and proportional proof | N/A: the docs describe `customStyles`, not the unit handling |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Recorded in Findings (runtime output of every document whose styles carry a `line-height`) |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent surface touched |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no corruption signal |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | Helper run with `--engine claude` (Codex not installed) failed on authentication; substitute in-session review run, 5 findings triaged and resolved, see Review fixes |
| PR create or update | yes | Run `check` before PR work and sync PR body to the task-style final handoff | `pnpm check` exit 0 after the review fixes; PR #5145 created with the task-style body shown to and approved by the requesting user |
| Per-PR task ownership | yes | Verify one task-plan body line, plan at exact head, and exact PR ownership in this plan | PR #5145 body carries one `🧭 Task plan: docs/plans/2026-10-07-fix-docx-io-line-height-units.md` line; this plan names PR #5145 and is pushed to the PR head |
| Task-style PR body verified | yes | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | `gh pr view 5145 --json body`: unchecked auto-release block, `🐛 Fixes ➖ N/A`, one task-plan line, `🟢 90-95% confidence`, the Phase table, the four bold emoji sections, no self-link |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no images |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker item |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix`: 3308 files checked; `pnpm lint` green inside `pnpm check` |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Gate output went to `$TMPDIR` log files read through `tail`/`grep` |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-10-07-fix-docx-io-line-height-units.md` | Run before the commit that carries this plan; result in Verification evidence |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | Task text, repo rules, `xml-builder.ts` and `unit-conversion.ts` read | implementation |
| Implementation | done | `fixupLineHeight` parses `px`/`pt`/`cm`/`in`/`%`/`em`/unitless with an anchored pattern; `LineSpacing` attribute; `buildSpacing` writes `lineRule` | verification |
| Verification | done | Package lane, typecheck, build, lint, brl, repro, `pnpm check`; see Verification evidence | closeout |
| PR / tracker sync | done | PR #5145 opened after the requesting user's approval; no tracker item | final response |
| Closeout | done | Plan names PR #5145 and is pushed to its head | final response |

Findings:
- `fixupLineHeight` on `main` receives `Number.parseFloat(style['line-height'])`, so `24px` is read as 24 lines; with a font size it returned `HIPToTWIP(lineHeight * fontSizeHIP)`, an absolute height written under `lineRule="auto"` whose unit is 240ths of a line, so `1.5` was right only at 12 pt (`1.5 * 24 HIP * 10 = 360`).
- `buildSpacing` hardcoded `lineRule="auto"`; the attribute now travels with the value (`LineSpacing { line, lineRule }`) and still defaults to `auto` when there is no line value, so paragraphs without a `line-height` keep the same XML.
- High-risk note: every exported document whose styles carry a `line-height` changes. Failure mode if wrong: unreadable spacing in Word for all exports. Proof: the 12 red/green cases plus the probe table over the task's inputs; `DOCX_EXPORT_STYLES` (`line-height: 1.5` at 11 pt) now yields `360 auto` (1.5 lines) instead of `330 auto` (1.375 lines), which is what the stylesheet asks for.
- The shared `pixelRegex`/`pointRegex` are unanchored, so a first version of the fix read `calc(1em + 4px)` as `4px` (a 3 pt line); the final parse is anchored on the whole value and anything else keeps the document default, which is what `main` effectively did for such values (`240 auto`, the default spacing).
- `render-document-file.spec.ts` spied on `buildParagraph` and never restored it; in the fast lane the spy leaked into `xml-builder.spec.ts` (same bun process, later file) and emptied every paragraph. The spy is now restored in the file's `afterEach`, like its `fetch` spy; the leak was invisible before because no later spec exercised the real builder.
- A bare `bun test` in `packages/docx-io` has 8 pre-existing failures caused by `mock.module` leaks from `html-to-docx.spec.ts`; the repo's fast lane (`pnpm test`) isolates `mock.module` specs into their own process and is green. Not touched.

Decisions and tradeoffs:
- Absolute heights (`px`/`pt`/`cm`/`in`) write `lineRule="atLeast"`, not `exact`: `exact` clips inline images, equations and larger runs in Word (ECMA-376 17.18.48), while CSS lets the line box grow for replaced elements; the converter already uses `atLeast` for its document default (`styles.ts`) and for table row heights (`hRule`). The cost is that a `line-height` smaller than the font's natural height is not honored; a one-word change if maintainers prefer `exact`.
- The value is parsed once with an anchored pattern (`/^(\d*\.?\d+)(px|pt|cm|in|%|em)?$/i`) instead of the shared unanchored regexes, so `calc()`, `var()` and unknown units keep the document default instead of matching an embedded `4px`.
- `%` and `em` are handled with the unitless branch (`150%` = `1.5em` = `1.5`): same lost-unit bug, same output. `cm` and `in` use the converters `fixupRowHeight` already uses.
- `normal`, unparseable values and `0` write no `w:line` (`0` wrote none on `main` too, since `0 * 240` was falsy); the paragraph then inherits the document default `<w:spacing w:after="120" w:line="240" w:lineRule="atLeast"/>` from `styles.ts`, so the rendered spacing is unchanged.
- The `fontSize` parameter of `fixupLineHeight` is removed rather than kept unused: its only branch was the bug.
- `Math.round` on the `auto` value keeps `w:line` an integer (`1.33` wrote `319.2` before).

Implementation notes:
- `xml-builder.ts`: `LineSpacing` type next to `Indentation`; `RunAttributes.lineHeight?: LineSpacing`; `fixupLineHeight(lineHeightString)` matches the trimmed value once and switches on the unit; call site passes the raw CSS string; `buildSpacing` writes `line` then `lineRule` (attribute order unchanged); `HIPToTWIP` import dropped (no other use in the file).
- `xml-builder.spec.ts`: 7 `it.each` conversion cases (`24px`, `18pt`, `1cm`, `1.5`, `1.5em`, `150%`, `115%`), 3 document-default cases (`normal`, `calc(1em + 4px)`, `0`), 2 end-to-end `htmlToDocxBlob` cases reading `word/document.xml` through JSZip (about 36 ms for the file, max 20 ms per case, under the 75/150 ms fast-lane limits).
- `render-document-file.spec.ts`: `buildParagraphSpy` hoisted next to `fetchSpy` and restored in `afterEach`.
- `.changeset/docx-io-line-height-units.md`: `@platejs/docx-io` patch.

Review fixes:
- Structured autoreview (`.agents/skills/autoreview/scripts/autoreview --mode local --engine claude`): the headless `claude` subprocess failed with `Failed to authenticate: OAuth session expired and could not be refreshed` (the helper runs it with `--safe-mode --setting-sources user`, outside the desktop app session). Codex is not installed. Blocker recorded.
- Substitute review: an in-session Claude reviewer agent (read-only, no shell) read the diff, the spec files, `unit-conversion.ts`, `testing.mdc`, `changeset.mdc`, `test-fast.mjs` and `test-suites.mjs`. Its 5 findings and their resolution:
  1. Unanchored regexes read `calc(1em + 4px)` as `4px`, and `cm`/`in`/`mm` as line multipliers. Accepted: anchored parse, `cm`/`in` converted, other units keep the document default; `calc(1em + 4px)` added to the spec.
  2. Two end-to-end conversions in a fast-lane spec may cross the 75/150 ms limits. Checked, not a problem: measured 35-36 ms for the file and at most 20 ms per case over three `pnpm test:slowest` runs; the end-to-end cases stay in the fast lane.
  3. `exact` clips inline images and equations in Word; the package default uses `atLeast`. Accepted: `atLeast` for absolute heights (see Decisions).
  4. `mockRestore()` at the end of the test body is skipped when an assertion fails. Accepted: spy hoisted and restored in `afterEach`, the file's existing pattern.
  5. `line-height: 0` wrote `w:line="0"` where `main` wrote nothing. Accepted: `0` keeps the document default; case added to the spec.
  Rejected: none. The reviewer also read the plan before it was filled and flagged it as a template; it is filled now.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm turbo typecheck --filter=./packages/docx-io`: `Cannot find module '@platejs/docx'` | 1 | `pnpm turbo build --filter=./packages/docx` | typecheck green |
| Spec `it.each` table inferred `lineRule: string` (TS2769) | 1 | `as const` on the table | typecheck green |
| 2 end-to-end cases red in `pnpm test packages/docx-io` though green standalone | 1 | Found the unrestored `buildParagraph` spy in `render-document-file.spec.ts`; restored in `afterEach` | lane green |
| autoreview `--engine claude`: OAuth session expired | 1 | Substitute in-session review | recorded as blocker + substitute |

Verification evidence:
- `pnpm test packages/docx-io` (`~/code/plate`): 103 pass / 0 fail in the main batch, plus 2 isolated `mock.module` specs 1 pass each.
- Repro: with `upstream/main:packages/docx-io/src/lib/internal/helpers/xml-builder.ts` swapped in, `bun test src/lib/internal/helpers/xml-builder.spec.ts` (`~/code/plate/packages/docx-io`): 0 pass / 12 fail; restored file checksum verified equal to the fix, then 12 pass / 0 fail.
- Probe (`htmlToDocxBlob` then `word/document.xml`) before -> after: `24px` `5760 auto` -> `360 atLeast`; `18px + 24px` `6480 auto` -> `360 atLeast`; `11pt + 1.5` `330 auto` -> `360 auto`; `12pt + 1.5` `360 auto` -> `360 auto`; `18pt` `4320 auto` -> `360 atLeast`; `150%` `36000 auto` -> `360 auto`; `normal` `240 auto` -> no `w:line`; `calc(1em + 4px)` `240 auto` -> no `w:line`.
- `pnpm turbo typecheck --filter=./packages/docx-io`: 8 tasks successful (after `pnpm turbo build --filter=./packages/docx`).
- `pnpm turbo build --filter=./packages/docx --filter=./packages/docx-io`: 9 tasks successful.
- `pnpm lint:fix`: 3308 files checked.
- `pnpm brl`: 52 tasks successful, `git status` shows no barrel change.
- `pnpm changeset status`: `@platejs/docx-io` listed for a patch bump; `getChangesetValidationErrors` from `tooling/scripts/auto-release-pr.mjs` returns no error.
- `pnpm test:slowest` (three standalone runs before the review fixes): `xml-builder.spec.ts` 34.6-36.0 ms across 7 tests, slowest case 20.0 ms (limits 75 ms/test, 150 ms/file).
- `pnpm check` (`pnpm lint && pnpm typecheck && pnpm test:all && pnpm test:slowest`, `~/code/plate`, after the review fixes): exit 0; lint clean, `g:build` and `typecheck` 54/54 tasks, fast lane 3579 tests across 668 files plus the isolated `mock.module` specs and the slow lane all passing; `test:slowest` records `xml-builder.spec.ts` at 37.15 ms across 12 tests (slowest case 20.01 ms) and flags only an unrelated `apps/www` spec in its warning zone.
- Toolchain: Node v24.12.0 (`.nvmrc` pins 22; `engines` allows >=18.12), pnpm 9.15.0 through Corepack, bun 1.3.9 from the root devDependencies.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-10-07-fix-docx-io-line-height-units.md`: `[autogoal] complete`

Final handoff contract:
- PR line: `🐛 Fixes ➖ N/A` (no public issue; the task came with its own measured reproduction)
- Issue / tracker line: N/A
- Confidence line: `🟢 90-95% confidence`
- Flow table:
  - Reproduced: tests 🔴 12 cases red with `main`'s `xml-builder.ts`, browser ➖ N/A
  - Verified: tests 🟢 package lane, typecheck, build, lint, brl, `pnpm check`, browser ➖ N/A
- Browser check: N/A; headless conversion
- Outcome: `line-height` is exported with its unit: `px`/`pt`/`cm`/`in` as an absolute height in twips (`atLeast`), `%` and unitless as a line multiplier independent of the font size, `normal` as the document default
- Caveat: `atLeast` chosen over `exact` for absolute heights; `rem`, `mm` and other units keep the document default; the structured autoreview helper could not authenticate in this environment, substitute review recorded
- Design:
  - Chosen boundary: `fixupLineHeight` (the only reader of the CSS value) and `buildSpacing` (the only writer of `w:spacing`), linked by a `LineSpacing` attribute
  - Why not quick patch: converting units inside the old numeric signature would still write an absolute height under `lineRule="auto"`
  - Why not broader change: no other attribute shares the bug; the dangling `lineRule="auto"` without `w:line` is pre-existing and harmless
- Verified: see Verification evidence
- PR body verified: after creation, with `gh pr view --json body`

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
- PR: PR #5145 (https://github.com/udecode/plate/pull/5145)
- Task plan at exact PR head: this file is committed on `fix/docx-io-line-height-units` and pushed to the head of PR #5145
- Issue / tracker: N/A
- Browser proof: N/A
- Caveats: `atLeast` vs `exact` is a one-word maintainer call; autoreview helper blocked on authentication, substitute review recorded

Timeline:
- 2026-10-07 Task goal plan created.
- 2026-10-07 Repro against `main` source, fix, spec, changeset, package gates, timing gate, first `pnpm check`.
- 2026-10-07 Autoreview helper blocked (OAuth); substitute review run; its 5 findings resolved (anchored parse, `atLeast`, zero guard, spy restore in `afterEach`); gates and `pnpm check` rerun.
- 2026-10-07 PR #5145 opened after the requesting user's approval; plan synced with the PR number and pushed to its head.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete: PR #5145 open with this plan at its head |
| Where am I going? | Bot and maintainer review on PR #5145 |
| What is the goal? | Export CSS `line-height` with its unit in `@platejs/docx-io` |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Maintainers may prefer `exact` over `atLeast` for absolute heights (one-word change in `fixupLineHeight`).
- The structured autoreview helper did not run; the Codex bot review on the PR will be the first automated review.
