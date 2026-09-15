import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from 'react';

import type { NodeKey } from '..';
import type { DecorationSource, DecorationSlice } from './decoration-source';
import { useIsomorphicLayoutEffect } from './hooks/use-isomorphic-layout-effect';

export type PliteDecorationStore = Readonly<{
  getNodeSnapshot: (nodeKey: NodeKey) => readonly DecorationSlice[];
  getVersion: () => number;
  hasSources: () => boolean;
  subscribe: (
    listener: (changedNodeKeys: readonly NodeKey[]) => void
  ) => () => void;
  subscribeNodeKey: (nodeKey: NodeKey, listener: () => void) => () => void;
}>;

export const DecorationContext = createContext<PliteDecorationStore | null>(
  null
);

export type PliteDecorationRegistrar = (
  source: DecorationSource<unknown>
) => () => void;

export const DecorationRegistrationContext =
  createContext<PliteDecorationRegistrar | null>(null);

const EMPTY_DECORATIONS = Object.freeze([]) as readonly DecorationSlice[];
const subscribeEmpty = () => () => {};
const getEmptySnapshot = () => EMPTY_DECORATIONS;
export const usePliteDecorationEntries = (nodeKey: NodeKey | null) => {
  const manager = useContext(DecorationContext);
  const subscribe = useCallback(
    (listener: () => void) =>
      nodeKey && manager
        ? manager.subscribeNodeKey(nodeKey, listener)
        : subscribeEmpty(),
    [manager, nodeKey]
  );
  const getSnapshot = useCallback(
    () =>
      nodeKey && manager ? manager.getNodeSnapshot(nodeKey) : EMPTY_DECORATIONS,
    [manager, nodeKey]
  );

  return useSyncExternalStore(
    manager ? subscribe : subscribeEmpty,
    manager ? getSnapshot : getEmptySnapshot,
    manager ? getSnapshot : getEmptySnapshot
  );
};

export const useRegisterPliteDecorationSource = (
  source: DecorationSource<unknown> | null
) => {
  const register = useContext(DecorationRegistrationContext);

  useIsomorphicLayoutEffect(
    () => (source && register ? register(source) : undefined),
    [register, source]
  );
};
