import {
  getCurrentSelection,
  runEditorTransaction,
} from '../core/public-state';
import { getEditorTransformRegistry } from '../core/transform-registry';
import { node as getNode } from '../editor/node';
import { nodes as getNodes } from '../editor/nodes';
import { createInternalRangeRef } from '../editor/range-ref';
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
  pathRef as editorPathRef,
  range as editorRange,
} from '../interfaces/editor';
import type { Editor } from '../interfaces/editor';
import { type Path, PathApi } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import type { NodeMutationMethods } from '../interfaces/transforms/node';
import { matchPath } from '../utils/match-path';

const getChildren = (editor: Editor, node: Ancestor): Descendant[] =>
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
  const transforms = getEditorTransformRegistry(editor);
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
      transforms.mergeNodes({ at: path });
    }
  });
};

export const unwrapNodes: NodeMutationMethods['unwrapNodes'] = (
  editor,
  options = {}
) => {
  const unwrapNodeAtPath = (path: Path) => {
    const transforms = getEditorTransformRegistry(editor);
    const [node] = getNode(editor, path);

    if (NodeApi.isText(node)) {
      return;
    }

    const parentPath = path.slice(0, -1);
    const index = path.at(-1);

    if (index == null) {
      return;
    }

    const childCount = getChildren(editor, node).length;

    for (let moved = 0; moved < childCount; moved += 1) {
      const wrapperIndex = index + moved;

      transforms.moveNodes({
        at: [...parentPath, wrapperIndex, 0],
        to: [...parentPath, wrapperIndex],
      });
    }

    transforms.removeNodes({
      at: [...parentPath, index + childCount],
    });
  };

  runEditorTransaction(editor, (tx) => {
    let target = tx.resolveTarget({ at: options.at });
    const mode = options.mode ?? 'lowest';
    const split = options.split ?? false;
    const voids = options.voids ?? false;
    let { match } = options;

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

      const rangeRef = LocationApi.isRange(target)
        ? createInternalRangeRef(editor, target)
        : null;
      const pathRefs = Array.from(
        getNodes(editor, { at: target, match, mode, voids }),
        ([, path]) => editorPathRef(editor, path)
      ).reverse();

      for (const pathRef of pathRefs) {
        const path = pathRef.unref();

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
          getEditorTransformRegistry(editor).normalize();
          continue;
        }

        if (split && rangeRef?.current) {
          const liveRange = getCurrentSelection(editor) ?? rangeRef.current;
          const intersection = RangeApi.intersection(liveRange, range);

          if (!intersection) {
            continue;
          }

          range = intersection;
        }

        getEditorTransformRegistry(editor).liftNodes({
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
      rangeRef?.unref();
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

    getEditorTransformRegistry(editor).select({
      anchor: mapPoint(start),
      focus: mapPoint(end),
    });

    mergeAdjacentTextRuns(editor);
  });
};
