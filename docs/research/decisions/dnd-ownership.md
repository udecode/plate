---
title: Drag transfer and block policy ownership
type: decision
status: accepted
updated: 2026-10-04
source_refs:
  - ../../plite/research/2026-10-02-dnd-library-choice/README.md
  - ../probes/2026-10-01-dnd/REPORT.md
  - ../probes/2026-10-01-dnd-transfer/review-record.md
  - ../../plans/2026-10-01-dnd-transfer-consolidation.md
related:
  - ./import-fidelity.md
  - ./plite-view-ownership.md
---

**Derive the landing default from the schema.** The
[landing review](../review-records/2026-10-02-dnd-schema-derived-landing.json)
finds the root-only default of `transfer.landing` is why Column and Table
carry near-identical widening middleware, why the copied `dnd.tsx` restates
the same depths, and why blockquote, details and footnote content get no
handle or drop. Plite should admit an edge wherever the parent content model
accepts the payload and expose which nodes a block handle can drag. Table's
same-table and row-span rules, List's family rules and Upload's draft veto
stay with their features. The library deferral below stands.

The [landing execution](../review-records/2026-10-02-dnd-schema-derived-landing-execution.json)
built this in part: one per-edge law admits by the compiled schema, features
keep vetoes and List a redirect, and copied handles follow the schema. A drop
after a closed details with only a summary still lands in its hidden body,
because coverage has no empty range. The
[panel repair](../review-records/2026-10-03-dnd-schema-derived-landing-panel-repair-execution.json)
fixed what two panel rounds found: a copy and its check read one slice, a file
drop checks one block per file, a keyboard step stays in its parent, a release
over the dragged block or its handle moves nothing, and List finds a family's
end without walking the family. The landing plan's Open findings list what
stays open, each with an owner.

**Keep native handling now; defer a private Pragmatic Drag and Drop
replacement until it proves a maintenance benefit.** The
[library review](../review-records/2026-10-02-dnd-library-choice.json)
retains one Plite transfer owner and reopens only the browser driver choice.
React DnD and modern dnd-kit do not earn default adoption for the current job.

The [source comparison](../../plite/research/2026-10-02-dnd-library-choice/README.md)
covers three libraries and five editors at recorded revisions. A PDD candidate
must preserve native text, one nested-view recipient, iframe mounting and
same-window custom MIME before its production cost is compared with native.
Upstream tests cover delegated mechanics, not editor content, selection,
history or device interoperability. This review ran no new runtime proof.

The copied `DndKit` remains optional product UI and action wiring. It installs
handles, menus, preview styling, the indicator and shortcuts; it is unrelated
to npm dnd-kit. Its copied `DndPlugin` is different from the deleted packaged
React DnD plugin. The shared `cutBlocks` helper also owns clipboard writing
and subsequent deletion, so calling the entire file pure presentation would
be inaccurate. That action is a clipboard ownership concern, not a reason to
restore a drag engine in the kit.

## Adoption recorded before the library review

The [design plan](../../plans/2026-10-01-dnd-transfer-consolidation.md) settles
the design below, and its three phases are built and kept
([execution record](../review-records/2026-10-02-dnd-transfer-consolidation-execution.json);
round 2 review repairs in a
[second record](../review-records/2026-10-02-dnd-transfer-consolidation-review-repair-execution.json),
and the docs examples and column-drag fixes in a
[third](../review-records/2026-10-02-dnd-transfer-consolidation-docs-execution.json)).
React DnD and `platejs/dnd/react` are deleted. Block drags, keyboard moves and
handle actions land through `editor.api.transfer`, and the plan's open
findings 1-8 stay open with their owners.

## October 1 audit and interrogation history

The audit's original verdict follows. Cut Plate's second document
transfer, move and settlement protocol. Plite owns complete slices, roots,
admission, copy/move, source authority and canonical publication. Plate owns
block/list payload policy, column/table constraints and custom presentation.

The [audit](../probes/2026-10-01-dnd/REPORT.md) reviews eight units and eight
materially different consumer families. Native bindings are the leading
replacement for React DnD. Retaining its gesture backend with one Plite transfer
adapter is the strongest alternative. Backend deletion, plugin survival, exact
API and scale remain provisional. No adoption is established by this review.

Current-source observations justify work:

- Plate's cross-editor raw-element insertion attaches a transferred content
  owner to a colliding target root, displaying the target's content.
