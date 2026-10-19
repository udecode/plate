# Pagination already owns the spatial problem

Scope: the interaction of `PagedEditable`, fragment renderers and the generic
virtualizer. Page layout mathematics and the table feature are not redesigned.

## Current flow

`PagedEditable` derives page placements, a mount plan and a viewport store. It
filters page items, fragments and units, projects geometry, builds fragment
maps, builds a second top-level layout array, and passes three layout arrays to
`Editable`. `useVirtualizedRootPlan` then creates page/index/size maps and a
TanStack virtualizer, even when supplied visible page items replace its range.
It reduces every page to recover a total height already owned by pagination.

The generic renderer translates row groups. The public fragment hook returns
canvas coordinates; the example subtracts `useDOMStrategyVirtualOffset` and
uses `onDOMStrategyMetrics` to decide whether subtraction and padding apply.
This feedback cycle is an ownership consequence, not just verbose syntax.

There is also omission outside the explicit mode: `hasViewportWindowedUnits`
enables viewport tracking for multi-unit fragments and table rows even with
`domStrategy="full"`. With injected 400px rectangles, the actual fragment hook
returned 60 units before the viewport effect and one afterward in both default
and full modes. The probe deliberately rendered all children; the production
pagination example consumes those filtered fragments to omit table children
through content boundaries. This is source-plus-package evidence, not a native
layout or visible-table browser proof.

## Disposable projection comparison

The frozen [probe contract](../../../../plans/artifacts/large-documents-deep/page-plan-contract.json)
compares the current hook with a direct projection from the same visible page
items plus required selection roots. Canvas extent comes from the existing
geometry. The oracle independently enumerates first/middle/final keys.

| Pages | Document blocks | Current cold page reads | Current warm page reads | Direct projection reads | Mounted roots / parity |
| --- | --- | --- | --- | --- | --- |
| 100 | 200 | 1,509 | 214 | 2 | 5 / exact |
| 1,000 | 2,000 | 15,009 | 2,014 | 2 | 5 / exact |
| 10,000 | 20,000 | 150,009 | 20,014 | 2 | 5 / exact |

These are instrumented property reads, not latency or all pagination work.
The target starts after page selection, exactly where the current hook receives
the same supplied items. It does not erase the upstream linear scan:
`getPagedEditableVisiblePageMountItems` still filters the page plan; fragment
filtering and projection still do their work. Cold layout, overlap, split
tables, native selection and rendered coordinates remain independent gates.
The result supports deleting the **second** projection owner. It does not
accept a complete replacement renderer or a new page index.

## Preferred ownership

Pagination owns viewport selection, page and unit visibility, canvas extent,
page coordinates and navigation into measured content. Its private rendering
adapter supplies mounted node keys, coverage and navigation to the common
Editable host. Pagination content stays in one stable canvas coordinate system;
do not translate it through generic list rows first. Raw unpaginated blocks use
the generic measured viewport backend. This keeps two real spatial jobs and one
native input/coverage owner.

This stronger cut supersedes the earlier proposal to redefine
`usePliteLayoutFragmentsAtPath` coordinates and add `data-plite-virtualized` for
copied CSS. Neither new contract is needed if the duplicate transform goes away.
Headless and rendered layout rectangles keep their existing canvas meaning;
nested row/cell coordinates remain relative to their immediate renderer as
today. That preferred layout requires real browser verification, including
single/spread pages, borders/padding, zoom, RTL and fragmented tables.

Require explicit omission permission for **both** page/root mounting and
nested viewport units. Semantic collapse and external text retain their own
explicit jobs. Page measurement may still operate independently of mounting.

## Deferred and rejected leads

Reuse historical E19: endpoint-only missing-range payloads are already live.
Do not recreate hidden-key arrays. E20's page visibility index remains deferred;
measure the surviving scan before replacing it. Reject a shared public layout
array protocol, changed fragment coordinates, another virtualizer store, and
an index justified by this projection-only packet.

Evidence: [projection receipt](../../../../plans/artifacts/large-documents-deep/page-plan-result.json),
[native/lifetime shard](001-native-and-lifetime.md), [read ledger](../read-log.tsv).
Next discovery shard: none; the next uncertainty needs an executable renderer.
