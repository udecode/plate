# Benchmark Methodology

Load this reference whenever the `benchmark` skill runs.

## Outcome

Benchmark should find the first real cause as fast as possible without losing
comprehensive coverage:

```txt
all applicable lanes inventoried
-> cheap product symptom proof
-> layer attribution
-> owner isolation and causal intervention
-> pause breadth
-> select the best durable target and implementation owner
-> fix and exact rerun
-> resume first pending lane
-> repeat until every applicable lane closes
```

The ordered inventory is stable. Commands and target IDs are discovered from
current source each run.

Record `## Interaction Coverage` before closure: `first-interaction`,
`settled-interaction`, `route-scope`, and `reporter-profile`, each with
`pass: <proof>` or `N/A: <concrete reason>`. Preserve the live reporter tab before
reload, warmup, or viewport changes. Page-scrolling proof includes the outer
page and embedded scrollers at first exposure and after settlement. Keep
extension/profile evidence with the real reporter host; a clean-browser result
cannot replace it. A reporter contradiction reopens coverage through `verify`'s failed claimed fix recovery.

Resolve every lane's applicability before executing the first lane. Workflow
status advances as one ordered prefix: completed rows, at most one active row,
then pending rows. A named later-lane symptom is exercised inside lane 2's
product smoke; it does not authorize skipping the ordered attribution lanes.

## Embedded Architecture Probe

When `best-api`, `plate-architecture`, a plan,
`plate-plugins` or the Refactoring playbook needs scale
evidence before accepting a target, run the smallest decisive subset of this
methodology inside that owner's active plan. This is a design falsification
probe, not a comprehensive Benchmark completion claim.

The probe contract is:

1. name the user operation, current/proposed owners, repeated units, and
   independent size, fan-out, concurrency, or subscription variables;
2. select normal, large, stress, and pathological cohorts where each is
   meaningful;
3. freeze the budget and materiality/noise rule before target measurement;
4. identify the current baseline and proposed executable path; if the latter
   does not exist, use a disposable prototype containing only the disputed
   cost/ownership law;
5. keep source identity, fixture, action, build, browser/runtime, machine, and
   sampling comparable;
6. record deterministic work indicators before timing: visited units,
   iterations, renders, wakes, listeners, queries, bytes, or another direct
   cost counter owned by the path;
7. run the selected correctness/native guard against both compared paths;
8. return `pass`, `fail`, or `inconclusive`; only `pass` may unlock target
   acceptance, while `inconclusive` names the next isolating probe.

After implementation, rerun the same cohort and budget contract on the final
production source. The architecture probe does not replace the default ordered
inventory when the user asked for a performance diagnosis, regression search,
or broad Benchmark completion.

## Default Lane Order

Every Benchmark plan contains these rows in this order. A scoped or explicit
`only` run keeps the complete table and gives every excluded row an N/A reason.
The literal `N/A: only - <reason>` form is valid only when the recorded
invocation is `$benchmark only <lane-or-target>`.
Use `N/A: inapplicable - <reason>` only when the lane genuinely cannot apply;
a normal scope never turns relevant lanes into exclusions.

| Order | Lane | Question | Cheapest authoritative proof | Exit |
| --- | --- | --- | --- | --- |
| 1 | `source-and-host-readiness` | Are candidate, baselines, builds, routes, fixtures, and artifacts current and identifiable? | exact refs/fingerprints, build/host freshness, target/runner discovery, correctness smoke | identities and commands are trustworthy |
| 2 | `current-vs-main-product-smoke` | Does the user-facing Plate surface regress against `origin/main`? | matched normal document, isolated source-built production-mode hosts, mount plus trusted typing smoke | regression confirmed, rejected, or scoped |
| 3 | `plate-vs-plite-decomposition` | Is the delta in Plite, Plate core, element IDs, plugins, or product composition? | same-source matched fixture across Plite, Plate core, and smallest relevant plugin sets | owning layer narrowed |
| 4 | `owner-microbench-and-trace` | Which repeated unit or operation causes the delta? | existing owner microbench; focused trace/profiler only when it changes the owner decision; causal bypass/toggle/revert | owner and causal intervention proven or next isolating probe named |
| 5 | `product-mount-matrix` | Do real normal product routes mount within budget? | navigation-to-interactive and React mount distribution on representative routes | mount breadth recorded |
| 6 | `trusted-editing-matrix` | Are real edits responsive after mount? | trusted keydown/beforeinput to model commit, DOM ready, paint; selection-then-type, paste, undo as relevant | editing breadth recorded with correctness |
| 7 | `plite-vs-pinned-slate` | How does the raw substrate compare with upstream Slate? | matched semantic workload against an exact local Slate commit | substrate comparison recorded or honestly N/A |
| 8 | `example-breadth` | Do feature-heavy examples expose a localized regression missed by minimal fixtures? | representative example families ordered by changed owner and user reach | relevant example families closed |
| 9 | `large-and-stress` | Does cost scale safely beyond normal documents? | large, stress, then pathological cohorts; huge document last unless it is the named symptom | scaling/degradation contract recorded |

If a named issue is already known to live in a later lane, lane 2 uses that
surface for the initial smoke. The table order still governs attribution and
resume state.

Reporter-visible rerender and render-storm claims require an exact-route,
phase-specific repeated-component inventory before owner isolation. Count
render or commit work by component family and repeated visible unit before and
during the named action. A wrapper-local Profiler, one improved component, or
pointer latency is a proxy for that local owner, not route-wide completion.
Account for every family above 5% of added work and at least 90% overall.
Anything unattributed remains an open benchmark row.

## Candidate And Baseline Identity

Record before measuring:

