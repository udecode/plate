import type {
  Descendant,
  EditorSnapshot,
  Path,
  Point,
  ProjectedRangeSegment,
  Range,
  RuntimeId,
  Text,
} from './interfaces';

type TextEntry = {
  readonly path: Path;
  readonly runtimeId: RuntimeId;
  readonly text: string;
};

type RangeProjectionIndex = {
  readonly textEntries: readonly TextEntry[];
  readonly textIndexByPath: Readonly<Record<string, number>>;
};

const pathKey = (path: Path) => path.join('.');

const isText = (value: Descendant): value is Text =>
  typeof (value as Text).text === 'string';

const clonePath = (path: Path): Path => Object.freeze([...path]) as Path;

const comparePaths = (left: Path, right: Path): number => {
  const length = Math.min(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    if (left[index] !== right[index]) {
      return left[index]! < right[index]! ? -1 : 1;
    }
  }

  if (left.length === right.length) {
    return 0;
  }

  return left.length < right.length ? -1 : 1;
};

const comparePoints = (left: Point, right: Point): number => {
  const pathComparison = comparePaths(left.path, right.path);

  if (pathComparison !== 0) {
    return pathComparison;
  }

  if (left.offset === right.offset) {
    return 0;
  }

  return left.offset < right.offset ? -1 : 1;
};

const getRangeEdges = (range: Range): [Point, Point] =>
  comparePoints(range.anchor, range.focus) <= 0
    ? [range.anchor, range.focus]
    : [range.focus, range.anchor];

const rangeProjectionIndexCache = new WeakMap<
  EditorSnapshot,
  RangeProjectionIndex
>();

const collectTextEntries = (
  snapshot: EditorSnapshot,
  children: readonly Descendant[] = snapshot.children,
  parentPath: Path = []
): TextEntry[] => {
  const entries: TextEntry[] = [];

  children.forEach((node, index) => {
    const path = [...parentPath, index] as Path;

    if (isText(node)) {
      const runtimeId = snapshot.index.pathToId[pathKey(path)];

      if (!runtimeId) {
        throw new Error(`Missing runtime id for text path ${pathKey(path)}`);
      }

      entries.push({
        path: clonePath(path),
        runtimeId,
        text: node.text,
      });
      return;
    }

    entries.push(...collectTextEntries(snapshot, node.children, path));
  });

  return entries;
};

const getTextEntryAtPath = (
  snapshot: EditorSnapshot,
  path: Path
): TextEntry | null => {
  let current: Descendant | undefined;
  let children: readonly Descendant[] = snapshot.children;

  for (const segment of path) {
    current = children[segment];

    if (!current) {
      return null;
    }

    if (isText(current)) {
      children = [];
      continue;
    }

    children = current.children;
  }

  if (!current || !isText(current)) {
    return null;
  }

  const runtimeId = snapshot.index.pathToId[pathKey(path)];

  if (!runtimeId) {
    throw new Error(`Missing runtime id for text path ${pathKey(path)}`);
  }

  return {
    path: clonePath(path),
    runtimeId,
    text: current.text,
  };
};

const getTopLevelBlockTextEntries = (
  snapshot: EditorSnapshot,
  blockIndex: number
): readonly TextEntry[] => {
  const block = snapshot.children[blockIndex];

  if (!block) {
    return Object.freeze([]) as readonly TextEntry[];
  }

  if (isText(block)) {
    const runtimeId = snapshot.index.pathToId[pathKey([blockIndex])];

    if (!runtimeId) {
      throw new Error(`Missing runtime id for text path ${blockIndex}`);
    }

    return Object.freeze([
      {
        path: Object.freeze([blockIndex]) as Path,
        runtimeId,
        text: block.text,
      },
    ]);
  }

  return Object.freeze(
    collectTextEntries(snapshot, block.children, [blockIndex])
  );
};

const getRangeProjectionIndex = (
  snapshot: EditorSnapshot
): RangeProjectionIndex => {
  const cached = rangeProjectionIndexCache.get(snapshot);

  if (cached) {
    return cached;
  }

  const textEntries = Object.freeze(collectTextEntries(snapshot));
  const textIndexByPath = Object.freeze(
    textEntries.reduce(
      (acc, entry, index) => {
        acc[pathKey(entry.path)] = index;
        return acc;
      },
      Object.create(null) as Record<string, number>
    )
  );
  const index = Object.freeze({
    textEntries,
    textIndexByPath,
  });

  rangeProjectionIndexCache.set(snapshot, index);

  return index;
};

