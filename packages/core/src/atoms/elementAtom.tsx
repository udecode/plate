import React, { useEffect } from 'react';
import { Scope } from 'jotai/core/atom';
import { TElement } from '../slate/index';
import { JotaiProvider, JotaiProviderProps } from '../utils/index';
import { createAtomStore } from './createAtomStore';

export const SCOPE_ELEMENT = Symbol('element');

export const { elementStore, useElementStore } = createAtomStore(
  {
    element: (null as unknown) as TElement,
  },
  { scope: SCOPE_ELEMENT, name: 'element' as const }
);

export const useElement = <T extends TElement = TElement>(
  pluginKey: string
) => {
  const value = useElementStore().get.element(pluginKey);

  if (!value)
    throw new Error(
      `The \`useElement(pluginKey)\` hook must be used inside the node component's context`
    );

  return value as T;
};

export const ElementProviderChild = ({
  element,
  scope,
  children,
}: {
  element: TElement;
  scope: Scope;
  children: any;
}) => {
  const setElement = useElementStore().set.element(scope);

  useEffect(() => {
    setElement(element);
  }, [element, setElement]);

  return children;
};

export const ElementProvider = ({
  element,
  scope = SCOPE_ELEMENT,
  children,
  ...props
}: JotaiProviderProps & {
  element: TElement;
}) => (
  <JotaiProvider
    initialValues={[[elementStore.atom.element, element]]}
    scope={scope}
    {...props}
  >
    <ElementProviderChild element={element} scope={scope}>
      {children}
    </ElementProviderChild>
  </JotaiProvider>
);
