import type { NamedRootKey } from './editor';
import type { Path } from './path';
import { PathApi } from './path';
import type { Point } from './point';
import { PointApi } from './point';
import type { Range } from './range';

export type SelectionAssociation = 'backward' | 'forward';

export type TextSelection = Range &
  Readonly<{
    /** Side of the focus point that survives edits at the same position. */
    affinity?: SelectionAssociation;
    kind: 'text';
    /** Explicit properties for the next insertion at this collapsed selection. */
    marks?: Readonly<Record<string, unknown>>;
  }>;

export type NodeSelection = Readonly<{
  /** First exact selected node in the user's selection direction. */
  anchorPath: Path;
  /** Active exact selected node in the user's selection direction. */
  focusPath: Path;
  kind: 'node';
  paths: readonly [Path, ...Path[]];
  /** Named root containing every selected path. Omit for the primary root. */
  root?: NamedRootKey;
}>;

export type SelectionValue = NodeSelection | TextSelection;

export type EditorSelection = NodeSelection | TextSelection;

export type Selection<
  TSelection extends SelectionValue = SelectionValue,
> = TSelection | null;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasOnlyKeys = (
  value: Record<string, unknown>,
  keys: readonly string[]
) => {
  const keySet = new Set(keys);

  return Object.keys(value).every((key) => keySet.has(key));
};

const isStrictPath = (value: unknown): value is Path =>
  Array.isArray(value) &&
  value.every(
    (segment) => Number.isSafeInteger(segment) && (segment as number) >= 0
  );

const compareExactPaths = (left: Path, right: Path) =>
  PathApi.compare(left, right) || left.length - right.length;

const isCanonicalPaths = (
  value: unknown
): value is readonly [Path, ...Path[]] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every(isStrictPath) &&
  value.every(
    (path, index) =>
      index === 0 ||
      (compareExactPaths(value[index - 1], path) < 0 &&
        !value
          .slice(0, index)
          .some((candidate) => PathApi.isAncestor(candidate, path)))
  );

const canonicalizePaths = (
  paths: readonly [Path, ...Path[]]
): [Path, ...Path[]] => {
  if (!paths.every(isStrictPath)) {
    throw new Error('Node selection paths must be valid editor paths.');
  }

  const canonical: Path[] = [];

  for (const path of paths
    .map((candidate) => [...candidate] as Path)
    .sort(compareExactPaths)) {
    if (
      canonical.some(
        (candidate) =>
          PathApi.equals(candidate, path) || PathApi.isAncestor(candidate, path)
      )
    ) {
      continue;
    }

    canonical.push(Object.freeze(path));
  }
  const first = canonical[0];

  if (!first) {
    throw new Error('A node selection requires at least one path.');
  }

  return Object.freeze([first, ...canonical.slice(1)]) as [Path, ...Path[]];
};

type NodeSelectionOptions = Readonly<
  { root?: NamedRootKey } & (
    | { anchorPath?: never; focusPath?: never }
    | { anchorPath: Path; focusPath: Path }
  )
>;

const hasExactPath = (paths: readonly Path[], target: Path) =>
  paths.some((path) => PathApi.equals(path, target));

const isStrictPoint = (value: unknown): value is Point =>
  isRecord(value) &&
  hasOnlyKeys(value, ['offset', 'path', 'root']) &&
  Number.isSafeInteger(value.offset) &&
  (value.offset as number) >= 0 &&
  isStrictPath(value.path) &&
  (value.root === undefined || typeof value.root === 'string');

const isMarks = (value: unknown): value is Readonly<Record<string, unknown>> =>
  isRecord(value);

const equalValue = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => equalValue(value, right[index]))
    );
  }
  if (
    typeof left !== 'object' ||
    left === null ||
    typeof right !== 'object' ||
    right === null
  ) {
    return false;
  }

  const leftRecord = left as Record<string, unknown>;
  const rightRecord = right as Record<string, unknown>;
  const keys = Object.keys(leftRecord);

  return (
    keys.length === Object.keys(rightRecord).length &&
    keys.every(
      (key) =>
        Object.hasOwn(rightRecord, key) &&
        equalValue(leftRecord[key], rightRecord[key])
    )
  );
};

export const SelectionApi = Object.freeze({
  equals(left: Selection, right: Selection): boolean {
    return equalValue(left, right);
  },
  isNode(value: unknown): value is NodeSelection {
    return (
      isRecord(value) &&
      hasOnlyKeys(value, [
        'anchorPath',
        'focusPath',
        'kind',
        'paths',
        'root',
      ]) &&
      value.kind === 'node' &&
      (value.root === undefined ||
        (typeof value.root === 'string' && value.root !== 'main')) &&
      isCanonicalPaths(value.paths) &&
      isStrictPath(value.anchorPath) &&
      isStrictPath(value.focusPath) &&
      hasExactPath(value.paths, value.anchorPath) &&
      hasExactPath(value.paths, value.focusPath)
    );
  },
  isSelection(value: unknown): value is SelectionValue {
    if (!isRecord(value) || typeof value.kind !== 'string') return false;
    if (value.kind === 'node') return SelectionApi.isNode(value);
    if (value.kind === 'text') return SelectionApi.isText(value);

    return false;
  },
  isText(value: unknown): value is TextSelection {
    return (
      isRecord(value) &&
      hasOnlyKeys(value, ['affinity', 'anchor', 'focus', 'kind', 'marks']) &&
      value.kind === 'text' &&
      isStrictPoint(value.anchor) &&
      isStrictPoint(value.focus) &&
      (value.affinity === undefined ||
        value.affinity === 'backward' ||
        value.affinity === 'forward') &&
      (value.marks === undefined || isMarks(value.marks)) &&
      (value.marks === undefined || PointApi.equals(value.anchor, value.focus))
    );
  },
  nodes(
    paths: readonly [Path, ...Path[]],
    options: NodeSelectionOptions = {}
  ): NodeSelection {
    if (options.root === 'main') {
      throw new Error('[Plite] Omit root to target the primary document.');
    }

    const canonicalPaths = canonicalizePaths(paths);
    const anchorPath = options.anchorPath ?? canonicalPaths[0];
    const focusPath = options.focusPath ?? canonicalPaths.at(-1);

    if (!anchorPath || !hasExactPath(canonicalPaths, anchorPath)) {
      throw new Error(
        'Node selection anchorPath must be an exact selected path.'
      );
    }
    if (!focusPath || !hasExactPath(canonicalPaths, focusPath)) {
      throw new Error(
        'Node selection focusPath must be an exact selected path.'
      );
    }

    return Object.freeze({
      anchorPath: Object.freeze([...anchorPath]),
      focusPath: Object.freeze([...focusPath]),
      kind: 'node',
      paths: canonicalPaths,
      ...(options.root === undefined ? {} : { root: options.root }),
    });
  },
  root(selection: Range | Selection): NamedRootKey | undefined {
    if (!selection) return undefined;

    if (SelectionApi.isNode(selection)) return selection.root;

    const anchorRoot = selection.anchor.root;
    const focusRoot = selection.focus.root;

    if (anchorRoot === 'main' || focusRoot === 'main') {
      throw new Error('[Plite] Omit root to target the primary document.');
    }
    if (anchorRoot && focusRoot && anchorRoot !== focusRoot) {
      throw new Error('Cannot target multiple editor roots in one range.');
    }

    return anchorRoot ?? focusRoot;
  },
  text(
    range: Range,
    options: Omit<TextSelection, keyof Range | 'kind'> = {}
  ): TextSelection {
    return { ...range, ...options, kind: 'text' };
  },
});
