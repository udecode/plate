import { ELEMENT_BLOCKQUOTE } from '@udecode/slate-plugins-block-quote';
import { ELEMENT_CODE_BLOCK } from '@udecode/slate-plugins-code-block';
import { getSlatePluginType, SPEditor } from '@udecode/slate-plugins-core';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '@udecode/slate-plugins-heading';
import { ELEMENT_LINK } from '@udecode/slate-plugins-link';
import {
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_UL,
} from '@udecode/slate-plugins-list';
import { ELEMENT_PARAGRAPH } from '@udecode/slate-plugins-paragraph';
import markdown from 'remark-parse';
import slate from 'remark-slate';
import unified from 'unified';

/**
 * Deserialize content from Markdown format to Slate format.
 * `editor` needs
 */
export const deserializeMD = (editor: SPEditor, content: string) => {
  const tree: any = unified()
    .use(markdown)
    .use(slate, {
      nodeTypes: {
        paragraph: getSlatePluginType(editor, ELEMENT_PARAGRAPH),
        block_quote: getSlatePluginType(editor, ELEMENT_BLOCKQUOTE),
        link: getSlatePluginType(editor, ELEMENT_LINK),
        code_block: getSlatePluginType(editor, ELEMENT_CODE_BLOCK),
        ul_list: getSlatePluginType(editor, ELEMENT_UL),
        ol_list: getSlatePluginType(editor, ELEMENT_OL),
        listItem: getSlatePluginType(editor, ELEMENT_LI),
        heading: {
          1: getSlatePluginType(editor, ELEMENT_H1),
          2: getSlatePluginType(editor, ELEMENT_H2),
          3: getSlatePluginType(editor, ELEMENT_H3),
          4: getSlatePluginType(editor, ELEMENT_H4),
          5: getSlatePluginType(editor, ELEMENT_H5),
          6: getSlatePluginType(editor, ELEMENT_H6),
        },
      },
      linkDestinationKey: 'url',
    })
    .processSync(content);

  return tree.result;
};
