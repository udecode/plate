# plate-next owner-first colocation doctrine

Objective:
Repair Plate Next owner-first colocation doctrine; done when source rule and
generated skill match and validation passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-22-plate-next-owner-first-colocation-doctrine.md

Template:
docs/plans/templates/goal-repair.md

Primary template:
docs/plans/templates/goal-repair.md

Applied packs:

- none

Expectation:

- user expectation: Plate Next must not preserve files, filenames, helper
  exports, or splits merely because they exist; single-consumer plugin behavior
  should colocate inline with its plugin owner, with no line-count ceiling.
- observed miss: the completed three-package cleanup followed that architecture,
  but `.agents/rules/plate-next.mdc` still requires original helper ownership,
  rename/file preservation, and a size/readability extraction threshold.
- owning skill/template/helper: `.agents/rules/plate-next.mdc`, synced to
  `.agents/skills/plate-next/SKILL.md` by `pnpm install`.
- repair classification: derived-skill rule repair

First checkpoint:

- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:

- requested duration: N/A: none requested
- semantics: N/A
- initial confidence score: N/A: binary source/sync validation
- improvement loop: remove every directly contradictory ownership/rename/size rule in the Plate Next source
- final score / loop closure: source rule and generated skill contain the new doctrine and no contradictory preservation rule remains

Completion threshold:

- `.agents/rules/plate-next.mdc` states: no line-count ceiling; split by durable
  ownership/reuse; inline single-consumer plugin callbacks/helpers/constants and
  one-use inference ferry types; delete obsolete files/exports without aliases.
- Contradictory default rules for original helper/file/name preservation,
  pre-renaming deferral, size/read thresholds, and automatic `origin/main` path
  recovery are removed or rewritten.
- `pnpm install` regenerates `.agents/skills/plate-next/SKILL.md`, and focused
  source audits prove source/generated parity.
- Repair closure is legal only when the source owner is patched, generated
  skills are synced when `.agents/rules/**` changed, a source audit proves the
  repair text exists, the repaired template or rule is smoke-checked, deliberate
  non-repairs are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-plate-next-owner-first-colocation-doctrine.md` passes.

Verification surface:

- Focused `rg` audits over `.agents/rules/plate-next.mdc` and
  `.agents/skills/plate-next/SKILL.md` for new doctrine and removed contradictions.
- `pnpm install` as the repository-owned generated-skill sync.
- Direct source/generated body comparison after stripping generated frontmatter.
- `pnpm exec prettier --check` for the source rule and generated skill.
- Final `check-complete.mjs` for this repair plan.

Constraints:

- Repair one expectation narrowly.
- Patch source-of-truth files, not generated skill mirrors.
- Do not weaken evidence safety or completion gates just to reduce annoyance.
- Do not broaden the repair to unrelated skills/templates.

Boundaries:

- Source of truth: the user's correction plus `.agents/rules/plate-next.mdc`.
- Allowed edit scope: `.agents/rules/plate-next.mdc`, generated
  `.agents/skills/plate-next/SKILL.md` via `pnpm install`, and this repair plan.
- Derived skill scope: Plate Next source-shape, colocation, extraction, rename,
  extracted-file recovery, and package score rules only.
- Non-goals: no application/package code changes, no other skill rewrites, no
  line ceiling, no compatibility aliases, no commit/PR.

Output budget strategy:

- Read and audit only exact conflicting ranges and exact doctrine phrases;
  exclude generated/build trees and cap command output below one screen.

Blocked condition:

- Stop only if `pnpm install` cannot sync the generated skill after three
  distinct repair attempts or source/generated ownership is ambiguous.

Repair state:

- repair_type: derived-skill rule repair
- current_phase: closeout
- current_phase_status: complete
- next_phase: complete
- goal_status: ready-to-close

Current verdict:

- verdict: patch `.agents/rules/plate-next.mdc`; sync generated skill
- confidence: high
- next owner: Plate Next rule source
- reason: current doctrine directly contradicts the accepted owner-first cleanup shape

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final repair evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-plate-next-owner-first-colocation-doctrine.md` passes.
- Do not create hook state for this repair. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | No filename/file freeze, no line ceiling, owner-first colocation, inline one-use behavior/types/constants, extract only for reuse/durable ownership, sync generated skill |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Expectation restated | yes | Exact miss and future doctrine recorded above |
| Active goal checked | yes | Previous goal was complete; new repair goal created for this plan |
| Named plan or skill read | yes | Full `plate-next` and `autogoal` skills read; live source contradiction ranges inspected |
| Owning source selected | yes | `.agents/rules/plate-next.mdc`; generated `SKILL.md` is sync output only |
| Repair classification selected | yes | Narrow derived-skill rule repair |
| Safety conflict checked | yes | No evidence-safety conflict; behavior proof remains mandatory |
| Output budget strategy recorded | yes | Exact-file reads and focused audits only |

