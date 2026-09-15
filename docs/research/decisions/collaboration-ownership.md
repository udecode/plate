---
title: Collaboration binding, transport and presence ownership
type: decision
status: implemented
updated: 2026-09-14
review_scope: collaboration
current_review: 2026-09-14-collaboration-lifetime-implementation
review_history:
  - ../review-records/2026-09-14-collaboration-lifetime-ownership.json
  - ../review-records/2026-09-14-collaboration-plan-readiness.json
  - ../review-records/2026-09-14-collaboration-lifetime-implementation.json
  - ../review-records/2026-09-14-plugin-factory-mapping-implementation.json
---

# Collaboration binding, transport and presence ownership

Status: **Implemented; adopted and verified** for ledger item 10,
`collaboration`. The
[completed lifetime plan](../../plans/2026-09-14-collaboration-lifetimes.md)
and [implementation review](../review-records/2026-09-14-collaboration-lifetime-implementation.json)
supersede the earlier deferred assessment. They record the combined lifecycle,
package, real-provider/browser and balanced composite performance evidence,
including broader checkout failures and unrun manual soaks.

The subsequent [plugin-factory implementation](plate-core-ownership.md) keeps
resource construction explicit and preserves the implemented collaboration
lifetime laws. `YjsPlugin.create(options)` constructs the complete Plate
descriptor. Copied UI derives `CollaborationPlugin` once with
`YjsPlugin.require('awareness').map(stage)`, then calls
`CollaborationPlugin.create(options)`. The native Yjs owner remains the sole
source of option-dependent document, presence, compaction, and cursor-data
capabilities.

Question: Which native change and identity contracts should providers reuse
for local, remote and reconnect behavior?

## Earlier 2026-09-14 adversarial follow-up

The following assessment records the pre-implementation state and the gaps
subsequently closed by the implementation review above.

The earlier readiness claim overreached its evidence. Live-source and caller
review found material omissions: shared-effect decode failures are swallowed;
waiting/error edits currently commit and compensate instead of being rejected;
same-document replacement conflicts with compaction authority; post-publication
observer failure cannot restore the prior binding; and one awareness client has
no defined owner across multiple mounted views.

The public-surface audit also changes the target. Delete the live `read.yjs`
group and the unearned neutral Hocuspocus helper, retain `YjsUpdatePolicy` for
the documented custom-adapter job, infer presence and compaction API methods
only when their capabilities are configured, and specify all four package
entrypoints. The demos need an actual exclusive seed owner; `seed: true` is an
assertion, not leader election.

The next work is one composite lifecycle/API candidate plus balanced A/A and
A/B measurement. Product adoption remains deferred until that candidate proves
pre-publication rejection, recoverable shared-effect errors, controller reuse,
view arbitration, packed inference and the real-provider loading/error path.
The sections below preserve the initial value review that this follow-up
narrows; they are not implementation proof.

The strongest justified cut is the editor's transport-command facade and
Plate's duplicate Yjs configuration store. Keep one native document binding;
give transport and ephemeral presence their actual lifetimes. The review
establishes value, not a final replacement signature.

## Scope and acceptance

The [ledger](../reviews.md), [review method](../../../.agents/skills/best-api-review/SKILL.md)
and [Plite](../../vision/plite.md) / [Plate](../../vision/plate.md) laws require
one review of synchronization and presence. Separate feature items remain
separate; this review does not absorb comments, authored changes or history.

- [x] Inspect the 12 mapped census groups and materially different consumers.
- [x] Compare current configuration, changed contracts, new primitives,
      deletion, ownership moves and architecture replacement.
- [x] Reproduce the decisive transaction-boundary behavior and replay focused
      existing contracts; distinguish those results from untested behavior.
- [x] Persist one immutable verdict, source identity, coverage and next owner.

Hard laws: accepted canonical changes remain the document truth; discarded
specs and aborted updates must not publish their requested effects. Remote
import must preserve schema admission, named roots, selection mapping, history
policy and shared authored effects. Pre-sync room content must not be replaced
by an editor's placeholder. Presence is transient and view-specific; transport
can outlive a mounted editor. Product labels, colors, authorization and room
policy belong to the app or copied UI. Typed cursor data should infer through
the public configuration and read/write calls.

## Decisive findings

### External effects escape transaction acceptance

