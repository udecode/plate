---
review_scopes: [dnd, list]
review_basis:
work_kind: implementation
review_commit: 2591fb926aa5ac5ac66169c868f7fe46735499d0
review_inputs: [packages/plitejs/test/transfer-contract.test.ts, packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx, apps/www/tests/browser/list-keys.spec.ts]
---

# Dragged list items land where they are dropped

Status: executed, uncommitted on next, waiting on your commit
Topic: dnd
Playbook: bug-fix

Execution playbook: Bug fix (`.agents/playbooks/bug-fix.md`), with the Plan playbook's architecture rules for the new read (`.agents/playbooks/references/architecture.md`). Run directory: `docs/plans/artifacts/2026-10-15-list-drag-landing/`. Intake base: `2591fb926a`; the owner has committed since, so plan checks run with `PSTACK_BASE=2591fb926a`. Requested by the Transfer landing session as task_46ac463d, from the Open work of `docs/plans/2026-10-14-transfer-list-landing.md`.

## Brief

### What will change?

Dragged list text moves like a cut and paste. Items take the drop item's depth and keep their own list unless they join that one. Copied list blocks join the list beside them or start their own.

### What could go wrong?

If a plugin's paste rules change a setting it did not mark as following the drop, the move does nothing. The follow-up plan made that check cover every moved block. A block dragged into another list still counts with its old list.

## Teach

Plite handles every drag with one action, transfer. A text drag lands at a point inside a block, and a block drag lands at an edge between blocks. List uses a landing hook to set the depth and list of pasted items.

Today only pastes and copied text drops ask that hook. A text move inserts the dragged content as it was, so moved items keep their old depth. A block copy skips the hook too, so a copied item keeps counting in its source's list.

Now a text move lands like a paste, and moved items keep their own list unless they join the item you drop on. Plugins mark the settings that follow a drop, like depth and list. A move refuses if it would change another setting of a middle block. A block copy keeps its depth and asks a new hook, so List puts it in the list beside it or a new one.

## Public API

A plugin marks the properties that follow where content lands. `rebase` lets a text landing change one, such as a depth, and `adopt` also lets a block copy take it from where it lands, such as a list.

```ts before
// packages/platejs/src/features/list/lib/BaseListPlugin.ts
listId: schema.elementProperty(property.string(), {
  target: target.types(targetElementTypes),
  typeChange: 'preserve-if-allowed',
}),
```

```ts after
// packages/platejs/src/features/list/lib/BaseListPlugin.ts
listId: schema.elementProperty(property.string(), {
  landing: 'adopt',
  target: target.types(targetElementTypes),
  typeChange: 'preserve-if-allowed',
}),
```

The paste landing read now says whether it lands a copy or a move, so List keeps moved items in their own list.

```ts before
// packages/platejs/src/features/list/lib/listPaste.internal.ts
const kept = landListContent(
  state,
  blocks,
  { block: target.block?.[0], kind: 'kept' },
  { headingType, placement: 'paste' }
);
```

```ts after
// packages/platejs/src/features/list/lib/listPaste.internal.ts
const placement = intent === 'move' ? 'move' : 'paste';
const kept = landListContent(
  state,
  blocks,
  { block: target.block?.[0], kind: 'kept' },
  { headingType, placement }
);
```

A plugin can set its `adopt` properties on copied blocks, based on where a drag drops them. List uses this to give the copies a list.

```ts before
```

```ts after
// packages/platejs/src/features/list/lib/BaseListPlugin.ts
around(editorReads.transfer.adopt, ({ editor, input, next, state }) =>
  adoptListBlocks(state, input, next(), {
    headingType: getHeadingType(editor),
  })
),
```

## What other editors do

Read in local source at ProseMirror view `ca4c78e`, Lexical `dd5c41b13`, Slate `945a484df` and Tiptap `91c51be53`, not run (`docs/plans/artifacts/2026-10-15-list-drag-landing/prior-art.md`). Every editor lands a text drag-move as a delete followed by its paste path, and every editor with nested lists makes a dropped item join the list it lands in or start a new one. Their lists are trees, so nesting decides membership, and none of them settles a flat list's identity. Word and Google Docs, the spec's authorities for list identity, were not run.

