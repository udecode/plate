# Wordgard / Plite schema contribution architecture

Objective:
Execute the accepted schema-contribution and Plate node-declaration
architecture end to end, hard-cut every rejected public shape, adopt every
owner, make caller-omitted schema ownership compile to one derived base schema,
and close all focused and repository proof gates.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-21-wordgard-plite-schema-contribution-architecture.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Mode:
- `deep`: this public break crosses schema typing, compilation, configuration,
  Plate plugins, codecs, React, history, Yjs, browser behavior, and benchmarks.
  The plan still has only three phases.

Completion threshold:
- Current source, not earlier plans, is authoritative.
- Every TARGET concept has a Wordgard/Plite classification and donor verdict.
- One final API, compiled model, deletion ledger, adoption ledger, proof matrix,
  and dependency-ordered execution sequence are resolved.
- All ten execution slices are implemented without aliases, dual signatures,
  casts at public authoring sites, or explicit callback annotations.
- `.withComponent(Component)` remains the sole render-owned convenience facade
  for assigning `render.node`; `node.component`, synchronization with
  `render.node`, and every dual-write path are deleted.
- Partial schema contributions compile against one internal derived base schema;
  ordinary callers provide no fake document-schema extension or identity.
- `definePliteExampleDocumentSchema`, every caller, and every equivalent
  ordinary-example identity shim are deleted. Explicit `{id, version}` remains
  only where durable lineage, migration, History, or Yjs identity is the subject.
- Focused package tests and typechecks, source deletion audits, applicable
  browser proof, strict Plite gates, barrels, lint, and the plan checker pass.

Verification surface:
- Live Wordgard owners under `../wordgard/src/{doc,state,editor,command,history,collab}`
  and their tests.
- Live Plite schema interfaces, constructors, compiler, registry, extension
  lifecycle, construction/fitting, validation, History, Yjs, DOM, React, tests,
  browser runners, and benchmark target registry.
- Live Plate plugin types, resolution, lowering, parsing, rendering, 80
  production semantic declarations, app bindings, tests, docs, and examples.
- Exact source citations in the concept, decision, deletion, and proof ledgers.

Constraints:
- Execute all ten accepted slices without pausing between them.
- Breaking changes are allowed; aliases, dual APIs, and permanent bridges are not.
- Preserve JSON-native values, structural typing, `DocumentChange`, multi-root,
  History/Yjs correctness, host separation, and atomic configuration.
- Preserve explicit named lineage for persisted History, Yjs rooms, and schema
  migrations while making exact semantic fingerprint identity the omission path.
- Do not copy Wordgard class identity, DOM shapes in core, order precedence,
  single-document assumptions, or generic mark storage.
- Prefer the owning abstraction over a Plate-local translation patch.
- Do not touch `packages/plite-react/src/hooks/use-plite-runtime.tsx`,
  `packages/plite-react/src/hooks/use-runtime-focus-state.ts`,
  `packages/plite-react/src/components/plite.tsx`, or the reserved
  `apps/www` inline/markdown example files until their current owners finish.

Boundaries:
- In scope: `defineEditorExtension.schema`, `schema.contribution`, complete and
  partial schema inputs, property/content/target descriptors, Plate `node.type`,
  `node.element`, `node.mark`, plugin `schema`, immutable config, compilation,
  projection to parser/render/codec owners, inference, creation, fitting,
  validation, caching, reconfiguration, persistence, browser consequences,
  proof, and deletions.
- Adoption: `packages/plite*`, `packages/core`, every production/test Plate
  declaration, `apps/www/src/registry`, History, Yjs, codecs, docs, examples,
  fixtures, exports, benchmark registry, and release consumers.
- Non-goals: command-dispatch redesign, UI component design, DOM geometry,
  annotations/widgets, or an imperative renderer, except where schema changes
  invalidate their current assumptions.

Output budget strategy:
- Evidence was gathered owner-first with bounded symbol scans. Generated
  registry JSON, templates, `dist`, `node_modules`, `.next`, `.turbo`, old
  plans, and lockfiles were excluded. The exhaustive synthesis lives here.

Blocked condition:
- Block only if a named live owner becomes unreadable or two incompatible
  semantics remain undecidable after source, type, runtime, adoption, and proof
  analysis. Neither condition occurred.

Plite Plan state:
- status: executing
- phase: derived-base-schema-hard-cut
- next: restore component-only example bindings to `.withComponent(Component)`,
  prove the `node.component` hard cut and single `render.node` truth, implement
  the compiler-owned base schema, delete example schema shims, then resume
  browser and repository closure
- handoff: slices 1-9 are complete; slice 10 is source-, config-, docs-, and
  packed-release-green, while browser and broad repository closure remain open

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | The inventory, four-way classification, donor verdicts, ideal API/model, superiority proof, deletions, adoption, slices, and closure audit appear below. |
| Active goal and plan verified | yes | One-shot execution goal `019f88e3-777d-74c0-8929-84b3140be512` names the derived-base hard cut in this accepted plan. |
| Current owners read | yes | Wordgard, Plite, Plate, DOM/React, History/Yjs, proof, docs, and benchmark owners are cited below. |
| Mode and execution boundary resolved | yes | The accepted deep plan is executing in one shared checkout through ten dependency-ordered slices; late audits reopened slices 6 and 10 instead of hiding incomplete closure. |

Work Checklist:
- [x] Derive a TARGET-specific inventory from both live repositories.
- [x] Follow representation, semantics, typing, compilation, runtime,
  integrations, proof, performance, and deletion consequences.
- [x] Audit ownership, internal-detail leakage, derivable inputs, split truths,
  permissiveness, ordering, DX, substrate gaps, and scale/persistence survival.
- [x] Classify every concept and distinguish broad mechanisms from Wordgard's
  narrower surface.
- [x] Rank every worthwhile change and verdict every Wordgard mechanism.
- [x] Resolve the final Plite, Plate, extension-author, and application APIs.
- [x] Specify compiled representation, invariants, lifecycle, and ownership.
- [x] Prove the target exceeds Wordgard.
- [x] Enumerate deletions and full adoption.
- [x] Define vertical slices and closure proof.
- [x] Execute slice 1: runtime policy cache correctness.
- [x] Execute slice 2: canonical Plite contribution boundary.
- [x] Execute slice 3: structural invariants and construction plans.
- [x] Execute slice 4: Plate immutable configuration and public model API.
- [x] Execute slice 5: one Plate compilation/publication pipeline.
- [x] Execute slice 6: typed schema handles and inference closure; repair
      `InferPluginConfigTree` so nested installed plugin trees retain readonly
      structure and `plugins` instead of collapsing to a config union.
- [x] Execute slice 7: schema delta, React invalidation, and content roots.
- [x] Execute slice 8: codec and clipboard convergence.
- [x] Execute slice 9: History, Yjs, and transactional configuration closure.
- [x] Make schema omission compile one deterministic derived base schema while
      explicit `{id, version}` adds durable lineage without changing the
      semantic fingerprint.
- [x] Delete `definePliteExampleDocumentSchema`, its extension-array callers,
      and equivalent ordinary-example identity boilerplate.
- [x] Restore component-only bindings to `.withComponent(Component)`, delete
      `node.component` and all synchronization/dual-write code, and prove both
      sides of that contract with type/runtime/source audits. Evidence: 77
      component-only Apps/www bindings restored across 39 files; zero current
      `node.component` matches in Core, Apps/www source, or current docs; Core
      plugin proof passed 25/25; schema/docs guards passed 19/19 and audited
      4,969 files; Apps/www typecheck passed; Biome passed on the 49-file repair
      set, Apps/www ESLint passed, Core lint passed 401 files, Utils lint passed
      43 files; the Basic Blocks registry demo
      rendered headings and blockquotes with zero browser console errors.
- [ ] Prove partial contributions, explicit complete-schema replacement,
      duplicate explicit ownership, History/Yjs identity, type inference, and
      affected browser examples under the final contract.
- [ ] Execute slice 10: full source adoption, docs, release consumers, and hard
      deletion; source/config/docs/packed-consumer work is green, while browser
      regressions and broad repository closure remain.
- [ ] Run focused owner proof, browser proof, strict gates, source audits,
      autoreview, and final `check-complete.mjs`.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every architecture and ownership decision | Decision brief, ranked changes, slices |
| Fresh source evidence | yes | Recheck decision-changing current claims | Exact live citations throughout |
| Conditional risk and adoption | yes | Resolve browser, benchmark, persistence, docs, and release owners | Proof/adoption matrices |
| Verification recorded | yes | Record fresh implementation proof and checker | Focused source/type/config/release evidence is recorded below; browser and broad repository closure are pending. |
| Handoff prepared | yes | State edits, proof, blockers, and residual risks | An interim handoff is recorded below; repository closure is not prepared while slice 10 and final gates remain open. |
| Autoreview | yes | Review the final implementation and repair accepted findings | Pending after broad and browser proof. |
| Goal plan complete | yes | Run `check-complete.mjs` after every execution row closes | Pending the final repository gates; do not claim checker-green before them. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Live source inventory and production consumer census | Decide |
| Decide | complete | Concept/decision ledgers and hard-cut API | Execute |
| Execute slices 1-3 | complete | Plite cache rebinding, direct contribution API, structural invariants, construction plans, laws, typecheck, and strict benchmark rows | Close repository gates |
| Execute slices 4-6 | complete | Atomic Plate model publication, immutable config, one host projection, exact non-forgeable schema handles, nested/dependency inference, and fresh public declaration emission are green | Close repository gates |
| Execute slices 7-9 | complete | Schema delta, bounded root ownership, canonical projected clipboard, History/Yjs laws, and post-freeze focused Chromium rows | Run closure browser matrix |
| Execute slice 10 | in progress | Markdown/Csv use immutable versioned configuration, public recursive helpers expose prepared contexts without runtime leakage, the fresh 4,969-file source/docs deletion audit and packed consumer are green; CI-controlled registry output remains regeneration-owned | Restore retained facades, regenerate registry output in CI, repair browser gaps, and run broad repository gates |
| Prove and hand off | in progress | Focused runtime/type/config/release proof and two consecutive strict architecture benchmarks are green; command continuation package laws pass, but heading-start Chromium is red | Focused browser repair, matrix, broad checks, autoreview, checker |

Decision brief:
- **HHF:** Plite's schema engine is already substantially better than
  Wordgard. The ugly part is the authoring/projection layer, not the compiler.
- Keep the raw extension slot named `schema`; hard-cut required caller-facing
  `schema.contribution(...)`. `defineEditorExtension` owns normalization.
- Plate gets one model owner: top-level `type` plus `schema.element`,
  `schema.mark`, or advanced `schema` factory. Delete the `node` garbage drawer.
- Rendering stays render-owned: `.withComponent(Component)` is the one concise
  convenience facade and writes only `render.node`. It is not a compatibility
  alias and is not part of the schema hard cut. Delete only `node.component`,
  its synchronization, and dual-write behavior.
- `schema.mark` takes a property descriptor, not `true`; advanced lifecycle uses
  `{ property, ...lifecycle }`.
- A schema factory reads immutable configuration only. Mutable plugin state can
  never change grammar or persistence identity.
- Plugin references are explicit and typed. Literal schema type strings remain
  literal. Delete magic string reinterpretation.
- Compile each Plate descriptor once into Plite schema plus immutable host
  bindings for parser, React/static rendering, and codecs; publish all in one
  candidate configuration revision.
- Plate schema identity is zero-ceremony by default: omission derives the exact
  deterministic semantic fingerprint. An explicit `{ id, version }` is optional
  durable lineage for persistence, collaboration, and migrations across
  fingerprint changes. Plite compilation still creates exactly one complete
  identity descriptor: `{ kind: 'derived', fingerprint }` or
  `{ kind: 'named', id, version, fingerprint }`. Callers never assemble a
  partial identity, and lineage is excluded from the fingerprint.
- Plate normal-flow root eligibility is explicit: non-inline elements default
  to `schema.element.topLevel:true`; nested structural types use
  `topLevel:false` and compile into no public structural group. The private
  `plate:block-content` group is the sole Plate root grammar input.
- Derive structural block membership and the canonical empty text child for
  non-editable voids. Callers stop repeating compiler facts.
- Keep Wordgard's compiled-relation, fitted-construction, and schema-derived
  host ideas; reject its classes, generic marks, DOM-in-core, precedence, cache,
  single root, and persistence model.

## Current-source inventory

### Wordgard

Wordgard represents nodes and schema elements as class/singleton identities,
compiles relationship tables, uses schema-driven construction/fitting, and
ties parsing/serialization/rendering to DOM `shape`. Core evidence:

- Node/type/tag representation: [node.ts](/Users/zbeyens/git/wordgard/src/doc/node.ts:23), [node.ts](/Users/zbeyens/git/wordgard/src/doc/node.ts:465).
- Mark representation/policies: [mark.ts](/Users/zbeyens/git/wordgard/src/doc/mark.ts:77), [mark.ts](/Users/zbeyens/git/wordgard/src/doc/mark.ts:213).
- Compiler, defaults, relations, wrapping, overrides, cache: [schema.ts](/Users/zbeyens/git/wordgard/src/doc/schema.ts:43), [schema.ts](/Users/zbeyens/git/wordgard/src/doc/schema.ts:124), [schema.ts](/Users/zbeyens/git/wordgard/src/doc/schema.ts:189), [schema.ts](/Users/zbeyens/git/wordgard/src/doc/schema.ts:323), [schema.ts](/Users/zbeyens/git/wordgard/src/doc/schema.ts:344).
- Contribution/configuration lifecycle: [state.ts](/Users/zbeyens/git/wordgard/src/state/state.ts:590), [state.ts](/Users/zbeyens/git/wordgard/src/state/state.ts:700), [state.ts](/Users/zbeyens/git/wordgard/src/state/state.ts:804).
- Fitting/correction: [change.ts](/Users/zbeyens/git/wordgard/src/doc/change.ts:859), [change.ts](/Users/zbeyens/git/wordgard/src/doc/change.ts:1002), [correction.ts](/Users/zbeyens/git/wordgard/src/state/correction.ts:13).
- Parser/serializer/clipboard: [parse.ts](/Users/zbeyens/git/wordgard/src/doc/parse.ts:146), [serialize.ts](/Users/zbeyens/git/wordgard/src/doc/serialize.ts:109), [clipboard.ts](/Users/zbeyens/git/wordgard/src/editor/clipboard.ts:66).
- Proof: [test-schema.ts](/Users/zbeyens/git/wordgard/test/test-schema.ts:7), [test-change.ts](/Users/zbeyens/git/wordgard/test/test-change.ts:127).

### Plite

Plite already has immutable structural inputs, explicit content/property/target
algebras, deterministic compilation, multi-root grammar, canonical fitting,
atomic reconfiguration, persistence identity, generated laws, and benchmark
authority:

- Public schema model and inference: [schema.ts](/Users/zbeyens/git/plate-2/packages/plite/src/interfaces/schema.ts:17), [schema.ts](/Users/zbeyens/git/plate-2/packages/plite/src/interfaces/schema.ts:91), [schema.ts](/Users/zbeyens/git/plate-2/packages/plite/src/interfaces/schema.ts:157), [schema.ts](/Users/zbeyens/git/plate-2/packages/plite/src/interfaces/schema.ts:314), [schema.ts](/Users/zbeyens/git/plate-2/packages/plite/src/interfaces/schema.ts:637).
- Redundant contribution normalization: [schema-definition.ts](/Users/zbeyens/git/plate-2/packages/plite/src/core/schema-definition.ts:727), [editor-extension.ts](/Users/zbeyens/git/plate-2/packages/plite/src/core/editor-extension.ts:388).
- Compiled tables/conflicts/fingerprint: [schema-compiler.ts](/Users/zbeyens/git/plate-2/packages/plite/src/core/schema-compiler.ts:1686), [schema-compiler.ts](/Users/zbeyens/git/plate-2/packages/plite/src/core/schema-compiler.ts:2338), [schema-compiler.ts](/Users/zbeyens/git/plate-2/packages/plite/src/core/schema-compiler.ts:2476), [schema-compiler.ts](/Users/zbeyens/git/plate-2/packages/plite/src/core/schema-compiler.ts:2526).
- Atomic configuration/migration: [editor-extension.ts](/Users/zbeyens/git/plate-2/packages/plite/src/core/editor-extension.ts:1203).
- Fitting and incremental validation: [public-state.ts](/Users/zbeyens/git/plate-2/packages/plite/src/core/public-state.ts:5308), [editor-schema.ts](/Users/zbeyens/git/plate-2/packages/plite/src/core/editor-schema.ts:5567).
- Proof and targets: [schema-compiler-laws.test.ts](/Users/zbeyens/git/plate-2/packages/plite/test/schema-compiler-laws.test.ts:110), [incremental-schema-validation.test.ts](/Users/zbeyens/git/plate-2/packages/plite/test/incremental-schema-validation.test.ts:160), [slate-v2.json](/Users/zbeyens/git/plate-2/benchmarks/targets/slate-v2.json:83).

### Plate census

The live TS-AST census found **80 production semantic declarations**: 52
elements, 20 marks, and 8 schema-only property plugins; with tests/configuration
there are **434 node-or-schema config occurrences in 180 files**. Plate exposes
three overlapping model inputs and then rebuilds more truths:

- Public split: [PluginConfig.ts](/Users/zbeyens/git/plate-2/packages/core/src/lib/plugin/PluginConfig.ts:216), [PluginConfig.ts](/Users/zbeyens/git/plate-2/packages/core/src/lib/plugin/PluginConfig.ts:255), [PluginConfig.ts](/Users/zbeyens/git/plate-2/packages/core/src/lib/plugin/PluginConfig.ts:308).
- Multi-channel lowering and magic type rewriting: [withPlite.ts](/Users/zbeyens/git/plate-2/packages/core/src/lib/editor/withPlite.ts:310), [withPlite.ts](/Users/zbeyens/git/plate-2/packages/core/src/lib/editor/withPlite.ts:444).
- Parser/render duplicates: [prepareParserRegistry.ts](/Users/zbeyens/git/plate-2/packages/core/src/internal/plugin/prepareParserRegistry.ts:150), [pipeRenderElement.tsx](/Users/zbeyens/git/plate-2/packages/core/src/react/utils/pipeRenderElement.tsx:338), [pipeRenderLeaf.tsx](/Users/zbeyens/git/plate-2/packages/core/src/react/utils/pipeRenderLeaf.tsx:74).
- Representative production shapes: [BaseCodeDrawingPlugin.ts](/Users/zbeyens/git/plate-2/packages/code-drawing/src/lib/BaseCodeDrawingPlugin.ts:19), [BaseTextAlignPlugin.ts](/Users/zbeyens/git/plate-2/packages/basic-styles/src/lib/BaseTextAlignPlugin.ts:29), [BaseCommentPlugin.ts](/Users/zbeyens/git/plate-2/packages/comment/src/lib/BaseCommentPlugin.ts:54), [BaseSuggestionPlugin.ts](/Users/zbeyens/git/plate-2/packages/suggestion/src/lib/BaseSuggestionPlugin.ts:96).

## Complete concept ledger

`Class` judges current Plite/Plate against Wordgard. `Donor verdict` accounts
for the target architecture, not surface prettiness.

