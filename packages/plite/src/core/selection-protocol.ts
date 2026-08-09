import type {
  ContentSlice,
  AnyEditor as Editor,
  EditorDocumentValue,
  EditorMarks,
  EditorSelectionMapContext,
  EditorStateView,
  RootKey,
  SerializedEditorSelection,
  SnapshotIndex,
  Value,
} from '../interfaces/editor';
import { PathApi, type Path } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import type { Range } from '../interfaces/range';
import { RangeApi } from '../interfaces/range';
import {
  SelectionApi,
  type EditorSelection,
  type Selection,
} from '../interfaces/selection';

import {
  type DocumentChange,
  getInternalDocumentRootChange,
  mapInternalDocumentChangePosition,
} from './change/document-change';
import { DocumentIndex } from './change/document-index';
import type { JsonEditorValue } from './change/tokens';
import { toPublicRoot } from './public-root';
import { getEditorSchema } from './editor-runtime';
import {
  type ExtensionRegistry,
  getExtensionRegistry,
} from './extension-registry';
import { decodeVersionedValue, encodeVersionedValue } from './value-codec';
import { assertEditorJsonValue } from './value-codec';

type MappingOptions = {
  association?: 'backward' | 'forward';
  deletion?: 'drop' | 'nearest';
  preferPositionMapping?: boolean;
};

type RangeMappingOptions = Omit<MappingOptions, 'association'> & {
  association?: 'backward' | 'forward' | 'inward' | 'outward';
};

type SelectionMappingOptions = RangeMappingOptions & {
  runtimeIndexes?: Readonly<{
    after: SnapshotIndex;
    before: SnapshotIndex;
  }>;
};

type RuntimeSelectionSpec = Readonly<{
  codec?: import('../interfaces/editor').EditorValueCodec<EditorSelection>;
  kind: string;
  map?: (
    selection: EditorSelection,
    context: EditorSelectionMapContext
  ) => Selection;
  marks?: (...args: any[]) => any;
  primaryRange?: (selection: EditorSelection) => Range | null;
  ranges?: (selection: EditorSelection) => readonly Range[];
  replacementRange?: (selection: EditorSelection) => Range | null;
  slice?: (...args: any[]) => any;
  validate?: (selection: EditorSelection) => boolean;
}>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasOnlyKeys = (value: Record<string, unknown>, keys: readonly string[]) =>
  Object.keys(value).every((key) => keys.includes(key));

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

const assertBuiltInSelection = (selection: EditorSelection) => {
  if (!isRecord(selection)) {
    throw new Error('Invalid built-in editor selection.');
  }

  if (selection.kind === 'text') {
    if (
      !hasOnlyKeys(selection, [
        'affinity',
        'anchor',
        'focus',
        'kind',
        'marks',
      ]) ||
      !isStrictPoint(selection.anchor) ||
      !isStrictPoint(selection.focus) ||
      (selection.affinity !== undefined &&
        selection.affinity !== 'backward' &&
        selection.affinity !== 'forward') ||
      (selection.marks !== undefined && !isMarks(selection.marks)) ||
      (selection.marks !== undefined && !RangeApi.isCollapsed(selection))
    ) {
      throw new Error('Invalid text editor selection.');
    }
    if (selection.marks !== undefined) {
      assertEditorJsonValue(selection.marks, 'text selection marks');
    }
    return;
  }

  if (
    selection.kind !== 'node' ||
    !hasOnlyKeys(selection, ['anchor', 'focus', 'kind', 'path']) ||
    !isStrictPoint(selection.anchor) ||
    !isStrictPoint(selection.focus) ||
    !isStrictPath(selection.path)
  ) {
    throw new Error('Invalid node editor selection.');
  }
};

const rootValue = (value: JsonEditorValue, root: RootKey) =>
  root === 'main' ? value.children : (value.roots?.[root] ?? []);

const rawNodeAt = (
  children: readonly Record<string, unknown>[],
  path: Path
): Record<string, unknown> | null => {
  let descendants = children;
  let node: Record<string, unknown> | undefined;

  for (const index of path) {
    node = descendants[index];
    if (!node) return null;
    descendants = Array.isArray(node.children)
      ? (node.children as readonly Record<string, unknown>[])
      : [];
  }

  return node ?? null;
};

const pointRoot = (point: Point, fallback: RootKey) => point.root ?? fallback;

const publicPoint = (
  point: Point,
  root: RootKey,
  includeRoot: boolean
): Point =>
  Object.freeze({
    offset: point.offset,
    path: Object.freeze([...point.path]) as Path,
    ...(includeRoot ? { root } : {}),
  });

