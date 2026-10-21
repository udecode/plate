---
review_scopes: [runtime]
review_basis: [2026-10-04-runtime-audit, 2026-10-17-named-root-targeting]
work_kind: implementation
review_commit: 56280d1d4138fd0daf45bdab80ef931313ac8204
review_inputs: [docs/plans/2026-10-20-runtime-view-state.md, docs/plans/2026-10-20-runtime-view-state.decisions.tsv, packages/plitejs/src/core/view-carets.ts, packages/plitejs/src/core/public-state.ts, packages/plitejs/src/core/selection-protocol.ts, packages/plitejs/src/core/change/mapping.ts, packages/plitejs/src/core/anchor.ts, packages/plitejs/src/core/anchor-state.ts, packages/plitejs/src/core/command-frame.ts, packages/plitejs/src/core/document-recorder.ts, packages/plitejs/src/core/command-registry.ts, packages/plitejs/src/core/plugin-dispatch.ts, packages/plitejs/src/authored/authored.ts, packages/plitejs/src/history/history-plugin.ts, packages/plitejs/src/history/history-state.ts, packages/plitejs/src/yjs/core/editor-adapter.ts, packages/plitejs/src/editor-runtime-view.ts, packages/plitejs/src/dom/plugin/dom-coverage.ts, packages/plitejs/src/dom/plugin/dom-drag.ts, packages/plitejs/src/dom/plugin/dom-editor.ts, packages/plitejs/src/react/components/dom-coverage-boundary.tsx, packages/plitejs/src/react/components/editable.tsx, packages/plitejs/src/react/components/editable-dom-commit-fence.tsx, packages/plitejs/src/react/editable/editable-dom-runtime.ts, packages/plitejs/src/react/editable/root-interaction-controller.ts, packages/plitejs/src/react/editable/runtime-mutation-state.ts, packages/plitejs/src/react/editable/runtime-selection-engine.ts, packages/plitejs/src/react/editable/selection-change-listener.ts, packages/plitejs/src/react/editable/selection-controller.ts, packages/plitejs/src/react/editable/view-caret-restore.ts, packages/plitejs/src/react/hooks/focus-plite-editable.ts, packages/plitejs/test/core/view-carets.test.ts, packages/plitejs/test/react/view-carets.test.tsx, packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts, packages/platejs/src/features/details/lib/BaseDetailsViews.spec.ts, packages/platejs/src/features/details/lib/BaseDetailsViews.mounted.spec.tsx, apps/www/src/registry/components/editor/details.spec.tsx]
---

# How a view's caret is recorded, parked and restored

Status: partial: built and proven; the paired timing waits on t_43ad4bac
Playbook: plan

**Pursue.** The [view-state plan](2026-10-20-runtime-view-state.md) gave each view of one document its own caret and Details open state. Its second diff panel found seven critical defects in three mechanisms: how a caret placement is credited, how the old owner's caret is parked, and how a parked caret is restored. Each of those had its one replacement in round 1, so under the replacement loop they come back to design here. This iteration replaces those three mechanisms. Presentations, the owner pair, Plate's view stores and the root wiring stay as built; parked anchors go. Plan panel round 1 replaced the restore's wait for the screen with a move at boundary registration. Round 2 replaced parked anchors with bookmarks that move step by step with the live caret, kept Details' own caret move, and made the move at registration wait for an open update to settle. Round 3 made bookmarks take every coordinate step the selection takes and kept undo from rewinding a newer caret. Round 3 also moved carets with a paragraph that one change moves and edits, by matching its text; diff round 1 cut that, because matching text sent carets into unrelated paragraphs. The execution playbook is Build.

## Brief

### What will change?

Each view keeping its own caret, which you asked for, failed seven checks in the second code review. This rebuilds how a view's caret is recorded, parked and restored, so every one passes before typing.

### What could go wrong?

When a section closes over the caret, collaborators may see an extra caret move. If one change moves and edits a paragraph, its carets stay at the old spot. Typing speed is still untimed.

## Teach

Two editor roots show one document in two views. Plite keeps one live caret and remembers which view placed it. When another view takes it, the old view keeps a bookmark that moves with every edit, and focusing that view brings it back.

The first build marked placements with a flag, rebuilt the old caret from the update's total change, and guessed when the screen had caught up. Review broke all three.

Now each caret write carries its own view and root. A bookmark takes every step the live caret takes, so it lands where the live caret would. Undo gives each view its caret from before the edit unless it placed a newer one. Focusing a view places its bookmark at once. When a view hides the section holding its caret, the caret moves to the section's title before anything is drawn.

## Layer and owner

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| Placement records, departures and bookmarks | Plite | `plitejs` root (`core/view-carets.ts`, `core/public-state.ts`, `core/command-frame.ts`, `editor-runtime-view.ts`) | The writer must keep the calling view's root and authored scope wherever it runs, and a bookmark must take every coordinate step the live selection takes. |
| Bookmarks through undo and redo | Plite | `plitejs` root (`history/history-plugin.ts`, `history/history-state.ts`, `core/view-carets.ts`) | Undo replays a batch's total change, and history rebases each batch through changes it did not save, so a batch keeps every view's caret at its edges and rebases it with the selection. |
| One activation per view | Plite | `plitejs/react` (`react/editable/view-caret-restore.ts`, `react/editable/editable-dom-runtime.ts`) | Focus, typing and caret keys need one place that resolves a bookmark and one cancellation rule. The activation and the clamp live in `view-caret-restore.ts`, and the 1,544-line DOM runtime only calls them; caret records live in `view-carets.ts`, not `public-state.ts`. |
| Moving the caret out of a hidden section | Plite | `plitejs` DOM and React (`dom/plugin/dom-coverage.ts`, `react/components/dom-coverage-boundary.tsx`, `react/editable/view-caret-restore.ts`) | Only the render that hides a section knows it hides the caret, every source of a hide registers its boundary there, and each view's coverage is its own. Details keeps its own move for the closes it sees. |
| Clears that a DOM event drives | Plite | `plitejs` root (`core/view-carets.ts`) and `plitejs/react` (`react/editable/selection-controller.ts`, `react/editable/runtime-root-lifecycle.ts`) | A view may clear only a caret it holds or one no view owns, and the check runs at the write. Recording where a selection event came from moved to the [selection import plan](2026-10-21-view-selection-import.md). |

## Main changes

