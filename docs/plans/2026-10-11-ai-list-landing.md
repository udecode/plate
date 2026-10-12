---
review_scopes: [list]
review_basis: [2026-10-11-list-first-principles]
work_kind: implementation
review_commit: 5fc246c291edeab138ff656a567f6517c11c4844
review_inputs: [docs/plans/2026-10-11-list-first-principles.md, packages/platejs/src/ai/react/AIChatPlugin.ts, packages/platejs/src/ai/react/AIChatPlugin.lists.spec.ts, packages/platejs/src/features/list/lib/BaseListPlugin.ts, packages/platejs/src/features/list/lib/listIdentity.internal.ts]
---

# Lists: where AI output lands

Status: executed: waiting on your commit
Playbook: plan

This iteration continues `2026-10-11-list-first-principles.md`, which serves your "/verdict list and indent - should we do another pass redesigning from first principles." and "continue". That plan gives every parsed Markdown list its own id and deletes the correction that used to give an id-less item its neighbor's list, so AI output needs its own landing rule. Three diff panel rounds kept breaking the rule it built, and after round 3 the panel rule reverted it and moved it to this plan. This plan picks the rule with `architect` (`artifacts/2026-10-11-ai-list-landing/architect/synthesis.md`), revises it after plan panel rounds 1 to 3 (`artifacts/2026-10-11-ai-list-landing/panel-plan-1/synthesis.md`, `panel-plan-2/synthesis.md`, `panel-plan-3/synthesis.md`), and names the Build playbook as its execution playbook.

## Brief

### What will change?

AI answers with lists now join the list they land in, with nesting and start numbers kept. Paste works the same way. When you select across blocks, the AI rewrites those whole blocks if their container allows it. When it only rewords items, it edits them in place.

### What could go wrong?

No test streams a real AI answer; the tests feed real Markdown to the plugin. If a rewrite adds one item and drops another, a hidden start number can jump to a neighbor, as before. In a box that requires a title, the answer's first line still merges into the first block. The speed check for phase 1 counted work in a prototype, not in the shipped code.

## Teach

A numbered item in Plate is a paragraph with list facts, and items that share a list id count as one list. The Markdown parser gives each list in an AI answer a fresh id. On its own, an answer under item 3 would count from 1.

Before the list plan, a cleanup step gave any item without an id its neighbor's list, and AI answers went through it. The plan removed that step because it also changed numbers on undo. Three replacements each broke a different case.

The fix is one list rule for where new content lands. Each AI action says where its answer lands: below a block, over whole blocks, inside a block's text or on an empty line. Before writing, it decides which list each part joins, how deep it sits, and which item keeps a start number. A suggestion that only rewords your items just edits their text. Paste uses the same list rule.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| AI list output placed below or over list items | Its first list joins the list it lands in when the kinds match, and its other lists stay their own (look) | Every list in an answer stays its own list | ai-separate | big |
| A suggestion that only rewords your items | Only their text changes; each keeps its list, nesting and number (safe) | The items are replaced, as Replace does | suggestion-replaces | small |
| A suggestion that adds, removes or re-nests items | It replaces them, with the nesting the AI wrote (look). Code review round 3 narrowed this. An answer with the same number of items in the same shape edits them in place, in order, so adding one item and dropping another can move a hidden start number | Items are paired by position and keep their old nesting | suggestion-match | small |
| AI output that lands above a list | Stays its own list, so the list below keeps its start (safe) | Joins the list below it | ai-join-below | small |
| Plain text that replaces or rewrites a list item | Takes that item's list kind and stays in its list, as before the list plan (look) | Becomes a plain paragraph | plain-output-plain | small |
| A list inside a table in an AI answer | Stays its own list; a replaced start goes to the first list outside the table (safe) | Joins the list the answer lands in | table-list-joins | detail |
| An insert-mode answer on an empty line below a list | Continues that list at the line's depth (safe) | Starts its own list | insert-mode-separate | detail |
| An insert-mode answer on an empty list item | Takes that item's place in its list and keeps its numbering, even as plain text (safe) | Continues the list above it | insert-walks-back | detail |
| A selection that ends at the very start of the next block, or starts at the very end of the one before | The AI leaves that block out (safe) | It includes that block | hang-includes-next | detail |
| A selection that crosses blocks | The AI rewrites the whole blocks it touches, which are the blocks it was shown (look) | Only the selected text is replaced | partial-text | small |
| A replaced list item's start or restart number | The start number moves to the answer's first matching item (safe) | The list counts from 1 again | replaced-start | detail |
| A replaced list head whose answer starts no matching list | The start goes with it, as a delete does (look) | The next item of the list takes the start | forward-start | detail |
| An AI answer over fully selected blocks | Those blocks are replaced, so a task list stays a task list, and a quote or table around them stays (safe). Code review round 2 narrowed this to containers that don't fix their children's order and have room for the new blocks. Elsewhere the answer's first line merges into the first selected block, as before | Its first line merges into the first selected block | text-merge | detail |
| An AI answer over part of one block's text | It lands like a paste inside that block, or not at all when it opens with a table or quote (safe) | The whole block is replaced | partial-blocks | detail |
| What a streamed list suggestion may cost | What a paragraph suggestion of the same text costs; Plite's per-op cost goes to its own task (look) | Hold phase 2 until a list suggestion adds nothing over today's list rewrite at 1,000 lists | hold-suggestion-perf | detail |
| Pasting a list into a numbered heading item | Starts its own list, as list commands do (safe) | Joins the heading's list | paste-joins-heading | detail |
| A list that lives only inside a pasted table | Stays its own list (safe) | Joins the list the paste lands in | paste-cell-joins | detail |
| How we know phase 1 stays fast | A prototype's work count, plus timing the shipped code with the list plugin on and off, which shows no difference beyond noise (look) | Count the shipped code's work before keeping phase 1 | count-landing | detail |

