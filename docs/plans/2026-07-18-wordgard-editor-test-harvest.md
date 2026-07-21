# Wordgard Editor Test Harvest

Objective:
Exhaustively harvest portable Wordgard editor tests, map every invariant to
current Plite or Plate proof, and publish a scored report without changing
implementation or tests.

Goal plan:
docs/plans/2026-07-18-wordgard-editor-test-harvest.md

Template:
docs/plans/templates/editor-test-harvester.md

Primary template:
docs/plans/templates/editor-test-harvester.md

Applied packs:
- none

Completion threshold:
- Publish `report.md`, `inventory.md`, and `test-index.md` with all 26 current
  Wordgard test files classified, zero uncertain rows, every portable or mixed
  runnable file indexed and read, every behavior row mapped to a current owner,
  score >= 0.92, and no dimension below 0.85.
- Comprehensive harvest closure is legal only when score >= 0.92, no dimension
  is below 0.85, inventory count equals classified count, no `uncertain` test
  files remain, every portable or portable-mixed runnable file is indexed/read
  or explicitly skipped with reason, every actionable row has owner/target/proof
  evidence, the harvest report links or contains a full inventory appendix, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-18-wordgard-editor-test-harvest.md` passes.
- Lane-plan closure is legal only when score >= 0.92, no dimension is below
  0.85, harvest report path and license mode are recorded, inventory/test-index
  status is recorded, every harvest row is accounted for, no unresolved in-lane
  row remains, every in-lane row has owner coverage/action/target/proof or defer
  evidence, downstream lane gates are applied, accepted-plan handoff is present,
  behavior-only rows use fresh invariant wording only, the final handoff says to
  pause for user review, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-18-wordgard-editor-test-harvest.md` passes.

Verification surface:
- Target: `../wordgard` at the recorded local revision.
- Report: `docs/editor-test-harvester/wordgard/report.md`.
- Inventory: `docs/editor-test-harvester/wordgard/inventory.md`.
- Test index: `docs/editor-test-harvester/wordgard/test-index.md`.
- Inventory command: `rg --files ../wordgard | rg '(^|/)(__tests__|test|tests|spec|e2e|integration|playwright|cypress|wdio|fixtures)(/|$)|\\.(test|spec)\\.[cm]?[jt]sx?$' | rg -v '(^|/)(dist|build|coverage|node_modules|vendor|fixtures/generated|__snapshots__)(/|$)'`.
- Coverage searches: behavior-keyword and adjacent-concept `rg` searches across
  `packages/plite*`, `packages/browser`, `packages/yjs`, `packages/core`,
  relevant Plate package owners, `apps/plite`, `apps/www`, and `docs/solutions`.
- Structural verification: artifact existence, required report headings, exact
  inventory/classification counts, zero uncertain rows, actionable-row owner and
  command audit, and the autogoal completion checker.
- Apply-run verification: N/A; report-only harvest, no implementation changes.

Constraints:
- License mode controls output placement: permissive artifacts under
  `docs/editor-test-harvester/<repo>/`; behavior-only artifacts under
  `.tmp/editor-test-harvester/<repo>/`.
- Behavior-only source material must stay scratch-only. Durable/versioned output
  uses fresh invariant wording and local proof language.
- Do not browse GitHub files. Use local checkouts or clone missing repos under
  `..`.
- Do not edit `Plate repo root`, Plate packages, docs, examples, or build config
  unless the user explicitly requested an apply run.
- In lane-plan mode, do not patch implementation code, tests, examples, package
  files, or build config. Write the plan, write the accepted-plan handoff, and
  pause for user review before downstream execution.

Boundaries:
- Target repo: `../wordgard`.
- Report directory: `docs/editor-test-harvester/wordgard/` because Wordgard is
  MIT licensed.
- Allowed edit scope: this goal plan and the three harvest artifacts only.
- Non-goals: issue-corpus mining, implementation/test changes, lane-plan output,
  GitHub mutations, commits, pushes, PRs, and runtime/browser claims unsupported
  by current proof.

Blocked condition:
- Block only if `../wordgard`, its license evidence, or the current Plite/Plate
  coverage owners become unreadable and no source-backed classification can be
  completed. Missing browser/device proof yields an explicit defer row, not a
  blocked harvest.

