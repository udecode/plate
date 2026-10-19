# Core-owned Markdown codec doctrine

Objective:
Repair `best-api` so universal first-party format type contracts may live in
Core while optional compiler/runtime code remains format-owned.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-29-core-owned-markdown-codec-doctrine.md

Template:
docs/plans/templates/goal-repair.md

Primary template:
docs/plans/templates/goal-repair.md

Applied packs:
- none

Expectation:
- user expectation: repair the skill after correcting the Markdown ownership
  recommendation.
- observed miss: `best-api` canonizes format-owned AST contracts plus registry
  augmentation, which led to 21 cryptic `import type {}` activation imports.
- owning skill/template/helper: `.agents/rules/best-api.mdc`, with the smallest
  matching doctrine correction in `docs/vision/plate.md`.
- repair classification: reusable API ownership correction.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested.
- semantics: N/A.
- initial confidence score: N/A: binary source and forward-test gates apply.
- improvement loop: N/A.
- final score / loop closure: N/A.

Completion threshold:
- `best-api` explicitly prefers Core-owned, type-only contracts and registry
  entries for universal first-party formats, rejects consumer marker imports,
  and preserves optional format runtime/compiler ownership.
- Plate Vision states the same durable ownership rule without centralizing
  feature-owned conversion declarations.
- Generated `.agents/skills/best-api/SKILL.md` matches the source rule after
  `pnpm install`.
