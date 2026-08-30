import type {
  AnyEditor as Editor,
  EditorDocumentValue,
  EditorSelectionMapContext,
  RootKey,
  SerializedEditorSelection,
  SnapshotIndex,
} from '../interfaces/editor';
import { PathApi, type Path } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import type { Range } from '../interfaces/range';
import { RangeApi } from '../interfaces/range';
import {
  SelectionApi,
  type EditorSelection,
  type Selection,
  type SelectionValue,
} from '../interfaces/selection';
import {
  getInternalDocumentRootChange,
  mapInternalDocumentChangePosition,
  type DocumentChange,
} from './change/document-change';
import { DocumentIndex } from './change/document-index';
import { getRangeEndpointAssociations } from './change/range-association';
import type { JsonEditorValue } from './change/tokens';
import { getEditorSchema } from './editor-runtime';
import { toPublicRoot } from './public-root';
import {
  assertEditorJsonValue,
  decodeVersionedValue,
  encodeVersionedValue,
} from './value-codec';

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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasOnlyKeys = (
  value: Record<string, unknown>,
  keys: readonly string[]
) => {
  const keySet = new Set(keys);

  return Object.keys(value).every((key) => keySet.has(key));
};

const assertBuiltInSelection: (
  selection: SelectionValue
) => asserts selection is EditorSelection = (selection) => {
  if (selection.kind === 'text') {
    if (!SelectionApi.isText(selection)) {
      throw new Error('Invalid text editor selection.');
    }
    if (selection.marks !== undefined) {
      assertEditorJsonValue(selection.marks, 'text selection marks');
    }
    return;
  }

  if (!SelectionApi.isNode(selection)) {
    throw new Error('Invalid node editor selection.');
  }
};

const rootValue = (value: JsonEditorValue, root: RootKey) =>
  root === 'main' ? value.children : (value.roots?.[root] ?? []);

const projectSelectionPoint = (point: Point): Point =>
  Object.freeze({
    offset: point.offset,
    path: Object.freeze([...point.path]),
    ...(point.root === undefined ? {} : { root: point.root }),
  });

const projectSelectionRange = (range: Range): Range =>
  Object.freeze({
    anchor: projectSelectionPoint(range.anchor),
    focus: projectSelectionPoint(range.focus),
  });

const rawNodeAt = (
  children: ReadonlyArray<Record<string, unknown>>,
  path: Path
): Record<string, unknown> | null => {
  let descendants = children;
  let node: Record<string, unknown> | undefined;

  for (const index of path) {
    node = descendants[index];
    if (!node) return null;
    descendants = Array.isArray(node.children)
      ? (node.children as ReadonlyArray<Record<string, unknown>>)
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
    path: Object.freeze([...point.path]),
    ...(includeRoot ? { root } : {}),
  });

const getLegacyNodeSelectionOptions = (range: Range) => {
  const anchorRoot = range.anchor.root;
  const focusRoot = range.focus.root;

  if (anchorRoot && focusRoot && anchorRoot !== focusRoot) {
    throw new Error('A legacy node selection cannot cross document roots.');
  }

  const root = anchorRoot ?? focusRoot;

  if (root === 'main') {
    throw new Error('[Plite] Omit root to target the primary document.');
  }

  return root ? { root } : {};
};

const TEXT_SELECTION_CODEC = Object.freeze({
  decode(value: unknown) {
    if (!SelectionApi.isText(value)) {
      throw new Error('Invalid text editor selection.');
    }

    return value;
  },
  encode(value: SelectionValue) {
    if (!SelectionApi.isText(value)) {
      throw new Error('Invalid text editor selection.');
    }

    return value;
  },
  version: 1,
});

const NODE_SELECTION_CODEC = Object.freeze({
  decode(value: unknown) {
    if (!SelectionApi.isNode(value)) {
      throw new Error('Invalid node editor selection.');
    }

    return value;
  },
  encode(value: SelectionValue) {
    if (!SelectionApi.isNode(value)) {
      throw new Error('Invalid node editor selection.');
    }

    return value;
  },
  version: 4,
});