- A view's selection write carries the view, its root and its authored scope wherever it runs: inside another view's update, through a routed root transaction or inside a command's spec. A point without a root resolves in that root, never in the enclosing update's. The writer is the one place that mints a placement. Mapping, spec application, marks changes, representation repair and the clamp cannot. Repair writes go through a non-placing write at each site that sets the re-apply flag today: `transforms-node/{lift,remove,replace-children,set,unwrap,wrap}-nodes.ts`, `yjs/core/editor-adapter.ts:155` and `public-state.ts:8477` and `:9144`. That makes the placer stack, the placed-spec flags, spec-time crediting, the re-apply flag and `writeRuntimeSelection` unnecessary, and all of them go.
- A view's bookmark is a selection in the caret book, not an anchor, and it carries the generation of the placement that made it. The transaction's selection and its book travel as one value, so every site that maps or converts the selection maps the book in the same call. That covers each update step through `mapSelectionThroughChange` with the step's node keys, entry into a command frame through the frame's placement, exit through the recorder's position map with each bookmark's own root, and history's rebasing. A site that installs an explicit selection writes only the live caret. The build lists every such site with `git grep` in the decision log. Probes L1 to L8 show the live caret follows a move and an edit in one update through a plain update, a command spec and an authored editor, in unique and repeated text, at base and on the lead tree. An anchor does not.
- A step maps only the bookmarks in the nodes it edits, splits, merges or removes; the others keep their node's key and resolve their path when read. A spec carries the bookmarks it mapped while building and the recorder's output carries the ones it converted, so neither maps them twice. A rolled-back or discarded draft drops its bookmarks, and the book drops a bookmark whose root goes away. A node bookmark keeps a fallback point mapped with it, as a parked node selection does today, and becomes that point when every node it selects is removed. A bookmark keeps no pending marks, so mapping it meets none of the checks a mapped selection can fail.
- Before a write takes the live caret from another view, the writer copies the outgoing caret into the draft's book as that view's bookmark, with the departing placement's generation and without its pending marks, which belong to a caret only where it is. The update's later steps move it. Several handoffs in one update, A to B to C, each keep their own bookmark. A clear or a value replacement with a null or omitted selection parks the owner the same way. Parking no longer maps the selection before the update through the update's total change.
- Each commit records the caret book before and after it, sharing the book when nothing in it changed, and a history batch keeps its first commit's before and its last commit's after, as it does for the selection. History rebases both books wherever it rebases the batch's selections, through changes it did not save. After replaying a batch's change, undo sets a view's bookmark from the batch's before book only when that view's generation still equals its generation at the batch's after edge, the edge the undo leaves, so it placed nothing since. Redo does the same from the after book, checked against the before edge. Every other bookmark keeps its own place, mapped through the replay, and a released view is skipped. The view that undoes takes the live caret, as today, and when another view owned the caret at that edge, that view gets the batch's selection as its bookmark. History saved to storage carries no books, so a restored history maps them instead.
- A change from another editor, a Yjs batch, a review decision or an undo arrives composed, so one that moves a node and edits it looks like a deletion and an insertion, and every caret in the node goes to its old spot, as at base (L6, L8). A bookmark maps exactly like the live selection, so it goes there too. Matching the deleted node to an inserted one by their text cannot tell a moved paragraph from a new one that shares a first letter or a final period. Diff round 1 showed `hello` to `hi` and `apples` to `approval` sending the caret into the new paragraph (Astra, Sol and Opus). So this plan keeps base mapping, and following the paragraph waits for move identity in the change format, a suggested task.
- Published anchors are unchanged. Their loss through a move and an edit in one update (J1) and across a command frame (P3) fails the same way at base, and this plan no longer builds on anchors, so both red tests go to a suggested task.
- A spec carries its placement records and its bookmarks. Applying it installs them and never credits whoever applies it. An update whose only change is a placement, such as an owner change, a departure or an equal placement, commits: it installs the draft's book, owner and generation and bumps the mutation version, so a spec built before it throws through the existing stale-spec check, with no rerun path. A spec evaluated in a command frame records the placement generation at its evaluation, and applying it after any newer placement throws, as the plain stale-spec check does (Astra, diff round 3).
- One activation owns every way a view takes the caret: focus, typing and caret keys. It resolves the bookmark against the current document at once: the bookmark, else the live caret, else the end. It fits a point an authored view hides, runs the clamp, places the result once through the bound writer and clears the view's projected selection. It focuses only while that placement is still the newest, so a listener's later placement wins and focus stays where it was. The focus it causes finds the view already holding the caret and does nothing. Focus retries carry the same receipt and stop when a newer placement exists. The dirty-DOM retry in `dom-editor.ts` follows the same rule.
- Details keeps its own caret move in `setOpen`, with today's gate, written through the bound writer. A close called inside another view's command is that view's placement (R2-7), and headless closes and the docs at `details.mdx:227` stay true.
- One clamp in `view-caret-restore.ts` serves registration, activation and typing, and each view's clamp sees only its own coverage. A section's boundary registers in the layout effect of the render that hides it (P4). Only a boundary whose reason is `app-collapse` or `app-hidden`, the set `dom-drag.ts` already names, and whose selection policy is `skip` asks the clamp. When the view that registered the boundary holds the caret collapsed inside it in the same root, the clamp moves the caret to the end of the section's title. Another view's caret in that body stays, and a parked view's bookmark moves at that view's own activation. A holder in a content root counts. The clamp writes through the non-placing write, so it keeps the owner and the generation. Outside a draft it writes at once and the normal export runs before paint. Inside a draft or a read it waits until the outermost one closes, by commit, rollback, the disposal of a spec build or a frame probe, or the end of the outermost read, then checks the committed selection and coverage again, still before paint. A boundary registers again when its contents change (P5), so a caret block another view moves into a collapsed section moves out in that render (RC-11). The check returns at once unless the registering view holds a collapsed caret in the boundary's root. An expanded selection keeps its ends, so select-all then Delete still removes a hidden body. The clamp skips a read-only view and a view that is composing, steps past enclosing hidden sections, keeps a range's direction and leaves a point with no visible target where it is. This replaces the restore's wait and the pending-commit flag it read.
- A mouse press has two task-bounded windows. One runs from the Editable's mousedown until one `setTimeout(0)` task later. The other wraps the Editable's own mouseup handler. A click's own placement wins over a restore, and a release outside the Editable leaves nothing set. The document-level release listeners go.
- A selection import keeps the first plan's code: it reads the event's origin when it runs, up to 100 ms after the `selectionchange`. Every clear that a DOM event drives, an import that finds no DOM selection, the outside release, the WebKit shadow-host clear and the read-only deselect, goes through `clearCaretUnlessHeldElsewhere`, which clears only while no other view holds the caret at the moment of the write. Recording the event's origin, placement generation and DOM points on arrival had its one replacement in diff round 1. Diff round 2 then showed that the mouseup and keydown sync imported a stale click without that check (Astra, Sol and Opus). It also showed that in a shadow root the check read the document's selection while the import reads the root's (Sol and Opus). Under the replacement loop provenance left this iteration, and the [selection import plan](2026-10-21-view-selection-import.md) rebuilds it. Until that plan lands, its twelve red cases fail here in five ways (Opus, diff round 3). Another view's echo, a DOM repair, a press whose selection another view's edit moves, or a gesture queued before a newer placement takes the caret (cases 1, 3, 5, 6, 7 and 12). After another view's export, the user's own selection claims nothing (case 4). A key typed after an overtaken selection is dropped (case 2) or lands at the wrong caret (cases 8, 9 and 11). A selection that disappears after a queued one leaves the caret where it was (case 10).
- The type-in-hidden check returns at once while no view registers a collapsed boundary; otherwise it walks the caret's ancestors against the registered collapsed set. A steady keystroke in a document with no collapsed section makes no coverage query and no placement. Typing in a view whose own coverage hides the caret first runs the clamp.
- A read-only view's close still leaves its caret where it was (R25). A later explicit activation may move it out through the read-only selection path.

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Focusing a parked view while another view's listener places a caret | The listener's placement stands; the parked view neither restores over it nor takes focus | jsdom R2-2 and R2-4 asserting `document.activeElement` is the element focused before; Chromium, Firefox and WebKit focus drive |
| Closing a section and focusing in one batch | The caret lands at the end of the section's title before paint, and the native caret sits there before any typing | jsdom R2-5, the 1094 and 1211 cases asserting before typing and `document.activeElement`, the transition, component-state, close-then-throw and discarded-build cases; Chromium hand drive |
| Another view moves the caret's block into this view's collapsed section | The caret moves out in that render | jsdom RC-11 |
| A view closes a section while another view holds a caret in its body | The other view's caret stays | Registry case with a writable holder |
| A bookmark moved and edited in one update, in repeated text | Lands where the text went | Core repeated-text cases through a plain update, a spec and an authored editor |
| A parked caret in a Suggesting editor, through a proposed deletion or a framed command over struck text | Lands where the live caret would | Core Suggesting and frame cases |
| Undo of another view's move and edit | Each view's bookmark returns where it stood, unless that view placed a newer one | Core undo and redo cases, with a skipped change between |
| A collaborator's or another editor's move and edit | The live caret and the bookmark go to the paragraph's old spot, as the live caret does at base | Core L6 case and the seat cases `hello` to `hi` and `apples` to `approval` |
| A command in one view that closes another view's section | The other view keeps the caret; the first view keeps its bookmark | Plate spec R2-7 |
| A Details close with no mounted view | Moves the caret to the title, as today | `platejs` details partition |
| Clicking into a parked view | No restore lands before the click's own caret | jsdom press case observing every publication, a held press, an outside release and a window blur; Chromium hand drive |
| Tab back after a release outside the Editable | Restores the view's own caret | Existing jsdom R10 |
| A touch selection-handle drag to a new spot | Claims the caret for the dragging view | jsdom external-selection case; touch devices unproven |
| A selection event from Plite's own export or a DOM repair | Takes the caret for the view it reaches (cases 3, 5, 7 and 12), and after the export the user's own selection claims nothing (case 4). The [selection import plan](2026-10-21-view-selection-import.md) fixes both | That plan's echo and repair-induced red cases |
| A gesture queued in the throttle window, then code places a caret | Takes the caret back (cases 1 and 6), drops the next key (case 2), types at the wrong caret (cases 8, 9 and 11) or leaves the caret after the selection disappears (case 10). The selection import plan fixes these | That plan's queued-gesture and click-then-type red cases |
| A selection event in a view that does not hold the caret and finds no DOM selection | Leaves the other view's caret | jsdom read-only deselect, outside release after blur and no-DOM-selection cases |
| An expanded selection in a view, then a restore | The native selection shows the restored caret, not the old range | jsdom J4 case |
| Select-all in a document that ends in a collapsed section, then Delete | Deletes the hidden body too | jsdom select-all case |
| A read-only view closing a section that holds its caret | Unchanged: the caret stays | Registry R25 |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Which design to build | Restore at once; the render that hides a section moves the caret out before the screen draws, and a collaborator may see one extra caret move (look) | Wait for the screen to confirm before restoring, as architect round 3 picked | wait for screen | small |
| A read-only view closing a section that holds its caret | Unchanged: the caret stays where it was (look) | Move it out to the end of the section's title | read-only moves caret | small |
| Typing after code put the caret inside a section this view collapsed | The caret first moves to the end of the section's title, as a restore does (look) | Type where the code put it, inside the hidden text | type in hidden | detail |
| Typing in a focused view that lost the caret to code | The view's own caret comes back, then the key types there (look). This replaces the first plan's pick, because the export goes to the holder's DOM and text would land where the user is not looking | Type at the live caret, as the first plan picked | type at live caret | detail |
| A restore that a newer placement overtakes before focus | Focus stays where it was (safe) | Focus the restoring view anyway | focus anyway | detail |
| Who holds the caret after undo | The view that undoes, as today; every other view gets back its caret from before the batch unless it placed a newer one (look) | Give the caret back to the view that held it before the batch | undo returns caret | detail |
| Which caret a section's close moves | Only the closing view's own caret; another view's caret in that body stays (safe) | Move whichever view holds the caret, as round 2 planned | clamp holder | detail |
| When a mouse press ends | One task after the mousedown, plus the Editable's own mouseup handling, so the click's caret wins and an outside release leaves nothing set (safe) | At the first release anywhere in the page | early release | detail |
| Typing speed gate | A count test must pass before landing. A timing run a busy machine spoils goes to a suggested task, as the Benchmark skill sends a protocol that needs a quieter host, and the run claims no typing speed until it passes; a clear miss sends the design back (look) | Hold the landing until a quiet machine runs the timing, as the first plan said | hold for timing | detail |
| Two content areas of one view on one root | Not supported; they share one caret and one coverage set (safe) | Track coverage per content area | split coverage | detail |
| Typing the instant a section starts to collapse through its own component state, before React draws it | The key lands where the caret was, and the caret moves out when the collapse draws (look) | Hold the key until the screen draws | hold keystroke | detail |
| A caret through one change that moves and edits its paragraph, from a collaborator, another editor, a review decision or undo | Goes to the paragraph's old spot, as at base, for the live caret and every bookmark (answer: three plan rounds disputed matching by text, and diff round 1 showed it sends carets into unrelated paragraphs) | Give changes move identity, which changes the change format that history, Yjs and the review recorder share | exact composed carets | small |
| Published anchors through a move and an edit in one update or a command frame | Unchanged, as at base; a suggested task holds the two red tests (look) | Fix anchors in this plan | fix anchors | small |
| The runtime page's link | https://claude.ai/artifact/6VCechKZD3ocNEf5zMY6TZ and https://claude.ai/artifact/ShFXKHw7H89pDkPnZTAc8f no longer open from this account, so the page now lives at https://claude.ai/artifact/VVn5MNBokeZVoz39Deh4S6 (look) | Drop the new page, if the old ones were deleted on purpose | drop new page | detail |
| The find demo's hand drive | Each case checked once by hand in Chromium, because Claude's built-in browser is Chromium only. t_0bc74410 adds these cases to the browser tests, which run five times in Chromium, Firefox and WebKit (look) | Check every case by hand five times in all three browsers before landing | spec the drive | small |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Placement credit | Placer stack on the transaction; spec booleans credited at application | Writer bound to view, root and authored scope; placement records carried by specs and frames; repair writes and the clamp never place; a placement-only update commits | Plite core `view-carets.ts`, `public-state.ts`, `editor-runtime-view.ts`, `command-registry.ts`, `plugin-dispatch.ts` | A nested write lost its root (R2-1), a spec credited its applier (R2-7), and an equal placement committed nothing | Internal; every selection writer from the round-1 census and the eleven re-apply sites | R2-1, R2-7, A to B to C, repair cases, equal-placement reactivation | med | rearchitect |
| Bookmarks | Parked anchors; the pre-update selection mapped through the total change | Selections in the caret book, one value with the transaction's selection, so every mapping and conversion site maps both; specs, frames and the recorder carry them; a rolled-back or discarded draft drops them; node bookmarks keep a fallback point | Plite core `view-carets.ts`, `public-state.ts`, `command-frame.ts` | Anchors and total-change mapping lose a move and an edit in one update (R2-6, J1, L2), and the recorder and frames convert coordinates | Internal | R2-6 both orders, repeated-text, spec, authored, Suggesting and frame cases, rollback, node removal and marks cases | med | rearchitect |
| Bookmarks through undo | Parked anchors mapped through the replayed change | Commits record the caret book at their edges; batches keep and rebase them; undo and redo set only views with no newer placement | Plite `history/history-plugin.ts`, `history/history-state.ts`, `core/view-carets.ts` | Undo replays a total change, and history rebases batches through changes it did not save | Internal | Undo and redo cases at the holder's spot and elsewhere, with a skipped change between, a newer placement and a late mount | med | rearchitect |
| Composed move and edit | A point in the node goes to its old spot | Unchanged; a bookmark maps like the live selection | Plite core `core/change/mapping.ts`, `core/selection-protocol.ts` | Text matching cannot tell a moved paragraph from a new one (diff round 1); following it needs move identity in the change format | Internal | L6 and the seat cases | low | keep |
| Published anchors | Lose a move and an edit in one update and a command frame | Unchanged | Plite core `anchor.ts` | J1 and P3 fail the same way at base, and bookmarks no longer use anchors | None | J1 and P3 red tests, kept for the suggested task | low | defer |
| Restore | Three timing paths holding resolved paths over a wait | One activation per view that resolves, clamps and places at once, and focuses only while its placement is newest | Plite React `view-caret-restore.ts`, `editable-dom-runtime.ts` | R2-2 to R2-5 all came from separate lifetimes and the wait | Internal | R2-2 to R2-4, RC-6, RC-7, successful-restore case | med | rearchitect |
| Hiding the caret | Pending flag set only by editor commits | Boundary registration asks one clamp for its own view's caret, which writes at once or when the outermost draft closes; Details keeps its own move through the bound writer | Plite DOM `dom-coverage.ts`, React `dom-coverage-boundary.tsx`, `view-caret-restore.ts`; Plate `BaseDetailsPlugin.ts` | A component-state or transition hide marked nothing (R2-5), a clamp written into an update rolls back with it, and coverage is per view | Internal | R2-5, close-then-throw, discarded-build, transition and component-state cases, RC-11, writable-holder registry case, headless Details cases | med | rearchitect |
| Clamp | Every boundary on a path, any root | Collapsed carets in `app-collapse` and `app-hidden` boundaries with a `skip` policy, in the target's root, with a defined no-target result; read-only and composing views skip it | Plite React `view-caret-restore.ts` | Virtualized rows, materializing boundaries and select-all ends are valid targets, and roots must not mix | Internal | Named-root, virtualized, materialize, select-all, no-target, IME and R25 cases | low | rearchitect |
| Press lifetime | Ends at document capture | One task after mousedown, plus the Editable's own mouseup handler | Plite React `editable-dom-runtime.ts` | A focus during the Editable's own mouseup restored first | Internal; document listeners deleted | Prevented-mousedown, held press, outside release, window blur, R10 | low | rearchitect |
| Selection import | Origin read when the import runs; equal selections ignored | Unchanged in this iteration; every clear a DOM event drives checks the holder when it writes; the [selection import plan](2026-10-21-view-selection-import.md) rebuilds provenance | Plite React `selection-controller.ts`, `runtime-root-lifecycle.ts`; Plite core `view-carets.ts` | Recorded provenance missed the mouseup and keydown sync and the shadow-root selection after its one replacement | Internal | Read-only deselect, outside release after blur and no-DOM-selection cases | med | replan |
| Holder typing | Selection read and two coverage lookups per keystroke | A count of registered collapsed boundaries; with none, no lookup | Plite DOM `dom-coverage.ts`, React `editable-dom-runtime.ts` | Runs on every keystroke | Internal | Count probe with and without a collapsed section | med | gate |
| `writeRuntimeSelection` | Identity wrapper | Deleted; callers use the bound writer | Plite React `runtime-mutation-state.ts` | Two names, one behavior | Internal | Existing suites | low | cut |

