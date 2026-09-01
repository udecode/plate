# Hard cut Comments ownership

Objective:
Produce an execution-ready Comments hard cut with one canonical owner for
thread data, anchors, editor projection, and view state. Delete the package and
registry machinery that duplicates those jobs. Preserve serialized user data
through one migration extractor, and stop execution at a measured Plite Anchor
scalability gate until it passes.

Mode:

- `standard`, planning only. This run changes no Comments production source.
- Status: plan complete; target adoption is gated by Slice 0.
- Priority: P1 architecture debt. The current full plugin composition scores
  `2.0/10` with 96% confidence.

Goal plan:
`docs/plans/2026-08-31-hard-cut-comments-ownership.md`

Applied packs:

- package-api
- docs
- browser
- performance-observability
- agent-native
- registry-changelog

Completion threshold:

- The plan names the final owner graph, public call shape, every deletion and
  migration, execution slices, scale budgets, browser cases, release artifacts,
  generated outputs, and final proof commands.
- The target cannot pass its adoption gate until the final production path
  meets the Slice 0 Anchor and Annotation budgets.

Verification surface:

- Deterministic Plate Review score receipt and bounded current-owner manifest.
- Matched Comments/Anchor/Annotation benchmark receipts with source hashes.
- Best API normal, custom, advanced, and migration call sites.
- Exact future package, migration, registry, docs, browser, release, generated,
  and agent-parity commands named below.
- Mechanical completion check on this plan.

Constraints:

- Planning only until the user explicitly approves implementation.
- No public compatibility alias, deprecated plugin, dual read, or runtime shim.
- Persisted data may retain only the migration extractor.
- Do not edit the active Selection docs or Link plan/source owners in this run.
- Do not hand-edit generated registry, barrel, template, or skill output.

Boundaries:

- Full Comments/Discussion package and registry family is in scope.
- Hosted backend choice and Suggestion semantic redesign are out of scope.
- Plite Anchor/Annotation/Widget internals enter scope only where measured
  Comments scale proves they own the blocker.
- Existing inactive-selection, Find, and Link decisions remain authoritative.

Blocked condition:

- Adoption stops after Slice 0 while any calibrated Anchor/Annotation budget or
  correctness counter is red. Later slices cannot waive or route around it.

## Decision

Hard cut the Comments package/plugin model. `platejs/comment`,
`platejs/comment/react`, document `comment_*` properties, `CommentKit`,
`DiscussionKit`, `commentPlugin`, and `discussionPlugin` all die.

The final owner graph is:

```text
app or sync service
  owns threads, bodies, users, permissions, resolved state, audit state
        |
        v
external anchor adapter or local editor.anchor
  owns durable position mapping and deletion policy
        |
        v
Plite Annotation + Widget stores, imported through platejs/react
  own editor projection and anchored UI availability
        |
        v
copied comment.tsx family
  owns draft, active/hover state, rendering, forms, and product actions
```

Do not add a public `CommentsPlugin`, `CommentsStore`, or second projection API.
That would make the call site prettier by rebuilding the wrong abstraction.
The one justified convenience layer is a copied registry-local `useComments`
controller because highlight rendering, toolbar initiation, popovers, and the
thread panel share one view lifecycle.

The only Comments-specific package API that survives is a one-shot
`extractLegacyCommentAnchors` utility under the existing
`platejs/migrations` owner. It has no runtime read path and cannot keep legacy
marks alive.

## Parallel-session inputs

| Task | State read | Constraint on this plan |
| --- | --- | --- |
| Native inactive selection | Complete; Plite `Editable` owns neutral focus-loss paint | Reuse the final marker/output contract; do not reopen it |
| Selection docs consolidation | Active in another task | Do not edit its plan or Selection source during Comments execution |
| Empty-paragraph Link toolbar | Active in another task | Re-read the final `link.tsx` before removing its Comments coupling; preserve that task's geometry/focus result |
| Find colocation | Complete; `find.tsx` owns its controller and registry plugin in one file | Keep the Comments family controller in `comment.tsx`; do not create `comment-index.ts` or `comment-plugin.ts` |

## Scope and boundaries

- In scope: the full Comments/Discussion family across package exports,
  schema, codecs, migrations, registry UI, AI review integration, Suggestion
  coupling, Link coupling, kits, examples, values, docs, tests, generated
  registry output, release artifacts, agent doctrine, browser behavior, and
  runtime scale.
- Non-goals: choosing a hosted comments backend; redesigning Suggestion
  semantics; changing the accepted inactive-selection, Find, or Link geometry
  designs; preserving branch-only APIs; inventing cross-document comment copy.
- Canonical Plite owners: Annotation for durable logical ranges, Widget for
  anchored out-of-flow UI, Decoration only for transient paint, and Anchor for
  local runtime mapping.
- Compatibility: no alias, shim, dual read, document fallback, or deprecated
  plugin. Serialized data earns the migration extractor only.
- Blocked condition: Slice 0 remains closed while the matched final benchmark
  misses a frozen budget or its correctness counters. No later slice may ship
  around that failure.

Start Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Other task plans were reconstructed; the full Comments cut, score, API, performance, adoption, and proof work are specified here |
| Active goal and plan verified | yes | Goal `01a05353-779c-75e1-abeb-a8fd1a670b7f`; this file is canonical |
| Current owners read | yes | Package, registry, docs, tests, generated inputs, Plite Annotation/Widget, Anchor state, and active parallel plans were read from the current checkout |
| Best API target resolved | yes | No new public Comments runtime layer; one copied `useComments` family controller over existing `platejs/react` APIs |
| Mode and execution boundary resolved | yes | Planning only; production work starts only after explicit user approval |
| Public/package boundary identified | yes | Delete both `platejs/comment` exports; add only the migration extractor to `platejs/migrations` |
| Release artifact path selected | yes | Update `.changeset/comment-v54-runtime.md` and add one registry changelog source entry |
| `changeset` skill loaded | yes | Loaded; final delta is relative to `main`, uses `platejs: major`, and does not describe branch-only removals |
| Barrel/export impact recorded | yes | Remove comment barrels/exports/entrypoint configs and run `pnpm brl` |
| Docs pack and lane resolved | yes | Convert `/docs/comment` into a Guide/System page; merge and delete `/docs/discussion`; update English and Chinese owners |
| Docs doctrine and source owners read | yes | `docs-creator`, style/topology rules, plugin lane rules, both current docs, and Plite Annotations docs were read |
| Browser surface selected | yes | Browser on `/blocks/comment-demo`; Chrome for clipboard behavior; Computer only if Chrome cannot expose the native state |
| Scale contract selected | yes | Matched current/index, base editor, Anchor-only, Annotation, and pathological cohorts are executable |
| Agent-native pack selected | yes | Stale source-rule examples and generated mirrors are listed in Slice 4 |
| Registry changelog pack selected | yes | User-visible install shape changes; source entry plus `--write` and `--check` are required |

