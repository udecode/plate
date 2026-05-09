# Slate v2 Docs Maintainer Reorg Review Plan

Date: 2026-04-29
Status: done
Review mode: slate-review
Current pass: Execution Phase 11 complete

## Current Verdict

The docs rewrite is directionally good, but the current organization is not
yet Slate-maintainer clean.

The repeated sentence class the user called out is a real smell:

> Use `tx.marks.add(...)` inside `editor.update(...)` in normal application
> code. The primitive mark helper is reference material for code that
> intentionally works at the bridge layer.

That sentence is not wrong. It is just in the wrong place. Repeating it inside
individual primitive method entries makes the reference page feel defensive and
implementation-shaped. A Slate maintainer would teach the write model once,
then let the API reference be exact.

The best reorg is:

1. keep the legacy docs information architecture
2. make one page own the write model
3. make one API page own exact transaction signatures
4. quarantine primitive editor write methods under one advanced section with
   one page-level note
5. remove internal proof material from the public table of contents

Do not patch the repeated sentences one by one. That would leave the same
ownership problem in prettier prose.

Reopened on 2026-04-29 after the API/runtime/docs hard-cut review. The new
findings are not cosmetic:

- instance schema predicates on `editor` make schema policy look like mutable
  editor methods
- `toggleList`, `setBlock`, `toggleBlock`, and `toggleAlignment` leaked
  product-level formatting into raw Slate core
- `<Slate onChange>` currently reads like a full editor-change callback while
  source only calls it for `childrenChanged`
- `Slate` and `EditableTextBlocks` both expose projection/decorator store props
  when provider ownership should be the normal public API
- docs still teach several legacy command/query shapes that fight the
  transaction/read model
- public `Editor.*` query helpers are a compatibility compromise; the
  no-compat target should route editor-state reads through `state` / `tx`

The right move is a hard cut, not another wording pass.

## Confidence Scorecard

Current score: `0.93`

| Dimension | Weight | Score | Evidence |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.20 | 0.93 | Final target removes duplicated projection props from hot React surfaces, makes `projectionStore` runtime-owned, and replaces app-level `useEditorSelector(editor => editor.read(...))` examples with `useEditorState`. Evidence: `SlateProps` projection inputs in `../slate-v2/packages/slate-react/src/components/slate.tsx:37-45`, duplicate `EditableTextBlocksProps` inputs in `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:252-282`, and existing target-scoped hook guidance in `../slate-v2/docs/concepts/09-rendering.md:147` and `:177`. |
| Slate-close unopinionated DX | 0.20 | 0.93 | Final target keeps pure node/path/range helpers, but hard-cuts public `Editor.*` editor-state queries, instance schema predicates, instance query aliases, and opinionated block/list helpers from normal raw core. Evidence: instance predicates and aliases at `../slate-v2/packages/slate/src/interfaces/editor.ts:237-325`, static editor query helpers at `:101-234` in current docs, opinionated helpers at `:360-383`, and `toggleList` in `../slate-v2/packages/slate/src/editor/block-format.ts:120-162`. |
| Plate and slate-yjs migration-backbone shape | 0.15 | 0.92 | Final target keeps substrate-only migration: extension `state`/`tx`, schema/spec policy, commits, operations, tags, and local runtime ids, with no current adapter compatibility requirement. Operation replay belongs under `tx.operations.replay(...)`, not a public `editor.applyOperations(...)` escape hatch. Evidence: extension `state`/`tx` in `../slate-v2/docs/concepts/08-plugins.md:38-44`, commit/operation replay in `../slate-v2/docs/walkthroughs/07-enabling-collaborative-editing.md:53-70`, and migration contracts in `../slate-v2/packages/slate/test/migration-backbone-contract.ts:33-195`. |
| Regression-proof testing strategy | 0.20 | 0.92 | Final gates cover stale docs, public nav, adapter promises, banned core helpers, callback contracts, duplicate React projection props, and browser-proof family mapping. Evidence: browser contract families in `../slate-v2/packages/slate-browser/src/core/first-party-browser-contracts.ts:24-130` and Pass 8/9 grep gates in this plan. |
| Research evidence completeness | 0.15 | 0.92 | Plan cites live v2 source, live v2 docs, legacy Slate docs, compiled Slate docs research, solution docs style, unit contracts, migration contracts, and browser contracts. No decorative Lexical/ProseMirror/Tiptap refresh is needed because this closure is scoped to Slate API/docs hard cuts. |
| shadcn-style composability and hook/component minimalism | 0.10 | 0.93 | Final target leaves app authors with fewer props and clearer hooks: provider-owned sources, runtime-owned projection store, mount/render/event-only `Editable`, `useEditorState` for shell reads, and target-scoped hooks for rendered document nodes. |

Score threshold is met again. The reopened plan has no remaining "maybe" public
API language: `projectionStore` is runtime-owned and not a normal public
`<Slate>` or `<Editable>` prop.

## Pass 2 Evidence Refresh

Current docs evidence:

- `../slate-v2/docs/api/nodes/editor.md:264` and `:314` repeat
  transaction-path warnings inside individual mark methods.
- `../slate-v2/docs/api/nodes/editor.md:517-532` repeats
  `Inside editor.update(...)` across primitive insert methods.
- `../slate-v2/docs/api/transforms.md:1-8` already has the right page-level
  owner statement for the normal write surface.
- `../slate-v2/docs/api/transforms.md:34-143` currently lists `tx.nodes`,
  `tx.selection`, `tx.text`, and `editor.applyOperations` as distinct
  families; the no-compat target folds replay into `tx.operations.replay`.
- `../slate-v2/docs/concepts/04-transforms.md:1-19` teaches the write model as
  narrative concept prose, and `:188-209` cleanly separates normalization and
  operation replay.
- `../slate-v2/docs/Summary.md:21`, `:34`, and `:74` show the remaining IA
  smell: `Editor Methods` labels plus public `Docs Proof Map`.

Legacy Slate evidence:

- `../slate/docs/Summary.md:17-35` keeps Concepts and API labels as
  `Transforms`, not `Editor Methods`.
- `../slate/docs/api/transforms.md:1-10` starts with a short purpose and table
  of contents.
- `../slate/docs/api/transforms.md:39-118` keeps transform entries terse and
  exact.
- `../slate/docs/walkthroughs/05-executing-commands.md:1-9` starts from the
  user problem and extracts the command abstraction before the reference layer.

Live Slate v2 source evidence:

- `../slate-v2/packages/slate/src/interfaces/editor.ts:193-206` defines the
  update transaction groups: `marks`, `nodes`, `selection`, and `text`.
- `../slate-v2/packages/slate/src/interfaces/editor.ts:208-234` currently
  exposes `applyOperations`, `read`, `getSelection`, and `getSnapshot` on
  `BaseEditor`; the no-compat target keeps coherent boundaries and cuts the
  public replay escape hatch.
- `../slate-v2/packages/slate/src/interfaces/editor.ts:814-829` currently
  exposes primitive writers as API reference material; the no-compat target
  moves public writes to `tx`.
- `../slate-v2/packages/slate/src/interfaces/editor.ts:1394-1403` exposes
  `Editor.subscribe` and `Editor.update`.

Contract evidence:

- `../slate-v2/packages/slate/test/read-update-contract.ts:11-48` proves the
  coherent read/update boundary and commit tags.
- `../slate-v2/packages/slate/test/read-update-contract.ts:50-129` proves
  writes and replay are rejected inside plain reads.
- `../slate-v2/packages/slate/test/write-boundary-contract.ts:27-55` proves
  primitive writes outside `editor.update` are rejected.
- `../slate-v2/packages/slate/test/write-boundary-contract.ts:57-77`
  currently proves `applyOperations` as the explicit replay writer; the target
  should move that proof to `tx.operations.replay(...)`.
- `../slate-v2/packages/slate/test/write-boundary-contract.ts:79-114` proves
  implicit writes route through `editor.update` and `tx` methods.

## Source-Backed Docs North Star

Keep Slate docs calm:

- Walkthroughs teach a user problem progressively.
- Concepts explain the model once.
- API reference gives exact signatures and caveats.
- Advanced/internal bridge APIs are documented, but not promoted as the normal
  app author path.
- Maintainer proof artifacts exist, but do not sit beside user-facing
  Resources and FAQ.

Legacy Slate did this well with `Summary.md` separating Walkthroughs,
Concepts, API, Libraries, and General. The v2 docs should keep that shape.

## Pass 3 Pressure Pass Results

### Performance Pass

Verdict: keep.

The docs reorg is not a runtime change. It must not alter the React guidance
that rendered document content uses target-scoped hooks and avoids broad editor
subscriptions. Acceptance criteria:

- `concepts/09-rendering.md` still says broad editor subscriptions are for
  shell UI, not rendered document nodes.
- `api/nodes/element.md` and `libraries/slate-react/editable.md` still teach
  `renderVoid` as visible-content-only and `useElementSelected(target)` as an
  opt-in hook.
- No new docs prose claims selection movement rerenders the editor tree.

### DX Pass

Verdict: revise and keep.

The current docs are accurate but too defensive. Slate-close DX means one
write-model explanation, not repeated warnings under every primitive method.
Acceptance criteria:

- `Summary.md` uses `Transforms` for `concepts/04-transforms.md` and
  `api/transforms.md`.
- `concepts/04-transforms.md` owns the write model and says primitive editor
  write helpers are runtime internals.
- `api/transforms.md` is the terse `tx` reference and includes
  `tx.operations.*`.
- `api/nodes/editor.md` documents lifecycle and boundary methods, not public
  `Editor.*` queries or primitive write helpers.
- No per-method warnings remain for `addMark`, `removeMark`, `insertBreak`,
  `insertSoftBreak`, `insertNode`, or `insertText`.

### Unopinionated-Core Pass

Verdict: keep.

The reorg must not make raw Slate docs look like Plate docs. Acceptance
criteria:

- No `editor.api`, `editor.tf`, `PlatePlugin`, current Plate adapter, or
  current slate-yjs adapter promise enters raw Slate docs.
- Extension docs keep raw `state` and `tx` backbone language.
- Collaboration docs keep adapter-owned awareness/network/CRDT policy.

### Migration Pass

Verdict: keep with proof-map relocation.

The proof map is valuable for agents and maintainers, but it reads like
internal release scaffolding in the public Summary. Acceptance criteria:

- Remove `Docs Proof Map` from public `Summary.md`.
- Keep `docs/general/docs-proof-map.md` in place.
- Link the proof map from `docs/general/contributing.md` or a maintainer
  subsection so proof remains findable.
