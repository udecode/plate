import { getEditorSchema } from '../core/editor-runtime';
import { joinKeepsPrefixOccupant } from '../core/prefix-occupant-join';
import { MAIN_ROOT_KEY } from '../core/public-root';
import { getActiveUpdateRoot, getChildList } from '../core/public-state';
import { isEditablePath, isWritablePoint } from '../core/writable-text';
import { nodes as getNodes } from '../editor/nodes';
import {
  type Element,
  NodeApi,
  type Path,
  PathApi,
  type Point,
  PointApi,
} from '../interfaces';
import type { AnyEditor as Editor } from '../interfaces/editor';
import {
  above as editorAbove,
  after as editorAfter,
  before as editorBefore,
  hasPath as editorHasPath,
  isBlock as editorIsBlock,
  isEmpty as editorIsEmpty,
  point as editorPoint,
} from '../interfaces/editor';
import { getDefined } from '../internal/get-defined';
import { readGridRole } from './delete-text-grid';
import {
  getCurrentNode,
  isTextNode,
  matchPointRootVisibility,
  pathContainsPoint,
} from './delete-text-plan';

export const getEmptyEditableInlinePathAtPoint = (
  editor: Editor,
  at: Point
): Path | null => {
  if (at.offset !== 0 || at.path.length < 2) {
    return null;
  }

  if (!editorHasPath(editor, at.path)) {
    return null;
  }

  const currentNode = getCurrentNode(editor, at.path);

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
    !getEditorSchema(editor).isIsolating(parent) &&
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

  const [currentBlockNode, currentBlockPath] = currentBlock;

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
    editorIsEmpty(editor, previousBlock) &&
    !joinKeepsPrefixOccupant(
      editor,
      [previousBlock, previousBlockPath],
      [currentBlockNode, currentBlockPath]
    )
    ? previousBlockPath
    : null;
};

const parentKeepsMinimumWithout = (editor: Editor, path: Path) => {
  const schema = getEditorSchema(editor);
  const root = getActiveUpdateRoot(editor) ?? MAIN_ROOT_KEY;
  const parent =
    path.length > 1
      ? (getCurrentNode(editor, PathApi.parent(path)) as Element)
      : null;
  const content = parent
    ? schema.getElementContent(String(parent.type))
    : schema.getRootContent(root);
  const siblings = parent
    ? parent.children.length
    : getChildList(editor).length;

  return (
    siblings - 1 >= (content?.min ?? 0) &&
    schema.canPlaceAtPath(path, [], {
      removing: [getDefined(path.at(-1))],
      root,
    })
  );
};

export const getGridBesideBlockEdge = (
  editor: Editor,
  at: Point,
  reverse: boolean,
  voids: boolean
): {
  block: readonly [Element, Path];
  landing: Point;
} | null => {
  const schema = getEditorSchema(editor);
  const block = editorAbove(editor, {
    at,
    match: (node) => NodeApi.isElement(node) && editorIsBlock(editor, node),
    mode: 'lowest',
    voids,
  }) as readonly [Element, Path] | undefined;

  if (
    !block ||
    schema.isIsolating(block[0]) ||
    !PointApi.equals(
      at,
      matchPointRootVisibility(
        editorPoint(editor, block[1], { edge: reverse ? 'start' : 'end' }),
        at
      )
    )
  ) {
    return null;
  }

  const beside = reverse
    ? editorBefore(editor, at, { voids: true })
    : editorAfter(editor, at, { voids: true });
  const grid =
    beside &&
    editorAbove(editor, {
      at: beside,
      match: (node, path) =>
        NodeApi.isElement(node) &&
        readGridRole(editor, node) === 'grid' &&
        !pathContainsPoint(path, at),
      mode: 'highest',
      voids: true,
    });
  const scope = editorAbove(editor, {
    at,
    match: (node) => NodeApi.isElement(node) && schema.isIsolating(node),
    mode: 'lowest',
    voids: true,
  });

  if (!grid || (scope && !PathApi.isAncestor(scope[1], grid[1]))) return null;

  const edge = reverse ? 'end' : 'start';
  const [gridText] = getNodes(editor, {
    at: grid[1],
    match: (node, path) =>
      NodeApi.isText(node) &&
      isWritablePoint(editor, editorPoint(editor, path, { edge })),
    reverse,
    voids: true,
  });

  return gridText
    ? { block, landing: editorPoint(editor, gridText[1], { edge }) }
    : null;
};

export const getEmptyBlockBesideGrid = (
  editor: Editor,
  beside: NonNullable<ReturnType<typeof getGridBesideBlockEdge>>
): { landing: Point; path: Path } | null => {
  const [blockNode, blockPath] = beside.block;
  const schema = getEditorSchema(editor);

  if (
    !editorIsEmpty(editor, blockNode) ||
    schema.isVoid(blockNode) ||
    schema.isAtom(blockNode) ||
    schema.isReadOnly(blockNode)
  ) {
    return null;
  }

  let path = blockPath;

  while (path.length > 1) {
    const parentPath = PathApi.parent(path);
    const parent = getCurrentNode(editor, parentPath) as Element;

    if (
      parent.children.length !== 1 ||
      schema.isIsolating(parent) ||
      schema.isReadOnly(parent)
    ) {
      break;
    }

    path = parentPath;
  }

  return isEditablePath(editor, path) && parentKeepsMinimumWithout(editor, path)
    ? { landing: beside.landing, path }
    : null;
};
