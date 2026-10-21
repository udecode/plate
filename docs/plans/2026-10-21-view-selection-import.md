---
review_scopes: [runtime]
verdict: pursue
review_basis: [2026-10-20-runtime-view-state]
work_kind: implementation
review_commit: 1cb0833e49d735a85599142b3424b7c149a7c183
review_inputs: [VISION.md, docs/vision/plite.md, docs/plans/2026-10-20-runtime-view-state.md, docs/plans/2026-10-20-view-caret-placement.md, packages/plitejs/src/react/editable/selection-controller.ts, packages/plitejs/src/react/editable/selection-change-listener.ts, packages/plitejs/src/react/editable/runtime-selection-engine.ts, packages/plitejs/src/react/editable/editable-dom-runtime.ts, packages/plitejs/src/react/editable/runtime-root-engine.ts, packages/plitejs/src/react/editable/root-interaction-controller.ts, packages/plitejs/src/react/editable/root-interaction-dom-selection-replay.ts, packages/plitejs/src/react/editable/browser-handle.ts, packages/plitejs/src/react/editable/selection-reconciler.ts, packages/plitejs/src/react/editable/android-composition.ts, packages/plitejs/src/react/editable/runtime-focus-mouse-events.ts, packages/plitejs/src/react/editable/view-caret-restore.ts, packages/plitejs/src/react/components/editable-text-flow.tsx, packages/plitejs/src/react/components/editable-text.tsx, packages/plitejs/src/react/components/editable-dom-commit-fence.tsx, packages/plitejs/src/react/decoration-context.tsx, packages/plitejs/src/react/hooks/use-claim-editable-dom-commit.ts, packages/plitejs/src/react/hooks/use-plite-node-ref.tsx, packages/plitejs/src/react/hooks/focus-plite-editable.ts, packages/plitejs/src/dom/plugin/dom-sync-mutation-ownership.ts, packages/plitejs/src/dom/plugin/dom-integrity-observer.ts, packages/plitejs/src/dom/plugin/dom-editor.ts, packages/plitejs/src/dom/plugin/dom-root-runtime.ts, packages/plitejs/src/core/view-carets.ts, packages/plitejs/src/dom/utils/dom.ts, packages/plitejs/src/editor-runtime-view.ts, packages/platejs/src/react/components/NodeSelection.tsx, packages/plitejs/test/react/view-carets.test.tsx, packages/plitejs/test/react/view-caret-work.test.tsx, apps/www/tests/browser/view-carets.spec.ts, apps/www/src/app/(app)/examples/plite/plite-example-client.tsx]
review_upstreams: ['../codemirror-view@fbff59ba004d80d8c914f64c42586387b08706ac', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../prosemirror-view@ca4c78e9b56f1b164c0b3758b59d8748f11b7534', '../slate@945a484df2497e4c448b33f417b0de2a49840032']
---

# Which view a native selection belongs to

Status: partial: built and proven; the paired timings wait on t_43ad4bac
Playbook: plan

**Pursue.** When two views show one document, Plite reads the browser's selection back into the model up to 100 ms after it changes, and the view whose DOM holds it takes the caret. That read cannot tell Plite's own write from a user's selection, or a click made before a newer placement from a fresh one, so twelve cases fail at `1cb0833e49`, each on an assertion. The removed design at `42b9cf8aec` passed ten of them and failed the click released after an edit and the shadow-root press, and the [caret placement plan](2026-10-20-view-caret-placement.md) cut it when review broke it a second time. Three architect runners and a blind judge picked one design: record the points of every selection Plite writes or moves, note each gesture when it starts, and decide every import from what the DOM showed when its event arrived. A probe proved what that design depends on. In the click case, no Plite selection write runs during the press, and the other view's text commit moves the selection instead. Plan round 1 found that the picked design noted that move a frame late. Plan round 2 found that hooking Plite's text writes still missed React's own replacements and shifted offsets, that a press claims the caret at its first event, and that each decision forgot what it had judged. Each view now watches its own DOM, the holder checks the record too, and a decision records the selection it judged. Plan round 3 found that a gesture closed before the browser finished a click, that the note took any change to a node for a move, and that a commit could still draw another view's caret into a focused view. A gesture now lasts until a frame after its release, the note checks that the selection moved, and a focused view always shows where its next key goes. The execution playbook is Build.

## Brief

### What will change?

When two views show one document, a view takes the caret only from your click, touch, selection or caret key in it, not from Plite's own moves, another view's edits or late events. Two earlier caret plans ship with it.

### What could go wrong?

Review took back three fixes, so a few rare edits can still move a click before Plite reads it. Tests pass in Chromium, Firefox and WebKit. Safari, screen readers, phones and the speed timings are still untested.

## Teach

Plite keeps one live caret per document and remembers which view placed it. The browser has one selection per page. When that selection changes, Plite copies it into the document within 100 ms, and the view whose text holds it takes the caret.

That copy can't tell who moved the selection. Plite drawing the other view's caret looks like a click, and so does an edit in another view that shifts the text under your selection. A click made before code moved the caret looks new.

Each view notes when a click, touch or caret key starts, and takes the caret only if no code moved the caret since. If code did, the view saves the click as its own caret, so your next key there lands at the click. Plite also remembers where it or most text changes put the selection, which then doesn't take the caret. A focused view without the caret shows where your next key goes.

## Public API

`plitejs/dom` gains two exports beside `getSelection`. `writeDOMSelection` is the only way Plate and Plite code writes the browser's selection. `readDOMSelectionRange` returns a copy of a selection's range, so callers never hold the live range. Plate's node selection clears the selection with `writeDOMSelection`, and Plate's static copy reads its range with `readDOMSelectionRange`.

```ts before
// packages/platejs/src/react/components/NodeSelection.tsx
ownerDocument.getSelection()?.removeAllRanges();
```

```ts after
// packages/platejs/src/react/components/NodeSelection.tsx
writeDOMSelection(editable.getRootNode() as Document | ShadowRoot, null);
```

Every place that copies the browser's selection into Plite now asks one function first. Here is the one that runs after `selectionchange`.

```ts before
// packages/plitejs/src/react/editable/selection-controller.ts
if (
  readPliteViewSelection(editor) &&
  selectionChangeOrigin !== 'native-user'
) {
  return;
}
```

```ts after
// packages/plitejs/src/react/editable/selection-controller.ts
const decision = decideSelectionImport(editor, editable, claims, 'place');

if (decision !== 'sync' && decision !== 'claim') {
  return;
}

const origin = decision === 'claim' ? 'native-user' : selectionChangeOrigin;

if (readPliteViewSelection(editor) && origin !== 'native-user') {
  return;
}
```

## What other editors do

Read at ProseMirror view ca4c78e9, CodeMirror view fbff59ba, Lexical dd5c41b1 and Slate 945a484d, source only, not run. Two of them keep a lasting record of the DOM selection they last wrote and ignore any event that reports it. None shows two views of one document with one selection, so none has to decide which view an event belongs to.

| Editor | How it spots its own selection echo | How long the record lasts | Which selection it reads |
| --- | --- | --- | --- |
| ProseMirror | `DOMObserver.setCurSelection` stores the DOM selection after each write; `flush` ignores a selection equal to it (`domobserver.ts:147`, `:181`) | Until the next write or a different selection | The view's root (`domSelectionRange`) |
| CodeMirror | `DOMObserver.setSelectionRange` stores what `DocView.updateSelection` wrote; `readSelectionRange` returns early on an equal range (`domobserver.ts:196-224`, `docview.ts:243`) | Until the next write or a different selection | `getSelection(view.root)`, so a shadow root's own selection |
| Lexical | `markSelectionChangeFromDOMUpdate` sets a flag; the next `selectionchange` clears it and is skipped (`LexicalEvents.ts:332`, `:2074`) | One event | The document's |
| Slate | `isUpdatingSelection` set while it writes, cleared on a timer (`editable.tsx:458`, `:502`) | One timer tick | The root's (Plite's base comes from here) |

## Layer and owner

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| Write record and the raw-setter check | Plite | `plitejs/dom` (`dom/utils/selection-writes.ts`) | Every native selection write Plite makes passes through one function, which reads back the tree's selection; `resolveVisualPoint`'s probe in `dom-editor.ts` ends where it began |
| Commit note | Plite | `plitejs/react` (`react/editable/selection-claim.ts`), `plitejs/dom` (`dom/plugin/dom-sync-mutation-ownership.ts`) | Each peer-view Editable observes its own element, so every change to its DOM reaches the note, whoever made it, and Plite's text sync already marks each node before it writes |
| Next-key export | Plite | `plitejs/dom` (`dom/plugin/dom-view-caret.ts`, `resolveNextKeyCaret`; `DOMEditor.focus`), `plitejs/react` (`selection-controller.ts`, `selection-reconciler.ts`, `focus-plite-editable.ts`) | The commit export, the layout reconciler and both focus helpers write a focused view's caret, so one function picks it. It lives in the DOM layer, the lowest one that can read a mounted view's coverage. So it moves a caret out of a section the view collapsed, as activation does |
| Claim state, gesture notes, the import decision and the keep's DOM guards | Plite | `plitejs/react` (`react/editable/selection-claim.ts`, `selection-controller.ts`, `selection-reconciler.ts`, `editable-dom-runtime.ts`, `root-interaction-controller.ts`) | Gestures and imports belong to one mounted Editable, and every import path lives there, as does the native `beforeinput` listener that skips activation for WebKit's probe |
| Writing an overtaken gesture as a bookmark | Plite | `plitejs` (`core/view-carets.ts`, `keepBookmark`) | The caret book owns bookmarks and placement generations |
| Peer count | Plite | `plitejs` (`editor-runtime-view.ts`) | The runtime view counts the views mounted on its document and tells each Editable when it gains or loses peers |
| Node selection's native clear | Plate | `platejs/react` (`components/NodeSelection.tsx`) | Its two raw `removeAllRanges` calls are Plite-caused writes the record must see |

## Main changes