Harvest state:
- mode: harvest
- target_repo: ../wordgard
- repo_key: wordgard
- license_mode: permissive
- output_mode: durable
- report_path: docs/editor-test-harvester/wordgard/report.md
- inventory_path: docs/editor-test-harvester/wordgard/inventory.md
- test_index_path: docs/editor-test-harvester/wordgard/test-index.md
- issue_mode: no
- issue_state: N/A
- issue_report_dir: N/A
- issue_raw_cache_dir: N/A
- issue_index_path: N/A
- issue_cluster_path: N/A
- issue_matrix_path: N/A
- current_pass: final-handoff
- current_pass_status: done
- next_pass: N/A
- lane: N/A
- downstream_skill: N/A

Current verdict:
- verdict: complete harvest; six ranked follow-up candidates, one architecture defer
- score: 0.98
- next owner: user review, then `plite-plan` or `plate-plan` for an accepted row
- reason: all 26 files and 616 declared test call sites are accounted for; current coverage leaves six concentrated test/refactor opportunities

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, report artifacts are current, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-18-wordgard-editor-test-harvest.md` passes.
- Do not create hook state for this goal. This
  file plus the active goal are the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `.agents/skills/editor-test-harvester/SKILL.md` read; report-only comprehensive harvest selected |
| Active goal checked or created | yes | `get_goal` returned none; matching goal created for exhaustive Wordgard harvest |
| Source of truth read before edits | yes | `../wordgard/LICENSE`, `../wordgard/package.json`, complete test path inventory, current comparison artifacts, and current Plite sources read |

Work Checklist:
- [x] Short objective plus outcome, score threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] License gate complete before selecting report directory.
- [x] Existing report, inventory, and test-index read before rerun updates, or
      marked N/A with reason. N/A: no existing Wordgard harvest artifacts found.
- [x] Full inventory command recorded with total count, classified count, and
      unresolved count.
- [x] Every inventory file classified as portable, portable-mixed, plate-owned,
      skip, harness, product-shell, or uncertain.
- [x] Test-name extraction complete for every runnable portable,
      portable-mixed, and uncertain file, or skipped with reason.
- [x] Negative-control skip pressure applied to large skip families. N/A: no
      skip family exists; all three harness files were read as negative controls.
- [x] Behavior rows extracted with source ref, tag, invariant, proof kind,
      owner coverage, and action.
- [x] `Plate repo root` coverage searches recorded for raw Plite rows.
- [x] Plate owner searches recorded for plugin/product rows.
- [x] Every create/refactor/copy/fresh-invariant/defer/plate-owned row names
      target owner, proof kind, and command or defer reason.
- [x] Behavior-only hygiene checked: no durable/versioned output copies or
      mechanically translates source code, fixtures, snapshots, helpers,
      expected output blobs, or expressive prose. N/A for license restriction:
      Wordgard is MIT; artifacts still use fresh invariant wording.
- [x] Browser/IME/mobile claims have honest runtime proof route or explicit
      defer reason.
- [x] TDD used before apply-run behavior changes with a sane test surface, or
      marked N/A with reason. N/A: report-only; no behavior changes.
- [x] Browser proof captured for browser-surface apply changes, or marked N/A
      with reason. N/A: report-only; no browser-surface changes.
- [x] Lane-plan mode only: lane aliases normalized and lane registry row
      selected, or marked N/A with reason. N/A: harvest mode.
- [x] Lane-plan mode only: every harvest row counted as in-lane, out-of-lane,
      split, duplicate, skip, or unresolved, or marked N/A with reason. N/A:
      harvest mode.
- [x] Lane-plan mode only: every split row has lane-owned and out-of-lane
      portions separated, or marked N/A with reason. N/A: harvest mode.
- [x] Lane-plan mode only: current owner coverage searched in the target
      workspace before claiming covered or missing, or marked N/A with reason.
      N/A: lane-plan mode; harvest coverage mapping is complete.
- [x] Lane-plan mode only: every in-lane row has lane reason, current coverage,
      action, target, proof route, and verification command or defer reason, or
      marked N/A with reason. N/A: harvest mode.
- [x] Lane-plan mode only: downstream lane gates applied and recorded, or
      marked N/A with reason. N/A: harvest mode.
- [x] Lane-plan mode only: accepted-plan execution handoff complete, or marked
      N/A with reason. N/A: harvest mode.
- [x] Lane-plan mode only: final handoff pauses for user review before
      implementation, or marked N/A with reason. N/A: harvest mode.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | done | Run the command, proof, source audit, or artifact check named in this plan | structural audit passed: 3 artifacts, 26 inventory rows, 26 indexed files, 32 behavior rows, zero uncertain; snapshot hash reproduced |
| Harvest artifacts current | done | Verify report, inventory, test-index, matrix accounting, and skip evidence are current | three artifacts written; 26/26 and 23/23 accounting present |
| Behavior-only hygiene | done | Verify versioned output uses fresh invariant wording and no copied source material | MIT mode; report uses invariant summaries and local owner language |
| Lane-plan review pause | N/A | If lane-plan mode applies, write the accepted-plan handoff and stop for user review before downstream execution | harvest mode only |
| Downstream lane gates | N/A | If lane-plan mode applies, record `plite-plan` or `plate-plan` gate application | harvest mode only |
| Final harvest handoff | done | Emit harvest report handoff or keep the plan pending with the next pass | `docs/editor-test-harvester/wordgard/report.md` is the decision-ready handoff |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-18-wordgard-editor-test-harvest.md` | passed: `[autogoal] complete` |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and boundary | done | goal, plan, scope, and MIT output boundary recorded | inventory |
| Inventory | done | 26 files / 5,708 lines; `inventory.md`; zero uncertain | test-name extraction |
| Test-name extraction | done | 23 runnable files and 616 call sites in `test-index.md` | classification pressure |
| Classification pressure | done | three harness negative controls read; mixed/Table boundaries challenged | behavior extraction |
| Behavior extraction | done | 32 invariant rows in `report.md` | coverage mapping |
| Plite/Plate coverage mapping | done | current core/DOM/React/history/Yjs/Table/List/browser/HTML owners cited | action planning |
| Action planning | done | six ranked candidates, one defer, one protocol skip | ecosystem synthesis |
| Ecosystem synthesis | done | report verdict and proof-honesty section complete | closure review |
| Lane-plan row accounting | N/A | | owner coverage |
| Lane-plan owner coverage mapping | N/A | | execution queue |
| Lane-plan accepted-plan handoff | N/A | | closure review |
| Closure review | done | structural audit passed; score is 0.98; snapshot hash reproduced | final handoff |

