---
status: done
owner: plite-tanstack-virtual-ios-perf-ralplan
source_repo: Plate repo root
created: 2026-05-23
---

# Plite TanStack Virtual iOS/perf refresh ralplan

## Current Verdict

Upgrade TanStack Virtual. Do not change Plite's public API.

The 2026-05-19 TanStack Virtual release is not "just inner" for Plite because
our virtualized mode currently bypasses TanStack for one layout-backed scroll
branch. The right plan is:

1. bump `Plate repo root` from `@tanstack/react-virtual@3.13.24` /
   `@tanstack/virtual-core@3.14.0` to `@tanstack/react-virtual@3.13.25` /
   `@tanstack/virtual-core@3.15.0`;
2. keep `domStrategy={{ type: 'virtualized', threshold, overscan,
   estimatedBlockSize }}` as the public Plite-shaped API;
3. keep TanStack raw options private;
4. route internal layout-backed `scrollToTopLevelIndex` through TanStack's
   `scrollToOffset` / `scrollToIndex` path where practical instead of direct
   `rootElement.scrollTo`;
5. do not override `shouldAdjustScrollPositionOnItemSizeChange`;
6. do not expose `takeSnapshot()` publicly yet.

Blunt take: the public usage is already mostly right. The internal scroll
bypass is the only thing I would change now.

Current score after pass 3: `0.92`.
Target score: `>= 0.92`, with no dimension below `0.85`.

This lane is done and ready for Ralph execution.

## Intent

Refresh Plite virtualization strategy against the latest TanStack Virtual
performance/iOS work and decide whether Plite usage should change.

## Outcome

Ralph should get a narrow implementation handoff:

- update the TanStack Virtual dependency;
- keep Plite public API unchanged;
- route internal virtualized scroll writes through TanStack where that preserves
  Plite layout offsets;
- add browser/proof rows for backward scroll and iOS/momentum behavior;
- keep virtualized mode experimental.

## Source Grounding

External:

- TanStack blog `https://tanstack.com/blog/tanstack-virtual-perf-and-ios`,
  published 2026-05-19 and read 2026-05-23.
- NPM current metadata read on 2026-05-23:
  `@tanstack/react-virtual@3.13.25` depends on
  `@tanstack/virtual-core@3.15.0`.
- TanStack Virtual latest Virtualizer API docs read on 2026-05-23.

Live `Plate repo root`:

- `packages/plite-react/package.json:18-24` declares
  `@tanstack/react-virtual` as a `plite-react` dependency with range
  `^3.13.24`.
- `bun.lock:563-565` resolves `@tanstack/react-virtual@3.13.24` and
  `@tanstack/virtual-core@3.14.0`, so the latest core perf/iOS fixes are not
  installed.
- `packages/plite-react/src/dom-strategy/use-virtualized-root-plan.ts:95-115`
  retains selected/promoted indexes through a custom `rangeExtractor`.
- `packages/plite-react/src/dom-strategy/use-virtualized-root-plan.ts:242-268`
  uses `estimateSize`, runtime-id `getItemKey`, `getScrollElement`,
  `initialRect`, `overscan`, and `rangeExtractor`.
- `packages/plite-react/src/dom-strategy/use-virtualized-root-plan.ts:345-367`
  directly calls `rootElement.scrollTo(...)` for layout-backed targets before
  falling back to `virtualizer.scrollToIndex(...)`.
- `docs/libraries/slate-react/experimental-virtualized-rendering.md:20-44`
  keeps TanStack Virtual internal and does not expose raw virtualizer options.
- `docs/libraries/slate-react/experimental-virtualized-rendering.md:46-61`
  explicitly labels native find, screen-reader, IME, and mobile limitations.

## Decision Brief

Principles:

1. TanStack owns viewport math, not editor semantics.
2. Plite owns DOM coverage, materialization, selection, copy/paste, IME, mobile,
   browser-find, a11y, and metrics.
3. The default editor path stays native/DOM-present.
4. `virtualized` stays explicit and experimental.
5. Public Plite API stays editor-shaped, not TanStack-shaped.

Top drivers:

- latest upstream iOS and backward-scroll fixes;
- extreme document performance;
- native contenteditable behavior under missing DOM;
- public API cleanliness.

