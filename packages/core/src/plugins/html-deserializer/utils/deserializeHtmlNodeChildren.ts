import { EDescendant, Value } from '@udecode/slate';
import { PlateEditor } from '../../../types/PlateEditor';
import { DeserializeHtmlChildren } from '../types';
import { deserializeHtmlNode } from './deserializeHtmlNode';

export const deserializeHtmlNodeChildren = <V extends Value>(
  editor: PlateEditor<V>,
  node: HTMLElement | ChildNode
) =>
  Array.from(node.childNodes).flatMap(
    deserializeHtmlNode(editor)
  ) as DeserializeHtmlChildren<EDescendant<V>>[];
