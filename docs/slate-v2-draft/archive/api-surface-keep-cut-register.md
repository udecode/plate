---
date: 2026-04-10
topic: slate-v2-api-surface-keep-cut-register
---

# Slate v2 API Surface Keep/Cut Register

> Archive only. API pruning reference. The live package/public truth is carried
> by [../replacement-family-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-family-ledger.md),
> [../release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md),
> and [../true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md).

## Purpose

Maintainer-facing keep/cut checklist for the exported runtime/value API surface
of the current `slate-v2` package matrix.

Use it when asking:

- which public APIs still matter to the new engine direction
- which exports look like drift or leaked implementation detail
- which questioned APIs should be kept vs hard-cut

Use it with:

- [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)
- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md)

## Why A New File

This does not fit cleanly in the existing docs:

- [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)
  is the technical north star, not a symbol-by-symbol review ledger.
- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
  is file-level, not API-level.
- [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md)
  justifies drift; it should not become an exhaustive symbol register.
- [live-shape-register.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/live-shape-register.md)
  tracks allowed non-canonical runtime shapes, not public API decisions.

## Scope

This register covers:

- exported runtime/value surface:
  - functions
  - namespace objects
  - components
  - hooks
  - runtime helpers
  - adapter objects
- exported type-only surface from the public package barrels and explicit
  `slate-browser` subpaths

This does not yet try to catalogue every internal or file-local type.
It tracks the public exported surface only.

## Decision Rule

- `[x]` keep
- `[ ]` cut candidate

Keep an export only if it still clearly serves one or more of the architecture
principles in [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md):

1. data-model-first
2. operation- and collaboration-friendly
3. transaction-first engine semantics
4. React-optimized runtime
5. explicit adapters later

Unchecked does not mean “delete immediately”.
It means the default direction should be cut unless a stronger owner argument
appears.

## Recent Applied Cuts

- [x] `slate.isObject`
- [x] `slate.Operation.inverse`
- [x] `slate-history.HISTORY`
- [x] `slate-history.MERGING`
- [x] `slate-history.SAVING`
- [x] `slate-history.SPLITTING_ONCE`

## Package Matrix

### `slate`

Top-level runtime exports:

- [x] `createEditor`
- [x] `Editor`
- [x] `Element`
- [x] `Location`
- [x] `Node`
- [x] `Operation`
- [x] `Path`
- [x] `Point`
- [x] `Range`
- [x] `Scrubber`
- [x] `Span`
- [x] `Text`
- [x] `GeneralTransforms`
- [x] `NodeTransforms`
- [x] `SelectionTransforms`
- [x] `TextTransforms`
- [x] `Transforms`
- [x] `collapse`
- [x] `delete`
- [x] `deselect`
- [x] `insertFragment`
- [x] `insertNodes`
- [x] `insertText`
- [x] `liftNodes`
- [x] `mergeNodes`
- [x] `move`
- [x] `moveNodes`
- [x] `removeNodes`
- [x] `removeText`
- [x] `select`
- [x] `setNodes`
- [x] `setPoint`
- [x] `setSelection`
- [x] `splitNodes`
- [x] `unsetNodes`
- [x] `unwrapNodes`
- [x] `wrapNodes`

`Location.*`

- [x] `Location.isLocation`
- [x] `Location.isPath`
- [x] `Location.isPoint`
- [x] `Location.isRange`
- [x] `Location.isSpan`

`Span.*`

- [x] `Span.isSpan`

`Path.*`

- [x] `Path.ancestors`
- [x] `Path.common`
- [x] `Path.compare`
- [x] `Path.endsAfter`
- [x] `Path.endsAt`
- [x] `Path.endsBefore`
- [x] `Path.equals`
- [x] `Path.hasPrevious`
- [x] `Path.isAncestor`
- [x] `Path.isAfter`
- [x] `Path.isBefore`
- [x] `Path.isChild`
- [x] `Path.isCommon`
- [x] `Path.isDescendant`
- [x] `Path.isParent`
- [x] `Path.isPath`
- [x] `Path.isSibling`
- [x] `Path.levels`
- [x] `Path.next`
- [x] `Path.operationCanTransformPath`
- [x] `Path.parent`
- [x] `Path.previous`
- [x] `Path.relative`
- [x] `Path.transform`

