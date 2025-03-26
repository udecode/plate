import type { Nodes } from '../types';
import type { mdast } from './types';

import { convertNodes } from './convertNodes';

export const defaultSerializeRules: Nodes = {
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
