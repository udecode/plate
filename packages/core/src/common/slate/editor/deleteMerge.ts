import {
  Editor,
  Location,
  NodeEntry,
  Path,
  Point,
  Range,
  Transforms,
} from 'slate';
import { TEditor, Value } from '../../../types/slate/TEditor';
import { mergeNodes } from '../transforms/mergeNodes';

export const deleteMerge = <V extends Value>(
  editor: TEditor<V>,
  options: {
    at?: Location;
    distance?: number;
    unit?: 'character' | 'word' | 'line' | 'block';
    reverse?: boolean;
    hanging?: boolean;
    voids?: boolean;
    test?: any;
  } = {}
): void => {
  Editor.withoutNormalizing(editor as any, () => {
    const {
      reverse = false,
      unit = 'character',
      distance = 1,
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
      const furthestVoid = Editor.void(editor as any, { at, mode: 'highest' });

      if (!voids && furthestVoid) {
        const [, voidPath] = furthestVoid;
        at = voidPath;
      } else {
        const opts = { unit, distance };
        const target = reverse
          ? Editor.before(editor as any, at, opts) ||
            Editor.start(editor as any, [])
          : Editor.after(editor as any, at, opts) ||
            Editor.end(editor as any, []);
        at = { anchor: at, focus: target };
        hanging = true;
      }
    }

    if (Path.isPath(at)) {
      Transforms.removeNodes(editor as any, { at, voids });
      return;
    }

    if (Range.isCollapsed(at)) {
      return;
    }

    if (!hanging) {
      at = Editor.unhangRange(editor as any, at, { voids });
    }

    let [start, end] = Range.edges(at);
    const startBlock = Editor.above(editor as any, {
      match: (n) => Editor.isBlock(editor as any, n),
      at: start,
      voids,
    });
    const endBlock = Editor.above(editor as any, {
      match: (n) => Editor.isBlock(editor as any, n),
      at: end,
      voids,
    });
    const isAcrossBlocks =
      startBlock && endBlock && !Path.equals(startBlock[1], endBlock[1]);
    const isSingleText = Path.equals(start.path, end.path);
    const startVoid = voids
      ? null
      : Editor.void(editor as any, { at: start, mode: 'highest' });
    const endVoid = voids
      ? null
      : Editor.void(editor as any, { at: end, mode: 'highest' });

    // If the start or end points are inside an inline void, nudge them out.
    if (startVoid) {
      const before = Editor.before(editor as any, start);

      if (before && startBlock && Path.isAncestor(startBlock[1], before.path)) {
        start = before;
      }
    }

    if (endVoid) {
      const after = Editor.after(editor as any, end);

      if (after && endBlock && Path.isAncestor(endBlock[1], after.path)) {
        end = after;
      }
    }

    // Get the highest nodes that are completely inside the range, as well as
    // the start and end nodes.
    const matches: NodeEntry[] = [];
    let lastPath: Path | undefined;

    const _nodes = Editor.nodes(editor as any, { at, voids });
    for (const entry of _nodes) {
      const [node, path] = entry;

      if (lastPath && Path.compare(path, lastPath) === 0) {
        continue;
      }

      if (
        (!voids && Editor.isVoid(editor as any, node)) ||
        (!Path.isCommon(path, start.path) && !Path.isCommon(path, end.path))
      ) {
        matches.push(entry);
        lastPath = path;
      }
    }

    const pathRefs = Array.from(matches, ([, p]) =>
      Editor.pathRef(editor as any, p)
    );
    const startRef = Editor.pointRef(editor as any, start);
    const endRef = Editor.pointRef(editor as any, end);

    if (!isSingleText && !startVoid) {
      const point = startRef.current!;
      const [node] = Editor.leaf(editor as any, point);
      const { path } = point;
      const { offset } = start;
      const text = node.text.slice(offset);
      editor.apply({ type: 'remove_text', path, offset, text });
    }

    for (const pathRef of pathRefs) {
      const path = pathRef.unref()!;
      Transforms.removeNodes(editor as any, { at: path, voids });
    }

    if (!endVoid) {
      const point = endRef.current!;
      const [node] = Editor.leaf(editor as any, point);
      const { path } = point;
      const offset = isSingleText ? start.offset : 0;
      const text = node.text.slice(offset, end.offset);
      editor.apply({ type: 'remove_text', path, offset, text });
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
      Transforms.select(editor as any, point);
    }
  });
};
