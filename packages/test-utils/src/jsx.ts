import {
  createHyperscript as createHyperscriptBase,
  createText as createTestText,
  type HyperscriptShorthands,
} from 'slate-hyperscript';

import { createText } from './internals/creators';
// biome-ignore lint/style/noExportedImports: createHyperscript is used locally and also re-exported
import { createHyperscript } from './internals/hyperscript';

export { createEditor } from './internals/creators';
export { createHyperscript };

declare global {
  // biome-ignore lint/style/noNamespace: Required for TypeScript JSX typing
  namespace JSX {
    // biome-ignore lint/style/useConsistentTypeDefinitions: JSX.IntrinsicElements must be an interface per TypeScript specification
    interface IntrinsicElements {
      anchor: any;
      cursor: any;
      editor: any;
      element: any;
      focus: any;
      fragment: any;
      ha: any;
      haudio: any;
      hblockquote: any;
      hcallout: any;
      hcodeblock: any;
      hcodeline: any;
      hcolumn: any;
      hcolumngroup: any;
      hdate: any;
      hdefault: any;
      hequation: any;
      hexcalidraw: any;
      hfile: any;
      hh1: any;
      hh2: any;
      hh3: any;
      hh4: any;
      hh5: any;
      hh6: any;
      himg: any;
      hinlineequation: any;
      hli: any;
      hlic: any;
      hmediaembed: any;
      hmention: any;
      hmentioninput: any;
      hnli: any;
      hol: any;
      hp: any;
      hplaceholder: any;
      htable: any;
      htd: any;
      htext: {
        [key: string]: any;
        // These optional params will show up in the autocomplete!
        bold?: boolean;
        children?: any;
        code?: boolean;
        italic?: boolean;
        underline?: boolean;
      };
      hth: any;
      htoc: any;
      htodoli: any;
      htoggle: any;
      htr: any;
      hul: any;
      hvideo: any;
      selection: any;
      text: any;
    }
  }
}

export const voidChildren = [{ text: '' }];

export const elements: HyperscriptShorthands = {
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
  hplaceholder: { children: voidChildren, type: 'placeholder' },
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
