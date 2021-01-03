import markdown from 'remark-parse';
import slate from 'remark-slate';
import unified from 'unified';
import { setDefaults } from '../../../common/utils/setDefaults';
import { ELEMENT_BLOCKQUOTE } from '../../../elements/blockquote/defaults';
import { ELEMENT_CODE_BLOCK } from '../../../elements/code-block/defaults';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '../../../elements/heading/defaults';
import { ATTRIBUTE_LINK, ELEMENT_LINK } from '../../../elements/link/defaults';
import {
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_UL,
} from '../../../elements/list/defaults';
import { ELEMENT_PARAGRAPH } from '../../../elements/paragraph/defaults';

export const parseMD = (options?: Record<string, any>) => (content: string) => {
  const {
    p,
    blockquote,
    link,
    code,
    ul,
    ol,
    li,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
  } = setDefaults(options, {
    p: { type: ELEMENT_PARAGRAPH },
    blockquote: { type: ELEMENT_BLOCKQUOTE },
    link: { type: ELEMENT_LINK, attribute: ATTRIBUTE_LINK },
    code: { type: ELEMENT_CODE_BLOCK },
    ul: { type: ELEMENT_UL },
    ol: { type: ELEMENT_OL },
    li: { type: ELEMENT_LI },
    h1: { type: ELEMENT_H1 },
    h2: { type: ELEMENT_H2 },
    h3: { type: ELEMENT_H3 },
    h4: { type: ELEMENT_H4 },
    h5: { type: ELEMENT_H5 },
    h6: { type: ELEMENT_H6 },
  });

  const tree: any = unified()
    .use(markdown)
    .use(slate, {
      nodeTypes: {
        paragraph: p.type,
        block_quote: blockquote.type,
        link: link.type,
        code_block: code.type,
        ul_list: ul.type,
        ol_list: ol.type,
        listItem: li.type,
        heading: {
          1: h1.type,
          2: h2.type,
          3: h3.type,
          4: h4.type,
          5: h5.type,
          6: h6.type,
        },
      },
      linkDestinationKey: link.attribute,
    })
    .processSync(content);

  return tree.result;
};
