# slate migration skill

Objective:
Create slate-migration skill; done when source rule, generated mirror, sync, audits, and plan checker pass; plan docs/plans/2026-06-15-slate-migration-skill.md.

Goal plan:
docs/plans/2026-06-15-slate-migration-skill.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user request
- id / link: current thread
- title: Create `plite-migration` autonomous migration skill
- acceptance criteria: add a `plite-migration` skill for full autonomous Plite/Plate migration runs; it must repair missing migration guide rows and changesets whenever gaps are found; it must use the same autogoal/supervisor/self-repair methodology as `plite-auto`; it must be suitable for migrating Plate to Plite; source rules must be patched, generated mirrors synced, and audits recorded.

First checkpoint:
- [x] Create a new skill named `plite-migration`.
- [x] Use source-of-truth `.agents/rules/*.mdc`, not generated `SKILL.md`, then run `pnpm install`.
- [x] Make the skill repair migration docs and changesets whenever a missing item is found.
- [x] Design for future Plate to Plite migrations, not only the current Plite docs guide.
- [x] Use `plite-auto` methodology: autogoal-backed plan, checkpoint loop, packet ledger, changed list, review-attention list, stopping checkpoints, workflow slowdown ledger, self-repair of owning skill/rules/templates.
- [x] Permit full autonomous migration loops while respecting authority boundaries for commits/PRs/external credentials.
- [x] Add a dedicated migration goal template so this does not fall back to generic `task` rows.
- [x] Verification surface: source rule audit, generated mirror audit, template audit, `pnpm install`, agent-native review decision, and `check-complete.mjs`.
- [x] Non-goals: do not run an actual Plate migration now; do not write changesets for current docs-only skill work; do not commit or create PR.

Completion threshold:
- `.agents/rules/slate-migration.mdc` exists with trigger metadata and autonomous migration workflow.
- `.agents/skills/slate-migration/SKILL.md` is generated from that source rule after `pnpm install`.
- `docs/plans/templates/slate-migration.md` exists and can host migration/API-map/changeset/docs/test/checkpoint ledgers.
- Relevant Plite skill topology references include the new skill where needed.
- Source and generated mirror audits prove the skill covers migration guide repair, changeset repair, Plate to Plite migration, autogoal checkpoints, self-repair, changed list, review attention, stopping checkpoints, and workflow slowdowns.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-slate-migration-skill.md` passes.

Verification surface:
- `pnpm install` from `/Users/zbeyens/git/plate-2` to sync generated skills.
- `rg` source/mirror audits over `.agents/rules/slate-migration.mdc`, `.agents/skills/slate-migration/SKILL.md`, `docs/plans/templates/slate-migration.md`, and any topology references.
- Agent-native review pass over the new agent action surface.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-slate-migration-skill.md`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: user request, `.agents/rules/slate-auto.mdc`, `.agents/rules/changeset.mdc`, `.agents/skills/autogoal/SKILL.md`, `skill-creator`, and existing plan templates.
- Allowed edit scope: `.agents/rules/slate-migration.mdc`, generated `.agents/skills/slate-migration/**` through `pnpm install`, `docs/plans/templates/slate-migration.md`, optional topology reference in `.agents/rules/vision.mdc`, this plan, and generated sync artifacts.
- Browser surface: N/A, skill/template work only.
- Tracker sync: N/A, no issue/Linear/PR requested.
- Non-goals: no actual Plite or Plate migration implementation; no package changesets for this skill-only work; no commit/PR.

Output budget strategy:
- Read exact skill/rule/template owners with `sed` slices and use `rg` source audits. Avoid repo-wide generated-skill dumps; audit exact paths after sync.

Blocked condition:
- Block only if `pnpm install` cannot run or skiller cannot generate the new skill mirror. No user decision is needed for the requested skill shape.

Task state:
- task_type: agent workflow / skill creation
- task_complexity: normal
- current_phase: intake
- current_phase_status: complete
- next_phase: closeout
- goal_status: ready to complete

