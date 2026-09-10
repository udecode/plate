import type {
  Descendant,
  Editor as EditorType,
  EditorCommit,
  EditorSnapshot,
  NodeKey,
  Path,
  PliteDecoration,
  PliteDecorationAttributes,
  PliteDecorationRefresh,
  PliteDecorationSource,
  Range,
} from '..';
import { NodeApi } from '..';
import { createViewSourceFaultBoundary } from '../internal/view/mapped-view-store';
import type { PliteViewSourceErrorSink } from '../internal/view/view-source';
import { getPureTextInsertion } from './editable/native-text-input-delta';
import {
  getSnapshot as editorGetSnapshot,
  projectRangeInSnapshot,
  subscribeSource as editorSubscribeSource,
} from './editable/runtime-editor-api';

export type {
  PliteDecoration,
  PliteDecorationAttributes,
  PliteDecorationRefresh,
  PliteDecorationSource,
} from '..';

export type PliteDecorationSlice = Readonly<{
  attributes: PliteDecorationAttributes;
  end: number;
  key: string;
  start: number;
}>;

const DECORATION_SLICE_IDENTITIES = new WeakMap<PliteDecorationSlice, string>();

export const getDecorationSliceIdentity = (slice: PliteDecorationSlice) =>
  DECORATION_SLICE_IDENTITIES.get(slice) ?? slice.key;

const createDecorationSlice = (
  sourceId: string,
  slice: PliteDecorationSlice
) => {
  const result = Object.freeze(slice);

  DECORATION_SLICE_IDENTITIES.set(
    result,
    JSON.stringify([sourceId, slice.key])
  );

  return result;
};

export type PliteDecorationManagerMetrics = Readonly<{
  bucketReadCount: number;
  changedBucketCount: number;
  downstreamNodeSubscriptionCount: number;
  failureCount: number;
  invalidRangeDropCount: number;
  sourceCount: number;
  sourceObserverCount: number;
  sourceReadCount: number;
  wakeCount: number;
}>;

export type PliteDecorationManager<E = EditorType> = Readonly<{
  destroy: () => void;
  getMetrics: () => PliteDecorationManagerMetrics;
  getNodeSnapshot: (nodeKey: NodeKey) => readonly PliteDecorationSlice[];
  getVersion: () => number;
  hasSources: () => boolean;
  mount: () => () => void;
  registerSource: (source: PliteDecorationSource<E>) => () => void;
  setSources: (sources: ReadonlyArray<PliteDecorationSource<E>>) => void;
  subscribe: (
    listener: (changedNodeKeys: readonly NodeKey[]) => void
  ) => () => void;
  subscribeNodeKey: (nodeKey: NodeKey, listener: () => void) => () => void;
}>;

type DecorationOutputPart = Readonly<{
  inputKey: NodeKey;
  slices: readonly PliteDecorationSlice[];
}>;

type CompiledDecorationInputPart = Readonly<{
  nodeKey: NodeKey;
  slices: readonly PliteDecorationSlice[];
}>;

type DecorationSourceBucketChange = Readonly<{
  next: readonly PliteDecorationSlice[];
  nodeKey: NodeKey;
  previous: readonly PliteDecorationSlice[];
}>;

type DecorationKeyOwners = {
  has: (key: string) => boolean;
  set: (key: string, owner: NodeKey) => void;
};

type CompiledDecorationSourceSnapshot = Readonly<{
  bucketsByOutputKey: Map<NodeKey, readonly PliteDecorationSlice[]>;
  keysByInputKey: Map<NodeKey, readonly string[]>;
  outputKeysByInputKey: Map<NodeKey, readonly NodeKey[]>;
  partsByOutputKey: Map<NodeKey, DecorationOutputPart[]>;
  keyOwners: Map<string, NodeKey>;
}>;

type DecorationSourceState<E> = {
  cleanup: (() => void) | null;
  definition: PliteDecorationSource<E>;
  faultBoundary: ReturnType<typeof createViewSourceFaultBoundary>;
  generation: number;
  observationGeneration: number;
  snapshot: CompiledDecorationSourceSnapshot;
};

const EMPTY_DECORATION_SLICES = Object.freeze(
  []
) as readonly PliteDecorationSlice[];

const createEmptyCompiledSourceSnapshot =
  (): CompiledDecorationSourceSnapshot => ({
    bucketsByOutputKey: new Map(),
    keysByInputKey: new Map(),
    outputKeysByInputKey: new Map(),
    partsByOutputKey: new Map(),
    keyOwners: new Map(),
  });

const getDescendantAtPath = (
  children: readonly Descendant[],
  path: Path
): Descendant | null => {
  if (path.length === 0) return null;

  let node = children[path[0]] ?? null;

  for (const index of path.slice(1)) {
    if (!node || !NodeApi.isElement(node)) return null;
    node = node.children[index] ?? null;
  }

  return node;
};

const comparePaths = (left: Path, right: Path) => {
  for (let index = 0; index < Math.min(left.length, right.length); index++) {
    const difference = left[index] - right[index];

    if (difference !== 0) return difference;
  }

  return left.length - right.length;
};

const frozenDataRecords = new WeakSet<object>();
const isFrozenDataRecord = (
  value: object,
  required: readonly string[] = []
) => {
  if (!frozenDataRecords.has(value)) {
    const prototype = Object.getPrototypeOf(value);

    if (
      (prototype !== null && prototype !== Object.prototype) ||
      !Object.isFrozen(value) ||
      !Object.getOwnPropertyNames(value).every((name) =>
        Object.hasOwn(
          Object.getOwnPropertyDescriptor(value, name) ?? {},
          'value'
        )
      )
    ) {
      return false;
    }
    frozenDataRecords.add(value);
  }
  return required.every((name) => Object.hasOwn(value, name));
};

const frozenPaths = new WeakSet<Path>();
const isFrozenPath = (path: Path) => {
  if (frozenPaths.has(path)) return true;
  if (
    !Object.isFrozen(path) ||
    Object.getPrototypeOf(path) !== Array.prototype
  ) {
    return false;
  }
  for (let index = 0; index < path.length; index++) {
    const descriptor = Object.getOwnPropertyDescriptor(path, index);

    if (
      !descriptor ||
      !('value' in descriptor) ||
      !Number.isInteger(descriptor.value) ||
      descriptor.value < 0
    ) {
      return false;
    }
  }
  frozenPaths.add(path);
  return true;
};

