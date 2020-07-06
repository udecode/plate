import * as React from 'react';
import { GetRenderElementOptions } from '@udecode/slate-plugins-core';
import { RenderLeafProps } from 'slate-react';

/**
 * Get generic renderLeaf for a type
 * TODO: data-slate-type
 */
export const getRenderLeaf = ({
  type,
  component: Component,
  ...options
}: GetRenderElementOptions) => ({ children, leaf }: RenderLeafProps) => {
  if (leaf[type] && !!leaf.text) {
    return <Component {...options}>{children}</Component>;
  }

  return children;
};