| # | Concept | Class | Live comparison and blunt explanation | Donor verdict |
| ---: | --- | --- | --- | --- |
| 1 | Runtime document representation | superior | Plite schema describes plain JSON; Wordgard requires `Plot`/`Leaf` class identity ([Plite schema](/Users/zbeyens/git/plate-2/packages/plite/src/interfaces/schema.ts:314), [Wordgard node](/Users/zbeyens/git/wordgard/src/doc/node.ts:23)). Wordgard is narrower, not cleaner. | reject classes; keep JSON |
| 2 | Type identity | superior | Plite uses structural names plus semantic fingerprint ([compiler](/Users/zbeyens/git/plate-2/packages/plite/src/core/schema-compiler.ts:2597)); Wordgard uses constructor/singleton identity ([schema](/Users/zbeyens/git/wordgard/src/doc/schema.ts:64)). | reject |
| 3 | Node taxonomy | different tradeoff | Wordgard compiles leaf/plot/inline/block/atom flags ([node](/Users/zbeyens/git/wordgard/src/doc/node.ts:12)); Plite compiles a broader behavior object ([compiler](/Users/zbeyens/git/plate-2/packages/plite/src/core/schema-compiler.ts:612)). Packed bits are not useful without a measured hot-path win. | keep semantics; defer bit packing |
| 4 | Content grammar | superior | Plite has composable all/any/not/type/types/group/text rules with min/max/default ([schema](/Users/zbeyens/git/plate-2/packages/plite/src/interfaces/schema.ts:157)); Wordgard has one inline/block query plus can-be-empty ([node](/Users/zbeyens/git/wordgard/src/doc/node.ts:792)). | keep Plite |
| 5 | Missing content grammar | inferior | Current Plite permits absent content then guesses from children ([editor-schema](/Users/zbeyens/git/plate-2/packages/plite/src/core/editor-schema.ts:1389)); Wordgard always has a compiled containment answer. | steal closed semantics; require explicit open grammar |
| 6 | Node properties | superior | Plite supports independent typed/defaulted/lifecycle properties; Wordgard has one `param` and pushes unrelated metadata into marks ([node](/Users/zbeyens/git/wordgard/src/doc/node.ts:61)). | reject `param`; keep properties |
| 7 | Property value laws | superior with holes | Plite validates/canonicalizes JSON, numbers, sets, defaults, and policies ([schema-definition](/Users/zbeyens/git/plate-2/packages/plite/src/core/schema-definition.ts:193)); Wordgard uses generic deep comparison ([helper](/Users/zbeyens/git/wordgard/src/doc/helper.ts:5)). Current `property.json<T>()` can promise an unvalidated T ([schema-definition](/Users/zbeyens/git/plate-2/packages/plite/src/core/schema-definition.ts:392)). | keep laws; hard-cut unvalidated generic T |
| 8 | Marks/text properties | superior substrate, inferior Plate surface | Plite models marks as targeted typed text properties; Wordgard wrongly uses marks for alignment, spans, image width, etc. ([Wordgard types](/Users/zbeyens/git/wordgard/src/types/schema.ts:50)). Plate's `true | {value}` is a special two-shape DSL ([PluginConfig](/Users/zbeyens/git/plate-2/packages/core/src/lib/plugin/PluginConfig.ts:267)). | keep property model; replace Plate boolean magic with descriptor |
| 9 | Mark lifecycle | equivalent mechanism, Plite broader | Both support inclusive/split/type-change preservation; Wordgard `withMarksFrom` keeps allowed marks ([schema](/Users/zbeyens/git/wordgard/src/doc/schema.ts:110)), Plite generalizes it to properties ([schema](/Users/zbeyens/git/plate-2/packages/plite/src/interfaces/schema.ts:91)). | keep Plite |
| 10 | Groups | superior | Plite has named structural group inheritance, cycles/conflicts, built-ins, and compiled membership ([compiler](/Users/zbeyens/git/plate-2/packages/plite/src/core/schema-compiler.ts:663)); Wordgard uses opaque identities ([node](/Users/zbeyens/git/wordgard/src/doc/node.ts:236)). | reject opaque groups |
| 11 | Structural block membership | inferior | Plite compiler makes `block` opt-in while runtime `isBlock` means `!inline` ([compiler](/Users/zbeyens/git/plate-2/packages/plite/src/core/schema-compiler.ts:1886), [editor-schema](/Users/zbeyens/git/plate-2/packages/plite/src/core/editor-schema.ts:5964)). Callers repeat `groups:['block']`. | rearchitect: derive block |
| 12 | Semantic roles/capabilities | different tradeoff | Wordgard roles for code/list/line-break are discoverable but class identities leak into commands/codecs ([node](/Users/zbeyens/git/wordgard/src/doc/node.ts:287)); Plite avoids product roles but some policy lives in Plate glue. | rearchitect as structural capabilities only when cross-owner evidence exists |
| 13 | Defaults | superior | Plite defaults are explicit compiled plans; Wordgard chooses the first defaultable registered type ([schema](/Users/zbeyens/git/wordgard/src/doc/schema.ts:131)). | reject order defaults |
| 14 | Element/void construction | inferior | Plite compiler derives void flags but callers repeat empty text grammar and representation later repairs it ([compiler](/Users/zbeyens/git/plate-2/packages/plite/src/core/schema-compiler.ts:603), [representation](/Users/zbeyens/git/plate-2/packages/plite/src/core/representation.ts:222)). Wordgard creates/fills from schema ([schema](/Users/zbeyens/git/wordgard/src/doc/schema.ts:145)). | steal construction ownership; derive canonical void child |
| 15 | Validation boundary | superior with a correctness gap | Plite validates external JSON and compiled constraints; Wordgard parameter validation is mostly JSON-ingest only ([Wordgard schema](/Users/zbeyens/git/wordgard/src/doc/schema.ts:290)). But Plite element-key validation is optional through `element()` ([schema-definition](/Users/zbeyens/git/plate-2/packages/plite/src/core/schema-definition.ts:804)). | move complete key validation to compiler boundary |
| 16 | Equality/canonicalization | superior | Plite descriptors own canonical policies and canonical changes; Wordgard auto-coalesces nodes but generic equality lacks codec ownership ([node](/Users/zbeyens/git/wordgard/src/doc/node.ts:336)). | keep Plite |
| 17 | Property update algebra | superior | Plite has canonical property deltas and laws; Wordgard changes marks finely but node `param` changes replace tokens ([change](/Users/zbeyens/git/wordgard/src/doc/change.ts:63)). | keep Plite |
| 18 | Public schema contribution syntax | different tradeoff, current DX inferior | Wordgard directly registers a schema element facet ([state](/Users/zbeyens/git/wordgard/src/state/state.ts:804)); Plite requires `schema: schema.contribution({...})`, although the builder only normalizes/freezes and the extension clones again ([schema-definition](/Users/zbeyens/git/plate-2/packages/plite/src/core/schema-definition.ts:727), [editor-extension](/Users/zbeyens/git/plate-2/packages/plite/src/core/editor-extension.ts:388)). | keep slot; hard-cut required wrapper |
| 19 | Complete schema identity | superior | Plite has one compiler-owned complete identity and semantic fingerprint ([compiler](/Users/zbeyens/git/plate-2/packages/plite/src/core/schema-compiler.ts:1726)); Wordgard persists no schema identity ([state](/Users/zbeyens/git/wordgard/src/state/state.ts:215)). | keep one complete compiler owner; derive exact-fingerprint identity when Plate omits lineage; accept optional explicit id/version only for durable persistence/collaboration/migration lineage |
| 20 | Contribution composition/conflicts | superior | Plite rejects duplicate owners and overlapping selectors with provenance ([compiler](/Users/zbeyens/git/plate-2/packages/plite/src/core/schema-compiler.ts:1825), [compiler](/Users/zbeyens/git/plate-2/packages/plite/src/core/schema-compiler.ts:2338)); Wordgard ordered overrides silently decide meaning ([schema](/Users/zbeyens/git/wordgard/src/doc/schema.ts:344)). | reject overrides/order |
| 21 | Extension ordering | superior semantics, dead plumbing | Plite fingerprints/order-compiles by owner and rejects semantic conflicts; `record.order` is unreachable after unique names ([compiler](/Users/zbeyens/git/plate-2/packages/plite/src/core/schema-compiler.ts:45), [compiler](/Users/zbeyens/git/plate-2/packages/plite/src/core/schema-compiler.ts:1707)). Wordgard exposes precedence buckets ([state](/Users/zbeyens/git/wordgard/src/state/state.ts:700)). | hard-cut schema order |
| 22 | Compiled relation tables | superior | Both compile containment/membership, but Plite also compiles roots, targets, properties, defaults, reverse parents, vocabulary, and fingerprint ([compiler](/Users/zbeyens/git/plate-2/packages/plite/src/core/schema-compiler.ts:2476)). | keep; no rewrite |
| 23 | Wrapping plans | equivalent mechanism, Plite broader | Wordgard BFS-caches by type names ([schema](/Users/zbeyens/git/wordgard/src/doc/schema.ts:159)); Plite precompiles direct plans and weakly caches fallback searches by schema revision ([compiler](/Users/zbeyens/git/plate-2/packages/plite/src/core/schema-compiler.ts:207)). | keep Plite |
| 24 | Compiler cache | superior with a high-priority bug | Plite has bounded structural caching ([registry](/Users/zbeyens/git/plate-2/packages/plite/src/core/schema-contribution-registry.ts:18)); Wordgard scans a global identity-array cache ([schema](/Users/zbeyens/git/wordgard/src/doc/schema.ts:323)). Plite's declaration key excludes live validator identity and may reuse an old function. | fix runtime policy rebinding first; reject Wordgard cache |
| 25 | Reading/query API | different tradeoff | Wordgard has discoverable compiled queries but class-typed results ([schema](/Users/zbeyens/git/wordgard/src/doc/schema.ts:77)); Plite exposes broader string/context queries and loses inferred types in `createAndFill` ([editor](/Users/zbeyens/git/plate-2/packages/plite/src/interfaces/editor.ts:901)). | add descriptor-bound typed handles; keep raw advanced queries |
| 26 | Type inference | superior foundation, incomplete | Complete Plite definitions infer vocabulary ([schema](/Users/zbeyens/git/plate-2/packages/plite/src/interfaces/schema.ts:637)); partial contributions and Plate plugin sets do not ([schema](/Users/zbeyens/git/plate-2/packages/plite/src/interfaces/schema.ts:781), [PluginConfig](/Users/zbeyens/git/plate-2/packages/core/src/lib/plugin/PluginConfig.ts:627)). Wordgard depends on classes. | extend structural inference across contributions/plugins |
| 27 | Transactional reconfiguration | superior | Plite stages schema/document, requires migration, publishes or rolls back ([editor-extension](/Users/zbeyens/git/plate-2/packages/plite/src/core/editor-extension.ts:1203)); Wordgard rewraps old content under the new schema ([state](/Users/zbeyens/git/wordgard/src/state/state.ts:163)). | keep Plite lifecycle |
| 28 | Schema factory/configuration | inferior in Plate and a Plite gap | Plate snapshots mutable `options` once for `plugin.schema`, while `setOption` later mutates a separate store without recompilation ([withPlite](/Users/zbeyens/git/plate-2/packages/core/src/lib/editor/withPlite.ts:448), [getEditorPlugin](/Users/zbeyens/git/plate-2/packages/core/src/lib/plugin/getEditorPlugin.ts:162)). | add pure Plite factory; split immutable config from runtime state |
| 29 | Schema migration | superior | Plite validates/fits the candidate and makes canonicalization explicit; Wordgard has no versioned migration contract. | keep Plite |
| 30 | Construction locality | different tradeoff | Plite compiles allowed property IDs but `createAndFill` scans all properties for defaults ([compiler](/Users/zbeyens/git/plate-2/packages/plite/src/core/schema-compiler.ts:2400), [editor-schema](/Users/zbeyens/git/plate-2/packages/plite/src/core/editor-schema.ts:1452)). | compile per-type construction plans |
| 31 | Slice fitting | superior breadth, Wordgard mechanism validated | Wordgard's grammar-driven fit/wrapper/drop logic is excellent ([change](/Users/zbeyens/git/wordgard/src/doc/change.ts:859)); Plite already has `ContentSlice`, canonical `DocumentChange`, multi-root and extensive fit laws. | keep Plite fitter; enforce it as sole external insert path |
| 32 | Correction/local validation | equivalent mechanism, Plite broader | Wordgard schedules corrections by change-local triggers ([correction](/Users/zbeyens/git/wordgard/src/state/correction.ts:13)); Plite differentially validates `DocumentChange` windows ([editor-schema](/Users/zbeyens/git/plate-2/packages/plite/src/core/editor-schema.ts:5567)). | keep Plite; steal no extender API |
| 33 | Commands consulting schema | equivalent | Wordgard commands query compiled schema ([commands](/Users/zbeyens/git/wordgard/src/command/commands.ts:38)); Plite state/tx schema APIs do likewise. | keep; commands never become schema truth |
| 34 | Parser/codec derivation | inferior in Plate | Wordgard derives parse rules from schema shapes ([parse](/Users/zbeyens/git/wordgard/src/doc/parse.ts:146)); Plate separately trusts `node.element/mark` after compiling Plite schema ([prepareParserRegistry](/Users/zbeyens/git/plate-2/packages/core/src/internal/plugin/prepareParserRegistry.ts:150)). | steal one-definition derivation in host layer |
| 35 | DOM shape in core | superior separation | Wordgard mandates `shape` in node specs ([node](/Users/zbeyens/git/wordgard/src/doc/node.ts:193)); Plite core stays DOM-free and React derives void/inline behavior from compiled schema ([editable-text-blocks](/Users/zbeyens/git/plate-2/packages/plite-react/src/components/editable-text-blocks.tsx:789)). | reject Wordgard shape; keep host separation |
| 36 | Plate model ownership | inferior | `PluginBaseNode` mixes type, grammar, mark, component, decoration mode, unsafe attributes and data projection ([PluginConfig](/Users/zbeyens/git/plate-2/packages/core/src/lib/plugin/PluginConfig.ts:308)); Wordgard at least has one obvious model owner. | rearchitect: one `schema`, separate render/host, delete `node` |
| 37 | Plugin key/type/property terminology | inferior | Plate defaults every `node.type` to plugin key even for property-only plugins ([createBasePlugin](/Users/zbeyens/git/plate-2/packages/core/src/lib/plugin/createBasePlugin.ts:318)); TextAlign uses pseudo-node type `align` as a property key ([BaseTextAlign](/Users/zbeyens/git/plate-2/packages/basic-styles/src/lib/BaseTextAlignPlugin.ts:63)). | split plugin `key`, top-level document `type`, and owner-relative property key |
| 38 | Plugin references | inferior | Any raw schema type string matching a plugin key is silently rewritten; a miss remains literal ([withPlite](/Users/zbeyens/git/plate-2/packages/core/src/lib/editor/withPlite.ts:310)). | hard-cut magic; use explicit typed references |
| 39 | Plate parser/render/static truth | inferior | Parser, React element/leaf pipes, and static attributes independently inspect `node` flags ([prepareParserRegistry](/Users/zbeyens/git/plate-2/packages/core/src/internal/plugin/prepareParserRegistry.ts:150), [pipeRenderElement](/Users/zbeyens/git/plate-2/packages/core/src/react/utils/pipeRenderElement.tsx:338)). | compile one host binding and publish atomically |
| 40 | React schema-only invalidation | inferior | A behavior-only schema reconfiguration may emit no document change, while node subscriptions fan out by changed runtime IDs ([use-editor-selector](/Users/zbeyens/git/plate-2/packages/plite-react/src/hooks/use-editor-selector.tsx:241)). Mounted inline/void DOM can remain stale. | add compiled schema delta and type-index invalidation |
| 41 | Host codec architecture | superior substrate, inferior ownership tokens | Plite DOM codecs are pure, fitted and transactionally validated ([host-codec](/Users/zbeyens/git/plate-2/packages/plite-dom/src/plugin/host-codec.ts:58)); ordinary claims still repeat raw type/declaration identity. | keep substrate; derive claims from compiled descriptors |
| 42 | Clipboard representation | superior canonical path, inferior projected path | Canonical payload is versioned `ContentSlice` ([dom-clipboard-runtime](/Users/zbeyens/git/plate-2/packages/plite-dom/src/plugin/dom-clipboard-runtime.ts:125)); projected copy writes incompatible raw descendants under the same MIME ([projected-clipboard](/Users/zbeyens/git/plate-2/packages/plite-react/src/editable/projected-clipboard.ts:18)). | hard-cut duplicate path |
| 43 | Plaintext construction | inferior | Plite DOM spreads existing block/text objects across lines ([host-codec](/Users/zbeyens/git/plate-2/packages/plite-dom/src/plugin/host-codec.ts:200)); Wordgard asks schema for wrapping/defaults ([clipboard](/Users/zbeyens/git/wordgard/src/editor/clipboard.ts:90)). | steal schema-owned construction |
| 44 | Multi-root | superior | Plite compiles primary plus named roots ([compiler](/Users/zbeyens/git/plate-2/packages/plite/src/core/schema-compiler.ts:2007)); Wordgard requires exactly one document type ([schema](/Users/zbeyens/git/wordgard/src/doc/schema.ts:245)). | keep Plite |
| 45 | Projected content roots | inferior implementation | Plite declares singular `contentRoot`, public JSON uses magic `childRoots`, React repeatedly scans all roots to find owners ([schema](/Users/zbeyens/git/plate-2/packages/plite/src/interfaces/schema.ts:195), [content-root-owners](/Users/zbeyens/git/plate-2/packages/plite-react/src/editable/content-root-owners.ts:69)). | rearchitect typed `contentRoots` plus incremental owner index |
| 46 | History persistence | superior | Plite History stores canonical changes and schema identity ([history](/Users/zbeyens/git/plate-2/packages/plite-history/src/history.ts:20), [history-codec](/Users/zbeyens/git/plate-2/packages/plite-history/src/history-codec.ts:40)); Wordgard decodes against current class schema with no version. | keep Plite |
| 47 | Collaboration | superior | Plite Yjs negotiates a semantic fingerprint plus named lineage when configured and applies contextual merge policy ([schema-metadata](/Users/zbeyens/git/plate-2/packages/yjs/src/core/schema-metadata.ts:6), [controller](/Users/zbeyens/git/plate-2/packages/yjs/src/core/controller.ts:166)); Wordgard assumes compatible type identity out of band ([collab](/Users/zbeyens/git/wordgard/src/collab/collab.ts:90)). | keep Yjs boundary; support derived and named identity without making lineage part of the fingerprint |
| 48 | Failure isolation | superior host substrate | Plite codec providers have parse/serialize isolation and configuration rollback ([host-codec test](/Users/zbeyens/git/plate-2/packages/plite-dom/test/host-codec.test.ts:426)); Wordgard throws synchronously through optional providers. Fatal schema conflicts should still abort atomically. | keep; one error sink for optional host projections |
| 49 | Proof laws | superior | Plite has compiler, fit, target-oracle, incremental-validation, History/Yjs and codec laws; Wordgard schema proof is seven direct cases ([test-schema](/Users/zbeyens/git/wordgard/test/test-schema.ts:7)). | preserve and extend Plite |
| 50 | Performance/release contract | superior | Plite owns compile/query/validation/reconfigure/heap targets ([slate-v2.json](/Users/zbeyens/git/plate-2/benchmarks/targets/slate-v2.json:83)); Wordgard has no schema benchmark lane. | preserve; add many-contributor and schema-delta rows |
| 51 | Browser proof | different tradeoff | Plite indirectly proves schema-driven behaviors but has no direct live schema-reconfiguration browser row; Wordgard browser tests cover parse/serialize but not Plite's multi-host matrix. | add direct Chromium/WebKit proof |
| 52 | Docs/agent DX | inferior at the questioned surface | Plite docs teach `schema: schema.contribution` ([extensions](/Users/zbeyens/git/plate-2/content/docs/plite/concepts/08-extensions.mdx:220)); Plate docs teach the overloaded `node` bag ([plugin guide](/Users/zbeyens/git/plate-2/content/docs/(guides)/plugin.mdx:37)). | rewrite around one owner and explicit configuration |

