# Comments persistence and history architecture

Status: Complete

Execution authorized on 2026-09-17. Task owns implementation and proof in the
current checkout. The latest AI behavior is retained: completed generated
comments are published ordinary threads, with no approval popover.

Reporter contradiction (2026-09-17, attempt 2): deleting the published range
comment over `comments on many text segments.` in the Playground while the
toolbar reports Editing creates a retained Authored deletion. The video and an
exact browser replay confirm the failure. Base acceptance remains unchanged.
The repair must keep ordinary accepted deletion direct, preserve unrelated
pending suggestions, retain the conversation, and prove the same native
Backspace interaction without a new Authored change or Suggesting mode.

Resolved on 2026-09-17. Authored capture now keeps structural and text-boundary
dependencies in the causal replay graph while excluding them from publication
classification. Only directly edited pending content can make an Editing write
reviewable. The exact Playground range deletes directly in Chrome, retains the
five conversations and existing suggestions, and creates no authored change.

Execution checklist (sources: execution slices and proof matrix below;
Task workflow; Verify Plate implementation acceptance):

- [x] Adopt the Plite opaque range fast path and retain production correctness
      and frozen scale receipts.
- [x] Split live Comments records from saved ranges, restore strictly, and
      isolate semantic subscriptions from attachment mapping.
- [x] Implement awaited durable mutations, resolution metadata, per-thread
      ordering and stale retirement; retain local draft operations.
- [x] Adopt every package/React/copied UI/demo/AI consumer and current docs,
      including fresh-editor persistence and historical target joins.
- [x] Review implementation ownership, prove runtime/Chromium/Chrome behavior,
      build packages, and generate barrels, registry and API reference output.
- [x] Close canonical package typechecking after the separately owned
      persistence dependency boundary is repaired.
- [x] Repair the reporter contradiction at the Authored classification owner
      and prove the exact native Backspace interaction in Editing mode.

Next action: none for local execution. Publication remains outside this task's
authority.

Resumed on 2026-09-17 after the user confirmed the originating persistence work
is complete and authorized this task to repair the dependency boundary. The
repair removes Authored algorithms from core/internal and captures the private
pure document capability from the installed Authored contribution during target
compilation. The regenerated graph, complete Plite and Plate package typechecks,
both package builds, 54 focused migration/Authored contracts, eight React History
cases, 250 DOM partition cases and 27 built-package export checks pass. The exact
public migrations barrel does not expose the private capability bridge.

Package builds, documentation parity, registry generation/source checks,
doctrine validation and skill mirrors pass. Their final outputs are preserved
in the [execution checks receipt](artifacts/comments-history-api/execution-checks-2026-09-17/README.md).

Final browser proof passes all 30 executable comment cases in 84.14 seconds
and all four selected AI publication cases in 13.55 seconds. The two optional
main-baseline comparisons are skipped because no separate main server is
provided; no main-parity claim follows. All 2,067 captured inputs are unchanged
through both runs. See [browser proof](artifacts/comments-history-api/browser-2026-09-17/README.md).
Actual Chrome also proves creation/reply, rejected Reopen retry, save/reload,
resolution outside document undo, and acceptance followed by another reply:
undo restores the suggestion while retaining that new reply.

The unchanged reply-render budget passes at six editables, zero text-node
renders and total six. Native read-only observation snapshots the effective
policy instead of notifying again when a controlled prop already blocks input.
The failed caller-memo and Plate-provider candidates are removed. Published
conversations remain editable after suggestion decisions; missing historical
semantic targets remain readable with a neutral unavailable label.

Final production serialization proof passes all 16 unchanged cases on the
settled native/Comments source. The 10,000-anchor full-cohort p95 is 71.532 ms
for ordinary ranges and 23.201 ms for Authored ranges, each below the unchanged
100 ms cap. The harness and all native/Plate source remain unchanged during
the single invocation; every JSON round-trip, endpoint and immutability guard
passes. See [final receipt](artifacts/comments-history-api/production-final-2026-09-17/verification.json).
The earlier 15/16 production result remains byte-identical and is not erased
by this changed-source final-path run.

Execution finding (2026-09-17, mounted views): Playground changes from five
discussions to four when switching projection even though every conversation
and authored change survives. A rendered reproduction traced this to a comment
index using model block keys after the mounted view changed its keys. The
retained range also resolves in its capture projection. A semantic reply
rebuilds the index and restores five discussions, proving the missing view
publication; it is not a repair.

