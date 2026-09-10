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
  RECOVERY_AFTER_A,
  RECOVERY_AFTER_A_FORWARD,
  RECOVERY_AFTER_B,
  RECOVERY_AFTER_B_FORWARD,
  RECOVERY_ASSOCIATION_BACKWARD,
  RECOVERY_ASSOCIATION_FORWARD,
  RECOVERY_ASSOCIATION_INWARD,
  RECOVERY_ASSOCIATION_OUTWARD,
  RECOVERY_ASSOCIATION_SHIFT,
  RECOVERY_BEFORE_A,
  RECOVERY_BEFORE_A_FORWARD,
  RECOVERY_BEFORE_B,
  RECOVERY_BEFORE_B_FORWARD,
  RECOVERY_FLAGS,
  RECOVERY_ID,
  RECOVERY_INCLUDE_ROOT_A,
  RECOVERY_INCLUDE_ROOT_B,
  RECOVERY_KIND_PATH,
  RECOVERY_KIND_POINT,
  RECOVERY_KIND_RANGE,
  RECOVERY_NULL_POSITION,
  RECOVERY_PATH_MODE_BOUNDARY,
  RECOVERY_PATH_MODE_NODE,
  RECOVERY_PATH_MODE_ROOT,
  RECOVERY_PATH_MODE_SHIFT,
  RECOVERY_ROOT,
  subscribeAnchorState,
} from './anchor-state';
import {
  DocumentChange,
  getInternalDocumentRootChange,
} from './change/document-change';
import { DocumentIndex, nodeAtPath } from './change/document-index';
import { getRangeEndpointAssociations } from './change/range-association';
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

const mapAnchorPosition = (
  change: DocumentChange,
  position: number,
  association: -1 | 1,
  deletion: AnchorDeletionPolicy,
  root?: string
) => {
  const mapOptions = {
    association:
      association === -1 ? ('backward' as const) : ('forward' as const),
    ...(root && root !== 'main' ? { root } : {}),
  };
  const tracked = change.mapPosition(position, {
    ...mapOptions,
    track: 'around',
  });

  return tracked !== null || deletion === 'drop'
    ? tracked
    : change.mapPosition(position, mapOptions);
};

