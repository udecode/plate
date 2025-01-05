/* eslint-disable @typescript-eslint/unbound-method */
import { bindFirst } from '@udecode/utils';
import {
  apply,
  createEditor,
  getDirtyPaths,
  hasPath,
  insertSoftBreak,
  normalizeNode,
  removeMark,
  setNormalizing,
  shouldMergeNodesRemovePrevNode,
  shouldNormalize,
} from 'slate';

import type { TEditor, Value } from './interfaces/editor/TEditor';

import { isCollapsed, isExpanded } from './interfaces';
import { blurEditor } from './internal/dom-editor/blurEditor';
import { deselectEditor } from './internal/dom-editor/deselectEditor';
import { findEditorDocumentOrShadowRoot } from './internal/dom-editor/findEditorDocumentOrShadowRoot';
import { findEventRange } from './internal/dom-editor/findEventRange';
import { findNodeKey } from './internal/dom-editor/findNodeKey';
import { findPath } from './internal/dom-editor/findPath';
import { focusEditor } from './internal/dom-editor/focusEditor';
import { getEditorWindow } from './internal/dom-editor/getEditorWindow';
import { hasEditorDOMNode } from './internal/dom-editor/hasEditorDOMNode';
import { hasEditorEditableTarget } from './internal/dom-editor/hasEditorEditableTarget';
import { hasEditorRange } from './internal/dom-editor/hasEditorRange';
import { hasEditorSelectableTarget } from './internal/dom-editor/hasEditorSelectableTarget';
import { hasEditorTarget } from './internal/dom-editor/hasEditorTarget';
import { isComposing } from './internal/dom-editor/isComposing';
import { isEditorFocused } from './internal/dom-editor/isEditorFocused';
import { isEditorReadOnly } from './internal/dom-editor/isEditorReadOnly';
import { isTargetInsideNonReadonlyVoid } from './internal/dom-editor/isTargetInsideNonReadonlyVoid';
import { toDOMNode } from './internal/dom-editor/toDOMNode';
import { toDOMPoint } from './internal/dom-editor/toDOMPoint';
import { toDOMRange } from './internal/dom-editor/toDOMRange';
import { toSlateNode } from './internal/dom-editor/toSlateNode';
import { toSlatePoint } from './internal/dom-editor/toSlatePoint';
import { toSlateRange } from './internal/dom-editor/toSlateRange';
import { addMark } from './internal/editor/addMark';
import { createPathRef } from './internal/editor/createPathRef';
import { createPointRef } from './internal/editor/createPointRef';
import { createRangeRef } from './internal/editor/createRangeRef';
import { deleteBackward } from './internal/editor/deleteBackward';
import { deleteForward } from './internal/editor/deleteForward';
import { deleteFragment } from './internal/editor/deleteFragment';
import { getAboveNode } from './internal/editor/getAboveNode';
import { getEdgePoints } from './internal/editor/getEdgePoints';
import { getEditorString } from './internal/editor/getEditorString';
import { getEndPoint } from './internal/editor/getEndPoint';
import { getFirstNode } from './internal/editor/getFirstNode';
import { getFragment } from './internal/editor/getFragment';
import { getLastNode } from './internal/editor/getLastNode';
import { getLeafNode } from './internal/editor/getLeafNode';
import { getLevels } from './internal/editor/getLevels';
import { getMarks } from './internal/editor/getMarks';
import { getNextNode } from './internal/editor/getNextNode';
import { getNodeEntries } from './internal/editor/getNodeEntries';
import { getNodeEntry } from './internal/editor/getNodeEntry';
import { getParentNode } from './internal/editor/getParentNode';
import { getPath } from './internal/editor/getPath';
import { getPathRefs } from './internal/editor/getPathRefs';
import { getPoint } from './internal/editor/getPoint';
import { getPointAfter } from './internal/editor/getPointAfter';
import { getPointBefore } from './internal/editor/getPointBefore';
import { getPointRefs } from './internal/editor/getPointRefs';
import { getPositions } from './internal/editor/getPositions';
import { getPreviousNode } from './internal/editor/getPreviousNode';
import { getRange } from './internal/editor/getRange';
import { getRangeRefs } from './internal/editor/getRangeRefs';
import { getStartPoint } from './internal/editor/getStartPoint';
import { getVoidNode } from './internal/editor/getVoidNode';
import { hasBlocks } from './internal/editor/hasBlocks';
import { hasInlines } from './internal/editor/hasInlines';
import { hasMark } from './internal/editor/hasMark';
import { hasTexts } from './internal/editor/hasTexts';
import { insertBreak } from './internal/editor/insertBreak';
import { insertNode } from './internal/editor/insertNode';
import { isAt } from './internal/editor/isAt';
import { isBlock } from './internal/editor/isBlock';
import { isEdgePoint } from './internal/editor/isEdgePoint';
import { isEditorNormalizing } from './internal/editor/isEditorNormalizing';
import { isElementReadOnly } from './internal/editor/isElementReadOnly';
import { isEmpty } from './internal/editor/isEmpty';
import { isEndPoint } from './internal/editor/isEndPoint';
import { isStartPoint } from './internal/editor/isStartPoint';
import { isText } from './internal/editor/isText';
import { normalizeEditor } from './internal/editor/normalizeEditor';
import { some } from './internal/editor/some';
import { unhangRange } from './internal/editor/unhangRange';
import { withoutNormalizing } from './internal/editor/withoutNormalizing';
import { findDescendant } from './internal/queries/findDescendant';
import { findNode } from './internal/queries/findNode';
import { getBlockAbove } from './internal/queries/getBlockAbove';
import { getBlocks } from './internal/queries/getBlocks';
import { getEdgeBlocksAbove } from './internal/queries/getEdgeBlocksAbove';
import { getHighestBlock } from './internal/queries/getHighestBlock';
import { getLastNodeByLevel } from './internal/queries/getLastNodeByLevel';
import { getMark } from './internal/queries/getMark';
import { getNodesRange } from './internal/queries/getNodesRange';
import { isEditorEnd } from './internal/queries/isEditorEnd';
import { collapseSelection } from './internal/transforms/collapseSelection';
import { deleteText } from './internal/transforms/deleteText';
import { deselect } from './internal/transforms/deselect';
import { insertFragment } from './internal/transforms/insertFragment';
import { insertNodes } from './internal/transforms/insertNodes';
import { insertText } from './internal/transforms/insertText';
import { liftNodes } from './internal/transforms/liftNodes';
import { mergeNodes } from './internal/transforms/mergeNodes';
import { moveNodes } from './internal/transforms/moveNodes';
import { moveSelection } from './internal/transforms/moveSelection';
import { removeNodes } from './internal/transforms/removeNodes';
import { select } from './internal/transforms/select';
import { setNodes } from './internal/transforms/setNodes';
import { setPoint } from './internal/transforms/setPoint';
import { setSelection } from './internal/transforms/setSelection';
import { splitNodes } from './internal/transforms/splitNodes';
import { unsetNodes } from './internal/transforms/unsetNodes';
import { unwrapNodes } from './internal/transforms/unwrapNodes';
import { wrapNodes } from './internal/transforms/wrapNodes';
import { HistoryEditor } from './slate-history';
import { toggleMark } from './transforms';
import {
  assignLegacyApi,
  assignLegacyTransforms,
} from './utils/assignLegacyTransforms';

