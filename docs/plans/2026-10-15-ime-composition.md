# IME composition in Plite: empty paragraphs and Android keyboards

Status: building: Phase 1, the Backspace route
Page: https://claude.ai/artifact/21oM2yRGhxXWo1dNyK7iHE
Playbook: bug-fix

Supersedes [2026-10-14-ime-empty-block.md](2026-10-14-ime-empty-block.md), whose desktop fix this plan carries as landed. That plan's record ran its plan review after its first build; this plan is the PR's one iteration, with its review before the Android build.

## Brief

### What will change?

On a Mac, Chinese typing in an empty paragraph keeps its caret, and Escape no longer breaks the line. On Android, Korean and Japanese keyboards build whole syllables, and Backspace stops merging an empty paragraph upward.

### What could go wrong?

On Android the editor now saves a word when you finish it whenever the keyboard drafts it, as Korean, Japanese and SwiftKey English do. Autosave and collaborators see it one word late. Other keyboards, Safari, Firefox and iPhone are untested.

## Teach

When you type Chinese, Korean or Japanese, the keyboard shows a draft that the browser owns until you finish it. The editor must leave the draft alone and still end up with the right text.

On a desktop the editor waits for the draft to finish. On Android it updated its copy on every key, which broke three things. It redrew text the keyboard was still using, so Gboard gave up after each letter. It sometimes read the caret after the keyboard moved it, so Backspace hit the wrong spot. And nothing put back page pieces the keyboard removed.

Now Android waits too. While a draft is open, the editor's copy holds still and nothing redraws the draft. When the draft ends, through the keyboard, Space, Enter, a tap or a toolbar button, the editor reads the finished word from the page and saves it once. Backspace takes the caret from the editor, and a broken line is drawn again.

## Demo

1. Open the homepage playground, click at the end of the second paragraph and press Enter. Type the pinyin `d'd'd'd` with a Chinese input method. The caret stays at the end of the draft, where before it sat after the first letter. The clips drive Chrome's input method through its debugging protocol, and a red bar and readout mark where the caret is.

   ![before](artifacts/ime-empty-block/demo/caret-before.mp4) ![after](artifacts/ime-empty-block/demo/caret-after.mp4)

2. In a new empty paragraph, type `d'd`, press Escape, then type `hello` with the input method off. The letters appear in the paragraph, where before nothing showed up.

   ![before](artifacts/ime-empty-block/demo/escape-before.mp4) ![after](artifacts/ime-empty-block/demo/escape-after.mp4)

3. On an Android phone, open the homepage playground and add an empty paragraph. With Gboard's Korean keyboard, type ㅎ ㅏ ㄴ ㄱ ㅡ ㄹ. The paragraph shows 한글, where before it showed every letter apart. Clips follow once the phone is back.

4. In a new empty paragraph, type ㅎ, then press Backspace. The paragraph stays, empty, and the next letters you type land in it. Before, Backspace pulled the paragraph into the one above. Clips follow once the phone is back.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How Android handles a draft | The editor's copy waits for the word to finish, as on desktop, and nothing redraws the draft (look) | Keep updating the copy on every key and freeze the drawing around the draft instead | per key | big |
| Gboard Korean and Japanese | Fix them in this change, since the same broken code causes them (look) | Leave them for a later change | gboard later | big |
| Phone proof | Write the fix and its tests now; check on the phone when you hand it back (look) | Wait to build until the phone is back | wait for phone | small |
| A draft with no end signal | It stays open until the next key, a tap, a toolbar button or leaving the page; no timer | End it after a few quiet seconds | idle end | small |
| Backspace on Android | Let the browser delete as today, then redraw a line it broke | Stop the browser and delete in the editor, which some keyboards may not expect | block backspace | small |
| Text drawing | Keep how text is drawn; the draft protection already covers it | Also switch text to write only what changed | change text drawing | small |
| Where the draft is tracked | The same draft tracking desktop uses | A separate one for Android | android tracker | detail |
| SwiftKey Korean and Naver | Not tested; SwiftKey showed no Korean entry and Naver would not install | Keep trying to install them | try more keyboards | detail |
| Old plan | Mark it replaced by this one and link it | Keep both plans open | keep both | detail |

