# restore ai chat plugin identifier

Objective:
Restore the registry AI chat descriptor identifier to `aiChatPlugin`; done when
all scoped callers compile and no `AIChatKitPlugin` references remain.

Goal plan:
docs/plans/2026-07-31-restore-ai-chat-plugin-identifier.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: direct user correction
- id / link: N/A: current conversation
- title: restore `aiChatPlugin` identifier
- acceptance criteria: keep the finalized installed descriptor identity, rename
  only the exported local identifier and its callers, and prove no stale name.

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
- initial confidence score: N/A: binary rename
- improvement loop: N/A: one-shot micro edit
- final score / loop closure: N/A: source audit plus type/browser proof

Completion threshold:
- `aiChatPlugin` is the exported finalized `AIChatPlugin.extend(...).configure(...)`
  descriptor and the exact descriptor installed in `AIKit`.
- `use-chat.ts` and `settings-dialog.tsx` use that same descriptor.
- Zero `AIChatKitPlugin` matches remain in the scoped registry source; www
  typecheck, scoped formatting, and the relevant AI demo route pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-31-restore-ai-chat-plugin-identifier.md` passes.

Verification surface:
- `rg` stale-name audit in the three scoped registry files.
- `pnpm turbo typecheck --filter=./apps/www`.
- scoped Biome on the three TypeScript files.
- Browser proof on the standalone AI demo route discovered from registry source.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: user correction, live diff, and exact descriptor-identity
  requirement in the current Core contract.
- Allowed edit scope: `ai-kit.tsx`, `use-chat.ts`, and `settings-dialog.tsx`;
  this plan only records the micro task.
- Browser surface: standalone registry AI demo route resolved from source.
- Browser strategy: Browser DOM/console/network smoke. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no issue or PR requested.
- Non-goals: no plugin behavior, state, component binding, API, docs, release,
  package, or naming changes beyond this identifier.

Output budget strategy:
- Search only the three caller files plus the registry route index; cap command
  output and record counts rather than streaming repository-wide results.

Blocked condition:
- Stop only if the lowercase identifier cannot preserve exact installed
  descriptor identity or a scoped caller requires the rejected uppercase name.

Task state:
- task_type: registry identifier correction
- task_complexity: micro
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete after checker

Current verdict:
- verdict: implement scoped rename
- confidence: high
- next owner: task
- reason: capitalization and `Kit` suffix are cosmetic; exact descriptor
  identity comes from exporting the finalized descriptor, not its variable name.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-31-restore-ai-chat-plugin-identifier.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Rename only; preserve finalized descriptor identity and behavior. |
| Timed checkpoint parsed | no | N/A: no duration. |
| Skill analysis before edits | yes | Plate Next review mode identifies this as cosmetic registry naming drift. |
| Active goal checked or created | yes | Active goal points to this plan. |
| Source of truth read before edits | yes | Read live diff, `origin/main`, scoped callers, and Plate Next doctrine. |
| Tracker comments and attachments read | no | N/A: direct user task. |
| Video transcript evidence required | no | N/A: no media evidence. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: mechanical identifier correction. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior changes. |
| Branch decision for code-changing task | no | N/A: user did not request git operations. |
| Release artifact decision | no | N/A: internal registry identifier only. |
| Browser tool decision for browser surface | yes | Browser smoke on the existing standalone AI demo route. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Three-file searches and capped proof output only. |

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
- [x] Final handoff shape decided: concise outcome, scoped proof, browser result.
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
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Exact-name audit clean; www typecheck and Browser proof pass. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: cosmetic identifier regression proven by live diff. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Exact descriptor is installed; AI demo renders. |
| TypeScript or typed config changed | yes | Run relevant typecheck | www typecheck: 57/57 tasks. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports or files moved. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest or lockfile edit. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent source edited. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in `/Users/zbeyens/git/plate-2`; Browser used localhost www. |
| Browser surface changed | yes | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | `/blocks/ai-demo` rendered the AI Menu editor. |
| Browser final proof | yes | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | Screenshot inspected; final reload had 0 console and 0 network failures across 128 responses. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no template output edited. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: local registry identifier only. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no copied component behavior or user-facing registry delta. |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: no content docs edited. |
| High-risk mini gate | no | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | N/A: identifier-only correction preserving object identity. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent tooling changed. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no corruption signal. |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: mechanical three-file identifier rename with type/browser proof. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Scoped Biome checked 3 files with no fixes. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Searches stayed scoped; typecheck output was capped. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-31-restore-ai-chat-plugin-identifier.md` | Final checker passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read diff, main owner, callers, and doctrine | Implementation |
| Implementation | complete | Renamed descriptor and three scoped caller references | Verification |
| Verification | complete | Exact-name audit, Biome, www types, and Browser pass | Closeout |
| PR / tracker sync | complete | N/A: neither requested | Final response |
| Closeout | complete | Plan evidence recorded | Final response |

Findings:
- The finalized configured descriptor must be exported and installed by exact
  identity; its variable name has no effect on that requirement.
- `AIChatKitPluginState` remains valid because it names the app-specific state
  contract, not the descriptor.

Decisions and tradeoffs:
- Restore the established lowercase `aiChatPlugin` identifier without undoing
  `.configure({ component: AIAnchorElement })` on the exported object.

Implementation notes:
- Renamed the exported descriptor, `AIKit` entry, and callers in `use-chat.ts`
  and `settings-dialog.tsx`.

Review fixes:
- N/A: no review findings; the user correction defined the exact scope.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `rg -n '\bAIChatKitPlugin\b'` across the three scoped files: zero matches.
- Scoped Biome: 3 files checked, no fixes.
- `pnpm turbo typecheck --filter=./apps/www`: 57/57 tasks passed.
- Browser `/blocks/ai-demo`: AI Menu rendered; final reload recorded zero
  console failures and zero network failures across 128 responses.

Final handoff contract:
- PR line: N/A: not requested
- Issue / tracker line: N/A: direct user task
- Confidence line: high
- Flow table:
  - Reproduced: live diff showed cosmetic rename; browser behavior unchanged
  - Verified: typecheck/format/source audit pass; Browser smoke pass
- Browser check: `/blocks/ai-demo` rendered cleanly
- Outcome: established lowercase identifier restored
- Caveat: `AIChatKitPluginState` intentionally remains as the kit state type
- Design:
  - Chosen boundary: rename only the descriptor identifier and exact callers
  - Why not quick patch: this is the smallest correct patch
  - Why not broader change: no behavior or API redesign was authorized
- Verified: source audit, scoped Biome, www typecheck, Browser
- PR body verified: N/A: no PR

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
- Browser proof: `/blocks/ai-demo` rendered with clean final console/network capture
- Caveats: one initial dev-server SCIM lookup returned an unrelated 404; the
  final controlled reload captured zero failed responses.

Timeline:
- 2026-07-31T17:37:35.576Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Restore `aiChatPlugin` while preserving exact installed descriptor identity. |
| What have I learned? | See Findings |
| What have I done? | Renamed the scoped identifier and completed source/type/browser proof. |

Open risks:
- None for this identifier-only correction.
