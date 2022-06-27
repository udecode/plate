import { indexFile } from './code-index';
import { selectOnBackspacePluginFile } from './code-selectOnBackspacePlugin';

export const selectOnBackspaceFiles = {
  ...indexFile,
  ...selectOnBackspacePluginFile,
};
