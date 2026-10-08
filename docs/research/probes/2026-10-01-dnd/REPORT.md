# Drag and drop ownership audit

**Pursue one Plite-owned transfer path and cut Plate's second document-transfer
protocol.** Native bindings are the leading replacement for React DnD. Backend
deletion, the final hook API and `DndPlugin` survival remain design decisions
with native and scale gates.

This audit changes research records only. It authorizes no product adoption.

## Current job and hard laws

Users move or copy selected blocks, including disjoint selections and list
descendants, between valid positions. Columns need horizontal placement, table
rows need same-table placement, and media can supply their own handles. Apps
customize previews and indicators and route external files to optional Upload.
Installing the copied kit supplies its required integration.

A transfer carries complete content and reachable named roots. It preserves
exact selection membership, remaps colliding identities, respects both views'
permissions and refuses an invalid landing without deleting source content.
External MIME data cannot grant source-deletion authority. Source freshness
covers transferred roots as well as primary children. Stale moves may copy the
captured payload while leaving the source, as existing cross-editor tests teach.

One-editor refusal must publish no document or root mutation. Transfers between
independent editors commit the destination before removing the source; this is
not a promise of one transaction or shared undo across editors. The design must
state exception, repeated completion, undo/redo, selection and focus behavior.
Canonical editor/root identity and mounted-view permission/lifetime are distinct.

The neutral transfer laws belong in Plite. Plate owns list, column and table
policy. Copied components own controls, preview styling and indicator appearance.

## History reconciliation

This is the first indexed value review of `dnd`, not its first implementation.

| Earlier work | Retained result and limit |
| --- | --- |
| March 23 coverage proposal | No completion receipt. July deleted the unused `getNewDirection` helper; do not revive its tests. |
| April 10 missing-context repair | Retain safe SSR and stable hook ordering. Current source guards missing DOM, while browser hooks still require a React DnD manager. The older missing-manager guarantee is not current proof. |
| July 10 package review | Retain every selected block, editor identity despite equal public IDs, collision handling and destination-before-source publication. Historical package checks excluded browser/registry adoption. |
| September 6 kit lifetime work | Retain automatic installation, supplied-manager composition, exact Editable/ownerDocument cleanup, lazy activation and final detach. Its final production timing remained inconclusive. |
| September 7 root-slot cut | Retain existing feature-owned root integration and explicit JSX composition. The companion-plugin proposal was superseded; no new plugin merely to protect a wrapper. |
| September 7 UI extraction | Retain package-owned payload preparation, validation of every payload member and inert mounted preview clones. Its recovered execution is historical-unbound. |
| September 18 preview repair | Retain the API-factory binding to the mounted view's DOM map. No UI cloning fallback or unrelated global runtime rewrite. Its dated Chromium receipt is not a fresh native claim. |
| September 19 Upload protocol | Retain optional, atomic Upload admission and root-aware placement. Do not transfer its implementation status to the DnD scope. |

The corresponding plans are named in the decision page and source-bound review.
The indexed recovered execution is
`2026-09-18-recovered-2026-09-07-full-plate-ui-extraction-audit`; it has no historical
source binding and does not establish present adoption or proof.

The native-input review's canonical arbitration, the selection review's distinct
selection contracts, the geometry review's exact-view ownership and the
clipboard review's complete-slice law remain intact. This review reopens only
drag transfer and its handoff. It does not replace the input kernel, geometry
system, selection ontology, Upload lifecycle or conversion architecture.

## Audit census

Expected and reviewed: **8 units**. Excluded units: **0**. Unresolved unit
dispositions: **0**. Runtime/API adoption and native/scale acceptance remain open.
The ledger's 11 source groups are inventory, not 11 independently reviewed jobs.

Eight materially different consumer families were inspected: copied block/list
dragging, columns, table rows, images, videos, the custom shared-manager example,
raw Plite text/void dragging and external-file placement into optional Upload.

