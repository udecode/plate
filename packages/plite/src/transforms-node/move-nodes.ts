import {
  applyBuiltDocumentChange,
  runEditorTransaction,
} from '../core/public-state';
import { node as getNode } from '../editor/node';
import { nodes as getNodes } from '../editor/nodes';
import { LocationApi, NodeApi } from '../interfaces';
import {
  getChildren as editorGetChildren,
  isBlock as editorIsBlock,
} from '../interfaces/editor';
import type { AnyEditor as Editor } from '../interfaces/editor';
import { type Path, PathApi } from '../interfaces/path';
import type {
  NodeMoveNodesOptions,
  NodeMutationMethods,
} from '../interfaces/transforms/node';
import { normalizeNodeMatch } from '../utils/node-match';

export const moveNodes = ((editor: Editor, options: NodeMoveNodesOptions) => {
  runEditorTransaction(editor, (tx) => {
    const { to, mode = 'lowest', voids = false } = options;
    const at = tx.resolveTarget({ at: options.at });
    let match = normalizeNodeMatch(options.type, options.match);

    if (!at) {
      return;
    }

    if (match == null) {
      if (LocationApi.isPath(at)) {
        if (at.length !== 0) {
          const movingNode = getNode(editor, at)[0];
          const sameParentForwardMove =
            at.length === to.length &&
            at.at(-1) != null &&
            to.at(-1) != null &&
            PathApi.equals(at.slice(0, -1), to.slice(0, -1)) &&
            at.at(-1)! < to.at(-1)!;

          const effectiveTo = sameParentForwardMove
            ? [
                ...to.slice(0, -1),
                Math.min(
                  to.at(-1)!,
                  NodeApi.isEditor(getNode(editor, at.slice(0, -1) as Path)[0])
                    ? editorGetChildren(editor).length - 1
                    : (
                        getNode(editor, at.slice(0, -1) as Path)[0] as {
                          readonly children: readonly unknown[];
                        }
                      ).children.length - 1
                ),
              ]
            : to;

          applyBuiltDocumentChange(editor, (builder, root) =>
            builder.moveNode(root, at, effectiveTo, {
              preservesRepresentation:
                at.length === effectiveTo.length &&
                PathApi.equals(at.slice(0, -1), effectiveTo.slice(0, -1)) &&
                NodeApi.isElement(movingNode) &&
                editorIsBlock(editor, movingNode),
            })
          );
        }

        return;
      }

      match = (n) => NodeApi.isElement(n) && editorIsBlock(editor, n);
    }

    const toAnchor = editor.anchor(to, {
      association: 'forward',
      deletion: 'nearest',
    });
    const pathAnchors = Array.from(
      getNodes(editor as never, { at, match, mode, voids }),
      ([, path]) =>
        editor.anchor(path, {
          association: 'forward',
          deletion: 'drop',
        })
    );
    let followsDestination = false;

    for (const pathAnchor of pathAnchors) {
      const path = pathAnchor.release();
      const destination = toAnchor.resolve();
      const newPath =
        followsDestination && destination
          ? PathApi.next(destination)
          : destination;

      if (!path || !newPath || path.length === 0) {
        continue;
      }

      applyBuiltDocumentChange(editor, (builder, root) =>
        builder.moveNode(root, path, newPath)
      );

      if (PathApi.isSibling(newPath, path) && PathApi.isAfter(newPath, path)) {
        followsDestination = true;
      }
    }

    toAnchor.release();
  });
}) as NodeMutationMethods['moveNodes'];
