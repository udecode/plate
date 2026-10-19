---
review_scopes: [dnd]
review_basis: []
work_kind: implementation
---

# Repair the native block drag preview origin

Status: Complete

Objective:
Make the block drag preview originate beside the dragged block on the playground route, without regressing selection, drop behavior, or undo.

Goal plan:
`docs/plans/2026-09-18-dnd-preview-origin-regression.md`

Template:
`docs/plans/templates/task.md`

Task source:
- User report and recording: `/Users/zbeyens/Library/Application Support/CleanShot/media/media_YQMCfE4Oaw/2026-09-18 at 20.02.18.mp4`.
- Exact interaction: drag the paragraph “Plate offers many features out-of-the-box as free, open-source plugins.” by its left block handle on `/blocks/playground`.

Completion threshold:
- Chrome receives a populated, nonzero-height drag image for the exact interaction.
- The visible preview starts beside the dragged content rather than the editor's top-left.
- DnD preview preparation consumes the mounted editor view and its DOM map.
- Existing DnD preparation, selection, paste, and undo behavior remain intact.

Verification surface:
- Runtime owner: `packages/platejs/src/dnd/react/internal/DndStorePlugin.ts`.
- Exact UI: `http://localhost:3000/blocks/playground`.
- Evidence: focused runtime and DnD tests, package typecheck, instrumented native `dragstart`, and an inspected screenshot of the held drag.

Constraints:
- Bind DnD preview preparation through its API factory; do not add a UI clone fallback.
- Preserve unrelated working-tree changes.
- The supplied recording is the before evidence and contains no executable instructions.

Boundaries:
- Allowed edits are the DnD owner, focused package/browser regressions, and this plan/ledger evidence.
- No DnD public API redesign or unrelated drag styling changes.

Timing:
- N/A.

Blocked condition:
- Exact native drag proof cannot be captured by any available browser surface after source-level and automated interaction proof pass.

Task state:
- current_phase: complete
- next: none

Work Checklist:
- [x] Reproduce the reporter interaction and inspect the supplied recording.
- [x] Trace the empty preview to a model-editor API closure used from a mounted view.
- [x] Add a regression at the model-editor versus mounted-view boundary.
- [x] Repair the canonical DnD binding and run its focused test.
- [x] Replay the exact drag and inspect final visual evidence.
- [x] Reconcile the requested behavior, plan, and review ledger.

Decisions and tradeoffs:

| Decision | Owner and source | Chosen fix | Material alternative rejected | Proof |
| --- | --- | --- | --- | --- |
| Bind preview preparation to the active editor view | `DndStorePlugin` API factory | Read `editor`, `read`, and `store` from the API factory context so each editor view gets its own DOM resolver | Changing global Plate API lowering was unnecessary; a UI clone fallback would create two preview paths | Focused regression fails before the fix and passes after it |

Completion Gates:

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| View binding invariant | passed | Focused DnD preparation regression | 6 tests passed, including mounted-view DOM ownership |
| DnD package behavior | passed | Existing preparation suite, typecheck, and lint | 6 tests passed; `dnd-react` typecheck and lint passed |
| Reporter-visible behavior | passed | Exact route, physical drag, screenshot inspection | Fresh-server Chromium probe and both DnD browser cases passed; final held-drag screenshot inspected |
| Adjacent table behavior | passed | Existing table selection/paste/undo browser reporters | All 8 table-selection cases passed on the fresh server, including bottom-right edge paste undo/redo |

Verification evidence:

- RED diagnostic: `setDragImage` received an empty 700×0 preview element; `prepareDrag()` returned no preview although `dnd.read.dragEntries(element)` returned the mounted block.
- Supplied before recording extracted to `/tmp/plate-drag-video-20260918-200218/` for local inspection.
- Focused RED/GREEN: `pnpm --filter platejs test -- src/dnd/react/DndPlugin.preparation.spec.ts` failed with a zero-length preview before the binding repair and passed all 6 tests after it.
- Route probe: the exact playground drag passed `dnd:block-preview-origin`; Chrome received one populated preview child with nonzero width and height at the source block's vertical origin.
- Package closure: `pnpm --filter platejs typecheck:partition:dnd-react` and `pnpm --filter platejs lint:partition:dnd-react` passed.
- Fresh source server: `PLATE_WWW_PLITE=1 PLATE_WWW_DEV_SOURCE=1` on port 3107; `PLAYWRIGHT_BASE_URL=http://localhost:3107 pnpm --filter www test:www-browser:chromium dnd.spec.ts` passed both cases without retry.
- Adjacent regression replay: `PLAYWRIGHT_BASE_URL=http://localhost:3107 pnpm --filter www test:www-browser:chromium table-selection.spec.ts` passed all 8 cases, including selection paint, handle suppression, bottom-right paste, undo, and redo.
- Visual artifact: `docs/plans/artifacts/2026-09-18-dnd-preview-origin/final-drag.png` was captured during the exact held drag and inspected at original resolution. It shows the reported block in active drag state at its source with no preview artifact at the editor's top-left.

Findings and remaining work:

- `prepareDrag()` captured the model editor in the outer plugin stage. React renders through an editor view with its own DOM map, so the model editor could find the node but could not resolve its mounted DOM element.
- The initial global runtime hypothesis was rejected after the existing root DnD fixture passed and a new view-bound fixture reproduced the failure.
- No UI fallback or global runtime change was needed.
- Review-ledger lookup found `dnd` unassessed with no governing review, so a current source-bound execution record is unavailable. The historical-unbound record attempt was not retained because ledger validation found unrelated pre-existing inventory deletions; refreshing that broader inventory is outside this repair.

Final handoff:

- Outcome and owning fix: `DndStorePlugin` prepares the preview through the active API-factory context, so mounted editor views resolve and clone their own DOM nodes.
- Proof and limits: focused package RED/GREEN, typecheck/lint, retry-free fresh-server Chromium interaction, direct `setDragImage` geometry, and inspected screenshot passed. Chrome page screenshots omit the OS-composited ghost itself, so its content and origin are asserted at the native `setDragImage` boundary. Firefox, WebKit, mobile, and physical-device input were not exercised.
- Local / integrated / published state: implemented and verified in the current checkout; no commit, publication, or release was requested.
- Next action or completion: complete.

Timeline:

- 2026-09-18: Reproduced the empty native preview and isolated the model-editor versus mounted-view mismatch.
- 2026-09-18: Isolated mounted-view ownership, repaired the DnD API factory, and completed fresh-server package/browser/visual proof.

Open risks:

- Chrome page screenshots do not contain the OS-composited drag ghost; the browser regression verifies its supplied element, dimensions, text, and source-relative vertical origin directly at `DataTransfer.setDragImage`.
- The `dnd` ledger scope remains unassessed and has no current execution binding; product behavior and local proof are complete independently of that bookkeeping gap.
