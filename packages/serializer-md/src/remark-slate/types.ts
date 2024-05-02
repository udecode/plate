import type {
  PlateEditor,
  TElement,
  Value,
} from '@udecode/plate-common/server';

export type MdastElementType =
  | 'blockquote'
  | 'code'
  | 'heading'
  | 'image'
  | 'link'
  | 'list'
  | 'listItem'
  | 'paragraph'
  | 'thematicBreak';

export type MdastTextType =
  | 'delete'
  | 'emphasis'
  | 'html'
  | 'inlineCode'
  | 'strong'
  | 'text';

export type MdastNodeType = MdastElementType | MdastTextType;

export interface MdastNode {
  alt?: string;
  checked?: any;
  children?: MdastNode[];
  depth?: 1 | 2 | 3 | 4 | 5 | 6;
  indent?: any;
  lang?: string;
  ordered?: boolean;
  // mdast metadata
  position?: any;
  spread?: any;
  text?: string;
  type?: MdastNodeType;
  url?: string;
  value?: string;
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
  indentList?: boolean;
  textRules: RemarkTextRules<V>;
};
