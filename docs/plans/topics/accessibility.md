# Accessibility: focus, navigation and announcements

Page: https://claude.ai/artifact/PGaCmiBuTF2x1X9YSFxfSw

Screen-reader feedback, focus and keyboard navigation in Plite and Plate: voids with owned controls, inactive editors, read-only views and several mounted views of one document. The ledger asks which focus and navigation guarantees must hold for those cases. Four owners hold the answer today. Announcements are a local commit effect that skips history and collaboration; the application writes the words, and Plite React speaks them through a polite live region. Controls inside voids are the application's own focus targets. Each Editable paints the inactive selection from its own focus change. Tab traversal across embedded controls is the optional Tabbable plugin, whose kit owns the exclusions. Every mounted provider keeps an empty live region, and one announcer per editor writes each message into one of them, so two views of one document no longer announce a message twice (2026-10-06 build). `node tooling/scripts/review-ledger.mjs show accessibility` prints the scope's full history.

## Public API

A command passes its screen-reader message with the move, and the commit carries it.

```ts
// apps/www/src/registry/components/editor/dnd.tsx
moveBlockUp: {
  keys: 'mod+shift+arrowup',
  handler: ({ editor }) =>
    editor.api.transfer.move({ announce: 'Moved up', to: 'previous' })
      .status !== 'refused',
},
```

Any update can emit the announcement effect directly.

```ts
// packages/plitejs/test/react/screen-reader-announcement.test.tsx
editor.update((tx) => {
  tx.effects.emit(screenReaderAnnouncementEffect, 'Saved');
});
```

A control outside the editable keeps the editor's selection painted while it has focus.

```tsx
// apps/www/src/registry/components/editor/comment.tsx
<form
  aria-busy={saving}
  className="flex w-full"
  data-editor-keep-selection-visible
  onSubmit={(event) => {
    event.preventDefault();
    void submit();
  }}
>
```

The Tabbable kit moves Tab between editor text and embedded controls, and skips code blocks, tables and lists.

```ts
// apps/www/src/registry/components/editor/tabbable.tsx
export const TabbableKit = [
  TabbablePlugin.configure(({ editor }) => ({
    initialState: {
      query: () => { /* kit-owned exclusions */ },
    },
  })),
];
```

## Main changes

- `screenReaderAnnouncementEffect` in `packages/plitejs/src/core/screen-reader-announcement.ts` is a local effect with `history: 'skip'`; `editor.api.transfer.move` emits it when the input carries `announce`.
- `PliteRuntimeProvider` in `packages/plitejs/src/react/hooks/use-plite-runtime.tsx` renders one empty `EditorAnnouncementLiveRegion` per provider; nested `EditorRoot`s of one editor share the nearest provider.
- Every region registers with one announcer per editor (`packages/plitejs/src/react/components/editor-announcement-live-region.tsx`), keyed by the runtime owner. The announcer holds the editor's only announcement subscription, publishes commits through `publishEditorCommitInVersionOrder`, and writes each message into one region: an audible one first (shown by `checkVisibility`, with no `hidden`, `inert` or `aria-hidden` ancestor in the flat tree), then the one nearest the focused element, then the earliest registered.
- The flat-tree walk is `getFlatTreeParentElement` in `packages/plitejs/src/dom/utils/dom.ts`, shared with scroll capture, scroll-into-view, drag auto-scroll and the keep-selection-visible marker.
- Inactive selection paint derives per Editable from `data-editor-keep-selection-visible` focus targets, in `packages/plitejs/src/react/inactive-selection.ts`.
- `packages/platejs/src/tabbable/` owns Tab traversal; the copied `TabbableKit` owns its exclusions.

## What other editors do

Read at lexical `dd5c41b13`, prosemirror-view `ca4c78e`, slate `945a484df` and tiptap `91c51be53`, source only, nothing run. Lexical is the only one with a built-in live region, and it keeps one per editor.

| Editor | Built-in live region | Regions per editor | Where the region lives | Who writes the words |
| --- | --- | --- | --- | --- |
| Plite | yes, polite `role="status"` | one per mounted provider; one announcer per editor writes each message into one of them | inside the provider's React tree, next to its views | the application, through a commit effect |
| Lexical | yes, `AriaLiveRegionExtension` | one; an editor has one root element | the root's `ownerDocument.body`, or an `owner` element "in the same accessibility subtree as the editor (shadow root or portaled overlay)" | extensions, through an imperative `announce(text)` sink |
| ProseMirror | none in prosemirror-view or prosemirror-tables | none | none | the application |
| Slate | none | none | none | the application |
| Tiptap | none | none | none | the application |

## Open work

- Native modal dialogs: Chromium removes outside live regions from its accessibility tree while a `showModal()` dialog is open, and the chooser models neither that nor a modal that escapes an `inert` ancestor. patch: stop the ancestor walk at a `dialog:modal`, make only regions inside an open modal eligible, and add a region beside an Editable portaled into a modal. owner: zbeyens. stop: a Plate layout or an application report with a view of the editor in a native modal starts the build; otherwise the v2 release drops it as a documented limit.
- A screen-reader run (NVDA with Chrome, VoiceOver with Safari) on the DnD multi-editor demo, hearing "Moved up" once per move. owner: zbeyens. stop: one recorded run, or the v2 release.
- A committed Chromium guard for the CSS-hidden pane, in the Plite browser lane. owner: zbeyens. stop: the next change to the chooser, or the v2 release.
- A region that registers while an older commit waits in the version-order queue can receive that older message, and the queue waits forever on a version gap. owner: zbeyens. stop: a report of a replayed or stalled message, or the v2 release.
- Focus inside a closed shadow root reads as its host, a region inside an iframe never shares an ancestor with the main document's focus path, and closed roots hide slot assignment. owner: zbeyens. stop: a layout with two views of one editor inside a closed shadow root or an iframe, or the v2 release.
- The announcer keeps a release callback and a one-call wrapper. owner: zbeyens. stop: the next change to the announcer, or the v2 release.
