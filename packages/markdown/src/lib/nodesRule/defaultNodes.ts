import type { TText } from '@udecode/plate';

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
    deserialize: (mdastNode, deco, options) => {
      return {
        children: convertNodesDeserialize(mdastNode.children, deco, options),
        type: 'a',
        url: mdastNode.url,
      };
    },
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
    deserialize: (mdastNode, deco, options) => {
      return {
        children: convertNodesDeserialize(mdastNode.children, deco, options),
        type: 'blockquote',
      };
    },
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
    deserialize: (mdastNode, deco, options) => {
      return {
        children: (mdastNode.value || '').split('\n').map((line) => ({
          children: [{ text: line } as TText],
          type: 'code_line',
        })),
        lang: mdastNode.lang ?? undefined,
        type: 'code_block',
      };
    },
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
    deserialize: (mdastNode, deco, options) => {
      return {
        children: [{ text: '' }],
        texExpression: mdastNode.value,
        type: 'equation',
      };
    },
    serialize: (node) => {
      return {
        type: 'math',
        value: node.texExpression,
      };
    },
  },
  heading: {
    deserialize: (mdastNode, deco, options) => {
      const headingType = {
        1: 'h1',
        2: 'h2',
        3: 'h3',
        4: 'h4',
        5: 'h5',
        6: 'h6',
      };

      return {
        children: convertNodesDeserialize(mdastNode.children, deco, options),
        type: headingType[mdastNode.depth],
      };
    },
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
    deserialize: () => {
      return {
        children: [{ text: '' } as TText],
        type: 'hr',
      };
    },
    serialize: () => {
      return { type: 'thematicBreak' };
    },
  },
  img: {
    deserialize: (mdastNode, deco, options) => {
      return {
        caption: [{ text: mdastNode.alt } as TText],
        children: [{ text: '' } as TText],
        type: 'img',
        url: mdastNode.url,
      };
    },
    serialize: ({ caption, url }) => {
      const image: MdImage = {
        alt: caption ? caption.map((c) => (c as any).text).join('') : undefined,
        title: caption
          ? caption.map((c) => (c as any).text).join('')
          : undefined,
        type: 'image',
        url,
      };

      // since plate is using block image so we need to wrap it in a paragraph
      return { children: [image], type: 'paragraph' } as any;
    },
  },
  inline_equation: {
    deserialize(mdastNode) {
      return {
        children: [{ text: '' }],
        texExpression: mdastNode.value,
        type: 'inline_equation',
      };
    },
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
      const children = convertNodesDeserialize(node.children, deco, options);
      const paragraphType = getPlateNodeType('paragraph');
      const splitBlockTypes = new Set(['img']);
      
      const elements: any[] = [];
      let inlineNodes: any[] = [];

      const flushInlineNodes = () => {
        if (inlineNodes.length > 0) {
          elements.push({
            children: inlineNodes,
            type: paragraphType,
          });
          inlineNodes = [];
        }
      };

      children.forEach((child) => {
        const { type } = child as { type?: string };

        if (type && splitBlockTypes.has(type)) {
          flushInlineNodes();
          elements.push(child);
        } else {
          inlineNodes.push(child);
        }
      });

      flushInlineNodes();

      return elements.length === 1 ? elements[0] : elements;
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
  text: {
    deserialize: (mdastNode, deco) => {
      return {
        ...deco,
        text: mdastNode.value,
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