- Do not require current-version Plate or slate-yjs adapters.

### Regression Pass

Verdict: strengthen gates.

The previous fast gates were directionally right, but path globs must be
cwd-stable. Acceptance criteria:

- Run stale-doc greps from `../slate-v2` with `docs` as the search root.
- Exclude historical docs as `--glob '!docs/general/changelog.md'`.
- Repeated-warning grep should return zero matches outside the single owner
  note locations chosen by the implementation.
- Browser proof rows stay named, but no browser run is required for docs-only
  prose unless executable snippets change.

### Research Pass

Verdict: enough evidence for a docs reorg.

The compiled Slate docs research plus live legacy Slate docs are sufficient for
this scope. No fresh Lexical/ProseMirror/Tiptap refresh is needed because the
decision is about Slate IA, not editor architecture. Acceptance criteria:

- The plan keeps citing the compiled Slate docs pattern page.
- External editor research should not be added as decorative evidence.
- If implementation changes extension/collab docs beyond organization, rerun
  the ecosystem maintainer pass against migration-backbone surfaces.

### Simplicity Pass

Verdict: cut, do not add.

Do not add a new public Architecture page and do not split `api/editor-runtime`
unless the editor API page remains unreadable after reordering. Acceptance
criteria:

- Prefer moving and trimming existing prose over adding pages.
- Keep `api/nodes/editor.md` as the reference owner for primitive editor
  methods.
- Keep `api/transforms.md` as the transaction method reference.
- Keep `concepts/04-transforms.md` as the mental-model owner.

## Public Docs Target

### Summary.md

Preferred nav:

```md
## Concepts

- [Interfaces](concepts/01-interfaces.md)
- [Nodes](concepts/02-nodes.md)
- [Locations](concepts/03-locations.md)
- [Transforms](concepts/04-transforms.md)
- [Operations](concepts/05-operations.md)
- [Commands](concepts/06-commands.md)
- [Editor](concepts/07-editor.md)

## API

- [Transforms](api/transforms.md)
- [Node Types](api/nodes/README.md)
  - [Editor](api/nodes/editor.md)
```

Changes:

- Rename the current Summary label `Editor Methods` back to `Transforms`.
- Remove `Docs Proof Map` from the public General section.
- Link proof material from `general/contributing.md` or a maintainer-only note,
  not the reader-facing table of contents.

### concepts/04-transforms.md

This page should own the write model once.

It should say:

- Slate writes happen inside `editor.update(...)`.
- The callback receives `tx`.
- `tx.nodes`, `tx.text`, `tx.selection`, and `tx.marks` are the normal app
  authoring surface.
- `tx.operations.replay(...)` is the operation replay path.
- Primitive editor write helpers are runtime internals, not public app API.

It should not become a full API catalog. Keep it narrative and example-led,
like legacy Slate's transforms concept page.

### api/transforms.md

This page should be the exact transaction API reference.

It should list:

- `tx.nodes.*`
- `tx.text.*`
- `tx.selection.*`
- `tx.marks.*`
- `tx.operations.*`, including replay

It can have one top-level note:

> Use transaction methods inside `editor.update(...)` for normal document
> changes. Runtime internals may use lower-level helpers, but public document
> changes and operation replay stay inside the transaction boundary.

Then stop repeating that warning.

### api/nodes/editor.md

Reorganize the page into reader intent:

1. `## Editor`
   - short description
   - snapshot/read/update mental model
2. `## Creating an editor`
   - `createEditor`
3. `## Reading state with state`
   - snapshot, selection, children, node traversal, marks, schema, points,
     ranges, and nodes through `editor.read(state => ...)`
4. `## Updating with tx`
   - transaction groups, command reads, writes, and operation replay
5. `## Schema setup`
   - extension/spec setup only; schema policy reads use `state.schema` /
     `tx.schema`
6. `## Subscribing to commits`
   - `Editor.subscribe`, `Editor.getLastCommit`
7. `## Normalization methods`

This keeps the API complete without preserving public `Editor.*` query clutter
or public editor-instance write escape hatches.

## Internal Runtime Target

No runtime implementation change is implied by this review.

Docs should describe the runtime with the same boundaries the code already
uses:

- `editor.read` for coherent reads
- `editor.update` for normal writes
- `tx` for transaction helpers
- primitive editor methods for runtime internals only
- `tx.operations.replay(...)` for operation replay
- commits for subscriptions, history, and collaboration metadata

The docs should not invent a new API to solve a prose problem.

## Hook / Component / Render DX Target

Keep the React docs mostly as-is, but move proof language out of user docs.

User-facing React docs should say:

- render normal elements with `attributes` + `children`
- render voids with visible content only
- use target-scoped hooks for selection UI
- keep broad editor selectors out of rendered content

They should not make every component example sound like a runtime audit.

## Plate Migration-Backbone Target

Plate needs the docs to make the substrate easy to build on:

- extension helpers live under `state` and `tx`
- schema/spec behavior is explicit
- app/product APIs can sit above raw Slate
- raw Slate docs do not promise Plate's current public adapter shape

The reorg helps Plate because it makes `tx` the obvious write surface without
turning raw Slate docs into Plate-style plugin documentation.

## slate-yjs / Collaboration Backbone Target

Keep the collaboration walkthrough substrate-focused:

- local edits export commit operations
- remote edits import through `tx.operations.replay(...)`
- tags route metadata
- runtime ids stay local
- awareness/presence belongs to adapters

No current-version slate-yjs adapter support is required.

## Pass 5 Ecosystem Maintainer Results

Verdict: keep.

This docs reorg does not change extension, plugin, operation, snapshot, or
collaboration behavior. It does touch docs that describe those surfaces, so the
ecosystem pass still needs to prove the plan does not drift into adapter
promises.

### Plate / Plugin Maintainer Answer

The migration backbone is believable because raw Slate exposes extension
groups, not product APIs:

- `state` helpers live inside `editor.read(...)`.
- `tx` helpers live inside `editor.update(...)`.
- extension slots cover schema specs, commands, normalizers, commit listeners,
  operation middleware, and capabilities.
- product-specific conventions stay above the raw substrate.

Evidence:

- `../slate-v2/docs/concepts/08-plugins.md:38-44` shows `state` and `tx` usage.
- `../slate-v2/docs/concepts/08-plugins.md:76-131` explains state/write groups
  and raw extension slots.
- `../slate-v2/packages/slate/test/migration-backbone-contract.ts:33-132`
  proves extension namespaces and schema specs without adapter-shaped editor
  namespaces.

Acceptance:

- Do not document `editor.api`, `editor.tf`, `PlatePlugin`, `plate`, `yjs`, or
  `table` as direct editor namespaces.
- Keep Plate named only as a product layer that can build richer conventions
  above Slate's smaller substrate.
- Do not require current Plate adapters or compatibility shims.

### slate-yjs / Collaboration Maintainer Answer

The collaboration backbone stays deterministic because adapters use commits and
operations, not mutable editor fields or runtime ids:

- local writes produce commits with operations and tags.
- remote writes enter through explicit `tx.operations.replay(...)` inside
  `editor.update(...)`.
- subscribers observe snapshots and commits.
- runtime ids are local projection handles, not persistence identifiers.
- providers, awareness, CRDT merge policy, and remote cursor rendering belong
  to adapters.

Evidence:

- `../slate-v2/docs/walkthroughs/07-enabling-collaborative-editing.md:3-5`
  says Slate does not choose network, CRDT, persistence, or awareness policy.
- `../slate-v2/docs/walkthroughs/07-enabling-collaborative-editing.md:53-70`
  currently defines operations as replay contract and `applyOperations` as
  remote import; the no-compat target rewrites that public import path to
  `tx.operations.replay(...)`.
- `../slate-v2/docs/walkthroughs/07-enabling-collaborative-editing.md:96-120`
  defines commit observation and warns against mutable editor fields.
- `../slate-v2/docs/walkthroughs/07-enabling-collaborative-editing.md:122-150`
  makes runtime ids local and splits Slate/adapter/React ownership.
- `../slate-v2/docs/walkthroughs/07-enabling-collaborative-editing.md:191-199`
  explicitly refuses a full multiplayer recipe.
- `../slate-v2/packages/slate/test/migration-backbone-contract.ts:135-195`
  proves operation replay, tags, and local-only runtime targets.

Acceptance:

- Do not add `withYjs`, `slate-yjs`, provider setup, CRDT merge recipes, or
  remote-cursor implementation to raw Slate docs.
- Keep commits, tags, snapshots, deterministic operations,
  `tx.operations.replay(...)`, and local runtime ids as the raw contract.
- Keep current-version slate-yjs support out of scope.

### Exact Affected Surfaces

| Surface | Effect |
| --- | --- |
| `docs/concepts/08-plugins.md` | Keep extension substrate language: `state`, `tx`, extension slots, product APIs above raw Slate. |
| `docs/walkthroughs/07-enabling-collaborative-editing.md` | Keep collaboration substrate language: commits, operations, tags, `tx.operations.replay(...)`, runtime ids local, adapter ownership. |
| `docs/general/docs-proof-map.md` | Keep proof rows for extension namespaces, collaboration replay, and local runtime ids findable after moving the page out of public Summary. |

### Ecosystem Gates

```bash
cd ../slate-v2 && rg -n 'editor\\.api|editor\\.tf|PlatePlugin|withYjs|slate-yjs|Y\\.Doc|yjs' docs/concepts/08-plugins.md docs/walkthroughs/07-enabling-collaborative-editing.md docs/api/transforms.md docs/api/nodes/editor.md
```

```bash
cd ../slate-v2 && rg -n 'state|tx|operations\\.replay|commit|operations|tags|runtime ids are local|does not provide a full multiplayer recipe' docs/concepts/08-plugins.md docs/walkthroughs/07-enabling-collaborative-editing.md docs/general/docs-proof-map.md
```

The first grep should return zero matches except intentionally allowed product
layer mentions if the revision pass keeps them. The second grep must keep
positive hits so the substrate remains documented.

## Legacy Regression Proof Matrix

| Risk | Proof owner |
| --- | --- |
| Docs promote primitive write methods as normal app API | stale-term grep over `docs/api/nodes/editor.md` and `docs/api/transforms.md` |
| Docs repeat transaction warnings per method | grep count for `normal application code`, `bridge layer`, and `Inside editor.update` |
| Public nav exposes internal proof artifacts | `Summary.md` grep for `Docs Proof Map` |
| Docs hide replay/browser proof from maintainers | contributor/maintainer link to proof map |
| New prose invents APIs | source-ledger grep against `packages/slate/src/interfaces/editor.ts` and `packages/slate-react/src/index.ts` |

