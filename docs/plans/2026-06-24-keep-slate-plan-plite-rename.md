# keep slate-plan plite rename

Objective:
Keep slate-plan as Plite planning entrypoint; done when plite-plan is removed and source/generated audits pass; plan docs/plans/2026-06-24-keep-slate-plan-plite-rename.md.

Goal plan:
docs/plans/2026-06-24-keep-slate-plan-plite-rename.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: chat correction
- id / link: latest user correction after prior closeout
- title: Keep slate-plan, rename Slate language to Plite
- acceptance criteria: no separate `plite-plan` skill/source/template; keep
  `slate-plan` as the invocation/template key; generated `slate-plan` body is
  Plite Plan; source/generated audits pass.

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
- initial confidence score: N/A: binary routing correction
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `.agents/rules/slate-plan.mdc` is the Plite Plan source owner.
- `docs/plans/templates/slate-plan.md` is the Plite Plan autogoal template.
- No `.agents/rules/plite-plan.mdc`,
  `docs/plans/templates/plite-plan.md`, `.agents/skills/plite-plan/SKILL.md`,
  or `plite-plan` routing refs remain.
- `.agents/skills/slate-plan/SKILL.md` has `name: slate-plan` and Plite Plan
  content.
- `pnpm install` and source/generated audits pass.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-24-keep-slate-plan-plite-rename.md` passes.

Verification surface:
- `pnpm install`
- `rg --files .agents/skills .agents/rules docs/plans/templates | rg 'plite-plan|slate-plan'`
- `rg -n "plite-plan" .agents/rules .agents/AGENTS.md AGENTS.md docs/plans/templates .agents/skills --glob '*.mdc' --glob '*.md'`
- `rg -n "Slate-v2|Slate Plan|# Slate Plan|upstream Slate|--template plite-plan|name: plite-plan|source: .agents/rules/plite-plan.mdc" ...`

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.agents/rules/*.mdc`, `.agents/AGENTS.md`,
  `docs/plans/templates/*.md`; generated `.agents/skills/**` only after sync.
- Allowed edit scope: `slate-plan` / `plite-plan` rule/template/routing refs,
  `.agents/AGENTS.md`, generated mirrors from `pnpm install`, and this plan.
- Browser surface: N/A.
- Browser strategy: N/A: agent skill routing only.
- Tracker sync: N/A.
- Non-goals: do not rename all `slate-*` worker skills or package commands;
  only remove the accidental `plite-plan` split and make `slate-plan` Plite.

Output budget strategy:
- Use targeted `rg`/`sed`; cap audits to relevant rule/template/generated
  paths. One accidental broad audit occurred and is recorded below.

Blocked condition:
- Block only if Skiller cannot remove stale `plite-plan` generated mirrors or
  if command-name retention conflicts with the user's explicit correction.

Task state:
- task_type: agent-native skill topology correction
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: done
- confidence: pending
- next owner: user review
- reason: `slate-plan` is kept as entrypoint; `plite-plan` split is gone.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-24-keep-slate-plan-plite-rename.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User correction captured: keep `slate-plan`, remove `plite-plan`, Plite wording. |
| Timed checkpoint parsed | N/A: no duration requested | N/A |
| Skill analysis before edits | yes | Used prior reads of `autogoal`, `skill-creator`, `agent-native-reviewer`; re-read current source/routing refs. |
| Active goal checked or created | yes | `get_goal` returned none; created this goal. |
| Source of truth read before edits | yes | Read `.agents/rules/slate-plan.mdc`, `.agents/rules/plite-plan.mdc`, templates, routing refs. |
| Tracker comments and attachments read | N/A: no tracker | N/A |
| Video transcript evidence required | N/A: no video | N/A |
| `docs/solutions` checked for non-trivial existing-code work | N/A: agent routing only | N/A |
| TDD decision before behavior change or bug fix | N/A: no runtime behavior | N/A |
| Branch decision for code-changing task | N/A: no branch changes | user is managing unstaged checkout |
| Release artifact decision | N/A: no package release artifact | N/A |
| Browser tool decision for browser surface | N/A: no browser surface | N/A |
| PR expectation decision | N/A: no PR requested | N/A |
| Tracker sync expectation decision | N/A: no tracker | N/A |
| Output budget strategy recorded | yes | Focused rule/template/generated audits. |
| Agent-native pack selected | yes | `agent-native` pack applied. |
| Agent-facing action surface identified | yes | `slate-plan` skill entrypoint and `slate-plan` autogoal template. |
| Source rule versus generated mirror boundary identified | yes | Edited rules/templates, then ran `pnpm install`; no hand-edited generated mirror. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded in previous step of this correction thread; parity map below. |

