---
review_scopes: [clipboard, list]
review_basis:
work_kind: implementation
review_commit: 2591fb926a
review_inputs: [packages/plitejs/test/slice-landing-contract.test.ts, packages/plitejs/test/max-length-contract.test.ts, packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx]
review_upstreams: ['../lexical@dd5c41b13', '../prosemirror-view@ca4c78e', '../slate@945a484df', '../tiptap@91c51be53']
---

# One landing site for every paste

Status: executed: in the working tree on next, waiting for your commit
Page: https://claude.ai/artifact/2qgL4kC7eUvwhJNawAwgjT
Playbook: plan

Execution playbook: Build (`.agents/playbooks/build.md`). Run directory: `docs/plans/artifacts/2026-10-14-paste-landing-target/`. Intake base: `2591fb926a`, the merge of PR 5168 into `next`. Requested by the PR 5168 redo session as the follow-up "Unify paste landing for node selections and named roots", for the gaps that redo deferred (`docs/plans/2026-10-14-pr-5168-redo.md`, Open work).

## Brief

### What will change?

Pasting picks its spot one way everywhere, so pasting over selected blocks swaps them out whole within the length limit, and lists paste into side areas like the main page. It's in your working tree for you to commit.

### What could go wrong?

Pasting over selected blocks now replaces them entirely. Pasting over hidden text leaves less room. One crash is left for a follow-up: pasting a hand-made block that points to an area that does not exist.

## Teach

Every Plite paste runs one command. It decides where the paste lands, trims it to the length limit, lets plugins reshape it and writes it. Plugins see the target block and can ask to replace an empty block whole.

Today the command works out the target two ways. Pasting over selected blocks skips the length budget, so a trimmed paste puts the caret past the end and crashes. A plugin reads the main page even for a paste into a caption. And the target is picked before the caret skips hidden content, like a tracked deletion, so a plugin can copy a hidden block's settings.

Now the command works out one landing spot: the area, the placed caret or selected blocks, and a budget counting only the text the paste replaces. Plugins read that area, the editor cuts their output to the limit, and the writer uses the same spot. A paste over selected blocks always replaces them whole.

## Public API

A landing middleware reads the paste's target through `state`. Its paths and children now belong to the root the paste lands in.

```ts before
// content/docs/(guides)/clipboard.mdx (a landing middleware)
around(editorReads.slice.landing, ({ input, next, state }) => {
  const landing = next();
  // A paste into the `notes` root from the main editor: target.block's path
  // is a notes path, but `state` reads the main document.
  state.nodes.parent(input.target.block[1]);
  return landing;
});
```

```ts after
// content/docs/(guides)/clipboard.mdx (a landing middleware)
around(editorReads.slice.landing, ({ input, next, state }) => {
  const landing = next();
  // `state` reads the root the paste lands in, from any editor or view.
  state.nodes.parent(input.target.block[1]);
  return landing;
});
```

The input's `slice` has one meaning, and the target follows the placed caret.

```ts before
// packages/plitejs/src/core/slice-landing-types.ts
/**
 * What survives the length limit at a caret or range, or the handed slice
 * over a node selection.
 */
slice: ContentSlice;
```

```ts after
// packages/plitejs/src/core/slice-landing-types.ts
/** What survives the length limit, crediting the text the paste replaces. */
slice: ContentSlice;
```

## What other editors do

Read from the local clones at ProseMirror view `ca4c78e` with state `ffad5d9` and transform `662b7a9`, Lexical `dd5c41b13`, Slate `945a484df` and Tiptap `91c51be53` (`docs/plans/artifacts/2026-10-14-paste-landing-target/how/explorer-3.out.md`, source read, not run). None of them gives a paste hook the placed target, a state scoped to the region and the trimmed content together.

| Editor | When the paste hook runs | Whole-node selection | State a hook sees in a nested region | Length limit |
| --- | --- | --- | --- | --- |
| ProseMirror | `transformPasted` and `handlePaste` run before `replaceSelection`, which can still move the insert point (`prosemirror-transform/src/replace.ts:418`) | Same hooks and replace path as a text selection | The containing view's full state; only a separate inner `EditorView` has its own | None in core |
| Tiptap | ProseMirror's hooks; paste rules run after insertion on the result | Delegated to ProseMirror | As ProseMirror | CharacterCount trims the finished transaction, after hooks saw full content |
| Lexical | Import hooks and `SELECTION_INSERT_CLIPBOARD_NODES_COMMAND` run before the selection's insertion moves or deletes | Same hooks, then a node-selection insert path | An ancestor listener runs with the ancestor's state while its `editor` argument is the child | The playground's MaxLength transform trims after the update |
| Slate | `insertData` and `insertFragmentData` run before `insertFragment` moves `at` out of inline edges | No node selection type | A nested Editable uses its own editor | None in core |

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| One paste site: root, placed range or selected blocks, budget | Plite | `plitejs` (`src/core/public-state.ts`, `src/core/slice-landing.ts`) | Root scoping and fitting live in `public-state.ts`; command policy lives in `slice-landing.ts` |
| The landing read's state reads the site's root | Plite | `plitejs` (`src/core/slice-landing.ts`, importing `createEditorViewRuntime` from `src/editor-runtime-view.ts`) | The read registry already takes a state source, and a root view already scopes every read; the brief keeps `editor-runtime-view.ts` closed, so core imports it instead of the view runtime registering a factory |
| Open edges in an undeclared root | Plite | `plitejs` (`src/core/slice-fit/compiled-slice-fitter.ts`) | The fitter owns placement; the root fallback already exists one function over |
| List's named-root refusal removed | Plate | `platejs` (`src/features/list/lib/listPaste.internal.ts`) | It only dodged the wrong-root state |

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Paste over a node selection under `maxLength` | Lands the trimmed content with a valid caret instead of throwing; credits every selected block; a paste cut to nothing changes nothing | Bun contract tests in `max-length-contract.test.ts` (model and selection), one through the DOM clipboard import |
| Lines pasted over a selected image or block | Replace the selection whole; before, they went into the first block's text or the image's caption | Bun contract test; hand drive over a selected image on `/docs/media`, which sets no `maxLength`, so it covers the whole-block write and not the limit |
| Paste over a selected void block or empty container | Replaces it whole, as before | Bun contract test |
| Paste over a selected inline node, such as a link | Writes at the node's range, as before | `test/dom/data-transfer-format.test.ts` |
| Paste into a named root | Open edges merge as in the main root; List lands whole items | Bun contract tests in `slice-landing-contract.test.ts` and `BaseListPlugin.spec.tsx`; hand drive in the editable void's child root and a header line on `/examples/plite/multi-root-document` |
| Undo after a node-selection paste | One step, as before | The cut node-selection test undoes once; the hand drive undoes once |
| Clipboard event handling, focus, caret after paste | Unchanged code; the command's result feeds them | Managed Chromium specs `editable-voids`, `multi-root-document`, `synced-blocks`, `paste-html` and `plaintext` on the native clipboard transport, the projected Vitest suites, and the hand drive: exact blocks, caret, typing after the paste and one undo |
| Named-root List paste and `maxLength` in a browser | No www page has either | Bun only; named as a limit |

