# Comments architecture hard cut

## Execution activation

- [x] The user explicitly authorized production execution on 2026-09-02.
- [x] Execute the accepted architecture without reopening alternatives.
- [x] Keep Comments implementation in scope; do not start a different editor
      feature.
- [x] Do not commit or push without a separate explicit instruction.
- [x] Close Plite, Plate package, registry UI, integration, docs, generated,
      release, benchmark, browser, collaboration, migration, and stale-surface
      proof before claiming completion.

## Planning activation requirements (closed)

- [x] Finalize Comments only; do not implement production Comments code in this
      run.
- [x] Consume the completed canonical Plite/Plate rendering contract instead
      of replanning it.
- [x] Choose one public authoring path. Do not leave callers a menu of plugin,
      provider-prop, raw render callback, or editor-store alternatives.
- [x] Keep a Comments plugin only for its independent editor-integration job;
      keep thread data outside the editor.
- [x] Show how application data reaches decoration, sibling UI, and commands
      without subscribing the editor root.
- [x] Decide whether Comments needs public helpers. Reject helpers that expose
      internals or duplicate the plugin API.
- [x] Reuse plugin `decorate` and structural slots. Do not recreate
      `renderSegment`, `render.segment`, or removed Plate `render*` props.
- [x] Require executable scale proof for the annotation index and every
      subscription boundary.
- [x] Include the hard cut, exact owners, adoption order, migration policy,
      browser/collaboration proof, and final public call.
- [x] Stop after the ready plan and require explicit acceptance before
      production implementation.

Objective:
Ship the Comments hard cut; done when every proof gate in this plan passes and
stale APIs are zero.

Flow mode:
existing package plus React/registry

Goal plan:
`docs/plans/2026-08-31-hard-cut-comments-ownership.md`

Template:
`docs/plans/templates/plate-feature.md`

Primary template:
`docs/plans/templates/plate-feature.md`

Applied packs:

- `package-api`
- `docs`
- `browser`
- `registry-changelog`
- `performance-observability`

Linked plans:

- None.

Mode:

- Existing `platejs` package plus React/registry, with a disposable executable
  scale probe and two completed production-path reruns.

## Decision

Keep Comments as a Plate plugin, but cut almost everything currently called
Comments or Discussion.

The plugin survives because it owns one independent editor capability:

- resolve durable comment anchors against an editor;
- adapt those annotations into plugin `decorate` attributes;
- own editor-local `activeId`;
- create a correctly associated local anchor from a selection;
- answer comment range and overlap queries;
- handle comment-highlight interaction and source cleanup.

The application owns everything else: thread bodies, replies, users,
permissions, status, persistence, optimistic actions, and durable anchor
storage. Copied registry UI owns forms, draft body state, panels, product
actions, and narrow application subscriptions.

Delete these false owners:

- document properties `comment`, `comment_*`, `comment_draft`, and transient
  comment marks;
- `BaseCommentPlugin`, mark codecs, mark helpers, and document mutation APIs;
- `discussionPlugin`, `DiscussionKit`, and its editor store;
- source-less `CommentPlugin` and static `CommentKit` alternatives;
- `CommentLeaf` and every per-range React renderer;
- `comment-static.tsx` and the mark-based static kit;
- the combined `BlockDiscussion` wrapper and whole-document discussion index.

Do not add a public generic projection, adapter registry, Comments provider,
thread store, or backend interface to Plate. The missing reusable primitive is
smaller: Plite Annotation must expose its existing node-key index and publish
affected node keys.

## Harsh current-state verdict

The current architecture scores **2.0/10**. It has three fatal caps:
wrong owner, duplicate truth, and wrong lifetime. Thread data lives in an
editor plugin, anchor identity lives in text marks, and UI rebuilds a global
document/discussion index. A body edit can therefore touch editor-scale work
even though no document range changed.

The accepted target is **10/10 in production**. The complete proof matrix
passes, and no compatibility path receives partial credit.

Completion threshold:

This plan is ready when one public setup, one ownership graph, one Plite
prerequisite, the full deletion cone, the serialized-data migration, the scale
budgets, and every production proof are explicit.

Implementation is complete only when:

- Plite Annotation exposes indexed node reads and exact old/new affected keys;
- `platejs/comments/react` is the sole Comments package entrypoint;
- comment marks and the Discussion plugin are absent from live source;
- registry Comments uses an application channel with narrow subscriptions;
- AI comments, Suggestion, Link, toolbars, examples, and tests use the same
  owner model;
- the production implementation passes both benchmark runs and the browser,
  collaboration, migration, type, package, and stale-surface gates;
- generated registry output, barrels, docs, and release artifacts match source.

Verification surface:

- Current owner evidence:
  `packages/platejs/src/features/comment/lib/BaseCommentPlugin.ts`,
  `apps/www/src/registry/components/editor/comment.tsx`,
  `apps/www/src/registry/components/editor/discussion.tsx`, and
  `apps/www/src/registry/components/editor/block-discussion.tsx`.
- Reusable runtime evidence:
  `packages/plitejs/src/annotations/index.ts` and
  `packages/plitejs/src/internal/view/stable-id-mapped-source.ts`.
- Canonical rendering evidence:
  `packages/platejs/src/lib/plugin/BasePlugin.ts`,
  `packages/platejs/src/internal/plugin/getPlateDecorationSources.ts`, and
  `apps/www/src/registry/components/editor/find.tsx`.
- Architecture score:
  `docs/plans/artifacts/hard-cut-comments-ownership/plate-review-score.json`.
- Scale probe and receipts:
  `docs/plans/artifacts/hard-cut-comments-ownership/benchmark-comments-ownership.ts`,
  `benchmark-comments-ownership-current-final.json`, and
  `benchmark-comments-ownership-current-repeat.json`.
- During implementation: Plite and Plate package tests, type inference tests,
  migration fixtures, standalone registry demos, two-editor collaboration,
  browser interaction, generated registry output, and repository checks.

Constraints:

- One hard cut. No alias, shim, dual read, mark fallback, source-less plugin,
  runtime migration, or deprecated singular entrypoint.
- One normal package call: `createCommentsPlugin({ anchors })`.
- Runtime sources stay in the plugin factory closure. They never enter
  `initialState` or a raw `Plate` prop.
- Thread data never enters a Plate plugin store or Decoration attributes.
- Decoration paints attributes only. React UI uses plugin slots and copied UI.
- The editor root never subscribes to thread bodies or the thread collection.
- A thread body edit causes zero annotation resolves, decoration refreshes, or
  editor-node wakes.
