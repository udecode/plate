import { normalizeDescendantsToDocumentFragment } from '../../../common/utils/normalizeDescendantsToDocumentFragment';
import { EDescendant } from '../../../slate/types/TDescendant';
import { Value } from '../../../slate/types/TEditor';
import { PlateEditor } from '../../../types/PlateEditor';
import { htmlStringToDOMNode } from '../../html-serializer/utils/htmlStringToDOMNode';
import { deserializeHtmlElement } from './deserializeHtmlElement';

/**
 * Deserialize HTML element to a valid document fragment.
 */
export const deserializeHtml = <V extends Value, T = {}>(
  editor: PlateEditor<V, T>,
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
