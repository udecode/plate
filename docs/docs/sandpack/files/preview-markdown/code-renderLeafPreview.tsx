export const renderLeafPreviewCode = `import React from 'react';
import { RenderLeaf } from '@udecode/plate';
import { PreviewLeaf } from './PreviewLeaf/PreviewLeaf';

export const renderLeafPreview: RenderLeaf = PreviewLeaf;
`;

export const renderLeafPreviewFile = {
  '/preview-markdown/renderLeafPreview.tsx': renderLeafPreviewCode,
};
