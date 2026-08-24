# Plate application root policy

Objective:
Implement accepted Plate application-root policy across Core, CLI, docs, and
proof; done when focused, browser, root checks, and P1 review pass; plan
`docs/plans/2026-08-23-plate-application-root-policy.md`.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-23-plate-application-root-policy.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- none

Mode:
- `standard`: the decision changes a public schema boundary and persisted-root
  behavior across Plate and Plite, but needs no external research or benchmark.

Completion threshold:
- All five accepted execution slices are implemented, every proof-matrix row is
  observed on the final checkout, package/browser/root checks and P1 review
  pass, and `check-complete` passes after actual evidence is recorded.

Verification surface:
- Source audit of Plate application-schema types, schema lowering, Core plugin
  installation, paragraph ownership, public exports, callers, tests, and docs.
- Focused runtime probes for omitted roots, explicit custom roots, persisted-type
  overrides, invalid roots, and default-child construction.
- Planning validation with the Plate Plan binary-readiness rows and
  `check-complete.mjs`.

Constraints:
- User accepted this exact plan with `go`; implementation is authorized.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Preserve the standard paragraph experience unless live evidence justifies
  removing automatic installation or relocating the paragraph capability.
- Keep confirmed root authority, paragraph default policy, and physical package
  ownership as separate decisions.

Boundaries:
- In scope: `EditorApplicationSchema.root`, Plate-to-Plite schema lowering,
  omitted-root behavior, paragraph installation/default policy, adoption,
  current public teaching, and execution proof.
- Source owners: `packages/core`, relevant package consumers, `content/docs`,
  root/detail Vision, and generated barrel owners only if execution changes
  exports.
- Non-goals: implementation during this planning goal; the other architecture
  report findings; external editor comparison; speculative package relocation;
  template or release changes without a direct adoption need.
- Direct Plite boundary owners: existing `SchemaContent`, schema definition,
  compiler remapping, validation, default-root construction, and focused tests;
  no new Plite API is presumed.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Stop if current source cannot resolve whether Plate can lower an application
  root through existing Plite primitives, two equally valid product defaults
  require user taste, or the exact root/docs gates remain blocked by
  unrelated user-owned or CI-owned files after the recurring-goal blocker
  threshold is satisfied.

Plate Plan state:
- status: implementation-complete-goal-blocked
- phase: blocked
- next: the external owners must repair the generated registry and the two
  unrelated type-aware lint findings, or the user must explicitly expand this
  plan's repair boundary
- handoff: terminal-blocked-after-third-consecutive-audit

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Standard plan for application-owned primary-root policy; preserve standard paragraph behavior unless contrary evidence appears; planning stops before implementation. |
| Active goal and plan verified | yes | Active goal names this exact plan and binary readiness threshold. |
| Current owners read | yes | `VISION.md`, `docs/vision/plate.md`, `EditorApplicationSchema`, `withPlite`, `getCorePlugins`, paragraph descriptors, Plite schema definition/compiler, and current Node installation docs. |
| Best API target resolved | yes | Prior `best-api` review selected optional application `schema.root` with descriptor-aware `schema.content.element(...)`; ordinary omitted-schema behavior stays small. |
| Mode and execution boundary resolved | yes | Agent-led planning completed; accepted execution now runs one-shot against this exact plan. |
| Exact plan accepted | yes | User replied `go` to the handoff that named this exact plan path; one-shot execution goal created. |

Work Checklist:
- [x] Skill analysis: `plate-plan --standard` owns adoption/proof; `best-api`
  supplied the call-shape target; `autogoal` owns lifecycle and closure.
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Core root contract, compilation, identity, mutation inference, and omitted-root parity are implemented and proven.
- [x] Initialization, HTML fragment fitting, reset/exit behavior, selection, and history are implemented and proven.
- [x] CLI discovery, generation, migration, and generated contract fixtures adopt the root policy.
- [x] Core JSDoc, owning docs, schema-descriptor example, best-API doctrine/mirrors, and two changesets agree.
- [x] Package typechecks/builds, focused example Browser proof, P1 autoreview,
  stale-teaching audit, and final diff check pass.
- [ ] `/docs/editor` Browser rendering and aggregate root checks pass. Both are
  blocked by unrelated current-checkout work recorded below.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Implement and prove all five accepted slices | All five implementation slices and their focused proof rows are complete. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final `HEAD` remains `33557a72cc6b393c4646af46cf0348f0e49efa99`; the final owner scan confirms the optional root, paragraph fallback, CLI shape, and unchanged Plite/Yjs ownership. |