const immutableAttributes = new WeakSet<PliteDecorationAttributes>();
const cloneDecorationAttributes = (
  attributes: PliteDecorationAttributes
): PliteDecorationAttributes => {
  if (immutableAttributes.has(attributes)) return attributes;
  const cloned: Record<string, unknown> = {};

  for (const name of Object.keys(attributes)) {
    const value = Reflect.get(attributes, name) as unknown;

    if (name === 'className') {
      if (value !== undefined && typeof value !== 'string') {
        throw new Error('Decoration className must be a string.');
      }
    } else if (name === 'style') {
      if (
        value !== undefined &&
        (typeof value !== 'object' || value === null || Array.isArray(value))
      ) {
        throw new Error('Decoration style must be an object.');
      }
    } else if (!name.startsWith('aria-') && !name.startsWith('data-')) {
      throw new Error(`Unsupported Decoration attribute "${name}".`);
    } else if (
      value !== undefined &&
      typeof value !== 'boolean' &&
      typeof value !== 'number' &&
      typeof value !== 'string'
    ) {
      throw new Error(
        `Decoration attribute "${name}" must be a primitive value.`
      );
    }

    cloned[name] =
      name === 'style' && value
        ? Object.freeze({ ...(value as Record<string, unknown>) })
        : value;
  }

  return Object.freeze(cloned) as PliteDecorationAttributes;
};

const arePathsEqual = (left: Path, right: Path) => {
  if (left === right) return true;
  if (left.length !== right.length) return false;

  for (let index = 0; index < left.length; index++) {
    if (left[index] !== right[index]) return false;
  }

  return true;
};

const isDecorationPoint = (value: unknown): value is Range['anchor'] => {
  if (typeof value !== 'object' || value === null) return false;

  const point = value as Range['anchor'];

  if (
    typeof point.offset !== 'number' ||
    (point.root !== undefined && typeof point.root !== 'string') ||
    !Array.isArray(point.path)
  ) {
    return false;
  }
  for (const index of point.path) {
    if (typeof index !== 'number') return false;
  }

  return true;
};

const isDecorationRange = (value: unknown): value is Range => {
  if (typeof value !== 'object' || value === null) return false;

  const range = value as Range;

  return isDecorationPoint(range.anchor) && isDecorationPoint(range.focus);
};

const areDecorationSlicesEqual = (
  left: PliteDecorationSlice,
  right: PliteDecorationSlice
) =>
  left === right ||
  (getDecorationSliceIdentity(left) === getDecorationSliceIdentity(right) &&
    left.start === right.start &&
    left.end === right.end &&
    areDecorationAttributesEqual(left.attributes, right.attributes));

const areDecorationStylesEqual = (
  left: Readonly<Record<string, unknown>>,
  right: Readonly<Record<string, unknown>>
) => {
  if (left === right) return true;
  const leftNames = Object.keys(left);

  return (
    leftNames.length === Object.keys(right).length &&
    leftNames.every((name) => Object.is(left[name], right[name]))
  );
};

const areDecorationAttributesEqual = (
  left: PliteDecorationAttributes,
  right: PliteDecorationAttributes
) => {
  if (left === right) return true;
  const leftNames = Object.keys(left);

  if (leftNames.length !== Object.keys(right).length) return false;

  return leftNames.every((name) => {
    const leftValue = (left as Record<string, unknown>)[name];
    const rightValue = (right as Record<string, unknown>)[name];

    return name === 'style' && leftValue && rightValue
      ? areDecorationStylesEqual(
          leftValue as Readonly<Record<string, unknown>>,
          rightValue as Readonly<Record<string, unknown>>
        )
      : Object.is(leftValue, rightValue);
  });
};

const areDecorationBucketsEqual = (
  left: readonly PliteDecorationSlice[],
  right: readonly PliteDecorationSlice[]
) =>
  left === right ||
  (left.length === right.length &&
    left.every((slice, index) =>
      areDecorationSlicesEqual(slice, right[index])
    ));

type NativeTextInsertion = Readonly<{
  length: number;
  offset: number;
}>;

const decorationBucketChanges = new WeakMap<
  readonly PliteDecorationSlice[],
  {
    identity: object;
    insertion?: NativeTextInsertion;
    paint?: Readonly<{ start: number; end: number }>;
    previous?: object;
  }
>();

const getDecorationBucketIdentity = (
  bucket: readonly PliteDecorationSlice[]
) => {
  let change = decorationBucketChanges.get(bucket);

  if (!change) {
    change = { identity: {} };
    decorationBucketChanges.set(bucket, change);
  }
  return change.identity;
};

export const getNativeMappedDecorationInsertion = (
  previous: readonly PliteDecorationSlice[],
  next: readonly PliteDecorationSlice[]
) => {
  const mapping = decorationBucketChanges.get(next);

  return mapping?.previous === decorationBucketChanges.get(previous)?.identity
    ? (mapping?.insertion ?? null)
    : null;
};

const recordDecorationPaintChange = (
  previous: readonly PliteDecorationSlice[],
  next: readonly PliteDecorationSlice[]
) => {
  if (previous === next || next.length === 0) return;
  let prefix = 0;

  while (
    prefix < previous.length &&
    prefix < next.length &&
    areDecorationSlicesEqual(previous[prefix], next[prefix])
  ) {
    prefix += 1;
  }
  let previousEnd = previous.length;
  let nextEnd = next.length;

  while (
    previousEnd > prefix &&
    nextEnd > prefix &&
    areDecorationSlicesEqual(previous[previousEnd - 1], next[nextEnd - 1])
  ) {
    previousEnd -= 1;
    nextEnd -= 1;
  }
  let start = Infinity;
  let end = 0;

  for (let index = prefix; index < previousEnd; index++) {
    start = Math.min(start, previous[index].start);
    end = Math.max(end, previous[index].end);
  }
  for (let index = prefix; index < nextEnd; index++) {
    start = Math.min(start, next[index].start);
    end = Math.max(end, next[index].end);
  }
  const existing = decorationBucketChanges.get(next);

  decorationBucketChanges.set(next, {
    identity: existing?.identity ?? {},
    insertion: existing?.insertion,
    paint: start === Infinity ? undefined : { start, end },
    previous: getDecorationBucketIdentity(previous),
  });
};

export const getDecorationPaintChange = (
  previous: readonly PliteDecorationSlice[],
  next: readonly PliteDecorationSlice[]
) => {
  const change = decorationBucketChanges.get(next);

  return change?.previous === decorationBucketChanges.get(previous)?.identity
    ? (change?.paint ?? null)
    : null;
};

const mapDecorationSlicesThroughInsertion = (
  slices: readonly PliteDecorationSlice[],
  insertion: NativeTextInsertion
) => {
  let changed = false;
  const mapped = slices.map((slice) => {
    const start =
      slice.start >= insertion.offset
        ? slice.start + insertion.length
        : slice.start;
    const end =
      slice.end > insertion.offset ? slice.end + insertion.length : slice.end;

    if (start === slice.start && end === slice.end) return slice;
    changed = true;

    const mappedSlice = Object.freeze({ ...slice, end, start });

    DECORATION_SLICE_IDENTITIES.set(
      mappedSlice,
      getDecorationSliceIdentity(slice)
    );

    return mappedSlice;
  });

  return changed ? Object.freeze(mapped) : slices;
};

