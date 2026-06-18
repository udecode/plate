import { applyOperation, runEditorTransaction } from '../core/public-state';
import { node as getNode } from '../editor/node';
import { nodes as getNodes } from '../editor/nodes';
import { type Descendant, LocationApi, NodeApi } from '../interfaces';
import { Editor } from '../interfaces/editor';
import type { NodeMutationMethods } from '../interfaces/transforms/node';
import { matchPath } from '../utils/match-path';

export const removeNodes: NodeMutationMethods['removeNodes'] = (
  editor,
  options = {}
) => {
  if (
    options.at !== undefined &&
    LocationApi.isPath(options.at) &&
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
    let at = tx.resolveTarget({ at: options.at });

    if (!at) {
      return;
    }

    if (LocationApi.isPath(at) && at.length === 0) {
      throw new Error('Cannot remove the editor root.');
    }

    if (!hanging && LocationApi.isRange(at)) {
      at = Editor.unhangRange(editor, at, { voids });
    }

    if (LocationApi.isPath(at)) {
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

    Editor.withoutNormalizing(editor, () => {
      if (match == null) {
        match = (n) => NodeApi.isElement(n) && Editor.isBlock(editor, n);
      }

      const depths = getNodes(editor, { at, match, mode, voids });
      const pathRefs = Array.from(depths, ([, p]) => Editor.pathRef(editor, p));

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
