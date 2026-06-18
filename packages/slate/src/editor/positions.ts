import { getEditorSchema } from '../core/editor-runtime';
import {
  getCurrentSelection,
  getLiveNode,
  getLiveText,
} from '../core/public-state';
import { Editor, type EditorPositionsOptions } from '../interfaces/editor';
import type { Descendant } from '../interfaces/node';
import { NodeApi } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import { type Range, RangeApi } from '../interfaces/range';
import { getCharacterDistance, getWordDistance } from '../utils/string';

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

  const atomicEntry = Editor.above(editor, {
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
  const start = Editor.point(editor, atomicPath, { edge: 'start' });

  return {
    isStart: PathApi.equals(start.path, path),
    point: start,
  };
};

const assertValidPoint = (entry: LiveTextEntry, point: Point) => {
  if (point.offset < 0 || point.offset > entry.text.length) {
    throw new Error(
      `Point offset ${point.offset} is outside text bounds for ${entry.path.join(
        '.'
      )}`
    );
  }
};

const collectTextEntries = (
  nodes: readonly Descendant[],
  parentPath: Path = []
): LiveTextEntry[] => {
  const entries: LiveTextEntry[] = [];

  nodes.forEach((node, index) => {
    const path = [...parentPath, index] as Path;

    if (NodeApi.isText(node)) {
      entries.push({ path, text: node.text });
      return;
    }

    entries.push(...collectTextEntries(node.children, path));
  });

  return entries;
};

const getTextEntriesForTopLevel = (
  editor: Editor,
  blockIndex: number
): LiveTextEntry[] => {
  const node = getLiveNode(editor, [blockIndex]);

  if (!node) {
    return [];
  }

  if (NodeApi.isText(node)) {
    return [{ path: [blockIndex] as Path, text: node.text }];
  }

  if (!NodeApi.isElement(node)) {
    return [];
  }

  return collectTextEntries(node.children, [blockIndex]);
};

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
      !Editor.isInline(editor, node) &&
      Editor.hasInlines(editor, node)
    ) {
      return candidatePath;
    }
  }

  return path[0] == null ? [] : ([path[0]] as Path);
};

const getLiveTextEntriesInRange = (
  editor: Editor,
  range: Range
): LiveTextEntry[] => {
  const [start, end] = RangeApi.edges(range);

  if (PathApi.compare(start.path, end.path) === 0) {
    const entry = getTextEntryAtPath(editor, start.path);

    if (!entry) {
      return [];
    }

    assertValidPoint(entry, start);
    assertValidPoint(entry, end);
    return [entry];
  }

  if (start.path[0] != null && start.path[0] === end.path[0]) {
    return getTextEntriesForTopLevel(editor, start.path[0]);
  }

  return collectTextEntries(Editor.getChildren(editor));
};

