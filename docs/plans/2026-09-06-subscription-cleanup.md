# Subscription cleanup

Status: all nine local repairs complete. User authorized all nine findings in the [audit](../analysis/2026-09-06-use-sync-external-store-audit.md). Work stays in the current `next` checkout; no commit, push or publication.

## Work

- [x] Read Poteto Principles and the applicable refactoring, ownership and proof methods.
- [x] Pin the 57-call manifest and the accepted nine findings.
- [x] Run current Find and URL behavior tests; retain baseline source for comparison.
- [x] S4-S8: remove dead hooks and duplicate mobile, hydration and browser-feature wiring.
- [x] S2-S3: adopt canonical DnD and explicit-editor history subscriptions.
- [x] S9: simplify the Blob URL lifetime and prove replacement/unmount behavior.
- [x] S1: move Find state/actions into FindPlugin while preserving indexed decoration invalidation.
- [x] Run focused behavior, source type/lint and registry generation checks.
- [x] Replay affected Find, DnD, collaboration and URL flows through their actual routes.
- [x] Reconcile all nine findings and final source inventory.

## Contract and throughput

Find owns a named FindPluginState (open/query/count/active index/navigation intent) through its existing plugin store, and scoped actions through the plugin API. Derived match ranges and their lookup index stay private in the same plugin factory. No second UI snapshot, listener set or editor-keyed state registry survives. DnD retains its descriptor and DOM cleanup; per-node drop-line consumers select their own result. Browser and object URL hooks retain SSR and exact resource lifetimes.

Work proceeds sequentially under the checkout's agent instruction. Reuse the audit manifest, existing Find/URL/DnD tests, and managed/browser proof owners. Delete dead code before larger state changes. Do not create tests asserting absence of old names. No new public package API is proposed; existing subscription doctrine already covers these repairs.

Performance-observability: DnD changes React result granularity; Find changes state publication but must retain affected-node decoration refresh and lookup indexing. Pin baseline behavior and source before mutation, use disposable candidate probes for these subscription paths, then prove final locality. No timing improvement is claimed. Browser/native correctness and source checks remain separate.

Embedded probe contract (fixed before candidate results): DnD mounts 10/100/1000 consumers and transfers the drop target between two nodes; candidate must render exactly the two affected nodes, with no change for unrelated state or equivalent target values. Find uses 100 leaves/100 matches, 1000/1000, 1/10000, and 10000/10000. Both paths must return identical decorations, make one UI publication per search, refresh only the prior/next active leaves on navigation, and perform one index build per result set with constant-time per-leaf lookup. Existing Find search plus projection budget is 16.67 ms; matched baseline/candidate timings remain diagnostic if the current baseline itself exceeds it, and no speedup claim is permitted. Five interleaved samples after two warmups isolate deterministic work; timing noise cannot excuse a locality or cardinality failure. Existing Find focus/navigation tests guard both paths; final production reruns use the same harness.

Evidence: `docs/plans/artifacts/2026-09-06-subscription-cleanup/`. UI/registry source edits require generated output on next. Registry output and the draft changelog are generated and verified. No app launch is needed for dead-code-only rows; interactive rows require actual route proof.


## Repair ledger

| Finding | Final behavior | Proof |
| --- | --- | --- |
| S1 | FindPlugin owns query/open/count/navigation state and actions, plus its private derived match index. The controller uses usePluginStore; the result-owner class, editor WeakMap and UI listener set are gone. | Five behavior tests, four scale cohorts, five final browser runs and narrow layout. |
| S2 | Canonical DnD selectors include node identity and orientation before deciding whether to rerender. | 42 focused DnD tests; 10/100/1000-consumer probes; native Chrome reorder. |
| S3 | Peer history controls use useEditorRuntimeState with their explicit editor. | Browser edit/undo/redo updates peer text and local history counts. |
| S4 | Delete unused usePliteDecorationBuckets; retain live per-node hooks. | Source inventory and package typecheck. |
| S5 | Delete unused app media-query hook. | Source inventory and app typecheck. |
| S6 | Route both app mobile-hook imports to the published registry hook; delete the duplicate. | Import audit, types and registry generation. |
| S7 | Command menu and huge-document demo use the existing mounted-state hook. | Types, real huge-document hydration and generated dependency. |
| S8 | Huge-document capability checks run directly below its browser-ready gate. | Mounted controls and statistics table in the actual route. |
| S9 | Effect-owned Blob URLs clear with null sources and never expose revoked URLs when the same Blob returns. | Three lifetime tests and two completed HTML downloads. |

The probe also exposed full-graph cloning on every plugin write. The canonical store preserves its own immutable branches while copying newly supplied mutable data. Its regression test proves partial/draft reference stability, selector render isolation and protection against subsequent caller mutation. A private WeakSet recognizes snapshots the store created; shallow-frozen caller objects are not trusted.

The final inventory has **46 calls: 44 production and two tests**, down from 57. All **11 audited production calls** are removed or replaced. See `final-inventory.json` and `implementation-receipt.json` for scope and matching source fingerprints.

## Verification and limits

- **130 product tests and two scale probes pass.** `final-tests.log` covers 88 product tests plus two probes; `dnd-final.log`, `dnd-slow.log`, `dnd-behavior.log` and `dnd-ssr.log` cover 42 DnD tests. DnD mock-module suites run separately because their module mocks contaminate combined runs.
- **Package types pass: 80/80 source-first tasks. App source types and scoped lint pass.** The broader package-integration typecheck reports seven errors in the unrelated `apps/www/src/__tests__/package-integration/kit-lifetime-probe/lifetime-probe.spec.tsx` file: an unavailable bun:jsc export and six implicit-any parameters (`integration-types.log`). This is not a whole-checkout green claim.
- **Generation passes:** barrels, 367 canonical registry payloads, 15 style overlays, registry source check, and changelog generation/check. The draft changelog covers FindPlugin consumption and the huge-document mounted-hook dependency. No additional package changeset: this branch-internal v2 store does not exist on origin/main; the existing platejs-foundation changeset owns that release boundary.
- **Find browser proof:** five retry-free final-source runs at 2026-09-06T13:15:32Z cover shortcut, query, next/previous, Escape, highlight cleanup and returned focus, with no errors during replay. The final search bar fits a 433-CSS-pixel narrow viewport (right edge 425.35 px; page width 433 px). Temporary viewport overrides were reset.
- **Other browser proof:** native Chrome drag on /blocks/dnd-demo changes First/Second/Third to Second/First/Third. Collaboration propagates text and undo/redo while showing Undo 1/Redo 0, then Undo 0/Redo 1, then Undo 1/Redo 0. The huge-document route hydrates and updates controls/statistics. HTML export creates two identical complete 409,985-byte HTML files. Browser download-event waits timed out; file timestamps, content and matching hashes verify completion (`download-receipt.json`).
- **Scaling:** exactly two DnD consumers render on target transfer, including 1000 consumers. Find writes one index entry per match during search, zero during navigation, and refreshes only the prior/next active leaves. Derived range data stays private to the plugin, avoiding range-graph snapshot copies. Timings remain diagnostic: both matched paths exceed the historical 16.67 ms guard in larger headless cohorts; this work does not certify that latency budget.
- **Doctrine:** Best API and Plate vision record reference/selector behavior; Plate Next v159 and generated mirrors validate. Existing package attestations are unchanged. Agent Native Reviewer checked the Task → Best API → Plugin Creator/Plate UI → focused proof route and generated parity. No general workflow helper or cross-project installation changed.

All evidence is local. No commit, push, PR or publication was performed.