The Best API Review verdict is **Pursue** the native projection repair. Keep
one retained target, extend its existing resolution owner with
`anchor.resolve(view?)`, and make native annotation indexes resolve and observe
their exact view. Comments retains one model-lifetime conversation/anchor map;
each view owns only derived attachment and decoration indexes. Capture and
validate user input through the calling editor. Reject another model's view;
release and rollback retain their existing handle lifetime. No-view resolution
retains capture-view semantics.

The strongest cut removes model-bound presentation, copied projected ranges,
and proposed per-view save/restore clones. `view.anchor.resolve(anchor)` would
add a second resolution surface without a separate job. Existing range
projection indexes a resolved range but cannot translate retained Authored
identity. Removing the native anchor would lose deletion/undo recovery;
removing per-view derivation would conflate genuinely different visible
documents. Proof must cover two simultaneous views, projection switching,
ordinary commit observation, semantic-subscription silence, cleanup, and the
original five-discussion browser interaction. Source-render evidence identifies
the failure but does not replace Chrome or final scale proof.

Execution finding (2026-09-17): restoring saved ranges in `afterPublish` cannot
enforce strict construction; that observer intentionally reports errors after
publication. Moving `validate` later breaks Plate model availability for the
initial-value callback. Moving `activate` later breaks Authored initialization.
The selected native repair adds synchronous `beforePublish` work to the existing
activation context, after the final candidate document is available and while
rollback remains possible. Both construction and dynamic installation must prove
failure cleanup and unchanged publication; adding a constructor-only workaround
or making `afterPublish` throw is rejected.

Native lifecycle proof is settled for that slice: 290 affected contracts and
241 read/snapshot contracts pass. Final-candidate restored anchors survive
later deletion and undo; rejected installation preserves the old document,
APIs, selection, version and anchors. Transaction guards still run before
candidate APIs become visible. The receipt is
[lifecycle isolation](artifacts/comments-history-api/before-publish-2026-09-17/lifecycle-isolation-status.md).
This does not close the subsequent exact-view repair, package graph or final
scale/browser gates.

Objective:

Select the smallest scalable Comments persistence model, settle its live/saved
API, history and collaboration boundaries, durable mutation contract, adoption
order, and executable proof so implementation can proceed without inventing a
generic editor checkpoint.

Flow mode:

accepted-plan execution

Goal plan:

`docs/plans/2026-09-16-comments-history-api.md`

Template:

`docs/plans/templates/plate-plan.md`, with the direct Plite anchor boundary
resolved through Plite Plan.

Mode:

- `deep`

Completion threshold:

- Binary readiness: current claims are sourced, each responsibility has one
  owner, every decision is resolved, public breaks have adoption and proof,
  scale-sensitive target code has a passing disposable receipt, execution
  slices are concrete, and `check-complete` passes.

Verification surface:

- Current Comments runtime, tests, copied UI, persistence demos, multi-editor
  proof, anchor and History codecs, Authored range binding, and Yjs admission.
- The executable reload probe and frozen 1/100/1,000/10,000-anchor serialization
  comparison under `docs/plans/artifacts/comments-history-api/`.
- Review-ledger render/check, plan completeness, product tests and direct browser
  interactions are execution gates. Earlier planning receipts remain historical.

Constraints:

- Comments owns conversations and private native range anchors. Plite owns
  range mapping and local undo. Authored remains optional. Applications own
  storage, authorization, document revisions, conversation generations, CAS,
  retention, and version selection.
- Published conversations survive source-text deletion and document undo.
  Document undo does not rewind replies, resolution, or explicit deletion.
- No mandatory activity log, tombstone store, second history plugin, caller
  owned native handles, per-keystroke serialization, or Authored dependency.
- Ordinary reload starts a fresh local undo stack. Execution implements the
  accepted contract in the current authorized checkout.

Boundaries:

- In scope: text-range and Authored-change comments, current-revision save and
  reload, read-only version previews, live-session undo/redo, mutation failure,
  subscription semantics, scale, docs, examples, and copied UI adoption.
- Source owners: `packages/platejs/src/features/comments/`, copied Comment and
  Discussion UI and demos in `apps/www`, and current Comments documentation.
- Direct Plite boundary owner: `packages/plitejs/src/core/anchor.ts`; History and
  Yjs are inspected boundaries but receive no new default checkpoint API.
- Non-goals: persisted browser undo after reload, live collaborative comment
  target transport, in-place checkpoint restore, undoable version restore,
  non-text targets, and claims of complete Google Docs parity.

Blocked condition:

- Canonical package typechecking previously failed TS6202 because Authored
  checkpoint algorithms were re-exported through core's internal entrypoint.
  Authored now contributes one private document capability during detached
  target compilation; migration authority retains it privately. Core no longer
  imports Authored. Original task ownership and failed commands remain in the
  [graph diagnosis](artifacts/comments-history-api/entrypoint-and-scale-diagnosis-2026-09-17/README.md).
- The Comments target is resolved. Persisted local undo and collaborative
  target transport remain explicit separate features, not requirements added
  to solve this failure.

Plate Plan state:

- status: complete
- phase: final package verification
- next: none; local execution and proof are complete
- handoff: prepared

Start Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | The plan covers comment deletion, history, version previews, scale, checkpoint pressure, sync, and mutation failure. |
| Task plan and execution authority verified | yes | User authorized full accepted-plan execution on September 17. |
| Current owners read | yes | Comments runtime/tests/callers, copied UI, anchor/History/Authored/Yjs owners, docs, and demos were inspected. |
| Best API target resolved | yes | The final hard cut removes the generic checkpoint and copied live Range while retaining the existing Comments plugin. |
| Runtime scale applicability resolved | yes | Serialization visits up to 10,000 native anchors; the frozen paired probe covers ordinary and Authored paths. |
| Pre-acceptance Benchmark probe selected | yes | Original failed receipt plus the third bounded target prototype and passing receipt are preserved in the evidence directory. |
| Mode and execution boundary resolved | yes | Deep planning is complete; this turn owns implementation and proof. |

Work Checklist:

- [x] Ground the current runtime, saved-data, history, collaboration, and UI owners.
- [x] Apply the maximum hard cut to generic checkpoint, activity-log, tombstone,
      live replacement, and persisted-local-undo proposals.
- [x] Select one live thread model, one saved envelope, one attachment read, and
      one durable mutation boundary.
- [x] Separate ordinary reload, version history, live synchronization, and Yjs
      admission rather than forcing them through one API.
- [x] Preserve and pass a scale comparison for the selected opaque range codec.
- [x] Define public breaks, adoption order, risks, proof, and doctrine repair.
- [x] Reconcile review history and prepare the implementation handoff.

Completion Gates:

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | All rows below have final verdicts and owners. |
| Fresh source evidence | yes | Recheck decision-changing claims | Current source was read on 2026-09-16; anchor source hash returned to `6df095b8…` after the disposable prototype. |
| Best API review | yes | Resolve every P0/P1 finding | Generic checkpoint cut; initialization, sync, attachment provenance, mutation failure, and collaboration boundaries are explicit. |
| Pre-acceptance scale proof | yes | Pass frozen target comparison | `authored-range-save-result.json`: all 16 rows pass; 10,000 authored full-cohort p95 22.492 ms under 100 ms. |
| Production scale rerun contract | yes | Carry the same comparison into implementation | Slice 1 reruns the exact artifact against production code and preserves source identity and correctness guards. |
| Conditional risk and adoption | yes | Resolve history/collaboration/docs/browser work | Risks and exact execution proof are listed below; publication and release are outside scope. |
| Verification recorded | yes | Record fresh planning proof | Artifact links, source hash, ledger commands, and checker output are recorded in Verification evidence. |
| Handoff prepared | yes | State ownership, breaks, proof, and order | Final handoff section is complete. |
| P1 autoreview | no | Explicit review or PR closure only; never on `next` | This is a design plan on `next`, so Task's autoreview gate is inapplicable. |
| Goal plan complete | yes | Run the Autogoal checker | Recorded after final plan validation. |

Phase / pass table:

| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Current owners and prior review history reconciled | None |
| Decide | complete | Final API and concept ledger below | None |
| Prove and hand off | complete | Passing scale receipt, risks, slices, and proof matrix | User review |

Decision brief:

- outcome: keep Comments small and durable without making it an editor-state or
  history owner.
- chosen shape: semantic live threads plus private native anchors; a versioned
  Comments JSON envelope exports semantic threads and checkpoint-bound opaque
  range targets only on explicit save; ordinary reload creates a fresh editor
  and fresh undo stack.
- strongest rejected alternative: a generic document/ranges/History/plugin
  checkpoint. Comments has no current need for persisted browser undo, and the
  abstraction would conflate local history, version storage, Yjs admission,
  live sync, and plugin state.
- consequence: exact live undo remains; a page reload cannot undo pre-reload
  edits. A future consumer that truly needs that behavior must justify a
  History-specific Plite checkpoint independently.

