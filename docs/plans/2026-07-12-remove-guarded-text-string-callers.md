# Remove guarded text string callers

Objective:
Remove all guarded selection text.string callers; done when exact and equivalent sweeps reach zero, affected package checks and review pass; plan docs/plans/2026-07-12-remove-guarded-text-string-callers.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-12-remove-guarded-text-string-callers.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: direct user batch request
- id / link: N/A
- title: Replace all guarded current-selection `text.string` callers
- acceptance criteria: find every source caller that reads `editor.read.selection()` only to guard `editor.read.text.string(selection)` with `''`; replace safe equivalents with `editor.read.text.string()`; exact and equivalent source sweeps return zero; affected package proof and autoreview pass

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: none
- semantics: N/A
- initial confidence score: 0.90
- improvement loop: count -> inspect every match -> patch safe rows -> package proof -> zero-match audit -> review
- final score / loop closure: 0.99; safe equivalent count 1 -> 0, all proof and review green

Completion threshold:
- Zero exact or equivalent guarded current-selection `text.string` source matches, every initial match classified and safely migrated, affected packages lint/typecheck/test/build as applicable, clean autoreview, and final plan checker pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-remove-guarded-text-string-callers.md` passes.

Verification surface:
- Counted `rg -U` source audits for ternary, early-return, nullish, and local helper variants around `editor.read.selection()` plus `editor.read.text.string(selection)`.
- Package-scoped Biome, source-first typecheck, focused tests/build for every affected package, and structured autoreview.
- Browser N/A unless inspection finds behavior beyond pure read-call simplification.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: current source callers and the newly verified Plite no-argument contract in `packages/plite/test/state-query-contract.ts`.
- Allowed edit scope: source files matching the guarded-selection pattern, this plan, and formatting-only changes within those files.
- Browser surface: none expected.
- Browser strategy: N/A for behavior-preserving call simplification. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: direct request.
- Non-goals: no unrelated `text.string(range)` cleanup, no general selection refactor, no public API change, no docs, no PR/commit/push.

Output budget strategy:
- Count/file lists first; print only matching source snippets; exclude dist/generated/node_modules; cap all repo sweeps.

Blocked condition:
- Stop only if a match has observably different fallback/timing semantics or affected package proof exposes a broader API contract problem.

Task state:
- task_type: program/batch mechanical API adoption
- task_complexity: non-trivial counted repo sweep
- current_phase: closeout
- current_phase_status: completed
- next_phase: final handoff
- goal_status: complete after checker

Current verdict:
- verdict: complete; all safe guarded current-selection callers use the no-argument API
- confidence: 0.99
- next owner: none
- reason: user explicitly broadened from one caller to all equivalent source usages

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-remove-guarded-text-string-callers.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | All/equivalent scope, zero-match stop condition, proof, and non-goals recorded |
| Timed checkpoint parsed | N/A | No duration |
| Skill analysis before edits | yes | `task` batch plus `autogoal`; React only if React source matches; autoreview at closeout |
| Active goal checked or created | yes | Prior goal complete; new matching goal created |
| Source of truth read before edits | yes | Verified no-argument Plite contract and prior floating caller migration |
| Tracker comments and attachments read | N/A | Direct request |
| Video transcript evidence required | N/A | No video |
| `docs/solutions` checked for non-trivial existing-code work | yes | Memory/owner guidance confirms substrate defaults should replace local workarounds |
| TDD decision before behavior change or bug fix | N/A | Behavior-preserving caller cleanup; existing Plite contract tests own semantics |
| Branch decision for code-changing task | N/A | Current checkout; no branch/PR requested |
| Release artifact decision | N/A | Caller simplification has no published user-visible delta beyond existing Plite changeset |
| Browser tool decision for browser surface | N/A | No UI/DOM behavior change expected |
| PR expectation decision | N/A | Not requested |
| Tracker sync expectation decision | N/A | No tracker |
| Output budget strategy recorded | yes | Count-first capped source sweeps |

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
| Named verification threshold | passed | Run the command, proof, source audit, or artifact check named in this plan | Four zero-match sweeps plus link proof and review green |
| Bug reproduced before fix | N/A | Record failing test/repro or N/A with reason | Behavior-preserving migration; source count was the acceptance surface |
| Targeted behavior verification | passed | Run focused test/proof for changed behavior or record N/A | Link 68 tests and focused source sweeps green |
| TypeScript or typed config changed | yes | Run relevant typecheck | Link source-first typecheck 12/12 tasks green |
| Package exports or file layout changed | N/A | Run `pnpm brl` before final verification and keep generated barrel updates | No exports/files changed |
| Package manifests, lockfile, or install graph changed | N/A | Run `pnpm install` and relevant package checks | No manifest/lockfile change |
| Agent rules or skills changed | N/A | Run `pnpm install` and verify generated skill sync | No agent files changed |
| Workspace authority proof | passed | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | `/Users/zbeyens/git/plate-2`, owning link scripts |
| Browser surface changed | N/A | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | No UI/DOM behavior change |
| Browser final proof | N/A | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | Package proof is the honest owner |
| CI-controlled template output changed | N/A | Restore generated template output or record why it is intentionally kept | No template output touched |
| Package behavior or public API changed | N/A | Add a changeset or record why no changeset applies | Internal caller adoption only; no published delta beyond existing changesets |
| Registry-only component work changed | N/A | Update `docs/components/changelog.mdx` or record N/A | No registry work |
| Docs or content changed | N/A | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Only internal goal plan changed |
| High-risk mini gate | N/A | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | No contract change; consumes already proven optional API |
| Agent-native review for agent/tooling changes | N/A | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | No agent/tooling changes |
| Local install corruption suspected | N/A | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | No corruption signal |
| Autoreview for non-trivial implementation changes | passed | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | Frozen one-line scope clean; zero findings |
| PR create or update | N/A | Run `check` before PR work and sync PR body to the task-style final handoff | Not requested |
| Task-style PR body verified | N/A | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | No PR |
| PR proof image hosting | N/A | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | No PR/image |
| Tracker sync-back | N/A | Post concise issue/Linear sync after PR exists, or record N/A/blocker | No tracker |
| Final handoff contract | passed | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below |
| Final lint | passed | Run `pnpm lint:fix` or scoped equivalent | Scoped Biome clean |
| Output budget discipline | passed | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Count-first capped sweeps used |
| Timed checkpoint | N/A | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | No duration |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-remove-guarded-text-string-callers.md` | passed after final evidence |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | counted and classified exact/equivalent callers | done |
| Implementation | completed | one safe link caller migrated; explicit Effect snapshot retained | done |
| Verification | completed | four zero-match sweeps, lint, typecheck, 68 tests, build, clean autoreview | done |
| PR / tracker sync | N/A | no PR or tracker requested | done |
| Closeout | completed | handoff and gates recorded | checker |