- candidate ref; for dirty source, base ref plus fingerprints for every
  measured runtime, fixture, harness, and host-input file;
- `origin/main` ref for Plate product comparison;
- current Plite source identity for Plate/Plite decomposition;
- exact Slate commit and remote for Plite/Slate comparison;
- lockfile/package-manager identity, production or development build mode,
  browser/version, machine, viewport, DPR, and relevant flags;
- route, fixture, document shape, plugin set, rendering component and options,
  setup, and action.
- target-specific materiality and noise rule. Reuse an existing budget when it
  is honest; otherwise predeclare both an absolute and relative delta against
  observed baseline variability before reading the candidate result.

Paths are not identities. A report that says only `currentRepo` or
`legacyRepo` is provenance-incomplete.

Goal completion requires the final candidate/baseline identities, complete
comparison signature, and artifact paths to still match the measured packets.

Use any `*_SKIP_BUILD=1` benchmark flag only after a successful fresh build
from the exact measured runtime source. If runtime, example, package export,
fixture, or browser-handle code changed, rerun once without skip-build before
trusting the artifact.

A benchmark page that reads the browser handle calls `installBrowserHandle()`
before its first mount, which also keeps the kernel trace. Report that
trace-retaining result apart from a DOM-only production control such as
`pnpm --filter www perf:editor` against a build without the handle.

## Two Comparison Classes

### Product comparison

Run actual Plate routes on candidate and main. Preserve each ref's real product
composition when the question is user experience. Use the same persisted or
injected document and action where possible. Differences in plugin membership
are product cost and must be reported, not silently normalized away.

### Engine comparison

Use a matched fixture and behavior contract across Plate, Plite, and Slate to
attribute runtime cost. Match document, renderer intent, rendering component and options,
selection, action, warmup, and sample collection. Engine comparison cannot
replace product comparison.

## Primary Metrics

Prioritize the visible operations the user named.

Mount rows:

- navigation or construction start to `interactiveReady`;
- React mount/commit duration as a separate diagnostic;
- complete-DOM readiness for complete components; mounted-window readiness and
  native-surface scope for components that explicitly omit DOM;
- cold and warm distributions kept separate.

Editing rows:

- trusted `keydown` / `beforeinput` to model commit;
- trusted input to DOM ready;
- trusted input to next paint;
- burst duration and per-operation p50/p75/p95/p99;
- selection-then-type, paste, undo/redo, and follow-up typing when relevant.

Programmatic `insertText`, transforms, or transaction timing are owner probes.
They do not prove real keyboard latency.

Start an input clock from a `beforeinput` listener on `window` in the capture
phase, because an editor handler that stops immediate propagation silences
element listeners. A sample without that start is invalid; never fall back to
a later timestamp.

Report sample count, warmup count, raw artifact path, p50, p75, p95, p99 when
sample size supports it, max, absolute delta, relative delta, and measured
noise. Do not print p99 theater from ten samples; aggregate enough interleaved
packets or omit p99 with reason.

## Fast Sampling

Use adaptive evidence, not a ceremonial fixed count.

- Interleave candidate and baseline to limit thermal/order drift.
- A large stable delta plus causal intervention may become conclusive quickly.
- A result near budget or inside noise needs more samples and repeat packets.
- Native input, focus, selection, compositor, or flaky rows use retry-free
  stability; default to five packets when those risks can change the verdict.
- Stop collecting once the cause gate is decisive. More samples do not repair
  a wrong fixture, stale host, or unfair baseline.

## Red, Inconclusive, And Conclusive

`red` means a material regression or failed budget exists. It does not name
the cause.

`inconclusive` means the signal, baseline, or owner is not yet strong enough.
Run the next cheapest isolating lane or repair the harness.

`conclusive` requires all seven facts:

1. exact symptom and stable material delta;
2. comparable candidate/baseline identities and workload;
3. isolated owner boundary;
4. causal intervention with predicted metric movement;
5. correctness/native guard still valid, recorded as `pass: <evidence>` before
   the cause is called proven;
6. exact fix owner and benchmark/correctness rerun commands;
7. fix class, best long-term target, decision owner, layer plan, and explicit
   hard-cut or hard-law preservation verdict.

Examples of causal intervention:

- bypassing one wrapper removes the mount delta;
- disabling one plugin family removes the editing delta and re-enabling it
  restores the delta;
- reverting one owner change restores baseline while unrelated code stays
  fixed;
- replacing an O(n) lookup with an indexed control changes scaling exactly as
  the owner microbench predicts.

A flame chart, broad diff, correlation, or one suspicious function is not a
causal intervention.

## Run Lifecycle

The Perf issue playbook (`.agents/playbooks/perf-issue.md`) owns what happens
once a cause is conclusive: the iteration protocol, fix ownership, the exact
reruns, resume and completion.

## Artifact Contract

Each measured packet records:

- stable cause ID when the packet proves, fixes, invalidates, or closes a cause;
- lane and target/route;
- candidate and baseline identities;
- fixture/action/build/browser/machine signature;
- benchmark and correctness commands;
- the original red benchmark and correctness command identities, preserved
  exactly in terminal Cause History;
- warmups, samples, packet count, and artifact path;
- baseline/candidate distributions and absolute/relative delta;
- correctness/native result;
- result: green, red, inconclusive, or conclusive;
- cause evidence or next isolating probe;
- fix class, long-term target, decision owner, layer plan, compatibility
  verdict, and implementation owner for a conclusive cause;
- keep, revert, invalidate, quarantine, or defer decision.

Keep this compact in the active Benchmark plan and durable benchmark artifact.
Do not create another target registry or permanent benchmark ledger.
