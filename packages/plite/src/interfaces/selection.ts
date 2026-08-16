import type { Path } from './path';
import { PathApi } from './path';
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

export type Selection<TSelection extends SelectionValue = SelectionValue> =
  TSelection | null;

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
      SelectionApi.isSelection(value) &&
      value.kind === 'node' &&
      PathApi.isPath((value as { path?: unknown }).path)
    );
  },
  isSelection(value: unknown): value is SelectionValue {
    return (
      typeof value === 'object' &&
      value !== null &&
      typeof (value as { kind?: unknown }).kind === 'string' &&
      PointApi.isPoint((value as { anchor?: unknown }).anchor) &&
      PointApi.isPoint((value as { focus?: unknown }).focus)
    );
  },
  isText(value: unknown): value is TextSelection {
    return SelectionApi.isSelection(value) && value.kind === 'text';
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
