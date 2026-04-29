# Slate v2 Docs Maintainer Reorg Review Plan

Date: 2026-04-29
Status: done
Review mode: slate-review
Current pass: complete

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

## Confidence Scorecard

Current score: `0.92`

| Dimension | Weight | Score | Evidence |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.20 | 0.92 | Revision pass keeps React docs out of scope except preserving target-scoped render guidance and browser proof mapping. Existing docs already say rendered document nodes should avoid broad editor subscriptions in `../slate-v2/docs/concepts/09-rendering.md:147` and prefer target-scoped hooks at `:177`. |
| Slate-close unopinionated DX | 0.20 | 0.92 | Revision pass resolves the implementation checklist around legacy Slate IA terms: `Transforms` in Summary, one Concepts owner page, one API reference page, and terse primitive method entries. Current smells are measurable at `../slate-v2/docs/Summary.md:21`, `:34`, `:74`, and `../slate-v2/docs/api/nodes/editor.md:264`, `:314`, `:517-532`. |
| Plate and slate-yjs migration-backbone shape | 0.15 | 0.92 | Ecosystem pass verifies substrate-only plugin/collab docs: extension `state`/`tx` in `../slate-v2/docs/concepts/08-plugins.md:38-44` and `:76-131`; collab commits/operations/replay/ownership in `../slate-v2/docs/walkthroughs/07-enabling-collaborative-editing.md:53-70`, `:96-120`, and `:137-199`; migration-backbone tests in `../slate-v2/packages/slate/test/migration-backbone-contract.ts:33-195`. |
| Regression-proof testing strategy | 0.20 | 0.92 | Revision pass consolidates stale-prose, nav, source-ledger, adapter-promise, and substrate-presence gates. Proof-map rows cover extension namespaces and collaboration replay at `../slate-v2/docs/general/docs-proof-map.md:13`, `:18`, and `:19`; browser proof families remain named in `../slate-v2/packages/slate-browser/src/core/first-party-browser-contracts.ts:24-130`. |
| Research evidence completeness | 0.15 | 0.91 | Current plan has compiled Slate docs research, live legacy docs, live v2 docs, source, unit contracts, solution docs, browser contract evidence, ecosystem substrate evidence, and a final implementation checklist. The docs-only pass still does not need decorative Lexical/ProseMirror/Tiptap refresh. |
| shadcn-style composability and hook/component minimalism | 0.10 | 0.92 | Revision pass rejects new public architecture pages, adapter-shaped editor namespaces, and repeated per-method warnings. The final checklist keeps one owner page, one terse API reference, and one advanced method section. |

Score threshold is met and the closure gates pass. The review plan is ready for
user review before execution.

## Pass 2 Evidence Refresh

Current docs evidence:

- `../slate-v2/docs/api/nodes/editor.md:264` and `:314` repeat
  transaction-path warnings inside individual mark methods.
- `../slate-v2/docs/api/nodes/editor.md:517-532` repeats
  `Inside editor.update(...)` across primitive insert methods.
- `../slate-v2/docs/api/transforms.md:1-8` already has the right page-level
  owner statement for the normal write surface.
- `../slate-v2/docs/api/transforms.md:34-143` already lists `tx.nodes`,
  `tx.selection`, `tx.text`, and `editor.applyOperations` as distinct families.
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
- `../slate-v2/packages/slate/src/interfaces/editor.ts:208-234` exposes
  `applyOperations`, `read`, `getSelection`, and `getSnapshot` on `BaseEditor`.
- `../slate-v2/packages/slate/src/interfaces/editor.ts:814-829` exposes
  `Editor.addMark` and `Editor.applyOperations` as real API reference material.
- `../slate-v2/packages/slate/src/interfaces/editor.ts:1394-1403` exposes
  `Editor.subscribe` and `Editor.update`.

Contract evidence:

- `../slate-v2/packages/slate/test/read-update-contract.ts:11-48` proves the
  coherent read/update boundary and commit tags.
- `../slate-v2/packages/slate/test/read-update-contract.ts:50-129` proves
  writes and replay are rejected inside plain reads.
- `../slate-v2/packages/slate/test/write-boundary-contract.ts:27-55` proves
  primitive writes outside `editor.update` are rejected.
- `../slate-v2/packages/slate/test/write-boundary-contract.ts:57-77` proves
  `applyOperations` remains the explicit replay writer.
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
- `concepts/04-transforms.md` owns the write model and mentions primitive
  editor write methods once.