const selectionRoot = (selection: EditorSelection, fallback: RootKey) =>
  pointRoot(selection.anchor, fallback);

const getSelectionSpecByKind = (
  editor: Editor,
  kind: string,
  registry: ExtensionRegistry = getExtensionRegistry(editor)
): RuntimeSelectionSpec => {
  const registered = registry.selectionSpecs.get(kind)?.spec;

  if (registered) return registered as unknown as RuntimeSelectionSpec;
  if (kind === 'text' || kind === 'node') {
    return { kind };
  }

  throw new Error(
    `Unsupported editor selection kind "${kind}". Install an extension that defines it.`
  );
};

const getSelectionSpec = (
  editor: Editor,
  selection: EditorSelection,
  registry?: ExtensionRegistry
) => getSelectionSpecByKind(editor, selection.kind, registry);

const BUILT_IN_SELECTION_CODEC = Object.freeze({
  decode(value: unknown): EditorSelection {
    if (!SelectionApi.isSelection(value)) {
      throw new Error('Invalid built-in editor selection.');
    }

    assertBuiltInSelection(value);

    return value;
  },
  encode: (value: EditorSelection) => value,
  version: 1,
});

const getSelectionCodec = (editor: Editor, kind: string) => {
  const spec = getSelectionSpecByKind(editor, kind);

  if (spec.codec) return spec.codec;
  if (kind === 'text' || kind === 'node') return BUILT_IN_SELECTION_CODEC;

  throw new Error(
    `Editor selection kind "${kind}" does not define a persistence codec.`
  );
};

export const encodeEditorSelection = (
  editor: Editor,
  selection: Selection,
  options: Readonly<{ validateDocument?: boolean }> = {}
): SerializedEditorSelection | null => {
  if (!selection) return null;

  const { kind } = selection;

  if (options.validateDocument === false) {
    const spec = getSelectionSpec(editor, selection);

    if (kind === 'text' || kind === 'node') {
      assertBuiltInSelection(selection);
    } else if (!spec.validate?.(selection)) {
      throw new Error(`Invalid editor selection "${kind}" value.`);
    }
  } else {
    assertSelectionSupported(editor, selection);
  }

  return Object.freeze({
    kind,
    ...encodeVersionedValue(
      getSelectionCodec(editor, kind),
      selection,
      `editor selection "${kind}"`
    ),
  });
};

export const decodeEditorSelection = (
  editor: Editor,
  input: unknown,
  options: Readonly<{ validateDocument?: boolean }> = {}
): Selection => {
  if (input === null) return null;
  if (
    !isRecord(input) ||
    !hasOnlyKeys(input, ['kind', 'value', 'version']) ||
    typeof (input as { kind?: unknown }).kind !== 'string'
  ) {
    throw new Error('Invalid editor selection envelope.');
  }

  const kind = (input as { kind: string }).kind;
  const selection = decodeVersionedValue(
    getSelectionCodec(editor, kind),
    input,
    `editor selection "${kind}"`
  );

  if (!SelectionApi.isSelection(selection) || selection.kind !== kind) {
    throw new Error(`Invalid editor selection "${kind}" value.`);
  }

  if (options.validateDocument !== false) {
    assertSelectionSupported(editor, selection);
  }

  return selection;
};

const rangeAssociations = (
  document: DocumentIndex,
  range: Range,
  association: RangeMappingOptions['association']
): readonly [-1 | 1, -1 | 1] => {
  if (association === 'backward') return [-1, -1];
  if (association === 'forward') return [1, 1];

  const anchor = document.positionAt(range.anchor);
  const focus = document.positionAt(range.focus);

  if (anchor === focus) return [1, 1];

  const forward = anchor < focus;

  return association === 'outward'
    ? forward
      ? [-1, 1]
      : [1, -1]
    : forward
      ? [1, -1]
      : [-1, 1];
};

