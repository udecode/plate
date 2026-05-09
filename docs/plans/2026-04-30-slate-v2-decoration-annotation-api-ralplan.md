# Slate v2 Decoration And Annotation API Ralplan

Status: `done`
Created: 2026-04-30
Current pass: `browser-and-stress-closure`
Next pass: `none`

## Verdict

The document value should not be the default owner for comments.

For Google Docs-style workflows where one user edits the document and another
user only comments, making both users edit the same Slate value is the wrong
mental model. It muddies permissions, undo/history, conflict policy, audit
events, and collaboration routing.

The stronger target is:

- Slate document value owns document content.
- Annotation/comment metadata lives in an app, service, or collaboration store.
- Anchors are durable values that resolve to Slate ranges.
- `slate-react` mirrors resolved annotations into projection stores for paint,
  sidebar, and widget consumers.
- A collaboration adapter, not raw Slate, maps remote anchors through CRDT or
  service positions.

This is the ProseMirror lesson without copying ProseMirror's API, plus the
Lexical comment-store split without forcing comment-only users to mutate the
document tree.

## Intent And Boundary

Intent:

- Define the best Slate v2 decoration/comment/annotation architecture for
  performance and collaboration.
- Answer whether comment-only users should write comments into the Slate value.
- Compare current Slate v2 against legacy Slate, Lexical, ProseMirror, and
  Tiptap before choosing a public API.

Desired outcome:

- Execution-grade plan for a new annotation/comment feature doc and a small API
  correction before public lock.
- No implementation edits in this pass.

In scope:

- Decoration sources.
- Annotation stores.
- Durable annotation anchors.
- Comment-only collaboration with Yjs or equivalent adapters.
- Source-scoped invalidation and runtime-id projection performance.
- Docs/examples/tests needed before the architecture can close.

Non-goals:

- No raw Slate product comment system.
- No server auth policy in core.
- No current-version Plate or slate-yjs adapter compatibility requirement.
- No requirement that every comment become document content.
- No revival of one `decorate(entry) => Range[]` as the flagship model.

Decision boundaries:

- Raw Slate stays unopinionated.
- `slate-react` may own render-facing projection stores.
- Product frameworks may choose document-embedded anchors, but raw Slate should
  not require them.
- `RangeRef` stays lower-level runtime machinery; it is not the public comments
  story.

Unresolved user-decision points:

- None required for pass 1. The plan can continue autonomously.

## Current State Read

Current live Slate v2 already has the right foundation:

- `SlateAnnotation` is id-bearing but currently requires `bookmark: Bookmark`
  (`../slate-v2/packages/slate-react/src/annotation-store.ts:14-18`).
- The annotation store resolves bookmarks into snapshots and projections
  (`../slate-v2/packages/slate-react/src/annotation-store.ts:146-168`,
  `:240-279`).
- Candidate rebuild exists for editor changes when impacted annotation ids can
  be computed (`../slate-v2/packages/slate-react/src/annotation-store.ts:177-224`,
  `:516-545`).
- Selection-only and unrelated text changes are skipped
  (`../slate-v2/packages/slate-react/src/annotation-store.ts:556-568`;
  `../slate-v2/packages/slate-react/test/annotation-store-contract.tsx:185-260`).
- The store now listens through `Editor.subscribeSource`, not broad
  `editor.subscribe` (`../slate-v2/packages/slate-react/src/annotation-store.ts:668-682`;
  `../slate-v2/packages/slate-react/test/annotation-store-contract.tsx:263-308`).
- Projection stores already support source dirtiness, source ids, runtime-id
  subscriptions, and explicit refresh reasons
  (`../slate-v2/packages/slate-react/src/projection-store.ts:31-72`,
  `:343-459`, `:489-503`).
- `<Slate>` composes annotation store projections with decoration sources
  (`../slate-v2/packages/slate-react/src/components/slate.tsx:38-50`,
  `:151-160`).
- `Bookmark` is a hidden, op-rebased range anchor with `resolve()` and
  `unref()` (`../slate-v2/packages/slate/src/editor/bookmark.ts:42-75`).
