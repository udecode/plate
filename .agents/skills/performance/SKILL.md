---
description: 'Review performance lanes with GitHub-scale tactics not owned by Vercel React rules: cohort segmentation, repeated-unit budgets, interaction-level INP, memory tagging, degradation contracts, browser trace proof, and production dashboards.'
argument-hint: '[scope | benchmark | plan path]'
disable-model-invocation: true
name: performance
metadata:
  skiller:
    source: .agents/rules/performance.mdc
---

# Performance

Handle $ARGUMENTS.

Use this as the top-level performance lane orchestrator. It does not duplicate
`vercel-react-best-practices`, `react-useeffect`, or `performance-oracle`.
Those skills own micro-rules. This skill owns the missing review shape:
cohorts, repeated-unit budgets, interaction p95/p99, memory tags, degradation
contracts, native behavior, trace proof, and dashboard/RUM gaps.

## Relationship To Other Perf Skills

| Source | Owns | Use here as |
| --- | --- | --- |
| `vercel-react-best-practices` | React/Next waterfalls, bundles, server/client fetching, rerenders, rendering, JS micro-opts, advanced hooks | baseline micro-rule references |
| `react-useeffect` | effect law and alternatives | effect/subscription sanity |
| `performance-oracle` | Big-O, memory, cache, DB/network, 10x/100x/1000x projections | bounded complexity proof |
| Chrome DevTools / Lighthouse / web.dev docs | trace, Core Web Vitals, network chains, layout shifts, a11y snapshot | browser proof when load/hydration/layout matters |
| `performance` | cohorting, budgets, p95/p99 interactions, degradation, RUM/dashboard | final performance-lane shape |

Rule: if a plan only says "use React best practices" or "avoid O(n)", it is
not done. It needs cohort, repeated-unit, interaction, memory, and degradation
answers.

## Vercel React Rules Already Covered

Use these directly; do not rewrite them in this skill. Each entry includes the
Vercel quick-reference description plus trigger text so the agent can load the
right rule instead of skipping because the link name is too terse.

### Async / Waterfalls

- [async-cheap-condition-before-await](../vercel-react-best-practices/rules/async-cheap-condition-before-await.md) - Check cheap sync conditions before awaiting flags or remote values. Load when an async branch first awaits feature flags, auth/session state, remote config, or permissions before testing a cheap local condition that could return early.
- [async-defer-await](../vercel-react-best-practices/rules/async-defer-await.md) - Move await into branches where actually used. Load when an awaited value is computed before conditionals, optional UI, rare branches, redirects, or error paths that may never need it.
- [async-parallel](../vercel-react-best-practices/rules/async-parallel.md) - Use Promise.all() for independent operations. Load when server components, loaders, route handlers, API routes, or setup code await unrelated fetches/db calls sequentially.
- [async-dependencies](../vercel-react-best-practices/rules/async-dependencies.md) - Use better-all for partial dependencies. Load when some async work depends on prior results but other branches can start early, especially mixed independent and dependent fetch graphs.
- [async-api-routes](../vercel-react-best-practices/rules/async-api-routes.md) - Start promises early, await late in API routes. Load when route handlers perform auth, validation, fetches, writes, logging, or response shaping in unnecessary sequence.
- [async-suspense-boundaries](../vercel-react-best-practices/rules/async-suspense-boundaries.md) - Use Suspense to stream content. Load when a page or route blocks all visible content behind slow data that could be isolated in a Suspense boundary.

### Bundle

