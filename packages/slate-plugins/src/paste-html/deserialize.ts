import { jsx } from 'slate-hyperscript';
import { SlatePlugin } from 'types';
import { DeserializeElement, DeserializeLeafValue } from './types';

const addAttrsToChildren = (child: any, attrs: any) => {
  if (child.children) {
    child.children = child.children.map((item: any) => {
      const itemWithAttrs = addAttrsToChildren(item, attrs);
      return { ...itemWithAttrs, ...attrs };
    });
  }
  return child;
};

export const deserialize = (plugins: SlatePlugin[]) => (el: any) => {
  // text
  if (el.nodeType === 3) return el.textContent;

  // not a tag
  if (el.nodeType !== 1) return null;

  // new line
  if (el.nodeName === 'BR') return '\n';

  const { nodeName } = el;
  let parent = el;

  // blockquote
  if (
    nodeName === 'PRE' &&
    el.childNodes[0] &&
    el.childNodes[0].nodeName === 'CODE'
  ) {
    [parent] = el.childNodes;
  }

  const children: any[] = Array.from(parent.childNodes)
    .map(deserialize(plugins))
    .flat();

  // body
  if (el.nodeName === 'BODY') {
    return jsx('fragment', {}, children);
  }

  let elementTags: DeserializeElement = {};
  const textTags: {
    [key: string]: DeserializeLeafValue[];
  } = {};

  plugins.forEach(({ deserialize: deserializePlugin }) => {
    if (deserializePlugin?.element)
      elementTags = { ...elementTags, ...deserializePlugin.element };

    if (!deserializePlugin?.leaf) return;

    Object.keys(deserializePlugin.leaf).forEach(tag => {
      if (!deserializePlugin?.leaf) return;

      if (!textTags[tag]) textTags[tag] = [deserializePlugin.leaf[tag]];
      else textTags[tag].push(deserializePlugin.leaf[tag]);
    });
  });

  // element
  if (elementTags[nodeName]) {
    const attrs = elementTags[nodeName](el);

    return jsx('element', attrs, children);
  }

  // mark
  if (textTags[nodeName]) {
    let attrs = {};

    textTags[nodeName].forEach(tag => {
      const newAttrs = tag(el);
      if (newAttrs) {
        attrs = { ...attrs, ...newAttrs };
      }
    });

    return children.map(child => {
      if (child.children) {
        return addAttrsToChildren(child, attrs);
      }

      return jsx('text', attrs, child);
    });
  }

  return children;
};
