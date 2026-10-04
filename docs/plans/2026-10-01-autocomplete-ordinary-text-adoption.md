---
review_scopes:
  - autocomplete
  - native
  - persistence
review_basis:
  - 2026-10-01-autocomplete-ordinary-text-prototype
  - 2026-09-12-native-input-authority
  - 2026-09-16-persistence-source-closure
work_kind: implementation
---

# Ordinary-text autocomplete adoption

Status: executed; the registry install proof fails on DnD registry types, and the remaining gates are in the subject's Open work.
Playbook: plan
Page: https://claude.ai/artifact/2iQkcnA7rkiCUqM1d5mpgZ

## Outcome

Mention, slash, emoji and footnote queries remain ordinary editor text. A popup opens only when the user types a trigger in an Editable, and it belongs to that Editable and that occurrence. Filtering follows live IME preedit without publishing preedit as document content. Completion replaces the still-current query once; undo restores the literal query without reopening the popup. Escape closes the popup and leaves the text untouched.

This plan supersedes the native-input target of [the earlier design](2026-10-01-autocomplete-query-activation.md). Build executed it under the user's GO; [Execution](#execution) records what changed against the design.

## Public API

A mention, slash, emoji or footnote kit mounts its popup in the plugin's `afterEditable` slot instead of installing a transient input element.

```tsx before
export const MentionKit = [
  MentionPlugin.configure({
    component: MentionElement,
    initialState: { triggerPreviousCharPattern: /^$|^[\s"']$/ },
  }),
  MentionInputPlugin.configure({ component: MentionInputElement }),
];
```

```tsx after
// apps/www/src/registry/components/editor/mention.tsx
export const MentionKit = [
  MentionPlugin.configure({
    component: MentionElement,
    initialState: {
      triggerPreviousCharPattern: /^$|^[\s"']$/,
    },
    slots: { afterEditable: MentionCombobox },
  }),
];
```

The copied popup reads the query from ordinary text through `InlineCombobox`, which calls `useCombobox`; it no longer renders inside an input node.

```tsx before
export function MentionInputElement(props: EditorElementProps<typeof MentionInputPlugin>) {
  const { element } = props;
  const [search, setSearch] = React.useState('');

  return (
    <EditorElement {...props} as="span">
      <InlineCombobox value={search} element={element} setValue={setSearch} showTrigger={false} trigger="@">
        <span className="inline-block rounded-md bg-muted px-1.5 py-0.5"><InlineComboboxInput /></span>
        <InlineComboboxContent className="my-1.5">{/* options */}</InlineComboboxContent>
      </InlineCombobox>
      {props.children}
    </EditorElement>
  );
}
```

```tsx after
// apps/www/src/registry/components/editor/mention.tsx
export function MentionCombobox({
  editableRef,
}: {
  editableRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <InlineCombobox editableRef={editableRef} plugin={MentionPlugin}>
```

Completion goes through the hook's `complete`, which takes the offered match and a callback that may return `false` to refuse, instead of the removed `BaseComboboxPlugin` commit API.

```tsx before
const combobox = editor.plugin(BaseComboboxPlugin);
const completed = combobox.api.commit(inputKey, callback);
```

```tsx after
// apps/www/src/registry/components/editor/inline-combobox.tsx
const box = useCombobox({
  activeOptionId: activeId ?? null,
  editableRef,
  onKeyDown,
  open: shown,
  plugin,
});
// in each item's onClick
if (!box.complete(match, (tx) => onSelect?.(tx))) return;
```

A custom trigger declares its policy as `ComboboxState` in the plugin's `initialState`; the input plugin, `createComboboxInput` and `triggerCombobox` are gone.

```tsx before
export const TagPlugin = definePlugin('customTag', {
  dependencies: [TagInputPlugin],
  initialState: {
    trigger: '#',
    triggerPreviousCharPattern: /^\s?$/,
    createComboboxInput: () => ({ children: [{ text: '' }], type: 'tag_input' }),
  },
  schema: { element: { type: 'tag', void: 'inline', properties: { value: property.string({ required: true }) } } },
}).extend(({ editor, store }) => ({
  commands: (context) => triggerCombobox(context, {
    editor,
    getState: () => store.get(),
    type: editor.plugin(TagInputPlugin).schema.type,
  }),
}));
```

```tsx after
// content/docs/(plugins)/(functionality)/(combobox)/combobox.mdx
export const HashtagPlugin = definePlugin('hashtag', {
  initialState: (): ComboboxState => ({
    maxQueryLength: 50,
    queryPattern: /^[\p{L}\p{N}_-]$/u,
    trigger: '#',
    triggerPreviousCharPattern: /^\s?$/,
    triggerQuery: null,
  }),
  schema: {
    element: {
      properties: { value: property.string({ required: true }) },
      type: 'hashtag',
      void: 'inline',
    },
  },
});
```

A generated plugin `insert` of an inline void leaves the caret after it, so the caller no longer moves the selection.

```tsx before
onSelect={(tx) => {
  tx.plugin(HashtagPlugin).insert({ value: tag });
  tx.selection.move({ unit: 'offset' });
}}
```

```tsx after
onSelect={(tx) => {
  tx.plugin(HashtagPlugin).insert({ value: tag });
}}
```

Footnote's `insert` drops its `trigger` option, which only the removed input UI passed.

```tsx before
tx.plugin(FootnotePlugin).insert({ focusDefinition: false, ref, trigger: '[' });
```

```tsx after
tx.plugin(FootnotePlugin).insert({ focusDefinition: false, ref });
```

Stored v53 documents migrate their input nodes to the literal trigger and query.

