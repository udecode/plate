# Slate issue and PR delta closure ledger

Status: closed for the delta after `2026-05-23T09:18:40Z`.

Source head: `ec793483ada7f7e21ebc82c2b3aa9ea674605ce3`. Metadata and PR details checked at `2026-08-14T11:21:25.836091Z`. Raw bodies, comments, checks, commits, and file lists remain unversioned under `.tmp/editor-issue-harvester/slate/raw/`.

## Counts

| Bucket | Count |
| --- | ---: |
| Total changed threads | 54 |
| Issues | 7 |
| Pull requests | 47 |
| Created after baseline | 33 |
| Older and materially updated | 21 |
| covered-by-existing-test | 12 |
| deferred-with-owner | 7 |
| invalid-skip | 31 |
| needs-repro | 4 |
| Unchecked | 0 |

## Row closure

| Check | Thread | Kind | State | Decision | Owner | Evidence / next action |
| --- | ---: | --- | --- | --- | --- | --- |
| [x] | [#3556](https://github.com/ianstormtaylor/slate/issues/3556) | issue | closed | covered-by-existing-test | slate-v2 | Merged PR #6080 made target-range path lookup recoverable; Plite already separates nullable bridge recovery from strict APIs. Keep the resolver contract; no transplant. |
| [x] | [#5130](https://github.com/ianstormtaylor/slate/issues/5130) | issue | open | needs-repro | slate-v2 | Firefox Android predictive typing is device and IME specific; synthetic Android contracts cannot close the raw-device claim. Reproduce on a real Firefox Android device before choosing a fix. |
| [x] | [#5801](https://github.com/ianstormtaylor/slate/pull/5801) | PR | closed | invalid-skip | docs-support-release | tooling maintenance does not define a portable editor-behavior regression. No editor audit action. |
| [x] | [#5869](https://github.com/ianstormtaylor/slate/pull/5869) | PR | closed | invalid-skip | docs-support-release | security maintenance does not define a portable editor-behavior regression. Leave dependency and advisory handling to the security/release lane. |
| [x] | [#5974](https://github.com/ianstormtaylor/slate/issues/5974) | issue | closed | needs-repro | slate-v2 | The issue closed without a merged fix; an emulator report and a commenter workaround do not prove current behavior. Reproduce only if mobile composition enters the selected work queue. |
| [x] | [#5987](https://github.com/ianstormtaylor/slate/issues/5987) | issue | closed | covered-by-existing-test | slate-v2 | Merged PR #6033 adds the async-decoration caret regression and Plite has the same browser behavior row. Keep the existing browser row. |
| [x] | [#6003](https://github.com/ianstormtaylor/slate/pull/6003) | PR | open | deferred-with-owner | needs-plan | The still-open 167-file PR mixes type tests and unrelated corrections; it is not a decision-atomic portable test slice. Split into atomic API questions before any best-api review. |
| [x] | [#6025](https://github.com/ianstormtaylor/slate/pull/6025) | PR | closed | invalid-skip | docs-support-release | security maintenance does not define a portable editor-behavior regression. Leave dependency and advisory handling to the security/release lane. |
| [x] | [#6031](https://github.com/ianstormtaylor/slate/pull/6031) | PR | closed | invalid-skip | docs-support-release | security maintenance does not define a portable editor-behavior regression. Leave dependency and advisory handling to the security/release lane. |
| [x] | [#6032](https://github.com/ianstormtaylor/slate/pull/6032) | PR | closed | invalid-skip | docs-support-release | security maintenance does not define a portable editor-behavior regression. Leave dependency and advisory handling to the security/release lane. |
| [x] | [#6033](https://github.com/ianstormtaylor/slate/pull/6033) | PR | merged | covered-by-existing-test | slate-v2 | Merged async-decoration caret fix maps exactly to Plite browser proof. Keep the current browser row. |
| [x] | [#6037](https://github.com/ianstormtaylor/slate/pull/6037) | PR | closed | invalid-skip | docs-support-release | security maintenance does not define a portable editor-behavior regression. Leave dependency and advisory handling to the security/release lane. |
| [x] | [#6039](https://github.com/ianstormtaylor/slate/pull/6039) | PR | closed | deferred-with-owner | needs-plan | Closed unmerged fork batching engine is the source of the remembered legacy audit, not current upstream Slate law. Require a benchmarked architecture packet before reconsidering mutable batching. |
| [x] | [#6041](https://github.com/ianstormtaylor/slate/pull/6041) | PR | closed | invalid-skip | docs-support-release | security maintenance does not define a portable editor-behavior regression. Leave dependency and advisory handling to the security/release lane. |
| [x] | [#6049](https://github.com/ianstormtaylor/slate/pull/6049) | PR | closed | invalid-skip | docs-support-release | security maintenance does not define a portable editor-behavior regression. Leave dependency and advisory handling to the security/release lane. |
| [x] | [#6050](https://github.com/ianstormtaylor/slate/pull/6050) | PR | open | deferred-with-owner | needs-plan | Open mutable-batching proposal changes ownership and runtime cost; isolated tests cannot settle adoption. Benchmark against Plite transactions before architecture review. |
| [x] | [#6053](https://github.com/ianstormtaylor/slate/issues/6053) | issue | closed | covered-by-existing-test | slate-v2 | Merged PR #6073 prevents selected-element removal from throwing; Plite has exact removal and unmount contracts. Keep the current hook contract. |
| [x] | [#6057](https://github.com/ianstormtaylor/slate/pull/6057) | PR | closed | invalid-skip | docs-support-release | security maintenance does not define a portable editor-behavior regression. Leave dependency and advisory handling to the security/release lane. |
| [x] | [#6058](https://github.com/ianstormtaylor/slate/pull/6058) | PR | closed | invalid-skip | docs-support-release | security maintenance does not define a portable editor-behavior regression. Leave dependency and advisory handling to the security/release lane. |
| [x] | [#6060](https://github.com/ianstormtaylor/slate/pull/6060) | PR | closed | invalid-skip | docs-support-release | security maintenance does not define a portable editor-behavior regression. Leave dependency and advisory handling to the security/release lane. |
| [x] | [#6062](https://github.com/ianstormtaylor/slate/pull/6062) | PR | merged | invalid-skip | docs-support-release | security maintenance does not define a portable editor-behavior regression. Leave dependency and advisory handling to the security/release lane. |
| [x] | [#6063](https://github.com/ianstormtaylor/slate/pull/6063) | PR | open | covered-by-existing-test | slate-v2 | The open try/finally cleanup proposal expresses rollback law already enforced by Plite transactions and History. Keep transaction-owned cleanup. |
| [x] | [#6065](https://github.com/ianstormtaylor/slate/pull/6065) | PR | merged | deferred-with-owner | slate-v2 | Merged PointRef and RangeRef hyperscript helpers are useful test ergonomics, but Plite hyperscript has no equivalent owner. Add only when a selected Plite test needs ref-valued hyperscript fixtures. |
| [x] | [#6066](https://github.com/ianstormtaylor/slate/pull/6066) | PR | merged | invalid-skip | docs-support-release | release maintenance does not define a portable editor-behavior regression. No editor audit action. |
| [x] | [#6067](https://github.com/ianstormtaylor/slate/pull/6067) | PR | merged | invalid-skip | docs-support-release | docs maintenance does not define a portable editor-behavior regression. No editor audit action. |
| [x] | [#6068](https://github.com/ianstormtaylor/slate/pull/6068) | PR | closed | invalid-skip | docs-support-release | security maintenance does not define a portable editor-behavior regression. Leave dependency and advisory handling to the security/release lane. |
| [x] | [#6069](https://github.com/ianstormtaylor/slate/pull/6069) | PR | closed | invalid-skip | docs-support-release | security maintenance does not define a portable editor-behavior regression. Leave dependency and advisory handling to the security/release lane. |
| [x] | [#6070](https://github.com/ianstormtaylor/slate/pull/6070) | PR | closed | invalid-skip | docs-support-release | security maintenance does not define a portable editor-behavior regression. Leave dependency and advisory handling to the security/release lane. |
| [x] | [#6071](https://github.com/ianstormtaylor/slate/pull/6071) | PR | closed | invalid-skip | docs-support-release | security maintenance does not define a portable editor-behavior regression. Leave dependency and advisory handling to the security/release lane. |
| [x] | [#6072](https://github.com/ianstormtaylor/slate/pull/6072) | PR | merged | covered-by-existing-test | slate-v2 | Suppress-throw propagation maps to Plite nullable-versus-strict bridge behavior. Keep the current resolver contract. |
| [x] | [#6073](https://github.com/ianstormtaylor/slate/pull/6073) | PR | merged | covered-by-existing-test | slate-v2 | Selected-element removal maps to exact Plite hook contracts. Keep the current hook contract. |
| [x] | [#6074](https://github.com/ianstormtaylor/slate/pull/6074) | PR | merged | covered-by-existing-test | slate-v2 | Indic conjunct GB9c behavior is already asserted for Tamil and Devanagari deletion units. Keep Intl.Segmenter-backed contracts. |
| [x] | [#6075](https://github.com/ianstormtaylor/slate/pull/6075) | PR | merged | invalid-skip | docs-support-release | tooling maintenance does not define a portable editor-behavior regression. No editor audit action. |
| [x] | [#6076](https://github.com/ianstormtaylor/slate/pull/6076) | PR | merged | invalid-skip | docs-support-release | tooling maintenance does not define a portable editor-behavior regression. No editor audit action. |
| [x] | [#6077](https://github.com/ianstormtaylor/slate/pull/6077) | PR | merged | invalid-skip | docs-support-release | release maintenance does not define a portable editor-behavior regression. No editor audit action. |
| [x] | [#6078](https://github.com/ianstormtaylor/slate/pull/6078) | PR | merged | covered-by-existing-test | slate-v2 | Firefox decoration rerender safety is covered by the async-decoration browser suite. Keep the current browser row. |
| [x] | [#6079](https://github.com/ianstormtaylor/slate/pull/6079) | PR | merged | invalid-skip | docs-support-release | release maintenance does not define a portable editor-behavior regression. No editor audit action. |
| [x] | [#6080](https://github.com/ianstormtaylor/slate/pull/6080) | PR | merged | covered-by-existing-test | slate-v2 | Recoverable beforeinput target-range lookup maps to Plite nullable bridge and selection reconciliation. Keep the current resolver contract. |
| [x] | [#6081](https://github.com/ianstormtaylor/slate/pull/6081) | PR | closed | invalid-skip | docs-support-release | security maintenance does not define a portable editor-behavior regression. Leave dependency and advisory handling to the security/release lane. |
| [x] | [#6082](https://github.com/ianstormtaylor/slate/pull/6082) | PR | merged | invalid-skip | docs-support-release | release maintenance does not define a portable editor-behavior regression. No editor audit action. |
| [x] | [#6083](https://github.com/ianstormtaylor/slate/pull/6083) | PR | merged | deferred-with-owner | needs-plan | Slate types null as implicit property removal; Plite deliberately exposes unsetNodes instead of overloading setNodes. Keep the explicit API unless best-api selects null-as-unset. |
| [x] | [#6084](https://github.com/ianstormtaylor/slate/pull/6084) | PR | open | needs-repro | slate-v2 | The open PR adds two browser regressions for native insertText that makes no model change; no exact Plite no-op browser row was found. Reproduce the two upstream scenarios in the Plite browser harness before implementing. |
| [x] | [#6085](https://github.com/ianstormtaylor/slate/pull/6085) | PR | open | invalid-skip | docs-support-release | security maintenance does not define a portable editor-behavior regression. Leave dependency and advisory handling to the security/release lane. |
| [x] | [#6086](https://github.com/ianstormtaylor/slate/issues/6086) | issue | open | covered-by-existing-test | slate-v2 | Plite records selection origin and rejects queued native selectionchange when model-owned programmatic selection is authoritative. Track upstream outcome; no local test gap. |
| [x] | [#6087](https://github.com/ianstormtaylor/slate/issues/6087) | issue | open | deferred-with-owner | plate | The request names Plate.js toolbar buttons and is filed in the wrong upstream repository; it is not a Slate editor-kernel behavior. Route to the Plate UI owner if selected; do not create a Slate-v2 regression test. |
| [x] | [#6088](https://github.com/ianstormtaylor/slate/pull/6088) | PR | merged | invalid-skip | docs-support-release | release maintenance does not define a portable editor-behavior regression. No editor audit action. |
| [x] | [#6089](https://github.com/ianstormtaylor/slate/pull/6089) | PR | open | invalid-skip | docs-support-release | security maintenance does not define a portable editor-behavior regression. Leave dependency and advisory handling to the security/release lane. |
| [x] | [#6090](https://github.com/ianstormtaylor/slate/pull/6090) | PR | open | invalid-skip | docs-support-release | security maintenance does not define a portable editor-behavior regression. Leave dependency and advisory handling to the security/release lane. |
| [x] | [#6091](https://github.com/ianstormtaylor/slate/pull/6091) | PR | open | covered-by-existing-test | slate-v2 | The docs-only Slate helper proposal is subsumed by Plite defineCommand, typed handlers, routing, recursion, and decline semantics. Keep Plite command ownership; do not copy the docs helper shape. |
| [x] | [#6092](https://github.com/ianstormtaylor/slate/pull/6092) | PR | merged | deferred-with-owner | slate-v2 | Merged recursive nested-array comparison exposes a real Plite gap: local deepEqual compares array elements by reference. Open a focused Plite deep-equality test-and-fix slice. |
| [x] | [#6093](https://github.com/ianstormtaylor/slate/pull/6093) | PR | open | invalid-skip | docs-support-release | security maintenance does not define a portable editor-behavior regression. Leave dependency and advisory handling to the security/release lane. |
| [x] | [#6094](https://github.com/ianstormtaylor/slate/pull/6094) | PR | open | invalid-skip | docs-support-release | security maintenance does not define a portable editor-behavior regression. Leave dependency and advisory handling to the security/release lane. |
| [x] | [#6095](https://github.com/ianstormtaylor/slate/pull/6095) | PR | merged | invalid-skip | docs-support-release | release maintenance does not define a portable editor-behavior regression. No editor audit action. |
| [x] | [#6096](https://github.com/ianstormtaylor/slate/pull/6096) | PR | open | needs-repro | slate-v2 | The open Android empty-leaf patch contains no automated regression test, and synthetic contracts cannot prove first-character IME behavior. Require real Android IME reproduction before changing the placeholder or manager lifecycle. |

Machine-readable ledger: [classified-threads.json](./classified-threads.json). Full columns: [issue-closure-ledger.tsv](./issue-closure-ledger.tsv).