## Ranked architecture changes

Ordered by correctness/dependency/value, not ease:

1. **Fix runtime policy-cache rebinding.** Structural persisted identity stays
   policy-id/version based, but a compiled cache can never retain another live
   configuration's validator function.
2. **Make extension `schema` the public contribution boundary.** Accept static
   input or pure immutable-config factory; normalize once privately; remove
   required `schema.contribution` and public normalized/input split.
3. **Split immutable plugin configuration from mutable runtime state.** Schema,
   codecs, parser, and persistence derive only from transactional config.
4. **Replace Plate's `node` bag with one `schema` owner.** Move model `type`
   top-level; move component/decoration/DOM policies to render/host owners.
5. **Replace string alias magic with typed plugin/schema references.** Unknown or
   disabled plugin references fail compilation; literal types are never rewritten.
6. **Compile one Plate descriptor into all semantic/host projections.** Plite
   schema, parser, render/static classification, and ordinary codec claims share
   one candidate revision.
7. **Close structural invariants.** Derive non-inline `block`, derive canonical
   non-editable void content, require explicit content/open grammar, and validate
   every key at the compiler boundary.
8. **Make property declarations honest.** Replace `mark:true` with typed
   descriptors, require policies for typed JSON, resolve `significant`, and add
   owner-local lifecycle wrappers.
9. **Complete structural inference and typed handles.** Partial contributions and
   Plate plugins refine application `Value`; construction/query APIs accept
   descriptors instead of forcing strings/context reconstruction.
10. **Compile construction and schema-delta indexes.** Per-type defaults avoid
    global property scans; changed behavior/property/root sets drive local React
    and host invalidation.
11. **Unify projected roots and clipboard.** Typed multi-slot content roots use an
    incremental owner index and canonical `ContentSlice` clipboard/host codecs.
12. **Delete translation/equivalence/order machinery and adopt every consumer.**
    No old shapes remain in source, tests, docs, examples, fixtures, or release
    consumers.
13. **Close proof/performance/browser contracts.** Add generated contribution
    reconfiguration laws, many-plugin benchmarks, large-doc migration/invalidation
    budgets, and Chromium/WebKit transactional schema proof.

## Wordgard mechanism verdict ledger

| Wordgard mechanism | Verdict | Target disposition |
| --- | --- | --- |
| Class-based `Plot`/`Leaf`/`Tag`/`Mark` document | reject | Plain structural JSON only. |
| Singleton/default versus valued `.Type.of(param)` split | reject | One typed structural property/element declaration system. |
| Generic node `param` | reject | Independent named properties with descriptors. |
| Generic marks for node metadata | reject | Text properties stay distinct from element properties. |
| Compiled inline/block/atom/selectable behavior | steal | Compile from structural schema; derive invariants. |
| Opaque groups and roles | rearchitect | Named groups and explicit structural capabilities. |
| Simple content query + `canBeEmpty` | reject | Keep Plite's richer grammar/cardinality. |
| First-defaultable registration default | reject | Explicit unambiguous defaults only. |
| Recursive `createAndFill` | steal | Per-type compiled construction plans, multi-root aware. |
| `canContain`/`markAllowed` maps | keep equivalent | Plite's maps are already broader. |
| Wrapping BFS cache | keep equivalent | Plite's revision cache already owns it. |
| `Schema.Override` callbacks | hard-cut | Contributions merge only through explicit conflict-free declarations. |
| Array/class-identity global schema cache | reject | Keep bounded structural cache with live resource rebinding. |
| Facet schema contributions | steal ownership clarity | One descriptor-owned extension/plugin schema slot. |
| Nested extension flattening and precedence buckets | reject for schema | Configuration may order host handlers, never schema meaning. |
| Transaction effects for reconfiguration | keep concept | Plite's atomic candidate/migration lifecycle is stronger. |
| Rewrap old document on schema change | reject | Explicit migration/fitting or rollback. |
| Schema-driven fitter | steal/keep | Plite fitter remains sole external insertion path. |
| Change-local correction triggers | keep intent | Plite incremental validation/canonical change worklists own it. |
| Schema-aware commands | keep | Queries only; commands are never schema/persistence truth. |
| Schema-derived parser/serializer | move | Host codec/Plate compiler derives projections; core stays DOM-free. |
| Mandatory DOM `shape` in node spec | reject | React/DOM/Plate host owners remain separate. |
| Shape override dependency caching | rearchitect | Immutable host bindings plus precise configuration/schema deltas. |
| Selection/input flags | steal selectively | Core semantic flags only; product command policy stays Plate. |
| Schema-owned JSON decoder | steal semantics | Versioned structural property codecs/policies, no class decoder. |
| ChangeSet history/collab bound to current classes | reject | Keep canonical DocumentChange plus schema identity/Yjs. |
| Seven direct schema tests and randomized change laws | keep laws, expand | Retain randomized algebra and add generated schema/config/browser laws. |
| No schema benchmark/release owner | reject | Keep Plite target registry and strengthen it. |

## Ideal public API

### Raw Plite: simple partial contribution

```ts
const TablesExtension = defineEditorExtension({
  name: 'tables',
  schema: {
    elements: {
      tableCell: {
        content: schema.content.group('block', {
          default: { type: 'paragraph' },
          min: 1,
        }),
        isolating: true,
        properties: {
          colSpan: property.number({ default: 1, omitDefault: true }),
          rowSpan: property.number({ default: 1, omitDefault: true }),
        },
      },
    },
  },
});
```

No `schema.contribution(...)`, no `element(...)`, and no `schema.group/root`
wrapper where a contextual object can be validated by `defineEditorExtension`
or `defineEditorSchema`. Keep tagged-union builders such as `schema.content.*`,
`target.*`, and `property.*`; those express real algebra, not freezing.

### Raw Plite: immutable-config factory

```ts
const CommentExtension = defineEditorExtension({
  name: 'comments',
  config: {
    prefix: 'comment_',
  },
  schema: ({ config }) => ({
    properties: [
      schema.textProperty(
        schema.key.prefix(config.prefix),
        property.boolean({ default: false, omitDefault: true }),
        {
          split: 'preserve',
          target: target.group('element'),
          typeChange: 'preserve-if-allowed',
        }
      ),
    ],
  }),
});
```

The factory receives only frozen `config` and descriptor identity. No editor,
state, runtime options, compiled schema, or capability order is visible.

### Complete application schema

```ts
const ProductSchema = defineEditorSchema({
  id: 'acme-document',
  version: 4,
  unknown: 'reject',
  elements: {
    paragraph: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
  root: {
    content: schema.content.type('paragraph', {
      default: { type: 'paragraph' },
      min: 1,
    }),
  },
});
```

### Plate: element and render ownership

```ts
export const BaseCodeDrawingPlugin = createBasePlugin({
  key: KEYS.codeDrawing,
  type: NODES.codeDrawing,
  schema: {
    element: {
      properties: {
        data: property.typed(codeDrawingDataPolicy),
      },
      void: 'block',
    },
  },
  render: {
    node: CodeDrawingElement,
  },
});
```

`void:'block'` derives structural block membership and exactly one canonical
empty text child. Typed structured JSON requires a stable policy; arbitrary JSON
uses `property.json()` and has type `PropertyJsonValue`.

### Plate: boolean, valued, and advanced marks

```ts
const BoldPlugin = createBasePlugin({
  key: KEYS.bold,
  schema: { mark: property.boolean({ default: false, omitDefault: true }) },
});

const FontSizePlugin = createBasePlugin({
  key: KEYS.fontSize,
  schema: { mark: property.string() },
});

const CommentPlugin = createBasePlugin({
  key: KEYS.comment,
  schema: {
    mark: {
      property: property.boolean({ default: false, omitDefault: true }),
      split: 'preserve',
      target: target.group('element'),
      typeChange: 'preserve-if-allowed',
    },
  },
});
```

This is slightly longer than `mark:true` and much better: it is one typed shape,
states canonical false/absence semantics, and infers the stored value.

### Plate: option-dependent cross-node property

```ts
const TextAlignPlugin = createBasePlugin<TextAlignConfig>({
  key: KEYS.textAlign,
  type: 'align',
  config: {
    targets: [ParagraphPlugin] as const,
  },
  schema: ({ config, own, plugins }) => ({
    properties: [
      own.elementProperty(property.typed(alignmentPolicy), {
        target: target.types(plugins.elementTypes(config.targets)),
        typeChange: 'preserve-if-allowed',
      }),
    ],
  }),
});
```

`own.elementProperty` derives the property key from the resolved plugin `type`.
`plugins.elementTypes` accepts typed plugin descriptors and fails on missing,
disabled, or non-element references. A raw literal uses `target.type('p')` and
is never reinterpreted as a plugin key.

### Plate: derived identity, optional durable lineage, and transactional reconfiguration

```ts
const editor = createPlateEditor({
  plugins: [ParagraphPlugin, TextAlignPlugin, CodeDrawingPlugin],
});

const persistedEditor = createPlateEditor({
  plugins: [ParagraphPlugin, TextAlignPlugin, CodeDrawingPlugin],
  schema: { id: 'acme-document', version: 4 },
});

editor.configure(
  TextAlignPlugin,
  { targets: [ParagraphPlugin, HeadingPlugin] },
  {
    migrate({ document, next }) {
      return next.fitDocument(document);
    },
  }
);
```

The first editor receives a deterministic identity equal to its exact compiled
semantic fingerprint. The second adds explicit durable lineage for persisted
history, collaboration rooms, and migrations that intentionally span a
fingerprint change. There is no universal `{ id: 'plate', version: 1 }`, no
random/process-local fallback, and no partial caller-owned identity. Runtime UI
state still uses a separate mutable store and cannot affect schema identity.
The compiler emits `{ kind: 'derived', fingerprint }` for omission and
`{ kind: 'named', id, version, fingerprint }` for explicit lineage; lineage
does not participate in the semantic fingerprint.

## Ideal compiled/internal model

1. A public `SchemaContributionInput` is contextual structural data. A private
   `NormalizedSchemaContribution` is cloned/frozen once at extension definition
   or candidate factory evaluation.
2. Every contribution has one stable owner descriptor. Owner identity, not
   extension priority, supplies provenance and cache keys.
3. Complete schema identity is a distinct discriminated descriptor owned once
   by the compiler. Plate omission produces an exact-fingerprint identity;
   optional explicit `id/version` adds durable lineage. Contributions cannot
   supply partial identity fields.
4. Configuration compilation evaluates pure factories against immutable config,
   resolves typed references, validates all keys, and emits normalized resources.
5. Semantic compilation remains order-independent and conflict-intolerant.
   Duplicate elements/groups/roots and overlapping property selectors fail with
   aggregated provenance diagnostics.
6. Keep current immutable maps/sets/content programs/property tables/fingerprint.
   Do not add public numeric IDs or private bit packing without benchmark proof.
7. Add per-type construction plans: canonical content, property defaults, owned
   property IDs, and root/content-root creation.
8. Add `CompiledSchemaDelta`: changed element behaviors, content programs,
   property applicability/lifecycle, roots, and construction plans.
9. Runtime policy functions are rebound from the current configuration onto
   reused structural tables; persisted fingerprint continues to include only
   stable policy id/version.
10. Plate compiles one immutable `CompiledPlateModelBinding` per plugin:

```ts
type CompiledPlateModelBinding = Readonly<{
  elementType: string | null;
  pluginName: string;
  propertyIds: readonly string[];
  textPropertyId: string | null;
  type: string;
}>;
```

11. Plite schema, Plate bindings, parser registry, render/static classification,
    and ordinary codec claims publish or roll back in one configuration revision.
12. React uses schema delta plus type→runtime-ID snapshot indexes for local
    invalidation. No document-wide rerender is required.
13. History/Yjs persist the exact fingerprint and, when configured, the
    optional durable `{id,version}` lineage alongside canonical changes.
    Components, factories, plugin classes, and live validators never enter
    persistence.
14. Fatal semantic conflicts abort configuration. Optional parser/serializer/
    render providers report through an error sink without poisoning editing.

## Why this is better than Wordgard

The target combines Wordgard's strongest property—one obvious schema owner
compiled into shared semantic relations—with capabilities Wordgard does not
have: plain JSON runtime values, independent typed properties, richer content
grammar, explicit conflict provenance, multi-root, canonical `DocumentChange`,
versioned schema identity, Yjs negotiation, History validation, DOM-free core,
React host separation, fitted `ContentSlice`, atomic migration/rollback,
generated schema laws, and performance budgets. It also eliminates current
Plate's three semantic truths. That is not parity; it is the clean ownership of
Wordgard without its narrow class/DOM/single-root tax.

## Hard deletion ledger

### Plite

- Required public `schema.contribution(...)` wrappers and public normalized
  `EditorSchemaContribution` versus `Input` split.
- Optional correctness-only `element(...)`, `schema.root(...)`, and
  `schema.group(...)` wrappers where contextual structural inputs suffice.
