import type { Descendant } from '@platejs/plite';

import { jsx } from '@platejs/plite-hyperscript';

import type { BasePlateEditor } from '../../../editor';

import { isPliteVoid } from '../../../utils/checkUtils';
import { deserializeHtmlNodeChildren } from './deserializeHtmlNodeChildren';
import { pipeDeserializeHtmlElement } from './pipeDeserializeHtmlElement';

/** Deserialize HTML to Element. */
export const htmlElementToElement = (
  editor: BasePlateEditor,
  element: HTMLElement,
  isPlite = false
) => {
  const deserialized = pipeDeserializeHtmlElement(editor, element);

  if (deserialized) {
    const { node, withoutChildren } = deserialized;

    let descendants =
      node.children ??
      (deserializeHtmlNodeChildren(editor, element, isPlite) as Descendant[]);

    if (descendants.length === 0 || withoutChildren || isPliteVoid(element)) {
      descendants = [{ text: '' }];
    }

    return jsx('element', node, descendants) as Descendant;
  }
};
