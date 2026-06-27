import type { Descendant } from '@platejs/plite';

import { isVoid } from '@platejs/plite-dom/internal';
import { jsx } from '@platejs/plite-hyperscript';

import type { BaseEditor } from '../../../editor';

import { deserializeHtmlNodeChildren } from './deserializeHtmlNodeChildren';
import { pipeDeserializeHtmlElement } from './pipeDeserializeHtmlElement';

/** Deserialize HTML to Element. */
export const htmlElementToElement = (
  editor: BaseEditor,
  element: HTMLElement,
  isPlite = false
) => {
  const deserialized = pipeDeserializeHtmlElement(editor, element);

  if (deserialized) {
    const { node, withoutChildren } = deserialized;

    let descendants =
      node.children ??
      (deserializeHtmlNodeChildren(editor, element, isPlite) as Descendant[]);

    if (descendants.length === 0 || withoutChildren || isVoid(element)) {
      descendants = [{ text: '' }];
    }

    return jsx('element', node, descendants) as Descendant;
  }
};
