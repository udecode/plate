import { TElement } from '../../../slate-utils/src/slate/index';
import { SCOPE_ELEMENT, useElementStore } from './elementAtom';

/**
 * Get the element by plugin key.
 * If no element is found in the context, it will return an empty object.
 */
export const useElement = <T extends TElement = TElement>(
  pluginKey = SCOPE_ELEMENT
): T => {
  const value = useElementStore().get.element(pluginKey);

  if (!value) {
    console.warn(
      `The \`useElement(pluginKey)\` hook must be used inside the node component's context`
    );
    return {} as T;
  }

  return value as T;
};
