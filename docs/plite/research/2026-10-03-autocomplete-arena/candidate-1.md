# Candidate 1 (runner 1, direction: ideal target). The editor content host owns the occurrence

Citation shorthand: O, H, M, S, P, IC, R, K as in the grounding.

## Problem

Autocomplete keeps the query as ordinary text and needs one occurrence per view that opens on typing, follows IME preedit, completes atomically and gives the root combobox semantics. The built design works, but it runs four substrate facts through Plate glue and leaks Plite internals into Plate:
- Private tag: it reads the private `dom-text-input` tag (M:13), absent from the public tag union (packages/plitejs/src/interfaces/editor.ts:826-841), set at packages/plitejs/src/react/editable/mutation-controller.ts:1142.
- Renderer placeholders: it strips Plite's U+FEFF placeholders itself (O:388).
- Focus sniffing: detects another editor's focus by `[data-editor="true"]` (O:223-230).
- IME-confirm Enter: filters keyCode 229 for the combobox only (O:302-304); Plite has no such filter, so every other Plate shortcut still receives WebKit's confirming Enter.
- Owner discovery: whichever popup hook mounts first creates the owner (H:95-109), found by WeakMap (O:61).
- Idle work: four always-mounted popups each scan on every keystroke (O:251-269), and syncAria runs on every hook render (H:111-114).
- Policy storage: immutable trigger policy lives in mutable store state, every field required (S:11-22).
- Stale options: keeping options current is left to copied-UI discipline (IC:254-258).
Constraints: Plite owns IME lifetime (2026-09-12-native-input-authority); copied UI owns catalogs, filtering, active option and presentation (docs/vision/plate.md:374-378); the editor root's role can be overridden by props (packages/plitejs/src/react/components/editable.tsx:482-486).

## Usage

```ts
BaseMentionPlugin  = definePlugin('mention',      { combobox: { trigger: '@' }, schema: {...} });
BaseSlashPlugin    = definePlugin('slashCommand', { combobox: { trigger: '/' }, editOnly: true });
BaseEmojiPlugin    = definePlugin('emoji',        { combobox: { trigger: ':', queryChar: /^[\p{L}\p{N}_+\-:]$/u }, ... });
BaseFootnotePlugin = definePlugin('footnote',     { combobox: { trigger: '[^', previousChar: null }, ... });
```

```tsx
export const MentionKit = [MentionPlugin.configure({ component: MentionElement, combobox: { previousChar: /^$|^[\s"']$/ }, slots: { combobox: MentionCombobox } })];
export const SlashKit = [SlashPlugin.configure({ combobox: { enabled: ({ editor }) => { const code = editor.plugin(BaseCodeBlockPlugin); return !code.installed || !editor.read.nodes.some({ type: code.schema.type }); } }, slots: { combobox: SlashCombobox } })];
export const EmojiKit = [EmojiPlugin.configure({ slots: { combobox: EmojiCombobox } })];
export const FootnoteKit = [FootnotePlugin.configure({ slots: { combobox: FootnoteCombobox } })];
```

The copied popup is rendered only while its feature owns the occurrence, keyed by that occurrence:

```tsx
export function MentionCombobox({ occurrence }: { occurrence: ComboboxOccurrence }) {
  return (
    <InlineCombobox occurrence={occurrence}>
      <InlineComboboxContent>
        <InlineComboboxEmpty>No results</InlineComboboxEmpty>
        {users.map((user) => (
          <InlineComboboxItem key={user.ref} value={user.label} onSelect={(tx) => { tx.plugin(MentionPlugin).insert(user); }} />
        ))}
      </InlineComboboxContent>
    </InlineCombobox>
  );
}
// inside copied InlineCombobox / InlineComboboxItem
const { match, listboxId, dismiss } = useCombobox(occurrence, { activeOptionId, shown, onKeyDown });
onClick={() => match.complete((tx) => onSelect?.(tx), { focus: focusEditor })}
```

A custom hashtag: `definePlugin('hashtag', { combobox: { trigger: '#', queryChar: /^[\p{L}\p{N}_-]$/u, maxQueryLength: 50 }, schema: {...} })`.

## Shape

```ts
// platejs/combobox
export type ComboboxTrigger = Readonly<{
  trigger: string | readonly string[];          // RegExp triggers cut: no first-party use
  previousChar?: RegExp | null;                 // default /^\s?$/; null admits any
  queryChar?: RegExp | null;                    // default: any but newline
  maxQueryLength?: number;                      // default 75
  enabled?: (context: { editor: InputRuleEditor }) => boolean; // read-only veto
}>;
// private matcher: compileTriggers(plugins) -> TriggerIndex keyed by each trigger's final character; findTrigger(read, typed, index); readQuery(read, occurrence, caret)
// platejs/combobox/react
export type ComboboxOccurrence = { readonly [brand]: 'ComboboxOccurrence' };
export type ComboboxMatch = Readonly<{ composing: boolean; query: string; range: Range; trigger: string; complete: (callback: (tx) => false | void, options?: { focus?: boolean }) => boolean }>;
export function useCombobox(occurrence: ComboboxOccurrence, options: { activeOptionId: string | null; shown: boolean; onKeyDown?: (event) => boolean }): Readonly<{ match: ComboboxMatch; listboxId: string; dismiss: () => void }>;
// private host: one ComboboxHost per mounted Editable, constructed by EditorContent; Occurrence = { id, candidate, view, trigger: Anchor<Range> (drop), typed: Anchor<Range> (outward/nearest), triggerText, popup, match }
// Plite additions (native owner review)
type TypedText = Readonly<{ view: Editor; text: string; range: Range; commit: EditorCommit }>;
editor.api.react.subscribeTypedText(listener: (typed: TypedText) => void): () => void;
editor.api.dom.textToCaret(from: Point): string | null;
```

