import type { Descendant, TElement } from '@udecode/plate';
import type { TCodeBlockElement } from '@udecode/plate-code-block';
import type { TDateElement } from '@udecode/plate-date';
import type { TLinkElement } from '@udecode/plate-link';
import type { TEquationElement } from '@udecode/plate-math';
import type { TImageElement } from '@udecode/plate-media';
import type { TMentionElement } from '@udecode/plate-mention';
import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '@udecode/plate-table';

import { DatePlugin } from '@udecode/plate-date/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import {
  type mdast,
  type mdastUtilMath,
  convertNodes,
  MarkdownPlugin,
} from '@udecode/plate-markdown';
import { MentionPlugin } from '@udecode/plate-mention/react';
import { TableCellHeaderPlugin } from '@udecode/plate-table/react';
import remarkMath from 'remark-math';

export const markdownPlugins = MarkdownPlugin.configure({
  options: {
    components: {
      blockquote: {
        // deserialize: remarkDefaultElementRules.blockquote?.transform,
        serialize: (node: TElement, options): mdast.Blockquote => {
          return {
            children: convertNodes(
              node.children,
              options
            ) as mdast.Blockquote['children'],
            type: 'blockquote',
          };
        },
      },
      code: {
        // deserialize: remarkDefaultElementRules.code?.transform,
        serialize: (node: TCodeBlockElement): mdast.Code => {
          return {
            lang: node.lang,
            type: 'code',
            value: node.children
              .map((child: any) =>
                child.children.map((c: any) => c.text).join('')
              )
              .join('\n'),
          };
        },
      },
      [DatePlugin.key]: {
        serialize: ({ date }: TDateElement): mdast.Text => {
          return {
            type: 'text',
            value: date,
          };
        },
      },
      heading: {
        // deserialize: remarkDefaultElementRules.heading?.transform,
        serialize: (node: TElement, options): mdast.Heading => {
          const depthMap = {
            [HEADING_KEYS.h1]: 1,
            [HEADING_KEYS.h2]: 2,
            [HEADING_KEYS.h3]: 3,
            [HEADING_KEYS.h4]: 4,
            [HEADING_KEYS.h5]: 5,
            [HEADING_KEYS.h6]: 6,
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
      image: {
        // deserialize: remarkDefaultElementRules.image?.transform,
        serialize: ({
          caption,
          url,
        }: TImageElement & { caption?: Descendant[] }): mdast.Paragraph => {
          const image: mdast.Image = {
            alt: caption
              ? caption.map((c) => (c as any).text).join('')
              : undefined,
            title: caption
              ? caption.map((c) => (c as any).text).join('')
              : undefined,
            type: 'image',
            url,
          };
          return { children: [image], type: 'paragraph' };
        },
      },
      inlineMath: {
        serialize: (node: TEquationElement): mdastUtilMath.InlineMath => {
          return {
            type: 'inlineMath',
            value: node.texExpression,
          };
        },
      },
      link: {
        // deserialize: remarkDefaultElementRules.link?.transform,
        serialize: (node: TLinkElement, options): mdast.Link => {
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
      list: {
        // deserialize: remarkDefaultElementRules.list?.transform,
      },
      listItem: {
        // deserialize: remarkDefaultElementRules.listItem?.transform,
      },
      math: {
        serialize: (node: TEquationElement): mdastUtilMath.Math => {
          return {
            type: 'math',
            value: node.texExpression,
          };
        },
      },
      [MentionPlugin.key]: {
        serialize: ({ value }: TMentionElement): mdast.Text => {
          return {
            type: 'text',
            value,
          };
        },
      },
      paragraph: {
        // deserialize: remarkDefaultElementRules.paragraph?.transform,
        serialize: (node: TElement, options): mdast.Paragraph => {
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
        // deserialize: remarkDefaultElementRules.table?.transform,
        serialize: (node: TTableElement, options): mdast.Table => {
          return {
            children: convertNodes(
              node.children,
              options
            ) as mdast.Table['children'],
            type: 'table',
          };
        },
      },
      tableCell: {
        serialize: (node: TTableCellElement, options): mdast.TableCell => {
          return {
            children: convertNodes(
              node.children,
              options
            ) as mdast.TableCell['children'],
            type: 'tableCell',
          };
        },
      },
      [TableCellHeaderPlugin.key]: {
        serialize: (node: TElement, options): mdast.TableCell => {
          return {
            children: convertNodes(
              node.children,
              options
            ) as mdast.TableCell['children'],
            type: 'tableCell',
          };
        },
      },
      tableRow: {
        serialize: (node: TTableRowElement, options): mdast.TableRow => {
          return {
            children: convertNodes(
              node.children,
              options
            ) as mdast.TableRow['children'],
            type: 'tableRow',
          };
        },
      },
      thematicBreak: {
        // deserialize: remarkDefaultElementRules.thematicBreak?.transform,
        serialize: (): mdast.ThematicBreak => {
          return { type: 'thematicBreak' };
        },
      },
    },
    remarkPlugins: [remarkMath],
  },
});