| Option | Verdict | Reason |
| --- | --- | --- |
| Treat the release as purely internal and only bump the lockfile | revise | Most gains are internal, but Plite currently bypasses TanStack for one programmatic scroll branch. |
| Expose latest TanStack options on `Editable` | reject | Leaks a list virtualizer into Plite API and pushes missing-DOM policy onto users. |
| Keep current Plite API and route internal scroll writes through TanStack | choose | Gets upstream iOS/backward-scroll behavior without changing userland API. |
| Add public snapshot/cache API now | reject | `takeSnapshot()` is useful upstream, but Plite needs a proven remount-jump problem before public API. |
| Make virtualized mode default after the perf release | reject | Missing DOM still degrades native find, a11y, IME/mobile, and broad selection behavior. |

## TanStack Update Implications

| Upstream change | Plite implication | Verdict |
| --- | --- | --- |
| Typed-array single-lane hot path | Keep Plite top-level block virtualization single-lane; do not add `lanes`. | keep |
| Lazy `VirtualItem` materialization | Current `getVirtualItems()` use benefits after upgrade. | inner |
| Resize storm/cache-version fix | Dynamic block measurement benefits after upgrade. | inner |
| iOS momentum/elastic scroll write deferral | Avoid direct scroll writes in virtualized adapter where TanStack can own the write. | change internal |
| Backward-scroll adjustment default | Do not override `shouldAdjustScrollPositionOnItemSizeChange` unless a measured editor-specific regression appears. | keep upstream default |
| `takeSnapshot()` restoration | Consider internal cache only if root/remount route proves jumpy. | defer |

## Public API Target

Keep:

```tsx
<Editable
  domStrategy={{
    estimatedBlockSize: 32,
    overscan: 4,
    threshold: 25_000,
    type: 'virtualized',
  }}
  style={{ height: 480, overflowY: 'auto' }}
/>
```

Do not expose:

- `getScrollElement`
- `measureElement`
- `rangeExtractor`
- `shouldAdjustScrollPositionOnItemSizeChange`
- `takeSnapshot`
- `initialMeasurementsCache`
- `lanes`
- raw TanStack `Virtualizer` instance

## Internal Runtime Target

Ralph implementation target:

- run the package manager update in `Plate repo root` so `bun.lock` resolves
  `@tanstack/react-virtual@3.13.25` and `@tanstack/virtual-core@3.15.0`;
- change layout-backed `scrollToTopLevelIndex` to call
  `virtualizer.scrollToOffset(Math.max(0, top))` or an equivalent TanStack-owned
  scroll path when it preserves Plite layout offsets;
- keep the fallback `virtualizer.scrollToIndex(index, { align })`;
- memoize `getItemKey` / `getScrollElement` if the new package makes option
  identity churn visible in tests or profiles;
- keep selected/promoted index retention as Plite-owned `rangeExtractor` logic;
- do not add custom `shouldAdjustScrollPositionOnItemSizeChange` by default;
- keep `takeSnapshot()` private and unshipped unless a remount restoration test
  proves the need.

## Performance Lens

- applicability: applied
- Vercel rules used: event/listener and subscription minimalism by existing
  Plite virtualized adapter shape
- extra rules used: repeated-unit budget, degradation contract,
  editor-native-behavior proof
- repeated unit: top-level Plite runtime block
- cohorts: normal DOM-present, large staged, pathological virtualized
- budget: virtualized mode must reduce mounted top-level blocks without global
  selection/copy/paste semantic loss
- React/runtime primitive: TanStack Virtual remains range engine; React is not
  editor semantics
- degradation contract: native find and full screen-reader traversal remain
  limited until mounted
- plan delta: upgrade dependency and remove direct scroll-write bypass

## Regression Proof Required From `Plate repo root`

Focused commands for Ralph:

```bash
bun update @tanstack/react-virtual
bun test ./packages/plite-react/test/dom-strategy-and-scroll.tsx
bun --filter ./packages/plite-react typecheck
PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --workers=1 --grep virtualized
PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/pagination.test.ts --project=chromium --workers=1 --grep virtualized
bun lint:fix
```

Add or preserve proof rows:

- virtualized backward-scroll with dynamic heights does not jump upward;
- layout-backed `scrollToTopLevelIndex` keeps exact Plite layout offsets;
- browser/iOS lane is semantic until real iOS proof exists;
- virtualized mode stays explicit and degraded;
- native find/a11y limits stay documented.

## Issue Accounting

Pass 2 classification:

- New fixed claims: `0`.
- New improved claims: `0`.
- `#790`: related performance/virtualization proof-route backlog only.
- `#5826`, `#5538`, `#4995`, `#5088`, `#5473`: related scroll/focus rows only.
  Upstream iOS momentum scroll deferral supports the internal scroll-routing
  implementation route, but exact Plite repro closure still needs targeted
  proof.
- `#5391`, `#5095`, `#4751`, `#4354`, `#3760`: related/non-claimed mobile rows
  only. TanStack iOS scroll handling is not proof of Plite iOS selection, IME,
  spellcheck, or native toolbar correctness.

Synced artifacts:

- `docs/plite-issues/gitcrawl-v2-sync-ledger.md`: added 2026-05-23 TanStack
  Virtual iOS/perf sync notes and corrected stale virtualized adapter paths.
- `docs/plite/ledgers/issue-coverage-matrix.md`: updated `#790` policy row
  to reference latest TanStack Virtual as internal proof-route work, not a
  closure claim.
- `docs/plite/ledgers/fork-issue-dossier.md`: added a TanStack Virtual
  iOS/perf refresh section with issue classifications and zero new claims.
- `docs/plite/references/pr-description.md`: unchanged; this pass changes
  no public API shape, no exact fixed issue claim, and no release-ready proof
  row. Ralph implementation may update it after package/browser proof.

Pass 3 must run maintainer/high-risk/performance closure pressure before this
can become a Ralph-ready handoff.

## Confidence Scorecard

| Dimension | Weight | Score | Evidence | Reason |
| --- | ---: | ---: | --- | --- |
| React 19.2 runtime performance | 0.20 | 0.90 | Live virtualized adapter, TanStack latest perf/iOS update, npm metadata. | Internal adapter shape is strong; dependency is one patch behind. |
| Plite-close unopinionated DX | 0.20 | 0.92 | Existing docs hide TanStack raw options. | Public API remains editor-shaped. |
| Plate and slate-yjs migration backbone | 0.15 | 0.86 | DOM coverage/degradation boundary remains Plite-owned. | Good backbone, but issue/collab pass still pending. |
| Regression-proof testing strategy | 0.20 | 0.84 | Existing package/browser virtualized rows plus new required backward-scroll/iOS rows. | Below floor until proof rows are added or linked. |
| Research evidence completeness | 0.15 | 0.88 | Research source refreshed with latest TanStack release and live Plite source. | Good enough for pass 1; issue ledger still pending. |
| shadcn-style composability and hook/component minimalism | 0.10 | 0.90 | Public API keeps minimal `domStrategy` options. | No raw virtualizer escape hatch. |

Weighted total after pass 1: `0.88`.

Still pending because regression-proof testing is below `0.85`, issue sync is
not complete, and closure gates have not run.

### Score After Pass 2

Total rises from `0.88` to `0.89`.

| Dimension | Previous | Current | Reason |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.90 | 0.90 | No new implementation proof; dependency/scroll route target unchanged. |
| Plite-close unopinionated DX | 0.92 | 0.92 | Public API remains unchanged and TanStack raw options stay private. |
| Plate and slate-yjs migration backbone | 0.86 | 0.88 | DOM coverage/degradation issue rows are now synced with zero new claims. |
| Regression-proof testing strategy | 0.84 | 0.86 | Issue sync now names exact scroll, mobile, and benchmark proof routes. |
| Research evidence completeness | 0.88 | 0.90 | Durable issue ledgers now reflect the latest TanStack research update. |
| shadcn-style composability and hook/component minimalism | 0.90 | 0.90 | No change. |

Weighted total: `0.89`.

Still pending because the maintainer/high-risk pass and closure gates are open.

## Pass 3 - Maintainer / High-Risk / Performance Closure Pressure

Steelman, high-risk deliberate, and performance pressure pass applied.

### Maintainer Objection Ledger

