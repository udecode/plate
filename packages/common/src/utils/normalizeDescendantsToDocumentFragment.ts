import { isElement, TDescendant } from '@udecode/slate-plugins-core';
import { SlateDocumentFragment } from '../types/SlateDocument.types';

/**
 * Normalize the descendants to a valid document fragment.
 */
export const normalizeDescendantsToDocumentFragment = (
  descendants: TDescendant[]
): SlateDocumentFragment => {
  descendants.forEach((element) => {
    if (isElement(element)) {
      normalizeDescendantsToDocumentFragment(element.children);
    }
  });

  if (!descendants.length) {
    descendants.push({ text: '' });
  }

  return descendants as SlateDocumentFragment;
};
