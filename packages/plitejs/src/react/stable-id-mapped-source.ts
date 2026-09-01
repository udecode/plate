import { getDefined } from '../internal/get-defined';
import { failInvariant } from './editable/runtime-editor-api';

type StableIdMappedOutput<TValue> = Readonly<{
  key: string;
  value: TValue;
}>;

export type StableIdMappedValue<
  TEntity,
  TValue,
  TMetadata = undefined,
> = Readonly<{
  entity?: TEntity;
  metadata?: TMetadata;
  outputs: ReadonlyArray<StableIdMappedOutput<TValue>>;
}>;

type StableIdMappedSourceOptions<TItem, TEntity, TValue, TMetadata> = Readonly<{
  getId: (item: TItem) => string;
  isEntityEqual?: (left: TEntity, right: TEntity) => boolean;
  isItemEqual: (left: TItem, right: TItem) => boolean;
  isOutputEqual: (left: TValue, right: TValue) => boolean;
  map: (item: TItem) => StableIdMappedValue<TEntity, TValue, TMetadata>;
}>;

type StableIdMappedSourceSnapshot<TEntity, TValue> = Readonly<{
  allIds: readonly string[];
  byId: ReadonlyMap<string, TEntity>;
  byOutputKey: Readonly<Record<string, readonly TValue[]>>;
}>;

type StableIdMappedSourceRefreshOptions = Readonly<{
  /**
   * Private trusted delta from an instrumented projection source. The caller
   * guarantees that source membership and order are unchanged.
   */
  changedIds?: readonly string[];
  forceAll?: boolean;
  forceIds?: readonly string[];
}>;

export type StableIdMappedSourceRefreshResult<TMetadata> = Readonly<{
  changedEntityIds: readonly string[];
  changedOutputKeys: readonly string[];
  fullFallback: boolean;
  mapped: ReadonlyArray<Readonly<{ id: string; metadata?: TMetadata }>>;
  orderChanged: boolean;
}>;

export type StableIdMappedSource<TItem, TEntity, TValue, TMetadata> = Readonly<{
  getIdsForOutputKeys: (keys: readonly string[]) => readonly string[];
  getIdsWithoutOutputs: () => readonly string[];
  getWork: () => Readonly<{
    entityCopies: number;
    inputVisits: number;
    outputCandidateVisits: number;
    outputVisits: number;
    snapshotChildEntryCopies: number;
    snapshotNodeCopies: number;
    unprojectedVisits: number;
  }>;
  getSnapshot: () => StableIdMappedSourceSnapshot<TEntity, TValue>;
  refresh: (
    items: readonly TItem[],
    options?: StableIdMappedSourceRefreshOptions
  ) => StableIdMappedSourceRefreshResult<TMetadata>;
}>;

type InternalMappedValue<TEntity, TValue, TMetadata> = Readonly<{
  entity?: TEntity;
  metadata?: TMetadata;
  outputs: ReadonlyArray<StableIdMappedOutput<TValue>>;
  outputsByKey: ReadonlyMap<string, readonly TValue[]>;
}>;

type PersistentReadonlyRecord<TValue> = {
  getSnapshot: () => Readonly<Record<string, TValue>>;
  publish: (
    changes: ReadonlyMap<string, TValue | undefined>
  ) => Readonly<Record<string, TValue>>;
};

type InternalState<TItem, TEntity, TValue, TMetadata> = {
  allIds: readonly string[];
  byId: ReadonlyMap<string, TEntity>;
  byOutputKey: Readonly<Record<string, readonly TValue[]>>;
  entityRecord: PersistentReadonlyRecord<TEntity>;
  idsByOutputKey: Map<string, string[]>;
  indexById: Map<string, number>;
  inputs: TItem[];
  mappedById: Map<string, InternalMappedValue<TEntity, TValue, TMetadata>>;
  outputRecord: PersistentReadonlyRecord<readonly TValue[]>;
  unprojectedIds: Set<string>;
};

const EMPTY_OUTPUTS = Object.freeze([]) as readonly unknown[];

