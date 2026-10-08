# Fix DOCX export of nested inline formatting

Objective:
Make `@platejs/docx-io` apply every enclosing inline formatting tag to a text run, so a Plate leaf with several marks keeps all of them in the exported DOCX, and ship the fix as one verified PR.

Goal plan:
docs/plans/2026-10-07-fix-docx-io-nested-inline-formatting.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: plain task text from a downstream Plate user (MyNotary), measured on `@platejs/docx-io` 53.3.2 and re-verified on `main` at 53.3.10, then rebased on `main` at 53.3.11 (`6f3815d465`)
- id / link: no tracker item; PR #5150 (https://github.com/udecode/plate/pull/5150), opened as a draft from `fix/docx-io-nested-marks` on fork `vincent69001/plate`, is the only artifact
- title: nested inline formatting tags keep only the innermost one on DOCX export
- acceptance criteria: `<p><em><b>bold italic</b></em></p>` exports a run with `<w:b/>` and `<w:i/>`; every row of the reproduction table matches its expected `<w:rPr>`; the unchanged rows stay unchanged; a Plate leaf `{ text, bold: true, italic: true }` exported through the static renderer keeps both marks; focused tests, package typecheck, lint and `pnpm check` pass; one patch changeset for `@platejs/docx-io`

Timed checkpoint:
- requested duration: none
- semantics: N/A
- initial confidence score: high; the failing code path was read before any edit
- improvement loop: failing tests first, then the `buildRun` rewrite, then focused and repo-wide checks
- final score / loop closure: high for the package behavior covered by the matrix