## Target contract

The live record contains conversation data and a target discriminator, never a
mapped Range:

```ts
export type CommentResolution =
  | Readonly<{
      resolvedAt: string | null;
      userId: string | null;
    }>
  | null;

export type CommentThread = Readonly<{
  createdAt: string;
  excerpt: string;
  id: string;
  messages: readonly CommentMessage[];
  resolution: CommentResolution;
  status: 'draft' | 'published';
  target:
    | Readonly<{ type: 'range' }>
    | Readonly<{ id: string; type: 'change' }>;
  userId: string;
}>;

export type CreateCommentThreadInput = Readonly<{
  body: Value;
  excerpt?: string;
  id?: string;
  target:
    | Readonly<{ range: Range; type: 'range' }>
    | Readonly<{ id: string; type: 'change' }>;
}>;
```

The plugin generates actor IDs and timestamps or accepts the canonical record
returned by the application mutation adapter. Callers cannot spoof them through
`CreateCommentThreadInput`. Range creation rejects collapsed or non-primary
document ranges. AI creates local unpublished drafts through a separate
`createDraft` operation; `createThread` creates a published durable thread.

One saved envelope represents one exact document revision:

```ts
export type CommentsJSON = Readonly<{
  kind: 'plate-comments';
  ranges: readonly Readonly<{
    range: EditorDocumentRange | null;
    threadId: string;
  }>[];
  threads: readonly CommentThread[];
  version: 1;
}>;
```

`comments.toJSON()` returns this envelope synchronously. `threads` contains
latest conversation state; `ranges` contains only range-target projections for
that document revision. Change IDs remain in semantic threads because they are
stable authored identities. The application atomically stores `{ revisionId,
conversationGeneration, document, comments }` and verifies that association
before constructing an editor. Plate validates versions, duplicate IDs,
timestamps, target agreement, and range restoration against the loaded
document, but it does not invent or duplicate the application's revision ID.

`CommentsPlugin.configure({ initialState: { initialComments, currentUserId,
users } })` replaces `initialThreads`. The plugin strictly decodes
`initialComments`, restores private anchors after the document and relevant
content plugins exist, and fails before the editor mounts. There is no public
`save`, `load`, `fromJSON`, or second checkpoint codec for the same operation.
Examples and tests that need authored fixtures construct a `CommentsJSON`
envelope explicitly through a test helper; no loose live-record loader survives
as public persistence API.

`EditorDocumentRange` stays opaque. It preserves root, association, deletion
policy, and optional Authored binding without making Comments depend on
Authored. The selected Plite optimization omits the redundant resolved Range
when an authored binding exists because restore exclusively uses that binding
and already fails when its authored history is missing. Ordinary saved ranges
retain their defensive JSON snapshot.

The runtime attachment read is:

```ts
export type CommentAttachment =
  | Readonly<{ range: Range; status: 'attached'; type: 'range' }>
  | Readonly<{ status: 'unavailable'; type: 'range' }>
  | Readonly<{ id: string; type: 'change' }>;

comments.attachment(threadId): CommentAttachment | null;
```

This replaces `range(id)`. `unavailable` covers deleted source text, a hidden or
missing Authored projection, a historical revision without a target, and other
unlocatable states. The package must not label a target “deleted” without lower
provenance. The panel keeps the thread and original excerpt; inline presentation
appears only for attached targets.

## Persistence, history, and versions

Normal save and reload is deliberately simple:

```ts
const revision = {
  comments: comments.toJSON(),
  conversationGeneration,
  document: editor.read.value(),
  revisionId,
};

await repository.put(revision, { ifMatch: previousRevision });
```

Loading verifies the repository revision association, creates a fresh editor
from `document`, installs `initialComments`, and then mounts. Local undo starts
empty. `History.toJSON` remains an explicit advanced API for applications that
need the document's local undo stack after reload; it does not serialize native
anchor recovery and is not part of Comments persistence.

An old version preview combines current retained conversations with the range
target set saved for that exact old document revision. Newer threads without an
old target are unavailable; currently deleted threads remain absent; change
targets are available only when their ID exists in that Authored document.
Restoring a version creates a new application revision under document-head and
conversation-generation CAS, retains current conversations, installs only the
selected revision's proven targets, and opens a fresh editor. It is not local
undo and does not use `value.replace` on a published editor.

