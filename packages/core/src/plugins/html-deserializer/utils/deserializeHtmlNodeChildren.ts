import { EDescendant, Value } from '@udecode/slate';

import { PlateEditor } from '../../../types/PlateEditor';
import { DeserializeHtmlChildren } from '../types';
import { deserializeHtmlNode } from './deserializeHtmlNode';

export const deserializeHtmlNodeChildren = <V extends Value>(
  editor: PlateEditor<V>,
  node: HTMLElement | ChildNode,
  stripWhitespace: boolean
) =>
  Array.from(node.childNodes).flatMap(
    deserializeHtmlNode(editor, stripWhitespace)
  ) as DeserializeHtmlChildren<EDescendant<V>>[];