## Steps

The Build playbook runs these steps under trunk delivery: delegates write code, the lead reviews and proves each diff. Each step writes its red cases first, on the tree before the step, and keeps them red for the reported reason. The build first deletes the mechanisms it replaces, so no step leaves two of them running. Every step that edits code runs the writing passes before its review.

### Before the build

- [x] Copy the round-2 repros (R2-1 to R2-7) and probes P6, J4 and J5 from the reviewed worktree into this tree as red cases, and write the red cases in Red cases. P2, P4, P8, J2, the value-replacement cases and the headless Details closes pass today and stay as guards. P1, P5 and P7 test behavior this plan does not build and stay in the run folder. Move the two anchor red tests to the run folder for the anchor task. Proof: each red case fails on this tree for its logged reason and each guard passes, in `proof.mjs` logs.

### Phase 1: placements and bookmarks

- [x] Bind the selection writer to the calling view's scope, make the transaction's selection and its book one value and list every site that maps or converts it, carry placement records and bookmarks through specs, frames and the recorder, route repair writes through the non-placing write, map bookmarks with each step, keep node fallback points, drop bookmarks with a rolled-back or discarded draft, capture each departure into the draft's book, commit placement-only updates, and delete the placer stack, the spec flags, the re-apply flag, aggregate parking, parked anchors and `writeRuntimeSelection`. Proof: R2-1 (core and Details), R2-6 in both orders, R2-7, A to B to C in a plain and an authored editor, the repeated-text, Suggesting, frame, frame-departure, rollback, node-removal, marks, equal-placement, L6, the two seat relocation cases, value-replacement, stale-spec, repair and no-owner Yjs cases pass; each Phase 1 mutation fails its named case; the `plitejs` core, dom, authored and Yjs partitions and the `platejs` details partition pass.
- [x] Record the caret book at commit edges, keep it in history batches, rebase it with the batch's selections, set it in undo and redo by generation. Proof: the undo and redo cases pass, with a skipped change between, a newer placement, a placement between two merged commits and a late mount; the history mutations fail their cases; the `plitejs` history and Yjs partitions pass.

