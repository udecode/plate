import {
  assertDetachedSelectionSupported,
  type Descendant,
  type DocumentChange,
  type EditorDocumentValue,
  ElementApi,
  type InternalEditorSchemaApi,
  mapDetachedSelectionThroughChange,
  type Path,
  PathApi,
  type Point,
  type Range,
  RangeApi,
  readDocumentRange,
  type Selection,
  SelectionApi,
  snapshotEditorJsonValue,
  TextApi,
} from '../facade';
import type { DocumentMigrationStepResult } from './documentMigrations';

export type SnapshotSelectionInput = Selection | 'end' | 'start';

export const textAt = (children: readonly Descendant[], path: Path) => {
  let node: Descendant | undefined;
  let nodes = children;

  for (const index of path) {
    node = nodes[index];
    if (!node) return undefined;
    nodes = ElementApi.isElement(node) ? node.children : [];
  }

  return node && TextApi.isText(node) ? node : undefined;
};

export const historicalSelectionGeometry = (
  selection: Exclude<Selection, null>
): Exclude<Selection, null> => {
  if (!SelectionApi.isText(selection) || selection.marks === undefined) {
    return selection;
  }
  const { marks: _marks, ...geometry } = selection;

  return geometry;
};

export const landSelectionMarks = (
  schema: InternalEditorSchemaApi,
  selection: Selection,
  marks: Readonly<Record<string, unknown>> | undefined,
  value: EditorDocumentValue
): Selection =>
  marks === undefined || !selection || !SelectionApi.isText(selection)
    ? selection
    : Object.freeze({
        ...selection,
        marks: schema.landTextPropertiesAt(marks, {
          path: selection.focus.path,
          root: SelectionApi.root(selection) ?? 'main',
          value,
        }),
      });

export const isConcreteSelection = (
  selection: SnapshotSelectionInput | undefined
): selection is Exclude<Selection, null> =>
  selection !== undefined &&
  selection !== null &&
  selection !== 'start' &&
  selection !== 'end';

export const assertHistoricalSelection = (
  schema: InternalEditorSchemaApi,
  selection: SnapshotSelectionInput | undefined,
  document: EditorDocumentValue
) => {
  if (selection === undefined || selection === null) return;
  if (selection === 'start' || selection === 'end') return;

  assertDetachedSelectionSupported(
    schema,
    historicalSelectionGeometry(selection),
    document,
    SelectionApi.root(selection) ?? 'main'
  );
};

export const mapDetachedStepSelection = (
  schema: InternalEditorSchemaApi,
  selection: Exclude<Selection, null>,
  change: DocumentChange,
  before: EditorDocumentValue,
  after: EditorDocumentValue
): Selection => {
  const geometry = historicalSelectionGeometry(selection);
  const mapped = mapDetachedSelectionThroughChange(
    schema,
    geometry,
    change,
    before,
    after,
    SelectionApi.root(selection) ?? 'main',
    { association: 'backward', preferPositionMapping: true }
  );

  if (mapped === geometry) return selection;

  return landSelectionMarks(
    schema,
    mapped,
    SelectionApi.isText(selection) ? selection.marks : undefined,
    after
  );
};

const rangeText = (children: readonly Descendant[], range: Range) => {
  const [start, end] = RangeApi.edges(range);
  let text = '';
  const visit = (nodes: readonly Descendant[], parent: readonly number[]) => {
    const first = PathApi.isCommon(parent, start.path)
      ? (start.path[parent.length] ?? 0)
      : 0;

    for (let index = first; index < nodes.length; index += 1) {
      const node = nodes[index];
      const path = [...parent, index];

      if (PathApi.isAfter(path, end.path)) return;
      if (ElementApi.isElement(node)) {
        visit(node.children, path);
      } else if (TextApi.isText(node)) {
        text += node.text.slice(
          PathApi.equals(path, start.path) ? start.offset : 0,
          PathApi.equals(path, end.path) ? end.offset : node.text.length
        );
      }
    }
  };

  visit(children, []);

  return text;
};

const isTextPoint = (children: readonly Descendant[], point: Point) => {
  const text = textAt(children, point.path);

  return (
    text !== undefined &&
    Number.isInteger(point.offset) &&
    point.offset >= 0 &&
    point.offset <= text.text.length
  );
};

