import { runEditorTransaction } from '../core/public-state';
import { node as getNode } from '../editor/node';
import { nodes as getNodes } from '../editor/nodes';
import { LocationApi, NodeApi } from '../interfaces';
import {
  getChildren as editorGetChildren,
  isBlock as editorIsBlock,
  pathRef as editorPathRef,
} from '../interfaces/editor';
import { type Path, PathApi } from '../interfaces/path';
import type { NodeMutationMethods } from '../interfaces/transforms/node';

export const moveNodes: NodeMutationMethods['moveNodes'] = (
  editor,
  options
) => {
  runEditorTransaction(editor, (tx) => {
    const { to, mode = 'lowest', voids = false } = options;
    const at = tx.resolveTarget({ at: options.at });
    let { match } = options;

    if (!at) {
      return;
    }

    if (match == null) {
      if (LocationApi.isPath(at)) {
        if (at.length !== 0) {
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
                          children: unknown[];
                        }
                      ).children.length - 1
                ),
              ]
            : to;

          tx.apply({
            type: 'move_node',
            path: at,
            newPath: effectiveTo,
          });
        }

        return;
      }

      match = (n) => NodeApi.isElement(n) && editorIsBlock(editor, n);
    }

    const toRef = editorPathRef(editor, to);
    const pathRefs = Array.from(
      getNodes(editor, { at, match, mode, voids }),
      ([, path]) => editorPathRef(editor, path)
    );

    for (const pathRef of pathRefs) {
      const path = pathRef.unref();
      const newPath = toRef.current;

      if (!path || !newPath || path.length === 0) {
        continue;
      }

      tx.apply({
        type: 'move_node',
        path,
        newPath,
      });

      if (
        toRef.current &&
        PathApi.isSibling(newPath, path) &&
        PathApi.isAfter(newPath, path)
      ) {
        toRef.current = PathApi.next(toRef.current);
      }
    }

    toRef.unref();
  });
};
