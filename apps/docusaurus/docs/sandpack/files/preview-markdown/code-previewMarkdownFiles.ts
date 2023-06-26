import { previewLeafStylesFile } from './code-PreviewLeaf.styles';
import { previewLeafFile } from './code-PreviewLeaf';
import { previewLeafTypesFile } from './code-PreviewLeaf.types';
import { createPreviewPluginFile } from './code-createPreviewPlugin';
import { decoratePreviewFile } from './code-decoratePreview';
import { previewMdValueFile } from './code-previewMdValue';
import { renderLeafPreviewFile } from './code-renderLeafPreview';

export const previewMarkdownFiles = {
  ...previewLeafStylesFile,
  ...previewLeafFile,
  ...previewLeafTypesFile,
  ...createPreviewPluginFile,
  ...decoratePreviewFile,
  ...previewMdValueFile,
  ...renderLeafPreviewFile,
};