## Pass 6 Revision Results

Verdict: keep and execute in this order after closure.

The plan no longer has a real wording ambiguity. The only correct docs change
is an owner-cluster rewrite:

1. `docs/Summary.md`
   - Rename both `Editor Methods` entries to `Transforms`.
   - Remove `Docs Proof Map` from public General nav.
   - Do not add a new Architecture or Runtime page.

2. `docs/general/contributing.md`
   - Add one maintainer-facing link to `docs/general/docs-proof-map.md`.
   - Keep the proof map findable without making it a reader learning page.

3. `docs/concepts/04-transforms.md`
   - Teach the write model once: `editor.update((tx) => ...)`.
   - Explain `tx.nodes`, `tx.text`, `tx.selection`, `tx.marks`, and
     `tx.operations`.
   - State that primitive editor write helpers are runtime internals, not
     public app API.
   - Keep the page narrative and example-led, not a method catalog.

4. `docs/api/transforms.md`
   - Keep the title as `# Transforms API`.
   - Make the first paragraph say v2 transforms are transaction helpers used
     inside `editor.update`.
   - Document `tx.nodes.*`, `tx.text.*`, `tx.selection.*`, `tx.marks.*`, and
     `tx.operations.*`.
   - Mention operation replay only as `tx.operations.replay(...)`.
   - Use one top-level note for the transaction boundary, then stop.

5. `docs/api/nodes/editor.md`
   - Reorder by reader intent: editor overview, creation, reading state,
     updating with tx, schema setup, subscribing to commits, normalization.
   - Remove public `Editor.*` query helper signatures.
   - Remove public instance write/replay helper signatures.
   - Remove per-method `normal application code`, `bridge layer`, and
     `Inside editor.update` warnings.

6. Commands and walkthrough polish
   - Keep examples Slate-like and progressive.
   - Use `editor.update((tx) => ...)` for write examples.
   - Do not introduce new API names, adapter recipes, or migration-note voice.

7. Proof and gates
   - Run stale-prose, nav, source-ledger, adapter-promise, and
     substrate-presence greps.
   - Run browser gates only if snippets become executable fixtures or
     browser-sensitive claims change.

### Final Accepted Decisions

| Decision | Final wording rule |
| --- | --- |
| Public term | Use `Transforms` in nav and headings. Explain transactions inside the page. |
| Write model owner | `concepts/04-transforms.md` teaches it once. |
| Exact tx reference | `api/transforms.md` lists transaction helper signatures. |
| Primitive editor writers | `api/nodes/editor.md` documents them under one advanced section. |
| Proof map | Keep the page, remove it from public Summary, link it from Contributing. |
| Ecosystem promise | Substrate only: extension `state` / `tx`, commits, operations, tags, `tx.operations.replay(...)`, local runtime ids. |
| Explicit non-goals | No current Plate adapter, no current slate-yjs recipe, no new architecture page, no scattered warning patches. |

### Revision Gates

```bash
cd ../slate-v2 && rg -n 'normal application code|bridge layer|Inside .*editor\\.update|primitive .*reference material' docs --glob '!docs/general/changelog.md'
```

```bash
cd ../slate-v2 && rg -n 'Docs Proof Map|Editor Methods' docs/Summary.md
```

```bash
cd ../slate-v2 && rg -n 'editor\\.api|editor\\.tf|PlatePlugin|withYjs|slate-yjs|Y\\.Doc|yjs' docs/concepts/08-plugins.md docs/walkthroughs/07-enabling-collaborative-editing.md docs/api/transforms.md docs/api/nodes/editor.md
```

```bash
cd ../slate-v2 && rg -n 'state|tx|operations\\.replay|commit|operations|tags|runtime ids are local|does not provide a full multiplayer recipe' docs/concepts/08-plugins.md docs/walkthroughs/07-enabling-collaborative-editing.md docs/general/docs-proof-map.md
```

The first three gates are fail-on-output after implementation, except for a
deliberate contributor/proof-map link if it is outside `Summary.md`. The last
gate must keep positive hits.

## Browser Stress / Parity Strategy

No browser run is required for docs-only reorganization unless snippets become
executable fixtures.

Browser-sensitive claims must still map to:

- `packages/slate-browser/src/core/first-party-browser-contracts.ts`
- `playwright/stress/generated-editing.test.ts`
- focused example rows for voids, tables, search highlighting, hovering
  toolbar, annotations, and large-document runtime

The proof map should remain, but as maintainer/contributor support material.

## Hard Cuts And Rejected Alternatives

| Alternative | Verdict | Reason |
| --- | --- | --- |
| Patch every repeated warning sentence locally | drop | It treats symptoms, not ownership. |
| Delete primitive editor write methods from docs entirely | drop | They are real public/bridge surface and need reference documentation. |
| Keep `Docs Proof Map` in public Summary | drop | It is useful, but it reads as internal release scaffolding beside user docs. Keep the page, move discovery to contributing/maintainer docs. |
| Rename everything to "Transactions" | revise | Accurate internally, but less close to legacy Slate. Keep `Transforms` in nav and explain v2 transaction shape inside. |
| Add a big new "Architecture" page | drop | That would make docs more plan-like. Reuse Concepts/API split. |
| Split `api/editor-runtime.md` immediately | defer | Only split if `api/nodes/editor.md` remains too long after reader-intent reordering. |

## Slate Maintainer Objection Ledger

| Change | Who feels pain | Strongest fair objection | Why this is not change for change's sake | Evidence | Rejected alternative | Migration answer | Docs / example answer | Regression proof | Ecosystem answer | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Move repeated tx/bridge warnings into one write-model owner section. | Raw Slate user, docs reader, app author. | "Do not hide the warning; people will call low-level helpers directly." | The warning stays, but it becomes an ownership rule instead of a sermon repeated under every primitive method. Readers learn the model once, then API entries stay scannable. | Repetition is currently visible in `../slate-v2/docs/api/nodes/editor.md:264`, `:314`, and `:517-532`. Legacy Slate keeps transform entries terse in `../slate/docs/api/transforms.md:39-118`. | Patch each repeated sentence locally. Weaker because the page still teaches by caveat spam. | Users coming from the current docs use `editor.read` / `editor.update`; runtime-only helpers are not normal public docs. | `concepts/04-transforms.md` owns the write model. `api/transforms.md` owns exact `tx` signatures, including `tx.operations.replay`. `api/nodes/editor.md` owns lifecycle and boundary methods. | Cwd-stable grep for `normal application code`, `bridge layer`, `Inside .*editor.update`, and `primitive .*reference material` outside the chosen owner note. | No adapter compatibility promise. Pass 5 checks that extension `tx` and collaboration `tx.operations.replay` docs keep their substrate language. | keep |
| Rename `Summary.md` labels from `Editor Methods` back to `Transforms`. | Slate maintainer, returning Slate user, docs reader. | "`Transaction write API` or `Editor Methods` is technically more v2-accurate." | Navigation should speak Slate's stable reader vocabulary. The page itself can explain that v2 transform helpers live on `tx` inside `editor.update`. | Legacy `../slate/docs/Summary.md:17-35` uses `Transforms` under Concepts and API. Current v2 `../slate-v2/docs/Summary.md:21` and `:34` use `Editor Methods`. | Rename everything to `Transactions`. Weaker because it is precise internally but less Slate-close and makes the docs feel like a new editor. | Readers use the same TOC word as legacy Slate, then learn the v2 transaction shape in the first paragraph of the page. | `Summary.md` labels become `Transforms`; `api/transforms.md` opens with transaction helper wording but keeps the `Transforms API` title. | `rg -n 'Editor Methods' docs/Summary.md` returns no matches. | No plugin/collab behavior changes. Plate and slate-yjs migration pressure benefits from less renaming churn in the public docs. | keep |
| Move `Docs Proof Map` out of the public General nav while keeping the page. | Docs/test author, agent maintainer, release owner. | "Agents and maintainers need this map fast; hiding it makes regression work worse." | The proof map remains a maintainer artifact, just not a normal reader learning page beside Resources and FAQ. Public docs should not look like release scaffolding. | Current v2 `../slate-v2/docs/Summary.md:74` lists `Docs Proof Map`; legacy Slate General nav has Resources/FAQ-like reader pages, not a proof ledger. | Delete the proof map. Weaker because agents and maintainers lose source-backed regression navigation. | Users reading docs no longer see proof scaffolding in the TOC. Maintainers reach it from Contributing or a maintainer subsection. | `docs/general/contributing.md` links the proof map with maintainer wording; `Summary.md` no longer lists it. | `rg -n 'Docs Proof Map' docs/Summary.md` returns no matches, and a targeted grep confirms a contributor/maintainer link still exists. | No runtime ecosystem change. The proof map still protects extension/collab proof rows for later work. | keep |
| Cut primitive editor write/query methods from public docs. | Runtime bridge author, command author, test author, app author. | "Internal authors still need sharp tools." | They can exist internally, but the public API should not make bridge helpers look like application authoring surface. The rewrite is unpublished, so compatibility debt buys little. | Live source currently exposes primitive helpers and `applyOperations`; write-boundary tests prove why boundary discipline matters in `../slate-v2/packages/slate/test/write-boundary-contract.ts:27-77`. | Keep them documented under `Advanced editor write methods`. Weaker because it preserves a second public write surface after we already have `tx`. | App authors use `editor.update` + `tx`; operation replay uses `tx.operations.replay`; internal runtime helpers stay internal. | `api/nodes/editor.md` documents editor lifecycle, `read`, `update`, `subscribe`, and `dispose`, while `api/transforms.md` documents transaction groups. | Source-ledger grep for public `Editor.*` queries, instance aliases, primitive writers, and `editor.applyOperations`. | Extension/collab users get substrate through `state` / `tx`, not current adapter APIs or public bridge methods. | keep |
| Do not add a new public Architecture page for this cleanup. | Docs reader, app author, maintainer who wants a clean mental model. | "The read/update/runtime model is important enough for its own page." | This request is a docs organization cleanup, not a new architecture launch. A new public page would make the docs more plan-like and less like Slate. | `docs/solutions/style.md` says advanced/low-level details belong late, and the compiled Slate docs research says Slate's strength is walkthrough/concept/API separation. | Add `api/editor-runtime.md` or `concepts/runtime.md` immediately. Weaker because it spreads one write-model rule across another page. | Readers learn the model in `concepts/04-transforms.md` and exact APIs in `api/transforms.md` / `api/nodes/editor.md`. | No new public page unless `api/nodes/editor.md` remains unreadable after the reorder. | `rg --files docs | rg 'editor-runtime|runtime'` should not grow for this plan unless the revision pass explicitly reopens the split. | No plugin/collab behavior change. Keeping the docs small avoids accidental product-layer promises. | keep |

