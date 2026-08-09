# simplify plugin schema property access

Objective:
Execute the accepted hard cut so each exact plugin portal exposes only its flat
primary persisted identity, generic plugins omit `schema`, name-only portals
retain checked non-null identity access, and ordinary raw-key work moves to
inferred nodes and semantic plugin capabilities.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-03-simplify-plugin-schema-property-access.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- none

Mode:
- `standard`.

Completion threshold:
- All seven execution slices are implemented with no compatibility alias; the
  focused type/runtime/generator/package/docs/browser/review gates pass; the
  final classified source audit contains only intentional declaration,
  authoring, compiler, and Plite-schema survivors; and the autogoal completion
  checker passes.

Verification surface:
- Current declaration and inference owners:
  `packages/core/src/lib/plugin/PluginDefinition.ts`,
  `packages/core/src/lib/editor/pluginRuntimeTypes.ts`, and
  `packages/core/type-tests/plugin-schema-contracts.ts`.
- Current runtime/compiler owners:
  `packages/core/src/lib/plugin/createPluginContext.internal.ts`,
  `packages/core/src/internal/plugin/compilePlateModel.ts`, and
  `packages/core/src/internal/plugin/resolvePlugins.ts`.
- Current Plite schema substrate:
  `packages/plite/src/interfaces/schema.ts`,
  `packages/plite/src/interfaces/editor.ts`, and
  `packages/plite/src/core/editor-schema.ts`.
- Generated editor owner:
  `packages/core/src/lib/editor/defineEditor.ts`,
  `packages/cli/src/generate.ts`, and `packages/cli/test/generate.test.ts`.
- First-party adoption owners: schema-sensitive feature packages, registry
  components and kits, current docs, migrations, tests, doctrine, and the
  schema-adoption checker.
- Fresh audit baseline: 103 files currently contain at least one nested
  `schema.element.type` or `schema.properties` reference across packages,
  registry, docs, tooling, rules, and Vision. Every match is classified during
  execution because Plite/compiler internals are intentional survivors.

Constraints:
- The user accepted this exact plan and explicitly authorized full execution.
- No public compatibility aliases, deprecation bridge, runtime shim, or dual
  portal shape.
- Preserve truthful vocabulary: plugin capability `name`, element discriminator
  `type`, and persisted document-property `key`.
- Persisted element types and property keys remain immutable after editor
  construction. A storage identity change requires a document migration.
- Keep schema declaration support for element fields, one primary mark,
  additional fixed properties, patterned properties, placement, defaults,
  codecs, validation, generated types, and migrations.
- Do not make schema replaceable through `.extend()` or `.configure()`.
- Ordinary feature code uses inferred node fields and semantic plugin methods;
  it does not traverse normalized compiler maps.
- Package and copied-registry code may use `editor.plugin(PLUGINS.*)` to avoid
  importing a feature descriptor solely for identity or type coupling. These
  name-only portals expose non-null runtime-asserting primary identity getters;
  they never require optional chaining or non-null assertions.
- Device testing remains outside this packet. The change has no native-device
  behavior; browser proof covers the affected registry UI.

Boundaries:
- In scope: Core author-context and consumer-portal schema projections; default
  primary-mark reads and updates; compiled-model publication; generated editor
  bindings; first-party package, registry, docs, tests, and migration adoption;
  public exports; release notes; doctrine and enforcement.
- Source owners: `packages/core`, `packages/plite`, `packages/cli`, every
  first-party package with a schema access, `apps/www`, `content/docs`,
  `tooling/scripts/check-plate-schema-adoption.mjs`, `.agents/rules`, and the
  smallest relevant Vision sections.
- Non-goals: changing persisted data, changing declaration syntax, deleting
  Plite schema handles, renaming arbitrary document fields, making property
  identity consumer-configurable, changing Markdown AST semantics, or adding a
  general reflection DSL.
- Direct Plite boundary owners: compiled property handles, schema validation and
  lookup, transaction mark primitives, `TextOf` and `ElementOf`, and closed
  editor schema contracts. These remain low-level substrate APIs.

Output budget strategy:
- Read named owners first; expand by evidence; keep the 103-file adoption scan
  as a classified manifest during execution instead of streaming every match.

Blocked condition:
- Block only if a live caller cannot be classified as feature behavior,
  schema-author implementation, or generic schema inspection after reading its
  owner and focused tests. Do not block while a source-backed classification or
  compile-only proof remains available.