- `EditorSchemaContributionRecord.order` and registry/compiler plumbing.
- Partial identity sniffing and caller-required identity boilerplate; complete
  identity is compiler-owned, with derived exact-fingerprint identity or
  optional explicit durable lineage.
- Pure-schema-extension-only equivalence special case in
  [editor-extension.ts](/Users/zbeyens/git/plate-2/packages/plite/src/core/editor-extension.ts:1061).
- Public constant `equality:'structural'` field.
- `significant` unless its execution slice proves and implements one owner.
- Closed-schema content-shape heuristics.
- Caller boilerplate for non-inline `block` and non-editable void text grammar.
- `createAndFill` all-properties scan.
- Full-document fallback from incremental schema validation and recursive
  `contentRoot` owner scans. Full validation remains only at explicit external
  document and configuration-publication boundaries.
- Raw property query/context reconstruction when a typed descriptor/node/path is
  available.
- Exact frozen declaration identity as ordinary host-codec ownership token.
- Duplicate public-state schema forwarding once a stable typed facade exists.

### Plate

- `PluginBaseNode` and `PluginNodeMark` public model types.
- `node.type`, `node.element`, `node.mark`, `node.component`,
  `node.isDecoration`, unsafe attribute allowlist, and data projection in one bag.
- `node.component` ↔ `render.node` synchronization and every dual-write
  path. Keep `.withComponent(Component)` as the sole render-owned convenience
  facade; it writes only `render.node` and must not be expanded mechanically to
  `.extend({ render: { node: Component } })`.
- Runtime element+mark conflict logging; the type system/compiler makes it
  impossible.
- `PluginSchemaOptions` over mutable runtime options and
  `freezePlateSchemaOptions`.
- `resolvePlatePluginType` and every recursive raw string rewrite for targets,
  content, defaults, roots, and content roots.
- Deep-merging raw schema/model objects; configuration descriptors are atomic.
- Multi-channel `node.element` + `node.mark` + `plugin.schema` merging.
- Synthetic `plate:plugin-schema:*` extensions and empty-definition assembly.
- Silent `{id:'plate', version:1}` and special empty-document migration.
- Parser `isElement/isLeaf`, React/static node classification, and container
  caches independently derived from old node flags.
- One-shot `resolvePluginSchemaCaches` after installation.
- Tests that assert magic string rewriting or obsolete declaration shapes.

### DOM/React/codecs

- Projected clipboard's raw `Descendant[]` format and custom decoder.
- Plaintext line construction by spreading selected nodes/properties.
- Ordinary codec claims that repeat a type/property already owned by the binding.
- Codec-local priority where extension configuration owns precedence.
- Repeated O(document) projected-root owner scans.
- Whole-document rerender/validation fallback for a local schema delta.

## Adoption impact

| Owner | Required adoption |
| --- | --- |
| Plite API/types | `interfaces/schema.ts`, `interfaces/editor.ts`, builders, barrels, public smoke/type contracts, complete/partial inference. |
| Plite compiler/runtime | contribution registry, compiler, diagnostics, policy rebinding, construction plans, schema delta, typed facade, incremental roots. |
| Plate core | `PluginConfig`, `BasePlugin`, create/extend/configure/merge/resolve, `withPlite`, parser registry, plugin caches, React/static render pipes, component helpers. |
| Production plugins | All 80 semantic declarations: 52 elements, 20 marks, 8 property plugins across basic-nodes/styles, media, math, footnote, AI, tag, comment, toggle, mention, table, code-block/drawing, TOC, callout, list/list-classic, layout, slash, suggestion, excalidraw, link, caption, find-replace, emoji, date, indent, and core. |
| Tests | 334 config occurrences in 111 test/type-test files; rewrite behavioral contracts, delete shape-only assertions. |
| Apps/www | Registry example declarations; preserve/restore the 78 component-only `.withComponent` bindings, keep explicit `render.node` only where it is composed with other configuration, and migrate the 19 component configs, 10 target/allow kit configs, demos, and install examples without reviving `node.component`. |
| Plite DOM | Descriptor-derived claims, policy rebinding, plaintext construction, canonical projected clipboard, ordering. |
| Plite React | Schema-delta invalidation, typed multi-content-root owner index, clipboard route, browser contracts. |
| History | Preserve identity validation/reset semantics; add config replacement and property-policy rebind laws. |
| Yjs | Preserve room identity and contextual merge; prove config mismatch, rollback, and no live function serialization. |
| Codecs | HTML/Markdown/clipboard parsers emit fitted slices from the same binding; JSX/DOM shapes remain host-owned. |
| Docs | Plite extensions/schema/DOM docs; Plate plugin/core API/debugging/component docs; English/Chinese current mirrors; examples only describe final state. |
| Fixtures/exports | Schema fixtures, packed release consumer instantiation, barrels via `pnpm brl`, no template edits/build-registry. |
| Benchmarks | Extend `plite-schema-architecture`, construction, fit locality, projected-root/clipboard, and Plate startup/reconfigure targets. |

## Execution slices

### Slice 1 — Runtime policy cache correctness

- Owner: Plite schema registry/compiler.
- Entry: current declaration-key cache reproducer with two current validators
  sharing stable id/version.
- Breaks: private compiled resource binding only.
- Work: separate structural cache identity from live runtime policy binding.
- Exit: each editor invokes its current validator while fingerprints remain equal.
- Tests/laws: direct regression, cache-hit property law, History/Yjs identity law.
- Browser: not applicable; pure model correctness.
- Benchmark: equivalent reconfiguration compile count stays zero and heap target
  does not regress.
- Deletion gate: no cache entry owns a foreign live validator.

### Slice 2 — Canonical Plite contribution boundary

- Owner: Plite public schema/extension API.
- Entry: slice 1 green; API type fixtures written against target syntax.
- Public breaks: direct contribution input/factory; remove required wrapper and
  normalized/input public split.
- Work: contextual raw objects, pure factory context, full key validation,
  discriminated complete definition, aggregated diagnostics, no schema order.
- Adoption: Plite source/tests/docs/bench fixtures first.
- Exit: static and factory contributions infer across extension tuples and
  normalize exactly once.
- Tests/laws: immutability, malformed input, factory purity/equivalence,
  permutation/conflict/provenance, partial-contribution type laws.
- Browser: not applicable yet.
- Benchmark: 1/100/1,000 independent contributions compile/cache.
- Deletion gate: zero required `schema.contribution` calls in Plite public examples
  or package source; zero `record.order`.

### Slice 3 — Closed structural invariants and construction plans

- Owner: Plite compiler/editor schema/representation.
- Entry: new contribution boundary stable.
- Public breaks: explicit open content; derived block and void rules; typed JSON
  requires policy.
- Work: derive block, void child, per-type defaults/property plans; resolve
  `significant`; enforce compiler-boundary property policies.
- Adoption: remove repeated block/void grammar; add typed policies to CodeDrawing,
  Excalidraw, caption and every structured JSON consumer.
- Exit: creation, external validation, fitting, representation, and serialization
  agree on one canonical node.
- Tests/laws: generated creation/validation/canonicalization/property laws.
- Browser: focused void representation smoke.
- Benchmark: construction remains local; no all-property scan.
- Deletion gate: zero closed-schema shape heuristics or declared-void repair path.

### Slice 4 — Plate immutable configuration and final public model API

- Owner: Plate plugin types/factories/resolution.
- Entry: Plite static/factory API and invariants landed.
- Public breaks: top-level `type`; `schema.element`/`schema.mark`; immutable
  `config`; separate mutable state; no public `node` bag. `.withComponent` is
  retained and writes only `render.node`.
- Work: exclusive element/mark types, owner-relative property builders, explicit
  typed plugin refs, atomic descriptor merge semantics, render/host relocations.
- Adoption: core type tests and representative paragraph, bold, font size,
  comment, text align, code drawing plugins.
- Exit: invalid combinations fail at type/config compile time; schema-relevant
  values cannot mutate through runtime options.
- Tests/laws: inference, config immutability, unknown/disabled refs, literal type
  non-rewrite, configure/extend merge laws.
- Browser: not applicable until projections are unified.
- Benchmark: plugin descriptor resolution at 100/1,000 plugins.
- Deletion gate: `PluginBaseNode`, `PluginNodeMark`, and magic resolver gone.

### Slice 5 — One Plate compilation and publication pipeline

- Owner: Plate `withPlite`, parser, render/static, codec binding.
- Entry: final plugin API compiles representative plugins.
- Public breaks: broad plugin `schema` only produces the new Plate descriptor;
  arbitrary roots/groups/multi-elements use explicit Plite extensions.
- Work: lower one owner descriptor; produce Plite contribution and host binding;
  stage schema, parser, render/static, and codec indexes with candidate config.
- Adoption: component helpers, parser registry, render pipes, static attributes,
  schema-derived caches. Component-only call sites remain
  `.withComponent(Component)`; explicit `render.node` is reserved for composed
  render configuration.
- Exit: one revision publishes or rolls back all projections; no owner reads old
  node flags.
- Tests/laws: lowering equivalence, conflict rollback, parser/render/codec
  classification, component-only change excluded from fingerprint.
- Browser: paragraph, element, boolean/valued/advanced mark parse-render roundtrip.
- Benchmark: startup and equivalent/non-equivalent reconfiguration.
- Deletion gate: synthetic schema extensions, `node.component`, component
  synchronization/dual writes, split caches, and
  `compilePlatePluginSchemaContribution` old merge path gone;
  `.withComponent(Component)` remains and writes only `render.node`.

### Slice 6 — Typed schema handles and inference closure

- Owner: Plite types/facade plus Plate editor inference.
- Entry: one descriptor pipeline owns vocabulary.
- Public breaks: typed descriptor handles become preferred construction/query
  inputs; string/context forms remain advanced only where genuinely dynamic.
- Work: infer partial contributions/plugin sets, expose typed element/property
  handles, remove silent depth claims in unsupported target inference.
- Adoption: transforms, codecs, fixtures, typed plugin components and app editor
  declarations.
- Exit: element/property creation and reads return exact types across Plite and
  Plate plugin tuples.
- Tests/laws: dts inference, invalid element/property construction, dynamic
  widening explicitly asserted.
- Browser: not applicable; compile-time surface.
- Benchmark: typecheck fixture budget; runtime handles compile to direct lookup.
- Deletion gate: ordinary callers no longer reconstruct derivable type/target
  context strings.

### Slice 7 — Schema delta, React invalidation, and content roots

- Owner: Plite compiler/runtime indexes and Plite React.
- Entry: stable bindings and typed handles.
- Public breaks: `contentRoots` multi-slot descriptor replaces singular magic
  ownership; schema delta is an internal/public-read resource, not a document op.
- Work: compute changed semantic sets, update type→runtime-ID/root-owner indexes,
  locally invalidate mounted nodes and projected roots.
- Adoption: selection/navigation/input/drag/clipboard callers of root-owner scan.
- Exit: behavior-only reconfiguration updates mounted inline/void/readOnly/
  selectable DOM with zero document mutation and bounded work.
- Tests/laws: schema-delta correctness, incremental owner differential laws,
  rollback and multi-root selection mapping.
- Browser: Chromium+WebKit live block↔inline, normal↔void/editable island, named
  root and projected-root reconfiguration.
- Benchmark: delta work scales with affected types/runtime IDs, not document size.
- Deletion gate: no full document owner scan or blanket validation/rerender fallback.

### Slice 8 — Codec and clipboard convergence

- Owner: Plite DOM, Plite React, Plate host codecs.
- Entry: compiled host bindings and content-root indexes.
- Public breaks: ordinary codec claims derive from descriptors; codec priority
  replaced by configuration order.
- Work: canonical projected `ContentSlice`, exact→host→plain pipeline,
  schema-built plaintext lines, descriptor-derived HTML/Markdown claims.
- Adoption: clipboard input/mutation controllers, projected copy/paste, HTML and
  Markdown packages.
- Exit: one MIME envelope and one fitter/serializer path across roots and hosts.
- Tests/laws: fresh NodeId identity on clipboard paste; significant-property
  preservation; open-edge/multi-root fit; provider failure isolation.
- Browser: Chromium+WebKit native copy/cut/paste for inline/block/markable voids,
  projected selections, HTML/Markdown/plain fallbacks.
- Benchmark: large projected serialization and paste remain local.
- Deletion gate: raw-descendant clipboard format/custom decoder and spread-based
  plaintext construction gone.

### Slice 9 — History, Yjs, and transactional configuration closure

- Owner: Plite History, Yjs, Plate configuration.
- Entry: all semantic resources and policies use final identity.
- Public breaks: schema-affecting plugin changes require `editor.configure` plus
  migration; no runtime option mutation bridge.
- Work: validate reset/no-op policy, property policy rebinding, claimed-room
  compatibility, atomic config+document publication.
- Adoption: History/Yjs fixtures, collaboration examples, schema metadata docs.
- Exit: equivalent config preserves history/room; incompatible config resets or
  rejects before sync; no live function/class/component enters persistence.
- Tests/laws: combined History+Yjs randomized add/remove/replace/rollback sequences.
- Browser: two-editor Yjs schema mismatch/reconfiguration smoke where runnable.
- Benchmark: large-document migration/validation and equivalent config budgets.
- Deletion gate: universal/fake identity defaults, required Plate identity
  boilerplate, partial identity, and mutable-schema options gone; omitted
  identity deterministically equals the exact semantic fingerprint.