`Point.*`

- [x] `Point.compare`
- [x] `Point.equals`
- [x] `Point.isAfter`
- [x] `Point.isBefore`
- [x] `Point.isPoint`
- [x] `Point.transform`

`Range.*`

- [x] `Range.edges`
- [x] `Range.end`
- [x] `Range.equals`
- [x] `Range.includes`
- [x] `Range.surrounds`
- [x] `Range.intersection`
- [x] `Range.isBackward`
- [x] `Range.isCollapsed`
- [x] `Range.isExpanded`
- [x] `Range.isForward`
- [x] `Range.isRange`
- [x] `Range.points`
- [x] `Range.start`
- [x] `Range.transform`

`Node.*`

- [x] `Node.ancestor`
- [x] `Node.ancestors`
- [x] `Node.child`
- [x] `Node.children`
- [x] `Node.common`
- [x] `Node.descendant`
- [x] `Node.descendants`
- [x] `Node.elements`
- [x] `Node.extractProps`
- [x] `Node.first`
- [x] `Node.fragment`
- [x] `Node.get`
- [x] `Node.getIf`
- [x] `Node.has`
- [x] `Node.isAncestor`
- [x] `Node.isEditor`
- [x] `Node.isElement`
- [x] `Node.isNode`
- [x] `Node.isNodeList`
- [x] `Node.isText`
- [x] `Node.last`
- [x] `Node.leaf`
- [x] `Node.levels`
- [x] `Node.matches`
- [x] `Node.parent`
- [x] `Node.nodes`
- [x] `Node.string`
- [x] `Node.texts`

`Element.*`

- [x] `Element.isAncestor`
- [x] `Element.isElement`
- [x] `Element.isElementList`
- [x] `Element.isElementProps`
- [x] `Element.isElementType`
- [x] `Element.matches`

`Text.*`

- [x] `Text.equals`
- [x] `Text.decorations`
- [x] `Text.isText`
- [x] `Text.isTextList`
- [x] `Text.isTextProps`
- [x] `Text.matches`

`Operation.*`

- [x] `Operation.isNodeOperation`
- [x] `Operation.isOperation`
- [x] `Operation.isOperationList`
- [x] `Operation.isSelectionOperation`
- [x] `Operation.isTextOperation`

`Scrubber.*`

- [x] `Scrubber.setScrubber`
- [x] `Scrubber.stringify`

`Editor.*`

- [x] `Editor.isEditor`
- [x] `Editor.getChildren`
- [x] `Editor.getDirtyPaths`
- [x] `Editor.above`
- [x] `Editor.elementReadOnly`
- [x] `Editor.isInline`
- [x] `Editor.isVoid`
- [x] `Editor.markableVoid`
- [x] `Editor.normalizeNode`
- [x] `Editor.shouldNormalize`
- [x] `Editor.getSnapshot`
- [x] `Editor.deleteBackward`
- [x] `Editor.deleteForward`
- [x] `Editor.deleteFragment`
- [x] `Editor.edges`
- [x] `Editor.end`
- [x] `Editor.first`
- [x] `Editor.fragment`
- [x] `Editor.hasBlocks`
- [x] `Editor.hasInlines`
- [x] `Editor.hasPath`
- [x] `Editor.hasTexts`
- [x] `Editor.isBlock`
- [x] `Editor.isEdge`
- [x] `Editor.isEmpty`
- [x] `Editor.isElementReadOnly`
- [x] `Editor.isEnd`
- [x] `Editor.isNormalizing`
- [x] `Editor.isSelectable`
- [x] `Editor.isStart`
- [x] `Editor.last`
- [x] `Editor.leaf`
- [x] `Editor.levels`
- [x] `Editor.next`
- [x] `Editor.node`
- [x] `Editor.nodes`
- [x] `Editor.normalize`
- [x] `Editor.parent`
- [x] `Editor.path`
- [x] `Editor.point`
- [x] `Editor.positions`
- [x] `Editor.previous`
- [x] `Editor.range`
- [x] `Editor.pathRef`
- [x] `Editor.pathRefs`
- [x] `Editor.pointRef`
- [x] `Editor.pointRefs`
- [x] `Editor.start`
- [x] `Editor.string`
- [x] `Editor.after`
- [x] `Editor.before`
- [x] `Editor.getFragment`
- [x] `Editor.insertBreak`
- [x] `Editor.insertFragment`
- [x] `Editor.insertNodes`
- [x] `Editor.insertSoftBreak`
- [x] `Editor.insertNode`
- [x] `Editor.insertText`
- [x] `Editor.marks`
- [x] `Editor.projectRange`
- [x] `Editor.addMark`
- [x] `Editor.removeMark`
- [x] `Editor.rangeRef`
- [x] `Editor.rangeRefs`
- [x] `Editor.reset`
- [x] `Editor.replace`
- [x] `Editor.setChildren`
- [x] `Editor.setNormalizing`
- [x] `Editor.subscribe`
- [x] `Editor.unhangRange`
- [x] `Editor.void`
- [x] `Editor.shouldMergeNodesRemovePrevNode`
- [x] `Editor.withoutNormalizing`
- [x] `Editor.withTransaction`

