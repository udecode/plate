---
review_scopes:
  - ui
  - slash
review_basis:
  - 2026-09-18-ui-menu-focus-and-block-insertion-ownership
  - 2026-09-18-slash-command-composition-ownership
work_kind: design
---

# Slash UI action ownership design

Status: Complete

Objective:
- Delete caller-owned menu close-focus handshakes, move matching-empty block
  policy into typed Plate plugin insertion, delete the copied `transforms.ts`
  recipe, and simplify `slash.tsx` while keeping product presentation copied.

Goal plan: `docs/plans/2026-09-18-slash-ui-actions-design.md`

Template: `docs/plans/templates/task-complex.md`

## Authority and result

- User authority: “go” after the recorded Best API Review recommended
  `$task design plan slash-ui-actions`.
- Governing reviews:
  - `docs/research/review-records/2026-09-18-ui-menu-focus-and-block-insertion-ownership.json`
  - `docs/research/review-records/2026-09-18-slash-command-composition-ownership.json`
- Output: design only. This pass changes the plan and review bookkeeping, not
  product source, publication, a PR, or a release.
- Workspace: current authorized checkout on branch `next`.
- External research: N/A. Installed Base UI and Radix source, current Plate
  runtime types, and current feature implementations answer the open contracts.
- Timed checkpoint: N/A; the user specified no duration.

The accepted target has three cuts:

1. Add item-scoped `finalFocus?: false | (() => void)` to both copied dropdown
   adapters. The selected item declares the post-close effect; content retains
   the existing event-based `onFinalFocus` escape hatch for whole-menu users.
2. Keep `insert` as the canonical typed block-creation verb, give its omitted
   `replaceEmpty` case a semantic empty-block default, and add block-only
   `upsert` for “reuse a matching empty block.” Preserve explicit
   `replaceEmpty` on `insert` as an advanced override.
3. Delete registry `transforms.ts`. Insert toolbar actions call typed `insert`;
   Slash block actions call typed `upsert`. Keep Slash labels, groups, icons,
   keywords, availability, AI membership, trigger policy, and JSX local.

Completion threshold:

The design is complete when it locks all of these conditions.

- the exact menu item API, precedence, cancellation, close-reason, nested-menu,
  radio/checkbox, and secondary-surface behavior;
- the public Plate call shapes, block-only type availability, semantic matrix,
  matching law, explicit override, authored-owner adoption, and Plite boundary;
- every current production caller to migrate or retain;
- the final Slash and Insert composition shapes and the rejected package APIs;
- implementation order, test/type/provider/browser proof, documentation,
  doctrine, release artifacts, rollback, and known proof limits.

Constraints:

- Escape, outside interaction, and an ordinary selected item without an
  override retain provider-native focus restoration.
- A selected item can suppress provider focus or run one post-close callback.
  The callback targets the exact mounted editor captured by that item.
- Prevented selection and a non-closing item never arm a later focus effect.
  Reopening a menu cannot replay stale intent.
- Nested submenu selection executes one intent through its owning root content;
  it cannot leak to an outer independent menu.
- Read-only or stale combobox completion performs no edit and no post-edit
  focus. Slash input removal and insertion stay in one synchronous transaction,
  rollback together, and undo in one step.
- A matching replaceable empty block can be reused. A different replaceable
  empty editable text block can be replaced. A nonempty, atom, read-only, void,
  or structurally incompatible block remains and receives insertion after it.
- Reuse preserves node identity and all non-construction properties, including
  alignment and line height.
- Plite owns structural placement and the primitive `replaceEmpty` operation.
  Plate owns plugin identity, construction input, feature semantics, and typed
  `insert`/`upsert` operations.
- Type inference is mandatory. Callers do not annotate transaction callback
  parameters, cast payloads, or restate plugin identity with raw node types.
- Copied source owns labels, icons, keywords, groups, feature membership, focus
  policy, and JSX. No public command catalog, Slash item factory, or second
  transaction authority is introduced.
- `templates/**` remains untouched. Registry output is generated only through
  its owning command.

Boundaries:
- Source of truth: current Plate/Plite source, installed Base UI and Radix
  source, the two governing review records, and the accepted table API plan.
- Allowed edit scope for this design pass: this plan plus required immutable
  review-ledger bookkeeping. Product source is implementation scope only.
