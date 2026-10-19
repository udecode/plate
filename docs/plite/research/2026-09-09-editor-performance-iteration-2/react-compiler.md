# React 19 Compiler: observable state before coverage

Keep Compiler enabled where it produces correct, exercised output. Do not pursue 100% transformation coverage as a performance target. The useful target is ordinary React code with correct observable snapshots, owned resources and measured reductions in the work a user waits for.

The current four-arm packet passed all 408 attempts. At 10k paragraphs, Plite split p95 was 165.0 ms with compilation off and 124.5 ms on; Plate was 247.3 versus 188.7 ms. Mount p95 was 803.5 versus 798.2 ms for Plite, and 1,532.2 versus 1,558.0 ms for Plate. Other operations were mixed. These broad distributions support a focused split investigation, not a general speedup claim. See [all 48 off/on comparisons](../../../plans/artifacts/2026-09-09-editor-performance-research-iteration-2/compiler-deltas.md), including p50 and IQR.

The packet uses installed React 19.2.8, Compiler 1.0.0, Babel 8, production bundles and the same seven selected interactions plus mount at 100/1k/10k. Every input hash was stable during this packet. The earlier nine-editor packet has a different frozen source identity and is not pooled with it. The clock ends at frame opportunities, not a verified paint event. A fresh successful compile is neither complete product-route proof nor a package-consumer attestation.

## Source diagnostic inventory

The source-only diagnostic covers 1,547 unique non-test JS/TS modules from Plite, Plate, the registry and www shell. It records per-file SHA-256, Compiler events, emitted runtime imports and explicit exclusions. All source hashes remained stable; zero transforms threw. Compiler `CompileError` events below mean functions were skipped or diagnosed, not that the build failed.

| Surface | Files | Files with Compiler runtime import | CompileSuccess events | CompileError events | Explicit `use no memo` |
| --- | --: | --: | --: | --: | --: |
| Plite | 442 | 53 | 134 | 93 | 1 |
| Plate | 495 | 37 | 74 | 39 | 0 |
| Copied registry source | 318 | 158 | 373 | 70 | 0 |
| www shell | 292 | 185 | 574 | 120 | 0 |
| Total | 1,547 | 433 | 1,155 | 322 | 1 |

A file can contain several functions and several diagnostics; event counts are not a component denominator. Static sources are inventoried even where the package build intentionally excludes them. These are Babel source-probe results, not Next's emitted transform results. The canonical `check-react-compiler-contract.mjs` passed for the inspected configuration; that gate does not turn all 322 diagnostics into accepted code.

Of the 322 diagnostics, 262 report a Babel/HIR assignment-pattern lowering limitation. The same 1,547 source hashes with installed Babel 7.29.0 produce **68 diagnostic events, zero assignment-pattern errors, 1,291 CompileSuccess events and 469 files with a Compiler runtime import**. All transforms completed and inputs stayed unchanged. This is direct evidence that the large diagnostic count depends on the toolchain pairing; it does not justify rewriting hundreds of normal destructured defaults.

The remaining Babel 7 events comprise 39 language-lowering reports, nine immutability reports, seven ref-access reports, five memo-dependency reports, four manual-memoization reports, two hook reports, one incompatible-library report and one suppression. [Every control event and paired original function](../../../plans/artifacts/2026-09-09-editor-performance-research-iteration-2/react-compiler-toolchain-control.md) has a source-linked disposition. The control exposes two further owners: ColorInput constructs a deferred click handler through `Children.map`, and CommandRoot holds a mutable imperative store with delayed callbacks. Neither diagnostic alone proves a render-time read or temporal-dead-zone bug. Any CommandRoot change must retain its imperative search/selection, controlled state, focus, keyboard and IME behavior.

This comparison changes only the diagnostic transform. There is no Babel 7 editing-latency packet, production toolchain switch or emitted-consumer equivalence claim. Actual package and copied-source consumer output remains the decisive gate before changing the build owner.

## Projects worth studying, and the mechanism each contributes

This is a source-selected research set, not a leaderboard of the fastest React applications. A GitHub search for Compiler references in popular TypeScript repositories returned 275 results; the recorded 12-result sample contained substantial unrelated material. An Oxc-specific search returned one compiler fork; a narrower editor/performance description query returned none. Popularity discovers leads and does not establish performance. The repository pins, query receipt and read ledger preserve the selection boundary.

