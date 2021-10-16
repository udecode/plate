import { createHyperscript } from 'slate-hyperscript';
import { createText } from './hyperscript/creators';

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
const ELEMENT_LIC = 'lic';
const ELEMENT_EXCALIDRAW = 'excalidraw';

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

const voidChildren = [{ text: '' }];

export const jsx = createHyperscript({
  elements: {
    ha: { type: ELEMENT_LINK },
    hblockquote: { type: ELEMENT_BLOCKQUOTE },
    hcodeblock: { type: ELEMENT_CODE_BLOCK },
    hcodeline: { type: ELEMENT_CODE_LINE },
    hexcalidraw: { type: ELEMENT_EXCALIDRAW },
    hh1: { type: ELEMENT_H1 },
    hh2: { type: ELEMENT_H2 },
    hh3: { type: ELEMENT_H3 },
    hh4: { type: ELEMENT_H4 },
    hh5: { type: ELEMENT_H5 },
    hh6: { type: ELEMENT_H6 },
    himg: { type: ELEMENT_IMAGE, children: voidChildren },
    hli: { type: ELEMENT_LI },
    hmention: { type: ELEMENT_MENTION, children: voidChildren },
    hmediaembed: { type: ELEMENT_MEDIA_EMBED, children: voidChildren },
    hol: { type: ELEMENT_OL },
    hp: { type: ELEMENT_PARAGRAPH },
    htable: { type: ELEMENT_TABLE },
    htd: { type: ELEMENT_TD },
    hth: { type: ELEMENT_TH },
    htodoli: { type: ELEMENT_TODO_LI },
    htr: { type: ELEMENT_TR },
    hul: { type: ELEMENT_UL },
    hdefault: { type: ELEMENT_PARAGRAPH },
    hlic: { type: ELEMENT_LIC },
  },
  creators: {
    htext: createText,
  },
});
