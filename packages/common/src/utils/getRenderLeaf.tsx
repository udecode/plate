import * as React from 'react';
import { DefaultLeaf, RenderLeafProps } from 'slate-react';
import { LeafToProps } from '../types/NodeToProps';
import { RenderNodeOptions } from '../types/RenderNodeOptions';

export interface GetRenderLeafOptions extends RenderNodeOptions, LeafToProps {}

/**
 * Get a `renderLeaf` handler for a single type.
 */
export const getRenderLeaf = ({
  type,
  component: Leaf = DefaultLeaf,
  nodeToProps,
}: GetRenderLeafOptions) => ({ children, leaf, text }: RenderLeafProps) => {
  const htmlAttributes = nodeToProps?.({ leaf, text });

  if (leaf[type] && !!leaf.text) {
    return (
      <Leaf leaf={leaf} htmlAttributes={htmlAttributes}>
        {children}
      </Leaf>
    );
  }

  return children;
};
