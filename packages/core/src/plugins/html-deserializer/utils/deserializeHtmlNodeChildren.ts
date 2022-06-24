import { Value } from '../../../slate/editor/TEditor';
import { EDescendant } from '../../../slate/node/TDescendant';
import { PlateEditor } from '../../../types/plate/PlateEditor';
import { DeserializeHtmlChildren } from '../types';
import { deserializeHtmlNode } from './deserializeHtmlNode';

export const deserializeHtmlNodeChildren = <V extends Value>(
  editor: PlateEditor<V>,
  node: HTMLElement | ChildNode
) =>
  Array.from(node.childNodes)
    .map(deserializeHtmlNode(editor))
    .flat() as DeserializeHtmlChildren<EDescendant<V>>[];