Completion threshold:
- Every row of the matrix in `packages/docx-io/src/lib/internal/html-to-docx.slow.ts` passes, the app round-trip case in `apps/www/src/__tests__/package-integration/docx-io.roundtrip.slow.tsx` passes, the docx-io build/typecheck/brl lane passes, `pnpm lint:fix` leaves no diff, and `pnpm check` passes.
- One `.changeset/*.md` patch entry for `@platejs/docx-io` exists.
- If a PR is created or updated, this exact task plan exists at the PR head,
  identifies that exact PR, and the PR body names it exactly once.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-10-07-fix-docx-io-nested-inline-formatting.md` passes.

Verification surface:
- `bun test ./packages/docx-io/src/lib/internal/html-to-docx.slow.ts` (matrix of 10 nested-formatting rows), `bun test ./apps/www/src/__tests__/package-integration/docx-io.roundtrip.slow.tsx` (bold italic leaf round trip), `pnpm turbo build|typecheck|brl --filter=./packages/docx-io`, `pnpm lint:fix`, `pnpm check`, structured autoreview on the dirty diff, PR body readback with `gh pr view --json body`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: the task text with its reproduction table, confirmed by running `htmlToDocxBlob` on `main`; `CONTRIBUTING.md`, `AGENTS.md` and the `task`, `testing`, `changeset` and `autoreview` skills.
- Allowed edit scope: the formatting-tag branch of `buildRun` in `packages/docx-io/src/lib/internal/helpers/xml-builder.ts`, the two spec files above, one changeset, this plan.
- Browser surface: none; the package produces a DOCX blob and has no browser-facing UI in this change.
- Tracker sync: N/A, no issue was opened; the PR is the intake.
- Non-goals: `<w:rPr>` child ordering, `<br>` or `<a>` nested inside a formatting tag, any refactor beyond the affected branch, registry or docs changes.

Output budget strategy:
- Read the exact source ranges of `buildRun`, `buildRunOrRuns` and `buildRunProperties`; capture the reproduction output through a scratch script that prints one line per run; pipe build, typecheck and test output to scratch logs and grep the status lines.

Blocked condition:
- A `pnpm check` failure that survives one `pnpm run reinstall`, or a review finding that requires widening the change beyond `buildRun`; the user also keeps the explicit go/no-go on push and PR creation.

Task state:
- task_type: package bug fix
- task_complexity: non-trivial one-shot
- current_phase: closeout
- current_phase_status: complete
- next_phase: the requesting user flips the draft to ready; bot and maintainer review
- goal_status: complete

Current verdict:
- verdict: valid
- confidence: high
- next owner: task
- reason: the bug reproduced on `main` with the exact table from the task; the rewrite fixes every broken row without changing the unchanged rows

Pre-solution issue challenge:
- reporter claim: `buildRun` keeps only the innermost formatting tag of a single-child nested chain because `tempAttributes` is reset at each tag and only folded into `attributes` when the tag has more than one child
- suggested diagnosis or fix: give each subtree its inherited attributes, as the `span` branch already does, and drop the `children.length > 1` heuristic; keep `buildFormatting` and the `runPropertiesFragment` import if other paths use them
- repro ladder:
  - tests / source-level repro: scratch script on `main` reproduced the 9 rows of the task table (4 broken, 5 unchanged) plus `<b><em>p <s>q</s></em><u>r</u></b>` where `r` wrongly inherits italic; 5 of the first 10 `it.each` rows and the new app round-trip case fail on `main`
  - Playwright / automated browser: N/A, the package output is a DOCX blob with no DOM surface
  - Browser plugin: N/A, same reason
  - screenshot / visual proof: N/A, the proof is the `<w:rPr>` content of each run
- reproduction verdict: reproduced at the package boundary
- validity verdict: valid
- best long-term fix boundary: the formatting-tag loop of `buildRun`; each queued node carries the attributes inherited from its formatting ancestors, which is the model the `span` branch already uses
- harsh honest feedback: the diagnosis was correct and complete; the multi-child case also leaked flags to later siblings, which the suggested fix covers as well
- hard-stop decision: proceed

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-10-07-fix-docx-io-nested-inline-formatting.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Timed checkpoint parsed | no | N/A: no requested duration |
| Skill analysis before edits | yes | `task`, `autogoal`, `testing`, `changeset` and `autoreview` read before editing |
| Active goal checked or created | no | N/A: no native goal tool in this session; this file owns execution |
| Source of truth read before edits | yes | Task text and `buildRun` / `buildRunOrRuns` / `buildRunProperties` read in full |
| Tracker comments and attachments read | no | N/A: no tracker item |
| Video transcript evidence required | no | N/A: no video |
| Pre-solution issue challenge required | yes | Claim reproduced with a scratch script on `main` before any edit |
| Reproduction verdict before implementation | yes | Reproduced; see the repro ladder |
| Repro escalation ladder selected | yes | Source-level repro and failing tests; browser levels N/A |
| Suggested fix reviewed against durable boundary | yes | Per-node inherited attributes inside `buildRun`, matching the `span` branch |
| `docs/solutions` checked for non-trivial existing-code work | yes | docx entries concern import, lists and typecheck; none covers run formatting |
| TDD decision before behavior change or bug fix | yes | Matrix and round-trip tests written and run red before the fix |
| Branch decision for code-changing task | yes | Dedicated `fix/docx-io-nested-marks` from `upstream/main` in its own worktree |
| Release artifact decision | yes | One `@platejs/docx-io` patch changeset |
| Browser tool decision for browser surface | no | N/A: no browser surface |
| PR expectation decision | yes | One PR, opened as a draft after the requesting user approved the title and body shown in the session: PR #5150 (https://github.com/udecode/plate/pull/5150) |
| Dedicated task plan selected for exact PR | yes | This plan owns PR #5150 (https://github.com/udecode/plate/pull/5150) only |
| Tracker sync expectation decision | no | N/A: no tracker item |
| Output budget strategy recorded | yes | See Output budget strategy |
| Package/API pack selected | yes | Published package runtime behavior changes |
| Public surface or package boundary identified | yes | `htmlToDocxBlob`, `exportToDocx` and `DocxExportPlugin` output; no export or type change |
| Release artifact path selected | yes | `.changeset/docx-io-nested-inline-formatting.md`, patch |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded; one package, imperative one-line summary |
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
      head, and this plan records that exact PR number or URL. PR #5150 (https://github.com/udecode/plate/pull/5150): the body carries the line once; this file is committed on `fix/docx-io-nested-marks` and pushed to the PR head.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason. The first `@platejs/docx` resolution error in the docx-io typecheck disappeared after the root `pnpm build`, as `docs/solutions` documents; no reinstall needed.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior. All commands ran from the repo root of the `fix/docx-io-nested-marks` worktree with Node 24.12.0, pnpm 9.15.0 via `packageManager`, Bun 1.4.2.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason. Dirty local diff, `--mode local`.
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
| Repro escalation ladder | yes | For bug/behavior claims, record test/source-level, Playwright, Browser, and screenshot/visual-proof outcomes or N/A/blocker reasons before `not reproduced` | Source-level repro and red tests; browser levels N/A |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | 5 matrix rows and the app round-trip case fail on `main` |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | docx-io slow spec 49 pass; app round-trip spec 6 pass |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./packages/docx-io` passes after the root build |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no export or layout change; `brl` run anyway with no diff |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest change |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands from the worktree root, see Work Checklist |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no browser surface |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: `templates/**` untouched |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | `.changeset/docx-io-nested-inline-formatting.md` |
| User-visible registry output changed | no | Use the registry-changelog pack: add/update `apps/www/src/registry/changelog/entries/*.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --check`, or record N/A | N/A: no registry change |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for supporting public docs/content/API/example changes, load `docs-creator` and close the docs pack; for typo/link-only edits, record the explicit reason and proportional proof | N/A: no docs change |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: a run losing or gaining a formatting flag; proof: the 10-row matrix covers single-child chains, multi-child chains, siblings after a nested tag and spans in between; boundary: the loop that owns run attributes |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: the only resolution error was the documented missing root build |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | Helper run with `--mode local --engine claude` (Codex not installed): the nested Claude CLI could not authenticate from this session, exit 1. Replaced by an independent Claude review agent on the dirty diff: no correctness bug; one accepted finding (duplicate `<w:highlight>` when highlight tags nest) fixed and covered; coverage and changeset wording findings applied |
| PR create or update | yes | Run `check` before PR work and sync PR body to the task-style final handoff | `pnpm check` exit 0 before PR work; PR body mirrors the final handoff contract |
| Per-PR task ownership | yes | Verify one task-plan body line, plan at exact head, and exact PR ownership in this plan | PR #5150 (https://github.com/udecode/plate/pull/5150) body carries one `🧭 Task plan: docs/plans/2026-10-07-fix-docx-io-nested-inline-formatting.md` line; this plan names PR #5150 and is pushed to its head |
| Task-style PR body verified | yes | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | `gh pr view 5150 --json body`: auto-release block present, one task-plan line, no self-link, `🐛 Fixes ➖ N/A`, `🟢 95% confidence` line, `Phase / 🧪 Tests / 🌐 Browser` table with Reproduced and Verified rows, bold emoji Outcome/Caveat/Design/Verified sections |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no image |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker item |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix`: 3307 files checked, no fixes left to apply |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Build, typecheck and check output went to scratch logs; only status lines were read |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-10-07-fix-docx-io-nested-inline-formatting.md` | Passes at the head that records PR #5150 |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | `xml-builder.ts` export list unchanged; `buildFormatting` still feeds `buildRunProperties`; no type exported |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published package runtime behavior |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | One `@platejs/docx-io: patch` file |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: artifact added |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | `pnpm turbo build|typecheck|brl --filter=./packages/docx-io` pass; focused specs pass |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: run anyway, no diff |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | Contribution docs, skills and `buildRun` read; bug reproduced on `main` | implementation |
| Implementation | done | `buildRun` formatting-tag loop carries inherited attributes per node; matrix and round-trip tests; changeset | verification |
| Verification | done | Focused specs, docx-io build/typecheck/brl, lint, root build, `pnpm check`, autoreview | PR |
| PR / tracker sync | done | Draft PR #5150 (https://github.com/udecode/plate/pull/5150) opened after the requesting user's approval; no tracker item | closeout |
| Closeout | done | Plan names PR #5150 and is pushed to its head | final response |

