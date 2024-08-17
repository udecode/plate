import type { SlateEditor } from '../../../editor';
import type { DeserializeHtmlChildren } from '../types';

import { deserializeHtmlNode } from './deserializeHtmlNode';

export const deserializeHtmlNodeChildren = (
  editor: SlateEditor,
  node: ChildNode | HTMLElement
) =>
  Array.from(node.childNodes).flatMap(
    deserializeHtmlNode(editor)
  ) as DeserializeHtmlChildren[];
