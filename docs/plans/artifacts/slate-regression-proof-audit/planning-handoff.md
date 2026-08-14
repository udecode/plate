# Slate regression-proof planning handoff

## Decision

Accept one implementation candidate: recursive nested-array equality in Plite.
Do not create a Slate-delta mega plan. The other changed issues and PRs are
already covered, rejected as local API direction, or blocked behind exact
evidence gates.

This handoff is the required end of the editor audit. It is not an
implementation plan. After user acceptance, invoke the named owner for the
accepted packet and keep every deferred row closed until its trigger is true.

## Strongest local mechanisms to keep

| Mechanism | Matrix concept | Why it stays |
| --- | --- | --- |
| Typed transaction-owned regression contracts | `SLATE-FIXTURE-001` | Portable laws matter; Slate's JSX fixture runner does not replace local typed owners. |
| Async decoration caret/composition browser proof | `SLATE-DECORATION-001` | The current browser row covers #5987, #6033, and #6078. |
| Selected-element unmount safety | `SLATE-SELECTED-001` | Exact React proof covers #6053 and #6073. |
| `Intl.Segmenter` text-unit ownership | `SLATE-GRAPHEME-001` | Tamil and Devanagari deletion contracts cover #6074, including UAX #29 GB9c. |
| Nullable versus strict DOM resolution | `SLATE-DOM-RESOLVE-001` | Exact bridge proof covers #3556, #6072, and #6080 without a boolean-shaped API. |
| Transaction rollback for History | `PLITE-HISTORY-001` | Central rollback subsumes #6063's helper cleanup proposal. |
| Typed semantic commands | `PLITE-COMMAND-001` | Descriptor identity, handlers, decline, recursion, and transaction composition subsume #6091. |
| Explicit property removal | `SLATE-NODE-UNSET-001` | `nodes.set` and `nodes.unset` keep value and mutation semantics distinct. |
| Canonical mixed transactions | `SLATE-BATCHING-001` | Fresh proof publishes once and meets the registered median/p95 thresholds. |
| Selection-origin policy | `SLATE-SELECTION-ORIGIN-001` | Native import cannot overwrite authoritative model-owned selection, covering #6086. |
| Independent source/test/tracker cursors | `SLATE-PROVENANCE-001` | The fork audit remains evidence without impersonating upstream `main`. |

## Materially valuable change

| Priority | Packet | Matrix concept | Value | Planning owner | Dependent owner |
| --- | --- | --- | --- | --- | --- |
| P1 | `EQ-P1` recursive JSON-array equality | `SLATE-DEEP-ARRAY-001` | Fixes a real contradiction between Plite's JSON-native node model and identity-only array-member comparison | `plite-plan` | N/A |