const getNativeTextInsertions = (
  commit: EditorCommit,
  snapshot: EditorSnapshot,
  inputKeys: readonly NodeKey[]
) => {
  const insertions = new Map<NodeKey, NativeTextInsertion>();

  for (const nodeKey of inputKeys) {
    const beforePath = commit.before.index.pathOf(nodeKey);
    const afterPath = snapshot.index.pathOf(nodeKey);
    const beforeNode =
      beforePath && getDescendantAtPath(commit.before.children, beforePath);
    const afterNode =
      afterPath && getDescendantAtPath(snapshot.children, afterPath);

    if (!beforeNode || !afterNode) return null;
    if (!NodeApi.isText(beforeNode) || !NodeApi.isText(afterNode)) return null;
    const insertion = getPureTextInsertion(beforeNode.text, afterNode.text);

    if (!insertion) return null;
    insertions.set(nodeKey, {
      length: insertion.text.length,
      offset: insertion.offset,
    });
  }

  return insertions;
};

const validateDecorationSources = <E>(
  sources: ReadonlyArray<PliteDecorationSource<E>>
) => {
  const ids = new Set<string>();

  for (const source of sources) {
    if (source.id.length === 0) {
      throw new Error('Plite decoration source ids must be non-empty.');
    }
    if (ids.has(source.id)) {
      throw new Error(`Duplicate Plite decoration source id "${source.id}".`);
    }

    ids.add(source.id);
  }
};

const getInputEntries = (snapshot: EditorSnapshot) =>
  snapshot.index.entries().flatMap(([nodeKey, path]) => {
    const node = getDescendantAtPath(snapshot.children, path);

    return node ? [{ node, nodeKey, path }] : [];
  });

const freezeSourceBucket = (
  parts: readonly DecorationOutputPart[],
  snapshot: EditorSnapshot
) => {
  if (parts.length === 1) {
    return parts[0].slices;
  }

  const ordered = [...parts].sort((left, right) => {
    const leftPath = snapshot.index.pathOf(left.inputKey);
    const rightPath = snapshot.index.pathOf(right.inputKey);

    if (!leftPath) {
      return rightPath ? 1 : left.inputKey.localeCompare(right.inputKey);
    }
    if (!rightPath) return -1;

    return comparePaths(leftPath, rightPath);
  });
  const bucket = ordered.flatMap(({ slices: partSlices }) => partSlices);

  return bucket.length === 0 ? EMPTY_DECORATION_SLICES : Object.freeze(bucket);
};

