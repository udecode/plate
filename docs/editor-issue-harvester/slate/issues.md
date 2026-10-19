# Slate changed issues

These are all issues created or materially changed after `2026-05-23T09:18:40Z`; PRs are in the [full closure ledger](./full/issue-closure-ledger.md).

| Check | Thread | Kind | State | Decision | Owner | Evidence / next action |
| --- | ---: | --- | --- | --- | --- | --- |
| [x] | [#3556](https://github.com/ianstormtaylor/slate/issues/3556) | issue | closed | covered-by-existing-test | slate-v2 | Merged PR #6080 made target-range path lookup recoverable; Plite already separates nullable bridge recovery from strict APIs. Keep the resolver contract; no transplant. |
| [x] | [#5130](https://github.com/ianstormtaylor/slate/issues/5130) | issue | open | needs-repro | slate-v2 | Firefox Android predictive typing is device and IME specific; synthetic Android contracts cannot close the raw-device claim. Reproduce on a real Firefox Android device before choosing a fix. |
| [x] | [#5974](https://github.com/ianstormtaylor/slate/issues/5974) | issue | closed | needs-repro | slate-v2 | The issue closed without a merged fix; an emulator report and a commenter workaround do not prove current behavior. Reproduce only if mobile composition enters the selected work queue. |
| [x] | [#5987](https://github.com/ianstormtaylor/slate/issues/5987) | issue | closed | covered-by-existing-test | slate-v2 | Merged PR #6033 adds the async-decoration caret regression and Plite has the same browser behavior row. Keep the existing browser row. |
| [x] | [#6053](https://github.com/ianstormtaylor/slate/issues/6053) | issue | closed | covered-by-existing-test | slate-v2 | Merged PR #6073 prevents selected-element removal from throwing; Plite has exact removal and unmount contracts. Keep the current hook contract. |
| [x] | [#6086](https://github.com/ianstormtaylor/slate/issues/6086) | issue | open | covered-by-existing-test | slate-v2 | Plite records selection origin and rejects queued native selectionchange when model-owned programmatic selection is authoritative. Track upstream outcome; no local test gap. |
| [x] | [#6087](https://github.com/ianstormtaylor/slate/issues/6087) | issue | open | deferred-with-owner | plate | The request names Plate.js toolbar buttons and is filed in the wrong upstream repository; it is not a Slate editor-kernel behavior. Route to the Plate UI owner if selected; do not create a Slate-v2 regression test. |
