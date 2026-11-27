import { getEditorSchema } from '../core/editor-runtime';
import { refuseVetoedWrite } from '../core/node-write-veto';
import { MAIN_ROOT_KEY } from '../core/public-root';
import {
  applyBuiltDocumentChange,
  getActiveUpdateRoot,
  runEditorTransaction,
} from '../core/public-state';
import { isNonEditable } from '../core/writable-text';
import { node as getNode } from '../editor/node';
import { nodes as getNodes } from '../editor/nodes';
import { structuralPrevious } from '../editor/previous';
import { LocationApi, SelectionApi } from '../interfaces';
import type {
  AnyEditor as Editor,
  EditorAboveOptions,
  EditorLevelsOptions,
  EditorPreviousOptions,
} from '../interfaces/editor';
import {
  above as editorAbove,
  getChildren as editorGetChildren,
  isBlock as editorIsBlock,
  levels as editorLevels,
  parent as editorParent,
  shouldMergeNodesRemovePrevNode as editorShouldMergeNodesRemovePrevNode,
  unhangRange as editorUnhangRange,
} from '../interfaces/editor';
import { type Ancestor, type Node, NodeApi } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import { RangeApi } from '../interfaces/range';
import type {
  NodeMergeNodesOptions,
  NodeMutationMethods,
} from '../interfaces/transforms/node';
import { getDefined } from '../internal/get-defined';
import { select } from '../transforms-selection/select';
import { removeText } from '../transforms-text/delete-text';
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
  structuralPrevious(editor, options) as readonly [Node, Path] | undefined;

const getChildren = (editor: Editor, node: Ancestor) =>
  NodeApi.isEditor(node) ? editorGetChildren(editor) : node.children;

const refuseVetoedMergeUnwraps = (
  editor: Editor,
  {
    emptyAncestorPath,
    node,
    path,
    removesPrev,
  }: Readonly<{
    emptyAncestorPath: Path | undefined;
    node: Node;
    path: Path;
    removesPrev: boolean;
  }>
) => {
  const root = getActiveUpdateRoot(editor) ?? MAIN_ROOT_KEY;

  if (NodeApi.isElement(node) && !removesPrev) {
    refuseVetoedWrite(editor, { kind: 'unwrap', node, path, root });
  }
  if (!emptyAncestorPath) return;

  for (const [ancestor, ancestorPath] of readLevels(editor, { at: path })) {
    if (
      ancestorPath.length >= emptyAncestorPath.length &&
      ancestorPath.length < path.length &&
      NodeApi.isElement(ancestor)
    ) {
      refuseVetoedWrite(editor, {
        kind: 'unwrap',
        node: ancestor,
        path: ancestorPath,
        root,
      });
    }
  }
};

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
  const schema = getEditorSchema(editor);
  const prevIsolating = getClosestIsolatingAncestor(editor, prevPath);
  const currentIsolating = getClosestIsolatingAncestor(editor, path);

  if (
    (NodeApi.isElement(previousNode) &&
      schema.isIsolating(previousNode) &&
      !pathContainsPath(prevPath, path)) ||
    (NodeApi.isElement(node) &&
      schema.isIsolating(node) &&
      !pathContainsPath(path, prevPath)) ||
    (prevIsolating && !pathContainsPath(prevIsolating[1], path)) ||
    (currentIsolating && !pathContainsPath(currentIsolating[1], prevPath))
  ) {
    return true;
  }

  if (PathApi.isBefore(prevPath, path)) {
    const [intervening] = getNodes(editor, {
      at: [prevPath, path],
      match: (candidate, candidatePath) =>
        NodeApi.isElement(candidate) &&
        (schema.isIsolating(candidate) || isNonEditable(schema, candidate)) &&
        !pathContainsPath(candidatePath, prevPath) &&
        !pathContainsPath(candidatePath, path) &&
        !pathContainsPath(prevPath, candidatePath) &&
        !pathContainsPath(path, candidatePath),
      mode: 'highest',
      voids: true,
    });

    if (intervening) return true;
  }

  return false;
};