If a concrete non-Comments consumer later requires exact native-anchor recovery
with local History after reload, the next owner is a separate Plite
`DocumentHistoryCheckpoint`. It would be fresh-editor-only, make History
mandatory, translate selected runtime anchor IDs to checkpoint-local slots, and
serialize recovery only for those selected anchors. It must reject schema,
editor, codec, and slot mismatches before publication. That feature is deferred
until a real consumer exists; Comments neither implements nor depends on it.

## Durable mutation boundary

All durable actions use one adapter and one always-awaitable result family:

```ts
export type CommentMutationRequest = Readonly<{
  mutationId: string;
  operation: CommentOperation;
  previous: CommentThread | null;
  proposed: CommentThread | null;
  attachment?: EditorDocumentRange;
}>;

export type CommentMutationDecision =
  | Readonly<{ status: 'commit'; thread: CommentThread | null }>
  | Readonly<{ code?: string; status: 'reject' }>;

export type CommentMutationResult<T = undefined> =
  | Readonly<{ status: 'applied'; value: T }>
  | Readonly<{ status: 'invalid' }>
  | Readonly<{ code?: string; status: 'rejected' }>
  | Readonly<{ status: 'stale' }>;
```

`CommentsPlugin.configure({ initialState: { mutate } })` receives a structurally
valid proposal and returns the canonical server-approved record or rejection.
The default local adapter commits immediately. The plugin publishes only after
commit; errors and rejection preserve the prior record and composer. Operations
are serialized per thread and fenced by a local generation so retirement or an
unexpected replacement returns `stale`. `mutationId` lets application storage
make retries idempotent. Cross-client CAS remains application-owned.

`create`, `createThread`, `reply`, `edit`, `resolve`, `reopen`, `removeMessage`,
`removeThread`, and `publishDraft` return `Promise<CommentMutationResult<…>>`.
`begin`, `cancel`, `createDraft`, and `discardDraft` remain local. Remove
`resolve(id, false)` and expose `reopen(id)`. Package code retains structural
validation and removes hardcoded owner authorization. Copied UI may hide
controls, while the adapter is the actual authorization boundary.

## Synchronization and collaboration

`subscribeThreads` reports semantic record IDs only. Rename the existing range
subscription to `subscribeAttachments`; document mapping wakes attachment
subscribers without rewriting thread records or waking semantic persistence.
Explicit checkpoint export never runs from either subscription.

Delete `setThreads`. It currently serves both initialization and a three-editor
demo that manually preserves each recipient's target while replacing records.
That is not a safe live synchronization protocol. The proof constructs fresh
independent editors from the same saved revision instead. The initiating editor
can receive canonical records through the mutation adapter. Real-time remote
comment sync remains unsupported until it has ordering, removals, generation,
origin, conflict, and collaboration-relative target transport.

Yjs admission stays outside v1. The current controller imports the ready room
as one replacement and does not replay changes since a saved state vector
through restored anchors. Exact state-vector equality can admit coordinates for
the exact room baseline, but persisted local undo remains rejected. A changed
baseline needs a Yjs-relative range target or an admission pipeline that starts
from the saved Y.Doc and replays the delta. A state vector alone is not enough.

## Behavior contract

| Action | Conversation | Attachment / history |
| --- | --- | --- |
| Delete part of quoted text | Keep messages and resolution | Map remaining coverage |
| Delete all quoted text or block | Keep published thread and excerpt | Report unavailable when no range can be shown |
| Undo / redo in the live session | Do not rewind conversation data | Restore/remove exact mapped coverage through the native anchor |
| Reload saved revision | Restore saved conversation state | Restore opaque ranges; start fresh local undo |
| Resolve / reopen | Record latest canonical actor and time or clear it | Keep attachment unchanged |
| Explicitly delete a message/thread | Remove it under adapter policy | Document undo never recreates it |
| Accept/reject/undo a suggestion decision | Preserve the conversation | Follow Authored change ID and current decision state |
| Open an old version | Join current conversations with that revision's targets | Read-only; absent targets are unavailable |
| Restore an old version | Keep current conversations under CAS | Create a new revision and fresh editor/history |

