import { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote/src/index';
import { ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block/src/index';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '@udecode/plate-heading/src/index';
import { IndentListPlugin } from '@udecode/plate-indent-list/src/index';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph/src/index';
import { MyPlatePlugin } from '../typescript/plateTypes';

export const indentListPlugin: Partial<MyPlatePlugin<IndentListPlugin>> = {
  inject: {
    props: {
      validTypes: [
        ELEMENT_PARAGRAPH,
        ELEMENT_H1,
        ELEMENT_H2,
        ELEMENT_H3,
        ELEMENT_H4,
        ELEMENT_H5,
        ELEMENT_H6,
        ELEMENT_BLOCKQUOTE,
        ELEMENT_CODE_BLOCK,
      ],
    },
  },
};
