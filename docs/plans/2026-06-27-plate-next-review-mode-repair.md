# plate-next review-mode repair

Objective:
Repair plate-next review-mode guidance; done when source rule and generated skill forbid rename-first suggestions and prefer main-parity extraction for installPlateElementSpecs-style helpers.

Goal plan:
docs/plans/2026-06-27-plate-next-review-mode-repair.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user correction
- id / link: current chat
- title: repair `plate-next` review-mode guidance
- acceptance criteria:
  - patch `.agents/rules/plate-next.mdc`, not generated `SKILL.md` by hand;
  - Plate Next must not suggest renames or full Plate v2 closure during review-mode unless explicitly requested;
  - review-mode should stay closest to `origin/main` owner/name shape first;
  - repair the bad `installPlateElementSpecsExtension` taste: do not keep special migration helpers in huge files, but also do not invent a renamed plugin; preserve the main owner such as `OverridePlugin` and move/extract implementation there when that is the closest main-parity cleanup;
  - run `pnpm install` to regenerate the skill mirror;
  - verify source/generated mirror contains the new policy.

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
- initial confidence score: 90/100
- improvement loop: patch source rule, sync generated skill, audit wording
- final score / loop closure: 99/100; source and generated mirror now carry the review-mode policy.

Completion threshold:
- `.agents/rules/plate-next.mdc` has explicit review-mode/main-parity law.
- Generated `.agents/skills/plate-next/SKILL.md` includes the same policy after `pnpm install`.
- The policy specifically prevents rename-first suggestions and fixes the `installPlateElementSpecsExtension`/`OverridePlugin` owner taste.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plate-next-review-mode-repair.md` passes.

Verification surface:
- `pnpm install`
- source audit of `.agents/rules/plate-next.mdc`
- generated mirror audit of `.agents/skills/plate-next/SKILL.md`
- autogoal `check-complete.mjs`

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.agents/rules/plate-next.mdc`
- Allowed edit scope: `.agents/rules/plate-next.mdc`, regenerated `.agents/skills/plate-next/SKILL.md`, this plan, package-manager generated agent sync if any
- Browser surface: N/A
- Browser strategy: N/A, no UI/content change
- Tracker sync: N/A
- Non-goals: renaming `OverridePlugin`, implementing the Core cleanup, full Plate v2 closure, touching runtime/package code

Output budget strategy:
- Only read the named skill/rule, narrow `origin/main` file anchors for `OverridePlugin`, and exact source/generated audits.

Blocked condition:
- Block only if `pnpm install` cannot regenerate skills or the source/generated mirror diverges for reasons unrelated to this patch.

Task state:
- task_type: agent skill repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready-for-close

Current verdict:
- verdict: keep
- confidence: 99/100 after sync/audit
- next owner: task
- reason: Plate Next now has explicit review-mode/main-parity policy and the `OverridePlugin`/`installPlateElementSpecsExtension` correction.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plate-next-review-mode-repair.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria above copy user correction. |
| Timed checkpoint parsed | yes | No duration requested. |
| Skill analysis before edits | yes | Read `plate-next` and `autogoal`; target is source rule repair. |
| Active goal checked or created | yes | Active goal created for this plan. |
| Source of truth read before edits | yes | Read `.agents/rules/plate-next.mdc`; generated mirror read for current behavior. |
| Tracker comments and attachments read | N/A | No tracker/attachments. |
| Video transcript evidence required | N/A | No video. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | Skill repair, no product implementation. |
| TDD decision before behavior change or bug fix | N/A | No runtime behavior change. |
| Branch decision for code-changing task | N/A | No branch operations requested. |
| Release artifact decision | N/A | No package release artifact. |
| Browser tool decision for browser surface | N/A | No browser surface. |
| PR expectation decision | N/A | No PR requested. |
| Tracker sync expectation decision | N/A | No tracker sync. |
| Output budget strategy recorded | yes | Narrow reads/audits only. |
| Agent-native pack selected | yes | `.agents/rules/**` is edited. |
| Agent-facing action surface identified | yes | `plate-next` skill behavior. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/plate-next.mdc`, sync generated skill with `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded `.agents/skills/agent-native-reviewer/SKILL.md`; source/mirror/proof route passes. |

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
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm install`, `bun x skiller@latest apply`, and source/generated audits passed. |
| Bug reproduced before fix | N/A | Record failing test/repro or N/A with reason | Skill behavior repair, not runtime bug. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Generated `plate-next` mirror includes review-mode/main-parity policy. |
| TypeScript or typed config changed | N/A | Run relevant typecheck | Markdown/rule change only. |
| Package exports or file layout changed | N/A | Run `pnpm brl` before final verification and keep generated barrel updates | No exports/file layout changed. |
| Package manifests, lockfile, or install graph changed | N/A | Run `pnpm install` and relevant package checks | `pnpm install` ran; no package code/package behavior changed. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` ran; direct Skiller apply ran because mirror remained stale; audit passed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Commands ran in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | N/A | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | No browser surface. |
| Browser final proof | N/A | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | No browser surface. |
| CI-controlled template output changed | N/A | Restore generated template output or record why it is intentionally kept | No template output touched. |
| Package behavior or public API changed | N/A | Add a changeset or record why no changeset applies | No package behavior/API changed. |
| Registry-only component work changed | N/A | Update `docs/components/changelog.mdx` or record N/A | No registry work. |
| Docs or content changed | N/A | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | No public docs/content changed. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Agent-action risk: bad future recommendations. Proof: generated skill now contains explicit review-mode guard. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Loaded agent-native reviewer; capability map passes after mirror audit. |
| Local install corruption suspected | N/A | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | No install corruption signal. |
| Autoreview for non-trivial implementation changes | N/A | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | Agent rule wording only; agent-native review was the relevant gate. |
| PR create or update | N/A | Run `check` before PR work and sync PR body to the task-style final handoff | No PR requested. |
| Task-style PR body verified | N/A | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | No PR. |
| PR proof image hosting | N/A | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | No PR/browser proof. |
| Tracker sync-back | N/A | Post concise issue/Linear sync after PR exists, or record N/A/blocker | No tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | N/A | Run `pnpm lint:fix` or scoped equivalent | Markdown/rule skill text only; source/generated audit is the proof. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One `rg` was too broad and truncated; recovered with exact audits. |
| Timed checkpoint | N/A | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | No duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plate-next-review-mode-repair.md` | pass |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` then `bun x skiller@latest apply`; mirror audit passed. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `.agents/skills/plate-next/SKILL.md` contains the policy. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Loaded; no remaining accepted finding after sync. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read skill, source rule, main `OverridePlugin`, and generated mirror. | implementation |
| Implementation | complete | Patched `.agents/rules/plate-next.mdc`; regenerated mirror. | verification |
| Verification | complete | Source/generated audit passed. | closeout |
| PR / tracker sync | N/A | No PR/tracker requested. | final response |
| Closeout | complete | Plan updated; checker passed. | final response |