Decision ledger:

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Live location | Range copied into every `CommentThread` and rewritten on mapping | One private native Anchor; `CommentThread` keeps only target identity | Plate Comments over Plite Anchor | Removes duplicate hot state and semantic churn | Migrate selectors, discussion index, tests, and docs | Mapping/undo tests plus subscription isolation | Hidden code may read `thread.target.range` | rearchitect |
| Saved location | Plain Range inside live records | `EditorDocumentRange` emitted only by explicit `toJSON()` | Plite Anchor codec; Plate envelope | Preserves policy and optional Authored identity | Add `CommentsJSON` and `initialComments`; remove persistence via `getThreads` | Passing frozen target prototype and JSON roundtrip | Authored fallback omission must fail closed | rearchitect |
| Generic checkpoint | No atomic generic envelope; prior proposal bound document/ranges/History/plugin state | No default generic checkpoint | Application revision store; existing Plite codecs | Ordinary Comments does not need persisted local undo | Clarify History docs and demo wording | Reload probe isolates the gap to restored local History | Future real consumer may justify a separate feature | cut |
| Persisted local undo | Optional `History.toJSON/fromJSON` | Independent advanced API; Comments reload starts fresh | Plite History | Browser undo and version history are different jobs | No Comments adoption | Current docs and demos already treat local history separately | Users may assume page reload retains undo | keep |
| Saved envelope | `initialThreads`/`getThreads` mix runtime and storage | Versioned `CommentsJSON` with semantic threads plus revision range targets | Plate Comments | Names the saved lifetime without a second runtime store | Replace examples, fixtures, docs, and initial state | Strict malformed/duplicate/version tests | App can still mispair revisions if it ignores its CAS | rearchitect |
| Attachment read | `range(id): Range | null` conflates causes | `attachment(id)` with attached or neutral unavailable, plus change ID | Plate Comments | Exposes only provable state | Migrate panel labels and inline placement | Delete/hide/missing-revision cases | Less specific copy than an unproven deleted label | rearchitect |
| Durable actions | Mixed boolean/promise methods and hardcoded owner rules | One async mutation adapter and typed result; no optimistic publication | Plate Comments + app service | Supports authorization, persistence failure, and canonical server records | Migrate every action and copied UI pending/error state | Rejection, throw, concurrency, retirement, policy tests | Per-thread latency and queue semantics | rearchitect |
| Initialization vs live sync | `setThreads` does both | Strict fresh-editor initialization; no public live replacement | Plate Comments | Prevents foreign targets entering advanced editors | Rebuild three-editor proof from saved revision; delete callers | Independent-editor restore test | Real-time apps need a later protocol | cut |
| Subscriptions | Thread events include mapped document changes | Semantic thread and attachment channels | Plate Comments | Prevents persistence work on typing | Migrate hooks and proof consumers | Exact listener wake tests | Caller may have depended on broad wakeups | rearchitect |
| Version history | Ad hoc whole-record snapshots | App revisions store exact target set; current conversations join by ID | Application | Conversations do not rewind with documents | Update persistence/version demo and docs | Historical preview/restore fixtures with CAS | Backend retention can make targets unavailable | move |
| Collaboration | Saved coordinates may be restored before Yjs room replacement | Unsupported across changed baseline; require relative target/replay later | Plite Yjs + app transport | Current admission cannot map missed changes | Document the boundary; no v1 shim | Two-peer proof required before future claim | Stale coordinates if app bypasses the boundary | defer |
| Non-text targets | Range and Authored change only | Remain explicit non-goal until a durable node target exists | Future Plite primitive | Path/quote hacks are not durable | No adoption | Separate design and browser proof | Incomplete Google parity remains explicit | defer |
| Activity/tombstones | Proposed extra stores | No mandatory store | Application backend when required | Does not solve attachment identity and duplicates ownership | Delete proposal language | Current jobs work with keyed current records | Audit products may need server logs | cut |

Execution slices:

| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Opaque range fast path | Plite Anchor | Omit redundant resolved fallback for authored saved ranges and reuse trusted immutable authored binding | Accepted plan | Codec remains strict and all frozen cohorts pass on production source | Focused anchor/Authored codec tests; exact scale script; JSON/tamper/missing-history guards |
| 2. Live/saved Comments split | Plate Comments | Remove copied live Range; add `CommentsJSON`, `toJSON`, `initialComments`, `attachment`, and split subscriptions; delete `setThreads` | Slice 1 green | One private live owner and strict fresh-editor restore | Package unit/type tests, independent editors, mapping/undo, malformed input, subscription isolation |
| 3. Durable mutation boundary | Plate Comments and copied UI | Add one `mutate` adapter, typed results, per-thread ordering, resolution metadata, `reopen`, local draft operations; remove owner checks and boolean overloads | Slice 2 green | No durable action publishes before commit; all UI awaits results | Adapter rejection/throw/stale/concurrency tests and copied component tests |
| 4. App and docs adoption | Registry/examples/docs | Replace loose persistence and three-editor replacement, add historical target join example, repair current docs and UI labels | Slice 3 green | No caller or teaching uses removed surfaces | `rg` sweeps, source-typed examples, registry build, relevant docs link checks |
| 5. Browser and doctrine closure | Verify Plate + Best API repair | Run behavior/browser proof, rerun scale on final path, repair Vision/Plate Next/affected source rules, regenerate mirrors | Slices 1–4 green | Production behavior, scale, generated registry, and teaching agree | Focused package checks, Chromium comment suite, registry generation, doctrine mirror checks |

