import type {
  BaseEditor,
  Editor,
  EditorCommit,
  EditorDocumentValue,
  NamedRootKey,
  RootKey,
  RuntimeId,
} from '../interfaces/editor';
import { LocationApi } from '../interfaces/location';
import { PathApi, type Path } from '../interfaces/path';
import { PointApi, type Point } from '../interfaces/point';
import { RangeApi, type Range } from '../interfaces/range';
import type { Text } from '../interfaces/text';

import {
  DocumentChange,
  getInternalDocumentRootChange,
} from './change/document-change';
import { DocumentIndex } from './change/document-index';
import type { JsonEditorValue, JsonNode } from './change/tokens';
import type { TrackMode } from './change/root-change';
import {
  type AnchorChangeContext,
  getAnchorStateValue,
  subscribeAnchorState,
} from './anchor-state';
import { getEditorRuntime } from './editor-runtime';
import {
  getEditorDocumentValue,
  getEditorUpdateRoot,
  withEditorRootChildren,
} from './public-state';
import { toPublicRoot } from './public-root';

export type AnchorValue = Path | Point | Range;
export type AnchorAssociation = 'backward' | 'forward';
export type RangeAnchorAssociation = AnchorAssociation | 'inward' | 'outward';
export type AnchorDeletionPolicy = 'drop' | 'nearest';

export type AnchorOptions<
  TValue extends AnchorValue,
  TRoot extends RootKey = RootKey,
> = Readonly<{
  association?: TValue extends Range
    ? RangeAnchorAssociation
    : AnchorAssociation;
  deletion: AnchorDeletionPolicy;
  root?: NamedRootKey<TRoot>;
}>;

export interface Anchor<TValue extends AnchorValue> {
  readonly association: TValue extends Range
    ? RangeAnchorAssociation
    : AnchorAssociation;
  readonly deletion: AnchorDeletionPolicy;
  readonly kind: TValue extends Range
    ? 'range'
    : TValue extends Point
      ? 'point'
      : 'path';
  readonly root: NamedRootKey | undefined;
  release(): TValue | null;
  resolve(): TValue | null;
}

type PointState = {
  includeRoot: boolean;
  point: Point;
  position: number;
  runtimeId: RuntimeId | null;
};

type MappedPoint = {
  point: Point;
  runtimeStable: boolean;
};

const runtimeIdAt = (editor: Editor, root: string, path: Path) =>
  withEditorRootChildren(editor, root, () =>
    getEditorRuntime(editor).getRuntimeId(path)
  );

const pathOfRuntimeId = (editor: Editor, root: string, runtimeId: RuntimeId) =>
  withEditorRootChildren(editor, root, () =>
    getEditorRuntime(editor).getPathByRuntimeId(runtimeId)
  );

const rootNodes = (value: JsonEditorValue, root: string) =>
  root === 'main' ? value.children : (value.roots?.[root] ?? []);

const hasRoot = (value: JsonEditorValue, root: string) =>
  root === 'main' || Object.hasOwn(value.roots ?? {}, root);

const indexedRoot = (value: JsonEditorValue, root: string) =>
  DocumentIndex.fromValue(rootNodes(value, root));

const readValue = (editor: Editor) =>
  getEditorDocumentValue(editor) as EditorDocumentValue as JsonEditorValue;

const pointRoot = (point: Point, fallback: RootKey) => point.root ?? fallback;

const withPublicPointRoot = (
  point: Point,
  root: RootKey,
  includeRoot: boolean
): Point => ({
  offset: point.offset,
  path: [...point.path],
  ...(includeRoot ? { root } : {}),
});

const isTextNode = (node: JsonNode): node is JsonNode & Text =>
  typeof node.text === 'string';

const mapTextOffset = (
  source: JsonNode & Text,
  current: JsonNode & Text,
  offset: number,
  association: -1 | 1,
  track: TrackMode | undefined
) => {
  if (source.text === current.text) {
    return Math.min(offset, current.text.length);
  }

  const before = { children: [source] } satisfies JsonEditorValue;
  const after = { children: [current] } satisfies JsonEditorValue;
  const sourceDocument = DocumentIndex.fromValue(before.children);
  const position = sourceDocument.positionAt({ offset, path: [0] });
  const mapped = DocumentChange.between(before, after).mapPosition(position, {
    association: association === -1 ? 'backward' : 'forward',
    track,
  });

  return mapped == null
    ? null
    : (DocumentIndex.fromValue(after.children).pointAt(mapped, association)
        ?.offset ?? null);
};

