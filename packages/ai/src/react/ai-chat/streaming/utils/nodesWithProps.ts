import type { PlateEditor } from 'platejs/react';

import { type Descendant, ElementApi } from 'platejs';

import type { SteamInsertChunkOptions } from '../streamInsertChunk';

import { getListNode } from './getListNode';

export const nodesWithProps = (
  editor: PlateEditor,
  nodes: Descendant[],
  options: SteamInsertChunkOptions
): Descendant[] => {
  return nodes.map((node): Descendant => {
    if (ElementApi.isElement(node)) {
      return {
        ...getListNode(editor, node),
        ...options.elementProps,
        children: nodesWithProps(editor, node.children, options),
      };
    } else {
      return {
        ...options.textProps,
        ...node,
        text: node.text,
      };
    }
  });
};
