# Selection and locations

The ledger asks whether selection, coordinates and anchors can share one owner. The 2026-10-04 audit stopped. Static coordinates, the canonical text-or-node selection, released anchors and the private projected view selection answer four different lifetime questions with one owner each. Every merge or replacement either puts DOM projection identity into document truth, loses exact disjoint node membership, or forces release ownership onto plain reads. `node tooling/scripts/review-ledger.mjs show selection` prints the scope's history.

## Layer and owner

| Responsibility | Decision |
| --- | --- |
| Static coordinates | `Path`, `Point` and `Range` for plain reads. |
| Canonical selection | Text or node selection (`packages/plitejs/src/interfaces/selection.ts`); exact directional node membership cannot become one bounding range. Table lowers its cell membership to it rather than adding a kind. |
| Anchors | `packages/plitejs/src/core/anchor.ts` adds retention, association, deletion policy, persistence and release, as async media insertion needs across an awaited URL. |
| Projected view selection | Private `react/view-selection.ts` keeps owner and fragment identity across rendered root occurrences; its target resolver tells retained, ambiguous, stale and writable targets apart. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| Anchors in place of coordinates | Imposes lifetime management on simple reads. |
| Coordinates in place of anchors | Loses rebasing; node keys alone cannot locate text offsets. |
| Folding the projected selection into one serialized range | Loses information or puts a DOM projection into document truth. |
| A universal selection extension point or location handle | Unsupported kinds and competing state. |
| Selection in React, or DOM ranges as the model | Loses or relocates required work. |

## What other editors do

Not compared in this scope; the [editor comparison](editor-comparison.md) holds the cross-editor reads.

## Main changes

- None since the 2026-10-04 audit.

## Open work

- Mapping and anchor assertions were read for the Stop, not replayed; no native parity claim follows. owner: Verify. stop: the next `selection` review replays them.
