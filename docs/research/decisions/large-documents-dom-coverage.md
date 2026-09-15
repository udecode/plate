---
title: Large documents need explicit DOM omission
type: decision
status: assessed
updated: 2026-09-11
review_scope: large-documents
review_history:
  - ../review-records/2026-09-11-large-documents-explicit-dom-coverage.json
source_refs:
  - ../../plans/2026-09-11-large-documents-api-review.md
  - ../../plans/artifacts/large-documents-api-review/verification.json
  - ../../plans/artifacts/large-documents-api-review/consumer-census.json
related:
  - ../reviews.md#large-documents
  - performance-candidate-reuse.md
---

# Large documents need explicit DOM omission

The [design follow-up](large-documents-rendering-api.md) selects one `Editable`
with a proposed `virtualize` input. Its runtime, geometry and packaging changes
remain provisional. The assessment below records the reasons for pursuing that
work; it does not certify the proposed implementation.

**Pursue an explicit DOM coverage contract. Delete implicit omission from the
ordinary editing contract; challenge the separate segment and staged strategies
before retaining them as public choices.** This approves further API design,
not a measured renderer replacement. A DOM-present default is the required
direction under current Vision; its implementation and scale costs remain open.

The strongest plausible cut is one ordinary DOM-present renderer plus one
explicit omission owner, removing the automatic segment promotion protocol and
merging or deleting staged mode if its distinct lifetime does not earn a current
product job. Keep the canonical document, root-local DOM coverage, clipboard,
selection and geometry authorities. Deleting all coverage would break real
collapsed-content and external-text consumers.

Scope: **1 question; 8 expected inventory groups; 8 reviewed; 0 excluded;
0 unresolved group dispositions.** Runtime acceptance and browser/native proof
remain open. This is a bounded ownership/API assessment, not a line-by-line
correctness audit of every geometry algorithm.

## Current jobs and ideal ownership

Ordinary document editing needs complete content, stable model selection,
correct copy/export, and an honest account of native services. Large documents
add first-edit, scrolling and memory costs. Explicit collapse and external-text
renderers independently need to describe missing native DOM. Pagination owns
layout; it does not acquire a second document or selection model.

Proposed ownership flow; public names are not selected here:

```text
canonical document and model selection
                 ↓
root view → ordinary DOM-present renderer
         → explicit omission renderer → actual mounted ranges/materialization
         → product collapse or external text → actual coverage boundaries
                                               ↓
                             shared DOM selection/clipboard/geometry bridge
```

The application makes the incomplete-surface choice once. Every consumer uses
the actual view coverage. A size threshold can tune work within that contract;
it cannot quietly select a weaker native contract.

## Decisive observations

1. **The default contradicts current Vision.**
   [Strategy helpers](../../../packages/plitejs/src/react/components/editable-dom-strategy-helpers.ts)
   default to `auto` and enable segment omission at 1,000 top-level blocks.
   The executed [contract](../../../packages/plitejs/test/react/dom-strategy-and-scroll.tsx)
   confirms 32 mounted text blocks out of 1,001, 969 pending, and
   `nativeSurfaceComplete: false`, still bounded after 750 ms.
   [Vision](../../vision/plite.md) requires a DOM-present default until the
   omitted-DOM modes prove native services. The current
   [guide](../../../content/docs/plite/libraries/plite-react/virtualized-rendering.mdx)
   instead calls bounded `auto` the production default. That is a substantive
   contract conflict, not a naming preference.
2. **Staged is not proved to become complete by waiting.**
   [Root groups](../../../packages/plitejs/src/react/components/editable-root-groups.ts)
   retain activated/materialized groups. The staged contract keeps the last
   block absent after 750 ms. No background completion scheduler is present in
   this owner or its mounting caller. Eventual full coverage in the guide is
   therefore conditional on materialization, not a demonstrated warmup promise.
3. **`findPolicy` does not implement finding omitted text.**
   The [census](../../plans/artifacts/large-documents-api-review/consumer-census.json)
   finds declarations, forwarding and boundary writers, but no source consumer
   branching on the flag. The guide accurately describes it as metadata.
   Remove this public promise-shaped field unless a real metadata consumer
   earns it; do not add a search service merely to make the field useful.
   The [browser test](../../../apps/plite/tests/plite-browser/donor/examples/dom-coverage-boundaries.test.ts)
   explicitly expects hidden text to be unfindable until expanded. It uses
   `window.find` with an innerText fallback, so it is not proof of the browser's
   Find UI or assistive technology.
4. **Copy and selection policies do real work.**
   [Clipboard](../../../packages/plitejs/src/dom/plugin/dom-clipboard-runtime.ts)
   materializes requested boundaries or writes from the model-backed selection.
   [Selection projection](../../../packages/plitejs/src/react/editable/dom-coverage-selection.ts)
   distinguishes model selection from available native endpoints.
   [Vertical movement](../../../packages/plitejs/src/react/editable/dom-coverage-vertical-selection.ts)
   uses mounted geometry, measured adjacent text and model fallbacks. Removing
   these paths solely because the default changes would break explicit omission.
   Model completeness does not establish native DOM or rendered-HTML fidelity.
