# latest 100 Plate plans audit

Objective:
Audit exactly 100 latest Plate plans; done when the corpus, consistency map,
weak/exemplary owners, review order, and visual guide are source-backed.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-24-latest-100-plate-plans-audit.md

Template:
docs/plans/templates/architecture-cleanup.md

Primary template:
docs/plans/templates/architecture-cleanup.md

Applied packs:
- none

Cleanup source:
- type: local read-only architecture/plan audit
- id / link: `docs/plans/*.md` at the frozen pre-audit cutoff
- title: latest 100 Plate plans audit
- requested surface: Plate framework, packages, plugins, registry, docs, and
  architecture plans; exclude Plite-dominant plans
- cleanup intent: give the user a repeatable human review method and identify
  the strongest evidence-backed weak and exemplary owners
- acceptance criteria: exactly 100 qualifying plans inventoried; current owner
  doctrine read; recurring claims and contradictions counted; at least five
  weak/exemplary candidates ranked; ordered file path and visual guide delivered

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: none
- semantics: N/A: the user gave no duration
- initial confidence / cleanliness score: N/A: the audit has exact artifact gates
- improvement loop: N/A: no timed loop
- final score / loop closure: N/A: close against the exact corpus and artifact gates

Completion threshold:
- Exactly 100 latest qualifying Plate plan files are selected from the frozen
  pre-audit corpus, with the selection rule and exclusions recorded.
- The audit records corpus themes, repeated unresolved risks, plan-status/proof
  gaps, and contradictions against current Plate ownership doctrine.
- At least five source-backed candidate areas are ranked, including weak and
  exemplary comparisons, owner files, navigation cost, and next review action.
- The final response gives a repeatable methodology, exact file-opening order,
  and an in-conversation visual guide for the user-led review.
