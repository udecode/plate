import { createBasicElementsPlugin } from '@udecode/plate-basic-elements';
import {
  createBasicMarksPlugin,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
} from '@udecode/plate-basic-marks';
import { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote';
import { createPlugins, PlateLeaf, withProps } from '@udecode/plate-common';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '@udecode/plate-heading';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';

import { BlockquoteElement } from '@/components/plate-ui/blockquote-element';
import { CodeLeaf } from '@/components/plate-ui/code-leaf';
import { HeadingElement } from '@/components/plate-ui/heading-element';
import { ParagraphElement } from '@/components/plate-ui/paragraph-element';

export const plugins = createPlugins(
  [
    // Nodes
    createBasicElementsPlugin(),
    createBasicMarksPlugin(),
  ],
  {
    components: {
      [ELEMENT_BLOCKQUOTE]: BlockquoteElement,
      [ELEMENT_H1]: withProps(HeadingElement, { variant: 'h1' }),
      [ELEMENT_H2]: withProps(HeadingElement, { variant: 'h2' }),
      [ELEMENT_H3]: withProps(HeadingElement, { variant: 'h3' }),
      [ELEMENT_H4]: withProps(HeadingElement, { variant: 'h4' }),
      [ELEMENT_H5]: withProps(HeadingElement, { variant: 'h5' }),
      [ELEMENT_H6]: withProps(HeadingElement, { variant: 'h6' }),
      [ELEMENT_PARAGRAPH]: ParagraphElement,
      [MARK_BOLD]: withProps(PlateLeaf, { as: 'strong' }),
      [MARK_CODE]: CodeLeaf,
      [MARK_ITALIC]: withProps(PlateLeaf, { as: 'em' }),
      [MARK_STRIKETHROUGH]: withProps(PlateLeaf, { as: 's' }),
      [MARK_SUBSCRIPT]: withProps(PlateLeaf, { as: 'sub' }),
      [MARK_SUPERSCRIPT]: withProps(PlateLeaf, { as: 'sup' }),
    },
  }
);