| Project | Source mechanism inspected | Local decision |
| --- | --- | --- |
| React | `use-sync-external-store/src/useSyncExternalStoreWithSelector.js` keeps snapshot/selection memoization local to a concurrent hook instance and commits the rendered selection | First reference for any selector-adapter redesign; do not copy mutable shared caches across renders |
| ProseKit | `use-editor-derived-value.ts` publishes a derived value through `useSyncExternalStore`; `use-editor.ts` documents the limitation of returning a stable mutable editor | Adapt the observable-value principle; current Plite inline selector/equality and exact-view behavior remain controls |
| Zustand | `src/react.ts` selects a store snapshot; `src/traditional.ts` delegates equality to React's selector adapter | A smaller canonical adapter is a useful counterfactual; adding Zustand beside the editor store would create another authority |
| Jotai | `useAtomValue.ts` compares value/store/atom identity and owns subscription cleanup | Study dependency-local notification; do not introduce an atom graph without a measured job the current fields cannot own |
| Sanity | Compiler-enabled editor/product and library-consumer guidance, including explicit TypeScript lint coverage and distinct package compilation | Useful build/consumer proof model; current official Oxc guidance is newer than the pinned local checkout |
| Excalidraw | A real drawing application with its own mutable scene, batching and pointer scheduling; Plate's `useExcalidrawSync` serializes complete scenes | Measure that scene boundary directly; its interaction model does not establish text-editor Compiler performance |
| TanStack Virtual | Imperative measurement object at Plite's virtualized view boundary | Keep its semantic Compiler exclusion until an immutable-snapshot experiment proves geometry correctness |
| tldraw | Repository provenance retained as a drawing/state lead; no directly verified current state-react implementation was resolved in the captured checkout | Defer mechanism adoption; do not borrow a performance reputation as evidence |

React's [Compiler troubleshooting guidance](https://react.dev/learn/react-compiler/debugging) distinguishes safe optimization skips from runtime behavior changes and warns against depending on incidental memoization identity. Its [external-store contract](https://react.dev/reference/react/useSyncExternalStore) requires stable snapshots while data is unchanged. Those are correctness constraints, not reasons to retain an unnecessary local abstraction.

Sanity's [current Compiler guidance](https://www.sanity.io/docs/help/react-compiler), updated September 4, describes an experimental Oxc transform, retained Babel default, custom-JSX restrictions and the need to inspect emitted output. It also warns that an ESLint configuration can miss TypeScript files while exiting successfully. The local Sanity pin predates that Oxc documentation; no local Oxc performance or runtime equivalence result is claimed here.

## The important local boundary

`packages/plitejs/src/react/hooks/use-generic-selector.tsx` currently returns a selected value while using a version snapshot to notify React. A separate committed record owns the latest selector, equality function, selected state and callback error. Layout commit rejects a stale render snapshot. Its `use no memo` is protecting reads through that mutable committed record. Merely deleting the directive can produce stale derived values.

The strongest architectural alternative is one canonical immutable selected snapshot, consumed through a selector adapter whose concurrent-render behavior is already proven. The current API accepts inferred inline callbacks; a target that makes every consumer add `useCallback`, dependency arrays or explicit transaction types is not an improvement. Also preserve error propagation, changing equality functions, render aborts, optional stores and exact mounted-view routing.

This direction remains E06, conditional on real allocation/fanout attribution. Phase 4 already rejected narrower selector attempts, and current native text paths can legitimately avoid React rendering. Rewriting the adapter because it is uncompiled would optimize the coverage report rather than the operation.

## Resource identity and semantic memoization

AI sessions are editor-owned with view registration and explicit disposal. Excalidraw subscriptions belong to a mounted drawing API. Code-drawing rendering has cancellation guards and an Export consumer even when preview is hidden. These lifetimes cannot be inferred from whether Compiler happens to reuse an object.

The desired code creates or attaches external resources at their actual lifecycle boundary, observes immutable values during render and derives ordinary values without a second mutable truth. Removing a `useMemo` is safe only when correctness survives recomputation. Keeping a resource instance stable may require an explicit owner, but that owner should be the current editor/view/session rather than a new global cache.

## Separate proof lanes

1. **Source eligibility:** unique functions, diagnostics, explicit semantic exclusions and source hashes. Do not use an event total as a percentage of product coverage.
2. **Emitted package behavior:** bind source functions to the actual `tsdown` output, export graph, runtime version and equal-feature external consumer. Package compilation happens before publication; a consuming app cannot be assumed to repair it.
3. **Copied-source behavior:** build an actual registry consumer with its compiler configuration. Package proof does not prove copied TSX.
4. **Runtime behavior:** off/on controls for mounting, structural edits, a rerendering feature, inline selectors, resource teardown, strict/concurrent rendering and native selection. Keep source and compiled fixtures identical.
5. **Performance:** complete-operation distributions, retained heap, render/subscription counts and trace attribution. No claim follows merely from a generated runtime import.

The current packet completes a bounded part of lane 4 and provides lane 5 measurements for eight rows. The two source diagnostics cover lane 1 with explicit per-event dispositions. Broader emitted-consumer and runtime proof for diagnosed functions remains incomplete; this is not a certificate of perfect Compiler compatibility. E15's Oxc experiment addresses build cost and output equivalence independently of E01/E02's editing latency.
