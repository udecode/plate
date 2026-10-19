# Large documents and DOM omission

Ordinary `Editable` mounts the complete DOM, whatever the document size. Omission needs an explicit permission: the dedicated `VirtualizedEditable`, or the pagination `virtualize` boolean. Pagination no longer goes through the generic virtualizer. The 2026-10-04 audit found the P0 to P4 gates run and S1 to S6 installed, and stopped; only the plan's S7 proof closure is outstanding ([triage audit](../2026-10-04-ledger-triage-audit.md), [plan](../2026-09-11-large-documents-api-review.md), research `docs/plite/research/2026-09-11-large-documents-contract/README.md`). `node tooling/scripts/review-ledger.mjs show large-documents` prints the full history.

## Layer and owner

```tsx
// packages/plitejs/src/react/virtualized.tsx
import { Editable, Plite } from 'plitejs/react';
import { VirtualizedEditable } from 'plitejs/react/virtualized';

<Plite editor={editor}>
  <VirtualizedEditable estimatedBlockSize={48} overscan={4} />
</Plite>;

// Plate
import { VirtualizedEditorContent } from 'platejs/react/virtualized';
import { PagedEditorContent } from 'platejs/pagination/react';

<PagedEditorContent page={page} virtualize />;
```

| Responsibility | Decision |
| --- | --- |
| Ordinary views | `Editable`, `EditorContent` and named-root binding never omit content for size or viewport. An explicitly collapsed feature, external editor or custom renderer is not this renderer's omission. |
| Explicit omission | Mounting `VirtualizedEditable` grants viewport omission for that exact view; it is a lifetime boundary, not a toggle. `estimatedBlockSize` is a positive CSS-pixel estimate, `overscan` a nonnegative block count that active and selection retention may exceed. Invalid numbers are rejected at the input boundary. |
| Measured flow | TanStack, isolated behind `plitejs/react/virtualized` and `platejs/react/virtualized`. |
| Pagination | Owns layout, page and unit visibility, canvas extent and navigation, and mounts its own page window in canvas coordinates. `virtualize` omitted or false renders every page, fragment and unit; true omits all three together. Window tuning stays private. |
| Root runtime | Native events, exact focus, composition, committed coverage and DOM work order; one view's disposal never clears a sibling. |
| Identity | Stable keyed top-level rows; the host and active descendants keep identity through viewport, measurement and retention updates. |
| Initial render | Default rendering is complete. Explicit virtualization renders the leading eight blocks plus selected and requested roots from one private planner, so hydration does not depend on viewport timing. |
| Copy | `model` and `exclude` policies stay; model slices compose exclusions across mixed boundaries. |
| Native services | Browser Find, assistive technology, print and export keep their own owners; DOM presence certifies none of them, and export never uses mounted `innerHTML`. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| `domStrategy` with `auto`, `full`, `staged` and a size threshold | An unsafe default and a taxonomy with no user job; cut. |
| Range-dependent virtual parent groups | Replaced overlapping child DOM when the window moved. |
| Pagination through the generic TanStack plan | A second projection read page properties 20,014 times at 10,000 pages against two direct. |
| `useDOMStrategyVirtualOffset`, a coordinate rewrite and `data-plite-virtualized` | Compensated for the duplicate projection. |
| Public metrics, mode types, `findPolicy` and `nativeSurfaceComplete` | No caller; search and capability proof belong to their services. |
| One `Editable` with the virtualizer inside | Added 9,011 gzip bytes and 2.96% to the ordinary consumer, failing both 5 KiB and 2% limits. |
| Async backend loading | Loading, error and hydration ownership for an optional label. |
| A model-global virtualization store | Two views can have different coverage and scroll. |

## Rules

These rules bind this feature alone, so they live here instead of in `docs/vision/`.

- Ordinary `Editable` mounts the complete document DOM. DOM omission is an
  explicit mounted-view choice through the dedicated virtualized React
  component; it never activates from document size, a threshold, or an
  automatic strategy. The virtualized package entrypoint owns its optional
  engine and exposes only block estimate and overscan tuning.
- A virtualized view starts with one deterministic bounded window and retains
  selected or requested targets. Its document, history and collaboration state
  stay canonical while native find, accessibility traversal, printing and DOM
  integrations can observe only mounted content. Product support requires
  explicit browser, IME and device proof for the claimed matrix. Degraded
  huge-document modes stay degraded until native behavior is proved.

## What other editors do

Not compared in this scope's reviews; TanStack is the adopted measured-list backend.

## Main changes

- The strategy enum, staged groups and public layout exports are gone; pagination owns its window directly.

## Open work

- S7: source-first, packed-package, benchmark and managed-browser runs on one unchanged snapshot. owner: the large-documents plan. stop: that run.
- Physical-device IME and selection, native Find, assistive-technology traversal and print stay separate service claims. owner: the next large-documents review. stop: device or service proof.
- Page-scan and geometry cache optimization. owner: the `pagination` subject. stop: a measurement after the duplicate projection's removal.
