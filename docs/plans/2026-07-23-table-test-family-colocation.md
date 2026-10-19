# Table test family colocation

Objective:
Merge `BaseTablePlugin` tests into behavior-family fast/slow specs and repair
Plate Next doctrine so future package cleanups do not preserve method-level
test confetti.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-23-table-test-family-colocation.md

Template:
docs/plans/templates/architecture-cleanup.md

Primary template:
docs/plans/templates/architecture-cleanup.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Cleanup source:
- type: direct user correction
- id / link: current Codex task
- title: repair Plate Next test-family colocation
- requested surface: `packages/table/src/lib/BaseTablePlugin*` specs and
  `.agents/rules/plate-next.mdc`
- cleanup intent: make behavior family the test owner, matching component and
  hook family doctrine
- acceptance criteria: no method-per-file default, no line ceiling, profiler
  owns fast/slow splits, Table test topology proves the rule

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
- initial confidence / cleanliness score: 45/100; current rule explicitly
  recommends method-level specs and the Table suite has 49 Base specs
- improvement loop: merge by behavior family, profile, move only repeat
  runtime outliers to `.slow.tsx`, then review the doctrine and manifest
- final score / loop closure: 100/100; implementation, proof, agent-native
  review, and clean autoreview complete

Completion threshold:
- Exactly one fast spec for each of eight behavior families, at most one
  profiler-proven slow sibling per family, and five independently justified
  lifecycle specs. The accepted current topology is 20 files: eight fast
  family specs, seven measured slow siblings, and five lifecycle specs.
- Zero `BaseTablePlugin*.slow.spec.tsx` files and zero method-level files kept
  solely because a public method exists.
- Plate Next source doctrine names behavior-family ownership, rejects
  method-taxonomy splits, rejects line-count splits, and uses
  `<PluginName>.<family>.spec.tsx` / `<PluginName>.<family>.slow.tsx`.
- Table fast and slow tests pass, repeat profiling keeps fast files below the
  hard thresholds, Table source-first typecheck passes, generated skill mirrors
  match the source rule, and agent-native/autoreview findings are closed.
