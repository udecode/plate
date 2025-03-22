import {
  type Descendant,
  type TElement,
  type TText,
  NodeApi,
  TextApi,
} from '@udecode/plate';

import type { mdast, mdastUtilMath, unistLib } from './types';

import { convertTexts } from './convertTexts';
import { indentListToMdastTree } from './indentListToMdastTree';

export const convertNodes = (
  nodes: Descendant[],
  overrides: any
): unistLib.Node[] => {
  const mdastNodes: unistLib.Node[] = [];
  let textQueue: TText[] = [];

  const listBlock: TElement[] = [];

  for (let i = 0; i <= nodes.length; i++) {
    const n = nodes[i] as any;

    if (n && TextApi.isText(n)) {
      textQueue.push(n);
    } else {
      mdastNodes.push(...(convertTexts(textQueue) as any as unistLib.Node[]));
      textQueue = [];
      if (!n) continue;

      // check
      if (n?.type === 'p' && 'listStyleType' in n) {
        listBlock.push(n);

        const next = nodes[i + 1] as TElement;
        const isNextIndent =
          next && next.type === 'p' && 'listStyleType' in next;

        // 如果下一个不是 indentList，立即处理 block
        if (!isNextIndent) {
          mdastNodes.push(indentListToMdastTree(listBlock as any, overrides));
          listBlock.length = 0;
        }
      } else {
        const node = buildMdastNode(n, overrides);

        if (node) {
          mdastNodes.push(node as unistLib.Node);
        }
      }
    }
  }

  return mdastNodes;
};

export const buildMdastNode = (node: any, overrides: any) => {
  // const customNode = overrides[node.type]?.(node as any, (children) =>
  //   convertNodes(children, overrides)
  // );
  // if (customNode != null) {
  //   return customNode as any;
  // }

  switch (node.type) {
    case 'a': {
      return buildLink(node, overrides);
    }
    case 'blockquote': {
      return buildBlockquote(node, overrides);
    }
    case 'code_block': {
      return buildCodeBlock(node);
    }
    case 'equation': {
      return buildEquation(node);
    }
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6': {
      return buildHeading(node, overrides);
    }
    case 'hr': {
      return buildThematicBreak(node);
    }
    case 'img': {
      return buildImage(node);
    }

    case 'inline_equation': {
      return buildInlineEquation(node);
    }
    case 'p': {
      return buildParagraph(node, overrides);
    }
    // case "list":
    //   return buildList(node, overrides);
    // case "listItem":
    //   return buildListItem(node, overrides);
    case 'table': {
      return buildTable(node, overrides);
    }
    case 'td': {
      return buildTableCell(node, overrides);
    }
    case 'th':
    case 'tr': {
      return buildTableRow(node, overrides);
    }
    default: {
      // unreachable(node);
      console.log(node, 'fj');
      // throw new Error('unreachable');
    }
  }
};

export type TParagraph = {
  children: Descendant[];
  type: 'p';
};
const buildParagraph = (
  { children, type }: TParagraph,
  overrides: any
): mdast.Paragraph => {
  return {
    children: convertNodes(children, overrides) as mdast.Paragraph['children'],
    type: 'paragraph',
  };
};

type THeading = {
  children: Descendant[];
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
};

const buildHeading = (
  { children, type }: THeading,
  overrides: any
): mdast.Heading => {
  const depth = (Number.parseInt(type.slice(1)) || 1) as 1 | 2 | 3 | 4 | 5 | 6;

  return {
    children: convertNodes(children, overrides) as mdast.Heading['children'],
    depth,
    type: 'heading',
  };
};

type TThematicBreak = {
  children: Descendant[];
  type: 'hr';
};

const buildThematicBreak = (node: TThematicBreak): mdast.ThematicBreak => {
  return { type: 'thematicBreak' };
};

type TBlockquote = {
  children: Descendant[];
  type: 'blockquote';
};

const buildBlockquote = (
  node: TBlockquote,
  overrides: any
): mdast.Blockquote => {
  return {
    children: convertNodes(
      node.children,
      overrides
    ) as mdast.Blockquote['children'],
    type: 'blockquote',
  };
};

type TTable = {
  children: Descendant[];
  type: 'table';
  colSizes?: number[];
  marginLeft?: number;
};

const buildTable = (node: TTable, overrides: any): mdast.Table => {
  return {
    children: convertNodes(node.children, overrides) as mdast.Table['children'],
    type: 'table',
  };
};

type TTableRow = {
  children: Descendant[];
  type: 'tr';
  size?: number;
};

const buildTableRow = (node: TTableRow, overrides: any): mdast.TableRow => {
  return {
    children: convertNodes(
      node.children,
      overrides
    ) as mdast.TableRow['children'],
    type: 'tableRow',
  };
};

interface BorderStyle {
  color?: string;
  size?: number;
  // https://docx.js.org/api/enums/BorderStyle.html
  style?: string;
}

type TTableCell = {
  children: Descendant[];
  type: 'td';
  id?: string;
  attributes?: {
    colspan?: string;
    rowspan?: string;
  };
  background?: string;
  borders?: {
    /** Only the last row cells have a bottom border. */
    bottom?: BorderStyle;
    left?: BorderStyle;
    /** Only the last column cells have a right border. */
    right?: BorderStyle;
    top?: BorderStyle;
  };
  colSpan?: number;
  rowSpan?: number;
  size?: number;
};

const buildTableCell = (node: TTableCell, overrides: any): mdast.TableCell => {
  return {
    children: convertNodes(
      node.children,
      overrides
    ) as mdast.TableCell['children'],
    type: 'tableCell',
  };
};

type TSlateImage = {
  children: Descendant[];
  type: 'img';
  url: string;
  id?: string;
  align?: 'center' | 'left' | 'right';
  caption?: Descendant[];
  isUpload?: boolean;
  name?: string;
  placeholderId?: string;
};

const buildImage = ({ caption, type, url }: TSlateImage): mdast.Paragraph => {
  const image: mdast.Image = {
    alt: caption ? NodeApi.string({ children: caption } as any) : undefined,
    title: caption ? NodeApi.string({ children: caption } as any) : undefined,
    type: 'image',
    url,
  };

  return { children: [image], type: 'paragraph' };
};

type TLink = {
  children: Descendant[];
  type: 'link';
  url: string;
  target?: string;
};

const buildLink = (node: TLink, overrides: any): mdast.Link => {
  return {
    children: convertNodes(node.children, overrides) as mdast.Link['children'],
    type: 'link',
    url: node.url,
  };
};

type TCodeBlock = {
  children: TCodeLine[];
  type: 'code_block';
  lang?: string;
};

type TCodeLine = {
  children: Descendant[];
  type: 'code_line';
};

const buildCodeBlock = ({ children, lang }: TCodeBlock): mdast.Code => {
  return {
    lang: lang,
    type: 'code',
    value: children
      .map((child) => child.children.map((c) => c.text).join(''))
      .join('\n'),
  };
};

type TEquation = {
  children: Descendant[];
  texExpression: string;
  type: 'equation';
};

const buildEquation = ({ texExpression }: TEquation): mdastUtilMath.Math => {
  return {
    type: 'math',
    value: texExpression,
  };
};

type TInlineEquation = {
  children: Descendant[];
  texExpression: string;
  type: 'inline_equation';
};

const buildInlineEquation = ({
  texExpression,
}: TInlineEquation): mdastUtilMath.InlineMath => {
  return {
    type: 'inlineMath',
    value: texExpression,
  };
};
