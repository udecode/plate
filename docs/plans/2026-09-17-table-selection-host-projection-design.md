---
review_scopes: [table]
review_basis: [2026-09-17-table-host-delivery-benchmark-closure]
work_kind: implementation
---

# Table selection host projection design

Status: Implemented and verified. `TablePlugin` owns one private view projection
and direct canonical cell-host binding; the public painter hook and copied
row/table overlay owner are deleted.

## 2026-09-18 repair cleanup

Repair outcome: Complete locally. Removed the controller deletion guard, identity check,
reattachment lookup and separate reset/disposal routine. The WeakMap retains one
controller per editor; ref cleanup releases detached hosts, and effect cleanup
reuses the ordinary selection update with an empty selection. Strict Mode can
replay both owners without stranding refs in a deleted controller.

The earlier command/model selection bridge is necessary independently of the
Strict Mode bug. Deleting its model fallback and subscribing only to either the
mounted view or command editor made both imperative row/table and cell-selection
cases fail with zero painted cells in the full EditorKit fixture. Those two
deletion experiments were rejected; the existing interaction tests are retained.
No debugging logs or temporary screenshot calls remain in product/test source.

Final implementation review accepts the existing private owner and the reduced
lifecycle: no new subscription, timer, observer, public API or controller
replacement protocol. The existing Strict Mode test still covers same-key host
replacement and unmount paint/caret cleanup. Autoreview was not run on `next`.

Final proof:

- `pnpm --filter platejs test:partition:table-react`: 37 passed.
- `bun test apps/www/src/registry/components/editor/table-node-selection.spec.tsx`:
  3 passed, including both imperative and mounted row-control selection.
- Table React partition typecheck, lint/formatting and targeted diff checks pass.
- Source server: `PLATE_WWW_PLITE=1 PLATE_WWW_DEV_SOURCE=1 pnpm --filter www exec next dev -p 3001`
  from this checkout. The four existing Chromium cases for exact cell paint,
  row-handle selection, held cross-cell drag and drag-back contraction pass with
  zero retries against that server on the final source.
- Actual Chrome `/blocks/table-demo?proof=cleanup`: physical text drag from
  `Plugin` into `Element`; held native text `ugin\nEl`, exactly two painted cells;
  after mouse release both cells stay painted, native range count is zero and
  editor focus remains. The inspected [final screenshot](artifacts/2026-09-18-table-repair-cleanup/c1-c2-final.png)
  shows the blue overlay on exactly those two cells. Final
  [source fingerprints](artifacts/2026-09-18-table-repair-cleanup/final-source.sha256)
  bind this proof to the reduced implementation.

Objective:

Delete the table-specific DOM painter and duplicate row/table highlight context.
Keep table projection in Plate, bind transient selection state through canonical
cell host refs, and preserve the public `render.useViewElementAttributes`
contract. Add no public selection, registry, scalar-host or Plite runtime API.

Completion threshold:

A settled ownership/API target, executable semantic and matched scale evidence,
production adoption across framework hosts and copied UI, current documentation,
native proof, doctrine repair and ledger closure.

Verification surface:

Plate table readers, React interactions, copied UI, Plite selection/root
projection, Plate rendered attributes and element hosts; source-first owner
comparison, production Chromium packets and native browser cases.

Constraints:

- Product implementation and proof are authorized in the current checkout.
- Keep one canonical selection. No new table selection kind, selected-cell
  state, public grid/controller, host registry, resize API or selection verb.
- Preserve the current React-delivered semantics of
  `render.useViewElementAttributes` unless a deliberate public redesign replaces
  them. A separate scalar host-attribute channel is a candidate, not an accepted
  API.
- Table topology stays in Plate. Plite owns canonical selection, mapping,
  transactions, history and view/root scoping.
- Current `next` checkout; no publication or Autoreview.
- Existing upstream research remains reference evidence. No new external
  discovery or third-party code adoption is needed for the local findings.

Boundaries:

Selection semantics and host delivery are in scope. Resize math, pointer
sessions, hit targets, keyboard resizing, codecs and mutation algorithms retain
their previous independent dispositions. A generic renderer change must adopt
its affected consumers; it does not authorize unrelated AI/navigation redesign.

Blocked condition:

No missing user decision or access. A final probe failure reopens its design
gate. A production/browser failure during execution blocks deletion and closure;
it does not create another approval requirement.

## Final benchmark closure

**Verdict: select the table-specific host binder.** Plate owns table geometry
and one private selection projection per mounted view. `TablePlugin` composes a
private ref into each canonical `TableCellPlugin` host and updates only affected
hosts. The public `render.useViewElementAttributes` callback retains its complete
React-delivered `className`, `style`, `placeholder`, `data-*` and `aria-*`
semantics.

The repaired painter, table binder and explicit scalar channel were measured in
30 no-GC owner packets per cohort. The binder passes every frozen action budget,
causes zero selection-time cell renders and table scans, and wins the 32-table
fanout row at 2.18ms p95 versus 8.89ms painter and 2.77ms scalar. The generic
channel provides no independent job and therefore does not earn a public API.

Fresh production Chromium packets against the final copied UI pass every paint
and mount budget. Selection p95 is 17.9ms, 210.6ms and 1819.6ms for normal,
large and stress versus 18.4ms, 218.8ms and 2537.5ms baseline. Mount packet-p95
is 28.4ms, 459.2ms and 1817.0ms versus 25.3ms, 392.6ms and 1871.3ms baseline.
The stress mount comparison uses ten fresh-browser packets after the original
five-packet candidate landed near its limit; all ten final-source pairs pass.
Raw mount samples were not serialized, so mount claims are distributions of
per-process packet p95 values rather than one combined raw-sample percentile.

Custom cell components participate through their existing contract: forward
`props.attributes`, including its composed ref, exactly once to the canonical
`<td>` or `<th>`. Same-key host replacement, detach, unmount cleanup and caret
restoration are covered. Multiple simultaneous hosts for one node key in one
view remain outside the contract. No physical-device claim is made.

## Correction to the prior direction

Exact node membership cannot replace the current table painter's complete job:

| Job | Live source | Required distinction |
| --- | --- | --- |
| Paint a held native drag | [TablePlugin](../../packages/platejs/src/react/features/table/TablePlugin.tsx), [browser cases](../../apps/www/tests/browser/table-selection.spec.ts) | Paint precedes the mouse-up conversion from text range to nodes. |
| Close ranges over merged spans | [selection projection](../../packages/platejs/src/features/table/lib/internal/selection.ts) | Plite cannot infer table span policy. Eager conversion changes the interaction. |
| Row-handle/post-drop paint | [copied table controls](../../apps/www/src/registry/components/editor/table.tsx) | These production callers intentionally write ordinary ranges. |
| Exact row/table paint | [selection helper](../../packages/platejs/src/features/table/lib/internal/selection.ts), [UI tests](../../apps/www/src/registry/components/editor/table-node-selection.spec.tsx) | Canonical row/table membership expands to affected cells for presentation. |
| Sparse cell membership | [NodeSelection](../../packages/plitejs/src/interfaces/selection.ts) | A diagonal selection must remain sparse, not become its bounding rectangle. |

The justified cut is the table-specific DOM map, scans, public consumer hook
and duplicate copied row/table highlight context. The
private table projection must survive. Generic Plite selected/anchor markers
have no independently established job in this tranche. Existing Plite native
selection clearing and projected-selection caret ownership remain authoritative.

## Ready correctness tranche

### Canonical table reads

The actual current baseline paints four cells for an exact two-cell diagonal.
The failure is preserved in
[failed-exact-membership.log](artifacts/2026-09-17-table-host-projection/failed-exact-membership.log).
The helper understands exact nodes, but callers supply `state.selection()` or
`tx.selection()`, which are text-range projections.

Use the snapshot already acquired by the private helper:

```ts
const snapshot = state.runtime.snapshot();
const requested = at ?? snapshot.selection;
```

