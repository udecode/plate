---
review_scopes: [list]
review_basis: [2026-10-11-list-first-principles]
verdict: pursue
work_kind: implementation
review_commit: 62e21e83977e0c124d5958e31e083e2dd5b31359
review_inputs: [packages/platejs/src/features/list/lib/BaseListPlugin.ts, packages/platejs/src/features/list/lib/listIdentity.internal.ts, packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx, packages/platejs/src/ai/react/AIChatPlugin.ts, packages/plitejs/src/core/public-state.ts, packages/plitejs/src/core/insert-limit.ts, packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts, packages/plitejs/test/slice-fit-contract.test.ts, packages/platejs/src/utils/plugins/ExitBreakPlugin.ts, docs/plans/2026-10-11-ai-list-landing.md, VISION.md, docs/vision/common.md, docs/vision/plate.md]
---

# List paste keeps copied items together

Status: executed; uncommitted, original page published
Page: https://claude.ai/artifact/DtbjYK46RvpbPugGTfdtoY
Playbook: build

The list paste repair and its object-boundary continuation are built. Decision audit T1 reopened the object route, which was reverted and redesigned in the 2026-10-14 iteration. The current replacement has passed three plan rounds and focused production checks. The final diff review and repeated paste acceptance passed. All code remains uncommitted. The original page now includes the completed work.

## Brief

### What will change?

Pasted list items now keep their nesting, land at the caret's depth and continue the target's numbering. Empty paragraphs and headings keep the first item's type, including inside containers. The empty item's restart wins.

### What could go wrong?

The shared paste code also serves AI, media and tables. Focused checks and five Chromium runs passed. Partial custom-object copies and collaborative-view identity still have documented limits. Full repository checks remain incomplete.

## Teach

Plate keeps list items side by side instead of nesting them. Each item is its own block and stores how deep it is. Its number comes from the items around it. Copying list text copies each item with its depth.

When you paste inside an item, the first copied item's text merges into the item under the caret, the same way plain text does. That merged item keeps the caret item's depth and style. The list plugin then leaves every other item at its copied depth, so items that were siblings end up apart.

The fix treats the copied items as a small tree. An item whose parent was not copied lands at the caret's depth, and a child keeps its offset under its parent. Numbered items continue the target's numbers. Pasting list items into an empty line gives the line the first item's type, so a checked task stays a checked task.

## Demo

