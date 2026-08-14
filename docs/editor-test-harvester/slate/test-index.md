# Slate Portable Test-Name Index

source report: [report.md](./report.md)
target: `../slate-audit`
source_commit: `ec793483ada7f7e21ebc82c2b3aa9ea674605ce3`
inventory_mode: full

Indexed runnable portable and portable-mixed files: 1093.
Extracted direct or fixture-derived test names: 1254.
Files with zero extracted names: 0.

Fixture files are named by `support/fixtures.js:31-56`; the source path and
basename are therefore the executable Mocha test identity.

## `../slate-audit/packages/slate-history/test/isHistory/after-edit.js`

category: portable
family: history-undo-redo

- `../slate-audit/packages/slate-history/test/isHistory/after-edit.js:1` fixture: after-edit (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate-history/test/isHistory/after-redo.js`

category: portable
family: history-undo-redo

- `../slate-audit/packages/slate-history/test/isHistory/after-redo.js:1` fixture: after-redo (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate-history/test/isHistory/after-undo.js`

category: portable
family: history-undo-redo

- `../slate-audit/packages/slate-history/test/isHistory/after-undo.js:1` fixture: after-undo (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate-history/test/isHistory/before-edit.js`

category: portable
family: history-undo-redo

- `../slate-audit/packages/slate-history/test/isHistory/before-edit.js:1` fixture: before-edit (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate-history/test/jsx.d.ts`

category: portable
family: history-undo-redo

- `../slate-audit/packages/slate-history/test/jsx.d.ts:1` fixture: jsx.d (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate-history/test/undo/cursor/keep_after_focus_and_remove_text_undo.js`

category: portable
family: history-undo-redo

- `../slate-audit/packages/slate-history/test/undo/cursor/keep_after_focus_and_remove_text_undo.js:1` fixture: keep_after_focus_and_remove_text_undo (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate-history/test/undo/delete_backward/block-join-reverse.tsx`

category: portable
family: history-undo-redo

- `../slate-audit/packages/slate-history/test/undo/delete_backward/block-join-reverse.tsx:1` fixture: block-join-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate-history/test/undo/delete_backward/block-nested-reverse.tsx`

category: portable
family: history-undo-redo

- `../slate-audit/packages/slate-history/test/undo/delete_backward/block-nested-reverse.tsx:1` fixture: block-nested-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate-history/test/undo/delete_backward/block-text.tsx`

category: portable
family: history-undo-redo

- `../slate-audit/packages/slate-history/test/undo/delete_backward/block-text.tsx:1` fixture: block-text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate-history/test/undo/delete_backward/custom-prop.tsx`

category: portable
family: history-undo-redo

- `../slate-audit/packages/slate-history/test/undo/delete_backward/custom-prop.tsx:1` fixture: custom-prop (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate-history/test/undo/delete_backward/inline-across.tsx`

category: portable
family: history-undo-redo

- `../slate-audit/packages/slate-history/test/undo/delete_backward/inline-across.tsx:1` fixture: inline-across (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate-history/test/undo/insert_break/basic.tsx`

category: portable
family: history-undo-redo

- `../slate-audit/packages/slate-history/test/undo/insert_break/basic.tsx:1` fixture: basic (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate-history/test/undo/insert_fragment/basic.tsx`

category: portable
family: history-undo-redo

- `../slate-audit/packages/slate-history/test/undo/insert_fragment/basic.tsx:1` fixture: basic (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate-history/test/undo/insert_text/basic.tsx`

category: portable
family: history-undo-redo

- `../slate-audit/packages/slate-history/test/undo/insert_text/basic.tsx:1` fixture: basic (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate-history/test/undo/insert_text/contiguous.tsx`

category: portable
family: history-undo-redo

- `../slate-audit/packages/slate-history/test/undo/insert_text/contiguous.tsx:1` fixture: contiguous (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate-history/test/undo/insert_text/non-contiguous.tsx`

category: portable
family: history-undo-redo

- `../slate-audit/packages/slate-history/test/undo/insert_text/non-contiguous.tsx:1` fixture: non-contiguous (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate-react/test/chunking.spec.ts`

category: portable-mixed
family: react-runtime/chunking

- `../slate-audit/packages/slate-react/test/chunking.spec.ts:125` describe: describe('getChunkTreeForNode', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:126` describe: describe('chunking initial value', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:134` it: it('returns empty tree for 0 children', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:138` it: it('returns flat tree for 1 child', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:142` it: it('returns flat tree for 3 children', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:146` it: it('returns 1 layer of chunking for 4 children', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:150` it: it('returns 1 layer of chunking for 9 children', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:158` it: it('returns 2 layers of chunking for 10 children', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:169` it: it('returns 2 layers of chunking for 27 children', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:189` it: it('returns 3 layers of chunking for 28 children', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:212` it: it('calls onInsert for initial children', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:226` it: it('sets the index of each chunk leaf', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:242` describe: describe('inserting nodes', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:243` describe: describe('in empty editor', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:244` it: it('inserts a single node', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:251` it: it('inserts 27 nodes with 2 layers of chunking', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:275` it: it('inserts 28 nodes with 3 layers of chunking', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:302` it: it('inserts nodes one by one', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:330` it: it('inserts nodes one by one in reverse order', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:361` describe: describe('at end of editor', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:362` it: it('inserts a single node at the top level', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:374` it: it('inserts a single node into a chunk', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:385` it: it('inserts a single node into a nested chunk', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:396` it: it('inserts 25 nodes after 2 nodes with 2 layers of chunking', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:418` it: it('inserts 25 nodes after 3 nodes with 3 layers of chunking', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:443` it: it('inserts many nodes at the ends of multiple nested chunks', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:459` it: it('calls onInsert for inserted nodes', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:472` it: it('sets the index of inserted leaves', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:483` describe: describe('at start of editor', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:484` it: it('inserts a single node at the top level', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:491` it: it('inserts many nodes at the starts of multiple nested chunks', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:508` describe: describe('in the middle of editor', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:509` describe: describe('at the top level', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:510` it: it('inserts a single node', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:518` it: it('inserts nodes at the start of subsequent sibling chunks', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:531` it: it('calls onInsert for inserted nodes', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:544` it: it('calls onIndexChange for subsequent nodes', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:557` it: it('updates the index of subsequent leaves', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:568` describe: describe('in the middle of a chunk', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:569` it: it('inserts a single node', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:576` it: it('inserts 8 nodes between 2 nodes', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:596` it: it('inserts nodes at the start of subsequent sibling chunks', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:607` describe: describe('at the end of a chunk', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:608` it: it('inserts 2 nodes in 2 adjacent shallow chunks', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:619` it: it('inserts nodes in many adjacent nested chunks', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:648` describe: describe('removing nodes', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:649` it: it('removes a node', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:656` it: it('removes multiple consecutive nodes', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:664` it: it('removes multiple non-consecutive nodes', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:672` it: it('calls onIndexChange for subsequent nodes', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:685` it: it('updates the index of subsequent leaves', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:696` describe: describe('removing and inserting nodes', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:697` it: it('removes and inserts a node from the start', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:705` it: it('removes and inserts a node from the middle', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:713` it: it('removes and inserts a node from the end', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:721` it: it('removes 2 nodes and inserts 1 node', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:730` it: it('removes 1 nodes and inserts 2 node', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:739` it: it('calls onIndexChange for nodes until insertions equal removals', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:768` describe: describe('updating nodes', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:769` it: it('replaces updated Slate nodes in the chunk tree', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:780` it: it('invalidates ancestor chunks of updated Slate nodes', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:795` it: it('calls onUpdate for updated Slate nodes', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:810` describe: describe('moving nodes', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:811` it: it('moves a node down', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:833` it: it('moves a node up', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:856` describe: describe('manual rerendering', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:857` it: it('invalidates specific child indices', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:878` describe: describe('random testing', () => {
- `../slate-audit/packages/slate-react/test/chunking.spec.ts:879` it: it('remains correct after random operations', () => {

## `../slate-audit/packages/slate-react/test/decorations.spec.tsx`

category: portable-mixed
family: react-runtime/decorations

- `../slate-audit/packages/slate-react/test/decorations.spec.tsx:68` describe: describe('decorations', () => {
- `../slate-audit/packages/slate-react/test/decorations.spec.tsx:80` describe: describe('decorating initial value', () => {
- `../slate-audit/packages/slate-react/test/decorations.spec.tsx:81` it: it('decorates part of a single text node', () => {
- `../slate-audit/packages/slate-react/test/decorations.spec.tsx:115` it: it('decorates an entire text node', () => {
- `../slate-audit/packages/slate-react/test/decorations.spec.tsx:156` it: it('applies multiple overlapping decorations in a single text node', () => {
- `../slate-audit/packages/slate-react/test/decorations.spec.tsx:195` it: it('passes down decorations from the parent element', () => {
- `../slate-audit/packages/slate-react/test/decorations.spec.tsx:243` it: it('passes decorations down from the editor', () => {
- `../slate-audit/packages/slate-react/test/decorations.spec.tsx:318` describe: describe('redecorating', () => {
- `../slate-audit/packages/slate-react/test/decorations.spec.tsx:319` it: it('redecorates all nodes when the decorate function changes', () => {
- `../slate-audit/packages/slate-react/test/decorations.spec.tsx:461` it: it('redecorates undecorated nodes when they change', async () => {
- `../slate-audit/packages/slate-react/test/decorations.spec.tsx:508` it: it('redecorates decorated nodes when they change', async () => {
- `../slate-audit/packages/slate-react/test/decorations.spec.tsx:555` it: it('passes down new decorations from changed ancestors', async () => {
- `../slate-audit/packages/slate-react/test/decorations.spec.tsx:603` it: it('does not redecorate unchanged nodes when their paths change', async () => {
- `../slate-audit/packages/slate-react/test/decorations.spec.tsx:665` describe: describe('without chunking', () => {
- `../slate-audit/packages/slate-react/test/decorations.spec.tsx:669` describe: describe('with chunking', () => {

## `../slate-audit/packages/slate-react/test/editable.spec.tsx`

category: portable-mixed
family: react-runtime/editable

- `../slate-audit/packages/slate-react/test/editable.spec.tsx:6` describe: describe('slate-react', () => {
- `../slate-audit/packages/slate-react/test/editable.spec.tsx:7` describe: describe('Editable', () => {
- `../slate-audit/packages/slate-react/test/editable.spec.tsx:8` describe: describe('NODE_TO_KEY logic', () => {
- `../slate-audit/packages/slate-react/test/editable.spec.tsx:9` test: test('should not unmount the node that gets split on a split_node operation', async () => {
- `../slate-audit/packages/slate-react/test/editable.spec.tsx:41` test: test('should not unmount the node that gets merged into on a merge_node operation', async () => {
- `../slate-audit/packages/slate-react/test/editable.spec.tsx:76` test: test('calls onSelectionChange when editor select change', async () => {
- `../slate-audit/packages/slate-react/test/editable.spec.tsx:109` test: test('calls onValueChange when editor children change', async () => {
- `../slate-audit/packages/slate-react/test/editable.spec.tsx:137` test: test('calls onValueChange when editor setNodes', async () => {
- `../slate-audit/packages/slate-react/test/editable.spec.tsx:176` test: test('calls onValueChange when editor children change', async () => {
- `../slate-audit/packages/slate-react/test/editable.spec.tsx:204` describe: describe('translate="no"', () => {
- `../slate-audit/packages/slate-react/test/editable.spec.tsx:205` test: test('should have translate="no" attribute', () => {
- `../slate-audit/packages/slate-react/test/editable.spec.tsx:222` test: test('should allow override of translate attribute', () => {

## `../slate-audit/packages/slate-react/test/react-editor.spec.tsx`

category: portable-mixed
family: react-runtime/react-editor

- `../slate-audit/packages/slate-react/test/react-editor.spec.tsx:6` describe: describe('slate-react', () => {
- `../slate-audit/packages/slate-react/test/react-editor.spec.tsx:7` describe: describe('ReactEditor', () => {
- `../slate-audit/packages/slate-react/test/react-editor.spec.tsx:8` describe: describe('.focus', () => {
- `../slate-audit/packages/slate-react/test/react-editor.spec.tsx:9` test: test('should set focus in top of document with no editor selection', async () => {
- `../slate-audit/packages/slate-react/test/react-editor.spec.tsx:44` test: test('should be able to call .focus without getting toDOMNode errors', async () => {
- `../slate-audit/packages/slate-react/test/react-editor.spec.tsx:89` test: test('should not trigger onValueChange when focus is called', async () => {

## `../slate-audit/packages/slate-react/test/use-selected.spec.tsx`

category: portable-mixed
family: react-runtime/use-selected

- `../slate-audit/packages/slate-react/test/use-selected.spec.tsx:38` describe: describe('useSelected', () => {
- `../slate-audit/packages/slate-react/test/use-selected.spec.tsx:77` it: it('returns false initially', () => {
- `../slate-audit/packages/slate-react/test/use-selected.spec.tsx:88` it: it('re-renders elements when it becomes true or false', async () => {
- `../slate-audit/packages/slate-react/test/use-selected.spec.tsx:120` it: it('returns true for elements in the middle of the selection', async () => {
- `../slate-audit/packages/slate-react/test/use-selected.spec.tsx:140` it: it('remains true when the path changes', async () => {
- `../slate-audit/packages/slate-react/test/use-selected.spec.tsx:178` describe: describe('without chunking', () => {
- `../slate-audit/packages/slate-react/test/use-selected.spec.tsx:182` describe: describe('with chunking', () => {
- `../slate-audit/packages/slate-react/test/use-selected.spec.tsx:187` describe: describe('when the referenced element has been removed', () => {
- `../slate-audit/packages/slate-react/test/use-selected.spec.tsx:256` it: it('returns false with suppressThrow (without chunking)', () => run(false))
- `../slate-audit/packages/slate-react/test/use-selected.spec.tsx:258` it: it('returns false with suppressThrow (with chunking)', () => run(true))

## `../slate-audit/packages/slate-react/test/use-slate-selector.spec.tsx`

category: portable-mixed
family: react-runtime/use-slate-selector

- `../slate-audit/packages/slate-react/test/use-slate-selector.spec.tsx:7` describe: describe('useSlateSelector', () => {
- `../slate-audit/packages/slate-react/test/use-slate-selector.spec.tsx:8` test: test('should use equality function when selector changes', async () => {

## `../slate-audit/packages/slate-react/test/use-slate.spec.tsx`

category: portable-mixed
family: react-runtime/use-slate

- `../slate-audit/packages/slate-react/test/use-slate.spec.tsx:8` describe: describe('useSlateWithV', () => {
- `../slate-audit/packages/slate-react/test/use-slate.spec.tsx:14` it: it('tracks a global `v` counter for the editor', async () => {

## `../slate-audit/packages/slate/test/interfaces/CustomTypes/boldText-false.tsx`

category: portable
family: interface/CustomTypes

- `../slate-audit/packages/slate/test/interfaces/CustomTypes/boldText-false.tsx:1` fixture: boldText-false (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/CustomTypes/boldText-true.tsx`

category: portable
family: interface/CustomTypes

- `../slate-audit/packages/slate/test/interfaces/CustomTypes/boldText-true.tsx:1` fixture: boldText-true (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/CustomTypes/custom-types.ts`

category: portable
family: interface/CustomTypes

- `../slate-audit/packages/slate/test/interfaces/CustomTypes/custom-types.ts:1` fixture: custom-types (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/CustomTypes/customOperation-false.tsx`

category: portable
family: interface/CustomTypes

- `../slate-audit/packages/slate/test/interfaces/CustomTypes/customOperation-false.tsx:1` fixture: customOperation-false (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/CustomTypes/customOperation-true.tsx`

category: portable
family: interface/CustomTypes

- `../slate-audit/packages/slate/test/interfaces/CustomTypes/customOperation-true.tsx:1` fixture: customOperation-true (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/CustomTypes/customText-false.tsx`

category: portable
family: interface/CustomTypes

- `../slate-audit/packages/slate/test/interfaces/CustomTypes/customText-false.tsx:1` fixture: customText-false (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/CustomTypes/customText-true.tsx`

category: portable
family: interface/CustomTypes

- `../slate-audit/packages/slate/test/interfaces/CustomTypes/customText-true.tsx:1` fixture: customText-true (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/CustomTypes/headingElement-false.tsx`

category: portable
family: interface/CustomTypes

- `../slate-audit/packages/slate/test/interfaces/CustomTypes/headingElement-false.tsx:1` fixture: headingElement-false (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/CustomTypes/headingElement-true.tsx`

category: portable
family: interface/CustomTypes

- `../slate-audit/packages/slate/test/interfaces/CustomTypes/headingElement-true.tsx:1` fixture: headingElement-true (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/CustomTypes/type-guards.ts`

category: portable
family: interface/CustomTypes

- `../slate-audit/packages/slate/test/interfaces/CustomTypes/type-guards.ts:1` fixture: type-guards (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/above/block-highest.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/above/block-highest.tsx:1` fixture: block-highest (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/above/block-lowest.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/above/block-lowest.tsx:1` fixture: block-lowest (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/above/inline.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/above/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/above/point.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/above/point.tsx:1` fixture: point (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/above/potential-parent.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/above/potential-parent.tsx:1` fixture: potential-parent (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/above/range.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/above/range.tsx:1` fixture: range (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/after/end.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/after/end.tsx:1` fixture: end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/after/non-selectable-block-last.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/after/non-selectable-block-last.tsx:1` fixture: non-selectable-block-last (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/after/non-selectable-block.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/after/non-selectable-block.tsx:1` fixture: non-selectable-block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/after/non-selectable-inline-last.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/after/non-selectable-inline-last.tsx:1` fixture: non-selectable-inline-last (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/after/non-selectable-inline-void.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/after/non-selectable-inline-void.tsx:1` fixture: non-selectable-inline-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/after/non-selectable-inline.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/after/non-selectable-inline.tsx:1` fixture: non-selectable-inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/after/path-void.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/after/path-void.tsx:1` fixture: path-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/after/path.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/after/path.tsx:1` fixture: path (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/after/point-void.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/after/point-void.tsx:1` fixture: point-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/after/point.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/after/point.tsx:1` fixture: point (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/after/range-void.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/after/range-void.tsx:1` fixture: range-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/after/range.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/after/range.tsx:1` fixture: range (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/before/non-selectable-block-first.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/before/non-selectable-block-first.tsx:1` fixture: non-selectable-block-first (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/before/non-selectable-block.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/before/non-selectable-block.tsx:1` fixture: non-selectable-block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/before/non-selectable-inline-first.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/before/non-selectable-inline-first.tsx:1` fixture: non-selectable-inline-first (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/before/non-selectable-inline.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/before/non-selectable-inline.tsx:1` fixture: non-selectable-inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/before/path-void.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/before/path-void.tsx:1` fixture: path-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/before/path.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/before/path.tsx:1` fixture: path (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/before/point-void.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/before/point-void.tsx:1` fixture: point-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/before/point.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/before/point.tsx:1` fixture: point (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/before/range-void.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/before/range-void.tsx:1` fixture: range-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/before/range.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/before/range.tsx:1` fixture: range (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/before/start.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/before/start.tsx:1` fixture: start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/edges/path.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/edges/path.tsx:1` fixture: path (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/edges/point.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/edges/point.tsx:1` fixture: point (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/edges/range.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/edges/range.tsx:1` fixture: range (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/end/path.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/end/path.tsx:1` fixture: path (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/end/point.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/end/point.tsx:1` fixture: point (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/end/range.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/end/range.tsx:1` fixture: range (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/hasBlocks/block-nested.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/hasBlocks/block-nested.tsx:1` fixture: block-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/hasBlocks/block.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/hasBlocks/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/hasBlocks/inline-nested.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/hasBlocks/inline-nested.tsx:1` fixture: inline-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/hasBlocks/inline.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/hasBlocks/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/hasInlines/block-nested.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/hasInlines/block-nested.tsx:1` fixture: block-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/hasInlines/block.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/hasInlines/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/hasInlines/inline-nested.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/hasInlines/inline-nested.tsx:1` fixture: inline-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/hasInlines/inline.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/hasInlines/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/hasTexts/block-nested.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/hasTexts/block-nested.tsx:1` fixture: block-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/hasTexts/block.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/hasTexts/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/hasTexts/inline-nested.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/hasTexts/inline-nested.tsx:1` fixture: inline-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/hasTexts/inline.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/hasTexts/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/isBlock/block.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/isBlock/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/isBlock/inline.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/isBlock/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/isEdge/path-end.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/isEdge/path-end.tsx:1` fixture: path-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/isEdge/path-middle.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/isEdge/path-middle.tsx:1` fixture: path-middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/isEdge/path-start.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/isEdge/path-start.tsx:1` fixture: path-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/isEmpty/block-blank.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/isEmpty/block-blank.tsx:1` fixture: block-blank (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/isEmpty/block-empty.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/isEmpty/block-empty.tsx:1` fixture: block-empty (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/isEmpty/block-full.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/isEmpty/block-full.tsx:1` fixture: block-full (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/isEmpty/block-void.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/isEmpty/block-void.tsx:1` fixture: block-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/isEmpty/inline-blank.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/isEmpty/inline-blank.tsx:1` fixture: inline-blank (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/isEmpty/inline-empty.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/isEmpty/inline-empty.tsx:1` fixture: inline-empty (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/isEmpty/inline-full.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/isEmpty/inline-full.tsx:1` fixture: inline-full (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/isEmpty/inline-void.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/isEmpty/inline-void.tsx:1` fixture: inline-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/isEnd/path-end.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/isEnd/path-end.tsx:1` fixture: path-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/isEnd/path-middle.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/isEnd/path-middle.tsx:1` fixture: path-middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/isEnd/path-start.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/isEnd/path-start.tsx:1` fixture: path-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/isInline/block.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/isInline/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/isInline/inline.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/isInline/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/isStart/path-end.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/isStart/path-end.tsx:1` fixture: path-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/isStart/path-middle.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/isStart/path-middle.tsx:1` fixture: path-middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/isStart/path-start.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/isStart/path-start.tsx:1` fixture: path-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/isVoid/block-void.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/isVoid/block-void.tsx:1` fixture: block-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/isVoid/block.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/isVoid/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/isVoid/inline-void.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/isVoid/inline-void.tsx:1` fixture: inline-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/isVoid/inline.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/isVoid/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/levels/match.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/levels/match.tsx:1` fixture: match (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/levels/reverse.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/levels/reverse.tsx:1` fixture: reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/levels/success.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/levels/success.tsx:1` fixture: success (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/levels/voids-false.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/levels/voids-false.tsx:1` fixture: voids-false (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/levels/voids-true.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/levels/voids-true.tsx:1` fixture: voids-true (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/marks/firefox-double-click.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/marks/firefox-double-click.tsx:1` fixture: firefox-double-click (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/marks/focus-block-end.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/marks/focus-block-end.tsx:1` fixture: focus-block-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/marks/markable-void-collapsed.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/marks/markable-void-collapsed.tsx:1` fixture: markable-void-collapsed (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/marks/markable-voids-mixed.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/marks/markable-voids-mixed.tsx:1` fixture: markable-voids-mixed (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/marks/mixed-text.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/marks/mixed-text.tsx:1` fixture: mixed-text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/marks/text-collapsed.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/marks/text-collapsed.tsx:1` fixture: text-collapsed (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/next/block.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/next/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/next/default.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/next/default.tsx:1` fixture: default (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/next/text.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/next/text.tsx:1` fixture: text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/node/path.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/node/path.tsx:1` fixture: path (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/node/point.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/node/point.tsx:1` fixture: point (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/node/range-end.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/node/range-end.tsx:1` fixture: range-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/node/range-start.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/node/range-start.tsx:1` fixture: range-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/node/range.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/node/range.tsx:1` fixture: range (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/nodes/match-function/block.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/nodes/match-function/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/nodes/match-function/editor.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/nodes/match-function/editor.tsx:1` fixture: editor (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/nodes/match-function/inline.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/nodes/match-function/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/nodes/mode-all/block.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/nodes/mode-all/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/nodes/mode-highest/block.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/nodes/mode-highest/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/nodes/mode-lowest/block.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/nodes/mode-lowest/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/nodes/mode-universal/all-nested.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/nodes/mode-universal/all-nested.tsx:1` fixture: all-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/nodes/mode-universal/all.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/nodes/mode-universal/all.tsx:1` fixture: all (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/nodes/mode-universal/branch-nested.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/nodes/mode-universal/branch-nested.tsx:1` fixture: branch-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/nodes/mode-universal/none-nested.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/nodes/mode-universal/none-nested.tsx:1` fixture: none-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/nodes/mode-universal/none.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/nodes/mode-universal/none.tsx:1` fixture: none (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/nodes/mode-universal/some-nested.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/nodes/mode-universal/some-nested.tsx:1` fixture: some-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/nodes/mode-universal/some.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/nodes/mode-universal/some.tsx:1` fixture: some (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/nodes/no-match/block-multiple.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/nodes/no-match/block-multiple.tsx:1` fixture: block-multiple (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/nodes/no-match/block-nested.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/nodes/no-match/block-nested.tsx:1` fixture: block-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/nodes/no-match/block-reverse.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/nodes/no-match/block-reverse.tsx:1` fixture: block-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/nodes/no-match/block-void.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/nodes/no-match/block-void.tsx:1` fixture: block-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/nodes/no-match/block.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/nodes/no-match/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/nodes/no-match/inline-multiple.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/nodes/no-match/inline-multiple.tsx:1` fixture: inline-multiple (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/nodes/no-match/inline-nested.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/nodes/no-match/inline-nested.tsx:1` fixture: inline-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/nodes/no-match/inline-reverse.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/nodes/no-match/inline-reverse.tsx:1` fixture: inline-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/nodes/no-match/inline-void.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/nodes/no-match/inline-void.tsx:1` fixture: inline-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/nodes/no-match/inline.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/nodes/no-match/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/nodes/pass/block.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/nodes/pass/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/nodes/voids-true/block.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/nodes/voids-true/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/nodes/voids-true/inline.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/nodes/voids-true/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/parent/path.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/parent/path.tsx:1` fixture: path (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/parent/point.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/parent/point.tsx:1` fixture: point (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/parent/range-end.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/parent/range-end.tsx:1` fixture: range-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/parent/range-start.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/parent/range-start.tsx:1` fixture: range-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/parent/range.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/parent/range.tsx:1` fixture: range (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/path/path.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/path/path.tsx:1` fixture: path (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/path/point.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/path/point.tsx:1` fixture: point (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/path/range-end.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/path/range-end.tsx:1` fixture: range-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/path/range-start.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/path/range-start.tsx:1` fixture: range-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/path/range.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/path/range.tsx:1` fixture: range (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/point/path-end.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/point/path-end.tsx:1` fixture: path-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/point/path-start.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/point/path-start.tsx:1` fixture: path-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/point/path.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/point/path.tsx:1` fixture: path (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/point/point.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/point/point.tsx:1` fixture: point (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/point/range-end.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/point/range-end.tsx:1` fixture: range-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/point/range-start.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/point/range-start.tsx:1` fixture: range-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/point/range.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/point/range.tsx:1` fixture: range (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/block-multiple-reverse.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/block-multiple-reverse.tsx:1` fixture: block-multiple-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/block-multiple.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/block-multiple.tsx:1` fixture: block-multiple (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/block-nested.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/block-nested.tsx:1` fixture: block-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/block-reverse.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/block-reverse.tsx:1` fixture: block-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/block.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/inline-fragmentation-empty-text.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/inline-fragmentation-empty-text.tsx:1` fixture: inline-fragmentation-empty-text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/inline-fragmentation-reverse.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/inline-fragmentation-reverse.tsx:1` fixture: inline-fragmentation-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/inline-fragmentation.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/inline-fragmentation.tsx:1` fixture: inline-fragmentation (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/inline-multiple.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/inline-multiple.tsx:1` fixture: inline-multiple (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/inline-nested.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/inline-nested.tsx:1` fixture: inline-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/inline-normalized.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/inline-normalized.tsx:1` fixture: inline-normalized (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/inline-reverse.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/inline-reverse.tsx:1` fixture: inline-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/inline.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/unit-block-reverse.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/unit-block-reverse.tsx:1` fixture: unit-block-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/unit-block.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/unit-block.tsx:1` fixture: unit-block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/unit-character-inline-fragmentation-multibyte.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/unit-character-inline-fragmentation-multibyte.tsx:1` fixture: unit-character-inline-fragmentation-multibyte (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/unit-character-inline-fragmentation-reverse.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/unit-character-inline-fragmentation-reverse.tsx:1` fixture: unit-character-inline-fragmentation-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/unit-character-inline-fragmentation.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/unit-character-inline-fragmentation.tsx:1` fixture: unit-character-inline-fragmentation (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/unit-character-reverse.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/unit-character-reverse.tsx:1` fixture: unit-character-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/unit-character.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/unit-character.tsx:1` fixture: unit-character (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/unit-line-inline-fragmentation-reverse.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/unit-line-inline-fragmentation-reverse.tsx:1` fixture: unit-line-inline-fragmentation-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/unit-line-inline-fragmentation.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/unit-line-inline-fragmentation.tsx:1` fixture: unit-line-inline-fragmentation (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/unit-line-reverse.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/unit-line-reverse.tsx:1` fixture: unit-line-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/unit-line.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/unit-line.tsx:1` fixture: unit-line (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/unit-word-inline-fragmentation.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/unit-word-inline-fragmentation.tsx:1` fixture: unit-word-inline-fragmentation (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/unit-word-reverse.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/unit-word-reverse.tsx:1` fixture: unit-word-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/unit-word.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/all/unit-word.tsx:1` fixture: unit-word (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/path/block-nested.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/path/block-nested.tsx:1` fixture: block-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/path/block-reverse.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/path/block-reverse.tsx:1` fixture: block-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/path/block.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/path/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/path/inline-nested.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/path/inline-nested.tsx:1` fixture: inline-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/path/inline-reverse.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/path/inline-reverse.tsx:1` fixture: inline-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/path/inline.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/path/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/range/block-reverse.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/range/block-reverse.tsx:1` fixture: block-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/range/block.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/range/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/range/inline.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/range/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/voids-true/block-all-reverse.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/voids-true/block-all-reverse.tsx:1` fixture: block-all-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/voids-true/block-all.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/voids-true/block-all.tsx:1` fixture: block-all (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/voids-true/inline-all-reverse.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/voids-true/inline-all-reverse.tsx:1` fixture: inline-all-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/positions/voids-true/inline-all.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/positions/voids-true/inline-all.tsx:1` fixture: inline-all (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/previous/block.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/previous/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/previous/default.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/previous/default.tsx:1` fixture: default (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/previous/text.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/previous/text.tsx:1` fixture: text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/range/path.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/range/path.tsx:1` fixture: path (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/range/point.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/range/point.tsx:1` fixture: point (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/range/range-backward.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/range/range-backward.tsx:1` fixture: range-backward (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/range/range.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/range/range.tsx:1` fixture: range (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/start/path.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/start/path.tsx:1` fixture: path (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/start/point.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/start/point.tsx:1` fixture: point (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/start/range.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/start/range.tsx:1` fixture: range (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/string/block-across.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/string/block-across.tsx:1` fixture: block-across (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/string/block-void.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/string/block-void.tsx:1` fixture: block-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/string/block-voids-true.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/string/block-voids-true.tsx:1` fixture: block-voids-true (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/string/block.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/string/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/string/inline.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/string/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/string/text.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/string/text.tsx:1` fixture: text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/unhangRange/block-hanging-over-non-empty-void-with-voids-option.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/unhangRange/block-hanging-over-non-empty-void-with-voids-option.tsx:1` fixture: block-hanging-over-non-empty-void-with-voids-option (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/unhangRange/block-hanging-over-void-with-voids-option.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/unhangRange/block-hanging-over-void-with-voids-option.tsx:1` fixture: block-hanging-over-void-with-voids-option (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/unhangRange/block-hanging-over-void.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/unhangRange/block-hanging-over-void.tsx:1` fixture: block-hanging-over-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/unhangRange/block-hanging.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/unhangRange/block-hanging.tsx:1` fixture: block-hanging (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/unhangRange/collapsed.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/unhangRange/collapsed.tsx:1` fixture: collapsed (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/unhangRange/inline-at-end.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/unhangRange/inline-at-end.tsx:1` fixture: inline-at-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/unhangRange/inline-range-normal.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/unhangRange/inline-range-normal.tsx:1` fixture: inline-range-normal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/unhangRange/multi-block-inline-at-end.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/unhangRange/multi-block-inline-at-end.tsx:1` fixture: multi-block-inline-at-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/unhangRange/not-hanging-inline-at-end.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/unhangRange/not-hanging-inline-at-end.tsx:1` fixture: not-hanging-inline-at-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/unhangRange/not-hanging-multi-block-inline-at-end.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/unhangRange/not-hanging-multi-block-inline-at-end.tsx:1` fixture: not-hanging-multi-block-inline-at-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/unhangRange/text-hanging.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/unhangRange/text-hanging.tsx:1` fixture: text-hanging (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/unhangRange/void-hanging-with-voids-option.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/unhangRange/void-hanging-with-voids-option.tsx:1` fixture: void-hanging-with-voids-option (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Editor/unhangRange/void-hanging.tsx`

category: portable
family: interface/Editor

- `../slate-audit/packages/slate/test/interfaces/Editor/unhangRange/void-hanging.tsx:1` fixture: void-hanging (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Element/isElement/boolean.tsx`

category: portable
family: interface/Element

- `../slate-audit/packages/slate/test/interfaces/Element/isElement/boolean.tsx:1` fixture: boolean (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Element/isElement/custom-property.tsx`

category: portable
family: interface/Element

- `../slate-audit/packages/slate/test/interfaces/Element/isElement/custom-property.tsx:1` fixture: custom-property (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Element/isElement/editor.tsx`

category: portable
family: interface/Element

- `../slate-audit/packages/slate/test/interfaces/Element/isElement/editor.tsx:1` fixture: editor (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Element/isElement/element.tsx`

category: portable
family: interface/Element

- `../slate-audit/packages/slate/test/interfaces/Element/isElement/element.tsx:1` fixture: element (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Element/isElement/isElementDiscriminant.tsx`

category: portable
family: interface/Element

- `../slate-audit/packages/slate/test/interfaces/Element/isElement/isElementDiscriminant.tsx:1` fixture: isElementDiscriminant (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Element/isElement/isElementDiscriminantFalse.tsx`

category: portable
family: interface/Element

- `../slate-audit/packages/slate/test/interfaces/Element/isElement/isElementDiscriminantFalse.tsx:1` fixture: isElementDiscriminantFalse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Element/isElement/isElementType.tsx`

category: portable
family: interface/Element

- `../slate-audit/packages/slate/test/interfaces/Element/isElement/isElementType.tsx:1` fixture: isElementType (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Element/isElement/isElementTypeFalse.tsx`

category: portable
family: interface/Element

- `../slate-audit/packages/slate/test/interfaces/Element/isElement/isElementTypeFalse.tsx:1` fixture: isElementTypeFalse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Element/isElement/nodes-full.tsx`

category: portable
family: interface/Element

- `../slate-audit/packages/slate/test/interfaces/Element/isElement/nodes-full.tsx:1` fixture: nodes-full (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Element/isElement/object.tsx`

category: portable
family: interface/Element

- `../slate-audit/packages/slate/test/interfaces/Element/isElement/object.tsx:1` fixture: object (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Element/isElement/text.tsx`

category: portable
family: interface/Element

- `../slate-audit/packages/slate/test/interfaces/Element/isElement/text.tsx:1` fixture: text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Element/isElementList/boolean.tsx`

category: portable
family: interface/Element

- `../slate-audit/packages/slate/test/interfaces/Element/isElementList/boolean.tsx:1` fixture: boolean (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Element/isElementList/element.tsx`

category: portable
family: interface/Element

- `../slate-audit/packages/slate/test/interfaces/Element/isElementList/element.tsx:1` fixture: element (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Element/isElementList/empty.tsx`

category: portable
family: interface/Element

- `../slate-audit/packages/slate/test/interfaces/Element/isElementList/empty.tsx:1` fixture: empty (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Element/isElementList/full-editor.tsx`

category: portable
family: interface/Element

- `../slate-audit/packages/slate/test/interfaces/Element/isElementList/full-editor.tsx:1` fixture: full-editor (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Element/isElementList/full-element.tsx`

category: portable
family: interface/Element

- `../slate-audit/packages/slate/test/interfaces/Element/isElementList/full-element.tsx:1` fixture: full-element (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Element/isElementList/full-text.tsx`

category: portable
family: interface/Element

- `../slate-audit/packages/slate/test/interfaces/Element/isElementList/full-text.tsx:1` fixture: full-text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Element/isElementList/not-full-element.tsx`

category: portable
family: interface/Element

- `../slate-audit/packages/slate/test/interfaces/Element/isElementList/not-full-element.tsx:1` fixture: not-full-element (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Element/matches/custom-prop-match.tsx`

category: portable
family: interface/Element

- `../slate-audit/packages/slate/test/interfaces/Element/matches/custom-prop-match.tsx:1` fixture: custom-prop-match (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Element/matches/custom-prop-not-match.tsx`

category: portable
family: interface/Element

- `../slate-audit/packages/slate/test/interfaces/Element/matches/custom-prop-not-match.tsx:1` fixture: custom-prop-not-match (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Element/matches/empty-match.tsx`

category: portable
family: interface/Element

- `../slate-audit/packages/slate/test/interfaces/Element/matches/empty-match.tsx:1` fixture: empty-match (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Location/isPath/customPoint.tsx`

category: portable
family: interface/Location

- `../slate-audit/packages/slate/test/interfaces/Location/isPath/customPoint.tsx:1` fixture: customPoint (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Location/isPath/customRange.tsx`

category: portable
family: interface/Location

- `../slate-audit/packages/slate/test/interfaces/Location/isPath/customRange.tsx:1` fixture: customRange (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Location/isPath/emptyPath.tsx`

category: portable
family: interface/Location

- `../slate-audit/packages/slate/test/interfaces/Location/isPath/emptyPath.tsx:1` fixture: emptyPath (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Location/isPath/path.tsx`

category: portable
family: interface/Location

- `../slate-audit/packages/slate/test/interfaces/Location/isPath/path.tsx:1` fixture: path (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Location/isPath/point.tsx`

category: portable
family: interface/Location

- `../slate-audit/packages/slate/test/interfaces/Location/isPath/point.tsx:1` fixture: point (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Location/isPath/range.tsx`

category: portable
family: interface/Location

- `../slate-audit/packages/slate/test/interfaces/Location/isPath/range.tsx:1` fixture: range (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Location/isPoint/customPoint.tsx`

category: portable
family: interface/Location

- `../slate-audit/packages/slate/test/interfaces/Location/isPoint/customPoint.tsx:1` fixture: customPoint (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Location/isPoint/customRange.tsx`

category: portable
family: interface/Location

- `../slate-audit/packages/slate/test/interfaces/Location/isPoint/customRange.tsx:1` fixture: customRange (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Location/isPoint/emptyPath.tsx`

category: portable
family: interface/Location

- `../slate-audit/packages/slate/test/interfaces/Location/isPoint/emptyPath.tsx:1` fixture: emptyPath (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Location/isPoint/path.tsx`

category: portable
family: interface/Location

- `../slate-audit/packages/slate/test/interfaces/Location/isPoint/path.tsx:1` fixture: path (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Location/isPoint/point.tsx`

category: portable
family: interface/Location

- `../slate-audit/packages/slate/test/interfaces/Location/isPoint/point.tsx:1` fixture: point (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Location/isPoint/range.tsx`

category: portable
family: interface/Location

- `../slate-audit/packages/slate/test/interfaces/Location/isPoint/range.tsx:1` fixture: range (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Location/isRange/customPoint.tsx`

category: portable
family: interface/Location

- `../slate-audit/packages/slate/test/interfaces/Location/isRange/customPoint.tsx:1` fixture: customPoint (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Location/isRange/customRange.tsx`

category: portable
family: interface/Location

- `../slate-audit/packages/slate/test/interfaces/Location/isRange/customRange.tsx:1` fixture: customRange (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Location/isRange/emptyPath.tsx`

category: portable
family: interface/Location

- `../slate-audit/packages/slate/test/interfaces/Location/isRange/emptyPath.tsx:1` fixture: emptyPath (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Location/isRange/path.tsx`

category: portable
family: interface/Location

- `../slate-audit/packages/slate/test/interfaces/Location/isRange/path.tsx:1` fixture: path (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Location/isRange/point.tsx`

category: portable
family: interface/Location

- `../slate-audit/packages/slate/test/interfaces/Location/isRange/point.tsx:1` fixture: point (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Location/isRange/range.tsx`

category: portable
family: interface/Location

- `../slate-audit/packages/slate/test/interfaces/Location/isRange/range.tsx:1` fixture: range (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Location/isSpan/customPoint.tsx`

category: portable
family: interface/Location

- `../slate-audit/packages/slate/test/interfaces/Location/isSpan/customPoint.tsx:1` fixture: customPoint (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Location/isSpan/customRange.tsx`

category: portable
family: interface/Location

- `../slate-audit/packages/slate/test/interfaces/Location/isSpan/customRange.tsx:1` fixture: customRange (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Location/isSpan/emptyPath.tsx`

category: portable
family: interface/Location

- `../slate-audit/packages/slate/test/interfaces/Location/isSpan/emptyPath.tsx:1` fixture: emptyPath (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Location/isSpan/path.tsx`

category: portable
family: interface/Location

- `../slate-audit/packages/slate/test/interfaces/Location/isSpan/path.tsx:1` fixture: path (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Location/isSpan/point.tsx`

category: portable
family: interface/Location

- `../slate-audit/packages/slate/test/interfaces/Location/isSpan/point.tsx:1` fixture: point (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Location/isSpan/range.tsx`

category: portable
family: interface/Location

- `../slate-audit/packages/slate/test/interfaces/Location/isSpan/range.tsx:1` fixture: range (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Location/isSpan/span.tsx`

category: portable
family: interface/Location

- `../slate-audit/packages/slate/test/interfaces/Location/isSpan/span.tsx:1` fixture: span (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/ancestor/success.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/ancestor/success.tsx:1` fixture: success (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/ancestors/reverse.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/ancestors/reverse.tsx:1` fixture: reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/ancestors/success.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/ancestors/success.tsx:1` fixture: success (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/child/success.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/child/success.tsx:1` fixture: success (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/children/all.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/children/all.tsx:1` fixture: all (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/children/reverse.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/children/reverse.tsx:1` fixture: reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/descendant/success.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/descendant/success.tsx:1` fixture: success (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/descendants/all.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/descendants/all.tsx:1` fixture: all (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/descendants/from.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/descendants/from.tsx:1` fixture: from (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/descendants/reverse.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/descendants/reverse.tsx:1` fixture: reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/descendants/to.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/descendants/to.tsx:1` fixture: to (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/elements/all.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/elements/all.tsx:1` fixture: all (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/elements/path.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/elements/path.tsx:1` fixture: path (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/elements/range.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/elements/range.tsx:1` fixture: range (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/elements/reverse.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/elements/reverse.tsx:1` fixture: reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/first/success.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/first/success.tsx:1` fixture: success (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/get/root.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/get/root.tsx:1` fixture: root (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/get/success.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/get/success.tsx:1` fixture: success (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/getIf/proto.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/getIf/proto.tsx:1` fixture: proto (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/getIf/root.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/getIf/root.tsx:1` fixture: root (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/getIf/success.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/getIf/success.tsx:1` fixture: success (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/getIf/undefined.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/getIf/undefined.tsx:1` fixture: undefined (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/isNode/boolean.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/isNode/boolean.tsx:1` fixture: boolean (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/isNode/custom-property.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/isNode/custom-property.tsx:1` fixture: custom-property (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/isNode/element.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/isNode/element.tsx:1` fixture: element (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/isNode/object.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/isNode/object.tsx:1` fixture: object (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/isNode/text.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/isNode/text.tsx:1` fixture: text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/isNode/value.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/isNode/value.tsx:1` fixture: value (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/isNodeList/boolean.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/isNodeList/boolean.tsx:1` fixture: boolean (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/isNodeList/element.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/isNodeList/element.tsx:1` fixture: element (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/isNodeList/empty.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/isNodeList/empty.tsx:1` fixture: empty (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/isNodeList/full-element.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/isNodeList/full-element.tsx:1` fixture: full-element (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/isNodeList/full-text.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/isNodeList/full-text.tsx:1` fixture: full-text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/isNodeList/full-value.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/isNodeList/full-value.tsx:1` fixture: full-value (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/isNodeList/not-full-node.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/isNodeList/not-full-node.tsx:1` fixture: not-full-node (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/leaf/success.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/leaf/success.tsx:1` fixture: success (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/levels/reverse.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/levels/reverse.tsx:1` fixture: reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/levels/success.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/levels/success.tsx:1` fixture: success (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/nodes/all.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/nodes/all.tsx:1` fixture: all (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/nodes/multiple-elements.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/nodes/multiple-elements.tsx:1` fixture: multiple-elements (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/nodes/nested-elements.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/nodes/nested-elements.tsx:1` fixture: nested-elements (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/nodes/pass.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/nodes/pass.tsx:1` fixture: pass (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/nodes/to.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/nodes/to.tsx:1` fixture: to (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/parent/success.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/parent/success.tsx:1` fixture: success (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/string/across-elements.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/string/across-elements.tsx:1` fixture: across-elements (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/string/element.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/string/element.tsx:1` fixture: element (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/string/text.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/string/text.tsx:1` fixture: text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/texts/all.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/texts/all.tsx:1` fixture: all (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/texts/from.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/texts/from.tsx:1` fixture: from (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/texts/multiple-elements.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/texts/multiple-elements.tsx:1` fixture: multiple-elements (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/texts/reverse.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/texts/reverse.tsx:1` fixture: reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Node/texts/to.tsx`

category: portable
family: interface/Node

- `../slate-audit/packages/slate/test/interfaces/Node/texts/to.tsx:1` fixture: to (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Operation/inverse/moveNode/backward-in-parent.tsx`

category: portable
family: interface/Operation

- `../slate-audit/packages/slate/test/interfaces/Operation/inverse/moveNode/backward-in-parent.tsx:1` fixture: backward-in-parent (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Operation/inverse/moveNode/child-to-ends-after-parent.tsx`

category: portable
family: interface/Operation

- `../slate-audit/packages/slate/test/interfaces/Operation/inverse/moveNode/child-to-ends-after-parent.tsx:1` fixture: child-to-ends-after-parent (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Operation/inverse/moveNode/child-to-ends-before-parent.tsx`

category: portable
family: interface/Operation

- `../slate-audit/packages/slate/test/interfaces/Operation/inverse/moveNode/child-to-ends-before-parent.tsx:1` fixture: child-to-ends-before-parent (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Operation/inverse/moveNode/child-to-parent.tsx`

category: portable
family: interface/Operation

- `../slate-audit/packages/slate/test/interfaces/Operation/inverse/moveNode/child-to-parent.tsx:1` fixture: child-to-parent (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Operation/inverse/moveNode/ends-after-parent-to-child.tsx`

category: portable
family: interface/Operation

- `../slate-audit/packages/slate/test/interfaces/Operation/inverse/moveNode/ends-after-parent-to-child.tsx:1` fixture: ends-after-parent-to-child (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Operation/inverse/moveNode/ends-before-parent-to-child.tsx`

category: portable
family: interface/Operation

- `../slate-audit/packages/slate/test/interfaces/Operation/inverse/moveNode/ends-before-parent-to-child.tsx:1` fixture: ends-before-parent-to-child (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Operation/inverse/moveNode/forward-in-parent.tsx`

category: portable
family: interface/Operation

- `../slate-audit/packages/slate/test/interfaces/Operation/inverse/moveNode/forward-in-parent.tsx:1` fixture: forward-in-parent (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Operation/inverse/moveNode/non-sibling.tsx`

category: portable
family: interface/Operation

- `../slate-audit/packages/slate/test/interfaces/Operation/inverse/moveNode/non-sibling.tsx:1` fixture: non-sibling (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Operation/isOperation/boolean.tsx`

category: portable
family: interface/Operation

- `../slate-audit/packages/slate/test/interfaces/Operation/isOperation/boolean.tsx:1` fixture: boolean (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Operation/isOperation/custom-property.tsx`

category: portable
family: interface/Operation

- `../slate-audit/packages/slate/test/interfaces/Operation/isOperation/custom-property.tsx:1` fixture: custom-property (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Operation/isOperation/insert_node.tsx`

category: portable
family: interface/Operation

- `../slate-audit/packages/slate/test/interfaces/Operation/isOperation/insert_node.tsx:1` fixture: insert_node (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Operation/isOperation/insert_text.tsx`

category: portable
family: interface/Operation

- `../slate-audit/packages/slate/test/interfaces/Operation/isOperation/insert_text.tsx:1` fixture: insert_text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Operation/isOperation/merge_node.tsx`

category: portable
family: interface/Operation

- `../slate-audit/packages/slate/test/interfaces/Operation/isOperation/merge_node.tsx:1` fixture: merge_node (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Operation/isOperation/move_node.tsx`

category: portable
family: interface/Operation

- `../slate-audit/packages/slate/test/interfaces/Operation/isOperation/move_node.tsx:1` fixture: move_node (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Operation/isOperation/object.tsx`

category: portable
family: interface/Operation

- `../slate-audit/packages/slate/test/interfaces/Operation/isOperation/object.tsx:1` fixture: object (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Operation/isOperation/remove_node.tsx`

category: portable
family: interface/Operation

- `../slate-audit/packages/slate/test/interfaces/Operation/isOperation/remove_node.tsx:1` fixture: remove_node (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Operation/isOperation/remove_text.tsx`

category: portable
family: interface/Operation

- `../slate-audit/packages/slate/test/interfaces/Operation/isOperation/remove_text.tsx:1` fixture: remove_text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Operation/isOperation/set_node.tsx`

category: portable
family: interface/Operation

- `../slate-audit/packages/slate/test/interfaces/Operation/isOperation/set_node.tsx:1` fixture: set_node (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Operation/isOperation/set_selection.tsx`

category: portable
family: interface/Operation

- `../slate-audit/packages/slate/test/interfaces/Operation/isOperation/set_selection.tsx:1` fixture: set_selection (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Operation/isOperation/split_node.tsx`

category: portable
family: interface/Operation

- `../slate-audit/packages/slate/test/interfaces/Operation/isOperation/split_node.tsx:1` fixture: split_node (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Operation/isOperation/without-type.tsx`

category: portable
family: interface/Operation

- `../slate-audit/packages/slate/test/interfaces/Operation/isOperation/without-type.tsx:1` fixture: without-type (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Operation/isOperationList/boolean.tsx`

category: portable
family: interface/Operation

- `../slate-audit/packages/slate/test/interfaces/Operation/isOperationList/boolean.tsx:1` fixture: boolean (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Operation/isOperationList/empty.tsx`

category: portable
family: interface/Operation

- `../slate-audit/packages/slate/test/interfaces/Operation/isOperationList/empty.tsx:1` fixture: empty (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Operation/isOperationList/full.tsx`

category: portable
family: interface/Operation

- `../slate-audit/packages/slate/test/interfaces/Operation/isOperationList/full.tsx:1` fixture: full (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Operation/isOperationList/not-full-operaion.tsx`

category: portable
family: interface/Operation

- `../slate-audit/packages/slate/test/interfaces/Operation/isOperationList/not-full-operaion.tsx:1` fixture: not-full-operaion (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Operation/isOperationList/operation.tsx`

category: portable
family: interface/Operation

- `../slate-audit/packages/slate/test/interfaces/Operation/isOperationList/operation.tsx:1` fixture: operation (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/ancestors/reverse.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/ancestors/reverse.tsx:1` fixture: reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/ancestors/success.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/ancestors/success.tsx:1` fixture: success (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/common/equal.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/common/equal.tsx:1` fixture: equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/common/root.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/common/root.tsx:1` fixture: root (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/common/success.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/common/success.tsx:1` fixture: success (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/compare/above.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/compare/above.tsx:1` fixture: above (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/compare/after.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/compare/after.tsx:1` fixture: after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/compare/before.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/compare/before.tsx:1` fixture: before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/compare/below.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/compare/below.tsx:1` fixture: below (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/compare/equal.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/compare/equal.tsx:1` fixture: equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/compare/root.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/compare/root.tsx:1` fixture: root (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/endsAfter/above.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/endsAfter/above.tsx:1` fixture: above (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/endsAfter/after.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/endsAfter/after.tsx:1` fixture: after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/endsAfter/before.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/endsAfter/before.tsx:1` fixture: before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/endsAfter/below.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/endsAfter/below.tsx:1` fixture: below (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/endsAfter/ends-after.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/endsAfter/ends-after.tsx:1` fixture: ends-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/endsAfter/ends-at.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/endsAfter/ends-at.tsx:1` fixture: ends-at (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/endsAfter/ends-before.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/endsAfter/ends-before.tsx:1` fixture: ends-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/endsAfter/equal.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/endsAfter/equal.tsx:1` fixture: equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/endsAfter/root.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/endsAfter/root.tsx:1` fixture: root (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/endsAt/above.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/endsAt/above.tsx:1` fixture: above (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/endsAt/after.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/endsAt/after.tsx:1` fixture: after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/endsAt/before.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/endsAt/before.tsx:1` fixture: before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/endsAt/ends-after.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/endsAt/ends-after.tsx:1` fixture: ends-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/endsAt/ends-at.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/endsAt/ends-at.tsx:1` fixture: ends-at (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/endsAt/ends-before.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/endsAt/ends-before.tsx:1` fixture: ends-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/endsAt/equal.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/endsAt/equal.tsx:1` fixture: equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/endsAt/root.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/endsAt/root.tsx:1` fixture: root (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/endsBefore/above.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/endsBefore/above.tsx:1` fixture: above (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/endsBefore/after.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/endsBefore/after.tsx:1` fixture: after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/endsBefore/before.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/endsBefore/before.tsx:1` fixture: before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/endsBefore/below.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/endsBefore/below.tsx:1` fixture: below (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/endsBefore/ends-after.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/endsBefore/ends-after.tsx:1` fixture: ends-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/endsBefore/ends-at.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/endsBefore/ends-at.tsx:1` fixture: ends-at (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/endsBefore/ends-before.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/endsBefore/ends-before.tsx:1` fixture: ends-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/endsBefore/equal.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/endsBefore/equal.tsx:1` fixture: equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/endsBefore/root.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/endsBefore/root.tsx:1` fixture: root (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/equals/above.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/equals/above.tsx:1` fixture: above (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/equals/after.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/equals/after.tsx:1` fixture: after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/equals/before.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/equals/before.tsx:1` fixture: before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/equals/below.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/equals/below.tsx:1` fixture: below (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/equals/equal.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/equals/equal.tsx:1` fixture: equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/equals/root.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/equals/root.tsx:1` fixture: root (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/hasPrevious/root.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/hasPrevious/root.tsx:1` fixture: root (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/hasPrevious/success.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/hasPrevious/success.tsx:1` fixture: success (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isAfter/above.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isAfter/above.tsx:1` fixture: above (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isAfter/after.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isAfter/after.tsx:1` fixture: after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isAfter/before.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isAfter/before.tsx:1` fixture: before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isAfter/below.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isAfter/below.tsx:1` fixture: below (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isAfter/equal.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isAfter/equal.tsx:1` fixture: equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isAncestor/above-grandparent.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isAncestor/above-grandparent.tsx:1` fixture: above-grandparent (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isAncestor/above-parent.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isAncestor/above-parent.tsx:1` fixture: above-parent (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isAncestor/after.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isAncestor/after.tsx:1` fixture: after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isAncestor/before.js`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isAncestor/before.js:1` fixture: before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isAncestor/before.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isAncestor/before.tsx:1` fixture: before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isAncestor/below.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isAncestor/below.tsx:1` fixture: below (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isAncestor/equal.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isAncestor/equal.tsx:1` fixture: equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isBefore/above.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isBefore/above.tsx:1` fixture: above (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isBefore/after.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isBefore/after.tsx:1` fixture: after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isBefore/before.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isBefore/before.tsx:1` fixture: before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isBefore/below.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isBefore/below.tsx:1` fixture: below (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isBefore/equal.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isBefore/equal.tsx:1` fixture: equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isChild/above.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isChild/above.tsx:1` fixture: above (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isChild/after.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isChild/after.tsx:1` fixture: after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isChild/before.js`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isChild/before.js:1` fixture: before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isChild/before.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isChild/before.tsx:1` fixture: before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isChild/below-child.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isChild/below-child.tsx:1` fixture: below-child (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isChild/below-grandchild.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isChild/below-grandchild.tsx:1` fixture: below-grandchild (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isChild/equal.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isChild/equal.tsx:1` fixture: equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isDescendant/above.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isDescendant/above.tsx:1` fixture: above (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isDescendant/after.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isDescendant/after.tsx:1` fixture: after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isDescendant/before.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isDescendant/before.tsx:1` fixture: before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isDescendant/below-child.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isDescendant/below-child.tsx:1` fixture: below-child (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isDescendant/below-grandchild.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isDescendant/below-grandchild.tsx:1` fixture: below-grandchild (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isDescendant/equal.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isDescendant/equal.tsx:1` fixture: equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isParent/above-grandparent.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isParent/above-grandparent.tsx:1` fixture: above-grandparent (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isParent/above-parent.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isParent/above-parent.tsx:1` fixture: above-parent (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isParent/after.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isParent/after.tsx:1` fixture: after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isParent/before.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isParent/before.tsx:1` fixture: before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isParent/below.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isParent/below.tsx:1` fixture: below (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isParent/equal.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isParent/equal.tsx:1` fixture: equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isPath/boolean.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isPath/boolean.tsx:1` fixture: boolean (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isPath/empty.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isPath/empty.tsx:1` fixture: empty (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isPath/full.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isPath/full.tsx:1` fixture: full (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isPath/mixed.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isPath/mixed.tsx:1` fixture: mixed (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isPath/strings.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isPath/strings.tsx:1` fixture: strings (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isSibling/above.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isSibling/above.tsx:1` fixture: above (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isSibling/after-sibling.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isSibling/after-sibling.tsx:1` fixture: after-sibling (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isSibling/after.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isSibling/after.tsx:1` fixture: after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isSibling/before-sibling.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isSibling/before-sibling.tsx:1` fixture: before-sibling (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isSibling/before.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isSibling/before.tsx:1` fixture: before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isSibling/below.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isSibling/below.tsx:1` fixture: below (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/isSibling/equal.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/isSibling/equal.tsx:1` fixture: equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/levels/reverse.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/levels/reverse.tsx:1` fixture: reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/levels/success.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/levels/success.tsx:1` fixture: success (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/next/success.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/next/success.tsx:1` fixture: success (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/parent/success.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/parent/success.tsx:1` fixture: success (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/previous/success.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/previous/success.tsx:1` fixture: success (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/relative/grandparent.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/relative/grandparent.tsx:1` fixture: grandparent (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/relative/parent.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/relative/parent.tsx:1` fixture: parent (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/relative/root.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/relative/root.tsx:1` fixture: root (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/ancestor-sibling-ends-after-to-ancestor.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/ancestor-sibling-ends-after-to-ancestor.tsx:1` fixture: ancestor-sibling-ends-after-to-ancestor (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/ancestor-sibling-ends-after-to-ends-after.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/ancestor-sibling-ends-after-to-ends-after.tsx:1` fixture: ancestor-sibling-ends-after-to-ends-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/ancestor-sibling-ends-before-to-ancestor.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/ancestor-sibling-ends-before-to-ancestor.tsx:1` fixture: ancestor-sibling-ends-before-to-ancestor (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/ancestor-sibling-ends-before-to-ends-after.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/ancestor-sibling-ends-before-to-ends-after.tsx:1` fixture: ancestor-sibling-ends-before-to-ends-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/ancestor-to-ends-after.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/ancestor-to-ends-after.tsx:1` fixture: ancestor-to-ends-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/ancestor-to-ends-before.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/ancestor-to-ends-before.tsx:1` fixture: ancestor-to-ends-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/ends-after-to-no-relation.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/ends-after-to-no-relation.tsx:1` fixture: ends-after-to-no-relation (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/ends-before-to-no-relation.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/ends-before-to-no-relation.tsx:1` fixture: ends-before-to-no-relation (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/equal-to-ends-after.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/equal-to-ends-after.tsx:1` fixture: equal-to-ends-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/equal-to-ends-before.js`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/equal-to-ends-before.js:1` fixture: equal-to-ends-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/equal-to-ends-before.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/equal-to-ends-before.tsx:1` fixture: equal-to-ends-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/no-relation-to-ends-after.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/no-relation-to-ends-after.tsx:1` fixture: no-relation-to-ends-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/no-relation-to-ends-before.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/no-relation-to-ends-before.tsx:1` fixture: no-relation-to-ends-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/parent-to-ends-after.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/parent-to-ends-after.tsx:1` fixture: parent-to-ends-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/parent-to-ends-before.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/parent-to-ends-before.tsx:1` fixture: parent-to-ends-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/sibling-ends-after-to-ends-equal.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/sibling-ends-after-to-ends-equal.tsx:1` fixture: sibling-ends-after-to-ends-equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/sibling-ends-after-to-sibling-ends-before.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/sibling-ends-after-to-sibling-ends-before.tsx:1` fixture: sibling-ends-after-to-sibling-ends-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/sibling-ends-before-to-ends-equal.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/sibling-ends-before-to-ends-equal.tsx:1` fixture: sibling-ends-before-to-ends-equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/sibling-ends-before-to-sibling-ends-after.tsx`

category: portable
family: interface/Path

- `../slate-audit/packages/slate/test/interfaces/Path/transform/move_node/sibling-ends-before-to-sibling-ends-after.tsx:1` fixture: sibling-ends-before-to-sibling-ends-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/compare/path-after-offset-after.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/compare/path-after-offset-after.tsx:1` fixture: path-after-offset-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/compare/path-after-offset-before.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/compare/path-after-offset-before.tsx:1` fixture: path-after-offset-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/compare/path-after-offset-equal.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/compare/path-after-offset-equal.tsx:1` fixture: path-after-offset-equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/compare/path-before-offset-after.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/compare/path-before-offset-after.tsx:1` fixture: path-before-offset-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/compare/path-before-offset-before.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/compare/path-before-offset-before.tsx:1` fixture: path-before-offset-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/compare/path-before-offset-equal.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/compare/path-before-offset-equal.tsx:1` fixture: path-before-offset-equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/compare/path-equal-offset-after.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/compare/path-equal-offset-after.tsx:1` fixture: path-equal-offset-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/compare/path-equal-offset-before.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/compare/path-equal-offset-before.tsx:1` fixture: path-equal-offset-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/compare/path-equal-offset-equal.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/compare/path-equal-offset-equal.tsx:1` fixture: path-equal-offset-equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/equals/path-after-offset-after.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/equals/path-after-offset-after.tsx:1` fixture: path-after-offset-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/equals/path-after-offset-before.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/equals/path-after-offset-before.tsx:1` fixture: path-after-offset-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/equals/path-after-offset-equal.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/equals/path-after-offset-equal.tsx:1` fixture: path-after-offset-equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/equals/path-before-offset-after.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/equals/path-before-offset-after.tsx:1` fixture: path-before-offset-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/equals/path-before-offset-before.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/equals/path-before-offset-before.tsx:1` fixture: path-before-offset-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/equals/path-before-offset-equal.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/equals/path-before-offset-equal.tsx:1` fixture: path-before-offset-equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/equals/path-equal-offset-after.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/equals/path-equal-offset-after.tsx:1` fixture: path-equal-offset-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/equals/path-equal-offset-before.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/equals/path-equal-offset-before.tsx:1` fixture: path-equal-offset-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/equals/path-equal-offset-equal.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/equals/path-equal-offset-equal.tsx:1` fixture: path-equal-offset-equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/isAfter/path-after-offset-after.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/isAfter/path-after-offset-after.tsx:1` fixture: path-after-offset-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/isAfter/path-after-offset-before.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/isAfter/path-after-offset-before.tsx:1` fixture: path-after-offset-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/isAfter/path-after-offset-equal.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/isAfter/path-after-offset-equal.tsx:1` fixture: path-after-offset-equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/isAfter/path-before-offset-after.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/isAfter/path-before-offset-after.tsx:1` fixture: path-before-offset-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/isAfter/path-before-offset-before.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/isAfter/path-before-offset-before.tsx:1` fixture: path-before-offset-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/isAfter/path-before-offset-equal.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/isAfter/path-before-offset-equal.tsx:1` fixture: path-before-offset-equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/isAfter/path-equal-offset-after.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/isAfter/path-equal-offset-after.tsx:1` fixture: path-equal-offset-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/isAfter/path-equal-offset-before.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/isAfter/path-equal-offset-before.tsx:1` fixture: path-equal-offset-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/isAfter/path-equal-offset-equal.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/isAfter/path-equal-offset-equal.tsx:1` fixture: path-equal-offset-equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/isBefore/path-after-offset-after.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/isBefore/path-after-offset-after.tsx:1` fixture: path-after-offset-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/isBefore/path-after-offset-before.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/isBefore/path-after-offset-before.tsx:1` fixture: path-after-offset-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/isBefore/path-after-offset-equal.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/isBefore/path-after-offset-equal.tsx:1` fixture: path-after-offset-equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/isBefore/path-before-offset-after.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/isBefore/path-before-offset-after.tsx:1` fixture: path-before-offset-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/isBefore/path-before-offset-before.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/isBefore/path-before-offset-before.tsx:1` fixture: path-before-offset-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/isBefore/path-before-offset-equal.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/isBefore/path-before-offset-equal.tsx:1` fixture: path-before-offset-equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/isBefore/path-equal-offset-after.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/isBefore/path-equal-offset-after.tsx:1` fixture: path-equal-offset-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/isBefore/path-equal-offset-before.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/isBefore/path-equal-offset-before.tsx:1` fixture: path-equal-offset-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/isBefore/path-equal-offset-equal.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/isBefore/path-equal-offset-equal.tsx:1` fixture: path-equal-offset-equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/isPoint/boolean.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/isPoint/boolean.tsx:1` fixture: boolean (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/isPoint/custom-property.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/isPoint/custom-property.tsx:1` fixture: custom-property (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/isPoint/object.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/isPoint/object.tsx:1` fixture: object (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/isPoint/offset.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/isPoint/offset.tsx:1` fixture: offset (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/isPoint/path.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/isPoint/path.tsx:1` fixture: path (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/isPoint/point.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/isPoint/point.tsx:1` fixture: point (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/isPoint/without-offset.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/isPoint/without-offset.tsx:1` fixture: without-offset (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/isPoint/without-path.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/isPoint/without-path.tsx:1` fixture: without-path (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/transform/backward-insert-text-after-point.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/transform/backward-insert-text-after-point.tsx:1` fixture: backward-insert-text-after-point (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/transform/backward-insert-text-at-point.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/transform/backward-insert-text-at-point.tsx:1` fixture: backward-insert-text-at-point (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/transform/backward-insert-text-before-point.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/transform/backward-insert-text-before-point.tsx:1` fixture: backward-insert-text-before-point (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/transform/forward-insert-text-after-point.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/transform/forward-insert-text-after-point.tsx:1` fixture: forward-insert-text-after-point (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/transform/forward-insert-text-at-point.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/transform/forward-insert-text-at-point.tsx:1` fixture: forward-insert-text-at-point (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Point/transform/forward-insert-text-before-point.tsx`

category: portable
family: interface/Point

- `../slate-audit/packages/slate/test/interfaces/Point/transform/forward-insert-text-before-point.tsx:1` fixture: forward-insert-text-before-point (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/edges/collapsed.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/edges/collapsed.tsx:1` fixture: collapsed (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/equals/equal.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/equals/equal.tsx:1` fixture: equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/equals/not-equal.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/equals/not-equal.tsx:1` fixture: not-equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/includes/path-after.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/includes/path-after.tsx:1` fixture: path-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/includes/path-before.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/includes/path-before.tsx:1` fixture: path-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/includes/path-end.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/includes/path-end.tsx:1` fixture: path-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/includes/path-inside.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/includes/path-inside.tsx:1` fixture: path-inside (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/includes/path-start.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/includes/path-start.tsx:1` fixture: path-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/includes/point-inside.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/includes/point-inside.tsx:1` fixture: point-inside (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/includes/point-offset-before.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/includes/point-offset-before.tsx:1` fixture: point-offset-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/includes/point-path-after.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/includes/point-path-after.tsx:1` fixture: point-path-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/includes/point-path-before.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/includes/point-path-before.tsx:1` fixture: point-path-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/includes/point-start.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/includes/point-start.tsx:1` fixture: point-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/isBackward/backward.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/isBackward/backward.tsx:1` fixture: backward (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/isBackward/collapsed.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/isBackward/collapsed.tsx:1` fixture: collapsed (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/isBackward/forward.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/isBackward/forward.tsx:1` fixture: forward (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/isCollapsed/collapsed.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/isCollapsed/collapsed.tsx:1` fixture: collapsed (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/isCollapsed/expanded.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/isCollapsed/expanded.tsx:1` fixture: expanded (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/isExpanded/collapsed.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/isExpanded/collapsed.tsx:1` fixture: collapsed (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/isExpanded/expanded.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/isExpanded/expanded.tsx:1` fixture: expanded (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/isForward/backward.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/isForward/backward.tsx:1` fixture: backward (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/isForward/collapsed.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/isForward/collapsed.tsx:1` fixture: collapsed (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/isForward/forward.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/isForward/forward.tsx:1` fixture: forward (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/isRange/boolean.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/isRange/boolean.tsx:1` fixture: boolean (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/isRange/custom-property.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/isRange/custom-property.tsx:1` fixture: custom-property (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/isRange/object.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/isRange/object.tsx:1` fixture: object (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/isRange/range.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/isRange/range.tsx:1` fixture: range (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/isRange/without-anchor.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/isRange/without-anchor.tsx:1` fixture: without-anchor (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/isRange/without-focus.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/isRange/without-focus.tsx:1` fixture: without-focus (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/points/full-selection.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/points/full-selection.tsx:1` fixture: full-selection (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/transform/inward-collapsed.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/transform/inward-collapsed.tsx:1` fixture: inward-collapsed (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Range/transform/outward-collapsed.tsx`

category: portable
family: interface/Range

- `../slate-audit/packages/slate/test/interfaces/Range/transform/outward-collapsed.tsx:1` fixture: outward-collapsed (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Scrubber/scrubber.ts`

category: portable
family: interface/Scrubber

- `../slate-audit/packages/slate/test/interfaces/Scrubber/scrubber.ts:1` fixture: scrubber (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/decorations/adjacent.js`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/decorations/adjacent.js:1` fixture: adjacent (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/decorations/collapse.js`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/decorations/collapse.js:1` fixture: collapse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/decorations/end.tsx`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/decorations/end.tsx:1` fixture: end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/decorations/intersect.js`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/decorations/intersect.js:1` fixture: intersect (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/decorations/merge.ts`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/decorations/merge.ts:1` fixture: merge (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/decorations/middle.tsx`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/decorations/middle.tsx:1` fixture: middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/decorations/overlapping.tsx`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/decorations/overlapping.tsx:1` fixture: overlapping (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/decorations/start.tsx`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/decorations/start.tsx:1` fixture: start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/equals/complex-exact-equals.js`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/equals/complex-exact-equals.js:1` fixture: complex-exact-equals (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/equals/complex-exact-not-equal.js`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/equals/complex-exact-not-equal.js:1` fixture: complex-exact-not-equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/equals/complex-loose-equals.js`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/equals/complex-loose-equals.js:1` fixture: complex-loose-equals (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/equals/complex-loose-not-equal.js`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/equals/complex-loose-not-equal.js:1` fixture: complex-loose-not-equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/equals/exact-equals.js`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/equals/exact-equals.js:1` fixture: exact-equals (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/equals/exact-not-equal.js`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/equals/exact-not-equal.js:1` fixture: exact-not-equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/equals/loose-equals.js`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/equals/loose-equals.js:1` fixture: loose-equals (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/equals/loose-not-equal.js`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/equals/loose-not-equal.js:1` fixture: loose-not-equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/isText/boolean.tsx`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/isText/boolean.tsx:1` fixture: boolean (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/isText/custom-property.tsx`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/isText/custom-property.tsx:1` fixture: custom-property (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/isText/object.tsx`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/isText/object.tsx:1` fixture: object (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/isText/text-full.tsx`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/isText/text-full.tsx:1` fixture: text-full (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/isText/text.tsx`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/isText/text.tsx:1` fixture: text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/isText/without-text.tsx`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/isText/without-text.tsx:1` fixture: without-text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/isTextList/boolean.tsx`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/isTextList/boolean.tsx:1` fixture: boolean (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/isTextList/empty.tsx`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/isTextList/empty.tsx:1` fixture: empty (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/isTextList/full-element.tsx`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/isTextList/full-element.tsx:1` fixture: full-element (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/isTextList/full-text.tsx`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/isTextList/full-text.tsx:1` fixture: full-text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/isTextList/full-value.tsx`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/isTextList/full-value.tsx:1` fixture: full-value (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/isTextList/not-full-text.tsx`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/isTextList/not-full-text.tsx:1` fixture: not-full-text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/isTextList/text.tsx`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/isTextList/text.tsx:1` fixture: text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/matches/empty-true.tsx`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/matches/empty-true.tsx:1` fixture: empty-true (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/matches/match-false.tsx`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/matches/match-false.tsx:1` fixture: match-false (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/matches/match-true.tsx`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/matches/match-true.tsx:1` fixture: match-true (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/matches/partial-false.tsx`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/matches/partial-false.tsx:1` fixture: partial-false (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/matches/partial-true.tsx`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/matches/partial-true.tsx:1` fixture: partial-true (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/matches/undefined-false.js`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/matches/undefined-false.js:1` fixture: undefined-false (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/interfaces/Text/matches/undefined-true.js`

category: portable
family: interface/Text

- `../slate-audit/packages/slate/test/interfaces/Text/matches/undefined-true.js:1` fixture: undefined-true (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/normalization/block/insert-custom-block.tsx`

category: portable
family: normalization/block

- `../slate-audit/packages/slate/test/normalization/block/insert-custom-block.tsx:1` fixture: insert-custom-block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/normalization/block/insert-text.tsx`

category: portable
family: normalization/block

- `../slate-audit/packages/slate/test/normalization/block/insert-text.tsx:1` fixture: insert-text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/normalization/block/remove-block.tsx`

category: portable
family: normalization/block

- `../slate-audit/packages/slate/test/normalization/block/remove-block.tsx:1` fixture: remove-block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/normalization/block/remove-inline-with-wrapping.tsx`

category: portable
family: normalization/block

- `../slate-audit/packages/slate/test/normalization/block/remove-inline-with-wrapping.tsx:1` fixture: remove-inline-with-wrapping (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/normalization/block/remove-inline.tsx`

category: portable
family: normalization/block

- `../slate-audit/packages/slate/test/normalization/block/remove-inline.tsx:1` fixture: remove-inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/normalization/editor/remove-inline-with-wrapping.tsx`

category: portable
family: normalization/editor

- `../slate-audit/packages/slate/test/normalization/editor/remove-inline-with-wrapping.tsx:1` fixture: remove-inline-with-wrapping (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/normalization/editor/remove-inline.tsx`

category: portable
family: normalization/editor

- `../slate-audit/packages/slate/test/normalization/editor/remove-inline.tsx:1` fixture: remove-inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/normalization/editor/remove-text-with-wrapping.tsx`

category: portable
family: normalization/editor

- `../slate-audit/packages/slate/test/normalization/editor/remove-text-with-wrapping.tsx:1` fixture: remove-text-with-wrapping (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/normalization/editor/remove-text.tsx`

category: portable
family: normalization/editor

- `../slate-audit/packages/slate/test/normalization/editor/remove-text.tsx:1` fixture: remove-text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/normalization/inline/insert-adjacent-text.tsx`

category: portable
family: normalization/inline

- `../slate-audit/packages/slate/test/normalization/inline/insert-adjacent-text.tsx:1` fixture: insert-adjacent-text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/normalization/inline/remove-block.tsx`

category: portable
family: normalization/inline

- `../slate-audit/packages/slate/test/normalization/inline/remove-block.tsx:1` fixture: remove-block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/normalization/text/merge-adjacent-empty-after-nested.tsx`

category: portable
family: normalization/text

- `../slate-audit/packages/slate/test/normalization/text/merge-adjacent-empty-after-nested.tsx:1` fixture: merge-adjacent-empty-after-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/normalization/text/merge-adjacent-empty-after.tsx`

category: portable
family: normalization/text

- `../slate-audit/packages/slate/test/normalization/text/merge-adjacent-empty-after.tsx:1` fixture: merge-adjacent-empty-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/normalization/text/merge-adjacent-empty-before-inline.tsx`

category: portable
family: normalization/text

- `../slate-audit/packages/slate/test/normalization/text/merge-adjacent-empty-before-inline.tsx:1` fixture: merge-adjacent-empty-before-inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/normalization/text/merge-adjacent-empty.tsx`

category: portable
family: normalization/text

- `../slate-audit/packages/slate/test/normalization/text/merge-adjacent-empty.tsx:1` fixture: merge-adjacent-empty (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/normalization/text/merge-adjacent-match-empty.tsx`

category: portable
family: normalization/text

- `../slate-audit/packages/slate/test/normalization/text/merge-adjacent-match-empty.tsx:1` fixture: merge-adjacent-match-empty (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/normalization/text/merge-adjacent-match.tsx`

category: portable
family: normalization/text

- `../slate-audit/packages/slate/test/normalization/text/merge-adjacent-match.tsx:1` fixture: merge-adjacent-match (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/normalization/text/merge-adjacent-non-selectable-ancestor.ts`

category: portable
family: normalization/text

- `../slate-audit/packages/slate/test/normalization/text/merge-adjacent-non-selectable-ancestor.ts:1` fixture: merge-adjacent-non-selectable-ancestor (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/normalization/void/block-insert-text.tsx`

category: portable
family: normalization/void

- `../slate-audit/packages/slate/test/normalization/void/block-insert-text.tsx:1` fixture: block-insert-text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/normalization/void/inline-insert-text.tsx`

category: portable
family: normalization/void

- `../slate-audit/packages/slate/test/normalization/void/inline-insert-text.tsx:1` fixture: inline-insert-text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/move_node/path-equals-new-path.tsx`

category: portable
family: operation/move_node

- `../slate-audit/packages/slate/test/operations/move_node/path-equals-new-path.tsx:1` fixture: path-equals-new-path (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/move_node/path-not-equals-new-path.tsx`

category: portable
family: operation/move_node

- `../slate-audit/packages/slate/test/operations/move_node/path-not-equals-new-path.tsx:1` fixture: path-not-equals-new-path (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/remove_node/cursor-aunt-text-after.tsx`

category: portable
family: operation/remove_node

- `../slate-audit/packages/slate/test/operations/remove_node/cursor-aunt-text-after.tsx:1` fixture: cursor-aunt-text-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/remove_node/cursor-aunt-text-before.tsx`

category: portable
family: operation/remove_node

- `../slate-audit/packages/slate/test/operations/remove_node/cursor-aunt-text-before.tsx:1` fixture: cursor-aunt-text-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/remove_node/cursor-nested.tsx`

category: portable
family: operation/remove_node

- `../slate-audit/packages/slate/test/operations/remove_node/cursor-nested.tsx:1` fixture: cursor-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/remove_node/cursor-sibling-inline-after.tsx`

category: portable
family: operation/remove_node

- `../slate-audit/packages/slate/test/operations/remove_node/cursor-sibling-inline-after.tsx:1` fixture: cursor-sibling-inline-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/remove_node/cursor-sibling-inline-before-text-after.tsx`

category: portable
family: operation/remove_node

- `../slate-audit/packages/slate/test/operations/remove_node/cursor-sibling-inline-before-text-after.tsx:1` fixture: cursor-sibling-inline-before-text-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/remove_node/cursor-sibling-inline-before.tsx`

category: portable
family: operation/remove_node

- `../slate-audit/packages/slate/test/operations/remove_node/cursor-sibling-inline-before.tsx:1` fixture: cursor-sibling-inline-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/remove_node/cursor-sibling-text-after.tsx`

category: portable
family: operation/remove_node

- `../slate-audit/packages/slate/test/operations/remove_node/cursor-sibling-text-after.tsx:1` fixture: cursor-sibling-text-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/remove_node/cursor-sibling-text-before-inline-after.tsx`

category: portable
family: operation/remove_node

- `../slate-audit/packages/slate/test/operations/remove_node/cursor-sibling-text-before-inline-after.tsx:1` fixture: cursor-sibling-text-before-inline-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/remove_node/cursor-sibling-text-before.tsx`

category: portable
family: operation/remove_node

- `../slate-audit/packages/slate/test/operations/remove_node/cursor-sibling-text-before.tsx:1` fixture: cursor-sibling-text-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/remove_node/cursor-sibling-text-both-sides.tsx`

category: portable
family: operation/remove_node

- `../slate-audit/packages/slate/test/operations/remove_node/cursor-sibling-text-both-sides.tsx:1` fixture: cursor-sibling-text-both-sides (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/remove_node/cursor.tsx`

category: portable
family: operation/remove_node

- `../slate-audit/packages/slate/test/operations/remove_node/cursor.tsx:1` fixture: cursor (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/remove_text/anchor-after.tsx`

category: portable
family: operation/remove_text

- `../slate-audit/packages/slate/test/operations/remove_text/anchor-after.tsx:1` fixture: anchor-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/remove_text/anchor-before.tsx`

category: portable
family: operation/remove_text

- `../slate-audit/packages/slate/test/operations/remove_text/anchor-before.tsx:1` fixture: anchor-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/remove_text/anchor-middle.tsx`

category: portable
family: operation/remove_text

- `../slate-audit/packages/slate/test/operations/remove_text/anchor-middle.tsx:1` fixture: anchor-middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/remove_text/cursor-after.tsx`

category: portable
family: operation/remove_text

- `../slate-audit/packages/slate/test/operations/remove_text/cursor-after.tsx:1` fixture: cursor-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/remove_text/cursor-before.tsx`

category: portable
family: operation/remove_text

- `../slate-audit/packages/slate/test/operations/remove_text/cursor-before.tsx:1` fixture: cursor-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/remove_text/cursor-middle.tsx`

category: portable
family: operation/remove_text

- `../slate-audit/packages/slate/test/operations/remove_text/cursor-middle.tsx:1` fixture: cursor-middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/remove_text/focus-after.tsx`

category: portable
family: operation/remove_text

- `../slate-audit/packages/slate/test/operations/remove_text/focus-after.tsx:1` fixture: focus-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/remove_text/focus-before.tsx`

category: portable
family: operation/remove_text

- `../slate-audit/packages/slate/test/operations/remove_text/focus-before.tsx:1` fixture: focus-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/remove_text/focus-middle.tsx`

category: portable
family: operation/remove_text

- `../slate-audit/packages/slate/test/operations/remove_text/focus-middle.tsx:1` fixture: focus-middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/set_node/remove-null.tsx`

category: portable
family: operation/set_node

- `../slate-audit/packages/slate/test/operations/set_node/remove-null.tsx:1` fixture: remove-null (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/set_node/remove-omit.tsx`

category: portable
family: operation/set_node

- `../slate-audit/packages/slate/test/operations/set_node/remove-omit.tsx:1` fixture: remove-omit (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/set_node/remove-undefined.tsx`

category: portable
family: operation/set_node

- `../slate-audit/packages/slate/test/operations/set_node/remove-undefined.tsx:1` fixture: remove-undefined (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/set_selection/custom-props.tsx`

category: portable
family: operation/set_selection

- `../slate-audit/packages/slate/test/operations/set_selection/custom-props.tsx:1` fixture: custom-props (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/set_selection/remove.tsx`

category: portable
family: operation/set_selection

- `../slate-audit/packages/slate/test/operations/set_selection/remove.tsx:1` fixture: remove (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/split_node/element-empty-properties.tsx`

category: portable
family: operation/split_node

- `../slate-audit/packages/slate/test/operations/split_node/element-empty-properties.tsx:1` fixture: element-empty-properties (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/split_node/element.tsx`

category: portable
family: operation/split_node

- `../slate-audit/packages/slate/test/operations/split_node/element.tsx:1` fixture: element (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/split_node/text-empty-properties.tsx`

category: portable
family: operation/split_node

- `../slate-audit/packages/slate/test/operations/split_node/text-empty-properties.tsx:1` fixture: text-empty-properties (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/operations/split_node/text.tsx`

category: portable
family: operation/split_node

- `../slate-audit/packages/slate/test/operations/split_node/text.tsx:1` fixture: text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/emojis/inline-end-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/emojis/inline-end-reverse.tsx:1` fixture: inline-end-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/emojis/inline-middle-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/emojis/inline-middle-reverse.tsx:1` fixture: inline-middle-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/emojis/inline-middle.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/emojis/inline-middle.tsx:1` fixture: inline-middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/emojis/inline-only-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/emojis/inline-only-reverse.tsx:1` fixture: inline-only-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/emojis/inline-start.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/emojis/inline-start.tsx:1` fixture: inline-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/emojis/text-end-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/emojis/text-end-reverse.tsx:1` fixture: text-end-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/emojis/text-start.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/emojis/text-start.tsx:1` fixture: text-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/path/block.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/path/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/path/inline.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/path/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/path/selection-inside.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/path/selection-inside.tsx:1` fixture: selection-inside (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/path/text.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/path/text.tsx:1` fixture: text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/point/basic-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/point/basic-reverse.tsx:1` fixture: basic-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/point/basic.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/point/basic.tsx:1` fixture: basic (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/point/depths-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/point/depths-reverse.tsx:1` fixture: depths-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/point/inline-before-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/point/inline-before-reverse.tsx:1` fixture: inline-before-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/point/inline-before.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/point/inline-before.tsx:1` fixture: inline-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/point/inline-end.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/point/inline-end.tsx:1` fixture: inline-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/point/inline-inside-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/point/inline-inside-reverse.tsx:1` fixture: inline-inside-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/point/inline-void-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/point/inline-void-reverse.tsx:1` fixture: inline-void-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/point/inline-void.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/point/inline-void.tsx:1` fixture: inline-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/point/inline.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/point/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/point/nested-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/point/nested-reverse.tsx:1` fixture: nested-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/point/nested.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/point/nested.tsx:1` fixture: nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/selection/block-across-multiple.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/selection/block-across-multiple.tsx:1` fixture: block-across-multiple (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/selection/block-across-nested.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/selection/block-across-nested.tsx:1` fixture: block-across-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/selection/block-across.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/selection/block-across.tsx:1` fixture: block-across (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/selection/block-depths-nested.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/selection/block-depths-nested.tsx:1` fixture: block-depths-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/selection/block-depths.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/selection/block-depths.tsx:1` fixture: block-depths (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/selection/block-hanging-multiple.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/selection/block-hanging-multiple.tsx:1` fixture: block-hanging-multiple (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/selection/block-hanging-single.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/selection/block-hanging-single.tsx:1` fixture: block-hanging-single (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/selection/block-inline-across.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/selection/block-inline-across.tsx:1` fixture: block-inline-across (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/selection/block-inline-over.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/selection/block-inline-over.tsx:1` fixture: block-inline-over (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/selection/block-join-edges.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/selection/block-join-edges.tsx:1` fixture: block-join-edges (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/selection/block-join-inline.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/selection/block-join-inline.tsx:1` fixture: block-join-inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/selection/block-join-nested.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/selection/block-join-nested.tsx:1` fixture: block-join-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/selection/block-middle.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/selection/block-middle.tsx:1` fixture: block-middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/selection/block-nested.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/selection/block-nested.tsx:1` fixture: block-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/selection/block-void-end-hanging.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/selection/block-void-end-hanging.tsx:1` fixture: block-void-end-hanging (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/selection/block-void-end.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/selection/block-void-end.tsx:1` fixture: block-void-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/selection/character-end.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/selection/character-end.tsx:1` fixture: character-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/selection/character-middle.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/selection/character-middle.tsx:1` fixture: character-middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/selection/character-start.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/selection/character-start.tsx:1` fixture: character-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/selection/inline-after.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/selection/inline-after.tsx:1` fixture: inline-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/selection/inline-inside.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/selection/inline-inside.tsx:1` fixture: inline-inside (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/selection/inline-over.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/selection/inline-over.tsx:1` fixture: inline-over (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/selection/inline-whole.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/selection/inline-whole.tsx:1` fixture: inline-whole (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/selection/word.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/selection/word.tsx:1` fixture: word (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-character/document-end.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-character/document-end.tsx:1` fixture: document-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-character/document-start-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-character/document-start-reverse.tsx:1` fixture: document-start-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-character/empty-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-character/empty-reverse.tsx:1` fixture: empty-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-character/empty.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-character/empty.tsx:1` fixture: empty (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-character/end.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-character/end.tsx:1` fixture: end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-character/first-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-character/first-reverse.tsx:1` fixture: first-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-character/first.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-character/first.tsx:1` fixture: first (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-character/inline-after-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-character/inline-after-reverse.tsx:1` fixture: inline-after-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-character/inline-after.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-character/inline-after.tsx:1` fixture: inline-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-character/inline-before-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-character/inline-before-reverse.tsx:1` fixture: inline-before-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-character/inline-before.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-character/inline-before.tsx:1` fixture: inline-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-character/inline-end-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-character/inline-end-reverse.tsx:1` fixture: inline-end-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-character/inline-inside-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-character/inline-inside-reverse.tsx:1` fixture: inline-inside-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-character/inline-inside.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-character/inline-inside.tsx:1` fixture: inline-inside (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-character/last.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-character/last.tsx:1` fixture: last (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-character/middle-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-character/middle-reverse.tsx:1` fixture: middle-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-character/middle.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-character/middle.tsx:1` fixture: middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-character/multiple-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-character/multiple-reverse.tsx:1` fixture: multiple-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-character/multiple.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-character/multiple.tsx:1` fixture: multiple (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-character/thai-multiple-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-character/thai-multiple-reverse.tsx:1` fixture: thai-multiple-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-character/thai-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-character/thai-reverse.tsx:1` fixture: thai-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-line/text-end-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-line/text-end-reverse.tsx:1` fixture: text-end-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-line/text-end.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-line/text-end.tsx:1` fixture: text-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-line/text-middle-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-line/text-middle-reverse.tsx:1` fixture: text-middle-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-line/text-middle.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-line/text-middle.tsx:1` fixture: text-middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-line/text-start-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-line/text-start-reverse.tsx:1` fixture: text-start-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-line/text-start.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-line/text-start.tsx:1` fixture: text-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-word/block-join-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-word/block-join-reverse.tsx:1` fixture: block-join-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-word/block-join.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-word/block-join.tsx:1` fixture: block-join (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-word/text-end-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-word/text-end-reverse.tsx:1` fixture: text-end-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-word/text-middle-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-word/text-middle-reverse.tsx:1` fixture: text-middle-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-word/text-middle.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-word/text-middle.tsx:1` fixture: text-middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/unit-word/text-start.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/unit-word/text-start.tsx:1` fixture: text-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/voids-false/block-across-backward.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/voids-false/block-across-backward.tsx:1` fixture: block-across-backward (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/voids-false/block-after-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/voids-false/block-after-reverse.tsx:1` fixture: block-after-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/voids-false/block-before.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/voids-false/block-before.tsx:1` fixture: block-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/voids-false/block-both.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/voids-false/block-both.tsx:1` fixture: block-both (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/voids-false/block-end.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/voids-false/block-end.tsx:1` fixture: block-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/voids-false/block-hanging-from.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/voids-false/block-hanging-from.tsx:1` fixture: block-hanging-from (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/voids-false/block-hanging-into.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/voids-false/block-hanging-into.tsx:1` fixture: block-hanging-into (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/voids-false/block-only.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/voids-false/block-only.tsx:1` fixture: block-only (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/voids-false/block-start-multiple.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/voids-false/block-start-multiple.tsx:1` fixture: block-start-multiple (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/voids-false/block-start.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/voids-false/block-start.tsx:1` fixture: block-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/voids-false/inline-after-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/voids-false/inline-after-reverse.tsx:1` fixture: inline-after-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/voids-false/inline-before.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/voids-false/inline-before.tsx:1` fixture: inline-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/voids-false/inline-into.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/voids-false/inline-into.tsx:1` fixture: inline-into (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/voids-false/inline-over.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/voids-false/inline-over.tsx:1` fixture: inline-over (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/voids-false/inline-start-across.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/voids-false/inline-start-across.tsx:1` fixture: inline-start-across (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/voids-false/inline-start.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/voids-false/inline-start.tsx:1` fixture: inline-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/voids-false/read-only-inline-after-reverse.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/voids-false/read-only-inline-after-reverse.tsx:1` fixture: read-only-inline-after-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/voids-false/read-only-inline-within.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/voids-false/read-only-inline-within.tsx:1` fixture: read-only-inline-within (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/voids-true/across-blocks.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/voids-true/across-blocks.tsx:1` fixture: across-blocks (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/delete/voids-true/path.tsx`

category: portable
family: transform/delete

- `../slate-audit/packages/slate/test/transforms/delete/voids-true/path.tsx:1` fixture: path (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/deselect/basic.tsx`

category: portable
family: transform/deselect

- `../slate-audit/packages/slate/test/transforms/deselect/basic.tsx:1` fixture: basic (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/general/invalid-insert_node.tsx`

category: portable
family: transform/general

- `../slate-audit/packages/slate/test/transforms/general/invalid-insert_node.tsx:1` fixture: invalid-insert_node (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-blocks/block-empty.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-blocks/block-empty.tsx:1` fixture: block-empty (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-blocks/block-end.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-blocks/block-end.tsx:1` fixture: block-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-blocks/block-hanging.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-blocks/block-hanging.tsx:1` fixture: block-hanging (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-blocks/block-middle-3.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-blocks/block-middle-3.tsx:1` fixture: block-middle-3 (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-blocks/block-nested.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-blocks/block-nested.tsx:1` fixture: block-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-blocks/block-start.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-blocks/block-start.tsx:1` fixture: block-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-blocks/blocks-middle-1.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-blocks/blocks-middle-1.tsx:1` fixture: blocks-middle-1 (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-blocks/blocks-middle-2.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-blocks/blocks-middle-2.tsx:1` fixture: blocks-middle-2 (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-blocks/with-inline.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-blocks/with-inline.tsx:1` fixture: with-inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-inlines/block-empty.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-inlines/block-empty.tsx:1` fixture: block-empty (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-inlines/block-end.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-inlines/block-end.tsx:1` fixture: block-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-inlines/block-middle.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-inlines/block-middle.tsx:1` fixture: block-middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-inlines/block-start.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-inlines/block-start.tsx:1` fixture: block-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-inlines/inline-empty.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-inlines/inline-empty.tsx:1` fixture: inline-empty (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-inlines/inline-middle.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-inlines/inline-middle.tsx:1` fixture: inline-middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-inlines/with-multiple.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-inlines/with-multiple.tsx:1` fixture: with-multiple (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-inlines/with-text.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-inlines/with-text.tsx:1` fixture: with-text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-lists/merge-lists.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-lists/merge-lists.tsx:1` fixture: merge-lists (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-mixed/block-empty.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-mixed/block-empty.tsx:1` fixture: block-empty (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-mixed/block-empty2.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-mixed/block-empty2.tsx:1` fixture: block-empty2 (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-mixed/block-empty3.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-mixed/block-empty3.tsx:1` fixture: block-empty3 (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-mixed/block-end.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-mixed/block-end.tsx:1` fixture: block-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-mixed/block-end2.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-mixed/block-end2.tsx:1` fixture: block-end2 (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-mixed/block-middle.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-mixed/block-middle.tsx:1` fixture: block-middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-mixed/block-start.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-mixed/block-start.tsx:1` fixture: block-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-mixed/block-start2.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-mixed/block-start2.tsx:1` fixture: block-start2 (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-tables/merge-cells-with-nested-blocks.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-tables/merge-cells-with-nested-blocks.tsx:1` fixture: merge-cells-with-nested-blocks (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-tables/merge-into-empty-cells.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-tables/merge-into-empty-cells.tsx:1` fixture: merge-into-empty-cells (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-tables/merge-into-full-cells.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-tables/merge-into-full-cells.tsx:1` fixture: merge-into-full-cells (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-texts/block-across.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-texts/block-across.tsx:1` fixture: block-across (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-texts/block-empty.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-texts/block-empty.tsx:1` fixture: block-empty (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-texts/block-end.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-texts/block-end.tsx:1` fixture: block-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-texts/block-middle.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-texts/block-middle.tsx:1` fixture: block-middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-texts/block-start.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-texts/block-start.tsx:1` fixture: block-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-texts/inline-empty.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-texts/inline-empty.tsx:1` fixture: inline-empty (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-texts/inline-middle.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-texts/inline-middle.tsx:1` fixture: inline-middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/of-texts/with-multiple.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/of-texts/with-multiple.tsx:1` fixture: with-multiple (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/voids-false/block.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/voids-false/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/voids-false/inline.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/voids-false/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/voids-true/block.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/voids-true/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertFragment/voids-true/inline.tsx`

category: portable
family: transform/insertFragment

- `../slate-audit/packages/slate/test/transforms/insertFragment/voids-true/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertNodes/block/block-empty.tsx`

category: portable
family: transform/insertNodes

- `../slate-audit/packages/slate/test/transforms/insertNodes/block/block-empty.tsx:1` fixture: block-empty (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertNodes/block/block-middle.tsx`

category: portable
family: transform/insertNodes

- `../slate-audit/packages/slate/test/transforms/insertNodes/block/block-middle.tsx:1` fixture: block-middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertNodes/block/block-void.tsx`

category: portable
family: transform/insertNodes

- `../slate-audit/packages/slate/test/transforms/insertNodes/block/block-void.tsx:1` fixture: block-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertNodes/block/inline-void.tsx`

category: portable
family: transform/insertNodes

- `../slate-audit/packages/slate/test/transforms/insertNodes/block/inline-void.tsx:1` fixture: inline-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertNodes/inline/block-empty.tsx`

category: portable
family: transform/insertNodes

- `../slate-audit/packages/slate/test/transforms/insertNodes/inline/block-empty.tsx:1` fixture: block-empty (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertNodes/inline/block-end.tsx`

category: portable
family: transform/insertNodes

- `../slate-audit/packages/slate/test/transforms/insertNodes/inline/block-end.tsx:1` fixture: block-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertNodes/inline/block-middle.tsx`

category: portable
family: transform/insertNodes

- `../slate-audit/packages/slate/test/transforms/insertNodes/inline/block-middle.tsx:1` fixture: block-middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertNodes/inline/block-start.tsx`

category: portable
family: transform/insertNodes

- `../slate-audit/packages/slate/test/transforms/insertNodes/inline/block-start.tsx:1` fixture: block-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertNodes/inline/block-void.tsx`

category: portable
family: transform/insertNodes

- `../slate-audit/packages/slate/test/transforms/insertNodes/inline/block-void.tsx:1` fixture: block-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertNodes/inline/inline-middle.tsx`

category: portable
family: transform/insertNodes

- `../slate-audit/packages/slate/test/transforms/insertNodes/inline/inline-middle.tsx:1` fixture: inline-middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertNodes/path/block.tsx`

category: portable
family: transform/insertNodes

- `../slate-audit/packages/slate/test/transforms/insertNodes/path/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertNodes/path/inline.tsx`

category: portable
family: transform/insertNodes

- `../slate-audit/packages/slate/test/transforms/insertNodes/path/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertNodes/path/multiple-inline-not-end.tsx`

category: portable
family: transform/insertNodes

- `../slate-audit/packages/slate/test/transforms/insertNodes/path/multiple-inline-not-end.tsx:1` fixture: multiple-inline-not-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertNodes/path/multiple-inline.tsx`

category: portable
family: transform/insertNodes

- `../slate-audit/packages/slate/test/transforms/insertNodes/path/multiple-inline.tsx:1` fixture: multiple-inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertNodes/path/multiple.tsx`

category: portable
family: transform/insertNodes

- `../slate-audit/packages/slate/test/transforms/insertNodes/path/multiple.tsx:1` fixture: multiple (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertNodes/path/text.tsx`

category: portable
family: transform/insertNodes

- `../slate-audit/packages/slate/test/transforms/insertNodes/path/text.tsx:1` fixture: text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertNodes/select-true/block.tsx`

category: portable
family: transform/insertNodes

- `../slate-audit/packages/slate/test/transforms/insertNodes/select-true/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertNodes/selection/none-empty.tsx`

category: portable
family: transform/insertNodes

- `../slate-audit/packages/slate/test/transforms/insertNodes/selection/none-empty.tsx:1` fixture: none-empty (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertNodes/selection/none-end.tsx`

category: portable
family: transform/insertNodes

- `../slate-audit/packages/slate/test/transforms/insertNodes/selection/none-end.tsx:1` fixture: none-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertNodes/void/at-path.tsx`

category: portable
family: transform/insertNodes

- `../slate-audit/packages/slate/test/transforms/insertNodes/void/at-path.tsx:1` fixture: at-path (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertNodes/void/block-nested.tsx`

category: portable
family: transform/insertNodes

- `../slate-audit/packages/slate/test/transforms/insertNodes/void/block-nested.tsx:1` fixture: block-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertNodes/void/block.tsx`

category: portable
family: transform/insertNodes

- `../slate-audit/packages/slate/test/transforms/insertNodes/void/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertNodes/void/inline.tsx`

category: portable
family: transform/insertNodes

- `../slate-audit/packages/slate/test/transforms/insertNodes/void/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertNodes/voids-true/block.tsx`

category: portable
family: transform/insertNodes

- `../slate-audit/packages/slate/test/transforms/insertNodes/voids-true/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertNodes/voids-true/inline.tsx`

category: portable
family: transform/insertNodes

- `../slate-audit/packages/slate/test/transforms/insertNodes/voids-true/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertText/path/block.tsx`

category: portable
family: transform/insertText

- `../slate-audit/packages/slate/test/transforms/insertText/path/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertText/path/text.tsx`

category: portable
family: transform/insertText

- `../slate-audit/packages/slate/test/transforms/insertText/path/text.tsx:1` fixture: text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertText/point/selection-after.tsx`

category: portable
family: transform/insertText

- `../slate-audit/packages/slate/test/transforms/insertText/point/selection-after.tsx:1` fixture: selection-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertText/point/selection-before.tsx`

category: portable
family: transform/insertText

- `../slate-audit/packages/slate/test/transforms/insertText/point/selection-before.tsx:1` fixture: selection-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertText/point/selection-end.tsx`

category: portable
family: transform/insertText

- `../slate-audit/packages/slate/test/transforms/insertText/point/selection-end.tsx:1` fixture: selection-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertText/point/selection-middle.tsx`

category: portable
family: transform/insertText

- `../slate-audit/packages/slate/test/transforms/insertText/point/selection-middle.tsx:1` fixture: selection-middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertText/point/selection-start.tsx`

category: portable
family: transform/insertText

- `../slate-audit/packages/slate/test/transforms/insertText/point/selection-start.tsx:1` fixture: selection-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertText/point/text-end.tsx`

category: portable
family: transform/insertText

- `../slate-audit/packages/slate/test/transforms/insertText/point/text-end.tsx:1` fixture: text-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertText/point/text-middle.tsx`

category: portable
family: transform/insertText

- `../slate-audit/packages/slate/test/transforms/insertText/point/text-middle.tsx:1` fixture: text-middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertText/point/text-start.tsx`

category: portable
family: transform/insertText

- `../slate-audit/packages/slate/test/transforms/insertText/point/text-start.tsx:1` fixture: text-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertText/selection/block-across-inline-wold.tsx`

category: portable
family: transform/insertText

- `../slate-audit/packages/slate/test/transforms/insertText/selection/block-across-inline-wold.tsx:1` fixture: block-across-inline-wold (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertText/selection/block-across.tsx`

category: portable
family: transform/insertText

- `../slate-audit/packages/slate/test/transforms/insertText/selection/block-across.tsx:1` fixture: block-across (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertText/selection/block-end-words.tsx`

category: portable
family: transform/insertText

- `../slate-audit/packages/slate/test/transforms/insertText/selection/block-end-words.tsx:1` fixture: block-end-words (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertText/selection/block-end.tsx`

category: portable
family: transform/insertText

- `../slate-audit/packages/slate/test/transforms/insertText/selection/block-end.tsx:1` fixture: block-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertText/selection/block-hanging-across.tsx`

category: portable
family: transform/insertText

- `../slate-audit/packages/slate/test/transforms/insertText/selection/block-hanging-across.tsx:1` fixture: block-hanging-across (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertText/selection/block-hanging.tsx`

category: portable
family: transform/insertText

- `../slate-audit/packages/slate/test/transforms/insertText/selection/block-hanging.tsx:1` fixture: block-hanging (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertText/selection/block-middle-words.tsx`

category: portable
family: transform/insertText

- `../slate-audit/packages/slate/test/transforms/insertText/selection/block-middle-words.tsx:1` fixture: block-middle-words (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertText/selection/block-middle.tsx`

category: portable
family: transform/insertText

- `../slate-audit/packages/slate/test/transforms/insertText/selection/block-middle.tsx:1` fixture: block-middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertText/selection/block-start-words.tsx`

category: portable
family: transform/insertText

- `../slate-audit/packages/slate/test/transforms/insertText/selection/block-start-words.tsx:1` fixture: block-start-words (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertText/selection/block-start.tsx`

category: portable
family: transform/insertText

- `../slate-audit/packages/slate/test/transforms/insertText/selection/block-start.tsx:1` fixture: block-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertText/selection/block-void.tsx`

category: portable
family: transform/insertText

- `../slate-audit/packages/slate/test/transforms/insertText/selection/block-void.tsx:1` fixture: block-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertText/selection/inline-end.tsx`

category: portable
family: transform/insertText

- `../slate-audit/packages/slate/test/transforms/insertText/selection/inline-end.tsx:1` fixture: inline-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertText/voids-false/block.tsx`

category: portable
family: transform/insertText

- `../slate-audit/packages/slate/test/transforms/insertText/voids-false/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertText/voids-false/read-only-inline.tsx`

category: portable
family: transform/insertText

- `../slate-audit/packages/slate/test/transforms/insertText/voids-false/read-only-inline.tsx:1` fixture: read-only-inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertText/voids-false/text.tsx`

category: portable
family: transform/insertText

- `../slate-audit/packages/slate/test/transforms/insertText/voids-false/text.tsx:1` fixture: text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertText/voids-true/block.tsx`

category: portable
family: transform/insertText

- `../slate-audit/packages/slate/test/transforms/insertText/voids-true/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/insertText/voids-true/text.tsx`

category: portable
family: transform/insertText

- `../slate-audit/packages/slate/test/transforms/insertText/voids-true/text.tsx:1` fixture: text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/liftNodes/path/block.tsx`

category: portable
family: transform/liftNodes

- `../slate-audit/packages/slate/test/transforms/liftNodes/path/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/liftNodes/path/first-block.tsx`

category: portable
family: transform/liftNodes

- `../slate-audit/packages/slate/test/transforms/liftNodes/path/first-block.tsx:1` fixture: first-block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/liftNodes/path/last-block.tsx`

category: portable
family: transform/liftNodes

- `../slate-audit/packages/slate/test/transforms/liftNodes/path/last-block.tsx:1` fixture: last-block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/liftNodes/path/middle-block.tsx`

category: portable
family: transform/liftNodes

- `../slate-audit/packages/slate/test/transforms/liftNodes/path/middle-block.tsx:1` fixture: middle-block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/liftNodes/selection/block-full.tsx`

category: portable
family: transform/liftNodes

- `../slate-audit/packages/slate/test/transforms/liftNodes/selection/block-full.tsx:1` fixture: block-full (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/liftNodes/selection/block-nested.tsx`

category: portable
family: transform/liftNodes

- `../slate-audit/packages/slate/test/transforms/liftNodes/selection/block-nested.tsx:1` fixture: block-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/liftNodes/voids-true/block.tsx`

category: portable
family: transform/liftNodes

- `../slate-audit/packages/slate/test/transforms/liftNodes/voids-true/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/mergeNodes/depth-block/block-nested-multi-child.tsx`

category: portable
family: transform/mergeNodes

- `../slate-audit/packages/slate/test/transforms/mergeNodes/depth-block/block-nested-multi-child.tsx:1` fixture: block-nested-multi-child (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/mergeNodes/depth-block/block-nested-only-child.tsx`

category: portable
family: transform/mergeNodes

- `../slate-audit/packages/slate/test/transforms/mergeNodes/depth-block/block-nested-only-child.tsx:1` fixture: block-nested-only-child (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/mergeNodes/depth-block/block.tsx`

category: portable
family: transform/mergeNodes

- `../slate-audit/packages/slate/test/transforms/mergeNodes/depth-block/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/mergeNodes/path/block-nested.tsx`

category: portable
family: transform/mergeNodes

- `../slate-audit/packages/slate/test/transforms/mergeNodes/path/block-nested.tsx:1` fixture: block-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/mergeNodes/path/block.tsx`

category: portable
family: transform/mergeNodes

- `../slate-audit/packages/slate/test/transforms/mergeNodes/path/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/mergeNodes/path/non-selectable-ancestor.ts`

category: portable
family: transform/mergeNodes

- `../slate-audit/packages/slate/test/transforms/mergeNodes/path/non-selectable-ancestor.ts:1` fixture: non-selectable-ancestor (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/mergeNodes/path/text-across.tsx`

category: portable
family: transform/mergeNodes

- `../slate-audit/packages/slate/test/transforms/mergeNodes/path/text-across.tsx:1` fixture: text-across (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/mergeNodes/path/text-hanging-nested.tsx`

category: portable
family: transform/mergeNodes

- `../slate-audit/packages/slate/test/transforms/mergeNodes/path/text-hanging-nested.tsx:1` fixture: text-hanging-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/mergeNodes/path/text-hanging.tsx`

category: portable
family: transform/mergeNodes

- `../slate-audit/packages/slate/test/transforms/mergeNodes/path/text-hanging.tsx:1` fixture: text-hanging (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/mergeNodes/voids-true/block.tsx`

category: portable
family: transform/mergeNodes

- `../slate-audit/packages/slate/test/transforms/mergeNodes/voids-true/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/anchor/backward.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/anchor/backward.tsx:1` fixture: backward (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/anchor/basic.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/anchor/basic.tsx:1` fixture: basic (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/anchor/collapsed.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/anchor/collapsed.tsx:1` fixture: collapsed (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/anchor/distance.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/anchor/distance.tsx:1` fixture: distance (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/anchor/reverse-backward.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/anchor/reverse-backward.tsx:1` fixture: reverse-backward (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/anchor/reverse-basic.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/anchor/reverse-basic.tsx:1` fixture: reverse-basic (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/anchor/reverse-distance.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/anchor/reverse-distance.tsx:1` fixture: reverse-distance (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/both/backward-reverse.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/both/backward-reverse.tsx:1` fixture: backward-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/both/backward.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/both/backward.tsx:1` fixture: backward (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/both/basic-reverse.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/both/basic-reverse.tsx:1` fixture: basic-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/both/collapsed.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/both/collapsed.tsx:1` fixture: collapsed (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/both/distance-reverse.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/both/distance-reverse.tsx:1` fixture: distance-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/both/distance.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/both/distance.tsx:1` fixture: distance (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/both/expanded-reverse.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/both/expanded-reverse.tsx:1` fixture: expanded-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/both/expanded.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/both/expanded.tsx:1` fixture: expanded (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/both/unit-word-reverse.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/both/unit-word-reverse.tsx:1` fixture: unit-word-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/both/unit-word.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/both/unit-word.tsx:1` fixture: unit-word (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/emojis/keycap-reverse.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/emojis/keycap-reverse.tsx:1` fixture: keycap-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/emojis/keycap.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/emojis/keycap.tsx:1` fixture: keycap (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/emojis/ri-reverse.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/emojis/ri-reverse.tsx:1` fixture: ri-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/emojis/ri.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/emojis/ri.tsx:1` fixture: ri (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/emojis/tag-reverse.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/emojis/tag-reverse.tsx:1` fixture: tag-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/emojis/tag.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/emojis/tag.tsx:1` fixture: tag (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/emojis/zwj-reverse.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/emojis/zwj-reverse.tsx:1` fixture: zwj-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/emojis/zwj.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/emojis/zwj.tsx:1` fixture: zwj (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/end/backward-reverse.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/end/backward-reverse.tsx:1` fixture: backward-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/end/backward.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/end/backward.tsx:1` fixture: backward (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/end/collapsed-reverse.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/end/collapsed-reverse.tsx:1` fixture: collapsed-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/end/distance-reverse.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/end/distance-reverse.tsx:1` fixture: distance-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/end/distance.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/end/distance.tsx:1` fixture: distance (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/end/expanded-reverse.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/end/expanded-reverse.tsx:1` fixture: expanded-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/end/expanded.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/end/expanded.tsx:1` fixture: expanded (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/end/from-backward-reverse.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/end/from-backward-reverse.tsx:1` fixture: from-backward-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/end/to-backward-reverse.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/end/to-backward-reverse.tsx:1` fixture: to-backward-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/focus/backward.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/focus/backward.tsx:1` fixture: backward (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/focus/collapsed-reverse.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/focus/collapsed-reverse.tsx:1` fixture: collapsed-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/focus/distance-reverse.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/focus/distance-reverse.tsx:1` fixture: distance-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/focus/distance.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/focus/distance.tsx:1` fixture: distance (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/focus/expanded-reverse.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/focus/expanded-reverse.tsx:1` fixture: expanded-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/focus/expanded.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/focus/expanded.tsx:1` fixture: expanded (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/focus/to-backward-reverse.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/focus/to-backward-reverse.tsx:1` fixture: to-backward-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/start/backward-reverse.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/start/backward-reverse.tsx:1` fixture: backward-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/start/backward.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/start/backward.tsx:1` fixture: backward (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/start/distance-reverse.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/start/distance-reverse.tsx:1` fixture: distance-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/start/distance.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/start/distance.tsx:1` fixture: distance (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/start/expanded-reverse.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/start/expanded-reverse.tsx:1` fixture: expanded-reverse (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/start/expanded.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/start/expanded.tsx:1` fixture: expanded (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/start/from-backward.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/start/from-backward.tsx:1` fixture: from-backward (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/move/start/to-backward.tsx`

category: portable
family: transform/move

- `../slate-audit/packages/slate/test/transforms/move/start/to-backward.tsx:1` fixture: to-backward (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/moveNodes/path/inside-next.tsx`

category: portable
family: transform/moveNodes

- `../slate-audit/packages/slate/test/transforms/moveNodes/path/inside-next.tsx:1` fixture: inside-next (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/moveNodes/path/nested.tsx`

category: portable
family: transform/moveNodes

- `../slate-audit/packages/slate/test/transforms/moveNodes/path/nested.tsx:1` fixture: nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/moveNodes/path/noop-equal.tsx`

category: portable
family: transform/moveNodes

- `../slate-audit/packages/slate/test/transforms/moveNodes/path/noop-equal.tsx:1` fixture: noop-equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/moveNodes/path/text-nodes.tsx`

category: portable
family: transform/moveNodes

- `../slate-audit/packages/slate/test/transforms/moveNodes/path/text-nodes.tsx:1` fixture: text-nodes (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/moveNodes/path/text.tsx`

category: portable
family: transform/moveNodes

- `../slate-audit/packages/slate/test/transforms/moveNodes/path/text.tsx:1` fixture: text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/moveNodes/path/to-sibling.tsx`

category: portable
family: transform/moveNodes

- `../slate-audit/packages/slate/test/transforms/moveNodes/path/to-sibling.tsx:1` fixture: to-sibling (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/moveNodes/selection/block-nested-after.tsx`

category: portable
family: transform/moveNodes

- `../slate-audit/packages/slate/test/transforms/moveNodes/selection/block-nested-after.tsx:1` fixture: block-nested-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/moveNodes/selection/block-nested-before.tsx`

category: portable
family: transform/moveNodes

- `../slate-audit/packages/slate/test/transforms/moveNodes/selection/block-nested-before.tsx:1` fixture: block-nested-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/moveNodes/selection/block-siblings-after.tsx`

category: portable
family: transform/moveNodes

- `../slate-audit/packages/slate/test/transforms/moveNodes/selection/block-siblings-after.tsx:1` fixture: block-siblings-after (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/moveNodes/selection/block-siblings-before.tsx`

category: portable
family: transform/moveNodes

- `../slate-audit/packages/slate/test/transforms/moveNodes/selection/block-siblings-before.tsx:1` fixture: block-siblings-before (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/moveNodes/selection/block.tsx`

category: portable
family: transform/moveNodes

- `../slate-audit/packages/slate/test/transforms/moveNodes/selection/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/moveNodes/voids-true/block.tsx`

category: portable
family: transform/moveNodes

- `../slate-audit/packages/slate/test/transforms/moveNodes/voids-true/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/moveNodes/voids-true/inline.tsx`

category: portable
family: transform/moveNodes

- `../slate-audit/packages/slate/test/transforms/moveNodes/voids-true/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/normalization/move_node.tsx`

category: portable
family: transform/normalization

- `../slate-audit/packages/slate/test/transforms/normalization/move_node.tsx:1` fixture: move_node (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/normalization/set_node.tsx`

category: portable
family: transform/normalization

- `../slate-audit/packages/slate/test/transforms/normalization/set_node.tsx:1` fixture: set_node (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/normalization/split_node-and-insert_node.tsx`

category: portable
family: transform/normalization

- `../slate-audit/packages/slate/test/transforms/normalization/split_node-and-insert_node.tsx:1` fixture: split_node-and-insert_node (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/removeNodes/path/block-nested.tsx`

category: portable
family: transform/removeNodes

- `../slate-audit/packages/slate/test/transforms/removeNodes/path/block-nested.tsx:1` fixture: block-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/removeNodes/path/block.tsx`

category: portable
family: transform/removeNodes

- `../slate-audit/packages/slate/test/transforms/removeNodes/path/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/removeNodes/path/inline.tsx`

category: portable
family: transform/removeNodes

- `../slate-audit/packages/slate/test/transforms/removeNodes/path/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/removeNodes/path/text.tsx`

category: portable
family: transform/removeNodes

- `../slate-audit/packages/slate/test/transforms/removeNodes/path/text.tsx:1` fixture: text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/removeNodes/select/block-only-void.tsx`

category: portable
family: transform/removeNodes

- `../slate-audit/packages/slate/test/transforms/removeNodes/select/block-only-void.tsx:1` fixture: block-only-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/removeNodes/select/block-void-multiple-texts.tsx`

category: portable
family: transform/removeNodes

- `../slate-audit/packages/slate/test/transforms/removeNodes/select/block-void-multiple-texts.tsx:1` fixture: block-void-multiple-texts (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/removeNodes/select/block-void.tsx`

category: portable
family: transform/removeNodes

- `../slate-audit/packages/slate/test/transforms/removeNodes/select/block-void.tsx:1` fixture: block-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/removeNodes/selection/block-across.tsx`

category: portable
family: transform/removeNodes

- `../slate-audit/packages/slate/test/transforms/removeNodes/selection/block-across.tsx:1` fixture: block-across (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/removeNodes/selection/block-all.tsx`

category: portable
family: transform/removeNodes

- `../slate-audit/packages/slate/test/transforms/removeNodes/selection/block-all.tsx:1` fixture: block-all (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/removeNodes/voids-true/block.tsx`

category: portable
family: transform/removeNodes

- `../slate-audit/packages/slate/test/transforms/removeNodes/voids-true/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/removeNodes/voids-true/inline.tsx`

category: portable
family: transform/removeNodes

- `../slate-audit/packages/slate/test/transforms/removeNodes/voids-true/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/select/path.tsx`

category: portable
family: transform/select

- `../slate-audit/packages/slate/test/transforms/select/path.tsx:1` fixture: path (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/select/point.tsx`

category: portable
family: transform/select

- `../slate-audit/packages/slate/test/transforms/select/point.tsx:1` fixture: point (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/select/range.tsx`

category: portable
family: transform/select

- `../slate-audit/packages/slate/test/transforms/select/range.tsx:1` fixture: range (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setNodes/basic-structure/can-be-serialized.tsx`

category: portable
family: transform/setNodes

- `../slate-audit/packages/slate/test/transforms/setNodes/basic-structure/can-be-serialized.tsx:1` fixture: can-be-serialized (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setNodes/basic-structure/invert-after-serialization.tsx`

category: portable
family: transform/setNodes

- `../slate-audit/packages/slate/test/transforms/setNodes/basic-structure/invert-after-serialization.tsx:1` fixture: invert-after-serialization (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setNodes/block/block-across.tsx`

category: portable
family: transform/setNodes

- `../slate-audit/packages/slate/test/transforms/setNodes/block/block-across.tsx:1` fixture: block-across (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setNodes/block/block-hanging.tsx`

category: portable
family: transform/setNodes

- `../slate-audit/packages/slate/test/transforms/setNodes/block/block-hanging.tsx:1` fixture: block-hanging (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setNodes/block/block-nested.tsx`

category: portable
family: transform/setNodes

- `../slate-audit/packages/slate/test/transforms/setNodes/block/block-nested.tsx:1` fixture: block-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setNodes/block/block-void.tsx`

category: portable
family: transform/setNodes

- `../slate-audit/packages/slate/test/transforms/setNodes/block/block-void.tsx:1` fixture: block-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setNodes/block/block.tsx`

category: portable
family: transform/setNodes

- `../slate-audit/packages/slate/test/transforms/setNodes/block/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setNodes/inline/inline-across.tsx`

category: portable
family: transform/setNodes

- `../slate-audit/packages/slate/test/transforms/setNodes/inline/inline-across.tsx:1` fixture: inline-across (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setNodes/inline/inline-block-hanging.tsx`

category: portable
family: transform/setNodes

- `../slate-audit/packages/slate/test/transforms/setNodes/inline/inline-block-hanging.tsx:1` fixture: inline-block-hanging (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setNodes/inline/inline-hanging.tsx`

category: portable
family: transform/setNodes

- `../slate-audit/packages/slate/test/transforms/setNodes/inline/inline-hanging.tsx:1` fixture: inline-hanging (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setNodes/inline/inline-nested.tsx`

category: portable
family: transform/setNodes

- `../slate-audit/packages/slate/test/transforms/setNodes/inline/inline-nested.tsx:1` fixture: inline-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setNodes/inline/inline-void-2.tsx`

category: portable
family: transform/setNodes

- `../slate-audit/packages/slate/test/transforms/setNodes/inline/inline-void-2.tsx:1` fixture: inline-void-2 (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setNodes/inline/inline-void.tsx`

category: portable
family: transform/setNodes

- `../slate-audit/packages/slate/test/transforms/setNodes/inline/inline-void.tsx:1` fixture: inline-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setNodes/inline/inline.tsx`

category: portable
family: transform/setNodes

- `../slate-audit/packages/slate/test/transforms/setNodes/inline/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setNodes/marks/mark-across-range.tsx`

category: portable
family: transform/setNodes

- `../slate-audit/packages/slate/test/transforms/setNodes/marks/mark-across-range.tsx:1` fixture: mark-across-range (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setNodes/marks/mark-void-collapsed.tsx`

category: portable
family: transform/setNodes

- `../slate-audit/packages/slate/test/transforms/setNodes/marks/mark-void-collapsed.tsx:1` fixture: mark-void-collapsed (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setNodes/marks/mark-void-range-hanging.tsx`

category: portable
family: transform/setNodes

- `../slate-audit/packages/slate/test/transforms/setNodes/marks/mark-void-range-hanging.tsx:1` fixture: mark-void-range-hanging (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setNodes/marks/mark-void-range.tsx`

category: portable
family: transform/setNodes

- `../slate-audit/packages/slate/test/transforms/setNodes/marks/mark-void-range.tsx:1` fixture: mark-void-range (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setNodes/merge/text.tsx`

category: portable
family: transform/setNodes

- `../slate-audit/packages/slate/test/transforms/setNodes/merge/text.tsx:1` fixture: text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setNodes/path/block.tsx`

category: portable
family: transform/setNodes

- `../slate-audit/packages/slate/test/transforms/setNodes/path/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setNodes/path/inline.tsx`

category: portable
family: transform/setNodes

- `../slate-audit/packages/slate/test/transforms/setNodes/path/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setNodes/path/text.tsx`

category: portable
family: transform/setNodes

- `../slate-audit/packages/slate/test/transforms/setNodes/path/text.tsx:1` fixture: text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setNodes/split/noop-collapsed.tsx`

category: portable
family: transform/setNodes

- `../slate-audit/packages/slate/test/transforms/setNodes/split/noop-collapsed.tsx:1` fixture: noop-collapsed (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setNodes/split/text-remove.tsx`

category: portable
family: transform/setNodes

- `../slate-audit/packages/slate/test/transforms/setNodes/split/text-remove.tsx:1` fixture: text-remove (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setNodes/split/text.tsx`

category: portable
family: transform/setNodes

- `../slate-audit/packages/slate/test/transforms/setNodes/split/text.tsx:1` fixture: text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setNodes/text/block-across.tsx`

category: portable
family: transform/setNodes

- `../slate-audit/packages/slate/test/transforms/setNodes/text/block-across.tsx:1` fixture: block-across (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setNodes/text/merge-across.tsx`

category: portable
family: transform/setNodes

- `../slate-audit/packages/slate/test/transforms/setNodes/text/merge-across.tsx:1` fixture: merge-across (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setNodes/text/text.tsx`

category: portable
family: transform/setNodes

- `../slate-audit/packages/slate/test/transforms/setNodes/text/text.tsx:1` fixture: text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setNodes/voids-true/block.tsx`

category: portable
family: transform/setNodes

- `../slate-audit/packages/slate/test/transforms/setNodes/voids-true/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/setPoint/offset.tsx`

category: portable
family: transform/setPoint

- `../slate-audit/packages/slate/test/transforms/setPoint/offset.tsx:1` fixture: offset (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/always/after-inline-void.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/always/after-inline-void.tsx:1` fixture: after-inline-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/always/after-inline.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/always/after-inline.tsx:1` fixture: after-inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/always/before-inline.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/always/before-inline.tsx:1` fixture: before-inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/always/block-end.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/always/block-end.tsx:1` fixture: block-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/always/block-start.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/always/block-start.tsx:1` fixture: block-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/match-any/zero.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/match-any/zero.tsx:1` fixture: zero (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/match-block/block-middle-multiple-texts.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/match-block/block-middle-multiple-texts.tsx:1` fixture: block-middle-multiple-texts (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/match-block/block-middle.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/match-block/block-middle.tsx:1` fixture: block-middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/match-block/inline-middle.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/match-block/inline-middle.tsx:1` fixture: inline-middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/match-inline/inline-middle.js`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/match-inline/inline-middle.js:1` fixture: inline-middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/path/block-inline.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/path/block-inline.tsx:1` fixture: block-inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/path/block-nested-void.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/path/block-nested-void.tsx:1` fixture: block-nested-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/path/block-nested.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/path/block-nested.tsx:1` fixture: block-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/path/block-void.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/path/block-void.tsx:1` fixture: block-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/path/block-with-attributes.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/path/block-with-attributes.tsx:1` fixture: block-with-attributes (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/path/inline-void.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/path/inline-void.tsx:1` fixture: inline-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/path/inline.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/path/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/point/block-void.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/point/block-void.tsx:1` fixture: block-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/point/inline-void.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/point/inline-void.tsx:1` fixture: inline-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/point/inline.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/point/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/point/text-with-marks.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/point/text-with-marks.tsx:1` fixture: text-with-marks (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/selection/block-across.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/selection/block-across.tsx:1` fixture: block-across (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/selection/block-expanded.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/selection/block-expanded.tsx:1` fixture: block-expanded (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/selection/block-hanging.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/selection/block-hanging.tsx:1` fixture: block-hanging (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/selection/block-nested-void.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/selection/block-nested-void.tsx:1` fixture: block-nested-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/selection/block-void-end.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/selection/block-void-end.tsx:1` fixture: block-void-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/selection/block-void-middle.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/selection/block-void-middle.tsx:1` fixture: block-void-middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/selection/block-void-start.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/selection/block-void-start.tsx:1` fixture: block-void-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/selection/inline-across.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/selection/inline-across.tsx:1` fixture: inline-across (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/selection/inline-expanded.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/selection/inline-expanded.tsx:1` fixture: inline-expanded (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/selection/inline-void-end.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/selection/inline-void-end.tsx:1` fixture: inline-void-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/selection/inline-void.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/selection/inline-void.tsx:1` fixture: inline-void (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/voids-true/block.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/voids-true/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/splitNodes/voids-true/inline.tsx`

category: portable
family: transform/splitNodes

- `../slate-audit/packages/slate/test/transforms/splitNodes/voids-true/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/unsetNodes/operation-contents-check.tsx`

category: portable
family: transform/unsetNodes

- `../slate-audit/packages/slate/test/transforms/unsetNodes/operation-contents-check.tsx:1` fixture: operation-contents-check (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/unsetNodes/text.tsx`

category: portable
family: transform/unsetNodes

- `../slate-audit/packages/slate/test/transforms/unsetNodes/text.tsx:1` fixture: text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/unwrapNodes/match-block/block-across.tsx`

category: portable
family: transform/unwrapNodes

- `../slate-audit/packages/slate/test/transforms/unwrapNodes/match-block/block-across.tsx:1` fixture: block-across (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/unwrapNodes/match-block/block-end.tsx`

category: portable
family: transform/unwrapNodes

- `../slate-audit/packages/slate/test/transforms/unwrapNodes/match-block/block-end.tsx:1` fixture: block-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/unwrapNodes/match-block/block-inline.tsx`

category: portable
family: transform/unwrapNodes

- `../slate-audit/packages/slate/test/transforms/unwrapNodes/match-block/block-inline.tsx:1` fixture: block-inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/unwrapNodes/match-block/block-middle.tsx`

category: portable
family: transform/unwrapNodes

- `../slate-audit/packages/slate/test/transforms/unwrapNodes/match-block/block-middle.tsx:1` fixture: block-middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/unwrapNodes/match-block/block-nested.tsx`

category: portable
family: transform/unwrapNodes

- `../slate-audit/packages/slate/test/transforms/unwrapNodes/match-block/block-nested.tsx:1` fixture: block-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/unwrapNodes/match-block/block-start.tsx`

category: portable
family: transform/unwrapNodes

- `../slate-audit/packages/slate/test/transforms/unwrapNodes/match-block/block-start.tsx:1` fixture: block-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/unwrapNodes/match-block/block.tsx`

category: portable
family: transform/unwrapNodes

- `../slate-audit/packages/slate/test/transforms/unwrapNodes/match-block/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/unwrapNodes/match-inline/block-nested.tsx`

category: portable
family: transform/unwrapNodes

- `../slate-audit/packages/slate/test/transforms/unwrapNodes/match-inline/block-nested.tsx:1` fixture: block-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/unwrapNodes/match-inline/inline-across.tsx`

category: portable
family: transform/unwrapNodes

- `../slate-audit/packages/slate/test/transforms/unwrapNodes/match-inline/inline-across.tsx:1` fixture: inline-across (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/unwrapNodes/match-inline/inline-over.tsx`

category: portable
family: transform/unwrapNodes

- `../slate-audit/packages/slate/test/transforms/unwrapNodes/match-inline/inline-over.tsx:1` fixture: inline-over (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/unwrapNodes/match-inline/inline.tsx`

category: portable
family: transform/unwrapNodes

- `../slate-audit/packages/slate/test/transforms/unwrapNodes/match-inline/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/unwrapNodes/mode-all/match-ancestors.tsx`

category: portable
family: transform/unwrapNodes

- `../slate-audit/packages/slate/test/transforms/unwrapNodes/mode-all/match-ancestors.tsx:1` fixture: match-ancestors (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/unwrapNodes/mode-all/match-siblings-and-parent.tsx`

category: portable
family: transform/unwrapNodes

- `../slate-audit/packages/slate/test/transforms/unwrapNodes/mode-all/match-siblings-and-parent.tsx:1` fixture: match-siblings-and-parent (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/unwrapNodes/mode-all/match-siblings.tsx`

category: portable
family: transform/unwrapNodes

- `../slate-audit/packages/slate/test/transforms/unwrapNodes/mode-all/match-siblings.tsx:1` fixture: match-siblings (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/unwrapNodes/mode-all/match-some-siblings-and-parent-split.tsx`

category: portable
family: transform/unwrapNodes

- `../slate-audit/packages/slate/test/transforms/unwrapNodes/mode-all/match-some-siblings-and-parent-split.tsx:1` fixture: match-some-siblings-and-parent-split (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/unwrapNodes/mode-all/match-some-siblings-and-parent.tsx`

category: portable
family: transform/unwrapNodes

- `../slate-audit/packages/slate/test/transforms/unwrapNodes/mode-all/match-some-siblings-and-parent.tsx:1` fixture: match-some-siblings-and-parent (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/unwrapNodes/mode-all/match-some-siblings.tsx`

category: portable
family: transform/unwrapNodes

- `../slate-audit/packages/slate/test/transforms/unwrapNodes/mode-all/match-some-siblings.tsx:1` fixture: match-some-siblings (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/unwrapNodes/path/block-multiple.tsx`

category: portable
family: transform/unwrapNodes

- `../slate-audit/packages/slate/test/transforms/unwrapNodes/path/block-multiple.tsx:1` fixture: block-multiple (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/unwrapNodes/path/block.tsx`

category: portable
family: transform/unwrapNodes

- `../slate-audit/packages/slate/test/transforms/unwrapNodes/path/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/unwrapNodes/split-block/block-all-nested.tsx`

category: portable
family: transform/unwrapNodes

- `../slate-audit/packages/slate/test/transforms/unwrapNodes/split-block/block-all-nested.tsx:1` fixture: block-all-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/unwrapNodes/split-block/block-all.tsx`

category: portable
family: transform/unwrapNodes

- `../slate-audit/packages/slate/test/transforms/unwrapNodes/split-block/block-all.tsx:1` fixture: block-all (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/unwrapNodes/split-block/block-end.tsx`

category: portable
family: transform/unwrapNodes

- `../slate-audit/packages/slate/test/transforms/unwrapNodes/split-block/block-end.tsx:1` fixture: block-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/unwrapNodes/split-block/block-middle.tsx`

category: portable
family: transform/unwrapNodes

- `../slate-audit/packages/slate/test/transforms/unwrapNodes/split-block/block-middle.tsx:1` fixture: block-middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/unwrapNodes/split-block/block-nested.tsx`

category: portable
family: transform/unwrapNodes

- `../slate-audit/packages/slate/test/transforms/unwrapNodes/split-block/block-nested.tsx:1` fixture: block-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/unwrapNodes/split-block/block-start.tsx`

category: portable
family: transform/unwrapNodes

- `../slate-audit/packages/slate/test/transforms/unwrapNodes/split-block/block-start.tsx:1` fixture: block-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/unwrapNodes/split-block/block.tsx`

category: portable
family: transform/unwrapNodes

- `../slate-audit/packages/slate/test/transforms/unwrapNodes/split-block/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/wrapNodes/block/block-across-nested.tsx`

category: portable
family: transform/wrapNodes

- `../slate-audit/packages/slate/test/transforms/wrapNodes/block/block-across-nested.tsx:1` fixture: block-across-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/wrapNodes/block/block-across-uneven.tsx`

category: portable
family: transform/wrapNodes

- `../slate-audit/packages/slate/test/transforms/wrapNodes/block/block-across-uneven.tsx:1` fixture: block-across-uneven (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/wrapNodes/block/block-across.tsx`

category: portable
family: transform/wrapNodes

- `../slate-audit/packages/slate/test/transforms/wrapNodes/block/block-across.tsx:1` fixture: block-across (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/wrapNodes/block/block-end.tsx`

category: portable
family: transform/wrapNodes

- `../slate-audit/packages/slate/test/transforms/wrapNodes/block/block-end.tsx:1` fixture: block-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/wrapNodes/block/block-nested.tsx`

category: portable
family: transform/wrapNodes

- `../slate-audit/packages/slate/test/transforms/wrapNodes/block/block-nested.tsx:1` fixture: block-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/wrapNodes/block/block.tsx`

category: portable
family: transform/wrapNodes

- `../slate-audit/packages/slate/test/transforms/wrapNodes/block/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/wrapNodes/block/inline-across.tsx`

category: portable
family: transform/wrapNodes

- `../slate-audit/packages/slate/test/transforms/wrapNodes/block/inline-across.tsx:1` fixture: inline-across (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/wrapNodes/block/omit-all.tsx`

category: portable
family: transform/wrapNodes

- `../slate-audit/packages/slate/test/transforms/wrapNodes/block/omit-all.tsx:1` fixture: omit-all (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/wrapNodes/block/omit-nodes.tsx`

category: portable
family: transform/wrapNodes

- `../slate-audit/packages/slate/test/transforms/wrapNodes/block/omit-nodes.tsx:1` fixture: omit-nodes (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/wrapNodes/inline/inline-across-nested.tsx`

category: portable
family: transform/wrapNodes

- `../slate-audit/packages/slate/test/transforms/wrapNodes/inline/inline-across-nested.tsx:1` fixture: inline-across-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/wrapNodes/inline/inline-across.tsx`

category: portable
family: transform/wrapNodes

- `../slate-audit/packages/slate/test/transforms/wrapNodes/inline/inline-across.tsx:1` fixture: inline-across (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/wrapNodes/inline/inline.tsx`

category: portable
family: transform/wrapNodes

- `../slate-audit/packages/slate/test/transforms/wrapNodes/inline/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/wrapNodes/inline/text.tsx`

category: portable
family: transform/wrapNodes

- `../slate-audit/packages/slate/test/transforms/wrapNodes/inline/text.tsx:1` fixture: text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/wrapNodes/path/block.tsx`

category: portable
family: transform/wrapNodes

- `../slate-audit/packages/slate/test/transforms/wrapNodes/path/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/wrapNodes/selection/depth-text.tsx`

category: portable
family: transform/wrapNodes

- `../slate-audit/packages/slate/test/transforms/wrapNodes/selection/depth-text.tsx:1` fixture: depth-text (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/wrapNodes/split-block/block-across.tsx`

category: portable
family: transform/wrapNodes

- `../slate-audit/packages/slate/test/transforms/wrapNodes/split-block/block-across.tsx:1` fixture: block-across (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/wrapNodes/split-block/block-end.tsx`

category: portable
family: transform/wrapNodes

- `../slate-audit/packages/slate/test/transforms/wrapNodes/split-block/block-end.tsx:1` fixture: block-end (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/wrapNodes/split-block/block-mark.tsx`

category: portable
family: transform/wrapNodes

- `../slate-audit/packages/slate/test/transforms/wrapNodes/split-block/block-mark.tsx:1` fixture: block-mark (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/wrapNodes/split-block/block-middle.tsx`

category: portable
family: transform/wrapNodes

- `../slate-audit/packages/slate/test/transforms/wrapNodes/split-block/block-middle.tsx:1` fixture: block-middle (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/wrapNodes/split-block/block-nested.tsx`

category: portable
family: transform/wrapNodes

- `../slate-audit/packages/slate/test/transforms/wrapNodes/split-block/block-nested.tsx:1` fixture: block-nested (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/wrapNodes/split-block/block-start.tsx`

category: portable
family: transform/wrapNodes

- `../slate-audit/packages/slate/test/transforms/wrapNodes/split-block/block-start.tsx:1` fixture: block-start (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/wrapNodes/split-block/block.tsx`

category: portable
family: transform/wrapNodes

- `../slate-audit/packages/slate/test/transforms/wrapNodes/split-block/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/wrapNodes/split-inline/inline-mark.tsx`

category: portable
family: transform/wrapNodes

- `../slate-audit/packages/slate/test/transforms/wrapNodes/split-inline/inline-mark.tsx:1` fixture: inline-mark (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/wrapNodes/split-inline/inline.tsx`

category: portable
family: transform/wrapNodes

- `../slate-audit/packages/slate/test/transforms/wrapNodes/split-inline/inline.tsx:1` fixture: inline (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/transforms/wrapNodes/voids-true/block.tsx`

category: portable
family: transform/wrapNodes

- `../slate-audit/packages/slate/test/transforms/wrapNodes/voids-true/block.tsx:1` fixture: block (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/utils/deep-equal/deep-equals-with-array.js`

category: portable
family: utility/deep-equal

- `../slate-audit/packages/slate/test/utils/deep-equal/deep-equals-with-array.js:1` fixture: deep-equals-with-array (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/utils/deep-equal/deep-equals.js`

category: portable
family: utility/deep-equal

- `../slate-audit/packages/slate/test/utils/deep-equal/deep-equals.js:1` fixture: deep-equals (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/utils/deep-equal/deep-not-equal-multiple-objects.js`

category: portable
family: utility/deep-equal

- `../slate-audit/packages/slate/test/utils/deep-equal/deep-not-equal-multiple-objects.js:1` fixture: deep-not-equal-multiple-objects (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/utils/deep-equal/deep-not-equal-nested-undefined.js`

category: portable
family: utility/deep-equal

- `../slate-audit/packages/slate/test/utils/deep-equal/deep-not-equal-nested-undefined.js:1` fixture: deep-not-equal-nested-undefined (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/utils/deep-equal/deep-not-equal.js`

category: portable
family: utility/deep-equal

- `../slate-audit/packages/slate/test/utils/deep-equal/deep-not-equal.js:1` fixture: deep-not-equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/utils/deep-equal/deep-not-equals-with-array.js`

category: portable
family: utility/deep-equal

- `../slate-audit/packages/slate/test/utils/deep-equal/deep-not-equals-with-array.js:1` fixture: deep-not-equals-with-array (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/utils/deep-equal/simple-equals.js`

category: portable
family: utility/deep-equal

- `../slate-audit/packages/slate/test/utils/deep-equal/simple-equals.js:1` fixture: simple-equals (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/utils/deep-equal/simple-not-equal.js`

category: portable
family: utility/deep-equal

- `../slate-audit/packages/slate/test/utils/deep-equal/simple-not-equal.js:1` fixture: simple-not-equal (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/utils/deep-equal/undefined-key-equal-backward.js`

category: portable
family: utility/deep-equal

- `../slate-audit/packages/slate/test/utils/deep-equal/undefined-key-equal-backward.js:1` fixture: undefined-key-equal-backward (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/utils/deep-equal/undefined-key-equal-forward.js`

category: portable
family: utility/deep-equal

- `../slate-audit/packages/slate/test/utils/deep-equal/undefined-key-equal-forward.js:1` fixture: undefined-key-equal-forward (dynamic fixture name from support/fixtures.js:31-56)

## `../slate-audit/packages/slate/test/utils/string.ts`

category: portable
family: utility/string.ts

- `../slate-audit/packages/slate/test/utils/string.ts:114` describe: describe(`getCharacterDistance - ${dir}`, () => {
- `../slate-audit/packages/slate/test/utils/string.ts:118` it: it(str, () => {
- `../slate-audit/packages/slate/test/utils/string.ts:124` it: it(str, () => {
- `../slate-audit/packages/slate/test/utils/string.ts:130` it: it(str, () => {
- `../slate-audit/packages/slate/test/utils/string.ts:136` it: it(str, () => {
- `../slate-audit/packages/slate/test/utils/string.ts:142` it: it(str, () => {
- `../slate-audit/packages/slate/test/utils/string.ts:155` it: it(`Sample string ${label}, boundary ${isRTL ? i : i + 1}`, () => {
- `../slate-audit/packages/slate/test/utils/string.ts:179` describe: describe(`getWordDistance - ltr`, () => {
- `../slate-audit/packages/slate/test/utils/string.ts:181` it: it(str, () => {
- `../slate-audit/packages/slate/test/utils/string.ts:187` describe: describe(`getWordDistance - rtl`, () => {
- `../slate-audit/packages/slate/test/utils/string.ts:189` it: it(str, () => {
- `../slate-audit/packages/slate/test/utils/string.ts:203` describe: describe('codepointsIteratorRTL', () => {
- `../slate-audit/packages/slate/test/utils/string.ts:205` it: it(str, () => {

## `../slate-audit/playwright/integration/examples/check-lists.test.ts`

category: portable-mixed
family: browser-example/check-lists

- `../slate-audit/playwright/integration/examples/check-lists.test.ts:3` describe: test.describe('Check-lists example', () => {
- `../slate-audit/playwright/integration/examples/check-lists.test.ts:8` test: test('checks the bullet when clicked', async ({ page }) => {

## `../slate-audit/playwright/integration/examples/code-highlighting.test.ts`

category: portable-mixed
family: browser-example/code-highlighting

- `../slate-audit/playwright/integration/examples/code-highlighting.test.ts:5` describe: test.describe('code highlighting', () => {
- `../slate-audit/playwright/integration/examples/code-highlighting.test.ts:13` test: test(`code highlighting ${language}`, async ({ page }) => {

## `../slate-audit/playwright/integration/examples/decorations-async.test.ts`

category: portable-mixed
family: browser-example/decorations-async

- `../slate-audit/playwright/integration/examples/decorations-async.test.ts:3` describe: test.describe('decorations-async', () => {
- `../slate-audit/playwright/integration/examples/decorations-async.test.ts:8` test: test('highlights duplicate words on initial load', async ({ page }) => {
- `../slate-audit/playwright/integration/examples/decorations-async.test.ts:14` test: test('caret does not jump when async decoration fires', async ({ page }) => {

## `../slate-audit/playwright/integration/examples/editable-voids.test.ts`

category: portable-mixed
family: browser-example/editable-voids

- `../slate-audit/playwright/integration/examples/editable-voids.test.ts:3` describe: test.describe('editable voids', () => {
- `../slate-audit/playwright/integration/examples/editable-voids.test.ts:15` test: test('checks for the elements', async ({ page }) => {
- `../slate-audit/playwright/integration/examples/editable-voids.test.ts:22` test: test('should double the elements', async ({ page }) => {
- `../slate-audit/playwright/integration/examples/editable-voids.test.ts:32` test: test('make sure you can edit editable void', async ({ page }) => {

## `../slate-audit/playwright/integration/examples/embeds.test.ts`

category: portable-mixed
family: browser-example/embeds

- `../slate-audit/playwright/integration/examples/embeds.test.ts:3` describe: test.describe('embeds example', () => {
- `../slate-audit/playwright/integration/examples/embeds.test.ts:10` test: test('contains embeded', async ({ page }) => {

## `../slate-audit/playwright/integration/examples/forced-layout.test.ts`

category: portable-mixed
family: browser-example/forced-layout

- `../slate-audit/playwright/integration/examples/forced-layout.test.ts:3` describe: test.describe('forced layout example', () => {
- `../slate-audit/playwright/integration/examples/forced-layout.test.ts:13` test: test('checks for the elements', async ({ page }) => {
- `../slate-audit/playwright/integration/examples/forced-layout.test.ts:19` test: test('checks if elements persist even after everything is deleted', async ({

## `../slate-audit/playwright/integration/examples/hovering-toolbar.test.ts`

category: portable-mixed
family: browser-example/hovering-toolbar

- `../slate-audit/playwright/integration/examples/hovering-toolbar.test.ts:3` describe: test.describe('hovering toolbar example', () => {
- `../slate-audit/playwright/integration/examples/hovering-toolbar.test.ts:8` test: test('hovering toolbar appears', async ({ page }) => {
- `../slate-audit/playwright/integration/examples/hovering-toolbar.test.ts:21` test: test('hovering toolbar disappears', async ({ page }) => {

## `../slate-audit/playwright/integration/examples/huge-document.test.ts`

category: portable-mixed
family: browser-example/huge-document

- `../slate-audit/playwright/integration/examples/huge-document.test.ts:3` describe: test.describe('huge document example', () => {
- `../slate-audit/playwright/integration/examples/huge-document.test.ts:8` test: test('uses chunking', async ({ page }) => {

## `../slate-audit/playwright/integration/examples/iframe.test.ts`

category: portable-mixed
family: browser-example/iframe

- `../slate-audit/playwright/integration/examples/iframe.test.ts:3` describe: test.describe('iframe editor', () => {
- `../slate-audit/playwright/integration/examples/iframe.test.ts:8` test: test('should be editable', async ({ page }) => {

## `../slate-audit/playwright/integration/examples/images.test.ts`

category: portable-mixed
family: browser-example/images

- `../slate-audit/playwright/integration/examples/images.test.ts:3` describe: test.describe('images example', () => {
- `../slate-audit/playwright/integration/examples/images.test.ts:8` test: test('contains image', async ({ page }) => {

## `../slate-audit/playwright/integration/examples/inlines.test.ts`

category: portable-mixed
family: browser-example/inlines

- `../slate-audit/playwright/integration/examples/inlines.test.ts:3` describe: test.describe('Inlines example', () => {
- `../slate-audit/playwright/integration/examples/inlines.test.ts:8` test: test('contains link', async ({ page }) => {

## `../slate-audit/playwright/integration/examples/markdown-preview.test.ts`

category: portable-mixed
family: browser-example/markdown-preview

- `../slate-audit/playwright/integration/examples/markdown-preview.test.ts:3` describe: test.describe('markdown preview', () => {
- `../slate-audit/playwright/integration/examples/markdown-preview.test.ts:11` test: test('checks for markdown', async ({ page }) => {

## `../slate-audit/playwright/integration/examples/markdown-shortcuts.test.ts`

category: portable-mixed
family: browser-example/markdown-shortcuts

- `../slate-audit/playwright/integration/examples/markdown-shortcuts.test.ts:3` describe: test.describe('On markdown-shortcuts example', () => {
- `../slate-audit/playwright/integration/examples/markdown-shortcuts.test.ts:8` test: test('contains quote', async ({ page }) => {
- `../slate-audit/playwright/integration/examples/markdown-shortcuts.test.ts:14` test: test('can add list items', async ({ page }, testInfo) => {
- `../slate-audit/playwright/integration/examples/markdown-shortcuts.test.ts:43` test: test('can add a h1 item', async ({ page }) => {

## `../slate-audit/playwright/integration/examples/mentions.test.ts`

category: portable-mixed
family: browser-example/mentions

- `../slate-audit/playwright/integration/examples/mentions.test.ts:3` describe: test.describe('mentions example', () => {
- `../slate-audit/playwright/integration/examples/mentions.test.ts:9` test: test('renders mention element', async ({ page }) => {
- `../slate-audit/playwright/integration/examples/mentions.test.ts:14` test: test('shows list of mentions', async ({ page }) => {
- `../slate-audit/playwright/integration/examples/mentions.test.ts:22` test: test('inserts on enter from list', async ({ page }) => {

## `../slate-audit/playwright/integration/examples/paste-html.test.ts`

category: portable-mixed
family: browser-example/paste-html

- `../slate-audit/playwright/integration/examples/paste-html.test.ts:3` describe: test.describe('paste html example', () => {
- `../slate-audit/playwright/integration/examples/paste-html.test.ts:29` test: test('pasted bold text uses <strong>', async ({ page }) => {
- `../slate-audit/playwright/integration/examples/paste-html.test.ts:34` test: test('pasted code uses <code>', async ({ page }) => {

## `../slate-audit/playwright/integration/examples/placeholder.test.ts`

category: portable-mixed
family: browser-example/placeholder

- `../slate-audit/playwright/integration/examples/placeholder.test.ts:3` describe: test.describe('placeholder example', () => {
- `../slate-audit/playwright/integration/examples/placeholder.test.ts:9` test: test('renders custom placeholder', async ({ page }) => {
- `../slate-audit/playwright/integration/examples/placeholder.test.ts:18` test: test('renders editor tall enough to fit placeholder', async ({ page }) => {

## `../slate-audit/playwright/integration/examples/plaintext.test.ts`

category: portable-mixed
family: browser-example/plaintext

- `../slate-audit/playwright/integration/examples/plaintext.test.ts:3` describe: test.describe('plaintext example', () => {
- `../slate-audit/playwright/integration/examples/plaintext.test.ts:9` test: test('inserts text when typed', async ({ page }) => {

## `../slate-audit/playwright/integration/examples/read-only.test.ts`

category: portable-mixed
family: browser-example/read-only

- `../slate-audit/playwright/integration/examples/read-only.test.ts:3` describe: test.describe('readonly editor', () => {
- `../slate-audit/playwright/integration/examples/read-only.test.ts:8` test: test('should not be editable', async ({ page }) => {

## `../slate-audit/playwright/integration/examples/richtext.test.ts`

category: portable-mixed
family: browser-example/richtext

- `../slate-audit/playwright/integration/examples/richtext.test.ts:3` describe: test.describe('On richtext example', () => {
- `../slate-audit/playwright/integration/examples/richtext.test.ts:9` test: test('renders rich text', async ({ page }) => {
- `../slate-audit/playwright/integration/examples/richtext.test.ts:16` test: test('inserts text when typed', async ({ page }) => {
- `../slate-audit/playwright/integration/examples/richtext.test.ts:25` test: test('undo scrolls back to restored text after deletion and scroll away', async ({

## `../slate-audit/playwright/integration/examples/search-highlighting.test.ts`

category: portable-mixed
family: browser-example/search-highlighting

- `../slate-audit/playwright/integration/examples/search-highlighting.test.ts:3` describe: test.describe('search highlighting', () => {
- `../slate-audit/playwright/integration/examples/search-highlighting.test.ts:9` test: test('highlights the searched text', async ({ page }) => {

## `../slate-audit/playwright/integration/examples/select.test.ts`

category: portable-mixed
family: browser-example/select

- `../slate-audit/playwright/integration/examples/select.test.ts:3` describe: test.describe('selection', () => {
- `../slate-audit/playwright/integration/examples/select.test.ts:9` test: test('select the correct block when triple clicking', async ({ page }) => {

## `../slate-audit/playwright/integration/examples/shadow-dom.test.ts`

category: portable-mixed
family: browser-example/shadow-dom

- `../slate-audit/playwright/integration/examples/shadow-dom.test.ts:3` describe: test.describe('shadow-dom example', () => {
- `../slate-audit/playwright/integration/examples/shadow-dom.test.ts:9` test: test('renders slate editor inside nested shadow', async ({ page }) => {
- `../slate-audit/playwright/integration/examples/shadow-dom.test.ts:16` test: test('renders slate editor inside nested shadow and edits content', async ({
- `../slate-audit/playwright/integration/examples/shadow-dom.test.ts:37` test: test('user can type add a new line in editor inside shadow DOM', async ({

## `../slate-audit/playwright/integration/examples/styling.test.ts`

category: portable-mixed
family: browser-example/styling

- `../slate-audit/playwright/integration/examples/styling.test.ts:3` describe: test.describe('styling example', () => {
- `../slate-audit/playwright/integration/examples/styling.test.ts:9` test: test('applies styles to editor from style prop', async ({ page }) => {
- `../slate-audit/playwright/integration/examples/styling.test.ts:49` test: test('applies styles to editor from className prop', async ({ page }) => {

## `../slate-audit/playwright/integration/examples/tables.test.ts`

category: portable-mixed
family: browser-example/tables

- `../slate-audit/playwright/integration/examples/tables.test.ts:3` describe: test.describe('table example', () => {
- `../slate-audit/playwright/integration/examples/tables.test.ts:8` test: test('table tag rendered', async ({ page }) => {
