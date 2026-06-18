# Slate v2 PortableText Harvest Plan

Objective:
Produce a lane-specific `editor-harvest-plan` for `slate-v2` from `docs/editor-test-harvester/portabletext/report.md`. Completion means this dated plan records the Portable Text license mode, inventory/test-index/source-routing status, accounts for every harvest family and every source-routing row as in-lane, split, out-of-lane, skip, or duplicate, maps current `Plate repo root` owner coverage for every raw Slate family, applies the downstream `slate-plan` gates, writes an execution queue and accepted-plan handoff, records issue/claim accounting as unchanged, edits no implementation/test/example/package/build files, and passes `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-29-slate-v2-portabletext-harvest-plan.md`.

Goal plan:
docs/plans/2026-05-29-slate-v2-portabletext-harvest-plan.md

Template:
docs/plans/templates/editor-harvest-plan.md

Applied packs:
- editor-harvest-plan
- slate-plan downstream lane gates

Completion threshold:
- Score is 0.95, with every dimension at or above 0.92.
- Harvest report exists at `docs/editor-test-harvester/portabletext/report.md` and has `status: done`.
- License mode is `permissive`, output mode is `durable`, and the plan uses fresh invariant wording plus source provenance only.
- Inventory/test-index/source-routing artifacts exist and are accounted: 502 inventory rows, 321 runnable rows, 200 portable or portable-mixed indexed files, 1944 anchors, and 200 source-routing rows.
- All 14 Portable Text harvest families are routed: 7 in-lane raw Slate families, 5 split raw/product families, 2 out-of-lane Plate families, plus harness/skip inventory buckets.
- No in-lane family lacks owner coverage, action, target, proof route, and verification command or explicit defer reason.
- Downstream `slate-plan` gates are applied as planning-only boundaries.
- Accepted-plan execution handoff is complete.
- No `Plate repo root` implementation, test, example, package, or build file is edited in this planning pass.
- The autogoal mechanical completion command passes for this exact plan path.

Verification surface:
- Harvest artifacts: `docs/editor-test-harvester/portabletext/report.md`, `inventory.md`, `test-index.md`, and `source-routing.md`.
- Harvest report facts: `status: done`, score `0.94`, license mode `permissive`, output mode `durable`, 502 inventory rows, 200 portable/portable-mixed source-routing rows, 100 Plate-owned rows, 188 harness rows, 14 skip rows, and 0 uncertain rows.
- Current owner coverage search: `rg --files` and `rg -n` over `packages/slate/test`, `packages/slate-react/test`, `packages/browser/test`, `packages/slate-dom/test`, and `Plate repo root/playwright`.
- Downstream lane skill: `.agents/skills/slate-plan/SKILL.md`.
- Plan integrity grep: required sections for harvest grounding, lane contract, full row accounting, in-lane candidate matrix, execution queue, downstream lane application, and accepted-plan execution handoff.
- Final mechanical gate: `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-29-slate-v2-portabletext-harvest-plan.md`.

Constraints:
- This is planning/routing work only.
- Do not edit `Plate repo root` from this skill.
- Do not patch Plate packages, docs, examples, registry, package files, or build config from this skill.
- Do not import Portable Text schema, behavior API names, list semantics, renderer policy, serializer outputs, toolbar/plugin policy, or Sanity bridge shape into raw Slate.
- Browser, clipboard, selection, drag/drop, focus, and IME rows need honest browser/device proof when executed later.
- The live `Plate repo root` checkout wins over stale plans.

Boundaries:
- Requested lane: `slate-v2`.
- Harvest report: `docs/editor-test-harvester/portabletext/report.md`.
- Source routing appendix: `docs/editor-test-harvester/portabletext/source-routing.md`.
- Raw Slate owner: `packages/slate`, `packages/slate-react`, `packages/browser`, `packages/slate-dom`, and `Plate repo root/playwright`.
- Plate owner: product schema, lists, annotations, decorators, serializers, renderers, toolbars, plugin ergonomics, examples, and Sanity bridge work in this checkout.
- Allowed edit scope in this pass: this plan file only.
- Non-goals: implementation, tests, examples, package changes, GitHub issue changes, commits, pushes, PRs, or browser proof execution.

Blocked condition:
No blocker is active. A real blocker would be missing `docs/editor-test-harvester/portabletext/report.md`, missing `Plate repo root`, or a user decision to route schema/list/plugin rows into raw Slate despite the lane boundary.

Lane state:
- harvest_report: done at `docs/editor-test-harvester/portabletext/report.md`
- lane: slate-v2
- current_pass: execution-grade routing plan
- current_pass_status: complete
- current_pass_skill: `.agents/skills/editor-harvest-plan/SKILL.md`
- downstream_skill: `.agents/skills/slate-plan/SKILL.md`
- next_pass: user review, then downstream execution if accepted
- goal_status: complete after final mechanical gate succeeds

Current verdict:
- verdict: accept plan
- score: 0.95
- next owner: downstream Slate v2 execution pass, likely `slate-plan` or `slate-patch` based on whether the user wants architecture-first implementation or bug-style patch execution.
- reason: Portable Text is valuable as behavior pressure for raw selection, projection, void/object boundaries, insert/delete, clipboard, drag/drop, IME, focus/event authority, collab/history, operations, and transaction ordering; its schema/product API shape belongs outside raw Slate.

Completion rule:
- Call `update_goal(status: complete)` only after this file has checked Work Checklist items, resolved Start Gates and Completion Gates, phase rows with closed statuses, Verification evidence, Reboot status, Open risks, and a passing autogoal check.
- Do not start implementation from this skill.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `editor-harvest-plan` and downstream `slate-plan` skill bodies were read before this plan was written. |
| Active goal checked or created | yes | Active goal `019e6fd0-9a50-7120-ac35-068d11f61bcc` matches this exact plan path and completion command. |
| Harvest source read | yes | `docs/editor-test-harvester/portabletext/report.md` and `source-routing.md` were read; companion artifacts were checked for presence. |
| Current owner evidence searched | yes | `Plate repo root` package tests, browser tests, DOM tests, and Playwright examples were searched before coverage mapping. |

