# Yjs Collaboration Harvest Inventory

status: done
license_mode: permissive

## Inventory Commands

- slate-yjs: `rg --files ../slate-yjs | rg '(^|/)(__tests__|test|tests|spec|e2e|integration|playwright|cypress|wdio|fixtures)(/|$)|\.(test|spec)\.[cm]?[jt]sx?$' | rg -v '(^|/)(dist|build|coverage|node_modules|vendor|fixtures/generated|__snapshots__)(/|$)' | sort`
- lexical-yjs: `rg --files ../lexical/packages/lexical-yjs | rg '(^|/)(__tests__|test|tests|spec|e2e|integration|playwright|cypress|wdio|fixtures)(/|$)|\.(test|spec)\.[cm]?[jt]sx?$' | rg -v '(^|/)(dist|build|coverage|node_modules|vendor|fixtures/generated|__snapshots__)(/|$)' | sort`
- y-prosemirror: `rg --files ../y-prosemirror | rg '(^|/)(__tests__|test|tests|spec|e2e|integration|playwright|cypress|wdio|fixtures)(/|$)|\.(test|spec)\.[cm]?[jt]sx?$' | rg -v '(^|/)(dist|build|coverage|node_modules|vendor|fixtures/generated|__snapshots__)(/|$)' | sort`
- yjs: `rg --files ../yjs | rg '(^|/)(__tests__|test|tests|spec|e2e|integration|playwright|cypress|wdio|fixtures)(/|$)|\.(test|spec)\.[cm]?[jt]sx?$' | rg -v '(^|/)(dist|build|coverage|node_modules|vendor|fixtures/generated|__snapshots__)(/|$)' | sort`

## Full Inventory

