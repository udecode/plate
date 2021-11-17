import { mergeDeepToNodes } from '@udecode/plate-common';
import { isElement, PlateEditor, TDescendant } from '@udecode/plate-core';
import { Text } from 'slate';
import { jsx } from 'slate-hyperscript';
import { DeserializeHtmlChildren } from '../types';
import { pipeDeserializeHtmlLeaf } from './pipeDeserializeHtmlLeaf';

jsx;

export interface HtmlElementToLeafOptions {
  element: HTMLElement;
  children: DeserializeHtmlChildren[];
}

/**
 * Deserialize HTML to TDescendant[] with marks on Text.
 * Build the leaf from the leaf deserializers of each plugin.
 */
export const htmlElementToLeaf = <T = {}>(
  editor: PlateEditor<T>,
  { element, children }: HtmlElementToLeafOptions
) => {
  const node = pipeDeserializeHtmlLeaf(editor, element);

  return children.reduce((arr: TDescendant[], child) => {
    if (!child) return arr;

    if (isElement(child)) {
      if (Object.keys(node).length) {
        mergeDeepToNodes({
          node: child,
          source: node,
          query: {
            filter: ([n]) => Text.isText(n),
          },
        });
      }
      arr.push(child);
    } else {
      arr.push(jsx('text', node, child));
    }

    return arr;
  }, []);
};
