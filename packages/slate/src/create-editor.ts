import { bindFirst } from '@udecode/utils';
import {
  apply,
  createEditor as createSlateEditor,
  getDirtyPaths,
  hasPath,
  insertSoftBreak,
  normalizeNode,
  setNormalizing,
  shouldMergeNodesRemovePrevNode,
  shouldNormalize,
} from 'slate';

import type { Editor, Value } from './interfaces/editor/editor-type';

import {
  type EditorApi,
  type LegacyEditorMethods,
  RangeApi,
} from './interfaces';
import { blur } from './internal/dom-editor/blur';
import { deselectDOM } from './internal/dom-editor/deselectDOM';
import { findDocumentOrShadowRoot } from './internal/dom-editor/findDocumentOrShadowRoot';
import { findEventRange } from './internal/dom-editor/findEventRange';
import { findKey } from './internal/dom-editor/findKey';
import { findPath } from './internal/dom-editor/findPath';
import { focus } from './internal/dom-editor/focus';
import { getWindow } from './internal/dom-editor/getWindow';
import { hasDOMNode } from './internal/dom-editor/hasDOMNode';
import { hasEditableTarget } from './internal/dom-editor/hasEditableTarget';
import { hasRange } from './internal/dom-editor/hasRange';
import { hasSelectableTarget } from './internal/dom-editor/hasSelectableTarget';
import { hasTarget } from './internal/dom-editor/hasTarget';
import { isComposing } from './internal/dom-editor/isComposing';
import { isFocused } from './internal/dom-editor/isFocused';
import { isReadOnly } from './internal/dom-editor/isReadOnly';
import { isTargetInsideNonReadonlyVoid } from './internal/dom-editor/isTargetInsideNonReadonlyVoid';
import { toDOMNode } from './internal/dom-editor/toDOMNode';
import { toDOMPoint } from './internal/dom-editor/toDOMPoint';
import { toDOMRange } from './internal/dom-editor/toDOMRange';
import { toSlateNode } from './internal/dom-editor/toSlateNode';
import { toSlatePoint } from './internal/dom-editor/toSlatePoint';
import { toSlateRange } from './internal/dom-editor/toSlateRange';
import { edgeBlocks } from './internal/editor-extension/edge-blocks';
import { block } from './internal/editor-extension/editor-block';
import { blocks } from './internal/editor-extension/editor-blocks';
import { descendant } from './internal/editor-extension/editor-descendant';
import { mark } from './internal/editor-extension/editor-mark';
import { hasMark } from './internal/editor-extension/hasMark';
import { isSelected } from './internal/editor-extension/is-selected';
import { isAt } from './internal/editor-extension/isAt';
import { isEditorEnd } from './internal/editor-extension/isEditorEnd';
import { isText } from './internal/editor-extension/isText';
import { nodesRange } from './internal/editor-extension/nodes-range';
import { prop } from './internal/editor-extension/prop';
import { scrollIntoView } from './internal/editor-extension/scrollIntoView';
import { some } from './internal/editor-extension/some';
import { above } from './internal/editor/above';
import { addMark } from './internal/editor/addMark';
import { createPathRef } from './internal/editor/createPathRef';
import { createPointRef } from './internal/editor/createPointRef';
import { createRangeRef } from './internal/editor/createRangeRef';
import { deleteBackward } from './internal/editor/deleteBackward';
import { deleteForward } from './internal/editor/deleteForward';
import { deleteFragment } from './internal/editor/deleteFragment';
import { node } from './internal/editor/editor-node';
import { path } from './internal/editor/editor-path';
import { getEdgePoints } from './internal/editor/getEdgePoints';
import { getEditorString } from './internal/editor/getEditorString';
import { getEndPoint } from './internal/editor/getEndPoint';
import { getFirstNode } from './internal/editor/getFirstNode';
import { getFragment } from './internal/editor/getFragment';
import { getLeafNode } from './internal/editor/getLeafNode';
import { getLevels } from './internal/editor/getLevels';
import { getMarks } from './internal/editor/getMarks';
import { getPathRefs } from './internal/editor/getPathRefs';
import { getPoint } from './internal/editor/getPoint';
import { getPointAfter } from './internal/editor/getPointAfter';
import { getPointBefore } from './internal/editor/getPointBefore';
import { getPointRefs } from './internal/editor/getPointRefs';
import { getPositions } from './internal/editor/getPositions';
import { getRangeRefs } from './internal/editor/getRangeRefs';
import { getStartPoint } from './internal/editor/getStartPoint';
import { getVoidNode } from './internal/editor/getVoidNode';
import { hasBlocks } from './internal/editor/hasBlocks';
import { hasInlines } from './internal/editor/hasInlines';
import { hasTexts } from './internal/editor/hasTexts';
import { insertBreak } from './internal/editor/insertBreak';
import { insertNode } from './internal/editor/insertNode';
import { isBlock } from './internal/editor/isBlock';
import { isEdgePoint } from './internal/editor/isEdgePoint';
import { isEditorNormalizing } from './internal/editor/isEditorNormalizing';
import { isElementReadOnly } from './internal/editor/isElementReadOnly';
import { isEmpty } from './internal/editor/isEmpty';
import { isEndPoint } from './internal/editor/isEndPoint';
import { isStartPoint } from './internal/editor/isStartPoint';
import { last } from './internal/editor/last';
import { next } from './internal/editor/next';
import { nodes } from './internal/editor/nodes';
import { normalizeEditor } from './internal/editor/normalizeEditor';
import { parent } from './internal/editor/parent';
import { previous } from './internal/editor/previous';
import { range } from './internal/editor/range';
import { removeEditorMark } from './internal/editor/removeEditorMark';
import { unhangRange } from './internal/editor/unhangRange';
import { withoutNormalizing } from './internal/editor/withoutNormalizing';
import { addMarks } from './internal/transforms-extension/addMarks';
import { duplicateNodes } from './internal/transforms-extension/duplicateNodes';
import { removeMarks } from './internal/transforms-extension/removeMarks';
import { replaceNodes } from './internal/transforms-extension/replaceNodes';
import { reset } from './internal/transforms-extension/reset';
import { toggleBlock } from './internal/transforms-extension/toggleBlock';
import { toggleMark } from './internal/transforms-extension/toggleMark';
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
import { HistoryApi } from './slate-history/history';
import { syncLegacyMethods } from './utils/assignLegacyTransforms';

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