Data flow: Plite's DOM input runtime commits typed text in view V and emits TypedText to the host; the host checks each inserted character against the index (zero node reads); a hit triggers one bounded run read for all candidates; latest trigger start wins, plugin order breaks a tie, `enabled` runs on the winner; the host opens an occurrence with V's anchors and subscribes to commits and view state; a ComboboxSlot child of EditorContent renders `slots.combobox` keyed by occurrence id; the popup's useCombobox reports shown, activeOptionId and onKeyDown in a layout effect; the host syncs ARIA and claims keys; while V composes the query previews textToCaret(triggerEnd); match.complete runs settleInput(), rereads and compares the match, then one new-batch update with rechecks, deletion and the callback, then closes and focuses occurrence.view.

Load-bearing decisions: policy is a feature declaration compiled once like input rules (docs/vision/plate.md:488-497, 1025-1035); popup lifetime equals occurrence lifetime (remount per occurrence resets store, active option and async rows, deleting registration, the WeakMap, idle popups and first-mounts/last-disposes); substrate facts move to Plite (typed-text provenance, exact focus flag, preedit text read, ending composition, the IME-confirm key filter, offering capture-consumed keys).

Module map: Plite React typed-text.ts (subscribeTypedText, Android replacement-to-insertion normalization), exact isFocused in editable-dom-runtime.ts, Plite DOM textToCaret, settleInput ends an active composition where proven else returns false (no unmounted fallback), keyCode 229 and post-compositionend Enter never reach onKeyDown and capture-consumed projected keys offered to onKeyDown first; Plate `combobox` field and compiled matcher; Plate React slots.combobox typing, comboboxHost.internal.ts wired in PlateContent, useCombobox; features keep inserts and selectAfterInline; migration unchanged; copied UI keeps catalogs, filter, active option, listbox, optional live region. Deleted: comboboxOwner.internal.ts, utils/editableKeyDown.internal.ts, ComboboxState, the M:13-50 tag heuristics.

## Laws

1 host stores anchors and a derived match, completion is one view.update; 2 preview is a read; 3 bounded run read stops at non-text siblings and parent, root and parent shared, newline ends; 4 queryChar and maxQueryLength per feature, leading space ends, copied UI dismisses trailing space with no results; 5 only subscribeTypedText opens, excluding caret moves, history, paste, migration, remote by construction; 6 drop range anchor plus typed extent, popup keyed by occurrence id, complete checks occurrence identity and query; 7 settle, reread, rechecks inside the update including enabled, private sentinel refusal, thenable TypeError; 8 one new-batch update, historic commits never emit TypedText; 9 one host per EditorContent, TypedText.view names the receiving view, slot not rendered in read-only views (P:310); 10 Plite skips onKeyDown while composing and for IME-confirm keys, complete refuses unless settling ends composition; 11 compiled index keeps plugin order, latest start wins; 12 dismiss never focuses, complete focuses occurrence.view only when connected; 13 migration unchanged; combobox recognition: host sets role=combobox, aria-expanded=true, aria-haspopup=listbox, aria-autocomplete, aria-controls, aria-activedescendant while shown and restores role=textbox on close, EditorContentProps omits these keys.

## Cost

No occurrence and a non-trigger final character: one Set lookup per inserted character, zero node reads, zero React renders, no commit subscription. Trigger-final character: one bounded run read for all candidates, one enabled call; opening mounts one popup, so the trigger keystroke is the costliest (unverified, needs the key-to-paint contract). Open occurrence: as built, plus one Plite DOM text read while composing; only the active popup rerenders.

## Public API delta

Added: plugin field `combobox: ComboboxTrigger`, `slots.combobox`, `useCombobox(occurrence, options)`, `ComboboxOccurrence`, `ComboboxMatch.complete`, Plite `api.react.subscribeTypedText`, Plite `api.dom.textToCaret`. Changed: settleInput ends composition where proven and returns false with no mounted runtime; isFocused exact; Plite keydown law for IME-confirm keys and capture offering; EditorContentProps omits combobox ARIA keys. Removed: ComboboxState and its five fields, RegExp triggers, triggerQuery (replaced by enabled), the old useCombobox({ plugin, editableRef, open, ... }), UseComboboxOptions, UseComboboxReturn, box.complete(match, cb), popups registered in afterEditable. Kept: filterWords, migration, feature inserts, selectAfterInline.

## Tradeoffs

Compile-once triggers (no runtime trigger changes) for optional defaults, an index and type-level slot gating; a popup mount per trigger and lost exit animations for zero idle work and occurrence-scoped option identity; two new public Plite reads for deleting four Plate workarounds; a tap during composition refuses where Plite cannot end a composition, for copied UI that always prevents option pointer-down; imperative ARIA writes on the root for no Editable rerender per active-option change.

## Alternatives

Built per-Editable owner with mounted popups (loses on depth, leaks internals, idle work); a Plite-owned typeahead primitive (triggers, tie-break and completion are product policy); input-rule activation (rules run without a view); isolated query or input element (rejected by the rechallenge).

## Open questions and risks

Role toggle announced by VoiceOver/NVDA or permanent role=combobox or live region; can Plite end an active composition and keep focus on Gboard and iOS; does Android commit a typed @ as a replacement (then M:44 opens nothing); does a composition-committed trigger carry native-text-input; which element holds focus inside an owned content root; does configure({ combobox }) need a shallow merge; window blur treated as no focus change; Copilot stand-down deferred; text-run read stays a private Plate helper.

## Next step

Build Plite's api.react.subscribeTypedText first, tested over two Editables over one root, an owned content root, exclusion of paste, undo and remote edits, and an Android-style replacement commit.
