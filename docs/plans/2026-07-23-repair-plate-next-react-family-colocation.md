# repair plate-next react family colocation

Objective:
Repair Plate Next React-family ownership; done when rule and Plate vision reject
splits caused only by exported hooks/stores, generated skill matches, and audits
pass; plan docs/plans/2026-07-23-repair-plate-next-react-family-colocation.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-23-repair-plate-next-react-family-colocation.md

Template:
docs/plans/templates/goal-repair.md

Primary template:
docs/plans/templates/goal-repair.md

Applied packs:

- none

Expectation:

- user expectation: Plate Next must keep hooks, stores, controllers, and
  lifecycle state in the component family owner when they exist only for that
  family, even if the symbols are exported or imported by an app wrapper.
- observed miss: the current rule names hook/component and
  provider/store/lifecycle boundaries without requiring independent ownership;
  that wording let a family-scoped store import justify another file.
- owning skill/template/helper: `.agents/rules/plate-next.mdc` is the primary
  enforcement owner; `docs/vision/plate.md` is the durable Plate doctrine owner;
  `.agents/skills/plate-next/SKILL.md` is generated output.
- repair classification: derived-skill source-rule repair with required Vision
  synchronization.

First checkpoint:

- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:

- requested duration: N/A; none requested.
- semantics: N/A; one-shot repair.
- initial confidence score: N/A; binary source and generation gates apply.
- improvement loop: N/A; patch the narrow doctrine loophole and verify.
- final score / loop closure: N/A; exact audit and generated-sync proof apply.

Completion threshold:

- `.agents/rules/plate-next.mdc` and `docs/vision/plate.md` explicitly distinguish
  public consumption from independent ownership and keep family-scoped hooks,
  stores, controllers, and lifecycle state in the component family owner.
- The rule states that a separate hook/store file requires a durable independent
  owner usable beyond the component family, not merely an exported symbol or an
  app wrapper importing it.
- `pnpm install` regenerates `.agents/skills/plate-next/SKILL.md`, and exact
  source audits find the repaired doctrine in all three surfaces.
- Repair closure is legal only when the source owner is patched, generated
  skills are synced when `.agents/rules/**` changed, a source audit proves the
  repair text exists, the repaired template or rule is smoke-checked, deliberate
  non-repairs are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-23-repair-plate-next-react-family-colocation.md` passes.

Verification surface:

- `pnpm install`.
- Exact `rg` audit over `.agents/rules/plate-next.mdc`,
  `.agents/skills/plate-next/SKILL.md`, and `docs/vision/plate.md`.
- Focused diff review of the two source owners and generated skill.
- Final goal-plan checker.

Constraints:

- Repair one expectation narrowly.
- Patch source-of-truth files, not generated skill mirrors.
- Do not weaken evidence safety or completion gates just to reduce annoyance.
- Do not broaden the repair to unrelated skills/templates.

Boundaries:

- Source of truth: latest `autogoal repair <expectation>` request.
- Allowed edit scope: `.agents/rules/plate-next.mdc`,
  `docs/vision/plate.md`, generated `.agents/skills/plate-next/SKILL.md`, and
  this repair plan.
- Derived skill scope: Plate Next React family/file ownership only.
- Non-goals: no Media source refactor, no other skill rewrite, no API/runtime
  behavior change, no commit or PR.

Output budget strategy:

- Read exact doctrine ranges and use narrow `rg` patterns limited to the three
  owner/generated files; cap command output and avoid repo-wide source dumps.

Blocked condition:

- Stop only if the rule generator cannot produce the Plate Next skill or the
  generated artifact contradicts its source after focused repair attempts.

Repair state:

- repair_type: derived-skill doctrine repair
- current_phase: complete
- current_phase_status: complete
- next_phase: none
- goal_status: complete

Current verdict:

- verdict: repaired primary enforcement rule and synchronized Plate doctrine
- confidence: high
- next owner: closeout
- reason: the miss is lane-specific and the generated skill is not a source
  owner.

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final repair evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-23-repair-plate-next-react-family-colocation.md` passes.
- Do not create hook state for this repair. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Expectation, completion threshold, boundaries, non-goals, and final handoff recorded above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Expectation restated | yes | Expectation section names family-scoped hooks/store ownership |
| Active goal checked | yes | `get_goal` returned no active goal |
| Named plan or skill read | yes | User supplied full Plate Next skill; Autogoal repair rule and exact source ranges read |
| Owning source selected | yes | Primary `.agents/rules/plate-next.mdc`; synchronized doctrine `docs/vision/plate.md` |
| Repair classification selected | yes | Derived-skill doctrine repair |
| Safety conflict checked | yes | No conflict with evidence safety; no runtime/API edits |
| Output budget strategy recorded | yes | Narrow three-file searches and capped reads |

Work Checklist:

- [x] N/A: no duration requested; binary repair gates apply.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Expectation and observed miss are stated with source evidence.
- [x] Primary owner selected: runtime plan, template, skill rule, or
      helper/checker.
- [x] Secondary owner justified: `docs/vision/plate.md` owns durable Plate
      doctrine; generated skill is output only.
- [x] Patch touched source-of-truth files only; `pnpm install` generated the
      skill mirror.
