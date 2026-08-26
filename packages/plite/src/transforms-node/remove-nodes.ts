import {
  applyBuiltDocumentChange,
  getChildren,
  getCurrentSelection,
  runEditorTransaction,
} from '../core/public-state';
import { node as getNode } from '../editor/node';
import { nodes as getNodes } from '../editor/nodes';
import {
  type Location,
  LocationApi,
  NodeApi,
  SelectionApi,
  type NodeSelection,
  type Span,
} from '../interfaces';
import {
  isBlock as editorIsBlock,
  unhangRange as editorUnhangRange,
} from '../interfaces/editor';
import type { AnyEditor as Editor } from '../interfaces/editor';
import { PathApi } from '../interfaces/path';
import type {
  NodeMutationMethods,
  NodeRemoveNodesOptions,
} from '../interfaces/transforms/node';
import { matchPath } from '../utils/match-path';
import { normalizeNodeMatch } from '../utils/node-match';

export const removeNodes = ((
  editor: Editor,
  options: NodeRemoveNodesOptions = {}
) => {
  const removeNodeSelection = (
    nodeSelection: NodeSelection,
    clearSelection: boolean
  ) => {
    const paths = nodeSelection.paths;

    runEditorTransaction(editor, (tx) => {
      if (clearSelection) tx.setSelection(null);
      for (const path of paths.toReversed()) {
        removeNodes(editor, { ...options, at: path });
      }
    });
  };

  if (SelectionApi.isNode(options.at)) {
    removeNodeSelection(options.at, false);
    return;
  }

  const implicitSelection =
    options.at === undefined ? getCurrentSelection(editor) : null;

  if (SelectionApi.isNode(implicitSelection)) {
    removeNodeSelection(implicitSelection, true);
    return;
  }

  if (
    options.at !== undefined &&
    LocationApi.isPath(options.at) &&
    !LocationApi.isSpan(options.at) &&
    options.at.length > 0
  ) {
    const { at } = options;
    const [node] = getNode(editor, at);
    const pathMatch =
      normalizeNodeMatch(options.type, options.match) ?? matchPath(editor, at);

    if (pathMatch(node, at)) {
      applyBuiltDocumentChange(editor, (builder, root) =>
        builder.removeNode(root, at)
      );
    }

    return;
  }

  runEditorTransaction(editor, (tx) => {
    const { hanging = false, voids = false, mode = 'lowest' } = options;
    let match = normalizeNodeMatch(options.type, options.match);
    const resolvedTarget = tx.resolveTarget({
      at: options.at,
    });
    if (SelectionApi.isNode(resolvedTarget)) return;
    let at: Location | Span | null | undefined = resolvedTarget;

    if (!at) {
      return;
    }

    if (LocationApi.isPath(at) && !LocationApi.isSpan(at) && at.length === 0) {
      if (match == null) {
        throw new Error('Cannot remove the editor root.');
      }

      const children = getChildren(editor);

      if (children.length === 0) {
        return;
      }

      at = [[0], [children.length - 1]];
    }

    if (!hanging && !LocationApi.isSpan(at) && LocationApi.isRange(at)) {
      at = editorUnhangRange(editor, at, { voids });
    }

    if (!LocationApi.isSpan(at) && LocationApi.isPath(at)) {
      const [node] = getNode(editor, at);
      const pathMatch = match ?? matchPath(editor, at);

      if (pathMatch(node, at)) {
        applyBuiltDocumentChange(editor, (builder, root) =>
          builder.removeNode(root, at)
        );
      }

      return;
    }

    if (match == null) {
      match = (n) => NodeApi.isElement(n) && editorIsBlock(editor, n);
    }

    const selection =
      options.at === undefined ? getCurrentSelection(editor) : null;
    const selectionAnchor = SelectionApi.isText(selection)
      ? editor.anchor(selection, { deletion: 'nearest' })
      : null;
    const depths = getNodes(editor as never, { at, match, mode, voids });
    const pathAnchors = Array.from(depths, ([, path]) =>
      editor.anchor(path, {
        association: 'forward',
        deletion: 'drop',
      })
    );

    for (const pathAnchor of pathAnchors) {
      const path = pathAnchor.release();

      if (path) {
        applyBuiltDocumentChange(editor, (builder, root) =>
          builder.removeNode(root, path)
        );
      }
    }

    if (selectionAnchor) {
      const resolved = selectionAnchor.release();

      tx.setSelection(resolved ? { ...selection, ...resolved } : null);
    }
  });
}) as NodeMutationMethods['removeNodes'];