const rangeAssociations = (
  range: Range,
  association: RangeAnchorAssociation
): readonly [-1 | 1, -1 | 1] => {
  if (association === 'backward') return [-1, -1];
  if (association === 'forward') return [1, 1];

  if (PointApi.equals(range.anchor, range.focus)) return [1, 1];

  const forward = PointApi.isBefore(range.anchor, range.focus);

  return association === 'inward'
    ? forward
      ? [1, -1]
      : [-1, 1]
    : forward
      ? [-1, 1]
      : [1, -1];
};

const createPointState = (
  editor: Editor,
  value: JsonEditorValue,
  point: Point,
  root: RootKey,
  document = indexedRoot(value, root)
): PointState => {
  const localPoint = { offset: point.offset, path: [...point.path] };

  return {
    includeRoot: point.root !== undefined,
    point: localPoint,
    position: document.positionAt(localPoint),
    runtimeId: runtimeIdAt(editor, root, point.path),
  };
};

/** Create one root-aware anchor mapped by canonical document changes. */
export function createAnchor<TValue extends AnchorValue>(
  editor: BaseEditor<any, any>,
  value: TValue,
  options: Omit<AnchorOptions<TValue>, 'root'> & Readonly<{ root?: RootKey }>
): Anchor<TValue> {
  const runtimeEditor = editor as Editor;
  const kind = LocationApi.isPath(value)
    ? 'path'
    : PointApi.isPoint(value)
      ? 'point'
      : RangeApi.isRange(value)
        ? 'range'
        : null;

  if (!kind) throw new Error('Anchor value must be a path, point, or range.');

  const pathValue = kind === 'path' ? (value as Path) : null;
  const pointValue = kind === 'point' ? (value as Point) : null;
  const rangeValue = kind === 'range' ? (value as Range) : null;

  const firstPoint = pointValue ?? rangeValue?.anchor ?? null;
  const root =
    firstPoint?.root ?? options.root ?? getEditorUpdateRoot(runtimeEditor);

  if (rangeValue && pointRoot(rangeValue.focus, root) !== root) {
    throw new Error('A range anchor cannot cross document roots.');
  }

  const association =
    options.association ?? (kind === 'range' ? 'inward' : 'forward');
  const track = options.deletion === 'drop' ? 'around' : undefined;
  let sourceValue =
    (getAnchorStateValue(runtimeEditor) as JsonEditorValue | undefined) ??
    readValue(runtimeEditor);
  let released = false;
  let current: AnchorValue | null = value;
  const pathRuntimeId = pathValue
    ? (() => {
        try {
          return runtimeIdAt(runtimeEditor, root, pathValue);
        } catch {
          return null;
        }
      })()
    : null;
  const pathMode =
    pathValue?.length === 0
      ? 'root'
      : pathValue && !pathRuntimeId
        ? 'boundary'
        : 'node';
  let pathPosition = pathValue
    ? pathMode === 'root'
      ? 0
      : pathMode === 'node'
        ? indexedRoot(sourceValue, root).nodeRange(pathValue).from
        : indexedRoot(sourceValue, root).childPosition(
            pathValue.slice(0, -1),
            pathValue.at(-1)!
          )
    : null;
  let pointStates = pointValue
    ? [createPointState(runtimeEditor, sourceValue, pointValue, root)]
    : rangeValue
      ? [
          createPointState(runtimeEditor, sourceValue, rangeValue.anchor, root),
          createPointState(runtimeEditor, sourceValue, rangeValue.focus, root),
        ]
      : [];
  const checkpoints: Array<{
    current: AnchorValue | null;
    pathPosition: number | null;
    pointStates: PointState[];
  }> = [];

  const cloneAnchorValue = (anchorValue: AnchorValue | null) => {
    if (anchorValue == null) return null;
    if (LocationApi.isPath(anchorValue)) return [...anchorValue];
    if (PointApi.isPoint(anchorValue)) {
      return { ...anchorValue, path: [...anchorValue.path] };
    }

    return {
      anchor: { ...anchorValue.anchor, path: [...anchorValue.anchor.path] },
      focus: { ...anchorValue.focus, path: [...anchorValue.focus.path] },
    };
  };

  const clonePointStates = () =>
    pointStates.map((state) => ({
      ...state,
      point: { ...state.point, path: [...state.point.path] },
    }));

  const resolveMappedPoint = (
    state: PointState,
    change: DocumentChange,
    source: DocumentIndex,
    next: DocumentIndex,
    endpointAssociation: -1 | 1,
    preserveSamePathOffset: boolean
  ): MappedPoint | null => {
    const runtimePath = state.runtimeId
      ? pathOfRuntimeId(runtimeEditor, root, state.runtimeId)
      : null;
    const position = change.mapPosition(state.position, {
      association: endpointAssociation === -1 ? 'backward' : 'forward',
      ...(root === 'main' ? {} : { root }),
      track,
    });
    const canonicalPoint =
      position == null ? null : next.pointAt(position, endpointAssociation);
    const canonicalMapping = canonicalPoint
      ? {
          point: withPublicPointRoot(
            canonicalPoint as Point,
            root,
            state.includeRoot
          ),
          runtimeStable:
            runtimePath !== null &&
            PathApi.equals((canonicalPoint as Point).path, runtimePath),
        }
      : null;
    const canonicalMovedOffRuntimePath =
      runtimePath !== null &&
      canonicalMapping !== null &&
      !PathApi.equals(canonicalMapping.point.path, runtimePath);

    if (canonicalMovedOffRuntimePath) return canonicalMapping;

    if (runtimePath) {
      const sourceNode = source.node(state.point.path);
      const currentNode = next.node(runtimePath);

      if (isTextNode(sourceNode) && isTextNode(currentNode)) {
        if (
          preserveSamePathOffset &&
          PathApi.equals(runtimePath, state.point.path)
        ) {
          return {
            point: withPublicPointRoot(
              {
                offset: Math.min(state.point.offset, currentNode.text.length),
                path: runtimePath,
              },
              root,
              state.includeRoot
            ),
            runtimeStable: true,
          };
        }

        if (
          sourceNode === currentNode &&
          PathApi.equals(runtimePath, state.point.path)
        ) {
          return {
            point: withPublicPointRoot(
              { offset: state.point.offset, path: runtimePath },
              root,
              state.includeRoot
            ),
            runtimeStable: true,
          };
        }

        const offset = mapTextOffset(
          sourceNode,
          currentNode,
          state.point.offset,
          endpointAssociation,
          track
        );

        if (offset != null) {
          return {
            point: withPublicPointRoot(
              { offset, path: runtimePath },
              root,
              state.includeRoot
            ),
            runtimeStable: true,
          };
        }
      }
    }

    if (canonicalMapping) return canonicalMapping;

    return null;
  };

  const mapTo = (
    nextValue: JsonEditorValue,
    _commit?: EditorCommit,
    providedChange?: DocumentChange,
    context?: AnchorChangeContext
  ) => {
    if (current == null) {
      sourceValue = nextValue;
      return;
    }

    const change =
      providedChange ?? DocumentChange.between(sourceValue, nextValue);

    if (change.empty) {
      sourceValue = nextValue;
      return;
    }

    const sourceDocument = () =>
      context?.beforeRoot(root) ?? indexedRoot(sourceValue, root);
    const nextDocument = () =>
      context?.afterRoot(root) ?? indexedRoot(nextValue, root);

    if (kind === 'path') {
      if (pathMode === 'root') {
        current = hasRoot(nextValue, root) ? [] : null;
        sourceValue = nextValue;
        return;
      }

      const runtimePath = pathRuntimeId
        ? pathOfRuntimeId(runtimeEditor, root, pathRuntimeId)
        : null;

      if (runtimePath) {
        current = [...runtimePath];
        pathPosition = nextDocument().nodeRange(runtimePath).from;
        sourceValue = nextValue;
        return;
      }

      const pathWasRemoved = (() => {
        if (pathMode !== 'node' || !current) return false;

        const nodeRange = sourceDocument().nodeRange(current as Path);
        let removed = false;

        getInternalDocumentRootChange(change, root)?.iterChangedRanges(
          (from, to) => {
            if (from <= nodeRange.from && to >= nodeRange.to) removed = true;
          }
        );

        return removed;
      })();

      if (pathWasRemoved && options.deletion === 'drop') {
        current = null;
        pathPosition = null;
        sourceValue = nextValue;
        return;
      }

      const position =
        pathPosition == null
          ? null
          : change.mapPosition(pathPosition, {
              association: association === 'backward' ? 'backward' : 'forward',
              ...(root === 'main' ? {} : { root }),
              track,
            });
      const nextPath =
        position == null
          ? null
          : pathMode === 'boundary'
            ? (() => {
                const boundary = nextDocument().childBoundaryAt(position);

                return boundary
                  ? [...boundary.parentPath, boundary.index]
                  : null;
              })()
            : (nextDocument().nodeStartingAt(position)?.path ?? null);

      current = nextPath ? [...nextPath] : null;
      pathPosition = nextPath
        ? pathMode === 'node'
          ? nextDocument().nodeRange(nextPath).from
          : nextDocument().childPosition(
              nextPath.slice(0, -1),
              nextPath.at(-1)!
            )
        : null;
    } else {
      const associations =
        kind === 'point'
          ? ([association === 'backward' ? -1 : 1] as const)
          : rangeAssociations(
              current as Range,
              association as RangeAnchorAssociation
            );

      const mappedPoints = pointStates.map((state, index) =>
        resolveMappedPoint(
          state,
          change,
          sourceDocument(),
          nextDocument(),
          associations[index]!,
          context?.replace === true
        )
      );
      const points = mappedPoints.map((mapped) => mapped?.point ?? null);
      const nextPointStates = mappedPoints.map((mapped, index) => {
        if (!mapped) return null;

        const previous = pointStates[index]!;
        const position = change.mapPosition(previous.position, {
          association: associations[index] === -1 ? 'backward' : 'forward',
          ...(root === 'main' ? {} : { root }),
          track,
        });

        if (mapped.runtimeStable && position != null) {
          return {
            ...previous,
            point: {
              offset: mapped.point.offset,
              path: [...mapped.point.path],
            },
            position,
          };
        }

        return createPointState(
          runtimeEditor,
          nextValue,
          mapped.point,
          root,
          nextDocument()
        );
      });

      current =
        kind === 'point'
          ? points[0]
          : points[0] && points[1]
            ? { anchor: points[0], focus: points[1] }
            : null;
      pointStates = current
        ? kind === 'point'
          ? [nextPointStates[0]!]
          : [nextPointStates[0]!, nextPointStates[1]!]
        : [];
    }

    sourceValue = nextValue;
  };

  const subscription = subscribeAnchorState(
    runtimeEditor,
    {
      begin() {
        checkpoints.push({
          current: cloneAnchorValue(current),
          pathPosition,
          pointStates: clonePointStates(),
        });
      },
      change(context) {
        mapTo(
          context.after as JsonEditorValue,
          undefined,
          context.change,
          context
        );
      },
      commit(value, commit) {
        if (value) mapTo(value as JsonEditorValue, commit);
        checkpoints.length = 0;
      },
      discard(value) {
        const checkpoint = checkpoints.pop();

        if (checkpoint) {
          current = checkpoint.current;
          pathPosition = checkpoint.pathPosition;
          pointStates = checkpoint.pointStates;
          sourceValue = value as JsonEditorValue;
          return;
        }

        // An anchor created inside an aborted transaction cannot safely retain a
        // location that only existed in the discarded draft.
        current = null;
        pathPosition = null;
        pointStates = [];
        sourceValue = value as JsonEditorValue;
      },
    },
    () => readValue(runtimeEditor) as unknown as EditorDocumentValue
  );

  return Object.freeze({
    association,
    deletion: options.deletion,
    kind,
    release() {
      const resolved = this.resolve();

      if (!released) {
        released = true;
        current = null;
        subscription.unsubscribe();
      }

      return resolved;
    },
    resolve() {
      if (released) return null;

      const value =
        (getAnchorStateValue(runtimeEditor) as JsonEditorValue | undefined) ??
        readValue(runtimeEditor);

      if (value !== sourceValue) {
        if (!subscription.isShadowed()) {
          mapTo(value);
        } else {
          const checkpoint = {
            current: cloneAnchorValue(current),
            pathPosition,
            pointStates: clonePointStates(),
            sourceValue,
          };

          mapTo(value);
          const resolved = cloneAnchorValue(current);

          current = checkpoint.current;
          pathPosition = checkpoint.pathPosition;
          pointStates = checkpoint.pointStates;
          sourceValue = checkpoint.sourceValue;

          return resolved as TValue | null;
        }
      }

      return current as TValue | null;
    },
    root: toPublicRoot(root),
  }) as Anchor<TValue>;
}
