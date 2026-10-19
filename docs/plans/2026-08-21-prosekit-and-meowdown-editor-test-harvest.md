# ProseKit and Meowdown Editor Test Harvest

Objective:
Update donor routing and complete ProseKit and Meowdown test harvests; done when each scores >=0.92, no dimension <0.85, artifacts and sync checks pass; plan docs/plans/2026-08-21-prosekit-and-meowdown-editor-test-harvest.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-21-prosekit-and-meowdown-editor-test-harvest.md

Template:
docs/plans/templates/editor-test-harvester.md

Primary template:
docs/plans/templates/editor-test-harvester.md

Applied packs:

- agent-native (docs/plans/templates/packs/agent-native.md)

Completion threshold:

- Update `.agents/rules/plite-research.mdc` and
  `.agents/rules/editor-test-harvester.mdc` with role-specific ProseKit and
  Meowdown guidance. Do not duplicate the names into generic target owners that
  already accept arbitrary repositories.
- Run `pnpm install`, verify the generated skill mirrors contain the source
  guidance, and close the agent-native parity review.
- Complete independent ProseKit and Meowdown harvests. Each report must score
  `>= 0.92`, no dimension may score below `0.85`, inventory count must equal
  classified count, no `uncertain` test file may remain, and every actionable
  row must name an owner, target, proof route, and command or defer reason.
- Comprehensive harvest closure is legal only when score >= 0.92, no dimension
  is below 0.85, inventory count equals classified count, no `uncertain` test
  files remain, every portable or portable-mixed runnable file is indexed/read
  or explicitly skipped with reason, every actionable row has owner/target/proof
  evidence, the harvest report links or contains a full inventory appendix, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-21-prosekit-and-meowdown-editor-test-harvest.md` passes.
- Lane-plan closure is legal only when score >= 0.92, no dimension is below
  0.85, harvest report path and license mode are recorded, inventory/test-index
  status is recorded, every harvest row is accounted for, no unresolved in-lane
  row remains, every in-lane row has owner coverage/action/target/proof or defer
  evidence, downstream lane gates are applied, accepted-plan handoff is present,
  behavior-only rows use fresh invariant wording only, the final handoff says to
  pause for user review, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-21-prosekit-and-meowdown-editor-test-harvest.md` passes.

Verification surface:

- Source rules and generated mirrors under `.agents/rules/` and
  `.agents/skills/`.
- `../prosekit` at its captured local commit, with artifacts under
  `docs/editor-test-harvester/prosekit/`.
- `../meowdown` at its captured local commit, with artifacts under
  `docs/editor-test-harvester/meowdown/`.
- Exact per-repository inventory commands, test-name indexes, local Plite/Plate
  coverage searches, report section checks, skill sync checks, agent-native
  parity review, and the final goal-plan checker.

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
- This is report-only harvest work. Do not run `--apply`, issue-corpus mode,
  public GitHub mutation, commits, pushes, or PR work.
- Treat Playwright WebKit and touch emulation as scoped browser proof. Do not
  claim raw iOS or iPhone proof without device artifacts.
- Keep both target repositories read-only.

Boundaries:

- Target repos: `../prosekit` and `../meowdown`.
- Report directories: `docs/editor-test-harvester/prosekit/` and
  `docs/editor-test-harvester/meowdown/` after the MIT license gates pass.
- Allowed edit scope: the two source rule files, generated `.agents/skills/**`
  mirrors produced by `pnpm install`, this goal plan, and the two stable harvest
  artifact directories.
- Read-only mapping scope: current Plite/Plate source, tests, docs, package
  scripts, and relevant `docs/solutions/` evidence.
- Non-goals: architecture audits, issue harvests, product implementation,
  upstream repository edits, raw-device testing, and adding candidate names to
  every generic skill list.

Output budget strategy:

- Count and save full inventories before reading files. Stream only bounded
  test-name indexes and exact source ranges. Exclude `node_modules`, generated
  output, coverage, build folders, lockfiles, and snapshots from broad searches.
- Keep complete inventories and indexes in their report directories. Use
  focused `rg`, `sed`, and source-owner searches in chat with explicit output
  caps.

Blocked condition:

- Stop only if a target checkout or license evidence is missing, source cannot
  be inventoried, the generated skill sync cannot run after one targeted repair,
  or a required owner decision cannot be derived from current source and no
  useful autonomous pass remains.

Harvest state:

- mode: harvest
- target_repo: `../prosekit`; `../meowdown`
- repo_key: `prosekit`; `meowdown`
- license_mode: permissive for both targets
- output_mode: durable for both targets
- report_path: `docs/editor-test-harvester/prosekit/report.md`; `docs/editor-test-harvester/meowdown/report.md`
- inventory_path: `docs/editor-test-harvester/prosekit/inventory.md`; `docs/editor-test-harvester/meowdown/inventory.md`
- test_index_path: `docs/editor-test-harvester/prosekit/test-index.md`; `docs/editor-test-harvester/meowdown/test-index.md`
- current_pass: closure-review
- current_pass_status: complete
- next_pass: final-handoff
- lane: N/A
- downstream_skill: N/A

Current verdict:

- verdict: done for both harvests
- score: ProseKit 0.96; Meowdown 0.97
- next owner: Plate selection, Markdown, DnD, and browser-proof owners after user selection
- reason: both inventories, indexes, matrices, owner mappings, proof boundaries,
  and closure scores satisfy the harvest completion gates.

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, report artifacts are current, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-21-prosekit-and-meowdown-editor-test-harvest.md` passes.
- Do not create hook state for this goal. This
  file plus the active goal are the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Read `editor-test-harvester`, `autogoal`, `skill-creator`, `agent-native-reviewer`, and `unslop`; selected full report-only harvest mode for both targets. |
| Active goal checked or created | yes | `get_goal` returned no goal; created the active combined goal with this plan path. |
| Source of truth read before edits | yes | Governing skill and source-rule boundaries, both MIT licenses, target configs, portable test families, current Plite/Plate owners, and relevant `docs/solutions` proof limits were read. |
| Agent-native pack selected | yes | `agent-native` pack materialized because `.agents/rules/**` will change. |
| Agent-facing action surface identified | yes | Candidate discovery is owned by `plite-research`; portable test extraction is owned by `editor-test-harvester`. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/*.mdc`; run `pnpm install`; never hand-edit generated `SKILL.md`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Read `.agents/skills/agent-native-reviewer/SKILL.md`; parity review required after sync. |

Work Checklist:

- [x] Short objective plus outcome, score threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] License gate complete before selecting report directory.
- [x] Existing report, inventory, and test-index read before rerun updates, or
      marked N/A with reason.
- [x] Full inventory command recorded with total count, classified count, and
      unresolved count.
- [x] Every inventory file classified as portable, portable-mixed, plate-owned,
      skip, harness, product-shell, or uncertain.
- [x] Test-name extraction complete for every runnable portable,
      portable-mixed, and uncertain file, or skipped with reason.
- [x] Negative-control skip pressure applied to large skip families.
- [x] Behavior rows extracted with source ref, tag, invariant, proof kind,
      owner coverage, and action.
- [x] `Plate repo root` coverage searches recorded for raw Plite rows.
- [x] Plate owner searches recorded for plugin/product rows.
- [x] Every create/refactor/copy/fresh-invariant/defer/plate-owned row names
      target owner, proof kind, and command or defer reason.
- [x] Behavior-only hygiene checked: no durable/versioned output copies or
      mechanically translates source code, fixtures, snapshots, helpers,
      expected output blobs, or expressive prose.
- [x] Browser/IME/mobile claims have honest runtime proof route or explicit
      defer reason.
- [x] TDD used before apply-run behavior changes with a sane test surface, or
      N/A: this is report-only and cannot edit product behavior.
- [x] Browser proof captured for browser-surface apply changes, or N/A: this
      run reads upstream browser tests and performs no browser-facing product edit.
- [x] Lane-plan mode only: lane aliases normalized and lane registry row
      selected, or N/A: harvest mode only.
- [x] Lane-plan mode only: every harvest row counted as in-lane, out-of-lane,
      split, duplicate, skip, or unresolved, or N/A: harvest mode only.
- [x] Lane-plan mode only: every split row has lane-owned and out-of-lane
      portions separated, or N/A: harvest mode only.
- [x] Lane-plan mode only: current owner coverage searched in the target
      workspace before claiming covered or missing, or N/A: harvest mode uses
      its own Plite/Plate mapping pass.
- [x] Lane-plan mode only: every in-lane row has lane reason, current coverage,
      action, target, proof route, and verification command or defer reason, or
      N/A: harvest mode only.
- [x] Lane-plan mode only: downstream lane gates applied and recorded, or N/A:
      harvest mode only.
- [x] Lane-plan mode only: accepted-plan execution handoff complete, or N/A:
      harvest mode only.
- [x] Lane-plan mode only: final handoff pauses for user review before
      implementation, or N/A: no lane plan or implementation is requested.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Exact 179 and 118 inventory recounts, row/index checker, required-section checks, formatting checks, source/mirror searches, and report audits pass. |
| Harvest artifacts current | yes | Verify both reports, inventories, test indexes, matrix accounting, and skip evidence are current | Six artifacts exist; 179/179 and 118/118 rows classify with zero uncertain; all 44 portable-mixed files are indexed. |
| Behavior-only hygiene | yes | Confirm both license modes and verify no unsafe upstream copying in durable output | Both repos are MIT/permissive; reports use local invariant prose and contain no copied fixtures, snapshots, helper code, or expected-output blobs. |
| Lane-plan review pause | no | N/A: harvest mode only | N/A: no lane plan. |
| Downstream lane gates | no | N/A: harvest mode only | N/A: no downstream execution. |
| Final harvest handoff | yes | Emit both harvest report handoffs with changed list, findings, proof limits, and next owners | Reports contain the full handoff; final response will link both reports and state the proof boundary and owners. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-21-prosekit-and-meowdown-editor-test-harvest.md` | Pass: `[autogoal] complete` after all fields, checklist items, gates, passes, evidence, and risks were resolved. |
| Agent source / generated sync | yes | Run `pnpm install` after source-rule edits and verify generated mirrors | `pnpm install` completed; both generated skills contain the exact donor-role and raw-iOS boundary guidance. |
| Agent action discoverability | yes | Source-audit both source rules and generated skill paths | `plite-research` names both discovery roles; `editor-test-harvester` names both extraction roles in source and generated mirrors. |
| Agent-native review | yes | Close accepted `agent-native-reviewer` findings or reject them with source evidence | PASS: user action, route, source owner, generated mirror, and verification command are all present; no stale or competing skill owner found. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and boundary | complete | Both local commits and MIT licenses captured; report-only and proof boundaries fixed. | inventory |
| Inventory | complete | 179 ProseKit and 118 Meowdown paths written and fully classified. | test-name extraction |
| Test-name extraction | complete | 154 ProseKit and 117 Meowdown runnable files indexed; both unmatched shells read directly. | classification pressure |
| Classification pressure | complete | Generic, harness, product-shell, PM Step, lint-rule, and benchmark negative controls read. | behavior extraction |
| Behavior extraction | complete | All portable-mixed families reduced to tagged observable invariants with proof kinds. | coverage mapping |
| Plite/Plate coverage mapping | complete | Raw and package owner search logs and exact current files recorded in both reports. | action planning |
| Action planning | complete | Every active, deferred, covered, and Plate-owned row has an owner, target, proof, and command or reason. | ecosystem synthesis |
| Ecosystem synthesis | complete | Both reports state steal, reject, diverge, and testing strategy decisions. | closure review |
| Lane-plan row accounting | N/A | | owner coverage |
| Lane-plan owner coverage mapping | N/A | | execution queue |
| Lane-plan accepted-plan handoff | N/A | | closure review |
| Closure review | complete | ProseKit 0.96 and Meowdown 0.97; no dimension below 0.85 and no uncertain rows. | final handoff |

Confidence score:
| Repository | Dimension | Weight | Score | Evidence | Cap hit |
|------------|-----------|-------:|------:|----------|---------|
| ProseKit | Inventory completeness | 0.20 | 0.99 | Exact 179-row appendix and zero uncertain. | none |
| ProseKit | Behavior extraction depth | 0.20 | 0.95 | All 23 portable-mixed files indexed and pressure-read. | none |
| ProseKit | Skip precision and negative controls | 0.15 | 0.96 | All skip/harness/shell rows reasoned; four control families read. | none |
| ProseKit | Plite/Plate coverage mapping accuracy | 0.20 | 0.95 | Raw and package search log maps current owners or explicit policy gaps. | none |
| ProseKit | Actionability of copy/refactor/create plan | 0.15 | 0.94 | Every active row has owner, target, proof, and command or defer reason. | none |
| ProseKit | Provenance and reproducibility | 0.10 | 0.99 | Commit, license, inventory/index commands, and browser boundary recorded. | none |
| Meowdown | Inventory completeness | 0.20 | 0.99 | Exact 118-row appendix and zero uncertain. | none |
| Meowdown | Behavior extraction depth | 0.20 | 0.98 | All 21 portable-mixed files and source-only browser leads pressure-read. | none |
| Meowdown | Skip precision and negative controls | 0.15 | 0.96 | PM Step, utility, lint, and benchmark controls read. | none |
| Meowdown | Plite/Plate coverage mapping accuracy | 0.20 | 0.96 | Raw, browser, Markdown, DnD, media, AI, and feature owners mapped. | none |
| Meowdown | Actionability of copy/refactor/create plan | 0.15 | 0.96 | Markdown, DnD, checklist, and raw-device routes name exact proof. | none |
| Meowdown | Provenance and reproducibility | 0.10 | 0.99 | Commit, license, configs, matrix, commands, and device limits recorded. | none |

Lane-plan confidence score:
| Dimension | Weight | Score | Evidence | Cap hit |
|-----------|-------:|------:|----------|---------|
| Harvest source readiness | 0.15 | N/A | | |
| Lane-filter completeness | 0.25 | N/A | | |
| Current owner coverage mapping | 0.25 | N/A | | |
| Actionability of execution queue | 0.20 | N/A | | |
| License/provenance discipline | 0.15 | N/A | | |

License gate:
| Repository | Field | Value |
|------------|-------|-------|
| ProseKit | License mode | permissive, MIT |
| ProseKit | Evidence files | `../prosekit/LICENSE`; core/extensions/web package metadata |
| ProseKit | Output directory | `docs/editor-test-harvester/prosekit/` |
| ProseKit | Output mode | durable |
| ProseKit | Versioned copy policy | normal, with fresh local invariant and proof wording |
| Meowdown | License mode | permissive, MIT |
| Meowdown | Evidence files | `../meowdown/LICENSE`; core/react/markdown package metadata |
| Meowdown | Output directory | `docs/editor-test-harvester/meowdown/` |
| Meowdown | Output mode | durable |
| Meowdown | Versioned copy policy | normal, with fresh local invariant and proof wording |

Inventory accounting:
| Repository | Count | Value | Evidence |
|------------|-------|-------|----------|
| ProseKit | test files found | 179 | exact donor recount and inventory header |
| ProseKit | classified | 179 | category sum equals inventory count |
| ProseKit | portable | 0 | full appendix |
| ProseKit | portable-mixed | 23 | all 23 indexed and read |
| ProseKit | plate-owned | 110 | grouped to exact Plate owners |
| ProseKit | skipped | 15 | generic type/runtime negative controls |
| ProseKit | harness/product-shell | 31 | 27 harness plus 4 product shell |
| ProseKit | uncertain | 0 | row checker |
| Meowdown | test files found | 118 | exact donor recount and inventory header |
| Meowdown | classified | 118 | category sum equals inventory count |
| Meowdown | portable | 0 | full appendix |
| Meowdown | portable-mixed | 21 | all 21 indexed and read |
| Meowdown | plate-owned | 90 | grouped to exact Plate owners |
| Meowdown | skipped | 3 | PM Step, generic utility, lint rule |
| Meowdown | harness/product-shell | 4 | four benchmark harness rows, no product shell |
| Meowdown | uncertain | 0 | row checker |

Matrix accounting:
| Repository | Report matrix | Rows | Status | Evidence |
|------------|---------------|------|--------|----------|
| ProseKit | `docs/editor-test-harvester/prosekit/report.md` | 17 grouped behavior/owner rows | done | Every non-covered row names target, proof, and command or reason. |
| Meowdown | `docs/editor-test-harvester/meowdown/report.md` | 21 grouped behavior/owner rows | done | Every non-covered row names target, proof, and command or reason. |

Skips and negative controls:
| Repository | Source / family | Reason | Negative-control evidence |
|------------|-----------------|--------|---------------------------|
| ProseKit | Generic types/utilities, harnesses, product shells | No independent editor behavior after pressure read. | Read simplify-union, merge-objects, clipboard/test helpers, RTL story shell, and full registry shell. |
| Meowdown | PM Step, file-size helper, ESLint rule, benchmarks | Framework internals, generic utility, static lint, or measurement harness. | Read BatchSetMarkStep, format-file-size, RuleTester corpus, and roundtrip benchmark. |

Next slice:
| Repository | Row | Owner | Action | Target | Verification / defer reason |
|------------|-----|-------|--------|--------|-----------------------------|
| ProseKit | Blurred selection lifecycle | `packages/selection` | refactor-existing | `CursorOverlayPlugin.spec.tsx` plus `/blocks/cursor-overlay-demo` | package test plus real Browser proof |
| Meowdown | Open Markdown fragment boundaries | `packages/markdown` | create-new | `MarkdownPlugin.spec.ts` | `pnpm --filter @platejs/markdown test -- MarkdownPlugin.spec.ts` |
| Meowdown | Cross-editor source authority | `packages/dnd` | refactor-existing | `useDndNode.spec.ts` and drag item contract | package unit plus real two-editor browser proof; route API changes through best-api |
| Meowdown | Markdown corpus/property stability | `packages/markdown` | create-new | `roundtripCorpus.spec.ts` | bounded deterministic package test |
| Meowdown | Image touch/software keyboard | `packages/media` plus raw-mobile proof owner | defer | raw iOS Appium scenario | `bun test:mobile-device-proof:raw`; donor synthetic touch is insufficient |

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

## Agent-Native Review

### Verdict

PASS

### Capability Map

| User action                                                    | Agent route             | Source owner                              | Mirror/lock/doc                                 | Proof                                                                  | Status |
| -------------------------------------------------------------- | ----------------------- | ----------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------- | ------ |
| Discover ProseKit or Meowdown as an editor research donor      | `plite-research`        | `.agents/rules/plite-research.mdc`        | `.agents/skills/plite-research/SKILL.md`        | `pnpm install` plus exact source/mirror `rg`                           | pass   |
| Harvest ProseKit or Meowdown tests into Plite/Plate invariants | `editor-test-harvester` | `.agents/rules/editor-test-harvester.mdc` | `.agents/skills/editor-test-harvester/SKILL.md` | `pnpm install`, exact source/mirror `rg`, and the six report artifacts | pass   |
| Distinguish browser touch/WebKit evidence from raw iOS proof   | Both routes above       | Both source rules                         | Both generated mirrors and harvest reports      | Exact `rg` for the raw-iOS boundary plus report proof sections         | pass   |

### Findings

- No P0-P3 parity finding remains. The user action, route, durable source,
  generated mirror, proof, and handoff are all present.

### Accepted / Rejected

- Accepted: add role-specific donor guidance to the two existing owners and
  regenerate mirrors.
- Rejected: edit generated `SKILL.md` directly or add wrapper/name lists to
  generic skills, because that would duplicate ownership and rot on sync.

### Verification

- `pnpm install` -> pass; Skiller regenerated Codex and Claude mirrors.
- Exact source/mirror searches -> both donor roles and the raw-iOS proof limit
  appear in source and generated skills.
- Six harvest artifacts -> present and structurally verified.

### Needs Attention

- None for agent-native parity. Future product implementation remains with the
  package owners selected in the reports.

Report artifacts:
| Artifact | Path | Status |
|----------|------|--------|
| ProseKit report | `docs/editor-test-harvester/prosekit/report.md` | done, score 0.96 |
| ProseKit inventory | `docs/editor-test-harvester/prosekit/inventory.md` | done, 179 rows |
| ProseKit test-index | `docs/editor-test-harvester/prosekit/test-index.md` | done, 154 indexed runnable files plus one direct shell read |
| Meowdown report | `docs/editor-test-harvester/meowdown/report.md` | done, score 0.97 |
| Meowdown inventory | `docs/editor-test-harvester/meowdown/inventory.md` | done, 118 rows |
| Meowdown test-index | `docs/editor-test-harvester/meowdown/test-index.md` | done, 117 indexed files plus one direct lint-rule read |

Behavior-only hygiene:

- status: pass
- evidence: both repositories are MIT/permissive. Durable reports contain
  source refs and fresh invariant summaries, not copied implementation, fixtures,
  snapshots, helper code, expected-output blobs, or expressive prose.

Findings:

- ProseKit is useful mainly for Plate extension and headless UI prior art. Its
  shared suite installs/runs Chromium only, even with `hasTouch: true`.
- ProseKit's best immediate candidate is nested-editable cleanup for Plate's
  existing blurred-selection overlay.
- Meowdown's strongest portable pressure is Markdown fragment/corpus proof,
  source-authorized cross-editor drag, and browser document-edge behavior.
- Meowdown CI includes desktop WebKit, but its touch tests are synthetic and its
  image touch cases skip WebKit. It does not prove raw iOS.

Decisions and tradeoffs:

- Added both donors only to their natural discovery and extraction owners.
  Generic arbitrary-target skills were not polluted with duplicate name lists.
- Rejected ProseMirror positions, plugins, NodeViews, MIME envelopes, and custom
  virtual caret machinery as raw Plite requirements.
- Kept desktop browser matrix, touch emulation, and direct Appium proof as three
  distinct evidence levels.
- Did not run donor suites or product tests because this is a source-audit,
  report-only harvest; reports state that boundary explicitly.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Generic `quick_validate.py` rejected generated Skiller frontmatter fields `argument-hint` and `disable-model-invocation`. | 1 | Use the repository-owned Skiller sync and source/mirror parity checks. | Validator mismatch recorded; `pnpm install` succeeded and exact source/mirror guidance matches. |
| Prettier could not infer a parser for `.mdc` files and reported artifact formatting drift. | 1 | Format Markdown artifacts directly; validate `.mdc` content through repository sync and exact searches. | All seven Markdown artifacts formatted; `.mdc` source/mirror checks pass. |

Verification evidence:

- Exact inventory recounts: ProseKit 179; Meowdown 118.
- Artifact checker: 179 and 118 rows; category sums match; zero uncertain;
  all 23 and 21 portable-mixed files have index headings; all required report
  sections exist; no escaped Markdown backticks remain.
- `pnpm install`: pass; Skiller regenerated Codex/Claude mirrors.
- Source/mirror searches: both donor roles and the raw-iOS boundary appear in
  each source rule and generated `SKILL.md`.
- Report formatting: Prettier pass after mechanical normalization.
- Goal checker: `[autogoal] complete` for this plan.
- Product/browser/raw-device tests: N/A for report-only work; no runtime claim
  is made.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closure complete; final checker and handoff |
| Where am I going? | Final report links, verdict, proof boundary, and owner handoff |
| What is the goal? | Update role-specific donor routing, then complete and verify both comprehensive test harvests. |
| What have I learned? | ProseKit is a Chromium-only UI/API donor; Meowdown has strong desktop matrix evidence but no raw iOS proof. See Findings. |
| What have I done? | Updated source skills, regenerated mirrors, completed two exhaustive harvests, and verified counts, indexes, mappings, and formatting. See Timeline. |

Timeline:

- 2026-08-21T10:09:11.340Z Goal plan created.
- 2026-08-21 Skills loaded, no prior goal found, combined goal created, and explicit requirements copied into this plan before edits.
- 2026-08-21 Source rules updated for ProseKit and Meowdown donor roles; `pnpm install` regenerated mirrors.
- 2026-08-21 Both MIT gates passed; full inventories and test-name indexes written from captured local commits.
- 2026-08-21 Portable-mixed families pressure-read; negative controls and current Plite/Plate owners audited.
- 2026-08-21 Reports completed at 0.96 and 0.97 with explicit desktop WebKit, synthetic touch, and raw-device boundaries.
- 2026-08-21 Exact recount, row/index/section checker, agent-native parity audit, and artifact formatting passed.
- 2026-08-21 Final autogoal checker passed.

Open risks:

- Donor suites and recommended future Plate/Plite tests were not executed in
  this report-only run. The reports claim source/test coverage, not fresh runtime
  passage.
- Meowdown's source comments suggest iOS-specific behavior, but no raw-device
  artifact was available. Any exact iOS claim remains deferred to direct Appium
  proof.