Current verdict:
- verdict: complete
- confidence: high
- next owner: none
- reason: source rule, template, generated mirror, AGENTS routing, north-star reference, sync, and audits are complete.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-slate-migration-skill.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint rows copy the requested skill, migration-guide repair, changeset repair, Plate migration, slate-auto methodology, self-repair, sync, and verification requirements. |
| Skill analysis before edits | yes | Read `skill-creator`, `plite-auto`, `autogoal`, `changeset`, and representative source rules/templates. |
| Active goal checked or created | yes | `get_goal` returned none; active goal created for this plan. |
| Source of truth read before edits | yes | Read `.agents/rules/slate-auto.mdc`, `.agents/rules/slate-patch.mdc`, `.agents/rules/slate-research.mdc`, `.agents/rules/changeset.mdc`, and template examples. |
| Tracker comments and attachments read | N/A | No issue, tracker, or attachment was provided. |
| Video transcript evidence required | N/A | No video evidence in this skill-creation request. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | This is agent workflow creation, not existing product-code diagnosis. |
| TDD decision before behavior change or bug fix | N/A | No runtime behavior or bug fix. |
| Branch decision for code-changing task | N/A | User did not ask for branch/commit/PR; no branch hygiene check per repo instruction. |
| Release artifact decision | N/A | Skill/template-only work; no package release artifact or changeset. |
| Browser tool decision for browser surface | N/A | No browser surface changed. |
| PR expectation decision | N/A | No PR requested. |
| Tracker sync expectation decision | N/A | No tracker sync requested. |
| Output budget strategy recorded | yes | Exact owners and targeted audits only; no broad generated dumps. |
| Agent-native pack selected | yes | `.agents/**` skill source and generated mirror work. |
| Agent-facing action surface identified | yes | New `plite-migration` skill for autonomous migration runs. |
| Source rule versus generated mirror boundary identified | yes | Patch `.agents/rules/**`; sync `.agents/skills/**` via `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | `.agents/skills/agent-native-reviewer/SKILL.md` read before patch. |

Work Checklist:
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
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm install`, source/mirror/template audits, and agent-native source parity audit passed. |
| Bug reproduced before fix | N/A | Record failing test/repro or N/A with reason | No bug fix; new skill/template creation only. |
| Targeted behavior verification | N/A | Run focused test/proof for changed behavior or record N/A | No runtime behavior changed. |
| TypeScript or typed config changed | N/A | Run relevant typecheck | No TypeScript or typed config changed. |
| Package exports or file layout changed | N/A | Run `pnpm brl` before final verification and keep generated barrel updates | No package exports or public file layout changed. |
| Package manifests, lockfile, or install graph changed | N/A | Run `pnpm install` and relevant package checks | No package manifest/install graph edits; `pnpm install` ran only for generated skill sync. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed; `.agents/skills/slate-migration/SKILL.md` generated from `.agents/rules/slate-migration.mdc`. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All audits ran from `/Users/zbeyens/git/plate-2`, the owner of `.agents` and plan templates. |
| Browser surface changed | N/A | Capture Browser Use proof or record explicit waiver/blocker | No app/browser surface changed. |
| Browser final proof | N/A | Attach screenshot or exact browser verification caveat when browser proof applies | No browser proof applies. |
| CI-controlled template output changed | N/A | Restore generated template output or record why it is intentionally kept | No CI-controlled app/template output changed. |
| Package behavior or public API changed | N/A | Add a changeset or record why no changeset applies | Skill/template-only work; no package behavior or API change. |
| Registry-only component work changed | N/A | Update `docs/components/changelog.mdx` or record N/A | No registry component work. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Plan template and AGENTS docs changed; source audit passed, no docs renderer route applies. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk: future agents miss migration guide/changeset repair; boundary fixed by source rule plus template plus AGENTS routing. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Loaded reviewer; source parity audit passed for discoverability, source ownership, generated mirror, template, and north-star reference. |
| Local install corruption suspected | N/A | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | No local install corruption signals. |
| Autoreview for non-trivial implementation changes | N/A | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | No runtime implementation diff; agent-native source parity audit used instead. |
| PR create or update | N/A | Run `check` before PR work and sync PR body to the task-style final handoff | No PR requested. |
| Task-style PR body verified | N/A | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | No PR requested. |
| PR proof image hosting | N/A | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | No PR/browser proof image. |
| Tracker sync-back | N/A | Post concise issue/Linear sync after PR exists, or record N/A/blocker | No tracker issue. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Handoff fields filled in this plan. |
| Final lint | N/A | Run `pnpm lint:fix` or scoped equivalent | Markdown/rule/template-only work; no formatter target needed beyond sync and audits. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Used exact `sed` slices and scoped `rg`/Node audits. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-slate-migration-skill.md` | Run after final evidence update. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` passed twice after rule/AGENTS edits; generated mirror audit passed. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `AGENTS.md`, `.agents/AGENTS.md`, source rule, generated skill, and north-star reference contain `plite-migration`. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Agent-native source parity audit passed; no actionable findings. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read `autogoal`, `skill-creator`, `plite-auto`, `changeset`, source rules, templates, and agent-native reviewer | done |
| Implementation | complete | Added `plite-migration` source rule, template, AGENTS routing, and north-star reference; synced generated skill | done |
| Verification | complete | `pnpm install`, source/mirror/template audits, and agent-native source parity audit passed | done |
| PR / tracker sync | N/A | No PR/tracker requested | done |
| Closeout | complete | Final evidence recorded; plan checker next | final response |

