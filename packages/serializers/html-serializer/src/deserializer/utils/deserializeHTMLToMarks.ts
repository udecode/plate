import { mergeDeepToNodes } from '@udecode/slate-plugins-common';
import {
  isElement,
  SlatePlugin,
  SPEditor,
  TDescendant,
} from '@udecode/slate-plugins-core';
import { Text } from 'slate';
import { jsx } from 'slate-hyperscript';
import { DeserializeHTMLChildren } from '../types';

jsx;

export interface DeserializeMarksProps {
  plugins: SlatePlugin[];
  element: HTMLElement;
  children: DeserializeHTMLChildren[];
}

/**
 * Deserialize HTML to TDescendant[] with marks on Text.
 * Build the leaf from the leaf deserializers of each plugin.
 */
export const deserializeHTMLToMarks = (
  editor: SPEditor,
  { plugins, element, children }: DeserializeMarksProps
) => {
  let leaf = {};

  plugins.forEach(({ deserialize: pluginDeserializers }) => {
    const leafDeserializers = pluginDeserializers?.(editor).leaf;
    if (!leafDeserializers) return;

    leafDeserializers.forEach((deserializer) => {
      const leafPart = deserializer.deserialize(element);

      if (!leafPart) return;

      leaf = { ...leaf, ...leafPart };
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
