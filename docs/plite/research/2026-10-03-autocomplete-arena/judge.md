# Autocomplete arena verdict

I checked the cited path:line claims that the scores depend on, at fe0e9599a6. Scores run 0 to 4.

## built (baseline): 15/24

| Criterion | Score | Evidence |
| --- | --- | --- |
| 1. Laws | 2 | Fails the combobox law: `syncAria` never sets `role` (O:191-211). Owned content roots are rejected by root equality (O:236), and their keys are consumed at RK:563-575. Law 6 completes by value (`sameOffer`, O:66-67), so a stale row with equal text can complete a newer occurrence. Law 9 rests on a `[data-editor="true"]` DOM check (O:223-230). |
| 2. Ownership | 2 | Four Plite gaps are patched in Plate glue: the private tag (M:13), the U+FEFF strip (O:388), the focus check, and the key WeakMap (`editableKeyDown.internal.ts:7-22`). VISION.md:48-49 forbids this. Whichever hook mounts first creates the owner (H:95-109). Its ARIA writes compete with props. |
| 3. Depth | 3 | Call sites are small, but every popup threads `editableRef`. Every feature declares all five required `ComboboxState` fields as mutable state (S:11-22). `complete(match, cb)` takes the match back. |
| 4. Scale | 3 | The scan is bounded (M:171-175): 4 node reads, +0.8 ms p95 paced (AP:426). It still runs one scan per mounted popup, two refreshes per keystroke, and `syncAria` on every render (H:111-114). |
| 5. Proof | 3 | 18 package cases and 13 browser cases exist (verified). Nothing proves the combobox role. The typing probe asserts nothing. Settle and the WebKit confirming Enter have no device proof. |
| 6. Subtraction | 2 | Baseline. |

## candidate-1 (ideal target): 20/24

| Criterion | Score | Evidence |
| --- | --- | --- |
| 1. Laws | 3 | Each law names a mechanism. Combobox: a role switch, with `EditorContentProps` reserving the attribute names. Law 6: the popup is keyed by occurrence. Gaps: ARIA for the nested Editable that holds focus in a content root (editable-text-blocks.tsx:588) is left open. Law 9 relies on `TypedText.view`, which may not tell two Editables of one view apart. Plite ending a composition is unverified. |
| 2. Ownership | 3 | Substrate facts move to Plite, policy becomes a compiled declaration (plate.md:488-497), and popup lifetime equals occurrence lifetime. But the WebKit keyCode-229 filter becomes a Plite-wide keydown law for every handler. `api.dom.textToCaret` brings back a public composition read that the third pass cut (AP:361, AP:369-370), and C1 does not say so. |
| 3. Depth | 4 | Features declare `combobox: { trigger: '@' }` with defaults. `slots.combobox` receives an opaque `occurrence`, and `match.complete(cb)` is bound. No `editableRef`, no stage leaks. |
| 4. Scale | 4 | Idle typing costs one Set lookup per inserted character: zero node reads, zero renders, no popup mounted. Only the active popup rerenders. Opening an occurrence mounts a popup, so the trigger keystroke has the highest cost (unmeasured). |
| 5. Proof | 2 | The next step names the right package tests: two Editables, a content root, paste/undo/remote exclusion. It also adds device-only claims: Android replacement normalization, Plite ending a composition, and a global 229 filter that Playwright WebKit cannot emulate (autocomplete-ownership.md:186-189). |
| 6. Subtraction | 4 | Deletes the owner, the key registry, `ComboboxState`, RegExp triggers (no first-party combobox uses one; verified), `triggerQuery`, the tag heuristics, `afterEditable` registration and idle popups. Adds two Plite reads, one field and one slot. |

## candidate-2 (Plite substrate owner): 18/24

| Criterion | Score | Evidence |
| --- | --- | --- |
| 1. Laws | 4 | The only candidate whose table covers every native constraint. Laws 5 and 9 use the input controller's own grouping origin (verified: input-state.ts:534, input-history.ts:44, history-plugin.ts:433). Content-root keys are arbitrated before RK:563 (verified: Enter/Backspace/Delete are captured and stopped at RK:94-100 and RK:613), with ARIA on the nested mount. Law 6 uses a minted identity. It names its one law change: a region start reads the previous char as `''`. |
| 2. Ownership | 3 | Mount facts land in the runtime that owns them, and `settleInput` goes private (its only external caller is O:101; verified). But the latest-trigger tie rule, the fixed key set and the combobox role switch are product policy, now in Plite. C2 concedes this. |
| 3. Depth | 2 | Plate call sites are unchanged. Plite gains seven public names whose only real consumer is Plate, and `lookbehind`/`typedFrom` leak the scan stage into a public matcher. |
| 4. Scale | 4 | One window read shared by all matchers (predicted 1 node read vs 4). Commits from other mounts, remote and historic commits cost one origin comparison. `focusin` is heard only while open. |
| 5. Proof | 3 | A raw-Plite package test with two Editables and a content root proves laws 5 and 9 and content-root keys without a DOM check. Same device-only settle claim as C1. It rewrites an owner that 31 cases cover, so all of them must port. |
| 6. Subtraction | 2 | Plate code mostly moves into Plite rather than disappearing. Removes public `settleInput`, adds seven names, keeps `ComboboxState`. Its strongest win, owned content roots, serves no first-party plugin today (AP:387; verified). |