## Design

The plan panel's first round raised seven critical findings against the design this plan first adopted, which updated the model on every Android composition key and froze rendering around the composing host. Architect ran a third round on that design repaired and on a target where the model holds still, and its judge picked the second (`docs/plans/artifacts/ime-composition/architect/synthesis.md`, round 3).

Plan panel round 2 found six gaps inside the picked target and none that argues for leaving it: composition over a selection, a remote edit to the composing line, a host reader that misses Chrome's split nodes, range inputs replayed at the caret, a keydown that drops protection early, and a render forced on every key. Each has a rule in Main changes and a contract in Phase 2, so the comparison below still holds. Challenge delta: replaced. Rejected target: per-key model updates with an Android composition pin, pending coordinates at three clamp layers, a both-direction empty-host hold and an observer ledger. New target: the model holds still during an Android composition on the shared composition epoch, and one replacement read from the host commits it. Decisive evidence: every critical finding traces to model changes made while Chrome owns the composing node, and the probe below shows the existing fences hold that node on Android once its exclusions drop.

| Target | Gboard empty line | Gboard line end | Third-party replacement | Backspace route | New state | Coordinate spaces |
| --- | --- | --- | --- | --- | --- | --- |
| Incumbent (`HEAD`) | broken | broken | broken | broken | none | two, unreconciled |
| Per key, repaired | pin, host hold, drain | pending coordinates, flow metadata, tie rule | span-first chooser | bridge gate, ledger | run state, private pending range, held-record ledger | two, reconciled per key |
| Model holds still (picked) | no render reaches the host | no target resolved during the run | host diff | bridge gate, line remount | the epoch's base text, segments and marks | one |

The pick rests on one fact, run in jsdom at `158833d281` with `docs/plans/artifacts/ime-composition/architect/h-probe/h-probe.test.tsx` and `h-probe.patch`. With the epoch open on an Android root and the exclusions dropped, a decoration refresh on the composing line and a commit to another block between three composition keys write nothing on the path from the composing node to the root, on retained and custom-leaf renderers, in an empty and a non-empty line (`h-probe-fence-on-a1.log`). With the exclusions restored, the decoration refresh replaces the composing node in both non-empty cases (`h-probe-fence-off-a1.log`). A write of the node's own value is caught, so the spy sees writes. Limits: jsdom stands in for Chrome, Chrome's edits are emulated from the device traces, the probe's mutation-record check discards records and proves nothing, its empty-line decoration never applies, it spies no selection method and never replaces the text node, and its end commit is React's synthetic `beforeinput` fallback, the event-text source this design replaces. The Phase 2 contracts cover each of those.

What each removed mechanism carried:

| Removed | Carried | Replacement | Regression proof |
| --- | --- | --- | --- |
| Per-key `storeDiff`, its caret action and the insert command for composition input types | Composition text reaching the model before the end | One host-text replacement when the run ends | Composition contract: zero commits during N keys, then exactly one with the literal text |
| `handleCompositionStart`, `handleCompositionEnd` and the `IS_COMPOSING` clear in `prepareDOMTeardown` | Android's composing flag and its 25 ms end | The epoch and `setComposing`; the end's quiet wait | Lifetime contract over start-without-end, restart in the end window and teardown |
| The Android early returns in `applyEditableCompositionStart` and `applyEditableCompositionEnd` | Keeping desktop's session and its expanded-selection delete off Android | An Android branch that opens the epoch without desktop's start delete or event-text commit | `ime-caret.test.tsx` and the desktop composition contracts unchanged |
| The `isAndroidHost` exclusions in `isCompositionDOMNodeProtected` and `shouldDeferCompositionSelectionExport` | Letting per-key renders reach the composing node | None needed once nothing renders per key | The protection contract; the probe above |
| The composition half of `insertPositionHint` | SwiftKey's offset on its final composition event | The host diff, which reads the text Chrome shows and no event range | A mounted contract that reproduces SwiftKey's faulty range, then the SwiftKey device row |