- External sources: N/A; local authoritative source settles the contracts.
- Browser surface: no browser claim in design; implementation must prove both
  generated Base/Nova and Radix/Luma editors.
- Tracker and publication: N/A; no issue, PR, commit, push, or release is
  authorized by this planning request.
- Non-goals: packaging the Slash catalog, changing Plite structural insertion,
  redesigning context menus/popovers, or editing templates.

Blocked condition:
- Product implementation cannot claim type, runtime, doctrine, or generated
  registry closure while conflict markers remain in
  `.agents/rules/plate-next.mdc` and
  `packages/plitejs/src/interfaces/editor.ts`. Design closure remains possible
  through source inspection and the plan checker.

## Public menu contract

Both copied dropdown adapters expose the same item prop on normal, checkbox,
and radio items:

```ts
type DropdownMenuItemFinalFocus = false | (() => void);

type DropdownMenuItemProps = {
  finalFocus?: DropdownMenuItemFinalFocus;
};
```

Usage:

```tsx
<DropdownMenuItem
  finalFocus={() => editor.api.dom.focus()}
  onSelect={() => editor.update.mode.set('editing')}
/>

<DropdownMenuItem finalFocus={false} onSelect={openAnotherSurface} />
```

The prop is `finalFocus`, not `onFinalFocus`, because it declares a selected
item's close result. `false` is the explicit “suppress provider restoration”
value. The callback receives no provider event and runs only after the menu has
closed. Omitting the prop preserves provider behavior.

`DropdownMenuContent.onFinalFocus(event)` remains unchanged as the low-level
all-close hook. It still receives the neutral cancelable event. Item intent has
precedence for a successful selected-item close; content intent handles closes
for which no item intent was armed. The two callbacks never both run for the
same close.

### Adapter state and event order

`DropdownMenuContent` owns one local context containing a mutable pending item
intent. React context reaches portaled descendants. The state lives only for
that content lifetime and is cleared before any callback runs.

For every item kind and provider:

1. Run the caller's selection handler first. In Base UI, preserve the current
   cancelable synthetic `select` event and then run the caller's `onClick`.
2. Observe the final cancellation result after caller handlers. A prevented
   selection asks the provider not to close and leaves no pending intent.
3. If the item will close (`closeOnClick !== false` where supported), copy its
   `finalFocus` value into the content ref. An omitted prop leaves no override.
4. Let the provider close normally.
5. At provider final focus, atomically read and clear the pending value. For a
   callback, prevent provider restoration and invoke the callback. For `false`,
   prevent provider restoration and stop. With no pending value, delegate to
   content `onFinalFocus`; without that handler, keep the provider default.

The implementation clears before invoking user code, so throws or re-entrant
menu work cannot replay the effect. Disabled items, prevented selection,
`closeOnClick={false}`, Escape, outside pointer close, and programmatic close do
not arm item intent. A submenu item consumes the root content context through
the portal and fires once when the root closes. A separate nested dropdown has
its own provider and cannot see the outer ref.

Base UI keeps its `onClick`/synthetic-`select` translation and its boolean
`Popup.finalFocus` return. Radix wraps Item, CheckboxItem, and RadioItem instead
of re-exporting them raw, and maps content final focus to
`onCloseAutoFocus`. Provider-specific event types do not enter registry caller
props.

## Public Plate insertion contract

The plugin portal exposes these operations for block element plugins:

```ts
type BlockUpsertOptions = Omit<
  BlockInsertOptions,
  'at' | 'replaceEmpty'
>;

insert(properties, options?: ElementInsertOptions): Result;
upsert(properties, options?: BlockUpsertOptions): Result;
```

`insert` remains available on inline elements with its current node-insertion
semantics. `upsert` exists only for block element portals. It is absent from
inline Date, Link, Mention, Tag, Emoji, and Inline Equation portals at compile
time. Generated editor declarations carry a private `block: true` mutation
marker derived from schema block/inline behavior so their closed types expose
the same surface. The marker remains internal and is not an authoring API.

Root and active-transaction forms stay parallel:

```ts
editor
  .plugin(BaseHeadingPlugin)
  .update.insert({ level: 1 }, { select: true });

tx.plugin(BaseHeadingPlugin).upsert({ level: 1 }, { select: true });
```

The name-based portal remains valid for package decoupling:

```ts
tx.plugin(pluginName).upsert(input, options);
```

