import type { PhrasingContent } from 'mdast';

import type { MdMdxJsxFlowElement, MdRootContent } from '../mdast';

type MdFlowContent = MdMdxJsxFlowElement['children'][number];
type MdPhrasingContent =
  import('../mdast').MdMdxJsxTextElement['children'][number];

const PHRASING_TYPES = new Set([
  'break',
  'delete',
  'emphasis',
  'footnoteReference',
  'image',
  'imageReference',
  'inlineCode',
  'inlineMath',
  'link',
  'linkReference',
  'mdxJsxTextElement',
  'mdxTextExpression',
  'strong',
  'text',
]);

export const isMdFlowContent = (node: MdRootContent): node is MdFlowContent =>
  !PHRASING_TYPES.has(node.type);

export const isMdPhrasingContent = (
  node: MdRootContent
): node is MdPhrasingContent => PHRASING_TYPES.has(node.type);

/** Content one line of phrasing can hold: phrasing, plus raw HTML written inline. */
export const isMdLineContent = (node: MdRootContent): node is PhrasingContent =>
  node.type === 'html' || isMdPhrasingContent(node);