- Architecture-cleanup closure is legal only when source map, deslop inventory,
  candidate matrix, agent-navigation score, packet ledger, proof evidence,
  changed list, and final handoff are complete or explicitly N/A, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-23-table-test-family-colocation.md`
  passes.

Verification surface:
- Manifest/count audit under `packages/table/src/lib`.
- `pnpm test:profile -- packages/table/src/lib`
- repeat-offender profile through `pnpm test:slowest -- --top 25 --rerun-each 3
  packages/table/src/lib`
- Table slow-test runner scoped to `packages/table/src/lib`
- `pnpm turbo typecheck --filter=./packages/table`
- focused Biome/lint and `git diff --check`
- `pnpm install` plus source/generated Plate Next mirror comparison
- agent-native review and final autoreview

Constraints:
- Do not split files because they are large.
- Prefer delete, merge, inline, or simplify over extraction when that improves
  comprehension.
- Do not change public API, product UX, or behavior under a cleanup packet.
- Focused proof comes before broad proof.
- No dirty speculative work at handoff: keep, revert, or quarantine.
- Preserve every existing behavior assertion; this is topology-only.
- Preserve unrelated shared WIP and frozen Core/app files.
- Do not invent shared production or test-helper files merely to make merged
  specs shorter.
- Do not edit generated `SKILL.md` mirrors directly.

Boundaries:
- Source of truth: `.agents/rules/plate-next.mdc`,
  `.agents/rules/testing.mdc`, `tooling/config/test-suites.mjs`, and live Table
  specs
- Allowed edit scope: `packages/table/src/lib/BaseTablePlugin*` tests,
  `.agents/rules/plate-next.mdc`, generated Plate Next mirrors, and this plan
- Plite / Plate boundary: Plate package tests only; no Plite runtime changes
- Public API boundary: no runtime or exported API changes
- Browser surface: N/A: test-file organization has no visible route behavior
- Package/API surface: Table tests/typecheck only; no exports or changeset
- Non-goals: React `TablePlugin`/hook specs, production Table refactors,
  docs/apps, Core, PagedEditable, commits, pushes, and PRs

Output budget strategy:
- Use exact Table globs, counts, import summaries, and bounded file slices.
  Save profiler output when needed; do not stream unrelated repo scans,
  generated trees, coverage, `node_modules`, or build output.

Blocked condition:
- Stop only if preserved tests cannot be assigned to an honest behavior owner
  without changing behavior, or the owning test runner cannot execute the
  required fast/slow proof after three distinct repair attempts.

Cleanup state:
- task_type: architecture-cleanup
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final handoff
- goal_status: complete

Current verdict:
- verdict: merge
- cleanliness confidence: 100/100 after implementation, proof, and clean review
- next owner: architecture-cleanup
- keep / revert / quarantine call: keep; 246/246 Table family tests pass
- reason: behavior families are the durable owner; slow siblings exist only
  where measured runtime justified them

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-23-table-test-family-colocation.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint and boundaries above copy the user correction |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `architecture-cleanup` loaded | yes | Read `.agents/skills/architecture-cleanup/SKILL.md` completely |
| Active goal checked or created | yes | Goal created for this exact plan |
| Source of truth read before analysis | yes | Read current rule, VISION, Plate vision, testing rule, and live Table profile evidence |
| VISION fit gate read | yes | Root `VISION.md`, `docs/vision/common.md`, and `docs/vision/plate.md` reaffirm owner-first families |
| Plite / Plate boundary selected | yes | Plate Table tests only; Plite runtime excluded |
| Cleanup surface selected | yes | `BaseTablePlugin*` specs plus Plate Next rule source/mirrors |
| Non-goals recorded | yes | Boundaries section |
| Output budget strategy recorded | yes | Bounded exact-glob strategy above |
| Implementation authority decided | yes | User explicitly said go and repair |
| Proof strategy selected | yes | Manifest, fast/slow tests, repeat profile, typecheck, lint, sync, review |
| Agent-native pack selected | yes | Materialized into this plan |
| Agent-facing action surface identified | yes | Plate Next package-review test topology |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/plate-next.mdc`; regenerate mirrors with `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Read `.agents/skills/agent-native-reviewer/SKILL.md` completely |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Source map records largest files, owner files, package exports, public /
      private boundaries, tests, and proof owners for the surface.
- [x] Deslop inventory records wrappers, pass-through modules, duplicate
      helpers, vague names, stale compatibility, over-broad barrels, orphan
      tests, and stale source-owner oracles.
- [x] Candidate matrix ranks at least five candidates unless the prompt names a
      smaller surface.
- [x] Every candidate has a decision: delete, merge, inline, simplify, split,
      keep, defer, reject, or plan.
- [x] Every candidate records an agent-navigation score: files-to-read,
      owners-touched, proof clarity, public/private clarity, and net effect.
- [x] Anti-confetti rule applied: no split is accepted without durable owner,
      stable name, focused proof, and lower future navigation cost.
- [x] Merge/delete/inline are considered as seriously as extraction.
- [x] VISION fit is recorded; missing reusable taste routes to `vision` or
      `sync-vision`.
- [x] Implementation packets are behavior-neutral, public-API-neutral, narrow,
      reversible, and have focused proof.
- [x] Each implementation packet ends keep, revert, or quarantine.
- [x] Source-owner oracle is added or repaired when ownership moves, or N/A
      reason is recorded.
- [x] Focused proof is run before broad proof for changed code.
- [x] Broad proof is run after multiple packets, import churn, or public/package
      boundary changes.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Source map:
- Production owner: `packages/table/src/lib/BaseTablePlugin.ts` (5,179 lines);
  unchanged. Public export remains
  `packages/table/src/lib/index.ts -> BaseTablePlugin`.
- Test owner before cleanup: 49 `BaseTablePlugin*` files and about 10.3k lines,
  mostly named after methods or deleted helpers.
- Test owner after cleanup: 20 files and 10,127 lines: eight fast behavior
  families, seven measured slow siblings, and five lifecycle contracts.
- Largest current files are intentionally coherent owners:
  `clipboard.slow.tsx` (1,195), `presentation.slow.tsx` (980),
  `insert.slow.tsx` (868), `selection.slow.tsx` (859), and
  `merge.slow.tsx` (832). There is no line ceiling.
- Public/private boundary: all moved files are private tests; package barrels,
  runtime source, exports, docs, and changesets are unchanged.
- Proof owners: `tooling/scripts/test-fast.mjs`,
  `tooling/scripts/test-slow.mjs`, `tooling/scripts/test-slowest.mjs`, and
  `tooling/config/test-suites.mjs`.
- Doctrine owner: `.agents/rules/plate-next.mdc`; generated mirrors are
  `.agents/skills/plate-next/SKILL.md` and
  `.claude/skills/plate-next/SKILL.md`.

Deslop inventory:
- Over-split method/helper specs: fixed; 44 non-lifecycle source specs now
  live in 15 behavior-family files.
- Invalid `.slow.spec.tsx` lane: fixed; zero matches remain.
- Duplicate editor/setup helpers: colocated with their family; no shared test
  helper was invented merely to shorten files.
- Dynamic JSX array fixture rejected by the strict JSON boundary: simplified
  to direct JSON in the insert slow family.
- Closed-schema selection props: declared inline at the selection family owner.
- Wrappers, pass-through production modules, compatibility aliases, vague
  production names, stale public exports, and over-broad barrels: N/A; runtime
  and package exports were outside this behavior-neutral test packet.
- Source-owner oracle: the exact family manifest plus fast/slow runners is the
  oracle; no additional checker file is warranted.

Agent-navigation score:
- Files-to-read for one behavior: up to 49 scattered candidates -> one fast
  family plus at most one slow sibling.
- Owners touched: method/helper taxonomy -> one `BaseTablePlugin` family owner.
- Proof clarity: ambiguous fast matching and one invalid slow name -> explicit
  123-test fast lane and 123-test slow lane.
- Public/private clarity: unchanged public export plus private family tests.
- Net effect: 29 fewer files, zero method-level filenames, zero invalid slow
  filenames, and no extra abstraction.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the named Table fast/slow/type/profile gates | 246/246 pass; three independent hard gates pass |
| Source map complete | yes | Record owners, largest files, exports, tests, and proof owners | Source map above |
| Deslop inventory complete | yes | Record concrete stale/shallow/duplicated/over-split surfaces | Deslop inventory above |
| Candidate matrix complete | yes | Rank candidates with facts, action, owner, proof, and decision | Eight ranked decisions below |
| Agent-navigation score complete | yes | Record before/after files-to-read, owner, and proof clarity | 49 candidates -> one fast plus optional slow family |
| Anti-confetti gate | yes | Prove every split has a durable owner and focused proof | Eight families; navigation slow split measured at 157ms |
| Delete / merge / inline gate | yes | Record considered simplifications and outcomes | Cleanup counts and packet ledger below |
| VISION fit gate | yes | Confirm VISION fit or route a taste change | Owner-first family doctrine matches root/Plate vision |
| Implementation packet gate | yes | Record keep/revert/quarantine and focused proof | Four packets kept; temporary scripts removed |
| Source-owner oracle gate | yes | Repair/add an ownership oracle or record N/A | Family manifest plus fast/slow runners are the oracle |
| Public API / behavior safety gate | yes | Prove no public API/product behavior changed | Runtime source and barrels unchanged; 246 assertions retained |
| Package/API proof | yes | Run package/type proof or record N/A | Table package test and 14/14 typecheck pass; exports unchanged |
| Browser proof | no | Run browser proof for visible behavior or record N/A | N/A: private test organization and agent doctrine only |
| Final lint/check | yes | Run focused formatting, typecheck, tests, and diff checks | Biome 20/20; typecheck/tests; scoped diff check pass |
| Output budget discipline | yes | Keep searches scoped/capped and recover noisy output | Exact globs used; oversized shared autoreview replaced by scoped bundle |
| Timed checkpoint | no | Honor requested duration or record N/A | N/A: no duration requested |
| Final handoff contract | yes | Fill changed list, counts, proof, risks, and next owner | Final handoff section below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-23-table-test-family-colocation.md` | checker passes |
| Agent source / generated sync | yes | Run `pnpm install` and verify generated mirrors | Install passes; exact source/mirror snippets match |
| Agent action discoverability | yes | Audit the rule path an agent reads | Family and profiler rules present in source and both mirrors |
| Agent-native review | yes | Close accepted agent-native findings | Source/mirror parity map passes; no accepted finding |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | requirements and doctrine captured | source map |
| Source map | complete | production/export/test/proof owners recorded | deslop inventory |
| Deslop inventory | complete | concrete over-splits and fixture debt recorded | candidate matrix |
| Candidate matrix | complete | eight ranked decisions | cleanup packets / owner routing |
| Cleanup packets / owner routing | complete | four packets kept | verification |
| Verification | complete | 246/246, typecheck, three hard gates | closeout |
| Closeout | complete | clean autoreview; ledger closed | final response |