Plate Plan state:
- status: complete
- phase: proven and reviewed
- next: hand off the source-frozen hard cut
- handoff: runtime, types, generator, adoption, doctrine, browser, and review
  evidence recorded below

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | The plan includes the flat `schema.type` and `schema.key` target, removal of portal `.schema.properties`, author-only handles, inferred node use, semantic APIs, and explicit cuts. |
| Active goal and plan verified | yes | The one-shot execution autogoal names this exact plan and its runtime, typing, generator, adoption, docs, browser, and review threshold. |
| Current owners read | yes | Core declaration, portal, compiler, runtime, Plite schema, generator, mark packages, registry toolbars, Markdown kit, docs doctrine, and checker owners were inspected from the live checkout. |
| Best API target resolved | yes | `best-api` verdict: keep persisted identity under `schema`, flatten only the primary identity, and keep normalized property tables off consumer portals. |
| Mode and execution boundary resolved | yes | The accepted plan is running in one-shot execution mode with no additional API decision gate. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API, docs, tests, exports, generator, and runtime claims cite live
  owners.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and
  verdict.
- [x] Public breaks and private survivors have complete adoption and deletion
  answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic matrices.
- [x] The earlier `schema.properties.commentById.key` consumer example is
  rejected and corrected in the target API.
- [x] Slice 1: exact and dynamic portal types, author schema types, and mark
  capability inference compile without widening, casts, `any`, or TS2589.
- [x] Slice 2: Core compiler/runtime publishes separate consumer and author
  projections, asserts dynamic identity access, and synthesizes mark defaults
  with authored precedence.
- [x] Slice 3: generated EditorKit contracts expose primary plugin identities
  only and retain app-owned properties.
- [x] Slice 4: first-party packages use flat author/consumer identity or
  semantic methods; no production package consumer traverses plugin property
  maps.
- [x] Slice 5: registry, examples, and Markdown adopt the target API and pass
  real browser proof without console regressions.
- [x] Slice 6: docs, release notes, checker, Vision, and source rules teach and
  enforce the final shape; generated skills are synchronized.
- [x] Slice 7: focused-to-broad verification and `autoreview` have zero
  accepted P0/P1 findings.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | All decisions, cuts, adoption owners, execution slices, proof rows, and risks below have a final verdict. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Live source confirms one shared portal/author schema projection, normalized primary-mark duplication, generated nested handles, and repeated first-party key plumbing. |
| Best API review | yes | Resolve every P0/P1 call-shape finding | The target distinguishes normal semantic use, advanced primary identity, author-only additional handles, and generic schema inspection. |
| Conditional risk and adoption | yes | Resolve docs, registry, browser, release, generator, migration, and typing work | Each triggered owner has an execution slice and proof row; device and external-research gates have scoped reasons below. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Source audit commands, counts, checker, typecheck, package test, generation, lint, and Browser gates are specified below. |
| Handoff prepared | yes | Prepare ownership, breaks, proof, risks, and execution order | Final handoff section is complete. |
| Autoreview | yes | Run after all implementation and adoption slices | bounded review complete; every accepted actionable finding is repaired and rechecked |
| Goal plan complete | yes | Run the autogoal completion checker after fresh execution evidence | complete |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Live Core, Plite, CLI, package, registry, docs, rules, and checker owners audited | Target locked |
| Decide | complete | Consumer, author, generated, dynamic, inference, and runtime shapes resolved | Proof specified |
| Accepted-plan execution | complete | All seven slices implemented with no compatibility surface | Broad proof complete |
| Prove and hand off | complete | Package, root, checker, generator, docs, Browser, lint, barrel, and autoreview gates passed | Source-frozen handoff |

Decision brief:
- outcome: hard-cut normalized schema-property tables from consumer portals while
  preserving the full schema compiler and authoring power.
- chosen shape: exact element portals expose `schema.type`; exact primary-mark
  portals expose `schema.key`; exact behavior and aggregate-property portals
  omit `schema` entirely. Name-only portals keep non-null runtime-asserting
  `schema.type` and `schema.key` getters so `PLUGINS.*` consumers stay
  package-decoupled without `?.` or `!`. Author callbacks additionally receive
  compiled handles for declared secondary properties. Generic reflection stays
  under `editor.read.schema`.
- strongest rejected alternative: expose `type` or `key` directly on every
  plugin portal, or keep `schema.properties.<localId>.key`. The former lies
  about behavior plugins; the latter leaks compiler normalization and forces
  ordinary consumers to know declaration-local ids.
- consequence: Core must publish separate consumer and author schema views,
  synthesize standard mark capabilities, flatten generated primary identities,
  and migrate every old nested access without aliases.

Target public shape:

Primary element identity is advanced data, not the normal mutation path:

```ts
const paragraph = editor.plugin(BaseParagraphPlugin);

paragraph.schema.type; // resolved persisted element type
paragraph.update.insert();
paragraph.update.set({ align: 'center' });

type ParagraphElement = ElementOf<typeof BaseParagraphPlugin>;
```

Primary mark identity follows the same rule:

```ts
const bold = editor.plugin(BaseBoldPlugin);

bold.schema.key; // resolved persisted text-property key
bold.read.value(); // boolean | undefined
bold.read.isActive(); // boolean
bold.update.set(true);
bold.update.clear();
bold.update.toggle();

type BoldText = TextOf<typeof BaseBoldPlugin>;
```

