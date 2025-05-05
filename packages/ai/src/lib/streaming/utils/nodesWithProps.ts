import type { PlateEditor } from '@udecode/plate/react';

import { type Descendant, ElementApi } from '@udecode/plate';

import type { SteamInsertChunkOptions } from '../streamInsertChunk';

import { getIndentListNode } from './getIndentListNode';

export const nodesWithProps = (
  editor: PlateEditor,
  nodes: Descendant[],
  options: SteamInsertChunkOptions
): Descendant[] => {
  return nodes.map((node): Descendant => {
    if (ElementApi.isElement(node)) {
      return {
        ...getIndentListNode(editor, node),
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
