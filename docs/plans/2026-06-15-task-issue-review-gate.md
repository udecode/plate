# task issue review gate

Objective:
Harden task issue intake; done when task rule and template require pre-solution issue challenge gates and sync/verification pass.

Goal plan:
docs/plans/2026-06-15-task-issue-review-gate.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user request
- id / link: current thread request
- title: Add pre-solution challenge gates to task workflow
- acceptance criteria: update task rule and `docs/plans/templates/task.md` so public issues are reproduced and reviewed before implementation; hard stop when not reproduced, invalid, or won't-fix; pivot partially valid issues to the best long-term fix; keep final autoreview gate.

Completion threshold:
- `.agents/rules/task.mdc`, generated `.agents/skills/task/SKILL.md`, and
  `docs/plans/templates/task.md` contain a clear pre-solution issue challenge
  gate with hard-stop and partial-validity pivot rules.
- `pnpm install` syncs generated skills after the rule edit.
- Source audit, lint, agent-native review, autoreview, and goal-plan check pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-task-issue-review-gate.md` passes.

Verification surface:
- Source audit with `rg` across task rule, generated task skill, and task
  template.
- `pnpm install`, `pnpm lint:fix`, agent-native review, local autoreview, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-task-issue-review-gate.md`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: user request plus `.agents/AGENTS.md` rule that
  `.agents/rules/*.mdc` owns generated skill mirrors.
- Allowed edit scope: `.agents/rules/task.mdc`, generated
  `.agents/skills/task/SKILL.md` via `pnpm install`,
  `docs/plans/templates/task.md`, and this active plan.
- Browser surface: N/A: agent workflow text only.
- Tracker sync: N/A: no tracker item.
- Non-goals: no change to runtime app code, no PR unless explicitly requested.

Output budget strategy:
- Use focused `sed`/`rg` reads with explicit output caps; avoid broad repo
  scans and generated output dumps.

Blocked condition:
- Block only if skill regeneration, lint, review tooling, or plan completion
  fails in a way that cannot be resolved from local source.

Task state:
- task_type: agent workflow repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: valid
- confidence: high
- next owner: task
- reason: Existing task flow has final autoreview but no explicit pre-solution
  challenge gate for public issue claims and suggested fixes.

Pre-solution issue challenge:
- reporter claim: public issue runs sometimes over-trust reporter diagnoses and
  suggested fixes.
- suggested diagnosis or fix: add an autoreview-like review gate before
  implementation.
- reproduction verdict: N/A: workflow repair based on user-observed repeated
  task behavior, not a product bug.
- validity verdict: valid, with correction: before-code should be an issue
  challenge gate, not the dirty-diff autoreview helper.
- best long-term fix boundary: source task rule plus reusable task goal
  template; generated skill mirror follows `pnpm install`.
- harsh honest feedback: blindly running the diff autoreview helper before
  code would be theater because there is no diff; the real gate is
  adversarial issue validity and solution-boundary review.
- hard-stop decision: proceed with workflow repair.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-task-issue-review-gate.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `task`, `autoreview`, `autogoal`, and `agent-native-reviewer`; use pre-solution challenge gate plus final diff review. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created this objective. |
| Source of truth read before edits | yes | User request, `.agents/rules/task.mdc`, `docs/plans/templates/task.md`, and relevant skill docs read. |
| Tracker comments and attachments read | N/A: no tracker item | User request is the source. |
| Video transcript evidence required | N/A: no video | No tracker video evidence. |
| `docs/solutions` checked for non-trivial existing-code work | N/A: workflow rule/template edit | No product implementation domain. |
| TDD decision before behavior change or bug fix | N/A: no runtime behavior bug | Source audit/review is the honest proof. |
| Branch decision for code-changing task | N/A: user did not ask for commit/PR | Edit current checkout only. |
| Release artifact decision | N/A: no package/runtime release | No changeset or registry changelog. |
| Browser tool decision for browser surface | N/A: no browser surface | Agent workflow text only. |
| PR expectation decision | no | User asked for update/proposal, not PR. |
| Tracker sync expectation decision | N/A: no tracker | No issue/Linear sync. |
| Output budget strategy recorded | yes | Focused reads/searches with caps. |
| Agent-native pack selected | yes | Task changes `.agents/**` workflow rules. |
| Agent-facing action surface identified | yes | Agents read `.agents/skills/task/SKILL.md`; source is `.agents/rules/task.mdc`. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/task.mdc`, regenerate skill mirror with `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | `.agents/skills/agent-native-reviewer/SKILL.md` read. |

