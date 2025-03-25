import type { TElement } from '@udecode/plate';

import type {
  TCodeBlockElement,
  TDateElement,
  TImageElement,
  TLinkElement,
  TMentionElement,
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../internal/types';
import type { Components } from '../MarkdownPlugin';
import type { SerializeMdOptions } from './serializeMd';
import type { mdast } from './types';

import { convertNodes } from './convertNodes';

export const defaultSerializeRules: Components = {
  a: {
    serialize: (
      node: TLinkElement,
      options: SerializeMdOptions
    ): mdast.Link => {
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
    serialize: (
      node: TElement,
      options: SerializeMdOptions
    ): mdast.Blockquote => {
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
    serialize: (node: TCodeBlockElement): mdast.Code => {
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
    serialize: ({ date }: TDateElement): mdast.Text => {
      return {
        type: 'text',
        value: date ?? '',
      };
    },
  },
  heading: {
    serialize: (node: TElement, options: SerializeMdOptions): mdast.Heading => {
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
    serialize: (): mdast.ThematicBreak => {
      return { type: 'thematicBreak' };
    },
  },
  img: {
    serialize: ({ caption, url }: TImageElement): mdast.Paragraph => {
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
  mention: {
    serialize: ({ value }: TMentionElement): mdast.Text => {
      return {
        type: 'text',
        value,
      };
    },
  },
  p: {
    serialize: (
      node: TElement,
      options: SerializeMdOptions
    ): mdast.Paragraph => {
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
    serialize: (
      node: TTableElement,
      options: SerializeMdOptions
    ): mdast.Table => {
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
    serialize: (
      node: TTableCellElement,
      options: SerializeMdOptions
    ): mdast.TableCell => {
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
    serialize: (
      node: TElement,
      options: SerializeMdOptions
    ): mdast.TableCell => {
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
    serialize: (
      node: TTableRowElement,
      options: SerializeMdOptions
    ): mdast.TableRow => {
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
