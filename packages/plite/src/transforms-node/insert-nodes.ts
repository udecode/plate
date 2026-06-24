import { batchDirtyPaths } from '../core/batch-dirty-paths';
import { getEditorSchema } from '../core/editor-runtime';
import {
  applyOperation,
  getEditorOperationRoot,
  runEditorTransaction,
} from '../core/public-state';
import { getEditorTransformRegistry } from '../core/transform-registry';
import { updateDirtyPaths } from '../core/update-dirty-paths';
import { nodes as getNodes } from '../editor/nodes';
import {
  type BaseInsertNodeOperation,
  type Descendant,
  type Location,
  LocationApi,
  type Node,
  NodeApi,
  type Path,
  PathApi,
  RangeApi,
} from '../interfaces';
import {
  isBlock as editorIsBlock,
  isEnd as editorIsEnd,
  isInline as editorIsInline,
  pathRef as editorPathRef,
  point as editorPoint,
  pointRef as editorPointRef,
  unhangRange as editorUnhangRange,
  void as editorVoid,
  withoutNormalizing as editorWithoutNormalizing,
} from '../interfaces/editor';
import type { NodeMutationMethods } from '../interfaces/transforms/node';
import { getDefaultInsertLocation } from '../utils';

export const insertNodes: NodeMutationMethods<any>['insertNodes'] = (
  editor,
  nodes,
  options = {}
) => {
  runEditorTransaction(editor, (tx) => {
    editorWithoutNormalizing(editor, () => {
      const transforms = getEditorTransformRegistry(editor);
      const {
        hanging = false,
        voids = false,
        mode = 'lowest',
        batchDirty = true,
      } = options;
      let at: Location | undefined = options.at;
      let { match, select } = options;

      const nextNodes = (NodeApi.isNode(nodes) ? [nodes] : nodes) as Node[];

      if (nextNodes.length === 0) {
        return;
      }

      const [node] = nextNodes;

      if (!at) {
        const target = tx.resolveTarget();
        if (target) {
          at = target;
        }
        if (!at && tx.getModelSelection() == null) {
          at = getDefaultInsertLocation(editor);
        }
        if (!at) {
          return;
        }
        if (select !== false) {
          select = true;
        }
      }

      if (select == null) {
        select = false;
      }

      if (LocationApi.isRange(at)) {
        if (!hanging) {
          at = editorUnhangRange(editor, at, { voids });
        }

        if (RangeApi.isCollapsed(at)) {
          at = at.anchor;
        } else {
          const [, end] = RangeApi.edges(at);
          const pointRef = editorPointRef(editor, end);
          transforms.delete({ at });
          at = pointRef.unref()!;
        }
      }

      if (LocationApi.isPoint(at)) {
        if (match == null) {
          if (NodeApi.isText(node)) {
            match = (n) => NodeApi.isText(n);
          } else if (
            NodeApi.isElement(node) &&
            getEditorSchema(editor).isInline(node)
          ) {
            match = (n) =>
              NodeApi.isText(n) ||
              (NodeApi.isElement(n) && editorIsInline(editor, n));
          } else {
            match = (n) => NodeApi.isElement(n) && editorIsBlock(editor, n);
          }
        }

        const [entry] = getNodes(editor, {
          at: at.path,
          match,
          mode,
          voids,
        });

        if (!entry) {
          return;
        }

        const [, matchPath] = entry;
        const pathRef = editorPathRef(editor, matchPath);
        const isAtEnd = editorIsEnd(editor, at, matchPath);
        transforms.splitNodes({ at, match, mode, voids });
        const path = pathRef.unref()!;
        at = isAtEnd ? PathApi.next(path) : path;
      }

      if (LocationApi.isPath(at) && at.length === 0) {
        throw new Error('Cannot insert into the editor root.');
      }

      const parentPath = PathApi.parent(at);
      let index = at.at(-1)!;

      if (!voids && editorVoid(editor, { at: parentPath })) {
        return;
      }

      if (batchDirty) {
        const batchedOps: BaseInsertNodeOperation[] = [];
        const newDirtyPaths: Path[] = PathApi.levels(parentPath);
        const root = getEditorOperationRoot(editor);

        batchDirtyPaths(
          editor,
          () => {
            for (const child of nextNodes as Node[]) {
              const path = parentPath.concat(index);
              index++;

              const op: BaseInsertNodeOperation = {
                type: 'insert_node',
                path,
                node: child as Descendant,
              };

              applyOperation(editor, op);
              at = PathApi.next(at as Path);
              batchedOps.push(op);

              if (NodeApi.isText(child)) {
                newDirtyPaths.push(path);
              } else {
                newDirtyPaths.push(
                  ...Array.from(NodeApi.nodes(child), ([, childPath]) =>
                    path.concat(childPath)
                  )
                );
              }
            }
          },
          () => {
            updateDirtyPaths(
              editor,
              newDirtyPaths,
              (path) => {
                let nextPath: Path | null = path;

                for (const op of batchedOps) {
                  nextPath = PathApi.transform(nextPath, op);

                  if (!nextPath) {
                    return null;
                  }
                }

                return nextPath;
              },
              { root }
            );
          }
        );
      } else {
        for (const child of nextNodes as Node[]) {
          const path = parentPath.concat(index);
          index++;

          applyOperation(editor, {
            type: 'insert_node',
            path,
            node: child as Descendant,
          });
          at = PathApi.next(at as Path);
        }
      }

      at = PathApi.previous(at);

      if (select) {
        const point = editorPoint(editor, at, { edge: 'end' });

        if (point) {
          transforms.select(point);
        }
      }
    });
  });
};
