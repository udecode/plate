import { jsx } from 'slate-hyperscript';
import { EDescendant, TDescendant } from '../../../slate/node/TDescendant';
import { Value } from '../../../slate/editor/TEditor';
import { PlateEditor } from '../../../types/PlateEditor';
import { deserializeHtmlNodeChildren } from './deserializeHtmlNodeChildren';
import { pipeDeserializeHtmlElement } from './pipeDeserializeHtmlElement';

/**
 * Deserialize HTML to Element.
 */
export const htmlElementToElement = <V extends Value, T = {}>(
  editor: PlateEditor<V, T>,
  element: HTMLElement
) => {
  const deserialized = pipeDeserializeHtmlElement(editor, element);

  if (deserialized) {
    const { node, withoutChildren } = deserialized;

    let descendants =
      node.children ??
      (deserializeHtmlNodeChildren(editor, element) as TDescendant[]);
    if (!descendants.length || withoutChildren) {
      descendants = [{ text: '' }];
    }

    return jsx('element', node, descendants) as EDescendant<V>;
  }
};