### Slice 10 — Full adoption, docs, release, and hard deletion

- Owner: Plate packages/apps/docs/tooling.
- Entry: slices 1-9 green on representative owners.
- Public breaks: all old syntax removed in one cut.
- Work: migrate all 80 production declarations, 334 test configs, registry kits,
  components, examples, fixtures, translations, exports, packed consumer, and
  benchmark registry; remove explicit identity from ordinary examples while
  retaining it only where durable lineage is the subject; repair docs checks to
  accept omission and reject partial or nondeterministic identity; run `pnpm brl`
  for barrel changes.
- Exit: repository search finds no old public forms/helpers; current docs teach
  only final architecture; all package/app/browser/release gates pass.
- Tests/laws: affected package tests/typechecks, `check:plite:dev`, `check:plite`,
  core/package checks, release artifact consumer.
- Browser: full Chromium handoff and closure matrix only after focused rows pass.
- Benchmark: all registered strict targets and new many-contributor/delta rows.
- Deletion gate: every item in the hard deletion ledger is absent; no alias,
  compatibility type, dual signature, migration bridge, or obsolete shape test.

## Execution ledger

| Slice | Status | Executed result | Primary current owners and proof |
| ---: | --- | --- | --- |
| 1 | complete | Structural cache entries retain only persisted structure; every editor publication rebinds its current live property policies without changing the semantic fingerprint. | [schema-compiler.ts](/Users/zbeyens/git/plate-2/packages/plite/src/core/schema-compiler.ts), [schema-contribution-registry.ts](/Users/zbeyens/git/plate-2/packages/plite/src/core/schema-contribution-registry.ts), and the direct/nested-policy cache laws in [schema-compiler.test.ts](/Users/zbeyens/git/plate-2/packages/plite/test/schema-compiler.test.ts). |
| 2 | complete | `defineEditorExtension.schema` accepts one raw partial/complete declaration or immutable-config factory, clones/freezes it once, and exposes no caller-facing contribution/root/group/element normalization wrappers or schema order. | [schema-definition.ts](/Users/zbeyens/git/plate-2/packages/plite/src/core/schema-definition.ts), [editor-extension.ts](/Users/zbeyens/git/plate-2/packages/plite/src/core/editor-extension.ts), and [extension-configuration.test.ts](/Users/zbeyens/git/plate-2/packages/plite/test/extension-configuration.test.ts). |
| 3 | complete | The compiler derives `block`/`inline`/`textBlock`, rejects caller declarations of structural built-ins, derives non-editable void content, validates typed JSON through nominal policies, and compiles per-type default/property construction plans. | [schema-compiler.ts](/Users/zbeyens/git/plate-2/packages/plite/src/core/schema-compiler.ts), [editor-schema.ts](/Users/zbeyens/git/plate-2/packages/plite/src/core/editor-schema.ts), [schema-laws.test.ts](/Users/zbeyens/git/plate-2/packages/plite/test/schema-laws.test.ts), and the strict construction row recorded below. |
| 4 | complete | Plate has top-level `type`, `schema.element`, descriptor-backed `schema.mark`, immutable `config`, separate mutable `options`, typed plugin references, and `schema.element.topLevel:false` for nested-only structural elements. Functions, accessors, cycles, hidden fields, prototypes, and forged opaque config values fail before publication. | [PluginConfig.ts](/Users/zbeyens/git/plate-2/packages/core/src/lib/plugin/PluginConfig.ts), [createBasePlugin.ts](/Users/zbeyens/git/plate-2/packages/core/src/lib/plugin/createBasePlugin.ts), [mergePlugins.ts](/Users/zbeyens/git/plate-2/packages/core/src/internal/utils/mergePlugins.ts), and [compilePlateModel.spec.ts](/Users/zbeyens/git/plate-2/packages/core/src/internal/plugin/compilePlateModel.spec.ts). |
| 5 | complete | One immutable `PlateModelPublication` owns pristine source plugins, freshly resolved plugins, semantic model, parser/render/static caches, API/tx capabilities, shortcuts, input rules, and stable option stores. Candidate compilation publishes atomically or leaves the exact prior revision live; held plugin contexts resolve the current publication. | [compilePlateModel.ts](/Users/zbeyens/git/plate-2/packages/core/src/internal/plugin/compilePlateModel.ts), [resolvePlugins.ts](/Users/zbeyens/git/plate-2/packages/core/src/internal/plugin/resolvePlugins.ts), [withPlite.ts](/Users/zbeyens/git/plate-2/packages/core/src/lib/editor/withPlite.ts), and [plateModelPublication.spec.ts](/Users/zbeyens/git/plate-2/packages/core/src/internal/plugin/plateModelPublication.spec.ts). |
| 6 | complete | Nested installed-plugin trees retain readonly `plugins` and `dependencies`, API/tx inference survives public declaration emission, and Plate exposes non-forgeable one-generic schema handles. A monotonic element-capability projection folds applicable targeted properties onto element maps, preserving exact cross-plugin property inference while specialized editors remain assignable to broad Plate boundaries. | [schema.ts](/Users/zbeyens/git/plate-2/packages/plite/src/interfaces/schema.ts), [pluginRuntimeTypes.ts](/Users/zbeyens/git/plate-2/packages/core/src/lib/editor/pluginRuntimeTypes.ts), [schema-inference-contract.ts](/Users/zbeyens/git/plate-2/packages/plite/test/schema-inference-contract.ts), and [plugin-schema-contracts.ts](/Users/zbeyens/git/plate-2/packages/core/type-tests/plugin-schema-contracts.ts). Fresh Plite/Core type proof, 602,118-instantiation generic proof, emitted declaration fixtures, broad-editor assignability, and zero source-adjacent declarations are green. |
| 7 | complete | `EditorSchemaDelta` drives type/property/root-local runtime invalidation. Element-owned roots use one persistent indexed registry with canonical path mappings and bounded compaction; omitted-value lookup does not serialize the document. Incremental validation requires an immutable baseline stamped by the active schema revision and never falls back to a full scan; detached inputs must cross the explicit full-document boundary first. Initial no-op publications stamp their explicit document, nested command specs defer validation to the outer transaction, and schema migrations defer to their explicit configuration-publication boundary. | [element-owned-root-index.ts](/Users/zbeyens/git/plate-2/packages/plite/src/core/element-owned-root-index.ts), [editor-schema.ts](/Users/zbeyens/git/plate-2/packages/plite/src/core/editor-schema.ts), [incremental-schema-validation.test.ts](/Users/zbeyens/git/plate-2/packages/plite/test/incremental-schema-validation.test.ts), and [schema-runtime-invalidation-contract.test.ts](/Users/zbeyens/git/plate-2/packages/plite-react/test/schema-runtime-invalidation-contract.test.ts). A 10,000-owner deletion completed in 307.88 ms with 10,000 candidates, 20,001 prefix probes, and the same 2,000 retained owners as full indexing. The focused 16/16 validation suite proves an unstamped detached baseline fails closed and ordinary live updates emit one incremental hit with zero full-document boundary scans; command/configuration integration passes 106/106. |
| 8 | complete | Projected copy writes the canonical versioned `ContentSlice`, preserves nested open edges, reads only selected roots, and shares host-codec configuration order and paste tagging. NodeId paste semantics distinguish fresh, generic-insert, and explicit reuse modes. | [projected-clipboard.ts](/Users/zbeyens/git/plate-2/packages/plite-react/src/editable/projected-clipboard.ts), [host-codec.ts](/Users/zbeyens/git/plate-2/packages/plite-dom/src/plugin/host-codec.ts), [NodeIdPlugin.ts](/Users/zbeyens/git/plate-2/packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts), and their 8/8 projected, 20/20 codec, 25/25 NodeId, 48/48 DOM clipboard, and 49/49 React clipboard focused proofs. |
| 9 | complete | Equivalent configuration is a true no-op; incompatible schema migration publishes one canonical configuration commit or rolls back. History resets/retains by schema identity, and Yjs claims room identity before import and rejects incompatible peers/reconfiguration without mutating peers or histories. | [history-persistence-contract.spec.ts](/Users/zbeyens/git/plate-2/packages/plite-history/test/history-persistence-contract.spec.ts), [schema-identity-contract.spec.ts](/Users/zbeyens/git/plate-2/packages/yjs/test/schema-identity-contract.spec.ts), [yjs-collaboration.tsx](/Users/zbeyens/git/plate-2/apps/www/src/app/(app)/examples/plite/_examples/yjs-collaboration.tsx), and its focused Chromium test. |
| 10 | in progress | Authoritative production, test, registry-source, app-source, and current-doc owners use the final schema contribution syntax. Markdown/Csv bind parser, serializer, rule, and parse settings through versioned immutable host policies; public recursive Markdown helpers receive explicit prepared contexts while runtime/registry/state machinery stays private. The fresh source audit covers 4,969 tracked and untracked source/docs files and explicitly excludes CI-generated `apps/www/public/r`, `apps/www/public/rd`, and `templates`; 24 non-historical generated registry JSON files still require registry-CI regeneration and are not claimed green. The packed consumer verifies 10 packages and 31 public subpaths under NodeNext, Bundler, Node runtime, and DCE. The component-facade correction is closed: 77 Apps/www component-only bindings use `.withComponent`, `node.component` is absent from current source/docs, and focused static, type, runtime, lint, and browser proof is green. The identity DX correction, generated registry regeneration, browser matrix, and broad repository closure remain open. | [MarkdownPlugin.ts](/Users/zbeyens/git/plate-2/packages/markdown/src/lib/MarkdownPlugin.ts), [CsvPlugin.ts](/Users/zbeyens/git/plate-2/packages/csv/src/lib/CsvPlugin.ts), [createBasePlugin.ts](/Users/zbeyens/git/plate-2/packages/core/src/lib/plugin/createBasePlugin.ts), [check-plate-schema-adoption.mjs](/Users/zbeyens/git/plate-2/tooling/scripts/check-plate-schema-adoption.mjs), [check-plite-docs.mjs](/Users/zbeyens/git/plate-2/tooling/scripts/check-plite-docs.mjs), and [basic-blocks-kit.tsx](/Users/zbeyens/git/plate-2/apps/www/src/registry/components/editor/plugins/basic-blocks-kit.tsx). Fresh component proof: Core 25/25, guard tests 19/19, 4,969-file schema audit, Apps/www typecheck, Biome on 49 repaired files, Apps/www ESLint, Core 401-file lint, Utils 43-file lint, docs audit, diff-check, and Basic Blocks browser render with zero console errors. Existing Markdown/Csv/release proof remains recorded; omission and broad closure are still pending. |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Plite compiler is the semantic owner | Compiler tables/conflicts/fingerprint cited above | Compiler/target/contribution laws, policy rebinding, derived structural groups, and construction plans are green in the 185-test focused run | focused green |
| New syntax loses no semantics | Current input algebra and 80-production census | Durable 4,969-file source/docs deletion audit, 245 adopter tests/580 assertions, 59 root-eligibility assertions, Markdown/Csv immutable-config laws, and the fresh inference/declaration freeze | focused adoption/type/config green; broad closure pending |
| Factories are deterministic | Current atomic config lifecycle, current Plate snapshot bug | Immutable-config rejection, equivalent no-op, candidate rollback, and live held-context laws in the 98-test Core owner suite | green |
| Host projections cannot drift | Current parser/render duplicate owners cited | One `PlateModelPublication` and parser/render/API/tx rollback laws; 30/30 direct model/publication tests rerun after freeze | green |
| JSON typing is honest | `property.json<T>` gap and policy owner cited | `property.json()` is `PropertyJsonValue`; `property.typed(policy)` owns narrowing; external value and cache-rebind laws pass | green |
| Construction/fitting is canonical | Current representation/fitter evidence | Generated creation/fit/void/block laws plus strict 100→1,000 property-plan ratio 0.8357 with exactly 1/1 compiled IDs | green |
| History/Yjs remain compatible | Live identity owners cited | Persistence/config randomized law, 13/13 Yjs schema laws, and post-freeze 1/1 claimed-room Chromium proof | focused/browser green; matrix pending |
| React updates locally | Current selector fan-out gap cited | Schema-delta differential laws, 10k/50k locality budgets, bounded root-owner index, and post-freeze 1/1 multi-root browser proof | focused/browser green; matrix pending |
| Large schemas remain fast | Live strict target registry | Two consecutive unchanged-budget strict runs; second-run metrics are recorded below | green |
| Public cut reaches every authoritative source, current doc, and packed consumer | Census and deletion ledger | Fresh 4,969-file source/docs audit; current-doc schema sweep; full packed proof across 10 packages/31 subpaths; Markdown/Csv barrels and Biome clean. Component-facade proof adds 77 restored Apps/www bindings, 25/25 Core tests, 19/19 guard tests, Apps/www typecheck, focused Biome/ESLint plus Core/Utils package lint, diff-check, and a zero-error Basic Blocks browser render. CI-generated registry output is explicitly excluded and remains regeneration-owned. | source/docs/release/component proof green; generated registry, browser matrix, and broad repository closure pending |