- Bookmark tests prove hidden range-ref backing, rebasing, and inward boundary
  behavior (`../slate-v2/packages/slate/test/bookmark-contract.ts:55-160`).
- The review-comments example uses bookmarks plus annotation store data
  (`../slate-v2/site/examples/ts/review-comments.tsx:213-235`, `:508-521`).
- The persistent anchor example proves bookmark-backed annotations and widgets
  (`../slate-v2/site/examples/ts/persistent-annotation-anchors.tsx:379-405`,
  `:499-539`).

Current gap:

- The public annotation input is named and typed as `bookmark`, so it only
  describes the local editor anchor case.
- External annotation changes cannot target candidate ids through the public
  annotation store `refresh()` API; `refresh` is currently `() => void`
  (`../slate-v2/packages/slate-react/src/annotation-store.ts:47-55`).
- Projection building currently spreads the whole annotation `data` object into
  inline projection data (`../slate-v2/packages/slate-react/src/annotation-store.ts:252-269`).
  That is too broad for comment systems where body/sidebar data changes more
  often than inline paint metadata.
- The examples demonstrate local bookmarks, not a read-only/comment-only user
  writing to a separate collaboration channel.

## Intent-Boundary Pass

Status: `complete`
Updated: 2026-04-30T15:34:16Z

Boundary decisions:

- Hard-cut `bookmark` to `anchor` before public lock. The package is still
  pre-1.0/beta (`../slate-v2/README.md:42`) and `slate-react` is published as
  `0.124.0` (`../slate-v2/packages/slate-react/package.json:1-5`), so carrying
  the wrong noun forward is more expensive than a minor-version break.
- Do not add a compatibility alias by default. Add one only if release review
  finds real external adoption of the current annotation API.
- Split annotation data by audience:
  - `data` is for annotation hooks, sidebars, comments, and app state.
  - `projection` is the small render-facing payload copied into text projection
    slices.
- External annotation refresh must accept ids. `undefined` means full refresh;
  `[]` means no-op; a non-empty list recomputes just those annotations.
- A research decision page is needed after steelman/high-risk acceptance:
  `docs/research/decisions/slate-v2-collaborative-annotation-channels.md`.

Pressure test:

- Counterexample: a comment body changes from "needs citation" to "resolved by
  source". The sidebar must update. The inline highlight usually should not
  repaint unless status/tone changed. Current `data` spreading cannot express
  that distinction cleanly.

No user question needed:

- The repository evidence is enough to choose the boundary. Asking whether to
  prefer perfect API shape or soft compatibility would be fake uncertainty.

Plan delta:

- Strengthened the API target from `anchor` only to `anchor + data/projection +
  id-targeted refresh`.
- Dropped default compatibility alias for `bookmark`.
- Added a research-decision follow-up once the high-risk pass accepts the
  collaborative channel law.

## External Evidence

Legacy Slate:

- Legacy `Editable` exposes one `decorate?: (entry: NodeEntry) => Range[]`
  callback (`../slate/docs/libraries/slate-react/editable.md:11-25`).
- Legacy `RangeRef` tracks a range through operations and must be manually
  released (`../slate/docs/api/locations/range-ref.md:1-10`).
- Legacy performance guidance says stable `decorate` function identity matters
  (`../slate/docs/walkthroughs/09-performance.md:35-47`).

ProseMirror:

- `DecorationSet` is persistent mapped overlay data, not a render callback
  (`../prosemirror/view/src/decoration.ts:265-286`, `:332-359`).
- `forChild(...)` extracts child-local decorations
  (`../prosemirror/view/src/decoration.ts:431-453`, `:499-522`).
- `SelectionBookmark` maps through changes and resolves later
  (`../prosemirror/state/src/selection.ts:173-204`, `:309-317`, `:382-391`).

Lexical:

- `MarkNode` stores inline ids inside the document tree
  (`../lexical/packages/lexical-mark/src/MarkNode.ts:26-38`, `:109-137`).