Target file manifest:

Root: `packages/table/src/lib`

| Done | Path | Score | Verdict | Owner | Evidence | Next |
|------|------|-------|---------|-------|----------|------|
| [x] | `BaseTablePlugin.api.getCellInNextTableRow.spec.tsx` | 100 | merge-existing-owner | navigation | duplicate method topology | merged; 246/246 pass |
| [x] | `BaseTablePlugin.api.getCellInPreviousTableRow.spec.tsx` | 100 | merge-existing-owner | navigation | duplicate method topology | merged; 246/246 pass |
| [x] | `BaseTablePlugin.api.getCellIndices.spec.ts` | 100 | merge-existing-owner | grid | grid query | merged; 246/246 pass |
| [x] | `BaseTablePlugin.api.getNextTableCell.spec.tsx` | 100 | merge-existing-owner | navigation | duplicate method topology | merged; 246/246 pass |
| [x] | `BaseTablePlugin.api.getPreviousTableCell.spec.tsx` | 100 | merge-existing-owner | navigation | duplicate method topology | merged; 246/246 pass |
| [x] | `BaseTablePlugin.api.getSelectedCells.spec.tsx` | 100 | merge-existing-owner | selection | selection query | merged; 246/246 pass |
| [x] | `BaseTablePlugin.api.getSelectedCellsBorders.spec.tsx` | 100 | merge-existing-owner | presentation | border query over selection | merged; 246/246 pass |
| [x] | `BaseTablePlugin.api.getSelectedCellsBoundingBox.spec.tsx` | 100 | merge-existing-owner | selection | selection geometry | merged; 246/246 pass |
| [x] | `BaseTablePlugin.api.getTableCellBorders.spec.tsx` | 100 | merge-existing-owner | presentation | border query | merged; 246/246 pass |
| [x] | `BaseTablePlugin.api.getTableCellSize.spec.tsx` | 100 | merge-existing-owner | presentation | sizing query | merged; 246/246 pass |
| [x] | `BaseTablePlugin.api.getTableColumnIndex.spec.tsx` | 100 | merge-existing-owner | grid | grid query | merged; 246/246 pass |
| [x] | `BaseTablePlugin.api.getTableEntries.spec.tsx` | 100 | merge-existing-owner | grid | entry query | merged; 246/246 pass |
| [x] | `BaseTablePlugin.api.getTableRowIndex.spec.tsx` | 100 | merge-existing-owner | grid | grid query | merged; 246/246 pass |
| [x] | `BaseTablePlugin.api.getTopTableCell.spec.tsx` | 100 | merge-existing-owner | navigation | navigation query | merged; 246/246 pass |
| [x] | `BaseTablePlugin.api.isTableBorderHidden.spec.tsx` | 100 | merge-existing-owner | presentation | border query | merged; 246/246 pass |
| [x] | `BaseTablePlugin.apply.spec.tsx` | 100 | keep | lifecycle apply | independent plugin lifecycle contract | retained; 246/246 pass |
| [x] | `BaseTablePlugin.delete.spec.tsx` | 100 | keep | lifecycle delete | independent plugin lifecycle contract | retained; 246/246 pass |
| [x] | `BaseTablePlugin.getColumnCount.spec.tsx` | 100 | merge-existing-owner | grid | grid query | merged; 246/246 pass |
| [x] | `BaseTablePlugin.getFragment.spec.tsx` | 100 | merge-existing-owner | clipboard | fragment contract | merged; 246/246 pass |
| [x] | `BaseTablePlugin.getGridAbove.slow.tsx` | 100 | merge-existing-owner | grid slow | already profiled slow | merged; 246/246 pass |
| [x] | `BaseTablePlugin.getOverriddenColumnSizes.spec.ts` | 100 | merge-existing-owner | presentation | sizing query | merged; 246/246 pass |
| [x] | `BaseTablePlugin.getSelectionWidth.spec.ts` | 100 | merge-existing-owner | selection | selection geometry | merged; 246/246 pass |
| [x] | `BaseTablePlugin.insertFragment.fitContent.spec.ts` | 100 | merge-existing-owner | clipboard | fragment fit contract | merged; 246/246 pass |
| [x] | `BaseTablePlugin.insertFragment.slow.spec.tsx` | 100 | merge-existing-owner | clipboard slow | wrong lane name; over hard fast-file threshold | merged; 246/246 pass |
| [x] | `BaseTablePlugin.insertText.spec.tsx` | 100 | merge-existing-owner | clipboard | text insertion contract | merged; 246/246 pass |
| [x] | `BaseTablePlugin.isRectangular.spec.ts` | 100 | merge-existing-owner | selection | selection shape | merged; 246/246 pass |
| [x] | `BaseTablePlugin.merge.deleteColumn.spec.tsx` | 100 | merge-existing-owner | merge | structure mutation | merged; 246/246 pass |
| [x] | `BaseTablePlugin.merge.deleteRow.spec.tsx` | 100 | merge-existing-owner | merge | structure mutation | merged; 246/246 pass |
| [x] | `BaseTablePlugin.merge.deleteRowWhenExpanded.spec.ts` | 100 | merge-existing-owner | merge | structure mutation | merged; 246/246 pass |
| [x] | `BaseTablePlugin.merge.getTableGridByRange.spec.tsx` | 100 | merge-existing-owner | merge | merge grid query | merged; 246/246 pass |
| [x] | `BaseTablePlugin.merge.insertTableColumn.spec.tsx` | 100 | merge-existing-owner | merge | structure mutation | merged; 246/246 pass |
| [x] | `BaseTablePlugin.merge.insertTableRow.spec.tsx` | 100 | merge-existing-owner | merge | structure mutation | merged; 246/246 pass |
| [x] | `BaseTablePlugin.merge.tableMergeBehavior.slow.tsx` | 100 | merge-existing-owner | merge slow | profiled merge matrix | merged; 246/246 pass |
| [x] | `BaseTablePlugin.normalize.spec.tsx` | 100 | keep | lifecycle normalize | independent plugin lifecycle contract | retained; 246/246 pass |
| [x] | `BaseTablePlugin.schema.spec.ts` | 100 | keep | lifecycle schema | independent schema contract | retained; 246/246 pass |
| [x] | `BaseTablePlugin.selection.spec.tsx` | 100 | merge-existing-owner | selection | family owner exists | merged; 246/246 pass |
| [x] | `BaseTablePlugin.selectionAndSizing.spec.tsx` | 100 | merge-existing-owner | selection + presentation | mixed family file | redistributed; 246/246 pass |
| [x] | `BaseTablePlugin.spec.ts` | 100 | keep | base plugin | independent descriptor contract | retained; 246/246 pass |
| [x] | `BaseTablePlugin.update.insert.spec.tsx` | 100 | merge-existing-owner | insert | family owner exists; warning-zone runtime | merged; profiled; 246/246 pass |
| [x] | `BaseTablePlugin.update.insertColumn.slow.tsx` | 100 | merge-existing-owner | insert slow | already profiled slow | merged; 246/246 pass |
| [x] | `BaseTablePlugin.update.insertRow.spec.tsx` | 100 | merge-existing-owner | insert | row insertion | merged; profiled; 246/246 pass |
| [x] | `BaseTablePlugin.update.moveSelectionFromCell.spec.tsx` | 100 | merge-existing-owner | selection | selection movement | merged; 246/246 pass |
| [x] | `BaseTablePlugin.update.remove.spec.tsx` | 100 | merge-existing-owner | remove | family owner exists | merged; 246/246 pass |
| [x] | `BaseTablePlugin.update.removeColumn.spec.tsx` | 100 | merge-existing-owner | remove | column removal | merged; profiled; 246/246 pass |
| [x] | `BaseTablePlugin.update.removeRow.spec.tsx` | 100 | merge-existing-owner | remove | row removal | merged; 246/246 pass |
| [x] | `BaseTablePlugin.update.setBorderSize.spec.tsx` | 100 | merge-existing-owner | presentation | border mutation | merged; profiled; 246/246 pass |
| [x] | `BaseTablePlugin.update.setCellBackground.spec.tsx` | 100 | merge-existing-owner | presentation | background mutation | merged; 246/246 pass |
| [x] | `BaseTablePlugin.update.setTableMarginLeft.spec.tsx` | 100 | merge-existing-owner | presentation | margin mutation | merged; 246/246 pass |
| [x] | `BaseTablePlugin.writeSelection.spec.tsx` | 100 | merge-existing-owner | clipboard | clipboard serialization | merged; 246/246 pass |

