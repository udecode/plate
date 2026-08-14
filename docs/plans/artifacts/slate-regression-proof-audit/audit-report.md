# Slate regression-proof audit repair

## Verdict

Slate is registered against upstream `main` at `ec793483ada7f7e21ebc82c2b3aa9ea674605ce3`. The audit has independent source, test, tracker, and planning authority: a strict 16-row regression-proof concept matrix, a complete 1,136-file test inventory, a 54-thread issue/PR delta ledger with zero unchecked rows, and one dependency-ordered P1 candidate.

The remembered audit was real, but it audited a fork branch. Its exact test-file set cannot identify one commit and must not become an upstream cursor. The fork evidence remains documented below; the registry points only to the clean upstream clone.

## Authority

| Surface | Authority |
| --- | --- |
| Source | `../slate-audit`, `main`, `origin/main`, `https://github.com/ianstormtaylor/slate.git` |
| Audited commit | `ec793483ada7f7e21ebc82c2b3aa9ea674605ce3` |
| Prior upstream comparison | `945a484df2497e4c448b33f417b0de2a49840032` |
| Test harvest | [report](../../../editor-test-harvester/slate/report.md), [inventory](../../../editor-test-harvester/slate/inventory.md), [test index](../../../editor-test-harvester/slate/test-index.md) |
| Tracker harvest | [report](../../../editor-issue-harvester/slate/report.md), [closure ledger](../../../editor-issue-harvester/slate/full/issue-closure-ledger.md) |
| Atomic comparison | [manifest](./concept-manifest.json), [matrix](./concept-matrix.md) |
| Planning handoff | [packet decisions](./planning-handoff.md), [material dossier](./material-dossiers.md), [public API review](./public-api-review.md) |

## Facts

- The clean upstream head is `ec793483ada7f7e21ebc82c2b3aa9ea674605ce3`, dated 2026-08-07 with subject `Version Packages (#6095)`.
- The source diff from `945a484df2497e4c448b33f417b0de2a49840032` changes 46 files with 3,591 insertions and 1,743 deletions. Nine changed paths are test-tree files.
- The full current test inventory contains 1,136 files: 1,062 portable, 31 portable-mixed, and 43 harness. The 1,093 runnable rows yield 1,254 direct or fixture-derived test identities. Zero rows are unresolved.
- The tracker refresh used an all-state 5,853-thread metadata sync followed by exact details hydration for every changed row. The delta after `2026-05-23T09:18:40Z` contains 54 threads: 7 issues and 47 PRs; 33 are new and 21 are older threads with material updates.
- The strict concept matrix has 16 atomic rows, zero duplicate, grouped, missing, unknown, canned, or unresolved rows, and one material P1 finding.
- The 23 relevant tracker rows terminate as 12 keep-local, 1 reject-reference, 1 accepted P1 packet, and 9 evidence-backed defers. The other 31 inspected rows are explicit non-behavior skips.
- A fresh registered mixed-transaction benchmark published once and passed with median ratio `0.7142857142857143` and p95 ratio `0.8284023668639053`.

## Inference

Most changed upstream behavior is already owned by current Plite proof. Async decoration caret stability, selected-element removal, Indic grapheme deletion, recoverable DOM projection, History rollback, and semantic commands all have direct local owners.

Merged PR #6092 exposes the one confirmed implementation gap. Slate recursively compares nested array members; `packages/plite/src/utils/deep-equal.ts` compares array members by identity. This is a behavior gap, not a reason to transplant Slate's fixture harness or change the public `TextApi.equals` call.

PR #6083 and PR #6091 do not expose local API debt. Explicit `nodes.unset` and descriptor-owned semantic commands are the smaller truthful Plite surfaces. PR #6003 is too broad to review without atomic public-shape rows.

The current transaction owner is healthy. Fresh batching proof beats five separate publications at its registered median/p95 thresholds and publishes once, so the unmerged #6039/#6050 machinery does not justify a plan packet.

PointRef and RangeRef hyperscript handles are useful test ergonomics but do not close a current runtime gap. Open PR #6084 and Android/mobile rows are evidence for reproduction, not implementation authority.

## Recommendation

