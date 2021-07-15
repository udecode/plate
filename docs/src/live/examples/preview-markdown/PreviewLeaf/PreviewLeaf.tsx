import * as React from 'react';
import { StyledLeafProps } from '@udecode/slate-plugins';
import { getPreviewLeafStyles } from './PreviewLeaf.styles';

export const PreviewLeaf = (props: StyledLeafProps) => {
  const { children, attributes, leaf } = props;

  const { root } = getPreviewLeafStyles(leaf as any);

  return (
    <span {...attributes} css={root.css} className={root.className}>
      {children}
    </span>
  );
};
