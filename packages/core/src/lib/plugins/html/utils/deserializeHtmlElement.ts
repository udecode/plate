import type { BaseEditor } from '../../../editor';
import type { DeserializeHtmlNodeReturnType } from '../types';

import { deserializeHtmlNode } from './deserializeHtmlNode';

/** Deserialize HTML element to fragment. */
export const deserializeHtmlElement = (
  editor: BaseEditor,
  element: HTMLElement
): DeserializeHtmlNodeReturnType => deserializeHtmlNode(editor)(element);
