import type {
  EditorSnapshot,
  ProjectedRangeSegment,
  Range,
} from './interfaces';
import { NodeApi } from './interfaces/node';
import { PathApi } from './interfaces/path';
import { RangeApi } from './interfaces/range';

// One result bounds retained queries per immutable historical snapshot.
const lastProjection = new WeakMap<
  EditorSnapshot,
  { range: Range; segments: readonly ProjectedRangeSegment[] }
>();

export const projectRangeInSnapshot = (
  snapshot: EditorSnapshot,
  range: Range
): readonly ProjectedRangeSegment[] => {
  const cached = lastProjection.get(snapshot);
  if (cached && RangeApi.equals(cached.range, range)) return cached.segments;
  const [start, end] = RangeApi.edges(range);
  const root = { children: snapshot.children, type: '' };

  for (const point of [start, end]) {
    const node = NodeApi.getIf(root, point.path);

    if (!NodeApi.isText(node)) {
      throw new Error('Cannot project a range outside the committed snapshot');
    }
    if (point.offset < 0 || point.offset > node.text.length) {
      throw new Error(
        `Point offset ${point.offset} is outside text bounds for ${point.path.join('.')}`
      );
    }
  }

  const segments: ProjectedRangeSegment[] = [];

  for (const [node, path] of NodeApi.texts(root, {
    from: start.path,
    to: end.path,
  })) {
    const key = snapshot.index.keyAt(path);

    if (!key) {
      throw new Error(`Missing node key for text path ${path.join('.')}`);
    }

    segments.push(
      Object.freeze({
        key,
        path: Object.freeze([...path]),
        start: PathApi.equals(path, start.path) ? start.offset : 0,
        end: PathApi.equals(path, end.path) ? end.offset : node.text.length,
      })
    );
  }

  const projected = Object.freeze(segments);
  lastProjection.set(snapshot, {
    range: {
      anchor: { ...range.anchor, path: [...range.anchor.path] },
      focus: { ...range.focus, path: [...range.focus.path] },
    },
    segments: projected,
  });
  return projected;
};
