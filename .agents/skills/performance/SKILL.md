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

Use this when a Plate plan claims speed, responsiveness, large-document readiness, or production performance. This skill owns the review shape around cohorts, repeated-unit budgets, p95/p99 interactions, memory/DOM tags, degradation contracts, native editor behavior, trace proof, and RUM gaps. It delegates React/Next micro-tactics, effect law, and complexity analysis to the skills that already own them.

## Owner Map

| Source | Owns | Use in this pass |
| --- | --- | --- |
| `vercel-react-best-practices` | React/Next waterfalls, bundles, server/client fetching, rerenders, rendering, JS micro-opts, React runtime primitives | Load exact rule files for local micro-tactics. Do not paste the whole Vercel catalog into the plan. |
| `react-useeffect` | Effect law, subscriptions, event/effect alternatives | Use when repeated units attach effects, listeners, observers, or store subscriptions. |
| Chrome DevTools, Lighthouse, web.dev docs | Browser traces, Core Web Vitals, network chains, layout shifts, long tasks | Use when load, hydration, layout, or input latency needs browser proof. |
| `performance` | Big-O, cache shape, memory pressure, 10x/100x/1000x projections, cohorts, repeated-unit budgets, p95/p99 interactions, memory tags, degradation, native behavior proof, RUM/dashboard gaps | Record the final performance-lane verdict. |

Rule: if the plan only says "use React best practices", "avoid O(n)", or "seems fast locally", it is not done.

## Required Output

Record this in the active plan or review:

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

Keep it short. If this pass cannot change the plan, write the no-change defense with evidence.

## Quick Pass

1. Segment the workload into normal, large, stress, and pathological cohorts.
2. Name the repeated unit: block, row, cell, leaf, decoration, overlay, island, listener, or subscription.
3. Set current and target budgets for DOM nodes, components, handlers, effects, subscriptions, allocations, layout reads/writes, and memory per repeated unit.
4. Simplify the normal path before adding special modes.
5. Move rare state out of the repeated unit: comments, menus, hover chrome, selection tools, debug panels, context actions.
6. Add O(1) indexes or cached lookups only where the hot path proves repeated scans.
7. Choose the degradation contract for aggressive modes: native, DOM-present staged, shell island, virtualized, or model-backed.
8. Instrument p50/p75/p95/p99 interaction rows by cohort and mode.
9. Record browser trace proof and production/RUM tags when the claim matters outside the lab.

Done. The review has a workload, a unit budget, an interaction matrix, and a proof path.

## Blockers

Stop the performance claim or mark the plan incomplete when any required answer is missing:

| Missing answer | Why it blocks |
| --- | --- |
| Cohorts | "Large document" has no testable meaning. |
| Repeated-unit budget | The plan can make one block cheap while making 10,000 blocks impossible. |
| p95/p99 interaction row | Averages hide input stalls. |
| Memory/DOM/component tag | Latency wins can explode heap, subscriptions, or mounted DOM. |
| Degradation contract | Faster modes can silently break browser-native editing behavior. |
| Native behavior proof | Editor perf is not good if find, copy, paste, selection, IME, undo, or collaboration regress. |
| Trace or RUM proof | Production-facing claims need browser evidence or dashboard tags. |

If a blocker does not apply, say why in one line. Silence is not a pass.

## Vercel Rule Selection

Load exact Vercel rule files only when the code or plan needs them:

| Symptom | Rule family |
| --- | --- |
| Sequential fetches, blocked route work, slow server setup | `async-*`, `server-*` |
| Heavy optional UI or package barrels in client bundles | `bundle-*` |
| Repeated browser listeners, storage reads, duplicate client fetches | `client-*` |
| Hot editor rows rerender from broad subscriptions or unstable props | `rerender-*` |
| Long DOM lists, hydration flicker, hidden panels, resource hints | `rendering-*` |
| Repeated scans, chained array passes, membership checks, cacheable pure work | `js-*` |
| Stable callbacks, app-wide init, effect event dependency law | `advanced-*` |

Use the Vercel rule name in `Vercel rules used:`. Do not copy its explanation unless the plan needs a specific quote-level constraint.

## Extra Rules Owned Here

Load only the relevant rule files. These are the unique performance-lane questions.