| Decision | Strongest fair objection | Steelman antithesis | Tradeoff tension | Answer | Verdict |
| --- | --- | --- | --- | --- | --- |
| Upgrade TanStack Virtual to the latest patch release | "Why touch a dependency in an editor rewrite when virtualized mode is experimental?" | Leave dependency alone until virtualized mode is release-ready. | Any dependency bump can introduce scroll or measurement behavior changes. | Plite already ships the dependency in `plite-react`; the latest release fixes the exact class of dynamic-height, backward-scroll, and iOS scroll-write behavior our experimental mode exercises. Keep proof scoped to virtualized rows. | keep |
| Keep Plite public API unchanged | "If TanStack has new knobs like `shouldAdjustScrollPositionOnItemSizeChange` and `takeSnapshot`, shouldn't advanced users get them?" | Expose a `virtualizerOptions` escape hatch and let users own it. | Hiding options may slow edge-case experiments. | Raw virtualizer options make users responsible for missing-DOM editor semantics. Plite should own the policy and expose editor-shaped options only. | keep |
| Route layout-backed scroll through TanStack | "Plite layout offsets are more exact than virtualizer estimates; direct scroll is simpler and deterministic." | Keep the direct `rootElement.scrollTo` branch for layout-backed offsets. | Routing through TanStack adds adapter coupling and must preserve exact layout offsets. | The chosen implementation can still pass the exact offset to `scrollToOffset`. The point is not to give up Plite layout; it is to let TanStack own the scroll write path so iOS momentum deferral applies. | revise internal |
| Do not override backward-scroll adjustment policy | "Editor blocks are dynamic; maybe Plite needs its own scroll correction logic." | Add a Plite-specific `shouldAdjustScrollPositionOnItemSizeChange` callback. | Overriding may fight upstream fixes and create custom behavior to maintain. | Start with upstream default because the release specifically fixes backward-scroll dynamic-height jank. Add override only after a measured Plite regression. | keep |
| Do not expose `takeSnapshot()` publicly | "Snapshot restoration sounds useful for remounting giant editors." | Add public snapshot/cache options now while adopting the release. | Public cache APIs create durability and invalidation promises. | Keep it internal until we prove a root remount/restoration jump. No user-facing API without a failing test. | keep |

### High-Risk Trigger

This pass touches a browser-sensitive runtime dependency and virtualized scroll
behavior. The blast radius is limited to experimental virtualized mode, but the
failure modes are visible: jumpy scroll, wrong target materialization, broken
copy/selection over missing DOM, and false iOS confidence.

### Blast Radius

| Area | Risk | Guardrail |
| --- | --- | --- |
| Dependency | TanStack patch changes measurement or scroll semantics. | Focused package tests plus huge-document and pagination virtualized browser rows. |
| Scroll routing | `scrollToOffset` path may not preserve exact Plite layout offset. | Add/assert layout-backed scroll target keeps expected offset. |
| Dynamic height | Backward scroll may jump with measured block changes. | Add virtualized backward-scroll dynamic-height row. |
| iOS | Upstream iOS scrollTop fix may be mistaken for Plite iOS editing proof. | Keep iOS issue rows related only; require raw iOS/device proof for selection/IME claims. |
| Public API | Users may ask for raw TanStack knobs. | Keep docs explicit: TanStack is internal; Plite owns missing-DOM policy. |
| Accessibility/native behavior | Missing DOM still breaks native find/full screen-reader traversal. | Keep virtualized mode explicit, degraded, and experimental. |

### Three-Scenario Pre-Mortem

1. **Dependency upgrade looks green but scroll jumps in a real editor.**

   Cause: package tests only prove mounted ranges, not dynamic-height backward
   scroll after measurement. Guardrail: browser row for backward scroll with
   measured variable-height blocks.

2. **iOS blog headline creates false confidence.**

   Cause: TanStack fixed scrollTop writes during momentum scroll, not Plite's
   iOS selection handles, IME, spellcheck, or toolbar behavior. Guardrail:
   issue ledger keeps iOS rows related/non-claimed and Ralph proof names iOS
   as semantic until raw-device proof exists.

3. **Plite leaks TanStack API to solve one edge case.**

   Cause: a user asks for `shouldAdjustScrollPositionOnItemSizeChange` or
   `takeSnapshot` directly. Guardrail: keep raw options private; add internal
   targeted behavior only after a failing Plite test proves need.

### Final Proof Matrix For Ralph

