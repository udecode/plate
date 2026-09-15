# Make commit invalidation follow consumer demand

Objective:
Implement demand-driven commit invalidation, selector routing, DOM path
bindings and decoration lifetime. Prove the production path against the frozen
comparison, package/type/lint checks and native/browser closure gates.

Flow mode:
accepted-plan implementation and verification

Goal plan:
docs/plans/2026-09-11-demand-driven-commit-invalidation.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- performance-observability (docs/plans/templates/packs/performance-observability.md)

Mode:
Standard, accepted-plan execution. The latest `go` accepts all four slices of
the completed planning handoff and authorizes local implementation and proof.
Git publication, schedules and another checkout remain outside scope.
Branch is `next`.

Completion threshold:
All four slices are implemented in their canonical owners, actual production
imports pass the frozen comparison, and focused plus strict package/browser
proof passes. Update current teaching, reconcile the source checklists and
record final evidence before passing the file checker.

Verification surface:
Current source, public teaching and exports; preserved baseline and actual
production imports; React Compiler/jsdom comparison; focused package contracts;
source-first types/lint; trusted browser input, selection/paint and full Plite
closure checks.

Constraints:
Preserve canonical commits, node identities, roots, historical snapshots,
live/draft reads, synchronous publication, equality, and cleanup. Add no public
query vocabulary, dependency graph, signals, compatibility alias, second
document model, or index owner. Keep model invalidation in core and mounted
DOM synchronization in React. Retain real app decoration sources and active
projected-selection paint. Do not run Autoreview on `next`.

Boundaries:
Production owners are `packages/plitejs/src/core/commit.ts`,
`react/hooks/use-editor-selector.tsx`, `react/hooks/use-plite-node-ref.tsx`,
`react/components/plite.tsx`, and `react/decoration-source.ts`.
Existing `core/snapshot-index.ts` and `react/view-selection-decoration.ts`
supply identity and view-selection primitives. Plate `usePath` inherits the
result through Plite node selectors. History/collaboration keep their commit
contract. Generic-selector replacement, live-read topology, projection policy,
virtualization, external text adapters, and public instrumentation are non-goals.

Output budget strategy:
Read named owners and callers. Keep raw samples and source identities in
`docs/plans/artifacts/demand-driven-invalidation/`; report decisive rows here.

Blocked condition:
An unresolved correctness difference, scaling regression, or unavailable
required production proof prevents implementation closure. Continue independent
work and report the exact failed gate or capability gap.

Plite Plan state:
- status: blocked
- phase: accepted-plan execution
- next: resolve independent checkout failures and native timing proof, then rerun strict closure
- handoff: implementation and affected proof complete; whole-checkout acceptance open

## Answer path membership at the commit

The [reads review](../research/decisions/reads-demand-driven-invalidation.md)
owns the accepted first-principles comparison. Keep the existing
`commit.changed.hasNodeKey(key, 'path')` call. For each changed root:

1. Use existing presence metadata to distinguish keys entering or leaving it.
2. Return true for entry and false for removal or absence.
3. For a surviving key, compare it with the after key at its old path.
   Different keys mean that the surviving key moved.

This determines whether the path changed without locating the new path in a
second cold index. Cache positive and negative answers for the immutable
commit. Cache root presence membership once from the existing presence query.
If a caller already requested the complete path set, reuse its membership.

Separate path enumeration and root-order checks from payload/text details.
Node and text consumers must not incidentally collect shifted descendants.
Whole-set APIs remain for callers that need them. Root-order detection compares
top-level identities and can still inspect top-level siblings when proving that
order is stable; it does not require descendant path enumeration.

Route path-dependent selector maps by their registered keys and skip them for
path-stable commits. Request node and selection sets only when relevant maps
contain listeners. Preserve global delivery, callback deduplication, explicit
invalidation overrides, text-sync suppression, and the deferred queue.

Pass commit demand to the existing DOM binding owner. It visits mounted keys,
filters elements by their exact mounted editor, and refreshes moved or removed
bindings before selector delivery. Preserve disconnected-element cleanup. Its
sync helper is private to the implementation and is not exported by
`plitejs/react`.

The mounted probe found another forced consumer. `Plite` always installs its
built-in projected-selection decoration source, even without a selection.
Use the existing presence hook to include that source while selection is
present. An empty decoration manager tracks its current version and skips query
work. Preserve later source registration, active paint, and pending refreshes.
Do not special-case a source ID inside the generic manager or assume that an
observed source ignores document changes.

## Grounding at intake: owners and teaching

Paths without a package prefix below are relative to `packages/plitejs/src`.