Proof matrix:

| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Live anchor is the only mapped owner | Current source shows copied Range rewrites from annotation changes | Thread identity stays stable and only attachment listeners wake on mapping | ready |
| Opaque saved range fits the frozen budget | Third disposable prototype passes all 16 rows | Same receipt rerun against committed production path | ready |
| Live deletion undo restores exact span | Existing focused tests and browser case passed in prior review | Ordinary/Authored partial/full/block deletion with repeated undo/redo | ready |
| Reload intentionally starts fresh undo | Current demos save document and threads, not History | Reload test asserts empty undo and correct current attachment | ready |
| Durable failure causes no flicker or data loss | Current mixed boolean/promise behavior is insufficient | Every verb rejects/throws without publication; composer remains | ready |
| Historical preview does not rewind conversations | Ownership analysis and revision model | Latest threads + old targets; new unavailable; deleted absent | ready |
| Changed Yjs baseline is unsupported | Current admission replaces from ready room without replay | Documentation assertion; any future claim needs two-peer offline/reconnect proof | ready |

Scale contract:

- applicability and source evidence: explicit persistence resolves and serializes
  1 to 10,000 native anchors; no serialization runs on typing.
- user operation, current owner, proposed owner: application Save; current
  copied plain Range versus explicit `editor.anchor.save` through Comments.
- cohorts: 1, 100, 1,000, and 10,000 ordinary and Authored range anchors; one
  selected target and the full cohort.
- frozen budget: one target adds at most 0.1 ms p95; a full cohort is at most
  baseline p95 × 2 + 10 ms and at most 100 ms; 3 warmups, 15 alternating paired
  samples; no unchanged retry converts a failed receipt.
- baseline and target: `serialization-scale.ts`, original failed
  `serialization-scale-result.json`, target patch, and passing
  `authored-range-save-result.json` in the evidence directory.
- deterministic indicators: exactly requested anchors visited, one saved object
  per target, bytes reported, source hashes fixed through each run.
- result: all 16 target rows pass. At 10,000, ordinary full-cohort p95 is
  70.684 ms under its 81.425 ms budget; authored is 22.492 ms under 100 ms.
  Payloads are about 5.03 MB ordinary and 9.83 MB authored.
- correctness guard: every opaque range JSON-round-trips against the matching
  document, resolves to equal endpoints, and remains recursively immutable.
- final production rerun: Slice 1 runs the exact cache command documented in
  the evidence README after applying production code; a failure reopens the
  design rather than adding debounce or background inconsistency.

Conditional evidence:

- High-risk scenarios: a foreign app revision with valid-looking coordinates
  must be rejected by app revision association; a missing Authored operation
  must reject opaque restore rather than use a stale fallback; concurrent async
  actions must serialize or return stale without overwriting; Yjs baseline drift
  must remain unsupported; 10,000-target export must never run from typing.
- External research: official Google and Notion help supports distinct explicit
  resolve/reopen/delete actions and durable panel access, but does not specify
  internal anchor or version-restore storage. The supplied Google document was
  not mutated during this design pass; reload observations were inconclusive
  for persisted undo.
- Issue/PR provenance: inapplicable; no issue, PR, or publication requested.
- Docs/registry/browser/release/behavior-law owners: docs, registry examples,
  generated registry, and browser proof apply in execution; release is
  inapplicable.
- Performance pack: applies and passes as recorded above; production rerun is
  mandatory.

Findings:

- The 38-second tracked-change work and Comments persistence are separate. The
  remaining Comments hot-path smell is copied mapped Range data; explicit save
  belongs off the edit path.
- The ordinary reload probe fails exact anchor expansion only when local History
  is restored. A normal Comments reload does not restore that History and does
  not need a joint checkpoint.
- The original 10,000-authored-anchor candidate spent work resolving a Range
  that authored restore ignores. The third bounded prototype removed that
  redundant work and passed the frozen scale gate.