## Current owner manifest

| Responsibility | Current owner and evidence | Failure |
| --- | --- | --- |
| Persisted anchors | `BaseCommentPlugin` declares `comment`, `comment_<id>`, and transient text properties at `packages/platejs/src/features/comment/lib/BaseCommentPlugin.ts:26-77` | Product thread identity is embedded into the document by default |
| Comment lookup/mutation | Package reads scan nodes and mutations set/unset marks at `BaseCommentPlugin.ts:83-231` | The package API exists only to manage the duplicated document representation |
| Package surface | `packages/platejs/package.json:77-85` exports `platejs/comment` and `/react` | A public feature noun exists without owning complete Comments truth |
| Thread truth | `discussionPlugin` stores users, current user, and all discussions at `apps/www/src/registry/components/editor/discussion.tsx:17-24,177-192` | Application/service data has editor-plugin lifetime |
| View state | `commentPlugin` stores `activeId`, `commentingBlock`, and `hoverId` at `apps/www/src/registry/components/editor/comment.tsx:64-74,115-172` | Exact-view state is tied to the editor plugin and mixed with schema writes |
| Draft lifecycle | `setDraft` writes draft marks before a thread exists at `comment.tsx:137-164`; submit replaces them with `comment_<id>` at `comment.tsx:665-714` | A temporary composer state mutates document/history |
| Thread mutations | Reply, edit, delete, resolve, and create call `discussionPlugin.store.set` throughout `comment.tsx:208-715` | UI writes the editor plugin store instead of an application action boundary |
| Derived index | `buildBlockDiscussionIndex` clones every discussion and scans every entry at `apps/www/src/registry/lib/block-discussion-index.ts:380-481` | A thread body edit pays whole-document and whole-thread work |
| React fan-out | Every block wrapper reads the full discussions array and index at `apps/www/src/registry/components/editor/block-discussion.tsx:405-461` | Per-block UI depends on a global snapshot |
| Global composition | `EditorKit` installs `DiscussionKit` and `CommentKit`; `BaseEditorKit` installs `BaseCommentKit` at `apps/www/src/registry/components/editor/plugins.ts:66-69` and `plugins-static.ts:23-44` | Comments is forced into every editor and static schema |
| AI integration | `use-chat.ts` writes the discussion store and transient comment marks at `apps/www/src/registry/components/editor/use-chat.ts:241-288` | AI review duplicates the same wrong write path |
| Suggestion integration | `suggestionPlugin` reads current user from `discussionPlugin` at `apps/www/src/registry/components/editor/suggestion.tsx:412-415` | Suggestions cannot exist without the unrelated thread store |
| Link integration | Link UI reads `commentPlugin.activeId` at `apps/www/src/registry/components/editor/link.tsx:257-259` | Floating Link behavior depends on Comments view state |
| Docs | `/docs/comment` teaches package marks and plugin transforms; `/docs/discussion` teaches the editor plugin as the data store | Public teaching cements the wrong owners |
| Canonical survivor | Plite Annotation explicitly models app-owned durable ranges and narrow refresh at `packages/plitejs/src/react/annotation-store.ts:28-118`; `platejs/react` reexports Annotation/Widget APIs at `packages/platejs/src/react/plite-react.ts:1-161` | Correct substrate already exists |
| Canonical teaching | `content/docs/plite/libraries/plite-react/annotations.mdx:123-180,240-283` puts bodies/permissions in the app, positions in an adapter, paint in projection, and UI in widgets | No new public Comments runtime layer is needed |

Exclusions:

- AI tool-name strings meaning “generate review comments” remain; they are not
  the deleted Comments plugin.
- DOCX comment extraction remains; it imports external document comments and
  is unrelated to the live Comments schema.
- Generic tests that happen to name a local mark `comment` remain when they do
  not import the deleted feature.

## Architecture score

Command receipt:
`docs/plans/artifacts/hard-cut-comments-ownership/plate-review-score.json`

| Axis | Grade | Weight | Points | Current evidence | Falsifier |
| --- | ---: | ---: | ---: | --- | --- |
| Canonical owner | 0 | 2.0 | 0.000 | Document marks and `discussionPlugin` are independently writable truth | One application-owned thread channel with derived editor projection |
| Lifetime alignment | 0 | 2.0 | 0.000 | Users/threads and hover/draft state share editor-plugin lifetime | Service state, durable anchors, and exact-view state have separate owners |
| Package/layer boundary | 2 | 1.0 | 0.500 | Headless and React entrypoints are tidy, but they expose a partial feature and force schema | No Comments runtime entrypoint; existing platform APIs carry projection |
| API/DX/AX | 1 | 1.5 | 0.375 | Two kits, two plugins, mark utilities, store mutation, and manual coupling are required | One copied controller plus application actions; raw advanced primitives remain available |
| Scale/invalidation | 1 | 1.5 | 0.375 | Full clone/scan/index work and 10k benchmark failures | Local thread updates and indexed Anchor commits meet all frozen budgets |
| Correctness/failure | 2 | 1.0 | 0.500 | Tests exist, but thread/mark divergence and Markdown ID loss remain possible | Atomic migration, one truth owner, explicit orphan/discontinuous failures |
| Proof/enforcement | 3 | 1.0 | 0.750 | Package/index tests and Plite comment-mode browser proof exist; current registry runtime was not replayed in this planning run | Final package, migration, registry, browser, clipboard, and scale closure |

Raw subtotal: `2.5/10`.

Applied final caps:

- wrong owner: ceiling `2.0`
- duplicate truth: ceiling `2.0`
- wrong lifetime: ceiling `3.0`

Displayed score: `2.0/10`. Confidence: `96%` from complete inventory,
writer/reader trace, and consumer manifest, with runtime confidence at 3/4
because the current registry UI was not replayed.

The conditional target scores `9.3/10` only after every execution proof passes
with owner 4, lifetime 4, boundary 4, API 3, scale 3, correctness 4, and proof 4.
That is a target receipt, not an achieved score.

## Best API

### Current call shape

```tsx
const editor = createEditor({
  plugins: [...EditorKit, ...DiscussionKit, ...CommentKit],
});

editor.plugin(commentPlugin).update.setDraft();
editor.plugin(discussionPlugin).store.set({ discussions });
```

The code is short because the editor silently owns application data, document
anchors, composer state, rendering, and persistence. That convenience is fake.

### Normal copied-UI path

```tsx
import { Plate, useCreateEditor } from 'platejs/react';

import {
  Comments,
  CommentThreads,
  useComments,
} from '@/components/editor/comment';

const editor = useCreateEditor({ plugins: EditorKit, initialValue });
const threads = useDocumentThreads(documentId);
const comments = useComments({
  actions: threadActions,
  editor,
  threads,
});

<Plate editor={editor} annotationStore={comments.annotationStore}>
  <Comments controller={comments}>
    <Editor ref={editableRef} renderSegment={comments.renderSegment} />
    <CommentThreads editableRef={editableRef} />
  </Comments>
</Plate>;
```

`useComments` owns only shared view composition:

- a draft `Anchor<Range>` until submit/cancel;
- active/hover ids and narrow old/new-id subscriptions;
- the existing Plite Annotation and Widget stores;
- `renderSegment`, start/cancel/submit coordination, and action dispatch.

It never owns the thread array, users, permissions, resolved state, audit data,
or persistence. `Comments` is the one justified private-context root for the
family; it is not a package provider or editor truth store.

### Custom UI path

```tsx
import {
  Plate,
  usePliteAnnotationStore,
  usePliteAnnotations,
} from 'platejs/react';

const annotations = threads.map(toCommentAnnotation);
const annotationStore = usePliteAnnotationStore(editor, annotations);

<Plate editor={editor} annotationStore={annotationStore}>
  <Editor renderSegment={renderMyCommentRange} />
  <MyThreadPanel snapshot={usePliteAnnotations()} />
</Plate>;
```

Custom consumers bypass copied Comments UI without recreating a package
Comments plugin.

### Advanced adapter path

```tsx
const annotations = commentAnchorAdapter.annotations(threads);
const annotationStore = usePliteAnnotationStore(editor, annotations);
const widgetStore = usePliteWidgetStore(editor, toCommentWidgets(threads), {
  annotationStore,
});

commentChannel.subscribeIds((ids) => {
  annotationStore.refresh({ ids, reason: 'external' });
});
```

The adapter owns serialized/remote positions. Plate apps import these public
primitives through `platejs/react`, not `plitejs/react`.

### Legacy data migration

```ts
import { extractLegacyCommentAnchors } from 'platejs/migrations';

const { anchors, document } = extractLegacyCommentAnchors(legacyDocument, {
  knownThreadIds: threads.map((thread) => thread.id),
});

await commentAnchorAdapter.replaceAll(anchors);
return document;
```

The extractor returns a document with `comment`, `comment_<id>`,
`comment_draft`, and `commentTransient` removed plus one validated range per
thread id. It fails before mutation on unknown thread ids, drafts/transients,
or discontinuous ranges. Applications resolve those cases explicitly; Plate
does not invent bodies or merge unrelated ranges.

## Alternatives rejected

| Alternative | Rejection |
| --- | --- |
| Clean up `BaseCommentPlugin` and keep marks | Still makes an external thread depend on document schema and keeps two writers |
| Add a public `CommentsPlugin` over Annotation/Widget | Adds a second runtime noun without owning thread truth or position mapping |
| Keep only lightweight document ids by default | Valid only when copy/serialization is an explicit product requirement; it cannot be the universal model |
| Expose raw Annotation/Widget assembly as the normal registry path | Correct but needlessly repetitive across the toolbar, highlight, popover, and thread panel |
| Keep `discussionPlugin` as a UI cache | A cache with public writers and no canonical invalidation contract is duplicate truth |
| Preserve old reads during migration | Creates an unbounded dual path and hides incomplete migrations |

## Decision ledger

