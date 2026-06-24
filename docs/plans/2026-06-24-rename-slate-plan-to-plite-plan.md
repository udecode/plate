# rename slate-plan to plite-plan

Objective:
Rename slate-plan to plite-plan; done when source/generated skill/template refs audit clean; plan docs/plans/2026-06-24-rename-slate-plan-to-plite-plan.md.

Goal plan:
docs/plans/2026-06-24-rename-slate-plan-to-plite-plan.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: chat correction
- id / link: latest user correction
- title: Rename `slate-plan` to `plite-plan`
- acceptance criteria: `plite-plan` is the skill/template/source entrypoint;
  `slate-plan` source/template/generated skill is gone from active routing;
  generated mirrors sync with source; audits pass.

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
- initial confidence score: N/A: binary routing rename
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `.agents/rules/plite-plan.mdc` exists and owns Plite planning.
- `docs/plans/templates/plite-plan.md` exists and is the Plite Plan template.
- `.agents/skills/plite-plan/SKILL.md` is generated from the source rule.
- No active `.agents/rules/slate-plan.mdc`,
  `docs/plans/templates/slate-plan.md`, `.agents/skills/slate-plan/SKILL.md`,
  or `slate-plan` routing refs remain in `.agents/rules`,
  `.agents/AGENTS.md`, `AGENTS.md`, or `docs/plans/templates`.
- `pnpm install` and source/generated audits pass.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-24-rename-slate-plan-to-plite-plan.md` passes.

Verification surface:
- `pnpm install`
- source/generated file audit for `plite-plan|slate-plan`
- stale routing audit for `slate-plan`
- generated mirror audit for `.agents/skills/plite-plan/SKILL.md`

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.agents/rules/*.mdc`, `.agents/AGENTS.md`,
  `docs/plans/templates/*.md`; generated `.agents/skills/**` after sync.
- Allowed edit scope: `slate-plan`/`plite-plan` rule/template/routing refs,
  generated mirrors from `pnpm install`, and this plan.
- Browser surface: N/A.
- Browser strategy: N/A: agent skill routing only.
- Tracker sync: N/A.
- Non-goals: do not rename unrelated `slate-*` workers like `slate-patch` or
  historical plan files unless they are active routing refs to this planning skill.

Output budget strategy:
- Use focused `rg` over `.agents/rules`, `.agents/AGENTS.md`, `AGENTS.md`,
  `.agents/skills`, and `docs/plans/templates`; cap outputs.

Blocked condition:
- Block only if Skiller cannot remove or regenerate the expected skill mirror.

Task state:
- task_type: agent-native skill rename
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: done
- confidence: high
- next owner: user review
- reason: `plite-plan` is the only planning skill/template route; `slate-plan` active refs are gone.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-24-rename-slate-plan-to-plite-plan.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Captured rename `slate-plan` -> `plite-plan`, scoped to planning entrypoint. |
| Timed checkpoint parsed | N/A: no duration requested | N/A |
| Skill analysis before edits | yes | Loaded `autogoal` and `agent-native-reviewer`; current plan source from prior correction is known and will be audited live. |
| Active goal checked or created | yes | `get_goal` returned none; created this goal. |
| Source of truth read before edits | yes | Will patch source `.agents/rules/**` and `docs/plans/templates/**`, not generated mirrors. |
| Tracker comments and attachments read | N/A: no tracker | N/A |
| Video transcript evidence required | N/A: no video | N/A |
| `docs/solutions` checked for non-trivial existing-code work | N/A: no app code | N/A |
| TDD decision before behavior change or bug fix | N/A: no runtime behavior | N/A |
| Branch decision for code-changing task | N/A: no branch mutation | user is managing current checkout |
| Release artifact decision | N/A: no package artifact | N/A |
| Browser tool decision for browser surface | N/A: no browser surface | N/A |
| PR expectation decision | N/A: no PR requested | N/A |
| Tracker sync expectation decision | N/A: no tracker | N/A |
| Output budget strategy recorded | yes | Focused rg/sed only. |
| Agent-native pack selected | yes | `agent-native` pack applied. |
| Agent-facing action surface identified | yes | Planning skill entrypoint and autogoal template. |
| Source rule versus generated mirror boundary identified | yes | Edit source, run `pnpm install`; no hand-edit generated mirrors. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded; parity map will be recorded after implementation. |

