import { EDescendant, Value } from '@udecode/slate';

import { PlateEditor } from '../../../types/PlateEditor';
import { DeserializeHtmlNodeReturnType } from '../types';
import { deserializeHtmlNode } from './deserializeHtmlNode';

/**
 * Deserialize HTML element to fragment.
 */
export const deserializeHtmlElement = <V extends Value>(
  editor: PlateEditor<V>,
  element: HTMLElement,
  stripWhitespace = true
): DeserializeHtmlNodeReturnType<EDescendant<V>> => {
  return deserializeHtmlNode(editor, stripWhitespace)(element);
};
