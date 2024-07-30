import { Editor, type Location, Path, Point, Range } from 'slate';

import type { TNodeEntry } from '../node/TNodeEntry';
import type { TEditor } from './TEditor';

import { mergeNodes } from '../transforms/mergeNodes';
import { removeNodes } from '../transforms/removeNodes';
import { select } from '../transforms/select';
import { createPathRef } from './createPathRef';
import { createPointRef } from './createPointRef';
import { getAboveNode } from './getAboveNode';
import { getEndPoint } from './getEndPoint';
import { getLeafNode } from './getLeafNode';
import { getNodeEntries } from './getNodeEntries';
import { getPointAfter } from './getPointAfter';
import { getPointBefore } from './getPointBefore';
import { getStartPoint } from './getStartPoint';
import { getVoidNode } from './getVoidNode';
import { isBlock } from './isBlock';
import { isVoid } from './isVoid';
import { withoutNormalizing } from './withoutNormalizing';

export const deleteMerge = (
  editor: TEditor,
  options: {
    at?: Location;
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
    let { at = editor.selection, hanging = false } = options;

    if (!at) {
      return;
    }
    if (Range.isRange(at) && Range.isCollapsed(at)) {
      at = at.anchor;
    }
    if (Point.isPoint(at)) {
      const furthestVoid = getVoidNode(editor as any, { at, mode: 'highest' });

      if (!voids && furthestVoid) {
        const [, voidPath] = furthestVoid;
        at = voidPath;
      } else {
        const opts = { distance, unit };
        const target = reverse
          ? getPointBefore(editor as any, at, opts) ||
            getStartPoint(editor as any, [])
          : getPointAfter(editor as any, at, opts) ||
            getEndPoint(editor as any, []);
        at = { anchor: at, focus: target };
        hanging = true;
      }
    }
    if (Path.isPath(at)) {
      removeNodes(editor, { at, voids });

      return;
    }
    if (Range.isCollapsed(at)) {
      return;
    }
    if (!hanging) {
      at = Editor.unhangRange(editor as any, at, { voids });
    }

    let [start, end] = Range.edges(at);
    const startBlock = getAboveNode(editor, {
      at: start,
      match: (n) => isBlock(editor as any, n),
      voids,
    });
    const endBlock = getAboveNode(editor, {
      at: end,
      match: (n) => isBlock(editor as any, n),
      voids,
    });
    const isAcrossBlocks =
      startBlock && endBlock && !Path.equals(startBlock[1], endBlock[1]);
    const isSingleText = Path.equals(start.path, end.path);
    const startVoid = voids
      ? null
      : getVoidNode(editor as any, { at: start, mode: 'highest' });
    const endVoid = voids
      ? null
      : getVoidNode(editor as any, { at: end, mode: 'highest' });

    // If the start or end points are inside an inline void, nudge them out.
    if (startVoid) {
      const before = getPointBefore(editor as any, start);

      if (before && startBlock && Path.isAncestor(startBlock[1], before.path)) {
        start = before;
      }
    }
    if (endVoid) {
      const after = getPointAfter(editor as any, end);

      if (after && endBlock && Path.isAncestor(endBlock[1], after.path)) {
        end = after;
      }
    }

    // Get the highest nodes that are completely inside the range, as well as
    // the start and end nodes.
    const matches: TNodeEntry[] = [];
    let lastPath: Path | undefined;

    const _nodes = getNodeEntries(editor as any, { at, voids });

    for (const entry of _nodes) {
      const [node, path] = entry;

      if (lastPath && Path.compare(path, lastPath) === 0) {
        continue;
      }
      if (
        (!voids && isVoid(editor as any, node)) ||
        (!Path.isCommon(path, start.path) && !Path.isCommon(path, end.path))
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
      const [node] = getLeafNode(editor as any, point);
      const { path } = point;
      const { offset } = start;
      const text = node.text.slice(offset);
      editor.apply({ offset, path, text, type: 'remove_text' });
    }

    for (const pathRef of pathRefs) {
      const path = pathRef.unref()!;
      removeNodes(editor, { at: path, voids });
    }

    if (!endVoid) {
      const point = endRef.current!;
      const [node] = getLeafNode(editor as any, point);
      const { path } = point;
      const offset = isSingleText ? start.offset : 0;
      const text = node.text.slice(offset, end.offset);
      editor.apply({ offset, path, text, type: 'remove_text' });
    }
    if (!isSingleText && isAcrossBlocks && endRef.current && startRef.current) {
      // DIFF: allow custom mergeNodes
      mergeNodes(editor as any, {
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
