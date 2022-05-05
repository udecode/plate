import { EDescendant } from '../../../slate/types/TDescendant';
import { Value } from '../../../slate/types/TEditor';
import { PlateEditor } from '../../../types/PlateEditor';
import { DeserializeHtmlChildren } from '../types';
import { deserializeHtmlNode } from './deserializeHtmlNode';

export const deserializeHtmlNodeChildren = <V extends Value, T = {}>(
  editor: PlateEditor<V, T>,
  node: HTMLElement | ChildNode
) =>
  Array.from(node.childNodes)
    .map(deserializeHtmlNode(editor))
    .flat() as DeserializeHtmlChildren<EDescendant<V>>[];