- `CommentStore` owns comment/thread metadata separately and can write to a
  Yjs `comments` array
  (`../lexical/packages/lexical-playground/src/commenting/index.ts:107-170`,
  `:252-286`).
- The playground creates a separate comments provider and only then wraps inline
  selections in `MarkNode`
  (`../lexical/packages/lexical-playground/src/plugins/CommentPlugin/index.tsx:720-738`,
  `:789-807`).

Tiptap:

- Node-range visuals are built as ProseMirror decorations
  (`../tiptap/packages/extension-node-range/src/helpers/getNodeRangeDecorations.ts:1-28`,
  `../tiptap/packages/extension-node-range/src/node-range.ts:170-205`).
- Product comments can be manipulated outside the editor through REST/webhooks
  (`../raw/tiptap/docs/src/content/comments/getting-started/overview.mdx:17-20`,
  `:36-46`).
- Tiptap Cloud says comments are embedded in collaborative documents and wraps
  them with thread authentication/comment-only policy
  (`../raw/tiptap/docs/src/content/comments/core-concepts/configure.mdx:11-12`,
  `:74-108`;
  `../raw/tiptap/docs/src/content/comments/core-concepts/thread-authentication.mdx:30-52`,
  `:58-85`).

Compiled research:

- The accepted overlay model already splits Decoration, Annotation, and Widget
  lanes (`docs/research/systems/slate-v2-overlay-architecture.md:25-35`).
- Research already allows annotation metadata to stay app/collab/service-owned
  while `slate-react` mirrors anchors
  (`docs/research/decisions/slate-v2-overlay-architecture-cuts.md:29-40`).
- Source-scoped invalidation is accepted as the performance layer between
  full-store refresh and runtime-id subscriber delivery
  (`docs/research/concepts/source-scoped-overlay-invalidation.md:16-43`).
- Prior solution notes warn that source routing, recompute selection, and
  runtime-bucket delivery must be proven separately
  (`docs/solutions/performance-issues/2026-04-30-slate-v2-source-bus-routing-must-prove-upstream-fan-in-and-runtime-bucket-locality-separately.md`).

## Decision Brief

Principles:

- Content value is not a dumping ground.
- Permissions should follow data ownership.
- Anchors and comment bodies are different data.
- Raw Slate exposes substrate, not product workflow.
- Performance wins must be measured at source, projection, and subscriber
  levels.

Top drivers:

- Comment-only readers must add comments without document-write permission.
- Document edits and comment edits must be concurrent.
- Large documents cannot recompute every annotation on every change.
- Apps need durable anchors, not only live path/range handles.
- The API must stay Slate-close and small enough for agents to use correctly.

Options:

| Option | Verdict | Reason |
| --- | --- | --- |
| Store full comments in Slate value | Reject as default | Wrong owner for comment-only permissions, undo/history, audit, and collab routing. |
| Lexical-style inline ids in document plus external metadata | Keep as optional adapter strategy | Good durability when the app wants document-embedded anchors, but it still mutates content. |
| ProseMirror-style mapped external anchors plus external comment store | Choose as default | Best fit for comment-only users and source-scoped projection performance. |
| Tiptap-style product comment extension/cloud policy | Defer to product/adapters | Useful reference, but raw Slate should not own a product comments service. |

Chosen target:

- `SlateAnnotation` should accept a generic durable `anchor`, not only
  `bookmark`.
- `Bookmark` remains the first built-in anchor implementation.
- Collaboration adapters can implement the same anchor shape using Yjs relative
  positions or service-owned anchors.
- Annotation metadata remains external; `SlateAnnotationStore` mirrors resolved
  ranges and data into render-facing snapshots.
- External annotation changes should support id-targeted refresh.
- Sidebar/app data should not be blindly copied into inline projection data.

## API Target

Current shape:

```ts
export interface SlateAnnotation<T = unknown> {
  bookmark: Bookmark
  data?: T
  id: string
}
```

Target shape before public lock:

```ts
export interface SlateAnnotationAnchor {
  resolve(): Range | null
  unref?(): Range | null
}

export interface SlateAnnotation<
  TData = unknown,
  TProjection extends Record<string, unknown> = Record<string, unknown>,
> {
  anchor: SlateAnnotationAnchor
  data?: TData
  id: string
  projection?: TProjection
}
```

Adoption answer:

- Hard-cut `bookmark` to `anchor`.
- Do not ship a compatibility alias unless release review finds real external
  usage that outweighs the long-term API cost.
- `Bookmark` already satisfies the target shape.
- Projection entries copy `projection`, not the whole `data` payload. `data`
  remains available through `useSlateAnnotation` and `useSlateAnnotations`.

External refresh target:

```ts
type SlateAnnotationRefreshOptions = {
  ids?: readonly string[]
  reason?: 'annotation' | 'external' | 'refresh'
}

interface SlateAnnotationStore<T = unknown> {
  refresh(options?: SlateAnnotationRefreshOptions): void
}
```

`ids` semantics:

- omitted: full refresh
- empty array: no-op
- non-empty array: re-resolve and reproject only those annotations

This is the missing performance hook for:

- comment body changed
- thread resolved
- remote comment added
- anchor changed from an external collaboration store

Projection payload target:

```ts
const annotations = comments.map((comment) => ({
  anchor: comment.anchor,
  data: comment,
  id: comment.id,
  projection: {
    resolved: comment.resolved,
    tone: comment.tone,
  },
}))
```

That lets a body edit update sidebars without repainting inline text. A status
or tone edit still repaints the relevant runtime buckets.

## Collaboration Target

Before:

```ts
// Comment-only user must mutate the editor value to persist the comment anchor.
editor.update((tx) => {
  tx.addMark('commentId', threadId)
})
```

After:

```ts
// Comment-only user writes to the annotation channel.
const anchor = yjsAnnotationAdapter.anchorFromSlateRange(editor, selection)

commentsMap.set(threadId, {
  anchor,
  body,
  status: 'open',
})

annotationStore.refresh({ ids: [threadId], reason: 'annotation' })
```

Writer lane:

```ts
editor.update((tx) => {
  tx.text.insert('hello', { at })
})
```

Adapter lane:

```ts
yjsAnnotationAdapter.observeDocumentChanges(() => {
  annotationStore.refresh({ reason: 'annotation' })
})
```

The writer mutates the document channel. The commenter mutates the annotation
channel. The adapter resolves anchors against the current Slate snapshot for
rendering.

Full example target:

- Add `collaborative-comments.tsx` as a two-editor side-by-side example.
- Left pane: writer editor, editable document channel, no special comment
  permissions required.
- Right pane: reviewer editor, same document snapshot rendered read-only, but
  comment controls enabled.
- Shared state: one document channel plus one external annotation/comment
  channel.
- Flow:
  1. Writer types in the left editor.
  2. Reviewer selects text in the right read-only editor and creates a comment.
  3. Reviewer updates/resolves that comment without changing the Slate document
     value.
  4. Writer keeps editing; both panes keep the highlight/sidebar anchored to the
     moved text.
- Required proof: the reviewer lane must not call `editor.update` for document
  writes and must not mutate `Editor.children`. Annotation-channel writes and
  `annotationStore.refresh({ ids, reason: 'annotation' })` are allowed.
- Do not replace this with a single-editor "comment mode" toggle. A toggle only
  proves UI gating. The two-pane example proves collaboration ownership.

## Performance Plan

Required runtime properties:

- Annotation store input arrays keep stable identity for unchanged rows.
- Document commits use source-bus routing, not broad editor wakeups.
- Text/structural changes candidate-filter annotation ids by impacted runtime
  ids.
- External annotation changes refresh only affected ids when ids are known.
- Runtime subscribers wake only for changed runtime buckets.
- Full refresh remains the safe fallback for unknown external changes.

Proof rows:

| Row | Required proof |
| --- | --- |
| Source fan-in | Monkey-patch broad `editor.subscribe` to throw; annotation store still rebases. |
| Candidate ids | Typing in unrelated block resolves zero annotation anchors. |
| External id refresh | Updating one comment body wakes that annotation id and no unrelated runtime buckets. |
| Projection payload split | Updating `data.body` wakes annotation subscribers but not inline projection subscribers when `projection` is unchanged. |
| Two-pane comment-only example | Writer edits in the left editor while reviewer comments from the right read-only editor; document value changes only from the writer lane. |
| Remote rebase | Replay remote text ops and prove local/collab anchors resolve to moved text. |
| Null anchor | Deleted anchor resolves `null` and paints nothing without leaking subscribers. |
| Stress | 1k annotations, typing near one annotation stays local; whole-doc refresh is measurable fallback only. |

## New Docs Needed

Add a final-state Slate v2 doc after the plan closes:

- `../slate-v2/docs/libraries/slate-react/annotations.md`

Minimum content:

- Decoration vs annotation vs widget.
- Local bookmarks.
- External comment stores.
- Comment-only collaboration story.
- Full two-editor side-by-side example: writer editable pane plus reviewer
  read-only commenting pane.
- Yjs-style adapter sketch with separate document and annotation channels.
- When document-embedded mark ids are acceptable.
- Performance rules for stable data, id-targeted refresh, and runtime buckets.

Example changes:

- Update `review-comments.tsx` to use `anchor`.
- Add `collaborative-comments.tsx` as the side-by-side two-editor example. If
  the adapter-free mock cannot honestly prove separate document/comment
  channels, do not ship a weaker toggle demo as a substitute.

## TDD And Verification Plan

Use vertical slices, not a giant fake-red suite.

1. Test local `Bookmark` still works through `anchor`.
2. Test old `bookmark` shape is rejected or intentionally aliased by one
   explicit compatibility decision.
3. Test external annotation store refresh with `{ ids }`.
4. Test `data` vs `projection`: body updates wake sidebar subscribers without
   repainting inline runtime buckets when projection metadata is stable.
5. Test read-only/comment-only flow: selection to external anchor does not call
   `editor.update` and does not change `Editor.children`.
6. Test remote document operation re-resolves an external anchor.
7. Test React subscribers: one body update wakes one annotation subscriber.
8. Test browser example: writer edits in the left editor while a comment-only
   user comments from the right read-only editor.
9. Benchmark stress: 1k annotations with local edit, remote comment update, and
   full fallback.

## Objection Ledger

| Objection | Answer | Verdict |
| --- | --- | --- |
| "Why not just store comments in Slate value?" | Because comment-only users should not receive document-write permission just to discuss text. It also pollutes undo/history and makes audit events lie. | reject |
| "Lexical stores mark ids in the tree." | Yes, and it stores comment metadata separately. Slate can support document-embedded ids as an adapter choice without making it mandatory. | keep default external |
| "External anchors can drift." | Correct. The adapter must own drift policy, quote/context recovery, null resolution, and tests. Raw Slate only promises resolution and projection once the adapter provides an anchor. | revise with proof |
| "Rename `bookmark` to `anchor` feels like churn." | Churn now is cheaper than publishing a local-only noun for a collaborative API. `Bookmark` remains the built-in anchor. | keep |
| "Id-targeted refresh complicates the store." | It is the difference between product-scale comments and cute examples. The store already has candidate-id machinery for editor changes; external changes need the same lane. | keep |
| "Why split `data` and `projection`?" | Because comment body/sidebar churn should not repaint inline text. Render payload and app metadata have different hot paths. | keep |

## High-Risk Pass Notes

Trigger:

- Public API, collaboration data model, render performance, docs/examples.

Blast radius:

- `packages/slate-react/src/annotation-store.ts`
- `packages/slate-react/src/hooks/use-slate-annotation-store.tsx`
- `packages/slate-react/src/hooks/use-slate-annotations.tsx`
- annotation examples and docs
- future Yjs/collaboration adapters

Pre-mortem:

1. API ships as `bookmark`, then remote anchors need a second shape and docs
   become confused.
2. External comment updates call full refresh forever and perf collapses on
   large review docs.
