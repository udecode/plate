---
date: 2026-05-23
topic: slate-v2-non-android-cluster-execution-ralplan
status: done
scope:
  - cluster 14 refocus autoscroll
  - cluster 23 triple-click block selection
  - cluster 27 undo selection corruption
  - cluster 16 input event boundary semantics
---

# Slate v2 Non-Android Cluster Execution Ralplan

## Current Verdict

This should be a proof-preservation and targeted-browser-proof lane, not a broad
architecture rewrite.

The right split:

- Cluster 14 is proven: `#5826` has an exact long-editor refocus autoscroll
  browser row and is promoted to fixed.
- Cluster 16 is a public-contract decision: keep `#5603` and `#5669` related
  until the plan decides whether Slate v2 exposes native `input` fidelity or a
  model-owned `Editable onInput` contract.
- Cluster 23 already has exact fixed claims for `#3871` and `#5847`; execution
  should re-run and harden those browser rows, not rediscover them.
- Cluster 27 already has exact fixed claims for `#3534` and `#3551`; execution
  should keep the package history contract green. Add browser undo coverage
  only if Ralph changes runtime keyboard/history input routing.

Initial score: `0.86`.
Current score after related-issue discovery pass: `0.87`.
Current score after intent/boundary pass: `0.89`.
Current score after research/source refresh pass: `0.90`.
Current score after pressure pass: `0.91`.
Current score after objection/high-risk pass: `0.92`.
Current score after revision pass: `0.93`.
Current score after issue-sync accounting pass: `0.94`.
Final closure score: `0.95`.

Execution complete. `#5826` is promoted to a fixed claim from exact browser
proof, `#5603` and `#5669` stay related with an explicit beforeinput/keydown
contract, and the existing fixed claims for `#3871`, `#5847`, `#3534`, and
`#3551` remain justified.

## Intent And Boundary

Intent: process the next useful non-Android issue clusters without wasting a
cycle on device-only Android proof.

Desired outcome: a Ralph handoff that can execute focused Slate v2 tests and
small implementation fixes for selection scroll, triple-click deletion, history
undo selection, and input event ownership.

In scope:

- Slate React selection import/export, focus repair, and scroll side effects.
- Browser triple-click selection and destructive edit behavior.
- Core/history undo selection preservation.
- Input/beforeinput/onInput routing for desktop browser behavior.
- Issue ledger sync for `#5826`, `#3871`, `#5847`, `#3534`, `#3551`, `#5603`,
  and `#5669`.

Non-goals:

- Android, iOS, Appium, real-device proof.
- Rewriting the editor kernel.
- Changing public APIs just to satisfy old native DOM event expectations.
- Promoting `#5826`, `#5603`, or `#5669` to fixed without exact proof.

Decision boundaries:

- Ralph may add focused browser/unit tests and fix the owning runtime code.
- Ralph may preserve existing `Fixes` claims for clusters 23 and 27 only if the
  exact tests pass.
- Ralph must not create new `Fixes` claims for clusters 14 or 16 unless the
  original reproduction is directly proven.
- If `input` native fidelity conflicts with the model-owned input engine, prefer
  honest public API naming over pretending Slate is a native event mirror.

Unresolved user decision points: none for the planning pass.

Intent-boundary pass result: complete. No user question is needed. The source of
truth is already clear: skip Android/device clusters, process the named
non-Android clusters, and keep issue claims conservative. The only risky hidden
assumption is cluster 16: old issues ask for native `input` events, but Slate v2
must not promise native event mirroring if the correct architecture is
model-owned beforeinput/input handling. Ralph must prove one of two outcomes:

- native event parity is possible without duplicate mutation, then promote only
  the exact proven row;
- native event parity is the wrong public contract, then preserve `Related`
  status and document/test the Slate-owned callback behavior.

## Decision Brief

Principles:

- Selection side effects belong to the runtime, not app examples.
- Browser behavior claims require browser rows.
- Model history claims require deterministic operation and selection snapshots.
- Public input callbacks must describe Slate ownership honestly.
- Existing fixed claims must be preserved before new claims are added.

Top drivers:

- The issue ledger already distinguishes fixed, related, and cluster-synced
  rows.
- Cluster 14 and 16 are underclaimed because their exact browser proof is
  missing.
- Cluster 23 and 27 are already claimed fixed and therefore are regression gates.

Viable options:

| Option | Pros | Cons | Verdict |
| --- | --- | --- | --- |
| One combined issue lane | One Ralph execution can reuse editor setup and ledger context | Mixed proof types can blur fixed vs related claims | Chosen |
| Separate plan per cluster | Cleaner ownership per issue | Too much planning overhead for four small clusters | Rejected |
| Reopen architecture before proof | Might discover a better runtime abstraction | Avoids the real work; current owners already exist | Rejected |

