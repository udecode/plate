---
title: Pagination ownership
type: decision
status: implemented
updated: 2026-09-16
review_scope: pagination
current_review: 2026-09-16-pagination-engine-trust-closure
review_history:
  - ../review-records/2026-09-15-pagination-view-ownership.json
  - ../review-records/2026-09-15-pagination-design-plan.json
  - ../review-records/2026-09-15-pagination-final-plan-review.json
  - ../review-records/2026-09-15-pagination-render-page-closure.json
  - ../review-records/2026-09-16-pagination-view-owned-implementation.json
  - ../review-records/2026-09-16-pagination-engine-trust-closure.json
source_refs:
  - ../../../packages/plitejs/src/pagination/index.ts
  - ../../../packages/plitejs/src/pagination/react.tsx
  - ../../../apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx
related:
  - ../reviews.md#pagination
  - large-documents-rendering-api.md
  - ../../plans/2026-09-15-pagination-view-owned-layout.md
---

# Pagination ownership

**Live pagination is an owned capability of the mounted paged view, and the
derived layout reader's page-break persistence protocol is deleted.**
Applications configure `PagedEditable` instead of assembling a live controller,
projection cache and decoration publisher. Independent headless measurement,
canonical document ownership and explicit page omission remain.

Status: implemented and verified through the
[Task plan](../../plans/2026-09-15-pagination-view-owned-layout.md). Seven
expected units, seven adopted, zero exclusions. Focused package, production
cost, source-built Chromium, packed release, generated docs and doctrine proof
pass. The plan records unrelated concurrent interruptions to aggregate history
and full-browser closure without weakening or broadening this adoption claim.

The selected API accepts page, typography and fragmentation inputs directly on
`PagedEditable`; `usePageLayout(editableRef)` reads only a current committed
layout for that exact host and otherwise returns null. `measurePages` performs
one explicit headless measurement. Delete the public live controller, page-break
persistence, generic geometry/fragment lookup and synthetic box/split
vocabulary. Text breaks between measured lines; atomic owners and exact direct
children are indivisible. Pagination derives their paths. Keep real text
keep-together behavior and account for oversized content in occupied canvas
geometry.

The implementation also closes three omissions: page paint uses a private keyed
surface-composite store rather than a map-valued React context; font observation
must be ref-counted per host document and deduplicate shared Pretext invalidation;
and every current Plite reference/generated registry teaching surface belongs in
adoption. The source findings below preserve the audit basis; the Task plan owns
the final signatures, adoption order and proof receipts.

## Required behavior

The job is editable page layout with text, tables and media; custom page chrome;
single or facing pages; named roots; and optional omission for large documents.
Headless consumers may derive previews or export inputs. These jobs require:

- Canonical content, history and collaboration stay with the editor. Visual
  page boundaries do not split semantic document nodes.
- Native caret, selection and composition use one coherent editable DOM. The
  mounted view owns its permissions, geometry, projection and retirement.
- Complete pagination keeps all content. Page omission is explicit and uses
  pagination's own canvas coordinates and the shared DOM coverage machinery.
- Typography and custom fragmentation sizes must correspond to actual rendering. Estimates,
  local browser measurements and shared/export authority have different claims.
- Product schema, table policy, image behavior and page appearance remain
  configurable without building another document or history owner.

## Decisive findings

### Cut the page-break authority protocol

`createLayout` composes pages before reading `pageBreaks`. The accepted breaks
never enter the engine input or replace its output: snapshots still expose
`output.fragments` and `output.pages`. The write mode calls `editor.update`
from the layout lifecycle, despite `PageLayout` describing itself as a reader
that owns subscriptions, not content.

The [current-source probe](../../plans/artifacts/2026-09-15-pagination-review/contract-probe.json)
demonstrates all three consequences:

- The writer produces **11 pages** at 24px line height. A reader at 48px line
  height produces **22 pages**, while accepting the writer's stored breaks.
  The document fingerprint omits `lineHeight`, and the profile records only
  `typography: 'custom'` for both inputs.
- A matching snapshot with `breaks: []` is also accepted; output remains 11 pages.
- Mounting a writer creates one state commit. Two `refresh('viewport')` calls
  with unchanged document content produce two more. The stored version and
  fragment IDs follow editor versions, so the previous write changes the next
  snapshot even without a content change.

Repository consumers of read/write mode are contract tests and export smoke
checks. The live paginated example uses page settings, not page-break storage.
The page-break type records paths and fragment IDs but no source text offset
or unit continuation with which to reconstruct an intra-block break.

Delete `LayoutOptions.pageBreaks`, `PageBreaksOptions`, `PageBreakSnapshot`, its
codec, creation/status/profile-validation machinery and lifecycle writes unless
a real independent consumer establishes a job they solve. Ordinary page settings
can still use the existing editor state field and codec. If a product needs
authoritative breaks, its explicit document/export operation must own them and
prove reconstruction; repairing hashes cannot give this protocol that job.

