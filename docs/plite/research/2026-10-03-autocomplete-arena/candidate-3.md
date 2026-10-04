# Runner 3: view-local query draft

Paths: O = packages/platejs/src/react/features/combobox/comboboxOwner.internal.ts, H = .../combobox/useCombobox.ts, M = packages/platejs/src/features/combobox/lib/combobox.internal.ts, IC = apps/www/src/registry/components/editor/inline-combobox.tsx, P = packages/platejs/src/react/components/PlateContent.tsx, R = packages/plitejs/src/react/editable/editable-dom-runtime.ts. Commit fe0e9599a6.

## Problem

Mention, slash, emoji and footnote need one owner that opens on a typed trigger, filters during IME and completes atomically in one undo step across mounts, editors, collaboration and migrated documents. The built owner keeps the query in the document (O:321-369) and pays with a DOM-Range preedit reader (O:371-389), a key-claim registry (packages/platejs/src/react/utils/editableKeyDown.internal.ts:7-22, P:239-242), root ARIA that still exposes `textbox` (O:191-211), a public `settleInput()` whose only cross-package caller is O:101 (packages/plitejs/src/react/plugin/with-react.ts:44-60), a DOM focus heuristic (O:223-230), and query text that input rules rewrite (rechallenge record). This design moves only the query out of the document, within three constraints: no competing input authority (docs/research/review-records/2026-09-12-native-input-authority.json), no Plite widget target (docs/vision/plite.md:400-403), and the v34 bill of focus, cursor edges, two undo stacks and cancel reinsertion (shard 005:122 under docs/plite/research/2026-10-02-autocomplete-query-representation/). docs/vision/plate.md:374-378 makes ordinary-text queries Vision law; this design proposes rewriting that line.

## Usage

Typing `@` commits `@` as ordinary text. Focus moves to a native combobox input, the draft, drawn right after it; the query and its preedit stay there. An option replaces `@` with the mention. Escape, an outside click, or an arrow past either draft edge lands `@Ada` as plain text.

Plugin configuration, unchanged from the built code:

```tsx
export const MentionKit = [MentionPlugin.configure({
  component: MentionElement,
  initialState: { triggerPreviousCharPattern: /^$|^[\s"']$/ },
  slots: { afterEditable: MentionCombobox },
})];

export const HashtagPlugin = definePlugin('hashtag', {
  initialState: (): ComboboxState => ({
    maxQueryLength: 50, queryPattern: /^[\p{L}\p{N}_-]$/u, trigger: '#',
    triggerPreviousCharPattern: /^\s?$/, triggerQuery: null,
  }),
  schema: { element: { type: 'hashtag', void: 'inline', properties: { value: property.string({ required: true }) } } },
});
```

The four feature call sites only gain `label`:

```tsx
<InlineCombobox editableRef={editableRef} label="Mention" plugin={MentionPlugin}>
  <InlineComboboxItem value={item.label}
    onSelect={(tx) => { tx.plugin(MentionPlugin).insert({ label: item.label, ref: item.ref }); }} />
</InlineCombobox>
<InlineCombobox editableRef={editableRef} label="Commands" plugin={SlashPlugin}>{/* onSelect={(tx) => onSelect?.(editor, tx)} */}</InlineCombobox>
<InlineCombobox editableRef={editableRef} filter={false} hideWhenNoValue label="Emoji" plugin={emojiPlugin}>{/* tx.plugin(emojiPlugin).insert(emoji) */}</InlineCombobox>
<InlineCombobox editableRef={editableRef} filter={false} label="Footnotes" plugin={FootnotePlugin}>
  <InlineComboboxItem value={`new-${proposedRef}`} onSelect={(tx) => {
    if (numericQuery && tx.plugin(FootnotePlugin).definition({ ref: numericQuery })) return false;
    tx.plugin(FootnotePlugin).insert({ focusDefinition: false, ...(numericQuery ? { ref: numericQuery } : {}) });
  }} />
</InlineCombobox>
```

The copied popup's call:

```tsx
const box = useCombobox({ activeOptionId: activeId ?? null, editableRef, label, onKeyDown, open: shown, plugin });
// option click
if (box.complete(match, (tx) => onSelect?.(tx))) onClick?.(event);
// popover anchor
getAnchorRect={() => match && editor.api.dom.resolveRangeRect(match.triggerRange)}
```

## Shape

Types:

```ts
// platejs/combobox/react, public
export type ComboboxMatch = Readonly<{
  composing: boolean;  // the draft is composing; query includes its preedit
  query: string;       // the draft's value; never document text while open
  trigger: string;     // trigger text as typed into the document
  triggerRange: Range; // the trigger span; completion replaces it
}>;
export type UseComboboxOptions<P extends PluginReference> = {
  editableRef: React.RefObject<HTMLDivElement | null>;
  label: string;                                  // accessible name of the draft combobox
  plugin: P & RequireComboboxState<P>;
  activeOptionId?: string | null;
  open?: boolean;
  onKeyDown?: (event: KeyboardEvent) => boolean;  // Enter, Tab, ArrowUp, ArrowDown from the draft
};

// comboboxOwner.internal.ts, private
type Occurrence = Readonly<{
  popup: ComboboxPopup;
  trigger: Anchor<Range>;  // deletion 'drop': replacing or deleting the trigger ends it
  landing: Anchor<Point>;  // trigger end, association 'backward', deletion 'drop'
  triggerText: string;
}>;
type Landing = Readonly<{ caret: 'after-query' | 'before-trigger' | 'keep'; dropTrigger: boolean }>;

class ComboboxOwner { // one per Editable element, keyed as today (O:61, O:441-450)
  private readonly draft: HTMLInputElement; // created on first popup mount, outside the Editable DOM
  private open(popup: ComboboxPopup, trigger: Range): void { throw new Error('not implemented'); }
  /** The only writer of literal query text. */
  private land(landing: Landing): void { throw new Error('not implemented'); }
  complete(popup: ComboboxPopup, expected: ComboboxMatch, callback: ComboboxCompletion): boolean {
    throw new Error('not implemented');
  }
}

// Plite, HistoryTxApi (packages/plitejs/src/history/history-plugin.ts:115-124) gains:
/** End this transaction's undo batch here; later changes start a new batch. Still one commit. */
split: HistoryControlTx;
```

Each match maps privately to its occurrence, so an old row cannot complete a later occurrence with equal text; the built check compares only query and trigger (O:66-67).

Data flow:

1. Open. A typed commit runs the built activation unchanged: readTypedInsertion (M:27-50), bounded findTypedTrigger (M:166-201), tie-break and triggerQuery veto (O:251-269), root, focus and editable gates (O:243-248). One new rule: the trigger must end at the caret, since the draft starts empty (today it need only end inside the typed text, M:156). While the view composes, opening waits until Plite's view state settles and the caret still sits at the trigger end. The owner anchors trigger and landing, positions the draft at the trigger rect, copies the leaf's computed font and focuses the draft synchronously in the commit listener. Plite's blur flushes pending native input and prefers the model selection (packages/plitejs/src/react/editable/runtime-focus-mouse-events.ts:95, 136-145).
2. Query. Each draft `input` event yields `{ query: value, composing: event.isComposing }`, checked with isComboboxQuery (M:98-110). A failure while not composing lands the literal text and refocuses the Editable. A failure while composing keeps the last passing match, flagged as composing.
3. Keys. The draft's keydown applies the built isComposing, keyCode 229 and modifier guard (O:292-314), then offers Enter, Tab and the vertical arrows to the popup. Escape and ArrowRight at the end land `after-query`; ArrowLeft at 0 lands `before-trigger`; Backspace at 0 also drops the trigger. A declined Enter or Tab lands `after-query`, and Enter then runs the view's break command. Cmd+Z on an empty draft closes it and runs history undo (history-plugin.ts:106-111); otherwise the input's native undo runs.
4. Map. Every commit re-resolves both anchors and repositions the draft. A dropped trigger lands the query at the landing anchor, or discards it with its deleted region, and returns focus to the initiating Editable.
5. Leave. A draft focusout outside the popup lands with `keep`, tagged `skip-dom-selection` and `skip-selection-focus` (packages/plitejs/src/interfaces/editor.ts:830-841), so an outside click keeps its caret.
6. Land. One update with history `merge`, the tag `combobox` and no typing tag, so M:13-14 never reopens it and input rules never see it. It inserts the value at the landing anchor and places the caret.
7. Complete. The expected match must belong to the live occurrence and equal the draft's value, preedit included for a pointer activation. Inside `update({ history: 'new-batch' })` the owner rechecks both anchors, the trigger text, isEditable (O:232-238) and elementReadOnly (O:123), inserts the query at the landing anchor with the caret after it, calls `tx.history.split()`, deletes trigger start to query end and runs the callback. `false` or a thenable throws the private symbol and rolls back (O:60, O:143-151). On success the draft deactivates and the initiating Editable takes focus if the draft still holds it. Peers receive one commit; history records the landing, merged into the trigger's typing batch, and the replacement.
8. Dispose. The last popup unmount lands the query in an editable view and discards it otherwise.

