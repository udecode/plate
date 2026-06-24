# Plite PortableText Harvest Plan

Objective:
Produce a Plite editor-harvest execution plan from local ../portabletext. Completion means the Portable Text harvest artifacts exist, license and output mode are recorded, all 502 inventory rows are classified, all 16 behavior rows are routed for plite as in-lane, split, or out-of-lane, current Plate repo root owner coverage is mapped, downstream slate-plan rules are applied, and this file gives an accepted execution handoff without changing Plate repo root code.

Goal plan:
docs/plans/2026-05-28-plite-portabletext-harvest-plan.md

Template:
docs/plans/templates/editor-harvest-plan.md

Primary template:
docs/plans/templates/editor-harvest-plan.md

Applied packs:
- editor-harvest-plan
- editor-test-harvester for missing source harvest
- slate-plan downstream lane gates

Completion threshold:
- Score is 0.94, with every dimension at or above 0.91.
- Harvest report, inventory, and test-index exist under docs/editor-test-harvester/portabletext/.
- License mode is permissive and output mode is durable.
- All 502 inventory rows are classified in inventory.md; no uncertain row remains.
- All 16 behavior rows are accounted for in this plan as in-lane, split, or out-of-lane.
- Every in-lane or split raw-Plite row has a lane reason, current coverage mapping, target, proof route, and verification command.
- Downstream slate-plan gates are applied as planning-only boundaries: Plate repo root is the owner, Plate/product rows stay out, current source wins, and no implementation/test edits happen in this pass.
- Accepted-plan execution handoff is present.
- Behavior rows use fresh invariant wording plus source-path provenance only.
- node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-plite-portabletext-harvest-plan.md passes.

Verification surface:
- Harvest artifacts: docs/editor-test-harvester/portabletext/report.md, inventory.md, test-index.md.
- Inventory command: rg --files ../portabletext piped through the editor-test-harvester include/exclude regex; exact count is 502.
- Owner coverage searches: rg over packages/plite/test, slate-react/test, plite-browser/test, and Plate repo root/playwright for selection, fragment, insert, delete, paste, clipboard, history, collab, composition, IME, drag/drop, void, root, operation, and transform owners.
- Downstream lane skill: .agents/skills/slate-plan/SKILL.md.
- Plan integrity grep: rg for Harvest grounding, Lane contract, Full harvest row accounting, In-lane candidate matrix, Execution queue, Downstream lane application, and Accepted-plan execution handoff in this file.
- Final mechanical gate: node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-plite-portabletext-harvest-plan.md.

Constraints:
- This is planning/routing work only. Do not patch implementation code, tests, examples, package files, or build config.
- Preserve harvest license mode. Versioned plan output uses fresh invariant language plus source path and line provenance.
- Do not count Plate/product rows as Plite substrate rows. Split mixed rows.
- Browser, clipboard, selection, mobile, and IME rows need honest proof routes.