| Responsibility | Live evidence | Consequence |
| --- | --- | --- |
| Commit queries | `core/commit.ts:createCommitChanged`, `getRootDetails`, `getNodeKeys`, `getAggregateNodeKeys` | Membership builds a complete path set; structural payload/text queries share path enumeration. |
| Cold indexes | `core/snapshot-index.ts:buildSnapshotIndex`, `mapSnapshotIndexThroughChange` | A cold `pathOf` can materialize an index. Two calls alone do not prove constant work. |
| Selector demand | `react/hooks/use-editor-selector.tsx:useEditorSelectorContext` | Aggregate queries run before listener demand is inspected. |
| DOM paths | `react/components/plite.tsx:usePliteChangeCallbacks`, `react/hooks/use-plite-node-ref.tsx:syncPliteNodePathBindingsToDOM` | Paths are collected before mounted bindings are considered; the map spans views. |
| Decoration demand | `react/decoration-source.ts:mount`, `react/components/plite.tsx:allDecorations` | Input keys are requested without source demand; the built-in source keeps the default list nonempty. |
| View-selection lifetime | `react/view-selection-decoration.ts`, `react/view-selection.ts` | Existing presence and range observation own activation and repeated-root paint. |
| Plate adoption | `packages/platejs/src/react/stores/element/usePath.ts` | Live paths come from Plite node selectors; no adapter is required. |
| Public contract | `packages/plitejs/src/interfaces/editor.ts:EditorCommitChanged`, `src/react/index.ts` | Existing signatures/exports suffice; DOM sync remains private. |
| Teaching | `content/docs/plite/concepts/05-document-changes.mdx`, `walkthroughs/09-performance.mdx` | Preserve API examples; revise implementation-specific cache wording when the owner changes. |

## Keep one owner per responsibility

| Surface | Current | Target | Owner | Reason | Adoption and proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Precise path membership | Full aggregate set | Presence plus old-path identity comparison and commit-local memoization | Commit | One key does not need all changed paths | Same public calls; before/after oracle and cold/mapped/warm/named-root rows | Entry/removal/replacement mistakes | rearchitect |
| Root details | Path enumeration coupled to payload/text | Demand-specific results; order by top-level identity | Commit | Node/text demand must not force path traversal | Preserve aggregates, ordering and immutable result identity; metadata contracts | False negatives in payload/structure/order | rearchitect |
| Selector dispatch | Eager aggregate requests | Demand-gated categories and registered path keys | React selector context | Listener maps already identify the requested work | Same hooks/store; sparse/dense, deduplication, overrides and deferred-retirement proof | Lost or duplicate delivery | rearchitect |
| DOM path synchronization | Complete changed-path input | Existing mounted bindings filtered by exact view | React node-ref owner | Only mounted bindings need DOM work | Private helper change; repeated views, named roots, independent editors, disconnected cleanup | Foreign-view mutation or stale binding | rearchitect |
| Idle projected-selection source | Always installed | Existing presence hook controls source lifetime | Plite composition | Absent selection produces no paint | Same source factory; activation, clear, reactivation and retirement | Missing first paint or stale range | cut |
| Empty manager query work | Builds unused inputs | Track version then return while empty | Decoration manager | No source consumes the result | Dynamic registration and active-source contracts | Later source reads stale data | cut |
| Reads and snapshots | Distinct live and historical lifetimes | Same owners and lifetimes | Core | Both lifetimes serve current jobs | No migration; existing lifecycle proof | Consolidation loses draft or historical semantics | keep |
| Generic selector store | Existing adapter | No replacement in this plan | React | Its independent cost remains unattributed | Earlier E06 defer remains excluded; Best API Review owns any separate reassessment | Scope expansion without attribution | defer |

The highest-value change removes path enumeration from precise and unrelated
commit queries. Removing idle decoration demand comes next: it is necessary to
realize that gain in mounted Plite. Selector and DOM routing then bound work to
existing subscribers and bindings. The execution order below follows their
dependencies.

The deferred store rewrite is an excluded alternative, not a dependency of
this target. No public break or private compatibility bridge is selected.
History, collaboration, Plate hooks and normal app setup need no migration.
A new public contract discovered during execution returns to Best API within
this plan. Current signatures do not require a doctrine version repair.

## Freeze the design and production proof contract

Scale contract:
- Operation: exact commit queries, structural publication into real React
  subscriptions and DOM refs, and the next synchronous text update.
- Cohorts: 32 normal, 1,024 medium, 8,192 large, and 16,384 stress paragraphs;
  zero, one, 32, and all paragraph keys. Cold primary, mapped primary, warm
  primary, and cold named-root queries remain separate.
- Pathological laws: absent/deleted keys, split/merge/replacement, named-root
  creation/deletion, overlapping view ownership, and queued retirement.
- Budgets were frozen before target measurement. Named-root and 16,384 cohorts
  extend the same limits. No numeric threshold was loosened.
- Correctness must match for every boolean, aggregate, root flag, selector
  output, DOM path, callback override/deduplication, and cleanup.
- Without demand for all paths, require zero descendant path enumeration.
  Warm sparse queries at 1,024+ nodes cut deterministic index work by at least
  90%; mounted sparse publication cuts path traversal by at least 90%.
  First precise queries use at most two path lookups per distinct key, plus
  shared presence work. Repeated answers perform zero path lookups.
- Cold materialization may equal baseline, but cannot add another full index
  build. Surviving-key membership does not require an after-path lookup.
