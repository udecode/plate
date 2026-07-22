import { getEditorSchema } from '../core/editor-runtime';
import type { Anchor } from '../core/anchor';
import { mapCanonicalRepresentationPoint } from '../core/representation';
import {
  applyBuiltDocumentChange,
  finalizeTransactionRepresentation,
  getActiveDocumentChangeBuilder,
  getActiveUpdateRoot,
  getCurrentSelection,
  profileCoreDuration,
  runEditorTransaction,
} from '../core/public-state';
import { node as getNode } from '../editor/node';
import { nodes as getNodes } from '../editor/nodes';
import { LocationApi } from '../interfaces';
import {
  after as editorAfter,
  isBlock as editorIsBlock,
  isEdge as editorIsEdge,
  isEnd as editorIsEnd,
  isStart as editorIsStart,
  isVoid as editorIsVoid,
  levels as editorLevels,
  parent as editorParent,
  point as editorPoint,
  void as editorVoid,
} from '../interfaces/editor';
import type { Editor } from '../interfaces/editor';
import { type Node, NodeApi } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import { type Range, RangeApi } from '../interfaces/range';
import { SelectionApi } from '../interfaces/selection';
import type { NodeMutationMethods } from '../interfaces/transforms/node';
import { select } from '../transforms-selection/select';
import { deleteText } from '../transforms-text/delete-text';
import { insertNodes } from './insert-nodes';

