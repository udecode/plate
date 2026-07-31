# full schema API audit

Objective:
Audit the full Plite/Plate schema API; done when every public concept and caller
family is mapped, all material decisions are source-backed, and the text-block
authoring verdict is revalidated.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-07-31-full-schema-api-audit.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Major source:
- type: user request plus live repository source
- id / link: current conversation; no tracker
- title: full Plite/Plate schema API audit
- decision to make: whether `schema.element.textBlock()` is truly the best
  common-path correction and what other material schema API/architecture
  improvements are justified now
- decision criteria: exhaustive current public surface and caller-family
  coverage; every schema concept gets a keep/reject/defer or P0-P3 decision;
  concrete ideal call sites; no speculative machinery

Major lane:
- lane: architecture and public API audit
- output type: planning-only decision report
- implementation expected: no
- affected packages / surfaces: `@platejs/plite` schema types/builders/compiler,
  Plate schema lowering/facades, exports, docs, production declarations,
  representative tests, and prior schema architecture decisions
- dominant risk: simplifying authoring by hiding structural grammar mistakes or
  proposing redundant public vocabulary from an incomplete scan

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
- initial confidence score: N/A: exact coverage counts and evidence gates are
  stronger than a subjective score
- improvement loop: map -> classify -> design -> pressure-test -> reconcile
- final score / loop closure: N/A: closure uses zero unexplained relevant
  source units and zero unresolved decision rows

Completion threshold:
- One bounded source manifest covers every relevant public schema declaration,
  builder, compiler/lowering owner, export, docs concept, production caller
  family, and proof family, with exact exclusions.
- Every atomic schema concept has one final `keep`, `reject`, `defer`, or
  material P0-P3 decision with current/proposed public shapes where applicable.
- The prior `schema.element.textBlock()` recommendation is reaffirmed,
  superseded, or rejected after the whole surface is mapped.
- Prior durable schema candidates are reconciled against live source rather
  than silently repeated.