Findings:
- `buildRun` flattens a formatting subtree into one queue; `tempAttributes` is reset to `{}` at every formatting tag and only folded into `attributes` when the tag has more than one child. A single-child chain therefore keeps the innermost flag only.
- The same fold is permanent for the rest of the loop, so in `<b><em>p <s>q</s></em><u>r</u></b>` the `u` sibling inherits the italic of its closed `em` sibling.
- Plate's static renderer emits exactly that single-child chain for any leaf with several marks (one tag per mark plugin, first registered plugin innermost), so every multi-mark leaf exported through `exportToDocx` lost marks.
- The `span` branch of the same loop already passes `{ ...attributes, ...tempAttributes }` down, which is the correct model.
- `buildRunProperties` emits one `<w:rPr>` child per attribute key, so `mark` plus `code` (or `sub` plus `sup`) on one run would duplicate `<w:highlight>` (or `<w:vertAlign>`); the loop resolves those groups to the innermost tag.

Decisions and tradeoffs:
- Keep the iterative loop and give each queued node its own inherited attributes instead of recursing through `buildRunOrRuns` for every child: `buildRun` does not descend into unknown tags such as `<a>` or `<abbr>`, so plain recursion would have dropped their text, which the loop keeps today.
- Keep `buildFormatting` and the `runPropertiesFragment` import: they still feed the empty-tag run (`<b></b>` keeps producing a run with `<w:b/>`).
- Resolve `mark`/`code`/`kbd` and `sub`/`sup` to the innermost tag inside the loop rather than deduplicating in `buildRunProperties`: the loop is where nesting is known, and the single-child behavior on `main` already let the innermost tag win.
- Leave `<w:rPr>` child ordering, `<br>` inside a formatting tag and `<a>` inside a formatting tag as they are; they are separate pre-existing behaviors.