Remove redundant implicit `selection` plumbing in `BaseTablePlugin` and
`TablePlugin`. Preserve genuine explicit `at` inputs; inspect implicit inputs
disguised as `at: state.selection()`, including insert-text handling. Do not add
a public getter or compensate with global editor selection.

The snapshot preserves exact membership and active transaction draft changes.
Keep the transaction cache bypass: draft selection may change without a version
change. Keep selection/root identity in the cache. A scoped null stays null.
Verify sparse copy/delete/merge policy as well as paint-facing reads.

### Authored view/root filtering

[withRootRuntime](../../packages/plitejs/src/editor-runtime-view.ts) reads
`getCurrentSelectionRoot(editor)` after `withRootRead` has restored the prior
authored context. Its snapshot and root discriminator can describe different
views. The existing internal runtime `getSnapshot` scopes both reads together;
align the state-runtime wrapper with it.

The same-model authored/named-root fixture reproduces this: zero cells instead
of four, preserved in `authored-root-failure.log`. Using the existing correct
private runtime getter passes the fixture. Repair the public state-runtime
wrapper to match that scope; do not add a table fallback. The repair adds no
state, cache, subscription or API. Retained fragments keep null selection.

## Provisional semantic projection

Reuse `render.useViewElementAttributes({ view })`, once per enabled plugin and
mounted view. TablePlugin consumes the private projection's existing cell keys;
do not discard them through a public conversion and reopen a read per cell.
Return sparse entries using shared literal payloads:
`data-table-cell-selected="true"` and a live-range anchor's
`data-editor-table-cell-anchor=""`. These are presentation, never document state.

| Canonical input | Paint projection | Caret marker |
| --- | --- | --- |
| Expanded text range across cells | Existing span closure; preserve endpoints/offsets | Anchor cell only |
| Collapsed or one-cell text range | No structural cell paint | None |
| Exact cells, including one cell or sparse diagonals | Exact membership | None; Plite owns native range clearing |
| Exact row/table | Its actual cell hosts | None |
| Nodes across tables, mixed with paragraphs | Partition table/row/cell paths by table; reuse the reader per group; ignore other blocks; deduplicate keys | None |
| Null, wrong root, inactive authored projection, retained fragment | No paint in that view | None |

The public table selection read stays a single-table command context. Multi-table
paint does not justify a multi-table mutation API. Resolve configured plugin
schema types and exact-view keys. Nested tables respect their owning table;
selecting an outer cell does not independently mark its inner table's cells.

The selected binder computes one immutable `{ anchorKey, selectedKeys }`
projection in `TablePlugin` for the mounted view. Equality is by anchor and
ordered keys, so unrelated editor updates do not publish another host update.
Each update visits only the union of previous and current selected keys. It sets
`data-table-cell-selected` and hides the anchor caret without querying tables or
rerendering cell components.

`TablePlugin.extend` targets `TableCellPlugin` and contributes one pure composed
ref through `inject.nodeProps.transformProps`. Attachment paints the latest
projection immediately. React ref cleanup clears the old host before same-key
replacement, detach or unmount; the view effect resets the selection paint
without destroying ref-owned bindings.
The map deliberately stores one canonical host per key per view. A custom cell
must forward the supplied attributes/ref to exactly one canonical host.

The binder is private and feature-owned. It adds no public selection hook,
attribute source, host registry, store or Plite marker. Existing
`render.useViewElementAttributes` producers keep complete React snapshots and
precedence. Server output contains ordinary base props; the transient table
marker is attached after the mounted host commits and never enters serialized
document data.

## Consumer adoption

Applications install the ordinary table plugins. `TablePlugin` mounts the
selection projection automatically; table renderers no longer call a public
painter hook. A custom `TableCellPlugin` component forwards `props.attributes`,
including its ref, exactly once to one canonical `<td>` or `<th>`. The table
renderer retains its own table ref only for resize and layout.

The copied table UI uses the cell marker as its sole structural selection layer.
`TableNodeSelectionContext` and per-cell overlay nodes are deleted; ranges,
exact cells, rows and whole tables all project to the same cell hosts. Native
text-selection suppression, controls and generic block-highlight suppression
retain their separate UI jobs.