## Pass Schedule

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| 1. Current-state read and initial score | complete | Read current v2 Summary, Editor API, Transforms API, Commands/Transforms concepts, legacy Summary/Transforms/Commands, research Slate doc-pattern page, docs style guide, solution docs. | Created this plan. Identified write-model ownership split and public proof-map nav smell. | Need live-source/research refresh before raising score. | Pass 2 research and live-source refresh |
| 2. Research and live-source refresh | complete | Added exact current docs lines, legacy docs lines, live Slate v2 source lines, write-boundary tests, migration-backbone tests, browser contract rows, and solution-doc evidence. | Raised score from `0.78` to `0.84`; confirmed the plan should fix ownership and IA, not patch warning prose. | Need convert evidence into pressure-pass acceptance criteria. | Pass 3 pressure passes |
| 3. Pressure passes | complete | Added performance, DX, unopinionated-core, migration, regression, research, and simplicity pressure results with acceptance criteria. | Raised score from `0.84` to `0.88`; strengthened cwd-stable grep gates; resolved proof-map placement direction; deferred editor-runtime split. | Need maintainer ledger rows to include full required fields. | Pass 4 Slate maintainer objection ledger |
| 4. Slate maintainer objection ledger | complete | Expanded every major docs reorg change with strongest objection, payoff, evidence, rejected alternative, migration answer, docs/example answer, regression proof, ecosystem note, and verdict. | Raised score from `0.88` to `0.90`; rejected new public architecture page; kept primitive methods documented but advanced. | Need a focused ecosystem pass to verify extension/collab substrate wording stays precise and does not promise current adapters. | Pass 5 ecosystem maintainer pass |
| 5. Ecosystem maintainer pass | complete | Added Plate/plugin and slate-yjs/collab substrate answers with exact docs, test, and proof-map evidence. | Raised score from `0.90` to `0.91`; added adapter-promise and substrate-presence gates. | Need revision pass to reconcile all accepted rows into final implementation checklist and close any wording ambiguity. | Pass 6 revision pass |
| 6. Revision pass | complete | Added final implementation checklist, final accepted decisions, and revision gates. | Raised score from `0.91` to `0.92`; resolved wording ambiguity; prepared closure pass. | Need closure pass to verify every final gate and set completion status. | Pass 7 closure score and final gates |
| 7. Closure score and final gates | complete | Verified score threshold, dimension floors, pass schedule, objection ledger verdicts, implementation checklist, proof gates, and completion state. | Marked the review plan and completion file done before the later API/runtime review reopened it. | Reopened by Pass 8. | Pass 8 API/runtime/docs hard-cut review |
| 8. API/runtime/docs hard-cut review | complete | Added live-source evidence for schema predicates, static helpers, opinionated block/list helpers, public transaction helper leakage, React callback naming, duplicated provider/editable props, hook DX, and docs pages. | Dropped score to `0.89`; added hard-cut decisions for schema reads, core formatting helpers, `withTransaction`, callback contracts, provider/editable props, command docs, bundled-source docs, and normalizing detail recovery. | Need closure pass to reconcile final gates and user-review handoff. | Pass 9 closure refresh |
| 9. Closure refresh and final handoff | complete | Resolved `projectionStore` as runtime-owned/internal, refreshed score to `0.93`, reconciled final gates, and added final user-review handoff. | Marked the reopened review plan complete and ready for execution planning. | None. | User review or later execution lane |

## Pass 4 Checkpoint

- Phase completed: Slate maintainer objection ledger.
- Files changed:
  `docs/plans/2026-04-29-slate-v2-docs-maintainer-reorg-review-plan.md`,
  `tmp/completion-check.md`, and `tmp/continue.md`.
- Claims verified against source: legacy `Transforms` nav, current v2
  repeated-warning lines, current v2 proof-map nav, source-exposed primitive
  editor write methods, write-boundary tests, style guidance, and compiled
  Slate docs research.
- Commands run:
  `sed` reads over the skill, active plan, completion file, continuation file,
  style docs, Slate research docs, legacy Slate docs, and current Slate v2
  docs; cwd-stable `rg` over current Slate v2 docs for repeated warning and
  nav smells.
- Stale terms remaining: current `../slate-v2/docs` still contains
  `Editor Methods`, `Docs Proof Map`, and repeated `editor.update` warning
  prose because this lane is review-only.
- Rejected tactics: local sentence patching, deleting primitive write method
  docs, keeping the proof map in public Summary, renaming public docs to
  Transactions, and adding a new public Architecture page.
- Next owner: Pass 5 ecosystem maintainer pass.
- Completion status: pending.

## Pass 5 Checkpoint

- Phase completed: Ecosystem maintainer pass.
- Files changed:
  `docs/plans/2026-04-29-slate-v2-docs-maintainer-reorg-review-plan.md`,
  `tmp/completion-check.md`, and `tmp/continue.md`.
- Claims verified against source: extension `state`/`tx` docs, raw extension
  slots, collaboration commit/operation replay docs, adapter ownership docs,
  local runtime id docs, proof-map rows, and migration-backbone contract tests.
- Commands run:
  `sed` and `nl -ba` reads over the active plan, slate-review skill,
  planning-with-files skill, memory registry, current Slate v2 plugin docs,
  collaboration docs, docs proof map, and migration-backbone tests; targeted
  `rg` over plugin/collab/proof-map/docs surfaces.
- Stale terms remaining: current `../slate-v2/docs` still contains the
  user-reported docs IA/prose smells because this lane is review-only.
- Rejected tactics: current-version Plate adapter proof, current-version
  slate-yjs recipe, direct `editor.api` / `editor.tf` compatibility, and raw
  Slate provider/CRDT documentation.
- Next owner: Pass 6 revision pass.
- Completion status: pending.

## Pass 6 Checkpoint

- Phase completed: Revision pass.
- Files changed:
  `docs/plans/2026-04-29-slate-v2-docs-maintainer-reorg-review-plan.md`,
  `tmp/completion-check.md`, and `tmp/continue.md`.
- Claims verified against source: active plan, slate-review skill completion
  rules, completion-check state, continuation prompt, and repo memory rule that
  pending means runnable work remains.
- Commands run:
  `sed` over the active plan, slate-review skill, completion file, and
  continuation file; targeted `rg` over memory registry for completion-check
  semantics.
- Stale terms remaining: current `../slate-v2/docs` still contains the
  user-reported docs IA/prose smells because this lane is review-only.
- Rejected tactics: new API invention, new public architecture page, current
  adapter support promises, and sentence-by-sentence warning patching.
- Next owner: Pass 7 closure score and final gates.
- Completion status: pending.

## Pass 7 Checkpoint

- Phase completed: Closure score and final gates.
- Files changed:
  `docs/plans/2026-04-29-slate-v2-docs-maintainer-reorg-review-plan.md`,
  `tmp/completion-check.md`, and `tmp/continue.md`.
- Claims verified against source: active plan score, dimension floors,
  pass-state ledger, objection ledger verdicts, implementation checklist, final
  gates, slate-review completion rules, and completion-check state.
- Commands run:
  `sed` over the active plan, slate-review skill, completion file, and
  continuation file; `rg` over active plan and completion file for pending,
  unresolved, and final-gate terms.
- Stale terms remaining: current `../slate-v2/docs` still contains the
  user-reported docs IA/prose smells because this lane is review-only; the plan
  is ready for a later execution lane.
- Rejected tactics: marking done before the closure pass, executing docs edits
  from the review skill, and weakening the gate to hide the pending state.
- Next owner: user review or later execution lane.
- Completion status: done at that time; reopened by Pass 8.

## Pass 8 API / Runtime / Docs Hard-Cut Review

Verdict: hard cut the confusing public surfaces. Do not solve this by adding
more docs caveats.

### Read Surface Rule

Slate should have four read layers, not a pile of equivalent-looking methods:

| Layer | Keep? | Normal use |
| --- | --- | --- |
| Pure data helpers: `Node.*`, `Element.*`, `Text.*`, `Path.*`, `Point.*`, `Range.*` | keep | Pure structural utilities. They do not read editor runtime state. |
| Coherent live reads: `editor.read(state => ...)` | keep | Normal imperative read boundary. |
| Transaction reads/writes: `editor.update(tx => ...)` | keep | Normal command boundary. `tx` includes read helpers so commands do not juggle `api` and `tf`. |
| Static `Editor.*` algorithms | internal only | Compatibility baggage. Public editor-state reads belong on `state` / `tx`. |
| Instance aliases like `editor.start`, `editor.node`, `editor.isInline` | cut from normal public API | They create a second object-method read surface and make stale reads too easy. |

This means:

```ts
editor.read(state => state.selection.get())
editor.read(state => state.schema.isInline(element))

editor.update(tx => {
  const point = tx.points.start([])
  tx.selection.select(point)
})
```

No-compat target: public docs do not teach `Editor.start(editor, [])` at all.
Internal runtime code can keep internal query helpers, but those helpers are
not package API.

### Schema Predicates

Hard cut these from the normal `editor` instance surface:

- `editor.isInline(element)`
- `editor.isVoid(element)`
- `editor.markableVoid(element)`
- `editor.isSelectable(element)`
- `editor.isElementReadOnly(element)`

Canonical shape:

```ts
editor.read(state => state.schema.isInline(element))
editor.update(tx => tx.schema.isVoid(element))
```

Keep schema definition on `editor.schema`:

```ts
editor.schema.define({
  type: 'mention',
  inline: true,
  void: 'markable-inline',
})
```

Reason: configuring schema is editor-level setup; reading schema policy during
a command is state/transaction-level. The current instance predicates make it
look like every editor object method is equally safe everywhere.

### Public Namespaces

Keep `Element.*`, `Text.*`, `Node.*`, `Path.*`, `Point.*`, and `Range.*`.
Moving those to editor state would be worse. They are pure data functions, not
runtime state reads.

Cut public `Editor.*` editor-state query helpers:

- `Editor.start(editor, at)`
- `Editor.end(editor, at)`
- `Editor.node(editor, at)`
- `Editor.nodes(editor, options)`
- `Editor.marks(editor)`
- any similar helper that needs an editor argument to read state

