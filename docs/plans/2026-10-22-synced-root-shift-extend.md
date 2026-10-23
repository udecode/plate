---
review_scopes: [runtime]
verdict: pursue
review_basis: [2026-10-22-runtime-dom-view-lookups]
work_kind: implementation
review_commit: 254cc45304775a0b41191127c0c1e33421a955df
review_inputs: [packages/plitejs/src/react/view-selection.ts, packages/plitejs/src/core/view-carets.ts, packages/plitejs/src/react/editable/view-caret-restore.ts, packages/plitejs/src/react/editable/content-root-boundaries.ts, packages/plitejs/src/react/editable/content-root-navigation.ts, packages/plitejs/src/react/editable/selection-controller.ts, packages/plitejs/src/react/editable/keyboard-input-strategy.ts, packages/plitejs/src/react/editable/root-interaction-controller.ts, packages/plitejs/test/react/view-carets.test.tsx, apps/plite/tests/plite-browser/donor/examples/synced-blocks.test.ts, docs/plans/2026-10-20-view-caret-placement.md, docs/plans/2026-10-21-view-selection-import.md, docs/plans/2026-05-27-synced-blocks-sibling-selection.md, docs/plans/topics/selection.md, 'apps/www/src/app/(app)/examples/plite/plite-example-client.tsx']
---

# How a selection across content roots survives a root taking focus

Status: partial: both slices landed; the fold into the runtime subject waits on the drag task t_95972f5a or your word "accept drag"
Playbook: plan

**Pursue.** On `/examples/plite/synced-blocks`, Shift+ArrowDown from inside a synced root into the outer editor snaps the selection back to the outer editor's own caret. Two rules collide. The [synced blocks plan](2026-05-27-synced-blocks-sibling-selection.md) keeps a selection across content roots alive through Plite's own focus repair, and the [view caret plan](2026-10-20-view-caret-placement.md) has every root that takes focus, a caret key or typing restore its own caret and clear that selection, unless it already holds the caret. The outer root never holds the caret while such a selection runs, because the live caret sits at the selection's anchor in the synced root. This task's first fix stamped the selection with a guessed placement number and kept it only for the root that wrote it. Three diff panels found five critical defects in those two mechanisms, each after its one replacement, so the fix becomes this redesign. The strongest reason for Pursue is that one owner can decide when the selection is current from what the editor committed, and which roots keep it from what it covers, which deletes the guess, the writer root and the per-writer special cases. The execution playbook is Build, run as the Bug fix playbook's redesign run.

## Brief

### What will change?

Shift+ArrowDown out of a synced block now keeps selecting into the next outer paragraph instead of jumping back. Keys, focus and clicks now agree on when that selection still counts, and Ctrl+Home and Ctrl+End work from blocks inside blocks.

### What could go wrong?

As before, a mouse drag shows an old selection after another caret takes over, and wipes that caret. Blocks nested two deep keep three gaps, each with a task, and the speed check couldn't settle on a busy machine.

## Teach

A synced block is a separate editing area inside the page's editor. A selection that runs from inside it into the outer text cannot be stored as one normal selection. So Plite keeps the live caret at the selection's start and draws the rest from a side record.

Each editing area also keeps its own caret. When an area gets focus, a caret key or typing, it brings its own caret back and wipes the side record, unless it already holds the caret. The outer editor never holds it during such a selection, so Plite's own focus repair wipes the selection.

The plan gives the side record one writer and one reader. A selection counts as current until any newer caret placement, read from what the editor committed instead of guessed. An area the selection covers keeps it when it takes focus. Three review rounds broke the guessed version.

## Demo

1. Open `/examples/plite/synced-blocks`. Click at the end of p1, press End, then ArrowDown, so the caret lands in the first synced block. Press Shift+ArrowDown twice. The first press selects to the start of "Editing any copy"; the second extends past the synced block into "Between synced copies." instead of snapping back to p1. Shift+ArrowUp then pulls the selection back inside the synced block. ![before](artifacts/2026-10-22-synced-root-shift-extend/demo/before.png) ![after](artifacts/2026-10-22-synced-root-shift-extend/demo/after.jpg)

## Public API

No public call changes. The selection across content roots is private to `plitejs/react`, and so is caret activation. The pair below is the activation's decision, the one place the two rules meet.

```ts before
// packages/plitejs/src/react/editable/view-caret-restore.ts at 254cc45304
if (at !== 'end' && holdsCaret(view)) {
  wrote = clampHeldCaret(view);
} else {
  const target =
    at === 'end' ? documentEnd(view) : activationTarget(view, fallback);

  wrote = !!target;
  if (target) {
    receipt = nextMintedGeneration(view);
    writePliteViewSelection(view, null);
    setSelectionAsView(view, visibleTarget(view, target));
  }
}
```

```ts after
// packages/plitejs/src/react/editable/view-caret-restore.ts
const shown = readPliteViewSelection(view);
const keeps = !!shown && !press && at !== 'end' && coversRoot(view, shown);
let receipt = generation;
let wrote: boolean;

if (shown && !keeps) {
  writePliteViewSelection(view, null);
  if (placedSince(view, generation)) return false;
}
if (at !== 'end' && holdsCaret(view)) {
  wrote = clampHeldCaret(view);
} else if (keeps) {
  wrote = false;
} else {
  const target =
    at === 'end' ? documentEnd(view) : activationTarget(view, fallback);

  wrote = !!target;
  if (target) {
    receipt = nextMintedGeneration(view);
    setSelectionAsView(view, visibleTarget(view, target));
  }
}
```

The writer that shows the selection takes its anchor placement, so the stamp is the placement the editor committed, never a guess.

```ts before
// packages/plitejs/src/react/editable/content-root-navigation.ts at 254cc45304
writePliteViewSelection(editor, projectedSelection);
collapseModelSelectionForProjectedSelection(editor, selection);
```

```ts after
// packages/plitejs/src/react/editable/content-root-navigation.ts
const shown =
  (placesNothing && readPliteViewSelection(editor) === projectedSelection) ||
  writePliteViewSelection(editor, projectedSelection, {
    place: () =>
      collapseModelSelectionForProjectedSelection(editor, selection),
  });
```

## Main changes

- `react/view-selection.ts` stores each selection across content roots with the placement generation it shows at. Every write that shows a selection names its anchor placement, or the current placement when the writer cannot place, and the types refuse one that names neither. `{ place }` runs the placement and stamps the first generation it commits. `{ placedAt }` passes a generation the writer read earlier. The writer refuses a write or a clear whose generation is older than the current placement before it touches the store, so a stale request never deletes a newer selection. `readPliteViewSelection` returns the selection only while that generation is still the editor's newest, so it stays pure for render-time snapshots. A listener on committed placements drops a stale record at once. It tells subscribers in a microtask, after core finishes publishing, so a subscriber that edits sees the finished commit and its edit survives. The microtask is a raw `queueMicrotask`, which the kernel authority audit allows in this file. A show tells subscribers at once, and an end tells them one microtask later. A `place` that throws drops its record and tells subscribers once when it replaced a shown one. The writer's return value is read after its own notification, so a subscriber's placement inside it ends the write. This deletes the first fix's receipts, `showPliteViewSelection`, its writer root, and the predicted generation in the native import (G4).
- `core/view-carets.ts` gains `subscribeCommittedPlacement` and `capturePlacement`, private to the package. `setCommittedCarets` calls the listeners whenever the committed generation changes, which a placement-only commit reaches too. `capturePlacement(editor, fn)` returns the first generation `fn` committed, so a listener's newer placement inside `fn` never passes for the writer's.
- The writers that place before they write, the caret engine's two, select-all and history replay, pass `placedAt` from `capturePlacement`. The browser test handle places nothing and passes the current placement. History replay reads its generation across its await, so a placement that lands while the replay settles is newer than the replayed range. The caret engine clears the DOM selection only when its write shows, and each of its deferred clears runs only while that record still shows. The projected drag places its anchor through `place`. A drag that a newer placement overtakes behaves as at 254cc45304, as Defaults says. It shows its selection again at its next event, and each of its writes clears the DOM selection, the newer caret's included.
- `activateViewCaret` keeps a current record for each root the record reaches, meaning a root that holds part of it or a host that nests such a root. Activation checks each start of the selection by its own root first, then climbs from that start's own host, and follows a root's host only when that root has exactly one. So a shared root shown in two hosts reaches only the hosts the selection runs through, and a root reached through one host never hides another. Every other activation drops the record, one with nothing to restore included. A press on a root's chrome passes `press` from `focusRoot` and always takes the root's own caret. `findContentRootOwners` counts each scan as core work, `contentRootOwnerScans`, so a test counts the owner reads activation makes.
- `applyContentRootViewSelection` marks each key event it answers. An ancestor Editable that receives the same event reports it handled and repairs nothing: no focus move, no model-selection switch and no second write.
- When a newer placement inside the write ends the selection a key shows, the key stays handled and its own Editable repairs no focus, so focus stays where the newer placement put it.
- A Shift+Arrow that finds nowhere to go shows the record again through the writer, so its collapse is stamped and the selection stays. While the record is current and the model selection already sits at its anchor, the key writes nothing, so a held key tells subscribers nothing.
- Every movement target of a selection across roots passes through the view's boundary graph. Two paths build the selection from the model selection's own focus instead of a movement target: the vertical branch that finds no target, and the check that decides whether the model selection owns a vertical Shift+Arrow. A target that leaves a root without naming its owner takes that root's owner. A point the view still does not hold, such as an owner's hidden placeholder, falls through to the graph's own vertical movement, so Shift+Arrow out of a root nested two deep extends instead of throwing.
- An outer Editable that takes focus while a nested Editable's DOM selection is showing writes its own DOM selection when it holds the caret and no selection across roots shows, so typing goes where its caret is.
- Ctrl+Home, Ctrl+End and their Shift forms walk down the document's first or last edge from the top of the owner chain until they reach a text block, so a root nested two deep reaches the document end instead of throwing. The top is the one root that every host chain of the start root reaches, and main when the chains reach more than one. Where a root has an active owner, the climb follows only that owner, so the copy of a root inside a detached note walks note's edge. The walk visits one block per level. The view's boundary graph starts from the same top, so Ctrl+Shift+End in note's copy of a root that main also hosts selects to note's end instead of throwing.
- The first fix's guard stays: a nested Editable's beforeinput activates only that Editable.