1. Open the [list paste comparison](https://claude.ai/artifact/Sx8dQEJAwVFfpnnygFWnpE). Its six fixed results now match the product tests, using the same copied blocks and expected rows.
2. Start the docs app from `apps/www` with `PLATE_WWW_DYNAMIC_DOCS=1 PLATE_WWW_DEV_SOURCE=1 PLATE_WWW_DIST_DIR=.next-list-paste pnpm exec next dev --port 3297` and open `http://localhost:3297/blocks/list-demo`.
3. Select all of `Decimal 111` and `Decimal 112` and copy. Press Enter at the end of `Roman 3`, then paste. Both pasted items now sit beside `Roman 3` and read IV and V. Type, undo the typing, then undo and redo the paste. The clipboard test checks the source and caret too.
   The original run kept before and after screenshots locally under `artifacts/2026-10-13-list-paste/`. They are not included in this repository. The repeatable proof is [the native list clipboard suite](../../apps/www/tests/browser/list-keys.spec.ts).
4. For an occupied item, copy `Decimal 11` through `Decimal 12` and paste at `Rom|an 3`. The depths are now 1, 2, 2, 1. The model cases cover start, middle and end text joins; the native clipboard suite covers the empty-item case.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Which fixes | All five paste rules, for the best paste experience (look) | Depth and numbering only | depth only | big |
| Paste into a plain paragraph | Top items land at the first level (look) | They keep their copied depth | keep paragraph depth | small |
| Part of one block's text into an empty line | It takes the line's own type, as today | It takes the copied block's type | copied type for text | small |
| Comparison page | Same link, now with other editors' screenshots and a link to this plan | A separate new page | new comparison page | detail |
| Pasting into an item that has text | The first pasted item's text takes that item's type, as today | The pasted item keeps its type and changes your item | keep pasted type | small |
| Plain lines into an empty list item | The first line stays in the list, as today | It becomes a plain paragraph | plain first line | detail |
| Empty line inside a quote, table cell or column, or an empty heading | It keeps the first item's type there too, as you picked | Keep today's merge there | top-level only | small |
| Restart on both the copied item and the empty item | The empty item's restart wins, as you picked | The copied restart wins | copied restart wins | detail |
| Plan review | Three models review this plan before any code | Skip the panel, since no public API changes | skip panel | small |
| Google Docs check | Stop here, because Notion, ProseMirror and Lexical agree | Finish all nine Google Docs cases | finish google docs | detail |
| Browsers | Desktop Chromium, five runs per case | Add Firefox and WebKit | other browsers | small |
| Long-list cost | Compare work when the same later numbers change (look) | Require the old count even though it leaves those numbers unchanged | reopen suffix budget | detail |
| Object head in an empty line | Replace the empty block with the copied item (look) | Reopen the object-paste design | reopen object merge | small |
| Timing on this shared machine | Use work counts and native correctness; keep timing inconclusive (look) | Rerun on an unloaded machine before accepting a latency claim | rerun unloaded | detail |
| Verification scope | Finish with focused paste proofs (look) | Reopen repository checks | full checks | big |

## Report

- Route: `/blocks/list-demo` in the docs app, desktop Chromium, native copy and paste.
- Input: select all of `Decimal 111` and `Decimal 112`, both `indent: 3` siblings, and copy. Press Enter at the end of `Roman 3` (`indent: 1`, `upper-roman`) and paste into the new empty item.
- Today: the first item lands at `indent: 1` with `upper-roman` and the second keeps `indent: 3`. Text, caret, typing after the paste, undo and redo are correct.
- Expected: both items at `indent: 1`, in the target list, numbered IV and V. The source stays unchanged, the caret ends after `Decimal 112`, and one undo restores the state before the paste.

## Cause

Paste runs `replaceSlice`. Plite's slice fitter merges the first copied block into the block under the caret, and the merged block keeps the target's own properties, here `indent: 1` and `listStyle: upper-roman`. The list middleware's `around(editorCommands.replaceSlice)` in `BaseListPlugin.ts` calls `landListContent` with `placement: 'keep'`, which assigns `listId` and never changes depth. So the first item lands at the target's depth and every other item keeps its source depth.

The fitter merges this first block, the head, for an open slice, which a text selection produces. It also merges the head of a closed slice pasted into an occupied block. It replaces the block only when a closed slice lands in an empty block. In that one case every item keeps its source depth.

Keeping the copied depths is impossible whenever the head merges. It would need either moving the user's own item to depth 3 or dropping the text join that Notion and Google Docs both do. So the current rule fails in every case where the head merges, which is every text-selection paste.

A model probe reproduces all nine browser cells (three selections at the empty item and the start, middle and end of `Roman 3`) in about a second.

## History

The original review used local frozen snapshot `825a6c2aad6491205a46d8a6d0745db7f0724ed6`, which is outside this PR's published history. The dependency inventory pins published PR head `62e21e83977e0c124d5958e31e083e2dd5b31359` so a fresh checkout can check the declared inputs and their dependents. It replaces `a052e9da17308f1433cf710820365cd86e8f030f`, which became unavailable to CI after the branch history changed. This metadata repair does not claim a new code review or runtime proof.

The rule "paste keeps its pasted depths and starts" came in with the AI list landing plan on 2026-10-11, committed in 6fa1169c5e. That plan settled which list AI output joins. Paste got one sentence, with no Defaults row and no comparison of paste depth with other editors. The list subject's Open work already lists "Paste keeps the slice fitter's block merging", with a paste report as its stop.

The list refactor c01399d08b did not cause the split. The commit before it, 666f02406e, gives the same depths in every cell, and that tree has no list paste middleware at all.

| Case | Production, platejs.org on main | next before the refactor | next today |
| --- | --- | --- | --- |
| Siblings into the empty item below `Roman 3` | 3,3, siblings kept | 1,3 | 1,3 |
| Parent with children into `Rom\|an 3` | 1,3,3,1 | 1,3,3,2 | 1,3,3,2 |
| Deep to shallow at `Roman 3\|` | 1,3,2,2,1 | 1,3,2,2,1 | 1,3,2,2,1 |

The empty-item case regressed against production, where Slate replaced the empty item with the pasted blocks. Next's slice fitter merges the head instead, which is the inferred cause; no bisect ran. Occupied targets were already wrong in production.

## What other editors do

### Siblings into an empty item

Each check pasted two depth-3 siblings into the empty depth-1 item, which is the reported case.

| Editor | How it was checked | Result |
| --- | --- | --- |
| [ProseMirror demo](https://prosemirror.net/) | Live, five pastes, undo before each | Both items moved to depth 1 and continued as 3 and 4. A plain ordered list; Roman style was not tested. |
| [Lexical playground](https://playground.lexical.dev/) | Live, five pastes, page version v0.52.0+dev.esm | Both items moved to depth 1 and continued as 3 and 4. The source stayed at depth 3. |
| CKEditor 5 | Read its [pinned clipboard test](https://github.com/ckeditor/ckeditor5/blob/a2ceebdfd88a9f337ce33dfe20a267f5b5d0ee0a/packages/ckeditor5-list/tests/list/integrations/clipboard.js#L859-L897) and paste handler, not run | Pasted siblings take the target list type, and children keep their depth relative to their parent |
| Word | [Paste help](https://support.microsoft.com/en-us/word/control-the-formatting-when-you-paste-text) only | The user picks between keeping source numbering and continuing the target list |
| Plate on platejs.org | Live, one native paste in headless Chromium | Both items stayed at depth 3 as siblings, because Slate replaced the empty item |
| Plate on next | Native Chromium, five runs | First item at depth 1 in Roman style, second at depth 3 in decimal |

Both live editor checks used the in-app browser's clipboard, not the operating system's. The comparison page shows the ProseMirror, Lexical and platejs.org screenshots side by side.

### Occupied items and selections across depths

Each run dragged the mouse from the start of the first item's text to the end of the last item's text and copied. It then pasted into the depth-1 `Roman 3` at `|Roman 3`, `Rom|an 3` and `Roman 3|`. Notion used a nine-item sample with the same nesting; Plate used `/blocks/list-demo`. The numbers are depths.

| Selection | Source text | Source depths | Plate today, all three positions | Notion, all three positions |
| --- | --- | --- | --- | --- |
| Siblings | Decimal 111, 112 | 3,3 | 1,3 | 1,1 |
| Parent, its children and the next sibling | Decimal 11, 111, 112, 12 | 2,3,3,2 | 1,3,3,2 | 1,2,2,1 |
| Deep back to shallow, first parent not selected | Decimal 111, 112, 12, 13, Roman 2 | 3,3,2,2,1 | 1,3,2,2,1 | 1,1,1,1,1 |

Plate and Notion each ran three selections at three positions, five fresh drags each, 45 records per editor. Plate read the model, DOM, selection, focus and input events. Notion read the accessibility tree and screenshots, with no access to its internal model. In every Plate cell only the first item moved. The comparison page has this table and a Notion screenshot of the parent-and-children paste.

The fix follows Notion in all nine cells. It keeps only the links whose parent and child were both copied, and items whose parent was not copied become roots. Subtracting the first item's depth from every item would not work, because 3,3,2,2,1 would land at 0 and below.

### How existing text joins

Pasting siblings A and B into `Roman 3` gave the same text in Notion, five times per position, and in Plate. Only the depths differ.

| Caret | Text of the two pasted items |
| --- | --- |
| Start | A; BRoman 3 |
| Middle | RomA; Ban 3 |
| End | Roman 3A; B |

The text before the caret joins the first pasted item and the text after it joins the last, with no space added. The caret ends after the inserted text and before any suffix. All 45 Plate records match, so the text join stays as it is.

### Google Docs

One run pasted siblings at the start. Both became depth 1, and the original text joined the second item. Pasted in the middle, five fresh drags gave `RomDecimal 111` and `Decimal 112an 3`, both at depth 1. One parent-and-children paste in the middle gave 1,2,2,1, but the suffix `an 3` became its own item, and a trailing paragraph boundary in the selection was not ruled out. After that the page stopped responding to automated input, so the other cells did not run. The [list help](https://support.google.com/docs/answer/3300615?hl=en) and [copy and paste help](https://support.google.com/docs/answer/161768?hl=en) do not cover this case.

### Where editors differ

Lexical's [pinned paste test](https://github.com/facebook/lexical/blob/a1372576566a868fba6d944fe41fd3837a453e9d/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs#L523-L645) copies the full text of items three and four and pastes them at the end of an existing four. It expects the original four to stay whole, with three and four added as new items. That differs from Notion's text join. CKEditor's [list paste test](https://github.com/ckeditor/ckeditor5/blob/a2ceebdfd88a9f337ce33dfe20a267f5b5d0ee0a/packages/ckeditor5-list/tests/list/integrations/clipboard.js#L510-L552) merges the first item's text into the target and shifts the children as a group. Its handler applies only non-negative depth shifts, so it says nothing about deep-to-shallow selections. Both tests were read, not run.

| Choice | Benefit | Cost |
| --- | --- | --- |
| Picked: keep the links inside the copy and attach the group at the caret's depth | Siblings stay together, subtrees keep their nesting, and no uncopied parent is invented. Matches all nine Notion cells. | Replaces the rule that paste keeps copied depths |
| Keep copied depths | Matches the current rule | Impossible whenever the head merges, as Cause shows |
| Paste whole items as new items, like the Lexical test | The target item stays whole | Breaks Notion's and Google Docs's text join, and needs a rule for where whole items end and partial text begins |

No editor was checked for pasting into a plain paragraph, a target that already has children, or mixed numbered, bulleted and task items. Rules 2 and 8 below are inferred.

## Layer and owner

| Rule | Target | Today | Owner |
| --- | --- | --- | --- |
| 1 Depth | An item's parent is the nearest earlier copied item with a smaller depth. Items without one land at the landing depth, children keep their offset, and nothing lands shallower than the landing. | The first item takes the landing depth and the rest keep their own | Plate list landing |
| 2 Landing depth | A list item lands at its own depth; a plain paragraph or an empty line lands at depth 1 | Copied depths stay, leaving an orphan depth-3 item in a paragraph | Plate list landing |
| 3 Numbering | The first copied list joins the landing's list when its first item's kind and heading role match, and its roots of that kind take the landing's style; other lists keep their own. In an occupied item, the first item's text takes that item's type. | Joins only when kind and style both match, so mixed styles restart at 1 | Plate list landing, with a style-free match for paste only |
| 4 Empty line keeps the item | When a paste led by a list item, with two or more blocks or arriving closed, lands in an empty paragraph or heading of the main document, at the top level or inside a quote, table cell or column, the first item keeps its type and list properties, so a task stays a checked task. Plain text, other blocks and selected blocks keep their existing List route. Open List promotion excludes callouts, toggles and content roots. The object-boundary iteration separately reviews a shared Plite rule for closed objects at any semantically empty text block. | The first item takes the empty line's type | Plate list landing read, then canonical exact-node replacement |
| 5 Empty line continues | An empty line right below a list continues that list, like AI's empty-line landing | The first item becomes a paragraph and the second restarts at 1 | Plate list landing, with rule 4 |
| 6 Text joining | Unchanged | Matches Notion | none |
| 7 Starts | Paste keeps copied starts unless an empty target has its own start or restart; each target value wins over its copied counterpart | Copied restart was lost when the open head merged | Plate list paste middleware |
| 8 Items after the landing | Unchanged. The landing's own children move under the last pasted root | Already behaves this way | none |

AI output lands through `landAIOutput` with `placement: 'land'` and writes with `tx.slice.replace`, which skips the paste command and its middleware. Copilot, drag and drop and the media caption split use the same primitive. These Plate policies do not enter those primitive calls. A shared fitter change would reach them; the object-boundary iteration must prove those consumers before accepting one. `editor.update.fragment.replace` and `editor.update.slice.replace` do run the paste command, so the five rules apply to them too.

## Design

The approved prefix design below is preserved as history. It was superseded after code review exposed CodeBlock composition and copied-mark loss. The active implementation is specified in `2026-10-14-list-paste-type-adoption.md`. List prepares the complete first item after command handlers, then requests exact whole-node replacement. It preserves the original nesting, numbering and restart choices without a target-type mutation. Its final diff review and paste acceptance passed. The Close records the proof and remaining limits.

### Approved design and earlier revisions

Three models, Opus, Astra and Sol, each drew up a design on their own, and an Opus judge scored them without seeing which model wrote which. The pick was Sol's design with grafts from the other two. The plan panel's three rounds changed it, and a prototype after the third round replaced rule 4's route once the owner asked for empty lines inside containers. The full package, with every revision at its end, is `artifacts/2026-10-13-list-paste/architect/synthesis.md`.

- The approved design said Plite would not change and AI would stay byte for byte. The build preserves AI behavior, extracts a shared identity helper, and exposes the existing limiter internally for the prefix. Diff round 3 attempted a Plite object-fitting repair, but decision-trail T1 required its revert and a new plan iteration. Public call signatures stay the same. Paste uses `placement: 'paste'` and AI keeps `placement: 'land'`.
- Rule 1 builds a forest over the copied list items only. Each item's parent is the nearest earlier item with a smaller depth; a root lands at the landing depth and a child keeps its offset, so `3,2,3` lands `1,1,2`. A plain block keeps its indent and ends the chain, and content without list items comes back unchanged.
- Rule 3 keeps today's identity rule: groups by source list id, and only the first copied list may join. It drops the style match for paste only, through an option no other caller passes, and gives the joined roots of the landing's kind its style.
- A copy from inside a quote arrives wrapped (`blockquote(A, B)` with both edges open two levels). Paste lands the wrapper's blocks and keeps the wrapper.
- Rule 4 lives in the list paste middleware, and it runs when three things hold. The effective target is a collapsed caret. An explicit Point is a caret too. Current selected blocks exclude the prefix only when no explicit target was supplied, matching the command owner. The target is a collapsed caret in an empty paragraph or heading of the main document, at any depth, and `state.nodes.isEmpty` decides empty. The landed content is led by a list item and has two or more top-level blocks or arrives closed. The middleware then builds a prefix transaction that gives the empty line the first item's type and list properties, and runs the paste on top of it with `next.after`. The ordinary merge keeps the line's properties, which are now the item's, so the first item keeps its type at the top level and inside a quote, table cell or column.
- The prefix keeps the line's own start and restart when it has them, as the owner picked, and otherwise keeps the copied ones. It drops only absent list-owned fields; the schema type-change lifecycle keeps unrelated target properties such as id and alignment. The head that survives the length limit decides object eligibility. Object and void blocks bypass the prefix. The new object-boundary iteration checks whole-sequence admission and required copied roots before closing the slice, and Plite prefers a valid whole replacement of the empty target. The prior closed-boundary route failed inside containers and was reverted before that redesign. An open object boundary can still merge into the paragraph, so bypassing the prefix alone is insufficient. Checking the original head missed an object left after truncation; the focused red test returned false, and the saved candidate passed that case and direct object paste, but that proof is historical after T1.
- The landing is `line` when a list paste replaces an empty non-list paragraph or heading right below a list, and `kept` otherwise. For paste, `line` joins and lands at depth 1 and takes the joined item's style, so a decimal paste below an upper-roman list continues in Roman.
- The prefix and the `line` landing run only in the main document, because the block lookup and the sibling walk return paths without their root.
- Plate reuses `limitSliceInsert` through one internal export and its facade. It writes target starts onto the actual surviving head and delegates that limited slice, so a removed head cannot take the target restart with it. This prevents a fully truncated head from lending its task state to an empty remainder. Before the prefix, Plate calls the existing internal schema placement owner `canContainAt` through its facade. A position that requires a heading keeps ordinary paste instead. The ordinary paste still owns the length limit, caret and undo step. If placement rejects the prefix, the middleware recomputes `kept` landing so a retained heading does not lend the preceding list identity to later items. This guard was added after the build reproduced a schema-required heading throwing without it; the diff panel must review the internal bridge too.
- Two earlier routes were dropped. The third round's route closed the slice for Plite's empty-line replacement, which works only at the top level; inside a container a closed slice still merges (`artifacts/2026-10-13-list-paste/probe-rule4-a1.log`), and widening that replacement to nested parents did not change the fitter's pick (`artifacts/2026-10-13-list-paste/proto-nested-probes-a1.log`). The first round's node replacement for a selected block throws under a parent that refuses the first block and under a length limit, and its gate fired on plain text.

A prototype of the prefix route ran at ca301fa615 (`artifacts/2026-10-13-list-paste/prototype-prefix.patch`, 37 added lines). Two checked tasks pasted as an open slice kept their type in an empty paragraph at the top level, in a quote and in a table cell, in an empty numbered item, and in an empty heading at the top level and in a quote. The caret ended after the last item, and one undo restored the document. Under `maxLength: 1` the result kept one character with a valid caret. A selected empty block, two plain lines and a single open item kept today's result (`artifacts/2026-10-13-list-paste/proto-prefix-a1.log`, `artifacts/2026-10-13-list-paste/proto-prefix-a2.log`; the heading undo compares unequal only by key order). The prototype has none of the depth, identity, landing or start rules, so it proves the route, not the rules. Earlier probes at base still hold: a quote copy reproduces the 1, 3 split (`artifacts/2026-10-13-list-paste/probe-panel-a1.log`), and a copied restart 7 over an empty item reads 1, 7, 8 (`artifacts/2026-10-13-list-paste/probe-r3b-a2.log`).

The six product comparison specs match the page's fixed column, including every block's depth, kind, check, style, number and text. The fixture is a tracked copy of the comparison data, checked against its source at intake. It differs from the prototype in two cases the page does not show. A copied depth gap keeps its size, so `2,4` lands `1,3` where the prototype gave `1,2`. A plain paragraph with its own indent lands items at depth 1, where the prototype used the paragraph's indent. Both follow rule 1 and rule 2 as written.

The pick rejects Astra's public option that lets the pasted head keep its own type inside an occupied item. That option overwrites the user's own item, for example a heading pasted into at `H1|`.

## Main changes

The list plugin lands copied roots at the caret depth and keeps their copied parent-child offsets. It joins the first compatible list using the target marker. Empty paragraphs and headings receive the complete first list item through exact node replacement, including inside admitted main-document containers. List prepares permitted target metadata before fitting; copied values win except for the empty target's explicit start and restart.

Plite owns schema admission, content-root remapping, length limits, caret mapping and one undo step. Its existing fitting path accepts an explicit contiguous sibling node selection. The new landing read runs after paste command handlers. One-shot slice and fragment calls retain their call shape; raw transaction replacement and detached fitting bypass the command policy. The type-adoption iteration owns the public options, descriptor, consumers and teaching.

The original prefix and the object iteration's post-paste conversion are saved, rejected approaches. Neither remains in production. Their findings and rollback evidence remain in this plan's Build review and the two continuation plans.

## Build review

Diff round 1 applied three critical findings across the seats: generic cleanup removed the target id and alignment, a schema-rejected prefix still joined the preceding list, and an object block carrying an external root made paste return false. Regression tests and isolated reverted-fix mutants reproduce each failure and pass with the fixes. The exact non-object rooted-copy case from Astra passes; its alleged eager document validation fails only when planted. The ordinary transaction preparation defers that validation until the continuation completes.

The same round repaired explicit Point targets, an explicit caret with an unrelated node selection, and a length-limit case whose removed head left its checked state behind. Round 2 then reproduced the truncated object, open object type loss, object numbering and surviving void cases. The actual limited head now selects the placement path. That candidate closed object and void boundaries before ordinary fitting; T1 has since reverted it. The core list and AI suite has 261 passing tests in `artifacts/2026-10-13-list-paste/panel-r2-model-a3.log`. Round 3 reviewed these fixes, their tests and the revised proof. It found a nested closed-object fit defect and target starts written onto a head that truncation removed. Both had red/green cases in the saved candidate. The three-round cap was reached. T1 rejected a second replacement of the same object mechanism, so that route and fitter patch are reverted and its user goal continues through a new plan and review cycle.

## Evidence

The following sections preserve the earlier review decisions and rejected routes. The final implementation and acceptance are recorded in Close and the type-adoption continuation.

### Round 2 mechanism verdict

Pursue the object-boundary replacement.

Model: gpt-6-astra @xhigh. This is a bounded revision of the empty-line mechanism, under the Build playbook's panel-fix exception. This review retains `2026-10-11-list-first-principles.md` because its flat-list and identity ownership remains correct and the AI ownership of `2026-10-11-ai-list-landing.md`. It reopens only the first round's premise that skipping an object prefix always preserves its type. The list lookup reports stale wider review inputs; this revision does not re-audit the whole list scope.

Requirements are the owner's first-item type, nesting, numbering and target restart rules, plus Plite's ownership of fitting and root mapping. Keeping the object skip fails an open object copy. Prefixing objects copies unremapped roots into the target and can reject a legal paste. Closing object or void boundaries, while retaining normal list landing, uses the existing fitter without another property merge or root mapper. Both the open object and the exact nested, truncated object probe pass in the saved prototype. The horizontal-rule regression also reproduces before the fix. The selected lane is that boundary replacement; the non-object prefix remains as planned.

Ingress is unchanged: fragment replacement builds a ContentSlice; clipboard and slice replacement supply one directly; the list middleware lands its content, previews the actual head through the existing limiter, and delegates fitting. AI uses `placement: 'land'` and does not enter this paste branch. React list UI and Markdown serializers read the resulting list properties and remain unchanged. No public call changes and no new ownership layer are introduced.

Evidence is `artifacts/2026-10-13-list-paste/panel-r2-list-lookup.json`, `panel-r2-plain-open-red-a1.log`, `panel-r2-truncated-nested-red-a1.log`, `panel-r2-plain-open-closed-prototype-a1.log`, `panel-r2-truncated-nested-closed-prototype-a1.log` and `panel-r2-object-controls-red-a1.log`. The first replacement of the object route now goes to diff round 3; no fourth plan round runs.

### Rejected round 3 classification, retained as history

The following rationale was the lead's decision at the time. Decision-trail T1 rejected it because changing the producer file did not reset the mechanism's replacement count. Neither patch remains in the working tree. The next iteration must establish a reviewed target before rebuilding it.

Astra C1 and Opus W2 reproduce on the reviewed tree and at clean intake. The list middleware closes the object slice correctly, but Plite generates a new open variant across that closed object and merges its text into a paragraph. This is the first change to that producer in this build. The round-2 List routing stays in place; no third List workaround replaces it.

The fitter now bounds generated openings at object owners while retaining explicitly open text selections. Its existing closed replacement of an empty block also runs inside a container, subject to the fitter's structural admission. A probe that only stopped opening preserved the object but left an empty paragraph; extending the existing empty-block candidate removed that placeholder. The exact quote case and one-step undo pass. The retained open-object-text contract checks the nearby legitimate merge.

This reverses the original promise that Plite's fitting code would stay unchanged. The delta is in `compiled-slice-fitter.ts`, with raw Plite and Plate regressions. The cap means no seat reviewed these last fixes. The lead checks them and reruns the affected contracts before hand-back. Proof is `panel-r3-object-owner-red-a2.log`, `panel-r3-object-owner-green-a2.log` and `panel-r3-object-owner-prototype-a3.log` in this run's artifact directory.

### Requirements

- Keep copied nesting and land at the caret depth, as the owner requested.
- Keep the first list item's type in an empty paragraph or heading, including inside containers.
- Continue target numbering and give the empty target's restart priority.
- Keep fitting, length limits and content-root mapping in Plite. [BaseListPlugin.ts](../../packages/platejs/src/features/list/lib/BaseListPlugin.ts) owns list placement only.

### Lanes

- Keep the object skip. Rejected because open copies lose their first type.
- Prefix objects too. Rejected because unmapped roots and void carets can reject the paste.
- Close object and void boundaries at the empty target. Chosen because the existing fitter can place the head and import its roots. The ordinary non-object prefix remains.

### Dependents

- ai and layout use `packages/platejs/src/ai/react/AIChatPlugin.ts`, included in review_inputs. Their semantic landing stays unchanged and the AI controls pass.
- basic, markdown and media are unaffected by this boundary revision. Their serializers read list properties; they do not execute the replaceSlice middleware.
- distribution is unaffected. The public exports and call signatures do not change.
- editing uses `packages/platejs/src/utils/plugins/ExitBreakPlugin.ts`, included in review_inputs, and the shared fitter. Raw slice, content and fitting contracts join the final regression run; explicit object-child selections remain open.
- react and ui are unaffected by the boundary revision. List rendering reads the same schema properties; the actual clipboard route supplies the native proof.

## Public API

Both calls retain their signatures. `editor.update.slice.replace(slice)` enters the list middleware with a ContentSlice. `editor.update.fragment.replace(blocks)` constructs a ContentSlice and enters the same command. Plate chooses list identity, depth, style and empty-target policy. Plite fits the resulting slice, maps roots and owns history.

The table clipboard caller is unchanged at intake ca301fa615 and in the working tree.

```ts before
// packages/platejs/src/features/table/lib/BaseTablePlugin.clipboard.slow.tsx
assert.equal(editor.update.slice.replace(slice), true);
```
```ts after
// packages/platejs/src/features/table/lib/BaseTablePlugin.clipboard.slow.tsx
assert.equal(editor.update.slice.replace(slice), true);
```


## Steps

The owner authorized this build in the current checkout on fix/list-paste, with no worktree, commit or push. Intake is ca301fa615. Each phase ends in keep, revert or quarantine. The build packet is the comparison data, the prefix prototype and the final revision sections of architect/synthesis.md. The lead writes both slices; independent review is read-only.

### Phase 1: list items land as a tree (rules 1 and 3)

- [x] Add one model spec per comparison case to `BaseListPlugin.spec.tsx`. Each pastes the page's copied blocks as an open slice through `editor.update.slice.replace` and asserts every block's depth, kind, check, style, number and text against the `target` rows of `artifacts/2026-10-13-list-paste/carried/demo-data.json`. Evidence: `artifacts/2026-10-13-list-paste/build-phase1-a1.log`; Proof: all six red at base; the first three cases turn green in this phase and the other three in Phase 2.
- [x] Add the native Chromium test "list clipboard: copied sibling items remain peers through paste and history" to `apps/www/tests/browser/list-keys.spec.ts`, starting from `artifacts/2026-10-13-list-paste/carried/list-clipboard-test.patch`. Assert both items at `indent: 1` in the target list, numbered IV and V, plus the source, caret, typing and history checks. Evidence: `artifacts/2026-10-13-list-paste/build-phase1-a1.log`; Proof: a red run at base names the depth assertion.
- [x] Add model specs to the `paste` describe with open and closed slices at a caret: the three selections at the start, middle and end of `Roman 3`, `3,2,3` landing `1,1,2`, the mixed bullet and numbered list of `listIndex.internal.spec.ts` keeping its numbers, an indented plain paragraph before two items, indented plain paragraphs alone, two separate copied lists where only the first joins, and a copy from inside a quote pasted at the end of `Roman 3`. Evidence: `artifacts/2026-10-13-list-paste/build-phase1-a1.log`; Proof: red at base on the cases this phase changes; the plain-paragraph and separate-list cases pass at base as controls.
- [x] Add an AI control in `AIChatPlugin.lists.spec.ts`: a decimal answer landing beside an upper-roman list keeps its own list. Evidence: `artifacts/2026-10-13-list-paste/build-phase1-a1.log`; Proof: passes at base.
- [x] Implement the forest depths, the wrapper unwrap, `placement: 'paste'` and its style-free option in `listIdentity.internal.ts`, and switch the paste around in `BaseListPlugin.ts` to it. Evidence: `artifacts/2026-10-13-list-paste/build-phase1-a1.log`; Proof: the new specs pass, and the 184 tests in `artifacts/2026-10-13-list-paste/base-specs-a1.log` still pass.
- [x] Run three mutants with `node .agents/pstack/mutate.mjs`: subtract-first-then-clamp instead of the forest, the strict style match for paste, and a style-free match for every caller. Evidence: `artifacts/2026-10-13-list-paste/build-phase1-a1.log`; Proof: the `3,2,3` case, the IV and V case and the AI control fail on their mutants.
- [x] Run `plate-docs` on `content/docs/(plugins)/(styles)/list.mdx` and `list.cn.mdx`, whose HTML section states the join rule. Evidence: `artifacts/2026-10-13-list-paste/build-phase1-a1.log`; Proof: the docs checks and a preview of the list page.

Evidence for the Phase 1 boxes: `artifacts/2026-10-13-list-paste/build-phase1-red-a1.log`, `artifacts/2026-10-13-list-paste/build-native-red-a1.log`, `artifacts/2026-10-13-list-paste/build-phase1-a1.log`, `artifacts/2026-10-13-list-paste/build-phase1-mutants-a1.log`, `artifacts/2026-10-13-list-paste/build-docs-a4.log` and `artifacts/2026-10-13-list-paste/build-docs-preview-a1.log`. Frozen code tree: `225638dd9723ad428a4d29d1280a25e800882b0b`.

### Phase 2: plain paragraphs and empty lines (rules 2, 4 and 5)

- [x] Add model specs to the `paste` describe with open slices at a caret unless named: two depth-3 items into an empty top-level paragraph; two checked tasks into an empty numbered item, into an empty paragraph inside a quote and inside a table cell, and into an empty heading at the top level and inside a quote; the after-list case, and the same inside a quote; a decimal paste below an upper-roman list, which continues in Roman; an empty paragraph with `indent: 2` below a list; a copied restart 7 over an empty item, at a caret and through `editor.update.fragment.replace`, reading 1, 7, 8; an empty item with its own restart 5 under a copied restart 7, reading 5, 6; an intro paragraph and two items into the empty line below a list; two depth-3 items at `Hello|` with `indent: 4` and with no indent; one closed item through `fragment.replace` and a two-item HTML list into the empty line below a list. Controls: two plain lines into an empty heading, an empty list item and a callout with its own icon keep the first line's type and properties; one item's text into an empty line keeps the line's type; two items into an empty callout paste as today; a selected empty paragraph under `maxLength: 1` with an open two-task slice keeps today's result and a valid caret; a target in a content root keeps today's result; a two-item paste under `maxLength: 1` keeps one character and a valid caret; one undo restores each changed case. Evidence: `artifacts/2026-10-13-list-paste/build-phase2-base-a1.log` and `artifacts/2026-10-13-list-paste/build-phase2-a1.log`. The changed cases fail at base and the controls pass.
- [x] Add the prefix route to the paste middleware, starting from `artifacts/2026-10-13-list-paste/prototype-prefix.patch`: drop its open-slice condition so a closed list paste also runs it, keep the line's own start and restart, and pick `line` or `kept` from the same check. Land a plain paragraph's items at depth 1, give `line` its paste depth and style, and update the `landListContent` doc comment for `placement: 'paste'`. Evidence: `artifacts/2026-10-13-list-paste/build-regressions-a1.log`, 571 passes. The list, the list import and export specs (`apps/www/src/registry/components/editor/list.spec.tsx`, `apps/www/src/__tests__/package-integration/docx/list-*.spec.tsx`), table clipboard, code block paste, AI and Copilot specs stay green.
- [x] Run six mutants with `node .agents/pstack/mutate.mjs`: skip the prefix, run it for a single open item, skip the selected-block check, accept a callout line, let the copied restart win, and pick `line` from the target alone. Evidence: `artifacts/2026-10-13-list-paste/build-phase2-mutants-a1.log`. The six named cases fail on their mutants; a seventh catches a schema-required heading becoming invalid.
- [x] Reconcile `docs/editor-behavior/markdown-editing-spec.md` per its opening section: `EDIT-CLIPBOARD-BLOCK-TYPE-001` notes the list case at any depth, its heading example stays open, and a list paste entry is added. Proof: `build-reconciliation-a1.log` has no new knowledge finding; `build-gate-controls-a2.log` checks that its only finding is the existing emoji citation.

### Close

- [x] Update the paste sentence in `2e865a0bc4:docs/research/decisions/list-ownership.md` and the paste contract in `docs/plans/topics/list.md`. Proof: `artifacts/2026-10-13-list-paste/build-final-ledger-a2.log` has only its seven baseline pages; `build-acceptance-gate-controls-a2.log` compares the findings.
- [x] Add a changeset for `platejs` that names the `fragment.replace` and `slice.replace` change; run `deslop`, `no-comments` and scoped `pnpm lint:fix`. Proof: deslop, no-comments and unslop ran in this build; `artifacts/2026-10-13-list-paste/build-final-lint-fix-a2.log` is clean. Plite's closed-object repair also has its own patch changeset.
- [x] Run a panel on the build's diff. The replacement iterations complete the required review; final evidence is `artifacts/2026-10-13-list-paste/type-replan/build-panel-2/synthesis.md`. The following original review history is retained. Proof: three diff rounds in `2026-10-13-list-paste.decisions.tsv`; round 3 reached the cap with both findings applied. Opus omitted required reads; Sol and Astra covered their packets.
- [x] Run the six comparison specs together. Proof: `artifacts/2026-10-13-list-paste/build-final-regressions-a3.log` passes 716 cases, including all six against the tracked comparison fixture copied from the page.
- [x] Run the native test five times without retries against a source server on port 3297. Proof: `artifacts/2026-10-13-list-paste/build-final-native-a1.log` records five fresh Chromium runs, each with three passes and no retries. The inspected fifth screenshot shows IV and V at the same depth; `build-final-source.json` and `build-native-host-acceptance.json` bind the source and server.

## Completion Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| Blast radius before code moves | yes | Current shared-consumer proof: artifacts/2026-10-13-list-paste/type-replan/production-product-consumers-a1.log and production-raw-consumers-a2.log, plus boundary/downstream/view replays. |
| Hard cut sweep and best-api repair | yes | Type-adoption best-api repair updates the Plite Vision owner, twelve public docs pages and generated references; no compatibility layer remains |
| Benchmark rerun of scale-sensitive contracts | yes | artifacts/2026-10-13-list-paste/type-replan/final-work-counts-a1.log and final-object-counts-a1.log; fourteen deterministic budgets pass, timing inconclusive. |
| plate-docs on list.mdx and list.cn.mdx | yes | artifacts/2026-10-13-list-paste/type-replan/production-docs-build-a2.log and build-type-docs-final-a1.log; twelve rendered English/Chinese pages pass. |
| pnpm check steps the edits reach | yes | Scoped current behavior checks pass. Full check is incomplete and failing; further type/lint and attribution are skipped under the leading plan verification-scope default. |
| Thermo-nuclear code quality review per slice | no | skip: the owner requires a diff panel, whose seats include the code-quality lens |
| Slice freezes | yes | Final reviewed tree a109ee709af30ecfc8224f15b5f81d6c67486050; native and work receipts bind unchanged source fingerprints. |
| Type-aware oxlint on task files | yes | Historical 23-file current-code pass in artifacts/2026-10-13-list-paste/type-replan/production-typed-lint-a3.log; later one-line census retry incomplete. Further runs skipped after owner correction. |
| Changesets | yes | `changeset` invocation; amended unreleased `.changeset/list-scoped-api.md`, including both replacement APIs, instead of duplicating its list release note; the replaced implementation now has .changeset/list-paste-object-boundary.md |


## Feature coverage

Flow mode: headless package

Feature Manifest:

| Surface | Applies | Owner | Artifacts | Consumer | Proof | Status |
| --- | --- | --- | --- | --- | --- | --- |
| API | yes | List paste command | Existing slice and fragment replacement calls | Clipboard, HTML and Markdown paste | build-final-regressions-a3.log | complete |
| Package | yes | Plate list and Plite fitter | BaseListPlugin, listIdentity and compiled-slice-fitter | Existing package entrypoints | Current final source proof is in type-replan/final-native-and-docs-a2.log and final-object-counts-a1.log | complete |
| React adapter | no | Existing ListPlugin | N/A: no adapter changes | Existing list-demo | N/A: existing adapter reused | N/A: no adapter changes |
| Registry UI | no | Existing copied list UI | N/A: no registry code changes | Existing list-demo | N/A: native behavior tested through unchanged UI | N/A: no UI delivery |
| Composition | no | Existing ListKit | N/A: no kit changes | Existing list-demo | N/A: no new composition | N/A: existing composition |
| Scale proof | yes | Paste command | Two embedded probes and frozen budgets | Final source paths | build-final-performance-a1.log, work only; timing accepted as inconclusive | complete |
| Registry metadata/examples | no | Existing list-demo | N/A: no example metadata changes | Existing list-demo | N/A: no registry additions | N/A: no example delivery |
| Docs | yes | List docs | English and Chinese list pages | Docs readers | build-docs-final-a2.log and build-docs-preview-final-a1.log | complete |
| Release artifacts | yes | Plate and Plite | list-scoped-api.md; list-paste-object-boundary.md | Next unreleased packages | Replacement Plite changeset is present; no release requested | complete |

## Proof

Base controls ran on this branch at ca301fa615 in detached worktrees.

- `artifacts/2026-10-13-list-paste/base-probes-a1.log`: the three model probes, 56 tests, exit=0.
- `artifacts/2026-10-13-list-paste/base-specs-a1.log`: the list plugin, list index and AI list specs, 184 tests, exit=0.

The evidence these sections cite is in `artifacts/2026-10-13-list-paste/carried/`, with each source path and hash in `MANIFEST.tsv`. It covers the five red native Chromium runs at the same commit (`list-final-r1-a1.log` to `list-final-r5-a1.log`, each one failure and two passes), the Notion and Google Docs records, the production results in `prod-paste.json`, the pre-refactor probe and the comparison page sources.

## Limits

- Desktop Chromium with its native clipboard only. Firefox, WebKit, mobile and pastes from other apps were not run. Selection setup uses the browser test helper, followed by trusted keyboard copy, Enter, paste, typing and history.
- Rules 2 and 8 have no other editor to compare against.
- The production run was one pass per case in headless Chromium on the live site, whose deploy revision is unknown.
- The comparison page itself still renders its prototype. All six fixed-column data cases now pass through the product paste command in the tracked fixture.
- A copy from inside a quote pasted into an empty plain line still merges its first item into the line, because its first copied block is the quote, not a list item.
- Open List promotion excludes callouts, toggles and content roots. The object-boundary iteration reviews generic closed-object replacement at empty text blocks, including callouts and content roots. Partial custom-object copies that omit required roots cannot be promoted into complete owners.
- A copy that starts inside a quote and ends outside it, or the reverse, is not unwrapped, so its quoted items keep their copied depth.
- A copied forced restart on the first item still forces its number, so that paste reads I and II instead of continuing.
- The review ledger check already fails at base on seven pages this work does not touch, per `artifacts/2026-10-13-list-paste/review-ledger-a1.log`.

## Open work

- The AI list landing plan still states the old paste rule, and the list subject's Open work item about pasting tasks over a selected numbered item is not fixed by this plan; tracked in `docs/plans/topics/list.md` Open work. owner: natamox. stop: the AI plan marks its paste sentence as replaced, and that Open work item gets its own report, or the owner keeps both as they are.
- A whole single block copied by text selection, such as one heading, still takes the empty line's type, because an open slice cannot tell a whole block from part of one; tracked in `docs/plans/topics/list.md` Open work. owner: natamox. stop: a copy-side change marks whole-block selections, or the owner accepts the limit.
- Open List promotion excludes callouts, toggles, lines in a content root and copies that cross a quote edge. Generic closed-object replacement is covered by the object-boundary iteration; tracked in `docs/plans/topics/list.md` Open work. owner: natamox. stop: a report shows such a paste.

- Non-object blocks with copied content roots still have pre-existing open/nested fitting failures, and copied-id and explicit-root edge cases need separate reports. See `artifacts/2026-10-13-list-paste/build-panel-2/synthesis.md`. Tracked in `docs/plans/topics/list.md` Open work. owner: Plate and Plite fitting maintainers. stop: a dedicated rooted-copy repair proves the saved cases or narrows their supported contract.

## Interaction Coverage

Current proof supersedes the historical receipts below: `artifacts/2026-10-13-list-paste/type-replan/final-native-and-docs-a2.log` and its final source/server identity files.

- first-interaction: pass: each native run mounts the route afresh and performs the first paste with trusted keys after helper selection setup; `build-final-native-a1.log`.
- settled-interaction: pass: the same case types after paste, checks the caret, then undoes and redoes; `build-final-native-a1.log`.
- route-scope: pass: `/blocks/list-demo`, exactly the reported route; `build-native-host-acceptance.json` and five native run logs.
- reporter-profile: N/A: the report named desktop Chromium but no personal profile, extension or device; the proof uses the repository's managed Chromium profile.


## Close

This updates the original list-paste document and its existing page. Its report, cause, history, editor comparisons and approved design remain in place. The two later plans document the implementation revisions; they do not replace this page.

The original prefix and the later post-paste conversion were rejected and reverted. The final code prepares the copied head after command handlers, then replaces the qualifying empty node through the canonical fitter. The first type survives without a temporary type change. This also preserves copied marks and the empty target's permitted properties. The empty target's start and restart win.

The owner challenged time and tokens spent on verification. The lead narrowed the remaining proof to paste behavior, the required diff review and the existing work budgets. Further type/lint runs and unrelated full-check attribution are skipped. The failing incomplete full check is not green and is not labeled wholly pre-existing. The leading plan's full checks default reopens that choice.

Local behavior acceptance passed on unchanged source. All six comparison fixtures exactly match the carried page data and pass through the product command. The current source also passed 283 focused, 181 plugin and 1283 raw cases as overlapping groups. The equal-tail identity repair has three durable entry regressions, independent failing mutations and six successful replays of the seats' exact values.

Desktop Chromium completed one warmup and five retry-free runs of the five-case suite. Each run checks the ordinary list flow and image-headed pastes into nested empty paragraph and heading targets, with follow-up input and history. The lead opened all three final screenshots and saw IV/V peer numbering and intact copied image heads. Selection setup uses the existing helper; clipboard and keyboard gestures are native. The owned source server's identity and ancestry were recorded, and it was stopped after proof. Firefox, WebKit, mobile and external applications are not covered.

Proof: `artifacts/2026-10-13-list-paste/type-replan/final-comparison-cases-a1.log`, `artifacts/2026-10-13-list-paste/type-replan/final-comparison-data-a1.log`, `artifacts/2026-10-13-list-paste/type-replan/final-native-and-docs-a2.log`, `artifacts/2026-10-13-list-paste/type-replan/build-type-final-source.json`, `artifacts/2026-10-13-list-paste/type-replan/build-type-final-server.json` and `artifacts/2026-10-13-list-paste/type-replan/build-type-final-process-owner.json`. The first server attempt failed an overly strict process-group check before any test. The retry proves the listener descends from the owned launch; it does not waive ownership.

All fourteen frozen deterministic work budgets pass on final source in five paired rounds. The ten original cohorts retain 20 samples per arm; the four object cohorts retain 10. Forest visits are 3, 3, 3, 1001 and 2001. Prefix visits are 0, 0, 2, 5000 and 5000, with one apply on its first three cohorts and none on the last two. Object admission counts are 14, 10004, 4010 and 10004. These count selected operations, not all CPU work. Loaded-host timing remains inconclusive, and no speedup is claimed. Proof: `artifacts/2026-10-13-list-paste/type-replan/final-work-counts-a1.log` and `artifacts/2026-10-13-list-paste/type-replan/final-object-counts-a1.log`; their JSON summaries preserve the packets and fingerprints.

The current type build completed two diff rounds. Round one found the selected equal-tail identity defect; the lead fixed it through the existing discarded-key owner. Round two reports no confirmed critical, warning or nit defect. Each Opus ping failed, so both rounds are same-family. Sol's accepted-authored-view identity concern remains unverified and has its exact input, owner and stop in Open work. The broader partial-root and top-level object limits remain in the object-boundary plan and list subject.

The public docs, examples and generated references describe late preparation and exact node targets. Final previews pass all twelve English/Chinese routes, including the List editor. The Plate and Plite changesets remain uncommitted. No worktree, branch commit, push or PR was created. HEAD remains ca301fa61534b1dcca2b355b9d040c02f1f384c0. Review freezes are unreferenced objects and do not move the branch.

The original Artifact URL was updated to version 10 through the native Claude CLI MCP publisher, without a Claude model request or browser login. This corrects the earlier claim that no publisher was available. The MCP read succeeded, but its missing read-version state blocked an ordinary publish. The owner explicitly allowed replacing version 9 in a new publish. The native tool returned `updated: true` and kept the original title and URL. Receipt: `artifacts/2026-10-13-list-paste/artifact-direct-publish-a3.json`.

Final accounting covers 35 plan steps across three iterations plus four delivery items. Total 39: 38 done, 0 partial, 1 skipped, 0 blocked and 0 open. Further type/lint is skipped. Remote publication succeeded. The code, proof, record close, local page and Chinese handback are complete. These counts include overlapping plan steps, not unique tests.

### Attention

reviewed by gpt-6-astra @xhigh, same-family fallback after the Opus seat returned no answer. The final record review found stale claims of clean lint and complete failure attribution. Those claims are corrected; no check was rerun. The reviewer found no other record issue blocking local paste delivery. This was a record audit, not another code review. Its coverage limits are in `artifacts/2026-10-13-list-paste/type-replan/final-trail/seat-fallback.md`, and the applied disposition is beside it.

The final reflection accepted no new workflow change. New publication, verification and closeout rules were rejected because the existing rules already covered the mistakes. No new backlog item was created. The lead should have used the documented publisher route and bounded the checks earlier. See `artifacts/2026-10-13-list-paste/type-replan/final-reflect/synthesis.md`.


The repository ledger nominates editor-public-naming as its next item. That is a separate task and was not started. Evidence: `artifacts/2026-10-13-list-paste/type-replan/final-records/ledger-next.txt`.

Reviewed inputs for this iteration: `packages/platejs/src/features/list/lib/BaseListPlugin.ts`, `packages/platejs/src/features/list/lib/listIdentity.internal.ts`, `packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx`, `packages/platejs/src/ai/react/AIChatPlugin.ts`, `packages/plitejs/src/core/public-state.ts`, `packages/plitejs/src/core/insert-limit.ts`, `packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts`, `packages/plitejs/test/slice-fit-contract.test.ts`, `packages/platejs/src/utils/plugins/ExitBreakPlugin.ts`, `docs/plans/2026-10-11-ai-list-landing.md`, `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`. The final mechanism is owned by the type-adoption continuation; a listed input is review context, not a claim that every file changed.

The repository ledger check remains partial. This task repaired its missing Close input references. The ledger also rejects ignored local screenshots required by the page workflow and reports unrelated older records; those files were not changed. No ledger-green claim is made. Evidence: `artifacts/2026-10-13-list-paste/type-replan/final-records/ledger-close-a1.log`.

### Original page update

The owner asked to update this original document rather than replace it with a new summary. The local page now uses this plan's title and content. The original Teach, Report, Cause, History and editor comparisons are unchanged from intake, and every original section remains. The renderer previously selected a later topic iteration. Its input is now a byte-identical copy of this plan rendered independently; the publication target remains the existing DtbjYK46RvpbPugGTfdtoY page. The updated document is published at that same URL. Evidence: `artifacts/2026-10-13-list-paste/original-page-update/preservation-final.json` and `artifacts/2026-10-13-list-paste/artifact-direct-publish-a3.json`.

Reflection accepted the delivered-page identity check and rejected duplicate guidance. A shared check for requested-document versus rendered-leader identity is left as a workflow proposal, not implemented here. owner: natamox. stop: the owner adopts or drops that check. Evidence: `artifacts/2026-10-13-list-paste/original-page-update/reflect-synthesis.md`.