Value marks retain exact inference:

```ts
const script = editor.plugin(BaseScriptPlugin);

script.read.value(); // 'sub' | 'sup' | undefined
script.read.isActive('sub');
script.update.set('sub');
script.update.toggle('sup');
script.update.clear();
```

Normal components do not read keys:

```ts
const pressed = useEditorSelector((editor) =>
  editor.plugin(BoldPlugin).read.isActive()
);

const color = useEditorSelector((editor) =>
  editor.plugin(FontColorPlugin).read.value()
);
```

Plugin authors receive the primary identity directly and only their additional
compiled property handles:

```ts
defineBasePlugin('comment', {
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
    properties: {
      commentById: schema.textProperty(
        schema.key.prefix('comment_'),
        property.boolean()
      ),
    },
  },
}).extend(({ schema }) => {
  schema.key; // primary `comment` mark
  schema.properties.commentById; // author-only patterned handle
});
```

Consumers never receive that additional map:

```ts
const comment = editor.plugin(CommentPlugin);

comment.schema.key;
comment.read.has({ id });
comment.update.add({ id });
comment.update.remove({ id });

// compile errors:
comment.schema.properties;
editor.plugin(BaseIndentPlugin).schema;
editor.plugin(DebugPlugin).schema;
```

Name-only portals preserve package and registry decoupling without nullable
identity plumbing:

```ts
const paragraph = editor.plugin(PLUGINS.paragraph);
const paragraphType: string = paragraph.schema.type;

const comment = editor.plugin(PLUGINS.comment);

if (comment.installed) {
  const commentKey: string = comment.schema.key;
}
```

Accessing `schema.type` on a non-element name or `schema.key` on a non-mark name
is a runtime assertion failure with the plugin name and expected schema kind.
Accessing either on a missing optional plugin also throws; `.installed` is the
presence guard. No getter returns `undefined`, and no getter falls back to
`plugin.name`.

Generic inspection stays on the schema owner:

```ts
editor.read.schema.element(paragraph.schema.type);
editor.read.schema.property({
  key: 'comment_123',
  placement: 'text',
  type: paragraph.schema.type,
});
editor.read.schema.getVocabulary();
```

Generated closed editors expose only primary plugin identities and app-owned
property handles:

```ts
EditorKit.schema.plugins.calloutCapability.type;
EditorKit.schema.plugins.bold.key;
EditorKit.schema.properties.reviewState.key;

// cut:
EditorKit.schema.plugins.calloutCapability.element.type;
EditorKit.schema.plugins.align.properties.align.key;
```

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Schema declaration grammar | `schema.element`, `schema.mark`, and `schema.properties` describe distinct jobs | Keep declaration grammar unchanged | Core plus Plite schema definitions | Multiple, targeted, and patterned properties are real schema concepts | No persisted-data migration | Existing schema compiler tests plus multi-property regression | Accidental declaration simplification would lose expressiveness | keep |
| Exact consumer portal | One `PluginSchemaView` exposes `element` and normalized `properties` | Conditional top-level `{ schema: { type } }`, `{ schema: { key } }`, or no `schema` member | Core plugin types and portal runtime | One plugin has at most one primary element or mark identity; an empty schema surface earns nothing | Hard-cut all nested consumers | Compile-only exact positive and negative tests | Conditional types may widen on heterogeneous definitions | rearchitect |
| Dynamic name portal | Type-erased portal exposes the normalized map | Non-null `schema.type: string` and `schema.key: string` runtime-asserting getters, never `properties`; wrong kind or absent plugin throws and `installed` remains the presence guard | Core portal runtime | `PLUGINS.*` intentionally avoids package and type coupling; nullable identities would spread `?.` and `!` through package code | Update package and registry integrations without descriptor imports solely for typing | Required and optional PLUGINS lookup, missing, disabled, wrong-family, element, mark, property-only, and behavior tests | Dynamic lookup cannot prove schema kind statically, so runtime diagnostics are part of the contract | rearchitect as checked escape |
| Author callback schema | Author and consumer currently share the same projection | Primary `schema.type` or `schema.key`, plus author-only `schema.properties` for additional declared properties | Core authoring context | Schema-sensitive codecs, migrations, and dynamic schema factories need compiled handles | Migrate callbacks; primary mark is removed from the property map | Callback inference and runtime-publication tests | Merely type-hiding a runtime field would leak through reflection | split runtime and types |
| Primary mark normalization | Primary mark is duplicated at `schema.properties[plugin.name]` | Store one private primary mark handle/key; additional map excludes it | Core compiled model | Primary identity is not an arbitrary additional property | Update compiler binding and publication | Explicit-key mark plus extra patterned-property test | Override and property-id lookup can accidentally bind the wrong property | rearchitect internally |
| Default mark reads | Every component reads `editor.read.marks()` by raw key | Synthesize typed `value()` and `isActive(value?)` for primary marks | Core runtime types and extension compilation | Ordinary consumers need feature state, not storage identity | Delete registry key switches and raw mark lookups | Boolean, enum, string, collapsed selection, range, and absent selection tests | Active semantics must respect boolean versus value marks | add schema-derived defaults |
| Default mark updates | First-party marks repeat `set`, `clear`, and `toggle` factories | Synthesize typed `set`, `clear`, and conditional `toggle`; authored same-name methods win | Core runtime types and extension compilation | Existing element defaults prove the model and remove boilerplate | Delete exact-equivalent package methods; retain custom semantics | Inference, runtime, override precedence, history, and shortcut inspection tests | A generic default must not erase special side effects | add with authored precedence |
| Fixed node fields | Some code derives raw keys to index nodes | Use `TextOf<typeof Plugin>`, `ElementOf<typeof Plugin>`, and direct typed fields | Plite inference plus feature packages | The field shape already belongs to the plugin schema type | Replace key plumbing where the node is narrowed | Direct plugin-only inference tests, including large EditorKit | Recursive schema payloads can reintroduce TS2589 | keep lightweight type providers |
| Dynamic or patterned fields | Consumer example exposed `commentById.key` | Feature-owned `read` and `update` methods; handles remain author/compiler-only | Comment, Suggestion, and similar feature owners | A pattern is not one useful consumer key | Replace any consumer traversal with semantic operations | Comment and suggestion focused tests | Missing semantic method could tempt a raw escape hatch | hard cut consumer reflection |
| Aggregate property plugins | One-property shortcuts tempt `.schema.key` | Exact `schema.properties`-only plugins expose no consumer `schema` member | Indent, list, alignment, and Core typing | Several properties or targets have no honest singular identity | Keep author handles and direct typed fields | Negative compile test for `BaseIndentPlugin.schema` | Convenience pressure may revive a false primary key | reject shortcut |
| Generic schema inspection | Feature portals expose normalized details | `editor.read.schema` owns vocabulary, property queries, defaults, and validation | Plite schema API | Reflection is editor-schema work, not feature behavior | Route generic tools and diagnostics to existing schema APIs | Schema query and target-aware property tests | Query API may need a documented owner/id form | keep and document |
| Plite compiled handles | Public low-level handles back target-aware reads and schema compilation | Keep handles and compiled property tables | Plite | TypeScript erases types; runtime validation and migrations need real identities | No ordinary feature exposure | Existing Plite schema suite | Cutting handles would force unsafe strings internally | keep substrate |
| Generated plugin schema | Generated output emits element handles and every plugin property map | Emit literal primary `type` or `key`; omit aggregate and secondary plugin maps | CLI plus Core generated contract | Generated output should match the consumer contract | Regenerate owned editor artifacts; update CLI snapshots and docs | Deterministic generation, fingerprint, stale-output, and declaration tests | Runtime binding must not depend on removed public wrappers | rearchitect |
| Generated app properties | App-owned properties expose handles | Keep `EditorKit.schema.properties.<id>` | CLI plus Core generated contract | App properties have no plugin semantic portal and need a closed-app identity | No rename; document as advanced schema contract | Existing `reviewState` generator test | Users may confuse app properties with plugin portals | keep with docs boundary |
| Markdown plain marks | Registry resolves optional comment/suggestion mark keys from nested maps | Use name-only portals and pass non-null `suggestion.schema.key` and `comment.schema.key` inside `installed` guards | Markdown registry kit | This is a legitimate persisted-key serialization boundary and must not introduce package/type coupling | No Markdown option redesign or descriptor-only import in this packet | Markdown serializer tests with installed and absent optional plugins | Presence must be guarded; key access itself is never nullable | flatten only |
| Element type consumers | Many callers manually extract `.schema.element.type` | Prefer descriptor-aware schema/update APIs; use `.schema.type` only where a raw persisted type is genuinely required | Core, packages, registry, migrations | Normal behavior should operate through descriptors and feature APIs | Classify every current call rather than mechanical rename | Per-owner focused tests and adoption checker | Blind replacement can preserve unnecessary reflection | classify then cut |
| Doctrine and enforcement | Vision and four worker rules teach nested paths | Teach declaration versus author versus consumer versus generic-inspection boundaries | Best API, Plate Next, plugin creator, docs creator, Vision | This mistake came from stale doctrine, not one caller | `best-api repair`, Plate Next version bump/attestations, `pnpm install` regeneration | Rule tests, generated skill diff, agent-native review | Partial repair guarantees recurrence | mandatory repair |
| Compatibility | Old nested and new flat paths could coexist | No aliases, fallbacks, or dual output | All owners | This is a breaking-window cleanup and alternatives would become permanent | One repository-wide hard cut | Negative type tests plus checker rejection | Large blast radius | accepted |