No generic renderer migration follows. Other `render.useViewElementAttributes`
producers and custom element components continue receiving their complete merged
React props. No raw-host census, AI preview rewrite or Plite API is required by
the selected private binder.

## Executable comparison

The frozen contract and final receipts live under
[`artifacts/2026-09-17-table-host-delivery-benchmark`](artifacts/2026-09-17-table-host-delivery-benchmark/).
Every lane uses the same checkout, fixture, action, browser, viewport and lockfile
with exact source hashes. No explicit garbage collection runs.

The owner probe keeps editors mounted across 30 interleaved packets and 360
actions per lane/cohort. It compares the repaired painter, a table binder and an
explicit scalar host channel. All binder cohorts pass the frozen relative and
absolute budgets:

| Cohort (tables×rows×columns) | Painter p95 | Scalar p95 | Binder p95 | Binder result |
| --- | ---: | ---: | ---: | --- |
| normal (1×4×4) | 1.22ms | 1.09ms | 0.94ms | pass |
| large (1×25×20) | 9.78ms | 7.84ms | 11.48ms | pass, 11.78ms limit |
| stress (1×50×40) | 91.02ms | 53.24ms | 61.04ms | pass, 100ms cap |
| fanout (32×2×4) | 8.89ms | 2.77ms | 2.18ms | pass, fastest |

Production Chromium uses five fresh-browser packets per selection cohort and per
normal/large mount cohort. Stress mount expands to ten matched packets under the
frozen noise rule. Selection aggregates 110 raw selection-to-next-paint samples
per cohort. Mount compares packet-p95 distributions because the repaired harness
did not serialize raw remount samples.

| Cohort | Painter selection p95 | Binder selection p95 | Painter mount packet-p95 | Binder mount packet-p95 |
| --- | ---: | ---: | ---: | ---: |
| normal | 18.4ms | 17.9ms | 25.3ms | 28.4ms |
| large | 218.8ms | 210.6ms | 392.6ms | 459.2ms |
| stress | 2537.5ms | 1819.6ms | 1871.3ms | 1817.0ms |

Every production row passes the frozen baseline-relative budget. Final Chromium
native proof passes 14/14 table selection, subscription, clipboard, resize,
undo/redo and deferred large-layout cases. The focused host test proves zero
selection-induced cell renders, same-key `td` to `th` replacement, old-host
cleanup, unmount cleanup and caret restoration.

The production Profiler originally returned no mount samples, so the harness now
measures wall-clock remount to second paint. The first 30-packet owner run also
exposed a hard-coded 180-sample assertion; it was parameterized before the exact
rerun. Failed and superseded packets remain in the artifact directory and are
not used as final-source evidence.

## Decisions and adoption

| Surface | Owner/target | Verdict |
| --- | --- | --- |
| Implicit selection input | Existing canonical table snapshot; explicit targets unchanged | adopted |
| Authored root discriminator | Existing Plite view wrapper, snapshot/root read scoped together | adopted |
| Table range/span/exact-node projection | One private `TablePlugin` projection per mounted view | adopted |
| Host delivery | Feature-private canonical cell refs and affected-key writes | adopted |
| `render.useViewElementAttributes` | Complete sparse attributes continue through React props | retain unchanged |
| Generic scalar host channel, Plite markers or public table selection verb | No independent job after the private binder passes | reject |
| Public painter hook and copied row/table overlay context | Duplicate owners | delete |
| Resize | Current math, pointer and commit owners | retain; independent scope |

| Slice | Final outcome | Proof |
| --- | --- | --- |
| 1. Canonical reads | Existing table snapshot is the implicit owner | Sparse, explicit, draft, navigation, clipboard and mutation coverage |
| 2. Exact authored roots | Plite scopes snapshots and roots together | Authored/named-root contracts from the earlier adopted tranche |
| 3. Host delivery | `TablePlugin` owns one projection and direct canonical cell binding | 30-packet three-lane owner probe and focused lifecycle test |
| 4. Table hard cut | Public painter, copied row/table overlay context and duplicate overlay nodes deleted | Final production packets plus 14 Chromium cases |
| 5. Teaching and closure | Exports, docs, registry output, doctrine v206 and ledger agree | Barrels, registry generation, source audits and plan validators |

