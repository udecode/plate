import { MARK_BOLD, MARK_ITALIC } from '@udecode/plate-basic-marks';
import {
  getPluginType,
  PlateEditor,
  Value,
} from '@udecode/plate-common/server';
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

export type NodeTypes = {
  paragraph: string;
  heading: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
  };
  link: string;
  ul_list: string;
  ol_list: string;
  listItem: string;
  emphasis_mark: string;
  strong_mark: string;
} & Partial<{
  block_quote: string;
  inline_code_mark: string;
  thematic_break: string;
  image: string;
  code_block: string;
  delete_mark: string;
}>;

export interface LeafType {
  text: string;
  strikeThrough?: boolean;
  parent?: {
    type: string;
    index?: number;
    length?: number;
  };
}

export interface BlockType {
  type: string;
  parent?: {
    type: string;
    index?: number;
    length?: number;
  };
  url?: string;
  caption?: Array<BlockType | LeafType>;
  language?: string;
  break?: boolean;
  children: Array<BlockType | LeafType>;
}

export const getRemarkNodeTypesMap = <V extends Value>(
  editor: PlateEditor<V>
): NodeTypes => {
  return {
    paragraph: getPluginType(editor, ELEMENT_PARAGRAPH),
    link: getPluginType(editor, ELEMENT_LINK),
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
    emphasis_mark: getPluginType(editor, MARK_ITALIC),
    strong_mark: getPluginType(editor, MARK_BOLD),
    // block_quote: QUOTE_PLUGIN_KEY,
    // thematic_break: SEPARATOR_KEY,
    // inline_code_mark: INLINE_CODE_KEY,
    // image: IMAGE_PLUGIN_TYPE,
    // code_block
    // delete_mark
  };
};