- Every native selection write Plite makes goes through `writeDOMSelection`, which records the points it leaves in that document or shadow tree. A write the selection already shows leaves the record alone. Plate's node selection clears through it too. `resolveVisualPoint` collapses, moves and restores the selection as one probe that leaves the record as it was. A type-aware check in every first-party package except tests refuses any `Selection` mutator, found by its object's type, whether code calls it or extracts it as `Reflect.apply(selection.modify, …)` does. It also refuses `Selection.getRangeAt`, whose range is live, outside `selection-writes.ts`, which gives readers a cloned range. The probe and browser-handle automation (`browser-handle.ts:854-867`) are the other exceptions. Ranges that code creates or clones stay free, so geometry reads such as `use-selection-geometry.tsx:43` keep their `collapse`.
- While its editor has peer views, each Editable observes its own element for text and child-list changes, whoever makes them: Plite's text sync, React's commits, a repair or a page script. Records arrive in a microtask, before the task that fires `selectionchange`, and every arrival and decision takes pending records first. When a record shows that an endpoint of the tree's selection moved, the note records that selection as moved. It skips only the view that holds the caret while that view is focused and has no open gesture.
- Each Editable keeps a claim state bound to its own element: the latest observation, with the points the DOM showed when its event arrived and its receipt, the open gesture, the receipt of a range seen since the last decision, and its last claim. A press or a caret key opens a gesture, which reads the tree's selection once, forgets the tree's write record, sets an unread observation with the gesture's receipt and stops every focus request still settling on its view. A touch's compatibility mousedown reopens the touch's gesture. Listeners on the document and the window receive every release, including a blur or a hidden page; a keyup ends only a key gesture. A release settles a frame later, so the browser's own change on release counts as part of the gesture, and a gesture whose input moved nothing closes then.
- Every import path asks `decideSelectionImport` before it writes: the throttled import, the direct sync that mouseup, keydown, the root's mouseup capture and the browser handle reach, the two disappear sites, and WebKit's shadow-root `beforeinput` import. It answers sync, claim, kept, veto or clear, by the table in Design. A sync or claim whose writer declines changes nothing, and a decision that consumes the observation records the selection it judged in its own Editable. A claim runs the writer as a user selection, so every later branch reads `'native-user'` and the updating timer does not stop it.
- A gesture that a newer placement overtook becomes its own view's bookmark through `keepOvertakenSelection`, unless that view has a newer bookmark the gesture did not keep, the gesture's text changed since it arrived, or an update is open.
- Every export and focus into a view that does not hold the caret writes the caret its next key would use: its bookmark, else the live caret when that view shows it, moved out of a section the view collapsed. `resolveNextKeyCaret` in `dom/plugin/dom-view-caret.ts` gives that caret to all four writers. When a gesture that a decision dropped or kept closes, and after a keep with no gesture open, the focused view exports.
- Firefox's drag redraw after mouseup runs only when its points are the ones its Editable last claimed or synced and no placement came after; it writes through `writeDOMSelection`.
- In a WebKit shadow root, the native `beforeinput` listener skips activation while Plite's selection probe runs, arrivals record no points because WebKit reports the host's, the probe's import records an observation for an open gesture, closing a gesture keeps its unread observation for a later probe import, and the write record keeps the points Plite wrote.
- When an Editable unmounts or changes root, it drops its claim state and its observer, ends a note turn it began, and forgets the tree's write record when an endpoint lies inside it.
- A lone editor returns at the peer check, before any read, and runs no observer.
- Android composition reads the selection of the Editable's own tree, so a shadow root reads its own.

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| A click, touch or caret key in a view that does not hold the caret | Claims for that view, as before | jsdom cases 4, 8, R3, R4; browser spec in Chromium, Firefox and WebKit |
| A plain click inside a selection, which the browser collapses after mouseup | Counts as the click, because the gesture lasts until a frame after its release (R37) | jsdom with the collapse after mouseup; browser spec in three engines, which reads the editor's own caret and fails at base in each |
| A tap whose caret the browser places after touchend, in its compatibility mouse events | Counts as the touch (R38) | jsdom with the compatibility events dispatched; devices unproven |
| A press or key whose release never reaches the page: the window loses focus, the page hides, or a drag ends in `dragend` | The gesture is released then, so a later selection with no gesture claims (R34, R42 to R44) | jsdom |
| Plite's export echo in a view that does not hold the caret | Claims nothing (case 3) | jsdom; browser spec echo case, which reads the editor's own caret and fails at base in each engine |
| A caret key or press that a handler prevents, so the selection never moves | Its gesture closes a frame after release, so a later selection with no gesture claims | jsdom |
| A caret key pressed with Command on macOS, whose own keyup never comes | Command's keyup ends the gesture | jsdom with Command's keyup alone; macOS unproven |
| Another view's edit that moves a click before Plite reads it | A plain click already placed its caret at mousedown, so the view keeps the click and never claims the moved point. A press that mousedown does not place, such as one on selected text, a multi-click or a modified click, is dropped, and the view shows where its next key lands (cases 5, 12, R13, R20, R23) | jsdom; browser case 5 in three engines checks the click and that the moved point's event comes after the note |
| An edit to a clicked text node that leaves the click in place | The click stays, also when a change of the same length before it replaces some text (R35, R36, R51, C6). A click at offset 0 is dropped when any edit hits its text node, because a rewrite of the whole node moves every other offset to 0 and the note can't tell the two apart (Defaults "note edge"). A click that an edit moves to the edit's own start, such as a page script's delete around it, or past inserted or removed text that repeats the text beside it, still claims where the edit put it, because its text reads the same as a click the edit left in place. So does a click that two edits to its node move in one turn (Defaults "note text moves") | jsdom |
| Another view's edit while you hold a click Plite already read, or in the page's mouseup handler after it | The click stays, and its caret moves with the edit (R31, R40) | jsdom |
| A change that moves a view's selection outside a press: a text write, a removed or moved block, a replaced leaf or a shifted child list | Claims nothing (R15, R22, R24, R25, R32, R33), in the holder too while focus is elsewhere (R47, R55) | jsdom with focus outside both views |
| A block added or removed anywhere during a press on text | Plite's native-drag guard, which a press on text sets, keeps the DOM-commit export out of the pressed view, so the click stays (R21) | browser spec in three engines; jsdom never sets that guard |
| A click or drag overtaken by code in another view | Its view's bookmark, at a drag's last point; the next key types at the click (cases 2, 8, 9, R12, R27, R37) | jsdom |
| A focused view that does not hold the caret | Shows where its next key goes, after a dropped gesture, any commit in it or Plite focusing it (R20, R45) | jsdom |
| A selection that disappears | Clears the caret of the view that holds it (case 10) | jsdom |
| A selection with no ranges, as Plate's node selection leaves | Not a disappearance; every caret stays (R18) | jsdom with a real `removeAllRanges` |
| Firefox's drag redraw | Runs only while its Editable's last claim or sync stands, so it skips after a veto (R50) or a newer placement (R17) | jsdom with the replay forced; browser spec in Firefox, where page script collapses the drag after mouseup because the find demo does not |
| A shadow-root view | Reads its own tree's selection (case 12, R9, R16). In WebKit, a gesture claims through the `beforeinput` import, also when that import runs after the release settled (R28, C7), an overtaken drag keeps its last probed point (R41) and an echo claims nothing (R19). A native selection with no gesture claims there only through an earlier gesture's observation that no decision has read, while nothing placed since that gesture, and another view's edit during a press goes unnoted | jsdom with the WebKit flag forced; Safari's host fallback is unproven |
| An assistive-technology reselect at the same points | Counts as an echo and claims nothing | jsdom case; a real screen reader is unproven |
| IME composition, Android and the `input`-event fallback | Unchanged; they stay ungated because activation places first | Existing composition cases; devices unproven |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Which design to build | Remember where Plite and text changes put the selection, note when each click starts, and decide from what the page showed when the event came in (look) | Tag each selection Plite writes with the caret it placed, as two designs proposed, which fails the held-click and shadow-root cases, where Plite writes no selection | import owner | big |
| The other view edits the text just as you click, before Plite reads the click | Plite ignores the click and shows the caret where your next key will go; you click again (look) | Move the click along with the edit | map the click | detail |
| A click that code overtook, when its text changed before the view saves it | Dropped, so no saved caret lands in the wrong place (safe) | Move it along with the edits | map outrun | detail |
| A late event from the view that holds the caret, after code placed a newer caret | Ignored (look) | Let it win, as today | holder wins | detail |
| The old check that ignores Plite's own selection writes in the view holding the caret, which the new record could replace | Kept for now, and a later suggested task replaces it (safe) | Replace it in this plan | echo check now | small |
| A selection that lands exactly where the caret already is, with no click or key | Plite treats it as its own write, so no view takes the caret (look) | The view it lands in takes the caret | equal claims | detail |
| Selections copied while typing: the typing fallback, restoring a saved caret and Android | Left as they are, because focusing a view places its caret first (safe) | Check them too | gate typing | detail |
| Multi-range selections and selection direction | Not remembered with the click (safe) | Remember them | keep direction | detail |
| The browser shows no selection on purpose, as Plate does while a block is selected | Every view keeps its caret, as today (safe) | Clear the caret, as when the selection vanishes | empty clears | detail |
| Firefox redraws a drag after you let go, but code moved the caret during the drag | Plite skips the redraw, so the newer caret stays (safe) | Redraw the drag anyway | replay always | detail |
| Three guards that no test can fail: the view holding the caret checks Plite's own writes the old way, a selection read that writes nothing changes nothing, and a gesture waits for its pending event before it closes | Keep all three. The first keeps today's typing guard after a repair, the second stops a read that wrote nothing from shifting which placements count as newer, and the third keeps a gesture open for an event still on its way (look) | Remove all three | cut unproven guards | detail |
| How Plate gets to Plite's selection writer | Plite's public DOM import path exports it, plus a range reader, next to its other DOM helpers, because Plite's internal import path runs without a DOM (look) | A new internal import path for Plite's DOM helpers | internal writer | small |
| A forced selection write, such as from browser automation or after a text commit, when the browser already shows those points | Plite skips it, as it skips any write the browser already shows (safe) | Rebuild the range on every forced write, as today | rebuild forced | detail |
| A selection write that the browser puts somewhere else | Plite remembers where the browser put it and doesn't try again (safe) | Try again with the browser's other way to set a range, as the repair queue and triple click do today | retry writes | detail |
| Ways to slip past the check on direct selection writes | Four still get past it, and review catches them: a cast to a look-alike type, a file named as a test or kept in a test folder, a method name built at runtime on an untyped value, and browser commands that select text with no selection call (look) | Refuse casts from the browser's selection type and scan test files too | strict setter check | detail |
| Which code the check against direct browser-selection writes covers | All of Plate's and Plite's packages except tests, by the type of the object whose method it reads; ranges that code makes itself, such as for measuring, stay allowed (safe) | Only Plite, by method name | setter check plitejs | detail |
| You click at the start of some text, and another view's edit or a page script changes that text | Plite drops the click, because a rewrite of the whole text moves every other click to the start, and Plite can't tell those from a click that was already there (look) | Keep it, which also lets a click the rewrite moved to the start take the caret | note edge | detail |
| What Plite remembers about a selection it wrote into a view that then goes away | Plite forgets it when that view unmounts, so it keeps no removed piece of the page in memory (safe) | Keep it until Plite's next write, since it can't match any live selection | retire record | small |
| Safari, with the editor in a shadow root | Safari hides where the selection sits inside the editor, so another view's edit during a click can move the click (look) | Drop any click whose view changed while you held it | safari drop | detail |
| Typing speed gate | The count test must pass before landing. The timing runs go on the final code; if a busy machine spoils one, it goes to a suggested task and the plan claims no speed until it passes. A clear miss sends the design back (look) | Hold the landing until a quiet machine runs the timing | hold for timing | detail |
| A fourth guard no test could fail: the view holding the caret also checked when a click started if no event had come in yet | Cut, because a decision during a click now records what the page shows first, so the check never changed anything (safe) | Keep it | cut fallback | detail |
| You select text within one frame, about 16 ms, of focusing a view | Plite may put the old caret back over your selection before it reads it, as it did before this plan. Two tests now wait that frame out, and the design question t_13309460 owns the fix (look) | Fix it here, so Plite never writes over a selection it has not read yet | fix export race | small |
| Plite writes the selection in an editor with one view | Plite still reads the selection back once after each write and remembers it, the same as with several views, because the code that writes it can't tell how many views there are. If you add a second view later, Plite still knows which selection it wrote. The one-view typing timing checks what this costs (look) | Skip that read when there is one view. The writer then needs a view check, and a second view added later won't know Plite's last write | lone writes | small |
| An edit moves a click Plite hasn't read yet to the edit's start, such as a page script deleting the text around it, or past inserted or removed text that repeats the text beside it, or two edits to the click's text node in one turn move it | The click still takes the caret where the edit put it, because the text alone can't tell it from a click the edit left in place. Round 1's fix for this dropped clicks that an edit left alone. The design question t_10d9a772 owns it (look) | Drop every unread click that sits at an edit's start, which also drops a click you made there | note text moves | detail |
| A click in a view whose own bubble-phase mousedown handler, in React or the page, or a mousedown listener inside the view, places the caret in that view during the click | The handler's caret wins and Plite drops your click, because Plite counts a placement as the click's own only up to the view's own capture listener, which runs after React's capture handlers and before the bubble-phase ones. Round 1's fix looked again after the click and missed any handler that stops the event. t_c422f5bc owns it (look) | Count those placements as the click's own from a listener that a stopped event still reaches | press handler place | detail |
| Arrow keys that move between sections in a view inside a shadow root | Plite clears the selection through the page's document and records that write there, so the shadow root's view doesn't know the clear was Plite's own. Before this plan the clear recorded nothing. No test found a caret this gets wrong. Round 1's fix read the tree of the last view rendered, which can be another view. t_78091f8f owns it (look) | Clear and record it in the tree of the view that got the key | nav tree | detail |
| The runtime page's link | https://claude.ai/artifact/VVn5MNBokeZVoz39Deh4S6 no longer opens from this account, so the page now lives at https://claude.ai/artifact/TBgmnQqQjBpGCdLdgYWwy1 (look) | Drop the new page, if the old one was deleted on purpose | drop new page | detail |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Write record | An origin flag set before export and cleared once; an 80 ms updating timer | Each Plite selection write records its points and source per tree; the visual-point probe leaves it alone; a type-aware check refuses `Selection` mutators and live `getRangeAt` ranges in every first-party package | Plite DOM `dom/utils/selection-writes.ts` | An origin read when the import runs misses late echoes and the mouseup sync | Internal; every setter in first-party source | Cases 3, 7, R1, R9, R30; the check fails on planted raw mutators and a planted `getRangeAt` | med | rearchitect |
| Commit note | None | Each peer-view Editable observes its own DOM; a change that moved a selection endpoint, judged by the read before Plite's text write, the old text or the child index, records the moved points before the event can arrive, and every import takes pending changes first | Plite React `selection-claim.ts`; DOM `dom-sync-mutation-ownership.ts` | Another view's edit, React's own replacements and a removed or moved block move the selection with no setter, and a change that leaves it in place must not drop a click | Internal | Cases 5, 12, R5, R13 to R15, R22 to R25, R31 to R33, R35, R36, R40, R47, R51, R55 | med | rearchitect |
| Gesture observation | None; the import reads the origin | Per-Editable claim state bound to its element; a gesture lasts until the first decision after its release settles, a frame later; a touch's compatibility mousedown reopens it and a lost release still ends it; its receipt moves with each claim or sync inside it and with the press's own mousedown placement; a decision while it is open with nothing pending first records what the tree shows; opening it supersedes the view's focus request still settling | Plite React `selection-claim.ts`, `editable-dom-runtime.ts`, `root-interaction-controller.ts`; DOM `supersedeFocusRequest` in `dom-editor.ts` | Only an event's age can say whether a newer placement overtook it. The browser changes the selection after some releases, and a sync can read that change before its event arrives. A focus settle requested before the press would write over that change | Internal | Cases 1, 4, 6, 8, 11, R3, R4, R11, R12, R16, R26, R27, R34, R37, R38, R42 to R44, R48, R49, the press-placement case and the two new R37 cases | med | rearchitect |
| Import decision | Each path checks origin and preference itself | One decision on every import path, before the projected branch on the sync path; it changes claim state only when its writer writes, records the selection it judged in its own Editable, reads an open gesture's receipt for the holder, and leaves the holder's echoes of Plite's writes to today's check | Plite React `selection-controller.ts`, `selection-reconciler.ts` | Every import path must agree, and a judged selection must not count as new again | Internal | All twelve cases and every case in Red cases on the throttled and sync paths | med | rearchitect |
| Overtaken gesture | Claimed, or lost | Kept as its view's bookmark, replacing only the gesture's own earlier keep, guarded by text age and open updates | Plite React `selection-claim.ts`; core `keepBookmark` in `view-carets.ts` | A click that code in another view overtakes should type where the user clicked | Internal | Cases 2, 8, 9, R27, R41; the text-change and open-update cases | low | rearchitect |
| Next-key export | Every export writes the live caret into any focused view of its root | An export or a focus into a view that does not hold the caret writes the caret its next key would use | Plite DOM `resolveNextKeyCaret` in `dom-view-caret.ts`, read by React `selection-controller.ts`, `selection-reconciler.ts`, `focus-plite-editable.ts` and DOM `DOMEditor.focus` | A commit or a focus in a view must not show a caret its next key will not use | Internal | R20, R45, the two older export cases and the focus case in Red cases | low | rearchitect |
| Firefox drag redraw | Checks the interaction and the model selection | Runs only while its Editable's last claim or sync stands, through the one writer | Plite React `root-interaction-controller.ts`, `selection-claim.ts` | A redraw after a veto makes the dropped drag look new | Internal | R17, R50 | low | rearchitect |
| WebKit shadow import | Activation places before the probe's import; arrivals and read-backs see the host | The probe skips activation; arrivals record no points; the probe's import records an observation for an open gesture; the record keeps the points Plite wrote | Plite React `editable-dom-runtime.ts`, `selection-claim.ts`; DOM `selection-writes.ts` | The probe's import must decide before anything places, from points of one kind | Internal | R19, R28, R41 | low | rearchitect |
| Shadow tree read | Android composition and the import read through the focused Editable | Each Editable reads its own element's tree | Plite React `android-composition.ts`, `selection-claim.ts` | A shadow root has its own selection, and the focused sibling is not the one that got the event | Internal | Case 12, R9, R16 | low | rearchitect |
| Import cost | No per-event work | A peer check on a lone editor, which runs no observer; with several views, one read and compare per import, one read-back per write, and at most two selection reads per tree per turn of DOM changes | Plite `editor-runtime-view.ts`, React `selection-claim.ts` | Runs on every keystroke, selection event and export | Internal | Count probe and paired timing in Performance gates | med | gate |
| Holder echo check | Origin flag and timer | The write record alone | Plite React `selection-controller.ts` | One echo check instead of two | Internal | The record vetoes the holder's moved and judged selections, while its echoes of Plite's writes keep today's check; moving them needs this plan proven on the final bytes, and a suggested task owns it | low | defer |

