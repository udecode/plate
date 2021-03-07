import { createHyperscript } from 'slate-hyperscript';
import { createText } from './hyperscript/creators';

// const ELEMENT_ALIGN_LEFT = 'align_left';
// const ELEMENT_ALIGN_RIGHT = 'align_right';
const ELEMENT_ALIGN_CENTER = 'align_center';
const ELEMENT_ALIGN_JUSTIFY = 'align_justify';
const ELEMENT_H1 = 'h1';
const ELEMENT_H2 = 'h2';
const ELEMENT_H3 = 'h3';
const ELEMENT_H4 = 'h4';
const ELEMENT_H5 = 'h5';
const ELEMENT_H6 = 'h6';
const ELEMENT_IMAGE = 'img';
const ELEMENT_LI = 'li';
const ELEMENT_LINK = 'a';
const ELEMENT_MEDIA_EMBED = 'media_embed';
const ELEMENT_MENTION = 'mention';
const ELEMENT_OL = 'ol';
const ELEMENT_PARAGRAPH = 'p';
const ELEMENT_TABLE = 'table';
const ELEMENT_TD = 'td';
const ELEMENT_TH = 'th';
const ELEMENT_TODO_LI = 'action_item';
const ELEMENT_TR = 'tr';
const ELEMENT_UL = 'ul';
const ELEMENT_BLOCKQUOTE = 'blockquote';
const ELEMENT_CODE_BLOCK = 'code_block';
const ELEMENT_CODE_LINE = 'code_line';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: any;
      editor: any;
      mention: any;
      TodoList: any;
      inline: any;
      htext: any;
    }
  }
}

export const jsx = createHyperscript({
  elements: {
    hp: { type: ELEMENT_PARAGRAPH },
    hmention: { type: ELEMENT_MENTION },
    hblockquote: { type: ELEMENT_BLOCKQUOTE },
    hcode: { type: ELEMENT_CODE_BLOCK },
    hcodeline: { type: ELEMENT_CODE_LINE },
    ha: { type: ELEMENT_LINK },
    himg: { type: ELEMENT_IMAGE },
    hembed: { type: ELEMENT_MEDIA_EMBED },
    hTodoList: { type: ELEMENT_TODO_LI },
    htable: { type: ELEMENT_TABLE },
    htr: { type: ELEMENT_TR },
    hth: { type: ELEMENT_TH },
    htd: { type: ELEMENT_TD },
    hul: { type: ELEMENT_UL },
    hol: { type: ELEMENT_OL },
    hli: { type: ELEMENT_LI },
    hh1: { type: ELEMENT_H1 },
    hh2: { type: ELEMENT_H2 },
    hh3: { type: ELEMENT_H3 },
    hh4: { type: ELEMENT_H4 },
    hh5: { type: ELEMENT_H5 },
    hh6: { type: ELEMENT_H6 },
    hcenter: { type: ELEMENT_ALIGN_CENTER },
    hjustify: { type: ELEMENT_ALIGN_JUSTIFY },
    inline: { inline: true },
    block: {},
  },
  creators: {
    htext: createText,
  },
});