| Editor | Text drag that moves | Hook that reshapes dropped content | Dropped list item's list |
| --- | --- | --- | --- |
| ProseMirror | Deletes the source, then `replaceRange` at the drop point, as a paste fits | `transformPasted`, the paste hook, runs on internal drags, moves and copies alike | The list the fit puts it in, or a new list the fit wraps it in |
| Tiptap | ProseMirror's drop | ProseMirror's | As ProseMirror |
| Lexical | Removes the dragged range, then inserts through `$insertDataTransferForRichText`, the paste path | The paste path's import hooks | A `ListItemNode` needs a `ListNode` parent, so it joins the list it lands in or gets a new one |
| Slate | Deletes the dragged range, then `insertData`, the paste call | `insertData` overrides | No list model in core |
| Notion (not read) | not read | not read | Positional numbering: a dropped numbered block numbers with the run it lands in |

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Element properties declare `landing: 'rebase'` or `'adopt'` | Plite | `plitejs` root entry, `src/core/schema-definition.ts`, `src/core/schema-compiler.ts` | Each property's owner knows whether where content lands decides it |
| The landing read's input carries `intent` | Plite | `plitejs` root entry, `src/core/slice-landing-types.ts`, `src/core/slice-landing.ts` | A landing hook must tell a move from a copy to keep moved identity |
| A text move lands through the paste plan | Plite | `plitejs` root entry, `src/core/transfer.ts` | Transfer owns the move; the paste plan owns landing mechanics |
| A move may change only declared properties | Plite | `plitejs` root entry, `src/core/transfer-guard.ts` | The guard owns "refuse rather than lose" |
| `editorReads.transfer.adopt` and its patch types | Plite | `plitejs` root entry, `src/core/editor-reads.ts`, `src/core/transfer-types.ts`, `src/index.ts` | A neutral read inside admission; Plite checks patches against the declarations before placement and vetoes |
| The hover check cache keeps one result per edge | Plite | `plitejs` root entry, `src/core/transfer.ts` | Hover checks several candidate edges per dragover, and one slot made them evict each other |
| List and Indent declare their positional properties | Plate | `platejs` core entry, `src/features/list/lib/BaseListPlugin.ts`, `src/features/indent/lib/BaseIndentPlugin.ts` | The properties' owners |
| List identity for moved text and dropped block copies | Plate | `platejs` core entry, `src/features/list/lib/` | List policy stays in Plate |

## Native behavior and proof

| Behavior | What changes | Proof |
| --- | --- | --- |
| Text drag that moves list items | Items land at the drop item's depth and keep their own list unless they join the drop item's; the emptied source blocks leave as today | List spec case A and the Word-continued case; Chromium dispatched drag on `/blocks/list-demo` |
| Text drag that moves plain text | Unchanged, because the default landing hook returns the slice as given | Existing transfer contract cases, which pass unchanged with the move-as-paste spike, and again on the final patch |
| Text drag whose landing would change an undeclared property | Refuses and changes nothing | Raw Plite refusal cases |
| Undo after a move or a copy | One step, as before | The new contract and List cases undo once |
| Block drag that copies list items | Copies keep their depth and join the list beside them or start their own | List spec cases C, D2, E and the nested, head and long-family cases; Chromium dispatched handle drag on `/blocks/list-demo` with rendered numbers |
| Hover indicator | Paints only edges the drop admits; for a block copy it runs the copy hook once per edge | Existing hover cases, the title-role refusal case and the work-count case |
| Block drag that moves | Unchanged | Existing cases, plus a case pinning the current numbers |

## Read contract

```ts
// packages/plitejs/src/core/schema-definition.ts, element property options
/**
 * Whether where content lands decides this property. `rebase`: a text landing
 * may change it. `adopt`: a text landing may change it, and a block copy may
 * take it from where it lands. Defaults to 'preserve'.
 */
landing?: 'adopt' | 'preserve' | 'rebase';

// packages/plitejs/src/core/slice-landing-types.ts
export type SliceLandingInput = Readonly<{
  intent: 'copy' | 'move';
  slice: ContentSlice;
  source: ContentSlice;
  target: SliceLandingTarget;
}>;

// packages/plitejs/src/core/transfer-types.ts
export type TransferAdoptInput = TransferLandingInput &
  Readonly<{ payload: Extract<TransferPayload, { kind: 'nodes' }> }>;

/** Properties a block copy adopts at `at`, a path inside the payload. */
export type TransferPatch = Readonly<{
  at: Path;
  properties: TransferPatchProperties;
}>;

/** Only properties declared `landing: 'adopt'`; `undefined` unsets one. */
export type TransferPatchProperties = Readonly<
  Record<string, unknown> & {
    childRoots?: never;
    children?: never;
    text?: never;
    type?: never;
  }
>;

// packages/plitejs/src/core/editor-reads.ts, under transfer
adopt: defineRead<TransferAdoptInput, readonly TransferPatch[]>('transfer.adopt'),
```