## Steps

The Build playbook runs these steps under trunk delivery, where delegates write code and the lead reviews and proves each diff. Each step writes its red cases first, on the tree before the step. Every step that edits code runs the writing passes before its review.

### Before the build

- [x] Restore the twelve red cases and the added cases from the run folder into `packages/plitejs/test/react/view-carets.test.tsx`, add every case Red cases lists that the run folder lacks, update each case whose expected value or setup Red cases changed, leave out R21, which only the browser spec runs, and run them all at this plan's base in a detached worktree. Proof: each case fails at base for the reason Red cases gives, or passes there as a guard, in `proof.mjs` logs.

### Phase 1: one import decision

- [x] Writer: add `writeDOMSelection` with its no-op rule and record sources, route every first-party selection write through it, including Plate's node selection and the Firefox redraw, run `resolveVisualPoint` as its probe, and add the type-aware check. Read `.agents/pstack/rules/reflect.md` first, because the step adds a check. Proof: the check fails on a planted raw `setBaseAndExtent` in a scratch copy of `selection-controller.ts`, a planted `removeAllRanges` in a scratch copy of `NodeSelection.tsx`, a planted `Reflect.apply(selection.modify, …)` outside the probe in a scratch copy of `dom-editor.ts` and a planted `getRangeAt` in a scratch copy of `selection-controller.ts`; it passes on `tx.selection.collapse`, on a cloned range's `collapse` and on the tree.
- [x] Decision: add the peer count, the claim state bound to each Editable, the gesture with its receipt, its settle, the touch reopen and the release listeners, `decideSelectionImport` on every import path with the origin rebind, effects that wait for the writer and the judged-selection record, `keepOvertakenSelection` and `keepBookmark`, the WebKit probe's activation skip and observation, and the tree read in Android composition, with grafts G1 to G7. Proof: every case that a Proof row marked decision names passes, and that row's mutation fails it; the existing `view-carets` suites pass.
- [x] Note: add the note's observer with its movement rules, and its read at Plite's first text write in a turn. Proof: every case that a Proof row marked note names passes, and that row's mutation fails it; the existing `view-carets` suites pass.
- [x] Export: make every export into a view that does not hold the caret write its next-key caret, export when a dropped gesture closes, and gate Firefox's redraw on the last claim. Proof: every case in Red cases passes, every mutation in Proof fails its case, and the existing `view-carets` suites, the `plitejs` react, dom and authored partitions, Plate's node selection tests and the count probe pass.

### Phase 2: browser and cost

- [x] Fix the build misses the spec's runs found, as the decision log's diagnosis rows describe: a press's receipt follows its own mousedown placement, Plite's focus helper writes the next-key caret, a decision during an open gesture records what the tree shows first, and opening a gesture supersedes a focus request still settling. Proof: one jsdom case per fix fails before it and passes after it, each fix's mutation fails its case, a guard case fails when only the layout reconciler exports the live caret, every earlier mutation keeps its result and the export step's gates pass.
- [x] Add case 5, R21, R31, R37, an echo case, a click claim, the deferred root mousedown case and the Firefox redraw case to `apps/www/tests/browser/view-carets.spec.ts`, and run the spec five warm times in Chromium, Firefox and WebKit against a plite-mode server named by `PLAYWRIGHT_BASE_URL`. The caret placement plan's hand drive covers this plan's cases on the find demo. At `0f3a39d1b8`, case 5, R31, R37, the echo case and the Firefox redraw fail in every engine that runs them, and the other three pass and guard. The deferred root mousedown case presses Plate's block gutter, because the find demo has no `useRootChrome` frame to press. Proof: five passes per engine with no retries; a failure in any engine sends the design back to architect.
- [ ] Extend the count probe and run the three paired timings, as Performance gates says. Proof: the count probe passes and its planted arms fail; each timing passes, or is logged inconclusive with a suggested task waiting on this plan and the speed claim left open.

## Performance gates

- **Count probe, deterministic.** It extends `packages/plitejs/test/react/view-caret-work.test.tsx`. On a lone editor, 20 keystrokes, 20 dispatched `selectionchange` imports and 20 mouseup syncs read no claim state, attach no observer and keep no gesture; the added work is one peer check per import and one read-back per Plite selection write, because the writer in `plitejs/dom` does not know how many views there are. With 2, 8 and 32 views, each arrival makes one DOM selection read and one point compare, each decision one read and at most two compares, one with the pending observation and one with the write record, each Plite selection write makes one read-back, each press or caret key that opens a gesture makes one selection read, each import takes each peer observer's pending records once, a decision during an open gesture makes at most two compares, each turn of DOM changes makes at most two selection reads per tree, one at Plite's first text write and one when the note takes its records, however many views and nodes it changes, no import reads another view's claim state unless that view's observer holds records, and 20 keystrokes in the holder keep nothing. Each view count runs as its own case inside the 5-second deadline every test has. The probe fails on a planted removal of the peer check, a planted observer on a lone editor, a planted read of every view's claim state on each import, a planted read-back on every import, a planted selection read per observer record and a planted second record compare during a gesture.
- **Paired timing.** Three operations, each candidate against this plan's base, at most 1.05 on the median, with the frozen estimator, same-code and planted arms, and a load limit of 9: median microseconds per keystroke, per mouseup sync, and per dispatched `selectionchange` through its arrival and its throttled import. Each runs on the lone (1 view over 100 blocks), normal (2 over 100), stress (8 over 500) and pathological (32 over 125) cohorts, as its own protocol under the hour. The keystroke operation's planted arm slows the observer's callback, the arrival operation's slows `observeSelection`, and the mouseup operation's slows `decideSelectionImport`. On the lone cohort, each operation's planted arm slows the peer check instead, because a lone editor runs nothing past it. Each budget line runs on the base first. A conclusive miss sends the design back to architect. An inconclusive run on a loaded host is logged with its next probe and offered as a suggested task that waits on this plan; that task does not hold the close.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Performance pack selected | yes | The import decision adds work to every keystroke, selection event and export in a multi-view editor, and a peer check to a lone one |
| User-facing operation and runtime owner identified | yes | A keystroke, a selection import and an export in a two-view editor; `selection-controller.ts` owns the import paths, and each Editable's observer sees its DOM changes |
| Scale variables and cohorts fixed | yes | Number of views and document size; the four cohorts above plus the lone editor |
| Budget frozen before target measurement | yes | 1.05 on the median, load limit 9, frozen in this plan before any candidate run |
| Baseline and target probe selected | yes | This plan's base in a detached worktree; the target is not built, so the row stays `gate` until Phase 2 |
| Correctness guard selected | yes | Every case in Red cases and the existing `view-carets` suites |
| Production detector decision recorded | N/A | No runtime telemetry owns selection imports |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Slice review | skip | skip: the `push` row owes a panel on the diff, because it changes Plite core | none |
| Blast radius | done | The premise probes proved the fact the design depends on | The decision log's premise probe rows |
| Check steps | done | The `pnpm check` steps the edits reach | `close-checks/check-affected-a1.log` failed 4 of 26 steps: three files needed `oxfmt` and the generated `platejs` turbo state lacked the react partition's new `proxies` reference. After `oxfmt` and `pnpm entrypoint:turbo:generate`, `refix-lint`, `refix-entrypoint`, `refix-turbo-test` and `refix-core` exit 0, and `land.mjs` runs the whole check again |
| Scale rerun | partial | Phase 2's count probe and three paired timings after the last panel fix | The count probe passes 14 of 14 on round 3's fixes (`round3-fixes/final-view-caret-work-a1.log`). The timings wait on t_43ad4bac |
| Browser spec | done | Phase 2's spec, five runs per engine | On round 3's fixes, `round3-browser/spec-chromium-a1.log` passes 45 and skips the 5 Firefox-only runs, `spec-firefox-a1.log` passes 50 and `spec-webkit-a1.log` passes 45 and skips 5, with no retries |
| Docs | done | `plite-dom.mdx` teaches `writeDOMSelection` and `readDOMSelectionRange`, and says Plite compares a later selection with its last write when an editor shows several views | `close-checks/registry-build-a1.log` and `registry-check-a1.log` exit 0 and change no tracked file |
| Hand drive | done | `hand-drive.mjs check` on the plan's files after the last edit | `hand-drive/drive-check-r3-a1.log` covers its 3 cells. drift-1 from round 2's drive never reproduced and stays open with t_13309460 |
| Type-aware lint | done | `oxlint --type-aware` on the task's files before each diff panel round and after the last | Round 1's fixes: `round1-lead/final-oxlint-a1.log`. Round 2's: `round2-fixes/final-oxlint-a1.log`. Round 3's: `round3-fixes/final-oxlint-a1.log`. No warnings or errors |
| Diff panel | done | The `push` panel on the diff before landing, at most three rounds | Round 1 applied ten critical findings. Round 2 reverted the three round 1 fixes it found broken. Round 3, the last, fixed its two critical findings (C6, C7) and applied its warnings |
| Changesets | done | One `plitejs` patch through the `changeset` skill; `platejs` gets none, because its node selection's clear only changes which writer it calls | `.changeset/plitejs-view-carets.md` |

