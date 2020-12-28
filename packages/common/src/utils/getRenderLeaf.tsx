import * as React from 'react';
import pickBy from 'lodash/pickBy';
import { RenderLeafProps } from 'slate-react';
import { RenderNodeOptions } from '../types/PluginOptions.types';

/**
 * Get a `renderLeaf` handler for a single type.
 */
export const getRenderLeaf = ({
  type,
  component: Component,
  rootProps,
}: Required<RenderNodeOptions>) => ({ children, leaf }: RenderLeafProps) => {
  if (leaf[type] && !!leaf.text) {
    return (
      <Component leaf={leaf} {...pickBy(rootProps)}>
        {children}
      </Component>
    );
  }

  return children;
};
