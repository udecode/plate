import { jsx } from 'slate-hyperscript';
import { PlateEditor } from '../../../types/PlateEditor';
import { TDescendant } from '../../../types/slate/TDescendant';
import { TElement } from '../../../types/slate/TElement';
import { deserializeHtmlNodeChildren } from './deserializeHtmlNodeChildren';
import { pipeDeserializeHtmlElement } from './pipeDeserializeHtmlElement';

/**
 * Deserialize HTML to Element.
 */
export const htmlElementToElement = <T = {}>(
  editor: PlateEditor<T>,
  element: HTMLElement
): TElement | undefined => {
  const deserialized = pipeDeserializeHtmlElement(editor, element);

  if (deserialized) {
    const { node, withoutChildren } = deserialized;

    let descendants =
      node.children ??
      (deserializeHtmlNodeChildren(editor, element) as TDescendant[]);
    if (!descendants.length || withoutChildren) {
      descendants = [{ text: '' }];
    }

    return jsx('element', node, descendants) as TElement;
  }
};
