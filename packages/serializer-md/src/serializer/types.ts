import { MARK_BOLD, MARK_ITALIC } from '@udecode/plate-basic-marks';
import {
  type PlateEditor,
  type Value,
  getPluginType,
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
  emphasis_mark: string;
  heading: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
  };
  link: string;
  listItem: string;
  ol_list: string;
  paragraph: string;
  strong_mark: string;
  ul_list: string;
} & Partial<{
  block_quote: string;
  code_block: string;
  delete_mark: string;
  image: string;
  inline_code_mark: string;
  thematic_break: string;
}>;

export interface LeafType {
  text: string;
  parent?: {
    index?: number;
    length?: number;
    type: string;
  };
  strikeThrough?: boolean;
}

export interface BlockType {
  children: (BlockType | LeafType)[];
  type: string;
  break?: boolean;
  caption?: (BlockType | LeafType)[];
  language?: string;
  parent?: {
    index?: number;
    length?: number;
    type: string;
  };
  url?: string;
}

export const getRemarkNodeTypesMap = <V extends Value>(
  editor: PlateEditor<V>
): NodeTypes => {
  return {
    emphasis_mark: getPluginType(editor, MARK_ITALIC),
    heading: {
      1: getPluginType(editor, ELEMENT_H1),
      2: getPluginType(editor, ELEMENT_H2),
      3: getPluginType(editor, ELEMENT_H3),
      4: getPluginType(editor, ELEMENT_H4),
      5: getPluginType(editor, ELEMENT_H5),
      6: getPluginType(editor, ELEMENT_H6),
    },
    link: getPluginType(editor, ELEMENT_LINK),
    listItem: getPluginType(editor, ELEMENT_LI),
    ol_list: getPluginType(editor, ELEMENT_OL),
    paragraph: getPluginType(editor, ELEMENT_PARAGRAPH),
    strong_mark: getPluginType(editor, MARK_BOLD),
    ul_list: getPluginType(editor, ELEMENT_UL),
    // block_quote: QUOTE_PLUGIN_KEY,
    // thematic_break: SEPARATOR_KEY,
    // inline_code_mark: INLINE_CODE_KEY,
    // image: IMAGE_PLUGIN_TYPE,
    // code_block
    // delete_mark
  };
};
