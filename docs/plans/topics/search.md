# Find and navigation

Page: https://claude.ai/artifact/WXGAJm2EnoyhvrdSoSBk2m

Find searches the main document for a literal, case-insensitive query, paints every match through decorations without writing the document or history, and steps an active result through them. `BaseFindPlugin` in `platejs/find` owns the query, the results and navigation. The copied `FindKit` owns each view's bar, `Mod+F`, the deferred draft and range scrolling. Package specs, the copied-UI spec and the 2026-09-09 view-ownership, controller-cut and range-scrolling plans prove that split. While a query is active, every document commit reruns the whole search and repaints every match, which the 2026-10-21 review measured.

## Public API

An app installs the copied kit with its other plugins.

```tsx
import { createEditor } from 'platejs/react';

import { FindKit } from '@/components/editor/find';

const editor = createEditor({
  plugins: [...FindKit],
});
```

Headless search, navigation and selection go through the plugin.

```ts
import { createEditor } from 'platejs';
import { BaseFindPlugin } from 'platejs/find';

const editor = createEditor({ plugins: [BaseFindPlugin] });
const find = editor.plugin(BaseFindPlugin);

find.api.search('example');
find.api.move(1);
find.store.get('matches');
find.store.get('activeMatch');
find.update.select();
```

A control in an Editable slot opens that view's bar.

```tsx
import { useFind } from '@/components/editor/find';

export function FindButton() {
  const { open } = useFind();

  return (
    <button onClick={() => open()} type="button">
      Find
    </button>
  );
}
```

## Main changes

- On every document commit while a query is active, `BaseFindPlugin` runs `NodeApi.findTextRanges` over the whole main document, builds path-based match ids, indexes matches by anchor path for decorate, and publishes a new `matches` array. Its decorate observer then refreshes the node of every previous and current match.
- `activeIndex` keeps its number through a rescan, so an edit that adds or removes a match before the active one moves the highlight to another match.
- Decorations paint only on the document Find searched, so a view of another document or a named root shows none.
- `update.select` is declared with `txSelection`, so it runs in the caller's transaction on the stored document. Matches are main-document ranges, so in a named root's view transaction it returns false and selects nothing. Called on the base editor's transaction inside a callback Plite runs in a named root, such as the `match` of `tx.nodes.remove` on a node in that root, it selects whatever text sits at the result's path and offsets in that root instead and returns true, or throws when they fall outside that root. A view's transaction keeps its view's root. Plite's base transaction addresses the callback's root there (`withEditorUpdateRootScope` in `packages/plitejs/src/core/public-state.ts`), its dispatch keeps that root for plugin methods (`packages/plitejs/src/core/plugin-dispatch.ts`), and that repair belongs to Plite.
- The copied `FindRoot` wraps each Editable, handles `Mod+F` on that Editable, and renders a bar that defers its draft with `useDeferredValue` and scrolls the active range only while the bar has focus.

## What other editors do

The 2026-10-21 review read source only, nothing run: `prosemirror-search@ff1148a3`, Lexical's playground `FindReplaceExtension@dd5c41b1`, Slate's search-highlighting example `@945a484d`, Tiptap `@91c51be5` and CKEditor 5's find-and-replace `@14e73cc3`. Only CKEditor 5 rescans just the changed nodes and keeps the active result's identity through edits. ProseMirror and Lexical redo the whole search, and every editor that ships find also searches text marked as deleted.

| Editor | Where results live | Rescan on edit | Repaint on edit | Active match identity | Deleted or hidden text | Other roots |
| --- | --- | --- | --- | --- | --- | --- |
| Plate | Plugin store | Whole main document | Every previous and current match node | Index into the result list, which slides when an earlier match appears or goes | Searched | Not searched or painted |
| ProseMirror (`prosemirror-search`) | Plugin state with a decoration set, no result list (`src/search.ts:7`) | Whole document or the configured range on every doc or selection change (`src/search.ts:47`) | Rebuilds every match decoration | The editor selection; a match is active when it equals the selection (`src/search.ts:22`) | Searched unless the query's filter drops it | Not searched |
| Lexical (playground) | Extension signals with a computed match list | Whole root text whenever the text changes | Clears and rebuilds every highlight | Numeric index, clamped, which slides like Plate's | Searched | Nested editors not searched |
| Slate (example) | Query in React state; ranges computed per node in decorate | Each rendered block; memoized blocks skip | Recomputed blocks only | None; no navigation | Searched | Not searched |
| Tiptap | No find extension ships | None | None | None | None | None |
| CKEditor 5 (`ckeditor5-find-and-replace`) | Plugin state plus one model marker per result | Only nodes the model differ changed (`findandreplaceediting.ts:228-290`) | Removes and re-adds markers in changed nodes; others stay | Result object with a live-range marker; the shown index is derived; an edit inside the active match's block drops it | Searched | Every attached root |
