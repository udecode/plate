# Application schema overrides and property handles

Objective:
Hard-cut singular plugin storage identity into schema-owned element and property
handles, then add one closed-application schema override boundary. Completion
means package authors can own several fields, applications can remap element
types and relationships without lying to generated `Value`, property keys stay
statically usable, every public break has an adoption path, and all named type,
runtime, migration, docs, browser, release, and doctrine gates pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-03-application-schema-overrides-and-property-handles.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- docs
- package-api
- browser
- agent-native
- registry-changelog

Mode:
- `standard execution`: the user accepted this exact plan on 2026-08-03.
  `best-api` resolved the public ontology; this run owns the Plite/Core
  boundary, breaking adoption, and proof without another planning pause.

Completion threshold:
- One immutable plugin `name` identifies capability; no universal plugin
  `type` or `key` survives.
- An installed element is addressed by a `SchemaElementHandle`; every property
  contributed by a plugin is addressed by one `SchemaPropertyHandle` under a
  keyed `schema.properties` map.
- A closed `defineEditor(name, definition)` may apply explicit, deterministic
  schema overrides. Raw plugin arrays and `.configure()` / `.extend()` cannot.
- Application overrides may remap an element type, replace compatible content
  relationships or group membership, retarget an existing property, and add
  app-owned properties. They cannot rename a plugin-owned property key or
  replace its value law.
- Raw plugin capability types stay shallow. The generated editor contract owns
  the final recursive `Value`, final persisted element literals, mutation map,
  schema-handle map, and fingerprint.
- Every old top-level `.type`, `.key`, `own.type`, `own.key`, and singular-key
  assumption is removed rather than aliased.
- Plite, Core, CLI, affected packages, registry, docs, changesets, doctrine,
  Browser proof, source audits, and final review pass.

Verification surface:
- Planning: current Plite schema/handle/compiler owners, Core plugin lowering
  and portals, generated editor contracts, Table and Indent multi-property
  examples, current docs, local Wordgard and ProseMirror precedents, and a
  bounded identity-use inventory.
- Execution: focused Plite/Core/CLI type and runtime contracts, full generated
  EditorKit sentinel, package adoption checks, History/Yjs identity tests,
  docs parsing, generated barrels/contracts/changelog checks, Browser routes,
  Plate Next doctrine validation, lint, and autoreview.

Constraints:
- The accepted public shape is fixed. Pivot implementation details when proof
  requires it, but record and re-review any public-shape change before broad
  adoption.
- No public compatibility aliases, raw-string identity registries, `KEYS`,
  `NODES`, `FIELDS`, reverse lookup, or runtime shim.
- Exact generated application `Value` remains non-negotiable; the full grammar
  must not recurse through ordinary `editor.api`, `editor.read`, or
  `editor.update` capability access.
- Plugin-owned property keys remain stable. Renaming `indent` to `depth` is a
  new persisted field plus an explicit migration, not configuration.
- App schema overrides are static closed-composition policy. Dynamic runtime
  schema replacement remains Plite extension reconfiguration and does not gain
  a second Plate API.
- `.configure()` remains terminal state/component policy; `.extend()` remains
  capability widening. Neither mutates schema identity or grammar.
- The compiler rejects ambiguous or order-dependent overrides. Source order is
  never conflict resolution.
- Keep normal node access such as `node.header` and `node.indent`; handles are
  for identity-sensitive construction, matching, inspection, codecs, and
  generic schema operations.
- Do not manually edit `templates/**` or generated skill mirrors. Raw-device
  testing stays deferred because this work changes types, schema compilation,
  and ordinary web behavior only.

Boundaries:
- In scope: Plite schema source references and handles; explicit override IR
  and compiler phases; Core plugin schema declaration/lowering/context/portal;
  `defineEditor` and generated contracts; feature package adoption; app and
  registry adoption; migrations; docs; release artifacts; schema adoption
  checker; Vision and skill doctrine.
- Source owners: `packages/plite`, `packages/core`, `packages/cli`, affected
  `packages/*`, `apps/www/src/registry`, `content/docs`, `.changeset`,
  `apps/www/src/registry/changelog/entries`, `.agents/rules`, `VISION.md`, and
  `docs/vision`.
- Non-goals: consumer-renamable property keys; arbitrary replacement of a
  plugin-owned property kind/default/validator; app mutation of `inline`,
  `void`, `contentRoots`, or other behavior-critical element laws; automatic
  data migration; a second complete schema DSL; generated feature-package AST
  mirrors; physical-device proof.
- Direct Plite boundary owners: nominal element/property handles, source-bound
  references, override declaration IR, deterministic two-pass compilation,
  property value lookup, compiled schema identity/delta, runtime
  reconfiguration, History, and Yjs persistence checks.

Output budget strategy:
- Read named owners first. Use counts and an AST-backed manifest for broad
  adoption instead of streaming every hit. Keep one plan artifact.

Blocked condition:
- Block only if the type feasibility slice cannot express source-bound handles
  and final generated identities without TS2589, `any`, or a false literal, or
  if compiled overrides cannot preserve deterministic identity and atomic
  rollback. A focused prototype or proof failure must decide that before broad
  adoption starts.

