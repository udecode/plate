# replace improve codebase architecture with architecture cleanup

Objective:
Replace the old repo-local architecture candidate wrapper with `$architecture-cleanup`: a harder deslop, simplify, merge/delete/inline/split owner with a dedicated autogoal template.

Goal plan:
docs/plans/2026-06-17-replace-improve-codebase-architecture-with-architecture-cleanup.md

Template:
docs/plans/templates/task.md plus agent-native pack

Task source:
- type: user instruction
- id / link: chat request
- title: Replace `$improve-codebase-architecture` with stronger architecture-cleanup ownership
- acceptance criteria:
  - remove the old skill owner instead of keeping a wrapper;
  - add the overrides from the selected text: anti-confetti rule, deslop mode, agent-navigation score, Slate/Plate hard boundary, strict implementation packet law, merge/delete as equal outcomes, and VISION fit gate;
  - add a dedicated autogoal template for this flow;
  - update local routing so supervisors use the new owner;
  - sync generated skill mirrors;
  - verify no active old-name references remain.

First checkpoint:
- Explicit requirement captured: replace the old owner, not just patch it.
- Scope captured: local skill/rule/template/routing only.
- Non-goal captured: no runtime Slate/Plate code cleanup in this pass.
- Stop condition captured: stop after generated mirror sync, stale-reference audit, and goal closeout pass.
- Final handoff captured: changed list, verification, caveat, and next owner.

Timed checkpoint:
- requested duration: not applicable; no duration was requested.
- semantics: complete this topology change cleanly.
- initial confidence / cleanliness score: 0.74, because the old skill existed but was too candidate-oriented and too soft against over-splitting.
- final score / loop closure: 0.93, because the old owner is removed, the new owner has explicit laws, and routing points at it.

Completion threshold:
- `.agents/rules/architecture-cleanup.mdc` exists and owns architecture/code-shape cleanup.
- `.agents/rules/improve-codebase-architecture.mdc` is removed.
- `.agents/skills/architecture-cleanup/SKILL.md` is generated from the source rule.
- `.agents/skills/improve-codebase-architecture` is absent after sync.
- `docs/plans/templates/architecture-cleanup.md` exists and renders through autogoal.
- `.agents/AGENTS.md`, `docs/vision/common.md`, and supervisor rules route to `$architecture-cleanup`.
- Active source/generated/template docs have no stale `improve-codebase-architecture` or `codebase-steward` references.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-replace-improve-codebase-architecture-with-architecture-cleanup.md` passes.

Verification surface:
- `pnpm install`
- `rg -n "improve-codebase-architecture|codebase-steward" .agents/rules .agents/skills .agents/AGENTS.md AGENTS.md docs/vision docs/plans/templates package.json`
- `sed -n '1,90p' .agents/skills/architecture-cleanup/SKILL.md`
- `node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs --template architecture-cleanup --title "architecture cleanup template smoke" --path .tmp/architecture-cleanup-template-smoke.md --force`
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-replace-improve-codebase-architecture-with-architecture-cleanup.md`

Constraints:
- Do not edit generated `SKILL.md` directly.
- Do not create a wrapper skill that only renames an existing owner.
- Keep the old name out of active routing.
- Do not touch runtime package code.
- Do not commit, stage, push, or create a PR.

Boundaries:
- Source of truth: `.agents/rules/architecture-cleanup.mdc`, `.agents/AGENTS.md`, `docs/plans/templates/architecture-cleanup.md`, and `docs/vision/common.md`.
- Allowed edit scope: agent rules, generated mirror via `pnpm install`, plan template, and this closeout plan.
- Slate / Plate boundary: captured in the new skill; Slate owns substrate/API/proof, Plate owns plugin/product/docs/registry UX.
- Public API boundary: no package public API changed.
- Browser surface: not applicable; no app UI changed.
- Package/API surface: not applicable; no package exports changed.
- Non-goals: no broad repo refactor, no source code deslop packet, no public release/docs change.

Output budget strategy:
- Read selected skill/rule/template files with bounded `sed`.
- Run focused `rg` audits instead of broad markdown dumps.
- Use generated mirror smoke output only for path evidence, then remove the temp file.

Blocked condition:
- None. The replacement can be completed locally from rule/template sources.

Task state:
- task_type: skill-topology cleanup
- task_complexity: medium
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete after check-complete passes