| Unit | Disposition | Evidence and remaining owner |
| --- | --- | --- |
| Payload and schema/root admission | Pursue | Plate inserts raw elements instead of a complete slice. A root collision changes transferred content. Plite already owns slice extraction/fitting; Task must design its explicit node-drag handoff. |
| Same-editor copy, refusal and history | Pursue | Both paths turn copy into move. Plite can publish source deletion after refused insertion. Fix at canonical transfer, with one-editor rollback and explicit history laws. |
| Cross-editor settlement and authority | Pursue | Plate removes a read-only source and duplicates a move across two views of one document. Use canonical editor/root identity, view permission and complete payload freshness. |
| Session, public contract and view lifetime | Pursue | Plate exposes backend specs/items/monitors and keeps hover/preview state in a model-shared store. Compare native binding and one shared-transfer adapter; challenge plugin removal in both. |
| Landing and container policy | Pursue | Root blocks, columns and rows need different policy. Column guards compare parent paths without source identity. Keep product constraints in Plate and send a root-aware keyed edge to the neutral owner. |
| Content-drag scrolling | Pursue, runtime provisional | Plate uses delayed viewport overlays. Plite's existing composed-scrollport geometry serves mouse selection, not content dragging. Reuse geometry only after a content-drag lifecycle proves scrolling and cleanup. |
| Preview preparation and canonical selection | Stop independent redesign | Keep inert clones, mounted-view origin, offscreen payload members and List's existing expansion. Migrate bindings with the transfer cut; no second preview, selection or global geometry owner. |
| Upload/provider lifecycle | Stop independent redesign | Current optional Upload routing has its own owner and passes focused tests. Normalize file input at transfer and settle absent/refused Upload fallback; do not redesign Upload or add another file plugin. |

The public-contract census includes `DndPlugin`, its definition/state types,
`useDraggable`, `useDropLine`, `useDndPlugin`, `DndScrollerOptions`, `DRAG_ITEM_BLOCK`,
and the drag item, callback, option and return types exported by
`cf1572560313960e87226640b93f73f2486c9aab:packages/platejs/src/dnd/react/index.ts`. `useDndNode` and path/hover helpers are
private implementation comparisons. Hook and preview/scroll options must earn a
domain job; exposing a backend option alone does not establish that job.

Both DnD docs still describe an `onDropFiles.target: Path` argument that the
current callback does not receive. Its destination is a key plus an `edge`.
They also retain the old Files plugin name and a broader `handleRef` type than
the current callback. Adoption must update this teaching with the chosen API.

## Observed defects

The local probes call current mutation owners on real editors under Happy DOM.
Plate probes replace React DnD monitors and the editor hook. Native probes call
the actual drop strategy and replace DOM landing-range resolution. None drives
a physical browser drag or certifies modifier negotiation or visible paint.

| Observation | Result |
| --- | --- |
| Plate move with conflicting named roots | Source card references `audit:body` containing `Source body`. Target already has that name containing `Target body`. Transfer inserts the card, removes the source and attaches the transferred card to `Target body`. |
| Plate same-editor resolved copy | `source, target, keep` becomes `target, source, keep`; there is no duplicate. |
| Plate read-only source move | A source with `readOnly: true` loses `source` after an editable target accepts it. Admission itself is not the defect; removal is. |
| Plate two views of one document | Resolved move produces `source, target, source, keep`. View-object inequality chooses cross-editor insertion; the shared-document freshness guard then suppresses removal. |
| Plite same-editor resolved copy | `Alpha Bravo` becomes `Bravo`; destination receives `Alpha ` despite `dropEffect: 'copy'`. |
| Plite empty refused transfer | Clearing the captured transfer payload leaves source `Bravo` and target unchanged. Source deletion commits without insertion. |

Decisive current source:

- `useDndNode.ts:671` inserts raw elements. `:101` checks copy and children
  identity for cross-editor removal, but not source-view read-only state.
  `:583` branches on editor-object equality and always moves in the same-editor
  branch.
- `clipboard-input-strategy.ts:827` does not consult copy intent before the
  same-editor deletion. `:836` deletes before fallible insertion. A normal false
  return discards the failed replacement, not the outer draft's prior deletion.
- `get-content-slice.ts:69` already extracts exact node membership and reachable
  roots. The native drag strategy instead captures a representative range and
  its session requires a range, leaving exact/disjoint node-drag authority open.
- `pluginStore.ts:230` resolves stores through the canonical runtime owner;
  `DndStorePlugin` puts hover, dragged keys and preview refs there.
- `column.tsx:46` compares parent paths. `table.tsx:796` also checks source
  identity. The column finding is source-based, not a reproduced gesture.

Two more findings are source-based. Primary-children freshness does not
explicitly cover secondary-root edits. Its stale-root deletion consequence
needs a runtime case. Also, `FileDragItemNode` declares `FileList` and
`DataTransfer[]`, while the installed HTML5 backend produces `File[]` and one
`DataTransfer`. Its wire representation should not remain the domain contract.

## Whole-model comparison

