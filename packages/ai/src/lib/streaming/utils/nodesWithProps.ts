import { type Descendant, ElementApi } from '@udecode/plate';

import type { SteamInsertChunkOptions } from '../streamInsertChunk';

export const nodesWithProps = (
  nodes: Descendant[],
  options: SteamInsertChunkOptions
): Descendant[] => {
  if (!options.textProps && !options.elementProps) return nodes;

  return nodes.map((node): Descendant => {
    if (ElementApi.isElement(node)) {
      return {
        ...node,
        ...options.elementProps,
        children: nodesWithProps(node.children, options),
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
