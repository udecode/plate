import { PlateEditor } from '../../../types/PlateEditor';
import { DeserializeHtmlChildren } from '../types';
import { deserializeHtmlNode } from './deserializeHtmlNode';

export const deserializeHtmlNodeChildren = <T = {}>(
  editor: PlateEditor<T>,
  node: HTMLElement | ChildNode
): DeserializeHtmlChildren[] => {
  return Array.from(node.childNodes).map(deserializeHtmlNode(editor)).flat();
};
