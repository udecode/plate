/* eslint-disable prettier/prettier */
// @ts-ignore
import {
  createHyperscript,
  createText as createTestText,
} from 'slate-hyperscript';
import { HyperscriptShorthands } from 'slate-hyperscript/dist/hyperscript';

import { createText } from './hyperscript/creators';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: any;

      anchor: any;
      cursor: any;
      editor: any;
      element: any;
      focus: any;
      fragment: any;
      selection: any;
      htext: {
        [key: string]: any;
        // These optional params will show up in the autocomplete!
        bold?: boolean;
        underline?: boolean;
        italic?: boolean;
        code?: boolean;
        children?: any;
      };
      hp: any;
      hul: any;
      hol: any;
      hli: any;
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

const elements: HyperscriptShorthands = {
  ha: { type: ELEMENT_LINK },
  hblockquote: { type: ELEMENT_BLOCKQUOTE },
  hcodeblock: { type: ELEMENT_CODE_BLOCK },
  hcodeline: { type: ELEMENT_CODE_LINE },
  hdefault: { type: ELEMENT_PARAGRAPH },
  hexcalidraw: { type: ELEMENT_EXCALIDRAW },
  hh1: { type: ELEMENT_H1 },
  hh2: { type: ELEMENT_H2 },
  hh3: { type: ELEMENT_H3 },
  hh4: { type: ELEMENT_H4 },
  hh5: { type: ELEMENT_H5 },
  hh6: { type: ELEMENT_H6 },
  himg: { type: ELEMENT_IMAGE, children: voidChildren },
  hli: { type: ELEMENT_LI },
  hlic: { type: ELEMENT_LIC },
  hmediaembed: { type: ELEMENT_MEDIA_EMBED, children: voidChildren },
  hmention: { type: ELEMENT_MENTION, children: voidChildren },
  hmentioninput: { type: ELEMENT_MENTION_INPUT, children: voidChildren },
  hnli: { type: ELEMENT_NLI },
  hol: { type: ELEMENT_OL },
  hp: { type: ELEMENT_PARAGRAPH },
  htable: { type: ELEMENT_TABLE },
  htd: { type: ELEMENT_TD },
  hth: { type: ELEMENT_TH },
  htodoli: { type: ELEMENT_TODO_LI },
  htoggle: { type: ELEMENT_TOGGLE },
  htr: { type: ELEMENT_TR },
  hul: { type: ELEMENT_UL },
  hcolumngroup: { type: ELEMENT_COLUMN_GROUP },
  hcolumn: { type: ELEMENT_COLUMN },
};

export const jsx = createHyperscript({
  elements,
  creators: {
    htext: createTestText,
  },
});

export const hjsx = createHyperscript({
  elements,
  creators: {
    htext: createText,
  },
});
