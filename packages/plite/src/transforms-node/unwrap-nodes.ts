import {
  applyBuiltDocumentChange,
  getCurrentSelection,
  runEditorTransaction,
} from '../core/public-state';
import { node as getNode } from '../editor/node';
import { nodes as getNodes } from '../editor/nodes';
import {
  type Ancestor,
  type Descendant,
  LocationApi,
  NodeApi,
  RangeApi,
} from '../interfaces';
import {
  getChildren as editorGetChildren,
  hasPath as editorHasPath,
  isBlock as editorIsBlock,
  range as editorRange,
} from '../interfaces/editor';
import type { AnyEditor as Editor } from '../interfaces/editor';
import { type Path, PathApi } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import type {
  NodeMutationMethods,
  NodeUnwrapNodesOptions,
} from '../interfaces/transforms/node';
import { select } from '../transforms-selection/select';
import { matchPath } from '../utils/match-path';
import { normalizeNodeMatch } from '../utils/node-match';
import { liftNodes } from './lift-nodes';
import { mergeNodes } from './merge-nodes';

const getChildren = (editor: Editor, node: Ancestor): readonly Descendant[] =>
  NodeApi.isEditor(node) ? editorGetChildren(editor) : node.children;

const comparePoints = (left: Point, right: Point) => {
  const pathComparison = PathApi.compare(left.path, right.path);

  if (pathComparison !== 0) {
    return pathComparison;
  }

  if (left.offset === right.offset) {
    return 0;
  }

  return left.offset < right.offset ? -1 : 1;
};

const mergeAdjacentTextRuns = (editor: Editor) => {
  const textPaths = Array.from(
    getNodes(editor, {
      at: [],
      reverse: true,
      match: (node) => NodeApi.isText(node),
      voids: true,
    }),
    ([, path]) => path
  );

  textPaths.forEach((path) => {
    if (
      !editorHasPath(editor, path) ||
      path.length === 0 ||
      path.at(-1) === 0
    ) {
      return;
    }

    const previousPath = PathApi.previous(path);

    if (!editorHasPath(editor, previousPath)) {
      return;
    }

    const [node] = getNode(editor, path);
    const [previous] = getNode(editor, previousPath);

    if (
      NodeApi.isText(node) &&
      NodeApi.isText(previous) &&
      JSON.stringify(NodeApi.extractProps(node)) ===
        JSON.stringify(NodeApi.extractProps(previous))
    ) {
      mergeNodes(editor, { at: path });
    }
  });
};

export const unwrapNodes = ((
  editor: Editor,
  options: NodeUnwrapNodesOptions = {}
) => {
  const unwrapNodeAtPath = (path: Path) => {
    const [node] = getNode(editor, path);

    if (NodeApi.isText(node)) {
      return;
    }

    const parentPath = path.slice(0, -1);
    const index = path.at(-1);

    if (index == null) {
      return;
    }

    const children = getChildren(editor, node);

    applyBuiltDocumentChange(
      editor,
      (builder, root) =>
        builder.replaceChildren(root, parentPath, index, 1, children),
      {
        nodeKeyTransfers: children.map((child, offset) => ({
          path: [...parentPath, index + offset],
          source: child,
        })),
      }
    );
  };

  runEditorTransaction(editor, (tx) => {
    let target = tx.resolveTarget({ at: options.at });
    const mode = options.mode ?? 'lowest';
    const split = options.split ?? false;
    const voids = options.voids ?? false;
    let match = normalizeNodeMatch(options.type, options.match);

    if (!target) {
      return;
    }

    const wantsGenericBehavior =
      match != null || mode !== 'lowest' || split || voids;

    if (wantsGenericBehavior) {
      if (match == null) {
        match = LocationApi.isPath(target)
          ? matchPath(editor, target)
          : (node) => NodeApi.isElement(node) && editorIsBlock(editor, node);
      }

      if (LocationApi.isPath(target)) {
        target = editorRange(editor, target);
      }

      const rangeAnchor = LocationApi.isRange(target)
        ? editor.anchor(target, {
            association: 'inward',
            deletion: 'nearest',
          })
        : null;
      const pathAnchors = Array.from(
        getNodes(editor, { at: target, match, mode, voids }),
        ([, path]) =>
          editor.anchor(path, {
            association: 'forward',
            deletion: 'drop',
          })
      ).reverse();

      for (const pathAnchor of pathAnchors) {
        const path = pathAnchor.release();

        if (!path) {
          continue;
        }

        const [node] = getNode(editor, path);
        let range = editorRange(editor, path);

        if (
          !split &&
          !NodeApi.isText(node) &&
          getChildren(editor, node).some(NodeApi.isText)
        ) {
          unwrapNodeAtPath(path);
          continue;
        }

        const anchoredRange = rangeAnchor?.resolve();

        if (split && anchoredRange) {
          const liveRange = getCurrentSelection(editor) ?? anchoredRange;
          const intersection = RangeApi.intersection(liveRange, range);

          if (!intersection) {
            continue;
          }

          range = intersection;
        }

        liftNodes(editor, {
          at: range,
          match: (candidate, candidatePath) =>
            !NodeApi.isText(node) &&
            !NodeApi.isText(candidate) &&
            candidatePath.length === path.length + 1 &&
            PathApi.equals(candidatePath.slice(0, -1), path),
          voids,
        });
      }

      mergeAdjacentTextRuns(editor);
      rangeAnchor?.release();
      return;
    }

    if (Array.isArray(target)) {
      unwrapNodeAtPath(target);
      return;
    }

    if (!LocationApi.isRange(target)) {
      return;
    }

    const [start, end] =
      comparePoints(target.anchor, target.focus) <= 0
        ? [target.anchor, target.focus]
        : [target.focus, target.anchor];

    if (start.path.length < 2 || end.path.length < 2) {
      return;
    }

    const startWrapperPath = start.path.slice(0, -2);
    const endWrapperPath = end.path.slice(0, -2);

    if (startWrapperPath.length !== 1 || endWrapperPath.length !== 1) {
      return;
    }

    const startWrapperIndex = startWrapperPath[0]!;
    const endWrapperIndex = endWrapperPath[0]!;
    const wrapperChildCounts: number[] = [];

    for (
      let wrapperIndex = startWrapperIndex;
      wrapperIndex <= endWrapperIndex;
      wrapperIndex += 1
    ) {
      const [wrapperNode] = getNode(editor, [wrapperIndex]);

      if (
        NodeApi.isText(wrapperNode) ||
        getChildren(editor, wrapperNode).some((child) => NodeApi.isText(child))
      ) {
        return;
      }

      wrapperChildCounts.push(getChildren(editor, wrapperNode).length);
    }

    for (
      let wrapperIndex = endWrapperIndex;
      wrapperIndex >= startWrapperIndex;
      wrapperIndex -= 1
    ) {
      unwrapNodeAtPath([wrapperIndex]);
    }

    const mapPoint = (point: Point) => ({
      path: [
        startWrapperIndex +
          wrapperChildCounts
            .slice(0, point.path[0]! - startWrapperIndex)
            .reduce((total, count) => total + count, 0) +
          point.path[1]!,
        ...point.path.slice(2),
      ],
      offset: point.offset,
    });

    select(editor, {
      anchor: mapPoint(start),
      focus: mapPoint(end),
    });

    mergeAdjacentTextRuns(editor);
  });
}) as NodeMutationMethods['unwrapNodes'];