Candidate matrix:
| Rank | Strength | Candidate | Files | Facts | Navigation score | Recommendation | Owner | Proof | Decision |
|------|----------|-----------|-------|-------|------------------|----------------|-------|-------|----------|
| 1 | Strong | Method-per-file Base specs | navigation/query/selection/update method specs | 49 files and ~10.3k lines mirror method taxonomy; 28 repeat editor factories | 49 files / one package owner / scattered proof -> 20 files / one owner / family proof | Merge by behavior family | `BaseTablePlugin` tests | manifest + full fast/slow runs | merge |
| 2 | Strong | Misnamed slow clipboard spec | `BaseTablePlugin.insertFragment.slow.spec.tsx` | `.slow.spec.tsx` still matches the fast lane and measured above the hard file threshold | hidden wrong lane -> explicit slow family | Rename into clipboard family `.slow.tsx` | clipboard family | profiler + slow runner | merge |
| 3 | Strong | Split navigation API specs | five next/previous/top-cell specs | near-identical imports and editor setup prove one navigation contract | five files -> one family file | Merge | navigation family | focused navigation tests | merge |
| 4 | Strong | Split selection/query specs | selection, selected-cells, bounds, movement specs | one selection behavior owner; `selectionAndSizing` mixes two families | nine files -> one fast family plus slow sibling only if profiled | Merge and redistribute mixed cases | selection family | focused selection tests + profile | merge |
| 5 | Strong | Split presentation specs | sizing, border, background, margin specs | presentation state/query/update methods share one owner; line count is not a split reason | eight files -> one family plus slow sibling only if profiled | Merge | presentation family | focused tests + profile | merge |
| 6 | Strong | Split merge/row/column specs | merge insert/delete/grid/rectangular specs | deleted helper topology survives in filenames; behavior is one table-structure family | eight files -> fast/slow merge family | Merge | merge family | focused tests + profile | merge |
| 7 | Strong | Plate Next method-spec doctrine | `.agents/rules/plate-next.mdc:229-235` | rule explicitly recommends `<PluginName>-<method>.spec.tsx` | future agents reproduce confetti -> family rule is discoverable | Replace with behavior-family doctrine | Plate Next | source/mirror audit | simplify |
| 8 | Strong | Lifecycle contracts | base/schema/apply/delete/normalize specs | independently named plugin lifecycle boundaries with focused proof | five clear files stay five | Keep | `BaseTablePlugin` lifecycle | full Table tests | keep |

