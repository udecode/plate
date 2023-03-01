import { Value } from '../../../../../slate-utils/src/slate/editor/TEditor';
import { EDescendant } from '../../../../../slate-utils/src/slate/node/TDescendant';
import { PlateEditor } from '../../../types/plate/PlateEditor';
import { DeserializeHtmlNodeReturnType } from '../types';
import { deserializeHtmlNode } from './deserializeHtmlNode';

/**
 * Deserialize HTML element to fragment.
 */
export const deserializeHtmlElement = <V extends Value>(
  editor: PlateEditor<V>,
  element: HTMLElement
): DeserializeHtmlNodeReturnType<EDescendant<V>> => {
  return deserializeHtmlNode(editor)(element);
};