Exact cuts:

- Consumer `PluginSchemaView.element`.
- Consumer `PluginSchemaView.properties`.
- Consumer `schema` itself on exact property-only and behavior portals.
- Runtime consumer publication of normalized property maps.
- `editor.plugin(ElementPlugin).schema.element.type`.
- `editor.plugin(MarkPlugin).schema.properties.<primaryId>.key`.
- Primary-mark duplication inside author `schema.properties`.
- `EditorKit.schema.plugins.<name>.element`.
- `EditorKit.schema.plugins.<name>.properties`.
- Registry helpers such as `getMarkKey`, `getColorKey`, and raw
  `editor.read.marks()?.[key]` when a semantic mark read owns the job.
- Exact-equivalent first-party mark `set`, `clear`, and `toggle` factories after
  Core supplies the schema-derived defaults.
- Docs and doctrine that teach a universal `.type`, `.key`, one-property
  shortcut, or normalized portal map.
- Any compatibility alias from the old nested paths to the new fields.

Intentional survivors:

- `schema.element`, `schema.mark`, and `schema.properties` in declarations.
- Author-only `schema.properties` for additional element, text, targeted, or
  patterned properties.
- Private `CompiledPlateModelBinding` property handles and Plite compiled schema
  tables.
- `SchemaPropertyHandle` and `SchemaElementHandle` where generic Plite schema
  APIs need nominal runtime identity.
- `EditorKit.schema.properties` for application-owned properties.
- Raw persisted strings at fixtures, wire formats, migrations, and serializer
  boundaries when no descriptor owns them.

Default mark capability law:

- `read.value()` returns the current primary mark value or `undefined`; it does
  not manufacture the schema default.
- `read.isActive(value)` compares the current value strictly with `value`.
- `read.isActive()` is true for boolean marks only when the current value is
  `true`; for nonboolean marks it is true when a value is present.
- `update.set(value)` writes the exact inferred property value.
- `update.clear()` removes the primary mark.
- `update.toggle()` is available without an argument for boolean marks.
- `update.toggle(value)` requires the exact inferred value for nonboolean
  marks and toggles equality with that value.
- Authored methods with the same name override defaults. Custom behavior such
  as sub/sup mutual exclusion remains authored.
- Default capabilities exist only for `schema.mark`, never for arbitrary
  `schema.properties` contributors.

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Type feasibility | Core and Plite type owners | Split portal and author schema types; infer primary key/value; preserve lightweight node providers | Current shared `PluginSchemaView` | Exact positive/negative contracts compile without `any`, `never`, casts, or TS2589 | Core type tests and a large EditorKit compile-only fixture |
| 2. Compiler and runtime | Core compiled-model and extension owners | Separate private rich binding, author projection, and consumer projection; add default mark read/update; preserve authored precedence | Type target accepted | Runtime publishes only allowed fields and all defaults work through portal/root namespaces | Focused compilePlateModel, resolvePlugins, context, history, shortcut, missing-plugin tests |
| 3. Generated editor | CLI and Core generated-contract owners | Flatten primary identities, remove plugin property maps, retain app properties, regenerate owned artifacts | Runtime shape stable | Generated declaration and runtime binding match the target exactly | CLI generation suite, fingerprint checks, `editor:generate`, `editor:check` |
| 4. First-party packages | Basic Nodes, Basic Styles, Comment, Suggestion, Find Replace, Indent, AI, Code Block, Table, Link, Media, Math, Footnote, Toggle, and migrations | Replace nested primary accesses; delete exact default-mark boilerplate; keep additional handles author-only | Core source-first types available | No production package consumer traverses a plugin property map | Source-first package typechecks and focused tests |
| 5. Registry and Markdown | Registry UI, editor kits, examples, transforms, and Markdown integration | Replace mark/color/font key switches with semantic reads; flatten guarded serialization keys; classify every raw type access | Package adoption complete | Registry compiles and affected controls behave unchanged | www typecheck, registry tests, Markdown tests, Browser interaction proof |
| 6. Docs, doctrine, release, enforcement | Docs, Vision, rules, checker, barrels, changesets, registry changelog | Rewrite current-state docs; repair source rules; bump Plate Next version/attestations; reject old portal shapes | Product adoption complete | Search/checker finds no forbidden consumer path and generated skills match source rules | Checker tests, full adoption checker, `pnpm install`, docs check, lint, barrel check |
| 7. Closure | Whole accepted packet | Run focused-to-broad verification and autoreview; fix every accepted P0/P1 finding | All slices landed in working tree | Exact source-frozen handoff with remaining risk only | Command matrix below plus Browser and `autoreview` |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Exact element portal exposes only `schema.type` | Current conditional element handle lives in `PluginSchemaView` | Positive and negative Core type contracts pass | proven |
| Exact mark portal exposes only `schema.key` | Primary mark currently appears in normalized properties under plugin name | Positive and negative Core type contracts pass | proven |
| Aggregate and behavior portals expose neither | Existing aggregate-property negative test already rejects direct `.key` | Extended negative contracts pass | proven |
| Dynamic portal never fabricates or nulls identity | Current portal has `installed` and throws when publication/plugin is absent | Required, optional, absent, disabled, wrong-family, element, mark, property-only, and behavior tests pass | proven |
| Author callbacks retain additional handles only | Current `authoring` flag shares one schema proxy with consumers | Separate author/consumer runtime projections and no-primary-duplication tests pass | proven |
| Default mark APIs infer exact values | Current mark descriptors include boolean, enum, string, number, and JSON shapes | Compile-only inference and authored precedence tests pass | proven |
| Default mark APIs preserve runtime semantics | Plite already owns `tx.marks.add`, `remove`, and `toggle` | Focused runtime, selection, history, and shortcut suites pass | proven |
| Direct node inference stays finite | `TextOf` and `ElementOf` use node type providers; generated schema exists to avoid recursive grammar on runtime capabilities | Root declaration typecheck passes all 58 tasks without TS2589 or TS7056 | proven |
| Multiple and patterned properties survive | Comment and Suggestion declare primary plus additional/prefix properties | Comment and Suggestion suites pass | proven |
| App element type overrides remain authoritative | Compiled model reapplies application element type overrides | Core model/portal override tests pass | proven |
| Generated contracts match runtime | Generator currently emits nested handles from compiled bindings | CLI generation tests, `editor:generate`, and `editor:check` pass | proven |
| Registry consumers need no primary mark key | Current toolbar files contain manual switches and mark indexing | Bold insertion, font-size stepper, and colored insertion pass in Browser | proven |
| Generic inspection remains available | Plite already owns `property`, `getProperty`, and `getVocabulary` | Core and Plite schema suites plus current-state docs pass | proven |
| Old public paths are gone | Broad audit found 103 candidate files | Checker tests and the full 4,241-file adoption scan pass | proven |