- **Declarations.** The compiled property lifecycle gains `landing`, beside `copy`, `split` and `typeChange`. List declares `landing: 'adopt'` on `listId`, `listStyle`, `listStart`, `listRestart` and `listLevels`. Indent declares `landing: 'rebase'` on `indent`, so a block copy never changes a depth. `listType`, `checked` and every undeclared property stay preserved. A declared property may change in any way on a landing. List declares `listLevels` because an item takes its list's level rules when it joins, so a middleware could also drop a level label on a move.
- **Intent.** Plite passes `intent` from the caller: `copy` for a paste, a node-selection replace and a copied text drop, `move` for a text move. As with every read input, a middleware that calls `next` with another input passes that input on.
- **Moves.** A text move lands through the paste plan with `intent: 'move'`, inside the move's landing role. Before writing, the move refuses `lossy` when the length limit cuts it by any amount. After corrections, the guard compares the final landing with the moved slice, using the openness of the slice the landing wrote. An open edge block merges into the block it lands in, so its delimiters and properties are skipped, as today. An empty-block replacement writes a closed slice, so its head compares. Closed blocks, inline elements and voids compare their properties anywhere, the first and last branches included, and content roots compare too. Text, marks, element types, nesting and `childRoots` must match, and so must every compared property except those declared `rebase` or `adopt`. A property an empty-block replacement carries over from the block it replaces is ignored only when its value equals that block's value, read when the landing is planned.
- **Copies.** For a block copy that lands at an edge, admission runs `transfer.adopt` after the landing read resolves the final edge and before placement and vetoes. Hover and drop share that admission. Block moves, side drops and file drops never run it, and a keyboard step copy adopts once, on the edge the step settles on. The default returns `[]`. Patches apply in order, so a later patch wins on a key. A patch whose `at` addresses no element of the payload, or that names a property not declared `landing: 'adopt'`, refuses with `policy`. The landing read sees the payload before adoption and does not run again, so a landing read must not decide by an `adopt` property. Placement and every veto judge the patched payload. One patched slice feeds the fit, the guard's expected content and the landing, so an adopted copy reports no loss, and the cached source slices stay unpatched. The patched content lands through `replaceSliceAtBlockBoundary`.
- **Hover.** The drop indicator's check runs the same admission, so it paints only edges the drop admits. The check cache keeps one result per edge for the current snapshots and configuration, so repeated dragovers over the same candidate edges run admission once per edge. The `check` doc says the copy hook runs while hovering. The public `editor.read.transfer.check` still asks for a move, as it does today.

## List's landing rules

**Moved text** (`slice.landing` with `intent: 'move'`, a `move` placement in `landListContent`). Depths re-base to the drop item, as the paste law says. The first moved list joins the drop item's list when the kind and heading role match, and takes its rules. Every other moved list keeps its own id and its level rules, because a move leaves no copy behind to share them with. Moved starts and restarts stay, as a paste keeps them. Both `landListContent` calls in `listPaste.internal.ts`, the kept landing and the empty-line replacement, use the `move` placement for a move.

**Block copies** (`adoptListBlocks`, from `transfer.adopt`). A copied list's top level is its smallest list depth in the copy. At most one copied list joins, found in this order:

1. The first copied list joins the item before the gap at its top level, when compatible.
2. Else the last copied list joins the item after the gap at its top level, when compatible, without `listRestart`, and with no non-list block after that list in the copy. Its head takes that item's `listStart`, so the list keeps its start.
3. Else the first copied list joins the shallower list item that stopped the previous walk, of any kind, as paste does.

Compatible means the same list kind and heading role; style is ignored, as in paste. A copied list that holds a `listRestart` at its top level after its head never joins, so it cannot restart the list it would join. The walks skip deeper items without a budget and stop at the first item at the list's top level or shallower.

- Joined items take the anchor's `listId` and `listLevels`, and those at the anchor's depth and kind take its `listStyle`. Only the joined head drops its copied `listStart` and `listRestart`, so the list keeps counting. Every other copied item keeps its own, so a copied child list still starts where it did.
- Every other copied source list takes one fresh id and keeps its starts. Depths never change.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Landing-adaptable properties | The property lifecycle has `copy`, `split` and `typeChange` | `landing: 'preserve' \| 'rebase' \| 'adopt'`, default `preserve` | `plitejs` schema | The property's owner knows whether where content lands decides it; one declaration bounds both moves and copies | List and Indent declare theirs; the plugin guide documents it | Schema contract cases; the refusal cases | A plugin that reshapes its own property on paste without declaring it makes moves refuse | rearchitect |
| Landing intent | The landing read cannot tell a move from a copy | `intent: 'copy' \| 'move'` on `SliceLandingInput` | `plitejs` slice landing | Fresh list ids exist so copies never share a list with their source; a move leaves no source | List reads it; paste passes `copy` | List move cases | A middleware that ignores it reshapes moves as pastes, within declared properties | rearchitect |
| Text move landing | Raw `tx.slice.replace` at the point | The paste plan with `intent: 'move'`, inside the move's landing role | `plitejs` transfer | A drag-move is a cut and a paste in every editor read | No caller changes; every `slice.landing` middleware now also runs on text moves | Contract cases, List cases, browser case | A middleware that changes undeclared content makes moves refuse | rearchitect |
| Move preservation | The guard compares the raw slice's text tokens, skipping open-edge properties and roots | Every element property must match except declared ones, with roots and open-edge inlines compared after corrections | `plitejs` transfer guard | Refuse rather than lose | None | Refusal cases for text, an undeclared property, an inline at an edge, a root, a length cut | A legitimate correction now refuses a move | rearchitect |
| Block copy adoption | The raw payload lands | `editorReads.transfer.adopt` patches `adopt` properties inside admission, before placement and vetoes | `plitejs` reads | A neutral hook; List policy stays in Plate; hover and drop share one admission | Additive export; `dnd.mdx` documents it | Contract cases | Hover runs the read once per edge change | rearchitect |
| List identity of moved text | Moved items keep their ids and depths | Depth re-bases; join the drop item's compatible list, else keep ids and level rules | `platejs` List | A move is a cut and a paste, and keeping ids avoids islands inside a Word-continued list | List middleware | List move cases | Cut then paste still gives pasted lists new ids | rearchitect |
| List identity of dropped block copies | Copies keep the source's `listId` | At most one join at the gap (previous, next, then parent), else one fresh id per source list | `platejs` List | Word and Google Docs numbering lanes; the paste law | List middleware | List cases C, D2, E, nested, head, two-list head, nested start, long family | The parent fallback joins a list the user did not expect | rearchitect |
| Block moves into another list | Keep their list | Unchanged | none | The forward join would also change keyboard moves, a separate product call | none | A List case pins b1 1, a2 2, b2 2 | Numbering stays wrong for this case | defer: owner's call on keyboard moves; next owner task_bb8c7610 |
| Duplicate in the block menu | Keeps `listId`, lands beside its source | Unchanged | `plitejs` transaction call | A raw transaction call runs no policy, and a block beside its source already joins | none | Existing duplicate cases | none | keep |
| Hover | `check` runs `admit` | `admit` also runs `transfer.adopt` for a block copy | `plitejs` transfer | One admission keeps hover and drop on the same edge, and a cache entry per edge holds it to once per edge | none | Existing hover cases; the work-count case | More work per edge change while hovering a copy | gate: the work-count case in step 3; a miss sends the design back to `architect` |