## Main changes

- The replacement command resolves one paste site through `resolveSliceFitSite`, which replaces `readAtSliceFitTarget` and returns the site. The site is an instance of a class with `#private` fields that only `public-state.ts` constructs and exports as a type alone. A range site holds the root and the placed range with any child-boundary bounds. A blocks site holds the root and the selected blocks. A node selection that holds an inline node gets a range site at the first node's placed range, plus the other selected nodes to remove, and keeps the caller's `hanging` and `voids` options. When the command's state holds no selection, `planPaste` asks the target runtime for the caret before it resolves the site, through the function `resolveTarget` uses, which maps a stored caret into a command frame. The site's root, budget and landing state then come from that caret, and a reported node selection gets a blocks site. Without a reported caret the paste lands at the default location only when the editor holds no selection in any root. The writer `fitSliceAtSite` reads the private fields, so a copied or hand-built object cannot stand in for a site. The target and the budget come from the site, and `readAtSliceFitSite` runs a read in the site's root.
- `getCurrentNodeSelection` and `getNodeSelectionReplacement` move from `editor-commands.ts` to `public-state.ts`, with `asBlockEntries` and `replaceSelectedBlocks`, so typing and pasting over selected blocks share one whole-block check and one write.
- The budget credits the text the write replaces. A range paste credits its placed range, and raw `tx.slice.replace` and `state.slice.fit` credit theirs the same way. A blocks site credits all the text of every selected block, as `docs/vision/plite.md` 509-512 says. `text.string` over a node selection reads each text node under the selected nodes through the runtime `string`, so void and read-only element text stays out unless `voids: true`, as it does for a path or a range, and a selected block with no text reads as empty. Typing or pasting over a selected void credits only the text the document length counts.
- The command limits the paste before the landing read and cuts the read's output to the same budget. It refuses when the first cut leaves nothing of a nonempty paste. When the second cut empties a plugin's nonempty output, the plan records no slice, so the writer lands a fitting proposal for an empty block or changes nothing. `fitSliceAtSite` does not cut again.
- `fitSliceIntoActiveDraft` splits into the resolver and the writer, moved rather than rewritten. The change deletes the module WeakMap that carried the command's budget and flag to the fit.
- At a blocks site, `fitSliceAtSite` always replaces the selected blocks whole. It removes the other selected blocks and replaces the first with `replaceChildren`, the way `insertText` does. It wraps one open block's children, or closed inline content, in the default child as the base does, unless that block owns content roots the slice carries, and otherwise takes the slice's blocks with their open edges closed. The rule that decides whether an open edge can close also decides whether the slice carries a block's roots. It copies the slice's content roots with the helpers a fit uses and puts the caret at the end of the last text. It refuses when the schema cannot place the blocks there. An empty paste writes nothing over the first selected block's range and removes the others, as the base does. A selected void or empty container is still replaced whole.
- The landing read runs on the command editor when that editor's own root is the site root, whichever state the caller passed with it. Otherwise it runs on a view of the site root. `executeEditorRead` takes that view as a function and builds it only when the read has a handler, so a paste with no landing middleware builds no view.
- The command's policy moves to `slice-landing.ts` as `planPaste` and `writePaste`. `planPaste` resolves, budgets, limits, runs the read and prepares a proposal. It returns the plan with the slice after the first limit and the read's output before the cut. `writePaste` writes the plan in the active draft and returns the content it wrote, so a caller can report loss at either cut. `editor-commands.ts` keeps the descriptor. Once another session's unfinished copy-as-paste path in `transfer.ts` lands, it calls the same two functions.
- The fitter admits top-level blocks at a root that has no content program. Raw fits and block-boundary inserts in such a root change with it.

## Decisions

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Paste target and budget | Two resolutions: a hand-built node-selection target with a third root rule, and a location target read before the caret is placed; the fit resolves a third time; the budget credits the requested range | One site per paste, resolved once in its root after `landTextWrite` and `unhang`; the target and budget derive from it, and the budget credits the text the write replaces | Plite command (`slice-landing.ts`) over the root resolver (`public-state.ts`) | One rule for every branch; the target names the block the fit writes; a credit for text that stays lets the document pass `maxLength` | Builder, raw fits, `SliceLandingTarget` JSDoc, docs | Steps 1 to 3 | A hanging range or node key that lands in an empty block becomes an `empty` target; a range that a content rule shrinks gets a smaller budget | rearchitect |
| Command budget handoff | Module WeakMap keyed by runtime owner, consumed by the next fit | The site is an argument of the writer, a class instance whose `#private` fields only the resolver sets, exported as a type alone and stamped with the document it read; the build dropped the stamp, as Close says | `public-state.ts` | Hidden side channel; any fit in between would take the budget; a writer that took a plain or branded record would let another module copy a site and change its range | none | Step 2, raw contract tests | none | cut |
| Landing read state | The command editor's state, whatever root the paste lands in | The command editor when its root is the site root, otherwise a view of the site root, built only when a plugin registers a landing middleware | `slice-landing.ts` | Paths in `target.block` must read the tree they belong to | List drops its refusal; docs | Step 1 state tests, List numbering test, step 7 cohorts | One view per cross-root paste in an editor with a landing middleware; core imports the view runtime | rearchitect |
| Node-selection replacement | Insert before remove, caret from the uncut text, no budget; every other slice, one with content roots included, writes at the first block's range, into an image's caption or past a hidden block | Every paste over selected blocks replaces them whole with `replaceChildren`, open edges closed and content roots copied, credited with all their text; a selection holding an inline node keeps its range write | Plite writer (`public-state.ts`) | The insert limit saw the old text, so it inserted nothing and the caret threw; the range write put lines into a selected image's caption and lost a paste's head past a hidden block; in a browser a refused paste falls through to plain text, which replaces whole anyway | none | Step 1 node tests, the DOM clipboard test | Lines pasted over selected blocks no longer keep the first block's type and text; a hidden selected block is deleted | rearchitect |
| Undeclared named root fit | A missing root program refuses the open-block candidate, so open edges split | The root boundary falls back to `rootCanContain` | Plite fitter | Validation already accepts any blocks in such a root | none | Step 1 command and raw tests | Raw fits and block-boundary inserts there merge now | rearchitect |
| List named-root refusal | Refuses whole-item replacement in a named root | Removed | Plate List | The refusal only dodged the wrong-root state | One spec expectation flips | Step 5 | none | cut |
| Paste policy home | Inline in the 1,200-line `editor-commands.ts`, and copied into another session's unfinished `transfer.ts` | `planPaste` and `writePaste` in `slice-landing.ts`; the builder keeps the descriptor | `slice-landing.ts` | One policy for paste and copy-as-paste | `transfer.ts` in the working tree | Steps 3 and 8 | An edit to another session's uncommitted hunk | rearchitect |