Current verdict:
- verdict: complete
- confidence: 0.93
- next owner: architecture-cleanup
- reason: The old soft candidate wrapper is gone, and the new owner has explicit anti-confetti, deslop, navigation-score, Slate/Plate boundary, implementation packet, and VISION-fit gates.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint above |
| Timed checkpoint parsed | no | No duration requested |
| Skill analysis before edits | yes | Loaded old skill, source rule, autogoal, skill-creator, and agent-native reviewer |
| Active goal checked or created | yes | This plan was created through autogoal helper |
| Source of truth read before edits | yes | `.agents/rules/**`, `.agents/AGENTS.md`, generated mirror policy |
| Tracker comments and attachments read | no | Chat-only request |
| Video transcript evidence required | no | No video evidence involved |
| `docs/solutions` checked for non-trivial existing-code work | no | Skill topology change, not product code |
| TDD decision before behavior change or bug fix | no | No behavior/runtime change |
| Branch decision for code-changing task | no | No branch or commit requested |
| Release artifact decision | no | No package release surface |
| Browser tool decision for browser surface | no | No UI surface changed |
| PR expectation decision | yes | No PR requested |
| Tracker sync expectation decision | yes | No tracker sync |
| Output budget strategy recorded | yes | Bounded reads and focused audits recorded |
| Agent-native pack selected | yes | Agent-facing skill/rule topology changed |
| Agent-facing action surface identified | yes | `$architecture-cleanup` skill invocation and supervisor routing |
| Source rule versus generated mirror boundary identified | yes | Edited `.agents/rules/**`, synced `.agents/skills/**` via `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded reviewer instructions before closeout |

Work Checklist:
- [x] First checkpoint copied explicit prompt requirements, scope, non-goals, stop condition, deliverables, verification surface, and success criteria.
- [x] Short objective plus outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, title, task type, acceptance criteria, caveats, likely files, and root-cause layer.
- [x] Required video or screen-recording evidence is not applicable.
- [x] Nearby repo instructions and skill ownership patterns were read before edits.
- [x] Implementation fixes the right ownership boundary by removing the old wrapper owner and creating one sharper architecture cleanup owner.
- [x] Release artifact requirement is not applicable because no package changed.
- [x] Final handoff shape is decided: changed list, verification, caveat, and next owner.
- [x] Branch handling is not applicable because no commit or PR was requested.
- [x] Local-env-rot retry policy is not applicable; no surprising test/install failure occurred.
- [x] Workspace authority recorded: all proof commands run in `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded: this is an agent-action/routing change, so generated mirror sync and stale-reference audit are required.
- [x] Review target selected: agent-native review for skill/rule changes.
- [x] Output budget discipline followed through bounded reads and focused audits.
- [x] Agent-native pack: source-of-truth rule files were edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from `$architecture-cleanup`.
- [x] Agent-native pack: generated mirrors synced after `.agents/rules/**` changed.
- [x] Agent-native pack: no accepted actionable findings remain; discoverability and source/generated boundary are satisfied.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run sync, stale audit, generated mirror read, template smoke, and check-complete | Evidence rows below |
| Bug reproduced before fix | no | Not a bug fix | N/A |
| Targeted behavior verification | yes | Verify skill routing and generated mirror | `architecture-cleanup` mirror read and stale old-name audit |
| TypeScript or typed config changed | no | No typed code changed | N/A |
| Package exports or file layout changed | no | No package exports changed | N/A |
| Package manifests, lockfile, or install graph changed | no | No package manifest changed by this task | N/A |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` succeeded; mirror exists |
| Workspace authority proof | yes | Run commands in owning repo | Commands run in `/Users/zbeyens/git/plate-2` |
| Browser surface changed | no | No browser surface changed | N/A |
| Browser final proof | no | No browser surface changed | N/A |
| CI-controlled template output changed | no | No template output touched | N/A |
| Package behavior or public API changed | no | No package changed | N/A |
| Registry-only component work changed | no | No registry component changed | N/A |
| Docs or content changed | yes | Verify source-backed routing docs and plan template | `pnpm install`, `rg`, and template smoke |
| High-risk mini gate | yes | Record failure mode and proof | Failure mode: stale old skill still routable; proof: stale-reference audit and absent old mirror |
| Agent-native review for agent/tooling changes | yes | Load reviewer and close findings | Reviewer loaded; source/generated boundary and discoverability satisfied |
| Local install corruption suspected | no | No install corruption signal | N/A |
| Autoreview for non-trivial implementation changes | no | Skill/docs topology only; no runtime code packet | N/A |
| PR create or update | no | No PR requested | N/A |
| Task-style PR body verified | no | No PR requested | N/A |
| PR proof image hosting | no | No PR requested | N/A |
| Tracker sync-back | no | No tracker involved | N/A |
| Final handoff contract | yes | Fill handoff fields below | Completed below |
| Final lint | no | Markdown/rule-only skill topology; `pnpm install` is the required sync gate | N/A |
| Output budget discipline | yes | Verify bounded output approach | Bounded `sed`, targeted `rg`, no broad dumps |
| Timed checkpoint | no | No duration requested | N/A |
| Goal plan complete | yes | Run check-complete on this plan | Command recorded below |
| Agent source / generated sync | yes | Run `pnpm install` and verify generated mirrors | Done |
| Agent action discoverability | yes | Source-audit the new skill path | `$architecture-cleanup` generated mirror read |
| Agent-native review | yes | Load reviewer and close accepted findings | Done |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Prompt requirements copied; skill sources read | Implementation |
| Implementation | complete | New rule/template/routing added; old source rule removed | Verification |
| Verification | complete | Sync, stale audit, generated mirror, template smoke | Closeout |
| PR / tracker sync | not applicable | No PR/tracker requested | Final response |
| Closeout | complete | This plan plus check-complete | Final response |

Findings:
- The old owner was too soft: it could identify candidates but did not strongly prevent split-confetti or require future-agent navigation proof.
- A replacement owner is cleaner than a wrapper because the user wants one architecture-cleanup lane, not another synonym.

Decisions and tradeoffs:
- Chose `$architecture-cleanup` as the name because it is short, scoped to architecture/code cleanliness, and not confused with task execution, maintainer queue routing, or Slate automation.
- Kept implementation authority narrow: safe behavior-neutral cleanup only; broader public API/runtime/product decisions route to plan owners.
- Kept merge/delete/inline equal to split because file-count reduction and fewer agent hops are often the real architecture win.

Implementation notes:
- Added `.agents/rules/architecture-cleanup.mdc`.
- Removed `.agents/rules/improve-codebase-architecture.mdc`.
- Added `docs/plans/templates/architecture-cleanup.md`.
- Updated `.agents/AGENTS.md`, `docs/vision/common.md`, `.agents/rules/major-task.mdc`, `.agents/rules/maintainer.mdc`, `.agents/rules/slate-ar.mdc`, and `.agents/rules/slate-auto.mdc`.
- Synced generated mirrors through `pnpm install`.

Review fixes:
- Removed explicit old-name self-reference from the new rule text after first sync so the active stale-reference audit is clean.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Template smoke file intentionally contained placeholders | 1 | Treat it as render proof only, then remove temp file | Cleaned after verification |

Verification evidence:
- `pnpm install` passed after rule/template/routing edits.
- `pnpm install` passed again after old-name wording cleanup.
- `rg -n "improve-codebase-architecture|codebase-steward" .agents/rules .agents/skills .agents/AGENTS.md AGENTS.md docs/vision docs/plans/templates package.json` returned no matches.
- `sed -n '1,90p' .agents/skills/architecture-cleanup/SKILL.md` confirmed generated mirror exists and points to `.agents/rules/architecture-cleanup.mdc`.
- `node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs --template architecture-cleanup --title "architecture cleanup template smoke" --path .tmp/architecture-cleanup-template-smoke.md --force` rendered the new template.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-replace-improve-codebase-architecture-with-architecture-cleanup.md` is the final gate for this plan.