const createMapContext = (
  editor: Editor,
  change: DocumentChange,
  before: JsonEditorValue,
  after: JsonEditorValue,
  root: RootKey,
  runtimeIndexes?: SelectionMappingOptions['runtimeIndexes']
): EditorSelectionMapContext => {
  const nearestDeletedPoint = (
    document: DocumentIndex,
    point: Point,
    targetRoot: RootKey,
    includeRoot: boolean,
    fallbackAssociation: -1 | 1
  ) => {
    const backwardPosition = mapInternalDocumentChangePosition(
      change,
      targetRoot,
      DocumentIndex.fromValue(rootValue(before, targetRoot)).positionAt({
        offset: point.offset,
        path: point.path,
      }),
      -1
    );
    const forwardPosition = mapInternalDocumentChangePosition(
      change,
      targetRoot,
      DocumentIndex.fromValue(rootValue(before, targetRoot)).positionAt({
        offset: point.offset,
        path: point.path,
      }),
      1
    );
    const backward =
      backwardPosition == null ? null : document.pointAt(backwardPosition, -1);
    const forward =
      forwardPosition == null ? null : document.pointAt(forwardPosition, 1);

    if (!backward && !forward) return null;
    if (!backward) {
      return publicPoint(forward as Point, targetRoot, includeRoot);
    }
    if (!forward)
      return publicPoint(backward as Point, targetRoot, includeRoot);

    const backwardPoint = backward as Point;
    const forwardPoint = forward as Point;
    if (PathApi.equals(backwardPoint.path, forwardPoint.path)) {
      return publicPoint(backwardPoint, targetRoot, includeRoot);
    }
    const backwardCommon = PathApi.common(
      backwardPoint.path,
      point.path
    ).length;
    const forwardCommon = PathApi.common(forwardPoint.path, point.path).length;
    const nearest = PathApi.isSibling(backwardPoint.path, point.path)
      ? backwardPoint
      : PathApi.equals(forwardPoint.path, point.path)
        ? forwardPoint
        : backwardCommon > forwardCommon
          ? backwardPoint
          : forwardCommon > backwardCommon
            ? forwardPoint
            : fallbackAssociation === -1
              ? backwardPoint
              : forwardPoint;

    return publicPoint(nearest, targetRoot, includeRoot);
  };

  const mapPoint = (
    point: Point,
    options: MappingOptions = {}
  ): Point | null => {
    const targetRoot = pointRoot(point, root);

    if (change.deleteRoots.has(targetRoot)) return null;

    const beforeDocument = DocumentIndex.fromValue(
      rootValue(before, targetRoot)
    );
    const afterDocument = DocumentIndex.fromValue(rootValue(after, targetRoot));
    const association = options.association === 'backward' ? -1 : 1;
    const position = beforeDocument.positionAt({
      offset: point.offset,
      path: point.path,
    });
    const nodeRange = beforeDocument.nodeRange(point.path);
    let nodeWasRemoved = false;

    getInternalDocumentRootChange(change, targetRoot)?.iterChangedRanges(
      (from, to) => {
        if (from <= nodeRange.from && to >= nodeRange.to) {
          nodeWasRemoved = true;
        }
      }
    );
    const dropped = mapInternalDocumentChangePosition(
      change,
      targetRoot,
      position,
      association,
      'around'
    );
    const mapped = mapInternalDocumentChangePosition(
      change,
      targetRoot,
      position,
      association,
      options.deletion === 'drop' ? 'around' : undefined
    );
    const next =
      mapped == null ? null : afterDocument.pointAt(mapped, association);
    const sourceNode = rawNodeAt(
      rootValue(before, targetRoot) as readonly Record<string, unknown>[],
      point.path
    );
    const preservesNonEmptyTextPosition =
      options.preferPositionMapping &&
      typeof sourceNode?.text === 'string' &&
      sourceNode.text.length > 0;

    const mappedPoint =
      !preservesNonEmptyTextPosition &&
      options.deletion !== 'drop' &&
      (dropped == null || nodeWasRemoved)
        ? nearestDeletedPoint(
            afterDocument,
            point,
            targetRoot,
            point.root !== undefined,
            association
          )
        : next
          ? publicPoint(next as Point, targetRoot, point.root !== undefined)
          : null;
    const runtimeId = runtimeIndexes?.before.idAt(point.path);
    const retainedPath = runtimeId
      ? runtimeIndexes?.after.pathOf(runtimeId)
      : undefined;
    const retainedNode = retainedPath
      ? rawNodeAt(
          rootValue(after, targetRoot) as readonly Record<string, unknown>[],
          retainedPath
        )
      : null;
    const sourceText = sourceNode?.text;
    const retainedText = retainedNode?.text;
    const retainedTextPosition =
      typeof sourceText === 'string' &&
      typeof retainedText === 'string' &&
      (sourceText === retainedText ||
        (options.preferPositionMapping && retainedText.startsWith(sourceText)));

    if (
      runtimeId &&
      retainedPath &&
      retainedTextPosition &&
      typeof sourceText === 'string'
    ) {
      return publicPoint(
        {
          offset: Math.min(point.offset, sourceText.length),
          path: retainedPath,
        },
        targetRoot,
        point.root !== undefined
      );
    }

    return mappedPoint;
  };

  const mapPath: EditorSelectionMapContext['mapPath'] = (
    path,
    options = {}
  ) => {
    if (change.deleteRoots.has(root)) return null;

    const runtimeId = runtimeIndexes?.before.idAt(path);
    const retainedPath = runtimeId
      ? runtimeIndexes?.after.pathOf(runtimeId)
      : undefined;

    if (retainedPath) {
      return Object.freeze([...retainedPath]) as unknown as Path;
    }

    const beforeDocument = DocumentIndex.fromValue(rootValue(before, root));
    const afterDocument = DocumentIndex.fromValue(rootValue(after, root));
    const association = options.association === 'backward' ? -1 : 1;
    const position = beforeDocument.nodeRange(path).from;
    const mapped = mapInternalDocumentChangePosition(
      change,
      root,
      position,
      association,
      options.deletion === 'drop' ? 'around' : undefined
    );
    const next =
      mapped == null ? null : afterDocument.nodeStartingAt(mapped)?.path;

    return next ? (Object.freeze([...next]) as unknown as Path) : null;
  };

  const mapRange: EditorSelectionMapContext['mapRange'] = (
    range,
    options: RangeMappingOptions = {}
  ) => {
    const targetRoot = pointRoot(range.anchor, root);

    if (pointRoot(range.focus, targetRoot) !== targetRoot) {
      throw new Error('An editor selection range cannot cross document roots.');
    }

    const associations = rangeAssociations(
      DocumentIndex.fromValue(rootValue(before, targetRoot)),
      range,
      options.association
    );
    const anchor = mapPoint(range.anchor, {
      association: associations[0] === -1 ? 'backward' : 'forward',
      deletion: options.deletion,
      preferPositionMapping: options.preferPositionMapping,
    });
    const focus = mapPoint(range.focus, {
      association: associations[1] === -1 ? 'backward' : 'forward',
      deletion: options.deletion,
      preferPositionMapping: options.preferPositionMapping,
    });

    return anchor && focus ? Object.freeze({ anchor, focus }) : null;
  };

  return Object.freeze({
    change,
    editor,
    mapPath,
    mapPoint,
    mapRange,
    root: toPublicRoot(root),
  });
};

