import { getEditorSchema } from '../core/editor-runtime';
import {
  NodeApi,
  type Path,
  PathApi,
  type Point,
  PointApi,
} from '../interfaces';
import {
  above as editorAbove,
  hasPath as editorHasPath,
  isBlock as editorIsBlock,
  isEmpty as editorIsEmpty,
  point as editorPoint,
} from '../interfaces/editor';
import type { Editor } from '../interfaces/editor';
import { getCurrentNode, isTextNode } from './delete-text-plan';

export const getEmptyEditableInlinePathAtPoint = (
  editor: Editor,
  at: Point
): Path | null => {
  if (at.offset !== 0 || at.path.length < 2) {
    return null;
  }

  if (!editorHasPath(editor, at.path as Path)) {
    return null;
  }

  const currentNode = getCurrentNode(editor, at.path as Path);

  if (!isTextNode(currentNode)) {
    return null;
  }

  const parentPath = at.path.slice(0, -1) as Path;

  if (!editorHasPath(editor, parentPath)) {
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
  const currentBlock = editorAbove(editor, {
    at,
    match: (node) => NodeApi.isElement(node) && editorIsBlock(editor, node),
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
      editorPoint(editor, currentBlockPath, { edge: 'start' })
    ) ||
    currentBlockPath.length !== 1 ||
    !PathApi.hasPrevious(currentBlockPath)
  ) {
    return null;
  }

  const previousBlockPath = PathApi.previous(currentBlockPath);

  if (!editorHasPath(editor, previousBlockPath)) {
    return null;
  }

  const previousBlock = getCurrentNode(editor, previousBlockPath);

  return NodeApi.isElement(previousBlock) &&
    editorIsBlock(editor, previousBlock) &&
    !getEditorSchema(editor).isVoid(previousBlock) &&
    !getEditorSchema(editor).isReadOnly(previousBlock) &&
    editorIsEmpty(editor, previousBlock)
    ? previousBlockPath
    : null;
};
