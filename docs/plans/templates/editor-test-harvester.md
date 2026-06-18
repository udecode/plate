# {{TITLE}}

Objective:
TODO: Write the short create_goal objective, under 240 characters. Put the full editor-test-harvester contract in the sections below.

Goal plan:
{{PLAN_PATH}}

Template:
{{TEMPLATE_PATH}}

Completion threshold:
- TODO: Define the exact harvest done state.
- Comprehensive harvest closure is legal only when score >= 0.92, no dimension
  is below 0.85, inventory count equals classified count, no `uncertain` test
  files remain, every portable or portable-mixed runnable file is indexed/read
  or explicitly skipped with reason, every actionable row has owner/target/proof
  evidence, the harvest report links or contains a full inventory appendix, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` passes.

Verification surface:
- TODO: Name the target repo path, harvest report path, inventory/test-index
  paths, source inventory command, coverage search commands, hygiene checks, and
  any focused implementation command for apply runs.

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

Boundaries:
- Target repo: TODO.
- Report directory: TODO.
- Allowed edit scope: TODO.
- Non-goals: TODO.

Blocked condition:
- TODO: Name the missing repo, license evidence, target checkout, browser/device
  proof, Slate v2 checkout, or user decision that stops autonomous work.

Harvest state:
- target_repo: pending
- repo_key: pending
- license_mode: pending
- output_mode: pending
- report_path: pending
- inventory_path: pending
- test_index_path: pending
- current_pass: intake-and-boundary
- current_pass_status: in_progress
- next_pass: inventory

Current verdict:
- verdict: pending
- score: pending
- next owner: editor-test-harvester
- reason: pending

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, report artifacts are current, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` passes.
- Do not create hook state for this goal. This
  file plus the active goal are the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | pending | pending |
| Active goal checked or created | pending | pending |
| Source of truth read before edits | pending | pending |

Work Checklist:
- [ ] Short objective plus outcome, score threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [ ] License gate complete before selecting report directory.
- [ ] Existing report, inventory, and test-index read before rerun updates, or
      marked N/A with reason.
- [ ] Full inventory command recorded with total count, classified count, and
      unresolved count.
- [ ] Every inventory file classified as portable, portable-mixed, plate-owned,
      skip, harness, product-shell, or uncertain.
- [ ] Test-name extraction complete for every runnable portable,
      portable-mixed, and uncertain file, or skipped with reason.
- [ ] Negative-control skip pressure applied to large skip families.
- [ ] Behavior rows extracted with source ref, tag, invariant, proof kind,
      owner coverage, and action.
- [ ] `Plate repo root` coverage searches recorded for raw Slate rows.
- [ ] Plate owner searches recorded for plugin/product rows.
- [ ] Every create/refactor/copy/fresh-invariant/defer/plate-owned row names
      target owner, proof kind, and command or defer reason.
- [ ] Behavior-only hygiene checked: no durable/versioned output copies or
      mechanically translates source code, fixtures, snapshots, helpers,
      expected output blobs, or expressive prose.
- [ ] Browser/IME/mobile claims have honest runtime proof route or explicit
      defer reason.
- [ ] TDD used before apply-run behavior changes with a sane test surface, or
      marked N/A with reason.
- [ ] Browser proof captured for browser-surface apply changes, or marked N/A
      with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the command, proof, source audit, or artifact check named in this plan | pending |
| Harvest artifacts current | pending | Verify report, inventory, test-index, matrix accounting, and skip evidence are current | pending |
| Behavior-only hygiene | pending | Verify versioned output uses fresh invariant wording and no copied source material | pending |
| Final harvest handoff | pending | Emit harvest report handoff or keep the plan pending with the next pass | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and boundary | in_progress | created plan | inventory |
| Inventory | pending | | test-name extraction |
| Test-name extraction | pending | | classification pressure |
| Classification pressure | pending | | behavior extraction |
| Behavior extraction | pending | | coverage mapping |
| Slate/Plate coverage mapping | pending | | action planning |
| Action planning | pending | | ecosystem synthesis |
| Ecosystem synthesis | pending | | closure review |
| Closure review | pending | | final handoff |

Confidence score:
| Dimension | Weight | Score | Evidence | Cap hit |
|-----------|-------:|------:|----------|---------|
| Inventory completeness | 0.20 | pending | | |
| Behavior extraction depth | 0.20 | pending | | |
| Skip precision and negative controls | 0.15 | pending | | |
| Slate/Plate coverage mapping accuracy | 0.20 | pending | | |
| Actionability of copy/refactor/create plan | 0.15 | pending | | |
| Provenance and reproducibility | 0.10 | pending | | |

License gate:
| Field | Value |
|-------|-------|
| License mode | pending |
| Evidence files | pending |
| Output directory | pending |
| Output mode | pending |
| Versioned copy policy | pending |

Inventory accounting:
| Count | Value | Evidence |
|-------|-------|----------|
| test files found | pending | |
| classified | pending | |
| portable | pending | |
| portable-mixed | pending | |
| plate-owned | pending | |
| skipped | pending | |
| harness/product-shell | pending | |
| uncertain | pending | |

Matrix accounting:
| Source ref | Test ref | Tag | Behavior invariant | Proof kind | Owner coverage | Action |
|------------|----------|-----|--------------------|------------|----------------|--------|
| pending | pending | pending | pending | pending | pending | pending |

Skips and negative controls:
| Source / family | Reason | Negative-control evidence |
|-----------------|--------|---------------------------|
| pending | pending | pending |

Next slice:
| Row | Owner | Action | Target | Verification / defer reason |
|-----|-------|--------|--------|-----------------------------|
| pending | pending | pending | pending | pending |

Report artifacts:
| Artifact | Path | Status |
|----------|------|--------|
| report | pending | pending |
| inventory | pending | pending |
| test-index | pending | pending |

Behavior-only hygiene:
- status: pending
- evidence: pending

Findings:
- None yet.

Decisions and tradeoffs:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Pending.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and boundary |
| Where am I going? | Inventory through closure review |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Timeline:
- {{CREATED_AT}} Goal plan created.

Open risks:
- Pending.