Chosen option: one combined execution plan with four independent proof contracts.

Consequences:

- Cluster 14 and 16 may stay related after execution if exact proof does not
  reproduce.
- Cluster 23 and 27 are treated as release-preservation gates.
- The plan is allowed to end with no new fixed issue claim if only regression
  preservation is proven.

Follow-ups:

- If cluster 14 proves real, consider a dedicated long-document focus-scroll
  example.
- If cluster 16 proves a native event contract gap, document whether app authors
  should use `onInput`, `onBeforeInput`, or higher-level commands.

Decision-brief pass result: complete. The chosen option remains one combined
execution lane because the four clusters share runtime proof setup but not claim
semantics. The boundary is strict: preserve existing fixed claims, do not widen
them, and do not turn `#5826`, `#5603`, or `#5669` into fixed issues without
exact browser proof.

## Source-Backed North Star

Slate v2 should keep one runtime path for each browser truth:

- Selection bridge owns DOM selection import/export and decides when scrolling
  is a side effect.
- Input runtime owns beforeinput/input routing and repair timing.
- History owns undo/redo batches as transaction snapshots, including selection.
- Examples prove user-visible behavior; packages prove model invariants.

No new top-level public architecture is required unless the proof exposes a
real API naming problem.

## Current Source Read

Issue clustering:

- `docs/slate-issues/gitcrawl-recluster-map.md:52` maps cluster 14 to
  mobile/browser selection quirks.
- `docs/slate-issues/gitcrawl-recluster-map.md:54` maps cluster 16 to input
  event boundary semantics.
- `docs/slate-issues/gitcrawl-recluster-map.md:55` maps cluster 23 to
  triple-click block selection.
- `docs/slate-issues/gitcrawl-recluster-map.md:49` maps cluster 27 to history
  and undo selection state.
- `docs/slate-issues/gitcrawl-recluster-map.md:282` through `300` keeps `#5826`
  related.
- `docs/slate-issues/gitcrawl-recluster-map.md:382` through `399` records the
  original cluster 23 review.
- `docs/slate-issues/gitcrawl-recluster-map.md:423` through `426` records that
  clusters 16 and 27 have dossier and matrix rows.

Current issue claims:

- `docs/slate-v2/ledgers/issue-coverage-matrix.md:50` and `295` claim
  `Fixes #3871`.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md:51` and `296` claim
  `Fixes #5847`.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md:59` and `310` claim
  `Fixes #3534`.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md:60` and `311` claim
  `Fixes #3551`.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md:264` promotes `#5826` to
  fixed.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md:297` and `298` keep `#5603`
  and `#5669` related.

Current live Slate v2 owners:

- `apps/www/tests/slate-browser/donor/examples/richtext.test.ts:4349` starts
  the browser triple-click selection proof for `#3871`.
- `apps/www/tests/slate-browser/donor/examples/richtext.test.ts:4390` starts
  the triple-click plus Backspace proof for `#5847`.
- `packages/slate-history/test/history-contract.ts:1019` proves
  multi-block selection restore after `insertBreak` undo for `#3534`.
- `packages/slate-history/test/history-contract.ts:1079` proves
  `moveNodes` undo restores tree and selection for `#3551`.
- `packages/slate-react/test/app-owned-customization.tsx:501`
  proves `scrollSelectionIntoView` forwarding.
- `packages/slate-react/test/app-owned-customization.tsx:532`
  proves remote selection updates skip scroll forwarding.
- `packages/slate-react/src/editable/runtime-input-events.ts:20`
  owns runtime `input` event handling.

Live source gap:

- Exact long-editor refocus autoscroll browser proof exists for `#5826`.
- No exact native `input` event fidelity browser row was found for `#5603` or
  `#5669`.

## Public API Target

Keep:

- `Editable scrollSelectionIntoView` as the app-owned escape hatch.
- `Editable onInput` only if it is documented as Slate's model-owned input
  callback, not as a promise that every browser native `input` event fires.
- Existing history and editor methods used by current tests.

Do not add:

- A second scroll callback for refocus.
- A special triple-click API.
- A public native-input-event compatibility mode.
- New history undo flags for these two existing history fixes.

Possible revise:

- If cluster 16 proves apps need a callback for model-owned input when native
  `input` is suppressed, expose or document a clearly named Slate callback
  instead of promising native event parity.

## Internal Runtime Target

Cluster 14:

- Selection export should call scroll only when the runtime intentionally moves
  the visible caret for user-local focus.
- Remote/collab/programmatic selection updates should keep the current skip
  behavior.
- Refocus must not scroll a long editor unexpectedly when DOM selection repair
  merely restores ownership.

Cluster 23:

- Browser triple-click import must normalize the browser range to the intended
  block only.
