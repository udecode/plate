# Benchmark performance review

Use this when a Plate plan claims speed, responsiveness, large-document readiness, or production performance. This skill owns the review shape around cohorts, repeated-unit budgets, p95/p99 interactions, memory/DOM tags, degradation contracts, native editor behavior, trace proof, and RUM gaps. It delegates React/Next micro-tactics, effect law, and complexity analysis to the skills that already own them.

This is a review lens only. It does not discover or order benchmark lanes,
compare refs or editors, execute targets, diagnose a timing cause, optimize
runtime code, or run fix/rerun loops. Route those jobs to `benchmark`, which
reads only the matching rows of this lens.

## Owner Map

| Source | Owns | Use in this pass |
| --- | --- | --- |
| `vercel-react-best-practices` | React/Next waterfalls, bundles, effects, subscriptions, rerenders, rendering, JS micro-opts, React runtime primitives | Load exact rule files for local micro-tactics. For Plate component shape and public ownership, route to `plate-ui`; do not paste the whole Vercel catalog into the plan. |
| Chrome DevTools, Lighthouse, web.dev docs | Browser traces, Core Web Vitals, network chains, layout shifts, long tasks | Use when load, hydration, layout, or input latency needs browser proof. |
| `benchmark review` | Big-O, cache shape, memory pressure, 10x/100x/1000x projections, cohorts, repeated-unit budgets, p95/p99 interactions, memory tags, degradation, native behavior proof, RUM/dashboard gaps | Record the final performance-lane verdict. |
| `benchmark` | ordered lane discovery, baseline/editor comparison, measurement, causal diagnosis, fix/rerun/resume, and benchmark artifacts | Route execution there; do not copy its loop here. |

Rule: if the plan only says "use React best practices", "avoid O(n)", or "seems fast locally", it is not done.

## Required Output

Record this in the active plan or review:

```md
### Performance

- applicability: applied | skipped
- Vercel rules used:
- questions answered:
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
2. Name the repeated unit: block, row, cell, leaf, decoration, overlay, listener, or subscription.
3. Set current and target budgets for DOM nodes, components, handlers, effects, subscriptions, allocations, layout reads/writes, and memory per repeated unit.
4. Simplify the normal path before adding special modes.
5. Move rare state out of the repeated unit: comments, menus, hover chrome, selection tools, debug panels, context actions.
6. Add O(1) indexes or cached lookups only where the hot path proves repeated scans.
7. Choose the native-behavior contract for each rendering component: complete DOM, the explicit virtualized component with its stated native-behavior limits, or model-backed hidden content behind a DOM coverage boundary.
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
| Trace or field proof | Production-facing claims need browser evidence and field tags, or one line marking the claim lab-only as a proof gap. |
| Churn-class rows | Correctness contracts are not perf ownership. Each churn class the claim covers, such as overlay source toggles, hidden-pane resume and annotation-backed widget rebasing, needs its own measured row, added to an existing lane before a new family. |

If a blocker does not apply, say why in one line. Silence is not a pass.

An invalidation claim reports recompute selectivity (which sources recompute for a change) and subscriber fan-out (which subscribers wake after one source recomputes) as separate rows; a green row for one never closes the other.

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

## Performance Questions

Answer each question the claim touches. A question that does not apply gets one line saying why.

| Question | Use when | Required answer |
| --- | --- | --- |
| Cohorts | A plan says "large document", "big list", "stress case" or "performance mode" without cohorts. | Segment by size and complexity before choosing tactics. Every perf claim names the cohort it covers; no "fast for large docs" without a size and a complexity tag: custom leaf, text or element renderer; decorations per block; annotations or comments per block; hidden boundary count and depth; inline voids, voids and tables; collaboration activity; selection span length; mobile, IME and browser. |
| Repeated unit | Blocks, lines, rows, leaves, groups or decorations repeat at scale. | Fill the repeated-unit budget below. Delegate repeated handlers to a stable parent with `data-*` hit identity when that avoids per-unit closures, track handler count per unit, total active handlers at the target cohort, hot handler allocations per render and drag or resize event frequency, and treat 20+ handlers per repeated unit as a fire. Repeated units run no effects unless they synchronize with an external system, and runtime subscriptions are selector-based and scoped by id or range, never hand-rolled where `useSyncExternalStore` or a local selector hook exists; a changing React context dependency such as Plate's `usePath()` counts too. |
| Style and layout | Selectors, layout reads or writes, drag, resize, overlays, selection geometry or scroll may cause interaction latency on any hot editor surface, repeated or not. | Hot editor surfaces avoid expensive selectors and forced layout loops. Check for broad descendant selectors in repeated units, `:has(...)` on hot surfaces, layout reads mixed with writes, scroll or selection geometry reads during typing, drag or resize state updated through React renders, and overlays moved by layout-changing properties instead of transforms. |
| Rare state | Comments, menus, hover chrome, debug panels, selection tools or context actions are carried by every repeated unit. | Rare state isolation below. |
| Interaction latency | A plan claims responsiveness from averages, startup time or one smoke benchmark. | p50/p75/p95/p99 by interaction, cohort and mode for each interaction the claim touches: type, select, select then type, select-all, copy, paste, drag selection, scroll to a far group, click a far group then type, open a menu, expand or collapse a boundary, materialize hidden content, remote update. Without real INP, record event-to-update and event-to-paint under the same interaction names. Reject average-only tables, startup-only wins, and virtualized wins without copy, paste and selection follow-up rows. |
| Memory and DOM | A mode may cut latency by growing heap, DOM nodes, components, listeners, subscriptions, caches or mounted groups. | Memory and DOM tags below. |
| Readiness | Startup, hydration, hidden or detached roots, full-document replacement or explicit DOM omission is part of the plan. | Initial render readiness below. |
| Native behavior | Performance changes DOM presence, selection mapping, hidden content or any less-native surface. | Follow `docs/vision/plite.md`'s Plite Perf And Degraded Modes and optimize the complete-DOM path first. For each mode, state whether browser find, screen-reader traversal, native selection, copy, paste, select-all, IME and composition, mobile touch selection, undo and history, collaboration and remote updates, and follow-up typing after repair or materialization are native, model-backed, materialize-first, intentionally unsupported or explicit opt-in only; name the complete-DOM alternative, and take an accessibility snapshot when native behavior is in scope. |
| Page load | Load, hydration, network chains, layout shifts or long tasks are in the claim. | Keep page-load metrics (TTFB, FCP, LCP, TBT, CLS, Speed Index) apart from editor interaction metrics, and prove them with a browser trace: LCP breakdown, render-blocking resources, network dependency chains, layout-shift culprits and long tasks. A trace finding with zero estimated impact never outranks a failing editor interaction lane; read current web.dev or Chrome docs when exact thresholds matter. |
| Production | The claim matters outside the lab. | Field data tagged by interaction, cohort, document size, mode, browser, mobile, IME and release, or one line marking the claim lab-only as a proof gap. |

### Repeated-unit budget

Budget the hot repeated unit before optimizing globally. Track:

| Budget | Ask |
| --- | --- |
| DOM nodes per unit | How many nodes before decorations/overlays? |
| React components per unit | How many instances in the common case? |
| event handlers per unit | Are handlers delegated or attached per unit? |
| effects per unit | Are effects banned from wrappers and repeated rows? |
| subscriptions per unit | Does each unit subscribe narrowly by node key/range? |
| selectors per unit | Are selectors O(1), stable, and dirtiness-aware? |
| allocations per interaction | Does typing/select/copy allocate proportional to document size? |
| style/layout cost | Any forced reflow, layout read, or heavy selector? |
| React scheduler/effect cost | Does this unit render, mount effects, or block urgent work? |

Tiny removals compound. Removing two DOM nodes per unit is 20k fewer nodes at 10k units.

### Rare state isolation

The primary repeated unit should render primary content only. Rare UI state mounts only when active. Check:

- comments are indexed by location and rendered only where present
- menus/context panels mount on demand
- hover/focus tools do not add heavy props to every unit
- debug panels are outside hot unit props
- "has something here" booleans are split from heavy payload reads

Reject:

- one generic unit component carrying all product state
- repeated unit props containing comment payloads, menu state, hover state, and debug state for every row/block

### Initial render readiness

Define readiness from the component's public DOM contract. A complete component is ready only when every intended block is mounted. A component that explicitly omits DOM is ready when its deterministic initial window and every selected or requested target are mounted.

- server and first-client markup use the same initial-window rule;
- hidden, zero-size and detached roots do not produce an empty or unbounded fallback;
- the first input target is mounted before editing;
- deep selection and navigation targets remain reachable;
- ready timing, mounted block count and stale DOM count are recorded;
- the result names its native surface as complete or mounted-window only.

Do not report a virtualized surface as eventually complete. Its omitted DOM is the public behavior, not pending background work.

### Memory and DOM tags

Timing without memory and DOM tags is incomplete for repeated editor surfaces. Tag:

- JS heap
- DOM node count
- React component count proxy
- mounted group/island count
- event listener count
- cached range/index sizes
- dirty id set sizes
- hidden boundary count
- decoration/comment/annotation count
- custom renderer flags
- root-level external subscription count

For every large/stress benchmark, record both latency and memory/DOM pressure. Do not accept a mode that improves timings by quietly exploding memory.

## Plate Example: Huge Document 10k

Use this shape for a large-document Plate review:

```md
### Performance

- applicability: applied
- Vercel rules used: rerender-derived-state, rerender-defer-reads, js-set-map-lookups
- questions answered: cohorts, repeated unit, interaction latency, memory and DOM, native behavior
- repeated unit: block
- cohorts: normal 100 blocks; large 1,000 blocks; stress 10,000 blocks; pathological 50,000 nested/mixed blocks
- budgets: per block <= 1 element component, 0 per-block global listeners, 0 per-block effects unless scoped by id/range, 0 reactive path/context dependencies for event-only work, O(1) id/path lookup for hot interactions
- React/runtime primitives: fast render path and derived subscriptions; transitions only for non-urgent side panels, not editor typing
- interaction metrics: startup, first type, middle type, range select, paste, undo, table range select by p50/p75/p95/p99
- trace/CWV proof: Browser trace for load/hydration if route claim is included; editor interaction trace for typing/select/paste latency
- memory tags: heap, DOM nodes, mounted block count, listener count, subscription count, node-id/cache size
- degradation contract: complete DOM for the ordinary component; the explicit virtualized component lists browser find/copy/paste/select-all/IME/undo/collaboration behavior and the cohorts that justify omission
- dashboard/RUM gap: tag interaction name, cohort, document size, mode, browser, mobile, IME, release, heap/DOM sample when available
- plan delta: add missing rows before claiming the 10k path is ready
```

That is enough to review a huge-document claim without rereading every performance question.

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