## Risks and rollback

- **A sanitizing middleware.** A third-party `slice.landing` middleware that strips content or changes an undeclared property now makes in-document text moves refuse in its editor. The drop does nothing, and the source stays. Only List registers that hook in this repository (`git grep "slice.landing"` over `packages/*/src` and `apps/www/src`, 2026-10-15). `dnd.mdx` says the hook runs on moves.
- **An undeclared plugin.** A plugin whose landing middleware changes its own property on paste must declare it, or moves through that middleware refuse.
- **A move's edge blocks go unchecked.** A landing read can change the type or an undeclared property of the blocks that hold a move's start and end, or of the blocks that contain them, and the move lands, unless such a block is closed, such as a title, or the move lands in an empty block. Before this change no landing read ran on a move, so only corrections could. An open end also lands as a paste does, so the drop point's remaining text can end up inside a moved wrapper and take its properties.
- **A declared property changes freely.** A middleware could drop a level label from `listLevels` on a move and the move would land.
- **Cut then paste.** A cut can be pasted many times, so a pasted list still gets a new id, while a drag-move keeps its list.
- **A list's start lives on its first item.** Moving, cutting or deleting that item leaves the rest counting from 1. That is true today for cut and delete.
- **A wrong join.** The parent fallback applies only when no compatible item sits at the copy's top level before or after the gap. Two copied lists dropped inside a list join only the first, so the second numbers apart from its neighbor, as a paste does.
- **A landing read keyed on an adopted property.** The landing read does not run again after adoption, so a plugin's landing read that decides by an `adopt` property could pick an edge the adopted copy would not get. None does in this repository.
- **Rollback.** Revert the change. No stored shape changes, since list ids and starts are ordinary values.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Text moves | Land like a paste at the drop point | Keep the depths they had | keep move depths | big |
| Which list moved items join | Their own list, unless they join the item you drop on (look) | The drop item's list or a new one, as a paste does | paste move list | big |
| Block copies' list | Join the list beside them, or start their own (look) | Keep the source's list | keep copy list | big |
| What a move may change | Only settings a plugin marks as following the drop, like depth and list | Any setting of a text block, such as a heading level | loose move check | small |
| Plugin hook for block copies | A new hook that sets only settings that follow the drop | Let the paste hook handle block copies too | widen paste hook | small |
| Where a copy looks for its list | The item before it, then the item after it, then the item it lands under | Skip the item after it, as a paste does | no forward join | small |
| A joined copy's start number | Only its first item drops it, so the list keeps counting (look) | Kept, as a paste keeps it | keep copied start | small |
| A copied list that sets its own start or restart inside | Starts its own list | Joins and renumbers the list it joins | join restarted copy | small |
| Block moves into another list | Unchanged, offered as a follow-up | Join the list they land in now | fix block moves | small |
| When the copy hook runs | While hovering, once per edge, so the indicator matches the drop | Only at drop, so a plugin rule can refuse after hover | adopt at drop only | detail |
| Duplicate in the block menu | Unchanged | Run the same list rule | adopt duplicate | detail |
| When the build starts | After the paste landing session lands | Now, on top of its unfinished files | build now | detail |
| The comment review's eight renames and splits | Made directly, each inside one file | A design pass on them first | design the renames | detail |
| The List landing comment a move made wrong | Deleted, since the spec holds its rules | Kept, with a sentence for moves | keep list comment | detail |