## What other editors do

This plan read no other editor. The runtime subject's 2026-10-17 and 2026-10-22 reads of ProseMirror (`prosemirror-view` `ca4c78e`), Lexical (`dd5c41b13`), Slate (`945a484df`), Tiptap (`91c51be53`) and CodeMirror (`codemirror-view` `fbff59b`), none of them run, show that none keeps one selection across an outer and a nested content tree. Plite's projected view selection has no counterpart to copy.

| Editor | Can one selection cover the outer tree and a nested tree |
| --- | --- |
| ProseMirror | No; a nested view such as the footnote example keeps its own state and selection |
| Lexical | No; a nested editor keeps its own selection |
| Slate | No; one tree |
| Tiptap | No; one ProseMirror document |
| CodeMirror | No; each `EditorView` keeps its own state |
| Plite | Yes, through the private projected view selection in `react/view-selection.ts` |

## Layer and owner

| Delta | Responsibility | Decision |
| --- | --- | --- |
| added | Selection across content roots | Plite, `plitejs/react` (`react/view-selection.ts`). One record per presentation holds the selection and the placement it shows at. One writer runs the anchor placement itself and stamps the record with the placement the editor committed. One reader returns it only while no newer placement exists, so every writer and reader shares one freshness rule. Caret activation keeps it for each root it covers, the hosts that nest those roots included, and a press on a root's chrome always restores that root's caret. |
| added | Committed placements | Plite core (`core/view-carets.ts`). The one place that installs committed carets tells package-private listeners each new placement generation, so React reads freshness from core instead of guessing it. |
| added | A key several nested Editables receive | Plite, `plitejs/react` (`content-root-navigation.ts`). The first Editable to answer the key with a selection across content roots answers it for every ancestor. |

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Shift+ArrowDown and Shift+ArrowUp across a synced root's edge | The selection extends into the owner's next block and back | Chromium, Firefox and WebKit, `synced-blocks.test.ts`, five warm runs in Chromium |
| Typing in a synced root entered with ArrowDown | Text lands in the synced root and the caret stays there | Chromium, Firefox and WebKit, `synced-blocks.test.ts` |
| Focus that Plite's own repair moves to the outer Editable | Keeps a current selection that covers the outer root | jsdom, `view-carets.test.tsx`; Chromium through B1 |
| Typing over a selection a newer placement replaced | Types at the newer caret, not over the old range, and focus stays in the editor where the newer placement put it | jsdom, `view-carets.test.tsx` |
| Ctrl+Home and Ctrl+End, plain and Shift, from a root nested two deep, from a root's copy inside a detached note or at a document edge that is a content root | Lands in the edge block of the document the pressed copy belongs to, without an error | jsdom, `view-carets.test.tsx` |
| Shift+Arrow out of a root nested two deep | Extends into the host's next block and back, without an error. Past a nested root that ends its host it extends nothing (U22b, owned by the fix host end suggested task) | jsdom, `view-carets.test.tsx`; Chromium through B5 |

## Expected results

Each row is a case shape the redesign must handle. The check is `view-carets.test.tsx`, its describe 'the document edge across content roots' for U18 and U26 to U29 and its describe 'a selection across content roots when a root activates' for the other U rows and the S rows, `caret-engine-contract.test.ts` for U25b and U25d, and `synced-blocks.test.ts` for the B rows. U25c, U25e and U25f have no test in the build, and their cases are `r6-u25c-u25e-cases.tsx` and `r6-u25f-case.tsx` in the run directory, for the drag task. Every row is run on 254cc45304 for the baseline. This area has no generated check, so no seed search runs. Rows a run adds from a finding take 254cc45304's result, as the Bug fix playbook's step 5 says.

