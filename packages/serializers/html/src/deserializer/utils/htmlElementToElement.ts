import { PlateEditor, TDescendant, TElement } from '@udecode/plate-core';
import { jsx } from 'slate-hyperscript';
import { DeserializeHtmlChildren } from '../types';
import { pipeDeserializeHtmlElement } from './pipeDeserializeHtmlElement';

jsx;

/**
 * Deserialize HTML to Element.
 */
export const htmlElementToElement = <T = {}>(
  editor: PlateEditor<T>,
  {
    element,
    children,
  }: {
    element: HTMLElement;
    children: DeserializeHtmlChildren[];
  }
): TElement | undefined => {
  const deserialized = pipeDeserializeHtmlElement(editor, element);

  if (deserialized) {
    const { node, withoutChildren } = deserialized;

    let descendants = node.children ?? (children as TDescendant[]);
    if (!descendants.length || withoutChildren) {
      descendants = [{ text: '' }];
    }

    return jsx('element', node, descendants) as TElement;
  }
};