Findings:
- `origin/main` has `OverridePlugin` as the owner for plugin node override behavior.
- Current Plate Next guidance lacked review-mode/main-parity policy, so the answer jumped to rename/delete instead of preserving the main owner.
- `pnpm install` did not regenerate the mirror in this local run; direct `bun x skiller@latest apply` did.

Decisions and tradeoffs:
- Keep `OverridePlugin` as the review-mode owner; future full Plate v2 naming cleanup is separate and explicit.
- Treat `installPlateElementSpecsExtension` in a huge editor file as migration plumbing, but fix by moving/extracting toward existing `OverridePlugin` ownership rather than inventing a new plugin name.
- Add `main-parity-cleanup` verdict so Plate Next is not forced into `hard-cut` or rename-like answers during review.

Implementation notes:
- Patched `.agents/rules/plate-next.mdc`.
- Ran `pnpm install`.
- Ran `bun x skiller@latest apply` because the mirror was still stale after install.
- Verified `.agents/skills/plate-next/SKILL.md` contains the new policy.

Review fixes:
- Agent-native review: source owner and generated mirror are aligned; route is discoverable from `plate-next` skill text.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm install` completed but did not update `plate-next` generated mirror. | 1 | Run Skiller directly and audit source/generated text. | `bun x skiller@latest apply` updated the mirror; audit passed. |

Verification evidence:
- `pnpm install` -> pass.
- `bun x skiller@latest apply` -> pass.
- `rg -n "Review Mode And Main Parity|main-parity-cleanup|OverridePlugin|installPlateElementSpecsExtension|closest-main cleanup now" .agents/rules/plate-next.mdc .agents/skills/plate-next/SKILL.md` -> source and generated mirror both contain the new policy.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: 99/100.
- Flow table:
  - Reproduced: source/mirror policy gap found, browser N/A.
  - Verified: source/mirror audit passed, browser N/A.
- Browser check: N/A, no browser surface.
- Outcome: `plate-next` now defaults named-file/review suggestions to main-parity cleanup and forbids rename-first/full-v2 suggestions unless asked.
- Caveat: generic `.agents` sync guidance still says `pnpm install`; this run needed direct Skiller apply when the mirror stayed stale.
- Design:
  - Chosen boundary: `.agents/rules/plate-next.mdc` as source, generated mirror via Skiller.
  - Why not quick patch: editing generated `SKILL.md` would be lost on sync.
  - Why not broader change: user asked to repair `plate-next`, not global skill sync policy.
- Verified: source/generated audit passed.
- PR body verified: N/A.

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
- Caveats: `pnpm install` did not regenerate in this run; Skiller direct apply did.

Timeline:
- 2026-06-27T19:54:06.013Z Task goal plan created.
- Patched `.agents/rules/plate-next.mdc` with review-mode/main-parity law.
- Ran `pnpm install`.
- Ran `bun x skiller@latest apply`.
- Verified source/generated mirror text.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response |
| What is the goal? | Repair `plate-next` so review mode preserves main owner/name shape first |
| What have I learned? | The old answer missed the review-mode/main-parity constraint |
| What have I done? | Patched source rule, regenerated mirror, audited both |

Open risks:
- Generic sync guidance may need a separate repair if `pnpm install` repeatedly skips Skiller generation.
