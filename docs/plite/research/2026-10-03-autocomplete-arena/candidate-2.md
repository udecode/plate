# Candidate: one Plite typeahead host per mounted Editable

At fe0e9599a6: O = `packages/platejs/src/react/features/combobox/comboboxOwner.internal.ts`, H = `.../combobox/useCombobox.ts`, M = `packages/platejs/src/features/combobox/lib/combobox.internal.ts`, P = `packages/platejs/src/react/components/PlateContent.tsx`, IC = `apps/www/src/registry/components/editor/inline-combobox.tsx`, K = `packages/plitejs/src/react/editable/keyboard-input-strategy.ts`, RK = `.../editable/runtime-keyboard-events.ts`, R = `.../editable/editable-dom-runtime.ts`, AP = `docs/plans/2026-10-01-autocomplete-ordinary-text-adoption.md`.

## Problem

Autocomplete depends on facts only the mounted Editable runtime holds: which mount produced a typed commit, which keys it will consume, whether its IME has settled, and which Editable has focus. The built Plate owner reconstructs them from outside:

- focus from view flags plus a `[data-editor="true"]` sniff (O:223-230, O:243-248);
- keys through a one-slot registry around PlateContent's keydown (`editableKeyDown.internal.ts:7-22`, P:239-242);
- settling through the public, unreviewed `ReactApi.settleInput()` (`with-react.ts:44-60`);
- ARIA written imperatively onto an element Plite renders as `role="textbox"` (O:191-211, `editable.tsx:482-486`);
- preedit via `Range.toString()` with U+FEFF stripping (O:371-389).

Two jobs are out of Plate's reach. In an owned content root, Plite's capture handler consumes Enter, Backspace and Delete and stops propagation (RK:94-100, RK:563-575, RK:613), and its internal-target branch never calls the user handler (K:497-630). The focused element there is a nested `EditableDOMRoot` Plite renders (`editable-text-blocks.tsx:573-601`, `:1702`), so combobox recognition needs ARIA on an element Plate never renders.

This candidate moves occurrence lifetime, key arbitration, composition settle, focus ownership and combobox ARIA into one neutral Plite React primitive. Plate keeps trigger text, character policy, vetoes and insertion. Constraints:

- IME lifetime stays in DOMInputRuntime with no competing input authority (`2026-09-12-native-input-authority.json`); the host only reads its facts.
- No public composition read: AP cut one (AP:361, AP:370).
- Plate apps never import plitejs (`VISION.md:44`).

## Usage

The four feature popups and their kits stay as they are:

```tsx
export function MentionCombobox({ editableRef }: { editableRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <InlineCombobox editableRef={editableRef} plugin={MentionPlugin}>
      <InlineComboboxContent>
        {MENTIONABLES.map((item) => (
          <InlineComboboxItem key={item.ref} value={item.label}
            onSelect={(tx) => { tx.plugin(MentionPlugin).insert({ label: item.label, ref: item.ref }); }}>
            {item.label}
          </InlineComboboxItem>
        ))}
      </InlineComboboxContent>
    </InlineCombobox>
  );
}
// SlashCombobox: plugin={SlashPlugin}; a guarded onSelect returns false (slash.tsx:293-337)
// EmojiCombobox: plugin={emojiPlugin} filter={false} hideWhenNoValue (emoji.tsx:20-35)
// FootnoteCombobox: plugin={FootnotePlugin} filter={false}; refuses a defined ref (footnote.tsx:417-429)

MentionPlugin.configure({
  component: MentionElement,
  initialState: { triggerPreviousCharPattern: /^$|^[\s"']$/ },
  slots: { afterEditable: MentionCombobox },
});
```

The copied popup's call keeps its options. Two other lines change:

```tsx
const box = useCombobox({ activeOptionId: activeId ?? null, editableRef, onKeyDown, open: shown, plugin });
<ComboboxPopover onMouseDown={(event) => event.preventDefault()} /> // Plite ends composition (was IC:206-209)
onClick={() => box.complete(match, (tx) => onSelect?.(tx), { focus: focusEditor })} // was IC:254-258
```

The neutrality test is a raw Plite app. This replaces the caret-scanning example (`apps/www/src/app/(app)/examples/plite/_examples/mentions.tsx:231-275`), which opens on caret placement:

```tsx
const mention = useTypeahead({
  editableRef,
  matcher: {
    lookbehind: 1,
    find: ({ text, typedFrom }) => {
      const start = text.lastIndexOf('@');
      return start >= typedFrom ? { end: start + 1, start } : null;
    },
    accepts: (query) => /^\w*$/.test(query),
  },
  open: chars.length > 0,
  activeOptionId,
  onKeyDown: (event) => moveOrPick(event.key),
});
```

## Shape

### Core types (plitejs/react, public)

