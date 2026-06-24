import type { BasePlateEditor } from '../../../editor';
import type { DeserializeHtmlNodeReturnType } from '../types';

import { deserializeHtmlNode } from './deserializeHtmlNode';

/** Deserialize HTML element to fragment. */
export const deserializeHtmlElement = (
  editor: BasePlateEditor,
  element: HTMLElement
): DeserializeHtmlNodeReturnType => deserializeHtmlNode(editor)(element);
