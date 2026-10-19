# Benchmark Methodology

Load this reference whenever the `benchmark` skill runs.

Record `## Interaction Coverage` before closure: `first-interaction`,
`settled-interaction`, `route-scope`, and `reporter-profile`, each with
`pass: <proof>` or `N/A: <concrete reason>`. Preserve the live reporter tab before
reload, warmup, or viewport changes. Page-scrolling proof includes the outer
page and embedded scrollers at first exposure and after settlement. Keep
extension/profile evidence with the real reporter host; a clean-browser result
cannot replace it. A reporter contradiction reopens coverage through the Bug fix playbook's failed-fix recovery.

## Default Lane Order

Every Benchmark plan contains these rows in this order. A scoped or explicit
`only` run keeps the complete table and gives every excluded row an N/A reason.
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
  setup, and action;
- the host's core count, and its load average beside each measured run;
- target-specific materiality and noise rule. Reuse an existing budget when it
  is honest; otherwise predeclare both an absolute and relative delta against
  observed baseline variability before reading the candidate result.

On a loaded shared host, every timing line is inconclusive whether it passes
or misses. Such a result never rewrites a tracked receipt or accepts a
target, and a speed claim from it narrows to what a deterministic work count
proves. In Chromium, count per-keystroke work through CDP
`Performance.getMetrics`: `LayoutCount`, `RecalcStyleCount` and
`TaskDuration`. Frame latency through `requestAnimationFrame` moves in steps of
about 16.7 ms, so it cannot resolve work smaller than a frame.

Paths are not identities. A report that says only `currentRepo` or
`legacyRepo` is provenance-incomplete.

Use any `*_SKIP_BUILD=1` benchmark flag only after a successful fresh build
from the exact measured runtime source. If runtime, example, package export,
fixture, or browser-handle code changed, rerun once without skip-build before
trusting the artifact.

A benchmark page that reads the browser handle calls `installBrowserHandle()`
before its first mount, which also keeps the kernel trace. Report that
trace-retaining result apart from a DOM-only production control such as
`pnpm --filter www perf:editor` against a build without the handle.

A timed Playwright lane runs in its own page, and the runner closes that page when the lane finishes or times out: `Promise.race` does not cancel `page.evaluate`, so a timed-out lane left running contaminates the next one. Size each lane's sample count and timeout from one timed sample of that lane, so a heavy lane runs fewer honest samples instead of several that time out. Register a render waiter before firing the state change it waits for. Rows from a live artifact and a frozen snapshot stay separate unless their row ids name the same contract or a declared mapping normalizes them first.

## Two Comparison Classes

### Product comparison

Run actual Plate routes on candidate and main. Preserve each ref's real product
composition when the question is user experience. Use the same persisted or
injected document and action where possible. Differences in plugin membership
are product cost and must be reported, not silently normalized away. A page that mounts several heavy editors is a contaminated timing surface: read per-engine numbers only from a one-engine mode or a dedicated benchmark route.

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

Start an input clock from a `beforeinput` listener on `window` in the capture
phase, because an editor handler that stops immediate propagation silences
element listeners. A sample without that start is invalid; never fall back to
a later timestamp.

Report sample count, warmup count, raw artifact path, p50, p75, p95, p99 when
sample size supports it, max, absolute delta, relative delta, and measured
noise. Do not print p99 theater from ten samples; aggregate enough interleaved
packets or omit p99 with reason.

- Before fixing a packet count, time one sample per cohort per side, then size
  the protocol from that wall time and the measured noise.
- Native input, focus, selection, compositor, or flaky rows use retry-free
  stability; default to five packets when those risks can change the verdict.
- Stop collecting once the cause gate is decisive. More samples do not repair
  a wrong fixture, stale host, or unfair baseline.

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
- the limiter that bounds the result, the error count and a count of the work
  done, as `benchmark-checklist` questions 1, 4 and 7 ask;
- correctness/native result;
- result: green, red, inconclusive, or conclusive;
- cause evidence or next isolating probe;
- fix class, long-term target, decision owner, layer plan, compatibility
  verdict, and implementation owner for a conclusive cause;
- keep, revert, invalidate, quarantine, or defer decision.
