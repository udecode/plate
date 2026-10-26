---
review_scopes: [collaboration]
verdict: pursue
review_basis: [2026-10-16-react-editor-release]
work_kind: implementation
review_commit: 05b58b8c9a589fc89d7c9996d0593a24bfbb99dd
review_inputs: [packages/plitejs/src/yjs/core/canonical-split.ts, packages/plitejs/src/yjs/core/text-runs.ts, packages/plitejs/src/yjs/core/document.ts, packages/plitejs/src/yjs/core/event-change-bridge.ts, packages/plitejs/src/yjs/core/change-bridge.ts, packages/plitejs/src/yjs/core/selection.ts, packages/plitejs/src/yjs/core/controller.ts, packages/plitejs/src/yjs/core/joins.ts, packages/plitejs/test/yjs/split-merge-contract.spec.ts, packages/plitejs/test/yjs/split-node-contract.spec.ts, packages/platejs/src/utils/plugins/ExitBreakPlugin.ts, apps/www/src/app/(app)/examples/plite/_examples/yjs-collaboration.tsx, docs/plans/2026-10-17-yjs-block-text.md, docs/plans/2026-10-18-join-travels-as-join.md, docs/plans/topics/collaboration.md, docs/vision/plite.md, docs/vision/common.md]
---

# A Yjs paragraph split keeps its second half's letters

Status: executed: landed on next with the repairs plan; the typing speed gate stays open
Playbook: plan

Verdict: pursue. Today the Yjs binding splits a paragraph by deleting its second half and writing a copy into the new paragraph, and it finds the split by comparing the document before and after the commit. Both choices lose work. A teammate's typing, delete or format on those letters lands on letters that no longer exist. In 15 of 17 two-peer races on next, a peer loses a letter, brings one back, duplicates one or ends on a different document. Enter beside a bold word throws in the collaboration demo (plate#5278). The commit already says which letters it kept, so the binding should send a split as a split, the way it already sends a join as a join, and keep each letter's identity in the half it moved to.

## Brief

### What will change?

Pressing Enter in a shared document keeps a teammate's typing, deletes and formatting in the part that moves to the new line, and the demo stops crashing. Older rooms show an error, and the Close lists every proof and limit.

### What could go wrong?

The speed check for typing in a line you split many times gave no clear answer. No run clearly missed a limit, and no run passed all three. Two splits of one line at once can swap the new lines.

## Teach

In a shared document, Yjs stores each paragraph as an element that holds a text, and it gives every letter a permanent id. A teammate's edit points at its letters by that id.

Today, when you press Enter mid-paragraph, the sync code compares the document before and after to guess where the split happened. Then it deletes the second half's letters and types a fresh copy into the new paragraph. A teammate's edit on the old letters points at letters that are gone. So the edit vanishes, brings deleted letters back, or stays in the first line.

After this change, the sync code reads the split straight from your edit and puts a cut marker into the text. The letters stay where they are. The new paragraph holds an empty pointer that says "show that text from the cut on." Each letter keeps its id, so a teammate's edit lands in the line it was meant for.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How the moved half is stored | A cut marker in the text, so no letter moves (look) | Rebuild every paragraph's storage around shared letter pools | letter pools | big |
| Rooms saved by an older build | They show a clear error, and the app moves its own old rooms, as the vision says (look) | Add a reader that converts old rooms | read old rooms | big |
| A link inserted mid-line | Keep today's copy and give it its own task once this lands (look) | Use the cut marker for them in this plan too | cut inserts here | big |
| Two splits of one line at once | The new lines can come out swapped, and no letter is lost or doubled. Before a link, the swapped result reads "wo", an empty line, then "rd" with the link and its tail, where the intended result puts "rd" on its own line and the link on the last | Reorder those lines when reading them | reorder splits | small |
| Typing in a line a teammate removes | It goes with the removed line, as today | Keep it as a new line | keep typing | small |
| A move and an Enter that a teammate receives together | They import as a replacement, so the teammate's undo of a letter typed in that line does nothing, as today. Fixing it needs the import to read a batch's moves before its splits, which no code does yet (look) | Read moves before splits in this plan | read moves | small |
| The crash's cursor error | Fixed at its cause, so every line always has a text to point at | Also let the cursor lookup return nothing | quiet cursor | small |
| Typing speed in a line split many times | Checked on the final build against limits set now, and a clear miss sends the design back | Build a faster letter lookup for each part of a split line now | piece index | small |
| Checking that the editor matches the shared document | In the tests, after every edit | Also at runtime after each split | runtime check | detail |
| A review of this plan | Skipped, because three designs and a judge picked it and the code gets a review before it ships | Review the plan now | panel | detail |
| How the work lands | One landing at the end. Shipping phase 1 alone would let a teammate's undo bring back letters the writer deleted, and only phase 3 fixes that undo (look) | Ship phase 1 alone with that undo test set to today's result | land phase 1 | detail |
| The speed check with no clear answer | Land now, keep the check open and name its next run, because no run clearly missed a limit (look) | Wait to land until one run passes all three limits | hold for speed | small |

## Evidence

### Requirements