Work Checklist:

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
- [x] Secondary owners are justified or marked N/A: generated skill is sync output; active plan is evidence only.
- [x] Patch touches source-of-truth files only: `.agents/rules/plate-next.mdc`; generated skill was produced only by repository-owned sync.
- [x] Derived skill vs generic `autogoal` ownership decision is recorded: Plate Next owns this source-shape doctrine.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Deliberate non-repairs are recorded.
- [x] Final response shape is recorded: acknowledge miss, repaired source owner, sync/audit proof, deliberate non-repairs, usage.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source owner patched | yes | Patch the selected source owner or record runtime-plan-only repair | Owner-first colocation, no line ceiling, deletion, rename, recovery, scoring, and loop rules patched in `.agents/rules/plate-next.mdc` |
| Generated skill sync | yes | If `.agents/rules/**` changed, run `pnpm install` and verify generated `SKILL.md` sync | `pnpm install` ran after the final source edit; generated body matches source body exactly |
| Template smoke | no | Instantiate the repaired template or inspect it directly when a smoke plan would create noise | N/A: no template changed; direct source/generated rule audit is the relevant smoke |
| Incomplete-plan guard | no | Verify an unfinished generated plan still fails `check-complete.mjs`, or record N/A with reason | N/A: checker and plan template unchanged |
| Completed-plan representability | yes | Verify the repaired expectation can be recorded in a completed plan without editing the template again, or record N/A | This plan records the exact doctrine, proof, deliberate non-repairs, and failure recovery |
| Helper/checker tests | no | If scripts changed, run focused script tests; otherwise N/A | N/A: no helper or checker changed |
| Autoreview / review | no | Run applicable review gate or record N/A for docs-only/source-rule-only repair | N/A: narrow source-rule repair; exact diff, contradiction audit, and generated parity are the owning review |
| Final lint | yes | Run scoped formatter/lint or record ignored-path/N/A reason | `git diff --check` passes; plan passes Prettier. Source and generated skill are not Prettier-clean at baseline, so Prettier is not a valid gate for those files |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Reads stayed exact and capped; one combined skill read truncated once, then exact bounded chunks were used |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-plate-next-owner-first-colocation-doctrine.md` | `[autogoal] complete` passed for this plan |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | complete | User correction copied into repair plan | target selection |
| Target selection | complete | Live source rule owns the contradiction; generated skill is output | patch |
| Patch | complete | Source owner patched across all five contradiction zones | verification |
| Verification | complete | Sync, exact body parity, positive/negative phrase audits, and whitespace check pass | closeout |
| Closeout | complete | Deliberate non-repairs and handoff recorded; final checker is next | final response |

Findings:

- The old rule contradicted owner-first colocation in five places: helper ownership, rename freeze, extracted-file recovery, package score law, and loop priority.
- `origin/main` path preservation and line/readability thresholds were acting as topology vetoes even when a helper had one production owner.

Decisions and tradeoffs:

- Inline single-consumer plugin behavior regardless of owner-file length; split only for multiple production consumers or a real independent boundary.
- Preserve established public plugin concepts/keys by default, but do not extend that protection to one-use helper files, exports, or helper-named tests.
- Keep public/recursive/external/reused types; cut one-use inference ferry types and constants.

Repair patch notes:

- Replaced original-helper preservation with explicit owner-first colocation.
- Removed the line/readability extraction threshold and added no line-count ceiling.
- Replaced rename freeze/pre-renaming deferral with owner-driven merge/delete/rename in the active packet.
- Changed extracted-file recovery and package scoring to prefer durable current ownership over automatic main-path restoration.
- Updated the loop to choose `merge-existing-owner` / `hard-cut` for one-use migration splits.

Deliberate non-repairs:

- Kept behavior proof, complete package/file ledgers, correction sweeps, and
  score gates intact; colocation does not excuse missing proof.
- Kept public plugin concepts and keys stable unless an accepted API decision
  changes them; the repair targets internal helper topology, not casual public
  API renaming.
- Kept separate files for real multiple-production-consumer ownership,
  cross-layer/public boundaries, React hooks/components, and proof tooling.
- Did not edit generated `SKILL.md` directly, other skills, templates, package
  code, or compatibility policy outside this owner-first correction.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Combined skill read exceeded one output envelope | 1 | Read the exact remaining ranges in bounded chunks | Full named skills were read without another broad stream |
| Prettier rewrote existing `.mdc` Markdown structure and still rejected source/generated files | 1 | Restore unrelated formatting from the baseline and use repository sync plus exact parity and whitespace checks | Only doctrine edits remain; baseline source and generated skill also fail Prettier, while the plan passes |

Verification evidence:

- `pnpm install` completed and `skiller apply` regenerated the derived skill.
- `diff -u` over both bodies from `# Plate Next` returned no differences.
- Negative `rg` audit returned no old preservation, rename-freeze,
  size-threshold, or automatic-path-recovery phrases.
- Positive `rg` audit found colocation, no-line-ceiling, obsolete-helper
  deletion, and topology-not-frozen rules in both source and generated skill.
- `git diff --check` passes for the source, generated skill, and repair plan.
- The repair plan passes Prettier. Baseline source and generated skill both fail
  Prettier via stdin, proving that formatter failure is existing file shape,
  not an unformatted repair.

Final repair handoff:

- Expectation: Plate Next defaults to owner-first colocation, inlines one-use
  plugin logic/types/constants, imposes no line ceiling, and deletes obsolete
  helper files/exports without aliases.
- Repaired owner: `.agents/rules/plate-next.mdc`; generated mirror synced by
  `pnpm install`.
- Files changed: source rule, generated Plate Next skill, this repair plan.
- Verification: exact source/generated parity, positive/negative phrase audits,
  sync success, and whitespace check pass.
- Caveat: public plugin concepts still require an accepted API decision before
  renaming; real reuse and independent boundaries still justify extraction.

Timeline:

- 2026-07-22T15:37:08.348Z Goal repair plan created.
- 2026-07-22T15:40:00Z Contradictory Plate Next source rules replaced with owner-first colocation doctrine.
- 2026-07-22T15:51:00Z Generated skill synced; exact parity and scoped source audits passed.
- 2026-07-22T15:53:00Z Autogoal completeness checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Repair verified; completeness checker passed |
| Where am I going? | Close the active goal and report the repair |
| What is the goal? | Make Plate Next consistently enforce owner-first colocation with no filename or line-count freeze |
| What have I learned? | The contradiction existed across five doctrine sections, not one sentence |
| What have I done? | Patched the source owner, synced the generated skill, proved parity, and recorded the extraction/public-name boundary |

Open risks:

- None for this rule repair.