Implementation notes:
- `packages/docx-io/src/lib/internal/helpers/xml-builder.ts`: the formatting-tag branch of `buildRun` queues `{ attributes, vNode }` pairs; a formatting tag copies its parent's attributes and sets its flag for its children; a text node builds its run from its own attributes. The original loop structure and variable names are kept so the diff shows only the logical change.
- `packages/docx-io/src/lib/internal/html-to-docx.slow.ts`: `it.each` matrix of 15 rows asserting the exact ordered `[text, sorted <w:rPr> children]` runs of each paragraph (helper `getTextRuns`), plus one test pinning the `lightGray` highlight of `<mark><code>`.
- `apps/www/src/__tests__/package-integration/docx-io.roundtrip.slow.tsx`: a bold italic leaf round trips through `serializeHtml`, `htmlToDocxBlob` and the mammoth import.
- `.changeset/docx-io-nested-inline-formatting.md`: patch.

Review fixes:
- Accepted: with per-node inheritance, `<mark><code>x</code></mark>` set both `mark` and `code`, so `buildRunProperties` emitted two `<w:highlight>` in one run (the old loop kept the innermost tag only in that single-child case, but already emitted two in the multi-child case `<mark>a <code>x</code> c</mark>`). The switch now makes `mark`/`code`/`kbd` and `sub`/`sup` exclusive, the innermost tag winning; rows `<mark><code>` and `<sub><sup>` plus an explicit `lightGray` highlight test cover it.
- Accepted: the matrix only exercised `b`, `i`, `u`, `s` and looked runs up by text without checking the run count. It now compares the exact ordered list of `[text, formatting]` runs and adds `del`/`ins`, `sup`, `kbd` rows.
- Accepted: the changeset described tags instead of marks and omitted the sibling leak; reworded as user-visible marks.
- Rejected: updating the slow spec header comment and the pre-existing `span` comment placement, both out of scope.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `bun test <path>` matched no file without a `./` prefix | 1 | Use `./` paths | Specs ran |
| docx-io typecheck: `@platejs/docx` unresolved and `it.each` rows inferred as readonly tuples | 1 | Root `pnpm build`; type the rows as `Record<string, string[]>` | Typecheck passes |
| App round-trip spec: `@platejs/core` unresolved before any build | 1 | Root `pnpm build` | Spec passes |

Verification evidence:
- Reproduction on `main` (scratch script over `htmlToDocxBlob`): `<em><b>` gives `<w:b/>` only; `<b><em>` gives `<w:i/>` only; `<u><em><b>` and `<span><u><em><b>` give `<w:b/>` only; `r` in `<b><em>p <s>q</s></em><u>r</u></b>` gets `<w:i/>`; the 5 other rows match the expected output.
- `bun test ./packages/docx-io/src/lib/internal/html-to-docx.slow.ts` on `main` with the first 10 rows: 5 fail; on the final fix with 15 rows and the highlight test: 49 pass, 0 fail.
- `bun test ./apps/www/src/__tests__/package-integration/docx-io.roundtrip.slow.tsx` with docx-io built from `main`: 5 pass, 1 fail, the leaf comes back with `bold` only and no `italic`; with the fix: 6 pass, 0 fail.
- `pnpm turbo build --filter=./packages/docx-io`: 8 successful. `pnpm turbo typecheck --filter=./packages/docx-io`: 8 successful after the root `pnpm build` (54 successful). `pnpm turbo brl --filter=./packages/docx-io`: no diff.
- `pnpm lint:fix`: formatted the two spec files once, then no fixes left.
- `pnpm check` from the worktree root: exit 0 (lint, `g:build` 54 successful, typecheck 54 successful, `test:all` fast and slow lanes, `test:slowest` within thresholds), 2026-10-07 15:58 to 15:59 CEST
- Autoreview: helper attempted with the Claude engine, nested CLI authentication failed (exit 1 in 73 ms); independent Claude review agent on the dirty diff instead, see Review fixes.
- Codex is not installed on this machine, so `codex review --base origin/main` was not run; the PR says so.