- Architecture-cleanup closure is legal only when source map, deslop inventory,
  candidate matrix, agent-navigation score, packet ledger, proof evidence,
  changed list, and final handoff are complete or explicitly N/A, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-24-latest-100-plate-plans-audit.md`
  passes.

Verification surface:
- Source audit: bounded file inventory plus structured extraction from the 100
  selected plans.
- Doctrine audit: `VISION.md`, `docs/vision/common.md`, and
  `docs/vision/plate.md` against recurring plan claims.
- Current-source spot checks for every top weak/exemplary candidate.
- Artifact checks for the corpus analysis and rendered visual; mechanical goal
  closure through `check-complete.mjs`.

Constraints:
- Do not split files because they are large.
- Prefer delete, merge, inline, or simplify over extraction when that improves
  comprehension.
- Do not change public API, product UX, or behavior under a cleanup packet.
- Focused proof comes before broad proof.
- No dirty speculative work at handoff: keep, revert, or quarantine.
- Analysis only: do not change product code, public APIs, registry source,
  packages, tests, templates, generated output, or release artifacts.
- Separate plan evidence from confirmed current-source evidence.
- Do not treat repeated plan prose as proof that implementation shipped.

Boundaries:
- Source of truth: selected `docs/plans/*.md` corpus plus current Vision and
  literal package/registry owners
- Allowed edit scope: this goal ledger and a visualization outside the repo;
  all product/source inspection is read-only
- Plite / Plate boundary: exclude plans whose primary subject is Plite, Slate,
  Plite migration/runtime/browser/benchmark work, even if Plate is a consumer
- Public API boundary: audit and route only; no API design acceptance or repair
- Browser surface: N/A: no visible behavior changes; browser proof is outside
  this read-only plan-quality audit
- Package/API surface: read-only owner and export inspection only
- Non-goals: implementation, plan rewrites, package cleanup, registry rebuild,
  changelog/release work, commits, pushes, PRs, and claims of shipped behavior

Output budget strategy:
- Count and classify before reading bodies. Exclude templates, artifacts,
  generated output, Plite-dominant plans, and this newly created audit ledger.
- Save structured 100-plan extraction to one bounded local analysis artifact;
  inspect summaries and targeted excerpts instead of streaming all plans.
- Cap broad command output; use exact files and short ranges for current-source
  confirmation.

Blocked condition:
- Fewer than 100 qualifying Plate plans exist, the Plate/Plite classification
  cannot be made from plan text, or current owner doctrine is missing enough
  that consistency cannot be judged without a user decision.

Cleanup state:
- task_type: architecture-cleanup
- task_complexity: major read-only audit
- current_phase: closeout
- current_phase_status: completed
- next_phase: user-led concept review
- goal_status: complete

Current verdict:
- verdict: Plate's direction is mostly coherent; its review surface and closure
  state are not. The strongest live debt is schema adoption plus generated
  registry freshness, not a missing architecture thesis.
- cleanliness confidence: 0.91 for the scoped audit; plan status is lower
  confidence than current-source checks because the corpus uses several ledger
  generations and many plans pin older source cursors
- next owner: architecture-cleanup
- keep / revert / quarantine call: keep analysis ledger only; no product packet
- reason: user requested diagnosis and guidance, not implementation

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-24-latest-100-plate-plans-audit.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact-100 scope, Plate-only boundary, methodology, ordered files, visual guide, consistency check, and weak/exemplary clues copied above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `architecture-cleanup` loaded | yes | `.agents/skills/architecture-cleanup/SKILL.md` read completely |
| Active goal checked or created | yes | `get_goal` returned no goal; dedicated plan prepared before broad exploration |
| Source of truth read before analysis | yes | Root `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, `.agents/AGENTS.md`, the frozen corpus, current SHA `57c26226c65d2ccdb962b6a99d42ef6a8f5c4cc1`, and named current owners read |
| VISION fit gate read | yes | Plate framework, package capability, registry composition, current-state docs, optional generator, and proof hierarchy laws recorded below |
| Plite / Plate boundary selected | yes | Plate framework/product/plugin/registry plans included; Plite/Slate substrate-dominant plans excluded |
| Cleanup surface selected | yes | Latest 100 qualifying direct plan files plus current Plate owners |
| Non-goals recorded | yes | Boundaries section records no implementation, plan rewrite, release, or Git mutation |
| Output budget strategy recorded | yes | Count/classify first; bounded artifact; targeted excerpts only |
| Implementation authority decided | no | N/A: read-only audit; no implementation authorized |
| Proof strategy selected | yes | Exact corpus inventory, doctrine comparison, current-source spot checks, artifact verification |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation. Evidence: objective,
      completion threshold, boundaries, verification surface, and final handoff.
- [x] Source map records largest files, owner files, package exports, public /
      private boundaries, tests, and proof owners for the surface. Evidence:
      Source map and current-source consistency map.
- [x] Deslop inventory records wrappers, pass-through modules, duplicate
      helpers, vague names, stale compatibility, over-broad barrels, orphan
      tests, and stale source-owner oracles. Evidence: Deslop inventory.
- [x] Candidate matrix ranks at least five candidates unless the prompt names a
      smaller surface. Evidence: nine ranked rows.
- [x] Every candidate has a decision: delete, merge, inline, simplify, split,
      keep, defer, reject, or plan. Evidence: final column of matrix.
- [x] Every candidate records an agent-navigation score: files-to-read,
      owners-touched, proof clarity, public/private clarity, and net effect.
- [x] Anti-confetti rule applied: no split is accepted without durable owner,
      stable name, focused proof, and lower future navigation cost. Evidence:
      zero splits; large Table/Core/oracle files are not findings by size.
- [x] Merge/delete/inline are considered as seriously as extraction. Evidence:
      simplification and keep decisions replace speculative extraction.
- [x] VISION fit is recorded; missing reusable taste routes to `vision` or
      `sync-vision`. Evidence: current doctrine already settles every ranked
      owner; no Vision gap found.
- [x] Implementation packets are behavior-neutral, public-API-neutral, narrow,
      reversible, and have focused proof. N/A: no product implementation packet
      was authorized or applied.
- [x] Each implementation packet ends keep, revert, or quarantine. N/A: audit
      ledger and external visual are kept; no product packet exists.
- [x] Source-owner oracle is added or repaired when ownership moves, or N/A
      reason is recorded. N/A: no ownership moved.
- [x] Focused proof is run before broad proof for changed code. N/A for code;
      bounded source checks and focused existing tests prove audit claims.
- [x] Broad proof is run after multiple packets, import churn, or public/package
      boundary changes. N/A: no source/import/API packet changed.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior. Evidence: all repo commands ran in
      `/Users/zbeyens/git/plate-2`; visual checks name the external path.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Exact 100-file manifest; corpus/current-source scripts and visual checks recorded below |
| Source map complete | yes | Record current owners, largest files, exports, tests, and proof owners | Source map complete |
| Deslop inventory complete | yes | Record concrete stale/shallow/duplicated/over-split surfaces | Deslop inventory complete |
| Candidate matrix complete | yes | Rank candidates with facts, action, owner, proof, and decision | Nine ranked rows |
| Agent-navigation score complete | yes | Record before/after or expected files-to-read / owner / proof clarity changes | Every row scored 2/5 through 5/5 |
| Anti-confetti gate | yes | Prove accepted splits reduce navigation cost or record no split accepted | No split accepted; size-only candidates rejected |
| Delete / merge / inline gate | yes | Record considered simplifications and why accepted/rejected | Two simplify recommendations; no unauthorised source change |
| VISION fit gate | yes | Confirm fit to VISION.md or record sync-vision/stop decision | Current doctrine resolves every ranked boundary; no sync needed |
| Implementation packet gate | no | For every code packet, record keep/revert/quarantine and focused proof | N/A: read-only audit; ledger and visual kept |
| Source-owner oracle gate | no | Repair or add tests/oracles when ownership moves, or N/A | N/A: no ownership move |
| Public API / behavior safety gate | yes | Prove no public API/product behavior changed, or route to plan owner | Product/API diff is empty by scope; findings route to `plate-next` / `best-api` |
| Package/API proof | no | Run relevant package/export/type/build proof when package boundaries changed, or N/A | N/A: no boundary change; focused reference tests only support current examples |
| Browser proof | no | Run Browser/Playwright proof when visible behavior changed, or N/A | N/A: no product UI changed; visualization was statically rendered and validated |
| Final lint/check | no | Run focused/broad lint/typecheck/test appropriate to touched files | N/A: no product source; Markdown goal ledger and HTML fragment receive structural checks |
| Output budget discipline | yes | Verify no unbounded high-volume output was streamed, or record recovery | Counts/filenames first; capped reads; one early combined doctrine read truncated and was immediately replaced with complete bounded reads |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish current packet cleanly; otherwise N/A | N/A: no duration requested |
| Final handoff contract | yes | Fill changed list, cleanup counts, proof, needs-review, residual risks, and next owner | Filled below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-24-latest-100-plate-plans-audit.md` | All plan prerequisites are resolved; the exact closeout result is recorded under Verification evidence |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | governing doctrine, exact corpus, current SHA, and source owners read | source map |
| Source map | completed | doctrine/framework/registry/oracle/feature owners recorded | deslop inventory |
| Deslop inventory | completed | stale delivery, plan state, adoption debt, and false alarms classified | candidate matrix |
| Candidate matrix | completed | nine source-backed rows with decisions and scores | cleanup packets / owner routing |
| Cleanup packets / owner routing | completed | no product packet; exact `plate-next`, `best-api`, registry CI, and keep owners routed | verification |
| Verification | completed | source checks, focused tests, and visual structural render complete | closeout |
| Closeout | completed | ledger, risks, changed list, owner routing, and handoff filled | user-led review |

Source map:
- Canonical doctrine: `VISION.md`, `docs/vision/common.md`, and
  `docs/vision/plate.md`.
- Planning contract: `docs/plans/templates/plate-plan.md`; it already separates
  decision ledger, execution slices, proof matrix, and open risk inside one
  plan, but there is no cross-plan index or supersession owner under
  `docs/plans/`.
- Framework/public contract: `packages/core/src/lib/plugin/defineBasePlugin.ts`,
  `packages/core/src/react/plugin/definePlatePlugin.ts`,
  `packages/core/src/lib/plugin/PluginDefinition.ts`, and
  `packages/core/src/lib/editor/pluginRuntimeTypes.ts`.
- Compiler/runtime owner: `packages/core/src/internal/plugin/compilePlateModel.ts`,
  `packages/core/src/internal/plugin/resolvePlugins.ts`, and
  `packages/core/src/lib/editor/withPlite.ts`.
- Authored registry owners: `apps/www/src/registry/registry-features.ts`,
  `apps/www/src/registry/components/editor/plugins.ts`, and each flat feature
  file under `components/editor`.
- Registry proof owners: `apps/www/src/registry/registry.test.ts` and
  `apps/www/scripts/check-registry-source.mts`.
- Generated delivery output: `apps/www/src/__registry__/index.tsx`; inspect it
  last because it is CI-controlled output, not design authority.
- Current adoption oracle: `tooling/scripts/check-plate-schema-adoption.mjs`.
- Feature pressure owners: Table, List, Suggestion, Plate migrations, Media,
  Mention, Element ID, and Block Placeholder.
- Reference owners: Basic Nodes for a simple plugin family, Code Block for a
  complex inferred descriptor, and DOCX for capability-versus-composition
  package topology.

Corpus summary:
- Selection: direct date-named Markdown files under `docs/plans`, ordered by
  filename date descending and deterministic filename order within a day;
  manually admit only Plate framework/product/plugin/registry/package design
  as the primary subject. Exclude repo tooling, lint, CI, benchmark-only,
  public-issue process, and Plite/Slate substrate-dominant plans. The audit
  ledger itself is excluded.
- Frozen count: exactly 100. Newest:
  `2026-08-23-plate-base-runtime-boundary.md`. Cutoff:
  `2026-07-29-repair-registry-cleanup-drift.md`.
- Volume: 38,407 lines, or 384 lines per plan on average.
- Overlapping title themes: plugin API/types 32; schema/AST/identity 24;
  registry/composition 22; React/UI ownership 18; feature package 18;
  research/audit 13; package/runtime boundary 10; CLI/generated 8;
  codec/serialization 8.
- Plan-reported open-risk signals: type/declaration/compiler debt in 33 plans;
  generated-registry drift in 27; Browser proof absent/blocked in 17; broad
  root/check failure in 11; concurrent/external checkout drift in 11;
  docs/release work in 9; implementation/adoption remaining in 7. Only 12
  plans state no residual risk.
- Ledger-state quality: 56 plans have no `goal_status`; 11 end with `active`;
  five plans contain 33 unchecked checklist rows. Three of those five are
  honestly blocked ledgers, one is a still-incomplete schema/value migration,
  and `2026-08-13-restore-editor-integration-colocation.md` is a stale intake
  shell with 24 unchecked rows despite a positive verdict.

Exact corpus manifest (newest to cutoff):
1. `2026-08-23-plate-base-runtime-boundary.md`
2. `2026-08-23-plate-application-root-policy.md`
3. `2026-08-23-hard-cut-yjs-public-entrypoints.md`
4. `2026-08-23-generated-editor-contract-registry-delivery.md`
5. `2026-08-23-enforce-root-runtime-boundaries-across-split-packages.md`
6. `2026-08-23-audit-registry-memo-and-display-names.md`
7. `2026-08-18-separate-registry-migrations.md`
8. `2026-08-18-isolate-docx-io-example-composition.md`
9. `2026-08-18-inline-registry-hooks.md`
10. `2026-08-18-implement-final-ast-contracts.md`
11. `2026-08-18-audit-registry-hooks.md`
12. `2026-08-18-audit-first-party-ast-types.md`
13. `2026-08-17-v53-to-v54-automatic-ast-migration.md`
14. `2026-08-17-teach-renderer-hook-ownership.md`
15. `2026-08-17-restore-conditional-list-start-semantics.md`
16. `2026-08-17-rename-image-natural-dimensions.md`
17. `2026-08-17-migrate-registry-to-flat-editor-feature-ownership.md`
18. `2026-08-17-hard-cut-table-renderer-hooks.md`
19. `2026-08-17-finalize-v54-plate-ast-profile.md`
20. `2026-08-17-finalize-list-start-and-restart-semantics.md`
21. `2026-08-17-editor-node-model-standards-research.md`
22. `2026-08-17-editor-document-standard-proposals-research.md`
23. `2026-08-17-centralize-v54-migration-tests.md`
24. `2026-08-16-restore-dom-editor-geometry-contracts.md`
25. `2026-08-16-remove-package-docx-kit-and-repair-skill.md`
26. `2026-08-16-registry-owned-react-controllers.md`
27. `2026-08-16-migrate-react-component-families.md`
28. `2026-08-16-implement-react-package-ownership-cuts.md`
29. `2026-08-16-hard-cut-docx-package-topology.md`
30. `2026-08-16-audit-react-package-ownership.md`
31. `2026-08-15-restore-docx-export-kit-composition.md`
32. `2026-08-15-remove-plugin-declaration-stages.md`
33. `2026-08-15-enforce-descriptor-node-selectors.md`
34. `2026-08-14-scope-copilot-kit-to-demo.md`
35. `2026-08-14-remove-registry-schema-lineage.md`
36. `2026-08-14-remove-element-id-from-editor-kit.md`
37. `2026-08-14-remove-drawing-kits-from-editor-kit.md`
38. `2026-08-14-inline-derived-editor-composition.md`
39. `2026-08-14-hard-cut-plate-cli-runtime-ownership.md`
40. `2026-08-14-decouple-plate-generate-export-names.md`
41. `2026-08-14-cut-derived-editor-generated-contracts.md`
42. `2026-08-13-separate-runtime-keys-and-persisted-element-ids.md`
43. `2026-08-13-reuse-static-heading-renderer-for-docx.md`
44. `2026-08-13-restore-editor-integration-colocation.md`
45. `2026-08-13-restore-direct-suggestion-wrapper-typing.md`
46. `2026-08-13-repair-registry-dependency-metadata.md`
47. `2026-08-13-repair-plate-ui-generated-editor-ownership.md`
48. `2026-08-13-repair-heading-component-family.md`
49. `2026-08-13-optimize-plate-cli-ts7-codegen.md`
50. `2026-08-13-infer-plugin-decoration-leaf-props.md`
51. `2026-08-13-descriptor-owned-renderer-props-hard-cut.md`
52. `2026-08-13-cut-editor-kit-facades.md`
53. `2026-08-13-audit-registry-dependency-metadata.md`
54. `2026-08-12-remove-link-preview-feature.md`
55. `2026-08-12-plate-cli-typescript-7-codegen.md`
56. `2026-08-12-infer-leaf-props-from-plugin-descriptors.md`
57. `2026-08-12-generic-plugin-toggle-adoption.md`
58. `2026-08-12-descriptor-owned-renderer-props.md`
59. `2026-08-12-cut-styled-element-prop-aliases.md`
60. `2026-08-11-normalize-first-party-override-plugin-names.md`
61. `2026-08-09-object-only-node-set-api.md`
62. `2026-08-06-remove-useaichat-runtime-editor-cast.md`
63. `2026-08-06-hard-cut-handwritten-ast-mirrors.md`
64. `2026-08-06-derive-plugin-node-types-from-schema.md`
65. `2026-08-06-cut-explicit-react-editor-hook-generics.md`
66. `2026-08-04-typed-plugin-property-mutations.md`
67. `2026-08-04-target-plugins-identity-sweep.md`
68. `2026-08-04-review-and-repair-every-updated-content-doc.md`
69. `2026-08-04-infer-react-element-types-from-plugins.md`
70. `2026-08-04-hard-cut-generic-plugin-mutations.md`
71. `2026-08-04-fix-identity-codec-drift.md`
72. `2026-08-04-cut-redundant-plugin-read-update-methods.md`
73. `2026-08-04-audit-uncommitted-identity-migration-drift.md`
74. `2026-08-04-audit-plugin-read-update-generic-mutations.md`
75. `2026-08-03-simplify-plugin-schema-property-access.md`
76. `2026-08-03-repair-basemarkplugins-inference-cast.md`
77. `2026-08-03-inline-one-use-plugin-chains.md`
78. `2026-08-03-hard-cut-table-cell-header-plugin.md`
79. `2026-08-03-generated-editor-schema-contracts.md`
80. `2026-08-03-application-schema-overrides-and-property-handles.md`
81. `2026-08-02-separate-plugin-and-schema-identity.md`
82. `2026-08-02-schema-derived-editor-value-types.md`
83. `2026-08-02-registry-identity-drift-audit.md`
84. `2026-08-01-wordgard-exhaustive-architecture-re-audit.md`
85. `2026-08-01-restore-heading-plugin-names.md`
86. `2026-08-01-hard-cut-plugin-name-references.md`
87. `2026-08-01-final-wordgard-adoption-plan.md`
88. `2026-07-31-schema-api-hard-cut.md`
89. `2026-07-31-restore-same-family-plugin-composition.md`
90. `2026-07-31-restore-base-plugin-component-ownership.md`
91. `2026-07-31-restore-ai-chat-plugin-identifier.md`
92. `2026-07-31-plate-next-restore-ai-kit-extension-ownership.md`
93. `2026-07-31-hard-cut-plugin-name-lookup.md`
94. `2026-07-31-hard-cut-parallel-plugin-lookup-apis.md`
95. `2026-07-31-full-schema-api-audit.md`
96. `2026-07-31-fix-ai-chat-source-api-and-doctrine.md`
97. `2026-07-30-unify-definecodecs-authoring.md`
98. `2026-07-30-hard-cut-markdown-codec-package.md`
99. `2026-07-29-unify-plate-plugins-over-plite-extensions.md`
100. `2026-07-29-repair-registry-cleanup-drift.md`

Current-source consistency map:
- Strong and current: package source exports zero named `*Kit` arrays while the
  app registry owns 69; rejected public paths such as `.withComponent()`,
  `editor.extend()`, `getApi`, `pluginApi`, `__config`, and
  `tx.extension()` have zero current production/docs matches outside historical
  changelogs and tests.
- Strong and current: the old authored `apps/www/src/registry/ui` tree has zero
  TypeScript files; the flat `components/editor` tree has 187. The registry
  source checker passes and its focused registry suite passes 8/8.
- Broken and current: the generated registry index has 202 unique local dynamic
  imports, of which 158 target missing files. This explains repeated Browser
  blockers across the corpus; it does not invalidate the authored-source move.
- Incomplete and current: the schema-adoption oracle reports 33 Plate-lane rows
  after excluding Plite/Yjs. Fourteen are production or registry-source rows;
  nineteen are tests, docs, or examples. These are adoption findings, not 33
  proven runtime bugs.
- Strong reference proof: the focused DOCX facade, Basic Nodes, and Code Block
  suites pass 122/122; none appears in the current Plate-lane adoption rows.
- Apparent generated-contract reversals are consistent when read by owner:
  derived examples lost generated contracts, the main website may retain its
  app-owned contract, and registry installs deliver authored composition only.
- Apparent kit reversals are consistent when read by owner: package roots
  publish capabilities; registry/app files publish ordered kits.

Deslop inventory:
- Stale generated paths: the generated registry still publishes removed
  `registry/ui`, `editor-kit.tsx`, and `plate-types.ts` topology.
- Stale plan state: mixed goal-ledger generations, absent statuses, open rows,
  older SHAs, and no cross-plan supersession index force the reader to infer
  authority chronologically.
- Transitional adoption: Table/List/Element ID/Block Placeholder extend-stage
  signatures plus raw schema queries and codec identity rows remain in the
  current oracle.
- Dense oracle: `check-plate-schema-adoption.mjs` is 6,824 lines with 71 Set
  declarations and 42 Map declarations. Its central ownership is useful, but
  it is expensive to navigate and should not be split until rule-family owners
  and focused proof are explicit.
- Rejected as false alarms: large cohesive files alone, 69 registry kits, the
  four-line DOCX facade, and one family file holding many related UI components.

Human review method:
1. Pick one concept, never one date range: for example plugin identity,
   generated contracts, Table commands, DOCX composition, or registry install
   closure.
2. Read the governing law first: root `VISION.md`, then only the relevant
   section of `docs/vision/plate.md`.
3. Read the newest plan for that concept. Classify it as current, superseded,
   blocked, incomplete, or historical before accepting any conclusion.
4. Trace the literal current owner at the pinned current SHA: public package
   entry, descriptor/compiler owner, app/registry composition, and final
   consumer. A plan path that no longer exists is history, not a defect.
5. Admit a concern only in this order: contract, reachability, canonical owner,
   current enforcement, concrete harm, and a falsification test.
6. Keep four independent state boxes: **decided** (target chosen), **adopted**
   (current source matches), **proved** (owner check/test passes), and
   **delivered** (generated/browser/release surface is current). Never let one
   green box imply the others.
7. Open older plans only to understand a rejected alternative or an apparent
   reversal. Stop once current doctrine, current owner, and current proof settle
   the concept.
8. Record one row in a concept ledger:
   `concept | invariant | owner | latest plan | current source | consumer |
   proof | decided/adopted/proved/delivered | contradiction | next file`.

Default file order:
1. `VISION.md`
2. relevant section of `docs/vision/plate.md`
3. newest concept plan under `docs/plans/`
4. package `package.json` / public `src/index.ts`
5. owning descriptor or compiler source
6. app/registry kit or terminal consumer
7. focused test/oracle
8. public docs
9. generated output, Browser, package artifact, and release evidence last

Registry-specific order:
1. `docs/vision/plate.md` registry doctrine
2. `2026-08-23-generated-editor-contract-registry-delivery.md`
3. `apps/www/src/registry/registry-features.ts`
4. `apps/www/src/registry/components/editor/plugins.ts`
5. selected flat feature file
6. `apps/www/src/registry/registry.test.ts`
7. `apps/www/scripts/check-registry-source.mts`
8. `apps/www/src/__registry__/index.tsx` only as generated-delivery proof

Plugin/package-specific order:
1. `docs/vision/plate.md` plugin doctrine
2. newest plan for the exact API family
3. `defineBasePlugin.ts` / `definePlatePlugin.ts` public constructor owner
4. one concrete feature descriptor
5. Core compiler/runtime owner only if the feature evidence points there
6. registry renderer/kit
7. focused package tests and schema-adoption oracle
8. docs and packed/generated evidence

Candidate matrix:
| Rank | Strength | Candidate | Files | Facts | Navigation score | Recommendation | Owner | Proof | Decision |
|------|----------|-----------|-------|-------|------------------|----------------|-------|-------|----------|
| 1 | Strong | Cross-plan authority and supersession | `docs/plans/**`, Plate Vision, `plate-plan` template | 100 plans / 38,407 lines; no index; 56 lack status; five retain open rows | 5/5: dozens of historical files before current authority is clear | Keep plans as run ledgers; add one concept-level current-state review ledger rather than another mega-plan | architecture-cleanup, then Vision/plan owner | corpus inventory plus current SHA audit | simplify |
| 2 | Strong | Plate schema/plugin adoption | schema oracle; Core public/compiler owners; affected packages/docs | 33 current Plate-lane rows: 14 production/app source, 19 proof/docs/examples | 5/5: doctrine, public types, compiler, feature, consumer, and oracle | Close rows owner by owner; do not redesign the API unless a row proves a call-shape defect | `plate-next`; `best-api` only for unresolved public shape | `node tooling/scripts/check-plate-schema-adoption.mjs` | plan |
| 3 | Strong | Generated registry delivery freshness | registry source, CI-generated index, registry checks | authored checks green; 158/202 generated imports missing | 4/5: three owners and proof types disagree visibly | Repair the generation/freshness owner; never hand-edit the output or undo the flat source move | registry CI / Plate UI delivery | bounded import existence audit; registry checker/test | simplify |
| 4 | Strong | Table plugin vertical | `BaseTablePlugin.ts`, registry `table.tsx`, Core compiler, tests | 3,571-line Base owner; twelve-stage chain; two current oracle rows; 33 package test files | 5/5: public definition, many stages, UI family, compiler, and proofs | Audit whether every stage owns a real dependency; do not split because the files are large | `plate-next`, then `best-api` if public shape changes | schema oracle plus focused Table suite | plan |
| 5 | Strong | List, Suggestion, and Plate migration adoption | three Base/migration owners plus oracle | List has extend-signature drift; Suggestion has two raw queries; Plate migrations have two raw queries | 4/5: fewer files than Table but cross-schema behavior | Repair the smallest live rows before broader cleanup | package owners through `plate-next` | schema oracle and focused package tests | plan |
| 6 | Worth exploring | CLI/generated-contract compiler | `packages/cli/src/generate.ts`, `typescript.ts`, registry/docs | eight source files / 4,675 lines; two files own 3,437; repeated plans converged on optional app-owned generation | 4/5: Core schema, TS compiler, app module, docs, artifact checks | Keep the owner boundary; defer structural cleanup until registry freshness and schema adoption are green | `@platejs/cli` / `plate-plan` | CLI tests, `plate generate --check`, docs/source parity | defer |
| 7 | Strong reference | Authored registry source topology | `registry-features.ts`, flat feature files, checker/test | old source tree 0; flat tree 187; 69 registry kits; checker and 8 tests green | 2/5: declaration, feature, proof | Use as the registry reference; keep generated output conceptually downstream | Plate UI / app registry | source checker and registry test | keep |
| 8 | Strong reference | DOCX capability/composition boundary | `packages/docx/src/index.ts`, leaf packages, registry `docx.tsx` | package facade is three reexports; zero package `DocxKit`; registry owns ordered `DocxKit` | 2/5: facade, leaf owner, app composition | Use as the package-versus-product composition reference | DOCX packages plus app registry | source audit and focused facade test | keep |
| 9 | Strong reference | Basic Nodes and Code Block plugin shapes | Basic descriptors/React adapters/registry kits; Code Block owner/tests | Basic Nodes has no extend stages; Code Block retains justified complex stages; no current adoption row; focused reference suites green | 2/5: one package owner, React adapter, registry renderer | Compare new plugin work against Basic Nodes first and Code Block only when staged dependencies are real | package plugin owners | 122/122 combined focused reference tests | keep |

Packet ledger:
| Packet | Action | Owner | Files | Proof | Result | Next |
|--------|--------|-------|-------|-------|--------|------|
| Corpus freeze | classify and count | architecture-cleanup | exact 100-file manifest above | existence/count audit; 38,407-line bounded inventory | keep | review by concept, not chronology |
| Current-owner validation | trace doctrine, source, consumer, and proof | literal package/registry owners | Vision, Core, registry, affected packages, oracle | current SHA checks, registry proof, schema oracle, focused package tests | keep | route three live debt lanes to their owners |
| Review map | turn findings into a user-driven navigation tool | architecture-cleanup | external interactive HTML fragment | script parse, fragment constraints, structural render | keep | user selects Registry, Plugin API, React/UI, Packages, or Plan hygiene |

Cleanup counts:
- delete: 0
- merge: 0
- inline: 0
- simplify: 2
- split: 0
- keep: 3
- defer: 1
- reject: 0
- plan: 3

Changed list:
- code/runtime/API: none
- tests/oracles: none; existing proof only was executed
- docs/plans: this audit goal ledger only
- skills/workflow: none
- external visualization: `/Users/zbeyens/.codex/visualizations/2026/08/24/01a03384-3bab-7bc0-a5e5-490f781ca6da/plate-architecture-review-map.html`
- reverted/quarantined: none

Needs review:
- User choice: select one concept lane; Registry delivery is the recommended
  first pass because its authored-source and generated-output states are both
  measurable and cleanly separated.
- Registry CI / Plate UI delivery owner: explain and repair the 158 missing
  generated imports without hand-editing output or undoing flat ownership.
- `plate-next`: close the fourteen production/app schema-adoption rows one owner
  at a time. Escalate only proven public call-shape defects to `best-api`.
- Table owner: justify or remove each staged dependency before considering any
  file split.

Verification evidence:
- Current cursor: `git rev-parse HEAD` returned
  `57c26226c65d2ccdb962b6a99d42ef6a8f5c4cc1`.
- Corpus: the numbered manifest contains exactly 100 unique existing direct
  date-named plan files; newest/cutoff and 38,407 total lines are recorded
  above.
- Registry source: `pnpm --filter www exec tsx --tsconfig
  ./scripts/tsconfig.scripts.json scripts/check-registry-source.mts` passed.
- Registry contract: `bun test apps/www/src/registry/registry.test.ts` passed
  8/8 tests and 341 expectations.
- Generated delivery audit: 202 unique local dynamic imports in
  `apps/www/src/__registry__/index.tsx`; 44 exist and 158 are missing.
- Schema adoption: `node tooling/scripts/check-plate-schema-adoption.mjs`
  reported 41 total rows; the bounded Plate-only classification contains 33,
  split into fourteen production/registry-source and nineteen
  test/doc/example rows.
- Reference packages: focused DOCX, Basic Nodes, and Code Block tests passed
  122/122. Expected syntax-highlight fallback warnings did not fail tests.
- Visual artifact: 11,557 bytes; one script parsed with `new Function`; root ID
  occurs once; no document shell or escaped-newline payload; the fragment
  rendered successfully through the Visualize renderer. This is structural
  artifact proof, not browser/UI proof.
- Goal closure: `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-08-24-latest-100-plate-plans-audit.md` returned
  `[autogoal] complete`.

Final handoff contract:
- Source roots inspected: root/Common/Plate Vision, exact plan corpus, Plate
  Core public/compiler owners, registry source/output/proof, schema oracle,
  affected feature packages, and three reference package families.
- Candidate count and top recommendation: nine candidates; first repair the
  review interface, then generated Registry freshness, then schema adoption.
- Cleanup counts: delete 0, merge 0, inline 0, simplify 2, split 0, keep 3,
  defer 1, reject 0, plan 3.
- Agent-navigation score changes: a concept ledger should reduce cross-plan
  review from 5/5 cost to roughly 2/5; separating authored Registry source from
  generated delivery reduces that lane from 4/5 to 3/5. Schema adoption stays
  5/5 until owner rows close.
- Packets applied with keep/revert/quarantine result: three read-only analysis
  packets kept; zero product packets, reverts, or quarantines.
- Proof commands/source audits: exact corpus/source inventory, current-SHA
  owner checks, registry checker/test, schema oracle, 122 focused reference
  tests, and visual structural render.
- Rejected/deferred candidates: reject size-only splitting; defer CLI compiler
  cleanup until Registry freshness and schema adoption are green.
- Needs-review list: Registry delivery, fourteen live source-adoption rows, and
  Table stage ownership.
- Residual risks: plan status cannot prove delivery; generated output may change
  after CI; focused tests do not establish browser/release state; schema rows
  are adoption findings rather than automatic runtime defects.
- Next owner and exact first file: user-led Registry concept review starts at
  `docs/vision/plate.md`, then
  `docs/plans/2026-08-23-generated-editor-contract-registry-delivery.md`;
  implementation, if separately accepted, routes to Registry CI / Plate UI.

Open risks:
- The Plate-only qualification required bounded manual classification. The
  exact manifest makes that judgment auditable rather than pretending it is a
  filename fact.
- This is a current-checkout audit, not release proof. CI may regenerate the
  stale output after the frozen SHA.
- The 33 Plate adoption rows need owner-level triage; they do not establish 33
  customer-visible defects.
- No Browser run was justified because no product surface changed. The external
  guide has structural render proof only.

Timeline:
- 2026-08-24T11:26:05.038Z Architecture-cleanup goal plan created.
- 2026-08-24 Prompt requirements frozen before corpus exploration; read-only
  scope and exact completion threshold recorded.
- 2026-08-24 Exact 100-plan corpus frozen; doctrine, status, risk, and recurring
  concept inventories completed.
- 2026-08-24 Current-source checks separated historical plan claims from live
  adoption, authored-source, generated-output, and proof states.
- 2026-08-24 Candidate ranking, ordered review method, and interactive review
  map completed; no product change applied.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Read-only audit closeout complete |
| Where am I going? | User-led concept review, starting with Registry delivery |
| What is the goal? | Audit exactly 100 latest Plate plans and deliver a source-backed human review method, ordered files, and visual guide |
| What have I learned? | Plate's target ownership is coherent; plan authority, schema adoption, and generated Registry freshness are the weak closure layers |