const deleteRange = (editor: Editor, range: Range): Point | null => {
  if (RangeApi.isCollapsed(range)) {
    return range.anchor;
  }

  const [start, end] = RangeApi.edges(range);
  const [endBlock] = getNodes(editor, {
    at: end,
    match: (node) => NodeApi.isElement(node) && editorIsBlock(editor, node),
    mode: 'highest',
  });
  const preserveEndPoint =
    Boolean(editorVoid(editor, { at: start, mode: 'highest' })) ||
    Boolean(endBlock && editorIsStart(editor, end, endBlock[1]));
  const endAnchor = editor.anchor(end, {
    association: 'forward',
    deletion: 'nearest',
  });

  deleteText(editor, { at: range });
  const selection = getCurrentSelection(editor);
  const preservedEnd = endAnchor.release();

  return preserveEndPoint
    ? preservedEnd
    : SelectionApi.isText(selection)
      ? selection.anchor
      : preservedEnd;
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

  return editorPoint(editor, nextPath, { edge: 'start' });
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
  editorIsStart(editor, point, path);

const getActiveDraftRoot = (editor: Editor): Node => {
  const value = getActiveDocumentChangeBuilder(editor).value;
  const root = getActiveUpdateRoot(editor) ?? 'main';

  return {
    children: root === 'main' ? value.children : (value.roots?.[root] ?? []),
  } as Node;
};

const getSplitProperties = (
  editor: Editor,
  node: Node,
  path: Path,
  root: string
) =>
  NodeApi.isText(node)
    ? {
        ...getEditorSchema(editor).textPropertiesForSplitAt(node, path, root),
      }
    : NodeApi.isElement(node)
      ? getEditorSchema(editor).elementPropertiesForSplitAt(node, path, root)
      : NodeApi.extractProps(node);

const ensureStartPointAfterHighestSplit = (
  editor: Editor,
  path: Path
): Point | null => {
  const draft = getActiveDraftRoot(editor);
  const target = NodeApi.getIf(draft, path);

  if (!target) return null;
  const [node, textPath] = NodeApi.first(draft, path);

  if (NodeApi.isText(node)) {
    return { path: textPath, offset: 0 };
  }

  if (NodeApi.isElement(node) && node.children.length === 0) {
    const point = { path: textPath.concat(0), offset: 0 };

    applyBuiltDocumentChange(editor, (builder, root) =>
      builder.insertNode(root, point.path, { text: '' })
    );

    return point;
  }

  return null;
};

export const splitNodes: NodeMutationMethods['splitNodes'] = (
  editor,
  options = {}
) => {
  runEditorTransaction(editor, (tx) => {
    profileCoreDuration('split-nodes-transaction', () => {
      const { mode = 'lowest', voids = false } = options;
      let { match, height = 0, always = false } = options;
      let at = profileCoreDuration('split-nodes-resolve-target', () =>
        tx.resolveTarget({ at: options.at })
      );

      if (!at) {
        return;
      }

      if (match == null) {
        match = (n) => NodeApi.isElement(n) && editorIsBlock(editor, n);
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

          applyBuiltDocumentChange(editor, (builder, root) =>
            builder.splitNode(
              root,
              path,
              options.position!,
              getSplitProperties(editor, node, path, root)
            )
          );

          return;
        }

        const path = at;
        const point = profileCoreDuration('split-nodes-path-point', () =>
          editorPoint(editor, path)
        );
        const [parent] = profileCoreDuration('split-nodes-path-parent', () =>
          editorParent(editor, path)
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
      const beforeAnchor = profileCoreDuration(
        'split-nodes-before-anchor',
        () =>
          editor.anchor(splitPoint, {
            association: 'backward',
            deletion: 'nearest',
          })
      );
      let afterAnchor: Anchor<Point> | undefined;

      try {
        const [highest] = profileCoreDuration('split-nodes-find-highest', () =>
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
          editorVoid(editor, {
            at: splitPoint,
            mode: 'highest',
          })
        );

        if (!voids && voidMatch) {
          const [voidNode, voidPath] = voidMatch;

          if (getEditorSchema(editor).isInline(voidNode)) {
            let after = editorAfter(editor, voidPath);

            if (!after) {
              const text = { text: '' };
              const afterPath = PathApi.next(voidPath);
              insertNodes(editor, text, { at: afterPath, voids });
              after = editorPoint(editor, afterPath)!;
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
        const [splitText] = getNode(editor, splitPoint.path);
        const preserveLeftPoint =
          !always &&
          NodeApi.isText(splitText) &&
          splitPoint.offset === splitText.text.length;
        const textEndForwardPoint = always
          ? profileCoreDuration('split-nodes-text-end-forward-point', () =>
              getTextEndForwardPoint(editor, splitPoint, highestPath)
            )
          : null;
        afterAnchor = profileCoreDuration('split-nodes-after-anchor', () =>
          editor.anchor(textEndForwardPoint ?? splitPoint, {
            association: 'forward',
            deletion: 'nearest',
          })
        );
        const lowestPath = splitPoint.path.slice(0, depth);
        let rightHighestPath: Path | null = null;
        let position =
          height === 0 ? splitPoint.offset : splitPoint.path[depth]!;
        let didSplitDescendant = false;

        profileCoreDuration('split-nodes-levels-loop', () => {
          for (const [node, path] of editorLevels(editor, {
            at: lowestPath,
            reverse: true,
            voids,
          })) {
            let split = false;

            if (
              path.length < highestPath.length ||
              path.length === 0 ||
              (!voids && NodeApi.isElement(node) && editorIsVoid(editor, node))
            ) {
              break;
            }

            const point = beforeAnchor.resolve()!;
            const isEnd = editorIsEnd(editor, point, path);

            if (
              (textEndForwardPoint && PathApi.equals(path, splitPoint.path)) ||
              (always &&
                (isTextStartSplit(node, splitPoint, path) ||
                  (!targetWasPath &&
                    isInlineStartSplit(editor, node, splitPoint, path))))
            ) {
              split = false;
            } else if (
              didSplitDescendant ||
              always ||
              !editorIsEdge(editor, point, path)
            ) {
              split = true;
              applyBuiltDocumentChange(editor, (builder, root) =>
                builder.splitNode(
                  root,
                  path,
                  position,
                  getSplitProperties(editor, node, path, root)
                )
              );
              didSplitDescendant = true;
              rightHighestPath = PathApi.next(path);
            }

            position = path.at(-1)! + (split || isEnd ? 1 : 0);
          }
        });

        if (options.at == null) {
          profileCoreDuration('split-nodes-select-after', () => {
            const rawResultPoint = preserveLeftPoint
              ? editorPoint(editor, highestPath, { edge: 'end' })
              : rightHighestPath
                ? ensureStartPointAfterHighestSplit(editor, rightHighestPath)
                : null;
            const representationStep =
              finalizeTransactionRepresentation(editor);
            const root = getActiveUpdateRoot(editor) ?? 'main';
            const representationBefore =
              representationStep?.indexedBefore.get(root);
            const representationAfter =
              representationStep?.indexedAfter.get(root);
            const mappedResultPoint =
              rawResultPoint &&
              representationStep &&
              representationBefore &&
              representationAfter
                ? mapCanonicalRepresentationPoint(
                    editor,
                    representationBefore,
                    representationAfter,
                    representationStep.change,
                    root,
                    rawResultPoint,
                    preserveLeftPoint ? -1 : 1
                  )
                : rawResultPoint;
            const point =
              mappedResultPoint ||
              afterAnchor?.resolve() ||
              beforeAnchor.resolve() ||
              editorPoint(editor, [], { edge: 'end' });

            select(editor, point);
          });
        }
      } finally {
        profileCoreDuration('split-nodes-release-anchors', () => {
          beforeAnchor.release();
          afterAnchor?.release();
        });
      }
    });
  });
};