- [bundle-barrel-imports](../vercel-react-best-practices/rules/bundle-barrel-imports.md) - Import directly, avoid barrel files. Load when client bundles import from package indexes, icon barrels, kitchen-sink UI modules, or public barrels that pull more code than needed.
- [bundle-dynamic-imports](../vercel-react-best-practices/rules/bundle-dynamic-imports.md) - Use next/dynamic for heavy components. Load when charts, editors, modals, inspectors, markdown engines, rich text plugins, or rarely opened panels ship in the initial client bundle.
- [bundle-defer-third-party](../vercel-react-best-practices/rules/bundle-defer-third-party.md) - Load analytics/logging after hydration. Load when third-party scripts, analytics, monitoring, chat widgets, or session tools compete with first interaction or hydration.
- [bundle-conditional](../vercel-react-best-practices/rules/bundle-conditional.md) - Load modules only when feature is activated. Load when optional feature code is imported eagerly even though it is gated by user action, route state, flags, viewport, role, or mode.
- [bundle-preload](../vercel-react-best-practices/rules/bundle-preload.md) - Preload on hover/focus for perceived speed. Load when lazy chunks are correct but first open feels slow and there is a reliable intent signal such as hover, focus, pointer down, or route prefetch.

### Server

- [server-auth-actions](../vercel-react-best-practices/rules/server-auth-actions.md) - Authenticate server actions like API routes. Load when server actions mutate data, read protected state, or depend on client-side trust without explicit server-side auth/authorization.
- [server-cache-react](../vercel-react-best-practices/rules/server-cache-react.md) - Use React.cache() for per-request deduplication. Load when the same expensive server fetch/db call/config read repeats within one render/request.
- [server-cache-lru](../vercel-react-best-practices/rules/server-cache-lru.md) - Use LRU cache for cross-request caching. Load when stable expensive data is recomputed across requests and needs bounded process-level caching with explicit invalidation risk.
- [server-dedup-props](../vercel-react-best-practices/rules/server-dedup-props.md) - Avoid duplicate serialization in RSC props. Load when the same large object, list, config, tree, or payload is passed repeatedly from server to client components.
- [server-hoist-static-io](../vercel-react-best-practices/rules/server-hoist-static-io.md) - Hoist static I/O (fonts, logos) to module level. Load when static assets, file reads, font metadata, icons, or invariant configuration are read inside request/render functions.
- [server-no-shared-module-state](../vercel-react-best-practices/rules/server-no-shared-module-state.md) - Avoid module-level mutable request state in RSC/SSR. Load when per-user or per-request data is stored in module variables, singleton objects, caches without keys, or mutable globals.
- [server-serialization](../vercel-react-best-practices/rules/server-serialization.md) - Minimize data passed to client components. Load when client components receive full records, nested payloads, large lists, rich objects, or fields not needed for browser interactivity.
- [server-parallel-fetching](../vercel-react-best-practices/rules/server-parallel-fetching.md) - Restructure components to parallelize fetches. Load when nested server components create fetch waterfalls or parent data blocks children that could fetch independently.
- [server-parallel-nested-fetching](../vercel-react-best-practices/rules/server-parallel-nested-fetching.md) - Chain nested fetches per item in Promise.all. Load when list items each need dependent fetches but the per-item chains can run in parallel across items.
- [server-after-nonblocking](../vercel-react-best-practices/rules/server-after-nonblocking.md) - Use after() for non-blocking operations. Load when analytics, logging, revalidation, notifications, cleanup, or side work blocks the response path.

### Client

- [client-swr-dedup](../vercel-react-best-practices/rules/client-swr-dedup.md) - Use SWR for automatic request deduplication. Load when client components duplicate fetches, polling, cache reads, or stale/revalidate logic by hand.
- [client-event-listeners](../vercel-react-best-practices/rules/client-event-listeners.md) - Deduplicate global event listeners. Load when many components attach window/document listeners for resize, scroll, pointer, keyboard, visibility, or selection state.
- [client-passive-event-listeners](../vercel-react-best-practices/rules/client-passive-event-listeners.md) - Use passive listeners for scroll. Load when scroll/touch/wheel listeners can block scrolling or show up in browser trace input latency.
- [client-localstorage-schema](../vercel-react-best-practices/rules/client-localstorage-schema.md) - Version and minimize localStorage data. Load when localStorage/sessionStorage reads are large, repeated, unversioned, blocking startup, or used as an implicit schema.

