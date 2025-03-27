import type {
  MdBlockquote,
  MdHeading,
  MdImage,
  MdLink,
  MdParagraph,
  MdTable,
  MdTableCell,
  MdTableRow,
} from '../mdast';
import type { TNodes } from './types';

import { convertNodesDeserialize } from '../deserializer';
import { convertNodesSerialize } from '../serializer';
import { getPlateNodeType } from '../utils/mapTypeUtils';

export const defaultNodes: TNodes = {
  a: {
    serialize: (node, options) => {
      return {
        children: convertNodesSerialize(
          node.children,
          options
        ) as MdLink['children'],
        type: 'link',
        url: node.url,
      };
    },
  },
  blockquote: {
    serialize: (node, options) => {
      return {
        children: convertNodesSerialize(
          node.children,
          options
        ) as MdBlockquote['children'],
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
        children: convertNodesSerialize(
          node.children,
          options
        ) as MdHeading['children'],
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
      const image: MdImage = {
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
    deserialize: (node, deco, options) => {
      return {
        children: convertNodesDeserialize(node.children, deco, options),
        type: getPlateNodeType(node.type),
      };
    },
    serialize: (node, options) => {
      return {
        children: convertNodesSerialize(
          node.children,
          options
        ) as MdParagraph['children'],
        type: 'paragraph',
      };
    },
  },
  table: {
    serialize: (node, options) => {
      return {
        children: convertNodesSerialize(
          node.children,
          options
        ) as MdTable['children'],
        type: 'table',
      };
    },
  },
  td: {
    serialize: (node, options) => {
      return {
        children: convertNodesSerialize(
          node.children,
          options
        ) as MdTableCell['children'],
        type: 'tableCell',
      };
    },
  },
  th: {
    serialize: (node, options) => {
      return {
        children: convertNodesSerialize(
          node.children,
          options
        ) as MdTableCell['children'],
        type: 'tableCell',
      };
    },
  },
  tr: {
    serialize: (node, options) => {
      return {
        children: convertNodesSerialize(
          node.children,
          options
        ) as MdTableRow['children'],
        type: 'tableRow',
      };
    },
  },
};
