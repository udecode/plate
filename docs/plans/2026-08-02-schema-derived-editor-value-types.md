# Schema-derived editor value types

Objective:
Implement schema-derived editor value types; done when all 11 accepted slices,
hard cuts, proof, docs, and browser gates pass; plan
docs/plans/2026-08-02-schema-derived-editor-value-types.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-02-schema-derived-editor-value-types.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Mode:
- `standard`: the target outcome is accepted; implementation may pivot when
  concrete TypeScript or runtime evidence disproves a planned mechanism.

Completion threshold:
- All 11 execution slices pass their exit proof; the 32 exported AST mirrors,
  central `NodeMap`, independent Plate editor/factory value generics, and stale
  docs are gone except the explicit `legacy-list-model` maintenance boundary;
  schema-derived values expose exact node discriminators, property values, and
  text marks without recursively encoding content grammar; large EditorKit
  capability projections compile without TS2589/TS2590; Plite/Core/package
  tests, declaration diagnostics, runtime grammar checks, Browser/RSC proof,
  changesets, barrels, lint, `autoreview`, and `check-complete` pass.

Verification surface:
- Live source audits of Plite schema/value inference, Core plugin type projection,
  feature-owned AST aliases, public exports, application editor aliases, and
  current compile-only inference tests.
- A concept-complete decision ledger, ordered execution slices, and a proof
  matrix covering declaration emit, type-level parity, runtime schema behavior,
  package adoption, docs/examples, and stale-symbol sweeps.
- Final mechanical check:
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-02-schema-derived-editor-value-types.md`.

Constraints:
- The user accepted this exact plan with `go`; implementation is authorized.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Inferred schema values must preserve every migrated persisted discriminator,
  property value, canonical requiredness fact, and text mark. Handwritten child
  relationships are replaced by runtime schema proof, not recursive public
  TypeScript grammar.
- One type engine: Plite owns document/schema inference; Plate only contributes
  and projects typed schema descriptors.
- Preserve a broad Plite `Value` fallback and low-level explicit generic for
  genuinely runtime/unknown schemas, but remove explicit `Value` from the
  ordinary Plate path.
- Preserve exact plugin dependencies, element/property identities, property
  value types, requiredness/default semantics, dynamic property prefixes,
  open-world fallback, and finite declaration emit. Parent/child/root grammar
  stays runtime-owned and must not leak into ordinary editor capability types.
- Device-specific/raw Appium testing is deferred. It cannot satisfy or block
  this type-system plan; browser proof applies only if execution changes a
  browser-visible runtime claim.

Boundaries:
- In scope: Plite schema/type-provider/value derivation; existing `ElementOf`,
  `TextOf`, `NodeOf`, and `ValueOf`; Plate/Core plugin projection and editor
  generics; feature package AST mirror types; barrels; compile-only tests;
  registry/apps/docs/examples that teach or instantiate explicit values.
- Source owners: `packages/plite`, `packages/core`, feature packages currently
  owning schemas, and `packages/utils` only as the central mirror-type debt
  being removed.
- Non-goals: runtime schema grammar redesign beyond the accepted descriptor
  model; statically proving arbitrary parent/child/root grammar; editor
  operations/normalization changes; React behavior; runtime performance claims;
  device testing; unrelated plugin/API cleanup; compatibility aliases.
- Direct Plate adoption owners: Core editor generics and plugin descriptors,
  all feature packages exporting handwritten AST mirrors, registry editor-kit
  aliases, app/docs/examples, and public barrels. Collaboration is affected
  only if its installed schema/value types consume the same Plite provider.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block only if the exact vocabulary/property target cannot be expressed
  without a different public API, or if a required source owner cannot be
  inspected. A failing generic experiment is a pivot signal: simplify the
  static projection and leave grammar enforcement with the runtime schema.

Plite Plan state:
- status: active
- phase: Pivot - shallow schema-derived vocabulary
- next: prove the lazy exact-node/value witnesses across the large EditorKit,
  then finish downstream adoption and delete the rejected recursive evaluator
- handoff: implementation not complete

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Full-plan request, Plite-vs-Plate ownership, `TTableElement` cuts, and inference parity are recorded above. |
| Active goal and plan verified | yes | Active goal points to this exact file; flow is agent-led plan hardening. |
| Current owners read | yes | `VISION.md`, `docs/vision/plite.md`, `docs/vision/plate.md`, Plite schema/editor/extractor owners, Core projection/editor owners, Utils mirrors, Table schema, registry types, current inference tests, and public docs were read from the live checkout. |
| Best API target resolved | yes | Accepted target: schema-derived `ElementOf`/`ValueOf`, Plite-owned inference, Plate descriptor projection, no ordinary manual `Value`. |
| Mode and execution boundary resolved | yes | Implementation is authorized; the user explicitly authorized evidence-led pivots instead of preserving the initial mechanism. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports/behavior claims cite live source.
- [x] Reusable public call shape has one accepted `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks have complete adoption answers; no private bridge is accepted.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Slice 0: repair API doctrine, regenerate skills, and capture diagnostics/inventory baselines.
- [x] Slice 1: preserve exact schema declarations and input/output property facts.
- [x] Slice 2 experiment: compiled exact recursive grammar, proved package
  behavior, then rejected the public recursive projection after large-kit
  TS2589 evidence.
- [x] Pivot: replace recursive root/child/ancestor inference with exact shallow
  node vocabulary and broad descendants while retaining discriminators,
  properties, marks, and canonical presence.
- [x] Slice 3: lower full Plate schema only into lazy `Value`/node witnesses and
  `read.schema`; lower a
  separate compact installed capability graph into `api`/`read`/`update`.
- [x] Slice 4: hard-cut ordinary Base/Plate editor and factory value generics;
  factory inputs stay broad and runtime schema validates document grammar.