### Rerender

- [rerender-defer-reads](../vercel-react-best-practices/rules/rerender-defer-reads.md) - Don't subscribe to state only used in callbacks. Load when components rerender because they read state/store values used only inside event handlers, callbacks, commands, or deferred work.
- [rerender-memo](../vercel-react-best-practices/rules/rerender-memo.md) - Extract expensive work into memoized components. Load when expensive child trees rerender from parent churn and have stable enough props for `memo`.
- [rerender-memo-with-default-value](../vercel-react-best-practices/rules/rerender-memo-with-default-value.md) - Hoist default non-primitive props. Load when memoized components still rerender because default arrays, objects, functions, or config literals are recreated.
- [rerender-dependencies](../vercel-react-best-practices/rules/rerender-dependencies.md) - Use primitive dependencies in effects. Load when hooks depend on broad objects/arrays/functions that change identity even though only primitive fields matter.
- [rerender-derived-state](../vercel-react-best-practices/rules/rerender-derived-state.md) - Subscribe to derived booleans, not raw values. Load when components subscribe to full objects/lists/stores only to compute a small boolean or scalar.
- [rerender-derived-state-no-effect](../vercel-react-best-practices/rules/rerender-derived-state-no-effect.md) - Derive state during render, not effects. Load when `useEffect` plus `setState` mirrors props/store values or computes render-only derived data.
- [rerender-functional-setstate](../vercel-react-best-practices/rules/rerender-functional-setstate.md) - Use functional setState for stable callbacks. Load when callbacks depend on current state only to compute next state, causing unstable callback identities.
- [rerender-lazy-state-init](../vercel-react-best-practices/rules/rerender-lazy-state-init.md) - Pass function to useState for expensive values. Load when initial state performs heavy parsing, allocation, storage reads, or data shaping on every render.
- [rerender-simple-expression-in-memo](../vercel-react-best-practices/rules/rerender-simple-expression-in-memo.md) - Avoid memo for simple primitives. Load when `useMemo` wraps cheap primitive math/string/boolean expressions and adds noise or dependency risk.
- [rerender-split-combined-hooks](../vercel-react-best-practices/rules/rerender-split-combined-hooks.md) - Split hooks with independent dependencies. Load when one memo/effect/callback combines unrelated dependencies and reruns all work when only one part changed.
- [rerender-move-effect-to-event](../vercel-react-best-practices/rules/rerender-move-effect-to-event.md) - Put interaction logic in event handlers. Load when effects observe state just to perform work caused by a click, submit, selection change, command, or user action.
- [rerender-transitions](../vercel-react-best-practices/rules/rerender-transitions.md) - Use startTransition for non-urgent updates. Load when non-urgent filtering, navigation-adjacent UI, previews, sidebars, or projections compete with urgent input.
- [rerender-use-deferred-value](../vercel-react-best-practices/rules/rerender-use-deferred-value.md) - Defer expensive renders to keep input responsive. Load when text input, typing, selection, or sliders drive expensive result lists/previews that can lag behind.
- [rerender-use-ref-transient-values](../vercel-react-best-practices/rules/rerender-use-ref-transient-values.md) - Use refs for transient frequent values. Load when high-frequency pointer, scroll, measurement, timer, or drag values trigger renders but are not needed for visible output.
- [rerender-no-inline-components](../vercel-react-best-practices/rules/rerender-no-inline-components.md) - Don't define components inside components. Load when nested component definitions remount children, reset state, or defeat memoization on every parent render.

### Rendering

