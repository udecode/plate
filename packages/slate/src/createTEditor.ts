/* eslint-disable @typescript-eslint/unbound-method */
import { bindFirst } from '@udecode/utils';
import { createEditor } from 'slate';

import type { TEditor, Value } from './interfaces/editor/TEditor';

import {
  addMark,
  blurEditor,
  collapseSelection,
  createPathRef,
  createPointRef,
  createRangeRef,
  deleteFragment,
  deleteText,
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
  wrapNodes,
} from './interfaces';
import { findNodePath } from './queries';
import { HistoryEditor } from './slate-history';

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

export const createTEditor = <V extends Value>() => {
  const editor = createEditor() as any as TEditor;

  // Editor
  editor.addMark = bindFirst(addMark, editor);
  editor.deleteFragment = bindFirst(deleteFragment, editor);
  // editor.getFragment = bindFirst(getFragment, editor as TEditor);
  editor.insertBreak = bindFirst(insertBreak, editor);
  editor.insertFragment = bindFirst(insertFragment, editor);
  editor.insertNode = bindFirst(insertNode, editor);

  // EditorInterface
  editor.above = bindFirst(getAboveNode, editor) as any;
  editor.after = bindFirst(getPointAfter, editor);
  editor.before = bindFirst(getPointBefore, editor);
  editor.edges = bindFirst(getEdgePoints, editor);
  editor.elementReadOnly = bindFirst(isElementReadOnly, editor);
  editor.end = bindFirst(getEndPoint, editor);
  editor.first = bindFirst(getFirstNode, editor);
  editor.fragment = bindFirst(getFragment, editor);
  editor.getMarks = bindFirst(getMarks, editor);
  editor.hasBlocks = bindFirst(hasBlocks, editor);
  editor.hasInlines = bindFirst(hasInlines, editor);
  editor.hasTexts = bindFirst(hasTexts, editor);
  editor.isBlock = bindFirst(isBlock, editor);
  editor.isEdge = bindFirst(isEdgePoint, editor);
  editor.isEmpty = bindFirst(isElementEmpty, editor);
  editor.isEnd = bindFirst(isEndPoint, editor);
  editor.isNormalizing = bindFirst(isEditorNormalizing, editor);
  editor.isStart = bindFirst(isStartPoint, editor);
  editor.last = bindFirst(getLastNode, editor);
  editor.leaf = bindFirst(getLeafNode, editor);
  editor.levels = bindFirst(getLevels, editor) as any;
  editor.next = bindFirst(getNextNode, editor) as any;
  editor.node = bindFirst(getNodeEntry, editor) as any;
  editor.nodes = bindFirst(getNodeEntries, editor) as any;
  editor.parent = bindFirst(getParentNode, editor) as any;
  editor.path = bindFirst(getPath, editor);
  editor.pathRef = bindFirst(createPathRef, editor);
  editor.pathRefs = bindFirst(getPathRefs, editor);
  editor.point = bindFirst(getPoint, editor);
  editor.pointRef = bindFirst(createPointRef, editor);
  editor.pointRefs = bindFirst(getPointRefs, editor);
  editor.positions = bindFirst(getPositions, editor);
  editor.previous = bindFirst(getPreviousNode, editor) as any;
  editor.range = bindFirst(getRange, editor);
  editor.rangeRef = bindFirst(createRangeRef, editor);
  editor.rangeRefs = bindFirst(getRangeRefs, editor);
  editor.start = bindFirst(getStartPoint, editor);
  editor.string = bindFirst(getEditorString, editor);
  editor.unhangRange = bindFirst(unhangRange, editor);
  editor.void = bindFirst(getVoidNode, editor) as any;

  // Node transforms
  editor.insertNodes = bindFirst(insertNodes, editor);
  editor.liftNodes = bindFirst(liftNodes, editor);
  editor.mergeNodes = bindFirst(mergeNodes, editor);
  editor.moveNodes = bindFirst(moveNodes, editor);
  editor.removeNodes = bindFirst(removeNodes, editor);
  editor.setNodes = bindFirst(setNodes, editor);
  editor.splitNodes = bindFirst(splitNodes, editor);
  editor.unsetNodes = bindFirst(unsetNodes, editor);
  editor.unwrapNodes = bindFirst(unwrapNodes, editor);
  editor.wrapNodes = bindFirst(wrapNodes, editor);

  // Text transforms
  editor.delete = bindFirst(deleteText, editor);
  editor.insertFragment = bindFirst(insertFragment, editor);

  // Selection transforms
  editor.collapse = bindFirst(collapseSelection, editor);
  editor.move = bindFirst(moveSelection, editor);
  editor.select = bindFirst(select, editor);
  editor.setPoint = bindFirst(setPoint, editor);
  editor.setSelection = bindFirst(setSelection, editor);

  // HistoryEditor
  editor.history = { redos: [], undos: [] };
  editor.undo = noop('undo');
  editor.redo = noop('redo');
  editor.writeHistory = noop('writeHistory');

  // HistoryEditorInterface
  editor.isMerging = bindFirst(HistoryEditor.isMerging, editor as any) as any;
  editor.isSaving = bindFirst(HistoryEditor.isSaving, editor as any) as any;
  editor.isSplittingOnce = bindFirst(
    HistoryEditor.isSplittingOnce,
    editor as any
  );
  editor.setSplittingOnce = bindFirst(
    HistoryEditor.setSplittingOnce,
    editor as any
  );
  editor.withMerging = bindFirst(HistoryEditor.withMerging, editor as any);
  editor.withNewBatch = bindFirst(HistoryEditor.withNewBatch, editor as any);
  editor.withoutMerging = bindFirst(
    HistoryEditor.withoutMerging,
    editor as any
  );
  editor.withoutSaving = bindFirst(HistoryEditor.withoutSaving, editor as any);

  // DOMEditor
  editor.hasEditableTarget = bindFirst(hasEditorEditableTarget, editor) as any;
  editor.hasRange = bindFirst(hasEditorRange, editor);
  editor.hasSelectableTarget = bindFirst(
    hasEditorSelectableTarget,
    editor
  ) as any;
  editor.hasTarget = bindFirst(hasEditorTarget, editor) as any;
  editor.insertData = noop('insertData');
  editor.insertFragmentData = noop('insertFragmentData') as any;
  editor.insertTextData = noop('insertTextData', false);
  editor.isTargetInsideNonReadonlyVoid = bindFirst(
    isTargetInsideNonReadonlyVoid,
    editor
  );
  editor.setFragmentData = noop('setFragmentData');

  // DOMEditorInterface
  editor.blur = bindFirst(blurEditor, editor);
  editor.deselect = bindFirst(deselectEditor, editor);
  editor.hasDOMNode = bindFirst(hasEditorDOMNode, editor);
  editor.isComposing = bindFirst(isComposing, editor);
  editor.isFocused = bindFirst(isEditorFocused, editor);
  editor.isReadOnly = bindFirst(isEditorReadOnly, editor);
  editor.findDocumentOrShadowRoot = bindFirst(
    findEditorDocumentOrShadowRoot,
    editor
  );
  editor.findEventRange = bindFirst(findEventRange, editor);
  editor.findKey = bindFirst(findNodeKey, editor);
  editor.findPath = (node, options) =>
    options
      ? findNodePath(editor, node, options)
      : (findPath(editor, node) ?? findNodePath(editor, node, options));
  editor.focus = bindFirst(focusEditor, editor);
  editor.getWindow = bindFirst(getEditorWindow, editor);
  editor.toDOMNode = bindFirst(toDOMNode, editor);
  editor.toDOMPoint = bindFirst(toDOMPoint, editor);
  editor.toDOMRange = bindFirst(toDOMRange, editor);
  editor.toSlateNode = bindFirst(toSlateNode, editor) as any;
  editor.toSlatePoint = bindFirst(toSlatePoint, editor);
  editor.toSlateRange = bindFirst(toSlateRange, editor);

  return editor as TEditor<V>;
};