Final handoff contract:
- PR line: PR #5150 (https://github.com/udecode/plate/pull/5150), opened as a draft; body line `🐛 Fixes ➖ N/A`
- Issue / tracker line: 🐛 Fixes ➖ N/A
- Confidence line: 🟢 95% confidence in the verified package behavior
- Flow table:
  - Reproduced: tests 🔴 5 new matrix rows and the app round-trip case fail on `main`; browser ➖ N/A
  - Verified: tests 🟢 focused docx-io and app specs, `pnpm check`; browser ➖ N/A
- Browser check: N/A, no browser surface
- Outcome: every enclosing inline formatting tag is applied to each text run, so a multi-mark Plate leaf keeps all its marks in the DOCX
- Caveat: `<w:rPr>` child order still follows insertion order; `<br>` and `<a>` nested in a formatting tag keep their pre-existing behavior; nested highlight or vertical-alignment tags resolve to the innermost one
- Design:
  - Chosen boundary: the formatting-tag loop of `buildRun`, where run attributes are decided
  - Why not quick patch: folding `tempAttributes` into `attributes` unconditionally would leak flags to later siblings (`<b><em>x</em><u>y</u></b>` would make `y` italic)
  - Why not broader change: recursing through `buildRunOrRuns` for every child would drop the text of tags `buildRun` does not descend into (`<a>`, `<abbr>`)
- Verified: focused specs, docx-io build/typecheck/brl, lint, root build, `pnpm check`, autoreview
- PR body verified: `gh pr view 5150 --json body` at the first pushed head shows the auto-release block, one task-plan line, the fix, confidence, table and four sections; repeated after the plan-ownership push

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
- PR: PR #5150 (https://github.com/udecode/plate/pull/5150), draft
- Task plan at exact PR head: this file is committed on `fix/docx-io-nested-marks` and pushed to the head of PR #5150
- Issue / tracker: N/A, no tracker item
- Browser proof: N/A, no browser surface
- Caveats: hosted CI, review and release are separate authorities

Timeline:
- 2026-10-07T13:44:32.644Z Task goal plan created.
- 2026-10-07 Bug reproduced on `main`, tests written red, `buildRun` fixed, focused lane and root build green, first `pnpm check` green.
- 2026-10-07 Independent review: highlight duplication fixed with exclusive flag groups, matrix extended to 15 rows, changeset reworded, `pnpm check` rerun.
- 2026-10-08 Rebased on `main` 53.3.11 (`6f3815d465`); install, lint, `pnpm check` and focused specs green again.
- 2026-10-08 Draft PR #5150 opened after the requesting user's approval; plan synced with the PR number and pushed to its head.
- 2026-10-08 Loop reshaped to keep the original structure and names (26 lines added, 26 removed in `xml-builder.ts`), same behavior and tests; `pnpm check` rerun; the branch was squashed into one commit and force-pushed with lease while the PR was still a draft without review.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete: draft PR #5150 open with this plan at its head |
| Where am I going? | The requesting user flips the draft to ready; bot and maintainer review on PR #5150 |
| What is the goal? | Every enclosing inline formatting tag reaches the DOCX run, shipped as one verified PR |
| What have I learned? | The loop reset `tempAttributes` per tag and only folded it for multi-child tags; the `span` branch already had the right model |
| What have I done? | Reproduction, matrix and round-trip tests, `buildRun` rewrite, changeset, focused and root builds, lint |

Open risks:
- Hosted CI runs on Node 22 and the latest Bun; local verification used Node 24.12.0 and Bun 1.4.2.
