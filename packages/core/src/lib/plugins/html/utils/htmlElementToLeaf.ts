import { type Descendant, ElementApi, TextApi } from '@udecode/slate';
import { jsx } from 'slate-hyperscript';

import type { SlateEditor } from '../../../editor';

import { mergeDeepToNodes } from '../../../utils';
import { deserializeHtmlNodeChildren } from './deserializeHtmlNodeChildren';
import { pipeDeserializeHtmlLeaf } from './pipeDeserializeHtmlLeaf';

/**
 * Deserialize HTML to Descendant[] with marks on Text. Build the leaf from the
 * leaf deserializers of each plugin.
 */
export const htmlElementToLeaf = (
  editor: SlateEditor,
  element: HTMLElement
) => {
  const node = pipeDeserializeHtmlLeaf(editor, element);

  return deserializeHtmlNodeChildren(editor, element).reduce(
    (arr: Descendant[], child) => {
      if (!child) return arr;
      if (ElementApi.isElement(child)) {
        if (Object.keys(node).length > 0) {
          mergeDeepToNodes({
            node: child,
            query: {
              filter: ([n]) => TextApi.isText(n),
            },
            source: node,
          });
        }

        arr.push(child);
      } else {
        const attributes = { ...node };

        // attributes should not override child attributes
        if (TextApi.isText(child) && child.text) {
          Object.keys(attributes).forEach((key) => {
            if (attributes[key] && child[key]) {
              attributes[key] = child[key];
            }
          });
        }

        arr.push(jsx('text', attributes, child) as any);
      }

      return arr;
    },
    []
  ) as Descendant[];
};