const readRange = (value: unknown, label: string): Range | null => {
  if (value === null) return null;
  const range = readDocumentRange(
    snapshotEditorJsonValue(value, label),
    'saved'
  );

  if (!range) {
    throw new Error(`${label} must be a document range or null.`);
  }

  return range;
};

const rootHolding = (document: EditorDocumentValue, range: Range) => {
  const root = SelectionApi.root(range);
  const roots = document.roots ?? {};
  const children =
    root === undefined
      ? document.children
      : Object.hasOwn(roots, root)
        ? roots[root]
        : undefined;

  return children &&
    isTextPoint(children, range.anchor) &&
    isTextPoint(children, range.focus)
    ? children
    : null;
};

export const savedRangeOrNull = (
  value: unknown,
  document: EditorDocumentValue
): Range | null => {
  const range = readDocumentRange(value, 'saved');
  const children = range && rootHolding(document, range);

  return range && children && rangeText(children, range) !== '' ? range : null;
};

export const readCoveringRange = (
  value: unknown,
  document: EditorDocumentValue,
  label: string
): Range | null => {
  const range = readRange(value, label);

  if (!range) return null;
  const children = rootHolding(document, range);

  if (!children) {
    throw new Error(
      `${label} ${JSON.stringify(range)} points outside the document.`
    );
  }

  return rangeText(children, range) === '' ? null : range;
};

export const uncrossedRange = (source: Range, range: Range | null) =>
  range &&
  RangeApi.isBackward(range) === RangeApi.isBackward(source) &&
  SelectionApi.root(range) === SelectionApi.root(source)
    ? range
    : null;

export const mapLiveRanges = <T>(
  ranges: ReadonlyArray<Range | null>,
  values: readonly T[],
  map: (range: Range, value: T | undefined) => Range | null
) => {
  let next = 0;

  return ranges.map((range) => {
    if (!range) return null;
    const value = values[next];

    next += 1;

    return map(range, value);
  });
};

export const mapStepRanges = (
  to: number,
  ranges: ReadonlyArray<Range | null>,
  mapRanges: DocumentMigrationStepResult['mapRanges'],
  change: () => DocumentChange,
  after: EditorDocumentValue
): ReadonlyArray<Range | null> => {
  const live = ranges.flatMap((range) => (range ? [range] : []));

  if (live.length === 0) return ranges;
  if (!mapRanges) return change().empty ? ranges : ranges.map(() => null);

  const mapped: unknown = mapRanges(
    Object.freeze({ ranges: Object.freeze(live) })
  );

  if (!Array.isArray(mapped) || mapped.length !== live.length) {
    throw new Error(
      `Document migration step ${to} mapRanges must return one range or null per range.`
    );
  }

  return mapLiveRanges(ranges, mapped, (range, value) =>
    uncrossedRange(
      range,
      readCoveringRange(value, after, `Document migration step ${to} range`)
    )
  );
};

const edgePoint = (
  children: readonly unknown[],
  edge: 'end' | 'start'
): Readonly<{ offset: number; path: readonly number[] }> | null => {
  const visit = (
    nodes: readonly unknown[],
    parent: readonly number[]
  ): Readonly<{ offset: number; path: readonly number[] }> | null => {
    const indexes =
      edge === 'start'
        ? nodes.map((_, index) => index)
        : nodes.map((_, index) => index).reverse();

    for (const index of indexes) {
      const node = nodes[index] as Record<string, unknown> | undefined;

      if (!node || typeof node !== 'object') continue;
      const path = [...parent, index];

      if (typeof node.text === 'string') {
        return Object.freeze({
          offset: edge === 'start' ? 0 : node.text.length,
          path: Object.freeze(path),
        });
      }
      if (ElementApi.isElement(node)) {
        const point = visit(node.children, path);

        if (point) return point;
      }
    }

    return null;
  };

  return visit(children, []);
};

export const resolveSelection = (
  selection: SnapshotSelectionInput | undefined,
  document: EditorDocumentValue
): Selection | undefined => {
  if (selection !== 'start' && selection !== 'end') return selection;
  const point = edgePoint(document.children, selection);

  return point ? SelectionApi.text({ anchor: point, focus: point }) : null;
};
