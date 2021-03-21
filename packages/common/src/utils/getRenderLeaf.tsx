import * as React from 'react';
import { RenderNodeOptions } from '@udecode/slate-plugins-core';
import { TRenderLeafProps } from '@udecode/slate-plugins-core/dist/types/TRenderLeafProps';
import { DefaultLeaf } from 'slate-react';
import { getSlateClass } from './getSlateClass';

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
}: TRenderLeafProps) => {
  const nodeProps =
    getNodeProps?.({ leaf, text, attributes, children }) ??
    leaf.attributes ??
    {};

  if (leaf[type] && !!leaf.text) {
    return (
      <Leaf className={getSlateClass(type)} leaf={leaf} nodeProps={nodeProps}>
        {children}
      </Leaf>
    );
  }

  return children;
};
