import type { TElement } from '@udecode/plate';
import type * as mdastUtilMath from 'mdast-util-math';

import type {
  TCodeBlockElement,
  TDateElement,
  TEquationElement,
  TImageElement,
  TLinkElement,
  TMentionElement,
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../internal/types';
import type { SerializeMdOptions } from './serializeMd';
import type { mdast } from './types';

import { convertNodes } from './convertNodes';

export type Components = Partial<{
  [K in keyof ElementTypeMap]: SerializeComponent<K>;
}> &
  Record<
    string,
    {
      deserialize?: (node: any, options: SerializeMdOptions) => any;
      serialize?: (node: any, options: SerializeMdOptions) => any;
    }
  >;

type ElementTypeMap = {
  a: TLinkElement;
  blockquote: TElement;
  code_block: TCodeBlockElement;
  date: TDateElement;
  equation: TEquationElement;
  heading: TElement;
  hr: TElement;
  img: TImageElement;
  inline_equation: TEquationElement;
  mention: TMentionElement;
  p: TElement;
  table: TTableElement;
  td: TTableCellElement;
  th: TElement;
  tr: TTableRowElement;
};

type ReturnTypeMap = {
  a: mdast.Link;
  blockquote: mdast.Blockquote;
  code_block: mdast.Code;
  date: mdast.Text;
  equation: mdastUtilMath.Math;
  heading: mdast.Heading;
  hr: mdast.ThematicBreak;
  img: mdast.Paragraph;
  inline_equation: mdastUtilMath.InlineMath;
  mention: mdast.Text;
  p: mdast.Paragraph;
  table: mdast.Table;
  td: mdast.TableCell;
  th: mdast.TableCell;
  tr: mdast.TableRow;
};

type SerializeComponent<K extends keyof ElementTypeMap> = {
  deserialize?: (
    node: ReturnTypeMap[K],
    options: SerializeMdOptions
  ) => ElementTypeMap[K];
  serialize?: (
    node: ElementTypeMap[K],
    options: SerializeMdOptions
  ) => ReturnTypeMap[K];
};

type SerializeRules = {
  [K in keyof ElementTypeMap]?: {
    serialize: (
      node: ElementTypeMap[K],
      options: SerializeMdOptions
    ) => ReturnTypeMap[K];
  };
};

export const defaultSerializeRules: SerializeRules = {
  a: {
    serialize: (node, options) => {
      return {
        children: convertNodes(
          node.children,
          options
        ) as mdast.Link['children'],
        type: 'link',
        url: node.url,
      };
    },
  },
  blockquote: {
    serialize: (node, options) => {
      return {
        children: convertNodes(
          node.children,
          options
        ) as mdast.Blockquote['children'],
        type: 'blockquote',
      };
    },
  },
  code_block: {
    serialize: (node) => {
      return {
        lang: node.lang,
        type: 'code',
        value: node.children
          .map((child: any) => child.children.map((c: any) => c.text).join(''))
          .join('\n'),
      };
    },
  },
  date: {
    serialize: ({ date }) => {
      return {
        type: 'text',
        value: date ?? '',
      };
    },
  },
  equation: {
    serialize: (node) => {
      return {
        type: 'math',
        value: node.texExpression,
      };
    },
  },
  heading: {
    serialize: (node, options) => {
      const depthMap = {
        h1: 1,
        h2: 2,
        h3: 3,
        h4: 4,
        h5: 5,
        h6: 6,
      };

      return {
        children: convertNodes(
          node.children,
          options
        ) as mdast.Heading['children'],
        depth: depthMap[node.type as keyof typeof depthMap] as any,
        type: 'heading',
      };
    },
  },
  hr: {
    serialize: () => {
      return { type: 'thematicBreak' };
    },
  },
  img: {
    serialize: ({ caption, url }) => {
      const image: mdast.Image = {
        alt: caption ? caption.map((c) => (c as any).text).join('') : undefined,
        title: caption
          ? caption.map((c) => (c as any).text).join('')
          : undefined,
        type: 'image',
        url,
      };
      return { children: [image], type: 'paragraph' };
    },
  },
  inline_equation: {
    serialize: (node) => {
      return {
        type: 'inlineMath',
        value: node.texExpression,
      };
    },
  },
  mention: {
    serialize: ({ value }) => {
      return {
        type: 'text',
        value,
      };
    },
  },
  p: {
    serialize: (node, options) => {
      return {
        children: convertNodes(
          node.children,
          options
        ) as mdast.Paragraph['children'],
        type: 'paragraph',
      };
    },
  },
  table: {
    serialize: (node, options) => {
      return {
        children: convertNodes(
          node.children,
          options
        ) as mdast.Table['children'],
        type: 'table',
      };
    },
  },
  td: {
    serialize: (node, options) => {
      return {
        children: convertNodes(
          node.children,
          options
        ) as mdast.TableCell['children'],
        type: 'tableCell',
      };
    },
  },
  th: {
    serialize: (node, options) => {
      return {
        children: convertNodes(
          node.children,
          options
        ) as mdast.TableCell['children'],
        type: 'tableCell',
      };
    },
  },
  tr: {
    serialize: (node, options) => {
      return {
        children: convertNodes(
          node.children,
          options
        ) as mdast.TableRow['children'],
        type: 'tableRow',
      };
    },
  },
};
