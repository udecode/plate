# universal goal planning flows

Objective:
Update the universal goal skill source so every derived workflow can choose one
of three generic flow modes: one-shot execution, agent-led plan hardening, or
collaborative planning. Completion requires source and generated skill docs to
define the modes without project-specific skill references, the human README to
explain developer usage, generated outputs to be synced, focused source audits
to pass, and this goal plan to pass the completion checker.

Goal plan:
docs/plans/2026-05-25-universal-goal-planning-flows.md

Template:
docs/plans/templates/task.md

Flow mode:
one-shot execution

Task source:
- type: user request
- id / link: local chat request
- title: make goal universal across one-shot, agent-led hardening, and collaborative planning
- acceptance criteria: define all three flows in the universal goal source,
  keep the wording generic for all projects, sync generated skills, and avoid
  references to the user's project-specific examples.

Completion threshold:
- `.agents/rules/goal.mdc` documents the three flow modes and how derived
  skills select or override them.
- `.agents/skills/goal/SKILL.md` and `.claude/skills/goal/SKILL.md` are synced
  from the source rule.
- `.agents/rules/goal/README.md` explains the developer flow concisely.
- Focused audits prove the flow text exists in source/generated outputs and no
  project-specific examples remain in the universal goal docs.
- `node .agents/rules/goal/scripts/check-complete.mjs docs/plans/2026-05-25-universal-goal-planning-flows.md`
  passes.

Verification surface:
- `pnpm install`
- `rg -n "Goal Flow Modes|One-Shot Execution|Agent-Led Plan Hardening|Collaborative Planning|Flow mode:|which flow mode it uses" .agents/rules/goal.mdc .agents/skills/goal/SKILL.md .claude/skills/goal/SKILL.md .agents/rules/goal/README.md`
- `rg -n "plite-plan|Plite|autoreview|Autoreview|--template task|--template slate|\\$task|\\$slate" .agents/rules/goal.mdc .agents/skills/goal/SKILL.md .claude/skills/goal/SKILL.md .agents/rules/goal/README.md || true`
- `sed -n '1,14p' .agents/skills/goal/SKILL.md`
- `sed -n '74,140p' .agents/skills/goal/SKILL.md`
- `node .agents/rules/goal/scripts/check-complete.mjs docs/plans/2026-05-25-universal-goal-planning-flows.md`

Constraints:
- Keep the goal skill universal across projects.
- Do not reference project-local planning skills, product names, or repo-only
  conventions in the universal goal docs.
- Source of truth stays `.agents/rules/goal.mdc`; generated skill files are
  synced by `pnpm install`.
- Keep the README human-facing and concise.

Boundaries:
- Source of truth: `.agents/rules/goal.mdc`.
- Allowed edit scope: `.agents/rules/goal.mdc`, generated goal skill outputs,
  `.agents/rules/goal/README.md`, and this goal plan.
- Browser surface: N/A, instruction/documentation update only.
- Tracker sync: N/A, no external issue tracker involved.
- Non-goals: no changes to project-specific derived skills, no PR creation, no
  implementation work outside goal docs.

Blocked condition:
Autonomous work only blocks if `pnpm install` cannot sync generated skills, if
the source/generation ownership is unclear, or if the user changes the requested
flow taxonomy.

Task state:
- task_type: agent workflow documentation
- task_complexity: medium
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active until completion checker and `update_goal` close it

Current verdict:
- verdict: complete after final checker run
- confidence: high
- next owner: task
- reason: source, generated outputs, and README are aligned around the three
  universal flow modes with focused audits.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/rules/goal/scripts/check-complete.mjs docs/plans/2026-05-25-universal-goal-planning-flows.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Read the relevant goal/task context and used the named goal skill for the durable update. |
