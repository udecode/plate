import { getEditorSchema } from '../core/editor-runtime';
import {
  applyOperation,
  profileCoreDuration,
  runEditorTransaction,
} from '../core/public-state';
import { getEditorTransformRegistry } from '../core/transform-registry';
import { node as getNode } from '../editor/node';
import { nodes as getNodes } from '../editor/nodes';
import { LocationApi } from '../interfaces';
import { Editor } from '../interfaces/editor';
import { type Node, NodeApi } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import type { PointRef } from '../interfaces/point-ref';
import { type Range, RangeApi } from '../interfaces/range';
import type { NodeMutationMethods } from '../interfaces/transforms/node';

const deleteRange = (editor: Editor, range: Range): Point | null => {
  if (RangeApi.isCollapsed(range)) {
    return range.anchor;
  }

  const [, end] = RangeApi.edges(range);
  const pointRef = Editor.pointRef(editor, end);
  getEditorTransformRegistry(editor).delete({ at: range });
  return pointRef.unref();
};

const getTextEndForwardPoint = (
  editor: Editor,
  point: Point,
  highestPath: Path
): Point | null => {
  if (highestPath.length >= point.path.length) {
    return null;
  }

  const [node] = getNode(editor, point.path);

  if (
    !NodeApi.isText(node) ||
    node.text !== '' ||
    point.offset !== node.text.length
  ) {
    return null;
  }

  const nextPath = PathApi.next(point.path);

  if (!NodeApi.has(editor, nextPath)) {
    return null;
  }

  return Editor.point(editor, nextPath, { edge: 'start' });
};

const isTextStartSplit = (node: Node, point: Point, path: Path) =>
  NodeApi.isText(node) &&
  PathApi.equals(path, point.path) &&
  point.offset === 0;

const isInlineStartSplit = (
  editor: Editor,
  node: Node,
  point: Point,
  path: Path
) =>
  NodeApi.isElement(node) &&
  getEditorSchema(editor).isInline(node) &&
  Editor.isStart(editor, point, path);

const ensureStartPointAfterHighestSplit = (
  editor: Editor,
  path: Path
): Point | null => {
  if (!NodeApi.has(editor, path)) {
    return null;
  }

  const [node, textPath] = NodeApi.first(editor, path);

  if (NodeApi.isText(node)) {
    return { path: textPath, offset: 0 };
  }

  if (NodeApi.isElement(node) && node.children.length === 0) {
    const point = { path: textPath.concat(0), offset: 0 };

    applyOperation(editor, {
      type: 'insert_node',
      path: point.path,
      node: { text: '' },
    });

    return point;
  }

  return null;
};

