import { createContext, useContext } from 'react';

import type { Element, NodeKey, Path } from '../..';

export const ElementContext = createContext<{
  element: Element;
  nodeKey: NodeKey;
  path: Path;
} | null>(null);

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

  return context.element as TElement;
};

/**
 * Get the current element, or return null if not inside `renderElement`.
 */
export const useOptionalElement = <TElement extends Element = Element>() =>
  (useContext(ElementContext)?.element ?? null) as TElement | null;