Work Checklist:
- [x] Duration N/A: no duration requested.
- [x] First checkpoint complete: user wanted `slate-plan` kept, all accidental
      `plite-plan` topology removed, and Plite wording inside the kept skill.
- [x] Short objective plus outcome, threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified: chat correction; agent-native routing; no browser
      or runtime surface.
- [x] Video evidence N/A: no video.
- [x] Nearby repo instructions and patterns read before edits.
- [x] Implementation fixes the right boundary: `slate-plan` remains the route
      and template key; content is Plite Plan.
- [x] Release artifact N/A: no package/runtime release artifact.
- [x] Final handoff shape decided: changed list, verification, caveat.
- [x] Branch handling N/A: no branch mutation.
- [x] Local-env-rot retry N/A: no surprising env failure.
- [x] Workspace authority recorded: all proof commands ran in
      `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded: agent route topology was corrected and synced.
- [x] Autoreview N/A: no runtime/app implementation; agent-native review/audit
      is the right gate.
- [x] Agent-native review decision recorded through the parity map below.
- [x] Output budget discipline mostly followed; accidental broad audit recorded
      and recovered by targeted audits.
- [x] Agent-native pack: source-of-truth rule/template files edited instead of
      generated mirrors.
- [x] Agent-native pack: changed action is discoverable from
      `.agents/skills/slate-plan/SKILL.md`.
- [x] Agent-native pack: generated mirrors synced with `pnpm install`.
- [x] Agent-native pack: accepted finding fixed: accidental `plite-plan` split
      removed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm install` passed; `plite-plan` audits empty; only `slate-plan` files remain. |