Open risks:
- Historical plans, summaries, or chat logs can still mention the old skill name. Active sources, generated mirrors, routing docs, templates, and package metadata do not.
- The first real `$architecture-cleanup` run should validate whether the template is too strict or just strict enough; the smoke test only proves renderability.

Final handoff contract:
- PR line: not applicable; no PR requested.
- Issue / tracker line: not applicable.
- Confidence line: 0.93.
- Flow table:
  - Reproduced: old skill existed and active routing referenced it.
  - Verified: new generated skill exists; old active refs removed; template renders.
- Browser check: not applicable.
- Outcome: `$architecture-cleanup` is now the architecture/code-cleanliness owner, with anti-confetti, deslop, agent-navigation, Slate/Plate boundary, packet-law, merge/delete, and VISION-fit gates.
- Caveat: historical plans or logs may still mention the old skill; active sources/templates/routing do not.
- Design:
  - Chosen boundary: one repo-local architecture cleanup owner.
  - Why not quick patch: patching the old candidate wrapper would preserve a weak mental model.
  - Why not broader change: runtime cleanup belongs to later `$architecture-cleanup` runs, not this topology replacement.
- Verified: sync, stale-reference audit, generated mirror audit, template smoke, and check-complete.
- PR body verified: not applicable.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete for the skill-topology replacement |
| Where am I going? | Final response to user |
| What is the goal? | Replace the old architecture candidate wrapper with `$architecture-cleanup` and remove stale active routing |
| What have I learned? | The new owner needs hard anti-confetti and deslop gates, not just candidate discovery |