- `api/transforms.md` is the terse `tx` reference and includes `tx.marks.*`.
- `api/nodes/editor.md` has one `Advanced editor write methods` section-level
  note.
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
- Exclude historical docs as `--glob '!docs/general/changelog.md'` and
  `--glob '!docs/concepts/xx-migrating.md'`.
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
- Primitive editor write methods exist because commands, history,
  collaboration, tests, and runtime bridges need them.
- Most app code should not call the primitive write methods directly.

It should not become a full API catalog. Keep it narrative and example-led,
like legacy Slate's transforms concept page.

### api/transforms.md

This page should be the exact transaction API reference.

It should list:

- `tx.nodes.*`
- `tx.text.*`
- `tx.selection.*`
- `tx.marks.*`
- `editor.applyOperations(...)` only as operation replay

It can have one top-level note:

> Use transaction methods inside `editor.update(...)` for normal document
> changes. Low-level editor write methods are documented on the Editor page for
> runtime and bridge authors.

Then stop repeating that warning.

### api/nodes/editor.md

Reorganize the page into reader intent:

1. `## Editor`
   - short description
   - snapshot/read/update mental model
2. `## Creating an editor`
   - `createEditor`
3. `## Reading state`
   - snapshot, selection, children, node traversal, marks read helpers
4. `## Schema behavior`
   - inline, void, selectable, markable void, read-only, normalize
5. `## Subscribing to commits`
   - `Editor.subscribe`, `Editor.getLastCommit`
6. `## Advanced editor write methods`
   - one paragraph: these are runtime bridge/command primitives; most app code
     uses `editor.update` + `tx`
   - list `addMark`, `removeMark`, insert/delete methods, `applyOperations`
   - no per-method "normal app code" warning
7. `## Ref methods`
8. `## Normalization methods`

This keeps the API complete without making every method entry carry a sermon.

## Internal Runtime Target

No runtime implementation change is implied by this review.

Docs should describe the runtime with the same boundaries the code already
uses:

- `editor.read` for coherent reads
- `editor.update` for normal writes
- `tx` for transaction helpers
- primitive editor methods for runtime/bridge/command internals
- `applyOperations` for operation replay
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
- remote edits import through `applyOperations`
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
- remote writes enter through explicit `applyOperations`.
- subscribers observe snapshots and commits.
- runtime ids are local projection handles, not persistence identifiers.
- providers, awareness, CRDT merge policy, and remote cursor rendering belong
  to adapters.

Evidence:

- `../slate-v2/docs/walkthroughs/07-enabling-collaborative-editing.md:3-5`
  says Slate does not choose network, CRDT, persistence, or awareness policy.
- `../slate-v2/docs/walkthroughs/07-enabling-collaborative-editing.md:53-70`
  defines operations as replay contract and `applyOperations` as remote import.
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
- Keep `applyOperations`, commits, tags, snapshots, deterministic operations,
  and local runtime ids as the raw contract.
- Keep current-version slate-yjs support out of scope.

### Exact Affected Surfaces

| Surface | Effect |
| --- | --- |
| `docs/concepts/08-plugins.md` | Keep extension substrate language: `state`, `tx`, extension slots, product APIs above raw Slate. |
| `docs/walkthroughs/07-enabling-collaborative-editing.md` | Keep collaboration substrate language: commits, operations, tags, `applyOperations`, runtime ids local, adapter ownership. |
| `docs/general/docs-proof-map.md` | Keep proof rows for extension namespaces, collaboration replay, and local runtime ids findable after moving the page out of public Summary. |

### Ecosystem Gates

```bash
cd ../slate-v2 && rg -n 'editor\\.api|editor\\.tf|PlatePlugin|withYjs|slate-yjs|Y\\.Doc|yjs' docs/concepts/08-plugins.md docs/walkthroughs/07-enabling-collaborative-editing.md docs/api/transforms.md docs/api/nodes/editor.md
```

```bash
cd ../slate-v2 && rg -n 'state|tx|applyOperations|commit|operations|tags|runtime ids are local|does not provide a full multiplayer recipe' docs/concepts/08-plugins.md docs/walkthroughs/07-enabling-collaborative-editing.md docs/general/docs-proof-map.md
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
   - Explain `tx.nodes`, `tx.text`, `tx.selection`, and `tx.marks`.
   - Mention primitive editor write methods once as advanced runtime/bridge
     primitives.
   - Keep the page narrative and example-led, not a method catalog.

4. `docs/api/transforms.md`
   - Keep the title as `# Transforms API`.
   - Make the first paragraph say v2 transforms are transaction helpers used
     inside `editor.update`.
   - Document `tx.nodes.*`, `tx.text.*`, `tx.selection.*`, and `tx.marks.*`.
   - Mention `editor.applyOperations(...)` only as explicit operation replay.
   - Use one top-level note for low-level editor write methods, then stop.

