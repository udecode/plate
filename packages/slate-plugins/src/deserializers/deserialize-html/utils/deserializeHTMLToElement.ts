import { Descendant, Element } from 'slate';
import { jsx } from 'slate-hyperscript';
import { DeserializeElement, SlatePlugin } from '../../../common';
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
  const type = el.getAttribute('data-slate-type') || el.nodeName;

  const elementDeserializers = plugins.reduce(
    (obj: DeserializeElement, { deserialize: deserializePlugin }) => {
      if (deserializePlugin?.element) {
        obj = { ...obj, ...deserializePlugin.element };
      }
      return obj;
    },
    {}
  );

  if (elementDeserializers[type]) {
    const attrs = elementDeserializers[type](el);

    let descendants = children as Descendant[];
    if (!descendants.length) {
      descendants = [{ text: '' }];
    }

    return jsx('element', { ...attrs }, descendants);
  }
};