- Both paths turn same-editor copy into move.
- Plate can remove a read-only source and duplicate a move across two views of
  one canonical document.
- Plite can publish source deletion after an empty transfer refuses insertion.
- The backend's file/data-transfer representation disagrees with Plate's public
  types. Column constraints omit source identity when comparing parent paths.

The runtime observations use real document owners under Happy DOM with mocked
backend or landing resolution. They do not establish physical drag, paint,
modifier negotiation or performance. The package partition passes 51 tests and
the copied lifetime/Upload specs pass six. Local probe source and logs remain
under `node_modules/.cache/dnd-audit/` and cannot supply fresh-checkout proof by
themselves.

## Retained history

July's [package review](../../plans/2026-07-10-plate-next-dnd-package-review.md)
established selected-block preservation, same-ID editor isolation and ordered
cross-editor publication. The [kit-lifetime work](../../plans/2026-09-06-kit-owned-ai-and-dnd-lifetimes.md)
and [root-slot cut](../../plans/2026-09-07-ai-dnd-root-slots.md) established
automatic setup, exact Editable/ownerDocument cleanup, supplied-manager
composition and feature-owned integration. Their timing limits remain historical.

The [UI extraction](../../plans/2026-09-07-full-plate-ui-extraction-audit.md)
established payload preparation and inert mounted clones. The
[preview repair](../../plans/2026-09-18-dnd-preview-origin-regression.md) bound
those clones to the mounted view. Retain the behavior, not a second cloning or
geometry owner. The recovered extraction outcome remains historical-unbound;
its recovery date and plan hash are not test replay or current adoption.

April's [context guard](../../plans/2026-04-10-dnd-missing-context-runtime-guard.md)
is SSR/history context. Current browser hooks require a manager, so the old
missing-manager guarantee is not silently carried forward. March's
[coverage proposal](../../plans/2026-03-23-dnd-coverage-pass.md) has no completion
receipt; July superseded its dead-helper proposal.

The [Upload protocol](../../plans/2026-09-19-upload-draft-asset-protocol.md)
retains its separate lifecycle and atomic batch/root placement. This audit does
not redesign Upload or transfer its proof state to DnD.

## Design constraints

Unchanged Plite cannot replace the block runtime. It needs exact node-selection
source authority and keyed edge targets, safe same-editor refusal and copy, and
freshness covering reachable roots. External MIME data never authorizes source
deletion. Canonical document/root identity must remain distinct from mounted
view permission, detach and replacement.

One-editor refusal publishes no document/root changes. Two independent editors
still have separate updates and history; the design must specify failure,
duplicate completion, undo/redo and focus behavior without promising a global
transaction. Preserve stale-source degradation to copy unless a deliberate
product decision changes it.

Plite's composed-scrollport helper currently serves mouse selection. It is a
reuse candidate, not content-drag autoscroll proof. Keep Plate's scrolling until
the replacement proves nested scrolling, stationary-pointer progress, target
refresh and terminal cleanup. Preserve offscreen selected payloads, custom media
handles and the mounted preview's origin.

Challenge `DndPlugin` deletion as well as React DnD deletion. A surviving feature
descriptor must earn a headless policy or automatic-installation job; its old
store, list forwarding and preview refs alone do not. Show copied kit setup and
custom call sites without a new session manager or backend framework.

## Interrogation, 2026-10-01

Three same-family Opus reviewers and one Codex reviewer attacked the plan and
the defect fixes. Each fix below has a package test that failed before the fix:

| Defect | Status | Proof |
| --- | --- | --- |
| Plite turns copy into move inside one editor | Fixed | `dom-coverage-native-bridge-contract.test.ts` |
| Plite deletes the source when the destination refuses a move | Fixed for whole refusal | same file, plus a scratch probe showing no commit or undo entry |
| Plate deletes a read-only source on a cross-editor move | Fixed, with and without a captured snapshot | `transfer-contract.test.ts` read-only view copy |
| Plite deletes a source that turns read-only during a cross-editor drag | Fixed | `dom-coverage-native-bridge-contract.test.ts` |
| A lossy landing (`maxLength` truncation, lossy slice repair) deletes the whole source on both paths | Fixed in phase 1: a move whose landing differs after corrections refuses with nothing published; a copy reports the loss | `transfer-contract.test.ts`, `max-length-contract.test.ts` |
| A cross-editor move of a content-root owner attaches to a colliding target root | Fixed in phase 1: independent editors copy through a slice that carries and remaps the owned roots | `transfer-contract.test.ts` card copy case |
| Undo in the target after a cross-editor move removes the only copy | Fixed in phase 1: cross-editor drops copy, so the source keeps its content | `cross-editor-drag.test.ts`, `plate-dnd-cross-editor.test.ts` |
| A move between two views of one document duplicates on both paths | Fixed in phase 1 | `dom-coverage-native-bridge-contract.test.ts` |
| Plate same-editor copy becomes a move | Fixed in phase 1: the native drop event records the modifier | `plate-dnd-cross-editor.test.ts` modifier copy; www `dnd.spec.ts` |
| Any remote edit in the source document turns a move into a copy | Fixed in phase 1: moves resolve live keys and anchors at drop | `dom-coverage-native-bridge-contract.test.ts` |

