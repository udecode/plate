import markdown from 'remark-parse';
import slate from 'remark-slate';
import unified from 'unified';
import { setDefaults } from '../../../common/utils/setDefaults';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '../../../elements/heading/defaults';
import { ELEMENT_LINK } from '../../../elements/link/defaults';
import {
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_UL,
} from '../../../elements/list/defaults';
import { ELEMENT_PARAGRAPH } from '../../../elements/paragraph/defaults';
import { WithDeserializeMdOptions } from '../withDeserializeMd';

export const parseMD = (options: WithDeserializeMdOptions) => (
  content: string
) => {
  setDefaults(options, {
    p: { type: ELEMENT_PARAGRAPH },
    blockquote: { type: ELEMENT_PARAGRAPH },
    link: { type: ELEMENT_LINK },
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
        paragraph: options.p.type,
        block_quote: options.blockquote.type,
        link: options.link.type,
        ul_list: options.ul.type,
        ol_list: options.ol.type,
        listItem: options.li.type,
        heading: {
          1: options.h1.type,
          2: options.h2.type,
          3: options.h3.type,
          4: options.h4.type,
          5: options.h5.type,
          6: options.h6.type,
        },
      },
    })
    .processSync(content);

  return tree.result;
};
