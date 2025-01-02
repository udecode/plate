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

import {
  addMark,
  blurEditor,
  collapseSelection,
  createPathRef,
  createPointRef,
  createRangeRef,
  deleteBackward,
  deleteForward,
  deleteFragment,
  deleteText,
  deselect,
  deselectEditor,
  findEditorDocumentOrShadowRoot,
  findEventRange,
  findNodeKey,
  findPath,
  focusEditor,
  getAboveNode,
  getEdgePoints,
  getEditorString,
  getEditorWindow,
  getEndPoint,
  getFirstNode,
  getFragment,
  getLastNode,
  getLeafNode,
  getLevels,
  getMarks,
  getNextNode,
  getNodeEntries,
  getNodeEntry,
  getParentNode,
  getPath,
  getPathRefs,
  getPoint,
  getPointAfter,
  getPointBefore,
  getPointRefs,
  getPositions,
  getPreviousNode,
  getRange,
  getRangeRefs,
  getStartPoint,
  getVoidNode,
  hasBlocks,
  hasEditorDOMNode,
  hasEditorEditableTarget,
  hasEditorRange,
  hasEditorSelectableTarget,
  hasEditorTarget,
  hasInlines,
  hasTexts,
  insertBreak,
  insertFragment,
  insertNode,
  insertNodes,
  insertText,
  isBlock,
  isComposing,
  isEdgePoint,
  isEditorFocused,
  isEditorNormalizing,
  isEditorReadOnly,
  isElementEmpty,
  isElementReadOnly,
  isEndPoint,
  isStartPoint,
  isTargetInsideNonReadonlyVoid,
  liftNodes,
  mergeNodes,
  moveNodes,
  moveSelection,
  normalizeEditor,
  removeNodes,
  select,
  setNodes,
  setPoint,
  setSelection,
  splitNodes,
  toDOMNode,
  toDOMPoint,
  toDOMRange,
  toSlateNode,
  toSlatePoint,
  toSlateRange,
  unhangRange,
  unsetNodes,
  unwrapNodes,
  withoutNormalizing,
  wrapNodes,
} from './interfaces';
import { findNodePath } from './queries';
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
    edges: bindFirst(getEdgePoints, editor),
    elementReadOnly: bindFirst(isElementReadOnly, editor),
    end: bindFirst(getEndPoint, editor),
    findDocumentOrShadowRoot: bindFirst(findEditorDocumentOrShadowRoot, editor),
    findEventRange: bindFirst(findEventRange, editor),
    findKey: bindFirst(findNodeKey, editor),
    findPath: (node: any, options: any) =>
      options
        ? findNodePath(editor, node, options)
        : (findPath(editor, node) ?? findNodePath(editor, node, options)),
    first: bindFirst(getFirstNode, editor),
    fragment: bindFirst(getFragment, editor),
    getDirtyPaths: bindFirst(getDirtyPaths, editor as any),
    getFragment: bindFirst(getFragment, editor),
    getWindow: bindFirst(getEditorWindow, editor),
    hasBlocks: bindFirst(hasBlocks, editor),
    hasDOMNode: bindFirst(hasEditorDOMNode, editor),
    hasEditableTarget: bindFirst(hasEditorEditableTarget, editor) as any,
    hasInlines: bindFirst(hasInlines, editor),
    hasPath: bindFirst(hasPath, editor as any),
    hasRange: bindFirst(hasEditorRange, editor),
    hasSelectableTarget: bindFirst(hasEditorSelectableTarget, editor) as any,
    hasTarget: bindFirst(hasEditorTarget, editor) as any,
    hasTexts: bindFirst(hasTexts, editor),
    isBlock: bindFirst(isBlock, editor),
    isComposing: bindFirst(isComposing, editor),
    isEdge: bindFirst(isEdgePoint, editor),
    isElementReadOnly: editor.isElementReadOnly,
    isEmpty: bindFirst(isElementEmpty, editor),
    isEnd: bindFirst(isEndPoint, editor),
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
    isVoid: editor.isVoid,
    last: bindFirst(getLastNode, editor),
    leaf: bindFirst(getLeafNode, editor),
    levels: bindFirst(getLevels, editor) as any,
    markableVoid: editor.markableVoid,
    marks: bindFirst(getMarks, editor),
    next: bindFirst(getNextNode, editor) as any,
    node: bindFirst(getNodeEntry, editor) as any,
    nodes: bindFirst(getNodeEntries, editor) as any,
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