### Phase 2: one activation

- [x] Replace the restore with one immediate activation per view, the one per-view clamp that waits for the outermost draft to close, receipt-bound focus and retries, the projected-selection clear, the two press windows, the checked clear at every clear a DOM event drives, and the collapsed-boundary count, and route Details' `setOpen` move through the bound writer. Proof: R2-2 to R2-5, the 1094 and 1211 cases asserting owner, model and native caret and `document.activeElement` before typing, the close-then-throw, discarded-build, transition and component-state close cases, RC-6, RC-7, RC-11, the successful-restore and retry-after-placement cases, the press cases, R10, the selection-import and click-then-type cases, J4, the select-all, IME, virtualized and materialize cases, R25, unmount during an activation and a StrictMode mount pass; each Phase 2 mutation fails its named case; the `plitejs` react, pagination and virtualized partitions, the `platejs` details partition and the registry Details spec pass.
- [x] Open the press window on the window's capture-phase `pointerdown` too, so a focus that a page handler causes inside a press, such as Plate's node selection marquee, counts as that press. Proof: the intercepted-press case is red at de4422d5cf and green after, and removing the listener fails it.
- [ ] Hand drive the find demo in Chromium, Firefox and WebKit: restore after the other view's edits by Tab and by typing, a blank click in the editable's empty area ending with no caret as at a28e4ee, close a section and focus in one batch, close a section in one view while the other holds a caret in it, click into a parked view, and select after a restore so the echo arrives. Proof: `hand-drive.mjs check` passes with five warm runs per case and the screenshots read.

