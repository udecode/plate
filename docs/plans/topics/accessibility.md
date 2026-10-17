# Accessibility: focus, navigation and announcements

Page: https://claude.ai/artifact/PGaCmiBuTF2x1X9YSFxfSw

Screen-reader feedback, focus and keyboard navigation in Plite and Plate: voids with owned controls, inactive editors, read-only views and several mounted views of one document. The ledger asks which focus and navigation guarantees must hold for those cases. Four owners hold the answer today. Announcements are a local commit effect that skips history and collaboration; the application writes the words, and Plite React speaks them through a polite live region. Controls inside voids are the application's own focus targets. Each Editable paints the inactive selection from its own focus change. Tab traversal across embedded controls is the optional Tabbable plugin. Its callbacks get the editor of the view it runs in, its kit declines Tab in lists, code blocks and tables, and lists own Tab and Shift+Tab on list items (2026-10-11 build). Every mounted provider keeps an empty live region, and one announcer per editor writes each message into one of them, so two views of one document no longer announce a message twice (2026-10-06 build). `node tooling/scripts/review-ledger.mjs show accessibility` prints the scope's full history.

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

The Tabbable kit moves Tab between editor text and embedded controls. Its rule reads the caret from the editor it is handed and declines in code blocks, tables and lists.

```ts
// apps/www/src/registry/components/editor/tabbable.tsx
TabbablePlugin.configure({
  override: {
    [PLUGINS.indent]: { shortcuts: { tab: null, untab: null } },
  },
  initialState: {
    query: ({ editor }) => {
      // ...decline in code blocks, tables and list items
    },
  },
})
```

A manual configuration's callbacks take one context with the view's editor.

```tsx
// content/docs/(plugins)/(functionality)/tabbable.mdx
TabbablePlugin.configure({
  initialState: {
    query: ({ editor }) => {
      const codeBlock = editor.plugin(BaseCodeBlockPlugin);

      return (
        !codeBlock.installed ||
        !editor.read.nodes.some({ type: codeBlock.schema.type })
      );
    },
    globalEventListener: true,
    isTabbable: ({ editor, entry }) =>
      editor.read.schema.isVoid(entry.slateNode),
  },
}),
```

## Main changes

- `screenReaderAnnouncementEffect` in `packages/plitejs/src/core/screen-reader-announcement.ts` is a local effect with `history: 'skip'`; `editor.api.transfer.move` emits it when the input carries `announce`.
- `PliteRuntimeProvider` in `packages/plitejs/src/react/hooks/use-plite-runtime.tsx` renders one empty `EditorAnnouncementLiveRegion` per provider; nested `EditorRoot`s of one editor share the nearest provider.
- Every region registers with one announcer per editor (`packages/plitejs/src/react/components/editor-announcement-live-region.tsx`), keyed by the runtime owner. The announcer holds the editor's only announcement subscription, publishes commits through `publishEditorCommitInVersionOrder`, and writes each message into one region: an audible one first (shown by `checkVisibility`, with no `hidden`, `inert` or `aria-hidden` ancestor in the flat tree), then the one nearest the focused element, then the earliest registered.
- The flat-tree walk is `getFlatTreeParentElement` in `packages/plitejs/src/dom/utils/dom.ts`, shared with scroll capture, scroll-into-view, drag auto-scroll and the keep-selection-visible marker.
- Inactive selection paint derives per Editable from `data-editor-keep-selection-visible` focus targets, in `packages/plitejs/src/react/inactive-selection.ts`.
- `packages/platejs/src/tabbable/` owns Tab traversal; the copied `TabbableKit` owns its exclusions. `TabbablePluginState` passes `query`, `insertTabbableEntries` and `isTabbable` one `TabbableEventContext`, `Readonly<{ editor: Editor; event: KeyboardEvent }>`, whose `editor` is the view editor `TabbableEffects.internal.tsx` gets from `useEditor()`; the plugin's defaults capture no editor.
- `query` decides every Tab except one pressed on a stop Tabbable admits, and Tabbable tells the two apart from `document.activeElement` alone. An admitted stop is an HTML or SVG element that is an inserted entry's `domNode`, or an element inside the editable that the `tabbable` library and the plugin's `isTabbable` both accept. A Tab from such a stop skips `query`, because clicking that control keeps the old caret and no editor shortcut receives the key. With focus on the editable root, the admission check is skipped.
- `BaseListPlugin` owns Tab on list items through a priority-5 `tab` shortcut, and its `untab` takes nested items as well as root ones. Both leave the key alone when the whole selection holds a code block, both read the shortcut's `editor`, and Tab first writes `indent: 1` on an item with no `indent`, in the same update, because `listItemDepth` reads an omitted indent as 1 and Indent as 0. Both read the lowest selected blocks, so List declines a caret inside a list item that holds blocks, such as a listed blockquote, and the key goes on to the next feature.

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
- Tabbable as a fallback that handles only the Tabs no editor feature used, which would retire the kit's hand-kept list of Tab owners. Under the kit today, Tabbable still takes Tab from a Copilot ghost suggestion and from an open combobox in a paragraph, and takes Shift+Tab from an unindented paragraph inside a quote. owner: zbeyens. stop: a report of one of those conflicts in an app, or the next change to Tabbable's listener, starts a verdict on it.
- No route installs `TabbableKit` beside the CodeMirror code block, so Tab and Shift+Tab inside CodeMirror with the kit are proven only by a stand-in host in `TabbablePlugin.keys.spec.tsx`, not driven in a browser. owner: zbeyens. stop: a kit or demo that ships both, or a report of Tab leaving a CodeMirror block.
- The editable-voids demo crashes on load with the value-type mismatch the tabbable demo had. owner: zbeyens. stop: the follow-up task filed on 2026-10-11 is started or dismissed.
- List's Tab and Shift+Tab skip a list item that holds blocks, such as a listed blockquote, which the v54 migration produces. A fix that resolved each selected block up to its list item failed review twice, on nested and on sibling containers. The next try resolves each selected block that is not a list item and has no indent to its holding list item, and keeps a disjoint set in document order. It covers sibling containers, a node-selected container and an indented paragraph inside one, and runs as its own plan iteration with a panel. owner: zbeyens. stop: a report of Tab or Shift+Tab on a listed blockquote, or the next change to List's key handlers.
- No CI check catches a List or Tabbable callback that reads the editor captured at configure time. The package fixtures copy the view's caret into that editor, and CI does not run `apps/www/tests/browser/tabbable.spec.ts`. owner: zbeyens. stop: a package fixture that keeps the two editors' carets apart, or that spec joining a CI lane.