Work Checklist:
- [x] Duration N/A: no duration requested.
- [x] First checkpoint complete: rename `slate-plan` to `plite-plan`, keep
      scope limited to the planning entrypoint/template/routing refs.
- [x] Short objective plus outcome, threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified: chat correction; agent-native skill rename; no
      browser/runtime surface.
- [x] Video evidence N/A: no video.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: Plite planning is
      `plite-plan`; no `slate-plan` planning route remains.
- [x] Release artifact N/A: no package/runtime release artifact.
- [x] Final handoff shape decided: changed list, proof, caveat.
- [x] Branch handling N/A: no branch mutation.
- [x] Local-env-rot retry N/A: no env failure.
- [x] Workspace authority recorded: all proof ran in
      `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded: agent routing changed; source/generated sync and
      stale-ref audits prove the route.
- [x] Autoreview N/A: no runtime/app implementation; agent-native audit is the
      relevant gate.
- [x] Agent-native review decision recorded through parity map below.
- [x] Output budget discipline followed: focused reads/audits only.
- [x] Agent-native pack: source files edited instead of generated skill mirror.
- [x] Agent-native pack: changed action is discoverable from
      `.agents/skills/plite-plan/SKILL.md`.
- [x] Agent-native pack: generated mirrors synced with `pnpm install`.
- [x] Agent-native pack: no accepted findings remain.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named sync and audits | `pnpm install` passed; file/ref audits passed. |
| Bug reproduced before fix | N/A: no bug repro task | Record failing test/repro or N/A with reason | N/A |
| Targeted behavior verification | N/A: no runtime behavior changed | Run focused test/proof or N/A | N/A |
| TypeScript or typed config changed | N/A: no TS/config changed | Run typecheck or N/A | N/A |
| Package exports or file layout changed | N/A: no package export/layout changed | Run `pnpm brl` or N/A | N/A |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` | `pnpm install` passed; lockfile already up to date. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed; generated `plite-plan` mirror exists. |
| Workspace authority proof | yes | Run proof in owning workspace | `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | N/A: no browser surface | Browser proof or N/A | N/A |
| Browser final proof | N/A: no browser surface | Browser proof or caveat | N/A |
| CI-controlled template output changed | N/A: no CI template output | Restore or N/A | N/A |
| Package behavior or public API changed | N/A: no package behavior/API | Changeset or N/A | N/A |
| Registry-only component work changed | N/A: no registry component | Changelog or N/A | N/A |
| Docs or content changed | N/A: agent plan template only | Docs proof or N/A | N/A |
| High-risk mini gate | yes | Record failure mode/proof/boundary | Failure mode: future agents call stale `slate-plan`. Proof: no `slate-plan` refs/files in active routing; `plite-plan` generated mirror exists. |
| Agent-native review for agent/tooling changes | yes | Load reviewer and close findings | Loaded; parity map below. |
| Local install corruption suspected | N/A: no env-rot signal | Reinstall/rerun or N/A | N/A |
| Autoreview for non-trivial implementation changes | N/A: no runtime implementation | Autoreview or N/A | N/A |
| PR create or update | N/A: no PR requested | Run check before PR work | N/A |
| Task-style PR body verified | N/A: no PR requested | Verify PR body | N/A |
| PR proof image hosting | N/A: no PR/browser proof | Host image or N/A | N/A |
| Tracker sync-back | N/A: no tracker | Sync or N/A | N/A |
| Final handoff contract | yes | Fill handoff | Filled below. |
| Final lint | N/A: markdown/rule route only | Lint or N/A | N/A |
| Output budget discipline | yes | Verify no broad output | Focused commands only. |
| Timed checkpoint | N/A: no duration requested | Timed loop or N/A | N/A |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-24-rename-slate-plan-to-plite-plan.md` | Final run pending after this edit. |
| Agent source / generated sync | yes | Run `pnpm install` and verify generated mirrors | Passed; `.agents/skills/plite-plan/SKILL.md` source points to `.agents/rules/plite-plan.mdc`. |
| Agent action discoverability | yes | Source-audit skill/rule path | `plite-plan` skill, rule, and template exist. |
| Agent-native review | yes | Load reviewer and close findings | No remaining accepted finding. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | read current source/template refs | implementation |
| Implementation | complete | renamed source/template and active routing refs to `plite-plan` | verification |
| Verification | complete | `pnpm install`, no stale `slate-plan` refs/files, generated mirror audit | closeout |
| PR / tracker sync | N/A | no PR/tracker requested | final response |
| Closeout | complete | plan updated; final check follows | final response |