Descriptor input preserves exact inference. Name input intentionally uses the
installed name group's erased contract. No caller matcher, node recipe, or
generic annotation is added.

### Placement and empty-block matrix

When `insert` receives an explicit `at`, it performs exact node insertion and
does not run semantic source reuse. Otherwise, its source is the explicit
`after` target or the current selection block. An explicit
`replaceEmpty: true | false` keeps the existing low-level Plite policy and
overrides the semantic default.

When `replaceEmpty` is omitted, and for every `upsert` call:

| Source | Semantic match | `insert` | `upsert` |
| --- | --- | --- | --- |
| Replaceable empty editable text block | yes | Insert a new target after it | Reuse it; preserve identity and non-construction props |
| Replaceable empty editable text block | no | Replace it | Replace it |
| Nonempty editable block | either | Insert after it | Insert after it |
| Atom, read-only, void, non-text, or incompatible empty block | either | Insert after it | Insert after it |
| Explicit `at` | N/A | Exact insertion at `at` | Unsupported |
| Explicit `insert.replaceEmpty` | N/A | Force existing primitive policy | Unsupported |

`upsert` omits `at` because exact insertion and source reuse are conflicting
instructions. It keeps `after` so asynchronous and captured-target callers can
resolve one stable source. Both operations retain `select`, history, and other
compatible node options.

`insert` means “create one target block.” That is why a matching empty source
gets a sibling. `upsert` means “ensure this target at the source.” That is why a
matching empty source is reused. This distinction avoids a boolean mode on
`insert` and makes Slash intent readable.

### Semantic matching law

The generated default matches:

1. the compiled target element type; and
2. only construction properties explicitly supplied by the caller and
   recognized by the compiled element schema.

Generated defaults and omitted injected properties are not identity. Comparing
every construction property is wrong: list state is semantic, while injected
alignment, indentation, and line height must survive a matching reuse. The
design therefore does not add schema-wide identity metadata and does not expose
a public matcher callback.

Feature-owned inserts that have stronger domain identity author their own
`insert` and `upsert` on top of one package-private helper. The helper owns
source resolution, structural replaceability, explicit `insert` override,
`insert` versus `upsert` mode, and the single mutation call. It may accept a
private feature matcher and private insertion callback. Those callbacks never
cross the public portal.

Built-in semantic dispositions are:

| Owner | Match for reuse | Required adoption |
| --- | --- | --- |
| Generated ordinary block | Compiled type plus explicitly supplied construction props | Generate semantic `insert` and block-only `upsert`. |
| Paragraph | Paragraph type and no `listType` | Keep generated `insert`; author `upsert` override and semantic insert matching where required by the shared helper. |
| Heading | Heading type, requested `level`, and no `listType` | Author the matching override while retaining inferred `{ level }`. |
| List | Requested `listType` | Author both operations around paragraph-backed construction. |
| Code Block | Code-block type and no `listType` | Author both operations; repair current same-empty `insert` so it creates a sibling while `upsert` reuses. Preserve expanded-selection and default-block behavior. |
| Details | Details type and no `listType` | Author both operations; retain open-key registration and summary/body selection. |
| Column Group | Column-group type and no `listType` | Author both operations. Existing behavior deliberately treats column count as construction input, not reuse identity; retain that decision. |
| Table | Table type and no `listType` | Author both operations; retain validation, table-relative placement, and first-cell selection. |
| Media family | Media type plus normalized required media identity supplied by the caller | Author both operations in `defineMediaPlugin`; retain URL validation, captured targets, caption construction, and boolean result. |
| Block Equation and other generated block voids | Generated rule unless an existing feature insert owns extra semantics | Receive generated block-only `upsert`; keep inline counterparts unchanged. |

An authored `insert` suppresses the generated `upsert` unless that authored
owner also supplies `upsert`; a generic element constructor cannot replace
Details, Table, Column, Code Block, List, or Media structure. Runtime merge and
`PluginUpdateGroup` typing enforce the same rule. Authored return conventions
remain intact (`void` or `boolean`); this plan does not create an unrelated
return-type migration.

The helper belongs in a private Plate implementation unit such as
`packages/platejs/src/lib/plugin/blockInsertion.internal.ts`. It is not
exported. Plite's `tx.blocks.insertAfter(nodes, { replaceEmpty })` and its
structural empty predicate remain unchanged.

