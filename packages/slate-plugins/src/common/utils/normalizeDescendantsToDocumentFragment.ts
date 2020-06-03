import { Descendant, Element } from 'slate';
import { SlateDocumentFragment } from '../SlateDocument.types';

/**
 * Normalize the descendants to a valid document fragment.
 */
export const normalizeDescendantsToDocumentFragment = (
  descendants: Descendant[]
): SlateDocumentFragment => {
  descendants.forEach((element) => {
    if (Element.isElement(element)) {
      normalizeDescendantsToDocumentFragment(element.children);
    }
  });

  if (!descendants.length) {
    descendants.push({ text: '' });
  }

  return descendants as SlateDocumentFragment;
};
