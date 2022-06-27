import { indexFile } from './code-index';
import { trailingBlockPluginFile } from './code-trailingBlockPlugin';

export const trailingBlockFiles = {
  ...indexFile,
  ...trailingBlockPluginFile,
};
