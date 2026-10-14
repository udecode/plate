import { getEditorSchema } from '../core/editor-runtime';
import {
  getCurrentSelection,
  getLiveNode,
  getLiveText,
} from '../core/public-state';
import type {
  AnyEditor as Editor,
  EditorPositionsOptions,
} from '../interfaces/editor';
import {
  above as editorAbove,
  getChildren as editorGetChildren,
  hasInlines as editorHasInlines,
  isInline as editorIsInline,
  point as editorPoint,
  range as editorRange,
} from '../interfaces/editor';
import { LocationApi } from '../interfaces/location';
import type { Descendant } from '../interfaces/node';
import { NodeApi } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import { type Range, RangeApi } from '../interfaces/range';
import { getCharacterDistance, getWordDistances } from '../utils/string';

type PositionSegment = {
  atomic?: boolean;
  groupPath: Path;
  path: Path;
  start: number;
  end: number;
  text: string;
};

type LiveTextEntry = {
  path: Path;
  text: string;
};

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

const getAtomicNonTraversablePoint = (
  editor: Editor,
  path: Path,
  voids: boolean
): { isStart: boolean; point: Point } | null => {
  if (voids) {
    return null;
  }

  const atomicEntry = editorAbove(editor, {
    at: path,
    match: (node) =>
      NodeApi.isElement(node) &&
      (getEditorSchema(editor).isAtom(node) ||
        getEditorSchema(editor).isReadOnly(node)),
    mode: 'highest',
    voids: true,
  });

  if (!atomicEntry) {
    return null;
  }

  const [, atomicPath] = atomicEntry;
  const start = editorPoint(editor, atomicPath, { edge: 'start' });

  return {
    isStart: PathApi.equals(start.path, path),
    point: start,
  };
};

const assertValidPoint = (entry: LiveTextEntry, point: Point) => {
  if (point.offset < 0 || point.offset > entry.text.length) {
    throw new Error(
      `Point offset ${
        point.offset
      } is outside text bounds for ${entry.path.join('.')}`
    );
  }
};

function* walkTextEntries(
  children: readonly Descendant[],
  parentPath: Path,
  start: Path,
  end: Path,
  reverse: boolean
): Generator<LiveTextEntry, void, undefined> {
  const depth = parentPath.length;
  const first = PathApi.isAncestor(parentPath, start) ? start[depth] : 0;
  const last = PathApi.isAncestor(parentPath, end)
    ? Math.min(end[depth], children.length - 1)
    : children.length - 1;

  for (
    let index = reverse ? last : first;
    reverse ? index >= first : index <= last;
    index += reverse ? -1 : 1
  ) {
    const node = children[index];
    const path = [...parentPath, index] as Path;

    if (NodeApi.isText(node)) {
      yield { path, text: node.text };
      continue;
    }

    yield* walkTextEntries(node.children, path, start, end, reverse);
  }
}

const getTextEntryAtPath = (
  editor: Editor,
  path: Path
): LiveTextEntry | null => {
  const node = getLiveText(editor, path);

  return node ? { path: [...path] as Path, text: node.text } : null;
};

const getTextBlockPath = (editor: Editor, path: Path): Path => {
  for (let depth = path.length - 1; depth > 0; depth--) {
    const candidatePath = path.slice(0, depth) as Path;
    const node = getLiveNode(editor, candidatePath);

    if (
      node &&
      NodeApi.isElement(node) &&
      !editorIsInline(editor, node) &&
      editorHasInlines(editor, node)
    ) {
      return candidatePath;
    }
  }

  return path[0] == null ? [] : ([path[0]] as Path);
};

const toPositionSegment = (
  editor: Editor,
  entry: LiveTextEntry,
  start: Point,
  end: Point,
  voids: boolean
): PositionSegment | null => {
  const atomicPoint = getAtomicNonTraversablePoint(editor, entry.path, voids);

  if (atomicPoint) {
    if (!atomicPoint.isStart) {
      return null;
    }

    if (
      comparePoints(atomicPoint.point, start) < 0 ||
      comparePoints(atomicPoint.point, end) > 0
    ) {
      return null;
    }

    return {
      atomic: true,
      groupPath: getTextBlockPath(editor, atomicPoint.point.path),
      path: atomicPoint.point.path,
      start: atomicPoint.point.offset,
      end: atomicPoint.point.offset,
      text: '',
    };
  }

  const comparedToStart = PathApi.compare(entry.path, start.path);
  const comparedToEnd = PathApi.compare(entry.path, end.path);

  if (comparedToStart < 0 || comparedToEnd > 0) {
    return null;
  }

  const from = comparedToStart === 0 ? start.offset : 0;
  const to = comparedToEnd === 0 ? end.offset : entry.text.length;

  return {
    groupPath: getTextBlockPath(editor, entry.path),
    path: entry.path,
    start: from,
    end: to,
    text: entry.text.slice(from, to),
  };
};