const assertValidPoint = (entry: TextEntry, point: Point) => {
  if (point.offset < 0 || point.offset > entry.text.length) {
    throw new Error(
      `Point offset ${point.offset} is outside text bounds for ${pathKey(entry.path)}`
    );
  }
};

export const projectRangeInSnapshot = (
  snapshot: EditorSnapshot,
  range: Range
): readonly ProjectedRangeSegment[] => {
  const [start, end] = getRangeEdges(range);

  if (comparePaths(start.path, end.path) === 0) {
    const entry = getTextEntryAtPath(snapshot, start.path);

    if (!entry) {
      throw new Error('Cannot project a range outside the committed snapshot');
    }

    assertValidPoint(entry, start);
    assertValidPoint(entry, end);

    return Object.freeze([
      Object.freeze({
        runtimeId: entry.runtimeId,
        path: entry.path,
        start: start.offset,
        end: end.offset,
      }),
    ]);
  }

  if (start.path[0] != null && start.path[0] === end.path[0]) {
    const entries = getTopLevelBlockTextEntries(snapshot, start.path[0]);
    const startEntry = entries.find(
      (entry) => comparePaths(entry.path, start.path) === 0
    );
    const endEntry = entries.find(
      (entry) => comparePaths(entry.path, end.path) === 0
    );

    if (!startEntry || !endEntry) {
      throw new Error('Cannot project a range outside the committed snapshot');
    }

    assertValidPoint(startEntry, start);
    assertValidPoint(endEntry, end);

    return Object.freeze(
      entries.flatMap<ProjectedRangeSegment>((entry) => {
        const comparedToStart = comparePaths(entry.path, start.path);
        const comparedToEnd = comparePaths(entry.path, end.path);

        if (comparedToStart < 0 || comparedToEnd > 0) {
          return [];
        }

        if (comparedToStart === 0 && comparedToEnd === 0) {
          return [
            Object.freeze({
              runtimeId: entry.runtimeId,
              path: entry.path,
              start: start.offset,
              end: end.offset,
            }),
          ];
        }

        if (comparedToStart === 0) {
          return [
            Object.freeze({
              runtimeId: entry.runtimeId,
              path: entry.path,
              start: start.offset,
              end: entry.text.length,
            }),
          ];
        }

        if (comparedToEnd === 0) {
          return [
            Object.freeze({
              runtimeId: entry.runtimeId,
              path: entry.path,
              start: 0,
              end: end.offset,
            }),
          ];
        }

        return [
          Object.freeze({
            runtimeId: entry.runtimeId,
            path: entry.path,
            start: 0,
            end: entry.text.length,
          }),
        ];
      })
    );
  }

  const index = getRangeProjectionIndex(snapshot);
  const startIndex = index.textIndexByPath[pathKey(start.path)];
  const endIndex = index.textIndexByPath[pathKey(end.path)];
  const startEntry =
    startIndex == null ? null : (index.textEntries[startIndex] ?? null);
  const endEntry =
    endIndex == null ? null : (index.textEntries[endIndex] ?? null);

  if (!startEntry || !endEntry) {
    throw new Error('Cannot project a range outside the committed snapshot');
  }

  assertValidPoint(startEntry, start);
  assertValidPoint(endEntry, end);

  const segments = index.textEntries
    .slice(startIndex, endIndex + 1)
    .flatMap<ProjectedRangeSegment>((entry) => {
      const comparedToStart = comparePaths(entry.path, start.path);
      const comparedToEnd = comparePaths(entry.path, end.path);

      if (comparedToStart < 0 || comparedToEnd > 0) {
        return [];
      }

      if (comparedToStart === 0 && comparedToEnd === 0) {
        return [
          Object.freeze({
            runtimeId: entry.runtimeId,
            path: entry.path,
            start: start.offset,
            end: end.offset,
          }),
        ];
      }

      if (comparedToStart === 0) {
        return [
          Object.freeze({
            runtimeId: entry.runtimeId,
            path: entry.path,
            start: start.offset,
            end: entry.text.length,
          }),
        ];
      }

      if (comparedToEnd === 0) {
        return [
          Object.freeze({
            runtimeId: entry.runtimeId,
            path: entry.path,
            start: 0,
            end: end.offset,
          }),
        ];
      }

      return [
        Object.freeze({
          runtimeId: entry.runtimeId,
          path: entry.path,
          start: 0,
          end: entry.text.length,
        }),
      ];
    });

  return Object.freeze(segments);
};
