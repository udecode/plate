import { PlateEditor, TElement, Value } from '@udecode/plate-common';

export type MdastElementType =
  | 'paragraph'
  | 'heading'
  | 'list'
  | 'listItem'
  | 'link'
  | 'image'
  | 'blockquote'
  | 'code'
  | 'thematicBreak';

export type MdastTextType =
  | 'emphasis'
  | 'strong'
  | 'delete'
  | 'inlineCode'
  | 'html'
  | 'text';

export type MdastNodeType = MdastElementType | MdastTextType;

export interface MdastNode {
  type?: MdastNodeType;
  ordered?: boolean;
  value?: string;
  text?: string;
  children?: Array<MdastNode>;
  depth?: 1 | 2 | 3 | 4 | 5 | 6;
  url?: string;
  alt?: string;
  lang?: string;
  // mdast metadata
  position?: any;
  spread?: any;
  checked?: any;
  indent?: any;
}

export type RemarkElementRule<V extends Value> = {
  transform: (
    node: MdastNode,
    options: RemarkPluginOptions<V>
  ) => TElement | TElement[];
};

export type RemarkElementRules<V extends Value> = {
  [key in MdastElementType]?: RemarkElementRule<V>;
};

export type RemarkTextRule<V extends Value> = {
  mark?: (options: RemarkPluginOptions<V>) => string;
  transform?: (text: string) => string;
};

export type RemarkTextRules<V extends Value> = {
  [key in MdastTextType]?: RemarkTextRule<V>;
};

export type RemarkPluginOptions<V extends Value> = {
  editor: PlateEditor<V>;
  elementRules: RemarkElementRules<V>;
  textRules: RemarkTextRules<V>;
  indentList?: boolean;
};
