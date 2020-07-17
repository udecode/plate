import * as React from 'react';
import { RenderLeaf } from '@udecode/slate-plugins-core';
import { MARK_PRISM } from './defaults';

export const renderLeafCodeBlock = (): RenderLeaf => ({ leaf, children }) => {
  if (leaf[MARK_PRISM] && !!leaf.text) {
    return <span className={leaf?.className as string}>{children}</span>;
  }
  return children;
};