These can survive as internal implementation utilities if needed, but the
package API should route users through `editor.read(state => ...)` and
`editor.update(tx => ...)`.

Best docs rule:

- app command docs use `editor.read` / `editor.update`
- API reference documents `state.*` and `tx.*`, not public `Editor.*` queries
- rendered React code uses hooks
- pure node/path/range work uses pure namespaces

### Editor Object

The public `editor` object should be lifecycle plus coherent boundaries:

```ts
editor.read(fn)
editor.update(fn, options?)
editor.subscribe(listener)
editor.dispose()
```

Do not add random query or command clutter back onto the instance:

```ts
editor.start(at)
editor.node(at)
editor.isVoid(element)
editor.toggleList()
editor.withTransaction(fn)
editor.applyOperations(ops)
```

Remote operation replay should use the same transaction boundary:

```ts
editor.update(tx => {
  tx.operations.replay(remoteOps, { source: 'remote' })
})
```

This keeps collaboration/backbone support without reopening a public
low-level write escape hatch.

### Opinionated Core Helpers

`toggleList` in raw Slate core is wrong. Same for `setBlock`,
`toggleBlock`, and `toggleAlignment`.

Hard cut from `packages/slate` public core:

- `Editor.setBlock`
- `Editor.toggleBlock`
- `Editor.toggleAlignment`
- `Editor.toggleList`
- instance mirrors for those methods
- transaction registry entries that expose them from raw core

Raw Slate can keep generic primitives:

- set node properties
- wrap / unwrap nodes
- insert / remove / split / merge nodes
- add / remove / toggle marks
- select / move selection
- replay operations through `tx.operations.replay(...)`

Lists, headings, alignment, and product formatting belong in examples,
extensions, or Plate. Core should not ship a baked-in `DEFAULT_LIST_TYPES =
['numbered-list', 'bulleted-list']`.

### `withTransaction`

Hard cut `withTransaction` from the public surface.

Public code should use:

```ts
editor.update(tx => {
  tx.marks.toggle('bold')
})
```

If the runtime still needs a helper, rename it to an internal function such as
`runTransaction` and stop exporting it through public barrels. Tests that prove
runtime internals can import from an internal test helper path. App, extension,
and docs code should not see `withTransaction`.

### Extension Namespaces

Extensions should add typed `state` and `tx` namespaces, not mutate the editor
instance:

```ts
defineExtension({
  key: 'list',
  state: {
    isActive(state) {},
  },
  tx: {
    toggle(tx, options) {},
  },
})
```

Usage:

```ts
editor.update(tx => {
  tx.list.toggle({ type: 'bulleted-list' })
})
```

Raw Slate ships no `list` namespace. Plate can ship that. The backbone is
extensible without making raw core opinionated.

### React Callback Contract

The current docs/API direction is overcorrected. If `onChange` exists, it
should mean "the editor changed", not "only the document children changed".

Use this public React contract:

```ts
<Slate
  editor={editor}
  initialValue={initialValue}
  onChange={(value, change) => {
    if (change.valueChanged) {
      save(value)
    }
  }}
  onValueChange={(value, change) => {
    save(value)
  }}
  onSelectionChange={(selection, change) => {
    syncToolbar(selection)
  }}
/>
```

Rules:

- `onChange(value, change)` fires for every committed editor change, including
  selection-only and marks-only changes.
- `onValueChange(value, change)` fires only when document children change.
- `onSelectionChange(selection, change)` fires only when model selection
  changes.
- `change` includes `commit`, `snapshot`, `operations`, `valueChanged`,
  `selectionChanged`, `marksChanged`, and `tags`.
- Cut public `<Slate onCommit>`. Commit-level consumers should use
  `editor.subscribe(...)` or a named advanced hook, not a second React callback
  that competes with `onChange`.

This is closest to Slate DX and clearer than a low-level `onCommit` prop.

### Slate vs Editable Props

Provider owns editor-level source inputs. Editable owns DOM mount/render/event
props. Projection storage is runtime plumbing, not normal public API. Do not
expose the same projection plumbing at both levels.

`<Slate>` public props:

- `editor`
- `initialValue`
- `children`
- `onChange`
- `onValueChange`
- `onSelectionChange`
- `decorationSources`
- `annotationStores`

Cut from public `<Slate>`:

- `projectionStore`

If tests or internal integrations need projection injection, use an internal or
ugly unsafe prop that docs do not teach.

`<Editable>` public props:

- `renderElement`
- `renderVoid`
- `renderLeaf`
- `renderText`
- `renderSegment`
- `placeholder`
- `readOnly`
- `onKeyDown`
- `onDOMBeforeInput`
- `scrollSelectionIntoView`
- `as`
- `disableDefaultStyles`
- `largeDocument` if this stays as an explicit mount strategy

Cut from normal public `<Editable>`:

- `annotationStores`
- `decorationSources`
- `projectionStore`
- `editor`
- `zeroWidth`
- `isInline`
- `inputRules`

`isInline` is schema, not an Editable render prop. `inputRules` is
product/plugin behavior; raw Slate React should provide the editor and DOM
event contracts, while Plate or extensions own opinionated input rules.

### Hook DX

Add a normal app hook so users do not write this:

```ts
useEditorSelector(editor => {
  return editor.read(state => state.marks.get()?.bold === true)
})
```

Preferred API:

```ts
const isBold = useEditorState(state => state.marks.get()?.bold === true)
```

Options shape:

```ts
useEditorState(selector, {
  deps: [query],
  equalityFn: Object.is,
  shouldUpdate: change => change.marksChanged,
})
```

Do not use a positional trailing `deps` array. It looks familiar, but it gets
messy once equality, deferred updates, and commit filtering exist.

Render behavior:

- the hook subscribes to editor commits
- it runs the selector inside `editor.read`
- it re-renders only when the selected result changes by `equalityFn`
- `shouldUpdate` narrows which commits recompute
- hot node/text paths still use target-scoped hooks like `useNodeSelector` and
  `useElementSelected`

Keep `useEditorSelector` as the low-level escape hatch. Teach `useEditorState`
in normal docs.

### Docs Cuts And Rewrites

Remove:

- `docs/walkthroughs/08-using-the-bundled-source.md`
- the `Summary.md` entry for that page

Rewrite:

- `docs/walkthroughs/05-executing-commands.md`

The commands walkthrough should teach extracted commands with the current
read/update model, not the legacy `CustomEditor` object style as the main path.
It should stay progressive like legacy Slate, but the code should look like:

```ts
export const isBoldActive = (editor: Editor) =>
  editor.read(state => state.marks.get()?.bold === true)

export const toggleBold = (editor: Editor) => {
  editor.update(tx => {
    tx.marks.toggle('bold')
  })
}
```

Then the extension/plugin docs can show how product layers register richer
commands. Raw Slate docs should not imply every app should mutate the editor
object with a custom command namespace.

### Normalizing Docs Detail Recovery

Recover useful detail from legacy `docs/concepts/11-normalizing.md`, but only
when it improves the current model:

- explain custom constraints with extension normalizers
- show the multi-pass model with a concrete invalid tree and two repairs
- explain why a normalizer returns after applying one repair
- keep the empty-children built-in constraint and why it runs early
- keep the incorrect-fix / infinite-loop warning
- keep grouped repairs / without-normalizing guidance under the current
  transaction model

Do not recover:

- old `Transforms.*` examples as the main path
- overriding `editor.normalizeNode` as the primary extension story
- opinionated list examples inside raw core docs
- migration-note language

### Pass 8 Objection Ledger Additions

| Change | Strongest objection | Answer | Evidence | Verdict |
| --- | --- | --- | --- | --- |
| Cut instance schema predicates. | "Slate always had `editor.isVoid`; this makes extension code noisier." | Keep schema setup on `editor.schema`, but reads happen through `state.schema` / `tx.schema`. This removes a mutable-looking instance method family while preserving concise command code. | Current instance methods are in `../slate-v2/packages/slate/src/interfaces/editor.ts:237-282`; state schema already exists at `../slate-v2/packages/slate/src/interfaces/editor.ts:179-188`. | keep |
| Cut public `Editor.*` editor-state queries. | "This drops a familiar Slate namespace." | Compatibility is not the goal. Pure namespaces stay public; editor-state reads move to `state.*` / `tx.*`; internal runtime helpers can exist without being exported. | Docs currently teach `Editor.start` / `Editor.end` in `../slate-v2/docs/api/transforms.md:104-105`; public static query helpers are listed throughout `../slate-v2/docs/api/nodes/editor.md:101-234`. | keep |
| Cut `toggleList` and block-format helpers from core. | "Users need lists and headings." | They need primitives. Product formatting policy belongs in extensions/examples/Plate, not raw core. | `DEFAULT_LIST_TYPES` and `toggleList` live in `../slate-v2/packages/slate/src/editor/block-format.ts:6-162`. | keep |
| Replace public `onCommit` with richer `onChange` context plus granular callbacks. | "Commit is the real runtime unit." | Yes, and advanced subscribers can use `editor.subscribe`. React app props should be Slate-friendly and ergonomic. | Current `<Slate>` only calls `onChange(snapshot.children)` when `commit?.childrenChanged` in `../slate-v2/packages/slate-react/src/components/slate.tsx:104-110`. | keep |
| Cut duplicate projection props from `Editable`. | "Standalone `EditableTextBlocks` may need them." | Make that an internal/unsafe component contract. Public React API should have one provider owner for editor-level stores. | Duplicate props appear in `SlateProps` at `../slate-v2/packages/slate-react/src/components/slate.tsx:37-45` and `EditableTextBlocksProps` at `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:252-282`. | keep |
| Cut `inputRules` from raw `Editable`. | "Input rules are convenient." | Convenience here is product policy. Plate/extensions can own it without bloating raw Slate React. | `EditableDOMRootProps` exposes `inputRules` at `../slate-v2/packages/slate-react/src/components/editable.tsx:81-94`. | keep |
| Move operation replay under `tx.operations.replay`. | "Collaboration adapters need a direct replay entrypoint." | They need a deterministic entrypoint, not an editor-instance write escape hatch. `editor.update(tx => tx.operations.replay(...))` preserves the boundary and still supports adapters. | Current docs and source expose `applyOperations`; previous plan already treats replay as special, but no-compat cleanup should not leave it as a public instance writer. | keep |

### Pass 8 Gates

```bash
cd ../slate-v2 && rg -n 'toggleList|toggleBlock|toggleAlignment|setBlock|withTransaction' packages/slate/src docs --glob '!docs/general/changelog.md'
```