Source: [types](../../../packages/plitejs/src/pagination/index.ts#L425),
[profile and fingerprint](../../../packages/plitejs/src/pagination/index.ts#L724),
[compose/read/write order](../../../packages/plitejs/src/pagination/index.ts#L3189).

### Move reusable paged editing out of application orchestration

`PagedEditable` owns page surfaces, page windows and fragment lookup, but ordinary
text is positioned by the copied example. The example separately constructs
`createPaginationDecorationRuntime`, caches projected decorations, chooses
native versus projected flow for the active block, publishes all-node decoration
refreshes and positions line spans. Its table renderer also assembles row windows
and omitted-content boundaries.

Those are editing mechanics. Retain app-owned typography, page chrome and
schema-specific renderers, but move reusable projection, invalidation, native
flow and coverage integration into the existing pagination/view owners. Test
deleting the public live `PageLayout` handle as a required assembly step for an
editable; keep a standalone measurement path only for independent consumers.
Do not introduce a pagination plugin store, parallel provider or text engine
merely to relocate the same caller work.

The implemented paged view accepts page and measurement inputs directly and
privately owns their lifetime. The former `useLayout` shape remains historical
comparison evidence; its lifecycle isolation and committed reconfiguration are
preserved internally.

Rejected former assembly:

```tsx
const layout = useLayout(editor, { page, typography, nodeLayout });
// The real example also owns projection and decoration publication.
<PagedEditable layout={layout} renderElement={renderElement} />;
```

Implemented normal path:

```tsx
import { PagedEditable } from 'platejs/pagination/react';

<PagedEditable
  page={{ margins: 72, preset: 'letter' }}
  typography={typography}
  fragmentation={fragmentation}
  pageView={{ mode: 'spread', gap: 24 }}
/>;
```

Custom page chrome and explicit omission remain real jobs. The runtime exposes
the exact-ref layout read for controls and
`usePageLayoutFragments()` for the current custom-rendered element, without a
public lifecycle, path lookup or geometry store. One private surface-composite
`PliteDecorationStore` preserves inherited semantic paint while waking only
changed pagination keys.

The final API closure removes the page renderer's always-null `children` and
replaces an untyped attributes bag with exact page identity and sizing
attributes. The custom renderer paints chrome inside the private page placement;
it never becomes a second document-content owner.

Source: [paged view](../../../packages/plitejs/src/pagination/react.tsx#L564),
[example publisher](../../../apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx#L863),
[projection assembly](../../../apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx#L1778).

### Make fragmentation inputs truthful

`NodeLayoutPlan` exposes overlapping text/box/unit forms, caller-authored paths,
a feature-name box-kind union and split values `avoid`, `line`, `page`, and
`row`. A box lowers to one unit. Unit pagination reads each height and never
branches on its split value. The probe supplies a 1600px image to a 931px content
area: both `avoid` and `page` yield the same one-page, overflowing fragment.

Use `NodeFragmentationPlan = text | atomic | direct-children`. `atomic`
accepts one size for the owner. `direct-children` accepts only an ordered size
array whose length matches all direct element children. Pagination derives
owner/child paths and keys from one coherent source snapshot, making duplicate,
foreign, reordered and missing path partitions unrepresentable. Reject invalid
sizes, text siblings and length mismatch. Remove inert split values; add
continuation semantics only for a current renderer that can honor them. Plite
must not acquire a product TableKit or change table semantics as part of this
pagination review.

Source: [public forms](../../../packages/plitejs/src/pagination/index.ts#L173),
[default schema policy](../../../packages/plitejs/src/pagination/index.ts#L1633),
[unit pagination](../../../packages/plitejs/src/pagination/index.ts#L2852).

### Reopen refresh and precision, with proof before runtime acceptance

The public API exposes `sync`, `deferred`, delays and maximum delays. The example
requests 120/360ms deferred refresh for virtualization and estimates marked cold
fixture blocks. Those mechanisms do not establish exact page convergence after
input. Current `projectRange` proportionally divides run width by source offset,
so it is also insufficient evidence for native glyph/caret precision.

Move scheduling policy behind the owning view and compare against the existing
path before choosing it. Preserve an honest explicit precision boundary where
an independent headless consumer needs it. Do not preselect a new incremental
cache, skeleton state, worker, timer or generic scheduler. A fresh comparison
must measure accepted input through settled page layout, plus downstream
geometry and follow-up editing, not merely the first frame containing text.

## Design lanes and unit dispositions

| Lane | Assessment |
| --- | --- |
| Keep/configure | Existing page settings, custom engines and explicit fragmentation sizes serve real jobs. Configuration cannot make stored breaks authoritative or remove required projection assembly. |
| Change API | Implemented direct inputs to the paged owner and a smaller truthful fragmentation contract. |
| Add primitive | No independent job supports a pagination session, store plugin, provider stack or authority token. Reuse editor state, commit subscriptions and DOM coverage. |
| Delete/merge/inline | Cut the page-break persistence protocol; challenge the live controller as required render assembly, public scheduling/metrics, overlapping box metadata and projection plumbing. |
| Move ownership | Plite pagination owns neutral measurement, source-path derivation and paged native mechanics. Plate/app renderers own schema-specific fragmentation sizes and visual policy. Standalone measurement stays independent of an editable where needed. |
| Replace architecture | Semantic page nodes or independent editor/history stores violate the current visual-layout job. CSS-only and DOM-measured alternatives remain comparators; historic claims that they cannot scale are not current evidence. Whole-package deletion loses the current headless/custom-measurement and editable-page jobs. |

| Ledger unit | Verdict | Evidence and next owner |
| --- | --- | --- |
| `plitejs/pagination` | Adopted | One-shot measurement and truthful fragmentation own the surviving headless job. |
| `platejs/pagination` | Stop on a separate implementation | One exact facade earns reuse. Adopt upstream contract cuts through it, without a second runtime. |
| `example/plite/pagination` | Adopted | Pagination absorbs projection, publication and editing coordination; appearance and schema policy stay outside. |
| `export/plitejs/./pagination` | Stop on another package | Headless measurement is a current job. Keep a truthful feature subpath; any separation of the statically imported Pretext engine needs an actual independent dependency requirement and packed proof. |
| `export/plitejs/./pagination/react` | Adopted within this owner | The React boundary exposes the paged view and exact-host reads without external live layout assembly. |
| `export/platejs/./pagination` | Stop on another owner | Exact facade over the headless path; source maps and manifest inspected. |
| `export/platejs/./pagination/react` | Adopted through the exact facade | Exposes the surviving Plite view contract without a Plate pagination plugin or duplicate component implementation. |

These seven dispositions are adopted as one coupled Task implementation because
API, view lifetime, fragmentation, consumers and native/scale proof share one
owner.

## Earlier work and evidence limits

The [May architecture review](../../plans/2026-05-29-plite-pagination-architecture-review.md)
kept a functioning backbone. The [August rename](../../plans/2026-08-30-rename-page-layout-entrypoints-to-pagination.md)
explicitly excluded redesigning symbols and runtime. Neither protects the live
controller or page-break protocol from this audit. The [May source summary](../sources/editor-architecture/pretext-pagination-page-virtualization.md)
recommended authoritative snapshots; current executable evidence rejects that
implementation as authority. Keep its caution about measurement-profile drift.

The [exactness plan](../../plans/2026-05-31-exact-virtualized-pagination-plan.md)
never completed its exact-versus-incremental oracle. Its proposed skeletons and
caches are not accepted current architecture. The [June experiments](../../plans/2026-06-02-pagination-virtualized-stability-perf.md)
preserve useful failures: native projected input reordered `abcde` to `bcdea`,
and refresh scheduling changes regressed the selected timing gate. Their timings
are historical, not measurements of this checkout.

The [large-document adoption](../../plans/2026-09-11-large-documents-api-review.md)
already moved page-window ownership onto the page canvas and made omission
explicit. Current source confirms that part; do not reintroduce generic page
virtualization or treat old `domStrategy` wording as live API. Its broader
closure remains separately recorded. The [September selection diagnosis](../../plans/2026-09-10-editor-performance-follow-through.md)
distinguished releasing offscreen selection from a row-count failure. Preserve
that corrected setup without inheriting historical passes as fresh proof.

Audit-time baseline: **58 package tests, 213 assertions, four files; zero failures**.
The disposable probe passes **11 assertions** reproducing the current gaps,
with eight selected input hashes unchanged before/after. These hashes are a
bounded evidence snapshot, not a full release attestation. The probe uses the
estimated engine and makes no browser-measurement claim.

One independent same-model worker inspected five historical plans and the
current package/browser proof owners. The lead consumed its findings against
current source. No cross-model panel or Autoreview ran; `next` forbids the latter.

The subsequent Task design used three bounded same-model workers across
fragmentation, view integration and the final adversarial pass. The last pass
rejected the raw local-paint context because it rerendered all consumers, cut
caller-authored fragmentation paths, removed unearned public geometry/path
lookup helpers and completed the Plite reference/generated-doc adoption census.
The six disposable design probes pass **298 assertions**; they establish
planning owners and falsify rejected shapes, not production/native behavior.

At audit time, all 44 pagination browser cases explicitly required Chromium; drag
autoscroll also requires an opt-in environment variable. The copied typing
probe finishes on a frame with visible expected text, without requiring page
layout convergence, and counted all document elements. No browser suite,
device, cross-profile/export comparison, candidate runtime or scale experiment
ran in that audit. The implementation record and Task plan supersede those
proof limits with focused production evidence.

## Current proof and follow-up

The current pagination partition passes 37 tests and 102 assertions. The frozen
production-source cost packet passes 41,693 assertions across five cohorts;
the 1,000-block p95 is 19.41 ms against 19.71 ms. Four focused pagination and
six query-control Chromium cases pass, as do packed declarations, SSR,
tree-shaking, optional-peer isolation, registry generation and Plate Next
doctrine version 201. The exact receipts and aggregate-check limits are in the
linked Task plan. No publication was requested.
