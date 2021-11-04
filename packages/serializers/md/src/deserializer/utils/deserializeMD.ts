import {
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  // MARK_SUBSCRIPT,
  // MARK_SUPERSCRIPT,
  // MARK_UNDERLINE,
} from '@udecode/plate-basic-marks';
import { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote';
import { ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block';
import { getPlatePluginType, PlateEditor } from '@udecode/plate-core';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '@udecode/plate-heading';
import { ELEMENT_LINK } from '@udecode/plate-link';
import { ELEMENT_LI, ELEMENT_OL, ELEMENT_UL } from '@udecode/plate-list';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import markdown from 'remark-parse';
import slate from 'remark-slate';
import unified from 'unified';

/**
 * Deserialize content from Markdown format to Slate format.
 * `editor` needs
 */
export const deserializeMD = (editor: PlateEditor, content: string) => {
  const tree: any = unified()
    .use(markdown)
    .use(slate, {
      nodeTypes: {
        paragraph: getPlatePluginType(editor, ELEMENT_PARAGRAPH),
        block_quote: getPlatePluginType(editor, ELEMENT_BLOCKQUOTE),
        link: getPlatePluginType(editor, ELEMENT_LINK),
        inline_code_mark: getPlatePluginType(editor, MARK_CODE),
        emphasis_mark: getPlatePluginType(editor, MARK_ITALIC),
        strong_mark: getPlatePluginType(editor, MARK_BOLD),
        delete_mark: getPlatePluginType(editor, MARK_STRIKETHROUGH),
        // FIXME: underline, subscript superscript not yet supported by remark-slate
        // underline: getPlatePluginType(editor, MARK_UNDERLINE),
        // subscript: getPlatePluginType(editor, MARK_SUBSCRIPT),
        // superscript: getPlatePluginType(editor, MARK_SUPERSCRIPT),
        code_block: getPlatePluginType(editor, ELEMENT_CODE_BLOCK),
        ul_list: getPlatePluginType(editor, ELEMENT_UL),
        ol_list: getPlatePluginType(editor, ELEMENT_OL),
        listItem: getPlatePluginType(editor, ELEMENT_LI),
        heading: {
          1: getPlatePluginType(editor, ELEMENT_H1),
          2: getPlatePluginType(editor, ELEMENT_H2),
          3: getPlatePluginType(editor, ELEMENT_H3),
          4: getPlatePluginType(editor, ELEMENT_H4),
          5: getPlatePluginType(editor, ELEMENT_H5),
          6: getPlatePluginType(editor, ELEMENT_H6),
        },
      },
      linkDestinationKey: 'url',
    })
    .processSync(content);

  return tree.result;
};