const createPersistentReadonlyRecord = <TValue>(
  initial: Readonly<Record<string, TValue>>,
  onNodeCopy: () => void,
  onChildEntriesCopy: (count: number) => void
): PersistentReadonlyRecord<TValue> => {
  type TrieNode = Readonly<{
    children: ReadonlyMap<string, TrieNode>;
    key?: string;
    value?: TValue;
  }>;

  const EMPTY_NODE: TrieNode = Object.freeze({ children: new Map() });
  const createNode = (
    children: ReadonlyMap<string, TrieNode>,
    value: TValue | undefined,
    key: string | undefined
  ): TrieNode => {
    onNodeCopy();
    return Object.freeze({
      children,
      ...(value === undefined ? {} : { key, value }),
    });
  };
  type Update = {
    assigned: boolean;
    children: Map<string, Update>;
    key?: string;
    value?: TValue;
  };
  const createUpdate = (): Update => ({ assigned: false, children: new Map() });
  const keyBytes = (key: string) => {
    let bytes = '';
    // Byte branches bound child-map copies even for divergent Unicode IDs.
    for (let index = 0; index < key.length; index += 1) {
      const unit = key.charCodeAt(index);
      bytes += String.fromCharCode(unit >>> 8, unit & 255);
    }
    return bytes;
  };
  const setValues = (
    base: TrieNode,
    changes: Iterable<readonly [string, TValue | undefined]>
  ): TrieNode => {
    const updates = createUpdate();

    for (const [key, value] of changes) {
      let update = updates;

      for (const part of keyBytes(key)) {
        let child = update.children.get(part);

        if (!child) {
          child = createUpdate();
          update.children.set(part, child);
        }
        update = child;
      }
      update.assigned = true;
      update.key = key;
      update.value = value;
    }

    type Frame = {
      children?: Map<string, TrieNode>;
      iterator: MapIterator<[string, Update]>;
      node: TrieNode;
      part: string;
      update: Update;
    };
    const stack: Frame[] = [
      {
        iterator: updates.children.entries(),
        node: base,
        part: '',
        update: updates,
      },
    ];

    while (stack.length > 0) {
      const frame = getDefined(stack.at(-1));
      const entry = frame.iterator.next();

      if (!entry.done) {
        const [part, update] = entry.value;
        stack.push({
          iterator: update.children.entries(),
          node: frame.node.children.get(part) ?? EMPTY_NODE,
          part,
          update,
        });
        continue;
      }

      const { children, node, update } = frame;
      const value = update.assigned ? update.value : node.value;
      const next =
        !children && value === node.value
          ? node
          : createNode(
              children ?? node.children,
              value,
              update.assigned ? update.key : node.key
            );

      stack.pop();
      const parent = stack.at(-1);

      if (!parent) return next;
      if (node === next) continue;
      if (!parent.children) {
        parent.children = new Map(parent.node.children);
        onChildEntriesCopy(parent.node.children.size);
      }
      if (next.value === undefined && next.children.size === 0) {
        parent.children.delete(frame.part);
      } else {
        parent.children.set(frame.part, next);
      }
    }

    return base;
  };
  const readValue = (root: TrieNode, key: string) => {
    let node = root;

    for (const part of keyBytes(key)) {
      const child = node.children.get(part);

      if (!child) return undefined;
      node = child;
    }

    return node.value;
  };
  const readKeys = (root: TrieNode) => {
    const keys: string[] = [];
    const stack = [root.children.values()];

    if (root.value !== undefined) keys.push(getDefined(root.key));
    while (stack.length > 0) {
      const entry = getDefined(stack.at(-1)).next();

      if (entry.done) {
        stack.pop();
        continue;
      }
      const node = entry.value;

      if (node.value !== undefined) keys.push(getDefined(node.key));
      if (node.children.size > 0) stack.push(node.children.values());
    }

    return keys;
  };
  let root = setValues(EMPTY_NODE, Object.entries(initial));
  let snapshot: Readonly<Record<string, TValue>>;
  const createSnapshot = (snapshotRoot: TrieNode) =>
    new Proxy(Object.create(null) as Record<string, TValue>, {
      defineProperty: () => false,
      deleteProperty: () => false,
      get: (_target, key) =>
        typeof key === 'string' ? readValue(snapshotRoot, key) : undefined,
      getOwnPropertyDescriptor: (_target, key) => {
        if (typeof key !== 'string') return undefined;

        const value = readValue(snapshotRoot, key);

        return value === undefined
          ? undefined
          : {
              configurable: true,
              enumerable: true,
              value,
              writable: false,
            };
      },
      has: (_target, key) =>
        typeof key === 'string' && readValue(snapshotRoot, key) !== undefined,
      ownKeys: () => readKeys(snapshotRoot),
      set: () => false,
    });

  snapshot = createSnapshot(root);

  return {
    getSnapshot: () => snapshot,
    publish(changes) {
      if (changes.size === 0) return snapshot;

      root = setValues(root, changes);
      snapshot = createSnapshot(root);

      return snapshot;
    },
  };
};