### Design arena

`architect` ran three independent runners on one brief (`docs/plans/artifacts/2026-10-14-paste-landing-target/architect/runner-brief.md`): Opus 5.5 at high, gpt-6-astra at xhigh and gpt-6.1-sol at xhigh, with an Opus cross-judge on anonymized copies. All three converged on one private site resolved once, the landing read on a root-matched state, the node selection as a `context` target, `replaceChildren` for the direct node write, and the one-line fitter fallback. The judge scored the Sol and Opus candidates level and picked the Astra candidate's typed site and structural fallback as the base; its write-up swapped the labels of two candidates, so the lead read the grafts by content.

The synthesis takes the Opus split of `fitSliceIntoActiveDraft` into a shared resolver and writer, so raw and command paths cannot drift; the Sol rule that reuses the command editor when its root already matches; the Astra and Sol rule that the command credits the landed range; and the Astra and Sol tests for a hanging range and a node key that land in an empty block.

The lead overruled the judge on two points. Middleware output past the budget is still trimmed to it, as today, rather than refused; refusing is a behavior change no gap asks for, and the existing zero-budget test passes either way. The node-selection fallback kept landing the first block's range rather than switching to the child-interval mode, since that mode would write into content a review rule hid. Plan review round 3 then removed the fallback for selected blocks, so every paste over them replaces them whole. Both are Defaults rows.

Prototypes settled three premises before the pick (`docs/plans/artifacts/2026-10-14-paste-landing-target/proto/`): the landed target alone leaves all 130 Plite contract cases and 221 List cases green and lands the removed-block case in the live block; the root view is what makes List read its own root, since dropping the refusal without it continues the main document's list inside the note root; and the fitter fallback merges open edges in an undeclared root with the contracts still green.

### Named limits

- Typing over a node selection in another root from the main editor counts the main root's text, because `insertText`'s node branch limits on the command state (`editor-commands.ts`, `limitTextInsert(state, text, { at: nodeSelection })`). Typing over a range that starts in hidden text credits the requested range while `insert-text.ts` writes at the placed one, so the document can pass `maxLength`. Both are text inserts, outside these five gaps, and go to one follow-up task.
- A paste over selected blocks deletes a hidden selected block. The base already does so for closed pastes. In a browser it also does so through the plain-text fallback that a refused paste falls through to.
- A node selection that holds an inline node keeps the base's write at the first node's placed range and removes the other selected nodes. No gap covers it, and `test/dom/data-transfer-format.test.ts` pins its result.
- An open paste over a selected block in a slot that cannot hold the pasted blocks refuses, where the base fitted the first block's text into the selected block and put the rest after the slot. Two headings pasted over a paragraph in a paragraph-only quote show it (`docs/plans/artifacts/2026-10-14-paste-landing-target/probes/guard-refusals-base-a1.log` and `docs/plans/artifacts/2026-10-14-paste-landing-target/build/probes/guard-refusals-build-a1.log`). The whole-block write places the slice's blocks closed, and in a browser a refused paste falls through to plain text.
- With `maxLength` set, a paste or typing throws when the document's first or last block has no text node, such as an empty container. The length count reads the document's text through a range, and such a block has no start or end point. The base throws the same way, and the owner is `src/editor/string.ts`, outside the brief's files (`docs/plans/artifacts/2026-10-14-paste-landing-target/build/probes/seat-void-open-build-a1-a1.log`). It goes to a follow-up task. A selected block with no text no longer throws, since the credit reads text nodes rather than a range.
- A closed paste over selected blocks whose blocks name a content root the slice does not carry writes them whole, and the document's root validation throws when the result breaks root ownership, such as a second owner of an exclusive root. The base throws the same way. A refusal keyed on whether the slice carries the roots also refused valid writes, such as replacing an exclusive root's owner with another owner of that root, so diff round 3 removed it (`docs/plans/artifacts/2026-10-14-paste-landing-target/panel-diff-3/astra-probes/root-copy/self-replace.ts`). A hand-built slice whose carried root names a root the slice lacks also throws over selected blocks, where the base's range write validated the document and refused (`docs/plans/artifacts/2026-10-14-paste-landing-target/panel-diff-3/fix-probes/root-and-text-probe-wtfix-a1.log`). A slice Plite exports always carries the roots it reaches. Validating a whole-block write against the schema goes to a follow-up task.
- A landing middleware that reads `state.selection()` sees a selection held in another root when the command editor is reused, and none from a view of the same root. Editors and views already differ this way; the five gaps do not cover it.
- `src/core/slice-landing.ts` imports `createEditorViewRuntime` from `src/editor-runtime-view.ts`, which imports `core/editor-commands.ts` back. It works because each side reads the other only inside functions. A root-scoped owner state is not a substitute: it reads paths in the root but reports no view root and the main page's children (`docs/plans/artifacts/2026-10-14-paste-landing-target/probes/base-root-state-a1.log`). The landing read's `state` is public, so `view.root()` and `children()` must name the root its paths belong to, or a middleware that builds a point from `view.root()` writes into the main page. Having the view runtime register its factory with core removes the cycle, and it edits a file the brief keeps closed.
- A view's first read runs every plugin's read-group factory, so a cross-root paste in an editor with a landing middleware pays one view and one factory call per read group. Step 7 counts both.
- No www page registers a landing middleware where a paste crosses roots, so the browser proof covers the reused-editor branch only. The view branch, named-root List paste and `maxLength` are proven in Bun.
- Changing the docs pages regenerates `apps/www/public/r/*-docs.json`, and List's named-root change belongs in the unreleased `.changeset/list-scoped-api.md`. Both are outside the brief's files, so they wait for the owner.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Plugin output past the length limit | Cut it to the limit before writing, as today (look) | Refuse the whole paste | refuse oversized | small |
| Which block a paste over selected blocks reports | The innermost block where the first selected block starts, as today | The selected block itself, even a container | selected block | detail |
| What the length budget gives back | Only the text the paste replaces, also for code that skips the paste command | All the text in the range the caller asked for | requested credit | detail |
| How plugins see the target's area | Give them the editor itself when it already shows that area, otherwise a view of that area, made only when a plugin reshapes pastes | Build a new internal reader for one area | area reader | detail |
| Where the core gets that view | Import the view code into the core (look) | Have the view code register itself with the core, which edits a file outside the brief | register view | detail |
| Lines pasted over selected blocks | Replace the blocks whole, so the paste replaces a selected image instead of becoming its caption (look) | Write into the first selected block's text, as today | keep block text | small |
| The length limit leaves nothing to paste over selected blocks, or empties a plugin's output | Leave the blocks alone, like a paste at the caret | Delete the selected blocks | delete on empty | detail |
| Typing over selected blocks in another area | Left for a follow-up task | Fix it here too | fix typing | small |
| Where the build runs | In a clean copy of the merge, then copied into your working tree on top of other sessions' unfinished edits (look) | Edit the working tree directly | edit in place | small |
| Another session's unfinished drag-to-copy code, which uses helpers this change deletes | Wait until that code is committed before putting this change in your working tree; after an hour, ask you (look) | Rewrite that session's code myself now | adapt transfer | small |
| Files beyond the brief's list | Add this plan and its log, add this run's rows to the suggested-task list, and update the unreleased release note about the paste plugin hook (look). The docs pages and the landing lines in the Plite vision doc explain the paste hook, so the brief already allows them. Git ignores the run folder and the todo file | Leave those to you | brief files only | small |

