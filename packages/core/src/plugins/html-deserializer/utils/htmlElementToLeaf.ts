import { Text } from 'slate';
import { jsx } from 'slate-hyperscript';
import { PlateEditor } from '../../../types/PlateEditor';
import { TDescendant } from '../../../types/slate/TDescendant';
import { isElement } from '../../../types/slate/TElement';
import { mergeDeepToNodes } from '../../../utils/mergeDeepToNodes';
import { deserializeHtmlNodeChildren } from './deserializeHtmlNodeChildren';
import { pipeDeserializeHtmlLeaf } from './pipeDeserializeHtmlLeaf';

/**
 * Deserialize HTML to TDescendant[] with marks on Text.
 * Build the leaf from the leaf deserializers of each plugin.
 */
export const htmlElementToLeaf = <T = {}>(
  editor: PlateEditor<T>,
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
              filter: ([n]) => Text.isText(n),
            },
          });
        }
        arr.push(child);
      } else {
        arr.push(jsx('text', node, child));
      }

      return arr;
    },
    []
  );
};
