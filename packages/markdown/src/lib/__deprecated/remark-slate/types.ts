import type { SlateEditor, TElement } from '@udecode/plate';

export type MdastElementType =
  | 'blockquote'
  | 'code'
  | 'heading'
  | 'image'
  | 'inlineMath'
  | 'link'
  | 'list'
  | 'listItem'
  | 'math'
  | 'paragraph'
  | 'table'
  | 'thematicBreak';

export interface MdastNode {
  type: MdastNodeType;
  // mdast metadata
  alt?: string;
  checked?: any;
  children?: MdastNode[];
  depth?: 1 | 2 | 3 | 4 | 5 | 6;
  indent?: any;
  lang?: string;
  ordered?: boolean;
  position?: {
    end: TextPosition;
    start: TextPosition;
  };
  spread?: any;
  text?: string;
  url?: string;
  value?: string;
}

export type MdastNodeType = MdastElementType | MdastTextType;

export type MdastTextType =
  | 'delete'
  | 'emphasis'
  | 'html'
  | 'inlineCode'
  | 'strong'
  | 'text';

export type RemarkElementRule = {
  transform: (
    node: MdastNode,
    options: RemarkPluginOptions
  ) => TElement | TElement[];
};

export type RemarkElementRules = Partial<
  Record<MdastElementType, RemarkElementRule>
>;

export type RemarkPluginOptions = {
  editor: SlateEditor;
  elementRules: RemarkElementRules;
  textRules: RemarkTextRules;
  indentList?: boolean;
};

export type RemarkTextRule = {
  transform: (
    node: MdastNode,
    options: RemarkPluginOptions
  ) => {
    [key: string]: boolean | string;
    text: string;
  };
};

export type RemarkTextRules = Partial<Record<MdastTextType, RemarkTextRule>>;

export interface TextPosition {
  column: number;
  line: number;
  offset?: number;
}
