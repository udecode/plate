# Potion's registry, restyles and app files

How Potion takes Plate's UI and packages, when it may restyle a registry
component, where Potion-only editor UI goes, and when a file may carry the
`-app` suffix. Read it in full before a sync, before editing a file under
Potion's `src/registry`, before new Potion-only editor UI, and before creating
or changing a `*-app` file.

## Sync

- Every sync takes all of Plate's registry UI and all of its packages at once,
  never one component at a time.
- `bun run sync:plate-local` in Potion does it, as the `sync-potion` skill
  says. It builds and packs `platejs` and `plitejs`, then writes every Plate
  registry file into `src/registry`.
- A registry file in Potion is one that comes from Plate's
  `apps/www/src/registry`. The command reads Plate's built registry
  (`apps/www/public/r`) with the `radix-nova` style overlay, which is what a
  shadcn user of that style installs. `bases/radix/*` lands in
  `src/registry/components/editor/`, `@/components/ui/` becomes
  `@/registry/ui/`, `@platejs/test` becomes `platejs/testing`, and biome runs
  last.
- The sync never overwrites files outside `src/registry`, the shadcn
  components in `src/registry/ui`, or Plate API routes Potion does not mirror.
  It lists files Plate no longer ships and deletes none.
- A component Potion restyled is not overwritten whole; the next section says
  how it merges.
- `.plate-ui-sync/forks/*.json` records Potion's v53 changes, 277 of them on
  2026-11-06. The sync drops them on purpose; that is not a regression.

## Restyles

- Potion may restyle a component only once it is nearly done on Plate's side,
  meaning Plate expects no large change to it. The owner judges that, the
  component goes into the table below, and only then does the edit start.
- A restyle changes style and interaction only. Every bug fix goes to Plate,
  as the `potion` skill's Plate problems section says.
- The sync tells a restyled file by the blob id that `bases` in
  `.plate-ui-sync/last-sync.json` records for what the last sync wrote. A
  changed file keeps Potion's version. Plate's new version goes to
  `.plate-ui-sync/base/<path>.base`, and Plate's change since the last sync
  goes to `tmp/plate-sync/review/<plate commit>/<path>.diff`.
- Read each such diff, merge Plate's bug fixes into Potion's version by hand,
  leave out Plate's own style and interaction changes, then delete the diff.
- A file changed back to match Plate is overwritten whole again from the next
  sync on, and its `.base` goes away.

| Component | Date the owner called it ready | Note |
| --- | --- | --- |

## Potion-only registry components

- Editor UI that Potion needs and Plate does not ship also goes under
  `src/registry`, usually `src/registry/components/editor/`, not
  `src/components`, because `src/registry` is where Potion keeps its offline
  Plate files. Like a registry component it stays offline and carries no
  backend code. When it needs Potion's data, it takes it through an injection
  point, as the app files section says.
- Use only what the synced components export, without editing a synced file.
  When that cannot work, a synced file may change, outside the ready rule
  above. Such a file then syncs like a restyle: it keeps Potion's version and
  takes only Plate's bug fixes from the diff.
- The sync lists files Plate does not ship under "not shipped by Plate
  (review, delete if stale)" without deleting them. The files in the table
  below are not stale. Never delete them.
- A new Potion-only file, or a synced file changed for one, goes into the
  table first.