- [ ] Slice 5: migrate and prove the complete Table vertical slice.
- [ ] Slices 6-7: migrate every element, property, mark, and refinement owner without weaker inference.
- [ ] Slice 8: delete central AST maps/mirrors, move domain payloads, and regenerate barrels.
- [ ] Slice 9: migrate registry/apps/tests/current EN/CN docs and prove Browser/RSC behavior.
- [ ] Slice 10: changesets, diagnostics, root/package gates, stale scans, and final `autoreview` all pass.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Implementation gates remain open across the shallow-value pivot and Slices 3-10. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Execution source refresh and final bounded scans are required. |
| Best API repair | yes | Repair source doctrine, regenerate skills, and forward-test the accepted rule | Slice 0 is complete; final consistency audit remains in closure. |
| Conditional risk and adoption | yes | Complete triggered risk/browser/docs/release analysis | Execution proof is required for every applicable row; device testing stays deferred. |
| Verification recorded | yes | Record fresh implementation proof and exact closure gates | No implementation proof recorded yet. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Planning handoff exists; implementation handoff requires final evidence. |
| Autoreview | yes | Run final source-backed review and repair every accepted P0/P1 finding | Not run on implementation. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-02-schema-derived-editor-value-types.md` | Must pass after all implementation evidence is recorded. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground and decide | complete | Accepted plan has live owners, resolved decisions, and explicit adoption. | Slice 0 |
| Slices 0-2: doctrine and inference experiment | complete | Exact recursive inference passed Plite/Core package proof but large EditorKit capability access produced TS2589; recursive public grammar is rejected. | Shallow-value pivot |
| Pivot + Slices 3-5: finite Plite value, Core split, Table | in_progress | Lazy schema value/node witnesses preserve exact vocabulary without flowing full grammar through capabilities; Plite/Core/Suggestion pass and a fresh large EditorKit compile has zero TS2589/TS2590. | Finish ordinary downstream errors, remove rejected evaluator, then Table vertical proof. |
| Slices 6-9: ecosystem adoption | pending | Requires proven Table pattern. | Feature waves, central deletion, registry/docs. |
| Slice 10: closure | pending | Requires all adoption slices. | Full proof, Browser, changesets, autoreview, handoff. |

Decision brief:
- outcome: One schema declaration determines runtime validation and the exact
  finite editor node vocabulary across Plite and Plate.
- chosen shape: Plite derives exact element discriminators, element/text
  properties, and canonical presence; runtime schema alone validates
  parent/child/root relationships and cardinality. Plate plugin descriptors
  contribute the full schema only to `Value` and `read.schema`, while a compact
  capability graph drives `api`/`read`/`update`. `PlateEditor<typeof Kit>`
  derives the installed vocabulary; feature aliases, when useful, are
  owner-local aliases such as
  `type TableElement = ElementOf<typeof BaseTablePlugin>`.
- strongest rejected alternative: Keep handwritten `Value`/`T*Element` unions
  beside schema declarations and merely improve helper names. Rejected because
  it preserves duplicate truth and inevitable drift.
- consequence: This is a hard public type/API migration. Compile-time nesting
  rejection is deliberately traded for finite, fast inference; runtime grammar
  remains fail-closed. The low-level Plite fallback remains, but ordinary Plate
  callers, central mirror exports, docs, and examples migrate together.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Document type source of truth | Runtime schema and handwritten `Value`/`T*Element` declarations both describe the AST. | One schema declaration drives runtime validation and static value inference. | Plite | Duplicate truth already drifts and forces central feature coupling. | Core and every feature package consume the Plite result; handwritten mirrors are deleted only after parity. | Schema inference contracts plus feature compile contracts. | Deleting mirrors before parity loses precision. | rearchitect |
| Content declaration typing | Runtime content declarations preserve exact grammar facts, and the rejected experiment projected them recursively into public values. | Keep exact declarations for runtime compilation, diagnostics, handles, and construction. Do not evaluate content combinators into ordinary editor node types. | Plite | Runtime grammar needs the facts; public capability typing does not need a recursive proof tree. | No schema authoring syntax change. | Existing builder/runtime contracts plus source audit showing no content-rule evaluator in public `Value`. | A future helper could accidentally reintroduce grammar payloads into editor capabilities. | keep and contain |
| Primary root value | The rejected experiment filters `SchemaValue<T>` through primary/named-root content programs. | `SchemaValue<T>` is the finite union of the installed schema's declared element vocabulary. Runtime `assertDocument`/`assertFragment` enforce root grammar. | Plite | Root filtering invokes the same arbitrary grammar evaluator and creates a false expectation that TypeScript validates the document. | Factories and `ValueOf` use one finite vocabulary; no root-specific generic projection. | Exact vocabulary compile contracts and closed/open-root runtime rejection tests. | Invalid root placement can be constructed before runtime validation. | simplify |
| Element children | The rejected experiment recursively evaluates every element content rule into legal child unions. Large kits cycle through block groups and ancestor/root parameters until TypeScript hits TS2589. | Every derived element has exact `type` and properties with broad `BaseElement['children']`. Installed element/text vocabulary is available separately through lazy editor/node witnesses. Runtime schema exclusively validates `Table -> Row -> Cell`, groups, combinators, cardinality, and roots. | Plite | Arbitrary recursive grammar is a runtime validator's job, not a structural TypeScript editor generic. Even a shallow installed-child union makes every nested element recursively carry the whole installed vocabulary. | Feature aliases lose compile-time nesting rejection but keep exact persisted node fields and discriminated narrowing. | Large EditorKit TS2589 regression contract; Table/Layout/CodeBlock runtime grammar tests; element/property compile contracts. | TypeScript accepts an invalid child until a schema boundary validates it. | simplify |
| Cardinality | Runtime content has `min`/`max`; static arrays do not encode it. | Keep `children` as readonly arrays of the exact child union; leave count/default enforcement to runtime schema. | Plite | Tuple-length types poison ordinary `map`/construction flows and do not compose well with editor transforms. | None beyond documenting the type/runtime boundary. | Compile test accepts arrays while runtime schema tests retain min/max enforcement. | Static code can still construct an invalid child count before runtime validation. | keep |
| Property value and placement | Descriptor value types and exact/prefix keys are inferred, but node properties are all optional and text targets are flattened globally. | Infer exact value, key/prefix, direct owned target, and canonical presence. Parent/root-sensitive placement remains runtime-owned; dynamic targets widen only their property branch. | Plite | A value type must neither reject runtime-valid dynamic data nor recursively evaluate ancestry through every node. | Element/text inference, marks, create arguments, schema handles, and feature aliases adopt the shallow projection. | Owned/defaulted/prefix/dynamic compile rows plus runtime target-placement/canonicalization tests. | Overclaiming placement would lie; broadening the whole node union would erase useful inference. | rearchitect |
| Canonical requiredness | Defaults with `omitDefault: false` are materialized at runtime, yet inferred properties remain optional; required fields such as link URL are only handwritten claims. | Canonical outputs require properties guaranteed by non-omitted defaults. Add explicit schema `required: true` only for feature fields runtime truly rejects when absent; construction inputs require required-without-default fields. | Plite schema; feature packages declare truth | Static requiredness must match canonical runtime law, not preserve lies from handwritten interfaces. | Audit link, media, mention, tag, equation, table, list, ID, and collaboration fields before migrating their mirrors. | Compile tests for create input/output and runtime tests for missing/defaulted/omitted properties. | Requiredness can reject persisted legacy data; each feature needs an explicit decision and changeset. | rearchitect |
| Text inference | Text properties have exact key/value facts, while parent/root-sensitive targets require grammar context. | `TextOf<Editor>` aggregates exact text-property values as optional vocabulary. Owned and unambiguous direct targets may narrow; ancestor/root-sensitive placement stays runtime-owned. | Plite | This preserves useful mark autocomplete without pretending every leaf's ancestry is statically known. | Basic marks, code syntax, comments, suggestions, and font marks migrate from central shapes. | Mark value/prefix/exclusive contracts plus runtime target-placement tests. | Some marks appear as optional on a wider static text union than one runtime location permits. | simplify |
| Unknown/open schemas | `unknown: preserve` has a recursive broad branch; widened target facts are intentionally not claimed. | Preserve exact known variants and add a conservative unknown branch only where runtime law is open or undecidable. | Plite | `never` or a closed union for open data is a correctness bug. | Low-level/extensible schemas and imported documents keep broad acceptance. | Existing preserve contracts plus new dynamic content/target tests. | A broad fallback can erase useful known inference if unioned too early. | keep and harden |
| Recursive type containment | The exact-grammar experiment removed a depth-five fallback but made content cycles observable through every editor method, causing TS2589 on EditorKit. | Eliminate public recursive grammar entirely. Carry one compact shallow vocabulary witness so `ElementOf`, `TextOf`, `ValueOf`, slices, and editor methods remain exact without depth parameters or expansion cliffs. | Plite | A finite vocabulary has no arbitrary depth cliff and no recursive compiler workload. | All extractors and editor methods consume the same shallow witness. | Deep runtime document test, large-kit compile contract, declaration emit, TS2589/TS2590 absence, diagnostics budget. | A witness must remain structurally compact and stable across equivalent schema compositions. | rearchitect |
| Base `Value` | `Value = readonly Element[]` is the universal raw model and explicit `Editor<V>` remains supported. | Keep `Value` as the broad Plite fallback and keep explicit `createEditor<V>` for schema-less/external advanced ownership. | Plite | Raw editors and unknown runtime schemas need an honest escape hatch. | Public docs teach schema inference first and explicit `V` only for raw/schema-less Plite. | Existing generic-value contracts plus explicit raw editor examples. | Removing it would make interoperability impossible; overteaching it recreates duplicate truth. | keep |
| Public extractors | `ValueOf`, `ElementOf`, and `TextOf` understand editors/values/nodes, but not Plate descriptors. | Extend the existing three extractors. Element descriptors resolve their own shallow persisted shape; schema sources/editors resolve finite installed vocabulary; `ValueOf<E>` is that vocabulary at the document-array boundary. Add no root parameter or synonym helper. | Plite, with an internal Core schema witness | One concept gets one public name without smuggling content grammar into it. | Feature packages and apps use the existing extractors. | Compile contracts for raw editor, schema extension, element handle, Base/Plate plugin, editor, and broad fallback. | Overloaded condition order can accidentally turn broad `Element` into `never`. | extend |
| Plugin schema type bridge | Core independently maps plugin definition union `D` through `PlateSchemaSource`; plugin descriptors are not directly understood by Plite extractors. | Carry Core's compiled schema declaration through Plite's existing internal schema-source witness and synthetic Plate extension. Do not add a second public value provider or accumulator. | Core lowers; Plite interprets | Plate must feel built on Plite at the type level, not maintain a parallel recursive model. | Base/Plate descriptors, dependencies, `.extend`, `.configure`, portals, and editor construction share the bridge. | Core schema contracts, dependency/latest-wins/configuration contracts, declaration emit. | Double expansion of installed plugin definitions can recurse or key-widen. | rearchitect |
| Plugin self-type staging | Plugins use handwritten element interfaces inside the constructor because the final descriptor does not exist yet. | Declare schema first; when behavior needs its own derived node type, use the smallest honest later `.extend()` stage and `ElementOf<typeof plugin>`. Export a readable alias only after the final descriptor. | Feature package | This breaks circular inference without public helper interfaces or `any`. | Table/media/link and other self-consuming plugins move only the dependent capability stage. | No explicit callback parameter annotations; exact API/update declaration contracts. | Gratuitous stages would recreate builder noise. | rearchitect |
| Plate editor type | Public `BaseEditor<V, P>` and `PlateEditor<V, P>` make manual value and plugin tuple independent inputs. | `BaseEditor<TPlugins>` and `PlateEditor<TPlugins>` derive value from the installed plugin graph; unparameterized forms remain broad framework boundaries. A single plugin or readonly plugin tuple normalizes internally. | Core | Two independently supplied truths can disagree. | Core public types, hooks, store helpers, packages, registry, tests, and docs migrate together. | Type contracts show exact `ValueOf`, plugin API, schema, update, and assignability. | Generic reordering is a hard break and can expose circular kit imports. | hard cut |
| Plate factories/hooks | `createBaseEditor`, `createPlateEditor`, and `usePlateEditor` expose caller generics and pass `V` separately from plugins. | Normal calls infer installed capabilities and output `ValueOf` from `plugins`; `initialValue` remains a broad runtime input and schema validation rejects incompatible structure. An injected raw Plite editor is the distinct advanced path and preserves its explicit value authority. | Core | Public factories must not structurally validate recursive descriptor graphs or force the full installed value while inferring plugin tuples. Runtime schema is already the honest validation boundary. | All explicit Plate factory generics are removed from packages/apps/docs/tests. | Positive output inference, broad input, runtime schema-mismatch, callback inference, and stale syntax contracts. | Existing-editor composition must not silently narrow an incompatible raw value. | hard cut |
| Feature element/text mirrors | 32 exported `T*Element`/`T*Text`/`T*Leaf` symbols exist in production source; most repeat plugin schema. | Delete central mirrors. Repeated public nouns may survive only as owner-local derived aliases such as `TableElement = ElementOf<typeof BaseTablePlugin>`, without the `T` prefix. | Owning feature package | Schema and type must have one owner; readable aliases are fine when they do not restate fields. | Package-by-package migration waves below. | Per-package typecheck/tests and zero stale exports/imports. | Large public break; circular inference must be resolved through staging, not manual aliases. | move and hard cut |
| Semantic refinements | `TListElement`, `TIndentElement`, `TIdElement`, resizable, and suggestion shapes describe a property-present subset rather than a unique element type. | Keep only real feature-owned refinement types, derived from the exact installed property capability and narrowed by semantic APIs. They do not return to Utils and do not pretend the plugin owns an element type. | Owning feature package on Plite property inference | Property plugins may affect many element types; `ElementOf<PropertyPlugin>` would be a lie. | List/indent/node-id/resizable/suggestion APIs expose narrowed owner-local types only where consumers need them. | Type-guard contracts prove narrowing and property values without broad casts. | Treating every property plugin as an element descriptor conflates schema roles again. | rearchitect |
| Domain payloads | Types such as table borders, suggestion metadata, media insert inputs, and Excalidraw data are mixed into `plate-types`. | Keep genuine payload/input types with their feature owner; rename touched public `T*` payloads to normal nouns and use them in schema validators. | Feature package | These are reusable domain contracts, not AST mirrors. | Table, suggestion, media, code drawing, Excalidraw, and related docs/imports. | Validator/type equality contracts. | Blanket deletion would replace useful domain names with anonymous JSON. | move and keep |
| Central `NodeMap` | Utils maps first-party names to handwritten node shapes; Markdown selects from it. | Delete `NodeMap`. Codec generics derive Plate nodes from installed schema/owning descriptors; Markdown keeps only its honest external MDAST map. | Core codec types and Markdown package | A central feature map couples Utils to every package and can never stay exact. | Markdown parser/codec types and tests migrate before Utils export deletion. | Markdown typecheck, codec tests, no `NodeMap` import/export. | Codec inference may expose another hidden manual map. | hard cut |
| Registry application value | `apps/www/.../plate-types.ts` manually recreates the editor tree and `MyEditor` is `PlateEditor<Value, typeof EditorKit>`. | Delete the registry AST mirror. `MyEditor = PlateEditor<typeof EditorKit>` and `MyValue = ValueOf<MyEditor>` only where a named value improves reuse; component node props use plugin descriptors/hooks. | Registry app | The registry should demonstrate the intended API, not carry the largest duplicate schema. | Main editor and editor-ai kit, registry UI/static nodes, values/examples, server-side use. | www typecheck plus representative Browser routes. | Type-only imports must avoid runtime cycles. | hard cut |
| Static/RSC rendering | Static node components consume manual element props in several registry files. | Preserve component publication and static/RSC behavior; only replace node types with descriptor-derived types. | Core static + registry | Type migration must not repeat the prior component-field regression. | Static node files and server-side example are explicit proof owners. | Static package tests and server-side route render. | Accidental runtime import can break RSC or create cycles. | keep |
| Utils package role | `@platejs/utils` publicly teaches shared feature AST shapes and `platejs` re-exports them. | Utils retains identity/catalog and honest generic utilities/plugins; feature AST and payload types leave. `platejs` re-exports owner package types only where it already owns that package surface, never recreates a map. | Utils + umbrella Plate | Utils must not know Table, Media, Suggestion, or future schemas. | Delete `plate-types.ts` when zero consumers remain; regenerate barrels. | Utils/Plate typecheck and export audit. | Consumers relying on umbrella-only feature types must import the feature owner. | hard cut |
| Legacy list model | `TTodoListItemElement` is a handwritten package-local mirror in a maintenance-only package. | Do not proactively modernize legacy-list-model. Touch only if the central hard cut prevents it from compiling; otherwise leave it for explicit deprecation/removal authority. | legacy-list-model | Plate vision explicitly excludes new architecture investment here. | No new docs/examples/parity work. | Package typecheck only if affected. | A zero-global-`T*` slogan would violate the stronger maintenance boundary. | defer |
| Compatibility/release | Existing public names are widely imported. | One breaking cut with changesets; no aliases, deprecated re-exports, dual generic order, or runtime shim. Public docs teach only the final state. | All changed packages | Compatibility would preserve two truths and prolong inference ambiguity. | Changesets, generated barrels, release notes, migration examples in changesets—not latest-state docs. | Export/stale-symbol scans and package artifact builds where exports require them. | Coordinating many packages in one cut is costly but architecturally cleaner. | hard cut |
| Browser/device | This is primarily a type and schema-law migration; requiredness can affect runtime validation. | Run desktop Browser proof on representative live, static, table, media/link, and AI registry routes. Keep physical-device/Appium proof deferred and fail-closed. | www/browser owners; device lane deferred | Typecheck cannot prove runtime schema adoption or RSC. Device hardware adds no evidence for generic correctness. | Browser proof occurs after package/app migration. | DOM render, console, schema validation, representative edits, static render. | Browser success cannot replace compile contracts; device deferral must not be misreported as proof. | gate |

## Locked public shape

Normal Plate construction has no caller-supplied value generic:

```ts
const EditorKit = [ParagraphPlugin, TablePlugin, LinkPlugin] as const;

