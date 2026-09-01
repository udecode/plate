import type {
  BaseEditor,
  AnyEditor as Editor,
  EditorCommit,
  EditorDocumentValue,
  NamedRootKey,
  RootKey,
  NodeKey,
} from '../interfaces/editor';
import { LocationApi } from '../interfaces/location';
import { PathApi, type Path } from '../interfaces/path';
import { PointApi, type Point } from '../interfaces/point';
import { RangeApi, type Range } from '../interfaces/range';
import type { Text } from '../interfaces/text';
import { getDefined } from '../internal/get-defined';
import {
  type AnchorChangeContext,
  getAnchorRootIndex,
  getAnchorStateValue,
  subscribeAnchorState,
} from './anchor-state';
import {
  DocumentChange,
  getInternalDocumentRootChange,
} from './change/document-change';
import { DocumentIndex, nodeAtPath } from './change/document-index';
import { getRangeEndpointAssociations } from './change/range-association';
import type { TrackMode } from './change/root-change';
import type { JsonEditorValue, JsonNode } from './change/tokens';
import { getEditorRuntime } from './editor-runtime';
import { toPublicRoot } from './public-root';
import {
  getEditorDocumentValue,
  getEditorUpdateRoot,
  withEditorRootChildren,
} from './public-state';

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
  nodeKey: NodeKey | null;
};

type MappedPoint = {
  point: Point;
  runtimeStable: boolean;
};

const nodeKeyAt = (editor: Editor, root: string, path: Path) =>
  withEditorRootChildren(editor, root, () =>
    getEditorRuntime(editor).getNodeKey(path)
  );

const pathOfNodeKey = (editor: Editor, root: string, nodeKey: NodeKey) =>
  withEditorRootChildren(editor, root, () =>
    getEditorRuntime(editor).getPathByNodeKey(nodeKey)
  );

const rootNodes = (value: JsonEditorValue, root: string) =>
  root === 'main' ? value.children : (value.roots?.[root] ?? []);

const hasRoot = (value: JsonEditorValue, root: string) =>
  root === 'main' || Object.hasOwn(value.roots ?? {}, root);

const indexedRoot = (value: JsonEditorValue, root: string) =>
  DocumentIndex.fromValue(rootNodes(value, root));

const readValue = (editor: Editor) =>
  getEditorDocumentValue(editor) as JsonEditorValue;

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