5. **The comparison control mixes different rendering jobs.**
   The [Plate demo](../../../apps/www/src/registry/examples/huge-document-demo.tsx)
   maps `chunking` to Plate `auto`, while its upstream adapter sets
   `getChunkSize` and renders chunk children with optional content visibility.
   This control alone is not an equivalent-coverage performance comparison.
   The browser smoke only proves mount/schema/basic typing. The former ledger
   proof `runtime-read-performance.spec.ts` exercises other feature routes and
   has been replaced by relevant huge-document/coverage contract entrypoints.
6. **The earlier easy cut is already present.**
   September 9's [E19–E23 study](../../plite/research/2026-09-09-editor-performance-iteration-2/virtualization.md)
   proposed deleting hidden-range key arrays. Live
   [virtual planning](../../../packages/plitejs/src/react/dom-strategy/use-virtualized-root-plan.ts)
   uses endpoint keys without those slices. Its hash differs from the recorded
   E19 baseline. E19 is not new work. Page-scan indexing, DOM containment,
   viewport omission and immutable window snapshots still lack current
   decision-grade comparisons; the old timing packets are historical context.

## Material alternatives

| Lane | Judgment |
| --- | --- |
| Keep/configure `full` everywhere | Stop as the durable answer. It gives informed callers an escape but leaves ordinary setup with a size-dependent native contract. Keep it as a measurement control. |
| Change the public rendering contract | Pursue. Ordinary setup preserves DOM coverage; omission is an explicit product decision with concrete native limits. Remove misleading mode promises and inert `findPolicy`. Exact signatures remain design work. |
| Add search, print or a public coverage store | Stop without a current independent job. Search metadata cannot restore DOM services; a new store adds synchronization to existing root coverage. |
| Delete/merge segment, staged and viewport owners | Strongest runtime candidate, still provisional. Separate segment and group retention protocols should survive only for a proven distinct product job. Keep the shared coverage bridge and selection retention. |
| Move ownership | Keep model content/selection below React and coverage/geometry with the mounted root. Plate forwards the substrate contract; feature kits should not each repair the default. Pagination supplies layout inputs. |
| Replace with a height tree or immutable window snapshot | Defer runtime acceptance. A new index/store can introduce stale geometry, tearing and retained-range bugs; E20/E23 have not proved it necessary. |

Omission directly avoids creating omitted React/native node surfaces. It does
not erase document storage, full root-key planning, grouping or layout scans.
Containment targets browser layout/paint while retaining nodes; selector work
targets invalidation. Those are different costs and need separate attribution.
No timing benefit is inferred from fewer nodes or cleaner ownership.

## Inventory dispositions

| Unit | Verdict and evidence | Next owner |
| --- | --- | --- |
| `plitejs/react/dom-strategy` | Pursue explicit omission/default repair; segment/staged consolidation remains provisional. Live automatic threshold and retained ranges establish the problem. | Best API |
| `plitejs/react/editable/dom-coverage-selection` | Stop deleting the shared projection owner. Omitted endpoints and model selection are different facts. | None |
| `plitejs/react/editable/dom-coverage-vertical-selection` | Stop replacing geometry with model-only arrows. Existing visual-line and omitted-neighbor paths constrain any consolidation. | None |
| `example/plite/huge-document` | Pursue controls and metrics that expose actual coverage; compare first interaction and cold materialization, not only warmed typing. | Best API, same contract |
| `example/plite/dom-coverage-boundaries` | Stop deleting coverage. Nested product collapse retains hidden model text and deliberately gates native visibility. | None |
| `example/registry/huge-document-demo` | Pursue equivalent-coverage comparison controls; `chunking` currently selects different mechanisms. | Best API, same contract |
| `example/value/huge-document-value` | Stop fixture redesign. Seeded heading/paragraph values serve paired engines; the Chinese 800-block fixture is distinct content, not scale/native proof. | None |
| `browser/huge-document` | Pursue proof aligned with the contract. Existing www mount/typing smoke cannot certify default native completeness. | Best API, proof requirements |

## Proof limits and next decision

Five existing package suites pass **112 tests** using the owning Vitest config,
including its React Compiler transform. The
[receipt](../../plans/artifacts/large-documents-api-review/verification.json)
records the command, log and post-run source hashes. This is focused behavior
evidence from the shared checkout, not an atomic release snapshot. No product
code changed. No new benchmark or browser/native session ran.

Before accepting runtime consolidation, compare the existing full, automatic,
staged and virtualized arms on identical 100/1,000/10,000-block content, including
the 999/1,000 threshold transition. Freeze budgets, noise/rejection rules,
correctness assertions and source identity before observing candidate results.
Measure cold mount/first edit, omitted-block activation, forward/reverse scroll,
range selection/copy, retained DOM/heap and page-layout inputs. Native Find,
accessibility, print, composition, mobile and collaboration need their actual
owned proof; a timing win cannot waive them. Do not accept a renderer change
from this assessment or the historical packets.

The first unresolved job is the public coverage contract. Its value is already
established by the silent default switch; runtime speed does not decide whether
that contract should be honest. Recommend only:

`$best-api design large-documents: make DOM omission explicit, restore the DOM-present default contract, and test whether segment and staged modes deserve separate owners`

Later adoption must reconcile the affected Plite React teaching and its source
rules, apply Best API doctrine repair and append the required doctrine version.
This assessment records that obligation; it does not change doctrine or accept
implementation. Independent Plate features and the blocked core adoption remain
outside this review.
