---
review_scopes: [transactions]
verdict: pursue
review_basis: [2026-10-13-transactions-tx-markers]
work_kind: implementation
review_commit: d53a8810369603967229766e1b6b192b2d08c368
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plite.md, packages/plitejs/src/core/public-state.ts, packages/plitejs/src/core/editor-schema.ts, packages/plitejs/src/core/schema-compiler.ts, packages/plitejs/src/core/schema-validation.ts, packages/plitejs/src/editor/insert-default-child.ts, packages/plitejs/src/core/editor-commands.ts, packages/plitejs/src/transforms-node/set-nodes.ts, packages/plitejs/src/dom/plugin/data-transfer-format.ts, packages/plitejs/src/yjs/core/plugin.ts, packages/plitejs/src/editor-runtime-view.ts, packages/plitejs/src/interfaces/editor.ts, packages/plitejs/test/transforms-contract.ts, packages/plitejs/test/break-exit.test.ts, packages/platejs/src/internal/plugin/OverridePlugin.ts, packages/platejs/src/internal/plugin/resolvePlugins.ts, packages/platejs/src/lib/editor/pluginRuntimeTypes.ts, packages/platejs/src/lib/plugin/PluginDefinition.ts, packages/platejs/src/lib/plugins/element-id/ElementIdPlugin.ts, packages/platejs/src/lib/plugins/input-rules/createInputRules.ts, packages/platejs/src/react/plugins/paragraph/ParagraphPlugin.tsx, packages/platejs/src/features/basic-nodes/lib/BaseHeadingPlugins.ts, packages/platejs/src/lib/plugins/html/HtmlPlugin.ts, packages/platejs/src/markdown/lib/internal/markdownIntrinsics.ts, apps/www/src/registry/components/editor/turn-into-toolbar-button.tsx, apps/www/src/registry/components/editor/block-menu.tsx, apps/www/src/registry/components/editor/slash.tsx, content/docs/api/editor-transforms.mdx, content/docs/plite/api/transforms.mdx, docs/plans/2026-08-26-media-caption-block-reset-api.md, docs/plans/2026-10-13-pr-5165-redo.md, docs/plans/2026-10-14-nested-defaults.md]
review_upstreams: ['../prosemirror-commands@52a84a842774fadec3b167bcdbd56085ec6c85df', '../prosemirror-model@6264de069d8439131e88f8ba06973551916184e4', '../prosemirror-transform@662b7a937bafde19b7e2a83241dbc8888e257c89', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../slate@945a484df2497e4c448b33f417b0de2a49840032']
---

# Transactions: reset refuses without a default

Status: waiting: on the timing rerun under a quiet machine and the decision-trail review
Playbook: plan

**Pursue. `tx.blocks.reset` and the turn-off branch of `tx.blocks.toggle` should return `false` with nothing changed when a target has no default block it can become, instead of throwing.** Reset already returns `false` when the default is not allowed where a block sits. Only a missing default still throws, so a caller gets `false` for one kind of "cannot reset here" and an exception for the other. Enter on a block void and `tx.break.exit` already refuse a missing default, and the Vision states that law for exit. The throw dates from the [media caption plan](2026-08-26-media-caption-block-reset-api.md), whose reset returned nothing and whose proof table called a silent no-op a defect. [PR 5165](2026-10-13-pr-5165-redo.md) gave reset a `false` result, so a refusal is no longer silent. The owner set this question aside there as the `reset refuses` alternative and offered it as this task.

The first plan panel found that reset also overwrites every property meant to survive a type change. Reset builds a fresh default block and copies all of its properties onto the target. Plate's `ElementIdPlugin` declares its `id` with a generator and that lifecycle, so today every reset, paragraph shortcut and heading toggle-off gives the block a new id. `architect` ran a second time with that outcome. Its judge picked a design where reset asks the schema for the default's properties, seeded with what the block keeps, without building the default's children. Plate's generated element toggle now answers whether it applied. Two more panel rounds tightened that design. An error a user's generator throws still escapes, reset never drops a block's type before keeping its properties, a block that is already the default type keeps the values the schema cannot fill, and reset checks the converted block's text before it writes. The judge's pick also made the public `createDefaultChild` answer `null`, but each round found more of its consumers whose behavior that changes, so it moves to a follow-up with typing, paste and the HTML and Markdown readers.

## Brief

### What will change?

Resetting a block or turning its type off no longer crashes when its container has no default block; it answers no. Reset keeps the block's id. One function decides what blocks keep on type changes. It's uncommitted in your checkout.

### What could go wrong?

A schema missing a default now fails quietly. Follow-up tasks cover typing over such a block, a rare toggle return, and a container default losing its settings. Speed on big documents is unproven. One review finding stays open.

## Teach

Reset turns a block back into the plain block its container expects, such as a heading back into a paragraph. The container's schema names that block. Turning a block type off, such as clicking Heading again, uses the same step.

Today reset builds a whole new default block and copies all its properties onto yours. That crashes when the container names no block, names plain text, or names a block that needs a value nobody supplies. It also replaces values meant to survive, such as the block's id.

After this change, reset asks the schema only for the new block's properties, starting from what your block keeps, and checks your block's text against its new type. It answers no in those cases, as Enter after an image already does. A real schema bug still throws.

## Public API

A reset under a parent with no element default now returns `false` and leaves the document as it was.

```ts before
// packages/plitejs/test/transforms-contract.ts
assert.throws(
  () => editor.update.blocks.reset({ at: [0] }),
  /element default/
);
```

```ts after
// packages/plitejs/test/transforms-contract.ts
editor.update((tx) => {
  tx.selection.setNodes([[0, 0], [1]]);
  reset = tx.blocks.reset();
  draft = tx.children();
});

assert.equal(reset, false);
assert.deepEqual(draft, before);
```

Plate's generated element toggle returns whether it applied, and collapses the selection only then.

```ts before
// packages/platejs/src/internal/plugin/compilePlateModel.spec.ts
element.update.toggle({ at: [0] });
```

```ts after
// packages/platejs/src/internal/plugin/compilePlateModel.spec.ts
expect(element.update.toggle({ at: [0] })).toBe(true);
```

## What other editors do

This review read the ProseMirror (`prosemirror-commands` `52a84a842`, `prosemirror-model` `6264de069`, `prosemirror-transform` `662b7a937`), Tiptap (`91c51be53`), Lexical (`dd5c41b13`) and Slate (`945a484df`) checkouts beside the repository and ran none of them. None throws when a container has no default block to convert to.

| Editor | A command that turns a block into its container's default block, when the container has none |
| --- | --- |
| ProseMirror | `defaultBlockAt` returns `null` for a content match with no textblock default, skipping types with required attributes, and `exitCode` and `createParagraphNear` then return `false` (`prosemirror-commands` `src/commands.ts:297`); `ContentMatch.defaultType` skips text and types with required attributes and returns `null` (`prosemirror-model` `src/content.ts:57`) |
| Tiptap | `clearNodes` reads `contentMatchAt(index).defaultType` (`packages/core/src/commands/clearNodes.ts:45`); when it is `null`, `setNodeMarkup` keeps the node's own type (`prosemirror-transform` `src/structure.ts:176`), and the command still returns `true` (line 56) |
| Lexical | No schema default; `$setBlocksType` takes the caller's element factory (`packages/lexical-selection/src/range-selection.ts:132`) |
| Slate | No schema default and no reset; transforms set the props the caller passes |
| Plite today | Reset throws `must declare an element default`; Enter on a void and `tx.break.exit` refuse |

ProseMirror is the closest model. A missing default, or a default that needs attributes nobody supplies, makes its command return `false`. `setNodeMarkup` also keeps the node's attributes unless the caller passes new ones, so a block's identity survives a type change there too.

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| The schema's two build-time required-property checks throw a private error class, a generator's error never carries it out, and an internal read, `tryCreateDefaultChild`, returns `null` for that class where `createDefaultChild` throws | Plite | `plitejs` core: `src/core/editor-schema.ts`, on `InternalEditorSchemaApi` | One builder and one refusal rule for every path that refuses today; the public read keeps its contract until the follow-up decides it |
| A new internal schema member, `elementPropertiesForResetAt`, returns the properties a block takes when reset converts it to its slot's default, or `null` | Plite | `plitejs` core: `src/core/editor-schema.ts`, on `InternalEditorSchemaApi` | Converting a block is a different operation from building a child: it keeps the block's children and the properties its type change preserves, and builds no new children |
| Reset and turn-off prepare every target's write, refuse when any target refuses or fails placement, and write exactly that list | Plite | `plitejs` core: `src/core/public-state.ts` | Reset and toggle-off own their all-or-nothing admission; toggle stops building each default twice |
| `buildDefaultChild` calls `tryCreateDefaultChild` and drops its own catch | Plite | `plitejs` editor: `src/editor/insert-default-child.ts` | Enter on a void and leaving a block share reset's refusal rule |
| The generated element toggle returns whether it applied and collapses only then | Plate | `platejs`: `src/internal/plugin/resolvePlugins.ts`, `src/lib/editor/pluginRuntimeTypes.ts` | A refused toggle no longer moves the selection, as Plite's own `block.toggle` command already guards its collapse, and a caller can check the result |
| `break.splitReset` and the `delete.empty` reset rule keep their split or delete when reset refuses | Plate | `platejs`: `src/lib/plugin/PluginDefinition.ts` JSDoc only | `OverridePlugin` already ignores reset's result; the rules now say so |

Every change stays in the module that owns it today. `tryCreateDefaultChild` and `elementPropertiesForResetAt` sit beside `createDefaultChild` and `elementForTypeChangeAt` on the internal schema object that `getEditorSchema` returns, so no new export or import edge appears.

## Hard cuts and app migration

- `tx.blocks.reset` and the turn-off branch of `tx.blocks.toggle`, including `editor.update.blocks.*` and an editor view's copies, stop throwing when a target's parent or root has no element default, has a text default, has a default whose required property neither the schema nor the block supplies, or would leave the block's text without a property its new type requires. They return `false` and write nothing. Every other failure to build a default still throws.
- Reset and turn-off keep each property whose schema lifecycle preserves it through a type change, such as Plate's element `id`, and no longer run its generator. A block that is already the default type keeps the values the schema cannot fill, and gets the default or generated value for the rest, as today.
- Enter on a block void and `tx.break.exit` now throw an error a property generator throws, even one whose diagnostics are all `missing-property`, where they refused it before.
- Plate's generated element toggle, `editor.plugin(X).update.toggle(options)`, returns `boolean` instead of `void`.
- `state.schema.createDefaultChild` keeps its contract, so typing, paste, slice fitting, Yjs and Plate's HTML and Markdown readers keep today's behavior.
- No caller in the repository catches the old error. `OverridePlugin`'s `break.empty` and delete reset actions fall through to the default command in these cases. Its `break.splitReset` and `delete.empty` extensions keep the split or delete, and the block keeps its type. The paragraph shortcut consumes its key and changes nothing, and Plate's input rules decline.
- App code that caught the error to detect a schema without a default checks the result instead:

```ts
// before
try {
  editor.update.blocks.reset();
} catch {
  // no default here
}

// after
if (!editor.update.blocks.reset()) {
  // no default here, or the default is not allowed in place
}
```

## Main changes

- Two of the schema's required-property checks run while it builds: the element check in `createDeclarativeAndFill`, and the branch of `canonicalizeDeclarativePropertyRecord` that runs without a validation location. Both throw a private subclass of `EditorSchemaValidationError` that means a required property is missing. The second also runs when an update finishes, where nothing reads the class. Each place that calls a property generator rethrows a subclass error from it as a plain `EditorSchemaValidationError`, so a generator that calls `schema.create` cannot pass the class out.
- One local helper runs a build and returns `null` only for that subclass. One `resolveDefaultSlot(at, root)` returns no default, a text default, or the slot's type, properties and site, including today's fallback to the root slot for a parent without content. `createDefaultChild` builds from it and throws as today. `tryCreateDefaultChild` builds from it through the helper.
- `elementPropertiesForResetAt(element, at, root?)` resolves the same slot. It seeds with what `elementForTypeChangeAt` keeps from the block for the default type. When that type is the block's own type, it also keeps the block's values for properties with no default and no generator. The slot's properties override the seed. It runs `canonicalizeDeclarativePropertyRecord` on that record, so the rest get their default or generated value, no generator runs for a kept key, and no child is built. It then canonicalizes the block as `elementForTypeChangeAt` converts it, which is what `setNodes` will write. A text property the new type requires and the kept text lacks then refuses through the helper. It returns the properties, `type` included, or `null`. Round 1 of the diff panel changed this check in three ways. It reads the target's real ancestors, as the type change and the update's final canonicalization do. It runs only when the type changes, because `setNodes` leaves the text alone otherwise. It canonicalizes the whole converted subtree, so it also checks text inside an inline. Round 2 replaced the same-type skip with a check of the children as they are, and round 3 put the skip back. A write that keeps the type leaves the text alone. So that check refused only over a defect an earlier edit in the same update left, which reset neither causes nor repairs. It also dropped a reset that a later edit in the update would have made valid.
- `getDefaultBlockProps`, `getBlockReset` and the `must declare an element default` error are deleted. One `prepareBlockResets` passes each target to `elementPropertiesForResetAt` without its `unset` keys, and never drops `type`, since toggle-off passes the toggle's own keys. It keeps reset's existing eager map, so every target is prepared before any refusal is read and a later target's real error still throws. Each write still unsets the caller's keys that the new properties do not set. It returns `null` if any target refused or `canApplyBlockProps` refuses its write. The prepared properties are typed as element properties. The approved plan also dropped the `as never` cast in `writeBlockProps`. The build keeps it, because `setNodes` types its properties by the editor's own value type, which a schema read cannot name.
- `canApplyBlockProps` skips an `unset` key that `setNodes` never writes, such as `children` or `text`. It reads them from `NON_SETTABLE_NODE_PROPERTIES`, which `set-nodes.ts` now exports as a read-only set. Round 2 of the diff panel added this. Before it, an `unset` that named `children` removed the children from the placement candidate, so reset refused a valid block in a leading slot. Round 2 skipped the same keys in the props too, which changed only `blocks.set` and toggle-on, since reset never passes them; round 3 removed that half.
- `resetBlocks` writes that list. `toggleBlock` without `wrap` prepares the same list when turning off, or the toggle props when turning on, checks it, and writes it, so turn-off builds each default once. In the main checkout, another session's uncommitted `applyBlockPatches` checks placement for every patch and then writes them, so there `prepareBlockResets` returns `null` only for a target that refused and hands its list to that helper.
- `buildDefaultChild` calls `tryCreateDefaultChild` and drops its try and catch and the `EditorSchemaValidationError` import.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Reset and toggle-off with no buildable default | Throw a plain `Error`, or let `missing-property` escape | Return `false`, write nothing | `public-state.ts` | One outcome for "cannot reset here"; every caller handles `false` | Docs, JSDoc, Vision and changeset | Contract cases red at base, green after | A schema without a default fails quietly | rearchitect |
| Properties a type change preserves, on reset | Overwritten by the default's generated or default value | Kept; their generators do not run | `editor-schema.ts` | The Vision says reset converts through the type-change lifecycle | Reset and toggle-off | The kept-id case red at base | A slot property still wins over a kept one | fix |
| Refusing a default the schema cannot fill | A diagnostics catch in `buildDefaultChild` | A private error class and one internal read | `editor-schema.ts` | A generator's own error must throw | Reset, toggle-off, Enter and exit | Exit cases red at base | A generator that hides an error some other way | move |
| `createDefaultChild` with missing required properties | Throws `missing-property` | Unchanged | `editor-schema.ts` | Its consumers each need their own proof | None | Unchanged break-exit case | Typing over a pick still crashes | defer |
| Generated element toggle | Collapses after any toggle, returns nothing | Collapses after an applied toggle, returns the result | `resolvePlugins.ts` | A refused toggle must not move the selection | Plate only | A Plate spec red at base | Callers that typed the result as `void` | fix |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| A container with no default block | Reset and turn-off do nothing and answer no | Keep the crash, as the August media caption plan asked | keep-throw | small |
| A default that needs a value nobody supplies | Reset and turn-off answer no, as Enter and leaving a block already do | Keep crashing there | strict default | small |
| Where the "can it be built" rule lives | One check that reset, turning a type off, Enter and leaving a block share; the builder that typing, paste and Plate's readers use still crashes for now (look) | Make that builder answer no as well, which changes typing, paste, Yjs and Plate's readers | builder refuses | small |
| A value meant to survive a type change, such as a block's id | Reset keeps the block's value and never runs its generator | Rebuild it from the default, as today | regenerate | small |
| A value the container's slot fixes, such as a title's heading level | The slot's value wins over the block's | Keep the block's value and refuse the reset | block wins | detail |
| A block that is already the default type | It keeps values the schema can't fill and gets defaults for the rest, as today | Keep every value it has | keep all | detail |
| A property the caller asks reset to remove, when the default also sets it | The default sets its own value | Keep the block's value | unset keeps | detail |
| A real schema bug while building a default | Still crashes, even after another selected block answered no, and so does any error a generator throws | Answer no for every build error | swallow all | detail |
| Text missing a value its new block type needs | Reset answers no | Let the edit crash when it finishes, as changing a block's type does | crash text | detail |
| Enter splitting a heading, or Backspace emptying one, where the container has no default | Keep the split or delete; the block keeps its type | Refuse the whole key press | refuse together | small |
| Enter at the start of a heading | The empty line Enter leaves behind keeps the heading's id, and the heading's text gets a new id | Move the id with the text | id follows text | detail |
| Plate's generated element toggle | Answers whether it applied, and collapses the selection only then | Return nothing and always collapse | keep collapse | detail |
| Build after the plan | Build now and hand back a patch | Stop once the plan is written | hold | detail |
| Where the change goes | I apply the change to your main checkout myself and commit nothing, as a rule added during this run asks; the plan first said I'd hand you a patch file | Hand you the patch file to apply | hand patch | detail |
| The subject page link | A new page at https://claude.ai/artifact/UyTPH4Nq4nrA3Hjzs4uz2w, because the earlier ones at https://claude.ai/artifact/GLdTzJqsVjF9661VrzcBXX and https://claude.ai/artifact/HcWE7ANEonTn1Jbdn8WEGU no longer open | Leave the page unpublished | drop page | detail |

## Steps

- [x] Contract cases. In `packages/plitejs/test/transforms-contract.ts`: toggle turns a block on where turning it off has no default, and refuses turning off two targets with the draft unchanged; toggle builds each default once and writes the one it checked; toggle and reset each throw a later target's bad generated value after an earlier target refused; reset refuses two targets with the draft unchanged; reset and toggle-off keep a preserved generated id and never call its generator; reset keeps a required property of a block already of the default type; a same-type reset still restores a property with a default; reset converts a block whose kept text carries a required text property that a fresh default could not fill; reset refuses, with the draft unchanged, when the kept text lacks a text property the new type requires; reset refuses a default that needs a property it cannot fill; reset refuses a text default; reset keeps a required property the type change carries and refuses when the lifecycle drops it; a type-changing reset removes an `unset` property the type change would keep. In `packages/plitejs/test/break-exit.test.ts`: Enter throws a generator's own `missing-property` error, and one a generator passes out of `schema.create`; Enter changes nothing when the default's text needs a property. Proof: each fails at the base `d53a881036` through `proof-worktree.mjs --with` and `--expect-fail`, or, for a case the base already passes, fails under its named mutation in the next step.
  - Closed by `docs/plans/artifacts/2026-10-15-transactions-reset-default/base/red-contract-a2.log` (12 of the 14 new contract cases fail at `d53a881036`) and `docs/plans/artifacts/2026-10-15-transactions-reset-default/base/red-exit-a2.log` (the two throw cases fail). The three cases the base passes fail under the `write-time-unset`, `same-type-keeps-all` and `class-at-record-check-exit` mutants in `docs/plans/artifacts/2026-10-15-transactions-reset-default/mutate-slice1-proof-a2.log` and `docs/plans/artifacts/2026-10-15-transactions-reset-default/mutate-slice1b-proof-a2.log`.
- [x] The private error class and its generator boundary, `resolveDefaultSlot`, `tryCreateDefaultChild`, `elementPropertiesForResetAt`, `prepareBlockResets`, `resetBlocks`, `toggleBlock` and `buildDefaultChild`, as Main changes says. Proof: the reset and toggle cases and `break-exit.test.ts` pass, and `mutate.mjs` reverts each part alone and sees its case fail: the class at each of its two checks, the generator boundary, the seed, the same-type seed, the converted-text check, keeping `type` in the `unset` filter, the write-time unset, the eager map, the single toggle build and building no children.
  - Closed by `docs/plans/artifacts/2026-10-15-transactions-reset-default/mutate-slice1-proof-a2.log` and `docs/plans/artifacts/2026-10-15-transactions-reset-default/mutate-slice1b-proof-a2.log` on the slice freeze `7e038dc492`: both controls pass (25 contract cases, 39 exit cases) and all 13 mutants are caught, each failing its named case.
- [x] Plate: the generated toggle returns its result and collapses only after `true`, with its type in `pluginRuntimeTypes.ts`; one spec in `compilePlateModel.spec.ts` where a toggle is refused by placement with `collapse: true`; two specs in `OverridePlugin.spec.tsx` where Enter at the end of a heading and Backspace emptying a heading in a container with no default keep the split or delete as one undo step; the `splitReset` and `delete.empty` JSDoc in `PluginDefinition.ts`. Proof: the toggle spec fails at base by collapsing and the Override specs by throwing, all pass after, and the toggle spec fails with the guard reverted.
  - Closed by `docs/plans/artifacts/2026-10-15-transactions-reset-default/base/red-plate-a1.log` (at `d53a881036` the toggle spec fails with the focus collapsed from offset 3 to 1, and both Override specs throw the old error) and `docs/plans/artifacts/2026-10-15-transactions-reset-default/mutate-slice2-proof-a2.log` (on the slice freeze `4328eb9a3f` the control passes and the guard mutant fails the toggle spec).
- [x] JSDoc for reset and toggle in `packages/plitejs/src/interfaces/editor.ts` and for the new internal members; the reset rule in `docs/vision/plite.md`; the reset and toggle sections of `content/docs/api/editor-transforms.mdx` and `content/docs/plite/api/transforms.mdx`, through `plate-docs`. Proof: the docs checks `plate-docs` names, `stale-claims.mjs` and `teaching-sweep.mjs` for `must declare an element default`, and `best-api repair`.
  - Closed by `docs/plans/artifacts/2026-10-15-transactions-reset-default/build-source-a1.log`, `docs/plans/artifacts/2026-10-15-transactions-reset-default/docs-source-parity-a1.log`, `docs/plans/artifacts/2026-10-15-transactions-reset-default/stale-claims-a1.log` and `docs/plans/artifacts/2026-10-15-transactions-reset-default/teaching-sweep-a1.log`, whose live hits for the old sentence are this plan's history lines and the generated files Step 5 regenerates. `best-api repair` also put the generic toggle's result in `docs/vision/plate.md`. The build's `no-comments` pass cut the new internal members' JSDoc (`docs/plans/artifacts/2026-10-15-transactions-reset-default/no-comments-build.md`). Round 1 of the diff panel put it back, because `CODING_STANDARDS.md` keeps a reason the code does not show (`docs/plans/artifacts/2026-10-15-transactions-reset-default/no-comments-r1/reply.md`).
- [x] Regenerate the registry docs output that carries the old sentence. Proof: `pnpm check` steps for generated output pass on the patch.
  - Closed by `docs/plans/artifacts/2026-10-15-transactions-reset-default/build-registry-check-a1.log` (the registry generation is fresh) and `docs/plans/artifacts/2026-10-15-transactions-reset-default/api-reference-check-a1.log` (`api-reference --check` passes in an installed worktree at `d53a881036` with this build's sources and manifest, after building `plitejs` and `platejs`). The manifest itself came from `docs/plans/artifacts/2026-10-15-transactions-reset-default/api-reference-regen-a1.log`, and it differs from the base only by this build's JSDoc.
- [x] Changesets for `plitejs` and `platejs` through `changeset`. Proof: its own check.
  - Closed by amending `.changeset/plite-canonical-architecture.md` and `.changeset/plugin-portal-scoped-api.md`, which already describe reset and the generic toggle and which `.changeset/pre.json` does not list as shipped; the `changeset` skill names no check script, and no `pnpm check` step reads changesets.
- [x] Package proof: `plitejs` bun suite and typecheck, `platejs` bun suite and typecheck, and the three registry reset specs, each beside a fresh base control at `d53a881036`. Proof: no new failure against the base failure lists, compared by name and reason.
  - Closed by `docs/plans/artifacts/2026-10-15-transactions-reset-default/package/final-tree-a1.log` on the final tree `2d89df477f`: `plitejs` passes 3623 against the base's 3598 with the same 37 failures, `platejs` passes 3446 against 3443 with the same 18 failures, compared by name and first error line in `package/final-plitejs.reasons` and `package/final-platejs.reasons`, and the three registry specs pass 4, 12 and 17 at both. The typecheck of both packages fails with the same 8 errors at the base and on this tree, in `docs/plans/artifacts/2026-10-15-transactions-reset-default/checks/typecheck-continue-a1.log` and `checks/base-typecheck-continue-a1.log`. The patch lands on `b1e70bb257`, so the proof ran again there on the frozen code `b262fa3b8b`: `docs/plans/artifacts/2026-10-15-transactions-reset-default/package/landing-cand-plitejs-bun-a1.log` passes 3621 against the base's 3596 with the same 39 failures, `docs/plans/artifacts/2026-10-15-transactions-reset-default/package/landing-cand-platejs-bun-a1.log` 3446 against 3443 with the same 18, both compared by name and reason in `landing/landing-*-plitejs.reasons` and `landing/landing-*-platejs.reasons`, the three registry specs pass at both, and the typecheck fails only in plitejs's test files with the same 6 errors at both (`docs/plans/artifacts/2026-10-15-transactions-reset-default/landing/landing-cand-typecheck-a1.log`).

### Completion Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| Base controls fail today for every behavior step | yes | Step 1's closing line |
| `blast-radius` before code moved | yes | the plan row "blast radius"; `docs/plans/artifacts/2026-10-15-transactions-reset-default/blast/` |
| Each slice frozen before the next | yes | slice 1 `7e038dc492`; slice 2 `4328eb9a3f` |
| `thermos` after each slice | no | skip: the `api-build` row owes a panel on the diff, whose seats apply both lenses |
| Hard-cut sweep of callers, exports, tests, docs, examples, browser proof and benchmarks | yes | `docs/plans/artifacts/2026-10-15-transactions-reset-default/hard-cut-sweep-a2.log` finds no `getDefaultBlockProps`, `getBlockReset` or "must declare an element default" outside plans, where `docs/plans/artifacts/2026-10-15-transactions-reset-default/hard-cut-sweep-base-a1.log` finds 12 at the base; `docs/plans/artifacts/2026-10-15-transactions-reset-default/hard-cut-callers-a2.log` lists every reset and toggle caller outside tests, and none reads a throw |
| `best-api repair` | yes | the decision log's best-api repair row; round 3 narrowed the reset law in the same five places |
| `plate-docs` on both transforms pages, with its example coverage audit | yes | the decision log's coverage audit row: both pages cover each refusal, what still throws and what reset keeps; the heading page's missing refusal note goes to t_8e3e5537 |
| Hand drive of the changed docs pages | yes | `docs/plans/artifacts/2026-10-15-transactions-reset-default/hand-drive-check-a1.log` covers both transforms pages and `/blocks/basic-nodes-demo` at 1280 px in light, on `b1e70bb257` |
| Benchmark performance pack | yes | gate: round 1's check canonicalizes each converted block's subtree, so reset does more per block. The pre-acceptance probe `docs/plans/artifacts/2026-10-15-transactions-reset-default/perf/paired-config.json` resets every block of five cohorts in one update and freezes candidate over base at 1.5 per cohort. Its first run, `perf/paired-a2.log`, is inconclusive at a one-minute load of 30.79. The second, `docs/plans/artifacts/2026-10-15-transactions-reset-default/perf/paired-a3.log`, ran on the final tree with four more cohorts for the shared member and is inconclusive at a load that reached 334.86; in its one packet under a load of 9, candidate over base was 1.24 on pathological-marks, 1.17 on pathological and at most 1.11 on the other seven, one sample each with no noise estimate. `perf/run-when-quiet.sh` reruns it once the load stays at or under 6 for three minutes, and a conclusive miss sends the design back to `architect` |
| `pnpm check` steps the edits reach, before the package proof | yes | `docs/plans/artifacts/2026-10-15-transactions-reset-default/checks/`: skill-mirrors, registry-changelog and entrypoint-graph pass; review-ledger, knowledge, type-tests, public-types, lint-baseline, core-audits and typecheck fail the same way at `d53a881036`. At the landing base `b1e70bb257`, `docs/plans/artifacts/2026-10-15-transactions-reset-default/landing/` shows type-tests passing and typecheck, public-types, lint-baseline and core-audits failing the same way at both; t_3ea68f2e, t_54844d26 and t_ed79a18b own them |
| `oxlint --type-aware` on the task's files before each panel freeze | yes | the verify rows before each freeze; the last is `oxlint-task-a5.log` before round 3 |
| Changesets for `plitejs` and `platejs` | yes | `.changeset/plite-canonical-architecture.md` and `.changeset/plugin-portal-scoped-api.md`, both unreleased entries amended in place |
| Build panel on the diff (`api-build`) | yes | three rounds, the cap, and round 3 raised no critical finding; [the type-change correction](2026-10-15-type-change-copy-lint.md)'s rounds 2 and 3 reviewed round 3's fixes with the shared member, and found no critical finding in round 3 |
| Writing passes | yes | the decision log's writing rows for the build and each diff round; the correction's writing rows for the member and round 3's fixes |
| `pnpm lint:fix` as the last check that edits code | yes | `pnpm lint:task` on the task's 13 TypeScript files, `docs/plans/artifacts/2026-10-15-transactions-reset-default/lint-task-final-a1.log`, because other sessions' files share the tree; it rewrapped three test files and changed no source |
| Decision-trail review | yes | pending |

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's metadata.

This review read the checkout at `d75afba2a8` on `next` through a worktree detached there, then moved to `d53a881036` after the owner rewrote `next`; that move changed no reset, toggle or default-building code, and the red cases still fail there. It retains the scope's head review, [the tx-markers plan](2026-10-13-transactions-tx-markers.md), whose questions are about plugin method markers and are unchanged by this one. It reopens one requirement of [the media caption plan](2026-08-26-media-caption-block-reset-api.md), line 189: "throw deterministically when the parent/root has no element default". It reads [the PR 5165 redo](2026-10-13-pr-5165-redo.md), whose Defaults row "Paragraph shortcut when the selection covers a title and a block in a container with no default type" offered this change as `reset refuses`, and [the nested defaults plan](2026-10-14-nested-defaults.md), which made `state.schema.createDefaultChild` the one read that builds a default block. That plan's Open work item about which block the reset error names goes away with the error; it stays on that plan as history.

### Requirements

- Reset converts each target to its immediate parent's or root's default through the property type-change lifecycle, keeps children, selection and the live `NodeKey`, checks every target before it writes, and returns `false` with nothing changed when one target's default is not allowed where it sits. The update does not roll back, so a composing caller checks the result. Reset takes no type or mode option and no feature publishes an alias for it (`docs/vision/plite.md`, the `tx.blocks.reset` rule).
- The default block that Enter on a block void or `tx.break.exit` creates changes nothing on a refused placement, a required property the default cannot fill, or a default whose caret path ends without text, and any other failure to build the default throws. Typing or plain-text paste over picked blocks builds each new block the same way, and `createDefaultChild` is the one read that builds a default block (`docs/vision/plite.md`, the default block rule).
- A robustness claim matches the owner's supported input domain (`docs/vision/common.md`, Taste). Optional content may declare no default (`schema-compiler.ts:2343`), a container may default to text while holding blocks, and the compiler accepts a default whose type has a required property (`break-exit.test.ts:782-800`).
- One way per operation, no alias (`VISION.md`, Invariants and Common Essentials).
- Plite owns the neutral editing law, and Plate keeps its own guards (`VISION.md`, Boundary Law).

### Lanes

- **Reset converts through its own schema member, and one internal read refuses for reset, turn-off, Enter and exit. Picked.** The replay judge scored this conversion highest. It is the only design that keeps a block's preserved properties without running their generators and builds no children that reset throws away. The judge's pick also made the public `createDefaultChild` refuse; round 3 moved that to the follow-up.
- **One internal resolver beside a strict public `createDefaultChild`.** The Opus replay runner's pick. It keeps the public contract but leaves two reads that build a default inside Plite, against the Vision's "one read".
- **`createDefaultChild` takes `from`, `unset` and `text` options.** The Sol replay runner's pick. It lets an app hand-build a reset from the read and `setNodes`, a second way to do one task.
- **A helper beside a strict `createDefaultChild`, shared by reset, toggle-off and `buildDefaultChild`.** The first arena's pick. Loses: it keeps rebuilding preserved properties, and it leaves typing throwing where exit refuses.
- **Keep the throw.** Loses. Its job was to avoid a silent no-op while reset returned nothing; `false` now does that job.
- **Require every block-holding content program to declare a default.** Loses. Optional content has no job that needs one, it breaks schemas that compile today, and it leaves the text and required-property cases.
- **Fall back to the root's default, or a paragraph.** Loses. It writes a block the container never named.
- **A `canReset` read for callers to check first.** Loses. A second step every caller must remember.

Proof limits: the runners and judges read code and ran nothing. The blast-radius prototype refused in `getDefaultBlockProps` and did not run the final design.

### Plan panel

Round 1 ran on the first pick with three seats, Opus at high effort and Astra and Sol at xhigh, all answering. Two findings were critical. Opus showed reset overwrites a preserved generated id; the lead reproduced it at the base. Astra and Sol showed that an empty diagnostics list would be swallowed as a refusal, which Opus also raised as a nit. Every seat asked for direct proof of Plate's split and delete rules after a refused reset, and two asked for proof that toggle builds once and refuses without touching the draft.

The challenge delta is `replaced`. The rejected target was a refusing helper beside a strict `createDefaultChild`, with reset still copying a freshly built default. The new target makes `createDefaultChild` refuse a default it cannot fill and converts a block through `elementPropertiesForResetAt`, seeded with what the block keeps. The decisive evidence was the kept-id case, which fails at the base and would still fail under every first-arena design. All three replay runners also seeded reset from the block. The base, which throws and regenerates ids, still loses on every outcome.

The lead changed two parts of the replay judge's pick. It keeps the slot's properties over the block's, as reset does today, where the judge's base let the block's win and refused. It drops `unset` keys other than `type` before retention, so the default supplies its own value for them.

Round 2 ran on the replaced plan with the same three seats, all answering. It raised three critical findings. Astra and Sol showed that dropping toggle's `unset` keys before retention would drop `type`, so the lifecycle would lose the id again. The plan now keeps `type`, and the kept-id case asserts the generator never runs. Astra and Sol also showed that a diagnostic-code check would swallow an error a user's generator throws. The plan now takes the judge's graft after all: the schema's two build-time required checks throw a private error class. The lead had first rejected that graft because the text-property check at `editor-schema.ts:2449` also fires during a build, as the probe in `probes/text-required.probe.test.ts` shows. Opus confirmed that only that check and `:1759` fire while building, so the class marks both. Astra's third finding, that reset says yes and then throws when a kept text lacks a text property its new type requires, is dismissed. A plain type change throws there today, and so does today's reset (`probes/type-change-text-required.probe.test.ts`); reset converts through that lifecycle, as the Vision says, so the fix belongs with the type change and goes to the follow-up. The round also moved reset's property build onto `canonicalizeDeclarativePropertyRecord` behind one slot resolver, seeded a same-type reset from the block itself, and added the cases that tell this design from building the whole default.

Round 3 ran with the same three seats, all answering, and reached the cap of three plan rounds. Astra and Sol raised three critical findings, all applied. A generator that calls strict `schema.create` could still pass the private class out, so each generator call now strips it. Reset said yes and then threw when the kept text lacked a text property its new type requires, where today's reset fails before it writes, so reset now checks the converted text first; this reverses round 2's dismissal. Making the public `createDefaultChild` answer `null` would let the Markdown serializer drop a valid paragraph under its allow-loss policy. Each round had found more consumers that change, so the public read keeps its contract and the change moves to the follow-up. That cut keeps the margin over the base, which fails every red case. Opus's warnings added a case for the text-property refusal, kept same-type resets restoring defaulted values, kept the write-time `unset`, and fixed stale lines. Astra showed the fresh-children case targeted a nested block; it now converts a leaf block whose kept text carries a required text property. These changes after the cap get their review in the diff panel after the build.

### Three realistic failures

- An app catches reset's error to find schemas without a default. It now gets `false`. The changeset and both docs pages say so.
- A composing caller ignores reset's result and commits the rest of its change where the old throw aborted the update. In this repository that is `OverridePlugin`'s split-reset and delete extensions, which keep the split or delete, and the generated toggle, which this plan guards.
- A real schema bug inside default construction is swallowed as a refusal. Only the schema's own build-time required checks throw the private error the refusal reads, and each generator call strips it, so a generator's error escapes, and the mixed-target cases fail under a catch-all mutation.

Rollback is reverting the patch, which restores the throw and the regenerated ids.

### Blast radius

This change is safe because nothing depends on reset or toggle-off throwing. `git grep` finds every caller treating `false` as a refusal or ignoring it, and none catching the error. `createDefaultChild` keeps its contract, so its consumers outside reset, Enter and exit do not change. A prototype that refuses the three cases in reset ran the `plitejs` bun suite (3620 pass), the `platejs` bun suite (3441 pass) and the three registry reset specs (33 pass) at `d75afba2a8`, and its failure lists matched a base worktree exactly. The final design gets a fresh base control at `d53a881036` in the last step.

### Dependents

`lookup transactions` lists no dependent scope. The consumers outside `plitejs` that call reset, toggle-off or `createDefaultChild` are read. `OverridePlugin.ts` falls through to the default command when the reset in `break.empty` or the delete reset action returns `false`, and keeps the split or delete when the reset in `break.splitReset` or `delete.empty` refuses. `ParagraphPlugin.tsx` ignores the result and consumes the key. `BaseHeadingPlugins.ts` returns it. `createInputRules.ts` declines. `resolvePlugins.ts` ignores it and then collapses the selection, which this plan guards. The three registry menus return early on `false`. `HtmlPlugin.ts`, `markdownIntrinsics.ts` and the Markdown serializer call `createDefaultChild`, which keeps its contract, so they do not change.

## Open work

Each item below is a suggested task in `docs/plans/suggested-tasks.decisions.tsv` that waits on this task landing. owner: zbeyens. stop: the task is started or dropped.

- t_05abbbd8 Make reset prepare each default once and refuse inline mismatches (xhigh). Reset's check runs a generator for a key the new type adds and throws the value away, so it runs again at commit. A property inside an inline that the new ancestry rejects makes reset throw. The root fallback builds with no ancestors while reset reads the real ones.
- t_8e3e5537 Decide what a framed update method returns when it finds no place (xhigh). A framed method returns `undefined` when `txLocate` finds no place under a command document, so the generated toggle's `boolean` type is wrong there. The heading page does not say its toggle can refuse.
- t_06af502f Decide how Plite refuses a default it cannot fill outside reset (xhigh). `createDefaultChild` still throws, so typing over a picked block crashes there, and each of its consumers changes if it answers `null`. A plain type change through `setNodes` still throws at commit when the kept text lacks a property its new type requires.
- t_a95a78e2 Share one patch projection between block checks and setNodes. `canApplyBlockProps` checks keys that `setNodes` never writes, and the schema accepts a property named like an `Object.prototype` member.
- t_65f9d758 Decide whether schema.property() shows the type-change lifecycle (xhigh). The public read returns `lifecycle.typeChange`, so code can still rebuild the rule `elementForTypeChangeAt` owns.
- t_42ff6dbf Give text properties one resolver for their parent (xhigh). Five places resolve a text property against its parent, with three different fallbacks for a parent with no type.
- task_78b2c6d3 Keep a content default's properties in Plite (xhigh). A content program's default drops every property but its type, so a slot default such as a level 2 heading reaches reset without its level. Reset refuses it when that value is required, where the slot does name it.

## Close

**Reversals and deviations.**

- Plan round 2 dismissed a finding that reset says yes and then throws at commit when the kept text lacks a text property its new type requires. Round 3 reversed that, and reset now checks the converted text before it writes.
- The replay judge's pick made the public `createDefaultChild` answer `null`. Round 3 kept its contract and moved that change to t_06af502f, because each round found more consumers it would change.
- The approved Main changes dropped the `as never` cast in `writeBlockProps`. The build keeps it, because `setNodes` types its properties by the editor's own value type, which a schema read cannot name.
- The build's `no-comments` pass cut the JSDoc Step 4 named for `tryCreateDefaultChild` and `elementPropertiesForResetAt`. Diff round 1 put it back, with four other reason comments, because `CODING_STANDARDS.md` keeps a reason the code cannot show.
- Diff round 2 added a check of a same-type reset's children. Round 3 cut it and restored round 1's same-type skip, because the check refused only over a defect an earlier edit in the same update left, and it dropped a reset that a later edit would make valid.
- Diff round 1 found that reset copied `setNodes`' type-change rule. [The type-change correction](2026-10-15-type-change-copy-lint.md) first tried a lint rule, then replaced every copy with one internal member, `elementForTypeChangeAt`, which `setNodes`, reset and slice landing now call. A `setNodes` write that keeps the type through a custom `compare` or `merge` now drops nothing, where it used to drop every property and mark whose lifecycle drops on a type change.
- The worktree moved from `d53a881036` to next's `b1e70bb257` before the hand drive, because the demo page threw from its discussion controller at `d53a881036`.
- The Defaults row on where the change goes first picked a patch file for the owner to apply. The suggested-task Landing rule, added during this run, has this session apply its own patch, so the row now says that.

**What landed.** `docs/plans/artifacts/chips/task_7deb6a75.patch` is applied to the main checkout's working tree on `next`, uncommitted. The checkout already held another session's uncommitted refactor of reset and toggle-off around an `applyBlockPatches` helper, so the patch redoes `public-state.ts` on top of it, and it rebuilds four generated registry files from the checkout's state. The 34 files it writes match a mirror of the checkout where the reset, toggle, exit and Plate toggle cases pass.

**Proof.**

- Red at the base. 12 of the 14 new contract cases and both new exit throw cases fail at `d53a881036`. The three cases the base passes fail under named mutants (Step 1).
- Mutation. Slice 1 caught 13 of 13 mutants, slice 2 its guard mutant, diff round 1's fixes 18 of 18, round 3's fixes 19 of 19, and the shared member's tree 28 of 28, each with a passing control.
- Package. At the landing base `b1e70bb257`, the frozen final code `b262fa3b8b` passes 3621 `plitejs` cases against the base's 3596 with the same 39 failures, 3446 `platejs` cases against 3443 with the same 18, and the three registry reset specs pass at both. The same proof on `d53a881036` agreed (Step 7).
- Checks. Of the `pnpm check` steps the edits reach, skill-mirrors, registry-changelog and entrypoint-graph pass, and type-tests passes at `b1e70bb257`. Typecheck, public-types, lint-baseline and core-audits fail the same way at `b1e70bb257` and on the candidate. review-ledger and knowledge fail the same way at `d53a881036`. t_3ea68f2e, t_54844d26 and t_ed79a18b own those failures.
- Docs. The API manifest and registry docs regenerate fresh, and the docs source parity check passes. The coverage audit finds both transforms pages cover each refusal, what still throws and what reset keeps.
- Hand drive. The drive covered both transforms pages and `/blocks/basic-nodes-demo` at 1280 px in light, on `b1e70bb257`. Turn into moved a Heading 2 to Text and back, and undo reverted it, with no console error.
- Performance. The rerun is still pending.

**Limits.**

- The mutation runs and the performance arms ran on base `d53a881036`. The move to `b1e70bb257` changed only the registry discussion component, its generated output and the data mapping in `migratePlateV54Suggestions.internal.ts`, none of which reaches reset, `setNodes` or a type change.
- The plitejs typecheck fails at the base on 6 errors in its test files, so it proves no new type error only by comparing the same 6 at both.
- The hand drive covered one width and one theme. It did not drive a refused reset, because no shipped page has a container without a default.
- Plate's generated element toggle promises `boolean`, but under a command document a framed update method returns `undefined` when it finds no place. That gap stays until t_8e3e5537 decides it, and the heading docs page still does not say its toggle can refuse.
- A content program's default keeps only its type, so the promise that a slot's values win over the block's holds only outside a content program. Under one, reset refuses the default when a value the program names is required, and otherwise writes the block without that value, until task_78b2c6d3.

**Counts.** 23 items: 7 steps and 16 gates. 21 done, 1 skipped (`thermos`, whose two lenses the diff panel's seats apply), 1 open (the benchmark gate), none partial or blocked.

**Open work.** The seven suggested tasks under Open work, each waiting on this task landing. owner: zbeyens. stop: the task is started or dropped.

**Attention.**

reviewed by gpt-6.1-sol @xhigh, which named itself "Codex (GPT-6)"; its answer is `docs/plans/artifacts/2026-10-15-transactions-reset-default/trail/sol.md`, and it reviewed this plan's log and the correction's.

1. Critical, correction log. Round 2's dismissal of a critical finding as rare rested on a count from the repository's source, which the panel rule treats as inferred. The finding is now open at the diff cap, with owner and stop in the correction's Close.
2. Critical, correction log. The lint files were written before the ledger's started row named them, not only the Page line. The correction log now records it as a deviation.
3. Critical, correction log. Step 6 was checked though `plate-baseline.mjs --check` exits 1 there, as at the base. It is now partial and accepted through the "wait clean" default.
4. Warning. The package proof and the base-red checks ran against `d53a881036`, while the patch lands on `b1e70bb257`, which changes the migration code behind one base-red error. They ran again at `b1e70bb257` and fail the same way at both.
5. Warning. The one timing packet under a load of 9 is not a pass. The benchmark gate stays open until the rerun or an explicit acceptance of the missing assurance.
6. Warning. The generated toggle's `boolean` promise has an `undefined` exception under a command document. The limits above name it.
7. Warning. task_78b2c6d3 and the content-default limit were missing. Open work and the limits above now name them.
