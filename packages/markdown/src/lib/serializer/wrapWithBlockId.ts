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

/**
 * Wraps an mdast node with a block element containing an ID attribute. Used for
 * preserving block IDs when serializing to markdown.
 *
 * @param mdastNode - The mdast node to wrap
 * @param nodeId - The ID to attach to the block element
 * @returns The wrapped mdast node with block element and ID attribute
 */
export const wrapWithBlockId = (
  mdastNode: MdRootContent,
  nodeId: string
): MdMdxJsxFlowElement => {
  if (!isMdFlowContent(mdastNode)) {
    throw new Error('Block IDs can only wrap Markdown flow content.');
  }

  return {
    attributes: [
      {
        name: 'id',
        type: 'mdxJsxAttribute',
        value: String(nodeId),
      },
    ],
    children: [mdastNode],
    data: {
      _mdxExplicitJsx: true,
    },
    name: 'block',
    type: 'mdxJsxFlowElement',
  };
};