Work Checklist:
- [x] Objective includes lane outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition.
- [x] Harvest report path, status, score, license mode, output mode, inventory counts, matrix rows, skips, source-routing row count, and pass state recorded.
- [x] Inventory, test-index, and source-routing status recorded with missing-file reasons not applicable because all exist.
- [x] Lane aliases normalized and downstream lane registry row selected.
- [x] Every Portable Text harvest family counted as in-lane, split, out-of-lane, skip, or duplicate.
- [x] Every source-routing row counted through a family bucket with no unassigned raw Slate row.
- [x] Every split row separates raw Slate-owned substrate from Plate/product policy.
- [x] Current owner coverage searched in `Plate repo root` before claiming coverage or gaps.
- [x] Every in-lane or split raw family has lane reason, current coverage, action, target, proof route, and verification command.
- [x] Behavior rows use fresh invariant wording and source-path provenance only.
- [x] Downstream `slate-plan` gates applied and recorded.
- [x] Issue/claim accounting records unchanged status.
- [x] Accepted-plan execution handoff complete.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Verify harvest artifacts, row accounting, downstream gates, and final autogoal check. | Verification evidence records artifact checks, section greps, placeholder scan, and autogoal command. |
| Harvest artifacts current | yes | Confirm report, inventory, test-index, and source-routing exist and match the 2026-05-29 harvest. | `harvest-files-ok` returned for all companion files; report records 502 inventory rows and 200 routed portable/mixed files. |
| Row accounting closed | yes | Account for all 14 families and all 200 source-routing rows. | Family table accounts 94 in-lane routed files, 106 split routed files, 100 out-of-lane Plate-owned inventory files, and 202 harness/skip inventory files. |
| Current owner mapping searched | yes | Search current `Plate repo root` coverage before target decisions. | Owner coverage section lists live test/browser anchors found by `rg`. |
| Downstream lane gates applied | yes | Apply `slate-plan` raw Slate/Plate boundaries and planning-only rule. | Downstream lane application table records current-source, raw Slate owner, Plate split, browser proof, and no-implementation boundaries. |
| Issue or claim accounting changed | no | Record that no issue, PR, or claim ledger changed. | Issue and claim accounting says no fixed/improved/related claim changes. |
| Accepted-plan handoff | yes | Emit execution queue, broad final gate, issue sync rule, and stop rule. | Accepted-plan execution handoff section names queue IDs and commands. |
| Goal plan complete | yes | Run the autogoal completion checker for this exact plan path. | Final command result is recorded in Verification evidence. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Harvest grounding | complete | Report, inventory, test-index, and source-routing facts recorded. | done |
| Lane filter and row accounting | complete | 14 families, 200 source-routing rows, and 502 inventory rows accounted. | done |
| Current owner coverage mapping | complete | `Plate repo root` package and browser owner files searched and mapped. | done |
| Execution queue and proof routing | complete | Queue `PT-SV2-Q1` through `PT-SV2-Q7` written with commands and boundaries. | done |
| Downstream lane gate application | complete | `slate-plan` raw/Plate boundaries recorded. | done |
| Issue and claim accounting | complete | No issue, PR, or claim status changed. | done |
| Accepted-plan execution handoff | complete | Handoff section names plan path, lane, queue, commands, broad gate, and stop rule. | done |
| Closure review and final gates | complete | Mechanical checks recorded below. | final response |

Confidence score:
| Dimension | Weight | Score | Evidence | Cap hit |
|-----------|-------:|------:|----------|---------|
| Harvest source readiness | 0.15 | 0.98 | MIT license mode, durable report, 502 inventory rows, 321 runnable rows, 200 indexed portable/mixed files, 1944 anchors. | none |
| Lane-filter completeness | 0.25 | 0.96 | All 14 harvest families and all 200 source-routing rows are classified; 0 uncertain rows remain. | none |
| Current owner coverage mapping | 0.25 | 0.94 | Live `Plate repo root` owner searches found coverage anchors for each raw family. | no behavior tests run because this is planning-only |
| Actionability of execution queue | 0.20 | 0.94 | Each queue row has ID, target owner, proof kind, focused command, split rule, and broad gate. | browser rows still need execution in a later pass |
| License/provenance discipline | 0.15 | 0.96 | Plan records permissive license mode and uses behavior invariants plus source refs only. | none |
| Weighted total | 1.00 | 0.95 | Passes the 0.92 threshold and no dimension is below 0.85. | none |

Harvest grounding:
| Field | Value |
|-------|-------|
| Harvest report | `docs/editor-test-harvester/portabletext/report.md` |
| Status | done |
| Harvest score | 0.94 |
| Source target | `../portabletext` |
| License mode | permissive; MIT evidence recorded in `../portabletext/LICENSE` by the harvest report |
| Output mode | durable |
| Inventory status | `inventory.md` exists; 502 classified rows; 321 runnable rows; 94 portable; 106 portable-mixed; 100 Plate-owned; 188 harness; 14 skip; 0 product-shell; 0 uncertain |
| Test-index status | `test-index.md` exists; 200 portable/portable-mixed indexed runnable files; 1944 anchors |
| Source-routing status | `source-routing.md` exists; 200 portable/portable-mixed files routed |
| Matrix families | 14 total: `PT-H01` through `PT-H12`, `PT-P01`, `PT-P02` |
| Inventory equation | 94 in-lane portable + 106 split portable-mixed + 100 Plate-owned + 188 harness + 14 skip = 502 |

Lane contract:
| Field | Value |
|-------|-------|
| Lane | `slate-v2` |
| Aliases | `slate`, `raw-slate`, `Slate v2 substrate` |
| Downstream skill | `.agents/skills/slate-plan/SKILL.md` |
| Owner boundary | Raw Slate owns document model operations, path/point/range behavior, root projection, DOM selection mapping, native input transport, clipboard fragments, drag/drop validity, void/object atomics, history/collab rebasing, and transaction ordering. |
| Exclusions | Plate owns schema/category admissibility, lists, annotations, decorators, comments, serializers, renderer definitions, toolbar/plugin ergonomics, Sanity bridge behavior, and docs/examples for product-level features. |
| Planning rule | This pass routes and plans only; execution starts only after user acceptance through the downstream lane skill. |

Full harvest row accounting:
Every row in `docs/editor-test-harvester/portabletext/source-routing.md` is accounted through its family bucket below. The row count for source-routing is 200. `PT-H10` is a matrix-only focus/event authority family with 0 direct source-routing files, so it is routed for raw API pressure without changing the 200-row count.

