# typed plugin property mutations

Objective:
Execute the typed plugin-property mutation hard cut; done when every source
owner and call site is migrated, binary proof passes, Browser status is
recorded honestly, and P2 autoreview is clean.

Flow mode:
agent-led execution and closure

Goal plan:
docs/plans/2026-08-04-typed-plugin-property-mutations.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- none

Mode:
- `standard`

Completion threshold:
- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.
- Enumerate and classify 100% of first-party authored schema-property
  declarations, author-callback `tx.nodes.set` / `unset` call sites, and public
  mutation type owners in the bounded source tree; every row must map to the
  typed-literal path, a handle-only ambiguity, a semantic plugin operation, or
  an explicit exclusion.

Verification surface:
- Counted `rg` source manifests over `packages/**/src`, `apps/**/src`, and
  `content/**`, excluding generated/build trees.
- Live reads of the Plite mutation contract, Plate plugin-context projection,
  schema compiler/property handles, representative plugins, exports, tests,
  docs, and consumers.
- Plan readiness review plus
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-04-typed-plugin-property-mutations.md`.

Constraints:
- The user accepted this plan and explicitly invoked execution.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Accepted common path is a schema-inferred literal key, for example
  `tx.nodes.set('lineHeight', value)` and `tx.nodes.unset('lineHeight')`.
- Keep property handles only when a literal cannot uniquely identify one
  writable property law; keep prefix/dynamic properties behind semantic
  feature operations.
- Do not add a plugin mutation namespace or carry the full application grammar
  through raw editor capabilities.
- Update only the accepted mutation, inference, adoption, doctrine, release,
  and directly exposed regression owners.

Boundaries:
- In scope: the public and callback-local mutation call shape; lightweight
  schema-derived writable-property inference; exact-key, duplicate-key,
  explicitly aliased, prefix/dynamic, element, and text property cases; all
  first-party adoption, exports, tests, docs, and enforcement needed by the
  eventual hard cut.
- Source owners: `packages/plite` mutation and schema types/runtime;
  `packages/core` plugin author context, schema lowering, and transaction
  projection; first-party feature packages and registry/docs consumers;
  `.agents/rules`, Plate Vision, and the existing Core/Plite changesets that
  describe the final `next` API.
- Non-goals: compatibility aliases, configurable persisted property keys,
  schema replacement through `.extend()` / `.configure()`, full
  generated application `Value` inference, generic element CRUD redesign, and
  unrelated colocation cleanup.
- Direct Plite boundary owners: `packages/plite/src/interfaces/editor.ts`,
  `packages/plite/src/interfaces/schema.ts`, transaction/runtime node mutation
  implementation, and focused type/runtime tests.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.
- Start every broad search with file/count output, exclude `node_modules`,
  generated outputs, templates, caches, and build artifacts, then inspect
  owner-sized slices. Keep the final exhaustive inventory in this plan.

Blocked condition:
- Block only if live source cannot distinguish an intended property law from a
  persisted compatibility contract and no test, docs, caller, or compiler
  owner can resolve it. Do not block while another focused source audit remains.

Plate Plan state:
- status: complete
- phase: implemented, proven, and P2-reviewed
- next: handoff
- handoff: typed mutation primitive, shallow Core inference, first-party
  adoption, doctrine/release updates, and proof are complete

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | The accepted `tx.nodes.set('lineHeight', value)` / `unset('lineHeight')` cut, full-code audit, inference requirement, and rejection of another plugin namespace are recorded above. |
| Active goal and plan verified | yes | The active goal names this exact plan and requires a complete source-owner and call-site audit plus the mechanical checker. |
| Current owners read | yes | Live Plite transaction types/runtime, Core schema inference/publication, 53 property-owning plugins, 290 source calls, docs, tests, generated contracts, rules, Vision, and earlier conflicting plans were inspected. |
| Best API target resolved | yes | `best-api` verdict: typed literal for one unique invariant property, exact handle for aliased or ambiguous identity, semantic operation for patterned/dynamic behavior, object form for structural or atomic multi-property mutation. |
| Mode and execution boundary resolved | yes | The accepted seven slices were executed in dependency order across Plite, Core, packages, docs/rules, release prose, and closure proof. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API, docs, tests, exports, generated contracts, rules, and release
      prose claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and
      verdict.
- [x] Public breaks and every retained escape have complete adoption/deletion
      answers.
- [x] All 116 production property laws, 114 production package mutation calls,
      33 app calls, and 143 test/slow calls are bounded and classified.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic matrices.
- [x] Plite keyed/exact-handle runtime and type contracts are implemented.
- [x] Core shallow plugin/dependency inference, exact author handles, and
      duplicate/alias exclusion are implemented.
- [x] NodeId `idKey` is hard-cut and first-party packages are adopted.
- [x] EN/CN docs, rules, Vision, API-reference exclusions, and changesets
      teach the single accepted shape.
- [x] Package/app proof, source audits, Browser attempt, and P2 autoreview are
      recorded.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Target, owners, breaks, adoption inventory, execution slices, proof, and risks all have final verdicts below. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Fresh zero-parse-error AST scans and bounded source reads produced the 116-law and 290-call inventories below. |
| Best API review | yes | Resolve every P0/P1 call-shape finding | Literal, handle, semantic, and object-form roles are mutually exclusive; duplicate-key and TypeScript-depth traps are explicitly closed. |
| Conditional risk and adoption | yes | Resolve docs, browser, release, generated-contract, and doctrine work | Each triggered owner and exact proof route is assigned below; external research and device testing have scoped reasons. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Audit commands, live counts, type/runtime/browser gates, and negative contracts are recorded below. |
| Handoff prepared | yes | Prepare ownership, breaks, proof, risks, and execution order | Final handoff names Plite, Core, package, docs/rules, release, and closure ownership in dependency order. |
| P2 autoreview | yes | Review every implementation packet and resolve P0-P2 findings | Plite, Core, and package/adoption packets are clean after resolving six accepted findings; exact review details are recorded in Execution closure. |
| Goal plan complete | yes | Run the autogoal checker on this plan | Checker command and result are recorded in Verification evidence. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Runtime/type owners, declarations, calls, docs, tests, rules, and prior decisions audited | Target locked |
| Decide | complete | One call-shape law and four disjoint mutation categories resolved | Implementation executed |
| Implement | complete | Plite, Core, NodeId, packages, docs/rules, release prose, and generated contracts updated | Proof passed |
| Review and hand off | complete | Browser block recorded; three P2 packets clean after accepted fixes | Handoff |

Decision brief:
- outcome: one complete, execution-ready hard-cut plan for typed plugin-local
  property mutation.
- chosen shape: infer the current plugin plus required dependencies' shallow
  writable-property entries, then type the first literal argument of `set` /
  `unset` only when one exact invariant law owns that persisted key. Use an
  exact handle for aliased or ambiguous compiled identity, a semantic operation
  for patterned/dynamic behavior, and the existing object form for structural
  or atomic multi-property writes.
- strongest rejected alternative: require property handles or a plugin
  namespace on every ordinary mutation.
- consequence: Plite gains one canonical keyed/handle runtime form; Core adds a
  shallow local-property witness without expanding the complete editor schema;
  first-party author callbacks adopt the shortest honest form.

Target call shape:

```ts
export const BaseLineHeightPlugin = defineBasePlugin(PLUGINS.lineHeight, {
  schema: ({ targetElementTypes }) => ({
    properties: {
      lineHeight: schema.elementProperty(property.number(), {
        target: target.types(targetElementTypes),
      }),
    },
  }),
  update: ({ tx }) => ({
    set(value: number, options?: NodeSetNodesOptions<Element>) {
      tx.nodes.set('lineHeight', value, options);
    },
    unset(options?: NodeUnsetNodesOptions<Element>) {
      tx.nodes.unset('lineHeight', options);
    },
  }),
});
```

Required dependencies participate without carrying the application schema:

```ts
export const BaseListPlugin = defineBasePlugin(PLUGINS.list, {
  dependencies: [BaseIndentPlugin],
  update: ({ tx }) => ({
    setDepth(indent: number, at: Path) {
      tx.nodes.set('indent', indent, { at });
    },
  }),
});
```

Ambiguous or explicitly aliased properties use their exact author handle:

```ts
update: ({ schema, tx }) => ({
  setBlockSuggestion(value: SuggestionData, options) {
    tx.nodes.set(schema.properties.blockSuggestion, value, options);
  },
});
```

Atomic multi-property and structural updates remain object-shaped:

```ts
tx.nodes.set({ indent: nextIndent, listStyleType }, { at });
tx.nodes.set({ children, type }, { at });
```

No public `tx.plugin(...)`, `tx.properties.*`, or descriptor mutation namespace
is added. No callback receives `tx`, `read`, or `api` as a new function
parameter merely to carry inference.

Inference law:

```ts
type WritablePropertyEntry = Readonly<{
  identityKind: 'alias' | 'exact' | 'prefix';
  key: SchemaPropertyKey;
  localId: string;
  ownerName: string;
  placement: 'element' | 'text';
  value: unknown;
}>;

