import { getPluginType } from '@udecode/slate-plugins-core';
import markdown from 'remark-parse';
import slate from 'remark-slate';
import { Editor } from 'slate';
import unified from 'unified';
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
import { ELEMENT_LINK } from '../../../elements/link/defaults';
import {
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_UL,
} from '../../../elements/list/defaults';
import { ELEMENT_PARAGRAPH } from '../../../elements/paragraph/defaults';

export const parseMD = (editor: Editor, content: string) => {
  const tree: any = unified()
    .use(markdown)
    .use(slate, {
      nodeTypes: {
        paragraph: getPluginType(editor, ELEMENT_PARAGRAPH),
        block_quote: getPluginType(editor, ELEMENT_BLOCKQUOTE),
        link: getPluginType(editor, ELEMENT_LINK),
        code_block: getPluginType(editor, ELEMENT_CODE_BLOCK),
        ul_list: getPluginType(editor, ELEMENT_UL),
        ol_list: getPluginType(editor, ELEMENT_OL),
        listItem: getPluginType(editor, ELEMENT_LI),
        heading: {
          1: getPluginType(editor, ELEMENT_H1),
          2: getPluginType(editor, ELEMENT_H2),
          3: getPluginType(editor, ELEMENT_H3),
          4: getPluginType(editor, ELEMENT_H4),
          5: getPluginType(editor, ELEMENT_H5),
          6: getPluginType(editor, ELEMENT_H6),
        },
      },
      linkDestinationKey: 'url',
    })
    .processSync(content);

  return tree.result;
};