- [rendering-animate-svg-wrapper](../vercel-react-best-practices/rules/rendering-animate-svg-wrapper.md) - Animate div wrapper, not SVG element. Load when SVG animation causes layout/paint cost, browser quirks, or poor compositing.
- [rendering-content-visibility](../vercel-react-best-practices/rules/rendering-content-visibility.md) - Use content-visibility for long lists. Load when DOM-present long lists/documents need browser rendering containment without removing content from the DOM.
- [rendering-hoist-jsx](../vercel-react-best-practices/rules/rendering-hoist-jsx.md) - Extract static JSX outside components. Load when static subtrees, icons, labels, or markup are recreated inside hot React renders.
- [rendering-svg-precision](../vercel-react-best-practices/rules/rendering-svg-precision.md) - Reduce SVG coordinate precision. Load when large SVGs, generated icons, charts, or paths inflate HTML/JS/CSS and parse cost with unnecessary decimals.
- [rendering-hydration-no-flicker](../vercel-react-best-practices/rules/rendering-hydration-no-flicker.md) - Use inline script for client-only data. Load when hydration produces visible theme/auth/layout flicker that can be resolved before React hydrates.
- [rendering-hydration-suppress-warning](../vercel-react-best-practices/rules/rendering-hydration-suppress-warning.md) - Suppress expected mismatches. Load when a known, isolated server/client mismatch is intentional and should not create noisy hydration warnings.
- [rendering-activity](../vercel-react-best-practices/rules/rendering-activity.md) - Use Activity component for show/hide. Load when React 19 `Activity` can hide UI panels, preserve state, unmount effects, and defer hidden updates without treating editor body DOM as virtualized.
- [rendering-conditional-render](../vercel-react-best-practices/rules/rendering-conditional-render.md) - Use ternary, not && for conditionals. Load when `&&` can leak `0`, empty strings, or produce unclear conditional rendering in JSX.
- [rendering-usetransition-loading](../vercel-react-best-practices/rules/rendering-usetransition-loading.md) - Prefer useTransition for loading state. Load when pending UI for non-urgent transitions is manually managed or blocks urgent interaction feedback.
- [rendering-resource-hints](../vercel-react-best-practices/rules/rendering-resource-hints.md) - Use React DOM resource hints for preloading. Load when critical fonts, scripts, styles, images, or connections need preconnect/preload/preinit hints.
- [rendering-script-defer-async](../vercel-react-best-practices/rules/rendering-script-defer-async.md) - Use defer or async on script tags. Load when scripts block parsing, hydration, rendering, or first input unnecessarily.

### JavaScript

- [js-batch-dom-css](../vercel-react-best-practices/rules/js-batch-dom-css.md) - Group CSS changes via classes or cssText. Load when code performs repeated DOM style writes, toggles many individual style properties, or mixes style writes across loops.
- [js-index-maps](../vercel-react-best-practices/rules/js-index-maps.md) - Build Map for repeated lookups. Load when repeated `find`, `filter`, `some`, path scans, id lookups, or nested loops can become keyed lookup maps.
- [js-cache-property-access](../vercel-react-best-practices/rules/js-cache-property-access.md) - Cache object properties in loops. Load when hot loops repeatedly dereference deep properties, getters, optional chains, or computed access.
- [js-cache-function-results](../vercel-react-best-practices/rules/js-cache-function-results.md) - Cache function results in module-level Map. Load when pure expensive functions repeat for the same keys across renders, requests, blocks, decorations, or rows.
- [js-cache-storage](../vercel-react-best-practices/rules/js-cache-storage.md) - Cache localStorage/sessionStorage reads. Load when browser storage is read repeatedly during startup, render, effects, or interactions.
- [js-combine-iterations](../vercel-react-best-practices/rules/js-combine-iterations.md) - Combine multiple filter/map into one loop. Load when hot paths chain array passes over large lists, blocks, leaves, decorations, annotations, or rows.
- [js-length-check-first](../vercel-react-best-practices/rules/js-length-check-first.md) - Check array length before expensive comparison. Load when equality/diff checks compare arrays/objects deeply before cheap length/version/identity guards.
- [js-early-exit](../vercel-react-best-practices/rules/js-early-exit.md) - Return early from functions. Load when hot functions do expensive setup before obvious no-op, unchanged, empty, disabled, or out-of-range checks.
- [js-hoist-regexp](../vercel-react-best-practices/rules/js-hoist-regexp.md) - Hoist RegExp creation outside loops. Load when regexes are created inside render, loops, parsers, decorators, validation, or repeated text scans.
- [js-min-max-loop](../vercel-react-best-practices/rules/js-min-max-loop.md) - Use loop for min/max instead of sort. Load when code sorts arrays just to find min, max, first, last, bounds, or priority.
- [js-set-map-lookups](../vercel-react-best-practices/rules/js-set-map-lookups.md) - Use Set/Map for O(1) lookups. Load when membership checks use arrays in hot paths or repeated units.
- [js-tosorted-immutable](../vercel-react-best-practices/rules/js-tosorted-immutable.md) - Use toSorted() for immutability. Load when code clones arrays just to sort immutably, or mutates input arrays with `sort()`.
- [js-flatmap-filter](../vercel-react-best-practices/rules/js-flatmap-filter.md) - Use flatMap to map and filter in one pass. Load when code maps to optional values and then filters null/undefined, especially over large arrays.
- [js-request-idle-callback](../vercel-react-best-practices/rules/js-request-idle-callback.md) - Defer non-critical work to browser idle time. Load when cleanup, analytics, precomputation, background indexing, or low-priority hydration work competes with visible interaction; require a max-latency fallback when completion matters.

