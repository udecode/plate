import React from 'react';
import { createStore } from 'jotai/vanilla';

import type { Nullable } from '@udecode/utils';

import {
  type ElementEntry,
  type Path,
  type TElement,
  PathApi,
} from '@platejs/slate';

import { createAtomStore } from '../../libs/jotai';
import { useComposing, useReadOnly } from '../../slate-react';
import { useEditorRef, usePlateStore } from '../plate';

export const SCOPE_ELEMENT = 'element';

export type ElementStoreState = {
  element: TElement;
  entry: ElementEntry;
  path: Path;
};

type ElementContextValue = Nullable<ElementStoreState> & {
  parent: ElementContextValue | null;
  scope?: string;
};

type ElementStoreContextValue = {
  parent: ElementStoreContextValue | null;
  runtime: ElementRuntimeStore;
  scope?: string;
  store: ReturnType<typeof createStore>;
};

type ElementRuntimeState = Nullable<ElementStoreState>;

type ElementRuntimeStore = {
  getJotaiStore: () => ReturnType<typeof createStore>;
  getState: () => ElementRuntimeState;
  setState: (nextState: ElementRuntimeState) => void;
  subscribe: (listener: () => void) => () => void;
};

const initialState: Nullable<ElementStoreState> = {
  element: null,
  entry: null,
  path: null,
};

const { elementStore, useElementStore: useElementStoreAtom } = createAtomStore(
  initialState as ElementStoreState,
  { name: 'element', suppressWarnings: true } as const
);

export { elementStore };

const ElementContext = React.createContext<ElementContextValue | null>(null);
const ElementStoreContext =
  React.createContext<ElementStoreContextValue | null>(null);

const syncElementStore = (
  store: ReturnType<typeof createStore>,
  nextState: ElementRuntimeState,
  prevState?: ElementRuntimeState
) => {
  if (!prevState || !Object.is(prevState.element, nextState.element)) {
    store.set(elementStore.atom.element, nextState.element as any);
  }
  if (!prevState || !Object.is(prevState.entry, nextState.entry)) {
    store.set(elementStore.atom.entry, nextState.entry as any);
  }
  if (!prevState || !Object.is(prevState.path, nextState.path)) {
    store.set(elementStore.atom.path, nextState.path as any);
  }
};

const createElementJotaiStore = (state: ElementRuntimeState) => {
  const store = createStore();

  syncElementStore(store, state);

  return store;
};

const createElementRuntimeStore = (
  initialState: ElementRuntimeState
): ElementRuntimeStore => {
  let jotaiStore: ReturnType<typeof createStore> | null = null;
  const listeners = new Set<() => void>();
  let state = initialState;

  return {
    getJotaiStore: () => {
      if (!jotaiStore) {
        jotaiStore = createElementJotaiStore(state);
      }

      return jotaiStore;
    },
    getState: () => state,
    setState: (nextState) => {
      if (
        Object.is(state.element, nextState.element) &&
        Object.is(state.entry, nextState.entry) &&
        Object.is(state.path, nextState.path)
      ) {
        return;
      }

      const prevState = state;
      state = nextState;

      if (jotaiStore) {
        syncElementStore(jotaiStore, nextState, prevState);
      }

      listeners.forEach((listener) => {
        listener();
      });
    },
    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
};

export const useElementContext = (scope?: string) => {
  const context = React.useContext(ElementContext);

  if (!context) return null;
  if (!scope) return context;

  let current: ElementContextValue | null = context;

  while (current) {
    if (current.scope === scope) return current;

    current = current.parent;
  }

  return context;
};

export const useElementStoreContext = (scope?: string) => {
  const context = React.useContext(ElementStoreContext);

  if (!context) return null;
  if (!scope) return context;

  let current: ElementStoreContextValue | null = context;

  while (current) {
    if (current.scope === scope) return current;

    current = current.parent;
  }

  return context;
};

export const useElementStore = (scope?: string) => {
  const context = useElementStoreContext(scope);
  const storeOptions = context
    ? ({
        scope,
        store: context.store,
      } as const)
    : scope;

  return useElementStoreAtom(storeOptions as any);
};

export function ElementProvider({
  children,
  path,
  scope,
  ...props
}: React.PropsWithChildren<
  Partial<ElementStoreState> & {
    scope?: string;
  }
>) {
  const element = props.element ?? null;
  const entry = props.entry ?? null;
  const elementPath = path ?? null;
  const [runtime] = React.useState(() =>
    createElementRuntimeStore({
      element,
      entry,
      path: elementPath,
    })
  );

  const parent = React.useContext(ElementContext);
  const parentStore = React.useContext(ElementStoreContext);
  const contextValue = React.useMemo<ElementContextValue>(
    () => ({
      element,
      entry,
      parent,
      path: elementPath,
      scope,
    }),
    [element, elementPath, entry, parent, scope]
  );
  const storeContextValue = React.useMemo<ElementStoreContextValue>(
    () =>
      ({
        parent: parentStore,
        runtime,
        scope,
        get store() {
          return runtime.getJotaiStore();
        },
      }) as ElementStoreContextValue,
    [parentStore, runtime, scope]
  );

  React.useLayoutEffect(() => {
    runtime.setState({
      element,
      entry,
      path: elementPath,
    });
  }, [element, elementPath, entry, runtime]);

  return (
    <ElementStoreContext.Provider value={storeContextValue}>
      <ElementContext.Provider value={contextValue}>
        {path && PathApi.equals(path, [0]) ? <FirstBlockEffect /> : null}

        {children}
      </ElementContext.Provider>
    </ElementStoreContext.Provider>
  );
}

function FirstBlockEffect() {
  const editor = useEditorRef();
  const store = usePlateStore();
  const composing = useComposing();
  const readOnly = useReadOnly();

  editor.dom.readOnly = readOnly;
  editor.dom.composing = composing;

  React.useLayoutEffect(() => {
    store.set('composing', composing);
  }, [composing, store]);

  return null;
}