```ts
/** Keys an open typeahead offers its listbox. None inserts text. */
export type TypeaheadKey = 'ArrowDown' | 'ArrowUp' | 'Enter' | 'Escape' | 'Tab';

/** One editable text region ending at the caret: the typed text plus up to the largest lookbehind. */
export type TypeaheadWindow = Readonly<{ text: string; typedFrom: number; view: Editor }>;

/** What opens and continues a query. Plite decides where, when and for how long. */
export type TypeaheadMatcher = Readonly<{
  lookbehind: number;
  /** Runs after the typed commit publishes. */
  find: (window: TypeaheadWindow) => Readonly<{ end: number; start: number }> | null;
  accepts: (query: string) => boolean;
}>;

/** Minted for one occurrence. Equal text from another occurrence never completes. */
export type TypeaheadMatch = Readonly<{ composing: boolean; query: string; range: Range; trigger: string }>;

export type UseTypeaheadOptions = Readonly<{
  editableRef: RefObject<HTMLElement | null>; // as useSelectionGeometry (use-selection-geometry.tsx:22-25)
  matcher: TypeaheadMatcher;
  open?: boolean; // keys and ARIA attach only while the listbox shows
  activeOptionId?: string | null;
  onKeyDown?: (event: React.KeyboardEvent<HTMLElement> & { key: TypeaheadKey }) => boolean;
}>;

export type Typeahead = Readonly<{
  match: TypeaheadMatch | null;
  listboxId: string;
  complete: (
    match: TypeaheadMatch,
    insert: (tx: EditorUpdateTransaction) => false | void,
    options?: Readonly<{ focus?: boolean }>
  ) => boolean;
  dismiss: () => void;
}>;

export function useTypeahead(options: UseTypeaheadOptions): Typeahead;
```

### Private host (`packages/plitejs/src/react/editable/typeahead-host.ts`)

```ts
type Registration = Readonly<{ listboxId: string; options: () => UseTypeaheadOptions }>;
type Occurrence = Readonly<{
  registration: Registration;
  mount: EditableDOMRuntime; // the host, or a content-root runtime inside it
  trigger: Anchor<Range>;    // deletion: 'drop'
  extent: Anchor<Range>;     // association: 'outward', deletion: 'nearest'
  triggerText: string;
}>;

/** One per top-level EditableDOMRuntime; registration order breaks ties. */
class TypeaheadHost {
  register(registration: Registration): () => void;
  onTypedCommit(commit: EditorCommit, mount: EditableDOMRuntime): void { throw new Error('not implemented'); }
  arbitrate(event: React.KeyboardEvent, mount: EditableDOMRuntime): boolean { throw new Error('not implemented'); }
  complete(match: TypeaheadMatch, insert: Insert, options?: { focus?: boolean }): boolean { throw new Error('not implemented'); }
  dismiss(registration: Registration): void;
  read(registration: Registration): TypeaheadMatch | null; // useSyncExternalStore snapshot
}
```

### Data flow

1. **Open.** A mount's commit path calls `onTypedCommit` only when the commit's `history.native-grouping-input` origin is that mount's input controller. Each controller allocates one (`input-state.ts:534`), both typing paths stamp it (`mutation-controller.ts:1144-1161`, `input-history.ts:44`), and history reads it (`history-plugin.ts:433`). The commit must also lack `collaboration`, `historic` and `paste` tags and be one pure insertion with a collapsed caret in a connected, writable mount. The host reads one window and calls every `find`; the latest start wins, registration order breaks ties, and both anchors live in the mount's view.
2. **Refresh,** while an occurrence exists. Both anchors must resolve. The caret must lie between the trigger end and the extent end, in one text region, with the trigger text unchanged. Then `accepts(query)` runs. While the mount composes, the query is the preedit read through the mount's own DOM mapping. A new match is minted only when a field changes.
3. **Keys.** `arbitrate` runs first in both keydown paths, before the user handler (K:700) and before projected-editing capture (RK:563). It takes an unmodified `TypeaheadKey` aimed at the occurrence's mount, outside composition and keyCode 229, with a live match and `open`. Handled keys are prevented and stopped; unhandled Escape dismisses.
4. **ARIA.** In the DOM write phase, the host sets `role=combobox`, `aria-expanded=true`, `aria-haspopup=listbox`, `aria-autocomplete=list`, `aria-controls` and `aria-activedescendant` on the mount's element. Closing restores `role=textbox` and `aria-multiline`. Editable reserves these names.
5. **Complete.** The host settles the mount privately, flushing a pending composition end and any Android input and ending a live composition. Inside `mount.view.update({ history: 'new-batch' })` it rechecks the minting occurrence, its anchors, the caret, query equality, the mount, permission and element read-only state. It then deletes from the trigger to the caret, places the caret and runs `insert`. A refusal or a thenable rolls back. After closing, it focuses the mount unless `focus` is false or the mount is gone.
6. **Focus.** While an occurrence is open, a document `focusin` that resolves through `findDOMRootRuntime` (R:228-236) to a runtime outside the host ends it. No public selection-owner query is added, because its only consumer now lives in Plite.