Findings:
- Exact requested ternary pattern: 0 remaining before this sweep because the floating toolbar was already repaired.
- Equivalent local-current-selection pass-through: 1, `packages/link/src/react/utils/triggerFloatingLinkInsert.ts`; migrated to no-arg `text.string()`.
- Intentional explicit snapshot: `apps/www/.../hovering-toolbar.tsx` uses `useEditorSelection()` across an Effect and must keep the captured range; a later implicit live selection is not equivalent.
- Other `range ? text.string(range) : fallback` matches use computed/partial ranges and are not current-selection fallbacks.

Decisions and tradeoffs:
- Replace only guards whose sole semantic job is `no selection -> ''`; keep explicit range/target logic and non-empty fallbacks.

Implementation notes:
- Replaced the only remaining safe equivalent caller in the link package; no new changeset because this is internal adoption with no user-visible delta beyond the existing Plite/link migration artifacts.

Review fixes:
- Structured autoreview returned zero findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:
- Four exact/equivalent guarded-selection `rg -U --pcre2` sweeps -> 0 matches.
- `pnpm exec biome check packages/link/src/react/utils/triggerFloatingLinkInsert.ts --write` -> clean.
- `pnpm turbo typecheck --filter=./packages/link` -> 12/12 tasks green.
- `pnpm --filter @platejs/link test` -> 68 pass, 97 assertions, 0 fail.
- `pnpm --filter @platejs/link build` -> green.
- Frozen-scope local autoreview -> clean, zero findings.
- Goal checker -> complete after final evidence.

Final handoff contract:
- PR line: N/A; not requested
- Issue / tracker line: N/A; direct user request
- Confidence line: 99%
- Flow table:
  - Reproduced: one safe equivalent source match; browser N/A
  - Verified: zero matches plus package proof; browser N/A
- Browser check: N/A; behavior-preserving read-call cleanup
- Outcome: no guarded local-current-selection `text.string(selection)` callers remain
- Caveat: explicit React Effect selection snapshot intentionally retained
- Design:
  - Chosen boundary: safe local-current-selection pass-through callers only
  - Why not quick patch: repo-wide counted sweep proves completeness
  - Why not broader change: computed ranges and captured snapshots have distinct semantics
- Verified: source sweeps, package proof, and review clean
- PR body verified: N/A; no PR

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
- Browser proof: N/A
- Caveats: one intentional explicit snapshot remains outside the old-usage class

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|--------------|------------------|-------------------|---------------|------------|
| Closeout | Final response | Zero guarded current-selection string callers | Only one safe equivalent remained; captured Effect selections are different | Migrated, swept, proven, reviewed |

Open risks:
- None. The retained explicit snapshot is intentional and documented in this plan.

Timeline:
- 2026-07-12T09:34:58.631Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Implementation, verification, PR/tracker sync, closeout |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Pending.
