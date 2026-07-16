# simplify plate plite plan skills

Objective:
Simplify Plate Plan and Plite Plan into consistent, proportional workflows;
done when source rules, templates, generated mirrors, smoke checks, and
agent-native review pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-16-simplify-plate-plite-plan-skills.md

Template:
docs/plans/templates/goal-repair.md

Primary template:
docs/plans/templates/goal-repair.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Expectation:
- user expectation: make `plate-plan` consistent with `plite-plan`, review both,
  and hard-cut overengineered planning ceremony.
- observed miss: both skills advertise undefined modes, require twelve-pass
  activation loops, numeric score theater, duplicated ledgers, mandatory lens
  matrices, and circular final-handoff gates; the Plite template additionally
  drifts from its owning skill into mandatory issue-ledger machinery.
- owning skill/template/helper: `.agents/rules/plate-plan.mdc`,
  `.agents/rules/plite-plan.mdc`, and their project templates; generated
  `.agents/skills/**/SKILL.md` mirrors sync through `pnpm install`.
- repair classification: derived-skill workflow and template hard cut.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A; none requested.
- semantics: N/A.
- initial confidence score: N/A; completion is binary.
- improvement loop: N/A.
- final score / loop closure: N/A.

Completion threshold:
- Both skills define working `quick`, `standard`, and `deep` modes; standard is
  one continuous three-phase plan-hardening run; readiness is binary; one
  decision ledger replaces overlapping ledgers; research/provenance/browser/
  docs/risk work is conditional; execution still requires explicit acceptance.