const editor = createPlateEditor({
  plugins: EditorKit,
  initialValue,
});

type MyEditor = PlateEditor<typeof EditorKit>;
type MyValue = ValueOf<MyEditor>;
type TableElement = ElementOf<typeof BaseTablePlugin>;
type TableRowElement = ElementOf<typeof BaseTableRowPlugin>;
type EditorText = TextOf<MyEditor>;
```

`ValueOf` derives the finite installed document vocabulary. Root and named-root
membership stay runtime schema facts rather than becoming a second recursive
type language.

Raw/schema-less Plite keeps the advanced explicit path:

```ts
type ExternalValue = ExternalElement[];

const rawEditor = createEditor<ExternalValue>({ initialValue });
```

An element plugin descriptor is a typed schema handle. A property-only plugin
is not:

```ts
type LinkElement = ElementOf<typeof BaseLinkPlugin>;

// ListPlugin contributes properties to other elements, so its semantic APIs
// narrow an owner-local ListElement refinement instead of inventing a node type.
```

Feature aliases are derived after their descriptor exists:

```ts
export const BaseTablePlugin = defineBasePlugin('table', {
  dependencies: [BaseTableRowPlugin],
  schema: ({ plugins }) => ({
    element: {
      content: schema.content(plugins.element(BaseTableRowPlugin), {
        default: BaseTableRowPlugin,
        min: 1,
      }),
    },
  }),
}).extend(({ plugin }) => ({
  api: () => ({
    getColumnCount: (table: ElementOf<typeof plugin>) =>
      compileTableGrid(table).width,
  }),
}));

