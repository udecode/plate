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
import type * as mdastUtilMath from 'mdast-util-math';

import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { DatePlugin } from '@udecode/plate-date/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import {
  type mdast,
  convertNodes,
  MarkdownPlugin,
} from '@udecode/plate-markdown';
import {
  EquationPlugin,
  InlineEquationPlugin,
} from '@udecode/plate-math/react';
import { ImagePlugin } from '@udecode/plate-media/react';
import { MentionPlugin } from '@udecode/plate-mention/react';
import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from '@udecode/plate-table/react';
import { ParagraphPlugin } from '@udecode/plate/react';
import remarkMath from 'remark-math';

export const markdownPlugins = MarkdownPlugin.configure({
  options: {
    components: {
      [BlockquotePlugin.key]: {
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
      [CodeBlockPlugin.key]: {
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
      [EquationPlugin.key]: {
        serialize: (node: TEquationElement): mdastUtilMath.Math => {
          return {
            type: 'math',
            value: node.texExpression,
          };
        },
      },
      [HEADING_KEYS.h1]: {
        serialize: (node: TElement, options): mdast.Heading => {
          return {
            children: convertNodes(
              node.children,
              options
            ) as mdast.Heading['children'],
            depth: 1,
            type: 'heading',
          };
        },
      },
      [HEADING_KEYS.h2]: {
        serialize: (node: TElement, options): mdast.Heading => {
          return {
            children: convertNodes(
              node.children,
              options
            ) as mdast.Heading['children'],
            depth: 2,
            type: 'heading',
          };
        },
      },
      [HEADING_KEYS.h3]: {
        serialize: (node: TElement, options): mdast.Heading => {
          return {
            children: convertNodes(
              node.children,
              options
            ) as mdast.Heading['children'],
            depth: 3,
            type: 'heading',
          };
        },
      },
      [HEADING_KEYS.h4]: {
        serialize: (node: TElement, options): mdast.Heading => {
          return {
            children: convertNodes(
              node.children,
              options
            ) as mdast.Heading['children'],
            depth: 4,
            type: 'heading',
          };
        },
      },
      [HEADING_KEYS.h5]: {
        serialize: (node: TElement, options): mdast.Heading => {
          return {
            children: convertNodes(
              node.children,
              options
            ) as mdast.Heading['children'],
            depth: 5,
            type: 'heading',
          };
        },
      },
      [HEADING_KEYS.h6]: {
        serialize: (node: TElement, options): mdast.Heading => {
          return {
            children: convertNodes(
              node.children,
              options
            ) as mdast.Heading['children'],
            depth: 6,
            type: 'heading',
          };
        },
      },
      [HorizontalRulePlugin.key]: {
        serialize: (): mdast.ThematicBreak => {
          return { type: 'thematicBreak' };
        },
      },
      [ImagePlugin.key]: {
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
      [InlineEquationPlugin.key]: {
        serialize: (node: TEquationElement): mdastUtilMath.InlineMath => {
          return {
            type: 'inlineMath',
            value: node.texExpression,
          };
        },
      },
      [LinkPlugin.key]: {
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
      [MentionPlugin.key]: {
        serialize: ({ value }: TMentionElement): mdast.Text => {
          return {
            type: 'text',
            value,
          };
        },
      },
      [ParagraphPlugin.key]: {
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
      [TableCellPlugin.key]: {
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
      [TablePlugin.key]: {
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
      [TableRowPlugin.key]: {
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
    },
    indentList: true,
    remarkPlugins: [remarkMath],
  },
});