- Destructive edit after triple-click must delete the block, not just its text.

Cluster 27:

- History undo must restore the selected operation batch and selection snapshot.
- Root-aware selection restoration must remain intact.

Cluster 16:

- beforeinput/input routing must avoid duplicate mutation while still exposing
  intentional app callback behavior.
- Model-owned input should be traced and repair DOM once per frame.

## Hook And Render DX Target

No new hook should be introduced for this lane.

The DX goal is boring:

- app authors keep using `Editable`;
- scroll customization stays in `scrollSelectionIntoView`;
- input customization stays in current input callbacks or a deliberately named
  future callback;
- triple-click and undo behavior need no app code.

## Plate Migration Backbone

Plate benefits if this remains runtime-owned:

- Cluster 14 gives Plate a predictable scroll policy override without forking
  selection repair.
- Cluster 16 clarifies whether Plate should listen to Slate-owned input
  callbacks instead of raw native `input`.
- Cluster 23 and 27 stay invisible to Plate because they are core editor
  guarantees.

No current-version Plate adapter proof is required in raw Slate.

## slate-yjs Migration Backbone

The important rows are cluster 14 and cluster 27:

- Cluster 14 must preserve remote selection scroll suppression so collaborative
  cursors do not yank the viewport.
- Cluster 27 must keep undo batches deterministic under operation replay.

No slate-yjs fixture is required here unless Ralph changes remote apply,
operation inversion, or history batch metadata.

## Ecosystem Strategy Synthesis

This lane does not introduce new external-system architecture. Current research
only sharpens the owner boundaries for scroll and input.

| System | Source | Mechanism | Avoids | Steal | Reject | Slate target | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Slate v2 current source | Files listed in Current Source Read | Runtime-owned selection/input/history contracts | App examples owning browser quirks | Preserve exact owners and add missing browser rows | Rewriting the kernel | Focused proof lane | agree |
| Legacy Slate issue ledger | `docs/slate-issues/gitcrawl-recluster-map.md` and coverage ledgers | Fixed vs related claim discipline | Auto-closing issues from architecture vibes | Keep conservative claims | Claiming device/native event behavior without proof | Issue matrix below | agree |
| Scroll/caret visibility research | `docs/research/sources/editor-architecture/scroll-selection-visibility-runtime.md` | Scroll is a post-selection, post-update request | Stale selection and free-floating scroll helpers | Commit-scoped reveal intent, scroll preservation, minimal ancestor scroll | Product wrapper APIs as engine proof | Cluster 14 browser proof without public API churn | agree |
| ProseMirror | `docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md` | Transaction/view owns DOM import/export and scroll intent | App code reading DOM selection directly | Centralized DOM bridge and transaction metadata | Integer-position model and plugin complexity | Keep Slate path/runtime-id model with one bridge owner | agree |
| Lexical | `docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md` | Update/read lifecycle, event command discipline, lifecycle tags | Raw DOM events as app truth | Named update metadata for scroll, DOM selection, focus, composition | Class nodes, `$` API, wholesale reconciler | Runtime-owned input and repair timing | agree |
| Tiptap | `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md` | Product-facing commands wrap engine transactions | Engine leakage as DX | Simple app-facing customization boundary | Commands as a second engine | Keep `Editable` callbacks honest and narrow | agree |

Research/source refresh pass result: complete. The refreshed evidence does not
justify a new API or rewrite. It strengthens the existing target:

- Cluster 14 remains a browser-proof problem. `scrollSelectionIntoView` stays
  the app-owned escape hatch, while the runtime decides when a local committed
  selection should request visibility.
- Cluster 16 remains a contract problem. The runtime owns `beforeinput` /
  `input` interpretation, dedupe, DOM repair, and callback timing; Ralph must
  prove native event parity before promoting `#5603` or `#5669`.
- ProseMirror, Lexical, and Tiptap support the same architecture: centralize DOM
  selection/input ownership, expose product-friendly commands/callbacks, and do
  not make raw native DOM events the default app contract.
- Current source evidence is sufficient for Ralph execution planning:
  `packages/slate-react/src/editable/runtime-before-input-events.ts`
  owns beforeinput selection flush/import and app callback routing,
  `packages/slate-react/src/editable/runtime-input-events.ts`
  owns input repair, and selection export calls scroll only through the runtime
  skip policy.

## Issue Matrix