Execution commands:

```bash
pnpm turbo typecheck \
  --filter=./packages/plite \
  --filter=./packages/core \
  --filter=./packages/cli \
  --filter=./packages/basic-nodes \
  --filter=./packages/basic-styles \
  --filter=./packages/comment \
  --filter=./packages/suggestion \
  --filter=./packages/find-replace \
  --filter=./packages/indent \
  --filter=./packages/ai \
  --filter=./packages/markdown \
  --filter=./apps/www

pnpm --filter @platejs/core test
pnpm --filter @platejs/cli test
pnpm --filter @platejs/basic-nodes test
pnpm --filter @platejs/basic-styles test
pnpm --filter @platejs/comment test
pnpm --filter @platejs/suggestion test
pnpm --filter @platejs/find-replace test
pnpm --filter @platejs/markdown test

node --test tooling/scripts/check-plate-schema-adoption.test.mjs
node tooling/scripts/check-plate-schema-adoption.mjs
pnpm --filter www editor:generate
pnpm --filter www editor:check
pnpm --filter www check:docs
pnpm brl
pnpm install
pnpm lint:fix
```

Conditional evidence:
- High-risk scenarios: explicit mark key plus additional prefix property;
  app-overridden element type; boolean versus enum default methods; authored
  override precedence; missing optional plugin; dynamic string portal;
  large generated EditorKit; generated fingerprint mismatch; Markdown plain
  marks with Comment/Suggestion present and absent; one undoable mark change.
- External research: not applicable. This plan resolves a repository-owned API
  projection from live Plate/Plite source and accepted project doctrine; no
  external editor claim determines the target.
- Issue/PR provenance: not applicable. The request is a direct local
  architecture decision with no public issue or PR authority.
- Docs/registry/browser/release/behavior-law owners: all apply. Update current
  EN/CN docs, registry examples/components, one package changeset covering the
  public Core break and affected package releases, registry changelog, Core
  behavior tests, and Browser proof on `/blocks/playground-demo` plus the
  smallest demos that exercise mark toggle, font color, font size, and Markdown
  serialization. Record console errors and do not lower browser confidence.
- Device testing: not applicable and explicitly deferred. No native input,
  clipboard, download, print, permission, or device behavior changes.

Findings:
- `createPluginAccess(editor, input, authoring)` currently uses one schema proxy
  for both author callbacks and consumer portals. A type-only omission would be
  dishonest because consumer reflection would still expose the property map.
- `compilePlateModel` correctly normalizes every property for validation and
  targeting, but also duplicates the primary mark into the public
  `binding.schema.properties` map. The internal normalization is valid; the
  public projection is not.