- Dense first and follow-up medians cannot regress by both 20% and 1 ms.
  Five interleaved pairs provide medians and raw samples, not credible p95/p99.
  Each sample uses a fresh fixture; index prewarming defines the named warm
  cohort. There is no separate timing warmup or outlier deletion.
- Original async-`act` follow-up timing failed the dense budget. The isolated
  profile found equal key work, fewer target aggregates, no delayed index build,
  and timing that changed direction. Retain it as inconclusive. The corrected
  owner comparison measures synchronous publication through `act`, including
  resulting DOM assertions, with the same numeric budget. Browser
  input-to-paint is an execution gate.
- Record descendants visited, index calls/builds, aggregate/partial cache
  cardinality, binding keys, renders, DOM elements, and heap before/after.
  Heap deltas are observations, not retained-heap proof.
- `run-probe.mjs` fingerprints Plite source/tests, package/config inputs,
  lockfile and the explicit harness files before and after execution.
  Drift in effective loaded inputs invalidates its receipt. Record unrelated
  changes and prove exclusion under Task's effective-input rule. Run the two
  current proof files serially.
- On production adoption, preserve the frozen baseline and replace the
  disposable target arm with actual production imports. Rerun the same
  fixtures, cohorts, sampling, budgets, and correctness guard.

The historical design command is:

```sh
node docs/plans/artifacts/demand-driven-invalidation/run-probe.mjs
```

The production comparison keeps the original baseline and instruments the
actual implementation for counters and arm dispatch only:

```sh
node docs/plans/artifacts/demand-driven-invalidation/production/run-probe.mjs
```

All receipts and their source snapshots are in
`docs/plans/artifacts/demand-driven-invalidation/`:

| Receipt | Disposition |
| --- | --- |
| `initial-packet.json` | Reject the extra cold build, eager decoration work and dense follow-up regression. |
| `presence-packet.json` | Presence-based membership passes cold/follow-up limits; mounted decoration demand remains. |
| `activation-packet.json` | Idle-source cut works; async follow-up timing is inconclusive. |
| `diagnostic-packet.json` | Isolates follow-up owner work and rules out a delayed index build in that row. |
| `sync-packet-unaccepted.json` | Supporting synchronous comparison before final cleanup/scenario expansion. Its transform hash matches `diagnostic-transform.mjs`. |
| `archive-glob-*` | Reject as final proof: a wildcard selected archived probes and let artifact writers race. |
| `source-drift-*` | Correctness and numeric budgets passed, but one source changed during execution. Reject its freshness receipt and rerun. |
| `packet.json`, `lifecycle.json`, `active-decoration.json`, `source-receipt.json` | Accepted explicit-file run at 16:33 UTC: 2 files/3 tests, 75 cohort rows, no budget failures; all 1,743 recorded inputs unchanged during execution. |
| `current-contracts.log`, `target-contracts.log`, `commit-contracts.log`, `contracts-receipt.json` | Existing React guards: 8 files/122 tests on each arm. Existing current commit metadata: 21 tests. Source reconciliation below. |

At 16,384 paragraphs with 32 mounted watchers, descendant path visits fall from
32,768 to zero, index calls from 65,556 to 86, and synchronous publication median
from 160.18 ms to 55.19 ms. Follow-up text medians are 1.21 ms and 0.85 ms.
Both arms render the same 31 changed watchers and retain 32 probe elements.
With all 16,384 watchers, publication medians are 540.16 ms and 458.85 ms;
follow-up medians are 1.38 ms and 1.30 ms. All frozen dense budgets pass.

These are five-pair jsdom publication measurements on an Apple M5 Max with
React Compiler, not native input-to-paint measurements. The core matrix covers
60 rows; the mounted matrix covers 15. The operation oracle covers 21 cases
and 549 key observations across all six runtime kinds, plus aggregate and root
flags. Three dispatch guards and the lifecycle/active-decoration probes pass.
Active app decorations deliberately retain complete path enumeration.

### Bound repeated work

Use existing `useSyncExternalStore` and selector maps. Add no per-node effects,
DOM nodes, handlers, scheduler, store, or index. An active view gains one
presence subscription; an idle view replaces its source observer with that
presence subscription. Partial path answers retain at most one entry per
queried key per commit. Presence sets scale with changed identities. Retained
commits may retain those answers until released.

Benchmark's cohort, repeated-unit, effect/subscription and memory-tagging leaves
apply. No Vercel-specific tactic is needed; existing owners provide the
primitives. There is no transition, debounce, virtualization, staged/hidden DOM,
layout read, network payload, database transaction or public profiler.
Production RUM/CWV claims are outside this library design result. Existing
internal counters/profilers and browser targets own execution detection.
Fixtures contain synthetic content, not user data.

## Implement in dependency order

Execute these units through Task and Plite Plan in this checkout. The user
accepted this order after the planning proof passed.