export type TableElement = ElementOf<typeof BaseTablePlugin>;
```

The descriptor-based schema grammar remains the exact runtime relationship
language. TypeScript derives exact discriminators, properties, mark values, and
canonical requiredness from it, but intentionally does not recursively encode
arbitrary parent/child/root paths. This plan does not restore `content.type`,
`content.types`, `plugins.elementType(s)`, or raw names as the normal path.

## Rejected alternatives

- Keep `PlateEditor<V, P>` and infer only when `V` is omitted: rejected because
  schema and value remain independently disagreeable truths.
- Add `PluginElement`, `ElementFor`, `PlateValueOf`, or `SchemaNodeOf`: rejected
  because the existing `ElementOf`/`TextOf`/`ValueOf` family already owns these
  jobs.
- Keep central aliases as deprecated wrappers: rejected because aliases preserve
  package coupling and make stale types appear supported.
- Infer every plugin as an element: rejected because property and behavior
  plugins do not own serialized element identity.
- Encode `min`/`max` as tuple lengths: rejected because it makes normal array
  construction/transforms hostile while runtime schema already owns counts.
- Preserve the recursive public grammar with a larger depth budget: rejected.
  It merely moves TS2589 and makes every capability pay for schema traversal.
- Generate recursive public node types from the runtime grammar: rejected.
  Code generation creates a second artifact pipeline for facts runtime schema
  already validates, while still producing hostile recursive editor types.
- Derive static requiredness from old interfaces: rejected because some old
  required fields are runtime-optional semantic refinements. Runtime canonical
  law wins.
- Build a second Core value accumulator: rejected because Plite already owns
  schema composition and `EditorExtensionTypeProvider` is the only public
  value-sensitive capability bridge.
- Modernize legacy-list-model as collateral work: rejected by the explicit
  maintenance-only boundary.

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 0. Doctrine and baseline | `best-api`, Plite/Core type owners | Record the accepted public shape in the source rule and the smallest Vision owner; remove contradictory worker wording; capture the complete public mirror/generic inventory and TypeScript diagnostics baseline. Regenerate skills from `.agents` with `pnpm install`. | This plan is accepted unchanged. | One doctrine says schema is the AST source, Plite owns inference, Plate projects it, and normal Plate APIs have no value generic. Baseline artifacts identify every migration target. | Skill/rule diff audit; `pnpm install`; bounded `rg` inventories; declaration size and `tsc --extendedDiagnostics` baseline. |
| 1. Preserve exact schema declarations | Plite schema definition/types | Make content/root/group/combinator/property builders preserve readonly literal descriptor and option types. Add explicit canonical-requiredness metadata and distinguish construction input from canonical output without changing runtime behavior yet. | Slice 0 baseline exists. | No schema fact needed by inference has widened to `string`, broad `SchemaContent`, or undifferentiated optional property metadata. | Plite compile-only tests for `type`, descriptor, group, `any`, `all`, `not`, `open`, text, root, named root, exact/prefix property, defaults, and dynamic input. |
| 2. Compile a shallow finite value vocabulary | Plite schema/value inference | Replace contextual/depth-limited recursion with one finite union of installed element and text shapes. Preserve exact discriminators, owned properties, mark values, canonical requiredness, and honest open/unknown branches. Keep every element's child array broad and relationship-neutral. | Exact declarations survive Slice 1. | `ValueOf`, `ElementOf`, and `TextOf` are useful and finite; no child recursively embeds the installed vocabulary; no editor capability evaluates content grammar; broad `Value` remains the fallback. | Positive and `@ts-expect-error` vocabulary/property contracts; runtime relationship parity tests; declaration emit; no TS2589/TS2590; diagnostics budget. |
| 3. Lower Plate plugins into Plite without capability inflation | Core plugin compiler/types | Carry full installed schema definitions only through deferred `ValueOf`/node witnesses and `read.schema`; project a compact runtime graph containing `name`, `api`, `read`, and `update` for ordinary editor capabilities. Preserve dependencies, latest-wins idempotence, `.configure`, `.extend`, named roots, injection, and dynamic install semantics. | Slice 2 exposes one finite Plite result. | A Plate descriptor/tuple produces one compact capability graph and lazy schema projections without double expansion. | Core plugin-schema contracts, dependency/configuration/latest-wins tests, large-kit declaration compile, Core source-first typecheck. |
| 4. Hard-cut editor and factory generics | Core editor/hooks/store | Change normal `BaseEditor`/`PlateEditor` to plugin-first derivation and remove caller value generics from `createBaseEditor`, `createPlateEditor`, `usePlateEditor`, related stores, and test helpers. Keep factory `initialValue` broad, validate it at runtime, retain explicit `createEditor<V>` for Plite, and preserve an honest injected-editor advanced path. Relax public plugin-input constraints to readonly unknown tuples so inference does not structurally instantiate full descriptors. | Slice 3 can infer the installed output value. | `PlateEditor<typeof Kit>` and `BaseEditor<typeof Kit>` are the ordinary types; factories infer without annotations; incompatible documents fail at runtime schema validation. | Exact output inference, broad input, runtime mismatch, broad-boundary, injected-editor, callback inference, and public declaration contracts; stale generic scan. |
| 5. Table vertical slice | Table plus Plite/Core owners | Migrate table, row, cell/header, border payload, APIs, React hooks, tests, and static registry consumers. Stage descriptor construction only where a behavior needs its own derived node type. | Slices 1–4 pass focused proof. | Table proves exact node/property vocabulary plus runtime `Table -> Row -> Cell/Header -> block` validation, transforms, clipboard/history, and static rendering without a handwritten AST mirror. | Full Table typecheck/tests, shallow vocabulary assertions, runtime relationship rejection tests, exact editor inference, representative `/blocks/table-demo` Browser proof, RSC/static proof. |
| 6. Migrate element-owning feature packages | Each schema owner | Wave A: basic nodes, callout, code-block, columns, date, equation, link, mention, tag, media, code-drawing, Excalidraw, footnote, and other unique element descriptors. Replace repeated public types with owner-local derived aliases only where readability/reuse earns them. | Table establishes the pattern. | No migrated element package restates `type`, children, or schema-owned properties in a manual interface. | Per-package source-first typecheck/tests; descriptor/extractor type contracts; Browser proof for changed visible registry surfaces. |
| 7. Migrate property and mark capabilities | Plite inference plus feature owners | Wave B: node-id, indent, list, resizable, comment, suggestion, basic/font marks, code syntax, and other property contributors. Replace fake element ownership with honest guards/refinements derived from installed editor values. | Contextual property inference from Slice 2 is proven. | Property plugins infer keys/value/placement without claiming a unique element; semantic APIs return precise narrowed types. | Guard/refinement contracts, package tests/typechecks, dynamic-prefix and target tests. `legacy-list-model` remains excluded unless compilation forces a minimal repair. |
| 8. Delete central AST maps and mirrors | Utils, Markdown/codecs, feature owners | Move genuine payload types to owners, derive Markdown/codec node types from installed schema/descriptors, delete `NodeMap` and `packages/utils/src/lib/plate-types.ts`, update umbrella exports, and regenerate barrels. | All consumers have an owner-derived replacement. | Utils no longer imports knowledge of feature ASTs; no central first-party node map remains. | Markdown codec/type tests; Utils/Plate typecheck; `pnpm brl`; zero targeted mirror/map imports or exports. |
| 9. Migrate registry, apps, tests, and docs | Core consumers, registry, docs | Delete registry `plate-types.ts`; derive `MyEditor`/`MyValue`; remove explicit Plate factory/editor value generics; update component props without runtime import cycles; update current EN/CN docs and examples to teach inference first. | Package exports are final. | First-party consumers demonstrate the final API; static/RSC component fields and registry transparency remain intact. | www/docs typecheck; static rendering tests; representative live/static/table/media/link/AI Browser routes; docs stale scan. |
| 10. Release closure | All changed owners | Add package changesets, run barrels/lint/typechecks/tests/Plite handoff gates, stale-symbol scans, declaration diagnostics comparison, Browser proof, and `autoreview`; repair every accepted P0/P1 finding. | Slices 0–9 are green. | One source-frozen hard cut with no compatibility path, no weaker inferred type, and no unproved runtime claim. | Commands in the proof matrix; changeset/export audit; final review receipt. |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Plite is the sole schema-derived value compiler | `SchemaValueFromExtensions` and `EditorExtensionTypeProvider` already live in Plite; Core currently projects `PlateSchemaSource`. | No second Core accumulator; Core type equality tests compare its installed plugin result to Plite's finite schema vocabulary. | specified |
| Root grammar remains runtime-exact | Recursive root filtering made ordinary editor types non-terminating. | Closed/open/named-root runtime validation contracts reject invalid documents while `ValueOf` stays a finite installed vocabulary. | specified |
| Child relationships remain runtime-exact | Recursive child projection caused TS2589 across large editor kits. | Table/row/cell, columns, code block, inline/link, void, recursion, groups, combinators, and complements have runtime acceptance/rejection contracts; static types retain exact node discriminators and properties. | specified |
| Property types match runtime canonicalization | Runtime materializes non-omitted defaults while current inferred properties are optional. | Input/output type assertions plus runtime tests for required-without-default, materialized default, `omitDefault`, prefix, target, and dynamic target. | specified |
| Public inference is finite and stable | The recursive experiment hit TS2589 merely evaluating large-kit editor capabilities. | Large EditorKit can evaluate `editor.api`, `editor.read`, `editor.update`, `ValueOf`, and store hooks; declaration emit succeeds; no TS2589/TS2590; type instantiations and emitted declaration size stay within the recorded budget. | specified |
| Open schemas remain honest | Current preserve paths intentionally keep broad unknown data. | Known variants stay exact while unknown/open branches accept legal external descendants and reject only runtime-known invalid cases. | specified |
| Existing extractor family is sufficient | `ValueOf`, `ElementOf`, and `TextOf` already own editor/node extraction. | Contracts cover raw nodes, Plite schema, Plate element descriptor, installed editor, and broad fallback with no named-root overload or synonym helper. | specified |
| Plate plugin graph determines value | Current Plate types accept independent `V` and plugin inputs. | Dependencies, configured plugins, latest duplicate, extension stages, dynamic install, and named roots produce the same exact installed value. | specified |
| Ordinary Plate APIs need no value generic | Current repo has 42 matches for independent Plate editor/factory generic forms in packages/apps/content. | Zero production/docs matches for `PlateEditor<Value`, old two-generic editor order, `createPlateEditor<`, or `createBaseEditor<`; raw `createEditor<V>` tests remain. | specified |
| Feature inference is not weaker than mirrors | Live inventory has 32 first-party `T*Element`/`T*Text`/`T*Leaf` mirrors plus central `NodeMap`. | Before deleting each type, bidirectional assignability tests prove every schema-owned discriminator/property/mark fact; parent/child facts move to explicit runtime schema tests. | specified |
| Table proves the hard runtime grammar | Table currently imports central table node mirrors broadly. | Derived Table/Row/Cell types preserve discriminators and domain payloads; runtime schema rejects wrong nesting; transforms, clipboard, history, React, and static tests pass. | specified |
| Property-only plugins do not become fake elements | Existing indent/list/ID/resizable/suggestion types are semantic subsets. | `ElementOf<PropertyPlugin>` is not exposed; type guards refine `ElementOf<Editor>`/installed element unions to feature-owned intersections. | specified |
| Utils loses feature AST ownership | `plate-types.ts` and `NodeMap` couple Utils to all feature packages. | File/export deletion, zero targeted imports, Markdown codec proof, Utils/umbrella typecheck, generated barrel audit. | specified |
| Registry demonstrates inference | Registry manually defines `MyValue` and `PlateEditor<Value, typeof EditorKit>`. | `MyEditor = PlateEditor<typeof EditorKit>`, optional `MyValue = ValueOf<MyEditor>`, no duplicate registry AST, and www/static/RSC proof. | specified |
| Runtime behavior does not regress | Most work is static, but requiredness and descriptor lowering touch runtime schema boundaries. | Existing Plite/Core/feature suites, focused schema tests, `pnpm check:plite`, and representative Browser interaction/console proof all pass. | specified |
| The hard cut is complete | Public mirrors and generic forms are exported and documented today. | Changesets, `pnpm brl`, export audit, stale-symbol audit, current EN/CN docs, and final `autoreview` have no accepted P0/P1 finding. | specified |

Conditional evidence:
- High-risk scenarios apply. Execution must explicitly cover accidental
  recursive generic expansion, closed-schema over-acceptance, open-schema under-acceptance,
  canonical requiredness versus legacy persisted data, plugin dependency and
  latest-wins projection, descriptor self-reference/cycles, injected raw editor
  authority, and type-only registry/RSC imports. Each has a fail-closed gate
  under Open risks.
- External research is complete for target selection. Wordgard/ProseMirror
  confirm that grammar belongs to the runtime schema model; this plan does not
  need another editor survey before implementing the finite TypeScript projection.
- Issue/PR provenance is not applicable: this is a user-directed internal major
  migration, not a public issue/PR intake. Changesets are still mandatory for
  every changed published package.
- Browser work applies to execution because package/app/docs sources and runtime
  requiredness may change. Use the Browser skill against standalone registry
  demo routes; use Chrome/Computer only if native browser behavior becomes part
  of a discovered regression. Benchmarks apply only to TypeScript diagnostics,
  not editor runtime speed. Current EN/CN docs and changesets apply. Physical
  device/Appium proof remains explicitly deferred and cannot be claimed.

Findings:
- Plite already owns installed-extension schema composition through
  `SchemaValueFromExtensions`; Core already has a `PlateSchemaSource` projection.
  The right change is to join those owners, not invent another value engine.
- `SchemaValue<T>` should intentionally expose the installed document vocabulary,
  not recursively filter it by root grammar. Runtime schema remains the owner of
  whether a cell, row, or inline is legal at a particular path.
- `SchemaElementFor<T>` must keep `children` broad. Embedding even the finite
  installed union back into every element is recursive and makes ordinary
  nested access re-evaluate the whole schema. Exact installed element/text
  vocabulary belongs in lazy editor/node witnesses, not in child storage.
- Content builder returns erase literal rules early. Relationship-aware types
  must start by preserving the source descriptor; a clever downstream
  conditional type cannot recover erased literals.
- Both the old depth-five fallback and the exact-recursive replacement are
  rejected. One silently loses precision; the other makes large editors exceed
  TypeScript's recursion budget. The public model must be shallow by design.
- Property inference already knows descriptor value types, exact/prefix keys,
  and target predicates, but maps every property optional. Runtime
  canonicalization materializes defaults when `omitDefault` is false, so input
  and canonical output types need different presence rules.
- One target truth value is insufficient. Schema handles need “definitely
  applies”; document unions need “may apply.” A widened/dynamic target must not
  make valid persisted data disappear from the inferred union.
- The live checkout has 32 production first-party `T*Element`/`T*Text`/`T*Leaf`
  mirror symbols plus `NodeMap` in central Utils. They mix three unlike things:
  schema mirrors to delete, semantic property-present refinements to relocate,
  and genuine domain payloads to keep with their owner.
- Table is the correct first consumer because it simultaneously stresses exact
  nested relationships, per-node properties, recursive blocks, transforms,
  clipboard/history, React hooks, and static registry rendering.
- `PlateEditor<Value, typeof EditorKit>` in the main registry proved the public
  factory inference was not enough: users had to manually thread a second AST
  truth through editor aliases. The replacement derives output vocabulary from
  plugins while keeping constructor input broad and runtime-validated.
- The low-level broad `Value` is still necessary. Schema-less importers and
  externally owned data should use explicit Plite `createEditor<V>`; forcing a
  pretend plugin schema would be worse API.
- `legacy-list-model` is maintenance-only under current doctrine. It is not a valid
  reason to leave central aliases alive, nor permission for collateral
  modernization; a minimal compile repair is the only allowed touch.

Decisions and tradeoffs:
- Schema is the sole AST-shape source of truth. Runtime payload/domain types
  remain named contracts; handwritten node mirrors do not.
- Readable feature aliases may remain only when derived from an owning schema
  descriptor and reused enough to improve public signatures.
- The migration sequence is parity first, deletion second. A shorter diff is
  not worth weaker inference.
- Exactness means exact installed discriminators, property/mark value types, and
  canonical presence. Parent/child/root relationships and cardinality are
  runtime grammar facts, not recursive public editor types.
- `ValueOf`, `ElementOf`, and `TextOf` are the complete extractor vocabulary.
  Named roots use runtime schema handles; they are not a `ValueOf` type parameter.
- An element descriptor is a schema handle. A property descriptor contributes
  to installed element/text variants but is not itself an element handle.
- `PlateEditor<typeof Kit>` wins over `PlateEditor<Value, typeof Kit>` and over
  `PlateEditor<ValueOf<typeof Kit>>`: only one input may own the value truth.
- Explicit value generics survive only on raw Plite construction. Plate cannot
  retain an ordinary escape hatch that lets plugin schema and value disagree.
- Core may carry a full internal Plite schema witness for `ValueOf` and
  `read.schema`, but ordinary capabilities must consume a compact projection.
  Exact plugin dependencies are lowered once, then interpreted by Plite.
- Construction input and canonical output are different schema projections.
  Defaults can make outputs required without forcing callers to write them.
- Dynamic/open runtime facts widen only the affected branch. They must not
  collapse every known variant to `Element` or produce `never`.
- Public alias deletion is intentionally breaking. Compatibility aliases would
  keep the wrong owner and defeat the cleanup.

Review fixes:
- Rejected primary/named-root filtering in `ValueOf` after the exact-recursive
  experiment caused large-kit TS2589 failures.
- Replaced relationship-specific public children with a shallow installed
  vocabulary and explicit runtime relationship proof.
- Split construction input from canonical output requiredness after confirming
  runtime default materialization.
- Split target evaluation into definite and possible application so dynamic
  schemas stay sound.
- Rejected tuple cardinality, the depth-five precision fallback, and unbounded
  recursive public grammar.
- Added injected-editor authority, RSC/static component preservation, and
  runtime-cycle gates.
- Classified central `T*` types instead of applying a blind naming deletion;
  payloads/refinements now have explicit owners.
- Excluded proactive `legacy-list-model` modernization and physical-device testing.

## Adoption inventory

The baseline inventory is exhaustive for exported production symbols matching
the current mirror family: 32 `T*Element`/`T*Text`/`T*Leaf` symbols and one
`NodeMap`. Execution refreshes this count before and after every wave.

| Class | Current symbols | Final owner/action |
| --- | --- | --- |
| Unique element schema mirrors | `TAudioElement`, `TCalloutElement`, `TCodeBlockElement`, `TCodeDrawingElement`, `TColumnElement`, `TColumnGroupElement`, `TComboboxInputElement`, `TDateElement`, `TEquationElement`, `TExcalidrawElement`, `TFileElement`, `TFootnoteElement`, `TImageElement`, `TLinkElement`, `TMediaElement`, `TMediaEmbedElement`, `TMentionElement`, `TPlaceholderElement`, `TTableCellElement`, `TTableElement`, `TTableRowElement`, `TTagElement`, `TVideoElement` | Delete handwritten declarations. Use `ElementOf<typeof OwnerPlugin>` directly; export owner-local `AudioElement`, `TableElement`, and similar aliases only when repeated public signatures justify the noun. |
| Text/leaf schema mirrors | `TCodeSyntaxLeaf`, `TCommentText`, `TSuggestionText` | Derive from `TextOf` for the owning descriptor or installed editor. Keep an owner-local refinement only where a dynamic prefix/semantic guard returns a stricter text branch. |
| Property-present element refinements | `TIdElement`, `TIndentElement`, `TListElement`, `TResizableElement`, `TSuggestionElement` | Remove from Utils. Feature guards/APIs derive and return an intersection/refined member of the installed element union; property plugins do not acquire fake element identity. |
| Maintenance-only exception | `TTodoListItemElement` | Leave package-local in `legacy-list-model` unless the central export cut makes it fail compilation; if forced, do the minimum owner-local derivation and no broader modernization. |
| Central map | `NodeMap` | Delete after Markdown/codecs infer from installed descriptors. Do not replace it with another global interface or module augmentation registry. |

The rest of `packages/utils/src/lib/plate-types.ts` is classified rather than
silently dragged into a new dumping ground:

| Current family | Final action |
| --- | --- |
| Schema-owned property bags: `TTagProps`, `TIdProps`, `TTextAlignProps`, `TResizableProps`, `TMediaProps`, `TIndentProps`, `TListProps`, `TSuggestionProps`, `TBasicMarks`, `TFontMarks` | Delete as AST truth. Feature APIs derive exact node/text properties from descriptors. A command input gets a separate owner-local input type only if it is not identical to persisted schema data. |
| Domain values: `TScriptValue`, `TTableCellBorder`, `TSuggestionData`, `TInlineSuggestionData`, `TInsertSuggestionData`, `TRemoveSuggestionData`, `TUpdateSuggestionData` | Move to the feature owner, drop the legacy `T` prefix when touched, and make the schema validator/default reference that same payload type. Preserve discriminated unions and JSDoc. |
| Structural helpers: `EmptyText`, `PlainText` | Move to Plite if they remain materially reused; otherwise inline/delete. They are model primitives, not Plate feature types. |

Package migration waves are dependency-ordered, not alphabetical:

1. Plite, Core, Table.
2. Foundational block/inline owners: basic nodes, code-block, columns, link,
   node-id, indent, list, resizable.
3. Media and data-rich elements: media, callout, date, equation, mention, tag,
   code-drawing, Excalidraw, footnote.
4. Text/property owners: basic marks, font, comments, suggestion, code syntax.
5. Markdown/codecs, Utils, umbrella Plate.
6. Registry/apps/tests/current EN/CN docs.
7. `legacy-list-model` only if a compile failure proves unavoidable impact.

## Public migration contract

Ordinary editor aliases stop carrying a manually synchronized value:

```ts
// Before
type MyValue = ParagraphElement | TableElement | LinkElement;
type MyEditor = PlateEditor<MyValue, typeof EditorKit>;