const createReadonlyEntityMap = <TEntity>(
  values: Readonly<Record<string, TEntity>>,
  allIds: readonly string[],
  size: number
): ReadonlyMap<string, TEntity> => {
  function* entries(): MapIterator<[string, TEntity]> {
    for (const id of allIds) {
      const value = values[id];

      if (value !== undefined) yield [id, value];
    }
  }

  const snapshot: ReadonlyMap<string, TEntity> & {
    readonly [Symbol.toStringTag]: 'Map';
  } = {
    entries,
    forEach(callback, thisArg) {
      for (const [id, value] of entries()) {
        callback.call(thisArg, value, id, snapshot);
      }
    },
    get: (id) => values[id],
    has: (id) => values[id] !== undefined,
    *keys(): MapIterator<string> {
      for (const [id] of entries()) yield id;
    },
    size,
    *values(): MapIterator<TEntity> {
      for (const [, value] of entries()) yield value;
    },
    [Symbol.iterator]: entries,
    [Symbol.toStringTag]: 'Map',
  };

  return Object.freeze(snapshot);
};

const hasEntity = <TEntity, TValue, TMetadata>(
  value: InternalMappedValue<TEntity, TValue, TMetadata>
): value is InternalMappedValue<TEntity, TValue, TMetadata> & {
  entity: TEntity;
} => value.entity !== undefined;

const unique = (values: readonly string[]) => [...new Set(values)];

const areArraysEqual = <T>(
  left: readonly T[],
  right: readonly T[],
  isEqual: (left: T, right: T) => boolean
) =>
  left.length === right.length &&
  left.every((value, index) => {
    const other = right[index];

    return other !== undefined && isEqual(value, other);
  });

const getChangedMapIds = <T>(
  left: ReadonlyMap<string, T>,
  right: ReadonlyMap<string, T>,
  isEqual: (left: T, right: T) => boolean
) => {
  const changedIds: string[] = [];

  for (const id of new Set([...left.keys(), ...right.keys()])) {
    const leftValue = left.get(id);
    const rightValue = right.get(id);

    if (
      leftValue === undefined ||
      rightValue === undefined ||
      !isEqual(leftValue, rightValue)
    ) {
      changedIds.push(id);
    }
  }

  return changedIds;
};

const getChangedOutputKeys = <T>(
  left: Readonly<Record<string, readonly T[]>>,
  right: Readonly<Record<string, readonly T[]>>,
  isEqual: (left: T, right: T) => boolean
) => {
  const changedKeys: string[] = [];

  for (const key of new Set([...Object.keys(left), ...Object.keys(right)])) {
    if (
      !areArraysEqual(
        left[key] ?? (EMPTY_OUTPUTS as readonly T[]),
        right[key] ?? (EMPTY_OUTPUTS as readonly T[]),
        isEqual
      )
    ) {
      changedKeys.push(key);
    }
  }

  return changedKeys;
};

const getMappedMetadata = <TMetadata>(
  id: string,
  mapped: InternalMappedValue<unknown, unknown, TMetadata>
) => ({
  id,
  ...(mapped.metadata === undefined ? {} : { metadata: mapped.metadata }),
});

/**
 * Private stable-ID mapping kernel shared by decoration, annotation, and
 * widget stores. It keeps their public models separate while making a
 * same-order source refresh pay one semantic scan plus changed-item mapping.
 */
export const createStableIdMappedSource = <
  TItem,
  TEntity,
  TValue,
  TMetadata = undefined,