```bash
cd ../slate-v2 && rg -n 'Editor\\.(start|end|node|nodes|marks)|editor\\.(isInline|isVoid|markableVoid|isSelectable|isElementReadOnly|start|end|node|nodes|marks|applyOperations)' docs packages/slate/src/interfaces packages/slate/test
```

```bash
cd ../slate-v2 && rg -n 'onCommit|onValueChange|onSelectionChange|onChange' packages/slate-react/src/components/slate.tsx docs/libraries/slate-react docs/walkthroughs
```

```bash
cd ../slate-v2 && rg -n 'annotationStores|decorationSources|projectionStore|inputRules|isInline|zeroWidth' packages/slate-react/src/components docs/libraries/slate-react
```

The first two gates are fail-on-output for public docs and public interfaces
after implementation, with internal implementation exceptions explicitly
listed in the execution plan. The third gate must prove the final callback
contract. The fourth gate must prove provider/editable prop ownership.

## Pass 8 Checkpoint

- Phase completed: API/runtime/docs hard-cut review.
- Files changed:
  `docs/plans/2026-04-29-slate-v2-docs-maintainer-reorg-review-plan.md`,
  `tmp/completion-check.md`, and `tmp/continue.md`.
- Claims verified against source: instance schema predicates and aliases,
  static `Editor.*` helpers, opinionated `block-format` helpers,
  `withTransaction`, `<Slate>` callback behavior, duplicated projection props,
  `Editable` public props, current hook shape, commands walkthrough,
  bundled-source walkthrough, current normalizing docs, and legacy normalizing
  docs.
- Commands run:
  `sed` over the active plan, slate-review skill, planning-with-files skill,
  completion file, continuation prompt, current/legacy docs, and relevant live
  source snippets; targeted `rg` over `../slate-v2/packages/slate/src`,
  `../slate-v2/packages/slate-react/src`, and `../slate-v2/docs`; `bun run
  completion-check`.
- Stale terms remaining: current `../slate-v2` still contains the hard-cut
  surfaces because this lane is review-only. At this checkpoint,
  `projectionStore` ownership was the only remaining closure decision; Pass 9
  resolves it as runtime-owned/internal.
- Rejected tactics: moving pure `Element` / `Node` / `Path` / `Range` helpers
  into editor state, deleting static `Editor.*`, keeping product list helpers
  in core, retaining public `onCommit`, and documenting duplicate projection
  props at both provider and editable levels.
- Next owner: Pass 9 closure refresh and final user-review handoff.
- Completion status: pending. `bun run completion-check` fails intentionally
  while the status is pending.

## Pass 9 Checkpoint

- Phase completed: Closure refresh and final handoff.
- Files changed:
  `docs/plans/2026-04-29-slate-v2-docs-maintainer-reorg-review-plan.md`,
  `tmp/completion-check.md`, and `tmp/continue.md`.
- Claims verified against source: Pass 8 accepted decisions, pass-state ledger,
  final gates, score threshold, callback contract target, provider/editable
  prop ownership target, and the remaining `projectionStore` decision.
- Commands run:
  `sed` over the active plan, completion file, continuation prompt, and
  relevant closure sections; targeted plan grep for Pass 8/9 hard-cut terms;
  `bun run completion-check`.
- Stale terms remaining: current `../slate-v2` still contains the hard-cut
  surfaces because this lane is review-only. The plan itself has no unresolved
  public API maybe language.
- Rejected tactics: leaving `projectionStore` as a normal public prop,
  widening this review pass into implementation, and setting `blocked` when a
  closure pass was runnable.
- Next owner: user review or later execution lane.
- Completion status: done.

## No-Compat Editor Namespace Amendment

User decision: compatibility does not matter for this unpublished rewrite.
Therefore the plan should take the cleaner API, not the Slate-familiar
compromise.

Accepted:

- no public `Editor.*` editor-state query namespace
- no public `editor.*` query aliases
- no public `editor.applyOperations`
- public pure namespaces stay: `Node`, `Element`, `Text`, `Path`, `Point`,
  `Range`, and `Operation`
- public coherent reads go through `editor.read(state => ...)`
- public writes and command reads go through `editor.update(tx => ...)`
- extension authors add typed `state` / `tx` namespaces, not editor instance
  methods

Rejected:

- keeping `Editor.start` / `Editor.node` for migration familiarity
- reintroducing `editor.start` / `editor.node` as convenience aliases
- adding an `editor.refs` public proposal in this plan

Completion status remains done because this amendment removes a compatibility
compromise and tightens the already-accepted hard-cut direction.

## Execution Phase 1 Checkpoint

- Phase completed: Nav and proof visibility.
- Files changed:
  `../slate-v2/docs/Summary.md`,
  `../slate-v2/docs/general/contributing.md`,
  `docs/plans/2026-04-29-slate-v2-docs-maintainer-reorg-review-plan.md`,
  `tmp/completion-check.md`, and `tmp/continue.md`.
- Claims verified against source: public Summary uses `Transforms` for both
  concept and API pages; public Summary no longer lists `Docs Proof Map`;
  contributor docs link the proof map.
- Commands run:
  `rg -n 'Docs Proof Map|Editor Methods' docs/Summary.md`;
  `rg -n 'docs-proof-map|Docs Proof Map' docs/general/contributing.md docs/general/docs-proof-map.md`;
  focused `sed` reads over the touched docs.
- Stale terms remaining: later phases still need the write-model page, API
  reference, command docs, no-compat API cuts, React prop/callback cuts, and
  hook DX.
- Rejected tactics: deleting the proof-map page and adding proof-map back to
  public Summary.
- Next owner: Execution Phase 2, write-model owner page.
- Completion status: pending.

## Execution Phase 2 Checkpoint

- Phase completed: Write-model owner page.
- Files changed:
  `../slate-v2/docs/concepts/04-transforms.md`,
  `docs/plans/2026-04-29-slate-v2-docs-maintainer-reorg-review-plan.md`,
  `tmp/completion-check.md`, and `tmp/continue.md`.
- Claims verified against source: the concept page teaches `editor.update`,
  `tx.nodes`, `tx.text`, `tx.selection`, `tx.marks`, and `tx.operations`;
  operation replay is documented as `tx.operations.replay(...)`; stale public
  paths like `Editor.*`, `withTransaction`, and `editor.applyOperations` are
  absent from the page.
- Commands run:
  `rg -n 'withTransaction|applyOperations|Editor\\.|editor\\.applyOperations|Inside .*editor\\.update|bridge layer|normal application code|primitive .*reference material' docs/concepts/04-transforms.md`;
  `rg -n 'editor\\.update|tx\\.nodes|tx\\.text|tx\\.selection|tx\\.marks|tx\\.operations' docs/concepts/04-transforms.md`;
  focused `sed` read over the page.
- Stale terms remaining: `docs/api/transforms.md`,
  `docs/api/nodes/editor.md`, command walkthroughs, core APIs, React props,
  and hook docs still need later phases.
- Rejected tactics: keeping `editor.applyOperations` as a concept-page escape
  hatch and teaching `Editor.*` query helpers for familiarity.
- Next owner: Execution Phase 3, transaction API reference.
- Completion status: pending.

## Execution Phase 3 Checkpoint

- Phase completed: Transaction API reference.
- Files changed:
  `../slate-v2/docs/api/transforms.md`,
  `docs/plans/2026-04-29-slate-v2-docs-maintainer-reorg-review-plan.md`,
  `tmp/completion-check.md`, and `tmp/continue.md`.
- Claims verified against source: the API page is a terse `tx` reference;
  it documents `tx.nodes`, `tx.text`, `tx.selection`, `tx.marks`, and
  `tx.operations.replay(...)`; stale public paths like `Editor.*`,
  `withTransaction`, and `editor.applyOperations` are absent.
- Commands run:
  `rg -n 'applyOperations|Editor\\.|editor\\.applyOperations|withTransaction|normal application code|bridge layer|primitive .*reference material' docs/api/transforms.md`;
  `rg -n 'tx\\.nodes|tx\\.text|tx\\.selection|tx\\.marks|tx\\.operations|operations\\.replay' docs/api/transforms.md`;
  focused `sed` read over the page.
- Stale terms remaining: `docs/api/nodes/editor.md`, command walkthroughs,
  core APIs, React props, and hook docs still need later phases.
- Rejected tactics: keeping operation replay as `editor.applyOperations` and
  documenting primitive bridge helpers as an advanced public reference section.
- Next owner: Execution Phase 4, Editor API triage.
- Completion status: pending.

## Execution Phase 4 Checkpoint

- Phase completed: Editor API triage.
- Files changed:
  `../slate-v2/docs/api/nodes/editor.md`,
  `docs/plans/2026-04-29-slate-v2-docs-maintainer-reorg-review-plan.md`,
  `tmp/completion-check.md`, and `tmp/continue.md`.
- Claims verified against source: the editor API page documents a small public
  boundary object, `editor.read`, `editor.update`, `editor.subscribe`,
  `editor.extend`, `state.*`, and `tx.*`; stale public paths like public
  `Editor.*` queries, instance query aliases, `withTransaction`,
  `editor.applyOperations`, and opinionated block/list helpers are absent.
- Commands run:
  `rg -n 'Editor\\.(start|end|node|nodes|marks)|editor\\.(start|end|node|nodes|marks|isInline|isVoid|markableVoid|isSelectable|isElementReadOnly|applyOperations)|withTransaction|toggleList|toggleBlock|toggleAlignment|setBlock|normal application code|bridge layer|primitive .*reference material' docs/api/nodes/editor.md`;
  `rg -n 'editor\\.read|editor\\.update|editor\\.subscribe|editor\\.extend|state\\.|tx\\.' docs/api/nodes/editor.md`;
  focused `sed` read over the page.
- Stale terms remaining: command walkthroughs, bundled-source docs, core APIs,
  React props, and hook docs still need later phases.
- Rejected tactics: keeping the old static-method reference table and moving
  pure `Node` / `Path` / `Range` helpers into editor state.
- Next owner: Execution Phase 5, commands/walkthrough polish.
- Completion status: pending.

## Execution Phase 5 Checkpoint

- Phase completed: Commands/walkthrough polish.
- Files changed:
  `../slate-v2/docs/walkthroughs/05-executing-commands.md`,
  `../slate-v2/docs/walkthroughs/08-using-the-bundled-source.md`,
  `docs/plans/2026-04-29-slate-v2-docs-maintainer-reorg-review-plan.md`,
  `tmp/completion-check.md`, and `tmp/continue.md`.
