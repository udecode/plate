import { PlateEditor } from '../../../types/PlateEditor';
import { DeserializeHtmlNodeReturnType } from '../types';
import { deserializeHtmlNode } from './deserializeHtmlNode';

/**
 * Deserialize HTML element to fragment.
 */
export const deserializeHtmlElement = <T = {}>(
  editor: PlateEditor<T>,
  options: { document: Document; element: HTMLElement }
): DeserializeHtmlNodeReturnType => {
  return deserializeHtmlNode(editor)(options);
};