| Family | Family title | Files | Anchors | Harvest category | Lane accounting | Slate v2 decision | Source-routing status |
|--------|--------------|------:|--------:|------------------|-----------------|-------------------|-----------------------|
| PT-H01 | Selection boundary and projection | 24 | 178 | portable | in-lane | refactor-existing plus create exact root/object endpoint gaps | 24 of 200 routed |
| PT-H02 | Content roots and containers | 30 | 241 | portable-mixed | split | raw root projection and navigation in Slate; schema envelope to Plate | 30 of 200 routed |
| PT-H03 | Void and object boundary editing | 8 | 75 | portable | in-lane | refactor-existing plus browser rows for object-boundary gaps | 8 of 200 routed |
| PT-H04 | Insert, split, and break placement | 17 | 236 | portable | in-lane | refactor-existing placement matrix | 17 of 200 routed |
| PT-H05 | Delete and backspace matrix | 8 | 84 | portable | in-lane | refactor-existing plus object/root boundary gaps | 8 of 200 routed |
| PT-H06 | Clipboard and fragment serialization | 3 | 15 | portable-mixed | split | raw fragment/selection proof in Slate; serializer and matchers to Plate | 3 of 200 routed |
| PT-H07 | Drag/drop and drop target resolution | 4 | 33 | portable-mixed | split | native selection/drop validity in Slate; handles/product DnD to Plate | 4 of 200 routed |
| PT-H08 | History and remote collaboration rebasing | 6 | 54 | portable | in-lane | refactor-existing plus remote selection dedupe gaps | 6 of 200 routed |
| PT-H09 | IME and composition transport | 1 | 25 | portable | in-lane | refactor-existing; add only exact boundary transport gaps | 1 of 200 routed |
| PT-H10 | Focus, keyboard, and event authority | 0 | 0 | matrix-only raw pressure | split | raw event authority in Slate; Portable Text behavior names rejected | 0 direct rows; covered by owner search and H12 pressure |
| PT-H11 | Path, point, range, and operation core | 30 | 374 | portable | in-lane | covered/refactor-existing unless a root-aware variant is missing | 30 of 200 routed |
| PT-H12 | Behavior pipeline and extension ordering | 69 | 629 | portable-mixed | split | raw transaction/effect ordering only if accepted; plugin ergonomics to Plate | 69 of 200 routed |
| PT-P01 | Schema, renderers, annotations, decorators, and lists | 29 | 187 | plate-owned | out-of-lane | no raw Slate execution | inventory only; not in source-routing |
| PT-P02 | Serializers, toolbar, plugins, and product packages | 71 | 1007 | plate-owned | out-of-lane | no raw Slate execution | inventory only; not in source-routing |
| Harness bucket | Fixtures, helpers, generated setup | 188 | n/a | harness | skip | no editor-behavior execution owner | inventory only |
| Skip bucket | Non-editor/package rows | 14 | n/a | skip | skip | no editor-behavior execution owner | inventory only |

Row totals:
- Source-routing rows: 200 = 24 + 30 + 8 + 17 + 8 + 3 + 4 + 6 + 1 + 0 + 30 + 69.
- In-lane routed rows: 94 = `PT-H01` + `PT-H03` + `PT-H04` + `PT-H05` + `PT-H08` + `PT-H09` + `PT-H11`.
- Split routed rows: 106 = `PT-H02` + `PT-H06` + `PT-H07` + `PT-H12`; `PT-H10` has 0 direct source files but remains split API pressure.
- Out-of-lane inventory rows: 100 = `PT-P01` + `PT-P02`.
- Skipped inventory rows: 202 = 188 harness + 14 skip.
- Duplicate rows: 0; no family is used as a duplicate sink.
- Unresolved rows: 0.

Current Slate v2 owner coverage:
| Family | Live owner coverage found | Coverage verdict |
|--------|---------------------------|------------------|
| PT-H01 | `selection-rebase-contract.ts`, `projections-and-selection-contract.test.tsx`, `view-selection-contract.test.ts`, `selection-reconciler-contract.test.tsx`, browser selection tests, multi-root Playwright example | strong, add exact root/object endpoint rows only |
| PT-H02 | `content-root-navigation-contract.test.ts`, `root-interaction-resolver.test.ts`, `runtime-live-state-contract.test.ts`, `multi-root-document.test.ts`, projected clipboard tests | strong for navigation/projection, split schema policy out |
| PT-H03 | `slate-void-shell-contract.test.tsx`, `public-element-void-kind-contract.ts`, void transform fixtures, `editable-voids.test.ts`, generated stress rows | strong, object-boundary native selection still worth focused browser rows |
| PT-H04 | `transforms-contract.ts`, insertNodes/insertText/insertFragment/splitNodes fixture directories, operation contracts | broad fixture coverage, refactor into matrix if exact Portable Text pressure is scattered |
| PT-H05 | delete transform fixtures, `operations-contract.ts`, void delete fixtures, generated stress rows | broad fixture coverage, fill root/object edge cases after dedupe |
| PT-H06 | `clipboard-contract.ts`, `clipboard-boundary.test.ts`, `projected-clipboard-contract.test.ts`, `paste-html.test.ts` | raw fragment coverage exists, browser serializer policy split remains |
| PT-H07 | `root-interaction-resolver.test.ts`, root interaction tests, browser selection examples, generated editing stress utilities | unit coverage exists; exact drag/drop browser rows look weaker |
| PT-H08 | `collab-selection-stress-contract.ts`, `collab-document-state-contract.ts`, `projected-collab-substrate-contract.test.ts`, `collab-history-runtime-contract.ts` | strong, add exact dedupe/rebase rows only |
| PT-H09 | `playwright-ime.test.ts`, `composition-state-contract.test.ts`, `keyboard-input-strategy-contract.test.ts`, generated stress rows | strong enough to refactor-existing first |
| PT-H10 | `selection-controller-contract.test.ts`, `selection-side-effect-policy-contract.test.ts`, `focus-slate-editable-contract.test.ts`, `hotkeys.test.ts`, `keyboard-input-strategy-contract.test.ts` | raw authority coverage exists; reject Portable Text behavior naming |
| PT-H11 | `root-location-contract.ts`, `rooted-operation-contract.ts`, `generic-operation-contract.ts`, `operations-contract.ts`, `range-ref-contract.ts`, path/point/range fixture directories | strong, add only missing root-aware variants |
| PT-H12 | `transaction-contract.ts`, `transaction-target-runtime-contract.ts`, root operation middleware tests, runtime provider contracts | API pressure only; do not rename around Portable Text behavior API |