| Slice | Owner | Entry | Observable exit | Focused proof |
| --- | --- | --- | --- | --- |
| 1. Separate commit queries | Plite core | Accepted plan and matching source | Presence-based membership and lazy path/order details preserve all results and identities | Existing commit metadata/lifecycle contracts plus frozen core comparison |
| 2. Route mounted demand | Plite React | Slice 1 passes | Demand-gated selectors and exact-view DOM bindings update before notification | Selector, node-ref, provider and view-lifecycle contracts; mounted comparison; global overrides and queued retirement |
| 3. Activate needed decoration work | Plite composition/decoration manager | Slice 2 passes | Built-in source follows selection presence; empty manager skips queries; real sources retain full semantics | Manager/rendering/selection contracts; activation/clear/reactivation, late registration, pending native-text refresh, remount; full frozen comparison |
| 4. Prove adoption and teaching | Verify Plate; Plate Docs for affected prose | All runtime slices pass | Actual production imports and current docs pass native/package acceptance | Source-first types/lint, Plate usePath, focused browser cases, strict Plite and closure browser matrix |

For each runtime slice, place valuable behavior/cost assertions in existing
package proof owners. Do not commit disposable load transforms as production
code or create another target registry. Preserve baseline and final source
fingerprints. The production command above is the comparison entry; its receipt
identifies the preserved baseline and actual production source.

Run `pnpm turbo typecheck --filter=./packages/plitejs` and `pnpm lint:fix`
during implementation, inspecting changed files. Run `pnpm brl` if exported
files/exports change. Registry generation is inapplicable unless execution
changes registry source; then the `next` branch rule applies. Do not build
packages merely for source types or manually edit generated templates.
The completed planning activation needed no package checks; execution runs the
affected source-first checks and the strict closure commands below.

## Prove browser-owned behavior on the production path

| Scenario | Existing owner and entry | Pass predicate |
| --- | --- | --- |
| Structure followed by trusted typing | `apps/plite/tests/plite-browser/donor/examples/plaintext.test.ts`; `/examples/plite/plaintext` | Model/DOM/caret/focus agree and follow-up text lands once; extend its owned case with prefix insert/move |
| Named roots and repeated views | `donor/examples/multi-root-document.test.ts`; `/examples/plite/multi-root-document` | Exact DOM paths and selection in each view; unrelated roots survive; queued work retires |
| Native selection and projected paint | `donor/examples/visual-native-selection-smoke.test.ts` plus view-selection contracts | Activate, extend, clear and restore paint; preserve native selection/focus/input; inspect screenshots |
| Decorated typing and undo | `apps/www/tests/browser/runtime-read-regressions.spec.ts`; source-owned find/select-editor routes | Exact model/history/rendered values and following input match the existing oracle |
| Interaction timing | `apps/www/tests/browser/runtime-read-performance.spec.ts` and Benchmark targets | Matched production source and trusted first/settled input; distinct from jsdom timing |

Use `pnpm --filter plite test:plite-browser:chromium <file-or--grep>` for focused
Plite rows. Before architecture implementation closure, run `pnpm check:plite`
and `pnpm check:plite:browser-matrix`. Verify Plate chooses exact interactive
states and available Browser/Chrome controls; preserve serving-checkout identity.
Existing repository Playwright runners keep their automated role. Raw-device
and OS IME claims require the real device lane and are not made here.

The selection-source change retains the existing projected-selection owner;
it adds no controlled-selection API. During slice 3, preserve expanded and
collapsed paint, root/direction correctness, native-paint deduplication,
SSR/unmounted behavior, and no selection/focus/input/history/clipboard mutation
from source registration. Use two Editables over one editor and two independent
editors for the native lifetime proof.

## Watch three failure modes

1. Wrong entry/removal/replacement/root classification can suppress a selector
   wake or leave a dead DOM path. This reaches Plate usePath, DOM mapping,
   widgets and commit consumers. Compare every relevant operation with the
   before/after oracle, including retained commits and unknown keys.
2. Shared binding maps can let one view mutate another view's DOM. Filter
   exact element ownership, preserve disconnected cleanup, and test repeated
   roots and independent editors. Keep selection/text-sync ordering.
3. Conditional source lifetime can miss first paint, restore stale ranges, or
   leave delayed work after unmount. Prove active/clear/reactivation, late
   registration, pending native text, and remount behavior.

A local rollback reverts the incomplete owning slice while retaining evidence.
Do not ship parallel owners or compatibility switches. No public/data
migration needs rollback support. If a claimed production fix fails replay,
use Task's failed-fix/Regression routing before retrying.

External editor research and issue/PR provenance are inapplicable: current
local owners and matched execution answer this decision. No external message,
release, security record or public issue claim changes.

## Reconcile the source obligations

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Scope and authority | yes | Latest go accepts all four implementation slices; local edits/proof; branch next |
| Prior decision and law | yes | Reads review, root/Plite Vision and Task workflow |
| Public target | yes | Existing signatures retained; no new Best API call-shape decision |
| Scale, cohorts, budgets and guard | yes | Frozen contract and performance pack above |
| Identity, detector and privacy | yes | Source-bound runner, existing profiler, synthetic fixtures |

