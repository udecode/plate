/* eslint-disable prettier/prettier */

import {
  type HyperscriptShorthands,
  createHyperscript as createHyperscriptBase,
  createText as createTestText,
} from 'slate-hyperscript';

import { createText } from './internals/creators';
import { createHyperscript } from './internals/hyperscript';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      htext: {
        [key: string]: any;
        // These optional params will show up in the autocomplete!
        bold?: boolean;
        children?: any;
        code?: boolean;
        italic?: boolean;
        underline?: boolean;
      };

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
      hul: any;
      selection: any;
    }
  }
}

const voidChildren = [{ text: '' }];

const elements: HyperscriptShorthands = {
  ha: { type: 'a' },
  haudio: { children: voidChildren, type: 'audio' },
  hblockquote: { type: 'blockquote' },
  hcallout: { type: 'callout' },
  hcodeblock: { type: 'code_block' },
  hcodeline: { type: 'code_line' },
  hcolumn: { type: 'column' },
  hcolumngroup: { type: 'column_group' },
  hdate: { children: voidChildren, type: 'date' },
  hdefault: { type: 'p' },
  hequation: { type: 'equation' },
  hexcalidraw: { type: 'excalidraw' },
  hfile: { children: voidChildren, type: 'file' },
  hh1: { type: 'h1' },
  hh2: { type: 'h2' },
  hh3: { type: 'h3' },
  hh4: { type: 'h4' },
  hh5: { type: 'h5' },
  hh6: { type: 'h6' },
  himg: { children: voidChildren, type: 'img' },
  hinlineequation: { type: 'inline_equation' },
  hli: { type: 'li' },
  hlic: { type: 'lic' },
  hmediaembed: { children: voidChildren, type: 'media_embed' },
  hmention: { children: voidChildren, type: 'mention' },
  hmentioninput: { children: voidChildren, type: 'mention_input' },
  hnli: { type: 'nli' },
  hol: { type: 'ol' },
  hp: { type: 'p' },
  hplaceholder: { children: voidChildren ,type: 'placeholder'},
  htable: { type: 'table' },
  htd: { type: 'td' },
  hth: { type: 'th' },
  htoc: { type: 'toc' },
  htodoli: { type: 'action_item' },
  htoggle: { type: 'toggle' },
  htr: { type: 'tr' },
  hul: { type: 'ul' },
  hvideo: { children: voidChildren, type: 'video' },
};


export const jsx = createHyperscript({
  creators: {
    htext: createTestText,
  },
  elements,
});

export const jsxt = createHyperscriptBase({
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