Conditional evidence:
- High-risk scenarios: validator cache cross-binding; plugin-key/literal-type
  collision; schema-affecting runtime option mutation; duplicate merged schema;
  behavior-only React reconfiguration; projected clipboard format mismatch;
  large-document root-owner scan. Each has a named slice and proof.
- External research: N/A. The user named the local `../wordgard` checkout; live
  local source is the authoritative donor.
- Issue/PR provenance: N/A. This is a source-derived architecture plan, not a
  public queue claim.
- Browser: required in slices 5, 7, 8, 9, and 10 because schema flags reach DOM,
  input, clipboard, and collaboration.
- Benchmarks: required in every runtime/compile slice; existing strict targets
  remain authority and receive additive rows only.
- Docs/release: required in slice 10 because every questioned API is public.

Findings:
- Wordgard's authoring API is not better; its ownership is clearer because its
  product surface is smaller and class-bound.
- Plite already stole and exceeded the important engine ideas: compiled
  relations, fitting, validation, immutable state, and transactional config.
- The most urgent correctness issue is live validator reuse in the structural
  compiled cache, not naming.
- The questioned Plite wrapper is pure ceremony and should die.
- The questioned Plate `node` syntax is concise but sits in the wrong garbage
  drawer and feeds three truths. Preserve brevity under `schema`, not the owner.
- `groups:['block']`, repeated void text grammar, and pseudo `node.type` on
  property plugins are compiler facts leaking to callers.
- A pure config factory belongs in Plite; mutable option-derived schema does not.

Decisions and tradeoffs:
- Reject the conservative option of keeping `node.element`/`node.mark` merely
  because 80 production declarations already use it. This is a major cut and the
  final replacement is equally concise while restoring ownership.
- Reject keeping `mark:true`. `schema.mark: property.boolean(...)` costs a few
  characters and removes a special semantic branch plus false-value ambiguity.
- Keep `schema.content.*`, `target.*`, and `property.*`; they encode tagged
  algebra and inference. Delete only wrappers that normalize plain objects.
- Keep maps/sets and string structural IDs internally. Dense numeric IDs/bitsets
  are evidence-backed defer: current benchmark targets do not justify them.
- Keep React components and DOM shapes out of semantic fingerprint. The unified
  Plate descriptor compiles host bindings without contaminating Plite core.
- Keep a broad raw Plite contribution lane; restrict Plate root/group/multi-node
  declarations to explicit extensions instead of making every plugin a mini app
  schema.
- Keep full-document validation at explicit external document and configuration
  publication boundaries. Incremental validation accepts only an immutable
  baseline already validated by the active schema revision; a missing authority
  stamp is an invariant failure, never permission to rescan the live document.
- Keep `significant` because execution found its precise runtime owner:
  `ElementStatePlugin` uses compiled property significance to distinguish
  pristine identity metadata, `NodeIdPlugin` declares that policy, and current
  behavior/docs prove the contract. The slice-3 conditional deletion gate is
  therefore resolved by preserving one owner rather than deleting a live law.

Review fixes:
- User review corrected an over-broad component migration: keep
  `.withComponent(Component)` as the single ergonomic write to `render.node`;
  hard-cut `node.component` and synchronization only. The repair restored 77
  Apps/www bindings, removed current source/docs drift, strengthened the
  schema/docs guards, and passed focused type/runtime/browser proof.
- Independent red-team rejected the initial conservative instinct to preserve
  Plate `node.*`; the plan now deletes the mixed owner and retains its brevity
  under `schema`.
- Consumer audit prevented an overcorrection: top-level `type` remains distinct
  from plugin `key`, and advanced cross-node properties retain an explicit raw
  contribution path.
- Integration audit added immutable config, policy-cache rebinding, React schema
  delta, canonical projected clipboard, and typed content-root closure.
- Proof audit kept the strong existing compiler/fitting/history/Yjs/benchmark
  stack and added only demonstrated gaps.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Sixth initial read-only reviewer could not start because all agent slots were occupied | 1 | Wait for Wordgard inventory to finish, then start independent API red-team | Red-team completed; no lost lane |
| One narrow `apply_patch` import cleanup used stale import ordering | 1 | Read the exact import block and patch one line | Resolved immediately; no source ambiguity |
| Initial projected clipboard extraction forced `ContentSlice.closed` and pasted a nested wrapper instead of the selected text | 1 | Extract each segment through the canonical state slice API and preserve the first/last open edges | Repaired; nested copy/paste law produces `xb`, projected suite 8/8 |
| Initial root-owner provenance depended on object identity and relocation-only history, so a text clone followed by a sibling shift reported a stale conflict path | 1 | Reuse the canonical complete-change path mapper, persist origins, and compact mapped history | Repaired; exact clone/shift, move, 10k-compaction, 50k-lookup, and randomized differential laws pass without fallback |
| Initial relocation matching compared replacement candidates quadratically | 1 | Bucket cached structural fingerprints and verify collisions with `jsonEqual` | Repaired; 2k disjoint replacement fell from 2,049.6 ms to about 46 ms and 10k unique matching to about 122.9 ms |
| The first fallback cut required a validation stamp that initial no-op publications and nested active-draft command specs did not carry | 1 | Make initial publication, outer transaction, and configuration publication the explicit validation-proof owners | Repaired; the original 14-failure command/configuration regression is 106/106 green without restoring a full-scan fallback |
| A sequential benchmark sample produced a false schema-invalidation width regression above 2x | 1 | Use warmups and rotating round-robin cohort sampling; keep every threshold unchanged | Repaired; two consecutive strict runs passed, with second-run width ratio 1.0768 |
| Independent inference audit invalidated the first source freeze | 1 | Preserve the owning tree generic through nominal/public declaration emission and rerun fresh Plite/Core type contracts | Resolved; nested/dependency shape, API/tx inference, exact handles, broad-editor assignability, and emitted declarations are green |
| A declaration probe used a temp-local `rootDir` while importing repository sources, so those sources escaped the configured output directory and emitted source-adjacent declarations | 1 | Remove only the 736 verified-untracked generated declarations, use the repository root as `rootDir`, emit under `.tmp`, and preclean the owned output on every contract run | Resolved; the permanent Core contract emits only to `.tmp/core-type-contract-declarations`, a stale sentinel is removed, and the source declaration count is zero |
| A first variance repair exposed a caller-selectable schema generic | 1 | Reject forgeable return witnesses and project applicable properties into a monotonic element-capability source | Resolved; `handle` has one caller generic, exact cross-plugin inference remains green, and specialized editors remain assignable to broad Plate boundaries |
| A split-provider variance experiment did not preserve the required contracts | 1 | Revert it completely and keep the proven monotonic capability projection | Resolved; no split-provider residue remains and full Core/Plite type proof passes |
| Focused Markdown heading-start Chromium row after command-continuation repair | 1 | Keep the command fallback repair, then diagnose the heading-start split/paragraph insertion behavior in its browser owner | Open; `markdown-shortcuts.test.ts:505` expected one paragraph after Enter and received zero |

Verification evidence:
- Source-owner integration command:
  `bun test --preload ./config/plite-source-test-setup.ts
  ./packages/plite/test/schema-definition.test.ts
  ./packages/plite/test/schema-compiler.test.ts
  ./packages/plite/test/schema-compiler-laws.test.ts
  ./packages/plite/test/schema-laws.test.ts
  ./packages/plite/test/extension-configuration.test.ts
  ./packages/plite/test/incremental-schema-validation.test.ts
  ./packages/plite-react/test/schema-runtime-invalidation-contract.test.ts
  ./packages/plite-dom/test/host-codec.test.ts
  ./packages/plite-history/test/history-persistence-contract.spec.ts
  ./packages/yjs/test/schema-identity-contract.spec.ts
  ./packages/core/src/internal/plugin/compilePlateModel.spec.ts
  ./packages/core/src/internal/plugin/plateModelPublication.spec.ts` passed
  **185/185** tests and 277 expectations in 11.52 seconds before the independent
  nested-plugin type audit reopened slice 6. That runtime evidence remains
  valid and is paired with the fresh type/declaration freeze below.
- `pnpm --filter @platejs/plite typecheck` and
  `pnpm --filter @platejs/core typecheck` both passed their source, test, and
  type-test graphs after the second source freeze. Core's owned declaration
  contract precleans `.tmp/core-type-contract-declarations`, emits the nested
  and dependency API/tx fixtures plus specialized/broad editor and exact handle
  fixtures, and removes a seeded stale sentinel. The separate Plite generic
  contract passes with 602,118 instantiations. A two-generic schema-forgery
  attempt, unknown element/property handles, and uninstalled descriptors fail
  at compile time; zero untracked source-adjacent declarations remain.
- Root-owner command from `packages/plite`:
  `bun test --preload ../../config/plite-source-test-setup.ts
  test/incremental-schema-validation.test.ts test/document-change.test.ts`
  passed 79/79 in 8.30 seconds. The 10k deletion row took 307.88 ms and proved
  exact 20,002 touching ranges, 10,000 candidates, 10,001 prefix nodes, 20,001
  prefix probes, and 2,000 retained owners matching full indexing. Relocation
  matching also passed 5/5 fast and 2/2 slow laws; 2k disjoint matching fell
  from 2,049.6 ms to about 46 ms and 10k unique matching to about 122.9 ms.
- `bun test --preload ../../config/plite-source-test-setup.ts
  test/incremental-schema-validation.test.ts` passed 16/16 after the validation
  fallback cut. An unstamped detached baseline fails closed until
  `validateDocument` explicitly validates the external value; an ordinary live
  `editor.update` records one incremental hit and zero full-document boundary
  scans, including an explicit document created with an empty extension
  publication. Command-spec plus extension-configuration integration passed
  90/90, and the combined validation run passed 106/106. DocumentChange passed
  65/65. The schema benchmark contract test passed 3/3 with the replacement
  `incremental_validation_full_document_scans` metric.
- Canonical projected clipboard proof passes 8/8; host codec order passes 20/20;
  NodeId passes 25/25; DOM clipboard passes 48/48; the broader projected React
  set passes 49/49. `pnpm --filter @platejs/plite-dom typecheck` and
  `pnpm --filter @platejs/plite-react typecheck` pass.
- `node --test tooling/scripts/check-plate-schema-adoption.test.mjs` passed 9/9,
  and `node tooling/scripts/check-plate-schema-adoption.mjs` audited 4,969
  tracked and untracked source/docs files with no deleted authoring shape. Its
  output and return value explicitly exclude CI-generated `apps/www/public/r`,
  `apps/www/public/rd`, and `templates`; 24 non-historical generated registry
  JSON files remain a CI regeneration handoff, not source-adoption proof. The current-doc schema sweep
  also rejects the deleted node bag and `isMarkableVoid` vocabulary outside
  historical migration docs. The previous docs checker enforced explicit schema
  identity and added 455 redundant identity occurrences across 162 current docs
  files. That proof is obsolete under the accepted DX: the owner must accept
  omission, verify deterministic exact-fingerprint identity, reject partial or
  nondeterministic identity, and remove ordinary-example boilerplate before the
  docs gate can be green again. The production adopter run passed 245 tests/580
  assertions across 52 files; the cross-package Plate block-content law passed
  1 test/59 assertions. Nine `topLevel:false` source occurrences cover seven
  nested-only semantic types plus one configured repeat and one fixture.
- Markdown and Csv bind schema-relevant parser/codec resources exclusively
  through immutable versioned host policies. Markdown passed 205/205 tests,
  Csv 8/8, and the app integration 8/8; both direct typechecks and builds pass,
  generated barrels and Biome are clean, and public runtime/declaration export
  scans find zero `MarkdownRuntime`, `WithRuntime`, merged-option, registry, or
  state leaks. The exact affected Turbo replay passed 14/14 in 12.14 seconds
  with zero source-adjacent declarations before and after.
- The packed-consumer owner now generates a real final-API consumer using
  `defineEditorSchema`, `schema`, `property`, `createEditorRuntime`, and
  `SchemaElementFor`; it currently checks explicit schema lineage plus typed and
  runtime canonical construction. It must add the omitted Plate identity path
  before it proves the corrected API. `node --test
  tooling/scripts/check-plite-release-artifacts.test.mjs` passed 10/10. The full
  `pnpm plite:release:artifacts` gate built and packed 10 packages, verified all
  31 public subpaths, and passed NodeNext, Bundler, Node runtime, package-layer,
  and bare/named DCE consumers.
- Strict benchmark command:
  `PLITE_SCHEMA_ARCHITECTURE_STRICT=1 PLITE_SCHEMA_TYPECHECK_BUDGET=1 bun
  --expose-gc --preload ./config/plite-source-aliases.ts
  benchmarks/editor/benchmarks/plite-schema-architecture-benchmark.ts
  --output=tmp/plite-schema-architecture-benchmark.json` passed twice without
  weakening a threshold. The second run measured compile p95 11.5108 ms;
  invalidation width 1.0768 and changed-type ratio 1.0406 with 64 affected IDs;
  1,000-contribution compile/cache/previous-revision p95 23.2995/4.4692/35.2417
  ms with zero cache compiles; 1,000-plugin startup 557.3442 ms; equivalent
  Plate reconfiguration 0.0948 ms with zero compile/commit; non-equivalent
  3.0941 ms with 5/5 compile/commit; construction width 0.8357 with exactly 1/1
  compiled IDs; 10k migration p95 1,938.6042 ms; projected clipboard ratios
  0.4867/0.4171 with two nodes and open 1/1; and 1,000-plugin typecheck 1,256 ms,
  3,773,030 instantiations, 988,209,152 bytes, with time/instantiation ratios
  1.4794/1.1300.