## Steps

- [x] 1. Write the failing-first tests and run them red at `2591fb926a`. In `packages/plitejs/test/slice-landing-contract.test.ts`: a node-selection paste shows the read the limited slice and a `context` target on the first selected block; the read's `state` reads the target root from the main editor, a header view, a view of a view and a header view pasting into the main root; a content rule that hides an empty block makes the proposal land in the live block with its own properties; a hanging range and a node key that land in an empty block give an `empty` target; open edges merge in an undeclared named root through the command and through raw `tx.slice.replace` and `state.slice.fit`; plugin output past the budget is cut to it at a caret and over a node selection, also when it grows into two blocks; an open paste over a selected object block replaces it whole; a DOM clipboard paste over selected blocks in `notes` lands in `notes` within its limit; the read's `state` sees changes made earlier in the same update, in an extended draft and inside `withEditorUpdateRootScope` through `domCommands.insertData`, the shape `mutation-controller.ts` uses. In `packages/plitejs/test/max-length-contract.test.ts`: a cut paste over one selected block and over a disjoint selection lands with a valid caret and undoes in one step; an open paste credits every selected block; a node selection in `notes` is limited by the `notes` text; an open paste over a hidden first selected block or a selected container replaces it whole within the budget; a paste the limit cuts to nothing over selected blocks changes nothing; a whole-block paste credits a hidden selected block's text; a range paste that leaves hidden text credits only its placed range, through the command and a transaction. In `packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx`: whole items pasted below a list in a named root continue that root's list, not the main document's. Three cases guard behavior the new code could break and pass at the base too: a selected void or empty container is replaced whole, a slice with content roots pasted over a selected block copies its root, and a paste at a block boundary beside an empty block inserts after it with a `context` target. Proof: `tooling/scripts/proof-worktree.mjs --expect-fail` at the base with each test file, one log per file, each failing case named. Done: `docs/plans/artifacts/2026-10-14-paste-landing-target/build/red-landing-r3-a1.log` (10 cases fail), `docs/plans/artifacts/2026-10-14-paste-landing-target/build/red-max-length-r3-a1.log` (8) and `docs/plans/artifacts/2026-10-14-paste-landing-target/build/red-list-a1.log` (1); the three guards pass.
- [x] 2. Split `fitSliceIntoActiveDraft` in `packages/plitejs/src/core/public-state.ts` into a place resolver and a writer, moved rather than rewritten. `readAtSliceFitTarget` hands its callback a site, an instance of a class with `#private` fields that only this file constructs and exports as a type alone, stamped with the document it read. Export `fitSliceAtSite`, which writes a slice at such a site in the active draft, with an optional empty block it replaces whole, and refuses a site from another document. At a blocks site it replaces the selected blocks whole as Main changes says, copying content roots with `remapContentSliceRoots` and `materializeContentSliceRoots`. Raw fits limit by their placed range. Delete `CommandSliceFit`, `commandSliceFits` and `withCommandSliceFit`. Proof: `slice-fit-contract.test.ts` stays green and the raw credit case passes.
  Built: `readAtSliceFitTarget` became `resolveSliceFitSite`, which returns the site, and `readAtSliceFitSite` reads in its root. The site carries no document stamp, since no entry hands the writer a stale or copied site. Both are deviation rows in the log.
  Done: `docs/plans/artifacts/2026-10-14-paste-landing-target/build/step-proofs/slice-fit-contract-a1.log` (87 pass) and `docs/plans/artifacts/2026-10-14-paste-landing-target/build/step-proofs/max-length-contract-a1.log` (29 pass, the raw credit case included).
- [x] 3. Write `planPaste` and `writePaste` in `packages/plitejs/src/core/slice-landing.ts`, and reduce the builder in `editor-commands.ts` to calling them. `planPaste` resolves the site, budgets the text its write replaces, limits, runs the landing read on a root-matched state, cuts the read's output to the same budget, and prepares a proposal through the same state. It returns the plan with the slice after the first limit and the read's output before the cut. `writePaste` writes the proposal or the slice through `fitSliceAtSite` in the active draft, removes the other nodes of an inline node selection, and returns what it wrote. Delete `resolveSliceLandingTarget`, `toSliceRange`, the exported `rootField` and the builder's own node-selection branch. Proof: the step 1 Plite tests pass; `test/dom/data-transfer-format.test.ts`, `command-spec.test.ts` and `slice-fit-contract.test.ts`, which pin node-selection pastes, stay green; the landing-pins and round2 probes and the round 3 seat probes rerun on the build.
  Done: `docs/plans/artifacts/2026-10-14-paste-landing-target/build/step-proofs/slice-landing-contract-a1.log` (35 pass), `docs/plans/artifacts/2026-10-14-paste-landing-target/build/step-proofs/data-transfer-format-a1.log` (37), `docs/plans/artifacts/2026-10-14-paste-landing-target/build/step-proofs/command-spec-a1.log` (67) and `docs/plans/artifacts/2026-10-14-paste-landing-target/build/step-proofs/runtime-contracts-a1.log` (841). The probes reran on both trees in `docs/plans/artifacts/2026-10-14-paste-landing-target/build/probes/`, and a decision-log row judges each difference.