Reservation. A private decoration source sets `padding-inline-end` on the trigger range to the draft's width and refreshes one node key (packages/plitejs/src/interfaces/decoration.ts:25-37). Plate reads decorations per view (packages/platejs/src/internal/plugin/getPlateDecorationSources.ts:31-50), so only the owner's view reserves space; Plate.tsx:103-107 composes the source. Decoration owns inline paint, so no widget target is needed.

Module map:

| Path | Layer | Responsibility |
| --- | --- | --- |
| packages/plitejs/src/history/history-plugin.ts | Plite | `tx.history.split()`: one commit, two undo batches |
| packages/plitejs/src/react/plugin/with-react.ts:44-60 | Plite | `settleInput` leaves the public ReactApi; the Editable keeps it for replay (R:993-1014, R:1031) |
| packages/platejs/src/features/combobox/lib/combobox.internal.ts | Plate | keep readTypedInsertion, findTypedTrigger (plus the caret rule) and isComboboxQuery; delete readComboboxQuery and isOneTextRun (M:117-129, M:203-234) |
| packages/platejs/src/react/features/combobox/comboboxOwner.internal.ts | Plate React | occurrence, draft input, draft ARIA, land, complete, reservation source |
| packages/platejs/src/react/features/combobox/useCombobox.ts | Plate React | public hook |
| P:239-242, packages/platejs/src/react/utils/editableKeyDown.internal.ts | Plate React | deleted |
| IC | copied UI | listbox, anchor at triggerRange, option mousedown always prevented (IC:206-209 today makes an exception while composing), draft styling through `[data-plate-combobox-draft]` |

Interface depth: the built hook surface plus `label`, hiding activation, anchors, the draft's focus and IME lifetime, landing, history splitting, reservation and ARIA. Red-flag screen: open, land and complete share one owner, the hook adds React lifetime rather than pass-through, and the only shared literal is `data-plate-combobox-draft`.

## Hard laws

| Law | Mechanism |
| --- | --- |
| 1 | Change: "The trigger is ordinary text. The query is view-local input of the initiating Editable until it lands once, as completed content or literal text; from then on it follows normal save/share/history rules." land and complete are its only writers, both normal updates. |
| 2 | Preedit lives only in the draft. |
| 3 | Change. Only the trigger and previous-character scan cross marks (M:52-96, M:186-197). The query is a plain string that inherits the trigger's marks when it lands. The draft opens only at a collapsed caret in editable text. |
| 4 | isComboboxQuery on the draft's value. Multiword labels work. Emoji keeps its pattern (packages/platejs/src/emoji/lib/BaseEmojiPlugin.ts:10-30). |
| 5 | Typed-commit activation (M:13-50). Landing carries no typing tag. Escape lands the literal text. Anchors map remote edits or close the occurrence. |
| 6 | Drop range anchor over the trigger plus the private match-to-occurrence map. |
| 7 | Change: the blurred Editable has already flushed (runtime-focus-mouse-events.ts:95); a pointer activation reads the draft's value with its preedit. Rechecks run inside the update; refusal or a throw rolls back and leaves the draft open. |
| 8 | `tx.history.split()`. Undo restores `@Ada` and the caret, and redo restores the completion. Historic commits never open an occurrence (M:14). |
| 9 | One draft per Editable element, positioned and focused only by its owner; reservation paints only in that view. |
| 10 | The draft keydown guard. Pointer activation during composition completes against the composed text, which the rechallenge requirements allow. |
| 11 | O:251-269, unchanged. |
| 12 | A focusout landing with skip tags. Focus returns only to the connected initiating Editable, and only while focus is still on the draft. |
| 13 | Unchanged (packages/platejs/src/migrations/migratePlateV54.ts:63); no stored document can hold an open query. |
| Combobox | Focus sits on a native `<input role=combobox aria-expanded aria-haspopup=listbox aria-controls aria-activedescendant aria-autocomplete=list aria-label>`, what v34 focused (shard 004); the root stays `textbox`, so no focused element changes role. Fallback: Plite's polite live region via screenReaderAnnouncementEffect (packages/plitejs/src/core/screen-reader-announcement.ts:13-17, packages/plitejs/src/react/hooks/use-plite-runtime.tsx:737). A screen-reader run is still required. |