- Core already synthesizes element `insert`, `remove`, and `set` operations and
  merges authored methods over them. Primary-mark defaults follow an existing
  architecture rather than introducing a second mechanism.
- Basic Nodes and Basic Styles repeat primary-key destructuring and trivial mark
  updates. Registry toolbars then repeat type switches solely to recover those
  keys. That is the clearest evidence of a bad consumer surface.
- Comment and Suggestion prove why declaration `schema.properties` cannot be
  deleted: one feature can own a primary mark, element fields, transient fields,
  and patterned per-id fields at once.
- Indent and alignment prove why a property-only plugin cannot honestly expose
  one `schema.key`.
- `EditorKit.schema.plugins` currently mirrors compiler normalization even
  though only CLI tests consume those plugin property maps. Application-owned
  `EditorKit.schema.properties` has a separate legitimate role.
- Plite already owns the correct generic inspection surface under
  `editor.read.schema`; feature portals do not need a second reflection API.
- The current doctrine in Vision, Best API, Plate Next, plugin creator, and docs
  creator explicitly teaches the nested shape, so implementation without rule
  repair would regress immediately.

Decisions and tradeoffs:
- Prefer `schema.type` and `schema.key` over direct portal `.type` and `.key`.
  The `schema` namespace tells the truth that these are persisted identities,
  while conditional typing prevents behavior plugins from pretending to own
  one.
- Do not expose `schema.properties` on consumer portals. Extra properties are a
  declaration/compiler concern; fixed fields are accessed through typed nodes
  and dynamic fields through feature APIs.
- Keep `schema.properties` in author contexts. Schema factories and
  schema-sensitive codecs may need the final compiled handle, especially for
  explicit or patterned keys. This is not consumer API.
- Do not call property keys `type`. Element discriminators and object-property
  keys are different AST concepts even when their strings happen to equal a
  plugin name.
- Do not add a universal `schema.field`, `schema.identity`, or `{ kind, value }`
  wrapper. Conditional `type` or `key` is shorter and more truthful.
- Do not redesign Markdown `plainMarks` in this packet. It is already a raw
  serialization-key option; the registry is an advanced guarded caller and can
  use the flattened primary key.
- Do not delete Plite handles or compiled property maps. Runtime validation,
  target resolution, defaults, migrations, and generated contracts still need
  nominal identity after TypeScript erasure.
- Do not make keys consumer-renamable. A field rename is a storage migration,
  not plugin configuration.

Review fixes:
- Rejected the earlier suggestion that consumers should access
  `schema.properties.commentById.key`. Comment consumers use semantic methods;
  only author/compiler code sees the patterned handle.
- Rejected direct portal `.type` and `.key`. Persisted identity remains visibly
  namespaced under `schema`.
- Rejected a mechanical nested-to-flat rename. Ordinary consumers move to
  typed nodes or semantic reads/updates; only advanced identity boundaries use
  the flat fields.
- Tightened exact portals so property-only and behavior descriptors omit
  `schema` itself instead of exposing an empty object.
- Preserved package-decoupled `PLUGINS.*` access through non-null
  runtime-asserting dynamic getters. Nullable identity and forced descriptor
  imports were rejected.
- Scoped generated output: plugin-owned secondary maps are cut, while
  application-owned property handles remain.
- Scoped Markdown: flatten its guarded advanced use without introducing an
  unrelated option migration.
- Guarded every optional feature portal before reading its exact schema
  identity, including Indent, Selection, Suggestion, and Media. Missing
  optional plugins now no-op instead of asserting accidentally.
- Restored per-step anchor ownership in cross-block Suggestion deletes so each
  transaction step resolves the previous block from its own range.
- Hardened Plite schema publication: independent element override facets merge,
  property lookup accepts own data properties only, bounded content changes and
  default-materializing properties require migration, and generated contract
  input is validated recursively at the read boundary.
- Made checker portal tracking lexical and evidence-based. It follows direct
  `editor.plugin(...)` results and their aliases without classifying shadowed
  author locals or arbitrary parameters by variable name.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Broad schema search returned intentional compiler/declaration matches beside public consumers | 1 | Classify by owner and API role instead of bulk replacement | The execution manifest distinguishes declarations, private compiler survivors, author contexts, consumer portals, tests, docs, and generated output. |