const getPositionSegments = (
  editor: Editor,
  range: Range,
  options: { voids?: boolean } = {}
): PositionSegment[] => {
  const { voids = false } = options;
  const [start, end] = RangeApi.edges(range);
  const entries = getLiveTextEntriesInRange(editor, range);
  const startEntry = entries.find(
    (entry) => PathApi.compare(entry.path, start.path) === 0
  );
  const endEntry = entries.find(
    (entry) => PathApi.compare(entry.path, end.path) === 0
  );

  if (!startEntry || !endEntry) {
    return [];
  }

  assertValidPoint(startEntry, start);
  assertValidPoint(endEntry, end);

  return entries.flatMap<PositionSegment>((entry) => {
    const atomicPoint = getAtomicNonTraversablePoint(editor, entry.path, voids);

    if (atomicPoint) {
      if (!atomicPoint.isStart) {
        return [];
      }

      if (
        comparePoints(atomicPoint.point, start) < 0 ||
        comparePoints(atomicPoint.point, end) > 0
      ) {
        return [];
      }

      return [
        {
          atomic: true,
          groupPath: getTextBlockPath(editor, atomicPoint.point.path),
          path: atomicPoint.point.path,
          start: atomicPoint.point.offset,
          end: atomicPoint.point.offset,
          text: '',
        },
      ];
    }

    const comparedToStart = PathApi.compare(entry.path, start.path);
    const comparedToEnd = PathApi.compare(entry.path, end.path);

    if (comparedToStart < 0 || comparedToEnd > 0) {
      return [];
    }

    if (comparedToStart === 0 && comparedToEnd === 0) {
      return [
        {
          groupPath: getTextBlockPath(editor, entry.path),
          path: entry.path,
          start: start.offset,
          end: end.offset,
          text: entry.text.slice(start.offset, end.offset),
        },
      ];
    }

    if (comparedToStart === 0) {
      return [
        {
          groupPath: getTextBlockPath(editor, entry.path),
          path: entry.path,
          start: start.offset,
          end: entry.text.length,
          text: entry.text.slice(start.offset),
        },
      ];
    }

    if (comparedToEnd === 0) {
      return [
        {
          groupPath: getTextBlockPath(editor, entry.path),
          path: entry.path,
          start: 0,
          end: end.offset,
          text: entry.text.slice(0, end.offset),
        },
      ];
    }

    return [
      {
        groupPath: getTextBlockPath(editor, entry.path),
        path: entry.path,
        start: 0,
        end: entry.text.length,
        text: entry.text,
      },
    ];
  });
};

const mapLogicalOffsetToPoint = (
  segments: PositionSegment[],
  logicalOffset: number,
  boundary: 'backward' | 'forward' = 'backward'
): Point => {
  let consumed = 0;

  for (const segment of segments) {
    const length = segment.text.length;
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

      const next = segments[segments.indexOf(segment) + 1]!;

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

const groupPositionSegmentsByBlock = (segments: PositionSegment[]) => {
  const groups: PositionSegment[][] = [];

  for (const segment of segments) {
    const lastGroup = groups.at(-1);

    if (
      !lastGroup ||
      !PathApi.equals(lastGroup[0]?.groupPath ?? [], segment.groupPath)
    ) {
      groups.push([segment]);
      continue;
    }

    lastGroup.push(segment);
  }

  return groups;
};

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

  const range = Editor.range(editor, at);
  const [start, end] = RangeApi.edges(range);

  if (comparePoints(start, end) === 0) {
    yield { path: [...start.path], offset: start.offset };
    return;
  }

  const segments = getPositionSegments(editor, range, { voids }).filter(
    (segment) => segment.end >= segment.start
  );

  if (segments.length === 0) {
    return;
  }

  if (unit === 'block' || unit === 'line') {
    yield* collectBlockBoundaryPoints(segments, reverse);
    return;
  }

  if (unit === 'offset') {
    const orderedSegments = reverse ? [...segments].reverse() : segments;

    for (const segment of orderedSegments) {
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

  if (unit === 'character') {
    const orderedGroups = reverse
      ? groupPositionSegmentsByBlock(segments).reverse()
      : groupPositionSegmentsByBlock(segments);

    for (const group of orderedGroups) {
      yield* collectCharacterPositions(group, reverse);
    }

    return;
  }

  const orderedGroups = reverse
    ? groupPositionSegmentsByBlock(segments).reverse()
    : groupPositionSegmentsByBlock(segments);

  for (const group of orderedGroups) {
    const text = group.map((segment) => segment.text).join('');
    const logicalPositions = [reverse ? text.length : 0];
    let consumed = 0;

    while (consumed < text.length) {
      const remaining = reverse
        ? text.slice(0, text.length - consumed)
        : text.slice(consumed);
      const distance = getWordDistance(remaining, reverse);

      consumed = Math.min(text.length, consumed + distance);
      logicalPositions.push(reverse ? text.length - consumed : consumed);
    }

    const boundary = reverse ? 'forward' : 'backward';

    for (const position of logicalPositions) {
      yield mapLogicalOffsetToPoint(group, position, boundary);
    }
  }
}
