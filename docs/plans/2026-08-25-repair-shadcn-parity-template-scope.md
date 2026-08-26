# repair shadcn parity template scope

Objective:
Repair `$shadcn-parity` so protocol audits ignore post-release template output
and synchronization unless the user explicitly adds that separate scope.

Flow mode:
one-shot execution.

Goal plan:
docs/plans/2026-08-25-repair-shadcn-parity-template-scope.md

Template:
docs/plans/templates/goal-repair.md

Primary template:
docs/plans/templates/goal-repair.md

Applied packs:

- agent-native (docs/plans/templates/packs/agent-native.md)

Expectation:

- user expectation: ignore templates because they are synchronized after
  release; repair the skill so parity audits do not gate on them
- observed miss: `.agents/rules/shadcn-parity.mdc` makes template configs and
  local template sync first-class parity owners, which caused the audit to
  promote post-release generated state into a P1 setup defect
- owning skill/template/helper: source rule
  `.agents/rules/shadcn-parity.mdc`, with generated mirror
  `.agents/skills/shadcn-parity/SKILL.md`
- repair classification: derived-skill scope correction

First checkpoint:

- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:

- requested duration: N/A; none requested
- semantics: evidence-gated micro repair
- initial confidence score: N/A; exact source/mirror invariants are stronger
- improvement loop: patch the single source owner, regenerate, validate, and
  review the resulting agent route
- final score / loop closure: source and mirror exclude templates, validators
  pass, and agent-native review has no accepted finding

Completion threshold:

- The source rule explicitly excludes `templates/**`, template
  `components.json`, and post-release template sync from `$shadcn-parity`
  unless the user separately scopes them; no positive template ownership or
  template parity gate remains elsewhere in that rule.
- `pnpm install` regenerates the target skill mirror, the source/mirror content
  agrees, skill validation passes, and a source audit proves the boundary is
  discoverable.
- Repair closure is legal only when the source owner is patched, generated
  skills are synced when `.agents/rules/**` changed, a source audit proves the
  repair text exists, the repaired template or rule is smoke-checked, deliberate
  non-repairs are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-25-repair-shadcn-parity-template-scope.md` passes.

Verification surface:

- Focused `rg` audit of template language in the source and generated skill.
- `pnpm install` from the Plate root, followed by source/mirror parity check.
- `skill-creator` quick validation of the generated skill.
- Scoped formatting/diff checks and an `agent-native-reviewer` capability map.

Constraints:

- Repair one expectation narrowly.
- Patch source-of-truth files, not generated skill mirrors.
- Do not weaken evidence safety or completion gates just to reduce annoyance.
- Do not broaden the repair to unrelated skills/templates.
- Do not edit templates, template tooling, product code, registry source,
  generated registry output, or the prior audit artifact.

Boundaries:

- Source of truth: the user's correction plus
  `.agents/rules/shadcn-parity.mdc`; `.github/workflows/release.yml` confirms
  templates are synchronized after publication.
- Allowed edit scope: `.agents/rules/shadcn-parity.mdc`, its generated
  `.agents/skills/shadcn-parity/SKILL.md` mirror, this goal plan, and incidental
  command-owned sync output from `pnpm install`.
- Derived skill scope: registry schema, resolver, namespace, dependency,
  provider, build, route, and install-protocol parity only.
- Non-goals: changing template state or sync mechanics, rerunning the parity
  audit, changing `$sync-shadcn`, modifying generic `autogoal`, or changing
  product/runtime behavior.

Output budget strategy:

- Read only the named rule, mirror, release workflow slice, and relevant skill
  instructions. Cap searches to `.agents` owners and exact template terms;
  exclude generated registry output, templates, caches, and dependencies.

Blocked condition:

- Block only if `pnpm install` cannot regenerate the source-owned mirror after
  one evidence-based repair, or current repo generation proves another source
  owner controls this skill.

Repair state:

- repair_type: derived-skill scope correction
- current_phase: closeout
- current_phase_status: completed
- next_phase: none
- goal_status: complete

Current verdict:

- verdict: repaired; post-release template state is explicitly outside default
  `$shadcn-parity` scope, while upstream `components.json`, URL, and local-file
  resolver semantics remain in scope
- confidence: high; source/mirror invariants, both skill validators, formatting,
  diff checks, and agent-native review pass
- next owner: none
- reason: the source rule and generated mirror now route agents to registry
  protocol owners and reject template-state parity findings unless separately
  requested

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final repair evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-25-repair-shadcn-parity-template-scope.md` passes.
- Do not create hook state for this repair. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Ignore post-release templates and repair `$shadcn-parity`; no template or product change requested. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Expectation restated | yes | Template output and synchronization are outside default parity scope. |
| Active goal checked | yes | No prior active goal; this repair goal was created with the named plan. |
| Named plan or skill read | yes | Source rule and generated mirror read completely. |
| Owning source selected | yes | `.agents/rules/shadcn-parity.mdc` is the repo-declared source of truth. |
| Repair classification selected | yes | Derived-skill scope correction. |
| Safety conflict checked | yes | Removing an unrelated generated-output gate does not weaken registry protocol proof. |
| Output budget strategy recorded | yes | Exact owner reads and capped term searches only. |
| Agent-native pack selected | yes | Agent instructions and their generated mirror change. |
| Agent-facing action surface identified | yes | `$shadcn-parity` audit routing and scope. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules`; regenerate `.agents/skills` with `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | `.agents/skills/agent-native-reviewer/SKILL.md` read completely. |