`GeneralTransforms.*`

- [x] `GeneralTransforms.applyBatch`
- [x] `GeneralTransforms.transform`

`NodeTransforms.*`

- [x] `NodeTransforms.insertFragment`
- [x] `NodeTransforms.insertNodes`
- [x] `NodeTransforms.liftNodes`
- [x] `NodeTransforms.mergeNodes`
- [x] `NodeTransforms.moveNodes`
- [x] `NodeTransforms.removeNodes`
- [x] `NodeTransforms.setNodes`
- [x] `NodeTransforms.splitNodes`
- [x] `NodeTransforms.unwrapNodes`
- [x] `NodeTransforms.wrapNodes`
- [x] `NodeTransforms.unsetNodes`

`SelectionTransforms.*`

- [x] `SelectionTransforms.collapse`
- [x] `SelectionTransforms.deselect`
- [x] `SelectionTransforms.move`
- [x] `SelectionTransforms.select`
- [x] `SelectionTransforms.setPoint`
- [x] `SelectionTransforms.setSelection`

`TextTransforms.*`

- [x] `TextTransforms.delete`
- [x] `TextTransforms.insertText`
- [x] `TextTransforms.removeText`

### `slate-history`

Top-level runtime exports:

- [x] `History`
- [x] `HistoryEditor`
- [x] `withHistory`

`History.*`

- [x] `History.isHistory`

`HistoryEditor.*`

- [x] `HistoryEditor.isHistoryEditor`
- [x] `HistoryEditor.isSaving`
- [x] `HistoryEditor.isMerging`
- [x] `HistoryEditor.isSplittingOnce`
- [x] `HistoryEditor.setSplittingOnce`
- [x] `HistoryEditor.undo`
- [x] `HistoryEditor.redo`
- [x] `HistoryEditor.reset`
- [x] `HistoryEditor.withMerging`
- [x] `HistoryEditor.withNewBatch`
- [x] `HistoryEditor.withoutMerging`
- [x] `HistoryEditor.withoutSaving`

### `slate-dom`

Top-level runtime exports:

- [x] `DOMBridge`
- [x] `ClipboardBridge`

`DOMBridge.*`

- [x] `DOMBridge.getRoot`
- [x] `DOMBridge.mount`
- [x] `DOMBridge.unmount`
- [x] `DOMBridge.bindNode`
- [x] `DOMBridge.unbindNode`
- [x] `DOMBridge.hasDOMNode`
- [x] `DOMBridge.findPath`
- [x] `DOMBridge.toDOMNode`
- [x] `DOMBridge.toSlateNode`
- [x] `DOMBridge.toSlatePoint`
- [x] `DOMBridge.toSlateRange`
- [x] `DOMBridge.toDOMPoint`
- [x] `DOMBridge.toDOMRange`

`ClipboardBridge.*`

- [x] `ClipboardBridge.setFragmentData`
- [x] `ClipboardBridge.insertFragmentData`
- [x] `ClipboardBridge.insertTextData`
- [x] `ClipboardBridge.insertData`

### `slate-react`

Top-level runtime exports:

- [x] `DefaultElement`
- [x] `DefaultLeaf`
- [x] `DefaultPlaceholder`
- [x] `DefaultText`
- [x] `Editable`
- [x] `EditableBlocks`
- [x] `EditableElement`
- [x] `EditableText`
- [x] `EditableTextBlocks`
- [x] `Slate`
- [x] `SlateElement`
- [x] `SlateLeaf`
- [x] `SlatePlaceholder`
- [x] `SlateSpacer`
- [x] `SlateText`
- [x] `TextString`
- [x] `VoidElement`
- [x] `ZeroWidthString`
- [x] `defaultScrollSelectionIntoView`
- [x] `createSlateProjectionStore`
- [x] `useComposing`
- [x] `useEditor`
- [x] `useElement`
- [x] `useElementIf`
- [x] `useFocused`
- [x] `useReadOnly`
- [x] `useSelected`
- [x] `useSlate`
- [x] `useSlateNodeRef`
- [x] `useSlateProjections`
- [x] `useSlateRangeRefProjectionStore`
- [x] `useSlateReplace`
- [x] `useSlateRootRef`
- [x] `useSlateSelection`
- [x] `useSlateSelector`
- [x] `useSlateStatic`
- [x] `useSlateWithV`
- [x] `ReactEditor`
- [x] `withReact`

`ReactEditor.*`

- [x] `ReactEditor.findDocumentOrShadowRoot`
- [x] `ReactEditor.blur`
- [x] `ReactEditor.deselect`
- [x] `ReactEditor.findKey`
- [x] `ReactEditor.findPath`
- [x] `ReactEditor.focus`
- [x] `ReactEditor.getWindow`
- [x] `ReactEditor.hasDOMNode`
- [x] `ReactEditor.hasEditableTarget`
- [x] `ReactEditor.hasSelectableTarget`
- [x] `ReactEditor.hasTarget`
- [x] `ReactEditor.hasRange`
- [x] `ReactEditor.findEventRange`
- [x] `ReactEditor.insertData`
- [x] `ReactEditor.insertFragmentData`
- [x] `ReactEditor.insertTextData`
- [x] `ReactEditor.isComposing`
- [x] `ReactEditor.isFocused`
- [x] `ReactEditor.isReadOnly`
- [x] `ReactEditor.isTargetInsideNonReadonlyVoid`
- [x] `ReactEditor.setFragmentData`
- [x] `ReactEditor.toDOMNode`
- [x] `ReactEditor.toDOMPoint`
- [x] `ReactEditor.toDOMRange`
- [x] `ReactEditor.toSlateNode`
- [x] `ReactEditor.toSlatePoint`
- [x] `ReactEditor.toSlateRange`

### `slate-hyperscript`

Top-level runtime exports:

- [x] `createEditor`
- [x] `createText`
- [x] `createHyperscript`
- [x] `jsx`

### `slate-browser/core`

Top-level runtime exports:

- [x] `isCollapsed`
- [x] `serializePoint`
- [x] `serializeRange`

### `slate-browser/browser`

Top-level runtime exports:

- [x] `inspectZeroWidthPlaceholder`
- [x] `takeDOMSelectionSnapshot`
- [x] `takeEditorSelectionSnapshot`

### `slate-browser/playwright`

Top-level runtime exports:

- [x] `SlateBrowserEditorHarness`
- [x] `openExample`
- [x] `openExampleWithOptions`
- [x] `takeDOMSelectionSnapshot`
- [x] `takeSelectionSnapshot`
- [x] `withExclusiveClipboardAccess`

## Type-Only Surface

### `slate` type exports