Cases the per-key design kept that this one changes:

- App code, collaboration, autosave and word counts see the last committed word while a run is open. Every boundary commits, and so does the page going hidden. A remote or app edit to the composing line ends the run; an edit elsewhere leaves it open.
- `settleInput`, undo and redo end the run first, as `settleInput` flushes the Android manager today. Combobox completion waits while a run is open, as on desktop.
- An open combobox still filters per key, because it reads its query from the DOM while composing (`packages/platejs/src/react/features/combobox/comboboxOwner.internal.ts:370-395`); inferred from the code, measured by a device row.
- A trigger such as `@` typed inside a composition opens its menu at the commit. `subscribeTypedText` fires once then, and `packages/plitejs/test/react/typed-text.test.tsx:483-540` changes with it.
- The device tests that read the model while a word is composing (`apps/plite/tests/device/korean-placeholder.device.ts:22-29`, `apps/plite/tests/device/pending-korean-toolbar.device.ts:17`) read the rendered text for the preedit and the model after the boundary.

## Main changes

Landed on this branch from the superseded plan:

- A native composition in an empty text anchors on its `[data-editor-node="text"]` host when the host renders the line-break placeholder `[data-editor-zero-width="n"]`, so the selection-export deferral and DOM-write protection cover the whole preedit (`getNativeCompositionAnchor`).
- An empty `compositionend` that committed nothing finishes at once, with no pending end.
- When such a cancel finds the empty line's text host detached, `applyEditableCompositionEnd` remounts the line's element from the model before the Android manager and the app's `onCompositionEnd` run (`rebuildCancelledLine`, `getTextHostOwnerKey`, the element's own render revision and the selector context's `invalidate`).

Planned for Android, in `packages/plitejs`. The run's code lives in a new `react/editable/android-composition.ts`, so the manager, `composition-state.ts` and `editable-dom-runtime.ts`, each over 1,000 lines, only call it.

