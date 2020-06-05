import { Descendant, Element, Text } from 'slate';
import { jsx } from 'slate-hyperscript';
import {
  DeserializeLeafValue,
  setPropsToNodes,
  SlatePlugin,
} from '../../../common';
import { DeserializeHTMLChildren } from '../types';

export interface DeserializeMarksProps {
  plugins: SlatePlugin[];
  el: HTMLElement;
  children: DeserializeHTMLChildren[];
}

/**
 * Deserialize HTML to Descendant[] with marks on Text.
 */
export const deserializeHTMLToMarks = ({
  plugins,
  el,
  children,
}: DeserializeMarksProps) => {
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

    return children.reduce((arr: Descendant[], child) => {
      if (!child) return arr;

      if (Element.isElement(child)) {
        setPropsToNodes(child, props, {
          filter: ([n]) => Text.isText(n),
        });
        arr.push(child);
      } else {
        arr.push(jsx('text', props, child));
      }

      return arr;
    }, []);
  }
};
