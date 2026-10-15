---
review_scopes: [clipboard, list]
review_basis:
work_kind: implementation
review_commit: 2591fb926a
review_inputs: [packages/plitejs/test/slice-landing-contract.test.ts, packages/plitejs/test/max-length-contract.test.ts, packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx]
review_upstreams: ['../lexical@dd5c41b13', '../prosemirror-view@ca4c78e', '../slate@945a484df', '../tiptap@91c51be53']
---

# One landing site for every paste

Status: building: plan review closed at its three-round cap
Page: https://claude.ai/artifact/2qgL4kC7eUvwhJNawAwgjT
Playbook: plan

Execution playbook: Build (`.agents/playbooks/build.md`). Run directory: `docs/plans/artifacts/2026-10-14-paste-landing-target/`. Intake base: `2591fb926a`, the merge of PR 5168 into `next`. Requested by the PR 5168 redo session as the follow-up "Unify paste landing for node selections and named roots", for the gaps that redo deferred (`docs/plans/2026-10-14-pr-5168-redo.md`, Open work).

## Brief

### What will change?

Every paste works out where it lands once, after the caret is placed. A paste over selected blocks replaces them whole without crashing at the length limit. Lists paste into captions and other side areas as into the main page.

### What could go wrong?

Plugins see the paste's area. A selection ending at a line's start can replace an empty line. Pastes over hidden text get less room. Lines pasted over selected blocks replace them whole. In undeclared areas, pasted text joins its neighbors.

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

- The replacement command resolves one paste site through `resolveSliceFitSite`, which replaces `readAtSliceFitTarget` and returns the site. The site is an instance of a class with `#private` fields that only `public-state.ts` constructs and exports as a type alone. A range site holds the root and the placed range with any child-boundary bounds. A blocks site holds the root and the selected blocks. A node selection that holds an inline node gets a range site at the first node's placed range, plus the other selected nodes to remove. The writer `fitSliceAtSite` reads the private fields, so a copied or hand-built object cannot stand in for a site. The target and the budget come from the site, and `readAtSliceFitSite` runs a read in the site's root.
- `getCurrentNodeSelection` and `getNodeSelectionReplacement` move from `editor-commands.ts` to `public-state.ts`, with `asBlockEntries` and `replaceSelectedBlocks`, so typing and pasting over selected blocks share one whole-block check and one write.
- The budget credits the text the write replaces. A range paste credits its placed range, and raw `tx.slice.replace` and `state.slice.fit` credit theirs the same way. A blocks site credits all the text of every selected block, as `docs/vision/plite.md` 509-512 says.
- The command limits the paste before the landing read and cuts the read's output to the same budget.
- `fitSliceIntoActiveDraft` splits into the resolver and the writer, moved rather than rewritten. The change deletes the module WeakMap that carried the command's budget and flag to the fit.
- At a blocks site, `fitSliceAtSite` always replaces the selected blocks whole. It removes the other selected blocks and replaces the first with `replaceChildren`, the way `insertText` does. It wraps one open block's children, or closed inline content, in the default child as the base does, and otherwise takes the slice's blocks with their open edges closed. It copies the slice's content roots with the helpers a fit uses and puts the caret at the end of the last text. It refuses when the schema cannot place the blocks there or the limit cuts the paste to nothing. A selected void or empty container is still replaced whole.
- The landing read runs on the command editor when its view root is the site root. Otherwise it runs on a view of the site root, which the command builds only when a plugin registers a landing middleware. `executeEditorRead` takes that view as a function and builds it on the first handler's read.
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
- With `maxLength` set, a paste or typing throws when the document's first block, or a selected block, has no text node, such as an empty container. The length count reads text through a range, and such a block has no start point. The base throws the same way, and the owner is `src/editor/string.ts`, outside the brief's files (`docs/plans/artifacts/2026-10-14-paste-landing-target/build/probes/seat-void-open-build-a1-a1.log`). It goes to a follow-up task.
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
| The length limit leaves nothing to paste over selected blocks | Leave the blocks alone, like a paste at the caret | Delete the selected blocks | delete on empty | detail |
| Typing over selected blocks in another area | Left for a follow-up task | Fix it here too | fix typing | small |
| Where the build runs | In a clean copy of the merge, then copied into your working tree on top of other sessions' unfinished edits (look) | Edit the working tree directly | edit in place | small |
| Another session's unfinished drag-to-copy code, which uses helpers this change deletes | Wait until that code is committed before putting this change in your working tree; after an hour, ask you (look) | Rewrite that session's code myself now | adapt transfer | small |
| Files beyond the brief's list | Add this plan and its log, and amend the unreleased release note that describes the paste plugin hook (look) | Leave those to you | brief files only | small |

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
- [ ] 8. Wait until the Transfer landing session's copy-as-paste work in `transfer.ts` lands, since its uncommitted code imports helpers this change deletes. Then copy each working-tree file this change touches that holds another session's edits to the run directory, apply the build's patch on top with a three-way merge, and point `transfer.ts`'s copy-as-paste path at `planPaste` and `writePaste`, reporting loss when the first limit cut the paste or the content written differs from the read's output. Add a `transfer-contract.test.ts` case where a landing middleware grows a copied paste past the limit and the copy reports the loss. Rerun all three Plite contract files, `slice-fit-contract.test.ts`, `transfer-contract.test.ts`, `BaseListPlugin.spec.tsx`, the Vitest suites `test/react/projected-clipboard-contract.test.ts` and `test/react/projected-command-contract.test.ts`, `pnpm --filter plitejs typecheck`, and the platejs spec typecheck against the same run at `HEAD` in a detached worktree. Proof: the copies, the apply log and one log per rerun.
- [ ] 9. Prove the browser path on the build worktree while step 8 waits, with its dependencies linked and its env files copied, then rerun the specs on the working tree after the apply. Run the managed Chromium specs `editable-voids`, `multi-root-document`, `synced-blocks`, `paste-html` and `plaintext`. Hand drive on `www-drive` in Chrome, which has a native clipboard: on `/docs/media`, click an image, read the selection's `kind` as `node`, and paste two copied lines over it, which replace it whole; on `/examples/plite/multi-root-document`, paste open text into the middle of a header line; on `/examples/plite/editable-voids`, paste into the void's child root; on `/docs/list`, paste list items into an empty line. Each checks the exact rendered blocks, the caret, typing after the paste and one undo. Route the five unmapped source files to those pages. Proof: the spec logs, the screenshots and `hand-drive.mjs check`.

