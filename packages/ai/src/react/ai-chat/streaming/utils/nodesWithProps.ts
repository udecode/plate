import type { PlateEditor } from '@platejs/core/react';

import { type Descendant, type Element, ElementApi } from '@platejs/plite';

import type { SteamInsertChunkOptions } from '../streamInsertChunk';

import { getListNode } from './getListNode';

export function nodesWithProps(
  editor: PlateEditor,
  nodes: Element[],
  options: SteamInsertChunkOptions
): Element[];
export function nodesWithProps(
  editor: PlateEditor,
  nodes: Descendant[],
  options: SteamInsertChunkOptions
): Descendant[];
export function nodesWithProps(
  editor: PlateEditor,
  nodes: Descendant[],
  options: SteamInsertChunkOptions
): Descendant[] {
  return nodes.map((node): Descendant => {
    if (ElementApi.isElement(node)) {
      return {
        ...getListNode(editor, node),
        ...options.elementProps,
        children: nodesWithProps(editor, node.children, options),
      };
    }
    return {
      ...options.textProps,
      ...node,
      text: node.text,
    };
  });
}