export const createEditor = <V extends Value>({
  children,
  selection,
}: {
  children?: V;
  selection?: Editor['selection'];
} = {}) => {
  const editor = createSlateEditor() as any as Editor & LegacyEditorMethods;

  if (children) {
    editor.children = children;
  }
  if (selection) {
    editor.selection = selection;
  }

  Object.assign(editor, {
    apply: bindFirst(apply, editor as any),
    isElementReadOnly: editor.isElementReadOnly,
    isInline: editor.isInline,
    isSelectable: editor.isSelectable,
    isVoid: editor.isVoid,
    markableVoid: editor.markableVoid,
    onChange: editor.onChange,
  });

  Object.assign(editor, {
    addMark: bindFirst(addMark, editor),
    deleteBackward: bindFirst(deleteBackward, editor),
    deleteForward: bindFirst(deleteForward, editor),
    deleteFragment: bindFirst(deleteFragment, editor),
    getDirtyPaths: bindFirst(getDirtyPaths, editor as any),
    getFragment: bindFirst(getFragment, editor),
    insertBreak: bindFirst(insertBreak, editor),
    insertFragment: bindFirst(insertFragment, editor),
    insertNode: bindFirst(insertNode, editor),
    insertSoftBreak: bindFirst(insertSoftBreak, editor as any),
    insertText: bindFirst(insertText, editor),
    normalizeNode: bindFirst(normalizeNode, editor as any),
    removeMark: bindFirst(removeEditorMark, editor as any),
    shouldNormalize: bindFirst(shouldNormalize, editor as any),
  });

  Object.assign(editor, {
    above: bindFirst(above, editor),
    after: bindFirst(getPointAfter, editor),
    before: bindFirst(getPointBefore, editor),
    collapse: bindFirst(collapseSelection, editor),
    delete: bindFirst(deleteText, editor),
    deselect: bindFirst(deselect, editor),
    deselectDOM: bindFirst(deselectDOM, editor),
    edges: bindFirst(getEdgePoints, editor),
    elementReadOnly: bindFirst(isElementReadOnly, editor),
    end: bindFirst(getEndPoint, editor),
    first: bindFirst(getFirstNode, editor),
    fragment: bindFirst(getFragment, editor),
    getMarks: bindFirst(getMarks, editor),
    hasBlocks: bindFirst(hasBlocks, editor),
    hasInlines: bindFirst(hasInlines, editor),
    hasPath: bindFirst(hasPath, editor as any),
    hasTexts: bindFirst(hasTexts, editor),
    insertNodes: bindFirst(insertNodes, editor),
    isBlock: bindFirst(isBlock, editor),
    isEdge: bindFirst(isEdgePoint, editor),
    isEmpty: bindFirst(isEmpty, editor),
    isEnd: bindFirst(isEndPoint, editor),
    isNormalizing: bindFirst(isEditorNormalizing, editor),
    isStart: bindFirst(isStartPoint, editor),
    last: bindFirst(last, editor),
    leaf: bindFirst(getLeafNode, editor),
    levels: bindFirst(getLevels, editor),
    liftNodes: bindFirst(liftNodes, editor),
    mergeNodes: bindFirst(mergeNodes, editor),
    move: bindFirst(moveSelection, editor),
    moveNodes: bindFirst(moveNodes, editor),
    next: bindFirst(next, editor),
    node: bindFirst(node, editor),
    nodes: bindFirst(nodes, editor),
    normalize: bindFirst(normalizeEditor, editor),
    parent: bindFirst(parent, editor),
    path: bindFirst(path, editor),
    pathRef: bindFirst(createPathRef, editor),
    pathRefs: bindFirst(getPathRefs, editor),
    point: bindFirst(getPoint, editor),
    pointRef: bindFirst(createPointRef, editor),
    pointRefs: bindFirst(getPointRefs, editor),
    positions: bindFirst(getPositions, editor),
    previous: bindFirst(previous, editor),
    range: bindFirst(range, editor),
    rangeRef: bindFirst(createRangeRef, editor),
    rangeRefs: bindFirst(getRangeRefs, editor),
    removeNodes: bindFirst(removeNodes, editor),
    select: bindFirst(select, editor),
    setNodes: bindFirst(setNodes, editor),
    setNormalizing: bindFirst(setNormalizing, editor as any),
    setPoint: bindFirst(setPoint, editor),
    setSelection: bindFirst(setSelection, editor),
    shouldMergeNodesRemovePrevNode: bindFirst(
      shouldMergeNodesRemovePrevNode,
      editor as any
    ),
    splitNodes: bindFirst(splitNodes, editor),
    start: bindFirst(getStartPoint, editor),
    string: bindFirst(getEditorString, editor),
    unhangRange: bindFirst(unhangRange, editor),
    unsetNodes: bindFirst(unsetNodes, editor),
    unwrapNodes: bindFirst(unwrapNodes, editor),
    void: bindFirst(getVoidNode, editor),
    withoutNormalizing: bindFirst(withoutNormalizing, editor as any),
    wrapNodes: bindFirst(wrapNodes, editor),
  });

  Object.assign(editor, {
    history: { redos: [], undos: [] },
    redo: noop('redo'),
    undo: noop('undo'),
    writeHistory: noop('writeHistory'),
  });

  Object.assign(editor, {
    insertData: noop('insertData'),
    insertFragmentData: noop('insertFragmentData', false),
    insertTextData: noop('insertTextData', false),
    setFragmentData: noop('setFragmentData'),
  });

  const api: Partial<EditorApi<V>> = {
    block: bindFirst(block, editor) as any,
    blocks: bindFirst(blocks, editor) as any,
    create: {
      block: (props) => ({ children: [{ text: '' }], type: 'p', ...props }),
      value: () => [api.create!.block()],
    },
    descendant: bindFirst(descendant, editor) as any,
    edgeBlocks: bindFirst(edgeBlocks, editor) as any,
    findDocumentOrShadowRoot: bindFirst(findDocumentOrShadowRoot, editor),
    findEventRange: bindFirst(findEventRange, editor),
    findKey: bindFirst(findKey, editor),
    findPath: bindFirst(findPath, editor),
    getWindow: bindFirst(getWindow, editor),
    hasDOMNode: bindFirst(hasDOMNode, editor),
    hasEditableTarget: bindFirst(hasEditableTarget, editor) as any,
    hasMark: bindFirst(hasMark, editor) as any,
    hasRange: bindFirst(hasRange, editor),
    hasSelectableTarget: bindFirst(hasSelectableTarget, editor) as any,
    hasTarget: bindFirst(hasTarget, editor) as any,
    isAt: bindFirst(isAt, editor),
    isComposing: bindFirst(isComposing, editor),
    isEditorEnd: bindFirst(isEditorEnd, editor),
    isFocused: bindFirst(isFocused, editor),
    isMerging: bindFirst(HistoryApi.isMerging, editor as any) as any,
    isReadOnly: bindFirst(isReadOnly, editor),
    isSaving: bindFirst(HistoryApi.isSaving, editor as any) as any,
    isSelected: bindFirst(isSelected, editor),
    isSplittingOnce: bindFirst(HistoryApi.isSplittingOnce, editor as any),
    isTargetInsideNonReadonlyVoid: bindFirst(
      isTargetInsideNonReadonlyVoid,
      editor
    ),
    isText: bindFirst(isText, editor),
    mark: bindFirst(mark, editor) as any,
    nodesRange: bindFirst(nodesRange, editor),
    prop: prop as any,
    scrollIntoView: bindFirst(scrollIntoView, editor),
    some: bindFirst(some, editor),
    toDOMNode: bindFirst(toDOMNode, editor),
    toDOMPoint: bindFirst(toDOMPoint, editor),
    toDOMRange: bindFirst(toDOMRange, editor),
    toSlateNode: bindFirst(toSlateNode, editor) as any,
    toSlatePoint: bindFirst(toSlatePoint, editor),
    toSlateRange: bindFirst(toSlateRange, editor),
    isCollapsed: () => RangeApi.isCollapsed(editor.selection),
    isExpanded: () => RangeApi.isExpanded(editor.selection),
  };

  const transforms: Partial<Editor<V>['transforms']> = {
    addMarks: bindFirst(addMarks, editor),
    blur: bindFirst(blur, editor),
    deselectDOM: bindFirst(deselectDOM, editor),
    duplicateNodes: bindFirst(duplicateNodes, editor),
    focus: bindFirst(focus, editor),
    removeMarks: bindFirst(removeMarks, editor as any),
    replaceNodes: bindFirst(replaceNodes, editor) as any,
    reset: bindFirst(reset, editor),
    setSplittingOnce: bindFirst(HistoryApi.setSplittingOnce, editor as any),
    toggleBlock: bindFirst(toggleBlock, editor),
    toggleMark: bindFirst(toggleMark, editor as any),
    withMerging: bindFirst(HistoryApi.withMerging, editor as any),
    withNewBatch: bindFirst(HistoryApi.withNewBatch, editor as any),
    withoutMerging: bindFirst(HistoryApi.withoutMerging, editor as any),
    withoutSaving: bindFirst(HistoryApi.withoutSaving, editor as any),
  };

  editor.api = api as any;
  editor.tf = transforms as any;
  editor.transforms = transforms as any;

  syncLegacyMethods(editor);

  return editor as unknown as Editor<V>;
};