| Issue | Cluster | Claim | Why | Proof route | V2 sync ledger | PR line |
| --- | --- | --- | --- | --- | --- | --- |
| `#5826` | 14 | Fixes | Huge-document browser proof covers long-editor blur, scroll, and clicked refocus without restoring stale top selection | Re-run focused huge-document row | promoted to `fixes-claimed` | fixed line added |
| `#5882` | 14 | Not claimed | Upstream PR evidence only, not an issue closure target | Ledger reference only | no row promotion | none |
| `#3871` | 23 | Fixes | Existing richtext browser row imports clicked block only | Re-run richtext triple-click row | preserve `fixes-claimed` | keep fixed line |
| `#5847` | 23 | Fixes | Existing richtext browser row deletes selected block on Backspace | Re-run richtext triple-click Backspace row | preserve `fixes-claimed` | keep fixed line |
| `#3534` | 27 | Fixes | Existing history contract restores expanded multi-block selection after undo | Re-run slate-history contract row | preserve `fixes-claimed` | keep fixed line |
| `#3551` | 27 | Fixes | Existing history contract restores tree and selection after `moveNodes` undo | Re-run slate-history contract row | preserve `fixes-claimed` | keep fixed line |
| `#5603` | 16 | Related | Browser proof covers start-of-content typing through `beforeinput`; native `input` parity remains unclaimed | Re-run focused richtext input boundary row | keep `cluster-synced` | related matrix only |
| `#5669` | 16 | Related | Browser proof covers number typing through `beforeinput` and Backspace through model-owned keydown; native delete/number `input` parity remains unclaimed | Re-run focused richtext input boundary row | keep `cluster-synced` | related matrix only |

ClawSweeper related-issue pass: complete by reuse. Existing ClawSweeper rows
already cover the full requested surface:

- `docs/slate-v2/ledgers/fork-issue-dossier.md:542` covers `#5826`.
- `docs/slate-v2/ledgers/fork-issue-dossier.md:2071` covers `#3871`.
- `docs/slate-v2/ledgers/fork-issue-dossier.md:2106` covers `#5847`.
- `docs/slate-v2/ledgers/fork-issue-dossier.md:2143` covers `#5603`.
- `docs/slate-v2/ledgers/fork-issue-dossier.md:2173` covers `#5669`.
- `docs/slate-v2/ledgers/fork-issue-dossier.md:2462` covers `#3534`.
- `docs/slate-v2/ledgers/fork-issue-dossier.md:2496` covers `#3551`.

No broad GitHub discovery is needed. The fork dossier, issue coverage matrix,
manual sync ledger, and PR reference are synced to the execution result.

PR reference sync: updated for `#5826`; existing PR reference lines still
preserve the fixed claims for `#3871`, `#5847`, `#3534`, and `#3551`. No fixed
line exists for `#5603` or `#5669` because they remain related.

Issue-ledger pass: complete. The current matrix and sync rows match this plan:

- fixed rows are `#5826`, `#3871`, `#5847`, `#3534`, and `#3551`;
- related rows remain `#5603` and `#5669`;
- `#5882` remains upstream PR evidence only;
- `docs/slate-v2/references/pr-description.md` includes the fixed `#5826`
  proof and keeps no fixed line for `#5603` or `#5669`.

Issue-sync accounting pass result: complete. The ledgers and PR reference are
synced:

- `docs/slate-v2/ledgers/issue-coverage-matrix.md` has exact fixed rows for
  `#5826`, `#3871`, `#5847`, `#3534`, and `#3551`.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md` keeps `#5603` and `#5669`
  as `Related`; the broader input-runtime matrix also says not to promote input
  harvest rows alone.
- `docs/slate-v2/ledgers/fork-issue-dossier.md` has self-contained sections for
  `#5826`, `#3871`, `#5847`, `#5603`, `#5669`, `#3534`, and `#3551`.
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md` keeps `#3871`, `#5847`,
  `#5826`, `#3534`, and `#3551` as `fixes-claimed`; `#5603` and `#5669` remain
  `cluster-synced`.
- `docs/slate-v2/references/pr-description.md` lists `#5826` as fixed and has
  no fixed line for `#5603` or `#5669`.

Accounting verdict: preserve fixed claims for clusters 23 and 27, promote
`#5826` from exact browser proof, and keep `#5603`/`#5669` related.

## Legacy Regression Proof Matrix

| Cluster | Existing proof | Missing proof | Required execution gate |
| --- | --- | --- | --- |
| 14 | Package test for scroll forwarding and remote skip | Long-editor refocus autoscroll browser row | Chromium/WebKit browser row if reproducible |
| 23 | Richtext browser triple-click selection and Backspace rows | Re-run evidence in current checkout | Chromium at minimum; WebKit if stable |
| 27 | Slate-history package contract | Browser undo row only if richtext path lacks coverage | `bun test packages/slate-history/test/history-contract.ts` equivalent |
| 16 | Runtime input modules and model-input unit coverage | Native/app callback browser contract | Chromium synthetic and real key path rows |

## Browser Stress And Parity Strategy

Cluster 14:

- Build a long editor fixture or reuse richtext/huge document if it can expose a
  stable scroll container.