// Conceptual only: implementation names remain private.
type LiteralWritableMap<Entries> = {
  [K in UniqueExactUnaliasedKeys<Entries>]: ValueForKey<Entries, K>;
};
```

The entry union is intentionally shallow. It contains no content grammar,
children recursion, codecs, component type, application override graph, or
complete `Value`.

Conceptual transaction typing:

```ts
type PluginNodeSet<TProperties extends object> =
  // Reuse the existing object overloads, without Plite's broad keyed branch.
  NodeSetObjectOverloads<Value> & {
    <const K extends Extract<keyof TProperties, string>>(
      key: K,
      value: NoInfer<TProperties[K]>,
      options?: NodeSetNodesOptions
    ): void;
    <const H extends SchemaPropertyHandle<string, unknown>>(
      handle: H,
      value: NoInfer<SchemaPropertyHandleValue<H>>,
      options?: NodeSetNodesOptions
    ): void;
  };
```

`NoInfer` makes the key the sole value-contract owner; a wrong value cannot
widen the selected key. Core must factor and reuse Plite's object overloads,
then replace the raw keyed branch rather than intersecting a narrow overload
with a permissive one. Raw Plite derives its keyed branch distributively from a
closed `Value`; broad `Value` remains the schema-agnostic escape. Concrete
union-key algorithms with different value laws use an object or semantic
operation instead of pretending the independent key/value variables are
correlated.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Raw node set | Object props only in `EditorTransactionNodesApi` (`packages/plite/src/interfaces/editor.ts:729-742`) | Retain object overloads and add `(key, value, options?)` plus exact-handle form | Plite editor types/runtime | One primitive should lower every spelling to the same command | Update runtime wrappers and docs | Command/spec/transaction tests | Three-argument options could be read from the old slot | add and normalize once |
| Raw node unset | Untyped `string \| string[]` (`editor.ts:756-766`) | Type known literal keys/arrays and exact handles; preserve a deliberately widened-string algorithm escape | Plite editor types/runtime | Reject wrong literals without killing generic algorithms | Update type contracts; runtime unwraps handles | Positive/negative type tests and runtime parity | A broad overload would make all literals legal | conditional generic, no permissive overload |
| Plugin-local property inference | `PlatePluginTransaction` carries runtime capabilities but no property laws (`pluginRuntimeTypes.ts:1549-1557`) | Overlay only `nodes.set`/`unset` with a shallow map from current descriptor plus required dependencies | Core runtime types | List and Table need dependency fields; EditorKit-wide grammar caused TS2589 | Add private witness and local transaction wrapper | declaration emit and large EditorKit compile | Recursive dependency/schema expansion | shallow entries only |
| Property-entry identity | Schema types currently expose handles, not a duplicate-safe mutation entry union | Tag each entry by owner, local id, placement, persisted key, value, and identity kind | Core schema inference | Structurally equal entries otherwise collapse before duplicate detection | Derive from existing authored schema inference | Table/Suggestion negative contracts | Union normalization hides collisions | retain nominal source tags |
| Exact literal eligibility | Current code often extracts `.key` or builds computed objects | Allow only unique, non-prefix, unaliased string identities in the local graph | Core transaction projection | This is the shortest safe path and keeps aliases visible | Migrate ordinary first-party calls | wrong key/value and dependency tests | Global uniqueness would overfit EditorKit | local graph only |
| Exact property handles | Public handle already carries `id`, `key`, `kind`, `placement`, and a value witness (`schema.ts:1369-1388`) | Accept exact-string handles directly in set/unset; reject prefix handles | Plite runtime/types | Ambiguous and aliased laws need nominal identity and exact value inference | Use author `schema.properties` only where needed | alias/collision/prefix contracts | Object handle can be mistaken for props | discriminate by `kind: 'schema-property'` |
| Author handle publication | Prepublication author proxy fabricates only `{ key }` (`createPluginContext.internal.ts:133-185`) | Produce the same complete immutable handle shape before and after publication | Core author context/compiler | Update factories capture handles before final publication | Share one lowering/handle owner | prepublication equality/runtime tests | Two handle implementations drift | one compiler-owned constructor |
| Prefix inference | `PluginDeclaredPropertyKey` preserves only `string`; `SchemaKeyPrefix` falls back to local id (`pluginSchemaModel.internal.ts:61-94`) | Preserve `SchemaPropertyKey` exactly in author types/runtime; direct mutation rejects prefix handles | Core schema inference/context | Current fallback is a real type/runtime lie | Repair the owner before adoption | Comment/Suggestion prefix contracts | Prefix accidentally admitted as one literal | explicit negative test |
| Dynamic Node ID key | `NodeIdPluginState.idKey` changes schema and runtime storage with a cast (`NodeIdPlugin.ts:715-729`) | Remove `idKey`; canonical persisted field is `id` | Core NodeId | Configurable storage identity contradicts immutable schema and defeats inference | Migrate options/docs/tests from `origin/main`; retain `normalizeNodeId` canonical behavior | NodeId package/type/runtime tests | Public breaking change | hard cut with changeset |
| Object-form mutation | Used for type/children changes, generic property bags, and atomic composites | Keep unchanged; do not force a sequence of keyed writes | Plite and feature owners | One transaction call preserves atomic intent and better inference for structural work | Classify, do not mechanically rewrite | history/rollback and package tests | Overzealous migration changes semantics | explicit survivor |
| Generated editor grammar | CLI emits exact `Value`, schema, and mutation contracts | Keep as the closed application boundary; use it only as a depth sentinel here | CLI/Core | Runtime callbacks must not carry the full recursive grammar | No generator shape change unless implementation proves a real contract gap | `editor.generated.ts` and www typecheck | Accidental generated-map dependency | preserve boundary |
| Doctrine | Current Vision/rules say ordinary properties use handles/semantic APIs and reject a plugin-aware node overload | Teach literal-first local mutation with handle/semantic exceptions | `best-api`, Plate Next, plugin creator, Plate Vision | Accepted decision supersedes stale guidance | Run `best-api repair`, edit source rules, then `pnpm install` | source/generated rule diff plus focused rule checks | Partial repair repeats the mistake | mandatory execution slice |
| Release/docs | Plite transforms docs teach only object set/untyped unset; Plate docs teach handle-first author access | Document all four roles and the NodeId break in existing package release owners | Docs + changesets | Public type/API behavior changes | EN/CN parity; update existing one-package changesets relative to `origin/main` | docs typecheck/parity and changeset checks | Branch-relative migration prose | main-relative only |

## Exhaustive production schema inventory

The production scan found 53 property-owning plugin descriptors and 116
expanded property laws. Shared media fields count once per installed descriptor
because each descriptor contributes an independent law.

| Package | Descriptor-owned laws | Count | Migration class |
| --- | --- | ---: | --- |
| `media` | Audio/File: `isUpload`, `name`, `placeholderId`, `url`, `width`; Video/MediaEmbed add `provider`, `sourceUrl`; Image adds `alt`, `initialHeight`, `initialWidth`; Placeholder adds `mediaType` | 33 | exact local literals; shared declaration remains shared |
| `list` | `checked`, `listRestart`, `listRestartPolite`, `listStart`, `listStyleType` | 5 | exact literals; dependency adds Indent's `indent` |
| `tag` | `url`, `value` | 2 | exact literals |
| `slash-command` | `trigger`, `userId`, `value` | 3 | exact literals |
| `layout` | Column Item `width`; Column Group `layout` | 2 | exact literals; group sees item dependency |
| `footnote` | Definition/reference `identifier`; input `trigger`, `userId`, `value` | 5 | exact literals in each local graph |
| `excalidraw` | `data`, `width` | 2 | exact literals |
| `code-drawing` | `data` | 1 | exact literal |
| `mention` | input `trigger`, `userId`, `value`; mention `key`, `value` | 5 | exact literals |
| `math` | block/inline `texExpression` | 2 | exact literals in separate descriptors |
| `basic-nodes` | primary marks `bold`, `code`, `highlight`, `italic`, `kbd`, `script`, `strikethrough`, `underline` | 8 | exact primary-mark literals |
| `find-replace` | primary mark `findReplace` | 1 | exact primary-mark literal |
| `emoji` | `trigger`, `userId`, `value` | 3 | exact literals |
| `ai` | primary mark `ai`; local `preview` persisted as `aiPreview` | 2 | mark literal; preview exact handle/semantic API |
| `basic-styles` | marks `fontBackgroundColor`, `fontColor`, `fontFamily`, `fontSize`, `fontWeight`; targeted properties `lineHeight`, `textAlign`, `textIndent` | 8 | exact literals |
| `indent` | targeted property `indent` | 1 | exact literal |
| `callout` | `backgroundColor`, `icon`, `variant` | 3 | exact literals |
| `comment` | primary mark `comment`; prefix `comment_*`; local `transientComment` persisted as `commentTransient` | 3 | mark literal; prefix semantic API; alias handle |
| `suggestion` | primary mark `suggestion`; block/inline aliases to `suggestion`; element/text aliases to `suggestionData` and `suggestionTransient`; two `suggestion_*` prefixes | 9 | literal key is ambiguous; exact handles or semantic API only |
| `table` | Cell `background`, `borders`, `colSpan`, `header`, `rowSpan`, `size`; Row `size`; Table `colSizes`, `marginLeft` | 9 | unique literals except dependency-graph collision on `size` |
| `legacy-list-model` | Todo `checked`; aggregate list `checked` | 2 | maintenance-only compile adoption; no proactive redesign |
| `code-block` | Code Block `lang`; Code Highlight primary mark | 2 | exact literals |
| `link` | `target`, `url` | 2 | exact literals |
| `date` | `date`, `rawDate` | 2 | exact literals |
| `core` | Node ID dynamic `[idKey]` | 1 | hard-cut to canonical `id` before inference |
| **Total** | **53 descriptors / 116 expanded laws** | **116** | complete |

Declaration morphology cross-check:

| Shape | Count | Target |
| --- | ---: | --- |
| Direct element property | 51 | exact local entry |
| Unkeyed top-level element/text property | 10 | local id is persisted key |
| Primary mark | 18 | descriptor-name key unless explicitly aliased |
| Explicit literal alias | 4 | exact handle/semantic operation |
| Constant/function alias | 4 | exact handle/semantic operation |
| Prefix declaration | 3 | semantic dynamic operation; never direct keyed set |
| Shared media property expansion | 25 | five exact entries on each of five descriptors |
| Runtime-selected Node ID property | 1 | delete variability; canonical `id` |
| **Total** | **116** | complete |

## Exhaustive production mutation-call inventory

A zero-parse-error Babel AST scan over `packages/**/src` and `apps/**/src`
found 290 `tx.nodes.set/unset` or `editor.update.nodes.set/unset` calls across
97 files. Production package source accounts for 114 calls across 27 files.

Legend: **L** adopts or proves the typed literal path; **H** uses an exact
handle because identity is aliased/ambiguous; **S** remains a semantic,
dynamic, or atomic object operation; **X** is structural/editor-level/generic
and is intentionally outside plugin-local literal inference.

| Production package owner | Calls | Classification and action |
| --- | ---: | --- |
| `ai/lib/BaseAIPlugin.ts` | 1 | L: primary `ai` mark |
| `ai/react/AIChatPlugin.ts` | 3 | L: required-dependency `ai`; H/S: `aiPreview` and `suggestionTransient` through their owners |
| `basic-nodes/lib/BaseBlockPlugins.ts` | 1 | X: structural `type` change |
| `basic-styles/lib/BaseStylePlugins.ts` | 6 | L: `lineHeight`, `textAlign`, `textIndent`; remove `.key` extraction/computed objects |
| `callout/react/useCalloutEmojiPicker.ts` | 1 | X: editor-level targeted object update |
| `code-block/lib/BaseCodeBlockPlugin.ts` | 3 | X: `type`/`children` structural updates |
| `comment/lib/BaseCommentPlugin.ts` | 4 | L: primary `comment`; H/S: transient alias and dynamic `comment_*` work |
| `core/internal/plugin/resolvePlugins.ts` | 1 | X: synthesized generic property bag |
| `core/lib/plugins/input-rules/createInputRules.ts` | 1 | X: structural `type` update |
| `core/lib/plugins/node-id/NodeIdPlugin.ts` | 1 | S: canonical-ID normalization object after `idKey` cut |
| `excalidraw/react/useExcalidrawElement.ts` | 1 | X: editor-level targeted object update |
| `footnote/lib/BaseFootnotePlugin.ts` | 1 | L: `identifier` |
| `indent/lib/BaseIndentPlugin.ts` | 3 | L: max correction; S: two atomic composites with caller-supplied props/unsets; replace `node[key]` with `node.indent` |
| `layout/lib/BaseColumnPlugin.ts` | 4 | L: dependency-owned `width` |
| `link/lib/BaseLinkPlugin.ts` | 3 | L: `url` and `target` |
| `legacy-list-model/lib/BaseListPlugin.ts` | 9 | L: four `checked` calls; X: five structural `type` calls; mechanical maintenance-only adoption |
| `legacy-list-model/react/useTodoListElement.ts` | 1 | X: editor-level targeted object update |
| `list/lib/BaseListPlugin.ts` | 30 | L: 24 single/array/known-union key calls; S: six atomic multi-property updates |
| `list/react/useTodoListElement.ts` | 1 | X: editor-level targeted object update |
| `media/lib/BaseMediaPlugin.ts` | 1 | S: atomic normalized `provider`/`sourceUrl`/`url` write |
| `plite/core/editor-commands.ts` | 1 | X: generic command delegation |
| `selection/react/BlockSelectionPlugin.tsx` | 3 | S: intentionally generic selected-block/text setters; plugin does not own or require Indent |
| `suggestion/lib/BaseSuggestionPlugin.ts` | 18 | H/S: 16 ambiguous/aliased/prefix semantic writes; X: two generic text-property bags at lines 934/942 |
| `table/lib/BaseTablePlugin.ts` | 12 | L: nine unique `background`/`borders`/`colSizes`/`marginLeft` calls; H: Row `size`; X: two dynamic text-mark calls |
| `table/lib/internal/mutation.ts` | 2 | S: generic atomic mutation program |
| `toggle/react/TogglePlugin.tsx` | 1 | S: foreign `indent` convention without a descriptor dependency; keep object form |
| `utils/lib/plugins/NormalizeTypesPlugin.ts` | 1 | X: generic structural `type` normalization |
| **Total** | **114** | complete |

The same scan found 33 production app calls across 17 files. All are
editor-level object mutations and therefore stay outside the plugin-local map:

| App owner | Count |
| --- | ---: |
| Plite examples: check-lists, code-highlighting, embeds, forced-layout, markdown-shortcuts, pagination, richtext, synced-blocks, Yjs collaboration, Yjs Hocuspocus | 21 |
| Registry: `comment-kit`, `transforms`, `transforms`, `block-discussion`, `code-drawing-node`, `comment`, `date-node` | 12 |
| **Total** | **33** |

The remaining 143 calls across 53 spec/test/slow files are proof fixtures.
They retain object form unless a compile contract intentionally exercises the
new literal/handle overload. This closes all 290 parsed calls without pretending
test examples are production adoption.

## Docs, generated, rules, and release inventory

- `content/**` contains 54 relevant matches across 36 MDX files. Six owners
  teach the changed contract and must change:
  `content/docs/plite/api/transforms.mdx`, EN/CN plugin guides,
  `plugin-context.mdx`, and EN/CN Plate-plugin API pages.
- EN/CN editor guides and `content/docs/plite/concepts/19-schema.mdx` retain
  generated/app-owned or schema-inspection handles; revalidate wording but do
  not rewrite them into literal mutation examples.
- The other 28 MDX files use legitimate object-form node updates and remain.
- `packages/cli/src/generate.ts` and registry `*.generated.ts` stay unchanged
  unless type feasibility exposes a real closed-editor contract gap. They are
  mandatory TS2589/precision sentinels and are never hand-edited.
- Stale doctrine exists in `.agents/rules/best-api.mdc:409-410,475`,
  `.agents/rules/plate-next.mdc:393-394`,
  `.agents/rules/plate-plugin-creator.mdc:593-607`, and
  `docs/vision/plate.md:146-147,234`. Execution repairs source rules and runs
  `pnpm install`; generated `SKILL.md` files are not edited directly.
- The new decision supersedes the handle-key example in
  `docs/plans/2026-08-03-application-schema-overrides-and-property-handles.md:259`
  and the blanket no-plugin-aware-`nodes.*` / no-property-CRUD constraint in
  `docs/plans/2026-08-04-hard-cut-generic-plugin-mutations.md:57,72`. Those
  completed plans remain historical records; current Vision/rules become the
  reusable source of truth.
- Update existing `.changeset/plite-canonical-architecture.md` for the Plite
  keyed/handle primitive and `.changeset/plugin-portal-scoped-api.md` for Core
  author inference plus the public `NodeIdPluginState.idKey` removal. Both are
  already one-package, `origin/main`-relative major changesets; do not create
  branch-relative duplicate release prose.

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Plite primitive | `packages/plite` editor interfaces, runtime view, public state, command/spec tests | Add keyed and exact-handle overloads; normalize `(props, options)`, `(key, value, options)`, and `(handle, value, options)` before the canonical `setNodes` command; normalize unset handles | Target accepted | Every spelling emits the same props/options command and preserves transaction semantics | typecheck; `command-spec`, `native-transaction-spec-contract`, `accessor-transaction`, history/rollback-focused tests |
| 2. Core shallow inference | `pluginSchemaModel.internal.ts`, `pluginRuntimeTypes.ts`, definition type tests | Derive duplicate-safe shallow property entries; carry them through compact runtime definitions; build local transaction wrappers for update/correction/command/spec contexts | Plite overload stable | Current plugin plus required dependencies infer exact keys/values without complete grammar or public ferry types | Core type contracts, declaration emit, Base/React parity, large EditorKit compile |
| 3. Exact author handles | `createPluginContext.internal.ts`, `compilePlateModel.ts`, `resolvePlugins.ts` | Preserve `SchemaPropertyKey`; construct complete stable prepublication handles; reject prefix direct mutation | Slice 2 types stable | Captured handles equal published handles and aliases/collisions remain exact | context/compiler/resolve runtime tests plus prefix/alias negatives |
| 4. Identity prerequisite | Core NodeId | Remove public `idKey`, canonicalize schema/runtime/docs/tests on `id`, delete the cast-backed dynamic schema | Core local map available | Node ID no longer changes storage identity at runtime | NodeId typecheck and focused normalization/insert tests; main-relative migration prose |
| 5. First-party adoption | 27 production package owners above | Convert L calls, route H calls through exact handles/semantic owners, retain S/X calls, simplify mutation-only `.key` reads, mechanically repair Legacy list model only as required | Core/Plite source-first types green | All 114 calls match their classified final role; no casts or callback annotations | package typechecks/tests; fresh zero-parse-error AST classification |
| 6. Public teaching and doctrine | docs, source rules, Vision, existing changesets | Teach the four-role law, EN/CN parity, repair contradictory rules with `best-api repair`, run `pnpm install`, update existing release prose | Package adoption frozen | One current API is taught everywhere; no direct skill edit or duplicate changeset | docs/source parity, rule checks, skill regeneration diff, changeset checks |
| 7. Closure | all changed owners | Focused-to-broad tests, large EditorKit depth proof, Browser routes, lint, applicable barrels, P2 autoreview, final audits | All prior slices frozen | Zero accepted P0/P1/P2 findings and no unclassified source call/declaration | commands and route matrix below |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Correct literal value is inferred | Basic Styles/Indent/List declarations preserve property descriptors | `tx.nodes.set('lineHeight', 2)` and dependency `indent` compile | specified |
| Wrong literal key rejects | Local graph has a finite exact-key map | `@ts-expect-error tx.nodes.set('lineHieght', 2)` | specified |
| Wrong value rejects | Entry carries the property descriptor's inferred value | Boolean/string/enum/JSON negative matrix | specified |
| Required dependency key works | List requires Indent; Table requires Row then Cell | List `indent`, Table unique Cell/Table fields compile | specified |
| Optional/foreign plugin does not leak | Block Selection and Toggle lack an Indent dependency | Their direct literal form rejects; retained object/semantic form compiles | specified |
| Duplicate key rejects even when values match | Table Row and Cell both own numeric `size` | `tx.nodes.set('size', value)` rejects in Table; Row handle succeeds | specified |
| Alias is not silently treated as local literal | AI preview and Comment transient have local id != persisted key | raw alias literal rejects in plugin-local overload; exact handle succeeds | specified |
| Prefix is never one writable key | Comment/Suggestion declare three prefixes | prefix handle direct set/unset rejects; semantic dynamic operations pass | specified |
| Known arrays/unions stay typed | List uses literal arrays and known restart-key unions | every literal member validates; a misspelled member rejects | specified |
| Widened dynamic algorithms survive honestly | Table mutation engine and generic helpers accept runtime strings/property bags | only widened string/generic object escape compiles; wrong concrete literals do not | specified |
| Atomic object form is unchanged | List/Media/Indent require one multi-property operation | same command/change/history unit before and after | specified |
| Exact handle has runtime identity | Public handle already has `kind`, id, placement, and key | prepublication and published handles are deeply equal/frozen; runtime unwraps only exact strings | specified |
| Runtime command is canonical | `public-state.ts:3378-3389` owns set command dispatch | all overloads produce one `setNodes` command and one undo unit | specified |
| Wrapper reads the right options slot | `editor-runtime-view.ts:622-628` currently assumes two args | selection-target wrapper tests cover object and three-argument forms | specified |
| No TS2589 or capability pollution | Compact definition intentionally omits schema grammar | Core declaration emit and full registry EditorKit typecheck pass without `any`/`never` | specified |
| Generated closed Value remains exact | CLI-generated contract remains the application boundary | generated contract check and www package-integration typecheck pass | specified |
| Base and React plugins infer equally | Both authoring layers consume the Core context | compile-only constructor/conversion tests pass | specified |
| Node ID identity is immutable | Current `idKey` is the sole runtime-selected schema property | option is absent, canonical `id` behavior and migrations pass | specified |
| Docs/UI remain functional | Line Height, Table, and AI exercise literal, collision, and semantic paths | Browser `/blocks/line-height-demo`, `/blocks/table-demo`, `/blocks/editor-ai` interactions and console checks | specified |
| No stale alternative remains | Exact declaration/call/docs/rule inventories are recorded above | rerun AST/rg audits; every survivor maps to L/H/S/X | specified |

Conditional evidence:
- High-risk scenarios: applicable. Duplicate persisted keys, aliases, prefixes,
  prepublication capture, three-argument runtime dispatch, rollback/history,
  required-dependency inference, and TypeScript depth each have a dedicated
  proof row.
- External research: not applicable. This decision concerns current private
  type/runtime owners and accepted local API doctrine; live repository source
  resolves it without an external precedent.
- Issue/PR provenance: not applicable. This is a user-directed internal
  architecture plan with no public GitHub mutation authority.
- Docs/registry/browser/release/behavior-law owners: applicable. Slice 6 owns
  EN/CN docs, rules, Vision, and existing changesets; Slice 7 owns the three
  standalone Browser routes and behavior proof.
- Device testing: deferred by the standing user decision. This API/type change
  has no native-device-only behavior; desktop Browser plus transaction tests
  are the correct gate.

Findings:
- The clean API is smaller than both alternatives: the key is a string when it
  is truly invariant and unique; a handle appears only when the schema needs to
  disambiguate what the string cannot express.
- “Current plugin only” is too narrow. List mutates Indent and Table mutates
  Row/Cell by declared dependency. “Entire EditorKit” is too broad and caused
  TS2589. Current plugin plus required dependencies is the correct boundary.
- The type carrier must record identity provenance. Table's two `size: number`
  laws would otherwise collapse into one structural union and incorrectly make
  `size` look safe.
- The runtime change is not just an overload. `public-state.ts` and
  `editor-runtime-view.ts` destructure the old two-argument tuple, so the keyed
  three-argument form must be normalized before target selection and command
  dispatch.
- Author handles are currently incomplete before publication: `{ key }` does
  not satisfy the public handle contract and cannot be discriminated from a
  props bag.
- Prefix inference is currently wrong because `SchemaKeyPrefix` is not a
  `string`; the author type falls back to the declaration-local id.
- NodeId's `idKey` is the only production schema property selected from mutable
  plugin state and cast back to a canonical type. It must be cut, not hidden
  behind another generic escape.
- Only mutation-related `.key` plumbing changes. Codec callbacks and generic
  schema inspection legitimately need resolved schema identity and remain.
- The 33 app calls are intentionally not pulled into plugin-local inference.
  Doing so would reintroduce the complete application schema into ordinary
  runtime capabilities.

Decisions and tradeoffs:
- Prefer `tx.nodes.set('lineHeight', value)` over
  `tx.nodes.set(schema.properties.lineHeight, value)`. The literal is clearer,
  shorter, and fully typed because the property key is immutable.
- Prefer an exact handle over a raw alias literal. The local id and persisted
  key are deliberately different; hiding that distinction recreates string
  coupling.
- Prefer an existing semantic feature operation over exposing prefix matching
  through generic node mutation. A prefix denotes a family, not one property.
- Preserve object-form `set` for atomic composites and structural changes. Two
  sequential keyed calls would be noisier and may alter normalization/history.
- Reject `tx.plugin(Plugin).set(...)` and `tx.properties.lineHeight.set(...)`.
  Both add a namespace without adding information.
- Reject an EditorKit-wide writable map in every `tx`. It gives better global
  autocomplete at the cost of catastrophic type depth and capability bloat.
- Reject a broad string overload placed beside the narrow overload. TypeScript
  would accept every misspelled literal through the broad branch.
- Keep generated exact Value/mutations consumer-side. This plan adds a shallow
  author-local property map, not another recursive schema representation.

Review fixes:
- Initial target was narrowed from “current plugin properties” to “current
  plugin plus required dependencies” after auditing List, Layout, and Table.
- Initial handle runtime assumption was corrected: published Plite handles are
  already nominal, but Core's prepublication author proxy returns only
  `{ key }`; the plan now assigns that exact owner.
- Initial production call snapshot (110/23) was replaced by a fresh
  zero-parse-error scan (114/27) that includes four React/editor consumers.
- Selection and Toggle `indent` updates were removed from literal adoption
  because neither descriptor declares Indent as a required dependency.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Loaded TypeScript 7 through the package root; compiler enums were unavailable | 1 | Use the installed parser whose public entry supports the source syntax | Switched to `@babel/parser` |
| Parsed every `.ts` file with JSX enabled; angle-bracket type assertions failed | 1 | Enable JSX only for `.tsx` | Zero parse errors across the final 290-call scan |
| Broad registry-route search exceeded useful output | 1 | Query exact demo names and the `[name]` route owner | Verified `/blocks/line-height-demo`, `/blocks/table-demo`, and `/blocks/editor-ai` |

Verification evidence:
- Fresh Babel scan: `290` calls / `97` files overall; `114` / `27`
  production package source; `33` / `17` production app source; `143` / `53`
  spec/test/slow source; zero parse errors.
- Fresh schema scan plus owner reads: `53` property-owning descriptors and
  `116` expanded laws, reconciled by morphology as
  `51 + 10 + 18 + 4 + 4 + 3 + 25 + 1`.
- Fresh docs scan: `54` relevant matches across `36` MDX files; six direct
  teaching owners identified.
- Live type/runtime reads recorded at:
  `packages/plite/src/interfaces/editor.ts:729-766`,
  `packages/plite/src/core/public-state.ts:3378-3389,3666-3675`,
  `packages/plite/src/editor-runtime-view.ts:622-635`,
  `packages/plite/src/interfaces/schema.ts:1369-1388`,
  `packages/core/src/lib/plugin/pluginSchemaModel.internal.ts:61-108`,
  `packages/core/src/lib/plugin/createPluginContext.internal.ts:133-185`, and
  `packages/core/src/lib/editor/pluginRuntimeTypes.ts:380-396,1549-1557`.
- `origin/main` confirms public NodeId `idKey` exists, so its removal is a real
  migration and belongs in Core's existing major changeset.
- Mechanical completion checker:
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-04-typed-plugin-property-mutations.md`
  returned `[autogoal] complete`.

Final handoff prepared:
- Ownership and target API: Plite owns the keyed/handle primitive and runtime
  normalization; Core owns shallow plugin/dependency inference and exact author
  handles; feature packages own semantic exceptions.
- Public breaks and adoption: add the canonical overload, hard-cut NodeId
  `idKey`, migrate all 114 production package calls by the manifest, retain all
  legitimate object calls, and update existing main-relative changesets.
- Applicable runtime/package/docs/browser decisions: seven execution slices
  cover Plite, Core, NodeId, packages, EN/CN docs, rules/Vision, release prose,
  generated depth proof, and three standalone demos.
- Proof and execution risks: duplicate keys, prefixes, aliases,
  prepublication handles, command tuple normalization, dependency inference,
  history, and TS2589 each have a binary gate.
- Execution order and user attention: land Plite runtime first, Core inference
  second, handle publication third, NodeId fourth, adoption fifth, teaching
  sixth, and closure last. Do not parallelize these owners because every later
  slice consumes the previous type contract.

Timeline:
- 2026-08-04T17:18:27.164Z Plate Plan created.
- 2026-08-04: Read current Vision, best-api, Plate Plan, Autogoal, and advanced
  TypeScript owners; locked the literal/handle/semantic/object law.
- 2026-08-04: Completed schema, mutation-call, docs, generated-contract,
  rule/Vision, prior-plan, release, and Browser-route audits.
- 2026-08-04: Pressure-tested dependency scope, collision identity,
  prepublication handles, runtime tuple dispatch, NodeId identity, and TS depth;
  prepared the execution handoff.
- 2026-08-04: Implemented all seven slices, completed first-party adoption,
  repaired review-exposed Core/AI/Link regressions, and closed P2 review.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Implementation complete, proven, and P2-reviewed |
| Where am I going? | Final handoff |
| What is the goal? | Execute one typed plugin-property mutation law without recursive schema typing or API alternatives |
| What have I learned? | The honest inference boundary is current plugin plus required dependencies; collisions and aliases need handles |
| What have I done? | Implemented all seven slices, migrated first-party owners, proved the package/app graph, and closed review findings |

Open risks:
- Browser interaction proof remains blocked by stale CI-generated
  `apps/www/src/__registry__/index.tsx`, which imports the intentionally absent
  `apps/www/src/registry/components/editor/plate-types.ts`. Source registry
  checks and www typecheck pass. Local policy forbids regenerating or editing
  this CI-owned output.
- Exact handles identify property laws but do not infer runtime target policy;
  feature semantic methods remain the owner for prefix and cross-node behavior.

Execution closure:
- Plite owns one canonical runtime normalizer for object, literal-key, and
  exact-handle set/unset forms. Prefix handles fail explicitly.
- Core projects only the current plugin plus required dependencies' shallow
  writable-property entries. Duplicate and aliased literal keys reject;
  exact author handles are identical before and after publication.
- NodeId uses canonical `id`; `idKey` survives only in historical changelog
  prose. Basic Styles, AI, Suggestion, Footnote, Layout, Link, Table, Indent,
  List, Legacy list model, Comment, and app consumers follow the four-way law.
- Generated EditorKit and www typechecks pass without TS2589. The generated
  schema JSON artifacts are verified by CLI/generator checks and intentionally
  excluded from autoreview's oversized-untracked-file bundle.
- Browser attempted `/blocks/line-height-demo` and `/docs/plugin`; both fail at
  the same stale CI-generated registry import before application code loads.
- Default Codex autoreview was attempted with
  `.agents/skills/autoreview/scripts/autoreview --mode local --max-priority P2`.
  Its secret preflight first caught a fake credential URI in staged hardening
  fixtures; current source splits that fixture and its 289-test suite passes.
  Codex then exited before JSON on both `gpt-5.6-sol` and
  `gpt-5.6-terra`, so the same fail-closed harness reviewed bounded current-tree
  packets with its installed Claude backend.
- Final P2 results: Plite clean; Core clean after fixing top-level Function-name
  update commands and function-authored schema identity; adoption clean after
  fixing optional Link access, resolved AI paragraph types, suggestion metadata
  stripping, required AI identity, and typed optional Table access.
- Final proof: Plite 1422/1422; Core 702/702 after review fixes plus 37/37
  focused during them; schema-adoption policy 61/61 and source audit 4246 files;
  AI streaming 5/5; Link rules 14/14; modified-package and www typechecks pass;
  `pnpm brl`, `pnpm lint:fix`, and `git diff --check` pass.