### Phase 3: typing cost

- [ ] Add the count probe and run the paired timing on the final tree, as Performance gates says. Proof: the count probe passes; the timing run passes, or is logged inconclusive with a suggested task waiting on this plan and the speed claim left open.

## Performance gates

- **Count probe, deterministic.** Through real `beforeinput` events on the holder's Editable, 20 keystrokes across 2, 8 and 32 views make zero coverage queries, zero committed placements, zero owner changes and zero clamp writes; they visit and map no bookmark outside the typed text node. Each batch of bookmark writes copies each book map once, however many bookmarks it moves, so a keystroke copies the book twice: once when its step maps the bookmarks and once when the update installs them. Each copy, and the comparison that finds the changed bookmarks, still touches one entry per view. The probe counts copies, not entries, so the claim is two copies per keystroke, each linear in the number of views (Astra, diff round 1). A coverage query is a boundary lookup, counted when the lookup starts (diff round 1, Opus). In the Suggesting cohort the first key checks each view's coverage once and later keys check none, and the probe leaves out the routed holder's queries. Both come from base code, the development-only rendered-children guard, the selection reconciler and the selection export, and t_4db92ab2 tracks the routed holder's re-render on every key. The selection export runs on an animation frame, outside the probe's synchronous keystroke loop, so the plain cohorts do not count its queries. The type-in-hidden check reads only the collapsed boundaries that the caret's ancestors own, plus those with no single owner, so its visits do not grow with the number of collapsed sections. A book entry is one view's bookmark in one root. It runs with no collapsed section, with a collapsed section beside the typed block, while typing in a collapsed section's title, and in a Suggesting editor with pending suggestions, where it also converts no bookmark outside text nodes that hold suggestions. Ten Enter presses with 32 views' bookmarks in other blocks map no bookmark outside the split node. A routed content-root holder (the shape of `view-carets.test.tsx:1156`) meets the same counts, coverage queries aside, at 2 and 8 views. Each keystroke in that holder re-renders every view's body (t_4db92ab2), so at 32 views its 20 keys take 5.6 seconds. The counts are per key, so 20 keys still fail on each planted defect below, and each case stays inside the 5-second deadline every test has. Five hundred history batches across 32 views retain at most one book entry per bookmark change. The probe fails on a planted per-keystroke coverage query, a planted mapping of every bookmark on each step, a planted book copy on each commit and a planted conversion of every bookmark on frame entry.
- **Paired timing.** Median microseconds per keystroke through a real `beforeinput` handler, candidate against base `a28e4ee`, at most 1.05 on the four frozen cohorts (2, 2, 8 and 32 views over 100, 2000, 500 and 125 blocks), with the frozen estimator, same-code and planted arms, and a load limit of 9. A conclusive miss sends the design back to architect. The lead logs an inconclusive run on a loaded host with its next probe and offers a suggested task that waits on this plan; that task does not hold the close, and until it passes the typing-speed claim stays open, because a count alone does not close performance.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Slice review | skip | skip: the `push` row owes a panel on the diff, because it changes Plite core, and every seat applies both review lenses | none |
| Blast radius | skip | skip: the plan changes no public API; every mechanism it replaces is internal | none |
| Hard cut sweep | done | Phase 1 deletes the placer stack, the spec flags, the re-apply flag, aggregate parking, parked anchors and `writeRuntimeSelection`; `git grep` finds no caller, export, test or doc left | `hard-cut/sweep-3782f75e46-a1.log`: no reference left outside the API manifest, which the first plan regenerates |
| Check steps | done | The `pnpm check <step>` steps the edits reach, before the acceptance runs | The [selection import plan](2026-10-21-view-selection-import.md)'s Check steps row covers the final tree: `close-checks/check-affected-a1.log` and its four `refix-*` reruns |
| Scale rerun | partial | Phase 3's count probe and paired timing through `benchmark`, after the last panel fix | The count probe passes on the final tree (`round3-fixes/final-view-caret-work-a1.log`). The paired timing waits on t_43ad4bac |
| Hand drive | partial | `hand-drive.mjs check` after Phase 2's drive | `hand-drive/drive-check-r3-a1.log`, and the ten cells in `hand-drive/close-drive-cells.md` hold in Chromium. Firefox, WebKit and the five warm runs go to t_0bc74410 (Defaults "spec the drive") |
| Playtest | skip | skip: `playtest.mjs scope` names no scenario catalog for these files, and the build adds no editor feature | none |
| Docs | skip | skip: no public page changes; `details.mdx:227` stays true, because Details keeps its own caret move | none |
| Type-aware lint | done | `oxlint --type-aware` on the task's files before the diff panel | `lint-vcp/lint-task-build-a2.log`: 0 errors on the 57 TypeScript files the build changed |
| Diff panel | done | The `push` panel on the diff before landing, at most three rounds | Three rounds; round 3's fix is in d443909f6d, and the decision log's panel rows settle each finding |
| Changesets | done | `plitejs` through the `changeset` skill, for each view's caret activation, undo and section clamp | `.changeset/plitejs-view-carets.md` names the activation, the undo and redo restore and the section clamp |