export const createPliteDecorationManager = <E>(
  editor: E,
  initialSources: ReadonlyArray<PliteDecorationSource<E>>,
  options: Readonly<{ onError?: PliteViewSourceErrorSink }> = {}
): PliteDecorationManager<E> => {
  validateDecorationSources(initialSources);

  type ExactSource = PliteDecorationSource<E>;

  const runtimeEditor = editor as unknown as EditorType;

  const listenersByNodeKey = new Map<NodeKey, Set<() => void>>();
  const listeners = new Set<(changedNodeKeys: readonly NodeKey[]) => void>();
  const mergedByNodeKey = new Map<NodeKey, readonly PliteDecorationSlice[]>();
  let destroyed = false;
  let mounted = false;
  let unsubscribeEditor: (() => void) | null = null;
  let version = 0;
  let providerSources = initialSources;
  const registeredSources = new Map<symbol, ExactSource>();
  let sourceStates: Array<DecorationSourceState<E>> = [];
  const metrics = {
    bucketReadCount: 0,
    changedBucketCount: 0,
    downstreamNodeSubscriptionCount: 0,
    failureCount: 0,
    invalidRangeDropCount: 0,
    sourceCount: initialSources.length,
    sourceObserverCount: 0,
    sourceReadCount: 0,
    wakeCount: 0,
  };

  const compiledInputs = new WeakMap<
    PliteDecoration,
    | {
        anchorRoot: string | undefined;
        focusRoot: string | undefined;
        inputKey: NodeKey;
        path: Path;
        slice: PliteDecorationSlice;
        source: ExactSource;
        sourceId: string;
      }
    | { slice: PliteDecorationSlice }
  >();

  const compileInput = (
    source: ExactSource,
    snapshot: EditorSnapshot,
    input: Readonly<{ node: Descendant; nodeKey: NodeKey; path: Path }>,
    keyOwners: DecorationKeyOwners,
    decorations: readonly PliteDecoration[]
  ) => {
    const keys: string[] = [];
    const slicesByOutputKey = new Map<NodeKey, PliteDecorationSlice[]>();
    const addSlice = (nodeKey: NodeKey, slice: PliteDecorationSlice) => {
      const slices = slicesByOutputKey.get(nodeKey) ?? [];

      slices.push(slice);
      slicesByOutputKey.set(nodeKey, slices);
    };

    for (const decoration of decorations) {
      if (!decoration || typeof decoration !== 'object') {
        throw new Error(
          `Decoration source "${source.id}" returned an invalid value.`
        );
      }
      if (typeof decoration.key !== 'string' || decoration.key.length === 0) {
        throw new Error(
          `Decoration source "${source.id}" returned an empty key.`
        );
      }
      if (keyOwners.has(decoration.key)) {
        throw new Error(
          `Duplicate Decoration key "${decoration.key}" in source "${source.id}".`
        );
      }
      const cached = compiledInputs.get(decoration);

      if (
        cached &&
        'source' in cached &&
        cached.source === source &&
        cached.sourceId === source.id &&
        cached.inputKey === input.nodeKey &&
        NodeApi.isText(input.node) &&
        cached.slice.end <= input.node.text.length &&
        arePathsEqual(cached.path, input.path) &&
        decoration.range.anchor.root === cached.anchorRoot &&
        decoration.range.focus.root === cached.focusRoot
      ) {
        keyOwners.set(decoration.key, input.nodeKey);
        keys.push(decoration.key);
        addSlice(input.nodeKey, cached.slice);
        continue;
      }
      if (!isDecorationRange(decoration.range)) {
        metrics.invalidRangeDropCount += 1;
        continue;
      }
      const { anchor, focus } = decoration.range;
      const anchorOnInput = arePathsEqual(anchor.path, input.path);
      const focusOnInput = arePathsEqual(focus.path, input.path);

      if (
        anchor.offset === focus.offset &&
        (anchorOnInput && focusOnInput
          ? true
          : arePathsEqual(anchor.path, focus.path))
      ) {
        metrics.invalidRangeDropCount += 1;
        continue;
      }

      if (NodeApi.isText(input.node) && anchorOnInput && focusOnInput) {
        if (
          anchor.offset < 0 ||
          anchor.offset > input.node.text.length ||
          focus.offset < 0 ||
          focus.offset > input.node.text.length
        ) {
          metrics.invalidRangeDropCount += 1;
          continue;
        }

        const attributes = cloneDecorationAttributes(decoration.attributes);

        keyOwners.set(decoration.key, input.nodeKey);
        keys.push(decoration.key);
        const compiledSlice = createDecorationSlice(source.id, {
          attributes,
          end: Math.max(anchor.offset, focus.offset),
          key: decoration.key,
          start: Math.min(anchor.offset, focus.offset),
        });

        const slice =
          cached && areDecorationSlicesEqual(cached.slice, compiledSlice)
            ? cached.slice
            : compiledSlice;
        addSlice(input.nodeKey, slice);
        if (
          cached !== undefined &&
          isFrozenDataRecord(decoration, ['key', 'range', 'attributes']) &&
          isFrozenDataRecord(decoration.range, ['anchor', 'focus']) &&
          isFrozenDataRecord(anchor, ['path', 'offset']) &&
          isFrozenDataRecord(focus, ['path', 'offset']) &&
          isFrozenPath(anchor.path) &&
          isFrozenPath(focus.path) &&
          Number.isFinite(slice.start) &&
          Number.isFinite(slice.end) &&
          isFrozenDataRecord(decoration.attributes) &&
          (decoration.attributes.style === undefined ||
            isFrozenDataRecord(decoration.attributes.style))
        ) {
          immutableAttributes.add(decoration.attributes);
          compiledInputs.set(decoration, {
            anchorRoot: anchor.root,
            focusRoot: focus.root,
            inputKey: input.nodeKey,
            path: anchor.path,
            slice,
            source,
            sourceId: source.id,
          });
        } else {
          compiledInputs.set(decoration, { slice });
        }
        continue;
      }

      let segments;

      try {
        segments = projectRangeInSnapshot(snapshot, decoration.range);
      } catch {
        metrics.invalidRangeDropCount += 1;
        continue;
      }

      const attributes = cloneDecorationAttributes(decoration.attributes);

      keyOwners.set(decoration.key, input.nodeKey);
      keys.push(decoration.key);
      for (const segment of segments) {
        addSlice(
          segment.key,
          createDecorationSlice(source.id, {
            attributes,
            end: segment.end,
            key: decoration.key,
            start: segment.start,
          })
        );
      }
    }

    return {
      keys,
      parts: Array.from(
        slicesByOutputKey,
        ([nodeKey, slices]): CompiledDecorationInputPart => ({
          nodeKey,
          slices,
        })
      ),
    };
  };

  const addInput = (
    compiled: {
      bucketsByOutputKey: Map<NodeKey, readonly PliteDecorationSlice[]>;
      keysByInputKey: Map<NodeKey, readonly string[]>;
      outputKeysByInputKey: Map<NodeKey, readonly NodeKey[]>;
      partsByOutputKey: Map<NodeKey, DecorationOutputPart[]>;
      keyOwners: Map<string, NodeKey>;
    },
    source: ExactSource,
    snapshot: EditorSnapshot,
    input: Readonly<{ node: Descendant; nodeKey: NodeKey; path: Path }>
  ) => {
    metrics.sourceReadCount += 1;
    const decorations = source.read({
      editor,
      entry: [input.node, input.path],
    });

    if (!Array.isArray(decorations)) {
      throw new Error(`Decoration source "${source.id}" must return an array.`);
    }
    if (decorations.length === 0) return;

    const { keys, parts: inputParts } = compileInput(
      source,
      snapshot,
      input,
      compiled.keyOwners,
      decorations
    );

    if (keys.length > 0) compiled.keysByInputKey.set(input.nodeKey, keys);
    if (inputParts.length === 0) return;

    compiled.outputKeysByInputKey.set(
      input.nodeKey,
      inputParts.map(({ nodeKey }) => nodeKey)
    );
    for (const { nodeKey: outputKey, slices } of inputParts) {
      const parts = compiled.partsByOutputKey.get(outputKey) ?? [];

      parts.push({
        inputKey: input.nodeKey,
        slices,
      });
      compiled.partsByOutputKey.set(outputKey, parts);
    }
  };

  const compileAll = (
    state: DecorationSourceState<E>,
    snapshot: EditorSnapshot,
    inputs = getInputEntries(snapshot)
  ) => {
    const { generation } = state;
    state.faultBoundary.activate();
    const result = state.faultBoundary.run('read', () => {
      const compiled = createEmptyCompiledSourceSnapshot();

      for (const input of inputs) {
        addInput(compiled, state.definition, snapshot, input);
        if (
          destroyed ||
          state.generation !== generation ||
          editorGetSnapshot(runtimeEditor).version !== snapshot.version
        ) {
          return null;
        }
      }
      for (const [outputKey, parts] of compiled.partsByOutputKey) {
        compiled.bucketsByOutputKey.set(
          outputKey,
          freezeSourceBucket(parts, snapshot)
        );
      }

      return compiled;
    });

    if (!result.ok) {
      metrics.failureCount += 1;

      return null;
    }

    return result.value;
  };

  const refreshAll = (
    state: DecorationSourceState<E>,
    snapshot: EditorSnapshot,
    inputs?: ReturnType<typeof getInputEntries>
  ) => {
    const next = compileAll(state, snapshot, inputs);

    if (!next) return [] as readonly NodeKey[];

    const affected = new Set<NodeKey>([
      ...state.snapshot.bucketsByOutputKey.keys(),
      ...next.bucketsByOutputKey.keys(),
    ]);

    state.snapshot = next;

    return [...affected];
  };

  const refreshInputs = (
    state: DecorationSourceState<E>,
    snapshot: EditorSnapshot,
    inputKeys: readonly NodeKey[]
  ) => {
    if (inputKeys.length === 0) {
      return {
        affectedOutputKeys: new Set<NodeKey>(),
        changes: [] as readonly DecorationSourceBucketChange[],
      };
    }

    const { generation } = state;
    state.faultBoundary.activate();
    const result = state.faultBoundary.run('read', () => {
      const previous = state.snapshot;
      const refreshedInputKeys = new Set(inputKeys);
      const addedKeyOwners = new Map<string, NodeKey>();
      const keyOwners: DecorationKeyOwners = {
        has(key) {
          if (addedKeyOwners.has(key)) return true;

          const owner = previous.keyOwners.get(key);

          return owner !== undefined && !refreshedInputKeys.has(owner);
        },
        set(key, owner) {
          addedKeyOwners.set(key, owner);
        },
      };
      const nextInputs = new Array<ReturnType<typeof compileInput> | null>(
        inputKeys.length
      );
      const affectedOutputKeys = new Set<NodeKey>();
      const changes: DecorationSourceBucketChange[] = [];

      for (let inputIndex = 0; inputIndex < inputKeys.length; inputIndex++) {
        const inputKey = inputKeys[inputIndex];
        const path = snapshot.index.pathOf(inputKey);
        const node = path && getDescendantAtPath(snapshot.children, path);

        if (!path || !node) {
          nextInputs[inputIndex] = null;
          continue;
        }
        metrics.sourceReadCount += 1;
        const decorations = state.definition.read({
          editor,
          entry: [node, path],
        });

        if (
          destroyed ||
          state.generation !== generation ||
          editorGetSnapshot(runtimeEditor).version !== snapshot.version
        ) {
          return null;
        }

        if (!Array.isArray(decorations)) {
          throw new Error(
            `Decoration source "${state.definition.id}" must return an array.`
          );
        }
        nextInputs[inputIndex] =
          decorations.length === 0
            ? null
            : compileInput(
                state.definition,
                snapshot,
                { node, nodeKey: inputKey, path },
                keyOwners,
                decorations
              );
      }

      for (let inputIndex = 0; inputIndex < inputKeys.length; inputIndex++) {
        const inputKey = inputKeys[inputIndex];
        const nextInput = nextInputs[inputIndex];
        const previousKeys = previous.keysByInputKey.get(inputKey);
        let keysUnchanged = false;

        if (
          previousKeys &&
          nextInput &&
          previousKeys.length === nextInput.keys.length
        ) {
          keysUnchanged = true;
          for (let index = 0; index < previousKeys.length; index++) {
            if (previousKeys[index] !== nextInput.keys[index]) {
              keysUnchanged = false;
              break;
            }
          }
        }
        if (keysUnchanged && previousKeys) {
          for (const key of previousKeys) addedKeyOwners.delete(key);
        } else if (previousKeys) {
          for (const key of previousKeys) previous.keyOwners.delete(key);
          previous.keysByInputKey.delete(inputKey);
        }
        const previousOutputKeys =
          previous.outputKeysByInputKey.get(inputKey) ?? [];
        const nextParts = nextInput?.parts ?? [];
        const nextOutputKeys = nextParts.map(({ nodeKey }) => nodeKey);

        if (
          nextInput &&
          previousOutputKeys.length === 1 &&
          nextOutputKeys.length === 1 &&
          previousOutputKeys[0] === nextOutputKeys[0]
        ) {
          if (!keysUnchanged && nextInput.keys.length > 0) {
            previous.keysByInputKey.set(inputKey, nextInput.keys);
          }
          previous.outputKeysByInputKey.set(inputKey, nextOutputKeys);
          const outputKey = nextOutputKeys[0];
          const parts = previous.partsByOutputKey.get(outputKey);
          const nextPart = { inputKey, slices: nextParts[0].slices };

          if (!parts) {
            previous.partsByOutputKey.set(outputKey, [nextPart]);
          } else if (parts.length === 1) {
            parts[0] = nextPart;
          } else {
            const partIndex = parts.findIndex(
              (part) => part.inputKey === inputKey
            );

            if (partIndex !== -1) parts[partIndex] = nextPart;
            else parts.push(nextPart);
          }
          affectedOutputKeys.add(outputKey);

          continue;
        }

        for (const outputKey of previousOutputKeys) {
          affectedOutputKeys.add(outputKey);
          const parts = previous.partsByOutputKey.get(outputKey);

          if (!parts) continue;
          if (parts.length === 1) {
            previous.partsByOutputKey.delete(outputKey);
            continue;
          }
          const partIndex = parts.findIndex(
            (part) => part.inputKey === inputKey
          );

          if (partIndex !== -1) parts.splice(partIndex, 1);
        }
        previous.outputKeysByInputKey.delete(inputKey);

        if (!nextInput) continue;
        if (!keysUnchanged && nextInput.keys.length > 0) {
          previous.keysByInputKey.set(inputKey, nextInput.keys);
        }
        if (nextParts.length === 0) continue;
        previous.outputKeysByInputKey.set(inputKey, nextOutputKeys);
        for (const { nodeKey: outputKey, slices } of nextParts) {
          const parts = previous.partsByOutputKey.get(outputKey) ?? [];

          parts.push({ inputKey, slices });
          previous.partsByOutputKey.set(outputKey, parts);
          affectedOutputKeys.add(outputKey);
        }
      }

      for (const [key, owner] of addedKeyOwners) {
        previous.keyOwners.set(key, owner);
      }

      for (const outputKey of affectedOutputKeys) {
        const parts = previous.partsByOutputKey.get(outputKey);
        const previousBucket =
          previous.bucketsByOutputKey.get(outputKey) ?? EMPTY_DECORATION_SLICES;
        const candidate = parts
          ? freezeSourceBucket(parts, snapshot)
          : EMPTY_DECORATION_SLICES;
        const nextBucket = areDecorationBucketsEqual(previousBucket, candidate)
          ? previousBucket
          : candidate;

        if (nextBucket.length === 0) {
          previous.bucketsByOutputKey.delete(outputKey);
        } else {
          previous.bucketsByOutputKey.set(outputKey, nextBucket);
        }
        if (nextBucket !== previousBucket) {
          changes.push({
            next: nextBucket,
            nodeKey: outputKey,
            previous: previousBucket,
          });
        }
      }

      return {
        affectedOutputKeys,
        changes,
        snapshot: previous,
      };
    });

    if (!result.ok) {
      metrics.failureCount += 1;

      return {
        affectedOutputKeys: new Set<NodeKey>(),
        changes: [] as readonly DecorationSourceBucketChange[],
      };
    }

    if (!result.value) {
      return {
        affectedOutputKeys: new Set<NodeKey>(),
        changes: [] as readonly DecorationSourceBucketChange[],
      };
    }
    state.snapshot = result.value.snapshot;

    return {
      affectedOutputKeys: result.value.affectedOutputKeys,
      changes: result.value.changes,
    };
  };

  const notifyChangedBuckets = (changed: readonly NodeKey[]) => {
    metrics.changedBucketCount += changed.length;
    if (changed.length > 0) {
      version += 1;
      listeners.forEach((listener) => listener(changed));
    }
    const nodeListenersToNotify = new Set<() => void>();

    for (const nodeKey of changed) {
      const nodeListeners = listenersByNodeKey.get(nodeKey);

      nodeListeners?.forEach((listener) => {
        nodeListenersToNotify.add(listener);
      });
    }
    metrics.wakeCount += nodeListenersToNotify.size;
    nodeListenersToNotify.forEach((listener) => listener());
  };

  const publishMergedBuckets = (nodeKeys: Iterable<NodeKey>) => {
    const changed: NodeKey[] = [];
    const uniqueNodeKeys =
      nodeKeys instanceof Set ? nodeKeys : new Set(nodeKeys);

    for (const nodeKey of uniqueNodeKeys) {
      const previous = mergedByNodeKey.get(nodeKey) ?? EMPTY_DECORATION_SLICES;
      const slices: PliteDecorationSlice[] = [];

      for (const state of sourceStates) {
        const bucket = state.snapshot.bucketsByOutputKey.get(nodeKey);

        if (bucket) slices.push(...bucket);
      }
      const candidate =
        slices.length === 0 ? EMPTY_DECORATION_SLICES : Object.freeze(slices);
      const next = areDecorationBucketsEqual(previous, candidate)
        ? previous
        : candidate;

      if (next === previous) continue;
      recordDecorationPaintChange(previous, next);
      if (next.length === 0) mergedByNodeKey.delete(nodeKey);
      else mergedByNodeKey.set(nodeKey, next);
      changed.push(nodeKey);
    }

    notifyChangedBuckets(changed);
  };

  const publishSourceBucketChanges = (
    state: DecorationSourceState<E>,
    changes: readonly DecorationSourceBucketChange[]
  ) => {
    if (changes.length === 0) return;

    const sourceIndex = sourceStates.indexOf(state);

    if (sourceIndex === -1) {
      publishMergedBuckets(changes.map(({ nodeKey }) => nodeKey));

      return;
    }
    if (sourceStates.length === 1) {
      const changed: NodeKey[] = [];

      for (const { next, nodeKey } of changes) {
        const previousMerged =
          mergedByNodeKey.get(nodeKey) ?? EMPTY_DECORATION_SLICES;
        recordDecorationPaintChange(previousMerged, next);
        if (next.length === 0) mergedByNodeKey.delete(nodeKey);
        else mergedByNodeKey.set(nodeKey, next);
        changed.push(nodeKey);
      }
      notifyChangedBuckets(changed);

      return;
    }

    const changed: NodeKey[] = [];

    for (const change of changes) {
      const previousMerged =
        mergedByNodeKey.get(change.nodeKey) ?? EMPTY_DECORATION_SLICES;
      let offset = 0;

      for (let index = 0; index < sourceIndex; index++) {
        offset +=
          sourceStates[index].snapshot.bucketsByOutputKey.get(change.nodeKey)
            ?.length ?? 0;
      }
      const suffixStart = offset + change.previous.length;
      let candidate: PliteDecorationSlice[];

      if (change.previous.length === change.next.length) {
        candidate = previousMerged.slice();
        for (let index = 0; index < change.next.length; index++) {
          candidate[offset + index] = change.next[index];
        }
      } else {
        candidate = new Array<PliteDecorationSlice>(
          previousMerged.length - change.previous.length + change.next.length
        );
        let cursor = 0;

        for (let index = 0; index < offset; index++) {
          candidate[cursor] = previousMerged[index];
          cursor += 1;
        }
        for (const slice of change.next) {
          candidate[cursor] = slice;
          cursor += 1;
        }
        for (let index = suffixStart; index < previousMerged.length; index++) {
          candidate[cursor] = previousMerged[index];
          cursor += 1;
        }
      }
      const next =
        candidate.length === 0
          ? EMPTY_DECORATION_SLICES
          : Object.freeze(candidate);

      recordDecorationPaintChange(previousMerged, next);
      if (next.length === 0) mergedByNodeKey.delete(change.nodeKey);
      else mergedByNodeKey.set(change.nodeKey, next);
      changed.push(change.nodeKey);
    }

    notifyChangedBuckets(changed);
  };

  const mapNativeTextInsertions = (
    snapshot: EditorSnapshot,
    insertions: ReadonlyMap<NodeKey, NativeTextInsertion>
  ) => {
    for (const state of sourceStates) {
      if (editorGetSnapshot(runtimeEditor).version !== snapshot.version) return;
      if (!pendingRefresh?.sources.has(state)) continue;
      const changes: DecorationSourceBucketChange[] = [];

      for (const [nodeKey, insertion] of insertions) {
        const previousParts = state.snapshot.partsByOutputKey.get(nodeKey);

        if (!previousParts) continue;
        const nextParts = previousParts.map((part) => {
          const slices = mapDecorationSlicesThroughInsertion(
            part.slices,
            insertion
          );

          return slices === part.slices ? part : { ...part, slices };
        });

        if (nextParts.every((part, index) => part === previousParts[index])) {
          continue;
        }
        const previous =
          state.snapshot.bucketsByOutputKey.get(nodeKey) ??
          EMPTY_DECORATION_SLICES;
        const next = freezeSourceBucket(nextParts, snapshot);

        if (next !== previous) {
          decorationBucketChanges.set(next, {
            identity: getDecorationBucketIdentity(next),
            insertion,
            previous: getDecorationBucketIdentity(previous),
          });
        }

        state.snapshot.partsByOutputKey.set(nodeKey, nextParts);
        if (next.length === 0) {
          state.snapshot.bucketsByOutputKey.delete(nodeKey);
        } else {
          state.snapshot.bucketsByOutputKey.set(nodeKey, next);
        }
        changes.push({ next, nodeKey, previous });
      }

      publishSourceBucketChanges(state, changes);
    }
  };

  const refreshState = (
    state: DecorationSourceState<E>,
    input: PliteDecorationRefresh,
    snapshot = editorGetSnapshot(runtimeEditor)
  ) => {
    if (input.nodeKeys === 'all') {
      publishMergedBuckets(refreshAll(state, snapshot));

      return;
    }

    const result = refreshInputs(state, snapshot, input.nodeKeys);

    publishSourceBucketChanges(state, result.changes);
  };

  const startObservation = (state: DecorationSourceState<E>) => {
    const { observe } = state.definition;

    if (!observe || state.cleanup || destroyed || !mounted) return false;

    let refreshedSynchronously = false;
    const { observationGeneration } = state;
    state.faultBoundary.activate();
    const result = state.faultBoundary.run('resolve', () => {
      const cleanup = observe({
        editor,
        refresh: (input) => {
          if (
            destroyed ||
            !mounted ||
            observationGeneration !== state.observationGeneration
          ) {
            return;
          }
          refreshedSynchronously = true;
          queueSourceRefresh(
            editorGetSnapshot(runtimeEditor),
            [state],
            input.nodeKeys === 'all' ? undefined : input.nodeKeys
          );
          flushSourceRefresh(state);
        },
      });

      if (typeof cleanup !== 'function') {
        throw new Error(
          `Decoration source "${state.definition.id}" observe must return a cleanup function.`
        );
      }

      return cleanup;
    });

    if (!result.ok) {
      metrics.failureCount += 1;
      return false;
    }

    state.cleanup = result.value;
    metrics.sourceObserverCount += 1;

    return refreshedSynchronously;
  };

  const stopObservation = (state: DecorationSourceState<E>) => {
    const { cleanup } = state;

    state.generation += 1;
    state.observationGeneration += 1;

    if (!cleanup) return;

    state.cleanup = null;
    metrics.sourceObserverCount -= 1;
    try {
      cleanup();
    } catch (error) {
      options.onError?.({
        cause: error,
        phase: 'resolve',
        sourceId: state.definition.id,
      });
    }
  };

  const createState = (
    definition: ExactSource,
    snapshot: EditorSnapshot,
    inputs?: ReturnType<typeof getInputEntries>,
    compile = definition.observe === undefined
  ) => {
    const state: DecorationSourceState<E> = {
      cleanup: null,
      definition,
      faultBoundary: createViewSourceFaultBoundary({
        id: definition.id,
        onError: options.onError,
      }),
      generation: 0,
      observationGeneration: 0,
      snapshot: createEmptyCompiledSourceSnapshot(),
    };
    const compiled = compile ? compileAll(state, snapshot, inputs) : null;

    if (compiled) state.snapshot = compiled;

    return state;
  };

  const initialSnapshot = editorGetSnapshot(runtimeEditor);
  let initialInputs: ReturnType<typeof getInputEntries> | undefined;

  sourceStates = initialSources.map((source) =>
    createState(
      source,
      initialSnapshot,
      source.observe
        ? undefined
        : (initialInputs ??= getInputEntries(initialSnapshot))
    )
  );
  let lastEditorVersion = initialSnapshot.version;
  const initialMergedBuckets = new Map<NodeKey, PliteDecorationSlice[]>();

  for (const state of sourceStates) {
    for (const [nodeKey, bucket] of state.snapshot.bucketsByOutputKey) {
      const merged = initialMergedBuckets.get(nodeKey) ?? [];

      merged.push(...bucket);
      initialMergedBuckets.set(nodeKey, merged);
    }
  }
  for (const [nodeKey, bucket] of initialMergedBuckets) {
    mergedByNodeKey.set(nodeKey, Object.freeze(bucket));
  }
  if (initialMergedBuckets.size > 0) version += 1;

  const reconcileSources = (nextSources: readonly ExactSource[]) => {
    validateDecorationSources(nextSources);

    const snapshot = editorGetSnapshot(runtimeEditor);
    let inputs: ReturnType<typeof getInputEntries> | undefined;
    const getInputs = () => (inputs ??= getInputEntries(snapshot));
    const previousStates = new Map(
      sourceStates.map((state) => [state.definition.id, state])
    );
    const previousOrder = sourceStates.map(({ definition }) => definition.id);
    const affected = new Set<NodeKey>();
    const nextStates = nextSources.map((definition) => {
      const current = previousStates.get(definition.id);

      if (!current) {
        const created = createState(
          definition,
          snapshot,
          definition.observe ? undefined : getInputs()
        );

        if (mounted && definition.observe) {
          const refreshedSynchronously = startObservation(created);

          if (created.cleanup && !refreshedSynchronously) {
            refreshAll(created, snapshot, getInputs());
          }
        }

        created.snapshot.bucketsByOutputKey.forEach((_bucket, nodeKey) => {
          affected.add(nodeKey);
        });

        return created;
      }

      previousStates.delete(definition.id);
      const readChanged = current.definition.read !== definition.read;
      const observeChanged = current.definition.observe !== definition.observe;
      let refreshedSynchronously = false;

      if (observeChanged) stopObservation(current);
      if (readChanged) current.generation += 1;
      current.definition = definition;
      if (observeChanged && mounted) {
        refreshedSynchronously = startObservation(current);
      }
      if (
        (readChanged || observeChanged) &&
        (!definition.observe || (mounted && current.cleanup)) &&
        !refreshedSynchronously
      ) {
        refreshAll(current, snapshot, getInputs()).forEach((nodeKey) => {
          affected.add(nodeKey);
        });
      }

      return current;
    });

    previousStates.forEach((state) => {
      stopObservation(state);
      pendingRefresh?.sources.delete(state);
      state.snapshot.bucketsByOutputKey.forEach((_bucket, nodeKey) => {
        affected.add(nodeKey);
      });
    });
    sourceStates = nextStates;
    metrics.sourceCount = sourceStates.length;

    if (
      previousOrder.length !== sourceStates.length ||
      previousOrder.some(
        (id, index) => id !== sourceStates[index]?.definition.id
      )
    ) {
      mergedByNodeKey.forEach((_bucket, nodeKey) => affected.add(nodeKey));
      sourceStates.forEach((state) => {
        state.snapshot.bucketsByOutputKey.forEach((_bucket, nodeKey) => {
          affected.add(nodeKey);
        });
      });
    }

    publishMergedBuckets(affected);
  };

  const reconcileAllSources = () =>
    reconcileSources([...providerSources, ...registeredSources.values()]);

  let pendingRefresh:
    | {
        sources: Map<
          DecorationSourceState<E>,
          {
            generation: number;
            inputKeys: Set<NodeKey> | null;
          }
        >;
        snapshot: EditorSnapshot;
        startedAt: number;
      }
    | undefined;
  let cancelPendingRefresh = () => {};
  let refreshOnMount = false;

  const clearPendingRefresh = () => {
    cancelPendingRefresh();
    cancelPendingRefresh = () => {};
    pendingRefresh = undefined;
  };

  const flushSourceRefresh = (state: DecorationSourceState<E>) => {
    const pending = pendingRefresh;
    const request = pending?.sources.get(state);

    if (!pending || !request) return;
    pending.sources.delete(state);
    if (
      !destroyed &&
      mounted &&
      state.generation === request.generation &&
      pending.snapshot.version === editorGetSnapshot(runtimeEditor).version
    ) {
      refreshState(
        state,
        { nodeKeys: request.inputKeys ? [...request.inputKeys] : 'all' },
        pending.snapshot
      );
    }
    if (pendingRefresh === pending && pending.sources.size === 0) {
      clearPendingRefresh();
    }
  };

  const flushPendingRefresh = () => {
    const pending = pendingRefresh;

    clearPendingRefresh();
    if (!pending || destroyed || !mounted) return;
    for (const [state, request] of pending.sources) {
      if (
        destroyed ||
        !mounted ||
        pending.snapshot.version !== editorGetSnapshot(runtimeEditor).version
      ) {
        return;
      }
      if (state.generation !== request.generation) continue;
      refreshState(
        state,
        { nodeKeys: request.inputKeys ? [...request.inputKeys] : 'all' },
        pending.snapshot
      );
    }
  };

  const queueSourceRefresh = (
    snapshot: EditorSnapshot,
    states: ReadonlyArray<DecorationSourceState<E>>,
    inputKeys: readonly NodeKey[] | undefined
  ) => {
    if (states.length === 0) return;
    pendingRefresh ??= {
      snapshot,
      sources: new Map(),
      startedAt: performance.now(),
    };
    const pending = pendingRefresh;

    pending.snapshot = snapshot;
    for (const state of states) {
      const previous = pending.sources.get(state);
      const keys =
        previous?.inputKeys === null || inputKeys === undefined
          ? null
          : (previous?.inputKeys ?? new Set<NodeKey>());

      inputKeys?.forEach((key) => keys?.add(key));
      state.generation += 1;
      pending.sources.set(state, {
        generation: state.generation,
        inputKeys: keys,
      });
    }
  };

  const schedulePendingRefresh = () => {
    if (!pendingRefresh || pendingRefresh.sources.size === 0) return;
    cancelPendingRefresh();
    const quietUntil = performance.now() + 50;
    let active = true;
    let frame: number | undefined;
    let task: ReturnType<typeof setTimeout> | undefined;
    const run = () => {
      if (active) flushPendingRefresh();
    };
    const deadline = globalThis.setTimeout(
      run,
      Math.max(0, 250 - (performance.now() - pendingRefresh.startedAt))
    );

    if (typeof globalThis.requestAnimationFrame === 'function') {
      frame = globalThis.requestAnimationFrame(() => {
        if (!active) return;
        frame = globalThis.requestAnimationFrame(() => {
          if (active) {
            task = globalThis.setTimeout(
              run,
              Math.max(0, quietUntil - performance.now())
            );
          }
        });
      });
    } else {
      task = globalThis.setTimeout(
        run,
        Math.max(0, quietUntil - performance.now())
      );
    }
    cancelPendingRefresh = () => {
      active = false;
      if (frame !== undefined) globalThis.cancelAnimationFrame(frame);
      if (task !== undefined) globalThis.clearTimeout(task);
      globalThis.clearTimeout(deadline);
    };
  };

  const manager: PliteDecorationManager<E> = {
    destroy() {
      if (destroyed) return;

      destroyed = true;
      mounted = false;
      clearPendingRefresh();
      unsubscribeEditor?.();
      unsubscribeEditor = null;
      sourceStates.forEach(stopObservation);
      sourceStates = [];
      listeners.clear();
      listenersByNodeKey.clear();
      mergedByNodeKey.clear();
      metrics.downstreamNodeSubscriptionCount = 0;
      metrics.sourceCount = 0;
    },
    getMetrics() {
      return Object.freeze({ ...metrics });
    },
    getNodeSnapshot(nodeKey) {
      metrics.bucketReadCount += 1;

      return mergedByNodeKey.get(nodeKey) ?? EMPTY_DECORATION_SLICES;
    },
    getVersion: () => version,
    hasSources: () => sourceStates.length > 0,
    mount() {
      if (destroyed) return () => {};
      if (!mounted) {
        mounted = true;
        unsubscribeEditor = editorSubscribeSource(
          runtimeEditor,
          'commit',
          (snapshot, change) => {
            lastEditorVersion = snapshot.version;
            if (pendingRefresh) pendingRefresh.snapshot = snapshot;
            if (change && !change.changed.hasAny('document')) return;

            let inputKeys = change?.changed.nodeKeysAll('decoration');

            if (
              change &&
              inputKeys &&
              (change.changed.hasAny('structure') ||
                change.changed.hasAny('properties'))
            ) {
              const expanded = new Set(inputKeys);
              const visit = (node: Descendant, path: Path) => {
                const key = snapshot.index.keyAt(path);

                if (key) expanded.add(key);
                if (NodeApi.isElement(node)) {
                  node.children.forEach((child, index) =>
                    visit(child, [...path, index])
                  );
                }
              };

              for (const key of change.changed.nodeKeysAll('node')) {
                const path = snapshot.index.pathOf(key);
                const node =
                  path && getDescendantAtPath(snapshot.children, path);

                if (node && path) visit(node, path);
              }
              inputKeys = [...expanded];
            }
            queueSourceRefresh(snapshot, sourceStates, inputKeys);
            if (
              change &&
              (change.tags.includes('native-text-input') ||
                change.tags.includes('dom-text-input')) &&
              change.changed.hasAny('text') &&
              !change.changed.hasAny('structure') &&
              !change.changed.hasAny('properties') &&
              !change.changed.hasAny('replace')
            ) {
              const textKeys = change.changed.nodeKeysAll('text');
              const insertions =
                textKeys.length > 0
                  ? getNativeTextInsertions(change, snapshot, textKeys)
                  : null;

              if (insertions) {
                mapNativeTextInsertions(snapshot, insertions);
              }
              schedulePendingRefresh();
              return;
            }
            flushPendingRefresh();
          }
        );
        const snapshot = editorGetSnapshot(runtimeEditor);
        const affected = new Set<NodeKey>();
        const editorChangedBeforeObservation =
          refreshOnMount || snapshot.version !== lastEditorVersion;
        refreshOnMount = false;
        let inputs: ReturnType<typeof getInputEntries> | undefined;
        const getInputs = () => (inputs ??= getInputEntries(snapshot));

        sourceStates.forEach((state) => {
          const refreshedSynchronously = startObservation(state);
          if (!state.cleanup && !editorChangedBeforeObservation) return;
          if (refreshedSynchronously && !editorChangedBeforeObservation) {
            return;
          }

          refreshAll(state, snapshot, getInputs()).forEach((nodeKey) => {
            affected.add(nodeKey);
          });
        });
        lastEditorVersion = snapshot.version;
        publishMergedBuckets(affected);
      }

      let active = true;

      return () => {
        if (!active || destroyed) return;

        active = false;
        mounted = false;
        refreshOnMount ||= pendingRefresh !== undefined;
        clearPendingRefresh();
        unsubscribeEditor?.();
        unsubscribeEditor = null;
        sourceStates.forEach(stopObservation);
      };
    },
    registerSource(source) {
      if (destroyed) return () => {};

      const token = Symbol(source.id);

      registeredSources.set(token, source);
      try {
        reconcileAllSources();
      } catch (error) {
        registeredSources.delete(token);
        throw error;
      }

      let active = true;

      return () => {
        if (!active || destroyed) return;

        active = false;
        registeredSources.delete(token);
        reconcileAllSources();
      };
    },
    setSources(nextSources) {
      if (destroyed) return;
      providerSources = nextSources;
      reconcileAllSources();
    },
    subscribe(listener) {
      if (destroyed) return () => {};

      listeners.add(listener);

      return () => listeners.delete(listener);
    },
    subscribeNodeKey(nodeKey, listener) {
      if (destroyed) return () => {};

      const nodeListeners = listenersByNodeKey.get(nodeKey) ?? new Set();

      nodeListeners.add(listener);
      listenersByNodeKey.set(nodeKey, nodeListeners);
      metrics.downstreamNodeSubscriptionCount += 1;
      let active = true;

      return () => {
        if (!active) return;

        active = false;
        nodeListeners.delete(listener);
        metrics.downstreamNodeSubscriptionCount -= 1;
        if (nodeListeners.size === 0) listenersByNodeKey.delete(nodeKey);
      };
    },
  };

  return manager;
};
