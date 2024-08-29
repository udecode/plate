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

const elements: HyperscriptShorthands = {
  ha: { type: 'a' },
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
  htable: { type: 'table' },
  htd: { type: 'td' },
  hth: { type: 'th' },
  htoc: { type: 'toc' },
  htodoli: { type: 'action_item' },
  htoggle: { type: 'toggle' },
  htr: { type: 'tr' },
  hul: { type: 'ul' },
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