// After
type MyEditor = PlateEditor<typeof EditorKit>;
type MyValue = ValueOf<MyEditor>;
```

Feature types stop restating schema fields:

```ts
// Before
interface TTableElement extends Element {
  colSizes?: number[];
  marginLeft?: number;
}

// After, only if the alias improves repeated public signatures
type TableElement = ElementOf<typeof BaseTablePlugin>;
```

Factories infer from the installed plugin graph:

```ts
// Before
createPlateEditor<MyValue, typeof EditorKit>({
  plugins: EditorKit,
  initialValue,
});

// After
createPlateEditor({
  plugins: EditorKit,
  initialValue,
});
```

Property capabilities narrow existing nodes rather than manufacture one:

```ts
const entry = editor.plugin(ListPlugin).read.listEntry();
// entry is a narrowed member of ValueOf<typeof editor>, with list properties.
```

Only raw/schema-less Plite retains a caller-owned AST generic:

```ts
const editor = createEditor<ExternalValue>({ initialValue });
```

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| One oversized plan patch returned truncated tool output | 1 | Inspect the actual file and apply bounded section patches | File was inspected; completed sections were retained and every remaining placeholder was replaced in smaller patches. |

Verification evidence:
- Live owners inspected: `packages/plite/src/interfaces/{schema,editor,element,text}.ts`,
  `packages/plite/src/core/{schema-definition,editor-schema}.ts`,
  `packages/plite/src/create-editor.ts`, Core plugin/editor projection owners,
  Table's base descriptor and types, Utils `plate-types.ts`, registry editor kit
  and value mirror, Markdown consumers, and current API/guide docs.
- Current exported mirror inventory: 32 distinct production
  `T*Element`/`T*Text`/`T*Leaf` symbols plus `NodeMap`; exact names are recorded
  in Adoption inventory.
- Current old editor/factory generic inventory: 42 matches across
  `packages`, `apps`, and `content` for independent Plate editor/factory value
  forms. This is a migration baseline, not the final zero gate.
- Current `plate-types`/`NodeMap` inventory: 19 files across packages/apps/docs.
- Baseline Plite source TypeScript diagnostics: 453 files, 162,970 types,
  477,728 instantiations, 268,321K memory, 0.227s check.
- Baseline Core source TypeScript diagnostics: 1,044 files, 1,090,341 types,
  5,867,872 instantiations, 1,245,262K memory, 1.271s check.
- Slice 1-2 Plite proof: `pnpm --filter @platejs/plite typecheck` passes;
  schema declaration builders pass 16/16; architecture contracts including
  schema runtime parity pass 177/177; declaration-only emit succeeds with 182
  declarations and no TS2589/TS2590.
- Slice 1-2 diagnostics: 453 files, 191,011 types, 540,226 instantiations,
  282,658K memory, 0.194s check. Instantiations are +13.1% over the 477,728
  baseline and remain inside the locked 15% budget.
- Source inspection confirmed `SchemaValue<T>` is root-unfiltered,
  `SchemaElementFor<T>` uses the all-descendants union, public recursion widens
  after five levels, schema builders erase literal rules, and canonicalization
  materializes non-omitted defaults.
- Self-review resolved every public call-shape P0/P1 raised by those findings:
  single owner, exact relationships, root filtering, contextual properties,
  input/output requiredness, finite recursion, plugin-first editors, no helper
  aliases, no compatibility path.
- Final artifact check command:
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-02-schema-derived-editor-value-types.md`.
  Fresh result on 2026-08-03:
  `[autogoal] complete: docs/plans/2026-08-02-schema-derived-editor-value-types.md`.