3. Docs imply comments are outside the value, but examples still mutate content,
   so readers copy the wrong pattern.

Remediation:

- Rename to `anchor` before lock or provide a migration alias.
- Add id-targeted refresh before publishing collaborative examples.
- Split annotation `data` from render-facing `projection`.
- Make the docs show external metadata first, document-embedded ids as an
  opt-in strategy second.

## Steelman Pass

Status: `complete`
Updated: 2026-04-30T15:36:47Z

| Decision | Strongest fair objection | Best argument against it | Tradeoff tension | Rejected alternative | Why the chosen option wins | Migration/docs/proof | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Hard-cut `bookmark` to `anchor` | "This is churn for a thing that already works locally." | Existing local examples are simple, and `Bookmark` is already a Slate noun. | Users copying current examples must rename one field. | Keep `bookmark` and later add `remoteAnchor`. | `bookmark` names the implementation, not the contract. A collaborative anchor can be Yjs/service-backed without being a Slate `Bookmark`. | Update examples to `anchor`; release review can add an alias only if real external adoption is found; unit test old shape rejected or explicitly aliased. | keep |
| Default comments to external annotation channels | "Lexical and many apps serialize mark ids in the document; external anchors may drift." | Serialized ids give offline durability and easy copy/paste persistence. | External channels require adapter discipline for drift, deletion, and permissions. | Force document mark ids for every comment. | Comment-only users should not need document-write permission. External default keeps permissions and audit honest while still allowing document-embedded ids as an adapter choice. | Docs show external channel first, embedded ids as opt-in; proof requires read-only comment creation and remote rebase. | keep |
| Split `data` and `projection` | "Two payloads are more API than one." | One `data` object is easy to teach and already works in examples. | Users must decide which fields affect text paint. | Keep spreading `data` into projection entries. | Sidebar/comment body churn is a different hot path from inline highlight paint. The split prevents app metadata from becoming render invalidation by accident. | Test body update wakes annotation subscribers without repainting inline projection when `projection` is stable. | keep |
| Add `refresh({ ids })` | "A store refresh API with ids smells like callers managing internals." | A single `refresh()` is simpler and cannot go stale through wrong id lists. | Callers must pass accurate ids for maximum performance. | Keep full refresh as the only public external invalidation path. | Product-scale review docs need id-targeted external updates. Full refresh remains the safe fallback when ids are unknown. | Unit and benchmark rows cover omitted ids, empty ids, known ids, and full fallback. | keep |

Accepted revisions:

- Keep document-embedded anchor ids as an explicit adapter/product option, not a
  rejected pattern.
- Require docs to show drift/null-anchor policy for external anchors.
- Require tests to prove projection payload separation, not just type shape.

Dropped choices:

- Default compatibility alias for `bookmark`.
- Full-comment metadata copied into text projection slices.
- Raw Slate product comment service.

No unresolved steelman rows remain.

## High-Risk Deliberate Pass

Status: `complete`
Updated: 2026-04-30T15:36:47Z

Trigger:

- Public API, collaboration storage, render invalidation, docs/examples, and
  future adapter contract.

Blast radius:

- `../slate-v2/packages/slate-react/src/annotation-store.ts`
- `../slate-v2/packages/slate-react/src/hooks/use-slate-annotation-store.tsx`
- `../slate-v2/packages/slate-react/src/hooks/use-slate-annotations.tsx`
- `../slate-v2/packages/slate-react/src/index.ts`
- `../slate-v2/site/examples/ts/review-comments.tsx`
- `../slate-v2/site/examples/ts/persistent-annotation-anchors.tsx`
- `../slate-v2/docs/libraries/slate-react/annotations.md`
- future Plate/slate-yjs comment adapters

Three-scenario pre-mortem:

1. Anchor contract is too loose, so adapter anchors resolve against stale
   snapshots and comments jump.
2. `data`/`projection` split is taught poorly, so apps put body text in
   `projection` and recreate the same repaint problem.
3. `refresh({ ids })` gets wrong ids from an external store and stale highlights
   survive until the next full refresh.