const dissolvesIsolatingDescendant = (
  editor: Editor,
  previousNode: Node,
  current: readonly [Node, Path]
) => {
  const [node, path] = current;

  if (!NodeApi.isElement(node) || !NodeApi.isElement(previousNode)) {
    return false;
  }

  const schema = getEditorSchema(editor);
  const [isolated] = getNodes(editor, {
    at: path,
    match: (descendant, descendantPath) =>
      descendantPath.length > path.length &&
      NodeApi.isElement(descendant) &&
      schema.isIsolating(descendant),
    voids: true,
  });

  return (
    !!isolated &&
    !schema.canPlaceAt(
      previousNode,
      previousNode.children,
      node.children,
      previousNode.children.length,
      { root: getActiveUpdateRoot(editor) ?? MAIN_ROOT_KEY }
    )
  );
};

const holdsOnly = (editor: Editor, ancestorPath: Path, path: Path) => {
  if (ancestorPath.length === 0) return false;

  for (
    let at = PathApi.parent(path);
    at.length >= ancestorPath.length;
    at = PathApi.parent(at)
  ) {
    if (getChildren(editor, NodeApi.ancestor(editor, at)).length !== 1) {
      return false;
    }
  }

  return true;
};

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

    if (SelectionApi.isNode(at)) {
      const anchors = Array.from(
        getNodes(editor, { at, match, mode, voids }),
        ([, path]) =>
          editor.anchor(path, {
            association: 'forward',
            deletion: 'drop',
          })
      ).toReversed();

      for (const anchor of anchors) {
        const path = anchor.release();

        if (path) mergeNodes(editor, { ...options, at: path });
      }
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
        const [start, end] = RangeApi.edges(at);
        const [startNode] = getNodes(editor, { at: start, match, voids, mode });
        const [endNode] = getNodes(editor, { at: end, match, voids, mode });
        const mergedByRangeRemoval = Boolean(
          startNode && endNode && !PathApi.equals(startNode[1], endNode[1])
        );
        const pointAnchor = editor.anchor(end, {
          association: 'forward',
          deletion: 'nearest',
        });
        const removal = removeText(editor, { at });
        const removalEnd = pointAnchor.release();

        if (removal?.kind === 'grid') {
          if (removal.keepsGrid || !removal.landing) return;
          at = removal.landing;
        } else {
          at = getDefined(removalEnd);
        }
        if (options.at == null) {
          select(editor, at);
        }
        if (mergedByRangeRemoval && removal?.kind !== 'grid') {
          return;
        }
      }
    }

    const [current] = getNodes(editor, { at, match, voids, mode });

    if (!current) {
      return;
    }

    const [node, path] = current;
    const previousPath =
      usesDefaultSiblingMatch && pathAt && PathApi.hasPrevious(pathAt)
        ? PathApi.previous(pathAt)
        : null;
    const prev = previousPath
      ? getNode(editor, previousPath)
      : readPrevious(editor, { at: path, match, voids, mode });

    if (!prev) {
      return;
    }

    const [previousNode, prevPath] = prev;

    if (path.length === 0 || prevPath.length === 0) {
      return;
    }

    if (
      crossesIsolatingBoundary(editor, prev, current) ||
      PathApi.equals(prevPath, path)
    ) {
      return;
    }

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

    const removesPrev = editorShouldMergeNodesRemovePrevNode(
      editor,
      prev,
      current
    );

    if (
      !removesPrev &&
      dissolvesIsolatingDescendant(editor, previousNode, current)
    ) {
      return;
    }

    const newPath = PathApi.next(prevPath);
    const commonPath = PathApi.common(path, prevPath);
    const isPreviousSibling = PathApi.equals(path, newPath);
    const levels = new Set(
      Array.from(readLevels(editor, { at: path }), ([n]) => n)
        .slice(commonPath.length)
        .slice(0, -1)
    );

    const emptyAncestor = readAbove(editor, {
      at: path,
      mode: 'highest',
      match: (n, p) => levels.has(n) && holdsOnly(editor, p, path),
    });

    const emptyAnchor = emptyAncestor
      ? editor.anchor(emptyAncestor[1], {
          association: 'forward',
          deletion: 'drop',
        })
      : null;
    refuseVetoedMergeUnwraps(editor, {
      emptyAncestorPath: emptyAncestor?.[1],
      node,
      path,
      removesPrev,
    });

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

    if (removesPrev) {
      removeNodes(editor, { at: prevPath, voids });
    } else {
      applyBuiltDocumentChange(editor, (builder, root) =>
        builder.mergeNode(root, newPath)
      );
    }

    emptyAnchor?.release();
  });
}) as NodeMutationMethods['mergeNodes'];
