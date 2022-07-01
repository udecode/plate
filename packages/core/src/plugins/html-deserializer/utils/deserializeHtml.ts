import { Value } from '../../../slate/editor/TEditor';
import { EDescendant } from '../../../slate/node/TDescendant';
import { PlateEditor } from '../../../types/plate/PlateEditor';
import { normalizeDescendantsToDocumentFragment } from '../../../utils/plate/normalizeDescendantsToDocumentFragment';
import { deserializeHtmlElement } from './deserializeHtmlElement';
import { htmlStringToDOMNode } from './htmlStringToDOMNode';

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
  // for serializer
  if (typeof element === 'string') {
    element = htmlStringToDOMNode(element, stripWhitespace);
  }

  const fragment = deserializeHtmlElement(editor, element) as EDescendant<V>[];

  return normalizeDescendantsToDocumentFragment(editor, {
    descendants: fragment,
  });
};