- That result closed planning only. The accepted execution goal reopened the
  checklist and completion gates; no implementation completion is claimed.
- `best-api repair`: `.agents/rules/best-api.mdc` and
  `docs/vision/plite.md` now define schema as the sole first-party AST type
  truth, exact root/relationship/property inference, plugin-first Plate editor
  types, raw Plite escape ownership, and forbidden mirror/map alternatives.
  `pnpm install` regenerated `.agents/skills/best-api/SKILL.md`; focused `rg`
  confirmed the durable rule in source, generated skill, and Vision.

Final handoff prepared:
- Ownership and target API/runtime: Plite owns exact schema-to-value compilation;
  Core lowers installed Plate descriptors into that compiler once; features own
  schemas and domain payloads; Utils owns no feature AST. Runtime schema grammar
  remains authoritative for validation/cardinality/canonicalization.
- Public breaks and Plate/collaboration adoption: hard-cut independent value
  generics from normal Base/Plate editors and factories; delete central AST
  mirrors and `NodeMap`; migrate all first-party packages/apps/tests/current docs
  in the ordered waves; keep explicit raw Plite `createEditor<V>` only. Any
  collaboration schema contribution uses the same Plite provider, not a special
  value path.
- Applicable browser/benchmark/docs/provenance decisions: desktop Browser proof
  covers representative registry and static/RSC routes; TypeScript diagnostics
  are the only benchmark; current EN/CN docs and changesets are required;
  public issue/PR provenance and physical-device testing do not apply to this
  execution claim.
