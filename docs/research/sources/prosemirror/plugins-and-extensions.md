# ProseMirror: plugins and extensions

## ProseMirror test families

- **PM-14 plugin state.** `state/test/test-state.ts` checks the default document and selection, plugin fields, JSON round trips, stored marks, reconfiguration, transaction filtering, appended transactions and their root transaction, and plugin keys (`ProseMirror/prosemirror-state@57d4a96286ca972125a18a56ecd6d2b00927de30:test/test-state.ts:27-138`); the harvest adds the view webtests for rendered views and teardown. Plite keeps lifecycle and failure isolation in `packages/plitejs/test/react/view-source-fault-boundary.test.ts`; ProseMirror's plugin and prop bags are not a port target, and product plugin lifecycle belongs to Plate. Source: `docs/editor-test-harvester/prosemirror/report.md:153`.

- **PM-22 search.** prosemirror-search's tests check plain, case-insensitive, literal, whole-word and regular-expression queries, matches across mark boundaries and textblocks, `findNext` and `findPrev` with and without wrapping and inside a range, replacement with capture groups, inside non-leaf atoms and over a range, and zero-length matches (`ProseMirror/prosemirror-search@ff1148a339bb7daa9d7b02dff9614b9d7123f552:test/test-query.ts:36-82`, `test/test-search.ts:46-235`). Plate's counterpart is `apps/plite/tests/plite-browser/donor/examples/search-highlighting.test.ts`; Plite supplies anchors and mapped decorations, and the search product surface belongs to Plate. Source: `docs/editor-test-harvester/prosemirror/report.md:161`.

## Appended transactions

- ProseMirror applies the initiating transaction and repeatedly offers plugins appended transactions against updated state. The mechanism gives repairs current document state, but introduces additional transaction objects and repeated plugin calls rather than one private correction phase. Evidence: the July review of `ProseMirror/prosemirror-state@ffad5d94:src/state.ts` and `PluginSpec.appendTransaction`, recorded in `c70bacbd4a:docs/plans/2026-07-12-plite-normalization-lifecycle-architecture.md:455`. The comparison concerns settlement ownership, not measured performance.

## Transaction-owned plugin state

- ProseMirror plugin state initializes with editor state and applies through transactions; plugins can filter transactions or append further transactions. The April 30 local source read cites `state/src/plugin.ts:7-40` and `:91-115` (`c70bacbd4a:docs/plans/2026-04-30-plite-next-rewrite-candidates-ralplan.md:101`). This is evidence for transaction-owned feature state, not a recommendation to copy ProseMirror's plugin API. Limit: the plan does not pin the checkout revision or record an execution of those sources.
