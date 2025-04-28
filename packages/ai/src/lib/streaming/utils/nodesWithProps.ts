import type { PlateEditor } from '@udecode/plate/react';

import { type Descendant, ElementApi, nanoid } from '@udecode/plate';

import type { SteamInsertChunkOptions } from '../streamInsertChunk';

import { AIChatPlugin } from '../../../react';

export const nodesWithProps = (
  editor: PlateEditor,
  nodes: Descendant[],
  options: SteamInsertChunkOptions
): Descendant[] => {
  if (!options.textProps && !options.elementProps) return nodes;

  return nodes.map((node): Descendant => {
    if (ElementApi.isElement(node)) {
      return {
        ...node,
        ...options.elementProps,
        children: nodesWithProps(editor, node.children, options),
      };
    } else {
      const id = nanoid();

      editor.setOption(AIChatPlugin, 'lastTextId', id);

      return {
        id,
        ...options.textProps,
        ...node,
        text: node.text,
      };
    }
  });
};
