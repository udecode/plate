import {
  applyOperation,
  getChildren,
  runEditorTransaction,
} from '../core/public-state';
import { node as getNode } from '../editor/node';
import { nodes as getNodes } from '../editor/nodes';
import {
  type Descendant,
  type Location,
  LocationApi,
  NodeApi,
  type Span,
} from '../interfaces';
import {
  isBlock as editorIsBlock,
  pathRef as editorPathRef,
  unhangRange as editorUnhangRange,
  withoutNormalizing as editorWithoutNormalizing,
} from '../interfaces/editor';
import type { NodeMutationMethods } from '../interfaces/transforms/node';
import { matchPath } from '../utils/match-path';

export const removeNodes: NodeMutationMethods['removeNodes'] = (
  editor,
  options = {}
) => {
  if (
    options.at !== undefined &&
    LocationApi.isPath(options.at) &&
    !LocationApi.isSpan(options.at) &&
    options.at.length > 0
  ) {
    const [node] = getNode(editor, options.at);
    const pathMatch = options.match ?? matchPath(editor, options.at);

    if (pathMatch(node, options.at)) {
      applyOperation(editor, {
        type: 'remove_node',
        path: options.at,
        node: node as Descendant,
      });
    }

    return;
  }

  runEditorTransaction(editor, (tx) => {
    const { hanging = false, voids = false, mode = 'lowest' } = options;
    let { match } = options;
    let at: Location | Span | null | undefined = tx.resolveTarget({
      at: options.at,
    });

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
        applyOperation(editor, {
          type: 'remove_node',
          path: at,
          node: node as Descendant,
        });
      }

      return;
    }

    editorWithoutNormalizing(editor, () => {
      if (match == null) {
        match = (n) => NodeApi.isElement(n) && editorIsBlock(editor, n);
      }

      const depths = getNodes(editor, { at, match, mode, voids });
      const pathRefs = Array.from(depths, ([, p]) => editorPathRef(editor, p));

      for (const pathRef of pathRefs) {
        const path = pathRef.unref()!;

        if (path) {
          const [node] = getNode(editor, path);
          applyOperation(editor, {
            type: 'remove_node',
            path,
            node: node as Descendant,
          });
        }
      }
    });
  });
};
