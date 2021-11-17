import { normalizeDescendantsToDocumentFragment } from '@udecode/plate-common';
import { PlateEditor, TDescendant } from '@udecode/plate-core';
import { htmlStringToDOMNode } from '../../html-serializer/utils/htmlStringToDOMNode';
import { deserializeHtmlElement } from './deserializeHtmlElement';

/**
 * Deserialize HTML element to a valid document fragment.
 */
export const deserializeHtml = <T = {}>(
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

  const fragment = deserializeHtmlElement(editor, element) as TDescendant[];

  return normalizeDescendantsToDocumentFragment(editor, {
    descendants: fragment,
  });
};
