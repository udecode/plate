import { mergeDeepToNodes } from '@udecode/plate-common';
import {
  AnyObject,
  isElement,
  PlateEditor,
  TDescendant,
} from '@udecode/plate-core';
import { Text } from 'slate';
import { jsx } from 'slate-hyperscript';
import { DeserializeHtmlChildren } from '../types';

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
  let leaf: AnyObject = {};

  editor.plugins.forEach((plugin) => {
    const deserializers = plugin.deserialize?.(editor, plugin).leaf;
    if (!deserializers) return;

    deserializers.forEach((deserializer) => {
      const deserialized = deserializer.deserialize(element);
      if (!deserialized) return;

      leaf = { ...leaf, ...deserialized };
    });
  });

  return children.reduce((arr: TDescendant[], child) => {
    if (!child) return arr;

    if (isElement(child)) {
      if (Object.keys(leaf).length) {
        mergeDeepToNodes({
          node: child,
          source: leaf,
          query: {
            filter: ([n]) => Text.isText(n),
          },
        });
      }
      arr.push(child);
    } else {
      arr.push(jsx('text', leaf, child));
    }

    return arr;
  }, []);
};