The full current/proposed shape, deletion, adoption, and proof contract is in
the [material dossier](./material-dossiers.md#p1-recursive-json-array-equality).

## Rejected reference machinery

- PR #6083 null-as-delete: reject. Keep explicit `nodes.unset`; the
  [Best API review](./public-api-review.md#property-removal-pr-6083) closes the
  public-shape gate.
- PR #6091 editor augmentation: reject the reference shape and keep local
  semantic commands. The
  [Best API review](./public-api-review.md#semantic-commands-pr-6091) closes the
  public-shape gate.
- PR #6039 fork batching engine: reject as current authority. It is closed,
  unmerged, and tied to the recovered fork audit.
- PR #6050 mutable batching: do not plan from an unstable open implementation.
  Current Plite batching is healthy; reopen only from a stable, measured donor.
- Slate JSX fixture machinery: do not transplant it. Reuse portable behavior
  laws inside local proof owners.
- PointRef/RangeRef hyperscript values: do not add speculative test DSL surface
  before one selected Plite test needs it.

## Deferred evidence gates

| Gate | Threads | Current status | Trigger | Route after trigger |
| --- | --- | --- | --- | --- |
| `NATIVE-NOOP-REPRO` | #6084 | No exact Plite browser reproduction | Reproduce both upstream no-op `insertText` scenarios with model, DOM, selection, focus, trace, and follow-up typing | `patch` owns reproduction; use `plite-plan` only if the failure crosses runtime ownership |
| `RAW-MOBILE-IME` | #5130, #5974, #6096 | Firefox Android, emulated iPhone Chinese input, and empty-leaf Android IME remain raw-device claims | Produce real device/Appium-equivalent artifacts on the named browser/IME paths | `patch`/raw-device proof first; `plite-plan` only from a captured substrate failure |
| `TYPE-SPLIT` | #6003 | One open 167-file PR mixes unrelated type work | Split into one public import/call/type/owner per row | `best-api review` per atomic row |
| `BATCHING-REOPEN` | #6039, #6050 | Local transaction benchmark passes; donor implementations are closed-unmerged or open | A stable donor plus fair equivalent-workload benchmark beats current Plite while preserving transaction laws | `performance`, then `editor-audit sync`; `plite-plan` only for an accepted architecture change |
| `HYPERSCRIPT-DEMAND` | #6065 | Useful fixture ergonomics with no current local consumer | A selected Plite test cannot express a live ref invariant cleanly | Plite hyperscript package owner; no layer plan unless public test API is proposed |
| `PLATE-UI-QUEUE` | #6087 | Plate toolbar product request filed in Slate | Plate UI owner selects the product work | `plate-ui`; use `plate-plan` only for a real cross-package API boundary |

These are terminal evidence-backed defers for this audit. They are not hidden
implementation tasks.

## Exact matrix conclusion

The strict matrix has 16 concepts and 16 rows.

- Origins: reference 6 (`SLATE-FIXTURE-001`, `SLATE-DEEP-ARRAY-001`,
  `SLATE-HYPERSCRIPT-REF-001`, `SLATE-NATIVE-NOOP-001`,
  `SLATE-MOBILE-IME-001`, `SLATE-ANDROID-IME-001`); Plite 2
  (`PLITE-HISTORY-001`, `PLITE-COMMAND-001`); shared 8
  (`SLATE-DECORATION-001`, `SLATE-SELECTED-001`, `SLATE-GRAPHEME-001`,
  `SLATE-DOM-RESOLVE-001`, `SLATE-NODE-UNSET-001`, `SLATE-BATCHING-001`,
  `SLATE-SELECTION-ORIGIN-001`, `SLATE-PROVENANCE-001`).
- Classifications: reference stronger 2 (`SLATE-DEEP-ARRAY-001`,
  `SLATE-HYPERSCRIPT-REF-001`); Plite stronger 5 (`PLITE-HISTORY-001`,
  `PLITE-COMMAND-001`, `SLATE-NODE-UNSET-001`, `SLATE-BATCHING-001`,
  `SLATE-SELECTION-ORIGIN-001`); equivalent 4 (`SLATE-DECORATION-001`,
  `SLATE-SELECTED-001`, `SLATE-GRAPHEME-001`, `SLATE-DOM-RESOLVE-001`);
  different tradeoff 2 (`SLATE-FIXTURE-001`, `SLATE-PROVENANCE-001`);
  insufficient evidence 3 (`SLATE-NATIVE-NOOP-001`, `SLATE-MOBILE-IME-001`,
  `SLATE-ANDROID-IME-001`).
- Preferred bases: reference 2 (`SLATE-DEEP-ARRAY-001`,
  `SLATE-HYPERSCRIPT-REF-001`); Plite 5 (`PLITE-HISTORY-001`,
  `PLITE-COMMAND-001`, `SLATE-NODE-UNSET-001`, `SLATE-BATCHING-001`,
  `SLATE-SELECTION-ORIGIN-001`); tie 4 (`SLATE-DECORATION-001`,
  `SLATE-SELECTED-001`, `SLATE-GRAPHEME-001`, `SLATE-DOM-RESOLVE-001`);
  different tradeoff 2 (`SLATE-FIXTURE-001`, `SLATE-PROVENANCE-001`);
  insufficient evidence 3 (`SLATE-NATIVE-NOOP-001`, `SLATE-MOBILE-IME-001`,
  `SLATE-ANDROID-IME-001`).
- Reference adaptations: adapt 1 (`SLATE-DEEP-ARRAY-001`); keep-local 8
  (`SLATE-FIXTURE-001`, `SLATE-DECORATION-001`, `SLATE-SELECTED-001`,
  `SLATE-GRAPHEME-001`, `SLATE-DOM-RESOLVE-001`, `PLITE-HISTORY-001`,
  `SLATE-SELECTION-ORIGIN-001`, `SLATE-PROVENANCE-001`); reject 2
  (`PLITE-COMMAND-001`, `SLATE-NODE-UNSET-001`); defer 5
  (`SLATE-BATCHING-001`, `SLATE-HYPERSCRIPT-REF-001`,
  `SLATE-NATIVE-NOOP-001`, `SLATE-MOBILE-IME-001`,
  `SLATE-ANDROID-IME-001`).
- Local debt: material 1 (`SLATE-DEEP-ARRAY-001`); non-material 1
  (`SLATE-HYPERSCRIPT-REF-001`); none 11 (`SLATE-FIXTURE-001`,
  `SLATE-DECORATION-001`, `SLATE-SELECTED-001`, `SLATE-GRAPHEME-001`,
  `SLATE-DOM-RESOLVE-001`, `PLITE-HISTORY-001`, `PLITE-COMMAND-001`,
  `SLATE-NODE-UNSET-001`, `SLATE-BATCHING-001`,
  `SLATE-SELECTION-ORIGIN-001`, `SLATE-PROVENANCE-001`); insufficient
  evidence 3 (`SLATE-NATIVE-NOOP-001`, `SLATE-MOBILE-IME-001`,
  `SLATE-ANDROID-IME-001`).
- Proof adaptations: adapt 1 (`SLATE-DEEP-ARRAY-001`); keep-local 11
  (`SLATE-FIXTURE-001`, `SLATE-DECORATION-001`, `SLATE-SELECTED-001`,
  `SLATE-GRAPHEME-001`, `SLATE-DOM-RESOLVE-001`, `PLITE-HISTORY-001`,
  `PLITE-COMMAND-001`, `SLATE-NODE-UNSET-001`, `SLATE-BATCHING-001`,
  `SLATE-SELECTION-ORIGIN-001`, `SLATE-PROVENANCE-001`); defer 4
  (`SLATE-HYPERSCRIPT-REF-001`, `SLATE-NATIVE-NOOP-001`,
  `SLATE-MOBILE-IME-001`, `SLATE-ANDROID-IME-001`).
- Prior candidates: supersede 1 (`LEGACY-SLATE-1120` on
  `SLATE-PROVENANCE-001`); reaffirm 0; reject 0.
- Verdicts: keep 10 (`SLATE-FIXTURE-001`, `SLATE-DECORATION-001`,
  `SLATE-SELECTED-001`, `SLATE-GRAPHEME-001`, `SLATE-DOM-RESOLVE-001`,
  `PLITE-HISTORY-001`, `PLITE-COMMAND-001`, `SLATE-BATCHING-001`,
  `SLATE-SELECTION-ORIGIN-001`, `SLATE-PROVENANCE-001`); rearchitect 1
  (`SLATE-DEEP-ARRAY-001`); reject 1 (`SLATE-NODE-UNSET-001`); defer 4
  (`SLATE-HYPERSCRIPT-REF-001`, `SLATE-NATIVE-NOOP-001`,
  `SLATE-MOBILE-IME-001`, `SLATE-ANDROID-IME-001`).
- Priorities: P1 1 (`SLATE-DEEP-ARRAY-001`); P0/P2/P3 0; unranked 15.
- Integrity: duplicate, grouped, missing, unknown, canned, and unresolved rows
  are all zero.

## Tracker-to-plan closure

The 23 non-skip delta rows have one terminal route each:

| Thread | Terminal route | Concept or gate | Decision |
| --- | --- | --- | --- |
| #3556 | keep-local | `SLATE-DOM-RESOLVE-001` | Keep nullable/strict resolver contract. |
| #5130 | defer | `RAW-MOBILE-IME` | Real Firefox Android predictive-typing proof required. |
| #5974 | defer | `RAW-MOBILE-IME` | Closed emulator report does not prove current iPhone composition behavior. |
| #5987 | keep-local | `SLATE-DECORATION-001` | Keep async-decoration browser row. |
| #6003 | defer | `TYPE-SPLIT` | Split the broad type PR before Best API review. |
| #6033 | keep-local | `SLATE-DECORATION-001` | Exact local caret proof exists. |
| #6039 | defer-reference / keep-local | `BATCHING-REOPEN` | Fork engine is not upstream law; current transaction proof passes. |
| #6050 | defer-reference / keep-local | `BATCHING-REOPEN` | Open mutable proposal lacks stable comparative proof. |
| #6053 | keep-local | `SLATE-SELECTED-001` | Exact removal/unmount proof exists. |
| #6063 | keep-local | `PLITE-HISTORY-001` | Central transaction rollback subsumes helper cleanup. |
| #6065 | defer | `HYPERSCRIPT-DEMAND` | No current test consumer earns ref-valued hyperscript surface. |
| #6072 | keep-local | `SLATE-DOM-RESOLVE-001` | Nullable/strict resolver law covers suppress-throw propagation. |
| #6073 | keep-local | `SLATE-SELECTED-001` | Exact removal/unmount proof exists. |
| #6074 | keep-local | `SLATE-GRAPHEME-001` | Tamil and Devanagari GB9c deletion proof exists. |
| #6078 | keep-local | `SLATE-DECORATION-001` | Existing browser row covers Firefox rerender safety. |
| #6080 | keep-local | `SLATE-DOM-RESOLVE-001` | Recoverable beforeinput range lookup is covered. |
| #6083 | reject-reference | `SLATE-NODE-UNSET-001` | Keep explicit unset; reject null-as-delete. |
| #6084 | defer | `NATIVE-NOOP-REPRO` | Reproduce two open-PR browser scenarios before design. |
| #6086 | keep-local | `SLATE-SELECTION-ORIGIN-001` | Exact origin/import-policy proof exists. |
| #6087 | defer | `PLATE-UI-QUEUE` | Plate product request is outside the Slate substrate audit. |
| #6091 | keep-local / reject-reference | `PLITE-COMMAND-001` | Keep semantic commands; reject editor augmentation. |
| #6092 | accepted P1 packet | `EQ-P1` | Plan recursive nested-array equality. |
| #6096 | defer | `RAW-MOBILE-IME` | Real Android empty-leaf IME proof required. |

Terminal route counts: 12 keep-local, 1 reject-reference, 1 accepted P1 packet,
and 9 evidence-backed defers. The keep count includes #6091, whose donor API
shape is separately rejected.

The 31 inspected `invalid-skip` rows remain in the denominator:

`#5801`, `#5869`, `#6025`, `#6031`, `#6032`, `#6037`, `#6041`, `#6049`,
`#6057`, `#6058`, `#6060`, `#6062`, `#6066`, `#6067`, `#6068`, `#6069`,
`#6070`, `#6071`, `#6075`, `#6076`, `#6077`, `#6079`, `#6081`, `#6082`,
`#6085`, `#6088`, `#6089`, `#6090`, `#6093`, `#6094`, and `#6095`.

Their ledger classifications are dependency/security, tooling, formatting,
docs, or release work with no portable editor-behavior contract.

## Accepted shape and invariants

The only accepted proposed shape keeps `TextApi.equals` unchanged and replaces
identity-only array member comparison inside the private equality owner with
recursive JSON-value comparison.

Non-negotiable invariants:

- arrays compare length, order, and every nested JSON value recursively;
- objects keep missing-key-equals-explicit-`undefined` behavior;
- array and object values never compare equal by indexed properties;
- the utility remains private; `TextApi.equals` remains the public observer;
- no dependency, mode, option, or compatibility path is added;
- shallow equality stays healthy enough for the text/leaf hot path;
- public types, serialized values, history, collaboration, and Plate APIs do
  not change.

## Dependency-ordered packet list

1. User accepts or rejects `EQ-P1`.
2. If accepted, invoke `plite-plan` for exactly
   `SLATE-DEEP-ARRAY-001`, using the linked material dossier as the target.
3. That layer plan may route execution to `patch` plus `tdd`; it must retain
   the public call shape, JSON laws, property/fuzz proof, and benchmark budget.
4. Run focused Plite proof and the affected development gate before broader
   closure.
5. Stop. Do not bundle any deferred gate into the equality packet.

No dependent Plate plan exists. No other P0-P3 packet is accepted.

## Coverage closure

- Registered Slate source: clean `../slate-audit` `main` at
  `ec793483ada7f7e21ebc82c2b3aa9ea674605ce3`, upstream `origin/main`.
- Test inventory: 1,136 files, 1,093 runnable rows, 1,254 test identities,
  zero unresolved.
- Tracker delta: 54 rows, 23 relevant routes, 31 inspected skips, zero
  unchecked.
- Strict architecture matrix: 16 expected concepts, 16 rows, one P1, zero
  integrity errors.
- Best API: #6083 and #6091 closed as keep-local/reject-reference; #6003 closed
  as non-atomic defer.
- Planning routes: one accepted packet, six explicit deferred gate families,
  zero unowned rows.

## Acceptance boundary

The audit is decision-ready. Accepting this handoff authorizes the named
`plite-plan` packet only when the user explicitly says to proceed. It does not
authorize implementation, a PR, a layer plan for deferred rows, or public
GitHub mutation.