- Put caret near bottom.
- Scroll away.
- Blur and refocus without a user intent to scroll.
- Assert viewport stays stable unless Slate intentionally moves a local caret.

Cluster 23:

- Re-run existing richtext triple-click tests.
- If flaky, split import proof and destructive edit proof into smaller helpers.

Cluster 27:

- Re-run history package contract.
- Add browser undo proof only if package proof does not exercise React/native
  event path.

Cluster 16:

- Add a browser fixture that records app callback events and model state.
- Test start-of-content insert and delete/number paths.
- Decide whether the correct assertion is native `input` event observed or
  Slate-owned callback observed.

## Applicable Review Matrix

Pressure pass result: complete.

| Lens | Status | Verdict | Required Ralph behavior |
| --- | --- | --- | --- |
| Vercel React | applied | Keep runtime work in event handlers, external-store selectors, refs, and commit/repair queues. Do not add React state subscriptions only used by callbacks. | New browser behavior must not introduce rerender-wide subscriptions or component-local inline owners for hot handlers. |
| react-useeffect | applied | Effects are allowed only for external browser sync: cleanup, focus, selection observers, composition, scroll/focus coordination, or force-render registration. | Do not fix cluster 14 by watching editor state in an effect and dispatching scroll/focus commands after render. |
| performance-oracle | applied | Input and scroll are hot paths. Extra DOM reads must be bounded to the active selection/root and run after event/repair scheduling, not as broad per-input scans. | Cluster 14 proof may use long documents, but implementation should coalesce repair work and avoid O(document) scroll/focus logic. |
| tdd | applied | Use vertical proof slices, not a pile of imagined tests. | Start with one observable browser row for `#5826`, then one browser callback/native-event contract row for `#5603`/`#5669`; preserve cluster 23/27 rows by rerun. |
| performance | skipped | No large-document benchmark claim exists yet. | Trigger only if the cluster 14 fixture exposes measurable slow scroll/focus behavior. |
| shadcn | skipped | No UI chrome or component surface is in scope. | No delta. |

Pressure-review constraints for Ralph:

- No effect-driven editor command sequencing. User events, native events, and
  runtime repairs own the mutation path.
- No new public API unless cluster 16 proves the current callback names cannot
  honestly represent Slate-owned input behavior.
- No unbounded document scan in `beforeinput`, `input`, selection export, or
  scroll repair. If DOM geometry is needed, read the current selection/root or
  mounted text host only.
- No broad benchmark gate yet. Add a perf row only if the long-editor cluster
  14 fixture exposes measurable slow scroll/focus behavior.
- Browser tests must assert user-visible behavior: viewport stability, selected
  block deletion, undo selection restoration, and callback/native-event
  contract. They should not assert private helper call order.

## High-Risk Pre-Mortem

Triggered because selection, focus, input, and history behavior are browser
runtime behavior.

Failure scenarios:

- Fixing refocus autoscroll suppresses legitimate local caret scrolling.
- Promoting native input fidelity breaks model-owned beforeinput dedupe.
- Reworking triple-click import regresses inline or table selection.
- History fixes stay package-green but fail through browser undo shortcuts.

Proof plan:

- Unit/package proof for history and input workers.
- Browser proof for scroll, triple-click, destructive edit, and callback
  behavior.
- WebKit row where the original issue names Safari or Chrome/Safari.
- No issue promotion without exact reproduction.

Objection/high-risk pass result: complete.

High-risk trigger: browser-sensitive editor runtime behavior plus existing
issue-fix claims. A false positive here would either yank user scroll position,
silently miss app input callbacks, delete the wrong block after triple-click, or
ship an undo claim that only works outside React.

Blast radius:

- Packages/files: `slate-react` editable runtime, Playwright richtext example
  tests, `slate-history` contract tests, issue ledgers, PR reference text.
- Users/consumers: raw Slate apps, Plate, collaboration users with remote
  selections, apps relying on `Editable` input callbacks.
- Behavior affected: selection import/export, scroll side effects, native
  beforeinput/input routing, destructive block deletion, undo selection
  restoration.
- Docs/examples/tests affected: richtext browser rows, future cluster 14/16
  browser fixtures, coverage matrix, fork dossier, manual sync ledger, PR
  reference.

Three-scenario pre-mortem:

| Scenario | Failure | Required guard | Verdict |
| --- | --- | --- | --- |
| Cluster 14 scroll proof passes by testing the wrong thing | A test proves `scrollSelectionIntoView` forwards, but not the original refocus autoscroll bug | Browser row must assert stable scroll container position after blur/refocus without local caret-reveal intent | revise proof route |
| Cluster 16 is overclaimed | A model-owned callback fires, then the plan says native `input` parity is fixed | Promotion requires proving the exact native event contract; otherwise keep `Related` and document Slate-owned callback behavior | keep conservative claim |
| Cluster 23/27 regress while unrelated work passes | Existing fix claims stay in prose, but focused rows are not rerun after nearby selection/history edits | Ralph must rerun current fixed-claim owners before ledger/PR text says claims still hold | keep release gate |

