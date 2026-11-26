import React from 'react';

import type { Element, ElementEntry, Path } from '../../../facade';
import type { Nullable } from '../../../lib/types/Nullable';

export type ElementStoreState = {
  element: Element;
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
};

type ElementRuntimeState = Nullable<ElementStoreState>;

type ElementRuntimeStore = {
  getState: () => ElementRuntimeState;
  setState: (nextState: ElementRuntimeState) => void;
  subscribe: (listener: () => void) => () => void;
};

const initialState: Nullable<ElementStoreState> = {
  element: null,
  entry: null,
  path: null,
};

const ElementStoreContext =
  React.createContext<ElementStoreContextValue | null>(null);
let currentElementContext: RenderElementContextValue | null = null;

const subscribeToEmptyElementRuntime = () => () => {};
const getEmptyElementRuntimeState = () => initialState;

const createElementRuntimeStore = (
  innerInitialState: ElementRuntimeState
): ElementRuntimeStore => {
  const listeners = new Set<() => void>();
  let state = innerInitialState;

  return {
    getState: () => state,
    setState: (nextState) => {
      if (
        Object.is(state.element, nextState.element) &&
        Object.is(state.entry, nextState.entry) &&
        Object.is(state.path, nextState.path)
      ) {
        return;
      }

      state = nextState;

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

const findMatchingRenderElementContext = (
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

export const runElementContext = <T,>(
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

export const useElementContext = (scope?: string) => {
  const nearestStoreContext = React.useContext(ElementStoreContext);
  const renderContext = findMatchingRenderElementContext(
    currentElementContext,
    scope
  );
  let matchingStoreContext = nearestStoreContext;

  if (scope) {
    matchingStoreContext = null;

    let current = nearestStoreContext;

    while (current) {
      if (current.scope === scope) {
        matchingStoreContext = current;
        break;
      }

      current = current.parent;
    }
  }
  const providerState = React.useSyncExternalStore(
    matchingStoreContext?.runtime.subscribe ?? subscribeToEmptyElementRuntime,
    matchingStoreContext?.runtime.getState ?? getEmptyElementRuntimeState,
    matchingStoreContext?.runtime.getState ?? getEmptyElementRuntimeState
  );

  if (renderContext) return renderContext;

  if (!matchingStoreContext) return null;

  return {
    ...providerState,
    scope: matchingStoreContext.scope,
  };
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
  const parentStore = React.useContext(ElementStoreContext);
  const storeContextValue = React.useMemo<ElementStoreContextValue>(
    () => ({
      parent: parentStore,
      runtime,
      scope,
    }),
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
    <ElementStoreContext value={storeContextValue}>
      {children}
    </ElementStoreContext>
  );
}