- Preserve native editing, overlapping comments, multiple editors, read-only
  review, collaboration, and recoverable serialized-data migration.

Boundaries:

- Plite Annotation owns durable logical-range resolution and its node-key
  index.
- Plate Comments owns editor integration and annotation-to-decoration
  adaptation.
- The application owns durable comment truth and actions.
- Registry `comment.tsx` owns the reference UI and demo channel.
- Suggestion remains an independent document-mutation plugin.
- `platejs/migrations` owns one offline extractor for legacy marks.
- This run executes the accepted plan. It does not commit, push, release, or
  update external trackers without separate authority.

Output budget strategy:

- Read exact owners and bounded manifests; exclude generated output, build
  artifacts, logs, `node_modules`, `.next`, `.turbo`, and historical corpora
  unless a named proof requires them.
- Count or list matching files before printing matches. Cap ordinary source
  reads and save broad proof to plan artifacts instead of streaming it.

Feature Manifest:

| Surface | Applies | Owner | Artifacts | Consumer | Proof | Status |
| -------------------------- | ------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------- | ------------------------------------------- |
| API                        | yes     | `best-api` / `plate-plugin-creator` | `platejs/comments/react`, Plite Annotation change contract, `platejs/migrations` extractor                    | Plate applications         | type probes, public export audit, stale audit                          | complete                                    |
| Package                    | yes     | `plate-plugin-creator`              | `packages/plitejs`, `packages/platejs`                                                                        | package consumers          | focused type/tests, manifests, entrypoint DAG, packed artifacts        | complete                                    |
| React adapter              | yes     | `plate-ui` / `plate-plugin-creator` | Comments descriptor decoration, event delegation, `afterEditable` slot                                        | mounted Plate editors      | lifecycle, static, DOM, inference tests                                | complete                                    |
| Registry UI                | yes     | `plate-ui`                          | owner-first `comment.tsx`, toolbar, focused demo                                                              | copied registry consumers  | registry tests and Browser                                             | complete                                    |
| Composition                | yes     | `plate-ui`                          | app-owned channel plus one factory descriptor; migrated AI, Link, Suggestion, editor compositions             | WWW editors and examples   | type/runtime tests and bounded source audit                            | complete                                    |
| Scale proof                | yes     | `benchmark`                         | frozen disposable receipts and final production receipts                                                      | users/maintainers          | unchanged budgets, deterministic counters, correctness guard, two runs | complete                                    |
| Registry metadata/examples | yes     | `plate-ui`                          | registry metadata, focused demo, examples, generated registry output                                          | registry installers        | registry build and demo route                                          | complete                                    |
| Docs                       | yes     | `docs-creator`                      | current Comments setup, external channel, migration, collaboration/read-only guidance                         | package and registry users | source-backed claim audit, docs build, Unslop                          | complete                                    |
| Release artifacts          | yes     | `changeset` / `registry-changelog`  | package changesets and registry changelog source/generated output                                             | package and registry users | changeset audit and changelog generator checks                         | complete                                    |
| Proof                      | yes     | `plate-feature`                     | proof matrix and command receipts in this plan/artifact folder                                                | maintainers                | focused then closure commands                                          | complete                                    |
| Plate Next attestation     | no      | `plate-next`                        | N/A: focused feature change inside the existing `platejs` host; do not manufacture a full-package attestation | maintainers                | N/A: preserve the current package attestation unchanged                | N/A: focused change, no full-package review |
| Review/handoff             | yes     | manual P1 review / `autogoal`       | bounded review, feature checker, goal checker, final evidence                                                 | user                       | accepted findings closed and both checkers pass                        | complete                                    |

## Package boundary contract

| Contract                      | Decision                                                                                                                   | Evidence                                                    |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| shared Plate host             | N/A: Comments is an entrypoint inside `packages/platejs`, not a new peer package                                           | package manifest and entrypoint DAG audit                   |
| Plite ownership               | only `packages/platejs` may adapt Plite Annotation for Plate Comments                                                      | import audit plus `pnpm test:manifests`                     |
| external dependency ownership | no new external dependency; reuse the host's required `plitejs` dependency                                                 | manifest diff and packed-entrypoint proof                   |
| entrypoint runtime            | sole `platejs/comments/react` entrypoint is `client`; no headless Comments entrypoint survives                             | entrypoint DAG, generated Turbo/type config, SSR/pack proof |
| Oxlint coverage               | existing `packages/platejs/src/react/**` coverage must include the new owner; update only if the scoped audit proves a gap | scoped lint and config audit                                |

## Package file evidence

- Package: N/A for Plate Next attestation; this is a focused change inside the
  existing `packages/platejs` host.
- Manifest command / file count: N/A; changed-file evidence is recorded in the
  final verification section instead of pretending to review the full host.
- Package fingerprint: N/A; preserve the current package attestation.

## Execution phase state

- current phase: Slice 5 complete
- status: complete
- next phase: none; await separate commit or push authority

## Execution start gates

| Gate                                           | Applies | Evidence                                                                                                           |
| ---------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------ |
| Feature Manifest complete before source writes | yes     | every applicability, owner, artifact, consumer, proof, and initial status row above is resolved                    |
| Flow mode selected                             | yes     | one-shot execution                                                                                                 |
| Public API decision owner selected             | yes     | accepted `best-api` target in Sole package API and Public API score gate                                           |
| Runtime scale applicability resolved           | yes     | performance pack selected; runtime index/subscription behavior changes                                             |
| Pre-acceptance Benchmark receipt selected      | yes     | frozen script hash, two receipts, cohorts, budgets, counters, timing, and correctness guard in Measured scale gate |
| Manual package decision recorded               | yes     | new React subpath inside existing `platejs`; no new package                                                        |
| Conditional packs selected                     | yes     | package-api, docs, browser, registry-changelog, performance-observability                                          |
| Active goal checked or created                 | yes     | active goal created for this exact plan on 2026-09-02                                                              |

## Selected pack start gates

