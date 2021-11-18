import { normalizeDescendantsToDocumentFragment } from '../../../common/utils/normalizeDescendantsToDocumentFragment';
import { PlateEditor } from '../../../types/PlateEditor';
import { TDescendant } from '../../../types/slate/TDescendant';
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