- Focused browser proof is mixed and closure remains open:
  `/usr/bin/time -p pnpm --filter plite test:plite-browser:chromium
  tests/plite-browser/donor/examples/schema-reconfiguration.test.ts` passed
  1/1 in 12.38 seconds, including a 4.1-second fresh export build and
  2.7-second runner, across primary, named, and projected roots. The same
  command with `yjs-collaboration.test.ts` passed 1/1 in 2.27 seconds
  (1.8-second runner) for claimed-room mismatch and live reconfiguration
  rollback. The focused rich-text heading Enter law also passed 1/1 after the
  command-continuation repair. The focused Markdown heading-start law remains
  red: `pnpm --filter plite test:plite-browser:chromium
  markdown-shortcuts.test.ts --grep 'inserts a paragraph before a heading from
  the heading start'` reaches
  `apps/plite/tests/plite-browser/donor/examples/markdown-shortcuts.test.ts:505`
  with zero paragraphs where one is required after Enter. Browser inspection
  against `PORT=3103 pnpm --filter www dev:plite`
  proved BlockSelection mounted one editor/six selectable roots, Tabbable moved
  focus from editor to button on Tab, and Copilot's Ctrl+Space request reached
  `/api/ai/copilot`; its expected 404 invoked the configured fallback and
  changed ghost text count 0→1, with zero relevant console errors. No committed
  www Playwright owner exists for those `/blocks/*-demo` routes. The broader
  browser matrix and final Browser/Chrome handoff remain closure gates.
- The command-continuation audit repaired nine fallback wrappers. Its focused
  package laws passed 40/40 plus 27/27 Affinity slow tests; those results prove
  command fallback ownership, not the still-red Markdown heading behavior or
  browser closure.
- Known non-schema debt remains explicit. The separate
  `plite-schema-construction` target is labeled `immutable-publication
  diagnostic`: sparse publication preserves changed span 1 and untouched
  boundary identities, but its latest 100→50k width was about 301.97x. This is
  immutable `DocumentChange` ancestor publication cost, not schema construction;
  schema construction authority is the strict 0.8357 property-plan row above.
- Still pending before final handoff: the heading-start Chromium repair and
  remaining focused/browser-matrix gaps; broad lint and adopter/www typecheck
  reruns; `check:core`, `check:plite:dev`, forced full `check:plite`; final
  Browser/Chrome handoff; autoreview; and this plan's `check-complete.mjs` pass.
- The current `check-complete.mjs` run fails only on the intentionally unchecked
  slice-10/final-proof items and their two `in progress` phase rows.

## Final closure audit

| Closure question | Result |
| --- | --- |
| Every relevant Wordgard concept evaluated? | yes — representation, types, params, marks, groups/roles, grammar/defaults, validation/equality, compiler/cache/overrides, configuration, construction/fitting/corrections, commands, parser/serializer/render, selection flags, persistence/collab, proof/perf all have rows/verdicts. |
| Every Plite strength consciously kept/rejected? | yes — JSON, structural typing, `DocumentChange`, grammar, multi-root, properties, fitting, atomic config, History/Yjs, host separation, laws, and benchmarks are kept; only demonstrated leaks/gaps are cut. |
| Every questioned API resolved? | yes — keep `schema` slot; delete required `schema.contribution`; delete Plate `node` bag; use top-level `type`, `schema.element`, descriptor-backed `schema.mark`, and pure config factory. |
| Every useful donor mechanism accounted for? | yes — compiled relations, construction/fitting, change-local work, schema-derived host resources, and randomized laws are kept/stolen; nothing useful remains unclassified. |
| Wordgard narrowness distinguished from quality? | yes — class identity, DOM shape, one root, generic marks, precedence, weak persistence, and absent benchmarks are rejected despite concise syntax. |
| Ownership complete? | yes — Plite owns semantic schema/config/fitting and completion of exactly one identity; Plate owns plugin DX, host binding, and exact-fingerprint derivation when lineage is omitted; apps optionally own durable lineage and schema composition; DOM/React own platform rendering/input; codecs own formats; History/Yjs own persistence/transport. |
| Deletion consequences complete? | yes — Plite, Plate, DOM/React/codec, tests/docs/exports and compatibility paths are enumerated. |
| Adoption/proof complete? | no — authoritative source/type/config/docs/packed-release proof is green; CI registry regeneration, heading-start Chromium repair, broad repository/browser proof, autoreview, and final checker remain open. |
| Any useful mechanism deferred without evidence? | no — only dense numeric IDs/bitsets are deferred because current measured hot paths do not justify them. |

Interim handoff state:
- Ownership and target API/runtime: resolved above.
- Public breaks: the hard-cut shape, permanent type/declaration contracts, and
  durable 4,969-file source/docs owner audit are green; generated registry
  output remains explicitly owned by CI regeneration.
- Plate/collaboration adoption: substantial source adoption has exact owner,
  behavior, identity, rollback, History, Yjs, React, codec, and immutable
  Markdown/Csv policy proof above.
- Browser/benchmark/docs/release decisions: strict benchmarks and the current
  docs identity/content repair are focused green. The packed release consumer
  is green across NodeNext, Bundler, Node runtime, and DCE; heading-start
  Chromium is red and the broader browser matrix remains open.
- Remaining owner: repair the heading Chromium regression, run the broad
  commands listed in Verification evidence, and return this plan for final
  checker-green closeout.

Timeline:
- 2026-07-21: goal and initial architecture artifact created.
- 2026-07-21: live Wordgard/Plite/Plate/integration/proof inventories completed.
- 2026-07-21: independent API red-team completed; final hard-cut API selected.
- 2026-07-21: execution slices, deletion/adoption ledgers, and closure audit prepared.
- 2026-07-21: accepted plan converted to one-shot execution goal; Plite core
  and Plate model/compiler lanes started in parallel in the shared checkout.
- 2026-07-21: slices 1-3 hard-cut normalization ceremony, repaired live-policy
  cache rebinding, derived structural invariants, and compiled construction plans.
- 2026-07-21: slices 4-6 published one immutable Plate model revision, deleted
  the public node bag and string rewrite magic, and landed the first descriptor
  inference pass; later nominal/declaration audit reopened slice 6.
- 2026-07-21: slices 7-9 added local schema invalidation, bounded root ownership,
  canonical projected clipboard, and atomic History/Yjs configuration behavior.
- 2026-07-21: slice 10 landed its first production/apps/docs/tests migration
  pass, added the durable 4,500-file hard-cut audit, and source-proved
  nested-only Plate root eligibility; final adoption remained open.
- 2026-07-21: the first source freeze produced focused 185-test integration,
  Core/Plite typechecks, docs/adoption audits, and two consecutive strict
  architecture benchmark passes.
- 2026-07-21: independent command/type audit reopened slice 6 after proving
  nested installed plugin trees collapsed to a config union and lost `plugins`;
  the owning generic, nominal/declaration boundary, and final type proof returned
  to active work.
- 2026-07-21: docs identity/content enforcement added 455 explicit identity
  occurrences across 162 current docs files; the later accepted identity DX
  classifies that as overmigration to remove from ordinary examples while
  preserving explicit lineage examples.
- 2026-07-21: the generated final-API release consumer passed its focused unit
  suite; the full packed gate remained pending at that checkpoint.
- 2026-07-21: command continuation repaired nine fallback wrappers and passed
  40/40 fast plus 27/27 Affinity slow laws. Focused rich-text heading Enter
  passed, while Markdown heading-start Chromium remained red with no inserted
  paragraph.
- 2026-07-21: incremental schema validation hard-cut its hidden full-document
  fallback. Explicit external/configuration validation owns full scans;
  same-revision immutable baselines own every live incremental update.
- 2026-07-21: closure exposed and repaired the initial 14-failure authority
  regression: empty initial publications now stamp explicit documents, nested
  specs carry pending validation to their outer transaction, and migrations use
  their atomic configuration boundary instead of incremental fallback.
- 2026-07-21: the second inference/nominal freeze, Markdown/Csv immutable-config
  split, browser repair/matrix, packed release, broad review, and checker gates
  remained assigned to final repository closure.
- 2026-07-22: the second inference/declaration freeze closed with non-forgeable
  exact handles, nested/dependency API/tx inference, specialized-to-broad editor
  assignability, 602,118 generic instantiations, and zero source declarations.
- 2026-07-22: Markdown/Csv moved schema-relevant behavior to immutable versioned
  host policies; focused tests/typechecks/builds/barrels/Biome and public export
  audits passed without runtime/registry/state leakage.
- 2026-07-22: the fresh 4,969-file source/docs adoption audit, exact 14-task
  affected Turbo replay, and packed 10-package/31-subpath release gate passed.
  The audit names its CI-generated registry exclusions; stale `public/r`
  artifacts remain a regeneration handoff. The docs and packed identity
  assertions are reopened for deterministic omission proof.
- 2026-07-22: user review rejected the example-only complete-schema helper as
  architecture leakage. The accepted correction makes the base schema
  compiler-owned, removes fake per-example identities from extension arrays,
  and reserves explicit lineage for persistence/collaboration/migration owners.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Slices 1-9 are complete. User review reopened the identity/base-schema part of slice 10 before browser closure. |
| Where am I going? | Land and prove the compiler-owned derived base schema, delete caller shims, then repair heading-start Chromium and run broad package/browser gates, autoreview, and checker-green handoff. |
| What is the goal? | One executed schema-contribution architecture with no old public shape or split runtime truth. |
| What have I learned? | Plite's engine wins; public normalization ceremony and Plate's split model owner lose. |
| What have I done? | Implemented the architecture and source migration, closed exact type/config/docs/packed-release proof, and kept the browser and broad-proof gaps visibly open. |

Open risks:
- Focused rich-text command behavior is green, but Markdown heading-start
  Chromium is red and the broader browser matrix remains unproved.
- Broad and browser closure can still expose integration failures outside the
  focused owner graph; this plan stays executing until those exact gates pass.
- The strict 1,000-plugin fixture deliberately widens to
  `readonly AnyBasePlugin[]`; exact tuple inference remains bounded at the
  100-plugin fixture and the widening boundary is explicit.
- Element-owned root mapping shares the canonical snapshot path-mapping kernel;
  its exact-count tests are primary and the 1,500 ms environment guard is
  secondary, preventing timing noise from replacing complexity proof.
- The immutable-publication diagnostic remains real `DocumentChange` debt at
  50k width, but it is not part of schema construction and is not hidden inside
  this plan's green schema benchmark claim.
- `significant` is retained under the proven `ElementStatePlugin`/NodeId owner;
  its compiler and behavior proof must remain singular.

## 2026-07-22 closure checkpoint

- The final identity API is implemented: omitted identity compiles one
  deterministic derived schema; explicit `id/version` supplies lineage without
  changing the semantic fingerprint. Ordinary example identity boilerplate is
  deleted and the 4,969-file adoption audit is green.
- Core closure is green: 45 package typechecks/lints, Core and reviewed package
  tests, schema/docs guards, declaration-leak guards, and `check:core` pass.
  Packed proof is fresh across 10 packages and 31 public subpaths.
- `plite-layout` was the declaration-leak owner because its release config
  selected `tsconfig.json`; it now inherits `tsconfig.build.json`. The full
  Plite package build and post-build source-leak audit pass.
- Browser-runner contracts pass 49/49 with deterministic metadata checkpoints,
  byte-level final digests, zero native watchers, and no process/test retries.
  Exact Korean IME, heading, full Chromium,
  and the matrix remain unproved because this sandbox rejects the proof
  server's `127.0.0.1:3102` bind with `EPERM` before product code runs.
- Formal CLI autoreview is likewise environment-blocked by read-only Codex
  state. A source-grounded read-only architecture review is running as the
  fallback; accepted findings remain a closure gate.
- The fallback review's data-boundary findings are repaired: History and Yjs
  share one strict schema-identity decoder that rejects symbols, accessors, and
  exotic prototypes; Layout rejects negative persisted coordinates and empty
  stable identifiers. Yjs, History, Layout, and their owner typechecks pass.
- Final core/DOM proof passes 1,371/1,371 and 192/192 with both source/test
  typechecks green. The clipboard authority harness now isolates support, 50k
  cut, and 10k issue families in three single-run processes; its bounded
  coordinator contract passes. Browser closure remains the only schema-plan
  behavior gate and is still blocked before product code by localhost `EPERM`.
- Final schema-cache/lazy-slice regressions are closed together. Plite passes
  1,371/1,371, React passes 998/998, and the complete affected Node-22 gate
  passes in 88.609 seconds. Chromium smoke reuses an exact 3/3 proof; strict DOM
  and matrix execution remain blocked before product code by sandbox localhost
  bind denial. The canonical clipboard authority remains open until host load
  is low enough for trustworthy timing.
