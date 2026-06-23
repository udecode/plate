import {
  type Descendant,
  type Node,
  NodeApi,
  type Path,
  PathApi,
  type Point,
  PointApi,
  type Range,
  RangeApi,
  type RootKey,
} from '@platejs/plite';
import { Editor, type Editor as RuntimeEditor } from './runtime-editor-api';

export const createDefaultParagraph = (): Descendant =>
  ({
    type: 'paragraph',
    children: [{ text: '' }],
  }) as Descendant;

const isBlockVoid = (editor: RuntimeEditor, node: Node) =>
  NodeApi.isElement(node) &&
  Editor.isBlock(editor, node) &&
  Editor.isVoid(editor, node);

const getCollapsedBlockPath = (
  editor: RuntimeEditor,
  selection: Range | null
) => {
  if (!selection || !RangeApi.isCollapsed(selection)) {
    return null;
  }

  const blockEntry = Editor.above(editor, {
    at: selection.anchor,
    match: (node) => NodeApi.isElement(node) && Editor.isBlock(editor, node),
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

  if (!blockPath || !Editor.hasPath(editor, blockPath)) {
    return null;
  }

  return isBlockVoid(editor, NodeApi.get(editor, blockPath)) ? blockPath : null;
};

export const applyBackspaceAfterBlockVoid = (
  editor: RuntimeEditor,
  selection: Range | null
) => {
  const blockPath = getCollapsedBlockPath(editor, selection);

  if (
    !selection ||
    !blockPath ||
    !PathApi.hasPrevious(blockPath) ||
    !Editor.isStart(editor, selection.anchor, blockPath)
  ) {
    return false;
  }

  const block = NodeApi.get(editor, blockPath);

  if (!NodeApi.isElement(block) || NodeApi.string(block) !== '') {
    return false;
  }

  const previousPath = PathApi.previous(blockPath);

  if (!Editor.hasPath(editor, previousPath)) {
    return false;
  }

  const previous = NodeApi.get(editor, previousPath);

  if (!isBlockVoid(editor, previous)) {
    return false;
  }

  const selectionPoint = Editor.point(editor, previousPath, { edge: 'start' });

  editor.update((tx) => {
    tx.nodes.remove({ at: blockPath });
    tx.selection.set({ anchor: selectionPoint, focus: selectionPoint });
  });

  return true;
};

export const getPointWithRoot = (
  point: Point,
  root: RootKey | undefined
): Point => (root === undefined ? point : { ...point, root });

export const applyBackspaceAtLeadingInlineVoidBlockBoundary = (
  editor: RuntimeEditor,
  selection: Range | null
) => {
  if (!selection || RangeApi.isExpanded(selection)) {
    return false;
  }

  const point = selection.anchor;

  if (point.offset !== 0) {
    return false;
  }

  const target = editor.read((state) => {
    const isInlineVoidAt = (location: Path | Point) => {
      if (PathApi.isPath(location)) {
        if (!state.nodes.hasPath(location)) {
          return false;
        }

        const [node] = state.nodes.get(location);

        return (
          NodeApi.isElement(node) &&
          Editor.isInline(editor, node) &&
          Editor.isVoid(editor, node)
        );
      }

      return !!Editor.above(editor, {
        at: location,
        match: (node) =>
          NodeApi.isElement(node) &&
          Editor.isInline(editor, node) &&
          Editor.isVoid(editor, node),
        mode: 'lowest',
        voids: true,
      });
    };
    const block = Editor.above(editor, {
      at: point,
      match: (node) => NodeApi.isElement(node) && Editor.isBlock(editor, node),
      mode: 'lowest',
      voids: true,
    });

    if (!block) {
      return null;
    }

    const [, blockPath] = block;

    if (blockPath.length !== 1 || !PathApi.hasPrevious(blockPath)) {
      return null;
    }

    const [blockNode] = block;
    const previousBlockPath = PathApi.previous(blockPath);
    const [previousBlockNode] = state.nodes.get(previousBlockPath);

    if (
      !NodeApi.isElement(blockNode) ||
      !NodeApi.isElement(previousBlockNode) ||
      !Editor.isBlock(editor, previousBlockNode)
    ) {
      return null;
    }

    const blockStart = getPointWithRoot(
      Editor.point(editor, blockPath, { edge: 'start' }),
      point.root
    );

    if (!PointApi.equals(point, blockStart)) {
      return null;
    }

    const nextSiblingPath = PathApi.next(point.path);

    if (
      !isInlineVoidAt(point) &&
      (!Editor.hasPath(editor, nextSiblingPath) ||
        !isInlineVoidAt(nextSiblingPath))
    ) {
      return null;
    }

    const firstChild = blockNode.children[0];
    const sourceChildIndex =
      point.path.length === blockPath.length + 1 &&
      point.path.at(-1) === 0 &&
      NodeApi.isText(firstChild) &&
      firstChild.text === ''
        ? 1
        : 0;
    const moveCount = blockNode.children.length - sourceChildIndex;

    return {
      blockStart,
      blockPath,
      insertPath: [...previousBlockPath, previousBlockNode.children.length],
      moveCount,
      previousBlockEnd: getPointWithRoot(
        Editor.point(editor, previousBlockPath, { edge: 'end' }),
        point.root
      ),
      sourcePath: [...blockPath, sourceChildIndex],
    };
  });

  if (!target) {
    return false;
  }

  editor.update((tx) => {
    const insertIndex = target.insertPath.at(-1)!;
    const insertParentPath = target.insertPath.slice(0, -1);

    for (let index = 0; index < target.moveCount; index++) {
      tx.nodes.move({
        at: target.sourcePath,
        to: [...insertParentPath, insertIndex + index],
        voids: true,
      });
    }
    tx.nodes.remove({
      at: target.blockPath,
      voids: true,
    });
    tx.selection.set({
      anchor: target.previousBlockEnd,
      focus: target.previousBlockEnd,
    });
  });

  return true;
};

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
    tx.nodes.insert(createDefaultParagraph(), { at: insertionPath });
    tx.selection.set({ anchor: selectionPoint, focus: selectionPoint });
  });

  return true;
};
