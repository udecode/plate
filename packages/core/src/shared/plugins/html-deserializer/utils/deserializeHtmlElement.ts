import type { EDescendant, Value } from '@udecode/slate';

import type { PlateEditor } from '../../../types/PlateEditor';
import type { DeserializeHtmlNodeReturnType } from '../types';

import { deserializeHtmlNode } from './deserializeHtmlNode';

/** Deserialize HTML element to fragment. */
export const deserializeHtmlElement = <V extends Value>(
  editor: PlateEditor<V>,
  element: HTMLElement
): DeserializeHtmlNodeReturnType<EDescendant<V>> => {
  return deserializeHtmlNode(editor)(element);
};