Packet ledger:
| Packet | Action | Owner | Files | Proof | Result | Next |
|--------|--------|-------|-------|-------|--------|------|
| Family topology | Merge | `BaseTablePlugin` tests | 49 source specs -> 20 family/lifecycle specs | 123 fast + 123 slow; package test; typecheck | keep | final review |
| Runtime lanes | Simplify/split by evidence | Table test runners | seven `.slow.tsx` siblings; navigation added after 157ms profile | three independent hard gates below warning threshold | keep | none |
| Strict fixtures | Inline/simplify | insert + selection families | JSON table fixture; inline schema properties | slow lane 123/123; typecheck | keep | none |
| Doctrine | Simplify | Plate Next source rule | source plus two generated mirrors | `pnpm install`; exact snippet diff | keep | agent-native/autoreview |

Cleanup counts:
- delete: 29 net test files
- merge: 44 non-lifecycle source specs into 15 family files
- inline: 2 test-only fixture/schema owners
- simplify: 1 Plate Next doctrine block
- split: 1 profiler-proven navigation slow sibling
- keep: 5 independently owned lifecycle specs
- defer: 0
- reject: 0
- plan: 0

Changed list:
- code/runtime/API: N/A; no production, export, or public API changes
- tests/oracles: `packages/table/src/lib/BaseTablePlugin*` topology, fixtures,
  and family fast/slow ownership
