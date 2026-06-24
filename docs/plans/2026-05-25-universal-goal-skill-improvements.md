# universal goal skill improvements

Objective:
Make the `goal` skill more universal without turning it into a repo-policy
dump, complete only when `.agents/rules/goal.mdc` and generated goal skills
include universal lifecycle boundaries, proportionality, active-goal conflict
handling, evidence taxonomy, derived-skill contract, resume protocol, and a
sharper repair scope matrix.

Goal plan:
docs/plans/2026-05-25-universal-goal-skill-improvements.md

Template:
docs/plans/templates/task.md

Task source:
- type: chat request
- id / link: N/A
- title: Add all proposed universal goal-skill improvements
- acceptance criteria:
  - Add all seven proposed universal sections or rules.
  - Keep project-specific commands and policies out of `goal`.
  - Regenerate `.agents/skills/goal/SKILL.md` and `.claude/skills/goal/SKILL.md`.
  - Verify source and generated skill contain the new universal guidance.

Completion threshold:
- `goal.mdc` includes the seven requested universal improvements.
- Generated agent-facing goal skills include the same content after
  `pnpm install`.
- Source audit confirms the expected headings and key rows.
- `node .agents/rules/goal/scripts/check-complete.mjs docs/plans/2026-05-25-universal-goal-skill-improvements.md` passes.

Verification surface:
- `pnpm install`.
- `rg` source/generated heading audit.
- `rg` key-rule audit.
- Goal plan completion check.

Constraints:
- Keep `goal` generic.
- Do not add repo-specific commands, PR policy, browser tooling, package manager
  rules, Plite scorecards, or issue-ledger rules to `goal`.
- Do not hand-edit generated skill files.

Boundaries:
- Source of truth: latest user instruction: “ok for all go”.
- Allowed edit scope: `.agents/rules/goal.mdc`, generated goal skills from
  `pnpm install`, and this plan.
- Browser surface: N/A.
- Tracker sync: N/A.
- Non-goals: PR, commits, package code, checker/script behavior.

Blocked condition:
- Blocked only if Skiller cannot regenerate the updated goal skill from
  `.agents/rules/goal.mdc`.

Task state:
- task_type: agent-skill improvement
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: degraded-plan-state

Current verdict:
- verdict: done
- confidence: high
- next owner: final response
- reason: source and generated skills contain the requested universal guidance.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/rules/goal/scripts/check-complete.mjs docs/plans/2026-05-25-universal-goal-skill-improvements.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Read `.agents/skills/task/SKILL.md` and `.agents/rules/goal.mdc` before editing. |
| Active goal checked or created | yes | `get_goal` returned no active goal at final check; this task used the plan as durable state. |
| Source of truth read before edits | yes | User approved all proposed additions in chat. |
| Tracker comments and attachments read | no | N/A: no tracker. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: instruction-skill wording, not product-code behavior. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior. |
| Branch decision for code-changing task | no | N/A: user did not request branch/PR. |
| Release artifact decision | no | N/A: no package release. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: N/A, no release artifact.
- [x] Final handoff shape decided: concise summary plus verification.
- [x] Branch handling recorded: N/A, no branch/PR requested.
- [x] Local-env-rot retry policy recorded: N/A, no surprising repo-wide failure.
- [x] Workspace authority recorded: all proof commands ran in `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded: command-contract risk is over-bloating `goal`;
      patch keeps repo policy in derived skills/templates.
- [x] Review/autoreview target selected: N/A, instruction-only skill patch.
- [x] Agent-native review decision recorded: loaded
      `.agents/skills/agent-native-reviewer/SKILL.md`; no UI/tool action parity
      issue applies to goal instruction text.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run sync and source/generated audits | `pnpm install` passed; `rg` audits found all expected sections and key rows. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: skill improvement, not bug fix. |
| Targeted behavior verification | yes | Verify all seven additions in source and generated skills | `rg` found all seven headings/rules in `.agents/rules/goal.mdc`, `.agents/skills/goal/SKILL.md`, and `.claude/skills/goal/SKILL.md`. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification | N/A. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` if changed | N/A for manifest changes; `pnpm install` ran for Skiller sync. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed and generated goal skills contain new sections. |
| Workspace authority proof | yes | Run verification in owning repo/package/app/route/tool | Commands ran in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat | N/A. |
| CI-controlled template output changed | no | Restore generated template output or record why kept | N/A. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A. |
| High-risk mini gate | yes | Record failure mode, proof plan, chosen boundary | Failure mode: universal skill bloats with repo commands; chosen boundary keeps `goal` lifecycle-only and templates/derived skills policy-owned. |
| Agent-native review for agent/tooling changes | yes | Load reviewer and close findings or record N/A | Loaded reviewer; no agent action parity gap for instruction text. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun exact failing command, or record N/A | N/A. |
| Autoreview for non-trivial implementation changes | no | Run autoreview or N/A | N/A: instruction-only source change, no implementation behavior. |
| PR create or update | no | Run `check` before PR work | N/A. |
| PR proof image hosting | no | Host proof images or N/A | N/A. |
| Tracker sync-back | no | Post issue/Linear sync or N/A/blocker | N/A. |
| Final handoff contract | yes | Fill final handoff fields | Filled below. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: generated markdown sync and source audit are the relevant proof. |
| Goal plan complete | yes | Run `node .agents/rules/goal/scripts/check-complete.mjs docs/plans/2026-05-25-universal-goal-skill-improvements.md` | Pending final run. |
| Knowledge extraction | no | Evaluate `ce-compound`; capture if useful | N/A: no new reusable project solution beyond the goal source patch. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read user request, task skill, goal source. | implementation |
| Implementation | complete | Patched `.agents/rules/goal.mdc`. | verification |
| Verification | complete | `pnpm install`; `rg` source/generated audits. | closeout |
| PR / tracker sync | complete | N/A: not requested. | final response |
| Closeout | complete | Plan completion check pending final command. | final response |