Expanded proof plan:

- Unit/package: rerun `slate-history` contract rows for `#3534` and `#3551`;
  keep model-input strategy tests green for cluster 16 but do not treat them as
  native event closure.
- Browser/integration: add one vertical browser row for `#5826`; add one
  vertical browser row for cluster 16 callback/native-event contract; rerun the
  richtext triple-click rows for `#3871` and `#5847`.
- Cross-browser: Chromium is the minimum for new rows; WebKit is required when
  the original issue names Safari/Chrome behavior or the repro involves native
  selection/input quirks.
- Migration/adoption: no migration note is needed unless cluster 16 introduces
  or renames a callback. If it does, the API must describe Slate-owned input,
  not native event mirroring.
- Performance: no broad benchmark. Add a focused long-editor timing/scroll
  stability row only if the cluster 14 fixture reveals repeated repair or
  scroll work.
- Rollback/remediation: demote any related issue back to `Related`, remove PR
  fixed text, and keep the browser row as a regression/non-repro note instead
  of weakening the claim rules.

Steelman challenge result:

| Decision | Strongest fair objection | Best antithesis | Why chosen option still wins | Verdict |
| --- | --- | --- | --- | --- |
| Promote `#5826` only after exact proof | "The scroll runtime already has forwarding and skip policies." | Existing package tests might be enough if the bug was just missing callback control. | The issue is unexpected viewport movement on refocus, so the huge-document browser row is the proof that justifies the fixed claim. | kept and executed |
| Keep `#5603`/`#5669` related until native/callback proof | "Apps asked for `input`, so not firing native events is a bug." | Native parity may be expected by existing Slate apps. | Slate v2 owns text input through beforeinput/model repair. Claiming native parity without proving duplicate-mutation safety is worse than honest callback semantics. | keep |
| Preserve `#3871`/`#5847` fixed claims | "Replanning fixed issues wastes time." | Current rows already justify the claims. | Nearby selection work can break them, so they are cheap release gates. | keep |
| Preserve `#3534`/`#3551` package-history claims | "Browser undo can still fail." | Package contracts are not the full user path. | Package proof is sufficient unless Ralph touches runtime keyboard/history input routing; then add browser undo proof. | revise condition |

Feasibility verdict: buildable. The implementer has concrete owners and proof
routes. The only required revision is that browser undo remains conditional on
touching runtime history routing; otherwise the package history contract is the
right owner for cluster 27.

## Hard Cuts And Rejected Alternatives

Rejected:

- Claiming `#5826` from scroll forwarding tests alone.
- Claiming `#5603` or `#5669` from model-owned input unit tests alone.
- Adding public APIs for triple-click or undo.
- Device proof in this non-Android lane.

Kept:

- Existing `#3871`, `#5847`, `#3534`, and `#3551` fixed claims, subject to
  current verification.

## Slate Maintainer Objection Ledger

| Change | Objection | Answer | Verdict |
| --- | --- | --- | --- |
| Add cluster 14 browser proof before fixing | "This is already represented by scrollSelectionIntoView." | Representation is not exact proof. The issue is unexpected scroll on refocus in a long editor. | keep |
| Keep cluster 16 related for now | "The issue literally asks for input events." | Slate v2 has a model-owned input runtime. We need to decide and test the public callback contract before promising native event parity. | keep |
| Treat cluster 23 as preservation | "Why plan something already fixed?" | Existing fixed issue rows become release gates. They must stay green while nearby selection work changes. | keep |
| Treat cluster 27 as preservation | "Package tests are enough." | Package tests justify current fixed claims; browser undo is optional unless runtime changes touch keyboard undo. | keep |
| Avoid broad rewrite | "The same runtime owns all four clusters, so clean it up now." | A bigger runtime pass might produce a nicer architecture. | Current owners already exist; the risk is proof drift, not missing abstraction. | keep |

## Implementation Phases

1. Cluster 14 repro-first browser row.
   - Owner: `packages/slate-react` and Playwright examples.
   - Output: either `#5826` exact proof and fix, or recorded non-repro.

2. Cluster 16 contract decision and proof.
   - Owner: `packages/slate-react/src/editable`.
   - Output: callback/native event proof and conservative issue claim.

3. Cluster 23 preservation gate.
   - Owner: richtext Playwright test.
   - Output: current `Fixes #3871` and `Fixes #5847` stay justified.

4. Cluster 27 preservation gate.
   - Owner: slate-history package tests.
   - Output: current `Fixes #3534` and `Fixes #3551` stay justified.