- docs/plans: this goal ledger
- skills/workflow: `.agents/rules/plate-next.mdc` plus generated Plate Next
  mirrors
- reverted/quarantined: temporary mechanical merge/recovery scripts removed;
  no speculative source remains

Needs review:
- None.

Agent-native parity map:
| Action | Entrypoint | Source owner | Generated mirrors | Proof | Status |
|--------|------------|--------------|-------------------|-------|--------|
| Plate Next test topology | `plate-next` | `.agents/rules/plate-next.mdc` | Codex + Claude Plate Next skills | `pnpm install`, exact snippet diff, source audit | pass |

Review ledger:
- Agent-native review: no accepted findings; source owner and both mirrors
  expose the same behavior-family and profiler-only slow-sibling law.
- Autoreview attempt 1 could not start because unrelated shared WIP produced a
  1,425,680-character bundle above the 1,048,576-character engine limit.
- Scoped autoreview attempt 2 reported the pre-existing repeat aggregation bug
  only because unchanged context files appeared untracked in the synthetic
  bundle. Rejected after `git diff` and `git ls-files` proved
  `test-slowest.mjs` and `testing.mdc` tracked and unchanged.
- Changed-files-only autoreview attempt 3 found this plan's stale `pending`
  gate rows. Accepted; the checklist and gate evidence were closed here.