- An Android composition opens the `DOMInputRuntime` composition epoch, owner `native`, at `compositionstart` or at the first composition `beforeinput`. Its anchor is the line element, so a text host or text node that Chrome removes or replaces leaves the fences in place. It records its base: the line key, the model range the DOM selection covered at the start (collapsed or not), the line's model text and segments, and the pending marks. A start in the same line while a run is open, or within its end wait, continues it with the same base. The epoch is the only lifetime.
- A run never writes the model when it opens. Over a selection, Chrome deletes the selected DOM itself, and the end replaces the base range with the composed text in one command, so insertion policy owns the deletion and the insertion together and a rejected insertion keeps the selected text. Every line the base range touched remounts.
- `isCompositionDOMNodeProtected` and `shouldDeferCompositionSelectionExport` drop their Android exclusions, so the leaf fence, the text-flow write deferral and the selection-export deferral hold the line, and `setComposing(false)` drains the deferred writes. The selection import in `selection-controller.ts` drops its Android exemption while a run is open, as desktop's does.
- `handleDOMBeforeInput` returns at once for `insertCompositionText`, `deleteCompositionText` and `insertFromComposition`, and stores no diff, action, command or target. `handleDomMutations` returns while a run is open, so Chrome's edits to the draft force no render. The composition half of `insertPositionHint` is deleted with its contract.
- One idempotent `finishAndroidComposition(reason)` ends a run. Its reasons are `compositionend` followed by a quiet `RESOLVE_DELAY`, any non-composition `beforeinput`, a keydown that is not composing, the selection leaving the line, blur, `visibilitychange` to hidden, a pointer press outside the editor, a mounted command entering, `settleInput`, undo or redo, a commit that reaches the composing line, and teardown. The keydown exit in `applyEditableKeyDown` calls it on Android instead of `setComposing(false)`. `settleInput` ends the run and returns true, as it flushes the Android manager today.
- The run listens to commits. A commit whose change reaches the composing line, as a node, presence or text change on the line or its text keys, or a document replace, ends the run. The end reads the draft before that commit renders and writes the word in a model microtask once the update that made it has returned, so a Yjs import, which marks its own commits as remote, sends the word out as an ordinary local commit. A commit elsewhere, local or remote, leaves the run open and the draft untouched. Edits that intersect the composed text stay out of this plan's claim until the device rows for them pass. Teardown commits the draft when the editable unmounts inside a live editor root; when the root unmounts too, its view is read-only by then and the draft is dropped.
- The end reads the line's live text by walking its text nodes in DOM order, so a node Chrome split, merged or replaced counts. It strips U+FEFF wherever it appears, keeps the contents of zero-width and mark-placeholder spans, and skips placeholder text, display suffixes and non-editable content. It diffs that text with the base text. The shared prefix stops at the base caret and the shared suffix stops at the text after it, so a repeated letter lands where it was typed. The one replacement maps through the base segments. The replacement runs as one `editorCommands.insertText` with an explicit range and the base's pending marks, so plugin insert handlers run once; a removal-only result deletes inside the text and never reaches `deleteFragment`. Then `setComposing(false)`. The end remounts a line only when its text nodes differ from the base's or a handler rejected or changed the text, and then puts the DOM selection back at the committed caret. Teardown reads before detaching and exports no selection.
- After a forced end, the epoch keeps the ended composition as retired. A composition update, composition `beforeinput` or `compositionend` that arrives without a new `compositionstart` opens a new run whose base is the committed model, never a model-owned epoch, so a trailing event adds only the text it changes.
- The end of a run for a non-composition `beforeinput` runs in the outer event owner, `runtime-before-input-events.ts`, before its kernel decision, policy check and `onDOMBeforeInput` context are built. The input's native target is captured first, mapped through the run's own line offsets after the commit, and rebuilt into that context. A cancelable input is prevented and runs as a model command at that target; a non-cancelable one continues on today's Android path, and the mapped range replaces the runtime-selection fallback in `scheduleCommand`. A line remount after such an input waits for the manager's flush. Enter therefore splits after the last jamo.
- While a run is open, the integrity observer ignores outside DOM changes and combobox completion waits, as on desktop.
- `resolveEditableImplicitTarget` returns the request's fallback while the manager runs a scheduled command, not while it applies the caret action that a stored text diff schedules. After a command flush, a line whose text host Chrome removed is remounted.
- The placeholder is hidden while a run is open and restored after a cancel.

## Steps

- [x] Reproduce, on the owner's phone with real key taps over adb, the third-party Korean keyboard's `ㅎ하한ㄱ그글`, the Backspace merge, and typing outside the text host after it; Gboard Korean and Japanese committing every key apart; pinyin keyboards working. — `docs/plans/artifacts/ime-composition/android/branch-ko-hangul.json`, `docs/plans/artifacts/ime-composition/android/dbg-bs8.json`, `docs/plans/artifacts/ime-composition/android/after-bs.json`, `docs/plans/artifacts/ime-composition/android/matrix/gb-ko-writes.json`
- [x] Trace each cause with tagged probes and in-page experiments. — `docs/plans/artifacts/ime-composition/architect/grounding.md`, `docs/plans/artifacts/ime-composition/architect/grounding-d.md`
- [x] Run architect twice, three runners and a cross-judge each, and synthesize. — `docs/plans/artifacts/ime-composition/architect/synthesis.md`
- [x] Run the plan panel's first round on this plan and settle its findings. — `docs/plans/artifacts/ime-composition/panel1/opus.md`, `docs/plans/artifacts/ime-composition/panel1/astra.md`, `docs/plans/artifacts/ime-composition/panel1/sol.md`, and the round's rows in the decision log
- [x] Replay architect on the panel's replacement target and prove the pick's safety fact. — `docs/plans/artifacts/ime-composition/architect/judge-r3-answer.md`, `docs/plans/artifacts/ime-composition/architect/h-probe/h-probe-fence-on-a1.log`
- [x] Run the plan panel's second round on this revision and settle its findings. — `docs/plans/artifacts/ime-composition/panel2/opus.md`, `docs/plans/artifacts/ime-composition/panel2/astra.md`, `docs/plans/artifacts/ime-composition/panel2/sol.md`, and the round's rows in the decision log
- [x] Run the plan panel's third round on the fixes to round 2's findings and settle them at the cap. — `docs/plans/artifacts/ime-composition/panel3/opus.md`, `docs/plans/artifacts/ime-composition/panel3/astra.md`, `docs/plans/artifacts/ime-composition/panel3/sol.md`, and the round's rows in the decision log
- [x] Remove every `IMEDBG` probe and experiment, delete `imedbg-delete.test.ts`, and confirm the Android files match `HEAD` before the first product edit. — `docs/plans/artifacts/ime-composition/android/imedbg-probes.patch`, and the build row in the decision log
- [ ] Phase 1, the Backspace route. Write its failing contracts, red at `HEAD`, then build the bridge rule for command replays and the line remount after a command, and turn them green. Keep or revert on the contracts and the phone's Backspace row on the homepage. Proof: `docs/plans/artifacts/ime-composition/phase1/red-head-a2.log` for the red run at `HEAD`, the same contracts green, and the phone row.
  - Bridge: `resolveEditableImplicitTarget` returns the fallback while the manager replays a scheduled command, even when the DOM selection resolves elsewhere (`target-runtime-contract.tsx`).
  - Mounted Android Editable with a custom leaf: `[p('a'), p('ㅎ')]`, `deleteContentBackward` over `ㅎ`, then Chrome's edit emulated (host removed, `<br>` added, DOM selection on the paragraph). The second paragraph has a mounted text host again (`android-editable.test.tsx`).
  - Not built, as the decision log says: the mounted two-blocks-remain case, because a plite-only page runs the manager's commands on another editor runtime than the bridge and cannot show the merge; the phone row on the homepage checks it. The stored-diff order guard, because the replay flag wraps only the command's run.