## Caller migration

### Dropdown close focus

| Caller | Item migration | Removed state |
| --- | --- | --- |
| More toolbar | Add callback to Undo, Redo, and Download items. | One ref, open reset, content handler. |
| Mode toolbar | Add callback only to Editing. Viewing and Suggesting keep provider focus. | One ref, open reset, content handler. |
| Bulleted list menu | Add callback to all three style items and use `onSelect` consistently. | One ref, open reset, content handler. |
| Numbered list menu | Add callback to all five style items. | One ref, open reset, content handler. |
| Align toolbar | Add callback to every radio item. | One ref, open reset, content handler. |
| Line-height toolbar | Add callback to every radio item. | One ref, open reset, content handler. |
| Insert toolbar | Map `focusEditor: true` to the callback and `false` to `finalFocus={false}`. | Tri-state ref, open reset, content handler. |

This removes seven refs across six controls. Existing content-level handlers
in table, block, color, math, discussion, footnote, select-editor, and other
components remain because they own all-close behavior rather than selected-item
intent.

### Insert toolbar

Replace all 13 registry helper recipes with direct typed `insert` calls for
Paragraph, Heading, Table, Code Block, Blockquote, Horizontal Rule, List,
Details, TOC, Column Group, Equation, Excalidraw, and Code Drawing.

Delete the two manual Image and Media Embed `block`/`replaceEmpty` calculations.
`BaseMediaPlugin.api.insertUrl` already captures an explicit anchor or block
across the asynchronous prompt; the media owner applies semantic insertion to
that captured target. Keep `canRestoreFocus` because it governs focus after an
async prompt, not menu close.

Keep installed-feature filtering, labels, groups, icons, async dialogs,
secondary-surface ownership, and inline insertion actions local.

### Slash

Replace the 17 block recipes with direct one-line transaction calls:

```ts
onSelect: (_editor, tx) => {
  tx.plugin(BaseHeadingPlugin).upsert({ level: 1 }, { select: true });
}
```

The 17 targets are Text, Heading 1/2/3, Bulleted/Numbered/To-do List, Details,
Code Block, Table, Blockquote, Callout, Table of Contents, 3 Columns, Equation,
Excalidraw, and Code Drawing.

Keep `isAvailable` for optional installed features. Remove repeated installed
and read-only guards from block callbacks: plugin membership is immutable for
the editor lifetime, the rendered groups already filter read-only state, and
`BaseComboboxPlugin.api.commit` revalidates stale/read-only completion while
owning atomic input removal plus the callback transaction.

Keep the four non-block/product-specific actions explicit. Keep
`focusEditor` in Inline Combobox; it is combobox completion focus and is not the
dropdown adapter problem. Do not add a local factory initially. Direct typed
one-liners remove the meaningful repetition and remain clearer than another
descriptor vocabulary. Reassess only if the implemented source still contains
parallel semantic boilerplate after the operation migration.

Delete:

- `apps/www/src/registry/components/editor/transforms.ts`;
- `apps/www/src/registry/components/editor/transforms.spec.ts` after its laws
  move to Plate owner tests.

Retain and rename `transforms-combobox.spec.ts` as a Slash/combobox integration
test that calls typed `upsert` directly and proves one commit, input removal,
and one-step undo.

## Rejected alternatives

- Keep refs or extract a caller hook: the adapter would still leak its selected
  close lifecycle into every control.
- Always focus from content: Escape, outside close, view-mode changes, and
  secondary surfaces would receive the wrong focus.
- Expose provider events on items: Base UI and Radix do not share those event
  types or lifecycle names.
- Add `upsert: true`, `reuseMatching`, or a string mode to `insert`: that hides
  two different verbs inside option soup.
- Remove `replaceEmpty`: the accepted table API and advanced exact-placement
  callers still need the primitive override.
- Put semantic matching in Plite: Plite has no plugin construction identity.
- Export the registry recipe or a matcher hook: callers would still compose
  node predicates and mutation callbacks manually.
- Add schema-wide identity/variant metadata: current evidence needs a generic
  explicit-construction rule plus a bounded set of feature-owned overrides; a
  new schema concept would be broader than the job.
- Package Slash items, a command registry, or a shared Slash/Insert catalog:
  product labels, grouping, membership, async behavior, and focus differ.