const createPointState = (
  editor: Editor,
  value: JsonEditorValue,
  point: Point,
  root: RootKey,
  document = indexedRoot(value, root)
): PointState => {
  const localPoint = { offset: point.offset, path: [...point.path] };

  document.positionAt(localPoint);

  return {
    includeRoot: point.root !== undefined,
    point: localPoint,
    nodeKey: nodeKeyAt(editor, root, point.path),
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
  const pathNodeKey = pathValue
    ? (() => {
        try {
          return nodeKeyAt(runtimeEditor, root, pathValue);
        } catch {
          return null;
        }
      })()
    : null;
  const pathMode =
    pathValue?.length === 0
      ? 'root'
      : pathValue && !pathNodeKey
        ? 'boundary'
        : 'node';
  const pathBoundaryParentNodeKey =
    pathMode === 'boundary' && pathValue && pathValue.length > 1
      ? (() => {
          try {
            return nodeKeyAt(runtimeEditor, root, pathValue.slice(0, -1));
          } catch {
            return null;
          }
        })()
      : null;
  const sourceDocument = getAnchorRootIndex(
    runtimeEditor,
    sourceValue as EditorDocumentValue,
    root
  );
  if (pathValue && pathMode !== 'root') {
    if (pathMode === 'node') {
      sourceDocument.nodeRange(pathValue);
    } else {
      sourceDocument.childPosition(
        pathValue.slice(0, -1),
        getDefined(pathValue.at(-1))
      );
    }
  }
  let pointStates = pointValue
    ? [
        createPointState(
          runtimeEditor,
          sourceValue,
          pointValue,
          root,
          sourceDocument
        ),
      ]
    : rangeValue
      ? [
          createPointState(
            runtimeEditor,
            sourceValue,
            rangeValue.anchor,
            root,
            sourceDocument
          ),
          createPointState(
            runtimeEditor,
            sourceValue,
            rangeValue.focus,
            root,
            sourceDocument
          ),
        ]
      : [];
  const checkpoints: Array<{
    current: AnchorValue | null;
    pointStates: PointState[];
  }> = [];

  const cloneAnchorValue = (anchorValue: AnchorValue | null) => {
    if (anchorValue == null) return null;
    if (LocationApi.isPath(anchorValue)) return [...anchorValue];
    if (PointApi.isPoint(anchorValue)) {
      return { ...anchorValue, path: [...anchorValue.path] };
    }

    return {
      ...anchorValue,
      anchor: { ...anchorValue.anchor, path: [...anchorValue.anchor.path] },
      focus: { ...anchorValue.focus, path: [...anchorValue.focus.path] },
    };
  };

  const clonePointStates = () =>
    pointStates.map((state) => ({
      ...state,
      point: { ...state.point, path: [...state.point.path] },
    }));

  const syncStableNodeKeys = (nextValue: JsonEditorValue) => {
    if (current === null) {
      sourceValue = nextValue;
      return true;
    }

    if (kind === 'path') {
      if (pathMode === 'root') {
        current = hasRoot(nextValue, root) ? [] : null;
        sourceValue = nextValue;
        return true;
      }

      const stableNodeKey =
        pathMode === 'node' ? pathNodeKey : pathBoundaryParentNodeKey;
      const sourcePath =
        pathMode === 'node'
          ? (current as Path)
          : (current as Path).slice(0, -1);
      const runtimePath = stableNodeKey
        ? pathOfNodeKey(runtimeEditor, root, stableNodeKey)
        : null;

      if (!runtimePath) return false;

      try {
        const sourceNode = nodeAtPath(rootNodes(sourceValue, root), sourcePath);
        const nextNode = nodeAtPath(rootNodes(nextValue, root), runtimePath);

        if (sourceNode !== nextNode) return false;
      } catch {
        return false;
      }

      const nextPath =
        pathMode === 'node'
          ? [...runtimePath]
          : [...runtimePath, getDefined((current as Path).at(-1))];

      current = nextPath;
      sourceValue = nextValue;
      return true;
    }

    const stablePoints = pointStates.map((state) => {
      const runtimePath = state.nodeKey
        ? pathOfNodeKey(runtimeEditor, root, state.nodeKey)
        : null;

      if (!runtimePath) return null;

      try {
        const sourceNode = nodeAtPath(
          rootNodes(sourceValue, root),
          state.point.path
        );
        const nextNode = nodeAtPath(rootNodes(nextValue, root), runtimePath);

        if (sourceNode !== nextNode) return null;
      } catch {
        return null;
      }

      return { runtimePath, state };
    });

    if (stablePoints.some((entry) => entry === null)) return false;

    pointStates = stablePoints.map((entry) => {
      const stable = getDefined(entry);
      const point = {
        offset: stable.state.point.offset,
        path: [...stable.runtimePath],
      };

      return {
        ...stable.state,
        point,
      };
    });
    const points = pointStates.map((state) =>
      withPublicPointRoot(state.point, root, state.includeRoot)
    );

    if (kind === 'point') {
      if (!PointApi.equals(current as Point, points[0])) current = points[0];
    } else if (
      !PointApi.equals((current as Range).anchor, points[0]) ||
      !PointApi.equals((current as Range).focus, points[1])
    ) {
      current = { anchor: points[0], focus: points[1] };
    }
    sourceValue = nextValue;
    return true;
  };

  const resolveMappedPoint = (
    state: PointState,
    change: DocumentChange,
    source: DocumentIndex,
    next: DocumentIndex,
    endpointAssociation: -1 | 1,
    preserveSamePathOffset: boolean,
    context?: AnchorChangeContext
  ): MappedPoint | null => {
    const runtimePath = state.nodeKey
      ? pathOfNodeKey(runtimeEditor, root, state.nodeKey)
      : null;
    // Skipped edits can shift absolute positions without changing this point.
    const position = change.mapPosition(source.positionAt(state.point), {
      association: endpointAssociation === -1 ? 'backward' : 'forward',
      ...(root === 'main' ? {} : { root }),
      track,
    });
    const canonicalPoint =
      position == null ? null : next.pointAt(position, endpointAssociation);
    const canonicalMapping = canonicalPoint
      ? {
          point: withPublicPointRoot(canonicalPoint, root, state.includeRoot),
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

        const readOffset = () =>
          mapTextOffset(
            sourceNode,
            currentNode,
            state.point.offset,
            endpointAssociation,
            track
          );
        const offset = context
          ? context.memoize(
              [
                'text-offset',
                root,
                state.nodeKey ?? state.point.path.join('.'),
                state.point.offset,
                endpointAssociation,
                track ?? '',
              ].join('\u0000'),
              readOffset
            )
          : readOffset();

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

    if (!providedChange && syncStableNodeKeys(nextValue)) return;

    const change =
      providedChange ?? DocumentChange.between(sourceValue, nextValue);

    if (change.empty) {
      sourceValue = nextValue;
      return;
    }

    const getSourceDocument = () =>
      context?.beforeRoot(root) ?? indexedRoot(sourceValue, root);
    const nextDocument = () =>
      context?.afterRoot(root) ?? indexedRoot(nextValue, root);

    if (kind === 'path') {
      if (pathMode === 'root') {
        current = hasRoot(nextValue, root) ? [] : null;
        sourceValue = nextValue;
        return;
      }

      const runtimePath = pathNodeKey
        ? pathOfNodeKey(runtimeEditor, root, pathNodeKey)
        : null;

      if (runtimePath) {
        current = [...runtimePath];
        sourceValue = nextValue;
        return;
      }

      const pathWasRemoved = (() => {
        if (pathMode !== 'node' || !current) return false;

        const nodeRange = getSourceDocument().nodeRange(current as Path);
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
        sourceValue = nextValue;
        return;
      }

      const path = current as Path;
      const position = change.mapPosition(
        pathMode === 'node'
          ? getSourceDocument().nodeRange(path).from
          : getSourceDocument().childPosition(
              path.slice(0, -1),
              getDefined(path.at(-1))
            ),
        {
          association: association === 'backward' ? 'backward' : 'forward',
          ...(root === 'main' ? {} : { root }),
          track,
        }
      );
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
    } else {
      const associations =
        kind === 'point'
          ? ([association === 'backward' ? -1 : 1] as const)
          : getRangeEndpointAssociations(
              PointApi.equals(
                (current as Range).anchor,
                (current as Range).focus
              )
                ? 'collapsed'
                : PointApi.isBefore(
                      (current as Range).anchor,
                      (current as Range).focus
                    )
                  ? 'forward'
                  : 'backward',
              association
            );

      const mappedPoints = pointStates.map((state, index) => {
        const read = () =>
          resolveMappedPoint(
            state,
            change,
            getSourceDocument(),
            nextDocument(),
            associations[index],
            context?.replace === true,
            context
          );
        if (!context) return read();
        const mapped = context.memoize(
          JSON.stringify([
            'point',
            root,
            state.point.path,
            state.point.offset,
            state.nodeKey,
            state.includeRoot,
            associations[index],
            track,
          ]),
          read
        );
        return mapped
          ? {
              ...mapped,
              point: withPublicPointRoot(mapped.point, root, state.includeRoot),
            }
          : null;
      });
      const points = mappedPoints.map((mapped) => mapped?.point ?? null);
      const nextPointStates = mappedPoints.map((mapped, index) => {
        if (!mapped) return null;

        const previous = pointStates[index];
        if (mapped.runtimeStable) {
          return {
            ...previous,
            point: {
              offset: mapped.point.offset,
              path: [...mapped.point.path],
            },
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
          ? [getDefined(nextPointStates[0])]
          : [getDefined(nextPointStates[0]), getDefined(nextPointStates[1])]
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
          pointStates: clonePointStates(),
        });
      },
      change(context) {
        mapTo(context.after, undefined, context.change, context);
      },
      commit(innerValue, commit) {
        if (innerValue) mapTo(innerValue, commit);
        checkpoints.length = 0;
      },
      discard(innerValue2) {
        const checkpoint = checkpoints.pop();

        if (checkpoint) {
          ({ current, pointStates } = checkpoint);
          sourceValue = innerValue2;
          return;
        }

        // An anchor created inside an aborted transaction cannot safely retain a
        // location that only existed in the discarded draft.
        current = null;
        pointStates = [];
        sourceValue = innerValue2;
      },
      fallback: () =>
        current !== null &&
        kind === 'path' &&
        (pathMode === 'root' ||
          (pathMode === 'boundary' && !pathBoundaryParentNodeKey)),
      nodeKeys: () => {
        if (current === null) return [];
        if (kind === 'path') {
          const nodeKey =
            pathMode === 'node' ? pathNodeKey : pathBoundaryParentNodeKey;

          return nodeKey ? [nodeKey] : [];
        }

        return pointStates.flatMap((state) =>
          state.nodeKey ? [state.nodeKey] : []
        );
      },
      root,
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

      const innerValue3 =
        (getAnchorStateValue(runtimeEditor) as JsonEditorValue | undefined) ??
        readValue(runtimeEditor);

      if (innerValue3 !== sourceValue) {
        if (!subscription.isShadowed()) {
          mapTo(innerValue3);
        } else {
          const checkpoint = {
            current: cloneAnchorValue(current),
            pointStates: clonePointStates(),
            sourceValue,
          };

          mapTo(innerValue3);
          const resolved = cloneAnchorValue(current);

          ({ current, pointStates, sourceValue } = checkpoint);

          return resolved as TValue | null;
        }
      }

      return current as TValue | null;
    },
    root: toPublicRoot(root),
  }) as Anchor<TValue>;
}