| Surface | Current | Target owner | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| Thread bodies/users/status | `discussionPlugin` store | App or sync service | Replace all store reads/writes with `threads` plus explicit actions | Unit action contract; browser create/reply/edit/delete/resolve | Async failure and optimistic state | delete/move, P0 cut |
| Durable positions | `comment_<id>` text properties | External adapter; local `editor.anchor` only for in-memory demos | Map threads to `PliteAnnotation`; release local anchors | Anchor contracts, migration tests, browser rebasing | Remote serialization policy | move, P0 cut |
| Inline paint | Comment mark component | Annotation projection through `renderSegment` | Internal `CommentHighlight` in `comment.tsx` | Overlap/status/active paint controls | Active-id fan-out | move, P0 |
| Popovers/panel | Per-block global index | Widget targets plus one thread list | Render once per editor; subscribe by id/widget | Wake counters and browser positioning | Virtualization at very large thread counts | move, P0 |
| Draft | Document mark and collapsed selection | `useComments` view-local Anchor and composer state | Start/cancel/submit never writes document | Document-write counter stays zero | Anchor invalidated before submit | move, P0 |
| Active/hover | `commentPlugin` store | `useComments` exact-view owner | Narrow old/new-id wakes | Render/subscriber counters | Whole-editor repaint | move, P1 |
| Package runtime | `platejs/comment`, `/react` | No replacement | Delete exports, files, configs, partitions, barrels, `PLUGINS.comment` | Import smoke and stale search | Downstream breaking change | delete, P0 |
| Registry plugin/kits | Comment/Discussion plugins and kits | Copied component family only | Remove from `EditorKit`/`BaseEditorKit`; demo composes UI explicitly | Registry install closure | Hidden kit consumer | delete, P0 |
| BlockDiscussion index | Combined Comments/Suggestions clone/scan | Suggestions-only index; Comments absent | Remove comment branches and rename only if the remaining public item becomes misleading | Existing Suggestion behavior tests | Accidental Suggestion redesign | split, P1 |
| AI review comments | Store plus transient marks | Thread action plus adapter anchor | `use-chat.ts` dispatches one application comment action | AI range tests and browser review flow | Async tool result order | move, P1 |
| Suggestion user | `discussionPlugin.currentUserId` | Suggestion/app input | Pass current user through Suggestion's own state boundary | Suggestion focused tests | Shared demo fixture drift | decouple, P1 |
| Link focus | Reads `commentPlugin.activeId` | Existing Link/selection owner from the active Link task | Remove only the Comments dependency after reread | Link browser replay | Concurrent source movement | delete dependency, P1 |
| Markdown/static | Generic `<comment>` mark and `comment-static` | No document-only Comments rendering | Delete codec/component; app supplies external annotations when rendering review UI | Markdown/static focused tests | Consumer expected embedded comments | delete, P1 |
| Clipboard | Marks travel with fragment implicitly | External comments do not copy by default | Document-embedded ids remain an explicit adapter strategy only | Chrome copy/paste plus serializer tests | Product-specific expectations | explicit policy, P1 |
| Legacy persisted data | Live marks required | `platejs/migrations` extractor | Run before schema fitting, persist anchors, then load stripped document | Atomic lossless/fail-closed tests | Orphans and discontinuity | keep migration only, P0 |
| Docs topology | Two plugin pages | One `/docs/comment` Guide/System page | Merge Discussion content, delete EN/CN Discussion pages, update links/nav | MDX build and route proof | Stale inbound links | merge/delete, P1 |
| Agent doctrine | Several rules cite deleted Comment APIs | Source rules cite surviving examples and updated Comments verdict | Edit `.agents/rules/**`, then regenerate with `pnpm install` | Source/mirror parity and zero stale examples | Generated mirror hand edit | repair, P1 |
| Scale | Listener-wide Anchor mapping | Indexed affected-anchor mapping plus current Annotation store | Slice 0 precedes all adoption | Matched 100/1k/10k/pathological receipt | 10k same-leaf fan-out | gated, P0 prerequisite |

## Scale contract and measured receipt

Artifacts:

- Harness:
  `docs/plans/artifacts/hard-cut-comments-ownership/benchmark-comments-ownership.ts`
- First target failure:
  `docs/plans/artifacts/hard-cut-comments-ownership/benchmark-comments-ownership-initial-fail.json`
- Base/Annotation diagnostic:
  `docs/plans/artifacts/hard-cut-comments-ownership/benchmark-comments-ownership.json`
- Anchor owner isolation:
  `docs/plans/artifacts/hard-cut-comments-ownership/benchmark-comments-ownership-owner-isolation.json`

Command:

```bash
bun docs/plans/artifacts/hard-cut-comments-ownership/benchmark-comments-ownership.ts \
  --output=docs/plans/artifacts/hard-cut-comments-ownership/benchmark-comments-ownership-owner-isolation.json
```

Matched inputs:

- distributed 100, 1,000, and 10,000 document nodes with one thread/anchor each;
- pathological 10,000 anchors on one text leaf;
- 20 warmups plus five packets of 20 samples for 100/1,000;
- five warmups plus three packets of 10 samples for 10,000;
- five cold construction samples;
- live `buildBlockDiscussionIndex`, live `editor.anchor`, live
  `createPliteAnnotationStore`, identical content and actions, SHA-256 source
  fingerprints, and correctness assertions.

Key p95 results in milliseconds:

| Cohort/operation | Current index | Base editor | Anchor only | Target Annotation | Isolated Annotation reproject |
| --- | ---: | ---: | ---: | ---: | ---: |
| 100 thread-body edit | 0.859 | n/a | n/a | 0.042 | n/a |
| 1k thread-body edit | 7.859 | n/a | n/a | 0.142 | n/a |
| 10k thread-body edit | 68.553 | n/a | n/a | 0.644 | n/a |
| 100 distributed document edit | n/a | 1.689 | 2.649 | 2.608 | 0.129 |
| 1k distributed document edit | n/a | 2.501 | 9.601 | 8.396 | 0.062 |
| 10k distributed document edit | n/a | 36.277 | 78.034 | 77.581 | 0.866 |
| 10k same-leaf document edit | n/a | 0.878 | 834.897 | 1201.765 | 52.701 |

Deterministic target counters were correct:

- distributed edits resolved one annotation, changed one projection bucket,
  woke one runtime bucket, and affected zero unrelated annotations;
- one thread-body edit resolved one annotation and caused zero projection or
  runtime wakes;
- the pathological edit necessarily resolved 10,000 co-located annotations;
- isolated Annotation reprojection stayed below 5 ms distributed and 100 ms
  pathological.

Root cause:

- `anchor-state.ts:210-213,243-245,260-261` iterates every live Anchor listener
  at transaction begin, change, and commit;
- every Anchor registers its own listener at `anchor.ts:520-538`;
- the Anchor-only control accounts for most of the red total. Annotation adds
  modest work after Anchor mapping.

Verdict: reject the production target at current performance. The ownership
design stands, but target adoption is not accepted until Slice 0 passes.

The first frozen `16.67 ms` total budget at 10,000 distributed nodes was
overconstrained because the matched base editor itself measured `36.277 ms`.
It remains a recorded failure. The execution rerun uses this calibrated
contract, frozen before any repair:

- 100 and 1,000 distributed total p95 `<= 16.67 ms` and Comments/Anchor added
  p95 `<= 5 ms` over the matched base packet;
- 10,000 distributed total p95
  `<= max(base * 1.20, base + 5 ms)` with one affected Anchor and zero unrelated
  Annotation wakes;
- 10,000 same-leaf total p95 `<= 100 ms` with 10,000 affected Anchors;
- target thread-body p95
  `<= max(current * 1.20, current + 0.25 ms)`;
- 10,000 cold maximum `<= 250 ms`;
- no correctness failure, stale range, leaked listener, retry, or unexplained
  budget override;
