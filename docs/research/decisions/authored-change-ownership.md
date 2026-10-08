---
title: Native authored-change ownership
type: decision
status: accepted
updated: 2026-10-07
source_refs:
  - ../../plans/2026-09-12-authored-live-state-implementation.md
  - ../../plans/artifacts/authored-live-state-implementation/final-summary.json
  - ../../plans/artifacts/authored-live-state-implementation/final-candidate.mjs.sources.json
  - ../../plans/2026-09-12-authored-reload-prosemirror.md
related:
  - ../review-scopes/authored.json
  - structural-comparison.md
---

# Native authored-change ownership

**Audit of 2026-10-04.** Stop. The kept native contract still beats every deletion or bypass. It has one authored operation path for accepted and proposed writes, a resolver that may return null for reads but must yield a non-empty ID at the first write, and a directly loaded checkpoint. The two adjacent gaps found on the live tree (Plate's reflective userId bridge and the erased proposeAuthoredComparison import) are already owned by today's suggestions and diff Pursues and do not change this contract. The [triage audit](../../plans/2026-10-04-ledger-triage-audit.md) and record `2026-10-04-authored-audit` hold the evidence.

**Keep native authored ownership and persist its current state directly.** Plite
owns contribution identity, dependencies, retained content, positions, atomic
review decisions and accepted/projected views. Plate owns review workflow and
presentation. Applications keep the ordinary `initialValue` and
`editor.read.value()` calls; there is no public authored loader, cache,
trusted-input mode, worker protocol or background replay controller.

## Writer identity

Every non-empty document write through the authored capability requires a
current author ID. This includes accepted edits: Plite records them as authored
operations with `proposal: false` so they share the same causal graph,
projection mapping, collaboration admission and retained-history machinery as
proposals. Letting accepted edits bypass that path would create a second
mutation authority and leave pending changes without complete causal facts.

`authored({ authorId })` accepts a fixed ID or a resolver. A resolver may return
`null` while an editor only reads or renders authored state; the first authored
write is the validation boundary. Plite validates a non-empty identifier. It
does not authenticate the writer, so application authentication and access
policy remain outside the engine.

Plate's `AuthoredPlugin` resolves the ID from the editor's `userId`, or from
the local user `'local'` when the application passes none, so a solo editor
writes and proposes without identity setup. Collaborators pass a stable user;
the rule lives in [Plate's suggested-edit law](../../vision/plate.md). Plite
itself does not invent an anonymous or system author, silently discard
accepted operations, or maintain an unauthored write path beside the authored
graph. Every write still carries the non-empty author Plate resolved.

The version 4 checkpoint is the current persistence authority:

```text
initialValue
  → decode and validate accepted/projected documents, changes and positions
  → publish a ready-to-edit authored state
  → retain checksum-bound operation bodies for decisions/history
```

Opening a current checkpoint does not reduce the retained operation log or
replay pending edits to reconstruct the projected document. Operation facts
remain available for causal admission, decisions, anchors, selected history and
collaboration. Their JSON bodies remain encoded until a decision or history
read needs them. Versions 1, 2 and 3 migrate at the authored codec boundary;
unknown future versions and corrupt retained bodies reject.

## Why this is the durable shape

The old normal path reconstructed current facts by sorting and reducing every
saved operation, then mapped every pending edit through the accepted document.
That made opening depend on historical work already represented by the saved
current state. Continuing to tune those passes would keep the wrong authority.

A duplicate opaque live-state mirror was also rejected. The measured control
stored 44.25 MB, was slower than the optimized replay baseline, and either
replayed history to validate both authorities or admitted inconsistent
projected text. The accepted checkpoint keeps one current-state authority and
rebuildable indexes under the authored owner.

Generic initial metadata remains strict and detached from caller input. A
registered state-field codec decodes and snapshots its own persisted value
before the remaining metadata is deeply detached. This preserves input
immutability and malformed-data rejection without copying the entire authored
checkpoint twice.

## Performance receipt

The final production bundle and frozen 10,000-paragraph fixture were run in
three fresh-process interleaved pairs per runtime. The comparison is against
the already optimized native replay path, not the earlier roughly 38-second
failure that triggered the investigation.

| Runtime | Replay median | Direct checkpoint median | Improvement |
| --- | ---: | ---: | ---: |
| Bun | 2,554.8 ms | 562.6 ms | 78.0% |
| Node | 2,482.4 ms | 515.7 ms | 79.2% |

Both runtimes clear the frozen 650 ms target and the 75% plus 1.5-second
improvement gate. The saved version 4 fixture is 16,471,746 bytes versus
17,125,993 bytes for the old state. First edit, decision and save all remain
inside their frozen budgets. Profile probes contain no load-time
`authored-reduce` or `authored-map` event.

## Correctness laws

- Accepted, proposed and markup views, stable contribution/origin IDs,
  dependencies, named roots and atomic decisions survive save and reload.
- Saved ranges and delayed peers retain the facts they need; history retention
  stays separate from current-state reconstruction.
- Imported IDs, authors and timestamps rewrite retained bodies and their
  checksums together.
- Current checkpoint data is detached from the caller before editor creation
  returns, including registered state fields and unknown metadata.
- Collaboration snapshots use the same authored checkpoint and retain their
  existing atomic shared-effect owner.

The authored and Yjs partitions, state-codec migration and corruption cases,
package type checks, and focused Chromium suggestion scenarios provide the
current proof. The browser scenarios cover rapid arrow navigation inside a
suggestion, Enter inside a suggestion, and red/green decoration at the first
paint after typing.

## Limits

The performance result supports medians and observed ranges for one synthetic
all-pending 10,000-paragraph workload; it does not establish tail percentiles,
a heap ceiling or universal ProseMirror equivalence. Browser proof is focused
on Chromium and the authored-suggestion example. Node save time has limited
headroom but remains below the frozen 2x bound.

The [September 13 suggestion audit](suggestion-review-semantics.md) reaffirms
this native ownership and loading result while identifying incomplete product
coverage. Structural-delta tests and focused input receipts do not establish
complete Enter/list/table/formatting review through real feature commands.
The older F01–F32 completion summary must not be read as Google Docs parity;
the linked audit records exact gaps without rewriting historical receipts.
