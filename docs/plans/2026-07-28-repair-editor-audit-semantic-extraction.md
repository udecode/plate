# repair editor audit semantic extraction

Objective:
Repair editor-audit semantic extraction; done when failure fixtures are
rejected, compliant hybrid adaptations pass, the generated mirror matches the
source, and agent-native review is clean.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-28-repair-editor-audit-semantic-extraction.md

Template:
docs/plans/templates/goal-repair.md

Primary template:
docs/plans/templates/goal-repair.md

Applied packs:

- none

Expectation:

- user expectation: Fully align `editor-audit` with exhaustive source-backed
  extraction: an overall local win must not hide stronger reference
  submechanisms, local debt, hybrid adaptations, or prior accepted candidates.
- observed miss: The latest strict Wordgard audit passed 101 structurally valid
  rows while 91 rows reused three canned dimension profiles; it silently
  downgraded earlier A3-A6 architecture candidates to `keep` and treated nearby
  owners as exact mappings without proving their complete contracts.
- owning skill/template/helper: `.agents/rules/editor-audit.mdc`,
  `.agents/rules/editor-audit/references/feature-matrix.md`, and
  `.agents/rules/editor-audit/scripts/validate-concept-matrix.mjs`.
- repair classification: derived-skill semantic workflow plus mechanically
  enforceable matrix-contract repair.

First checkpoint:

- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:

- requested duration: N/A: none requested.
- semantics: N/A: no timebox.
- initial confidence score: N/A: binary regression and review gates apply.
- improvement loop: one failing semantic fixture at a time -> minimum validator
  and rule repair -> source/mirror parity -> clean agent-native review.
- final score / loop closure: all named failure fixtures rejected, positive
  hybrid fixture accepted, focused tests green, mirror exact, zero accepted
  review findings.

Completion threshold:

- Full audits use a symmetric comparison inventory: reference concepts plus
  relevant local-only public machinery, lifecycle rules, and debt.
- Every row separates the preferred base architecture from reference
  submechanisms to adapt, local debt revealed, and the final local action.
- `exact` mappings require evidence for public contract, internal owner,
  representative consumers, lifecycle/failure behavior, and proof; otherwise
  the mapping is `partial`, `absent`, or `not-applicable`.
- Reused generic winner prose, unresolved mixed verdicts, missing local-debt or
  adaptation dispositions, and unreconciled prior P0-P3 candidates fail
  deterministic validation.
- Test-harvest results produce explicit `adapt`, `keep`, `reject`, or
  evidence-backed `defer` decisions for portable proof topology rather than
  freshness counts only.
- Every `keep` or local-winner row survives a source-backed pressure question:
  what the reference does better inside the concept and why that does or does
  not create material local work.
- Repair closure is legal only when the source owner is patched, generated
  skills are synced when `.agents/rules/**` changed, a source audit proves the
  repair text exists, the repaired template or rule is smoke-checked, deliberate
  non-repairs are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-28-repair-editor-audit-semantic-extraction.md` passes.

Verification surface:

- RED/GREEN Node tests for each new matrix invariant through
  `validate-concept-matrix.test.mjs`.
- Existing Wordgard canned-profile matrix fails the strengthened validator for
  the expected semantic reason.
- A compliant hybrid/local-win fixture passes.
- `pnpm install` regenerates `.agents/skills/editor-audit/SKILL.md`; generated
  body equals `.agents/rules/editor-audit.mdc`.
- Scoped syntax, ESLint/format, source-audit, agent-native review, and final
  goal checker pass.

Constraints:

- Repair one expectation narrowly.
- Patch source-of-truth files, not generated skill mirrors.
- Do not weaken evidence safety or completion gates just to reduce annoyance.
- Do not broaden the repair to unrelated skills/templates.

Boundaries:

- Source of truth: the user's repair request, the diagnosed Wordgard audit
  failure, current editor-audit source rule/reference/validator, and existing
  validator tests.
- Allowed edit scope: `.agents/rules/editor-audit.mdc`,
  `.agents/rules/editor-audit/references/feature-matrix.md`,
  `.agents/rules/editor-audit/scripts/validate-concept-matrix.mjs`,
  `.agents/rules/editor-audit/scripts/validate-concept-matrix.test.mjs`, the
  install-generated `.agents/skills/editor-audit/SKILL.md`, and this plan.
- Derived skill scope: editor architecture comparison and sync only; lifecycle
  mechanics stay in `autogoal`.
- Non-goals: rewrite historical audit artifacts, change product code, rerun the
  full Wordgard audit, create another skill, change unrelated templates, or
  commit/push/open a PR.

Output budget strategy:

- Read only the four source-owner files, focused historical failure snippets,
  and bounded generated diffs. Use counts and exact ranges instead of streaming
  audit ledgers or product trees.

Blocked condition:

- Stop only if Skiller cannot regenerate the mirror, the validator cannot
  distinguish a compliant hybrid row from the known canned-profile failure
  without rejecting valid existing contracts, or current source contradicts
  the named ownership boundary after three distinct repair attempts.

Repair state:

- repair_type: derived-skill semantic contract and validator repair
- current_phase: complete
- current_phase_status: complete
- next_phase: none
- goal_status: ready-to-complete

Current verdict:

- verdict: repair the editor-audit source bundle; prose-only guards already
  failed, so deterministic rows must enforce the checkable subset.
- confidence: high; semantic fixtures, generated parity, and review are green.
- next owner: none until a new audit or explicit historical backfill.
- reason: the current validator proves row presence and label coherence but
  accepts canned semantic profiles and one verdict that hides hybrid wins.

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final repair evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-28-repair-editor-audit-semantic-extraction.md` passes.
- Do not create hook state for this repair. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Full alignment request and every diagnosed failure copied into expectation, threshold, verification, boundaries, and checklist before edits |
| Timed checkpoint parsed | no | N/A: none requested |
| Expectation restated | yes | Overall winners cannot hide submechanism adaptations, local debt, prior candidates, or proof-topology wins |
| Active goal checked | yes | `get_goal` returned null; matching goal created with this plan |
| Named plan or skill read | yes | `editor-audit`, `autogoal`, `skill-creator`, `tdd`, and `agent-native-reviewer` read completely |
| Owning source selected | yes | Editor-audit rule/reference/validator/test bundle; generated skill is install output |
| Repair classification selected | yes | Derived-skill semantic workflow plus mechanically checkable matrix-contract repair |
| Safety conflict checked | yes | No product/public/external mutation; repair strengthens evidence gates |
| Output budget strategy recorded | yes | Bounded owner reads, focused tests, counted source audits |