- Repair closure is legal only when the source owner is patched, generated
  skills are synced when `.agents/rules/**` changed, a source audit proves the
  repair text exists, the repaired template or rule is smoke-checked, deliberate
  non-repairs are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-16-simplify-plate-plite-plan-skills.md` passes.

Verification surface:
- Source audit of both rules/templates and generated mirrors; line/count and
  removed-ceremony searches; `pnpm install`; generated mirror comparison;
  unfinished and completed smoke plans through `check-complete.mjs`; scoped
  formatting/validation; agent-native capability review.

Constraints:
- Repair the single shared planning-workflow expectation across its two named
  sibling owners.
- Patch source-of-truth files, not generated skill mirrors.
- Do not weaken evidence safety or completion gates just to reduce annoyance.
- Do not broaden the repair to unrelated skills/templates.

Boundaries:
- Source of truth: latest user acceptance, both named skills, root `VISION.md`,
  `docs/vision/common.md`, `docs/vision/plate.md`, `docs/vision/plite.md`, and
  `.agents/AGENTS.md` source/mirror policy.
- Allowed edit scope: the two `.agents/rules/*-plan.mdc` sources, the two
  `docs/plans/templates/*-plan.md` templates, generated skill mirrors from
  `pnpm install`, this repair plan, and disposable smoke plans.
- Derived skill scope: workflow selection, Plate/Plite ownership, planning
  readiness, accepted-plan execution boundary, conditional proof.
- Non-goals: implementation/package behavior, `autogoal` kernel changes,
  historical active plan rewrites, new wrapper skills, compatibility modes.

Output budget strategy:
- Read only the two rules, two templates, governing vision/routing files, and
  focused validators; use counts/diffs with capped output; exclude package
  source, build output, dependencies, and unrelated plans.

Blocked condition:
- Block only if the source-to-generated sync cannot reproduce the rules or the
  compact templates cannot satisfy the existing autogoal checker without
  weakening evidence safety.

Repair state:
- repair_type: derived skill/template simplification
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: hard-cut the duplicated planning bureaucracy; preserve the
  Plate/Plite owner distinction and evidence/acceptance boundary.
- confidence: binary readiness complete; all named proof gates pass.
- next owner: future callers use quick, standard, or deep mode as scoped.
- reason: current workflow creates documentation volume without proportional
  decision quality and the sibling templates already disagree materially.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final repair evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-16-simplify-plate-plite-plan-skills.md` passes.
- Do not create hook state for this repair. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Scope: both named skills/templates; deliverable: consistent hard-cut rewrite; stop: proof and review green; no package implementation |
| Timed checkpoint parsed | no | No duration requested; binary closure |
| Expectation restated | yes | Expectation section records consistency, proportionality, and hard cuts |
| Active goal checked | yes | No prior goal; matching repair goal created |
| Named plan or skill read | yes | Both named skills, both source rules, and both templates read |
| Owning source selected | yes | `.agents/rules/*-plan.mdc` plus project templates; mirrors generated only |
| Repair classification selected | yes | Derived skill/template workflow repair |
| Safety conflict checked | yes | Evidence and explicit acceptance stay mandatory; only duplicated ceremony is cut |
| Output budget strategy recorded | yes | Focused owner reads/counts/diffs only |
| Agent-native pack selected | yes | `.agents/**` action and generated mirrors change |
| Agent-facing action surface identified | yes | `$plate-plan` and `$plite-plan` mode selection, planning, execution, proof |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; `pnpm install` owns `.agents/skills/**` sync |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded before edits; final parity review required |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Expectation and observed miss are stated with source evidence.
- [x] Primary owner selected: runtime plan, template, skill rule, or
      helper/checker.
- [x] Secondary owners are justified: both sibling rules and templates share
      the contract; generated mirrors sync mechanically.
- [x] Patch touches source-of-truth files only; mirrors were generated.
- [x] Derived skill vs generic `autogoal` ownership decision is recorded.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Deliberate non-repairs are recorded.
- [x] Final response shape is recorded below.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source owner patched | yes | Patch the selected source owner or record runtime-plan-only repair | Both `.agents/rules/*-plan.mdc` sources and both project templates rewritten |
| Generated skill sync | yes | If `.agents/rules/**` changed, run `pnpm install` and verify generated `SKILL.md` sync | `pnpm install` Skiller apply passed; mirrors exact after injected metadata |
| Template smoke | yes | Instantiate the repaired template or inspect it directly when a smoke plan would create noise | Both templates instantiated through the helper |
| Incomplete-plan guard | yes | Verify an unfinished generated plan still fails `check-complete.mjs`, or record N/A with reason | Both fresh plans failed with open requirements, gates, and phases |
| Completed-plan representability | yes | Verify the repaired expectation can be recorded in a completed plan without editing the template again, or record N/A | Both resolved fixtures passed `check-complete.mjs` |
| Helper/checker tests | no | If scripts changed, run focused script tests; otherwise N/A | N/A: no scripts changed; existing checker exercised by four smoke runs |
| Autoreview / review | yes | Run applicable review gate or record N/A for docs-only/source-rule-only repair | Agent-native review passed; implementation autoreview N/A |
| Final lint | no | Run scoped formatter/lint or record ignored-path/N/A reason | N/A: Biome explicitly ignores Markdown and MDC; structural validator passed |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Reads and diffs were owner-scoped and capped; no broad repo dump |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-16-simplify-plate-plite-plan-skills.md` | `[autogoal] complete` after final evidence and closeout rows |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | Skiller apply and source/mirror audits passed for both skills |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Generated skills expose all three modes, binary readiness, accepted execution, and handoff |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Capability map below is PASS with zero open findings |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | completed | Requirements and goal captured | target selection |
| Target selection | completed | Two source rules and two templates selected | patch |
| Patch | completed | Compact shared workflow implemented | verification |
| Verification | completed | Sync, structure, and smoke checks passed | closeout |
| Closeout | completed | Agent-native review and handoff prepared | final response |

Findings:
- Plate source rule shrank from 502 to 193 lines; Plite from 402 to 206.
- Both templates are 159 lines and share the same lifecycle/ledger/proof shape.
- Removed numeric scorecards/caps, per-activation pass loops, twelve-pass and
  pressure-pass duplication, mandatory implementation-lens matrices, circular
  emitted-handoff gates, and unconditional Plite issue/research machinery.
- Preserved distinct Plate product and Plite substrate ownership, explicit
  accepted-plan execution, live-source evidence, adoption, focused proof, and
  high-risk scenarios when triggered.

Decisions and tradeoffs:
- Three modes replace implicit argument theater: quick is answer-only, standard
  is the default durable plan, deep adds only risk-justified evidence.
- Binary readiness replaces weighted confidence because missing evidence is a
  gate, not a decimal.
- One concept-level decision ledger replaces conflict/boundary/minimal-break/
  objection/bridge/rejected-alternative duplication.

Repair patch notes:
- Replaced both `.agents/rules/*-plan.mdc` source rules.
- Replaced both `docs/plans/templates/*-plan.md` project templates.

Deliberate non-repairs:
- Kept two skills: merging them would erase the product/substrate ownership
  boundary.
- Kept `autogoal` and `check-complete` for standard/deep plans; evidence safety
  is not the source of the bloat.
- Did not rewrite historical instantiated plans; they remain historical run
  evidence and new plans use the compact templates.

Review fixes:
- Accepted: undefined mode arguments -> all three modes have explicit behavior
  and promotion rules.
- Accepted: source/template sibling drift -> matching lifecycle headings,
  phases, ledger, readiness, and checker contract.
- Accepted: source/generated ownership risk -> source rules edited and mirrors
  regenerated through `pnpm install`.
- Rejected: generic global validator frontmatter complaint -> repo-native
  Skiller intentionally owns two additional metadata fields and regenerated
  them successfully.

Agent-native review:
| User action | Agent route | Source owner | Mirror / template | Proof | Status |
| --- | --- | --- | --- | --- | --- |
| Quick architecture call | `$plate-plan --quick` / `$plite-plan --quick` | matching `.agents/rules/*-plan.mdc` | generated `SKILL.md` | mode source audit | pass |
| Durable architecture plan | default / `--standard` | matching source rule | compact project template | incomplete/completed checker smoke | pass |
| Risk-targeted deep plan | `--deep` | matching source rule | same template, conditional evidence | mode and conditional-work audit | pass |
| Execute accepted plan | explicit invocation against accepted path | accepted plan plus source rule | new execution goal | acceptance-boundary audit | pass |
| Maintain skill workflow | edit `.agents/rules/**`, then `pnpm install` | source `.mdc` | generated mirror | exact normalized mirror comparison | pass |

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Scoped Biome check processed zero Markdown/MDC files | 1 | treat formatting as ignored-path N/A and use structural/source validation | Biome named all five paths as ignored; no code formatter owns them |
| Generic `skill-creator` validator rejected repo-specific `argument-hint` and `disable-model-invocation` metadata | 2 | keep repo-native Skiller schema and validate through `pnpm install` plus mirror parity | Both Skiller-generated mirrors match their source rules exactly after injected metadata |

Verification evidence:
- `pnpm install` -> Skiller apply completed successfully; both mirrors regenerated.
- Mirror audit -> each generated `SKILL.md` equals its `.mdc` source after the
  four generated metadata lines.
- Structural validator -> Plate rule 193 lines, Plite rule 206, templates 159
  each; three modes, three phases, one decision ledger, binary readiness,
  accepted execution boundary, and matching lifecycle headings; removed
  ceremony patterns absent.
- Unfinished smoke plans -> both rejected by `check-complete.mjs` with expected
  open requirements/gates/phases.
- Resolved smoke plans -> both accepted by `check-complete.mjs`.
- Final repair plan -> `[autogoal] complete`.

Final repair handoff:
- Expectation: consistent Plate/Plite architecture workflows without planning
  bureaucracy.
- Repaired owner: both source rules and their project templates.
- Files changed: two `.agents/rules/*-plan.mdc`, two generated skill mirrors,
  two `docs/plans/templates/*-plan.md`, and this repair plan.
- Verification: Skiller sync, normalized mirror parity, structural audit,
  unfinished/completed checker smoke, and agent-native capability review pass.
- Caveat: generic global skill validation is incompatible with repo-native
  frontmatter; repo-native Skiller proof is authoritative.

Timeline:
- 2026-07-16T11:12:48.577Z Goal repair plan created.
- 2026-07-16 Source rules and templates hard-cut to the shared compact shape.
- 2026-07-16 `pnpm install` regenerated both skill mirrors; structural and
  incomplete/completed template smoke proofs passed.
- 2026-07-16 Agent-native review passed with zero open findings; final repair
  plan checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final mechanical checker, goal completion, user handoff |
| What is the goal? | Simplify and align both planning skills without weakening evidence or acceptance |
| What have I learned? | One ledger and binary gates retain truth while deleting most planning volume |
| What have I done? | Rewritten sources/templates, synced mirrors, and passed structural, smoke, and parity review |

Open risks:
- None for the workflow repair. Historical instantiated plans remain verbose by
  design; only newly instantiated plans use the compact templates.