In-lane candidate matrix:
| Queue | Families | Lane reason | Action | Target owner | Proof route |
|-------|----------|-------------|--------|--------------|-------------|
| PT-SV2-Q1 | PT-H01, PT-H02 | Selection projection and content-root ordering are raw Slate substrate. | refactor-existing plus create exact root/object endpoint and nested-root fragment gaps | `packages/slate/test/selection-rebase-contract.ts`, `packages/slate-react/test/projections-and-selection-contract.test.tsx`, `view-selection-contract.test.ts`, `content-root-navigation-contract.test.ts`, `playwright/integration/examples/multi-root-document.test.ts` | focused package tests; Playwright only when DOM projection changes |
| PT-SV2-Q2 | PT-H03, PT-H04, PT-H05 | Void/object boundaries plus insert/delete placement are raw transforms and native selection runtime. | refactor-existing plus object-boundary browser rows for missing native behavior | `slate-void-shell-contract.test.tsx`, Slate transform fixtures, `transforms-contract.ts`, `operations-contract.ts`, `editable-voids.test.ts`, generated stress rows | focused Slate package tests plus browser proof for native caret/selection |
| PT-SV2-Q3 | PT-H06, PT-H07 | Clipboard fragments and drag/drop target validity cross raw DOM selection and projected path law. | split; create exact browser rows only after resolver/unit gaps are known | `projected-clipboard-contract.test.ts`, `clipboard-boundary.test.ts`, `paste-html.test.ts`, `root-interaction-resolver.test.ts`, browser example/stress rows | package tests plus Playwright clipboard/drag proof |
| PT-SV2-Q4 | PT-H08 | Remote selection and history rebasing are raw collaboration substrate. | refactor-existing plus exact selection emission dedupe rows if missing | `collab-selection-stress-contract.ts`, `collab-history-runtime-contract.ts`, `collab-document-state-contract.ts`, `projected-collab-substrate-contract.test.ts` | package tests |
| PT-SV2-Q5 | PT-H09, PT-H10 | IME/focus/keyboard authority belongs to browser input transport and selection authority. | refactor-existing; add exact boundary transport rows only | `playwright-ime.test.ts`, `composition-state-contract.test.ts`, `selection-controller-contract.test.ts`, `selection-side-effect-policy-contract.test.ts`, `hotkeys.test.ts` | slate-browser and slate-react focused tests; browser proof for native composition |
| PT-SV2-Q6 | PT-H11, PT-H12 | Root-aware path/operation semantics are raw; behavior pipeline only matters when reduced to transaction ordering/effects. | refactor-existing for operations; defer public API reshaping until a `slate-plan` API decision accepts it | `root-location-contract.ts`, `rooted-operation-contract.ts`, `generic-operation-contract.ts`, `operations-contract.ts`, `range-ref-contract.ts`, `transaction-contract.ts` | package tests; no Plate plugin API claim |
| PT-SV2-Q7 | PT-P01, PT-P02, harness, skip | Product rows and harness rows are not raw Slate execution work. | out-of-lane or skip | Plate packages/docs or no owner | no `Plate repo root` command |

Split rows:
| Family | Raw Slate-owned part | Out-of-lane part | Decision |
|--------|----------------------|------------------|----------|
| PT-H02 | Root ordering, projected selection, normalization boundaries, DOM projection. | Schema category, allowed child policy, Portable Text path/key serialization. | Split and execute only raw root behavior in `Plate repo root`. |
| PT-H06 | Clipboard fragment shape, object boundary projection, undo grouping over raw fragments. | HTML/markdown matchers, serializer output, MIME/product upload policy. | Split and keep serializers in Plate. |
| PT-H07 | Native selection/drop validity, self-drop suppression, projected drop target path. | Drag handles, product DnD UX, renderer data attributes. | Split and require browser proof for raw rows. |
| PT-H10 | Focus import, keyboard default-action authority, selection side-effect policy. | Portable Text behavior event names and plugin authoring model. | Split; keep raw event authority, reject API names. |
| PT-H12 | Transaction ordering, commit/effect boundaries if accepted by Slate API. | Plugin behavior ergonomics, action names, renderer/list/decorator pipeline. | Treat as architecture pressure, not implementation-by-copy. |

Excluded or skipped rows:
| Bucket | Count | Reason | Owner |
|--------|------:|--------|-------|
| PT-P01 | 29 | Schema, renderer definitions, annotations, decorators, comments, and lists are product/editor policy. | Plate |
| PT-P02 | 71 | Serializers, toolbar, plugins, media, Sanity bridge, and product packages are not raw Slate substrate. | Plate |
| Harness | 188 | Fixtures, helper tests, generated setup, and test scaffolding do not create portable editor behavior rows. | no execution owner |
| Skip | 14 | Non-editor/package rows do not pressure Slate v2. | no execution owner |

Coverage dedupe:
| Candidate | Existing coverage | Decision | Evidence |
|-----------|-------------------|----------|----------|
| IME base composition | `playwright-ime.test.ts`, `composition-state-contract.test.ts`, generated stress rows | refactor-existing first | Current owner search found direct IME/composition owners. |
| Basic insert/delete transforms | transform fixtures plus `transforms-contract.ts` and `operations-contract.ts` | refactor-existing before creating new files | Current owner search found broad insert/delete fixture directories. |
| Multi-root projection | `multi-root-document.test.ts`, `content-root-navigation-contract.test.ts`, projection tests | create only nested fragment/root gaps | Browser and package owners already exist. |
| Clipboard HTML paste | `projected-clipboard-contract.test.ts`, `clipboard-boundary.test.ts`, `paste-html.test.ts` | split raw fragment from Plate matcher policy | Current owner search found package and browser surfaces. |
| Collab history and selection | collab selection/document/history contracts | add only exact dedupe/rebase gaps | Existing collab substrate tests are live. |
| Transaction/behavior pipeline | `transaction-contract.ts`, root operation middleware tests | architecture decision before API surface changes | Portable Text behavior API names are not a raw Slate API model. |

