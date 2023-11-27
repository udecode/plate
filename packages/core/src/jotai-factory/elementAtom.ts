import { TElement } from '@udecode/slate';
import {createAtomStore} from './createAtomStore';

export const SCOPE_ELEMENT = 'element';

export type ElementStoreValue = { element: TElement | null };

export const { useElementStore, ElementProvider } = createAtomStore(
  { element: null } satisfies ElementStoreValue as ElementStoreValue,
  { name: 'element' } as const
);

/**
 * Get the element by plugin key.
 * If no element is found in the context, it will return an empty object.
 */
export const useElement = <T extends TElement = TElement>(
  pluginKey = SCOPE_ELEMENT
): T => {
  const value = useElementStore(pluginKey).get.element();

  if (!value) {
    console.warn(
      `The \`useElement(pluginKey)\` hook must be used inside the node component's context`
    );
    return {} as T;
  }

  return value as T;
};