Confidence score:
| Dimension | Weight | Score | Evidence | Cap hit |
|-----------|-------:|------:|----------|---------|
| Inventory completeness | 0.20 | 1.00 | 26/26, zero uncertain | no |
| Behavior extraction depth | 0.20 | 0.97 | 23/23 runnable files read; 616 call sites; 32 behavior families | no |
| Skip precision and negative controls | 0.15 | 1.00 | three harness negative controls; no file-level skip family | no |
| Plite/Plate coverage mapping accuracy | 0.20 | 0.96 | current owner files/tests searched; no old plan used as coverage | no |
| Actionability of copy/refactor/create plan | 0.15 | 0.97 | every gap names owner, target, proof, and command/defer | no |
| Provenance and reproducibility | 0.10 | 0.94 | local snapshot hash substitutes for unavailable Git revision | no |

Lane-plan confidence score:
| Dimension | Weight | Score | Evidence | Cap hit |
|-----------|-------:|------:|----------|---------|
| Harvest source readiness | 0.15 | N/A | | |
| Lane-filter completeness | 0.25 | N/A | | |
| Current owner coverage mapping | 0.25 | N/A | | |
| Actionability of execution queue | 0.20 | N/A | | |
| License/provenance discipline | 0.15 | N/A | | |

License gate:
| Field | Value |
|-------|-------|
| License mode | permissive |
| Evidence files | `../wordgard/LICENSE`; `../wordgard/package.json` (`license: MIT`) |
| Output directory | `docs/editor-test-harvester/wordgard/` |
| Output mode | durable |
| Versioned copy policy | normal; preserve behavior invariants rather than upstream API shape |