| Proof row | Command / owner | Closure meaning |
| --- | --- | --- |
| Dependency resolves latest core | `bun update @tanstack/react-virtual`; inspect `bun.lock` | `@tanstack/react-virtual@3.13.25` and `@tanstack/virtual-core@3.15.0` installed. |
| Package virtualized contracts | `bun test ./packages/plite-react/test/dom-strategy-and-scroll.tsx` | Existing DOM strategy metrics, materialization, and scroll contracts still pass. |
| Type/API surface | `bun --filter ./packages/plite-react typecheck` | No public API leak or type regression. |
| Huge-document virtualized browser row | `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --workers=1 --grep virtualized` | Public example still exposes explicit virtualized mode and metrics. |
| Pagination virtualized browser row | `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/pagination.test.ts --project=chromium --workers=1 --grep virtualized` | Layout-backed virtualized offsets still behave after scroll-routing change. |
| Backward-scroll dynamic-height row | New or existing focused browser/unit row | Dynamic measurement does not jump upward while scrolling backward. |
| iOS semantics | Owner: future raw-device proof | No iOS issue closure until raw-device artifacts exist. |
| Lint | `bun lint:fix` | Formatting and lint cleanup after dependency/code change. |

### Performance Verdict

The best architecture is unchanged:

- normal editors use DOM-present/staged rendering;
- pathological documents may opt into explicit `virtualized`;
- TanStack Virtual owns visible range, measurement, overscan, and scroll writes;
- Plite owns DOM coverage, materialization, model-backed copy/paste, selection,
  IME/mobile policy, browser-find/a11y limits, and RUM metrics.

The only implementation revision is internal: avoid direct scroll writes in the
virtualized adapter when TanStack can perform the same offset write.

### Score After Pass 3

Total rises from `0.89` to `0.92`.

| Dimension | Previous | Current | Reason |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.90 | 0.92 | High-risk proof now ties dependency upgrade, scroll routing, and dynamic-height rows to concrete gates. |
| Plite-close unopinionated DX | 0.92 | 0.94 | Public API stays Plite-shaped and raw TanStack options stay private. |
| Plate and slate-yjs migration backbone | 0.88 | 0.90 | DOM coverage and degraded-mode boundaries remain Plite-owned; no product wrapper or collab claim is added. |
| Regression-proof testing strategy | 0.86 | 0.92 | Proof matrix now names dependency, package, browser, dynamic-height, iOS, and lint gates. |
| Research evidence completeness | 0.90 | 0.92 | Latest TanStack, live Plite source, research note, and issue ledgers are all synced. |
| shadcn-style composability and hook/component minimalism | 0.90 | 0.91 | Minimal editor-shaped config remains the target. |

Weighted total: `0.92`.

The score threshold is met, but completion is still pending. Closure is the only
remaining pass, and it must run separately.

## Pass State

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| 1. Current-state/latest TanStack read | complete | TanStack 2026-05-19 blog, latest npm metadata, current `plite-react` package/lockfile, current virtualized adapter, and current docs read. | Added verdict: upgrade dependency, keep public API, change internal scroll path, defer public snapshot API. | Issue sync, maintainer/high-risk, and closure remain. | Plite Ralplan |
| 2. Issue-ledger and current sync pass | complete | Live open ledger, manual sync ledger, issue coverage matrix, fork issue dossier, clusters, package impact matrix, requirements, and benchmark candidate map read. | Synced `#790` as related proof-route backlog; kept scroll/iOS rows related only; added latest TanStack sync notes; corrected stale virtualized adapter paths. | Need maintainer/high-risk pass and final score. | Plite Ralplan |
| 3. Maintainer/high-risk/performance closure pass | complete | Maintainer objection ledger, high-risk trigger/blast radius, three-scenario pre-mortem, final proof matrix, and performance verdict added. | Kept public API unchanged, kept upgrade/internal scroll-routing target, raised score to threshold, and kept closure separate. | Need closure score/final gates. | Plite Ralplan |
| 4. Closure score and final gates | complete | Pass rows, score threshold, issue sync, PR-reference decision, allowed edit scope, completion state, and continuation state audited. | Marked lane done and added Done Handoff. | None for Plite Ralplan; implementation belongs to Ralph. | Ralph |

## Pass 4 - Closure Score And Final Gates

Closure pass applied.

### Closure Audit

