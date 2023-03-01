import React, { useEffect } from 'react';
import { Scope } from 'jotai/core/atom';
import { TElement } from '../../../slate-utils/src/slate/index';
import { JotaiProvider, JotaiProviderProps } from '../utils/index';
import { createAtomStore } from './createAtomStore';

export const SCOPE_ELEMENT = 'element';

export const { elementStore, useElementStore } = createAtomStore(
  {
    element: (null as unknown) as TElement,
  },
  { name: 'element' as const }
);

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
  const setGlobalElement = useElementStore().set.element(SCOPE_ELEMENT);

  useEffect(() => {
    setElement(element);
    setGlobalElement(element);
  }, [element, setElement, setGlobalElement]);

  return children;
};

/**
 * Global and scoped provider above element.
 */
export const ElementProvider = ({
  element,
  scope,
  children,
  ...props
}: JotaiProviderProps & {
  element: TElement;
}) => (
  <JotaiProvider
    initialValues={[[elementStore.atom.element, element]]}
    scope={SCOPE_ELEMENT}
    {...props}
  >
    <JotaiProvider
      initialValues={[[elementStore.atom.element, element]]}
      scope={scope}
      {...props}
    >
      <ElementProviderChild element={element} scope={scope!}>
        {children}
      </ElementProviderChild>
    </JotaiProvider>
  </JotaiProvider>
);
