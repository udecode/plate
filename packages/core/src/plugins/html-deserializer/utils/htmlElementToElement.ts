import { jsx } from 'slate-hyperscript';
import { Value } from '../../../../../slate-utils/src/slate/editor/TEditor';
import { EDescendant, TDescendant } from '../../../../../slate-utils/src/slate/node/TDescendant';
import { PlateEditor } from '../../../types/plate/PlateEditor';
import { deserializeHtmlNodeChildren } from './deserializeHtmlNodeChildren';
import { pipeDeserializeHtmlElement } from './pipeDeserializeHtmlElement';

/**
 * Deserialize HTML to Element.
 */
export const htmlElementToElement = <V extends Value>(
  editor: PlateEditor<V>,
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