## Start Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| task_5a7ba11c (paste landing) landed | yes | landed row 2026-10-15T00:50:55Z in `docs/plans/suggested-tasks.decisions.tsv` |
| task_db3cd1c2 (landing helper) landed or dismissed | yes | landed row 2026-10-15T00:53:21Z in `docs/plans/suggested-tasks.decisions.tsv` |
| Each step's cheapest control behaves at base in a detached worktree | yes | the build base is HEAD `1a9a7cbf1e` plus the uncommitted tree in `build-base/base.patch`; step 2's new cases fail there and every existing case passes (`proof/step2-base-survey-a1.log`) |
| Benchmark pre-acceptance probe | yes | gate: hover now runs `transfer.adopt` once per uncached check; step 3's work-count case freezes the budget, and a miss sends the design back to `architect` |

## Steps

- [x] 1. Wait until task_5a7ba11c (paste landing) lands and task_db3cd1c2 (landing helper) lands or is dismissed, since both own files this plan changes. Rebase the Read contract on the landed paste plan: the move resolves its site on the draft after the source is removed, the plan tells a length cut apart from a missing site, and `intent` reaches the landing input through the plan's arguments. Proof: their landed rows in `docs/plans/suggested-tasks.decisions.tsv` or the owner's commit, and the Start Gates rows filled.
  Done: both landed rows, the Start Gates rows above, and `planPaste`'s intent argument and cut-to-nothing plan in `packages/plitejs/src/core/slice-landing.ts`.
- [x] 2. For the declarations and moves, write the failing raw Plite cases first. In the schema contract cases, properties declared `landing: 'rebase'` and `'adopt'` compile and the default is `preserve`. In `slice-landing-contract.test.ts`, one case per caller has a downstream middleware observe the intent it passes (paste, node-selection replace, copied text drop, text move). In `packages/plitejs/test/transfer-contract.test.ts`: a move's landing read changes a declared property and one undo restores it; a middleware that drops moved text refuses and publishes nothing; one that changes an undeclared property, such as a heading level or `checked`, refuses; one that changes an inline element's property on the first or last branch refuses; a correction that changes content in a moved object's content root refuses; a move the length limit cuts refuses `lossy` and publishes nothing, for a partial cut and a cut to nothing; selected heading text moved into a paragraph lands, merged; a closed head, from a schema with `slice.preserveContext`, compares its properties; a move into an empty aligned block lands, from an open and a closed source, keeps the alignment and undoes in one step; from an open source, a middleware or a correction that changes the moved head's `checked` there refuses, and one that adds an undeclared property with a value other than the replaced block's refuses; a closed head landing inside a paragraph compares against the right fragment; a move whose source comes before the drop point in the same parent lands. In `BaseListPlugin.spec.tsx`: case A, with the emptied source blocks leaving; a move inside a Word-continued list (`1. A`, a paragraph, `2. B`, `3. C`, `4. D`, moving C to D onto the paragraph's end) numbers A, D and B as 1, 2 and 3; a move onto a compatible item joins it and onto an incompatible one keeps its list; a move into an empty paragraph below an incompatible list keeps the moved list; a partial move of an explicit-id list across depths keeps its `listLevels`, asserting numbers at the source and the drop; a move of two source lists; an image list item moved to a new depth lands; a multi-block move with element ids keeps the closed blocks' ids. Then add the declaration, the intent, the move path and the guard. Proof: each case red at base and green after, logged with `proof.mjs` in a detached worktree at base plus the patch.
  Done: 21 cases red at the build base (`docs/plans/artifacts/2026-10-15-list-drag-landing/proof/step2-red-a1.log`), all 358 green with the patch (`docs/plans/artifacts/2026-10-15-list-drag-landing/proof/step2-green-a1.log`), and the seven cases that already land at base each fail under a mutant (`docs/plans/artifacts/2026-10-15-list-drag-landing/proof/step2-m1-a1.log` to `step2-m6-a1.log`). Deviation: the content-root correction case is dropped and the guard compares `childRoots` as a property, because a text move holding an element with exclusive content roots refuses with `schema` at the build base and with the patch (`docs/plans/artifacts/2026-10-15-list-drag-landing/proof/card-move-patch-a1.log`).
