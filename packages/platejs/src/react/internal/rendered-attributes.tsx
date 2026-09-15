import React from 'react';

import type { NodeKey } from '../../facade';
import {
  clonePlateRenderedAttributes,
  EMPTY_RENDERED_ATTRIBUTES,
  mergePlateRenderedAttributes,
} from '../../internal/mergePlateRenderedAttributes';
import type { UnknownObject } from '../../lib/types/AnyObject';
import type {
  ViewElementAttributeEntry,
  ViewElementAttributes,
} from '../plugin/PlatePlugin';
import { useIsomorphicLayoutEffect } from './react-helpers';

export type PlateRenderedAttributeStoreMetrics = Readonly<{
  changedNodeCount: number;
  nodeSubscriptionCount: number;
  publicationCount: number;
  wakeCount: number;
}>;

export type PlateRenderedAttributeStore = Readonly<{
  clearSource: (sourceId: string) => void;
  getMetrics: () => PlateRenderedAttributeStoreMetrics;
  getNodeSnapshot: (nodeKey: NodeKey) => ViewElementAttributes;
  replaceSource: (
    sourceId: string,
    sourceOrder: number,
    entries: readonly ViewElementAttributeEntry[]
  ) => void;
  subscribeNodeKey: (nodeKey: NodeKey, listener: () => void) => () => void;
}>;

const areStylesEqual = (
  left: Readonly<Record<string, unknown>>,
  right: Readonly<Record<string, unknown>>
) => {
  if (left === right) return true;
  const names = Object.keys(left);

  return (
    names.length === Object.keys(right).length &&
    names.every((name) => Object.is(left[name], right[name]))
  );
};

const areAttributesEqual = (
  left: ViewElementAttributes,
  right: ViewElementAttributes
) => {
  if (left === right) return true;
  const names = Object.keys(left);

  if (names.length !== Object.keys(right).length) return false;

  return names.every((name) => {
    const leftValue = (left as UnknownObject)[name];
    const rightValue = (right as UnknownObject)[name];

    return name === 'style' && leftValue && rightValue
      ? areStylesEqual(
          leftValue as Readonly<Record<string, unknown>>,
          rightValue as Readonly<Record<string, unknown>>
        )
      : Object.is(leftValue, rightValue);
  });
};

const mergeSourceAttributes = (
  sourceMaps: Iterable<ReadonlyMap<NodeKey, ViewElementAttributes>>,
  nodeKey: NodeKey
) => {
  let merged = EMPTY_RENDERED_ATTRIBUTES;

  for (const sourceMap of sourceMaps) {
    const attributes = sourceMap.get(nodeKey);

    if (!attributes) continue;
    merged = mergePlateRenderedAttributes(
      merged as UnknownObject,
      attributes
    ) as unknown as ViewElementAttributes;
  }

  return merged === EMPTY_RENDERED_ATTRIBUTES
    ? merged
    : (Object.freeze(merged) as ViewElementAttributes);
};

type PlateRenderedAttributeSource = Readonly<{
  attributes: ReadonlyMap<NodeKey, ViewElementAttributes>;
  order: number;
}>;