export const getSelectionRanges = (
  editor: Editor,
  selection: Selection
): readonly Range[] => {
  if (!selection) return [];

  const spec = getSelectionSpec(editor, selection);
  const ranges = spec.ranges?.(selection) ?? [selection];

  return Object.freeze(ranges.map((range) => Object.freeze({ ...range })));
};

export const getSelectionReplacementRange = (
  editor: Editor,
  selection: Selection
): Range | null => {
  if (!selection) return null;

  return (
    getSelectionSpec(editor, selection).replacementRange?.(selection) ??
    selection
  );
};

export const getSelectionPrimaryRange = <TEditor extends Editor<any, any>>(
  editor: TEditor,
  selection: Selection
): Range | null => {
  if (!selection) return null;
  if (SelectionApi.isNode(selection)) return null;

  const primaryRange = getSelectionSpec(
    editor as Editor,
    selection
  ).primaryRange;

  return primaryRange ? primaryRange(selection) : selection;
};

export const getSelectionSpecMarks = <V extends Value>(
  editor: Editor,
  selection: Selection,
  state: EditorStateView<V>
): EditorMarks<V> | null | undefined => {
  if (!selection) return;

  return getSelectionSpec(editor, selection).marks?.(selection, state) as
    | EditorMarks<V>
    | null
    | undefined;
};

export const getSelectionSpecSlice = <V extends Value>(
  editor: Editor,
  selection: Selection,
  state: EditorStateView<V>
): ContentSlice<V> | undefined => {
  if (!selection) return;

  return getSelectionSpec(editor, selection).slice?.(selection, state) as
    | ContentSlice<V>
    | undefined;
};