| Best API repair | yes | Source rule and exact generated mirror teach the accepted optional application root; affected worker audit found no contradiction | `pnpm install` regenerated resources; source/mirror `cmp` passes. |
| Conditional risk and adoption | partial | Close package, CLI, docs, browser, collaboration, doctrine, and release rows | Every root-policy row passes. `/docs/editor` cannot compile through a stale generated registry index outside this scope. |
| Verification recorded | partial | Record final focused/package/browser/root command results | Focused and package proof is green. Root aggregate commands expose only unrelated current-checkout failures. |
| Handoff prepared | yes | Prepare actual changed files, proof, preserved constraints, and residual risk | Final implementation and blocker evidence are recorded below. |
| P1 autoreview | yes | Run with `--max-priority P1`; repair grounded findings within the three-invocation cap | Cycle one found one valid CLI fallback defect. Cycle two was clean; a same-class malformed-root self-audit then went red/green, and the third/final cycle was clean across both chunks. |
| Goal plan complete | blocked | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-23-plate-application-root-policy.md` | The execution goal cannot truthfully close while its explicit aggregate root and docs-route gates remain red. The same external blockers survived three consecutive goal turns, so the goal is terminally blocked rather than left active. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Live Core, Plite, CLI, docs, tests, exports, and caller counts recorded | Decide |
| Decide | completed | Root/default/package concerns split; target API, adoption, behavior, doctrine, and release decisions locked | Prove and hand off |
| Prove and hand off | completed | Execution slices, proof matrix, high-risk cases, commands, and review corrections recorded | User review |
| Execute Core contract | completed | Optional positive-min root, compiled `{ contribution, root }`, descriptor/default lowering, omitted fingerprint, and type-policy tests pass | Root-sensitive behavior |
| Execute root-sensitive behavior | completed | Initialization uses document fitting; structural HTML, nested reset, root exit, selection, and undo tests pass | CLI adoption |
| Execute CLI adoption | completed | Root-only generation and named-root migration fixtures pass; CLI typecheck passes | Teaching and release metadata |
| Execute teaching and release metadata | completed | Paired docs, Core JSDoc, live structural example, exact best-API mirror, and two package changesets agree | Closure proof |
| Closure proof and review | blocked | Focused/package/CLI/Yjs/docs/example proof and P1 review pass. Aggregate root checks and the docs route stop on unrelated checkout/generated-registry failures. The third consecutive blocker audit is unchanged. | External-owner repair or explicit expanded authority |

Decision brief:
- outcome: give the application final primary-root authority without turning
  standard Plate setup into mandatory schema ceremony.
- chosen shape: optional application `schema.root`, authored with existing
  descriptor-aware `schema.content.*` builders and a required positive `min`;
  omitted root retains Plate's standard paragraph policy.
- strongest rejected alternative: remove and relocate paragraph as part of the
  root change.
- consequence: custom applications can own root grammar/defaults; extraction of
  paragraph remains an independently justified change, not bundled cleanup.

Target API:

```ts
// Standard Plate keeps the current one-paragraph root without schema ceremony.
const editor = createBaseEditor();

// An application opts into a different primary-root grammar explicitly.
const sectionEditor = createBaseEditor({
  plugins: [SectionPlugin],
  schema: {
    root: schema.content.element(SectionPlugin, { min: 1 }),
  },
});