5. `docs/api/nodes/editor.md`
   - Reorder by reader intent: editor overview, creation, reading state,
     schema behavior, subscribing to commits, advanced editor write methods,
     refs, normalization.
   - Put `addMark`, `removeMark`, insert/delete helpers, and
     `applyOperations` under `Advanced editor write methods`.
   - Keep exact signatures.
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
| Ecosystem promise | Substrate only: extension `state` / `tx`, commits, operations, tags, `applyOperations`, local runtime ids. |
| Explicit non-goals | No current Plate adapter, no current slate-yjs recipe, no new architecture page, no scattered warning patches. |

### Revision Gates

```bash
cd ../slate-v2 && rg -n 'normal application code|bridge layer|Inside .*editor\\.update|primitive .*reference material' docs --glob '!docs/general/changelog.md' --glob '!docs/concepts/xx-migrating.md'
```

```bash
cd ../slate-v2 && rg -n 'Docs Proof Map|Editor Methods' docs/Summary.md
```

```bash
cd ../slate-v2 && rg -n 'editor\\.api|editor\\.tf|PlatePlugin|withYjs|slate-yjs|Y\\.Doc|yjs' docs/concepts/08-plugins.md docs/walkthroughs/07-enabling-collaborative-editing.md docs/api/transforms.md docs/api/nodes/editor.md
```

