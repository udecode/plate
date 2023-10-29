import { EDescendant, Value } from '@udecode/slate';

import { PlateEditor } from '../../../types/PlateEditor';
import { normalizeDescendantsToDocumentFragment } from '../../../utils/normalizeDescendantsToDocumentFragment';
import { deserializeHtmlElement } from './deserializeHtmlElement';
import { htmlStringToDOMNode } from './htmlStringToDOMNode';
import { setStripWhitespace } from './stripWhitespaceConfig';

/**
 * Deserialize HTML element to a valid document fragment.
 */
export const deserializeHtml = <V extends Value>(
  editor: PlateEditor<V>,
  {
    element,
    stripWhitespace = true,
  }: {
    element: HTMLElement | string;
    stripWhitespace?: boolean;
  }
): EDescendant<V>[] => {
  setStripWhitespace(stripWhitespace);
  // for serializer
  if (typeof element === 'string') {
    element = htmlStringToDOMNode(element, stripWhitespace);
  }

  const fragment = deserializeHtmlElement(editor, element) as EDescendant<V>[];

  return normalizeDescendantsToDocumentFragment(editor, {
    descendants: fragment,
  });
};