- A teammate's delete or format on the second half's letters is neither lost nor brought back (the ask's first finding).
- A teammate's typing lands in the half where it was typed, with or without a format, and Enter at the end keeps it (the second finding).
- A split before inline elements copies nothing into both halves, and an edit inside a child the split moves is moved with it (the third and fourth findings).
- A split whose commit also changes either half keeps a teammate's typing, and the writer's editor and the Yjs document agree after Enter where two leaves meet (the fifth to seventh findings).
- A commit that replaces a block with new blocks of the same letters never reaches peers as a split (the sixth finding).
- A pending link's inline split, Enter inside a pending link and a double reject of the same pending split survive a concurrent url write or converge on one copy (the eighth, ninth and eleventh findings).
- Enter at either edge of a bold word throws nothing, and both peers converge and keep importing (plate#5278).
- Transactions construct canonical changes, and the change is the sole commit truth (`docs/vision/plite.md:28`).
- A join travels as a join, and an undo rebased over it lands where it stood (`docs/vision/plite.md:641-651`).
- Collaboration claims need two-client, provider, awareness, offline and history proof (`docs/vision/common.md:120`).

### Current behavior

The lead's two-peer probes ran these races on next at 05b58b8c9a, in both delivery orders where two peers edit. C18 onward ran on a clean base worktree at the same commit.

| Case | What happens | Expected | Today |
| --- | --- | --- | --- |
| C1 | split "word" at 2, peer types X at 3 | wo / rXd | X lands in the first half |
| C2 | split at 2, peer deletes "rd" | wo / empty | "rd" comes back |
| C3 | split at 2, peer colors "rd" | wo / red rd | the color is lost |
| C4 | split at 0 and color the right half, peer types at 1 | empty / green wXord | the letter is lost |
| C5 | Enter at the end, peer types X at 1 | wXord / empty | X is lost |
| C6 | split before two links, peer types at 1 | wXord / links | both lines show both links and the tail |
| C7 | split before a link, peer types after it | word / link taXil | X is lost |
| C8 | split before a link, peer types in it | word / LIXNK | X is lost |
| C9 | split and recolor the left half, peer types in it | blue wXo / rd | X is lost |
| C10, C11 | Enter where two leaves meet | word / red tail | the writer's editor and its Yjs document differ |
| C12 to C14 | plate#5278, Enter at either edge of a bold word | Lin bold / edit | the commit listener throws and the peers diverge |
| C15 | both peers split at 2 | no letter twice | "rd" twice |
| C16 | peers split at 2 and 3 | wo / r / d | "d" twice |
| C17 | split at 2, peer deletes "d" | wo / r | "d" comes back |
| C18 | split at 2 and join back, peer types X at 3 | worXd | woXrd |
| C20 | after a synced split, remove the first line while a peer types at the start of the second | Xrd | passes |
| C21 | split at 2, peer types X at 3, then undo the split | worXd | woXrd |
| C25 | replace "word" with new "wo" and "rd" lines while a peer deletes the old "r" | wo / rd | passes |
| S1, S2 | set a link's url while a peer types in its paragraph | url v and the letter | url v is lost |
| F1 | paste two paragraphs at 2, peer deletes "d" | woA / Br | "d" comes back |
| G6 | insert a link at 2, peer types X at 3 or deletes "d" | wo, link, rXd or r | the peer's edit is lost |
| M1 | peer merges line 2 into line 1; Enter in line 1 and a delete of lines 2 and 3 cross it; then the merge is undone | a / bc / empty | after a mid-word Enter, the deleted "d", "e" and "f" come back |

C20 and C25 already pass, so they stay as cases the build must not break. Wrapping part of a text in a link keeps a peer's delete today.

### Dependents

- `distribution` and `editing` (`packages/platejs/src/utils/plugins/ExitBreakPlugin.ts`, `SingleBlockPlugin.ts`, `SingleLinePlugin.ts`, `markdownParagraph.ts`): unaffected. They call the break and facade commands, whose commits keep their shape; only the Yjs binding's write of those commits changes.
- `ui` (`apps/www/src/app/(app)/examples/plite/_examples/yjs-collaboration.tsx`): unaffected, because no example code changes. The collaboration demo is the route plate#5278 names, and it is this plan's browser proof.

### Lanes

- Keep the copy (control): the split deletes the second half and writes new letters, as next does today. It loses a teammate's edit in 15 of the 17 races above.
- Cut marker (pick): the split inserts one cut into the paragraph's Yjs text and an empty view text for the new paragraph, so each half keeps reading its own letters. It is the Opus runner's design with grafts from the Astra and Sol runners.
- Letter pools or owner partitions: every block stores its letters apart from its place in the tree. Each rewrites every block's storage and needs a placement CRDT before any race passes.

This plan retains the basis review 2026-10-16-react-editor-release, because that review's pursue covers the binding's lifetime and this plan changes only what the binding stores for a split. The binding's current rules live in the [collaboration subject](topics/collaboration.md).

Model: claude-opus-5-5 at xhigh effort for the lead. The architect runners were claude-opus-5-5, gpt-6-astra and gpt-6.1-sol at xhigh, and the cross-judge claude-opus-5-5 at xhigh. The explorer and the prior-art reader ran on gpt-6.1-sol at medium effort.

## Public API

No public call changes. Every export, command, option and type of `plitejs/yjs` keeps its shape. The same setup call now refuses a room an older build saved, because the room format moves from 4 to 5. Document shape shows the new layout, and Hard cuts and app migration says who moves old rooms.

```tsx before
// content/docs/plite/libraries/plite-yjs.mdx
const editor = createEditor({
  plugins: [
    history(),
    yjs({
      doc: provider.document,
      initialReady: createHocuspocusInitialReadiness(provider),
      awareness: provider.awareness,
      rootName: "plitejs",
    }),
  ],
  initialValue,
});
```

```tsx after
// content/docs/plite/libraries/plite-yjs.mdx
// A room saved in format 4 fails here with "Cannot open a Yjs document
// written with schema metadata format 4; this editor reads format 5."
const editor = createEditor({
  plugins: [
    history(),
    yjs({
      doc: provider.document,
      initialReady: createHocuspocusInitialReadiness(provider),
      awareness: provider.awareness,
      rootName: "plitejs",
    }),
  ],
  initialValue,
});
```

## What other editors do

Read from upstream source on 2026-10-24 by a Codex explorer, which ran none of them: y-prosemirror `f89fadd2a8`, slate-yjs `69f3e0eaec`, Lexical `dd5c41b131`, Automerge `1618c976ca`, Loro `d5da57dd2a` with loro-prosemirror `0e036a9bed`, Yjs `676cc334ed` and CKEditor 5 `14e73cc31b`. Only the editors that move letters instead of copying them keep a concurrent edit in the new paragraph.

| Editor | How a split travels | Does the second half keep its letters? | A teammate's typing after the cut lands in | Source |
| --- | --- | --- | --- | --- |
| y-prosemirror | It reconciles the document, deletes the suffix and writes a fresh paragraph | No | the old paragraph | `src/plugins/sync-plugin.js:1075-1090` |
| slate-yjs | A text split keeps letters, and a paragraph split clones the suffix | No, for a paragraph | the old element | `packages/core/src/applyToYjs/node/splitNode.ts:47-88` |
| Lexical | It reconciles children with fresh containers and string inserts | No | the old element | `packages/lexical-yjs/src/CollabElementNode.ts:586-629` |
| Automerge | It inserts a block marker into the same flat text | Yes | the new block | `rust/automerge/src/transaction/inner.rs:893-928` |
| Loro with loro-prosemirror | It reconciles the kept text and creates the other side | No | the original container | `src/lib.ts:187-226` |
| CKEditor 5 | A split operation moves the suffix, and operational transformation moves concurrent positions | Yes | the new paragraph | `model/operation/splitoperation.ts:195-211` |

Yjs itself has no move and no shared view of part of a text, so a split that keeps both halves' letters needs data Yjs does not have (`src/types/YText.js:254-271`, `src/utils/RelativePosition.js:163-186`). The cut marker brings Automerge's approach to Yjs. It puts a marker in the same text, and a view element keeps every block a real Yjs element.

## Document shape

This is how a room stores paragraphs inside Yjs. Apps never see it, and the Plite document value does not change. Today, splitting "word" after "wo" deletes "rd" and writes new copies of those letters. After this plan, it inserts one cut marker and an empty view text. Ids are `client.clock`.

```json before
{ "document": [
  { "element": { "type": "paragraph", "yjs:id": "p1" },
    "children": [ { "xmlText": { "yjs:id": "t1" }, "items": [
      { "id": "1.0", "insert": "wo" }, { "id": "1.2", "insert": "rd", "deleted": true } ] } ] },
  { "element": { "type": "paragraph", "yjs:id": "p2" },
    "children": [ { "xmlText": { "yjs:id": "t2" }, "items": [ { "id": "1.6", "insert": "rd" } ] } ] } ] }
```

```json after
{ "document": [
  { "element": { "type": "paragraph", "yjs:id": "p1" },
    "children": [ { "xmlText": { "yjs:id": "t1" }, "items": [
      { "id": "1.0", "insert": "wo" }, { "id": "1.4", "insert": { "yjs:cut": 1 } }, { "id": "1.2", "insert": "rd" } ] } ] },
  { "element": { "type": "paragraph", "yjs:id": "p2" },
    "children": [ { "xmlText": { "yjs:id": "t2", "yjs:cut-source": "t1", "yjs:cut-at": [1, 4] }, "items": [] } ] } ] }
```

Today, a split before an inline element, such as a link, copies it and the text after it into the new paragraph and deletes the originals. After this plan, it moves them with placeholders, the way a join already moves children, and hides the originals where they are. The new paragraph starts with the empty text Plite keeps before a link.

```json before
{ "document": [
  { "element": { "type": "paragraph", "yjs:id": "p1" }, "children": [
    { "xmlText": { "yjs:id": "t1" }, "items": [ { "insert": "word" } ] },
    { "element": { "type": "link", "yjs:id": "l1" }, "deleted": true, "children": [ { "xmlText": { "yjs:id": "t2" }, "items": [ { "insert": "LINK" } ] } ] },
    { "xmlText": { "yjs:id": "t3" }, "deleted": true, "items": [ { "insert": "tail" } ] } ] },
  { "element": { "type": "paragraph", "yjs:id": "p2" }, "children": [
    { "element": { "type": "link", "yjs:id": "l4" }, "children": [ { "xmlText": { "yjs:id": "t5" }, "items": [ { "insert": "LINK" } ] } ] },
    { "xmlText": { "yjs:id": "t6" }, "items": [ { "insert": "tail" } ] } ] } ] }
```

```json after
{ "document": [
  { "element": { "type": "paragraph", "yjs:id": "p1" }, "children": [
    { "xmlText": { "yjs:id": "t1" }, "items": [ { "insert": "word" } ] },
    { "element": { "type": "link", "yjs:id": "l1", "yjs:hidden": true }, "children": [ { "xmlText": { "yjs:id": "t2" }, "items": [ { "insert": "LINK" } ] } ] },
    { "xmlText": { "yjs:id": "t3", "yjs:hidden": true }, "items": [ { "insert": "tail" } ] } ] },
  { "element": { "type": "paragraph", "yjs:id": "p2" }, "children": [
    { "xmlText": { "yjs:id": "t7" }, "items": [] },
    { "element": { "yjs:virtual-child-id": "l1", "yjs:virtual-placeholder": true } },
    { "element": { "yjs:virtual-child-id": "t3", "yjs:virtual-placeholder": true } } ] } ] }
```

## Layer and owner

The binding gains one rule for splits; the provider, presence and Plate rows stay as they are.

| Delta | Responsibility | Decision |
| --- | --- | --- |
| added | Splits | A split travels as a cut marker inside the Yjs text, and whole children after it move by placeholder. The receiving peer reads the cut back as the split, and a join of a cut's two halves deletes the cut. No write copies letters to split. |

| Delta | Alternative | Why it lost |
| --- | --- | --- |
| added | Delete the second half and write a copy | A teammate's edit on the moved letters lands on letters that no longer exist. |
| added | Letter pools or owner partitions for every block | They rewrite every block's storage and need a placement CRDT before any case passes. |
| changed | Keeping a cut chain's texts in the first line on Enter | It kept a letter a teammate typed after the cut but brought back a letter a teammate deleted there, where `next` keeps it deleted. The cut marker keeps both halves' letters instead. |

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Split detection from the commit's structural tokens | Plite | `plitejs/yjs` (`packages/plitejs/src/yjs/core/boundaries.ts`, new) | The commit names the kept letters; only the binding lowers commits to Yjs. |
| Cut marker, text pieces and the piece-aware reader and writer | Plite | `plitejs/yjs` (`text-runs.ts`, `canonical-split.ts`) | `text-runs.ts` already owns every write to a Yjs text. |
| One removal gate and one shown placeholder per node | Plite | `plitejs/yjs` (`document.ts`) | `document.ts` owns the Yjs tree and its visibility keys. |
| Split read-back on import and the heal on join | Plite | `plitejs/yjs` (`event-change-bridge.ts`, `joins.ts`) | The import and `planJoin` already own joins. |
| Room format 5 | Plite | `plitejs/yjs` (`schema-metadata.ts`) | The binding owns the room's metadata check. |

Every change stays inside the headless `plitejs/yjs` entrypoint, which depends only on the root entry in `tooling/entrypoints/entrypoint-dag.mjs`, so no new import edge appears.

## Hard cuts and app migration

- Rooms written in format 4 refuse to open, with "Cannot open a Yjs document written with schema metadata format 4; this editor reads format 5." A format-4 build refuses format-5 rooms by the same check. Moving old rooms is the app's job, because "History and Yjs room cutovers remain app-owned persistence policy" (`docs/vision/plate.md:530-531`). The collaboration demo keeps rooms in memory, so it needs nothing.
- No public export, command, option or type is removed or changed. The deleted functions are internal to `packages/plitejs/src/yjs/core/`, and outside it only legacy plans without a `Status:` line and done plans name them. The build runs `pstack:blast-radius` on them before it deletes them.
- No registry component or app code changes.

## Native behavior and proof

Typing, IME, clipboard and focus are unchanged; the build changes only what the binding stores and reads.

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| A teammate's caret at a split | A caret at the end of the first line and one at the start of the second map to different Yjs positions, so each stays in its line | two-peer awareness cases under Bun; the collaboration demo in Playwright Chromium and WebKit |
| Undo of a split a teammate typed into | One paragraph comes back with the teammate's letter in place | two-peer history case under Bun |
| Enter beside a bold word | No error, both windows show the same lines, and the next edit imports | `/examples/plite/collaboration-demo` in Playwright Chromium and WebKit, then a hand drive |
| A split made offline | Edits made on both sides before they sync keep their letters | the two-peer cases, which edit both peers before syncing |

## Main changes

- The binding finds a split in the commit's structural tokens instead of comparing values. `findCanonicalSplit`, `findTopLevelElementSplit`, `lowerElementBoundarySplit`, `lowerCanonicalSplit`, `cutTextChain` and the clone branch of `splitVisibleYjsChildren` go.
- A split inserts a cut embed into the source text and an empty view text into the new block. Whole children after the split move by placeholder.
- A text child shows a piece, from its cut to the next live cut. Point mapping counts letters per piece, and a mark that starts a piece anchors on its cut, so the first line's marks never reach the second.
- Every removal goes through one private gate in `document.ts`, which keeps a text alive, hidden, while a view outside the removed children shows it. The gate deletes no letters, so a line a write moves keeps them, and a removed split line's letters stay hidden in their source, where a teammate's join made at the same moment brings them back. The [repairs plan](2026-10-25-yjs-split-repairs.md) deletes them (owner: that plan).
- A node shows at one placeholder only, the one in the block that comes last in the document, else the higher Yjs item id. This replaces the value heal `removeSupersededVirtualYjsSplitSuffixes`. A local write that touches a node with several placeholders keeps the one that shows it, or the new one, and deletes the rest.
- One function in `text-runs.ts`, `alignYjsChildren`, pairs a line's Plite children with its Yjs children, and every reader of that pairing calls it. A peer's Yjs omits an empty text between two inline elements, so a Yjs index past it is not its Plite index. Before this change, wrapping letters after such a text on that peer trimmed the wrong Yjs text, on the base branch too. A lookup from a Plite path to a Yjs node still reads each step as a Yjs position, so an edit inside a nested inline element after such a text can land in the wrong element until the repairs plan lands (owner: that plan).
- Compatible replacement aligns empty spacer texts and gives an empty text a Yjs text once it gains letters or props. It pairs an old root child only when the change keeps its open token. A nested element pairs by shape, because a move inside a block deletes and inserts the same tokens.
- A split writes the empty text that starts the new line before an inline element only when that text has props. A peer's import deletes a bare one, and with it the letters typed into it before the delete arrived.
- The import reads splits and unsplits back from the Yjs batch, so history rebases over them as it does over joins. A batch that also moves the split line imports as a replacement instead, so a teammate's undo of an edit in that line does nothing (owner: the collaboration subject). A join of a cut's halves deletes the cut. An Enter at an inline element's end reads back as a split only while the new element stays empty, so typing into it in the same commit imports as a replacement until the repairs plan lands (owner: that plan).
- A join of two inline lines may also delete the one empty text between them, so rejecting a pending split inside a link reaches peers as a join. An element inserted into that text rebases by position.
- A remote import maps the local text selection through its change, so a caret keeps its letter when a teammate edits before it. A caret inside content the change deletes keeps its old place.
- Room metadata moves to format 5.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Split detection on export | value finders compare the document before and after | `boundariesOf` peels sections that only cut, trimming structural tokens only | `boundaries.ts` | the commit names the kept letters | internal | C1 to C17, C25, F1 | a commit that mixes other structure with the cut still replaces the region | rearchitect |
| Split write | delete the suffix, write a copy, clone trailing children | cut embed, view text, placeholders for whole children | `canonical-split.ts` `writeSplit` | letters keep identity | internal | C1 to C9 | readers that count Yjs length | rearchitect |
| Text read and write | one Yjs text is one run of leaves | piece chains, letters counted per piece | `text-runs.ts` | an embed shifts Yjs offsets | internal | embed and caret cases | an unaudited reader | rearchitect |
| Removal | the raw delete at nine call sites | one gate, `deleteYjsChildren` | `document.ts` | a view's source must outlive the view | internal | one case per removal path | a missed path empties a view | rearchitect |
| Placeholder display | dedup within one parent plus a value heal | one shown placeholder per node, the last in the document; a local write that touches it deletes the others | `document.ts` | two splits can move the same children | internal | the two-split link case, and removal and moves after it | none known | rearchitect |
| Compatible replacement | needs equal segment counts | aligned spacers; pair a root child only when its open token stays | `replacement.ts` | S1, S2 and findings 6, 8, 9 | internal | S1, S2, C25 | none known | rearchitect |
| Split import | region diff by value | `boundariesInBatch` emits split and unsplit sections | `event-change-bridge.ts` | history rebases over splits as over joins | internal | C21 | a batch that also moves the split line imports as a replacement | rearchitect |
| Local selection on remote import | kept at the same path and offset | mapped through the import's change | `editor-adapter.ts` `applyRemote` | a caret must keep its letter when a teammate edits before it | internal | the two caret cases in `editor-adapter-contract.spec.ts` | a caret inside deleted content keeps its old place | rearchitect |
| Join of a cut's halves | placeholder move | heal deletes the cut | `joins.ts` `planJoin` | the letters stay in one text | internal | C18, double heal | none known | rearchitect |
| Join of two inline lines | refused when an empty text sits between them | takes that one empty text | `core/change/join.ts` `joinIn` | two peers rejecting one pending inline split showed the paragraph twice | internal | finding 11, the join-transform link case | an element inserted into that text rebases by position | rearchitect |
| Mark inheritance | a new letter takes its left neighbour's marks | a mark that starts a piece anchors on its cut, so a piece's first letter takes them from inside the piece | `text-runs.ts` `refreshLetters` | a letter typed after the cut must not take the first line's marks | internal | the unbold case | none known | rearchitect |
| Room format | 4 | 5, older rooms refused | `schema-metadata.ts` | an older reader misreads embeds | app-owned room cutover | format cases | apps with saved rooms | rearchitect |
| Keystroke cost in a split family | walks one block's text | walks the family's source text | `text-runs.ts` | the cut keeps a family in one text | internal | family-key gate | a conclusive miss sends the layout back to architect | gate |
| Cursor mapping throw | reachable through the wrong split position | unreachable, since every block keeps a text | `selection.ts` | the throw marks a state the fix removes | none | C12 to C14 | none known | keep |
| Inline insert mid-text | rewrite the whole text | unchanged in this plan | `event-change-bridge.ts` `lowerInlineTextCut` | outside the split; the same cut can carry it later | suggested task t_92048e79 | G6 | a teammate's edit anywhere in that text is lost until then | defer |

## Steps

The build runs the Build playbook. Delegates write the code; the lead reviews and proves each diff. Every two-peer case runs in both delivery orders, compares both peers' editors, and compares the writer's editor with a fresh peer that joins from the shared document. Focused runs go through `cd packages/plitejs && bun test --preload ../../config/plite-source-test-setup.ts test/yjs/<file>`, and each phase exit runs `pnpm --filter plitejs test:partition:yjs`.

### Phase 1. Fix the plate#5278 crash and align empty texts

- [x] 1.1 Count a line-edge split's position in Yjs slots. `findTopLevelElementSplit` returns a Plite child count, and `splitVisibleYjsChildren` reads it as a Yjs slot. Map it through the text group before the call. Proof: C10 to C14 as cases in `split-node-contract.spec.ts`, with awareness on for C12 to C14, fail at base with the commit-listener throw or with the writer's editor and its Yjs document differing (`probes/split-races-next-a2-a1.log`), and pass after.
- [x] 1.2 Align empty spacer texts in `canReplace` and `replaceCompatibleYjsChildren` through `alignSegments`, as `planJoin` already does. Proof: S1 and S2 as cases in `set-node-contract.spec.ts` keep url v and the typed letter, which base loses (`probes/split-races-3-base-a2.log`); the spacer-alignment worktree already passes them (`probes/split-races-3-q1-align-a1.log`).
- [x] 1.3 Drive plate#5278 on `/examples/plite/collaboration-demo` through `verify`: Enter at the end and at the start of the bold word, then a remote edit, in Playwright Chromium and WebKit through the managed runner, five warm runs each. Proof: no `commit-listener failed` error, both editors show the same lines, and the next edit imports. On the final bytes 5191bbd170, `collaboration-demo.test.ts`'s four cases pass in five warm Chromium and five warm WebKit runs, with no import failure or runtime error the spec records (repairs run, `demo-final/run2.out`).
- [x] 1.4 Phase exit. Kept. On the final bytes the Yjs partition fails nothing, `undoes a merge whose split-off line a peer emptied` included (repairs run, `panel-d3/gates4/suites-a2.log`). Keep when 1.1 to 1.3 pass and the Yjs partition passes except `undoes a merge whose split-off line a peer emptied`, which 3.1 owns; revert both edits otherwise. Phase 1 lands with phases 2 and 3, because once a leaf-edge Enter reaches Yjs, that undo brings back letters the writer deleted, as a mid-word Enter already does at base (`probes/merge-undo-split-base-a1.log`, `probes/merge-undo-split-fix-a1.log`).

### Phase 2. Store a split as a cut

- [x] 2.1 Reserve `yjs:cut`, `yjs:cut-source` and `yjs:cut-at`, and move room metadata to format 5. Proof: a format-4 room refuses with the message above and a format-5 room opens, in `schema-identity-contract.spec.ts`; `older-peer-import-contract.spec.ts` and `authored-legacy-room-contract.spec.ts` assert the new refusal.
- [x] 2.2 Add text pieces: `textPieceOf`, `cutTextAt`, the piece-aware reader and writer, and point mapping that counts letters per piece. Audit every `getYjsLength`, `toDelta` and `toString` reader under `src/yjs`, and record each in the decision log. A mark that starts a piece anchors on its cut, so a piece's first letter inherits from inside the piece. Proof: a caret at offset 3 after a cut at 2 types before "d" in the editor and in Yjs, which base gets wrong for an embed (`probes/embed-readers-base-a1.log`); bold "word", cut at 2, unbold "rd" while a peer types after the cut, and the typed letter is not bold.
- [x] 2.3 Peel splits with `boundariesOf`, write them with `writeSplit`, and apply the pairing rule in region replacement. Delete the value finders. Proof: C1 to C9, C15 and C17 pass where base fails; C16 passes with the lower client id cutting first; C20 and C25 still pass; F1 gives woA and Br; C25 with the old "w" also deleted gives "wo" and "rd", where base gives "o"; splitting `link("am")` and then removing "m" stays one split. The run's race probes rerun on the build as a cross-check.
- [x] 2.4 Route every removal through one gate in `document.ts`, which stays private there. Proof: one case per removal path (each former raw-delete call site, region replacement and reset) removes the first line of a synced split while a peer types in the second, and the second line keeps its letters; `pnpm --filter plitejs typecheck` shows no import of the raw delete outside `document.ts`.
- [x] 2.5 Show a node at one placeholder only, the one in the block that comes last in the document, else the higher Yjs item id, and delete `removeSupersededVirtualYjsSplitSuffixes`. A local write that makes a placeholder for a node, or removes or moves an element that holds one, deletes the node's other placeholders, keeping the new one or the one that shows it. `removeYjsChild` already keeps a removed line, hidden, while a placeholder outside it shows a node under it. Proof: A splits `[word][link][tail]` at 2 while B splits it at 4, and the link and the tail show once on both peers. After that contest, removing the line that shows the link removes it on every peer, moving the other block past it keeps the link where it showed, and moving the link before both blocks shows it there once, each checked on both peers and a fresh peer. After a split at 4, removing the first line through each removal path keeps the link and the tail in the second.
- [x] 2.6 Keep remote import local. Proof: a case in `event-change-locality.spec.ts` types into one piece of a 100-piece family, and the import decodes that piece's block only.
- [x] 2.7 Rerun the family keystroke gate through `benchmark` on the final production path, after the last panel fix. Families of 2, 10 and 100 pieces of 100 letters sit in a 1,000-block document; each key is a local commit plus a remote import; budgets are 1.10, 1.25 and 2.0, with planted and same-code arms through `node .agents/rules/benchmark/scripts/paired-timing.mjs`. Proof: the run's log. A conclusive miss sends the layout back to `architect`; an inconclusive line stays a gate.
  - The gate ran on 5191bbd170 against 14cf5ecb45 in four runs of six interleaved packets, and it stays a gate. No run misses a budget conclusively, so the layout stays. Normal passes at 0.940 with noise 0.020, large at 1.102 and 1.078, and stress at 1.446 and 1.583, but no single run passes all three lines. Each run's known-bad half, the candidate label on base code, fails with the probe's layout mismatch, and every arm reads back the typed letters, equal peers, the block count, an untouched piece and its layout. In the warm runs base takes 485 to 697 µs per key, and the limiter is inferred, not profiled, as the family source's letter walk per key (repairs run, `bench27/` logs).
  - The probe changed after its first run. The first cohort in each process read partly cold, its base arm at 772 µs per key against large's 603, so the warm probe runs every cohort once untimed before the timed pass. Doubling the candidate's own work plants about 2.9 at its stress ratio, not the 2.4 set earlier, so the stress plant moved to 2.9 before that run. Five trials per process raised the same-code noise to 0.28 to 0.39 and was dropped. The budgets never moved.
  - The next probe is one run of `bench27/family-key-warm7-config.json` through `paired-timing.mjs` that passes every line. The Defaults word "hold for speed" picks holding the landing for it instead.

### Phase 3. Read splits back, heal joins, and write the law

- [x] 3.1 Read splits and unsplits from the Yjs batch with `boundariesInBatch`, so history rebases over them. Proof: C21 gives worXd on both peers, which base gives as woXrd (`probes/split-races-2-base-a3.log`). M1 gives a / bc / empty in `merge-node-contract.spec.ts`'s `undoes a merge whose split-off line a peer emptied`, with a leaf-edge and a mid-word Enter; phase 1 alone brings back "d", "e" and "f". The same merge undo without the delete keeps a mid-word Enter. With a leaf-edge Enter and no delete, both peers end on one document that keeps every letter but drops the Enter, where base leaves them on different documents (`probes/merge-undo-split-base-a1.log`, `probes/merge-undo-split-d4-a2.log`). A caret after the cut, in the peer that receives the split, moves into the second line, where base and phase 2 drop it (`probes/remote-split-selection-base-a1.log`). The import maps every local text selection through its change, so a caret keeps its letter when a teammate types, deletes, marks, adds, removes or joins lines before it (`review-d4/caret-remote-base-a2.log`, `review-d4/caret-remote-build-a2.log`).
- [x] 3.2 Heal a join of a cut's halves in `planJoin`. Proof: C18 gives worXd, where base gives woXrd; two peers that join the same split offline end with one paragraph; the reconnect cases "preserves a remote split when an offline local split was undone before reconnect" and "replays an offline split redo onto the remote split boundary after reconnect" pass with either peer holding the lower client id.
- [x] 3.3 Port findings 8, 9 and 11 as tracked cases from the round 3 probes. Proof: finding 8 gives a@v and b@u; finding 9 gives no duplicate link, and accept then reject gives one line that shows its letters once, as a@v then b@u, because the url write lands on the left half as in finding 8 (`delegate-5/f9-probe-build-a1.log`); finding 11 gives one paragraph with link ab ref r1, and with the removal accepted, one link b. Each runs in both orders. Finding 11 needed a join of two links with the one empty text between them, so the core join takes that text and the Yjs join maps a line's children past it; its case fails at base and passes after, with either client id lower (`delegate-6/f11-case-base-a1.log`, `delegate-6/f11-case-after-a1.log`).
- [x] 3.4 Probe finding 10, `AuthoredMarkError` on a set-valued merge, on the build through the authored collaboration harness. Fix it in `packages/plitejs/src/authored/tree/marks.ts` when the cut tag causes it; otherwise log its owner. Proof: in both orders and all six client-id orders, neither base nor the build throws. Base shows the paragraph twice, and the build shows one line, a@u then b@w (`delegate-5/f10-ids-base-a1.log`, `delegate-5/f10-ids-build-a1.log`). The mark check at `marks.ts:342-386` has no clause for a right half, and its owner is the t_a2a1c87f order build.
- [x] 3.5 Pin C19, C22 and C23 as cases: typing in a removed line goes with it, and a move or wrap of a split line keeps a peer's typing. Proof: the cases.
- [x] 3.6 Add the split sentence to the join law in `docs/vision/plite.md`. "The binding sends a split as a cut inside the text, and the receiving peer reads it back as the split. When the second line's text continues the first line's through a cut, a join deletes the cut instead of moving that text." Proof: `node tooling/scripts/review-ledger.mjs check docs/plans/2026-10-24-yjs-split-identity.md` and the knowledge docs check pass.
- [x] 3.7 Through `plate-docs`, update the split sentence of `content/docs/plite/libraries/plite-yjs.mdx`, which has no Chinese twin. Proof: the docs checks and the rendered page. The binding section now says a split inserts a cut marker and the new block's empty text shows the source from the cut on. Children after a split between children move by placeholder, and a join of a cut's two lines deletes the cut. An inline insert in the middle of a text still loses a peer's concurrent edit there, and a wrap moves a peer's letter typed before its end. The metadata paragraph says a room in another format fails to open. `build:source`, `check:docs`, `build:registry` and `build:registry --check` exit 0 on the final bytes with no tracked file changed, and the hand drive read the six changed sentences from the rendered page (repairs run, `final5/docs.out`, `final5/drive-check-a1.log`).
- [x] 3.8 Run the collaboration proofs: the provider, awareness, history and offline specs in the Yjs partition, the demo drive of 1.3 again with a mid-word split and remote typing, and a hand drive. Proof: their logs and `node tooling/scripts/hand-drive.mjs check docs/plans/2026-10-24-yjs-split-identity.md`. On the final bytes the Yjs, core, authored and history partitions and the two collab files fail nothing, with 825, 3775, 1217, 207 and 384 tests passing, the provider, awareness, history and offline specs among them. The demo spec's offline mid-word split passes with 1.3's runs. The hand drive covers the collaboration demo, the Yjs collaboration example, the inlines example and the Yjs docs page at desktop width in light, including a removal that races a join while one tab is offline, and `hand-drive.mjs check` passes (repairs run, `panel-d3/gates4/`, `final5/drive-check-plan-a1.log`).
- [x] 3.9 Write the `plitejs` changeset through `changeset`, naming the format bump. Proof: the changeset check. The Yjs binding has never shipped, so the step adds no changeset. The unreleased `platejs` major changeset `.changeset/plite-yjs-attribute-keys.md` now names format 5, and `changeset status` reads it (`proof/changeset-status-a1-a2.log`).
- [x] 3.10 Fix the fifteen cases in `join-collab.test.ts` and `authored-tree-collab.test.ts` that phases 1 and 2 broke, which the Yjs partition does not run. Fix each in the code, or rewrite its expectation only where this plan changes that behavior on purpose. Proof: both files and the core, authored, history and Yjs partitions pass (`collab-regress/wip-two-files-a1.log` holds the 15 failures). Seven took code fixes: a type change that keeps a block's close no longer replaces the block, a split keeps the empty texts that end its first line, and an Enter before a line's first child reads back as an empty line above (`delegate-7/final-core-a1.log`, `collab-regress/lead-authored-partition-a1.log`). Seven cases now expect what this plan does on purpose: a node shows at its last placeholder, a moved letter keeps its deletion tag, both removed link pieces stay removed, and a rejected replacement stays held when the other client presses Enter in its inserted text. Base fails each of them (`collab-regress/lead-rewrites-at-base-a1.log`).
- [x] 3.11 Phase exit. Keep when phases 2 and 3 pass together, with the core and authored partitions; revert both otherwise. Run the writing passes, the panel on the diff, the gate in 2.7, then `land.mjs`. Kept. Phases 2 and 3 pass together with the core and authored partitions on the final bytes. Three diff panel rounds ran on this build and three more on the repairs build, which this plan's third round required, each round's fixes with their writing passes. The 2.7 gate stays open with its next probe named, and both plans land through one `land.mjs` run.

## Completion gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| `verify` loaded before the first proof gate | yes | loaded before phase 1's proof, and again in the closing session before the final-bytes proofs and after its compaction |
| `pstack:blast-radius` on the deleted internals | yes | row 24: no deleted internal reaches a public entrypoint |
| `pstack:thermos` on shared code | skip: the `push` row owes a panel on each diff | skip |
| Panel on each diff before push | yes | three rounds on this build (rows 65, 77 and 86) and three on the repairs build that carries it (repairs rows 96, 108 and 114), each seat Opus, Astra and Sol at xhigh |
| Type-aware oxlint before each panel | yes | row 64, then the repairs build's gate runs before each of its rounds and on the final bytes (repairs row 121) |
| Writing passes | yes | before each diff round and after each round's fixes (the `writing` rows of both logs) |
| Family keystroke gate on the final path | yes | inconclusive, stays a gate: step 2.7 (repairs row 126) |
| Hand drive | yes | step 3.8 (repairs row 128) |
| Playtest | skip: `playtest.mjs scope` names no catalog for these files | skip |
| `plate-docs` on the Yjs page | yes | step 3.7 (repairs row 129) |
| Changeset | yes | row 66: the unreleased platejs changeset names format 5 |
| `best-api repair` | skip: no public API changes | skip |
| Review ledger check at close | yes | `review-ledger.mjs check` on both plans after the fold |

## Open work

- A link inserted mid-text still rewrites the whole text, so a teammate's typing or delete anywhere in it is lost (G6 at base). Wrapping part of a text in a link keeps its letters, but a letter a teammate types before the end of the wrapped part lands after the link, at base too. Suggested task t_92048e79 owns both. A paste of three blocks mid-line lowers as splits and keeps a teammate's delete, `woA` / `B` / `Cr` where base gives `Crd` (`panel-d1/probes/lead/opus-race3-build-a1.log`). On a line a split moved children to, a link inserted into the tail or lines pasted at its start still rewrite the line, so a teammate's letter typed in that line at that moment is lost, where today the line shows the link twice (`review-3c/probe-fallbacks-esm-build-3.log`). These copies are now the only way a rejected deletion comes back, so the authored rule that holds it again once the copy goes lost its two-client cases with this plan; that task checks whether the rule still has a caller. owner: a suggested task that waits on this plan. stop: that task's plan.
- A room built by hand, where a line points at a placeholder whose target still shows, shows that text twice, at base too. No writer is known to make it (`join-collab.test.ts`'s "removed placeholder" case now checks only that the import matches a fresh read). owner: the collaboration subject. stop: a user report.
- A teammate's undo of a merge that crossed a leaf-edge Enter, with no delete, keeps every letter on both peers but drops the Enter. The editor joins the two texts that meet into one, and that join comes back as a whole-line import (`probes/merge-undo-split-d4-a2.log`; base leaves the peers on different documents, `probes/merge-undo-split-base-a1.log`). owner: the collaboration subject. stop: a user report.
- Rejecting an Enter inside a pending link whose url a teammate changed offline leaves two links side by side, the left with the new url and the right with the old. A split copies the link's attributes into the right half when it is made, so the url write reaches only the left half, as finding 8 shows (`delegate-5/f9-probe-build-a1.log`). Base shows the link twice. owner: the collaboration subject. stop: a user report.
- Unwrapping a link loses a teammate's letter typed inside it at the same moment, today too (`review-3c/probe-plain-esm-next.log`). owner: the collaboration subject. stop: a user report.
- Two splits of one line at different points can show the new lines swapped when the later cut's writer has the lower client id (C16 with the ids reversed). owner: the collaboration subject. stop: a report, or a placement rule for moves.
- A heal racing a removal of the first line leaves the second half's letters in no line. Today's join loses them the same way (the judge's read, not probed). owner: the collaboration subject. stop: a user report.
- A peer that never saw a split and removes its block leaves the second line empty, which beats today's copied half. owner: the collaboration subject. stop: a user report.
- A batch that moves a line and splits it, such as a move and an Enter that a teammate receives together, imports as a replacement. The documents still match, but the teammate's undo of their own letter typed in that line does nothing. Delivered one at a time, the undo works (diff round 2, Astra's finding 5, `round2/lead/astra5-head-a1.log`; base drops the undo the same way, `round2/lead/astra5-base-a1.log`). owner: the collaboration subject. stop: an import that reads a batch's moves before its splits.
- Step 2.7's typing speed gate stays open. On the final bytes no run misses a budget conclusively, and no single run passes all three lines. The next probe is one run of the repairs run's `bench27/family-key-warm7-config.json` through `paired-timing.mjs` that passes every line, and a conclusive miss sends the layout back to `architect`. owner: the collaboration subject. stop: that run.
- A source element whose every child moved out by placeholder stays in the room as a hidden element, so the room keeps one hidden element per such Enter and never removes it (a diff-round-1 nit, not measured). owner: the collaboration subject. stop: a Yjs room compaction task.

## Close

Reversals and deviations come first.

- The removal gate changed three times in this plan's diff rounds. Round 1 deleted a removed cut view's letters, round 2 deleted them when the write ended, and round 3 reverted both, because each deleted letters a line still showed. The [repairs plan](2026-10-25-yjs-split-repairs.md) then deleted them through a check at the end of each write scope, which ships in this landing.
- Step 3.1's proof narrowed to a mid-word Enter. A teammate's undo of a merge that crossed a leaf-edge Enter, with no delete, keeps every letter but drops the Enter. Finding 9's accept-then-reject proof narrowed from one link to one line whose letters show once. Open work keeps both.
- Step 2.7's probe changed after its first run on the final bytes. A warm-up pass runs every cohort once untimed, and the stress plant moved from 2.4 to 2.9. A five-trial variant raised the same-code noise and was dropped. The budgets never moved, and the gate stays open.
- The fold added to the second Document shape pair the empty text that next's fill stores at the start of the new line before a link, as a dump of the final bytes shows (repairs run, `fold/shape-a1-a1.log`). The alternative on keeping a cut chain's texts in the first line now names the cut marker as its replacement.

What landed. One commit lands this plan and the repairs plan on next through `land.mjs`. A split travels as a cut marker inside the line's Yjs text and an empty view text in the new line, and whole children after it move by placeholder while the originals stay hidden. The binding finds a split in the commit's own tokens, and the value finders are gone. Each text child shows one piece, point mapping counts letters per piece, and a mark that starts a piece anchors on its cut. Every removal goes through one private gate, and a node shows at one placeholder only. The import reads splits and unsplits back from the batch, a join of a cut's halves deletes the cut, core's join of two inline lines takes the one empty text between them, and a remote import maps the local text selection through its change. Room metadata moves to format 5, and the unreleased platejs changeset says so. The join law in `docs/vision/plite.md` and the binding section of the Yjs docs page describe the split.

Proof, each from its decision row's scope. Rows marked repairs are in the repairs plan's log.

- On next at 05b58b8c9a, 15 of 17 two-peer split races missed their expected tree, and the plate#5278 cases threw in the commit listener (row 3). Both plate#5278 browser cases failed at base with the reported divergence (row 20).
- Phase 1's 10 new cases failed before and 35 passed after (row 21). 35 of phase 2's 51 cases failed on the old code and all 51 passed after (row 27). Step 2.6's 11 locality cases failed before and passed after (row 32). The fifteen collab cases phases 1 and 2 broke pass, seven through code fixes and seven whose new expectation base fails (rows 58 and 59).
- On the final bytes 5191bbd170, the race probe gives C1 wo / rXd in both orders, and C1, C2, C5 to C8 and C17 pass where next fails them. Its 12 other failures show the expected letters and marks in another key order, as on next (repairs row 122).
- On the final bytes the Yjs, core, authored and history partitions and the two collab files fail nothing, with 825, 3775, 1217, 207 and 384 tests passing. race-table6 passes 1544 of 1544 and the cursor table 8 of 8 (repairs rows 121 and 130).
- The collaboration demo spec's four cases pass five warm runs in Chromium and five in WebKit through the managed runner (repairs row 127). The hand drive covers the collaboration demo, the Yjs collaboration example, the inlines example and the Yjs docs page at desktop width in light (repairs row 128).
- One Enter inside a text stores one cut marker and its view text and deletes nothing, where next deletes 6, 21, 6 and 24 items in the four shapes measured (repairs row 123).
- The four docs checks exit 0 (repairs row 129), changeset status lists platejs at major (row 66), and type-aware oxlint and the forced typecheck pass on the final bytes (repairs row 121).
- Step 2.7 is inconclusive. No run misses a budget conclusively, normal passes at 0.940, large at 1.102 and 1.078 and stress at 1.446 and 1.583, and no single run passes all three lines (repairs rows 125 and 126).

Limits. Bun and Playwright's Chromium and WebKit ran the proof, with no Firefox, real provider or device. The typing speed gate is open. Rooms an older build saved refuse to open, and moving them is the app's job. A link inserted mid-text still rewrites the whole text. Two splits of one line at different points can swap the new lines.

Next's three Enter items. The [empty-text plan](2026-10-24-collaboration-empty-text-runs.md) handed this landing three items, and each now has its result:

- Row 21's lost letter, with Enter before a link or before a teammate's later edit. race-table6 passes 1544 of 1544 on the final bytes, row 21 included, where next fails 5, each Ed's letter in row 21 (repairs rows 63 and 121). C6 to C8, splits before links while a peer types before, after or inside them, pass where next fails them (repairs row 122).
- A letter typed inside the text a cut splits. C1 gives wo / rXd on the final bytes in both orders, where next puts X in the first line (repairs row 122).
- The extra text per cut. Each Enter stores one cut marker and one view text and deletes nothing (repairs row 123).

The subject's trimmed-room caret item also reached its stop, because format 5 refuses every room an older build trimmed.

The run had one ask, suggested task t_649d2131's "Decide how a Yjs paragraph split keeps its second half's letters", run as Verdict, Plan and Build under Autopilot with one landing for both plans. It is done, with the typing speed gate left open as step 2.7 allows.

Open work moved to the collaboration subject's Open work, 11 items from this plan, each with its owner and stop. The three parts this plan's diff round 3 left to the repairs plan closed with its build.

The review read `packages/plitejs/src/yjs/core/canonical-split.ts`, `packages/plitejs/src/yjs/core/text-runs.ts`, `packages/plitejs/src/yjs/core/document.ts`, `packages/plitejs/src/yjs/core/event-change-bridge.ts`, `packages/plitejs/src/yjs/core/change-bridge.ts`, `packages/plitejs/src/yjs/core/selection.ts`, `packages/plitejs/src/yjs/core/controller.ts`, `packages/plitejs/src/yjs/core/joins.ts`, `packages/plitejs/test/yjs/split-merge-contract.spec.ts`, `packages/plitejs/test/yjs/split-node-contract.spec.ts`, `packages/platejs/src/utils/plugins/ExitBreakPlugin.ts`, `apps/www/src/app/(app)/examples/plite/_examples/yjs-collaboration.tsx`, `docs/plans/2026-10-17-yjs-block-text.md`, `docs/plans/2026-10-18-join-travels-as-join.md`, `docs/plans/topics/collaboration.md`, `docs/vision/plite.md` and `docs/vision/common.md`.