- [ ] Phase 2, the composition run. Write its failing contracts, red at `HEAD`, then build `android-composition.ts`, the epoch branch, the protection change, the manager's early returns, the end and its boundaries, and turn them green. Keep or revert on the contracts, the desktop guards and the phone's composition rows. Proof: one red log per contract at `HEAD` and the same contracts green, written by `proof.mjs`.
  - Mounted Android Editable, custom leaf and DOM-sync, empty line and line end: ㅎ, 하, 한 with Chrome's edits emulated, Chrome replacing the text node once, a decoration that also covers empty text refreshed and a commit to another block between keys. The composing text stays connected, nothing writes on its path, no selection method runs, no full render runs, and the model holds still. After `compositionend` and the quiet wait, the model reads `한` or `…한` once and the line has one text host.
  - The same at the end of a 52-character text-flow line gives `…하`, not `…ㅏㅎ`.
  - Chrome splits `abcd` into `ab` and `cd` and composes `한` after `ab`: the end gives `ab한cd`. Split then cancel gives `abcd`, and the next typed letter lands once.
  - Three starts without an end, then a cancelable `insertText` of a space: the model reads `한글 `, the space event was prevented, and the line has one text host.
  - A keydown that is not composing during the quiet wait ends the run through the end, and the model reads `한`.
  - Replacement composition events rewriting ㅎ to 하 over `[0..1]` end as `한글`.
  - An `insertReplacementText` of `the` over `teh` while `한` is composing after it gives `the 한`, cancelable and not, on a custom leaf and on a DOM-sync page.
  - `settleInput` during the quiet wait after `compositionend` returns true with the word committed.
  - A composition over a selection inside one leaf, across two leaves with different marks, and across two blocks, with Chrome deleting the selected DOM: the model holds still until the end, then one command replaces the selection with the composed text, every touched line remounts, and the DOM caret sits after the text. An insert handler that rejects it keeps the selected text, its marks and its blocks.
  - Bold toggled on in an empty line, then a composition that Chrome writes into the mark placeholder: the text commits bold. An insert handler that rewrites typed text runs once at the commit, and one that rejects it leaves the model and the DOM equal.
  - Base `ㅋㅋ` with the caret at 0, then `ㅋ` composed: the model reads `ㅋㅋㅋ` with the caret at 1. A keyboard that picks up the word before the caret and replaces it gives one replacement.
  - A composition erased to empty in `[p('a'), p('ㅎ')]`, with Chrome removing the text host as it does: two blocks remain, the second empty with its key, and the next typing lands in it.
  - Enter during a composition under the placeholder: the blocks read `['안녕', '']` with the caret in block 2, and the placeholder hides while the run is open.
  - A block-type command during a run keeps the composed text in the changed block.
  - Two Yjs clients. While the first composes, the second empties the base text, and in another case changes the block's type. The first client settles its run before the import, the second client receives the composed word, both documents agree, and undo on the first removes the composed word in one step.
  - After a forced end, a trailing composition update and `compositionend` without a new start open a new run that adds only the text they change, and a later composition opens normally.
  - Teardown during a run commits once and leaves no scheduled work.
  - A mounted run that reproduces SwiftKey's faulty final composition range ends with the right text, marks and caret, and the next letter lands after it. This replaces the hint contract.
  - Guards that stay green and are not counted as red: the ordinary `insertText` model caret (`AxBCDE`), `ime-caret.test.tsx` and the desktop composition contracts.