- Add a Slash item factory immediately: after typed `upsert`, it saves little
  and makes inference and editing harder to read.

## Source and blast radius

Primary implementation owners:

- `apps/www/src/registry/bases/base/dropdown-menu.tsx`
- `apps/www/src/registry/bases/radix/dropdown-menu.tsx`
- `apps/www/src/registry/components/editor/{more,mode,list,align,line-height,insert-toolbar-button}.tsx`
- `apps/www/src/registry/components/editor/slash.tsx`
- `apps/www/src/registry/components/editor/transforms.ts`
- `packages/platejs/src/lib/editor/pluginRuntimeTypes.ts`
- `packages/platejs/src/internal/plugin/resolvePlugins.ts`
- the new private Plate block-insertion helper
- authored block owners in Basic Nodes, List, Code Block, Details, Layout,
  Table, Media, Math, Excalidraw, Code Drawing, and TOC as required by the
  owner census.

Supporting proof and generated owners:

- `packages/platejs/src/lib/plugin/block-insertion.spec.ts`
- Plate type tests and generated editor mutation fixtures
- provider adapter/component tests
- focused toolbar and Slash/combobox tests
- `apps/www/tests/browser/multi-editor.spec.ts`
- generated registry items from `pnpm --filter www build:registry`
- API-reference output from its owning generator
- `docs/vision/plate.md`
- `.agents/rules/plate-plugin-creator/rules/capabilities.md`
- Plate Next doctrine source and generated mirrors
- one `platejs` changeset if the final delta from `main` is public
- one registry changelog source entry plus generated JSON because copied
  install shape and behavior change.

`context-menu` and floating-popover adapters are outside scope. Their
content-level final-focus contracts do not have the demonstrated selected-item
handshake. `templates/**` is excluded.

## Implementation sequence

1. Resolve or obtain the owning resolution for the two pre-existing merge
   conflicts listed under Proof limits. Do not choose either side as part of
   this feature.
2. Add focused type tests first for block-only `upsert`, exact construction
   inference, name-based portals, authored insert suppression, and inline
   absence. Add the model matrix to the existing Plate insertion test owner.
3. Implement the private Plate block insertion policy. Extend runtime/default
   insertion and mutation declaration types together so runtime and static
   portals cannot diverge.
4. Adopt each authored block owner. Prove its current construction, selection,
   result, target capture, and one-step history behavior before moving callers.
5. Add the neutral item `finalFocus` contract to Base and Radix adapters with
   one shared behavioral test matrix and provider-specific implementation
   tests where event translation differs.
6. Migrate the seven menu refs. Keep all unrelated content-level handlers.
7. Migrate Insert to `insert`, including asynchronous media target capture and
   secondary-surface focus.
8. Migrate Slash to `upsert`, remove redundant guards, delete `transforms.ts`
   and its unit test, and retain the renamed combobox integration test.
9. Run source/type/model/component checks before generation. Then run API
   reference, registry generation, generated install, and browser proof.
10. Apply public API doctrine repair, source-rule regeneration, package
    changeset and registry changelog decisions against `main`, then reconcile
    the two review decisions through an implementation execution record.

Do not leave the helper and the typed operations as parallel supported paths.
The registry helper is deleted in the same implementation unit that migrates
its last caller.

Verification surface:

- Fresh proof consists of the bounded source/caller census and plan checker in
  this design pass, followed during implementation by the type, model, adapter,
  generated-provider, registry, and browser lanes specified below.

### Type and model

Add or adapt tests for:

- inferred required and optional construction properties on `insert` and
  `upsert`;
- `upsert` present on generated and authored block portals and absent on inline
  portals, including an intentional `@ts-expect-error`;
- descriptor and name-based transaction portals;
- authored `insert` suppressing unsafe generated `upsert`;
- `insert` replacing a different empty block, inserting after a matching empty
  block, and honoring explicit `replaceEmpty: true | false`;
- `upsert` reusing a matching empty block and preserving node identity,
  alignment, line height, and other non-construction props;
- heading level mismatch, paragraph/list separation, and each list type;
- nonempty, atom, read-only, void, and non-text sources;
- explicit `after` stable targets and unchanged exact `at` insertion;
- List, Code Block, Details, Column, Table, Media, Equation, Excalidraw, Code
  Drawing, and TOC authored/generated behavior;
