import type { unistLib } from '../types';

/**
 * Wraps an mdast node with a block element containing an ID attribute. Used for
 * preserving block IDs when serializing to markdown.
 *
 * @param mdastNode - The mdast node to wrap
 * @param nodeId - The ID to attach to the block element
 * @returns The wrapped mdast node with block element and ID attribute
 */
export const wrapWithBlockId = (
  mdastNode: unistLib.Node,
  nodeId: string
): unistLib.Node => {
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
  } as any;
};