function* getPositionSegments(
  editor: Editor,
  range: Range,
  { reverse, voids }: { reverse: boolean; voids: boolean }
): Generator<PositionSegment, void, undefined> {
  const [start, end] = RangeApi.edges(range);
  const startEntry = getTextEntryAtPath(editor, start.path);
  const endEntry = getTextEntryAtPath(editor, end.path);

  if (!startEntry || !endEntry) {
    return;
  }

  assertValidPoint(startEntry, start);
  assertValidPoint(endEntry, end);

  for (const entry of walkTextEntries(
    editorGetChildren(editor),
    [],
    start.path,
    end.path,
    reverse
  )) {
    const segment = toPositionSegment(editor, entry, start, end, voids);

    if (segment && segment.end >= segment.start) {
      yield segment;
    }
  }
}

const mapLogicalOffsetToPoint = (
  segments: PositionSegment[],
  logicalOffset: number,
  boundary: 'backward' | 'forward' = 'backward'
): Point => {
  let consumed = 0;

  for (const segment of segments) {
    const { length } = segment.text;
    const end = consumed + length;

    if (logicalOffset < end) {
      return {
        path: segment.path,
        offset: segment.start + (logicalOffset - consumed),
      };
    }

    if (logicalOffset === end) {
      if (segment === segments.at(-1) || boundary === 'backward') {
        return {
          path: segment.path,
          offset: segment.end,
        };
      }

      const next = segments[segments.indexOf(segment) + 1];

      return {
        path: next.path,
        offset: next.start,
      };
    }

    consumed = end;
  }

  const last = segments.at(-1);

  if (!last) {
    throw new Error('Cannot map a logical offset without text segments');
  }

  return {
    path: last.path,
    offset: last.end,
  };
};

// A reverse walk delivers each run backward, and every position collector
// reads document order before applying `reverse` itself, so runs flip back.
function* groupPositionSegments(
  segments: Iterable<PositionSegment>,
  keyOf: (segment: PositionSegment) => Path,
  reverse: boolean
): Generator<PositionSegment[], void, undefined> {
  let group: PositionSegment[] = [];
  let key: Path | undefined;

  for (const segment of segments) {
    const segmentKey = keyOf(segment);

    if (key && !PathApi.equals(key, segmentKey)) {
      yield reverse ? group.reverse() : group;
      group = [];
    }

    key = segmentKey;
    group.push(segment);
  }

  if (group.length > 0) {
    yield reverse ? group.reverse() : group;
  }
}

const pushUniquePoint = (points: Point[], point: Point) => {
  const previous = points.at(-1);

  if (!previous || comparePoints(previous, point) !== 0) {
    points.push(point);
  }
};

const getPreviousTraversableSegment = (
  segments: PositionSegment[],
  index: number
): PositionSegment | null => {
  for (let i = index - 1; i >= 0; i--) {
    const segment = segments[i];

    if (segment && !segment.atomic) {
      return segment;
    }
  }

  return null;
};

const getNextTraversableSegment = (
  segments: PositionSegment[],
  index: number
): PositionSegment | null => {
  for (let i = index + 1; i < segments.length; i++) {
    const segment = segments[i];

    if (segment && !segment.atomic) {
      return segment;
    }
  }

  return null;
};

