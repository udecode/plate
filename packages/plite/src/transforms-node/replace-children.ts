import {
  applyOperation,
  getChildren,
  getCurrentSelection,
} from '../core/public-state';
import {
  type Descendant,
  ElementApi,
  type ElementOrTextIn,
  type Editor,
  type Node,
  NodeApi,
  type Path,
  PathApi,
  type Point,
  type Range,
  RangeApi,
  type Value,
} from '../interfaces';
import type {
  NodeMutationMethods,
  NodeReplaceChildrenOptions,
} from '../interfaces/transforms/node';

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

const findNodeIdentityPath = (
  nodes: readonly Descendant[],
  target: Node
): number[] | undefined => {
  for (const [index, node] of nodes.entries()) {
    if (node === target) {
      return [index];
    }

    if (!ElementApi.isElement(node)) continue;

    const childPath = findNodeIdentityPath(node.children, target);

    if (childPath) {
      return [index, ...childPath];
    }
  }
};

const getPointIdentityRemap = ({
  index,
  newChildren,
  parentPath,
  point,
  replacedChildren,
}: {
  index: number;
  newChildren: readonly Descendant[];
  parentPath: Path;
  point: Point;
  replacedChildren: readonly Descendant[];
}): Point | undefined => {
  if (!PathApi.isAncestor(parentPath, point.path)) return;

  const childIndex = point.path[parentPath.length];

  if (childIndex === undefined) return;
  if (childIndex < index || childIndex >= index + replacedChildren.length) {
    return;
  }

  const oldChild = replacedChildren[childIndex - index];

  if (!oldChild) return;

  const oldTargetPath = point.path.slice(parentPath.length + 1);
  const oldTargetNode = NodeApi.getIf(oldChild, oldTargetPath);

  if (!oldTargetNode) return;

  const newTargetPath = findNodeIdentityPath(newChildren, oldTargetNode);

  if (!newTargetPath) return;

  return {
    ...point,
    path: [...parentPath, ...newTargetPath],
  };
};

const getDefaultNewSelection = ({
  index,
  newChildren,
  parentPath,
  replacedChildren,
  selection,
}: {
  index: number;
  newChildren: readonly Descendant[];
  parentPath: Path;
  replacedChildren: readonly Descendant[];
  selection: Range | null;
}): Range | null => {
  if (!selection) return null;

  const op = {
    children: replacedChildren as Descendant[],
    index,
    newChildren: newChildren as Descendant[],
    newSelection: selection,
    path: parentPath,
    selection,
    type: 'replace_children' as const,
  };

  const mapPoint = (point: Point) =>
    getPointIdentityRemap({
      index,
      newChildren,
      parentPath,
      point,
      replacedChildren,
    }) ?? RangeApi.transform({ anchor: point, focus: point }, op)?.anchor;

  const anchor = mapPoint(selection.anchor);
  const focus = mapPoint(selection.focus);

  if (!anchor || !focus) return null;

  return { anchor, focus };
};

export const replaceChildren: NodeMutationMethods['replaceChildren'] = <
  V extends Value,
  T extends ElementOrTextIn<V>,
>(
  editor: Parameters<NodeMutationMethods<V>['replaceChildren']>[0],
  children: T[],
  { at, count, index = 0, newSelection }: NodeReplaceChildrenOptions
) => {
  const parentChildren = getParentChildren(editor, at);
  const replacementCount = count ?? parentChildren.length - index;
  const replacedChildren = parentChildren.slice(
    index,
    index + replacementCount
  ) as Descendant[];
  const selection = getCurrentSelection(editor);
  const nextSelection =
    newSelection === undefined
      ? getDefaultNewSelection({
          index,
          newChildren: children as Descendant[],
          parentPath: at,
          replacedChildren,
          selection,
        })
      : newSelection;

  applyOperation(editor, {
    children: replacedChildren,
    index,
    newChildren: children as Descendant[],
    newSelection: nextSelection,
    path: at,
    selection,
    type: 'replace_children',
  });
};