## Proof

Each mechanism earns its place through a mutation that fails a named case.

| Phase | Remove or break | Case that must fail |
| --- | --- | --- |
| 1 | Resolve a rootless write in the enclosing update's root | R2-1, owner root and model root, plus a read-only and an authored caller |
| 1 | Carry a boolean in specs | R2-7, B owns and A keeps `[1,0]@3` |
| 1 | Keep only the last handoff | A to B to C keeps both bookmarks |
| 1 | Park from the pre-update selection | R2-6, `[1,0]@4` |
| 1 | Map bookmarks through the update's total change | Repeated-text plain case, `[1,0]@3` |
| 1 | Map a spec's bookmarks again when it applies | Repeated-text spec case |
| 1 | Skip the recorder's bookmark conversion | Suggesting deletion case |
| 1 | Map a frame's bookmarks without the frame's placement | Frame over struck text |
| 1 | Keep a rolled-back update's bookmarks | Rollback case |
| 1 | Drop a node bookmark's fallback point | Node-removal case |
| 1 | Skip departure capture on value replacement | Null and omitted replacement cases |
| 1 | Let a repair write mint a placement | Wrap or set-nodes repair and the no-owner Yjs case |
| 1 | Dispose an update whose only change is a placement | Equal-placement reactivation case |
| 1 | Skip the version bump on an equal placement | Stale-spec case throws |
| 1 | Match a deleted node to an inserted one by shared text | `hello` to `hi` and `apples` to `approval` cases |
| 1 | Join two merged commits' outer books past a placement between them | Placement between merged commits case |
| 1 | Set no bookmark on undo | Deletion-undo case |
| 1 | Restore every recorded view on undo | Newer-placement undo case |
| 1 | Skip rebasing the edge books | Deletion-undo case with a skipped change |
| 2 | Remove the clamp at registration | R2-5, 1094 and 1211 before typing, the transition and component-state close cases, RC-11 |
| 2 | Write the clamp through the open update | Close-then-throw case before typing |
| 2 | Drain the clamp only on commit or rollback | Discarded-build case |
| 2 | Write the clamp through the placing writer | R2-5 and 1211 `document.activeElement` |
| 2 | Clamp the holder for another view's boundary | Writable-holder registry case |
| 2 | Clamp a boundary in another root | Named-root case |
| 2 | Clamp a `viewport-virtualization` boundary with the `materialize` policy | Virtualized case restores exactly |
| 2 | Clamp a materializing boundary | Materialize case |
| 2 | Move an expanded selection's end | Select-all case |
| 2 | Clamp while composing | IME case |
| 2 | Move a point that has no visible target | No-target case |
| 2 | Clamp in a read-only view | R25 |
| 2 | Drop Details' own move | Headless Details close cases and R2-7 |
| 2 | Let a retry place after a newer placement | Retry-after-placement case |
| 2 | Focus after a newer placement | R2-2's `document.activeElement` |
| 2 | Drop the dirty-DOM retry guard | Dirty-DOM retry case |
| 2 | Let the restore's own focus start a second activation | Successful-restore case, one placement |
| 2 | Skip the hidden-body move on a caret key | Caret-key activation in a hidden body |
| 2 | Keep one press window open until any release | Window-blur case |
| 2 | Keep the press window open until a release in the Editable | Outside release, then Tab |
| 2 | Clear the press at document capture | Prevented-mousedown case |
| 2 | Clear from a DOM event without checking the holder at the write | Read-only selection that leaves after another view placed, press outside a read-only view whose blur handler places another view's caret |
| 2 | Skip the projected-selection clear | J4 |
| 2 | Skip the holder's hidden-caret move | Holder type-in-hidden case, caret-key case |
| 3 | Query coverage on every holder keystroke | Count probe |
| 3 | Map every bookmark on each step | Count probe |
| 3 | Copy the book on every commit | Count probe |
| 3 | Convert every bookmark on frame entry | Count probe, Suggesting cohort |

## Red cases

