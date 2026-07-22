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
  outputs: readonly StableIdMappedOutput<TValue>[];
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
  forceAll?: boolean;
  forceIds?: readonly string[];
}>;

export type StableIdMappedSourceRefreshResult<TMetadata> = Readonly<{
  changedEntityIds: readonly string[];
  changedOutputKeys: readonly string[];
  fullFallback: boolean;
  mapped: readonly Readonly<{ id: string; metadata?: TMetadata }>[];
  orderChanged: boolean;
}>;

export type StableIdMappedSource<TItem, TEntity, TValue, TMetadata> = Readonly<{
  getIdsForOutputKeys: (keys: readonly string[]) => readonly string[];
  getIdsWithoutOutputs: () => readonly string[];
  getSnapshot: () => StableIdMappedSourceSnapshot<TEntity, TValue>;
  refresh: (
    items: readonly TItem[],
    options?: StableIdMappedSourceRefreshOptions
  ) => StableIdMappedSourceRefreshResult<TMetadata>;
}>;

type InternalMappedValue<TEntity, TValue, TMetadata> = Readonly<{
  entity?: TEntity;
  metadata?: TMetadata;
  outputs: readonly StableIdMappedOutput<TValue>[];
}>;

type InternalState<TItem, TEntity, TValue, TMetadata> = {
  allIds: readonly string[];
  byId: ReadonlyMap<string, TEntity>;
  byOutputKey: Readonly<Record<string, readonly TValue[]>>;
  idsByOutputKey: Map<string, string[]>;
  indexById: Map<string, number>;
  inputs: TItem[];
  mappedById: Map<string, InternalMappedValue<TEntity, TValue, TMetadata>>;
};

const EMPTY_OUTPUTS = Object.freeze([]) as readonly unknown[];

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

const getMappedMetadata = <TEntity, TValue, TMetadata>(
  id: string,
  mapped: InternalMappedValue<TEntity, TValue, TMetadata>
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

  const buildState = (
    items: readonly TItem[]
  ): InternalState<TItem, TEntity, TValue, TMetadata> => {
    const ids = items.map(options.getId);

    if (new Set(ids).size !== ids.length) {
      throw new Error('Stable mapped view source IDs must be unique.');
    }

    const allIds = Object.freeze(ids);
    const byId = new Map<string, TEntity>();
    const byOutputKey: Record<string, TValue[]> = Object.create(null);
    const idsByOutputKey = new Map<string, string[]>();
    const mappedById = new Map<
      string,
      InternalMappedValue<TEntity, TValue, TMetadata>
    >();

    items.forEach((item, index) => {
      const id = allIds[index]!;
      const mapped = options.map(item);
      mappedById.set(id, mapped);

      if (hasEntity(mapped)) {
        byId.set(id, mapped.entity);
      }

      for (const output of mapped.outputs) {
        const outputValues = byOutputKey[output.key] ?? [];
        outputValues.push(output.value);
        byOutputKey[output.key] = outputValues;

        const outputIds = idsByOutputKey.get(output.key) ?? [];
        if (!outputIds.includes(id)) outputIds.push(id);
        idsByOutputKey.set(output.key, outputIds);
      }
    });

    const frozenOutputs: Record<string, readonly TValue[]> =
      Object.create(null);

    Object.entries(byOutputKey).forEach(([key, values]) => {
      frozenOutputs[key] = Object.freeze(values);
    });

    return {
      allIds,
      byId,
      byOutputKey: Object.freeze(frozenOutputs),
      idsByOutputKey,
      indexById: new Map(allIds.map((id, index) => [id, index])),
      inputs: [...items],
      mappedById,
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
      getMappedMetadata(id, nextState.mappedById.get(id)!)
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
      return Object.freeze(
        state.allIds.filter(
          (id) => state.mappedById.get(id)?.outputs.length === 0
        )
      );
    },
    getSnapshot() {
      return Object.freeze({
        allIds: state.allIds,
        byId: state.byId,
        byOutputKey: state.byOutputKey,
      });
    },
    refresh(items, refreshOptions = {}) {
      const nextIds = items.map(options.getId);

      if (
        nextIds.length !== state.allIds.length ||
        nextIds.some((id, index) => id !== state.allIds[index])
      ) {
        return replaceAll(items);
      }

      const candidateIndexes = new Set<number>();

      if (refreshOptions.forceAll) {
        items.forEach((_, index) => {
          candidateIndexes.add(index);
        });
      } else {
        refreshOptions.forceIds?.forEach((id) => {
          const index = state.indexById.get(id);

          if (index !== undefined) candidateIndexes.add(index);
        });
      }

      items.forEach((item, index) => {
        if (!options.isItemEqual(state.inputs[index]!, item)) {
          candidateIndexes.add(index);
        }
      });

      if (candidateIndexes.size === 0) {
        state.inputs = [...items];

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
          const id = state.allIds[index]!;

          return {
            id,
            index,
            next: options.map(items[index]!),
            previous: state.mappedById.get(id)!,
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
        state.inputs = [...items];

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
      const nextById = new Map(state.byId);
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
          if (nextHasEntity) nextById.set(id, next.entity);
          else nextById.delete(id);
        }

        const previousKeys = unique(
          previous.outputs.map((output) => output.key)
        );
        const nextKeys = unique(next.outputs.map((output) => output.key));

        previousKeys.forEach((key) => {
          dirtyOutputKeys.add(key);
        });
        nextKeys.forEach((key) => {
          dirtyOutputKeys.add(key);
        });
      }

      const nextIdsByOutputKey = new Map<string, string[]>();
      const nextOutputValuesByKey = new Map<string, readonly TValue[]>();
      const nextByOutputKey: Record<string, readonly TValue[]> = Object.assign(
        Object.create(null),
        state.byOutputKey
      );
      const changedOutputKeys: string[] = [];

      dirtyOutputKeys.forEach((key) => {
        const ids = [...(state.idsByOutputKey.get(key) ?? [])];

        for (const { id, next, previous } of changedCandidates) {
          const hadOutput = previous.outputs.some(
            (output) => output.key === key
          );
          const hasOutput = next.outputs.some((output) => output.key === key);

          if (hadOutput === hasOutput) continue;

          if (hasOutput) {
            ids.push(id);
          } else {
            const index = ids.indexOf(id);

            if (index >= 0) ids.splice(index, 1);
          }
        }

        ids.sort(
          (left, right) =>
            state.indexById.get(left)! - state.indexById.get(right)!
        );
        nextIdsByOutputKey.set(key, ids);

        const nextValues = ids.flatMap((id) =>
          (nextMappedById.get(id) ?? state.mappedById.get(id)!).outputs
            .filter((output) => output.key === key)
            .map((output) => output.value)
        );
        const previousValues =
          state.byOutputKey[key] ?? (EMPTY_OUTPUTS as readonly TValue[]);

        if (areArraysEqual(previousValues, nextValues, options.isOutputEqual)) {
          return;
        }

        changedOutputKeys.push(key);
        nextOutputValuesByKey.set(key, Object.freeze(nextValues));
      });

      state.inputs = [...items];
      state.byId = nextById;

      nextIdsByOutputKey.forEach((ids, key) => {
        if (ids.length === 0) state.idsByOutputKey.delete(key);
        else state.idsByOutputKey.set(key, ids);
      });
      changedCandidates.forEach(({ id, next }) => {
        state.mappedById.set(id, next);
      });
      nextOutputValuesByKey.forEach((values, key) => {
        if (values.length === 0) delete nextByOutputKey[key];
        else nextByOutputKey[key] = values;
      });
      state.byOutputKey = Object.freeze(nextByOutputKey);

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