[plugin.ts](../../../packages/plitejs/src/yjs/core/plugin.ts) exposes deferred
`update` methods that immediately invoke
[controller.ts](../../../packages/plitejs/src/yjs/core/controller.ts)'s live
provider, awareness and pause operations. They do not enqueue effects for
successful transaction acceptance.

The [source-backed probe](../../plans/artifacts/2026-09-14-collaboration-transaction-probe.test.ts)
constructs a discarded `state.transaction` and separately throws from
`editor.update`. Both attempt a text insertion, cursor-data publication,
pause and disconnect. In each case text remains `original` and zero editor
commits fire, but cursor data is published, synchronization stays paused and
the provider receives `disconnect`. [Captured output](../../plans/artifacts/2026-09-14-collaboration-transaction-probe.log)
confirms both observations. Its passing assertions describe the defect, not
desired regression expectations.

Automatic selection publication already has a commit-owned path. Preserve
that relationship. Presence operations requested during accepted document
changes can use existing commit staging where needed; the UI should not need
a document transaction merely to publish a profile or disconnect a socket.

### Cut duplicated configuration and transport control

[BaseYjsPlugin.ts](../../../packages/platejs/src/yjs/BaseYjsPlugin.ts) copies the
native options into nullable `YjsPluginState`, then reads the store to
construct `yjs(options)`. The controller captures those options. This is a
second public configuration representation, not a demonstrated live
reconfiguration mechanism. Preserve one configuration owner and the useful
Plate authoring/decoration adapter; test cursor-data inference during design.

[YjsProviderLike](../../../packages/plitejs/src/yjs/core/types.ts) admits optional
document, awareness, connect/disconnect/destroy, subscriptions and several event
payload shapes. [The lifecycle adapter](../../../packages/plitejs/src/yjs/core/provider-lifecycle-adapter.ts)
normalizes those shapes into connection/sync state. The public transaction
methods discard the underlying operation result, and promise rejection
handlers suppress errors. The
[Hocuspocus example](<../../../apps/www/src/app/(app)/examples/plite/_examples/yjs-hocuspocus.tsx>)
still needs its own adapter and already owns provider creation and destruction.
The [Plate demo](../../../apps/www/src/registry/examples/collaboration-demo.tsx)
also owns its provider while routing controls through `editor.update.yjs`.

Prefer deleting editor transport commands and optional provider destruction
policy. Keep a minimal, coherent observation contract for readiness and
awareness wherever the binding actually needs it. Removing sync gating or
making each app rebuild that gating would be a regression. Detailed design
must establish one source for document identity, seed authority and readiness,
including offline-first use and provider replacement. It must also compare
direct provider use against a small supplied adapter; callers should not
inherit a new hand-built lifecycle protocol.

### Retain the native collaboration and presentation responsibilities

The native controller already consumes commits and imports remote changes
through the editor adapter with explicit history and DOM policy. Yjs causal
identity and relative selections cannot be replaced by broadcasting local
path-based changes or plain snapshots. Shared effects carry authored state;
peer retirement and compaction retain their distributed-lifecycle laws.

Remote-cursor caches and exact-view range geometry have distinct jobs. Plite
owns mapping and neutral reads; Plate supplies unstyled selection decorations;
the [copied overlay](../../../apps/www/src/registry/components/editor/remote-cursor-overlay.tsx)
owns appearance. Keep those responsibilities. The current code uses per-client
subscriptions and an explicit editable reference; this review does not prove
their browser behavior or performance.

Proposed ownership flow, not a settled public API:

```text
App-owned provider → document + explicit readiness + awareness
Native Yjs binding ↔ accepted commits / canonical remote imports
Mounted editor view → mapped cursor reads → copied Plate presentation
```

## Material alternatives

