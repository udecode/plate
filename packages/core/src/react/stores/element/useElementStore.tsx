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
  scope?: string;
};

type RenderElementContextValue = ElementContextValue & {
  parent: RenderElementContextValue | null;
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
  publish: () => void;
  stage: (nextState: ElementRuntimeState) => void;
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

const ElementStoreContext =
  React.createContext<ElementStoreContextValue | null>(null);
let currentElementContext: RenderElementContextValue | null = null;

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
  let publishedState = initialState;

  return {
    getJotaiStore: () => {
      if (!jotaiStore) {
        jotaiStore = createElementJotaiStore(state);
      }

      return jotaiStore;
    },
    getState: () => state,
    publish: () => {
      const prevState = publishedState;
      publishedState = state;

      if (jotaiStore) {
        syncElementStore(jotaiStore, state, prevState);
      }

      listeners.forEach((listener) => {
        listener();
      });
    },
    stage: (nextState) => {
      if (
        Object.is(state.element, nextState.element) &&
        Object.is(state.entry, nextState.entry) &&
        Object.is(state.path, nextState.path)
      ) {
        return;
      }

      state = nextState;
    },
    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
};

const findMatchingElementContext = (
  context: RenderElementContextValue | null,
  scope?: string
) => {
  if (!context || !scope) return context;

  let current: RenderElementContextValue | null = context;

  while (current) {
    if (current.scope === scope) return current;

    current = current.parent;
  }

  return null;
};

const findMatchingElementStoreContext = (
  context: ElementStoreContextValue | null,
  scope?: string
) => {
  if (!context || !scope) return context;

  let current: ElementStoreContextValue | null = context;

  while (current) {
    if (current.scope === scope) return current;

    current = current.parent;
  }

  return null;
};

const getEmptyElementRuntimeState = () => initialState;

const subscribeToEmptyElementRuntime = () => () => {};

export const withElementContext = <T,>(
  context: ElementContextValue,
  callback: () => T
): T => {
  const previousContext = currentElementContext;
  const nextContext = {} as RenderElementContextValue;

  Object.defineProperties(
    nextContext,
    Object.getOwnPropertyDescriptors(context)
  );
  nextContext.parent = previousContext;
  currentElementContext = nextContext;

  try {
    return callback();
  } finally {
    currentElementContext = previousContext;
  }
};

export const useElementContext = (
  scope?: string
): ElementContextValue | null => {
  const nearestStoreContext = React.useContext(ElementStoreContext);
  const renderContext = findMatchingElementContext(
    currentElementContext,
    scope
  );
  const matchingStoreContext = findMatchingElementStoreContext(
    nearestStoreContext,
    scope
  );
  const storeContext =
    matchingStoreContext ??
    (currentElementContext ? null : nearestStoreContext);
  const runtime = renderContext ? null : storeContext?.runtime;
  const state = React.useSyncExternalStore(
    runtime?.subscribe ?? subscribeToEmptyElementRuntime,
    runtime?.getState ?? getEmptyElementRuntimeState,
    runtime?.getState ?? getEmptyElementRuntimeState
  );

  if (renderContext) return renderContext;
  if (!storeContext) return currentElementContext;

  return { ...state, scope: storeContext.scope };
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

  runtime.stage({
    element,
    entry,
    path: elementPath,
  });

  const parentStore = React.useContext(ElementStoreContext);
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
    runtime.publish();
  }, [element, elementPath, entry, runtime]);

  return (
    <ElementStoreContext.Provider value={storeContextValue}>
      {path && PathApi.equals(path, [0]) ? <FirstBlockEffect /> : null}

      {children}
    </ElementStoreContext.Provider>
  );
}

export function FirstBlockEffect() {
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