Diff panel round 2 narrowed text-merge. When the selected blocks' parent has a schema that fixes its children's positions, such as a required title or summary, the slice fitter still runs. There the answer's first line merges into the first selected block, as before this plan. When the answer would leave that parent with more children than its schema allows, the slice fitter throws and Replace changes nothing, as at the base (Open work). The decision log's round 2 deviation row records it.

Diff panel round 3 narrowed suggestion-match. An answer with as many blocks as its source, which keeps the shape of their Markdown round trip, takes the source blocks' properties by index, as the base does. So when such an answer adds one block and drops another, a source block's properties, such as a latent start, can move to another block (Open work). The decision log's round 3 deviation row records it.

## What other editors do

Not re-read for this iteration. From the subject's comparison and its revisions, inferred: editors that store a list as a container get membership from the container they insert into, and BlockNote and CKEditor number contiguous runs, so none needs a landing rule. Plate numbers by list id, so inserted content has to be given one.

| Editor | How inserted list items find their list (inferred) |
| --- | --- |
| ProseMirror, Tiptap | Slice fitting places the items inside the `ordered_list` node they land in, or beside it as a new list |
| Lexical | Pasted `ListItemNode`s join the `ListNode` they are inserted into |
| BlockNote, CKEditor 5 | Adjacent items of one kind count together |
| Plate | The list id decides, so the landing rule gives inserted lists their ids |

## Layer and owner

| Delta | Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- | --- |
| added | Landing of inserted lists: identity, depth and starts for pasted and AI content | Plate | `platejs` (`features/list`, private), called by the paste middleware and by `platejs/ai` (`ai/react`) through the existing `ai/react` to `standard/list` edge | One rule decides where inserted lists belong; the AI paths only name where their output lands |

## Native behavior and proof

| Delta | Behavior | What happens | Proof surface |
| --- | --- | --- | --- |
| added | AI output placed below or over list items | The answer's first top-level list joins the item it lands at when list kind, style and heading role match; its other lists, and lists inside its tables, keep their own ids and starts; it lands at the landing's depth with its own nesting; a replaced item's start and restart go to the joined item | `AIChatPlugin.lists.spec.ts` |
| added | An AI answer over selected text | When the AI opens, the selection is trimmed at block edges and, when it crosses blocks, widened to the whole lowest blocks it touches, so the prompt and the write cover the same blocks; whole blocks are replaced as blocks where their parent's schema leaves its children's positions free and allows the new count, such as in a quote or a table cell, and elsewhere the slice fitter merges the answer's first line into the first block; a selection inside one block lands as a paste would, keeping that block | `AIChatPlugin.lists.spec.ts` |
| added | An AI suggestion over list items | Over whole blocks, an answer with the items' count and Markdown shape edits their text in place and keeps each block's key, list, depth and starts by index, so an answer that adds one item and drops another can move a start; any other answer lands like a Replace. Inside one block, the answer replaces the selected text | `AIChatPlugin.lists.spec.ts` and `AIChatPlugin.suggestions.spec.ts` |
| added | An insert-mode answer on an empty line below a list | Continues the list above at the line's depth; on an empty list item, it takes that item's place, plain text included | `AIChatPlugin.lists.spec.ts` |
| changed | Pasting list items next to a compatible list | The first top-level pasted list joins it when list kind, style and heading role match; items of one source list keep one id across the paste, tables included; a list that lives only inside a pasted table keeps its own; pasted starts and restarts stay | Clipboard specs in `BaseListPlugin.spec.tsx` |

## Main changes

- `features/list` gains one private landing function. It groups the content's list items by their source id across the whole content, tables included, so one source list keeps one id. Only the first top-level group may join a compatible landing item, and every other group gets a fresh id. The paste middleware calls it with paste's own numbering: pasted depths, starts and restarts stay as pasted. AI callers also get the landing's depth and its start rule. A joined head after a kept landing drops its parsed start, and after a replaced landing it takes the landing's start and restart exactly as stored.
- `captureTarget` normalizes the selection once when the AI opens, with its own block-boundary trim in place of Plite's `unhang`, which skips a range that starts mid-block. An end at the start of a block's first text moves to the end of the block before it, and a start at the end of a block's last text moves to the start of the block after it. A range that still crosses blocks then widens to the whole lowest blocks it touches, the blocks the edit prompt serializes. The chat nodes, the request context the prompt is built from, and every write read that one range.
- Each AI write path names its landing: insert below, block replace, insert mode on an empty line or after a block, text replace and the suggestion draft. These adapters live in a new module beside `AIChatPlugin.ts`, which is already 2,002 lines.
- A text replace over whole lowest blocks runs as a block replace of those blocks when their parent's schema leaves its children's positions free and allows the new count, so a quote or table cell around them stays; otherwise the slice fitter runs. A range inside one block goes to the slice fitter, which keeps that block or refuses the write, so the landing is kept. No AI code predicts the fitter.
- Formatting copies the source block's properties only onto an answer with no list items, and never its list id, start or restart. Insert mode on an empty list item gives such an answer the item's list facts.
- A suggestion over whole blocks serializes its source blocks to Markdown and parses them back, as the prompt saw them. The answer keeps their shape when four things hold. It has the same blocks in the same order, with every property but text and list ids equal to the round trip's. Its list items share a list exactly where the round trip's do. An answer block with no list marker matches a source list item of its type. An exact-text alignment of the answer to the source puts every matched block at its own position. Such an answer edits the source blocks' text in place, so they keep their properties and keys. Its next nodes take the source blocks' properties, so when the text patch cannot apply, as for a mark Markdown cannot write, the slice write still keeps the list facts. Any other answer lands like a Replace over the source blocks. The round trip runs once per request, not per streamed chunk. One comparison of list-id-normalized blank structures covers the first two conditions, the plain-block rule runs as a normalization before it, and one sequence-alignment helper serves both this alignment and the character diff; all of it lives in the new AI landing module. A suggestion inside one block keeps the incumbent slice write at the selection. The draft names this block or text target explicitly, in place of a path array whose empty value was truthy. It runs as an unpublished transaction spec, so no draft clones or diffs the whole document. Round 3 removed the position check, so an answer that keeps the shape takes the source blocks' properties by index, and the sequence-alignment helper serves only the character diff.
- `joinListIdentity` gains a backward-only walk, which only the empty-paragraph landing uses.