- A source audit and forward-test of the Markdown case pass.
- Repair closure is legal only when the source owner is patched, generated
  skills are synced when `.agents/rules/**` changed, a source audit proves the
  repair text exists, the repaired template or rule is smoke-checked, deliberate
  non-repairs are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-29-core-owned-markdown-codec-doctrine.md` passes.

Verification surface:
- Focused `rg` over `.agents/rules/best-api.mdc`,
  `.agents/skills/best-api/SKILL.md`, `docs/vision/plate.md`, and related
  repo-local rules.
- `pnpm install` generated-skill synchronization.
- Direct forward-test: apply the repaired decision rule to the current Core /
  `markdown-codec` ownership and confirm it rejects the 21 marker imports.
- `agent-native-reviewer` review because agent instructions changed.
- Final `check-complete.mjs` for this plan.

Constraints:
- Repair one expectation narrowly.
- Patch source-of-truth files, not generated skill mirrors.
- Do not weaken evidence safety or completion gates just to reduce annoyance.
- Do not broaden the repair to unrelated skills/templates.

Boundaries:
- Source of truth: latest user request plus the immediately preceding accepted
  Core-owned Markdown contract correction.
- Allowed edit scope: `.agents/rules/best-api.mdc`, the smallest relevant
  `VISION.md` / `docs/vision/**` owner, generated skill sync output, and this
  repair plan.
- Derived skill scope: `best-api`; generic `autogoal` remains unchanged.
- Non-goals: no product/API implementation, no package moves, no removal of
  `@platejs/markdown-codec`, no unrelated skill rewrite, no runtime compiler in
  Core.

Output budget strategy:
- Use exact-symbol `rg` limited to `.agents/rules`, `docs/vision`, `VISION.md`,
  and the two codec package owners; cap reads to relevant ranges and command
  output.

Blocked condition:
- Stop only if generated-skill sync or required reviewer tooling cannot run and
  no local validation path remains.

Repair state:
- repair_type: derived skill doctrine repair
- current_phase: intake
- current_phase_status: in_progress
- next_phase: target selection
- goal_status: active

Current verdict:
- verdict: pass
- confidence: high
- next owner: Plate package implementation only when explicitly requested
- reason: the rule and Vision distinguish universal type ownership from
  optional runtime ownership and reject activation imports.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final repair evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-29-core-owned-markdown-codec-doctrine.md` passes.
- Do not create hook state for this repair. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Expectation, boundaries, completion threshold, verification, and final handoff are recorded above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Expectation restated | yes | Expectation section |
| Active goal checked | yes | `get_goal` returned no goal; repair goal created for this plan |
| Named plan or skill read | yes | Complete `best-api` and `autogoal` generated skill reads |
| Owning source selected | yes | `.agents/rules/best-api.mdc` plus `docs/vision/plate.md` |
| Repair classification selected | yes | Derived skill doctrine repair |
| Safety conflict checked | yes | No safety conflict; docs/rule-only changes |
| Output budget strategy recorded | yes | Exact-symbol, bounded reads above |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Expectation and observed miss are stated with source evidence.
- [x] Primary owner selected: runtime plan, template, skill rule, or
      helper/checker.
- [x] Secondary owners are justified: Plate Vision currently repeats the same
      format-contract ownership rule.
- [x] Patch touches source-of-truth files only; generated
      `.agents/skills/best-api/SKILL.md` changed only through `pnpm install`.
- [x] Derived skill vs generic `autogoal` ownership decision is recorded.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Deliberate non-repairs are recorded.
- [x] Final response shape is recorded: expectation, repaired owner, files,
      verification, deliberate non-repairs/caveat.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source owner patched | yes | Patch the selected source owner or record runtime-plan-only repair | `.agents/rules/best-api.mdc` and `docs/vision/plate.md` contain the corrected universal-type / optional-runtime ownership rule |
| Generated skill sync | yes | If `.agents/rules/**` changed, run `pnpm install` and verify generated `SKILL.md` sync | `pnpm install` passed; focused `diff` proved the repaired rule and generated skill sections identical |
| Template smoke | no | Instantiate the repaired template or inspect it directly when a smoke plan would create noise | N/A: no reusable plan template changed; direct generated-skill inspection is the relevant smoke |
| Incomplete-plan guard | yes | Verify an unfinished generated plan still fails `check-complete.mjs`, or record N/A with reason | `check-complete.mjs` rejected this unfinished plan with unchecked/gate/phase/evidence findings |
| Completed-plan representability | yes | Verify the repaired expectation can be recorded in a completed plan without editing the template again, or record N/A | This instantiated repair plan records the expectation, owners, source proof, mirror proof, forward-test, deliberate non-repairs, and review evidence without template changes |
| Helper/checker tests | no | If scripts changed, run focused script tests; otherwise N/A | N/A: no helper or checker script changed |
| Autoreview / review | yes | Run applicable review gate or record N/A for docs-only/source-rule-only repair | `agent-native-reviewer` loaded; capability map passes with no P0-P3 finding; bounded real-source forward-test passes |
| Final lint | yes | Run scoped formatter/lint or record ignored-path/N/A reason | `git diff --check -- <four repair files>` passed; no code/package lint owner changed |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Reads and searches used exact files/patterns and capped output; Oracle dry run reported the bounded nine-file payload before execution |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-29-core-owned-markdown-codec-doctrine.md` | passed after every other checklist, gate, phase, handoff, evidence, reboot, and risk row was closed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | complete | requirements and evidence gates materialized | target selection |
| Target selection | complete | primary rule owner and smallest Vision owner identified | patch |
| Patch | complete | source doctrine patched and generated skill synced | verification |
| Verification | complete | source/mirror/diff/guard checks and bounded real-source forward-test pass; agent-native review has no finding | closeout |
| Closeout | complete | final plan audit prepared for mechanical checker | final response |

Findings:
- `@platejs/markdown-codec` depends on Core and augments
  `PluginProductNodeCodecRegistry`; 21 feature files activate that augmentation
  with `import type {}`.
- Core can own Markdown AST-facing types through type-only dependencies without
  pulling the optional Markdown compiler/runtime into bundles.
- `packages/markdown-codec/src` exports no runtime declaration; its only export
  is `export * from './types'`.
- The repaired rule remains compatible with root Vision: compilers and
  feature-owned codec declarations stay outside Core.
- Neutral Oracle pressure-test prompt was submitted with nine bounded source
  files and no requested verdict, but the advisory did not return within 15
  minutes. It is not required evidence for this docs/rule repair.

Decisions and tradeoffs:
- Universal first-party format contract in Core; optional compiler/runtime
  outside Core -> removes activation magic while preserving runtime modularity.
- Feature plugins still own their conversion declarations -> avoids a central
  format registry.

Repair patch notes:
- Replaced unconditional format-package AST-contract ownership with a gated
  universal first-party type-contract rule in `.agents/rules/best-api.mdc`.
- Mirrored the durable ownership correction in `docs/vision/plate.md`.
- Ran `pnpm install`; Skiller regenerated
  `.agents/skills/best-api/SKILL.md`.

Deliberate non-repairs:
- Did not implement the package migration, move types, delete
  `@platejs/markdown-codec`, or remove its 21 marker imports; the user requested
  the skill repair only.
- Did not move the optional Markdown compiler/runtime into Core.
- Did not change generic `autogoal`, `editor-audit`, `docs-creator`, or
  `plate-plugin-creator`; focused searches found no contradictory
  format-contract ownership rule in those workers.
- Did not wait beyond 15 minutes for the optional Oracle advisory; the required
  local agent-native review and current-source forward-test already close the
  proof contract.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `oracle` binary unavailable | 1 | Use the documented `npx -y @steipete/oracle` fallback | Dry run passed; optional API review did not return within 15 minutes and was detached |

Verification evidence:
- `pnpm install` -> passed; Skiller applied rules for Codex.
- Focused source/generated `diff` -> no difference for the repaired rule.
- Focused stale-rule `rg` -> no old unconditional format-AST ownership wording
  remains in the inspected rule/skill/Vision owners.
- `git diff --check -- <repair files>` -> passed.
- `check-complete.mjs` before closeout -> failed as expected, proving the
  unfinished-plan guard.
- `check-complete.mjs` after closeout -> passed.
- Real API source audit -> Markdown is first-party, 21 feature files need the
  marker import, `markdown-codec` is type-only, and the compiler remains in
  `@platejs/markdown`; the repaired rule selects Core-owned type contracts and
  rejects the activation imports.

Forward-test decision:

| Repaired-rule gate | Current-source evidence | Result |
|---|---|---|
| Universal first-party authoring contract | `text/markdown` codecs appear across 21 first-party feature files | qualifies for Core |
| Type-only Core cost | `packages/markdown-codec/src` exports types only and imports MDAST shapes with `import type` | no runtime bundle cost |
| Optional runtime remains outside Core | Compiler/runtime dependencies live in `@platejs/markdown` | preserve optional runtime package |
| No activation magic | Every feature file currently needs `import type {}` to load the augmentation | reject current contract package |
| Feature declaration ownership | Codec maps remain beside installed feature plugins | preserve feature-owned maps |

- Forward-test verdict: Core owns Markdown authoring types and the built-in MIME
  registry entry; `@platejs/markdown` owns runtime/compiler behavior; the
  contract-only package and marker imports are implementation debt.

Agent-native review:

| User action | Agent route | Source owner | Mirror / doctrine | Proof | Status |
|---|---|---|---|---|---|
| Correct reusable API ownership judgment | `best-api repair` | `.agents/rules/best-api.mdc` | `.agents/skills/best-api/SKILL.md` and `docs/vision/plate.md` | `pnpm install`, focused mirror diff, stale-rule audit | pass |
| Apply the corrected rule to a real API | `best-api review` | current Core and Markdown codec sources | active repair plan | bounded gate-by-gate current-source forward-test | pass |

- Verdict: PASS. No P0-P3 agent-route, source-owner, mirror, discoverability,
  or proof finding.

Final repair handoff:
- Expectation: `best-api` treats built-in universal Markdown typing as a Core
  type contract, without pulling the optional compiler/runtime into Core.
- Repaired owner: `.agents/rules/best-api.mdc`, reinforced by
  `docs/vision/plate.md`.
- Files changed: source rule, generated skill, Plate Vision, and this repair
  plan.
- Verification: `pnpm install`, exact source/generated section diff, stale-rule
  audit, `git diff --check`, incomplete-plan guard, current-source forward-test,
  and agent-native review.
- Caveat: product/package implementation is deliberately outside this repair.

Timeline:
- 2026-07-29T23:14:02.530Z Goal repair plan created.
- 2026-07-30T01:15+02:00 Source rule and Plate Vision patched.
- 2026-07-30T01:16+02:00 `pnpm install` regenerated the Codex skill.
- 2026-07-30T01:18+02:00 Local source, mirror, stale-rule, diff, and incomplete
  plan checks passed; independent forward-test started.
- 2026-07-30T01:33+02:00 Optional Oracle monitor detached after 15 minutes
  without a result; bounded current-source forward-test and agent-native review
  closed locally.
- 2026-07-30T01:34:58+02:00 Final autogoal mechanical check passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final plan checker and response |
| What is the goal? | Repair best-api universal format type ownership doctrine |
| What have I learned? | The separate contract package creates a cycle and 21 marker imports despite zero runtime need |
| What have I done? | Patched source doctrine and Vision, regenerated the skill, and passed source/mirror/guard/forward-test/review checks |

Open risks:
- None for the skill repair. The package migration remains intentionally
  unimplemented until explicitly requested.