- R2-1 to R2-7 from the round-2 panel, with the values in [Design](#design).
- The 1094 and 1211 cases in `view-carets.test.tsx`, asserting owner, model caret, native caret and `document.activeElement` right after focus, then typing as a separate assertion.
- A close through a React transition and a close through component state, each followed by focus, a close flushed inside an update that then throws, and a close made while a command builds a spec that is then discarded, each asserting model and native caret before typing.
- A to B to C in one update, in a plain and in an authored editor; B places, then moves and edits A's block.
- A bookmark at offset 2 of `aaaa`, then one update moves its paragraph and inserts `a` at its start, through a plain update, a command spec and an authored editor: each lands at `[1,0]@3`.
- In a Suggesting editor, a parked caret after text another view proposes to delete, and a framed command over existing struck text before a parked caret: each bookmark lands where the live caret lands from the same spot.
- A departure captured before a framed command that edits before it.
- An update that hands the caret over and then throws keeps the old bookmarks.
- A block selected in A, then removed by B: A reactivates at the fallback point, not at B's caret.
- A caret with pending marks parked in a block that another view converts to a type that rejects them: that update commits and the bookmark survives.
- B holds the caret at X and A has no bookmark: focusing A places X, A moves on, and refocusing B restores X. A spec built before an equal placement made inside `view.update` throws as stale.
- Undo of an update in which another view deletes the paragraph holding a bookmark: the bookmark returns inside the restored paragraph at its offset, also with a `history-skip` insertion between the deletion and the undo.
- Undo and redo of one update that moves and edits a bookmarked paragraph, with the bookmark at the holder's spot and elsewhere; a `history-skip` insertion of a paragraph above between the batch and the undo, and between undo and redo; an undo after the parked view placed a newer caret; an undo after a view placed between two merged commits; a redo that maps the bookmark of a view mounted after the undo.
- L6 on this tree: the live caret and a bookmark land at `[0,0]@0`, as at base, and so do the seat cases `hello` to `hi` and `apples` to `approval`.
- Value replacement with a null and with an omitted selection, as guards that pass today.
- A wrap or set-nodes repair and a Yjs change with no caret owner, each placing nothing.
- RC-6: a focus requested inside another view's update after an insert. RC-7: a later placement in the same update. RC-8: an authored-frame handoff on an accept-all projection. RC-11: another view moves the holder's caret block into a collapsed body.
- In the registry, A collapses a section while a writable B holds a caret in its body: B's caret stays.
- A successful restore that focuses and makes exactly one placement.
- A focus retry after a placement elsewhere with no change of DOM focus, and the dirty-DOM retry.
- A prevented mousedown, a click into a parked view observing every publication, a held press, a release outside the Editable and a window blur.
- A read-only view's selection that leaves it after another view placed, the same after the caret's owner unmounted, a press outside a read-only view whose blur handler places another view's caret, and a press outside a focused read-only view that holds the caret. The selection import red cases moved to the [selection import plan](2026-10-21-view-selection-import.md).
- A caret key in a view whose coverage hides the caret.
- J4: an expanded view selection, then a restore.
- Select-all in a document that ends in a collapsed section, then Delete; a close while composing; a bookmark in a virtualized row; a collapsed caret inside a materializing `app-hidden` boundary.
- The headless Details closes at `BaseDetailsPlugin.spec.ts:440`, `:585` and `:612` and `BaseDetailsViews.spec.ts:169`, `:220`, `:268`, `:281` and `:295`, as guards.
- Unmount during an activation; a StrictMode mount; R25's read-only close.
- J5: a routed content-root holder typing three characters.

The Before-the-build run, on this tree at `5f643ce32f`, corrected the lists above:
- Already passing, so they stay as guards: 1094 and 1211, the Suggesting deletion, the framed command, the frame departure, RC-8, the handoff that throws, the node-removal fallback, the pending marks and the undo after a newer placement. In the equal-placement case only the stale spec fails.
- Red today, though listed as a guard: select-all in a document that ends in a collapsed section, then Delete. Phase 2 makes it pass.
- R2-1 in headless Details throws instead of landing wrong, and the retry after a placement also moves the owner.
- The React case "typing in a view while another view holds the caret lands at the live caret" asserts the pick this plan replaces, so Phase 2 flips it.
- Not yet written, so Phase 2 writes them: the prevented mousedown, through the Chromium variant; the dirty-DOM retry, which has no public path; and the repair-induced equal selection. Existing cases already cover the equal selection after a click.
- At base `a28e4ee`, the parked view types `Z` into the other paragraph through `tx.changes.apply`, and `Z` never lands through the Yjs binding.

## Design

Architect round 3 ran three runners from one brief: Opus, Astra at xhigh and Sol at xhigh. An Opus cross-judge scored them blind. The brief's control was the round-2 tree as built, which fails all seven repros, so the comparison has a no-new-artifact row.

| Candidate | Judge | Lead | Shape |
| --- | --- | --- | --- |
| Control: the round-2 tree | fails | fails | Placer stack, aggregate parking, three restore paths |
| Sol | 18 | 18 | Bound writer, receipts, coverage stamps, microtask press fallback |
| Opus | 18 | 23 | Synchronous take, clamp at boundary registration, task-scoped press |
| Astra | 20 | 18 | Bound writer, departure capture, one cancellable activation that waits for coverage |

**Pick: Astra's placements and parking, with Opus's clamp at boundary registration.** Architect round 3 picked Astra's whole design for three reasons, and plan panel round 1 showed two were false. The clamp runs before the screen draws the hide under either design. A read-only view can skip the clamp, as `BaseDetailsPlugin.ts:288` already does, which keeps R25. The third reason, probe P1, tested a nested update that neither design makes. Round 1 also found that Astra's wait steals focus from a view the user moved to, and that its publication cannot see a hide that comes from component state or a transition. Every source of a hide registers a boundary, so the clamp covers them all, and it fixes RC-11 because a boundary registers again when its contents change. It costs one model commit with the caret inside the section, which selection subscribers and collaborators can see and the screen never draws. The Claude family made this pick: the Opus runner, the Opus seat and the lead. Round 2's GPT seats attacked the clamp's write inside an open update, not the pick; the clamp now waits for that update to settle, as Opus's runner first had it.

Round 2 changed three more things. All three seats found that deleting Details' own move broke headless closes, the docs and R2-7's proof, so it stays. Both GPT seats showed that round 1's surviving-node fallback guesses the offset from a string diff, and probe L2 confirmed it: an anchor with the fallback lands at `[1,0]@2` in `aaaa`. The live selection lands at `[1,0]@3` through the same update, so bookmarks now map with it. Both GPT seats also showed that base's cache follows the live caret on every commit. With both views at one spot, base then restores the right caret after undo, while a bookmark mapped through the batch's total change would not, so batches now keep the caret book.

Round 3 found nine more critical gaps, and this plan applies all of them. Astra showed that one import mutation could not fail its case, so the generation and the export count each get their own. All three seats showed that bookmarks skipped the coordinate conversions the selection gets in command frames and the authored recorder, and that history rebases a batch's selections through changes it did not save but not its books. The selection and the book now travel as one value. Both GPT seats showed that restoring every recorded view on undo rewinds a view's newer caret, so each bookmark carries its placement's generation. Sol showed that a node bookmark lost today's fallback point and that a discarded spec build never settles the clamp's wait. Opus showed that a placement-only update committed nothing and that a close in one view moved another view's caret. Both GPT seats, with Opus as a warning, showed that restoring a view's own bookmark is a flow this run adds, so the composed move-and-edit case could not stay open, and selection mapping followed a moved and edited node by its text. Diff round 1 showed that text match sends carets into unrelated paragraphs. Under the replacement loop the run reverted it and narrowed the claim. A composed move and edit now leaves every caret at the paragraph's old spot, as at base, and move identity in the change format is a suggested task. Diff round 2 removed the import provenance that rounds 2 and 3 grafted below, and the [selection import plan](2026-10-21-view-selection-import.md) rebuilds it.

Grafts:

- From Astra: the bound writer, departure capture and one activation owner.
- From Opus: the clamp at registration, waiting for an open update to settle, the two press windows, the frame capture before the recorded draft commits, the count probe and the first focus's receipt.
- From Sol: captures resolve in a spec's final coordinates and are never mapped twice. Each coverage boundary records its model root and the clamp has a defined no-target result. The dirty-DOM focus retry obeys the placement guard.
- From round 2: bookmarks map with the live selection (the lead, from L1 to L8), batches keep the caret book (Astra and Sol), and queued imports carry the placement generation and export count (Astra and Sol).
- From round 3: one value for the selection and its book (all three seats), rebased and generation-checked history books (Astra, Sol and Opus), the node fallback, the draft-close drain and the `skip`-policy filter (Sol), the placement-only commit, the per-view clamp, the non-placing clamp write and the stale-gesture bookmark (Opus), and the composed relocation (the lead, on Astra's, Sol's and Opus's cases).

Cases the other candidates handle that this base adds or limits:

| Case | From | Answer |
| --- | --- | --- |
| Spec double mapping | Sol | Graft |
| No visible point anywhere | Sol | Graft |
| Dirty-DOM retry | Sol | Graft |
| StrictMode and suspended content during an activation | Sol | Graft as tests |
| Focus inside another view's update, and a later placement in it (RC-6, RC-7) | Opus | Graft as tests |
| Authored-frame handoff on an accept-all projection (RC-8) | Opus | Graft as a test |
| Another view moves the holder's caret block into its collapsed body (RC-11) | Opus | Graft: the clamp runs when the boundary registers again |
| Touch and compatibility focus timing | Opus | Limit: unproven without a device |
| Two content areas of one view on one root | Opus | Limit |

Defects all three shared, now in this plan: the restore clears the view's projected selection (J4); the recorded-draft producers are listed (one production recorder, `authored.ts:1712`, whose pass-through branch at `:1722` sets no anchor change); and an assistive-technology caret move that equals the export stays unproven.

Premises, each run against the reviewed tree unless the row says otherwise:

| Id | Premise | Result |
| --- | --- | --- |
| P1 | A view update nested in another applies the inner root | False: it throws |
| P2 | A scoped anchor follows a move and then an edit in one update | Holds: `[1,0]@4`; aggregate parking gives `[0,0]@0` |
| P3 | An outer-draft anchor follows a framed command's edit | False: stays at offset 2 |
| P4 | A Details close registers a skip boundary in the hiding commit | Holds for a component that renders a content boundary |
| P5 | A boundary registers again when its contents change | Holds with a new id each time |
| P6 | Plite marks its own export's selection events | Holds, but the mark lasts until the next event |
| P7 | The writer fits a point an authored view hides | False: only the restore does |
| P8 | Caret keys step over a collapsed skip boundary | Holds by existing tests, one view |
| J1 | A parked anchor follows a later update that moves its block and edits it | False in one update: `[0,0]@0`; holds across two updates |
| J2 | A view-store write and the fence's revision land in one React commit, the boundary's layout effect before the fence | Holds in all eight orders, StrictMode included |
| J3 | A flush from a native beforeinput listener draws a pending render | Holds for an external-store render; a plain component state render does not flush |
| J4 | A restore that skips the projected-selection clear leaves no native caret | Holds in jsdom: nothing is exported |
| J5 | A routed content-root holder types with no claim | False: one extra settle on every keystroke |
| L1 to L5, L7 | The live selection follows one update that moves its paragraph and inserts before it, through a plain update, a command spec and an authored editor, in `abcdefghij` and in `aaaa` | Holds at base `a28e4ee` and on the lead tree: `[1,0]@4` and `[1,0]@3` |
| L6, L8 | The live selection follows the same change applied from another editor | False at base and on the final tree: `[0,0]@0`; following the paragraph needs move identity in the change format (suggested task) |
| L2 with round 1's fallback | An anchor follows the `aaaa` case | False: `[1,0]@2`; the anchor lands at `[0,0]@0` in an authored editor |

J3 leaves one limit: a section that collapses through its own component state and is typed into before React draws the collapse takes that keystroke at the caret's old place, and the clamp moves the caret out when the collapse draws.

## Close

Reversals and deviations come first.

- Review cut this plan's way of telling which view a browser selection came from and sent it back to planning. The [selection import plan](2026-10-21-view-selection-import.md) rebuilt it, and both plans land with the [view-state plan](2026-10-20-runtime-view-state.md) in one commit.
- The paired timing never ran, because the host's load stayed above the limit of 9. t_43ad4bac owns it, and the plan claims no typing speed.
- The hand drive ran each cell once in Chromium, because the built-in browser drives only Chromium. The browser spec in t_0bc74410 owns Firefox, WebKit and the five warm runs (Defaults "spec the drive").

Each caret write now carries its own view and root. A view's bookmark takes every step the live caret takes, undo gives each view its caret from before the edit unless it placed a newer one, and focusing a view places its bookmark at once. When a view hides the section holding its caret, the caret moves to the end of the section's title before the screen draws. The placer stack, the spec flags, the re-apply flag, aggregate parking, parked anchors and `writeRuntimeSelection` are gone.

Of the 7 steps, 5 are done, 1 is partial (the count probe passes and the timing waits on t_43ad4bac), and 1 accepted a narrower proof (the hand drive).

Proof:

- The count probe passes on the final tree, and `view-carets.test.tsx` passes 188 of 188 (`round3-fixes/final-view-caret-work-a1.log`).
- The browser spec passes in Chromium, Firefox and WebKit over five runs with no retries, on the selection import plan's last fixes (`round3-browser/spec-*-a1.log`).
- The ten cells in `hand-drive/close-drive-cells.md` hold in Chromium, among them the blank click that ends with no caret, closing and focusing in one batch, and the click into a parked view.

Limits:

- Typing speed with resting carets is unmeasured until t_43ad4bac runs.
- Firefox and WebKit run only the browser spec's cases until t_0bc74410 lands.
- A caret through one change that moves and edits its paragraph goes to the paragraph's old spot, as at base (Defaults).

## Open work

- Run the paired keystroke timing on a quiet host. owner: zbeyens. stop: suggested task t_43ad4bac lands or is dropped. Tracked in the suggested-task ledger.
- Run the hand-driven cases in Chromium, Firefox and WebKit through the browser spec. owner: zbeyens. stop: suggested task t_0bc74410 lands or is dropped. Tracked in the suggested-task ledger.
