import {
  applyBuiltDocumentChange,
  getChildren,
  getEditorUpdateRoot,
  getPublicSelection,
} from '../core/public-state';
import {
  type Descendant,
  ElementApi,
  type ElementOrTextIn,
  type Editor,
  type Node,
  NodeApi,
  type Point,
  SelectionApi,
  type Value,
} from '../interfaces';
import type { NodeReplaceChildrenOptions } from '../interfaces/transforms/node';

const getParentChildren = <V extends Value>(
  editor: Editor<V>,
  at: NodeReplaceChildrenOptions['at']
): readonly Node[] => {
  if (at.length === 0) {
    return getChildren(editor);
  }

  const parent = NodeApi.get(editor, at);

  if (!ElementApi.isElement(parent)) {
    throw new Error(
      `Cannot replace children at path [${at.join(',')}] because it does not reference an ancestor node.`
    );
  }

  return parent.children;
};

const findNodeReferencePath = (
  nodes: readonly Node[],
  target: Node,
  parentPath: readonly number[] = []
): readonly number[] | null => {
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index]!;
    const path = [...parentPath, index];

    if (node === target) return path;
    if (ElementApi.isElement(node)) {
      const nested = findNodeReferencePath(node.children, target, path);

      if (nested) return nested;
    }
  }

  return null;
};

export const replaceChildren = <
  V extends Value,
  TExtensions extends readonly unknown[],
  T extends ElementOrTextIn<NoInfer<V>>,
>(
  editor: Editor<V, TExtensions>,
  children: readonly T[],
  { at, count, index = 0, newSelection }: NodeReplaceChildrenOptions
) => {
  const parentChildren = getParentChildren(editor, at);
  const replacementCount = count ?? parentChildren.length - index;
  const replacedChildren = parentChildren.slice(
    index,
    index + replacementCount
  ) as Descendant[];
  const selection = getPublicSelection(editor);
  const pointIsReplaced = (point: Point) =>
    point.path.length > at.length &&
    at.every((part, depth) => point.path[depth] === part) &&
    point.path[at.length]! >= index &&
    point.path[at.length]! < index + replacedChildren.length;
  const mapPointByReference = (point: Point) => {
    const target = NodeApi.get(editor, point.path);
    const relativePath = findNodeReferencePath(children, target);

    return relativePath
      ? {
          ...point,
          path: [...at, index + relativePath[0]!, ...relativePath.slice(1)],
        }
      : null;
  };
  const retainedSelection =
    selection &&
    (SelectionApi.isText(selection) || SelectionApi.isNode(selection)) &&
    pointIsReplaced(selection.anchor) &&
    pointIsReplaced(selection.focus)
      ? (() => {
          const anchor = mapPointByReference(selection.anchor);
          const focus = mapPointByReference(selection.focus);

          if (!anchor || !focus) return null;

          if (SelectionApi.isNode(selection)) {
            const target = NodeApi.get(editor, selection.path);
            const relativePath = findNodeReferencePath(children, target);

            if (!relativePath) return null;

            return {
              ...selection,
              anchor,
              focus,
              path: [...at, index + relativePath[0]!, ...relativePath.slice(1)],
            };
          }

          return { ...selection, anchor, focus };
        })()
      : undefined;
  const selectionAfter =
    newSelection === undefined ? retainedSelection : newSelection;

  applyBuiltDocumentChange(
    editor,
    (builder, root) =>
      builder.replaceChildren(root, at, index, replacedChildren.length, [
        ...children,
      ] as Descendant[]),
    {
      ...(selectionAfter === undefined ? {} : { selectionAfter }),
      selectionRoot: getEditorUpdateRoot(editor),
    }
  );
};