export const createPlateRenderedAttributeStore =
  (): PlateRenderedAttributeStore => {
    const listenersByNodeKey = new Map<NodeKey, Set<() => void>>();
    const mergedByNodeKey = new Map<NodeKey, ViewElementAttributes>();
    const sources = new Map<string, PlateRenderedAttributeSource>();
    const metrics = {
      changedNodeCount: 0,
      nodeSubscriptionCount: 0,
      publicationCount: 0,
      wakeCount: 0,
    };

    const replaceSource = (
      sourceId: string,
      sourceOrder: number,
      entries: readonly ViewElementAttributeEntry[]
    ) => {
      if (sourceId.length === 0) {
        throw new Error('Rendered attribute source ids must be non-empty.');
      }
      if (!Number.isSafeInteger(sourceOrder) || sourceOrder < 0) {
        throw new Error(
          'Rendered attribute source order must be non-negative.'
        );
      }

      const previous = sources.get(sourceId);
      const previousAttributes = previous?.attributes ?? new Map();
      const nextAttributes = new Map<NodeKey, ViewElementAttributes>();

      entries.forEach(({ attributes, key }) => {
        if (nextAttributes.has(key)) {
          throw new Error(
            `Rendered attribute source "${sourceId}" returned duplicate node key "${key}".`
          );
        }
        nextAttributes.set(key, clonePlateRenderedAttributes(attributes));
      });

      const unchanged =
        previous?.order === sourceOrder &&
        previousAttributes.size === nextAttributes.size &&
        [...previousAttributes].every(([nodeKey, attributes]) => {
          const next = nextAttributes.get(nodeKey);

          return !!next && areAttributesEqual(attributes, next);
        });

      if (unchanged) return;

      sources.set(sourceId, {
        attributes: nextAttributes,
        order: sourceOrder,
      });
      metrics.publicationCount += 1;
      const affected = new Set<NodeKey>([
        ...previousAttributes.keys(),
        ...nextAttributes.keys(),
      ]);
      const orderedSourceMaps = [...sources]
        .sort(
          ([leftId, left], [rightId, right]) =>
            left.order - right.order || leftId.localeCompare(rightId)
        )
        .map(([, source]) => source.attributes);
      const changed: NodeKey[] = [];

      affected.forEach((nodeKey) => {
        const previousMerged =
          mergedByNodeKey.get(nodeKey) ?? EMPTY_RENDERED_ATTRIBUTES;
        const candidate = mergeSourceAttributes(orderedSourceMaps, nodeKey);
        const nextMerged = areAttributesEqual(previousMerged, candidate)
          ? previousMerged
          : candidate;

        if (nextMerged === previousMerged) return;
        if (nextMerged === EMPTY_RENDERED_ATTRIBUTES) {
          mergedByNodeKey.delete(nodeKey);
        } else {
          mergedByNodeKey.set(nodeKey, nextMerged);
        }
        changed.push(nodeKey);
      });

      metrics.changedNodeCount += changed.length;
      const listeners = new Set<() => void>();

      changed.forEach((nodeKey) => {
        listenersByNodeKey.get(nodeKey)?.forEach((listener) => {
          listeners.add(listener);
        });
      });
      metrics.wakeCount += listeners.size;
      listeners.forEach((listener) => listener());
    };

    return {
      clearSource(sourceId) {
        const source = sources.get(sourceId);

        if (source) replaceSource(sourceId, source.order, []);
      },
      getMetrics: () => Object.freeze({ ...metrics }),
      getNodeSnapshot: (nodeKey) =>
        mergedByNodeKey.get(nodeKey) ?? EMPTY_RENDERED_ATTRIBUTES,
      replaceSource,
      subscribeNodeKey(nodeKey, listener) {
        const listeners = listenersByNodeKey.get(nodeKey) ?? new Set();

        listeners.add(listener);
        listenersByNodeKey.set(nodeKey, listeners);
        metrics.nodeSubscriptionCount += 1;
        let active = true;

        return () => {
          if (!active) return;

          active = false;
          listeners.delete(listener);
          metrics.nodeSubscriptionCount -= 1;
          if (listeners.size === 0) listenersByNodeKey.delete(nodeKey);
        };
      },
    };
  };

const PlateRenderedAttributeContext = React.createContext<
  PlateRenderedAttributeStore | undefined
>(undefined);

const subscribeEmpty = () => () => {};
const getEmptySnapshot = () => EMPTY_RENDERED_ATTRIBUTES;

export function PlateRenderedAttributeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store] = React.useState(createPlateRenderedAttributeStore);

  return (
    <PlateRenderedAttributeContext value={store}>
      {children}
    </PlateRenderedAttributeContext>
  );
}

export const usePlateRenderedAttributes = (nodeKey: NodeKey | null) => {
  const store = React.useContext(PlateRenderedAttributeContext);
  const subscribe = React.useCallback(
    (listener: () => void) =>
      nodeKey && store
        ? store.subscribeNodeKey(nodeKey, listener)
        : subscribeEmpty(),
    [nodeKey, store]
  );
  const getSnapshot = React.useCallback(
    () =>
      nodeKey && store
        ? store.getNodeSnapshot(nodeKey)
        : EMPTY_RENDERED_ATTRIBUTES,
    [nodeKey, store]
  );

  return React.useSyncExternalStore(
    store ? subscribe : subscribeEmpty,
    store ? getSnapshot : getEmptySnapshot,
    getEmptySnapshot
  );
};

export const usePublishPlateRenderedAttributes = (
  sourceId: string,
  sourceOrder: number,
  entries: readonly ViewElementAttributeEntry[]
) => {
  const store = React.useContext(PlateRenderedAttributeContext);

  useIsomorphicLayoutEffect(() => {
    store?.replaceSource(sourceId, sourceOrder, entries);
  }, [entries, sourceId, sourceOrder, store]);
  useIsomorphicLayoutEffect(
    () => () => {
      store?.clearSource(sourceId);
    },
    [sourceId, store]
  );
};
