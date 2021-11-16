import {
  AnyObject,
  PlateEditor,
  TDescendant,
  TElement,
} from '@udecode/plate-core';
import { jsx } from 'slate-hyperscript';
import { DeserializeHtmlChildren } from '../types';

jsx;

/**
 * Deserialize HTML to Element.
 */
export const htmlElementToElement = <T = {}>(
  editor: PlateEditor<T>,
  {
    element: htmlElement,
    children,
  }: {
    element: HTMLElement;
    children: DeserializeHtmlChildren[];
  }
): TElement | undefined => {
  let slateElement: AnyObject | null = null;
  let withoutChildren: boolean | undefined;

  editor.plugins.some((plugin) => {
    const deserializers = plugin.deserialize?.(editor, plugin).element;
    if (!deserializers) return;

    return deserializers.some((deserializer) => {
      const deserialized = deserializer.deserialize(htmlElement);
      if (!deserialized) return;

      slateElement = deserialized;
      withoutChildren = deserializer.withoutChildren;
      return true;
    });
  });

  if (slateElement) {
    let descendants = children as TDescendant[];
    if (!descendants.length || withoutChildren) {
      descendants = [{ text: '' }];
    }

    return jsx('element', slateElement, descendants) as TElement;
  }
};
