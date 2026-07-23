# Repair media placeholder readonly assignment

Objective:
Repair Media placeholder readonly assignment without weakening immutable plugin
snapshots; finish when the focused regression, Media type/tests/lint, exact
source audit, `check:core`, review, and this checker pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-22-repair-media-placeholder-readonly-assignment.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: delegated local task
- id / link: N/A: no public tracker
- title: Repair Media placeholder readonly assignment
- acceptance criteria: reproduce `packages/media/src/react/placeholder/PlaceholderPlugin.tsx:114`; preserve immutable plugin option/publication snapshots; adapt only the correct mutable Media-local boundary; use no casts or `any`; do not weaken Core types; audit nearby placeholder code; add or update focused coverage; pass Media type/tests/lint/diff and `check:core`; do not touch Table.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A
- initial confidence score: N/A: binary compile/test threshold exists
- improvement loop: reproduce, fix the smallest correct owner, review, verify
- final score / loop closure: N/A: named gates decide completion

Completion threshold:
- The readonly failure is reproduced before the fix and absent afterward.
- Placeholder mutation occurs only on a fresh Media-local mutable object.
- Immutable plugin option/publication snapshots remain readonly; no casts,
  `any`, Core weakening, or Table edits.
- Focused contract, Media type/tests/lint/diff, exact sibling-pattern audit,
  `check:core`, and local autoreview pass with zero accepted findings.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-repair-media-placeholder-readonly-assignment.md` passes.

Verification surface:
- `pnpm turbo typecheck --filter=./packages/media` before and after.
- Focused placeholder contract plus `pnpm --filter @platejs/media test`.
- Scoped Media lint, exact assignment-pattern audit, and `git diff --check` on
  owned files.
- `pnpm check:core` final integration gate.
- Local autoreview over the owned diff.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Preserve immutable plugin option and publication snapshots.
- Adapt the consumer at the correct mutable Media-local boundary.
- No casts, `any`, or weakening Core/public types.
- Do not touch Table.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: root delegation plus the failing Media typecheck and nearby
  placeholder implementation/contracts.
- Allowed edit scope: `packages/media/src/react/placeholder/**`, its focused
  Media tests, and this plan only.
- Browser surface: N/A: compile-time ownership repair with package coverage.
- Browser strategy: N/A: no rendered behavior changes.
- Tracker sync: N/A: no tracker.
- Non-goals: Core type changes, plugin publication changes, Table changes,
  unrelated Media refactors, PR/commit/push.

Output budget strategy:
- Read the named file and adjacent placeholder owners only; use `rg` within
  `packages/media/src/react/placeholder` and cap command output. Run focused
  package checks before the final required `check:core`; exclude generated and
  dependency trees from searches.

Blocked condition:
- Stop only if the failure cannot be reproduced on the frozen checkout or the
  only correct repair requires Core/public-type or Table changes outside this
  delegated authority.

Task state:
- task_type: compile-time bug / consumer ownership repair
- task_complexity: normal, narrow package scope
- current_phase: implementation
- current_phase_status: in_progress
- next_phase: verification
- goal_status: active

Current verdict:
- verdict: valid; exact TS2542 reproduced
- confidence: high on root cause, pending regression and closure proof
- next owner: task
- reason: frozen Table proof names an exact readonly assignment in Media and
  the required boundary is explicit.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-repair-media-placeholder-readonly-assignment.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact file/failure, immutability constraint, mutable-local boundary, no casts/`any`, no Core weakening, sibling audit, focused contract, Media/check:core proof, and Table exclusion are copied above. |
| Timed checkpoint parsed | no | N/A: no duration |
| Skill analysis before edits | yes | `task` plus `autogoal`; no browser/docs/public-API worker needed |
| Active goal checked or created | yes | `get_goal` returned none; goal created for this plan |
| Source of truth read before edits | yes | `PlaceholderPlugin.tsx`, its focused spec, transform caller, and immutable Core option-snapshot contract inspected |
| Tracker comments and attachments read | no | N/A: no tracker |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | yes | Narrow readonly/immutable-option search found no Media-specific precedent; Core resolution contracts prove published nested options are cloned and frozen. |
| TDD decision before behavior change or bug fix | yes | reproduce type failure first; add/update focused mutable-local contract if nearby test owner exists |
| Branch decision for code-changing task | no | N/A: delegated shared-checkout lane; no git branch operations authorized |
| Release artifact decision | no | N/A: internal compile ownership repair, no behavior/public API change |
| Browser tool decision for browser surface | no | N/A: no browser-visible change |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | exact files/scoped `rg`, capped outputs, focused checks before `check:core` |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
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
      `<video-transcripts>` XML, or marked N/A: no video evidence exists.
- [x] Nearby repo instructions and implementation patterns read before edits:
      named plugin, focused spec, transform consumers, and Core immutable option
      publication contracts.
- [ ] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [ ] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [ ] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [ ] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [ ] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [ ] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [ ] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [ ] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [ ] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [ ] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the command, proof, source audit, or artifact check named in this plan | pending |
| Bug reproduced before fix | pending | Record failing test/repro or N/A with reason | pending |
| Targeted behavior verification | pending | Run focused test/proof for changed behavior or record N/A | pending |
| TypeScript or typed config changed | pending | Run relevant typecheck | pending |
| Package exports or file layout changed | pending | Run `pnpm brl` before final verification and keep generated barrel updates | pending |
| Package manifests, lockfile, or install graph changed | pending | Run `pnpm install` and relevant package checks | pending |
| Agent rules or skills changed | pending | Run `pnpm install` and verify generated skill sync | pending |
| Workspace authority proof | pending | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | pending |
| Browser surface changed | pending | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | pending |
| Browser final proof | pending | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | pending |
| CI-controlled template output changed | pending | Restore generated template output or record why it is intentionally kept | pending |
| Package behavior or public API changed | pending | Add a changeset or record why no changeset applies | pending |
| Registry-only component work changed | pending | Update `docs/components/changelog.mdx` or record N/A | pending |
| Docs or content changed | pending | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | pending |
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
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-repair-media-placeholder-readonly-assignment.md` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | in_progress | created plan | implementation |
| Implementation | pending | | verification |
| Verification | pending | | closeout |
| PR / tracker sync | pending | | final response |
| Closeout | pending | | final response |

Findings:
- `pnpm turbo typecheck --filter=./packages/media` reproduces TS2542 exactly at
  `PlaceholderPlugin.tsx:114`: `getOption('uploadingFiles')` is readonly.
- `addUploadingFile` already uses immutable replacement. Only
  `removeUploadingFile` mutates the published record; no sibling placeholder
  option mutation exists.
- Core contracts intentionally clone and freeze nested published options, while
  leaving resource values such as `File` unfrozen. The consumer must clone the
  record before deletion.

Decisions and tradeoffs:
- Clone `uploadingFiles` locally, delete from that fresh mutable record, then
  publish with `setOption` -> preserves the API and snapshot immutability
  without Core weakening, casts, or broader refactoring.

Implementation notes:
- None yet.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Reproduction: `pnpm turbo typecheck --filter=./packages/media` -> failed only
  at `PlaceholderPlugin.tsx:114` with TS2542 after 12 dependency tasks passed.

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
- 2026-07-22T23:52:02.310Z Task goal plan created.
- 2026-07-23 Reproduced TS2542; audited placeholder siblings and immutable Core
  publication contracts; selected mutable-local copy boundary.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Focused regression then implementation |
| Where am I going? | Media verification, check:core, review, closeout |
| What is the goal? | Remove readonly mutation while preserving immutable snapshots and Table/Core boundaries |
| What have I learned? | Only `removeUploadingFile` mutates a published option record; a local shallow copy is the correct owner |
| What have I done? | Reproduced TS2542 and audited the sibling surface |

Open risks:
- Pending.