- Final changed-files-only autoreview rerun: clean, patch correct, zero
  accepted/actionable findings.

Error attempts:
- The first mechanical family merge removed setup prefixes with stale byte
  offsets. Every live test body was recovered, setup was rebuilt at its family
  owner, temporary scripts were removed, and 246/246 tests plus typecheck prove
  the retained packet.
- The repeat-each profiler aggregates three repetitions before applying the
  single-run file threshold. All 420 repeated assertions pass; three
  independent hard-gate runs provide valid repeat evidence without changing
  out-of-scope tooling.
- One checklist-closing assertion expected 20 open rows; the actual template
  had 19. It failed before writing, then reran with the verified count.

Verification evidence:
- `pnpm --filter @platejs/table test`: pass.
- `pnpm test:slow -- packages/table/src/lib`: 123 pass, 0 fail.
- `pnpm test:slowest -- --top 25 packages/table/src/lib`: 123 pass, zero
  warning/hard files; maximum file total 112.77ms.
- Two additional independent hard-gate runs: 123/123 each, zero warning/hard
  files; maximum totals 96.56ms and 111.31ms.
- `pnpm test:slowest -- --top 30 --rerun-each 3 packages/table/src/lib`:
  420/420 assertions pass, but the current reporter sums the three executions
  before applying the 150ms file threshold. This is a tooling arithmetic
  limitation, not a Table failure; independent hard gates are the valid repeat
  proof.