- [x] 4. In `packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts`, let `canInsertContentAtBoundary` admit `content.every(rootCanContain)` at a root boundary with no content program, and keep the refusal for an element parent without one. Proof: the step 1 undeclared-root tests pass, and `transfer-contract.test.ts` stays green.
  Done: `docs/plans/artifacts/2026-10-14-paste-landing-target/build/step-proofs/slice-landing-contract-a1.log` and `docs/plans/artifacts/2026-10-14-paste-landing-target/build/step-proofs/transfer-contract-a1.log` (45 pass).
- [x] 5. In `packages/platejs/src/features/list/lib/listPaste.internal.ts`, drop the `target.root !== undefined` refusal, and change the spec "keeps a content root on the ordinary paste path" to expect the whole-item replacement. Proof: `BaseListPlugin.spec.tsx` passes, the new numbering test included.
  Built: the old spec and the step 1 numbering test pasted whole items onto an empty line in the same fixture, so they merged into one spec, "continues the list a named root holds when whole items land on its empty line". It is a deviation row in the log.
  Done: `docs/plans/artifacts/2026-10-14-paste-landing-target/build/partitions/platejs-standard-list-a1.log` (250 pass).
- [x] 6. Teach the new contract: the JSDoc in `slice-landing-types.ts`, the landing paragraphs of `content/docs/api/core/plate-plugin.mdx` and `content/docs/(guides)/clipboard.mdx` with their Chinese twins through `plate-docs`, the landing bullets in `docs/vision/plite.md`, and the unreleased `.changeset/list-paste-object-boundary.md` line through `changeset`, all under `best-api repair`. Proof: the teaching sweep log and the docs checks the `plate-docs` run names.
  Done: `docs/plans/artifacts/2026-10-14-paste-landing-target/build/teaching-sweep-a1.txt`, `docs/plans/artifacts/2026-10-14-paste-landing-target/build/www-build-source-a3.log` and `docs/plans/artifacts/2026-10-14-paste-landing-target/build/www-docs-parity-a3.log`. `pnpm check:docs` stops at its API reference link, which needs built packages (`docs/plans/artifacts/2026-10-14-paste-landing-target/build/www-check-docs-a1.log`), so its later links ran on their own. A fresh reader answered the contract's four questions from the docs alone (`docs/plans/artifacts/2026-10-14-paste-landing-target/build/forward-test/reply.md`), and the three ambiguities it found in this change's lines are fixed. The regenerated `apps/www/public/r/*-docs.json` stays with the owner, as Named limits says.
- [x] 7. Rerun the PR 5168 paste work-count probe at the base and the build, alternating, with three new cohorts: a cross-root paste in an editor with List's landing middleware, a paste over a selected block, and an open paste over a disjoint block selection, each at two document sizes. Each cohort also counts view constructions and read-group factory calls, at 1 and 50 plugins with a read group. Proof: no old cohort's counted work grows; the new cohorts add at most one view and one factory call per read group per cross-root paste; a log per tree.
  Done: `docs/plans/artifacts/2026-10-14-paste-landing-target/build/work-count/work-count-a2.md` from `docs/plans/artifacts/2026-10-14-paste-landing-target/build/work-count/work-count-a2.log`, checked in `docs/plans/artifacts/2026-10-14-paste-landing-target/build/work-count/work-count-a2-checklist.md`, with the known-bad control `docs/plans/artifacts/2026-10-14-paste-landing-target/build/work-count/known-bad-a1.log`. Base and build rows share one alternating log.
- [x] 8. Wait until the Transfer landing session's copy-as-paste work in `transfer.ts` lands, since its uncommitted code imports helpers this change deletes. Then copy each working-tree file this change touches that holds another session's edits to the run directory, apply the build's patch on top with a three-way merge, and point `transfer.ts`'s copy-as-paste path at `planPaste` and `writePaste`, reporting loss when the first limit cut the paste or the content written differs from the read's output. Add a `transfer-contract.test.ts` case where a landing middleware grows a copied paste past the limit and the copy reports the loss. Rerun all three Plite contract files, `slice-fit-contract.test.ts`, `transfer-contract.test.ts`, `BaseListPlugin.spec.tsx`, the Vitest suites `test/react/projected-clipboard-contract.test.ts` and `test/react/projected-command-contract.test.ts`, `pnpm --filter plitejs typecheck`, and the platejs spec typecheck against the same run at `HEAD` in a detached worktree. Proof: the copies, the apply log and one log per rerun.
  Built: the copy-as-paste work landed in `1a9a7cbf1e`. The build was merged onto that head in the detached worktree `wt-merge`, three-way where `editor-commands.ts` conflicted. `transfer.ts`'s copy-as-paste path calls `planPaste` and `writePaste`, and diff round 3 reviewed it. `transfer-contract.test.ts` gains "reports the loss when a slice landing read grows a text copy past the limit". `docs/plans/artifacts/2026-10-14-paste-landing-target/step8/deliver.sh` copied the one task file that held another session's edits to `docs/plans/artifacts/2026-10-14-paste-landing-target/step8/pre-apply-final/`, then applied `docs/plans/artifacts/2026-10-14-paste-landing-target/step8/deliver-final.patch` with `git apply`. Every task file then matched freeze `bc1016c3f3`, and `transfer-contract.test.ts` kept that session's staged hunk. The last check that edits code reordered one import in `compiled-slice-fitter.ts` and flagged an unneeded cast in `transfer.ts`, which this change removes; both already fail the same way at `HEAD` (`docs/plans/artifacts/2026-10-14-paste-landing-target/step8/lint-task-head-a1.log`, `docs/plans/artifacts/2026-10-14-paste-landing-target/step8/lint-task-main-a2.log`).
  Done: on `HEAD` plus the final task bytes, every rerun passes (`docs/plans/artifacts/2026-10-14-paste-landing-target/step8/suites-final-a2.txt`, `docs/plans/artifacts/2026-10-14-paste-landing-target/step8/projected-vitest-final-a1.log`), except the authored case "returns invalid when the document a decision resolves holds a property its new site refuses" and a `TS7022` in `authored-tree-recording-laws.slow.ts`, which fail the same way at `HEAD` (`docs/plans/artifacts/2026-10-14-paste-landing-target/step8/head-plitejs-authored-a1.log`, `docs/plans/artifacts/2026-10-14-paste-landing-target/step8/head-plitejs-typecheck-a1.log`). The working tree's own run (`docs/plans/artifacts/2026-10-14-paste-landing-target/step8/suites-main-a1.txt`) also carries other sessions' edits. Its standard-list partition fails with a module-init cycle that `HEAD` plus only those edits shows too (`docs/plans/artifacts/2026-10-14-paste-landing-target/step8/platejs-standard-list-others-a1-a1.log`). Its tests typecheck reports unused `@ts-expect-error` lines in `create-editor-options.test.tsx` that `HEAD` plus this change alone does not. An authored collab case failed there once, then passed alone three times and on a partition rerun (`docs/plans/artifacts/2026-10-14-paste-landing-target/step8/plitejs-authored-main-a2-a1.log`).
