import React, {
  createContext,
  FC,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createStore } from 'jotai/vanilla';

import { AtomProvider, AtomProviderProps } from './atomProvider';
import { AtomRecord, JotaiStore } from './createAtomStore';
import { useHydrateStore, useSyncStore } from './useHydrateStore';

const getFullyQualifiedScope = (storeName: string, scope: string) => {
  return `${storeName}:${scope}`;
};

// Map from store name to store. Used for provider-less stores only.
const globalAtomStores = new Map<string, JotaiStore>();

/**
 * Context mapping store name and scope to store. Used for providers. The
 * 'provider' scope is used to reference any provider belonging to the store,
 * regardless of scope.
 */
const PROVIDER_SCOPE = 'provider';
const AtomStoreContext = createContext<Map<string, JotaiStore>>(new Map());

// Get the global store for the given store name, creating it if necessary.
const getGlobalAtomStore = (storeName: string): JotaiStore => {
  if (!globalAtomStores.has(storeName)) {
    globalAtomStores.set(storeName, createStore());
  }

  return globalAtomStores.get(storeName)!;
};

/**
 * Tries to find a store in each of the following places, in order:
 * 1. The store context, matching the store name and scope
 * 2. The store context, matching the store name and 'provider' scope
 * 3. The global store for the store name
 */
export const useAtomStore = (
  storeName: string,
  scope: string = PROVIDER_SCOPE
): JotaiStore => {
  const storeContext = useContext(AtomStoreContext);
  return (
    storeContext.get(getFullyQualifiedScope(storeName, scope)) ??
    storeContext.get(getFullyQualifiedScope(storeName, PROVIDER_SCOPE)) ??
    getGlobalAtomStore(storeName)
  );
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
    const [storeState, setStoreState] = useState<JotaiStore>(createStore());

    useEffect(() => {
      if (resetKey) {
        setStoreState(createStore());
      }
    }, [resetKey]);

    const previousStoreContext = useContext(AtomStoreContext);

    const storeContext = useMemo(() => {
      const newStoreContext = new Map(previousStoreContext);

      if (scope) {
        // Make the store findable by its fully qualified scope
        newStoreContext.set(
          getFullyQualifiedScope(storeScope, scope),
          storeState
        );
      }

      // Make the store findable by its store name alone
      newStoreContext.set(
        getFullyQualifiedScope(storeScope, PROVIDER_SCOPE),
        storeState
      );

      return newStoreContext;
    }, [previousStoreContext, scope, storeState]);

    return (
      <AtomStoreContext.Provider value={storeContext}>
        <AtomProvider store={storeState}>
          <HydrateAtoms store={storeState} atoms={atoms} {...(props as any)}>
            {!!Effect && <Effect />}

            {children}
          </HydrateAtoms>
        </AtomProvider>
      </AtomStoreContext.Provider>
    );
  };
};