Plate Plan state:
- status: complete
- phase: immutable handoff
- next: none
- handoff: implementation, package, strict Plite, docs, release, doctrine, Browser, source-audit, and independent-review proof complete

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Multiple fields, schema ownership, consumer override, element type remap, property-key tradeoff, generated types, and Wordgard/ProseMirror comparison are explicit above. |
| Active goal and plan verified | yes | The active one-shot execution goal names this accepted plan and all seven proof slices. |
| Current owners read | yes | Live Plite schema interfaces/compiler/runtime, Core plugin definitions/lowering/portals, CLI generator, Table, Indent, current docs, and prior identity/generated-contract plans were read. |
| Best API target resolved | yes | One target: immutable capability `name`, schema handles for document identity, and one closed app override boundary. |
| Mode and execution boundary resolved | yes | Standard plan; no product source changes before acceptance. |
| Docs pack selected | yes | Guide/system, API reference, and Plite schema concept lanes apply. |
| `docs-creator` loaded | yes | The complete docs skill was read. |
| Docs lane selected | yes | `editor` and `plugin` are guide/system pages; `plate-plugin` is API reference; Plite `19-schema` is the substrate concept page. |
| Target docs and nearest sibling docs read | yes | EN/CN editor and plugin guides, EN/CN Plate plugin API, Plite schema and editor concept pages were inspected. |
| Docs style doctrine read | yes | Current-state reference voice, owner maps, real imports, and route proof requirements are captured. |
| Documented source owner identified | yes | Plite owns schema mechanics; Core owns Plate descriptors/portals; CLI owns closed generated contracts. |
| Package/API pack selected | yes | Public Plite, Core, CLI, `platejs`, and feature descriptor/type surfaces break. |
| Public surface or package boundary identified | yes | Exact public target and layer ownership are recorded below. |
| Release artifact path selected | yes | Rework one-package changesets from `main`; add one registry source changelog entry for copied-code adoption. |
| `changeset` skill loaded when `.changeset` is required | yes | The complete changeset skill was read; Core packages use no `minor`, and each file names one package. |
| Barrel/export impact decision recorded | yes | Unified handle exports and removed public types require `pnpm brl`. |
| Browser pack selected | yes | Schema reconfiguration, Table, and full EditorKit have runnable web routes. |
| Browser route / app surface identified | yes | `/examples/plite/schema-reconfiguration`, `/blocks/table-demo`, and `/blocks/playground-demo`. |
| Browser tool decision recorded | yes | Browser is sufficient; no native Chrome/OS action is involved. |
| Console/network caveat policy recorded | yes | Compare against the known script warning/table-cell hydration noise; any new error blocks closure. |
| Agent-native pack selected | yes | Public doctrine and package-review rules change. |
| Agent-facing action surface identified | yes | `best-api`, `plate-next`, `plate-plugin-creator`, `docs-creator`, and the schema adoption checker. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`, bump Plate Next doctrine, then run `pnpm install`; never edit generated `SKILL.md`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | The complete reviewer skill was read and its parity map is included below. |
| Registry changelog owner loaded | yes | Source entry under `apps/www/src/registry/changelog/entries`, then `--write` and `--check`. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and private compiler bridges have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without a generic matrix.
- [x] Docs lane, targets, nearest siblings, and source owners are recorded.
- [x] Every planned docs API/import/route is tied to the accepted source shape.
- [x] Docs use current-state reference voice; migration prose stays in migration/release owners.
- [x] Package boundaries, exports, release artifacts, hard cut, and checks are explicit.
- [x] Browser routes, interactions, visible outcomes, and console policy are explicit.
- [x] Agent rule sources, generated mirrors, Plate Next versioning, and review are explicit.
- [x] Normal direct property access and advanced handle access have separate jobs.
- [x] Element type remapping and property-key non-remapping have explicit migration laws.
- [x] Generated final types and shallow runtime capability types have separate owners.
- [x] Slice 1 proves finite exact declarations with no TS2589, `any`, `never`, or false final literal.
- [x] Slice 2 lands the unified Plite property handle, override IR, deterministic compiler, and atomic runtime integration.
- [x] Slice 3 hard-cuts singular Core plugin identity and publishes resolved schema handles.
- [x] Slice 4 lands closed-editor schema policy, generated final bindings, migrations, and fingerprint enforcement.
- [x] Slice 5 proves the pattern through Table, Indent, a mark, and an aggregate property owner.
- [x] Slice 6 completes the frozen adoption manifest across packages, apps, docs, releases, and doctrine.
- [x] Slice 7 closes strict checks, Browser proof, lint, barrels, generated contracts, and autoreview.
- [x] Final source audit proves zero rejected compatibility paths or singular schema-identity assumptions.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every architecture and adoption choice | Decision ledger and seven slices have one verdict and binary exits. |
| Fresh source evidence | yes | Recheck decision-changing live owners | Current source inventory and exact owner reads are recorded under Verification evidence. |
| Best API review | yes | Resolve all P0/P1 shape questions | Identity, handles, override scope, property-key rejection, and normal/advanced paths are final. |
| Conditional risk and adoption | yes | Cover type depth, runtime remap, migration, docs, registry, browser, and doctrine | Each has an owner and proof row below. |
| Verification recorded | yes | Record planning proof and exact execution gates | Planning commands and execution commands are listed below. |
| Handoff prepared | yes | State ownership, breaks, order, proof, and risks | Final handoff section is complete. |
| Autoreview | yes | Run after implementation changes | Architecture review found one optional-plugin defect outside its bounded dataset; the defect was reproduced, repaired, and the focused follow-up review returned zero findings with 0.82 confidence. |
| Goal plan complete | yes | Run the autogoal checker after all execution evidence is recorded | `check-complete.mjs` passes on this final evidence ledger. |
| Docs source-backed claim audit | yes | Validate final examples against shipped source | Docs targets and source owners are fixed in slice 6. |
| Docs links / routes / previews | yes | Verify exact leaf routes and anchors | Existing editor, plugin, Plate plugin API, and Plite schema routes remain canonical. |
| Docs MDX/content parser | yes | Run `www` source and docs checks | Exact commands are in slice 6. |
| Plugin page specifics | no | Keep this work in guides/API/schema concept pages | No feature plugin page is the canonical owner of the architecture. |
| Public API / package boundary proof | yes | Typecheck exports and packed/public declarations | Plite, Core, CLI, `platejs`, feature packages, and generated app contracts are in the proof matrix. |
| Release artifact classification | yes | Compare final user-visible delta to `main` | Existing Plite/Core/CLI/platejs and affected feature changesets are reworked per package; registry adoption gets its own entry. |
| Published package changeset | yes | Keep one package per file and use real breaking levels | Existing schema/portal/generated-contract changesets are the first owners; no branch-only removal prose survives. |
| Registry changelog | yes | Record copied registry API adoption | One source entry names every actually changed copied registry item, then generator write/check runs. |
| No release artifact | no | Published packages and copied registry source both change | Package changesets and registry changelog are required. |
| Package typecheck/build/test | yes | Run source-first owning checks and focused tests | Exact commands are in the proof matrix. |
| Barrel/export generation | yes | Regenerate public exports | Unified handle exports and removed public handle/identity types require `pnpm brl`. |
| Browser interaction proof | yes | Exercise the three named routes with Browser | Interactions and expected results are listed below. |
| Browser console/network check | yes | Reject new errors or failed requests | Known unrelated warnings are explicitly separated from regressions. |
| Browser final proof artifact | yes | Record route/DOM/interaction evidence | Slice 7 records Browser receipts in this plan. |
| Agent source / generated sync | yes | Bump source doctrine and regenerate mirrors | Plate Next v48 or the next free version, `pnpm install`, and version validation are required. |
| Agent action discoverability | yes | Keep the rule in existing owners | No wrapper skill; `AGENTS.md` already routes API, planning, and Plate Next work. |
| Agent-native review | yes | Review route, source owner, mirror, and proof parity | Capability map and execution commands below make the action repeatable. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Live schema/compiler/plugin/generator/docs owners and external local precedents read. | Decide |
| Decide | complete | One API shape and override law selected; alternatives rejected. | Prove and hand off |
| Prove and hand off | complete | Bounded inventory, slices, proof, releases, browser, doctrine, and risks are concrete. | User acceptance |
| Slice 1 — type feasibility | complete | Unified source-bound property handle plus exact Core portal handle inference pass Plite and Core declaration/type contracts without TS2589, `any`, or `never`. | Plite substrate. |
| Slice 2 — Plite substrate | complete | Unified property handles, `getProperty`, source references, deterministic overrides, rollback, and derived-schema remaps pass Plite contracts. | Core contract. |
| Slice 3 — Core contract | complete | Root plugin storage identity is removed; compiled portals publish resolved element/property handles and source-bound relationships. | Closed editor and CLI. |
| Slice 4 — closed editor and CLI | complete | `defineEditor.schema`, generated bindings/Value/fingerprint, structural generation, and fail-closed checks pass for all three EditorKit artifacts. | Sentinel packages. |
| Slice 5 — sentinel packages | complete | Table, Indent, marks, aggregate properties, relationships, persistence, rendering, and codecs pass focused and package suites. | Full adoption. |
| Slice 6 — full adoption | complete | Checker scans 4,243 source/docs files; docs, changesets, registry changelog, generated mirrors, and Plate Next v50 are current. | Closure. |
| Slice 7 — closure | complete | Strict Plite, package suites, www/docs, barrels, lint, Browser interactions, source audits, and two-pass autoreview closure pass. | Immutable handoff. |

Decision brief:
- outcome: Schema becomes the only AST identity owner without making normal node
  fields dynamic.
- chosen shape: plugin `name` is capability identity; compiled
  `SchemaElementHandle` owns element `type`; keyed `SchemaPropertyHandle`s own
  property `key`; `defineEditor.schema` owns narrow app overrides.
- strongest rejected alternative: consumer-renamable property keys plus
  `get('indent')`. It adds a runtime registry and computed access to every
  ordinary field merely to support a rare migration job.
- consequence: element types can vary per application, packages stay reusable,
  multi-property plugins are honest, direct `.header` / `.indent` survives,
  and exact final literals live only in generated application types.

## Target public shape

Package authors declare every contributed property under one local map. The map
key is the feature-owned persisted key unless the low-level declaration
explicitly says otherwise; applications cannot remap it.

```ts
import { defineBasePlugin } from '@platejs/core';
import { property, schema, target } from '@platejs/plite';