Work Checklist:
- [x] Capture latest scope, authority, outcome and owners. Source: Task workflow
  and Autogoal checklist retention.
- [x] Reuse and extend the accepted first-principles comparison. Consider
  deletion/merging before additions. Source: Plite Plan and root Vision.
- [x] Ground current source, public API/docs/exports and real consumers.
- [x] Resolve state versus mounted presentation, public shape, adoption,
  breaks and compatibility. No public contract change is selected.
- [x] Record concept decisions, dependency-ordered slices, failure modes and
  exact proof. Source: Plite Plan and Poteto multi-phase/prototype playbooks
  through the Codex adapter, using this one project plan.
- [x] Freeze and run Benchmark's embedded comparison; retain failed packets
  and change the next probe when evidence requires it.
- [x] Cover cold/mapped/warm/named roots, sparse/dense demand, repeated reads,
  pathological identity/lifecycle cases and active decoration demand.
- [x] Account for cache/DOM/render/subscription growth, heap observations,
  noise/percentiles, detector/privacy and degradation applicability.
  Source: performance pack and relevant Benchmark review leaves.
- [x] Name production reruns and exact native/package acceptance. No proxy
  certifies native, released or whole-editor performance.
- [x] Exclude unrequested PR/merge, schedules, checkouts, fixed panels,
  database and network work with the scope reasons above.
- [x] Verify final current/target contracts and reconcile source-bound receipts.
- [x] Apply Technical Writing's claim/literal/link preservation and audit the
  append-only Show Me Your Work trail against actual evidence.
- [x] Reconcile Plite Plan Ground/Decide/Prove, Conditional Work, Binary
  Readiness and Handoff; the performance pack; and Autogoal completion rules.
  Run the final checker.
- [x] Slice 1: implement commit-local membership and demand-specific root
  details; preserve identities/aggregates and add meaningful cost/behavior
  assertions in the existing metadata proof owner.
- [x] Slice 2: implement demand-gated selector routing and exact-view mounted
  DOM synchronization; prove callbacks, overrides, text-sync and retirement.
- [x] Slice 3: activate the built-in decoration source through existing
  selection presence and skip empty-manager queries; prove first paint,
  clear/reactivate, real sources, late registration and cleanup.
- [x] Replace the disposable target arm with actual production imports and
  rerun the same fixtures, cohorts, budgets and correctness guards. Preserve
  the original baseline and failed evidence. Source: Benchmark/performance pack.
- [x] Run source-first Plite types and lint; run affected Plate usePath proof.
  Source: root AGENTS.md and Verify Plate.
- [ ] Run the affected owned browser scenarios plus interactive source proof,
  then pnpm check:plite and pnpm check:plite:browser-matrix. Preserve source,
  serving-checkout, action/result and inspected visual evidence. Source: Verify
  Plate and its editor-proof reference; accepted browser table above.
- [x] Reconcile public teaching with the implementation through Plate Docs;
  preserve exports and generated owners. No public call change or new doctrine
  law is selected; route any discovered public change through Best API repair.
- [ ] Inspect the final diff, reconcile all governing source obligations,
  update evidence/trail/handoff and pass check-complete. Stop only owned servers.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve selected concepts and all decision-changing probes | All selected concepts resolved; final comparison and focused guards pass |
| Public adoption/doctrine | yes | Retain calls; update affected teaching during execution | No break or changed doctrine law |
| Pre-acceptance scale | yes | Pass cohorts, cold/follow-up budgets and correctness | 75 matched rows; no budget failures; operation, dispatch and lifecycle parity |
| Fresh source and behavior | yes | Bind loaded inputs and run focused current/target contracts | Production comparison effective inputs stable; 126 React and 22 metadata guards pass; whole-checkout freshness remains open |
| Production/native contract | yes | Run exact scenarios and strict closure commands | 158 focused package cases, 384 affected browser cases and interactive proof pass; full strict gates fail independently |
| Risk, detector and privacy | yes | Preserve failure modes and claim limits | Contract and risks above |
| Prose, trail and handoff | yes | Verify evidence pointers and prepare final result | Source/claim/link audit and append-only correction; final handoff below |
| P1 Autoreview | N/A | Do not run on next | Branch policy; no independent review claimed |
| Goal plan complete | yes | Run check-complete on this plan | Final checker receipt in the artifact directory |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Owners, laws, consumers and frozen contract | Decide |
| Decide | complete | Presence-based target and required consumer/lifetime cuts | Prove |
| Prove and hand off | complete | Final recorded comparison, focused guards and reconciled source obligations | Accepted-plan execution |
| Commit queries | complete | 22 metadata contracts; sparse cost guard fails on preserved baseline and passes on production | React demand |
| React routing and decoration lifetime | complete | 126 focused React contracts and all 75 production comparison rows pass | Browser closure |
| Production/browser closure | in_progress | Production comparison, source-first types/lint, 158 focused package and 384 affected browser cases pass; strict checkout gates fail independently | Resolve remaining gates |

Verification evidence:
- `run-probe.mjs`: 2 files/3 tests pass; 60 core and 15 mounted rows, 21 operation
  cases/549 key observations, 3 dispatch guards, and lifecycle parity.