Execution queue:
| ID | Action | Target | Proof kind | Focused verification | Notes |
|----|--------|--------|------------|----------------------|-------|
| PT-SV2-Q1 | Apply selection/content-root projection pressure from `PT-H01` and raw portions of `PT-H02`. | `packages/slate/test/selection-rebase-contract.ts`; `packages/slate-react/test/projections-and-selection-contract.test.tsx`; `view-selection-contract.test.ts`; `content-root-navigation-contract.test.ts`; `playwright/integration/examples/multi-root-document.test.ts` | unit plus browser if DOM projection changes | `cd Plate repo root && bun test ./packages/slate/test/selection-rebase-contract.ts ./packages/slate-react/test/projections-and-selection-contract.test.tsx ./packages/slate-react/test/view-selection-contract.test.ts ./packages/slate-react/test/content-root-navigation-contract.test.ts` | First slice; highest value after recent root/selection bugs. |
| PT-SV2-Q2 | Apply void/object insert/delete pressure from `PT-H03`, `PT-H04`, and `PT-H05`. | Slate transform fixtures; `transforms-contract.ts`; `operations-contract.ts`; `slate-void-shell-contract.test.tsx`; `editable-voids.test.ts`; generated stress rows | unit plus browser for native caret/selection | `cd Plate repo root && bun test ./packages/slate/test/transforms-contract.ts ./packages/slate/test/operations-contract.ts ./packages/slate-react/test/slate-void-shell-contract.test.tsx` | Do not let hidden spacer/zero-width nodes become behavior authority. |
| PT-SV2-Q3 | Apply clipboard/drag/drop raw portions from `PT-H06` and `PT-H07`. | `projected-clipboard-contract.test.ts`; `clipboard-boundary.test.ts`; `paste-html.test.ts`; `root-interaction-resolver.test.ts`; browser examples/stress | unit plus Playwright browser proof | `cd Plate repo root && bun test ./packages/slate-react/test/projected-clipboard-contract.test.ts ./packages/slate-dom/test/clipboard-boundary.test.ts ./packages/slate-react/test/root-interaction-resolver.test.ts` | Browser proof required before claiming drag/drop closure. |
| PT-SV2-Q4 | Apply remote selection/history rows from `PT-H08`. | `collab-selection-stress-contract.ts`; `collab-document-state-contract.ts`; `collab-history-runtime-contract.ts`; `projected-collab-substrate-contract.test.ts` | package unit | `cd Plate repo root && bun test ./packages/slate/test/collab-selection-stress-contract.ts ./packages/slate/test/collab-document-state-contract.ts ./packages/slate/test/collab-history-runtime-contract.ts ./packages/slate-react/test/projected-collab-substrate-contract.test.ts` | No provider-specific Yjs product policy in raw Slate. |
| PT-SV2-Q5 | Apply IME/focus/keyboard pressure from `PT-H09` and `PT-H10`. | `playwright-ime.test.ts`; `composition-state-contract.test.ts`; `selection-controller-contract.test.ts`; `selection-side-effect-policy-contract.test.ts`; `focus-slate-editable-contract.test.ts`; `hotkeys.test.ts` | browser input plus unit | `cd Plate repo root && bun test ./packages/slate-browser/test/core/playwright-ime.test.ts ./packages/slate-react/test/composition-state-contract.test.ts ./packages/slate-react/test/selection-controller-contract.test.ts ./packages/slate-react/test/selection-side-effect-policy-contract.test.ts ./packages/slate-dom/test/hotkeys.test.ts` | Synthetic jsdom rows do not prove mobile/IME claims. |
| PT-SV2-Q6 | Apply operation/path/core pressure from `PT-H11` and decide raw transaction pressure from `PT-H12`. | `root-location-contract.ts`; `rooted-operation-contract.ts`; `generic-operation-contract.ts`; `operations-contract.ts`; `range-ref-contract.ts`; `transaction-contract.ts` | package unit plus API decision | `cd Plate repo root && bun test ./packages/slate/test/root-location-contract.ts ./packages/slate/test/rooted-operation-contract.ts ./packages/slate/test/generic-operation-contract.ts ./packages/slate/test/operations-contract.ts ./packages/slate/test/range-ref-contract.ts ./packages/slate/test/transaction-contract.ts` | Transaction/effect API changes need an accepted `slate-plan` decision first. |
| PT-SV2-Q7 | Route Plate-owned and skipped rows out of Slate v2 execution. | Plate packages/docs or no owner | no raw Slate proof | no `Plate repo root` command | `PT-P01`, `PT-P02`, harness, and skip rows do not block raw Slate execution. |

Issue and claim accounting:
- Fixed issues: none from this plan.
- Improved issues: none from this plan.
- Related issues: unchanged; this plan routes harvested Portable Text test pressure only.
- PR reference: unchanged; no claim or proof status changed.
- Issue ledger sync: no ledger update applies. A later execution pass must sync claim ledgers only if it changes a public issue/claim status with exact proof.

Downstream lane application:
| Gate | Status | Evidence |
|------|--------|----------|
| Downstream skill read | complete | `.agents/skills/slate-plan/SKILL.md` was read before routing decisions were finalized. |
| Current source wins | complete | Live `Plate repo root` owner searches were used rather than stale plan claims. |
| Raw Slate stays unopinionated | complete | Schema/list/plugin/serializer/toolbar/Sanity rows are excluded or split to Plate. |
| Browser proof honesty | complete | Clipboard, drag/drop, DOM projection, native selection, and IME rows carry browser proof routes where package tests are insufficient. |
| Planning-only boundary | complete | This plan records no implementation/test/example/package/build edits. |
| Breaking API caution | complete | `PT-H12` transaction/effect pressure requires an accepted Slate API decision before execution. |