### Plate (platejs)

```ts
// features/combobox/lib/combobox.internal.ts keeps only pure policy.
export const toTypeaheadMatcher = (getState: () => ComboboxState): TypeaheadMatcher => ({
  get lookbehind() { return longestTrigger(getState().trigger) + 1; },   // M:112-115
  find: ({ text, typedFrom, view }) => {
    const state = getState();
    const found = findLastTrigger(text, typedFrom, state.trigger);       // M:131-164
    if (!found) return null;
    const previous = found.start > 0 ? text[found.start - 1] : '';     // index 0 only at a region start
    const pattern = state.triggerPreviousCharPattern;
    if (pattern && !stateless(pattern).test(previous)) return null;
    return !state.triggerQuery || state.triggerQuery(view) ? found : null;
  },
  accepts: (query) => isComboboxQuery(query, getState()),               // M:98-110
});

// react/features/combobox/useCombobox.ts
export function useCombobox<P extends PluginReference>({ plugin, ...options }: UseComboboxOptions<P>): UseComboboxReturn {
  const editor = useEditor();
  const matcher = React.useMemo(
    () => toTypeaheadMatcher(() => getPluginStore(editor, plugin)?.public.get() as ComboboxState), // as O:434-438
    [editor, plugin]
  );
  return useTypeahead({ ...options, matcher }); // the return type narrows insert's tx to PluginTransaction
}
```

`useCombobox` is a policy adapter, not a pass-through: it compiles live `ComboboxState` into a matcher and types the transaction, and it is the boundary Plate apps import.

### Module map

| Responsibility | Layer | Path |
| --- | --- | --- |
| Occurrence, anchors, tie rule, ARIA | Plite | `plitejs/src/react/editable/typeahead-host.ts` (new); reserved names in `components/editable.tsx:482` |
| Region window and offset-to-point mapping | Plite | `.../editable/typeahead-window.ts` (new; replaces M:52-96, M:117-129) |
| Key arbitration, content roots included | Plite | K:497, K:700, RK:563 |
| Settle, end composition, mount origin, content-root link | Plite | R:993, private; `with-react.ts:44-60` deleted |
| Public hook | Plite | `hooks/use-typeahead.ts`, `index.ts` |
| Trigger, previous character, veto, query characters, length | Plate | `features/combobox/lib/combobox.internal.ts` |
| Feature binding and transaction typing | Plate | `react/features/combobox/useCombobox.ts` |
| Deleted owner, key registry and wrapper | Plate | `comboboxOwner.internal.ts`, `utils/editableKeyDown.internal.ts`, P:239-242 |
| Insertion, focus choice, catalogs, filter, active option, live region | Plate features, copied UI | feature plugins, `inline-combobox.tsx` |
| Stored input migration | Plate | `migratePlateV54Inputs.internal.ts`, unchanged |

## Hard laws and their mechanisms

| Law | Mechanism |
| --- | --- |
| 1 | The host holds only anchors it releases; completion is one ordinary update. |
| 2 | The preview reads the mount's DOM and writes nothing. |
| 3 | Window and query reads cross sibling text leaves only, and stop at elements, roots and `\n`. |
| 4 | Plate's `accepts` keeps `queryPattern`, `maxQueryLength` and the leading-space rule. |
| 5 | Only a commit with this mount's origin and no collaboration, historic or paste tag opens one. Anchors map remote edits; Escape releases them. |
| 6 | A drop range anchor covers the trigger; `complete` accepts only a match minted for the live occurrence, where the built code compares text alone (O:66-67, O:97). |
| 7 | Private settle, a recheck inside one update, internal rollback, and a TypeError for a thenable. |
| 8 | `history: 'new-batch'`. Undo is tagged `historic`, which never opens. |
| 9 | The occurrence records its exact mount; keys and ARIA attach only there. Read-only mounts never open. |
| 10 | Arbitration runs after Plite's composing gate (K:692-698) and rejects `isComposing` and keyCode 229. |
| 11 | The latest trigger start wins. Registration order follows `afterEditable` slot order (P:306-321), which is plugin order. |
| 12 | Closing writes no selection. `complete` focuses only the surviving initiating mount. |
| 13 | The detached v54 migration is unchanged. |
| Combobox | Plite writes role, expanded and haspopup on the focused mount element, a content-root Editable included. |

## Per-keystroke cost