- `pnpm turbo typecheck --filter=./packages/table`: 14/14 tasks pass.
- Exact topology audit: 20 files, zero `.slow.spec.tsx`, zero method/helper
  filenames.
- Focused Biome 20/20, `pnpm install`, exact source/mirror comparison, scoped
  `git diff --check`, filename audit, and trailing-whitespace audit pass.
- Scoped Codex autoreview (`gpt-5.5`, local synthetic changed-files bundle):
  clean, patch correct, zero accepted/actionable findings.

Open risks:
- None. The unchanged repeat-each reporter limitation is documented below and
  does not affect the three independent hard-gate proofs.

Final handoff contract:
- Source roots inspected: Table production owner, all 49 source test rows,
  package barrels, test-runner thresholds, Plate Next source and mirrors.
- Candidate count and top recommendation: eight ranked candidates; merge
  method topology into behavior families.
- Cleanup counts: 29 net files deleted; 44 merged; 2 inlined; 1 doctrine
  simplified; 1 measured slow split; 5 lifecycle specs kept.
- Agent-navigation score changes: one behavior now costs one fast file plus at
  most one slow file, down from a 49-file method graph.
- Packets applied with keep/revert/quarantine result: four packets kept;
  temporary scripts removed.
- Proof commands/source audits: Table fast/slow/package/typecheck, topology,
  final lint, source/mirror sync, and clean autoreview above.
- Rejected/deferred candidates: none.
- Needs-review list: agent-native parity and final autoreview.
- Residual risks: repeat-each profiler aggregates repetitions before applying
  the file threshold; three independent runs avoid that false positive.
- Next owner and exact first command/file: Plate Next can continue at
  `packages/table/src/lib/BaseTablePlugin.ts`; no test-topology follow-up.

Timeline:
- 2026-07-23T09:27:47.780Z Architecture-cleanup goal plan created.
- 2026-07-23T09:34:00Z Loaded Plate Next, architecture-cleanup, testing,
  autogoal, and agent-native-reviewer; captured requirements and accepted
  family map before implementation.
- 2026-07-23T10:18:00Z Closed 246/246 Table tests, 14/14 typecheck tasks,
  three independent fast hard gates, source/mirror sync, and final formatting.
- 2026-07-23T10:23:00Z Accepted autoreview's stale-ledger finding and closed
  all evidenced checklist/gate rows; final scoped rerun started.
- 2026-07-23T10:26:00Z Final scoped Codex autoreview returned clean with zero
  accepted/actionable findings.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final handoff |
| What is the goal? | Behavior-family Table specs and durable Plate Next test-topology doctrine |
| What have I learned? | Line count is irrelevant; measured runtime is the only honest slow split. The repeat-each reporter currently sums repetitions before thresholding. |
| What is done? | 49 rows consolidated to 20 files, rule synced, 246/246 tests and Table typecheck pass |