const noop: {
  (name: string): () => void;
  <T>(name: string, returnValue: T): () => T;
} =
  <T>(name: string, returnValue?: T) =>
  () => {
    console.warn(
      `[OVERRIDE_MISSING] The method editor.${name}() has not been implemented or overridden. ` +
        `This may cause unexpected behavior. Please ensure that all required editor methods are properly defined.`
    );

    return returnValue;
  };

export const createTEditor = <V extends Value>({
  children,
  selection,
}: {
  children?: V;
  selection?: TEditor['selection'];
} = {}) => {
  const editor = createEditor() as any as TEditor;

  if (children) {
    editor.children = children;
  }
  if (selection) {
    editor.selection = selection;
  }

  editor.api = {
    above: bindFirst(getAboveNode, editor) as any,
    after: bindFirst(getPointAfter, editor),
    before: bindFirst(getPointBefore, editor),
    block: bindFirst(getBlockAbove, editor) as any,
    blocks: bindFirst(getBlocks, editor) as any,
    descendant: bindFirst(findDescendant, editor) as any,
    edgeBlocks: bindFirst(getEdgeBlocksAbove, editor) as any,
    edges: bindFirst(getEdgePoints, editor),
    elementReadOnly: bindFirst(isElementReadOnly, editor),
    end: bindFirst(getEndPoint, editor),
    find: bindFirst(findNode, editor) as any,
    findDocumentOrShadowRoot: bindFirst(findEditorDocumentOrShadowRoot, editor),
    findEventRange: bindFirst(findEventRange, editor),
    findKey: bindFirst(findNodeKey, editor),
    findPath: bindFirst(findPath, editor),
    first: bindFirst(getFirstNode, editor) as any,
    fragment: bindFirst(getFragment, editor) as any,
    getDirtyPaths: bindFirst(getDirtyPaths, editor as any),
    getFragment: bindFirst(getFragment, editor) as any,
    getWindow: bindFirst(getEditorWindow, editor),
    hasBlocks: bindFirst(hasBlocks, editor),
    hasDOMNode: bindFirst(hasEditorDOMNode, editor),
    hasEditableTarget: bindFirst(hasEditorEditableTarget, editor) as any,
    hasInlines: bindFirst(hasInlines, editor),
    hasMark: bindFirst(hasMark, editor),
    hasPath: bindFirst(hasPath, editor as any),
    hasRange: bindFirst(hasEditorRange, editor),
    hasSelectableTarget: bindFirst(hasEditorSelectableTarget, editor) as any,
    hasTarget: bindFirst(hasEditorTarget, editor) as any,
    hasTexts: bindFirst(hasTexts, editor),
    highestBlock: bindFirst(getHighestBlock, editor) as any,
    isAt: bindFirst(isAt, editor),
    isBlock: bindFirst(isBlock, editor),
    isCollapsed: () => isCollapsed(editor.selection),
    isComposing: bindFirst(isComposing, editor),
    isEdge: bindFirst(isEdgePoint, editor),
    isEditorEnd: bindFirst(isEditorEnd, editor),
    isElementReadOnly: editor.isElementReadOnly,
    isEmpty: bindFirst(isEmpty, editor),
    isEnd: bindFirst(isEndPoint, editor),
    isExpanded: () => isExpanded(editor.selection),
    isFocused: bindFirst(isEditorFocused, editor),
    isInline: editor.isInline,
    isMerging: bindFirst(HistoryEditor.isMerging, editor as any) as any,
    isNormalizing: bindFirst(isEditorNormalizing, editor),
    isReadOnly: bindFirst(isEditorReadOnly, editor),
    isSaving: bindFirst(HistoryEditor.isSaving, editor as any) as any,
    isSelectable: editor.isSelectable,
    isSplittingOnce: bindFirst(HistoryEditor.isSplittingOnce, editor as any),
    isStart: bindFirst(isStartPoint, editor),
    isTargetInsideNonReadonlyVoid: bindFirst(
      isTargetInsideNonReadonlyVoid,
      editor
    ),
    isText: bindFirst(isText, editor),
    isVoid: editor.isVoid,
    last: bindFirst(getLastNode, editor) as any,
    lastByLevel: bindFirst(getLastNodeByLevel, editor) as any,
    leaf: bindFirst(getLeafNode, editor) as any,
    levels: bindFirst(getLevels, editor) as any,
    mark: bindFirst(getMark, editor),
    markableVoid: editor.markableVoid,
    marks: bindFirst(getMarks, editor),
    next: bindFirst(getNextNode, editor) as any,
    node: bindFirst(getNodeEntry, editor) as any,
    nodes: bindFirst(getNodeEntries, editor) as any,
    nodesRange: bindFirst(getNodesRange, editor),
    parent: bindFirst(getParentNode, editor) as any,
    path: bindFirst(getPath, editor),
    pathRef: bindFirst(createPathRef, editor),
    pathRefs: bindFirst(getPathRefs, editor),
    point: bindFirst(getPoint, editor),
    pointRef: bindFirst(createPointRef, editor),
    pointRefs: bindFirst(getPointRefs, editor),
    positions: bindFirst(getPositions, editor),
    previous: bindFirst(getPreviousNode, editor) as any,
    range: bindFirst(getRange, editor),
    rangeRef: bindFirst(createRangeRef, editor),
    rangeRefs: bindFirst(getRangeRefs, editor),
    setNormalizing: bindFirst(setNormalizing, editor as any),
    shouldMergeNodesRemovePrevNode: bindFirst(
      shouldMergeNodesRemovePrevNode,
      editor as any
    ),
    shouldNormalize: bindFirst(shouldNormalize, editor as any),
    some: bindFirst(some, editor),
    start: bindFirst(getStartPoint, editor),
    string: bindFirst(getEditorString, editor),
    toDOMNode: bindFirst(toDOMNode, editor),
    toDOMPoint: bindFirst(toDOMPoint, editor),
    toDOMRange: bindFirst(toDOMRange, editor),
    toSlateNode: bindFirst(toSlateNode, editor) as any,
    toSlatePoint: bindFirst(toSlatePoint, editor),
    toSlateRange: bindFirst(toSlateRange, editor),
    unhangRange: bindFirst(unhangRange, editor),
    void: bindFirst(getVoidNode, editor) as any,
    onChange: editor.onChange,
  };

  const transforms: TEditor<V>['transforms'] = {
    addMark: bindFirst(addMark, editor),
    apply: bindFirst(apply, editor as any),
    blur: bindFirst(blurEditor, editor),
    collapse: bindFirst(collapseSelection, editor),
    delete: bindFirst(deleteText, editor),
    deleteBackward: bindFirst(deleteBackward, editor),
    deleteForward: bindFirst(deleteForward, editor),
    deleteFragment: bindFirst(deleteFragment, editor),
    deselect: bindFirst(deselect, editor),
    deselectDOM: bindFirst(deselectEditor, editor),
    focus: bindFirst(focusEditor, editor),
    insertBreak: bindFirst(insertBreak, editor),
    insertData: noop('insertData'),
    insertFragment: bindFirst(insertFragment, editor),
    insertFragmentData: noop('insertFragmentData', false),
    insertNode: bindFirst(insertNode, editor),
    insertNodes: bindFirst(insertNodes, editor),
    insertSoftBreak: bindFirst(insertSoftBreak, editor as any),
    insertText: bindFirst(insertText, editor),
    insertTextData: noop('insertTextData', false),
    liftNodes: bindFirst(liftNodes, editor),
    mergeNodes: bindFirst(mergeNodes, editor),
    move: bindFirst(moveSelection, editor),
    moveNodes: bindFirst(moveNodes, editor),
    normalize: bindFirst(normalizeEditor, editor),
    normalizeNode: bindFirst(normalizeNode, editor as any),
    redo: noop('redo'),
    removeMark: bindFirst(removeMark, editor as any),
    removeNodes: bindFirst(removeNodes, editor),
    select: bindFirst(select, editor),
    setFragmentData: noop('setFragmentData'),
    setNodes: bindFirst(setNodes, editor),
    setPoint: bindFirst(setPoint, editor),
    setSelection: bindFirst(setSelection, editor),
    setSplittingOnce: bindFirst(HistoryEditor.setSplittingOnce, editor as any),
    splitNodes: bindFirst(splitNodes, editor),
    toggle: {
      mark: bindFirst(toggleMark, editor as any),
    },
    undo: noop('undo'),
    unsetNodes: bindFirst(unsetNodes, editor),
    unwrapNodes: bindFirst(unwrapNodes, editor),
    withMerging: bindFirst(HistoryEditor.withMerging, editor as any),
    withNewBatch: bindFirst(HistoryEditor.withNewBatch, editor as any),
    withoutMerging: bindFirst(HistoryEditor.withoutMerging, editor as any),
    withoutNormalizing: bindFirst(withoutNormalizing, editor as any),
    withoutSaving: bindFirst(HistoryEditor.withoutSaving, editor as any),
    wrapNodes: bindFirst(wrapNodes, editor),
    writeHistory: noop('writeHistory'),
  };

  editor.tf = transforms;
  editor.transforms = transforms;

  assignLegacyApi(editor, editor.api);
  assignLegacyTransforms(editor, transforms);

  editor.history = { redos: [], undos: [] };

  return editor as TEditor<V>;
};