| # | Start | Operations | Result | Rank | At 254cc45304 |
| --- | --- | --- | --- | --- | --- |
| B1 | `/examples/plite/synced-blocks`, caret at the end of p1 | ArrowDown into the first shared body, Shift+ArrowDown twice, Shift+ArrowUp | The first press selects through "statement E", the second reaches the owner block that starts "Betwee", the third returns into the synced root | P1 | fails at the second press |
| B2 | The same route | ArrowDown into the first shared body, type `xy` | `xy` lands in the synced root and the model caret stays there | P1 | fails, the caret goes back to the outer editor |
| B3 | B1's start in Firefox | B1's first press, five warm runs | The first press selects through "statement E" every run | P2 | 0 failures in 11 runs |
| B4 | The synced-blocks, editable-voids, schema-reconfiguration and view-focus-chain specs | Every case in Chromium, Firefox and WebKit | Every case passes, except Firefox's `schema-reconfiguration.test.ts:151` ('places the caret in the projected root when clicking beside the card label'), which fails at base, the Shift+click cases at `synced-blocks.test.ts:2359`, which lose their selection at base under forced key timing, and B5, which runs only in Chromium | P1 | as stated |
| B5 | B1's route with a synced block nested inside the body of the separate synced block, which the page shows once, and entered with ArrowDown from main | Shift+ArrowDown inside the inner body, then past its last line | The selection extends inside the inner body, then into the outer body's next block | P2 | fails, the crossing press shows no selection, puts the caret back at the separate body's start and throws "Cannot resolve view-boundary point". In Firefox the ArrowDown entry never focuses the inner body, and in WebKit it focuses it with no model selection, at 254cc45304 and on slice 2, so only Chromium reaches the crossing. The spec skips B5 in Firefox and WebKit, since plite CI runs both, and the B5 entry suggested task removes that skip |
| B6 | A synced block nested inside a shared body the page shows twice | Shift+ArrowDown past the inner body's last line | The selection extends into the outer body's next block without an error | P2 | fails, building the view's graph throws "Duplicate view-boundary node key" into the window's error handler, in jsdom and in Chromium at 254cc45304 and on slice 2 |
| U1 | main, body nested in it and below; main's caret at 2, body's selection 1 to 4 | Ctrl+Shift+End in body, then focus main | The selection to the end stays and main places no caret | P1 | fails, main restores its caret at 2 |
| U2 | U1 with a select handler that builds a transaction, discards it and declines | U1's operations | As U1 | P1 | fails, as U1 |
| U3 | main, body, deep nested in body; main at 2, body at 2, deep from line 1 to line 2 | Ctrl+Shift+End in deep | The selection reaches main's last block, main places no caret and no error is thrown | P1 | fails, no selection shows and the key throws "Cannot resolve view-boundary point" |
| U4 | U1's start with a section wrapper that stops keydown bubbling; body's caret at 1 | Ctrl+Shift+End in body, then Shift+ArrowLeft in body | The selection stays after both keys and main places no caret | P1 | fails, the second key drops it |
| U5 | U1's start and a selection subscriber that places body's caret at 5 once the selection shows | Ctrl+Shift+End in body, focus main, type Q | main reads "abQove", body "body text here" | P1 | passes |
| U6 | main at 2, body at 1 | Ctrl+Shift+End in body, body places at 5, focus main, type Q | The selection shows, then the newer placement wins, so Q lands at main's own caret | P1 | fails, the selection never shows |
| U7 | note at 3, main at 2, body at 1 | Ctrl+Shift+End in body, press note's chrome, type Q | The selection shows, then note restores its caret at 3 and Q lands there | P1 | fails, the selection never shows |
| U8 | U7's start | Ctrl+Shift+End in body, focus note's editor, type Q | The selection shows, then note restores its caret at 3 | P1 | fails, the selection never shows |
| U9 | main at 2, body 1 to 4, a commit listener that places body at 5 during the selection's anchor placement | Ctrl+Shift+End in body, focus main, type Q | main restores its caret at 2 and Q lands there | P1 | passes |
| U10 | main at 2, body at 1 | Ctrl+Shift+End in body, press main's chrome, type Q | The selection shows, then main restores its caret at 2 and Q lands there | P1 | fails, the selection never shows |
| U11 | U3's start with deep's selection on its last line | Shift+ArrowDown in deep, focus main | The selection the key shows stays and main places no caret; jsdom moves no selection by line, so the crossing itself is B5's | P1 | fails, no selection shows and main restores its caret at 2 |
| U12 | main at 1 | Ctrl+Shift+End from main's caret, press main's chrome, type Q | The press drops the selection and Q lands at main's caret | P2 | fails, the press keeps the selection and Q is dropped |
| U14 | main at 2, body at 1 | Ctrl+Shift+End in body, body places at 5, type Q in body | The selection shows, then Q lands at body's caret at 5, not over the old range | P2 | fails, the selection never shows |
| U15 | main at 2, a native selection from body into main, as a mouse drag leaves it | focus main | The selection stays and main places no caret | P2 | fails, main restores its caret at 2 |
| U16 | Two presentations, P shows a selection across roots | The other presentation places a caret, then P's main root takes focus, type Q | The selection shows, then P's main restores its own caret and Q lands there, as the import plan's law says | P2 | fails, the selection never shows |
| U17 | The plitejs React suite and `view-carets.test.tsx` | Run both | Every case passes | P1 | passes |
| U18 | U3's start | Ctrl+End in deep | main's caret lands at the end of its last block and deep keeps none | P1 | fails, the key places no caret |
| U5b | U1's start and a selection subscriber that places body's caret at 5 once the selection shows | Ctrl+Shift+End in body, type Q into the focused editor | Q lands at body's caret: body reads "body Qtext here" and main "above" | P1 | fails, main's repair focus restores main's caret and Q lands there |
| U9b | U5b with a commit listener in place of the subscriber | U5b's operations | As U5b | P1 | fails, as U5b |
| U19 | main at 1 with a range from 1 to 4 shown, and a subscriber that inserts X once the range ends | Place main's caret at 2 | The subscriber sees the finished placement and its insert survives: main reads "abXove" | P1 | fails, nothing ends the range, so the subscriber never inserts |
| U20 | main at 1 with a range from 1 to 4 shown | Type Q, undo while a placement at the same point lands, type Q | The undo restores no range and Q lands at the caret: "aQbove" | P1 | fails, the undo restores the range and Q replaces it again: "aQe" |
| U21 | main hosts roots A and B, each hosting the same shared root; B's caret at 3 | Ctrl+Shift+Home in A's copy of the shared root, focus B, type Q | B restores its caret and Q lands there: "b tQext" | P1 | passes, base never keeps the selection |
| U22 | U3's start with a block after deep in body | Shift+ArrowRight past deep's end | The selection extends into body's next block without an error | P2 | fails with "Cannot resolve view-boundary point", as on the prototype |
| U23 | main at 1 and focused, a range from 1 to 4 shown | Place main's caret at 1 again, type Q | The placement ends the range and Q lands at the caret: "aQbove" | P1 | fails, the range stays and Q is dropped |
| U24 | A range shown and a selection subscriber | Write a replacement whose placement throws | The reader returns nothing and the subscriber hears once | P2 | fails, base never runs the placement, so the replacement shows |
| U25 | main at 2 and a selection subscriber that places body's caret at 5 once a selection shows | A native selection from body into main, type Q | Q lands at body's caret: "body Qtext here" | P2 | fails, Q is dropped |
| U26 | A root nested in the note root, which main does not host | Ctrl+End in the nested root | note's caret lands at the end of its last block | P1 | passes |
| U27 | main ends with a content root | Ctrl+End in main | The caret lands at the end of that root's last block | P1 | fails, main's caret lands on the owner's hidden placeholder at 1.0.0 |
| U28 | U27's start | Ctrl+Shift+End in main | The selection reaches the end of that root's last block | P1 | fails, the key throws "Cannot resolve view-boundary point" |
| U29 | main starts with a content root | Ctrl+Home in main | The caret lands at the start of that root's first block | P1 | fails, main's caret lands on the owner's hidden placeholder |
| U20b | main at 1, then focused with a range from 1 to 4 shown | A write that names the placement from before the range | The write is refused and the range stays shown | P1 | does not run, the writer at 254cc45304 takes no placement |
| U20c | U20b's start | A clear that names the placement from before the range | The clear is refused and the range stays shown | P1 | does not run, as U20b |
| U21b | U21's start with a selection from A's copy of the shared root into B's copy | Focus B | The selection stays and B places no caret | P1 | fails, B restores its caret at 1.0.3 |
| U22b | U3's start with deep as body's last block | Shift+ArrowRight past deep's end | The selection extends into main's next block without an error | P2 | fails, the selection extends into main's next block and a listener throws "Cannot resolve view-boundary point"; slice 2 extends nothing and throws nothing |
| U24b | A range shown and a selection subscriber | Write a replacement whose placement places twice and then throws | The reader returns nothing and the subscriber hears once | P2 | does not run, as U20b |
| U25b | 1,000 paragraphs in a virtualized view, caret at 0.0.1, and a commit listener that places at 2.0.3 and puts the native caret there | Shift+ArrowDown through the caret engine | The model and native carets stay at the listener's placement and no range shows | P1 | fails, the stale range shows and the native caret is cleared |
| U26b | U26's start with the nested root hosted twice inside note | Ctrl+End in its first copy | note's caret lands at the end of its last block | P1 | passes |
| U30 | main at 2 and focused, a native selection from "above" into "below" | Shift+ArrowRight, and in a second case Shift+ArrowDown, with nothing left to select | The selection stays | P1 | passes |
| U31one | body nested one deep, main at 2, body at 1 | Ctrl+Shift+End in body, then Shift+ArrowUp | The selection extends back into body's last block without an error | P1 | fails, no selection shows and no key throws |
| U31 | U3's start | Ctrl+Shift+End in deep, Shift+ArrowUp, then Shift+ArrowDown | The selection extends back into deep's last block and out again to main's last block, without an error | P1 | fails, Ctrl+Shift+End throws "Cannot resolve view-boundary point" |
| U31m | U3's start with a native selection from deep into "below" | Shift+ArrowUp in deep | The selection extends back into deep's last block without an error | P1 | throws nothing; the control checked no extent |
| U5c | U5b's start, with a subscriber that places note's caret at 5 and focuses note once the selection shows | Ctrl+Shift+End in body, type Q where focus is | Focus stays in note and note reads "note Qtext" | P1 | fails, main's repair takes focus |
| U9c | U5c with a commit listener that places and focuses note during the anchor placement | U5c's operations | As U5c | P1 | fails, as U5c |
| U5e | main at 2 and focused, a native selection from "above" into "below", and a subscriber that places and focuses note once a selection shows | A dead-end Shift+ArrowRight, type Q where focus is | As U5c | P1 | fails, the dead end shows nothing, so the subscriber never runs |
| U5d | U1's start after Ctrl+Shift+End in body, with body focused | A dead-end Shift+ArrowRight in body | No subscriber hears of it and the selection stays | P2 | fails, body's focus drops the selection |
| U25c | main at 2, and a subscriber that places and focuses note, or another presentation, once a selection shows | A mouse drag from body into main, then mouseup | The drag stays ended through mouseup, no selection shows and the newer caret keeps its native selection | P2 | fails, mouseup shows the selection again and clears the newer native caret; slice 2 leaves it so, and the drag task holds its cases |
| U25d | U25b's start without the commit listener. A newer native caret lands before the engine's first deferred clear, and in a second case between its two clears | Shift+ArrowDown through the caret engine | The newer native caret survives and no range shows | P1 | fails, the stale range shows and the native caret is cleared |
| U12b | U12's start, with a subscriber that places and focuses note at 5 once the selection ends | Ctrl+Shift+End from main's caret, press main's chrome with mousedown only, type Q where focus is | Focus stays in note, where Q lands, so note reads "note Qtext" and main "above" | P2 | fails, the press keeps the selection, so the subscriber never runs, focus stays in main and Q is dropped |
| U25e | U25c's start, with the newer placement made between mousemove and mouseup instead of while the selection shows | U25c's operations | As U25c | P2 | fails, mouseup shows the selection again, and with note as the winner it clears note's native caret; slice 2 leaves it so, as U25c |
| U25f | main at 2, and a subscriber that writes a replacement selection once the drag's selection shows | A mouse drag from body into main, then mouseup | The replacement still shows after mouseup | P2 | fails, mouseup writes the drag's selection over the replacement, at 254cc45304 and on slice 2 |
| U25h | U25g's start with a peer presentation, a drag from "above" at 2 into "below", and peer placed and focused at 2 | Move back to "above" at 3 while a subscriber repeats peer's placement, then mouseup | Peer's native caret stays at 2 | P2 | fails, the drag clears the DOM selection on that move, at 254cc45304 and on slice 2 |
| U25g | main at 2 and a native selection over "below" that no selectionchange reported | Press "above", drag to "below", back over "above" and to "below" again, then mouseup | The selection shows from "above" at 2 to "below" at 2 | P1 | passes; the drag check that the diff panel's round 2 reviewed failed it, because the coordinate path's own clear on the pass back over the anchor stopped the drag |
| U26c | A shared root hosted by main and by the detached note root, with the shared root's caret at 10 | Ctrl+End in note's copy of the shared root, type Q | Q lands at the end of note's last block, and main's last block stays "main end" | P1 | passes; slice 1 before the third plan panel sent the caret to main's end |
| U26d | U26c's start | Ctrl+Shift+End in note's copy of the shared root | The selection reaches the end of note's last block without an error | P1 | fails, the key throws "Cannot resolve view-boundary point" |
| S1 | No selection across roots shown | A caret key in body, then focus main | Five placements, as at 254cc45304 | P1 | five placements |
| S1b | No selection across roots shown | Focus main | Activation reads no content root owners | P1 | does not run, 254cc45304 counts no owner reads |
| S2 | A selection from body to the document end, once with no extra roots and once with ten more roots it crosses | Focus main | The selection stays, and the owner reads with ten roots match those with none | P1 | does not run, as S1b |