- [x] 9. Prove the browser path on the build worktree while step 8 waits, with its dependencies linked and its env files copied, then rerun the specs on the working tree after the apply. Run the managed Chromium specs `editable-voids`, `multi-root-document`, `synced-blocks`, `paste-html` and `plaintext`. Hand drive on `www-drive` in Chrome, which has a native clipboard: on `/docs/media`, click an image, read the selection's `kind` as `node`, and paste two copied lines over it, which replace it whole; on `/examples/plite/multi-root-document`, paste open text into the middle of a header line; on `/examples/plite/editable-voids`, paste into the void's child root; on `/docs/list`, paste list items into an empty line. Each checks the exact rendered blocks, the caret, typing after the paste and one undo. Route the five unmapped source files to those pages. Proof: the spec logs, the screenshots and `hand-drive.mjs check`.
  Built: the specs ran in the detached worktree `wt-browser` on `HEAD` plus the task's bytes, not on the working tree after the apply, which also carries other sessions' edits. The four Chrome drives served the working tree. It is a deviation row in the log.
  Done: the managed Chromium specs ran on `HEAD` plus the final task bytes, and again after the close fix with the same counts (`docs/plans/artifacts/2026-10-14-paste-landing-target/close-fix/run-specs-fix4.txt`). plaintext passed 52 and skipped 1, editable-voids passed 24, multi-root-document 17 and synced-blocks 46. paste-html passed 15 and failed "restores Apple converted spaces before an IME follow-up", which fails the same way at `2591fb926a` and at `HEAD` (`docs/plans/artifacts/2026-10-14-paste-landing-target/build/browser/paste-html-final-a1.log`, `docs/plans/artifacts/2026-10-14-paste-landing-target/build/browser/paste-html-base-a1.log`, `docs/plans/artifacts/2026-10-14-paste-landing-target/build/browser/paste-html-head-a1.log`). The four paste drives ran in Chrome with a native copy and paste on `www-drive`, serving the working tree, and each checked the blocks, the caret, typing after the paste and undo (`docs/plans/artifacts/2026-10-14-paste-landing-target/step9/chrome-paste-drives.md`). On `/docs/media` a click on the image gives a node selection that `read.selection.nodes()` reports; `read.selection()` itself carries no `kind` there. Chrome's window would not grow past 606 px, so the desktop cells ran in the built-in browser. Eight source files had no page, not five, and all are routed to the drive pages, except `slice-landing-types.ts`, which holds only types. `hand-drive.mjs check` passed (`docs/plans/artifacts/2026-10-14-paste-landing-target/step9/hand-drive-check-a1.log`). After the close fix, `public-state.ts` is routed to no page, since the fix changes only an empty paste over selected blocks, and the check passed again (`docs/plans/artifacts/2026-10-14-paste-landing-target/step9/hand-drive-check-a4.log`).

## Completion Gates

| Gate | Artifact |
| --- | --- |
| `pstack:blast-radius` on the public contract change before code moves | `docs/plans/artifacts/2026-10-14-paste-landing-target/build/blast-radius.md` |
| Each planned guard reproduced through its public entry before the build | step 1's red runs at `2591fb926a` (`docs/plans/artifacts/2026-10-14-paste-landing-target/build/red-landing-r3-a1.log`, `docs/plans/artifacts/2026-10-14-paste-landing-target/build/red-max-length-r3-a1.log`, `docs/plans/artifacts/2026-10-14-paste-landing-target/build/red-list-a1.log`) and the refusal probes at the base and the build (`docs/plans/artifacts/2026-10-14-paste-landing-target/probes/guard-refusals-base-a1.log`, `docs/plans/artifacts/2026-10-14-paste-landing-target/build/probes/guard-refusals-build-a1.log`) |
| `api-build` panel on the build's diff | three diff rounds, the cap, logged as `panel` rows in the decision log, with the seats' answers in `docs/plans/artifacts/2026-10-14-paste-landing-target/panel-diff-1/`, `docs/plans/artifacts/2026-10-14-paste-landing-target/panel-diff-2/` and `docs/plans/artifacts/2026-10-14-paste-landing-target/panel-diff-3/`; mutation runs `docs/plans/artifacts/2026-10-14-paste-landing-target/panel-diff-3/mutate-spec/mutate-a1.out` and `docs/plans/artifacts/2026-10-14-paste-landing-target/panel-diff-3/mutate-r3/mutate-a1.out` |
| Code quality review per slice | partial: `pstack:thermos` ran once at the close, after the panel cap, not before each slice's panel (`docs/plans/artifacts/2026-10-14-paste-landing-target/thermos/quality/reply.md`, `docs/plans/artifacts/2026-10-14-paste-landing-target/thermos/bugs/reply.md`) |
| The slice frozen with `freeze.mjs` after its review fixes | `bc1016c3f3` (parent `ebf56ca52a`), from `docs/plans/artifacts/2026-10-14-paste-landing-target/panel-diff-3/freeze-paths-final.txt`; the close fix as `3f0029aa64` (parent `bc1016c3f3`) |
| `pnpm check` steps the edits reach | the plitejs and platejs typechecks and test partitions on the final bytes (`docs/plans/artifacts/2026-10-14-paste-landing-target/step8/suites-final-a2.txt`); the platejs contracts and migrations typechecks against the base (`docs/plans/artifacts/2026-10-14-paste-landing-target/build/typecheck/run-typecheck.sh`) |
| `best-api repair` on the changed contract | `docs/plans/artifacts/2026-10-14-paste-landing-target/build/teaching-sweep-a1.txt` and the fresh reader's answers (`docs/plans/artifacts/2026-10-14-paste-landing-target/build/forward-test/reply.md`) |
| `plate-docs` on every docs page the change affects | `docs/plans/artifacts/2026-10-14-paste-landing-target/build/www-build-source-a3.log` and `docs/plans/artifacts/2026-10-14-paste-landing-target/build/www-docs-parity-a3.log`; `pnpm check:docs` stops at its API reference link, as step 6 says |
| Hand drive | `docs/plans/artifacts/2026-10-14-paste-landing-target/step9/hand-drive-check-a4.log` |
| Scale contracts through `benchmark` | `docs/plans/artifacts/2026-10-14-paste-landing-target/build/work-count/work-count-a5.md`, checked in `docs/plans/artifacts/2026-10-14-paste-landing-target/build/work-count/work-count-a5-checklist.md` |
| `oxlint --type-aware` file count before the diff panel freezes | partial: each round's run covered its changed files (`docs/plans/artifacts/2026-10-14-paste-landing-target/panel-diff-3/lint-task-a2.log`), so a type-aware finding in `transfer.ts` that predates this change surfaced after round 3 (`docs/plans/artifacts/2026-10-14-paste-landing-target/step8/lint-task-main-a1.log`) |
| Writing passes: `deslop`, `no-comments`, `unslop` | the `writing` rows in the decision log; comment-sicko's verdicts in `docs/plans/artifacts/2026-10-14-paste-landing-target/build/comment-sicko/reply.md` |
| Changeset per `changeset` | `.changeset/list-paste-object-boundary.md`, amended |
| `pnpm lint:task` on the task's paths | `docs/plans/artifacts/2026-10-14-paste-landing-target/step8/lint-task-main-a2.log`, and on the two files the close fix changed, `docs/plans/artifacts/2026-10-14-paste-landing-target/close-fix/lint-task-main-a1.log` |