```ts before
p({ text: 'Hi ' }, input('mention_input', { trigger: '+', value: 'Ada' }), { text: ' ' }, input('slash_input'))
```

```ts after
paragraph('Hi +Ada /')
```

Plite's React API gains `editor.api.react.settleInput()`, which commits a finished composition or pending Android input into the model and returns `false` while a composition is still active.

## Main changes

- One private owner per mounted Editable replaces `BaseComboboxPlugin`'s editor-wide input protocol. It holds at most one occurrence as range anchors, takes Enter, Tab, arrows and Escape before Plate's shortcut table while its popup shows, and is the only writer of the Editable's combobox ARIA.
- An occurrence opens only from a locally typed commit (`dom-text-input` or `native-text-input`, never `collaboration`, `historic` or `paste`). The trigger scan reads back only the typed text plus the longest trigger, 4 node reads per keystroke where a full-run scan read 800.
- Plite's history replay now settles native input through `settleInput()` before it runs.
- One helper, `selectAfterInline`, places the caret after an inserted inline for the generated `insert`, `MentionPlugin` and footnote.
- The v54 converter gains an input stage that maps a selection inside a stored input to the end of its restored text.

## Defaults

Each row is a call this plan made for the owner. The word reverses it.

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Copilot while a popup is open | Copilot keeps its auto-trigger; standing it down needs an editor-wide popup signal this design cut | Stand Copilot down while a popup shows | stand down |
| Key-to-paint pacing | Keystrokes paced 100 ms apart, chosen after the unpaced first run queued behind development-mode rendering | Unpaced keystrokes | unpaced |
| Caret after the generated `insert` of an inline void | After the void unless `select` is passed, matching `MentionPlugin` | Leave the caret in the void | keep the caret in the void |
| `ReactApi.settleInput()` | Public until the native owner reviews it, because Plate calls it across packages | Internal to Plite | make settleInput internal |
| Owner and key-claim registries | Keyed by the Editable element | A `PlateContent` context | context |
| Which Editable is focused | `isAnotherEditorFocused` reads the DOM until Plite reports which Editable holds a shared selection | The Plite query | use the Plite query |
| Combobox activation law | No editor-behavior law; the mention law scopes it out and the decision page owns it | An editor-behavior law for activation | add combobox law |
| `work_kind` | `implementation`, because Build ran the plan under the user's GO | `design` | restore work_kind: design |

## Scope

Own Plate matching and atomic completion, one private combobox owner per mounted Editable, the `useCombobox` hook, four copied popup consumers, stored input migration, public types and teaching, generated registry output, and focused package/browser proof. Retain feature catalogs, ranking, completed node schemas, mention spacing, slash insertion/AI membership, footnote identity and focus policy, and emoji preferences.

Plite changes in two places, both under the native owner's review. An explicit option activation during composition needs a Plite-owned settle operation; history replay already runs a private version of that sequence. Keys that Plite consumes before Plate's keydown pipeline, such as projected editing keys in an owned content root, need an arbitration step that offers them to the open occurrence first. Phase 1 settles the exact shape of both with the native owner.

Exclude tag's dedicated select editor, search, the AI product UI/prompts, generic InputRules redesign, document history redesign, new release versions and live collaboration-room migrations. The latter stays with the app's persistence owner.

## Reconciliation and source

The current governing representation review is [2026-10-01-autocomplete-ordinary-text-prototype](../research/review-records/2026-10-01-autocomplete-ordinary-text-prototype.json). It supersedes the [representation deferral](../research/review-records/2026-10-01-autocomplete-representation-audit.json) and the old native-input design. Retain the [September 30 defects and completion laws](../research/review-records/2026-09-30-autocomplete-query-activation-ownership.json). The [native input authority review](../research/review-records/2026-09-12-native-input-authority.json) keeps IME lifetime with DOMInputRuntime and rejects a competing input authority, so this design reads Plite's composing state and asks Plite to settle instead of tracking composition itself. The persistence basis record retains its owner laws; its historical proof does not certify this API.

On October 1 the retained prototype runner passed 10/10 on the current source:
`bun --preload ./config/plite-source-aliases.ts docs/research/probes/2026-10-01-autocomplete-ordinary-text/run.prototype.ts`.

That runner exercises real anchors, roots and history. It reads one text leaf and compares expected query strings. It ends suppression by releasing it when the match disappears, not through anchor drop, and its point anchor does not detect trigger replacement. It does not settle formatted leaves, simultaneous same-root mounts, live Yjs, popup accessibility, composition preview or scale. The retained Chromium receipt uses synthetic CDP composition, not a physical IME.

Current owners that constrain the design:

- [BaseComboboxPlugin](../../packages/platejs/src/features/combobox/lib/BaseComboboxPlugin.ts) completes a live input in one new history batch and rolls back a throwing callback.
- [BaseMentionPlugin](../../packages/platejs/src/features/mention/lib/BaseMentionPlugin.ts) owns completed mention semantics and currently depends on an input schema.
- [BaseFootnotePlugin](../../packages/platejs/src/features/footnote/lib/BaseFootnotePlugin.ts) triggers on `^` after `[` (line 146). `insert` computes `nextRef()` inside its transaction when no `ref` is passed (line 539). `createDefinition` reuses an existing definition, which is idempotence, not option validation. The [copied footnote UI](../../apps/www/src/registry/components/editor/footnote.tsx) passes a render-time `proposedRef` and `trigger: '['` (lines 384 and 420).
- [DOMInputRuntime](../../packages/plitejs/src/dom/plugin/dom-input-runtime.ts) owns the composition epoch. The model can receive text during a composition, through its model-composing phase and Android's delayed flushes, and settlement after `compositionend` is a scheduled task.
- `editor.read.view.isComposing()` ([public-state.ts](../../packages/plitejs/src/core/public-state.ts) line 4433) is the public composing flag, and it stays true until Plite's scheduled settle. [History replay](../../packages/plitejs/src/react/editable/editable-dom-runtime.ts) refuses while composing, flushes the pending composition end and the Android manager, then rechecks (lines 989-1012).
- Commits carry tags. Local native typing is tagged `native-text-input`, Yjs remote commits carry `collaboration`, and history replay carries `historic`.
- [PlateContent](../../packages/platejs/src/react/components/PlateContent.tsx) dispatches the shortcut table before plugin `onKeyDown` handlers (lines 195-215). [Keyboard handling](../../packages/plitejs/src/react/editable/keyboard-input-strategy.ts) applies those handlers after its nested-editable, read-only and composing checks. Plite's [capture handler](../../packages/plitejs/src/react/editable/runtime-keyboard-events.ts) consumes projected editing keys for internal-control targets before any Editable listener (lines 563-575).
- The `slots.afterEditable` slot receives each Editable's `editableRef` and renders in plugin order.
- [Detached migration](../../packages/platejs/src/migrations/documentMigrations.ts) validates source lineage before running a chain. [The current v54 converter](../../packages/platejs/src/migrations/migratePlateV54.ts) is the adoption owner.
- [Mention behavior law](../editor-behavior/markdown-editing-spec.md#mention) owns completed-node insertion, spacing, deletion and keyboard access. The new query representation must retain it.

Preserve the ordinary-text probe sources and original receipts until equivalent package/browser cases exist. A plan citation does not replace executable proof. No blanket inventory refresh or rewrite of immutable earlier reviews.

## Hard laws

1. Canonical document text, marks, selection, history and collaboration remain Plite-owned. Query text follows normal save/share/history rules.
2. Preedit is view-local input state. The composition preview never writes into the document, changes focus/selection or creates history.
3. Match across adjacent formatted text in one editable text region. Stop at roots, blocks, inline atoms, noneditable content and hard line boundaries.
4. Preserve real feature space policy. Multiword mention and command labels remain usable within a bounded query; emoji shortcodes retain their own character policy.
5. Only a trigger typed locally in an Editable opens an occurrence. Caret placement, undo, redo, paste, migration and remote edits never open one; remote edits only map or close it. Escape ends the occurrence and leaves its text literal.
6. A selectable option belongs to the current feature, occurrence and query. The occurrence is a range anchor over its trigger span in one Editable. Replacing or deleting the trigger ends it, and equal text in another occurrence or mount does not qualify.
7. Completion settles native input, then rechecks the occurrence, the text from trigger to caret, the initiating mount, write permission and the absence of composition, then deletes and inserts in one transaction. A stale check or a callback refusal changes nothing; a thrown callback rolls back everything.
8. Completion creates one undo step. Undo restores the typed trigger/query and caret; redo restores the completed content.
9. Only the Editable where the trigger was typed exposes or activates its popup. Another view, root, inactive projection or read-only owner cannot adopt its interaction.
10. IME confirmation never selects an option. Live filtering does not permit keyboard completion during composition.
11. The most recently typed trigger wins; plugin order breaks a tie at one position. Every feature retains its actual product predicate and insertion/focus law.
12. Popup closure never restores an old caret over a later outside click. Post-completion focus belongs only to the surviving initiating mount.
13. Old input nodes cross an explicit detached migration boundary. Runtime creation, corrections and format parsing accept current schema only.

## Decisions

### Target and comparison

Delete BaseComboboxPlugin. Keep a pure matcher and one atomic completion inside `platejs/combobox`, one private owner per mounted Editable, and one public `useCombobox` hook in `platejs/combobox/react`. The private owner holds at most one open occurrence, evaluates the matcher once per relevant commit, takes keys first while an occurrence is open, and is the only writer of the Editable's combobox ARIA attributes. The first mounted popup hook for an Editable creates it and the last one disposes it. No editor-wide session, companion plugin, provider, option service or public cache is required. Feature plugins retain their completed nodes and typed insertion commands. Copied UI owns catalogs, filtering, ranking, the active option and presentation.

| Candidate | Owner and lifetime | Decision |
| --- | --- | --- |
| A: plugin-owned sessions | Installed behavior plugin creates and disposes Editable sessions and owns options | Reject. It adds an editor owner and a public session lifecycle to an interaction that belongs to a mount. |
| B: private interaction with plugin-state policy | Feature plugin state declares matching; one private owner per Editable holds the occurrence; each popup hook renders and completes | Select, without match witnesses, query generations or a Plite composition API. |
| C: plugin-owned tickets | Installed behavior plugin owns sessions, option tickets and headless interaction APIs | Reject. No independent current consumer pays for those public objects. |

### Public calls

The calls as designed; Execution lists where the build departed:

```tsx
import { useCombobox } from 'platejs/combobox/react';

const box = useCombobox({
  activeOptionId, // the copied list's active option, for aria-activedescendant
  editableRef,
  plugin: MentionPlugin,
  onKeyDown: handleListKey, // copied UI; returns true when it handled the key
});
const offered = box.match;

// A rendered option captures the match that offered it.
const complete = () => {
  if (!offered) return;
  const applied = box.complete(offered, (tx) => {
    tx.plugin(MentionPlugin).insert(person);
  });
  if (applied) afterCompletion();
};

box.dismiss(); // Escape: keep literal text and end this occurrence.
```

`match` is null or an immutable snapshot with the query, the trigger range and the replacement range, backed by the occurrence's anchor. A new snapshot appears only when the query or occurrence changes, so async results and memoized rows can compare by identity. While the view composes, `match.query` previews the preedit and `match.composing` is true. `box.listboxId` names the popup's listbox for `aria-controls`.

`complete(expectedMatch, callback)` returns a boolean. A stale match, an unsettled composition or an ineligible view returns false without edits. The callback is synchronous and infers the current transaction. It returns nothing to commit or `false` to refuse, and refusal rolls back the deletion and the insertion together. An unavailable slash action or a footnote option whose state changed therefore leaves the literal query. The callback type is `(tx) => false | void`, so an async callback fails to type-check, and a thenable returned at runtime rolls back and throws. A thrown callback propagates after rollback. There is no `complete(callback)` overload that silently adopts the current query.

`onKeyDown` receives Enter, Tab, ArrowUp, ArrowDown and Escape while this hook's occurrence is open. When it returns true, the owner prevents the default and stops propagation. Unhandled Escape dismisses. With no results, Enter returns false and inserts a break as usual. Options prevent pointer-down so the Editable keeps focus and its selection. The copied UI may keep Ariakit's store, driven imperatively, or render a plain listbox. It never makes the Plite Editable Ariakit's base element.

The hook's `plugin` names the feature. Matching policy is that plugin's current state, a `ComboboxState` read at match time: `trigger`, `triggerPreviousCharPattern`, `triggerQuery`, `queryPattern` and `maxQueryLength`. Built-in kits already configure that channel through `initialState`, including slash's code-block exclusion. The matcher clones regular expressions without `g` or `y` flags, so `lastIndex` never carries between reads. Custom predicate context must infer from the owner; Phase 1 rejects a design that needs parameter annotations or casts in the custom tag example.

The matcher and completion are internal. Existing editor transactions remain usable without React; this plan adds no public headless popup or session API.

Registration and mounting use the current plugin and Editable slot owners:

```tsx
const HashtagPlugin = definePlugin('hashtag', {
  initialState: (): ComboboxState => ({
    maxQueryLength: 50,
    queryPattern: /^[\p{L}\p{N}_-]$/u, // tested per query character
    trigger: '#',
    triggerPreviousCharPattern: /^\s?$/,
    triggerQuery: null,
  }),
  schema: { element: { /* ... */ } },
});

HashtagPlugin.configure({ slots: { afterEditable: HashtagCombobox } });

// Each built-in kit installs its popup in the same existing slot.
MentionPlugin.configure({ slots: { afterEditable: MentionCombobox } });
SlashPlugin.configure({ slots: { afterEditable: SlashCombobox } });
EmojiPlugin.configure({ slots: { afterEditable: EmojiCombobox } });
FootnotePlugin.configure({ slots: { afterEditable: FootnoteCombobox } });

// EditorContent renders those four slots for THIS Editable and supplies each
// popup with its exact editableRef; ordinary setup needs no extra provider.
<EditorContent />;
```

The owner subscribes to its Editable's commits, holds at most one trigger anchor, and releases it when the occurrence ends, on completion and on unmount. It creates anchors in commit listeners, never during render, so StrictMode double renders allocate nothing. Only a plugin with a mounted popup in that Editable can open an occurrence, and the first mounted popup whose policy matches wins a tie. Attachments are scoped to the initiating Editable and cleared on close/retirement. Copied rows and async responses keep the match that offered them; rerendering must never relabel old options with a newer match.

### Occurrence lifecycle and matching

A commit opens an occurrence when it carries `dom-text-input` or `native-text-input`, carries none of `collaboration`, `historic` or `paste`, and makes one pure insertion that ends at the caret with a feature's trigger, with the owner's previous-character pattern satisfied. With two panes on one root, the focused view claims it. The owner anchors the trigger span as a range with `deletion: 'drop'`. An expanded drop anchor ends when a change covers its range ([anchor.ts](../../packages/plitejs/src/core/anchor.ts) lines 1530-1549), so replacing or deleting the trigger in one change ends the occurrence. Footnote's trigger becomes the two-character `[^` with no previous-character constraint, so `claim[^1` still opens. The matcher and the prototype extend to multi-character triggers.

The query is the text from the trigger span's end to the caret. The walk crosses marks in one editable text region, maps string offsets back to points, stops at a block, root, atom, hard break or permission boundary, and never builds a whole-document index. The replacement range runs from the trigger start to the caret; text after the caret stays.

The occurrence ends when:

- the caret leaves the range from trigger start to query end;
- a query character fails the owner's per-character `queryPattern`;
- the query exceeds `maxQueryLength`, 75 by default;
- the copied UI dismisses it, which it does on Escape and after a typed space with no results.

A typed character that fails as a new trigger extends the open query when the query policy admits it, so emoji's closing colon in `:smile:` stays in the emoji query. A newly typed trigger replaces an open occurrence. Escape releases the anchor, and continued typing reopens nothing, because only a typed trigger opens an occurrence. Undoing a completion restores the literal query and caret with no occurrence.

Inside the synchronous new-batch update, recheck the occurrence anchor, the text from trigger to caret against the offered query, the initiating mount, the active feature, write permission and the view's composing flag. Delete the replacement range and execute the feature command in that update. Successful publication ends the occurrence. Losing focus or clicking elsewhere never restores an old selection.

Catalogs stay outside the shared owner. Synchronous emoji search replaces the unneeded delayed search. Custom asynchronous results keep the offered match, discard responses when that match retires and recheck completion; abort is an optimization, not correctness. No public async-result abstraction is added.

### Composition

The owner reads composition from Plite instead of keeping its own event bookkeeping. Eligibility, keyboard handling and completion gate on `editor.read.view.isComposing()`, which stays true through Plite's scheduled settle, and on the keydown event's own `isComposing` or keyCode 229. Keyboard Enter never completes while either is set, which covers WebKit's confirming Enter after `compositionend`.

While the view composes, the preview reads the visible DOM text from the trigger's DOM point to this Editable's DOM selection focus; composition events only schedule that read. One DOM read covers appended preedit, recomposition over existing text, Android flushes and a caret inside the query, with no accounting of preedit against canonical text. A trigger typed only inside preedit opens nothing until it commits as local input. The popup anchors at the canonical trigger point through Plite's selection geometry.

An explicit option activation during composition, such as a tap while Gboard composes a word, settles native input through the Plite-owned settle operation and then completes against the settled text. That operation must end and flush an active composition, not only a pending end. Phase 1 picks the mechanism with the native owner and proves it on emulated Android and WebKit. If no mechanism ends composition reliably on a platform, the activation returns false with no edit, and tap completion during composition on that platform is a disclosed limit.

### Keys and focus

Plate's keydown pipeline gives the open occurrence's `onKeyDown` the first turn, before the shortcut table. Copilot's Tab and Escape and Plite's insert-break therefore wait while a popup is open. The owner attaches no raw native keydown or composition listener for key handling, because a native listener runs before Plite's nested-editable, read-only and composing filters and would see events bubbling from inputs inside voids. Where Plite consumes a key before that pipeline, such as projected editing keys in an owned content root, Plite's arbitration offers the key to the open occurrence first. A popup for an occurrence inside an owned content root mounts in the host Editable's slot and binds to the root view where the trigger was typed.

Whether Copilot's debounce must also stand down while a popup is open is a Phase 2 decision, proven with CopilotKit and MentionKit mounted together. Input rules and AI Space keep their current behavior on query text.

### Feature adoption and cuts

| Removed behavior or noun | Replacement and required regression proof |
| --- | --- |
| Four input plugins/schemas, input elements, input factories and author stamps | Literal canonical query text; prove typing, selection, save/share, marks and undo in each actual feature. Completed mention/emoji/footnote nodes stay feature-owned. |
| Trigger command interception and BaseComboboxPlugin `canEdit`, `commit`, `cancel` | Plugin-state matching policy, local typed-trigger activation, exact-mount eligibility and one atomic replacement; prove stale completion refusal, callback refusal and rollback. |
| Native input focus, sizing, query mirror and undo forwarding | Caret popup over ordinary Editable input with prevented option pointer-down; prove outside click, next key, screen-reader navigation, composition confirmation and a tap during composition. |
| Cancel-to-text insertion and delete-normalizer repairs | Escape edits nothing and ends the occurrence; continued typing, a preceding remote edit and caret return never reopen it. |
| Unused AI `createComboboxInput` coupling | Keep slash AI catalog/action and existing AI Space activation; prove successful slash AI invocation and subsequent typing. No AI UI redesign. |

Mention retains `@`, actual boundary/veto policy, multiword labels, required nonblank ref, markable atom and end-of-block spacing. Slash retains `/`, code-block exclusion, command availability, groups, keywords, block upsert vs inline insertion and successful post-action focus; an action whose guard fails returns false, so the query stays. Emoji retains `:`, shortcode matching, preferences, synchronous candidate search and feature insertion. Footnote replaces the whole `[^query` sequence and calls `insert` without `trigger`, so no second `[` is deleted. Its create option passes no `ref`, so `insert` computes `nextRef()` inside the transaction. A numeric query passes its number, and the callback returns false when that ref has become an existing definition. Footnote keeps reference/definition identity and `focusDefinition: false` policy.

Tag's dedicated select editor remains separate. The combobox docs teach a custom hashtag plugin with `ComboboxState` and the hook, without a fifth input schema or a clash with `BaseTagPlugin`. Do not turn feature catalog UI into a common catalog engine.

### Persisted input admission

Fold the cut into the existing unreleased v54 converter and historical v53 manifest dispositions. First-party v53 inputs are voids with empty children that never wrote `value`, and only mention inputs store `trigger`. Replace each stored mention/emoji/slash/footnote input with its trigger plus its query in every addressed root and retained authored content. The trigger is the stored one when present, else the first-party default (`@`, `/`, `:`, `[^`). The query is the meaningful children with their marks, else a persisted `value`, else empty. An application with a configured custom trigger gets the default literal; that is a disclosed limit, because a detached migration cannot read app configuration. Footnote avoids duplicating the preceding `[`.

A selection point inside a removed input maps through a semantic `mapSelection` step to the end of its restored text. The generic backward mapper would land before the trigger, so Phase 1 proves this mapping directly. Following sibling paths and coalesced text offsets rebase through the existing migration owner. A restored query never opens a popup, because only a typed trigger opens one.

Use `defineDocumentMigrations`/`migrateDocument` before create or replace. Do not add runtime schema sniffing, aliases, hidden correction rules or a registry migration helper. Same-version fingerprint drift still fails closed. An application that already persisted an older v54 draft needs a lineage cutover from the persistence/release owner before admission. This plan does not allocate v55 or migrate active Yjs rooms/offline history; those app cutovers stay open, owner: persistence/release, tracked in [the decision page's open gates](../research/decisions/autocomplete-ownership.md#open-gates). Unsaved native-input query text cannot be recovered and is a disclosed limit.

### Challenge delta

Improved three times. The first pass replaced native-input hardening with ordinary text and cut the selected sketch's public source/item-loader factory, session/result service and editor-wide behavior plugin. The second pass cut the Plite composition read and subscription API, its tracked composing span and caret geometry, match witnesses and query generations, the callback refusal protocol, the shared per-Editable owner, fail-closed migration of conflicting values and the multi-size cost program.

The third pass was an interrogate by three Opus reviewers and a Codex review. It reversed four second-pass cuts:

- The refusal protocol returns as a `false | undefined` callback result. Footnote's `createDefinition` reuse is idempotence, not option validation, and a slash guard that returns early would still consume the query.
- The private per-Editable owner returns as a single occurrence slot. Four independent hooks could not share suppression, one matcher evaluation, key priority or one ARIA writer.
- Composition accounting from event data is replaced by a DOM read gated on Plite's own composing flag. The model can take text mid-composition, and the flag outlives `compositionend`.
- The Plite change is no longer conditional. Explicit activation needs a settle operation, and owned content roots need key arbitration.

It also corrected two claims. A point anchor with `deletion: 'drop'` survives deletion of exactly the trigger, so the occurrence is now a range anchor over the trigger span. Caret-based matching opened popups on navigation, undo, migration and remote text, so only a locally typed trigger opens an occurrence; that rule deletes the separate dismissed state and most trigger-precedence cases. The cuts that held are the Plite composition API, match witnesses, query generations and the multi-size cost program. This was the third design pass, so no further replay runs; remaining risk sits in the Phase 1 gates. Dispositions are in the adjacent decision log.

## Execution

The user's "GO" on October 1 authorized Build to run all three phases without pausing. It grants no commit, push or message authority; every change stays in the working tree. Commits: none; the change is uncommitted in the working tree because the user owns commits.

The work covers the matcher and policy in `packages/platejs/src/features/combobox/lib`, the owner and `useCombobox` in `packages/platejs/src/react/features/combobox`, key routing in `PlateContent`, `settleInput()` in Plite's Editable runtime, the four feature plugins, the v54 input migration, the copied popups in `apps/www/src/registry/components/editor`, docs, doctrine and generated output.

Build corrected these plan claims against source and recorded each in the decision log:

- No plugin `options` field exists. Policy lives in plugin `initialState`, and every `ComboboxState` field is required because plugin state cannot hold optional keys. `maxQueryLength` therefore has no default; each built-in kit sets 75.
- `match` holds `query`, the `trigger` text, the replacement `range` and `composing`. A new snapshot appears when the query, the range or the composing flag changes, because the popup anchors at `range`. `complete` compares the offered query and trigger, not identity, so a row that kept an older snapshot still completes while its query stands.
- Local typing is tagged `dom-text-input` as well as `native-text-input`. Activation accepts either, rejects `collaboration`, `historic` and `paste`, and requires one pure insertion ending at the caret, so Backspace back to a trigger opens nothing.
- The `combobox()` contribution is cut. `useCombobox({ plugin })` already names the feature and its policy store, and `afterEditable` slots render in plugin order, which supplies the tie order. This was Build's own call after approval, so the final diff went back through interrogate.
- A query that starts with whitespace ends the occurrence. Without that rule, typing `Page 1 / 2` kept the slash popup open on " 2" with "Heading 2" active, and Enter converted the block.
- The callback type is `(tx) => false | void`. A block-body callback with no `return` infers `void`, which TypeScript does not assign to `false | undefined`. `async` callbacks still fail to type-check.
- Home and End stay caret keys. Only Enter, Tab, ArrowUp, ArrowDown and Escape reach the popup.
- Plate receives no keys typed inside an owned content root, and no first-party plugin declares one. Popups open only in the Editable's own root; content-root autocomplete is a gap, owner: Plite native input, tracked in [the decision page's open gates](../research/decisions/autocomplete-ownership.md#open-gates).
- `settleInput()` flushes a pending composition end and Android input; it does not end an active composition. While an IME composes, option pointer-down is not prevented, so the blur ends the composition natively before the click completes.
- Footnote `insert` drops its `trigger` parameter, which only the removed input UI used. Emoji search drops its 100 ms debounce.
- Copilot keeps its auto-trigger while a popup is open. It fires only on a typed space at a block end, and its Tab and Escape shortcuts lose to the popup's claimed keys. Standing it down would need an editor-wide popup signal, which this design cut. A space inside a multiword mention query at a block end can therefore request a Copilot suggestion that shows beside the popup until the next edit rejects it.

The final diff went through interrogate with three Opus reviewers and a Codex review. Codex found no P0 or P1 defect. The Opus reviewers' accepted findings changed the build as follows, with dispositions in the decision log:

- `useCombobox` takes `open`, so keys and ARIA attach only while the popup shows. `aria-expanded` is gone because a textbox does not support it.
- An outward `typedExtent` anchor bounds the query, so moving past the typed text ends it.
- Triggers are found inside the inserted text and across marked leaves.
- `settleInput()` flushes an ended composition, and footnote `insert` leaves the caret after a reference inserted at a text start.
- The `plugin` option is typed to require `ComboboxState`.
- The owner rechecks roots and element read-only state, ignores Shift-modified keys and ends an occurrence when another editor takes focus.

The closing trail review found two owner defects, each fixed with a regression case. One insertion holding two triggers opened the first mounted popup instead of the latest trigger, against Hard law 11; the owner now compares trigger starts across popups. Another editor's focus ended an occurrence only at the owner's next read, and Plite's focus flag trails the DOM; the owner now rereads on document `focusin` and judges another editor's focus from the DOM.

The user reopened the plan to close the gates an agent can close. The frozen key-to-paint contract came back red. Its first run typed without pacing, and keystrokes queued behind development-mode rendering, so kits on measured 393 ms at p95 against 268 ms. Pacing keystrokes 100 ms apart was chosen after that result, so the unpaced run stays on record. Paced, the four kits with their popups cost 2.0 ms more at p95 than no kits (+19%), and removing only the popups removed 1.6 ms of that. Each mounted popup walked the paragraph's whole run of text leaves on every typed commit, 800 node reads per keystroke in a 200-leaf paragraph. `findTypedTrigger` now reads back only the typed length plus the longest trigger plus one character, which is 4 node reads for the same keystroke, and the open query checks its text run between trigger and caret. A timing control that restored the unbounded walk brought the delta back in its loaded runs, but its pooled delta stayed inside that run's spread, so the node-read count is the decisive evidence.

The generated plugin `insert` and `MentionPlugin`'s `insert` left the caret inside an inline void, and at a block end the next keystroke was lost. Both now place the caret after the void through one helper that footnote's insert also uses, adding the empty text a block end needs. The generated `insert` leaves the selection alone when the caller passes `select`, and the hashtag tutorial no longer moves the selection itself.

## Steps

- [x] Phase 1. Matcher, per-Editable owner, `useCombobox`, refusable completion, Plite `settleInput()` and the detached input migration. Closed with `packages/platejs/src/react/features/combobox/useCombobox.spec.tsx` (18 cases), `packages/platejs/src/migrations/migratePlateV54Inputs.spec.ts`, the `settleInput` case in `packages/plitejs/test/react/editable-dom-runtime-contract.test.tsx`, and `packages/platejs/type-tests/combobox-input-contracts.ts` under root `pnpm test:types`. Key arbitration inside owned content roots is deferred. The native owner has not reviewed `settleInput()`, and the settle mechanism has no emulated Android or WebKit proof; both are remaining gates.
- [x] Phase 2. The four copied popups replace the input elements, the input protocol and its keys are cut, and the migration is adopted. Closed with `apps/www/tests/browser/combobox.spec.ts` (13 cases) and `apps/www/tests/browser/multi-editor.spec.ts` on real registry kits in Chromium, Firefox and WebKit, and `pnpm --filter www test:create-install editor-ai` on two installed projects. That install proof fails on the October 3 bytes on DnD registry types; see Proof and the subject's Open work.
- [x] Phase 3. Docs, doctrine v255, changesets, the registry changelog and generated output. Closed with `pnpm --dir apps/www check:docs`, `pnpm --dir apps/www build:registry --check`, `pnpm --dir apps/www editor:check`, `pnpm --dir apps/www api-reference`, `node tooling/scripts/generate-ui-changelog-entries.mjs --check`, `node .agents/rules/plate-next/scripts/version.mjs validate` and `docs/editor-behavior/current-evidence.md`.

Each phase is kept. Nothing was reverted or quarantined.

## Proof

All runs used the current checkout. Browser runs and the typing probe used a `next dev` server from `apps/www` with source aliases on :3000, where the app's development manifest URL points. The final reruns are local under `docs/plans/artifacts/2026-10-01-autocomplete-ordinary-text/build/final/reopen2/` and `reopen3/` and `.../benchmark/`, with earlier logs beside them. Another session edited Plite and Plate core during the closure, so the final package proofs reran after its transfer change compiled.

- The full platejs suite passed: 138 turbo partition tasks, none cached. That includes combobox-react (18), the block-insertion spec (20) and the mention spec (12). The copied-UI specs for slash, footnote, the new footnote combobox case, markdown, plugins and inline-void suggestion passed, each in its own process. Plite's react partition passed 1375 tests and Plite `typecheck` passed on these bytes.
- Types passed: the affected platejs `typecheck:partition` runs, platejs `typecheck:contracts`, root `pnpm test:types` (its async and non-combobox `@ts-expect-error` lines fire), the main `apps/www` TypeScript config, and the custom hashtag tutorial assembled in a temporary file.
- Browser runs passed: Chromium combobox plus multi-editor 22/22, then the combobox spec five times warm without retries, 13/13 each. Firefox passed 20 of combobox plus multi-editor, skipping the two Chromium-only IME cases. WebKit passed all 11 combobox cases it runs; its multi-editor shared-toolbar focus case failed two of three runs, the flake that also fails at HEAD.
- All five checks passed on the bytes before the trail review's caret fix. On October 3 they reran in the working checkout with HEAD at `fe0e9599a6`, which held other sessions' uncommitted edits; their logs are local and not committed. `api-reference --check`, `check:docs`, `build:registry --check` and the `apps/www` package-integration typecheck pass; the typecheck prints nothing on success, and the same command on a missing config exits 1. The registry install proof, `pnpm --filter www test:create-install editor-ai`, now fails on DnD registry types, not autocomplete code: `block-menu.tsx(267)` and `dnd.tsx(167)` read a `nodes` property the transfer read no longer has, and `dnd.tsx(174)` has an implicit `any`. The install proof stops at that typecheck, so its later steps did not run on these bytes. The failure is the DnD workstream's to fix and is tracked in the subject's Open work; this plan does not call it pre-existing.
- `check-plate-schema-adoption.mjs` reports the same 37 findings as HEAD and none from this work, after Build removed its stale `BaseComboboxPlugin` and input entries. `entrypoint:turbo:check` and the entrypoint DAG tests passed.
- `pnpm check` was skipped. The working tree holds other sessions' changes and the schema-adoption step already fails at HEAD, so each affected owner check ran instead.

The key-to-paint contract passed on the final code with `apps/www/scripts/run-combobox-typing-probe.mts` against `/dev/combobox-typing`, on the development server in headless Chromium. It times each keystroke from a capture-phase `beforeinput`, so keydown handling is excluded, to the frame after the next paint. For 100 keystrokes paced 100 ms apart at the end of a 2,000-character paragraph alternating bold and plain runs, five interleaved runs per cohort, kits with popups measured p50 7.0 ms and p95 10.6 ms against p50 5.7 ms and p95 9.8 ms with no kits. That is +0.8 ms (+8.2%) at p95, inside the 10% and 1 ms budget and below the 2.9 ms run-to-run spread; per-run noise is about 2 ms, so the pass rests partly on the spread clause. Unpaced, kits on measured +13 ms (+4.8%) at p95, below that run's 61 ms spread, where the unbounded scan had measured +125 ms (+47%). A 20,000-character stress cohort over three runs, on earlier bytes with the same scan, measured +0.8 ms (+4.8%) inside its spreads. A headless count is the decisive cost evidence. One typed keystroke in a 200-leaf paragraph made the four popups read 800 text nodes before the bound and 4 after.

## Acceptance and remaining gates

Proven by the cases above:

- typed-trigger activation, including inside one longer insertion and across marked leaves, with the latest typed trigger winning when one insertion holds two;
- no popup for caret placement, undo or prose slashes, and the query ends when the caret passes the typed text;
- same-change trigger replacement and a remote edit before the trigger, which maps the occurrence;
- callback refusal, thrown and async callbacks, and one-step undo restoring the literal query and caret, with redo restoring the completion;
- a remote edit and a caret return after Escape leaving the popup closed;
- the open popup taking its keys before the shortcut table while Shift chords stay with the editor, and another editor's focus ending the occurrence;
- an outside click closing the popup without refocusing the editor, and a click past the query closing it at the clicked caret;
- a click on an option during a desktop Chromium IME composition committing the preedit and completing;
- typing cost with all four kits mounted inside the frozen key-to-paint budget;
- the caret after an inline void inserted by the generated `insert` or `MentionPlugin`, including at a block end where the next keystroke used to be lost;
- an occurrence staying in the view of one document where it was typed;
- a new-footnote option refusing a ref that another writer defined while the popup was open;
- a trigger split across leaves found when the bounded scan stops short of the run start;
- mention, slash (including suggestion mode and AI), emoji (closing colon) and footnote completion in the browser;
- Escape keeping text, hidden popups leaving keys to the editor, and Chromium CDP preedit filtering without publishing text;
- the footnote create option allocating its ref in the transaction, and the caret after a reference inserted at a text start;
- migration of stored inputs with the selection inside an input.

The remaining gates live with their owners in [the decision page's open gates](../research/decisions/autocomplete-ownership.md#open-gates), because this plan is closed:

- Physical desktop and mobile IME, Android taps during composition and WebKit's confirming Enter on a real IME; Playwright's WebKit exposes no composition protocol, so no emulated WebKit proof exists. Owner: input/Verify, tracked there.
- Under emulated Android, a blur that commits a composition leaves Plite's caret past the committed text, so a tap during composition refuses; the cause is unattributed because the tree held another session's uncommitted IME work. Owner: Plite native input, tracked there.
- Native-owner review of the public `ReactApi.settleInput()` and its fallback, and autocomplete in owned content roots. Owner: Plite native input, tracked there.
- A Plite query for which Editable holds a root's shared selection, to replace the DOM check in `isAnotherEditorFocused`. Owner: Plite native input, tracked there.
- A browser case for two views of one document, a live Copilot model beside Mention and screen-reader navigation; the element read-only recheck in `complete` is reachable only through schema reconfiguration and has no case. Owner: Plate React, tracked there.
- Migration of named roots and of inputs with meaningful children, a lineage cutover for applications that persisted an older v54 draft, a v55 allocation, and migration of active Yjs rooms and offline history. Owner: persistence/release, tracked there.
- Production-build timing for the key-to-paint contract, which ran only on the development server with about 2 ms of per-run noise. Owner: Benchmark, tracked there.
- Hard law 5 has known violations. String data inserted at a collapsed caret passes the owner's typing check when it is pasted, yanked, dropped or labeled a replacement. The probe checked only that helper and mounted no owner, and a real replacement range is unverified. An Android keyboard-clipboard paste arrives as `insertText`. Owner: Plite native input, tracked in the subject's Open work.
- The registry install proof fails on the October 3 bytes on DnD registry types. Owner: DnD workstream, tracked in the subject's Open work.

Live IME filtering is required; "accept commit-time IME filtering" removes the composition preview.

## Close

Reversals first: Build corrected eleven plan claims against source, listed in Execution. The largest is Build's own cut of the `combobox()` contribution after approval, which went back through interrogate. Hard law 5 has known violations, found on October 3. String data inserted at a collapsed caret passes the typing check when it is pasted, yanked, dropped or labeled a replacement, and an Android keyboard-clipboard paste arrives as typing.

What landed: the matcher and refusable completion, one private owner per mounted Editable, `useCombobox`, `settleInput()`, the four copied popups, the v54 input migration, docs, doctrine v255 and generated output, all uncommitted in the working tree for the owner. The proof and its limits are in Proof; no physical IME or screen reader has run, and the timing ran only on the development server.

Counts: 13 items. Done: 3, the three phases. Skipped: 1, `pnpm check`, because the tree held other sessions' changes. Blocked: 1, the registry install proof on DnD registry types. Open: 8, the other remaining gates below, each with its owner in the subject's Open work or the decision page's open gates. The next iteration is `docs/plans/2026-10-03-autocomplete-occurrence-host.md`.
