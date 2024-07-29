import type { PlateEditor } from '../../../types/PlateEditor';
import type { DeserializeHtmlNodeReturnType } from '../types';

import { deserializeHtmlNode } from './deserializeHtmlNode';

/** Deserialize HTML element to fragment. */
export const deserializeHtmlElement = (
  editor: PlateEditor,
  element: HTMLElement
): DeserializeHtmlNodeReturnType => {
  return deserializeHtmlNode(editor)(element);
};
