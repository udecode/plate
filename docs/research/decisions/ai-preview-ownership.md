---
title: AI preview ownership
type: decision
status: adopted
updated: 2026-09-17
review_scope: ai
current_review: 2026-09-16-ai-main-regression-closure
review_history:
  - ../review-records/2026-09-16-ai-preview-ownership.json
  - ../review-records/2026-09-16-ai-preview-adoption.json
  - ../review-records/2026-09-16-ai-main-regression-audit.json
  - ../review-records/2026-09-16-ai-main-regression-closure.json
related:
  - ../reviews.md#ai
  - authored-change-ownership.md
  - ../../plans/2026-09-16-ai-continuation-render-recovery.md
---

# AI preview ownership

**Keep temporary AI generation outside the persistent suggestion workflow.**
The adopted implementation preserves the user's editing intent, renders one
temporary purple draft, and applies it with one normal transaction. Native
interaction and the frozen package scaling comparison support this target.
No additional public draft, branch or projection primitive is justified for
this job. This bounded decision does not certify the entire AI/Copilot surface.

## Comment approval reconsideration — September 17

**Cut the AI comment approval workflow.** The explicit Comment
command requests feedback attached to content. Completed feedback should use
ordinary comment threads and their existing controls. An additional Keep this
comment decision has no independently required job. The implementation removes
its approval bar, request-owned completed-comment list and close/replacement
rollback while retaining request fencing for unfinished asynchronous work.
Stop keeps completed comments and prevents further generation. Manual comment
composer drafts remain useful.

This supersedes only the generated-comment draft portion of the previous
lifetime decision. The temporary preview and Accept/Discard workflow for
document edits remains adopted. Hiding the bar or adding an approval flag would
preserve the unnecessary lifecycle. No new public AI comment primitive is
justified by current evidence.

The transport creates a private draft only while asynchronous thread creation
is unresolved, publishes it immediately for a live request, then hands all
later edit, delete and resolve actions to the normal Comments owner. A retired
request discards only unresolved work. Focused lifecycle and browser proof are
recorded in
[the implementation plan](../../plans/2026-09-17-ai-comment-approval-cut.md).

The bounded assessment is retained in
[the review draft](../../plans/artifacts/ai-comment-approval-review.json).
Formal record/check is blocked by an unrelated missing table evidence path
(`packages/platejs/src/react/features/table/useTableSelectionDOM.spec.tsx`)
and stale source inventory. The indexed earlier record remains unchanged.

## The demonstrated failure

On the AI Menu docs demo, native Enter after the heading, Space, Continue
writing starts in Editing and ends in Suggestion with green generated text.
Chrome's rendered spans carry native pending-change and current-author
attributes. The copied Suggestion kit correctly paints those records green.

The package causes that state: both stream insertion and edit application call
`tx.authored.propose`, then schedule `setView({ intent: 'propose', projection:
'markup' })`. They save the old view for a later restore. The user's input
policy is being borrowed to expose AI output. The default-mode correction
removed initial propose overrides but explicitly retained this transition.

There is also a presentation contract break. The stream adapter calls
`insertChunk` without AI text props. Its insertion path creates authored changes,
whereas the copied `AILeaf` supplies purple text and the trailing streaming
indicator only when an AI mark renders. Chrome has no purple AI leaf or its
pseudo-element during the observed stream. Local `main` source in
`apps/www/src/registry/ui/ai-node.tsx` contains that purple presentation and
trailing indicator. This is source comparison, not a full main runtime replay.

The native caret and the AI streaming indicator are different. Chrome showed a
native caret in some streaming/completed frames. The missing dedicated AI
indicator is reproduced; universal absence of the native caret is not. The
completed menu input owns focus, so focus, caret position and caret paint need
separate phase assertions.

## Required behavior

- Opening, streaming, reviewing, retrying, cancelling and applying AI output
  preserve the user's chosen editing intent. A later explicit mode choice
  cannot be overwritten by restoring an earlier snapshot.
- Rich Markdown/MDX previews stay inline for insertion and in the existing
  review presentation for selection edits. Color and the visible generation
  end belong to AI presentation.
- Temporary output does not expose unrelated suggestions, become a human
  suggestion discussion, or require a saved tracked-change record to render.
- Apply uses one normal editor transaction and respects explicit Suggestion
  mode. Discard drops the draft; it must not undo unrelated local or remote
  edits. The accepted document continues through the native authored/history
  owner when that capability is installed.
- Target identity survives supported edits, cancellation and view retirement.
  No full-document snapshot/restore, serializer feedback loop, competing
  history engine or feature-owned DOM mutation protocol.

## Alternatives

| Direction | Assessment |
| --- | --- |
| Restore the AI mark or override suggestion colors | Repairs paint only. The mode change, saved-view restore and suggestion lifetime remain. Insufficient for this report. |
| Remove the view switch | Accepted projection hides pending output. This breaks inline generation instead of restoring it. |
| Permit `edit/markup` in Plite | A real alternative, not a one-line validation change. Current update routing chooses accepted versus proposed coordinates from intent. Editing pending text needs a defined mapping policy, and markup still exposes unrelated proposals. This alone does not remove AI's transient/durable lifetime coupling. |
| Add an AI origin flag or a filtered transient authored branch | Could distinguish or isolate records, but preserves per-stream authored work and introduces another projection/filter lifetime. It must beat the simpler draft candidate with executable evidence before earning a public primitive. |
| Reuse the existing detached AI preview for every temporary response; apply once | Adopted. Removes AI's save/switch/restore protocol and separate proposal-versus-detached application paths. Retains the normal authored engine for the final user edit or explicitly requested tracked suggestion. Native replay and bounded scale measurements pass. |