// The first descriptor is the default for a multi-element root.
const mixedEditor = createBaseEditor({
  plugins: [ParagraphPlugin, HeadingPlugin],
  schema: {
    root: schema.content.elements([ParagraphPlugin, HeadingPlugin], {
      min: 1,
    }),
  },
});
```

- The root field accepts `SchemaContent` whose `min` is present. Core validates
  that `min` is a positive integer. Existing Plite validation owns `max`,
  default membership, element-only primary roots, construction cycles, and
  required-default ambiguity.
- Descriptor roots must use the family installed in that editor. A dedicated
  Base/headless tuple uses Base descriptors; a full Plate tuple passed to
  `createBaseEditor` may validly use Plate descriptors.
- `schema.content.elements` keeps its existing rule: its first descriptor is
  the default. Plate lowers that default through the same descriptor witness as
  the allowed rule, including persisted-type overrides.
- `root` is application policy, not a plugin contribution. The private compiled
  result therefore carries `{ contribution, root }`; only `contribution` enters
  the application extension, while `root` replaces the complete schema's
  current literal root definition.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Application primary root | `EditorApplicationSchema` exposes overrides, properties, and lineage but no root; Core authors it internally | Add optional `root` using existing `SchemaContent`, with `min` required and validated as a positive integer | `packages/core/src/lib/editor/editorApplicationSchema.ts` | The final application already owns closed schema policy, while Plite complete schemas already own `root` | Additive for constructors; custom apps add one field | Single/multiple descriptor roots, structural root, invalid cardinality/default/text diagnostics | Weak typing could admit a root that initializes but breaks later | rearchitect |
| Omitted application root | Core block group, paragraph default, `min: 1` | Preserve identical compiled semantics, initial child, and fingerprint | `packages/core/src/lib/editor/withPlite.ts` | Ordinary setup is intentionally schema-optional; 1,960 constructor/hook occurrences across 416 repo files make mandatory boilerplate unjustified | No caller migration | Before/after fingerprint `fnv1a64:4164b9dbcdccb294`, paragraph child/default, existing constructor suites | Accidental fingerprint drift would force persisted/collaboration migration | keep |
| Core paragraph capability | `getCorePlugins` always installs `BaseParagraphPlugin` with schema, rules, and HTML codec | Keep installation and package location unchanged in this plan | `packages/core/src/lib/plugins/getCorePlugins.ts` and paragraph owner | Root grammar and available Core capabilities are different responsibilities; current public Node docs promise Core paragraph behavior | No adoption | Existing Core and Node-doc tests; explicit custom root still compiles paragraph as an available non-root capability | This does not prove paragraph must remain Core forever | keep |
| Paragraph extraction | 68 package-source references, including 21 non-test files; obvious `basic-nodes` move conflicts with `basic-nodes -> utils` while `utils` consumes paragraph | Require a separate consumer-backed package-graph proposal | Future `best-api` plus `plate-plan`/`plate-plugin-creator` | Bundling extraction would turn a root API repair into a broad dependency rewrite | None in this execution | A future plan must name a paragraph-free Plate consumer and acyclic owner | Keeping current placement may retain architectural debt | defer |
| Root lowering | Application content lowering exists for element/property relationships; complete root stays literal inside `withPlite` | Compile descriptor-aware root content against installed plugin families, place it in the complete schema definition, and let Plite remap application overrides once | `packages/core/src/internal/plugin/compilePlateModel.ts` plus `withPlite.ts` | Reuses the existing compiler boundary and exact descriptor-family law | Internal Core callers and CLI internal import adopt the compiled result shape | Direct `element`, multi-`elements`, authored persisted type, application override, foreign/missing/non-element descriptor cases | Multi-element defaults currently lack direct default-source lowering and can retain a plugin name | rearchitect |
| Default document construction | Plate inserts one `createDefaultRootChild()` when no initial value exists | Fit an empty document through the compiled root so positive cardinality and structural wrappers are honored | `packages/core/src/lib/editor/withPlite.ts`; existing Plite `fitDocument` | Plite already constructs `min: 2` roots and nested section/paragraph defaults correctly | Omitted default stays one paragraph; explicit roots gain their authored cardinality | Omitted, single structural, and minimum-two roots; explicit empty input keeps its current error unless separately accepted | Bypassing the fitter would underfill `min > 1` or flatten structural defaults | rearchitect |
| HTML root fallback | HTML decode repeatedly treats the primary-root default as a leaf block and sometimes replaces its children with inline nodes | Fit each nonempty root inline run into the constructed default root element with the existing slice `fitContent`; retain the top-level wrapper and do not apply document-root `min` to a fragment | `packages/core/src/lib/plugins/html/HtmlPlugin.ts` | A section-root default can contain a paragraph; spreading inline children onto the section is invalid, while whole-document fitting would fabricate minimum children on every paste | Internal behavior only; standard paragraph output and empty-fragment behavior stay equal | Root text, unknown block, `<br>`, marks, empty input, and paste-oriented decode under paragraph, structural, and `min: 2` roots | Confusing a fragment with a document can add bogus blocks or change ordinary decode output | rearchitect |
| Reset/exit fallback | `OverridePlugin` uses the primary-root default for reset and exit at every nesting depth | Resolve a schema-valid default at the target parent/root context; never assume the root default is the editable sibling default | `packages/core/src/lib/plugins/override/OverridePlugin.ts` | Structural roots and nested grammars have different defaults | Internal behavior only | Heading reset and exit inside a structural root with paragraph child default; standard root parity | Context lookup mistakes can corrupt children or selection | rearchitect |
| Raw mutation inference | Application-policy detection checks only `overrides` and `properties` | Treat `root` as closed application policy and keep raw generic mutations conservative | `packages/core/src/lib/editor/pluginRuntimeTypes.ts` | Root grammar changes which insertions are valid | Root-using callers may need generated exact contracts for grammar-dependent mutations; current callers unchanged | Core type-contract negatives/positives and generated editor contract | Missing the marker would publish unsound root insertions | rearchitect |
| CLI discovery and generation | `plate generate` and migration runner whitelist only `id`, `version`, `overrides`, and `properties` | Recognize and validate `root`; compile it into generated root `Value`, fingerprint, and migration runtime | `packages/cli/src/generate.ts` and `packages/cli/src/run-migration.ts` | CLI is a declared consumer of the application schema object | Root-only and named-root fixtures; no export-name convention | Generator discovery, generated root type/fingerprint, migration validation/dry run | A valid unrelated exported root-content object could become an ambiguous schema candidate | rearchitect |
| Plite substrate | Complete schemas already own root grammar, validation, default plans, fitting, identity, and override remapping | Reuse unchanged | `packages/plite` schema definition/compiler/editor API | Focused probes constructed nested and minimum-two roots and fitted inline/empty input without Plate glue | None | Existing Plite schema/compiler/fitter suites plus Core integration proof | A discovered missing primitive would require Plite Plan before adding Plate glue | keep |
| Public teaching and doctrine | Docs say ordinary editors omit schema and the application decides roots, but expose no call | Teach the optional root call, positive minimum, descriptor/default behavior, structural example, fingerprint/version effect, and omitted paragraph default; reaffirm existing ownership doctrine | Core JSDoc, editor/document-model/API docs, Plate schema-descriptor example, `best-api` schema rule | Public API and current docs otherwise contradict each other | English/Chinese paired docs where the owning page has both; no registry kit migration | Docs checks plus Browser render of `/docs/editor` and runtime example route | Overteaching custom roots could make ordinary setup look mandatory | rearchitect |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Core public contract and compilation | `packages/core/src/lib/editor/editorApplicationSchema.ts`, `packages/core/src/internal/plugin/compilePlateModel.ts`, `packages/core/src/lib/editor/withPlite.ts`, `pluginRuntimeTypes.ts` | Add optional positive-min root; lower descriptor rules and their default witness; return a private `{ contribution, root }`; apply overrides only to the contribution; install the root in the complete identity; classify root as application mutation policy | Accepted target API and unchanged omitted-root baseline | Custom single, multi, renamed, structural, and minimum-two roots compile; invalid/missing/wrong-family/non-element/text/default/cardinality cases fail at the owning boundary; omitted root retains exact identity and child | `compilePlateModel.spec.ts`, `withPlite.slow.ts`, type-contract declarations, Core typecheck/build |
| 2. Construction and root-sensitive behavior | `withPlite.ts`, `HtmlPlugin.ts`, `OverridePlugin.ts` | For an omitted initial value, fit the editor's empty current document once so root construction plans honor wrappers and `min`; keep explicitly supplied empty values rejected. Fit HTML inline runs inside the intact default root element without applying document cardinality. Resolve reset/exit defaults from the actual insertion container: root default at depth one, otherwise the parent element's compiled content default constructed through `schema.create` | Slice 1 publishes the final compiled root | Default construction, direct HTML decode, clipboard insertion, reset, exit, selection, and history produce schema-valid values for paragraph and structural roots with no ordinary-path drift | Focused Core behavior tests plus the existing HTML codec suite and interactive example Browser proof |
| 3. CLI and generated contracts | `packages/cli/src/generate.ts`, `packages/cli/src/run-migration.ts`, CLI fixtures/tests | Add `root` to exact schema-shape discovery; consume the private compiled root result; validate root-only and named schemas; project the compiled root into generated `Value` and fingerprint; accept it in migration dry-run/check/write | Core compiler contract is stable | Unique valid root schemas are discovered independent of export name; ambiguous/invalid candidates fail; generated root union and fingerprint match runtime; migration uses the same schema | `packages/cli/test/generate.test.ts`, `run-migration.test.ts`, CLI typecheck/build |
| 4. Public teaching, doctrine, and release metadata | Core schema/editor JSDoc, `content/docs/(guides)/editor.mdx`, `document-model.mdx`, `content/docs/api/core.mdx`, Plate schema-descriptor example, `.agents/rules/best-api/rules/schema-and-identity.md`, `.changeset` | Teach omitted versus custom roots, positive `min`, descriptor family/default, structural roots, and named-schema version/migration duty; add the accepted application-root law to the source best-API rule and regenerate mirrors; adapt the existing example; add separate patch changesets for `@platejs/core` and `@platejs/cli` | Runtime and CLI calls are final | Source docs, generated skill mirrors, live example, and release notes agree; root/detail Vision are explicitly reaffirmed rather than edited; no registry or `platejs` source entry is changed | `pnpm install`, source/mirror search, docs/app checks, Browser routes, changeset audit |
| 5. Closure | Root repository | Run focused proof first, then affected package types/builds, lint, collaboration identity proof, root `check`, and one P1 review; repair only findings grounded in this accepted scope | Slices 1-4 are green | All listed commands pass on one final checkout; no stale root examples or generated mirrors; P1 review has no unresolved valid finding | Commands under Verification evidence and final `git diff --check`; `pnpm brl` only if execution actually changes a public export/file topology |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Omitted root is byte-for-behavior compatible | Current derived identity is `fnv1a64:4164b9dbcdccb294`; initial/default child is one empty paragraph | Exact fingerprint, default child, initial value, and no-arg editor pass in `withPlite.slow.ts` | observed |
| One descriptor-owned root lowers correctly | Existing direct element lowering resolves descriptor name and family | Structural Base descriptor plus missing/non-element and wrong-family cases pass; Plate-family coverage remains in CLI/example adoption | observed |
| Multi-element default follows its descriptor | `schema.content.elements` stores descriptor witnesses inside nested `any` rules, while current default lowering handles only direct `type` | Renamed first descriptor constructs its final persisted type and accepts the second root type | observed |
| Structural and positive-min roots construct canonically | Direct Plite probes fit `section -> paragraph -> text` and create two paragraphs for `min: 2` | Structural and `min: 2` initialization pass; existing explicit-empty rejection remains covered | observed |
| Invalid primary roots fail closed | Plite already rejects text roots, invalid defaults/cardinality, and construction cycles | Core rejects zero, negative, fractional, and NaN minima; descriptor errors pass; Plite retains remaining validation | observed |
| HTML fragments keep structure without document padding | Current `wrapRootInlineRuns` flattens the root default; existing `state.slice.fitContent` fits children against an element | Root inline decode under structural `min: 2` returns one fitted section, while the full existing HTML suite passes | observed |
| Reset and exit use the insertion container's default | Current code always calls `createDefaultRootChild()` | Nested reset uses parent default; structural exit creates a root sibling and preserves collapsed selection plus one undo unit | observed |
| Root changes schema identity and collaboration compatibility | Plite identity includes complete-root grammar; Yjs rejects mismatched fingerprints | Named and derived root variants have stable distinct fingerprints; unchanged omitted root stays exact; Yjs mismatch test rejects before content import | observed |
| Raw mutation types stay conservative | Policy marker currently recognizes only overrides/properties | Type positives/negatives show root-bearing raw editors do not promise grammar-dependent generic mutations; generated contracts remain exact | observed |
| CLI discovers, generates, and migrates the same root | Both CLI shape whitelists currently omit `root`; generated `Value` derives from the compiled schema | Root-only and `{ id, version, root }` fixtures pass; invalid/ambiguous exports fail; generated `Value` has the legal root variants without tuple cardinality; migration dry-run/check share fingerprint | observed |
| Public teaching does not make custom schema look mandatory | Current editor guide tells ordinary users to omit `schema` | Paired docs lead with omitted standard behavior, then one custom structural example and named-schema migration warning. Static docs checks and the focused live example pass. `/docs/editor` Browser render is blocked by the stale generated registry index importing removed files; local regeneration is forbidden. | partial |
| Release metadata names actual package owners | The type/runtime owner is `@platejs/core`; CLI adoption changes `@platejs/cli`; `platejs` only reexports Core | Separate patch changesets exist for `@platejs/core` and `@platejs/cli`; no `platejs` source or changeset changed | observed |

Conditional evidence:
- High-risk scenarios:
  1. Omitted-root identity drifts and silently invalidates persisted or
     collaborative documents. Gate: assert the exact current fingerprint and
     default value on the final checkout.
  2. A multi-descriptor root lowers allowed types but leaves its first default
     at the plugin name. Gate: renamed-first-descriptor runtime, generated
     contract, and fingerprint fixtures.
  3. Structural defaults are flattened by boot, HTML, reset, or exit. Gate:
     section-root scenarios across all four paths with schema assertion,
     selection, and history checks.
  4. Whole-document cardinality leaks into fragment fitting. Gate: paste one
     HTML block under a `min: 2` root and prove the fragment contains no
     fabricated sibling; document initialization must still create two.
  5. Runtime accepts root while CLI or collaboration identity ignores it.
     Gate: one named schema fixture crosses Core compilation, generation,
     migration check, and Yjs fingerprint mismatch proof.
- External research: N/A. This is an internal ownership/API contradiction and
  the current Core, Plite, CLI, docs, tests, and Vision sources settle it.
- Issue/PR provenance: N/A. The request is report-backed local architecture
  planning, not a public issue or PR intake.
- Docs owner: applies. Core JSDoc plus editor, document-model, and Core API docs
  own current teaching; paired translation updates apply only where an owning
  page has a maintained pair.
- Registry owner: N/A. No copied registry component, kit, or manifest changes;
  the existing app example is source-owned.
- Browser owner: applies because `packages/**`, `content/**`, and `apps/www/**`
  change. Use Browser on `/docs/editor` and
  `/examples/plite/plate-schema-descriptors`; prove render, typing, one HTML
  paste, valid nested DOM/value, and no console/runtime error.
- Release owner: applies as metadata only. Add separate patch changesets for
  `@platejs/core` and `@platejs/cli`; do not publish or add a `platejs` entry for
  an unchanged reexport file.
- Behavior-law owner: applies in existing Core compiler/editor/HTML/override
  suites. No new standalone law document is justified.
- Collaboration owner: applies as an integration proof in the existing Yjs
  schema-identity contract; no Yjs implementation change is planned.

Findings:
- `EditorApplicationSchema` currently exposes overrides, app properties, and
  lineage, but no primary root.
- Plate always installs `BaseParagraphPlugin` and constructs a minimum-one block
  root whose default starts as literal `paragraph`.
- A focused persisted-type override probe on source SHA `33557a72` remapped the
  default child from `paragraph` to `body`; the current compiler does not leave
  a stale literal default after application overrides.
- The report's low-level target uses React `ParagraphPlugin`. That is valid when
  `createBaseEditor` receives a full Plate tuple, as the CLI does. Dedicated
  Base/headless tuples should use Base descriptors; the enforceable rule is
  that root descriptors match the installed tuple family.
- Moving paragraph to `@platejs/basic-nodes` is not a free cleanup: that package
  depends on `@platejs/utils`, whose trailing-block owner consumes
  `BaseParagraphPlugin` from Core.
- The current repository contains 1,049 `createBaseEditor`, 792
  `createPlateEditor`, and 119 `usePlateEditor` call occurrences across 416
  files; 69 are exact no-argument calls. Making `root` mandatory would create
  mass boilerplate without improving the ordinary paragraph job.
- `content/docs/(guides)/editor.mdx` explicitly teaches that ordinary editors
  omit `schema`; `content/docs/(guides)/document-model.mdx` says the application
  decides valid roots. The missing field is a live docs/API contradiction.
- Plite complete schema definitions require a primary root and already reject
  text roots, unknown/disallowed defaults, ambiguous required defaults, and
  invalid cardinality.
- A focused Plite probe proved `fitDocument({ children: [] })` constructs two
  paragraph children for `min: 2`; another proved raw inline content fits into
  a structural `section -> paragraph -> text` root.
- Plate's no-policy derived baseline is
  `fnv1a64:4164b9dbcdccb294`, with one empty paragraph as both initial and
  default child. The application paragraph-type override baseline is
  `fnv1a64:80230b7a6d30e152` and correctly constructs `body`.
- `HtmlPlugin` and `OverridePlugin` use `createDefaultRootChild()` as though it
  always returned the leaf editing block. That assumption becomes false for a
  valid structural application root and therefore belongs in this adoption
  plan.
- `packages/cli/src/generate.ts` and `run-migration.ts` reject `root` during
  application-schema shape discovery today. Core-only implementation would
  silently strand generation and migration consumers.

Decisions and tradeoffs:
- Split the confirmed missing application-root authority from automatic
  paragraph installation and package placement. This prevents a valid API fix
  from smuggling in an unproved dependency-graph rewrite.
- Keep `root` optional. Explicit structure pays explicit schema cost; ordinary
  paragraph editors keep zero schema ceremony.
- Reuse `schema.content.element(s)` instead of adding a Plate-specific root DSL.
  Require a positive `min` so the existing non-empty Plate document invariant
  stays explicit while allowing cardinalities above one.
- Support structural roots rather than defining "custom root" as merely another
  leaf block. Existing Plite fitting is the correct substrate; Plate callers
  must stop flattening its result.

Review fixes:
- The first pass scoped the missing field to Core. Source tracing found two CLI
  shape whitelists and generated-contract/migration consumers, so CLI is now a
  required adoption slice.
- The first pass treated a custom root default as another leaf block. Direct
  Plite probes proved structural roots are valid, exposing unsafe assumptions
  in HTML decoding and reset/exit behavior; both are now explicit owners.
- The first pass called React `ParagraphPlugin` invalid for
  `createBaseEditor`. Constructor and CLI evidence disproved that absolute
  claim; the plan now requires descriptor-family parity instead.
- A mandatory root was considered and rejected after current docs plus 1,960
  constructor/hook occurrences across 416 files showed it would add ceremony
  to the standard case.
- A generic optional `SchemaContent` was tightened to require an explicit
  positive integer `min`. Direct Plite proof showed `min > 1` already works, so
  the plan preserves that capability instead of hardcoding exactly one.
- Whole-document fitting was considered for HTML output and rejected because a
  root `min: 2` would pad every pasted fragment. The chosen private path uses
  existing element-context slice fitting and keeps fragment boundaries open.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| None | 0 | N/A | N/A |
| Bun did not treat `src/lib/editor/withPlite.slow.ts` as a path | 1 | Prefix the explicit file with `./` | Corrected command produced the expected structural-root RED, then passed after implementation. |
| Invalid-min test exercised the Plite builder before Core validation | 1 | Construct a valid descriptor value, then override `min` at the runtime boundary | Core now proves its own exact positive-integer diagnostic. |
| CLI watcher tests intermittently timed out only under full-suite load | 3 | Rerun each exact watcher case independently, then retry the broad suite | Every timed-out row passed independently; the final broad suite passed 72/72. |
| Structural React editor crashed because `paragraph.toggle` depended on a root-only generic command | 1 | Give the built-in shortcut a contextual handler and add a structural React regression | Nested heading-to-paragraph shortcut test passes; clean Browser example loads and edits without errors. |
| Docs check raced a parallel package build and observed a temporarily missing `dist/index.d.ts` | 1 | Run package builds to completion, then rerun docs sequentially | Sequential docs API/source/parity check passes. |
| `/docs/editor` cannot compile because stale generated registry imports target removed source files | 4 | Retry normal and focused Plite dev lanes; count the stale imports; do not run forbidden local registry generation | Both lanes still fail at the same generated-index boundary. Of 202 unique generated dynamic imports, 158 target missing files. Static MDX/API/parity checks pass; example Browser proof uses the focused Plite lane. |
| P1 review found CLI generation swallowed invalid exported roots | 1 | Add failing descriptor and malformed-root regressions, tighten shape discovery, and let any root candidate reach Core validation | Both regressions failed before their fixes, then passed; six discovery rows, CLI typecheck, the final 72-test suite, and the third/final review cycle pass. |
| Root `pnpm check` stopped in type-aware lint | 2 | Inspect the exact failing-file diffs and run unaffected later phases independently | The same pre-existing edits in `check-package-build-artifacts.mjs` and `sidebar-nav/route.ts` remain the only root-check failures. Regular lint, all 60 builds/typechecks, `test:all`, and `test:slowest` pass independently. |
| Aggregate slow suites stopped in the collaboration demo | 2 | Inspect the exact demo diff and replay after its owner changes | The external demo work added the missing commit subscription mock. Current `pnpm test:all` and `pnpm test:slowest` both pass. |
| Dev-server error buffers produced oversized tool output | 2 | Stop printing server buffers; count missing generated imports and summarize Browser logs instead | Bounded audit reports 158 missing targets; subsequent Browser evidence reports only counts and the first error. |
| Markdown backticks in an `rg` shell command launched `pnpm check` | 1 | Stop the accidental session and use single-quoted patterns without command substitution | Session was interrupted immediately; later commands are bounded and literal. |
| Recurring goal blocker audit returned the same external root/docs failures | 3 goal turns | Stop retrying after the lifecycle threshold; require owner repair or explicit expanded authority | The third audit still reports the same two type-aware lint findings and 158 missing generated-registry targets. No autonomous in-scope move remains. |
| First third-audit registry counter had an over-escaped regular expression | 1 | Rerun the same bounded counter with literal shell-safe quoting | Corrected counter reports 202 unique dynamic imports and 158 missing targets. |

Verification evidence:
- planning source-audit: before execution, `EditorApplicationSchema` had no
  root and `withPlite.ts` authored the literal paragraph root. The final source
  exposes optional `root`, while the same paragraph content remains the exact
  omitted-schema fallback and `getCorePlugins.ts` still installs paragraph.
- source-audit: Plite `schema-compiler.ts:2185-2268` validates cardinality and
  defaults, and `:3760-3833` rejects primary-root text and validates
  construction plans.
- final source-audit: both CLI schema-field whitelists include `root`; generator
  discovery validates recognized candidates with `createBaseEditor`, and
  migration validation uses the same runtime contract.
- command: focused Bun probes in `/Users/zbeyens/git/plate-2` confirmed current
  paragraph/remap fingerprints and Plite structural/minimum-two fitting.
- command: `pnpm --filter @platejs/plite exec bun test --preload ../../config/plite-source-test-setup.ts test/slice-fit-content-contract.test.ts`
  passed 9/9. It proves detached element-context fitting wraps inline content,
  supplies nested defaults, preserves open boundaries, and is deterministic
  without publishing editor state.
- fresh source cursor: `33557a72cc6b393c4646af46cf0348f0e49efa99`.
  A focused owner search reconfirmed the literal Core root, both CLI
  whitelists, and every `createDefaultRootChild()` assumption named above.
- accepted execution commands, in order after focused red/green iteration:
  1. `pnpm install`
  2. `pnpm --filter @platejs/core exec bun test src/internal/plugin/compilePlateModel.spec.ts src/lib/editor/withPlite.slow.ts src/lib/plugins/html/HtmlPlugin.codec.spec.ts src/lib/plugins/override/OverridePlugin.spec.tsx`
  3. `pnpm --filter @platejs/cli test`
  4. `pnpm --filter @platejs/yjs exec bun test test/schema-identity-contract.spec.ts`
  5. `pnpm turbo typecheck --filter=./packages/core --filter=./packages/cli`
  6. `pnpm --filter @platejs/core build`
  7. `pnpm --filter @platejs/cli build`
  8. `pnpm lint:fix`
  9. Source/mirror `rg` for the new application-root doctrine after a second
     `pnpm install`; zero stale contradictory examples in source and generated
     best-API resources.
  10. Browser proof on `/docs/editor` and
      `/examples/plite/plate-schema-descriptors`.
  11. `pnpm check`
  12. `$autoreview --max-priority P1`
  13. `git diff --check`
- `pnpm brl` is conditional only on an actual exported-file/topology change;
  adding a field to an already exported type does not trigger it.
- Current plan source cursor and final `check-complete` output are recorded by
  the closure commands before goal completion.
- planning closure before execution: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-23-plate-application-root-policy.md`
  returned `[autogoal] complete` for the accepted plan artifact.
- command: `pnpm --filter @platejs/core typecheck:contracts` passed after root
  policy inference and required-`min` type cases were added.
- command: `pnpm --filter @platejs/core exec bun test ./src/internal/plugin/compilePlateModel.spec.ts ./src/lib/editor/withPlite.slow.ts ./src/lib/plugins/html/HtmlPlugin.codec.spec.ts ./src/lib/plugins/override/OverridePlugin.spec.tsx ./src/react/editor/TPlateEditorCore.spec.ts`
  passed 141/141 with 588 assertions, including malformed runtime roots and
  the structural-root paragraph shortcut discovered by Browser proof.
- command: the final focused generator discovery set passed 6/6, including
  root-only exact `Value`, invalid-root rejection, unrelated-export exclusion,
  default exports, and ambiguity.
- command: `pnpm --filter @platejs/cli exec bun test ./test/run-migration.test.ts`
  passed 6/6 with 24 assertions. Named root policy changes the target fingerprint
  and fits its required root cardinality through the shared runtime.
- command: `pnpm --filter @platejs/cli typecheck` passed.
- command: every broad CLI watcher timeout passed alone; the final broad retry
  on the final checkout passed 72/72 with 224 assertions.
- command: `pnpm --filter @platejs/yjs exec bun test test/schema-identity-contract.spec.ts`
  passed 15/15, including mismatch rejection before content import.
- command: `pnpm turbo typecheck --filter=./packages/core --filter=./packages/cli`
  passed 12/12 tasks on the formatted checkout.
- commands: `pnpm --filter @platejs/core build` and
  `pnpm --filter @platejs/cli build` passed.
- command: `pnpm lint:fix` passed on 4,195 files.
- command: `pnpm install` regenerated the skill resources; the best-API source
  and mirror compare exactly, and the affected worker-rule search found no
  stale application-root teaching.
- command: `pnpm --filter www check:docs` passed API-reference, MDX source, and
  English/Chinese parity checks when run after package builds.
- Browser: current clean focused route
  `/examples/plite/plate-schema-descriptors` rendered the initial
  `applicationSection -> paragraph` value, imported inline HTML into exactly
  one section and one paragraph at paths `0` and `0,0`, accepted typing, and
  produced `HTML inside the application root typed` with zero warnings/errors.
- Browser blocker: `/docs/editor` cannot compile because
  `apps/www/src/__registry__/index.tsx` imports many removed registry files.
  The same failure occurs in current normal and focused Plite lanes. A bounded
  source audit found 158 missing targets among 202 unique generated dynamic
  imports. Repo policy forbids local `build:registry`, so the docs route is not
  claimed as rendered.
- command: current root `pnpm check` completed formatting, regular lint, and all
  60 type-aware package builds, then stopped on unrelated type-aware lint
  findings at
  `tooling/scripts/check-package-build-artifacts.mjs:237:63` and
  `apps/www/src/app/api/sidebar-nav/route.ts:17:1`.
- command: current `pnpm lint` passed all 4,195 files.
- command: current independent `pnpm typecheck` passed all 60 package tasks.
- command: current `pnpm test:all` passed 3,290/3,290 fast tests and 1,549/1,549
  executed slow tests with 60 intentional skips and zero failures.
- command: current `pnpm test:slowest` passed; the prior table warning measured
  197.15 ms, below the 200 ms warning threshold.
- command: `.agents/skills/autoreview/scripts/autoreview --mode local --max-priority P1`
  cycle one found one valid invalid-root fallback defect. Cycle two was clean;
  a same-class self-audit then proved malformed `root: null` still fell back,
  and the third/final cycle reviewed two complete chunks with zero actionable
  P0/P1 findings after that red/green repair.
- commands: `git diff --check` passed; best-API source/mirror `cmp` passed;
  final `HEAD` remains `33557a72cc6b393c4646af46cf0348f0e49efa99`.
- execution closure: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-23-plate-application-root-policy.md`
  correctly returned `[autogoal] incomplete` because the aggregate root and
  docs-route checklist row remains unchecked.
- third consecutive blocker audit at
  `33557a72cc6b393c4646af46cf0348f0e49efa99`: targeted type-aware lint still
  reports only `apps/www/src/app/api/sidebar-nav/route.ts:17:1`
  (`typescript(require-await)`) and
  `tooling/scripts/check-package-build-artifacts.mjs:237:63`
  (`typescript(restrict-template-expressions)`). The corrected bounded registry
  audit still reports 158 missing targets among 202 unique generated imports.
- terminal handoff validation: `git diff --check` passes. The final
  `check-complete.mjs` invocation returns `[autogoal] incomplete` on the one
  intentionally unchecked root/docs closure row, so the plan does not
  misrepresent a blocked goal as complete.

Final handoff prepared:
- Ownership and target API: Plate Core adds optional
  `EditorApplicationSchema.root`; callers use existing
  `schema.content.element(s)` with a positive `min`. Plite remains the unchanged
  grammar/fitting substrate. Omission remains the exact standard paragraph
  policy.
- Public breaks and adoption: the source API is additive. Applications that
  choose a different root are intentionally changing persisted grammar and
  fingerprint; named schemas must increment `version` and provide their normal
  document migration. There is no alias, shim, mandatory caller migration, or
  paragraph relocation. CLI discovery/generation/migration is mandatory
  adoption, not follow-up work.
- Applicable runtime/package/docs/browser decisions: Core compilation,
  bootstrap, HTML, override rules, mutation inference, CLI, Core JSDoc, three
  owning docs pages, the existing schema-descriptor example, best-API doctrine,
  and two patch changesets are in scope. Registry, Plite source, Yjs source,
  `platejs` source, and Vision edits are out; Yjs remains a proof consumer.
- Proof and execution risks: exact omitted fingerprint parity, renamed
  multi-root defaults, structural defaults across four runtime paths, fragment
  versus document cardinality, and cross-Core/CLI/Yjs identity are the hard
  gates. Browser proof is synthetic desktop app proof, not a release or
  physical-device claim.
- Execution status and user attention: all five accepted slices are
  implemented. No application-root design decision remains. The only choice is
  whether to authorize a separate repair scope for the stale generated
  registry and the two unrelated dirty-tree type-aware lint findings that
  prevent aggregate closure.

Timeline:
- 2026-08-23T13:10:48.947Z Plate Plan created.
- 2026-08-23 Goal created; standard planning boundary and prompt requirements
  recorded before further source exploration.
- 2026-08-23 Source, runtime probes, self-review, package/release policy, and
  detached slice-fit proof completed; binary execution plan prepared for user
  review.
- 2026-08-23 `check-complete.mjs` passed; planning goal closed without product
  implementation.
- 2026-08-23 Accepted execution implemented Core root compilation, document
  construction, structural HTML fitting, contextual reset, structural exit,
  and type policy; 128 focused tests plus Core type contracts pass.
- 2026-08-24 CLI discovery, generation, migration, and typecheck adopt the
  application root. Focused fixtures pass; two watcher cases that timed out
  only under full-suite load pass independently.
- 2026-08-24 Paired docs, doctrine mirrors, live example, and package
  changesets completed. Browser found and drove repair of the nested paragraph
  shortcut; clean focused example proof passes. The docs route remains blocked
  by stale generated registry imports outside this plan's writable boundary.
- 2026-08-24 P1 review found and drove a CLI invalid-root fallback regression;
  descriptor and malformed-root tests went red then green, the final CLI suite
  passed 72/72, and the third/final review cycle returned clean. Root aggregate
  closure remains blocked only by unrelated current-checkout lint,
  collaboration-demo, and generated-registry failures.
- 2026-08-24 Continuation rechecked every live blocker. Regular lint, all
  package typechecks, `test:all`, `test:slowest`, and clean focused Browser
  interaction now pass. Root `pnpm check` remains red only on two unrelated
  type-aware lint findings; `/docs/editor` remains red because 158 generated
  imports target missing CI-owned registry files.
- 2026-08-24 Third consecutive goal turn rechecked the exact two closure
  owners. Both are unchanged, the blocked lifecycle threshold is satisfied,
  and no in-scope autonomous repair remains. The implementation is complete;
  the goal is terminally blocked pending external-owner repair or explicit
  expanded authority.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Terminal blocked handoff after the third consecutive external-blocker audit |
| Where am I going? | Wait for external-owner repair or explicit authority to repair the unrelated lint and generated-registry owners |
| What is the goal? | Implement the accepted application-root policy without regressing the standard paragraph experience. |
| What have I learned? | See Findings |
| What have I done? | All implementation slices, focused/package/CLI/Yjs/docs-static proof, clean example Browser proof, diff checks, and P1 review are complete. |

Open risks:
- No architecture decision remains open, and the HTML `min: 2` fragment case
  passes without fabricated root siblings.
- `/docs/editor` has not rendered in Browser because its generated registry
  index targets removed files. Static docs checks and the focused public
  example pass; claiming full docs-route proof would be bullshit.
- Aggregate root closure is not green. Tests, builds, and package typechecks
  pass; its exact remaining failures are two unrelated current-checkout
  type-aware lint findings, not inferred root-policy regressions.
- The goal is terminally blocked. Repeating the same audits cannot create the
  missing registry files or authorize edits to unrelated user-owned work.
- Paragraph extraction remains known debt, deliberately outside this plan. It
  needs an acyclic package owner and a real paragraph-free consumer before it
  is worth doing.
