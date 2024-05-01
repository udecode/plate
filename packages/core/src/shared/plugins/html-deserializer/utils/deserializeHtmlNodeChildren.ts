import type { EDescendant, Value } from '@udecode/slate';

import type { PlateEditor } from '../../../types/PlateEditor';
import type { DeserializeHtmlChildren } from '../types';

import { deserializeHtmlNode } from './deserializeHtmlNode';

export const deserializeHtmlNodeChildren = <V extends Value>(
  editor: PlateEditor<V>,
  node: ChildNode | HTMLElement
) =>
  Array.from(node.childNodes).flatMap(
    deserializeHtmlNode(editor)
  ) as DeserializeHtmlChildren<EDescendant<V>>[];