| Gate                                           | Applies                                                          | Evidence                                                                                                                          |
| ---------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Package/API pack selected                      | yes                                                              | `package-api` is materialized above                                                                                               |
| Public surface and package boundary identified | yes                                                              | sole `platejs/comments/react` plus the package boundary contract                                                                  |
| Release artifact path selected                 | yes                                                              | breaking `platejs` changeset plus registry changelog source                                                                       |
| Barrel/export impact recorded                  | yes                                                              | exported subpath changes require `pnpm brl` and entrypoint generation                                                             |
| Docs pack selected                             | yes                                                              | current Comments docs and migration teaching are required                                                                         |
| Docs lane and owner selected                   | yes                                                              | `docs-creator`; targets are inventoried before Slice 4 writes                                                                     |
| Browser pack selected                          | yes                                                              | focused standalone Comments demo route                                                                                            |
| Browser tool selected                          | yes                                                              | in-app Browser for normal DOM/interaction proof; Chrome only if native browser UI becomes relevant                                |
| Console/network policy                         | yes                                                              | inspect both; record unrelated failures instead of hiding them                                                                    |
| Observable browser case                        | yes                                                              | create, cancel, submit, overlap, activate, reply/edit/delete/resolve, read-only, two-editor, source failure/retry, keyboard/focus |
| Registry changelog pack selected               | yes                                                              | user-visible copied UI is rebuilt                                                                                                 |
| Registry changelog source path selected        | yes                                                              | create one source entry under `apps/www/src/registry/changelog/entries/`; exact id chosen after live inventory                    |
| Registry generator commands selected           | yes                                                              | `--write`, then `--check`; test only if generator/schema changes                                                                  |
| Performance pack selected                      | yes                                                              | Annotation index and subscription fan-out change                                                                                  |
| Operation and runtime owner identified         | yes                                                              | anchor hydration/movement and body edit; Plite Annotation reverse index plus Plate Decoration observer                            |
| Scale variables and cohorts fixed              | yes                                                              | 100/1,000/10,000 distributed anchors plus 10,000 on one node                                                                      |
| Budget frozen before target measurement        | yes                                                              | unchanged budgets in Measured scale gate                                                                                          |
| Baseline and target probe selected             | yes                                                              | current mark/discussion path versus disposable Annotation target; production path replaces the prototype for closure              |
| Correctness guard selected                     | yes                                                              | exact invalidation, overlaps, thread isolation, native editing, migration, and lifecycle proof matrix                             |
| Production detector decision                   | N/A: library path has no production telemetry owner in this repo | deterministic benchmark and Browser counters own this change                                                                      |

Blocked condition:

Stop implementation if the Plite prerequisite requires a second public
projection store, if production code cannot match the frozen scale budgets, or
if serialized comment IDs cannot be extracted without silent loss. Do not mask
any of those failures with the old mark model.

## Before and after

### Before

```tsx
const editor = useCreateEditor({
  plugins: [...EditorKit, ...DiscussionKit, ...CommentKit],
});

editor.plugin(discussionPlugin).store.set({ discussions });

editor.update((tx) => {
  tx.nodes.set({
    comment: true,
    [getCommentKey(discussion.id)]: true,
  });
});
```

This creates two truths and three lifetimes for one comment: document marks,
an editor-owned thread store, and React UI state.

### Canonical target

```tsx
import { createCommentsPlugin } from "platejs/comments/react";

const comments = useCommentsChannel(documentId);
const commentsPlugin = React.useMemo(
  () =>
    createCommentsPlugin({ anchors: comments.anchors }).configure({
      slots: { afterEditable: CommentsSidebar },
    }),
  [comments.anchors]
);

const editor = useCreateEditor({
  plugins: [...EditorKit, commentsPlugin],
});

return (
  <CommentsProvider channel={comments} plugin={commentsPlugin}>
    <Plate editor={editor}>
      <Editor />
    </Plate>
  </CommentsProvider>
);
```

`CommentsProvider` and `useCommentsChannel` are copied application code. They
are not Plate package APIs. `comments.anchors` has stable identity for one
editor lifetime. Changing documents creates a new channel and editor instead
of mutating plugin configuration.

## Sole package API

Only `platejs/comments/react` survives.

```ts
export type CommentAnchor = Readonly<{
  anchor: PliteAnnotationAnchor;
  id: string;
}>;

export type CommentAnchorSource = Readonly<{
  getSnapshot: () => readonly CommentAnchor[];
  subscribe: (listener: (ids: readonly string[] | "all") => void) => () => void;
}>;

export type CommentsPluginState = Readonly<{
  activeId: string | null;
}>;

export const createCommentsPlugin = (input: { anchors: CommentAnchorSource }) =>
  definePlatePlugin("comments", {
    /* The factory closure owns input.anchors for the editor lifetime. */
  });
```

The factory returns the exact descriptor callers install and pass to
`editor.plugin`. There is no exported source-less `CommentsPlugin`,
`BaseCommentsPlugin`, default source, `CommentsKit`, or base
`platejs/comments` entrypoint. After marks disappear, a headless base plugin
has no honest job.

The descriptor exposes one scoped service:

```ts
const comments = editor.plugin(commentsPlugin);

const anchor = comments.api.createAnchor(range); // null for no valid range
comments.api.setActive(threadId);
const ids = comments.api.idsAt(location);
const range = comments.api.range(threadId);
```

API laws:

- `createAnchor(range?)` uses the current non-collapsed selection when `range`
  is omitted and creates `editor.anchor(range, { association: "inward",
deletion: "drop" })`.
- The copied UI owns that anchor until cancel or successful transfer to its
  application channel. It releases failed or cancelled anchors.
- `setActive` is the only normal write to editor-local Comments state.
- `idsAt` and `range` query the runtime annotation owner, so they belong to
  `api`, not document-snapshot `read`.
- The descriptor has no `update` tree because Comments never mutates the
  document.
- `activeId` is the only plugin state. Hover uses CSS. Draft body, form state,
  pending anchor ownership, permissions, and failures stay in copied UI.
- Package free functions do not duplicate these methods. The only standalone
  helper is the offline legacy extractor under `platejs/migrations`.

The anchor source emits only anchor membership or position changes. It does
not emit for body, reply, user, permission, or status changes. If product
policy hides resolved comments, the application changes visible source
membership; it does not push thread records into Decoration.

## Plite prerequisite: expose the index already owned by Annotation

The current Annotation store already maintains `idsByOutputKey` inside
`createStableIdMappedSource`. Shipping another Comments projection index would
be indefensible duplication.

The imperative owner is exported from `plitejs/annotations` for framework
adapters whose lifetime starts before React mounts. React applications keep
`usePliteAnnotationStore` and `PliteAnnotationProvider`; `plitejs/react` does
not export the constructor, and no `/internal` package entrypoint exists.

Hard-cut the existing ids-only notification to this contract:

```ts
export type PliteAnnotationChange = Readonly<{
  ids: readonly string[];
  nodeKeys: readonly NodeKey[];
  reason: "annotation" | "editor" | "external" | "refresh";
}>;

export interface PliteAnnotationStore<TData = unknown> {
  getAnnotationsAt(nodeKey: NodeKey): readonly PliteResolvedAnnotation<TData>[];
  subscribeChanges(
    listener: (change: PliteAnnotationChange) => void
  ): () => void;
}
```

Implementation laws:

- `getAnnotationsAt` reads the existing reverse index in source order; it does
  not scan `allIds`.
- `nodeKeys` is the exact union of old and new affected text-node keys.
- `reason` preserves the caller's refresh reason and names automatic document
  mapping as `"editor"`.
- An offset-only range move inside the same text node still reports that key.
- Add/remove, invalidation to `null`, multi-node movement, order change, and
  data change report every affected key once.
- Extend the private mapped-source refresh result with affected output keys if
  needed. Do not expose the generic mapped-source kernel.
- Update Widget, Annotation hooks, docs, and the Plite comment-mode example to
  consume the object payload in the same hard cut.
- No `Projection`, adapter store, Comments-specific index, or second
  subscription graph is added.

## Plugin runtime

`createCommentsPlugin` captures the stable anchor source and keeps one private
owner per editor. The plugin API factory creates the Annotation store before
the React Decoration manager mounts, so its editor-commit listener runs first.
The owner lives for the editor lifetime in a factory-local `WeakMap`.
`decorate.observe` attaches one mounted source subscription plus its narrow
change subscriptions; cleanup detaches those subscriptions without destroying
the editor-lifetime owner. Remount performs one full source refresh before
paint. StrictMode must not leave a destroyed owner or a duplicate observer.

`decorate.read` does this for each text entry:

1. Resolve its stable `NodeKey`.
2. Read only `annotationStore.getAnnotationsAt(nodeKey)`.
3. Intersect each resolved range with the current text range.
4. Return one keyed attribute decoration per comment and text node.

Decoration keys are `${commentId}:${nodeKey}`. Attributes are limited to a
class, `data-comment-id`, and an active marker. Thread bodies and product state
never enter the DOM attributes.

`decorate.observe` connects three narrow changes:

- anchor-source IDs call `annotationStore.refresh({ ids })`, or a full refresh
  for the explicit value `"all"`;
- non-editor Annotation changes call Decoration `refresh({ nodeKeys })`;
- `activeId` changes refresh only the old and new comment node keys.

Annotation maps a document commit first. The Decoration manager then performs
its built-in changed-node refresh against that current snapshot. The Comments
observer ignores `reason: "editor"`, preventing a second Decoration refresh.
Subscription-order and one-refresh counters are required tests, not timing
assumptions. A thread body edit does not touch this graph. Static rendering
uses the same `decorate.read` snapshot when an application explicitly installs
the factory with a snapshot source; it never runs `observe`.

Root event delegation reads `data-comment-id` and updates `activeId`. Nested
overlaps remain deterministic by annotation source order. `idsAt` exposes the
full overlap set for panels and keyboard interaction. No leaf component or
per-comment React subscription is created inside editor text.

## Owner and lifetime graph

```text
application Comments channel                         application lifetime
  ├─ threads, replies, permissions, users, status, actions
  └─ stable CommentAnchorSource
       └─ createCommentsPlugin factory closure       editor lifetime
            └─ private Plite Annotation store
                 ├─ node-key membership index
                 └─ plugin decorate attributes      mounted text lifetime

copied CommentsProvider                              mounted UI lifetime
  ├─ plugin descriptor and local pending anchor
  ├─ thread-list membership subscription
  └─ per-thread and per-user subscriptions

Comments plugin store
  └─ activeId only
```

Other stores do not combine with Comments. Each feature observes its own
source. Shared identity comes from the existing editor runtime or application
auth owner. Suggestion does not read the Comments channel, and Comments does
not read Suggestion state.

## Registry target

Keep one owner-first `comment.tsx` module for the copied Comments feature. Do
not create `comment-plugin.ts`, `comment-store.ts`, `comment-index.ts`, or a
second Discussion item.

`comment.tsx` owns:

- the demo `CommentsProvider` and channel implementation;
- pending-anchor ownership and cleanup;
- thread cards, forms, panel, narrow selectors, and demo fixtures;
- application actions for create, reply, edit, delete, and resolve.

The editor composition owns the configured descriptor instance because it
owns both the channel and editor lifetime. Static `EditorKit` excludes
Comments. The composition appends its one factory-created descriptor exactly
as shown in the canonical target; do not add `createEditorKit` or `CommentsKit`
factories.

Independent installable UI such as `comment-toolbar-button.tsx` may remain a
separate registry item. It calls the controller from `comment.tsx`; it does not
mutate marks.

Delete `discussion.tsx`. Move demo thread fixtures and UI selectors into the
application channel in `comment.tsx`. User identity comes from
`editor.runtime.userId` plus application profile lookup, not another editor
plugin.

Delete `block-discussion.tsx` and
`apps/www/src/registry/lib/block-discussion-index.ts`. That combined wrapper is
the source of the unacceptable whole-document fan-out. Move suggestion cards
to `suggestion.tsx`; render comment threads in the Comments sibling panel.
Suggestion keeps its own plugin and mutation semantics.

Adopt every current consumer:

- `comment-toolbar-button.tsx`: create and retain a pending anchor through the
  copied Comments controller.
- `link.tsx`: read `activeId` through the installed descriptor/context.
- `ai-menu.tsx` and `use-chat.ts`: create a thread and anchor through the same
  channel; remove transient comment marks and cleanup calls.
- `suggestion.tsx`: stop reading `discussionPlugin`; use its own state and the
  existing runtime user identity.
- editor kits: remove Comment and Discussion membership; the channel-owning
  editor composition appends the factory-created descriptor.
- values and fixtures: remove `comment` and `comment_*` properties after the
  migration fixture proves extraction.
- docs, package integration tests, API manifests, registry metadata, and
  generated output: teach only the new path.

## Serialized-data migration

Runtime compatibility is forbidden, but existing serialized user data needs a
loss-visible offline conversion.

Add `extractLegacyCommentRanges` to `platejs/migrations`. It returns:

- a sanitized document with every legacy comment, draft, and transient
  property removed;
- ordered `{ id, ranges }` groups for application import;
- diagnostics for anonymous `comment` marks, orphan IDs, draft-only ranges,
  discontinuous groups, invalid ranges, and thread IDs missing from the
  supplied thread inventory.