## candidate-3 (query outside document text): 11/24

| Criterion | Score | Evidence |
| --- | --- | --- |
| 1. Laws | 2 | Changes laws 1, 3 and 7 and states the costs (allowed). Law 8 needs an unbuilt `tx.history.split()` whose interaction with authored capture (history-plugin.ts:585-587) and collaboration is unknown. The new "trigger ends at caret" rule stops opening when an IME commit lands the trigger inside a longer insertion, a case built covers (useCombobox.spec.tsx:191). C3 lists this only as a tradeoff, but it is a regression against laws 5 and 10. |
| 2. Ownership | 1 | Query IME moves from DOMInputRuntime to a native input, against the native-input-authority review. It creates two undo stacks. It reopens the input-element direction the governing rechallenge rejected a day earlier (alternatives[3], [4]) and rewrites plate.md:374-378. |
| 3. Depth | 3 | The built surface plus `label`; draft focus and landing stay hidden. But `dismiss` now writes text and `complete` writes two undo batches. |
| 4. Scale | 3 | Query keystrokes produce zero commits, a real win for collaboration and subscribers. Ordinary typing keeps the per-popup scan. Open and close add two focus moves, a rect read and a decoration refresh. |
| 5. Proof | 1 | The claim that decides the direction (soft keyboard and IME state survive programmatic focus moves on iOS and Android) needs physical devices. Shard 004:47 shows the old input never opened under Pixel 5. |
| 6. Subtraction | 1 | Deletes `readComboboxQuery`, the key registry and the DOM preview. Adds a draft lifecycle, `land()`, width reservation, a Plite history primitive and a Vision rewrite. |

## Recommended base: candidate-1

C1 matches the Boundary Law split best. Neutral facts go to Plite: typed-text provenance, exact focus, settle, the IME-confirm filter and capture offering. Occurrence, tie-break and ARIA policy stay in Plate. It has the smallest call sites, the most real deletion and zero idle work. C2 is stronger on laws, but it pays by putting product policy and seven public names into Plite for a single consumer. Its decisive content-root win serves no first-party plugin today.

C1 needs three repairs before interrogate:
- **Mount identity:** carry mount identity in `TypedText`. This is C2's graft, below.
- **Preview read:** either justify reversing the cut public composition read, or keep the preedit preview as a private read.
- **ARIA target:** say which element gets the combobox ARIA inside an owned content root.

## What to graft from each losing candidate

- **From candidate-2:** derive mount identity from the per-controller native grouping origin (`nativeHistoryOrigin`, input-state.ts:534; read at history-plugin.ts:433). It already exists and is stamped on mounted typing paths. It closes C1's law 9 gap for two Editables over one view. Its arbitration point, before the projected-editing capture at RK:563, should be what C1's "offer capture-consumed keys first" means.
- **From candidate-3:**
  - Use Plite's existing `screenReaderAnnouncementEffect` (screen-reader-announcement.ts:13-17, rendered by `EditorAnnouncementLiveRegion` at use-plite-runtime.tsx:737) as the polite live-region fallback, instead of a live region in copied UI.
  - Add a query-typing cohort to the key-to-paint contract. Every query keystroke is a full commit with collaboration encoding, and nothing measures that today.
- **From built:** port its 31 cases as the acceptance oracle, and keep its `complete` transaction unchanged: settle, recheck inside one `new-batch` update, refuse through a private symbol, TypeError for a thenable.

## Claims found false or overstated

- **C1, overstated:** "slot not rendered in read-only views (P:310)" only covers editOnly plugins. `isEditOnly(plateReadOnly, plugin, 'slots')` skips only those; slash and emoji are editOnly, mention and footnote are not. Law 9 in read-only views needs C1's host gate, not the slot.
- **C1, unacknowledged reversal:** `textToCaret` brings back the public composition read the third pass cut (AP:361, AP:369-370).
- **C2, overreach:** VISION.md:51 and plite.md:400-403 forbid parallel view-state carriers and widget or target-store lanes. They do not forbid a key lane, which is the reading C2 gives them.
- **C2, unverified:** "both typing paths stamp" the origin. mutation-controller.ts:1144-1146 stamps only when an input controller exists, so it holds for mounted Editables, but not every commit path was checked.
- **C3, understated:** "a trigger inside a multi-character insertion no longer opens" is presented as a minor tradeoff. It breaks IME and Gboard commits that land `@` together with following text, a behavior built tests directly.

Every other cited path:line I checked held, including: the private `dom-text-input` tag missing from the public union (editor.ts:826-841, set at mutation-controller.ts:1142); no keyCode 229 handling anywhere in `plitejs/src/react`; `role` overridable by props (editable.tsx:482-486); the internal-target branch never calling the user handler (only K:700 does); C3's blur flush, decoration `style` support and history API citations; and the AP case counts (18 package, 13 browser) and node-read counts (800 before the bound, 4 after).