- Current and target React guards: 122 tests each across selector context,
  runtime state, node refs, provider, decoration manager/rendering, view
  selection and focus lifecycle. Current commit metadata: 21 tests via
  `bun test ./packages/plitejs/test/commit-metadata-contract.ts`.
- All 1,743 comparison inputs match before/after. The later contract check
  finds one changed, unselected file, `test/snapshot-contract.ts`; it is not
  imported by the measured source or selected React/harness files. All
  measured production and harness inputs still match. The comparison itself
  has no source drift; `contracts-receipt.json` records the later difference.
- Technical Writing's review checklist was reconciled with concrete symbols,
  commands, counts, limits and links. The trail self-audit corrects one phrase:
  diagnostic evidence measured fewer aggregate builds, not fewer callbacks.
  No independent review ran.
- The preceding bullets describe the completed planning activation. Production
  and native evidence is recorded in the execution checkpoint below.
- Device/release and whole-app performance claims remain outside scope.

Error attempts:
| Attempt | Resolution |
| --- | --- |
| Split at the end of a one-character fixture produced no commit | Use an interior split in word N text |
| Generic span selector included Plite's own marker | Query the explicit probe marker |
| Initial target added cold work and retained eager consumers | Preserve initial/presence packets; use presence metadata and actual source lifetime |
| Async follow-up timing failed despite reduced deterministic work | Preserve activation/diagnostic packets; measure synchronous publication with the same budget |
| Immediate source-count assertion after unmount | Assert observer retirement and no later version update; destruction is queued |
| Wildcard selected archived probe files | Reject that final receipt; use an explicit two-file list and serialize writes |
| Source changed during otherwise passing comparison | Preserve the drift receipt and rerun; final comparison has no drift |
| Bun treated the metadata filename as a filter | Use the explicit `./packages/...` file path; 21 tests pass |
| Guessed paths or combined oversized reads | Resolve filenames first and narrow output; missing files prove nothing |
| Plan replacement patch format rejected | Write the complete owned plan once, then verify it |

Historical planning handoff:
The target is commit-owned presence-based path membership, demand-sensitive
React dispatch/DOM binding, and conditional built-in decoration work.
Public APIs remain unchanged. Implement the four slices and rerun the frozen
contract on production imports before native/package acceptance.
The final prototype passes 75 cohort rows and 122 existing React contracts per
arm. At 16,384 paragraphs/32 mounted watchers, path traversal is zero and
publication median falls from 160 ms to 55 ms. Execution order is commit,
React routing, decoration lifetime, then production/native proof and teaching.

Timeline:
- 2026-09-11: Continued the completed reads assessment as a Plite planning goal.
- Froze budgets, preserved failed probes, replaced the two-index reader, and
  found the default built-in decoration consumer.
- Proved mounted source activation and view isolation; added cold named-root,
  stress, source-drift and explicit-file checks.
- Final comparison and existing contracts pass; standalone planning is ready.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Accepted-plan implementation |
| What remains? | Required strict and browser closure gates |
| What changed? | Five runtime owners, existing contract files, one browser regression, current teaching and proof artifacts |
| What stays separate? | Planning evidence and production/native acceptance |

Open risks:
Production native input, selection geometry, projected paint and dense
input-to-paint performance remain execution risks. jsdom publication and heap
observations do not establish native behavior or retained heap after GC.
No release, physical-device or end-to-end speed claim is made.

Execution checkpoint:
- 2026-09-11: User accepted the four-slice implementation. Preserved seven
  original source files under the existing artifact directory's
  `production/baseline/`; baseline hashes are in `production/baseline.json`.
  A separate public-state change and an unselected snapshot test changed after
  planning. Both comparison arms use the same current public-state owner;
  all five implementation owners still match the approved prototype inputs.

Production execution evidence (2026-09-11):
- All five canonical runtime owners implement the accepted target. The private
  DOM sync helper accepts commit demand; public calls and exports are unchanged.
  Current documentation explains per-key path answers and aggregate reuse.
- `production/packet.json`: 75 paired cohort rows pass frozen budgets. Sparse
  16,384-paragraph/32-watcher publication is 157.04 ms baseline versus 50.79 ms
  production; follow-up is 1.30 versus 0.82 ms. Descendant path visits are
  32,768 versus zero; index calls are 65,556 versus 86. Both render 31 changed
  watchers and retain 32 elements. These remain jsdom publication measurements.
- `production/source-audit.json` accepts the original comparison after proving
  its only drift was an unselected, unimported Yjs test. Failed receipts are
  preserved. Subsequent changes to the runner affect receipt filtering only;
  no fixture, budget, arm implementation or measured production owner changed.
- `production/commit-green.log`: 22 metadata tests pass. The durable sparse
  cost guard fails on the preserved original owner (4,020 index calls versus
  a bound of 32); see `production/core-baseline-test.log`.
