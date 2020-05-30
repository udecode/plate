import { Node, Text } from 'slate';
import { jsx } from 'slate-hyperscript';
import {
  DeserializeLeafValue,
  setPropsToNodes,
  SlatePlugin,
} from '../../../common';

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
    const props = textTags[type].reduce((obj, tag) => {
      const newProps = tag(el);
      if (newProps) {
        Object.assign(obj, newProps);
      }
      return obj;
    }, {});

    return children.reduce((arr: any[], child) => {
      if (!child) return arr;

      if (child.children) {
        setPropsToNodes(child, props, {
          filter: Text.isText,
        });
        arr.push(child);
      } else {
        arr.push(jsx('text', props, child));
      }

      return arr;
    }, []);
  }
};