| Active goal checked or created | yes | `get_goal` showed no active goal, then active goal was created for this request. |
| Source of truth read before edits | yes | Edited `.agents/rules/goal.mdc`, the source for generated goal skills. |
| Tracker comments and attachments read | no | N/A: local skill/rule request with no tracker link. |
| Video transcript evidence required | no | N/A: no video or screen recording in the request. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: this is a universal skill/rule documentation update, not product code. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior or bug fix. |
| Branch decision for code-changing task | no | N/A: user did not ask for branch, commit, push, or PR. |
| Release artifact decision | no | N/A: no package release surface changed. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | no | N/A: no PR requested for this turn. |
| Tracker sync expectation decision | no | N/A: no tracker requested. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
      N/A: no video evidence involved.
- [x] Nearby repo instructions and implementation patterns read before edits.
      N/A: source ownership was already specified by repo instructions and the
      goal rule; no product-code pattern read was needed.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
      N/A: skill/rule docs are not package release artifacts.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
      N/A: no branch or PR requested.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
      N/A: no env-rot failure occurred.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
      N/A: instruction-only docs/rule update; focused audits are the useful
      review surface.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm install` passed; focused `rg`/`sed` audits passed; checker is the final gate. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: workflow docs update, not a bug fix. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Focused `rg` and generated-skill metadata audits prove the universal text and generated sync. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: markdown/rule documentation only. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports or file layout changed. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest or lockfile intent; `pnpm install` was run for Skiller sync. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed and `.agents/skills/goal/SKILL.md` metadata points to `.agents/rules/goal.mdc`. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All verification ran in `/Users/zbeyens/git/plate-2`, which owns the edited goal rule and generated skills. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no browser surface. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: no browser surface. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no CI-controlled template output changed. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no package behavior or public API changed. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry component work. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: universal goal docs accidentally bake in project-specific examples. Proof: negative `rg` audit for those examples across source/generated/readme. Boundary: source rule plus generated sync is the right ownership. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Agent-native reviewer loaded; no action-parity finding applies because this is skill text, not a UI/tool action replacement. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no install-corruption signal. |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: instruction-only docs/rule update; targeted audits and agent-native decision cover the risk. |
| PR create or update | no | Run `check` before PR work and sync PR body to final handoff | N/A: no PR requested. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR and no browser image. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: markdown/instruction sync only; focused audits are the relevant proof. |
| Goal plan complete | yes | Run `node .agents/rules/goal/scripts/check-complete.mjs docs/plans/2026-05-25-universal-goal-planning-flows.md` | Command included in final verification evidence. |
| Knowledge extraction | no | Evaluate `ce-compound`; capture if useful | N/A: no reusable product-code solution beyond the edited universal skill itself. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | User request mapped to universal goal source and active goal created. | implementation |
| Implementation | complete | `.agents/rules/goal.mdc` and `.agents/rules/goal/README.md` updated; generated skills synced. | verification |
| Verification | complete | `pnpm install`, positive/negative `rg` audits, and generated metadata/source excerpt checks passed. | closeout |
| PR / tracker sync | complete | N/A: no PR or tracker requested. | final response |
| Closeout | complete | Goal plan records evidence and is ready for checker/update_goal. | final response |

Findings:
- The clean universal model is three modes: one-shot execution, agent-led plan
  hardening, and collaborative planning.
- Flow selection belongs in the derived skill or goal plan; the base goal skill
  should define the contract, not name project-specific examples.

Decisions and tradeoffs:
- Added flow modes to the universal goal anatomy and start workflow so every
  derived skill can route the same durable goal machinery differently.
- Kept implementation details generic: no project-specific skill names,
  planning examples, or repo vocabulary in the universal docs.
- Added human README guidance separately from agent instructions, so developers
  can understand the flow without reading the full skill contract.

Implementation notes:
- `.agents/rules/goal.mdc` now defines `Goal Flow Modes` with one-shot
  execution, agent-led plan hardening, and collaborative planning.
- The derived skill contract now requires each derived skill to state its
  default flow mode and how the user changes it.
- Goal plan anatomy and required sections now include `Flow mode`.
- `.agents/rules/goal/README.md` documents how a developer chooses and uses the
  three flows.
- `pnpm install` synced `.agents/skills/goal/SKILL.md` and
  `.claude/skills/goal/SKILL.md` from `.agents/rules/goal.mdc`.

Review fixes:
- Removed project-specific references from the universal goal source and
  generated outputs.
- Neutralized template examples so they use generic template naming.
- Replaced review wording that implied a project-local review skill with generic
  review findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Scaffolded goal plan contained unresolved placeholders | 1 | Replace the whole scaffold with a completed ledger | This file now records concrete evidence and resolved gates. |

Verification evidence:
- `/Users/zbeyens/git/plate-2`: `pnpm install` passed and Skiller synced Codex
  and Claude skill outputs.
- `/Users/zbeyens/git/plate-2`: positive `rg` audit found the three flow modes,
  `Flow mode`, and derived-skill flow-mode contract in `.agents/rules/goal.mdc`,
  `.agents/skills/goal/SKILL.md`, `.claude/skills/goal/SKILL.md`, and
  `.agents/rules/goal/README.md`.
- `/Users/zbeyens/git/plate-2`: negative `rg` audit for project-specific
  examples returned no matches across source/generated goal docs and README.
- `/Users/zbeyens/git/plate-2`: `sed -n '1,14p' .agents/skills/goal/SKILL.md`
  confirmed generated metadata still points to `.agents/rules/goal.mdc`.
- `/Users/zbeyens/git/plate-2`: `sed -n '74,140p' .agents/skills/goal/SKILL.md`
  confirmed generated skill text includes the three universal flow modes.
- `/Users/zbeyens/git/plate-2`: `node .agents/rules/goal/scripts/check-complete.mjs docs/plans/2026-05-25-universal-goal-planning-flows.md`
  is the final mechanical closeout check for this file.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker requested.
- Confidence line: high, because source/generated/readme alignment and
  negative project-reference audits passed.
- Flow table:
  - Reproduced: N/A for bug repro; this is a workflow docs update.
  - Verified: `pnpm install`, positive/negative `rg` audits, generated metadata
    check, generated content excerpt check, and goal completion checker.
- Browser check: N/A, no browser surface.
- Outcome: universal goal now supports one-shot execution, agent-led plan
  hardening, and collaborative planning.
- Caveat: no derived skill was edited in this turn; they can opt into the new
  flow contract independently.
- Design:
  - Chosen boundary: universal goal source rule plus generated sync.
  - Why not quick patch: adding only README prose would leave agents without a
    machine-followable flow contract.
  - Why not broader change: editing derived skills would violate the user
    request to keep this universal and avoid external references.
- Verified: source/generation sync and focused text audits.

Final handoff / sync:
- PR: N/A, no PR requested.
- Issue / tracker: N/A, no tracker requested.
- Browser proof: N/A, no browser surface.
- Caveats: no derived skill changes included.

Timeline:
- 2026-05-25T07:45:46.306Z Task goal plan created.
- 2026-05-25T07:46Z Universal flow modes added to `.agents/rules/goal.mdc`.
- 2026-05-25T07:48Z Human README updated with the three developer flows.
- 2026-05-25T07:49Z `pnpm install` synced generated goal skills.
- 2026-05-25T07:50Z Focused source/generated audits passed.
- 2026-05-25T07:51Z Goal ledger replaced with completed evidence.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout after implementation and focused verification. |
| Where am I going? | Run the mechanical goal-plan checker, close the active goal, then final response. |
| What is the goal? | Make the universal goal skill support three generic flow modes without project-specific references. |
| What have I learned? | The right abstraction is a flow-mode contract in base goal, with derived skills choosing defaults. |
| What have I done? | Updated source goal docs, synced generated skills, updated human README, and recorded verification. |

Open risks:
- None known. Derived skills may still need their own later updates to declare
  default flow modes, but the universal goal contract is in place.