- packet p95 spread and `0.25 ms` define the noise floor; compare matched packets
  from the same process and source identity.

No production telemetry is added. A public editor library must not transmit
document content, user ids, thread bodies, ranges, or tenant data. Deterministic
test/benchmark counters may record counts and durations only.

## Execution slices

| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 0. Repair Anchor scale | `benchmark` -> `plite-plan`/Plite core | Replace listener-wide begin/change/commit fan-out with an affected-root/position indexed Anchor registry and lazy checkpoints; keep Anchor public API unchanged | Owner-isolation receipt is red | All calibrated budgets and Anchor correctness rows pass; no later slice starts before this | Anchor/range/collab contracts, Annotation contracts, matched benchmark, `pnpm check:plite:dev`, focused comment-mode browser row |
| 1. Add the migration-only bridge | `plate-plugin-creator` on `platejs/migrations` | Implement `extractLegacyCommentAnchors`; group contiguous multi-leaf marks, validate thread ids, fail on drafts/transients/discontinuity, strip properties atomically | Slice 0 green; exact legacy shapes frozen | Tested utility exported only from `platejs/migrations`; no runtime fallback | `pnpm --filter platejs typecheck:partition:migrations`; `pnpm --filter platejs test:partition:migrations`; import smoke |
| 2. Cut registry ownership atomically | `plate-ui` | Build `useComments`/`Comments`/`CommentThreads` in `comment.tsx`; app-owned thread fixture/actions; Annotation/Widget projection; local draft; remove Comments from block index; decouple AI, Suggestion, and Link; remove `discussion.tsx` | Migration bridge exists; active Link task is reread | Registry has one thread owner and no document/store writer; old and new paths never coexist at slice exit | Focused registry/unit tests, action failure tests, install dependency audit, `/blocks/comment-demo` Browser proof |
| 3. Delete package and schema surfaces | `plate-plugin-creator` | Delete package Comment source/tests/barrels, both exports, entrypoint configs/partitions, `PLUGINS.comment`, Comment codecs/static kit, stale package/registry/test consumers; run barrels | Registry no longer imports feature | Zero imports/properties/exports for the deleted runtime; only migration/docs fixtures mention legacy keys | `rg` stale audit, `pnpm brl`, Plate partition tests/typechecks, package export/import checks |
| 4. Repair teaching, release, and agent routes | `docs-creator`, `registry-changelog`, `sync-vision`, agent-native review | Rewrite `/docs/comment`; delete `/docs/discussion` EN/CN; update links/nav; update existing major changeset; add registry changelog; update `docs/vision/plate.md` and stale `.agents/rules/**`; regenerate docs/registry/skills | Final API/source shape stable | Current-state docs and generated outputs match source; no deleted example survives | Unslop, `build:source`, `check:docs`, `build:registry`, changelog `--check`, `pnpm install`, source/mirror parity |
| 5. Final closure | `plate-next` plus owning test lanes | Rerun production benchmark, package/app checks, Browser and Chrome cases, generated-output audit, and plan checker | Slices 0-4 green | Conditional target earns its 9.3 score; otherwise stop with exact red gate | Commands below; P1 autoreview is N/A while the checkout is `next` by repo rule |

Phase / pass table:

| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Parallel plans, live owner manifest, current docs/APIs/tests, and Vision read | Decide |
| Decide | complete | 2/10 score, hard-cut target, call sites, deletion/adoption ledger | Prove |
| Prove | complete | Three benchmark passes isolated current index, base editor, Anchor, and Annotation costs | Handoff |
| Handoff | complete | All implementation slices, proof gates, release/docs/agent work, and risks recorded | User review |
| Adopt target | gated | Current Anchor-backed 10k document edits miss frozen budgets | Slice 0 after explicit approval |

### Slice 0 implementation law

- Keep `editor.anchor`, `tx.anchor`, association, deletion, roots, discard, and
  release behavior unchanged.
- Index live Anchors by affected root/position or another source-proven key.
  A local edit must not call every Anchor listener.
- Create checkpoints lazily for Anchors touched by a transaction; discard
  restores exactly those Anchors.
- Batch shared `DocumentChange`/`DocumentIndex` work. Do not build one document
  index or change mapping per Anchor.
- Add deterministic counters for visited, mapped, checkpointed, committed, and
  unrelated Anchors in tests/benchmarks, not public telemetry.
- Pathological 10k same-leaf work may be O(affected Anchors), but its constants
  must meet the 100 ms budget.

### Slice 1 migration law

- Input is an unfitted legacy document plus known external thread ids.
- Output contains the cleaned document and `{ id, range }` records.
- Adjacent marked leaves with the same id form one range across inline nodes.
- Overlapping different ids remain independent ranges.
- Unknown ids, draft/transient marks, false/non-boolean legacy values, and one
  id split into disjoint ranges fail with structured diagnostics before output.
- The caller persists external anchors before loading the cleaned document.
- No package plugin, schema declaration, codec, or normalizer reads legacy marks.

### Slice 2 registry law

- `threads` and `actions` are inputs, never copied into an editor/plugin store.
- `useComments` may retain a view-local draft Anchor and active/hover ids only.
- Thread action rejection keeps the composer and reports the error; it does not
  create a mark or optimistic second truth.
- Body/user/permission data stays in Annotation `data`; only inline paint fields
  stay in `projection`.
- Known external changed ids call `refresh({ ids })`; no broad refresh on every
  React render.
- Comment UI renders once per editor from Annotation/Widget ids. It does not
  wrap every block or rescan document nodes.
- Suggestion indexing remains behavior-equivalent and loses all Comments input.
- In-memory demos may create `editor.anchor`; docs label remote persistence as
  the external adapter's job.

## Public break and adoption map