const LEGACY_NODE_SELECTION_CODEC = Object.freeze({
  decode(value: unknown) {
    if (
      !isRecord(value) ||
      !hasOnlyKeys(value, ['anchor', 'focus', 'kind', 'path']) ||
      value.kind !== 'node'
    ) {
      throw new Error('Invalid legacy node editor selection.');
    }

    const { kind: _kind, path, ...range } = value;

    if (!RangeApi.isRange(range) || !PathApi.isPath(path)) {
      throw new Error('Invalid legacy node editor selection.');
    }

    return SelectionApi.nodes([path], getLegacyNodeSelectionOptions(range));
  },
  encode() {
    throw new Error('Legacy node editor selections are decode-only.');
  },
  version: 1,
});

const LEGACY_NODE_SELECTION_V2_CODEC = Object.freeze({
  decode(value: unknown) {
    if (
      !isRecord(value) ||
      !hasOnlyKeys(value, ['anchor', 'focus', 'kind', 'paths']) ||
      value.kind !== 'node'
    ) {
      throw new Error('Invalid legacy node editor selection.');
    }

    const { kind: _kind, paths, ...range } = value;

    if (
      !RangeApi.isRange(range) ||
      !Array.isArray(paths) ||
      paths.length === 0 ||
      !paths.every(PathApi.isPath)
    ) {
      throw new Error('Invalid legacy node editor selection.');
    }

    return SelectionApi.nodes(
      paths as [Path, ...Path[]],
      getLegacyNodeSelectionOptions(range)
    );
  },
  encode() {
    throw new Error('Legacy node editor selections are decode-only.');
  },
  version: 2,
});

const LEGACY_NODE_SELECTION_V3_CODEC = Object.freeze({
  decode(value: unknown) {
    if (
      !isRecord(value) ||
      !hasOnlyKeys(value, ['kind', 'paths', 'root']) ||
      value.kind !== 'node' ||
      !Array.isArray(value.paths) ||
      value.paths.length === 0 ||
      !value.paths.every(PathApi.isPath) ||
      (value.root !== undefined &&
        (typeof value.root !== 'string' || value.root === 'main'))
    ) {
      throw new Error('Invalid legacy node editor selection.');
    }

    return SelectionApi.nodes(
      value.paths as [Path, ...Path[]],
      value.root === undefined ? {} : { root: value.root }
    );
  },
  encode() {
    throw new Error('Legacy node editor selections are decode-only.');
  },
  version: 3,
});

const getSelectionCodec = (kind: string) => {
  if (kind === 'text') return TEXT_SELECTION_CODEC;
  if (kind === 'node') return NODE_SELECTION_CODEC;

  throw new Error(`Unsupported editor selection kind "${kind}".`);
};