- [x] `Ancestor`
- [x] `DecoratedRange`
- [x] `DeleteOptions`
- [x] `Descendant`
- [x] `EditorMarks`
- [x] `EditorSnapshot`
- [x] `ElementEntry`
- [x] `InsertFragmentOperation`
- [x] `InsertFragmentOptions`
- [x] `InsertNodeOperation`
- [x] `InsertNodesOptions`
- [x] `InsertTextOptions`
- [x] `LeafPosition`
- [x] `LevelsOptions`
- [x] `LiftNodesOptions`
- [x] `MergeNodeOperation`
- [x] `MergeNodesOptions`
- [x] `MoveNodeOperation`
- [x] `MoveNodesOptions`
- [x] `MoveOptions`
- [x] `NodeEntry`
- [x] `NodeMatch`
- [x] `NodeOperation`
- [x] `NodeProps`
- [x] `NodesOptions`
- [x] `PathQueryOptions`
- [x] `PathRef`
- [x] `PathRefAffinity`
- [x] `PathRefOptions`
- [x] `PointEntry`
- [x] `PointOptions`
- [x] `PointQueryOptions`
- [x] `PointRef`
- [x] `PointRefAffinity`
- [x] `PointRefOptions`
- [x] `PositionsOptions`
- [x] `ProjectedRangeSegment`
- [x] `RangeRef`
- [x] `RangeRefAffinity`
- [x] `RangeRefOptions`
- [x] `RemoveNodeOperation`
- [x] `RemoveNodesOptions`
- [x] `RemoveTextOperation`
- [x] `RemoveTextOptions`
- [x] `RuntimeId`
- [x] `SelectionOperation`
- [x] `SetNodeOperation`
- [x] `SetNodesOptions`
- [x] `SetSelectionOperation`
- [x] `SiblingEntryOptions`
- [x] `SlateEditor`
- [x] `SnapshotIndex`
- [x] `SnapshotInput`
- [x] `SnapshotListener`
- [x] `SplitNodeOperation`
- [x] `SplitNodesOptions`
- [x] `StringOptions`
- [x] `TextOperation`
- [x] `UnhangRangeOptions`
- [x] `UnsetNodesOptions`
- [x] `UnwrapNodesOptions`
- [x] `WrapNodesOptions`

### `slate-dom` type exports

- [x] `BoundDOMPoint`
- [x] `BoundPath`
- [x] `ClipboardBridgeConfig`
- [x] `ClipboardBridgeInterface`
- [x] `ClipboardDataTransfer`
- [x] `DOMBridgeInterface`
- [x] `DOMEditorBridge`
- [x] `DOMPoint`
- [x] `DOMRangeLike`
- [x] `FindPathOptions`
- [x] `SlateDOMNode`
- [x] `ToSlatePointOptions`

### `slate-history` type exports

- [x] `HistoryBatch`
- [x] `HistoryEditorInterface`

### `slate-react` type exports

- [x] `EditableBlocksProps`
- [x] `EditableProps`
- [x] `EditableTextBlocksProps`
- [x] `EditableTextLeafProps`
- [x] `EditableTextRenderPlaceholderProps`
- [x] `EditableTextRenderTextProps`
- [x] `EditableTextSegment`
- [x] `Key`
- [x] `RenderElementProps`
- [x] `RenderLeafProps`
- [x] `RenderPlaceholderProps`
- [x] `RenderTextProps`
- [x] `SlateProjection`
- [x] `SlateProjectionSlice`
- [x] `SlateProjectionSource`
- [x] `SlateProjectionStore`
- [x] `SlateProjectionStoreSnapshot`
- [x] `SlateRangeProjection`
- [x] `SlateRangeRefProjection`

### `slate-hyperscript` type exports

- [x] `HyperscriptCreators`
- [x] `HyperscriptShorthands`

### `slate-browser/core` type exports

- [x] `Path`
- [x] `Point`
- [x] `Range`

### `slate-browser/browser` type exports

- [x] `DOMSelectionSnapshot`
- [x] `EditorSelectionPoint`
- [x] `EditorSelectionSnapshot`
- [x] `PlaceholderShape`

### `slate-browser/playwright` type exports

- [x] `ClipboardPayloadSnapshot`
- [x] `DOMSelectionSnapshot`
- [x] `DOMSelectionSnapshotExpectation`
- [x] `EditorSnapshot`
- [x] `EditorSurfaceOptions`
- [x] `HtmlNormalizationOptions`
- [x] `OffsetExpectation`
- [x] `OpenExampleOptions`
- [x] `RangeRefAffinity`
- [x] `ReadyOptions`
- [x] `SelectionBookmark`
- [x] `SelectionCaptureOptions`
- [x] `SelectionPoint`
- [x] `SelectionRectSnapshot`
- [x] `SelectionSnapshot`
- [x] `SelectionSnapshotExpectation`
- [x] `SlateBrowserEditorHarness`

## Current Read

Everything else in this current runtime + type-only pass still looks relevant
enough to the package split and architecture contract to keep.
