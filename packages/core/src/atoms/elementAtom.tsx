import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { Scope } from 'jotai/core/atom';
import { TElement } from '../slate/index';
import {
  atom,
  JotaiProvider,
  JotaiProviderProps,
  useAtomValue,
} from '../utils/index';

export const elementAtom = atom<TElement | null>(null);

export const SCOPE_ELEMENT = Symbol('element');

export const useElement = <T extends TElement = TElement>(
  pluginKey: string
) => {
  const value = useAtomValue(elementAtom, pluginKey);

  if (!value)
    throw new Error(
      `The \`useElement(pluginKey)\` hook must be used inside the node component's context`
    );

  return value as T;
};

export const useSetElement = (pluginKey: string) =>
  useAtom(elementAtom, pluginKey)[1];

export const ElementProviderChild = ({
  element,
  scope,
  children,
}: {
  element: TElement;
  scope: Scope;
  children: any;
}) => {
  const setElement = useSetElement(scope as string);

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
}) => {
  return (
    <JotaiProvider
      initialValues={[[elementAtom, element]]}
      scope={scope}
      {...props}
    >
      <ElementProviderChild element={element} scope={scope}>
        {children}
      </ElementProviderChild>
    </JotaiProvider>
  );
};