## Proof

One mutation per mechanism, each run on the built tree; each must fail the case it names. The Step column names the first step at which its case can pass, whose proof runs the mutation. `review` marks the fixes from diff panel rounds 1 and 2.

| Step | Mechanism | Mutation | Case that fails |
| --- | --- | --- | --- |
| writer | Raw-setter check | A raw `setBaseAndExtent` in `selection-controller.ts`; a raw `removeAllRanges` in `NodeSelection.tsx`; a `Reflect.apply(selection.modify, …)` outside the probe in `dom-editor.ts`; a `getRangeAt` in `selection-controller.ts` | The check, each time |
| decision | Write record | `writeDOMSelection` writes without recording | Case 3 |
| decision | Visual-point probe | Restore through `writeDOMSelection` | R30 |
| decision | Gesture note | Drop the touchstart listener | R38, whose touch opens with no pointerdown; case 8's event arrives before the placement, so it needs no gesture |
| decision | Touch reopen | Let the compatibility mousedown open its own gesture | R38 |
| decision | Gesture receipt | Take the receipt at arrival instead of keeping the gesture's | R12 |
| decision | Gesture lifetime | Close the gesture at its first decision | R27 |
| decision | Release settle | Settle a release at its own import instead of a frame later | R37 |
| decision | Release close | Keep the gesture open after a release that leaves nothing to judge | R34 |
| export | Close waits for an observation | Close at the settle with an observation pending | None. A gesture forgets `P` when it opens, and in every case jsdom can reach, nothing writes or moves the selection between the release and the queued event. So the settle closes the same way with or without the wait. The plan keeps it so that a write in that window cannot close the gesture before its event |
| decision | Close waits for the selection | Close at the settle when `S` differs from `P` | R37 with the browser's collapse reported after the next frame |
| decision | Lost releases | Listen for releases on the Editable only | A drag released over the page outside its view |
| decision | Blur release | Ignore the window's blur | R42 |
| decision | Receipt re-arm | Keep the gesture's first receipt after a claim inside it | R27's drag after its own claim |
| decision | Keep generation | Refuse any bookmark newer than the receipt | R27 |
| decision | Holder write echoes | Let row 2 veto the holder's echoes of Plite's writes | None in jsdom or the browser spec. The throttled path drops the echo before the decision, and a keydown sync of an echo writes nothing. Kept because row 3 reaches today's `repair-induced` branch, which arms the model-owned text guard during a text insert |
| decision | Effects wait for the writer | Apply a sync's effects when its writer declines | None. In every reachable case, a placement that overtakes the gesture follows the declined sync anyway. Kept so a declined write never moves the gesture's receipt to a generation nothing placed |
| decision | Judged in its own Editable | Record the judged selection wherever it is anchored | R53 |
| decision | Claim past the timer | Let a claim stop at the updating timer | R1, which claims while the timer runs; R54's mouseup sync claims on a path with no timer check |
| decision | Unread observation | Read the points at the gesture instead | R4 |
| decision | Placed since arrival | Ignore `placedSince` | Cases 1 and 6 |
| decision | Batch claim | Ignore the range seen since the last decision | Case 10 |
| decision | Batch claim freshness | Drop `!placedSince(C)` from row 4 | R6 |
| decision | Origin rebind | Run the claim with the stored origin | Case 4 |
| decision | Keep | Drop `keepOvertakenSelection` | Cases 2, 8 and 9 |
| decision | Overtaken echo | Let row 2 veto a selection equal to `P` after a placement overtook a read observation | Cases 8 and 9 |
| decision | Keep text-age guard | Skip it | The text-change case |
| decision | Keep open-update guard | Skip it | The open-update case |
| decision | Expanded projection | Write it without checking the anchor placement | The commit-listener race case |
| decision | Empty selection | Treat zero ranges as a disappearance where the controller reads the selection | R18 |
| decision | Empty selection in the claim state | Read zero ranges as no selection where the claim state reads the tree | None. R18 passes with it (`round1-mutants/mutant-empty-selection-a1.log`). R18 reaches the claim state's read with zero ranges, but `no-selection` and `no-ranges` lead to the same verdicts there, so the mutation changes nothing a case checks |
| decision | WebKit import | Skip the decision in `handleWebKitShadowDOMBeforeInput` | R19 |
| decision | WebKit probe activation | Activate during the probe | R28 |
| decision | WebKit arrival | Record the host's points at arrival | R28 |
| decision | WebKit open drag | Record nothing at the probe's import | R41 |
| decision | Tree read | The claim state reads the document | R16. No jsdom case reaches the Android composition read |
| decision | Editable binding | Resolve the tree through the deepest focused element | R16 |
| note | Commit note | Drop the observer | R13 |
| note | Note timing | Take the records in the export's animation frame instead of the observer's callback | R13. R5 decides after the frame, because its event falls in the throttle window case 5 opened |
| note | Note outside a press | Note only while a press is held | R15 |
| note | Note targets | Record whenever records arrive, whatever their targets | R14 |
| note | Note movement | Record whenever a record's target holds an endpoint | R35 and R36 |
| note | Read before Plite's write | Judge Plite's writes by the old text instead | R35 |
| note | Child index | Count any child-list change in an endpoint's container as a move | R51 |
| note | Note on child lists | Observe text changes only | R22, R24, R25, R32 and R33, each |
| note | Note settle | Skip taking pending records before a decision | R23 |
| note | Note in an open holder gesture | Note the holder only while a press is held | R40 |
| note | Unfocused holder | Skip the note in the holder whatever the focus | R55. R47 passes without the note, because the stale-range guard drops its rewritten point |
| note | Arrival compare | Treat a read observation as current whatever the DOM shows | Cases 8 and 9. In case 5, row 2 vetoes before the decision checks that the observation is current |
| export | Note in a pressed holder | Skip the note in the view that holds the caret | R31 |
| export | Judged selection | Skip recording the selection a decision judged | Swapped case 11 after the first decision, and R26 |
| export | Holder overtaken | Let the holder sync first | Swapped case 11 |
| export | Next-key export | Export the live caret into a focused view that does not hold it | R45, the echo of Plite's DOM export in a view that does not hold the caret, and the page's capture pointerdown that focuses B |
| export | Export after a dropped gesture | Skip it | R20 |
| export | Export while waiting | Export at decisions that leave the gesture open too | R29 |
| export | Redraw after a placement | Skip the placement check | R17 |
| export | Redraw after a veto | Skip the points check | R50 |
| fix | Press placement | Leave the gesture's receipt where its pointerdown took it | The press whose own mousedown places |
| fix | Focus helper's caret | Write the live caret in `DOMEditor.focus` | The focus on B while A holds the caret |
| fix | Arrival inside a decision | Skip recording what the tree shows during an open gesture | R37 with the collapse never reported |
| fix | Layout export's caret | Read the live selection in the layout reconciler | A focused B that renders again with no commit |
| fix | Gesture supersedes focus | Skip superseding the view's focus request when a gesture opens | R37 with a focus request still settling |
| cost | Peer check | Remove the early return | The count probe's lone cohort |
| review | Gesture stops the React focus helper | Skip cancelling `focusPliteEditable`'s frame retries when a gesture opens | A frame focus request on B still settling when a press inside B's expanded selection opens |
| review | React focus helper's caret | Write the live caret in `focusPliteEditable` | A command that changes nothing, run with focus restored on a focused B |
| review | Next-key caret out of a collapsed section | Skip the coverage step in `resolveNextKeyCaret` | A focused named-root view whose parked caret sits in a body it then hides |
| review | A keyup ends only a key gesture | Let any keyup end a press too | A Shift release during a mouse drag in B |
| review | Any keyup ends a key gesture | End a key gesture only on the key that opened it | A Command caret key in B whose only keyup is Command's |
| review | Unmoved gesture closes | Keep the gesture open at its settle while its observation is unread | A caret key that B's handler prevents, and a press that a page's capture handler prevents |
| review | Press follows only its own view | Follow a placement in any view during the press | A press in B whose page capture handler places A |
| review | Movement past the common prefix | Use both ends of the change, as round 1's fix did | C1 and C2 |
| review | Unread observation closes with its gesture | Keep an unread observation when its gesture closes | C5 |
| review | Same-length change | Drop the length check from the prefix rule | C6 |
| review | Unread observation on a host tree | Drop an unread observation at close in a tree that reads as its host too | C7 |
| review | Whole rewrite moves to 0 | Drop the offset-0 rule | A press at 7 that a rewrite of its whole text node moves to 0 |
| review | Turn end at detach | Leave the turn to the unmounted Editable's scheduler | A text write in B after the Editable whose write began the note's turn unmounted |
| review | Export after a keep | Skip the export after a keep with no gesture open | A focused view that keeps a selection a newer placement overtook |
| review | Computed binding names | Resolve only identifier and string binding names | The check's own test with `const { ['removeAllRanges']: clear } = selection` |
| review | Gesture compares | Plant a second record compare during a gesture | The count probe's gesture phase |

## Red cases

The twelve cases fail at `1cb0833e49`, each on an assertion, in the red run the decision log's plan row cites. The removed design passed the first ten.

| # | Case | Expected |
| --- | --- | --- |
| 1 | A selection across content roots queued before a newer equal placement in another view | Claims nothing |
| 2 | A selection across content roots that a newer placement in another view overtakes | Types at its anchor |
| 3 | Repeated echoes of another view's export | The owner stays |
| 4 | A native selection with no gesture long after another view's export | Claims for its view |
| 5 | A gesture queued before an export that places nothing | Does not claim the exported caret |
| 6 | An equal gesture queued before a newer equal placement in another view | Claims nothing |
| 7 | A selection a DOM repair sets equal to the live caret, with no gesture | Claims nothing |
| 8 | A touch that a newer placement in another view overtakes | Types at the touch |
| 9 | A selection queued in a view with an older bookmark, then overtaken | Types at the selection |
| 10 | A selection that disappears right after a queued selection | Clears the caret |
| 11 | A click queued before code places its own view and then another view, released after both | Types at the newer caret |
| 12 | In a shadow root, a press whose selection an edit in another view moves | No claim on release |

The design adds these, from the picked runner's list, the grafts and plan rounds 1 to 3:

| Case | Expected | Guards |
| --- | --- | --- |
| R1: an export that writes nothing because the DOM already shows its point, then B selects 7 in the same throttle window | B claims 7 | A write the page already shows records nothing |
| R2: a native select with no press, then two placements, then typing | Types at the newer placement in that view | The keep guard on the throttled path |
| R3: a press, a select and a release after an echo | B claims | The gesture forgets the write |
| R4: a press, a select with no event, a release | B claims | The unread observation |
| R5: case 5 with a `selectionchange` dispatched after the insert and before the next animation frame | A keeps the caret | The note runs before the event |
| R6: a selection, a newer placement, then the selection disappears | A keeps the caret | Batch claim freshness |
| R7: a cross-root select during a press, then a placement, then the release | B keeps the caret | The decision runs before the projected branch |
| R8: a cross-root select, a placement in its view, then one in another | Types at its view's placement | The projected keep guard |
| R9: case 3 in a shadow root | The owner stays | The record reads the tree |
| R11: an event, then a selection with no event, then an event | A keeps the caret, then B claims it | Act only on reported state |
| R12: B presses, A places before B's queued event arrives, then B releases | B claims nothing; its press becomes its bookmark | The gesture's receipt survives arrival |
| R13: B presses and selects with no event, A's text commit moves B's selection, then the event and the release | B claims nothing | The note covers an unread gesture |
| R14: B drags, the selection moves to a new point, a text commit in another paragraph leaves it there, then the event and the release | B claims the new point | The note records only changes at an endpoint |
| R15: B's selection sits in its DOM, in a block other than A's caret, with focus outside both views, and another view's text commit collapses it | B claims nothing | The note runs outside a press |
| R16: two sibling Editables of one view in separate shadow trees, with a peer view | Each claim state holds only its own tree's selection | The Editable binding |
| R17: a Firefox mouseup redraw after a newer equal placement in another view | No redraw; A keeps the caret | The redraw gate |
| R18: a real `removeAllRanges` in the holder and in another view | Every caret stays; nothing claims | Zero ranges are not a disappearance |
| R19: WebKit shadow host, an echo and a disappear in a view that does not hold the caret | Claims nothing; clears nothing | The decision on the `beforeinput` import and the WebKit clear site |
| R20: after case 5's veto, a key typed in B | Lands where B's DOM shows the caret | The re-export after a veto |
| R21, browser spec only: B presses on text with its event pending, A inserts a block before B's paragraph, then B releases | B holds the caret at its click | Plite's native-drag guard keeps the DOM-commit export out of a view pressed on text |
| R22: B's selection in a paragraph with focus outside both views, A deletes that paragraph, then the event | B claims nothing | The note covers removals |
| R23: B presses and selects 7 with no event, and the page's mouseup handler edits through A, moving B's selection, before the release's sync | B claims nothing | A decision takes pending records first |
| R24: B's selection in a block other than A's caret, with focus outside both views, and a decoration change replaces its leaf, then the event | B claims nothing | The note covers React's own replacements |
| R25: B's selection at an offset in the Editable element with focus outside both views, A inserts a block before it, then separately removes one | B claims nothing, each time | The note covers element-container offsets |
| R26: R4, then A places with its export skipped, then B's queued event and a throttled import | A keeps the caret | A decision records the selection it judged |
| R27: B drags and its first event is decided, A places, the drag goes on through two more decided events a throttle interval apart, then the release | B claims nothing at the release; B's bookmark is the drag's last point | The gesture's receipt lasts the whole drag and moves with its own claim, and its later keep replaces its earlier one |
| R28: WebKit shadow host, B presses and selects while A holds the caret, then the probe's import | B claims at the selection | The probe skips activation, and arrivals record no host points |
| R29: B drags past its last event, the mouseup's import waits for it, then the queued event | B claims the drag's last point; the mouseup wrote nothing | A waiting decision never re-exports |
| R30: after an export into B, which does not hold the caret, a native selection Y in B with no gesture, then a visual-point query in B before Y's event, then the event | B claims Y | The visual probe leaves the record alone |
| R31: B presses at 7 and its event is decided, A inserts text before 7 during the press, then the release | B keeps the caret, moved by the insert, and B's DOM shows it | The note in a pressed holder and the re-export at release |
| R32: B's selection inside a block other than A's caret, with focus outside both views, A moves that block, then the event | B claims nothing | The note covers moved blocks |
| R33: B's selection in an empty paragraph with focus outside both views, A types its first character, then the event | B claims nothing | The note covers the replaced zero-width leaf |
| R34: B presses a caret key, its event is decided, B releases the key, A places, then a native selection with no gesture in B | B claims | A release that leaves nothing to judge closes the gesture |
| R35: B presses at offset 0 of a text node, A inserts text later in that paragraph, which Plite's text sync rewrites, then B's event and release | B claims offset 0 | The note checks Plite's write against its read before it |
| R36: B selects 7 with no event, and the page's mouseup handler appends text to that node | B claims 7 | The note checks that a text change moved the endpoint |
| R37: B presses inside its own expanded selection, A places during the press, B releases, and the browser collapses the selection to the click after mouseup | A keeps the caret; B's next key types at the click | The gesture lasts until a frame after its release |
| R38: B touches, A places, the touch ends, then the browser's compatibility mousedown and mouseup put B's caret at the tap | A keeps the caret; B's next key types at the tap | A compatibility mousedown reopens the touch's gesture |
| R39: B's drag claims at its first event, code places A and then B, the drag moves on with no event, then the mouseup's import | B's placed caret stays | A decision during an open gesture records what the tree shows with the gesture's receipt |
| R40: R23 after the press's first import claimed | B keeps the caret it claimed, moved by the edit | The note covers the holder while its gesture is open |
| R41: R27 on a WebKit shadow host, with two probe imports after A's placement | B's bookmark is the last probed point | The probe's import records an observation for an open gesture |
| R42: R34 with the window losing focus before the keyup | B claims | A blur releases the gesture |
| R43: B's drag claims at its first event, the window loses focus with no mouseup, A places, then a native selection with no gesture in B | B claims | A blur releases a drag whose mouseup never came |
| R44: R43 with the drag ended by a `dragend` | B claims | A `dragend` releases the gesture |
| R45: after case 2's keep, a change commits in B before B's next key | B's DOM shows its bookmark, and the key lands there | An export into a view that does not hold the caret writes its next-key caret |
| R46: A holds the caret with B mounted, a DOM repair writes A's selection, then A types | The text lands as in a lone editor | Typing after a repair in the holder. It passes without the holder's echo check too, as Proof's holder write echoes row says |
| R47: A holds the caret with focus on a button outside both views, and B's edit rewrites A's text node | A's caret stays where the edit mapped it | The note covers a holder while focus is elsewhere |
| R48: R29 with A placing between the release and the queued event | A keeps the caret; B's bookmark is the drag's last point | A gesture stays open while an observation waits |
| R49: B presses a caret key twice in one throttle window and releases it before the trailing event, A places, then the trailing event | A keeps the caret | A gesture stays open while the selection differs from the record |
| R50: a Firefox mouseup redraw after a decision vetoed the drag's later points, with no placement | No redraw | The redraw checks the last claim's points |
| R51: B's selection at an offset in the Editable element with focus outside both views, A inserts a block after that offset, then the event | B claims | The note checks a child-list change's index |
| R52: A holds the caret and the listener notifies A first, then a native selection with no gesture lands in B | B claims | A decision whose writer declines changes nothing |
| R53: R52 with a placement in A's view between the arrival and both decisions | B's next key types at the selection | A decision records only a selection in its own Editable |
| R54: a DOM-commit export into B, then a click in B within 80 ms | B claims | A claim runs past the updating timer |
| R55: A holds the caret with focus on a button outside both views, and B's edit merges away the block that holds A's caret, then the event | A's caret stays where the edit mapped it | The note covers a holder while focus is elsewhere |
| The echo of Plite's DOM export in a view that does not hold the caret, with B focused and its bookmark at 8 | B's DOM shows 8, and the echo leaves the owner alone | An export into a view that does not hold the caret writes its next-key caret |
| A page's capture pointerdown that focuses B, which has a bookmark at 8, and prevents the press | Nothing restores or publishes, and B's DOM shows 8 | An export into a view that does not hold the caret writes its next-key caret |
| Swapped case 11, B placed at 9 then A at 7, once before the press's first decision and once after it | Types at A's caret, and A's DOM shows it | The holder's late event is ignored, and the judged selection is recorded |
| A commit listener that places during an expanded import | The listener's placement stays, and A keeps no view selection | The expanded write checks its anchor placement |
| A kept gesture whose text changed since arrival | No bookmark | The text-age guard |
| A kept gesture inside an update that rolls back, with A's earlier bookmark at 8 | No bookmark; the view restores its earlier bookmark | The open-update guard, because a committed update replaces the carets a keep wrote inside it and only a rollback leaves them |
| R37 with the browser's collapse reported after the next frame | A keeps the caret; B's next key types at the click | A gesture stays open while the selection differs from the record |
| A drag in B that claimed at its first event, released over the page outside B, then A placing, then a native selection with no gesture in B | B claims | Releases are heard on the document |
| A `beforeinput` fallback import in a view that does not hold the caret | Unchanged from base | Typing paths stay ungated |
| An assistive-technology reselect at the same points | Claims nothing | The equal-points boundary |
| A press in B whose own mousedown places the press point, then a drag in B | B keeps the drag's imports and types over it | A press's receipt follows its own mousedown placement |
| `DOMEditor.focus` on B while A holds the caret and B has a bookmark at 7 | B's DOM shows 7, not A's caret | Plite's focus helper writes the next-key caret |
| R37 with the browser's collapse never reported, judged by the release's own sync | A keeps the caret, and B's next key types at the click | A decision during an open gesture records what the tree shows first |
| A focused B that renders again with no commit while A holds the caret and B shows its bookmark at 7 | B's DOM still shows 7 | The layout reconciler writes the next-key caret. The case passes at `8313690e4f` too, where `readExportedSelection` already wrote it |
| R37 with a focus request on B still settling when the press opens, whose settle lands after the collapse and before any decision | A keeps the caret, and B's next key types at the click | Opening a gesture supersedes the focus request |

Diff panel round 1 adds these. Each fails at `286d701eb4` on its own assertion, except the Command and whole-rewrite cases, which pass there. Those two fail on the round's first version of their fixes, which their Proof rows' mutations put back. Round 2 cut the bubble-phase press case and the delete-around case with the fixes it reverted.

| Case | Expected | Guards |
| --- | --- | --- |
| R37 with a focus request through React's focus helper on B still settling when the press opens, and the browser's collapse a frame later | B's next key types at the click | Opening a gesture stops the React helper's frame retries too |
| A command that changes nothing, run with focus restored on a focused B with its bookmark at 7, while A holds the caret at 1 | B's DOM shows 7 | React's focus helper writes the next-key caret |
| A focused view whose parked caret sits in a section body that the view then collapses, while another view holds the caret | Before any key, its DOM caret sits at the end of the section's title, where its next key lands | The next-key caret moves out of a section the view collapsed |
| Cases 8 and 9's keep in a focused view, with no gesture open | The view's DOM shows the kept caret before its next key | A keep with no gesture open exports |
| B drags and an import judges it, a Shift keyup arrives while the button is held, A places, then the drag's next selection | A keeps the caret | A keyup ends only a key gesture |
| A caret key that B's own key handler prevents without moving the selection, released and settled, then A places, then a native selection with no gesture in B | B claims | A gesture whose input moved nothing closes at its settle |
| R34 with Command held, so the only keyup is Command's, as macOS sends it | B claims | Any keyup ends a key gesture |
| A press in B that a page's capture handler prevents, placing nothing, released and settled, then A places, then a native selection with no gesture in B | B claims | A gesture whose input moved nothing closes at its settle |
| A press in B whose page capture handler places A with the export skipped, then B's selection from that press | A keeps the caret | A press's receipt follows only placements in its own view |
| B's unreported caret at 7, which the page's mouseup handler moves to 0 by rewriting its whole text node | B claims nothing | A rewrite of the whole node moves the caret to 0 |
| Three views; Plite's text write in A begins the note's turn, A unmounts before the turn ends, then B writes with B's caret at the start of the written text | B claims | A detaching Editable ends the note turn it began. The case calls `markDOMSyncMutationTarget` on A's text node itself, so it stands in for Plite's text sync |

Diff panel round 2 adds these. C1, C2 and C5 fail at `8754eee002` on their own assertions and pass on the round's fixes. C3 was the seats' probe, the bubble-phase press case with a handler that stops the event, which fails both before and after the revert (Defaults "press handler place"). C4 ran keyboard navigation in a document view of an editor whose shadow-root view rendered last. It passes at `8754eee002` in jsdom, because the keydown's own export clears the document's selection anyway and no import reads the record filed under the wrong tree, so the navigation revert has no case.

| Case | Expected | Guards |
| --- | --- | --- |
| C1: B's unreported caret at 4, which the page's mouseup handler moves to 5 by inserting a repeated character before it, with A's caret in another paragraph | B claims nothing | The note counts an offset past the common prefix as moved |
| C2: B's unreported caret at 5, which the page's mouseup handler leaves at 5 by deleting the text after it, with A's caret in another paragraph | B claims at 5 | The note leaves a caret at a deletion's start in place |
| C5: a caret key that B's handler prevents settles with nothing read, A places, then a press from outside B is released in B | B claims the press's selection | Closing a gesture drops its unread observation |

Diff panel round 3 adds these. Each fails at `e3352665` on its own assertion and passes on the round's fixes, and C7 fails again with only its fix's condition removed.