- Claims verified against source: commands walkthrough uses plain functions
  with `editor.read(...)` and `editor.update(...)`; it does not teach
  `CustomEditor`, public `Editor.*`, `Transforms.*`, `withTransaction`, or
  `editor.applyOperations`; bundled-source walkthrough has no docs references
  and is removed.
- Commands run:
  `rg -n 'CustomEditor|Editor\\.|Transforms\\.|editor\\.applyOperations|withTransaction' docs/walkthroughs/05-executing-commands.md`;
  `rg -n 'using-the-bundled-source|bundled source|Package Artifacts|08-using' docs/Summary.md docs/walkthroughs`;
  `rg -n 'editor\\.read|editor\\.update|tx\\.marks|tx\\.nodes|tx\\.selection|tx\\.text|tx\\.operations|state\\.nodes|state\\.marks' docs/walkthroughs/05-executing-commands.md`;
  focused `sed` read over the page.
- Stale terms remaining: core public API, React props/callbacks, hook docs, and
  final gates still need later phases.
- Rejected tactics: mutating the editor object with a `CustomEditor` namespace,
  keeping package-artifact docs, and adding product commands to raw Slate.
- Next owner: Execution Phase 6, API hard-cut implementation.
- Completion status: pending.

## Execution Phase 6 Checkpoint

- Phase completed: API hard-cut implementation.
- Files changed:
  `../slate-v2/packages/slate/src/interfaces/editor.ts`,
  `../slate-v2/packages/slate/src/create-editor.ts`,
  `../slate-v2/packages/slate/src/core/public-state.ts`,
  `../slate-v2/packages/slate/src/core/extension-registry.ts`,
  `../slate-v2/packages/slate/src/core/leaf-lifecycle.ts`,
  `../slate-v2/packages/slate/src/core/normalize-node.ts`,
  `../slate-v2/packages/slate/src/editor/**`,
  `../slate-v2/packages/slate/src/transforms-node/**`,
  `../slate-v2/packages/slate/src/transforms-text/**`,
  `../slate-v2/packages/slate/src/utils/**`,
  `../slate-v2/packages/slate/test/**`,
  `../slate-v2/docs/**`,
  `docs/plans/2026-04-29-slate-v2-docs-maintainer-reorg-review-plan.md`,
  `tmp/completion-check.md`, and `tmp/continue.md`.
- Claims verified against source: public `Editor.*` editor-state query helpers
  are absent from the namespace, type surface, and editor barrel; instance
  schema predicates and read aliases are absent from `BaseEditor` and runtime
  editor instances; public `editor.applyOperations` is absent; operation replay
  is available as `tx.operations.replay(...)`; `state.marks.get()` preserves
  the legacy mark-read behavior without restoring public `Editor.marks`.
- Commands run:
  `bun test ./packages/slate/test/public-field-hard-cut-contract.ts`;
  focused hard-cut contract suite over public fields, write boundary,
  state/tx API, schema, extension, migration backbone, collaboration history,
  apply/onChange, surface, and query contracts;
  `bun --filter slate typecheck`;
  `bun test ./packages/slate/test`;
  stale API grep over `packages/slate/src/interfaces`,
  `packages/slate/src/create-editor.ts`, `packages/slate/test`, and `docs`;
  export grep over `packages/slate/src/editor/index.ts` and
  `packages/slate/src/interfaces/editor.ts`.
- Stale terms remaining: Phase 7 still owns raw-core product helpers
  `toggleList`, `setBlock`, `toggleBlock`, `toggleAlignment`, public
  `withTransaction`, and replay escape hatches outside `tx.operations.replay`.
  Later phases still own React props/callbacks and hook DX.
- Rejected tactics: hiding static query helpers only in docs, keeping the
  namespace methods for internal convenience, and reintroducing instance
  aliases to make old fixtures pass.
- Next owner: Execution Phase 7, unopinionated core cleanup.
- Completion status: pending.

## Execution Phase 7 Checkpoint

- Phase completed: unopinionated core cleanup.
- Files changed:
  `../slate-v2/packages/slate/src/create-editor.ts`,
  `../slate-v2/packages/slate/src/core/apply.ts`,
  `../slate-v2/packages/slate/src/core/public-state.ts`,
  `../slate-v2/packages/slate/src/editor/index.ts`,
  `../slate-v2/packages/slate/src/editor/is-editor.ts`,
  `../slate-v2/packages/slate/src/interfaces/editor.ts`,
  `../slate-v2/packages/slate/src/interfaces/transforms/general.ts`,
  `../slate-v2/packages/slate/src/editor/**`,
  `../slate-v2/packages/slate/src/transforms-node/**`,
  `../slate-v2/packages/slate/src/transforms-text/**`,
  `../slate-v2/packages/slate/test/**`, and
  `../slate-v2/docs/general/docs-proof-map.md`.
- Claims verified against source: raw Slate core no longer exposes
  `toggleList`, `setBlock`, `toggleBlock`, or `toggleAlignment`; the block
  formatting module is gone from the core editor barrel; public
  `Editor.withTransaction` is gone; the runtime transaction helper is internal
  as `runEditorTransaction`; operation replay is only under
  `tx.operations.replay(...)`.
- Commands run:
  `bun test ./packages/slate/test/public-field-hard-cut-contract.ts`;
  focused core contracts over transaction, accessors, range refs, target
  runtime, query, write boundary, state/tx API, public field hard cuts, and
  editor methods;
  `bun --filter slate typecheck`;
  `bun test ./packages/slate/test`;
  fail-on-output grep for raw-core product helpers, public transaction helper
  names, public replay escape hatches, stale public `Editor.*` state queries,
  and stale editor instance aliases.
- Stale terms remaining: Phase 8 owns React props/callbacks; Phase 9 owns hook
  DX; Phase 10 owns final docs gates.
- Rejected tactics: keeping product formatting helpers as unpublished
  convenience, keeping public transaction helper naming for tests, and leaving
  public proof docs with the removed replay name.
- Next owner: Execution Phase 8, React public contract cleanup.
- Completion status: pending.

## Execution Phase 8 Checkpoint

- Phase completed: React public contract cleanup.
- Files changed:
  `../slate-v2/packages/slate-react/src/components/slate.tsx`,
  `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`,
  `../slate-v2/packages/slate-react/src/index.ts`,
  `../slate-v2/packages/slate-react/test/**`,
  `../slate-v2/packages/slate-dom/test/**`,
  `../slate-v2/docs/libraries/slate-react/slate.md`,
  `../slate-v2/docs/libraries/slate-react/editable.md`,
  `../slate-v2/docs/walkthroughs/01-installing-slate.md`, and
  `../slate-v2/docs/walkthroughs/06-saving-to-a-database.md`.
- Claims verified against source: `<Slate onChange>` fires for every commit
  with a shared `SlateChange` object; `onValueChange` is document-only;
  `onSelectionChange` is selection-only; public `<Slate onCommit>` and
  public `projectionStore` props are gone; public `Editable` no longer accepts
  editor-level projection, schema, input-rule, zero-width, or `editor` props;
  tests render `Editable` under `Slate`.
- Commands run:
  `bun --filter slate-react typecheck`;
  `bun --filter slate-dom typecheck`;
  focused React callback, projection, large-document, DOM-shape, surface,
  generic, with-react, and slate-dom clipboard/bridge tests;
  `bun test ./packages/slate-react/test/*.tsx ./packages/slate-react/test/*.ts`;
  `bun test ./packages/slate-dom/test/*.ts`;
  public prop/callback greps over `packages/slate-react/src/components`,
  `packages/slate-react/test`, `packages/slate-dom/test`,
  `docs/libraries/slate-react`, and `docs/walkthroughs`.
- Stale terms remaining: one internal `store.projectionStore` composition line
  remains in `Slate` because the provider owns the runtime projection source.
  Phase 9 still owns hook DX. Phase 10 still owns final docs gates.
- Rejected tactics: keeping `Editable editor` as a convenience wrapper,
  leaving saving docs on value-looking `onChange`, keeping `onCommit` as a
  second React prop, and retaining direct `Editable` projection plumbing for
  tests.
- Next owner: Execution Phase 9, hook DX cleanup.
- Completion status: pending.

## Execution Phase 9 Checkpoint

- Phase completed: Hook DX cleanup.
- Files changed:
  `../slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx`,
  `../slate-v2/packages/slate-react/src/index.ts`,
  `../slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`,
  `../slate-v2/docs/libraries/slate-react/hooks.md`, and
  `../slate-v2/docs/concepts/09-rendering.md`.
- Claims verified against source: `useEditorState(selector, options)` runs
  selectors inside `editor.read`; it supports result equality, `deps`,
  `deferred`, and commit-scoped `shouldUpdate`; normal docs use
  `useEditorState` for app-level toolbar reads; `useEditorSelector` remains
  documented as a low-level hook for callers that intentionally need the editor
  object or operation batch.
- Commands run:
  `bun --filter slate-react typecheck`;
  `bun test ./packages/slate-react/test/provider-hooks-contract.tsx`;
  `bun test ./packages/slate-react/test/*.tsx ./packages/slate-react/test/*.ts`;
  hook DX greps over `packages/slate-react/src`, `docs/libraries/slate-react`,
  `docs/concepts/09-rendering.md`, and the provider hook contract tests.
- Stale terms remaining: one `useEditorSelector` example remains in the hooks
  reference as the low-level operation-batch example by design. Phase 10 owns
  final source-ledger, docs style, stale API, callback, and prop-ownership
  gates.
- Rejected tactics: adding a second selector store, asking app code to keep
  writing `editor.read(...)` inside hook selectors, and using a positional deps
  array that cannot grow to equality and commit filtering.
- Next owner: Execution Phase 10, final docs gates.
- Completion status: pending.

## Execution Phase 10 Checkpoint

- Phase completed: Final docs gates.
- Files changed:
  final verification covered the Phase 1-9 code and docs changes in
  `../slate-v2`, plus this plan, `tmp/completion-check.md`, and
  `tmp/continue.md`.
- Claims verified against source: repeated warning prose is gone; public
  Summary no longer exposes `Editor Methods` or `Docs Proof Map`; public docs
  do not teach removed `Editor.*` state queries, mutable editor fields,
  opinionated core helpers, public `withTransaction`, or public
  `editor.applyOperations`; raw extension/collaboration docs still preserve
  the substrate terms (`state`, `tx`, commits, operations, tags,
  `tx.operations.replay`, local runtime ids); React docs expose the final
  `onChange` / `onValueChange` / `onSelectionChange` callback contract;
  `Editable` public docs and type surfaces do not expose provider-owned
  projection, schema, input-rule, zero-width, or `editor` props; hook docs
  teach `useEditorState` for normal app-level reads.
