import { Value } from '../../../slate/types/TEditor';
import { PlateEditor } from '../../../types/PlateEditor';
import { DeserializeHtmlNodeReturnType } from '../types';
import { deserializeHtmlNode } from './deserializeHtmlNode';

/**
 * Deserialize HTML element to fragment.
 */
export const deserializeHtmlElement = <V extends Value, T = {}>(
  editor: PlateEditor<V, T>,
  element: HTMLElement
): DeserializeHtmlNodeReturnType => {
  return deserializeHtmlNode(editor)(element);
};