- [x] 3. For block copies, write the failing raw Plite cases for `transfer.adopt`: it shapes a block copy at the final edge; a patch on an undeclared property, on a `rebase` property such as `indent`, on `type` or `childRoots`, or outside the payload refuses with `policy`; a patch a property-keyed placement or veto rejects refuses at hover and at drop alike, using the title-role fixture; an adopted copy reports no diagnostics and leaves the cached source slice unpatched; a keyboard step copy adopts once; a move never runs it. Write the List cases: a far copy gets its own list, with and without source ids (C); a copy from another list between two items joins it (D2); a copy before a nested child whose id differs from its parent's joins the child's list; a copy before a list's first item, which starts at 5, numbers 5 and the originals read 6 and 7; a copy of two lists before a list's first item joins only the last; a copy of two lists dropped inside a list numbers 1, 2, 3, 1, 4; a joined copy's head drops its copied restart; a copied family whose child starts at 5 and holds a later restart keeps both; a copied list with a restart at its top level, dropped before and after a list, starts its own list and leaves the originals' numbers alone; a copied family dropped between its own head, which holds a start, and its first child is admitted at hover and at drop as at base; a copy from another editor near a list and far from one (E); a copy after a family of 65 deeper items joins it; a block move into another list still numbers b1 1, a2 2, b2 2. Add the work-count case, with its budget frozen before the build reads a candidate result: across repeated identical drop-target resolutions over a shared band of nested containers and over a refused anchor with a fallback, `transfer.adopt` runs once per candidate edge and never again until the document or configuration changes, and List's walk visits only the deeper run beside the gap, the same counts at 10 and 300 unrelated list items. Then add the read, the per-edge check cache and List's middleware, and update the `check` doc. Proof: red at base and green after; a work-count miss sends the design back to `architect`.
  Done: 25 cases and the 2 hover cases fail on the Step 2 tree, the base this step builds on (`docs/plans/artifacts/2026-10-15-list-drag-landing/proof/step3-red-b-a1.log`, `docs/plans/artifacts/2026-10-15-list-drag-landing/proof/step3-red-geo-b-a1.log`), and pass with the patch (`docs/plans/artifacts/2026-10-15-list-drag-landing/proof/step3-green-b-a1.log`). Nine mutants each fail the case they revert (`docs/plans/artifacts/2026-10-15-list-drag-landing/proof/step3-s3-m9-a1.log` and its siblings in the decision log). The work-count case holds, 5 visits at 10 and at 300 other items and one adopt per candidate edge, so the design stays. Deviation: the List family case checks the drop only, because no public check runs a copy inside one editor; hover runs the same admission, which the Plite hover-and-drop cases check. A block moved into another list and a copy from another editor dropped away from lists pass on the Step 2 tree and stay as controls.
- [x] 4. Extend the "list drop" case in `apps/www/tests/browser/list-keys.spec.ts` with the text move and the handle copy, asserting blocks and rendered numbers. Proof: red at base, then five warm green runs with retries off.
  Done: both new cases fail at the build base on their own defect (`docs/plans/artifacts/2026-10-15-list-drag-landing/proof/step4-red-a1.log`) and pass 15 of 15 over five warm Chromium runs on a server built from base plus the patch (`docs/plans/artifacts/2026-10-15-list-drag-landing/proof/step4-green5-a1.log`). Deviation: the move and the handle copy are two sibling "list drop" cases, so the first failure cannot hide the second. WebKit passes them once; Firefox does not launch on this host.
- [x] 5. Record the law: `EDIT-CLIPBOARD-LIST-LANDING-001`, the drag notes (a move lands as a paste and may change only declared properties) and a new block copy rule in `docs/editor-behavior/markdown-editing-spec.md`; the transfer law in `docs/vision/plite.md`. Run `plate-docs` on `content/docs/(plugins)/(functionality)/dnd.mdx`, `content/docs/(guides)/clipboard.mdx`, `content/docs/(guides)/plugin.mdx` (the property lifecycle), `content/docs/api/core/plate-plugin.mdx` and their Chinese twins. Run `best-api repair` on the declaration, the intent and the read, and add a changeset per `changeset`. Proof: `pnpm kb check`, the docs checks and the hand drive.
  Done: the spec rules and notes, 20 List cases and the browser cases tagged (`docs/plans/artifacts/2026-10-15-list-drag-landing/proof/kb-check-step5-a1.txt`), the four pages and their Chinese twins (`docs/plans/artifacts/2026-10-15-list-drag-landing/proof/docs-build-source-a1.txt`, `docs/plans/artifacts/2026-10-15-list-drag-landing/proof/docs-parity-a1.txt`, `docs/plans/artifacts/2026-10-15-list-drag-landing/proof/registry-check-a1.log`), two changesets, and a hand drive of all nine cells (`docs/plans/artifacts/2026-10-15-list-drag-landing/proof/hand-drive-check-a1.txt`). The transfer law went into `docs/vision/plite.md` once task_347dc1bf landed and released the file (`docs/plans/artifacts/2026-10-15-list-drag-landing/vision-edit.mjs`).
- [x] 6. Run the full plitejs and platejs suites in a detached worktree at the base the build starts from, after the Start Gates land, and again at that base plus the final patch. Proof: the same failures both ways and no new ones, logged with `proof.mjs`; the 9 plitejs failures red at `1a9a7cbf1e` (`spike/plite-base-a1.log`) are context only.
  Done: plitejs fails the same 8 yjs cases and platejs the same 200 cases at the build base and with the final patch, once the schema law case that asserts the lifecycle's keys gained `landing` (`docs/plans/artifacts/2026-10-15-list-drag-landing/proof/suite2-plitejs-final2-a1.log`, `docs/plans/artifacts/2026-10-15-list-drag-landing/proof/suite2-platejs-patch-a1.log`); the platejs test tsc reports the same 947 errors both ways (`docs/plans/artifacts/2026-10-15-list-drag-landing/proof/tsc-platejs-tests-final2-a1.log`).