export const splitNodes: NodeMutationMethods['splitNodes'] = (
  editor,
  options = {}
) => {
  runEditorTransaction(editor, (tx) => {
    profileCoreDuration('split-nodes-without-normalizing', () => {
      Editor.withoutNormalizing(editor, () => {
        const transforms = getEditorTransformRegistry(editor);
        const { mode = 'lowest', voids = false } = options;
        let { match, height = 0, always = false } = options;
        let at = profileCoreDuration('split-nodes-resolve-target', () =>
          tx.resolveTarget({ at: options.at })
        );

        if (!at) {
          return;
        }

        if (match == null) {
          match = (n) => NodeApi.isElement(n) && Editor.isBlock(editor, n);
        }

        if (LocationApi.isRange(at)) {
          at = deleteRange(editor, at);
          if (!at) {
            return;
          }
        }

        let targetWasPath = false;

        if (LocationApi.isPath(at)) {
          targetWasPath = true;

          if (at.length === 0) {
            throw new Error('Cannot split the editor root.');
          }

          if (options.position != null) {
            const path = at;
            const [node] = getNode(editor, path);

            applyOperation(editor, {
              type: 'split_node',
              path,
              position: options.position,
              properties: NodeApi.extractProps(node),
            });

            return;
          }

          const path = at;
          const point = profileCoreDuration('split-nodes-path-point', () =>
            Editor.point(editor, path)
          );
          const [parent] = profileCoreDuration('split-nodes-path-parent', () =>
            Editor.parent(editor, path)
          );

          match = (n) => n === parent;
          height = point.path.length - path.length + 1;
          at = point;
          always = true;
        }

        if (!LocationApi.isPoint(at)) {
          return;
        }

        let splitPoint: Point = at;
        const beforeRef = profileCoreDuration(
          'split-nodes-before-point-ref',
          () =>
            Editor.pointRef(editor, splitPoint, {
              affinity: 'backward',
            })
        );
        let afterRef: PointRef | undefined;

        try {
          const [highest] = profileCoreDuration(
            'split-nodes-find-highest',
            () =>
              getNodes(editor, {
                at: splitPoint,
                match,
                mode,
                voids,
              })
          );

          if (!highest) {
            return;
          }

          const voidMatch = profileCoreDuration('split-nodes-void-match', () =>
            Editor.void(editor, {
              at: splitPoint,
              mode: 'highest',
            })
          );

          if (!voids && voidMatch) {
            const [voidNode, voidPath] = voidMatch;

            if (getEditorSchema(editor).isInline(voidNode)) {
              let after = Editor.after(editor, voidPath);

              if (!after) {
                const text = { text: '' };
                const afterPath = PathApi.next(voidPath);
                transforms.insertNodes(text, { at: afterPath, voids });
                after = Editor.point(editor, afterPath)!;
              }

              splitPoint = after;
              always = true;
            }

            const siblingHeight = splitPoint.path.length - voidPath.length;
            height = siblingHeight + 1;
            always = true;
          }

          const depth = splitPoint.path.length - height;
          const [, highestPath] = highest;
          const textEndForwardPoint = always
            ? profileCoreDuration('split-nodes-text-end-forward-point', () =>
                getTextEndForwardPoint(editor, splitPoint, highestPath)
              )
            : null;
          afterRef = profileCoreDuration('split-nodes-after-point-ref', () =>
            Editor.pointRef(editor, textEndForwardPoint ?? splitPoint, {
              affinity: 'forward',
            })
          );
          const lowestPath = splitPoint.path.slice(0, depth);
          let rightHighestPath: Path | null = null;
          let position =
            height === 0 ? splitPoint.offset : splitPoint.path[depth]!;

          profileCoreDuration('split-nodes-levels-loop', () => {
            for (const [node, path] of Editor.levels(editor, {
              at: lowestPath,
              reverse: true,
              voids,
            })) {
              let split = false;

              if (
                path.length < highestPath.length ||
                path.length === 0 ||
                (!voids &&
                  NodeApi.isElement(node) &&
                  Editor.isVoid(editor, node))
              ) {
                break;
              }

              const point = beforeRef.current!;
              const isEnd = Editor.isEnd(editor, point, path);

              if (
                (textEndForwardPoint &&
                  PathApi.equals(path, splitPoint.path)) ||
                (always &&
                  (isTextStartSplit(node, splitPoint, path) ||
                    (!targetWasPath &&
                      isInlineStartSplit(editor, node, splitPoint, path))))
              ) {
                split = false;
              } else if (always || !Editor.isEdge(editor, point, path)) {
                split = true;
                applyOperation(editor, {
                  type: 'split_node',
                  path,
                  position,
                  properties: NodeApi.extractProps(node),
                });

                if (always && PathApi.equals(path, highestPath)) {
                  rightHighestPath = PathApi.next(path);
                }
              }

              position = path.at(-1)! + (split || isEnd ? 1 : 0);
            }
          });

          if (options.at == null) {
            profileCoreDuration('split-nodes-select-after', () => {
              const rightHighestPoint =
                rightHighestPath === null
                  ? null
                  : ensureStartPointAfterHighestSplit(editor, rightHighestPath);
              const point =
                rightHighestPoint ||
                afterRef?.current ||
                Editor.point(editor, [], { edge: 'end' });
              transforms.select(point);
            });
          }
        } finally {
          profileCoreDuration('split-nodes-unref', () => {
            beforeRef.unref();
            afterRef?.unref();
          });
        }
      });
    });
  });
};
