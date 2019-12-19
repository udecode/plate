import { jsx } from 'slate-hyperscript';
import { ElementType } from 'slate-plugins/common';
import { ListType } from 'slate-plugins/elements';

const ELEMENT_TAGS: any = {
  P: () => ({ type: ElementType.PARAGRAPH }),
  A: (el: any) => ({ type: ElementType.LINK, url: el.getAttribute('href') }),
  BLOCKQUOTE: () => ({ type: ElementType.BLOCK_QUOTE }),
  H1: () => ({ type: ElementType.HEADING_1 }),
  H2: () => ({ type: ElementType.HEADING_2 }),
  H3: () => ({ type: ElementType.HEADING_3 }),
  H4: () => ({ type: ElementType.HEADING_4 }),
  H5: () => ({ type: ElementType.HEADING_5 }),
  H6: () => ({ type: ElementType.HEADING_6 }),
  IMG: (el: any) => ({ type: ElementType.IMAGE, url: el.getAttribute('src') }),
  UL: () => ({ type: ListType.UL_LIST }),
  OL: () => ({ type: ListType.OL_LIST }),
  LI: () => ({ type: ListType.LIST_ITEM }),
  PRE: () => ({ type: ElementType.CODE }),
};

// COMPAT: `B` is omitted here because Google Docs uses `<b>` in weird ways.
const TEXT_TAGS: any = {
  CODE: () => ({ code: true }),
  KBD: () => ({ code: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  DEL: () => ({ strikethrough: true }),
  S: () => ({ strikethrough: true }),
  STRONG: () => ({ bold: true }),
  U: () => ({ underline: true }),
};

export const deserialize = (el: any) => {
  if (el.nodeType === 3) {
    return el.textContent;
  }
  if (el.nodeType !== 1) {
    return null;
  }
  if (el.nodeName === 'BR') {
    return '\n';
  }
  const { nodeName } = el;
  let parent = el;
  if (
    nodeName === 'PRE' &&
    el.childNodes[0] &&
    el.childNodes[0].nodeName === 'CODE'
  ) {
    [parent] = el.childNodes;
  }
  const children: any[] = Array.from(parent.childNodes)
    .map(deserialize)
    .flat();
  if (el.nodeName === 'BODY') {
    return jsx('fragment', {}, children);
  }
  if (ELEMENT_TAGS[nodeName]) {
    const attrs = ELEMENT_TAGS[nodeName](el);
    return jsx('element', attrs, children);
  }
  if (TEXT_TAGS[nodeName]) {
    const attrs = TEXT_TAGS[nodeName](el);
    return children.map(child => jsx('text', attrs, child));
  }
  return children;
};