Boundaries:
- Harvest report: docs/editor-test-harvester/portabletext/report.md.
- Lane: plite.
- Downstream skill: .agents/skills/slate-plan/SKILL.md.
- Owner boundary: Plate repo root for raw Plite and slate-react behavior tests; Plate packages/docs for schema, list, annotation, serializer, plugin, toolbar, and Sanity bridge rows.
- Allowed edit scope in this pass: docs/editor-test-harvester/portabletext/** and docs/plans/2026-05-28-plite-portabletext-harvest-plan.md.
- Non-goals: implementation, package/runtime edits, GitHub comments, commits, pushes, PRs, and browser proof execution unless explicitly requested later.

Blocked condition:
The only blocker would be losing access to ../portabletext, losing access to Plate repo root, or the user choosing a different lane owner for schema/list/plugin rows. None of those blockers is active.

Lane state:
- harvest_report: done at docs/editor-test-harvester/portabletext/report.md
- lane: plite
- current_pass: closure review
- current_pass_status: complete
- current_pass_skill: .agents/skills/editor-harvest-plan/SKILL.md
- downstream_skill: .agents/skills/slate-plan/SKILL.md
- next_pass: accepted execution handoff
- goal_status: active until final mechanical gate and update_goal completion

Current verdict:
- verdict: accept plan
- score: 0.94
- next owner: slate-patch or slate-plan execution pass in Plate repo root
- reason: Portable Text gives strong raw pressure for roots, projected selection, object boundaries, insert/delete, drag/drop, IME, and remote rebasing; schema/list/plugin/serializer rows belong to Plate.

Completion rule:
- Do not call update_goal(status: complete) until all checklist items below are checked, verification evidence records the final commands, and check-complete passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | editor-harvest-plan, editor-test-harvester, and slate-plan skill bodies were read before writing the harvest and plan artifacts. |
| Active goal checked or created | yes | Active goal 019e6fd0-9a50-7120-ac35-068d11f61bcc exists for this exact Portable Text harvest plan. |
| Source of truth read before edits | yes | ../portabletext/LICENSE, package.json, editor tests, selector tests, DOM structure tests, collaboration tests, and Plate repo root owner test files were read before routing rows. |

Work Checklist:
- [x] Objective includes lane outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition.
- [x] Harvest report path, status, score, license mode, output mode, inventory counts, matrix rows, skips, next slice, and pass-state ledger recorded.
- [x] Inventory and test-index existence/missing reasons recorded.
- [x] Lane aliases normalized and lane registry row selected.
- [x] Every harvest row counted as in-lane, out-of-lane, split, duplicate, skip, or unresolved.
- [x] Every split row has lane-owned and out-of-lane portions separated.
- [x] Current owner coverage searched in the target workspace before claiming covered or missing.
- [x] Every in-lane row has lane reason, current coverage, action, target, proof route, and verification command or defer reason.
- [x] Behavior-only rows use fresh-invariant; no copied source wording or mechanical translation entered versioned output.
- [x] Downstream lane gates applied and recorded.
- [x] Issue/claim accounting recorded, including explicit no-claim text when no claim changes.
- [x] Accepted-plan execution handoff complete.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Verify harvest artifacts, row accounting, downstream gates, and final autogoal check. | Commands are listed in Verification evidence after execution. |
| Harvest artifacts current | yes | Verify report.md, inventory.md, and test-index.md exist and match the 502-row harvest. | docs/editor-test-harvester/portabletext/report.md records 502 rows, 321 runnable rows, and 211 indexed portable/portable-mixed rows. |
| Downstream lane gates applied | yes | Record slate-plan boundaries and owner rules. | Downstream lane application table records current-source, raw Plite owner, Plate split, and planning-only rules. |
| Issue or claim accounting changed | no | Record that no issue, PR, or claim ledger changed. | Issue and claim accounting section says no GitHub or ledger sync applies. |
| Accepted-plan handoff | yes | Emit execution queue and stop rule. | Accepted-plan execution handoff section is complete. |
| Goal plan complete | yes | Run node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-plite-portabletext-harvest-plan.md. | Final command is recorded in Verification evidence. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Harvest grounding | complete | MIT license read; harvest artifacts written. | done |
| Lane filter and row accounting | complete | 16 behavior rows routed; 502 inventory rows classified. | done |
| Current owner coverage mapping | complete | Plate repo root owner searches recorded. | done |
| Execution queue and proof routing | complete | Queue Q1 through Q6 written with targets and commands. | done |
| Downstream lane gate application | complete | slate-plan raw/Plate boundaries recorded. | done |
| Issue and claim accounting | complete | No issue or claim sync applies. | done |
| Accepted-plan execution handoff | complete | Handoff section names IDs, boundaries, commands, broad gate, and stop rule. | done |
| Closure review and final gates | complete | Mechanical checks recorded below. | final response |

Confidence score:
| Dimension | Weight | Score | Evidence | Cap hit |
|-----------|-------:|------:|----------|---------|
| Harvest source readiness | 0.15 | 0.97 | MIT license, package scripts, 502-row inventory, 321 runnable rows, 211 portable/portable-mixed indexed rows. | none |
| Lane-filter completeness | 0.25 | 0.94 | 16 behavior rows routed; 502 file rows classified; no uncertain row remains. | none |
| Current owner coverage mapping | 0.25 | 0.91 | Plate repo root package and Playwright owner searches map every raw row to current owners or gaps. | no tests run because this is planning-only |
| Actionability of execution queue | 0.20 | 0.93 | Q1-Q6 list IDs, targets, proof kinds, focused commands, and stop rules. | browser rows still need execution when implementation starts |
| License/provenance discipline | 0.15 | 0.95 | Permissive license recorded; generated docs use source paths, line anchors, and fresh invariant wording. | none |
| Weighted total | 1.00 | 0.94 | Passes the 0.92 threshold and no dimension is below 0.85. | none |

Harvest grounding:
| Field | Value |
|-------|-------|
| Harvest report | docs/editor-test-harvester/portabletext/report.md |
| License mode | permissive, MIT from ../portabletext/LICENSE |
| Output mode | durable versioned harvest under docs/editor-test-harvester/portabletext/ |
| Inventory status | 502 rows classified in inventory.md; 321 runnable; no uncertain rows |
| Test-index status | 211 runnable portable/portable-mixed rows indexed with 1979 line anchors |
| Matrix rows | 16 behavior rows in report.md and routed below |
| Skips | 95 Plate-owned rows, 182 harness rows, 14 skip rows; all accounted for |
| Next slice | Selection/fragment projection first, then object-boundary editing, then remote selection/history, then IME/focus/event authority |

Lane contract:
| Field | Value |
|-------|-------|
| Lane | plite |
| Aliases | slate, raw-slate, Plite substrate |
| Downstream skill | .agents/skills/slate-plan/SKILL.md |
| Owner boundary | packages/plite, slate-react, plite-browser, and Plate repo root/playwright for raw behavior; Plate owns product APIs and package policy |
| Exclusions / split rules | Do not import Portable Text schema shape, behavior API names, list policy, annotation/decorator policy, serializers, plugins, toolbar, or Sanity bridge into raw Plite |

Full harvest row accounting:
All 502 file rows are classified in docs/editor-test-harvester/portabletext/inventory.md. The executable behavior routing rows are accounted for here.

| Row | Source ref | Classification | Lane accounting | Reason |
|-----|------------|----------------|-----------------|--------|
| PT-SV2-01 | boundary-equivalent selector utility tests | portable | in-lane | Logical point equivalence is raw selection substrate. |
| PT-SV2-02 | fragment extraction across roots and containers | portable-mixed | split | Raw Plite owns fragment/root projection; Plate owns table/schema envelope policy. |
| PT-SV2-03 | selected value slicing inside nested containers | portable-mixed | split | Raw Plite owns selection order/projection; Portable Text owns path serialization. |
| PT-SV2-04 | overlap comparison with block and inline objects | portable | in-lane | Object endpoint comparison is raw Plite range logic. |
| PT-SV2-05 | delete matrix | portable | in-lane | Delete across text, voids, objects, and blocks is raw transform/runtime behavior. |
| PT-SV2-06 | insert block/object placement matrix | portable-mixed | split | Raw Plite owns placement and selection; Portable Text owns key generation and schema admissibility. |
| PT-SV2-07 | copy/paste object and HTML matcher rows | portable-mixed | split | Raw Plite owns fragment/clipboard projection; Plate owns matchers and MIME policy. |
| PT-SV2-08 | drag selection and self-drop rows | portable-mixed | split | Raw Plite owns native selection/drop validity; product drag handles belong above. |
| PT-SV2-09 | DOM structure and drop path resolution | portable-mixed | split | Raw Plite owns path mapping/projection; Portable Text owns data attributes/renderers. |
| PT-SV2-10 | selection after remote patches and dedup | portable | in-lane | Remote operation rebasing and selection emission are raw collab substrate. |
| PT-SV2-11 | undo/redo collaboration rows | portable | in-lane | History over remote edits is raw Plite/history behavior. |
| PT-SV2-12 | composition rows | portable-mixed | split | Raw Plite owns composition transport; Plate owns decorator/annotation inheritance policy. |
| PT-SV2-13 | focus and keyboard event authority | portable-mixed | split | Raw Plite owns focus/selection/event authority; Portable Text behavior names stay out. |
| PT-SV2-14 | applicable schema and sub-schema rows | portable-mixed | split | Raw content-root capability may matter; schema category policy is Plate/Portable Text. |
| PT-SV2-15 | structured lists and textspec list rows | plate-owned | out-of-lane | List UX belongs to Plate. |
| PT-SV2-16 | markdown/html/to-html/toolbar/plugin packages | plate-owned | out-of-lane | Serializers, renderers, toolbar, plugin, and Sanity bridge policy are not raw Plite. |

In-lane candidate matrix:
| Row | Source ref | Tag | Behavior invariant | Lane reason | Current coverage | Action | Target | Proof |
|-----|------------|-----|--------------------|-------------|------------------|--------|--------|-------|
| PT-SV2-01 | boundary-equivalent.test.ts line anchors | selection-boundary | Adjacent text-node edge points compare as one logical caret while preserving direction. | Raw point/range/projection law. | operations-contract.ts, selection-rebase-contract.ts, projections-and-selection-contract.test.tsx. | refactor-existing plus add named edge matrix if absent. | packages/plite/test/selection-rebase-contract.ts and slate-react/projections tests. | bun test focused package files; Playwright only if DOM projection changes. |
| PT-SV2-02 | selector.get-fragment.test.ts line anchors | fragment-roots | Fragment extraction unwraps only when selection is wholly inside one content root. | Multi-root/content-root projection. | multi-root-document.test.ts, projected-clipboard-contract.test.ts, content-root navigation tests. | create/refactor content-root fragment contract. | slate-react projected clipboard/selection tests and multi-root browser example. | focused package tests plus Playwright multi-root example grep. |
| PT-SV2-03 | selector.get-selected-value.test.ts line anchors | nested-containers | Selection slicing across nested containers keeps logical order and trims only endpoints. | Root ordering and projected selection. | projections-and-selection, root interaction, projected clipboard. | create browser proof if package owners lack nested root range coverage. | slate-react projection tests and browser examples. | package tests plus browser drag/selection route. |
| PT-SV2-04 | selector.is-overlapping-selection.test.ts line anchors | overlap-compare | Text, inline objects, and block objects share consistent inclusive endpoint overlap semantics. | Raw range compare. | view-selection-contract and root interaction resolver. | add focused unit if not already explicit. | slate-react/view-selection-contract.test.ts or slate package point/range tests. | bun test focused owner. |
| PT-SV2-05 | event.delete.matrix.test.ts line anchors | delete-matrix | Delete handles text, words, blocks, void-at-edge, void-to-void, and inline object ranges without ghost nodes or invalid selection. | Raw transforms and runtime selection. | transforms/delete fixtures, operations-contract, generated browser stress. | refactor-existing names and fill object-boundary gaps. | slate/test/transforms/delete, operations-contract.ts, browser stress only for DOM-specific rows. | bun test slate transform files; browser stress grep for object deletion if touched. |
| PT-SV2-06 | event.insert.blocks/block/inline-object tests | insert-placement | Block/object insertion at text edges, middle, empty block, and block object yields stable placement and final selection. | Raw insert transform and selection. | transforms insertNodes/insertText fixtures and transforms-contract.ts. | create compact placement/select contract if scattered. | slate/test/transforms-contract.ts and transform fixtures. | bun test slate transforms. |
| PT-SV2-07 | event.paste.test.ts line anchors | clipboard-object | Clipboard fragments over objects and expanded selections preserve shape and caret. | Raw clipboard/fragment projection. | projected-clipboard-contract.test.ts and paste-html example. | split raw projection from Plate matcher policy. | slate-react projected clipboard; Playwright paste-html for DOM proof. | bun test projected clipboard; Playwright paste-html grep when touched. |
| PT-SV2-08 | drag-selection and drag.drop tests | drag-drop | Dragging inside current selection uses that range; dragging outside selects the atom; self-drop into origin is suppressed. | Native selection/drop validity over roots and voids. | root-interaction-resolver and browser selection tests. | create Playwright rows for roots/voids if missing. | slate-react/root-interaction-resolver.test.ts and browser examples. | focused root interaction tests plus Playwright route grep. |
| PT-SV2-09 | dom-structure and resolve-element-drop-position tests | dom-projection | DOM nodes and drop targets map by full projected path, including same-key nested roots. | Projection graph and content-root path law. | root-location-contract, content-root navigation, slate-void shell, projections tests. | add same-key nested root negative control. | slate-react projection/content-root tests. | bun test focused slate-react owners. |
| PT-SV2-10 | selection-after-remote-patches and selection emit tests | remote-selection | Remote operations rebase local selection once and do not emit duplicate selection moves. | Raw collab/selection substrate. | collab-selection-stress-contract.ts, collab-document-state-contract.ts, projected-collab-substrate-contract.test.ts. | create/refactor remote selection matrix. | slate package collab tests and slate-react projected collab test. | bun test focused collab tests. |
| PT-SV2-11 | undo-redo-collaboration tests | history-collab | Local undo removes only local edits after unrelated remote edits. | Raw history/collab behavior. | collab-history-runtime-contract.ts and slate-history tests. | refactor-existing or create explicit row. | slate/test/collab-history-runtime-contract.ts and slate-history tests. | bun test focused history/collab owners. |
| PT-SV2-12 | composition.test.ts line anchors | ime-composition | Composition commit, cancel, replacement, and boundary crossing keep DOM selection and model text coherent. | Browser input transport. | plite-browser IME tests, composition-state-contract, generated stress rows. | mostly covered; add only missing boundary transport rows. | plite-browser/playwright-ime and slate-react composition-state tests. | bun test plite-browser core plus focused Playwright IME grep. |
| PT-SV2-13 | focus and keyboard event tests | focus-keyboard | Focus and keyboard routing keep selection authority clear without losing native event semantics. | Raw focus/event substrate. | selection-controller, runtime provider, browser selection tests. | split raw event authority from Portable Text behavior API. | slate-react selection controller/runtime tests. | bun test focused slate-react owners. |
| PT-SV2-14 | applicable-schema and sub-schema tests | content-root-capability | Content roots may expose allowed insertion capabilities without importing schema policy. | Only if Plite exposes root capability hooks. | content-root-navigation tests cover navigation, not schema. | defer raw API unless capability hook is accepted; route product policy to Plate. | no raw code target until API decision. | slate-plan API decision before tests. |

Split rows:
| Row | Source ref | Lane-owned part | Out-of-lane part | Owner / handoff |
|-----|------------|-----------------|------------------|-----------------|
| PT-SV2-02 | fragment roots | Root projection and fragment boundaries. | Table/callout schema envelope serialization. | Raw Plite plus Plate serializer/schema. |
| PT-SV2-03 | selected value nested containers | Projected selection order and endpoint trimming. | Portable Text path format and markDef pruning. | Raw Plite plus Plate/PT serializer. |
| PT-SV2-06 | insert placement | Placement and selection. | Duplicate key generation and schema admissibility. | Raw Plite plus Plate/schema. |
| PT-SV2-07 | paste objects | Fragment/clipboard projection. | Object matchers and Portable Text MIME. | Raw Plite plus Plate paste pipeline. |
| PT-SV2-08 | drag/drop | Native selection/drop validity. | Drag handle UI and DnD product behavior. | Raw Plite plus Plate UI package. |
| PT-SV2-09 | DOM structure | Full projected path mapping and void root shell. | Portable Text data attributes/renderers. | Raw Plite plus Plate renderers. |
| PT-SV2-12 | composition | Browser composition transport. | Decorator/annotation inheritance policy. | Raw Plite plus Plate marks. |
| PT-SV2-13 | focus/keyboard | Focus selection and event authority. | Portable Text behavior API naming. | Raw Plite plus Plate behavior API research. |
| PT-SV2-14 | schema selection | Optional root capability surface. | Schema/category policy. | Plite API decision plus Plate schema owner. |

Excluded or out-of-lane rows:
| Row | Source ref | Reason | Owner |
|-----|------------|--------|-------|
| PT-SV2-15 | structured lists and textspec list rows | List indentation/rendering is product/editor policy. | Plate list package. |
| PT-SV2-16 | markdown/html/to-html/toolbar/plugin packages | Serializers, toolbar, plugins, Sanity bridge, and renderer packages are not raw Plite substrate. | Plate packages/docs. |
| Inventory harness bucket | 182 harness rows | Fixtures/support/setup are accounted for but not behavior rows. | No execution owner. |
| Inventory skip bucket | 14 skip rows | Non-editor/package rows do not pressure Plite. | No execution owner. |

Coverage dedupe:
| Candidate | Existing coverage | Decision | Evidence |
|-----------|-------------------|----------|----------|
| IME base composition | plite-browser IME tests, composition-state-contract, generated stress rows | refactor-existing, not copy-now | Current owner search found direct IME/composition owners. |
| Delete and insert basics | slate transform fixtures plus transforms-contract.ts | refactor-existing before creating files | Current owner search found broad insert/delete fixture directories. |
| Multi-root navigation | multi-root-document.test.ts and content-root-navigation-contract.test.ts | create only nested/fragment gaps | Browser and package owners already exist. |
| Clipboard HTML paste | projected-clipboard-contract and paste-html browser example | split raw fragment from Plate matcher policy | Current owner search found both package and browser surfaces. |
| Collab history | collab-history-runtime-contract.ts | add remote-selection rows only if exact rebase/dedup gaps exist | Existing collab substrate found. |

Execution queue:
| ID | Action | Target | Proof kind | Focused verification | Notes |
|----|--------|--------|------------|----------------------|-------|
| Q1 | Apply PT-SV2-01 through PT-SV2-04. | packages/plite/test/selection-rebase-contract.ts; packages/plite-react/test/projections-and-selection-contract.test.tsx; view-selection-contract.test.ts; multi-root browser example. | unit plus browser where DOM projection changes. | cd Plate repo root && bun test ./packages/plite/test/selection-rebase-contract.ts ./packages/plite-react/test/projections-and-selection-contract.test.tsx ./packages/plite-react/test/view-selection-contract.test.ts; focused Playwright multi-root grep if browser row changes. | First slice; highest value after recent selection/root bugs. |
| Q2 | Apply PT-SV2-05 through PT-SV2-07. | slate transform delete/insert fixtures, transforms-contract.ts, projected-clipboard-contract.test.ts, paste-html example. | unit plus clipboard/browser proof. | cd Plate repo root && bun test ./packages/plite/test/transforms-contract.ts ./packages/plite-react/test/projected-clipboard-contract.test.ts; Playwright paste-html grep when touched. | Keep matchers/MIME out of raw Plite. |
| Q3 | Apply PT-SV2-08 and PT-SV2-09. | root-interaction-resolver.test.ts, content-root-navigation-contract.test.ts, slate-void-shell-contract.test.tsx, browser examples. | unit plus Playwright drag/selection proof. | cd Plate repo root && bun test ./packages/plite-react/test/root-interaction-resolver.test.ts ./packages/plite-react/test/content-root-navigation-contract.test.ts ./packages/plite-react/test/slate-void-shell-contract.test.tsx; focused browser route grep. | Owns drag over roots/voids and full-path mapping. |
| Q4 | Apply PT-SV2-10 and PT-SV2-11. | collab-selection-stress-contract.ts, collab-document-state-contract.ts, projected-collab-substrate-contract.test.ts, collab-history-runtime-contract.ts. | package unit. | cd Plate repo root && bun test ./packages/plite/test/collab-selection-stress-contract.ts ./packages/plite/test/collab-history-runtime-contract.ts ./packages/plite-react/test/projected-collab-substrate-contract.test.ts. | No provider-specific Yjs policy in raw Plite. |
| Q5 | Apply PT-SV2-12 and PT-SV2-13 only for exact gaps. | plite-browser IME tests, composition-state-contract, selection controller/runtime tests. | browser input plus unit. | cd Plate repo root && bun test ./packages/plite-browser/test/core/playwright-ime.test.ts ./packages/plite-react/test/composition-state-contract.test.ts ./packages/plite-react/test/selection-controller-contract.test.ts. | Avoid importing Portable Text behavior API names. |
| Q6 | Route PT-SV2-14 through PT-SV2-16 to Plate backlog. | Plate schema/list/serializer/plugin packages and docs. | package/docs when Plate work starts. | No Plate repo root command. | Keep raw Plite unopinionated. |

Issue and claim accounting:
- Fixed issues: none; this pass is planning-only.
- Improved issues: none; no GitHub issue or ledger claim changed.
- Related issues: none linked in the prompt.
- PR reference: none.
- Claim sync rule: If a later execution pass claims coverage for public Plite issues, sync the relevant issue/claim ledger in that pass. This plan itself changes no issue status.

Downstream lane application:
| Gate | Status | Evidence |
|------|--------|----------|
| downstream skill read | complete | .agents/skills/slate-plan/SKILL.md was read before lane routing. |
| lane-specific completion gates applied | complete | Raw Plite owns substrate behavior; Plate owns product/schema/plugin policy; current Plate repo root tests are mapped before new targets. |
| implementation boundaries recorded | complete | This pass edits only harvest/plan docs. Execution queue targets Plate repo root for a later accepted pass. |
| verification commands recorded | complete | Each queue row names focused bun/Playwright commands; broad final gate is cd Plate repo root && bun check. |

Accepted-plan execution handoff:
- read-first plan path: docs/plans/2026-05-28-plite-portabletext-harvest-plan.md
- requested lane: plite raw substrate tests from Portable Text harvest.
- exact execution queue IDs: Q1 first, then Q2, Q3, Q4, Q5 only for exact gaps, Q6 for Plate backlog routing.
- implementation boundaries: edit Plate repo root only in a later execution pass; do not edit Plate repo root in this planning pass; do not pull Portable Text schema/list/plugin policy into raw Plite.
- focused verification commands: the commands in Execution queue, scoped to changed owners.
- broad final gate: cd Plate repo root && bun check; use bun check:full only when browser architecture or release-quality browser claims are changed.
- issue/claim sync rule: sync claim ledgers only if the execution pass changes a public issue/claim status.
- stop rule: stop and reroute if a row requires schema/list/plugin/product semantics rather than raw editor substrate behavior.

Findings:
- Portable Text has 502 test/support inventory rows; 321 contain test/scenario calls.
- The raw Plite value is concentrated in 180 portable rows and 31 portable-mixed rows.
- The highest-value Plite rows are selection boundary equivalence, nested content-root fragment selection, delete/insert object boundaries, drag/drop over selected ranges, DOM full-path projection, and remote selection rebasing.
- The most tempting wrong move is importing Portable Text schema/behavior API shape into raw Plite. Do not do that.

Decisions and tradeoffs:
- Use Portable Text as a behavior oracle, not as an API model.
- Prioritize Q1 because recent Plite bugs were selection/root/projection failures.
- Keep Plate-owned rows explicit instead of pretending raw Plite should own lists, schema categories, decorators, annotations, serializers, toolbar, or Sanity bridge policy.
- Do not run Plate repo root tests in this pass because no Plate repo root code changed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial generated inventory narrowed to 359 rows because shell regex escaping was wrong inside the generator. | 1 | Generate from rg --files and apply the include/exclude regex in JS. | Regenerated artifacts with 502 rows, matching the exact inventory command. |

Verification evidence:
- Harvest files generated: docs/editor-test-harvester/portabletext/report.md, inventory.md, test-index.md.
- Inventory count generated from JS-filtered rg --files: 502 rows, 321 runnable rows, 211 portable/portable-mixed indexed rows, 1979 line anchors.
- Artifact presence check passed: harvest-files-ok.
- Exact inventory command count passed: 502.
- Report grep passed for status: done, score: 0.93, license_mode: permissive, Total inventory rows: 502, Portable rows: 180, Pass-State Ledger, and Next Slice.
- Plan grep passed for Harvest grounding, Lane contract, Full harvest row accounting, In-lane candidate matrix, Execution queue, Downstream lane application, and Accepted-plan execution handoff.
- Placeholder grep found no template markers, unresolved status labels, active-progress labels, or placeholder-only lines in the plan/report.
- Mechanical completion passed: [autogoal] complete: docs/plans/2026-05-28-plite-portabletext-harvest-plan.md.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closure verification for the Portable Text to Plite harvest plan. |
| Where am I going? | Run artifact checks and the autogoal mechanical completion check, then close the active goal. |
| What is the goal? | A complete planning-only Plite test harvest plan from ../portabletext with all rows routed and no Plate repo root code edits. |
| What have I learned? | Portable Text is excellent pressure for root/projection/object-boundary tests; it is a bad source for raw Plite API shape. |
| What have I done? | Generated the harvest report, full inventory, test index, and filled this lane plan. |

Timeline:
- 2026-05-28T21:54:10.716Z Goal plan created.
- 2026-05-28T22:00:00Z Portable Text license, package scripts, and editor test source were read.
- 2026-05-28T22:05:00Z Harvest artifacts generated and corrected to 502 inventory rows.
- 2026-05-28T22:10:00Z Plite lane plan filled with row accounting, coverage mapping, and execution handoff.

Open risks:
- No material risk for the planning artifact. Execution risk remains in later browser proof for drag/drop, clipboard, and multi-root selection rows.