## Completion Gates

| Gate | Artifact |
| --- | --- |
| `pstack:blast-radius` on the public contract change before code moves | pending |
| Each planned guard reproduced through its public entry before the build | pending |
| `api-build` panel on the build's diff | pending |
| Code quality review per slice | pending |
| The slice frozen with `freeze.mjs` after its review fixes | pending |
| `pnpm check` steps the edits reach | pending |
| `best-api repair` on the changed contract | pending |
| `plate-docs` on every docs page the change affects | pending |
| Hand drive | pending |
| Scale contracts through `benchmark` | pending |
| `oxlint --type-aware` file count before the diff panel freezes | pending |
| Writing passes: `deslop`, `no-comments`, `unslop` | pending |
| Changeset per `changeset` | pending |
| `pnpm lint:task` on the task's paths | pending |

## Proof

Behavior proof is the Bun contract tests above, red at `2591fb926a` and green on the build, run in a detached worktree at the base plus the task's patch and again in the working tree after the apply. `slice-fit-contract.test.ts` and `transfer-contract.test.ts` stay green; raw fits change only where a content rule moves the placed range or the root has no content program, and the step 1 tests pin both. The probes from the PR 5168 redo (`docs/plans/artifacts/2026-10-14-paste-landing-target/probes/`) rerun on the build. Browser proof is step 9: the managed Chromium specs on the native clipboard transport and one hand drive of a paste over a selected image, a header-root paste, a child-root paste and a list paste, each with exact blocks, the caret, typing after and one undo. The browser reaches only the reused-editor branch of the landing read; the view branch, named-root List paste and `maxLength` stay Bun-only.