| Case | Expected | Guards |
| --- | --- | --- |
| C6: B's unreported caret at 7, which the page's mouseup handler leaves at 7 by replacing one character before it with one, with A's caret in another paragraph | B claims at 7 | A change of the same length moves no point past the common prefix |
| C7: in a WebKit shadow root, a press and select in B while A holds the caret, released and settled before its first `selectionchange` | B claims at the selection through the probe's import | A tree that reads as its host keeps the gesture's unread observation at close |

jsdom limits what some of these greens prove. At `0f3a39d1b8`, 48 of the file's 166 tests fail on their expected values, and R3, R4, R6, R8, R11, R14, R16, R18, R20, R28, R29, R34 to R36, R42 to R44, R46, R47, R51, R52, R54, the commit-listener race, the text-change keep, the drag released outside B and the `beforeinput` fallback pass there, so at base they only guard against regressions; their mutations in Proof show that the design is what makes them pass. The reselect is a `removeAllRanges` and `addRange` with no screen reader, and the shadow-tree fake has no Safari host fallback. In jsdom a focused view's DOM-commit export rewrites its selection before the event, and Plite's native-drag guard never turns on, so the cases that isolate the note move focus outside both views, and R21 runs only in the browser spec. The stale-range guard in `importDOMSelectionChange` drops a moved point that lands before the live caret in its block, in browsers too. So R15, R24 and R32 put B's selection in another block. R47 passes without the note, and R55 deletes the holder's block instead. R37 and R38 dispatch the browser's change on release and its compatibility events by hand, so the browser spec proves R37's order and R38 stays unproven on devices. The deferred root mousedown case cannot fail in jsdom, because the deferred restore writes the DOM before the late import reads it, so it runs only in the browser spec. R19, R28 and R41 force the WebKit host flag and stub `execCommand`, so they do not prove Safari.

## Evidence

### Requirements

- The ask: decide which state each view of one root owns. The first plan gave each view its own caret; this plan decides which view a native selection belongs to.
- `VISION.md:60` gives mounted-view presentation its own owner, and `docs/vision/plite.md:318-321` keeps one live selection per document, so a view's own caret is a bookmark, never a second live selection.
- Plite's export, a DOM repair, and any change to a view's DOM that moves its selection claim nothing for any view, however many events they cause. The exceptions are the text changes the note cannot see (Defaults "note text moves") and another view's edit during a press in a WebKit shadow root, where the note records nothing.
- A gesture, or a native selection Plite did not write or move, claims the caret for its view.
- An event that arrived before a newer placement never takes the caret back, on every import path.
- A gesture lasts until the browser has applied its release's own change to the selection.
- A selection a decision already judged never counts as new again.
- An overtaken gesture becomes its own view's bookmark, never replacing a newer one.
- A selection that disappears clears the holder's caret and never another view's; a selection with no ranges clears nothing.
- A shadow-root view decides from the selection of its own tree.
- What a focused view shows is where its next key lands, after a dropped gesture or any commit in it.
- The existing `view-carets` suites, the count probe and the browser spec stay green.

### Lanes

- **Keep the tree as it is.** The control adds nothing and fails all twelve cases.
- **Restore the removed design.** It passed ten and failed cases 11 and 12; the caret placement plan cut it after its one replacement.
- **Claim on arrival.** Committing on every event means a commit per drag step, and echoes still need telling apart.
- **One live selection per view.** It breaks `docs/vision/plite.md:318-321`.
- **One import owner that credits each export with its placement**, from two runners. In cases 5 and 12 no export runs, so it credits nothing and both still fail. One variant ignores every event older than the newest generation handed out, so a draft that never commits cancels a real click.
- **Note the commit in the export's animation frame, only during a press**, as the picked runner wrote it. A browser fires `selectionchange` from a task, which usually runs before the next frame, so the release still claims the moved point. Plan round 1 replaced it.
- **Hook each of Plite's DOM writers**, as plan round 1 revised it: text-write marks and node unbinds. React writes text it does not sync itself, swaps leaves without an unbind and moves blocks with `insertBefore`, so plan round 2 replaced the hooks with one observer per view.
- **Read the selection around the React commit fence** (`editable-dom-commit-fence.tsx`). It brackets only commits in which the fence updates, and a component that subscribes to its own node's decorations commits without it (`decoration-context.tsx:41`, `use-claim-editable-dom-commit.ts:39`).
- **Close a gesture at its release's own decision**, as plan round 2 wrote it. The browser collapses a plain click and places a tap's caret after the release's handlers run, so that change arrived with no gesture and claimed over a newer placement. Plan round 3 moved the close to a frame after the release.
- **Skip every export into a pressed view.** A press on a void or a table cell places the model's selection during the press, and the export draws it; Plite's native-drag guard already skips the export during a press on text.
- **Keep the write record after its view unmounts**, as plan round 3 chose, because a record whose endpoints left the document never equals a live selection. But it kept the removed DOM in memory, so after diff panel round 1 Plite forgets it when its view unmounts.
- **Merge the holder's echo check into the write record now**, the strongest merger. The record now vetoes the holder's echoes, but deleting the origin flag and the 80 ms timer changes the holder's typing path, which needs this plan's record proven first; a suggested task owns it.
- **The pick**, the record plus per-Editable claims, scored 22 of 24 by the lead and first by the blind judge, with grafts from the other runners and plan rounds 1 and 2's fixes.

This plan cuts no code, so it predicts no cut benefit. Proof limits: the browser spec checks that each engine fires the selection event after the note; Safari shadow roots, real screen readers and Android devices are unproven.

### Dependents

- `ui`: unaffected. `apps/www/src/app/(app)/examples/plite/plite-example-client.tsx` renders examples through the public Editable, whose exports this plan leaves alone.
- `platejs`: `NodeSelection.tsx` clears the native selection through `writeDOMSelection`, and the static copy reads its range through `readDOMSelectionRange`, both from `plitejs/dom`; their behavior is unchanged.

This review retains [2026-10-20-runtime-view-state](2026-10-20-runtime-view-state.md), whose Pursue on per-view carets stands, and continues the [caret placement plan](2026-10-20-view-caret-placement.md), whose selection import row it replans. It read the four upstream checkouts at the commits in `review_upstreams`, source only.

Model: claude-opus-5-5

## Challenge delta

Plan round 1 ran Opus, Astra and Sol on the plan as first written, and its revision applied every critical finding:

- The claim functions resolved the tree through the focused Editable, so a sibling in another shadow tree could fill the wrong claim state (Astra, Sol). Each Editable now binds its claim state to its own element (R16).
- The picked design noted a commit one animation frame late, after the `selectionchange` it must precede, skipped a gesture whose event had not arrived, and never noted a commit outside a press (Opus, Astra, Sol). The note moved into the commit itself (R5, R13 to R15).
- An arrival replaced an unread gesture's receipt with a later one, so a press that a placement overtook looked fresh (Astra). Observations keep the gesture's receipt (R12).
- The Firefox redraw could restore a dropped drag through raw setters, and its event looked new (Astra, Sol). It runs through the one writer, behind a gate (R17).
- Rule 3 had lost the batch claim's freshness check, and rules 1 to 7 restated the runner's table with less in it (Opus, Astra, Sol). Design holds the runner's table with its sinks, the meaning of current and what each verdict consumes.
- No case covered a selection with zero ranges (Astra). It is not a disappearance (R18).

Round 1 also applied its warnings: the WebKit `beforeinput` import asks the decision (R19), the raw-setter check covers every first-party package, the record retires on unmount, a timing gate covers selection arrival, a claim rebinds the origin once, and a focused view shows the caret its next key will use after a veto (R20).

Plan round 2 ran Astra and Sol, and Opus through its Agent rerun, on that revision, and this revision applies every critical finding:

- The note hooked Plite's text writes and node unbinds, so React's own text and leaf replacements, a moved block, a repair and a child-list change that shifts an element offset all moved a selection unseen (Opus, Astra, Sol). Each peer-view Editable now observes its own DOM (R22, R24, R25, R32, R33).
- A press claims at its first event, because the import throttle fires on its leading edge, so the holder synced the point another view's edit pushed its caret to (Opus). The holder now checks the record too, the note covers a holder under a held press, and the release writes the moved caret back (R31).
- The note settled in a microtask, so the mouseup sync after the page's own handler edited read the moved selection as fresh (Sol). Every arrival and decision takes pending records first (R23).
- Consuming an observation erased what later imports needed. The holder's second import synced a vetoed selection, a delayed event looked fresh, and a drag claimed after its first keep or its own first claim (Opus, Astra, Sol). A decision now records the selection it judged, and a gesture's receipt lasts until a decision after its release, moving with each claim or sync inside it (R26, R27, swapped case 11).
- Row 7's wait re-exported the caret over the selection whose event it waited for (Astra, Sol). Only a decision after the release writes (R29).
- In a WebKit shadow root, activation placed before the probe's import, and arrivals stored host points that the inner target range never matches (Astra, Sol). The probe skips activation, arrivals there record no points, and the record keeps the points Plite wrote (R28).
- `resolveVisualPoint` moves the selection through an extracted `Selection.modify` the check missed, and its restore left a stale record (Astra). It runs as one probe that leaves the record alone, and the check reads every mutator by type (R30).

Round 2 also applied its warnings: the record retires once its endpoints leave the document, the re-export waits for the release and covers row 2 vetoes, Defaults names Safari's wider loss, a keystroke timing covers the lone editor, and a claim needs a range in its own Editable. Driving R12 to R22 at base showed that a focused view's DOM-commit export rewrites a pressed view's selection, so R21's expected value now matches base, and the note's cases move focus outside both views.

Plan round 3 ran Astra and Sol, and Opus through its Agent rerun, on that revision. It was the last plan round, so this revision applies every critical finding and the build follows:

- The gesture closed at its release's own decision, before the browser collapsed a plain click inside a selection or placed a tap's caret, so that change arrived with no gesture and claimed over a newer placement (Opus). A release now settles a frame later, and a touch's compatibility mousedown reopens the touch's gesture (R37, R38).
- A gesture whose release never reached the page stayed open, so later selections with no gesture took its old receipt (Opus, Astra, Sol). Listeners on the document and the window now receive every release, including blur, a hidden page and `dragend` (R42 to R44).
- The previous owner's listener ran first and recorded the new view's selection as judged, so the new view vetoed its own fresh selection (Astra, Sol). A decision records only a selection in its own Editable, and changes nothing when its writer declines (R52, R53).
- The holder's decision read only the observation's receipt, so a drag that went on after its first decision synced over a newer placement at mouseup (Astra). It reads an open gesture's receipt too (R39).
- A keep stamped the bookmark with the newer generation, so the same drag's next keep refused (Astra, Sol). A keep may replace the gesture's own earlier keep (R27).
- The note took any change to a node that held an endpoint for a move, so an append after a click, or a rewrite that left a click at offset 0, dropped it (Astra, Sol, Opus). The note now checks that an endpoint moved, against its read before Plite's text write, the old text or the child index (R35, R36, R51).
- In WebKit, a drag lost its observation after its first decision, so it kept no bookmark (Astra, Opus). The probe's import records an observation for an open gesture (R41).
- R30 could not fail its named mutation (Astra, Sol). It now selects fresh points before the probe.
- The note skipped the holder once its press was released, so the page's mouseup handler moved a claimed press unseen (Sol). The note covers the holder while its gesture is open, and while focus is outside its Editable (R40, R47).
- The DOM-commit export drew the live caret into a focused view that did not hold it, while that view's next key typed at its bookmark (Opus). Every export into such a view writes the caret its next key would use (R45).

Round 3 also applied its warnings. The raw-setter check names its set, so ranges that code creates or clones stay free. The holder's echoes of Plite's writes keep today's check (R46). R21 moved to the browser spec, because only jsdom lacks the native-drag guard that keeps the export out of a pressed view, and the Defaults row "keep the press" is gone. R48 and R49 check that a gesture waits for a pending event and for the selection to match the record. A decision's effects wait for its writer (R52), and a claim passes the updating timer (R54). The lone timings plant their slowdown in the peer check, Phase 1 splits into four steps, and the Firefox redraw checks the last claim, which outlives the gesture (R50). A record whose endpoints left the document never equals a live selection, so no case can tell retirement apart, and this revision cuts it.

Diff panel round 1 ran Opus, Astra and Sol on the build at `286d701eb4`, and this revision applies every critical finding:

- Opening a gesture stopped `DOMEditor.focus`'s retries but not React's focus helper's, so a frame retry could put B's old selection back after the browser collapsed a click (Astra). Opening a gesture now stops both.
- React's focus helper wrote the live caret into a focused view that does not hold it, and no writer moved a parked caret out of a section its view collapsed, so the DOM and the next key disagreed (Astra, Sol, Opus). `resolveNextKeyCaret` in `dom-view-caret.ts` gives all four writers the caret activation would use.
- Any keyup ended a press, so a Shift release during a drag let the drag's later selection claim over a newer placement (Astra). A keyup now ends only a key gesture. The fix first matched the key that opened the gesture. On macOS a Command arrow sends only Command's keyup, which left its gesture open, so now any keyup ends a key gesture.
- A gesture whose input moved nothing, such as a prevented key or press, stayed open, so a later selection with no gesture was kept instead of claiming (Astra, Sol, Opus). It now closes at its settle when the tree still shows what it showed when the gesture opened.
- A press's receipt followed a placement in any view during the press, and missed one that its own view's bubble handlers made (Astra, Opus). It now follows only placements in its own view. Its second check after the press's whole dispatch is gone, as Diff panel round 2 says.
- The note counted an endpoint as moved only past the common prefix, so a delete around a click moved it unnoticed (Astra). The fix used both ends of the change, as the DOM moves live ranges, and Diff panel round 2 reverted it. It first dropped the offset-0 rule that Defaults "note edge" keeps, and the lead put it back.
- An Editable that unmounted while its scheduler held the note's turn end left the turn's read in place, so the note judged a later write in another view against stale text (Astra, Opus). Detaching ends the turn it began.
- A decision during an open gesture compared three times, and the count probe never opened a gesture (Sol, Opus, Astra). A decision compares at most twice, and the probe counts phases with a press and a caret key open.
- The browser spec read only the DOM caret, so its echo and R37 cases passed at base and could not see which view held the caret (Astra, Opus). Both now read the live caret through the view editor, and both, with case 5 rerun after its edit, fail at `0f3a39d1b8` in every engine.

Round 1 also applied its warnings: a keep with no gesture open exports, the check resolves computed binding names, and Plite forgets the write record when its view unmounts. Its fix that wrote keyboard navigation's clear into the navigating view's tree read the wrong view, and Diff panel round 2 reverted it. It cut row 3's fallback to the gesture's receipt, which no path reached with any effect. It dismissed four. The base's catches around two writes could not run, because the restore checks both endpoints are inside the root and clamps each offset, and the triple click writes a live range's own points. The repair queue's retry is gone by Defaults "retry writes". Polling each peer observer stays, because a flag set by the observer's callback cannot see records queued before that callback runs, and the count probe now bounds it at one poll per peer observer per import. The frame-export race that t_13309460 owns fails the same way at `0f3a39d1b8`.

Diff panel round 2 ran Opus, Astra and Sol on round 1's fixes at `8754eee002`. Each of its critical findings hit code that a round 1 fix added, so this revision puts back the code round 1 reviewed at `286d701eb4` and narrows the claim:

- Round 1's note rule used both ends of a text change. It missed a caret that an insert moved inside a run of one repeated character (Astra), and it dropped a click at a deletion's start that the deletion left in place (Sol). The two texts cannot tell a caret a deletion collapsed to its start from one that sat there, so no rule over them gets both right. The note is back to the common prefix rule, C1 and C2 guard it, and Defaults "note text moves" says what it misses.
- The window's bubble listener, which followed a press's own placements after its whole dispatch, never ran for a mousedown whose propagation a handler stopped (Astra, Sol, Opus). The listener is gone, and Defaults "press handler place" says what that gives up.
- Keyboard navigation's clear read its tree from the last Editable rendered for the editor, which can be another view in a shadow root (Astra, Sol). It is back to the page's document, and Defaults "nav tree" says what that gives up.

Round 2 also applied one warning: closing a gesture left its unread observation behind with the old receipt, so a later selection with no gesture was kept instead of claiming (Opus, C5). Suggested tasks own the rest. The focus registry that a gesture cancels keeps finished requests and their Editable alive (Astra, Sol), which t_f2e79968 owns. The note's other misses, two records on one node and a change inside a repeated run (Opus), go to t_10d9a772 with the limit above. A right-click press whose menu takes the mouseup stays open, a touch's compatibility mousedown cancels its own focus retries, and a released touch keeps another view's DOM (Opus, Astra), which t_c422f5bc owns with the press limit. A keep with no gesture exports into a view that is not focused (Opus), which t_13309460 owns. The Proof row for an empty selection now splits its two mutations, and the detach case says it stands in for Plite's text sync (Opus).

Diff panel round 3, the last, ran Opus, Astra and Sol on round 2's fixes at `e3352665`. It found two critical defects, and this revision fixes both:

- The restored prefix rule counted a caret as moved when a change of the same length before it left the caret in place, so it dropped that click (Astra, Sol, Opus). A same-length change moves no point past the prefix, so the prefix rule now also needs the length to change (C6).
- Closing a gesture dropped its unread observation in a WebKit shadow root too. There the settle compares two readings of the host, and only a later probe import reads the gesture's points, so a probe that ran after the release settled vetoed the press (Astra, Opus). A tree that reads as its host keeps that observation (C7).

Round 3's warnings said Teach and Requirements still promised what the reverts gave up (Sol, Astra), and both now name the limits. Opus corrected four lines. The note misses more than a repeated run, its offset-0 rule drops a click after any edit to the node, React's capture handlers do count as the click's own, and keyboard navigation's clear misses every shadow-root view. Its nit that `followPressPlacement`'s two guards were dead was half right. A caret key during a tap opens a key gesture while the pointer is still pressed, so the kind check stays and only the released check went.

## Design

`decideSelectionImport(editor, editable, claims, sink)` runs on every import path: in `applyEditableDOMSelectionChange` after the zero-range return and before the origin read, in `syncEditorSelectionFromDOM` before the projected branch, in `handleWebKitShadowDOMBeforeInput` before `tx.selection.set`, and at the two disappear sites, the WebKit host clear and the null branch, with `'disappear'`. `editable` is the Editable that got the event, and its tree is `editable.getRootNode()`. Before it reads anything else, it takes the note's pending records.

Its inputs:

- `S`, the selection of the Editable's tree: `no-selection` when there is no selection object, `no-ranges` when it has zero ranges, or its anchor and focus points.
- `O`, the claim state's observation: its points, or `unread` when its gesture's event has not arrived, and its receipt.
- `G`, the Editable's open gesture: its receipt, its pointer, whether its release has come and whether that release has settled.
- `C`, the receipt of a range observed since the last decision, or none.
- `P`, the tree's write record: the points of whichever came last, with their source. `write` is a selection Plite wrote, `moved` a selection a DOM change moved, and `judged` a selection that a decision consuming `O` judged in its own Editable.
- `placedSince(r)`, true when the placement generation passed `r`. It reads an open update's caret, so a placement inside an open update counts and one in a rolled-back draft does not.

`O` is current when `S` equals its points, or when it is unread and `S` is a range that is not `P`.

The first row that matches decides. A sync or claim whose writer declines to write, as the importer does for points outside its Editable, changes no claim state. Every other decision consumes `C`, which ends a batch. One that consumes `O` also records `S` as a `judged` `P` when `S` is a range anchored in this Editable's element. A claim or sync while `G` is open moves `G`'s receipt to the generation it minted.

| # | Sink | Condition | Verdict | Effect |
| --- | --- | --- | --- | --- |
| 1 | any | No peer views | sync | Today's path; reads nothing else |
| 2 | any | `S` equals `P`, unless this view holds the caret and `P` is a `write`, or `O` was read, is not current and `placedSince(O.receipt)`, because the placement that overtook `O` then wrote this tree | veto | A DOM change moved this selection, Plite wrote it into a view that does not hold the caret, or a decision already judged it; consumes `O` |
| 3 | any | This view holds the caret, or no view does | veto when `placedSince(O.receipt)` (G3), else sync | Consumes `O`. A decision while `G` is open records `O` first, with `G`'s receipt, so a drag that went on after its first decision is judged by its gesture (R39). The holder's echoes of Plite's writes reach today's origin check here |
| 4 | disappear | `S` is `no-selection` and equals `O`'s points, `C` is set and not `placedSince(C)` | clear | Clears as this view; the holder's caret becomes its bookmark; consumes `O` |
| 5 | place | `O` is current, not `placedSince(O.receipt)`, and `S` is a range anchored in this Editable's element | claim | The writer runs as a user selection: origin `'native-user'`, past the updating timer, every other guard as before (G1); consumes `O` |
| 6 | place | `O` exists and `placedSince(O.receipt)` | kept, or veto when the keep refuses | `keepOvertakenSelection(view, current ? S : O's points, O.receipt)`; consumes `O` |
| 7 | any | Anything else | veto | Keeps `O` for its event and writes nothing |

A keep refuses for `unread`, `no-selection` or `no-ranges` points, inside an open update (G6), when the gesture's text changed since arrival (G5), and, in `keepBookmark`, when the view holds the caret or keeps a bookmark newer than both the receipt and the generation of `G`'s last keep, so a drag's later keep replaces its earlier one. A keep leaves `G`'s receipt alone. The sync path writes an expanded projection only while its anchor placement is still current (G4).

Every export into a view that does not hold the caret writes the caret that view's next key would use: its bookmark, else the live caret when its view shows it, else nothing. An export into the holder writes the live caret, as today. The layout reconciler's export, `DOMEditor.focus` and the `focusPliteEditable` helper write the same caret, so a layout pass or a focus never replaces a bookmark with the live caret. One function, `resolveNextKeyCaret` in `dom/plugin/dom-view-caret.ts`, owns that caret for all four. It moves a caret inside a section that the view's own coverage collapsed to the end of that section's title, as activation does, so the export shows where the next key lands; it lives in the DOM layer because coverage does. When `G` closes after a decision in it dropped the gesture, through row 2, row 3's veto or row 6, the focused view runs its export outside a composition. A keep in row 6 with no open `G` exports at once. A decision that judges again a selection `G` already judged keeps `G`'s earlier outcome, so a mouseup that judges its own claim again does not drop the gesture. A decision that leaves `G` open writes nothing. So what a focused view shows is where its next key lands, after a dropped gesture (R20) and after any commit in it (R45).

The claim state's operations:

- **Arrival.** In the `selectionchange` callback of the Editable that registered it. A lone editor returns. It takes the note's pending records first. When `S` equals `P`, it records nothing, so an echo never replaces a pending observation. Otherwise it sets `O`'s points to `S`, with `G`'s receipt while `G` is open or the current generation, and sets `C` to that receipt when `S` is a range whose anchor is in the runtime root. In a WebKit shadow root it records nothing, because WebKit reports the host's points there. A decision while `G` is open with no observation pending runs the same arrival first, with `G`'s receipt, because a direct sync can run after the browser changed the selection and before its event, as the root's mouseup capture does at a release's settle frame (R37).
- **Gesture.** In a peer-view editor, a press or a caret key after `activateViewCaret` opens `G` at the current generation, reads `S` once and keeps it on `G`, forgets `P` for the tree and sets `O` unread with `G`'s receipt. A press starts at the window's pointerdown, or at a mousedown or touchstart that no pointerdown started, and replaces an open gesture. A plain press places its point at mousedown, through the root's drag-anchor collapse in its capture handler, after the pointerdown opened `G`. So while its view holds the caret, the Editable's own capture listener for that mousedown or touchstart moves `G`'s receipt, and its unread `O`'s, to the current generation. A placement that React's or the page's mousedown handlers make after that listener, in this view or another, is newer than the press (Defaults "press handler place"). Opening `G` also stops every focus request on its view that is still settling, `DOMEditor.focus`'s retries and the frame and timeout retries of `focusPliteEditableAfterEventFrame`, so a focus settle requested before the press never writes over the browser's change during it (R37 in Firefox). A mousedown after a touch's release, with no pointerdown of its own, is that touch's compatibility event, so it reopens the touch's gesture with the touch's receipt (R38). Capture-phase listeners on the document end a press at mouseup, pointerup, touchend, touchcancel, pointercancel and `dragend`, and a key gesture at any keyup, because macOS sends no keyup for an arrow pressed while Command is held. A keyup never ends a press, such as a Shift released during a drag. The window ends either kind at blur and when the page hides (R42 to R44). A release settles at the next animation frame, after the browser applied its own change to the selection, such as collapsing a plain click inside a selection (R37). `G` closes at the first decision after the settle that consumes `O`, or at the settle when no observation is pending and `S` equals `P`, or when `O` is still unread and `S` still equals what it was when `G` opened, because then the input moved nothing, as with a prevented key or press. Closing `G` drops `O` while it is still unread. So a later selection with no gesture never takes an old gesture's receipt (R34, R48, R49, C5). A tree that reads as its host keeps that `O`, because its settle compares two readings of the host and only a later probe import reads the gesture's points (C7). A press is held from its start to its release.
- **Commit note.** While its editor has peer views, each Editable observes its own element for text and child-list changes, with the old text, whoever makes them: Plite's text sync, React's commits, a repair or a page script. Its records arrive in a microtask before any `selectionchange` task, and an arrival or a decision takes pending records first with `takeRecords`. The note runs unless this view holds the caret, its tree's active element is inside its Editable and it has no open gesture, because there the browser's own typing moves the caret and the DOM-commit export repairs the rest (R31, R40, R47, R55). It records `S` as a `moved` `P` when a record shows that an endpoint of `S` moved, by the rules below. A change in another node leaves `S`'s containers out of the records and records nothing (R14). A turn ends when the note takes its records, at the latest in a microtask after Plite's first text write in it, scheduled through the Editable whose write began the turn. When that Editable detaches first, the turn ends right there, while its observer still holds the turn's records. The note reads `S` at most twice per tree per turn. In a WebKit shadow root, `S` reads as the host, so the note records nothing there.