const collectCharacterPositions = (
  segments: PositionSegment[],
  reverse = false
): Point[] => {
  const points: Point[] = [];
  const orderedSegments = reverse ? [...segments].reverse() : segments;
  const firstSegment = orderedSegments[0];

  if (!firstSegment) {
    return points;
  }

  pushUniquePoint(points, {
    path: firstSegment.path,
    offset: reverse ? firstSegment.end : firstSegment.start,
  });

  for (const segment of orderedSegments) {
    const index = segments.indexOf(segment);

    if (segment.atomic) {
      const traversable = reverse
        ? getPreviousTraversableSegment(segments, index)
        : getNextTraversableSegment(segments, index);

      pushUniquePoint(points, {
        path: segment.path,
        offset: segment.start,
      });
      pushUniquePoint(points, {
        path: traversable?.path ?? segment.path,
        offset: traversable
          ? reverse
            ? traversable.end
            : traversable.start
          : segment.end,
      });
      continue;
    }

    if (reverse) {
      let logicalOffset = segment.text.length;

      while (logicalOffset > 0) {
        const distance = getCharacterDistance(
          segment.text.slice(0, logicalOffset),
          true
        );
        logicalOffset = Math.max(0, logicalOffset - distance);

        pushUniquePoint(points, {
          path: segment.path,
          offset: segment.start + logicalOffset,
        });
      }
      continue;
    }

    let logicalOffset = 0;

    while (logicalOffset < segment.text.length) {
      const distance = getCharacterDistance(segment.text.slice(logicalOffset));
      logicalOffset = Math.min(segment.text.length, logicalOffset + distance);

      pushUniquePoint(points, {
        path: segment.path,
        offset: segment.start + logicalOffset,
      });
    }
  }

  return points;
};

const collectBlockBoundaryPoints = (
  segments: PositionSegment[],
  reverse = false
): Point[] => {
  const points: Point[] = [];
  const groups: PositionSegment[][] = [];

  segments.forEach((segment) => {
    const group = groups.find((candidate) =>
      PathApi.equals(candidate[0]?.groupPath ?? [], segment.groupPath)
    );

    if (group) {
      group.push(segment);
      return;
    }

    groups.push([segment]);
  });

  const ordered = reverse ? [...groups].reverse() : groups;

  ordered.forEach((group) => {
    const first = group[0];
    const last = group.at(-1);

    if (!first || !last) {
      return;
    }

    const blockPoints = reverse
      ? [
          { path: last.path, offset: last.end },
          { path: first.path, offset: first.start },
        ]
      : [
          { path: first.path, offset: first.start },
          { path: last.path, offset: last.end },
        ];

    blockPoints.forEach((point) => {
      const previous = points.at(-1);

      if (!previous || comparePoints(previous, point) !== 0) {
        points.push(point);
      }
    });
  });

  return points;
};

export function* positions(
  editor: Editor,
  options: EditorPositionsOptions = {}
): Generator<Point, void, undefined> {
  const {
    at = getCurrentSelection(editor) ?? [],
    unit = 'offset',
    reverse = false,
    voids = false,
  } = options;

  if (!LocationApi.isLocation(at)) return;

  const range = editorRange(editor, at);
  const [start, end] = RangeApi.edges(range);

  if (comparePoints(start, end) === 0) {
    yield { path: [...start.path], offset: start.offset };
    return;
  }

  const segments = getPositionSegments(editor, range, { reverse, voids });

  if (unit === 'offset') {
    for (const segment of segments) {
      if (reverse) {
        for (let offset = segment.end; offset >= segment.start; offset -= 1) {
          yield { path: segment.path, offset };
        }
      } else {
        for (let offset = segment.start; offset <= segment.end; offset += 1) {
          yield { path: segment.path, offset };
        }
      }
    }

    return;
  }

  // collectBlockBoundaryPoints joins segments that share a groupPath even
  // when a nested block sits between them, and a groupPath never leaves its
  // top-level block, so line and block units group by top-level block.
  const lineUnit = unit === 'block' || unit === 'line';

  for (const group of groupPositionSegments(
    segments,
    lineUnit
      ? (segment) => segment.path.slice(0, 1)
      : (segment) => segment.groupPath,
    reverse
  )) {
    if (lineUnit) {
      yield* collectBlockBoundaryPoints(group, reverse);
      continue;
    }

    if (unit === 'character') {
      yield* collectCharacterPositions(group, reverse);
      continue;
    }

    const text = group.map((segment) => segment.text).join('');
    const logicalPositions = [reverse ? text.length : 0];
    let consumed = 0;

    for (const distance of getWordDistances(text, reverse)) {
      consumed = Math.min(text.length, consumed + distance);
      logicalPositions.push(reverse ? text.length - consumed : consumed);
    }

    const boundary = reverse ? 'forward' : 'backward';

    for (const position of logicalPositions) {
      yield mapLogicalOffsetToPoint(group, position, boundary);
    }
  }
}