Work Checklist:

- [x] N/A: no duration was requested; exact binary invariants replace a score.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Expectation and observed miss are stated with source evidence.
- [x] Primary owner selected: runtime plan, template, skill rule, or
      helper/checker.
- [x] Secondary owner is the generated mirror only; generic `autogoal`,
      `$sync-shadcn`, templates, and release workflow remain unchanged.
- [x] Patch touches the source rule only; generated skill output came from the
      required `pnpm install` command.
- [x] Derived skill vs generic `autogoal` ownership decision is recorded.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Deliberate non-repairs are recorded below.
- [x] Final response will state the cut, source owner, mirror/validation proof,
      and confirm templates/product code were untouched.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the description and `Scope Boundary` make the changed agent action discoverable.
- [x] Agent-native pack: `pnpm install` regenerated the Codex mirror; the Claude skill symlink resolves to the same mirror.
- [x] Agent-native pack: agent-native review found no accepted P0-P3 finding.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source owner patched | yes | Patch the selected source owner or record runtime-plan-only repair | `.agents/rules/shadcn-parity.mdc` owns the repair. |
| Generated skill sync | yes | If `.agents/rules/**` changed, run `pnpm install` and verify generated `SKILL.md` sync | `pnpm install` passed; exact source/generated comparison passed. |
| Template smoke | no | Instantiate the repaired template or inspect it directly when a smoke plan would create noise | N/A: no goal template changed; direct skill inspection and invariant checks prove the repair. |
| Incomplete-plan guard | no | Verify an unfinished generated plan still fails `check-complete.mjs`, or record N/A with reason | N/A: no plan template or checker changed. |
| Completed-plan representability | no | Verify the repaired expectation can be recorded in a completed plan without editing the template again, or record N/A | N/A: no plan template changed. |
| Helper/checker tests | no | If scripts changed, run focused script tests; otherwise N/A | N/A: no helper or checker changed. |
| P1 autoreview / review | no | Run applicable autoreview gate with `--max-priority P1`; P2/P3 are opt-in only, or record N/A for docs-only/source-rule-only repair | N/A: source-rule-only scope repair; focused agent-native review is the applicable gate. |
| Final lint | yes | Run scoped formatter/lint or record ignored-path/N/A reason | Prettier checks pass with the Markdown parser; `git diff --check` passes. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Reads stayed on named source/mirror/workflow files and capped searches. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-25-repair-shadcn-parity-template-scope.md` | Final result recorded after formatting. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | Codex mirror matches source exactly; Claude points to the Codex mirror. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Frontmatter and `Scope Boundary` explicitly exclude post-release template state. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Capability map passes with no P0-P3 finding. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | completed | Requirements, goal, skills, and release boundary recorded | none |
| Target selection | completed | Source rule selected; generated mirror is command-owned | none |
| Patch | completed | Source rule patched; mirror regenerated by `pnpm install` | none |
| Verification | completed | Invariants, validators, formatting, diff check, and agent-native review pass | none |
| Closeout | completed | Plan and handoff filled for final mechanical check | none |

Findings:

- The old source rule said Plate owned a template sync layer, listed template
  configs and sync scripts as parity owners, had a dedicated Template Rules
  section, and repeated template concerns in divergences and red flags.
- `.github/workflows/release.yml:335-408` owns `Sync registry and templates
after publish`; template state is therefore not a current registry-protocol
  parity gate.
- Upstream `components.json`, URL, and local-file resolver behavior remain
  legitimate protocol owners and survive the cut.

Decisions and tradeoffs:

- Keep upstream `components.json`, URL, and local-file resolver semantics in
  protocol scope; remove Plate template files and post-release sync mechanics
  from default scope.
- Add one explicit exclusion and route rather than silently deleting every
  mention, so future agents know templates were excluded deliberately.
- Patch only the derived skill source. Generic goal lifecycle and upstream-sync
  accounting are unrelated.

Repair patch notes:

- Replaced the template sync layer with registry delivery ownership.
- Deleted positive template ownership, dedicated template rules, local sync
  mechanics, and template divergence rows.
- Added an explicit scope boundary: never inspect or gate on template state by
  default; include it only when the user asks for a separate release/sync scope.
- Preserved upstream `components.json` and local-file protocol semantics.
- Regenerated `.agents/skills/shadcn-parity/SKILL.md`; the Claude skill path is
  a symlink to that generated mirror.

Deliberate non-repairs:

- Do not edit `templates/**`, template sync scripts, release workflow, product
  source, registry output, `$sync-shadcn`, generic `autogoal`, or the completed
  audit artifact.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Prettier could not infer a parser for `.mdc`, and the first plan check found formatting drift | 1 | Pass `--parser markdown`, format the source/plan, then regenerate the mirror | Source, mirror, and plan formatting checks pass. |

Verification evidence:

- `pnpm install` from `/Users/zbeyens/git/plate-2`: passed; Skiller applied
  rules for Claude Code and Codex.
- Exact source-to-generated transformation check: pass.
- Scope invariant check: no stale Template Rules/ownership phrases; explicit
  exclusion and preserved upstream protocol semantics exist in both source and
  mirror.
- `quick_validate.py` on the Codex and Claude skill paths: both valid.
- Codex and Claude skill content: identical through the Claude symlink.
- `pnpm exec prettier --check --parser markdown` on source and mirrors: pass.
- `git diff --check` on the rule, mirror, and goal plan: pass.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
docs/plans/2026-08-25-repair-shadcn-parity-template-scope.md`: complete.
- Agent-native capability map:

  | User action                                        | Agent route                                                    | Source owner                      | Mirror/doc                   | Proof                                  | Status |
  | -------------------------------------------------- | -------------------------------------------------------------- | --------------------------------- | ---------------------------- | -------------------------------------- | ------ |
  | Audit Plate registry/install parity against shadcn | `$shadcn-parity`                                               | `.agents/rules/shadcn-parity.mdc` | Codex/Claude generated skill | Source/mirror invariant and validators | pass   |
  | Explicitly request template generation review      | Separate explicit release/sync scope named by `$shadcn-parity` | `.github/workflows/release.yml`   | Skill `Scope Boundary`       | Post-publish workflow source audit     | pass   |

  No P0-P3 agent-native finding remains. A separate template wrapper skill was
  not added because the current workflow path is already named and the user did
  not request template operation.

Final repair handoff:

- Expectation: `$shadcn-parity` ignores post-release templates by default.
- Repaired owner: `.agents/rules/shadcn-parity.mdc`.
- Files changed: source rule, generated Codex/Claude mirror, and this goal plan.
- Verification: source audit, `pnpm install`, exact mirror parity, two quick
  validations, scoped format/diff checks, agent-native review, and goal checker.
- Caveat: no rerun or correction of the prior audit artifact is in scope.

Timeline:

- 2026-08-25T10:01:27.190Z Goal repair plan created.
- 2026-08-25: patched the source rule to remove template ownership and add an
  explicit release-owned exclusion.
- 2026-08-25: ran `pnpm install` and regenerated the Codex/Claude mirror.
- 2026-08-25: passed source/mirror invariants, both skill validators,
  formatting, diff checks, and agent-native review.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout; repair and verification are complete. |
| Where am I going? | Final mechanical goal check and handoff. |
| What is the goal? | Remove post-release templates from default `$shadcn-parity` scope. |
| What have I learned? | Protocol semantics stay in parity; post-release consumers do not. |
| What have I done? | Repaired the source, regenerated mirrors, and passed validation/review. |

Open risks:

- None in the repaired skill boundary. Template generation remains deliberately
  unassessed unless a user explicitly requests that release/sync scope.
