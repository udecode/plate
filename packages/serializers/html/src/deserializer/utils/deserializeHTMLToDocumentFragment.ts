import { normalizeDescendantsToDocumentFragment } from '@udecode/plate-common';
import { PlateEditor, TDescendant } from '@udecode/plate-core';
import { htmlStringToDOMNode } from '../../serializer/utils/htmlStringToDOMNode';
import { deserializeHTMLElement } from './deserializeHTMLElement';

/**
 * Deserialize HTML element to a valid document fragment.
 */
export const deserializeHTMLToDocumentFragment = <T = {}>(
  editor: PlateEditor<T>,
  {
    element,
    stripWhitespace = true,
  }: {
    element: HTMLElement | string;
    stripWhitespace?: boolean;
  }
): TDescendant[] => {
  // for serializer
  if (typeof element === 'string') {
    element = htmlStringToDOMNode(element, stripWhitespace);
  }

  const fragment = deserializeHTMLElement(editor, {
    element,
  }) as TDescendant[];

  return normalizeDescendantsToDocumentFragment(editor, {
    descendants: fragment,
  });
};