export const BaseIndentPlugin = defineBasePlugin('indent', {
  schema: ({ targetElementTypes }) => ({
    properties: {
      indent: schema.elementProperty(property.number(), {
        target: target.types(targetElementTypes),
        typeChange: 'preserve-if-allowed',
      }),
    },
  }),
  update: ({ schema, tx }) => ({
    increase: () => {
      const { key } = schema.properties.indent;
      // Generic mutation code uses the handle key; domain code reads node.indent.
      tx.nodes.set({ [key]: 1 });
    },
  }),
});
```

Element-owned fields remain a normal property map. The element's authored type
defaults to the plugin name and is declared inside `schema.element` only when
the package default differs.

```ts
export const BaseTableCellPlugin = defineBasePlugin('tableCell', {
  schema: {
    element: {
      properties: {
        colSpan: property.number(),
        header: property.boolean({ default: false, omitDefault: true }),
        rowSpan: property.number(),
      },
      // type: 'cell' // optional package default; never a plugin root field
    },
  },
});
```

The final application owns the only consumer override surface. Its schema is a
keyed application contribution plus an explicit override list; overrides target
descriptors or nominal handles and never win by order. Descriptor-aware
relationships resolve after element type remapping.

```ts
import { BaseParagraphPlugin } from '@platejs/basic-nodes';
import { BaseIndentPlugin } from '@platejs/indent';
import { BaseTableCellPlugin } from '@platejs/table';
import { TablePlugin } from '@platejs/table/react';
import { defineEditor, property, schema, target } from 'platejs';

export default defineEditor('app', {
  plugins: [TablePlugin],
  schema: {
    overrides: [
      schema.override(BaseTableCellPlugin, {
        element: {
          type: 'cell',
          content: schema.content.element(BaseParagraphPlugin, { min: 1 }),
        },
      }),
      schema.override(BaseIndentPlugin, {
        properties: {
          indent: {
            target: target.or(
              target.element(BaseParagraphPlugin),
              target.element(BaseTableCellPlugin)
            ),
          },
        },
      }),
    ],
    properties: {
      reviewState: schema.elementProperty(
        property.enum(['draft', 'approved']),
        { target: target.element(BaseTableCellPlugin) }
      ),
    },
  },
  schemaIdentity: { id: 'app-document', version: 2 },
});
```

Runtime consumers see the resolved installed schema. There is no top-level
portal `.type` or `.key` and no nested `.plugin` object.

```ts
const cell = editor.plugin(BaseTableCellPlugin);

cell.name; // 'tableCell'
cell.schema.element.type; // 'cell' in this generated application
cell.schema.properties.header.key; // 'header'

node.header; // normal typed package/application code
editor.read.schema.getProperty(node, cell.schema.properties.header); // generic/default-aware code
```

`editor.plugin(dynamicName).schema` is runtime-only and requires an installed
plugin. An exact descriptor's authored schema remains descriptor source data;
only the installed portal claims the compiled type, targets, and handles.

Generated application types own the final discriminator:

```ts
import {
  EditorKit,
  type TableCellElement,
  type Value,
} from './editor.generated';

