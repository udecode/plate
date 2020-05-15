import { setPropsToTexts } from 'common/transforms';
import { DeserializeLeafValue, SlatePlugin } from 'common/types';
import { Node, Text } from 'slate';
import { jsx } from 'slate-hyperscript';

export interface DeserializeMarksProps {
  plugins: SlatePlugin[];
  el: HTMLElement;
  children: (Node | null)[];
}

export const deserializeMarks = ({
  plugins,
  el,
  children,
}: DeserializeMarksProps): Text[] | undefined => {
  const type = el.getAttribute('data-slate-type') || el.nodeName;

  const textTags: {
    [key: string]: DeserializeLeafValue[];
  } = {};

  plugins.forEach(({ deserialize: deserializePlugin }) => {
    const leaf = deserializePlugin?.leaf;
    if (!leaf) return;

    Object.keys(leaf).forEach((tag) => {
      if (!textTags[tag]) textTags[tag] = [leaf[tag]];
      else textTags[tag].push(leaf[tag]);
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
        setPropsToTexts(child, attrs);
        arr.push(child);
      } else {
        arr.push(jsx('text', attrs, child));
      }

      return arr;
    }, []);
  }
};