- the Code Block distinction between same-empty `insert` and `upsert`;
- one commit, rollback, input removal, and one-step undo through Combobox.

### Menu adapter and copied controls

Run the same contract against Base and Radix:

- callback order is selection, close, final callback;
- callback and `false` suppress provider restoration;
- absent item intent preserves provider behavior;
- prevented, disabled, and non-closing items do not arm intent;
- checkbox and radio items follow the same law;
- keyboard and pointer selection agree;
- submenu selection fires once and does not leak;
- Escape and outside close have no item intent;
- callback targets the editor captured by the selected item.

Focused copied-component tests cover More, Mode, both List menus, Align, Line
Height, Insert secondary surfaces, async media, and Slash direct `upsert`.

### Integration and commands

Use Verify Plate's exact source-first recipes during implementation. The
expected lanes are:

```sh
bun test packages/platejs/src/lib/plugin/block-insertion.spec.ts
bun test <focused authored-owner and type tests>
bun test <focused adapter and copied-control tests>
pnpm --filter platejs typecheck
pnpm test:types
pnpm --filter www api-reference
pnpm --filter www api-reference:check
pnpm --filter www build:registry
node tooling/scripts/generate-ui-changelog-entries.mjs --write
node tooling/scripts/generate-ui-changelog-entries.mjs --check
```

Run the focused www source/type check selected by Verify Plate after registry
generation. Run generated Base/Nova and Radix/Luma install checks, then the
targeted Playwright multi-editor route for both provider variants. The current
browser test's Radix-only branch is insufficient; the implementation must prove
pointer and keyboard selection, exact editor focus, Escape/outside close, async
secondary UI, and Slash paragraph/heading/list behavior under Base and Radix.

Run `pnpm brl` only if public exports or exported files change. No benchmark is
required while the implementation remains one ref lookup and a bounded
construction-property comparison per action, with no document scan, store,
subscription, geometry, or render fan-out. If that bound changes, route through
Benchmark before acceptance.

## Documentation, doctrine, and release artifacts

- Add first-class JSDoc beside `BlockInsertOptions`, `BlockUpsertOptions`, and
  generated `insert`/`upsert` types. Document current semantics only.
- Update the smallest durable owner in `docs/vision/plate.md`: block `insert`
  semantic default, distinct `upsert`, explicit `replaceEmpty` override,
  authored-structure ownership, and the Plite structural boundary.
- Repair `.agents/rules/plate-plugin-creator/rules/capabilities.md` so plugin
  authors learn when generated block operations are safe and when an authored
  insert must own upsert. Do not edit generated `SKILL.md` files.
- Append the required immutable Plate Next doctrine version, update its current
  source pointer, and run `pnpm install` to regenerate mirrors after resolving
  the existing conflict in `.agents/rules/plate-next.mdc`.
- Determine the package changeset against current `main`. For a public
  `platejs` API/runtime delta, create one `platejs: patch` changeset; never use
  `minor` for this core package.
- Create one draft registry changelog source entry for the copied dropdown,
  toolbar, and Slash install behavior, then generate and check its JSON. Do not
  put implementation rationale or test notes in the public entry.

## Scale, risks, and rollback

The target remains O(1) in menu lifecycle state and O(k) in explicitly supplied
construction properties, where `k` is bounded by one plugin schema. It adds no
global listener, registry, cache, document traversal, or persistent state.

Material risks and their gates:

- **Injected properties misclassified as identity.** Compare only explicit
  construction input in the generic path and prove list-specific overrides plus
  alignment/line-height preservation.
- **Authored structure bypassed.** Suppress generated upsert when insert is
  authored; require the owner to publish both operations and prove its nested
  structure and selection.
- **Code Block silently no-ops.** Add the same-empty insert/upsert distinction
  before migrating callers.
- **Provider cancellation races.** Arm only after caller handlers, clear before
  callback, and run the same prevented/non-closing/submenu suite on both bases.
- **Async media inserts at the later selection.** Keep the existing anchor/block
  capture in `insertUrl` and test document changes while the prompt is open.
- **Secondary UI loses focus.** Map `focusEditor: false` to `finalFocus={false}`
  and retain async focus restoration at the secondary surface owner.
- **Generated/runtime type drift.** Change runtime merge, raw plugin types,
  mutation emission, generated declarations, and type tests in one unit.

