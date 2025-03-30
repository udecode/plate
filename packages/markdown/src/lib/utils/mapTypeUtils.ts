/* eslint-disable perfectionist/sort-objects */
/* eslint-disable perfectionist/sort-union-types */
import type { MdRootContent } from '../mdast';

import 'mdast-util-mdx';

export type plateTypes =
  // common elements
  | 'p'
  | 'heading'
  | 'blockquote'
  | 'code_block'
  | 'hr'
  | 'equation'
  | 'inline_equation'
  | 'img'
  | 'list'
  | 'li'
  | 'table'
  | 'tr'
  | 'th'
  | 'td'
  | 'a'
  // common marks
  | 'bold'
  | 'italic'
  | 'code'
  | 'text'
  | 'strikethrough'
  // plate only elements
  | 'code_line'
  | 'column'
  | 'column_group'
  | 'toc'
  | 'callout'
  | 'toggle'
  | 'mention'
  | 'date'
  | 'suggestion'
  // plate only marks
  | 'underline'
  | 'comment'
  | 'superscript'
  | 'subscript';

const plateToMdastTypeMap: Record<plateTypes, MdastTypes | (string & {})> = {
  // common elements
  p: 'paragraph',
  heading: 'heading',
  blockquote: 'blockquote',
  code_block: 'code',
  hr: 'thematicBreak',
  equation: 'math',
  inline_equation: 'inlineMath',
  img: 'image',
  list: 'list',
  li: 'listItem',
  table: 'table',
  tr: 'tableRow',
  th: 'tableCell',
  td: 'tableCell',
  a: 'link',
  // common marks
  bold: 'strong',
  italic: 'emphasis',
  code: 'inlineCode',
  text: 'text',
  strikethrough: 'delete',
  // plate only elements
  code_line: 'code_line',
  column: 'column',
  column_group: 'column_group',
  toc: 'toc',
  callout: 'callout',
  toggle: 'toggle',
  mention: 'mention',
  date: 'date',
  // plate only marks
  underline: 'underline',
  suggestion: 'suggestion',
  comment: 'comment',
  superscript: 'superscript',
  subscript: 'subscript',
};

/**
 * Get mdast node type from plate element type if the plateType is plate only
 * return the plateType itself.
 */
export const getMdAstNodeType = (plateType: plateTypes) => {
  return plateToMdastTypeMap[plateType];
};

export type MdastTypes = MdRootContent['type'];

const mdastToPlateTypeMap: Record<
  MdRootContent['type'],
  plateTypes | (string & {})
> = {
  // common elements
  paragraph: 'p',
  heading: 'heading',
  thematicBreak: 'hr',
  blockquote: 'blockquote',
  list: 'list',
  listItem: 'li',
  table: 'table',
  tableRow: 'tr',
  tableCell: 'td',
  code: 'code_block',
  link: 'a',
  image: 'img',
  math: 'equation',
  inlineMath: 'inline_equation',
  // markdown only
  html: 'html',
  yaml: 'yaml',
  linkReference: 'linkReference',
  imageReference: 'imageReference',
  footnoteReference: 'footnoteReference',
  definition: 'definition',
  footnoteDefinition: 'footnoteDefinition',
  break: 'break',
  // decoration
  emphasis: 'italic',
  strong: 'bold',
  delete: 'strikethrough',
  inlineCode: 'code',
  text: 'text',
  // mdx
  mdxFlowExpression: 'mdxFlowExpression',
  mdxTextExpression: 'mdxTextExpression',
  mdxJsxFlowElement: 'mdxJsxFlowElement',
  mdxJsxTextElement: 'mdxJsxTextElement',
  mdxjsEsm: 'mdxjsEsm',
};

/**
 * Get plate node type from mdast node type if the mdast is mdast only return
 * the mdast type itself.
 */
export const getPlateNodeType = (mdastType: MdastTypes) => {
  return mdastToPlateTypeMap[mdastType];
};