>(
  initialItems: readonly TItem[],
  options: StableIdMappedSourceOptions<TItem, TEntity, TValue, TMetadata>
): StableIdMappedSource<TItem, TEntity, TValue, TMetadata> => {
  const isEntityEqual = options.isEntityEqual ?? Object.is;
  const work = {
    entityCopies: 0,
    inputVisits: 0,
    outputCandidateVisits: 0,
    outputVisits: 0,
    snapshotChildEntryCopies: 0,
    snapshotNodeCopies: 0,
    unprojectedVisits: 0,
  };
  const mapItem = (
    item: TItem
  ): InternalMappedValue<TEntity, TValue, TMetadata> => {
    const mapped = options.map(item);
    const outputsByKey = new Map<string, TValue[]>();

    for (const output of mapped.outputs) {
      work.outputVisits += 1;
      const values = outputsByKey.get(output.key) ?? [];

      values.push(output.value);
      outputsByKey.set(output.key, values);
    }

    return { ...mapped, outputsByKey };
  };

  const buildState = (
    items: readonly TItem[]
  ): InternalState<TItem, TEntity, TValue, TMetadata> => {
    work.inputVisits += items.length;
    const ids = items.map(options.getId);

    if (new Set(ids).size !== ids.length) {
      throw new Error('Stable mapped view source IDs must be unique.');
    }

    const allIds = Object.freeze(ids);
    const entities: Record<string, TEntity> = Object.create(null);
    const byOutputKey: Record<string, TValue[]> = Object.create(null);
    const idsByOutputKey = new Map<string, string[]>();
    const mappedById = new Map<
      string,
      InternalMappedValue<TEntity, TValue, TMetadata>
    >();
    const unprojectedIds = new Set<string>();

    items.forEach((item, index) => {
      const id = allIds[index];
      const mapped = mapItem(item);
      mappedById.set(id, mapped);

      if (hasEntity(mapped)) {
        entities[id] = mapped.entity;
      }
      if (mapped.outputs.length === 0) unprojectedIds.add(id);

      const outputKeys = new Set<string>();
      for (const output of mapped.outputs) {
        const outputValues = byOutputKey[output.key] ?? [];
        outputValues.push(output.value);
        byOutputKey[output.key] = outputValues;

        const outputIds = idsByOutputKey.get(output.key) ?? [];
        if (!outputKeys.has(output.key)) {
          outputIds.push(id);
          outputKeys.add(output.key);
        }
        idsByOutputKey.set(output.key, outputIds);
      }
    });

    const frozenOutputs: Record<string, readonly TValue[]> =
      Object.create(null);

    Object.entries(byOutputKey).forEach(([key, values]) => {
      frozenOutputs[key] = Object.freeze(values);
    });

    const outputRecord = createPersistentReadonlyRecord(
      Object.freeze(frozenOutputs),
      () => {
        work.snapshotNodeCopies += 1;
      },
      (count) => {
        work.snapshotChildEntryCopies += count;
      }
    );
    const entityRecord = createPersistentReadonlyRecord(
      entities,
      () => {
        work.snapshotNodeCopies += 1;
      },
      (count) => {
        work.snapshotChildEntryCopies += count;
      }
    );

    return {
      allIds,
      byId: createReadonlyEntityMap(
        entityRecord.getSnapshot(),
        allIds,
        Object.keys(entities).length
      ),
      byOutputKey: outputRecord.getSnapshot(),
      entityRecord,
      idsByOutputKey,
      indexById: new Map(allIds.map((id, index) => [id, index])),
      inputs: [...items],
      mappedById,
      outputRecord,
      unprojectedIds,
    };
  };

  let state = buildState(initialItems);

  const replaceAll = (items: readonly TItem[]) => {
    const nextState = buildState(items);
    const orderChanged = !areArraysEqual(
      state.allIds,
      nextState.allIds,
      Object.is
    );
    const changedEntityIds = getChangedMapIds(
      state.byId,
      nextState.byId,
      isEntityEqual
    );
    const changedOutputKeys = getChangedOutputKeys(
      state.byOutputKey,
      nextState.byOutputKey,
      options.isOutputEqual
    );
    const mapped = nextState.allIds.map((id) =>
      getMappedMetadata(
        id,
        nextState.mappedById.get(id) ??
          failInvariant('Expected value to be defined')
      )
    );

    state = nextState;

    return {
      changedEntityIds: Object.freeze(changedEntityIds),
      changedOutputKeys: Object.freeze(changedOutputKeys),
      fullFallback: true,
      mapped: Object.freeze(mapped),
      orderChanged,
    };
  };

  return Object.freeze({
    getIdsForOutputKeys(keys) {
      return Object.freeze(
        unique(keys.flatMap((key) => state.idsByOutputKey.get(key) ?? []))
      );
    },
    getIdsWithoutOutputs() {
      work.unprojectedVisits += state.unprojectedIds.size;
      return Object.freeze(
        [...state.unprojectedIds].sort(
          (left, right) =>
            getDefined(state.indexById.get(left)) -
            getDefined(state.indexById.get(right))
        )
      );
    },
    getWork: () => Object.freeze({ ...work }),
    getSnapshot() {
      return Object.freeze({
        allIds: state.allIds,
        byId: state.byId,
        byOutputKey: state.byOutputKey,
      });
    },
    refresh(items, refreshOptions = {}) {
      const { changedIds } = refreshOptions;

      if (changedIds) {
        if (items.length !== state.allIds.length) {
          return replaceAll(items);
        }

        for (const id of changedIds) {
          work.inputVisits += 1;
          const index = state.indexById.get(id);

          if (index === undefined || options.getId(items[index]) !== id) {
            return replaceAll(items);
          }
        }
      } else {
        work.inputVisits += items.length;
        const nextIds = items.map(options.getId);

        if (
          nextIds.length !== state.allIds.length ||
          nextIds.some((id, index) => id !== state.allIds[index])
        ) {
          return replaceAll(items);
        }
      }

      const candidateIndexes = new Set<number>();

      if (changedIds) {
        changedIds.forEach((id) => {
          candidateIndexes.add(
            state.indexById.get(id) ??
              failInvariant('Expected value to be defined')
          );
        });
      } else if (refreshOptions.forceAll) {
        items.forEach((_, index) => {
          candidateIndexes.add(index);
        });
      } else {
        refreshOptions.forceIds?.forEach((id) => {
          const index = state.indexById.get(id);

          if (index !== undefined) candidateIndexes.add(index);
        });
      }

      if (!changedIds) {
        items.forEach((item, index) => {
          work.inputVisits += 1;
          if (!options.isItemEqual(state.inputs[index], item)) {
            candidateIndexes.add(index);
          }
        });
      }

      if (candidateIndexes.size === 0) {
        if (!changedIds) state.inputs = [...items];

        return {
          changedEntityIds: Object.freeze([]),
          changedOutputKeys: Object.freeze([]),
          fullFallback: false,
          mapped: Object.freeze([]),
          orderChanged: false,
        };
      }

      const candidates = [...candidateIndexes]
        .sort((left, right) => left - right)
        .map((index) => {
          const id = state.allIds[index];

          return {
            id,
            index,
            next: mapItem(items[index]),
            previous:
              state.mappedById.get(id) ??
              failInvariant('Expected value to be defined'),
          };
        });
      const changedCandidates = candidates.filter(({ next, previous }) => {
        const previousHasEntity = hasEntity(previous);
        const nextHasEntity = hasEntity(next);

        if (previousHasEntity !== nextHasEntity) return true;
        if (
          previousHasEntity &&
          nextHasEntity &&
          !isEntityEqual(previous.entity, next.entity)
        ) {
          return true;
        }

        return !areArraysEqual(
          previous.outputs,
          next.outputs,
          (left, right) =>
            left.key === right.key &&
            options.isOutputEqual(left.value, right.value)
        );
      });
      const mapped = Object.freeze(
        candidates.map(({ id, next }) => getMappedMetadata(id, next))
      );

      if (changedCandidates.length === 0) {
        if (changedIds) {
          candidates.forEach(({ index }) => {
            state.inputs[index] = items[index];
          });
        } else {
          state.inputs = [...items];
        }

        return {
          changedEntityIds: Object.freeze([]),
          changedOutputKeys: Object.freeze([]),
          fullFallback: false,
          mapped,
          orderChanged: false,
        };
      }

      const changedEntityIds: string[] = [];
      const dirtyOutputKeys = new Set<string>();
      const entityChanges = new Map<string, TEntity | undefined>();
      let entityCount = state.byId.size;
      const membershipChanges = new Map<string, Map<string, boolean>>();
      const nextMappedById = new Map(
        changedCandidates.map(({ id, next }) => [id, next] as const)
      );

      for (const { id, next, previous } of changedCandidates) {
        const previousHasEntity = hasEntity(previous);
        const nextHasEntity = hasEntity(next);

        if (
          previousHasEntity !== nextHasEntity ||
          (previousHasEntity &&
            nextHasEntity &&
            !isEntityEqual(previous.entity, next.entity))
        ) {
          changedEntityIds.push(id);
          work.entityCopies += 1;
          entityChanges.set(id, nextHasEntity ? next.entity : undefined);
          entityCount += Number(nextHasEntity) - Number(previousHasEntity);
        }

        for (const key of previous.outputsByKey.keys()) {
          work.outputCandidateVisits += 1;
          dirtyOutputKeys.add(key);
          if (next.outputsByKey.has(key)) continue;
          const changes = membershipChanges.get(key) ?? new Map();
          changes.set(id, false);
          membershipChanges.set(key, changes);
        }
        for (const key of next.outputsByKey.keys()) {
          if (previous.outputsByKey.has(key)) continue;
          work.outputCandidateVisits += 1;
          dirtyOutputKeys.add(key);
          const changes = membershipChanges.get(key) ?? new Map();
          changes.set(id, true);
          membershipChanges.set(key, changes);
        }
      }

      const nextIdsByOutputKey = new Map<string, string[]>();
      const nextOutputValuesByKey = new Map<
        string,
        readonly TValue[] | undefined
      >();
      const changedOutputKeys: string[] = [];

      dirtyOutputKeys.forEach((key) => {
        const changes = membershipChanges.get(key);
        let ids = state.idsByOutputKey.get(key) ?? [];
        if (changes) {
          ids = ids.filter((id) => changes.get(id) !== false);
          changes.forEach((included, id) => {
            if (included) ids.push(id);
          });
          ids.sort(
            (left, right) =>
              (state.indexById.get(left) ??
                failInvariant('Expected value to be defined')) -
              (state.indexById.get(right) ??
                failInvariant('Expected value to be defined'))
          );
        }
        nextIdsByOutputKey.set(key, ids);

        const nextValues = ids.flatMap((id) => {
          const values =
            (
              nextMappedById.get(id) ??
              state.mappedById.get(id) ??
              failInvariant('Expected value to be defined')
            ).outputsByKey.get(key) ?? (EMPTY_OUTPUTS as readonly TValue[]);

          work.outputVisits += values.length;
          return values;
        });
        const previousValues =
          state.byOutputKey[key] ?? (EMPTY_OUTPUTS as readonly TValue[]);

        if (areArraysEqual(previousValues, nextValues, options.isOutputEqual)) {
          return;
        }

        changedOutputKeys.push(key);
        nextOutputValuesByKey.set(
          key,
          nextValues.length > 0 ? Object.freeze(nextValues) : undefined
        );
      });

      if (changedIds) {
        candidates.forEach(({ index }) => {
          state.inputs[index] = items[index];
        });
      } else {
        state.inputs = [...items];
      }
      if (entityChanges.size > 0) {
        state.byId = createReadonlyEntityMap(
          state.entityRecord.publish(entityChanges),
          state.allIds,
          entityCount
        );
      }

      nextIdsByOutputKey.forEach((ids, key) => {
        if (ids.length === 0) state.idsByOutputKey.delete(key);
        else state.idsByOutputKey.set(key, ids);
      });
      changedCandidates.forEach(({ id, next }) => {
        state.mappedById.set(id, next);
        if (next.outputs.length === 0) state.unprojectedIds.add(id);
        else state.unprojectedIds.delete(id);
      });
      state.byOutputKey = state.outputRecord.publish(nextOutputValuesByKey);

      return {
        changedEntityIds: Object.freeze(changedEntityIds),
        changedOutputKeys: Object.freeze(changedOutputKeys),
        fullFallback: false,
        mapped,
        orderChanged: false,
      };
    },
  });
};
