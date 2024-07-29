import type { PlateEditor } from '../../../types/PlateEditor';
import type { DeserializeHtmlChildren } from '../types';

import { deserializeHtmlNode } from './deserializeHtmlNode';

export const deserializeHtmlNodeChildren = (
  editor: PlateEditor,
  node: ChildNode | HTMLElement
) =>
  Array.from(node.childNodes).flatMap(
    deserializeHtmlNode(editor)
  ) as DeserializeHtmlChildren[];
