/* eslint-disable prettier/prettier */
import type { HyperscriptShorthands } from 'slate-hyperscript/dist/hyperscript';

import {
  createHyperscript,
  createText as createTestText,
} from 'slate-hyperscript';

import { createText } from './hyperscript/creators';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: any;

      anchor: any;
      cursor: any;
      editor: any;
      element: any;
      focus: any;
      fragment: any;
      hli: any;
      hol: any;
      hp: any;
      htext: {
        [key: string]: any;
        // These optional params will show up in the autocomplete!
        bold?: boolean;
        children?: any;
        code?: boolean;
        italic?: boolean;
        underline?: boolean;
      };
      hul: any;
      selection: any;
    }
  }
}

const voidChildren = [{ text: '' }];

const ELEMENT_BLOCKQUOTE = 'blockquote';
const ELEMENT_CODE_BLOCK = 'code_block';
const ELEMENT_CODE_LINE = 'code_line';
const ELEMENT_EXCALIDRAW = 'excalidraw';
const ELEMENT_H1 = 'h1';
const ELEMENT_H2 = 'h2';
const ELEMENT_H3 = 'h3';
const ELEMENT_H4 = 'h4';
const ELEMENT_H5 = 'h5';
const ELEMENT_H6 = 'h6';
const ELEMENT_IMAGE = 'img';
const ELEMENT_LI = 'li';
const ELEMENT_LIC = 'lic';
const ELEMENT_LINK = 'a';
const ELEMENT_MEDIA_EMBED = 'media_embed';
const ELEMENT_MENTION = 'mention';
const ELEMENT_MENTION_INPUT = 'mention_input';
const ELEMENT_NLI = 'nli';
const ELEMENT_OL = 'ol';
const ELEMENT_PARAGRAPH = 'p';
const ELEMENT_TABLE = 'table';
const ELEMENT_TD = 'td';
const ELEMENT_TH = 'th';
const ELEMENT_TODO_LI = 'action_item';
const ELEMENT_TOGGLE = 'toggle';
const ELEMENT_TR = 'tr';
const ELEMENT_UL = 'ul';
const ELEMENT_COLUMN_GROUP = 'column_group';
const ELEMENT_COLUMN = 'column';
const ELEMENT_INLINE_DATE = 'inline_date'
const ELEMENT_CALLOUT = 'callout';
const ELEMENT_TOC = 'toc';
const ELEMENT_EQUATION = 'equation';
const ELEMENT_INLINE_EQUATION = 'inline_equation';

const elements: HyperscriptShorthands = {
  ha: { type: ELEMENT_LINK },
  hblockquote: { type: ELEMENT_BLOCKQUOTE },
  hcallout: { type: ELEMENT_CALLOUT },
  hcodeblock: { type: ELEMENT_CODE_BLOCK },
  hcodeline: { type: ELEMENT_CODE_LINE },
  hcolumn: { type: ELEMENT_COLUMN },
  hcolumngroup: { type: ELEMENT_COLUMN_GROUP },
  hdefault: { type: ELEMENT_PARAGRAPH },
  hequation: { type: ELEMENT_EQUATION },
  hexcalidraw: { type: ELEMENT_EXCALIDRAW },
  hh1: { type: ELEMENT_H1 },
  hh2: { type: ELEMENT_H2 },
  hh3: { type: ELEMENT_H3 },
  hh4: { type: ELEMENT_H4 },
  hh5: { type: ELEMENT_H5 },
  hh6: { type: ELEMENT_H6 },
  himg: { children: voidChildren, type: ELEMENT_IMAGE },
  hinlinedate: { children: voidChildren, type: ELEMENT_INLINE_DATE },
  hinlineequation: { type: ELEMENT_INLINE_EQUATION },
  hli: { type: ELEMENT_LI },
  hlic: { type: ELEMENT_LIC },
  hmediaembed: { children: voidChildren, type: ELEMENT_MEDIA_EMBED },
  hmention: { children: voidChildren, type: ELEMENT_MENTION },
  hmentioninput: { children: voidChildren, type: ELEMENT_MENTION_INPUT },
  hnli: { type: ELEMENT_NLI },
  hol: { type: ELEMENT_OL },
  hp: { type: ELEMENT_PARAGRAPH },
  htable: { type: ELEMENT_TABLE },
  htd: { type: ELEMENT_TD },
  hth: { type: ELEMENT_TH },
  htoc: { type: ELEMENT_TOC },
  htodoli: { type: ELEMENT_TODO_LI },
  htoggle: { type: ELEMENT_TOGGLE },
  htr: { type: ELEMENT_TR },
  hul: { type: ELEMENT_UL },
};

export const jsx = createHyperscript({
  creators: {
    htext: createTestText,
  },
  elements,
});

export const hjsx = createHyperscript({
  creators: {
    htext: createText,
  },
  elements,
});