| Bug reproduced before fix | N/A: no bug repro task | Record failing test/repro or N/A with reason | N/A |
| Targeted behavior verification | N/A: no runtime behavior changed | Run focused test/proof for changed behavior or record N/A | N/A |
| TypeScript or typed config changed | N/A: no TS/config changed | Run relevant typecheck | N/A |
| Package exports or file layout changed | N/A: no package exports/layout changed | Run `pnpm brl` before final verification and keep generated barrel updates | N/A |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | `pnpm install` passed; lockfile already up to date. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed; generated `slate-plan` mirror synced. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd | `/Users/zbeyens/git/plate-2` for all commands. |
| Browser surface changed | N/A: no browser surface | Capture Browser proof when browser proof applies | N/A |
| Browser final proof | N/A: no browser surface | Attach Browser/Chrome/Computer proof or caveat | N/A |
| CI-controlled template output changed | N/A: no registry/template generated output | Restore generated template output or record why kept | N/A |
| Package behavior or public API changed | N/A: no package behavior/API | Add changeset or N/A | N/A |
| Registry-only component work changed | N/A: no registry component | Update registry changelog or N/A | N/A |
| Docs or content changed | N/A: agent plan template only | Verify source-backed claims or N/A | N/A |
| High-risk mini gate | yes | Record failure mode, proof plan, and boundary | Failure mode: future agents call non-existent/wrong `plite-plan`. Proof: no `plite-plan` refs/files; `slate-plan` mirror has Plite content. |
| Agent-native review for agent/tooling changes | yes | Load reviewer and close findings | Parity map below; accepted finding fixed. |
| Local install corruption suspected | N/A: no env-rot signal | Reinstall/rerun or N/A | N/A |
| Autoreview for non-trivial implementation changes | N/A: no runtime implementation | Load autoreview or N/A | N/A |
| PR create or update | N/A: no PR requested | Run check before PR work | N/A |
| Task-style PR body verified | N/A: no PR requested | Verify PR body | N/A |
| PR proof image hosting | N/A: no PR/browser proof | Host image or N/A | N/A |
| Tracker sync-back | N/A: no tracker | Sync or N/A | N/A |
| Final handoff contract | yes | Fill final handoff fields | Filled below. |
| Final lint | N/A: markdown/rule routing only | Run lint or N/A | N/A |
| Output budget discipline | yes | Verify no unbounded output or record recovery | One accidental broad audit output occurred; recovered with targeted audits and recorded in error attempts. |
| Timed checkpoint | N/A: no duration requested | Finish timed loop or N/A | N/A |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-24-keep-slate-plan-plite-rename.md` | Final run pending after this plan edit. |
| Agent source / generated sync | yes | Run `pnpm install` and verify generated mirrors | `pnpm install` passed. |
| Agent action discoverability | yes | Source-audit skill/rule path | `.agents/skills/slate-plan/SKILL.md` has `name: slate-plan`, source `.agents/rules/slate-plan.mdc`, title `Plite Plan`. |
| Agent-native review | yes | Load reviewer and close findings | Loaded reviewer; no remaining accepted findings. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | read current route/source/template state | implementation |
| Implementation | complete | moved `plite-plan` source/template to `slate-plan`, updated refs | verification |
| Verification | complete | `pnpm install`, no `plite-plan` refs/files, generated `slate-plan` mirror checked | closeout |
| PR / tracker sync | N/A | no PR/tracker requested | final response |
| Closeout | complete | plan updated; final check follows | final response |

Findings:
- Previous patch was wrong because it split the owner into a new `plite-plan`
  skill. User wanted the existing `slate-plan` entrypoint kept.
- Correct shape: `slate-plan` command/template/source path, but Plite Plan
  prose and Plite/Plate ownership.

Decisions and tradeoffs:
- Keep command/template key `slate-plan` to preserve the user's desired entrypoint.
- Delete accidental `plite-plan` source/template/generated mirror.
- Leave worker command names like `slate-patch` alone; those are existing skill
  names, not the plan topology mistake.

Implementation notes:
- Moved `.agents/rules/plite-plan.mdc` -> `.agents/rules/slate-plan.mdc`.
- Moved `docs/plans/templates/plite-plan.md` -> `docs/plans/templates/slate-plan.md`.
- Updated source routing refs from `plite-plan` to `slate-plan`.
- Regenerated mirrors with `pnpm install`.

Review fixes:
- Agent-native fix: no separate `plite-plan` route remains; generated
  `.agents/skills/slate-plan/SKILL.md` is the route agents will read.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Accidental prior topology split created `plite-plan` | 1 | Move source/template back under `slate-plan` and regenerate | fixed |
| Broad audit command accidentally streamed too much output | 1 | Replace with targeted `rg` audits over named files/paths | fixed; final evidence uses targeted audits |

Verification evidence:
- `pnpm install` in `/Users/zbeyens/git/plate-2` -> passed; Skiller apply
  completed.
- `rg --files .agents/skills .agents/rules docs/plans/templates | rg 'plite-plan|slate-plan'`
  -> only `docs/plans/templates/slate-plan.md`,
  `.agents/rules/slate-plan.mdc`, `.agents/skills/slate-plan/SKILL.md`.
- `rg -n "plite-plan" .agents/rules .agents/AGENTS.md AGENTS.md docs/plans/templates .agents/skills --glob '*.mdc' --glob '*.md'`
  -> no matches.
- `rg -n "Slate-v2|Slate Plan|# Slate Plan|upstream Slate|--template plite-plan|name: plite-plan|source: .agents/rules/plite-plan.mdc" ...`
  -> no matches.
- `rg -n "Slate|slate" .agents/rules/slate-plan.mdc docs/plans/templates/slate-plan.md .agents/skills/slate-plan/SKILL.md`
  -> only intentional command/source names: `slate-plan`, `slate-patch`.

Agent-native parity map:
| User action | Agent route | Source owner | Mirror/lock/doc | Proof | Status |
|---|---|---|---|---|---|
| Invoke planning skill | `slate-plan` | `.agents/rules/slate-plan.mdc` | `.agents/skills/slate-plan/SKILL.md` | generated mirror audit | pass |
| Create plan template | `--template slate-plan` | `docs/plans/templates/slate-plan.md` | active plan file | file audit | pass |
| Avoid accidental new route | N/A: no `plite-plan` | no source owner | no generated mirror | no-match audit | pass |

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
- PR: N/A
- Issue / tracker: N/A
- Browser proof: N/A
- Caveats: `slate-patch` and other worker names still exist by design; this
  packet only fixes the planning entrypoint.

Timeline:
- 2026-06-24T14:00:17.905Z Task goal plan created.
- 2026-06-24T14:01Z Moved accidental `plite-plan` source/template back to
  `slate-plan`.
- 2026-06-24T14:03Z Ran `pnpm install`; generated mirrors synced.
- 2026-06-24T14:05Z Ran targeted no-`plite-plan` and generated mirror audits.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run `check-complete`, complete goal, hand off |
| What is the goal? | Keep `slate-plan` as the Plite Plan entrypoint |
| What have I learned? | User wanted command continuity, not a new `plite-plan` skill |
| What have I done? | Removed `plite-plan`, restored `slate-plan`, synced generated mirror |

Open risks:
- None for this packet. Broader `slate-*` worker naming remains separate by
  explicit boundary.