- Proof and execution risks: parity is proven before each mirror deletion;
  recursive diagnostics, open/closed schema soundness, runtime requiredness,
  plugin graph projection, raw editor authority, and import cycles are hard
  gates. No broad check or Browser screenshot substitutes for focused type and
  runtime contracts.
- Execution order and user attention: accept or amend the locked public shape;
  then invoke `plite-plan` with this file. Execute Slices 0–10 in order. Stop for
  user input only if the TypeScript complexity budget makes the accepted shape
  impossible or a persisted-data requiredness decision changes runtime product
  behavior; ordinary migration breakage is implementation work, not a new API
  decision.

Timeline:
- 2026-08-02T22:17:04.224Z Plite Plan created.
- 2026-08-03 Live Plite/Core/feature/registry/docs owners audited and migration
  inventories captured.
- 2026-08-03 Public target, rejection list, decision ledger, execution slices,
  proof matrix, adoption inventory, risks, and handoff completed.
- 2026-08-03 User accepted the plan with `go`; one-shot execution goal created
  and Slices 0-10 reopened for implementation evidence.
- 2026-08-03 Slice 0 complete: durable API doctrine repaired and synced;
  baseline symbol counts and Plite/Core extended diagnostics captured.
- 2026-08-03 Slices 1-2 complete: exact declaration facts, root/relationship
  inference, contextual canonical properties, open branches, unbounded
  recursive precision, runtime requiredness, declaration emit, and diagnostics
  budget proven.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Slice 3, Plate plugin graph lowering. |