export const assertSelectionSupported = (
  editor: Editor,
  selection: Selection,
  documentValue: EditorDocumentValue = editor.read.value(),
  fallbackRoot = 'main'
) => {
  if (!selection) return;
  assertEditorJsonValue(selection, 'editor selection');
  if (!SelectionApi.isSelection(selection)) {
    throw new Error('Invalid editor selection.');
  }
  const { kind } = selection;

  if (kind !== 'text' && Object.hasOwn(selection, 'marks')) {
    throw new Error(
      'Only collapsed text selections can carry insertion marks.'
    );
  }

  const spec = getSelectionSpec(editor, selection);

  if (kind === 'text' || kind === 'node') {
    assertBuiltInSelection(selection);
  } else if (!spec.validate?.(selection)) {
    throw new Error(`Invalid editor selection "${kind}" value.`);
  }

  const root = selectionRoot(selection, fallbackRoot);

  const jsonDocumentValue = documentValue as JsonEditorValue;
  const ranges = [selection, ...getSelectionRanges(editor, selection)];

  for (const range of ranges) {
    if (!RangeApi.isRange(range)) {
      throw new Error(
        `Editor selection "${selection.kind}" returned an invalid range.`
      );
    }
    const rangeRoot = pointRoot(range.anchor, root);

    if (rangeRoot !== pointRoot(range.focus, rangeRoot)) {
      throw new Error('An editor selection range cannot cross document roots.');
    }

    try {
      const document = DocumentIndex.fromValue(
        rootValue(jsonDocumentValue, rangeRoot)
      );

      document.positionAt(range.anchor);
      document.positionAt(range.focus);
    } catch {
      throw new Error(
        `Editor selection "${selection.kind}" range ${JSON.stringify(range)} points outside document root "${rangeRoot}".`
      );
    }
  }

  if (SelectionApi.isText(selection) && selection.marks !== undefined) {
    const marksRoot = pointRoot(selection.focus, root);
    getEditorSchema(editor).validateTextPropertiesAtValue(
      selection.marks,
      selection.focus.path,
      documentValue,
      marksRoot
    );
  }

  if (SelectionApi.isNode(selection)) {
    const nodeRoot = pointRoot(selection.anchor, root);
    const node = rawNodeAt(
      rootValue(jsonDocumentValue, nodeRoot) as readonly Record<
        string,
        unknown
      >[],
      selection.path
    );

    if (!node) {
      throw new Error(
        `Node selection path points outside document root "${nodeRoot}".`
      );
    }
  }
};

export const mapSelectionWithContext = (
  editor: Editor,
  selection: EditorSelection,
  context: EditorSelectionMapContext,
  options: RangeMappingOptions = {},
  registry?: ExtensionRegistry
): Selection => {
  const spec = getSelectionSpec(editor, selection, registry);

  if (spec.map) return spec.map(selection, context);

  const range = context.mapRange(selection, options);

  if (!range) return null;

  if (SelectionApi.isNode(selection)) {
    const path = context.mapPath(selection.path, {
      association: options.association === 'backward' ? 'backward' : 'forward',
      deletion: options.deletion,
    });

    return path ? Object.freeze({ ...selection, ...range, path }) : null;
  }

  if (
    SelectionApi.isText(selection) &&
    selection.affinity &&
    options.association === undefined
  ) {
    const focus = context.mapPoint(selection.focus, {
      association: selection.affinity,
      deletion: options.deletion,
    });

    if (!focus) return null;

    return RangeApi.isCollapsed(selection)
      ? Object.freeze({ ...selection, anchor: focus, focus })
      : Object.freeze({ ...selection, ...range, focus });
  }

  return Object.freeze({ ...selection, ...range });
};

export const mapSelectionThroughChange = (
  editor: Editor,
  selection: Selection,
  change: DocumentChange,
  before: EditorDocumentValue,
  after: EditorDocumentValue,
  fallbackRoot: RootKey,
  options: SelectionMappingOptions = {}
): Selection => {
  if (!selection || change.empty) return selection;

  const root = selectionRoot(selection, fallbackRoot);
  const context = createMapContext(
    editor,
    change,
    before as JsonEditorValue,
    after as JsonEditorValue,
    root,
    options.runtimeIndexes
  );

  const rangeRoot = pointRoot(selection.anchor, root);

  if (pointRoot(selection.focus, rangeRoot) !== rangeRoot) {
    throw new Error('An editor selection range cannot cross document roots.');
  }

  try {
    const document = DocumentIndex.fromValue(rootValue(before, rangeRoot));

    document.positionAt(selection.anchor);
    document.positionAt(selection.focus);
  } catch {
    return null;
  }

  const mapped = mapSelectionWithContext(editor, selection, context, options);

  if (mapped) {
    assertSelectionSupported(editor, mapped, after, root);
  }

  return mapped;
};
