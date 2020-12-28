import { createHyperscript } from 'slate-hyperscript';
import { ELEMENT_BLOCKQUOTE } from '../../common/src/constants/elements/blockquote/index';
import { ELEMENT_CODE_BLOCK } from '../../common/src/constants/elements/code-block/index';
import { ELEMENT_LINK } from '../../common/src/constants/elements/link/index';
import {
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_UL,
} from '../../common/src/constants/elements/list/index';
import { ELEMENT_MENTION } from '../../common/src/constants/elements/mention/index';
import { ELEMENT_PARAGRAPH } from '../../common/src/constants/elements/paragraph/index';
import { ELEMENT_ALIGN_CENTER } from '../../slate-plugins/src/elements/align/defaults';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '../../slate-plugins/src/elements/heading/defaults';
import { ELEMENT_IMAGE } from '../../slate-plugins/src/elements/image/defaults';
import { ELEMENT_MEDIA_EMBED } from '../../slate-plugins/src/elements/media-embed/defaults';
import {
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
} from '../../slate-plugins/src/elements/table/defaults';
import { ELEMENT_TODO_LI } from '../../slate-plugins/src/elements/todo-list/defaults';
import { createText } from './hyperscript/creators';

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
    inline: { inline: true },
    block: {},
  },
  creators: {
    htext: createText,
  },
});
