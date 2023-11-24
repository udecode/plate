import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  Context,
  FC,
} from 'react';
import { createStore } from 'jotai/vanilla';

import {
  AtomProvider,
  AtomProviderProps,
} from './atomProvider';
import { AtomRecord, JotaiStore } from './createAtomStore';
import { useHydrateStore, useSyncStore } from './useHydrateStore';

// Global store contexts
const storeContexts = new Map<string, Context<JotaiStore | undefined>>();

export const getStoreScope = (storeScope = 'global', scope = 'global') => {
  return `${storeScope}:${scope}`;
};

export const getContext = (scope = getStoreScope()) => {
  if (!storeContexts.has(scope)) {
    storeContexts.set(scope, createContext(undefined as any));
  }
  return storeContexts.get(scope);
};

export const useContextStore = (scope: string) => {
  const Context = getContext(scope)!;
  return useContext(Context);
};

export type ProviderProps<T extends object> = AtomProviderProps &
  Partial<T> & {
    scope?: string;
    initialValues?: Partial<T>;
    resetKey?: any;
  };

export const HydrateAtoms = <T extends object>({
  initialValues,
  children,
  store,
  atoms,
  ...props
}: Omit<ProviderProps<T>, 'scope'> & {
  atoms: AtomRecord<T>;
}) => {
  useHydrateStore(atoms, { ...initialValues, ...props } as any, {
    store,
  });
  useSyncStore(atoms, props as any, {
    store,
  });

  return <>{children}</>;
};

/**
 * Creates a generic provider for a jotai store.
 * - `initialValues`: Initial values for the store.
 * - `props`: Dynamic values for the store.
 */
export const createAtomProvider = <T extends object, N extends string = ''>(
  storeScope: N,
  atoms: AtomRecord<T>,
  options: { effect?: FC } = {}
) => {
  const Effect = options.effect;

  // eslint-disable-next-line react/display-name
  return ({ store, scope, children, resetKey, ...props }: ProviderProps<T>) => {
    const Context = getContext(getStoreScope(storeScope, scope))!;

    const [storeState, setStoreState] = useState<JotaiStore>(createStore());

    useEffect(() => {
      if (resetKey) {
        setStoreState(createStore());
      }
    }, [resetKey]);

    return (
      <Context.Provider value={storeState}>
        <AtomProvider store={storeState}>
          <HydrateAtoms store={storeState} atoms={atoms} {...(props as any)}>
            {!!Effect && <Effect />}

            {children}
          </HydrateAtoms>
        </AtomProvider>
      </Context.Provider>
    );
  };
};
