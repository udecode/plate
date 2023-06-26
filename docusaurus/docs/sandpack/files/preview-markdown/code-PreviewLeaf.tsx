export const previewLeafCode = `import React from 'react';
import { RenderLeaf } from '@udecode/plate';
import { getPreviewLeafStyles } from './PreviewLeaf.styles';

export const PreviewLeaf: RenderLeaf = (props) => {
  const { children, attributes, leaf } = props;

  const { root } = getPreviewLeafStyles(leaf as any);

  return (
    <span {...attributes} style={root.css[0] as object} className={root.className}>
      {children}
    </span>
  );
};
`;

export const previewLeafFile = {
  '/preview-markdown/PreviewLeaf.tsx': previewLeafCode,
};