For the note, an endpoint moved when:

- Plite's text sync wrote its node, and `S` differs from the note's read at the turn's first `markDOMSyncMutationTarget`, which Plite's text sync calls before it writes, even while its marking is paused (R35). Plite's child-list writes follow the child-list rule.
- Another text change hit its node, the old and new text differ in length, and the offset `k` is past their common prefix. A change of the same length moves a point inside it to its start, which is at or before the prefix, and leaves every later point in place, so only a change of length can move a point past the prefix (C6). It also moved when `k` is 0 and the old text was not empty, because a whole rewrite, such as React's `nodeValue` write, moves every offset to 0. That rule drops a click at offset 0 after any edit to its node (R36, C1, C2 and the whole-rewrite case). The two texts cannot always say where a change happened. A caret that a deletion collapsed to its start reads the same as one that sat there, and a change that repeats the text beside it can read as one past it. The note judges each record against the node's final text, so two records on one node in one turn can move a caret unseen. The note misses those moves (Defaults "note text moves").
- A child-list change hit its container, and its offset `k` is past the change's index, or equals it and the change removed nodes. A removed node's endpoints collapse into its parent at that index (R22, R25, R51).

The claim state also keeps the points and generation of its Editable's last claim or sync, which outlive `G`. Firefox's mouseup redraw finds that state through the Editable that holds its anchor, because the redraw can start from a root chrome section, which has no claim state. It runs only when its points equal them and no placement came after, so it skips after a veto (R50) and after a newer placement (R17).

`writeDOMSelection(tree, points)` writes the selection, or clears its ranges for `null`, and records what the tree then shows as a `write` `P`; in a WebKit shadow root, where the tree reads as its host, it records the points it wrote. When the tree already shows those points, it writes nothing and leaves `P` alone. `resolveVisualPoint`'s probe collapses, moves and restores the selection raw and leaves `P` as it was, because it ends where it began. On unmount or a root change, an Editable drops its claim state and observer (G7), and forgets `P` when an endpoint lies inside it, so the record keeps no removed DOM alive. A record whose endpoints left the document some other way stays, because it never equals a live selection.

At `handleWebKitShadowDOMBeforeInput`, `S` is the event's target range. The native `beforeinput` listener skips `activateViewCaret` while the probe's `execCommand('indent')` runs, so the probe's import decides before anything places. Like every decision while `G` is open with no observation pending, that import first records `S` as `O` with `G`'s receipt, so a drag that a placement overtook keeps its last probed point (R41). A gesture claims through its observation, also when the probe's import runs after the gesture closed (R28, C7), and an echo of a write matches `P` and is vetoed (R19). A native selection with no gesture claims there only through such a kept observation while nothing placed since its gesture, and another view's edit during a press goes unnoted, so that press can claim the moved point.

Every producer of a native selection change, as the architecture reference's provenance rule asks:

| Producer | How the decision sees it |
| --- | --- |
| A user click, touch or caret key | Opens a gesture, which lasts until a frame after its release; claim, or keep when overtaken |
| The root's drag-anchor collapse on a plain native press | Places the press point at mousedown, so the press holds the caret before any import; the gesture's receipt follows it (case 5 in the browser) |
| The browser's own change on a release: a plain click's collapse, a tap's caret | Counts as the gesture (R37, R38) |
| A native selection with no gesture | An observation at arrival; claim when current and not overtaken |
| Plite's export, the layout reconciler's export, the DOM-commit export and a DOM repair | `writeDOMSelection` records the points, and the decision vetoes an equal selection in a view that does not hold the caret (cases 3, 7). The holder's echoes reach today's origin check (R46). An export into a view that does not hold the caret writes its next-key caret (R45) |
| Plite's focus helper | Its selection writes after focusing go through `writeDOMSelection` and write the view's next-key caret; a bare focus is followed by the view's activation, which places and exports its caret; its settle, which runs until a 50 ms timeout, stops when a gesture opens in the view, as it stops at blur |
| Any change to a view's DOM: Plite's text sync, React's commits, a repair or a page script | The note records the points when a record shows an endpoint moved, before the event, and every import takes pending changes first (cases 5, 12, R13, R15, R22 to R25, R31 to R33, R35, R36, R47, R51, R55) |
| Plite's visual-point probe in `resolveVisualPoint` | Ends where it began and leaves the record alone (R30) |
| Plate's node selection clear | `writeDOMSelection` with `null`; zero ranges clear nothing (R18) |
| IME composition, Android pending diffs and the `input`-event fallback | Not routed through the decision; they run in the view that holds the caret, because activation places first |
| WebKit's shadow-root `execCommand('indent')` probe | Its `beforeinput` skips activation, its handler cancels it before it moves anything, and that import asks the decision (R19, R28, R41) |
| The Firefox mouseup redraw | Runs only while its Editable's last claim or sync stands, through `writeDOMSelection` (R17, R50) |
| Browser-handle automation | An allowed raw setter; test tooling only |
| An assistive-technology reselect at the same points | No gesture, so it counts as an echo |

The decision log's premise probe rows cite the probe runs. In jsdom a press in one view, a text insert in the other and the release show zero Plite setter calls, and the insert moves the pressed view's caret from offset 7 to 0. A browser fires `selectionchange` from a queued task and delivers mutation records in a microtask, so the note runs first; the browser spec checks that order in each engine.

## Close

Reversals and deviations come first.

- Diff panel round 2 reverted three round 1 fixes it found broken: the note rule that compared both ends of a text change, the window bubble listener that followed a press's own placements, and keyboard navigation's clear in the navigating view's tree. Each gap those reverts left is a Defaults row, "note text moves", "press handler place" and "nav tree", and Teach and Requirements name them.
- Round 3, the last round the cap allowed, found two defects in the code round 2 restored. A same-length change before a click dropped the click, and closing a gesture dropped the WebKit probe's observation. Round 3's fixes close both, and C6 and C7 fail without them. No panel round reviewed those two fixes.
- Phase 2's last step is partial. The count probe passes, but the three paired timings never ran, because the host's load stayed at 40 to 70 against the limit of 9. t_43ad4bac owns them, and the plan claims no typing speed.
- The changeset step named `plitejs` and `platejs`. `platejs` gets none, because its node selection only changes which writer it calls.
- The hand drive ran in Chromium only. The browser spec runs the order-sensitive cases in all three engines.
- drift-1, from round 2's drive, typed a key at the document's start right after a click at the end of the second view's last paragraph. Four manual replays and 16 scripted runs never reproduced it, and it stays open with t_13309460.
- Beyond the plan, the run's `pstack:correct` pass split `docs/development/enforcement.md`'s focus and selection row into the `selection-writes` check and a rule-only focus row, and added two open items to `docs/plans/topics/correct.md`.
- This plan lands in one commit with the [runtime view state plan](2026-10-20-runtime-view-state.md) and the [caret placement plan](2026-10-20-view-caret-placement.md). The close also ran their open hand drive cells in Chromium, and both stay partial on the timing that t_43ad4bac now owns.

When several views show one document, a view takes the caret only from a click, touch, selection or caret key in it. Every Plite and Plate selection write goes through `writeDOMSelection`, which records the points it leaves per tree, and a type-aware check refuses raw `Selection` mutators in every first-party package except tests. While an editor has peer views, each Editable observes its own DOM and notes a selection that a change moved. A press or caret key opens a gesture that lasts until a frame after its release. One decision, `decideSelectionImport`, runs on every import path. A gesture that code in another view overtook becomes its view's bookmark, and every export or focus into a view that does not hold the caret writes the caret its next key uses. A lone editor returns at the peer check. `plitejs/dom` exports `writeDOMSelection` and `readDOMSelectionRange`, and `plite-dom.mdx` teaches them.

Of the 8 steps, 7 are done, 1 is partial (Phase 2's timing step), and 0 are skipped, blocked or open.

Proof:

- The twelve cases fail at `1cb0833e49` on their assertions, and each added case's base result is in the decision log's build rows. On round 3's fixes, `view-carets.test.tsx` passes 188 of 188 and the count probe 14 of 14.
- Each Proof row's mutation fails its case, except the rows that name none and say why. Round 1 generated 62 mutations, and rounds 2 and 3 reverted each fix to show its case fails.
- On round 3's fixes, `oxlint --type-aware` finds 0 warnings and 0 errors, and the typecheck runs 13 of 13 tasks with nothing cached.
- The browser spec ran five warm times per engine with no retries. Chromium passes 45, Firefox 50 and WebKit 45, and the 5 skipped runs in Chromium and WebKit are the Firefox-only redraw case. Case 5, R31, R37, the echo case and the Firefox redraw fail at `0f3a39d1b8` in every engine that runs them.
- The hand drive covers the find demo, `plite-dom` and the media demo, and the close drive's ten cells in `hand-drive/close-drive-cells.md` hold.
- The registry build and its check exit 0 and change no tracked file.

Limits:

- Typing, mouseup and selection import speed are unmeasured until t_43ad4bac runs.
- Safari's shadow-root host fallback, real screen readers, Android and iOS devices and macOS's Command keyup are unproven. R19, R28, R41 and C7 force the WebKit host flag in jsdom.
- An edit that moves an unread click to the edit's start, past repeated text, or through two edits in one turn still lets the click claim where the edit put it (t_10d9a772).
- A bubble-phase mousedown handler in the view that places the caret beats the click (t_c422f5bc).
- Keyboard navigation's clear records its write in the page's document, so a shadow-root view does not know the clear was Plite's own (t_78091f8f).
- A selection made within a frame of focusing a view can lose to the old caret (t_13309460).
- The view holding the caret still tells its own echoes by the origin flag and the 80 ms timer (t_794c4c09).

## Open work

- Time the keystroke, mouseup and selection import, and the caret placement plan's keystroke, on a quiet host, which settles Phase 2's last step and both earlier plans' timing steps, then fold the three plans into their subject files. owner: zbeyens. stop: suggested task t_43ad4bac lands or is dropped. Tracked in the suggested-task ledger.
- Decide how the note tells a caret a text change moved from one it left in place. owner: zbeyens. stop: suggested task t_10d9a772 lands or is dropped. Tracked in the suggested-task ledger.
- Let the note own its turn end and a press own its placements, with the press lifetime findings. owner: zbeyens. stop: suggested task t_c422f5bc lands or is dropped. Tracked in the suggested-task ledger.
- Decide which view an editor's DOM lookups resolve in, which settles keyboard navigation's tree. owner: zbeyens. stop: suggested task t_78091f8f lands or is dropped. Tracked in the suggested-task ledger.
- Decide whether focus keeps a DOM range the editor never imported, which covers the frame export race and drift-1. owner: zbeyens. stop: suggested task t_13309460 lands or is dropped. Tracked in the suggested-task ledger.
- Retire a view's focus requests once they finish or their Editable unmounts. owner: zbeyens. stop: suggested task t_f2e79968 lands or is dropped. Tracked in the suggested-task ledger.
- Replace the holder's echo check with the write record. owner: zbeyens. stop: suggested task t_794c4c09 lands or is dropped. Tracked in the suggested-task ledger.
- Run the section and restore cases the close drove by hand in Firefox and WebKit through the browser spec. owner: zbeyens. stop: suggested task t_0bc74410 lands or is dropped. Tracked in the suggested-task ledger.