| Schema factories resolved a dependency before final publication | 1 | Evaluate the authored schema against the compiled candidate instead of fabricating an identity from the plugin name | Author callbacks observe the dependency's real persisted type before publication; focused Core regression passes. |
| Deferred command registration accessed the previous compiled model | 1 | Carry the compiled candidate through extension initialization | Commands initialize against the same model that is later published. |
| Code Block declaration emission hit TS7056 | 1 | Add non-exported typed checkpoints around the contribution stages without annotating the exported plugin | Package build and the full root declaration typecheck pass; exported inference remains intact. |
| Markdown browser demo emitted undeclared `align` fields | 1 | Use the feature-owned persisted field already declared by Text Align | Audio and video MDX use `textAlign`; the demo renders successfully under the closed schema. |
| The stale local generated registry referenced an intentionally deleted file | 1 | Use a temporary empty source shim only for local Browser compilation, then remove it before handoff | Browser proof completed and the shim is absent from the final source. |
| A monolithic autoreview snapshot exceeded the reviewer input limit | 1 | Split review by bounded runtime, Plite, adoption, and checker owners | Bounded review completed; every accepted finding was repaired and rechecked. |
| A review clone was refreshed from its own working directory | 1 | Use absolute live-checkout paths and verify the copied source before interpreting findings | Stale-snapshot findings were rejected against the live source and fresh root typecheck. |
| Checker fallbacks treated same-named locals as consumer portals | 2 | Resolve lexical bindings and require a proven `editor.plugin(...)` origin | Checker contract tests cover aliases, destructuring, shadowing, and logical fallbacks; the full source audit passes. |

Verification evidence:
- Fresh source audit inspected the declaration, portal, compiler, publication,
  generated contract, first-party mark owners, Comment, Suggestion, Indent,
  Markdown, registry toolbar, docs, Vision, rules, and checker owners.
- Fresh broad audit found 103 files with old nested path candidates and 157
  production occurrences under packages and registry after excluding spec,
  test, and slow-test files. These are an execution manifest, not a claim that
  every compiler-internal occurrence is forbidden.
- Core, Basic Nodes, Basic Styles, Comment, Suggestion, Find Replace, CLI,
  Markdown, and Code Block focused suites pass; Core alone passes 697 tests.
- Root `pnpm test` passes 3,061 fast tests plus every isolated slow lane. Root
  `pnpm typecheck` passes all 58
  source/declaration tasks. `www` typecheck, docs checks, generated editor
  checks, barrel generation, checker tests, the full 4,241-file adoption audit,
  and lint pass.
- Browser proof on `/blocks/playground` inserted and undid bold and colored
  text, changed font size 36 to 37 and back, and rendered
  `/blocks/markdown-to-plite-demo` after the closed-schema fixture correction.
- Checker contract tests pass 60/60 and the final adoption audit passes across
  4,241 source and documentation files.
- Bounded autoreview produced no remaining accepted actionable finding. The
  final Plite review's two claims were rejected because its intentionally
  bounded clone omitted the current companion interfaces; fresh complete-tree
  typecheck and focused runtime proof cover those owners.
- The autogoal completion command passes for this exact plan:
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-03-simplify-plugin-schema-property-access.md`.

Final handoff prepared:
- Ownership and target API: Core owns separate author/consumer projections and
  default mark capabilities; Plite keeps generic handles; CLI owns generated
  bindings; feature packages own semantic adoption.
- Public breaks and adoption: old nested portal paths and generated plugin maps
  are hard-cut repo-wide with no aliases; every caller is classified before
  replacement.
- Runtime/package/docs/browser decisions: compiler internals survive; package
  boilerplate is deleted only when defaults are identical; docs and doctrine
  are repaired; registry behavior gets Browser proof.
- Proof and execution risks: conditional inference, dynamic portals, app type
  overrides, patterned properties, mark semantics, generated fingerprints,
  Markdown optional integrations, history, and TS2589 each have named tests.
- Execution order and user attention: type feasibility first, then runtime,
  generator, packages, registry/docs, doctrine/enforcement, and closure. The
  only user decision is acceptance of this plan; no unresolved API choice
  remains.

Timeline:
- 2026-08-03T22:28:09.094Z Plate Plan created.
- 2026-08-04 Live owners audited and target corrected from consumer property
  handles to flat primary identity plus author-only additional handles.
- 2026-08-04 Full hard-cut, adoption, risk, and proof plan prepared.
- 2026-08-04 User accepted full execution; one-shot implementation goal started.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | All seven slices are implemented and proven. |
| Where am I going? | Hand off the source-frozen hard cut. |
| What is the goal? | Hide compiler-normalized property maps from consumers without weakening schema declarations, generated types, or runtime correctness. |
| What have I learned? | Separate author and consumer projections preserve full schema power while keeping portals small; generated contracts prevent the complete grammar from infecting runtime capabilities. |
| What have I done? | Hard-cut the portal shape, generated bindings, first-party adoption, doctrine, docs, checker, and release prose, then proved runtime and type behavior through package, root, Browser, and review gates. |

Open risks:
- Device testing remains intentionally deferred because this packet changes no
  native input, clipboard, download, print, permission, or device behavior.
- Dynamic string portals intentionally trade static schema-kind proof for a
  runtime assertion. Focused tests cover missing and wrong-kind access; exact
  descriptor portals remain the preferred reusable-code path.
