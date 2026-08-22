import {
  type Descendant,
  type Node,
  NodeApi,
  PathApi,
  type Point,
  type Range,
  RangeApi,
  type RootKey,
} from '@platejs/plite';

import {
  type Editor as RuntimeEditor,
  dispatchCommand,
  editorCommands,
  isBlock as editorIsBlock,
  isVoid as editorIsVoid,
  above as editorAbove,
  hasPath as editorHasPath,
} from './runtime-editor-api';

export const createDefaultParagraph = (): Descendant => ({
  type: 'paragraph',
  children: [{ text: '' }],
});

const isBlockVoid = (editor: RuntimeEditor, node: Node) =>
  NodeApi.isElement(node) &&
  editorIsBlock(editor, node) &&
  editorIsVoid(editor, node);

const getCollapsedBlockPath = (
  editor: RuntimeEditor,
  selection: Range | null
) => {
  if (!selection || !RangeApi.isCollapsed(selection)) {
    return null;
  }

  const blockEntry = editorAbove(editor, {
    at: selection.anchor,
    match: (node) => NodeApi.isElement(node) && editorIsBlock(editor, node),
    mode: 'highest',
    voids: true,
  });

  return blockEntry?.[1] ?? null;
};

const getSelectedBlockVoidPath = (
  editor: RuntimeEditor,
  selection: Range | null
) => {
  const blockPath = getCollapsedBlockPath(editor, selection);

  if (!blockPath || !editorHasPath(editor, blockPath)) {
    return null;
  }

  return isBlockVoid(editor, NodeApi.get(editor, blockPath)) ? blockPath : null;
};

export const getPointWithRoot = (
  point: Point,
  root: RootKey | undefined
): Point => (root === undefined ? point : { ...point, root });

export const applyParagraphBreakAfterSelectedBlockVoid = (
  editor: RuntimeEditor,
  selection: Range | null
) => {
  const voidPath = getSelectedBlockVoidPath(editor, selection);

  if (!voidPath) {
    return false;
  }

  const insertionPath = PathApi.next(voidPath);
  const selectionPoint = { path: insertionPath.concat(0), offset: 0 };

  editor.update((tx) => {
    dispatchCommand(editor, editorCommands.insertNodes, {
      nodes: createDefaultParagraph(),
      options: { at: insertionPath },
    });
    tx.selection.set({
      anchor: selectionPoint,
      focus: selectionPoint,
    });
  });

  return true;
};
