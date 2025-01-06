import { Editor as EditorInterface } from 'slate';

import type { Editor } from '../interfaces/editor/editor';
import type { NodeEntry } from '../interfaces/node-entry';

import {
  type Path,
  type TLocation,
  type TRange,
  PathApi,
  PointApi,
  RangeApi,
} from '../interfaces/index';
import { createPathRef } from '../internal/editor/createPathRef';
import { createPointRef } from '../internal/editor/createPointRef';
import { getEndPoint } from '../internal/editor/getEndPoint';
import { getLeafNode } from '../internal/editor/getLeafNode';
import { getNodeEntries } from '../internal/editor/getNodeEntries';
import { getPointAfter } from '../internal/editor/getPointAfter';
import { getPointBefore } from '../internal/editor/getPointBefore';
import { getStartPoint } from '../internal/editor/getStartPoint';
import { getVoidNode } from '../internal/editor/getVoidNode';
import { isBlock } from '../internal/editor/isBlock';
import { isVoid } from '../internal/editor/isVoid';
import { withoutNormalizing } from '../internal/editor/withoutNormalizing';
import { select } from '../internal/transforms/select';

export const deleteMerge = (
  editor: Editor,
  options: {
    at?: TLocation;
    distance?: number;
    hanging?: boolean;
    reverse?: boolean;
    test?: any;
    unit?: 'block' | 'character' | 'line' | 'word';
    voids?: boolean;
  } = {}
): void => {
  withoutNormalizing(editor as any, () => {
    const {
      distance = 1,
      reverse = false,
      unit = 'character',
      voids = false,
    } = options;
    let { at = editor.selection!, hanging = false } = options;

    if (!at) {
      return;
    }
    if (RangeApi.isRange(at) && RangeApi.isCollapsed(at)) {
      at = at.anchor;
    }
    if (PointApi.isPoint(at)) {
      const furthestVoid = getVoidNode(editor as any, { at, mode: 'highest' });

      if (!voids && furthestVoid) {
        const [, voidPath] = furthestVoid;
        at = voidPath;
      } else {
        const opts = { distance, unit };
        const target = reverse
          ? getPointBefore(editor as any, at, opts) ||
            getStartPoint(editor as any, [])!
          : getPointAfter(editor as any, at, opts) ||
            getEndPoint(editor as any, [])!;
        at = { anchor: at, focus: target };
        hanging = true;
      }
    }
    if (PathApi.isPath(at)) {
      editor.tf.removeNodes({ at, voids });

      return;
    }
    if (RangeApi.isCollapsed(at)) {
      return;
    }
    if (!hanging) {
      at = EditorInterface.unhangRange(editor as any, at, { voids });
    }

    let [start, end] = RangeApi.edges(at as TRange);
    const startBlock = editor.api.above({
      at: start,
      match: (n) => isBlock(editor as any, n),
      voids,
    });
    const endBlock = editor.api.above({
      at: end,
      match: (n) => isBlock(editor as any, n),
      voids,
    });
    const isAcrossBlocks =
      startBlock && endBlock && !PathApi.equals(startBlock[1], endBlock[1]);
    const isSingleText = PathApi.equals(start.path, end.path);
    const startVoid = voids
      ? null
      : getVoidNode(editor as any, { at: start, mode: 'highest' });
    const endVoid = voids
      ? null
      : getVoidNode(editor as any, { at: end, mode: 'highest' });

    // If the start or end points are inside an inline void, nudge them out.
    if (startVoid) {
      const before = getPointBefore(editor as any, start);

      if (
        before &&
        startBlock &&
        PathApi.isAncestor(startBlock[1], before.path)
      ) {
        start = before;
      }
    }
    if (endVoid) {
      const after = getPointAfter(editor as any, end);

      if (after && endBlock && PathApi.isAncestor(endBlock[1], after.path)) {
        end = after;
      }
    }

    // Get the highest nodes that are completely inside the range, as well as
    // the start and end nodes.
    const matches: NodeEntry[] = [];
    let lastPath: Path | undefined;

    const _nodes = getNodeEntries(editor as any, { at, voids });

    for (const entry of _nodes) {
      const [node, path] = entry;

      if (lastPath && PathApi.compare(path, lastPath) === 0) {
        continue;
      }
      if (
        (!voids && isVoid(editor as any, node)) ||
        (!PathApi.isCommon(path, start.path) &&
          !PathApi.isCommon(path, end.path))
      ) {
        matches.push(entry as any);
        lastPath = path;
      }
    }

    const pathRefs = Array.from(matches, ([, p]) =>
      createPathRef(editor as any, p)
    );
    const startRef = createPointRef(editor as any, start);
    const endRef = createPointRef(editor as any, end);

    if (!isSingleText && !startVoid) {
      const point = startRef.current!;
      const [node] = getLeafNode(editor as any, point)!;
      const { path } = point;
      const { offset } = start;
      const text = node.text.slice(offset);
      editor.apply({ offset, path, text, type: 'remove_text' });
    }

    for (const pathRef of pathRefs) {
      const path = pathRef.unref()!;
      editor.tf.removeNodes({ at: path, voids });
    }

    if (!endVoid) {
      const point = endRef.current!;
      const [node] = getLeafNode(editor as any, point)!;
      const { path } = point;
      const offset = isSingleText ? start.offset : 0;
      const text = node.text.slice(offset, end.offset);
      editor.apply({ offset, path, text, type: 'remove_text' });
    }
    if (!isSingleText && isAcrossBlocks && endRef.current && startRef.current) {
      // DIFF: allow custom mergeNodes
      editor.tf.mergeNodes({
        at: endRef.current,
        hanging: true,
        voids,
      });
    }

    const point = endRef.unref() || startRef.unref();

    if (options.at == null && point) {
      select(editor as any, point);
    }
  });
};