Findings:
- `goal` already had repair and gate mechanics, but lacked explicit
  proportionality, evidence taxonomy, derived-skill boundary, and resume
  guidance.
- `get_goal` returned no active goal at final check, so no stale tool goal
  needed completion or blocking.

Decisions and tradeoffs:
- Added compact sections to `goal.mdc` instead of updating every derived skill
  now.
- Kept commands and repo policy out of `goal`; derived skills/templates remain
  responsible for lane-specific details.

Implementation notes:
- Added `Universal Boundary`.
- Added `Proportionality Dial`.
- Added `Active Goal Conflict Protocol`.
- Added `Evidence Type Contract`.
- Replaced repair classification bullets with a repair scope matrix.
- Added `Derived Skill Contract`.
- Added `Resume Protocol`.

Review fixes:
- Agent-native review: no accepted findings; this change does not add a user
  action, UI workflow, or agent tool surface.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:
- `pnpm install`: passed; Skiller applied rules for Claude Code and Codex.
- `rg -n "Universal Boundary|Proportionality Dial|Active Goal Conflict Protocol|Evidence Type Contract|Repair scope matrix|Derived Skill Contract|Resume Protocol" .agents/rules/goal.mdc .agents/skills/goal/SKILL.md .claude/skills/goal/SKILL.md`: found all expected sections in source and generated skills.
- `rg -n "repo commands|package managers|browser tools|micro|normal|major|N/A:<reason>|newer user correction|paused or externally controlled|Derived skills should route" .agents/rules/goal.mdc .agents/skills/goal/SKILL.md`: found key universal rules in source and generated skill.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A.
- Confidence line: high.
- Flow table:
  - Reproduced: N/A; user approved a skill improvement list.
  - Verified: generated source sync and section/key-rule audits.
- Browser check: N/A.
- Outcome: all proposed universal goal-skill additions landed.
- Caveat: did not update derived skills in this pass.
- Design:
  - Chosen boundary: `goal` owns lifecycle/evidence/conflicts/repair; derived
    skills/templates own repo and lane policy.
  - Why not quick patch: only adding one paragraph would leave conflict/resume
    behavior ambiguous.
  - Why not broader change: touching all derived skills would be noisy and was
    not required to make `goal` universal.
- Verified: `pnpm install` and `rg` audits.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: derived skills not rewired.

Timeline:
- 2026-05-25T07:35:35.997Z Task goal plan created.
- 2026-05-25T07:36Z Read task and goal skill sources.
- 2026-05-25T07:39Z Patched `.agents/rules/goal.mdc` with universal sections.
- 2026-05-25T07:40Z Ran `pnpm install`.
- 2026-05-25T07:41Z Audited source and generated goal skills.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response |
| What is the goal? | Make `goal` more universal without adding repo policy |
| What have I learned? | The right boundary is lifecycle in `goal`, policy in derived skills/templates |
| What have I done? | Added seven universal sections/rules and regenerated skills |

Open risks:
- None.
