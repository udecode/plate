import { jsx } from 'slate-hyperscript';
import { Value } from '../../../slate/editor/TEditor';
import { isElement } from '../../../slate/element/isElement';
import { EDescendant, TDescendant } from '../../../slate/node/TDescendant';
import { isText } from '../../../slate/text/isText';
import { PlateEditor } from '../../../types/plate/PlateEditor';
import { mergeDeepToNodes } from '../../../utils/slate/mergeDeepToNodes';
import { deserializeHtmlNodeChildren } from './deserializeHtmlNodeChildren';
import { pipeDeserializeHtmlLeaf } from './pipeDeserializeHtmlLeaf';

/**
 * Deserialize HTML to TDescendant[] with marks on Text.
 * Build the leaf from the leaf deserializers of each plugin.
 */
export const htmlElementToLeaf = <V extends Value>(
  editor: PlateEditor<V>,
  element: HTMLElement
) => {
  const node = pipeDeserializeHtmlLeaf(editor, element);

  return deserializeHtmlNodeChildren(editor, element).reduce(
    (arr: TDescendant[], child) => {
      if (!child) return arr;

      if (isElement(child)) {
        if (Object.keys(node).length) {
          mergeDeepToNodes({
            node: child,
            source: node,
            query: {
              filter: ([n]) => isText(n),
            },
          });
        }
        arr.push(child);
      } else {
        const attributes = { ...node };

        // attributes should not override child attributes
        if (isText(child) && child.text) {
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
  ) as EDescendant<V>[];
};
