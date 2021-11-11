import React from 'react';

export const MARK_PRISM = 'prism';

/**
 * TODO
 */
export const getCodeBlockRenderLeaf = () => () => ({ leaf, children }: any) => {
  if (leaf[MARK_PRISM] && !!leaf.text) {
    return <span className={leaf?.className as string}>{children}</span>;
  }
  return children;
};