Migration laws:

1. Preserve overlaps and every disjoint range for one ID.
2. Never invent a thread ID or silently discard an unidentifiable mark.
3. Let the application convert extracted ranges to its durable anchor format.
4. Fingerprint input and output before committing document and thread-channel
   writes as one application migration.
5. Keep the extractor idempotent on sanitized documents.
6. Remove the legacy Markdown comment codec. Markdown without recoverable IDs
   is diagnostic input, not a live fallback.

## Hard-cut ledger

| Surface                              | Verdict          | Replacement                                      |
| ------------------------------------ | ---------------- | ------------------------------------------------ |
| `platejs/comment`                    | delete           | none                                             |
| `platejs/comment/react`              | delete           | `platejs/comments/react`                         |
| `BaseCommentPlugin`                  | delete           | no base plugin                                   |
| source-less `CommentPlugin`          | delete           | `createCommentsPlugin({ anchors })`              |
| comment mark schema/codecs/helpers   | delete           | external anchors plus offline migration          |
| document comment update/read trees   | delete           | scoped Comments API and app actions              |
| `CommentLeaf`                        | delete           | plugin `decorate` attributes                     |
| `comment-static.tsx`                 | delete           | same factory/read path when explicitly installed |
| `discussionPlugin` / `DiscussionKit` | delete           | application channel/context                      |
| `BlockDiscussion` and global index   | delete           | Comments sibling panel; Suggestion-owned UI      |
| Comments plugin                      | rebuild and keep | editor integration only                          |
| `decorate`                           | keep             | canonical annotation-to-attribute paint          |
| plugin `slots.afterEditable`         | keep             | complete copied Comments UI                      |
| public Comments helpers              | reject           | scoped plugin API only                           |
| legacy extractor                     | add              | `platejs/migrations` offline-only helper         |

## Public API score gate

| Gate                    | Target | Reason                                                                                           |
| ----------------------- | ------ | ------------------------------------------------------------------------------------------------ |
| Canonicality            | PASS   | one factory, one source, one installed descriptor                                                |
| Ownership               | PASS   | plugin owns editor integration; app owns thread truth                                            |
| Lifetime                | PASS   | factory/editor, UI, mounted text, and app lifetimes stay distinct                                |
| Noun economy            | PASS   | no base plugin, Discussion plugin, Projection, adapter registry, or package provider             |
| Impossible states       | PASS   | a Comments descriptor cannot exist without an anchor source                                      |
| Type inference          | PASS   | factory, plugin portal, decorate callbacks, source, and slots infer without callback annotations |
| Multi-store composition | PASS   | source-local observation; no parent or combined-store subscription                               |
| Scale                   | PASS   | indexed node reads and exact old/new refresh keys                                                |
| Static/collaboration    | PASS   | same read path; external anchors can serve multiple synchronized editors                         |
| Teachability            | PASS   | one setup snippet and no compatibility fork                                                      |

Final production score: **10/10**. Every row in the proof matrix is green, the
old public surfaces are absent from live source, and both production scale
owners pass twice.

## Measured scale gate

The current-source disposable probe compares the current mark/discussion index
with an Annotation-backed target across 100, 1,000, and 10,000 distributed
threads plus 10,000 anchors on one text node.

Frozen budgets:

- cold hydration max: 250 ms;
- distributed warm p95: 16.67 ms;
- distributed Annotation overhead above controls: 5 ms p95;
- 1,000 to 10,000 growth: at most 15x;
- pathological warm p95: 100 ms;
- thread body edit: no annotation resolve, node wake, or Decoration refresh.

Two formatted-source runs pass:

| Receipt                                            |  Worst distributed p95 |  Worst pathological p95 | Correctness failures | Red target rows |
| -------------------------------------------------- | ---------------------: | ----------------------: | -------------------: | --------------: |
| `benchmark-comments-ownership-current-final.json`  | 91.582 ms cold hydrate | 71.835 ms document edit |                    0 |               0 |
| `benchmark-comments-ownership-current-repeat.json` | 85.051 ms cold hydrate | 92.841 ms document edit |                    0 |               0 |

At 10,000 distributed threads, a body edit is 0.0005 ms p95 with zero
annotation or node wakes. A one-anchor document edit resolves one annotation
and wakes one node. The one-node pathological row necessarily revisits all
10,000 anchors but remains below 100 ms in both runs.

The probe's `CommentAnnotationProjection` remains disposable upper-bound code
and is not shipped. Production exposes the reverse index already inside Plite
Annotation, omits the duplicate class, and passes the exact receipt twice with
unchanged budgets.

The production Plite Annotation and Plate Comments path passes the unchanged
budgets twice:

| Receipt                                               | Worst distributed p95 | Worst pathological p95 | Correctness failures | Red rows |
| ----------------------------------------------------- | --------------------: | ---------------------: | -------------------: | -------: |
| `benchmark-comments-ownership-production-final.json`  |             64.134 ms |              70.401 ms |                    0 |        0 |
| `benchmark-comments-ownership-production-repeat.json` |             57.122 ms |              69.070 ms |                    0 |        0 |

The copied application channel also passes two 10,000-subscriber runs. Each
run performs 1,000 body edits and wakes exactly the target thread once per
edit, with zero unrelated thread, pending, visible-list, or current-user wakes.

| Receipt                                             | Body-edit p95 | Target wakes | Unrelated wakes | Verdict |
| --------------------------------------------------- | ------------: | -----------: | --------------: | ------- |
| `benchmark-comments-channel-production-final.json`  |     0.0018 ms |        1,000 |               0 | green   |
| `benchmark-comments-channel-production-repeat.json` |     0.0021 ms |        1,000 |               0 | green   |

## Execution slices

### Slice 0: freeze the contract

- Add type-only call probes for the factory, source callbacks, scoped API, and
  dynamic descriptor use in copied UI.
- Preserve the current benchmark script and both accepted receipts.
- Add red tests for same-node offset movement, old/new node keys, and zero
  thread-body editor work.
- Add a red ordering test proving Annotation maps each editor commit before
  Decoration reads it and that Comments schedules no duplicate refresh.

Exit: the target contracts compile only in their intended form, and the
production implementation has a fixed performance oracle.

### Slice 1: repair Plite Annotation

- Add `getAnnotationsAt(nodeKey)` over the existing reverse index.
- Replace ids-only `subscribeChanges` with `{ ids, nodeKeys }`.
- Publish the change `reason`, including automatic `"editor"` mapping.
- Make private mapped-source refresh report affected old/new output keys,
  including offset-only changes on one key.
