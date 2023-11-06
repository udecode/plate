import { EDescendant, Value } from '@udecode/slate';

import { PlateEditor } from '../../../types/PlateEditor';
import { normalizeDescendantsToDocumentFragment } from '../../../utils/normalizeDescendantsToDocumentFragment';
import { deserializeHtmlElement } from './deserializeHtmlElement';
import { htmlStringToDOMNode } from './htmlStringToDOMNode';
import { collapseWhitespace } from './collapseWhitespace';

/**
 * Deserialize HTML element to a valid document fragment.
 */
export const deserializeHtml = <V extends Value>(
  editor: PlateEditor<V>,
  {
    element,
    collapseWhitespace: shouldCollapseWhitespace = true,
  }: {
    element: HTMLElement | string;
    collapseWhitespace?: boolean;
  }
): EDescendant<V>[] => {
  // for serializer
  if (typeof element === 'string') {
    element = htmlStringToDOMNode(element);
  }

  if (shouldCollapseWhitespace) {
    element = collapseWhitespace(element);
  }

  const fragment = deserializeHtmlElement(editor, element) as EDescendant<V>[];

  return normalizeDescendantsToDocumentFragment(editor, {
    descendants: fragment,
  });
};
