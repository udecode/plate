import { previewLeafStylesFile } from './code-PreviewLeaf.styles';
import { previewLeafFile } from './code-PreviewLeaf';
import { previewLeafTypesFile } from './code-PreviewLeaf.types';

export const previewLeafFiles = {
  ...previewLeafStylesFile,
  ...previewLeafFile,
  ...previewLeafTypesFile,
};