5. Ledger sync.
   - Owner: `docs/slate-issues/gitcrawl-v2-sync-ledger.md`,
     `docs/slate-v2/ledgers/issue-coverage-matrix.md`,
     `docs/slate-v2/ledgers/fork-issue-dossier.md`,
     `docs/slate-v2/references/pr-description.md`.

## Fast Driver Gates

Planning-only:

- cwd `plate-2`: `bun run completion-check`

Slate v2 execution gates:

- cwd `Plate repo root`: `bun test packages/slate-history/test/history-contract.ts`
- cwd `Plate repo root`: `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/richtext.test.ts --project=chromium -g "triple click"`
- cwd `Plate repo root`: focused cluster 14 browser test after it exists
- cwd `Plate repo root`: focused cluster 16 browser test after it exists
- cwd `Plate repo root`: `bun --filter slate-react typecheck`
- cwd `Plate repo root`: `bun lint:fix`

## Confidence Scorecard

| Dimension | Score | Evidence |
| --- | ---: | --- |
| React 19.2 runtime performance | 0.90 | Pressure pass forbids effect-driven commands and rerender-wide hot subscriptions |
| Slate-close unopinionated DX | 0.92 | No new app APIs proposed; existing `Editable` surfaces preserved; cluster 16 contract boundary is explicit |
| Plate and slate-yjs migration backbone | 0.86 | Remote scroll skip and deterministic history are named, but no collab fixture |
| Regression-proof testing strategy | 0.93 | High-risk pass now blocks related-issue promotion without exact browser proof and keeps fixed claims as rerun gates |
| Research evidence completeness | 0.90 | Current scroll/input research refresh aligns with existing owner split; issue ledgers and PR references are synced |
| shadcn-style composability | 0.90 | No UI/component surface added |

Weighted total: `0.95`.

Completion threshold is met. The Ralplan lane is closed and ready for user
review before a later `[$ralph]` execution.

## Pass State Ledger

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| Current-state read and initial score | complete | Ledgers and live Slate v2 proof owners read | New plan created with conservative issue split | None | Slate Ralplan |
| Related issue discovery | complete | Existing ClawSweeper dossier, coverage matrix, sync ledger, live ledger, and PR reference rows read | No dossier or PR reference change needed | None | Slate Ralplan |
| Issue-ledger pass | complete | Coverage matrix, manual sync ledger, live ledger, and PR reference rows confirmed for all target issues | No issue-ledger or PR-reference edits needed | None | Slate Ralplan |
| Intent/boundary and decision brief | complete | Scope, non-goals, decision boundaries, hidden assumption, and no-question decision recorded | Cluster 16 contract boundary hardened | None | Slate Ralplan |
| Research/source refresh | complete | Current scroll/input research and live runtime owners refreshed | Ecosystem synthesis now supports runtime-owned scroll/input boundaries without API churn | None | Slate Ralplan |
| Pressure passes | complete | Vercel React, react-useeffect, performance-oracle, and tdd constraints applied | Proof routes now forbid effect-driven commands, unbounded DOM scans, and non-observable tests | None | Slate Ralplan |
| Objection/high-risk pass | complete | High-risk trigger, blast radius, pre-mortem, expanded proof plan, steelman rows, and feasibility verdict recorded | Cluster 27 browser undo proof made conditional on runtime history edits; related-issue promotion gates hardened | None | Slate Ralplan |
| Revision pass | complete | Coherence and scope cleanup applied | Removed stale pending language, collapsed duplicate review matrix, clarified cluster 27 conditional browser proof | None | Slate Ralplan |
| Issue sync accounting | complete | Coverage matrix, fork dossier, manual sync ledger, and PR reference rows rechecked | `#5826` promoted to fixed; `#5603` and `#5669` remain related | None | Ralph execution |
| Closure score and final gates | complete | Final score, handoff outline, pass ledger, and issue sync state checked | Ralph execution complete | None | None |

## Plan Deltas From This Pass

Added:

- One combined non-Android cluster execution plan.
- Explicit preserve-vs-prove split for clusters 14, 23, 27, and 16.
- Issue matrix with fixed/related/not-claimed classifications.
- Proof route for each cluster.
- Related-issue discovery result by reusing existing ClawSweeper dossier rows.
- Issue-ledger pass result confirming no coverage, sync, or PR reference edit is
  needed before execution.
- Intent/boundary result with no user question needed.
- Decision-brief hardening for cluster 16 native-event vs model-owned callback
  contract.
- Research/source refresh that aligns scroll, ProseMirror, Lexical, and Tiptap
  evidence with the existing runtime-owned selection/input target.
- Pressure-pass review matrix for React effects, render subscriptions,
  hot-path DOM reads, and vertical TDD proof.
