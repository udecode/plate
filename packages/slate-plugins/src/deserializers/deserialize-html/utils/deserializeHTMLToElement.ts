import { SlatePlugin } from '@udecode/slate-plugins-core';
import { Descendant, Element } from 'slate';
import { jsx } from 'slate-hyperscript';
import { DeserializeHTMLChildren } from '../types';

/**
 * Deserialize HTML to Element.
 */
export const deserializeHTMLToElement = ({
  plugins,
  el,
  children,
}: {
  plugins: SlatePlugin[];
  el: HTMLElement;
  children: DeserializeHTMLChildren[];
}): Element | undefined => {
  let element: any;

  plugins.some(({ deserialize: pluginDeserializers }) => {
    if (!pluginDeserializers?.element) return;

    return pluginDeserializers.element.some((deserializer) => {
      const deserialized = deserializer.deserialize(el);
      if (!deserialized) return;

      element = deserialized;
      return true;
    });
  });

  if (element) {
    let descendants = children as Descendant[];
    if (!descendants.length) {
      descendants = [{ text: '' }];
    }

    return jsx('element', element, descendants);
  }
};