## Proof

Behavior proof is the Bun contract tests above, red at `2591fb926a` and green on the build, run in a detached worktree at the base plus the task's patch and again in the working tree after the apply. `slice-fit-contract.test.ts` and `transfer-contract.test.ts` stay green; raw fits change only where a content rule moves the placed range or the root has no content program, and the step 1 tests pin both. The probes from the PR 5168 redo (`docs/plans/artifacts/2026-10-14-paste-landing-target/probes/`) rerun on the build. Browser proof is step 9: the managed Chromium specs on the native clipboard transport and one hand drive of a paste over a selected image, a header-root paste, a child-root paste and a list paste, each with exact blocks, the caret, typing after and one undo. The browser reaches only the reused-editor branch of the landing read; the view branch, named-root List paste and `maxLength` stay Bun-only.

## Close

Reversals and deviations come first.

- Diff round 3 reverted round 2's whole-block roots check, `copiesItsRoots`, because it refused valid writes. The claim narrowed: a closed paste whose blocks name roots the slice does not carry throws on validation, as at the base (Named limits).
- Diff round 3 replaced round 2's early refusal of an emptied landing output with a recorded empty slice, so the writer lands an empty-block proposal before it gives up. Main changes bullet 4 has the new wording.
- The build changed three approved items, each a deviation row: `resolveSliceFitSite` returns the site instead of handing it to a callback, the site carries no document stamp, and the List spec merged with the step 1 numbering test.
- Step 8 applied the merged diff with a plain `git apply`. The three-way merge onto `1a9a7cbf1e` ran earlier, in the detached worktree.
- Step 9's Chrome drives ran at 606 px, because Chrome's window would not grow. On `/docs/media`, `read.selection.nodes()` reports the image's node selection; `read.selection()` has no `kind` field there. Eight files had no page, not five.
- The thermos review ran once at the close instead of before each slice's panel. The type-aware lint before each panel freeze covered only that round's files, so an unneeded cast in `transfer.ts`, already present at `HEAD`, surfaced after the last round. Both gates are partial.
- The thermos bug review found that an empty paste over selected blocks threw in a named root where the base succeeded. I first deferred it to a follow-up and narrowed the claim. The decision-trail review flagged that as a miss of the brief's "the throw gone", so the close fixed it after all. That branch now writes the empty slice over the first block's range and removes the others, as the base did. Round 1 of the diff panel had swapped that for `fragment.delete`, which mishandles the caret. The fix ran after the panel cap, so no panel read it. Its proof is below.
- Step 9 planned to rerun the Chromium specs on the working tree after the apply. They ran in the detached worktree `wt-browser` on `HEAD` plus the task's bytes instead, because the working tree also carries other sessions' edits. The Chrome drives served the working tree.
- Before the ledger moved to its new format, I offered three cards, `task_455e43a6`, `task_9775bf62` and `task_1448e18c`. I withdrew them before you acted on them, and the same three tasks are now `t_809d49b3`, `t_1412a88d` and `t_b78aada2` in the ledger.

**What landed.** The working tree on `next` holds the change, uncommitted, in the 19 files of `docs/plans/artifacts/2026-10-14-paste-landing-target/panel-diff-3/freeze-paths-final.txt`. That is freeze `3f0029aa64`, which adds to `bc1016c3f3` the lint fix's import move, the cast removal, the four doc sentences the thermos review corrected and the close fix. The last lint run then rewrote one type annotation in a new test. Every paste resolves one site in its root, before the landing read. The budget counts only the text the write replaces. Plugins read the paste's own root. A paste over selected blocks replaces them whole, List pastes into named roots, and transfer's copy-as-paste runs the same plan.

**Proof and its limits.**

- Step 1's tests fail at `2591fb926a` (10 landing, 8 length and 1 List case) and pass on the final bytes. The step 8 suite set passes on `HEAD` plus the final bytes, except two cases that fail the same way at `HEAD`.
- Six panel rounds ran with three seats each: three on the plan and three on the diff. All 18 critical findings were applied and none dismissed. Each round-2 and round-3 fix makes its test fail when reverted: 7 of 7 and 4 of 4 mutations were caught.
- The work counts show no old cohort grows, and a cross-root paste with a landing middleware adds one view and one factory call per read group (`docs/plans/artifacts/2026-10-14-paste-landing-target/build/work-count/work-count-a5.md`).
- Five Chromium specs pass except one paste-html case, which fails the same way at the base and at `HEAD`. Four native paste drives in Chrome checked the blocks, the caret, typing and undo, and every hand-drive cell is covered.
- The close fix has three new tests: the last block and the only block of a named root, and a quote's only paragraph in the main root. Each fails when only the fix is reverted (`docs/plans/artifacts/2026-10-14-paste-landing-target/close-fix/mutate-a1.out`). The thermos reviewer's two fuzzers ran on the fixed tree. They found no throw the base lacks, where the tree before the fix had three, and no paste past `maxLength`. The 10 cases the fix changed now match the base (`docs/plans/artifacts/2026-10-14-paste-landing-target/close-fix/compare-p6-a1.log`, `docs/plans/artifacts/2026-10-14-paste-landing-target/close-fix/compare-p7-a1.log`). The step 8 suites, all 18 round-3 seat probes and the five Chromium specs give the same results as before the fix (`docs/plans/artifacts/2026-10-14-paste-landing-target/close-fix/suites-fix4-a1.txt`, `docs/plans/artifacts/2026-10-14-paste-landing-target/close-fix/probes-a3.txt`, `docs/plans/artifacts/2026-10-14-paste-landing-target/close-fix/run-specs-fix4.txt`). The step 7 work counts did not rerun. A paste with content does the same work, since the fix only moved one state read ahead of the empty-slice check.
- The limits are everything under Named limits. The browser reaches only the reused-editor branch of the landing read. The working tree's own suite run also shows failures that `HEAD` plus this change alone does not. A control run puts the standard-list failure on other sessions' edits. The unused `@ts-expect-error` lines in `create-editor-options.test.tsx` are only inferred to be theirs, because the control typecheck stopped at an earlier error. One authored collab case failed once and passed on four reruns, and nothing attributes it.

