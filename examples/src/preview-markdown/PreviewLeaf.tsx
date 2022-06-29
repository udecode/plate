import React from 'react';
import { RenderLeaf } from '@udecode/plate';
import { getPreviewLeafStyles } from './PreviewLeaf.styles';

export const PreviewLeaf: RenderLeaf = (props) => {
  const { children, attributes, leaf } = props;

  const { root } = getPreviewLeafStyles(leaf as any);

  return (
    <span {...attributes} css={root.css} className={root.className}>
      {children}
    </span>
  );
};