Work Checklist:

- [x] N/A: no duration requested.
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Expectation and observed miss are stated with source evidence.
- [x] Primary owner selected: runtime plan, template, skill rule, or
      helper/checker.
- [x] Secondary owners justified: feature-matrix reference and validator/tests
      enforce the source skill; generated mirror changes only through install.
- [x] Patch touches source-of-truth files only; generated mirror changes only
      through `pnpm install`.
- [x] Derived skill vs generic `autogoal` ownership decision is recorded:
      editor-audit owns comparison semantics; autogoal remains unchanged.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Deliberate non-repairs are recorded.
- [x] Final response shape is recorded: repaired invariants, RED/GREEN proof,
      generated parity, review verdict, and deliberate non-repairs.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source owner patched | yes | Patch the selected source owner or record runtime-plan-only repair | rule, reference contract, validator, and tests patched |
| Generated skill sync | yes | If `.agents/rules/**` changed, run `pnpm install` and verify generated `SKILL.md` sync | `pnpm install` passed; source/generated bodies equal |
| Template smoke | no | N/A: no plan template changes; inspect repaired skill/reference directly | N/A: no template changed; hybrid and local-only contract fixtures passed |
| Incomplete-plan guard | no | N/A: no autogoal/template/checker behavior changes | N/A: no goal machinery changed |
| Completed-plan representability | no | N/A: no goal-plan schema change | N/A: no goal-plan schema changed |
| Helper/checker tests | yes | Run focused validator tests including new RED/GREEN fixtures | 17/17 Node tests passed |
| Autoreview / review | yes | Run agent-native review against route/source/mirror/proof map | zero accepted findings; capability map recorded below |
| Final lint | yes | Run scoped syntax, ESLint, Prettier, and diff checks | syntax, ESLint, Prettier, and diff checks passed |
| Output budget discipline | yes | Verify bounded reads and focused output | owner files only; historical matrix checked through validator exit |
| Timed checkpoint | no | N/A: no duration requested | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-28-repair-editor-audit-semantic-extraction.md` | final closeout-state rerun passes |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | complete | requirements, skills, goal, and repair plan closed | target selection |
| Target selection | complete | source bundle and failure modes selected | patch |
| Patch | complete | symmetric contract, semantic validator, 17 fixtures, generated mirror | verification |
| Verification | complete | tests, legacy rejection, lint, formatting, parity, review | closeout |
| Closeout | complete | plan evidence recorded and checker state repaired | final response |

Findings:

- The current skill already asks auditors to split mixed concepts and pressure
  suspicious local shapes, but the validator cannot enforce those semantics.
- The failed Wordgard audit encoded only 13 dimension signatures for 101 rows;
  91 rows shared three generic profiles and only four rows became material.
- Earlier multi-editor A3-A6 candidates were not reconciled before the strict
  Wordgard report recommended proof-only work.

Decisions and tradeoffs:

- Keep one matrix per reference, but make the comparison inventory symmetric by
  adding local-only concepts relevant to the target.
- Preserve qualitative scoring; add explicit decomposition/disposition fields
  instead of aggregate numbers.
- Mechanically reject observable failure patterns; retain a mandatory pressure
  review for semantic judgments no script can prove.

Repair patch notes:

- Changed the audit inventory from reference-only to the symmetric union of
  reference and relevant local concepts with explicit origins.
- Split one overloaded winner decision into preferred base, reference
  adaptation, local debt, proof adaptation, prior candidates, verdict, and
  priority.
- Defined `exact` as a complete contract trace across public API, semantic
  owner, consumers, lifecycle/failure behavior, and proof; defined checkable
  `partial` facets.
- Made portable test-harvest findings architecture decisions instead of cursor
  counts.
- Replaced structural-only validation with evidence, mapping-contract,
  disposition, material-coherence, canned-profile, and prior-candidate gates.
- Regenerated `.agents/skills/editor-audit/SKILL.md` from the source rule.

Deliberate non-repairs:

- Did not rewrite the historical Wordgard matrix or rerun the full audit; the
  old artifact is correctly `legacy-incomplete` under the repaired contract.
- Did not change product code, public APIs, test infrastructure, or real-device
  proof. This task repairs audit semantics only.
- Did not edit the generated skill directly.
- Did not remove repo-supported `argument-hint` or `disable-model-invocation`
  because the generic skill-creator validator does not recognize them; Skiller
  is the repo authority and regenerated both successfully.
- Deterministic checks reject observable shortcuts but cannot prove
  architectural truth; exact source review remains mandatory.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Partial schema patch left old column references in the validator | 1 | Replace the validator coherently, then restore one vertical fixture at a time | resolved; hybrid fixture passed |
| Preferred-base assertion exposed an unclear winner label | 1 | Normalize `Plate stronger` to `Plate` in mapping diagnostics | resolved; 17/17 tests passed |
| Prettier could not infer `.mdc` and disagreed with Skiller quote style | 1 | Use Markdown parser with repo single-quote option | resolved; final format check passed |
| Generic skill quick validator rejected repo-native frontmatter keys | 1 | Keep Skiller-supported fields and record the validator boundary | deliberate non-repair |
| First goal checker found only `Closeout=in_progress` | 1 | Mark the verified closeout state complete and rerun | resolved by final checker |

Verification evidence:

- TDD RED/GREEN: canned qualitative profile, incomplete exact mapping, and
  compliant local-base/reference-adaptation fixtures each failed before their
  owning repair and passed after it.
- `node --test
.agents/rules/editor-audit/scripts/validate-concept-matrix.test.mjs`: 17/17
  passed.
- Legacy Wordgard matrix: rejected because its manifest lacks symmetric origins
  and the current contract; the regression fixture separately proves canned
  profiles fail.
- `pnpm install`: passed and regenerated the Codex skill.
- Source/generated body comparison: exact match.
- `node --check` on validator and tests: passed.
- Scoped ESLint, Prettier, and `git diff --check`: passed.
- Agent-native capability map:
  - user `editor-audit full` -> generated entrypoint -> source `audit` mode ->
    symmetric manifest/reference contract -> validator -> 17 fixtures;
  - user `editor-audit sync` -> source `sync` mode -> local concept, proof, and
    prior-candidate reconciliation -> full matrix validation;
  - source rule -> `pnpm install` -> generated mirror with exact body parity.
- Agent-native finding ledger: zero accepted actionable findings after
  reviewing route reachability, source ownership, validator/docs agreement,
  failure coverage, and generated parity.
- Final autogoal checker: passes after closing the verified closeout phase.

Final repair handoff:

- Expectation: local winners still expose reference submechanism wins, local
  debt, hybrid adaptations, and prior-candidate reconciliation.
- Repaired owner: editor-audit source rule/reference/validator.
- Files changed: source rule, feature-matrix reference, validator, validator
  tests, generated mirror, and this goal plan.
- Verification: 17 focused tests, Wordgard legacy rejection, compliant hybrid
  positive, install parity, syntax/lint/format/diff checks, and clean
  agent-native review.
- Caveat: deterministic validation cannot prove architectural truth; the
  pressure pass and exact source evidence remain mandatory.

Timeline:

- 2026-07-28T16:39:07.844Z Goal repair plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Complete |
| Where am I going? | Handoff |
| What is the goal? | Repair editor-audit semantic extraction and enforce the checkable failures |
| What have I learned? | Exhaustive row count did not produce exhaustive judgments |
| What have I done? | Repaired source contract and validator, regenerated mirror, and closed review gates |

Open risks:

- The duplicate-profile gate catches exact normalized reuse, not every possible
  paraphrased canned judgment; mandatory source citations and the pressure
  review cover the non-mechanical remainder.