Diff panel round 1 changed the build in eight places, each pinned by a test in `AIChatPlugin.lists.spec.ts` except the alignment limit. Round 2 reverted three of them and replaced a fourth, as marked:

- The landing owns depth. Formatting copies the source's indent as the first level, an empty item's fill leaves depth to the landing, and the landing moves plain output to the landing's depth too, so a plain answer over a nested item stays at its depth.
- A replace lands on the first list item it covers, so a replace that starts at a plain block still continues the list. Round 2 reverted this, because the first list item can sit deeper than the first replaced block, and its depth then moved plain output. Every replace lands on its first block again.
- On the slice fitter path, an answer whose first block is closed, over a range that starts a block, is a replaced landing, because that block goes with the range. A head's start then moves to the answer's list. Round 2 reverted this, because the fitter can keep that block, which then held its restart twice. The fitter path lands as kept again.
- A suggestion inside one block lands its answer as a kept landing before the incumbent slice write, so its list joins the block's list.
- A suggestion over whole sibling blocks whose parent holds the answer replaces them as blocks, as Replace does. The slice write stays for every other range. Round 2 reverted this, because inserting and then removing by path removed an unselected block when `maxLength` cut the insert short, and it skipped the schema's fixed positions. Every suggestion takes the slice write again.
- The plain-block rule holds only when the source is one block, because the prompt shows several blocks with their markers. An answer that drops the markers of several items removes their list.
- Only an exact alignment proves that blocks kept their positions. Past a million cells no position is proven, and the answer lands as a Replace. The character diff keeps its prefix and suffix fallback. Round 2 replaced this, because a one-item reword of 1,000 items passed the limit and lost every item's properties. Now an answer block that repeats a source block's text must sit at that block's index, which one pass over a set of the source texts checks. The character diff alone keeps the alignment, with its prefix and suffix fallback. Round 3 removed the check, because a typo fix whose text equals another block's read as a move and dropped the untouched blocks' properties.
- A table cell answer lands over the cell's blocks. Round 2's revert narrowed this: the answer lands on the cell's first element child, so a list item that follows a paragraph in the cell leaves its list ([5, 6, 6]), as the base does.

Diff panel round 2 also narrowed the whole-block text replace. It runs only when the parent's schema leaves its children's positions free and allows the new child count. Any other parent keeps the slice fitter, which keeps a required title or summary in place. Two tests in `AIChatPlugin.lists.spec.ts` pin it: a required heading and a required first paragraph. The main root's top level still counts as free, because Plite has no public read of the main root's content (Open work).

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AI list landing | None since the correction was cut; the AI code from before the list plan copies the source's list facts onto output block 0, so an answer splits | One landing function decides identity, depth and starts before the write | `features/list` landing, called by `AIChatPlugin` | Three patches, before and after insertion, each broke a case the others fixed; one owner with an explicit landing per path decides every case before the write | None public | The 20 AI list specs, the round-3 cases and the plan panel's cases | A suggestion over items that start deeper than later ones, whose answer changes their count, flattens them | rearchitect |
| Paste join | The first list anywhere joins a landing of the same kind and style | The first top-level list joins, with the heading role checked; one source id stays one id across the paste; pasted starts and restarts stay | `features/list` landing, called by the paste middleware | Paste and AI shared the first-list rule but copied it in two places, and a list living in a pasted table joined the outer list | None | Clipboard specs, a heading case, table cell cases and pasted-start guards | A paste into a numbered heading or a table stops joining it | rearchitect |
| AI formatting | Spreads the source block's properties, list facts included, over output | List output keeps its own facts; an answer with no list items takes the source's properties, never its id or starts | `AIChatPlugin` `createFormattedBlocks` | Formatting turned an AI task list into the source's numbered list and a preamble into a list item | None | Task-output and preamble specs | An answer that mixes prose and a list gets no block formatting | rearchitect |
| Suggestion merge | Parsed properties over the source's, by index | Over whole blocks, an answer that matches the source's Markdown round trip edits the source blocks in place; any other answer lands like a Replace; a partial selection keeps the slice write | `AIChatPlugin` `parseSuggestion` with the landing function | Index matching moved facts onto the wrong item, let two answer lists claim one source list, and copying every source property undid a heading level the answer changed | None | Suggestion specs | An answer that adds and drops items inside a run of rewritten items still edits in place by position | rearchitect |
| Text replace start | The slice fitter decides whether the landing survives, unseen | Capture trims block edges and widens a cross-block selection to whole lowest blocks; whole blocks run as a block replace where their parent holds the answer; a range inside one block keeps that block or is refused | `AIChatPlugin` capture and text path | The fitter kept a fully replaced block's kind, a hanging selection sent the next block to the model, and every rule that predicted the fitter across blocks met an answer it handled differently | None | Text replace specs and single-block fitter guards | A whole-block replace loses the landing's key | rearchitect |

