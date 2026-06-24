import { getEditorSchema } from '../core/editor-runtime';
import { applyOperation, runEditorTransaction } from '../core/public-state';
import { getEditorTransformRegistry } from '../core/transform-registry';
import { node as getNode } from '../editor/node';
import { nodes as getNodes } from '../editor/nodes';
import { LocationApi } from '../interfaces';
import {
  above as editorAbove,
  getChildren as editorGetChildren,
  isBlock as editorIsBlock,
  isVoid as editorIsVoid,
  levels as editorLevels,
  parent as editorParent,
  pathRef as editorPathRef,
  pointRef as editorPointRef,
  previous as editorPrevious,
  shouldMergeNodesRemovePrevNode as editorShouldMergeNodesRemovePrevNode,
  unhangRange as editorUnhangRange,
  withoutNormalizing as editorWithoutNormalizing,
} from '../interfaces/editor';
import type { Editor } from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import { type Ancestor, type Node, NodeApi } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import { RangeApi } from '../interfaces/range';
import type { Text } from '../interfaces/text';
import type { NodeMutationMethods } from '../interfaces/transforms/node';
import { formatDebugValue } from '../utils/format-debug-value';

const getChildren = (editor: Editor, node: Ancestor) =>
  NodeApi.isEditor(node) ? editorGetChildren(editor) : node.children;

const pathContainsPath = (ancestor: Path, path: Path) =>
  PathApi.equals(ancestor, path) || PathApi.isAncestor(ancestor, path);

const getClosestIsolatingAncestor = (editor: Editor, path: Path) =>
  editorAbove(editor, {
    at: path,
    match: (node) =>
      NodeApi.isElement(node) && getEditorSchema(editor).isIsolating(node),
    mode: 'lowest',
    voids: true,
  });

const crossesIsolatingBoundary = (
  editor: Editor,
  previous: readonly [Node, Path],
  current: readonly [Node, Path]
) => {
  const [prevNode, prevPath] = previous;
  const [node, path] = current;
  const prevIsolating = getClosestIsolatingAncestor(editor, prevPath);
  const currentIsolating = getClosestIsolatingAncestor(editor, path);

  return (
    (NodeApi.isElement(prevNode) &&
      getEditorSchema(editor).isIsolating(prevNode) &&
      !pathContainsPath(prevPath, path)) ||
    (NodeApi.isElement(node) &&
      getEditorSchema(editor).isIsolating(node) &&
      !pathContainsPath(path, prevPath)) ||
    (prevIsolating && !pathContainsPath(prevIsolating[1], path)) ||
    (currentIsolating && !pathContainsPath(currentIsolating[1], prevPath))
  );
};

const hasSingleChildNest = (editor: Editor, node: Node): boolean =>
  node !== editor &&
  (NodeApi.isText(node) ||
    (NodeApi.isElement(node) && editorIsVoid(editor, node)) ||
    (!NodeApi.isText(node) &&
      getChildren(editor, node).length === 1 &&
      hasSingleChildNest(editor, getChildren(editor, node)[0]!)));

export const mergeNodes: NodeMutationMethods['mergeNodes'] = (
  editor,
  options = {}
) => {
  runEditorTransaction(editor, (tx) => {
    editorWithoutNormalizing(editor, () => {
      const transforms = getEditorTransformRegistry(editor);
      let { match } = options;
      let at = tx.resolveTarget({ at: options.at });
      const { hanging = false, voids = false, mode = 'lowest' } = options;

      if (!at) {
        return;
      }

      const isPathMerge = LocationApi.isPath(at);
      const pathAt = isPathMerge ? (at as Path) : null;
      const usesDefaultSiblingMatch = match == null && isPathMerge;

      if (match == null) {
        if (isPathMerge) {
          const [parent] = editorParent(editor, at);
          match = (n) =>
            !NodeApi.isEditor(n) && getChildren(editor, parent).includes(n);
        } else {
          match = (n) => NodeApi.isElement(n) && editorIsBlock(editor, n);
        }
      }

      if (!hanging && LocationApi.isRange(at)) {
        at = editorUnhangRange(editor, at, { voids });
      }

      if (LocationApi.isRange(at)) {
        if (RangeApi.isCollapsed(at)) {
          at = at.anchor;
        } else {
          const [, end] = RangeApi.edges(at);
          const pointRef = editorPointRef(editor, end);
          transforms.delete({ at });
          at = pointRef.unref()!;

          if (options.at == null) {
            transforms.select(at);
          }
        }
      }

      const [current] = getNodes(editor, { at, match, voids, mode });
      const previousPath =
        usesDefaultSiblingMatch && pathAt && PathApi.hasPrevious(pathAt)
          ? PathApi.previous(pathAt)
          : null;
      const prev = previousPath
        ? getNode(editor, previousPath)
        : editorPrevious(editor, { at, match, voids, mode });

      if (!current || !prev) {
        return;
      }

      const [node, path] = current;
      const [prevNode, prevPath] = prev;

      if (path.length === 0 || prevPath.length === 0) {
        return;
      }

      if (crossesIsolatingBoundary(editor, prev, current)) {
        return;
      }

      const newPath = PathApi.next(prevPath);
      const commonPath = PathApi.common(path, prevPath);
      const isPreviousSibling = PathApi.isSibling(path, prevPath);
      const levels = Array.from(editorLevels(editor, { at: path }), ([n]) => n)
        .slice(commonPath.length)
        .slice(0, -1);

      // Determine if the merge will leave an ancestor of the path empty as a
      // result, in which case we'll want to remove it after merging.
      const emptyAncestor = editorAbove(editor, {
        at: path,
        mode: 'highest',
        match: (n) => levels.includes(n) && hasSingleChildNest(editor, n),
      });

      const emptyRef = emptyAncestor && editorPathRef(editor, emptyAncestor[1]);
      let properties: Partial<Text> | Partial<Element>;
      let position: number;

      // Ensure that the nodes are equivalent, and figure out what the position
      // and extra properties of the merge will be.
      if (NodeApi.isText(node) && NodeApi.isText(prevNode)) {
        const { text, ...rest } = node;
        position = prevNode.text.length;
        properties = rest as Partial<Text>;
      } else if (NodeApi.isElement(node) && NodeApi.isElement(prevNode)) {
        const { children, ...rest } = node;
        position = prevNode.children.length;
        properties = rest as Partial<Element>;
      } else {
        throw new Error(
          `Cannot merge the node at path [${path}] with the previous sibling because it is not the same kind: ${formatDebugValue(
            node
          )} ${formatDebugValue(prevNode)}`
        );
      }

      // If the node isn't already the next sibling of the previous node, move
      // it so that it is before merging.
      if (!isPreviousSibling) {
        transforms.moveNodes({ at: path, to: newPath, voids });
      }

      // If there was going to be an empty ancestor of the node that was merged,
      // we remove it from the tree.
      if (emptyRef) {
        transforms.removeNodes({ at: emptyRef.current!, voids });
      }

      if (editorShouldMergeNodesRemovePrevNode(editor, prev, current)) {
        transforms.removeNodes({ at: prevPath, voids });
      } else {
        applyOperation(editor, {
          type: 'merge_node',
          path: newPath,
          position,
          properties,
        });
      }

      if (emptyRef) {
        emptyRef.unref();
      }
    });
  });
};