- [x] 7. Close: writing passes, the `api-build` panel on the diff, `pnpm lint:task` on the task's paths, the hand drive, the decision-trail review and reflect. Proof: their logs.
  Done: the gates above; the trail review's critical opened `docs/plans/2026-10-15-move-landing-guard.md`, whose close runs reflect for both plans.

## Completion Gates

| Gate | Artifact |
| --- | --- |
| `api-plan` panel on this plan | three rounds, the cap, in the decision log; answers in `docs/plans/artifacts/2026-10-15-list-drag-landing/panel/r1/` to `r3/` |
| Writing passes on the diff (`deslop`, `no-comments`) and the docs (`unslop`) | the build's `writing` row (comment-sicko's report in `docs/plans/artifacts/2026-10-15-list-drag-landing/comment-review.md`) and diff round 1's |
| `api-build` panel on the build's diff | three diff rounds, the cap: `docs/plans/artifacts/2026-10-15-list-drag-landing/panel/d1/`, `d2/` and `d3/` |
| `best-api repair` on `landing`, `intent` and `editorReads.transfer.adopt` | the transfer law in `docs/vision/plite.md`; teaching sweeps `docs/plans/artifacts/2026-10-15-list-drag-landing/proof/teaching-sweep-a1.txt` and `teaching-sweep-a2.txt` |
| `api-build` panel reviews the cap-round design changes: the `rebase` and `adopt` split, the written-openness guard, the per-edge cache and the restart rule | diff round 1, whose prompt names them (`docs/plans/artifacts/2026-10-15-list-drag-landing/panel/d1/prompt.md`); it changed the guard's openness and the restart rule |
| `plate-docs` on each named docs page and its Chinese twin | `docs/plans/artifacts/2026-10-15-list-drag-landing/proof/docs-build-source-a1.txt`, `docs-parity-a1.txt`, `registry-check-a1.log` |
| Changeset for `plitejs` and `platejs` | `.changeset/list-drag-landing.md`, `.changeset/list-drag-landing-platejs.md` |
| Full suites on the final patch match the build base's failures | `docs/plans/artifacts/2026-10-15-list-drag-landing/proof/d1-suite2-plitejs-a1.log`, `d1-suite2-platejs-a1.log`, `d1-slow2-fix-a1.log` against the build base's logs |
| Work-count case within its frozen budget | 'adopts once per candidate edge over %s until the document changes' in `docs/plans/artifacts/2026-10-15-list-drag-landing/proof/d1-green2-a1.log` |
| Hand drive: `hand-drive.mjs check` log | `docs/plans/artifacts/2026-10-15-list-drag-landing/proof/hand-drive-check-a1.txt` |
| `pnpm lint:task` on the task's paths | `docs/plans/artifacts/2026-10-15-list-drag-landing/proof/lint-task-d2-a2.log` (0 errors on 26 files) |
| Decision-trail review | gpt-6.1-sol at xhigh, `docs/plans/artifacts/2026-10-15-list-drag-landing/trail/answer.md`; its rows in the decision log, phase `trail`; its critical opened `docs/plans/2026-10-15-move-landing-guard.md` |

## Proof

Behavior proof is the Bun contract and List cases, each red at the base and green on the build, run in a detached worktree at the base plus the task's patch, the full suites on the final patch, and the Chromium "list drop" case on `/blocks/list-demo`, five warm runs. No tool here starts a native drag, so the browser cases dispatch drag events after a real selection, as the existing case does.

## Open work

- **Block moves into another list.** A block moved between two items of another list keeps its old list, so the numbers read 1, 2, 2. Deciding whether a move joins the list it lands in touches keyboard moves too. Tracked as suggested task task_bb8c7610. owner: zbeyens. stop: that session decides it, or zbeyens drops it.
- **Diff review warnings left for later.** A property declared both `copy: 'drop'` and `landing: 'adopt'` makes a copy report a false loss; no schema declares that pair. Only the forward join requires a list item at the copy's edge, and a keyboard step judges a copy both before and after adoption. owner: zbeyens. stop: a session takes them, or zbeyens drops them.
- **Side findings from plan review.** These predate this plan. `tx.blocks.duplicate` copies `listRestart`, so duplicating a restarted item numbers 1, 1. The hover check cache key leaves out the source editor's configuration revision. The public `editor.read.transfer.check` always asks for a move, so a custom driver cannot dry-run a copy. A list's start lives on its first item, so deleting, cutting or moving that item leaves the rest counting from 1. Lists inside a copied object's content roots keep their source ids, on paste and block copy alike. owner: zbeyens. stop: a session takes them, or zbeyens drops them.

## Close

**Reversals and deviations.**

