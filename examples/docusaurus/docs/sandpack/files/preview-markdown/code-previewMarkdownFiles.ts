import { createPreviewPluginFile } from './code-createPreviewPlugin';
import { decoratePreviewFile } from './code-decoratePreview';
import { indexFile } from './code-index';
import { previewMdValueFile } from './code-previewMdValue';
import { renderLeafPreviewFile } from './code-renderLeafPreview';

export const previewMarkdownFiles = {
  ...createPreviewPluginFile,
  ...decoratePreviewFile,
  ...indexFile,
  ...previewMdValueFile,
  ...renderLeafPreviewFile,
};
