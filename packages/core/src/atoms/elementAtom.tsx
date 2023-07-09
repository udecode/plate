import React, { useEffect } from 'react';
import { TElement } from '@udecode/slate';
// eslint-disable-next-line import/no-unresolved
import { Scope } from 'jotai/core/atom';

import { JotaiProvider, JotaiProviderProps } from '../libs';
import { createAtomStore } from './createAtomStore';

export const SCOPE_ELEMENT = 'element';

export const { elementStore, useElementStore } = createAtomStore(
  {
    element: null as unknown as TElement,
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
export function ElementProvider({
  element,
  scope,
  children,
  ...props
}: JotaiProviderProps & {
  element: TElement;
}) {
  return (
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
}