| Where am I going? | Project installed Plate descriptors through Plite once, then hard-cut independent editor value generics. |
| What is the goal? | Implement exact schema-derived editor values and Plate hard-cut adoption without inference regression. |
| What have I learned? | See Findings |
| What have I done? | Completed doctrine/baseline plus exact Plite schema-derived values, runtime parity, declaration emit, and complexity proof. |

Open risks:
- TypeScript recursive expansion: if exact relationships trigger TS2589/TS2590
  or exceed the 15% instantiation/declaration-size budget, stop before Core
  adoption and redesign the internal lazy representation. Do not restore a
  public depth cap or hide it with `any`.
- Closed-schema over-acceptance: root/child negative contracts must fail before
  any feature mirror can be deleted.
- Open/dynamic under-acceptance: runtime-preserved unknown data and undecidable
  targets need a conservative branch local to that rule; `never` is a blocker.
- Requiredness/product compatibility: every field currently handwritten as
  required gets a runtime owner decision. If enforcing it rejects accepted
  persisted data, stop that feature row for product direction rather than
  encode a false type.
- Plugin graph drift: dependencies, `.configure`, `.extend`, duplicate latest
  wins, named roots, and dynamic installation must all project the same schema.
  Any mismatch blocks the Core generic cut.
- Injected editor authority: Plate must not silently narrow a raw Plite editor
  whose value/schema is externally owned. The advanced composition contract
  must be explicit or rejected at compile time.
- Self-reference and runtime cycles: a feature may add one later descriptor
  stage for its own derived node type, but no `any`, duplicate interface, or
  runtime reverse import is accepted.
- Registry/static cycles: derived node props use type-only imports or hooks;
  static/RSC component publication must render before registry mirror deletion.
- Migration scale: the hard cut is broad. Slice boundaries and per-package
  parity gates prevent a half-migrated central alias from becoming permanent.
- Device proof remains deferred. No final report may imply raw-device coverage.
