import { getEditorSchema } from '../core/editor-runtime';
import {
  applyBuiltDocumentChange,
  runEditorTransaction,
} from '../core/public-state';
import { nodes as getNodes } from '../editor/nodes';
import { LocationApi, NodeApi, type Point, RangeApi } from '../interfaces';
import {
  above as editorAbove,
  after as editorAfter,
  before as editorBefore,
  isBlock as editorIsBlock,
  isEdge as editorIsEdge,
  leaf as editorLeaf,
  range as editorRange,
} from '../interfaces/editor';
import { PathApi } from '../interfaces/path';
import type { NodeMutationMethods } from '../interfaces/transforms/node';
import { select } from '../transforms-selection/select';
import { matchPath } from '../utils/match-path';
import { insertNodes } from './insert-nodes';
import { moveNodes } from './move-nodes';
import { splitNodes } from './split-nodes';

export const wrapNodes: NodeMutationMethods['wrapNodes'] = (
  editor,
  element,
  options = {}
) => {
  runEditorTransaction(editor, (tx) => {
    let target = tx.resolveTarget({ at: options.at });
    const mode = options.mode ?? 'lowest';
    const split = options.split ?? false;
    const voids = options.voids ?? false;
    let { match } = options;
    const wrapper = {
      ...element,
      children: [],
    };

    if (!target) {
      return;
    }

    if (match == null) {
      if (LocationApi.isPath(target)) {
        match = matchPath(editor, target);
      } else if (getEditorSchema(editor).isInline(element)) {
        match = (node) =>
          (NodeApi.isElement(node) && getEditorSchema(editor).isInline(node)) ||
          NodeApi.isText(node);
      } else {
        match = (node) =>
          NodeApi.isElement(node) && editorIsBlock(editor, node);
      }
    }

    if (LocationApi.isPath(target) && options.match == null && !split) {
      if (target.length === 0) return;

      const node = NodeApi.get(editor, target);
      const parentPath = PathApi.parent(target);
      const index = target.at(-1)!;

      applyBuiltDocumentChange(editor, (builder, root) =>
        builder.replaceChildren(root, parentPath, index, 1, [
          { ...wrapper, children: [node] },
        ])
      );
      return;
    }

    if (split && LocationApi.isRange(target)) {
      const [start, end] = RangeApi.edges(target);
      const rangeAnchor = editor.anchor(target, {
        association: 'inward',
        deletion: 'nearest',
      });
      const isAtBlockEdge = (point: Point) => {
        const blockAbove = editorAbove(editor, {
          at: point,
          match: (node) =>
            NodeApi.isElement(node) && editorIsBlock(editor, node),
        });

        return blockAbove && editorIsEdge(editor, point, blockAbove[1]);
      };
      const shouldAlwaysSplit = (point: Point) => !isAtBlockEdge(point);

      splitNodes(editor, {
        at: end,
        match,
        voids,
        always: shouldAlwaysSplit(end),
      });

      splitNodes(editor, {
        at: start,
        match,
        voids,
        always: shouldAlwaysSplit(start),
      });

      target = rangeAnchor.release() ?? target;

      if (LocationApi.isRange(target)) {
        let [nextStart, nextEnd] = RangeApi.edges(target);
        const [startLeaf] = editorLeaf(editor, nextStart);
        const [endLeaf] = editorLeaf(editor, nextEnd);

        if (
          NodeApi.isText(startLeaf) &&
          nextStart.offset === startLeaf.text.length
        ) {
          nextStart =
            editorAfter(editor, nextStart, {
              distance: 1,
              unit: 'offset',
            }) ?? nextStart;
        }

        if (NodeApi.isText(endLeaf) && nextEnd.offset === 0) {
          nextEnd =
            editorBefore(editor, nextEnd, {
              distance: 1,
              unit: 'offset',
            }) ?? nextEnd;
        }

        target = { anchor: nextStart, focus: nextEnd };
      }

      if (options.at == null) {
        select(editor, target);
      }
    }

    const roots = Array.from(
      getNodes(editor, {
        at: target,
        match: getEditorSchema(editor).isInline(element)
          ? (node) => NodeApi.isElement(node) && editorIsBlock(editor, node)
          : (node) => NodeApi.isEditor(node),
        mode: 'lowest',
        voids,
      })
    );
    let nextSelection = LocationApi.isRange(target)
      ? {
          anchor: target.anchor,
          focus: target.focus,
        }
      : null;

    for (const [, rootPath] of roots) {
      const scopedTarget = LocationApi.isRange(target)
        ? RangeApi.intersection(target, editorRange(editor, rootPath))
        : target;

      if (!scopedTarget) {
        continue;
      }

      const matches = Array.from(
        getNodes(editor, { at: scopedTarget, match, mode, voids })
      );

      if (matches.length === 0) {
        continue;
      }

      const [first] = matches;
      const last = matches.at(-1)!;
      const [, firstPath] = first;
      const [, lastPath] = last;

      if (firstPath.length === 0 && lastPath.length === 0) {
        continue;
      }

      const commonPath = PathApi.equals(firstPath, lastPath)
        ? PathApi.parent(firstPath)
        : PathApi.common(firstPath, lastPath);
      const depth = commonPath.length + 1;
      const wrapperPath = PathApi.next(lastPath.slice(0, depth));
      const firstChildIndex = firstPath[commonPath.length]!;
      const lastChildIndex = lastPath[commonPath.length]!;
      const movePaths = Array.from(
        { length: lastChildIndex - firstChildIndex + 1 },
        (_, offset) => [...commonPath, firstChildIndex + offset]
      );
      const pathAnchors = movePaths.map((path) =>
        editor.anchor(path, {
          association: 'forward',
          deletion: 'drop',
        })
      );

      insertNodes(editor, { ...wrapper }, { at: wrapperPath, voids });
      const wrapperAnchor = editor.anchor(wrapperPath, {
        association: 'forward',
        deletion: 'drop',
      });

      try {
        pathAnchors.forEach((pathAnchor, index) => {
          const path = pathAnchor.resolve();
          const currentWrapperPath = wrapperAnchor.resolve();

          if (!path || !currentWrapperPath) {
            return;
          }

          moveNodes(editor, {
            at: path,
            to: currentWrapperPath.concat(index),
          });
        });

        const currentWrapperPath = wrapperAnchor.resolve();

        if (nextSelection && currentWrapperPath) {
          const mapPoint = (point: Point) => {
            const matchIndex = movePaths.findIndex((path) =>
              PathApi.equals(path, point.path.slice(0, path.length))
            );

            if (matchIndex < 0) {
              return point;
            }

            const basePath = movePaths[matchIndex]!;

            return {
              path: [
                ...currentWrapperPath,
                matchIndex,
                ...point.path.slice(basePath.length),
              ],
              offset: point.offset,
            };
          };

          nextSelection = {
            anchor: mapPoint(nextSelection.anchor),
            focus: mapPoint(nextSelection.focus),
          };
        }
      } finally {
        wrapperAnchor.release();
        for (const pathAnchor of pathAnchors) {
          pathAnchor.release();
        }
      }
    }

    if (nextSelection) {
      select(editor, nextSelection);
    }
  });
};