| Direction                                                   | Verdict and reason                                                                                                                                                                                     |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Keep/configure                                              | Insufficient: configuration does not stop immediate side effects in discarded or aborted work.                                                                                                         |
| Stage every current `tx.yjs` call after commit              | Viable correctness repair, but keeps transport, administrative work and profile updates coupled to document transactions; compare as the smaller rival.                                                |
| Change existing contracts                                   | Pursue: distinguish immutable binding configuration, readiness, transient presence and accepted document changes. Reuse existing lifecycle/commit mechanisms before adding machinery.                  |
| Add a generic collaboration/session service                 | Reject without a demonstrated independent job. Another service would duplicate the existing provider and private binding owner. A small readiness adapter may earn its place through actual consumers. |
| Delete/merge Plate's Yjs store                              | Pursue: remove the duplicated options representation while preserving Plate configuration inference and selection decoration.                                                                          |
| Delete the editor transport facade                          | Strongest candidate: app/provider owns connection, errors and teardown; binding observes only capabilities required for safe synchronization.                                                          |
| Delete awareness or merge it into document content          | Reject: transient remote selections/profile data have independent expiry and undo semantics.                                                                                                           |
| Merge all collaboration into Plate                          | Reject: raw Plite examples need neutral synchronization and cursor reads. Product presentation stays above that owner.                                                                                 |
| Replace Yjs with generic commit/snapshot broadcast          | Reject as the default target: local changes alone do not supply concurrent/offline convergence and durable relative identity. No evidence justifies replacing the CRDT.                                |
| Rewrite the event bridge, shared-effect log or cursor cache | Defer any such implementation choice to a named deficiency and matched scale evidence. This review found no value case for a wholesale rewrite.                                                        |

## Coverage

Twelve census groups considered; zero excluded or unresolved at the value
verdict level. This is bounded architecture/API coverage, not exhaustive
line-by-line or behavioral coverage of the CRDT implementation.

| Group                                 | Disposition                                                                                                       |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `capability/yjs`                      | Keep capability identity; no provider lifecycle belongs in the name catalog.                                      |
| `example/plite/collaboration-demo`    | Keep route to the Plate consumer; migrate through the same implementation.                                        |
| `example/plite/yjs-collaboration`     | Keep app-owned local peer transport; include explicit selection/history calls in adoption.                        |
| `example/plite/yjs-hocuspocus`        | Keep real-provider consumer; remove redundant control/adapter work where the selected readiness contract permits. |
| `example/registry/collaboration-demo` | Migrate configuration and controls; preserve sync/schema status and teardown behavior.                            |
| `export/platejs/./yjs`                | Keep facade identity; revise configuration exports with their owner.                                              |
| `export/platejs/./yjs/react`          | Keep Plate decoration integration and native hook identity.                                                       |
| `export/plitejs/./yjs`                | Keep native binding; narrow misplaced transaction/lifecycle surface.                                              |
| `export/plitejs/./yjs/react`          | Keep neutral cursor and readiness subscriptions as required by the chosen contract.                               |
| `platejs/yjs`                         | Cut duplicated configuration store; retain useful Plate integration.                                              |
| `plitejs/yjs`                         | Separate transport/presence from document acceptance; retain canonical synchronization and identity machinery.    |
| `ui/remote-cursor-overlay`            | Keep product presentation and exact-view targeting.                                                               |

## Evidence and limits

Existing source-first checks passed: 69 Plite tests across provider, awareness,
schema identity and multi-root contracts, plus eight Plate adapter tests.
The two diagnostic cases also pass, reproducing the defect. Commands and
outputs are retained in the [proof receipt](../../plans/artifacts/2026-09-14-collaboration-proof.md).
No real network/provider server, browser/native device, performance comparison,
full history/CRDT soak or proposed implementation was executed. Source review
was sequential; no independent worker review is claimed.

The [entrypoint cut](../../plans/2026-08-23-hard-cut-yjs-public-entrypoints.md)
and [cursor presentation plan](../../plans/2026-09-04-yjs-cursor-presentation.md)
provide history, not current proof. Their package identity and presentation
boundaries remain useful. Adjacent authored/core review verdicts do not
transfer to this initial collaboration record.

The global census was stale before recording, while collaboration's observation
matched. Refreshing census fingerprints does not refresh older review evidence.

## Next owner

```text
$task design plan collaboration: separate synchronization, transport and presence lifetimes
```

Start by selecting the smallest contract that passes the discarded-spec and
aborted-update cases while preserving pre-sync admission, seed authority,
offline reconnect and independent mounted views. Compare deletion against
commit staging, then settle Plate/raw configuration, async error ownership,
provider replacement and adoption together. Runtime changes require matched
baseline/candidate measurements for local edits, remote imports, reconnect,
roots and cursor fanout. Public API changes also require the repository's
doctrine-repair method. This review changes research artifacts only.