Work Checklist:
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
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm install`, `pnpm lint:fix`, source audits, agent-native source audit, and final autoreview passed. |
| Bug reproduced before fix | N/A: workflow repair, not product bug | Record failing test/repro or N/A with reason | Pre-solution issue challenge records reproduction N/A and explains why. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Source audit proves rule/template/generated skill contain the new gate and non-bug N/A path. |
| TypeScript or typed config changed | N/A: markdown/rule text only | Run relevant typecheck | No TS or typed config files changed. |
| Package exports or file layout changed | N/A: no package exports/file layout | Run `pnpm brl` before final verification and keep generated barrel updates | No barrel or export surface changed. |
| Package manifests, lockfile, or install graph changed | N/A: no package manifest or lockfile edit | Run `pnpm install` and relevant package checks | `pnpm install` still ran for skill sync; lockfile was up to date. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` ran after rule edits and skiller applied Codex rules successfully. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in `/Users/zbeyens/git/plate`, the repo that owns `.agents` and task templates. |
| Browser surface changed | N/A: no browser surface | Capture Browser Use proof or record explicit waiver/blocker | Agent workflow text only. |
| Browser final proof | N/A: no browser surface | Attach screenshot or exact browser verification caveat when browser proof applies | No UI/browser route changed. |
| CI-controlled template output changed | N/A: no CI-controlled template output | Restore generated template output or record why it is intentionally kept | `docs/plans/templates/task.md` is source template, not generated registry/template output. |
| Package behavior or public API changed | N/A: no package behavior/API | Add a changeset or record why no changeset applies | No package changeset needed. |
| Registry-only component work changed | N/A: no registry component work | Update `tooling/data/plate-ui-changelog.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, or record N/A | No registry files changed. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Workflow template/docs text changed; source-backed by rule/template audit. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: overbroad gate blocks legitimate feature/docs issues; fixed after autoreview by narrowing trigger and adding non-bug N/A path. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Agent-native source audit: generated `.agents/skills/task/SKILL.md` points to `.agents/rules/task.mdc` and exposes the new action. No remaining findings. |
| Local install corruption suspected | N/A: no suspicious failure | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | Verification failures were review findings, not install corruption. |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | `.agents/skills/autoreview/scripts/autoreview --mode local` first found one accepted P2, then passed clean after fix. |
| PR create or update | N/A: no PR requested and no tracker source | Run `check` before PR work and sync PR body to the task-style final handoff | User asked for local workflow update/proposal, not PR. |
| Task-style PR body verified | N/A: no PR | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | No PR body exists. |
| PR proof image hosting | N/A: no PR/browser proof | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | No images needed. |
| Tracker sync-back | N/A: no tracker source | Post concise issue/Linear sync after PR exists, or record N/A/blocker | No issue/Linear item. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Final handoff fields filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` passed; no fixes applied. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Used scoped `sed`/`rg` reads and command output caps. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-task-issue-review-gate.md` | Passed after closeout row fix. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` ran twice after source edits; generated task skill includes matching gate text. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `rg` found `Public Issue Challenge Gate` in `.agents/rules/task.mdc` and `.agents/skills/task/SKILL.md`. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Source audit found no agent-native parity gap; agents read the generated skill with source metadata. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | source rule, template, and skill docs read | implementation |
| Implementation | complete | task rule/template patched; generated skill synced | verification |
| Verification | complete | lint, source audits, agent-native source audit, and clean autoreview | closeout |
| PR / tracker sync | N/A: user did not ask for PR and no tracker applies | no PR/tracker owner | final response |
| Closeout | complete | mechanical checker caught open closeout row; fixed before final rerun | final response |

Findings:
- Pre-code structured autoreview helper would be the wrong tool because it has
  no diff to review; task needs a pre-solution issue/design challenge gate plus
  the existing post-diff autoreview gate.