| Deleted surface | Adoption |
| --- | --- |
| `platejs/comment` | Import Annotation/Widget primitives from `platejs/react`; use `extractLegacyCommentAnchors` only during upgrade |
| `platejs/comment/react` | Use copied Comments UI or custom Annotation rendering |
| `BaseCommentPlugin`, `CommentPlugin`, `CommentText`, `BaseCommentDefinition` | No replacement descriptor/type; app thread types are application-owned |
| `getCommentKey*`, `getCommentCount`, `getDraftCommentKey`, `getTransientCommentKey`, `isComment*` | Delete runtime callers; migration utility recognizes legacy keys privately |
| `editor.api/read/update.comment` and `tx.comment.*` | App thread actions plus `annotationStore.refresh({ ids })` |
| `PLUGINS.comment` | No replacement plugin identity |
| `CommentKit`, `BaseCommentKit`, `DiscussionKit` | Explicit copied Comments composition; remove from global kits |
| `commentPlugin`, `discussionPlugin` | `useComments({ editor, threads, actions })`; Suggestion owns its user input |
| `comment`, `comment_<id>`, `comment_draft`, `commentTransient` document properties | One migration extraction, then stripped documents |
| `comment-static` | No document-only review rendering; render supplied external annotations in an app-owned review surface |
| `/docs/discussion` | Merge its useful thread model into `/docs/comment`; no redirect/alias page |

## Docs, release, and agent-native closure

Docs lane: Guide/System. Keep `/docs/comment` as the canonical route and title it
“Comments.” Remove `<PackageInfo>`, Kit/Manual plugin setup, package APIs,
transforms, mark utilities, and document-owned types. Teach this order:

1. ownership table;
2. app thread model and actions;
3. copied `useComments` quick path;
4. external anchor adapter and local-only `editor.anchor` distinction;
5. custom Annotation/Widget path;
6. collaboration, deletion, clipboard, and static policies;
7. legacy migration before schema fitting;
8. links to the canonical Plite Annotation reference.

Update both `comment.mdx` and `comment.cn.mdx`. Delete both Discussion pages,
update metadata/nav and every inbound Comment/Discussion/Suggestion/plugin-guide
link, and keep no duplicated Annotation reference.

Release artifacts:

- Update `.changeset/comment-v54-runtime.md`, which already owns the `platejs`
  major Comments delta. Replace its stale plugin/mark migration bullets with the
  final main-to-target migration: application-owned threads, Annotation/Widget
  projection, and `extractLegacyCommentAnchors`. Do not write a branch-only
  “remove `platejs/comment`” diary entry.
- Add
  `apps/www/src/registry/changelog/entries/2026-08-31-project-app-owned-comments.mdx`.
  Use a behavior row for `comment`, `comment-toolbar-button`, and the final demo;
  use explicit remove rows for deleted registry item ids. Generate JSON; never
  edit it by hand.
- Run `pnpm brl` after exported files/paths are removed.

Agent-native capability map:

| User action | Agent route | Source owner | Generated/doc owner | Proof | Status |
| --- | --- | --- | --- | --- | --- |
| Audit Comments architecture | `plate-review plugin comments` | `.agents/rules/plate-review.mdc` | `.agents/skills/plate-review/SKILL.md` | score command plus bounded manifest | repair source wording, then pass |
| Design Comments API | `best-api` | `.agents/rules/best-api.mdc` | generated skill | normal/custom/advanced call sites | pass |
| Implement package deletion | `plate-plugin-creator` | package source and its rule references | generated skill | package partitions/import smoke | repair stale audit links, then pass |
| Implement copied UI | `plate-ui` | `.agents/rules/plate-ui.mdc` and component-shape reference | generated skill | registry tests/Browser | replace deleted CommentPlugin examples, then pass |
| Migrate persisted data | docs plus `platejs/migrations` | migrations source | `/docs/comment` | extractor tests | add, then pass |

Source-rule edits required by the public cut:

- `.agents/rules/plate-review.mdc`: retain the 2/10 full-composition example,
  but make document-embedded ids an explicit adapter exception rather than the
  default headless owner.
- `.agents/rules/plate-plugin-creator/references/plugin-authoring-audit.md`:
  replace deleted BaseComment/CommentPlugin precedent with surviving owners.
- `.agents/rules/plate-ui.mdc` and
  `.agents/rules/plate-ui/rules/component-shape.md`: replace deleted
  CommentPlugin/API examples with a surviving exact plugin.
- Run `pnpm install`, then prove source/generated parity and zero stale deleted
  API examples. Never edit generated `SKILL.md` files directly.

The smallest durable Vision change belongs in `docs/vision/plate.md`: thread
bodies, users, permissions, resolution, and audit truth remain app/service
state; Annotation/Widget project them; a plugin cannot become their data owner.

## Browser and behavior proof

Primary route after registry adoption: `/blocks/comment-demo`.

Browser cases:

1. Select text, start a comment, submit, and prove one external thread, one
   inline projection, one anchored UI surface, and zero document writes.
2. Cancel a draft and prove the Anchor is released, the document is unchanged,
   and no thread exists.
3. Reject a create action and prove the composer/error remains without a mark or
   duplicate thread.
4. Reply, edit, resolve, reopen if supported, and delete through application
   actions; only thread state changes.
5. Insert text before and inside the anchor, split/move blocks, undo/redo, and
   prove range, highlight, thread, and Widget remain aligned.
6. Create overlapping comments and prove independent ids and correct overlap
   paint.
7. Run read-only review mode: comment writes succeed, document writes remain
   zero.
8. Exercise AI review comment output through the same thread action; no
   transient mark appears.
9. Exercise Suggestions beside Comments and prove each owner updates without
   waking or mutating the other.
10. Recheck Link open/edit/close after Comments activation without changing the
    accepted Link geometry behavior.
11. Reload a migrated legacy fixture and prove anchors/threads survive while
    every legacy document property is absent.

Use Browser for normal UI, DOM, selection, focus, paint controls, console, and
network checks. Use Chrome for copy/paste: default copied document content must
contain no external comment thread or hidden id. Run the final native
selection/focus/paint cases 5/5 without retry on the final source. Computer Use
is only a fallback if Chrome cannot expose the native clipboard state.

Final proof records the exact ref, fresh process, route, production/test/fixture/
harness SHA-256 fingerprints, and zero issue-owned runtime-input differences.
Unpushed local work is a candidate, never a shipped fix.

## Proof matrix

| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Current full architecture is 2.0/10 | Deterministic score receipt and live owner manifest | Re-run score after source refresh | pass |
| App/service owns thread truth | Target call shape and deletion map | No plugin thread state; action tests | specified |
| No public Comments runtime layer is needed | Existing Annotation/Widget exports and docs | Import smoke plus normal/custom/advanced examples | pass |
| Registry convenience does not duplicate truth | `useComments` responsibility boundary | Store/source audit and failure tests | specified |
| Serialized data is not lost silently | Fail-closed extractor contract | Migration property/fuzz fixtures | specified |
| Thread-body updates scale | Target 10k p95 0.644 ms with zero projection wake | Final production rerun | provisional green |
| Anchor-backed edits scale | Anchor-only 10k distributed 78.034 ms and same-leaf 834.897 ms | Slice 0 calibrated budgets | gated red |
| Suggestion and Link behavior survive | Consumer manifest and explicit boundaries | Focused tests plus Browser cases 9-10 | specified |
| Docs/release/agents teach only final API | Exact source owners listed | stale search, generators, MDX, route, parity | specified |
| Final browser behavior is real | Exact route/action/outcome matrix | Browser/Chrome final receipts and 5/5 ledger | specified |

## Verification commands

Focused Slice 0:

```bash
pnpm --filter plitejs typecheck:partition:core
pnpm --filter plitejs test:partition:core
pnpm --filter plitejs typecheck:partition:react
pnpm --filter plitejs test:partition:react
bun docs/plans/artifacts/hard-cut-comments-ownership/benchmark-comments-ownership.ts
pnpm check:plite:dev
```

Migration/package cut:

```bash
pnpm --filter platejs typecheck:partition:migrations
pnpm --filter platejs test:partition:migrations
pnpm --filter platejs typecheck:partition:core
pnpm --filter platejs test:partition:core
pnpm --filter platejs typecheck:partition:react-core
pnpm --filter platejs test:partition:react-core
pnpm brl
```

Registry/docs/release/agent closure:

```bash
pnpm --filter www build:source
pnpm --filter www check:docs
pnpm --filter www build:registry
node tooling/scripts/generate-ui-changelog-entries.mjs --write
node tooling/scripts/generate-ui-changelog-entries.mjs --check
pnpm install
```

Final closure:

```bash
pnpm check:plite
pnpm check
node .agents/skills/autogoal/scripts/check-complete.mjs \
  docs/plans/2026-08-31-hard-cut-comments-ownership.md
```

`pnpm run reinstall` is used once only if failures show the documented local
React/module-resolution corruption pattern. P1 `autoreview` is not run while
this checkout remains on `next`, per repo rule.

Completion Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Binary plan readiness | yes | Every design/adoption/proof choice is resolved; target adoption explicitly stops at Slice 0 |
| Fresh source evidence | yes | Live package/registry/docs/Plite/Anchor sources and parallel tasks read 2026-08-31 |
| Best API review | yes | Public Comments layer rejected; copied controller and raw advanced path fixed |
| Pre-acceptance scale proof | yes, gated | Current receipt is red and names the exact Slice 0 owner, budgets, and stop condition; target is not accepted |
| Production scale rerun contract | yes | Scale contract and Slice 5 name final command, cohorts, budgets, counters, and source identity |
| Conditional risk/adoption | yes | Every triggered docs/browser/migration/release/agent pack has an owner, slice, and proof |
| Public API/package proof | yes | Public break map and Slices 1/3/4 name exports, migration, barrels, release, and checks |
| Docs source-backed audit | yes | Docs closure names lane, pages, source owners, links, parser, and route proof |
| Required Unslop pass | yes | Slice 4 runs it after claims stabilize and before parser/route proof |
| Browser proof contract | yes | Browser section names route, cases, tools, stability, and fingerprints |
| Agent-native review | yes | Capability map names source rules, mirrors, discoverability, and proof |
| Registry changelog | yes | Release section names source entry, generator, check, and package split |
| P1 autoreview | n/a on `next` | Repo forbids it on `next`; owning proof and Plate Next attestation still run |
| Goal plan complete | yes | Mechanical checker command is recorded in Verification evidence |

Work Checklist:

- [x] Outcome, scope, non-goals, constraints, owners, and parallel exclusions are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Current score has a deterministic receipt, caps, confidence, and falsifiers.
- [x] Delete, merge, inline, and existing-owner counterfactuals were applied.
- [x] Normal, custom, advanced, and migration call sites are fixed.
- [x] Every decision row has owner, adoption, proof, risk, and verdict.
- [x] Every public break has an adoption or explicit deletion answer.
- [x] Serialized data has one tested migration path and no live fallback.
- [x] Scale variables, cohorts, baseline, target, counters, budgets, noise, privacy, and final rerun are recorded.
- [x] The failed scale target blocks adoption instead of being waived.
- [x] Package exports, configs, partitions, barrels, changeset, and tests are covered.
- [x] Registry source, generated output, install graph, changelog, and demo are covered.
- [x] Docs lane/topology, EN/CN pages, links, Unslop, MDX, and route proof are covered.
- [x] Browser/Chrome cases, console/network checks, 5/5 stability, and fingerprints are covered.
- [x] Agent source rules, generated mirrors, Vision owner, and stale examples are covered.
- [x] Execution slices are ordered so no wrong live path survives a slice exit.
- [x] Final handoff names the one user-attention gate.

## Conditional evidence

- High-risk scenarios: legacy orphan ids; drafts/transients in stored documents;
  discontinuous one-id ranges; remote adapter serialization; Anchor deletion;
  transaction discard; collaboration moves; async action rejection; overlap;
  read-only comment writes; Suggestions coexistence; Link focus; static output;
  clipboard; 10k distributed and co-located Anchors. Each is assigned above.
- External research: N/A. Current Plate/Plite source, Vision, executable examples,
  and measured runtime decide this internal ownership cut.
- Issue/PR provenance: N/A. No public issue or PR backs this request.
- Reporter-visible bug proof: N/A. This is an architecture cut; exact target
  browser behavior is still mandatory during implementation.
- Production detector: N/A. No telemetry is added; privacy-safe deterministic
  counters and local benchmark receipts own performance proof.

## Findings

- The package Comment plugin is not an incomplete Comments feature. It is a
  document-mark subsystem pretending that app-owned threads belong in schema.
- `discussionPlugin` is worse: its own comment says it is UI-only while it owns
  users and the complete mutable thread collection.