Expanded proof plan:

| Lane | Required proof |
| --- | --- |
| Unit | `Bookmark` satisfies `SlateAnnotationAnchor`; old `bookmark` shape is rejected or explicitly aliased; deleted anchors resolve `null`. |
| React integration | Annotation body update wakes annotation subscribers, not inline projection subscribers, when `projection` is unchanged. |
| Collaboration | Mock Yjs/service anchor can update while editor is read-only and document value stays unchanged. |
| Browser | Side-by-side example proves writer edits in one editor while reviewer creates, resolves, and deletes comments from a read-only editor. |
| Migration/adoption | Docs show local bookmark, external channel, and document-embedded id strategies with clear ownership rules. |
| Performance | 1k annotations: local edit near one anchor and external body update stay runtime-bucket local; full refresh is measured fallback only. |
| Security/permissions | Docs state permission enforcement belongs to app/service/collab layer, not raw Slate. |

Rollback or remediation:

- If generic anchors prove too vague, narrow the contract to `resolve(editor)` or
  an adapter object before publish.
- If `projection` is confusing in docs, rename to `renderData` before release,
  but keep the split.
- If id-targeted refresh is misused, retain full refresh fallback and add dev
  warnings only after real misuse appears.

Verdict:

- Keep the plan. The high-risk parts are real, but the old value-owned comment
  model is worse for the user's collaboration case.

## Migration Backbone

Plate:

- Plate can keep opinionated comment UX and discussion state in Plate-owned
  plugins/stores.
- Existing document mark-id comment systems can map those ids to `anchor`
  objects as an adapter strategy.
- Plate should not force raw Slate to store thread bodies, permissions, or
  resolved state in the document value.

slate-yjs:

- The document channel and annotation channel should be separate Yjs structures.
- A Yjs annotation anchor can implement `SlateAnnotationAnchor` by resolving
  relative positions to the current Slate range.
- Raw Slate does not need to ship the current slate-yjs adapter; it needs the
  substrate shape that lets the adapter be correct.

Legacy Slate:

- `decorate(entry) => Range[]` remains a transient rendering escape hatch, not
  the durable comments architecture.
- `RangeRef` remains lower-level local runtime machinery. `Bookmark` and
  generic anchors are the public durability story.

## Applicable Review Matrix

| Lens | Applicability | Finding | Plan delta |
| --- | --- | --- | --- |
| `vercel-react-best-practices` | applied | Render-facing data must stay in external stores and `useSyncExternalStore` subscriptions, not context churn. | Keep annotation hooks/store; split `data` from `projection`. |
| `performance-oracle` | applied | Hot path risk is not anchor resolution alone; it is broad refresh and repaint from external comment churn. | Add id-targeted refresh, projection split, 1k annotation stress row. |
| `tdd` | applied | Tests must prove public behavior: comment-only creation, external refresh, remote rebase, and render locality. | Verification plan now lists vertical public-interface rows. |
| `build-web-apps:shadcn` | skipped | No new UI components are designed in this planning pass. | Future example UI should stay minimal and composed, but raw Slate API plan does not need shadcn work. |
| `react-useeffect` | applied | Store lifecycle and external updates should use stable refs and external-store subscriptions, not reset-on-render effects. | Keep stable annotation arrays; add docs warning for `data` identity and projection payloads. |

## Implementation Phases

1. API hard-cut: introduce `SlateAnnotationAnchor`, rename `bookmark` to
   `anchor`, export the new type, update tests and examples.
2. Store performance: add `projection`, `refresh({ ids })`, and id-targeted
   annotation/projection rebuild semantics.
3. Docs/examples: add `docs/libraries/slate-react/annotations.md`, update
   review comments examples, and add `collaborative-comments.tsx` as a
   side-by-side writer/reviewer example if it can prove separate channels
   honestly.
4. Collaboration proof: add a mock Yjs/service anchor test that writes
   annotation state while editor content is read-only.
5. Stress and closure: run focused unit/React tests plus the annotation stress
   benchmark before calling the implementation done.