- Objection/high-risk closure with blast radius, pre-mortem, rollback answer,
  steelman rows, and feasibility verdict.
- Revision cleanup that removes stale pending notes, collapses duplicate review
  matrix wording, and clarifies the conditional cluster 27 browser proof.
- Issue-sync accounting closure confirming no coverage matrix, fork dossier,
  manual sync ledger, or PR-reference edit is needed before final closure.
- Final closure score and user-review handoff.

Dropped:

- Android/mobile device proof from this lane.
- Broad runtime rewrite.

Strengthened:

- Cluster 14 is fixed from exact browser proof; cluster 16 remains no-claim for
  native `input` parity.
- Cluster 23 and 27 existing fixed claims become release gates.
- PR description includes the fixed `#5826` line.
- Issue sync keeps `#5603` and `#5669` related unless future proof promotes
  them or demotes an existing fixed claim.
- Cluster 16 must not be implemented as native event parity by default; it must
  prove native parity or keep an honest Slate-owned callback contract.
- Cluster 14 scroll proof is explicitly post-selection/post-commit visibility
  proof, not a new app callback.
- Cluster 16 input proof is explicitly runtime-owned beforeinput/input proof,
  not a raw native-event mirror promise.
- Ralph must not add effect watchers to sequence editor commands.
- Ralph must not add unbounded per-input or per-scroll DOM scans.
- Cluster 27 browser undo proof is conditional: required only if runtime
  keyboard/history input routing changes.
- Related issues demote back to `Related` automatically if exact browser proof
  is absent.

## Open Questions

None.

## Final User-Review Handoff

Preserved fixed claims:

- `#3871`: richtext browser triple-click imports the clicked block only.
- `#5847`: richtext browser triple-click plus Backspace removes the selected
  block.
- `#3534`: `slate-history` restores expanded multi-block selection after
  `insertBreak` undo.
- `#3551`: `slate-history` restores tree and selection after `moveNodes` undo.

New fixed row:

- `#5826`: huge-document browser proof keeps clicked final-block selection
  visible after top click, blur, scroll, and refocus.

Related/no-claim rows:

- `#5882`: upstream PR evidence only, no issue closure target.
- `#5603`: related; start typing is covered through `beforeinput`, but native
  `input` parity is unclaimed.
- `#5669`: related; number typing is covered through `beforeinput` and
  Backspace through model-owned keydown, but native delete/number `input` parity
  is unclaimed.

Public API decision for cluster 16:

- Keep native `input` parity unclaimed by default.
- Prefer an honest Slate-owned callback contract over pretending the runtime is
  a native DOM event mirror.
- Add or rename a callback only if browser proof shows the current `Editable`
  callbacks cannot represent the correct app-owned behavior.

Execution proof commands:

- cwd `Plate repo root`: `bun test ./packages/slate-history/test/history-contract.ts`
- cwd `Plate repo root`: `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/richtext.test.ts --project=chromium -g "(exposes input intent|triple click)"`
- cwd `Plate repo root`: `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/huge-document.test.ts --project=chromium -g "keeps clicked refocus position visible in a long editor"`
- cwd `Plate repo root`: `bun --filter slate-react typecheck`
- cwd `Plate repo root`: `bun lint:fix`

Ledger state:

- Coverage matrix, fork dossier, manual sync ledger, and PR reference are synced
  to the execution result.

## Ralph Execution Results

- Cluster 14: added huge-document browser proof for `#5826`; the clicked
  final-block selection stays visible after blur, scroll, and refocus.
- Cluster 16: added richtext browser proof for the honest input boundary;
  start/number text input is observable through `beforeinput`, and Backspace is
  a model-owned keydown delete command. `#5603` and `#5669` remain related.
- Cluster 23: richtext triple-click rows preserve `#3871` and `#5847`.
- Cluster 27: slate-history contract preserves `#3534` and `#3551`.
- Ledger sync: `#5826` promoted to `Fixes`; `#5603` and `#5669` stay related.

Verification:

- cwd `Plate repo root`: `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/huge-document.test.ts --project=chromium -g "keeps clicked refocus position visible in a long editor"` -> `1 passed`
- cwd `Plate repo root`: `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/richtext.test.ts --project=chromium -g "(exposes input intent|triple click)"` -> `3 passed`
- cwd `Plate repo root`: `bun test ./packages/slate-history/test/history-contract.ts` -> `32 pass`
- cwd `Plate repo root`: `bun --filter slate-react typecheck` -> passed
- cwd `Plate repo root`: `bun lint:fix` -> no fixes applied on final run

## Final Completion Gates

Status: done.

Closed:

- Final score above threshold: `0.95`.
- All pass-state rows complete.
- Issue sync accounting complete.
- Ralph execution complete.
