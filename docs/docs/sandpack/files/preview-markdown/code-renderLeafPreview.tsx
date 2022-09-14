export const renderLeafPreviewCode = `import { RenderLeaf } from '@udecode/plate';
import { PreviewLeaf } from './PreviewLeaf';

export const renderLeafPreview: RenderLeaf = PreviewLeaf;
`;

export const renderLeafPreviewFile = {
  '/preview-markdown/renderLeafPreview.tsx': renderLeafPreviewCode,
};