At 254cc45304 the selection never shows in U6 to U8, U10, U14 and U16, because main's focus repair drops it before the test's next step, so those rows pass their later steps only because nothing was selected. The first fix, the worktree before this redesign, fails U2, U3, U4, U5, U12, U14 and U15 and passes the rest. In U12, U14 and U23 base drops Q. The cause is not traced. It may be the ambiguous branch of typing over the record, which swallows the key (`mutation-controller.ts:265-268`), or the test fixture, which mounts the body root twice, once through `useRootEditor` and once through its slot. U18 comes from the two-deep crash: the same one-level document boundary that throws in U3 makes Ctrl+End from deep place no caret. U27 to U29 show the same boundary is wrong one level deep: base puts the caret on the owner element's hidden placeholder. U26 guards the boundary walk's start root: a walk that always started from main sent the caret to main's end. U21's fixture failed on a coverage map that kept one host per root, which the panel caught, and U25 failed on a writer that returned before its own notification ended the record. Slice 2, the prototype ported onto slice 1 with the second plan panel's fixes in a scratch worktree on 254cc45304, passes every P1 row and U22, and fails U22b. As the second panel reviewed them, the prototype failed U20b, U20c, U21b, U24b, U25b, U30, U31, U31one and U31m, and slice 1 failed U26b. U31one and U31m throw nothing at 254cc45304, and the reviewed prototype made them throw, so the redesign widened the two-deep error until its movement targets passed through the view's graph. S1b and S2 count owner reads through `contentRootOwnerScans`. An owner read at the top of activation fails S1b, and a coverage map that reads the owners for every root the selection crosses fails S2. As the third panel reviewed them, slice 1 failed U26c and slice 2 failed U5c, U9c, U5e, U5d and U25c. U25d passed there and fails once the deferred clears lose their freshness check. Opus asked for Shift+ArrowDown past the end of a root that only note hosts, which passes at 254cc45304 in jsdom, so U26d presses Ctrl+Shift+End in a root main also hosts instead. As the diff panel's round 1 reviewed it, slice 2 failed U12b and U25e, and as its round 2 reviewed it, slice 2 failed U25f and U25g. U25g passes at 254cc45304 and after the drag's revert, and U25c, U25e and U25f fail the same way at both. U12b, U25c and U25e are P2 because only a test subscriber places a caret while a selection shows or ends. Rows U5b to U29 come from the first plan panel, rows U20b to U31m, U5c, S1b and S2 from the second, rows B6, U9c, U5d, U5e, U25c, U25d, U26c and U26d from the third, rows U12b and U25e from the diff panel's round 1, U25f and U25g from its round 2, and U25h from its round 3.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Another view's placement | Another view's caret ends this view's selection across blocks, as the import plan decided (look) | Each view keeps its own selection across blocks | per view | small |
| Focus into an outer editor that only nests the selection | It keeps the selection. B1's last two presses rest on it, so reversing it reruns B1 (look) | It brings back its own caret | restore host | big |
| A click on the chrome of the editor that holds the selection's start | It drops the selection and brings back the editor's caret (look) | It keeps the selection, as today | keep on press | small |
| The cross-root freshness task | Its three findings become rows U14 and U15 of this plan (look) | It stays its own task | split freshness | small |
| Which review question this answers | The runtime scope only, since the selection scope's head is a separate open review | Both scopes | both scopes | detail |
| The first fix's pieces | Keep its typing guard and its tests; replace its stamp and writer rule | Start from the release state | from base | detail |
| A selection across blocks made while an Android keyboard has a change pending | Android queues the selection's placement until the change flushes, and that later placement ends the selection, so it shrinks to the part inside one block. No phone proof ran (look) | Show the selection only once Android applies its placement | stamp android | big |
| An outer editor waking up for a key aimed at a nested one | Left as today and offered as a task, since S1 counts the same placements as base | Skip the wake-up in this run | skip wake | detail |
| Moving focus back to the editor that answered a key after a newer caret in another editor replaced its selection (U5c) | Cancelled in this run. A show the writer refuses leaves the key handled with no focus repair, so focus stays where the newer placement put it, with U5c, U9c and U5e as tests. The third plan panel showed that slice 2's own repair takes focus back, so the fix moved into this run (look) | Leave the focus move as at 254cc45304 and offer it as a task | leave focus | small |
| Shift+ArrowRight past a root nested two deep that ends its host (U22b) | Left as is and offered as a task. Slice 2 extends nothing and throws nothing there. At 254cc45304 the selection extends into main's next block and a listener throws "Cannot resolve view-boundary point". Shift+Arrow out of a root nested two deep now extends in U22 and U31 instead of throwing (look) | Extend into the outer editor's next block in this run | fix host end | small |
| A nested root under a host the page shows twice (B6) | Left as at 254cc45304 and offered as one task with the owner precedence warning. The view's graph keys a node by its immediate owner, so the two copies of the nested root share a key and building the graph throws, at 254cc45304 and on slice 2. B5 moves to the synced block the page shows once (look) | Key each graph node by its whole owner chain in this run, with another diff panel round | fix occurrence | big |
| Ctrl+End when the document ends with an owner whose root no view renders | The walk enters that root, as Shift+Arrow already does at 254cc45304, and it is offered as a task (look) | Treat that owner as a block with no root | skip unrendered | small |
| Ctrl+Home and Ctrl+End when the document starts or ends with a content root | The caret goes to that root's first or last block, the block the reader sees there, since synced blocks act like sibling blocks | Stop at the owner block, which has no visible text, as base does | stop at owner | small |
| A drag after a newer placement ends its selection (U25c, U25e, U25f) | Left as at 254cc45304 and offered as one task with B7. The build's diff panel broke both endings this plan gave the drag. Round 1 showed that a flag set inside the drag's own write missed a placement between two drag events (U25e). Round 2 showed that checking whether any record still shows let mouseup write over a replacement record (U25f), and stopped a drag that passed back over its anchor after the coordinate path's own clear (U25g). The panel rule allows one replacement per mechanism, so the drag's ending is back at its code at 254cc45304, and U25g guards the pass back over the anchor. Round 3 found that the drag clears a focused peer's caret, at 254cc45304 too, because each drag write clears the DOM selection (U25h). Fixing it in this run means a native path for the drag's records, a change to the drag that no round could review (look) | Design the drag's ending as its own plan in this run | drag plan | small |
| A drag the browser owns, after a newer placement ends its selection (B7) | Offered with the drag task. jsdom has no native drag, so only a browser run shows whether the browser keeps extending its own range until mouseup (look) | Write and run B7 in Chromium and Firefox in this run | run drag | small |
| The key's after-render focus retry and the click's receipt, neither of which names a placement | Offered as a task. The key's synchronous focus runs right after the write the writer guards. A placement in the frame between a key and its retry, or one a listener makes during a click's write, can still lose focus. U12b presses with mousedown only, and a real click's mouseup activates the pressed root again with no receipt, so it would take focus back from note (Opus, the diff panel's round 2) (look) | Give both a placement receipt in this run | receipt now | small |
| The dead-end rule outside the writer, two deferred native clears with different freshness checks, activation's clear, whose null write returns nothing a caller can check, so activation reads the placement generation again, and the writer's bare boolean return, which comment-sicko flagged once it deleted the writer's comment | Offered as tasks, since each repeats a rule and no case fails on it | Move the rule into the writer and share one clear in this run | fold now | detail |
| The runtime page's link | https://claude.ai/artifact/TBgmnQqQjBpGCdLdgYWwy1 no longer opens from this account, so the page now lives at https://claude.ai/artifact/DTJFCxEv5oHSaaL2m4u8xQ (look) | Drop the new page, if the old one was deleted on purpose | drop new page | detail |
| Whether the plan counts as done without the drag's ending | The plan stays partial and out of the runtime subject until the drag task lands, because this run dropped the drag's ending on its own (look) | Count the keyboard fix as done, fold this plan into the runtime subject and mark it executed | accept drag | small |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Freshness of a selection across roots | G4 checks only at publish, with a predicted generation; other writers check nothing | Every write that shows a selection names its anchor placement, through `place` or through `placedAt` from `capturePlacement`, and a `place` that places nothing takes the current placement; a write or a clear that names an older placement is refused before the store changes; the reader returns the record only while that generation is the newest; a committed-placement listener drops a stale record at once and tells subscribers after the publish; the caret engine's DOM clears run only while their record shows; a drag that a newer placement overtakes shows its selection again at its next event and clears the DOM selection, as at 254cc45304 | `react/view-selection.ts` | Panels broke every predicted stamp, round 1 broke the bare stamp of writers that place first, and round 2 broke writers that changed the store or the DOM before they checked. Round 3 and the build's diff panel broke each ending this plan gave an overtaken drag, so the drag's ending goes to a task, and the diff panel's round 3 found that the drag clears a focused peer's caret, at 254cc45304 too (U25h) | Six writers that place inside the write pass `place`; four that place first pass `placedAt`; the browser test handle passes the current placement; the types refuse a write that names neither | U2, U5, U5b, U6, U9, U9b, U14, U16, U19, U20, U20b, U20c, U23 to U25, U24b, U25b, U25d, U25g | Subscribers hear that a newer placement ended the record one microtask after it commits | rearchitect |
| Committed placements | Only caret-owner changes are observable | `subscribeCommittedPlacement`, called from `setCommittedCarets` on each new generation, and `capturePlacement`, which returns the first generation a callback committed | `core/view-carets.ts` | A commit listener misses placement-only commits, measured at base | `react/view-selection.ts` and the five writers that place first | U5, U9, U20, U23, the premise probe | A listener that places inside the publish step | add |
| Which roots keep it on activation | None; activation clears it only when it has a caret to restore | Every root it holds and each host on the owner chain of each start, which climbs from that start's own host and follows a root's host only when that root has one; every other activation drops it, and stops when a listener places another caret during that clear | `view-caret-restore.ts` | The writer root failed with several writers per key, a one-host map failed U21, one reached set across starts failed U21b, and a press whose clear let a listener place another caret restored its own over it (the diff panel's round 1) | Activation only | U1, U3, U4, U8, U11, U12b, U21, U21b, S1b, S2, B1 | Keeping it in a root it does not cover | rearchitect |
| Activation intent | One `focus` flag | A separate `press` flag, set only by a chrome press | `view-caret-restore.ts` | Opus round 3 warning 5 | `focusRoot` | U7, U10, U12 | A focus caller that drops the selection | rename |
| A key several nested Editables receive | Each ancestor runs it again, re-places the anchor and repairs focus | The first answer stands for every ancestor, which repairs nothing | `content-root-navigation.ts`, `keyboard-input-strategy.ts` | The prototype failed U5 and U9 until it had the mark, and U5b and U9b until ancestors stopped repairing | `applyContentRootViewSelection` and the keyboard strategy's nested-target branch | U5, U5b, U9, U9b | An ancestor that needed its own run | fix |
| Focus with a nested editor's DOM selection | The outer editor's focus returns early and leaves the nested editor's DOM selection showing | It writes its own DOM selection when it holds the caret and no record shows | `runtime-focus-mouse-events.ts` | U5 failed once ancestors stopped repairing, because typing followed the nested DOM selection | Focus only | U5 | A focus that writes over a DOM selection the user just made | fix |
| Nested beforeinput | Every ancestor Editable activates for a nested target | Only the target's own Editable activates | `editable-dom-runtime.ts` | B2 | Kept from the first fix | B2 | none found | keep |
| Document edge resolution | The document boundary climbs one owner level, then throws or lands on an owner's hidden placeholder | The document's first or last edge, walked down one block per level from the one top root every host chain reaches, following the active owner wherever a root has one | `content-root-owners.ts`, `content-root-boundaries.ts` | U3, U18, U27 to U29, and a climb that reached two tops from a copy inside a detached note (round 3) | Both callers of Ctrl+Home and Ctrl+End, plain and Shift, and the root of each view boundary graph | U3, U18, U26, U26b, U26c, U26d, U27 to U29 | Ctrl+Home and End now land inside a content root at the document's edge | fix |
| Focus after an overtaken show | The Editable that answered a key moves focus back to itself after a newer placement in another editor | A show the writer refuses leaves the key handled and repairs no focus | `content-root-navigation.ts` | U5c failed at 254cc45304 and on slice 2 (round 3) | The key path of the Editable that answers | U5c, U9c, U5e | A key that needed focus back after a refused show | fix |
| Movement targets of a selection across roots | A root's own movement can return a point the view does not hold, which throws | Each target passes through the view's boundary graph, and a target with no owner takes its root's owner | `content-root-navigation.ts` | The redesign kept selections alive that base dropped, and Shift+Arrow from them threw two deep (round 2) | Shift+Arrow and its vertical advance | U22, U31, U31one, U31m | A target the graph refuses falls back to the graph's own movement | fix |
| A Shift+Arrow with nowhere to go | The record stays, and the model selection collapses outside the writer | The writer shows the record again and stamps its own collapse, and the key writes nothing while the record is current and the model selection sits at its anchor | `content-root-navigation.ts` | The stamped record went stale at a dead end (round 2), and every dead-end key told subscribers again (round 3) | The dead end only | U30, U5d | none found | fix |

## Steps

- [x] Run `pstack:architect` once against rows U1 to U11, U17, B1, B2, B4 and S1, then write its design, its slices in landing order with the crash fix first and the challenge delta here. Proof: the decision log's architect rows and the three runners' answers in the run directory.
- [x] Run the plan panel on this plan with the configured seats, at most three rounds. Proof: the decision log's seats rows and one row per finding.
- [x] Slice 1, the edge fix: walk the document's first or last edge from the top of the owner chain for both callers of Ctrl+Home and Ctrl+End, with U18, U26 to U26d and U27 to U29 as its tests in their own describe. This worktree holds the first fix uncommitted, so save it as a patch in the run directory and check its files out at 254cc45304 before applying the slice, because `land.mjs` commits the whole worktree. Land it through `land.mjs`. Proof: U18 and U27 to U29 fail at 254cc45304, U26 fails on a walk that always starts from main, U26b on one that falls back to main for a root with two hosts, U26c on a climb that ignores the active owner, every row passes on the slice, the plitejs React suite and the React typecheck pass, and `git show --stat` of the landed commit lists only the slice's files, this plan and its decision log.
- [x] Slice 2, the redesign: the committed-placement listener and `capturePlacement`, the stamped record and its writers on `place` or `placedAt`, the notification after publish, the activation rule with `press`, the answered-key mark with no ancestor repair, the focus write, the dead end through the writer, movement targets through the view's graph, the first fix's beforeinput guard, its B1 and B2 specs, and the table's U and S rows as tests. Land it through `land.mjs` after its diff panel. Proof: every P1 U and S row passes, the plitejs React suite passes, B1 passes five warm runs in Chromium and five in Firefox, B1, B2 and B4 pass in Chromium, Firefox and WebKit, B5 runs on the synced block the page shows once, with a runtime-error check, at 254cc45304 and on the build, B6 runs at both as a control, the benchmark probe's frozen lines pass on the final tree, the two-file `view-caret-work` and `ime-decoration` command fails no case in five runs that it does not fail at 254cc45304, a hand drive of B1 with a screenshot, the React typecheck and lint pass, the diff panel rows, and the landed commit.
- [ ] Amend `.changeset/plitejs-view-carets.md`, fold this plan into the runtime subject and offer each failing P2 row and each task the Defaults name as a task. Proof: the changeset diff, the folded render and the ledger rows.

## Completion gates

The Build playbook's gates for both slices. The run wrote this table at the close, not when the build started, so its cells cite the rows each gate already logged.

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Blast radius | skip | `pstack:blast-radius` before a public API change | skip: no public call changes |
| Guards reproduced | yes | Each U, S and B row runs at 254cc45304 | done: the Expected results table's last column, log rows "check" |
| Changeset | yes | Load `changeset` and write what `plitejs` needs | done: log row "lead" for the changesets; `.changeset/plitejs-view-carets.md` amended and `.changeset/plitejs-nested-content-root-keys.md` added, both unreleased patches |
| Writing passes | yes | `deslop`, then `no-comments`, over each round's fixes | done: log rows "writing" |
| Cheap checks | yes | Type-aware oxlint on the task's files before the diff panel, and the `pnpm check` steps the edits reach | partial: log row "check" for Cheap checks; the panel rounds ran after the plitejs lint, and type-aware lint on the task's files first ran after round 3, where it passes on the final bytes |
| Diff panel | yes | The `push` row, since slice 2 changes Plite core | done: three rounds, log rows "panel" |
| Scale gate | yes | The benchmark probe's frozen lines on the final tree, through `benchmark` | inconclusive: log row "check" for both paired timing protocols; 3 of 10 lines pass, 7 are inconclusive from host load and none miss, and t_4b2d897f reruns them |
| Suites | yes | The plitejs React suite, the React typecheck and the test typecheck | done: log rows "check"; the React suite passes 1952 of 1952, and the full plitejs typecheck, which runs both, passes with nothing cached. An earlier row read the bare test typecheck's unbuilt-partition errors as a baseline, which hid 46 test errors that the build then fixed |
| Thermos | skip | `pstack:thermos` on each slice | skip: the `push` row owes a panel on the diff, and every seat applies both lenses |
| Hand drive | yes | B1 on `/examples/plite/synced-blocks` with a screenshot and `hand-drive.mjs check` | done: log row "check" for the hand drive; the second Shift+ArrowDown reaches "Between synced copies." on screen, and check covers the page's desktop cell |
| Playtest | skip | `playtest.mjs scope` on the task's files | skip: it names no scenario catalog for these files |
| Docs | skip | `plate-docs` on each public docs page the change affects | skip: no public call or docs page changes |
| Land | yes | `land.mjs --check 'pnpm check --affected'` for each slice | done: slice 1 as e7151f6289 and slice 2 as bd36fd90cd |

## Close

Reversals and deviations come first.

- The drag's ending is back at its code at 254cc45304. The plan gave an overtaken drag two endings, and the build's diff panel broke both (U25e, U25f and U25g), so the claim narrows to the key path and the writers that place first. A drag that a newer placement overtakes shows its selection again at its next event, and each drag write clears the DOM selection (U25h), as at 254cc45304. The run made that cut itself, so the plan stays partial until the drag task t_95972f5a lands or the owner says "accept drag", and the fold into the runtime subject waits with it.
- B5 moved from the shared body the page shows twice to the separate synced block, because the shared body's nested root throws "Duplicate view-boundary node key" at 254cc45304 too (B6). B5 runs only in Chromium, since the ArrowDown entry fails in Firefox and WebKit at both trees.
- This run first left moving focus back after an overtaken show (U5c) as a task, then fixed it when the third plan panel showed that slice 2's own repair took focus back.
- A check row before the final proofs read the bare test typecheck's errors for unbuilt partitions as slice 1's baseline. The full typecheck then found 46 test errors, test writes that named no placement and one plugin list type, which the build fixed before slice 2 landed.
- The run wrote the Completion gates table at the close, not when the build started.

What landed, on `next`:

- Slice 1, "fix(plitejs): send Ctrl+Home and Ctrl+End across content roots to the document edge" (e7151f6289).
- Slice 2, "fix(plitejs): keep a selection across content roots while a root it covers takes focus" (bd36fd90cd), with `.changeset/plitejs-view-carets.md` amended and `.changeset/plitejs-nested-content-root-keys.md` added.

Proof and its limits:

- B1 passes five warm runs in Chromium and five in Firefox. B1, B2 and B4 pass in Chromium, Firefox and WebKit, except Firefox's `schema-reconfiguration.test.ts:151`, which fails at 254cc45304, and B5, which runs only in Chromium.
- A hand drive on `/examples/plite/synced-blocks` shows the second Shift+ArrowDown reaching "Between synced copies." and Shift+ArrowUp coming back into the synced root, with no console error.
- Every P1 U and S row passes in jsdom. The plitejs React suite passes 1952 of 1952 tests, the full plitejs typecheck passes with nothing cached, lint passes, and the two-file IME command passes 27 of 27 in each of five runs.
- The timing probe passes 3 of its 10 lines and misses none. The other 7 are inconclusive from host load, and t_4b2d897f reruns them on the landed commit.
- The U rows run in jsdom with model-set selections, and only the B rows drive native keys. Safari, screen readers and phones stay unproven, and the Android pick is inferred with no phone run.

Counts: one ask, the card's, done; 13 gates in Completion gates, 7 done, 4 skipped with a reason, 1 partial and 1 inconclusive.

The review inputs are `packages/plitejs/src/react/view-selection.ts`, `packages/plitejs/src/core/view-carets.ts`, `packages/plitejs/src/react/editable/view-caret-restore.ts`, `packages/plitejs/src/react/editable/content-root-boundaries.ts`, `packages/plitejs/src/react/editable/content-root-navigation.ts`, `packages/plitejs/src/react/editable/selection-controller.ts`, `packages/plitejs/src/react/editable/keyboard-input-strategy.ts`, `packages/plitejs/src/react/editable/root-interaction-controller.ts`, `packages/plitejs/test/react/view-carets.test.tsx`, `apps/plite/tests/plite-browser/donor/examples/synced-blocks.test.ts`, `docs/plans/2026-10-20-view-caret-placement.md`, `docs/plans/2026-10-21-view-selection-import.md`, `docs/plans/2026-05-27-synced-blocks-sibling-selection.md`, `docs/plans/topics/selection.md` and `apps/www/src/app/(app)/examples/plite/plite-example-client.tsx`.

The open work is under Open work, each item with its owner and its stop.

## Evidence

Model: claude-opus-5-5 at xhigh.

### Requirements

- The ask (t_3fd19637): from inside the first synced root, entered with ArrowDown from p1, Shift+ArrowDown extends past the root's last line into the owner block that starts "Betwee", and back.
- The view caret plan's law: each root restores its own caret on a click, Tab, typing or a caret key when it does not hold the caret, and a newer placement anywhere wins over an older request, a focus move included.
- That plan's J4 case: a stale selection across roots never survives a root's own caret restore, so typing never replaces a stale range.
- The synced blocks plan: Shift+Arrow and mouse selection cross synced roots like sibling blocks, and the selection survives Plite's internal focus repair.
- The import plan's law: when another presentation takes the caret, this presentation parks the selection's collapsed anchor and drops the expanded selection (G4).
- Every case the three diff panels raised, as rows U1 to U11.
- No public API change and no hard cut.

### Lanes

1. Merge the freshness rule and the keep into `react/view-selection.ts` (picked). One writer collapses to the anchor first, then stores the selection with the generation the editor committed, so a discarded draft, a commit listener and a subscriber cannot shift it. One reader drops a stale record. Activation keeps a current record for every root it covers. It deletes `VIEW_SELECTION_RECEIPTS`' prediction, its caps and the writer root, and G4's separate prediction. Predicted benefit: U1 to U11 pass with less code than the first fix.
2. Store the selection's extent in the core caret state (Opus round 3, finding 6). Any placement replaces the owner and drops the extent by construction, and history could carry it. It changes a stored core shape that history, specs and Yjs carry, and widening `holdsCaret` to covered roots changes `mayClearCaret` and the clamp for every DOM-driven clear. The only gain over lane 1 is per-presentation freshness, which the import plan's law rules out. Architect compares it once.
3. Make Plite's own focus repair skip activation. It fixes B1's second press only, and focus origin is the signal the view caret plan already found unreliable. It leaves U2, U4 and U14.
4. The rule is wrong: delete activation's clear of the selection. The job it protected, J4, still holds, so the rule narrows to stale or uncovered selections instead of going.
5. Keep the first fix. Its rounds 2 and 3 left U2, U3, U4 and U11 failing and broke U5.

Proof limits: the U rows run in jsdom with model-set selections; only B1 to B4 drive native keys. Safari, screen readers and phones stay unproven.

### Design exploration

`pstack:architect` ran three runners on lane 1's brief: Opus, Astra at xhigh and Sol at xhigh. An Opus cross-judge at xhigh scored their anonymized copies. Their answers, the judge's verdict and its name map are in the run directory under `architect-1`.

| Candidate | Freshness | Coverage | Keys several Editables receive | Judge total | Judge's main defect |
| --- | --- | --- | --- | --- | --- |
| Opus (base) | A core hook in `setCommittedCarets` returns the generation `place` committed | Part roots, then the owner chain | Left as is | 12 | U5 and U9 fail: an ancestor runs the key again and re-places the anchor |
| Sol | A pending proposal published through a transaction guard | Host roots on graph nodes | One capture handler per key | 13 | U4 fails: the capture's own activation steals main's caret |
| Astra | A core publication staged through the spec lifecycle | Host roots from the graph walk | One capture handler per key | 13 | The largest change: core notification order, every clear and history |
| Keep the first fix (control) | A predicted stamp | The writer root | Left as is | not scored | Three diff panels broke it |

The judge picked Opus as the base because its freshness core is the only one the code fully supports, and its defects sit in key routing. The design takes these grafts:

- One committed-placement listener both stamps a pending record and drops a stale one, so a placement-only commit also repaints. The premise probe found that such a commit fires no commit listener.
- The answered-key mark, in place of the judge's capture widening. It removes the second write, which made U5 and U9 fail, and changes no propagation an app sees. The prototype failed exactly U5 and U9 without it and passed every U row with it.
- The document edge on both Ctrl+End callers, which the Opus candidate missed for the plain Ctrl+End caller. The first plan panel replaced the graph built from main with a walk down the edge from the top of the owner chain.
- A `place` that throws drops its record.

Cases a losing candidate handles that this design leaves as named limits:

- Coverage reads the owners when activation runs, instead of a set stored at write time. It runs only while a record shows. It follows the selection's own owners, and a root's host only when that root has one, so a shared root's other host never passes for the one the selection runs through.
- Activation's focus receipt still predicts the next generation, as at 254cc45304, so a discarded nested draft inside its write can cancel the focus.
- The view's graph keys a node by its immediate owner, so building the graph throws for a nested root under a host the page shows twice (B6), as at 254cc45304. It stays open under Defaults, and a suggested task owns it.
- A projected drag that a newer placement overtakes shows its selection again at its next move or mouseup and clears the newer caret's DOM selection, as at 254cc45304 (U25c, U25e, U25h). The drag's boundary graph gives no node a text span, so no record the drag writes can use the native selection, and each of its writes clears the DOM selection, even inside one paragraph. A replacement selection written during a drag is overwritten at mouseup (U25f). The drag task owns both.
- An outer Editable still activates for a caret key aimed at a nested one, two placements per key as at 254cc45304. S1 allows no placement beyond base's, so this is a Defaults row.

Premises the design rests on, measured at 254cc45304 by `premise-probe.test.tsx` in a scratch worktree (`premise-probe-a1.log`): a same-value selection write mints and commits a new generation and notifies no commit listener; a discarded draft never commits its generation; a commit listener's own placement commits after the writer's; `editor.update` cannot nest; a draft reads its own placement generation.

### Plan panel

Round 1 ran Opus, Astra at xhigh and Sol at xhigh on the plan and the prototype; their reports are under `plan-panel-1` in the run directory. It changed the design in six places:

- The placement listener told subscribers in the middle of core's publish, so a subscriber's edit was overwritten (U19). It now tells them in a microtask.
- History replay and the caret engine place before they write, and they stamped whatever generation was current, so a placement that landed in between passed for theirs (U20). They now pass `placedAt` from `capturePlacement`, and the types refuse a write that names no placement.
- A coverage map that kept one host per root lost a shared root's other host (U21). Coverage now follows the selection's own owners.
- An ancestor still repaired focus for a key a nested editor answered, which overwrote a newer caret (U5b, U9b). It now repairs nothing, and focus writes its own DOM selection instead.
- The writer reads its result after its own notification (U25), and a failed placement tells subscribers (U24).
- The graph that the document edge built from main sent a nested root outside main to main's end (U26), and it cost a graph per key. The edge walk reads one block per level and also fixes U27 to U29, which fail at base.

The Android row moved to `look` under Defaults. A same-point placement now ends the record (U23).

Round 2 ran the same seats on the plan and the prototype after round 1's fixes, with slice 1 beside them; their reports are under `plan-panel-2`. It changed the design in seven places:

- A write or a clear that named an older placement deleted the newer selection (U20b, U20c). The writer now refuses it before it touches the store.
- The caret engine and the projected drag cleared the DOM caret after a newer placement won (U25b). Each clear now runs only while its record shows. The drag's clear went back to its code at 254cc45304 with its ending, as the Diff panel section says.
- Coverage skipped the second selected copy of a shared root (U21b). Each start now climbs from its own host.
- Slice 1 sent a root hosted twice inside note to main's end (U26b). The walk now starts from the one top root that every host chain reaches.
- A Shift+Arrow with nowhere to go erased a selection that base kept (U30). The dead end now shows the record again through the writer.
- The redesign kept selections alive that base dropped, and Shift+Arrow from them threw two deep (U31, U31one, U31m). Movement targets now pass through the view's graph, so round 1's open two-deep finding is fixed.
- A replacement that placed twice and then threw told subscribers twice (U24b). It now tells them once.

The editor that answered a key still moves focus back over a newer caret in another editor (U5c). It fails the same way at 254cc45304 and stays open under Defaults, with U22b and the unrendered roots case.

Round 3 ran the same seats on the plan after round 2's fixes, with both slices; their reports are under `plan-panel-3`. It changed the design in four places and added one test:

- Slice 1 sent Ctrl+End from a root's copy inside a detached note to main's end, because the climb reached two tops (U26c). The climb now follows the copy the view shows wherever a root has an active owner.
- The editor that answered a key took focus back after a subscriber's newer placement in another editor (U5c, U9c, U5e). A show the writer refused now leaves the key handled with no focus repair.
- A dead-end Shift+Arrow told subscribers again on every key while nothing changed (U5d). It now writes nothing while the model selection sits at the record's anchor.
- Mouseup showed an overtaken drag again over the newer caret (U25c). A drag that a newer placement overtook then ended, until the diff panel's round 2 sent the drag back to its code at 254cc45304.
- U25b never reached the deferred clears, so U25d places the newer caret before each one.

Building the view's graph throws for a nested root under a host the page shows twice, at 254cc45304 and on slice 2, because the graph keys a node by its immediate owner only (B6). B5 moves to the synced block the page shows once. B6 and the owner precedence warning go to one suggested task. U22b's base column now holds 254cc45304's result.

### Diff panel

Round 1 ran the same seats on slice 2 over the landed slice 1; their reports are under `diff-panel-1`. Astra and Sol found the same two criticals, and both changed the code:

- A press on the chrome of the editor that holds the selection's start cleared the selection, a listener placed and focused note inside that clear, and activation then restored and focused its own caret over note's (U12b). Activation now stops when a placement lands during its clear.
- A drag that a newer placement ended between mousemove and mouseup showed again at mouseup (U25e). The drag then checked whether the record it wrote still showed, before and after each move, in place of the flag that caught only a placement inside its own write. This was the one replacement this plan made to how a drag ends.

Opus raised five warnings and three nits. Firefox and WebKit run on the final bytes before slice 2 lands. B7, the key's focus retry, the click's receipt, the dead-end rule and the two native clears go to tasks, as Defaults says. The nit that no probe times a key while a selection shows added the extend-shown cohorts below.

Round 2 ran the same seats on round 1's fixes; their reports are under `diff-panel-2`. All three broke the drag's replacement:

- Astra and Sol found that a subscriber that writes a replacement selection while the drag's selection shows leaves the drag running, so mouseup writes over the replacement (U25f).
- Opus found that a press on an expanded selection sends the drag through the coordinate path, whose own clear on a pass back over the anchor ended the record, so the check stopped the rest of the gesture (U25g).

The drag's ending went back to its code at 254cc45304, and the claim narrows to the key path. A newer placement ends a selection that a key showed, and a drag that a newer placement overtakes behaves as at 254cc45304. U25g fails on the replacement and passes at 254cc45304 and after the revert. U25c, U25e and U25f fail the same way at both, and their cases wait in the run directory for the drag task. Opus also warned that U12b presses with mousedown only, while a real click's mouseup activates the pressed root again with no receipt, and that only a test subscriber places a caret when a selection ends. U12b moves to P2 and the click receipt task takes the mouseup. Opus's two nits are settled. The result's dead `target` field is gone, and the comment that named only another root is deleted, as comment-sicko ruled.

Round 3, the last, ran the same seats on round 2's fixes; their reports are under `diff-panel-3`. Astra found one critical from a comparison that stubbed the drag's boundary graph and did not run the repository's fixture. A drag crossed into "below" and returned to its own paragraph, and a subscriber repeated a focused peer's placement during that move. Astra read 254cc45304 as keeping the peer's native caret through the export path and slice 2 as clearing it (U25h). In the repository's fixture U25h fails the same way at 254cc45304 and on slice 2. The drag's boundary graph gives no node a text span, so no record the drag writes takes the export path, and its continuation clears the DOM selection on every write. A fix that skipped the clear in the overtaken event kept the caret only until mouseup, whose own write clears it as U25g requires, so it was reverted. U25h stays open, as at 254cc45304, for the drag task. All three seats warned that the commit draft, the writer's comment and the Freshness row still claimed that every DOM clear runs only while its record shows and that every drag write names its anchor placement. The commit draft and the Freshness row now name the caret engine's clears and say that a `place` that places nothing takes the current placement. comment-sicko deleted the writer's comment and flagged its bare boolean return, which goes to the fold task. Opus's other warning, that the browser proofs ran before the revert, is met by the final runs on these bytes. After its nits, U25g has a new title, U25c and U25e are P2, and U25f has its own limit sentence. The activation stop's comment stays deleted, as comment-sicko ruled, and its reshape goes to the fold task.

### Benchmark probe

The probe is `view-selection-timing.probe.test.tsx` in the run directory. It runs eight jsdom cohorts against 254cc45304 through `paired-timing.mjs`, each with a planted arm and a same-code arm. The cohorts are a plain caret key with a budget of 1.10, an extend with Ctrl+Shift+End at 1.25, focus into main while a selection shows at 1.50 and Ctrl+End at 1.50, each with 10 and with 100 owners. Its first full run, on the port before round 2, missed the extend lines at 2.04 and 2.28. The fixture caused the miss. At 254cc45304 a shown selection survives the setup's newer placement, so each base sample showed again a selection that was already painted, while the candidate painted it from nothing. The extend cohort now ends the selection before each sample on both sides and checks three painted marks per owner, and its planted arm ends the selection and extends again. One quick run on slice 2's round 3 bytes reads 1.01 on the large extend and 0.93 on the large caret key.

The diff panel's round 1 added two cohorts in `config-shown.json`, extend-shown at 10 and 100 owners, with the extend lines' budget of 1.25. Every Editable runs activation on each caret key while a selection across roots shows, and no other cohort times that. Each sample shows a selection from nothing, takes one Shift+ArrowLeft untimed and times the next. The first step stays untimed because it moves focus once. On slice 2, focus stays in body after Ctrl+Shift+End and moves to main on the next Shift+Arrow, where `repair.focus-editor` takes 1134.8 µs against 20.7 µs at 254cc45304; later keys keep focus in main. A quick pass of the repaired cohorts reads 6710 µs against 6864 µs at 10 owners and 17096 µs against 18300 µs at 100.

Both protocols ran on the diff panel's round 3 tree, whose later bytes change comments, tests and one early return that behaves the same. The extend-shown lines pass at 0.98 and 1.01, with same-code noise of 0.09 and 0.04, and each planted arm fails. The eight-cohort protocol passes the extend line at 10 owners and is inconclusive on the other seven, because the host's load reached 21.70 on 18 cores and the same-code noise reached the candidate's margin. No cohort missed its budget. t_4b2d897f reruns both on the landed commit.

### Dependents

- `ui`: `apps/www/src/app/(app)/examples/plite/plite-example-client.tsx` mounts the Plite examples and imports no selection or activation code, so it is unaffected.

### Earlier reviews and plans

- This review retains 2026-10-22-runtime-dom-view-lookups, the runtime head, because it answers which view a DOM call reaches and this review changes nothing it decided ([plan](2026-10-22-runtime-dom-view-lookups.md)).
- It narrows the [view caret plan](2026-10-20-view-caret-placement.md)'s rule that activation clears the selection across roots, and flags that plan here instead of editing it.
- The recall brief for this run is `recall-brief.md` in the run directory, cited by the decision log.

## Open work

- The fold of this plan into the runtime subject, drafted with this run's Close. owner: t_95972f5a, the drag task. stop: that task lands, or the owner says "accept drag".
- t_95972f5a Give every cross-root selection writer and reader one freshness rule. Every writer but the projected drag now has it; the task holds the drag's ending, which this plan left as at 254cc45304, with its U25c, U25e, U25f and U25h cases and the browser case B7. owner: the owner, from the suggested-task ledger. stop: started or dismissed.
- t_74d9b55b Key each view-boundary node by its owner chain, so a nested root under a host the page shows twice builds its graph instead of throwing "Duplicate view-boundary node key" (B6). owner: the owner, from the suggested-task ledger. stop: started or dismissed.
- t_cd1f2d4d Extend Shift+ArrowRight past a root nested two deep that ends its host, which extends nothing (U22b). owner: the owner, from the suggested-task ledger. stop: started or dismissed.
- t_45e00e70 Find why ArrowDown into a synced block nested inside another leaves its body without a caret in Firefox and WebKit; until it lands, `synced-blocks.test.ts` runs B5 only in Chromium. owner: the owner, from the suggested-task ledger. stop: started or dismissed.
- t_b7df33ce Find why the first Shift+ArrowDown after a click into a synced body does nothing. owner: the owner, from the suggested-task ledger. stop: started or dismissed.
- t_4b2d897f Rerun the cross-root selection timing protocol on the landed fix; the final run was inconclusive on 7 of 8 cohorts from host noise and missed no budget. owner: the owner, from the suggested-task ledger. stop: started or dismissed.
- t_311c5484 Stop Ctrl+End from placing the caret in a content root no view renders. owner: the owner, from the suggested-task ledger. stop: started or dismissed.
- t_896d964e Keep a selection across content roots made while an Android keyboard has a change pending, which shrinks to one block, inferred with no phone run. owner: the owner, from the suggested-task ledger. stop: started or dismissed.
- t_5d868e6d Stop an outer Editable from activating its caret for a key a nested Editable answered. owner: the owner, from the suggested-task ledger. stop: started or dismissed.
- t_08722716 Move the Shift+Arrow dead-end rule into the view selection writer, share one deferred native clear, and give the writer a result that says whether it showed. owner: the owner, from the suggested-task ledger. stop: started or dismissed.
- t_c422f5bc Give the key's focus retry, a click's mouseup and activation's focus receipt a placement, which none of them names. owner: the owner, from the suggested-task ledger. stop: started or dismissed.
- t_fa13f697 Keep input in the frame after a Shift+click from editing through the plain model selection; the Shift+click typing and pasting cases in `synced-blocks.test.ts` lose their selection under forced key timing, at 254cc45304 too. owner: the owner, from the suggested-task ledger. stop: started or dismissed.
