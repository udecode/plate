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

export type NodeSelection = Range &
  Readonly<{
    kind: 'node';
    path: Path;
  }>;

/** Plain serializable selection payload accepted by extension-owned kinds. */
export type SelectionValue = Range &
  Readonly<{
    affinity?: SelectionAssociation;
    kind: string;
    marks?: Readonly<Record<string, unknown>>;
    path?: Path;
  }>;

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
      hasOnlyKeys(value, ['anchor', 'focus', 'kind', 'path']) &&
      value.kind === 'node' &&
      isStrictPoint(value.anchor) &&
      isStrictPoint(value.focus) &&
      isStrictPath(value.path)
    );
  },
  isSelection(value: unknown): value is SelectionValue {
    if (!isRecord(value)) return false;

    return (
      typeof value.kind === 'string' &&
      PointApi.isPoint(value.anchor) &&
      PointApi.isPoint(value.focus) &&
      (value.affinity === undefined ||
        value.affinity === 'backward' ||
        value.affinity === 'forward') &&
      (value.marks === undefined || isMarks(value.marks)) &&
      (value.path === undefined || PathApi.isPath(value.path))
    );
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
  node(path: Path, range: Range): NodeSelection {
    return {
      ...range,
      kind: 'node',
      path: [...path],
    };
  },
  text(
    range: Range,
    options: Omit<TextSelection, keyof Range | 'kind'> = {}
  ): TextSelection {
    return { ...range, ...options, kind: 'text' };
  },
});