- **The move guard's promise narrowed, then came back.** The plan promised that a move refuses whenever its landing changes anything but declared properties. The build's guard skipped the blocks that hold the range's start and end and the blocks that contain them, unless such a block was closed or the move landed in an empty block. Diff round 1 made it compare the slice's last text block, and round 2 found the same gap one level up, at a wrapper. The lead reverted to the approved edge rule and narrowed the promise in the docs, the spec, the Vision law and the changeset. The decision-trail review rated that critical, because the ask names the guard, and the run pivoted into `docs/plans/2026-10-15-move-landing-guard.md`. That iteration checks every block a move carries except the block the moved text joins at the drop point and the blocks that hold it, and states the promise that way in the same files. t_7ff5e7cc was dismissed as superseded.
- **Three deferred warnings moved to the next iteration.** The refused move of whole list items out of a quote, the join that read the first copied item, and the work case that never grew the copied family were deferred after diff round 1. The trail review counted them against this plan's promises, and the move guard plan fixes all three.
- **The guard's openness.** The Read contract judged openness from the slice the landing wrote. The guard now takes the lesser of the moved and the written slice's openness, so a landing read can close an edge but never open one (diff round 1).
- **List's restart rule.** The plan says a copied list with a `listRestart` at its top level after its head never joins. A copied list that sets a `listRestart` or a `listStart` on any item after its head never joins, because a deeper start or restart resets a destination counter that runs across parents through `listLevels` `restartAfter` (diff rounds 1 and 2). The rule also refuses some joins that would reset nothing under default level rules.
- **Step 2.** This run dropped the content-root correction case, and the guard compares `childRoots` as a property, because a text move holding an element with exclusive content roots refuses with `schema` before and after this change.
- **Step 3.** The List family case checks the drop, not the hover. No public check runs a copy inside one editor, and hover runs the same admission, which the Plite hover-and-drop cases check.
- **Step 4.** The text move and the handle copy are two sibling "list drop" cases, so the first failure cannot hide the second.
- **The Vision law** went into `docs/vision/plite.md` at the close, once task_347dc1bf released the file.

**What landed.** A text move to a point lands through the paste plan with `intent: 'move'`. Moved list items take the drop item's depth and keep their own list unless they join the drop item's list. Element properties declare `landing: 'rebase'` or `'adopt'`: Indent's `indent` rebases, and List's identity fields adopt. The schema contract and fingerprint carry `landing` only where a property declares it, so only editors with List or Indent get a new fingerprint, which the platejs changeset names. A block copy asks `editorReads.transfer.adopt` once per edge, at hover and at drop alike. List joins at most one copied list to the list beside the drop edge and gives every other copied list a fresh id. `EDIT-LIST-DROP-001`, the widened `EDIT-CLIPBOARD-LIST-LANDING-001` and the drag notes hold the law, and the dnd, clipboard, plugin and plate-plugin pages and their Chinese twins teach it. Everything sits uncommitted on `next`.

**Proof.** Each step's cases failed at the build base for their named defect and pass on the final bytes. Cases catch sixteen mutants: six in step 2, nine in step 3 and one for the adoption copy. On the final bytes, in detached worktrees at `HEAD` plus the build base: the targeted files, `packages/plitejs/test/transfer-contract.test.ts` and `packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx` among them, pass 445 cases, the slow file 49 and the drag geometry 25. The plitejs and platejs suites fail the same 8 and 200 cases as the build base, and the slow suites the same 193 names. The plitejs typecheck passes, and the platejs test typecheck reports the same 947 errors as the base. The list drop cases in `apps/www/tests/browser/list-keys.spec.ts` pass 15 of 15 over five warm Chromium runs on a server built from the final bytes. The docs registry is fresh, and the spec check reports the same 107 citation findings as before this run's edits, none in a file it edited. The `api-build` panel ran three diff rounds, the cap; the decision log lists each finding and its outcome.

**Limits.** The five-run browser proof ran on Chromium; WebKit passed the cases once at step 4, and Firefox does not launch on this host. No tool here starts a native drag. The text drop cases and the hand drive select with a real mouse drag, then fire drag events; the handle copy case drives Playwright's mouse with the copy modifier held. The hand drive ran on the bytes before the diff rounds; the browser cases ran again on the final bytes, and the move guard plan drove the text move again on its own final bytes.

**Counts.** Seven steps, all done. Twelve completion gates, all done. Three open items, each with an owner and a stop.

**Decision-trail review.** Reviewed by gpt-6.1-sol at xhigh. It raised 1 critical, 4 warnings and 2 nits (decision log, phase `trail`).

- **The round 2 revert left a move able to change its edge blocks, though the ask names the guard.** Critical. The run pivoted into the move guard plan, which fixes it.
- **Three deferred findings limit this plan's promises.** Warnings. The move guard plan takes all three, as Reversals says.
- **The trail snapshot holds `editor-schema.ts` code the final overlay lacks.** Warning. This run's hunks in that file are the ones the acceptance proof ran; the next iteration diffs against a frozen overlay.
- **An early spike edit and this Close.** Nits. The spike edited `transfer.ts` in a detached worktree before task_5a7ba11c landed, and nothing reached the shared checkout. This Close now gives true counts and the gesture each browser case uses.
