import { indexFile } from './code-index';
import { resetBlockTypePluginFile } from './code-resetBlockTypePlugin';

export const resetNodeFiles = {
  ...indexFile,
  ...resetBlockTypePluginFile,
};
