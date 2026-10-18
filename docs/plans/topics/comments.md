# Comments data and discovery

The Comments package owns serializable thread records, editor binding, range mapping, subscriptions and disposal. Applications own database I/O, authentication and authorization, and copied UI owns presentation. Unavailable and resolved threads are found through one lazy **All comments** dialog, while live per-block Floating Discussion stays. The 2026-10-04 audit found the retained-target runtime live and stopped ([triage audit](../2026-10-04-ledger-triage-audit.md), [history API plan](../2026-09-16-comments-history-api.md), [discovery plan](../2026-09-18-comments-attachment-discovery.md)). `node tooling/scripts/review-ledger.mjs show comments` prints the full history.

## Layer and owner

| Responsibility | Decision |
| --- | --- |
| Thread records | [BaseCommentsPlugin](../../../packages/platejs/src/features/comments/BaseCommentsPlugin.ts) declares immutable semantic `CommentThread` records and private native anchors; `attachment(id)` projects the live location. |
| Persistence | `initialComments` loads a versioned `CommentsJSON` envelope; `api.toJSON()` saves published threads with opaque ranges for the exact accompanying document revision. Applications own revision identity, storage, authorization, concurrent-write policy and retention. |
| Writes | Every durable mutation awaits `initialState.mutate` before publishing a canonical thread. Per-thread queues keep invocation order, retirement fences pending results, and local drafts stay private until publication. |
| History | Local thread creation adds one session-only effect to native document history after the app mutation commits; undo removes or restores only an unchanged one-message thread. Replies, edits, resolution and deletion stay outside document history, and session effects are not persisted, so reload starts with no comment undo. |
| Resolution | Stores actor and time and reverses through Reopen, outside document undo. Accepting or rejecting a suggestion stays one atomic history operation, and its conversations survive. |
| Deleted targets | A published conversation survives deletion of its text. A missing target leaves live block counts and inline paint; it never removes the conversation. Unrelated later typing stays unavailable; exact undo and redo restore the target. |
| Several views | One native target resolves in the requested view through the anchor handle; Comments keeps only derived per-view indexes. Input ranges belong to the calling editor; records, queues and anchor lifetime are shared. |
| Successor lineage | Plite's private `AuthoredIndex` owns operation-local successor facts against live postings in the exact accepted, proposed or markup root. Ordinary anchors use operation-local replacement runs in their mapper. Separate updates never inherit because undo grouped them. |
| Discovery UI | One lazy **All comments** dialog in the comment toolbar item, with All, Open and Resolved filters, 20-thread pages and current-view navigation. Unavailable wording stays neutral, since a missing range can also mean a hidden projection. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| App-owned thread data (the 2026-09-04 boundary) | The 2026-09-09 request chose package-owned data integration; the earlier review is evidence for its own requirements, not a veto. |
| A mandatory activity log or a second history store | The open and resolved panel does not need one; current-state conversations, document history and authored provenance keep their own owners. |
| A generic editor checkpoint and live `setThreads` replacement | Reload creates a fresh editor with fresh undo; version previews join a historical document with app-selected records. |
| Model-bound attachment and block indexes | Cannot paint independently projected views; reproduced as a five-to-four discussion failure. |
| Serializing and rebinding per view, or semantic writes to force a repaint | Duplicate the shared target. |
| Clamped or remembered placement of unavailable threads | Put a comment on a different block after removal. |
| Switching every anchor to `drop` | Loses the ordinary exact-undo recovery contract. |
| Restoring the sidebar or mode switch, a history plugin, or copying anchors into another store | The existing `attachment()` and subscription contracts already serve the job. |

## Rules

These rules bind this feature alone, so they live here instead of in `docs/vision/`.

- Comments owns semantic thread records, actions, subscriptions and private
  native range handles per editor. Applications load
  `initialState.initialComments` and persist `api.toJSON()` with the exact
  document revision. The saved envelope separates conversations from opaque
  range targets; live records retain target identity and `attachment(id)`
  supplies current coverage or neutral unavailable state. Semantic subscriptions
  never wake for document mapping. The seed is not a second live store. Database
  I/O, revision association, CAS and authorization stay with the application
  through `initialState.mutate`; copied Comment/Discussion UI owns presentation.
  BaseCommentsPlugin owns semantics and CommentsPlugin adds live interactions.
  Consumers do not assemble a channel, provider, factory or anchor-binding
  effect. Reuse Plite Annotation plus plugin Decoration for mapped locations and
  paint. Body or metadata changes perform zero annotation resolution and zero
  editor-node refreshes. Independent editors restore their own native handles
  from the same saved revision. Ordinary reload starts a fresh undo stack; live
  replacement and changed-baseline collaboration require their own proven
  transport contract. Activation stores selected IDs; keyed writes retain
  unrelated records and membership lists. Durable actions serialize per thread
  and publish only after canonical commit; rejection preserves records and
  composers. Draft operations stay local. Resolve/Reopen and explicit deletion
  are independent of document undo. Loading preserves identity, authorship,
  timestamps and status without replaying user commands. A published
  conversation remains discoverable when its target has no current-view
  coverage. Exact live coverage alone owns inline paint, block counts and
  navigation; cached coordinates and surviving neighbor endpoints never relocate
  a thread. Bounded copied UI resolves only its mounted page and labels missing
  coverage neutrally. Document undo may restore target identity, while unrelated
  later typing cannot inherit it. Document mapping notifies attachment
  subscribers without rewriting conversations or triggering semantic
  persistence. Durable comment actions return a typed awaited result, and the
  package fences late work from a retired owner so it never publishes. Copied
  Comments UI queries attachments and targets through the event or render slot's
  exact editor, because one shared conversation can have different coverage in
  two projected views. Document-level discovery adds no Comments location store,
  whole-corpus attachment subscription, mandatory Suggestion dependency or
  generic Editor surface. Replies and edits stay outside document undo too, and
  a generic checkpoint, live record-replacement API or separate comment undo
  stack needs an independent supported job.
- Successful local thread creation joins the one document-history order through
  a session-only effect after its durable commit. Replay returns a pending
  history result while the same mutation owner finishes. Replaying that history
  entry blocks on replies, canonical divergence or rejection, and settles failed
  when the owner throws, without advancing to the next document change. User
  records live in the ordinary plugin store, and threads, replies and
  resolutions record the editor's `userId`. An
  authoritative full-document import prepares its document, comments, users and
  required plugin state in a detached candidate editor and swaps the editor
  owner through a keyed remount; candidate failure preserves the mounted editor,
  and document, comment and user replacement is never sequenced on the mounted
  editor. Keeping the editor instance instead needs one owner that publishes or
  discards every affected runtime resource as a unit, and without that owner the
  import is rejected before mutation. A successful authoritative
  import bypasses ordinary mutation and history, clears transient composer
  state, fences late work from the retired snapshot, and never exposes
  per-thread replacement.

## What other editors do

Google Docs lists deleted-target suggestion entries in its comments view; that observation did not replay ordinary deletion, boundary replacement or every pending-deletion transition.

## Main changes

- One retained native target per thread replaced per-view rebinding, and copied UI lost its clamped placement and its always-mounted unavailable list.

## Open work

- Persisted local undo, changed-baseline Yjs target transport, non-text targets, per-thread message rendering and full Google Docs parity are separate jobs. owner: the next comments review. stop: a consumer for one of them.