| File | Own or changed | What it holds | Owner's decision |
| --- | --- | --- | --- |
| `src/registry/components/editor/floating-discussion.tsx` | own | The comment and suggestion column that stays beside the body on wide screens, falling back to Plate's popover on narrow ones. Plate keeps the popover design | 2026-11-17 |
| `src/registry/components/editor/discussion.tsx` | changed | Only adds `export` to `SuggestionDiscussionCard` for the column to reuse. A sync keeps the export and merges Plate's fixes as usual | 2026-11-17 |
| `src/registry/components/editor/database-static.tsx` | own | The database block's schema, which stores only the database page's `databaseId`, the type `useDatabase` returns, and the static version for export and the AI server, which writes only a link to the database page | 2026-11-19 |
| `src/registry/components/editor/database.tsx` | own | The database block: draws the table or board for its view and switches between them. Data and edit functions come from `useDatabase` in plugin state, with no backend | 2026-11-19 |
| `src/registry/components/editor/database-table.tsx` | own | The database table: one column per property, cell editing by type, adding, renaming, retyping and deleting columns and options, and "Show more" after 50 rows | 2026-11-19 |
| `src/registry/components/editor/database-board.tsx` | own | The database board: one column per select option, "Show more" after 25 cards a column, dragging a card to change its value, and new cards in a column | 2026-11-19 |
| `src/registry/lib/database.ts` and its test `database.test.ts` | own | The database data model: property, cell and view types with zod schemas, and pure functions to change properties, read and write cells and group the board. The server and the block share it | 2026-11-19 |
| `src/registry/lib/database-grid.ts` and its test `database-grid.test.ts` | own | The table's keyboard cursor model: cursor state by row and column id, a key-to-action table, edge clamping, "Show more", and repair after rows or columns change. Pure functions, no DOM | 2026-11-19 |
| `src/registry/components/editor/database-cell.tsx` | own | The table cell editor: mounted only while editing, saves on Enter, Tab, Escape and an outside click, and edits text, number, date, select and checkbox by type | 2026-11-19 |

## App files

Registry components aim to stay offline: no backend code, with injection
points that serve each app and backend. So by default no `-app` file exists.
Decide in this order:

1. Only the UI differs. Restyle the registry component when the restyle rule
   allows it, build a Potion-only component as that section says, or use
   Plate's component as it is. No `-app` file.
2. Potion's backend or app data is needed. Connect it through Plate's
   injection point, in an ordinary Potion file with no `-app` suffix and no
   copy of the component. Comments and uploads show how: `plate-provider.tsx`
   passes `initialComments`, `mutate` and `users` to `CommentsPlugin` when it
   creates the editor, and `upload-kit.ts` gives `UploadPlugin` the files
   gateway client.
3. No injection point is enough, so backend code must go into a registry
   component. Only then create an `-app` file, tell the owner, handle the gap
   as a Plate problem, and delete the file once Plate adds the injection point.

Only the files in this table may be `-app` files. A new one needs the owner's
word and goes into the table first.

| File | What it may hold | Deleted once Plate provides |
| --- | --- | --- |
| `src/components/editor/mention-kit-app.tsx` | The hover preview and click navigation of page mentions, whose `ref` starts with `/`. User mentions use Plate's component. The candidate menu (`DocumentGroup`, `PeopleGroup`, `MentionCombobox`) stays here for now | Data injection for the candidate menu, and preview and navigation injection for page mentions |

Ordinary Potion files that connect Plate, not `-app` files:

| File | What it does |
| --- | --- |
| `src/components/editor/editor-kit.tsx` | Composes Plate's EditorKit: adds and removes plugins and swaps in Potion's versions |
| `src/components/editor/upload-kit.ts` | Gives `UploadPlugin` a `createFilesClient` and the gateway download URL per document id; cover uploads use it too |
| `src/server/files.ts` | Connects the registry's `createFilesGateway`: `resolveAccess` checks the session and document access, and `FILES_STORAGE` picks the storage adapter |
| `src/components/editor/database-kit.tsx` | Gives `DatabasePlugin` its `useDatabase`, which reads a snapshot through tRPC's `database.get` and gives the owner edit functions that update the cache first and send requests in order, and adds a "Database" slash item per document id that creates through `database.create` |
| `src/components/editor/editor-static-kit.ts` | Composes Plate's `BaseEditorKit` with the database block's static version, for export and the AI server |

## Waiting on Plate injection points

These needs use Potion's data, but Plate has no injection point for them yet.
Until it does, Potion uses Plate's component as it is and builds no `-app`
file for them.

| Need | What Plate must provide | Until then |
| --- | --- | --- |
| @ mentions search real users and pages | Data injection for the candidate menu: groups, a data hook and what to insert on select | `mention-kit-app.tsx` keeps the candidate menu |
| Searching pages while inserting a link | Data injection for the link input | Only typed URLs |
| Links show the page's icon and title | A resolver, such as `resolveLink(url)` returning `{ icon, title }` | Only the link text |
| A signed-out click on comment, suggestion or AI opens sign-in | An interception hook | Signed out, those plugins are not installed and their buttons are hidden |
| A fake AI reply for a guest without an API key | AI transport injection | None |
