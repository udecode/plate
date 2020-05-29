import { Element, Node } from 'slate';
import { jsx } from 'slate-hyperscript';
import { DeserializeElement, SlatePlugin } from '../../../common';

export const deserializeElement = ({
  plugins,
  el,
  children,
}: {
  plugins: SlatePlugin[];
  el: HTMLElement;
  children: (Node | null)[];
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

    return jsx('element', attrs, children);
  }
};