Accepted-plan execution handoff:
- read-first plan path: `docs/plans/2026-05-29-slate-v2-portabletext-harvest-plan.md`
- requested lane: `slate-v2`
- exact execution queue IDs: `PT-SV2-Q1`, `PT-SV2-Q2`, `PT-SV2-Q3`, `PT-SV2-Q4`, `PT-SV2-Q5`, `PT-SV2-Q6`, with `PT-SV2-Q7` excluded from raw Slate implementation.
- implementation boundaries: a later accepted execution pass may edit `Plate repo root`; this planning pass edits only this plan. Keep Portable Text schema/list/plugin/product policy out of raw Slate.
- focused verification commands: use the command in each execution queue row after touching that row's owners.
- broad final gate: `cd Plate repo root && bun check`.
- browser/release-quality gate: use `cd Plate repo root && bun check:full` only when browser architecture or release-quality browser claims change.
- issue/claim sync rule: sync issue/claim ledgers only when the later execution pass changes a claim with proof.
- stop rule: stop and reroute if a row requires schema/category/list/plugin/serializer/product semantics instead of raw editor substrate behavior.

Execution progress:
| Queue | Status | Evidence | Next owner |
|-------|--------|----------|------------|
| PT-SV2-Q1 | complete | Added a focused Slate React regression proving nested content roots inside another content root are ordered as visible sibling blocks when projected selection enters and exits the nested root. | done |
| PT-SV2-Q2 | complete | Added a focused Slate transform regression proving `insertText` over a selection spanning a block void removes the void boundary and leaves one valid collapsed text selection. | done |
| PT-SV2-Q3 | complete | Fixed projected clipboard to serialize visible repeated-root owner copies while keeping repeated-root mutation commands rejected; verified clipboard package tests and Chromium copy/drag/drop browser rows. | done |
| PT-SV2-Q4 | complete | Discharged as already covered by live collab/history contracts for remote selection rebasing, remote state patch replay, history skip metadata, projected remote-paint policy, and runtime ID rebasing. | done |
| PT-SV2-Q5 | complete | Discharged as already covered by live IME/composition, selection import/export authority, focus side-effect, hotkey, and keyboard-input strategy contracts, with focused Chromium IME proof. | done |
| PT-SV2-Q6 | complete | Discharged as already covered by live root-location, rooted-operation, operation replay/inversion, range-ref, transaction, command middleware, and afterCommit contracts. | done |