**Attention.**

reviewed by gpt-6.1-sol @xhigh, the decision-trail reviewer from another model family (`docs/plans/artifacts/2026-10-14-paste-landing-target/trail/seat-sol.md`)

- Deferring the empty-paste throw missed the brief's "the throw gone". It is fixed now, as the first reversal above says.
- A hand-built slice whose nested block names a root the slice lacks still throws over selected blocks, where the base refused. I kept that claim narrowed instead of fixing it. The panel rule sends a mechanism that already had its one replacement, here round 2's `copiesItsRoots`, back to planning instead of patching it again. `t_1412a88d` owns it. Look at this one if you want it fixed before you commit.
- The `CODING_STANDARDS.md` rules row still names `readAtSliceFitTarget`, which this change renamed to `resolveSliceFitSite`, so that row is now wrong. The brief kept that file closed, so it has its own Open work item below instead of hiding inside the cleanup task.
- The Defaults row "Files beyond the brief's list" now names every file this run wrote outside the brief's list.
- The thermos review ran late and the type-aware lint covered too few files before each panel. Both gates stay partial. The late review is why the empty-paste throw surfaced after the panel cap.
- The Close now says which working-tree failures a control attributes to other sessions and which are only inferred.
- The step 9 specs ran in a detached worktree instead of the working tree. That is now a deviation row and a reversal above.
- The writing-pass row for round 3's fixes cited the incoming round-3 diff. A `corrected` row now points at the fixes' own diff.
- The three withdrawn cards and their ledger ids are mapped in the reversals above.

**Reflect.** One Opus reviewer read the transcript through the judgment, tooling and divergent lenses (`docs/plans/artifacts/2026-10-14-paste-landing-target/reflect/reviewer.md`), and I sorted its 24 findings. None qualified to apply without you, so nothing changed and every accepted lesson waits in Backlog.

Backlog, each with owner: the owner, stop: the owner takes or drops it.

1. Have `check-playbooks.mjs` print a project playbook's merged steps as todos, so a step like the Build playbook's thermos review cannot get folded into a note and skipped. Also run thermos on the whole final diff after the last panel round, because panel fixes only get delta reviews.
2. Never defer a regression against the base as a warning or a limit. A deferred finding row would say what the base does, and `decisions-check.mjs` could require that.
3. For a refactor that claims to match the base everywhere outside its named fixes, plan a differential fuzz against the base from the start. Here a fuzz found what six panel rounds missed.
4. Add a check that every backticked name in a `CODING_STANDARDS.md` rules row still exists, and let a brief's file fence allow reference updates after a rename.
5. Have `freeze.mjs` refuse a panel freeze until a typecheck and a type-aware lint have covered every task file.
6. To blame a working-tree-only failure on other sessions, run a control worktree at `HEAD` plus only their uncommitted diff.
7. Ask seats for probes that take the tree as an argument, and copy each seat's probes into the run directory when it answers.
8. Message a linked session that owns a blocking file instead of polling git and the notes folder for its work.
9. Have the plan-page check refuse a stray `</content>` line that the Write tool sometimes leaves in a draft.
10. Run the managed Chromium specs with the Node version `.nvmrc` names, through `fnm exec`, since the shell's default differs.
11. Warm the editor once before a work-count probe counts, since the update view is built on the first transaction.
12. When a fix widened to its finding's class adds a guard, log its must-still-accept run. `decisions-check.mjs` could require it.
13. Say in `verify` that its shared-checkout worktree rule is for running acceptance, not for editing. Building in a detached worktree only moved the conflicts to the end.

Rejected:

- Rating severity on a realistic fixture. One reviewer raised it, and the rule to keep the seat's exact values partly covers it.
- Calling the existing owner. This run's `/pstack:correct` already settled it.
- Sibling fences duplicating a helper. It is speculative.
- `git -C` resolving a relative patch path. That is generic git behavior.
- zsh keeping seat flags as one word. Your zsh array rule covers it.
- The image caption click and Chrome's stuck window width. Both are too specific to last.

**Counts.** 9 of 9 steps are done. Of 14 Completion Gates, 12 are done and 2 partial, the thermos review and the type-aware lint; none are skipped, blocked or open.

No suggested task is free to start yet. `t_809d49b3`, `t_1412a88d` and `t_b78aada2` wait for the started tasks `task_347dc1bf`, `task_db3cd1c2` and `task_46ac463d`, which write the same paths. `task_f529d5ce` waits for `task_db3cd1c2` and `task_46ac463d`.

## Open work

- Fix `maxLength` counting for textless blocks and text inserts, and the forward caret of a direct `fragment.delete` over a named root's last block, which throws at the base too. Tracked in `docs/plans/suggested-tasks.decisions.tsv` as `t_809d49b3`. owner: the owner, through suggested task `t_809d49b3`. stop: `t_809d49b3` lands or the owner dismisses it.
- Settle whole-block paste validation against content roots, the shared-root open edge included. Tracked as `t_1412a88d` in the same ledger. owner: the owner, through suggested task `t_1412a88d`. stop: `t_1412a88d` lands or the owner dismisses it.
- In `CODING_STANDARDS.md`, the rules row "New code calls the existing owner instead of copying it" names `readAtSliceFitTarget` as the one export that runs the paste resolver. This change renamed it to `resolveSliceFitSite`, so the row is wrong until someone edits that one name. The brief kept that file closed. Tracked here and in `t_b78aada2`. owner: the owner. stop: the row names `resolveSliceFitSite`.
- Split the paste site resolver and the node-selection helpers out of `public-state.ts`, split the large landing test file, and rewrite the `CODING_STANDARDS.md` rules row that still names `readAtSliceFitTarget`. Tracked as `t_b78aada2` in the same ledger. owner: the owner, through suggested task `t_b78aada2`. stop: `t_b78aada2` lands or the owner dismisses it.
- Take or drop the 13 reflect Backlog items listed in the Close. Tracked in this plan's Close and the reflect rows of its decision log. owner: the owner. stop: the owner takes or drops each item.
- Report transfer's copy loss from a flag `planPaste` sets instead of comparing slice identities. Tracked as `task_db3cd1c2` in the same ledger. owner: the session running `task_db3cd1c2`. stop: `task_db3cd1c2` lands.
- Regenerate `apps/www/public/r/*-docs.json` for the four docs pages, and note List's named-root paste in the unreleased `.changeset/list-scoped-api.md`. Both are outside this change's files. Tracked in this plan's Named limits. owner: the owner. stop: the owner's next registry build and release-note pass.
