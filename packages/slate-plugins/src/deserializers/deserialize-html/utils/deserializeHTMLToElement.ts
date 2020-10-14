import { SlatePlugin } from '@udecode/slate-plugins-core';
import { Descendant, Element } from 'slate';
import { jsx } from 'slate-hyperscript';
import { DeserializeHTMLChildren } from '../types';

/**
 * Deserialize HTML to Element.
 */
export const deserializeHTMLToElement = ({
  plugins,
  element,
  children,
}: {
  plugins: SlatePlugin[];
  element: HTMLElement;
  children: DeserializeHTMLChildren[];
}): Element | undefined => {
  let slateElement: any;

  plugins.some(({ deserialize: pluginDeserializers }) => {
    if (!pluginDeserializers?.element) return;

    return pluginDeserializers.element.some((deserializer) => {
      const deserialized = deserializer.deserialize(element);
      if (!deserialized) return;

      slateElement = deserialized;
      return true;
    });
  });

  if (slateElement) {
    let descendants = children as Descendant[];
    if (!descendants.length) {
      descendants = [{ text: '' }];
    }

    return jsx('element', slateElement, descendants);
  }
};