Findings:
- Correct final shape is a real `plite-plan` skill/template/source owner.
- `slate-plan` generated/source/template paths are gone from active agent
  routing after `pnpm install`.

Decisions and tradeoffs:
- Rename the planning skill key itself to `plite-plan`.
- Keep unrelated worker names like `slate-patch` out of this packet because
  the prompt corrected `slate-plan`, not every `slate-*` skill.

Implementation notes:
- Moved `.agents/rules/slate-plan.mdc` to `.agents/rules/plite-plan.mdc`.
- Moved `docs/plans/templates/slate-plan.md` to
  `docs/plans/templates/plite-plan.md`.
- Replaced active routing refs from `slate-plan` to `plite-plan` in
  `.agents/rules/**`, `.agents/AGENTS.md`, `AGENTS.md`, and templates.
- Ran `pnpm install` to regenerate `.agents/skills/plite-plan/SKILL.md`.

Review fixes:
- Agent-native parity closed: user action now maps to `plite-plan` route,
  source rule, generated mirror, and template.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Prior correction kept `slate-plan` | 1 | Follow newest correction: rename skill key to `plite-plan` | fixed |

Verification evidence:
- `pnpm install` in `/Users/zbeyens/git/plate-2` -> passed; Skiller apply
  completed.
- `rg --files .agents/skills .agents/rules docs/plans/templates | rg 'slate-plan|plite-plan'`
  -> only `docs/plans/templates/plite-plan.md`,
  `.agents/rules/plite-plan.mdc`, `.agents/skills/plite-plan/SKILL.md`.
- `rg -n "slate-plan" .agents/rules .agents/AGENTS.md AGENTS.md docs/plans/templates .agents/skills --glob '*.mdc' --glob '*.md'`
  -> no matches.
- Generated mirror audit:
  `.agents/skills/plite-plan/SKILL.md` has `name: plite-plan`, source
  `.agents/rules/plite-plan.mdc`, and `--template plite-plan`.

Agent-native parity map:
| User action | Agent route | Source owner | Mirror/lock/doc | Proof | Status |
|---|---|---|---|---|---|
| Invoke Plite planning skill | `plite-plan` | `.agents/rules/plite-plan.mdc` | `.agents/skills/plite-plan/SKILL.md` | generated mirror audit | pass |
| Create Plite Plan goal | `--template plite-plan` | `docs/plans/templates/plite-plan.md` | generated plan | template file audit | pass |
| Avoid stale old route | no `slate-plan` | N/A | N/A | stale-ref no-match audit | pass |

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
- Caveats: unrelated `slate-*` worker skill names remain by scope.

Timeline:
- 2026-06-24T14:53:39.741Z Task goal plan created.
- 2026-06-24T14:55Z Moved `slate-plan` source/template to `plite-plan`.
- 2026-06-24T14:56Z Updated active refs and ran `pnpm install`.
- 2026-06-24T14:57Z Verified generated `plite-plan` mirror and no
  `slate-plan` refs.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run `check-complete`, complete goal, hand off |
| What is the goal? | Rename the planning skill from `slate-plan` to `plite-plan` |
| What have I learned? | The command key itself should be `plite-plan` |
| What have I done? | Renamed source/template/refs, regenerated mirror, audited stale refs |

Open risks:
- None for this packet.