### Advanced

- [advanced-effect-event-deps](../vercel-react-best-practices/rules/advanced-effect-event-deps.md) - Don't put `useEffectEvent` results in effect deps. Load when React 19 `useEffectEvent` is used for effect-fired event callbacks and dependency handling is unclear.
- [advanced-event-handler-refs](../vercel-react-best-practices/rules/advanced-event-handler-refs.md) - Store event handlers in refs. Load when stable subscriptions/listeners need latest callback behavior without reattaching on every render.
- [advanced-init-once](../vercel-react-best-practices/rules/advanced-init-once.md) - Initialize app once per app load. Load when app-wide clients, SDKs, observers, stores, instrumentation, or workers are initialized repeatedly by components.
- [advanced-use-latest](../vercel-react-best-practices/rules/advanced-use-latest.md) - useLatest for stable callback refs. Load when long-lived callbacks, timers, listeners, observers, or async continuations need current props/state without changing identity.

## Extra Rules Owned Here

Load only the relevant rule files. These are not covered by Vercel React rules;
each entry describes the performance lane question it owns.

- [cohort-segmentation](./rules/cohort-segmentation.md) - Segment by document/surface size and complexity before choosing tactics. Load when a plan says "large document", "big list", "stress case", or "performance mode" without defining normal/medium/large/stress/pathological cohorts and complexity tags.
- [repeated-unit-budget](./rules/repeated-unit-budget.md) - Budget the hot repeated unit before optimizing globally. Load when blocks, lines, rows, leaves, groups, decorations, or islands repeat at scale and need DOM/component/handler/effect/subscription/allocation/layout budgets.
- [rare-state-isolation](./rules/rare-state-isolation.md) - Keep the primary repeated unit focused on primary content and mount rare UI state only when active. Load when comments, menus, hover chrome, debug panels, selection tools, or context actions are carried by every row/block.
- [event-delegation-budget](./rules/event-delegation-budget.md) - Delegate repeated handlers to stable parents and track handler count per unit. Load when thousands of repeated units attach pointer, hover, keyboard, drag, resize, selection, or scroll handlers.
- [effect-subscription-budget](./rules/effect-subscription-budget.md) - Ban unnecessary effects in repeated units and scope runtime subscriptions by id/range. Load when repeated units run effects, subscribe to editor/runtime stores, or resubscribe because callbacks need latest props.
- [css-layout-hotpath](./rules/css-layout-hotpath.md) - Prove selectors, layout reads/writes, drag/resize, overlays, and selection geometry are not causing interaction latency. Load when trace or code suggests `:has`, broad selectors, forced layout, scroll geometry, or layout-changing overlay movement in hot paths.
- [interaction-inp-matrix](./rules/interaction-inp-matrix.md) - Track interaction-level p50/p75/p95/p99 latency by cohort and mode. Load when a plan claims responsiveness from averages, startup time, one smoke benchmark, or a direct model path without native event/copy/paste/select follow-up rows.
- [memory-dom-tagging](./rules/memory-dom-tagging.md) - Pair timing with heap, DOM, component, listener, mounted group, cache, and hidden-boundary tags. Load when a mode may improve latency by exploding memory, DOM nodes, subscriptions, cached indexes, or mounted units.
- [degradation-contract](./rules/degradation-contract.md) - State exactly which native behaviors change under virtualization, shell islands, model-backed selection, or staged mounting. Load when performance requires an opt-in/aggressive mode or any behavior less native than DOM-present editing.
- [staged-readiness](./rules/staged-readiness.md) - Separate `interactiveReady` from `nativeSurfaceComplete` and reject stale old DOM as current content. Load when startup, hydration, full-doc replace, insert-fragment, or staged DOM-present mounting is part of the plan.
- [react-19-runtime-proof](./rules/react-19-runtime-proof.md) - Apply React 19.2 primitives deliberately and state what they do not solve. Load when `Activity`, transitions, deferred values, `useEffectEvent`, React Performance Tracks, `cacheSignal`, or partial prerendering are proposed for editor or app performance.
- [browser-trace-cwv-proof](./rules/browser-trace-cwv-proof.md) - Separate page-load/Core Web Vitals proof from editor interaction proof. Load when claims involve load, hydration, network chains, layout shifts, long tasks, LCP/FCP/TBT/CLS, or trace evidence.
- [production-rum-dashboard](./rules/production-rum-dashboard.md) - Design the Datadog/RUM dashboard and tags needed to catch real regressions. Load when a performance claim matters beyond local benchmarks or needs interaction name, cohort, mode, document size, memory, DOM, browser, mobile, IME, and release tagging.
- [editor-native-behavior-proof](./rules/editor-native-behavior-proof.md) - Require proof that faster modes preserve or explicitly classify browser find, screen-reader traversal, native selection, copy, paste, select-all, IME, mobile touch selection, undo/history, collaboration, and follow-up typing. Load when editor performance changes DOM presence, selection mapping, materialization, shells, hidden content, or model-backed behavior.