| Source | Runnable | Category | Reason | Test-name extraction |
| --- | --- | --- | --- | --- |
| `../slate-yjs/packages/core/test/collaboration/addMark/acrossMarks.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/addMark/acrossMarksSame.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/addMark/atBeginningOfDocument.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/addMark/atEndOfDocument.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/addMark/withOtherMarks.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/insertNode/atBeginningOfDocument.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/insertNode/atEndOfDocument.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/insertNode/inTheMiddle.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/insertText/atBeginningOfBlock.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/insertText/atBeginningOfDocument.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/insertText/atEndOfBlock.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/insertText/atEndOfDocument.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/insertText/inTheMiddle.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/insertText/inTheMiddleOfNestedBlock.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/insertText/insideMarks.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/insertText/withEmptyString.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/insertText/withEntities.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/insertText/withMarks.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/insertText/withUnicode.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/mergeNode/afterADeleteBackward.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/mergeNode/inSameParent.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/mergeNode/onMixedNestedNodes.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/mergeNode/onMixedTypeNodes.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/mergeNode/withUnicode.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/moveNode/downward/whenBlockBecomesNested.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/moveNode/downward/whenBlockBecomesNonNested.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/moveNode/downward/whenBlockStaysNested.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/moveNode/downward/whenBlockStaysNonNested.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/moveNode/upward/whenBlockBecomesNested.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/moveNode/upward/whenBlockBecomesNonNested.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/moveNode/upward/whenBlockStaysNested.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/moveNode/upward/whenBlockStaysNonNested.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/removeMark/inTheMiddleOfText.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/removeMark/withAddMark.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/removeMark/withOtherMarks.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/removeNode/atBeginningOfDocument.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/removeNode/atEndOfDocument.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/removeNode/nestedBlock.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/removeNode/wrapperBlock.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/removeText/atBeginningOfDocument.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/removeText/atEndOfDocument.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/removeText/withUnicode.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/setNode/atBeginningOfDocument.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/setNode/atEndOfDocument.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/setNode/onDataChange.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/setNode/onDataChangeOnInline.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/setNode/onResetBlock.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/setNode/withAChangeOfType.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/splitNode/atBeginningOfDocument.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/splitNode/atEndOfBlock.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/splitNode/atEndOfDocument.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/splitNode/onNonDefaultBlock.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/splitNode/withMultipleSubNodes.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/collaboration/splitNode/withUnicode.tsx` | yes | portable | Slate operation fixture is replayed through slate-yjs and checked against a remote Y.Doc mirror. | 1 fixture |
| `../slate-yjs/packages/core/test/index.test.ts` | yes | harness | Vitest adapter runner loads every collaboration fixture and verifies local/remote convergence. | 1 suite |
| `../slate-yjs/packages/core/test/slate.d.ts` | no | skip | Ambient test typing only. | none |
| `../slate-yjs/packages/core/test/withTestingElements.ts` | no | harness | Fixture helper that wires testing elements and shared roots; no behavior assertion by itself. | none |
| `../y-prosemirror/tests/cohort.js` | no | harness | Shared simulation/schema helper used by suggestion and position tests. | none |
| `../y-prosemirror/tests/complexSchema.js` | no | harness | Shared simulation/schema helper used by suggestion and position tests. | none |
| `../y-prosemirror/tests/delta.test.js` | yes | portable | Portable mapping/transform invariant for editor collaboration positions and deltas. | 12 exports |
| `../y-prosemirror/tests/index.js` | yes | harness | lib0 runner entrypoint. It selects the actual y-prosemirror test modules. | runner |
| `../y-prosemirror/tests/index.node.js` | yes | harness | lib0 runner entrypoint. It selects the actual y-prosemirror test modules. | runner |
| `../y-prosemirror/tests/positions.test.js` | yes | portable | Portable mapping/transform invariant for editor collaboration positions and deltas. | 22 exports |
| `../y-prosemirror/tests/suggestion-simulation.test.js` | yes | portable-mixed | Useful collaboration invariant mixed with ProseMirror view/plugin/suggestion policy. | 4 exports |
| `../y-prosemirror/tests/suggestions.test.js` | yes | portable-mixed | Useful collaboration invariant mixed with ProseMirror view/plugin/suggestion policy. | 21 exports |
| `../y-prosemirror/tests/tr.test.js` | manual | portable-mixed | Useful collaboration invariant mixed with ProseMirror view/plugin/suggestion policy. | 1 exports |
| `../y-prosemirror/tests/undo.test.js` | yes | portable-mixed | Useful collaboration invariant mixed with ProseMirror view/plugin/suggestion policy. | 33 exports |
| `../y-prosemirror/tests/y-prosemirror.test.js` | manual | portable-mixed | Useful collaboration invariant mixed with ProseMirror view/plugin/suggestion policy. | 23 exports |
| `../yjs/tests/IdMap.tests.js` | yes | skip | Yjs internal storage/encoding compatibility; useful CRDT substrate confidence, not a Slate or Plate editor-behavior target. | 7 exports |
| `../yjs/tests/IdSet.tests.js` | yes | skip | Yjs internal storage/encoding compatibility; useful CRDT substrate confidence, not a Slate or Plate editor-behavior target. | 7 exports |
| `../yjs/tests/attribution.tests.js` | yes | portable-mixed | Shared-type or attribution behavior that can inform Plate Yjs, but only part of it maps to rich-text editors. | 7 exports |
| `../yjs/tests/compatibility.tests.js` | yes | skip | Yjs internal storage/encoding compatibility; useful CRDT substrate confidence, not a Slate or Plate editor-behavior target. | 3 exports |
| `../yjs/tests/delta.tests.js` | yes | portable | Portable CRDT text, relative-position, snapshot, update, or undo invariant for collaboration adapters. | 5 exports |
| `../yjs/tests/doc.tests.js` | yes | portable | Portable CRDT text, relative-position, snapshot, update, or undo invariant for collaboration adapters. | 11 exports |
| `../yjs/tests/encoding.tests.js` | yes | skip | Yjs internal storage/encoding compatibility; useful CRDT substrate confidence, not a Slate or Plate editor-behavior target. | 3 exports |
| `../yjs/tests/index.js` | yes | harness | lib0 runner entrypoint for Yjs tests. | runner |
| `../yjs/tests/relativePositions.tests.js` | yes | portable | Portable CRDT text, relative-position, snapshot, update, or undo invariant for collaboration adapters. | 9 exports |
| `../yjs/tests/snapshot.tests.js` | yes | portable | Portable CRDT text, relative-position, snapshot, update, or undo invariant for collaboration adapters. | 12 exports |
| `../yjs/tests/testHelper.js` | no | harness | Randomized multi-peer connector and comparison helper; reusable technique but no standalone editor behavior row. | 0 helper export |
| `../yjs/tests/undo-redo.tests.js` | yes | portable | Portable CRDT text, relative-position, snapshot, update, or undo invariant for collaboration adapters. | 25 exports |
| `../yjs/tests/updates.tests.js` | yes | portable | Portable CRDT text, relative-position, snapshot, update, or undo invariant for collaboration adapters. | 8 exports |
| `../yjs/tests/y-array.tests.js` | yes | portable-mixed | Shared-type or attribution behavior that can inform Plate Yjs, but only part of it maps to rich-text editors. | 41 exports |
| `../yjs/tests/y-map.tests.js` | yes | portable-mixed | Shared-type or attribution behavior that can inform Plate Yjs, but only part of it maps to rich-text editors. | 40 exports |
| `../yjs/tests/y-text.tests.js` | yes | portable | Portable CRDT text, relative-position, snapshot, update, or undo invariant for collaboration adapters. | 47 exports |
| `../yjs/tests/y-xml.tests.js` | yes | portable-mixed | Shared-type or attribution behavior that can inform Plate Yjs, but only part of it maps to rich-text editors. | 12 exports |

## Empty Target Notes

- `../lexical/packages/lexical-yjs` has no test files under the required inventory pattern. Its source was scanned for Yjs collaboration concepts, but there is no runnable upstream test to harvest from that package path.