- [x] Derived skill vs generic `autogoal` ownership decision is recorded.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Deliberate non-repairs are recorded.
- [x] Final response shape is recorded: expectation, repaired owners,
      generation/audit proof, and residual caveat.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source owner patched | yes | Patch the selected source owner or record runtime-plan-only repair | `.agents/rules/plate-next.mdc` and `docs/vision/plate.md` contain the repaired ownership rule |
| Generated skill sync | yes | If `.agents/rules/**` changed, run `pnpm install` and verify generated `SKILL.md` sync | `pnpm install` passed; normalized-body assertion proves exact rule/skill body equality |
| Template smoke | no | Instantiate the repaired template or inspect it directly when a smoke plan would create noise | N/A: no goal template changed; generated Plate Next rule was inspected directly |
| Incomplete-plan guard | no | Verify an unfinished generated plan still fails `check-complete.mjs`, or record N/A with reason | N/A: no template or checker behavior changed |
| Completed-plan representability | no | Verify the repaired expectation can be recorded in a completed plan without editing the template again, or record N/A | N/A: no template changed |
| Helper/checker tests | no | If scripts changed, run focused script tests; otherwise N/A | N/A: no scripts changed |
| Autoreview / review | yes | Run applicable review gate or record N/A for docs-only/source-rule-only repair | Focused final diff review found zero accepted findings or contradictory ownership wording |
| Final lint | yes | Run scoped formatter/lint or record ignored-path/N/A reason | `git diff --check` passed; Prettier passed for authored Markdown; `.mdc` has no inferred parser and generated skill remains Skiller-owned |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Reads/searches stayed limited to exact rule, generated skill, Plate vision, and repair plan |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-23-repair-plate-next-react-family-colocation.md` | PASS |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | complete | requirements captured and active goal checked | target selection |
| Target selection | complete | rule primary, Plate vision secondary, generated skill output | patch |
| Patch | complete | `.agents/rules/plate-next.mdc` and `docs/vision/plate.md` patched | verification |
| Verification | complete | generation, body-equality assertion, stale-wording audit, diff-check, and Prettier passed | closeout |
| Closeout | complete | plan evidence recorded; handoff ready | final response |

Findings:

- `docs/vision/plate.md` currently defines separate component/hook family files
  but does not distinguish family-only hooks from a durable hook-family owner.
- `.agents/rules/plate-next.mdc` permits an independent
  provider/store/lifecycle boundary but does not define independence.
- `FloatingMediaStore` demonstrated the failure: an app wrapper imported the
  store, but the store remained meaningful only as FloatingMedia state.

Decisions and tradeoffs:

- Public export/import proves API visibility, not source ownership.
- A separate React hook/store owner must remain meaningful and reusable beyond
  the component family; otherwise it stays in `<Family>.tsx`.

Repair patch notes:

- `.agents/rules/plate-next.mdc`: made the component family the default owner;
  family-only hooks/store/state/controller/lifecycle stay inline; separate
  React files require a standalone independently consumed job.
- `docs/vision/plate.md`: synchronized the durable Plate doctrine and made app
  wrapper imports explicit non-evidence for another source owner.

Deliberate non-repairs:

- Do not refactor `packages/media` in this repair; the user requested the
  guideline repair only.
- Do not duplicate the rule into `architecture-cleanup`; Plate Next and Plate
  vision already own this specific doctrine.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Literal source assertion missed a line-wrapped phrase; Prettier cannot infer `.mdc` and reported generated-skill style | 1 | Normalize whitespace in the assertion; format authored Markdown only; use exact generation equality and diff-check for Skiller surfaces | Corrected audit passed; no source defect |

Verification evidence:

- `pnpm install` -> passed twice; Skiller regenerated the Plate Next skill.
- Node source audit -> passed: rule and generated skill bodies are identical;
  all new ownership phrases exist; all stale loophole phrases are absent; Plate
  vision agrees.
- `git diff --check -- <repair files>` -> passed.
- `pnpm exec prettier --check docs/vision/plate.md
docs/plans/2026-07-23-repair-plate-next-react-family-colocation.md` -> passed.
- Focused diff review -> zero accepted findings.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
docs/plans/2026-07-23-repair-plate-next-react-family-colocation.md` -> passed.

Final repair handoff:

- Expectation: family-scoped hooks/stores remain in `<Family>.tsx`; exports,
  docs, and same-family app-wrapper imports do not establish another owner.
- Repaired owner: `.agents/rules/plate-next.mdc`, synchronized with
  `docs/vision/plate.md`.
- Files changed: source rule, Plate vision, generated Plate Next skill, repair
  plan.
- Verification: generation, exact body equality, stale-wording audit,
  diff-check, Markdown formatting, and focused review passed.
- Caveat: Media source was deliberately not refactored in this skill-only
  repair.

Timeline:

- 2026-07-23T15:09:46.907Z Goal repair plan created.
- 2026-07-23 Requirement extraction and owner selection completed before patch.
- 2026-07-23 Primary rule and Plate vision patched; verification started.
- 2026-07-23 Skiller regeneration and focused source audits passed.
- 2026-07-23 Final goal-plan checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Complete |
| Where am I going? | Final response |
| What is the goal? | Remove the Plate Next React family ownership loophole |
| What have I learned? | External import is being mistaken for independent ownership |
| What have I done? | Patched doctrine, regenerated the skill, and passed focused proof |

Open risks:

- None. The rule preserves separately consumed standalone hook/provider/store
  owners while rejecting family-scoped splitting.
