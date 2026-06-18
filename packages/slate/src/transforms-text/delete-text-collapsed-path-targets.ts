import { getEditorSchema } from '../core/editor-runtime';
import {
  NodeApi,
  type Path,
  PathApi,
  type Point,
  PointApi,
} from '../interfaces';
import { type Editor, Editor as EditorApi } from '../interfaces/editor';
import { getCurrentNode, isTextNode } from './delete-text-plan';

export const getEmptyEditableInlinePathAtPoint = (
  editor: Editor,
  at: Point
): Path | null => {
  if (at.offset !== 0 || at.path.length < 2) {
    return null;
  }

  if (!EditorApi.hasPath(editor, at.path as Path)) {
    return null;
  }

  const currentNode = getCurrentNode(editor, at.path as Path);

  if (!isTextNode(currentNode)) {
    return null;
  }

  const parentPath = at.path.slice(0, -1) as Path;

  if (!EditorApi.hasPath(editor, parentPath)) {
    return null;
  }

  const parent = getCurrentNode(editor, parentPath);

  if (
    NodeApi.isElement(parent) &&
    getEditorSchema(editor).isInline(parent) &&
    !getEditorSchema(editor).isVoid(parent) &&
    !getEditorSchema(editor).isReadOnly(parent) &&
    NodeApi.string(parent) === ''
  ) {
    return parentPath;
  }

  return null;
};

export const getPreviousEmptyBlockPathAtBlockStart = (
  editor: Editor,
  at: Point,
  voids: boolean
): Path | null => {
  const currentBlock = EditorApi.above(editor, {
    at,
    match: (node) => NodeApi.isElement(node) && EditorApi.isBlock(editor, node),
    mode: 'lowest',
    voids,
  });

  if (!currentBlock) {
    return null;
  }

  const [, currentBlockPath] = currentBlock;

  if (
    !PointApi.equals(
      at,
      EditorApi.point(editor, currentBlockPath, { edge: 'start' })
    ) ||
    currentBlockPath.length !== 1 ||
    !PathApi.hasPrevious(currentBlockPath)
  ) {
    return null;
  }

  const previousBlockPath = PathApi.previous(currentBlockPath);

  if (!EditorApi.hasPath(editor, previousBlockPath)) {
    return null;
  }

  const previousBlock = getCurrentNode(editor, previousBlockPath);

  return NodeApi.isElement(previousBlock) &&
    EditorApi.isBlock(editor, previousBlock) &&
    !getEditorSchema(editor).isVoid(previousBlock) &&
    !getEditorSchema(editor).isReadOnly(previousBlock) &&
    EditorApi.isEmpty(editor, previousBlock)
    ? previousBlockPath
    : null;
};
