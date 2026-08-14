# reuse static heading renderer for docx

Objective:
Reuse the canonical static heading renderer inside DOCX headings and wire all six DOCX heading overrides into the export kit without changing unrelated registry behavior.

Goal plan:
docs/plans/2026-08-13-reuse-static-heading-renderer-for-docx.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: direct user request
- id / link: current Codex task
- title: Reuse HeadingElementStatic for DOCX headings
- acceptance criteria: DOCX headings compose the canonical static renderer; h1-h6 are actually installed by DocxExportKit; copied registry dependencies remain complete; focused checks pass.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A: no duration requested
- initial confidence score: 0.95
- improvement loop: one implementation and focused verification pass
- final score / loop closure: 1.0; implementation and focused proof complete

Completion threshold:
- One shared heading renderer owns markup/classes; six DOCX wrappers add only bookmark children; DocxExportKit maps PLUGINS.h1-h6 to those wrappers; registry metadata includes heading-node; focused formatting, source integrity, and www typecheck pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-13-reuse-static-heading-renderer-for-docx.md` passes.

Verification surface:
- Biome check for the three touched registry source files.
- Registry source checker.
- Source audit confirming all six mappings and no duplicated DOCX heading shell.
- apps/www TypeScript check.
- Browser N/A: this is static DOCX serialization wiring with no standalone rendered route; native DOCX export/download proof is outside this narrow composition fix.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: heading-node-static.tsx, docx-export-kit.tsx, registry-kits.ts, and the existing 2026-08-13 DOCX runtime-key changelog entry.
- Allowed edit scope: those three registry source files plus this goal plan; generated changelog JSON only if the existing entry changes.
- Browser surface: DOCX static export only.
- Browser strategy: N/A for this refactor/wiring fix; use Chrome only if native download behavior itself is changed. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no issue or PR requested.
- Non-goals: package APIs, heading styles, bookmark format, TOC logic, unrelated registry components, and native download behavior.

Output budget strategy:
- Read exact owner files and use bounded rg searches; cap all command output.

Blocked condition:
- Block only if the existing static renderer cannot accept the DOCX bookmark child without a public API or runtime behavior change.

Task state:
- task_type: registry composition repair
- task_complexity: trivial
- current_phase: implementation
- current_phase_status: in_progress
- next_phase: implementation
- goal_status: active

Current verdict:
- verdict: compose HeadingElementDocx through HeadingElementStatic and wire the existing exported wrappers.
- confidence: 0.95
- next owner: task
- reason: the DOCX variant differs only by an injected bookmark; duplicating the whole renderer is unjustified, and the wrappers are currently dead without kit mappings.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-13-reuse-static-heading-renderer-for-docx.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact reuse and wiring scope recorded above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | plate-ui, registry-changelog, autogoal read; existing changelog entry already owns this behavior |
| Active goal checked or created | yes | No prior goal; create after this plan is materialized |
| Source of truth read before edits | yes | Exact renderer, kit, metadata, usages, and changelog entry inspected |
| Tracker comments and attachments read | no | N/A: direct request only |
| Video transcript evidence required | no | N/A |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: trivial local composition fix |
| TDD decision before behavior change or bug fix | yes | No new unit test: focused source audit and typecheck cover declarative wiring |
| Branch decision for code-changing task | no | N/A: user did not request git operations |
| Release artifact decision | yes | Existing draft changelog entry already names DOCX bookmark wiring; no duplicate entry |
| Browser tool decision for browser surface | no | N/A: static DOCX serialization composition, not an ordinary rendered route |
| PR expectation decision | no | N/A |
| Tracker sync expectation decision | no | N/A |
| Output budget strategy recorded | yes | Exact files and capped searches only |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
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
- [x] Review/P2 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Biome 3/3, registry source check, 6/6 ownership audit, scoped TypeScript pass |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Source audit proved 0/6 DOCX heading overrides and duplicated renderer shell before patch |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Ownership audit passed 6/6 mappings and one shared shell |
| TypeScript or typed config changed | yes | Run relevant typecheck | Scoped apps/www TypeScript project passed; broad app check remains blocked by unrelated List/Suggestion/Media/Table errors |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package export or file-layout change |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All proof ran in /Users/zbeyens/git/plate-2 or apps/www |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: no standalone route exposes serialized DOCX HTML; native download behavior was not changed |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A: declarative static-export composition verified in source and types |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: registry-only wiring |
| Registry-only component work changed | yes | Update `docs/components/changelog.mdx` or record N/A | Existing draft source entry 2026-08-13-use-runtime-keys-for-toc-docx already owns DOCX heading bookmark wiring; no duplicate event |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A |
| High-risk mini gate | no | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | N/A: no public API or runtime algorithm change |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: failures are current source type errors, not install corruption |
| P2 autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P2` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings; use P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | N/A: trivial three-file declarative wiring fix reviewed by exact diff and source audit |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: not requested |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Completed below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Scoped Biome write/check passed 3/3 |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Exact files, capped rg, and capped command output only |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-13-reuse-static-heading-renderer-for-docx.md` | Final checker rerun after this evidence update |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | exact four-owner audit above | implementation |
| Implementation | complete | shared renderer composition, six kit mappings, copied dependency | verification |
| Verification | complete | Biome, registry source, 6/6 audit, scoped TypeScript, diff check | closeout |
| PR / tracker sync | N/A | not requested | final response |
| Closeout | complete | final plan evidence recorded | final response |

Findings:
- HeadingElementDocx duplicates the canonical static heading shell and differs only by one bookmark child.
- H1ElementDocx through H6ElementDocx are exported but not referenced by DocxExportKit.
- The copied kit metadata omits @plate/heading-node.
- The existing 2026-08-13 runtime-key changelog entry already covers this exact user-visible DOCX bookmark behavior.

Decisions and tradeoffs:
- Compose rather than duplicate -> one markup/style owner -> explicit child insertion preserves the DOCX bookmark.
- Wire all six existing wrappers -> makes the intended behavior real -> no new API.
- Reuse the existing changelog event -> avoids duplicate release prose.

Implementation notes:
- HeadingElementDocx delegates the heading tag, classes, props, and children shell to HeadingElementStatic and inserts only its sanitized runtime-key bookmark.
- DocxExportKit installs H1ElementDocx through H6ElementDocx by PLUGINS.h1-h6.
- docx-export-kit metadata installs @plate/heading-node with the copied kit.

Review fixes:
- Corrected the kit comment from an inline-style-only claim to specialized DOCX markup or inline styles because heading bookmarks are markup.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Full turbo apps/www typecheck failed in unrelated Suggestion package source | 1 | Run direct app TypeScript to classify | Confirmed broader List/Suggestion/Media/Table failures and no touched-file diagnostics |
| First isolated TypeScript pass resolved unrelated code-block source against stale declarations | 1 | Stub only non-target DOCX component imports while keeping heading and kit real | Scoped semantic check passed |
| Registry changelog global check found unrelated stale April JSON | 1 | Keep existing August DOCX entry untouched and record exact external blocker | August entry not listed as stale; registry source check passed |

Verification evidence:
- `pnpm exec biome check --write <3 touched registry files>` -> 3/3 clean.
- `pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-registry-source.mts` in apps/www -> passed.
- Focused Node ownership audit -> one shared renderer, 6/6 DOCX heading mappings, copied heading dependency passed.
- Temporary isolated apps/www TypeScript project with real heading/kit owners and stubs only for unrelated DOCX renderers -> passed; temporary files removed.
- `git diff --check -- <3 touched registry files>` -> passed.
- Broad `pnpm turbo typecheck --filter=./apps/www` -> blocked before www by unrelated Suggestion package errors.
- Direct apps/www `tsc --noEmit` -> unrelated existing List, Suggestion, Media, Table, and test-global errors; no heading or DOCX diagnostics.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A
- Confidence line: 99%
- Flow table:
  - Reproduced: source audit proved duplicated shell and 0/6 installed DOCX heading overrides; browser N/A
  - Verified: source/types/format/registry checks passed; browser N/A
- Browser check: N/A: serialized DOCX HTML has no standalone route and native download behavior was not changed
- Outcome: canonical static heading renderer reused; all DOCX heading variants installed with complete copied dependencies
- Caveat: broad shared-tree typecheck and global changelog check have unrelated failures recorded above
- Design:
  - Chosen boundary: static heading renderer plus DOCX kit composition and registry metadata
  - Why not quick patch: leaving the wrappers unwired would preserve dead code and broken DOCX bookmarks
  - Why not broader change: TOC, bookmark format, exporter, and other static renderers already have separate owners
- Verified: exact commands recorded above
- PR body verified: N/A

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
- PR: N/A
- Issue / tracker: N/A
- Browser proof: N/A with exact static-export reason above
- Caveats: unrelated shared-tree typecheck and April changelog artifact failures only

Timeline:
- 2026-08-13T18:48:15.456Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Reuse the canonical static heading renderer in DOCX headings and wire h1-h6 into DocxExportKit |
| What have I learned? | See Findings |
| What have I done? | Composed the renderer, wired six overrides, repaired copied dependency metadata, and ran focused proof |

Open risks:
- Shared-tree broad typecheck and the global changelog generator remain red from unrelated existing work; touched owners pass isolated semantic and integrity checks.