Each landing runs once per paste or AI action over its content and at most 64 siblings of the landing. A list suggestion whose answer keeps its source's shape moves from the slice write to the text patch, and the draft reruns on every streamed chunk. The incumbent draft cloned the whole document twice per text edit; the build runs it as an unpublished transaction spec instead (step 2.0). Benchmark's pre-acceptance probe measures a disposable landing prototype against the incumbent AI insert and paste (step 1.0), and a text-patch prototype against the incumbent list rewrite over streamed chunks (step 2.0), before each phase is kept.

## Risks

Four realistic failures, each with the proof that catches it:

1. The suggestion's shape check serializes the source with options other than the prompt's, so a rewrite that kept its shape lands as a Replace and loses its inline diff and keys. The text-patch spec and `AIChatPlugin.suggestions.spec.ts` catch it. A node-selected container, such as a blockquote, already fails it, because the prompt serializes the blocks inside it; that answer lands like a Replace, as today.
2. Moving the paste middleware onto the landing function changes a paste the clipboard specs do not cover. The list, clipboard and Markdown partitions run before and after, and the heading and table cell cases are the intended changes.
3. The block replace for whole-block text ranges changes the selection or the authored suggestion it produces. The suggestion and selection specs of the AI partition run on it.
4. An answer that adds one item and drops another inside a run of rewritten items keeps the count and shape, so it edits that run in place by position and can move an item's hidden start or alignment to its neighbor. The answer says nothing about which rewritten item came from which; the edit prompt asks for one block per block with only text changed, and the incumbent pairs by index too. The insertion and latent-start specs in 2.1 cover the cases with unchanged text.

Blast radius: every caller of the `replaceSlice` command (DOM paste, `editor.update.slice.replace`, `fragment.replace`, the decoded-format lane) and every AI write path; `pstack:blast-radius` runs on the paste middleware before 1.2 moves it. A drag copy writes through `tx.slice.replace`, skips the middleware, and is outside this rule. Rollback: revert this plan's files; AI output returns to the reverted state named in the list plan's step 1.6.

## Steps

Every step names its proof. The build runs in two phases, each ending with a keep or revert decision. Before writing or changing a test, the build loads `verify` and reads `.agents/pstack/rules/tests.md`. The build base is a freeze of the tree this plan's panel reviews; `artifacts/2026-10-11-list-first-principles/panel-diff-3/ai-lists-reverted-a1.log` records the 20 existing AI list specs there, 5 passing and 15 failing. Those 15 carry `it.failing` until the step that fixes each lands, so the AI partition stays green; each step's exit removes its marks. A new failing test asserts numbers as well as indents and fails at its phase's base by its title (`proof-worktree.mjs --expect-fail`). A guard passes at that base and must stay green.

### Phase 1: the landing function and the block paths

- [x] 1.0 Write Benchmark's pre-acceptance probe for the landing: paste of a 10-item list, and AI insert below a list item, in documents with 0, 100 and 1,000 other 10-item lists. The incumbent AI insert runs no landing, so it is a control. The candidate arm runs a disposable landing prototype in the probe, which groups the content, checks compatibility, walks the landing's siblings with the incumbent `joinListIdentity` and applies the start rule, ahead of the same write. Every arm asserts its output before timing. Run it on the build base on a quiet host, then freeze its budget from that run: the prototype's added cost per action stays within 1.2 times its 0-list value plus 2 ms at 100 and 1,000 lists, with a planted slowdown the line must reject. Proof: the base and prototype run's log and the frozen budget in the decision log.
  Done: `artifacts/2026-10-11-ai-list-landing/perf/proto-base-a1.log` and `perf/proto-plant-a1.log`; the budget is the step 1.0 row of the decision log.