A Plate-side two-view fix was tried and reverted. It compared runtime owner
and root, so it lost copy intent, skipped the source view's permission, and
moved an unrelated live block when the drag started in a document view. Plite
owns document identity, including document overrides and authored
projections, and both paths and `canDropNode` policies should receive it.

The design must also settle these:

- A move removes its source only after a lossless landing. Plite admission
  reports lossless, lossy or refused, and a lossy move degrades to copy or is
  refused.
- Plite gets a refusal primitive that composes with commands. The working
  tree refuses a one-editor move by throwing a private sentinel inside the
  update, because the spec builder cannot dispatch `insertData`.
- Freshness covers the dragged nodes and their roots, not the whole document.
- Supplied managers are a documented job: touch or custom backends, and
  application drag items dropped on blocks. Removing React DnD names their
  replacement and the public type breaks (`onDropFiles`, `FileDragItemNode`,
  `DndPluginState`).
- `DndPlugin` survival assigns each live duty an owner: suppressing native
  dragover and drop during a block drag, list payload policy, file-drop
  routing to Upload, and the scroller.
- Moving a block needs a non-drag alternative (WCAG 2.2 SC 2.5.7), and React
  DnD (Alt) and Plite (Ctrl off Apple) disagree on the copy modifier.
- Copy negotiation outside Chromium, touch and OS drags are unproven.

## Design plan, 2026-10-01

[`2026-10-01-dnd-transfer-consolidation`](../../plans/2026-10-01-dnd-transfer-consolidation.md)
answers each item above. One Plite `transfer` action moves inside one document
and copies between independent editors. Plate keeps List, ColumnItem, TableRow
and Upload landing policy as middleware. React DnD, `DndPlugin` and
`platejs/dnd/react` are deleted for native block drag. Phase 1 closes the six
open defects in the table above by routing today's two gestures through the
public `transfer()` plugin's `move` and `copy` and the feature landing rules. They stay open until phase 1 lands.

The plan overrules four constraints on this page:

- **Stale sources.** A source edited during the drag moves its live content,
  and a source deleted during the drag refuses the move. This replaces
  stale-source degradation to copy.
- **Lossy moves.** A lossy move refuses, and a copy follows paste and reports
  its loss. A lossy move no longer degrades to a copy.
- **Supplied managers.** No application supplies a custom or touch backend.
  The only supplied manager is the shared HTML5 provider in the cross-editor
  example, which exists because React DnD allows one HTML5 backend per window.
  Native sessions are per document, so phase 3 drops that provider. Removing
  React DnD keeps no backend option; a custom driver calls `resolveDropTarget`
  and `transfer` instead.
- **Moves between editors.** Drops between independent editors copy, so no
  cross-editor undo or redo coupling is needed.

Open findings the plan tracks:

1. Anchors are root-bound, so a move across roots of one document mints keys
   and drops anchors, and a text move collapses anchors inside the moved text.
   owner: review scope `annotations`.
2. Under a content-root schema, Yjs lowering of an offline move with concurrent
   remote edits leaves peers diverged: one keeps the edits, the other keeps the
   move (`../probes/2026-10-01-dnd-transfer/yjs-concurrent-move.result.txt`).
   Plain `nodes.move` fails the same way at `HEAD`. Without content roots both
   edits survive. owner: review scope `collaboration`.
3. No touch device proof exists for iOS native drag or the touch handle
   actions. owner: review scope `accessibility`.

The consolidation's execution is recorded above. The current next owner is
Benchmark for the bounded native-versus-PDD replacement experiment in the
October 2 source comparison. Library adoption remains deferred; this review
does not start implementation or certify concurrent transfer repairs.