- `setThreads` is an initialization/live-sync collision, not a reusable sync
  API. The existing proof consumer manually preserves targets because the API
  cannot own that job safely.
- `range === null` cannot prove deletion. Neutral unavailable state is the only
  honest v1 contract.

Decisions and tradeoffs:

- Save the opaque range even with fresh undo because it preserves root,
  association, deletion policy, and optional Authored identity. The extra
  payload is accepted because the target passes time budgets and only runs on
  explicit save.
- Keep one versioned Comments envelope rather than separate public semantic and
  target codecs. Applications may store its thread and range sections under
  different lifetimes, but Plate exposes one decode path.
- Use server-first publication rather than optimistic rollback. Comment writes
  are not latency-critical enough to justify two states and rollback bugs.
- Defer collaboration-relative and non-text targets instead of weakening the
  text contract with paths, quotes, or state-vector theater.

Review fixes:

- Supersedes the prior requirement for a joint generic checkpoint.
- Replaces the failed authored serialization result with a measured target that
  passes by deleting redundant resolved data, not by loosening the budget.
- Separates ordinary reload, persisted local History, application version
  history, and Yjs admission.
- Makes live synchronization unsupported instead of disguising replacement as
  sync.

Error attempts:

| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Generic per-anchor opaque serialization exceeded the 10,000 authored budget | 1 | Test shared batch snapshot | Batch still exceeded the cap and did not improve ordinary p95 |
| Shared batch snapshot did not clear the gate | 1 | Remove redundant authored Range resolution | Third bounded prototype passed all frozen rows |

Verification evidence:

- Source was restored after the disposable prototype; SHA-256 for
  `packages/plitejs/src/core/anchor.ts` is
  `6df095b85a977f3954571f5e95b0c9d75955ef4be4c910d751ac5545bdf2f34b`,
  matching the pre-prototype review fingerprint.
- `docs/plans/artifacts/comments-history-api/authored-range-save-result.json`
  records the passing third trial with source hashes, raw timings, bytes,
  deterministic visits, and correctness guards.
- `git diff --check` passes for the plan/evidence paths.
- Review-ledger render/check and Autogoal `check-complete` are the final commands
  recorded after this plan and its superseding review record are written.

Final handoff prepared:

- Ownership and target API: Comments keeps semantic records and private anchors;
  Plite keeps the opaque range codec; application storage keeps revisions, CAS,
  authorization, and version selection.
- Public breaks and adoption: remove live target ranges, `initialThreads`,
  `getThreads` persistence, `range`, `setThreads`, mixed thread events,
  hardcoded owner policy, and `resolve(id, false)`; migrate package, copied UI,
  demos, docs, and generated registry in five slices.
- Runtime/package/docs/browser decisions: explicit save only; fresh undo on
  reload; no changed-baseline Yjs claim; final Chromium and registry proof.
- Scale result: target prototype passes every frozen row; production must rerun
  the exact contract.
- Execution risks: strict Authored restore, application revision pairing,
  async concurrency, and hidden callers are covered by slice exits.
- Execution order: Plite codec, Comments model/persistence, mutation boundary,
  app/docs adoption, then browser/doctrine closure.

Timeline:

- 2026-09-17: execution source check corrected the stale `options.mutate`
  spelling to the existing configured callback owner, `initialState.mutate`.
  No separate plugin options grammar is introduced.

- 2026-09-16: prior deletion/history review selected private anchors, retained
  conversations, and rejected activity/tombstone machinery.
- 2026-09-16: final adversarial pass exposed generic-checkpoint, sync,
  attachment-provenance, and durable-mutation problems.
- 2026-09-16: this design cut persisted local undo from ordinary Comments,
  rejected the generic checkpoint, found and measured the authored range
  serialization cause, and prepared the implementation plan.

Reboot status:

| Question | Answer |
| --- | --- |
| Where am I? | Ready plan, awaiting implementation authorization |
| Where am I going? | Execute five slices in dependency order |
| What is the goal? | Durable scalable Comments persistence without a generic checkpoint |
| What have I learned? | Persisted local undo created the false checkpoint requirement; authored save also resolved redundant data |
| What have I done? | Selected API/owners, passed scale target, defined adoption and proof |

Open risks:

- The target codec optimization has design-probe evidence but no production
  correctness suite yet; Slice 1 owns that proof.
- Application storage must enforce revision/generation pairing because Plate
  cannot identify a same-shaped foreign document.
- Real-time collaboration and non-text targets remain explicit separate
  features, so this plan does not claim full Google Docs parity.
