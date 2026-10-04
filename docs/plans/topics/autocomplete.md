# Autocomplete

Page: https://claude.ai/artifact/Hhh2fhr8dV7dzN2LcybthK

Mention, slash, emoji and footnote autocomplete in Plate. The query is ordinary editor text after a typed trigger. A popup belongs to the Editable where the trigger was typed, filters on live IME preedit, and replaces the trigger and query with one completion that undoes in one step. The scope's review and plan history prints with `node tooling/scripts/review-ledger.mjs show autocomplete`.

## Public API

A kit mounts its popup in the plugin's `afterEditable` slot and sets trigger policy through plugin state.

```tsx
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

Slash vetoes its trigger inside code blocks through the `triggerQuery` state field.

```tsx
// apps/www/src/registry/components/editor/slash.tsx
SlashPlugin.configure({
  initialState: {
    triggerQuery: (editor) => {
      const codeBlock = editor.plugin(BaseCodeBlockPlugin);

      return (
        !codeBlock.installed ||
        !editor.read.nodes.some({
          type: codeBlock.schema.type,
        })
      );
    },
  },
  slots: { afterEditable: SlashCombobox },
}),
```

The copied popup receives its Editable's ref from the slot and names the feature whose state holds the policy.

```tsx
// apps/www/src/registry/components/editor/mention.tsx
export function MentionCombobox({
  editableRef,
}: {
  editableRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <InlineCombobox editableRef={editableRef} plugin={MentionPlugin}>
```

The copied `InlineCombobox` reads the match through `useCombobox`, and each option completes the match that offered it.

```tsx
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

A custom trigger declares every `ComboboxState` field in its plugin's `initialState`.

```tsx
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

A generated plugin `insert` of an inline void leaves the caret after it.

```tsx
onSelect={(tx) => {
  tx.plugin(HashtagPlugin).insert({ value: tag });
}}
```

Footnote's `insert` takes no trigger.

```tsx
tx.plugin(FootnotePlugin).insert({ focusDefinition: false, ref });
```

Stored v53 input nodes migrate to their literal trigger and query.

```ts
paragraph('Hi +Ada /')
```

Plate settles native input through Plite's public React API before it completes.

```ts
// packages/platejs/src/react/features/combobox/comboboxOwner.internal.ts
this.view.api.react.settleInput()
```

## What other editors do

The October 2 query-representation research read twelve external designs at the revisions in its `repo-registry.tsv`, without running any of them, plus Plate's own history and Chromium probes. Only Atlassian keeps the query out of the document. It needs custom history steps and shows no Android proof, so Plate keeps the query in ordinary text and repairs screen-reader recognition on the editor root.

| Editor | Where the query lives | What opens it | IME | What a screen reader gets | Source |
| --- | --- | --- | --- | --- | --- |
| Tiptap `91c51be5` (read, not run) | Document text; a regex per transaction and an inline decoration | Any transaction that leaves a match before the caret, so caret moves reopen it (issue 7371) | Stays active through composition; prosemirror-view withholds keydown while composing | No roles | shard 001 |
| ProseKit `3fbfe790` (read, not run) | Document text with a mapped range | Only typed text, or an explicit scan | Ignores keys while composing and 50 ms after `compositionend`, a WebKit workaround | The popup is `role=listbox` and carries `aria-activedescendant`; the root is unchanged | shard 001 |
| BlockNote `1e26f1c5` (read, not run) | Document text after the trigger | Typed text equal to a trigger, longest first | Enter checks `isComposing` only; the menu closes during Chinese IME (issue 1283) | Root gets `aria-expanded`, `aria-controls` and `aria-activedescendant`, but no `role=combobox` | shard 001 |
| Milkdown `6a4db480` (read, not run) | Paragraph text before the caret | Every debounced view update | Skips updates while composing; Enter has no IME check | No roles | shard 001 |
| Atlassian type-ahead, `@atlaskit/editor-plugin-type-ahead` 24.0.0 (read, not run) | A nested contenteditable in a widget decoration, outside the document | An input rule on the trigger | Enter checks `isComposing` and keyCode 229, because virtual keyboards report `isComposing` too | The focused query span is `role=combobox` with expanded, controls and active-descendant state | shards 001, 003 |
| Lexical `dd5c41b1` (read, not run) | Document text up to the caret in one text node | An update listener with no tag filter, so paste, undo and collaboration qualify (inferred) | Returns early while composing and does not refilter (issue 7985) | Root stays `role=textbox`; `aria-activedescendant` is written on it | shard 002 |
| Slate `945a484d` mentions example (read, not run) | Document text; React state holds the target range | Any change; a bare `@` never opens (issue 5844) | No check; the user `onKeyDown` runs before Slate's composing gate | Root `role=textbox`; options carry no roles | shard 002 |
| Draft.js mention 5.3.0 (read, not run) | Block text marked by a decorator | Content change; closes on blur and reopens on focus | Keydown reaches the plugin only when not composing | Root is permanently `role=combobox` with expanded, active-descendant and owns state | shard 002 |
| CKEditor 5 `14e73cc3` (read, not run) | Document text; a marker covers the trigger | A regex over the last line before the caret, per change | No composition handling in mention | No roles | shard 003 |
| quill-mention 6.1.1 (read, not run) | Document text; integer positions rescanned | Text change and collapsed selection change | None in the plugin; Quill batches during composition | `aria-owns` permanently and `aria-activedescendant` while open on the root; no roles | shard 003 |
| Plate v34 to v53 (Plate history and Chromium probe) | An input node holding a native input element | The trigger command | The native input composed on its own | The input exposed a combobox with expanded and popup state; the shipped ordinary-text root exposes a textbox | shards 004, 005 |

Sources: shards are under `docs/plite/research/2026-10-02-autocomplete-query-representation/shards/`, with the verdict in its `README.md` and the review record `docs/research/review-records/2026-10-02-autocomplete-input-element-rechallenge.json`.

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Matcher and atomic completion | Plate | `platejs`, `src/features/combobox/lib` | Trigger policy and completion are product law |
| One combobox owner per mounted Editable | Plate | `platejs`, `src/react/features/combobox/comboboxOwner.internal.ts` | One occurrence, one key claim and one ARIA writer per Editable |
| `useCombobox` hook | Plate | `platejs/combobox/react` | The copied popup's only entry |
| Key claim before the shortcut table | Plate | `platejs`, `PlateContent.tsx` and `src/react/utils/editableKeyDown.internal.ts` | An open popup takes Enter, Tab, arrows and Escape first |
| `settleInput()` | Plite | `plitejs/react`, `editable-dom-runtime.ts` | IME lifetime stays with DOMInputRuntime |
| Caret after an inserted inline void | Plate | `platejs`, `selectAfterInline` | The next keystroke is no longer lost at a block end |
| Stored input migration | Plate | `platejs`, `src/migrations/migratePlateV54Inputs.internal.ts` | Old input nodes cross a detached migration |
| Catalogs, filtering, active option and presentation | Plate copied registry | `apps/www/src/registry/components/editor/inline-combobox.tsx` and the four feature files | Copied UI owns product presentation |

## Hard cuts and app migration

The ordinary-text adoption deleted the input-node design and left no compatibility path.

| Deleted | Replacement | Source |
| --- | --- | --- |
| `BaseComboboxPlugin` with `canEdit`, `commit` and `cancel` | The private owner, `useCombobox` and `complete` | adoption plan Feature adoption and cuts |
| Mention, slash, emoji and footnote input plugins, schemas, elements and `createComboboxInput` | Literal query text | adoption plan Feature adoption and cuts |
| `triggerCombobox` command interception | Typed-trigger activation from plugin state | adoption plan Feature adoption and cuts |
| Footnote `insert` `trigger` option | None; the popup replaces `[^query` | adoption plan Public API |
| Emoji search debounce | Synchronous search | adoption plan Execution |

| Caller | Breaks because | Change | Source |
| --- | --- | --- | --- |
| Kits that install an input plugin | The input plugins are gone | Mount the popup in `slots.afterEditable` | adoption plan Public API |
| Copied popups built on an input element | The element and its query mirror are gone | Re-copy `inline-combobox.tsx` and the feature popup | adoption plan Public API |
| Custom triggers built on `triggerCombobox` | The command is gone | Declare `ComboboxState` in `initialState` | adoption plan Public API |
| Callers that moved the caret after `insert` | `insert` now places it after the void | Drop the selection move | adoption plan Public API |
| Stored v53 documents with input nodes | The schemas are gone | Run the v54 migration | adoption plan Persisted input admission |

## Native behavior and proof

| Behavior | What changes | Proof surface | Source |
| --- | --- | --- | --- |
| Opening | Only local input opens a popup; caret moves, undo, remote edits and a paste carrying a `DataTransfer`, which Plite tags `paste`, never do. A paste, yank, drop or replacement inserted as string data at a collapsed caret carries the typing stamp and passes the owner's insertion check (`docs/plite/research/2026-10-03-autocomplete-arena/probe-stamp.ts`, helper only, no mounted owner). An Android keyboard-clipboard paste arrives as `insertText` (`android-input-manager.ts:1011`, not run on a device) and opens one like typing | `useCombobox.spec.tsx` (jsdom) and `apps/www/tests/browser/combobox.spec.ts` in Chromium, Firefox and WebKit | adoption plan Proof |
| IME filtering | The query previews live preedit without writing it | Chromium with CDP composition; no physical IME | adoption plan Proof |
| Tap during composition | Pointer-down is not prevented while composing, so the blur ends the composition before the click completes | Desktop Chromium with CDP composition; refuses under Pixel 5 emulation | adoption plan Remaining gates |
| IME-confirming Enter | Never completes | Chromium; WebKit unproven, its Playwright build has no composition protocol | adoption plan Remaining gates |
| Undo | One step restores the literal query and caret | jsdom and Chromium | adoption plan Proof |
| Focus | Outside clicks never restore an old caret; completion focuses only the initiating Editable | Chromium | adoption plan Proof |
| Screen reader | The root stays `role=textbox` with `aria-autocomplete`, `aria-controls` and `aria-activedescendant` | Chromium accessibility tree; no screen reader run | shard 004 |
| Typing cost | Four mounted popups read 4 text nodes per keystroke in a 200-leaf paragraph | Headless node-read count and the key-to-paint contract on the development server | adoption plan Proof |

## Main changes

- One private owner per mounted Editable replaced `BaseComboboxPlugin`'s editor-wide input protocol. The first mounted popup hook creates it, a WeakMap finds it, and it holds at most one occurrence as range anchors.
- An occurrence opens only from a commit tagged `dom-text-input` or `native-text-input` and never `collaboration`, `historic` or `paste`.
- The trigger scan reads back only the typed text plus the longest trigger.
- Plite's history replay settles native input through `settleInput()` before it runs.
- One helper, `selectAfterInline`, places the caret after an inserted inline.

## Open work

Unless an item says otherwise, the decision page's open gates, `docs/research/decisions/autocomplete-ownership.md#open-gates`, track it.

- Physical desktop and mobile IME, Android taps during composition and WebKit's confirming Enter on a real IME. Owner: input/Verify.
- A blur that commits a composition under emulated Android leaves Plite's caret past the committed text, so a tap during composition refuses. Owner: Plite native input.
- Native-owner review of the public `ReactApi.settleInput()`, and autocomplete in owned content roots. Owner: Plite native input.
- A Plite query for which Editable holds a shared selection, to replace the DOM check in `isAnotherEditorFocused`. Owner: Plite native input.
- Browser cases for two views of one document, a live Copilot model beside Mention and screen-reader navigation. Owner: Plate React.
- String data inserted at a collapsed caret passes the owner's typing check when it is pasted, yanked, dropped or labeled a replacement, against hard law 5. `probe-stamp.ts` checked only that helper. Phase 1 of `docs/plans/2026-10-03-autocomplete-occurrence-host.md` replaces the check with a report by input intent. Owner: Plite native input, tracked here.
- An Android keyboard-clipboard paste opens a popup, against hard law 5, because it arrives as `insertText` with no paste signal. Owner: Plite native input, tracked here.
- No screen reader has run over the popups: VoiceOver on macOS and NVDA on Windows. Owner: Verify, tracked here.
- Migration of named roots and of inputs with meaningful children, a lineage cutover for older v54 drafts, a v55 allocation, and active Yjs rooms and offline history. Owner: persistence/release.
- Production-build timing for the key-to-paint contract. Owner: Benchmark.
- Android pending diffs are keyed by editor, so two Editables of one view can flush each other's typed diff, and the typed-text report then names the Editable that flushed. Owner: Plite native input, tracked here.
- `readTextToCaret` casts `root.getRootNode()` where `getDOMInputRepairTarget` guards it; one guarded read should serve both. Owner: Plite DOM, tracked here.
- The registry install proof, `pnpm --filter www test:create-install editor-ai`, fails on the October 3 bytes on DnD registry types in `block-menu.tsx` and `dnd.tsx`; rerun it once the DnD workstream fixes them. Owner: DnD workstream, tracked here.