What law 1 changes in practice: Users gain a real combobox for assistive technology, IME in a plain input, no input-rule or Copilot interference, and peers, autosave and suggestion records free of half-typed queries. They lose an open query on a crash, formatting or selecting across it, and a single undo stack. App authors read an open query only through `match`; `onChange`, counters and agents see the document without it.

## Per-keystroke cost

- Ordinary typing: the same bounded scan (M:171-175) per mounted popup, minus the per-event refresh (O:417-419) and per-render syncAria (H:111-114).
- Query typing: zero editor commits, against one commit per keystroke today with every subscriber, collaboration encoding and DOM reconciliation; plus isComboboxQuery over at most 75 characters and one node-key decoration refresh.
- Composition: no DOM Range reads (O:371-389).
- Open and close: two focus moves, two anchors, one rect read and one decoration refresh.

Nothing is measured; the gate is the frozen key-to-paint contract (docs/research/decisions/autocomplete-ownership.md) plus a query-typing cohort.

## Public API against the built code

- Adds: the `label` option, `ComboboxMatch.triggerRange` and Plite's `tx.history.split()`.
- Changes: `onKeyDown` receives the draft's native KeyboardEvent. `match.query` is the draft's value. `dismiss()` lands the literal text and returns focus. `complete()` writes the landing and the replacement as two undo batches in one commit.
- Removes: `match.range`, the public `ReactApi.settleInput()`, the key-claim registry with its PlateContent wrapper, ARIA writes on the editor root, the planned role switch, and the open gate for a Plite shared-selection query, because the draft's focusout ends the occurrence. docs/vision/plate.md:374-378 is rewritten.

## Tradeoffs accepted

- We accept two focus moves per occurrence in exchange for a native combobox that owns IME, keys and assistive technology.
- We accept two undo stacks and a lost open query on crash in exchange for no history, collaboration or suggestion noise per query keystroke.
- We accept an approximate overlay in exchange for no Plite widget target, and a new history primitive in exchange for real atomicity.
- We accept that a trigger inside a multi-character insertion no longer opens.

## Alternatives considered

- Ordinary text with the root role switch, the governing pick: no focus moves, one undo stack, the query under every document rule, and a popup that opens under Pixel 5 emulation (shard 004). It costs an unobserved role change on a focused contenteditable, DOM-Range preedit reads, exposure to Plite's emulated-Android tap caret fault (decision page open gates), input rules inside the query, a commit per query keystroke and content-root key arbitration.
- Atlassian's in-flow nested contenteditable: better fidelity, but it needs the widget target plite.md:400-403 forbids, and nested editing inside contenteditable is the measured failure class (ProseMirror #903, Slate #5183 and #5680 per the rechallenge; v34 never opened under Pixel 5, shard 004).
- Trigger out of the document too, via a beforeinput claim: a competing input authority that misses composed triggers and loses commit-tag provenance.
- Compensating updates instead of `split()`: a refusal publishes an insert and a delete to peers, so publication stops being the outcome boundary.
- Copied UI rendering Ariakit's Combobox input: focus waits for a React commit outside the typing gesture, four inputs per Editable, and focus and IME law move into copied code.

Where this loses to ordinary text: Mobile is the decisive loss: no surveyed editor proves isolation on Android (shard 003), and ordinary text already opens there. False positives such as `Page 1 / 2` cost two focus moves. Enter with no results and structured paste (API unverified) need handling. Fidelity rests on font matching and width reservation.

## Open questions and risks

- Do iOS Safari and Android Chrome keep the soft keyboard and IME state across programmatic focus moves between Editable and draft, and does the commit listener run inside the trusted typing event? Unverified; this decides the direction.
- After a tap during a Gboard composition, is the composed text dropped with the draft or committed into the refocused Editable? Unverified.
- Can history split one commit with authored capture (history-plugin.ts:585-587) and collaboration remapping? That is the Plite history owner's call.
- Does a landing refused by admission (maxLength) keep the draft open? Does every Enter behavior live in the break command (unverified)?
- Activation from an owned content root is still unbuilt, though keys no longer need arbitration.
- Is it accepted to change laws 1, 3 and 7 and plate.md:374-378?

## Next implementation step

Build a throwaway `/blocks/mention-demo` probe whose prototype owner moves focus from the Editable to an overlay `<input role=combobox>` after a typed `@`, and run it in desktop Chromium, Pixel 5 emulation and the local Android emulator Gboard lane before touching Plite history.
