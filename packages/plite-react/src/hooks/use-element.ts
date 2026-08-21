import type { Element } from '@platejs/plite';
import { createContext, useContext } from 'react';

export const ElementContext = createContext<Element | null>(null);

/**
 * Get the current element.
 */

export const useElement = <TElement extends Element = Element>(): TElement => {
  const context = useContext(ElementContext);

  if (!context) {
    throw new Error(
      'The `useElement` hook must be used inside `renderElement`.'
    );
  }

  return context as TElement;
};

/**
 * Get the current element, or return null if not inside `renderElement`.
 */
export const useOptionalElement = <TElement extends Element = Element>() =>
  useContext(ElementContext) as TElement | null;
