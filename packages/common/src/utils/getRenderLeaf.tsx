import * as React from 'react';
import { RenderNodeOptions } from '@udecode/slate-plugins-core';
import { DefaultLeaf, RenderLeafProps } from 'slate-react';

/**
 * Get a `renderLeaf` handler for a single type.
 */
export const getRenderLeaf = ({
  type,
  component: Leaf = DefaultLeaf,
  getNodeProps,
}: RenderNodeOptions) => ({
  children,
  leaf,
  text,
  attributes,
}: RenderLeafProps) => {
  const nodeProps = getNodeProps?.({ leaf, text, attributes, children });

  if (leaf[type] && !!leaf.text) {
    return (
      <Leaf leaf={leaf} nodeProps={nodeProps}>
        {children}
      </Leaf>
    );
  }

  return children;
};
