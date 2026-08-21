import { getEditorSchema } from '../core/editor-runtime';
import {
  applyBuiltDocumentChange,
  runEditorTransaction,
} from '../core/public-state';
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
  previous as editorPrevious,
  shouldMergeNodesRemovePrevNode as editorShouldMergeNodesRemovePrevNode,
  unhangRange as editorUnhangRange,
} from '../interfaces/editor';
import type {
  AnyEditor as Editor,
  EditorAboveOptions,
  EditorLevelsOptions,
  EditorPreviousOptions,
} from '../interfaces/editor';
import { type Ancestor, type Node, NodeApi } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import { RangeApi } from '../interfaces/range';
import type {
  NodeMergeNodesOptions,
  NodeMutationMethods,
} from '../interfaces/transforms/node';
import { select } from '../transforms-selection/select';
import { deleteText } from '../transforms-text/delete-text';
import { formatDebugValue } from '../utils/format-debug-value';
import { normalizeNodeMatch } from '../utils/node-match';
import { moveNodes } from './move-nodes';
import { removeNodes } from './remove-nodes';

const readAbove = (editor: Editor, options?: EditorAboveOptions<Ancestor>) =>
  editorAbove(editor, options) as readonly [Ancestor, Path] | undefined;
const readLevels = (editor: Editor, options?: EditorLevelsOptions<Node>) =>
  editorLevels(editor, options) as Generator<
    readonly [Node, Path],
    void,
    undefined
  >;
const readPrevious = (editor: Editor, options?: EditorPreviousOptions<Node>) =>
  editorPrevious(editor, options) as readonly [Node, Path] | undefined;

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
  const [previousNode, prevPath] = previous;
  const [node, path] = current;
  const prevIsolating = getClosestIsolatingAncestor(editor, prevPath);
  const currentIsolating = getClosestIsolatingAncestor(editor, path);

  return (
    (NodeApi.isElement(previousNode) &&
      getEditorSchema(editor).isIsolating(previousNode) &&
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

export const mergeNodes = ((
  editor: Editor,
  options: NodeMergeNodesOptions = {}
) => {
  runEditorTransaction(editor, (tx) => {
    let match = normalizeNodeMatch(options.type, options.match);
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
        const pointAnchor = editor.anchor(end, {
          association: 'forward',
          deletion: 'nearest',
        });
        deleteText(editor, { at });
        at = pointAnchor.release()!;

        if (options.at == null) {
          select(editor, at);
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
      : readPrevious(editor, { at, match, voids, mode });

    if (!current || !prev) {
      return;
    }

    const [node, path] = current;
    const [previousNode, prevPath] = prev;

    if (path.length === 0 || prevPath.length === 0) {
      return;
    }

    if (crossesIsolatingBoundary(editor, prev, current)) {
      return;
    }

    const newPath = PathApi.next(prevPath);
    const commonPath = PathApi.common(path, prevPath);
    const isPreviousSibling = PathApi.isSibling(path, prevPath);
    const levels = new Set(
      Array.from(readLevels(editor, { at: path }), ([n]) => n)
        .slice(commonPath.length)
        .slice(0, -1)
    );

    // Determine if the merge will leave an ancestor of the path empty as a
    // result, in which case we'll want to remove it after merging.
    const emptyAncestor = readAbove(editor, {
      at: path,
      mode: 'highest',
      match: (n) => levels.has(n) && hasSingleChildNest(editor, n),
    });

    const emptyAnchor = emptyAncestor
      ? editor.anchor(emptyAncestor[1], {
          association: 'forward',
          deletion: 'drop',
        })
      : null;
    if (
      !(
        (NodeApi.isText(node) && NodeApi.isText(previousNode)) ||
        (NodeApi.isElement(node) && NodeApi.isElement(previousNode))
      )
    ) {
      throw new Error(
        `Cannot merge the node at path [${path}] with the previous sibling because it is not the same kind: ${formatDebugValue(
          node
        )} ${formatDebugValue(previousNode)}`
      );
    }

    // If the node isn't already the next sibling of the previous node, move
    // it so that it is before merging.
    if (!isPreviousSibling) {
      moveNodes(editor, { at: path, to: newPath, voids });
    }

    // If there was going to be an empty ancestor of the node that was merged,
    // we remove it from the tree.
    const emptyPath = emptyAnchor?.resolve();

    if (emptyPath) {
      removeNodes(editor, { at: emptyPath, voids });
    }

    if (editorShouldMergeNodesRemovePrevNode(editor, prev, current)) {
      removeNodes(editor, { at: prevPath, voids });
    } else {
      applyBuiltDocumentChange(editor, (builder, root) =>
        builder.mergeNode(root, newPath)
      );
    }

    emptyAnchor?.release();
  });
}) as NodeMutationMethods['mergeNodes'];
