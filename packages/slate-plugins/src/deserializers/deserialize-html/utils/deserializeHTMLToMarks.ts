import { SlatePlugin } from '@udecode/slate-plugins-core';
import { Descendant, Element, Text } from 'slate';
import { jsx } from 'slate-hyperscript';
import { mergeDeepToNodes } from '../../../common';
import { DeserializeHTMLChildren } from '../types';

export interface DeserializeMarksProps {
  plugins: SlatePlugin[];
  el: HTMLElement;
  children: DeserializeHTMLChildren[];
}

/**
 * Deserialize HTML to Descendant[] with marks on Text.
 * Build the leaf from the leaf deserializers of each plugin.
 */
export const deserializeHTMLToMarks = ({
  plugins,
  el,
  children,
}: DeserializeMarksProps) => {
  let leaf = {};

  plugins.forEach(({ deserialize: pluginDeserializers }) => {
    if (!pluginDeserializers?.leaf) return;

    pluginDeserializers.leaf.forEach((deserializer) => {
      const leafPart = deserializer.deserialize(el);

      if (!leafPart) return;

      leaf = { ...leaf, ...leafPart };
    });
  });

  return children.reduce((arr: Descendant[], child) => {
    if (!child) return arr;

    if (Element.isElement(child)) {
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
