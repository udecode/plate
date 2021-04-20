import { isElement, TDescendant } from '@udecode/slate-plugins-core';

/**
 * Normalize the descendants to a valid document fragment.
 */
export const normalizeDescendantsToDocumentFragment = (
  descendants: TDescendant[]
) => {
  descendants.forEach((element) => {
    if (isElement(element)) {
      normalizeDescendantsToDocumentFragment(element.children);
    }
  });

  if (!descendants.length) {
    descendants.push({ text: '' });
  }

  return descendants;
};