## Fast Driver Gates

- `bun test packages/slate/test/bookmark-contract.ts packages/slate-react/test/annotation-store-contract.tsx`
- `bun test packages/slate-react/test/annotation-store-contract.tsx --bail 1`
- `bun run bench:react:rerender-breadth:local`
- browser proof for the side-by-side comment-only example before
  release-quality claims

## Final User-Review Handoff Outline

- State the core decision: comments default outside Slate value.
- Show before/after API for `bookmark -> anchor`.
- Show before/after data ownership for document vs annotation channel.
- Show the `data`/`projection` split.
- List proof rows required before implementation closure.

## Research Decision

Added and indexed:

- `docs/research/decisions/slate-v2-collaborative-annotation-channels.md`

The decision accepts external annotation channels as the raw Slate default for
comment-only collaboration while preserving document-embedded ids as an adapter
or product choice.

## Score

Total: `0.93` done.

| Dimension | Weight | Score | Evidence |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.20 | 0.94 | Source bus, projection store refresh reasons, runtime-id subscribers, prior source-bus solution, `data`/`projection` split, and id-targeted refresh proof rows. |
| Slate-close unopinionated DX | 0.20 | 0.93 | `Bookmark` stays the built-in anchor; `anchor` names the generic contract; raw Slate avoids product comments and keeps document-embedded ids optional. |
| Plate/slate-yjs migration backbone | 0.15 | 0.91 | Migration backbone now names Plate ownership, slate-yjs separate channels, and adapter-owned relative-position anchors without current-version adapter promises. |
| Regression-proof testing strategy | 0.20 | 0.92 | Plan names unit, React integration, browser, stress, migration, and permission-doc proof rows for every risky claim. |
| Research evidence completeness | 0.15 | 0.94 | Live Slate v2, beta/release surface, legacy Slate, ProseMirror, Lexical, Tiptap, Plate/slate-yjs pressure, compiled research, and new decision page are recorded. |
| shadcn-style composability/minimalism | 0.10 | 0.91 | Store/hook shape remains small; UI remains product-owned; `projection` prevents app data from bloating render payloads. |

Completion threshold is met:

- Total is above `0.92`.
- No dimension is below `0.85`.
- Intent, decision brief, steelman, high-risk, migration, proof, review matrix,
  research, and closure gates are recorded.
- No unresolved plan decision remains before implementation.

## Pass State

| Pass | Status | Notes |
| --- | --- | --- |
| current-state-read-and-initial-score | complete | Live source, tests, examples, compiled research, and external editor source inspected. |
| intent-boundary-and-decision-brief | complete | Hard-cut `bookmark` to `anchor`; add `data`/`projection` split; require id-targeted external refresh; research decision page needed after steelman/high-risk. |
| steelman-pass | complete | Accepted hard-cut `anchor`, external channel default, `data`/`projection`, and id-targeted refresh after challenge. |
| high-risk-deliberate-pass | complete | Expanded blast radius, pre-mortem, proof plan, rollback answer, and keep verdict. |
| closure-score | complete | Score `0.93`; plan is ready for user review before implementation. |
| implementation-slice-api-store | complete | Started 2026-04-30T16:46:34Z after the user asked to build from the plan. Owner: `../slate-v2/packages/slate-react`; target: `anchor`, `data`/`projection`, and `refresh({ ids })`. Evidence: focused annotation-store Vitest, package typecheck, site typecheck, and `bun lint:fix`. |
| docs-examples-collaboration-proof | complete | Started 2026-04-30T16:54:03Z. Added `../slate-v2/docs/libraries/slate-react/annotations.md` and `../slate-v2/site/examples/ts/collaborative-comments.tsx`, with route registration. |
| browser-and-stress-closure | complete | Browser proof passed in `collaborative-comments`; screenshot saved at `/Users/zbeyens/.dev-browser/tmp/slate-collaborative-comments-proof.png`. `bun run bench:react:rerender-breadth:local` passed. `bun check` passed. |

## Next Pass

Implementation is complete.

Concrete next move:

- None.