Open risks:
- Implementation risk remains in provider event cancellation, authored
  structured inserts, injected list identity, async media target capture, and
  generated/runtime type parity. Each has a named proof gate above; no material
  design question remains open.

Rollback is one coherent revert of the Plate operation, adapter contract, and
all callers. Do not preserve `transforms.ts`, focus refs, or an alias API as a
fallback. If one authored owner cannot satisfy the contract, stop adoption for
the whole public operation and repair that owner rather than shipping mixed
semantics.

## Proof limits at design time

The source census and provider contracts are complete, but current runtime/type
execution is blocked by pre-existing conflict markers in:

- `.agents/rules/plate-next.mdc` around its doctrine version;
- `packages/plitejs/src/interfaces/editor.ts` around the editor interface.

A Bun probe currently fails on the `packages/plitejs` conflict marker before it
can load Plate. This design does not choose a side or claim runtime proof. The
implementation may edit independent source, but it cannot claim type, runtime,
doctrine, or generated-registry closure until the owning conflicts are
resolved. The global review-ledger check also has unrelated
`browser/suggestion` inventory drift; render this scope and report that existing
check limit without refreshing or rewriting unrelated inventory.

Work Checklist:

- [x] User request, design-only authority, workspace, branch, and non-publication boundary captured.
- [x] Governing review scopes and immutable records captured.
- [x] Maximum-value hard cuts applied to refs, helper, factories, catalogs, schema metadata, and Plite ownership.
- [x] Exact menu item API, precedence, cancellation, provider mapping, and nested behavior locked.
- [x] Exact Plate `insert`/`upsert` surface, type availability, matching law, semantic matrix, and explicit override locked.
- [x] Generated and authored owner dispositions locked, including Code Block and async Media edge cases.
- [x] Complete focus-ref, Insert, Slash, helper deletion, and retained-handler caller census locked.
- [x] Implementation sequence, proof matrix, docs, doctrine, release artifacts, scale, rollback, and proof limits locked.
- [x] Final pressure pass completed; injected list identity, table API compatibility, same-empty Code Block, and async media gaps resolved in the plan.
- [x] Design is ready for the Autogoal checker and source-bound execution receipt.

Verification evidence:

- Bounded `rg` census found seven `focusEditorRef` instances across More, Mode,
  two List menus, Align, Line Height, and Insert; unrelated content-level
  `onFinalFocus` handlers remain outside the cut.
- Bounded caller census found 17 Slash and 13 Insert helper recipes plus two
  manual async media replacement calculations.
- Local Base UI source confirms popup `finalFocus` and `closeOnClick`; local
  Radix source confirms cancelable item selection and `onCloseAutoFocus`.
- Plate source confirms generated element mutation typing and runtime merge;
  Plite source confirms `blocks.insertAfter(..., { replaceEmpty })` is a
  structural primitive.
- Schema/compiler inspection confirms construction-property IDs include
  injected presentation and list properties, so whole-construction equality is
  not a valid generic identity rule.
- Authored-owner inspection confirms List, Code Block, Details, Column, Table,
  and Media need owner-specific insertion, while inline custom inserts remain
  outside block upsert.
- `docs/plans/2026-09-17-table-api-design.md` preserves
  `BlockInsertOptions.replaceEmpty`; this design retains that accepted contract.
- Runtime proof is intentionally unclaimed because of the conflict markers
  listed above.

## Final handoff

- Recommendation: execute this plan as one Task-owned implementation.
- Required first gate: resolve the two existing conflict markers through their
  owning work before claiming any executable proof.
- Package target: typed block insertion in `platejs`; no semantic change in the
  Plite structural primitive.
- Registry target: item-scoped focus adapter, direct typed Insert/Slash calls,
  deleted transaction recipe, unchanged copied presentation ownership.
- Publication: N/A until separately authorized.
- Next owner: `$task` execute

## Timeline

- 2026-09-18: Goal created from the user's “go”; Task, Autogoal, complex-work,
  Best API, Plate ownership, changeset, and registry-changelog methods applied.
- 2026-09-18: Provider source, runtime types, schema compiler, structural
  primitive, authored insertion owners, all registry callers, prior table
  contract, doctrine owners, and current proof blockers inspected.
- 2026-09-18: Final API, adoption, proof, rollback, and doctrine plan locked.
