# @udecode/slate

## 47.2.3

### Patch Changes

- [#4246](https://github.com/udecode/plate/pull/4246) by [@felixfeng33](https://github.com/felixfeng33) –
  - New `editor.api.scrollIntoView` - Scrolls the editor to a specified position.
  - New `editor.tf.withScrolling` - Wraps a function and automatically scrolls the editor after `insertNode` and `insertText` operations (configurable).
  - New `editor.api.isScrolling` - Boolean flag indicating whether the editor is currently in a scrolling operation initiated by `withScrolling`.

## 45.0.6

### Patch Changes

- [#4107](https://github.com/udecode/plate/pull/4107) by [@12joan](https://github.com/12joan) – Change type of `editor.id` from `any` to `string`. The previous value of `any` was causing `NodeIn<Value>['id']` to have type `any`.

## 44.0.0

### Patch Changes

- [#4048](https://github.com/udecode/plate/pull/4048) by [@zbeyens](https://github.com/zbeyens) – Fix duplicateNodes when nodes is not passed

## 42.2.5

### Patch Changes

- [#4015](https://github.com/udecode/plate/pull/4015) by [@yf-yang](https://github.com/yf-yang) – Fix `editor.tf.moveNodes` type

## 42.0.3

### Patch Changes

- [#3952](https://github.com/udecode/plate/pull/3952) by [@zbeyens](https://github.com/zbeyens) –
  - Fix `editor.api.last(at, { level: 0 })` when editor has no children, it should return `undefined`. Fixes error on cmd+a > backspace.
  - Fix `editor.tf.removeNodes` when `previousEmptyBlock` is true without `at` option, it should return early.
    - Fixes #3960
  - Add `RangeApi.contains` to check if a range fully contains another range (both start and end points).
  - Add `editor.api.isSelected(target, { contains?: boolean })` to check if a path or range is selected by the current selection. When `contains` is true, checks if selection fully contains the target.
  - `editor.tf.insertText` now support both legacy slate transforms `editor.insertText` and `Transforms.insertText`:
    - `editor.insertText` -> `editor.tf.insertText` without `at` option. In addition, `marks: false` option can be used to exclude current marks. Default is `true`.
    - `Transforms.insertText` -> `editor.tf.insertText` with `at` option
  - Add `editor.api.next` option `from`:
    - `from?: 'after' | 'child'` (default: `'after'`): Determines where to start traversing from
    - `'after'`: Start from the point after the current location
    - `'child'`: Start from the first child of the current path. `at` must be a path.
  - Add `editor.api.previous` option `from`:
    - `from?: 'before' | 'parent'` (default: `'before'`): Determines where to start traversing from
    - `'before'`: Start from the point before the current location
    - `'parent'`: Start from the parent of the current path. `at` must be a path.

## 42.0.1

### Patch Changes

- [#3948](https://github.com/udecode/plate/pull/3948) by [@zbeyens](https://github.com/zbeyens) –
  - Fix `deselect`, `deselectDOM` methods
  - Remove all `LegacyEditorMethods` from `Editor`

## 42.0.0

### Major Changes

- [#3920](https://github.com/udecode/plate/pull/3920) by [@zbeyens](https://github.com/zbeyens) –

  - Remove `slate`, `slate-dom`, `slate-react`, `slate-history` and `slate-hyperscript` from your dependencies. It's now part of this package and `@udecode/plate`. All exports remain the same or have equivalents (see below).
  - Renamed `createTEditor` to `createEditor`.
  - `createEditor` now returns an editor (`Editor`) with all queries under `editor.api` and transforms under `editor.tf`. You can see or override them at a glance. For example, we now use `editor.tf.setNodes` instead of importing `setNodes`. This marks the completion of generic typing and the removal of error throws from `slate`, `slate-dom`, and `slate-history` queries/transforms, without forking implementations. We’ve also reduced the number of queries/transforms by merging a bunch of them.

  The following interfaces from `slate` and `slate-dom` are now part of `Editor`:

  - `Editor`, `EditorInterface`
  - `Transforms`
  - `HistoryEditor` (noop, unchanged), `HistoryEditorInterface`
  - `DOMEditor` (noop, unchanged), `DOMEditorInterface`
  - `editor.findPath` now returns `DOMEditor.findPath` (memo) and falls back to `findNodePath` (traversal, less performant) if not found.
  - Removed the first parameter (`editor`) from:
    - `editor.hasEditableTarget`
    - `editor.hasSelectableTarget`
    - `editor.isTargetInsideNonReadonlyVoid`
    - `editor.hasRange`
    - `editor.hasTarget`
  - `editor.api.node(options)` (previously `findNode`) `at` option is now `at ?? editor.selection` instead of `at ?? editor.selection ?? []`. That means if you want to lookup the entire document, you need to pass `[]` explicitly.
  - Removed `setNode` in favor of `setNodes` (you can now pass a `TNode` to `at` directly).
  - Removed `setElements` in favor of `setNodes`.
  - Removed unused `isWordAfterTrigger`, `setBlockAboveNode`, `setBlockAboveTexts`, `setBlockNodes`, `getPointNextToVoid`.
  - Replaced `Path` from slate with `Path` (type) and `PathApi` (static methods).
  - Replaced `Operation` from slate with `Operation` (type) and `OperationApi` (static methods).
  - Replaced `Point` from slate with `Point` (type) and `PointApi` (static methods).
  - Replaced `Text` from slate with `TText` (type) and `TextApi` (static methods). We also export `Text` type like `slate` but we don't recommend it as it's conflicting with the DOM type.
  - Replaced `Range` from slate with `TRange` (type) and `RangeApi` (static methods). We also export `Range` type like `slate` but we don't recommend it as it's conflicting with the DOM type.
  - Replaced `Location` from slate with `TLocation` (type) and `LocationApi` (static methods). We also export `Location` type like `slate` but we don't recommend it as it's conflicting with the DOM type.
  - Replaced `Span` from slate with `Span` (type) and `SpanApi` (static methods).
  - Replaced `Node` from slate with `TNode` (type) and `NodeApi` (static methods). We also export `Node` type like `slate` but we don't recommend it as it's conflicting with the DOM type.
  - Replaced `Element` from slate with `TElement` (type) and `ElementApi` (static methods). We also export `Element` type like `slate` but we don't recommend it as it's conflicting with the DOM type.
  - Signature change:

    - `editor.tf.toggle.block({ type, ...options })` -> `editor.tf.toggleBlock(type, options)`
    - `editor.tf.toggle.mark({ key, clear })` -> `editor.tf.toggleMark(key, { remove: clear })`

  - Moved editor functions:

    - `addMark` -> `editor.tf.addMark`
    - `addRangeMarks` -> `editor.tf.setNodes(props, { at, marks: true })`
    - `blurEditor` -> `editor.tf.blur`
    - `collapseSelection` -> `editor.tf.collapse`
    - `createDocumentNode` -> `editor.api.create.value` (core)
    - `createNode` -> `editor.api.create.block`
    - `createPathRef` -> `editor.api.pathRef`
    - `createPointRef` -> `editor.api.pointRef`
    - `createRangeRef` -> `editor.api.rangeRef`
    - `deleteBackward({ unit })` -> `editor.tf.deleteBackward(unit)`
    - `deleteForward({ unit })` -> `editor.tf.deleteForward(unit)`
    - `deleteFragment` -> `editor.tf.deleteFragment`
    - `deleteText` -> `editor.tf.delete`
    - `deselect` -> `editor.tf.deselect`
    - `deselectEditor` -> `editor.tf.deselectDOM`
    - `duplicateBlocks` -> `editor.tf.duplicateNodes({ nodes })`
    - `findDescendant` -> `editor.api.descendant`
    - `findEditorDocumentOrShadowRoot` -> `editor.api.findDocumentOrShadowRoot`
    - `findEventRange` -> `editor.api.findEventRange`
    - `findNode(options)` -> `editor.api.node(options)`
    - `findNodeKey` -> `editor.api.findKey`
    - `findNodePath` -> `editor.api.findPath`
    - `findPath` -> `editor.api.findPath`
    - `focusEditor` -> `editor.tf.focus({ at })`
    - `focusEditorEdge` -> `editor.tf.focus({ at, edge: 'startEditor' | 'endEditor' })`
    - `getAboveNode` -> `editor.api.above`
    - `getAncestorNode` -> `editor.api.block({ highest: true })`
    - `getBlockAbove` -> `editor.api.block({ at, above: true })` or `editor.api.block()` if `at` is not a path
    - `getBlocks` -> `editor.api.blocks`
    - `getEdgeBlocksAbove` -> `editor.api.edgeBlocks`
    - `getEdgePoints` -> `editor.api.edges`
    - `getEditorString` -> `editor.api.string`
    - `getEditorWindow` -> `editor.api.getWindow`
    - `getEndPoint` -> `editor.api.end`
    - `getFirstNode` -> `editor.api.first`
    - `getFragment` -> `editor.api.fragment`
    - `getFragmentProp(fragment, options)` -> `editor.api.prop({ nodes, ...options})`
    - `getLastNode` -> `editor.api.last`
    - `getLastNodeByLevel(level)` -> `editor.api.last([], { level })`
    - `getLeafNode` -> `editor.api.leaf`
    - `getLevels` -> `editor.api.levels`
    - `getMark` -> `editor.api.mark`
    - `getMarks` -> `editor.api.marks`
    - `getNextNode` -> `editor.api.next`
    - `getNextNodeStartPoint` -> `editor.api.start(at, { next: true })`
    - `getNodeEntries` -> `editor.api.nodes`
    - `getNodeEntry` -> `editor.api.node(at, options)`
    - `getNodesRange` -> `editor.api.nodesRange`
    - `getParentNode` -> `editor.api.parent`
    - `getPath` -> `editor.api.path`
    - `getPathRefs` -> `editor.api.pathRefs`
    - `getPoint` -> `editor.api.point`
    - `getPointAfter` -> `editor.api.after`
    - `getPointBefore` -> `editor.api.before`
    - `getPointBeforeLocation` -> `editor.api.before`
    - `getPointRefs` -> `editor.api.pointRefs`
    - `getPositions` -> `editor.api.positions`
    - `getPreviousBlockById` -> `editor.api.previous({ id, block: true })`
    - `getPreviousNode` -> `editor.api.previous`
    - `getPreviousNodeEndPoint` -> `editor.api.end({ previous: true })`
    - `getPreviousSiblingNode` -> `editor.api.previous({ at, sibling: true })`
    - `getRange` -> `editor.api.range`
    - `getRangeBefore` -> `editor.api.range('before', to, { before })`
    - `getRangeFromBlockStart` -> `editor.api.range('start', to)`
    - `getRangeRefs` -> `editor.api.rangeRefs`
    - `getSelectionFragment` -> `editor.api.fragment(editor.selection, { structuralTypes })`
    - `getSelectionText` -> `editor.api.string()`
    - `getStartPoint` -> `editor.api.start`
    - `getVoidNode` -> `editor.api.void`
    - `hasBlocks` -> `editor.api.hasBlocks`
    - `hasEditorDOMNode` -> `editor.api.hasDOMNode`
    - `hasEditorEditableTarget` -> `editor.api.hasEditableTarget`
    - `hasEditorSelectableTarget` -> `editor.api.hasSelectableTarget`
    - `hasEditorTarget` -> `editor.api.hasTarget`
    - `hasInlines` -> `editor.api.hasInlines`
    - `hasTexts` -> `editor.api.hasTexts`
    - `insertBreak` -> `editor.tf.insertBreak`
    - `insertData` -> `editor.tf.insertData`
    - `insertElements` -> `editor.tf.insertNodes<TElement>`
    - `insertEmptyElement` -> `editor.tf.insertNodes(editor.api.create.block({ type }))`
    - `insertFragment` -> `editor.tf.insertFragment`
    - `insertNode` -> `editor.tf.insertNode`
    - `insertNodes` -> `editor.tf.insertNodes`
    - `insertText` -> `editor.tf.insertText`
    - `isAncestorEmpty` -> `editor.api.isEmpty`
    - `isBlock` -> `editor.api.isBlock`
    - `isBlockAboveEmpty` -> `editor.api.isEmpty(editor.selection, { block: true })`
    - `isBlockTextEmptyAfterSelection` -> `editor.api.isEmpty(editor.selection, { after: true })`
    - `isCollapsed(editor.selection)` -> `editor.api.isCollapsed()`
    - `isComposing` -> `editor.api.isComposing`
    - `isDocumentEnd` -> `editor.api.isEditorEnd`
    - `isEdgePoint` -> `editor.api.isEdge`
    - `isEditor` -> `editor.api.isEditor`
    - `isEditorEmpty` -> `editor.api.isEmpty()`
    - `isEditorFocused` -> `editor.api.isFocused`
    - `isEditorNormalizing` -> `editor.api.isNormalizing`
    - `isEditorReadOnly` -> `editor.api.isReadOnly`
    - `isElementEmpty` -> `editor.api.isEmpty`
    - `isElementReadOnly` -> `editor.api.elementReadOnly`
    - `isEndPoint` -> `editor.api.isEnd`
    - `isExpanded(editor.selection)` -> `editor.api.isCollapsed()`
    - `isInline` -> `editor.api.isInline`
    - `isMarkableVoid` -> `editor.api.markableVoid`
    - `isMarkActive` -> `editor.api.hasMark(key)`
    - `isPointAtWordEnd` -> `editor.api.isAt({ at, word: true, end: true })`
    - `isRangeAcrossBlocks` -> `editor.api.isAt({ at, blocks: true })`
    - `isRangeInSameBlock` -> `editor.api.isAt({ at, block: true })`
    - `isRangeInSingleText` -> `editor.api.isAt({ at, text: true })`
    - `isSelectionAtBlockEnd` -> `editor.api.isAt({ end: true })`
    - `isSelectionAtBlockStart` -> `editor.api.isAt({ start: true })`
    - `isSelectionCoverBlock` -> `editor.api.isAt({ block: true, start: true, end: true })`
    - `isSelectionExpanded` -> `editor.api.isExpanded()`
    - `isStartPoint` -> `editor.api.isStart`
    - `isTargetinsideNonReadonlyVoidEditor` -> `editor.api.isTargetInsideNonReadonlyVoid`
    - `isTextByPath` -> `editor.api.isText(at)`
    - `isVoid` -> `editor.api.isVoid`
    - `liftNodes` -> `editor.tf.liftNodes`
    - `mergeNodes` -> `editor.tf.mergeNodes`
    - `moveChildren` -> `editor.tf.moveNodes({ at, to, children: true, fromIndex, match: (node, path) => boolean })`
    - `moveNodes` -> `editor.tf.moveNodes`
    - `moveSelection` -> `editor.tf.move`
    - `normalizeEditor` -> `editor.tf.normalize`
    - `removeEditorMark` -> `editor.tf.removeMark`
    - `removeEditorText` -> `editor.tf.removeNodes({ text: true, empty: false })`
    - `removeEmptyPreviousBlock` -> `editor.tf.removeNodes({ previousEmptyBlock: true })`
    - `removeMark(options)` -> `editor.tf.removeMarks(keys, options)`
    - `removeNodeChildren` -> `editor.tf.removeNodes({ at, children: true })`
    - `removeNodes` -> `editor.tf.removeNodes`
    - `removeSelectionMark` -> `editor.tf.removeMarks()`
    - `replaceNode(editor, { nodes, insertOptions, removeOptions })` -> `editor.tf.replaceNodes(nodes, { removeNodes, ...insertOptions })`
    - `select` -> `editor.tf.select`
    - `selectEndOfBlockAboveSelection` -> `editor.tf.select(editor.selection, { edge: 'end' })`
    - `selectNodes` -> `editor.tf.select(editor.api.nodesRange(nodes))`
    - `setFragmentData` -> `editor.tf.setFragmentData`
    - `setMarks(marks, clear)` -> `editor.tf.addMarks(marks, { remove: string | string[] })`
    - `setNodes` -> `editor.tf.setNodes`
    - `setPoint` -> `editor.tf.setPoint`
    - `setSelection` -> `editor.tf.setSelection`
    - `someNode` -> `editor.api.some(options)`
    - `splitNodes` -> `editor.tf.splitNodes`
    - `toDOMNode` -> `editor.api.toDOMNode`
    - `toDOMPoint` -> `editor.api.toDOMPoint`
    - `toDOMRange` -> `editor.api.toDOMRange`
    - `toggleWrapNodes` -> `editor.tf.toggleBlock(type, { wrap: true })`
    - `toSlateNode` -> `editor.api.toSlateNode`
    - `toSlatePoint` -> `editor.api.toSlatePoint`
    - `toSlateRange` -> `editor.api.toSlateRange`
    - `unhangCharacterRange` -> `editor.api.unhangRange(range, { character: true })`
    - `unhangRange` -> `editor.api.unhangRange`
    - `unsetNodes` -> `editor.tf.unsetNodes`
    - `unwrapNodes` -> `editor.tf.unwrapNodes`
    - `withoutNormalizing` -> `editor.tf.withoutNormalizing`
    - `wrapNodeChildren` -> `editor.tf.wrapNodes(element, { children: true })`
    - `wrapNodes` -> `editor.tf.wrapNodes`
    - `replaceNodeChildren` -> `editor.tf.replaceNodes({ at, children: true })`
    - `resetEditor` -> `editor.tf.reset`
    - `resetEditorChildren` -> `editor.tf.reset({ children: true })`
    - `selectEditor` -> `editor.tf.select([], { focus, edge })`
    - `selectSiblingNodePoint` -> `editor.tf.select(at, { next, previous })`

  - Moved to `NodeApi.`:
    - `getNextSiblingNodes(parentEntry, path)` -> `NodeApi.children(editor, path, { from: path.at(-1) + 1 })`
    - `getFirstNodeText` -> `NodeApi.firstText`
    - `getFirstChild([node, path])` -> `NodeApi.firstChild(editor, path)`
    - `getLastChild([node, path])` -> `NodeApi.lastChild(editor, path)`
    - `getLastChildPath([node, path])` -> `NodeApi.lastChild(editor, path)`
    - `isLastChild([node, path], childPath)` -> `NodeApi.isLastChild(editor, childPath)`
    - `getChildren([node, path])` -> `Array.from(NodeApi.children(editor, path))`
    - `getCommonNode` -> `NodeApi.common`
    - `getNode` -> `NodeApi.get`
    - `getNodeAncestor` -> `NodeApi.ancestor`
    - `getNodeAncestors` -> `NodeApi.ancestors`
    - `getNodeChild` -> `NodeApi.child`
    - `getNodeChildren` -> `NodeApi.children`
    - `getNodeDescendant` -> `NodeApi.descendant`
    - `getNodeDescendants` -> `NodeApi.descendants`
    - `getNodeElements` -> `NodeApi.elements`
    - `getNodeFirstNode` -> `NodeApi.first`
    - `getNodeFragment` -> `NodeApi.fragment`
    - `getNodeLastNode` -> `NodeApi.last`
    - `getNodeLeaf` -> `NodeApi.leaf`
    - `getNodeLevels` -> `NodeApi.levels`
    - `getNodeParent` -> `NodeApi.parent`
    - `getNodeProps` -> `NodeApi.extractProps`
    - `getNodes` -> `NodeApi.nodes`
    - `getNodeString` -> `NodeApi.string`
    - `getNodeTexts` -> `NodeApi.texts`
    - `hasNode` -> `NodeApi.has`
    - `hasSingleChild` -> `NodeApi.hasSingleChild`
    - `isAncestor` -> `NodeApi.isAncestor`
    - `isDescendant` -> `NodeApi.isDescendant`
    - `isNode` -> `NodeApi.isNode`
    - `isNodeList` -> `NodeApi.isNodeList`
    - `nodeMatches` -> `NodeApi.matches`
  - Moved to `ElementApi.`:
    - `elementMatches` -> `ElementApi.matches`
    - `isElement` -> `ElementApi.isElement`
    - `isElementList` -> `ElementApi.isElementList`
  - Moved to `TextApi.`:

    - `isText` -> `TextApi.isText(at)`

  - Moved to `RangeApi.`:

    - `isCollapsed` -> `RangeApi.isCollapsed`
    - `isExpanded` -> `RangeApi.isExpanded`

  - Moved to `PathApi.`:

    - `isFirstChild` -> `!PathApi.hasPrevious`
    - `getPreviousPath` -> `PathApi.previous`

  - Moved to `PointApi.`:

    - `getPointFromLocation({ at, focus })` -> `PointApi.get(at, { focus })`

  - Moved from `@udecode/plate/react` to `@udecode/plate`:

    - `Hotkeys`

  - Upgraded to `zustand@5` and `zustand-x@5`:
    - Replace `createZustandStore('name')(initialState)` with `createZustandStore(initialState, { mutative: true, name: 'name' })`
    - All plugin stores now use [zustand-mutative](https://github.com/mutativejs/zustand-mutative) for immutable state updates, which is faster than `immer`.

  Types:

  - Rename the following types:
    - `TEditor` -> `Editor`
    - `TOperation` -> `Operation`
    - `TPath` -> `Path`
    - `TNodeProps` -> `NodeProps`
    - `TNodeChildEntry` -> `NodeChildEntry`
    - `TNodeEntry` -> `NodeEntry`
    - `TDescendant` -> `Descendant`
    - `TDescendantEntry` -> `DescendantEntry`
    - `TAncestor` -> `Ancestor`
    - `TAncestorEntry` -> `AncestorEntry`
    - `TElementEntry` -> `ElementEntry`
    - `TTextEntry` -> `TextEntry`
  - Query/transform options now use generic `V extends Value` instead of `E extends Editor`.
  - `getEndPoint`, `getEdgePoints`, `getFirstNode`, `getFragment`, `getLastNode`, `getLeafNode`, `getPath`, `getPoint`, `getStartPoint` can return `undefined` if not found (suppressing error throws).
  - `NodeApi.ancestor`, `NodeApi.child`, `NodeApi.common`, `NodeApi.descendant`, `NodeApi.first`, `NodeApi.get`, `NodeApi.last`, `NodeApi.leaf`, `NodeApi.parent`, `NodeApi.getIf`, `PathApi.previous` return `undefined` if not found instead of throwing
  - Replace `NodeOf` type with `DescendantOf` in `editor.tf.setNodes` `editor.tf.unsetNodes`, `editor.api.previous`, `editor.api.node`, `editor.api.nodes`, `editor.api.last`
  - Enhanced `editor.tf.setNodes`:
    - Added `marks` option to handle mark-specific operations
    - When `marks: true`:
      - Only applies to text nodes in non-void nodes or markable void nodes
      - Automatically sets `split: true` and `voids: true`
      - Handles both expanded ranges and collapsed selections in markable voids
    - Replaces `addRangeMarks` functionality

### Minor Changes

- [#3920](https://github.com/udecode/plate/pull/3920) by [@zbeyens](https://github.com/zbeyens) –
  - Merged `@udecode/slate-react` and `@udecode/slate-utils` queries and transforms into this package.
  - `editor.insertNode`: added an `options` parameter.
  - Added `| TNode` to the `at` type of the following methods’ options: `editor.api.above`, `editor.api.edges`, `editor.api.string`, `editor.api.end`, `editor.api.first`, `editor.api.fragment`, `editor.api.last`, `editor.api.leaf`, `editor.api.levels`, `editor.api.next`, `editor.api.nodes`, `editor.api.node`, `editor.api.parent`, `editor.api.path`, `editor.api.point`, `editor.api.after`, `editor.api.before`, `editor.api.positions`, `editor.api.previous`, `editor.api.range`, `editor.api.start`, `editor.api.void`, `editor.tf.insertNode`, `editor.tf.delete`, `editor.tf.focus`, `editor.tf.insertFragment`, `editor.tf.insertNodes`, `editor.tf.insertText`, `editor.tf.liftNodes`, `editor.tf.mergeNodes`, `editor.tf.moveNodes`, `editor.tf.removeNodes`, `editor.tf.select`, `editor.tf.setNodes`, `editor.tf.splitNodes`, `editor.tf.unsetNodes`, `editor.tf.unwrapNodes`, `editor.tf.wrapNodes`
  - `match` query option: Added `text` and `empty` options.
    - Added `id` option to query options for finding nodes by id.
    - Added `text?: boolean` option to match only text nodes.
    - Added `empty?: boolean` option to match only empty nodes.

## 41.0.0

### Minor Changes

- [#3830](https://github.com/udecode/plate/pull/3830) by [@felixfeng33](https://github.com/felixfeng33) – Add `findNodePath` - a traversal-based node path finder with O(n) complexity. This is the headless alternative to `findPath` from `@udecode/slate-react`, recommended for:

  - Non-React contexts
  - Plugin logic that doesn't require React dependencies
  - Non-performance-critical paths where O(n) traversal is acceptable

### Patch Changes

- [#3868](https://github.com/udecode/plate/pull/3868) by [@zbeyens](https://github.com/zbeyens) – export type NodeTextsOptions

## 40.3.1

### Patch Changes

- [#3837](https://github.com/udecode/plate/pull/3837) by [@yf-yang](https://github.com/yf-yang) – feat: Change Decorate's return type to DecoratedRange/TDecoratedRange

## 39.2.1

### Patch Changes

- [`a17b84f1aa09ac5bcc019823b5d0dfea581ada57`](https://github.com/udecode/plate/commit/a17b84f1aa09ac5bcc019823b5d0dfea581ada57) by [@zbeyens](https://github.com/zbeyens) – Add `withNewBatch` to history plugin

## 38.0.4

### Patch Changes

- [#3537](https://github.com/udecode/plate/pull/3537) by [@felixfeng33](https://github.com/felixfeng33) – Missing export

## 38.0.3

### Patch Changes

- [#3534](https://github.com/udecode/plate/pull/3534) by [@felixfeng33](https://github.com/felixfeng33) – Sync slate add `withMerging`

## 37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) – `createTEditor`:

  - Implement default methods for `slate-react` and `slate-history` in `createTEditor`
  - Add `noop` function to provide default implementations for unimplemented editor methods

  Types:

  - Merge `ReactEditor` and `HistoryEditor` interfaces into `TEditor`, removing `TReactEditor` and `THistoryEditor`
  - Remove `Value` generic type parameter from function signatures and type definitions
  - Replace `V extends Value` with `E extends TEditor` for improved type inference
  - Simplify `TEditor<V>` to `TEditor` in many places
  - Refactor element-related types, where `E extends TEditor` in all cases:
    - `EElement<V>` to `ElementOf<E>`
    - `EText<V>` to `TextOf<E>`
    - `ENode<V>` to `NodeOf<E>`
    - `EDescendant<V>` to `DescendantOf<E>`
    - `EAncestor<V>` to `AncestorOf<E>`
    - `EElementOrText<V>` to `ElementOrTextOf<E>`
  - Update `TNodeEntry` related types:
    - `ENodeEntry<V>` to `NodeEntryOf<E>`
    - `EElementEntry<V>` to `ElementEntryOf<E>`
    - `ETextEntry<V>` to `TextEntryOf<E>`
    - `EAncestorEntry<V>` to `AncestorEntryOf<E>`
    - `EDescendantEntry<V>` to `DescendantEntryOf<E>`
  - Remove unused types:
    - `EElementEntry<V>`
    - `ETextEntry<V>`
    - `EDescendantEntry<V>`

## 36.0.6

### Patch Changes

- [#3354](https://github.com/udecode/plate/pull/3354) by [@yf-yang](https://github.com/yf-yang) – feat: add option parameter to normalizeNode following slate#5295

## 32.0.1

### Patch Changes

- [#3164](https://github.com/udecode/plate/pull/3164) by [@felixfeng33](https://github.com/felixfeng33) – Add writeHistory

## 31.0.0

## 25.0.0

### Minor Changes

- [#2719](https://github.com/udecode/plate/pull/2719) by [@12joan](https://github.com/12joan) – Add `removeEmpty: boolean | QueryNodeOptions` option to insertNodes

## 24.3.6

### Patch Changes

- [#2671](https://github.com/udecode/plate/pull/2671) by [@zbeyens](https://github.com/zbeyens) – Fix lodash import

## 24.3.5

### Patch Changes

- [#2669](https://github.com/udecode/plate/pull/2669) by [@zbeyens](https://github.com/zbeyens) – Replace lodash by lodash-es

## 24.3.2

### Patch Changes

- [`3f17d0bb`](https://github.com/udecode/plate/commit/3f17d0bbcd9e31437d1f1325c8458cac2db0e3da) by [@zbeyens](https://github.com/zbeyens) – fix build

## 24.3.1

### Patch Changes

- [#2659](https://github.com/udecode/plate/pull/2659) by [@zbeyens](https://github.com/zbeyens) – fix build (types)

## 24.3.0

## 23.7.4

### Patch Changes

- [#2622](https://github.com/udecode/plate/pull/2622) by [@12joan](https://github.com/12joan) – Ensure the return type of `unhangRange` matches the argument type

## 22.0.2

### Patch Changes

- [`f44dbd3`](https://github.com/udecode/plate/commit/f44dbd3f322a828753da31ec28576587e63ea047) by [@zbeyens](https://github.com/zbeyens) – v22

## 21.4.1

## 21.3.0

### Minor Changes

- [#2410](https://github.com/udecode/plate/pull/2410) by [@zbeyens](https://github.com/zbeyens) –
  - ✨ `addRangeMarks`: Add marks to each node of a range.
  - ✨ `unhangCharacterRange`: Unhang the range of length 1 so both edges are in the same text node.

## 21.0.0

### Major Changes

- [#2369](https://github.com/udecode/plate/pull/2369) by [@zbeyens](https://github.com/zbeyens) – Support `slate@0.94.0`, `slate-react@0.94.0` and `slate-history@0.93.0` by upgrading the peer dependencies.

## 19.8.0

### Minor Changes

- [#2289](https://github.com/udecode/plate/pull/2289) by [@zbeyens](https://github.com/zbeyens) –
  - `getNodeEntry`: now returns `undefined` instead of throwing if not found.