- Update Widget, hooks, tests, docs, and comment-mode example.
- Rerun focused Plite type/tests and the benchmark against production code.

Exit: no duplicate index exists; exact change payload tests and both frozen
benchmark runs pass.

### Slice 2: rebuild the Plate package

- Add `platejs/comments/react` with `createCommentsPlugin`, source types,
  `CommentsPluginState`, the private per-editor owner, scoped API, delegated
  events, and attribute-only decoration.
- Delete the singular entrypoints, base mark plugin, mark helpers/codecs,
  React leaf, old tests, and static component path.
- Add lifecycle, source fault, overlaps, active old/new refresh, multi-editor,
  static snapshot, read-only, and inference tests.
- Add the offline migration extractor and its fixture corpus.
- Run barrels and package export/pack checks.

Exit: one package entrypoint exists; no live source reads or writes comment
marks; package, migration, inference, and static tests pass.

### Slice 3: rebuild copied UI and integrations

- Rebuild `comment.tsx` around the application channel, narrow selectors,
  pending-anchor ownership, and `afterEditable` panel.
- Add one focused `comment-demo` registry block for interaction, render-count,
  read-only, overlap, and failure proof.
- Delete `discussion.tsx`, `comment-static.tsx`, `block-discussion.tsx`, and
  `block-discussion-index.ts` plus their registry items/tests.
- Move Suggestion presentation to its owner and remove its Discussion
  dependency.
- Migrate toolbar, Link, AI comment creation, editor kits, examples, values,
  and package integration tests.
- Prove one body edit rerenders its thread row, not the editor root, unrelated
  rows, or text nodes.

Exit: the standalone Comments demo has no document marks, editor thread store,
combined review index, or whole-document fan-out.

### Slice 4: docs, generated output, and release artifacts

- Rewrite Comment docs as current-state headless setup plus copied UI.
- Delete Discussion docs and old API reference entries.
- Document external channels, anchor ownership transfer, multiple editors,
  read-only review, and the offline migration.
- Add breaking package changesets and a registry changelog source entry.
- Run `pnpm brl` and `pnpm --filter www build:registry` on `next`.
- Run the required `best-api repair`; update Vision only if implementation
  discovers a new durable law; repair stale worker teaching and regenerate
  skills with `pnpm install` when their sources change.

Exit: generated output matches source, public teaching shows one setup, and
bounded stale searches return zero old public calls.

### Slice 5: final proof

- Run focused package/type tests first, then `pnpm check:plite:dev`, registry
  tests, standalone Browser proof, `pnpm check:plite`, browser matrix, and
  `pnpm check`.
- Run the production Comments benchmark twice with unchanged budgets.
- Run two-editor collaboration, read-only reviewer, overlapping comments,
  source failure/retry, and migration replay.
- Use Browser on the standalone Comments demo. Use Chrome only if native
  clipboard or browser UI needs proof.

Exit: every proof row is green and the public API earns its target 10/10.

## Proof matrix

| Claim                 | Focused proof                                                                      | Closure proof                               |
| --------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------- |
| Annotation index      | direct indexed reads; no `allIds` scan                                             | production benchmark counters               |
| Exact invalidation    | add/remove, same-node offsets, cross-node move, null range, one Decoration refresh | both benchmark receipts                     |
| Type inference        | factory/source/API/slot compile fixtures without callback annotations              | Plate typecheck and package pack            |
| Source lifecycle      | one observer, cleanup/remount, StrictMode, fault/retry, editor GC                  | package lifecycle suite                     |
| Decoration            | stable per-node keys, overlaps, active old/new nodes, attrs only                   | Chromium DOM and native editing             |
| Thread isolation      | body/reply/user/status changes cause zero editor work                              | React render-count test and benchmark       |
| Creation              | selection, pending anchor, cancel release, submit transfer, failure retention      | standalone Comments demo                    |
| Application actions   | create, reply, edit, delete, resolve, permissions                                  | registry tests and Browser                  |
| Multi-editor          | one external source resolves against two synchronized editors                      | two-pane collaboration Browser row          |
| Read-only review      | comment write without document write permission                                    | browser counters and document fingerprint   |
| Static                | same decorate read with explicit snapshot source; no observer                      | Plate static suite                          |
| Migration             | overlaps, disjoint groups, anonymous/draft/orphan diagnostics, idempotence         | fixture corpus fingerprint replay           |
| Suggestion separation | no Comments/Discussion dependency; own mutation behavior                           | Suggestion package and registry suites      |
| Public cut            | no singular exports, marks, codecs, old docs, or registry items                    | barrels, pack, registry build, stale search |
| Accessibility         | keyboard open/cancel, focus return, active announcement, panel navigation          | Browser accessibility assertions            |

Primary execution commands:

```bash
bun docs/plans/artifacts/hard-cut-comments-ownership/benchmark-comments-ownership.ts --output=<receipt>
bun --tsconfig-override apps/www/tsconfig.json docs/plans/artifacts/hard-cut-comments-ownership/benchmark-comments-channel.ts --output=<receipt>
pnpm --filter plitejs typecheck
pnpm --filter plitejs test
pnpm --filter platejs typecheck
pnpm --filter platejs test
pnpm check:plite:dev
pnpm --filter www build:registry
pnpm brl
pnpm check:plite
pnpm check:plite:browser-matrix
pnpm check
```

Use the actual package filter names confirmed at execution time; do not weaken
a gate because a guessed filter name differs.

## Failure analysis

1. An offset-only anchor move reports no node key. The old highlight remains.
   The Annotation change test must cover identical membership with changed
   offsets.
2. A removed anchor loses its old node keys before notification. Capture the
   old and new key union inside the mapped-source refresh transaction.
3. Annotation and Decoration both refresh the same editor commit. Construct
   the Annotation owner before the Decoration manager and ignore
   `reason: "editor"` in the external observer; prove the order and count.
4. A body edit emits through `anchors.subscribe`. This reconnects product data
   to editor work. Keep the anchor source as a separate stable projection of
   the application channel.
5. The copied UI leaks or double-releases a pending anchor. Give the controller
   explicit pending, transferred, cancelled, and failed ownership tests.
6. Overlap identity depends on DOM accident. Preserve source order, stable
   `${id}:${nodeKey}` keys, explicit data attributes, and `idsAt` tests.
7. A source throws and editing stops. Retain the last good annotation and
   decoration snapshots, expose diagnostics, and keep local editing usable.
