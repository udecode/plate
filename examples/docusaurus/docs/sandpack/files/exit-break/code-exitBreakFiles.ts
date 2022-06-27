import { exitBreakPluginFile } from './code-exitBreakPlugin';
import { exitBreakValueFile } from './code-exitBreakValue';
import { indexFile } from './code-index';

export const exitBreakFiles = {
  ...exitBreakPluginFile,
  ...exitBreakValueFile,
  ...indexFile,
};
