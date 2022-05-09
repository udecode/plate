import { EDescendant } from '../../../slate/node/TDescendant';
import { Value } from '../../../slate/editor/TEditor';
import { PlateEditor } from '../../../types/PlateEditor';
import { DeserializeHtmlNodeReturnType } from '../types';
import { deserializeHtmlNode } from './deserializeHtmlNode';

/**
 * Deserialize HTML element to fragment.
 */
export const deserializeHtmlElement = <V extends Value, T = {}>(
  editor: PlateEditor<V, T>,
  element: HTMLElement
): DeserializeHtmlNodeReturnType<EDescendant<V>> => {
  return deserializeHtmlNode(editor)(element);
};