| Candidate | Judgment |
| --- | --- |
| Keep two complete drag runtimes | Loses. Different landing geometry needs policy, not duplicate permission, copy, root and settlement laws. Local fixes leave those owners competing. |
| Keep React DnD gestures, share Plite transfer | Credible alternative. It removes duplicate correctness while retaining manager, registration and adapter cost. A demonstrated custom backend or external application drag job could justify it. |
| Native Plite transfer, Plate policies and presentation | Leading ideal target. It deletes the extra transport and raw backend protocol for the current jobs. Unchanged Plite cannot implement it safely. Exact node sources, keyed edges and safe settlement need repair. |
| Move everything into core or registry | Rejected. Core would absorb list/table/column policy; registry would duplicate neutral mutation and permission law. |
| Replace with a pointer/keyboard DnD framework | No established additional input job justifies it. It still needs explicit native-file and external-content transfer. |

The proposed ownership flow is:

```text
Plate payload/container policy
  -> Plite exact source selection + complete ContentSlice
  -> exact mounted target and keyed before/after edge
  -> schema admission and one-editor publication
  -> safe source settlement when a move is still authorized
```

One domain binding should supply a handle, target/preview binding and transient
paint to custom UI. The design must compare changing existing `useDraggable`
against folding its remaining responsibilities into existing view owners. No
public drag-session object, backend framework, selected-key store or new package
is justified. `DndPlugin` remains only if headless block policy or automatic
installation earns a distinct capability. Deleting it without showing how
`DndKit` installs wrappers is incomplete.

Local ProseMirror/Tiptap source supports the native-handle design: custom handles
prepare the view's slice and drag image while the native editor owns drop
mutation. ProseMirror checks whether insertion changed its unpublished draft
before dispatching it. These are pinned comparisons, not parity proof or code
to copy.

The lead compared the whole models, a same-family Architect reviewer compared
them independently, and a fresh same-family Interrogate reviewer attacked the
target. **Challenge delta: improved.** The attack separated backend deletion
from transfer ownership, challenged `DndPlugin` itself, required canonical
identity distinct from view permission, and corrected the autoscroll comparison.
It also required separate one-editor atomicity and cross-editor history laws.

## Current proof and limits

- `pnpm --filter platejs test:partition:dnd-react`: **51 pass**, no failures.
- Copied DnD lifetime and Upload specs: **6 pass**, no failures.
- Two throwaway probe files: **7 observations reproduced**, including a
  read-only admission observation supporting the removal case. These assert
  observed defects; they are not acceptance tests or approved behavior.
- No product edits, new product tests, full typecheck, fresh browser, device or
  scale comparison. Historical preview/browser and timing receipts remain dated.

Raw logs and probe source stay local in `node_modules/.cache/dnd-audit/`.
The immutable review identifies those bytes; a fresh checkout cannot inherit
their replay without restoring/rerunning them. The scoped package and consumer
commands above remain replayable from repository source.

The local observations can be rerun while their files remain available:

```sh
bun test --preload ./config/plite-source-aliases.ts --preload ./tooling/config/bunTestSetup.ts ./node_modules/.cache/dnd-audit/plate-contract-probe.test.tsx
bun test --preload ./config/plite-source-aliases.ts --preload ./tooling/config/bunTestSetup.ts ./node_modules/.cache/dnd-audit/native-contract-probe.test.ts
```

## One next task

`$task design plan dnd: consolidate native transfer and block drag ownership`

Start at Plite's transfer failure unit. Compare native gestures against retained
React DnD with shared transfer, and compare plugin retention against folding
policy/installation. Design complete slices, exact/disjoint selection, root
collision and freshness, canonical identity, source permissions, external MIME
trust and destination-before-source settlement together.

Native gates must cover actual copy modifiers, invalid landing, two views of
one editor, independent editors with equal IDs, named roots, offscreen payloads,
nested policy claim/refusal, file fallback, cancellation/detach, preview origin,
cursor non-interference, undo and follow-up typing. Content-drag scrolling must
choose the actual nested scrollport, continue under a stationary pointer,
refresh its target after scrolling and release work on every terminal path.

Benchmark must freeze current/candidate budgets before measuring complete drag
activation, registration count, hover publication, preview cloning, scrolling,
drop and teardown at realistic document sizes. A shorter API or lower render
count does not accept the runtime. Adopt in at most three independently valuable
phases, with a keep, revert or quarantine gate each. Do not begin by deleting
React DnD or adapting Plate handles to unchanged Plite.

Execution must reconcile the final behavior and coverage with
`docs/editor-behavior/`. Its drag-selection law requires container clamping;
that law does not supply a complete block-transfer protocol. This read-only
review records gaps and leaves the law unchanged.