8. Migration silently joins disjoint ranges or invents IDs. Fail with
   diagnostics before writing either storage channel.
9. Suggestion keeps a hidden Discussion dependency. Stale import and runtime
   tests must prove it installs independently.

Rollback before release means reverting the complete hard cut. Do not ship a
dual mark/anchor model or keep old exports as insurance.

Work Checklist:

- [x] Extract every explicit execution requirement, scope boundary, stop
      condition, deliverable, final handoff field, and success criterion into
      this plan.
- [x] Select the feature manifest, packs, package boundary, scale receipt, and
      one-shot flow before production writes.
- [x] Complete Slice 0 contract/type/ordering red-green proof.
- [x] Complete Slice 1 Plite Annotation implementation, adoption, and proof.
- [x] Complete Slice 2 Plate package hard cut, migration, and proof.
- [x] Complete Slice 3 copied UI/integration hard cut and Browser-ready demo.
- [x] Complete Slice 4 docs, generated output, changesets, registry changelog,
      and automatic `best-api repair`.
- [x] Complete Slice 5 focused, broad, performance, Browser, collaboration,
      migration, stale-surface, P1 review, feature-checker, and goal-checker
      proof.
- [x] Record final verification evidence, current reboot status, remaining
      risks, and handoff fields before goal completion.

Planning checklist:

- [x] One public setup and package entrypoint are explicit.
- [x] The plugin's independent job and deletion counterfactual are resolved.
- [x] Application, plugin, Annotation, Decoration, and UI lifetimes are
      assigned once.
- [x] Thread data reaches UI without entering the editor root or plugin store.
- [x] Public helpers are rejected except the scoped plugin API and offline
      migration extractor.
- [x] The minimal Plite prerequisite reuses the existing index.
- [x] Document marks, Discussion, static leaf, combined wrapper, and global
      index are cut.
- [x] Suggestion, Link, AI, toolbar, kits, values, docs, and generated outputs
      have adoption owners.
- [x] Serialized data has a loss-visible migration with no runtime fallback.
- [x] Scale budgets pass twice on current source and twice on production code.
- [x] Type, lifecycle, native, static, collaboration, read-only, accessibility,
      browser, migration, and release proof are concrete.
- [x] No unresolved public API or implementation alternative remains.

Completion Gates:

| Gate | Applies | Required action | Evidence |
| ------------------------- | ------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Hard-cut API              | yes     | expose one required-source React factory                                     | one React factory; no base, source-less, or singular alternative                                                     |
| Ownership                 | yes     | keep each lifetime under one owner                                            | app thread truth, plugin editor integration, Plite range index, and copied UI                                        |
| Plite prerequisite        | yes     | reuse the reverse index and publish exact changes                             | existing reverse index plus exact old/new affected-node payload                                                      |
| Scale                     | yes     | rerun disposable and production owners twice with unchanged budgets          | two passing disposable receipts, two production Annotation receipts, and two 10,000-subscriber channel receipts      |
| Migration                 | yes     | keep legacy extraction offline and loss-visible                              | diagnostics, idempotence, fingerprint replay, and no live fallback                                                   |
| Adoption                  | yes     | migrate every named package, registry, integration, docs, and generated owner | package, registry, AI, Suggestion, Link, kits, docs, API manifest, barrels, registry, and release artifacts are green |
| Proof                     | yes     | close focused, browser, package, matrix, and repository gates                 | package, browser, collaboration, static, migration, performance, stale audit, and `pnpm check` pass                  |
| Production implementation | yes     | close every execution slice                                                   | all five slices and every proof row are closed                                                                       |
| P1 autoreview             | yes     | use the mandated bounded manual P1 review because autoreview is forbidden on `next` | manual P1 review completed; the broad channel fan-out finding was fixed, benchmarked twice, and no P1 remains   |
| Goal plan complete        | yes     | run both completion checkers after review                                    | Plate feature checker passes all 12 surfaces and the autogoal checker passes                                          |

Phase / pass table:

| Phase                       | Status      | Evidence                                                     |
| --------------------------- | ----------- | ------------------------------------------------------------ |
| Current ownership audit     | complete    | source map and 2.0/10 score receipt                          |
| Hard-cut counterfactual     | complete    | keep one plugin job; delete all false owners                 |
| Public API choice           | complete    | sole factory, source contract, scoped API, 10/10 target gate |
| Runtime and lifetime design | complete    | Plite prerequisite, plugin runtime, owner graph              |
| Scale proof                 | complete    | two passing current-source receipts with frozen budgets      |
| Adoption and migration plan | complete    | six slices, registry target, offline extractor               |
| Production proof plan       | complete    | proof matrix, commands, failure analysis                     |
| Production implementation   | complete    | all slices and closure gates passed 2026-09-02                |

Verification evidence:

- Current architecture score: 2.0/10 with wrong-owner, duplicate-truth, and
  wrong-lifetime caps.
- Benchmark source SHA-256:
  `7a753f8f1a32f1cd6c7f730b55287df8aaa3c55fc12a2f44e948139fa110ece9`.
- Both final receipts reference that exact formatted source hash and report
  zero correctness failures and zero red target rows.
- Current Plite source proves the reverse node-key index already exists inside
  `stable-id-mapped-source.ts`; the plan does not require a new production
  layer.
- Current Plate source proves plugin `decorate` and `slots.afterEditable` are
  already the canonical rendering inputs.
- Production Annotation/Comments receipts pass the frozen budgets twice with
  zero correctness failures and zero red rows. Worst distributed p95 is
  64.134 ms; worst pathological p95 is 70.401 ms.
- The copied application channel passes twice with 10,000 registered thread
  subscribers and 1,000 body edits. Each run wakes the target thread exactly
  1,000 times and every unrelated, pending, visible-list, and current-user
  subscriber zero times. Worst p95 is 0.002125 ms and worst max is 0.024875 ms.
- `pnpm check:plite:dev` passes on final source: 85 typechecks, 134 package
  tests, 232 Node contracts, 25 Bun contracts, and 3 browser smokes.
- `pnpm check:plite` passes on final source, including 710 Chromium tests with
  8 skips.
- `pnpm check:plite:browser-matrix` passes: Chromium 710/8 skipped, Firefox
  603/115 skipped, mobile Chromium 319/399 skipped, WebKit 624/94 skipped, and
  mobile WebKit 2 passed.
- The Plite React partition passes 75 files and 1,102 tests. Plite typecheck,
  Plate package proof, registry unit proof (6 tests, 37 assertions), and the
  focused Comments package suites pass.
