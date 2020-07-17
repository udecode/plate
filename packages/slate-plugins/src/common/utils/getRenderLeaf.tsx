import * as React from 'react';
import { pickBy } from 'lodash';
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
    return <Component {...pickBy(rootProps)}>{children}</Component>;
  }

  return children;
};
