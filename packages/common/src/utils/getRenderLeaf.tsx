import * as React from 'react';
import pickBy from 'lodash/pickBy';
import { DefaultLeaf, RenderLeafProps } from 'slate-react';
import { RenderNodeOptions } from '../types/PluginOptions.types';

/**
 * Get a `renderLeaf` handler for a single type.
 */
export const getRenderLeaf = ({
  type,
  component: Leaf = DefaultLeaf,
  rootProps,
}: Required<RenderNodeOptions>) => ({ children, leaf }: RenderLeafProps) => {
  if (leaf[type] && !!leaf.text) {
    return (
      <Leaf leaf={leaf} {...pickBy(rootProps)}>
        {children}
      </Leaf>
    );
  }

  return children;
};