declare const cell: TableCellElement;
cell.type; // 'cell'
EditorKit.schema.properties.reviewState.key; // 'reviewState'
```

Feature algorithms accept their structural element shape with `type: string`.
They do not pretend that the package default is every application's persisted
literal. No extra public generic is added for that job.

## Allowed override matrix

| Schema facet | Application override | Law |
| --- | --- | --- |
| Plugin `name` | no | Capability identity is immutable. |
| Element `type` | yes | Closed generated definition only; migration and fingerprint rules apply. |
| Element `content` | yes | Replacement must preserve element category, remain constructable, and validate plugin-generated defaults. |
| Element groups / Plate block membership | yes | Explicit relationship override; every reference recompiles from the final mapping. |
| Existing property target | yes | Target is a relationship; key, placement, and value law stay fixed. |
| App-owned property | yes | Add as a direct application schema contribution with its own key and target. |
| Existing property key | no | New field plus migration and adapter/fork. |
| Existing property kind/default/requiredness/validator | no | These are feature behavior contracts; replace/fork the owning descriptor. |
| `inline`, `void`, content-root ownership, selection/slice laws | no | These change the capability's runtime meaning, not merely application grammar. |
| Runtime store / component | no through schema | Keep `.configure({ initialState, component })` for their existing jobs. |

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Capability identity | `name` plus universal-looking root `type`/`key` | `name` only | Core plugin runtime | Capability and document identity are different jobs | Keep name-based API/read/update/store namespaces | Negative descriptor/portal type tests | Callers relied on root fields | hard-cut |
| Element identity | Root `plugin.type`, defaulting to name | Compiled `SchemaElementHandle.type`; authored default lives in `schema.element.type` | Plite handle + Core lowering | Type belongs to the final document schema | Move construction/matching/render/codecs to descriptors/handles | Different name/default/final type runtime and type tests | Remap misses a cache or codec | rearchitect |
| Multi-property ownership | Singular `key` exists only for marks or a same-name property; aggregate contributors get none | `schema.properties.<localId>` exposes one handle per owned property | Plite/Core schema model | Table cell already owns six fields; one primary key is false | Convert plugin property arrays to keyed maps and normalize internally | Table/Indent/aggregate compile contracts | Prefix/dynamic keys need exact IDs | rearchitect |
| Property handle types | `SchemaElementPropertyHandle` and `EditorSchemaPropertyHandle` overlap; cross-cut/text properties lack one author handle | One public `SchemaPropertyHandle` family for element, text, cross-cut, authored, and compiled use | Plite | One identity noun avoids parallel APIs | Replace old public types and overload schema queries | Type equality, value inference, wrong-owner negatives | Handle variance or declaration depth | hard-cut |
| Property reads | `getElementProperty` accepts a static element handle or raw key | `getProperty(node, handleOrKey)` handles element/text and materializes defaults | Plite | Generic code needs one typed/default-aware accessor; normal code does not | Migrate generic callers; keep direct node fields | default, placement, target, raw dynamic fallback tests | Wrong target may leak a default | rearchitect |
| Plugin schema authoring | `own.type`, `own.key`, positional key builders, arrays for cross-cut properties | nested element type plus keyed property/content-root maps; resolved callback `schema` view | Core | No singular identity assumption; map keys improve inference | Migrate all schema declarations and callback contexts | Constructor inference and declaration emit tests | Source-order contextual inference | rearchitect |
| Consumer customization | Schema is creation-owned everywhere | Package schema remains creation-owned; closed `defineEditor.schema` owns app policy | Core + CLI | A plugin cannot be retyped after callbacks infer, but a generated app can own final truth | Keep `.extend/.configure` rejection; add definition field | Excess-property/runtime rejection tests | Users expect ad hoc configure | add one boundary |
| Override scope | No explicit app override IR | Element type/content/groups and property targets only | Plite compiler + Core adapter | This captures real relationship jobs without arbitrary behavior mutation | Add nominal target overloads and exact patch types | Positive/negative override matrix | Too-permissive patches break features | narrow add |
| Property-key rename | Root plugin `key` can differ at creation; consumer wants possible remap | Feature-owned stable keys; no app remap | Feature schema owner | Remapping would force every direct property access through runtime lookup | Migrate key changes as new fields; document adapter/fork path | Compile rejection plus zero alias registry audit | Less convenience for rare migration | reject |
| Descriptor relationships | Plugin factories resolve descriptors to strings early | `schema.content.element` and `target.element` carry source identity until final compile | Plite authoring + Core descriptors | Type remaps must update every relationship automatically | Replace raw type plumbing where owner descriptors exist | Table row/cell and target-property remap tests | Source reference serialization | rearchitect |
| Override ordering | Compiler rejects overlapping contributions; no override layer | Overrides key by nominal source/family and facet; duplicates conflict | Plite compiler | Order-dependent schemas are impossible to reason about | Two-pass identity map then relationship/value compile | Permutation and duplicate tests | Latest-wins plugin resolution interaction | gate |
| Portal semantics | Portal mirrors raw descriptor fields and fabricates absent identity defaults | Portal `schema` is the installed compiled view; absent/dynamic callers guard `installed` | Core portal | A final app override cannot be inferred from a bare name or absent plugin | Migrate portal consumers; static fixtures use explicit literals | Installed/disabled/missing/wrong-family tests | Optional integration regressions | hard-cut |
| Raw editor typing | Raw tuple infers descriptor-local literal type | Raw capabilities remain exact; feature structural inputs use `type: string`; no final app override is accepted | Core types | Package code must work under any generated mapping without carrying full grammar | Widen feature algorithm discriminants, not APIs/stores/updates | TS2589 sentinel and package type tests | Over-widening user-facing generated values | rearchitect |
| Generated editor typing | Generated contract emits Value/mutations/fingerprint | Also emits shallow capability-to-element/property handle bindings and final type remaps | CLI + Core binder | Final app is the only place exact remapped literals are knowable | Extend generated TS/JSON contract and stale check | Golden full EditorKit and runtime fingerprint proof | Generator/runtime drift | extend |
| Generic element operations | Generated/portal operations target descriptor root `.type` | Target compiled element handle | Core projection + Plite mutation | Generic insert/set/remove must follow app remaps | Change synthesis and semantic overrides to handles | Table custom operations plus default CRUD | Nested transaction or wrong type | rearchitect |
| Rendering and codecs | Component/codec bindings index resolved root type/key | Bind through final element/property handles | Core static/React/codec compilers | Static/RSC and live rendering must survive type remap | Migrate caches, injection, HTML/Markdown/Docx/CSV consumers | Static/live HTML and Browser proof | Silent missing component or codec | gate |
| Schema identity | Fingerprint derives compiled semantics; generated contract checks it | Final overrides are fingerprinted; named schema version must change with persisted semantics | Plite/Core/CLI/History/Yjs | Types, stored values, history, and peers must agree | Extend structural contract/diff/migration classification | Identity, stale generation, History/Yjs tests | Accidental same-version drift | preserve and extend |
| Runtime reconfiguration | Plite atomically reconfigures extension schema | Reuse the same override compiler IR; Plate adds no runtime override verb | Plite | One lifecycle and rollback model | Carry closed override set through recompile | success/failure rollback and first user commit tests | Static generated contract cannot accept dynamic shape | preserve |
| Docs/release/doctrine | Current docs and rules teach creation-only root `.type/.key` | Teach final handle/override law and delete contradictory guidance | Docs, changesets, Vision, agent rules | Prevent immediate recurrence | EN/CN/API/schema docs; changesets; Plate Next version bump | Docs checks, changeset audit, skill parity/validation | Shared WIP drift | repair |

## Bounded adoption inventory

The planning scan found:

- 101 files using `editor.plugin(...).type` or `.key`;
- 6 files using `own.type` / `own.key`;
- 19 files using static `SomePlugin.type` / `.key`;
- 126 package files declaring plugin schema;
- 42 package files using `schema.elementProperty(...)`;
- 9 current `defineEditor(...)` owners.

The identity-use owners span `ai`, `basic-nodes`, `basic-styles`, `callout`,
`code-block`, `combobox`, `comment`, `core`, `csv`, `date`, `docx`, `emoji`,
`find-replace`, `footnote`, `indent`, `layout`, `link`, `list`, `legacy-list-model`,
`markdown`, `math`, `media`, `mention`, `selection`, `slash-command`,
`suggestion`, `table`, `toggle`, `utils`, `apps/www`, and `content/docs`.

Execution must materialize an AST-backed row manifest before editing. Every row
gets one classification: element handle, property handle, direct stable field,
explicit persisted literal boundary, or deletion. Tests, docs, barrels, and
historical migration fixtures remain separately counted so they cannot fake a
production owner.

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Type and declaration feasibility | Plite/Core type owners + CLI prototype | Prototype unified property handle, resolved plugin schema view, type-remapped generated binding, feature structural `type: string`, and descriptor relationships | User accepts plan | Full EditorKit and Table/Indent sentinels compile with exact generated values, shallow capabilities, finite declarations, zero TS2589/`any`/`never`; invalid handles/overrides fail | Dedicated compile-only fixtures, declaration emit, three cold `tsc --extendedDiagnostics` comparisons |
| 2. Plite schema substrate | `packages/plite` | One public property handle, source references, `schema.content.element`, `target.element`, explicit override IR, two-pass deterministic compiler, `getProperty`, fingerprint/delta/reconfiguration integration | Slice 1 passes | Handles cover element/text/cross-cut properties; remaps resolve before relationships; duplicate/invalid overrides fail atomically | schema definition/compiler/law/reconfiguration/incremental tests, typecheck, `check:plite:dev` |
| 3. Core plugin contract | `packages/core` | Move authored type into `schema.element`, replace singular `own` identity with keyed maps, publish resolved portal/callback schema view, lower descriptor references/overrides, hard-cut root `.type/.key` and old handles | Plite contract stable | Base/Plate/static/React descriptors infer exact capabilities and multi-property handles; behavior plugins expose no fake schema identity | Core compile-only contracts, compiler/resolve/portal/static/render/codec tests, package typecheck |
| 4. Closed editor and migration tooling | `packages/cli` + Core binder | Add `defineEditor.schema`; emit final handle/type bindings, recursive Value and mutations; extend structural diff and migration scaffold; keep atomic last-good writes and fail-closed runtime fingerprint | Core portal stable | Type remap and relationship overrides generate deterministically; stale or same-version named schemas fail before publication; migration scaffold never mutates storage | CLI golden/integration tests, `generate --check`, diff fixtures, History/Yjs identity suites |
| 5. Sentinel package adoption | Table + Indent + basic marks | Convert the six-field TableCell, cross-cut Indent, one mark, one aggregate property owner, semantic CRUD, codecs, static/live components, and package element aliases | Generated contract green | All four schema families work with handles and one remapped TableCell app fixture; direct `header`/`indent` remains typed | Focused package tests/typechecks, HTML/Markdown round trip, static render, generated fixture, no root identity use |
| 6. Full package/app/docs/release/doctrine adoption | All bounded owners | Apply manifest decisions; update registry and current docs; rework changesets; add registry changelog source; repair Vision/rules; bump Plate Next doctrine and sync every affected tracked package | Sentinel proves pattern | Zero old API/schema assumptions, no compatibility path, exact docs/imports, correct release prose, generated mirrors and package version ledger current | AST checker, `pnpm brl`, docs checks, changelog generator, `pnpm install`, Plate Next validate/check, affected typechecks/tests |
| 7. Closure and Browser proof | All changed owners | Fresh generation, strict Plite/package/root gates, Browser interactions, lint, diff check, autoreview, plan evidence | Adoption complete | All gates green, no new browser error, no accepted review finding, immutable handoff receipt | Commands and route matrix below plus `check-complete` |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| One plugin can own several properties without a fake primary key | TableCell owns six element fields; aggregate Core type test deliberately rejects `.key` | Table, aggregate, mark, prefix-key, element-owned, text, and cross-cut handle inference tests | passed |
| Element remap is complete, not cosmetic | Current type flows through compiler bindings, rendering, codecs, mutations, and generator | Remapped TableCell type appears in Value, portal, create/insert/set/remove, row content, HTML/Markdown, static/live render, and Browser DOM | passed |
| Direct fields stay safe | Property keys and value laws are excluded from app overrides | `node.header`/`node.indent` compile; key-remap and value-law patches fail | passed |
| Advanced property access is complete | Current `getElementProperty` already materializes schema defaults but handles only element-owned properties | Unified `getProperty` proves text/element/cross-cut target resolution, defaults, wrong target, raw dynamic fallback | passed |
| Override order cannot change semantics | Current compiler rejects conflicting contributors; target design keys every patch | Every permutation has one fingerprint; duplicate same-facet patches throw with provenance | passed |
| Raw capabilities remain cheap | Generated-contract work already removed full grammar from ordinary capability access | Full EditorKit accesses `api/read/update/plugin` with zero TS2589 and bounded diagnostics versus current baseline | passed |
| Generated final types remain exact | CLI already emits concrete recursive Value and mutation maps | Type-remapped values accept final literals and reject package defaults, wrong children/properties, and stale generated output | passed |
| Package algorithms accept remapped nodes | Current exported Table types carry default persisted literals | Storage-neutral feature inputs accept generated subtype; no public extra generic/cast/`any` | passed |
| Runtime publication is atomic | Plite reconfiguration and generated fingerprint publication already roll back | Invalid override, collision, migration failure, and stale fingerprint publish no schema/document/history/peer state | passed |
| Persistence cannot silently drift | Named identity already combines id/version/fingerprint | Element rename/content/target changes require versioned migration scaffold; History/Yjs reject mixed contracts | passed |
| Static/RSC and live React remain equivalent | Components bind through compiled type caches | Static HTML and live Table route render the remapped owner with identical semantic tag/component | passed |
| No old alternative survives | Current audit counts all identity paths | AST adoption checker returns zero top-level type/key, own type/key, name-as-storage, legacy handle, or raw installed identity fallback | passed |

## Exact execution commands

Focused iteration:

```bash
pnpm turbo typecheck --filter=./packages/plite --filter=./packages/core --filter=./packages/cli
bun test --preload ./config/plite-source-test-setup.ts \
  ./packages/plite/test/schema-definition.test.ts \
  ./packages/plite/test/schema-compiler.test.ts \
  ./packages/plite/test/extension-configuration.test.ts \
  ./packages/core/src/internal/plugin/compilePlateModel.spec.ts \
  ./packages/core/src/internal/plugin/resolvePlugins.spec.tsx