const mapTextOffset = (
  source: JsonNode & Text,
  current: JsonNode & Text,
  offset: number,
  association: -1 | 1,
  deletion: AnchorDeletionPolicy,
  context: AnchorChangeContext | undefined,
  root: string,
  identity: readonly unknown[]
) => {
  if (source.text === current.text) {
    return Math.min(offset, current.text.length);
  }

  const prepare = () => {
    const before = { children: [source] } satisfies JsonEditorValue;
    const after = { children: [current] } satisfies JsonEditorValue;

    return {
      after: DocumentIndex.fromValue(after.children),
      before: DocumentIndex.fromValue(before.children),
      change: DocumentChange.between(before, after),
    };
  };
  const mapping = context
    ? context.memoize(
        JSON.stringify(['text-pair-change', root, identity]),
        prepare
      )
    : prepare();
  const position = mapping.before.positionAt({ offset, path: [0] });
  const mapped = mapAnchorPosition(
    mapping.change,
    position,
    association,
    deletion
  );

  return mapped == null
    ? null
    : (mapping.after.pointAt(mapped, association)?.offset ?? null);
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
  let sourceValue =
    (getAnchorStateValue(runtimeEditor) as JsonEditorValue | undefined) ??
    readValue(runtimeEditor);
  let released = false;
  let current: AnchorValue | null = value;
  let pathNodeKey = pathValue
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
  let pathBoundaryParentNodeKey =
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
    recoveryActive: boolean;
    recoveryBefore: boolean;
    recoveryFirst: number;
    recoveryFlags: number;
    recoverySecond: number;
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

  const recoveryAssociation =
    association === 'backward'
      ? RECOVERY_ASSOCIATION_BACKWARD
      : association === 'forward'
        ? RECOVERY_ASSOCIATION_FORWARD
        : association === 'inward'
          ? RECOVERY_ASSOCIATION_INWARD
          : RECOVERY_ASSOCIATION_OUTWARD;
  const recoveryKind =
    kind === 'path'
      ? RECOVERY_KIND_PATH
      : kind === 'point'
        ? RECOVERY_KIND_POINT
        : RECOVERY_KIND_RANGE;
  const recoveryPathMode =
    pathMode === 'root'
      ? RECOVERY_PATH_MODE_ROOT
      : pathMode === 'node'
        ? RECOVERY_PATH_MODE_NODE
        : RECOVERY_PATH_MODE_BOUNDARY;
  const baseRecoveryFlags =
    recoveryKind |
    (recoveryPathMode << RECOVERY_PATH_MODE_SHIFT) |
    (recoveryAssociation << RECOVERY_ASSOCIATION_SHIFT);
  const encodeRecoveryPoint = (
    document: DocumentIndex,
    state: PointState,
    memoize: <T>(
      phase: 'after' | 'before',
      nodeKey: NodeKey | null,
      path: readonly number[],
      pointOffset: number,
      read: () => T
    ) => T,
    phase: 'after' | 'before'
  ) =>
    memoize(
      phase,
      state.nodeKey,
      state.point.path,
      state.point.offset,
      (): readonly [number, -1 | 1] => {
        const position = document.positionAt(state.point);
        const backward = document.pointAt(position, -1);

        if (backward && PointApi.equals(backward, state.point)) {
          return [position, -1];
        }
        const forward = document.pointAt(position, 1);

        if (forward && PointApi.equals(forward, state.point)) {
          return [position, 1];
        }
        throw new Error('Cannot encode anchor point recovery.');
      }
    );
  const recoveryPathPosition = (
    anchorValue: AnchorValue | null,
    document: DocumentIndex
  ) => {
    if (anchorValue === null) return RECOVERY_NULL_POSITION;
    if (pathMode === 'root') return 0;
    const path = anchorValue as Path;

    return pathMode === 'node'
      ? document.nodeRange(path).from
      : document.childPosition(path.slice(0, -1), getDefined(path.at(-1)));
  };
  const appendHistoryRecovery = (
    data: Int32Array,
    offset: number,
    id: number,
    rootIndex: number,
    beforeDocument: DocumentIndex,
    afterDocument: DocumentIndex,
    memoize: <T>(
      phase: 'after' | 'before',
      nodeKey: NodeKey | null,
      path: readonly number[],
      pointOffset: number,
      read: () => T
    ) => T
  ) => {
    const checkpoint = checkpoints.at(-1);

    if (!checkpoint) return false;
    let flags = baseRecoveryFlags;
    let beforeA = RECOVERY_NULL_POSITION;
    let beforeB = RECOVERY_NULL_POSITION;
    let afterA = RECOVERY_NULL_POSITION;
    let afterB = RECOVERY_NULL_POSITION;

    if (checkpoint.recoveryActive) {
      beforeA = checkpoint.recoveryFirst;
      beforeB = checkpoint.recoverySecond;
      flags |=
        checkpoint.recoveryFlags &
        (RECOVERY_INCLUDE_ROOT_A | RECOVERY_INCLUDE_ROOT_B);
      const firstSideBit = checkpoint.recoveryBefore
        ? RECOVERY_BEFORE_A_FORWARD
        : RECOVERY_AFTER_A_FORWARD;
      const secondSideBit = checkpoint.recoveryBefore
        ? RECOVERY_BEFORE_B_FORWARD
        : RECOVERY_AFTER_B_FORWARD;

      if ((checkpoint.recoveryFlags & firstSideBit) !== 0) {
        flags |= RECOVERY_BEFORE_A_FORWARD;
      }
      if ((checkpoint.recoveryFlags & secondSideBit) !== 0) {
        flags |= RECOVERY_BEFORE_B_FORWARD;
      }
    } else if (kind === 'path') {
      beforeA = recoveryPathPosition(checkpoint.current, beforeDocument);
    } else {
      const beforeStates = checkpoint.pointStates;

      if (checkpoint.current && beforeStates[0]) {
        const [position, side] = encodeRecoveryPoint(
          beforeDocument,
          beforeStates[0],
          memoize,
          'before'
        );

        beforeA = position;
        if (beforeStates[0].includeRoot) flags |= RECOVERY_INCLUDE_ROOT_A;
        if (side === 1) {
          flags |= RECOVERY_BEFORE_A_FORWARD;
        }
      }
      if (kind === 'range' && checkpoint.current && beforeStates[1]) {
        const [position, side] = encodeRecoveryPoint(
          beforeDocument,
          beforeStates[1],
          memoize,
          'before'
        );

        beforeB = position;
        if (beforeStates[1].includeRoot) flags |= RECOVERY_INCLUDE_ROOT_B;
        if (side === 1) {
          flags |= RECOVERY_BEFORE_B_FORWARD;
        }
      }
    }

    if (pendingRecoveryActive) {
      afterA = pendingRecoveryFirst;
      afterB = pendingRecoverySecond;
      flags |=
        pendingRecoveryFlags &
        (RECOVERY_INCLUDE_ROOT_A | RECOVERY_INCLUDE_ROOT_B);
      const firstSideBit = pendingRecoveryBefore
        ? RECOVERY_BEFORE_A_FORWARD
        : RECOVERY_AFTER_A_FORWARD;
      const secondSideBit = pendingRecoveryBefore
        ? RECOVERY_BEFORE_B_FORWARD
        : RECOVERY_AFTER_B_FORWARD;

      if ((pendingRecoveryFlags & firstSideBit) !== 0) {
        flags |= RECOVERY_AFTER_A_FORWARD;
      }
      if ((pendingRecoveryFlags & secondSideBit) !== 0) {
        flags |= RECOVERY_AFTER_B_FORWARD;
      }
    } else if (kind === 'path') {
      afterA = recoveryPathPosition(current, afterDocument);
    } else {
      if (current && pointStates[0]) {
        const [position, side] = encodeRecoveryPoint(
          afterDocument,
          pointStates[0],
          memoize,
          'after'
        );

        afterA = position;
        if (pointStates[0].includeRoot) flags |= RECOVERY_INCLUDE_ROOT_A;
        if (side === 1) {
          flags |= RECOVERY_AFTER_A_FORWARD;
        }
      }
      if (kind === 'range' && current && pointStates[1]) {
        const [position, side] = encodeRecoveryPoint(
          afterDocument,
          pointStates[1],
          memoize,
          'after'
        );

        afterB = position;
        if (pointStates[1].includeRoot) flags |= RECOVERY_INCLUDE_ROOT_B;
        if (side === 1) {
          flags |= RECOVERY_AFTER_B_FORWARD;
        }
      }
    }

    data[offset + RECOVERY_ID] = id;
    data[offset + RECOVERY_ROOT] = rootIndex;
    data[offset + RECOVERY_FLAGS] = flags;
    data[offset + RECOVERY_BEFORE_A] = beforeA;
    data[offset + RECOVERY_BEFORE_B] = beforeB;
    data[offset + RECOVERY_AFTER_A] = afterA;
    data[offset + RECOVERY_AFTER_B] = afterB;

    return true;
  };
  let pendingRecoveryActive = false;
  let pendingRecoveryBefore = false;
  let pendingRecoveryFirst = RECOVERY_NULL_POSITION;
  let pendingRecoveryFlags = 0;
  let pendingRecoverySecond = RECOVERY_NULL_POSITION;
  const applyHistoryRecovery = (
    flags: number,
    first: number,
    second: number,
    documentValue: EditorDocumentValue,
    memoize: <T>(position: number, side: -1 | 1, read: () => T) => T,
    before: boolean
  ) => {
    const previousNodeKeys =
      kind === 'path'
        ? [pathNodeKey, pathBoundaryParentNodeKey]
        : pointStates.map((state) => state.nodeKey);
    const document = getAnchorRootIndex(runtimeEditor, documentValue, root);

    if (kind === 'path') {
      const restoredPath =
        first === RECOVERY_NULL_POSITION
          ? null
          : pathMode === 'root'
            ? hasRoot(documentValue, root)
              ? []
              : null
            : pathMode === 'node'
              ? document.nodeStartingAt(first)?.path
              : (() => {
                  const boundary = document.childBoundaryAt(first);

                  return boundary
                    ? [...boundary.parentPath, boundary.index]
                    : null;
                })();

      current = restoredPath ? [...restoredPath] : null;
      pathNodeKey =
        pathMode === 'node' && restoredPath
          ? nodeKeyAt(runtimeEditor, root, restoredPath)
          : null;
      pathBoundaryParentNodeKey =
        pathMode === 'boundary' && restoredPath && restoredPath.length > 1
          ? nodeKeyAt(runtimeEditor, root, restoredPath.slice(0, -1))
          : null;
      sourceValue = documentValue;

      return (
        previousNodeKeys[0] !== pathNodeKey ||
        previousNodeKeys[1] !== pathBoundaryParentNodeKey
      );
    }

    const firstSideBit = before
      ? RECOVERY_BEFORE_A_FORWARD
      : RECOVERY_AFTER_A_FORWARD;
    const secondSideBit = before
      ? RECOVERY_BEFORE_B_FORWARD
      : RECOVERY_AFTER_B_FORWARD;
    const restorePoint = (
      position: number,
      sideBit: number,
      includeRootBit: number
    ) => {
      if (position === RECOVERY_NULL_POSITION) return null;
      const side = (flags & sideBit) === 0 ? -1 : 1;
      const point = memoize(position, side, () =>
        document.pointAt(position, side)
      );

      return point
        ? withPublicPointRoot(point, root, (flags & includeRootBit) !== 0)
        : null;
    };
    const restoredFirstPoint = restorePoint(
      first,
      firstSideBit,
      RECOVERY_INCLUDE_ROOT_A
    );
    const secondPoint =
      kind === 'range'
        ? restorePoint(second, secondSideBit, RECOVERY_INCLUDE_ROOT_B)
        : null;

    current =
      kind === 'point'
        ? restoredFirstPoint
        : restoredFirstPoint && secondPoint
          ? { anchor: restoredFirstPoint, focus: secondPoint }
          : null;
    const restoredPoints = current
      ? kind === 'point'
        ? [current as Point]
        : [(current as Range).anchor, (current as Range).focus]
      : [];
    pointStates = restoredPoints.map((point, index) => {
      const previous = previousNodeKeys[index];
      const previousState = pointStates[index];
      const localPoint = { offset: point.offset, path: [...point.path] };
      const nodeKey =
        previous &&
        previousState &&
        PathApi.equals(previousState.point.path, localPoint.path)
          ? previous
          : nodeKeyAt(runtimeEditor, root, localPoint.path);

      return {
        includeRoot: point.root !== undefined,
        nodeKey,
        point: localPoint,
      };
    });
    sourceValue = documentValue;

    return (
      previousNodeKeys.length !== pointStates.length ||
      previousNodeKeys.some(
        (nodeKey, index) => nodeKey !== pointStates[index]?.nodeKey
      )
    );
  };
  const materializeHistoryRecovery = () => {
    if (!pendingRecoveryActive) return;

    const changedNodeKeys = applyHistoryRecovery(
      pendingRecoveryFlags,
      pendingRecoveryFirst,
      pendingRecoverySecond,
      sourceValue as EditorDocumentValue,
      <T>(_position: number, _side: -1 | 1, read: () => T) => read(),
      pendingRecoveryBefore
    );

    pendingRecoveryActive = false;
    if (changedNodeKeys) {
      throw new Error('Deferred anchor recovery changed its node index.');
    }
  };
  const restoreHistoryRecovery = (
    data: Int32Array,
    offset: number,
    target: 'after' | 'before',
    documentValue: EditorDocumentValue,
    memoize: <T>(position: number, side: -1 | 1, read: () => T) => T,
    defer: boolean
  ) => {
    const firstIndex =
      target === 'before' ? RECOVERY_BEFORE_A : RECOVERY_AFTER_A;
    const secondIndex =
      target === 'before' ? RECOVERY_BEFORE_B : RECOVERY_AFTER_B;
    const flags = data[offset + RECOVERY_FLAGS];
    const first = data[offset + firstIndex];
    const second = data[offset + secondIndex];

    if (defer) {
      pendingRecoveryActive = true;
      pendingRecoveryBefore = target === 'before';
      pendingRecoveryFirst = first;
      pendingRecoveryFlags = flags;
      pendingRecoverySecond = second;
      sourceValue = documentValue;

      return false;
    }

    const changedNodeKeys = applyHistoryRecovery(
      flags,
      first,
      second,
      documentValue,
      memoize,
      target === 'before'
    );

    return changedNodeKeys;
  };
  const mapPendingHistoryRecovery = (
    nextValue: JsonEditorValue,
    context: AnchorChangeContext
  ) => {
    if (
      !pendingRecoveryActive ||
      kind === 'path' ||
      context.replace ||
      context.structural(root)
    ) {
      return false;
    }
    if (
      pendingRecoveryFirst === RECOVERY_NULL_POSITION ||
      (kind === 'range' && pendingRecoverySecond === RECOVERY_NULL_POSITION)
    ) {
      pendingRecoveryFirst = RECOVERY_NULL_POSITION;
      pendingRecoverySecond = RECOVERY_NULL_POSITION;
      sourceValue = nextValue;

      return true;
    }

    const associations =
      kind === 'point'
        ? ([association === 'backward' ? -1 : 1] as const)
        : getRangeEndpointAssociations(
            pendingRecoveryFirst === pendingRecoverySecond
              ? 'collapsed'
              : pendingRecoveryFirst < pendingRecoverySecond
                ? 'forward'
                : 'backward',
            association
          );
    const mappedFirst = context.mapRecoveryPoint(
      root,
      pendingRecoveryFirst,
      associations[0]
    );
    const mappedSecond =
      kind === 'range'
        ? context.mapRecoveryPoint(
            root,
            pendingRecoverySecond,
            getDefined(associations[1])
          )
        : RECOVERY_NULL_POSITION;

    pendingRecoveryFirst = mappedFirst ?? RECOVERY_NULL_POSITION;
    pendingRecoverySecond = mappedSecond ?? RECOVERY_NULL_POSITION;
    const firstSideBit = pendingRecoveryBefore
      ? RECOVERY_BEFORE_A_FORWARD
      : RECOVERY_AFTER_A_FORWARD;
    const secondSideBit = pendingRecoveryBefore
      ? RECOVERY_BEFORE_B_FORWARD
      : RECOVERY_AFTER_B_FORWARD;

    pendingRecoveryFlags =
      associations[0] === 1
        ? pendingRecoveryFlags | firstSideBit
        : pendingRecoveryFlags & ~firstSideBit;
    if (kind === 'range') {
      pendingRecoveryFlags =
        getDefined(associations[1]) === 1
          ? pendingRecoveryFlags | secondSideBit
          : pendingRecoveryFlags & ~secondSideBit;
    }
    sourceValue = nextValue;

    return true;
  };

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
    const position = mapAnchorPosition(
      change,
      source.positionAt(state.point),
      endpointAssociation,
      options.deletion,
      root
    );
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

    if (runtimePath) {
      const sourceNode = source.node(state.point.path);
      const currentNode = next.node(runtimePath);

      if (sourceNode === currentNode && isTextNode(currentNode)) {
        return {
          point: withPublicPointRoot(
            { offset: state.point.offset, path: runtimePath },
            root,
            state.includeRoot
          ),
          runtimeStable: true,
        };
      }
    }
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

        const readOffset = () =>
          mapTextOffset(
            sourceNode,
            currentNode,
            state.point.offset,
            endpointAssociation,
            options.deletion,
            context,
            root,
            state.nodeKey === null
              ? ['path', state.point.path]
              : ['node', state.nodeKey]
          );
        const offset = context
          ? context.memoize(
              [
                'text-offset',
                root,
                state.nodeKey ?? state.point.path.join('.'),
                state.point.offset,
                endpointAssociation,
                options.deletion,
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
    if (nextValue === sourceValue) return;
    if (context && mapPendingHistoryRecovery(nextValue, context)) return;
    materializeHistoryRecovery();
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

      const stableNodeKey =
        pathMode === 'node' ? pathNodeKey : pathBoundaryParentNodeKey;
      const runtimePath = stableNodeKey
        ? pathOfNodeKey(runtimeEditor, root, stableNodeKey)
        : null;

      if (runtimePath) {
        if (pathMode === 'node') {
          current = [...runtimePath];
          sourceValue = nextValue;
          return;
        }

        try {
          const sourceParent = nodeAtPath(
            rootNodes(sourceValue, root),
            (current as Path).slice(0, -1)
          );
          const nextParent = nodeAtPath(
            rootNodes(nextValue, root),
            runtimePath
          );

          if (sourceParent === nextParent) {
            current = [...runtimePath, getDefined((current as Path).at(-1))];
            sourceValue = nextValue;
            return;
          }
        } catch {
          // Canonical position mapping below handles a replaced parent.
        }
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
      const position = mapAnchorPosition(
        change,
        pathMode === 'node'
          ? getSourceDocument().nodeRange(path).from
          : getSourceDocument().childPosition(
              path.slice(0, -1),
              getDefined(path.at(-1))
            ),
        association === 'backward' ? -1 : 1,
        options.deletion,
        root
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
            options.deletion,
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
          current: pendingRecoveryActive ? null : cloneAnchorValue(current),
          pointStates: pendingRecoveryActive ? [] : clonePointStates(),
          recoveryActive: pendingRecoveryActive,
          recoveryBefore: pendingRecoveryBefore,
          recoveryFirst: pendingRecoveryFirst,
          recoveryFlags: pendingRecoveryFlags,
          recoverySecond: pendingRecoverySecond,
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
          if (checkpoint.recoveryActive) {
            pendingRecoveryActive = true;
            pendingRecoveryBefore = checkpoint.recoveryBefore;
            pendingRecoveryFirst = checkpoint.recoveryFirst;
            pendingRecoveryFlags = checkpoint.recoveryFlags;
            pendingRecoverySecond = checkpoint.recoverySecond;
            sourceValue = innerValue2;

            return;
          }
          pendingRecoveryActive = false;
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
      fallback: () => {
        if (kind !== 'path') return false;
        materializeHistoryRecovery();

        return (
          current !== null &&
          kind === 'path' &&
          (pathMode === 'root' ||
            (pathMode === 'boundary' && !pathBoundaryParentNodeKey))
        );
      },
      ...(options.deletion === 'nearest'
        ? {
            history: {
              capture: appendHistoryRecovery,
              restore: restoreHistoryRecovery,
            },
          }
        : {}),
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
      materializeHistoryRecovery();

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