Findings:
- `plite-auto` is too broad for migration closure; a dedicated skill avoids dragging perf/pagination/browser soak rows into migration guide and changeset repair.
- `changeset` already owns release-note style. `plite-migration` should invoke it instead of duplicating every rule.
- Agent action discoverability needs three layers here: source rule, generated skill mirror, and repo `AGENTS.md` routing.

Decisions and tradeoffs:
- Added a dedicated `docs/plans/templates/slate-migration.md` instead of reusing `task` or `plite-auto`.
- Added `plite-migration` to `vision` first-read owner docs so supervisor loops know this lane exists.
- Did not create changesets because this is skill/template-only agent workflow work.

Implementation notes:
- Added `.agents/rules/slate-migration.mdc`.
- Added `docs/plans/templates/slate-migration.md`.
- Updated `.agents/AGENTS.md` routing and regenerated root `AGENTS.md`.
- Updated `.agents/rules/vision.mdc` and regenerated `.agents/skills/vision/SKILL.md`.
- Generated `.agents/skills/slate-migration/SKILL.md` via `pnpm install`.

Review fixes:
- Added repo-level AGENTS routing after the first sync showed the generated skill existed but routing policy did not mention it.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First mirror audit did not show `plite-migration` in repo AGENTS routing | 1 | Patch `.agents/AGENTS.md` and rerun `pnpm install` | Root `AGENTS.md` now includes `plite-migration`. |

Verification evidence:
- `pnpm install` from `/Users/zbeyens/git/plate-2`: passed; Skiller applied rules for Codex and Claude.
- `rg` source/mirror/template audit from `/Users/zbeyens/git/plate-2`: passed for `plite-migration`, Plate-to-Plite-v2, migration-guide repair, changeset repair, self-repair, review-attention, stopping checkpoints, and north-star/AGENTS routing.
- File existence audit from `/Users/zbeyens/git/plate-2`: `.agents/rules/slate-migration.mdc`, `.agents/skills/slate-migration/SKILL.md`, and `docs/plans/templates/slate-migration.md` exist.
- Node content audit from `/Users/zbeyens/git/plate-2`: source and generated skill have no unresolved task placeholders; template intentionally keeps generation placeholders.
- Agent-native source parity audit from `/Users/zbeyens/git/plate-2`: passed for discoverability, source ownership, generated mirror, template ledgers, AGENTS routing, and north-star reference.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker requested.
- Confidence line: High; source/mirror/template/routing audits passed.
- Flow table:
  - Reproduced: N/A, no runtime bug.
  - Verified: `pnpm install`, source/mirror/template audits, agent-native source parity audit.
- Browser check: N/A, no browser surface changed.
- Outcome: `plite-migration` skill and dedicated template created and routed.
- Caveat: No actual Plate migration was run in this task.
- Design:
  - Chosen boundary: `.agents/rules/slate-migration.mdc` plus `docs/plans/templates/slate-migration.md`.
  - Why not quick patch: a generated-only skill edit would be overwritten and would miss future sync.
  - Why not broader change: `plite-auto` remains the broad supervisor; this skill only owns migration closure.
- Verified: `pnpm install`; generated mirror audit; AGENTS routing audit; north-star reference audit; agent-native source parity audit.
- PR body verified: N/A, no PR.

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
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: no runtime migration executed.

Timeline:
- 2026-06-15T17:14:46.466Z Task goal plan created.
- 2026-06-15T17:17:00Z Added `plite-migration` source rule and dedicated template.
- 2026-06-15T17:19:00Z Ran `pnpm install` to generate skill mirror.
- 2026-06-15T17:20:00Z Added AGENTS routing and reran `pnpm install`.
- 2026-06-15T17:21:00Z Source/mirror/template and agent-native audits passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run plan checker and final response |
| What is the goal? | Create `plite-migration` skill and template |
| What have I learned? | Use a migration-specific template; route changeset style to `changeset`; keep `plite-auto` as broad supervisor |
| What have I done? | Added source rule, generated mirror, template, AGENTS routing, north-star reference, and audits |

Open risks:
- None for skill creation. The next real test is using `plite-migration` on an actual Plate-to-Plite-v2 migration packet.