- `production/final-react-contracts.log` (67 tests) and
  `production/final-react-lifecycle.log` (59 tests): all 126 tests in eight
  affected owners pass. `production/plate-adoption.log`: 10 Plate path/selector
  cases pass. `production/typecheck.log` and `production/lint.log` pass.
- The attempted fast-suite profile excludes both foundation packages by
  `tooling/config/test-suites.mjs`. Its stale pre-existing JUnit summary is not
  evidence; use the actual package/Vitest durations above.
- `production/browser-focused.log`: 72 Chromium cases pass, one explicit
  pre-existing capability skip. The new named-root case proves prefix split,
  shifted node identity/path, trusted follow-up input, undo/caret and root
  isolation. Native selection smoke covers nine visible-selection scenarios.
- Interactive Browser proof uses owned PID 70651, cwd
  `/Users/zbeyens/git/plate-2/apps/plite`, port 3339, serving an immutable
  469-file snapshot of `apps/plite/out`. Build fingerprint:
  `dbbf7adc1d1d6d875e0965352494671baf5b172ae7a19dacdb41399fd7bc25a3`.
  `production/native-multi-root.png` shows correct roots and one native
  selection after prefix split, follow-up, undo and further input.
  `production/native-synced-selection.png` shows active selection after a
  structural edit updates both copies; the separate root is unchanged.
- Strict closure is still open. `production/strict-plite.log` stops at an
  unrelated implicit-any in `src/authored/authored.ts:1563`. The later
  `production/typecheck-closure-replay.log` confirms authored errors at lines
  1564 and 1575 after that source changed again. The implementation owners
  retain the passing earlier source-first typecheck.
  `production/package-tests.log` has 1,577 passing core cases and one bootstrap
  rollback failure in `src/create-editor.ts:296`;
  `production/bootstrap-baseline.log` reproduces that failure with the original
  commit owner. `production/runner-contracts.log` has three failures in
  unrelated authored/export allowlists, generated Turbo state and import smoke.
- The first matrix attempt hit a Firefox huge-document readiness timeout.
  `production/firefox-ready-replay.log` passes that exact case in isolation;
  the original failure is retained in `production/browser-matrix.log`.
  `production/browser-matrix-resume.log` then stops at unrelated example
  navigation metadata: 11 visible new-example markers versus 10 expected.
  The affected four-route matrix passes. No assertion or timeout was
  weakened; the full matrix is not reported as passing.
- Source-wide app freshness is no longer current because authored source is
  changing concurrently. The served immutable build contains the verified
  implementation owners; full current-checkout acceptance remains open.

Scope disposition:
- Keep the strict checkout gate open. The bootstrap failure reproduces before
  this implementation; authored exports/types and example marker inventories
  are outside the five selected runtime owners. No unrelated product changes
  or blanket proof waiver is included.
- After those owners settle, rebuild the app from current source, rerun
  `pnpm check:plite` and `pnpm check:plite:browser-matrix`, reconcile current
  fingerprints, and rerun the plan checker. Only then close the native goal.
- The source-first typecheck, lint, 22 metadata, 126 React and 10 Plate cases
  are completed proof. The comparison and interactive receipts bind the
  unchanged implementation to exact inputs; they do not certify a later
  whole-checkout state.

Current handoff (implementation):
All four implementation slices are present, including current teaching and
meaningful contract coverage. The production comparison passes all 75 frozen
rows; sparse mounted publication is 157.04 ms versus 50.79 ms with matching
outputs. The affected package total is 158 passing cases (22 metadata, 126
React, 10 Plate).

`production/affected-browser-matrix.log` passes 384 cases: Chromium 118,
Firefox 108, WebKit 115, mobile viewport 43. The 92 explicit skips are 1, 11,
4 and 76 respectively; mobile-WebKit has no applicable tests for these four
routes. These are scoped browser results, not a full matrix or raw-device
claim. Both native screenshots were visually inspected.

Final diff and source obligations were reconciled. No public API, export,
registry source, generated template, dependency or durable doctrine changed.
Barrel generation, registry generation, publication and Autoreview on next
remain inapplicable. No commits or pushes were made. The owned proof server
is stopped at handoff.

The two remaining checklist items intentionally stay open: passing the strict
whole-checkout gates and passing the final completion checker. The checker
correctly reports these as incomplete in `production/check-complete.log`.
Independent authored types, bootstrap rollback, export inventories and example
metadata failures prevent claiming completion. Preserve the goal and this
plan for the required current-source rerun after those owners settle.

Continuation audit (2026-09-11, second goal turn):
- The prior turn made implementation/proof progress. This turn revalidated
  current source and ran the independent package tasks that the initial core
  failure had prevented from starting.
- `production/typecheck-continuation.log`: all 93 source-first typecheck tasks
  pass after the concurrent authored type repair. The earlier type failures
  are historical evidence, not current blockers.
- `production/remaining-package-checks.log`: 150 of 154 tasks succeed using
  Turbo's continue mode; core, React and Yjs remain red. The React run passes
  1,320 of 1,325 cases before fixture repair. Core retains the same bootstrap
  failure; five failures are in the separate authored Yjs work.