- Source rule and generated skill mirror now include `Public Issue Challenge
  Gate`; task template now has start/checklist/completion rows for the verdict.

Decisions and tradeoffs:
- Chose source rule plus reusable task template. Editing generated
  `.agents/skills/task/SKILL.md` directly would drift because `.agents/rules`
  is the source.
- Kept final autoreview unchanged; added pre-solution issue challenge instead
  of pretending final diff review can run before a diff exists.

Implementation notes:
- Patched `.agents/rules/task.mdc` and `docs/plans/templates/task.md`.
- Ran `pnpm install` to regenerate `.agents/skills/task/SKILL.md`.

Review fixes:
- Accepted autoreview P2: the first gate trigger treated "external public
  issue" as enough to require reproduction, which could block legitimate
  feature/docs requests. Narrowed the trigger to bug/behavior/diagnosis/fix
  claims and added a non-bug reproduction `N/A` path.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial autoreview found overbroad public issue trigger | 1 | Narrow trigger and add non-bug reproduction N/A path | Fixed; second autoreview passed clean. |
| First goal checker run found Closeout still in progress | 1 | Mark closeout complete after evidence was recorded | Fixed; reran checker. |

Verification evidence:
- `pnpm install` in `/Users/zbeyens/git/plate`: passed; skiller applied Codex
  rules and regenerated `.agents/skills/task/SKILL.md`.
- `rg -n "Public Issue Challenge Gate|feature, docs, support|non-bug|not reproduced"`
  across `.agents/rules/task.mdc`, `.agents/skills/task/SKILL.md`, and
  `docs/plans/templates/task.md`: passed; source, generated mirror, and template
  expose the gate and non-bug N/A path.
- `pnpm lint:fix` in `/Users/zbeyens/git/plate`: passed; no fixes applied.
- Agent-native source audit: passed; generated skill is agent-readable and
  points back to `.agents/rules/task.mdc`.
- `.agents/skills/autoreview/scripts/autoreview --mode local`: first run found
  one accepted P2, fixed; second run clean with no accepted/actionable findings.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-task-issue-review-gate.md`:
  passed after closeout row fix.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no tracker source.
- Confidence line: high.
- Flow table:
  - Reproduced: N/A tests, N/A browser; this is workflow repair, not product bug.
  - Verified: lint/source audit/autoreview pass, N/A browser.
- Browser check: N/A: no browser surface.
- Outcome: task rule, generated task skill, and task template now require
  pre-solution challenge for public bug/behavior/diagnosis/fix claims.
- Caveat: this intentionally does not run the diff autoreview helper before
  code; it uses the review stance before code and keeps the helper for real
  diffs.
- Design:
  - Chosen boundary: `.agents/rules/task.mdc` plus `docs/plans/templates/task.md`,
    with generated `.agents/skills/task/SKILL.md` synced by `pnpm install`.
  - Why not quick patch: generated skill-only edits drift and miss future plans.
  - Why not broader change: `autogoal` lifecycle is fine; this is task-specific
    public issue intake behavior.
- Verified: `pnpm install`, `pnpm lint:fix`, source audit, agent-native source
  audit, and clean autoreview.
- PR body verified: N/A: no PR.

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
- PR: N/A: no PR requested.
- Issue / tracker: N/A: no tracker source.
- Browser proof: N/A: no browser surface.
- Caveats: no remaining caveat beyond no pre-code dirty-diff helper.

Timeline:
- 2026-06-15T08:11:32.577Z Task goal plan created.
- 2026-06-15 Added public issue challenge gate to task source and task template.
- 2026-06-15 Ran `pnpm install` to sync generated task skill.
- 2026-06-15 Ran `pnpm lint:fix`; passed.
- 2026-06-15 Autoreview found overbroad trigger; narrowed it and synced again.
- 2026-06-15 Final autoreview passed clean.
- 2026-06-15 Goal plan checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Goal check, update goal complete, final response |
| What is the goal? | Harden task issue intake with a pre-solution challenge gate |
| What have I learned? | Pre-code helper autoreview would be theater; the correct gate is issue validity and durable-boundary review |
| What have I done? | Updated task rule/template, regenerated skill, fixed autoreview finding, verified |

Open risks:
- None known.
