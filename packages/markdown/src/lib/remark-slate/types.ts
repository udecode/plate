import type { SlateEditor, TElement } from '@udecode/plate-common';

export type MdastElementType =
  | 'blockquote'
  | 'code'
  | 'heading'
  | 'image'
  | 'link'
  | 'list'
  | 'listItem'
  | 'paragraph'
  | 'table'
  | 'thematicBreak';

export type MdastTextType =
  | 'delete'
  | 'emphasis'
  | 'html'
  | 'inlineCode'
  | 'strong'
  | 'text';

export type MdastNodeType = MdastElementType | MdastTextType;

export interface TextPosition {
  column: number;
  line: number;
  offset?: number;
}

export interface MdastNode {
  type: MdastNodeType;
  // mdast metadata
  position?: {
    end: TextPosition;
    start: TextPosition;
  };
  alt?: string;
  checked?: any;
  children?: MdastNode[];
  depth?: 1 | 2 | 3 | 4 | 5 | 6;
  indent?: any;
  lang?: string;
  ordered?: boolean;
  spread?: any;
  text?: string;
  url?: string;
  value?: string;
}

export type RemarkElementRule = {
  transform: (
    node: MdastNode,
    options: RemarkPluginOptions
  ) => TElement | TElement[];
};

export type RemarkElementRules = Partial<
  Record<MdastElementType, RemarkElementRule>
>;

export type RemarkTextRule = {
  mark?: (options: RemarkPluginOptions) => string;
  transform?: (text: string) => string;
};

export type RemarkTextRules = Partial<Record<MdastTextType, RemarkTextRule>>;

export type RemarkPluginOptions = {
  editor: SlateEditor;
  elementRules: RemarkElementRules;
  textRules: RemarkTextRules;
  indentList?: boolean;
};