Inventory accounting:
| Count | Value | Evidence |
|-------|-------|----------|
| test files found | 26 | exact inventory command in Verification surface and `inventory.md` |
| classified | 26 | every path has exactly one category |
| portable | 14 | `inventory.md` |
| portable-mixed | 6 | `inventory.md` |
| plate-owned | 3 | `inventory.md` |
| skipped | 0 | no file-level skip |
| harness/product-shell | 3 / 0 | all three harness files read as negative controls |
| uncertain | 0 | complete classification |

Matrix accounting:
| Source ref | Test ref | Tag | Behavior invariant | Proof kind | Owner coverage | Action |
|------------|----------|-----|--------------------|------------|----------------|--------|
| W01-W32 | `report.md` behavior matrix | model through HTML | all portable/mixed/Plate invariants | package, browser, or deferred architecture proof | exact current owner per row | covered/create/refactor/defer/skip/Plate-owned |

Skips and negative controls:
| Source / family | Reason | Negative-control evidence |
|-----------------|--------|---------------------------|
| `generate.ts`, `schema.ts`, `tempview.ts` | harness, not behavior assertions | all read fully; promoting them would confuse fixtures/generators with invariants |
| central-authority OT protocol | deliberate behavior skip | current Plite/Yjs product boundary and generic change transform inspected |

Next slice:
| Row | Owner | Action | Target | Verification / defer reason |
|-----|-------|--------|--------|-----------------------------|
| W07 | Plite core | create-new | `packages/plite/test/document-change.test.ts` | focused Plite test, then `pnpm check:plite` |
| W11 | Plite core | refactor-existing | `packages/plite/src/core/facet.ts` + transaction extension tests | focused Plite test/typecheck, then `pnpm check:plite` |
| W14 | Plite history | create-new | `packages/plite-history/test/history-soak-contract.slow.ts` | focused seeded soak plus package test |
| W23 | Plate table | create-new | `packages/table/src/lib/withNormalizeTable.spec.tsx` and owner | focused Table test; browser only if interactive behavior changes |
| W24 | Plate table | create-new | `packages/table/src/lib/withInsertFragmentTable.spec.tsx` and owner | focused Table test plus Chromium tables paste proof |
| W27 | Plite React | create-new | `packages/plite-react/test/rendered-dom-shape-contract.tsx` | focused Vitest; browser stress if runtime behavior changes |

Lane contract:
| Field | Value |
|-------|-------|
| Lane | N/A |
| Aliases | N/A |
| Downstream skill | N/A |
| Owner boundary | N/A |
| Exclusions / split rules | N/A |

Full harvest row accounting:
| Row | Source ref | Classification | Lane accounting | Reason |
|-----|------------|----------------|-----------------|--------|
| N/A | N/A | N/A | N/A | N/A |

In-lane candidate matrix:
| Row | Source ref | Tag | Behavior invariant | Lane reason | Current coverage | Action | Target | Proof |
|-----|------------|-----|--------------------|-------------|------------------|--------|--------|-------|
| N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |

Split rows:
| Row | Source ref | Lane-owned part | Out-of-lane part | Owner / handoff |
|-----|------------|-----------------|------------------|-----------------|
| N/A | N/A | N/A | N/A | N/A |

Excluded or out-of-lane rows:
| Row | Source ref | Reason | Owner |
|-----|------------|--------|-------|
| N/A | N/A | N/A | N/A |

Coverage dedupe:
| Candidate | Existing coverage | Decision | Evidence |
|-----------|-------------------|----------|----------|
| N/A | N/A | N/A | N/A |

Execution queue:
| ID | Action | Target | Proof kind | Focused verification | Notes |
|----|--------|--------|------------|----------------------|-------|
| N/A | N/A | N/A | N/A | N/A | N/A |

Issue and claim accounting:
- Fixed issues: N/A.
- Improved issues: N/A.
- Related issues: N/A.
- PR reference: N/A.

Downstream lane application:
| Gate | Status | Evidence |
|------|--------|----------|
| downstream skill read | N/A | |
| lane-specific completion gates applied | N/A | |
| implementation boundaries recorded | N/A | |
| verification commands recorded | N/A | |

