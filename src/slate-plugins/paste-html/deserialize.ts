import { jsx } from 'slate-hyperscript';

export const deserialize = (plugins: any[]) => (el: any) => {
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

  let elementTags = {};
  let textTags = {};
  plugins.forEach(({ deserialize: deserializePlugin }) => {
    if (deserializePlugin?.element)
      elementTags = { ...elementTags, ...deserializePlugin.element };

    if (deserializePlugin?.leaf)
      textTags = { ...textTags, ...deserializePlugin.leaf };
  });

  // element
  if (elementTags[nodeName]) {
    const attrs = elementTags[nodeName](el);

    return jsx('element', attrs, children);
  }

  // mark
  if (textTags[nodeName]) {
    const attrs = textTags[nodeName](el);
    return children.map(child => jsx('text', attrs, child));
  }

  return children;
};
