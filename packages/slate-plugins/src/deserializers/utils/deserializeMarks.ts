import { DeserializeLeafValue } from 'deserializers/types';
import { Node } from 'slate';
import { jsx } from 'slate-hyperscript';
import { SlatePlugin } from 'types';

export const addAttrsToChildren = (node: Node, attrs: Record<string, any>) => {
  node.children?.forEach((child: Node) => {
    if (child.text) {
      Object.assign(child, attrs);
    } else {
      addAttrsToChildren(child, attrs);
    }
  });
};

export const deserializeMarks = ({
  plugins,
  el,
  children,
}: {
  plugins: SlatePlugin[];
  el: HTMLElement;
  children: (Node | null)[];
}): Text[] | undefined => {
  const type = el.getAttribute('data-slate-type') || el.nodeName;

  const textTags: {
    [key: string]: DeserializeLeafValue[];
  } = {};

  plugins.forEach(({ deserialize: deserializePlugin }) => {
    if (!deserializePlugin?.leaf) return;

    Object.keys(deserializePlugin.leaf).forEach((tag) => {
      if (!deserializePlugin?.leaf) return;

      if (!textTags[tag]) textTags[tag] = [deserializePlugin.leaf[tag]];
      else textTags[tag].push(deserializePlugin.leaf[tag]);
    });
  });

  if (textTags[type]) {
    const attrs = textTags[type].reduce((obj, tag) => {
      const newAttrs = tag(el);
      if (newAttrs) {
        Object.assign(obj, newAttrs);
      }
      return obj;
    }, {});

    return children.reduce((arr: any[], child) => {
      if (!child) return arr;

      if (child.children) {
        addAttrsToChildren(child, attrs);
        arr.push(child);
      } else {
        arr.push(jsx('text', attrs, child));
      }

      return arr;
    }, []);
  }
};