- Commands run:
  `bun lint:fix`;
  `bun --filter slate-react typecheck`;
  `bun --filter slate-dom typecheck`;
  `bun test ./packages/slate-react/test/*.tsx ./packages/slate-react/test/*.ts`;
  `bun test ./packages/slate-dom/test/*.ts`;
  fail-on-output greps for repeated warning prose, public proof-map/editor
  method nav, stale field/method docs, adapter promises, stale public
  `Editor.*`/core helper APIs, stale `Editable` public props, bundled-source
  docs, and changelog/migration voice in touched docs;
  positive gates for callback contract, provider-owned projection sources,
  hook DX, and collaboration/plugin substrate terms.
- Stale terms remaining: none on fail-on-output gates. Positive grep output
  remains where expected: the public callback contract, provider-owned
  decoration/annotation source docs, the low-level `useEditorSelector`
  reference example, and internal `projectionStore` composition inside
  `Slate`.
- Rejected tactics: broad browser/integration sweeps for docs/API surface work,
  treating positive owner-term greps as failures, and marking blocked while
  completion gates were runnable.
- Next owner: none.
- Completion status: done; `bun check` is green.

## Execution Phase 11 Checkpoint

- Phase complete: `bun check` closeout.
- Latest evidence:
  `bun check` in `../slate-v2` passes after fixing `slate-history`
  transaction replay, migrating the stale history fixture into
  `editor.update`, adding the missing `slate/internal` source path for site
  typecheck, and updating site examples to the hard-cut public API.
- Verification:
  `bun --filter slate-history typecheck`;
  `bun test ./packages/slate-history/test/*.ts`;
  `bun typecheck:site`;
  `bun lint:fix`;
  `bun check`.
- Next owner: none.
- Completion status: done.

## Plan Deltas From Review

Added:

- A concrete reorg target for `Summary.md`, `concepts/04-transforms.md`,
  `api/transforms.md`, and `api/nodes/editor.md`.
- A specific decision to remove `Docs Proof Map` from the public table of
  contents while keeping it reachable for maintainers.
- A rejected-alternatives table so this does not devolve into sentence-by-
  sentence cleanup.
- Pass 8 hard-cut decisions for schema reads, static helper classification,
  unopinionated core, public transaction helper visibility, React callbacks,
  provider/editable prop ownership, command docs, bundled-source docs, hook DX,
  and normalizing detail recovery.
- A no-compat amendment that cuts public `Editor.*` query helpers entirely and
  moves operation replay under `tx.operations.replay`.

Dropped:

- The idea that each primitive method entry needs its own "use tx" warning.
- `toggleList`, block/alignment formatting helpers, and public
  `withTransaction` as acceptable raw core surface.
- Public `onCommit` as a normal React prop.
- `inputRules`, `isInline`, and projection store plumbing as normal
  `<Editable>` props.
- Public `projectionStore` as normal `<Slate>` API.
- Public `Editor.*` editor-state query helpers as an acceptable compromise.
- Public `editor.applyOperations` as a replay escape hatch.

Strengthened:

- The docs proof gate should count repeated warning phrases, not just stale API
  names.
- The reorg now has exact line-backed evidence for current docs, legacy docs,
  live source, unit contracts, browser contracts, and solution-doc policy.
- Pressure passes added exact acceptance criteria and rejected local sentence
  patching, public proof-map placement, and new architecture pages.
- Maintainer ledger now has full rows for every major docs organization change:
  objection, evidence, rejected alternative, migration answer, docs/example
  answer, regression proof, ecosystem note, and verdict.
- Ecosystem pass now proves the plan preserves Plate/plugin and slate-yjs/collab
  migration backbone without promising current adapters.
- Revision pass now turns the decisions into an ordered implementation
  checklist with final accepted wording rules and gates.
- Closure pass verified all review gates and marked the plan ready.
- API cleanup now has source-backed gates instead of being left as docs taste.
- Callback docs must distinguish all committed changes, value changes, and
  selection changes with one shared context object.
- React hook docs must teach a shorter app hook that performs `editor.read`
  internally and re-renders by selected result equality.
- API docs must teach `state.*` / `tx.*` for editor-state reads and keep pure
  namespaces for pure data helpers only.

Kept unchanged:

- No Slate v2 implementation change is part of this plan.
- No current-version Plate or slate-yjs adapter support is required.
- No new public architecture page belongs in this plan.
- Pure data namespaces like `Element.*`, `Node.*`, `Path.*`, `Point.*`,
  `Range.*`, and `Text.*` stay as namespaces instead of moving into editor
  state.
- No public `Editor.*` query namespace stays for compatibility.

## Open Questions

None. `projectionStore` is runtime-owned/internal. If an override survives for
tests or deep integrations, it must be visibly unsafe/internal and absent from
normal docs.

## Implementation Phases

These are proposal phases only. Do not execute until the review plan closes and
the user runs an execution lane.

| Phase | Owner | Output | Gate |
| --- | --- | --- | --- |
| 1. Nav and proof visibility | docs IA | Summary label cleanup; proof map unlisted or contributor-linked | Summary grep |
| 2. Write-model owner page | concept docs | `concepts/04-transforms.md` teaches write model once | repeated warning grep |
| 3. Transaction API reference | API docs | `api/transforms.md` is terse exact `tx` reference | source API grep |
| 4. Editor API triage | API docs | `api/nodes/editor.md` reorganized by reader intent; one advanced write note | repeated warning grep |
| 5. Commands/walkthrough polish | walkthrough/concepts | Commands guide reads like legacy Slate, with `editor.read/update` examples | stale API grep |
| 6. API hard-cut implementation | core/API docs | Remove public `Editor.*` editor-state queries, instance schema predicates, instance read aliases, and public `editor.applyOperations`; keep pure namespaces documented by intent | public-surface contract and stale API grep |
| 7. Unopinionated core cleanup | core | Remove `toggleList`, `setBlock`, `toggleBlock`, `toggleAlignment`, public `withTransaction`, and replay escape hatches outside `tx.operations.replay` from raw core public API | source/export grep and package tests |
| 8. React public contract cleanup | slate-react | Restore `onChange` as every committed editor change; add `onValueChange` / `onSelectionChange`; cut public `onCommit`; cut public `projectionStore`; move duplicate projection props out of `Editable` | React typecheck and callback contract tests |
| 9. Hook DX cleanup | slate-react docs/API | Add `useEditorState` for app-level coherent reads; keep `useEditorSelector` as low-level | hook tests and docs grep |
| 10. Final docs gates | review owner | source-ledger, style, stale API, callback, and prop-ownership greps | completion-check |

## Fast Driver Gates

```bash
cd ../slate-v2 && rg -n 'normal application code|bridge layer|Inside .*editor\\.update|primitive .*reference material' docs --glob '!docs/general/changelog.md'
```

```bash
cd ../slate-v2 && rg -n 'Docs Proof Map|Editor Methods' docs/Summary.md
```

```bash
cd ../slate-v2 && rg -n 'Editor\\.addMark\\(|Editor\\.removeMark\\(|editor\\.children|editor\\.selection|editor\\.operations|editor\\.marks|methods\\(' docs --glob '!docs/general/changelog.md'
```

```bash
cd ../slate-v2 && rg -n 'editor\\.api|editor\\.tf|PlatePlugin|withYjs|slate-yjs|Y\\.Doc|yjs' docs/concepts/08-plugins.md docs/walkthroughs/07-enabling-collaborative-editing.md docs/api/transforms.md docs/api/nodes/editor.md
```

```bash
cd ../slate-v2 && rg -n 'state|tx|operations\\.replay|commit|operations|tags|runtime ids are local|does not provide a full multiplayer recipe' docs/concepts/08-plugins.md docs/walkthroughs/07-enabling-collaborative-editing.md docs/general/docs-proof-map.md
```

```bash
cd ../slate-v2 && rg -n 'Editor\\.(start|end|node|nodes|marks)|toggleList|toggleBlock|toggleAlignment|setBlock|withTransaction|editor\\.(isInline|isVoid|markableVoid|isSelectable|isElementReadOnly|start|end|node|nodes|marks|applyOperations)' packages/slate/src/interfaces packages/slate/src/create-editor.ts docs packages/slate/test
```

```bash
cd ../slate-v2 && rg -n 'onCommit|onValueChange|onSelectionChange|onChange' packages/slate-react/src/components/slate.tsx docs/libraries/slate-react docs/walkthroughs
```

```bash
cd ../slate-v2 && rg -n 'annotationStores|decorationSources|projectionStore|inputRules|isInline|zeroWidth' packages/slate-react/src/components/slate.tsx packages/slate-react/src/components/editable-text-blocks.tsx docs/libraries/slate-react
```

## Final User-Review Handoff Outline

Final handoff grouped by surface:

- Core read surface: before `Editor.start`, `Editor.node`, `editor.isVoid`,
  and `editor.start`; after `state.*` / `tx.*` for editor-state reads and pure
  namespaces unchanged.
- Core commands: before `toggleList` / block helpers in raw Slate; after only
  unopinionated primitives in core, product commands in extensions/Plate.
- Transaction boundary: before public `withTransaction`; after public
  `editor.update`, `tx.operations.replay`, and private runtime transaction
  helpers if needed.
- React callbacks: before value-only-looking `onChange` plus `onCommit`; after
  `onChange(value, change)`, `onValueChange`, `onSelectionChange`, and
  `editor.subscribe` for commit-level consumers.
- React props: before duplicated projection props on `Slate` and `Editable`;
  after provider-owned decoration/annotation sources, runtime-owned projection
  store, and mount/render/event-only `Editable`.
- Hooks: before app examples nest `editor.read` inside `useEditorSelector`;
  after `useEditorState` handles read/equality/filtering internally.
- Docs: remove bundled-source walkthrough, rewrite commands walkthrough,
  recover useful normalizing details, and keep docs current-state only.

## Final Completion Gates

- Total score `>= 0.92`.
- No dimension below `0.85`.
- Pass schedule complete.
- Objection ledger verdicts are all `keep` or resolved.
- Pass 8 hard-cut decisions have implementation gates and no "maybe" public
  API language.
- The plan gives a concrete user-doc IA target, not just prose preferences.
- The plan keeps Slate-close terminology without preserving bad legacy
  footguns.
- The plan keeps proof artifacts findable without making them public learning
  pages.
- `tmp/completion-check.md` says `done`.