| Rule | Use when |
| --- | --- |
| [cohort-segmentation](./rules/cohort-segmentation.md) | A plan says "large document", "big list", "stress case", or "performance mode" without normal/large/stress/pathological cohorts. |
| [repeated-unit-budget](./rules/repeated-unit-budget.md) | Blocks, lines, rows, leaves, groups, decorations, or islands repeat at scale. |
| [rare-state-isolation](./rules/rare-state-isolation.md) | Rare UI state is carried by every repeated unit. |
| [event-delegation-budget](./rules/event-delegation-budget.md) | Thousands of repeated units attach pointer, hover, keyboard, drag, resize, selection, or scroll handlers. |
| [effect-subscription-budget](./rules/effect-subscription-budget.md) | Repeated units run effects, subscribe to runtime stores, or resubscribe from unstable callbacks. |
| [css-layout-hotpath](./rules/css-layout-hotpath.md) | Selectors, layout reads/writes, drag/resize, overlays, or geometry may cause interaction latency. |
| [interaction-inp-matrix](./rules/interaction-inp-matrix.md) | A plan claims responsiveness from averages, startup time, or one smoke benchmark. |
| [memory-dom-tagging](./rules/memory-dom-tagging.md) | A mode may improve latency by increasing heap, DOM nodes, components, listeners, subscriptions, caches, or mounted groups. |
| [degradation-contract](./rules/degradation-contract.md) | Performance requires virtualization, shell islands, model-backed selection, staged mounting, or any less-native mode. |
| [staged-readiness](./rules/staged-readiness.md) | Startup, hydration, full-doc replace, insert-fragment, or staged DOM-present mounting is part of the plan. |
| [react-19-runtime-proof](./rules/react-19-runtime-proof.md) | React 19.2 primitives are proposed for editor/app performance. |
| [browser-trace-cwv-proof](./rules/browser-trace-cwv-proof.md) | Claims involve load, hydration, network chains, layout shifts, long tasks, LCP/FCP/TBT/CLS, or trace evidence. |
| [production-rum-dashboard](./rules/production-rum-dashboard.md) | The claim matters beyond local benchmarks and needs release/browser/mobile/IME/document-size tags. |
| [editor-native-behavior-proof](./rules/editor-native-behavior-proof.md) | Editor performance changes DOM presence, selection mapping, materialization, shells, hidden content, or model-backed behavior. |

## Plate Example: Huge Document 10k

Use this shape for a large-document Plate review:

```md
### Performance

- applicability: applied
- Vercel rules used: rerender-derived-state, rerender-defer-reads, js-set-map-lookups
- extra rules used: cohort-segmentation, repeated-unit-budget, interaction-inp-matrix, memory-dom-tagging, editor-native-behavior-proof
- repeated unit: block
- cohorts: normal 100 blocks; large 1,000 blocks; stress 10,000 blocks; pathological 50,000 nested/mixed blocks
- budgets: per block <= 1 element component, 0 per-block global listeners, 0 per-block effects unless scoped by id/range, O(1) id/path lookup for hot interactions
- React/runtime primitives: fast render path and derived subscriptions; transitions only for non-urgent side panels, not editor typing
- interaction metrics: startup, first type, middle type, range select, paste, undo, table range select by p50/p75/p95/p99
- trace/CWV proof: Browser trace for load/hydration if route claim is included; editor interaction trace for typing/select/paste latency
- memory tags: heap, DOM nodes, mounted block count, listener count, subscription count, node-id/cache size
- degradation contract: native DOM-present editing for normal/large; any staged or virtualized mode must list browser find/copy/paste/select-all/IME/undo/collab behavior
- dashboard/RUM gap: tag interaction name, cohort, document size, mode, browser, mobile, IME, release, heap/DOM sample when available
- plan delta: add missing rows before claiming the 10k path is ready
```

That is enough to review a huge-document claim without rereading the entire performance rule set.

## Slate Plan Performance Pass

When used inside `slate-plan`, record this lens in the implementation review matrix.

Must answer:

- Which Vercel rules cover the micro-tactics?
- Which extra rule files from this skill apply?
- What is the repeated unit and current/target budget?
- Which cohorts are normal, large, stress, and pathological?
- Which interaction-level INP rows or lab proxies prove responsiveness?
- Which memory tags prove heap/DOM/component/listener/subscription counts stay bounded?
- Which degradation mode applies only to which cohort?
- Which native browser behaviors are preserved or intentionally degraded?
- Which React 19.2 primitive applies, and what does it explicitly not solve?
- Which Chrome trace or Core Web Vitals proof is relevant, and which load metrics are out of scope?
- What Datadog/RUM view would catch the regression?

## No-Change Defense

If the performance pass changes nothing, write:

```md
### Performance

- applicability: skipped
- reason:
- evidence:
- residual risk:
```

The reason must cite current plan evidence. "No obvious perf issue" is not evidence.