- The block index optimization reduced repeated work but preserved the wrong
  dependency: any thread-array identity or relevant editor commit still rebuilds
  global derived state.
- Existing Plite Annotation/Widget APIs already express the correct runtime and
  are already proxied through `platejs/react`.
- The proposed owner graph makes thread-body updates roughly two orders of
  magnitude cheaper at 10k, but real Anchors expose a separate core bottleneck.
- Anchor listener fan-out, not Annotation reprojection, owns the pathological
  failure. That repair is the honest first slice.
- A registry-local family controller is justified; a public Comments runtime
  layer is not.
- The current `plate-review` skill successfully reproduces this 2/10 audit, but
  several agent examples still cite APIs this cut deletes.

## Decisions and tradeoffs

- Keep `/docs/comment` as the canonical route; delete `/docs/discussion` rather
  than preserving two pages for one system.
- Keep `block-discussion` only if its remaining Suggestions/UI job still matches
  the name after Comments removal. Otherwise rename it in Slice 2 with full
  registry adoption; do not decide from the old mixed implementation.
- Default clipboard/serialization excludes external comments. Products that
  need portable comments opt into a document-id adapter explicitly.
- Local `editor.anchor` is acceptable for demos and one editor lifetime. It is
  not sold as durable remote storage.
- The migration helper is Comments-specific because serialized data is a hard
  law. No other compatibility surface survives.
- The 10k total frame budget was invalid as an absolute target once the matched
  base failed it. The calibrated relative budget remains demanding and still
  rejects current Anchor performance.

## Review fixes

- Reconstructed and bounded the active Selection, Link, and Find work before
  choosing Comments files.
- Fixed the first benchmark fixture by installing the live
  `BaseCommentPlugin`; the closed schema correctly rejected raw legacy keys.
- Added a base-editor control after the initial 10k target failure.
- Added isolated Annotation reprojection to separate projection work from editor
  commit work.
- Added an Anchor-only control, which located the dominant fan-out in Plite
  Anchor state.
- Rejected the first absolute 10k budget as an adoption criterion only after
  preserving its failure and proving the matched base cannot meet it; froze the
  calibrated next-run budget before any repair.

## Error attempts

| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Benchmark fixture used legacy comment properties without their closed-schema owner | 1 | Install the live `BaseCommentPlugin` in the current baseline only | Baseline became valid; target stayed schema-free |
| Initial target mixed base editor, Anchor, and Annotation time | 1 | Add plain-editor and isolated Annotation controls | Proved isolated Annotation meets its budgets |
| Base/Annotation controls did not isolate live Anchor mapping | 1 | Add 10k Anchor-only controls | Proved Anchor listener fan-out owns most red work |
| Broad source grep included generated output and truncated | 1 | Restrict later manifests to source owners and bounded line ranges | No decision relies on truncated generated output |
| `pnpm exec biome check` could not find a Biome binary | 1 | Use the repo formatter instead of assuming one | Switched to Oxfmt |
| Ultracite excluded the disposable docs artifact | 1 | Format the file through Oxfmt stdin and compare output | No formatting diff |
| Oxfmt forbids `--check` with stdin | 1 | Pipe formatted stdout into `diff -u` | Exit 0; artifact is formatted |

Verification evidence:

- `plate-review-score.mjs` -> `2.0/10`, raw `2.5`, confidence `96`, final
  wrong-owner/duplicate-truth/wrong-lifetime caps.
- Benchmark source executes against current production owners and records
  environment, samples, packet noise, counters, source hashes, and git ref.
- Owner-isolation benchmark -> red target rows at 10k distributed and 10k
  same-leaf; thread updates and isolated Annotation projection green.
- Oxfmt stdin output versus the benchmark source -> no diff; only the repo's
  existing module-type warning was emitted.
- Current package exports, registry writes, docs teaching, Plite APIs, Anchor
  fan-out, consumer files, and generated owners were source-audited.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-08-31-hard-cut-comments-ownership.md` -> complete on
  2026-08-31 after the final source/receipt update.
- No Comments implementation, changeset, changelog, generated registry output,
  commit, push, or PR was produced in this planning run.

## Final handoff prepared

- Ownership and target API: app/service threads -> anchor adapter -> existing
  Annotation/Widget -> copied `useComments` family.
- Public breaks: both package entrypoints, document properties, plugins, kits,
  utilities, codecs/static component, and Discussion data plugin are deleted.
- Persisted data: one fail-closed extractor under `platejs/migrations`.
- Execution order: Anchor scale, migration, atomic registry cut, package
  deletion, docs/release/agent repair, final proof.
- User attention: approve the plan, but expect Slice 0 to stop the run unless
  the Anchor budgets pass. Do not authorize later slices around a red receipt.

## Timeline

- 2026-08-31: reconstructed parallel tasks and isolated active source owners.
- 2026-08-31: completed current full-plugin manifest and deterministic 2/10 score.
- 2026-08-31: ran initial, base/Annotation, and Anchor-only benchmark passes.
- 2026-08-31: fixed the no-public-Comments-layer API and full execution plan.

Reboot status:

| Question | Answer |
| --- | --- |
| Where am I? | Planning handoff complete; implementation not started |
| Where am I going? | Slice 0 Anchor scalability, only after user approval |
| What is the goal? | Delete wrong Comments owners without losing persisted data or accepting a slow replacement |
| What have I learned? | Current architecture is 2/10; Annotation is correct; Anchor listener fan-out is the first blocker |
| What have I done? | Read parallel plans/current source, scored the system, designed the API, measured scale, and wrote all adoption/proof slices |

Open risks:

- Slice 0 may require a deeper Plite Anchor registry redesign than a local
  optimization; the public Anchor contract must remain unchanged.
- Legacy documents may contain orphan, transient, or discontinuous comment
  properties. The extractor must stop and report them, not guess.
- The active Link task may move the exact coupling line before execution;
  Comments removes the dependency from its final owner, not from stale code.
- Applications need an external durable-position adapter for reload and
  collaboration. Local Anchors alone do not satisfy that product requirement.
- Static review rendering after the cut needs supplied application annotations;
  document-only rendering intentionally cannot reconstruct threads.