- [ ] Update the contracts that encode per-key Android composition or the deleted handlers: `android-input-manager-contract.test.ts` at its composition-start, composition-end and hint cases, `typed-text.test.tsx`'s Android cases, `korean-placeholder.device.ts` and `pending-korean-toolbar.device.ts`. The device tests drop their known-failure checks for literal ones: the preedit renders `안녕`, Enter gives `['안녕', '']`, and the toolbar heading reads the original text plus `한`. Proof: the changed tests green, and each change named in the decision log.
- [ ] Rerun the Chromium IME specs that cover the desktop half and the plitejs React and DOM partitions. Proof: `apps/www/tests/browser/homepage-ime.spec.ts` five repeats with no failure against the doctored dev server URL, and the partitions green.
- [ ] Measure the typing cost with Benchmark's pre-acceptance probe on the DOM-sync plaintext page, per key and at the commit, against `HEAD`. Proof: the benchmark log under `docs/plans/artifacts/ime-composition/bench/`.
- [ ] Device acceptance on the owner's phone once it is back, with real key taps. First check the pick's device premise: in an empty paragraph on the homepage, Gboard Korean keeps one composition per syllable run and fires its end on Space. If it does not, the run stops and the design goes back to architect. Then Gboard Korean `한글` and Japanese `日本` in an empty line and at a line end, on the homepage, `/examples/plite/plaintext` and `/examples/plite/custom-placeholder`, with Enter mid-word on the last; the third-party Korean keyboard's three routes; WeType, Sogou, Baidu, iFlytek, Gboard pinyin and SwiftKey pinyin committing `你好` and surviving Backspace; Gboard English and SwiftKey English typing `@bi`, `/` and `# `, with whether each event was cancelable logged; Gboard Korean and SwiftKey English composing over a selected word; SwiftKey English autocorrect, a suggestion-strip pick and a double-space period on the plaintext page; a remote edit to the same paragraph from a second client, and an app edit, during a Gboard Korean composition, read back from both clients with follow-up typing and undo. Each route five times, model and DOM read back, preedit and commit recorded apart, and a plain contenteditable as the control per keyboard. Proof: one trace per route and repeat under `docs/plans/artifacts/ime-composition/android/accept/`.
- [ ] Record before and after clips for Demo steps 3 and 4 on the phone. Proof: the clip files under `docs/plans/artifacts/ime-composition/demo/`.
- [ ] Writing passes, the diff panel, `pnpm lint:task` on the task files, `pnpm check` compared with `HEAD`, the changeset, the decision-trail review and reflect. Proof: their rows in the decision log.

## Verification

Written at the close.

## Open work

- SwiftKey's Korean layout and Naver SmartBoard are untested on the phone. SwiftKey's language list showed no Korean entry on a full scroll, which is inferred and not checked item by item, and the Play Store page for Naver had no install button. owner: the owner (natamox). stop: the owner tries them or drops them. Tracked here.
- Safari, Firefox and iPhone were not run for either half. owner: the owner (natamox). stop: the owner takes or drops a WebKit and iOS pass. Tracked here.