- The final Comments Browser replay passes all 3 rows: overlap/actions with
  external thread data, keyboard creation plus read-only replies with a stable
  document fingerprint, and recoverable source faults across both editors.
- Earlier in-app Browser proof confirms four marks in both synchronized
  editors, two external threads, reviewer Viewing mode, retained marks across
  disconnect, and clean reconnect. A final fresh in-app inspection was blocked
  by the Browser local-URL policy; the exact final source was replayed through
  the repository Chromium suite instead.
- WWW TypeScript passes with an 8 GB heap. The default 4 GB wrapper exhausted
  its heap after its package subchecks without a TypeScript diagnostic.
- `pnpm check` passes on final source: formatting, lint, type-aware lint, 88
  package typechecks, 673 fast tests, and 187 slow tests.
- Registry generation emits 362 canonical payloads and 15 overlays. Docs,
  editor manifests, barrels, API reference, and all 107 registry changelog
  entries pass their checks.
- Plate Next doctrine v137 validates with 2 active and 44 retired contracts.
  `best-api repair` was rechecked after the implementation review: its existing
  narrow-subscription and zero-editor-work law already covers the corrected
  application channel, so no doctrine change or version bump is warranted.
- Bounded live-source searches return zero singular Comments entrypoints,
  comment mark APIs, Discussion plugins/kits, static comment leaves, combined
  block-discussion owners, or old registry files. `platejs/comments/react` and
  `plitejs/annotations` are the only relevant public package subpaths.

Timeline:

- 2026-09-02: user authorized production execution; created the active goal,
  loaded execution/benchmark/TDD/API skills, selected feature packs, and
  converted this plan into the execution ledger.
- 2026-09-02: completed the Plite Annotation change/index contract, Plate
  Comments hard cut, offline migration extractor, copied UI channel, dependent
  integrations, docs, generated output, and release artifacts.
- 2026-09-02: production benchmarking exposed no Annotation scaling failure;
  manual P1 review found a separate broad application subscriber fan-out. The
  channel was changed to keyed subscriptions and passed two 10,000-subscriber
  receipts.
- 2026-09-02: focused, strict, browser-matrix, registry, docs, package, and
  repo-wide closure proof passed on the final source.

Decisions and tradeoffs:

- Reuse this accepted plan as the sole execution ledger -> avoids a second
  source of truth -> requires preserving the closed planning evidence while
  adding live feature gates.

Review fixes:

- Added `CommentAnchorError` to the public API manifest and regenerated the API
  reference after the docs check found the missing exported type.
- Declared the direct `plitejs/react` to `plitejs/annotations` entrypoint edge
  after the package DAG checker rejected the implicit dependency.
- Updated the raw-schema oracle aggregate from 88 to 83 after the five legacy
  Comments properties were deleted; the focused 61-row oracle remains green.
- Removed Firefox-only DOM-offset assumptions from the image selection proof
  while retaining exact path, model selection, highlight, navigation, and
  scroll assertions.
- Replaced an absolute collaboration scroll assumption with a relative scroll
  delta so the mobile matrix proves behavior independent of viewport layout.
- Replaced the registry channel's broad subscriber set with current-user,
  pending, visible-thread-id, and keyed per-thread subscriptions. The previous
  shape woke every mounted thread for every channel mutation; the final shape
  wakes only the changed thread and has two production benchmark receipts.
- Manual bounded P1 review found no remaining P1 issue. `autoreview` is not
  applicable because repository policy forbids it on `next`.

Error attempts:

| Error / failed attempt                                                                          | Count | Next different move                                                        | Resolution                                                                                                    |
| ----------------------------------------------------------------------------------------------- | ----: | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| An initial Plate Next status search crossed broad historical docs and produced truncated output |     1 | restrict every follow-up search to exact owner files or filename manifests | output budget strategy tightened; no source decision used the noisy result                                    |
| Default WWW typecheck exhausted the 4 GB heap after package subchecks                            |     1 | rerun the exact TypeScript project with an 8 GB heap                        | `tsc --noEmit -p tsconfig.json` passed with no diagnostic                                                      |
| Automatic Playwright web-server startup hit a Turbopack internal panic                           |     1 | start WWW once and replay the focused suite against that server             | all 3 Comments browser rows passed on final source                                                            |
| Fresh in-app Browser navigation to the local demo was rejected by URL policy                     |     1 | retain earlier in-app proof and use the repository Chromium harness         | final automated replay passed; no policy bypass attempted                                                     |
| Docs check found `CommentAnchorError` absent from the generated API manifest                     |     1 | add the public export to API config and regenerate                          | docs check passed                                                                                              |
| Registry changelog check found stale generated payloads                                          |     1 | regenerate from the source entry, then rerun check                           | all 107 entries passed                                                                                         |
| First feature-checker invocation found the old plan heading/table shape                           |     1 | align the execution ledger with the current feature template contract        | manifest, flow mode, and four-column completion gates normalized; checker passes all 12 surfaces                |

Reboot status:

- Where am I? All five implementation slices and every closure gate are
  complete in the current working tree.
- Where am I going? No production work remains in this goal. Commit, push, and
  release require separate authorization.
- What is the goal? Ship one annotation-backed
  `createCommentsPlugin({ anchors })` and delete every old Comments/Discussion
  path without compatibility.
- What learned? The editor projection scales, but a broad application channel
  can silently reintroduce repeated-unit fan-out outside the editor. Keyed
  subscriptions are part of the performance boundary.
- What done? Production implementation, migration, adoption, generated output,
  release artifacts, stale audit, two performance owners, browser proof, and
  full repository proof are complete.

Open risks:

- No blocking implementation risk remains. Legacy extraction is deliberately
  offline and fail-closed; source faults retain the last good editor snapshot
  and have recovery proof.
- A fresh final in-app Browser inspection was unavailable because its local URL
  policy rejected navigation. Earlier manual in-app proof and the final 3-row
  repository Chromium replay cover the same behavior.
- The working tree is intentionally uncommitted and unpushed. No release or
  external mutation was authorized.

## Handoff

Status: implementation and proof complete; working tree uncommitted and
unpushed.

The final contract is one required-source `createCommentsPlugin({ anchors })`,
external application thread ownership, Plite's indexed Annotation owner,
attribute-only plugin decoration, copied UI with keyed subscriptions, and an
offline legacy extractor. Live source contains no document comment marks,
Discussion plugin, source-less descriptor, package provider, generic
projection, leaf renderer, or combined global review index.
