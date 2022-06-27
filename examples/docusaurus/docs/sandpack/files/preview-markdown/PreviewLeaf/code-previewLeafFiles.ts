import { previewLeafStylesFile } from './code-PreviewLeaf.styles';
import { previewLeafFile } from './code-PreviewLeaf';
import { previewLeafTypesFile } from './code-PreviewLeaf.types';
import { indexFile } from './code-index';

export const previewLeafFiles = {
  ...previewLeafStylesFile,
  ...previewLeafFile,
  ...previewLeafTypesFile,
  ...indexFile,
};
