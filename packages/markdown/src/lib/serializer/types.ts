export type MdNodeTypes = {
  a: string;
  blockquote: string;
  bold: string;
  code: string;
  code_block: string;
  h1: string;
  h2: string;
  h3: string;
  h4: string;
  h5: string;
  h6: string;
  hr: string;
  img: string;
  italic: string;
  li: string;
  ol: string;
  p: string;
  strikethrough: string;
  ul: string;
  underline: string;
};

type NodeType = {
  parent?: {
    type: string;
    index?: number;
    isList?: boolean;
    length?: number;
  };
};

export interface MdLeafType extends NodeType {
  text: string;
}

export interface MdElementType extends NodeType {
  children: (MdElementType | MdLeafType)[];
  type: string;
  break?: boolean;
  caption?: (MdElementType | MdLeafType)[];
  indent?: number;
  language?: string;
  listStart?: number;
  listStyleType?: string;
  url?: string;
}

export type MdNodeType = MdElementType & MdLeafType & Record<string, unknown>;