export const encodeEditorSelection = (
  editor: Editor,
  selection: Selection,
  options: Readonly<{ validateDocument?: boolean }> = {}
): SerializedEditorSelection | null => {
  if (!selection) return null;

  const { kind } = selection;

  if (options.validateDocument === false) {
    assertBuiltInSelection(selection);
  } else {
    assertSelectionSupported(editor, selection);
  }

  return Object.freeze({
    kind,
    ...encodeVersionedValue(
      getSelectionCodec(kind),
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

  const { kind } = input as { kind: string };
  const selection = decodeVersionedValue(
    kind === 'node'
      ? input.version === 1
        ? LEGACY_NODE_SELECTION_CODEC
        : input.version === 2
          ? LEGACY_NODE_SELECTION_V2_CODEC
          : input.version === 3
            ? LEGACY_NODE_SELECTION_V3_CODEC
            : getSelectionCodec(kind)
      : getSelectionCodec(kind),
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
    if (!forward) {
      return publicPoint(backward, targetRoot, includeRoot);
    }

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
    const sourceNode = rawNodeAt(rootValue(before, targetRoot), point.path);
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
          ? publicPoint(next, targetRoot, point.root !== undefined)
          : null;
    const nodeKey = runtimeIndexes?.before.keyAt(point.path);
    const retainedPath = nodeKey
      ? runtimeIndexes?.after.pathOf(nodeKey)
      : undefined;
    const retainedNode = retainedPath
      ? rawNodeAt(rootValue(after, targetRoot), retainedPath)
      : null;
    const sourceText = sourceNode?.text;
    const retainedText = retainedNode?.text;
    const retainedTextPosition =
      typeof sourceText === 'string' &&
      typeof retainedText === 'string' &&
      (sourceText === retainedText ||
        (options.preferPositionMapping && retainedText.startsWith(sourceText)));

    if (
      nodeKey &&
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

    const nodeKey = runtimeIndexes?.before.keyAt(path);
    const retainedPath = nodeKey
      ? runtimeIndexes?.after.pathOf(nodeKey)
      : undefined;

    if (retainedPath) {
      return Object.freeze([...retainedPath]);
    }
    if (nodeKey) return null;

    const beforeDocument = DocumentIndex.fromValue(rootValue(before, root));
    const afterDocument = DocumentIndex.fromValue(rootValue(after, root));
    const nodeRange = beforeDocument.nodeRange(path);
    let nodeWasRemoved = false;

    getInternalDocumentRootChange(change, root)?.iterChangedRanges(
      (from, to) => {
        if (from <= nodeRange.from && to >= nodeRange.to) {
          nodeWasRemoved = true;
        }
      }
    );
    if (options.deletion === 'drop' && nodeWasRemoved) return null;

    const association = options.association === 'backward' ? -1 : 1;
    const position = nodeRange.from;
    const mapped = mapInternalDocumentChangePosition(
      change,
      root,
      position,
      association,
      options.deletion === 'drop' ? 'around' : undefined
    );
    const next =
      mapped == null ? null : afterDocument.nodeStartingAt(mapped)?.path;

    return next ? Object.freeze([...next]) : null;
  };

  const mapRange: EditorSelectionMapContext['mapRange'] = (
    range,
    options: RangeMappingOptions = {}
  ) => {
    const targetRoot = pointRoot(range.anchor, root);

    if (pointRoot(range.focus, targetRoot) !== targetRoot) {
      throw new Error('An editor selection range cannot cross document roots.');
    }

    const beforeDocument = DocumentIndex.fromValue(
      rootValue(before, targetRoot)
    );
    const anchorPosition = beforeDocument.positionAt(range.anchor);
    const focusPosition = beforeDocument.positionAt(range.focus);
    const associations = getRangeEndpointAssociations(
      anchorPosition === focusPosition
        ? 'collapsed'
        : anchorPosition < focusPosition
          ? 'forward'
          : 'backward',
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
  selection: Selection,
  documentValue: EditorDocumentValue = editor.read.value()
): readonly Range[] => {
  if (!selection) return [];

  if (SelectionApi.isNode(selection)) {
    const root = SelectionApi.root(selection) ?? 'main';
    const includeRoot = selection.root !== undefined;
    const document = DocumentIndex.fromValue(rootValue(documentValue, root));

    return Object.freeze(
      selection.paths.map((path) => {
        const { from, to } = document.nodeRange(path);
        const anchor = document.pointAt(from, 1);
        const focus = document.pointAt(to, -1);

        if (!anchor || !focus) {
          throw new Error(
            `Node selection path [${path}] has no selectable document range.`
          );
        }

        return projectSelectionRange({
          anchor: publicPoint(anchor, root, includeRoot),
          focus: publicPoint(focus, root, includeRoot),
        });
      })
    );
  }

  return Object.freeze([projectSelectionRange(selection)]);
};

export const getSelectionRange = (
  editor: Editor,
  selection: Selection,
  documentValue: EditorDocumentValue = editor.read.value()
): Range | null => {
  if (!selection) return null;

  if (RangeApi.isRange(selection)) {
    return projectSelectionRange(selection);
  }

  const ranges = getSelectionRanges(editor, selection, documentValue);
  const anchorIndex = selection.paths.findIndex((path) =>
    PathApi.equals(path, selection.anchorPath)
  );
  const focusIndex = selection.paths.findIndex((path) =>
    PathApi.equals(path, selection.focusPath)
  );
  const anchorRange = ranges[anchorIndex];
  const focusRange = ranges[focusIndex];

  if (!anchorRange || !focusRange) return null;

  const backward =
    PathApi.compare(selection.anchorPath, selection.focusPath) > 0;

  return projectSelectionRange({
    anchor: backward ? anchorRange.focus : anchorRange.anchor,
    focus: backward ? focusRange.anchor : focusRange.focus,
  });
};

export const getSelectionDOMRange = (
  editor: Editor,
  selection: Selection
): Range | null => {
  if (!selection) return null;
  if (SelectionApi.isNode(selection)) return null;

  return projectSelectionRange(selection);
};

export const assertSelectionSupported = (
  editor: Editor,
  selection: unknown,
  documentValue: EditorDocumentValue = editor.read.value(),
  fallbackRoot = 'main'
) => {
  if (selection === null) return;
  assertEditorJsonValue(selection, 'editor selection');
  if (
    isRecord(selection) &&
    selection.kind !== 'text' &&
    Object.hasOwn(selection, 'marks')
  ) {
    throw new Error(
      'Only collapsed text selections can carry insertion marks.'
    );
  }
  if (!SelectionApi.isSelection(selection)) {
    if (
      isRecord(selection) &&
      (selection.kind === 'text' || selection.kind === 'node')
    ) {
      assertBuiltInSelection(selection as SelectionValue);
    }
    if (isRecord(selection) && typeof selection.kind === 'string') {
      throw new Error(`Unsupported editor selection kind "${selection.kind}".`);
    }
    throw new Error('Invalid editor selection.');
  }
  assertBuiltInSelection(selection);

  const root = SelectionApi.root(selection) ?? fallbackRoot;

  const jsonDocumentValue = documentValue as JsonEditorValue;
  const ranges = getSelectionRanges(editor, selection, documentValue);

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
        `Editor selection "${selection.kind}" range ${JSON.stringify(
          range
        )} points outside document root "${rangeRoot}".`
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
    const nodeRoot = selection.root ?? root;

    for (const path of selection.paths) {
      if (!rawNodeAt(rootValue(jsonDocumentValue, nodeRoot), path)) {
        throw new Error(
          `Node selection path [${path}] points outside document root "${nodeRoot}".`
        );
      }
    }
  }
};

export const isValidEditorSelection = (
  editor: Editor,
  selection: unknown,
  documentValue?: EditorDocumentValue,
  fallbackRoot?: RootKey
): selection is Selection => {
  if (selection !== null && !SelectionApi.isSelection(selection)) return false;

  try {
    assertSelectionSupported(editor, selection, documentValue, fallbackRoot);
    return true;
  } catch {
    return false;
  }
};

export const mapSelectionWithContext = (
  selection: SelectionValue,
  context: EditorSelectionMapContext,
  options: RangeMappingOptions = {}
): Selection => {
  if (SelectionApi.isNode(selection)) {
    const mappedEntries = selection.paths.map((path) => {
      const mapped = context.mapPath(path, {
        association:
          options.association === 'backward' ? 'backward' : 'forward',
        deletion: 'drop',
      });

      return { mapped, source: path };
    });
    const paths = mappedEntries.flatMap(({ mapped }) =>
      mapped ? [mapped] : []
    );
    const first = paths[0];

    if (!first) return null;

    const rootOptions =
      context.root === undefined ? ({} as const) : { root: context.root };
    const canonical = SelectionApi.nodes(
      [first, ...paths.slice(1)],
      rootOptions
    );
    const backward =
      PathApi.compare(selection.anchorPath, selection.focusPath) > 0;
    const firstPath = canonical.paths[0];
    const lastPath = canonical.paths.at(-1) ?? firstPath;
    const resolveEndpoint = (source: Path, fallback: Path) => {
      const mapped = mappedEntries.find(({ source: candidate }) =>
        PathApi.equals(candidate, source)
      )?.mapped;

      if (!mapped) return fallback;

      return (
        canonical.paths.find(
          (path) =>
            PathApi.equals(path, mapped) || PathApi.isAncestor(path, mapped)
        ) ?? fallback
      );
    };
    const anchorPath = resolveEndpoint(
      selection.anchorPath,
      backward ? lastPath : firstPath
    );
    const focusPath = resolveEndpoint(
      selection.focusPath,
      backward ? firstPath : lastPath
    );

    return Object.freeze(
      SelectionApi.nodes(canonical.paths, {
        anchorPath,
        focusPath,
        ...rootOptions,
      })
    );
  }

  const range = context.mapRange(selection, options);

  if (!range) return null;

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

  const root = SelectionApi.root(selection) ?? fallbackRoot;
  const context = createMapContext(
    editor,
    change,
    before,
    after,
    root,
    options.runtimeIndexes
  );

  if (SelectionApi.isNode(selection)) {
    if (
      selection.paths.some((path) => !rawNodeAt(rootValue(before, root), path))
    ) {
      return null;
    }
  } else if (RangeApi.isRange(selection)) {
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
  }

  const mapped = mapSelectionWithContext(selection, context, options);

  if (mapped) {
    assertSelectionSupported(editor, mapped, after, root);
  }

  return mapped;
};