## Pass Order

1. Segment the workload.
2. Budget the repeated unit.
3. Simplify the normal path.
4. Move rare state out.
5. Add O(1) indexes using Vercel `js-*` rules where applicable.
6. Apply React runtime features deliberately.
7. Choose degradation rules.
8. Instrument interactions.
9. Record trace and dashboard requirements.

## Slate Plan Performance Pass

When used inside `slate-plan`, record this lens in the applicable
implementation review matrix.

Must answer:

- What Vercel rules cover the micro-tactics?
- What extra rule files from this skill apply?
- What is the repeated unit and current/target budget?
- Which cohorts are normal, large, stress, and pathological?
- Which interaction-level INP rows or lab proxies prove responsiveness?
- Which memory tags prove the heap/DOM/component count does not explode?
- Which degradation mode applies only to which cohort?
- Which native browser behaviors are preserved or intentionally degraded?
- Which React 19.2 primitive applies, and what does it explicitly not solve?
- Which Chrome trace or Core Web Vitals proof is relevant, and which load
  metrics are intentionally out of scope?
- What Datadog/RUM view would catch the regression?

## Output Shape

Record in the active plan or review:

```md
### Performance

- applicability: applied | skipped
- Vercel rules used:
- extra rules used:
- repeated unit:
- cohorts:
- budgets:
- React/runtime primitives:
- interaction metrics:
- trace/CWV proof:
- memory tags:
- degradation contract:
- dashboard/RUM gap:
- plan delta:
```

Keep the pass short. If it cannot change the plan, write the no-change defense
with evidence.
