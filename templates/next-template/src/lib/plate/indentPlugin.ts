import { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote';
import { ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block';
import { PlatePlugin } from '@udecode/plate-common';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '@udecode/plate-heading';
import { IndentPlugin } from '@udecode/plate-indent';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';

export const indentPlugin: Partial<PlatePlugin<IndentPlugin>> = {
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