- The two overlapping-selector fixtures overrode aggregate lists while leaving
  contradictory path membership from a real prefix-insertion commit. They
  expected an unchanged key that the membership query correctly marked moved.
  `test/react/provider-hooks-contract.tsx` now gives both public queries the
  same synthetic membership. Callback, deduplication, override and retirement
  assertions are unchanged. `production/provider-fixture-green.log` passes
  all 62 cases; `production/lint-provider-fixture.log` passes.
- `production/closure-baseline.config.mjs` substitutes all five preserved
  original owners while keeping current unrelated source and test fixtures.
  `production/closure-baseline-react.log` reproduces the other three React
  failures: two EditableText cases lack Plite context, and an inline-void
  insertion lacks the final empty-block line break. The selector fixture cases
  pass on that original implementation. No further runtime edit is justified
  by these independent failures.
- The focused total becomes 220 passing package cases, including the 62
  additional provider contracts. All five runtime owners still match the
  accepted performance and browser inputs; only the test fixture changed.
- `production/continuation-blockers.json` captures current blocker fingerprints.
  The example marker failure is grounded in current source: the visible
  `authored-changes` route is new, while the test's ten-item list omits it.
  The strict closure blocker has recurred on two goal turns; the goal remains
  active while independent required proof is completed.

Additional strict subgates completed:
- `production/benchmark-runner-contracts.log`: 25 cases in all nine benchmark
  contract files pass. `production/benchmark-targets-check.log`: all 51
  benchmark targets validate.
- `production/public-artifact-types.log`: all four required package builds
  and the public-package declaration typecheck pass. This build is the
  explicit artifact-facing gate in `check:plite:contracts`; it was not used
  to substitute for source-first checking.

Registry native closure evidence:
- Both named www proof files were executed. The initial runs on 127.0.0.1
  were invalid setup: Next blocked development scripts from that origin.
  `production/www-owned-server.log` identifies the requests. A fresh owned
  server on `localhost:3340`, with its own ignored build cache, hydrates and
  responds to the second-view control. No security setting was changed.
- `production/www-runtime-localhost.log`: all three find/select-editor
  correctness cases pass. All five typing cases pass their exact trusted-row
  checks and per-key DOM/paint limits, then fail the unchanged 373.4 ms burst
  budget (405.7–455.1 ms). Later assertions in those failed cases are not
  claimed as executed. Native burst performance remains unproven.
- `production/native-timing-find-demo.json` records a diagnostic replay of
  the same test and assertions with raw result capture only. Its 20 rows
  have DOM-ready p95 13.1 ms and paint p95 25.2 ms; no long tasks occur.
  The 503.6 ms elapsed total is 479.3 ms of serialized paint waits plus
  24.3 ms between each paint and the next key. The recorder explicitly
  awaits a double-animation-frame paint before submitting the next key;
  the test budgets one 16.67 ms frame per key plus 40 ms. This identifies
  pacing in the measurement, but does not establish baseline/target native
  performance parity or justify weakening the frozen gate. The diagnostic
  source is preserved in `production/native-timing-diagnostic-source.ts`;
  its temporary test-runner copy is removed.
- Interactive registry proof shows trusted NativeCheck input updates both
  mounted find views, retains focus in the first, and undo restores both.
  `production/native-registry-find.png` was inspected. No runtime warnings
  or errors were captured. The owned server PID 90597 is stopped at handoff;
  the pre-existing server on 3299 is untouched.
- Current passing scoped totals: 220 package cases, 25 benchmark-runner
  contracts, 387 browser correctness cases and 92 explicit browser skips;
  all 93 source typecheck tasks and built-package declaration checks pass.
  Remaining closure includes the independent bootstrap, three baseline React,
  authored Yjs, export inventory and example metadata failures, and unresolved
  native burst timing. The original complete objective remains open.

Third continuation audit (2026-09-11):
- The previous turn made progress: it repaired the overlapping-selector test
  fixtures, completed the source/artifact type gates, and added registry
  correctness and timing evidence. This turn revalidated the remaining blockers.
- All 13 implementation, test and teaching fingerprints still match the
  recorded receipts. All ten recorded independent blocker inputs are unchanged.
  The owned www proof server is no longer listening on port 3340.
- `production/third-turn-bootstrap.log` reproduces the same bootstrap rollback
  failure. `production/third-turn-contracts.log` passes 47 cases and reproduces
  the same three allowlist, generated Turbo and public-import failures.
- Native timing source and budgets are unchanged. Its failed burst gate remains
  open; no timing budget, test assertion or acceptance requirement is relaxed.
- The same strict closure blocker has persisted through three consecutive goal
  turns. The goal is blocked, not complete. Further closure requires changes
  to the independent failing owners and resolution of the native timing proof;
  repeating unchanged green checks cannot satisfy either requirement.
- `production/third-turn-audit.json` binds this disposition to current inputs.
  The two remaining checklist items and production/browser closure stay open.
  After the blockers are resolved, rebuild from current source and run the full
  original closure commands before completing the goal.