| Gate | Result | Evidence |
| --- | --- | --- |
| Pass schedule | pass | Pass rows 1-3 were complete before this closure pass; pass 4 is now complete. |
| Current pass | pass | `current_pass` is `closure-score-and-final-gates`; `current_pass_status` is complete. |
| Score threshold | pass | Final score is `0.92`, meeting the `>= 0.92` threshold. |
| Dimension floor | pass | Lowest final dimension is `0.90`, above the `0.85` floor. |
| Research sync | pass | TanStack research source and research log were refreshed against 2026-05-23 evidence. |
| Issue sync | pass | `#790`, scroll/focus rows, and iOS/mobile rows were classified with zero new fixed/improved claims. |
| PR-reference decision | pass | PR reference intentionally unchanged because this plan changes no public API shape, no exact fixed claim, and no release-ready proof row before Ralph execution. |
| Maintainer/high-risk pass | pass | Objection ledger, blast radius, pre-mortem, and final proof matrix are complete. |
| Allowed edit scope | pass | This Plite Ralplan edited only planning, research, issue-ledger/reference, and scoped `.tmp` state artifacts. No `Plate repo root` implementation files were edited. |
| Ralph handoff | pass | Implementation scope and `Plate repo root` verification commands are named. |

### Done Handoff

- Public API: keep `domStrategy={{ type: 'virtualized', threshold, overscan,
  estimatedBlockSize }}`.
- Public API: do not expose `getScrollElement`, `measureElement`,
  `rangeExtractor`, `shouldAdjustScrollPositionOnItemSizeChange`,
  `takeSnapshot`, `initialMeasurementsCache`, `lanes`, or raw TanStack
  `Virtualizer`.
- Dependency: upgrade `Plate repo root` to `@tanstack/react-virtual@3.13.25`,
  which resolves `@tanstack/virtual-core@3.15.0`.
- Internal runtime: route layout-backed `scrollToTopLevelIndex` through
  TanStack's scroll path where practical instead of direct
  `rootElement.scrollTo`.
- Internal runtime: keep Plite layout offsets authoritative; pass exact offsets
  through `scrollToOffset` when using TanStack for the scroll write.
- Internal runtime: keep selected/promoted index retention as Plite-owned
  `rangeExtractor` logic.
- Internal runtime: do not override
  `shouldAdjustScrollPositionOnItemSizeChange` by default.
- Internal runtime: keep `takeSnapshot()` private and unshipped unless a
  remount/restoration test proves the need.
- Rendering strategy: keep virtualized mode explicit, degraded, and
  experimental.
- Native behavior: native find and full screen-reader traversal remain limited
  until mounted.
- iOS: TanStack's iOS scrollTop deferral is useful for scroll writes, but it is
  not Plite iOS selection/IME/spellcheck proof.
- Issue accounting: `#790` remains related proof-route backlog.
- Issue accounting: `#5826`, `#5538`, `#4995`, `#5088`, and `#5473` remain
  related scroll/focus rows only.
- Issue accounting: `#5391`, `#5095`, `#4751`, `#4354`, and `#3760` remain
  related/non-claimed mobile rows only.
- Claim counts: new fixed claims `0`; new improved claims `0`.
- Ralph verification:

```bash
bun update @tanstack/react-virtual
bun test ./packages/plite-react/test/dom-strategy-and-scroll.tsx
bun --filter ./packages/plite-react typecheck
PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --workers=1 --grep virtualized
PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/pagination.test.ts --project=chromium --workers=1 --grep virtualized
bun lint:fix
```

- Ralph proof additions: backward-scroll dynamic-height row and layout-backed
  virtualized scroll offset row.

## Ralph Execution Log

- 2026-05-23 08:32 CEST: Ralph execution started. Completion state reset to
  `pending` for runtime id `019e5374-b6ff-78f3-848c-dda660d40b64`; active
  implementation owner is `Plate repo root`.
- 2026-05-23 08:40 CEST: Ralph execution complete. `Plate repo root` updated
  `plite-react` to `@tanstack/react-virtual@3.13.25` /
  `@tanstack/virtual-core@3.15.0`, routed layout-backed virtualized scroll
  through `virtualizer.scrollToOffset`, added exact-offset and dynamic-height
  backward-scroll proof rows, and added a `plite-react` patch changeset.
  Verification passed: `bun install --frozen-lockfile`; package Vitest
  `dom-strategy-and-scroll.test.tsx` with 37 tests; `bun --filter
  ./packages/plite-react typecheck`; huge-document virtualized Playwright grep
  with 2 tests; pagination virtualized Playwright grep with 1 test; and final
  `bun lint:fix`. The raw plan command `bun test
  ./packages/plite-react/test/dom-strategy-and-scroll.tsx` was not the right
  runner for this Vitest-backed file.