Execution evidence:
- 2026-05-29 `PT-SV2-Q1`: edited `packages/slate-react/test/content-root-navigation-contract.test.ts`.
- Test added: `orders nested content roots inside content roots as visible sibling blocks`.
- Focused Slate package verification passed: `cd Plate repo root && bun test ./packages/slate/test/selection-rebase-contract.ts` -> 5 pass, 0 fail.
- Focused Slate React verification passed: `cd Plate repo root && bun --filter slate-react test:vitest -- test/view-selection-contract.test.ts test/content-root-navigation-contract.test.ts test/projections-and-selection-contract.test.tsx` -> 3 files passed, 42 tests passed.
- Slate React typecheck passed: `cd Plate repo root && bun --filter slate-react typecheck`.
- Browser proof not run for Q1 because this slice added package-level projection coverage only and did not change DOM projection runtime code.
- Issue/reference sync unchanged: Q1 adds harvested coverage only and makes no public issue claim.
- Autoreview not required for Q1: the slice is a focused test-only coverage addition with no implementation diff.
- 2026-05-29 `PT-SV2-Q2`: edited `packages/slate/test/transforms-contract.ts`.
- Test added: `insertText replaces a selection spanning a block void without keeping a void anchor`.
- Focused Slate transform/operation verification passed: `cd Plate repo root && bun test ./packages/slate/test/transforms-contract.ts ./packages/slate/test/operations-contract.ts` -> 43 pass, 0 fail.
- Focused Slate React void-shell verification passed: `cd Plate repo root && bun --filter slate-react test:vitest -- test/slate-void-shell-contract.test.tsx` -> 1 file passed, 1 test passed.
- Slate package typecheck passed: `cd Plate repo root && bun --filter slate typecheck`.
- Browser proof not run for Q2 because this slice added package-level transform coverage only and did not change DOM/native void runtime code.
- Issue/reference sync unchanged: Q2 adds harvested coverage only and makes no public issue claim.
- Autoreview not required for Q2: the slice is a focused test-only coverage addition with no implementation diff.
- 2026-05-29 `PT-SV2-Q3`: edited `packages/slate-react/src/editable/projected-clipboard.ts` and `packages/slate-react/test/projected-clipboard-contract.test.ts`.
- Test added: `serializes repeated content-root owners as visible clipboard fragments`.
- Behavior fixed: projected clipboard resolves fragment ranges directly from visible selection segments, so repeated owner copies of the same child root can be copied in visible order; mutation commands still use `createProjectedSelectionTarget` and keep repeated-root ambiguity rejected.
- Focused projected clipboard/root interaction verification passed: `cd Plate repo root && bun --filter slate-react test:vitest -- test/projected-clipboard-contract.test.ts test/root-interaction-resolver.test.ts` -> 2 files passed, 13 tests passed.
- Focused Slate DOM/clipboard verification passed: `cd Plate repo root && bun test ./packages/slate-dom/test/clipboard-boundary.test.ts ./packages/slate/test/clipboard-contract.ts` -> 29 pass, 0 fail.
- Slate React typecheck passed: `cd Plate repo root && bun --filter slate-react typecheck`.
- Chromium projected clipboard proof passed: `cd Plate repo root && PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/synced-blocks.test.ts --project=chromium --grep "copies a projected selection from visible order"` -> 1 passed.
- Chromium drag/drop proof passed: `cd Plate repo root && PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/synced-blocks.test.ts playwright/integration/examples/editable-voids.test.ts --project=chromium --grep "mouse drag can select from p1 through repeated synced roots to p2|drops HTML payload inside same-runtime child root without stealing outer selection"` -> 2 passed.
- Issue/reference sync unchanged: Q3 changes harvested behavior coverage and clipboard substrate only, with no public issue claim.
- Autoreview initially found two accepted P2 root chrome coordinate defects in `root-interaction-controller.ts`: nested editor strings could be hit-tested against the wrong root, and RTL line-edge clicks mapped physical right to logical end.
- Autoreview fixes applied: extracted coordinate placement into `slate-string-coordinate-placement.ts`, scoped root chrome strings to the owning editable root, mapped physical line edges through computed text direction, and added focused coverage in `slate-string-coordinate-placement.test.ts`.
- Autoreview-fix verification passed: `cd Plate repo root && bun --filter slate-react test:vitest -- test/slate-string-coordinate-placement.test.ts test/root-interaction-resolver.test.ts test/use-slate-root-chrome.test.tsx` -> 3 files passed, 16 tests passed.
- Autoreview-fix typecheck passed: `cd Plate repo root && bun --filter slate-react typecheck`.
- Affected projected clipboard/root interaction verification passed after the autoreview fixes: `cd Plate repo root && bun --filter slate-react test:vitest -- test/projected-clipboard-contract.test.ts test/root-interaction-resolver.test.ts test/slate-string-coordinate-placement.test.ts test/use-slate-root-chrome.test.tsx` -> 4 files passed, 20 tests passed.
- Affected Chromium copy/drag/drop proof passed after the autoreview fixes: `cd Plate repo root && PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/synced-blocks.test.ts playwright/integration/examples/editable-voids.test.ts --project=chromium --grep "copies a projected selection from visible order|mouse drag can select from p1 through repeated synced roots to p2|drops HTML payload inside same-runtime child root without stealing outer selection"` -> 3 passed.
- Autoreview rerun after the root chrome fixes returned clean: `cd Plate repo root && /Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local` -> clean, no accepted/actionable findings.
- 2026-05-29 `PT-SV2-Q4`: no `Plate repo root` edits; row discharged as existing coverage after reading the collab/history owners.
- Existing coverage confirmed: `collab-selection-stress-contract.ts` covers high-QPS remote selection rebasing, same-offset contention, suffix insert stability, split/merge rebasing, and remove-node stale path resolution.
- Existing coverage confirmed: `collab-document-state-contract.ts` covers shared state patch replay and local-only state exclusion from collab payloads.
- Existing coverage confirmed: `collab-history-runtime-contract.ts` covers remote metadata, history skip, three-peer convergence, paste replay, remote rebase of undo/redo batches, bookmark rebasing, and runtime ID locality under remote remove/move.
- Existing coverage confirmed: `projected-collab-substrate-contract.test.ts` covers root-keyed projected lifecycle operations and remote selection paint policy without serializing projection owners.
- Focused Slate collab/history verification passed: `cd Plate repo root && bun test ./packages/slate/test/collab-selection-stress-contract.ts ./packages/slate/test/collab-document-state-contract.ts ./packages/slate/test/collab-history-runtime-contract.ts` -> 16 pass, 0 fail.
- Focused Slate React projected collab verification passed: `cd Plate repo root && bun --filter slate-react test:vitest -- test/projected-collab-substrate-contract.test.ts` -> 1 file passed, 3 tests passed.
- Issue/reference sync unchanged: Q4 makes no public issue claim and required no implementation change.
- Autoreview not required for Q4: no implementation diff.
- 2026-05-29 `PT-SV2-Q5`: no `Plate repo root` edits; row discharged as existing coverage after reading the IME/focus/keyboard owners.
- Existing coverage confirmed: `playwright-ime.test.ts` covers synthetic composition transport against the resolved editor surface and one-time composition key event installation.
- Existing coverage confirmed: `composition-state-contract.test.ts` covers read-only compositionstart/update/end authority without mutating editor text.
- Existing coverage confirmed: `selection-controller-contract.ts` covers model-vs-DOM selection import/export policy, nested editable ownership, native selectionchange authority, changed expanded DOM selection import, and native input preference guards.
- Existing coverage confirmed: `selection-side-effect-policy-contract.ts` covers remote collaboration metadata suppressing DOM selection, scroll, and focus side effects.
- Existing coverage confirmed: `focus-slate-editable-contract.test.ts` covers focus without exporting a model selection over an active projected view selection.
- Existing coverage confirmed: `keyboard-input-strategy-contract.test.ts` covers read-only keyboard authority, model-owned key commands, history focus repair across roots, hidden boundary arrow navigation, shift extension, word extension, multiple hidden ranges, and line movement over hidden ranges.
- Existing coverage confirmed: `hotkeys.test.ts` covers semantic key matching, physical-code fallback only for non-ASCII layouts, optional modifiers, platform `mod`, modifier-only keys, and AltGraph exclusion.
- Focused slate-browser IME helper verification passed: `cd packages/browser && bun test test/core/playwright-ime.test.ts` -> 2 pass, 0 fail.
- Focused Slate React selection/keyboard verification passed: `cd Plate repo root && bun --filter slate-react test:vitest -- test/composition-state-contract.test.ts test/selection-controller-contract.test.ts test/selection-side-effect-policy-contract.test.ts test/focus-slate-editable-contract.test.ts test/keyboard-input-strategy-contract.test.ts` -> 5 files passed, 44 tests passed.
- Focused slate-dom hotkey verification passed: `cd packages/slate-dom && bun test test/hotkeys.test.ts` -> 15 pass, 0 fail.
- Chromium IME proof passed: `cd Plate repo root && PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/dom-coverage-boundaries.test.ts --project=chromium --grep "keeps hovering toolbar hidden during IME composition|commits IME composition while DOM coverage boundaries are hidden"` -> 2 passed.
- Issue/reference sync unchanged: Q5 makes no public issue claim and required no implementation change.
- Autoreview not required for Q5: no implementation diff.
- 2026-05-29 `PT-SV2-Q6`: no `Plate repo root` edits; row discharged as existing coverage after reading operation/path/transaction owners.
- Existing coverage confirmed: `root-location-contract.ts` covers implicit/explicit root resolution for operations, points, ranges, and selection patches.
- Existing coverage confirmed: `rooted-operation-contract.ts` covers root-explicit operations, root-local point/range transforms, root-local refs, sibling root split/merge isolation, explicit non-main range edits, root lifecycle operations, root validation, selection operation inversion, and view-root routing.
- Existing coverage confirmed: `operations-contract.ts` covers replace operations, invalid replay rollback, ref rebasing, move semantics, selection rebasing over split/merge/remove operations, and protected raw node property checks.
- Existing coverage confirmed: `range-ref-contract.ts` covers commit-time ref publication, affinity, move/split/merge rebasing, rollback survival, rootless view-root refs, explicit non-main roots, and matching-root invalidation only.
- Existing coverage confirmed: `transaction-contract.ts` covers batch/manual parity, draft visibility, one publish per transaction, rollback, command middleware, commit metadata, command priority, extension registry cleanup, transaction groups, and commit listener delivery.
- Existing coverage confirmed: `update-after-commit-contract.ts` covers update-local afterCommit effects, no-commit/drop-on-rollback behavior, nested update ordering, snapshot capture before later updates, onCommit ordering, view-scoped snapshots, and stale registration rejection.
- Focused operation/path/transaction verification passed: `cd Plate repo root && bun test ./packages/slate/test/root-location-contract.ts ./packages/slate/test/rooted-operation-contract.ts ./packages/slate/test/generic-operation-contract.ts ./packages/slate/test/operations-contract.ts ./packages/slate/test/range-ref-contract.ts ./packages/slate/test/transaction-contract.ts ./packages/slate/test/update-after-commit-contract.ts` -> 108 pass, 0 fail.
- Issue/reference sync unchanged: Q6 makes no public issue claim and required no implementation change.
- Autoreview not required for Q6: no implementation diff.
- 2026-05-29 closeout: broad `bun check` initially failed after lint/typecheck/Bun tests on stale React contract inventories, package peer floor drift, and a pagination example full-value replacement after mount.
- Broad-gate fixes applied: aligned `slate-dom` and `slate-react` peer floors to the live sibling `0.124.1` packages, updated explicit ownership inventories for the current selector/repair owners, and rewrote pagination stress-page updates to remove/insert stress blocks instead of calling `tx.value.replace`.
- Broad-gate focused verification passed: `cd Plate repo root && bun --filter slate-react test:vitest -- test/kernel-authority-audit-contract.test.ts test/surface-contract.test.tsx` -> 2 files passed, 39 tests passed.
- Broad-gate focused typecheck passed: `cd Plate repo root && bun --filter slate-react typecheck`.
- Broad-gate site typecheck passed: `cd Plate repo root && bun typecheck:site`.
- Broad final gate passed: `cd Plate repo root && bun check` -> lint passed, package/site/root typecheck passed, 1260 Bun tests passed, 37 slate-layout tests passed, and 54 slate-react Vitest files passed with 483 tests.
- Final autoreview passed after broad-gate fixes: `cd Plate repo root && /Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local` -> clean, no accepted/actionable findings.
- Issue/reference sync unchanged at closeout: implementation and coverage changes are harvested substrate work only and make no public issue claim.
- Plan hygiene and mechanical check passed after execution updates: `cd /Users/zbeyens/git/plate-2 && node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-29-slate-v2-portabletext-harvest-plan.md` -> complete.

