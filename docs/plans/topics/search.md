# Find and navigation

Page: https://claude.ai/artifact/DCidvFLzNdy3rqoDBckCk8

Find searches the main document for a literal, case-insensitive query, paints every match through decorations without writing the document or history, and steps an active result through them. `BaseFindPlugin` in `platejs/find` owns the query, the results and navigation. The copied `FindKit` owns each view's bar, `Mod+F`, the deferred draft and range scrolling. Package specs, the copied-UI spec and the 2026-09-09 view-ownership, controller-cut and range-scrolling plans prove that split. While a query is active, an edit inside one paragraph searches that paragraph alone, Find repaints only the text whose matches changed, and the active result follows its match through edits.

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

The active result follows its match through edits. Here the active match is the second paragraph's `hello`, and an edit types another `hello` in front of it, so the active index moves to the match the user was on.

```ts
// packages/platejs/src/features/find/lib/BaseFindPlugin.spec.ts
api.search('hello');
api.move(1);
editor.update.text.insert('hello ', { at: { path: [1, 0], offset: 0 } });
expect(store.get('activeIndex')).toBe(2);
```

An app's own `store.set({ activeIndex })` takes effect at once and survives the next edit, as `api.move` does. The query changes only through `api.search`. Store subscribers hear only commits that change a match, the active result or `error`, and unchanged matches keep their identity. `api.search` called inside the `update` of a named root's view searches the main document. Match ids are opaque keys that survive a block moving above them.

No public call changes for the rescan. Inside Find, the code that runs after each commit checks its last search and searches only the part of the document that changed.

```ts
// packages/platejs/src/features/find/lib/BaseFindPlugin.ts
commit: () => {
  if (search?.query) {
    const children = readMainChildren();
    const owned = store.get().matches === search.matches;
    const current = owned && search.schema === editor.read.schema.identity();
    if (!current || children !== search.children) {
      const scope =
        current && !search.failed
          ? getTextSearchScope(editor.read.schema, search.children, children)
          : null;
      if (!scope || !publishScope(search, scope, children)) {
        publish(search.query, true);
      }
    }
  }
  if (held === 'all' || held.size > 0) {
    const nodeKeys = held === 'all' ? held : [...held];
    held = new Set();
    send(nodeKeys);
  }
},
```

## Main changes

- On every commit while a query is active, Find checks its last search: the store must hold the array Find published, the schema must be the one it searched with, and the main tree must be the one it searched. When all three hold, it does nothing. When only the tree differs, Plite's internal `getTextSearchScope` walks down both trees to the deepest node that holds every difference and that `findTextRanges` reads on its own, usually one paragraph, and Find searches that node alone and splices its matches into the list. A top-level insert or removal, an edit in two places under one parent, a replace with new nodes, a schema change, the first tree change after a failed search, a scope search that throws and the first commit after an app writes its own `matches` search the whole document.

- `findTextRanges` and `getTextSearchScope` share one private test, `isTextRun`, in Plite's `internal/text-run.ts`, so the walk stops only where the search reads a node as one string.
- After a search, Find compares the new matches with the old ones text node by text node. It publishes a new list when any match's range differs, paths included, and refreshes only text nodes whose matches changed, plus the old and new active ones when the active match changes. A commit that changes no match, active result or `error` publishes nothing, and a commit that changes only the selection, a named root or records runs no search.
- Find keeps one private record of its last search: the query, the exact tree the search read, whether that search failed, the schema it read with, and the match array the store received. A match id is its text node's key and its order in that node. Inside `editor.update`, the record holds the update's edited tree, and Find holds the keys it would refresh until the commit, so the matches paint in that commit.
- The active result is one range anchor into the text. After an edit it is the same match while the search still returns that range, otherwise the first match that ends after the anchor's start, or else the first match. Find watches its own store, so `api.move` and an app's `activeIndex` write re-anchor through one path.
- Find refreshes by key only for its own list. While the store shows a list another writer stored, or returns from one to Find's own, it refreshes every text node at each change of `matches` or the active index. It paints its own list by a binary search in document order, and any other list through a copy sorted once into document order.
- Decorations paint only on the document Find searched, so a view of another document or a named root shows none.
- `update.select` is declared with `txSelection`, so it runs in the caller's transaction on the stored document. Matches are main-document ranges, so in a named root's view transaction it returns false and selects nothing. Called inside a `match` that runs in a named root, it still selects in the main document, because Plite runs the code inside a `match` in its caller's root.
- The copied `FindRoot` wraps each Editable, handles `Mod+F` on that Editable, and renders a bar that defers its draft with `useDeferredValue` and scrolls the active range only while the bar has focus.

## What other editors do

The 2026-10-21 review read source only, nothing run: `prosemirror-search@ff1148a3`, Lexical's playground `FindReplaceExtension@dd5c41b1`, Slate's search-highlighting example `@945a484d`, Tiptap `@91c51be5` and CKEditor 5's find-and-replace `@14e73cc3`. The 2026-10-22 review added VS Code `@df2411cf`, Monaco `@7374dcb4` and CodeMirror 6's search `@4db18115` and view `@fbff59ba`, and public material on Google Docs, Word and Word for the web, which are closed. Of the editors read, only CKEditor 5 rescans just the changed nodes, and it finds them from its model differ. Plate finds them by comparing node identity in the trees before and after the edit. Every editor that ships find also searches text marked as deleted. The research run is `docs/plite/research/2026-10-22-find-incremental-decorations/`.