## Execution proof

Production acceptance preserves:

| Case | Verified outcome |
| --- | --- |
| Held drag | Native range grows, reverses and contracts; one-cell return clears structural paint |
| Text range/spans | Canonical endpoints, offsets, span closure and post-drop paint remain table-owned |
| Exact nodes | Sparse cells stay sparse; rows and tables expand to their own cells; mixed blocks do not leak |
| Nested tables | One semantic cell layer paints; copied ancestor overlay propagation is deleted |
| Replacement | Same-key `td` to `th`, old-host cleanup, unmount cleanup and caret restoration pass |
| Exact views | Projection binds to the mounted view editor and disposes per view |
| Native result | Structural paint, native highlight suppression, follow-up focus and resize interaction pass in Chromium |
| Generic consumers | Existing `render.useViewElementAttributes` React props remain unchanged |

The final browser command is:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 \
  pnpm --filter www test:www-browser:chromium \
  tests/browser/table-selection.spec.ts \
  tests/browser/table-element-subscriptions.spec.ts \
  tests/browser/table-resize.spec.ts
```

It passes 14/14 against a fresh production build. Focused package and copied-UI
tests cover the canonical host contract and sole selection layer. Broad table
partition typecheck remains blocked by unrelated authored TS6307 project-file
list errors; filtered output contains no changed table file. No physical-device,
publication or release claim is made.

Start Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Scope and authority | yes | implementation and proof authorized in the current `next` checkout |
| Current jobs and owners | yes | table projection stays in Plate; mounted host identity stays in the view runtime |
| Scale | yes | matched owner and production normal/large/stress/fanout evidence |
| Hard-cut counterfactual | yes | painter, public hook and copied overlay owner deleted; generic channel rejected |

Work Checklist:

- [x] Reconcile range, sparse/mixed-node and exact-view jobs.
- [x] Preserve canonical-selection and authored-root repairs.
- [x] Settle host delivery without changing public React attribute semantics.
- [x] Compare painter, private binder and scalar channel under frozen budgets.
- [x] Adopt one cell layer in package code and copied UI.
- [x] Prove replacement, cleanup, native behavior and production scale.
- [x] Repair docs, doctrine, exports, generated registry output and ledger state.
- [x] Preserve independent resize scope and prior review evidence.

Completion Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Full design/adoption target | yes | private `TablePlugin` binder adopted; public callback unchanged |
| Pre-acceptance comparison | yes | all owner-probe cohorts pass without forced GC |
| Product/native adoption | yes | final Chromium budgets pass; native suite 14/14 |
| Review/plan checks | yes | benchmark plan, review ledger and Autogoal validators close the task |
| Publication/Autoreview | N/A | no publication authority; Autoreview is prohibited on `next` |

Verification evidence:

- `artifacts/2026-09-17-table-host-delivery-benchmark/owner-probe-results.json`
- `artifacts/2026-09-17-table-host-delivery-benchmark/browser-comparison.json`
- `artifacts/2026-09-17-table-host-delivery-benchmark/final-comparison.json`
- `TablePlugin.hostBinding.spec.tsx`: 1 pass, 15 expectations
- copied table node-selection spec: 2 pass, 7 expectations
- final Chromium table matrix: 14 pass
- final `pnpm build:www:ci`: pass

Open risks:

The host map intentionally assumes one canonical host per node key in one mounted
view. Custom cells that omit or duplicate `props.attributes.ref` violate the
component contract. Mount timing is reported as packet-p95 distributions because
raw remount samples were not serialized. Broad package typecheck retains the
unrelated TS6307 blocker, and no physical-device claim follows from Chromium.

Next action:

No table host-delivery work remains. Treat resize ergonomics, physical-device
coverage and unrelated table mutation policy as independent future scopes.