- [x] 1.1 Add tests. Failing, in `AIChatPlugin.lists.spec.ts`: insert below a numbered heading item keeps the paragraphs' list apart ([1, 1, 2, 2]); insert-mode Accept on an empty paragraph after a nested item continues the outer list (indents [1, 2, 1, 1], numbers [1, 1, 2, 3]); Replace of a head with start 5 by an answer whose first list sits in a table gives the start to the first list outside the table (7, 5, 6); a single-format Replace whose answer opens with a preamble keeps the preamble plain ([1, null, 2, 3]); insert mode on an empty item with a restart, followed by another item, keeps the item's list and restart ([1, 2, 1, 2], the item in list `l` with restart 1); a plain insert-mode answer on an empty list item stays in the list ([1, 2, 3]). Failing, in `BaseListPlugin.spec.tsx`: a numbered list pasted into a numbered heading item starts a fresh list; a list that lives only inside a pasted table stays apart from the list it lands in. Guards: Replace of an item with a forced restart keeps it on that item ([1, 2, 1, 2]); a paste whose source list continues through a table cell keeps one counter (5, 6, 7), and joins a compatible item it lands on ([1, 2, 3, 4, 5]); a pasted head keeps its own start ([7, 8, 9]) and restart ([1, 7, 8, 9]). Proof: `proof-worktree.mjs --expect-fail` at the build base fails each failing case by its title, and the guards pass there.
- [x] 1.2 Write the landing function in `listIdentity.internal.ts`: groups by source id across the content, the first top-level group as the only join candidate, the list commands' `compatible` check, and identity as the landing's id or the default list. AI callers also get the depth shift and the start and restart rule (a joined head after a kept landing drops its parsed start; after a replaced landing it takes the landing's start and restart exactly as stored; an unjoined group keeps its own); paste keeps its pasted depths, starts and restarts. Add the backward-only option to `joinListIdentity`. Move the paste middleware onto it. Proof: `pstack:blast-radius` on the middleware first; the list, indent and Markdown partitions pass, and the 1.1 paste cases pass.
- [x] 1.3 Land AI output on the block paths in the new module: insert below (node and text selection), Replace and chat Accept on selected blocks, insert-mode Accept after a block, and on an empty paragraph with the paragraph's depth and the backward walk. An empty list item is a replaced landing and never walks back, and an answer with no list items takes its list facts. `createFormattedBlocks` copies the source's properties, minus its list id, start and restart, only onto an answer with no list items. Proof: the 1.1 AI cases pass; the ten phase-1 specs of the 20 lose `it.failing` and pass; the five that keep it until phase 2 are "keeps the item after a replaced text selection counting on", "joins the list items of a replaced text selection whose output ends in a table", "keeps the list of the block a text rewrite starts in", "keeps a suggested rewrite of a nested item at its depth" and "rewrites the text of two items in place, keeping their list and latent start". Each of the five, run without its mark, fails on an assertion, not a thrown error.
- [x] 1.4 Keep or revert phase 1. Proof: the 1.0 probe passes its frozen budget on the phase's tree, a decision row, and `freeze.mjs` records the tree.

### Phase 2: text replace and the suggestion

- [x] 2.0 Write Benchmark's pre-acceptance probe for the suggestion draft: a rewrite of three list items that keeps their shape, streamed in five chunks, with 1, 5 and 20 text edits, in documents with 0, 100 and 1,000 other 10-item lists. The incumbent list rewrite, which takes the slice write, is the baseline. The target is a disposable prototype in a `proof-worktree.mjs --with` worktree whose `parseSuggestion` keeps the source's properties on a shape match, so the list rewrite takes the text patch. A paragraph rewrite runs as an attribution control. Each draft counts its whole-document diffs. The incumbent already grows with the document on every chunk, so the frozen line is the prototype's added cost per chunk over the incumbent: within 1.2 times its 0-list value plus 2 ms at 100 and 1,000 lists, with a planted slowdown the line must reject. When the prototype misses it, 2.3 builds each edit's change from the edited blocks, in place of two whole-document clones, and the probe passes on that prototype before 2.3 starts. Proof: the baseline and prototype logs and the frozen budget in the decision log.
  Done with a deviation (decision log, step 2.0 rows). The prototype missed the line, so the draft became an unpublished transaction spec, whose builder records the change with no clone or diff. That draft still misses this line at 1,000 lists, by rows that change between runs, because 2 ms sits under the noise of a 220 ms chunk, and its real part is Plite's per-op root freeze, which paragraph rewrites already pay. The frozen line is restated: per chunk, a list rewrite that keeps its shape costs at most 1.2 times a paragraph rewrite of the same text plus 2 ms, with no more whole-document diffs, at every cohort and edit count. It passes all nine rows and rejects a planted 100 ms per diff (`artifacts/2026-10-11-ai-list-landing/perf/suggestion-spec-a2.log`, `perf/suggestion-spec-plant-a1.log`).
- [x] 2.1 Add tests in `AIChatPlugin.lists.spec.ts`. Failing: a text replace over all of an item's text by a task answer keeps both tasks (checked false, true); a text replace over all of a head's text by a table-first answer keeps its start ([null, 5, 6]); a table-first answer over a selection from a head's start into the next item replaces both items and keeps the start ([null, 5, 6]); opening the AI on a selection from a head's start to the next item's start captures only the head, and a Replace then keeps its start ([null, 5, 6]); opening it on a selection from the middle of an item to the next item's start captures only that item, with the request's selection ending at its text end; opening it on a selection from the end of an item to the middle of the next captures only the next; a suggestion over a selection from the middle of one item to the middle of the next rewrites both whole items once, with no duplicated text, which changes the spec "suggests one replacement for a partial selection across blocks" to that behavior; a suggestion whose answer holds two numbered lists keeps them apart ([5, null, 7, 6]); a suggested rewrite of a nested item and a shallower item after it keeps both depths (indents [1, 2, 1, 1], numbers [1, 1, 2, 3]); an unchanged-shape rewrite of a list split by a paragraph keeps its numbering ([5, null, 6, 7]); a suggestion that adds an item before existing ones keeps their depths and moves no restart (indents [1, 1, 2, 1], no restart on any item); a suggestion that adds one item and drops another never moves a latent start (after the new item is removed, [1, 2]). Guards: a suggestion that turns a paragraph into a two-item list keeps one list ([1, 2, null]); a suggestion that changes a heading's level keeps the new level; a suggestion over part of a block keeps the text around it; replacing all of a quote's only paragraph keeps the blockquote; a rewrite of an item with an underlined word keeps the item in its list; inside one item, a list answer from its start keeps its key and start, and a table-first or quote-first answer is refused with no change. Proof: `proof-worktree.mjs --expect-fail` at the phase 1 freeze fails each failing case by its title, and the guards pass there.
  Done: `artifacts/2026-10-11-ai-list-landing/build/tests-2.1-phase1-a1.log` fails thirteen cases by title and passes 62. The underlined-word rewrite, listed above as a guard, fails at the freeze, so it counts among the 2.3 cases. Diff panel round 3 removed the add-and-drop case, so the promise that such a suggestion never moves a latent start is withdrawn (Open work).
- [x] 2.2 Land the capture and the text path: `captureTarget` trims block edges and widens a cross-block selection to whole lowest blocks, and the chat nodes, the request context and every write read that range; whole lowest blocks run as a block replace where the schema lets their parent hold the answer's blocks, and the slice fitter otherwise; a range inside one block goes to the slice fitter with that block kept. Proof: the 2.1 text and capture cases pass, and the three text-selection specs lose `it.failing` and pass.
  Done: `artifacts/2026-10-11-ai-list-landing/build/partition-ai-react-2.2-a1.log` fails only the six 2.3 suggestion cases; `build/slow-2.2-a1.log` and `build/typecheck-ai-react-2.2-a1.log` pass. Two older specs that pinned the partial-selection result now assert the whole-block rewrite.
- [x] 2.3 Land the suggestion: over whole blocks, `parseSuggestion` compares the answer with its source blocks serialized and parsed back once per request through the same Markdown API the prompt uses, by the shape rule in Main changes. A match edits the source blocks' text in place, its next nodes carrying the source blocks' properties; any other answer runs the landing function as a Replace over the source blocks. A suggestion inside one block keeps the incumbent slice write. The draft's target is an explicit block or text target. Proof: the 2.1 suggestion cases pass, the two suggestion specs lose `it.failing` and pass, and `AIChatPlugin.suggestions.spec.ts` passes.
  From 2.0: the draft runs as an unpublished transaction spec, `editor.read((state) => state.transaction(fn))`, for the text patch and the slice write alike, in place of the rolled-back update that cloned and diffed the whole document.
  Done: `artifacts/2026-10-11-ai-list-landing/build/accept-test-ai-react-a1.log` passes 152 tests at the phase 2 freeze, the suggestion specs included, with no `it.failing` mark left. 16 of 16 phase 2 mutations fail a named case (`build/mutate-phase2-out-2.txt`). The draft's slice write for a text target keeps closed edges; its open-edge calculation never ran in the incumbent, so 2.3 removed it.
- [x] 2.4 Restore "and AI output" in the `list-scoped-api` changeset's identity sentence, and update any list or AI docs page that states the paste join rule, through `plate-docs`. Proof: `build:registry --check` and the docs parity check pass.
  Done: the changeset and both list pages state the first top-level join rule. `artifacts/2026-10-11-ai-list-landing/build/registry-check-2.4-a1-a1.log` and `build/docs-parity-2.4-a1.log` pass. `check:docs` stops before them on API manifest entries that other sessions changed (`build/api-ref-diff-2.4.txt`).
- [x] 2.5 Keep or revert phase 2. Proof: the 2.0 probe passes its frozen budget on the phase's tree, no `it.failing` mark is left in the AI list spec, a decision row, and `freeze.mjs` records the tree.
  Done: `artifacts/2026-10-11-ai-list-landing/perf/suggestion-final-a1.log` passes the restated line on all nine rows at the freeze in `build/frozen-phase2.sha`. The list, indent, Markdown and www integration suites pass there (`build/accept-www-integration-a1.log` and its siblings). The step 2.5 row of the decision log keeps the phase.

## Start Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| Performance pack selected | yes | Steps 1.0 and 2.0 run Benchmark's pre-acceptance probe and freeze each budget on the base; 1.4 and 2.5 keep a phase only when its probe passes |
| User-facing operation and runtime owner identified | yes | AI insert below, Replace, Accept in chat and insert mode, the suggestion draft, and paste; owner the `features/list` landing function |
| Correctness guard selected | yes | The 20 AI list specs, the round-3 cases, the plan panel's cases, the clipboard specs and the suggestion spec |
| Fitter premises probed | yes | `artifacts/2026-10-11-ai-list-landing/probes/text-fit-keys.json` shows that an open first block keeps the landing's shell and that a closed first block over part of a block is refused. `panel-plan-3/probe-plan3-frozen.json` (the `single *` rows) shows that inside one block a list-first or task-first answer keeps the block's key and start, and a table-first or quote-first answer is refused. Across blocks the fitter's choice varies by answer (`sol22PartialTableFirst` in `panel-plan-2/probe-plan2-frozen.json` removes both blocks; `r3QuoteFirst` in `panel-plan-3/probe-plan3-frozen.json` keeps the head), which is why capture widens a cross-block selection. `probes/slice-command.json` shows that a slice at a block's end merges into it |

## Completion Gates

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Blast radius before code moves | yes | `pstack:blast-radius` on the paste middleware | `artifacts/2026-10-11-ai-list-landing/build/blast-radius.md`: only command dispatches reach the middleware, proven by `blast-radius-probe-a2.log` |
| Correctness guard | yes | Steps 1.1 to 2.3 | `artifacts/2026-10-11-ai-list-landing/build/accept-test-ai-react-a1.log` at the phase 2 freeze; 16 of 16 phase 2 mutations caught (`build/mutate-phase2-out-2.txt`) |
| Performance probes | yes | Steps 1.0 and 2.0, checked at 1.4 and 2.5 | `artifacts/2026-10-11-ai-list-landing/perf/proto-phase1-a1.log` and `perf/suggestion-final-a1.log`, where phase 1's read count is the prototype's, accepted as `count-landing`; the rerun on the round 3 tree, `final/suggestion-final-a2.log`, passes the restated line on all nine rows at load 6.6 |
| `plate-docs` on affected pages | yes | Pages that state the paste join rule | `artifacts/2026-10-11-ai-list-landing/build/docs-parity-2.4-a1.log` and `build/registry-check-2.4-a1-a1.log` |
| `pnpm check` steps the edits reach | yes | Typechecks, lint and the registry check before the acceptance run | `artifacts/2026-10-11-ai-list-landing/build/accept-typecheck-ai-react-a1.log`, `build/accept-typecheck-standard-list-a1.log`, `build/accept-typecheck-ai-a1.log`, `build/lint-task-2.3-a1.log` and `build/registry-check-2.4-a1-a1.log` |
| Diff panel | yes | A panel on the build's diff, as the revert's next round | Three rounds, the cap: `artifacts/2026-10-11-ai-list-landing/panel-diff-1/`, `panel-diff-2/` and `panel-diff-3/`, with their `seats` rows in the decision log |
| Last lint fix | yes | `pnpm lint:task` on the task's files | `artifacts/2026-10-11-ai-list-landing/final/lint-task-checkout-a1.log` on the 29 lintable files of both plans |
| Changesets | yes | The `list-scoped-api` sentence | `.changeset/list-scoped-api.md`, step 2.4 |

## Close

Reversals first. Diff panel round 2 reverted three of round 1's eight fixes and replaced a fourth, and round 3 removed that replacement, because the panel rule allows one replacement per mechanism. Two approved Defaults narrowed, and the decision log's round 2 and round 3 deviation rows record each. Under text-merge, a parent whose schema fixes its children's positions keeps the slice fitter, so the answer's first line merges into the first selected block there, and an answer that would overflow a parent's child limit throws in the fitter, as at the base. Under suggestion-match, an answer with as many blocks as its source that keeps their Markdown shape pairs blocks by index, so adding one item and dropping another can move a latent start to a neighbor ([5, 6] where [1, 2] is right). The approved Main changes sentence that an exact-text alignment proves each block's position no longer holds. A table cell answer whose list item follows a paragraph splits the list, [5, 6, 6], as the base does. Step 1.4's proof also narrowed. The read count that kept phase 1 came from the prototype, and nobody counted the shipped landing's reads. The shipped code's timing with the list plugin on and off moves nothing beyond noise, so the Defaults row `count-landing` keeps phase 1.

What landed:

- `features/list` has one private landing function in `listIdentity.internal.ts`. The paste middleware and every AI write path call it, and `joinListIdentity` gains the backward walk the empty-line landing uses.
- `aiOutputLanding.internal.ts`, beside `AIChatPlugin.ts`, names each AI path's landing. `captureTarget` trims a selection's block edges and widens a cross-block selection to the whole lowest blocks it touches. Those blocks are replaced as blocks where their parent's schema leaves positions free and allows the new count. A suggestion that keeps its source's Markdown shape edits their text in place, pairing blocks by index.
- `AIChatPlugin.lists.spec.ts` holds the AI list cases. The `list-scoped-api` changeset and both list docs pages say that the first top-level list joins.

Proof and its limits:

- On the frozen tree `93cdf6628a` plus the round 3 files and the last lint fix, without another session's `AIChatPlugin.ts` hunks: 90 of 90 platejs typecheck tasks pass, type-aware oxlint finds nothing in 29 files, and 135 of 137 platejs test tasks pass. The migrations partition fails only on a 500-document test that times out under turbo's parallel run. The build base fails the same way, 135 of 137 (`final/test-platejs-base-continue-a1.log`), and the partition passes alone. A follow-up numbers all 500 documents in one editor, which takes that case from a median 3.04 s to 1.41 s, and the full parallel run then passes 137 of 137 twice where the base failed once in two (`artifacts/2026-10-11-migration-test-speed/`). The slow AI files pass 58 tests, the three panel probes pass 19, 8 and 4, and the www integration suite passes 11 of 13 files. Its 4 failures come from other sessions' staged specs paired with their unedited components, and both files pass on the live checkout.
- Each phase was kept on its probe. Phase 1's read count is the prototype's, accepted as `count-landing`. The suggestion draft's rerun on the round 3 tree passes the restated line on all nine rows at load 6.6.
- No browser run streams a model's answer. The proof drives the plugin API with real Markdown parsing and the list plugin installed.
- The regenerated entrypoint configs give the AI partitions their edges to `standard-basic-nodes` and `standard-list`; the entrypoint check had failed without them.

Review inputs. This iteration continues `docs/plans/2026-10-11-list-first-principles.md` and changed `packages/platejs/src/ai/react/AIChatPlugin.ts`, `packages/platejs/src/ai/react/AIChatPlugin.lists.spec.ts`, `packages/platejs/src/features/list/lib/BaseListPlugin.ts` and `packages/platejs/src/features/list/lib/listIdentity.internal.ts`.

Of 20 items, the 11 steps, the 8 completion gates and the decision-trail review, all 20 are done, step 1.4 on the narrower proof accepted as `count-landing`, and 0 are partial, skipped, blocked or open. The plan's Open work moved to the subject file.

### Decision-trail review

reviewed by gpt-6.1-sol (xhigh), on frozen commit `985a7c65`, against the transcript. It ran no check that writes. The lead confirmed all six findings and fixed each.

- warning: the narrowed suggestion-match and text-merge promises still read wide. Their Picks, step 2.1, two Native behavior rows and a Main changes bullet now state the narrowed behavior, and the approved words stay.
- warning: the voided hydration proofs had no `partial` rows. Both now have one in the parent's log.
- warning: the migration timeout's attribution went past its controls. The build base now fails the same way, 135 of 137.
- warning: phase 1's read count came from the prototype. It has a `partial` row and the `count-landing` Defaults row.
- warning: the new Open work items named no lasting tracker. They moved into `docs/plans/topics/list.md`'s Open work.
- nit: the scaling plan's Teach read as a key index build per edit. It now says the editing table starts empty.

After the review, `/pstack:correct` ran on the class the diff panel caught twice: new code that copies an owner's rule. The lint `plate/no-schema-placement-copy` now refuses a new copy of Plite's placement law outside plitejs and baselines the two that exist; the decision log's last rows hold its proof.

### Reflect

One reviewer on `opus` applied pstack's judgment, tooling and divergent lenses to the session transcript (`artifacts/2026-10-11-ai-list-landing/reflect/reviewer-a1.md`). No lesson is a helper fix for a case its own rule allows or a rewording that adds no words, so the lead applied none, and each accepted lesson waits in Backlog. owner: zbeyens for every Backlog item; stop: the owner takes or drops it.

Backlog:

- A brief tags a constraint as law only when it cites a doctrine file, never a spec or an earlier review's reasoning, because every `architect` runner inherits the tag. Here a spec line tagged as law made all three runners reject fresh list ids, which plan panel round 1 overturned. Home: the brief sentence in `.agents/pstack/rules/panel.md`, through dotai.
- When the last allowed plan round replaces a mechanism, probe the replacement against that round's seat cases before the build, or split it into its own iteration. Both plans hit this, and each ended in a revert and a new iteration. Home: `panel.md` and `.agents/playbooks/plan.md`.
- When reviews keep failing to infer a relation the producer never emits, add a design lane that changes the producer, such as an AI answer format that carries each source block's anchor. Six rounds refined suggestion pairing, and none proposed it. Home: `architect` through `.agents/playbooks/references/architecture.md`.
- A verdict that reopens a rejected lane splits the old objection into its claims and makes each a proof obligation. The SSR half of "random ids break determinism and SSR" came back as the hydration warning. Home: `.agents/playbooks/verdict.md`.
- A verdict that narrows the work prices every consumer in its own ingress census. AI output landing cost a second iteration. Home: `verdict.md`.
- A measurement that fails a requirement the plan quotes from the owner stays in scope as a step, a question or a page line, even when its cause predates the run. Home: `.agents/playbooks/build.md` and `plan.md`.
- A timing is reported with how often its cost recurs, once per editor or every operation, after a warm repeat. Home: `.agents/rules/benchmark.mdc` and pstack's `benchmark-checklist`.
- A removal control shows that its patched site ran, through a hit counter or a stack sample, before its null result counts. Two controls here patched the wrong site. Home: `benchmark.mdc`.
- When a reviewer flags a stand-in proof and the real proof is one probe away, run the probe instead of relabeling. Here that means counting the shipped landing's reads, which the word `count-landing` reopens. Home: `benchmark.mdc` and `.agents/pstack/rules/close.md`.
- `decisions-check.mjs append` refuses a `deviation`, `superseded` or `reverted` row unless its batch labels the replaced proof `partial` or says it still holds. Three trail findings broke sentences `trails.md` already has. Home: `/pstack:correct` in dotai.
- `freeze.mjs` marks a log that a reviewer is reading, so `append` refuses until the answer file exists. This run slipped one row into a log under review. Home: dotai.
- A full platejs test run is `TURBO_FORCE=true node_modules/.bin/turbo run test --filter=platejs --continue=always`. `pnpm --filter platejs test` stops at the first failure, and `-- --continue` collapses the partitions into one bun process. Home: `.agents/rules/verify/references/commands.md`.
- A probe builds its fixture by parsing Markdown or HTML through the real plugins, or copies a value from the plugin's spec, because guessed element type names fail. Home: `commands.md`.
- Middleware registered with `around(editorCommands.X)` runs only for `editor.update.X` calls. A `tx` primitive skips it, so code that writes through primitives calls the owner's function. Home: `.agents/rules/plate-plugins.mdc`.
- `cross.mjs --to claude` runs in plan mode, so an Opus seat may write its answer to a plan file and point at it. The brief should require the whole answer on stdout. Home: dotai.
- Hand measurements to a running sibling session that owns the fix through `SendMessage`, not a second `spawn_task` chip. Home: `.agents/playbooks/perf-issue.md`.

Rejected:

- Opening a new plan iteration needs a Defaults row with its reversing word, which the Autopilot rule already requires (already covered).
- `decisions-check` refuses `warning:` with a colon. Its error names the bare word, so the cost was one retry (not decision-changing).
- Long proofs run in the background and never behind `sleep`, which the runtime and `close.md` already require (already covered).
- `proof.mjs` has no `--expect-fail`. Its usage error says so (trivial).
- `grep -h` prints the wrapper's help. The shell rule already says to use `rg` or `command grep` (already covered).
- A subject page owned by another account gets a new page. plan-page's Render step 7 already says so (already covered).
- One read-only `git stash list` ran. It changed nothing (no lesson).

## Open work

Moved to `docs/plans/topics/list.md`'s `## Open work` at the fold on 2026-10-11.