pnpm check:plite:dev
```

Adoption and closure:

```bash
node --test tooling/scripts/check-plate-schema-adoption.test.mjs
node tooling/scripts/check-plate-schema-adoption.mjs
pnpm exec plate generate --check apps/www/src/registry/components/editor/editor-definition.tsx
pnpm exec plate generate --check apps/www/src/registry/blocks/editor-ai/components/editor/editor-definition.tsx
pnpm turbo typecheck --filter=./packages/table --filter=./packages/indent --filter=./packages/basic-nodes --filter=./packages/basic-styles
pnpm --filter www typecheck
pnpm --filter www build:source
pnpm --filter www check:docs
pnpm brl
node tooling/scripts/generate-ui-changelog-entries.mjs --write
node tooling/scripts/generate-ui-changelog-entries.mjs --check
pnpm install
node .agents/rules/plate-next/scripts/version.mjs validate
node .agents/rules/plate-next/scripts/version.mjs check all
pnpm check:plite
pnpm lint:fix
```

The final package test command is derived from the frozen manifest and includes
every changed package. A root check runs after focused proof if the final diff
touches its owners.

## Browser proof

Use Browser after the relevant www server starts:

| Route | Interaction | Expected result |
| --- | --- | --- |
| `/examples/plite/schema-reconfiguration` | Reconfigure, edit the first user change, undo, and inspect named roots | Override/reconfiguration publishes atomically; first edit is undoable; failed candidate leaves prior schema/document visible. |
| `/blocks/table-demo` | Insert table, toggle header state, add/remove row and column, merge/split, edit cell text | Table operations target the resolved cell/row/table handles; `th`/`td` rendering and selection remain correct. |
| `/blocks/playground-demo` | Load generated EditorKit, insert and edit heading/table/code block, serialize one document | Generated Value/capabilities publish; no missing component, portal, codec, or schema mismatch appears. |

For all routes, inspect console and network. The existing script warning and
random table-cell hydration warning may be recorded as known noise only if the
exact message is unchanged. Any new exception, hydration error, failed module,
or failed request blocks closure.

Conditional evidence:
- High-risk scenarios:
  1. a type remap reaches the element map but not a relationship, component,
     codec, generic mutation, or generated binding;
  2. two overrides target the same source/facet and accidentally become
     latest-wins;
  3. a property handle resolves a default on an element where its target does
     not apply;
  4. final handle bindings reintroduce recursive grammar expansion and TS2589;
  5. a named schema changes fingerprint without version/migration handling;
  6. static rendering keeps the package default type while React uses the app
     override.
- External research: local Wordgard and ProseMirror source was sufficient.
  Wordgard contributes narrow content/group/mark-target overrides; ProseMirror
  contributes schema-local node/attribute identity and semantic table roles.
  Neither donor justifies Wordgard marks for Plate fields, ProseMirror `Attrs`
  typing, ordered overrides, or raw string relationships.
- Issue/PR provenance: N/A; this is a user-directed local architecture plan.
- Docs/registry/browser/release/behavior-law owners: all apply and are assigned
  above. Raw-device proof is outside the behavior changed here.

Findings:
- Current Core already proves the singular-key model is false: aggregate
  property contributors intentionally cannot expose `.key`, while TableCell
  owns `background`, `borders`, `colSpan`, `header`, `rowSpan`, and `size`.
- Current `PluginSchemaOwn` still fabricates one `type` and one `key`, and Core
  evaluates schema factories with both. That is the owning defect.
- Current Plite has useful element and element-property handles plus a separate
  compiled property handle, but no single handle spans element-owned, text,
  and cross-cut property contributions.
- Current `defineEditor` owns plugins and lineage but has no final schema policy
  field. The CLI already compiles that closed graph and is the correct place to
  materialize exact override types.
- Current generated contracts solve the TS2589 boundary: add a shallow schema
  binding map there rather than threading full grammar through capabilities.
- Wordgard's best idea is narrow relationship override. Its cell fields as
  marks are a bad fit for Plate's plain JSON AST. ProseMirror's best idea is
  schema-local identity objects; its untyped `Attrs` and string content grammar
  are regressions.
- Arbitrary property-key renaming would make every package field dynamic and
  force APIs, codecs, renderers, tests, and user code through runtime lookup.
  That cost is wildly larger than the migration job it serves.

Decisions and tradeoffs:
- Element type is remappable because all element-sensitive operations can use a
  nominal handle and generated final literal.
- Property key is not remappable because feature code legitimately treats
  fields as structural TypeScript properties. A migration can create a new
  field; ordinary editing should not pay for aliasing forever.
- App relationship overrides are narrow. If an application needs to change
  voidness, property value meaning, content-root ownership, or another
  behavior-critical law, it defines/forks a new descriptor so the runtime
  capability remains truthful.
- A feature package's structural element input may use `type: string`; the
  generated application type owns the exact discriminant. This is the honest
  price of configurable persisted element types and avoids a public generic on
  every feature helper.
- Exact dynamic schema changes remain Plite runtime reconfiguration. Plate's
  generated contract is deliberately static and fails closed when the runtime
  grammar differs.
- No global field catalog is added. Plugin-local property handles are the only
  stable logical field identities; copied registry data uses final generated
  types or explicit persisted literals at serialization boundaries.

## Agent-native parity map

| User action | Agent route | Source owner | Mirror / doc | Proof | Status |
| --- | --- | --- | --- | --- | --- |
| Design/review schema API | `best-api` | `.agents/rules/best-api.mdc` | generated skill + Vision | forward call-site review and source audit | covered |
| Plan cross-layer adoption | `plate-plan` | this plan + template | this plan | `check-complete.mjs` | covered |
| Create/refactor plugins | `plate-plugin-creator` | `.agents/rules/plate-plugin-creator*` | generated skill | constructor/handle examples + version check | covered |
| Audit migrated packages | `plate-next` / `plate-next sync` | `.agents/rules/plate-next*` and versions registry | generated skill | validate/status/check all | covered |
| Write current docs | `docs-creator` | `.agents/rules/docs-creator.mdc` | generated skill | www source/docs checks and Browser routes | covered |
| Verify schema adoption | checker script | `tooling/scripts/check-plate-schema-adoption*` | package/docs source | test plus full scan | covered |

Review fixes:
- Rejected consumer property-key remapping after testing its consequence against
  TableCell and Indent: it would erase direct structural typing and require a
  runtime field registry everywhere.
- Kept app element-type remapping by moving final literal ownership to generated
  contracts and making package algorithms storage-identity agnostic.
- Narrowed schema override from arbitrary patching to type/relationship policy
  plus direct app-owned contributions.
- Unified property handles instead of adding another Plate-only field token.
- Preserved Plite runtime reconfiguration rather than adding a competing Plate
  runtime override method.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Treat one plugin `key` as every owned property | 1 | Inspect TableCell and aggregate-property contracts | Rejected; keyed property handles replace the singular field. |
| Allow arbitrary consumer property-key aliases | 1 | Trace direct fields through types/codecs/rendering | Rejected; use new field plus migration. |
| Carry final app grammar through raw plugin capabilities | 1 | Reuse generated contract boundary | Rejected; generated shallow bindings own exact final identity. |

Verification evidence:
- Live Core evidence: `packages/core/src/lib/plugin/PluginDefinition.ts:138`
  publishes root storage identity; `:379` defines one `PluginSchemaOwn` type/key;
  `packages/core/src/lib/plugin/BasePlugin.ts:1269` exposes root key/type;
  `packages/core/src/internal/plugin/compilePlateModel.ts:328` constructs that
  singular context; `:441` lowers declarations; and
  `packages/core/src/lib/plugin/pluginSchemaModel.internal.ts:32` infers one
  element type or property key.
- Multi-property evidence: `packages/table/src/lib/BaseTablePlugin.ts:338`
  declares six TableCell fields;
  `packages/indent/src/lib/BaseIndentPlugin.ts:52` declares a cross-cut property
  then reads portal `.key`; and
  `packages/core/type-tests/plugin-schema-contracts.ts:203` proves an aggregate
  property owner has no honest primary key.
- Plite handle evidence: `packages/plite/src/interfaces/schema.ts:583` defines
  `SchemaElementHandle`; `:1289` defines element-only property handles; and
  `packages/plite/src/interfaces/editor.ts:915` exposes that handle beside a
  separate compiled property handle at `:927`.
- Closed-app evidence: `packages/core/src/lib/editor/defineEditor.ts:15` owns
  plugins and lineage but no schema contribution; `:88` freezes the definition;
  `packages/cli/src/generate.ts:78` compiles that closed graph and emits its
  structural contract.
- Local precedent: `../wordgard/src/doc/schema.ts:344` limits overrides to mark
  targets, content, and groups; `../prosemirror-model/src/schema.ts:56` binds
  identity to schema-local `NodeType`; and
  `../prosemirror-tables/src/schema.ts:157` / `:211` use semantic table roles
  rather than fixed node names.
- Planning inventory: 101 portal identity files, 6 `own` identity files, 19
  static descriptor identity files, 126 plugin schema declaration files, 42
  cross-cut element-property files, and 9 closed editor definitions.
- Local precedent: Wordgard `Schema.Override` supports content/group/mark-target
  relationships; ProseMirror compiles schema-local node/attribute identities
  and resolves table behavior by semantic role.
- Planning checks: source-target API, layer ownership, adoption inventory,
  release path, Browser routes, agent-native route, and execution commands are
  all fixed in this artifact.
- Execution baseline: `pnpm turbo typecheck --filter=./packages/plite
  --filter=./packages/core --filter=./packages/cli` passed before source edits.
- Slice 1 proof: `pnpm --filter @platejs/plite typecheck` and
  `pnpm --filter @platejs/core typecheck` pass with unified
  `SchemaPropertyHandle`, inferred element/mark/property portal handles, and
  declaration emission. The Core constructor callback witness was repaired at
  its generic owner instead of annotating callbacks.
- Runtime and compiler proof: Plite 1,412/1,412, Core 695/695, Table 235/235,
  Markdown 187/187, and AI 66/66 tests pass. Focused schema/compiler contracts
  pass 175/175. History/Yjs identity proof passes 33/33; product/Markdown codec
  proof passes 23/23.
- Type and generation proof: the 15-package source-first graph passes 53/53
  tasks; `www` typecheck and docs checks pass; all three generated editor
  contracts pass `generate --check`; CLI generation and migration fixtures
  each pass 1/1. Public-import smoke passes 17/17 and command contracts 44/44.
- Adoption proof: checker contracts pass 58/58 and the current source audit
  accepts all 4,243 package/app/docs files. Plate Next v50 reports 42 current,
  zero stale, zero drifted, and one retired package.
- Strict proof: `pnpm check:plite:dev` passes; `pnpm check:plite` passes every
  Plite-family package and full Chromium with 698 passed and 6 skipped.
  `pnpm brl`, registry changelog write/check, API-reference generation, and
  full-repo `pnpm lint:fix` pass.
- Browser proof: `/blocks/table-demo` loads without a schema/runtime error and
  inserts a row; `/blocks/playground-demo` edits a heading, grows a table from
  eight to nine rows, edits code, and exports Markdown without unreachable
  nodes; `/examples/plite/schema-reconfiguration` publishes the inline schema
  while leaving the document valid. Every route returns 200. The only console
  noise is the pre-existing random table-cell ID hydration mismatch.
- Browser-driven repairs: AI transport state moved to a cycle-free staged
  descriptor; Markdown reads optional property handles only when installed;
  CodeDrawing owns its MDX codec; the internal schema-source helper is excluded
  from generated API reference. Focused Markdown/CodeDrawing/Core proof passes
  10/10 and the final `www` typecheck passes.
- Doctrine proof: the adoption checker and Plate Next v50 distinguish a missing
  optional plugin (`undefined` or `[]`) from an invented raw persisted-identity
  fallback. `pnpm install` regenerated every skill mirror from source rules.
- Review proof: the bounded architecture review surfaced a real standalone
  `TabbableKit` optional-plugin crash even though the wrapper classified it
  outside the supplied dataset. The focused test reproduced the exception; an
  installation guard fixed it; the test then passed 3/3, `www` typecheck passed,
  and focused autoreview returned zero findings with 0.82 confidence.
- Final closure proof: the combined Tabbable/Markdown/CodeDrawing/Core-focused
  run passes 13/13, scoped `git diff --check` passes, and the autogoal
  `check-complete.mjs` validator accepts this plan.

Final handoff prepared:
- Ownership and target API: Plite owns nominal handles/overrides; Core owns
  descriptor lowering and resolved portals; CLI owns final exact app types.
- Public breaks and adoption: remove root `.type/.key`, `own.type/own.key`, old
  property-handle alternatives, and `getElementProperty`; migrate all bounded
  packages/apps/docs without aliases.
- Runtime/package/docs/browser decisions: narrow static app overrides, stable
  property keys, generated final types, explicit migrations, EN/CN/API/schema
  docs, package changesets, registry changelog, and three Browser routes.
- Proof and execution risks: final type remap completeness, deterministic
  override conflicts, handle target/default correctness, TS depth, persistence
  identity, and static/live rendering each have a focused gate.
- Execution result: all seven implementation slices are landed in the shared
  checkout. Package, persistence, codec, generated-contract, adoption, docs,
  release, doctrine, strict Plite, Browser, and independent-review gates are
  green.

Timeline:
- 2026-08-03: Plan created; live owners, docs, prior plans, and local external
  precedents audited.
- 2026-08-03: Final API locked: element type remap yes; property-key remap no;
  keyed property handles and closed app schema override.
- 2026-08-03: Adoption inventory, seven execution slices, proof, release,
  browser, migration, and doctrine paths prepared for user acceptance.
- 2026-08-03: User accepted the plan with `go`; one-shot execution goal started
  and slice 1 opened.
- 2026-08-03: Slice 1 passed. Unified Plite property handles, `getProperty`,
  Core schema views, resolved portal handles, and exact callback inference pass
  Plite/Core type and declaration contracts.
- 2026-08-03: Slices 2–5 landed deterministic application overrides, the Core
  root-identity hard cut, generated exact bindings, and sentinel package
  adoption without recursive capability expansion.
- 2026-08-03: Slice 6 completed the 4,243-file adoption audit, EN/CN docs,
  changesets, registry changelog, generated mirrors, and Plate Next v50.
- 2026-08-03: Slice 7 package and strict Plite proof passed. Browser proof found
  and closed an AI SSR cycle, optional Markdown-handle reads, and the missing
  CodeDrawing Markdown codec; all three routes then passed.
- 2026-08-03: Autoreview exposed a standalone `TabbableKit` optional-plugin
  crash. The focused test reproduced it, the installed guard fixed it, and the
  3/3 test, `www` typecheck, adoption audit, lint, and clean follow-up review
  closed the final source defect.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Complete; the source and evidence snapshot is ready for handoff. |
| Where am I going? | No implementation work remains in this goal. |
| What is the goal? | One truthful schema identity and override architecture without dynamic-field tax or TS depth regression. |
| What have I learned? | Multi-property ownership kills singular plugin key; generated app contracts make element remaps viable; absence-preserving optional-plugin guards are valid while raw identity fallbacks are lies. |
| What have I done? | Landed every architecture/adoption slice and passed package, strict Plite, docs, release, doctrine, and Browser proof. |

Open risks:
- The copied registry's generated `apps/www/src/__registry__/index.tsx` remains
  stale locally and still references deleted `plate-types.ts`. CI owns registry
  generation, so Browser proof temporarily excluded that stale generated row
  and restored it afterward; source registry checks prove the row is absent.
- Random server/client table-cell IDs still produce the pre-existing hydration
  warning. It is unrelated to schema identity and was intentionally not folded
  into this architecture lane.
- Shared-checkout edits after this receipt can invalidate counts or generated
  fingerprints. Rerun the checker, three `generate --check` commands, and Plate
  Next validation before publishing a later snapshot.