| Editor | Where results live | Rescan on edit | Repaint on edit | Active match identity | Deleted or hidden text | Other roots |
| --- | --- | --- | --- | --- | --- | --- |
| Plate | Plugin store | Only the deepest node the whole search reads on its own that holds the edit, usually one paragraph; the whole main document after a top-level insert or removal, an edit in two places under one parent, a replace with new nodes, a schema change, the first commit after the app writes its own match list, and the first tree change after a failed search | Only text whose matches changed | A range anchor that follows its match | Searched | Not searched or painted |
| ProseMirror (`prosemirror-search`) | Plugin state with a decoration set, no result list (`src/search.ts:7`) | Whole document or the configured range on every doc or selection change (`src/search.ts:47`) | Rebuilds every match decoration | The editor selection; a match is active when it equals the selection (`src/search.ts:22`) | Searched unless the query's filter drops it | Not searched |
| Lexical (playground) | Extension signals with a computed match list | Whole root text whenever the text changes | Clears and rebuilds every highlight | Numeric index, clamped, which slides to another match when an earlier one appears or goes | Searched | Nested editors not searched |
| Slate (example) | Query in React state; ranges computed per node in decorate | Each rendered block; memoized blocks skip | Recomputed blocks only | None; no navigation | Searched | Not searched |
| Tiptap | No find extension ships | None | None | None | None | None |
| CKEditor 5 (`ckeditor5-find-and-replace`) | Plugin state plus one model marker per result | Only nodes the model differ changed (`findandreplaceediting.ts:228-290`) | Removes and re-adds markers in changed nodes; others stay | Result object with a live-range marker; the shown index is derived; an edit inside the active match's block drops it | Searched | Every attached root |
| VS Code and Monaco | A match list, then decoration ids in the text model's interval trees | The whole search scope, 100 ms after the edit, capped at 19,999 matches (`findModel.ts:81`, `:105-110`); Monaco packages the same core, not checked here | The interval trees move decorations with the edit at once; only rendered lines whose input changed redraw | A decoration id; an edit clears its active styling | Not checked | Not checked |
| CodeMirror 6 (`@codemirror/search`) | A decoration set over the visible ranges | Only the visible ranges, on every doc, selection or viewport change (`search.ts:399-425`) | Rebuilt for the viewport, and only changed tiles redraw; `MatchDecorator` instead maps its set and rescans changed visible lines (`matchdecorator.ts:103-143`) | The editor selection | Not checked | Not checked |
| Google Docs (public material only) | Unknown | Unknown | Canvas rendering is documented; what it redraws is not | Unknown | Unknown | Unknown |
| Word desktop (public material only) | Unknown | Unknown | Background pagination is documented; local redraw is not | Unknown | Unknown | Unknown |
| Word for the web (public material only) | Unknown | Search as you type is documented; a rescan after an edit is not | Unknown | Unknown | Unknown | Unknown |

## Open work

- Rerun the timing lines the rescan left inconclusive, and Phase 1's production-rerun lines, on the landed change. owner: zbeyens. stop: suggested task t_9c5320bd lands or is dropped. Tracked in the suggested-task ledger.
- Keep a store subscriber's write to `matches` during Find's publish from leaving that commit unequal to a fresh search. owner: zbeyens. stop: the owner says read-only matches, or drops the limit. Tracked in the rescan plan's Defaults.
- Refresh only the changed matches when the user moves through a match list the app wrote. owner: zbeyens. stop: the owner says key app moves, or an app reports slow moves. Tracked in the rescan plan's Defaults.
- Keep an active result picked inside `editor.update` on its match when a later commit types a new match right before it. owner: zbeyens. stop: suggested task t_bcd9a432 lands or is dropped. Tracked in the suggested-task ledger. Once it lands, cut the limit sentence from both Find pages.
- Stop copying the whole match list when one match changes. owner: zbeyens. stop: suggested task t_95b5151d lands or is dropped. Tracked in the suggested-task ledger.
- Skip the refresh of a match that spans text nodes and only moved. owner: zbeyens. stop: suggested task t_3b8b6e48 lands or is dropped. Tracked in the suggested-task ledger.
- Decide whether the decoration runtime stays the fastest owner of editor highlights, for every highlight source, Find included. owner: zbeyens. stop: suggested task t_c5055d2a lands its verdict or is dropped. Tracked in the suggested-task ledger.
- Find why a keystroke at 10,000 blocks costs about 100 ms with no search open. owner: zbeyens. stop: suggested task t_c5a89c2a lands or is dropped. Tracked in the suggested-task ledger.
- Move Lint's run test onto Plite's rule. owner: zbeyens. stop: suggested task t_253fd716 lands or is dropped. Tracked in the suggested-task ledger.
