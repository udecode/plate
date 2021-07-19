import {
  PlatePlugin,
  SPEditor,
  TDescendant,
  TElement,
} from '@udecode/plate-core';
import { jsx } from 'slate-hyperscript';
import { DeserializeHTMLChildren } from '../types';

jsx;

/**
 * Deserialize HTML to Element.
 */
export const deserializeHTMLToElement = <T extends SPEditor = SPEditor>(
  editor: T,
  {
    plugins,
    element,
    children,
  }: {
    plugins: PlatePlugin<T>[];
    element: HTMLElement;
    children: DeserializeHTMLChildren[];
  }
): TElement | undefined => {
  let slateElement: any;
  let withoutChildren: boolean | undefined;

  plugins.some(({ deserialize: pluginDeserializers }) => {
    const elementDeserializers = pluginDeserializers?.(editor).element;
    if (!elementDeserializers) return;

    return elementDeserializers.some((deserializer) => {
      const deserialized = deserializer.deserialize(element);
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