Keep the upstream audit cursor and accept one planning candidate: `SLATE-DEEP-ARRAY-001`. After explicit user acceptance, invoke `plite-plan` from the [material dossier](./material-dossiers.md#p1-recursive-json-array-equality), then route the resulting focused implementation through the owning package. Keep hyperscript refs deferred until a selected Plite test needs them. Reproduce native insertText no-op in the Plite browser harness before choosing an owner. Require raw-device proof for Android, Firefox Android, and iPhone composition claims.

Do not revive the fork batching patch from #6039 as upstream law. Reopen batching only if a stable donor beats current Plite under a fair equivalent-workload benchmark while preserving transaction laws.

## Source delta decisions

| Mechanism | Decision | Evidence |
| --- | --- | --- |
| Async decoration caret | keep | `apps/plite/tests/plite-browser/donor/examples/decorations-async.test.ts` |
| Selected element removal | keep | `packages/plite-react/test/use-element-selected.test.tsx` |
| Indic conjunct deletion | keep | `packages/plite/test/text-units-contract.ts` |
| Recoverable DOM resolution | keep | `packages/plite-dom/test/bridge.ts` |
| History callback cleanup | keep transaction owner | `packages/plite-history/test/history-contract.ts` |
| Custom command helpers | reject reference shape | `packages/plite/src/core/command-definition.ts` and `packages/plite/test/command-spec.test.ts` |
| Null as property deletion | reject reference shape | [Best API review](./public-api-review.md#property-removal-pr-6083) |
| Mixed mutation batching | keep local transaction owner | Fresh registered benchmark: median ratio `0.714`, p95 ratio `0.828`, one publication |
| Queued selectionchange origin | keep | `packages/plite-react/test/selection-controller-contract.ts:971` |
| Nested arrays in deep equality | rearchitect P1 | `../slate-audit/packages/slate/src/utils/deep-equal.ts` versus `packages/plite/src/utils/deep-equal.ts` |
| PointRef / RangeRef hyperscript values | defer | `../slate-audit/packages/slate-hyperscript/src/refs.ts`; no Plite hyperscript owner found |
| Native insertText semantic no-op | reproduce | Open PR #6084 has two browser scenarios; no exact local browser row found |
| Mobile predictive typing/composition | raw-device reproduce | #5130 and #5974 lack authoritative current device proof |
| Empty-leaf Android IME | raw-device reproduce | Open PR #6096 has no automated regression test |

## Legacy audit recovery

The deleted plan `docs/plans/2026-04-13-slate-v2-ledger-gap-audit.md` classified 1,120 test-tree files: 1,069 Slate core rows, 8 React rows, 20 History rows, and 23 Playwright example rows. It was removed in Plate commit `19a010a29ce8015e4a271854142255113b629752` during the 2026-06-24 transplant.

The recovered file set has SHA-256 `28003393fe76167f1ac93440a365838d17dfbc1fd05d18f0c5ae97a9928d15ec`. That exact set exists at two fork commits:

- `4cb3b740cfa295d8ac6fe38afbe74e87135af68c`
- `fd087e3f173f28c823a7170bc88f0301c1eeabe9`

Both are on the `6038-batched-set-node-prototype` fork lineage. The same inventory command finds 1,096 scoped files at upstream `945a484df2497e4c448b33f417b0de2a49840032`, a 24-file mismatch. Therefore the legacy rows prove a fork audit but cannot prove one audited commit or an upstream-main cursor.

The repaired registration supersedes `LEGACY-SLATE-1120` only as current authority. It does not delete or reinterpret the historical result.

## Issue and PR closure

The [full ledger](../../../editor-issue-harvester/slate/full/issue-closure-ledger.md) records every changed thread. Closure counts:

- 12 `covered-by-existing-test`
- 7 `deferred-with-owner`
- 4 `needs-repro`
- 31 `invalid-skip`
- 0 unchecked

The 31 skips are individually inspected dependency, security, build, formatting, docs, or release PRs. They remain rows in the ledger instead of disappearing from the denominator.

The [planning handoff](./planning-handoff.md#tracker-to-plan-closure) assigns one terminal route to all 23 non-skip rows. No relevant row remains merely “harvested.”

## Planning conclusion

- Strongest local mechanisms, rejected machinery, and evidence gates are
  explicit in the [planning handoff](./planning-handoff.md).
- The only P0-P3 candidate is the
  [P1 recursive JSON-array equality dossier](./material-dossiers.md#p1-recursive-json-array-equality).
- Public shape is settled by the
  [Best API review](./public-api-review.md): keep explicit property removal and
  semantic commands; split #6003 before any future review.
- Dependency order is one accepted `plite-plan` packet followed by the package
  execution owner selected by that plan. Deferred evidence gates remain closed.
- This audit stops for acceptance. It does not start a layer plan or product
  implementation.

## Review pressure

The audit applied three pressure rules:

1. A fork file-set match cannot become an upstream cursor.
2. An exact local coverage claim needs a current assertion and focused command.
3. Synthetic browser or mobile tests cannot become raw-device proof.

These rules downgraded #6084 and the Android/mobile rows to reproduction, rejected null-as-unset as a current Plite API direction, and kept the old batching branch out of the current source baseline.

## Remaining risk

- The issue/PR cursor is a checked-at timestamp, not a guarantee that GitHub will never mutate older threads again. Future syncs must refresh rows with newer `updated_at` values.
- The test harvest maps the full source tree but does not rerun all 1,254 upstream test identities against Plite.
- #6084 and #6096 are open PRs. Their behavior or patch shape can change.
- Raw-device mobile behavior remains unproved until the device lane runs.
- PR #6003 remains too broad for a truthful public API verdict until it is split.

## Verification

- `node .agents/rules/editor-audit/scripts/validate-concept-matrix.mjs --manifest docs/plans/artifacts/slate-regression-proof-audit/concept-manifest.json --ledger docs/plans/artifacts/slate-regression-proof-audit/concept-matrix.md`
- `node docs/editor-issue-harvester/slate/full/classify-delta.mjs`
- `PLITE_TRANSACTION_EXECUTION_STRICT=1 bun --preload ./config/plite-source-aliases.ts benchmarks/slate-v2/donor/core/current/transaction-execution.mjs`
- Focused Plite package and browser commands are attached to every covered row in the closure ledger.