Accepted-plan execution handoff:
- read-first plan path: N/A
- requested lane: N/A
- exact execution queue IDs: N/A
- implementation boundaries: N/A
- focused verification commands: N/A
- broad final gate: N/A
- issue/claim sync rule: N/A
- stop rule: N/A; lane-plan mode must pause for user review before implementation.

Report artifacts:
| Artifact | Path | Status |
|----------|------|--------|
| report | `docs/editor-test-harvester/wordgard/report.md` | current |
| inventory | `docs/editor-test-harvester/wordgard/inventory.md` | current |
| test-index | `docs/editor-test-harvester/wordgard/test-index.md` | current |

Behavior-only hygiene:
- status: pass
- evidence: MIT permits durable output; artifacts use fresh invariant wording
  and do not copy source code, fixtures, snapshots, or expected-output blobs.

Findings:
- Current Plite/Plate already owns 24 of 32 extracted behavior families at
  equivalent or stronger depth.
- Six concentrated candidates remain: W07 change transform fuzz, W11 facet
  dependency caching, W14 history soak, W23 table repair, W24 merged-grid
  paste, and W27 incremental-render differential testing.
- W15 history persistence is real architecture work and must not be invented by
  a test transplant. W17 central-authority OT is a deliberate product skip.

Decisions and tradeoffs:
- MIT evidence selects durable output.
- This is a complete repository-test harvest, not issue mode and not an apply
  run. Browser-oriented Wordgard tests may yield browser proof requirements but
  cannot be claimed covered from package tests alone.
- `../wordgard` is not a Git checkout, so a combined content hash is the honest
  reproducible snapshot identifier.
- Test indexing records source-declared `it(...)` call sites. Dynamic factories
  retain their source expressions; behavior rows expand their invariant family.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `git -C ../wordgard rev-parse HEAD` failed because the source directory is not a Git checkout | 1 | hash the complete licensed source/test snapshot | resolved with combined SHA-256 provenance |
| First generated-index orchestration string conflicted with embedded backticks | 1 | construct the read-only generator command from line arrays | resolved |
| TypeScript 7 package exposed no compiler API `ScriptTarget` in the Node entry used by the index helper | 1 | use a source-line `it(...)` call-site extractor instead of the compiler API | resolved; 616 call sites indexed |
| First completion-checker run correctly reported unresolved final handoff/checker/closure statuses | 1 | resolve the evidence-backed final statuses and rerun the same checker | resolved in final verification pass |

Verification evidence:
- `inventory.md`: 26/26 files, 5,708 lines, zero uncertain.
- `test-index.md`: 26/26 files, 23/23 runnable files, 616 declared call sites.
- `report.md`: required license, score, pass ledger, matrix, skips, next slice,
  proof honesty, and full-inventory sections present.
- Combined source snapshot SHA-256:
  `3e3d3c31af9a68a8a8b591fa058c5324673d2ff655160c89b23b59988d3b3561`.
- Structural artifact audit passed with 3 artifacts, 26 inventory rows, 26
  indexed files, 32 behavior rows, score 0.98, and zero uncertain.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-18-wordgard-editor-test-harvest.md`
  passed with `[autogoal] complete`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final handoff |
| Where am I going? | N/A; harvest is complete |
| What is the goal? | Exhaustively harvest Wordgard tests into a source-backed Plite/Plate coverage and action report without implementation changes |
| What have I learned? | Most behavior is already covered; six concentrated candidates remain |
| What have I done? | Licensed, inventoried, read, indexed, classified, mapped, scored, and written three durable artifacts |

Timeline:
- 2026-07-18T08:15:17.520Z Goal plan created.
- 2026-07-18 Inventory and MIT gate completed; no upstream Git revision exists.
- 2026-07-18 All 26 files read/classified; 616 declared test call sites indexed.
- 2026-07-18 Current Plite/Plate coverage mapped into 32 behavior families and
  six ranked follow-up candidates.
- 2026-07-18 Structural audit passed and the source snapshot hash reproduced;
  final checker rerun prepared after resolving closure statuses.
- 2026-07-18 Autogoal completion checker passed; harvest ready for handoff.

Open risks:
- W15 history persistence has no accepted public format and remains deferred.
- Future browser/IME/mobile changes require the named browser or raw-device
  proof; this report does not replace runtime execution.
