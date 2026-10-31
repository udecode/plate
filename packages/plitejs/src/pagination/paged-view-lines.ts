import { type Path, PathApi, type Point, PointApi, RangeApi } from '..';
import type { PageLayoutFragment, PageLayoutSnapshot } from './index';

type TextFragment = Extract<PageLayoutFragment, { type: 'text' }>;
type TextLine = TextFragment['lines'][number];
type LineEntry = Readonly<{ fragment: TextFragment; line: TextLine }>;

export type PagedLineTarget = Readonly<
  | { drawn: boolean; end: Point; kind: 'line'; path: Path; start: Point }
  | { drawn: boolean; kind: 'block'; path: Path }
>;

export const isNativeFlowBlock = (
  path: Path,
  drawnTextFragments: number,
  selectedPaths: readonly Path[]
) =>
  drawnTextFragments === 1 &&
  selectedPaths.some((selected) => PathApi.isCommon(path, selected));

const FRAGMENTS_BY_PATH = new WeakMap<
  PageLayoutSnapshot,
  ReadonlyMap<string, readonly number[]>
>();

const readFragmentsByPath = (snapshot: PageLayoutSnapshot) => {
  const cached = FRAGMENTS_BY_PATH.get(snapshot);

  if (cached) return cached;
  const index = new Map<string, number[]>();
  const add = (path: Path, fragmentIndex: number) => {
    const key = path.join('.');
    const indexes = index.get(key) ?? [];

    if (indexes.at(-1) !== fragmentIndex) indexes.push(fragmentIndex);
    index.set(key, indexes);
  };

  snapshot.fragments.forEach((fragment, fragmentIndex) => {
    add(fragment.path, fragmentIndex);
    if (fragment.type === 'direct-children') {
      fragment.children.forEach((child) => add(child.path, fragmentIndex));
    }
  });
  FRAGMENTS_BY_PATH.set(snapshot, index);
  return index;
};

const lineStart = (line: TextLine): Point =>
  RangeApi.start(line.runs[0]?.source ?? line.source);

const lineEnd = (line: TextLine): Point =>
  RangeApi.end(line.runs.at(-1)?.source ?? line.source);

const caretLineIndex = (
  lines: readonly LineEntry[],
  point: Point,
  upper: boolean
) => {
  const index = lines.findLastIndex(
    ({ line }) => PointApi.compare(lineStart(line), point) <= 0
  );
  const caret = lines[index];

  if (!caret) return 0;
  return upper && index > 0 && PointApi.equals(lineStart(caret.line), point)
    ? index - 1
    : index;
};

export const pagedLineTarget = ({
  direction,
  from,
  isSelectable,
  mountedPageIndexes,
  selectedPaths,
  snapshot,
}: Readonly<{
  direction: 'down' | 'up';
  from: Readonly<{ point: Point; upper: boolean }>;
  isSelectable: (path: Path) => boolean;
  mountedPageIndexes: ReadonlySet<number> | 'all';
  selectedPaths: readonly Path[];
  snapshot: PageLayoutSnapshot;
}>): PagedLineTarget | null => {
  const isDrawn = (fragment: PageLayoutFragment) =>
    mountedPageIndexes === 'all' || mountedPageIndexes.has(fragment.pageIndex);
  const toLine = ({ fragment, line }: LineEntry): PagedLineTarget => ({
    drawn: isDrawn(fragment),
    end: lineEnd(line),
    kind: 'line',
    path: fragment.path,
    start: lineStart(line),
  });
  const { fragments } = snapshot;
  const byPath = readFragmentsByPath(snapshot);
  let blockIndexes: readonly number[] | undefined;

  for (
    let depth = from.point.path.length;
    depth > 0 && !blockIndexes;
    depth--
  ) {
    blockIndexes = byPath.get(from.point.path.slice(0, depth).join('.'));
  }
  if (!blockIndexes) return null;
  const blockFragments = blockIndexes.flatMap(
    (index) => fragments[index] ?? []
  );
  const blockPath = blockFragments[0]?.path;

  if (!blockPath) return null;
  const textFragments = blockFragments.filter(
    (fragment): fragment is TextFragment =>
      fragment.type === 'text' && PathApi.equals(fragment.path, blockPath)
  );

  if (textFragments.length !== blockFragments.length) return null;
  const lines = textFragments.flatMap((fragment) =>
    fragment.lines.map((line) => ({ fragment, line }))
  );

  if (lines.length === 0) return null;
  const step = direction === 'down' ? 1 : -1;
  const caretIndex = caretLineIndex(lines, from.point, from.upper);
  const target = lines[caretIndex + step];

  if (target) {
    return target.fragment === lines[caretIndex]?.fragment &&
      isNativeFlowBlock(
        blockPath,
        textFragments.filter(isDrawn).length,
        selectedPaths
      )
      ? null
      : toLine(target);
  }
  const start = direction === 'down' ? blockIndexes.at(-1) : blockIndexes[0];

  if (start === undefined) return null;
  for (let index = start + step; fragments[index]; index += step) {
    const neighbor = fragments[index];

    if (neighbor.type === 'direct-children') return null;
    if (
      PathApi.equals(neighbor.path, blockPath) ||
      !isSelectable(neighbor.path)
    ) {
      continue;
    }
    const block: PagedLineTarget = {
      drawn: isDrawn(neighbor),
      kind: 'block',
      path: neighbor.path,
    };

    if (neighbor.type !== 'text') return block;
    const neighborLine =
      direction === 'down' ? neighbor.lines[0] : neighbor.lines.at(-1);

    return neighborLine
      ? toLine({ fragment: neighbor, line: neighborLine })
      : block;
  }
  return null;
};