- Final handoff names exact owners, dependency order, deletion/hiding impact,
  proof obligations, and what remains open by design.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-31-full-schema-api-audit.md`
  passes.

Verification surface:
- Source manifest counts from scoped `rg --files`, exports, declarations,
  production callers, docs, and tests.
- Live reads of Plite schema interfaces, builders, compiler/runtime queries,
  Plate lowering/facades, public exports, and representative call sites.
- Reconciliation against existing schema/editor audit artifacts and current
  plans only after the independent live-source map.
- Final best-api P0-P3 table and editor-audit coverage closure counts in the
  user handoff; no implementation tests are claimed.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Do not execute implementation unless this major goal explicitly includes it.
- Do not edit `packages/**`, `apps/**`, `content/**`, public docs, skills, or
  release artifacts.
- Preserve explicit schema correctness, JSON/collaboration, transaction,
  dynamic configuration, derived-schema, slice-fitting, and host-codec laws.
- Prefer the smallest material API improvement; no preset family or string DSL
  merely for symmetry.

Boundaries:
- Source of truth: latest user request, live repository source/tests/docs, then
  prior durable schema/editor audit artifacts.
- Allowed edit scope: this planning ledger only; analysis is read-only across
  the repository.
- External sources: no new web research or clone mutation; existing local
  source-derived audit evidence may be consumed where still applicable.
- Browser surface: N/A: public schema architecture review has no visible route.
- Tracker sync: N/A: no issue or PR supplied.
- Non-goals: implementation, compatibility layer design, package changesets,
  registry changes, browser QA, commits, PRs, or unrelated plugin cleanup.

Output budget strategy:
- Enumerate files and counts first; inspect exact owner ranges second. Exclude
  `node_modules`, `dist`, generated registry output, templates, `.next`,
  `.turbo`, coverage, and unrelated plans. Cap each command output; save broad
  inventories to the plan only as counts/paths instead of streaming matches.

Blocked condition:
- Stop only if live source cannot establish a public contract or a material
  recommendation depends on an unspecified product semantic choice; report the
  exact missing decision. External editor freshness alone does not block a
  local schema API verdict and must be labeled stale/support-only.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: implementation planning, only after user acceptance
- goal_status: complete

Current verdict:
- verdict: keep the schema kernel; repair authoring, names, type privacy, and one
  unsound JSON-property overload
- confidence: high
- next owner: `plite-plan`, followed by `plate-plan` for Plate adoption
- reason: all public concept, owner, caller, docs, and proof families were
  mapped; the material recommendations follow existing compiler/runtime laws
  instead of adding another schema model

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-31-full-schema-api-audit.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | This plan records full-schema scope, best-api/editor-audit lenses, no implementation, deliverables, verification, and closure counts. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| `major-task` loaded | yes | Read `.agents/skills/major-task/SKILL.md` completely. |
| Active goal checked or created | yes | Created the matching thread goal after confirming no active goal existed. |
| Source of truth read before analysis | yes | Read `VISION.md`, `docs/vision/common.md`, `docs/vision/plite.md`, `docs/vision/plate.md`, both named skills, and live paragraph/schema compiler owners. |
| Major lane selected | yes | Architecture and public API audit; planning-only. |
| Decision criteria stated | yes | Completion threshold above. |
| Existing repo patterns / prior decisions checked | yes | Initial bounded search found current schema hard-cut, Wordgard, and multi-editor audit artifacts; full reconciliation remains checklist work. |
| Helper stack selected | yes | `editor-audit`, `best-api`, `major-task`, `autogoal`; no extra panels. |
| External research decision recorded | yes | No new web/external clone work; local prior audits are support-only until checked against live source. |
| Implementation expectation recorded | yes | No implementation. |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2`. |
| Branch / PR expectation decided | no | N/A: analytical work only; no branch, commit, or PR. |
| Output budget strategy recorded | yes | See Output budget strategy. |
| Package/API pack selected | yes | Public schema API and package ownership are the audit target. |
| Public surface or package boundary identified | yes | Plite owns raw schema; Plate owns descriptor-aware authoring/lowering. |
| Release artifact path selected | no | N/A: planning-only; no published user-visible delta. |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no implementation or release artifact. |
| Barrel/export impact decision recorded | no | N/A: no exports will change during this audit. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; N/A: no duration was requested and closure
      uses explicit coverage/decision counts.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Major source records source type, id/link, title, decision type, expected
      outcome, decision criteria, likely files/packages/surfaces, browser
      surface, and highest-leverage owner.
- [x] Current state is mapped before proposing a new architecture, migration,
      benchmark, or plan.
- [x] Every public schema type, builder, export, runtime query, Plate facade,
      production declaration family, docs concept, and proof family is counted
      and mapped or explicitly excluded.
- [x] Every current schema noun/verb is classified as essential, mergeable,
      rename/cut candidate, or advanced escape hatch.
- [x] The common text-block path and at least one structural, void, inline,
      property, root, named-root, derived-schema, and reconfiguration path are
      traced end to end.
- [x] Prior schema P0-P3 candidates are reaffirmed, superseded, or rejected
      against live source.
- [x] Existing repo patterns, prior decisions, and nearby implementation
      constraints are recorded before external research.
- [x] External docs or source are used only where repo evidence does not settle
      the question, or N/A reason is recorded.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [x] Facts, inference, and recommendation are separated.
- [x] Review or pressure lenses are selected and completed, or marked N/A with
      reason.
- [x] If implementation happens, touched-surface packs cover docs, browser,
      package/API, or agent-native surfaces as needed. N/A: planning-only.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: no artifact in this planning-only pass.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules. N/A: no package diff.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: no registry diff.
- [x] Package/API pack: no-artifact decision is planning-only, with no published user-visible delta from `main`.
- [x] Package/API pack: compatibility decision is one clean hard cut with no aliases if the proposal is accepted.
- [x] Package/API pack: package-owned typecheck/build/test proof is N/A because no package source changed.
- [x] Package/API pack: generated barrels or release notes are N/A because no exports changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the bounded full-source audit and plan checker | Source inventory, concept matrix, and checker evidence below. |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | 21 concept rows below; no unexplained public family. |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | P0-P3 table and rejected/deferred table below. |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Exact current/target shapes and rejection reasons below. |
| Review / pressure pass | yes | Run selected reviewer/lens or record N/A with reason | `best-api` call-site pressure plus current ProseMirror/Wordgard/Lexical source comparison. |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | All findings classified; implementation deliberately not authorized. |
| External-source audit | yes | Cite official/local clone/external sources when used, or record N/A | Current local clone commits and exact source owners recorded below. |
| Implementation gates | no | If code changed, close primary-template and touched-surface gates; otherwise N/A | N/A: only this plan was edited. |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Complete below. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent when files changed | N/A: no source/package/API implementation; plan checker is the artifact gate. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Searches were path-scoped and capped; one broad decode search was capped and followed by bounded owner reads. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-31-full-schema-api-audit.md` | Run after this closeout update. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Plite raw schema, Core lowering/facade, root/internal barrels, callers, docs, and proofs mapped below. |
| Release artifact classification | no | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | No published delta: planning artifact only. |
| Published package changeset | no | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | N/A: no package diff. Accepted implementation would require Plite/Core changesets. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: no registry diff. |
| No release artifact | yes | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | Planning-only; no user-visible delta from `main`. |
| Package typecheck/build/test | no | Run owning package checks or record N/A with reason | N/A: package source unchanged. |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: export layout unchanged. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | prompt, Skills, Vision, and owner sources read | current-state map |
| Current-state map | complete | 21-row concept matrix and bounded counts below | options |
| Options and recommendation | complete | P0-P3 and exact target shapes below | review |
| Review / pressure pass | complete | best-api pressure plus current local donor reads | implementation decision |
| Implementation or plan artifact | complete | plan-only decision artifact; no implementation authorized | verification |
| Verification | complete | source commands and plan checker recorded below | closeout |
| Closeout | complete | final contract names owners, order, proof, and residual defers | final response |

Findings:
- Fact: `packages/plite/src/interfaces/schema.ts` contains 82 exported schema
  types/interfaces. The schema interface, definition, and validation owners
  expose 92 top-level declarations. The breadth is justified by real laws, but
  wildcard root exports also expose compiler-carrier types that are not public
  product concepts.
- Fact: 76 package source files contain plugin schema element declarations. The
  exact text-plus-inline grammar occurs in Paragraph, Heading, Callout, and
  Media owners, plus app/proof/docs callers. It is a real common job.
- Fact: the compiler intentionally rejects omitted content for editable
  non-void elements. Noneditable void elements derive their canonical text
  child and reject redundant explicit content. This law must remain.
- Fact: `compileContent` already infers a construction default when `min > 0`
  leaves exactly one constructable candidate. Explicit defaults on
  `schema.content.text({ min: 1 })` and single-type content are redundant.
- Fact: every complete schema wraps its root grammar in a `SchemaRoot` object
  with only one field: `root: { content }`. The same ceremony affects named
  roots. Element-owned content roots are different because ownership is real.
- Fact: `unknown` and `elements` are required on complete schema input. There
  are 161 explicit `unknown: 'reject'` and 40 explicit
  `unknown: 'preserve'` occurrences in the scoped source/docs search. Reject is
  the safe, dominant default; preserve is a meaningful opt-in.
- Fact: `property.json<T>()` can currently advertise a narrow `T` without a
  validator. Runtime then proves only generic JSON. The static editor value can
  therefore lie about persisted input.
- Fact: Core exposes `schemaModel?: unknown` on `BasePluginDefinition` and
  root-exports several schema-model inference aliases. Outside Core source,
  only Core's two type-test owners use these names. They are compiler witnesses,
  not user concepts.
- Fact: Plate creation calls a lineage-only option `schema`; plugin declarations
  own the grammar. Plate also calls normal-flow block-group membership
  `topLevel`, although nested structural blocks may still be top-level inside
  their own root.
- Fact: the runtime's single valid constructor is named `createAndFill`, a name
  inherited from ProseMirror's three-constructor distinction that Plite does
  not expose.
- Fact: `validateDocument` and `validateFragment` perform JSON-shape and schema
  checks and throw, but accept already-trusted typed values. There is no public
  document decoder; docs feed `JSON.parse` into creation. The boundary should
  narrow `unknown`.
- Fact: Plate descriptors already work directly in the schema facade for
  element/property/construction queries. Plate's extra `schema.handle(Plugin)`
  path has proof callers but no production caller. Raw Plite handles remain a
  sound advanced capability.
- Fact: `significant` lives on a reusable property value descriptor even though
  it controls placement usage in HTML serialization and emptiness. The only
  production false declaration is NodeId metadata.
- Fact: current external source cursors are ProseMirror model
  `6264de069d8439131e88f8ba06973551916184e4`, Wordgard
  `01eb2b5eae509509677345fd603acad001827dff`, and Lexical
  `dd5c41b13193efa9ab1574234d8593d2c9e4f988`. ProseMirror's
  `ContentMatch` supports ordered regular grammar and its `NodeType` exposes
  `create`, `createChecked`, and `createAndFill`. Wordgard's compiled schema
  supplies wrapping/default-content queries. Lexical remains class/registry
  driven and is weaker evidence for JSON structural schema design.
- Inference: Plite's kernel is not the problem. Its JSON identity,
  reconfiguration, multi-root, property/collaboration, fitting, and validation
  laws are stronger than the common authoring surface suggests. The right work
  is to remove ceremony and leaked machinery without weakening explicit
  structure.

Atomic concept matrix:

| Concept | Current owner / shape | Decision |
|---|---|---|
| Schema identity | derived fingerprint or named `id`/`version` | keep |
| Contribution composition | partial extensions, one complete root owner | keep |
| Complete vocabulary | explicit elements/groups/properties/roots | keep; default only empty `elements` |
| Primary and named roots | `SchemaRoot { content }` | P1 flatten to `SchemaContent` |
| Element content | explicit unordered content law | keep explicit |
| Common text block | repeated text + inline + min/default | P1 semantic preset |
| Void elements | compiler-derived canonical text child | keep |
| Inline/block behavior | explicit inline/void plus derived groups | keep |
| Cardinality/defaults | `min`/`max` plus inferred or explicit constructable default | keep; omit redundant defaults |
| Content algebra | `all/any/group/not/open/text/type/types` | keep advanced substrate |
| Ordered grammar | absent | defer until a live schema funds it |
| Unknown vocabulary | required reject/preserve | P1 default reject; preserve explicit |
| Groups | built-in plus transitive product groups | keep |
| Property value laws | JSON kind/default/canonicalize/merge/validate | keep, with P0 JSON generic repair |
| Property usage role | value-level `significant` | P2 move to placement-level metadata role |
| Targets/lifecycle/exclusivity | target algebra and property policies | keep |
| Content-root ownership | direct shared shorthand or explicit ownership | keep |
| Static handles/inference | Plite handles and schema-derived value types | keep public user capabilities |
| Compiler witnesses | public `schemaModel` and provider aliases | P0 internalize |
| Runtime construction | `createAndFill`, default-root creation | P1 rename constructor to `create` |
| Runtime validation | typed `validate*` throwing at external boundary | P1 `assert*` over `unknown` |
| Fitting/slices/wrapping | compiled fitter, slice policy, `findWrapping` | keep |
| Reconfiguration/delta | atomic schema publication and semantic delta | keep |
| Plate lineage input | `schema?: PlateSchemaOptions` | P1 `schemaIdentity?: PlateSchemaIdentity` |
| Plate block membership | `topLevel?: boolean` | P1 `blockContent?: boolean` |
| Plate descriptor facade | descriptors plus `handle(Plugin)` | P2 remove redundant handle route |
| Host codecs | Plite schema facts consumed by Plate DOM/HTML | keep outside Plite |
| Diagnostics | schema-aware root/path/property errors | keep |
| Docs | broad but contain stale/redundant and one invalid void example | P0 repair with implementation |

Decisions and tradeoffs:

### Recommended ideal shape

```ts
import { defineEditorSchema, property, schema } from '@platejs/plite';

const ArticleSchema = defineEditorSchema({
  elements: {
    paragraph: schema.element.textBlock({
      properties: {
        id: property.string(),
      },
    }),
    image: {
      properties: {
        url: property.string(),
      },
      void: 'block',
    },
  },
  root: schema.content.type('paragraph', { min: 1 }),
});
```

`unknown: 'reject'` and the single constructable root default are inferred.
The text-block preset owns exactly text plus inline-element children, minimum
one child, text construction fallback, and block semantics. It accepts ordinary
element behavior/properties but cannot override `content`, `inline`, or `void`.

```ts
const editor = createPlateEditor({
  plugins,
  schemaIdentity: { id: 'article', version: 3 },
});

const paragraph = editor.read.schema.create(BaseParagraphPlugin);

editor.read.schema.assertDocument(untrusted);
// `untrusted` is narrowed only after generic JSON and compiled-schema checks.
```

```ts
schema: {
  element: {
    blockContent: false,
    content: schema.content.type(
      plugins.elementType(BaseTableCellPlugin),
      { min: 1 }
    ),
  },
}
```

### Priority table

| Priority | Decision | Why | Main owners |
|---|---|---|---|
| P0 | Make unvalidated `property.json()` infer only `PropertyJsonValue`; narrow generics require `validate` and `validationVersion` | Current types can claim a shape runtime never proves | Plite schema interfaces/definition/compiler/type tests |
| P0 | Remove public `schemaModel` and internal schema-provider/compiler aliases from normalized plugin definitions and root barrels | Public generics expose implementation machinery and violate the single public capability bridge | Core plugin compiler/runtime types/barrels; Plite internal exports |
| P0 | Repair schema docs, especially the invalid element that declares both `content` and `void`, missing `property.enum`, and false default/validation guidance | Current reference teaches code the compiler rejects | Plite schema docs and docs proofs |
| P1 | Add `schema.element.textBlock()` | Removes the dominant honest repetition without weakening structural schemas | Plite builder/compiler types; Plate declarations |
| P1 | Flatten `root` and named-root values to `SchemaContent` | `SchemaRoot` is a one-field wrapper with no ownership law | Plite declarations/compiler/docs/callers |
| P1 | Default complete-schema `unknown` to reject; default omitted `elements` to `{}` | Safe dominant policy and empty-vocabulary ceremony disappear | Plite definition normalization/inference/docs |
| P1 | Rename Plate creation `schema` to `schemaIdentity` | Current option sounds like grammar but carries only lineage | Core editor creation/docs/apps |
| P1 | Rename Plate `topLevel` to `blockContent` | The flag controls normal-flow group membership, not tree depth | Core plugin definition/lowering and structural plugins |
| P1 | Rename runtime `createAndFill` to `create` | Plite exposes one canonical valid constructor, so PM's distinction is noise | Plite runtime API; Core facade/callers/docs |
| P1 | Replace `validateDocument/Fragment(typed): void` with `assertDocument/Fragment(unknown): asserts ...` | External boundaries should accept and narrow untrusted input | Plite interface/runtime/docs and Core callers |
| P2 | Move `significant` from value descriptor to placement option such as `role: 'metadata'` | Metadata/content meaning belongs to property usage, not JSON value law | Plite property declarations; NodeId; HTML; ElementState |
| P2 | Remove Plate `schema.handle(Plugin)` and finish direct descriptor overloads | It duplicates the facade's normal descriptor path | Core facade/type tests |
| P2 | Rename predicate `markableVoid` to `isMarkableVoid` | Local consistency; small benefit and blast radius | Plite runtime/Core callers |
| P3 | Leave mixed getter/noun naming alone | Broad churn buys little; each remaining call is understandable | none |

### Explicit rejections and defers

- Reject implicit text-block content for every non-void element. It would turn
  missing structural grammar into silently valid documents.
- Reject `element: true`, string shorthands, and a preset family. One semantic
  preset covers a common job; token-saving syntax does not justify a second DSL.
- Reject keeping the `SchemaRoot` wrapper for hypothetical future fields.
  Element-owned roots already have a distinct owner type when ownership exists.
- Reject retaining compatibility aliases for renamed public methods/options.
  One hard cut is easier for both humans and agents.
- Keep `schema.content.all`, `property.set`, and target boolean combinators.
  Low production counts do not invalidate a coherent tested algebra;
  `property.set` also owns collaboration merge semantics.
- Defer ordered regular grammar. ProseMirror proves its power, but no retained
  Plate schema currently pays for a public AST/compiler/fitter expansion.
- Reject copying Lexical's class/node registry. It weakens Plite's portable JSON
  schema identity and extension composition.

Implementation notes:
- Planning-only. If accepted, sequence work as:
  1. `plite-plan`: lock P0 trust/privacy fixes and the raw Plite target API.
  2. Implement Plite types, normalization, compiler/runtime, exports, tests,
     docs, and changeset as one hard cut.
  3. `plate-plan`: lower the final Plite shape through Core; rename lineage and
     block-membership fields; update all package/app/docs consumers.
  4. Run barrels, package typechecks/tests, full Plite handoff checks, then
     affected standalone registry/browser routes where Plate callers changed.
- Deletion/hiding impact: `SchemaRoot`, old `createAndFill`, typed `validate*`,
  `PlateSchemaOptions`, `topLevel`, Plate `handle(Plugin)`, public
  `schemaModel`/compiler aliases, and old docs disappear without aliases.
- Required proof families: compile-only schema inference, narrow JSON rejection,
  default inference, derived/named identity, unknown preserve/reject, root and
  content-root grammar, void canonical construction, incremental validation,
  reconfiguration rollback/history/Yjs identity, slice fitting, descriptor
  facade inference, HTML metadata behavior, public import smoke, and current
  docs examples.

Review fixes:
- Replaced the initial narrow “just add `textBlock()`” answer with a full owner
  review. The preset remains correct, but it is only one P1 item.
- Rejected an implicit default element grammar after tracing structural and void
  paths.
- Detected compiler-owned default inference, which removes many explicit
  `default` fields without a new API.
- Detected the untrusted validation boundary after tracing value codecs and the
  database walkthrough; classified it as assertion API work rather than adding
  a redundant document codec.
- Detected the generic JSON-property lie and promoted it above cosmetic API
  cleanup.
- Revalidated external comparison against current local clone commits rather
  than trusting prior audit prose.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Workspace: `/Users/zbeyens/git/plate-2`.
- Read completely or by owning sections: Plite schema interfaces, declaration
  builders, compiler, runtime schema, editor/value-codec interfaces, creation,
  root/internal exports; Core plugin definition/compiler/lowering/facade;
  Paragraph/Heading/Callout/Media/NodeId/HTML/ElementState representative
  callers; Plite schema docs and database walkthrough; schema proof owners.
- Bounded live counts: 82 exported schema interfaces/types; 92 schema-owner
  top-level declarations; 76 package source files with plugin element schema
  declarations; 57 source/docs files containing `defineEditorSchema`; 48
  proof-family files declaring a complete schema; 39 named schema test/spec
  files; 31 Plite docs files mentioning schema; 161 explicit reject policies;
  40 explicit preserve policies; 204 `root: { ... }` matches in scoped
  package/app/docs source.
- Runtime API inventory covered all 27 current methods: construction, element
  facts, property lookup, identity/vocabulary/delta, validation, fitting,
  wrapping, roots, and behavior predicates. No current method family was
  silently omitted.
- External pressure reads used current local source only:
  ProseMirror `src/content.ts` and `src/schema.ts`; Wordgard
  `src/doc/schema.ts`; Lexical registry/static node configuration owners.
- No source tests/typechecks/browser runs: no product source changed and the
  user asked for review before implementation.

Final handoff contract:
- Recommendation: keep the kernel; accept the P0 and P1 set as one designed
  hard-cut program. Treat P2 as follow-up except metadata role if HTML work
  already touches the same contract.
- Confidence: high for P0/P1; medium for the exact public spelling of metadata
  role because only two consumers currently fund it.
- Evidence: live owner/caller/docs/proof inventory and current donor comparison
  recorded above.
- Tests / commands: read-only source inventory plus the autogoal plan checker;
  no product proof claimed.
- Browser proof: N/A for planning-only API review. Required later for changed
  Plate registry/demo consumers.
- PR / tracker: N/A: none requested.
- Caveats: ordered grammar remains deliberately deferred; a future real schema
  can reopen it with a concrete grammar and fitter/proof budget.
- Next owner: `plite-plan` for raw schema/type contract, then `plate-plan` for
  Core lowering and full adoption. Do not implement both from ad hoc local
  patches.

Timeline:
- 2026-07-31T11:48:28.107Z Major-task goal plan created.
- 2026-07-31 Skills and Vision read; explicit requirements and read-only audit
  boundaries recorded before the full source inventory.
- 2026-07-31 Full Plite/Core schema source, caller, docs, proof, export, and
  current local donor inventory completed; P0-P3 and exact ideal shapes locked.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Awaiting acceptance; then `plite-plan` followed by `plate-plan` |
| What is the goal? | Exhaustively audit the current Plite/Plate schema API and decide the smallest material improvements. |
| What have I learned? | The kernel is strong; authoring ceremony, public compiler witnesses, one JSON generic, and several names are the real defects. |
| What have I done? | Mapped the full schema surface and locked exact keep/cut/rename/defer decisions without product source edits. |

Open risks:
- Metadata-role spelling remains lower-confidence and should be validated in
  `best-api` against its two real consumers before implementation.
- Ordered grammar remains a known capability gap, not an accepted task.