## Adopted ownership

```text
transport text → AIChatPlugin's temporary draft + stable target
              → copied inline/popup rich preview + streaming indicator
Apply         → one normal editor update under the user's chosen intent
Discard       → release the temporary draft
```

`api.setPreview(content, { requestId? })` consumes the full accumulated Markdown
response. `api.setTablePreview` consumes request-local cell references and
content. Both update `previewValue`; neither edits the source document or its
history. Canonical Markdown parsing owns rich node construction. The serializer
feedback loop and public per-chunk insertion helpers are deleted.

The existing static `AIChatEditor` paints the draft and its generation-end
indicator. Sparse keyed node attributes activate one private inline wrapper;
selection output uses the same preview in the menu. No AI subscription is
installed on every source block. Native anchors track text targets; node keys
track block and table-cell targets. Request fencing and view retirement release
stale work. Deleted targets fail without applying to another location.

Accept uses normal commands under the current intent with one history batch.
Explicit Suggestion mode creates tracked output only at application. Discard
releases the draft and restores the mapped invoking selection. There is no
saved mode to restore and no AI dependency on the authored plugin. The earlier
native authored key/history repairs remain independently valid.

## History reconciliation and proof

The September 16 recovery plan's keep-native-proposals conclusion addressed
node-key loss and localized rollback. Its assumption that AI may temporarily
switch the invoking view is reversed by the explicit mode requirement and
native reproduction. The successful key/history fixes remain valid. The
September 10 independent-draft plan is relevant prior reasoning, not an
accepted or implemented target.

The durable doctrine that human and AI proposals share native authored records
still applies to actual tracked proposals. The Best API source rule, Plate
Vision, AI reference documentation and release note distinguish temporary
generation from tracked proposals. Plate Next doctrine version 203 records
the adoption and its checks; generated mirrors pass validation.

The existing browser cases now assert unchanged Editing, purple draft paint,
no pending authored records, the streaming end indicator, and source preservation.
Discard must restore native input without a test-side reselection. Generate and
Edit selection previews, complete MDX, accept, retry, subsequent typing and
undo/redo are exercised. Native Chrome separately verifies the reporter's
heading/empty-paragraph path and the visible caret after accepted typing.

The final production package path passes three isolated samples for each of six
cohorts: 1/10/100 KiB output and 1/1,000 source paragraphs, with 128-character
chunks and final apply included. The 100 KiB/1,000-paragraph median is 10.28 s
versus the frozen baseline's 37.55 s; maximum publish is 39.14 ms. These are
local package costs, not browser or production latency guarantees. Full
receipts, Chrome timings, exact source identity and remaining typecheck blockers
are in the recovery plan.

Verdict: Stop further architecture expansion for this preview job. The broader
AI/Copilot audit remains queued. Proof remains partial at that global scope;
unrelated authored project-reference and comment/history contract diagnostics
prevent an all-repository typecheck claim.


## Main parity and dismissal follow-up

The dismissal reporter contradiction reopened this decision. The broad source
comparison against main is complete at the job inventory in the recovery plan;
its runtime proof remains bounded there. Independent package and demo audits
found target, transport, comment review and static-render regressions.

Keep one temporary document draft and cut the overlapping lifetimes. `hide`
cancels and discards unaccepted document output; `stop` flushes received
document output and retains it for review. Outside-click dismissal preserves
the clicked destination. Each request owns its mapped target, callbacks,
response references and unresolved comment creation. Completed generated
comments are ordinary published threads and survive request retirement. Retry
cannot adopt another target after deletion. Since the SDK callbacks have no
request identity, each request uses its own SDK chat instance while retaining
conversation messages. Unrelated comment drafts never enter AI behavior.

Partial multi-paragraph application reuses the canonical slice fitter; its
cross-leaf candidate repair preserves schema and protected-boundary validation.
The Space command opens from its committed selection, even when the root owner
has no selection. Copied UI only measures its anchor; it does not redefine the
request target. Static streaming reuses the canonical runtime subscription.
No further public draft, projection or session abstraction earns its cost.

The earlier dismissal coverage was insufficient: the hide unit case had no
draft, and browser tests used explicit Discard. The expanded suite asserts
Escape and outside-click, caret/destination preservation, subsequent typing,
late transport isolation, buffered Stop, exact target retry, comments isolation,
and nonempty semantic output in both streaming modes. Native Chrome replay
confirms Escape clears the completed draft and restores immediate typing.
Doctrine version 204 records the lifetime law. Evidence and unproved provider,
IME, deployment and broader type gates are retained in the plan and review record.

Verdict: retain the adopted preview architecture with the repaired request
ownership. The all-job source audit is complete; it is not an exhaustive
end-to-end certification of every provider and editor state.