Findings:
- Portable Text is a good source of behavior pressure, not an API model.
- The best Slate steals are root-aware selection projection, object-boundary insert/delete, self-drop suppression, raw fragment/clipboard behavior, IME transport, remote selection rebasing, and operation/path determinism.
- The worst move would be copying Portable Text schema gates or behavior API names into raw Slate. That would make Slate opinionated in the wrong layer.
- `PT-H12` is useful pressure for transaction/effect boundaries, but only after an explicit `slate-plan` API decision. Do not sneak a public behavior API in through tests.

Decisions and tradeoffs:
- Run `PT-SV2-Q1` first because recent bugs clustered around multi-root projection and selection traversal.
- Keep `PT-H02`, `PT-H06`, `PT-H07`, `PT-H10`, and `PT-H12` split instead of pretending mixed rows are all raw Slate.
- Treat `PT-P01` and `PT-P02` as Plate backlog, not Slate debt.
- Prefer refactoring existing Slate v2 tests before adding new files because current coverage is already broad and scattered.
- Require browser proof for drag/drop, clipboard DOM, native selection, and IME claims. Package tests alone are not enough there.

Error attempts:
| Error / failed attempt | Count | Different move | Resolution |
|------------------------|------:|----------------|------------|
| Scratchpad helper generated the older UTC-dated path and refused to overwrite `docs/plans/2026-05-28-slate-v2-portabletext-harvest-plan.md`. | 1 | Keep the older plan intact and write the required `2026-05-29` path explicitly. | New dated plan created at the objective path. |
| Older plan counted 16 behavior rows and stale 211/1979 test-index numbers. | 1 | Use the fresh 2026-05-29 harvest report and source-routing appendix. | This plan uses 14 families, 200 indexed portable/mixed files, and 1944 anchors. |

Verification evidence:
- `test -f docs/editor-test-harvester/portabletext/inventory.md && test -f docs/editor-test-harvester/portabletext/test-index.md && test -f docs/editor-test-harvester/portabletext/source-routing.md` returned `harvest-files-ok`.
- `rg --files` over `Plate repo root` found current owner anchors for selection, roots, voids, clipboard, drag/drop/root interaction, collab/history, IME, focus/keyboard, operations, and transaction contracts.
- `node -e "const p=require('./Plate repo root/package.json'); ..."` confirmed `bun check`, `bun check:full`, focused package tests, slate-browser tests, and integration-local commands exist.
- Required section grep passed for Harvest grounding, Lane contract, Full harvest row accounting, In-lane candidate matrix, Execution queue, Downstream lane application, and Accepted-plan execution handoff.
- Placeholder hygiene grep passed with no template markers, progress-state markers, or placeholder-only lines.
- Autogoal mechanical completion passed: `[autogoal] complete: docs/plans/2026-05-29-slate-v2-portabletext-harvest-plan.md`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closure verification for the `slate-v2` Portable Text harvest plan. |
| Where am I going? | Run section greps, placeholder scan, autogoal completion check, then close the active goal if all requirements pass. |
| What is the goal? | A dated execution-grade planning-only Slate v2 harvest plan from Portable Text with every row routed and no implementation edits. |
| What have I learned? | Portable Text strongly pressures raw roots, projection, object boundaries, IME, clipboard, drag/drop, collab/history, and operation semantics; product schema and plugin policy must stay out of raw Slate. |
| What have I done? | Read the harvest report and routing appendix, searched current `Plate repo root` owner coverage, wrote row accounting, split decisions, execution queue, and accepted-plan handoff. |

Open risks:
- Execution risk remains for browser-heavy rows: drag/drop, clipboard DOM, native selection over roots/voids, and IME. This plan names proof routes but does not execute them.
- `PT-H12` could become API churn if treated as Portable Text behavior API adoption. The plan constrains it to raw transaction/effect ordering only after an accepted `slate-plan` API decision.
- Existing coverage is broad and scattered. The execution pass should refactor or name current contracts before adding duplicate tests.