For a typed commit from this mount with no open occurrence, the host makes one changed-range pass and one annotation read. It reads one window shared by all matchers, then makes four `find` calls on at most the typed text plus three characters. I predict one node read for the four kits, where the built code reads four, one per popup (AP:426). Commits from other mounts, remote commits and historic commits each cost one origin comparison.

The built owner's per-Editable subscriptions (commit, view state, four DOM events, document `focusin`; O:405-420) and per-render `syncAria` (H:111-114) go away; the host listens for `focusin` only while open. With an occurrence, a keystroke costs two anchor resolves, one region read, one `accepts` call and, while composing, one DOM read. Attributes change only when their values do.

All of this is predicted, not measured. Acceptance needs the node-read count and the frozen key-to-paint contract (`docs/research/decisions/autocomplete-ownership.md:222-235`) through Benchmark.

## Public API compared with the built code

- **Adds**, in `plitejs/react`: `useTypeahead`, `UseTypeaheadOptions`, `Typeahead`, `TypeaheadMatch`, `TypeaheadMatcher`, `TypeaheadWindow` and `TypeaheadKey`.
- **Changes**: `useCombobox` keeps its options. `UseComboboxReturn.complete` gains `{ focus? }`. `ComboboxMatch` becomes the re-exported `TypeaheadMatch`. Editable reserves six attribute names.
- **Removes**: the public `ReactApi.settleInput()`; history replay keeps a private version (R:1031). Also gone are the Plate owner, `claimEditableKeyDown`, the PlateContent wrapper and the matcher walkers (M:27-96, M:117-129, M:166-234).
- **Unchanged**: `ComboboxState`, `filterWords`, kits, feature inserts and the migration.

Synthesis decision: filled in by arena.

## Tradeoffs accepted

- We accept a Plite API shaped by the ARIA editable-combobox pattern (fixed keys, role switch, latest-trigger rule) so one owner handles keys and ARIA on elements only Plite renders.
- We accept that `find` reads the editor, as slash's veto requires, so every feature predicate stays in Plate.
- We accept that a region start reads as the previous character `''`, where the built code reads across an atom (M:186-197). Mention's pattern admits `''`.
- We accept that Plite picks the mechanism that ends a composition during an explicit activation, in exchange for removing the IME branch from copied UI.

### Where it loses to keeping the owner in Plate

Plite gains a seven-name public surface whose real consumer is Plate; the raw mentions example is a demo. Every lifetime rule needs the native owner's review and ships on Plite's schedule. This rewrites an owner that works and is covered by 18 package cases and 13 browser cases (AP:409-410). No first-party Plate plugin declares an owned content root (AP:387), so the strongest win serves app-declared roots and synced blocks, not today's kits. The two-view case already has a package case (`useCombobox.spec.tsx:320`) and no browser case, so the origin check gives correctness by construction rather than a fix for an observed bug. If content-root autocomplete is out of scope for the beta, keeping the Plate owner and fixing ARIA in `ComboboxOwner.syncAria`, the governing review's selection, costs less and ships sooner. This design moves that writer into Plite; the law holds, but the call site changes.

## Alternatives considered

- **Keep the Plate owner and add a Plite key-claim callback before projected editing plus a public mount-focus query.** This is a generic pre-pipeline key lane, the kind doctrine refuses for view state (`VISION.md:51`, `docs/vision/plite.md:400-403`). It still needs a DOM lookup for content-root ARIA and keeps `settleInput` public. It adds more surface and hides less.
- **Plite emits typed-insertion events with mount identity; Plate keeps occurrences.** Shallow: Plate still needs key and ARIA hooks, so three Plite surfaces replace one.
- **An editor-level Plite `typeahead()` plugin.** Occurrences are local to a mount (law 9), and plugin-owned sessions were already rejected (AP:234-236).
- **Atlassian's isolated nested query.** The rechallenge rejected it on history, focus and Android cost.

Implementation reconciliation: none yet.

## Open questions and risks

- Can Plite end a live composition synchronously during an option activation with Gboard and WebKit? If not, `complete` returns false there as a disclosed limit. Unverified.
- Do VoiceOver and NVDA announce a role change from textbox to combobox on a focused contenteditable? No screen reader has run, so the live-region fallback stays in copied UI.
- Does each content-root controller stamp its own origin, and can its runtime link to the host at mount? Is the runtime's commit observer, after anchors map and before paint, the right call site for `onTypedCommit`? Both unverified.
- Does `useTypeahead` earn a public Plite name in best-api review, or does the native owner prefer that Plate keep the owner? The arena should force this call.
- The Android caret fault reproduces without any combobox (`autocomplete-ownership.md:190-197`), so it remains a separate Plite input bug.

## Next implementation step

Write `TypeaheadHost.onTypedCommit` and `arbitrate`, and a raw-Plite package test with two Editables over one root plus a content root. Each must open only its own occurrence, and the content root's Enter must reach the listbox before projected editing.