```bash
cd ../slate-v2 && rg -n 'state|tx|applyOperations|commit|operations|tags|runtime ids are local|does not provide a full multiplayer recipe' docs/concepts/08-plugins.md docs/walkthroughs/07-enabling-collaborative-editing.md docs/general/docs-proof-map.md
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
| Move repeated tx/bridge warnings into one write-model owner section. | Raw Slate user, docs reader, app author. | "Do not hide the warning; people will call `Editor.addMark` directly." | The warning stays, but it becomes an ownership rule instead of a sermon repeated under every primitive method. Readers learn the model once, then API entries stay scannable. | Repetition is currently visible in `../slate-v2/docs/api/nodes/editor.md:264`, `:314`, and `:517-532`. Legacy Slate keeps transform entries terse in `../slate/docs/api/transforms.md:39-118`. | Patch each repeated sentence locally. Weaker because the page still teaches by caveat spam. | Users coming from the current docs find the same primitive method entries under `Advanced editor write methods`, with one section note pointing normal writes to `editor.update` and `tx`. | `concepts/04-transforms.md` owns the write model. `api/transforms.md` owns exact `tx` signatures. `api/nodes/editor.md` owns primitive method signatures. | Cwd-stable grep for `normal application code`, `bridge layer`, `Inside .*editor.update`, and `primitive .*reference material` outside the chosen owner note. | No extension/collab API changes. Pass 5 still checks that extension `tx` and collaboration `applyOperations` docs keep their substrate language. | keep |
| Rename `Summary.md` labels from `Editor Methods` back to `Transforms`. | Slate maintainer, returning Slate user, docs reader. | "`Transaction write API` or `Editor Methods` is technically more v2-accurate." | Navigation should speak Slate's stable reader vocabulary. The page itself can explain that v2 transform helpers live on `tx` inside `editor.update`. | Legacy `../slate/docs/Summary.md:17-35` uses `Transforms` under Concepts and API. Current v2 `../slate-v2/docs/Summary.md:21` and `:34` use `Editor Methods`. | Rename everything to `Transactions`. Weaker because it is precise internally but less Slate-close and makes the docs feel like a new editor. | Readers use the same TOC word as legacy Slate, then learn the v2 transaction shape in the first paragraph of the page. | `Summary.md` labels become `Transforms`; `api/transforms.md` opens with transaction helper wording but keeps the `Transforms API` title. | `rg -n 'Editor Methods' docs/Summary.md` returns no matches. | No plugin/collab behavior changes. Plate and slate-yjs migration pressure benefits from less renaming churn in the public docs. | keep |
| Move `Docs Proof Map` out of the public General nav while keeping the page. | Docs/test author, agent maintainer, release owner. | "Agents and maintainers need this map fast; hiding it makes regression work worse." | The proof map remains a maintainer artifact, just not a normal reader learning page beside Resources and FAQ. Public docs should not look like release scaffolding. | Current v2 `../slate-v2/docs/Summary.md:74` lists `Docs Proof Map`; legacy Slate General nav has Resources/FAQ-like reader pages, not a proof ledger. | Delete the proof map. Weaker because agents and maintainers lose source-backed regression navigation. | Users reading docs no longer see proof scaffolding in the TOC. Maintainers reach it from Contributing or a maintainer subsection. | `docs/general/contributing.md` links the proof map with maintainer wording; `Summary.md` no longer lists it. | `rg -n 'Docs Proof Map' docs/Summary.md` returns no matches, and a targeted grep confirms a contributor/maintainer link still exists. | No runtime ecosystem change. The proof map still protects extension/collab proof rows for later work. | keep |
| Keep primitive editor write methods documented, but under `Advanced editor write methods`. | Runtime bridge author, command author, test author, app author. | "If these are not normal app APIs, documenting them will still tempt users." | They are real public/reference surface and have source/tests. Hiding them makes bridge, history, collaboration, and test work harder. Sectioning is the honest fix. | Live source exposes `Editor.addMark` and `Editor.applyOperations` in `../slate-v2/packages/slate/src/interfaces/editor.ts:814-829`; write-boundary tests prove primitive write rules in `../slate-v2/packages/slate/test/write-boundary-contract.ts:27-77`. | Delete primitive method docs. Weaker because it turns real supported behavior into tribal knowledge. | App authors use `editor.update` + `tx`; advanced authors use primitive entries only after reading the section-level note. | `api/nodes/editor.md` has one advanced section, exact signatures, and no repeated per-method warning. | Source-ledger grep for primitive method names plus repeated-warning grep. | Extension/collab bridge users still have documented primitives without raw Slate promising current Plate/slate-yjs adapters. | keep |
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
| 7. Closure score and final gates | complete | Verified score threshold, dimension floors, pass schedule, objection ledger verdicts, implementation checklist, proof gates, and completion state. | Marked the review plan and completion file done. | None. | User review or later execution lane |

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
- Completion status: done.

## Plan Deltas From Review

Added:

- A concrete reorg target for `Summary.md`, `concepts/04-transforms.md`,
  `api/transforms.md`, and `api/nodes/editor.md`.
- A specific decision to remove `Docs Proof Map` from the public table of
  contents while keeping it reachable for maintainers.
- A rejected-alternatives table so this does not devolve into sentence-by-
  sentence cleanup.

Dropped:

- The idea that each primitive method entry needs its own "use tx" warning.

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

Kept unchanged:

- No Slate v2 implementation change is part of this plan.
- No current-version Plate or slate-yjs adapter support is required.
- No new public architecture page belongs in this plan.

## Open Questions

None for the plan shape.

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
| 6. Final docs gates | review owner | source-ledger and style greps | completion-check |

## Fast Driver Gates

```bash
cd ../slate-v2 && rg -n 'normal application code|bridge layer|Inside .*editor\\.update|primitive .*reference material' docs --glob '!docs/general/changelog.md' --glob '!docs/concepts/xx-migrating.md'
```

```bash
cd ../slate-v2 && rg -n 'Docs Proof Map|Editor Methods' docs/Summary.md
```

```bash
cd ../slate-v2 && rg -n 'Editor\\.addMark\\(|Editor\\.removeMark\\(|editor\\.children|editor\\.selection|editor\\.operations|editor\\.marks|methods\\(' docs --glob '!docs/general/changelog.md' --glob '!docs/concepts/xx-migrating.md'
```

```bash
cd ../slate-v2 && rg -n 'editor\\.api|editor\\.tf|PlatePlugin|withYjs|slate-yjs|Y\\.Doc|yjs' docs/concepts/08-plugins.md docs/walkthroughs/07-enabling-collaborative-editing.md docs/api/transforms.md docs/api/nodes/editor.md
```

```bash
cd ../slate-v2 && rg -n 'state|tx|applyOperations|commit|operations|tags|runtime ids are local|does not provide a full multiplayer recipe' docs/concepts/08-plugins.md docs/walkthroughs/07-enabling-collaborative-editing.md docs/general/docs-proof-map.md
```

## Final Completion Gates

- Total score `>= 0.92`.
- No dimension below `0.85`.
- Pass schedule complete.
- Objection ledger verdicts are all `keep` or resolved.
- The plan gives a concrete user-doc IA target, not just prose preferences.
- The plan keeps Slate-close terminology without preserving bad legacy
  footguns.
- The plan keeps proof artifacts findable without making them public learning
  pages.
- `tmp/completion-check.md` says `done`.
